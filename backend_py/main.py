from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from notes import router as notes_router
from tasks import router as tasks_router
from files import router as files_router
from links import router as links_router
from categories import router as categories_router
from auth import router as auth_router, get_current_user
import os
from dotenv import load_dotenv
from fastapi import Depends

app = FastAPI()


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


load_dotenv(dotenv_path="./secure/.env")
ALLOWED_ORIGINS = [os.getenv("url", "https://localhost:8000")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"]
)

app.include_router(notes_router, prefix="/notes", tags=["notes"], dependencies=[Depends(get_current_user)])
app.include_router(tasks_router, prefix="/tasks", tags=["tasks"], dependencies=[Depends(get_current_user)])
app.include_router(files_router, prefix="/files", tags=["files"], dependencies=[Depends(get_current_user)])
app.include_router(links_router, prefix="/links", tags=["links"], dependencies=[Depends(get_current_user)])
app.include_router(categories_router, prefix="/categories", tags=["categories"], dependencies=[Depends(get_current_user)]) 
app.include_router(auth_router)


app.mount("/", StaticFiles(directory="../web_ui/", html=True), name="web_ui")

#SHARED_FOLDER = "public/public_files"
#os.makedirs(SHARED_FOLDER, exist_ok=True)

#app.mount("/shared", StaticFiles(directory=SHARED_FOLDER), name="shared")
