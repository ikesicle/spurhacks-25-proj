from pydantic import BaseModel
from datetime import datetime

class Script(BaseModel):
    # _id: ObjectId(str)
    name: str
    description: str
    # created_at: datetime
    # updated_at: datetime
    path: str
    class Parameter(BaseModel):
        # _id: ObjectId(str)
        name: str
        type: str
        description: str

    parameters: list[Parameter]

    class Config:
        # allow extra fields
        extra = "allow"
        
