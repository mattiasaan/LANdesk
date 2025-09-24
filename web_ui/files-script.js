const BASE_URL = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
const url = `${BASE_URL}/files/list`;
const url2 = `${BASE_URL}/files/`;

const token = localStorage.getItem("access_token");

const fileInput = document.getElementById('file-input');
const fileNameDisplay = document.getElementById('file-name');

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    fileNameDisplay.textContent = fileInput.files[0].name;
  } else {
    fileNameDisplay.textContent = "Nessun file selezionato";
  }
});


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
      fileDiv.onclick = () => previewFile(file.id, file.name, file.type);
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

function previewFile(fileid, filename, filetype) {
  const previewUrl = `${url2}preview/${fileid}`;

  const extension = filetype.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
    fetch(previewUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const imgUrl = URL.createObjectURL(blob);
        showModal(`<img src="${imgUrl}" alt="${filename}" style="max-width:100%">`);
      });

  } else if (["pdf"].includes(extension)) {
    fetch(previewUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const pdfUrl = URL.createObjectURL(blob);
        showModal(`<iframe src="${pdfUrl}" style="width:100%;height:80vh;" frameborder="0"></iframe>`);
      });

  } else if (["txt", "md", "csv", "json"].includes(extension)) {
    fetch(previewUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.text())
      .then(text => showModal(`<pre style="max-height:70vh;overflow:auto">${text}</pre>`));

  } else if (["mp3", "wav", "ogg"].includes(extension)) {
    fetch(previewUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        showModal(`<audio controls src="${audioUrl}" style="width:100%"></audio>`);
      });

  } else if (["mp4", "webm", "ogg"].includes(extension)) {
    fetch(previewUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const videoUrl = URL.createObjectURL(blob);
        showModal(`<video controls src="${videoUrl}" style="width:100%;max-height:70vh"></video>`);
      });

  } else {
    // per gli altri tipi scarica file
    fetch(previewUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || fileid;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  }
}

function showModal(html) {
  let modal = document.getElementById('preview-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'preview-modal';
    modal.innerHTML = `<div id="modal-content"></div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('modal-content').innerHTML = html + '<br><button onclick="document.getElementById(\'preview-modal\').remove();event.stopPropagation();">Chiudi</button>';
}
