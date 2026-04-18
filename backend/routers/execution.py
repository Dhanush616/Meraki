from fastapi import APIRouter, HTTPException
from core.supabase import get_supabase_client

router = APIRouter()

ASSET_TYPE_LABELS = {
    "bank_account": "Bank Account",
    "fixed_deposit": "Fixed Deposit",
    "property": "Property",
    "insurance": "Insurance Policy",
    "mutual_fund": "Mutual Fund",
    "stocks_demat": "Stocks / Demat",
    "crypto_wallet": "Crypto Wallet",
    "vehicle": "Vehicle",
    "ppf_epf": "PPF / EPF",
    "gold_jewellery": "Gold & Jewellery",
    "business_ownership": "Business Ownership",
    "other": "Other Asset",
}

NEXT_STEPS = {
    "bank_account":   "Visit the branch with the death certificate, your Aadhaar, and PAN. Request the Succession/Nomination Claim Form and submit with supporting documents.",
    "fixed_deposit":  "Visit the FD-issuing branch with the original FD receipt and death certificate. Request premature withdrawal under nomination.",
    "insurance":      "Contact the insurer's claim helpline or visit a branch. Submit the Death Claim Form with the policy document and death certificate.",
    "mutual_fund":    "Submit a Transmission Request Form at the nearest CAMS/KFintech service centre with your KYC documents.",
    "stocks_demat":   "Contact your Depository Participant (DP) with the Transmission of Securities Form and death certificate.",
    "property":       "Apply for property mutation at the Sub-Registrar's office. You may need a Succession Certificate from a civil court.",
    "crypto_wallet":  "Your crypto assets have been automatically routed to your registered wallet address.",
    "vehicle":        "Visit the RTO with Form CMV-29 (Transfer of Ownership), the RC book, and death certificate.",
    "ppf_epf":        "Visit the Post Office / EPFO office with Form 20 (EPF) or a PPF closure request.",
    "gold_jewellery": "Contact the bank/locker facility. Fill out the locker access/closure form with your Aadhaar and death certificate.",
}

DEFAULT_NEXT_STEPS = "Please visit the relevant government or financial institution with a certified copy of the death certificate and your identity proof."


@router.get("/package/{token}")
def get_execution_package(token: str):
    """
    Public endpoint — no JWT required.
    Validates the package_access_token and returns the full beneficiary package.
    """
    supabase = get_supabase_client()

    # Validate token
    pkg = (
        supabase.table("beneficiary_packages")
        .select("*")
        .eq("package_access_token", token)
        .execute()
    )
    if not pkg.data:
        raise HTTPException(status_code=404, detail="Invalid or expired package token")

    row = pkg.data[0]
    owner_id = row["owner_id"]
    beneficiary_id = row["beneficiary_id"]
    asset_ids = row.get("asset_ids") or []

    # Fetch owner profile
    owner_profile = (supabase.table("profiles").select("full_name, city, state").eq("id", owner_id).single().execute()).data or {}

    # Fetch beneficiary
    bene = (supabase.table("beneficiaries").select("full_name, relationship, personal_message").eq("id", beneficiary_id).single().execute()).data or {}

    # Fetch execution to get date
    execution = (supabase.table("vault_executions").select("executed_at, crypto_tx_reference").eq("id", row["execution_id"]).single().execute()).data or {}

    # Fetch death cert for date of death
    cert = (supabase.table("death_verification_submissions").select(
        "cert_date_of_death"
    ).eq("owner_id", owner_id).order("created_at", desc=True).limit(1).execute()).data
    date_of_passing = (cert[0].get("cert_date_of_death") if cert else None)

    # Fetch assets + mappings
    assets_out = []
    crypto_tx = None

    for asset_id in asset_ids:
        asset = (supabase.table("assets").select("*").eq("id", asset_id).single().execute()).data
        if not asset:
            continue

        mapping = (supabase.table("asset_beneficiary_mappings").select("percentage, role").eq(
            "asset_id", asset_id).eq("beneficiary_id", beneficiary_id).execute()).data
        pct = (mapping[0]["percentage"] if mapping else 100.0)

        est_value = asset.get("estimated_value_inr")
        asset_type = asset.get("asset_type", "other")

        if asset_type == "crypto_wallet" and execution.get("crypto_tx_reference"):
            crypto_tx = execution["crypto_tx_reference"]

        assets_out.append({
            "id": asset["id"],
            "nickname": asset.get("nickname", ""),
            "asset_type": asset_type,
            "type_label": ASSET_TYPE_LABELS.get(asset_type, "Asset"),
            "institution": asset.get("institution_name", ""),
            "account_identifier": asset.get("account_identifier", ""),
            "percentage": pct,
            "estimated_value_inr": float(est_value) if est_value else None,
            "next_steps": NEXT_STEPS.get(asset_type, DEFAULT_NEXT_STEPS),
        })

    # Update access tracking
    supabase.table("beneficiary_packages").update({
        "access_count": (row.get("access_count") or 0) + 1,
        "first_accessed_at": row.get("first_accessed_at") or __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    }).eq("id", row["id"]).execute()

    return {
        "owner_name": owner_profile.get("full_name", ""),
        "date_of_passing": date_of_passing,
        "personal_message": bene.get("personal_message"),
        "beneficiary_name": bene.get("full_name", ""),
        "assets": assets_out,
        "crypto_tx": crypto_tx,
        "execution_id": row["execution_id"],
        "beneficiary_id": beneficiary_id,
        "package_id": row["id"],
    }
