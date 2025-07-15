import { solicitudPDF } from "./Solicitudes.js";

/**
 * Oculta un elemento y muestra otro elemento
 * @param {HTMLElement} contenidoActual - Elemento a ocultar
 * @param {HTMLElement} contenidoNuevo - Elemento a mostrar
 */
export const cambiarVista = (contenidoActual = document, contenidoNuevo = document) => {
    const elementoOcultar = contenidoActual;
    const elementoMostrar = contenidoNuevo;

    elementoOcultar.classList.add('ocultar-animacion');
    elementoOcultar.classList.remove('d-block');
    elementoOcultar.classList.add('d-none');

    elementoMostrar.classList.remove('d-none');
    elementoMostrar.classList.add('d-block');
    elementoMostrar.classList.add('mostrar-animacion');

    setTimeout(() => {
        elementoOcultar.classList.remove('ocultar-animacion');
        elementoMostrar.classList.remove('mostrar-animacion');
    }, 1000);
}

/**
 * Crea una instancia del elemento para la etiqueta especificada.
 * @param {string} elemento - Nombre de etiqueta
 * @param {Object.<string, string>} [atributos] - Atributos para la etiqueta
 * @param {Array.<(string|Node)>} [hijos] - Arreglo de Nodos hijo
 * @returns
 */
export const crearElemento = (elemento, atributos = null, hijos = null) => {
    const newElement = document.createElement(elemento);
    if (atributos) {
        for (const key in atributos) {
            newElement.setAttribute(key.toString(), atributos[key]);
        }
    }
    if (hijos) {
        newElement.append(...hijos);
    }
    return newElement;
}

/**
 * Crea un botton con el texto "Nuevo registro"
 * @param {Function} vista - Funcion que se ejecutará al hacer click en el boton
 * @returns 
 */
export const btnNuevoRegistro = (vista) => {
    const icono = crearElemento("i", { class: "bi bi-plus-lg" });
    const btn = crearElemento("button", { class: "btn btn-primary" }, [icono, " Nuevo registro"]);

    btn.addEventListener("click", vista);

    return btn;
}

/**
 * Agrega botones en una fila dentro de en elemento "div"
 * @param {Node[]} botones - Un arreglo de nodos
 * @returns 
 */
export const opciones = (botones) => {
    const div = crearElemento("div", { class: "row pb-2 g-1" });

    botones.forEach(boton => {
        div.append(crearElemento("div", { class: "col col-auto" }, [boton]));
    });

    return div;
}

/**
 * Crear un elemento con un boton y el titulo de la vista.
 * @param {string} textoBtn - Texto para el boton.
 * @param {string} nombre - Titulo.
 * @param {Function} accion - Funcion que se ejecuta al hacer click al boton.
 * @param {string} [colorBtn] - Clase para el boton.
 * @returns 
 */
export const encabezadoVista = (textoBtn, nombre, accion, colorBtn = "btn-warning", datoInformacion = undefined) => {
    const iconoR = crearElemento("i", {class: "bi bi-chevron-left"});
    const btnRegresar = crearElemento("btn", {class: `btn ${colorBtn} btn-sm`}, [iconoR, ` ${textoBtn}`]);
    const titulo = crearElemento("h5", {class: "text-primary-emphasis text-nowrap fst-italic text-center mt-2 mt-md-0 mb-1"}, [nombre]);
    const separador = crearElemento("hr", {class: "mt-0"});
    btnRegresar.addEventListener("click", () => {
        accion();
    }); 

    if (datoInformacion) {
        const informacion = crearElemento("div", {class: ""}, [btnRegresar, titulo, datoInformacion, separador]);
        return informacion;
    } else {
        const informacion = crearElemento("div", {class: ""}, [btnRegresar, titulo, separador]);
        return informacion;
    }

}

export const BuscarEnTabla = (tabla, input) => {
    const tableBody = tabla.tBodies[0];
    let rows = Array.from(tableBody.rows);
    let rowContents = rows.map(row => Array.from(row.cells).map(cell => cell.textContent.toLowerCase()).join(' '));

    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const buscaTabla = () => {
        OcultarBtnPdf(input);
        const texto = input.value.toLowerCase();
        rows.forEach((row, index) => {
            row.style.display = rowContents[index].includes(texto) ? '' : 'none';
        });
    };

    const actualizarFilas = debounce(() => {
        rows = Array.from(tableBody.rows);
        rowContents = rows.map(row => Array.from(row.cells).map(cell => cell.textContent.toLowerCase()).join(' '));
        input.value = '';
        OcultarBtnPdf(input);
        // buscaTabla(); // Para aplicar el filtro actual a las nuevas filas
    }, 100);

    const observer = new MutationObserver(actualizarFilas);
    observer.observe(tableBody, { childList: true, subtree: true });

    input.addEventListener('keyup', debounce(buscaTabla, 500));
};

export const OcultarBtnPdf = (input) => {
    const cardBody = input.closest(".card-body");

    const elementos = cardBody.querySelectorAll('[data-btn-vp]');

    const elementosVisibles = Array.from(elementos).filter(elemento => {
        const estilo = window.getComputedStyle(elemento);
        const estaVisible = (
            estilo.display !== "none" &&
            // estilo.visibility !== "hidden" &&
            elemento.offsetWidth > 0 &&
            elemento.offsetHeight > 0
        );
        const tieneValorCorrecto = elemento.getAttribute('data-btn-vp') === "btn_vista_previa";
        
        return estaVisible && tieneValorCorrecto;
    });

    if (elementosVisibles.length > 0) {
        for (const elemento of elementosVisibles) {
            if (input.value.trim() === '') {
                elemento.style.visibility = 'visible';
            } else {
                elemento.style.visibility = 'hidden';
            }
        }
    }
}

export const SpinnerRow = (tbody) => {
    const spinner = crearElemento("div", {class: "spinner-border spinner-border-sm text-primary", role: "status"});
    const texto = crearElemento("span", {role:"status", class:"ms-1"}, ["Cargando..."]);
    const div = crearElemento("div", {class: "d-flex align-items-center justify-content-center fw-bold"}, [spinner, texto]);
    const td = crearElemento("td", {colspan: "100%", class: "text-center"}, [div]);
    const row = crearElemento("tr", undefined, [td]);
    tbody.replaceChildren(row);
}

export const ErrorTabla = (tbody) => {
    const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["Error al cargar los datos"]);
    const tr = crearElemento("tr", undefined, [td]);
    tbody.replaceChildren(tr);
}

export const InputBusqueda = (tabla, extra = undefined) => {
    const icono = crearElemento("i", {class: "bi bi-search"});
    const span = crearElemento("span", {class: "input-group-text bg-white border-0 pe-0 text-body-tertiary",  style: "font-size: 0.75rem;"}, [icono]);
    const inputBuscar = crearElemento("input", {class: "form-control border-0 shadow-none", placeholder: "buscar..."});
    const divGroup = crearElemento("div", {class: "input-group input-group-sm border rounded-1 ", style: "max-width: 180px;"}, [span, inputBuscar]);
    BuscarEnTabla (tabla, inputBuscar);
    
    span.addEventListener("click", () => {
        inputBuscar.focus();
    });
    inputBuscar.addEventListener("focus", () => {
        divGroup.classList.add("border-primary-subtle","shadow-af-primary");
    });
    inputBuscar.addEventListener("blur", () => {
        divGroup.classList.remove("border-primary-subtle","shadow-af-primary");
    });
    let input;
    if (extra?.fila) {
        const alineado = extra?.alineado == "fin" ? "end" : (extra?.alineado == "medio" ? "center" : "start");
        input = crearElemento("div", {class: `mb-2 d-flex justify-content-${alineado}`}, [divGroup]);
    } else {
        input = divGroup
    }

    return input;
}

export const pdfYBusqueda = (tabla, pdf, estiloBtn = null) => {
    const icono = crearElemento("i", {class: "bi bi-file-earmark-pdf-fill"});
    const btnPDF = crearElemento("button", {class: "btn btn-sm btn-info px-3 me-2", "data-btn-vp": "btn_vista_previa" }, [icono, " Vista previa"]);
    if (estiloBtn) {
        btnPDF.setAttribute("class", estiloBtn.btn);
        btnPDF.replaceChildren(icono, estiloBtn.texto);
    }
    const inputBuscar = InputBusqueda(tabla);
    const contenedor = crearElemento("div", {class: "mb-2 d-flex justify-content-between"}, [btnPDF, inputBuscar]);
    
    pdf(btnPDF);

    return contenedor;
}


/**
 * Convierte una fecha en formato "YYYY-MM-DD" a "DD/MM/YYYY".
 * @param {string} fecha - Fecha en formato "YYYY-MM-DD".
 * @returns {string} Fecha en formato "DD/MM/YYYY".
 */
export const FormatoDate = (fecha) => {
    if (!fecha) {
        return "-";
    }
    const partesFecha = fecha?.split('-');
    if (!partesFecha || partesFecha.length !== 3) {
        return fecha;
    } else {
        const fechaFormateada = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;
        return fechaFormateada;
    }
}

/**
 * Convierte una fecha en formato "YYYY-MM-DD HH:MM:SS" a "DD/MM/YYYY HH:MM:SS".
 * @param {string} fecha - Fecha en formato "YYYY-MM-DD HH:MM:SS".
 * @returns {string} Fecha en formato "DD/MM/YYYY HH:MM:SS".
 */
export const FormatoDateTime = (fecha) => {
    if (!fecha) {
        return "-";
    }
    const fechaHora = fecha.split(' ');
    const partesFecha = fechaHora[0].split('-');
    
    if (!partesFecha || partesFecha.length !== 3 || fechaHora.length !== 2) {
        return fecha;
    } else {
        const [anio, mes, dia] = partesFecha;
        const fechaFormateada = `${dia}/${mes}/${anio}`;
        return `${fechaFormateada} ${fechaHora[1]}`;
    }

}

/**
 * Convierte un número en formato "1000.00" a "1,000.00".
 * @param {number} numero - Número en formato "1000.00".
 * @returns {string} - Número en formato "1,000.00".
 */
export const FormatoEnUs = (numero) => {
    if (numero) {
        return parseFloat(numero).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    } else {
        return "0.00";
    }
}

// Funciones para el menú y targetas 
export function ocultarElemento(elemento) {
    elemento.classList.add('ocultar-animacion');
    elemento.classList.remove('d-block');
    elemento.classList.add('d-none');

    // Eliminar las clases de animación después de un tiempo
    setTimeout(() => {
        elemento.classList.remove('ocultar-animacion');
    }, 500); // Ajusta el tiempo según la duración de tu animación en CSS
}
export function mostrarElemento(elemento) {
    elemento.classList.remove('d-none');
    elemento.classList.add('d-block');
    elemento.classList.add('mostrar-animacion');

    // Eliminar las clases de animación después de un tiempo
    setTimeout(() => {
        elemento.classList.remove('mostrar-animacion');
    }, 500); // Ajusta el tiempo según la duración de tu animación en CSS
}

