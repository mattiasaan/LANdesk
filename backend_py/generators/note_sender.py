import random
from faker import Faker
import requests

fake = Faker('it_IT')

url = "http://127.0.0.1:8000/notes/"

titles = [
    "Spesa settimanale",
    "Idea startup",
    "Libri da leggere",
    "Allenamento",
    "Progetto FastAPI",
    "Vacanza estate",
    "Regali compleanno",
    "Obiettivi 2025",
    "Ricette preferite",
    "ToDo weekend"
]

descriptions = {
    "Spesa settimanale": ["latte, pane, uova", "frutta fresca", "verdure biologiche"],
"Idea startup": ["gestione ricette", "piano dieta", "app mobile"],
    "Libri da leggere": ["1984", "Il Gattopardo", "La fattoria degli animali"],
    "Allenamento": ["lunedi petto", "giovedi braccia", "cardio settimanale"],
}

for _ in range(5):
    title = random.choice(titles)
    desc_options = descriptions.get(title, ["Note generica"])
    description = ", ".join(random.sample(desc_options, k=min(2, len(desc_options))))
    note = {
        "title": title,
        "description": description
    }
    response = requests.post(url, json=note)
    print(response.status_code)
    print(response.text)
