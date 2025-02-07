const originalValues = {};
export async function Editar_fila(event, codigo, Lista_elementos, permisos, names, names2, opciones_select, opciones_number, id) {
  const boton = event.currentTarget;
  const fila = boton.closest("tr");
  const celdas = fila.querySelectorAll("td");
  const dataid = boton.getAttribute("data-id");
  const [funcion, id1] = dataid.split(",");
  const obj_elemento = Lista_elementos.find((obj) => Number(obj[id]) === Number(id1));
  const obj_elementoc = { ...obj_elemento };

  let isEditing = boton.innerHTML.includes("bi-pencil-square");

  if (!obj_elemento) {
    console.error("Elemento no encontrado en la lista.");
    return null;
  }

  if (isEditing) {
    return await activarModoEdicion();
  } else {
    return await guardarCambios();
  }

  async function activarModoEdicion() {
    let firstInput = null;

    for (const [index, celda] of celdas.entries()) {
      if (permisos.includes(index)) {
        const valorOriginal = celda.textContent.trim();
        originalValues[index] = valorOriginal;
        const input = crearElementoEdicion(index, valorOriginal);

        if (input) {
          celda.innerHTML = "";
          celda.appendChild(input);
          input.addEventListener("keydown", manejarEventosTeclado);
          if (!firstInput) firstInput = input;
        }
      }
    }

    if (firstInput) firstInput.focus();
    boton.innerHTML = '<i class="bi bi-floppy"></i>';
  }

  function crearElementoEdicion(index, valorOriginal) {
    let input;
    if (opciones_select.includes(index)) {
      input = crearElementoSelect(names[permisos.indexOf(index)], codigo);
      if (input) input.value = obj_elemento[names2[permisos.indexOf(index)]] || "";
    } else {
      input = document.createElement("input");
      input.type = opciones_number.includes(index) ? "number" : "text";
      input.className = "form-control";
      input.value = valorOriginal;

      if (input.type === "number") {
        input.step = "0.01";
        input.min = "0";
      } else {
        input.required = true;
      }
    }
    return input;
  }
  async function guardarCambios() {
    const nuevosValores = [];
    let cambiosValidos = true;
    for (const [index, celda] of celdas.entries()) {
      if (permisos.includes(index)) {
        const input = celda.querySelector("input, select");
        if (input) {
          const nuevoValor = input.value.trim();
          if (!nuevoValor || (input.type === "number" && isNaN(Number(nuevoValor)))) {
            cambiosValidos = false;
            console.warn(`Valor inválido en la celda ${index}`);
          }
          celda.textContent =input.tagName === "SELECT" ? input.options[input.selectedIndex]?.text || "" : nuevoValor;
          nuevosValores.push(input.tagName === "SELECT" ? Number(nuevoValor) : nuevoValor);
        }
      }
    }

    if (cambiosValidos) {
      await actualizarObjeto(nuevosValores);
      return obj_elemento;
    } else {
      cancelarEdicion();
    }
  }

  async function actualizarObjeto(nuevosValores) {
    names2.forEach((key, index) => {
      obj_elemento[key] = nuevosValores[index];
    });
    if (!objetosSonIguales(obj_elemento, obj_elementoc)) {

      boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
      limpiarEventos();
      console.log("Cambios guardados:", obj_elemento);

    } else {

      console.warn("No se detectaron cambios.");
      cancelarEdicion();

    }
  }

  function cancelarEdicion() {
    celdas.forEach((celda, index) => {
      if (permisos.includes(index)) {
        console.log(originalValues);
        celda.textContent = originalValues[index] || "";
      }
    });
    boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
    limpiarEventos();
  }

  function limpiarEventos() {
    celdas.forEach((celda) => {
      const input = celda.querySelector("input, select");
      if (input) {
        input.removeEventListener("keydown", manejarEventosTeclado);
      }
    });
  }

  async function manejarEventosTeclado(event) {
    const input = event.target;
    if (!input) return;
    if (event.key === "Escape") {
      event.preventDefault();
      cancelarEdicion();
    }
  }

  function crearElementoSelect(nameKey, codigo) {
    const elementId = `${nameKey}${codigo}`;
    const contenido = document.querySelector(`#${elementId}`)?.innerHTML;

    if (!contenido) {
      console.error(`No se encontró el contenido para ${elementId}`);
      return null;
    }

    const select = document.createElement("select");
    select.className = "form-select";
    select.name = nameKey;
    select.innerHTML = contenido;
    return select;
  }

  function objetosSonIguales(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}


export async function Editar_fila_(
  event, 
  codigo, 
  Lista_elementos, 
  permisos, 
  names, 
  names2, 
  opciones_select, 
  id
) {
  const boton = event.currentTarget;
  const fila = boton.closest("tr");
  const celdas = fila.querySelectorAll("td");
  const dataid = boton.getAttribute("data-id");
  const [funcion, id1] = dataid.split(",");
  const obj_elemento = Lista_elementos.find((obj) => Number(obj[id]) === Number(id1));
  const obj_elementoc = { ...obj_elemento };

  let isEditing = boton.innerHTML.includes("bi-pencil-square");

  if (!obj_elemento) {
    console.error("Elemento no encontrado en la lista.");
    return null;
  }

  if (isEditing) {
    return await activarModoEdicion();
  } else {
    return await guardarCambios();
  }

  async function activarModoEdicion() {
    let firstInput = null;

    for (const [index, celda] of celdas.entries()) {
      if (permisos[index]) {
        const valorOriginal = celda.textContent.trim();
        const input = crearElementoEdicion(index, valorOriginal);

        if (input) {
          celda.innerHTML = "";
          celda.appendChild(input);
          input.addEventListener("keydown", manejarEventosTeclado);
          if (!firstInput) firstInput = input;
        }
      }
    }

    if (firstInput) firstInput.focus();
    boton.innerHTML = '<i class="bi bi-floppy"></i>';
  }

  function crearElementoEdicion(index, valorOriginal) {
    let input;

    if (opciones_select[index] === "select") {
      input = crearElementoSelect(
        names[permisos.indexOf(index)], 
        codigo, 
        permisos[index] // Lista de opciones asociada al índice
      );
      if (input) {
        input.value = obj_elemento[names2[permisos.indexOf(index)]] || "";
      }
    } else {
      input = document.createElement("input");
      input.type = opciones_select[index];
      input.className = "form-control";
      input.value = valorOriginal;

      if (input.type === "number") {
        input.step = "0.01";
        input.min = "0";
      } else {
        input.required = true;
      }
    }

    return input;
  }

  async function guardarCambios() {
    const nuevosValores = [];
    let cambiosValidos = true;

    for (const [index, celda] of celdas.entries()) {
      if (permisos[index]) {
        const input = celda.querySelector("input, select");
        if (input) {
          const nuevoValor = input.value.trim();
          if (!nuevoValor || (input.type === "number" && isNaN(Number(nuevoValor)))) {
            cambiosValidos = false;
            console.warn(`Valor inválido en la celda ${index}`);
          }
          celda.textContent = input.tagName === "SELECT" ? 
            input.options[input.selectedIndex]?.text || "" : 
            nuevoValor;
          nuevosValores.push(input.tagName === "SELECT" ? Number(nuevoValor) : nuevoValor);
        }
      }
    }

    if (cambiosValidos) {
      await actualizarObjeto(nuevosValores);
      return obj_elemento;
    } else {
      cancelarEdicion();
    }
  }

  async function actualizarObjeto(nuevosValores) {
    names2.forEach((key, index) => {
      obj_elemento[key] = nuevosValores[index];
    });

    if (!objetosSonIguales(obj_elemento, obj_elementoc)) {
      boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
      limpiarEventos();
      console.log("Cambios guardados:", obj_elemento);
    } else {
      console.warn("No se detectaron cambios.");
      cancelarEdicion();
    }
  }

  function cancelarEdicion() {
    celdas.forEach((celda, index) => {
      if (permisos[index]) {
        celda.textContent = obj_elementoc[names2[permisos.indexOf(index)]] || "";
      }
    });
    boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
    limpiarEventos();
  }

  function limpiarEventos() {
    celdas.forEach((celda) => {
      const input = celda.querySelector("input, select");
      if (input) {
        input.removeEventListener("keydown", manejarEventosTeclado);
      }
    });
  }

  async function manejarEventosTeclado(event) {
    const input = event.target;
    if (!input) return;
    if (event.key === "Escape") {
      event.preventDefault();
      cancelarEdicion();
    }
  }

  function crearElementoSelect(nameKey, codigo, Lista_opciones) {
    const elementId = `${nameKey}${codigo}`;
    const contenido = document.querySelector(`#${elementId}`)?.innerHTML;

    const select = document.createElement("select");
    select.className = "form-select";
    select.name = nameKey;
    console.log(Lista_opciones);
    if (contenido) {
      select.innerHTML = contenido;
    } else if (Array.isArray(Lista_opciones) && Lista_opciones.length > 0) {
      Lista_opciones.forEach(item => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        select.appendChild(option);
      });
    } else {
      console.error(`No options available to create select for ${nameKey}`);
      return null;
    }

    return select;
  }

  function objetosSonIguales(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}
