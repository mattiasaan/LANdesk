if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('Service Worker reg'))
      .catch(err => console.error('Errore SW:', err));
  });
}
