"""FastAPI dependencies for authentication and authorization"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import os

from .jwt_handler import verify_token
from ..models.user import UserRole, UserResponse

# Security scheme
security = HTTPBearer()


async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance (will be replaced with proper DB dependency)"""
    from motor.motor_asyncio import AsyncIOMotorClient

    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "erp_db")

    client = AsyncIOMotorClient(mongo_url)
    return client[db_name]


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> UserResponse:
    """
    Get current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer credentials
        db: Database instance

    Returns:
        Current user data

    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("user_id")
    if user_id is None:
        raise credentials_exception

    # Get user from database
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception

    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    return UserResponse(**user)


async def get_current_active_user(
    current_user: UserResponse = Depends(get_current_user)
) -> UserResponse:
    """
    Get current active user (convenience dependency).

    Args:
        current_user: Current user from get_current_user

    Returns:
        Current active user

    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


class RoleChecker:
    """Dependency class to check user roles"""

    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    async def __call__(
        self,
        current_user: UserResponse = Depends(get_current_user)
    ) -> UserResponse:
        """
        Check if current user has required role.

        Args:
            current_user: Current authenticated user

        Returns:
            Current user if authorized

        Raises:
            HTTPException: If user doesn't have required role
        """
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required roles: {[role.value for role in self.allowed_roles]}"
            )
        return current_user


# Convenience role checker dependencies
require_admin = RoleChecker([UserRole.ADMIN])
require_manager = RoleChecker([UserRole.ADMIN, UserRole.MANAGER])
require_staff = RoleChecker([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF])
require_viewer = RoleChecker([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.VIEWER])
