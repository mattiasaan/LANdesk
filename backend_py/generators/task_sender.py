import random
from faker import Faker
import requests

fake = Faker('it_IT')

url = "http://127.0.0.1:8000/tasks/"

titles = [
    "Comprare la spesa",
    "Scrivere report settimanale",
    "Leggere un capitolo del libro",
    "Fare esercizio fisico",
    "Aggiornare progetto in corso",
    "Prenotare visita medica",
    "Comprare regalo",
    "Rivedere obiettivi mensili",
    "Preparare pasto della settimana",
    "Pulizie di casa"
]

descriptions = {
    "Comprare la spesa": ["latte, pane, uova", "verdura fresca", "snack per la settimana"],
    "Scrivere report settimanale": ["analisi vendite", "attivita svolte", "problemi riscontrati"],
    "Leggere un capitolo del libro": ["capitolo 5 - Il conflitto", "capitolo 6 - La soluzione"],
    "Fare esercizio fisico": ["allenamento cardio", "stretching 15 minuti", "addominali e squat"],
    "Aggiornare progetto in corso": ["correggere bug", "scrivere documentazione", "push su GitHub"],
    "Prenotare visita medica": ["dentista", "oculista", "medico di base"],
    "Comprare regalo": ["libro fantasy", "set candele profumate", "buono regalo"],
    "Rivedere obiettivi mensili": ["valutare progressi", "scrivere nuovi obiettivi", "spostare task incompleti"],
    "Preparare pasto della settimana": ["meal prep pranzo", "organizzare cene", "fare lista ingredienti"],
    "Pulizie di casa": ["lavare pavimenti", "spolverare mobili", "pulire bagno"],
}

for _ in range(50):
    title = random.choice(titles)
    desc_options = descriptions.get(title, ["Task generica da completare"])
    description = ", ".join(random.sample(desc_options, k=min(2, len(desc_options))))
    date = fake.date_between(start_date='-30d', end_date='+30d').isoformat()
    completed = random.choice([True, False])

    task = {
        "title": title,
        "description": description,
        "date": date,
        "completed": completed
    }

    response = requests.post(url, json=task)
    print(response.status_code, response.text)
