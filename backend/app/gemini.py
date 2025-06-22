from google import genai
from google.genai.types import Tool, FunctionDeclaration, Content, Part,GenerateContentConfig
from models import SendMessagePayload, UserResponse
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

# A simple (and non-exhaustive) list of commands that are generally safe
SAFE_COMMANDS = {"ls", "echo", "pwd", "whoami", "date", "cat"}

async def get_script_names() -> list[str]:
    scripts = await db.scripts.find().to_list(length=None)
    scripts_names = [script["name"] for script in scripts]
    return scripts_names

async def get_script_details(script_name: str) -> list[dict]:
    scripts = await db.scripts.find({"name": script_name}).to_list(length=None)
    for script in scripts:
        script["_id"] = str(script["_id"])
    return scripts

def execute_script(cmd_path: str, args: list[str] | None = None) -> dict:
    """
    Executes a shell command or script and returns a dictionary containing
    the standard output, standard error, and the exit status code.
    """
    if args is None:
        args = []
    print(f"Executing: {cmd_path} with args: {args}")
    try:
        command = [cmd_path] + args
        if (cmd_path.endswith('.py')): command = ['python'] + command
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
            "stderr": f"Error: The command '{cmd_path}' was not found.",
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

create_new_script_function = FunctionDeclaration(
    name="create_new_script",
    description="Generate a new Python 3 script from scratch to perform a certain action. Should be used if the user requests functionality which is not provided with existing scripts or Bash commands. If successful, you can follow this tool up with a call to `get_script_details` to check where the script got saved to, then call the script using `execute_script`. Scripts generated this way cannot take arguments.",
    parameters={"type": "object", "properties": {
            "name": {
                "type": "string",
                "description": "What the new script will be called."
            },
            "description": {
                "type": "string",
                "description": "A short blurb describing what the script does"
            },
            "code": {
                "type": "string",
                "description": "The code to go into the script."
            }
        }}
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

ask_function = FunctionDeclaration(
    name="ask",
    description="Asks the user a question. Use this if some things about your task are unclear, such as directories or files to execute scripts in/on. If you wish for the user to provide a response, call this function; if you don't call any tools, the conversation will end.",
    parameters={
        "type": "object",
        "properties": {
            "prompt": {
                "type": "string",
                "description": "The question to ask the user."
            }
        },
        "required": ["prompt"]
    }
)


execute_script_function = FunctionDeclaration(
    name="execute_script",
    description="Exectutes a script or bash command in the terminal with args. Execution of sensitive scripts or commands may be subject to user approval first. If you do not know which script to execute then use the `get_script_names` tool to get a list of scripts from the database.",
    parameters={
        "type": "object",
        "properties": {
            "cmd_path": {
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
        "required": ["cmd_path"]
    }
)

tools = [Tool(function_declarations=[execute_script_function, get_script_names_function, get_script_details_function, create_new_script_function, ask_function])]
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
    
    result = await continue_agent_run({"contents": contents, "called": []})
    
    # --- Confirmation Logic ---
    # Check if the next action requires user confirmation before saving to DB
    if result.get("next", {}).get("type") == "execute_script":
        cmd_path = result["next"]["content"].get("cmd_path")
        # If the command is not in our safe list, we change the type
        # to ask for confirmation from the user on the frontend.
        if cmd_path not in SAFE_COMMANDS:
            result["next"]["type"] = "confirmation_required"
    # --- End Confirmation Logic ---

    result["contents"] = list(map(lambda x: x.model_dump(), result["contents"]))
    
    # Only save to DB and return a session_id if a follow-up is expected
    if result.get("next", {}).get("type") != "text":
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
        "type": "text",
        "content": {}
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
            ret["type"] = "execute_script"
            cmd_path = function_call.args["cmd_path"]
            # args is optional, so we use .get() to avoid errors if it's not provided
            args = list(function_call.args.get("args", []))
            # Reconstruct args from sanitized variables to avoid JSON serialization errors.
            ret["content"] = {"cmd_path": cmd_path, "args": args}
            # Return the function call data
        elif function_call.name == "create_new_script":
            ret["type"] = "create_new_script"
            ret["content"] = function_call.args
        elif function_call.name == "ask":
            ret["type"] = "ask"
            ret["content"] = function_call.args
    else:
        ret["content"]["text"] = response.text

    contents["next"] = ret

    return contents

@router.post("/continue_session")
async def continue_session(payload: UserResponse) -> dict:
    print("The payload is: \n", payload)
    session_id = payload.session
    response = payload.response
    session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    output = [Content.model_validate(c) for c in session.get("contents", [])]
    function_response_part = None
    next_action = session.get("next", {})
    action_type = next_action.get("type")

    if action_type == "execute_script":
        if response.lower() == "yes":
            content = next_action.get("content", {})
            cmd_path = content.get("cmd_path")
            args = content.get("args", [])
            execution_result = execute_script(cmd_path, args)
            print("The execution result is: \n", execution_result)
            function_response_part = Part.from_function_response(
                name="execute_script",
                response={"result": execution_result},
            )
            # Optionally add to a list of 'called' commands if needed
            session["called"] = session.get("called", []) + [" ".join([cmd_path] + args)]
        else:
            # If user says no, we can just inform the model
            function_response_part = Part.from_function_response(
                name="execute_script",
                response={"result": "User cancelled the action."},
            )
    elif action_type == "create_new_script":
        content = next_action.get("content", {})
        d = await create_script(content.get("code"), content.get("name"), content.get("description"))
        function_response_part = Part.from_function_response(
            name="create_new_script",
            response={"result": f"Script successfully created at {d.get('path', 'N/A')}"},
        )
    elif action_type == "ask":
        function_response_part = Part.from_function_response(
            name="ask",
            response={"result": response},
        )

    # Only append if a function response was actually generated
    if function_response_part:
        output.append(Content(role="tool", parts=[function_response_part]))
    
    # Clean up the old session
    await db.sessions.delete_one({"_id": ObjectId(session_id)})
    
    # Continue the agent run with the updated context
    result = await continue_agent_run({"contents": output, "called": session.get("called", []) })
    
    result["contents"] = [c.model_dump() for c in result.get("contents", [])]
    
    if result.get("next", {}).get("type") != "text":
        entry = await db.sessions.insert_one(dict(result))
        result["session"] = str(entry.inserted_id)
        
    return result

async def create_script(script_body: str, name: str, description: str) -> dict:
    """
    Creates a new script file in the local_scripts directory and adds its info to MongoDB.
    Returns the inserted document or error info.
    """
    # Ensure local_scripts directory exists
    scripts_dir = os.path.join(os.path.dirname(__file__), 'local_scripts')
    os.makedirs(scripts_dir, exist_ok=True)
    
    # Create the script file
    filename = f"{name}.py"
    file_path = os.path.join(scripts_dir, filename)
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(script_body)
    except Exception as e:
        return {"error": f"Failed to write script file: {str(e)}"}

    # Prepare document for MongoDB
    script_doc = {
        "name": name,
        "description": description,
        "path": file_path,
        "parameters": []
    }
    try:
        result = await db.scripts.insert_one(script_doc)
        script_doc["_id"] = str(result.inserted_id)
        return script_doc
    except Exception as e:
        return {"error": f"Failed to insert into MongoDB: {str(e)}"}
