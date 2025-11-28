from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Token Request
class TokenRequest(BaseModel):
    token: str

# Profile Schemas
class ProfileBase(BaseModel):
    FirstName: Optional[str] = None
    LastName: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Service Schemas
class ServiceBase(BaseModel):
    title: str
    description: Optional[str] = None
    sort_order: Optional[int] = 0

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int
    profile_id: str
    
    class Config:
        from_attributes = True

# Social Link Schemas
class SocialLinkBase(BaseModel):
    platform: str
    url: str

class SocialLinkCreate(SocialLinkBase):
    pass

class SocialLinkResponse(SocialLinkBase):
    id: int
    profile_id: str
    
    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_link: Optional[str] = None
    sort_order: Optional[int] = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    profile_id: str
    
    class Config:
        from_attributes = True

# Jobs Schemas
class JobsBase(BaseModel):
    title: str
    description: Optional[str] = None

class JobsCreate(JobsBase):
    pass

class JobsResponse(JobsBase):
    id: int
    profile_id: str
    
    class Config:
        from_attributes = True
