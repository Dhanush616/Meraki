import os
import json
import google.generativeai as genai

def generate_will_text(profile: dict, assets: list, mappings: list, beneficiaries: list, executor_name: str, special_instructions: str, witness_1_name: str, witness_2_name: str) -> str:
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    bene_by_id = {b["id"]: b for b in beneficiaries}
    
    asset_details = []
    for asset in assets:
        aid = str(asset.get("id", ""))
        aname = asset.get("nickname", "Unknown Asset")
        atype = asset.get("asset_type", "Asset").replace("_", " ").title()
        
        allocations = [m for m in mappings if m.get("asset_id") == aid]
        alloc_strs = []
        for m in allocations:
            bene = bene_by_id.get(m.get("beneficiary_id"), {})
            bname = bene.get("full_name", "Unknown Beneficiary")
            pct = m.get("percentage", 0)
            alloc_strs.append(f"{pct}% to {bname}")
            
        asset_details.append(f"- {aname} ({atype}): {', '.join(alloc_strs)}")
        
    prompt = f"""
You are an expert Indian Legal Advisor. Generate a formal, legally binding Last Will and Testament text based on the following details.
Do not use markdown formatting like ## or #, but you can use **bold** for emphasis. Keep the text professional and suitable for printing as a legal document.

Testator Details:
Name: {profile.get("full_name", "_________________")}
Address: {profile.get("address", profile.get("city", "_________________"))}
Religion: {profile.get("religion", "_________________")}

Executor: {executor_name or "_________________"}
Witness 1: {witness_1_name or "_________________"}
Witness 2: {witness_2_name or "_________________"}

Assets and Allocations:
{chr(10).join(asset_details)}

Special Instructions:
{special_instructions or "None"}

Please structure the will with clear sections:
1. Title (LAST WILL AND TESTAMENT)
2. Declaration of sound mind and revocation of previous wills.
3. Appointment of Executor.
4. Asset Distribution (list out the assets and beneficiaries clearly in text).
5. Special Instructions (if any).
6. Testator Signature block.
7. Witnesses Signature block with date and place.

Ensure it conforms to standard Indian Will formats.
"""
    response = model.generate_content(prompt)
    return response.text
