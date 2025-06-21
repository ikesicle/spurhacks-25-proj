from pydantic import BaseModel
from datetime import datetime

class Script(BaseModel):
    name: str
    class Config:
        # allow extra fields
        extra = "allow"