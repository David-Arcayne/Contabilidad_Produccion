import { alertaDeError, alertaDeExito } from "./Alertas.js";
import { getDivisaSimbolo } from "./DatosAuxiliares.js";
import { crearElemento, formatoDecimal } from "./Funciones.js";
import { obtenerDatos } from "./Solicitudes.js";


/**
 * Crea una fila con un spinner para mostrar mientras se cargan los datos.
 */
export function crearFilaTablaSpinner(){
    const spinner = crearElemento("div", {class: "spinner-border spinner-border-sm text-primary", role: "status"});
    const texto = crearElemento("span", {role:"status", class:"ms-1"}, ["Cargando..."]);
    const div = crearElemento("div", {class: "d-flex align-items-center justify-content-center fw-bold"}, [spinner, texto]);
    const td = crearElemento("td", {colspan: "100%", class: "text-center"}, [div]);
    const row = crearElemento("tr", undefined, [td]);
    return row;
}

// Crea una fila con un mensaje de error.
export function crearFilaTablaError() {
    const td = crearElemento("td", {colspan: "100%", class: "text-center text-emphasis-danger"}, ["Error al cargar los datos"]);
    const tr = crearElemento("tr", undefined, [td]);
    return tr;
}

/**
 * Función: Crea la estructura responsiva de una tabla con un encabezado, cuerpo y pie de tabla.
 * Descripción: Esta función crea un contenedor "div" con clase "table-responsive" que contiene una tabla con el encabezado, cuerpo y pie de tabla proporcionados.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/** * Crea la estructura responsiva de una tabla con un encabezado, cuerpo y pie de tabla.
 * @param {(String | Object)[]} encabezado - Array con los nombres de las columnas del encabezado de la tabla.
 * @param {DatosCrearTabla} [opciones] - Opciones para crear la estructura de la tabla.
 * @returns {[HTMLDivElement, HTMLTableElement, HTMLTableSectionElement[]|HTMLTableSectionElement, HTMLTableSectionElement[]|HTMLTableSectionElement]} Retorna un array: [div, tabla, [cuerpos], [pies]]
 */
export function tablaResponsiva(encabezado, opciones = {}) {
    const {
        clasesTabla,
        cuerpo = 1,
        cuerpoPrincipal = 0,
        pieDeTabla = 0,
        filaPorDefecto = true,
    } = opciones;

    const tabla = crearTabla(encabezado, { clasesTabla, cuerpo, pieDeTabla });
    const [table, tbody, tfoot] = tabla;
    const div = crearElemento("div", {class: "table-responsive"}, [table]);

    if (filaPorDefecto) {
        // Agregar una fila con un spinner al primer cuerpo "tbody" mientras se cargan los datos
        const spinner = crearFilaTablaSpinner();
        const cuerpo = Array.isArray(tbody) ? tbody[cuerpoPrincipal] : tbody;
        cuerpo.replaceChildren(spinner);
    }

    return [div, ...tabla];
}

/**
 * Función: Ajusta la altura del contenedor "div" de una tabla responsiva.
 * Descripción: Esta función ajusta la altura del contenedor "div" de una tabla responsiva en función del tamaño del contenedor padre con clase "card-body".
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/** Ajusta la altura del contenedor "div" de una tabla responsiva.
 * @param {HTMLDivElement} div - Contenedor "div" de la tabla.
 * @param {number} [alturaMinima] - Altura mínima en píxeles para el contenedor "div" de la tabla.
 */
export function ajustarAlturaTabla (div, alturaMinima) {
    const body = div.closest(".card-body");
    if (body) {
        const altura = body.offsetHeight  - (div.offsetTop);
        let minHeight = "";
        if (alturaMinima) {
            minHeight = `min-height: ${alturaMinima}px`;
        }
        if (altura > 260) {
            div.setAttribute("style", `max-height: ${altura + 30}px; ${minHeight}`);
        }else {
            div.setAttribute("style", `max-height: 290px; min-height: 290px`);
        }
    }
}

/**
 * Función: Crea una tabla con un encabezado, cuerpo y pie de tabla.
 * Descripción: Esta función crea una tabla con un encabezado y varios cuerpos y/o pies de tabla.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/** Crea una tabla con un encabezado y varios cuerpos y/o pies de tabla.
 * @param {(String | Object)[]} encabezado - Array con los datos del encabezado.
 * @param {{clasesTabla?, cuerpo?, pieDeTabla?}} [opciones] - Opciones para crear la tabla.
 * @returns {[HTMLTableElement, HTMLTableSectionElement[]|HTMLTableSectionElement, HTMLTableSectionElement[]|HTMLTableSectionElement]} Retorna un array con la tabla creada, un array con los cuerpos "tbody" y un array con los pies "tfoot".
 */
export function crearTabla(encabezado, opciones = {}) {
    const {
        clasesTabla,
        cuerpo = 1,
        pieDeTabla = 0,
    } = opciones;

    const thead = crearEncabezadoTabla(encabezado);

    const tbodies = Array.from({ length: cuerpo }, () => crearElemento("tbody"));
    const tfoots = Array.from({ length: pieDeTabla }, () => crearElemento("tfoot"));

    const table = crearElemento(
        "table",
        { class: clasesTabla ?? "table table-bordered table-hover align-middle mb-0" },
        [thead, ...tbodies, ...tfoots]
    );

    return [
        table,
        tbodies.length === 1 ? tbodies[0] : tbodies,
        tfoots.length === 1 ? tfoots[0] : tfoots
    ];
}
/**
 * Crea el encabezado de una tabla.
 * @param {Array<String | Object>} encabezado - Array con los datos del encabezado.
 * @returns {HTMLElement} Elemento "thead" con el encabezado de la tabla.
 */
function crearEncabezadoTabla (encabezado) {
    const tr = crearElemento("tr");
    encabezado.forEach((datos) => {
        if (typeof(datos) === "string") {
            tr.append(crearElemento("th", { class: "text-nowrap" }, [datos]));
        } else {
            const { nombre, clases = "text-nowrap", ...atributos } = datos;
            tr.append(crearElemento("th", { class: clases, ...atributos }, [nombre]));
        }
    });
    const thead = crearElemento("thead", { class: "table-dark z-3" }, [tr]);
    return thead;
}

/**
 * Función: Manejar la carga de datos en una tabla desde una API.
 * Descripción: Esta función obtiene datos desde una URL de API y utiliza un callback para cargar esos datos en una tabla.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Manejar la carga de datos en una tabla desde una API.
 * @param {OpcionesListadoTabla} opciones - Opciones para manejar la carga de datos.
 */
export async function manejarListadoTabla(opciones) {
    const { urlSolicitud, callbackCargarTabla, cuerpoTabla, contenedorAlertas, mensajeDeExito, mensajeDeError } = opciones || {};

    const registros = await obtenerDatos(urlSolicitud);
    if (registros) {
        if (registros.length == 0) {
            const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
            const tr = crearElemento("tr", undefined, [td]);
            cuerpoTabla.replaceChildren(tr);
            return;
        }
        // Ejecutar el callback para cargar los datos en la tabla
        await callbackCargarTabla(registros);

        if (contenedorAlertas && mensajeDeExito) {
            alertaDeExito(contenedorAlertas, mensajeDeExito)
        }
    } else {
        if (contenedorAlertas) {
            alertaDeError(contenedorAlertas, mensajeDeError ?? "Ocurrio un error al cargar los registros");
        }
        cuerpoTabla.replaceChildren(crearFilaTablaError());
    }
}

/**
 * Función: Validar el listado de registros para una tabla.
 * Descripción: Esta función valida si el listado de registros es un array válido y si contiene registros.
 *              Si no es válido, retorna una fila de error o con un texto de información.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Valida el listado de registros para una tabla.
 * @param {Object[] | any} registros - Listado de registros a validar.
 * @returns {{valido: boolean, fila: HTMLTableRowElement, estado: "void" | "success" | "error"}} Retorna un objeto con la validación del listado de registros, una fila para mostrar en la tabla y el estado de la validación.
 */
export function validarListadoTabla(registros) {
    if (Array.isArray(registros)) {
        if (!registros.length) {
            const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
            const tr = crearElemento("tr", undefined, [td]);
            return { valido: false, fila: tr, estado: "void" };
        }
        return { valido: true, fila: null, estado: "success" };
    } else {
        return { valido: false, fila: crearFilaTablaError(), estado: "error" };
    }
}

/**
 * Función: Crea una fila de total para una tabla.
 * Descripción: Esta función crea una fila "tr" que muestra los totales en una tabla, con las columnas especificadas.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Crea una fila de total para una tabla.
 * @param {DatosFilaTablaTotal} datos - Configuración para crear la fila de total.
 * @returns {HTMLTableRowElement}
 */
export function crearFilaTotalTabla(datos) {
    const { columnasTexto, columnasFinal, valores } = datos;
    const simboloDivisa = getDivisaSimbolo();

    const celdasValores = valores.map(valor => crearElemento("td", { class: "text-end" }, [formatoDecimal(valor)]) );

    const filaTotales =  crearElemento("tr", { class: "fw-bold totales" }, [
        crearElemento( "td", { colSpan: columnasTexto, class: "text-end" }, [`Total ${simboloDivisa}:`] ),
        ...celdasValores,
    ]);

    if (columnasFinal) {
        filaTotales.appendChild(
            crearElemento("td", { colSpan: columnasFinal })
        )
    }

    return filaTotales;
}