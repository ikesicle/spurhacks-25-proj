from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/test")
async def test():
    return {"message": "Hello, World!"}
