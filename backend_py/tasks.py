from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
import json
import os

router = APIRouter()

DATABASE_PATH = "./public/data_tasks.json"


class Task(BaseModel):
  title: str
  description: Optional[str] = None
  date: Optional[str] = None
  completed: bool = False
  id: Optional[str] = None


@router.get("/")
async def list_tasks():
  tasks = read_tasks_from_db()
  return tasks


@router.get("/{task_id}")
async def get_task(task_id: str):
  tasks = read_tasks_from_db()
  task = next((task for task in tasks if task["id"] == task_id), None)
  if task:
    return task
  return {"error": "task not found"}, 404


@router.post("/")
async def add_task(task: Task):
  tasks = read_tasks_from_db()
  task.id = str(uuid4())  # Genera ID
  tasks.append(task.model_dump())
  write_tasks_to_db(tasks)
  return {"message": "task added", "task": task}


@router.put("/{task_id}")
async def update_task(task_id: str, updated_task: Task):
  tasks = read_tasks_from_db()
  for idx, task in enumerate(tasks):
    if task["id"] == task_id:
      tasks[idx]["title"] = updated_task.title
      tasks[idx]["description"] = updated_task.description
      tasks[idx]["date"] = updated_task.date
      tasks[idx]["completed"] = updated_task.completed
      write_tasks_to_db(tasks)
      return {"message": "task updated", "task": tasks[idx]}


@router.delete("/{task_id}")
async def delete_task(task_id: str):
  tasks = read_tasks_from_db()
  # Find task by id
  task_to_delete = next((task for task in tasks if task["id"] == task_id), None)
  if task_to_delete:
    tasks.remove(task_to_delete)
    write_tasks_to_db(tasks)
    return {"message": "task deleted", "task": task_to_delete}
  else:
    return {"error": "task not found"}, 404


# Utility functions
def read_tasks_from_db():
  if not os.path.exists(DATABASE_PATH):
    return []
  with open(DATABASE_PATH, "r") as file:
    return json.load(file)


def write_tasks_to_db(tasks):
  with open(DATABASE_PATH, "w") as file:
    json.dump(tasks, file, indent=2)
