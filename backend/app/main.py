from fastapi import FastAPI, HTTPException
from crud import router as crud_router
from gemini import router as gemini_router

app = FastAPI()
app.include_router(crud_router)
app.include_router(gemini_router)
