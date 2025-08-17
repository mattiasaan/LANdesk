const BASE_URL = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
const url = `${BASE_URL}/files/list`;
const url2 = `${BASE_URL}/files/`;

const token = localStorage.getItem("access_token");

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

fetch(url, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.getElementById('data-container');

    if (data.length === 0) {
      dataContainer.innerHTML = '<p>Nessun file trovato</p>';
      return;
    }

    data.forEach(file => {
      const fileDiv = document.createElement('div');
      fileDiv.className = 'card';
      fileDiv.innerHTML = `
        <h3>${file.name}</h3>
        <p>${file.type}</p>
        <p>Dimensione: ${formatSize(file.size)}</p>
        <div class="actions">
          <div class="button-row">
            <button class="download" onclick="downloadFile('${file.id}', '${file.name}')">scarica</button>
            <button class="delete" onclick="deleteFile('${file.id}')">Elimina</button>
          </div>
        </div>
      `;
      dataContainer.appendChild(fileDiv);
    });
  })

  function addFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('file', file);
    
    fetch(`${url2}upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(() => location.reload())
      .catch(error => {
        console.error('Errore caricamento:', error);
        alert('Errore caricamento');
      });
  }

  function deleteFile(fileid) {
    if (confirm("Are you sure you want to delete this file?")) {
      fetch(`${url2}delete/${fileid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (response.ok) {
            location.reload();
          } else {
            throw new Error('Errore durante leliminazione del file');
          }
        })
        .catch(error => {
          console.error('Errore eliminazione:', error);
          alert('Errore eliminazione');
        });
    }
  }

async function downloadFile(fileid, filename) {
  try {
    const response = await fetch(`${url2}download/${fileid}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Erore nel download del file");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || fileid;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert("errore durante il download: " + err.message);
  }
}
