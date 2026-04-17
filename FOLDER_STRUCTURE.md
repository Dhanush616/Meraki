# [APP_NAME] — FOLDER STRUCTURE

---

## FRONTEND (Next.js 14 App Router)

```
app-name-frontend/
│
├── .env.local                          # Environment variables (never commit)
├── .env.example                        # Template for env vars (commit this)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                     # shadcn/ui config
├── package.json
│
├── public/
│   ├── logo.svg
│   ├── logo-dark.svg
│   ├── og-image.png                    # Open Graph image for social sharing
│   ├── icons/
│   │   ├── bank.svg
│   │   ├── property.svg
│   │   ├── insurance.svg
│   │   ├── crypto.svg
│   │   ├── mutual-fund.svg
│   │   └── other-asset.svg
│   └── illustrations/
│       ├── hero.svg
│       ├── vault.svg
│       └── family.svg
│
├── app/                                # Next.js App Router root
│   │
│   ├── layout.tsx                      # Root layout — fonts, theme provider, toaster
│   ├── page.tsx                        # → Landing page (/)
│   ├── globals.css
│   │
│   ├── (public)/                       # Route group — no auth required
│   │   ├── how-it-works/
│   │   │   └── page.tsx               # /how-it-works
│   │   ├── features/
│   │   │   └── page.tsx               # /features
│   │   ├── pricing/
│   │   │   └── page.tsx               # /pricing
│   │   └── faq/
│   │       └── page.tsx               # /faq
│   │
│   ├── auth/                           # Auth pages — redirect to /dashboard if already signed in
│   │   ├── layout.tsx                  # Centered card layout for all auth pages
│   │   ├── signup/
│   │   │   └── page.tsx               # /auth/signup
│   │   ├── signin/
│   │   │   └── page.tsx               # /auth/signin
│   │   ├── forgot-password/
│   │   │   └── page.tsx               # /auth/forgot-password
│   │   ├── reset-password/
│   │   │   └── page.tsx               # /auth/reset-password
│   │   ├── 2fa-setup/
│   │   │   └── page.tsx               # /auth/2fa-setup
│   │   └── 2fa-verify/
│   │       └── page.tsx               # /auth/2fa-verify
│   │
│   ├── dashboard/                      # Protected — vault owner only
│   │   ├── layout.tsx                  # Sidebar + topbar layout
│   │   ├── page.tsx                    # /dashboard — main overview
│   │   │
│   │   ├── vault/
│   │   │   ├── page.tsx               # /dashboard/vault — asset list
│   │   │   └── add/
│   │   │       └── page.tsx           # /dashboard/vault/add — add asset wizard
│   │   │
│   │   ├── beneficiaries/
│   │   │   └── page.tsx               # /dashboard/beneficiaries
│   │   │
│   │   ├── intent/
│   │   │   └── page.tsx               # /dashboard/intent — video will + AI
│   │   │
│   │   ├── will/
│   │   │   └── page.tsx               # /dashboard/will — generated will doc
│   │   │
│   │   ├── escalation/
│   │   │   └── page.tsx               # /dashboard/escalation — trigger settings
│   │   │
│   │   ├── health/
│   │   │   └── page.tsx               # /dashboard/health — health score detail
│   │   │
│   │   ├── security/
│   │   │   └── page.tsx               # /dashboard/security — 2FA, sessions
│   │   │
│   │   └── activity/
│   │       └── page.tsx               # /dashboard/activity — audit log
│   │
│   ├── guardian/                       # Guardian portal — separate auth
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx               # /guardian/login
│   │   └── portal/
│   │       └── page.tsx               # /guardian/portal
│   │
│   ├── beneficiary/                    # Beneficiary portal — token-based access
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx               # /beneficiary/login
│   │   ├── locked/
│   │   │   └── page.tsx               # /beneficiary/locked — waiting state
│   │   ├── verify/
│   │   │   └── page.tsx               # /beneficiary/verify — death cert upload
│   │   └── package/
│   │       └── [token]/
│   │           └── page.tsx           # /beneficiary/package/[token] — execution package
│   │
│   └── api/                            # Next.js API routes (lightweight — heavy logic in FastAPI)
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts           # Supabase OAuth callback handler
│       └── checkin/
│           └── [token]/
│               └── route.ts           # /api/checkin/[token] — "I'm alive" link handler
│
│
├── components/
│   │
│   ├── ui/                             # shadcn/ui base components (auto-generated, don't edit)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── progress.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── switch.tsx
│   │   ├── slider.tsx
│   │   ├── accordion.tsx
│   │   ├── alert.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   ├── textarea.tsx
│   │   ├── tooltip.tsx
│   │   └── sonner.tsx
│   │
│   ├── layout/                         # App-wide layout components
│   │   ├── Navbar.tsx                  # Public site navbar
│   │   ├── Footer.tsx                  # Public site footer
│   │   ├── DashboardSidebar.tsx        # Vault owner sidebar
│   │   ├── DashboardTopbar.tsx         # Top bar with user avatar + notifications
│   │   ├── MobileNav.tsx               # Bottom nav for mobile dashboard
│   │   └── PageHeader.tsx              # Reusable page title + breadcrumb
│   │
│   ├── landing/                        # Public site sections
│   │   ├── HeroSection.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── SolutionSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── FeaturesGrid.tsx
│   │   ├── StatsSection.tsx            # ₹1.5 lakh crore stat
│   │   ├── CompetitorTable.tsx
│   │   ├── PricingCards.tsx
│   │   ├── FAQAccordion.tsx
│   │   └── CTASection.tsx
│   │
│   ├── auth/                           # Auth form components
│   │   ├── SignUpForm.tsx
│   │   ├── SignInForm.tsx
│   │   ├── TwoFactorSetup.tsx
│   │   ├── TwoFactorVerify.tsx
│   │   ├── OTPInput.tsx                # 6-digit OTP input with auto-advance
│   │   └── AuthCard.tsx                # Wrapper card used on all auth pages
│   │
│   ├── dashboard/                      # Vault owner dashboard components
│   │   ├── overview/
│   │   │   ├── VaultHealthRing.tsx     # Circular health score indicator
│   │   │   ├── AssetSummaryCards.tsx   # Count cards per asset type
│   │   │   ├── QuickActions.tsx        # "Add Asset", "Record Will" buttons
│   │   │   ├── ActivityFeed.tsx        # Last 5 audit events
│   │   │   └── OnboardingChecklist.tsx # 7-step first-run checklist
│   │   │
│   │   ├── vault/
│   │   │   ├── AssetCard.tsx           # Individual asset display card
│   │   │   ├── AssetList.tsx           # Grouped asset list by category
│   │   │   ├── AssetDrawer.tsx         # Side drawer for viewing/editing asset
│   │   │   ├── AssetTypeIcon.tsx       # Icon switcher by asset type
│   │   │   ├── AddAssetWizard.tsx      # Multi-step asset creation form
│   │   │   ├── steps/
│   │   │   │   ├── Step1TypeSelect.tsx
│   │   │   │   ├── Step2AssetDetails.tsx
│   │   │   │   ├── Step3AssignBeneficiary.tsx
│   │   │   │   └── Step4Review.tsx
│   │   │   └── AllocationWarning.tsx   # Shows if % doesn't add to 100
│   │   │
│   │   ├── beneficiaries/
│   │   │   ├── BeneficiaryTable.tsx
│   │   │   ├── BeneficiaryDrawer.tsx
│   │   │   ├── AddBeneficiaryForm.tsx
│   │   │   ├── DisclosureBadge.tsx     # Color-coded disclosure level badge
│   │   │   ├── AllocationOverview.tsx  # Per-asset allocation totals
│   │   │   └── MinorWarning.tsx
│   │   │
│   │   ├── intent/
│   │   │   ├── VideoRecorder.tsx       # In-browser MediaRecorder component
│   │   │   ├── VideoUploader.tsx       # Drag-and-drop video upload
│   │   │   ├── TranscriptDisplay.tsx   # Shows Gemini transcript
│   │   │   ├── MappingCard.tsx         # Shows one AI-extracted mapping
│   │   │   ├── ConflictResolver.tsx    # UI to resolve unmatched AI extractions
│   │   │   └── WrittenIntentForm.tsx   # Text-based alternative
│   │   │
│   │   ├── will/
│   │   │   ├── WillPreview.tsx         # Formatted document preview
│   │   │   ├── SigningChecklist.tsx    # Print → Sign → Witness checklist
│   │   │   └── WillVersionHistory.tsx  # Past versions list
│   │   │
│   │   ├── escalation/
│   │   │   ├── EscalationLadder.tsx    # Visual timeline of 5 levels
│   │   │   ├── CheckInFrequency.tsx    # Frequency slider
│   │   │   ├── VacationMode.tsx        # Date range picker
│   │   │   ├── EmergencyContactForm.tsx
│   │   │   └── BeneficiaryContactOrder.tsx  # Drag-to-reorder list
│   │   │
│   │   ├── health/
│   │   │   ├── HealthFactorRow.tsx     # One factor with status + action button
│   │   │   └── HealthHistory.tsx       # Score over time chart
│   │   │
│   │   └── security/
│   │       ├── TwoFactorManager.tsx    # Enable/disable 2FA methods
│   │       ├── SessionTable.tsx        # Active sessions with revoke button
│   │       └── VaultExportButton.tsx   # Download encrypted vault backup
│   │
│   ├── beneficiary/                    # Beneficiary portal components
│   │   ├── LockedPortalCard.tsx
│   │   ├── DeathCertUploader.tsx
│   │   ├── PackageLetter.tsx           # The compassionate letter UI
│   │   ├── AssetPackageCard.tsx        # One asset + instructions card
│   │   └── FormDownloadButton.tsx
│   │
│   └── shared/                         # Used everywhere
│       ├── EncryptedField.tsx          # Input that encrypts on blur
│       ├── MaskedValue.tsx             # Shows ••••1234 with reveal toggle
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ConfirmDialog.tsx
│       ├── StatusBadge.tsx
│       └── SectionDivider.tsx
│
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server-side Supabase client (for Server Components)
│   │   └── middleware.ts               # Auth middleware for protected routes
│   │
│   ├── encryption/
│   │   └── client.ts                   # Web Crypto API wrapper — encrypt/decrypt field values
│   │
│   ├── api/
│   │   └── client.ts                   # Typed fetch wrapper for FastAPI calls
│   │
│   ├── utils/
│   │   ├── format.ts                   # Currency, date, file size formatters
│   │   ├── validators.ts               # Zod schemas for all forms
│   │   ├── health.ts                   # Vault health score calculation logic
│   │   └── cn.ts                       # clsx + tailwind-merge utility
│   │
│   └── constants/
│       ├── assetTypes.ts               # Asset type metadata (label, icon, fields)
│       ├── relationships.ts            # Relationship enum labels
│       ├── formTemplates.ts            # Which PDF form each asset type uses
│       └── routes.ts                   # All route constants
│
│
├── hooks/
│   ├── useUser.ts                      # Current user + profile
│   ├── useVaultSummary.ts              # Dashboard overview data
│   ├── useAssets.ts                    # Asset list + CRUD
│   ├── useBeneficiaries.ts             # Beneficiary list + CRUD
│   ├── useHealthScore.ts               # Latest health snapshot
│   ├── useEscalationSettings.ts        # Escalation config
│   ├── useActivityLog.ts               # Activity feed
│   └── useMediaRecorder.ts             # Video recording hook
│
│
├── types/
│   ├── database.ts                     # Auto-generated Supabase types (via CLI)
│   ├── api.ts                          # FastAPI request/response types
│   └── app.ts                          # App-specific shared types
│
│
└── middleware.ts                       # Next.js middleware — auth guard for /dashboard


```

---

## BACKEND (FastAPI)

```
app-name-backend/
│
├── .env                                # Environment variables (never commit)
├── .env.example
├── .gitignore
├── requirements.txt
├── Procfile                            # For Render: "web: uvicorn main:app --host 0.0.0.0 --port $PORT"
├── render.yaml                         # Render deployment config
│
├── main.py                             # FastAPI app entry point, router includes, CORS config
│
├── core/
│   ├── config.py                       # Settings via pydantic-settings (reads .env)
│   ├── security.py                     # JWT creation/verification, password hashing
│   ├── encryption.py                   # AES-256 encrypt/decrypt for stored fields
│   ├── supabase.py                     # Supabase client init (service role)
│   └── dependencies.py                 # FastAPI dependency injection (get_current_user, etc.)
│
├── routers/
│   ├── health.py                       # GET /health — liveness check
│   ├── assets.py                       # Asset CRUD endpoints
│   ├── beneficiaries.py                # Beneficiary CRUD endpoints
│   ├── intent.py                       # Video upload, Gemini processing
│   ├── documents.py                    # Will + claim form PDF generation
│   ├── escalation.py                   # Check-in, escalation management
│   ├── verification.py                 # Death certificate upload + QR check
│   ├── execution.py                    # Vault execution, package generation
│   ├── notifications.py                # Notification dispatch
│   └── admin.py                        # Internal team endpoints (protected)
│
├── services/
│   ├── gemini_service.py               # Gemini API calls, transcript parsing, JSON extraction
│   ├── pdf_service.py                  # ReportLab PDF generation for each document type
│   ├── storage_service.py              # Supabase Storage upload/download/signed URLs
│   ├── encryption_service.py           # Field-level encrypt/decrypt helpers
│   ├── health_service.py               # Vault health score calculation
│   ├── escalation_service.py           # Escalation ladder logic
│   ├── verification_service.py         # Death certificate QR parsing + CRS check
│   ├── notification_service.py         # Email/SMS dispatch (simulated in demo)
│   └── execution_service.py            # Full vault execution orchestrator
│
├── models/
│   ├── asset.py                        # Pydantic models for asset request/response
│   ├── beneficiary.py
│   ├── intent.py
│   ├── document.py
│   ├── escalation.py
│   ├── verification.py
│   └── execution.py
│
├── templates/
│   ├── pdf/
│   │   ├── will_template.py            # Legal will document template (ReportLab)
│   │   ├── bank_claim_sbi.py           # SBI claim form template
│   │   ├── bank_claim_hdfc.py          # HDFC claim form template
│   │   ├── succession_petition.py      # Succession certificate petition
│   │   ├── legal_heir_application.py   # Legal heir certificate application
│   │   ├── insurance_claim.py          # Generic insurance claim form
│   │   └── property_mutation.py        # Property mutation application
│   │
│   └── email/
│       ├── checkin_email.html          # Quarterly check-in email template
│       ├── escalation_alert.html       # Owner alert (missed check-in)
│       ├── beneficiary_contact.html    # Initial beneficiary contact
│       ├── liveness_challenge.html     # "Are you alive?" email
│       └── package_ready.html          # Execution package delivery email
│
└── utils/
    ├── validators.py                   # Shared validation helpers
    ├── formatters.py                   # Indian number/date formatting
    └── logger.py                       # Structured logging setup
```

---

## KEY CONFIGURATION FILES

### next.config.ts
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ]
      }
    ]
  }
}

export default nextConfig
```

### middleware.ts (Next.js root)
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/guardian/portal']
const AUTH_ROUTES = ['/auth/signin', '/auth/signup']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const isProtected = PROTECTED_ROUTES.some(r => req.nextUrl.pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => req.nextUrl.pathname.startsWith(r))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/guardian/portal/:path*']
}
```

### main.py (FastAPI)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from routers import (
    health, assets, beneficiaries, intent,
    documents, escalation, verification, execution
)

app = FastAPI(
    title="[APP_NAME] API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(beneficiaries.router, prefix="/api/beneficiaries", tags=["Beneficiaries"])
app.include_router(intent.router, prefix="/api/intent", tags=["Intent"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(escalation.router, prefix="/api/escalation", tags=["Escalation"])
app.include_router(verification.router, prefix="/api/verification", tags=["Verification"])
app.include_router(execution.router, prefix="/api/execution", tags=["Execution"])
```
