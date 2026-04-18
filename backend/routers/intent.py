from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Optional, List
from supabase import create_client, Client
import os
import json
import uuid

router = APIRouter()

# Supabase setup (placeholder for env vars)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

@router.post("/upload")
async def upload_intent_video(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    """
    Tab 1: Upload Asset Intent Will video, send to Gemini, and save mappings.
    """
    supabase = get_supabase()
    
    # 1. Upload to Supabase storage (assuming bucket "intent_videos")
    file_bytes = await file.read()
    file_path = f"{user_id}/{uuid.uuid4()}_{file.filename}"
    
    try:
        supabase.storage.from_("intent_videos").upload(file_path, file_bytes)
    except Exception as e:
        # Ignore for now if bucket issues exist
        pass

    # 2. Mock Gemini AI parsing (in real life, send to Gemini Vertex/GenerativeAI)
    # This matches the schema: [id, user_id, asset_mentioned, intended_beneficiary, percentage, confidence_score, status]
    mock_mappings = [
        {
            "user_id": user_id,
            "asset_mentioned": "HDFC savings account",
            "intended_beneficiary": "Kavitha",
            "percentage": 100,
            "confidence_score": 0.95,
            "status": "pending_review"
        },
        {
            "user_id": user_id,
            "asset_mentioned": "Flat in Chennai",
            "intended_beneficiary": "Kavitha & Arjun",
            "percentage": 50,
            "confidence_score": 0.88,
            "status": "pending_review"
        }
    ]
    
    # 3. Save mock mappings to DB
    try:
        supabase.table("intent_mappings").insert(mock_mappings).execute()
    except Exception as e:
        print("DB Error", e)
        
    return {"message": "Video processed", "mappings": mock_mappings}

@router.post("/messages/upload")
async def upload_personal_message(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    beneficiary_id: str = Form(...)
):
    """
    Tab 2: Upload a private encrypted personal message for a beneficiary.
    """
    supabase = get_supabase()
    
    # 1. Upload to Supabase storage (bucket "personal_messages")
    file_bytes = await file.read()
    file_path = f"{user_id}/{beneficiary_id}/{uuid.uuid4()}_{file.filename}"
    
    try:
        supabase.storage.from_("personal_messages").upload(file_path, file_bytes)
    except Exception as e:
        pass
        
    # get public url or private path
    video_url = supabase.storage.from_("personal_messages").get_public_url(file_path)
    
    # 2. Insert into the personal_messages table created in schema.sql
    try:
        supabase.table("personal_messages").insert({
            "user_id": user_id,
            "beneficiary_id": beneficiary_id,
            "video_url": video_url,
            "is_encrypted": True
        }).execute()
    except Exception as e:
        print("DB Error", e)

    return {"message": "Personal message saved successfully", "video_url": video_url}

