import { cargarFormulario } from "../targetas/cargarFormularios.js";
import { crearTargetas } from "../targetas/cargartemplate.js";

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
 * @param {string} [texto] - Texto para el boton
 * @param {string} [icono_b] - Icono para el boton
 * @param {string} [color] - Clase para el boton
 * @returns 
 */
export const btnNuevoRegistro = (vista, texto = "Nuevo registro", icono_b = "plus-lg", color = "primary") => {
    const icono = crearElemento("i", { class: `bi bi-${icono_b} pe-1` });
    const btn = crearElemento("button", { class: `btn btn-${color}` }, [icono, ` ${texto}`]);

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
 * @param {Node} [datoInformacion] - Informacion adicional.
 * @returns 
 */
export const encabezadoVista = (textoBtn, nombre, accion, colorBtn = "btn-success", datoInformacion = undefined) => {
    const iconoR = crearElemento("i", {class: "bi bi-chevron-left"});
    const btnRegresar = crearElemento("btn", {class: `btn ${colorBtn} btn-sm`}, [iconoR, ` ${textoBtn}`]);
    const titulo = crearElemento("h5", {class: "text-primary-emphasis text-nowrap text-center mt-2 mt-md-0 mb-1"}, [nombre]);
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

/**
 * Función para realizar la busqueda en una tabla.
 * @param {HTMLTableElement} tabla - Tabla en la que se realizará la busqueda.
 * @param {HTMLInputElement} input - Input para realizar la busqueda.
 */
export const BuscarEnTabla = (tabla, input) => {
    const tableBody = tabla.tBodies[0];
    let rows = Array.from(tableBody.rows);
    let rowContents = rows.map(row => Array.from(row.cells).map(cell => cell.textContent.toLowerCase()).join(' '));

    // Función para evitar que la busqueda se realice en cada tecla presionada
    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Función para buscar en la tabla
    const buscaTabla = () => {
        const texto = input.value.toLowerCase();
        rows.forEach((row, index) => {
            row.style.display = rowContents[index].includes(texto) ? '' : 'none';
        });
    };

    // Función para actualizar las filas de la tabla
    const actualizarFilas = debounce(() => {
        rows = Array.from(tableBody.rows);
        rowContents = rows.map(row => Array.from(row.cells).map(cell => cell.textContent.toLowerCase()).join(' '));
        input.value = '';
        // buscaTabla(); // Para aplicar el filtro actual a las nuevas filas
    }, 100);

    // Observador para detectar cambios en la tabla
    const observer = new MutationObserver(actualizarFilas);
    observer.observe(tableBody, { childList: true, subtree: true });

    input.addEventListener('keyup', debounce(buscaTabla, 500));
};

/**
 * Función para realizar la busqueda en una tabla.
 * @param {HTMLTableElement} tabla - Tabla en la que se realizará la busqueda.
 * @param {HTMLInputElement} input - Input para realizar la busqueda.
 */
export const BuscarEnTablaOpts = (tabla, input, opciones = {}) => {
    const { colBusqueda = [], colSumar = [], colTotal = [] } = opciones; // Parámetros opcionales
    const tableBody = tabla.tBodies[0];
    let rows = Array.from(tableBody.rows);
    let rowContents = new Map();

    // Indexar filas iniciales considerando solo las columnas especificadas
    const indexarFilas = () => {
        rowContents.clear();
        rows.forEach((row, index) => {
            const content = colBusqueda.length > 0
                ? colBusqueda.map(colIndex => row.cells[colIndex]?.textContent.toLowerCase() || '').join(' ')
                : Array.from(row.cells).map(cell => cell.textContent.toLowerCase()).join(' '); // Si no hay columnas específicas, usar todas
            rowContents.set(index, content);
        });
    };

    // Debounce para evitar búsquedas en cada pulsación
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Función para buscar en la tabla
    const buscaTabla = () => {
        const texto = input.value.toLowerCase();
        let sumas = new Array(colSumar.length).fill(0); // Array para almacenar sumas de las columnas

        rowContents.forEach((content, index) => {
            const row = rows[index];
            const match = content.includes(texto);
            row.style.display = match ? '' : 'none';

            // Si la fila coincide, calcular las sumas
            if (match && colSumar.length > 0) {
                colSumar.forEach((colIndex, sumaIndex) => {
                    const valor = (row.cells[colIndex]?.textContent || "0");
                    const valorR = parseFloat(valor.replace(",", ""));
                    if (!isNaN(valorR)) sumas[sumaIndex] += valorR;
                });
            }
        });

        // Mostrar las sumas en la fila de totales, si existe
        if (colSumar.length > 0) {
            const filaTotales = tableBody.querySelector('.totales'); // Clase para identificar fila de totales
            if (filaTotales) {
                filaTotales.removeAttribute('style'); // Mostrar la fila
                colTotal.forEach((colIndex, sumaIndex) => {
                    filaTotales.cells[colIndex].textContent = FormatoEnUs(sumas[sumaIndex]); // Actualizar la celda
                });
            }
        }
    };

    // Observador para actualizar el índice de filas
    const actualizarFilas = debounce(() => {
        rows = Array.from(tableBody.rows);
        indexarFilas();
    }, 100);

    // Inicializar índice de filas
    indexarFilas();

    // Observador para detectar cambios en la tabla
    const observer = new MutationObserver(actualizarFilas);
    observer.observe(tableBody, { childList: true, subtree: true });

    // Evento para buscar en la tabla
    input.addEventListener('input', debounce(buscaTabla, 300));
};

/**
 * Crea una fila con un spinner para mostrar mientras se cargan los datos.
 * @param {HTMLTableSectionElement} tbody - Cuerpo de la tabla.
 */
export const SpinnerRow = (tbody) => {
    const spinner = crearElemento("div", {class: "spinner-border spinner-border-sm text-primary", role: "status"});
    const texto = crearElemento("span", {role:"status", class:"ms-1"}, ["Cargando..."]);
    const div = crearElemento("div", {class: "d-flex align-items-center justify-content-center fw-bold"}, [spinner, texto]);
    const td = crearElemento("td", {colspan: "100%", class: "text-center"}, [div]);
    const row = crearElemento("tr", undefined, [td]);
    tbody.replaceChildren(row);
}

/**
 * Crea una fila con un mensaje de error.
 * @param {HTMLTableSectionElement} tbody - Cuerpo de la tabla.
 */
export const ErrorTabla = (tbody) => {
    const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["Error al cargar los datos"]);
    const tr = crearElemento("tr", undefined, [td]);
    tbody.replaceChildren(tr);
}

/**
 * Crea un input para realizar busquedas en una tabla.
 * @param {HTMLTableElement} tabla - Tabla en la que se realizará la busqueda.
 * @param {Object} [extra] - Opciones adicionales.
 * @param {string} [extra.fila] - Si se desea que el input se muestre en un "div" para tener una determinada alineación.
 * @param {string} [extra.alineado] - Alineación del input ("inicio", "medio", "fin").
 * @returns
 */
export const InputBusqueda = (tabla, extra = undefined) => {
    const icono = crearElemento("i", {class: "bi bi-search"});
    const span = crearElemento("span", {class: "input-group-text bg-white border-0 pe-0 text-body-tertiary",  style: "font-size: 0.75rem;"}, [icono]);
    const inputBuscar = crearElemento("input", {class: "form-control border-0 shadow-none", placeholder: "buscar..."});
    const divGroup = crearElemento("div", {class: "input-group input-group-sm border rounded-1 ", style: "max-width: 180px;"}, [span, inputBuscar]);
    BuscarEnTabla(tabla, inputBuscar);
    
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

/**
 * Crea un input para realizar busquedas en una tabla.
 * @param {HTMLTableElement} tabla - Tabla en la que se realizará la busqueda.
 * @param {Object} [extra] - Opciones adicionales.
 * @param {string} [extra.fila] - Si se desea que el input se muestre en un "div" para tener una determinada alineación.
 * @param {string} [extra.alineado] - Alineación del input ("inicio", "medio", "fin").
 * @returns
 */
export const InputBusquedaPlus = (tabla, extra = undefined, opciones = {}) => {
    const icono = crearElemento("i", {class: "bi bi-search"});
    const span = crearElemento("span", {class: "input-group-text bg-white border-0 pe-0 text-body-tertiary", style: "font-size: 0.75rem;"}, [icono]);
    const inputBuscar = crearElemento("input", {class: "form-control border-0 shadow-none", placeholder: "buscar..."});
    const divGroup = crearElemento("div", {class: "input-group input-group-sm border rounded-1 ", style: "max-width: 180px;"}, [span, inputBuscar]);
    BuscarEnTablaOpts(tabla, inputBuscar, opciones);
    
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

/**
 * Crea un boton para PDF y un input para realizar busquedas en una tabla.
 * @param {HTMLTableElement} tabla - Tabla en la que se realizará la busqueda.
 * @param {Function} pdf - Funcion que se ejecutará al hacer click en el boton PDF.
 * @param {Object} [estiloBtn] - Datos para el boton PDF.
 * @param {string} [estiloBtn.btn] - Clase para el boton PDF.
 * @param {string} [estiloBtn.texto] - Texto para el boton PDF.
 * @retruns
 */
export const pdfYBusqueda = (tabla, pdf, estiloBtn = null) => {
    const icono = crearElemento("i", {class: "bi bi-file-earmark-pdf-fill"});
    const btnPDF = crearElemento("button", {class: "btn btn-sm btn-danger px-3 me-2"}, [icono, " PDF"]);
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
 * Función para descargar un archivo PDF a partir de un contenido HTML.
 * @param {string} nombre - Nombre del archivo PDF.
 * @param {HTMLElement} contenido - Contenido HTML a convertir en PDF.
 */
export const Html2pdfDescargar = async (nombre, contenido) => {
    // contenido.style.fontSize = "11px"; 

    const opciones = {
        margin: 0.5,
        filename: `${nombre}${Math.floor(Math.random() * (999 - 100 + 1) + 100)}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            // dpi: 192,
            letterRendering: true,
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    await html2pdf().from(contenido).set(opciones).save();
}

export const exportarAXlsx = (datos, nombreDescarga, nombreHoja = "Hoja 1", columnas = null) => {
    // 1. Crear un libro de trabajo (workbook) y una hoja (worksheet)
    const wb = XLSX.utils.book_new();
    
    
    const ws = XLSX.utils.aoa_to_sheet(datos);

    if (columnas) {
        ws['!cols'] = columnas;
    }
    // ws['!cols'] = [
    //     { wpx: 150 }, // Ancho en píxeles para la columna 1
    //     { wpx: 200 }, // Ancho en píxeles para la columna 2
    //     { wpx: 100 }  // Ancho en píxeles para la columna 3
    // ];

    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    XLSX.writeFile(wb, `${nombreDescarga}.xlsx`);
}

/**
 * Convierte una fecha en formato "YYYY-MM-DD" a "DD/MM/YYYY".
 * @param {string} fecha - Fecha en formato "YYYY-MM-DD".
 * @returns {string} Fecha en formato "DD/MM/YYYY".
 */
export const FormatoDate = (fecha) => {
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

/**
 * Busca un menú en el localStorage.
 * @param {string} codigo - Código del menú a buscar.
 * @returns {Object} Menú encontrado.
 */
export const BuscarMenu = (codigo) => {
    const menuyofinanciero = JSON.parse(localStorage.getItem('yofinancieromenu'));
    const menu = menuyofinanciero[0].menu;
    for (const item of menu) {
        for (const submenu of item.submenu) {
            if (submenu.codigo.split("-")[0] === codigo) {
                return submenu;
            }
        }
    }

    return null;
}

/**
 * Abre una ventana según el código.
 * @param {string} codigo - Código de la ventana.
 * @returns {Object} Menú encontrado.
 */
export const AbrirUnMenu = (codigo) => {
    const menu = BuscarMenu(codigo);
    if (menu) {
        const vista = cargarFormulario(menu.codigo, menu.permiso);
        if (vista) {
            crearTargetas (vista, menu.titulo, menu.codigo);
            return menu;
        }
    }
    return null;
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

