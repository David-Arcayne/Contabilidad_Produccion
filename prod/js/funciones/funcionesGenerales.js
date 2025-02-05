
export function generarCabeceraHTML(datos) {
    //const tableHeader = datos.tableHeader;
    const columns = datos;

    // Generar la fila de encabezado (thead)
    let theadHTML = '<tr class="text-center">';
    columns.forEach(column => {
        theadHTML += `<th class="text-center">${column}</th>`;
    });
    theadHTML += '</tr>';

    return theadHTML;
}

export function validarUsuario() {
    const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'));
    if (contenidousuario) {
        return contenidousuario;
    } else {
        alert("Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.");
        console.log('Los elementos no existen en localStorage');
        localStorage.clear();
        window.location.assign('../../vapp/');
    }
}

export function redondear(num) {
    if (typeof num != 'number') {
        return null;
    }
    let signo = num >= 0 ? 1 : -1;

    return parseFloat((Math.round((num * Math.pow(10, 2)) + (signo * 0.0001)) / Math.pow(10, 2)).toFixed(2));
}

export function decimas(saldo){
    var saldocondecimas = parseFloat((saldo)).toFixed(2);
    return saldocondecimas;
}

export function validarNumerosEnteros(input) {
    // Reemplaza todo lo que no sea un número del 0 al 9 con una cadena vacía
    input.value = input.value.replace(/[^0-9]/g, '');
}

export function validarNumeros(input) {
    // Reemplaza todo lo que no sea un número o punto con una cadena vacía
    input.value = input.value.replace(/[^0-9.]/g, '');

    // Asegúrate de que solo haya un punto decimal permitido
    if (input.value.split('.').length > 2) {
        input.value = input.value.slice(0, -1);
    }
}

export function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

export function crearOpcionesAlmacen(options, input, optionClassName, mostrarVariableCallback) {
    const customOptions = input.nextElementSibling;

    options.forEach(option => {
        const optionElement = document.createElement('a');
        optionElement.className = optionClassName;
        optionElement.textContent = option.nombre;
        optionElement.setAttribute('data-value', option.idalmacen);

        optionElement.addEventListener('click', () => {
            input.value = option.nombre;
            customOptions.style.display = 'none';
            mostrarVariableCallback(optionElement.getAttribute('data-value'));
        });

        customOptions.appendChild(optionElement);
    });
}

export function crearOpcionesUsuario(options, input, optionClassName, mostrarVariableCallback) {
    const customOptions = input.nextElementSibling;

    options.forEach(option => {
        const optionElement = document.createElement('a');
        optionElement.className = optionClassName;
        optionElement.textContent = option.usuario;
        optionElement.setAttribute('data-value', option.id);

        optionElement.addEventListener('click', () => {
            input.value = option.usuario;
            customOptions.style.display = 'none';
            mostrarVariableCallback(optionElement.getAttribute('data-value'));
        });

        customOptions.appendChild(optionElement);
    });
}

export function obtenerFechaActual() {
    // Obtener todos los input de tipo date
    let inputsDate = document.querySelectorAll('input[type="date"]');

    let fechaHoraActual = new Date();
    let fechaFormateada = fechaHoraActual.toISOString().split('T')[0];
    let horaFormateada = fechaHoraActual.toTimeString().split(' ')[0];

    inputsDate.forEach(function(input) {
        input.value = fechaFormateada;
        console.log(horaFormateada)
    });
}