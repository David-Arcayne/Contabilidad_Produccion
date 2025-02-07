const originalValues = {};

export async function Editar_fila_(event, codigo, Lista_elementos, columnas, id) {
   
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    const celdas = fila.querySelectorAll("td");
    console.log(celdas);
    const dataid = boton.getAttribute("data-id");
    const [funcion, id1] = dataid.split(",");
    
    const obj_elemento = Lista_elementos.find((obj) => Number(obj[id]) === Number(id1));
    const obj_elementoc = { ...obj_elemento };
    console.log(funcion,id1,Lista_elementos,obj_elementoc);
    // Estructura de columnas esperada:
    // columnas = [
    //   {
    //     index: 0,                    // Índice de la columna
    //     editable: true,              // Si la columna es editable
    //     type: 'text',                // Tipo de campo (text, number, date, select, textarea)
    //     field: 'nombreCampo',        // Nombre del campo en el objeto
    //     validations: {               // Validaciones opcionales
    //       required: true,
    //       min: 0,
    //       max: 100,
    //       pattern: /^\d+$/,
    //       maxLength: 50
    //     },
    //     options: [                   // Solo para type: 'select'
    //       { value: 1, label: 'Opción 1' },
    //       { value: 2, label: 'Opción 2' }
    //     ],
    //     format: {                    // Formato opcional para visualización
    //       locale: 'es-ES',
    //       style: 'currency',
    //       currency: 'EUR'
    //     }
    //   }
    // ]
  
    if (!obj_elemento) {
      console.error("Elemento no encontrado en la lista.");
      return null;
    }
  
    const isEditing = boton.innerHTML.includes("bi-pencil-square");
    return isEditing ? await activarModoEdicion() : await guardarCambios();
  
    async function activarModoEdicion() {
      let firstInput = null;
  
      for (const [index, celda] of celdas.entries()) {
        console.log("=============");
        console.log(index);
        const columna = columnas.find(col => col.index === index);
        console.log(columna);
        console.log("=============");
        if (columna?.editable) {
          const valorOriginal = celda.textContent.trim();
          console.log(valorOriginal);
          originalValues[index] = valorOriginal;
          const input = crearElementoEdicion(columna, valorOriginal, obj_elemento[columna.field]);
          console.log(input);
          if (input) {
            
            celda.innerHTML = "";
            celda.appendChild(input);
            console.log(celda);
            configurarEventos(input, columna);
            if (!firstInput) firstInput = input;
          }
        }
      }
  
      if (firstInput) firstInput.focus();
      boton.innerHTML = '<i class="bi bi-floppy"></i>';
    }
  
    function crearElementoEdicion(columna, valorOriginal, valorObjeto) {
      let input;
      const { type, validations = {}, options, format } = columna;
  
      switch (type) {
        case 'time':
          input = document.createElement("input");
          input.type = "time";
          input.className = "form-control";
          input.style.width = '100px';
          if (valorObjeto) {
              // Handle both full datetime strings and time-only strings
              const time = valorObjeto.includes('T') 
                  ? valorObjeto.split('T')[1].substring(0, 5)  // For datetime strings
                  : valorObjeto.substring(0, 5);               // For time-only strings
              input.value = time;
          }
          break;
        case 'select':
          input = document.createElement("select");
          input.className = "form-select";
          input.style.width = '200px';
          if (options?.length) {
            options.forEach(opt => {
              const option = document.createElement("option");
              option.value = opt.value;
              option.textContent = opt.label;
              input.appendChild(option);
            });
            input.value = valorObjeto;
          }
          break;
  
        case 'textarea':
          input = document.createElement("textarea");
          input.className = "form-control";
          input.value = valorOriginal;
          input.rows = 3;
          input.style.width = '800px';
          break;
  
        case 'date':
          input = document.createElement("input");
          input.type = "date";
          input.className = "form-control";
          input.style.width = '200px';
          if (valorObjeto) {
            const fecha = new Date(valorObjeto);
            if (!isNaN(fecha.getTime())) {
              input.value = fecha.toISOString().split('T')[0];
            }
          }
          break;
  
        case 'datetime-local':
          input = document.createElement("input");
          input.type = "datetime-local";
          input.className = "form-control";
          input.style.width = '200px';
          if (valorObjeto) {
            const fecha = new Date(valorObjeto);
            if (!isNaN(fecha.getTime())) {
              input.value = fecha.toISOString().slice(0, 16);
            }
          }
          break;
  
        case 'number':
          input = document.createElement("input");
          input.type = "number";
          input.className = "form-control";
          input.value = valorOriginal;
          input.step = validations.step || "0.01";
          input.style.width = '100px';
          if (validations.min !== undefined) input.min = validations.min;
          if (validations.max !== undefined) input.max = validations.max;
          break;
  
        default: // text
          input = document.createElement("input");
          input.type = "text";
          input.className = "form-control";
          input.value = valorOriginal;
          input.style.width = '200px';
          if (validations.maxLength) input.maxLength = validations.maxLength;
          if (validations.pattern) input.pattern = validations.pattern;
          break;
      }
  
      // Aplicar validaciones comunes
      if (validations.required) input.required = true;
      
      
      return input;
    }
  
    function configurarEventos(input, columna) {
      input.addEventListener("keydown", (event) => manejarEventosTeclado(event, columna));
      
      // Validación en tiempo real
      input.addEventListener("input", () => {
        validarInput(input, columna);
      });
  
      // Formato especial para números
      if (columna.type === 'number' && columna.format) {
        input.addEventListener("blur", () => {
          const valor = input.value;
          if (!isNaN(valor) && valor !== '') {
            const valorFormateado = new Intl.NumberFormat(
              columna.format.locale || 'es-ES',
              columna.format
            ).format(valor);
            input.dataset.formattedValue = valorFormateado;
          }
        });
      }
    }
  
    function validarInput(input, columna) {
      console.log(columna);
      const { validations = {} } = columna;
      let isValid = true;
      let mensaje = '';
  //required
      const valor = input.value.trim();
      console.log(validations.required);
      if (validations.required && !valor ) {
        
        isValid = false;
        mensaje = 'Este campo es requerido';
      } else if (columna.type === 'number') {
        const num = Number(valor);
        if (validations.min !== undefined && num < validations.min) {
          isValid = false;
          mensaje = `El valor mínimo es ${validations.min}`;
        }
        if (validations.max !== undefined && num > validations.max) {
          isValid = false;
          mensaje = `El valor máximo es ${validations.max}`;
        }
      } else if (validations.pattern && !new RegExp(validations.pattern).test(valor)) {
        isValid = false;
        mensaje = 'El formato no es válido';
      }
  
      input.setCustomValidity(mensaje);
      input.reportValidity();
      console.log('isValid: ' + isValid);
      return isValid;
    }
  
    async function guardarCambios() {
      const nuevosValores = {};
      let cambiosValidos = true;
  
      for (const [index, celda] of celdas.entries()) {
        const columna = columnas.find(col => col.index === index);
        if (columna?.editable) {
          const input = celda.querySelector("input, select, textarea");
          if (input && !validarInput(input, columna)) {
            cambiosValidos = false;
            continue;
          }
  
          if (input) {
            const valor = obtenerValorFormateado(input, columna);
            nuevosValores[columna.field] = valor;
            
            celda.textContent = obtenerValorMostrado(valor, columna);
          }
        }
      }
  
      if (cambiosValidos) {
        await actualizarObjeto(nuevosValores);
        return obj_elemento;
      } else {
        alert('Cancelado por que hay datos vacios...');
        cancelarEdicion();
        return null;
      }
    }
    // function obtenerValorFormateado(input, columna) {
    //   const valor = input.value.trim();
    
    //   // Si el valor está vacío, retorna null o algún valor predeterminado
    //   if (!valor) {
    //     return null; // o cualquier valor por defecto que prefieras
    //   }
    
    //   switch (columna.type) {
    //     case 'time':
    //       // Si necesitas almacenar solo la hora
    //       return valor;
    //     case 'number':
    //       // Asegúrate de que el número sea válido
    //       const numero = Number(valor);
    //       return isNaN(numero) ? null : numero;
    //     case 'date':
    //       try {
    //         const fecha = new Date(valor);
    //         if (isNaN(fecha)) {
    //           return null; // Retorna null si la fecha no es válida
    //         }
    //         return formatDate(fecha.toISOString().slice(0, 16)); // Usa tu función `formatDate`
    //       } catch {
    //         return null;
    //       }
    //     case 'datetime-local':
    //       try {
    //         const fechaHora = new Date(valor);
    //         if (isNaN(fechaHora)) {
    //           return null; // Retorna null si no es válida
    //         }
    //         return fechaHora.toISOString();
    //       } catch {
    //         return null;
    //       }
    //     case 'select':
    //       return columna.options?.find(opt => opt.value.toString() === valor)?.value ?? valor;
    //     default:
    //       return valor;
    //   }
    // }
    
    function obtenerValorFormateado(input, columna) {
      const valor = input.value.trim();
      
      switch (columna.type) {
        case 'time':
          // If you need to store just the time
          return valor;
        case 'number':
          return Number(valor);
        case 'date':
          try {
            const fecha = new Date(valor);
            if (isNaN(fecha)) {
              return null; // Retorna null si la fecha no es válida
            }
            return formatDate(fecha.toISOString().slice(0, 16)); // Usa tu función `formatDate`
          } catch {
            return null;
          }
        case 'datetime-local':
          return new Date(valor).toISOString();
        case 'select':
          return columna.options?.find(opt => opt.value.toString() === valor)?.value ?? valor;
        default:
          return valor;
      }
    }
  
    function obtenerValorMostrado(valor, columna) {
      if (valor === null || valor === undefined) return '';
  
      switch (columna.type) {
        case 'time':
                // Display time in local format
                return valor.substring(0, 5); // Show HH:mm
        case 'date':
          return formatDate(new Date(valor).toISOString().slice(0, 16));//new Date(valor).toISOString().slice(0, 16)//.toLocaleDateString(columna.format?.locale || 'es-ES');
        case 'datetime-local':
          return new Date(valor).toLocaleString(columna.format?.locale || 'es-ES');
        case 'number':
          return columna.format 
            ? new Intl.NumberFormat(columna.format.locale || 'es-ES', columna.format).format(valor)
            : valor.toString();
        case 'select':
          return columna.options?.find(opt => opt.value === valor)?.label ?? valor;
        default:
          return valor;
      }
    }
    function formatDate(valor) {
        const date = new Date(valor);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Añade ceros al mes si es necesario
        const day = String(date.getDate()).padStart(2, '0'); // Añade ceros al día si es necesario
        return `${year}-${month}-${day}`;
    }
    
    // Ejemplo
    console.log(formatDate("2025-01-07T12:34:56Z")); // Output: 2025-01-07
    
    async function actualizarObjeto(nuevosValores) {

      Object.assign(obj_elemento, nuevosValores);
      console.log(nuevosValores);
      console.log(obj_elementoc);
      console.log(obj_elemento);
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
      
      console.log(originalValues);
      celdas.forEach((celda, index) => {
        const columna = columnas.find(col => col.index === index);
        if (columna?.editable) {
          celda.textContent = originalValues[index] || '';
        }
      });
      boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
      limpiarEventos();
    }
  
    function limpiarEventos() {
      celdas.forEach((celda) => {
        const input = celda.querySelector("input, select, textarea");
        if (input) {
          const nuevosEventos = input.cloneNode(true);
          input.parentNode.replaceChild(nuevosEventos, input);
        }
      });
    }
  
    async function manejarEventosTeclado(event, columna) {
      const input = event.target;
      if (!input) return;
  
      if (event.key === "Escape") {
        event.preventDefault();
        cancelarEdicion();
      }
    }
  
    function objetosSonIguales(obj1, obj2) {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    }
  }