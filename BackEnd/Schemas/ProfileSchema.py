from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from Schemas.JobSchema import JobsResponse
from Schemas.ServiceSchema import ServiceResponse
from Schemas.ProjectSchema import ProjectResponse
from Schemas.SocialLinksSchema import SocialLinkResponse


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
    jobs: Optional[List[JobsResponse]] = []
    services: Optional[List[ServiceResponse]] = []
    projects: Optional[List[ProjectResponse]] = []
    social_links: Optional[List[SocialLinkResponse]] = []
    
    class Config:
        from_attributes = True
