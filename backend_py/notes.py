from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
import json
import os

router = APIRouter()

DATABASE_PATH = "data_notes.json"

class Note(BaseModel):
  title: str
  description: str
  id: Optional[str] = None

#python -m uvicorn main:app --reload


@router.get("/")
async def list_notes():
  notes = read_notes_from_db()
  return notes

@router.get("/{note_id}")
async def get_note(note_id: str):
  notes = read_notes_from_db()
  note = next((note for note in notes if note["id"] == note_id), None)
  if note:
    return note
  return {"error": "Note not found"}, 404

@router.post("/")
async def add_note(note: Note):
  notes = read_notes_from_db()
  note.id = str(uuid4())  # Genera ID
  notes.append(note.model_dump())
  write_notes_to_db(notes)
  return {"message": "Note added", "note": note}

@router.put("/{note_id}")
async def update_note(note_id: str, updated_note: Note):
  notes = read_notes_from_db()
  for idx, note in enumerate(notes):
    if note["id"] == note_id:
      notes[idx]["title"] = updated_note.title
      notes[idx]["description"] = updated_note.description
      write_notes_to_db(notes)
      return {"message": "Note updated", "note": notes[idx]}


@router.delete("/{note_id}")
async def delete_note(note_id: str):
  notes = read_notes_from_db()
  # Find note by id
  note_to_delete = next((note for note in notes if note["id"] == note_id), None)
  if note_to_delete:
    notes.remove(note_to_delete)
    write_notes_to_db(notes)
    return {"message": "Note deleted", "note": note_to_delete}
  else:
    return {"error": "Note not found"}, 404




# Utility functions
def read_notes_from_db():
  if not os.path.exists(DATABASE_PATH):
    return []
  with open(DATABASE_PATH, "r") as file:
    return json.load(file)

def write_notes_to_db(notes):
  with open(DATABASE_PATH, "w") as file:
    json.dump(notes, file, indent=2)
