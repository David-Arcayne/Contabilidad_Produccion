import { menuPrincipal } from "./menu/menu.js";
//import { crearTargetas } from "./targetas/cargartemplate.js";
const yofinancieromenu = localStorage.getItem('yofinancieromenu');
const yofinanciero = localStorage.getItem('yofinanciero');
if (yofinancieromenu === null && yofinanciero === null) {
  console.log('Los elementos no existen en localStorage');
  window.location.assign('../../vapp/');
} else if (yofinancieromenu === null) {
  console.log('El elemento "yofinancieromenu" no existe en localStorage');
  window.location.assign('../panel/index.html');
} else if (yofinanciero === null) {
  console.log('El elemento "yofinanciero" no existe en localStorage');
  localStorage.clear();
  window.location.assign('../../vapp/');
}

document.addEventListener('DOMContentLoaded', async () => {

  const iframe = document.getElementById('iframetemeplate');

  if (!iframe || iframe.contentDocument.readyState !== 'complete') {
    console.log('Cargando el iframe...');

    location.reload();
    /*iframe.addEventListener('load', async () => {
      verificarLocalStorageYNavegar();
    });*/
  } else {
    console.log('El iframe ya está cargado.');
    menuPrincipal();
  }
});

/*function verificarLocalStorageYNavegar() {
  
  //const yofinancieromenuactivo = JSON.parse(localStorage.getItem('yofinancieromenuactivo'));

  if (yofinancieromenu !== null && yofinanciero !== null) {
    console.log('Los elementos existen en localStorage');
    menuPrincipal();
    /*if (yofinancieromenuactivo !== null) {
      yofinancieromenuactivo.map(key => {
        menuPrincipal();
        setTimeout(() => {
          crearTargetas(key.nombre, key.codigo, key.permisos);
        }, 500);
      });
    }else{
      menuPrincipal();
    }*/
/*} else {
  manejarElementosFaltantes(yofinancieromenu, yofinanciero);
}
}*/

/*function manejarElementosFaltantes(yofinancieromenu, yofinanciero) {
  
}*/