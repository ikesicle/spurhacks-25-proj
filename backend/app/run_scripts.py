from fastapi import APIRouter, Body, Depends, HTTPException
from database import get_database
from datetime import datetime
from models import Script
from bson import ObjectId
import subprocess
from pymongo import MongoClient
from bson import ObjectId

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = get_database()
router = APIRouter()

collection = db["scripts"]
def run_scripts(script_id: str):
    try:
        
    


