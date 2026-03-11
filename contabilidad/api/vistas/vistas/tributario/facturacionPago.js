import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getSucursalId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { crearBotonIconoPdfMake } from "../../funciones/VistaPDF.js";
import { DetallePagados } from "./Funcionalidades/DetallePagados.js";
import { FacturasPagoSinCuenta } from "./Funcionalidades/FacturasPagoSinCuenta.js";
import { NuevaFactura } from "./Funcionalidades/NuevaFacturaPagos.js";
import { pdfMakeDetallePagados, pdfMakeFacturasDePago } from "./Funcionalidades/ReportesTributario.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de facturación de pagos
 *              Permite registrar nuevas facturas de pagos, ver el detalle de los pagados y generar reportes en formato PDF.
 * Fecha: 16 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaFacturacionPago - Contenedor principal donde se renderiza la vista de facturación de pagos.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function FacturacionPago(permisos, vistaFacturacionPago, datosVistaPrincipal) {
    const SUCURSAL_ID = getSucursalId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}lista_pagar_pagado_factura/${SUCURSAL_ID}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaDetallePago = crearElemento("div", { class: "d-none", "data-pane-id": "detalle-pago" });
    const vistaNuevaFactura = crearElemento("div", { class: "d-none", "data-pane-id": "nueva-factura" });
    vistaFacturacionPago.append(vistaPrincipal, vistaDetallePago, vistaNuevaFactura);

        // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({ titulo: "Listado de Facturas Pagadas" });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Boton para abrir la vista de facturas
    const botonRegistroFacturas = elementoBoton({
        texto: "Registrar facturas",
        icono: "file-earmark-plus",
        id: "trb-fp-btn-nuevoregistro",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaNuevaFactura);
            NuevaFactura({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaFacturacionPago: vistaPrincipal,
                vistaNuevaFactura,
                urlFacturacionPago: URL_LT,
                cargarTablaFacturacionPago: cargarContenidoTabla,
            });
        }
    });
    // Boton para abrir la vista de facturas sin cuenta
    const botonFacturasSinCuenta = elementoBoton({
        texto: "Facturas sin Cuenta",
        icono: "file-earmark",
        id: "trb-fp-btn-sincuenta",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaNuevaFactura);
            FacturasPagoSinCuenta({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaFacturacionPago: vistaPrincipal,
                vistaFacturasSinCuenta: vistaNuevaFactura,
                urlFacturacionPago: URL_LT,
                cargarTablaFacturacionPago: cargarContenidoTabla,
            });
        }
    });
    // Opciones de la vista principal
    const opcionesBtns = divOpcionesVista([
        botonRegistroFacturas,
        botonFacturasSinCuenta,
    ]);
    vistaPrincipal.appendChild(opcionesBtns);

    const encabezadoTabla = [
        "N°",
        "Fecha",
        "N° Factura",
        "N° Trans.",
        "Proveedor",
        "Concepto",
        "Monto",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

    const divFiltros = crearFiltrosTabla({
        obtenerContenidoReporte: pdfMakeFacturasDePago(controladorTabla.getDatosOriginales),
        controladorTabla,
        contenedorPrincipal: vistaPrincipal,
    });
    vistaPrincipal.append(divFiltros, divTabla);

    // Inicialización del controlador de la tabla para gestionar los datos y filtros
    controladorTabla.suscribir("tabla", (lista) => {
        const validado = validarListadoTabla(lista);
        if (!validado.valido) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        let contador = 0;
        let totalMonto = 0;
        for (const item of lista) {
            const registro = item.raw;
            contador++;
            totalMonto += Math.round(parseFloat(registro.monto || 0) * 100);

            const celdas = [
                crearElemento("td", { class: "text-center" }, [contador]),
                crearElemento("td", { class: "text-end" }, [item.fechaTexto]),
                crearElemento("td", undefined, [registro.numero || "-"]),
                crearElemento("td", undefined, [registro.codigo || "-"]),
                crearElemento("td", undefined, [registro.nombrep || "-"]),
                crearElemento("td", undefined, [registro.por_concepto_de || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });
            // Botón para mostrar el detalle de los cobros realizados para la factura seleccionada
            const botonDetalle = botonDetallePagos(
                () => {
                    cambiarVista(vistaPrincipal, vistaDetallePago);
                    DetallePagados({
                        permisos,
                        vistaFacturacionPago: vistaPrincipal,
                        vistaDetallePago: vistaDetallePago,
                        urlFacturacionPago: URL_LT,
                        registroFactura: registro,
                        cargarTablaFacturacionPago: cargarContenidoTabla,
                    });
                }
            );
            // Botón para abir el reporte PDF del estado de cuenta de la factura seleccionada
            const botonReporte = crearBotonIconoPdfMake({
                contenedorModal: vistaPrincipal,
                obtenerContenido: pdfMakeDetallePagados(`${URL}listapagos_individuales/${registro.id}`, registro),
                tituloBoton: "Estado de cuenta",
            });

            tdOpciones.append(botonDetalle, " ", botonReporte);
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, celdas);
            fragment.appendChild(fila);
        }

        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 6,
            columnasFinal: 1,
            valores: [totalMonto / 100]
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
            .filter(registro => Math.abs(parseFloat(registro.saldo || 0)) < 0.01)
            .map(registro => {
                const [anio, mes, dia] = (registro.fecha || "").split("-").map(Number);
                return {
                    raw: registro,
                    fechaBusqueda: { anio, mes, dia },
                    fechaTexto: formatoFecha(registro.fecha) || "-",
                    textoBusqueda: [
                        registro.fecha,
                        registro.numero,
                        registro.codigo,
                        registro.nombrep,
                        registro.por_concepto_de,
                        registro.monto
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
    const divContenedorCabecera = vistaFacturacionPago.closest("#contenedor-cabecera");
    const btnFacturaPagos = divContenedorCabecera.querySelector("[data-id='facturacionpagos']");
    seccionDriverJS(
        [
            {
                element: btnFacturaPagos,
                popover: {
                    title: "Facturación de Pagos",
                    description: "Permite gestionar las facturas de pagos realizadas a los clientes.",
                },
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='trb-fp-btn-nuevoregistro']",
                popover: {
                    title: "Agregar nueva factura",
                    description: "Abre una vista donde se puede registrar una nueva factura y ver las facturas de pago que no están asignadas a una transacción.",
                },
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='trb-fp-btn-sincuenta']",
                popover: {
                    title: "Facturas sin cuenta",
                    description: "Permite gestionar las facturas de pagos que no han sido asignadas a una transacción y a su cuenta contable.",
                },
            },
            {
                mainElement: divFiltros,
                element: "#__buscador",
                popover: {
                    title: "Buscar factura",
                    description: "Permite buscar facturas de pago considerando todas las columnas de la tabla.",
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
                    title: "Tabla de facturas de pagos",
                    description: "Muestra todos los registros de facturas de pagos en el sistema.",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Detalle pagos']",
                popover: {
                    title: "Detalle de pagos",
                    description: "Abre una vista donde se muestra el detalle de los pagos realizados para la factura seleccionada.",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Estado de cuenta']",
                popover: {
                    title: "Estado de cuenta",
                    description: "Permite ver el estado de cuenta de la factura seleccionada, con opción de descarga en formato PDF",
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

// Crear un botón para mostrar el detalle de los pagos
function botonDetallePagos(callback) {
    const icono = crearElemento("i", { class: "bi bi-list-ul" });
    const boton = crearElemento("button", { class: "btn btn-primary btn-sm", title: "Detalle pagos", type: "button" }, [icono]);
    boton.addEventListener("click", (e) => {
        e.preventDefault();
        callback();
    });

    return boton;
}