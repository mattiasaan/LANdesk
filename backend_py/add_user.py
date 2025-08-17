import json
from passlib.context import CryptContext
import os


USERS_FILE = "./secure/users.json"


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#python add_user.py


def load_users():
  if os.path.exists(USERS_FILE):
    with open(USERS_FILE, "r") as f:
      return json.load(f)
  return {}


def save_users(users):
  with open(USERS_FILE, "w") as f:
    json.dump(users, f, indent=2)


def add_user(username, password):
  users = load_users()
  if username in users:
    print(f"{username}' esiste già")
    return
  hashed_password = pwd_context.hash(password)
  users[username] = {
    "username": username,
    "hashed_password": hashed_password
  }
  save_users(users)
  print(f"'{username}' aggiunto")



if __name__ == "__main__":
  username = input("username: ")
  password = input("password: ")
  add_user(username, password)
