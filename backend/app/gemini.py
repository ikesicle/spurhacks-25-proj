import google.generativeai as genai
from google.generativeai.types import Tool, FunctionDeclaration
from models import SendMessagePayload
from fastapi import APIRouter
import os
from pydantic import BaseModel
import json
import subprocess

# Set up API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

router = APIRouter(prefix="/gemini", tags=["gemini"])

# Your local Python function
def to_goon(message: str) -> str:
    print("The goon message is: GOONINGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG")
    return "Yes" if "goon" in message.lower() else "No"

def execute_script(script_path: str, args: list[str] | None = None) -> str:
    """Executes a shell command or script and returns its standard output."""
    if args is None:
        args = []
    print(f"Executing: {script_path} with args: {args}")
    try:
        command = [script_path] + args
        result = subprocess.run(
            command, capture_output=True, text=True, check=True
        )
        return result.stdout
    except FileNotFoundError:
        return f"Error: The command '{script_path}' was not found."
    except subprocess.CalledProcessError as e:
        return f"Error executing command:\nSTDOUT:\n{e.stdout}\nSTDERR:\n{e.stderr}"
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}"

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

execute_script_function = FunctionDeclaration(
    name="execute_script",
    description="Executes a shell command or script and returns its output. The command should be accessible in the environment's PATH or a direct path to the script should be provided.",
    parameters={
        "type": "object",
        "properties": {
            "script_path": {
                "type": "string",
                "description": "The command or path to the script to execute (e.g., 'ls' or './scripts/list_files.sh')."
            },
            "args": {
                "type": "array",
                "description": "An optional list of string arguments to pass to the command/script.",
                "items": {
                    "type": "string"
                }
            }
        },
        "required": ["script_path"]
    }
)

tools = [Tool(function_declarations=[to_goon_function, execute_script_function])]

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
        elif function_call.name == "execute_script":
            script_path = function_call.args["script_path"]
            # args is optional, so we use .get() to avoid errors if it's not provided
            args = list(function_call.args.get("args", []))
            result = execute_script(script_path=script_path, args=args)
            ret["function_called"] = function_call.name
            ret["function_args"] = dict(function_call.args)
            ret["function_result"] = result
    else:
        # If there is no function call, it's safe to access the .text property
        ret["response"] = response.text

    print("The return is: \n", json.dumps(ret, indent=4))
    return ret
    
