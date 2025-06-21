from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class ScriptBase(BaseModel):
    name: str
    language: str
    tags: Optional[str] = ""
    description: Optional[str] = ""
    content: str

class ScriptCreate(ScriptBase):
    pass

class ScriptOut(ScriptBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "name": "deploy_script",
                "language": "bash",
                "tags": "deploy,server",
                "description": "Deploy app to server",
                "content": "echo Deploying..."
            }
        }