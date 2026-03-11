import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { botonMostrarAdjunto, cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, formatoDecimal, formatoFecha, manejarEliminarArchivoDesdeFormulario, seccionEncabezado } from "../../../funciones/Funciones.js";
import { botonModalEditar } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { formularioDocumentoDeCobro } from "../Formularios.js";
import { pdfMakeContratosDeCobro } from "./ReportesContrataciones.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de contratos de cobro vencidos.
 * Fecha: 21 de febrero de 2026
 * Autor: Joel Choque
 */
export function ContratosDeCobroVencidos(datosVistaContratos) {
    const {
        codigo,
        permisos,
        vistaDocumentosDeCobro,
        vistaContratosVencidos,
        cargarContenidoTablaDocsDeCobro,
        urlDocsDeCobro,
    } = datosVistaContratos;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_otras_cuentas_cobrar_vencidas/${EMPRESA_ID}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaContratosVencidos.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = async () => {
        const listaDeRegistros = await obtenerDatos(urlDocsDeCobro);
        cargarContenidoTablaDocsDeCobro(listaDeRegistros)
        cambiarVista(vistaContratosVencidos, vistaDocumentosDeCobro)
        vistaContratosVencidos.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({titulo: "Contratos de Cobro Vencidos"}, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "N° Doc.",
        "Lugar",
        "Fecha",
        "Fecha Final",
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
    // Si no tiene permisos ni para editar ni para eliminar, se remueve la columna de opciones
    if (!PUEDE_EDITAR) {
        encabezadoTabla.pop();
    }
    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

    // Crear los filtros de la tabla y la opción para generar el reporte PDF.
    const divFiltros = crearFiltrosTabla({
        obtenerContenidoReporte: pdfMakeContratosDeCobro(controladorTabla.getDatosOriginales, "Contratos de Cobro Vencidos"),
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
                crearElemento("td", { class: "text-end"}, [formatoFecha(registro.fecha) || "-"]),
                crearElemento("td", { class: "text-end"}, [formatoFecha(registro.fecha_venci) || "-"]),
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
                crearElemento("td", undefined, [botonMostrarAdjunto(vistaPrincipal, registro.archivo) || "-"]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
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
                    formularioDocumentoDeCobro[formularioDocumentoDeCobro.length - 1].opcionesInput = { callback: crearBotonEliminarArchivo };

                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioDocumentoDeCobro,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Contrato de Cobro Vencido",
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
                celdas.push(tdOpciones);
            }

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

    // Manejar el listado en la tabla
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
        contenedorAlertas: contenedorDeAlertas,
        cuerpoTabla: tbody,
    });

    ajustarAlturaTabla(divTabla);
}