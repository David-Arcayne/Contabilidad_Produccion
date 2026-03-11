import { alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getDivisaSimbolo, getEmpresaId, getSucursalId, getUsuarioId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, botonMostrarAdjunto, cambiarVista, crearElemento, crearEstadoCajaBancos, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, manejarEliminarArchivoDesdeFormulario, manejarLlenadoCajaBancos, seccionEncabezado, verificarOpcionCajaBanco } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion, modalDeInformacion, modalFijo, modalManejarRespuestaError, modalValidarFechaSegunGestion } from "../../../funciones/Modals.js";
import { botonModalEditar } from "../../../funciones/OpcionesBasicas.js";
import { manejarEnvioFormulario, obtenerDatos, reiniciarFormulario, VerificarFormulario } from "../../../funciones/Solicitudes.js";
import { crearBotonIconoPdfMake, crearBotonReportePdfMake } from "../../../funciones/VistaPDF.js";
import { bloquearSufijoEnInput } from "../../cajaYBancos/Formularios.js";
import { pdfMakeComprobanteGeneral } from "../../cajaYBancos/Funcionalidades/VP_Comprobante.js";
import { manejarEstadoAsignacionCobroFactura } from "../../tributario/Funcionalidades/DetalleCobrados.js";
import { formularioCobroContratoConRecibo } from "../Formularios.js";
import { modalEditarCajaBancoDeCobro } from "./CobrarFactura.js";
import { pdfMakeCobrosContratoConRecibo } from "./ReportesCobroPago.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de cobros de contrato con recibo
 *              Permite ver y administrar los cobros pendientes de un contrato, así como generar reportes en PDF.
 * Fecha: 05 de marzo de 2026
 * Autor: Joel Choque
 */
export async function CobrarDdC(datosVista) {
    const {
        permisos,
        vistaCobrosDeContrato,
        vistaCobrar,
        urlCobrosDeContrato,
        registroContrato,
        cargarTablaCobrosDeContrato,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_recibo_otras_cuentas/${registroContrato.idotras_cuentas}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaCobrar.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = async () => {
        const formulario = vistaPrincipal.querySelector("#form-registro");
        const camposConValor = formulario ? VerificarFormulario(formulario) : 0;

        const listaDeRegistros = await obtenerDatos(urlCobrosDeContrato);
        if (camposConValor > 0) {
            const modal = modalDeConfirmacion(
                () => {
                    cargarTablaCobrosDeContrato(listaDeRegistros);
                    cambiarVista(vistaCobrar, vistaCobrosDeContrato)
                    vistaCobrar.innerHTML = "";
                },
                "Se perderán los datos ingresados. ¿Desea continuar?",
                undefined, undefined, undefined, () => {
                    const modalFormulario = vistaPrincipal.querySelector("[data-id='modal-cobrocon-recibo']");
                    if (modalFormulario) {
                        modalFormulario.classList.remove("d-none");
                    }
                }
            );
            vistaCobrar.appendChild(modal);
            return;
        }
        cargarTablaCobrosDeContrato(listaDeRegistros);
        cambiarVista(vistaCobrar, vistaCobrosDeContrato)
        vistaCobrar.innerHTML = "";
    }
    const textoNombre = `<span class="fw-bold">Cliente: </span>${registroContrato.nombrep || ""}`;
    const divNombre = crearElemento("div");
    divNombre.innerHTML = textoNombre;
    const spanMonto = crearElemento("span", { class: "fw-normal", id: "cdc-cobros-span-saldo" }, [formatoDecimal(registroContrato.precio)])
    const divMonto = crearElemento("div", { class: "fw-bold" }, [`Monto ${getDivisaSimbolo() || ""}: `, spanMonto]);
    const divL = crearElemento("div", undefined, [divNombre, divMonto]);
    const divR = crearElemento("div", { class: "text-end" });
    const divColumnas = crearElemento("div", { class: "d-flex justify-content-between align-items-start" }, [divL, divR]);
    const divInformacion = crearElemento("div", { class: "pt-3" }, [divColumnas]);
    const encabezadoVista = seccionEncabezado({ titulo: "Recibos de Cobro", alinearTitulo: "start", elementoAdicional: divInformacion }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    // Obtención de datos de la gestión actual para mostrar en la vista y validar las fechas de los cobros.
    const datoGA = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);
    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datoGA.nombre} (${formatoFecha(datoGA.fechaini)} a ${formatoFecha(datoGA.fechafin)})`]);
        const textGA = crearElemento("p", { style: "font-size: 14px;" }, ["Gestión Activa: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-end" }, [textGA])
        divR.appendChild(gestionActiva);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        vistaCobrar.appendChild(h1);
        return;
    }
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Botón para abir el reporte PDF del estado de cuenta de la factura seleccionada
    const botonReporte = crearBotonReportePdfMake({
        contenedorModal: vistaPrincipal,
        obtenerContenido: pdfMakeCobrosContratoConRecibo(URL_LT, registroContrato),
        botonTexto: "Estado de Cuenta",
    });
    let arrayOpcionesBtn = [botonReporte];
    // Creación de formulario para la vista Registrar
    if (PUEDE_ESCRIBIR) {
        const modalRegistro = modalFormularioCobroRecibo({
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
        "Lugar",
        "Persona",
        "CI",
        "N° Trans.",
        "N° Recibo",
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
            totalMonto += Math.round(parseFloat(registro.monto ?? 0) * FACTOR);
            const celdas = [
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fecha) || "-"]),
                crearElemento("td", undefined, [registro.lugar || "-"]),
                crearElemento("td", undefined, [registro.persona || "-"]),
                crearElemento("td", undefined, [registro.ci || "-"]),
                crearElemento("td", undefined, [registro.codigotransaccion || "-"]),
                crearElemento("td", undefined, [registro.recibo || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                crearElemento("td", { class: "text-center" }, [botonMostrarAdjunto(vistaPrincipal, registro.nombre_archivo) || "-"]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);

            // Si el registro no tiene transacción asignada, se resalta la fila y se muestra el botón para su reasignación.
            if (!registro.transaccion || registro.transaccion === "0" || registro.transaccion === 0) {
                fila.classList.add("table-warning");

                if (PUEDE_EDITAR && PUEDE_ESCRIBIR) {
                    const botonReasignar = manejarEstadoAsignacionCobroFactura({
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
            if (registro.idcomprobante) {
                const botonVerComprobante = crearBotonIconoPdfMake({
                    contenedorModal: vistaPrincipal,
                    obtenerContenido: pdfMakeComprobanteGeneral(`${URL}listar_comprobantes_de_recibo_cobro/${registro.idcomprobante}`, "recibo", "cobro"),
                    tituloBoton: "Comprobante",
                });
                tdOpciones.append(botonVerComprobante, " ");
            }
            if (PUEDE_EDITAR) {
                // Crear el botón para eliminar el archivo adjunto desde el formulario de edición
                const crearBotonEliminarArchivo = manejarEliminarArchivoDesdeFormulario({
                    contenedorDeAlertas,
                    vistaPrincipal,
                    cargarContenidoTabla,
                    urlListadoTabla: URL_LT,
                    llaves: {
                        archivo: "nombre_archivo",
                        idRegistro: "id",
                        tipoDocumento: "recibo",
                    }
                });
                const editarCajaBanco = () => {
                    const divModal = modalEditarCajaBancoDeCobro(registro, { otras_cuentas: registroContrato.id }, vistaPrincipal);
                    vistaPrincipal.appendChild(divModal)
                }

                // Crear botón editar con modal de formulario
                const botonEditar= botonModalEditar(
                    {
                        contenedorDeAlertas,
                        camposDeFormulario: formularioCobroContratoConRecibo({editarCajaBanco, crearBotonEliminarArchivo}),
                        URL_FORM: URL,
                        URL_LISTAR: URL_LT,
                        configuracionModal: {
                            tituloModal: "Editar Recibo de Cobro",
                        },
                        camposAdicionales: {
                            ver: "registrocobrarfacturaf5",
                            zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            idcuentaspof: registro.id,
                            sucursal: SUCURSAL_ID,
                            empresa: EMPRESA_ID,
                        },
                        callbacks: {
                            previaSolicitud: validarCampoEditar(vistaPrincipal, datoGA),
                        },
                        datosRegistro: registro,
                        cargarContenidoTabla,
                    },
                    vistaPrincipal
                );
                tdOpciones.append(botonEditar, " ");
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
 * Función: Crea un modal con el formulario para registrar un cobro con recibo.
 * Descripción: Esta función genera un modal que contiene el formulario necesario para registrar un cobro con recibo que puede ser asociada a una transacción.
 *              Maneja la lógica de envío del formulario y la verificación de montos en Cajas y Bancos si corresponde.
 * Fecha: 05 de marzo de 2026
 * Autor: Joel Choque
 */
function modalFormularioCobroRecibo({
    vistaPrincipal,
    contenedorDeAlertas,
    URL_LT,
    cargarContenidoTabla,
    registroContrato,
    gestionActual,
}) {
    const [modal, cuerpoModal, cerrarModal] = modalFijo( { tituloModal: "Registro de Cobro Con Recibo", estiloModal: "width: 100%; max-width: 1400px;" } );

    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const PREFIJO_ID = "tcccobroconrecibo";
    const estadoCajaBancos = crearEstadoCajaBancos(vistaPrincipal, PREFIJO_ID); // Estado para manejar los datos de Cajas y Bancos

    // Funcion que se ejecuta al cancelar el registro.
    const cancelarRegistro = (evento, formulario) => {
        evento.preventDefault();
        reiniciarFormulario(formulario);
        estadoCajaBancos.limpiar();
        cerrarModal();
    }
    // Agregar el formulario al modal.
    const nuevoformulario = crearFormulario(formularioCobroContratoConRecibo({ registroContrato }), {
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
            alertaDeExito(contenedorDeAlertas, "Factura de cobro registrada exitosamente");
            cerrarModal();
        }
        // Funcion que se ejecuta al no poder realizar el registro.
        const errorRegistro = (respuestaSolicitud) => {
            if (modalManejarRespuestaError(vistaPrincipal, respuestaSolicitud)) return;
            cerrarModal();
            alertaDeError(contenedorDeAlertas, "No se pudo registrar la factura de cobro");
        };

        // Envío de datos
        fnBotonInicial(); // Poner el botón a su estado oiginal, ya que manejarEnvioFormulario también controla el estado del botón.
        manejarEnvioFormulario({
            refFormulario: nuevoformulario,
            urlSolicitud: CT_URLAPI,
            camposAdicionales: {
                ver: "registrar_recibo_otras_cuentas",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                idotras_cuentas: registroContrato.idotras_cuentas,
                usuario: USUARIO_ID,
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,

                idcaja_bancos: idcajas_bancos,
            },
            camposCondicionales: [
                { nombre: "asiento", valor: "" },
                { nombre: "idtransaccion", valor: "" },
                { nombre: "tipo", valor: "" },
                { nombre: "cuenta", valor: "" },
                { nombre: "fecha_transaccion", valor: "" },
            ],
            callbackExito: realizarRegistro,
            callbackError: errorRegistro
        });
    });

    modal.dataset.id = "modal-cobrocon-recibo";
    return modal;
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Función para validar los campos del formulario de cobro de contrato con recibo antes de enviar la solicitud de edición.
function validarCampoEditar(vista, gestion) {
    return async (enviarFormulario, form) => {
        const validacion = await validarCamposFormulario(vista, form, "tcccobroconrecibo", gestion);

        if (validacion) {
            enviarFormulario();
        }
    };
}

/**
 * Función: Valida los campos del formulario de cobro de contrato con recibo.
 * Descripción: Esta función verifica que las fechas ingresadas corresponda a la gestión actual.
 *              Si alguna validación falla, se muestra un modal de información con el error correspondiente.
 * Fecha: 05 de marzo de 2026
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