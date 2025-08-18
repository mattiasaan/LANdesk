const BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
const url = `${BASE_URL}/tasks`;
const url2 = `${BASE_URL}/tasks/`;

const token = localStorage.getItem("access_token");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("task-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    savetask();
  });
});

function savetask() {
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  const date = document.getElementById("task-date").value;

  const taskData = { title, description,date};
  const form = document.getElementById("task-form");
  const editingId = form.getAttribute("data-task-id");

  if (editingId) {
    //edit
    fetch(`${url}/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(taskData),
    })
      .then((response) => response.json())
      .then(() => {
        form.reset();
        form.removeAttribute("data-task-id");
        location.reload();
      })
      .catch((error) => {
        console.error("Error updating task:", error);
      });
  } else {
    //add
    fetch(url2, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(taskData),
    })
      .then((response) => response.json())
      .then(() => {
        form.reset();
        location.reload();
      })
      .catch((error) => {
        console.error("Error adding task:", error);
      });
  }
}

//fetch data from the API
fetch(url2, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
})
  .then((response) => response.json())
  .then((data) => {
    const container = document.getElementById("data-container");
    data.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "card";
      taskElement.innerHTML = `
      <h2>${task.title}</h2>
      <p>${task.description}</p>
      <div class="actions">
        <div class="status-wrapper">
          <label class="status-toggle">
            <input type="checkbox" onchange="toggleStatus('${task.id}')" ${task.completed ? 'checked' : ''} id ="status-${task.id}">
            <span>${task.completed ? "Completato" : "Incompleto"}</span>
          </label>
          <p class="date">${task.date ? `Scadenza: ${new Date(task.date).toLocaleDateString()}` : "Nessuna scadenza"}</p>
        </div>
        <div class="button-row">
          <button class="edit" onclick="edittask('${task.id}')">Modifica</button>
          <button class="delete" onclick="deletetask('${task.id}')">Elimina</button>
        </div>
      </div>
      `;
      container.appendChild(taskElement);
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

//add new task function
function addtask() {
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  const date = document.getElementById("task-date").value;

  const newtask = {
    title: title,
    description: description,
    date: date,
    completed: false
  };

  fetch(url2, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(newtask),
  })
    .then((response) => response.json())
    .then(() => location.reload())
    .catch((error) => {
      console.error("Error adding task:", error);
    });
}

//edit and delete functions
function edittask(id) {
  fetch(`${url}/${id}`,{
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
    .then((response) => response.json())
    .then((task) => {
      document.getElementById("task-title").value = task.title;
      document.getElementById("task-description").value = task.description;
      document.getElementById("task-date").value = task.date || "";

      // Salva l'ID direttamente nel form come attributo data-task-id
      const form = document.getElementById("task-form");
      form.setAttribute("data-task-id", id);
    })
    .catch((error) => {
      console.error("Error fetching task for edit:", error);
    });
}



function deletetask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    fetch(`${url}/${id}`, {
      method: "DELETE",
      headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
    }).then((response) => {
      if (response.ok) {
        location.reload();
      } else {
        console.error(`Failed to delete task with ID ${id}.`);
      }
    });
  } else {
  }
}

function toggleStatus(id) {
  const checkbox = document.getElementById(`status-${id}`);
  const completed = checkbox.checked;

  checkbox.nextElementSibling.textContent = completed ? "Completato" : "Incompleto";

  fetch(`${url}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch task data.");
      }
      return response.json();
    })
    .then((task) => {
      const updatedTask = {
        title: task.title,
        description: task.description,
        date: task.date,
        completed: completed,
      };

      return fetch(`${url}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedTask),
      });
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update task status.");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error updating task status:", error);
      checkbox.checked = !completed;
      checkbox.nextElementSibling.textContent = !completed ? "Completato" : "Incompleto";
    });
}

