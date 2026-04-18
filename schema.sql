-- ============================================================
-- [APP_NAME] — SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- IMPORTANT: Run in order — do not reorder sections
-- NOTE: Fields marked -- [ENCRYPTED] are stored as ciphertext.
--       Encryption/decryption happens at the application layer
--       (client-side via Web Crypto API or server-side via FastAPI).
--       The DB only ever sees encrypted strings for these fields.
-- ============================================================


-- ============================================================
-- SECTION 0: EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- SECTION 1: ENUMS
-- ============================================================

CREATE TYPE asset_type_enum AS ENUM (
  'bank_account',
  'fixed_deposit',
  'property',
  'insurance',
  'mutual_fund',
  'stocks_demat',
  'crypto_wallet',
  'vehicle',
  'ppf_epf',
  'gold_jewellery',
  'business_ownership',
  'other'
);

CREATE TYPE asset_status_enum AS ENUM (
  'active',
  'inactive',
  'sold',
  'transferred'
);

CREATE TYPE beneficiary_role_enum AS ENUM (
  'primary',
  'backup'
);

CREATE TYPE disclosure_level_enum AS ENUM (
  'total_secrecy',      -- beneficiary doesn't know they are named
  'partial_awareness',  -- knows they are named, not what they receive
  'full_transparency'   -- knows everything upfront
);

CREATE TYPE beneficiary_status_enum AS ENUM (
  'registered',           -- added to vault, not yet contacted
  'contacted',            -- Paradosis has reached out (post-suspected death)
  'pending_verification', -- submitted death cert, under review
  'unlocked',             -- death confirmed, full access granted
  'declined',             -- beneficiary declined inheritance
  'unreachable'           -- all contact attempts failed
);

CREATE TYPE relationship_enum AS ENUM (
  'spouse',
  'son',
  'daughter',
  'father',
  'mother',
  'brother',
  'sister',
  'grandfather',
  'grandmother',
  'grandson',
  'granddaughter',
  'uncle',
  'aunt',
  'nephew',
  'niece',
  'friend',
  'business_partner',
  'legal_advisor',
  'other'
);

CREATE TYPE vault_role_enum AS ENUM (
  'owner',
  'beneficiary',
  'guardian',
  'emergency_contact'
);

CREATE TYPE escalation_level_enum AS ENUM (
  'level_0_normal',
  'level_1_concern',
  'level_2_alert',
  'level_3_suspected_death',
  'level_4_death_claimed',
  'level_5_executed'
);

CREATE TYPE check_in_status_enum AS ENUM (
  'sent',
  'responded',
  'expired',
  'skipped_vacation'
);

CREATE TYPE check_in_channel_enum AS ENUM (
  'email',
  'sms',
  'whatsapp',
  'login_detected'
);

CREATE TYPE intent_type_enum AS ENUM (
  'video',
  'written',
  'structured_form'
);

CREATE TYPE intent_status_enum AS ENUM (
  'draft',
  'processing',
  'processed',
  'accepted',
  'superseded'
);

CREATE TYPE document_type_enum AS ENUM (
  'will_document',
  'bank_claim_form',
  'succession_certificate_petition',
  'legal_heir_certificate_application',
  'property_mutation_application',
  'insurance_claim_form',
  'crypto_transfer_instruction'
);

CREATE TYPE verification_status_enum AS ENUM (
  'pending',
  'verified',
  'rejected',
  'expired'
);

CREATE TYPE vault_execution_status_enum AS ENUM (
  'pending',
  'liveness_window_open',
  'executing',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE notification_channel_enum AS ENUM (
  'email',
  'sms',
  'whatsapp',
  'in_app'
);

CREATE TYPE notification_status_enum AS ENUM (
  'pending',
  'sent',
  'failed',
  'read'
);

CREATE TYPE mfa_method_enum AS ENUM (
  'email_otp',
  'sms_otp',
  'totp'
);

CREATE TYPE guardian_status_enum AS ENUM (
  'invited',
  'active',
  'declined',
  'removed'
);


-- ============================================================
-- SECTION 2: UTILITY FUNCTIONS
-- ============================================================

-- Auto-updates updated_at on any table that has it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- SECTION 3: CORE USER TABLES
-- ============================================================

-- ----------------------------------------------------------
-- 3.1 PROFILES
-- Extends Supabase auth.users with personal details.
-- Created automatically when a user signs up (via trigger below).
-- ----------------------------------------------------------
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Display info (not encrypted — used for UI display)
  full_name           TEXT NOT NULL,
  avatar_url          TEXT,
  onboarding_step     INT DEFAULT 0,          -- tracks how far through setup
  onboarding_done     BOOLEAN DEFAULT FALSE,

  -- Personal identity (all [ENCRYPTED] at app layer)
  date_of_birth       TEXT,                   -- [ENCRYPTED]
  phone_number        TEXT,                   -- [ENCRYPTED]
  aadhaar_number      TEXT,                   -- [ENCRYPTED]
  pan_number          TEXT,                   -- [ENCRYPTED]
  address_line1       TEXT,                   -- [ENCRYPTED]
  address_line2       TEXT,                   -- [ENCRYPTED]
  city                TEXT,
  state               TEXT,
  pincode             TEXT,
  country             TEXT DEFAULT 'India',

  -- Family identity (used to pre-fill legal forms)
  father_name         TEXT,                   -- [ENCRYPTED]
  mother_name         TEXT,                   -- [ENCRYPTED]
  spouse_name         TEXT,                   -- [ENCRYPTED]

  -- Legal context
  religion            TEXT,                   -- determines which succession law applies
  -- (Hindu Succession Act / Indian Succession Act / Muslim Personal Law)

  -- Vault health
  vault_health_score  INT DEFAULT 0 CHECK (vault_health_score BETWEEN 0 AND 100),
  last_health_calc_at TIMESTAMPTZ,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ----------------------------------------------------------
-- 3.2 USER ROLES
-- Tracks what role each user plays in the system.
-- A user can have multiple roles (e.g. owner AND beneficiary).
-- linked_owner_id: for beneficiaries/guardians, points to the vault owner.
-- ----------------------------------------------------------
CREATE TABLE user_roles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role             vault_role_enum NOT NULL,
  linked_owner_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- null if role = 'owner', set if role = beneficiary/guardian/emergency_contact
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, role, linked_owner_id)
);


-- ----------------------------------------------------------
-- 3.3 TWO-FACTOR AUTH SETTINGS
-- Tracks which 2FA methods the user has enabled.
-- totp_secret is [ENCRYPTED] before storage.
-- ----------------------------------------------------------
CREATE TABLE two_factor_settings (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  email_otp_enabled    BOOLEAN DEFAULT FALSE,
  sms_otp_enabled      BOOLEAN DEFAULT FALSE,
  totp_enabled         BOOLEAN DEFAULT FALSE,

  totp_secret          TEXT,                   -- [ENCRYPTED] TOTP shared secret
  backup_codes         TEXT[],                 -- [ENCRYPTED] array of one-time backup codes
  -- each code is hashed before storage (bcrypt)

  preferred_method     mfa_method_enum,

  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER two_factor_settings_updated_at
  BEFORE UPDATE ON two_factor_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ----------------------------------------------------------
-- 3.4 LOGIN SESSIONS
-- Every login creates a session record.
-- Used for: login baseline calculation, security page display,
-- session revocation, and escalation trigger detection.
-- ----------------------------------------------------------
CREATE TABLE login_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  ip_address      TEXT,
  user_agent      TEXT,
  device_type     TEXT,                        -- 'mobile', 'desktop', 'tablet'
  location_city   TEXT,
  location_country TEXT DEFAULT 'India',

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ DEFAULT NOW(),
  is_active       BOOLEAN DEFAULT TRUE,
  revoked_at      TIMESTAMPTZ                  -- set when user manually revokes
);

CREATE INDEX idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX idx_login_sessions_created_at ON login_sessions(created_at);


-- ============================================================
-- SECTION 4: VAULT — ASSETS
-- ============================================================

-- ----------------------------------------------------------
-- 4.1 ASSETS
-- Each row = one financial/physical asset the vault owner has declared.
-- Sensitive fields are [ENCRYPTED] at the application layer.
-- Non-sensitive fields (type, nickname, status) are plaintext for querying.
-- asset-type-specific fields live in the metadata JSONB column — [ENCRYPTED].
-- ----------------------------------------------------------
CREATE TABLE assets (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Display (not encrypted)
  nickname              TEXT NOT NULL,         -- user-given name e.g. "My SBI Salary Account"
  asset_type            asset_type_enum NOT NULL,
  status                asset_status_enum DEFAULT 'active',
  nominee_registered    BOOLEAN,              -- is a nominee already registered with institution?

  -- Common encrypted fields (shared across most asset types)
  institution_name      TEXT,                 -- [ENCRYPTED] bank/insurer/broker name
  account_identifier    TEXT,                 -- [ENCRYPTED] account no / policy no / survey no / wallet addr
  branch_or_location    TEXT,                 -- [ENCRYPTED] branch name / property address
  ifsc_or_routing       TEXT,                 -- [ENCRYPTED] IFSC / routing number

  -- Valuation (plaintext — no PII, used for health score / reporting)
  estimated_value_inr   NUMERIC(15, 2),
  value_last_updated_at TIMESTAMPTZ,

  -- Asset-type-specific data (all fields [ENCRYPTED] inside JSON string)
  -- Stored as TEXT not JSONB because it is encrypted ciphertext
  metadata_encrypted    TEXT,

  -- Personal message / instructions for this specific asset
  notes                 TEXT,                 -- [ENCRYPTED]

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_owner_id ON assets(owner_id);
CREATE INDEX idx_assets_asset_type ON assets(asset_type);
CREATE INDEX idx_assets_status ON assets(status);

CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- METADATA FIELD GUIDE (encrypted JSON per asset_type):
-- bank_account:      { account_type, branch_address, nominee_name }
-- fixed_deposit:     { fd_number, maturity_date, interest_rate }
-- property:          { survey_number, registration_number, area_sqft, mortgage_status, registrar_office }
-- insurance:         { policy_number, policy_type, sum_assured, maturity_date, premium_amount }
-- mutual_fund:       { folio_number, amc_name, scheme_name }
-- stocks_demat:      { demat_account_number, depository, broker_name, dp_id }
-- crypto_wallet:     { wallet_address, chain, wallet_type, has_hardware_wallet }
-- vehicle:           { rc_number, make_model, registration_year }
-- ppf_epf:           { account_number, office_name, uan_number }
-- gold_jewellery:    { description, weight_grams, storage_location }
-- business_ownership:{ company_name, cin_number, ownership_percentage, type }


-- ============================================================
-- SECTION 5: VAULT — BENEFICIARIES
-- ============================================================

-- ----------------------------------------------------------
-- 5.1 BENEFICIARIES
-- People named by the vault owner to receive assets.
-- All PII fields are [ENCRYPTED] at the application layer.
-- A beneficiary may or may not have an Paradosis account (user_id can be null).
-- ----------------------------------------------------------
CREATE TABLE beneficiaries (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- ^ set if the beneficiary has created an Paradosis account

  -- Identity (all [ENCRYPTED])
  full_name               TEXT NOT NULL,       -- [ENCRYPTED]
  relationship            relationship_enum NOT NULL,
  email                   TEXT,                -- [ENCRYPTED] — used for contact
  phone_number            TEXT,                -- [ENCRYPTED]
  aadhaar_number          TEXT,                -- [ENCRYPTED]
  pan_number              TEXT,                -- [ENCRYPTED]
  address                 TEXT,                -- [ENCRYPTED]

  -- For crypto / direct bank routing after execution
  bank_account_number     TEXT,                -- [ENCRYPTED]
  bank_ifsc               TEXT,                -- [ENCRYPTED]
  crypto_wallet_address   TEXT,                -- [ENCRYPTED]

  -- Privacy settings
  disclosure_level        disclosure_level_enum DEFAULT 'total_secrecy',

  -- Minor handling
  is_minor                BOOLEAN DEFAULT FALSE,
  trustee_beneficiary_id  UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  -- ^ if minor, points to the adult trustee beneficiary

  -- Access state
  status                  beneficiary_status_enum DEFAULT 'registered',

  -- Personal note from vault owner (shown in execution package)
  personal_message        TEXT,                -- [ENCRYPTED]

  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_beneficiaries_owner_id ON beneficiaries(owner_id);
CREATE INDEX idx_beneficiaries_user_id ON beneficiaries(user_id);

CREATE TRIGGER beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ----------------------------------------------------------
-- 5.2 ASSET BENEFICIARY MAPPINGS
-- Maps which beneficiary gets which asset, at what percentage.
-- Both primary and backup assignments live here.
-- An asset can have multiple rows — e.g., 60% primary to wife,
-- 40% primary to son, backup to daughter for both.
-- ----------------------------------------------------------
CREATE TABLE asset_beneficiary_mappings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id              UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  beneficiary_id        UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,

  role                  beneficiary_role_enum NOT NULL,  -- 'primary' or 'backup'
  percentage            NUMERIC(5, 2) NOT NULL            -- e.g. 60.00 for 60%
                          CHECK (percentage > 0 AND percentage <= 100),
  priority_order        INT DEFAULT 1,
  -- for backups: 1 = first backup, 2 = second backup

  special_instructions  TEXT,                 -- [ENCRYPTED] asset-specific note

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (asset_id, beneficiary_id, role, priority_order)
);

CREATE INDEX idx_abm_owner_id ON asset_beneficiary_mappings(owner_id);
CREATE INDEX idx_abm_asset_id ON asset_beneficiary_mappings(asset_id);
CREATE INDEX idx_abm_beneficiary_id ON asset_beneficiary_mappings(beneficiary_id);

CREATE TRIGGER asset_beneficiary_mappings_updated_at
  BEFORE UPDATE ON asset_beneficiary_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ----------------------------------------------------------
-- 5.3 RESIDUAL BENEFICIARY
-- Catches all assets not explicitly assigned.
-- One per vault owner. Mandatory.
-- ----------------------------------------------------------
CREATE TABLE residual_beneficiary (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beneficiary_id   UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE RESTRICT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER residual_beneficiary_updated_at
  BEFORE UPDATE ON residual_beneficiary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- SECTION 6: VAULT — GUARDIANS & EMERGENCY CONTACTS
-- ============================================================

-- ----------------------------------------------------------
-- 6.1 GUARDIANS (optional, legacy support)
-- People the vault owner trusts to manually confirm suspected death.
-- Note: primary death detection is Paradosis's escalation system,
-- but guardians can also initiate a report.
-- ----------------------------------------------------------
CREATE TABLE guardians (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- ^ set if guardian has an Paradosis account

  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,             -- [ENCRYPTED]
  phone_number     TEXT,                      -- [ENCRYPTED]
  status           guardian_status_enum DEFAULT 'invited',
  invited_at       TIMESTAMPTZ DEFAULT NOW(),
  accepted_at      TIMESTAMPTZ,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER guardians_updated_at
  BEFORE UPDATE ON guardians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ----------------------------------------------------------
-- 6.2 EMERGENCY CONTACTS
-- Contacted BEFORE beneficiaries during escalation Level 3.
-- Not a beneficiary — purely a "is this person okay?" check.
-- ----------------------------------------------------------
CREATE TABLE emergency_contacts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- one emergency contact per vault owner

  full_name        TEXT NOT NULL,
  relationship     TEXT,
  phone_number     TEXT NOT NULL,             -- [ENCRYPTED]
  email            TEXT,                      -- [ENCRYPTED]

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- SECTION 7: INTENT DECLARATION (VIDEO WILL / WRITTEN INTENT)
-- ============================================================

-- ----------------------------------------------------------
-- 7.1 INTENT DECLARATIONS
-- Each time a user records a video or writes their intent.
-- Only one can be 'accepted' at a time — others are 'superseded'.
-- video_storage_path points to Supabase Storage private bucket.
-- ----------------------------------------------------------
CREATE TABLE intent_declarations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type                  intent_type_enum NOT NULL,
  status                intent_status_enum DEFAULT 'draft',

  -- Storage references (Supabase Storage — private bucket)
  video_storage_path    TEXT,                 -- path in 'vault-videos' bucket
  video_duration_secs   INT,

  -- AI processing output
  raw_transcript        TEXT,                 -- [ENCRYPTED] Gemini transcript
  raw_ai_json           TEXT,                 -- [ENCRYPTED] raw Gemini JSON response
  processing_error      TEXT,                 -- error message if Gemini failed

  -- Written intent (for non-video declarations)
  written_text          TEXT,                 -- [ENCRYPTED]

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intent_owner_id ON intent_declarations(owner_id);

CREATE TRIGGER intent_declarations_updated_at
  BEFORE UPDATE ON intent_declarations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ----------------------------------------------------------
-- 7.2 INTENT MAPPINGS (AI EXTRACTED)
-- Each row = one extracted asset → beneficiary assignment from AI.
-- Some may have conflicts (e.g., AI extracted a name that doesn't
-- match any registered beneficiary).
-- ----------------------------------------------------------
CREATE TABLE intent_mappings (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent_id                   UUID NOT NULL REFERENCES intent_declarations(id) ON DELETE CASCADE,
  owner_id                    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- AI extracted values (raw text)
  extracted_asset_description TEXT,           -- e.g. "my HDFC account"
  extracted_beneficiary_name  TEXT,           -- e.g. "my wife Kavitha"
  extracted_percentage        NUMERIC(5, 2),
  extracted_instruction       TEXT,

  -- Matched to vault records (may be null if AI couldn't match)
  matched_asset_id            UUID REFERENCES assets(id) ON DELETE SET NULL,
  matched_beneficiary_id      UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,

  -- Conflict flags
  is_asset_conflict           BOOLEAN DEFAULT FALSE,     -- couldn't match asset
  is_beneficiary_conflict     BOOLEAN DEFAULT FALSE,     -- couldn't match beneficiary
  conflict_notes              TEXT,

  -- User resolution
  is_accepted                 BOOLEAN DEFAULT FALSE,
  is_ignored                  BOOLEAN DEFAULT FALSE,
  resolved_at                 TIMESTAMPTZ,

  created_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intent_mappings_intent_id ON intent_mappings(intent_id);
CREATE INDEX idx_intent_mappings_owner_id ON intent_mappings(owner_id);


-- ----------------------------------------------------------
-- 7.3 PERSONAL MESSAGES
-- Private video messages for specific beneficiaries. Not parsed by AI.
-- ----------------------------------------------------------
CREATE TABLE personal_messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beneficiary_id   UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  -- null if message is for someone not in the vault

  recipient_name   TEXT NOT NULL,        -- [ENCRYPTED]
  recipient_email  TEXT,                 -- [ENCRYPTED] for delivery
  video_storage_path TEXT NOT NULL,      -- Supabase Storage path
  video_duration_secs INT,
  thumbnail_path   TEXT,                 -- optional preview thumbnail

  is_delivered     BOOLEAN DEFAULT FALSE,
  delivered_at     TIMESTAMPTZ,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER personal_messages_updated_at
  BEFORE UPDATE ON personal_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- SECTION 8: LEGAL DOCUMENTS
-- ============================================================

-- ----------------------------------------------------------
-- 8.1 WILL DOCUMENTS
-- Generated from vault data. Versioned — each update creates a new version.
-- The user must print, sign, and witness the current version.
-- ----------------------------------------------------------
CREATE TABLE will_documents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  version             INT NOT NULL DEFAULT 1,
  is_current          BOOLEAN DEFAULT TRUE,   -- only one current version per owner

  -- Supabase Storage path (private bucket: 'generated-documents')
  storage_path        TEXT,

  -- Signing status (self-reported by user)
  is_printed          BOOLEAN DEFAULT FALSE,
  is_signed           BOOLEAN DEFAULT FALSE,
  is_witnessed        BOOLEAN DEFAULT FALSE,
  witness_1_name      TEXT,
  witness_2_name      TEXT,
  signed_at           TIMESTAMPTZ,

  -- Snapshot of vault state at generation time (for audit)
  asset_count         INT,
  beneficiary_count   INT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_will_documents_owner_id ON will_documents(owner_id);

CREATE TRIGGER will_documents_updated_at
  BEFORE UPDATE ON will_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ----------------------------------------------------------
-- 8.2 GENERATED DOCUMENTS
-- Every PDF generated by the system — for pre-review or post-execution.
-- ----------------------------------------------------------
CREATE TABLE generated_documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id          UUID REFERENCES assets(id) ON DELETE SET NULL,
  beneficiary_id    UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  execution_id      UUID,                     -- references vault_executions (FK added later)

  document_type     document_type_enum NOT NULL,
  storage_path      TEXT NOT NULL,            -- Supabase Storage path
  file_name         TEXT,
  is_current        BOOLEAN DEFAULT TRUE,

  -- Pre-fill data snapshot at generation time (for audit trail)
  field_data_hash   TEXT,                     -- SHA-256 of plaintext field data

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generated_docs_owner_id ON generated_documents(owner_id);
CREATE INDEX idx_generated_docs_execution_id ON generated_documents(execution_id);


-- ============================================================
-- SECTION 9: ESCALATION SYSTEM
-- ============================================================

-- ----------------------------------------------------------
-- 9.1 ESCALATION SETTINGS
-- One row per vault owner. Stores their personal preferences
-- for the escalation system and current state.
-- ----------------------------------------------------------
CREATE TABLE escalation_settings (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                        UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Check-in configuration
  check_in_frequency_days         INT DEFAULT 90      -- quarterly default
                                    CHECK (check_in_frequency_days BETWEEN 30 AND 365),

  -- Inactivity detection
  inactivity_threshold_days       INT DEFAULT 90,
  -- personalised baseline calculated from login_sessions, stored here
  login_baseline_avg_gap_days     NUMERIC(6,2),      -- rolling avg days between logins
  login_baseline_calculated_at    TIMESTAMPTZ,

  -- Current escalation state
  current_escalation_level        escalation_level_enum DEFAULT 'level_0_normal',
  escalation_started_at           TIMESTAMPTZ,       -- when level first moved > 0

  -- Vacation mode
  vacation_mode_active            BOOLEAN DEFAULT FALSE,
  vacation_mode_start             TIMESTAMPTZ,
  vacation_mode_end               TIMESTAMPTZ,
  -- vacation_mode_end max = vacation_mode_start + 180 days (enforced at app layer)

  -- Last successful contact
  last_check_in_responded_at      TIMESTAMPTZ,
  last_login_detected_at          TIMESTAMPTZ,

  created_at                      TIMESTAMPTZ DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER escalation_settings_updated_at
  BEFORE UPDATE ON escalation_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create escalation settings on profile creation
CREATE OR REPLACE FUNCTION handle_new_profile_escalation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO escalation_settings (owner_id)
  VALUES (NEW.id)
  ON CONFLICT (owner_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_escalation
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile_escalation();


-- ----------------------------------------------------------
-- 9.2 CHECK-IN EVENTS
-- Every check-in sent and its response status.
-- ----------------------------------------------------------
CREATE TABLE check_in_events (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  escalation_level_at_time  escalation_level_enum,
  channel                   check_in_channel_enum NOT NULL,
  status                    check_in_status_enum DEFAULT 'sent',

  sent_at                   TIMESTAMPTZ DEFAULT NOW(),
  responded_at              TIMESTAMPTZ,

  -- One-time token embedded in the check-in email/SMS link
  response_token            TEXT UNIQUE,
  response_token_expires_at TIMESTAMPTZ
);

CREATE INDEX idx_check_in_owner_id ON check_in_events(owner_id);
CREATE INDEX idx_check_in_status ON check_in_events(status);


-- ----------------------------------------------------------
-- 9.3 ESCALATION LOG
-- Immutable audit trail of every escalation level change.
-- ----------------------------------------------------------
CREATE TABLE escalation_log (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  from_level        escalation_level_enum,
  to_level          escalation_level_enum NOT NULL,
  reason            TEXT NOT NULL,            -- human-readable explanation
  triggered_by      TEXT DEFAULT 'system',   -- 'system' | 'human_team' | 'guardian' | 'beneficiary'

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escalation_log_owner_id ON escalation_log(owner_id);


-- ============================================================
-- SECTION 10: DEATH VERIFICATION & VAULT EXECUTION
-- ============================================================

-- ----------------------------------------------------------
-- 10.1 DEATH VERIFICATION SUBMISSIONS
-- When a beneficiary submits a death certificate.
-- Only proceeds after QR code check passes.
-- ----------------------------------------------------------
CREATE TABLE death_verification_submissions (
  id                            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_by_beneficiary_id   UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  submitted_by_user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Uploaded certificate (Supabase Storage — private bucket: 'death-certificates')
  certificate_storage_path      TEXT NOT NULL,

  -- Data extracted from certificate (by app layer)
  cert_registration_number      TEXT,
  cert_name_on_document         TEXT,
  cert_date_of_death            DATE,
  cert_place_of_death           TEXT,
  cert_issuing_authority        TEXT,
  cert_qr_verification_url      TEXT,         -- URL encoded in QR code
  cert_qr_verified              BOOLEAN DEFAULT FALSE,
  cert_name_match               BOOLEAN DEFAULT FALSE,

  -- Verification outcome
  verification_status           verification_status_enum DEFAULT 'pending',
  verified_at                   TIMESTAMPTZ,
  verified_by                   TEXT,         -- 'system_auto' | 'human_team'
  rejection_reason              TEXT,

  -- Liveness window (15 days for owner to respond "I'm alive")
  liveness_window_start         TIMESTAMPTZ,
  liveness_window_end           TIMESTAMPTZ,  -- start + 15 days
  liveness_challenge_responded  BOOLEAN DEFAULT FALSE,
  liveness_responded_at         TIMESTAMPTZ,
  liveness_token                TEXT UNIQUE,  -- embedded in "I'm alive" email link

  created_at                    TIMESTAMPTZ DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dvs_owner_id ON death_verification_submissions(owner_id);

CREATE TRIGGER death_verification_submissions_updated_at
  BEFORE UPDATE ON death_verification_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ----------------------------------------------------------
-- 10.2 VAULT EXECUTIONS
-- Created once per vault when execution is triggered.
-- Tracks the overall state of the full execution process.
-- ----------------------------------------------------------
CREATE TABLE vault_executions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  death_verification_id     UUID NOT NULL REFERENCES death_verification_submissions(id),

  status                    vault_execution_status_enum DEFAULT 'pending',

  -- Crypto execution (simulated in demo)
  crypto_execution_attempted BOOLEAN DEFAULT FALSE,
  crypto_execution_status   TEXT,             -- 'pending' | 'success' | 'failed' | 'simulated'
  crypto_tx_reference       TEXT,             -- simulated tx hash

  -- Document generation
  documents_generated       BOOLEAN DEFAULT FALSE,
  documents_generated_at    TIMESTAMPTZ,

  -- Packages delivered
  packages_delivered        BOOLEAN DEFAULT FALSE,
  packages_delivered_at     TIMESTAMPTZ,

  executed_at               TIMESTAMPTZ,
  failure_reason            TEXT,

  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vault_executions_owner_id ON vault_executions(owner_id);

CREATE TRIGGER vault_executions_updated_at
  BEFORE UPDATE ON vault_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Now add the FK from generated_documents to vault_executions
ALTER TABLE generated_documents
  ADD CONSTRAINT fk_generated_docs_execution
  FOREIGN KEY (execution_id) REFERENCES vault_executions(id) ON DELETE SET NULL;


-- ----------------------------------------------------------
-- 10.3 BENEFICIARY PACKAGES
-- One row per beneficiary per execution.
-- The package_access_token is a signed, time-limited token
-- that unlocks the beneficiary portal for that person.
-- ----------------------------------------------------------
CREATE TABLE beneficiary_packages (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id          UUID NOT NULL REFERENCES vault_executions(id) ON DELETE CASCADE,
  owner_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beneficiary_id        UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,

  -- Contents summary (not encrypted — needed for UI rendering)
  asset_ids             UUID[],               -- assets assigned to this beneficiary
  total_assets          INT DEFAULT 0,
  total_forms_generated INT DEFAULT 0,

  -- Access control
  package_access_token  TEXT UNIQUE,          -- secure random token for package URL
  token_expires_at      TIMESTAMPTZ,          -- tokens expire after 30 days

  -- Delivery state
  email_sent            BOOLEAN DEFAULT FALSE,
  email_sent_at         TIMESTAMPTZ,
  sms_sent              BOOLEAN DEFAULT FALSE,
  first_accessed_at     TIMESTAMPTZ,
  access_count          INT DEFAULT 0,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_beneficiary_packages_execution_id ON beneficiary_packages(execution_id);
CREATE INDEX idx_beneficiary_packages_beneficiary_id ON beneficiary_packages(beneficiary_id);
CREATE INDEX idx_beneficiary_packages_token ON beneficiary_packages(package_access_token);

CREATE TRIGGER beneficiary_packages_updated_at
  BEFORE UPDATE ON beneficiary_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- SECTION 11: VAULT HEALTH SNAPSHOTS
-- ============================================================

-- Calculated periodically and on any vault update.
-- factors_json stores the breakdown of what contributed to the score.
-- Stored as TEXT (encrypted JSON at app layer).
CREATE TABLE vault_health_snapshots (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  score             INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  factors_json      TEXT,                     -- [ENCRYPTED] JSON breakdown

  -- Individual factor flags (plaintext for admin queries)
  has_assets              BOOLEAN,
  has_beneficiaries       BOOLEAN,
  all_assets_assigned     BOOLEAN,
  all_assets_have_backup  BOOLEAN,
  has_intent_declaration  BOOLEAN,
  will_signed             BOOLEAN,
  will_witnessed          BOOLEAN,
  recent_review           BOOLEAN,            -- reviewed within 12 months
  two_fa_enabled          BOOLEAN,
  emergency_contact_set   BOOLEAN,

  calculated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_snapshots_owner_id ON vault_health_snapshots(owner_id);
CREATE INDEX idx_health_snapshots_calculated_at ON vault_health_snapshots(calculated_at);


-- ============================================================
-- SECTION 12: NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- owner_id: the vault owner this notification is about (may differ from user_id)

  type          TEXT NOT NULL,
  -- e.g. 'check_in_reminder', 'escalation_change', 'vault_executed',
  --      'beneficiary_package_ready', 'will_needs_signing', 'health_score_drop'

  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  action_url    TEXT,                          -- deep link into the app

  channel       notification_channel_enum NOT NULL,
  status        notification_status_enum DEFAULT 'pending',

  scheduled_at  TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  read_at       TIMESTAMPTZ,

  -- Retry tracking
  attempt_count INT DEFAULT 0,
  last_error    TEXT,

  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);


-- ============================================================
-- SECTION 13: ACTIVITY LOG (AUDIT TRAIL)
-- ============================================================

-- Immutable. Never updated or deleted.
-- Every significant action in the system writes here.
CREATE TABLE activity_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  action          TEXT NOT NULL,
  -- e.g. 'asset.created', 'asset.updated', 'beneficiary.added',
  --      'intent.video_uploaded', 'will.downloaded', 'vault.executed',
  --      'session.revoked', '2fa.enabled', 'check_in.responded',
  --      'death_cert.submitted', 'death_cert.verified'

  entity_type     TEXT,                       -- 'asset' | 'beneficiary' | 'will' | etc.
  entity_id       UUID,

  ip_address      TEXT,
  user_agent      TEXT,

  metadata        JSONB DEFAULT '{}',         -- additional context (NOT encrypted — no PII)

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_owner_id ON activity_logs(owner_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);


-- ============================================================
-- SECTION 14: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_settings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_sessions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_beneficiary_mappings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE residual_beneficiary            ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_declarations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_mappings                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_documents                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents             ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_settings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_events                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_log                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_verification_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_executions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_packages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_health_snapshots          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs                   ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ──────────────────────────────────────────────────
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── USER ROLES ─────────────────────────────────────────────────
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- ── TWO FACTOR SETTINGS ────────────────────────────────────────
CREATE POLICY "Users manage their own 2FA settings"
  ON two_factor_settings FOR ALL
  USING (auth.uid() = user_id);

-- ── LOGIN SESSIONS ─────────────────────────────────────────────
CREATE POLICY "Users view their own sessions"
  ON login_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke their own sessions"
  ON login_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ── ASSETS ─────────────────────────────────────────────────────
CREATE POLICY "Vault owners manage their own assets"
  ON assets FOR ALL
  USING (auth.uid() = owner_id);

-- ── BENEFICIARIES ──────────────────────────────────────────────
CREATE POLICY "Vault owners manage their own beneficiaries"
  ON beneficiaries FOR ALL
  USING (auth.uid() = owner_id);

-- Beneficiaries can read their own record (limited — app layer controls what fields are shown)
CREATE POLICY "Beneficiaries can view their own record"
  ON beneficiaries FOR SELECT
  USING (auth.uid() = user_id);

-- ── ASSET BENEFICIARY MAPPINGS ─────────────────────────────────
CREATE POLICY "Vault owners manage their own asset mappings"
  ON asset_beneficiary_mappings FOR ALL
  USING (auth.uid() = owner_id);

-- ── RESIDUAL BENEFICIARY ───────────────────────────────────────
CREATE POLICY "Vault owners manage their residual beneficiary"
  ON residual_beneficiary FOR ALL
  USING (auth.uid() = owner_id);

-- ── GUARDIANS ─────────────────────────────────────────────────
CREATE POLICY "Vault owners manage their guardians"
  ON guardians FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Guardians can view their own guardian record"
  ON guardians FOR SELECT
  USING (auth.uid() = user_id);

-- ── EMERGENCY CONTACTS ─────────────────────────────────────────
CREATE POLICY "Vault owners manage their emergency contact"
  ON emergency_contacts FOR ALL
  USING (auth.uid() = owner_id);

-- ── INTENT DECLARATIONS ────────────────────────────────────────
CREATE POLICY "Vault owners manage their intent declarations"
  ON intent_declarations FOR ALL
  USING (auth.uid() = owner_id);

-- ── INTENT MAPPINGS ────────────────────────────────────────────
CREATE POLICY "Vault owners manage their intent mappings"
  ON intent_mappings FOR ALL
  USING (auth.uid() = owner_id);

-- ── WILL DOCUMENTS ─────────────────────────────────────────────
CREATE POLICY "Vault owners manage their will documents"
  ON will_documents FOR ALL
  USING (auth.uid() = owner_id);

-- ── GENERATED DOCUMENTS ────────────────────────────────────────
CREATE POLICY "Vault owners view their generated documents"
  ON generated_documents FOR SELECT
  USING (auth.uid() = owner_id);

-- ── ESCALATION SETTINGS ────────────────────────────────────────
CREATE POLICY "Vault owners manage their escalation settings"
  ON escalation_settings FOR ALL
  USING (auth.uid() = owner_id);

-- ── CHECK-IN EVENTS ────────────────────────────────────────────
CREATE POLICY "Vault owners view their check-in events"
  ON check_in_events FOR SELECT
  USING (auth.uid() = owner_id);

-- ── ESCALATION LOG ─────────────────────────────────────────────
CREATE POLICY "Vault owners view their escalation log"
  ON escalation_log FOR SELECT
  USING (auth.uid() = owner_id);

-- ── DEATH VERIFICATION SUBMISSIONS ────────────────────────────
-- Only the FastAPI backend (service role) can insert/update these.
-- Beneficiaries cannot write directly — they go through the API.
CREATE POLICY "Vault owners can view their verification submissions"
  ON death_verification_submissions FOR SELECT
  USING (auth.uid() = owner_id);

-- ── VAULT EXECUTIONS ───────────────────────────────────────────
CREATE POLICY "Vault owners can view their executions"
  ON vault_executions FOR SELECT
  USING (auth.uid() = owner_id);

-- ── BENEFICIARY PACKAGES ───────────────────────────────────────
-- Unlocked beneficiaries can view their own package
CREATE POLICY "Beneficiaries can view their own package"
  ON beneficiary_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM beneficiaries b
      WHERE b.id = beneficiary_packages.beneficiary_id
        AND b.user_id = auth.uid()
        AND b.status = 'unlocked'
    )
  );

-- ── VAULT HEALTH SNAPSHOTS ─────────────────────────────────────
CREATE POLICY "Vault owners view their health snapshots"
  ON vault_health_snapshots FOR SELECT
  USING (auth.uid() = owner_id);

-- ── NOTIFICATIONS ──────────────────────────────────────────────
CREATE POLICY "Users view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark notifications read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ── ACTIVITY LOGS ──────────────────────────────────────────────
CREATE POLICY "Users view their own activity"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================================
-- SECTION 15: SUPABASE STORAGE BUCKETS
-- Run these in the Supabase dashboard Storage section,
-- OR via the Supabase client in your backend setup script.
-- All buckets are PRIVATE (public = false).
-- ============================================================

-- NOTE: Execute these via Supabase dashboard → Storage → New Bucket
-- or via the management API / supabase-js admin client:

-- Bucket 1: 'vault-videos'
--   Purpose: Video will recordings uploaded by vault owners
--   Max file size: 500MB
--   Allowed MIME types: video/mp4, video/webm, video/quicktime

-- Bucket 2: 'vault-documents'
--   Purpose: Identity documents uploaded by users during vault setup
--   Max file size: 10MB
--   Allowed MIME types: application/pdf, image/jpeg, image/png

-- Bucket 3: 'generated-documents'
--   Purpose: Will PDFs and claim forms generated by the FastAPI backend
--   Max file size: 20MB
--   Allowed MIME types: application/pdf

-- Bucket 4: 'death-certificates'
--   Purpose: Death certificates uploaded by beneficiaries
--   Max file size: 10MB
--   Allowed MIME types: application/pdf, image/jpeg, image/png

-- Bucket 5: 'avatars'
--   Purpose: User profile pictures
--   Max file size: 5MB
--   Allowed MIME types: image/jpeg, image/png, image/webp

-- All files accessed via signed URLs (60-minute expiry) generated server-side.
-- No direct public access to any bucket.


-- ============================================================
-- SECTION 16: USEFUL VIEWS
-- ============================================================

-- ----------------------------------------------------------
-- 16.1 VAULT SUMMARY VIEW
-- Used by the dashboard to render the overview card.
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW vault_summary AS
SELECT
  p.id AS owner_id,
  p.full_name,
  p.vault_health_score,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active') AS active_asset_count,
  COUNT(DISTINCT b.id) AS beneficiary_count,
  COUNT(DISTINCT wd.id) FILTER (WHERE wd.is_current = TRUE) AS current_will_count,
  es.current_escalation_level,
  es.last_check_in_responded_at,
  es.vacation_mode_active,
  MAX(ls.last_active_at) AS last_login_at
FROM profiles p
LEFT JOIN assets a ON a.owner_id = p.id
LEFT JOIN beneficiaries b ON b.owner_id = p.id
LEFT JOIN will_documents wd ON wd.owner_id = p.id
LEFT JOIN escalation_settings es ON es.owner_id = p.id
LEFT JOIN login_sessions ls ON ls.user_id = p.id AND ls.is_active = TRUE
GROUP BY p.id, p.full_name, p.vault_health_score,
         es.current_escalation_level, es.last_check_in_responded_at,
         es.vacation_mode_active;

-- RLS: only owner sees their own row (enforced at query level via WHERE owner_id = auth.uid())


-- ----------------------------------------------------------
-- 16.2 ASSET ALLOCATION CHECK VIEW
-- Shows per-asset allocation totals for the allocation validator.
-- Red flag if primary total != 100 for any active asset.
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW asset_allocation_check AS
SELECT
  a.id AS asset_id,
  a.owner_id,
  a.nickname,
  a.asset_type,
  a.status,
  COALESCE(SUM(abm.percentage) FILTER (WHERE abm.role = 'primary'), 0) AS primary_total_pct,
  COUNT(abm.id) FILTER (WHERE abm.role = 'primary') AS primary_beneficiary_count,
  COUNT(abm.id) FILTER (WHERE abm.role = 'backup')  AS backup_beneficiary_count
FROM assets a
LEFT JOIN asset_beneficiary_mappings abm ON abm.asset_id = a.id
WHERE a.status = 'active'
GROUP BY a.id, a.owner_id, a.nickname, a.asset_type, a.status;


-- ============================================================
-- SECTION 16.3: GRANTS
-- Supabase's automatic default grants only apply when tables
-- are created via the dashboard. Schema-created tables and all
-- views require explicit grants.
-- Run this entire section whenever new tables/views are added.
-- ============================================================

-- Tables: full access for service_role (backend), row-filtered by RLS for authenticated
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure future tables/sequences also get these grants automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES    TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES    TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT                  ON SEQUENCES TO authenticated;


-- ============================================================
-- SECTION 17: SEED DATA FOR DEMO
-- Populate "Ramesh Iyer" demo account for the hackathon demo.
-- Replace the UUID below with the actual Supabase auth UID
-- after creating the demo user in Supabase Auth.
-- ============================================================

-- STEP 1: Create the demo user via Supabase Dashboard → Auth → Add User
--         Email: demo@gmail.com  |  Password: Demo@1234  |  Email confirmed: YES
-- STEP 2: Copy the UUID from the Users table
-- STEP 3: Replace 'REPLACE_WITH_DEMO_USER_UUID' below and run

/*DO $$
DECLARE
  demo_uid UUID := 'REPLACE_WITH_DEMO_USER_UUID';
  asset1   UUID := uuid_generate_v4();
  asset2   UUID := uuid_generate_v4();
  asset3   UUID := uuid_generate_v4();
  asset4   UUID := uuid_generate_v4();
  bene1    UUID := uuid_generate_v4();
  bene2    UUID := uuid_generate_v4();
  bene3    UUID := uuid_generate_v4();
  bene_bk  UUID := uuid_generate_v4();
BEGIN

  -- Profile
  UPDATE profiles SET
    full_name     = 'Ramesh Iyer',
    city          = 'Chennai',
    state         = 'Tamil Nadu',
    religion      = 'Hindu',
    vault_health_score = 87,
    onboarding_done = TRUE
  WHERE id = demo_uid;

  -- Escalation settings
  UPDATE escalation_settings SET
    check_in_frequency_days = 90,
    current_escalation_level = 'level_0_normal',
    last_check_in_responded_at = NOW() - INTERVAL '45 days'
  WHERE owner_id = demo_uid;

  -- Assets (values are fake plaintext for demo — in prod these are encrypted)
  INSERT INTO assets (id, owner_id, nickname, asset_type, institution_name, account_identifier, estimated_value_inr, nominee_registered, status)
  VALUES
    (asset1, demo_uid, 'HDFC Salary Account',     'bank_account',   'HDFC Bank — Anna Nagar', 'XXXX-XXXX-4521', 850000,    TRUE,  'active'),
    (asset2, demo_uid, 'Anna Nagar Flat',          'property',       'CMDA Chennai',           'SY.NO.142/3A',   7500000,   FALSE, 'active'),
    (asset3, demo_uid, 'LIC Jeevan Anand Policy',  'insurance',      'LIC of India',           'POL-884421337',  2500000,   TRUE,  'active'),
    (asset4, demo_uid, 'ETH Wallet (MetaMask)',     'crypto_wallet',  'MetaMask',               '0xABCD...9F12',  450000,    FALSE, 'active');

  -- Beneficiaries (plaintext for demo — in prod these are encrypted)
  INSERT INTO beneficiaries (id, owner_id, full_name, relationship, email, phone_number, disclosure_level, status)
  VALUES
    (bene1,  demo_uid, 'Kavitha Iyer',    'spouse',   'kavitha.iyer@email.com',  '+91-98400-11111', 'full_transparency', 'registered'),
    (bene2,  demo_uid, 'Arjun Iyer',      'son',      'arjun.iyer@email.com',    '+91-98400-22222', 'partial_awareness', 'registered'),
    (bene3,  demo_uid, 'Priya Iyer',      'daughter', 'priya.iyer@email.com',    '+91-98400-33333', 'partial_awareness', 'registered'),
    (bene_bk,demo_uid, 'Ravi Iyer',       'brother',  'ravi.iyer@email.com',     '+91-98400-44444', 'total_secrecy',     'registered');

  -- Asset → Beneficiary Mappings
  INSERT INTO asset_beneficiary_mappings (owner_id, asset_id, beneficiary_id, role, percentage, priority_order)
  VALUES
    -- HDFC Account: 60% wife (primary), 40% son (primary), daughter backup for both
    (demo_uid, asset1, bene1,   'primary', 60.00, 1),
    (demo_uid, asset1, bene2,   'primary', 40.00, 1),
    (demo_uid, asset1, bene3,   'backup',  100.00, 1),
    -- Property: 100% wife (primary), son backup
    (demo_uid, asset2, bene1,   'primary', 100.00, 1),
    (demo_uid, asset2, bene2,   'backup',  100.00, 1),
    -- LIC Policy: 100% daughter (primary), wife backup
    (demo_uid, asset3, bene3,   'primary', 100.00, 1),
    (demo_uid, asset3, bene1,   'backup',  100.00, 1),
    -- ETH Wallet: 100% son (primary), brother backup
    (demo_uid, asset4, bene2,   'primary', 100.00, 1),
    (demo_uid, asset4, bene_bk, 'backup',  100.00, 1);

  -- Residual beneficiary → wife
  INSERT INTO residual_beneficiary (owner_id, beneficiary_id)
  VALUES (demo_uid, bene1)
  ON CONFLICT (owner_id) DO NOTHING;

  -- Vault health snapshot
  INSERT INTO vault_health_snapshots
    (owner_id, score, has_assets, has_beneficiaries, all_assets_assigned,
     all_assets_have_backup, has_intent_declaration, will_signed, will_witnessed,
     recent_review, two_fa_enabled, emergency_contact_set)
  VALUES
    (demo_uid, 87, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, TRUE);

END $$;*/


-- ============================================================
-- DONE.
-- ============================================================
-- Next steps:
-- 1. Run this file in Supabase SQL Editor
-- 2. Create storage buckets manually in Supabase dashboard
-- 3. Create demo user and update REPLACE_WITH_DEMO_USER_UUID
-- 4. Re-run the seed block only (Section 17) after getting the UID
-- 5. Set up Supabase Vault (for server-side secret storage) for
--    the FastAPI service role key — never commit it to code
-- ============================================================
