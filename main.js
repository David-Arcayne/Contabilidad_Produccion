if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('./swyf.js')
      .then(function(registration) {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(function(error) {
        console.error('Error al registrar el Service Worker:', error);
      });
  
    window.addEventListener('beforeinstallprompt', function(event) {
      event.preventDefault();
      document.getElementById('installButton').style.display = 'block';
  
      document.getElementById('installButton').addEventListener('click', function() {
        event.prompt();
        event.userChoice.then(function(choiceResult) {
          if (choiceResult.outcome === 'accepted') {
            console.log('El usuario aceptó instalar la PWA');
          } else {
            console.log('El usuario canceló la instalación de la PWA');
          }
        });
      });
    });
  
    // Evento para ocultar el botón después de la instalación
    window.addEventListener('appinstalled', function(event) {
      console.log('La aplicación fue instalada con éxito');
      document.getElementById('installButton').style.display = 'none';
    });
  }