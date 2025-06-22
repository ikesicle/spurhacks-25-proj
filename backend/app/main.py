from fastapi import FastAPI, HTTPException
from crud import router as crud_router

app = FastAPI()
app.include_router(crud_router)

