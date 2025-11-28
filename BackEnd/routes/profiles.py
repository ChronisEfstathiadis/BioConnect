from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from sqlalchemy.orm import Session
from database import get_db
from models import Profile
from schemas import ProfileCreate, ProfileResponse
from auth import get_token_data, get_user_id_from_token, get_or_create_profile, get_user_email_from_token

router = APIRouter()

@router.get("/api/profile/{profile_id}", response_model=ProfileResponse)
async def get_profile(
    profile_id: str,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_token_data)
):
    user_id = get_user_id_from_token(token_data)
    if profile_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    profile = get_or_create_profile(token_data, db)
    return profile

@router.post("/api/profile", response_model=ProfileResponse)
async def create_profile(
    profile: ProfileCreate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_token_data)
):
    user_id = get_user_id_from_token(token_data)
    
    existing = db.query(Profile).filter(Profile.id == user_id).first()
    if existing:
        existing.FirstName = profile.FirstName or existing.FirstName
        existing.LastName = profile.LastName or existing.LastName
        existing.avatar_url = profile.avatar_url or existing.avatar_url
        existing.phone = profile.phone or existing.phone
        db.commit()
        db.refresh(existing)
        return existing
    
    email = get_user_email_from_token(token_data)
    db_profile = Profile(
        id=user_id,
        email=email,
        FirstName=profile.FirstName or "",
        LastName=profile.LastName or "",
        avatar_url=profile.avatar_url,
        phone=profile.phone
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.put("/api/profile/{profile_id}", response_model=ProfileResponse)
async def update_profile(
    profile_id: str,
    profile: ProfileCreate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_token_data)
):
    user_id = get_user_id_from_token(token_data)
    if profile_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    db_profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    db_profile.FirstName = profile.FirstName
    db_profile.LastName = profile.LastName
    db_profile.avatar_url = profile.avatar_url
    db_profile.phone = profile.phone
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.post("/api/profile/{profile_id}/avatar")
async def upload_avatar(
    profile_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_token_data)
):
    avatar_url = f"https://example.com/avatars/{profile_id}/{file.filename}"
    
    db_profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if db_profile:
        db_profile.avatar_url = avatar_url
        db.commit()
    
    return {"avatarUrl": avatar_url}

@router.get("/api/profile/me", response_model=ProfileResponse)
async def get_my_profile(
    token_data: dict = Depends(get_token_data),
    db: Session = Depends(get_db)
):
    """Get current user's profile, auto-creates if doesn't exist"""
    profile = get_or_create_profile(token_data, db)
    return profile
