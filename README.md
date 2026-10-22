# Meraki 🪶

A digital legacy & inheritance platform: securely manage your assets, guardians, and beneficiaries, and pass on what matters — including wills, insurance claims, bank claims, and legal-heir documents — when the time comes.

## Architecture

| Layer | Tech | Where it runs |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind + Supabase JS | **Vercel** |
| Backend | Python FastAPI | **Render** (see `backend/render.yaml`) |
| Database / Auth | Supabase (Postgres + Auth + Storage) | Supabase Cloud |

> **Note:** Supabase only provides the database, auth, and storage. The FastAPI backend (AI features, PDF generation, vault execution logic) still needs its own host — `render.yaml` is included to deploy it on Render with one click.

## Project Structure

```
Meraki/
├── frontend/          # Next.js app (deploy to Vercel)
│   ├── app/           # Routes (dashboard, guardian, beneficiary, auth, ...)
│   ├── components/    # UI components (shadcn-style)
│   ├── hooks/         # Data hooks (assets, beneficiaries, security, ...)
│   └── lib/           # Supabase clients, utils, constants
├── backend/           # FastAPI app (deploy to Render)
│   ├── routers/       # API endpoints (assets, vault, guardian, ...)
│   ├── services/      # Business logic
│   └── templates/     # PDF document templates
└── database_schema.sql / schema.sql / will_documents_schema.sql
```

## Local Development

### 1. Frontend

```bash
cd frontend
npm install

# Create your local env file (never commit it)
cp .env.example .env.local

npm run dev
```

Runs at http://localhost:3000.

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

cp .env.example .env
uvicorn main:app --reload
```

Runs at http://localhost:8000 (API docs at `/docs` in development).

## Environment Variables

> ⚠️ **Never commit real `.env` files.** They are git-ignored; use the tracked `.env.example` files as templates and keep real values in a password manager. `NEXT_PUBLIC_*` values are compiled into the browser bundle — only put public values there.

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon** (public) key |
| `NEXT_PUBLIC_API_URL` | FastAPI backend base URL (e.g. `https://meraki-backend.onrender.com` in production) |
| `NEXT_PUBLIC_APP_NAME` | App name shown in the UI |
| `NEXT_PUBLIC_APP_ENV` | `development` or `production` |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service-role** key — server-only, bypasses RLS |
| `GEMINI_API_KEY` | Google Gemini API key (AI features) |
| `ENCRYPTION_MASTER_KEY` | 32-byte hex key for encrypting vault data |
| `JWT_SECRET` | Secret for signing tokens |
| `FRONTEND_URL` | Allowed frontend origin(s) for CORS & links — comma-separated, e.g. `https://meraki.vercel.app,http://localhost:3000` |
| `ENVIRONMENT` | `development` or `production` (disables `/docs` in production) |

## Deploying to Vercel (Frontend)

Because the Next.js app lives in `frontend/`, Vercel must be told where to build:

1. Push the repo to GitHub, then import it in Vercel (**Add New → Project**).
2. **Root Directory** → set to `frontend` (Project Settings → General, or when configuring the project during import).
3. In **Settings → Environment Variables**, add all `NEXT_PUBLIC_*` variables above for **Production, Preview, and Development**.
   - `NEXT_PUBLIC_API_URL` must be your deployed backend URL (e.g. Render URL), **not** `http://localhost:8000` — localhost won't work for visitors.
   - `NEXT_PUBLIC_*` variables are inlined at **build time**: after changing them, trigger a redeploy.
4. Deploy.

### Deploying the Backend (Render)

1. In Render, **New → Web Service** from the same GitHub repo.
2. Render reads `backend/render.yaml` (Python env, `pip install -r requirements.txt`, gunicorn+uvicorn start).
3. Set Root Directory to `backend` and add the backend env variables above (Production values), including `FRONTEND_URL` pointing to your Vercel domain.
4. After both are deployed, update `NEXT_PUBLIC_API_URL` in Vercel with the Render URL and redeploy.

## Security Notes

- **Rotate any secret that was ever committed.** Keys found in git history must be considered compromised even after they are removed from the current code.
- Keep the Supabase **service-role** key only in backend/server env; the browser should only ever use the **anon** key.
- Strong random values: `openssl rand -hex 32` (or `python -c "import secrets; print(secrets.token_hex(32))"`).
