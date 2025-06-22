from google import genai
from google.genai.types import Tool, FunctionDeclaration, Content, Part,GenerateContentConfig
from models import SendMessagePayload
from fastapi import APIRouter, HTTPException
from bson import ObjectId
import os
from pydantic import BaseModel
import json
import subprocess
from database import get_database

# Set up API key
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

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
    description="Exectutes a script or command in the terminal with args. Execution of sensitive scripts may be subject to user approval first. If you do not know which script to execute then use the `get_script_names` tool to get a list of scripts from the database.",
    parameters={
        "type": "object",
        "properties": {
            "script_path": {
                "type": "string",
                "description": "The command or path to the script to execute (e.g., 'ls' or './scripts/list_files.sh')."
            },
            "args": {
                "type": "array",
                "description": "An optional list of arguments to pass to the command/script. If you're calling a script, be sure to use `get_script_details` to check what each argument does.",
                "items": {
                    "type": "string"
                }
            }
        },
        "required": ["script_path"]
    }
)

tools = [Tool(function_declarations=[execute_script_function, get_script_names_function, get_script_details_function])]
config = GenerateContentConfig(tools=tools)

@router.post("/send_message")
async def send_message(payload: SendMessagePayload) -> dict:
    message = payload.message
    print("The message is: \n", message)
    contents = [
        Content(
            role="user", parts=[Part(text=message)]
        )
    ]
    
    result = await continue_agent_run({"contents": contents})
    result["contents"] = list(map(lambda x: x.model_dump(), result["contents"]))
    
    if (result["next"]["should_continue"]):
        entry = await db.sessions.insert_one(dict(result))
        result["session"] = str(entry.inserted_id)
    return result


async def continue_agent_run(contents) -> dict:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents["contents"],
        config=config
    )
    ret = {
        "should_continue": False,
        "function_called": "",
        "response": ""
    }
    # The response can contain either a function call or text. 
    # We must check for the function call first, because accessing .text 
    # on a response with a function call will raise an error.
    part = response.candidates[0].content.parts[0]
    print(part)

    if hasattr(part, "function_call") and part.function_call:
        function_call = part.function_call
        contents["contents"].append(response.candidates[0].content)
        if function_call.name == "get_script_names":
            result = await get_script_names()
            function_response_part = Part.from_function_response(
                name=function_call.name,
                response={"result": f"The script names are: {result}"},
            )
            
            contents["contents"].append(Content(role="user", parts=[function_response_part])) # Append the function response
            return await continue_agent_run(contents)
        elif function_call.name == "get_script_details":
            result = await get_script_details(function_call.args["name"])
            function_response_part = Part.from_function_response(
                name=function_call.name,
                response={"result": f"Details of the script:\n {result}"},
            )
            contents["contents"].append(Content(role="user", parts=[function_response_part])) # Append the function response
            return await continue_agent_run(contents)
        elif function_call.name == "execute_script":
            script_path = function_call.args["script_path"]
            # args is optional, so we use .get() to avoid errors if it's not provided
            args = list(function_call.args.get("args", []))
            ret["function_called"] = function_call.name
            # Reconstruct args from sanitized variables to avoid JSON serialization errors.
            ret["function_args"] = {"script_path": script_path, "args": args}
            ret["should_continue"] = True
            # Return the function call data
    ret["response"] = response.text

    contents["next"] = ret

    return contents

@router.post("/continue_session")
async def continue_session(payload: SendMessagePayload) -> dict:
    session_id = payload.message
    session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    print(session["next"])
    output = []
    for k in session["contents"]:
        output.append(Content.model_validate(k))
    
    function_response_part = Part.from_function_response(
        name=session["next"]["function_called"],
        response={"result": execute_script(session["next"]["function_args"]["script_path"], session["next"]["function_args"]["args"])},
    )
    output.append(function_response_part)
    await db.sessions.delete_one({"_id": session_id})
    result = await continue_agent_run({"contents": output})
    
    result["contents"] = list(map(lambda x: x.model_dump(), result["contents"]))
    
    if (result["next"]["should_continue"]):
        entry = await db.sessions.insert_one(dict(result))
        result["session"] = str(entry.inserted_id)
    return result
    