from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    auth0_id = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    created_at = Column(DateTime, default=func.now())
    
    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    FirstName = Column(String)
    LastName = Column(String)
    avatar_url = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    user = relationship("User", back_populates="profile")
    services = relationship("Service", back_populates="profile", cascade="all, delete-orphan")
    social_links = relationship("SocialLink", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="profile", cascade="all, delete-orphan")

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    
    profile = relationship("Profile", back_populates="services")

class SocialLink(Base):
    __tablename__ = "social_links"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    platform = Column(String, nullable=False)
    url = Column(String, nullable=False)
    
    profile = relationship("Profile", back_populates="social_links")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    project_link = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    
    profile = relationship("Profile", back_populates="projects")

class Jobs(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
