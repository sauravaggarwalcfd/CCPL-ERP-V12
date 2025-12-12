"""Authentication API routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List

from ..models.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserInDB,
    Token,
    UserRole
)
from .password import hash_password, verify_password
from .jwt_handler import create_access_token, create_refresh_token, verify_token
from .dependencies import (
    get_database,
    get_current_user,
    get_current_active_user,
    require_admin
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Register a new user.

    - **email**: Valid email address (unique)
    - **username**: Username (unique)
    - **password**: Minimum 8 characters
    - **role**: User role (default: viewer)
    """
    # Check if user already exists
    existing_user = await db.users.find_one({
        "$or": [
            {"email": user_data.email},
            {"username": user_data.username}
        ]
    })

    if existing_user:
        if existing_user.get("email") == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

    # Create user in database
    user_dict = user_data.model_dump(exclude={"password"})
    user_dict["hashed_password"] = hash_password(user_data.password)

    user_in_db = UserInDB(**user_dict)
    await db.users.insert_one(user_in_db.model_dump())

    return UserResponse(**user_in_db.model_dump())


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Login with username/email and password.

    Returns access token and refresh token.
    """
    # Find user by username or email
    user = await db.users.find_one({
        "$or": [
            {"username": form_data.username},
            {"email": form_data.username}
        ]
    }, {"_id": 0})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )

    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )

    # Create tokens
    token_data = {
        "user_id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "role": user["role"]
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"user_id": user["id"]})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Refresh access token using refresh token.
    """
    payload = verify_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("user_id")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})

    if not user or not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # Create new tokens
    token_data = {
        "user_id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "role": user["role"]
    }

    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token({"user_id": user["id"]})

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get current user information.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: UserResponse = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update current user information.
    """
    update_data = user_update.model_dump(exclude_unset=True)

    # Hash password if provided
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))

    # Don't allow role update through this endpoint
    update_data.pop("role", None)

    update_data["updated_at"] = datetime.utcnow()

    # Update user
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )

    # Get updated user
    updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    return UserResponse(**updated_user)


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    current_user: UserResponse = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    List all users (Admin only).
    """
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return [UserResponse(**user) for user in users]


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: UserResponse = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update any user (Admin only).
    """
    # Check if user exists
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    update_data = user_update.model_dump(exclude_unset=True)

    # Hash password if provided
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))

    update_data["updated_at"] = datetime.utcnow()

    # Update user
    await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )

    # Get updated user
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return UserResponse(**updated_user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: UserResponse = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete/deactivate a user (Admin only).
    """
    # Don't allow deleting self
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    # Soft delete (deactivate)
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
