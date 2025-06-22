from fastapi import APIRouter, Body, Depends, HTTPException 
from database import get_database
from datetime import datetime
from models import Script
from bson import ObjectId
import asyncio

router = APIRouter(prefix="/scripts", tags=["scripts"])
db = get_database()

@router.get("/get_scripts")
async def get_scripts():
    scripts =await db.scripts.find().to_list(length=100)
    for script in scripts:
        script["_id"] = str(script["_id"])
    return scripts

@router.get("/get_script")
async def get_script(_id: str):
    script = await db.scripts.find_one({"_id": ObjectId(_id)})
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    script["_id"] = str(script["_id"])
    return script

@router.post("/save_script")
async def save_script(script: Script = Body(...)):
    script_data = script.model_dump()

    existing_script = None
    if "_id" in script_data:
        existing_script = await db.scripts.find_one({"_id": ObjectId(script_data["_id"])})
        if not existing_script:
            raise HTTPException(status_code=404, detail="Script not found")
        script_data["_id"] = str(script_data["_id"])

    if existing_script:
        return await update_script(script_data)
    else:
        return await create_script(script)

async def create_script(script: Script = Body(...)):
    script_data = script.model_dump()
    script_data["created_at"] = datetime.now()
    script = await db.scripts.insert_one(script_data)
    return await get_script(str(script.inserted_id))

async def update_script(script_data: dict = Body(...)):
    _id = script_data.pop("_id")
    script_data["updated_at"] = datetime.now()
    script = await db.scripts.update_one({"_id": ObjectId(_id)}, {"$set": script_data})
    return await get_script(_id)

@router.delete("/delete_script")
async def delete_script(_id: str):
    # Convert string _id to ObjectId
    try:
        obj_id = ObjectId(_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid script ID format") from e
    script = await db.scripts.find_one({"_id": obj_id})
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    else:
        await db.scripts.delete_one({"_id": obj_id})
    return {"message": "Script deleted successfully"}

@router.get("/get-script-details/{identifier}")
async def get_script_details(identifier: str):
    query = {}
    try:
        query["_id"] = ObjectId(identifier)
    except Exception:
        query["name"] = identifier

    script_doc = await db.scripts.find_one(query)

    if not script_doc:
        raise HTTPException(status_code=404, detail=f"Script '{identifier}' not found.")

    # Important: Convert the ObjectId to a string for the JSON response
    script_doc["_id"] = str(script_doc["_id"])

    # Return the full script document so the client knows what to run
    return script_doc


# scripts database doc structure:
# {
#  "_id": "...",
#  "name": "Run Python Backup",
# "path": "/scripts/backup.py",
#   "language": "python" },
@router.post("/execute-script/{script_id}")
async def execute_script_as_tool(script_id: str):
    print(f"TOOL CALL RECEIVED: Execute script with identifier '{script_id}'")
    query = {}
    
    try:
        # Convert the string ID from the URL into a MongoDB ObjectId
        obj_id = ObjectId(script_id)
    except Exception:
        # If the string is not a valid ObjectId format, it can't possibly be in the DB.
        raise HTTPException(status_code=400, detail="Invalid script ID format.")
   
    # script_doc will be returned as a python dictionary. Example:
    # { "_id": ObjectId("665cb934a6e6c7ad9824e93b"),
    #   "name": "Run backup",
    #   "path": "/scripts/backup.sh" } 
    #   "description: description stuff"
    script_doc = await db.scripts.find_one({"_id": obj_id})
    if not script_doc:
        raise HTTPException(status_code=404, detail=f"Script with ID '{script_id}' not found.")

    # Get the script's path (from the path key) in the mongodb document
    server_script_path = script_doc.get("path")
    if not server_script_path:
        raise HTTPException(status_code=400, detail="Script document is valid but is missing a 'path' field.")
    
    try:
        if server_script_path.endswith(".py"):
            print(f"Executing as Python script: {server_script_path}")
            proc = await asyncio.create_subprocess_exec(
                "python", server_script_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
        elif server_script_path.endswith(".sh"):
            print(f"Executing as Shell script: {server_script_path}")
            proc = await asyncio.create_subprocess_shell(
                server_script_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported script type: Path must end in .py or .sh. Path was: {server_script_path}")

        # 4. Wait for the process to complete and capture its output
        stdout, stderr = await proc.communicate()

    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"Server Execution Error: The script file was not found at the path: {server_script_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during script execution: {e}")

    # 5. Return a structured JSON response for the calling service
    return {
        "message": f"Script '{script_doc.get('name')}' executed successfully.",
        "return_code": proc.returncode,
        "stdout": stdout.decode(),
        "stderr": stderr.decode()
    }