import uuid
import logging
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

FRONTEND_URL_DEFAULT = "http://localhost:3000"


async def execute_vault(supabase, owner_id: str, execution_id: str, frontend_url: str = FRONTEND_URL_DEFAULT):
    """
    Full vault execution orchestration (Process 5.3).
    Called when the 15-day liveness window expires without response.
    """
    from services.escalation_service import escalate_to
    from services.notification_service import send_execution_package_email

    logger.info(f"🚀 Vault execution started: owner={owner_id} execution={execution_id}")
    now = datetime.now(timezone.utc)

    try:
        # 1. Fetch all vault data
        assets = (supabase.table("assets").select("*").eq("owner_id", owner_id).eq("status", "active").execute()).data or []
        beneficiaries = (supabase.table("beneficiaries").select("*").eq("owner_id", owner_id).execute()).data or []
        owner = (supabase.table("profiles").select("*").eq("id", owner_id).single().execute()).data or {}
        mappings = (supabase.table("asset_beneficiary_mappings").select("*").execute()).data or []

        # Build per-beneficiary asset lists
        bene_assets: dict[str, list[str]] = {}
        for m in mappings:
            if m.get("role") == "primary":
                bid = m["beneficiary_id"]
                if bid not in bene_assets:
                    bene_assets[bid] = []
                bene_assets[bid].append(m["asset_id"])

        # 2. Simulate crypto routing
        crypto_tx_ref = None
        crypto_assets = [a for a in assets if a.get("asset_type") == "crypto_wallet"]
        if crypto_assets:
            crypto_tx_ref = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:8]}"
            for ca in crypto_assets:
                supabase.table("assets").update({
                    "metadata_encrypted": f'{{"crypto_tx_simulated": "{crypto_tx_ref}"}}',
                }).eq("id", ca["id"]).execute()
            logger.info(f"Crypto routing simulated: tx={crypto_tx_ref}")

        supabase.table("vault_executions").update({
            "crypto_execution_attempted": True,
            "crypto_execution_status": "simulated",
            "crypto_tx_reference": crypto_tx_ref,
        }).eq("id", execution_id).execute()

        # 3. Create beneficiary packages
        for bene in beneficiaries:
            bene_id = bene["id"]
            asset_ids = bene_assets.get(bene_id, [])
            token = uuid.uuid4().hex + uuid.uuid4().hex
            expires = (now + timedelta(days=30)).isoformat()

            pkg = supabase.table("beneficiary_packages").insert({
                "execution_id": execution_id,
                "owner_id": owner_id,
                "beneficiary_id": bene_id,
                "asset_ids": asset_ids,
                "total_assets": len(asset_ids),
                "package_access_token": token,
                "token_expires_at": expires,
            }).execute()

            # Update beneficiary status to unlocked
            supabase.table("beneficiaries").update({"status": "unlocked"}).eq("id", bene_id).execute()

            # 4. Send package email (demo: log)
            bene_email = bene.get("email", "")
            bene_name = bene.get("full_name", "Beneficiary")
            if bene_email:
                await send_execution_package_email(bene_email, bene_name, token, frontend_url)
                if pkg.data:
                    supabase.table("beneficiary_packages").update({
                        "email_sent": True,
                        "email_sent_at": now.isoformat(),
                    }).eq("id", pkg.data[0]["id"]).execute()

            logger.info(f"Package created for beneficiary {bene_id}: token={token[:16]}…")

        # 5. Mark execution complete
        supabase.table("vault_executions").update({
            "status": "completed",
            "documents_generated": True,
            "documents_generated_at": now.isoformat(),
            "packages_delivered": True,
            "packages_delivered_at": now.isoformat(),
            "executed_at": now.isoformat(),
        }).eq("id", execution_id).execute()

        # 6. Escalate to level_5_executed
        await escalate_to(supabase, owner_id, "level_5_executed", "Vault execution completed", "system")

        # 7. Log activity
        supabase.table("activity_logs").insert({
            "owner_id": owner_id,
            "action": "vault.executed",
            "entity_type": "vault_execution",
            "entity_id": execution_id,
            "metadata": {"beneficiary_count": len(beneficiaries), "asset_count": len(assets)},
        }).execute()

        logger.info(f"✅ Vault execution completed: owner={owner_id}")
        return {"status": "completed", "beneficiary_count": len(beneficiaries)}

    except Exception as e:
        logger.exception(f"Vault execution failed: {e}")
        supabase.table("vault_executions").update({
            "status": "failed",
            "failure_reason": str(e),
        }).eq("id", execution_id).execute()
        raise
