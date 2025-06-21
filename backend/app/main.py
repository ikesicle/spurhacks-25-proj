from fastapi import FastAPI, HTTPException
from . import crud, models

app = FastAPI()

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