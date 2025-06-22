from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scripts import router as script_router
from gemini import router as gemini_router

app = FastAPI()
app.include_router(script_router)
app.include_router(gemini_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin(s)
    allow_credentials=True,
    allow_methods=["*"],  # or specify ["GET", "POST", ...]
    allow_headers=["*"],  # or specify allowed headers
)
