from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import subprocess
import json
import os
from . import crud, models

app = FastAPI()

class Prompt(BaseModel):
    prompt: str

@app.post("/scripts/", response_model=models.ScriptOut)
async def add_script(script: models.ScriptCreate):
    existing = await crud.get_script_by_name(script.name)
    if existing:
        raise HTTPException(status_code=400, detail="Script with this name exists.")
    created = await crud.create_script(script)
    return created

@app.get("/scripts/", response_model=list[models.ScriptOut])
async def list_scripts(skip: int = 0, limit: int = 100):
    return await crud.get_scripts(skip=skip, limit=limit)

@app.get("/scripts/search/", response_model=list[models.ScriptOut])
async def search(query: str):
    return await crud.search_scripts(query)

# --- Gemini Integration ---

# Configure Gemini API
# IMPORTANT: Set the GOOGLE_API_KEY environment variable.
# You can get one from https://aistudio.google.com/app/apikey
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    # This will prevent the app from starting if the key is not set,
    # which is good practice.
    raise ValueError("GOOGLE_API_KEY environment variable not set.")
genai.configure(api_key=api_key)

# Define a function that executes a shell command
def execute_shell_command(command: str):
    """Executes a shell command on the local machine and returns its output."""
    try:
        # IMPORTANT: Be extremely careful with what commands you allow!
        # This is a security risk if not properly constrained.
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            check=True
        )
        return {"stdout": result.stdout, "stderr": result.stderr}
    except subprocess.CalledProcessError as e:
        return {"error": f"Command failed: {e}", "stdout": e.stdout, "stderr": e.stderr}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}

# Initialize Gemini model
model = genai.GenerativeModel(
    model_name="gemini-pro", 
    tools=[execute_shell_command]
)

@app.post("/generate")
async def generate(request: Prompt):
    """
    Receives a prompt, sends it to Gemini, and handles tool calls.
    """
    try:
        # Send prompt to the model
        response = model.generate_content(request.prompt)

        # Check if the model wants to call a tool
        function_call = response.candidates[0].content.parts[0].function_call
        
        if function_call.name == "execute_shell_command":
            command = function_call.args['command']
            
            # Execute the command
            tool_result = execute_shell_command(command=command)
            
            # Send the result back to the model
            second_response = model.generate_content(
                [
                    request.prompt, # original prompt
                    response.candidates[0].content, # model's first response (the function call)
                    genai.Part(
                        function_response=genai.protos.FunctionResponse(
                            name='execute_shell_command',
                            response={
                                'content': json.dumps(tool_result),
                            }
                        )
                    ),
                ]
            )
            return {"response": second_response.text}

        # If it's not a function call we know about, or not a function call at all.
        return {"response": response.text}

    except (AttributeError, IndexError):
        # This can happen if the response is empty, doesn't have a function call,
        # or doesn't have the expected structure.
        return {"response": response.text}