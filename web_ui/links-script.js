const BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
const url = `${BASE_URL}/links`;
const url2 = `${BASE_URL}/links/`;
const categoriesUrl = `${BASE_URL}/categories/`;

const token = localStorage.getItem("access_token");

//Mostra/nasconde tipi di risorsa
const newCategoryInput = document.getElementById("new-category");
const categoryTypesBox = document.getElementById("resource-panel");

newCategoryInput.addEventListener("input", () => {
  if (newCategoryInput.value.trim() !== "") {
    categoryTypesBox.classList.add("show");
  } else {
    categoryTypesBox.classList.remove("show");
    // Deseleziona le checkbox quando scompare
    categoryTypesBox.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
  }
});


function getSelectedResourceTypes() {
  const checkedBoxes = categoryTypesBox.querySelectorAll("input[type='checkbox']:checked");
  return Array.from(checkedBoxes).map(cb => cb.value);
}

// carica categorie nel select
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();

  const form = document.getElementById("link-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    saveLink();
  });
});

function loadCategories() {
  fetch(categoriesUrl, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(categories => {
      const select = document.getElementById("link-category");
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    })
    .catch(err => console.error("Error loadng categories:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("link-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    savelink();
  });
});

function saveLink() {
  const title = document.getElementById("link-title").value;
  const description = document.getElementById("link-description").value;
  const categorySelect = document.getElementById("link-category");
  const newCategoryInput = document.getElementById("new-category").value.trim();
  const newCategoryTypes = getSelectedResourceTypes();

  let categoryId = categorySelect.value;

  const proceedToSaveLink = (catId) => {
    const linkData = { title, description, category_id: catId };
    const form = document.getElementById("link-form");
    const editingId = form.getAttribute("data-link-id");

    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId ? `${url2}${editingId}` : url2;

    fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(linkData),
    })
      .then(res => res.json())
      .then(() => {
        form.reset();
        form.removeAttribute("data-link-id");
        location.reload();
      })
      .catch(err => console.error("Error saving link:", err));
  };

  if (newCategoryInput) {
    // crea prima nuova categoria
    fetch(categoriesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name: newCategoryInput, resource_types: newCategoryTypes })
    })
      .then(res => res.json())
      .then(data => {
        if (data.category && data.category.id) {
          proceedToSaveLink(data.category.id);
        } else {
          console.error("Error creating category:", data);
        }
      })
      .catch(err => console.error("Error creating category:", err));
  } else {
    proceedToSaveLink(categoryId); // usa categoria esistente
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
