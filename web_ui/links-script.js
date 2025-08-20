const BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
const url = `${BASE_URL}/links`;
const url2 = `${BASE_URL}/links/`;

const token = localStorage.getItem("access_token");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("link-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    savelink();
  });
});

function savelink() {
  const title = document.getElementById("link-title").value;
  const description = document.getElementById("link-description").value;

  const linkData = { title, description };
  const form = document.getElementById("link-form");
  const editingId = form.getAttribute("data-link-id");

  if (editingId) {
    //edit
    fetch(`${url2}${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(linkData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("link updated successfully:", data);
        form.reset();
        form.removeAttribute("data-link-id");
        location.reload();
      })
      .catch((error) => {
        console.error("Error updating link:", error);
      });
  } else {
    //add
    fetch(url2, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(linkData),
    })
      .then((response) => response.json())
      .then((data) => {
        form.reset();
        location.reload();
      })
      .catch((error) => {
        console.error("Error adding link:", error);
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
    data.forEach((link) => {
      const linkElement = document.createElement("div");
      linkElement.className = "card";
      linkElement.innerHTML = `
      <h2>${link.title}</h2>
      <p>${link.description}</p>
      <div class="actions">
        <button class="download" onclick="copyLink('${link.id}', this)">Copia<span class="check"></span></button>
        <button class="delete" onclick="deletelink('${link.id}')">Elimina</button>
      </div>
      `;
      container.appendChild(linkElement);
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

//add new link function
function addlink() {
  const title = document.getElementById("link-title").value;
  const description = document.getElementById("link-description").value;

  const newlink = {
    title: title,
    description: description,
  };

  fetch(url2, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(newlink),
  })
    .then((response) => response.json())
    .then(() => location.reload())
    .catch((error) => {
      console.error("Error adding link:", error);
    });
}

function copyLink(id, button) {
  const check = button.querySelector(".check");

  fetch(`${url2}${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
    .then((response) => response.json())
    .then((link) => {
      const linkUrl = `${link.description}`;
      navigator.clipboard.writeText(linkUrl);
      check.innerHTML = "&#x2713";
      setTimeout(() => {
        check.innerHTML = "";
      }, 2000); //2sec
    })
    .catch((error) => {
      console.error("Error fetching link:", error);
    });
}


function deletelink(id) {
  if (confirm("Are you sure you want to delete this link?")) {
    console.log(`Delete link with ID: ${id}`);
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
        console.error(`Failed to delete link with ID ${id}.`);
      }
    });
  }
}
