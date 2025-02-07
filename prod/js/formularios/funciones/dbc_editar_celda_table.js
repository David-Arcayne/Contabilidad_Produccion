import { URL_APIP } from "../../../../lib/services.js";

export function Editar_tabla_celda(e,Lista_elementos, codigo, elementos_select, elementos_number, url_api ,ver, nom_v_Emp, md5, id) {
  const target = e.target;

  if (
    target.tagName.toLowerCase() !== "td" ||
    target.classList.contains("editing")
  )
    return;

  const originalValue = target.textContent.trim();
  const [inpId, inpKey, inpKey2] = target.getAttribute("data-type").split(",");
  const obj_elemento = Lista_elementos.find(
    (obj) => Number(obj[id]) === Number(inpId)
  );
  if (!obj_elemento) {
    console.error(`Elemento with id ${inpId} not found`);
    return;
  }
  const confirm = { ...obj_elemento };

  let input;
  const isSelect = elementos_select.includes(inpKey);

  if (isSelect) {
    input = createSelectElement(inpKey, codigo);
    if (!input) {
      alertas([
        "info",
        `No se encontró el elemento con id #${inpKey}${codigo}`,
      ]);
      return;
    }
    input.style.width = "300px";
    input.value = obj_elemento[inpKey2];
  } else {
    const inputType = elementos_number.includes(inpKey) ? "number" : "text";
    input = document.createElement("input");
    input.type = inputType;
    input.value = originalValue;
    input.className = "form-control";
    input.style.width = "300px";
    if (inputType === "number") input.step = "0.01";
  }

  target.classList.add("editing");
  target.innerHTML = "";
  target.appendChild(input);
  input.focus();

  function handleInputChange(newValue) {
    target.classList.remove("editing");
    console.log(newValue);
    const aux = isSelect? Number(newValue) || confirm[inpKey] : newValue || confirm[inpKey];
    console.log(aux);
    console.log(inpKey2);
    console.log(inpKey2, aux);
    obj_elemento[inpKey2] = aux;

    target.textContent = isSelect? input.options[input.selectedIndex].text: newValue;
    if(target.textContent === "" || target.textContent ===  null){
      target.textContent = originalValue;
    }else{
      console.log(obj_elemento);
      if (!areObjectsEqual(obj_elemento, confirm)) {
        const formData = new FormData();
        formData.append(ver, url_api);
        formData.append(nom_v_Emp, md5);

        Object.entries(obj_elemento).forEach(([key, value]) =>
          formData.append(key, value)
        );
        //obt_producto_aux = { ...obt_producto_aux, ...confirm };
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        sendformData(e, formData, codigo, ver);
      }
    }
    
  }

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleInputChange(this.value);
    } else if (event.key === "Escape") {
      target.classList.remove("editing");
      target.textContent = originalValue;
    }
  });

  input.addEventListener("blur", function () {
    target.classList.remove("editing");
    target.textContent = originalValue;
  });
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
