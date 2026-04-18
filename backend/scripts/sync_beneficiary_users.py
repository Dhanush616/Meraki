import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Missing SUPABASE config.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def sync_beneficiaries():
    print("Fetching beneficiaries...")
    res = supabase.table("beneficiaries").select("*").execute()
    beneficiaries = res.data

    for bene in beneficiaries:
        email = bene.get("email")
        if not email:
            print(f"Skipping {bene['id']} - no email.")
            continue
            
        bene_user_id = bene.get("user_id")
        owner_id = bene.get("owner_id")
        
        # We also create an account for them if we want to allow login, even if they had "total_secrecy" before. 
        # But we don't necessarily change the disclosure_level 
        print(f"Processing {email} ({bene['id']})")
        
        # Try finding them in supauth
        # Supabase Python client doesn't have an easy "find by email" without pagination, 
        # so we'll try to create it, and if it fails due to "already exists", we update password
        
        try:
            new_user = supabase.auth.admin.create_user({
                "email": email,
                "password": "Demo@1234",
                "email_confirm": True
            })
            bene_user_id = new_user.user.id
            print(f"Created new auth user for {email}: {bene_user_id}")
            
        except Exception as e:
            msg = str(e)
            if "already been registered" in msg.lower() or "already exists" in msg.lower():
                print(f"Auth user for {email} already exists. We should update the password")
                # But wait, how do we get the user_id if we only have email?
                # Let's list users and find them.
                users_res = supabase.auth.admin.list_users() # Gets first 50... might need pagination.
                # Just assuming few users for this demo:
                users_list = getattr(users_res, 'users', users_res)
                for u in users_list:
                    if u.email == email:
                        bene_user_id = u.id
                        print(f"Found existing user {u.email} -> {bene_user_id}")
                        # Update password to Demo@1234
                        supabase.auth.admin.update_user_by_id(u.id, {"password": "Demo@1234", "email_confirm": True})
                        break
            else:
                print(f"Failed to create user {email}: {msg}")
                continue
                
        if bene_user_id:
            # Update beneficiary record
            supabase.table("beneficiaries").update({"user_id": bene_user_id}).eq("id", bene["id"]).execute()
            
            # Ensure user_roles exists
            role_res = supabase.table("user_roles").select("*").eq("user_id", bene_user_id).eq("role", "beneficiary").execute()
            if not role_res.data:
                try:
                    supabase.table("user_roles").insert({
                        "user_id": bene_user_id,
                        "role": "beneficiary",
                        "linked_owner_id": owner_id
                    }).execute()
                except Exception as e:
                    print(f"Role insertion failed or already exists: {str(e)}")
            
    print("Sync complete.")

if __name__ == "__main__":
    sync_beneficiaries()