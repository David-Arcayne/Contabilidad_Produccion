import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { botonMostrarAdjunto, cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, formatoDecimal, formatoFecha, seccionDriverJS } from "../../funciones/Funciones.js";
import { pdfMakeContratosDePago } from "../contrataciones/Funcionalidades/ReportesContrataciones.js";
import { PagarConFactura } from "./Funcionalidades/PagarConFactura.js";
import { PagarDdC } from "./Funcionalidades/PagarDdC.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión pagos de contratos pendientes
 *              Permite realizar los pagos por medio de registro de recibos y facturas, así como generar reportes en PDF.
 * Fecha: 05 de marzo de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaPagarContratos - Contenedor principal donde se renderiza la vista de pagos de contratos.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function PagarContratos(permisos, vistaPagarContratos, datosVistaPrincipal) {
    const URL = CT_URLAPI;
    const EMPRESA_ID = getEmpresaId();
    const URL_LT = `${URL}listar_otras_cuentas_pagar/${EMPRESA_ID}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaPagar = crearElemento("div", { class: "d-none", "data-pane-id": "cobrar" });
    vistaPagarContratos.append(vistaPrincipal, vistaPagar);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "N° Doc.",
        "Lugar",
        "Fecha",
        "Fecha final",
        "Proveedor",
        "N° Tributario",
        "Representante/Contacto",
        "N° Doc. Identidad",
        "Tipo",
        "Concepto",
        "Condiciones",
        "Observaciones",
        "Precio",
        "Pagado",
        "Forma de pago",
        "Adjunto",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

    // Crear los filtros de la tabla y la opción para generar el reporte PDF.
    const divFiltros = crearFiltrosTabla({
        obtenerContenidoReporte: pdfMakeContratosDePago(controladorTabla.getDatosOriginales),
        configuracionPdfMake: {
            orientacion: "landscape",
        },
        controladorTabla,
        contenedorPrincipal: vistaPrincipal,
    });
    vistaPrincipal.append(divFiltros, divTabla);

    // Inicialización del controlador de la tabla para gestionar los datos y filtros
    controladorTabla.suscribir("tabla", (lista) => {
        const validado = validarListadoTabla(lista);
        if ( !validado.valido ) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        let totalPrecio = 0;
        let totalPagado = 0;
        for (const item of lista) {
            const registro = item.raw;
            totalPrecio += Math.round(parseFloat(registro.precio || 0) * 100);
            totalPagado += Math.round(parseFloat(registro.pagado || 0) * 100);

            const celdas = [
                crearElemento("td", undefined, [registro.nro_otras_cuentas || "-"]),
                crearElemento("td", undefined, [registro.lugar || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fecha) || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fecha_venci) || "-"]),
                crearElemento("td", undefined, [registro.nombrep || "-"]),
                crearElemento("td", undefined, [registro.nro_tributario || "-"]),
                crearElemento("td", undefined, [registro.contacto || "-"]),
                crearElemento("td", undefined, [registro.nro_doc_identidad || "-"]),
                crearElemento("td", undefined, [registro.nombre_tipo || "-"]),
                crearElemento("td", undefined, [registro.concepto || "-"]),
                crearElemento("td", undefined, [registro.condiciones || "-"]),
                crearElemento("td", undefined, [registro.observaciones || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.precio)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.pagado)]),
                crearElemento("td", undefined, [registro.forma_pago || "-"]),
                crearElemento("td", { class: "text-center" }, [botonMostrarAdjunto(vistaPrincipal, registro.archivo) || "-"]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });
            // Botón para realiar el pago con recibo
            const botonRecibo = botonPagarConRecibo(
                () => {
                    cambiarVista(vistaPrincipal, vistaPagar);
                    PagarDdC({
                        permisos,
                        vistaPagosDeContrato: vistaPrincipal,
                        vistaPagar,
                        urlPagosDeContrato: URL_LT,
                        registroContrato: registro,
                        cargarTablaPagosDeContrato: cargarContenidoTabla,
                    });
                }
            );
            // Botón para realiar el pago con factura
            const botonFactura = botonPagarConFactura(
                () => {
                    cambiarVista(vistaPrincipal, vistaPagar);
                    PagarConFactura({
                        permisos,
                        vistaPagosDeContrato: vistaPrincipal,
                        vistaPagar,
                        urlPagosDeContrato: URL_LT,
                        registroContrato: registro,
                        cargarTablaPagosDeContrato: cargarContenidoTabla,
                    });
                }
            );

            tdOpciones.append(botonRecibo, " ", botonFactura);
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, celdas);
            fragment.appendChild(fila);
        }

        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 12,
            columnasFinal: 3,
            valores: [totalPrecio/100, totalPagado/100]
        });
        fragment.appendChild(filaTotal);

        tbody.replaceChildren(fragment);
    });

    // Función para cargar el contenido de la tabla con los registros obtenidos
    function cargarContenidoTabla(listaRegistros) {
        if (!Array.isArray(listaRegistros)) {
            controladorTabla.setDatosRegistro(null);
            return;
        }

        const normalizados = listaRegistros
            .map(registro => {
                const [anio, mes, dia] = (registro.fecha || "").split("-").map(Number);
                return {
                    raw: registro,
                    fechaBusqueda: { anio, mes, dia },
                    fechaTexto: formatoFecha(registro.fecha) || "-",
                    textoBusqueda: [
                        registro.nro_otras_cuentas,
                        registro.lugar,
                        formatoFecha(registro.fecha_venci),
                        registro.nombrep,
                        registro.nro_tributario,
                        registro.contacto,
                        registro.nro_doc_identidad,
                        registro.nombre_tipo,
                        registro.concepto,
                        registro.condiciones,
                        registro.observaciones,
                        formatoDecimal(registro.precio),
                        formatoDecimal(registro.pagado),
                        registro.forma_pago,
                    ].join("|").toLowerCase()
                };
            });
        controladorTabla.setDatosRegistro(normalizados);
    }

    // Cargar los datos iniciales en la tabla al cargar la vista
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
        contenedorAlertas: contenedorDeAlertas,
        cuerpoTabla: tbody,
    });

    // Configuración de ayudas visuales de la vista
    seccionDriverJS(
        [
            {
                popover: {
                    title: "Contratos de Pago",
                    description: "Permite gestionar los contratos de pagos pendientes.",
                },
            },
            {
                mainElement: divFiltros,
                element: "#__buscador",
                popover: {
                    title: "Buscar contrato",
                    description: "Permite buscar contratos de pago considerando todas las columnas de la tabla.",
                },
            },
            {
                mainElement: divFiltros,
                element: "#__buscador-fecha",
                popover: {
                    title: "Buscar por fecha",
                    description: "Permite filtrar los registros por las siguientes combinaciones: [día, mes, año] o [mes, año] o solo [año].",
                },
            },
            {
                mainElement: divFiltros,
                element: "#__recargar",
                popover: {
                    title: "Limpiar búsqueda",
                    description: "Elimina los filtros de búsqueda y fecha aplicados, mostrando todos los registros.",
                },
            },
            {
                mainElement: divFiltros,
                element: "#__reporte",
                popover: {
                    title: "Reporte",
                    description: "Permite visualizar y descargar el listado actual de la tabla en un formato PDF.",
                },
            },
            {
                element: divTabla,
                popover: {
                    title: "Tabla de contratos de pagos",
                    description: "Muestra todos los registros de contratos de pagos en el sistema.",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Pagos con Recibo']",
                popover: {
                    title: "Pagos con Recibo",
                    description: "Abre una vista donde se muestra y realiza el registro de pagos con recibo para el contrato seleccionado.",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Pagos con Factura']",
                popover: {
                    title: "Pagos con Factura",
                    description: "Abre una vista donde se muestra y realiza el registro de pagos con factura para el contrato seleccionado.",
                },
            },
        ],
        vistaPrincipal
    );
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

// Crea el botón para listar y realizar los pagos mediante factura de un documento de pago
function botonPagarConFactura(callback) {
    const icono = crearElemento("i", { class: "bi bi-file-earmark-text" });
    const boton = crearElemento("button", {class: "btn btn-success btn-sm", title: "Pagos con Factura", type: "button"}, [icono]);
    boton.addEventListener("click", () => {
        callback();
    });
    return boton;
}

// Crea el botón para listar y realizar los pagos mediante recibo de un documento de pago
function botonPagarConRecibo(callback) {
    const icono = crearElemento("i", { class: "bi bi-receipt" });
    const boton = crearElemento("button", {class: "btn btn-success btn-sm", title: "Pagos con Recibo", type: "button"}, [icono]);
    boton.addEventListener("click", () => {
        callback();
    });
    return boton;
}