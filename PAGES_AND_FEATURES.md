# [APP_NAME] — PAGES & FEATURES SPECIFICATION
> Every page: purpose, components, state, API calls, backend endpoints

---

## SECTION 1 — PUBLIC DISPLAY WEBSITE

---

### PAGE 1.1 — Landing Page (`/`)

**Purpose:** First impression. Communicate the problem, solution, and emotional hook within 5 seconds. Drive signups.

**Sections (top to bottom):**

**Navbar**
- Logo (left), nav links (How It Works, Features, Pricing, FAQ), Sign In + "Create Vault Free" CTA (right)
- Mobile: hamburger menu with slide-down drawer
- Transparent on scroll-top, solid background on scroll-down (Framer Motion scroll listener)
- Sticky on desktop, hidden-on-scroll-down on mobile

**Hero Section**
- Headline: Large, bold, two lines max
- Subheadline: one sentence explaining what [APP_NAME] does
- Two CTAs: "Create Your Vault — Free" (primary) + "See How It Works" (secondary, scrolls down)
- Background: subtle animated gradient, not distracting
- Mobile: single column, CTAs stacked

**Stats Bar**
- Three numbers in a row: ₹1.5 lakh crore unclaimed · 100M+ crypto investors · 6 months average claim time
- Each animates up from 0 on scroll-into-view (Framer Motion + useInView)

**Problem Section**
- Three problem cards side by side (desktop) / stacked (mobile)
- Card 1: Discovery — "Your family doesn't know what you own"
- Card 2: Crypto Black Hole — "No private key = money gone forever"
- Card 3: Paper Nightmare — "A death certificate unlocks almost nothing"
- Each card: icon, title, 2-sentence explanation

**Solution Section**
- Three-phase horizontal flow with connecting arrows (desktop) / vertical (mobile)
- Phase 1: Build Your Vault
- Phase 2: We Watch Over It
- Phase 3: Your Family Receives Everything
- Each phase: number badge, icon, title, one-line description

**Features Grid**
- 6 cards in 2×3 grid (desktop) / 1 column (mobile)
- AI Video Will · Legal PDF Generation · Asset Discovery · Crypto Routing · Beneficiary Privacy · Smart Escalation

**Competitor Table**
- Table comparing [APP_NAME] vs Estate Lawyers vs Yellow vs Cipherwill
- Columns: Discovery · Coordination · Legal Forms · Crypto · Intent Clarity
- [APP_NAME] gets ✅ across all rows (green), others get ❌ or Partial

**Pricing Preview**
- 4 tier cards — Free, Legacy, Family, Professional
- "See full pricing" link to /pricing

**CTA Section**
- Dark background section
- "Start for free. Your family will thank you."
- Single CTA button

**Footer**
- Logo, tagline, nav links, social links, "Not a legal service" disclaimer

---

### PAGE 1.2 — How It Works (`/how-it-works`)

**Purpose:** Detailed explanation of the three phases for users who want to understand before signing up.

**Sections:**

**Phase 1 Detail: Build Your Vault**
- Illustrated step-by-step: Add your assets → Add beneficiaries → Record video will → Generate will document → Enable escalation
- Each step: number, icon, title, 3-sentence explanation

**Phase 2 Detail: We Watch Over It**
- The escalation ladder visualized as a vertical timeline
- Level 0 → Level 5, each level explained plainly
- Key callout: "We require a government-verified death certificate. No certificate, no execution. Ever."

**Phase 3 Detail: Your Family Receives Everything**
- Split into two tracks side by side: Traditional Assets (left) / Crypto (right)
- Traditional: forms generated → beneficiary downloads → walks into bank/office
- Crypto: smart contract fires → assets route to wallet automatically
- Beneficiary portal screenshot mock-up

**Security Section**
- Zero-knowledge encryption explanation in plain language
- "Even [APP_NAME] cannot read your data"
- 3 key points: Client-side encryption · Private storage buckets · Government-verified trigger

---

### PAGE 1.3 — Features (`/features`)

**Purpose:** Full feature list for technically curious users.

**Sections:**
- Feature detail for each of the 6 main features with expanded descriptions
- Sub-features listed under each main feature
- A "Coming Soon" section with V2 roadmap items (PAN-based asset sweep, lawyer marketplace)

---

### PAGE 1.4 — Pricing (`/pricing`)

**Purpose:** Convert fence-sitters. Make the free tier obvious.

**Layout:**
- 4 cards in a row (desktop), stacked (mobile)
- Toggle: Monthly / Yearly (yearly shows 2 months free badge)
- Feature comparison table below the cards
- FAQ about pricing below the table

**Tiers:**
| Tier | Price | Key limits |
|---|---|---|
| Free | ₹0 | 3 assets, 1 beneficiary, basic PDF |
| Legacy | ₹299/mo | Unlimited assets + beneficiaries, all forms |
| Family | ₹499/mo | Covers 2 people, joint vault |
| Professional | ₹2,999/mo | White-label for wealth managers, 200 clients |

---

### PAGE 1.5 — FAQ (`/faq`)

**Purpose:** Handle objections before support tickets happen.

**12 questions (Accordion, one open at a time):**
1. Is [APP_NAME] a legal will service?
2. What if [APP_NAME] shuts down?
3. Can my beneficiaries see my assets while I'm alive?
4. What if all my beneficiaries are unreachable?
5. How is my data encrypted?
6. What documents does my family need after execution?
7. Does this work for NRIs?
8. What happens to my crypto if I don't have a hardware wallet?
9. Can I change my beneficiaries at any time?
10. What is a nominee and why is it not enough?
11. How do you verify the death certificate?
12. What if I go on a long vacation and miss check-ins?

---

## SECTION 2 — AUTHENTICATION

---

### PAGE 2.1 — Sign Up (`/auth/signup`)

**Purpose:** Create a new vault owner account.

**Frontend:**
- Form fields: Full Name, Email, Phone Number, Password, Confirm Password
- Zod validation: password min 8 chars, must include number + special char
- "Continue" button → triggers Supabase `signUp()` with email confirmation
- After submit: redirect to email verification pending screen
- Google OAuth button (optional, Supabase handles)
- "Already have an account? Sign In" link
- Mobile: same layout, larger touch targets

**Backend (Supabase handles):**
- `supabase.auth.signUp()` → creates auth.users row → triggers `handle_new_user()` → creates profiles row
- Email confirmation sent automatically by Supabase

---

### PAGE 2.2 — Sign In (`/auth/signin`)

**Purpose:** Authenticate returning user.

**Frontend:**
- Fields: Email, Password
- "Forgot password?" link
- On success: check if 2FA is enabled
  - If yes: redirect to `/auth/2fa-verify`
  - If no: redirect to `/dashboard`
- Show prompt banner if 2FA not set up ("Secure your vault — enable 2FA")

**Backend:**
- `supabase.auth.signInWithPassword()` → returns session
- Check `two_factor_settings` table → if any method enabled, require 2FA before granting dashboard access

---

### PAGE 2.3 — 2FA Setup (`/auth/2fa-setup`)

**Purpose:** Let users enable one or more 2FA methods.

**Frontend:**
Three tabs:

**Email OTP tab:**
- "We'll send a 6-digit code to your email each time you log in"
- Toggle to enable/disable
- On enable: send test code to email, user enters it to confirm

**SMS OTP tab:**
- Phone number input (pre-filled from profile)
- "Demo Mode" badge — shows the UI but accepts any 6-digit code
- In production: integrate MSG91 (India-based, cheaper than Twilio)

**Authenticator App tab:**
- Generate TOTP secret via `otplib.authenticator.generateSecret()`
- Render QR code via `qrcode.react`
- Display manual entry code below QR
- 6-digit input to verify setup worked
- "Demo Mode" badge — any valid 6-digit code accepted

**Backend (FastAPI — `POST /api/auth/2fa/setup`):**
```
Request: { method: 'email_otp' | 'sms_otp' | 'totp', secret?: string }
Response: { success: boolean, backup_codes?: string[] }
Action: Update two_factor_settings row, generate + return backup codes
```

---

### PAGE 2.4 — 2FA Verify (`/auth/2fa-verify`)

**Purpose:** Second factor confirmation on every login.

**Frontend:**
- Shown immediately after password step if 2FA enabled
- Tabs for each enabled method
- OTPInput component: 6 boxes, auto-advance on digit entry, auto-submit on 6th digit
- "Use backup code" link at bottom
- 30-second resend timer for OTP methods

**Backend (FastAPI — `POST /api/auth/2fa/verify`):**
```
Request: { method: string, code: string, session_token: string }
Response: { verified: boolean, access_token: string }
Action: Validate code, issue final JWT with mfa_verified: true claim
```

---

## SECTION 3 — VAULT OWNER DASHBOARD

**Layout (all dashboard pages):**
- Desktop: Fixed left sidebar (240px) + main content area
- Mobile: Top header + bottom tab navigation (5 tabs: Home, Vault, Beneficiaries, Intent, Settings)
- Sidebar items: Dashboard, My Vault, Beneficiaries, Intent Declaration, Will Document, Escalation, Health Score, Security, Activity Log
- Top bar: Logo, notification bell, user avatar dropdown (Profile, Sign Out)

---

### PAGE 3.1 — Dashboard Overview (`/dashboard`)

**Purpose:** At-a-glance status of the entire vault.

**Frontend Components:**

**VaultHealthRing:** Circular progress indicator 0–100, colour-coded (red <40, amber 40–70, green >70). Animates on load. Click → navigates to /dashboard/health.

**OnboardingChecklist:** Only shown if `onboarding_done = false`. 7 steps with checkmarks. Disappears once all steps completed.

**AssetSummaryCards:** One card per asset type that has at least one entry. Shows type icon, count, total estimated value. Clicking navigates to /dashboard/vault filtered by that type.

**QuickActions:** Two prominent cards — "Add an Asset" and "Record Your Video Will". Always visible.

**ActivityFeed:** Last 5 activity log entries. Timestamp, action description, entity name. "View all" link to /dashboard/activity.

**BeneficiarySummary:** Count of beneficiaries + a warning if any asset has no backup beneficiary assigned.

**EscalationStatus:** Current level badge (Level 0 — Normal), last check-in date, next check-in date, vacation mode toggle.

**State:**
- All data fetched on mount via `useVaultSummary()` hook
- Skeleton loaders for each section while loading
- Realtime subscription to `activity_logs` for live feed updates

**Backend (FastAPI — `GET /api/vault/summary`):**
```
Response: {
  health_score: number,
  asset_count: number,
  beneficiary_count: number,
  escalation_level: string,
  last_check_in: string,
  recent_activity: ActivityLog[],
  onboarding_step: number
}
```

---

### PAGE 3.2 — My Vault (`/dashboard/vault`)

**Purpose:** Complete asset inventory, grouped by type.

**Frontend Components:**

**AssetList:** Groups assets by type (Bank Accounts, Property, Insurance, etc.). Each group has a header with count and "+ Add" button. Collapsed by default if empty.

**AssetCard:** Shows nickname, masked account identifier (••••4521), assigned beneficiary pill(s) with percentages, health indicator dot (green = fully assigned + backup, amber = partial, red = not assigned).

**AssetDrawer:** Slides in from right on card click. Shows all asset details, edit button, delete button with confirm dialog. Sensitive fields shown masked with "reveal" eye toggle.

**AllocationWarning Banner:** Shown at top if any active asset's primary allocation ≠ 100%.

**Filter/Sort bar:** Filter by asset type, sort by date added / estimated value.

**State:**
- Assets fetched via `useAssets()` on mount
- Decrypt field values client-side before display (Web Crypto API)
- Optimistic updates on delete

**Backend:**
```
GET  /api/assets          → list all assets for current user
POST /api/assets          → create new asset
PUT  /api/assets/{id}     → update asset
DEL  /api/assets/{id}     → soft-delete (set status = inactive)
```

---

### PAGE 3.3 — Add Asset Wizard (`/dashboard/vault/add`)

**Purpose:** Guided multi-step form to add a new asset.

**Step 1 — Type Select:**
Grid of 12 asset type cards with icons. Click to select and advance.

**Step 2 — Asset Details:**
Dynamic form that changes based on selected type.

Fields per type:
- **Bank Account:** Nickname, Bank Name, Branch, Account Number [ENC], Account Type (Savings/Current/NRO), IFSC [ENC], Nominee Registered? (Y/N)
- **Fixed Deposit:** Nickname, Bank Name, FD Number [ENC], Maturity Date, Interest Rate, Amount, Nominee Registered?
- **Property:** Nickname, Survey/Registration Number [ENC], Address [ENC], Approximate Value, Self-acquired or Inherited?, Mortgage? (Y/N)
- **Insurance:** Nickname, Insurer Name, Policy Number [ENC], Policy Type, Sum Assured, Maturity Date, Nominee Registered?
- **Mutual Fund:** Nickname, AMC Name, Folio Number [ENC], Scheme Name, Depository
- **Stocks/Demat:** Nickname, Broker, Demat Account Number [ENC], DP ID [ENC], CDSL or NSDL?
- **Crypto Wallet:** Nickname, Chain (ETH/BTC/Polygon/Other), Wallet Address [ENC], Hardware Wallet? (Y/N)
- **Vehicle:** Nickname, RC Number [ENC], Make & Model, Year
- **PPF/EPF:** Nickname, Account Number [ENC], UAN Number [ENC], Office/Employer Name
- **Gold/Jewellery:** Nickname, Description [ENC], Approximate Weight (g), Storage Location [ENC]
- **Business:** Nickname, Company Name, CIN [ENC], Ownership % 
- **Other:** Nickname, Description [ENC], Approximate Value

All [ENC] fields encrypt on blur using Web Crypto API before sending to backend.

**Step 3 — Assign Beneficiary:**
- Dropdown of existing beneficiaries
- Percentage input (validates sum ≤ 100)
- "+ Add another primary beneficiary" for splits
- Backup beneficiary section (same UI)
- Warning if total primary ≠ 100%
- Link to add a new beneficiary inline without losing wizard progress

**Step 4 — Review & Confirm:**
Summary card showing all entered data (masked). Confirm button.

**Backend (FastAPI — `POST /api/assets`):**
```
Request: {
  asset_type: string,
  nickname: string,
  institution_name: string (encrypted),
  account_identifier: string (encrypted),
  metadata_encrypted: string (encrypted JSON blob),
  estimated_value_inr: number,
  nominee_registered: boolean,
  mappings: [{ beneficiary_id, role, percentage, priority_order }]
}
Response: { id: uuid, created_at: string }
Action: Insert into assets + asset_beneficiary_mappings, log activity
```

---

### PAGE 3.4 — Beneficiaries (`/dashboard/beneficiaries`)

**Purpose:** Manage all people who will receive assets.

**Frontend Components:**

**BeneficiaryTable:** Name, relationship, disclosure badge (colour-coded), status, assets assigned count, actions (edit/delete). Sortable columns.

**DisclosureBadge:**
- 🔴 Total Secrecy
- 🟡 Partial Awareness  
- 🟢 Full Transparency

**AllocationOverview:** Below the table. Per-asset allocation checker — lists each active asset and whether primary allocation = 100%. Red rows need attention.

**AddBeneficiaryForm (Modal/Drawer):**
Fields: Full Name [ENC], Relationship (dropdown), Email [ENC], Phone [ENC], Aadhaar [ENC], PAN [ENC], Address [ENC], Bank Account Number [ENC], Bank IFSC [ENC], Crypto Wallet Address [ENC], Disclosure Level (radio), Is Minor? (toggle), If minor: select Trustee from beneficiary list, Personal Message [ENC] (shown in execution package).

**Backend:**
```
GET  /api/beneficiaries          → list all beneficiaries
POST /api/beneficiaries          → create beneficiary
PUT  /api/beneficiaries/{id}     → update beneficiary
DEL  /api/beneficiaries/{id}     → delete (fails if assigned to an asset)
```

---

### PAGE 3.5 — Intent Declaration (`/dashboard/intent`)

**Purpose:** Record video will or written intent, parse with AI, confirm mappings.

**Frontend — Two Tabs:**

**Tab 1: Video Will**

VideoRecorder component:
- Uses `MediaRecorder` browser API
- Big record button (red when recording, shows timer)
- Preview playback before upload
- Upload progress bar to Supabase Storage
- OR: Drag-and-drop upload of pre-recorded video (react-dropzone)

After upload: "Process with Gemini AI" button
- Shows loading state: "Transcribing and analysing your video..."
- On success: transcript appears in a collapsible section

MappingCard grid: One card per extracted mapping
- Shows: extracted text → matched asset (or ❓ if unmatched) → matched beneficiary (or ❓) → percentage
- Conflict cards highlighted in amber
- Each card: "Accept", "Edit" (opens resolver), "Ignore" buttons

ConflictResolver: Dropdown to manually match unresolved assets/beneficiaries from vault.

"Accept All Confirmed Mappings" button: applies accepted mappings to vault.

**Tab 2: Written Intent**

Textarea with placeholder: "Describe in plain language who gets what. E.g., 'My HDFC account should go to my wife Kavitha. My flat in Chennai should go 50% to my wife and 50% to my son Arjun...'"

Same "Process with Gemini AI" flow → same mapping card UI.

**Backend (FastAPI):**
```
POST /api/intent/upload
  Request: multipart/form-data (video file)
  Response: { intent_id, storage_path }
  Action: Upload to Supabase Storage vault-videos bucket, create intent_declarations row

POST /api/intent/{id}/process
  Response: { transcript, mappings: [{ extracted_asset, matched_asset_id, extracted_beneficiary, matched_beneficiary_id, percentage }] }
  Action:
    1. Download video from storage (or use uploaded text)
    2. Call Gemini API with transcript extraction prompt
    3. Run entity matching against user's assets + beneficiaries
    4. Store intent_mappings rows
    5. Return structured mappings

POST /api/intent/{id}/accept
  Request: { accepted_mapping_ids: uuid[] }
  Response: { updated_count: number }
  Action: Mark mappings as accepted, update asset_beneficiary_mappings where needed

Gemini prompt structure:
  System: "You are an estate planning assistant. Extract asset-to-beneficiary assignments from the following text. Return ONLY a JSON array with fields: asset_description, beneficiary_name, percentage (0-100), special_instruction."
  User: [transcript text]
```

---

### PAGE 3.6 — Will Document (`/dashboard/will`)

**Purpose:** View, download, and track signing status of the auto-generated legal will.

**Frontend Components:**

**WillPreview:** Formatted document rendered in the browser. Sections:
- Declaration header (testator name, address, religion, date)
- Asset distribution table (each asset → beneficiary → percentage)
- Special instructions section
- Executor appointment section (user nominates an executor — another field to collect)
- Witness signature section (two blank signature lines)
- Legal footer: "This document constitutes the last will and testament of [NAME]..."

**SigningChecklist:**
4 steps, each with a checkbox the user manually ticks:
1. ☐ Printed this document
2. ☐ Signed in the presence of two witnesses
3. ☐ Both witnesses have signed
4. ☐ Stored a physical copy safely

When all 4 ticked → green "Will is active" badge appears. Updates `will_documents` row.

**WillVersionHistory:** Table of past generated versions with dates. Shows which events triggered a new version (asset added, beneficiary changed, etc.). "View" button for old versions.

**Buttons:**
- "Regenerate Will" (creates new version based on current vault state)
- "Download PDF" (triggers FastAPI endpoint, streams PDF)

**Backend (FastAPI):**
```
GET  /api/documents/will/current
  Response: { will_id, version, storage_path, signed_url, is_signed, is_witnessed }

POST /api/documents/will/generate
  Response: { will_id, storage_path }
  Action:
    1. Fetch all assets + beneficiary mappings for user
    2. Fetch user profile (name, address, religion)
    3. Generate PDF using will_template.py (ReportLab)
    4. Upload to generated-documents Supabase Storage bucket
    5. Create will_documents row (is_current=true, previous version set is_current=false)
    6. Return signed URL valid 60 minutes

PUT /api/documents/will/{id}/signing-status
  Request: { is_printed, is_signed, is_witnessed, witness_1_name, witness_2_name }
  Response: { updated: true }
```

---

### PAGE 3.7 — Escalation Settings (`/dashboard/escalation`)

**Purpose:** Configure how [APP_NAME] monitors the user and contacts people if something seems wrong.

**Frontend Components:**

**EscalationLadder:** Vertical interactive timeline showing all 5 levels. Each level shows what triggers it and what happens. Current level highlighted. Animated connection lines.

**CheckInFrequency:** Labeled slider from 30 to 180 days (default 90). Shows "Next check-in: [calculated date]".

**VacationMode:** Toggle + date range picker. Shows warning if end date > 180 days from start. When active: green badge on dashboard. Sends confirmation email to user.

**EmergencyContactForm:** Name, Relationship, Phone [ENC], Email [ENC]. One contact only. Explains: "This person is contacted before your beneficiaries to check on your wellbeing."

**BeneficiaryContactOrder:** Drag-and-drop list using @dnd-kit. Shows PB1 → PB2 → BB1 → BB2 order. Each row: beneficiary name, relationship, disclosure level badge.

**Backend:**
```
GET /api/escalation/settings         → fetch escalation_settings row
PUT /api/escalation/settings         → update settings
POST /api/escalation/vacation        → activate vacation mode
DEL  /api/escalation/vacation        → deactivate vacation mode
POST /api/escalation/checkin/{token} → handle "I'm okay" link click from email
```

---

### PAGE 3.8 — Health Score (`/dashboard/health`)

**Purpose:** Detailed breakdown of vault health score with actionable items.

**Frontend Components:**

**Large score display:** Number + ring + colour + label (Poor / Fair / Good / Excellent)

**HealthFactorRow (×10 rows, one per factor):**
- Factor name + description
- Status: ✅ / ⚠️ / ❌
- Action button: "Fix this" → navigates to the relevant page
- Point value: shows how many points this factor contributes

Factors and their points:
| Factor | Points |
|---|---|
| At least one active asset | 10 |
| At least one beneficiary | 10 |
| All active assets assigned | 15 |
| All assets have backup beneficiary | 15 |
| Intent declaration recorded | 10 |
| Will document generated | 5 |
| Will document signed + witnessed | 10 |
| Reviewed in last 12 months | 10 |
| 2FA enabled | 10 |
| Emergency contact set | 5 |
| **Total** | **100** |

**HealthHistory:** Line chart (recharts) showing score over last 6 snapshots. X-axis: date. Y-axis: 0–100.

**Backend (FastAPI — `POST /api/vault/health/calculate`):**
```
Action:
  1. Fetch all relevant data for user
  2. Evaluate each factor → boolean
  3. Sum points
  4. Insert vault_health_snapshots row
  5. Update profiles.vault_health_score
  6. Return score + factor breakdown
Trigger: Called on every significant vault change (asset added/removed, beneficiary changed, will generated, 2FA toggled)
```

---

### PAGE 3.9 — Security (`/dashboard/security`)

**Purpose:** 2FA management, active sessions, account safety.

**Frontend Components:**

**TwoFactorManager:**
3 sections (Email OTP, SMS OTP, Authenticator App), each with:
- Current status badge (Enabled / Disabled)
- Enable/Disable button
- For TOTP: Show QR code button → opens setup modal

**SessionTable:**
Columns: Device type icon, Location, Last active, Created. "Revoke" button on each row except current session (which shows "Current" badge). Confirm dialog before revoke.

**ChangePasswordSection:** Current password + New password + Confirm. Zod validated.

**VaultExportButton:**
"Download Encrypted Vault Backup" button.
- Triggers FastAPI to generate encrypted JSON of entire vault
- User downloads `.vault` file
- Instructions shown: "Store this on a USB drive or in DigiLocker. If you ever lose access to [APP_NAME], this file can be used to reconstruct your vault."

**DangerZone:**
"Delete Account" button → confirm dialog → explains what happens to vault data → requires typing "DELETE" to confirm.

**Backend:**
```
GET  /api/security/sessions           → list login_sessions for user
DEL  /api/security/sessions/{id}      → revoke session
POST /api/security/password           → change password
GET  /api/security/vault-export       → generate + return encrypted vault JSON
```

---

### PAGE 3.10 — Activity Log (`/dashboard/activity`)

**Purpose:** Full audit trail of every vault action.

**Frontend Components:**

**Filter bar:** Date range picker, action type dropdown, search by entity name.

**ActivityTable:**
Columns: Timestamp, Action (human-readable label), Affected Item, IP Address.
Colour-coded by action type: green = create, blue = update, red = delete, amber = security event.
Infinite scroll or pagination (50 per page).

**Backend:**
```
GET /api/activity?page=1&limit=50&action=&start_date=&end_date=
Response: { logs: ActivityLog[], total: number, page: number }
```

---

## SECTION 4 — EXECUTION FLOW

---

### PAGE 4.1 — Guardian Portal (`/guardian/portal`)

**Purpose:** Separate minimal interface for guardians to report suspected death.

**Frontend:**
- Separate login at `/guardian/login` using their email (guardian doesn't need a full account)
- After login: single-page portal
- Shows: "You are a guardian for [First name only — respect secrecy] [Last name]."
- Current escalation level badge + explanation of what it means
- "Report Suspected Death" button → opens multi-step confirm dialog:
  - Step 1: "Are you sure? This begins the verification process."
  - Step 2: "Have you been unable to reach [name] for an extended period?"
  - Step 3: "Confirm" → triggers escalation to Level 3, fires notifications

**Backend:**
```
POST /api/guardian/report
  Request: { guardian_id, owner_id }
  Response: { escalation_triggered: true }
  Action: Escalate to level_3_suspected_death, log event, send notifications to all channels
```

---

### PAGE 4.2 — Death Certificate Verification (`/beneficiary/verify`)

**Purpose:** Beneficiary uploads the death certificate to begin the final verification gate.

**Frontend:**
- Accessible from beneficiary locked portal
- Step 1: Instructions page — "Please upload the official death certificate. Download it from DigiLocker if you have one digitally."
- Step 2: DeathCertUploader — drag-and-drop PDF/image upload to Supabase Storage
- Step 3: Processing screen — "Verifying certificate with government records..."
- Step 4: Result — Verified ✅ or Rejected ❌ (with reason)
- After verification: "The vault owner will have 15 days to confirm they are alive. If no response, the vault will be unlocked."

**Backend (FastAPI — `POST /api/verification/submit`):**
```
Request: multipart/form-data (certificate file, owner_id, beneficiary_id)
Response: { submission_id, status, verification_result }
Action:
  1. Upload certificate to death-certificates Supabase Storage bucket
  2. Extract QR code from PDF/image using pillow + qrcode library
  3. Parse the CRS verification URL from QR code
  4. Simulate CRS verification (demo: check if name field matches vault owner name)
  5. If verified: create death_verification_submissions row (status=verified)
  6. Start 15-day liveness window: send "Are you alive?" email to vault owner
  7. Create vault_executions row (status=liveness_window_open)
  8. Log escalation change to level_4_death_claimed
```

---

### PAGE 4.3 — Beneficiary Portal — Locked (`/beneficiary/locked`)

**Purpose:** What a beneficiary sees before death is confirmed.

**Frontend:**
- After beneficiary login with their registered email
- Calm, minimal design — dark background, white text
- [APP_NAME] logo
- Message: "You have been registered in someone's [APP_NAME] vault."
- Subtext varies by disclosure_level:
  - total_secrecy: "This vault is currently active and protected. You will be notified if anything changes."
  - partial_awareness: "You have been named as a beneficiary. This vault is currently active."
  - full_transparency: "You are named as a beneficiary by [vault owner name]. This vault is currently active."
- Single CTA: "Report a suspected death" → navigates to /beneficiary/verify
- No asset information visible whatsoever

---

### PAGE 4.4 — Beneficiary Portal — Unlocked (`/beneficiary/package/[token]`)

**Purpose:** The full execution package delivered to each beneficiary after death is confirmed.

**Frontend:**

This is the most emotionally important page in the entire platform. Design must be calm, compassionate, and clear.

**PackageLetter component:**
- Full-width, centered, serif font (not a dashboard — a letter)
- Header: "[Vault owner's full name] prepared this for you."
- Subheader: "He/She wanted to make sure you were taken care of. Below is everything they left for you, and exactly what to do next."
- Date of passing shown

**Asset Package Cards (one per assigned asset):**
Each card:
- Asset name and type icon
- What they're receiving: e.g., "60% of HDFC Savings Account (ending in 4521)"
- Estimated value
- "What to do" accordion:
  - Specific step-by-step instructions for that asset type
  - Which office to visit
  - What documents to bring
  - Which form to submit (with download button)
- "Download Pre-filled Form" button → triggers PDF generation for that specific asset

**PersonalMessage box:** If vault owner left a personal note, shown in a styled blockquote with quotation marks. Different background colour. "A message from [name]:" header.

**CryptoSection (if applicable):**
- "Your crypto assets have been automatically routed to the wallet address on file."
- Shows simulated transaction reference
- Link to check wallet (etherscan-style link, simulated)

**DownloadAll button:** "Download All Forms (ZIP)" → FastAPI generates all relevant PDFs, zips them, returns for download.

**SupportSection:** "Need help? Our team is here." → Email + (in production) phone number.

**Backend (FastAPI):**
```
GET /api/execution/package/{token}
  Response: { owner_name, date_of_passing, assets: [...], personal_message, crypto_tx }
  Auth: Validates package_access_token from beneficiary_packages table

POST /api/documents/claim-form
  Request: { asset_id, beneficiary_id, execution_id }
  Response: { pdf_url (signed) }
  Action:
    1. Fetch asset details (decrypt)
    2. Fetch beneficiary details (decrypt)
    3. Fetch owner profile (decrypt)
    4. Fetch death certificate data
    5. Select correct PDF template based on asset type + institution name
    6. Fill all fields using ReportLab
    7. Upload to generated-documents bucket
    8. Return signed URL

POST /api/documents/claim-forms/all
  Request: { execution_id, beneficiary_id }
  Response: { zip_url (signed) }
  Action: Generate all forms for this beneficiary, zip them, return URL
```

---

## SECTION 5 — BACKEND-ONLY PROCESSES

These run on a schedule or in response to system events, not user actions.

---

### PROCESS 5.1 — Check-In Scheduler

**Trigger:** Cron job (Render cron, or external) — runs daily at 9:00 AM IST

**Logic (escalation_service.py):**
```
For each active vault owner:
  1. Skip if vacation_mode_active = true
  2. Calculate days since last_check_in_responded_at OR last_login_detected_at
  3. Compare against login_baseline_avg_gap_days
  4. If days_silent > check_in_frequency_days: send check-in email
  5. If check-in missed + days_silent > 2× threshold: escalate level
  6. Log all actions to check_in_events and escalation_log
```

**Backend endpoint (internal):**
```
POST /api/internal/run-checkins
  Auth: Internal API key (not user JWT)
  Action: Runs the scheduler logic above for all users
```

---

### PROCESS 5.2 — Liveness Window Monitor

**Trigger:** Cron job — runs every hour

**Logic:**
```
For each vault_executions row where status = liveness_window_open:
  1. Check if liveness_window_end < NOW()
  2. If yes AND liveness_challenge_responded = false:
     → Set vault_executions.status = executing
     → Call execution_service.execute_vault()
  3. If liveness_challenge_responded = true:
     → Set status = cancelled
     → Reset escalation to level_0_normal
     → Notify beneficiaries that the vault remains active
```

---

### PROCESS 5.3 — Vault Execution Orchestrator (execution_service.py)

**Triggered by:** Liveness window expiry (Process 5.2)

**Steps:**
```
1. Set vault status = executing
2. Fetch complete vault: assets, beneficiaries, mappings, owner profile
3. Simulate crypto routing:
   → For each crypto asset: generate fake tx hash, update asset record
4. Generate all documents:
   → Will document (final version)
   → Claim form for each asset × each primary beneficiary
5. Create beneficiary_packages rows with access tokens
6. Set all beneficiary statuses = unlocked
7. Send execution package email to each beneficiary
8. Set vault status = completed
9. Log escalation to level_5_executed
10. Log activity: vault.executed
```

---

## DEMO FLOW REFERENCE

**Pre-loaded demo state for Ramesh Iyer:**
- Email: `demo@amaanat.in` / Password: `Demo@1234`
- 4 assets, 4 beneficiaries, all mapped
- Video will transcript pre-processed
- Will document pre-generated (unsigned)
- Health score: 87 (will not signed = -15 points from max)
- Escalation: Level 0, last check-in 45 days ago

**3-minute judge demo path:**
1. Sign in → land on dashboard (health score 87, 4 assets, 3 beneficiaries visible)
2. Click "My Vault" → show 4 asset cards with beneficiary assignments
3. Click "Intent Declaration" → play pre-recorded video → click "Process" → watch AI extract 4 mappings
4. Click "Will Document" → show formatted will → click "Download PDF"
5. Switch to beneficiary account (kavitha.iyer@email.com) → show unlocked portal
6. Show HDFC claim form card → click "Download Pre-filled Form" → PDF appears with all details filled
7. Back to demo: show health score breakdown → point out "Will not signed" warning
