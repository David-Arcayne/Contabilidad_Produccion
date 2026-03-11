import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId } from "../../funciones/DatosAuxiliares.js";
import { botonMostrarAdjunto, cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, manejarEliminarArchivoDesdeFormulario, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioDocumentoDeCobro } from "./Formularios.js";
import { ContratosDeCobroVencidos } from "./Funcionalidades/CdCVencidos.js";
import { ListaCobrados } from "./Funcionalidades/ListaCobrados.js";
import { pdfMakeContratosDeCobro } from "./Funcionalidades/ReportesContrataciones.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de documentos de cobro
 *              Permite registrar y editar documentos de cobro.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaDocumentoCobro - Contenedor principal donde se renderiza la vista de documentos de cobro.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function DocumentoDeCobro(permisos, vistaDocumentoCobro, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const SUCURSAL_ID = getSucursalId();
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_otras_cuentas_cobrar/${EMPRESA_ID}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaContratosVencidos = crearElemento("div", { class: "d-none", "data-pane-id": "contratos-vencidos" });
    const vistaContratosCobrados = crearElemento("div", { class: "d-none", "data-pane-id": "contratos-cobrados" });
    vistaDocumentoCobro.append(vistaPrincipal, vistaContratosVencidos, vistaContratosCobrados);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Listado de Documentos de Cobro"});
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Botón para ver los contratos vencidos
    const contratosVencidos = elementoBoton({
        texto: "Contratos Vencidos",
        icono: "file-earmark-x",
        id: "doccobro-btn-vencidos",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaContratosVencidos);
            ContratosDeCobroVencidos({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaDocumentosDeCobro: vistaPrincipal,
                vistaContratosVencidos,
                urlDocsDeCobro: URL_LT,
                cargarContenidoTablaDocsDeCobro: cargarContenidoTabla,
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
                camposDeFormulario: formularioDocumentoDeCobro,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nuevo Contrato",
                },
                camposAdicionales: {
                    ver: "registrar_otras_cuentas",
                    empresa: EMPRESA_ID,
                    sucursal: SUCURSAL_ID,
                    clase_otras_cuentas: "2",
                    cobrado: "1",
                    pagado: "0",
                },
            },
            vistaPrincipal,
            { texto: "Nuevo Contrato de Cobro" }
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
        "Cliente",
        "N° Tributario",
        "Representante/Contacto",
        "N° Doc. Identidad",
        "Tipo",
        "Concepto",
        "Condiciones",
        "Observaciones",
        "Precio",
        "Cobrado",
        "Forma de pago",
        "Adjunto",
        "Opciones",
    ];

    const [divTabla, tabla, tbody, footer] = tablaResponsiva(encabezadoTabla, { pieDeTabla: 1 });

    // Crear los filtros de la tabla y la opción para generar el reporte PDF.
    const divFiltros = crearFiltrosTabla({
        obtenerContenidoReporte: pdfMakeContratosDeCobro(controladorTabla.getDatosOriginales),
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
            // Botón para ver los cobros realizados de un documento de cobro
            const listaCobrados = botonListarCobros(
                () => {
                    cambiarVista(vistaPrincipal, vistaContratosCobrados);
                    ListaCobrados({
                        permisos,
                        vistaDocumentosDeCobro: vistaPrincipal,
                        vistaContratosCobrados,
                        urlDocsDeCobro: URL_LT,
                        cargarContenidoTablaDocsDeCobro: cargarContenidoTabla,
                        registro
                    });
                }
            );
            tdOpciones.append(listaCobrados, " ");

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
                    formularioDocumentoDeCobro[formularioDocumentoDeCobro.length -1].opcionesInput = { callback: crearBotonEliminarArchivo };

                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioDocumentoDeCobro,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Contrato de Cobro",
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
                title: "Documentos de Cobro",
                description: "Vista principal para gestionar los documentos de cobro registrados en el sistema.",
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
            element: "[data-id='doccobro-btn-vencidos']",
            popover: {
                title: "Contratos Vencidos",
                description: "Abre una ventana donde se muestran los contratos de cobro que han vencido.",
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
            element: "button[title='Detalle Cobros']",
            popover: {
                title: "Detalle Cobros",
                description: "Abre una ventana para ver los cobros del documento seleccionado.",
            },
        },
        // {
        //     mainElement: tabla,
        //     element: "td a[title='Estado de cuenta']",
        //     popover: {
        //         title: "Estado de cuenta",
        //         description: "Permite ver el estado de cuenta del documento seleccionado, con opción de descarga en formato PDF.",
        //     },
        // },
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
                description: "Permite eliminar el registro del documento seleccionado, previa confirmación. (Solo si no tiene cobros asociados).",
            },
        }
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

// Crea el botón para listar los cobros realizados de un documento de cobro
function botonListarCobros(callback) {
    const icono = crearElemento("i", { class: "bi bi-receipt" });
    const boton = crearElemento("button", {class: "btn btn-primary btn-sm", title: "Detalle Cobros", type: "button"}, [icono]);
    boton.addEventListener("click", () => {
        callback();
    });
    return boton;
}