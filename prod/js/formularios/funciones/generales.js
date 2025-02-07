import * as modales from "../funciones/modales/modal_registrar.js";

export function reverseArray(array) {
    let invertida = [];
    console.log(invertida);
    for (let i = array.length - 1; i >= 0; i--) {
        console.log(array[i]);
        invertida.push({...array[i]});
        console.log(invertida);
    }
    return invertida;

}

export function ordenar_array(A, index) {
  var len = A.length; // Longitud del arreglo
  console.log(A);
  var i = 1;
  console.log(i);
  while (i < len) {
      // Guardar el subarreglo actual
      var x = A[i];
      var j = i - 1;
      
      console.log(j,Number(A[j][index]), Number(x[index]));
      // Comparar valores en el índice `index`
      while (j >= 0 && Number(A[j][index]) > Number(x[index])) {
        console.log('=============');
        console.log(j,Number(A[j][index]), Number(x[index]));

          A[j + 1] = A[j]; // Desplazar subarreglo hacia adelante
          j = j - 1;
      }

      // Insertar el subarreglo en la posición correcta
      A[j + 1] = x;
      i = i + 1;
  }
 
  console.log(A);
  return A
}
export function ordenar_array_(A, index) {
  var len = A.length;
  console.log("Arreglo original:", A);

  for (let i = 0; i < len; i++) {
      if (!A[i].hasOwnProperty(index)) {
          console.error(`La clave '${index}' no existe en el objeto:`, A[i]);
      }
  }

  var i = 1;
  while (i < len) {
      var x = A[i];
      var j = i - 1;

      // Validar que la clave existe y tiene valor
      var xValue = x[index] !== undefined ? parseFloat(x[index]) : Number.MAX_SAFE_INTEGER;
      if (isNaN(xValue)) {
          console.error(`Valor no numérico o faltante en fila ${i}:`, x[index]);
          xValue = Number.MAX_SAFE_INTEGER;
      }

      while (j >= 0) {
          var jValue = A[j][index] !== undefined ? parseFloat(A[j][index]) : Number.MAX_SAFE_INTEGER;
          if (isNaN(jValue)) {
              console.error(`Valor no numérico o faltante en fila ${j}:`, A[j][index]);
              jValue = Number.MAX_SAFE_INTEGER;
          }

          if (jValue <= xValue) break;

          A[j + 1] = A[j];
          j = j - 1;
      }

      A[j + 1] = x;
      i = i + 1;
  }

  console.log("Arreglo ordenado:", A);
  return A;
}



export function dateTime_actual() {
  const ahora = new Date();

  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
  const dia = String(ahora.getDate()).padStart(2, '0');

  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');

  return `${año}-${mes}-${dia} ${horas}:${minutos}`;
}



export function alertas(data,codigo) {
    console.log(data,data[0]);
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "success") {
      alertClass = "alert-success";
      alertMessage = data[1];
      timeoutDuration = 2000;
      console.log(alertClass,alertMessage,timeoutDuration);
    } else {
      if (data[0] == "danger" || data[0] == "Error") {
        alertClass = "alert-danger";
        alertMessage = data[1];
        timeoutDuration = 3000;
      } else {
        alertClass = "alert-primary";
        alertMessage = data['mensaje'];
        timeoutDuration = 3000;
      }
    }
    console.log(alertClass,alertMessage,timeoutDuration);
    // Obtener el div de alerta
    let divalert = document.querySelector(`#alerta${codigo}`);
    if (divalert) {
      // Crear el nuevo contenido de la alerta
      let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
      divalert.innerHTML = nuevoContenido;
  
      // Eliminar la alerta después del tiempo especificado
      setTimeout(() => {
        divalert.innerHTML = ``;
        
      }, timeoutDuration);
    }
  }
export function cambiarFormatoFecha(fecha) {
  //alert(fecha);
  if (fecha === "" || fecha === null || fecha === "null") {
    return '';
  } else {
    const partes = fecha.split("-");
    const año = partes[0];
    const mes = partes[1];
    const día = partes[2];

    return `${día}-${mes}-${año}`;
  }
    
}

// Ejemplo de uso
const fechaOriginal = "2025-01-05";
const fechaFormateada = cambiarFormatoFecha(fechaOriginal);
console.log(fechaFormateada); // "05-01-2025"

  export function fechaBolivia(condicion){
    const now = new Date();
    const offset = -4; // Bolivia es UTC-4
    now.setHours(now.getHours() + offset);

    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    const currentTime = `${hours}:${minutes}:${seconds}`;
    
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;
    return currentDate;
  }
  export function horasBolivia(condicion){
    const now = new Date();
    const offset = -4; // Bolivia es UTC-4
    now.setHours(now.getHours() + offset);

    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    const currentTime = `${hours}:${minutes}:${seconds}`;
    

    return currentTime;
  }
  export function horasBolivia_input(condicion){
    const now = new Date();
    const offset = -4; // Bolivia es UTC-4
    now.setHours(now.getHours() + offset);

    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;
    

    return currentTime;
  }
  export function llenarSelects(Lista_elementos,nom1,nom2,codigo) {
    let select = document.getElementById(codigo);
    let view = "";
  
    Lista_elementos.forEach((lista) => {
      view += `<option value="${lista[nom1]}">${
        lista[nom2]
      }</option>`;
    });
    select.innerHTML = view;
  }
  export function mostrarNotificacion(mensaje, tiempo = 3000) {
    const notificacionesContainer = document.getElementById('notificaciones');

    // Verificar si el contenedor de notificaciones existe
    if (!notificacionesContainer) {
        console.error('El contenedor de notificaciones no existe en el DOM.');
        return;
    }

    // Crear un nuevo elemento para la notificación
    const notificacion = document.createElement('div');
    notificacion.classList.add('toast');
    notificacion.setAttribute('role', 'alert');
    notificacion.setAttribute('aria-live', 'assertive');
    notificacion.setAttribute('aria-atomic', 'true');

    // Asignar el contenido HTML del mensaje
    notificacion.innerHTML = `
        <div class="toast-header">
          <strong class="me-auto">Notificación</strong>
          <small class="text-body-secondary">Justo ahora</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
        <div class="toast-body">
          ${mensaje}
        </div>
    `;

    // Agregar la notificación al contenedor
    notificacionesContainer.appendChild(notificacion);

    // Inicializar el Toast con Bootstrap
    const toastBootstrap = new bootstrap.Toast(notificacion);
    toastBootstrap.show();
    // Ocultar y eliminar la notificación después del tiempo especificado
    setTimeout(() => {
        toastBootstrap.hide(); // Oculta la notificación usando Bootstrap
        setTimeout(() => notificacion.remove(), 500); // Elimina el elemento después de ocultarlo
    }, tiempo);
} 
{/* <div class="icon-demo mb-4 border rounded-3 d-flex align-items-center justify-content-center p-3 py-6" style="font-size: 10em" role="img" aria-label="Exclamation triangle fill - large preview" bis_skin_checked="1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"></path>
</svg>
          </div> */}
export function alerta_success(code,title,content){
  modales.crearModalSoS({
          code: code,
          type:false,
          x:'600px',
          y:'300px',
          id: `alert_info${1}`,
          header: `  
              
          
          `,
          body: `
              <div id="" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                  
                  <div class = "row" >
                      <div  style="text-align: center;">
                          <div class="icon-success" style="font-size: 100px; color: #167e1a;"><i class="bi bi-check2-circle fs-10"></i></div>
                          <h5  class="text-primary-emphasis" style="font-size: 24px; font-weight: bold; ">${title}</h5>
                          <p style="color: #6c757d;">${content}</p>
                      </div>
                      
                  </div>
                  
              </div>
  
          `,
          footerButtons: [
              
              {
                  id: `btnCancelar${code}`,
                  text: "OK",
                  class: "btn btn-outline-success mr-1",
                  onClick: () => '',
                  dismiss: true // Cierra el modal sin ejecutar ninguna acción
              },
              
          ]
          
      });
}

// Ejemplo de uso

