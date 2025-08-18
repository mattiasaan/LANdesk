# LANdesk

LANdesk is a self-hosted, local-first dashboard for managing personal productivity. It provides a clean interface to organize tasks, notes, and files, all running on your own machine or local network.

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Accessing the Frontend](#accessing-the-frontend)
5. [Usage](#usage)
6. [Utility Scripts](#utility-scripts)
7. [Enabling HTTPS (Optional)](#enabling-https-optional)

---

## Features

- **Task Management:** Create, update, and delete tasks with title, description, due date, and completion status.
- **Note Taking:** Create, edit, and delete personal notes.
- **File Sharing:** Upload, list, download, and delete files within your local network.
- **Secure Authentication:** User authentication using JWT (JSON Web Tokens) to protect all endpoints.
- **Progressive Web App (PWA):** Service worker and manifest enable offline access and installation on desktop or mobile(read below).
- **Responsive UI:** Modern, dark-themed interface compatible with different screen sizes.

---

## Tech Stack

- **Backend:** Python with FastAPI
  - Pydantic for data validation and settings management
  - Passlib and python-jose for password hashing and JWT authentication
- **Frontend:** HTML, CSS, and JavaScript
- **Database:** JSON files for simple data storing

---

## Getting Started

These instructions will help you set up and run LANdesk locally.

### Prerequisites

- Python 3.7+
- pip (Python package manager)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/mattiasaan/LANdesk.git
   cd LANdesk
   ```

2. **Install Python dependencies:**
   ```sh
   pip install "fastapi[all]" "passlib[bcrypt]" "python-jose[cryptography]" python-dotenv
   ```

3. **Create required directories and files:**
   ```sh
   mkdir -p backend_py/public/public_files backend_py/public/metadata backend_py/secure
   echo "[]" > backend_py/public/data_notes.json
   echo "[]" > backend_py/public/data_tasks.json
   echo "{}" > backend_py/public/metadata/files_metadata.json
   echo "{}" > backend_py/secure/users.json
   ```

4. **Configure environment variables:**
   Create a `.env` file in `backend_py/secure/`:
   ```
   KEY=your_super_secret_key_here #the key for decoding passwords
   url=http://127.0.0.1:8000 #the url where your server will run
   ```
   Generate a secure key with `openssl rand -hex 32`.

5. **Add a user:**
   ```sh
   python backend_py/add_user.py
   ```

6. **Run the server:**
   ```sh
   uvicorn backend_py/main:app --reload
   ```
   Server will run at `http://127.0.0.1:8000` (for lan usage read below).

---

## Accessing the Frontend

Open your browser and navigate to `http://127.0.0.1:8000` . Log in using the credentials created during setup.

---

## Usage

- **Home Page:** Dashboard with links to Tasks, Notes, and Files.
- **Tasks:** Add, edit, complete, or delete tasks.
- **Notes:** Create, edit, and remove personal notes.
- **Files:** Upload, download, or delete files for local network sharing.

---

## Utility Scripts

- `backend_py/add_user.py` – Command-line tool to add new users.
- `backend_py/generators/` – Python scripts (`note_sender.py`, `task_sender.py`) using Faker to generate and post sample data for testing.

---

## Enabling HTTPS (Optional)

To enable full PWA functionality, run LANdesk on HTTPS using locally trusted certificates.

### Steps:

1. **Create a local certificate**
you can use mkcer please follow the installation at [mkcert GitHub](https://github.com/FiloSottile/mkcert)

2. **Run Uvicorn with SSL:**
   ```sh
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 --ssl-keyfile=name_of_file-key.pem --ssl-certfile=name_of_file.pem
   ```

3. **Access LANdesk via HTTPS:**  
   Navigate to `https://yourIP:8000`.

> Note: This README was drafted with the assistance of AI and reviewed/edited by the author.


