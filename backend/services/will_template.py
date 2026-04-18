"""
will_template.py — ReportLab PDF generator for the Last Will & Testament document.
"""
import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)

# ── Palette ──────────────────────────────────────────────────────────────────
BRAND  = colors.HexColor("#c4622d")
DARK   = colors.HexColor("#1a1a1a")
GRAY   = colors.HexColor("#6b7280")
LIGHT  = colors.HexColor("#f3f4f6")
BORDER = colors.HexColor("#d1d5db")


def _build_styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle("WillTitle",   fontName="Helvetica-Bold",    fontSize=20, textColor=DARK,  spaceAfter=4, alignment=1))
    s.add(ParagraphStyle("WillSubtitle",fontName="Helvetica",         fontSize=11, textColor=GRAY,  spaceAfter=16, alignment=1))
    s.add(ParagraphStyle("SectionHead", fontName="Helvetica-Bold",    fontSize=11, textColor=BRAND, spaceAfter=6, spaceBefore=16, borderPad=4))
    s.add(ParagraphStyle("Body",        fontName="Helvetica",         fontSize=10, textColor=DARK,  spaceAfter=6, leading=15))
    s.add(ParagraphStyle("BodyBold",    fontName="Helvetica-Bold",    fontSize=10, textColor=DARK,  spaceAfter=6))
    s.add(ParagraphStyle("SmallNote",   fontName="Helvetica-Oblique", fontSize=8,  textColor=GRAY,  spaceAfter=4))
    s.add(ParagraphStyle("Footer",      fontName="Helvetica-Oblique", fontSize=8,  textColor=GRAY,  spaceAfter=4, alignment=1))
    s.add(ParagraphStyle("SignLabel",   fontName="Helvetica-Bold",    fontSize=9,  textColor=GRAY,  spaceAfter=2))
    return s


def generate_will_pdf(
    profile: dict,
    assets: list[dict],
    mappings: list[dict],
    beneficiaries: list[dict],
    executor_name: str = "",
    special_instructions: str = "",
) -> bytes:
    """
    Generate the Last Will & Testament PDF and return raw bytes.

    Args:
        profile: owner profile dict (full_name, address, religion, etc.)
        assets: list of asset dicts
        mappings: list of asset_beneficiary_mapping dicts
        beneficiaries: list of beneficiary dicts
        executor_name: name of the nominated executor
        special_instructions: freeform text
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        topMargin=2 * cm, bottomMargin=2.5 * cm,
        leftMargin=2.5 * cm, rightMargin=2.5 * cm,
    )
    styles = _build_styles()
    story = []

    testator_name = profile.get("full_name") or "Unknown"
    address       = profile.get("address") or profile.get("city") or "—"
    religion      = profile.get("religion") or "—"
    today         = datetime.now(timezone.utc).strftime("%d %B %Y")

    # ── Title ──────────────────────────────────────────────────────────────
    story.append(Paragraph("LAST WILL AND TESTAMENT", styles["WillTitle"]))
    story.append(Paragraph(f"of {testator_name}", styles["WillSubtitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=BRAND, spaceAfter=14))

    # ── Declaration Header ─────────────────────────────────────────────────
    story.append(Paragraph("I. DECLARATION", styles["SectionHead"]))
    declaration = (
        f"I, <b>{testator_name}</b>, residing at <b>{address}</b>, "
        f"of <b>{religion}</b> faith, being of sound and disposing mind and memory, "
        f"do hereby make, publish and declare this to be my Last Will and Testament, "
        f"revoking all former wills and codicils previously made by me. "
        f"This document is executed on <b>{today}</b>."
    )
    story.append(Paragraph(declaration, styles["Body"]))

    # ── Asset Distribution Table ───────────────────────────────────────────
    story.append(Paragraph("II. ASSET DISTRIBUTION", styles["SectionHead"]))
    story.append(Paragraph(
        "I direct that upon my death, my assets shall be distributed to the following beneficiaries "
        "in the proportions set out below:",
        styles["Body"],
    ))

    # Build beneficiary lookup
    bene_by_id = {b["id"]: b for b in beneficiaries}
    # Build mapping lookup: asset_id -> list of {beneficiary, percentage}
    map_by_asset: dict[str, list] = {}
    for m in mappings:
        aid = m.get("asset_id")
        if aid not in map_by_asset:
            map_by_asset[aid] = []
        bid = m.get("beneficiary_id")
        bene = bene_by_id.get(bid, {})
        map_by_asset[aid].append({
            "name": bene.get("full_name") or bid or "—",
            "relationship": bene.get("relationship") or "—",
            "pct": float(m.get("percentage") or 0),
        })

    table_data = [["Asset", "Type", "Beneficiary", "Relationship", "Share %"]]
    for asset in assets:
        aid   = str(asset.get("id") or "")
        aname = asset.get("nickname") or "—"
        atype = (asset.get("asset_type") or "").replace("_", " ").title()
        rows  = map_by_asset.get(aid, [])
        if not rows:
            table_data.append([aname, atype, "—", "—", "—"])
        else:
            for i, r in enumerate(rows):
                label = aname if i == 0 else ""
                ltype = atype if i == 0 else ""
                table_data.append([
                    label, ltype,
                    r["name"], r["relationship"],
                    f"{r['pct']:.0f}%",
                ])

    col_widths = [4.5 * cm, 3 * cm, 4.5 * cm, 3 * cm, 2 * cm]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  LIGHT),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  DARK),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t)

    # ── Special Instructions ───────────────────────────────────────────────
    story.append(Paragraph("III. SPECIAL INSTRUCTIONS", styles["SectionHead"]))
    instr_text = special_instructions.strip() if special_instructions.strip() else \
        "No special instructions have been recorded at this time."
    story.append(Paragraph(instr_text, styles["Body"]))

    # ── Executor Appointment ───────────────────────────────────────────────
    story.append(Paragraph("IV. EXECUTOR APPOINTMENT", styles["SectionHead"]))
    executor_text = executor_name.strip() if executor_name.strip() else "[Executor name not yet nominated]"
    story.append(Paragraph(
        f"I hereby nominate and appoint <b>{executor_text}</b> as the Executor of this Will. "
        "If the named Executor is unable or unwilling to serve, I request the court to appoint "
        "a suitable replacement. My Executor shall have full authority to carry out the provisions "
        "of this Will, administer my estate, and distribute my assets as directed herein.",
        styles["Body"],
    ))

    # ── Witness Signature Section ──────────────────────────────────────────
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph("V. TESTATOR SIGNATURE", styles["SectionHead"]))
    story.append(Paragraph(
        "I declare that I sign and execute this instrument as my Last Will, that I sign it willingly, "
        "and that I execute it as my free and voluntary act.",
        styles["Body"],
    ))

    sig_data = [
        ["Testator Signature", "", "Date"],
        ["\n\n\n________________________", "", f"\n\n\n{today}"],
        [testator_name, "", ""],
    ]
    sig_t = Table(sig_data, colWidths=[8 * cm, 2 * cm, 7 * cm])
    sig_t.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  GRAY),
        ("VALIGN",        (0, 0), (-1, -1), "BOTTOM"),
    ]))
    story.append(sig_t)

    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph("VI. WITNESS SIGNATURES", styles["SectionHead"]))
    story.append(Paragraph(
        "We, the undersigned witnesses, each do hereby declare that the Testator signed and executed "
        "this instrument as their Last Will in our presence and hearing, that they signed it as their "
        "free and voluntary act, and that each of us hereby signs this Will as witness in the presence "
        "and at the request of the Testator.",
        styles["Body"],
    ))

    wit_data = [
        ["Witness 1 Signature", "", "Witness 2 Signature"],
        ["\n\n\n__________________________________", "", "\n\n\n__________________________________"],
        ["Print Name: ___________________", "", "Print Name: ___________________"],
        ["Date: _________________________", "", "Date: _________________________"],
        ["Address: ______________________", "", "Address: ______________________"],
    ]
    wit_t = Table(wit_data, colWidths=[8 * cm, 1 * cm, 8 * cm])
    wit_t.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  GRAY),
        ("VALIGN",        (0, 0), (-1, -1), "BOTTOM"),
    ]))
    story.append(wit_t)

    # ── Legal Footer ───────────────────────────────────────────────────────
    story.append(Spacer(1, 1 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=8))
    story.append(Paragraph(
        f"This document constitutes the Last Will and Testament of {testator_name}. "
        "It was generated by Paradosis Vault and must be executed, witnessed, and stored "
        "in accordance with the applicable laws of the jurisdiction. "
        "This document requires original signatures to be legally valid. "
        f"Document generated on {today}.",
        styles["Footer"],
    ))

    doc.build(story)
    buf.seek(0)
    return buf.read()
