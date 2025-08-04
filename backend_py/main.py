from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from notes import router as notes_router
from tasks import router as tasks_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes_router, prefix="/notes", tags=["notes"])
app.include_router(tasks_router, prefix="/tasks", tags=["tasks"])

@app.get("/")
async def root():
    return "main page"
