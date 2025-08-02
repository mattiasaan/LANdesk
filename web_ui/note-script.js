const url = "http://127.0.0.1:8000/notes";
const url2 = "http://127.0.0.1:8000/notes/";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("note-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    saveNote();
  });
});

function saveNote() {
  const title = document.getElementById("note-title").value;
  const description = document.getElementById("note-description").value;

  const noteData = { title, description };
  const form = document.getElementById("note-form");
  const editingId = form.getAttribute("data-note-id");

  if (editingId) {
    //edit
    fetch(`${url}/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Note updated successfully:", data);
        form.reset();
        form.removeAttribute("data-note-id");
        location.reload();
      })
      .catch((error) => {
        console.error("Error updating note:", error);
      });
  } else {
    //add
    fetch(url2, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Note added successfully:", data);
        form.reset();
        location.reload();
      })
      .catch((error) => {
        console.error("Error adding note:", error);
      });
  }
}

//fetch data from the API
fetch(url)
  .then((response) => response.json())
  .then((data) => {
    const container = document.getElementById("data-container");
    data.forEach((note) => {
      const noteElement = document.createElement("div");
      noteElement.className = "note";
      noteElement.innerHTML = `
      <h2>${note.title}</h2>
      <p>${note.description}</p>
      <div class="actions">
        <button class="edit" onclick="editNote('${note.id}')">Modifica</button>
        <button class="delete" onclick="deleteNote('${note.id}')">Elimina</button>
      </div>
      `;
      container.appendChild(noteElement);
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
    const container = document.getElementById("data-container");
    container.innerHTML = "<p>Error loading data.</p>";
  })
  .finally(() => {
    const container = document.getElementById("data-container");
    if (container.children.length === 0) {
      container.innerHTML = "<p>No data available.</p>";
    }
  });

//add new note function
function addNote() {
  const title = document.getElementById("note-title").value;
  const description = document.getElementById("note-description").value;

  const newNote = {
    title: title,
    description: description,
  };

  fetch(url2, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newNote),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Note added successfully:", data);
      location.reload();
    })
    .catch((error) => {
      console.error("Error adding note:", error);
    });
}

//edit and delete functions
function editNote(id) {
  fetch(`${url}/${id}`)
    .then((response) => response.json())
    .then((note) => {
      document.getElementById("note-title").value = note.title;
      document.getElementById("note-description").value = note.description;

      // Salva l'ID direttamente nel form come attributo data-note-id
      const form = document.getElementById("note-form");
      form.setAttribute("data-note-id", id);
    })
    .catch((error) => {
      console.error("Error fetching note for edit:", error);
    });
}

function deleteNote(id) {
  if (confirm("Are you sure you want to delete this note?")) {
    console.log(`Delete note with ID: ${id}`);
    fetch(`${url}/${id}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        console.log(`Note with ID ${id} deleted successfully.`);
        location.reload();
      } else {
        console.error(`Failed to delete note with ID ${id}.`);
      }
    });
  } else {
    console.log(`Deletion of note with ID ${id} cancelled.`);
  }
}
