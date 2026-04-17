# [APP_NAME] — DEVELOPMENT PLAN
> Last updated: April 2026  
> Stack: Next.js 14 · FastAPI · Supabase · Gemini AI · Polygon (simulated)  
> Target: 36-hour hackathon prototype → production-ready roadmap

---

## TABLE OF CONTENTS
1. [Tech Stack](#tech-stack)
2. [Environment Variables](#environment-variables)
3. [Dependencies](#dependencies)
4. [Development Phases](#development-phases)
5. [Phase Priority for Hackathon](#phase-priority-for-hackathon)

---

## TECH STACK

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR, file-based routing, API routes |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, accessible components |
| Animation | Framer Motion | Smooth transitions, demo polish |
| Forms | React Hook Form + Zod | Validated forms with minimal boilerplate |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage + RLS in one |
| Backend | Python FastAPI on Render | Async, typed, fast to build |
| AI | Google Gemini API | Video transcript parsing, intent extraction |
| PDF | ReportLab (Python) | Server-side PDF generation |
| Encryption | Web Crypto API (client) + cryptography lib (server) | Zero-knowledge field encryption |
| Web3 | ethers.js (simulated) | Fake wallet addresses, no real blockchain |
| Hosting | Vercel (frontend) + Render (backend) | Free tier, fast deploys |

---

## ENVIRONMENT VARIABLES

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=https://your-app.onrender.com
NEXT_PUBLIC_APP_NAME=[APP_NAME]
NEXT_PUBLIC_APP_ENV=development
```

### Backend (.env)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=        # Never expose this to frontend
GEMINI_API_KEY=
ENCRYPTION_MASTER_KEY=            # 32-byte hex string for AES-256
JWT_SECRET=                       # For signing package access tokens
FRONTEND_URL=https://your-app.vercel.app
ENVIRONMENT=development
```

---

## DEPENDENCIES

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18.3.x",
    "react-dom": "^18.3.x",
    "typescript": "^5.x",

    "@supabase/supabase-js": "^2.x",
    "@supabase/auth-helpers-nextjs": "^0.x",
    "@supabase/auth-helpers-react": "^0.x",

    "tailwindcss": "^3.x",
    "tailwind-merge": "^2.x",
    "tailwindcss-animate": "^1.x",
    "@tailwindcss/forms": "^0.x",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",

    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-slider": "^1.x",
    "@radix-ui/react-tabs": "^1.x",
    "@radix-ui/react-accordion": "^1.x",
    "@radix-ui/react-progress": "^1.x",
    "@radix-ui/react-tooltip": "^1.x",
    "@radix-ui/react-avatar": "^1.x",
    "@radix-ui/react-switch": "^1.x",
    "@radix-ui/react-alert-dialog": "^1.x",

    "framer-motion": "^11.x",
    "lucide-react": "^0.383.0",
    "next-themes": "^0.x",

    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",

    "react-dropzone": "^14.x",
    "date-fns": "^3.x",
    "recharts": "^2.x",

    "otplib": "^12.x",
    "qrcode.react": "^3.x",

    "ethers": "^6.x",

    "sonner": "^1.x",

    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x"
  }
}
```

### Backend (requirements.txt)
```
fastapi==0.111.x
uvicorn[standard]==0.30.x
python-jose[cryptography]==3.3.x
passlib[bcrypt]==1.7.x
supabase==2.x.x
google-generativeai==0.7.x
reportlab==4.x.x
fpdf2==2.x.x
python-multipart==0.0.x
cryptography==42.x.x
pillow==10.x.x
python-dotenv==1.0.x
pydantic==2.x.x
pydantic-settings==2.x.x
httpx==0.27.x
aiofiles==23.x.x
python-dateutil==2.x.x
qrcode==7.x.x
```

---

## DEVELOPMENT PHASES

---

### PHASE 0 — PROJECT SETUP
**Goal:** Every team member can run the app locally and push to the same repo.  
**Time estimate:** 2 hours

**Tasks:**
- [ ] Create GitHub repo, invite all members, set up branch protection on `main`
- [ ] Scaffold Next.js app: `npx create-next-app@latest --typescript --tailwind --app`
- [ ] Install all frontend dependencies
- [ ] Set up shadcn/ui: `npx shadcn-ui@latest init`
- [ ] Create FastAPI project with folder structure (see FOLDER_STRUCTURE.md)
- [ ] Install all backend dependencies
- [ ] Set up `.env.local` and `.env` from the variables above
- [ ] Connect Supabase — test that `supabase.auth.getSession()` works
- [ ] Deploy blank Next.js to Vercel — confirm it builds
- [ ] Deploy blank FastAPI to Render — confirm `/health` returns 200
- [ ] Set up shared Notion/Figma for component reference (optional but helpful)

---

### PHASE 1 — DISPLAY WEBSITE (Public Pages)
**Goal:** A polished, fully responsive marketing site that communicates the product.  
**Pages:** Landing, How It Works, Features, Pricing, FAQ  
**Time estimate:** 6–8 hours

See PAGES_AND_FEATURES.md → Section 1 for full page-by-page breakdown.

**Key deliverables:**
- Fully mobile-responsive (test at 375px, 768px, 1280px)
- Dark mode support via next-themes
- Smooth scroll animations via Framer Motion
- Working nav with mobile hamburger menu
- All CTAs point to `/auth/signup`

---

### PHASE 2 — AUTHENTICATION
**Goal:** Secure sign up, sign in, and 2FA flow.  
**Pages:** Sign Up, Sign In, 2FA Setup, 2FA Verify, Forgot Password  
**Time estimate:** 4–5 hours

See PAGES_AND_FEATURES.md → Section 2 for full breakdown.

**Key deliverables:**
- Supabase Auth fully integrated
- Email OTP working (Supabase built-in, free)
- SMS OTP and Authenticator App as simulated demo UI
- JWT session stored in httpOnly cookie
- Protected route middleware
- Redirect to `/dashboard` on successful auth

---

### PHASE 3 — VAULT OWNER DASHBOARD
**Goal:** The full vault management experience for the logged-in user.  
**Pages:** Dashboard, Vault, Add Asset, Beneficiaries, Intent Declaration, Will Document, Escalation Settings, Security, Health Score, Activity Log  
**Time estimate:** 14–16 hours

See PAGES_AND_FEATURES.md → Section 3 for full breakdown.

**Key deliverables:**
- All 10 dashboard pages built and navigable
- Asset CRUD fully working
- Beneficiary CRUD with percentage assignment
- Video upload + Gemini intent parsing
- Will document PDF generation and download
- Vault health score calculated and displayed
- Escalation settings configurable

---

### PHASE 4 — EXECUTION FLOW
**Goal:** The trigger, verification, and beneficiary delivery experience.  
**Pages:** Guardian Portal, Death Certificate Upload, Liveness Window, Beneficiary Portal (Locked + Unlocked)  
**Time estimate:** 6–8 hours

See PAGES_AND_FEATURES.md → Section 4 for full breakdown.

**Key deliverables:**
- Death certificate upload and simulated QR verification
- 30-day liveness window UI
- Beneficiary locked portal
- Beneficiary unlocked portal with execution package
- Pre-filled PDF form generation for each asset
- Simulated crypto routing display

---

### PHASE 5 — POLISH, DEMO PREP, PITCH
**Goal:** Seamless demo flow, no broken states, Ramesh Iyer story complete.  
**Time estimate:** 4–6 hours

**Tasks:**
- [ ] Seed Ramesh Iyer demo account to full completion state
- [ ] Write and rehearse 3-minute demo script
- [ ] Fix all broken states and loading issues
- [ ] Add skeleton loaders to all data-fetching pages
- [ ] Error boundaries on all pages
- [ ] Mobile test every page at 375px
- [ ] Build pitch deck (5 slides max)
- [ ] Pre-record video will clip for demo

---

## PHASE PRIORITY FOR HACKATHON

If time runs short, cut in this order — last items are least critical:

| Priority | Feature | Why |
|---|---|---|
| 🔴 Must have | Dashboard + Vault + Asset CRUD | Core demo moment |
| 🔴 Must have | Beneficiary assignment | Core demo moment |
| 🔴 Must have | PDF generation (will + 1 claim form) | Core demo moment |
| 🔴 Must have | Gemini intent parsing | Core demo moment |
| 🟡 Should have | Unlocked beneficiary portal | Strong demo finish |
| 🟡 Should have | Vault health score | Judges love metrics |
| 🟡 Should have | Death cert upload + verification | Explains the trigger |
| 🟢 Nice to have | 2FA (beyond email OTP) | Demo UI is fine |
| 🟢 Nice to have | Escalation settings page | Explainable verbally |
| 🟢 Nice to have | Activity log | Background feature |
| 🟢 Nice to have | Guardian portal | Explainable verbally |
| ⚪ Cut if needed | Forgot password flow | Not in demo path |
| ⚪ Cut if needed | Vacation mode | Explainable verbally |
| ⚪ Cut if needed | Crypto simulation UI | Explainable verbally |
