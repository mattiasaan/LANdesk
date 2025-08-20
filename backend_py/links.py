from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
import json
import os

router = APIRouter()

DATABASE_PATH = "./public/data_links.json"


class link(BaseModel):
    title: str
    description: str
    id: Optional[str] = None


@router.get("/")
async def list_links():
    links = read_links_from_db()
    return links


@router.get("/{link_id}")
async def get_link(link_id: str):
    links = read_links_from_db()
    link = next((link for link in links if link["id"] == link_id), None)
    if link:
        return link
    return {"error": "link not found"}, 404


@router.post("/")
async def add_link(link: link):
    links = read_links_from_db()
    link.id = str(uuid4())  # Genera ID
    links.append(link.model_dump())
    write_links_to_db(links)
    return {"message": "link added", "link": link}


@router.put("/{link_id}")
async def update_link(link_id: str, updated_link: link):
    links = read_links_from_db()
    for idx, link in enumerate(links):
        if link["id"] == link_id:
            links[idx]["title"] = updated_link.title
            links[idx]["description"] = updated_link.description
            write_links_to_db(links)
            return {"message": "link updated", "link": links[idx]}


@router.delete("/{link_id}")
async def delete_link(link_id: str):
    links = read_links_from_db()
    # Find link by id
    link_to_delete = next((link for link in links if link["id"] == link_id), None)
    if link_to_delete:
        links.remove(link_to_delete)
        write_links_to_db(links)
        return {"message": "link deleted", "link": link_to_delete}
    else:
        return {"error": "link not found"}, 404


# Utility functions
def read_links_from_db():
    if not os.path.exists(DATABASE_PATH):
        return []
    with open(DATABASE_PATH, "r") as file:
        return json.load(file)


def write_links_to_db(links):
    with open(DATABASE_PATH, "w") as file:
        json.dump(links, file, indent=2)
