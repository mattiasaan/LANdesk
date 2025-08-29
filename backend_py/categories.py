from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4
import json
import os

router = APIRouter()

CATEGORY_PATH = "./public/data_category.json"


class Category(BaseModel):
  name: str
  resource_types: List[str] = []  # ["links", "notes", "files"] vuoto = tutte
  id: Optional[str] = None


@router.get("/")
async def list_categories(resource_type: Optional[str] = None):
  categories = read_categories()
  if resource_type:
    categories = [
      cat for cat in categories
      if not cat["resource_types"] or resource_type in cat["resource_types"]
    ]
  return categories

@router.post("/")
async def add_category(category: Category):
  categories = read_categories()

  # Controllo esistenza case insensitive
  if any(cat["name"].lower() == category.name.lower() for cat in categories):
    return {"error": "Category already exists"}, 400

  category.id = str(uuid4())
  categories.append(category.model_dump())
  write_categories(categories)
  return {"message": "Category added", "category": category}


@router.delete("/{category_id}")
async def delete_category(category_id: str):
  categories = read_categories()
  category_to_delete = next((cat for cat in categories if cat["id"] == category_id), None)

  if not category_to_delete:
    return {"error": "Category not found"}, 404

  categories.remove(category_to_delete)
  write_categories(categories)

  # rimuovere categoria dai link/notes/files (da fare forse)

  return {"message": "Category deleted", "category": category_to_delete}


def read_categories() -> List[dict]:
  if not os.path.exists(CATEGORY_PATH):
    return []
  with open(CATEGORY_PATH, "r") as f:
    return json.load(f)


def write_categories(categories: List[dict]):
  with open(CATEGORY_PATH, "w") as f:
    json.dump(categories, f, indent=2)

#Controlla se la categoria esiste e può essere utilizzata per il tipo specificato
def category_exists(category_id: str, resource_type: str) -> bool:
  categories = read_categories()
  for cat in categories:
    if cat["id"] == category_id:
      return not cat["resource_types"] or resource_type in cat["resource_types"]
  return False
