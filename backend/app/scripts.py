import fastapi
from fastapi import APIRouter
from database import get_database

router = APIRouter(prefix="/scripts", tags=["scripts"])
db = get_database()

@router.get("/get_scripts")
async def get_scripts():
    return {"message": "Hello, World!"}

@router.post("/create_script")
async def create_script():
    return {"message": "Hello, World!"}