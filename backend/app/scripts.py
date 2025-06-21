import fastapi
from fastapi import APIRouter
from database import get_database
from datetime import datetime

router = APIRouter(prefix="/scripts", tags=["scripts"])
db = get_database()

@router.get("/get_scripts")
async def get_scripts():
    return {"message": "Hello, World!"}

@router.post("/create_script")
async def create_script():
    script_data = {
        "name": "Test Script",
        "description": "This is a test script",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    script = await db.scripts.insert_one(script_data)
    script_data["_id"] = str(script.inserted_id)
    script_data["created_at"] = str(script_data["created_at"])
    script_data["updated_at"] = str(script_data["updated_at"])
    return script_data