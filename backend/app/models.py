from typing import List
from pydantic import BaseModel
from datetime import datetime
from typing import List

class Script(BaseModel):
    name: str
    description: str
    path: str
    # _id: ObjectId(str)
    # created_at: datetime
    # updated_at: datetime
    class Parameter(BaseModel):
        # _id: ObjectId(str)
        name: str
        type: str
        description: str

    parameters: List[Parameter]

    class Config:
        # allow extra fields
        extra = "allow"
 
class SendMessagePayload(BaseModel):
    message: str