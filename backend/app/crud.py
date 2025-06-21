from database import scripts_collection
from models import ScriptCreate
from bson import ObjectId
from typing import Optional

async def create_script(
    name: str, language: str, content: str, tags: str = "", description: str = ""
):
    """Creates a script in the database."""
    script = ScriptCreate(
        name=name,
        language=language,
        tags=tags,
        description=description,
        content=content,
    )
    doc = script.dict()
    result = await scripts_collection.insert_one(doc)
    return await get_script_by_id(str(result.inserted_id))

async def get_scripts(skip: int = 0, limit: int = 100):
    """Retrieves a list of scripts from the database."""
    cursor = scripts_collection.find().skip(skip).limit(limit)
    return await cursor.to_list(length=limit)

async def get_script_by_id(id: str):
    """Fetches a single script from the database by its ID."""
    return await scripts_collection.find_one({"_id": ObjectId(id)})

async def get_script_by_name(name: str):
    """Fetches a single script from the database by its name."""
    return await scripts_collection.find_one({"name": name})

async def search_scripts(query: str):
    """Performs a search for scripts in the database."""
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

async def update_script(
    id: str,
    name: Optional[str] = None,
    language: Optional[str] = None,
    tags: Optional[str] = None,
    description: Optional[str] = None,
    content: Optional[str] = None,
):
    """Updates a script in the database."""
    update_data = {}
    if name is not None:
        update_data["name"] = name
    if language is not None:
        update_data["language"] = language
    if tags is not None:
        update_data["tags"] = tags
    if description is not None:
        update_data["description"] = description
    if content is not None:
        update_data["content"] = content

    if not update_data:
        return await get_script_by_id(id)

    await scripts_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": update_data}
    )
    return await get_script_by_id(id)

async def delete_script(id: str):
    """Deletes a script from the database."""
    result = await scripts_collection.delete_one({"_id": ObjectId(id)})
    return result.deleted_count > 0