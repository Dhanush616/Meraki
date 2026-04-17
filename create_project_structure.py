import os

file_paths = [
    # Frontend files
    "app-name-frontend/.env.local",
    "app-name-frontend/.env.example",
    "app-name-frontend/.gitignore",
    "app-name-frontend/next.config.ts",
    "app-name-frontend/tailwind.config.ts",
    "app-name-frontend/tsconfig.json",
    "app-name-frontend/components.json",
    "app-name-frontend/package.json",
    "app-name-frontend/middleware.ts",
    "app-name-frontend/public/logo.svg",
    "app-name-frontend/public/logo-dark.svg",
    "app-name-frontend/public/og-image.png",
    "app-name-frontend/public/icons/bank.svg",
    "app-name-frontend/public/icons/property.svg",
    "app-name-frontend/public/icons/insurance.svg",
    "app-name-frontend/public/icons/crypto.svg",
    "app-name-frontend/public/icons/mutual-fund.svg",
    "app-name-frontend/public/icons/other-asset.svg",
    "app-name-frontend/public/illustrations/hero.svg",
    "app-name-frontend/public/illustrations/vault.svg",
    "app-name-frontend/public/illustrations/family.svg",
    "app-name-frontend/app/layout.tsx",
    "app-name-frontend/app/page.tsx",
    "app-name-frontend/app/globals.css",
    "app-name-frontend/app/(public)/how-it-works/page.tsx",
    "app-name-frontend/app/(public)/features/page.tsx",
    "app-name-frontend/app/(public)/pricing/page.tsx",
    "app-name-frontend/app/(public)/faq/page.tsx",
    "app-name-frontend/app/auth/layout.tsx",
    "app-name-frontend/app/auth/signup/page.tsx",
    "app-name-frontend/app/auth/signin/page.tsx",
    "app-name-frontend/app/auth/forgot-password/page.tsx",
    "app-name-frontend/app/auth/reset-password/page.tsx",
    "app-name-frontend/app/auth/2fa-setup/page.tsx",
    "app-name-frontend/app/auth/2fa-verify/page.tsx",
    "app-name-frontend/app/dashboard/layout.tsx",
    "app-name-frontend/app/dashboard/page.tsx",
    "app-name-frontend/app/dashboard/vault/page.tsx",
    "app-name-frontend/app/dashboard/vault/add/page.tsx",
    "app-name-frontend/app/dashboard/beneficiaries/page.tsx",
    "app-name-frontend/app/dashboard/intent/page.tsx",
    "app-name-frontend/app/dashboard/will/page.tsx",
    "app-name-frontend/app/dashboard/escalation/page.tsx",
    "app-name-frontend/app/dashboard/health/page.tsx",
    "app-name-frontend/app/dashboard/security/page.tsx",
    "app-name-frontend/app/dashboard/activity/page.tsx",
    "app-name-frontend/app/guardian/layout.tsx",
    "app-name-frontend/app/guardian/login/page.tsx",
    "app-name-frontend/app/guardian/portal/page.tsx",
    "app-name-frontend/app/beneficiary/layout.tsx",
    "app-name-frontend/app/beneficiary/login/page.tsx",
    "app-name-frontend/app/beneficiary/locked/page.tsx",
    "app-name-frontend/app/beneficiary/verify/page.tsx",
    "app-name-frontend/app/beneficiary/package/[token]/page.tsx",
    "app-name-frontend/app/api/auth/callback/route.ts",
    "app-name-frontend/app/api/checkin/[token]/route.ts",
    "app-name-frontend/components/ui/button.tsx",
    "app-name-frontend/components/ui/card.tsx",
    "app-name-frontend/components/ui/dialog.tsx",
    "app-name-frontend/components/ui/input.tsx",
    "app-name-frontend/components/ui/label.tsx",
    "app-name-frontend/components/ui/select.tsx",
    "app-name-frontend/components/ui/tabs.tsx",
    "app-name-frontend/components/ui/progress.tsx",
    "app-name-frontend/components/ui/badge.tsx",
    "app-name-frontend/components/ui/avatar.tsx",
    "app-name-frontend/components/ui/switch.tsx",
    "app-name-frontend/components/ui/slider.tsx",
    "app-name-frontend/components/ui/accordion.tsx",
    "app-name-frontend/components/ui/alert.tsx",
    "app-name-frontend/components/ui/alert-dialog.tsx",
    "app-name-frontend/components/ui/separator.tsx",
    "app-name-frontend/components/ui/sheet.tsx",
    "app-name-frontend/components/ui/skeleton.tsx",
    "app-name-frontend/components/ui/table.tsx",
    "app-name-frontend/components/ui/textarea.tsx",
    "app-name-frontend/components/ui/tooltip.tsx",
    "app-name-frontend/components/ui/sonner.tsx",
    "app-name-frontend/components/layout/Navbar.tsx",
    "app-name-frontend/components/layout/Footer.tsx",
    "app-name-frontend/components/layout/DashboardSidebar.tsx",
    "app-name-frontend/components/layout/DashboardTopbar.tsx",
    "app-name-frontend/components/layout/MobileNav.tsx",
    "app-name-frontend/components/layout/PageHeader.tsx",
    "app-name-frontend/components/landing/HeroSection.tsx",
    "app-name-frontend/components/landing/ProblemSection.tsx",
    "app-name-frontend/components/landing/SolutionSection.tsx",
    "app-name-frontend/components/landing/HowItWorksSection.tsx",
    "app-name-frontend/components/landing/FeaturesGrid.tsx",
    "app-name-frontend/components/landing/StatsSection.tsx",
    "app-name-frontend/components/landing/CompetitorTable.tsx",
    "app-name-frontend/components/landing/PricingCards.tsx",
    "app-name-frontend/components/landing/FAQAccordion.tsx",
    "app-name-frontend/components/landing/CTASection.tsx",
    "app-name-frontend/components/auth/SignUpForm.tsx",
    "app-name-frontend/components/auth/SignInForm.tsx",
    "app-name-frontend/components/auth/TwoFactorSetup.tsx",
    "app-name-frontend/components/auth/TwoFactorVerify.tsx",
    "app-name-frontend/components/auth/OTPInput.tsx",
    "app-name-frontend/components/auth/AuthCard.tsx",
    "app-name-frontend/components/dashboard/overview/VaultHealthRing.tsx",
    "app-name-frontend/components/dashboard/overview/AssetSummaryCards.tsx",
    "app-name-frontend/components/dashboard/overview/QuickActions.tsx",
    "app-name-frontend/components/dashboard/overview/ActivityFeed.tsx",
    "app-name-frontend/components/dashboard/overview/OnboardingChecklist.tsx",
    "app-name-frontend/components/dashboard/vault/AssetCard.tsx",
    "app-name-frontend/components/dashboard/vault/AssetList.tsx",
    "app-name-frontend/components/dashboard/vault/AssetDrawer.tsx",
    "app-name-frontend/components/dashboard/vault/AssetTypeIcon.tsx",
    "app-name-frontend/components/dashboard/vault/AddAssetWizard.tsx",
    "app-name-frontend/components/dashboard/vault/steps/Step1TypeSelect.tsx",
    "app-name-frontend/components/dashboard/vault/steps/Step2AssetDetails.tsx",
    "app-name-frontend/components/dashboard/vault/steps/Step3AssignBeneficiary.tsx",
    "app-name-frontend/components/dashboard/vault/steps/Step4Review.tsx",
    "app-name-frontend/components/dashboard/vault/AllocationWarning.tsx",
    "app-name-frontend/components/dashboard/beneficiaries/BeneficiaryTable.tsx",
    "app-name-frontend/components/dashboard/beneficiaries/BeneficiaryDrawer.tsx",
    "app-name-frontend/components/dashboard/beneficiaries/AddBeneficiaryForm.tsx",
    "app-name-frontend/components/dashboard/beneficiaries/DisclosureBadge.tsx",
    "app-name-frontend/components/dashboard/beneficiaries/AllocationOverview.tsx",
    "app-name-frontend/components/dashboard/beneficiaries/MinorWarning.tsx",
    "app-name-frontend/components/dashboard/intent/VideoRecorder.tsx",
    "app-name-frontend/components/dashboard/intent/VideoUploader.tsx",
    "app-name-frontend/components/dashboard/intent/TranscriptDisplay.tsx",
    "app-name-frontend/components/dashboard/intent/MappingCard.tsx",
    "app-name-frontend/components/dashboard/intent/ConflictResolver.tsx",
    "app-name-frontend/components/dashboard/intent/WrittenIntentForm.tsx",
    "app-name-frontend/components/dashboard/will/WillPreview.tsx",
    "app-name-frontend/components/dashboard/will/SigningChecklist.tsx",
    "app-name-frontend/components/dashboard/will/WillVersionHistory.tsx",
    "app-name-frontend/components/dashboard/escalation/EscalationLadder.tsx",
    "app-name-frontend/components/dashboard/escalation/CheckInFrequency.tsx",
    "app-name-frontend/components/dashboard/escalation/VacationMode.tsx",
    "app-name-frontend/components/dashboard/escalation/EmergencyContactForm.tsx",
    "app-name-frontend/components/dashboard/escalation/BeneficiaryContactOrder.tsx",
    "app-name-frontend/components/dashboard/health/HealthFactorRow.tsx",
    "app-name-frontend/components/dashboard/health/HealthHistory.tsx",
    "app-name-frontend/components/dashboard/security/TwoFactorManager.tsx",
    "app-name-frontend/components/dashboard/security/SessionTable.tsx",
    "app-name-frontend/components/dashboard/security/VaultExportButton.tsx",
    "app-name-frontend/components/beneficiary/LockedPortalCard.tsx",
    "app-name-frontend/components/beneficiary/DeathCertUploader.tsx",
    "app-name-frontend/components/beneficiary/PackageLetter.tsx",
    "app-name-frontend/components/beneficiary/AssetPackageCard.tsx",
    "app-name-frontend/components/beneficiary/FormDownloadButton.tsx",
    "app-name-frontend/components/shared/EncryptedField.tsx",
    "app-name-frontend/components/shared/MaskedValue.tsx",
    "app-name-frontend/components/shared/LoadingSpinner.tsx",
    "app-name-frontend/components/shared/EmptyState.tsx",
    "app-name-frontend/components/shared/ConfirmDialog.tsx",
    "app-name-frontend/components/shared/StatusBadge.tsx",
    "app-name-frontend/components/shared/SectionDivider.tsx",
    "app-name-frontend/lib/supabase/client.ts",
    "app-name-frontend/lib/supabase/server.ts",
    "app-name-frontend/lib/supabase/middleware.ts",
    "app-name-frontend/lib/encryption/client.ts",
    "app-name-frontend/lib/api/client.ts",
    "app-name-frontend/lib/utils/format.ts",
    "app-name-frontend/lib/utils/validators.ts",
    "app-name-frontend/lib/utils/health.ts",
    "app-name-frontend/lib/utils/cn.ts",
    "app-name-frontend/lib/constants/assetTypes.ts",
    "app-name-frontend/lib/constants/relationships.ts",
    "app-name-frontend/lib/constants/formTemplates.ts",
    "app-name-frontend/lib/constants/routes.ts",
    "app-name-frontend/hooks/useUser.ts",
    "app-name-frontend/hooks/useVaultSummary.ts",
    "app-name-frontend/hooks/useAssets.ts",
    "app-name-frontend/hooks/useBeneficiaries.ts",
    "app-name-frontend/hooks/useHealthScore.ts",
    "app-name-frontend/hooks/useEscalationSettings.ts",
    "app-name-frontend/hooks/useActivityLog.ts",
    "app-name-frontend/hooks/useMediaRecorder.ts",
    "app-name-frontend/types/database.ts",
    "app-name-frontend/types/api.ts",
    "app-name-frontend/types/app.ts",
    
    # Backend files
    "app-name-backend/.env",
    "app-name-backend/.env.example",
    "app-name-backend/.gitignore",
    "app-name-backend/requirements.txt",
    "app-name-backend/Procfile",
    "app-name-backend/render.yaml",
    "app-name-backend/main.py",
    "app-name-backend/core/config.py",
    "app-name-backend/core/security.py",
    "app-name-backend/core/encryption.py",
    "app-name-backend/core/supabase.py",
    "app-name-backend/core/dependencies.py",
    "app-name-backend/routers/health.py",
    "app-name-backend/routers/assets.py",
    "app-name-backend/routers/beneficiaries.py",
    "app-name-backend/routers/intent.py",
    "app-name-backend/routers/documents.py",
    "app-name-backend/routers/escalation.py",
    "app-name-backend/routers/verification.py",
    "app-name-backend/routers/execution.py",
    "app-name-backend/routers/notifications.py",
    "app-name-backend/routers/admin.py",
    "app-name-backend/services/gemini_service.py",
    "app-name-backend/services/pdf_service.py",
    "app-name-backend/services/storage_service.py",
    "app-name-backend/services/encryption_service.py",
    "app-name-backend/services/health_service.py",
    "app-name-backend/services/escalation_service.py",
    "app-name-backend/services/verification_service.py",
    "app-name-backend/services/notification_service.py",
    "app-name-backend/services/execution_service.py",
    "app-name-backend/models/asset.py",
    "app-name-backend/models/beneficiary.py",
    "app-name-backend/models/intent.py",
    "app-name-backend/models/document.py",
    "app-name-backend/models/escalation.py",
    "app-name-backend/models/verification.py",
    "app-name-backend/models/execution.py",
    "app-name-backend/templates/pdf/will_template.py",
    "app-name-backend/templates/pdf/bank_claim_sbi.py",
    "app-name-backend/templates/pdf/bank_claim_hdfc.py",
    "app-name-backend/templates/pdf/succession_petition.py",
    "app-name-backend/templates/pdf/legal_heir_application.py",
    "app-name-backend/templates/pdf/insurance_claim.py",
    "app-name-backend/templates/pdf/property_mutation.py",
    "app-name-backend/templates/email/checkin_email.html",
    "app-name-backend/templates/email/escalation_alert.html",
    "app-name-backend/templates/email/beneficiary_contact.html",
    "app-name-backend/templates/email/liveness_challenge.html",
    "app-name-backend/templates/email/package_ready.html",
    "app-name-backend/utils/validators.py",
    "app-name-backend/utils/formatters.py",
    "app-name-backend/utils/logger.py"
]

file_contents = {
    "app-name-frontend/next.config.ts": """import type { NextConfig } from 'next'

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
""",
    "app-name-frontend/middleware.ts": """import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
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
""",
    "app-name-backend/main.py": """from fastapi import FastAPI
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
"""
}

def create_structure():
    base_dir = r"c:\Meraki"
    print(f"Creating project structure in: {base_dir}")
    for file_path in file_paths:
        full_path = os.path.join(base_dir, file_path)
        # Create directories if they don't exist
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        # Create empty file or file with predefined content
        content = file_contents.get(file_path, "")
        with open(full_path, "w", encoding='utf-8') as f:
            f.write(content)
        print(f"Created: {file_path}")

if __name__ == "__main__":
    create_structure()
    print("Project structure generation completed successfully.")
