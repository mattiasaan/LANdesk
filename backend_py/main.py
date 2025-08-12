from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from notes import router as notes_router
from tasks import router as tasks_router
from files import router as files_router
import os

app = FastAPI()

# python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes_router, prefix="/notes", tags=["notes"])
app.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
app.include_router(files_router, prefix="/files", tags=["files"])

"""
@app.get("/")
async def root():
    return "main page"
"""


app.mount("/", StaticFiles(directory="../web_ui/", html=True), name="web_ui")

SHARED_FOLDER = "public/public_files"
os.makedirs(SHARED_FOLDER, exist_ok=True)

app.mount("/shared", StaticFiles(directory=SHARED_FOLDER), name="shared")
