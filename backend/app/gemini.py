import google.generativeai as genai
from google.generativeai.types import Tool, FunctionDeclaration
from models import SendMessagePayload
from fastapi import APIRouter
import os
from pydantic import BaseModel
import json

# Set up API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

router = APIRouter(prefix="/gemini", tags=["gemini"])

# Your local Python function
def to_goon(message: str) -> str:
    print("The goon message is: GOONINGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG")
    return "Yes" if "goon" in message.lower() else "No"

# Declare tool for Gemini
to_goon_function = FunctionDeclaration(
    name="to_goon",
    description="Decide if the user is going to goon or not.",
    parameters={
        "type": "object",
        "properties": {
            "message": {
                "type": "string",
                "description": "The user's message"
            }
        },
        "required": ["message"]
    }
)

tools = [Tool(function_declarations=[to_goon_function])]

# Load the model
model = genai.GenerativeModel(model_name="gemini-1.5-flash", tools=tools)

@router.post("/send_message")
async def send_message(payload: SendMessagePayload) -> dict:
    message = payload.message
    print("The message is: \n", message)
    
    response = model.generate_content(message)
    ret = {}

    # The response can contain either a function call or text. 
    # We must check for the function call first, because accessing .text 
    # on a response with a function call will raise an error.
    part = response.candidates[0].content.parts[0]

    if hasattr(part, "function_call") and part.function_call:
        function_call = part.function_call

        if function_call.name == "to_goon":
            result = to_goon(function_call.args["message"])
            ret["function_called"] = function_call.name
            # Convert special map type to a standard dict for JSON serialization
            ret["function_args"] = dict(function_call.args)
            ret["function_result"] = result
    else:
        # If there is no function call, it's safe to access the .text property
        ret["response"] = response.text

    print("The return is: \n", json.dumps(ret, indent=4))
    return ret
    