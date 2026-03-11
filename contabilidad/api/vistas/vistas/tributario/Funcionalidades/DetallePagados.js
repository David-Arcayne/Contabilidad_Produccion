import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { formularioModalAsientoOTransaccion } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getDivisaNombre, getDivisaSimbolo, getEmpresaId, getSucursalId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, botonMostrarAdjunto, cambiarVista, crearElemento, formatoDecimal, formatoFecha, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalManejarRespuestaError, modalValidarFechaSegunGestion } from "../../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos } from "../../../funciones/Solicitudes.js";
import { crearBotonIconoPdfMake } from "../../../funciones/VistaPDF.js";
import { pdfMakeComprobanteGeneral } from "../../cajaYBancos/Funcionalidades/VP_Comprobante.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de Detalle de Pagos.
 *              Permite ver el detalle de los pagos y generar reportes en formato PDF.
 * Fecha: 16 de febrero de 2026
 * Autor: Joel Choque
 */
export function DetallePagados(datosVista) {
    const {
        permisos,
        vistaFacturacionPago,
        vistaDetallePago,
        urlFacturacionPago,
        registroFactura,
        cargarTablaFacturacionPago
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listapagos_individuales/${registroFactura.id}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaDetallePago.append(vistaPrincipal);

    // Crear la sección de cabecera de la vista.
    const regresar = async () => {
        const listaDeRegistros = await obtenerDatos(urlFacturacionPago);
        cargarTablaFacturacionPago(listaDeRegistros);
        cambiarVista(vistaDetallePago, vistaFacturacionPago);
        vistaDetallePago.innerHTML = "";
    }
    const spanFecha = crearElemento("span", { class: "fw-bold" }, [`Fecha: `]);
    const divFecha = crearElemento("div", undefined, [spanFecha, formatoFecha(registroFactura.fecha)]);
    const spanFactura = crearElemento("span", { class: "fw-bold" }, [`Factura: `]);
    const divFactura = crearElemento("div", undefined, [spanFactura, registroFactura.numero || "-"]);
    const spanTransaccion = crearElemento("span", { class: "fw-bold" }, [`Transacción: `]);
    const divTransaccion = crearElemento("div", undefined, [spanTransaccion, registroFactura.codigo || "-"]);
    const spanCliente = crearElemento("span", { class: "fw-bold" }, [`Proveedor: `]);
    const divCliente = crearElemento("div", undefined, [spanCliente, registroFactura.nombrep || "-"]);
    const spanMonto = crearElemento("span", { class: "fw-bold" }, [`Monto ${getDivisaSimbolo()}: `]);
    const divMonto = crearElemento("div", undefined, [spanMonto, formatoDecimal(registroFactura.monto)]);
    const divInformacion = crearElemento("div", { class: "pb-2" }, [divFecha, divFactura, divTransaccion, divCliente, divMonto]);

    const encabezadoVista = seccionEncabezado(
        {
            titulo: "Detalle Pagados",
            textoInformacion: `(Expresado en ${getDivisaNombre()})`,
            elementoAdicional: divInformacion
        },
        { callback: regresar }
    );
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "Fecha",
        "Persona",
        "CI",
        "N° Comprobante",
        "Monto",
        "Saldo",
        "Adjunto",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    vistaPrincipal.append(divTabla);

    // Manejar el listado en la tabla
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
        contenedorAlertas: contenedorDeAlertas,
        cuerpoTabla: tbody,
    });
    // Función para cargar el contenido de la tabla
    function cargarContenidoTabla(listaRegistros) {
        const validado = validarListadoTabla(listaRegistros);
        if ( !validado.valido ) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        const FACTOR = 100;
        let totalMonto = 0;
        let saldo = Math.round(Number(registroFactura.monto ?? 0) * FACTOR);
        for (const registro of listaRegistros) {
            totalMonto += Math.round(parseFloat(registro.monto ?? 0) * FACTOR);
            saldo -= Math.round(parseFloat(registro.monto ?? 0) * FACTOR);

            const celdas = [
                crearElemento("td", undefined, [formatoFecha(registro.fecha) || ""]),
                crearElemento("td", undefined, [registro.persona || ""]),
                crearElemento("td", undefined, [registro.ci || ""]),
                crearElemento("td", undefined, [registro.recibo || ""]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(saldo / FACTOR)]),
                crearElemento("td", { class: "text-center" }, [ botonMostrarAdjunto(vistaPrincipal, registro.nombre_archivo) || "-" ]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);

            // Si el registro no tiene transacción asignada, se resalta la fila y se muestra el botón para su reasignación.
            if (!registro.transaccion || registro.transaccion === "0" || registro.transaccion === 0) {
                fila.classList.add("table-warning");

                if (PUEDE_EDITAR && PUEDE_ESCRIBIR) {
                    const botonReasignar = manejarEstadoAsignacionPagoFactura({
                        URL,
                        vistaPrincipal,
                        contenedorDeAlertas,
                        registro,
                        elementoTd: tdOpciones,
                    });
                    tdOpciones.append(botonReasignar, " ");
                }
            }
            // Botón que permite visualizar el comprobante asociado al registro.
            const botonVerComprobante = crearBotonIconoPdfMake({
                contenedorModal: vistaPrincipal,
                obtenerContenido: pdfMakeComprobanteGeneral(`${URL}listar_comprobantes_de_factura_pago/${registro.id}`, "factura", "pago"),
                tituloBoton: "Comprobante",
            });

            tdOpciones.appendChild(botonVerComprobante);
        }

        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 4,
            columnasFinal: 3,
            valores: [totalMonto / FACTOR]
        });
        fragment.appendChild(filaTotal);

        tbody.replaceChildren(fragment);
    }

    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Permite manejar el estado de asignación de una transacción a un registro de pago.
 * Descripción: Si el registro no tiene una transacción asignada, se muestra un botón para abrir un modal que permite realizar la reasignación.
 *              El formulario del modal tiene las opciones de asignar a una transacción existente o crear una nueva mediante un asiento.
 * Fecha: 05 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Permite manejar el estado de asignación de una transacción a un registro de pago.
 * @param {Object} datosVista - Datos necesarios para la función.
 * @param {string} datosVista.URL - URL base para las solicitudes a la API.
 * @param {HTMLElement} datosVista.vistaPrincipal - Contenedor principal de la vista para agregar el modal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Contenedor donde se mostrarán las alertas de éxito o error.
 * @param {Object} datosVista.registro - Registro del pago que se desea reasignar.
 * @param {HTMLElement} datosVista.elementoTd - Elemento td donde se encuentra el botón de reasignar, para actualizar su estado después de la reasignación.
 * @returns {HTMLElement} Botón para reasignar la transacción.
 */
export function manejarEstadoAsignacionPagoFactura(datosVista) {
    const {
        URL,
        vistaPrincipal,
        contenedorDeAlertas,
        registro,
        elementoTd,
    } = datosVista;

    // Crear el botón para abrir el modal si no existe
    const icono = crearElemento("i", { class: "bi bi-journal-plus" });
    const botonReasignar = crearElemento("button", { class: "btn btn-info btn-sm", title: "Reasignar" }, [icono]);

    // Agregar evento al botón para abrir el modal
    botonReasignar.addEventListener("click", async (e) => {
        const empresa_id = getEmpresaId();
        const sucursal_id = getSucursalId();

        // Obtener el formulario modal con los campos necesarios
        const { form, modal, cerrarModal, botonAsignar } = formularioModalAsientoOTransaccion("docs", undefined, "Reasignar Transacción");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fnBotonInicial = botonEnCarga(botonAsignar);

            const datosFormulario = new FormData(form);
            const objFormulario = Object.fromEntries(datosFormulario.entries());

            if (objFormulario.fecha_transaccion && !await modalValidarFechaSegunGestion(objFormulario.fecha_transaccion, vistaPrincipal)) {
                fnBotonInicial();
                return;
            };

            // Preparar los datos adicionales para enviar
            const datosExtra = {
                ver: "registrar_transaccion_recibo_pago",
                idcuentaspor: registro.id,
                idtransaccion: objFormulario.id_transaccion ?? "",
                asiento: objFormulario.id_asientotipo ?? "",
                glosa: objFormulario.glosa ?? "",
                // fecha: registro.fecha,
                fecha: objFormulario.fecha_transaccion ?? "",
                monto: registro.monto,
                sucursal: sucursal_id,
                empresa: empresa_id,

                cuenta: objFormulario.cuenta ?? "",
                tipo: objFormulario.tipo ?? "",
            };

            const enviado = async () => {
                elementoTd.closest("tr").classList.remove("table-warning");
                botonReasignar.remove();
                alertaDeExito(contenedorDeAlertas, "Reasignación realizada con éxito");
                cerrarModal();
            }
            const error = (respuesta) => {
                if (modalManejarRespuestaError(vistaPrincipal, respuesta)) {
                    fnBotonInicial();
                    return;
                };
                alertaDeError(contenedorDeAlertas, "Ocurrio un error al reasignar la factura");
                cerrarModal();
            }
            // Enviar los datos a la API
            enviarDatosOJson({
                datos: datosExtra,
                urlSolicitud: URL,
                callbackExito: enviado,
                callbackError: error,
            });
        });

        vistaPrincipal.appendChild(modal);
    });

    return botonReasignar;
}