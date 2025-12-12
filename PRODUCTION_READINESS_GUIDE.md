# 🚀 Production Readiness & Architecture Improvement Guide

**Generated**: December 2025
**Project**: CCPL ERP V12 - Inventory Management System
**Current Stack**: FastAPI + React 19 + MongoDB

---

## 📊 Current State Analysis

### ✅ What's Good:
- Modern tech stack (FastAPI, React 19, MongoDB)
- Good dependency choices (Motor for async, Pydantic v2, JWT auth)
- Component-based frontend architecture
- Code quality tools configured (black, isort, flake8, mypy)
- Design system in place (Shadcn UI + Tailwind)

### ⚠️ Critical Issues:
- **Monolithic backend**: 1,655 lines, 70+ endpoints in single file
- **No authentication implemented** (JWT dependencies exist but not used)
- **No authorization/RBAC** (Role-Based Access Control)
- **No API versioning**
- **No error handling middleware**
- **No request validation middleware**
- **No logging infrastructure**
- **No deployment configuration** (Docker, CI/CD)
- **No database migrations strategy**
- **No backup/recovery plan**
- **Direct MongoDB operations** (no abstraction layer)

---

## 🎯 CRITICAL PRIORITY (Fix Immediately)

### 1. Authentication & Authorization

#### Problem:
Currently NO authentication - anyone can access all endpoints.

#### Solution:

**Backend Structure:**
```
backend/
├── server.py (main app)
├── auth/
│   ├── __init__.py
│   ├── jwt_handler.py          # JWT token creation/validation
│   ├── password.py             # Password hashing
│   └── dependencies.py         # FastAPI dependencies
├── middleware/
│   ├── __init__.py
│   ├── auth_middleware.py      # Verify JWT on requests
│   └── error_handler.py        # Global error handling
└── models/
    ├── __init__.py
    └── user.py                 # User model with roles
```

**Implementation:**

```python
# backend/auth/jwt_handler.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

```python
# backend/auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .jwt_handler import verify_token

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return payload

async def require_role(*allowed_roles: str):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker
```

**Usage:**
```python
# Protected endpoint - any authenticated user
@app.get("/api/masters/items", dependencies=[Depends(get_current_user)])
async def get_items():
    ...

# Admin-only endpoint
@app.post("/api/masters/items", dependencies=[Depends(require_role("admin", "manager"))])
async def create_item():
    ...
```

**User Roles:**
- `admin`: Full system access
- `manager`: Create/update/delete (no system settings)
- `staff`: Read-only access
- `viewer`: Limited read access

---

### 2. Backend Modularization

#### Problem:
Single 1,655-line file is unmaintainable.

#### Solution:

**New Backend Structure:**
```
backend/
├── main.py                     # FastAPI app initialization
├── config.py                   # Configuration management
├── database.py                 # MongoDB connection
├── dependencies.py             # Shared dependencies
│
├── auth/                       # Authentication module
│   ├── __init__.py
│   ├── router.py               # /api/auth/* endpoints
│   ├── service.py              # Business logic
│   └── models.py               # Pydantic models
│
├── masters/                    # Masters module
│   ├── __init__.py
│   ├── items/
│   │   ├── router.py           # /api/masters/items/* endpoints
│   │   ├── service.py          # Business logic
│   │   ├── models.py           # Pydantic models
│   │   └── repository.py       # Database operations
│   ├── categories/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py
│   │   └── repository.py
│   ├── uoms/
│   │   └── ...
│   └── suppliers/
│       └── ...
│
├── inventory/                  # Inventory transactions
│   ├── __init__.py
│   ├── stock/
│   │   └── ...
│   ├── purchase/
│   │   └── ...
│   └── issuance/
│       └── ...
│
├── middleware/
│   ├── __init__.py
│   ├── auth.py
│   ├── cors.py
│   ├── logging.py
│   └── error_handler.py
│
├── utils/
│   ├── __init__.py
│   ├── logger.py
│   ├── validators.py
│   └── helpers.py
│
└── tests/                      # Tests mirror structure
    ├── test_auth/
    ├── test_masters/
    └── test_inventory/
```

**Migration Example:**

```python
# backend/masters/items/models.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import uuid4

class ItemBase(BaseModel):
    item_code: str
    item_name: str
    category_id: str
    uom: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    pass

class ItemInDB(ItemBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    is_active: bool = True

class ItemResponse(ItemInDB):
    pass
```

```python
# backend/masters/items/repository.py
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from .models import ItemInDB, ItemCreate, ItemUpdate

class ItemRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.items

    async def create(self, item: ItemCreate, user_id: str) -> ItemInDB:
        item_dict = item.model_dump()
        item_dict["created_by"] = user_id
        item_obj = ItemInDB(**item_dict)
        await self.collection.insert_one(item_obj.model_dump())
        return item_obj

    async def get_by_id(self, item_id: str) -> Optional[ItemInDB]:
        doc = await self.collection.find_one({"id": item_id}, {"_id": 0})
        return ItemInDB(**doc) if doc else None

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ItemInDB]:
        cursor = self.collection.find({}, {"_id": 0}).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [ItemInDB(**doc) for doc in docs]

    async def update(self, item_id: str, item: ItemUpdate) -> Optional[ItemInDB]:
        update_data = item.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()

        result = await self.collection.update_one(
            {"id": item_id},
            {"$set": update_data}
        )

        if result.modified_count:
            return await self.get_by_id(item_id)
        return None

    async def delete(self, item_id: str) -> bool:
        result = await self.collection.update_one(
            {"id": item_id},
            {"$set": {"is_active": False}}
        )
        return result.modified_count > 0
```

```python
# backend/masters/items/service.py
from .repository import ItemRepository
from .models import ItemCreate, ItemUpdate, ItemResponse
from typing import List

class ItemService:
    def __init__(self, repo: ItemRepository):
        self.repo = repo

    async def create_item(self, item: ItemCreate, user_id: str) -> ItemResponse:
        # Business logic here (validation, auto-code generation, etc.)
        created_item = await self.repo.create(item, user_id)
        return ItemResponse(**created_item.model_dump())

    async def get_item(self, item_id: str) -> Optional[ItemResponse]:
        item = await self.repo.get_by_id(item_id)
        return ItemResponse(**item.model_dump()) if item else None

    async def list_items(self, skip: int = 0, limit: int = 100) -> List[ItemResponse]:
        items = await self.repo.get_all(skip, limit)
        return [ItemResponse(**item.model_dump()) for item in items]

    async def update_item(self, item_id: str, item: ItemUpdate) -> Optional[ItemResponse]:
        updated = await self.repo.update(item_id, item)
        return ItemResponse(**updated.model_dump()) if updated else None

    async def delete_item(self, item_id: str) -> bool:
        return await self.repo.delete(item_id)
```

```python
# backend/masters/items/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ....auth.dependencies import get_current_user, require_role
from ....database import get_database
from .service import ItemService
from .repository import ItemRepository
from .models import ItemCreate, ItemUpdate, ItemResponse

router = APIRouter(prefix="/api/masters/items", tags=["Items"])

def get_item_service(db = Depends(get_database)) -> ItemService:
    repo = ItemRepository(db)
    return ItemService(repo)

@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: ItemCreate,
    service: ItemService = Depends(get_item_service),
    current_user: dict = Depends(require_role("admin", "manager"))
):
    return await service.create_item(item, current_user["user_id"])

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: str,
    service: ItemService = Depends(get_item_service),
    current_user: dict = Depends(get_current_user)
):
    item = await service.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.get("/", response_model=List[ItemResponse])
async def list_items(
    skip: int = 0,
    limit: int = 100,
    service: ItemService = Depends(get_item_service),
    current_user: dict = Depends(get_current_user)
):
    return await service.list_items(skip, limit)

@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: str,
    item: ItemUpdate,
    service: ItemService = Depends(get_item_service),
    current_user: dict = Depends(require_role("admin", "manager"))
):
    updated = await service.update_item(item_id, item)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: str,
    service: ItemService = Depends(get_item_service),
    current_user: dict = Depends(require_role("admin"))
):
    success = await service.delete_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
```

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .middleware.error_handler import error_handler_middleware
from .middleware.logging import logging_middleware
from .auth.router import router as auth_router
from .masters.items.router import router as items_router
from .masters.categories.router import router as categories_router
# ... other routers

app = FastAPI(
    title="CCPL ERP API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Middleware
app.middleware("http")(error_handler_middleware)
app.middleware("http")(logging_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(items_router)
app.include_router(categories_router)
# ... other routers

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

---

### 3. Error Handling & Logging

#### Problem:
No consistent error handling or logging.

#### Solution:

```python
# backend/middleware/error_handler.py
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)

async def error_handler_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except RequestValidationError as exc:
        logger.warning(f"Validation error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()}
        )
    except ValidationError as exc:
        logger.warning(f"Pydantic validation error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()}
        )
    except Exception as exc:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"}
        )
```

```python
# backend/utils/logger.py
import logging
import sys
from pathlib import Path

def setup_logger(name: str, log_file: str = None, level=logging.INFO):
    """Setup logger with both file and console handlers"""

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)

    # File handler (if log_file specified)
    if log_file:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        file_handler = logging.FileHandler(log_dir / log_file)
        file_handler.setLevel(level)
        file_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        file_handler.setFormatter(file_format)
        logger.addHandler(file_handler)

    return logger
```

```python
# backend/middleware/logging.py
from fastapi import Request
import time
import logging

logger = logging.getLogger(__name__)

async def logging_middleware(request: Request, call_next):
    start_time = time.time()

    logger.info(f"Request: {request.method} {request.url.path}")

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(
        f"Response: {request.method} {request.url.path} "
        f"Status: {response.status_code} Time: {process_time:.3f}s"
    )

    return response
```

---

### 4. Database Layer Improvements

#### Problem:
Direct MongoDB operations, no indexing, no migrations.

#### Solution:

```python
# backend/database.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None

    @classmethod
    async def connect(cls):
        """Connect to MongoDB"""
        mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        cls.client = AsyncIOMotorClient(mongo_url)
        logger.info("Connected to MongoDB")

    @classmethod
    async def close(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("Closed MongoDB connection")

    @classmethod
    def get_database(cls, db_name: str = None) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if not cls.client:
            raise RuntimeError("Database not connected")
        db_name = db_name or os.getenv("DB_NAME", "erp_db")
        return cls.client[db_name]

# Dependency for FastAPI
async def get_database() -> AsyncIOMotorDatabase:
    return Database.get_database()

# Startup/Shutdown events
async def startup_db():
    await Database.connect()
    await create_indexes()

async def shutdown_db():
    await Database.close()
```

```python
# backend/database/indexes.py
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

async def create_indexes(db: AsyncIOMotorDatabase):
    """Create all database indexes"""

    # Items indexes
    await db.items.create_index([("item_code", 1)], unique=True)
    await db.items.create_index([("category_id", 1)])
    await db.items.create_index([("is_active", 1)])
    await db.items.create_index([("item_name", "text")])  # Text search

    # Categories indexes
    await db.item_categories.create_index([("id", 1)], unique=True)
    await db.item_categories.create_index([("parent_category", 1)])
    await db.item_categories.create_index([("level", 1)])

    # Users indexes
    await db.users.create_index([("email", 1)], unique=True)
    await db.users.create_index([("username", 1)], unique=True)

    # Stock transactions indexes
    await db.stock_transactions.create_index([("item_id", 1)])
    await db.stock_transactions.create_index([("transaction_date", -1)])
    await db.stock_transactions.create_index([("transaction_type", 1)])

    logger.info("Database indexes created successfully")
```

**Database Migrations:**

Create a migrations folder:
```
backend/migrations/
├── __init__.py
├── versions/
│   ├── 001_initial_schema.py
│   ├── 002_add_user_roles.py
│   └── 003_add_allowed_uoms.py
└── migrate.py
```

```python
# backend/migrations/migrate.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import importlib
import os
from pathlib import Path

async def run_migrations():
    """Run all pending migrations"""
    client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
    db = client[os.getenv("DB_NAME")]

    # Get current migration version
    meta = await db.migrations.find_one({"_id": "version"})
    current_version = meta["version"] if meta else 0

    # Get all migration files
    migrations_dir = Path(__file__).parent / "versions"
    migration_files = sorted(migrations_dir.glob("*.py"))

    for migration_file in migration_files:
        version = int(migration_file.stem.split("_")[0])
        if version > current_version:
            print(f"Running migration {version}...")
            module = importlib.import_module(f"migrations.versions.{migration_file.stem}")
            await module.upgrade(db)

            # Update version
            await db.migrations.update_one(
                {"_id": "version"},
                {"$set": {"version": version}},
                upsert=True
            )
            print(f"Migration {version} completed")

    client.close()

if __name__ == "__main__":
    asyncio.run(run_migrations())
```

```python
# backend/migrations/versions/001_initial_schema.py
async def upgrade(db):
    """Initial schema setup"""

    # Create collections if they don't exist
    collections = await db.list_collection_names()

    if "users" not in collections:
        await db.create_collection("users")
        await db.users.create_index([("email", 1)], unique=True)

    if "items" not in collections:
        await db.create_collection("items")
        await db.items.create_index([("item_code", 1)], unique=True)

    # Add more collections...

async def downgrade(db):
    """Rollback migration"""
    # Implementation for rollback if needed
    pass
```

---

## 🔥 HIGH PRIORITY (Next 2 Weeks)

### 5. Frontend State Management

#### Problem:
Using local state and prop drilling. Will become unmaintainable as app grows.

#### Solution:

**Option A: Zustand (Recommended for your use case)**
```bash
npm install zustand
```

```javascript
// frontend/src/stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

```javascript
// frontend/src/stores/itemStore.js
import { create } from 'zustand';
import { mastersAPI } from '@/services/api';

export const useItemStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const response = await mastersAPI.getItems();
      set({ items: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addItem: async (item) => {
    try {
      const response = await mastersAPI.createItem(item);
      set((state) => ({ items: [...state.items, response.data] }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateItem: async (id, item) => {
    try {
      const response = await mastersAPI.updateItem(id, item);
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? response.data : i))
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      await mastersAPI.deleteItem(id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
```

**Usage:**
```javascript
// In your component
import { useItemStore } from '@/stores/itemStore';

const ItemMaster = () => {
  const { items, loading, error, fetchItems, addItem } = useItemStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // No more prop drilling, clean code
  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {items.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  );
};
```

---

### 6. API Layer Improvements

#### Problem:
Inconsistent error handling, no request/response interceptors, hardcoded URLs.

#### Solution:

```javascript
// frontend/src/services/apiClient.js
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`→ ${config.method.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`← ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { token } = response.data;
        useAuthStore.getState().updateToken(token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }

    // Handle 404 - Not Found
    if (error.response?.status === 404) {
      toast.error('Resource not found');
    }

    // Handle 422 - Validation Error
    if (error.response?.status === 422) {
      const errors = error.response.data.detail;
      if (Array.isArray(errors)) {
        errors.forEach((err) => {
          toast.error(`${err.loc.join('.')}: ${err.msg}`);
        });
      }
    }

    // Handle 500 - Server Error
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    }

    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
```

```javascript
// frontend/src/services/api.js
import apiClient from './apiClient';

export const mastersAPI = {
  // Items
  getItems: (params) => apiClient.get('/api/masters/items', { params }),
  getItem: (id) => apiClient.get(`/api/masters/items/${id}`),
  createItem: (data) => apiClient.post('/api/masters/items', data),
  updateItem: (id, data) => apiClient.put(`/api/masters/items/${id}`, data),
  deleteItem: (id) => apiClient.delete(`/api/masters/items/${id}`),

  // Categories
  getItemCategories: () => apiClient.get('/api/masters/item-categories'),
  createItemCategory: (data) => apiClient.post('/api/masters/item-categories', data),
  updateItemCategory: (id, data) => apiClient.put(`/api/masters/item-categories/${id}`, data),

  // UOMs
  getUOMs: () => apiClient.get('/api/masters/uoms'),
  createUOM: (data) => apiClient.post('/api/masters/uoms', data),
};

export const authAPI = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),
  register: (data) => apiClient.post('/api/auth/register', data),
  refreshToken: (refreshToken) => apiClient.post('/api/auth/refresh', { refresh_token: refreshToken }),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
};

export const inventoryAPI = {
  getStock: (params) => apiClient.get('/api/inventory/stock', { params }),
  createTransaction: (data) => apiClient.post('/api/inventory/transactions', data),
  getTransactions: (params) => apiClient.get('/api/inventory/transactions', { params }),
};
```

---

### 7. Environment Configuration

#### Problem:
Hardcoded configuration values.

#### Solution:

```bash
# backend/.env.example
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=erp_db

# Security
JWT_SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Application
ENVIRONMENT=development  # development, staging, production
DEBUG=true
LOG_LEVEL=INFO

# Email (for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@example.com

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=uploads
```

```python
# backend/config.py
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "CCPL ERP API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_VERSION: str = "v1"

    # Database
    MONGO_URL: str
    DB_NAME: str

    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

settings = Settings()
```

```javascript
// frontend/.env.example
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=CCPL ERP
VITE_ENVIRONMENT=development
VITE_ENABLE_ANALYTICS=false
```

```javascript
// frontend/src/config/index.js
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  appName: import.meta.env.VITE_APP_NAME || 'CCPL ERP',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
```

---

## 🎯 MEDIUM PRIORITY (Next Month)

### 8. TypeScript Migration (Frontend)

**Why?**
- Catch bugs at compile time
- Better IDE support
- Self-documenting code
- Easier refactoring

```bash
npm install --save-dev typescript @types/react @types/react-dom @types/node
```

```typescript
// frontend/src/types/models.ts
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  is_active: boolean;
  created_at: string;
}

export interface Item {
  id: string;
  item_code: string;
  item_name: string;
  category_id: string;
  uom: string;
  description?: string;
  min_stock_level?: number;
  reorder_qty?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  parent_category?: string;
  allowed_uoms: string[];
  level: number;
  is_active: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}
```

---

### 9. Testing Infrastructure

**Backend Testing:**

```python
# backend/tests/conftest.py
import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient
from main import app
from database import Database

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_db():
    """Setup test database"""
    test_client = AsyncIOMotorClient("mongodb://localhost:27017")
    test_db = test_client["erp_test_db"]

    yield test_db

    # Cleanup
    await test_client.drop_database("erp_test_db")
    test_client.close()

@pytest.fixture
async def client(test_db):
    """HTTP client for testing"""
    Database.client = test_db.client
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_client(client, test_db):
    """Authenticated client"""
    # Create test user
    user_data = {
        "email": "test@example.com",
        "password": "testpass123",
        "username": "testuser",
        "role": "admin"
    }
    await client.post("/api/auth/register", json=user_data)

    # Login
    response = await client.post("/api/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    token = response.json()["token"]

    # Set auth header
    client.headers["Authorization"] = f"Bearer {token}"

    return client
```

```python
# backend/tests/test_items.py
import pytest

@pytest.mark.asyncio
async def test_create_item(auth_client):
    """Test creating an item"""
    item_data = {
        "item_code": "TEST-001",
        "item_name": "Test Item",
        "category_id": "cat-001",
        "uom": "PCS"
    }

    response = await auth_client.post("/api/masters/items", json=item_data)

    assert response.status_code == 201
    data = response.json()
    assert data["item_code"] == item_data["item_code"]
    assert data["item_name"] == item_data["item_name"]

@pytest.mark.asyncio
async def test_get_items(auth_client):
    """Test getting items list"""
    response = await auth_client.get("/api/masters/items")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_unauthorized_access(client):
    """Test that unauthenticated requests are rejected"""
    response = await client.get("/api/masters/items")
    assert response.status_code == 401
```

**Frontend Testing:**

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

```javascript
// frontend/src/components/__tests__/ItemCard.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ItemCard from '../ItemCard';

describe('ItemCard', () => {
  const mockItem = {
    id: '1',
    item_code: 'TEST-001',
    item_name: 'Test Item',
    uom: 'PCS',
  };

  it('renders item details correctly', () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByText('TEST-001')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('PCS')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    const { user } = render(<ItemCard item={mockItem} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockItem);
  });
});
```

---

### 10. Docker & Deployment

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: erp_mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: erp_db
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - erp_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: erp_backend
    restart: unless-stopped
    environment:
      MONGO_URL: mongodb://admin:${MONGO_ROOT_PASSWORD}@mongodb:27017
      DB_NAME: erp_db
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    volumes:
      - ./backend/logs:/app/logs
      - ./backend/uploads:/app/uploads
    networks:
      - erp_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: erp_frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - erp_network

volumes:
  mongodb_data:

networks:
  erp_network:
    driver: bridge
```

---

## 📋 LONG-TERM IMPROVEMENTS

### 11. Caching Layer (Redis)

```python
# For frequently accessed data
import redis.asyncio as redis

class CacheService:
    def __init__(self):
        self.redis = redis.from_url("redis://localhost:6379")

    async def get_cached_items(self):
        cached = await self.redis.get("items:all")
        if cached:
            return json.loads(cached)
        return None

    async def cache_items(self, items, ttl=300):
        await self.redis.setex("items:all", ttl, json.dumps(items))
```

### 12. API Rate Limiting

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/masters/items")
@limiter.limit("100/minute")
async def get_items(request: Request):
    ...
```

### 13. Background Jobs (Celery)

```python
# For async tasks like:
# - Email notifications
# - Report generation
# - Data exports
# - Scheduled tasks (stock alerts, etc.)

from celery import Celery

celery_app = Celery(
    "erp_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@celery_app.task
def generate_stock_report(filters):
    # Generate report in background
    ...
```

### 14. Monitoring & Observability

- **Sentry**: Error tracking
- **Prometheus + Grafana**: Metrics and dashboards
- **ELK Stack**: Centralized logging

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Production:

- [ ] All sensitive data in environment variables
- [ ] HTTPS/TLS configured
- [ ] CORS properly configured
- [ ] Database indexes created
- [ ] Database backup strategy in place
- [ ] Rate limiting enabled
- [ ] Authentication working
- [ ] Role-based access control tested
- [ ] All tests passing
- [ ] Error monitoring setup (Sentry)
- [ ] Logging configured
- [ ] Health check endpoints working
- [ ] Documentation updated

### Production:

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify database backups
- [ ] Test rollback procedure
- [ ] Deploy to production
- [ ] Monitor for 24 hours

---

## 📊 RECOMMENDED TIMELINE

### Week 1-2: Foundation
1. Setup authentication & authorization
2. Split backend into modules (start with auth, then items)
3. Add error handling middleware
4. Setup logging

### Week 3-4: API & Database
1. Add API versioning
2. Implement repository pattern
3. Create database indexes
4. Setup migrations system

### Week 5-6: Frontend
1. Implement Zustand for state management
2. Improve API client with interceptors
3. Add proper error handling

### Week 7-8: Testing & DevOps
1. Write tests for critical paths
2. Setup Docker & docker-compose
3. Create CI/CD pipeline
4. Deploy to staging

---

## 🎯 PRIORITY MATRIX

```
HIGH IMPACT, HIGH EFFORT:
├─ Backend modularization ⭐⭐⭐⭐⭐
├─ Authentication/Authorization ⭐⭐⭐⭐⭐
└─ Error handling & logging ⭐⭐⭐⭐

HIGH IMPACT, LOW EFFORT:
├─ Environment configuration ⭐⭐⭐⭐
├─ API client improvements ⭐⭐⭐⭐
├─ Database indexes ⭐⭐⭐⭐
└─ Docker setup ⭐⭐⭐

LOW IMPACT, HIGH EFFORT:
├─ TypeScript migration
└─ Full test coverage

LOW IMPACT, LOW EFFORT:
├─ Zustand for state management ⭐⭐⭐
└─ Logging improvements ⭐⭐
```

---

## 💡 BEST PRACTICES TO FOLLOW

### Code Quality:
1. Use consistent naming conventions
2. Write self-documenting code
3. Keep functions small and focused
4. Avoid deep nesting (max 3 levels)
5. Use type hints (Python) / TypeScript
6. Write docstrings for all public functions
7. Keep files under 300 lines

### Git Workflow:
1. Use feature branches
2. Write meaningful commit messages
3. Use conventional commits (feat:, fix:, docs:)
4. Code review before merging
5. Keep main branch deployable

### Security:
1. Never commit secrets
2. Use environment variables
3. Validate all inputs
4. Sanitize outputs
5. Use parameterized queries
6. Implement rate limiting
7. Keep dependencies updated

### Performance:
1. Use indexes for database queries
2. Implement pagination
3. Use caching where appropriate
4. Optimize bundle size (frontend)
5. Use lazy loading
6. Monitor and profile regularly

---

## 📚 RESOURCES

### Documentation to Write:
1. **README.md**: Project overview, setup instructions
2. **API.md**: API documentation (or use Swagger)
3. **CONTRIBUTING.md**: How to contribute
4. **DEPLOYMENT.md**: Deployment procedures
5. **TROUBLESHOOTING.md**: Common issues and solutions

### Tools to Use:
- **FastAPI Docs**: Auto-generated at `/api/docs`
- **Postman/Insomnia**: API testing
- **MongoDB Compass**: Database GUI
- **Docker Desktop**: Container management
- **VSCode**: IDE with good Python/JS support

---

## ✅ SUMMARY

**Start Here (This Week):**
1. Authentication & Authorization
2. Split server.py into modules
3. Add error handling
4. Setup proper logging

**Do Next (Next Week):**
1. Database indexes
2. API client interceptors
3. Environment configuration
4. Docker setup

**Long Term (Next Month):**
1. TypeScript migration
2. Testing infrastructure
3. CI/CD pipeline
4. Production deployment

This roadmap will transform your ERP from a prototype to a production-ready, maintainable, scalable application. Focus on security and architecture first, then optimize and add features.

**Questions?** Refer back to this guide or check the official documentation for FastAPI, React, and MongoDB.
