"""User models for authentication and authorization"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class UserRole(str, Enum):
    """User roles for RBAC"""
    ADMIN = "admin"          # Full system access
    MANAGER = "manager"      # Create/update/delete (no system settings)
    STAFF = "staff"          # Read/write access
    VIEWER = "viewer"        # Read-only access


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.VIEWER
    is_active: bool = True


class UserCreate(UserBase):
    """Model for creating a new user"""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Model for updating user"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserInDB(UserBase):
    """User model as stored in database"""
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None


class UserResponse(BaseModel):
    """User model for API responses (without password)"""
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]


class Token(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data encoded in JWT token"""
    user_id: str
    email: str
    username: str
    role: UserRole
