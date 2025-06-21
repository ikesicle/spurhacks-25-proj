from .database import scripts_collection
from .models import ScriptCreate
from bson import ObjectId

async def create_script(script: ScriptCreate):
    doc = script.dict()
    result = await scripts_collection.insert_one(doc)
    return await scripts_collection.find_one({"_id": result.inserted_id})

async def get_scripts(skip: int = 0, limit: int = 100):
    cursor = scripts_collection.find().skip(skip).limit(limit)
    return await cursor.to_list(length=limit)

async def get_script_by_name(name: str):
    return await scripts_collection.find_one({"name": name})

async def search_scripts(query: str):
    # Basic text search on name, tags, description, content
    q = {
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"tags": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"content": {"$regex": query, "$options": "i"}},
        ]
    }
    cursor = scripts_collection.find(q)
    return await cursor.to_list(length=100)