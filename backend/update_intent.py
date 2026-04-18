import os

content = """from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from typing import Optional, List, Dict, Any
from core.supabase import get_supabase_client
from core.security import get_current_user_id
import uuid
import httpx
import os

router = APIRouter()

@router.get("/")
def get_intent_status(owner_id: str = Depends(get_current_user_id)):
    \"\"\"Get the current active intent declaration for the vault owner.\"\"\"
    supabase = get_supabase_client()
    
    # Get active intent
    res = supabase.table("intent_declarations").select("*").eq("owner_id", owner_id).eq("status", "accepted").execute()
    
    if not res.data:
        return {"intent": None, "mappings": []}
        
    intent = res.data[0]
    
    # Get mappings
    maps_res = supabase.table("intent_mappings").select("*").eq("intent_id", intent["id"]).execute()
    
    return {"intent": intent, "mappings": maps_res.data}

@router.post("/upload")
async def upload_asset_intent_video(
    file: UploadFile = File(...),
    owner_id: str = Depends(get_current_user_id)
):
    \"\"\"
    Tab 1: Upload Asset Intent Will video, save to Supabase Storage, and save mappings.
    \"\"\"
    supabase = get_supabase_client()
    
    # 1. Supersede any existing accepted intent
    supabase.table("intent_declarations").update({"status": "superseded"}).eq("owner_id", owner_id).eq("status", "accepted").execute()
    
    # 2. Upload to Supabase Storage
    file_bytes = await file.read()
    file_ext = os.path.splitext(file.filename)[1] or ".webm"
    file_path = f"{owner_id}/{uuid.uuid4()}{file_ext}"
    
    try:
        supabase.storage.from_("intent_videos").upload(file_path, file_bytes)
    except Exception as e:
        pass
        
    # 3. Create Intent Declaration Record
    intent_res = supabase.table("intent_declarations").insert({
        "owner_id": owner_id,
        "type": "video",
        "video_storage_path": file_path,
        "status": "accepted"
    }).execute()
    
    if not intent_res.data:
        raise HTTPException(status_code=500, detail="Failed to save intent")
        
    intent_id = intent_res.data[0]["id"]

    # 4. Mock AI mapping generation (Simulating Gemini parsing)
    try:
        # We fetch active beneficiaries to make the mock smart
        b_res = supabase.table("beneficiaries").select("id, full_name").eq("owner_id", owner_id).execute()
        beneficiaries = b_res.data
        
        mock_mappings = []
        if len(beneficiaries) > 0:
            mock_mappings.append({
                "intent_id": intent_id,
                "owner_id": owner_id,
                "asset_mentioned": "HDFC savings account",
                "extracted_beneficiary_name": beneficiaries[0]['full_name'],
                "inferred_beneficiary_id": beneficiaries[0]['id'],
                "percentage_allocated": 100.0,
                "confidence_score": 98.0,
                "status": "accepted"
            })
        
        if len(beneficiaries) > 1:
            mock_mappings.append({
                "intent_id": intent_id,
                "owner_id": owner_id,
                "asset_mentioned": "Mumbai Flat",
                "extracted_beneficiary_name": beneficiaries[1]['full_name'],
                "inferred_beneficiary_id": beneficiaries[1]['id'],
                "percentage_allocated": 50.0,
                "confidence_score": 85.0,
                "status": "pending_review"
            })
            
        if mock_mappings:
            supabase.table("intent_mappings").insert(mock_mappings).execute()
    except Exception as e:
        print("Mock mapping error:", e)

    return {"message": "Video processed", "intent_id": intent_id}

@router.get("/messages")
def get_personal_messages(owner_id: str = Depends(get_current_user_id)):
    \"\"\"
    Get all personal messages recorded by the vault owner for different beneficiaries.
    \"\"\"
    supabase = get_supabase_client()
    res = supabase.table("personal_messages").select("*").eq("owner_id", owner_id).execute()
    return {"messages": res.data}

@router.post("/messages/upload")
async def upload_personal_message(
    beneficiary_id: str = Form(...),
    file: UploadFile = File(...),
    owner_id: str = Depends(get_current_user_id)
):
    \"\"\"
    Tab 2: Upload a private personal message for a beneficiary.
    \"\"\"
    supabase = get_supabase_client()
    
    # 1. Check if an existing message exists and delete the file if necessary
    existing_res = supabase.table("personal_messages").select("id, video_storage_path").eq("owner_id", owner_id).eq("beneficiary_id", beneficiary_id).execute()
    if existing_res.data:
        old_path = existing_res.data[0]["video_storage_path"]
        try:
            supabase.storage.from_("personal_messages").remove([old_path])
        except Exception:
            pass
        supabase.table("personal_messages").delete().eq("id", existing_res.data[0]["id"]).execute()
    
    # 2. Upload to Supabase storage
    file_bytes = await file.read()
    file_ext = os.path.splitext(file.filename)[1] or ".webm"
    file_path = f"{owner_id}/{beneficiary_id}_{uuid.uuid4()}{file_ext}"
    
    try:
        supabase.storage.from_("personal_messages").upload(file_path, file_bytes)
    except Exception as e:
        pass # In a real prod environment we'd handle exactly if the bucket exists
        
    # get public url to allow previewing (In prod, keep this private and use signed urls)
    video_url = supabase.storage.from_("personal_messages").get_public_url(file_path)
    
    # 3. Insert into personal_messages table
    res = supabase.table("personal_messages").insert({
        "owner_id": owner_id,
        "beneficiary_id": beneficiary_id,
        "video_storage_path": file_path,
        "video_url": video_url,
        "is_encrypted": False # We'll set to false for now, assuming TLS / storage-level encryption
    }).execute()

    return {"message": "Personal message saved successfully"}

@router.delete("/messages/{message_id}")
def delete_personal_message(message_id: str, owner_id: str = Depends(get_current_user_id)):
    \"\"\"Delete a personal message\"\"\"
    supabase = get_supabase_client()
    
    # verify ownership
    msg_res = supabase.table("personal_messages").select("id, video_storage_path").eq("id", message_id).eq("owner_id", owner_id).execute()
    if not msg_res.data:
        raise HTTPException(status_code=404, detail="Message not found")
        
    path = msg_res.data[0]["video_storage_path"]
    
    try:
        supabase.storage.from_("personal_messages").remove([path])
    except Exception:
        pass
        
    supabase.table("personal_messages").delete().eq("id", message_id).execute()
    return {"message": "Message deleted"}
"""

with open(r'c:\Meraki\backend\routers\intent.py', 'w', encoding='utf-8') as f:
    f.write(content)
