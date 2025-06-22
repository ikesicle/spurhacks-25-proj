import google.generativeai as genai
from google.generativeai.types import Tool, FunctionDeclaration
from models import SendMessagePayload
from fastapi import APIRouter
import os
from pydantic import BaseModel
import json
import subprocess
from database import get_database

# Set up API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

router = APIRouter(prefix="/gemini", tags=["gemini"])
db = get_database()

async def get_script_names() -> list[str]:
    scripts = await db.scripts.find().to_list(length=None)
    scripts_names = [script["name"] for script in scripts]
    return scripts_names

async def get_script_details(script_name: str) -> list[dict]:
    scripts = await db.scripts.find({"name": script_name}).to_list(length=None)
    for script in scripts:
        script["_id"] = str(script["_id"])
    return scripts

def execute_script(script_path: str, args: list[str] | None = None) -> dict:
    """
    Executes a shell command or script and returns a dictionary containing
    the standard output, standard error, and the exit status code.
    """
    if args is None:
        args = []
    print(f"Executing: {script_path} with args: {args}")
    try:
        command = [script_path] + args
        result = subprocess.run(
            command, capture_output=True, text=True
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
        }
    except FileNotFoundError:
        return {
            "stdout": "",
            "stderr": f"Error: The command '{script_path}' was not found.",
            "returncode": 127,  # Standard exit code for command not found
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": f"An unexpected Python error occurred: {str(e)}",
            "returncode": 1,
        }

get_script_names_function = FunctionDeclaration(
    name="get_script_names",
    description="Gets a list of unique script names available to be executed from the database. You can then use the get_script_details function to get the details of a specific scripts with that name.",
    parameters={"type": "object", "properties": {}}
)

get_script_details_function = FunctionDeclaration(
    name="get_script_details",
    description="Gets the detailed information for a specific script by its name, including its file_path, description, and parameters. Use this to find out how to execute a script.",
    parameters={
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "The name of the script to get details for."
            }
        },
        "required": ["name"]
    }
)

execute_script_function = FunctionDeclaration(
    name="execute_script",
    description="Exectutes a script in the terminal with args. If its a regular bash command then just execute it. If you do not know which script to execute then use the get_script_names function to get a list of scripts from the database.",
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

tools = [Tool(function_declarations=[execute_script_function, get_script_names_function, get_script_details_function])]
# Load the model
model = genai.GenerativeModel(model_name="gemini-2.5-flash", tools=tools)

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

        if function_call.name == "get_script_names":
            result = await get_script_names()
            return await send_message(SendMessagePayload(message=f"{payload.message}\nThe script names are: {result}"))
        elif function_call.name == "get_script_details":
            result = await get_script_details(function_call.args["name"])
            return await send_message(SendMessagePayload(message=f"{payload.message}\nThe relevant script details are: {result}"))
        elif function_call.name == "execute_script":
            script_path = function_call.args["script_path"]
            # args is optional, so we use .get() to avoid errors if it's not provided
            args = list(function_call.args.get("args", []))
            result = execute_script(script_path=script_path, args=args)
            ret["function_called"] = function_call.name
            # Reconstruct args from sanitized variables to avoid JSON serialization errors.
            ret["function_args"] = {"script_path": script_path, "args": args}
            ret["function_result"] = result
    else:
        # If there is no function call, it's safe to access the .text property
        ret["response"] = response.text

    print("The return is: \n", json.dumps(ret, indent=4))
    return ret