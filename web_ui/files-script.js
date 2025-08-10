url = "http://127.0.0.1:8000/files/list";

fetch(url)
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
        <p>Dimensione: ${file.size} bytes</p>
      `;
      dataContainer.appendChild(fileDiv);
    });
  })

  function addFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('file', file);
    
    fetch('http://127.0.0.1:8000/files/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .catch(error => {
        console.error('Errore caricamento:', error);
        alert('Errore caricamento');
      });
  }