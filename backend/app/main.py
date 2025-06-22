from fastapi import FastAPI, HTTPException
from crud import router as crud_router
from run_scripts import router as script_router

app = FastAPI()
app.include_router(script_router)
app.include_router(crud_router)
