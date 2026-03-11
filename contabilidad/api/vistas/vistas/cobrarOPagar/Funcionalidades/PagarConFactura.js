import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getDivisaSimbolo, getEmpresaId, getSucursalId, getUsuarioId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, botonMostrarAdjunto, cambiarVista, crearElemento, crearEstadoCajaBancos, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, manejarLlenadoCajaBancos, seccionEncabezado, verificarOpcionCajaBanco } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion, modalDeInformacion, modalFijo, modalManejarRespuestaError, modalValidarFechaSegunGestion } from "../../../funciones/Modals.js";
import { manejarEnvioFormulario, obtenerDatos, reiniciarFormulario, VerificarFormulario } from "../../../funciones/Solicitudes.js";
import { crearBotonIconoPdfMake, crearBotonReportePdfMake } from "../../../funciones/VistaPDF.js";
import { bloquearSufijoEnInput } from "../../cajaYBancos/Formularios.js";
import { pdfMakeComprobanteGeneral } from "../../cajaYBancos/Funcionalidades/VP_Comprobante.js";
import { formularioPagoContratoConFactura } from "../Formularios.js";
import { pdfMakePagosContratoConFactura } from "./ReportesCobroPago.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de pagos de contrato con factura
 *              Permite ver y administrar los pagos pendientes de un contrato, así como generar reportes en PDF.
 * Fecha: 07 de marzo de 2026
 * Autor: Joel Choque
 */
export async function PagarConFactura(datosVista) {
    const {
        permisos,
        vistaPagosDeContrato,
        vistaPagar,
        urlPagosDeContrato,
        registroContrato,
        cargarTablaPagosDeContrato,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_factura_otras_cuentas/${registroContrato.idotras_cuentas}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaPagar.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = async () => {
        const formulario = vistaPrincipal.querySelector("#form-registro");
        const camposConValor = formulario ? VerificarFormulario(formulario) : 0;

        const listaDeRegistros = await obtenerDatos(urlPagosDeContrato);
        if (camposConValor > 0) {
            const modal = modalDeConfirmacion(
                () => {
                    cargarTablaPagosDeContrato(listaDeRegistros);
                    cambiarVista(vistaPagar, vistaPagosDeContrato)
                    vistaPagar.innerHTML = "";
                },
                "Se perderán los datos ingresados. ¿Desea continuar?",
                undefined, undefined, undefined, () => {
                    const modalFormulario = vistaPrincipal.querySelector("[data-id='modal-pagocon-factura']");
                    if (modalFormulario) {
                        modalFormulario.classList.remove("d-none");
                    }
                }
            );
            vistaPagar.appendChild(modal);
            return;
        }
        cargarTablaPagosDeContrato(listaDeRegistros);
        cambiarVista(vistaPagar, vistaPagosDeContrato)
        vistaPagar.innerHTML = "";
    }

    const textoNombre = `<span class="fw-bold">Proveedor: </span>${registroContrato.nombrep || ""}`;
    const divNombre = crearElemento("div");
    divNombre.innerHTML = textoNombre;
    const spanMonto = crearElemento("span", { class: "fw-normal", id: "pagar_ddpcf_span_saldo" }, [formatoDecimal(registroContrato.precio)])
    const divMonto = crearElemento("div", { class: "fw-bold" }, [`Monto ${getDivisaSimbolo() || ""}: `, spanMonto]);
    const divL = crearElemento("div", undefined, [divNombre, divMonto]);
    const divR = crearElemento("div", { class: "text-end" });
    const divColumnas = crearElemento("div", { class: "d-flex justify-content-between align-items-start" }, [divL, divR]);
    const divInformacion = crearElemento("div", { class: "pt-3" }, [divColumnas]);
    const encabezadoVista = seccionEncabezado({ titulo: "Facturas de Pago", alinearTitulo: "start", elementoAdicional: divInformacion }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    // Obtención de datos de la gestión actual para mostrar en la vista y validar las fechas.
    const datoGA = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);
    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datoGA.nombre} (${formatoFecha(datoGA.fechaini)} a ${formatoFecha(datoGA.fechafin)})`]);
        const textGA = crearElemento("p", { style: "font-size: 14px;" }, ["Gestión Activa: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-end" }, [textGA])
        divR.appendChild(gestionActiva);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        vistaPagar.appendChild(h1);
        return;
    }
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Botón para abir el reporte PDF del estado de cuenta de la factura seleccionada
    const botonReporte = crearBotonReportePdfMake({
        contenedorModal: vistaPrincipal,
        obtenerContenido: pdfMakePagosContratoConFactura(URL_LT, registroContrato),
        botonTexto: "Estado de Cuenta",
    });
    let arrayOpcionesBtn = [botonReporte];
    // Creación de formulario para la vista Registrar
    if (PUEDE_ESCRIBIR) {
        const modalRegistro = modalFormularioPagoConFactura({
            vistaPrincipal,
            contenedorDeAlertas,
            URL_LT,
            cargarContenidoTabla,
            registroContrato,
            gestionActual: datoGA,
        });
        vistaPrincipal.appendChild(modalRegistro);
        const botonRegistrar =  elementoBoton({ texto: "Nuevo registro", icono: "plus-lg", id: "__btn-registro", callback: () => {
            modalRegistro.classList.remove("d-none");
        }})

        arrayOpcionesBtn.unshift(botonRegistrar);
    }
    // Opciones de la vista principal
    const opcionesBtns = divOpcionesVista(arrayOpcionesBtn);
    vistaPrincipal.appendChild(opcionesBtns);

    const encabezadoTabla = [
        "Fecha",
        "N° Factura",
        "N° Trans.",
        "Proveedor",
        "Concepto",
        "Monto",
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
        for (const registro of listaRegistros) {
            totalMonto += Math.round(parseFloat(registro.montofactura ?? 0) * FACTOR);

            const botonAdjunto = botonMostrarAdjunto(vistaPrincipal, registro.archivo);

            const celdas = [
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fecha) || "-"]),
                crearElemento("td", undefined, [registro.nfactura || "-"]),
                crearElemento("td", undefined, [registro.codigotransaccion || "-"]),
                crearElemento("td", undefined, [registro.prov_client || "-"]),
                crearElemento("td", undefined, [registro.por_concepto_de || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montofactura)]),
                crearElemento("td", { class: "text-center" },
                    botonAdjunto ? [botonAdjunto, " ", botonEliminarAdjunto(contenedorDeAlertas, vistaPrincipal, registro, cargarContenidoTabla, URL_LT)] : ["-"]
                ),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);

            // Botón que permite visualizar el comprobante asociado al registro.
            if (registro.idcomprobante) {
                const botonVerComprobante = crearBotonIconoPdfMake({
                    contenedorModal: vistaPrincipal,
                    obtenerContenido: pdfMakeComprobanteGeneral(`${URL}listar_comprobantes_de_factura_pago/${registro.idcomprobante}`, "factura", "pago"),
                    tituloBoton: "Comprobante",
                });
                tdOpciones.append(botonVerComprobante, " ");
            }
        }

        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 6,
            columnasFinal: 3,
            valores: [totalMonto / FACTOR]
        });
        fragment.appendChild(filaTotal);

        tbody.replaceChildren(fragment);
    }

    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE LA VISTA
// =========================================================

/**
 * Función: Crea un modal con el formulario para registrar un pago con factura.
 * Descripción: Esta función genera un modal que contiene el formulario necesario para registrar un pago con factura que puede ser asociada a una transacción.
 *              Maneja la lógica de envío del formulario y la verificación de montos en Cajas y Bancos si corresponde.
 * Fecha: 07 de marzo de 2026
 * Autor: Joel Choque
 */
function modalFormularioPagoConFactura({
    vistaPrincipal,
    contenedorDeAlertas,
    URL_LT,
    cargarContenidoTabla,
    registroContrato,
    gestionActual,
}) {
    const [modal, cuerpoModal, cerrarModal] = modalFijo( { tituloModal: "Registro de Pago con Factura", estiloModal: "width: 100%; max-width: 1400px;" } );

    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const PREFIJO_ID = "tccpagoconfactura";
    const estadoCajaBancos = crearEstadoCajaBancos(vistaPrincipal, PREFIJO_ID); // Estado para manejar los datos de Cajas y Bancos

    // Funcion que se ejecuta al cancelar el registro.
    const cancelarRegistro = (evento, formulario) => {
        evento.preventDefault();
        reiniciarFormulario(formulario);
        estadoCajaBancos.limpiar();
        cerrarModal();
    }
    // Agregar el formulario al modal.
    const nuevoformulario = crearFormulario(formularioPagoContratoConFactura({ registroContrato }), {
        opcionesParaBotones: {
            clasesEnviar: "btn btn-primary px-1 px-sm-4",
            nombreEnviar: "Guardar",
            callbackCancelar: vistaPrincipal ? cancelarRegistro : null,
        },
    });
    nuevoformulario.id = "form-registro"; // Asignar un ID al formulario para facilitar su manipulación, [ crearEstadoCajaBancos() lo requiere ]
    (async () => { // Manejar el bloqueo del campo de concepto como sufijo
        const concepto = nuevoformulario.querySelector(`#${PREFIJO_ID}-concepto`);
        const valorConcepto = concepto.value;

        if (valorConcepto) {
            concepto.setAttribute("data-suffix", valorConcepto);
            bloquearSufijoEnInput(concepto);
        }
    })();

    // Gestiona el llenado y la lógica del formulario de Cajas y Bancos, así como el manejo del modal de Cajas y Bancos.
    manejarLlenadoCajaBancos(nuevoformulario, vistaPrincipal, estadoCajaBancos, PREFIJO_ID);

    cuerpoModal.appendChild(nuevoformulario);

    // ACCIONES CAMPOS FORMULARIO
    const botonEnviar = nuevoformulario.querySelector("#btn-enviar-formulario")
    nuevoformulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fnBotonInicial = botonEnCarga(botonEnviar);

        // validar la fecha de factura y de transacción según la gestión
        if (!await validarCamposFormulario(vistaPrincipal, nuevoformulario, PREFIJO_ID, gestionActual)) {
            fnBotonInicial();
            return;
        }

        // Verificar que se haya asignado (si corresponde) el monto en Cajas y Bancos, y obtener los datos asignados.
        const esCorrecto = await verificarOpcionCajaBanco(vistaPrincipal, estadoCajaBancos, nuevoformulario, PREFIJO_ID, "sin_estado");
        let idcajas_bancos = ""
        if (typeof(esCorrecto) === "string") {
            idcajas_bancos = esCorrecto;
        } else if (esCorrecto === false){
            fnBotonInicial();
            return;
        }

        const montoRegistro = nuevoformulario.querySelector(`#${PREFIJO_ID}-montofactura`)?.value;

        // Funcion que se ejecuta al realizar el registro.
        const realizarRegistro = async () => {
            estadoCajaBancos.limpiar();

            const listaDeRegistros = await obtenerDatos(URL_LT);
            cargarContenidoTabla(listaDeRegistros);
            alertaDeExito(contenedorDeAlertas, "Factura de pago registrada exitosamente");
            cerrarModal();
        }
        // Funcion que se ejecuta al no poder realizar el registro.
        const errorRegistro = (respuestaSolicitud) => {
            if (modalManejarRespuestaError(vistaPrincipal, respuestaSolicitud)) return;
            cerrarModal();
            alertaDeError(contenedorDeAlertas, "No se pudo registrar la factura de pago");
        };

        // Envío de datos
        fnBotonInicial(); // Poner el botón a su estado oiginal, ya que manejarEnvioFormulario también controla el estado del botón.
        manejarEnvioFormulario({
            refFormulario: nuevoformulario,
            urlSolicitud: CT_URLAPI,
            camposAdicionales: {
                ver: "registrar_factura_pago_otras_cuentas",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                idotras_cuentas: registroContrato.idotras_cuentas,
                usuario: USUARIO_ID,
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,
                cobrado: "0",
                pagado: "1",
                codigocontrol: "0",
                clasefactura: "1",
                especificacion: "1",

                idcajas_bancos: idcajas_bancos,
            },
            camposCondicionales: [
                { nombre: "asiento", valor: "" },
                { nombre: "trans", valor: "" },
                { nombre: "tipo", valor: "" },
                { nombre: "cuenta", valor: "" },
                { nombre: "fecha_transaccion", valor: "" },
            ],
            callbackExito: realizarRegistro,
            callbackError: errorRegistro
        });
    });

    modal.dataset.id = "modal-pagocon-factura";
    return modal;
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea un botón para eliminar el archivo adjunto de un registro de factura de pago.
 * Descripción: Crea un botón que muestra un modal de confirmación para eliminar el archivo adjunto asociado a un registro de factura de pago.
 * Fecha: 07 de marzo de 2026
 * Autor: Joel Choque
 */
function botonEliminarAdjunto(contenedorDeAlertas, contenedorModal, registro, cargarContenidoTabla, URL_LISTAR) {
    const iconoEliminar = crearElemento("i", {class: "bi bi-trash3"});
    const botonEliminar = crearElemento("button", {class: "btn btn-sm btn-outline-danger px-1", title: "Eliminar Archivo Adjunto"}, [iconoEliminar]);
    botonEliminar.addEventListener("click", async () => {
        const eliminar = async () => {
            // Funcion que se ejecuta al eliminar el registro.
            const callbackExito = async(respuesta) => {
                const listaDeRegistros = await obtenerDatos(URL_LISTAR);
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Archivo eliminado con éxito");
            }
            // Funcion que se ejecuta al no poder eliminar el registro.
            const callbackError = (respuesta) => {
                alertaDeError(contenedorDeAlertas, "No se pudo eliminar el archivo");
            }
            // Envío de datos para eliminar el archivo adjunto
            await manejarSolicitudEliminacion({
                urlSolicitud: `${CT_URLAPI}eliminar_archivo_adjunto/${registro.idcomprobante}/comprobante_pago`,
                callbackError,
                callbackExito,
            });
        }

        const modal = modalDeConfirmacion(eliminar, "¿Está seguro que desea eliminar el archivo adjunto?");
        contenedorModal.appendChild(modal);
    });
    return botonEliminar;
}


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

/**
 * Función: Valida los campos del formulario de pago de contrato con factura.
 * Descripción: Esta función verifica que las fechas ingresadas corresponda a la gestión actual.
 *              Si alguna validación falla, se muestra un modal de información con el error correspondiente.
 * Fecha: 07 de marzo de 2026
 * Autor: Joel Choque
 */
async function validarCamposFormulario(vista, form, prefijoId, gestion) {
    const fecha = form.querySelector(`#${prefijoId}-fecha`);
    if (fecha.value < gestion.fechaini || fecha.value > gestion.fechafin) {
        const modal = modalDeInformacion("La fecha no corresponde a la gestión actual");
        vista.appendChild(modal);
        return false;
    }

    const fechaTransaccion = form.querySelector(`#${prefijoId}-fechatrans`);
    if (fechaTransaccion?.value && !await modalValidarFechaSegunGestion(fechaTransaccion.value, vista, gestion)) {
        return false;
    }

    return true;
}