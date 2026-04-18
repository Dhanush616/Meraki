from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io
from core.supabase import get_supabase_client

router = APIRouter()


class ClaimFormRequest(BaseModel):
    asset_id: str
    beneficiary_id: str
    execution_id: str
    package_access_token: str   # used instead of JWT for public access


class AllFormsRequest(BaseModel):
    execution_id: str
    beneficiary_id: str
    package_access_token: str


def _validate_package_token(supabase, token: str, execution_id: str, beneficiary_id: str) -> dict:
    pkg = supabase.table("beneficiary_packages").select("*").eq(
        "package_access_token", token
    ).eq("execution_id", execution_id).eq("beneficiary_id", beneficiary_id).execute()
    if not pkg.data:
        raise HTTPException(status_code=403, detail="Invalid package access token")
    return pkg.data[0]


@router.post("/claim-form")
async def generate_claim_form(body: ClaimFormRequest):
    """Generate a pre-filled claim form PDF for a single asset."""
    from services.pdf_service import generate_claim_form

    supabase = get_supabase_client()
    _validate_package_token(supabase, body.package_access_token, body.execution_id, body.beneficiary_id)

    asset = (supabase.table("assets").select("*").eq("id", body.asset_id).single().execute()).data
    beneficiary = (supabase.table("beneficiaries").select("*").eq("id", body.beneficiary_id).single().execute()).data
    if not asset or not beneficiary:
        raise HTTPException(status_code=404, detail="Asset or beneficiary not found")

    owner = (supabase.table("profiles").select("*").eq("id", asset["owner_id"]).single().execute()).data or {}
    cert = (supabase.table("death_verification_submissions").select("*").eq(
        "owner_id", asset["owner_id"]).order("created_at", desc=True).limit(1).execute()).data
    cert = cert[0] if cert else {}

    mapping = (supabase.table("asset_beneficiary_mappings").select("percentage").eq(
        "asset_id", body.asset_id).eq("beneficiary_id", body.beneficiary_id).execute()).data
    pct = mapping[0]["percentage"] if mapping else 100.0

    pdf_bytes = generate_claim_form(asset, beneficiary, owner, pct, cert)
    filename = f"claim_{asset.get('nickname', 'asset').replace(' ', '_')}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/claim-forms/all")
async def generate_all_forms(body: AllFormsRequest):
    """Generate all claim forms for a beneficiary as a ZIP archive."""
    from services.pdf_service import generate_all_forms_zip

    supabase = get_supabase_client()
    _validate_package_token(supabase, body.package_access_token, body.execution_id, body.beneficiary_id)

    zip_bytes = await generate_all_forms_zip(supabase, body.execution_id, body.beneficiary_id)

    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=inheritance_forms.zip"},
    )
