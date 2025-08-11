from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import os
from uuid import uuid4
import json
import mimetypes

router = APIRouter()

#http://127.0.0.1:8000/files/list
#http://127.0.0.1:8000/files/download/

SHARED_FOLDER = "public/public_files"
METADATA_PATH = "public/metadata/files_metadata.json"


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
  file_id = str(uuid4())
  ext = os.path.splitext(file.filename)[1]
  stored_name = f"{file_id}{ext}"
  path = os.path.join(SHARED_FOLDER, stored_name)

  with open(path, "wb") as f_out:
    f_out.write(await file.read())

  metadata = load_metadata()
  metadata[file_id] = {
    "original_name": file.filename,
    "stored_name": stored_name,
    "size": os.path.getsize(path),
    "type": ext.lstrip(".")
  }
  save_metadata(metadata)

  return {"id": file_id, "name": file.filename}

@router.get("/list")
async def list_files():
  metadata = load_metadata()
  return [
    {"id": fid, "name": data["original_name"], "size": data["size"], "type": data["type"]}
    for fid, data in metadata.items()
  ]

@router.get("/download/{file_id}")
async def download_file(file_id: str):
  metadata = load_metadata()
  file_data = metadata.get(file_id)

  if not file_data:
    return {"error": "File non trovato"}
  path = os.path.join(SHARED_FOLDER, file_data["stored_name"])

  mime_type, _ = mimetypes.guess_type(file_data["original_name"])

  if not mime_type:
    mime_type = "application/octet-stream"

  return FileResponse(
    path,
    filename=file_data["original_name"],
    media_type=mime_type
  )

@router.delete("/delete/{file_id}", status_code=204)
async def delete_file(file_id: str):
  metadata = load_metadata()

  if file_id not in metadata:
    raise HTTPException(404, detail="File not found")

  file_data = metadata[file_id]
  del metadata[file_id]

  path = os.path.join(SHARED_FOLDER, file_data["stored_name"])
  if os.path.exists(path):
    os.remove(path)

  save_metadata(metadata)


def load_metadata():
  with open(METADATA_PATH) as f:
    return json.load(f)


def save_metadata(data):
  with open(METADATA_PATH, "w") as f:
    json.dump(data, f, indent=2)
