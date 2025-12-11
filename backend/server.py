from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

# Create the main app
app = FastAPI(title="ERP Inventory Management System")
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ADMIN = "Admin"
    STORE = "Store"
    PURCHASE = "Purchase"
    QC = "QC"
    ACCOUNTS = "Accounts"

class InventoryType(str, Enum):
    RAW = "RAW"
    RM = "RM"
    CONSUMABLE = "CONSUMABLE"
    FG = "FG"
    PACKING = "PACKING"
    ACCESSORY = "ACCESSORY"
    GENERAL = "GENERAL"
    SERVICE = "SERVICE"

class ApprovalStatus(str, Enum):
    DRAFT = "Draft"
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class QCStatus(str, Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    PARTIAL = "Partial"

class StockAdjustmentReason(str, Enum):
    DAMAGED = "Damaged"
    EXPIRED = "Expired"
    FOUND = "Found"
    LOST = "Lost"
    RECONCILIATION = "Reconciliation"

# ============ Authentication Models ============
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    department: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# ============ Master Models ============
class ItemCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    name: str
    parent_category: Optional[str] = None
    item_type: Optional[str] = "RM"
    category_short_code: Optional[str] = None
    inventory_type: Optional[str] = "RM"
    default_uom: str = "PCS"
    allowed_uoms: List[str] = Field(default_factory=list)  # Multiple UOMs allowed for subcategories
    default_hsn: Optional[str] = None
    stock_account: Optional[str] = None
    expense_account: Optional[str] = None
    income_account: Optional[str] = None
    allow_purchase: bool = True
    allow_issue: bool = True
    status: str = "Active"
    level: Optional[int] = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ItemMaster(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_code: str
    item_name: str
    item_type: Optional[str] = None  # Auto-inherited from category (FAB, RM, FG, PKG, CNS, GEN, ACC)
    category_id: str
    category_name: Optional[str] = None
    description: Optional[str] = None
    
    # UOM & Conversion
    uom: str
    purchase_uom: Optional[str] = None
    conversion_factor: float = 1.0
    
    # Basic Attributes
    brand: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    type_specific_attributes: Optional[Dict[str, Any]] = None  # JSON field for type-specific data
    
    # Stock Management
    hsn: Optional[str] = None
    preferred_supplier_id: Optional[str] = None
    reorder_level: float = 0.0
    min_stock: float = 0.0
    max_stock: float = 0.0
    
    # Integration Fields - Future Ready
    # For Purchase Module
    last_purchase_rate: Optional[float] = None
    standard_cost: Optional[float] = None
    lead_time_days: Optional[int] = None
    
    # For Quality/GRN Module
    inspection_required: bool = False
    qc_template_id: Optional[str] = None
    
    # For Inventory Control
    is_batch_controlled: bool = False
    is_serial_controlled: bool = False
    shelf_life_days: Optional[int] = None
    
    # For BOM & Production Module
    make_or_buy: Optional[str] = "BUY"  # BUY, MAKE, or BOTH
    is_component: bool = False  # Can be used in BOM
    is_finished_good: bool = False  # Final product
    default_bom_id: Optional[str] = None
    
    # For Store Issue/Return
    issue_method: Optional[str] = "FIFO"  # FIFO, LIFO, BATCH
    default_issue_warehouse: Optional[str] = None
    
    # Accounting
    stock_account: Optional[str] = None
    expense_account: Optional[str] = None
    barcode: Optional[str] = None
    remarks: Optional[str] = None
    
    # Status
    status: str = "Active"
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

class UOMMaster(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    uom_name: str
    uom_type: str
    uom_category: str = "COUNT"  # WEIGHT, LENGTH, COUNT, VOLUME, AREA
    decimal_precision: int = 2
    symbol: Optional[str] = None
    is_base_unit: bool = False
    base_uom_id: Optional[str] = None
    base_uom_name: Optional[str] = None
    conversion_factor: float = 1.0
    conversions: Optional[Dict[str, float]] = None
    status: str = "Active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SupplierMaster(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    supplier_code: str
    name: str
    gst: Optional[str] = None
    pan: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    payment_terms: Optional[str] = None
    bank_details: Optional[Dict[str, str]] = None
    status: str = "Active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WarehouseMaster(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    warehouse_name: str
    warehouse_type: str
    location: Optional[str] = None
    capacity: Optional[float] = None
    parent_warehouse_id: Optional[str] = None
    status: str = "Active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BINLocationMaster(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bin_code: str
    bin_name: str
    warehouse_id: str
    aisle: Optional[str] = None
    rack: Optional[str] = None
    level: Optional[str] = None
    status: str = "Active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaxHSNMaster(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hsn_code: str
    description: str
    cgst_rate: float = 0.0
    sgst_rate: float = 0.0
    igst_rate: float = 0.0
    status: str = "Active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ Purchase Models ============
class PurchaseIndentItem(BaseModel):
    item_id: str
    item_name: str
    required_qty: float
    uom: str
    required_date: datetime
    remarks: Optional[str] = None

class PurchaseIndent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    indent_no: str
    department: str
    requested_by: str
    items: List[PurchaseIndentItem]
    status: ApprovalStatus = ApprovalStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    remarks: Optional[str] = None

class POItem(BaseModel):
    item_id: str
    item_name: str
    qty: float
    uom: str
    rate: float
    amount: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float

class PurchaseOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    po_no: str
    indent_id: Optional[str] = None
    supplier_id: str
    supplier_name: str
    items: List[POItem]
    subtotal: float
    tax_amount: float
    total_amount: float
    terms: Optional[str] = None
    status: ApprovalStatus = ApprovalStatus.DRAFT
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    remarks: Optional[str] = None

# ============ Quality Models ============
class QualityCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    qc_no: str
    grn_id: str
    grn_no: str
    po_id: str
    item_id: str
    item_name: str
    qty_received: float
    qty_accepted: float
    qty_rejected: float
    rejection_reason: Optional[str] = None
    qc_status: QCStatus
    inspected_by: str
    inspected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    remarks: Optional[str] = None

# ============ Inventory Models ============
class GRN(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    grn_no: str
    po_id: str
    po_no: str
    supplier_id: str
    supplier_name: str
    item_id: str
    item_name: str
    qty: float
    uom: str
    uom_id: Optional[str] = None
    base_qty: Optional[float] = None  # Converted to base UOM
    base_uom: Optional[str] = None
    warehouse_id: str
    invoice_no: Optional[str] = None
    invoice_date: Optional[datetime] = None
    transport_details: Optional[str] = None
    status: str = "Pending QC"
    received_by: str
    received_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StockInward(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    inward_no: str
    qc_id: str
    item_id: str
    item_name: str
    qty: float
    uom: str
    warehouse_id: str
    bin_location_id: Optional[str] = None
    batch_no: Optional[str] = None
    status: str = "Completed"
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StockTransfer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transfer_no: str
    from_warehouse_id: str
    from_warehouse_name: str
    to_warehouse_id: str
    to_warehouse_name: str
    item_id: str
    item_name: str
    qty: float
    uom: str
    status: ApprovalStatus = ApprovalStatus.PENDING
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None

class IssueToDepartment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    issue_no: str
    department: str
    item_id: str
    item_name: str
    qty: float
    uom: str
    uom_id: Optional[str] = None
    base_qty: Optional[float] = None
    base_uom: Optional[str] = None
    warehouse_id: str
    warehouse_name: str
    issued_by: str
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    remarks: Optional[str] = None

class ReturnFromDepartment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    return_no: str
    issue_id: Optional[str] = None
    department: str
    item_id: str
    item_name: str
    qty_returned: float
    uom: str
    uom_id: Optional[str] = None
    base_qty: Optional[float] = None
    base_uom: Optional[str] = None
    warehouse_id: str
    condition: str = "Good"
    returned_by: str
    returned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    remarks: Optional[str] = None

class StockAdjustment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    adjustment_no: str
    item_id: str
    item_name: str
    warehouse_id: str
    adjustment_qty: float
    uom: str
    reason: StockAdjustmentReason
    status: ApprovalStatus = ApprovalStatus.PENDING
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    remarks: Optional[str] = None

# ============ Stock Balance Model ============
class StockBalance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_id: str
    item_name: str
    warehouse_id: str
    warehouse_name: str
    qty: float = 0.0
    uom: str
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ Settings Models ============
class ApprovalFlow(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    flow_name: str
    document_type: str
    approvers: List[Dict[str, Any]]
    status: str = "Active"

class NumberSeries(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    series_type: str
    prefix: str
    current_number: int = 0
    padding: int = 4

# ============ Helper Functions ============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user: User) -> str:
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_next_number(series_type: str) -> str:
    series = await db.number_series.find_one({"series_type": series_type})
    if not series:
        series = {"series_type": series_type, "prefix": series_type[:3].upper(), "current_number": 0, "padding": 4}
        await db.number_series.insert_one(series)
    
    next_num = series['current_number'] + 1
    await db.number_series.update_one(
        {"series_type": series_type},
        {"$set": {"current_number": next_num}}
    )
    return f"{series['prefix']}{str(next_num).zfill(series['padding'])}"

async def convert_uom(qty: float, from_uom_id: str, to_uom_id: str) -> float:
    """Convert quantity from one UOM to another using conversion factors"""
    if from_uom_id == to_uom_id:
        return qty
    
    from_uom = await db.uoms.find_one({"id": from_uom_id})
    to_uom = await db.uoms.find_one({"id": to_uom_id})
    
    if not from_uom or not to_uom:
        return qty
    
    # Check if UOMs are in same category
    if from_uom.get('uom_category') != to_uom.get('uom_category'):
        raise HTTPException(status_code=400, detail="Cannot convert between different UOM categories")
    
    # Convert to base unit first, then to target unit
    qty_in_base = qty * from_uom.get('conversion_factor', 1.0)
    converted_qty = qty_in_base / to_uom.get('conversion_factor', 1.0)
    
    return round(converted_qty, to_uom.get('decimal_precision', 2))

async def get_item_type_code(item_type: str) -> str:
    """Get the type code prefix for item code generation"""
    type_code_mapping = {
        "FABRIC": "FAB",
        "RM": "RM",  # Raw Materials (Trims)
        "FG": "FG",  # Finished Goods
        "PACKING": "PKG",
        "CONSUMABLE": "CNS",
        "GENERAL": "GEN",
        "ACCESSORY": "ACC"
    }
    return type_code_mapping.get(item_type, "GEN")

async def generate_next_item_code(category_id: str) -> str:
    """Generate next item code based on category and item type
    Format: <TypeCode>-<CategoryShortCode>-<RunningNumber>
    Example: RM-LBL-0045, CNS-NDL-0102
    """
    # Get category details
    category = await db.item_categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    item_type = category.get('item_type', 'GENERAL')
    category_short_code = category.get('category_short_code') or category.get('code', 'GEN')
    
    # Get type code prefix
    type_code = await get_item_type_code(item_type)
    
    # Get next running number for this category
    counter_key = f"item_code_{category_id}"
    counter = await db.counters.find_one({"key": counter_key})
    
    if not counter:
        next_num = 1
        await db.counters.insert_one({"key": counter_key, "value": 1})
    else:
        next_num = counter['value'] + 1
        await db.counters.update_one({"key": counter_key}, {"$set": {"value": next_num}})
    
    # Format: TYPE-SHORTCODE-0001
    item_code = f"{type_code}-{category_short_code}-{str(next_num).zfill(4)}"
    return item_code

# ============ Authentication Routes ============
# ============ Authentication Routes (DISABLED) ============
# Authentication has been removed for direct access
# Uncomment below to re-enable authentication

# @api_router.post("/auth/register", response_model=User)
# async def register(user_create: UserCreate):
#     existing = await db.users.find_one({"email": user_create.email})
#     if existing:
#         raise HTTPException(status_code=400, detail="Email already registered")
#     
#     user_dict = user_create.model_dump()
#     password = user_dict.pop('password')
#     hashed_pwd = hash_password(password)
#     user = User(**user_dict)
#     
#     doc = user.model_dump()
#     doc['created_at'] = doc['created_at'].isoformat()
#     doc['password_hash'] = hashed_pwd
#     await db.users.insert_one(doc)
#     return user

# @api_router.post("/auth/login", response_model=Token)
# async def login(credentials: UserLogin):
#     user_doc = await db.users.find_one({"email": credentials.email})
#     if not user_doc or not verify_password(credentials.password, user_doc['password_hash']):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
#     
#     if isinstance(user_doc['created_at'], str):
#         user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
#     
#     user = User(**user_doc)
#     token = create_jwt_token(user)
#     return Token(access_token=token, token_type="bearer", user=user)

# @api_router.get("/auth/me", response_model=User)
# async def get_me():
#     # Returns first user as default
#     user_doc = await db.users.find_one({}, {"_id": 0})
#     if not user_doc:
#         raise HTTPException(status_code=404, detail="User not found")
#     if isinstance(user_doc['created_at'], str):
#         user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
#     return User(**user_doc)

@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

# ============ Item Category Routes ============
@api_router.post("/masters/item-categories", response_model=ItemCategory)
async def create_item_category(category: ItemCategory):
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.item_categories.insert_one(doc)
    return category

@api_router.get("/masters/item-categories", response_model=List[ItemCategory])
async def get_item_categories():
    categories = await db.item_categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat['created_at'], str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    # Debug: Log categories with UOMs
    cats_with_uoms = [c for c in categories if c.get('allowed_uoms')]
    if cats_with_uoms:
        print(f"📤 Backend GET: Found {len(cats_with_uoms)} categories with UOMs")
        for c in cats_with_uoms[:3]:  # Show first 3
            print(f"  - {c.get('name')}: allowed_uoms = {c.get('allowed_uoms')}")
    return categories

@api_router.get("/masters/item-categories/leaf-only")
async def get_leaf_categories():
    """Get only leaf categories (categories without children) - MUST come before {category_id} route"""
    all_categories = await db.item_categories.find({}, {"_id": 0}).to_list(1000)
    
    # Get all parent category IDs
    parent_ids = set()
    for cat in all_categories:
        if cat.get('parent_category'):
            parent_ids.add(cat['parent_category'])
    
    # Add is_leaf flag to all categories
    result = []
    for cat in all_categories:
        cat_copy = cat.copy()
        cat_copy['is_leaf'] = cat['id'] not in parent_ids
        if isinstance(cat_copy.get('created_at'), str):
            cat_copy['created_at'] = datetime.fromisoformat(cat_copy['created_at'])
        result.append(cat_copy)
    
    return result

@api_router.get("/masters/item-categories/{category_id}", response_model=ItemCategory)
async def get_item_category(category_id: str):
    category = await db.item_categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if isinstance(category['created_at'], str):
        category['created_at'] = datetime.fromisoformat(category['created_at'])
    return ItemCategory(**category)

@api_router.put("/masters/item-categories/{category_id}", response_model=ItemCategory)
async def update_item_category(category_id: str, category: ItemCategory):
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    print(f"🔧 Backend: Updating category {category_id}")
    print(f"📦 Backend: allowed_uoms in request = {category.allowed_uoms}")
    print(f"💾 Backend: Document to save = {doc.get('allowed_uoms')}")
    await db.item_categories.update_one({"id": category_id}, {"$set": doc})
    # Verify what was saved
    saved = await db.item_categories.find_one({"id": category_id}, {"_id": 0})
    print(f"✅ Backend: Saved allowed_uoms = {saved.get('allowed_uoms') if saved else 'NOT FOUND'}")
    return category

# Pydantic model for bulk update request
class BulkUpdateItemTypeRequest(BaseModel):
    category_ids: List[str]
    item_type: str

# Pydantic model for moving category request
class MoveCategoryRequest(BaseModel):
    category_id: str
    new_parent_id: Optional[str] = None  # None means move to root level

class MoveCategoryResponse(BaseModel):
    success: bool
    message: str
    affected_children_count: int
    items_count: int
    category_path: str

# Move category to a new parent (PATCH endpoint) - MUST come before parametrized routes
@api_router.patch("/masters/item-categories/move-category")
async def move_category(
    request: MoveCategoryRequest
):
    """
    Move a category to a new parent with validation
    - Prevents circular references (moving to own descendant)
    - Returns impact analysis (children count, items count)
    - Updates all descendants' item_type if needed
    """
    try:
        # Get the category to move
        category = await db.item_categories.find_one({"id": request.category_id}, {"_id": 0})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Fetch all categories to perform validation
        all_categories = await db.item_categories.find({}, {"_id": 0}).to_list(1000)
        
        # Helper function to get all descendants
        def get_descendants(cat_id: str, categories: List[Dict]) -> List[str]:
            descendants = []
            children = [c for c in categories if c.get('parent_category') == cat_id]
            for child in children:
                descendants.append(child['id'])
                descendants.extend(get_descendants(child['id'], categories))
            return descendants
        
        # Validation 1: Prevent circular reference (can't move to own descendant)
        if request.new_parent_id:
            descendant_ids = get_descendants(request.category_id, all_categories)
            if request.new_parent_id in descendant_ids:
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot move category to its own descendant. This would create a circular reference."
                )
            
            # Validation 2: Prevent moving to self
            if request.new_parent_id == request.category_id:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot move category to itself."
                )
        
        # Get new parent and determine new item_type
        new_parent = None
        new_item_type = category.get('item_type', 'RM')
        
        if request.new_parent_id:
            new_parent = await db.item_categories.find_one({"id": request.new_parent_id}, {"_id": 0})
            if not new_parent:
                raise HTTPException(status_code=404, detail="New parent category not found")
            new_item_type = new_parent.get('item_type', 'RM')
        
        # Calculate impact
        descendant_ids = get_descendants(request.category_id, all_categories)
        affected_children_count = len(descendant_ids)
        
        # Count items in this category
        items_count = await db.items.count_documents({"item_category_id": request.category_id})
        
        # Build category path for display
        def get_category_path(cat_id: str, categories: List[Dict]) -> str:
            cat = next((c for c in categories if c['id'] == cat_id), None)
            if not cat:
                return ""
            path = cat.get('category_name', cat.get('name', ''))
            if cat.get('parent_category'):
                parent_path = get_category_path(cat['parent_category'], categories)
                if parent_path:
                    path = f"{parent_path} > {path}"
            return path
        
        old_path = get_category_path(request.category_id, all_categories)
        new_parent_name = new_parent.get('category_name', new_parent.get('name', 'Root Level')) if new_parent else 'Root Level'
        new_path = f"{new_parent_name} > {category.get('category_name', category.get('name', ''))}"
        
        # Update the category's parent
        update_data = {
            "parent_category": request.new_parent_id,
            "item_type": new_item_type,
            "inventory_type": new_item_type
        }
        
        # Recalculate level
        if request.new_parent_id and new_parent:
            new_level = new_parent.get('level', 0) + 1
            update_data["level"] = new_level
        else:
            update_data["level"] = 0
        
        await db.item_categories.update_one(
            {"id": request.category_id},
            {"$set": update_data}
        )
        
        # Update all descendants' item_type if it changed
        if descendant_ids and new_item_type != category.get('item_type'):
            await db.item_categories.update_many(
                {"id": {"$in": descendant_ids}},
                {"$set": {
                    "item_type": new_item_type,
                    "inventory_type": new_item_type
                }}
            )
        
        return MoveCategoryResponse(
            success=True,
            message=f"Category moved successfully from '{old_path}' to '{new_path}'",
            affected_children_count=affected_children_count,
            items_count=items_count,
            category_path=new_path
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error moving category: {str(e)}")



# Bulk update item type for categories (PATCH endpoint) - MUST come before parametrized routes
@api_router.patch("/masters/item-categories/bulk-update-item-type")
async def bulk_update_item_type(
    request: BulkUpdateItemTypeRequest
):
    """Update item_type for multiple categories without affecting other fields"""
    try:
        result = await db.item_categories.update_many(
            {"id": {"$in": request.category_ids}},
            {"$set": {
                "item_type": request.item_type,
                "inventory_type": request.item_type
            }}
        )
        return {
            "updated_count": result.modified_count,
            "item_type": request.item_type
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.patch("/masters/item-categories/{category_id}")
async def patch_item_category(category_id: str, updates: Dict[str, Any]):
    """Partially update a category - only updates the provided fields"""
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    # Check if category exists
    existing = await db.item_categories.find_one({"id": category_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Update only the provided fields
    result = await db.item_categories.update_one(
        {"id": category_id},
        {"$set": updates}
    )
    
    if result.modified_count == 0:
        return {"message": "No changes made", "category_id": category_id}
    
    # Return updated category
    updated = await db.item_categories.find_one({"id": category_id}, {"_id": 0})
    return updated

@api_router.delete("/masters/item-categories/{category_id}")
async def delete_item_category(category_id: str):
    result = await db.item_categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# ============ Item Master Routes ============
@api_router.post("/masters/items", response_model=ItemMaster)
async def create_item(item: ItemMaster):
    # Auto-generate item_code if not provided or is "AUTO"
    if not item.item_code or item.item_code.upper() == "AUTO":
        item.item_code = await generate_next_item_code(item.category_id)
    
    # Get category details for item_type and category_name
    category = await db.item_categories.find_one({"id": item.category_id}, {"_id": 0})
    if category:
        item.item_type = category.get('item_type', 'GENERAL')
        item.category_name = category.get('name', '')
    
    doc = item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('updated_at'):
        doc['updated_at'] = doc['updated_at'].isoformat()
    await db.items.insert_one(doc)
    return item

@api_router.get("/masters/items", response_model=List[ItemMaster])
async def get_items():
    items = await db.items.find({}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item['created_at'], str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.get("/masters/items/preview/next-code")
async def preview_next_item_code(category_id: str):
    """Preview the next auto-generated item code for a category"""
    try:
        # Get category details
        category = await db.item_categories.find_one({"id": category_id}, {"_id": 0})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        item_type = category.get('item_type', 'GENERAL')
        category_short_code = category.get('category_short_code') or category.get('code', 'GEN')
        
        # Get type code prefix
        type_code = await get_item_type_code(item_type)
        
        # Get next running number (without incrementing)
        counter_key = f"item_code_{category_id}"
        counter = await db.counters.find_one({"key": counter_key})
        next_num = (counter['value'] + 1) if counter else 1
        
        # Format preview code
        preview_code = f"{type_code}-{category_short_code}-{str(next_num).zfill(4)}"
        
        return {
            "preview_code": preview_code,
            "item_type": item_type,
            "type_code": type_code,
            "category_short_code": category_short_code,
            "running_number": next_num
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/masters/items/validate/name")
async def validate_item_name(item_name: str, category_id: str, item_id: Optional[str] = None):
    """Validate if item name is unique within the category"""
    query = {"item_name": item_name, "category_id": category_id}
    
    # Exclude current item if updating
    if item_id:
        query["id"] = {"$ne": item_id}
    
    existing = await db.items.find_one(query, {"_id": 0})
    
    return {
        "is_unique": existing is None,
        "exists": existing is not None,
        "message": "Item name already exists in this category" if existing else "Item name is unique"
    }

# ============ Integration-Ready Helper Endpoints (MUST come before {item_id} route) ============

@api_router.get("/masters/items/by-code/{item_code}")
async def get_item_by_code(item_code: str):
    """Get item details by item code - Useful for Purchase/GRN modules"""
    item = await db.items.find_one({"item_code": item_code}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    if isinstance(item.get('updated_at'), str):
        item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    return item

@api_router.get("/masters/items/by-category/{category_id}")
async def get_items_by_category(category_id: str):
    """Get all items in a category - Useful for BOM/Production modules"""
    items = await db.items.find({"category_id": category_id}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        if isinstance(item.get('updated_at'), str):
            item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    return items

@api_router.get("/masters/items/by-type/{item_type}")
async def get_items_by_type(item_type: str):
    """Get all items of a specific type - Useful for filtering RM, FG, etc."""
    items = await db.items.find({"item_type": item_type, "is_active": True}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        if isinstance(item.get('updated_at'), str):
            item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    return items

@api_router.get("/masters/items/components")
async def get_component_items():
    """Get all items that can be used as components in BOM"""
    items = await db.items.find({"is_component": True, "is_active": True}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        if isinstance(item.get('updated_at'), str):
            item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    return items

@api_router.get("/masters/items/finished-goods")
async def get_finished_goods():
    """Get all finished good items"""
    items = await db.items.find({"is_finished_good": True, "is_active": True}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        if isinstance(item.get('updated_at'), str):
            item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    return items

@api_router.get("/masters/items/low-stock")
async def get_low_stock_items():
    """Get items below reorder level - For Purchase Indent automation"""
    items = await db.items.find({"is_active": True}, {"_id": 0}).to_list(1000)
    low_stock_items = []
    
    for item in items:
        # Get current stock from stock_balance
        stock = await db.stock_balance.find_one({"item_id": item['id']}, {"_id": 0})
        current_stock = sum([s.get('qty', 0) for s in await db.stock_balance.find({"item_id": item['id']}, {"_id": 0}).to_list(100)]) if stock else 0
        
        if current_stock <= item.get('reorder_level', 0):
            item['current_stock'] = current_stock
            item['shortage'] = item.get('reorder_level', 0) - current_stock
            if isinstance(item.get('created_at'), str):
                item['created_at'] = datetime.fromisoformat(item['created_at'])
            if isinstance(item.get('updated_at'), str):
                item['updated_at'] = datetime.fromisoformat(item['updated_at'])
            low_stock_items.append(item)
    
    return low_stock_items

@api_router.get("/masters/items/search")
async def search_items(
    q: str,
    item_type: Optional[str] = None,
    category_id: Optional[str] = None,
    limit: int = 50
):
    """Search items by name or code - Useful for all transaction modules"""
    query = {
        "$or": [
            {"item_name": {"$regex": q, "$options": "i"}},
            {"item_code": {"$regex": q, "$options": "i"}}
        ],
        "is_active": True
    }
    
    if item_type:
        query["item_type"] = item_type
    if category_id:
        query["category_id"] = category_id
    
    items = await db.items.find(query, {"_id": 0}).limit(limit).to_list(limit)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        if isinstance(item.get('updated_at'), str):
            item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    
    return items

@api_router.get("/masters/items/{item_id}", response_model=ItemMaster)
async def get_item(item_id: str):
    item = await db.items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if isinstance(item['created_at'], str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    return ItemMaster(**item)

@api_router.put("/masters/items/{item_id}", response_model=ItemMaster)
async def update_item(item_id: str, item: ItemMaster):
    # Set updated_at timestamp
    item.updated_at = datetime.now(timezone.utc)
    
    # Get category details for item_type and category_name
    category = await db.item_categories.find_one({"id": item.category_id}, {"_id": 0})
    if category:
        item.item_type = category.get('item_type', 'GENERAL')
        item.category_name = category.get('name', '')
    
    doc = item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('updated_at'):
        doc['updated_at'] = doc['updated_at'].isoformat()
    await db.items.update_one({"id": item_id}, {"$set": doc})
    return item

@api_router.delete("/masters/items/{item_id}")
async def delete_item(item_id: str):
    result = await db.items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

@api_router.get("/masters/items/preview/next-code")
async def preview_next_item_code(category_id: str):
    """Preview the next auto-generated item code for a category"""
    try:
        # Get category details
        category = await db.item_categories.find_one({"id": category_id}, {"_id": 0})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        item_type = category.get('item_type', 'GENERAL')
        category_short_code = category.get('category_short_code') or category.get('code', 'GEN')
        
        # Get type code prefix
        type_code = await get_item_type_code(item_type)
        
        # Get next running number (without incrementing)
        counter_key = f"item_code_{category_id}"
        counter = await db.counters.find_one({"key": counter_key})
        next_num = (counter['value'] + 1) if counter else 1
        
        # Format preview code
        preview_code = f"{type_code}-{category_short_code}-{str(next_num).zfill(4)}"
        
        return {
            "preview_code": preview_code,
            "item_type": item_type,
            "type_code": type_code,
            "category_short_code": category_short_code,
            "running_number": next_num
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/masters/items/validate/name")
async def validate_item_name(item_name: str, category_id: str, item_id: Optional[str] = None):
    """Validate if item name is unique within the category"""
    query = {"item_name": item_name, "category_id": category_id}
    
    # Exclude current item if updating
    if item_id:
        query["id"] = {"$ne": item_id}
    
    existing = await db.items.find_one(query, {"_id": 0})
    
    return {
        "is_unique": existing is None,
        "exists": existing is not None,
        "message": "Item name already exists in this category" if existing else "Item name is unique"
    }

@api_router.patch("/masters/items/{item_id}/update-cost")
async def update_item_cost(
    item_id: str,
    last_purchase_rate: Optional[float] = None,
    standard_cost: Optional[float] = None
):
    """Update item cost after purchase - Called from GRN module"""
    updates = {}
    if last_purchase_rate is not None:
        updates['last_purchase_rate'] = last_purchase_rate
    if standard_cost is not None:
        updates['standard_cost'] = standard_cost
    
    if updates:
        updates['updated_at'] = datetime.now(timezone.utc).isoformat()
        result = await db.items.update_one({"id": item_id}, {"$set": updates})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Item not found or no changes made")
        return {"message": "Item cost updated successfully", "updates": updates}
    
    raise HTTPException(status_code=400, detail="No cost updates provided")

# ============ UOM Master Routes ============
@api_router.post("/masters/uoms", response_model=UOMMaster)
async def create_uom(uom: UOMMaster):
    doc = uom.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.uoms.insert_one(doc)
    return uom

@api_router.get("/masters/uoms", response_model=List[UOMMaster])
async def get_uoms():
    uoms = await db.uoms.find({}, {"_id": 0}).to_list(1000)
    for uom in uoms:
        if isinstance(uom['created_at'], str):
            uom['created_at'] = datetime.fromisoformat(uom['created_at'])
    return uoms

@api_router.get("/masters/uoms/convert")
async def convert_uom_quantity(
    qty: float,
    from_uom_id: str,
    to_uom_id: str
):
    """Convert quantity between UOMs"""
    try:
        converted_qty = await convert_uom(qty, from_uom_id, to_uom_id)
        return {
            "original_qty": qty,
            "from_uom_id": from_uom_id,
            "converted_qty": converted_qty,
            "to_uom_id": to_uom_id
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============ Supplier Master Routes ============
@api_router.post("/masters/suppliers", response_model=SupplierMaster)
async def create_supplier(supplier: SupplierMaster):
    doc = supplier.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.suppliers.insert_one(doc)
    return supplier

@api_router.get("/masters/suppliers", response_model=List[SupplierMaster])
async def get_suppliers():
    suppliers = await db.suppliers.find({}, {"_id": 0}).to_list(1000)
    for supplier in suppliers:
        if isinstance(supplier['created_at'], str):
            supplier['created_at'] = datetime.fromisoformat(supplier['created_at'])
    return suppliers

# ============ Warehouse Master Routes ============
@api_router.post("/masters/warehouses", response_model=WarehouseMaster)
async def create_warehouse(warehouse: WarehouseMaster):
    doc = warehouse.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.warehouses.insert_one(doc)
    return warehouse

@api_router.get("/masters/warehouses", response_model=List[WarehouseMaster])
async def get_warehouses():
    warehouses = await db.warehouses.find({}, {"_id": 0}).to_list(1000)
    for warehouse in warehouses:
        if isinstance(warehouse['created_at'], str):
            warehouse['created_at'] = datetime.fromisoformat(warehouse['created_at'])
    return warehouses

# ============ BIN Location Routes ============
@api_router.post("/masters/bin-locations", response_model=BINLocationMaster)
async def create_bin_location(bin_loc: BINLocationMaster):
    doc = bin_loc.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.bin_locations.insert_one(doc)
    return bin_loc

@api_router.get("/masters/bin-locations", response_model=List[BINLocationMaster])
async def get_bin_locations():
    bins = await db.bin_locations.find({}, {"_id": 0}).to_list(1000)
    for bin_loc in bins:
        if isinstance(bin_loc['created_at'], str):
            bin_loc['created_at'] = datetime.fromisoformat(bin_loc['created_at'])
    return bins

# ============ Tax/HSN Master Routes ============
@api_router.post("/masters/tax-hsn", response_model=TaxHSNMaster)
async def create_tax_hsn(tax: TaxHSNMaster):
    doc = tax.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.tax_hsn.insert_one(doc)
    return tax

@api_router.get("/masters/tax-hsn", response_model=List[TaxHSNMaster])
async def get_tax_hsn():
    taxes = await db.tax_hsn.find({}, {"_id": 0}).to_list(1000)
    for tax in taxes:
        if isinstance(tax['created_at'], str):
            tax['created_at'] = datetime.fromisoformat(tax['created_at'])
    return taxes

# ============ Color Master Routes ============
@api_router.get("/masters/colors")
async def get_colors():
    colors = await db.colors.find({}, {"_id": 0}).to_list(1000)
    return colors

@api_router.post("/masters/colors")
async def create_color(data: Dict[str, Any]):
    await db.colors.insert_one(data)
    return data

# ============ Size Master Routes ============
@api_router.get("/masters/sizes")
async def get_sizes():
    sizes = await db.sizes.find({}, {"_id": 0}).to_list(1000)
    return sizes

@api_router.post("/masters/sizes")
async def create_size(data: Dict[str, Any]):
    await db.sizes.insert_one(data)
    return data

# ============ Brand Master Routes ============
@api_router.get("/masters/brands")
async def get_brands():
    brands = await db.brands.find({}, {"_id": 0}).to_list(1000)
    return brands

@api_router.post("/masters/brands")
async def create_brand(data: Dict[str, Any]):
    await db.brands.insert_one(data)
    return data

# ============ Purchase Indent Routes ============
@api_router.post("/purchase/indents", response_model=PurchaseIndent)
async def create_indent(indent: PurchaseIndent):
    if not indent.indent_no:
        indent.indent_no = await get_next_number("Purchase_Indent")
    doc = indent.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    for item in doc['items']:
        item['required_date'] = item['required_date'].isoformat()
    await db.purchase_indents.insert_one(doc)
    return indent

@api_router.get("/purchase/indents", response_model=List[PurchaseIndent])
async def get_indents():
    indents = await db.purchase_indents.find({}, {"_id": 0}).to_list(1000)
    for indent in indents:
        if isinstance(indent['created_at'], str):
            indent['created_at'] = datetime.fromisoformat(indent['created_at'])
        for item in indent['items']:
            if isinstance(item['required_date'], str):
                item['required_date'] = datetime.fromisoformat(item['required_date'])
    return indents

# ============ Purchase Order Routes ============
@api_router.post("/purchase/orders", response_model=PurchaseOrder)
async def create_po(po: PurchaseOrder):
    if not po.po_no:
        po.po_no = await get_next_number("Purchase_Order")
    doc = po.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('approved_at'):
        doc['approved_at'] = doc['approved_at'].isoformat()
    await db.purchase_orders.insert_one(doc)
    return po

@api_router.get("/purchase/orders", response_model=List[PurchaseOrder])
async def get_pos():
    pos = await db.purchase_orders.find({}, {"_id": 0}).to_list(1000)
    for po in pos:
        if isinstance(po['created_at'], str):
            po['created_at'] = datetime.fromisoformat(po['created_at'])
        if po.get('approved_at') and isinstance(po['approved_at'], str):
            po['approved_at'] = datetime.fromisoformat(po['approved_at'])
    return pos

@api_router.put("/purchase/orders/{po_id}/approve")
async def approve_po(po_id: str, remarks: Optional[str] = None):
    await db.purchase_orders.update_one(
        {"id": po_id},
        {"$set": {
            "status": ApprovalStatus.APPROVED,
            "approved_by": current_user['user_id'],
            "approved_at": datetime.now(timezone.utc).isoformat(),
            "remarks": remarks
        }}
    )
    return {"message": "PO approved successfully"}

@api_router.put("/purchase/orders/{po_id}/reject")
async def reject_po(po_id: str, remarks: Optional[str] = None):
    await db.purchase_orders.update_one(
        {"id": po_id},
        {"$set": {
            "status": ApprovalStatus.REJECTED,
            "approved_by": current_user['user_id'],
            "approved_at": datetime.now(timezone.utc).isoformat(),
            "remarks": remarks
        }}
    )
    return {"message": "PO rejected successfully"}

# ============ GRN Routes ============
@api_router.post("/inventory/grn", response_model=GRN)
async def create_grn(grn: GRN):
    if not grn.grn_no:
        grn.grn_no = await get_next_number("GRN")
    doc = grn.model_dump()
    doc['received_at'] = doc['received_at'].isoformat()
    if doc.get('invoice_date'):
        doc['invoice_date'] = doc['invoice_date'].isoformat()
    await db.grn.insert_one(doc)
    return grn

@api_router.get("/inventory/grn", response_model=List[GRN])
async def get_grns():
    grns = await db.grn.find({}, {"_id": 0}).to_list(1000)
    for grn in grns:
        if isinstance(grn['received_at'], str):
            grn['received_at'] = datetime.fromisoformat(grn['received_at'])
        if grn.get('invoice_date') and isinstance(grn['invoice_date'], str):
            grn['invoice_date'] = datetime.fromisoformat(grn['invoice_date'])
    return grns

# ============ Quality Check Routes ============
@api_router.post("/quality/checks", response_model=QualityCheck)
async def create_qc(qc: QualityCheck):
    if not qc.qc_no:
        qc.qc_no = await get_next_number("QC")
    doc = qc.model_dump()
    doc['inspected_at'] = doc['inspected_at'].isoformat()
    await db.quality_checks.insert_one(doc)
    
    # Update GRN status
    if qc.qc_status == QCStatus.ACCEPTED:
        await db.grn.update_one({"id": qc.grn_id}, {"$set": {"status": "QC Passed"}})
    elif qc.qc_status == QCStatus.REJECTED:
        await db.grn.update_one({"id": qc.grn_id}, {"$set": {"status": "QC Failed"}})
    
    return qc

@api_router.get("/quality/checks", response_model=List[QualityCheck])
async def get_qcs():
    qcs = await db.quality_checks.find({}, {"_id": 0}).to_list(1000)
    for qc in qcs:
        if isinstance(qc['inspected_at'], str):
            qc['inspected_at'] = datetime.fromisoformat(qc['inspected_at'])
    return qcs

# ============ Stock Inward Routes ============
@api_router.post("/inventory/stock-inward", response_model=StockInward)
async def create_stock_inward(inward: StockInward):
    if not inward.inward_no:
        inward.inward_no = await get_next_number("INWARD")
    doc = inward.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.stock_inward.insert_one(doc)
    
    # Update stock balance
    stock = await db.stock_balance.find_one({"item_id": inward.item_id, "warehouse_id": inward.warehouse_id})
    if stock:
        new_qty = stock['qty'] + inward.qty
        await db.stock_balance.update_one(
            {"item_id": inward.item_id, "warehouse_id": inward.warehouse_id},
            {"$set": {"qty": new_qty, "last_updated": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        warehouse = await db.warehouses.find_one({"id": inward.warehouse_id})
        stock_doc = {
            "id": str(uuid.uuid4()),
            "item_id": inward.item_id,
            "item_name": inward.item_name,
            "warehouse_id": inward.warehouse_id,
            "warehouse_name": warehouse['warehouse_name'] if warehouse else "",
            "qty": inward.qty,
            "uom": inward.uom,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        await db.stock_balance.insert_one(stock_doc)
    
    return inward

@api_router.get("/inventory/stock-inward", response_model=List[StockInward])
async def get_stock_inwards():
    inwards = await db.stock_inward.find({}, {"_id": 0}).to_list(1000)
    for inward in inwards:
        if isinstance(inward['created_at'], str):
            inward['created_at'] = datetime.fromisoformat(inward['created_at'])
    return inwards

# ============ Stock Transfer Routes ============
@api_router.post("/inventory/stock-transfer", response_model=StockTransfer)
async def create_stock_transfer(transfer: StockTransfer):
    if not transfer.transfer_no:
        transfer.transfer_no = await get_next_number("TRANSFER")
    doc = transfer.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('approved_at'):
        doc['approved_at'] = doc['approved_at'].isoformat()
    await db.stock_transfer.insert_one(doc)
    return transfer

@api_router.get("/inventory/stock-transfer", response_model=List[StockTransfer])
async def get_stock_transfers():
    transfers = await db.stock_transfer.find({}, {"_id": 0}).to_list(1000)
    for transfer in transfers:
        if isinstance(transfer['created_at'], str):
            transfer['created_at'] = datetime.fromisoformat(transfer['created_at'])
        if transfer.get('approved_at') and isinstance(transfer['approved_at'], str):
            transfer['approved_at'] = datetime.fromisoformat(transfer['approved_at'])
    return transfers

# ============ Issue to Department Routes ============
@api_router.post("/inventory/issue", response_model=IssueToDepartment)
async def create_issue(issue: IssueToDepartment):
    if not issue.issue_no:
        issue.issue_no = await get_next_number("ISSUE")
    
    # Check stock availability
    stock = await db.stock_balance.find_one({"item_id": issue.item_id, "warehouse_id": issue.warehouse_id})
    if not stock or stock['qty'] < issue.qty:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    doc = issue.model_dump()
    doc['issued_at'] = doc['issued_at'].isoformat()
    await db.issues.insert_one(doc)
    
    # Update stock balance
    new_qty = stock['qty'] - issue.qty
    await db.stock_balance.update_one(
        {"item_id": issue.item_id, "warehouse_id": issue.warehouse_id},
        {"$set": {"qty": new_qty, "last_updated": datetime.now(timezone.utc).isoformat()}}
    )
    
    return issue

@api_router.get("/inventory/issue", response_model=List[IssueToDepartment])
async def get_issues():
    issues = await db.issues.find({}, {"_id": 0}).to_list(1000)
    for issue in issues:
        if isinstance(issue['issued_at'], str):
            issue['issued_at'] = datetime.fromisoformat(issue['issued_at'])
    return issues

# ============ Return from Department Routes ============
@api_router.post("/inventory/return", response_model=ReturnFromDepartment)
async def create_return(ret: ReturnFromDepartment):
    if not ret.return_no:
        ret.return_no = await get_next_number("RETURN")
    doc = ret.model_dump()
    doc['returned_at'] = doc['returned_at'].isoformat()
    await db.returns.insert_one(doc)
    
    # Update stock balance if condition is good
    if ret.condition == "Good":
        stock = await db.stock_balance.find_one({"item_id": ret.item_id, "warehouse_id": ret.warehouse_id})
        if stock:
            new_qty = stock['qty'] + ret.qty_returned
            await db.stock_balance.update_one(
                {"item_id": ret.item_id, "warehouse_id": ret.warehouse_id},
                {"$set": {"qty": new_qty, "last_updated": datetime.now(timezone.utc).isoformat()}}
            )
    
    return ret

@api_router.get("/inventory/return", response_model=List[ReturnFromDepartment])
async def get_returns():
    returns = await db.returns.find({}, {"_id": 0}).to_list(1000)
    for ret in returns:
        if isinstance(ret['returned_at'], str):
            ret['returned_at'] = datetime.fromisoformat(ret['returned_at'])
    return returns

# ============ Stock Adjustment Routes ============
@api_router.post("/inventory/adjustment", response_model=StockAdjustment)
async def create_adjustment(adjustment: StockAdjustment):
    if not adjustment.adjustment_no:
        adjustment.adjustment_no = await get_next_number("ADJUSTMENT")
    doc = adjustment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('approved_at'):
        doc['approved_at'] = doc['approved_at'].isoformat()
    await db.adjustments.insert_one(doc)
    return adjustment

@api_router.get("/inventory/adjustment", response_model=List[StockAdjustment])
async def get_adjustments():
    adjustments = await db.adjustments.find({}, {"_id": 0}).to_list(1000)
    for adj in adjustments:
        if isinstance(adj['created_at'], str):
            adj['created_at'] = datetime.fromisoformat(adj['created_at'])
        if adj.get('approved_at') and isinstance(adj['approved_at'], str):
            adj['approved_at'] = datetime.fromisoformat(adj['approved_at'])
    return adjustments

# ============ Stock Balance Routes ============
@api_router.get("/inventory/stock-balance", response_model=List[StockBalance])
async def get_stock_balance():
    stocks = await db.stock_balance.find({}, {"_id": 0}).to_list(1000)
    for stock in stocks:
        if isinstance(stock['last_updated'], str):
            stock['last_updated'] = datetime.fromisoformat(stock['last_updated'])
    return stocks

# ============ Dashboard Stats ============
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total_items = await db.items.count_documents({"status": "Active"})
    total_suppliers = await db.suppliers.count_documents({"status": "Active"})
    pending_pos = await db.purchase_orders.count_documents({"status": ApprovalStatus.PENDING})
    pending_approvals = await db.purchase_orders.count_documents({"status": ApprovalStatus.PENDING})
    
    # Low stock items
    items = await db.items.find({"status": "Active"}, {"_id": 0}).to_list(1000)
    low_stock_count = 0
    for item in items:
        stock = await db.stock_balance.find_one({"item_id": item['id']})
        total_stock = stock['qty'] if stock else 0
        if total_stock <= item['reorder_level']:
            low_stock_count += 1
    
    return {
        "total_items": total_items,
        "total_suppliers": total_suppliers,
        "low_stock_alerts": low_stock_count,
        "pending_pos": pending_pos,
        "pending_approvals": pending_approvals
    }

# ============ Reports ============
@api_router.get("/reports/stock-ledger")
async def stock_ledger_report(item_id: Optional[str] = None, warehouse_id: Optional[str] = None):
    query = {}
    if item_id:
        query['item_id'] = item_id
    if warehouse_id:
        query['warehouse_id'] = warehouse_id
    
    stocks = await db.stock_balance.find(query, {"_id": 0}).to_list(1000)
    return stocks

@api_router.get("/reports/issue-register")
async def issue_register_report(start_date: Optional[str] = None, end_date: Optional[str] = None):
    issues = await db.issues.find({}, {"_id": 0}).to_list(1000)
    for issue in issues:
        if isinstance(issue['issued_at'], str):
            issue['issued_at'] = datetime.fromisoformat(issue['issued_at'])
    return issues

@api_router.get("/reports/pending-po")
async def pending_po_report():
    pos = await db.purchase_orders.find({"status": {"$in": [ApprovalStatus.PENDING, ApprovalStatus.DRAFT]}}, {"_id": 0}).to_list(1000)
    for po in pos:
        if isinstance(po['created_at'], str):
            po['created_at'] = datetime.fromisoformat(po['created_at'])
    return pos

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
