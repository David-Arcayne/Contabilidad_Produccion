import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId } from "../../funciones/DatosAuxiliares.js";
import { botonMostrarAdjunto, cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, manejarEliminarArchivoDesdeFormulario, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioDocumentoDePago } from "./Formularios.js";
import { ContratosDePagoVencidos } from "./Funcionalidades/CdPVencidos.js";
import { ListaPagados } from "./Funcionalidades/ListaPagados.js";
import { pdfMakeContratosDePago } from "./Funcionalidades/ReportesContrataciones.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de contratos de pago.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaDocumentoPago - Contenedor principal donde se renderiza la vista de documentos de pago.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function DocumentoDePago(permisos, vistaDocumentoPago, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const SUCURSAL_ID = getSucursalId();
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_otras_cuentas_pagar/${EMPRESA_ID}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaContratosVencidos = crearElemento("div", { class: "d-none", "data-pane-id": "contratos-vencidos" });
    const vistaContratosPagados = crearElemento("div", { class: "d-none", "data-pane-id": "contratos-pagados" });
    vistaDocumentoPago.append(vistaPrincipal, vistaContratosVencidos, vistaContratosPagados);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Listado de Documentos de Pago"});
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Botón para ver los contratos vencidos
    const contratosVencidos = elementoBoton({
        texto: "Contratos Vencidos",
        icono: "file-earmark-x",
        id: "docpago-btn-vencidos",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaContratosVencidos);
            ContratosDePagoVencidos({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaDocumentosDePago: vistaPrincipal,
                vistaContratosVencidos,
                urlDocsDePago: URL_LT,
                cargarContenidoTablaDocsDePago: cargarContenidoTabla,
            });
        }
    });
    // Creación de formulario para la vista Registrar
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioDocumentoDePago,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nuevo Contrato",
                },
                camposAdicionales: {
                    ver: "registrar_otras_cuentas",
                    empresa: EMPRESA_ID,
                    sucursal: SUCURSAL_ID,
                    clase_otras_cuentas: "1",
                    cobrado: "0",
                    pagado: "1",
                },
            },
            vistaPrincipal,
            { texto: "Nuevo Contrato de Pago" }
        );
        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonRegistrar,
            contratosVencidos,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    } else {
        vistaPrincipal.appendChild(contratosVencidos);
    }

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

    const [divTabla, tabla, tbody, footer] = tablaResponsiva(encabezadoTabla, { pieDeTabla: 1 });

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
            // Botón para ver los pagos realizados de un documento de pago
            const listaPagados = botonListarPagos(
                () => {
                    cambiarVista(vistaPrincipal, vistaContratosPagados);
                    ListaPagados({
                        permisos,
                        vistaDocumentosDePago: vistaPrincipal,
                        vistaContratosPagados: vistaContratosPagados,
                        urlDocsDePago: URL_LT,
                        cargarContenidoTablaDocsDePago: cargarContenidoTabla,
                        registro
                    });
                }
            );
            tdOpciones.append(listaPagados, " ");

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                if (PUEDE_EDITAR) {
                    // Crear el botón para eliminar el archivo adjunto desde el formulario de edición
                    const crearBotonEliminarArchivo = manejarEliminarArchivoDesdeFormulario({
                        contenedorDeAlertas,
                        vistaPrincipal,
                        cargarContenidoTabla,
                        urlListadoTabla: URL_LT,
                        llaves: {
                            archivo: "archivo",
                            idRegistro: "idotras_cuentas"
                        }
                    });
                    // Agregar la opción de eliminar archivo al formulario de edición
                    formularioDocumentoDePago[formularioDocumentoDePago.length -1].opcionesInput = { callback: crearBotonEliminarArchivo };

                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioDocumentoDePago,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Contrato de Pago",
                            },
                            camposAdicionales: {
                                ver: "editar_otras_cuentas",
                                idotras_cuentas: registro.idotras_cuentas,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    tdOpciones.append(botonEditar, " ");
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}eliminar_otras_cuentas/${registro.idotras_cuentas}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                        },
                        vistaPrincipal
                    );
                    tdOpciones.append(botonEliminar, " ");
                }
            }
            celdas.push(tdOpciones);
            const fila = crearElemento("tr", undefined, [ ...celdas]);
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

    // Manejar el listado en la tabla
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
        contenedorAlertas: contenedorDeAlertas,
        cuerpoTabla: tbody,
    });

    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            popover: {
                title: "Documentos de Pago",
                description: "Vista principal para gestionar los documentos de pago registrados en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Agregar documento",
                description: "Abre un formulario para registrar un nuevo documento en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='docpago-btn-vencidos']",
            popover: {
                title: "Contratos Vencidos",
                description: "Abre una ventana donde se muestran los contratos de pago que han vencido.",
            },
        },
        {
            mainElement: divFiltros,
            element: "#__buscador",
            popover: {
                title: "Buscar documento",
                description: "Permite buscar documentos considerando todos los campos disponibles.",
            },
        },
        {
            mainElement: divFiltros,
            element: "#__buscador-fecha",
            popover: {
                title: "Buscar por fecha",
                description: "Permite filtrar los registros por el campo 'Fecha' y no así por 'Fecha final'. (Se puede filtrar por todos los campos, solo por fecha y año, o solo por año).",
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
                title: "Tabla de documentos",
                description: "Muestra todos los documentos registrados en el sistema, que no tienen saldo pendiente.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Detalle Pagos']",
            popover: {
                title: "Detalle Pagos",
                description: "Abre una ventana para ver los pagos del documento seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar documento",
                description: "Abre un formulario para modificar los datos del documento seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar documento",
                description: "Permite eliminar el registro del documento seleccionado, previa confirmación. (Solo si no tiene pagos asociados).",
            },
        }
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

// Crea el botón para listar los pagos realizados de un documento de pago
function botonListarPagos(callback) {
    const icono = crearElemento("i", { class: "bi bi-receipt" });
    const boton = crearElemento("button", {class: "btn btn-primary btn-sm", title: "Detalle Pagos", type: "button"}, [icono]);
    boton.addEventListener("click", () => {
        callback();
    });
    return boton;
}