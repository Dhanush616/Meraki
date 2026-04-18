import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    health, assets, beneficiaries, intent,
    documents, escalation, verification, execution,
    auth, vault, security, activity, guardian, internal, will
)

app = FastAPI(
    title=os.getenv("PROJECT_NAME", "[APP_NAME] API"),
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT", "development") == "development" else None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(beneficiaries.router, prefix="/api/beneficiaries", tags=["Beneficiaries"])
app.include_router(intent.router, prefix="/api/intent", tags=["Intent"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(will.router, prefix="/api/documents/will", tags=["Will"])
app.include_router(escalation.router, prefix="/api/escalation", tags=["Escalation"])
app.include_router(verification.router, prefix="/api/verification", tags=["Verification"])
app.include_router(execution.router, prefix="/api/execution", tags=["Execution"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(vault.router, prefix="/api/vault", tags=["Vault"])
app.include_router(security.router, prefix="/api/security", tags=["Security"])
app.include_router(activity.router, prefix="/api/activity", tags=["Activity"])
app.include_router(guardian.router, prefix="/api/guardian", tags=["Guardian"])
app.include_router(internal.router, prefix="/api/internal", tags=["Internal"])

# Trigger reload
