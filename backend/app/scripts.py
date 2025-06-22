from fastapi import APIRouter, Body, Depends, HTTPException 
from typing import List
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


    # script_doc will be returned as a python dictionary. Example:
    # { 
    #   "_id": ObjectId("665cb934a6e6c7ad9824e93b"),
    #   "name": "Run backup",
    #   "path": "/scripts/backup.sh" } 
    #   "description: description stuff"
    # }

async def _execute_script_with_args(path: str, args: List[str]) -> dict:
    """Helper to execute a script with arguments and capture output."""
    print(f"Attempting to execute script: {path} with args: {args}")
    try:
        if path.endswith(".py"):
            command_and_args = ["python", path] + args
            proc = await asyncio.create_subprocess_exec(
                *command_and_args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
        elif path.endswith(".sh"):
            command_and_args = [path] + args
            proc = await asyncio.create_subprocess_exec(
                *command_and_args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported script type: Path must end in .py or .sh. Path was: {path}")

        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=10)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            raise HTTPException(status_code=408, detail="Script execution timed out")

        return {
            "return_code": proc.returncode,
            "stdout": stdout.decode(),
            "stderr": stderr.decode()
        }
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"Server Execution Error: The script file was not found at the path: {path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during script execution: {e}")

@router.post("/run_script")
async def run_script(script_id: str = Body(...), args: List[str] = Body([])):
    print(f"Running script with ID '{script_id}' and args '{args}'")
    try:
        obj_id = ObjectId(script_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid script ID format.")

    script_doc = await db.scripts.find_one({"_id": obj_id})
    if not script_doc:
        raise HTTPException(status_code=404, detail=f"Script with ID '{script_id}' not found.")
    
    path = script_doc.get("path")
    if not path:
        raise HTTPException(status_code=500, detail="Server Configuration Error: Script document is missing the 'path' field.")

    execution_result = await _execute_script_with_args(path, args)
    
    return {
        "message": f"Script '{script_doc.get('name', script_id)}' executed.",
        **execution_result
    }

