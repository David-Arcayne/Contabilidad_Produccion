import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getSucursalId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { crearBotonIconoPdfMake } from "../../funciones/VistaPDF.js";
import { DetalleCobrados } from "./Funcionalidades/DetalleCobrados.js";
import { FacturasCobroSinCuenta } from "./Funcionalidades/FacturasCobroSinCuenta.js";
import { NuevaFactura } from "./Funcionalidades/NuevaFacturaCobros.js";
import { pdfMakeDetalleCobrados, pdfMakeFacturasDeCobro } from "./Funcionalidades/ReportesTributario.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de facturación de cobros
 *              Permite registrar nuevas facturas de cobros, ver el detalle de los cobrados y generar reportes en formato PDF.
 * Fecha: 07 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaFacturacionCobro - Contenedor principal donde se renderiza la vista de facturación de cobros.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function FacturacionCobro(permisos, vistaFacturacionCobro, datosVistaPrincipal) {
    const SUCURSAL_ID = getSucursalId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}lista_cobrar_cobrado_factura/${SUCURSAL_ID}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaDetalleCobro = crearElemento("div", { class: "d-none", "data-pane-id": "detalle-cobro" });
    const vistaNuevaFactura = crearElemento("div", { class: "d-none", "data-pane-id": "nueva-factura" });
    vistaFacturacionCobro.append(vistaPrincipal, vistaDetalleCobro, vistaNuevaFactura);

     // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({ titulo: "Listado de Facturas Cobradas" });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Boton para abrir la vista de facturas
    const botonRegistroFacturas = elementoBoton({
        texto: "Registrar facturas",
        icono: "file-earmark-plus",
        id: "trb-fc-btn-nuevoregistro",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaNuevaFactura);
            NuevaFactura({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaFacturacionCobro: vistaPrincipal,
                vistaNuevaFactura,
                urlFacturacionCobro: URL_LT,
                cargarTablaFacturacionCobro: cargarContenidoTabla,
            });
        }
    });
    // Boton para abrir la vista de facturas sin cuenta
    const botonFacturasSinCuenta = elementoBoton({
        texto: "Facturas sin Cuenta",
        icono: "file-earmark",
        id: "trb-fc-btn-sincuenta",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaNuevaFactura);
            FacturasCobroSinCuenta({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaFacturacionCobro: vistaPrincipal,
                vistaFacturasSinCuenta: vistaNuevaFactura,
                urlFacturacionCobro: URL_LT,
                cargarTablaFacturacionCobro: cargarContenidoTabla,
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
        "Cliente",
        "Concepto",
        "Monto",
        "Opciones",
    ];
    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

    const divFiltros = crearFiltrosTabla({
        obtenerContenidoReporte: pdfMakeFacturasDeCobro(controladorTabla.getDatosOriginales),
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
            const botonDetalle = botonDetalleCobros(
                () => {
                    cambiarVista(vistaPrincipal, vistaDetalleCobro);
                    DetalleCobrados({
                        permisos,
                        vistaFacturacionCobro: vistaPrincipal,
                        vistaDetalleCobro,
                        urlFacturacionCobro: URL_LT,
                        registroFactura: registro,
                        cargarTablaFacturacionCobro: cargarContenidoTabla,
                    });
                }
            );
            // Botón para abir el reporte PDF del estado de cuenta de la factura seleccionada
            const botonReporte = crearBotonIconoPdfMake({
                contenedorModal: vistaPrincipal,
                obtenerContenido: pdfMakeDetalleCobrados(`${URL}listapagos/${registro.id}`, registro),
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
    const divContenedorCabecera = vistaFacturacionCobro.closest("#contenedor-cabecera");
    const btnFacturaCobros = divContenedorCabecera.querySelector("[data-id='facturacioncobros']");
    seccionDriverJS(
        [
            {
                element: btnFacturaCobros,
                popover: {
                    title: "Facturación de Cobros",
                    description: "Permite gestionar las facturas de cobros realizadas a los clientes.",
                },
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='trb-fc-btn-nuevoregistro']",
                popover: {
                    title: "Agregar nueva factura",
                    description: "Abre una ventana donde se puede registrar una nueva factura y ver las facturas de cobro que no están asignadas a una transacción.",
                },
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='trb-fc-btn-sincuenta']",
                popover: {
                    title: "Facturas sin cuenta",
                    description: "Permite gestionar las facturas de cobros que no han sido asignadas a una transacción y a su cuenta contable.",
                },
            },
            {
                mainElement: divFiltros,
                element: "#__buscador",
                popover: {
                    title: "Buscar factura",
                    description: "Permite buscar facturas de cobro considerando todas las columnas de la tabla.",
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
                    title: "Tabla de facturas de cobros",
                    description: "Muestra todos los registros de facturas de cobros en el sistema.",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Detalle cobros']",
                popover: {
                    title: "Detalle de cobros",
                    description: "Abre una vista donde se muestra el detalle de los cobros realizados para la factura seleccionada.",
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
        ]
        , vistaPrincipal
    );
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

// Crear un botón para mostrar el detalle de los cobros
function botonDetalleCobros(callback) {
    const icono = crearElemento("i", { class: "bi bi-list-ul" });
    const boton = crearElemento("button", { class: "btn btn-primary btn-sm", title: "Detalle cobros", type: "button" }, [icono]);
    boton.addEventListener("click", (e) => {
        e.preventDefault();
        callback();
    });

    return boton;
}