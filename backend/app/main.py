from fastapi import FastAPI, HTTPException
from scripts import router as scripts_router

app = FastAPI()
app.include_router(scripts_router)

