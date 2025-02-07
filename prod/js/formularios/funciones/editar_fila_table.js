import { URL_APIP } from "../../../../lib/services.js";

export function Editar_table_fila(event,codigo,Lista_elementos,permisos,names,names2,opciones_select,opciones_number,url_api,ver,nom_v_Emp,md5,id) {
  let data;
  const boton = event.currentTarget;
  console.log(boton);
  const fila = boton.closest("tr");
  const celdas = fila.querySelectorAll("td");
  const dataid = boton.getAttribute("data-id");
  const [funcion, id1] = dataid.split(",");
  const obj_elemento = Lista_elementos.find(
    (obj) => Number(obj[id]) === Number(id1)
  );
  const obj_elementoc = { ...obj_elemento };
  let originalValues = {};
  console.log(obj_elemento);
  if (boton.innerHTML.includes("bi-pencil-square")) {
    // Modo Editar
    editarFila();
    boton.innerHTML = '<i class="bi bi-floppy"></i>';
  } else {
    guardarCambios();
  }

  function editarFila() {
    let firstInput;
    celdas.forEach((celda, index) => {
      if (permisos.includes(index)) {
        const valorOriginal = celda.textContent.trim();
        originalValues[index] = valorOriginal;

        const input = createInputElement(index, valorOriginal);
        if (input) {
          celda.innerHTML = "";
          celda.appendChild(input);
          input.addEventListener("keydown", handleKeyDown);

          // Establecer el primer input para enfocar
          if (!firstInput) {
            firstInput = input;
          }
        }
      }
    });
    console.log(originalValues);
    // Enfocar el primer input
    if (firstInput) {
      firstInput.focus();
    }
  }

  function createInputElement(index, valorOriginal) {
    let input;
    if (opciones_select.includes(index)) {
      input = createSelectElement(names[permisos.indexOf(index)], codigo);
      if (input) {
        //input.style.width = '150px';
        input.value = obj_elemento[names2[permisos.indexOf(index)]];
      }
    } else {
      input = document.createElement("input");
      input.id = `ediinp${codigo}`;
      input.className = "form-control";
      //input.style.width = '150px';
      input.value = valorOriginal;
      input.type = opciones_number.includes(index) ? "number" : "text";
      if (input.type === "number") {
        input.step = "0.01";
        input.min = "0";  
      }else {
        input.required = true; // No permite texto vacío
      }
    }
    return input;
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      guardarCambios();
    } else if (event.key === "Escape") {
      cancelarCambios();
    }
  }

  function guardarCambios() {
    const datosnuevos = [];
    let linea = true;

    celdas.forEach((celda, index) => {
      if (permisos.includes(index)) {
        const input = celda.querySelector("input, select");
        if (input) {
          const nuevoValor = input.value.trim();
          if (nuevoValor === "" || nuevoValor === null) {
            linea = false;
          } else {
            
            celda.textContent =input.tagName === "SELECT" ? input.options[input.selectedIndex].text: nuevoValor;
            datosnuevos.push(input.tagName === "SELECT" ? Number(nuevoValor) : nuevoValor);
          }
        }
      }
    });

    if (linea) {
      // Actualizar obj_elemento
      names2.forEach((key, index) => {
        obj_elemento[key] = datosnuevos[index];
      });
      if (!areObjectsEqual(obj_elemento, obj_elementoc)) {
        return enviarFormulario(obj_elemento);
      }
      boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
      removerEventListeners();
    } else {
      cancelarCambios();
    }
  }

  function enviarFormulario(obj) {
    const formData = new FormData();
    formData.append(ver, url_api);
    formData.append(nom_v_Emp, md5);

    Object.entries(obj).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return sendformData(event, formData, codigo,ver);
  }

  function cancelarCambios() {
    celdas.forEach((celda, index) => {
      if (permisos.includes(index)) {
        celda.innerHTML = originalValues[index];
      }
    });

    boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
    removerEventListeners();
  }

  function removerEventListeners() {
    celdas.forEach((celda) => {
      const input = celda.querySelector(`#ediinp${codigo}`);
      if (input) {
        input.removeEventListener("keydown", handleKeyDown);
      }
    });
  }

  boton.removeEventListener("click", Editar_table_fila);
  boton.addEventListener("click", Editar_table_fila);
}

function areObjectsEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    console.log(key);
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

function createSelectElement(inpKey, codigo) {
  console.log(inpKey, codigo);
  const elementId = `${inpKey}${codigo}`;
  console.log(elementId);
  const innerHTMLContent = document.querySelector(`#${elementId}`).innerHTML;
  if (!innerHTMLContent) return null;

  const select = document.createElement("select");
  select.className = "form-select";
  select.name = inpKey;
  select.innerHTML = innerHTMLContent;
  return select;
}
function sendformData(event, formData, codigo,ver) {
  event.preventDefault();

  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  if(ver == "verDavid"){
    fetch(`${URL_APIP}api/`, {
      // Reemplaza esto con la URL de tu servidor
      method: "POST",
      body: formData,
      headers: {
          'Usar-Registro-David': 'true'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        
        alertas(data, codigo);
        return data;
      })
      .catch((error) => {
        console.error("Error al enviar los datos:", error);
      });
  }else{
    fetch(`${URL_APIP}api/`, {
      // Reemplaza esto con la URL de tu servidor
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alertas(data, codigo);
        return data;
      })
      .catch((error) => {
        console.error("Error al enviar los datos:", error);
      });
  }
  
}
function alertas(data, codigo) {
  console.log(data);
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "ok") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 1500;

    // Resetear el formulario si existe
    let formulario = document.querySelector(`#formulario${codigo}`);
    if (formulario) {
      formulario.reset();
    }
  } else {
    if (data[0] == "Error") {
      alertClass = "alert-danger";
      alertMessage = data[1];
      timeoutDuration = 3000;
    } else {
      alertClass = "alert-primary";
      alertMessage = data[1];
      timeoutDuration = 3000;
    }
  }

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
