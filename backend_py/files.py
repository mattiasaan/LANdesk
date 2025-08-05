from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import os

router = APIRouter()

#http://127.0.0.1:8000/files/list
#http://127.0.0.1:8000/files/download/

SHARED_FOLDER = "public"

os.makedirs(SHARED_FOLDER, exist_ok=True)

@router.get("/list")
def list_files():
  files = []

  for root, _, filenames in os.walk(SHARED_FOLDER):
    for f in filenames:
      full_path = os.path.join(root, f)
      rel_path = os.path.relpath(full_path, SHARED_FOLDER).replace("\\", "/")
      files.append({
        "name": f,
        "path": rel_path,
        "size": os.path.getsize(full_path),
        "type": os.path.splitext(f)[1][1:]
      })
  return JSONResponse(content={"files": files})


@router.get("/download/{file_path:path}")
def download_file(file_path: str):
  full_path = os.path.join(SHARED_FOLDER, file_path)

  if not os.path.isfile(full_path):
    raise HTTPException(status_code=404, detail="File not found")
  return FileResponse(full_path, filename=os.path.basename(full_path))


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
  destination = os.path.join(SHARED_FOLDER, file.filename)
  with open(destination, "wb") as buffer:
    buffer.write(await file.read())
  return {"filename": file.filename, "status": "uploaded"}
