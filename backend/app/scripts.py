from fastapi import APIRouter, Body, Depends, HTTPException
from database import get_database
from datetime import datetime
from models import Script
from bson import ObjectId

router = APIRouter(prefix="/scripts", tags=["scripts"])
db = get_database()

@router.get("/get_scripts")
async def get_scripts():
    scripts =await db.scripts.find().to_list(length=100)
    for script in scripts:
        script["_id"] = str(script["_id"])
    return scripts

@router.post("/save_script")
async def save_script(script: Script = Body(...)):
    script_data = script.model_dump()

    existing_script = await db.scripts.find_one({"_id": ObjectId(script_data["_id"])})
    if existing_script:
        return await update_script(script)
    else:
        return await create_script(script)

async def create_script(script: Script = Body(...)):
    script_data = script.model_dump()
    script_data["created_at"] = datetime.now()
    script = await db.scripts.insert_one(script_data)
    script_data["_id"] = str(script.inserted_id)
    script_data["created_at"] = str(script_data["created_at"])
    script_data["updated_at"] = str(script_data["updated_at"])
    return script_data

async def update_script(script: Script = Body(...)):
    script_data = script.model_dump()
    script_data.pop("_id")
    _id = script_data.pop("_id")
    script = await db.scripts.update_one({"_id": _id}, {"$set": script_data})
    script_data["_id"] = _id
    script_data["created_at"] = str(script_data["created_at"])
    script_data["updated_at"] = str(script_data["updated_at"])
    return script_data

@router.delete("/delete_script")
async def delete_script(_id: str)
    if _id in script_data:
        
    pass
