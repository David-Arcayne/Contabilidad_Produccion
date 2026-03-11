import { cargarFormulario } from "../targetas/cargarFormularios.js";
import { crearTargetas } from "../targetas/cargartemplate.js";
import { alertaDeError, alertaDeExito } from "./Alertas.js";
import { campoInput, campoSelect, manejarSelect } from "./CrearFormulario.js";
import { CT_URLAPI, CT_URLARCHIVOS, getEmpresaId, getMenuPrincipal, getUsuarioId } from "./DatosAuxiliares.js";
import { modalDeConfirmacion, modalDeInformacion, modalImagen, modalRemovible } from "./Modals.js";
import { manejarSolicitudEliminacion, obtenerDatos, reiniciarFormulario } from "./Solicitudes.js";
import { crearBotonReportePdfMake } from "./VistaPDF.js";

/**
 * Oculta un elemento y muestra otro elemento
 * @param {HTMLElement} contenidoActual - Elemento a ocultar
 * @param {HTMLElement} contenidoNuevo - Elemento a mostrar
 */
export const cambiarVista = (contenidoActual = document, contenidoNuevo = document) => {
    const elementoOcultar = contenidoActual;
    const elementoMostrar = contenidoNuevo;

    elementoOcultar.classList.add("ocultar-animacion");
    elementoOcultar.classList.remove("d-block");
    elementoOcultar.classList.add("d-none");

    elementoMostrar.classList.remove("d-none");
    elementoMostrar.classList.remove("d-block");
    elementoMostrar.classList.add("mostrar-animacion");

    setTimeout(() => {
        elementoOcultar.classList.remove("ocultar-animacion");
        elementoMostrar.classList.remove("mostrar-animacion");
    }, 1000);
}

export const cambiarVistaMenu = (contenidoActual = document, contenidoNuevo = document) => {
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
 * Función: Crea una instancia del elemento para la etiqueta especificada.
 * Descripción: Esta función crea un nuevo elemento HTML con los atributos y nodos hijo especificados.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea una instancia del elemento para la etiqueta especificada.
 * @param {string} elemento - Nombre de etiqueta
 * @param {Object<string, string>} [atributos] - Atributos para la etiqueta
 * @param {Array.<(string|Node)>} [hijos] - Arreglo de Nodos hijo
 * @returns {HTMLElement} Instancia del elemento creado
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
 * Función: Crea un boton básico con las opciones especificadas.
 * Descripción: Esta función crea un boton con su respectivo icono, titulo y callback que se ejecuta al hacer click.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Botón creado con opciones básicas.
 * @param {OpcionesElementoBoton} opciones - Opciones para crear el boton.
 */
export function elementoBoton(opciones) {
    const {id, color, icono ,titulo, texto, callback, ajustarTexto=false} = opciones;
    const iconoElemento = crearElemento("i", { class: `bi bi-${icono} ${texto ? "pe-1" : ""}`});
    const boton = crearElemento("button", {  type:"button", class: `btn btn-${color ?? "primary"} ${ajustarTexto ? "text-wrap" : "text-nowrap"}` }, [iconoElemento]);
    if (texto) boton.append(texto);
    if (id) boton.dataset.id = id
    if (titulo) boton.title = titulo;
    if (callback) {
        boton.addEventListener("click", async (e) => {
            e.preventDefault();
            boton.disabled = true;
            await callback();
            boton.disabled = false;
        });
    }
    return boton;
}

/**
 * Función: Crea una elemento "div" con opciones en linea
 * Descripción: Esta función crea un nuevo elemento "div" que contiene botones u otros elementos pasados como parámetros, organizados en una fila.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Elemento "div" con opciones en linea.
 * @param {HTMLElement[]} botones - Arreglo de botones
 * @returns {HTMLDivElement}
 */
export function divOpcionesVista(botones) {
    const div = crearElemento("div", { class: "row pb-2 g-1" });

    botones.forEach(boton => {
        if (boton) {
            div.append(crearElemento("div", { class: "col col-auto" }, [boton]));
        }
    });

    return div;
}

/**
 * Crear una sección de encabezado para una vista.
 * @param {Object} datosEncabezado - Datos para el encabezado.
 * @param {string} datosEncabezado.titulo - Título del encabezado.
 * @param {string} [datosEncabezado.textoInformacion] - Texto adicional de información.
 * @param {Node} [datosEncabezado.elementoAdicional] - Elemento adicional para el encabezado.
 * @param {"center"|"start"| "end"} [datosEncabezado.alinearTitulo] - Alineación del título: "center" (predeterminado).
 * @param {Object} [datosBoton] - Datos para el botón de regresar.
 * @param {string} datosBoton.texto - Texto del botón de regresar.
 * @param {string} datosBoton.color - Color del botón de regresar.
 * @param {Function} datosBoton.callback - Función que se ejecuta al hacer clic en el botón de regresar.
 * @returns {HTMLDivElement}
 */
export function seccionEncabezado(datosEncabezado, datosBoton) {
    const { titulo, textoInformacion, elementoAdicional, alinearTitulo = "center" } = datosEncabezado;
    const divContenido = crearElemento("div");

    // Crear el botón de regresar si se proporcionan los datos
    if (datosBoton) {
        const { texto = "Volver", color = "success", callback } = datosBoton;
        const iconoR = crearElemento("i", {class: "bi bi-chevron-left pe-1"});
        const btnRegresar = crearElemento("button", {class: `btn btn-${color} btn-sm`, type: "button"}, [iconoR, texto]);
        btnRegresar.addEventListener("click", async () => {
            btnRegresar?.classList.add("disabled");
            btnRegresar.innerHTML = contenidoDeCargaBtn(texto);
            await callback?.();
            btnRegresar?.classList.remove("disabled");
            btnRegresar.innerHTML = `${iconoR.outerHTML} ${texto}`;
        });
        divContenido.appendChild(btnRegresar);
    }

    const tituloVista = crearElemento("h5", { class: `text-${alinearTitulo} mt-2 ${(alinearTitulo !== "start" && !datosBoton) ? "mt-md-0" : ""} mb-0 fw-bold` }, [titulo]);
    divContenido.appendChild(tituloVista);

    // Agregar contenido adicional si se proporciona
    if (textoInformacion) {
        const informacion = crearElemento("div", { class: "text-center", style: "font-size: 12px" }, [textoInformacion]);
        divContenido.appendChild(informacion);
    }
    if (elementoAdicional) {
        divContenido.appendChild(elementoAdicional);
    }

    const separador = crearElemento("hr", { class: "mt-1 border-secondary" });
    divContenido.appendChild(separador);
    return divContenido;
}

/**
 * Función para realizar la busqueda en una tabla.
 * @param {HTMLTableElement} tabla - Tabla en la que se realizará la busqueda.
 * @param {HTMLInputElement} input - Input para realizar la busqueda.
 */
export const BuscarEnTabla = (tabla, input) => {
    const tableBody = tabla.tBodies[0];
    let rows = Array.from(tableBody.rows);
    let rowContents = rows.map(row => Array.from(row.cells).map(cell => cell.textContent.toLowerCase()).join(" "));

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
            row.style.display = rowContents[index].includes(texto) ? "" : "none";
        });
    };

    // Función para actualizar las filas de la tabla
    const actualizarFilas = debounce(() => {
        rows = Array.from(tableBody.rows);
        rowContents = rows.map(row => Array.from(row.cells).map(cell => cell.textContent.toLowerCase()).join(" "));
        input.value = "";
        // buscaTabla(); // Para aplicar el filtro actual a las nuevas filas
    }, 100);

    // Observador para detectar cambios en la tabla
    const observer = new MutationObserver(actualizarFilas);
    observer.observe(tableBody, { childList: true, subtree: true });

    input.addEventListener("keyup", debounce(buscaTabla, 500));
};

/**
 * Filtra filas de una tabla con listas anidadas (<ul><li>)
 * y mantiene visibles los elementos padres cuando un hijo coincide.
 * @param {HTMLTableElement} tabla
 * @param {HTMLInputElement} input
 */
export const buscarEnTablaListasConArbol = (tabla, input) => {
    const tbody = tabla.tBodies[0];

    // Debounce
    const debounce = (fn, delay) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    /**
     * Aplica el filtro dentro de un nodo <tr>
     * Ocultando o mostrando <li> según coincidencia
     */
    const filtrarFila = (fila, filtro) => {
        const lis = fila.querySelectorAll("li");

        // Primera recorrido: marcar coincidencias
        lis.forEach(li => {
            const texto = li.textContent.toLowerCase();
            const coincide = texto.includes(filtro);
            li.dataset.matches = coincide ? "true" : "false";
        });

        // Segunda recorrido: mostrar padres si hijos coinciden
        lis.forEach(li => {
            const hijoCoincide =
                li.querySelector("li[data-matches='true']") !== null;

            if (li.dataset.matches === "true" || hijoCoincide) {
                li.style.display = "";
            } else {
                li.style.display = "none";
            }
        });

        // Tercera recorrido: decidir si mostrar/ocultar el <tr>
        const algunVisible = [...lis].some(li => li.style.display !== "none");

        fila.style.display = algunVisible ? "" : "none";
    };

    /**
     * Función principal del filtro
     */
    const filtrarTabla = () => {
        const texto = input.value.toLowerCase().trim();
        const filas = Array.from(tbody.rows);

        // Si está vacío, todo visible
        if (texto === "") {
            filas.forEach(fila => {
                fila.style.display = "";
                fila.querySelectorAll("li").forEach(li => li.style.display = "")
            });
            return;
        }

        filas.forEach(fila => filtrarFila(fila, texto));
    };

    /**
     * Cuando cambie la tabla (nueva info, eliminación, etc),
     * mantiene activo el filtro actual
     */
    const actualizarFilas = debounce(() => {
        input.value = "";
        if (input.value.trim() !== "") filtrarTabla();
    }, 150);

    // Observador del DOM
    const observer = new MutationObserver(actualizarFilas);
    observer.observe(tbody, { childList: true, subtree: true });

    // Evento del input
    input.addEventListener("input", debounce(filtrarTabla, 250));
};

export function buscarEnArrayYCargarTabla(arrayDatos, select, campos, cargarContenidoTabla) {
    let timeout;

    // Función para renderizar los datos filtrados
    const renderTable = (datos) => {
        cargarContenidoTabla(datos); // función para rellenar la tabla
    };

    // Función para filtrar los datos según la opción seleccionada
    const filtrarDatos = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const filtro = select.value.toLowerCase();
            if (!filtro) {
                renderTable(arrayDatos);
                return;
            }
            const datosFiltrados = arrayDatos.filter(item =>
                campos.some(campo => item[campo]?.toLowerCase().includes(filtro))
            );

            renderTable(datosFiltrados);
        }, 300); // Espera 300ms antes de ejecutar la búsqueda
    };
    select.addEventListener("change", filtrarDatos);

    // Crear un objeto para envolver el array y detectar cambios
    const arrayWrapper = {
        datos: arrayDatos,
    };

    // Usar Object.defineProperty para interceptar los accesos y modificaciones al array
    Object.defineProperty(arrayWrapper, "datos", {
        get() {
            return this._datos;
        },
        set(newArray) {
            this._datos = newArray;
            arrayDatos = [...newArray] // Actualizar el valor del array
            filtrarDatos();  // Renderizar la tabla cada vez que el array cambie
        }
    });

    // Inicializar el array con el valor inicial
    arrayWrapper.datos = arrayDatos;

    // Función para actualizar el array de forma segura
    const actualizarArray = (nuevoArray) => {
        arrayWrapper.datos = [...nuevoArray]; // Cambiar el array usando el setter
    };

    // Renderizar todos los datos al inicio
    renderTable(arrayWrapper.datos);

    // Retornar una función para actualizar el array desde fuera
    return actualizarArray;
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
                ? colBusqueda.map(colIndex => row.cells[colIndex]?.textContent.toLowerCase() || "").join(" ")
                : Array.from(row.cells).map(cell => cell.textContent.toLowerCase()).join(" "); // Si no hay columnas específicas, usar todas
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
            row.style.display = match ? "" : "none";

            // Si la fila coincide, calcular las sumas
            if (match && colSumar.length > 0) {
                colSumar.forEach((colIndex, sumaIndex) => {
                    const valor = (row.cells[colIndex]?.textContent || "0");
                    const valorR = parseFloat(valor.replace(/,/g, ""));
                    if (!isNaN(valorR)) sumas[sumaIndex] += valorR;
                });
            }
        });

        // Mostrar las sumas en la fila de totales, si existe
        if (colSumar.length > 0) {
            const filaTotales = tableBody.querySelector(".totales"); // Clase para identificar fila de totales
            if (filaTotales) {
                filaTotales.removeAttribute("style"); // Mostrar la fila
                colTotal.forEach((colIndex, sumaIndex) => {
                    filaTotales.cells[colIndex].textContent = formatoDecimal(sumas[sumaIndex]); // Actualizar la celda
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
    input.addEventListener("input", debounce(buscaTabla, 300));
};

// =========================================================
// FUNCIONES FILTROS Y BUSQUEDAS
// =========================================================

// Función para evitar que la búsqueda se realice en cada tecla presionada.
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Función: Crea un componente buscador reutilizable.
 * Descripción: Esta función genera un componente de búsqueda que incluye un ícono y un campo de entrada.
 *              Permite configurar opciones como el ancho, el texto del placeholder y una función de callback para manejar la entrada del usuario.
 * Fecha: 11 de febrero de 2026
 * Autor: Joel Choque
/**
 * Crea un componente buscador reutilizable.
 * @param {OpcionesBuscador} [opciones] - Opciones para configurar el buscador.
 * @returns {[HTMLLabelElement, HTMLInputElement]} Un array con el contenedor del buscador y el input para la búsqueda.
 */
export function crearBuscador(opciones = {}) {
    const {
        onInput = null,
        placeholder = "buscar...",
        width = "180px",
        clasesExtra = ""
    } = opciones;

    const icono = crearElemento("i", { class: "bi bi-search" });

    const span = crearElemento("span", {
        class: "input-group-text bg-white border-0 pe-0 text-body-tertiary",
        style: "font-size: 0.75rem;"
    }, [icono]);

    const input = crearElemento("input", {
        class: "form-control border-0 shadow-none",
        name: "__buscador",
        style: "font-size: 0.75rem;",
        placeholder
    });

    const contenedor = crearElemento("label", {
        id: "__buscador",
        class: `input-group input-group-sm border rounded-1 ${clasesExtra}`,
        style: `max-width: ${width};`,
    }, [span, input]);

    // Solo agrega listener si se pasa callback
    if (typeof onInput === "function") {
        input.addEventListener("input", e => {
            onInput(e.target.value, e);
        });
    }

    return [contenedor, input];
}

/**
 * Función: Crea los filtros para la tabla de facturas de cobros
 * Descripción: Esta función genera los elementos de filtro para la tabla.
 *              Contiene inputs, botones para limpiar los filtros y para generar un reporte en PDF.
 *              Además, se encarga de conectar estos filtros con el controlador de la tabla para actualizar los datos a mostrar.
 * Fecha: 12 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Crea los filtros para la tabla de facturas de cobros.
 * @param {OpcionesFiltrosTabla} datosFiltro - Objeto con las funciones de callback para cada filtro.
 * @returns {HTMLElement} Contenedor con los filtros para la tabla.
 */
export function crearFiltrosTabla({
    controladorTabla,
    contenedorPrincipal,
    obtenerContenidoReporte,
    botonesReportesPersonalizados,
    configuracionPdfMake,
    filtroBusqueda = true,
    filtroFecha = true,
    filtrosPersonalizados
}) {

    const elementos = {};
    const inputs = [];

    // FILTRO POR FECHA
    if (filtroFecha) {
        const atributosBase = { type: "number", class: "form-control", style: "font-size: 0.75rem;" };
        const crearInputFecha = (placeholder, extra = {}) =>
            crearElemento("input", { ...atributosBase, placeholder, ...extra });

        const inputsFecha = {
            dia: crearInputFecha("Día", { min: 1, max: 31 }),
            mes: crearInputFecha("Mes", { min: 1, max: 12 }),
            anio: crearInputFecha("Año", { min: 1900 })
        };
        const emitirFecha = (e) => {
            if (!e.target.checkValidity()) {
                e.target.reportValidity();
                return;
            }
            const { dia, mes, anio } = inputsFecha;
            const valores = {
                dia: dia.valueAsNumber || null,
                mes: mes.valueAsNumber || null,
                anio: anio.valueAsNumber || null
            };
            // Si no hay año, no aplicar filtro
            if (!((!dia.value || mes.value) && anio.value && anio.checkValidity())) {
                controladorTabla.setFecha({ dia: null, mes: null, anio: null });
                return;
            }

            controladorTabla.setFecha(valores);
        };
        const emitirFechaDebounced = debounce(emitirFecha, 500);
        Object.values(inputsFecha)
            .forEach(input => input.addEventListener("input", emitirFechaDebounced));

        const contenedorFecha = crearElemento(
            "div",
            { class: "input-group input-group-sm", id: "__buscador-fecha" },
            Object.values(inputsFecha)
        );

        elementos.fecha =  crearElemento("div", { class: "col-auto" }, [contenedorFecha]);
        inputs.push(...Object.values(inputsFecha));
    }

    // FILTRO DE BÚSQUEDA
    if (filtroBusqueda) {
        const [contenedorInput, inputBuscar] = crearBuscador({
            onInput: debounce(texto => controladorTabla.setTexto(texto), 500)
        });

        inputs.push(inputBuscar);
        elementos.buscador = crearElemento("div", { class: "col-auto" }, [contenedorInput]);
    }

    // BOTÓN LIMPIAR
    if (inputs.length > 1 || filtrosPersonalizados) {

        const btnLimpiar = crearElemento("button", {
            class: "btn btn-primary btn-sm h-100",
            id: "__recargar",
            title: "Limpiar filtros"
        }, [
            crearElemento("i", { class: "bi bi-arrow-clockwise" })
        ]);

        btnLimpiar.addEventListener("click", controladorTabla.limpiarFiltros);

        elementos.limpiar = crearElemento("div", { class: "col-auto" }, [btnLimpiar]);
    }

    // BOTÓN REPORTE
    if (contenedorPrincipal && obtenerContenidoReporte) {
        const botonReporte = crearBotonReportePdfMake({
            contenedorModal: contenedorPrincipal,
            obtenerContenido: obtenerContenidoReporte,
            configuracionPdfMake,
        });

        elementos.reporte = crearElemento("div", { class: "col-auto" }, [botonReporte]);
    }
    if (botonesReportesPersonalizados) {
        const botones = [];
        for (const boton of botonesReportesPersonalizados) {
            botones.push(crearElemento("div", { class: "col-auto" }, [boton]));
        }
        elementos.botones = botones
    }

    // BOTONES DE FILTROS PERSONALIZADOS


    const elementosOrdenados = [];
    // FILTROS PERSONALIZADOS
    if (filtrosPersonalizados) {
        const { limpiar, elementosFiltro} = filtrosPersonalizados;

        if (elementos.reporte) {
            elementosOrdenados.push(elementos.reporte);
        }
        elementos.botones?.forEach(btn => {
            elementosOrdenados.push(btn)
        });
        elementosOrdenados.push(elementos.limpiar, elementos.fecha);
        elementosFiltro?.forEach(el => {
            elementosOrdenados.push(el.contenedor);
        });
        elementosOrdenados.push(elementos.buscador);

        controladorTabla.setReferenciasInput({
            referencias: inputs,
            limpiarFiltros: limpiar,
        });
    } else {
        if (elementos.reporte) {
            elementosOrdenados.push(elementos.reporte);
        }
        elementos.botones?.forEach(btn => {
            elementosOrdenados.push(btn)
        });
        elementosOrdenados.push(elementos.limpiar, elementos.fecha, elementos.buscador);

        controladorTabla.setReferenciasInput({
            referencias: inputs,
        });
    }

    return crearElemento(
        "div",
        { class: "row d-flex justify-content-end m-0 pb-2 g-2" },
        elementosOrdenados.filter(Boolean)
    );
}

/**
 * Función: Crea un gestor de tabla para manejar datos originales, filtrados y notificar a los suscriptores.
 * Descripción: Esta función devuelve un objeto que permite establecer los datos originales, aplicar filtros de texto y fecha, limpiar los filtros, suscribirse a cambios en los datos filtrados y obtener los registros filtrados.
 * Fecha: 11 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Crea un gestor de tabla para manejar datos originales, filtrados y notificar a los suscriptores.
 */
export function crearGestorTabla() {
    let dataInicial = [];
    let dataFiltrada = [];
    const filtros = {
        texto: "",
        fecha: { dia: null, mes: null, anio: null }
    };
    let listeners = new Map();

    let referencias;
    let otrosFiltros;
    let limpiarOtrosFiltros;


    const notificar = () => {
        listeners.forEach(fn => fn(dataFiltrada));
    }

    const aplicarFiltros = () => {
        if (!dataInicial){
            dataFiltrada = null;
            notificar();
            return;
        }

        const { texto, fecha } = filtros;
        const { dia, mes, anio } = fecha;

        if (!texto && !dia && !mes && !anio && !otrosFiltros) {
            dataFiltrada = dataInicial;
            notificar();
            return;
        }

        dataFiltrada = dataInicial.filter( item => {
            if (texto && !item.textoBusqueda.includes(texto)) return false;
            if (anio && item.fechaBusqueda.anio !== anio) return false;
            if (mes && item.fechaBusqueda.mes !== mes) return false;
            if (dia && item.fechaBusqueda.dia !== dia) return false;

            // Si hay otros filtros personalizados, aplicarlos
            if (otrosFiltros && typeof otrosFiltros === "function") {
                if (!otrosFiltros(item)) {
                    return false;
                }
            }

            return true;
        });

        notificar();
    };

    const reiniciarFiltros = () => {
        filtros.texto = "";
        filtros.fecha = { dia: null, mes: null, anio: null };
        otrosFiltros = null;
        referencias?.forEach(ref => {
            ref.value ? ref.value = "" : null;
        });
        limpiarOtrosFiltros?.();
    };

    return {
        /**
         * Función para establecer los datos iniciales de la tabla.
         * @param {RegistroGestorTabla[]} lista - Arreglo con los registros iniciales.
         */
        setDatosRegistro(lista) {
            dataInicial = lista;
            reiniciarFiltros();
            aplicarFiltros();
        },
        /**
         * Función para establecer las referencias de los inputs y sus respectivas funciones de filtros personalizados.
         * @param {{referencias: HTMLInputElement[], limpiarFiltros?: Function}} elementos - Objeto con las referencias de los registros y funciones de filtros personalizados.
         */
        setReferenciasInput(elementos) { // TODO: manejar otros filtros personalizados
            referencias = elementos.referencias;
            limpiarOtrosFiltros = elementos.limpiarFiltros;
        },
        /**
         * Función para aplicar un filtro de texto a los datos iniciales.
         * @param {string} texto - Texto a filtrar en los datos iniciales.
         */
        setTexto(texto) {
            filtros.texto = (texto || "").toLowerCase();
            aplicarFiltros();
        },
        /**
         * Función para aplicar un filtro de fecha a los datos iniciales.
         * @param {{anio:number, mes:number, dia:number}} fecha - Objeto para filtrar los datos iniciales.
         */
        setFecha(fecha) {
            filtros.fecha = fecha;
            aplicarFiltros();
        },
        /**
         * Función para aplicar otros filtros personalizados a los datos iniciales.
         * @param {function} fn - Función de filtro personalizada que recibe un registro y devuelve true si el registro cumple con el filtro o false si no lo cumple.
         */
        setOtrosFiltros(fn) {
            otrosFiltros = fn;
            aplicarFiltros();
        },
        /**
         * Función para limpiar los filtros aplicados y mostrar los datos iniciales.
         */
        limpiarFiltros() {
            reiniciarFiltros();
            aplicarFiltros();
        },

        /**
         * Función para suscribirse a cambios en los datos filtrados.
         * @param {string} nombre - Nombre de la suscripción.
         * @param {function(RegistroGestorTabla[])} fn - Función callback que se ejecuta cuando los datos filtrados cambian.
         */
        suscribir(nombre, fn) {
            if (typeof fn !== "function") return;
            listeners.set(nombre, fn);
        },
        /**
         * Función para desuscribirse de cambios en los datos filtrados.
         * @param {string} nombre - Nombre de la suscripción a eliminar.
         */
        desuscribir(nombre) {
            listeners.delete(nombre);
        },
        /**
         * Función para obtener los registros filtrados.
         * @returns {RegistroGestorTabla[]} Arreglo con los registros filtrados.
         */
        getRegistros() {
            return dataFiltrada;
        },
        /**
         * Función para obtener los datos de los registros filtrados en su forma original.
         * @returns {Object[]} Arreglo con los datos originales.
         */
        getDatosOriginales() {
            return dataFiltrada.map(item => item.raw);
        }
    };
}

/**
 * Crea un input para realizar busquedas en una tabla.
 * @param {HTMLTableElement} tabla - Tabla en la que se realizará la busqueda.
 * @param {Object} [extra] - Opciones adicionales.
 * @param {string} [extra.fila] - Si se desea que el input se muestre en un "div" para tener una determinada alineación.
 * @param {string} [extra.alineado] - Alineación del input ("inicio", "medio", "fin").
 * @returns
 */
export const InputBusqueda = (tabla, extra = undefined, tipo=undefined) => {
    const [divGroup, inputBuscar] = crearBuscador();
    if (tipo === "listas") {
        buscarEnTablaListasConArbol(tabla, inputBuscar);
    } else {
        BuscarEnTabla(tabla, inputBuscar);
    }

    let input;
    if (extra?.fila) {
        const alineado = extra?.alineado == "fin" ? "end" : (extra?.alineado == "medio" ? "center" : "start");
        input = crearElemento("div", {class: `mb-2 d-flex justify-content-${alineado} gap-2`}, [divGroup]);
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
    const [divGroup, inputBuscar] = crearBuscador();
    BuscarEnTablaOpts(tabla, inputBuscar, opciones);

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
 * Función para descargar un archivo PDF a partir de un contenido HTML.
 * @param {string} nombre - Nombre del archivo PDF.
 * @param {HTMLElement} contenido - Contenido HTML a convertir en PDF.
 */
export const Html2pdfDescargar = async (nombre, contenido, tipo = "portrait", extra = false) => {
    // contenido.style.fontSize = "11px";

    const opciones = {
        margin: 0.5,
        filename: `${nombre}${Math.floor(Math.random() * (999 - 100 + 1) + 100)}.pdf`,
        image: { type: "jpeg", quality: 0.85 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            // dpi: 192,
            letterRendering: true,
        },
        jsPDF: { unit: "in", format: "letter", orientation: tipo }
    };

    if (extra?.nroPagina) {
        await html2pdf().from(contenido).set(opciones).toPdf().get('pdf').then(function (pdf) {
            const totalPages = pdf.internal.getNumberOfPages();

            let nro = extra.nroPagina;
            for (let i = 1; i <= totalPages; i++) {

                pdf.setPage(i);

                pdf.setFontSize(9);
                pdf.setTextColor(150);

                const footer = `Página N° ${nro++}`;
                const textWidth = pdf.getTextWidth(footer);

                // Posición en la parte inferior (cambia Y según el margen que uses)
                pdf.text(
                    footer,
                    // pdf.internal.pageSize.getWidth() / 2,
                    pdf.internal.pageSize.getWidth() - 0.5,
                    pdf.internal.pageSize.getHeight() - 0.3,
                    { align: 'right' }
                );
            }
        }).save();
    } else {
        await html2pdf().from(contenido).set(opciones).save();
    }


}

export const exportarAXlsx = (datos, nombreDescarga, nombreHoja = "Hoja 1", columnas = null) => {
    // 1. Crear un libro de trabajo (workbook) y una hoja (worksheet)
    const wb = XLSX.utils.book_new();


    const ws = XLSX.utils.aoa_to_sheet(datos);

    if (columnas) {
        ws["!cols"] = columnas;
    }
    // ws["!cols"] = [
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
export function formatoFecha(fecha) {
    if (!fecha) return fecha;

    // Extrae solo la parte de fecha (antes de espacio o "T")
    const soloFecha = fecha.split(/[T ]/)[0];

    const [anio, mes, dia] = soloFecha.split("-");
    if (!anio || !mes || !dia) return fecha;

    return `${dia}/${mes}/${anio}`;
};
/**
 * Convierte una fecha en formato "YYYY-MM-DD HH:MM:SS" a "DD/MM/YYYY HH:MM:SS".
 * @param {string} fecha - Fecha en formato "YYYY-MM-DD HH:MM:SS".
 * @returns {string} Fecha en formato "DD/MM/YYYY HH:MM:SS".
 */
export function formatoFechaHora(fecha) {
    if (!fecha) return "-";

    const [soloFecha, hora] = fecha.split(/[T ]/);
    if (!soloFecha || !hora) return fecha;

    const [anio, mes, dia] = soloFecha.split("-");
    if (!anio || !mes || !dia) return fecha;

    return `${dia}/${mes}/${anio} ${hora}`;
};

// Formateador reutilizable para decimales
const DECIMAL_FORMATTER = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/**
 * Convierte un número en formato "1000.00" a "1,000.00".
 * @param {number} numero - Número en formato "1000.00".
 * @returns {string} - Número en formato "1,000.00".
 */
export function formatoDecimal(numero) {
    const num = +numero;
    return Number.isFinite(num)
        ? DECIMAL_FORMATTER.format(num)
        : "0.00";
}

/**
 * Convierte un número en formato "1,000.00" a 1000.00
 * @param {string|number} valor - Número formateado como texto
 * @returns {number}
 */
export function textoDecimalANumero(valor) {
    if (typeof valor === "number") return valor;

    if (typeof valor !== "string") return 0;

    // Elimina separadores de miles
    const normalizado = valor.replace(/,/g, "");

    const num = Number(normalizado);
    return Number.isFinite(num) ? num : 0;
}

/** Da formato a un texto según el tipo especificado.
 * @param {string} texto - Texto a formatear.
 * @param {"capitalizar"|"guion-bajo"} [tipo] - Tipo de formato
 * @returns {string}
 */
export function formatoTexto(texto, tipo = "capitalizar") {
    if (!texto) return "";

    if (tipo === "capitalizar") {
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    } else if (tipo === "guion-bajo") {
        return texto.replace(/ /g, "_").toLowerCase();
    } else if (tipo === "guion-medio") {
        return texto.replace(/ /g, "-").toLowerCase();
    } else {
        return texto;
    }
}

function capitalizarPalabras(texto) {
    return texto.replace(/\p{L}+/gu, palabra =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
    );
}

/**
 * Función: Obtiene la fecha y hora actual en diferentes formatos.
 * Descripción: Esta función proporciona la fecha y hora actual en varios formatos según el tipo especificado.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Obtiene la fecha y hora actual en diferentes formatos.
 * @param {"fecha"|"fecha-hora"|"hora"|"unir-fechahora"|"array-fechahora"} [tipo] - Tipo de formato de fecha y hora a obtener.
 * @param {string} [union] - Cadena para unir fecha y hora en el formato "unir-fechahora".
 * @returns {string|string[]} - Fecha y/o hora en el formato especificado.
 */
export function obtenerFechaActual(tipo = "fecha", union = "") {
    const fechaActual = new Date();
    // Función auxiliar para agregar ceros a la izquierda
    const pad = n => n.toString().padStart(2, "0");
    const fechaLocal = `${fechaActual.getFullYear()}-${pad(fechaActual.getMonth() + 1)}-${pad(fechaActual.getDate())}`;
    const horaLocal = `${pad(fechaActual.getHours())}:${pad(fechaActual.getMinutes())}:${pad(fechaActual.getSeconds())}`;

    switch (tipo) {
        case "fecha":
            return fechaLocal;
        case "fecha-hora":
            return `${fechaLocal}T${horaLocal}`;
        case "hora":
            return horaLocal;
        case "unir-fechahora":
            return `${fechaLocal}${union}${horaLocal}`;
        case "array-fechahora":
            return [fechaLocal, horaLocal];
        default:
            return "";
    }
}

/**
 * Función: Obtiene una fecha formateada en distintos formatos.
 * Descripción: Esta función devuelve la fecha formateada según el formato especificado y permite personalizar los componentes de la fecha y hora mediante un objeto de opciones.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Obtiene una fecha formateada en distintos formatos.
 *
 * @param {"fecha"|"hora"|"fecha-hora"|"array-fechahora"} formato
 * @param {OpcionesCrearFecha} personalizar - Opciones para personalizar los componentes de la fecha y hora.
 * @returns {string | string[]}
 */
export function obtenerFecha(formato = "fecha", personalizar = {}) {

    const fechaBase = new Date();

    const pad = (n) => String(n).padStart(2, "0");

    // Partes base (UTC para evitar problemas de zona horaria)
    let anio = fechaBase.getFullYear();
    let mes = fechaBase.getMonth() + 1;
    let dia = fechaBase.getDate();
    let hora = fechaBase.getHours();
    let minuto = fechaBase.getMinutes();
    let segundo = fechaBase.getSeconds();

    // Reemplazar valores si existen
    anio = personalizar.anio ?? anio;
    mes = personalizar.mes ?? mes;
    dia = personalizar.dia ?? dia;
    hora = personalizar.hora ?? hora;
    minuto = personalizar.minuto ?? minuto;
    segundo = personalizar.segundo ?? segundo;

    // Ajustar día inválido automáticamente
    const ultimoDiaDelMes = new Date(
        Date.UTC(anio, mes, 0)
    ).getUTCDate();
    dia = Math.min(dia, ultimoDiaDelMes);

    const fecha = `${anio}-${pad(mes)}-${pad(dia)}`;
    const horaTexto = `${pad(hora)}:${pad(minuto)}:${pad(segundo)}`;

    switch (formato) {
        case "fecha":
            return fecha;
        case "hora":
            return horaTexto;
        case "fecha-hora":
            return `${fecha}${personalizar.designador}${horaTexto}`;
        case "array-fechahora":
            return [fecha, horaTexto];
        default:
            return fecha;
    }
}

/**
 * Función: Ajusta una fecha sumando o restando años, meses, días, horas, minutos y segundos.
 * Descripción: Esta función permite ajustar una fecha dada sumando o restando diferentes unidades de tiempo.
 * Fecha: 04 de Enero de 2025
 * Autor: Joel Choque
 */
/**
 * Ajusta una fecha sumando o restando años, meses, días, horas, minutos y segundos.
 * @param {OpcionesAjustarFecha} opciones - Opciones para ajustar la fecha.
 * @returns {string|Date} Fecha ajustada en formato cadena o como objeto Date.
 */
export function ajustarFecha(opciones) {
    const {
        fecha,
        anios = 0,
        meses = 0,
        dias = 0,
        horas = 0,
        minutos = 0,
        segundos = 0,
        tipoFecha = "cadena",
        forma = "fecha-hora"
    } = opciones;

    // Función para crear un objeto Date desde diferentes formatos
    const crearFecha = (valor) => {
        if (valor instanceof Date) return new Date(valor);
        if (typeof valor === "string") {
            // Detectar formato ISO fecha (YYYY-MM-DD) para evitar problemas de zona horaria
            return /^\d{4}-\d{2}-\d{2}$/.test(valor)
                ? new Date(`${valor}T00:00:00`)
                : new Date(valor);
        }
        return new Date(valor);
    };

    const fechaObj = crearFecha(fecha);
    if (Number.isNaN(fechaObj.getTime())) {
        throw new Error("Fecha inválida");
    }

    // Aplicar Años y Meses (Manejo de overflow de días: 31 Ene + 1 mes -> 28/29 Feb)
    if (anios !== 0 || meses !== 0) {
        const diaOriginal = fechaObj.getDate();

        // Ir al día 1 para evitar saltos de mes accidentales al sumar meses
        fechaObj.setDate(1);
        if (anios !== 0) fechaObj.setFullYear(fechaObj.getFullYear() + anios);
        if (meses !== 0) fechaObj.setMonth(fechaObj.getMonth() + meses);

        // Restaurar el día, limitándolo al último día del nuevo mes
        const diasEnNuevoMes = new Date(fechaObj.getFullYear(), fechaObj.getMonth() + 1, 0).getDate();
        fechaObj.setDate(Math.min(diaOriginal, diasEnNuevoMes));
    }

    // Aplicar Días, Horas, Minutos o Segundos
    if (dias !== 0)  fechaObj.setDate(fechaObj.getDate() + dias);
    if (horas !== 0) fechaObj.setHours(fechaObj.getHours() + horas);
    if (minutos !== 0) fechaObj.setMinutes(fechaObj.getMinutes() + minutos);
    if (segundos !== 0) fechaObj.setSeconds(fechaObj.getSeconds() + segundos);

    // Retornar objeto Date si se solicita
    if (tipoFecha === "objeto") {
        return fechaObj;
    }

    // Formatear salida como cadena
    const pad = n => String(n).padStart(2, "0");
    const fechaStr = `${fechaObj.getFullYear()}-${pad(fechaObj.getMonth() + 1)}-${pad(fechaObj.getDate())}`;

    if (forma === "fecha") {
        return fechaStr;
    }

    const horaStr = `${pad(fechaObj.getHours())}:${pad(fechaObj.getMinutes())}:${pad(fechaObj.getSeconds())}`;
    return `${fechaStr} ${horaStr}`;
};

/**
 * Función: Convierte una fecha a un formato de texto legible en español.
 * Descripción: Esta función toma una fecha en diferentes formatos (cadena o Date) y la convierte a un formato de texto legible en español, con opciones para mostrar solo el mes y año o incluir la hora.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Convierte una fecha a un formato de texto legible en español.
 * @param {string|Date} fecha - Fecha a convertir, puede ser una cadena en formato "YYYY-MM-DD", "YYYY-MM" o un objeto Date.
 * @returns {string} Fecha formateada como texto legible en español.
 */
export const convertirFechaATexto = (fecha) => {
    let fechaObj;
    let tipo = "date";

    if (typeof fecha === "string") {

        // Caso YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            tipo = "date";
            fechaObj = new Date(`${fecha}T00:00:00`);

        // Caso YYYY-MM
        } else if (/^\d{4}-\d{2}$/.test(fecha)) {
            tipo = "month";
            fechaObj = new Date(`${fecha}-01T00:00:00`);

        // Caso fecha completa con hora
        } else {
            tipo = "datetime";
            fechaObj = new Date(fecha);
        }

    } else {
        fechaObj = new Date(fecha);
    }

    const opcionesFecha = {
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    const opcionesFechaYHora = {
        ...opcionesFecha,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };

    const opcionesMesYAnio = {
        year: "numeric",
        month: "long"
    };

    let opciones;
    switch (tipo) {
        case "month":
            opciones = opcionesMesYAnio;
            break;
        case "datetime":
            opciones = opcionesFechaYHora;
            break;
        default:
            opciones = opcionesFecha;
    }

    return fechaObj
        .toLocaleDateString("es-ES", opciones)
        .replace(/^(\w+)/, (m) => m.charAt(0).toUpperCase() + m.slice(1)); // opcional: capitalizar mes
};

/**
 * Función: Crea un botón que inicia un recorrido con DriverJS.
 * Descripción: Crea un botón que al hacer clic inicia un recorrido utilizando la librería DriverJS.
 * Fecha: 15 junio 2025
 * Autor: Joel Choque
 */
/**
 * Crea un botón que inicia un recorrido con DriverJS.
 * @param {OpcionesRecorrido[]} recorrido - Pasos del recorrido.
 * @returns  {HTMLElement} Botón que inicia el recorrido.
 */
function crearBotonDriverJS(recorrido) {
    const driver = window.driver.js.driver;

    const icono = crearElemento("i", { class: "bi bi-question-circle" });
    const botonDeInformacion = crearElemento("button", {
        class: "btn rounded-circle d-flex align-items-center justify-content-center fs-5 p-0 text-primary fw-bold driver-info-icon",
        style: "width: 20px; height: 20px;",
        title: "Información de la sección"
    }, [icono]);

    botonDeInformacion.addEventListener("click", () => {
        const nuevoRecorrido = recorrido.map((step) => {
            if (!step.element) {
                return {
                    popover: step.popover,
                }
            }
            // let nuevoElemento = step.mainElement ? step.mainElement.querySelector(step.element) : step.element;
            let nuevoElemento = step.mainElement ? querySelectorVisible(step.element, step.mainElement) : step.element;
            if (nuevoElemento === null || nuevoElemento.offsetParent  === null) {
                return {
                    popover: {
                        title: step.popover.title + ' (no disponible)',
                        description: step.popover.description,
                        side: 'center',
                        align: 'center'
                    }
                }
            }
            return {
                element: nuevoElemento,
                popover: step.popover,
            }
        });
        const tourInstance = driver({
            showProgress: true,
            nextBtnText: 'Siguiente',
            prevBtnText: 'Anterior',
            doneBtnText: 'Hecho',
            progressText: "{{current}} de {{total}}",
            steps: nuevoRecorrido,
        });

        tourInstance.drive();
    });

    return botonDeInformacion;
}
// Función auxiliar para verificar si un elemento es visible en el DOM
function esVisible(elemento) {
    if (!elemento) return false;

    const estilos = getComputedStyle(elemento);

    if (
        estilos.display === "none" ||
        estilos.visibility === "hidden" ||
        estilos.opacity === "0" ||
        elemento.hidden
    ) return false;

    const rect = elemento.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}
// Función auxiliar para encontrar el primer elemento visible que coincida con un selector dentro de un contenedor
function querySelectorVisible(selector, root = document) {
    return Array
        .from(root.querySelectorAll(selector))
        .find(esVisible) || null;
}

/**
 * Función: Crea un div que contiene un botón para iniciar un recorrido con DriverJS.
 * Descripción: Crea un div que contiene un botón que al hacer clic inicia un recorrido utilizando la librería DriverJS.
 * Fecha: 15 junio 2025
 * Autor: Joel Choque
 */
/** Crea un div que contiene un botón para iniciar un recorrido con DriverJS.
 * @param {OpcionesRecorrido[]} recorrido - Pasos del recorrido.
 * @param {HTMLElement} [elementoPadre] - Contenedor donde se añadirá el div.
 * @returns {HTMLElement|void} Div que contiene el botón o undefined si se añade antes al contenedor.
 */
export const seccionDriverJS = (recorrido, elementoPadre) => {
    const botonDJS = crearBotonDriverJS(recorrido)
    const div = crearElemento("div", { class: "d-flex justify-content-end" }, [botonDJS]);

    if (elementoPadre) {
        elementoPadre.prepend(div);
        return;
    }
    return div;
}

// MENÚS
// ==================================================

/**
 * Obtiene los datos de un menú específico desde el localStorage.
 * @param {string} codigo - Código del menú a buscar.
 * @returns {DatosMenu} Menú encontrado.
 */
export function obtenerDatosMenu(codigo) {
    const menu = getMenuPrincipal();
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
 * Función: Obtiene los datos de un submenú "botones" específico.
 * Descripción: Busca el submenú "botones" del menú requerido en el localStorage y devuelve sus datos.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Obtiene los datos de un submenú "botones" específico.
 * @param {String} nombreMenu - Nombre del menú principal
 * @returns {DatosMenu} Datos del submenú encontrado o null si no se encuentra.
 */
export function obtenerDatosMenuBotones(nombreMenu) {
    const menu = getMenuPrincipal();
    const permisos = {};
    for (const item of menu) {
        if (item.codigo === "botones") {
            for (const submenu of item.submenu) {
                const [b_menu, b_codigo] = submenu.codigo.split("-")[0].split("_");
                if (b_codigo === nombreMenu) {
                    return submenu;
                }
            }
            break;
        }
    }
    return null;
}

/**
 * Función: Busca los permisos de los submenús "botones"
 * Descripción: Busca el submenú "botones" del menú requerido en el localStorage y filtra las opciones según los permisos.
 * Fecha: 04 de agosto de 2025
 * Autor: Joel Choque
 */
/**
 * Busca los permisos de los submenús "botones"
 * @param {String} nombreMenu - Nombre del menú principal
 * @returns {[{nombreSubmenu: {}}]|null}
 */
export function buscarMenuBotones(nombreMenu) {
    const menu = getMenuPrincipal();
    const permisos = {};
    for (const item of menu) {
        if (item.codigo === "botones") {
            for (const submenu of item.submenu) {
                const [b_menu, b_codigo] = submenu.codigo.split("-")[0].split("_");
                if (b_menu === nombreMenu) {
                    permisos[b_codigo] = {
                        lectura: submenu.permiso[0],
                        escritura: submenu.permiso[1],
                        editar: submenu.permiso[2],
                        eliminar: submenu.permiso[3]
                    };
                }
            }
            break;
        }
    }
    return Object.keys(permisos).length > 0 ? permisos : null;
}

/**
 * Función: Obtiene el contenido del menú "botones" filtrado por permisos.
 * Descripción: Busca un menú en el localStorage y filtra las opciones según los permisos.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Obtiene el contenido del menú "botones" filtrado por permisos.
 * @param {string} nombreMenu - Nombre del menú que contiene los botones.
 * @param {OpcionesSubmenuBotones[]} opcionesSubmenu - Opciones a filtrar.
 * @returns {[(Object[]|null), Object[]]} Array con las opciones filtradas y los permisos.
 */
function contenidoMenuBotones (nombreMenu, opcionesSubmenu) {
    // Obtener los permisos de submenú "botones"
    const objPermisos = buscarMenuBotones(nombreMenu);

    // Filtrar las opciones según los permisos y asignar clases
    const opciones = opcionesSubmenu.reduce((acc, opcion) => {
        if (objPermisos[opcion.id]?.lectura === "1") {
            acc.push({ ...opcion, clase: "ct-btn-submenu", vista: "d-none" });
        }
        return acc;
    }, []);
    if (opciones.length === 0) {
        return [null, objPermisos];
    }
    // Asignar estilos a la primera opción disponible
    opciones[0].clase = "ct-btn-submenu-active";
    opciones[0].vista = "";
    return [opciones, objPermisos];
}

/**
 * Verifica si el usuario tiene permisos para un botón específico en un menú.
 * @param {string} nombreMenu - Nombre del menú.
 * @param {string} nombreBoton - Nombre del botón.
 * @returns {boolean}
 */
export const PermisoBtnMenuBotones = (nombreMenu, nombreBoton) => {
    const arrPermisos = buscarMenuBotones(nombreMenu);
    if (arrPermisos) {
        return arrPermisos[nombreBoton]?.lectura === "1" ? true : false;
    }
    return false;
}

/**
 * Abre la ventana del menú según su código.
 * @param {string} codigo - Código de la ventana.
 * @returns {DatosMenu} Menú encontrado.
 */
export function abrirVentanaMenu(codigo) {
    const menu = obtenerDatosMenu(codigo);
    if (menu) {
        const datosVentana = cargarFormulario(menu.codigo, menu.permiso);
        if (datosVentana) {
            crearTargetas(datosVentana, menu.titulo, menu.codigo);
            return menu;
        }
    }
    return null;
}

/**
 * Función: Crea el contenido principal del menú y su navegación.
 * Descripción: Esta función genera el contenido principal del menú para la gestión de los submenús.
 *              Permite alternar entre las vistas de los submenús mediante botones.
 *              Cada vista se carga dinámicamente al hacer clic en el botón correspondiente.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea el contenido principal del menú y su navegación.
 * @param {DatosMenuBotones} datosMenu - Datos del menú principal.
 * @param {OpcionesSubmenuBotones[]} opcionesSubmenu - Opciones para generar los submenús.
 */
export function crearNavegacionConBotones(datosMenu, opcionesSubmenu) {
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${datosMenu.codigo}"] .card-body #contenedor-cabecera`);

    // Filtrar opciones según permisos
    const [opciones, objPermisos] = contenidoMenuBotones(datosMenu.nombreMenu ?? datosMenu.codigo.split("-")[0], opcionesSubmenu);
    if (!opciones) {
        const mensaje = crearElemento("div", { class: "text-center text-info fs-6 mt-5" }, ["No tiene los permisos necesarios para acceder a esta vista."]);
        vistaPrincipal.appendChild(mensaje);
        return;
    }

    // Crear botones de navegación y sus vistas de forma dinámica
    const divBotones = crearElemento("div", { class: "d-flex justify-content-start overflow-x-auto" });
    const vistas = {};
    opciones.forEach(({ id, label, clase, vista }) => {
        const boton = crearElemento("button", { class: `btn ${clase} me-1`, style: "font-size: 1.2em;", "data-id": id }, [label]);
        const divVista = crearElemento("div", { class: vista, "data-tab-id": id });
        divBotones.appendChild(boton);
        vistas[id] = divVista;
        // Evento para manejar cambios de vista
        boton.addEventListener("click", () => cambiarVista(id));
    });
    const separador = crearElemento("hr", { class: "my-1", style: "color: #219286; opacity: 1;" });
    vistaPrincipal.append(divBotones, separador, ...Object.values(vistas));

    // Función para cambiar la vista activa
    function cambiarVista(idActivo) {
        opciones.forEach(({ id, callbackVista, label }) => {
            const boton = divBotones.querySelector(`[data-id="${id}"]`);
            const vista = vistas[id];

            if (id === idActivo) {
                boton.classList.remove("ct-btn-submenu");
                boton.classList.add("ct-btn-submenu-active");
                vista.classList.remove("d-none");

                // Cargar la función correspondiente si es la primera vez
                if (vista.children.length === 0) {
                    callbackVista(objPermisos[id], vista, {tituloVista: label, ...datosMenu});
                }
            } else {
                boton.classList.remove("ct-btn-submenu-active");
                boton.classList.add("ct-btn-submenu");
                vista.classList.add("d-none");
            }
        });
    }

    // Inicializar la primera vista activa
    cambiarVista(opciones[0].id);
}


/** * Función: Genera el contenido HTML para un botón de carga con spinner.
 * Descripción: Crea una cadena de texto que representa el contenido HTML de un botón con un spinner de carga y un texto opcional.
 * Fecha: 5 de julio de 2024
 * Autor: Joel Choque
 */
/**
 * Genera el contenido HTML para un botón de carga con spinner.
 * @param {string} [texto="Cargando..."] - Texto a mostrar junto al spinner.
 * @param {"border"|"grow"} [tipo="border"] - Tipo de spinner (por defecto es "border").
 * @returns {string} - Cadena de texto con el contenido HTML del botón de carga.
 */
export function contenidoDeCargaBtn(texto = "Cargando...", tipo = "border") {
    const btnSpinner = `
        <span class="spinner-${tipo} custom-spinner-${tipo}-sm" aria-hidden="true"></span>
        <span role="status">${texto}</span>`;
    return btnSpinner;
}
/** Función: Muestra un estado de carga en un botón.
 * Descripción: Deshabilita el botón y cambia su contenido para mostrar un spinner de carga junto con un texto opcional.
 *              Devuelve una función que, al ser llamada, restaura el botón a su estado original.
 * Fecha: 5 de julio de 2024
 * Autor: Joel Choque
 */
/**
 * Muestra un estado de carga en un botón.
 * @param {HTMLButtonElement} boton - Botón a modificar.
 * @param {string} [texto] - Texto a mostrar junto al spinner. Si no se proporciona, se usa el texto actual del botón.
 * @param {"border"|"grow"} [tipo="border"] - Tipo de spinner (por defecto es "border").
 * @returns {Function} - Función para restaurar el botón a su estado original.
 */
export function botonEnCarga(boton, texto, tipo = "border") {
    const contenidoOriginal = boton.innerHTML;
    const soloTexto = texto || boton.textContent.trim();
    boton.disabled = true;
    boton.innerHTML = contenidoDeCargaBtn(soloTexto, tipo);
    return () => {
        boton.disabled = false;
        boton.innerHTML = contenidoOriginal;
    };
}

/**
 * Función: Resalta un texto con un color de fondo específico.
 * Descripción: Crea un elemento <span> que resalta el texto proporcionado con un color de fondo y estilos adicionales.
 * Fecha: 26 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Resalta un texto con un color de fondo específico.
 * @param {"gray"|"red"|"orange"|"yellow"|"green"|"teal"|"blue"|"purple"|"indigo"|"pink"} color - Color de fondo para resaltar el texto.
 * @param {string} textoEstado - Texto a resaltar.
 * @returns {HTMLSpanElement}
 */
export function resaltarTexto(color, textoEstado) {
    const span = crearElemento("span", { class: `rounded-pill text-nowrap` }, [textoEstado]);

    switch (color) {
        case "gray":
            span.style.backgroundColor = "#EDF2F7";
            span.style.color = "#2D3748";
            break;
        case "red":
            span.style.backgroundColor = "#FFD7D7";
            span.style.color = "#9B2C2C";
            break;
        case "orange":
            span.style.backgroundColor = "#FEEBC8";
            span.style.color = "#9C4221";
            break;
        case "yellow":
            span.style.backgroundColor = "#FEFCBF";
            span.style.color = "#975A16";
            break;
        case "green":
            span.style.backgroundColor = "#C6F6D5";
            span.style.color = "#276649";
            break;
        case "teal":
            span.style.backgroundColor = "#B2F5EA";
            span.style.color = "#285E61";
            break;
        case "blue":
            span.style.backgroundColor = "#BFE3F8";
            span.style.color = "#2C5282";
            break;
        case "purple":
            span.style.backgroundColor = "#E9D8FD";
            span.style.color = "#553C9A";
            break;
        case "indigo":
            span.style.backgroundColor = "#C3DAFE";
            span.style.color = "#434190";
            break;
        case "pink":
            span.style.backgroundColor = "#FED7E2";
            span.style.color = "#97266D";
            break;
        default:
            break;
    }
    span.style.padding = "2px 12px";
    return span;
}

// Funciones para el menú y targetas
export function ocultarElemento(elemento) {
    elemento.classList.add("ocultar-animacion");
    elemento.classList.remove("d-block");
    elemento.classList.add("d-none");

    // Eliminar las clases de animación después de un tiempo
    setTimeout(() => {
        elemento.classList.remove("ocultar-animacion");
    }, 500); // Ajusta el tiempo según la duración de tu animación en CSS
}
export function mostrarElemento(elemento) {
    elemento.classList.remove("d-none");
    elemento.classList.add("d-block");
    elemento.classList.add("mostrar-animacion");

    // Eliminar las clases de animación después de un tiempo
    setTimeout(() => {
        elemento.classList.remove("mostrar-animacion");
    }, 500); // Ajusta el tiempo según la duración de tu animación en CSS
}



/** Función: Crea un botón para mostrar un archivo adjunto (imagen o PDF)
 * Descripción: Esta función genera un botón que, al hacer clic, muestra un modal con el archivo adjunto.
 *              Si el archivo es un PDF, se crea un enlace para abrirlo en una nueva pestaña.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/** Crea un botón para mostrar un archivo adjunto (imagen o PDF)
 * @param {HTMLElement} contenedorModal - Contenedor donde se mostrará el modal
 * @param {string} nombreArchivo - Nombre del archivo adjunto
 * @returns {HTMLButtonElement|null}
 */
export function botonMostrarAdjunto(contenedorModal, nombreArchivo, configuracionBoton = {}) {
    if (!nombreArchivo || !nombreArchivo.includes(".")) {
        return null;
    }

    const { color = "primary" } = configuracionBoton;

    const extension = nombreArchivo.split(".").pop().toLowerCase();
    const urlArchivo = `${CT_URLARCHIVOS}${nombreArchivo}`;

    // Para archivos PDF
    if (extension === "pdf") {
        const icono = crearElemento("i", { class: "bi bi-file-earmark-pdf-fill" });
        const btnPDF = crearElemento(
            "a",
            { class: `btn btn-sm btn-outline-${color}`, title: "PDF", href: urlArchivo, target: "_blank" },
            [ icono ]
        );
        return btnPDF;
    }

    // Para (imágenes)
    const icono = crearElemento("i", { class: "bi bi-image", role: "button" });
    const button = crearElemento(
        "button",
        { class: `btn btn-sm btn-outline-${color}`, type: "button", title: "Imagen" },
        [ icono ]
    );
    button.addEventListener("click", () => {
        contenedorModal.append(
            modalImagen(urlArchivo)
        );
    });
    return button;
}

/**
 * Función: Crea el botón para eliminar el archivo adjunto de un documento de cobro
 * Descripción: Esta función genera un botón que permite eliminar el archivo adjunto asociado a un documento de cobro.
 *              Esta función se utiliza desde la pare Editar de los registrso de la tabla, para que el botón aparezca en el modal de edición al lado del input de archivo solo si existe un archivo adjunto.
 * Fecha: 25 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea el botón para eliminar el archivo adjunto de un documento de cobro
 * @param {OpcionesEliminarArchivo} datos - Datos necesarios para la función.
 * @returns {Function} Función que crea el botón de eliminar archivo adjunto.
 */
export function manejarEliminarArchivoDesdeFormulario (datos) {
    const {
        contenedorDeAlertas,
        vistaPrincipal,
        cargarContenidoTabla,
        urlListadoTabla,
        llaves
    } = datos;

    const { archivo, idRegistro, tipoDocumento = "contrato"} = llaves || {};

    /**
     * Parámetos que se obtienen al momento de Crear el formulario con la configuración de un input que pasa el la clave "opcionesInput" con valor {callback}
     * @param {Object} parametros - Parámetros para configurar el botón de eliminar archivo.
     * @param {HTMLElement} parametros.divBotones - Contenedor donde se agregará el botón de eliminar.
     * @param {HTMLElement} parametros.elementoInput - Elemento input del archivo adjunto.
     * @param {HTMLElement} parametros.contenedorInput - Contenedor del input del archivo adjunto.
     * @param {Object} parametros.registro - Registro actual del documento de cobro.
     */
    return ({divBotones, elementoInput, contenedorInput, registro}) => {
        if (!registro || !registro[archivo] || !registro[archivo].includes(".")) {
            return null;
        }
        const icono = crearElemento("i", {class: "bi bi-trash3"});
        const botonEliminar = crearElemento("button", {class: "btn btn-outline-danger px-1", title: "Eliminar Archivo Adjunto"}, [icono]);
        divBotones.appendChild(botonEliminar);
        // Mostrar el nombre del archivo adjunto
        const divInformacion = contenedorInput.querySelector("[data-name='div-info']");

        divInformacion.innerHTML = registro[archivo];

        botonEliminar.addEventListener("click", async (e) => {
            e.preventDefault();
            // Función que se ejecuta al confirmar la eliminación del archivo adjunto
            const eliminar = async () => {
                const callbackExito = async(respuesta) => {
                    // Cerrar el modal Principal que es del formulario de edición
                    const formulario = elementoInput.closest("form");
                    const botonCerrarModal = formulario?.querySelector("#btn-cancelar-formulario");
                    // Recargar la tabla con los datos actualizados
                    const listaDeRegistros = await obtenerDatos(typeof(urlListadoTabla) === "function" ? urlListadoTabla() : urlListadoTabla);
                    alertaDeExito(contenedorDeAlertas, "Archivo eliminado con exito");
                    cargarContenidoTabla(listaDeRegistros);
                    botonCerrarModal?.click();
                }
                const callbackError = (respuesta) => {
                    alertaDeError(contenedorDeAlertas, "No se pudo eliminar el archivo");
                }

                await manejarSolicitudEliminacion({
                    urlSolicitud: `${CT_URLAPI}eliminar_archivo_adjunto/${registro[idRegistro]}/${tipoDocumento}`,
                    callbackError,
                    callbackExito,
                })
            }
            // Crear y mostrar el modal de confirmación
            const modal = modalDeConfirmacion(eliminar, "¿Está seguro que desea eliminar el archivo adjunto?");
            vistaPrincipal.appendChild(modal);
        });
    }
};

/**
 * Función: Muestra la jerarquía de un plan de cuentas
 * Descripción: Esta función obtiene y muestra la jerarquía de un plan de cuentas en formato de lista anidada.
 * Fecha: 15 de diciembre de 2025
 * Autor: Joel Choque
 */
/**
 * Muestra la jerarquía de un plan de cuentas
 * @param {string} value - Valor del plan de cuentas para obtener su jerarquía.
 * @returns {Promise<HTMLDivElement|null>} Elemento div con la jerarquía o null si no hay datos.
 */
export async function mostrarJerarquiaPlanDeCuentas(value) {
    const datosPadres = await obtenerDatos(`${CT_URLAPI}lista_padres_plandecuentas/${value}`);

    if (datosPadres?.length > 0) {
        let ulActual = null;
        let ulPrincipal = null;
        let numero = null;
        for (const padre of datosPadres) {
            if (numero === padre.numero) {
                continue;
            } else {
                numero = padre.numero;
            }
            const li = crearElemento("li", undefined, [`${padre.numero}: ${padre.nombre}`])
            const ul = crearElemento("ul", {class: "p-0 m-0 ps-3"}, [li])

            if (ulActual) {
                ulActual.appendChild(ul)
                ulActual = li;
            } else {
                ulActual = li;
                ulPrincipal = ul;
            }
        }
        const div = crearElemento("div", {class: ""}, [ulPrincipal])
        return div;
    }
    return null;
}


// =========================================================
// FUNCIONES MODAL CAJAS Y BANCOS
// =========================================================

/**
 * Función: Crea el estado para manejar los datos de Cajas y Bancos
 * Descripción: Esta función genera un objeto que permite manejar el estado de los datos de Cajas y Bancos.
 *              Proporciona métodos para agregar, eliminar, limpiar y obtener los datos, así como para calcular el total asignado.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Crea el estado para manejar los datos de Cajas y Bancos
 * @param {HTMLElement} vistaPrincipal - Vista principal donde se encuentra el formulario.
 * @param {string} prefijoId - Prefijo utilizado para identificar los elementos del formulario.
 * @returns {MetodosCajaBanco} Objeto con métodos para manejar el estado de Cajas y Bancos.
 */
export function crearEstadoCajaBancos(vistaPrincipal, prefijoId) {
    let arrayDeCajaBancos = [];

    const obtenerBoton = () => {
        const formulario = vistaPrincipal.querySelector("#form-registro");
        return formulario.querySelector(`#${prefijoId}-cajasbancos`);
    }
    const obtenerMonto = () => {
        const formulario = vistaPrincipal.querySelector("#form-registro");
        const monto = formulario.querySelector(`#${prefijoId}-montofactura`)?.value || 0;
        return Math.round(parseFloat(monto) * 100) / 100;
    }
    const obtenerMontoTotal = (nuevoMonto = 0) => {
        let total = nuevoMonto ? Math.round(parseFloat(nuevoMonto) * 100) : 0;
        for (const cb of arrayDeCajaBancos) {
            total += Math.round(parseFloat(cb.monto) * 100);
        }
        return total/100;
    }

    const tooggleBoton = () => {
        const boton = obtenerBoton();
        const monto = obtenerMonto();
        const montoTotal = obtenerMontoTotal();
        if (arrayDeCajaBancos.length > 0 && montoTotal === monto) {
            boton.classList.remove("btn-warning");
            boton.classList.add("btn-primary");
        } else {
            boton.classList.remove("btn-primary");
            boton.classList.add("btn-warning");
        }
    }

    return {
        agregar(item) {
            arrayDeCajaBancos.push(item);
            tooggleBoton();
        },
        eliminarPorId(id) {
            const i = arrayDeCajaBancos.findIndex(x => x.id === id);
            if (i !== -1) arrayDeCajaBancos.splice(i, 1);
            tooggleBoton();
        },
        limpiar() {
            arrayDeCajaBancos.length = 0;
            tooggleBoton();
        },
        total(nuevoMonto = 0) {
            const total = obtenerMontoTotal(nuevoMonto);
            return total;
        },
        obtener() {
            return arrayDeCajaBancos;
        },
        tieneDatos() {
            return arrayDeCajaBancos.length > 0;
        }
    };
}

/**
 * Función: Verifica que se haya asignado (si corresponde) el monto en Cajas y Bancos
 * Descripción: Esta función verifica que el monto asignado en Cajas y Bancos sea igual al monto de la factura cuando el estado es "Pagado o Cobrado".
 *              Esta función se maneja como una función previa al envío del formulario de registro de factura de compra/pago o venta/cobro.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Verifica que se haya asignado (si corresponde) el monto en Cajas y Bancos
 * @param {HTMLElement} vista - Vista principal donde se agregará el modal de información en caso de error.
 * @param {MetodosCajaBanco} estadoCajaBancos - Estado de Cajas y Bancos.
 * @param {HTMLElement} formulario - Formulario de registro de factura de compra/pago o venta/cobro.
 * @param {string} prefijoId - Prefijo utilizado para identificar los elementos del formulario.
 * @returns {Promise<string|boolean>} - Retorna una cadena JSON con los datos de Cajas y Bancos o false si hay un error.
 */
export async function verificarOpcionCajaBanco(vista, estadoCajaBancos, formulario, prefijoId, tipo) {
    const monto = formulario.querySelector(`#${prefijoId}-montofactura`);
    const estado = formulario.querySelector(`#${prefijoId}-estado`);

    const usuario_id = getUsuarioId();
    const empresa_id = getEmpresaId();
    const datosCB = await obtenerDatos(`${CT_URLAPI}listar_caja_bancos_por_usuario/${empresa_id}/${usuario_id}`);

    if (datosCB && datosCB.length > 0 && estadoCajaBancos && (estado?.value === "2" || tipo === "sin_estado")) {
        if (estadoCajaBancos.tieneDatos()) {

            let total = estadoCajaBancos.total();

            if (total > Number(monto.value)) {
                const modal = modalDeInformacion("El monto de Cajas y Bancos no debe ser mayor al monto a registrar");
                vista.appendChild(modal);
                return false;
            }
            if (total !== Number(monto.value)) {
                const modal = modalDeInformacion("El monto de Cajas y Bancos debe ser igual al monto a registrar");
                vista.appendChild(modal);
                return false;
            }
            return JSON.stringify(estadoCajaBancos.obtener());
        } else {
            const modal = modalDeInformacion("Debe asignar el monto en Cajas y Bancos");
            vista.appendChild(modal);
            return false;
        }
    }

    return true;
}

/**
 * Función: Maneja el llenado de cajas y bancos en el formulario de factura de compra/pago o venta/cobro.
 * Descripción: Esta función agrega la funcionalidad para asignar montos a cajas y bancos mediante un modal.
 *             Permite abrir un modal desde el formulario principal, agregar montos a cajas y bancos, y actualizar el estado del botón correspondiente.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
/** Maneja el llenado de cajas y bancos en el formulario de factura de compra/pago o venta/cobro.
 * @param {HTMLElement} formulario - Formulario de registro de factura de compra/pago o venta/cobro.
 * @param {HTMLElement} vistaPrincipal - Vista principal donde se encuentra el formulario.
 * @param {MetodosCajaBanco} estadoCajaBancos - Estado de Cajas y Bancos.
 * @param {string} prefijoId - Prefijo utilizado para identificar los elementos del formulario.
 * @param {function} obtenerSaldo - Función para obtener el saldo disponible.
 */
export function manejarLlenadoCajaBancos(formulario, vistaPrincipal, estadoCajaBancos, prefijoId, obtenerSaldo) {
    const botonCajaBanco = formulario.querySelector(`#${prefijoId}-cajasbancos`);
    const inputMonto = formulario.querySelector(`#${prefijoId}-montofactura`);

    let divModal = modalAgregarCajaBanco(inputMonto);
    botonCajaBanco.addEventListener("click", () => {
        if (!estadoCajaBancos.tieneDatos()) {
            divModal = modalAgregarCajaBanco(inputMonto);
        }
        vistaPrincipal.appendChild(divModal)
    });
    inputMonto.addEventListener("input", () => {
        const valor = inputMonto.value;
        if (valor) {
            if (obtenerSaldo && valor > obtenerSaldo()) {
                const saldo = obtenerSaldo();
                inputMonto.setAttribute("max", saldo);

                inputMonto.reportValidity();
                botonCajaBanco.disabled = true;
            } else {
                botonCajaBanco.disabled = false;
            }
        } else {
            botonCajaBanco.disabled = true;
        }
        estadoCajaBancos.limpiar();
    });

    // Función para manejar la asignación de montos a cajas y bancos
    function modalAgregarCajaBanco(montoPrincipal) {
        const usuario_id = getUsuarioId();
        const empresa_id = getEmpresaId();

        const [modal, cuerpoModal, cerrarModal] = modalRemovible({
            tituloModal: "Asignar Montos Cajas/Bancos",
            estiloModal: "width: 600px",
            instrucciones: {
                cerrarAlHacerClickExterno: false,
                cerrarAlPresionarEsc: false,
            }
        })

        const [selectCajasBancos, divCajasBanco] = campoSelect(
            { atributos: { id: "asignarcb-cajasbancos", name: "caja_banco", required: true } },
            { contenido: "Cajas y Bancos"},
            { atributos: { class: "col-12 col-md-6"}}
        );
        const [inputMonto, divMonto] = campoInput(
            { atributos: { id: "asignarcb-monto", name: "monto", type: "number", step: "0.01", min: "0.01", required: true } },
            { contenido: "Monto"},
            { atributos: { class: "col-12 col-md-6"}}
        );
        const botonAgregar = crearElemento("button", { class: "btn btn-warning", type: "submit", style: "min-width: 100px" }, ["Agregar"]);
        const divAgregar = crearElemento("div", { class: "text-center" }, [botonAgregar]);
        const elementoFormulario = crearElemento("form", { class: "row g-2" }, [divCajasBanco, divMonto, divAgregar]);

        const tablaYBotones = `
            <div class="table-responsive">
                <table class="table table-sm table-bordered table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Caja o Banco</th>
                            <th>Monto</th>
                            <th style="width:55px;">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody id="m_cb_tabla">
                    </tbody>
                    <tfoot>
                        <tr class="fw-bold">
                            <td class="text-end">Total:</td>
                            <td class="text-end" id="total">0.00</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div class="d-grid gap-2 d-sm-flex justify-content-sm-center mt-3">
                <button type="button" class="btn btn-primary" data-id="asignarcb-aceptar" style="min-width: 100px;">Aceptar</button>
                <button type="button" class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 100px;">Cancelar</button>
            </div>`;

        const divTablaYBotones = crearElemento("div", { class: "mt-3"});
        divTablaYBotones.innerHTML = tablaYBotones;

        cuerpoModal.append(elementoFormulario, divTablaYBotones);

        const tablaBody = divTablaYBotones.querySelector("#m_cb_tabla");
        const botonAceptar = divTablaYBotones.querySelector("[data-id='asignarcb-aceptar']");
        const botonCancelar = divTablaYBotones.querySelector("[data-id='__opcion-cierre-externo']");

        const mostrarMonto = (valor) => {
            if (valor) {
                const montoTablaCB = estadoCajaBancos.total();
                const montoPendiente = Number(montoPrincipal.value) - montoTablaCB;
                inputMonto.value = montoPendiente ? Number(montoPendiente.toFixed(2)) : "";
            } else {
                inputMonto.value = "";
            }
        }
        manejarSelect(selectCajasBancos, {
            urlSolicitud: `${CT_URLAPI}listar_caja_bancos_por_usuario/${empresa_id}/${usuario_id}`,
            llavesOpciones: { valor: "idcaja_bancos", detalle: ["codigo", "tipo_cuenta"] },
            callbackInput: mostrarMonto
        });

        botonAceptar.addEventListener("click", (e) => {
            e.preventDefault();
            cerrarModal();
        });
        botonCancelar.addEventListener("click", (e) => {
            e.preventDefault();
            estadoCajaBancos.limpiar();
            tablaBody.innerHTML = "";
        });

        // Preparación y envio de formulario y control de la respuesta
        elementoFormulario.addEventListener("submit", (e) => {
            e.preventDefault();
            const montoP = parseFloat(montoPrincipal.value || 0)
            const monto = inputMonto.value;
            const total = estadoCajaBancos.total(monto);

            if (total > montoP) {
                const modalInformacion = modalDeInformacion("El monto de Cajas y Bancos no debe ser mayor al monto a registrar");
                cuerpoModal.appendChild(modalInformacion)
                return;
            }

            const valueOption = selectCajasBancos.selectize.getValue();
            const cajaBanco = selectCajasBancos.selectize.options[valueOption].text;
            // Crear fila en la tabla con la opción seleccionada
            const iconoEliminar = crearElemento("i", { class: "bi bi-trash" });
            const btnEliminar = crearElemento("button", { class: "btn btn-danger btn-sm" }, [iconoEliminar]);
            const tdCB = crearElemento("td", undefined, [cajaBanco]);
            const tdMonto = crearElemento("td", {class:"text-end"}, [formatoDecimal(monto)]);
            const tdEliminar = crearElemento("td", undefined, [btnEliminar]);
            const tr = crearElemento("tr", undefined, [tdCB, tdMonto, tdEliminar]);
            tablaBody.appendChild(tr);

            // Actualizar el total en la tabla
            const tdTotal = divTablaYBotones.querySelector("#total");
            if (tablaBody.children.length > 0) {
                tdTotal.textContent = formatoDecimal(total);
            }

            // Ocultar la opción seleccionada en el select del modal
            const opcionActual = selectCajasBancos.selectize.getOption(valueOption);
            reiniciarFormulario(elementoFormulario);
            opcionActual[0].classList.add("d-none");

            estadoCajaBancos.agregar({ id: valueOption, monto: Number(monto).toFixed(2) });

            btnEliminar.addEventListener("click", () => {
                tr.remove();
                opcionActual[0].classList.remove("d-none");
                estadoCajaBancos.eliminarPorId(valueOption);
                tdTotal.textContent = formatoDecimal(estadoCajaBancos.total());
            })
        })

        return modal;
    }
}


// =========================================================
// FUNCIONES MANEJAR RESULTADO QR
// =========================================================

/**
 * Obtiene los parámetros de la URL obtenida por el lector QR.
 * @param {string} textoQR - URL obtenida por el lector QR.
 * @returns {Object} Objeto con los parámetros de la URL.
 */
function obtenerParametrosDelQR(textoQR) {
    // Divide el textoQR en base al símbolo "?"
    const partes = textoQR.split("?");
    if (partes.length < 2) {
        return {};
    }
    const queryString = partes[1];
    const pares = queryString.split("&");
    // Crea un objeto para almacenar los parámetros
    const parametros = {};
    pares.forEach(par => {
        const [clave, valor] = par.split("=");
        parametros[clave] = valor;
    });

    return parametros;
}
/**
 * Función: Maneja la búsqueda en un selectize y abre la vista de proveedor/cliente si no se encuentra.
 * Descripción: Esta función realiza una búsqueda en un selectize utilizando el NIT proporcionado.
 *              Si se encuentra una opción que coincide, la selecciona; de lo contrario, abre la vista para registrar un nuevo proveedor/cliente.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Maneja la búsqueda en un selectize y abre la vista de proveedor/cliente si no se encuentra.
 * @param {Object} selectize - Instancia de Selectize.
 * @param {string} nit - NIT a buscar.
 * @param {Function} abrirVentana - Función para abrir la vista de proveedor/cliente.
 */
async function manejarBusquedaEnSelect(selectize, nit, abrirVentana) {
    selectize.clear();
    // Simular tipeo real para activar filtro
    selectize.setTextboxValue(nit);
    selectize.onSearchChange(nit);

    // const opcionEncontrada = await esperarCondicion(() => {
    //     const resultados = Object.values(selectize.options)
    //         .filter(opt => opt.text.toLowerCase().includes(nit.toLowerCase()));
    //     if (resultados.length === 1) {
    //         return resultados[0].value;
    //     }
    //     return null;
    // }, 5000, 50);
    let opcionEncontrada;

    const resultados = Object.values(selectize.options)
        .filter(opt => opt.text.toLowerCase().includes(nit.toLowerCase()));
    if (resultados.length === 1) {
        opcionEncontrada = resultados[0].value;
    }

    if (opcionEncontrada) {
        selectize.setValue(opcionEncontrada);
    } else {
        selectize.setTextboxValue("");
        abrirVentana();
    }
}
/**
 * Función: Espera a que una condición se cumpla o hasta que se agote el tiempo de espera.
 * Descripción: Esta función evalúa periódicamente un predicado hasta que devuelve un valor verdadero o hasta que se agota el tiempo de espera.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Espera a que una condición se cumpla o hasta que se agote el tiempo de espera.
 * @param {Function} predicado - Función que devuelve un valor verdadero cuando la condición se cumple.
 * @param {number} [timeout=3000] - Tiempo máximo de espera en milisegundos.
 * @param {number} [intervalo=100] - Intervalo entre evaluaciones en milisegundos.
 * @returns {Promise<*>} Promesa que se resuelve con el valor devuelto por el predicado o null si se agota el tiempo.
 */
function esperarCondicion(predicado, timeout = 3000, intervalo = 100) {
    return new Promise((resolve) => {
        const t0 = Date.now();
        const check = () => {
			if ((Date.now() - t0) > timeout) {
                resolve(null);
                return;
            }
            try {
                const resultado = predicado();
                if (resultado) {
                    resolve(resultado);
                } else {
                    setTimeout(check, intervalo);
                }
            } catch (e) {
                setTimeout(check, intervalo);
            }
        };
        check();
    });
}
/**
 * Espera a que un elemento exista en el DOM.
 * @param {string} selector - Selector del elemento a esperar.
 * @param {Element} [contexto=document] - Elemento padre opcional.
 */
function esperarElemento(selector, contexto = document) {
    return esperarCondicion(() => contexto.querySelector(selector));
}

/**
 * Función: Rellena el formulario de factura de compra/pago a partir de los datos obtenidos del QR.
 * Descripción: Esta función extrae los parámetros necesarios del texto del QR y llena los campos correspondientes en el formulario.
 *              Si no se encuentra el proveedor, ofrece la opción de abrir la vista para registrarlo.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Rellena el formulario de factura de compra/pago a partir de los datos obtenidos del QR.
 * @param {Object} datosVista - Datos necesarios para la función.
 * @param {Element} datosVista.vistaPrincipal - Contenedor principal de la vista.
 * @param {Element} datosVista.contenidoFormulario - Contenedor del formulario a llenar.
 * @param {string} datosVista.prefijoId - Prefijo de los IDs de los campos del formulario.
 * @returns {Function} Función que maneja el llenado del formulario a partir del texto del QR.
 */
export function rellenarFacturaPagoDelQR(datosVista) {
    const { vistaPrincipal, contenidoFormulario, prefijoId } = datosVista;

    return async ({ textoQR, modalScanner, contenedorInformacion }) => {
        const parametros = obtenerParametrosDelQR(textoQR);

        const nit = parametros["nit"];
        const cuf = parametros["cuf"];
        const numero = parametros["numero"];
        // const nit = "12312dfdfd3"; const cuf = "123456789"; const numero = "123456";

        if (!nit || !cuf || !numero) {
            contenedorInformacion.classList.remove("d-none");
            contenedorInformacion.innerHTML = `<span style="font-size: 12px"><b>QR: </b>${textoQR}</span>`;
            return;
        }

        // Ocultar modal del escáner
        const modalInstance = bootstrap.Modal.getInstance(modalScanner);
        if (modalInstance) modalInstance.hide();

        // Llenar campos básicos
        const nfactura = contenidoFormulario.querySelector(`#${prefijoId}-numerofactura`);
        const nautorizacion = contenidoFormulario.querySelector(`#${prefijoId}-nautorizacion`);
        if (nfactura) nfactura.value = numero;
        if (nautorizacion) nautorizacion.value = cuf;

        contenidoFormulario.classList.remove("d-none"); // TODO: ver los tipos de contenedor de formularios

        // Preparar para abrir el formulario de nuevo proveedor si no se encuentra
        const menuProv = obtenerDatosMenuBotones("proveedor");
        let existeProveedor = menuProv?.permiso?.[0] === "1" && menuProv?.permiso?.[1] === "1";
        const abrirVistaProveedor = () => {
            if ( !existeProveedor )  return;

            const abrirVentana = async() => {
                await abrirFlujoProveedor(nit, menuProv);
            }
            const modal = modalDeConfirmacion(abrirVentana, "No se encontró el proveedor. ¿Desea registrarlo ahora?");
            vistaPrincipal.appendChild(modal);
            modal.querySelector("button[data-id='__btn-confirmar']").focus();
        }
        // Manejar búsqueda del proveedor
        const selectProveedor = contenidoFormulario.querySelector(`#${prefijoId}-proveedor`);
        if (selectProveedor && selectProveedor.selectize) {
            await manejarBusquedaEnSelect(selectProveedor.selectize, nit, abrirVistaProveedor);
        } else if (selectProveedor) {
            abrirVistaProveedor();
        }
    };
}
/**
 * Función: Abre el flujo para registrar un nuevo proveedor.
 * Descripción: Esta función abre la vista de proveedor-cliente, navega a la pestaña de proveedores.
 *              Inicia el registro de un nuevo proveedor y llena el campo NIT con el valor proporcionado.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
async function abrirFlujoProveedor(nit, menuProv) {
    abrirVentanaMenu("clienteoproveedor");

    const codigoMenu = menuProv.codigo.split("-")[1];

    // Esperar a que el contenedor de la vista aparezca en el DOM
    const contenedorCabecera = await esperarElemento(`.p-2[data-value="clienteoproveedor-${codigoMenu}"] .card-body #contenedor-cabecera`);
    if (contenedorCabecera) {
        const botonProveedor = await esperarElemento("button[data-id='proveedor']", contenedorCabecera);
        if (botonProveedor) {
            botonProveedor.click();
            // Esperar botones de acción en la pestaña activada
            const botonRegistro = await esperarElemento("div[data-tab-id='proveedor'] [data-id='__btn-registro']", contenedorCabecera.parentElement);
            if (botonRegistro) {
                botonRegistro.click();
                // Esperar al input del formulario y llenarlo
                const inputNit = await esperarElemento("#proveedores-nit", contenedorCabecera);
                if (inputNit) {
                    inputNit.value = nit;
                    inputNit.focus(); // Dar foco para mejor UX
                }
            }
        }
    }
}

/**
 * Función: Rellena el formulario de factura de venta/cobro a partir de los datos obtenidos del QR.
 * Descripción: Esta función extrae los parámetros necesarios del texto del QR y llena los campos correspondientes en el formulario.
 *              Si no se encuentra el cliente, ofrece la opción de abrir la vista para registrarlo.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Rellena el formulario de factura de venta/cobro a partir de los datos obtenidos del QR.
 * @param {Object} datosVista - Datos necesarios para la función.
 * @param {Element} datosVista.vistaPrincipal - Contenedor principal de la vista.
 * @param {Element} datosVista.contenidoFormulario - Contenedor del formulario a llenar.
 * @param {string} datosVista.prefijoId - Prefijo de los IDs de los campos del formulario.
 * @returns {Function} Función que maneja el llenado del formulario a partir del texto del QR.
 */
export function rellenarFacturaVentaDelQR(datosVista) {
    const { vistaPrincipal, contenidoFormulario, prefijoId } = datosVista;

    return async ({ textoQR, modalScanner, contenedorInformacion }) => {
        const parametros = obtenerParametrosDelQR(textoQR);

        const nit = parametros["nit"];
        const cuf = parametros["cuf"];
        const numero = parametros["numero"];
        // const nit = "875152ss154"; const cuf = "123456789"; const numero = "123456";

        if (!nit || !cuf || !numero) {
            contenedorInformacion.classList.remove("d-none");
            contenedorInformacion.innerHTML = `<span style="font-size: 12px"><b>QR: </b>${textoQR}</span>`;
            return;
        }

        // Ocultar modal del escáner
        const modalInstance = bootstrap.Modal.getInstance(modalScanner);
        if (modalInstance) modalInstance.hide();

        // Llenar campos básicos
        const nfactura = contenidoFormulario.querySelector(`#${prefijoId}-numerofactura`);
        const nautorizacion = contenidoFormulario.querySelector(`#${prefijoId}-nautorizacion`);
        if (nfactura) nfactura.value = numero;
        if (nautorizacion) nautorizacion.value = cuf;

        contenidoFormulario.classList.remove("d-none"); // TODO: ver los tipos de contenedor de formularios

        // Preparar para abrir el formulario de nuevo cliente si no se encuentra
        const menuCliente = obtenerDatosMenuBotones("cliente");
        let existeCliente = menuCliente?.permiso?.[0] === "1" && menuCliente?.permiso?.[1] === "1";
        const abrirVistaCliente = () => {
            if ( !existeCliente )  return;

            const abrirVentana = async() => {
                await abrirFlujoCliente(nit, menuCliente);
            }
            const modal = modalDeConfirmacion(abrirVentana, "No se encontró el cliente. ¿Desea registrarlo ahora?");
            vistaPrincipal.appendChild(modal);
            modal.querySelector("button[data-id='__btn-confirmar']").focus();
        }
        // Manejar búsqueda del cliente
        const selectCliente = contenidoFormulario.querySelector(`#${prefijoId}-cliente`);
        if (selectCliente && selectCliente.selectize) {
            await manejarBusquedaEnSelect(selectCliente.selectize, nit, abrirVistaCliente);
        } else if (selectCliente) {
            abrirVistaCliente();
        }
    };
}
/**
 * Función: Abre el flujo para registrar un nuevo cliente.
 * Descripción: Esta función abre la vista de proveedor-cliente, navega a la pestaña de clientes.
 *              Inicia el registro de un nuevo cliente y llena el campo NIT con el valor proporcionado.
 * Fecha: 25 de enero de 2026
 * Autor: Joel Choque
 */
async function abrirFlujoCliente(nit, menuProv) {
    abrirVentanaMenu("clienteoproveedor");

    const codigoMenu = menuProv.codigo.split("-")[1];

    // Esperar a que el contenedor de la vista aparezca en el DOM
    const contenedorCabecera = await esperarElemento(`.p-2[data-value="clienteoproveedor-${codigoMenu}"] .card-body #contenedor-cabecera`);
    if (contenedorCabecera) {
        const botonCliente = await esperarElemento("button[data-id='cliente']", contenedorCabecera);
        if (botonCliente) {
            botonCliente.click();
            // Esperar botones de acción en la pestaña activada
            const botonRegistro = await esperarElemento("div[data-tab-id='cliente'] [data-id='__btn-registro']", contenedorCabecera.parentElement);
            if (botonRegistro) {
                botonRegistro.click();
                // Esperar al input del formulario y llenarlo
                const inputNit = await esperarElemento("#clientes-nrodocumento", contenedorCabecera);
                if (inputNit) {
                    inputNit.value = nit;
                    inputNit.focus(); // Dar foco para mejor UX
                }
            }
        }
    }
}

// IMAGEN
/**
 * Función: Convierte una imagen desde una URL a base64 con opciones de tamaño y calidad.
 * Descripción: Esta función carga una imagen desde una URL, la redimensiona según las opciones proporcionadas, y la convierte a base64 en el formato más adecuado (PNG o JPEG) según su contenido.
 * Fecha: 29 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Convierte una imagen desde una URL a base64
 * @param {string} url - URL de la imagen a convertir
 * @param {OpcionesImagenBase64} [opciones] - Opciones para la conversión de la imagen
 * @returns {Promise<Object>} Retorna un objeto con la imagen en base64 y metadatos
 */
export async function convertirImagenABase64(url, opciones = {}) {
    const {
        maxWidth = 400,
        maxHeight = 400,
        calidadJPEG = 0.8,
        fallbackBase64 = null
    } = opciones;

    try {

        const response = await fetch(url, { mode: "cors" });

        if (!response.ok) {
            throw new Error("No se pudo cargar la imagen");
        }

        const blob = await response.blob();
        const mimeType = blob.type; // image/png, image/jpeg, etc.

        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = () => {
                // Calcular escala manteniendo proporción
                let width = img.width;
                let height = img.height;

                const scale = Math.min(maxWidth / width, maxHeight / height, 1);
                width = Math.round(width * scale);
                height = Math.round(height * scale);

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Detectar si hay transparencia real
                const imageData = ctx.getImageData(0, 0, width, height).data;
                let tieneAlpha = false;

                for (let i = 3; i < imageData.length; i += 4) {
                    if (imageData[i] < 255) {
                        tieneAlpha = true;
                        break;
                    }
                }

                // Elegir formato óptimo
                let formatoFinal;
                let base64;
                if (tieneAlpha) {
                    // Mantener PNG si hay transparencia
                    formatoFinal = "image/png";
                    base64 = canvas.toDataURL(formatoFinal);
                } else {
                    // Convertir a JPEG optimizado
                    formatoFinal = "image/jpeg";
                    base64 = canvas.toDataURL(formatoFinal, calidadJPEG);
                }

                resolve({
                    base64,
                    formatoFinal,
                    width,
                    height,
                    tieneAlpha,
                    originalMime: mimeType
                });
            };

            img.onerror = () => reject("Error al procesar la imagen");

            img.src = URL.createObjectURL(blob);
        });

    } catch (error) {
        console.warn("Error: Imagen base64");

        return {
            base64: fallbackBase64,
            error: true
        };
    }
}