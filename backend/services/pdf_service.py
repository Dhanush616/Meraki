import io
import uuid
import logging
import zipfile
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

logger = logging.getLogger(__name__)

BRAND = colors.HexColor("#c4622d")
DARK = colors.HexColor("#1a1a1a")
GRAY = colors.HexColor("#9f9b93")


def _styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle("BrandTitle",   fontName="Helvetica-Bold",  fontSize=18, textColor=BRAND,  spaceAfter=4))
    s.add(ParagraphStyle("SectionHead",  fontName="Helvetica-Bold",  fontSize=11, textColor=DARK,   spaceAfter=6, spaceBefore=12))
    s.add(ParagraphStyle("FieldLabel",   fontName="Helvetica-Bold",  fontSize=9,  textColor=GRAY,   spaceAfter=2))
    s.add(ParagraphStyle("FieldValue",   fontName="Helvetica",       fontSize=10, textColor=DARK,   spaceAfter=8))
    s.add(ParagraphStyle("SmallNote",    fontName="Helvetica-Oblique", fontSize=8, textColor=GRAY,  spaceAfter=4))
    return s


def _field(styles, label: str, value: str):
    return [
        Paragraph(label.upper(), styles["FieldLabel"]),
        Paragraph(str(value) if value else "—", styles["FieldValue"]),
    ]


ASSET_INSTRUCTIONS = {
    "bank_account": {
        "office": "The branch where the account is held",
        "documents": "Original death certificate, your Aadhaar, PAN, bank passbook, this claim form",
        "form": "Bank's Succession/Nomination Claim Form",
    },
    "fixed_deposit": {
        "office": "The branch where the FD was opened",
        "documents": "Original death certificate, Aadhaar, PAN, FD receipt, this form",
        "form": "FD Premature Withdrawal / Nomination Claim Form",
    },
    "insurance": {
        "office": "Insurance company's nearest branch or online claim portal",
        "documents": "Death certificate, policy document, your Aadhaar, PAN, NEFT details",
        "form": "Death Claim Form (available from insurer's website)",
    },
    "mutual_fund": {
        "office": "The AMC (Mutual Fund company) office or nearest CAMS/KFintech service centre",
        "documents": "Death certificate, KYC documents, unit statement, NEFT mandate",
        "form": "Transmission Request Form",
    },
    "stocks_demat": {
        "office": "Depository Participant (DP) branch where the demat account is held",
        "documents": "Death certificate, your Aadhaar, PAN, account statements, this form",
        "form": "Transmission of Securities Form (CDSL/NSDL)",
    },
    "property": {
        "office": "Sub-Registrar's office for the area where the property is located",
        "documents": "Death certificate, will/succession certificate, property documents, your Aadhaar",
        "form": "Mutation Application (varies by state)",
    },
    "crypto_wallet": {
        "office": "Contact the exchange where the wallet is held, or use the wallet credentials directly",
        "documents": "Proof of identity, proof of relationship, exchange-specific claim form",
        "form": "Exchange's Beneficiary Claim Form",
    },
    "vehicle": {
        "office": "Regional Transport Office (RTO) where the vehicle is registered",
        "documents": "Death certificate, RC book, your Aadhaar, insurance papers",
        "form": "Form CMV-29 (Transfer of Ownership)",
    },
    "ppf_epf": {
        "office": "Post Office / EPF office where the account is held",
        "documents": "Death certificate, nomination form, your Aadhaar, PAN",
        "form": "Form 20 (EPF Withdrawal) / PPF Closure Request",
    },
    "gold_jewellery": {
        "office": "Bank locker / jeweller where the gold is stored",
        "documents": "Death certificate, locker agreement / jewellery receipt, your Aadhaar",
        "form": "Locker Access/Closure Form",
    },
}

DEFAULT_INSTRUCTIONS = {
    "office": "Relevant government or financial institution office",
    "documents": "Death certificate, your Aadhaar, PAN, and any relevant account documents",
    "form": "Succession Certificate / Legal Heir Certificate",
}


def generate_claim_form(
    asset: dict,
    beneficiary: dict,
    owner: dict,
    allocation_pct: float = 100.0,
    cert_info: dict | None = None,
) -> bytes:
    """Generate a pre-filled claim form PDF. Returns raw PDF bytes."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            topMargin=2*cm, bottomMargin=2*cm,
                            leftMargin=2.5*cm, rightMargin=2.5*cm)
    styles = _styles()
    story = []

    asset_type = asset.get("asset_type", "other")
    instructions = ASSET_INSTRUCTIONS.get(asset_type, DEFAULT_INSTRUCTIONS)
    owner_name = owner.get("full_name", "Vault Owner")
    bene_name = beneficiary.get("full_name", "Beneficiary")
    generated = datetime.now(timezone.utc).strftime("%d %B %Y")

    # Header
    story.append(Paragraph("Amaanat Vault — Inheritance Claim Form", styles["BrandTitle"]))
    story.append(Paragraph(f"Generated: {generated}", styles["SmallNote"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND, spaceAfter=12))

    # Decedent section
    story.append(Paragraph("Deceased Person (Vault Owner)", styles["SectionHead"]))
    story += _field(styles, "Full Name", owner_name)
    story += _field(styles, "City", owner.get("city", ""))
    story += _field(styles, "State", owner.get("state", ""))
    if cert_info:
        story += _field(styles, "Date of Death", cert_info.get("cert_date_of_death", ""))
        story += _field(styles, "Certificate Reg. No.", cert_info.get("cert_registration_number", ""))

    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY, spaceAfter=8))

    # Beneficiary section
    story.append(Paragraph("Claimant (Beneficiary)", styles["SectionHead"]))
    story += _field(styles, "Full Name", bene_name)
    story += _field(styles, "Relationship", beneficiary.get("relationship", ""))
    story += _field(styles, "Aadhaar Number", beneficiary.get("aadhaar_number", "[Insert Aadhaar]"))
    story += _field(styles, "PAN Number", beneficiary.get("pan_number", "[Insert PAN]"))
    story += _field(styles, "Bank Account", beneficiary.get("bank_account_number", "[Insert Account No.]"))
    story += _field(styles, "IFSC Code", beneficiary.get("bank_ifsc", "[Insert IFSC]"))

    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY, spaceAfter=8))

    # Asset section
    story.append(Paragraph("Asset Being Claimed", styles["SectionHead"]))
    story += _field(styles, "Asset Name", asset.get("nickname", ""))
    story += _field(styles, "Type", asset_type.replace("_", " ").title())
    story += _field(styles, "Institution", asset.get("institution_name", ""))
    story += _field(styles, "Account / Identifier", asset.get("account_identifier", ""))
    story += _field(styles, "Your Share", f"{allocation_pct:.0f}%")
    est_value = asset.get("estimated_value_inr")
    if est_value:
        story += _field(styles, "Estimated Value", f"₹{float(est_value):,.0f}")

    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY, spaceAfter=8))

    # Instructions
    story.append(Paragraph("What to Do Next", styles["SectionHead"]))
    story += _field(styles, "Where to Go", instructions["office"])
    story += _field(styles, "Documents to Bring", instructions["documents"])
    story += _field(styles, "Form to Submit", instructions["form"])

    story.append(Spacer(1, 1*cm))
    story.append(Paragraph(
        "This document was generated by Amaanat Vault on behalf of the deceased's estate. "
        "Please bring this form along with all required original documents to the institution mentioned above.",
        styles["SmallNote"],
    ))

    # Signature block
    story.append(Spacer(1, 1.5*cm))
    sig_data = [
        ["Claimant Signature", "Date", "Witness Signature"],
        [" \n\n_______________________", " \n\n___________", " \n\n_______________________"],
    ]
    sig_table = Table(sig_data, colWidths=[6*cm, 4*cm, 6*cm])
    sig_table.setStyle(TableStyle([
        ("FONTNAME",    (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",    (0,0), (-1,-1), 9),
        ("TEXTCOLOR",  (0,0), (-1,0), GRAY),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(sig_table)

    doc.build(story)
    buf.seek(0)
    return buf.read()


async def generate_all_forms_zip(supabase, execution_id: str, beneficiary_id: str) -> bytes:
    """Generate all claim forms for a beneficiary as a ZIP archive."""
    # Fetch package
    pkg = supabase.table("beneficiary_packages").select("*").eq(
        "execution_id", execution_id).eq("beneficiary_id", beneficiary_id).single().execute()

    if not pkg.data:
        raise ValueError("Package not found")

    asset_ids = pkg.data.get("asset_ids") or []
    owner_id = pkg.data["owner_id"]

    # Fetch data
    owner = (supabase.table("profiles").select("*").eq("id", owner_id).single().execute()).data or {}
    beneficiary = (supabase.table("beneficiaries").select("*").eq("id", beneficiary_id).single().execute()).data or {}
    cert = (supabase.table("death_verification_submissions").select("*").eq(
        "owner_id", owner_id).order("created_at", desc=True).limit(1).execute()).data
    cert = cert[0] if cert else {}

    # Fetch mappings for allocation percentages
    mappings = (supabase.table("asset_beneficiary_mappings").select("asset_id, percentage").eq(
        "beneficiary_id", beneficiary_id).execute()).data or []
    pct_by_asset = {m["asset_id"]: m["percentage"] for m in mappings}

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for asset_id in asset_ids:
            asset = (supabase.table("assets").select("*").eq("id", asset_id).single().execute()).data
            if not asset:
                continue
            pct = pct_by_asset.get(asset_id, 100.0)
            pdf_bytes = generate_claim_form(asset, beneficiary, owner, pct, cert)
            safe_name = asset.get("nickname", "asset").replace(" ", "_")[:30]
            zf.writestr(f"claim_form_{safe_name}.pdf", pdf_bytes)

    zip_buf.seek(0)
    return zip_buf.read()
