import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario, manejarSelect } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTablaError, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getDivisaSimbolo, getEmpresaId, getSucursalId, getUsuarioId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, botonMostrarAdjunto, cambiarVista, crearElemento, crearEstadoCajaBancos, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, manejarEliminarArchivoDesdeFormulario, manejarLlenadoCajaBancos, seccionEncabezado, verificarOpcionCajaBanco } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion, modalDeInformacion, modalFijo, modalManejarRespuestaError, modalRemovible, modalValidarFechaSegunGestion } from "../../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar } from "../../../funciones/OpcionesBasicas.js";
import { enviarDatosOJson, manejarEnvioFormulario, obtenerDatos, reiniciarFormulario, VerificarFormulario } from "../../../funciones/Solicitudes.js";
import { crearBotonIconoPdfMake, crearBotonReportePdfMake } from "../../../funciones/VistaPDF.js";
import { bloquearSufijoEnInput } from "../../cajaYBancos/Formularios.js";
import { pdfMakeComprobanteGeneral } from "../../cajaYBancos/Funcionalidades/VP_Comprobante.js";
import { manejarEstadoAsignacionPagoFactura } from "../../tributario/Funcionalidades/DetallePagados.js";
import { pdfMakeDetallePagados } from "../../tributario/Funcionalidades/ReportesTributario.js";
import { formularioPagarFactura } from "../Formularios.js";
import { manejarSaldoInicial } from "../index.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de pagos de factura.
 *              Permite ver y administrar los pagos pendientes de una factura, así como generar reportes en PDF.
 * Fecha: 05 de marzo de 2026
 * Autor: Joel Choque
 */
export async function PagarFactura(datosVista) {
    const {
        permisos,
        vistaPagosDeFacturas,
        vistaPagar,
        urlPagosDeFacturas,
        registroFactura,
        cargarTablaPagosDeFacturas,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listapagos_individuales/${registroFactura.id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaPagar.append(vistaPrincipal);

    const regresar = async () => {
        const formulario = vistaPrincipal.querySelector("#form-registro");
        const camposConValor = formulario ? VerificarFormulario(formulario) : 0;

        const listaDeRegistros = await obtenerDatos(urlPagosDeFacturas);
        if (camposConValor > 0) {
            const modal = modalDeConfirmacion(
                () => {
                    cargarTablaPagosDeFacturas(listaDeRegistros);
                    cambiarVista(vistaPagar, vistaPagosDeFacturas);
                    vistaPagar.innerHTML = "";
                },
                "Se perderán los datos ingresados. ¿Desea continuar?",
                undefined, undefined, undefined, () => {
                    const modalFormulario = vistaPrincipal.querySelector("[data-id='modal-cobrar-factura']");
                    if (modalFormulario) {
                        modalFormulario.classList.remove("d-none");
                    }
                }
            );
            vistaPagar.appendChild(modal);
            return;
        }
        cargarTablaPagosDeFacturas(listaDeRegistros);
        cambiarVista(vistaPagar, vistaPagosDeFacturas);
        vistaPagar.innerHTML = "";
    }
    const textoNombre = `<span class="fw-bold">Proveedor: </span>${registroFactura.nombrep || ""}`;
    const divNombre = crearElemento("div");
    divNombre.innerHTML = textoNombre;
    const spanSaldo = crearElemento("span", { class: "fw-normal", id:"pagar_f_span_saldo" }, [formatoDecimal(registroFactura.saldo)])
    const divSaldo = crearElemento("div", { class: "fw-bold" }, [`Saldo por Pagar ${getDivisaSimbolo() || ""}: `, spanSaldo]);
    const divInfoFactura = crearElemento("div", undefined, [divNombre, divSaldo]);
    const divGestion = crearElemento("div", { class: "text-end" });
    const divColumnas = crearElemento("div", { class: "d-flex justify-content-between align-items-start" }, [divInfoFactura, divGestion]);
    const divInformacion = crearElemento("div", { class: "mt-3" }, [divColumnas]);
    const encabezadoVista = seccionEncabezado({ titulo: "Comprobante de Egreso", alinearTitulo: "start", elementoAdicional: divInformacion }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    // Obtención de datos de la gestión actual para mostrar en la vista y validar las fechas de los cobros.
    const datoGA = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);
    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datoGA.nombre} (${formatoFecha(datoGA.fechaini)} a ${formatoFecha(datoGA.fechafin)})`]);
        const textGA = crearElemento("p", { style: "font-size: 14px;" }, ["Gestión Activa: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-end" }, [textGA])
        divGestion.appendChild(gestionActiva);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        vistaPrincipal.appendChild(h1);
        return;
    }
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Controlador para manejar el saldo actual de la factura a cobrar.
    const controladorSaldo = manejarSaldoInicial(registroFactura.saldo, spanSaldo);

    // Botón para abir el reporte PDF del estado de cuenta de la factura seleccionada
    const botonReporte = crearBotonReportePdfMake({
        contenedorModal: vistaPrincipal,
        obtenerContenido: pdfMakeDetallePagados(`${URL}listapagos_individuales/${registroFactura.id}`, registroFactura, controladorSaldo.getSaldo),
        botonTexto: "Estado de Cuenta",
    });
    let arrayOpcionesBtn = [botonReporte];
    // Creación de formulario para la vista Registrar
    if (PUEDE_ESCRIBIR) {
        const modalRegistro = modalFormularioPagarFactura({
            vistaPrincipal,
            contenedorDeAlertas,
            URL_LT,
            cargarContenidoTabla,
            registroFactura,
            gestionActual: datoGA,
            controladorSaldo,
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
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fecha) || "-"]),
                crearElemento("td", undefined, [registro.lugar || "-"]),
                crearElemento("td", undefined, [registro.persona || "-"]),
                crearElemento("td", undefined, [registro.ci || "-"]),
                crearElemento("td", undefined, [registro.codigotransaccion || "-"]),
                crearElemento("td", undefined, [registro.recibo || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(saldo / FACTOR)]),
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
            tdOpciones.append(botonVerComprobante, " ");

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
                        tipoDocumento: "comprobante_pago",
                    }
                });
                const editarCajaBanco = () => {
                    const divModal = modalEditarCajaBancoDePago(registro, { factura: registroFactura.id }, vistaPrincipal);
                    vistaPrincipal.appendChild(divModal)
                }

                // Crear botón editar con modal de formulario
                const botonEditar= botonModalEditar(
                    {
                        contenedorDeAlertas,
                        camposDeFormulario: formularioPagarFactura({editarCajaBanco, crearBotonEliminarArchivo}),
                        URL_FORM: URL,
                        URL_LISTAR: URL_LT,
                        configuracionModal: {
                            tituloModal: "Editar Factura de Cobro",
                        },
                        camposAdicionales: {
                            ver: "registropagarfacturaf5",
                            zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            idrecibo: registro.id,
                            idcuenta: registroFactura.cuenta,
                            idcliente: registroFactura.idproveedor,
                            sucursal: SUCURSAL_ID,
                            empresa: EMPRESA_ID,
                        },
                        callbacks: {
                            previaSolicitud: validarCampoEditar(vistaPrincipal, datoGA, controladorSaldo.getSaldo),
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
                        URL: `${URL}eliminarpagar/${registro.id}`,
                        contenedorDeAlertas,
                        datosTabla: { elementoTd: tdOpciones },
                        URL_LISTAR: URL_LT,
                        cargarContenidoTabla
                    },
                    vistaPrincipal
                );
                tdOpciones.append(botonEliminar, " ");
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
 * Función: Crea un modal con el formulario para registrar un pago de factura.
 * Descripción: Esta función genera un modal que contiene el formulario necesario para registrar un pago de factura que puede ser asociada a una transacción.
 *              Maneja la lógica de envío del formulario y la verificación de montos en Cajas y Bancos si corresponde.
 * Fecha: 05 de marzo de 2026
 * Autor: Joel Choque
 */
function modalFormularioPagarFactura({
    vistaPrincipal,
    contenedorDeAlertas,
    URL_LT,
    cargarContenidoTabla,
    registroFactura,
    gestionActual,
    controladorSaldo,
}) {
    const [modal, cuerpoModal, cerrarModal] = modalFijo( { tituloModal: "Registro de Pago de Factura", estiloModal: "width: 100%; max-width: 1400px;" } );

    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const PREFIJO_ID = "tcpagofactura";
    const estadoCajaBancos = crearEstadoCajaBancos(vistaPrincipal, PREFIJO_ID); // Estado para manejar los datos de Cajas y Bancos

    // Funcion que se ejecuta al cancelar el registro.
    const cancelarRegistro = (evento, formulario) => {
        evento.preventDefault();
        reiniciarFormulario(formulario);
        estadoCajaBancos.limpiar();
        cerrarModal();
    }
    // Agregar el formulario al modal.
    const nuevoformulario = crearFormulario(formularioPagarFactura(), {
        opcionesParaBotones: {
            clasesEnviar: "btn btn-primary px-1 px-sm-4",
            nombreEnviar: "Guardar",
            callbackCancelar: vistaPrincipal ? cancelarRegistro : null,
        },
    });
    nuevoformulario.id = "form-registro"; // Asignar un ID al formulario para facilitar su manipulación, [ crearEstadoCajaBancos() lo requiere ]
    (async () => { // Rellenar campos del formulario con datos de la factura
        const datosComtrato = await obtenerDatos(`${CT_URLAPI}listar_datos_facturas_cajas/${registroFactura.id}/1`);
        if (datosComtrato?.length > 0) {
            const concepto = nuevoformulario.querySelector(`#${PREFIJO_ID}-concepto`);
            concepto.value = datosComtrato[0].concepto || "";
            concepto.setAttribute("data-suffix", concepto.value);
            bloquearSufijoEnInput(concepto);
        }
    })();

    // Gestiona el llenado y la lógica del formulario de Cajas y Bancos, así como el manejo del modal de Cajas y Bancos.
    manejarLlenadoCajaBancos(nuevoformulario, vistaPrincipal, estadoCajaBancos, PREFIJO_ID, controladorSaldo.getSaldo);

    cuerpoModal.appendChild(nuevoformulario);

    // ACCIONES CAMPOS FORMULARIO
    const botonEnviar = nuevoformulario.querySelector("#btn-enviar-formulario")
    nuevoformulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fnBotonInicial = botonEnCarga(botonEnviar);

        // validar la fecha de factura y de transacción según la gestión
        if (!await validarCamposFormulario(vistaPrincipal, nuevoformulario, PREFIJO_ID, gestionActual, controladorSaldo.getSaldo())) {
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
            controladorSaldo.actualizarSaldo(montoRegistro);

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
                ver: "registropagarfactura",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                usuario: USUARIO_ID,
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,
                idfactura: registroFactura.id,
                idcuenta: registroFactura.cuenta,
                idcliente: registroFactura.idproveedor,

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

    modal.dataset.id = "modal-cobrar-factura";
    return modal;
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea un modal para editar la asignación de Cajas y Bancos en un pago de factura.
 * Descripción: Esta función genera un modal que permite editar o asignar la Caja o Banco desde la cual se realizó el pago de una factura.
 *              Permite agregar, editar o eliminar las asignaciones de Cajas y Bancos relacionadas al pago.
 * Fecha: 05 de marzo de 2026
 * Autor: Joel Choque
 */
export function modalEditarCajaBancoDePago(comprobante, datosFactura, vistaPrincipal) {
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({
        tituloModal: "Edita Montos Caja/Bancos",
        estiloModal: "width: 600px;",
        instrucciones: {
            cerrarAlHacerClickExterno: false,
            cerrarAlPresionarEsc: false,
        }
    });


    const formulario = `
    <div>

        <div class="mb-2">
            <p class="text-info-emphasis text-end"> <i class="bi bi-info-circle"></i> Todos los cambios solo se efectuarán al hacer click en "Guardar cambios"</p>
            <p>Monto pagado: <span class="fw-bold">${formatoDecimal(comprobante.monto)}</span></p>
        </div>
        <form class="row g-2 mt-0">
            <div class="col-12 col-md-6">
                <label for="m_cb_cajabanco" class="form-label">Cajas y Bancos</label>
                <select class="form-select" id="m_cb_cajabanco" name="asiento" required>
                </select>
            </div>
            <div class="col-12 col-md-6">
                <label for="m_cb_monto" class="form-label">Monto</label>
                <input class="form-control" id="m_cb_monto" name="monto" type="number" required="" onkeydown="return event.key !== 'e' &amp;&amp; event.key !== 'E'" step="0.01" min="0.01">
            </div>
            <div class="col-12 text-center ">
                <button class="btn btn-primary px-5" id="m_ecb_a_e">Agregar</button>
                <a class="btn btn-secondary px-3 d-none" id="m_ecb_cancelar">Cancelar</a>
            </div>
        </form>
        <div class="table-responsive mt-3">
            <table class="table table-sm table-bordered table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Caja o Banco</th>
                        <th>Monto</th>
                        <th style="width:55px;">Eliminar</th>
                    </tr>
                </thead>
                <tbody id="m_cb_tabla">
                </tbody>
                <tfoot>
                    <tr class="">
                        <td colspan="0" class="text-end">Total:</td>
                        <td class="text-end" id="total"></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div class="col-12 text-center mt-4">
            <a class="btn btn-info" id="m_ecb_guardar">Guardar cambios</a>
            <a class="btn btn-secondary" data-id="__opcion-cierre-externo">Descartar cambios</a>
        </div>
    </div>`;
    const usuario_id = getUsuarioId();
    const empresa_id = getEmpresaId();

    cuerpoModal.innerHTML = formulario;
    const agregar = cuerpoModal.querySelector("#m_ecb_a_e");
    const cancelar = cuerpoModal.querySelector("#m_ecb_cancelar");
    const elementoFormulario = cuerpoModal.querySelector("form");
    const tablaBody = cuerpoModal.querySelector("#m_cb_tabla");
    const selectCB = elementoFormulario.querySelector("#m_cb_cajabanco");
    const divResp = cuerpoModal.querySelector(".table-responsive");
    const inputMonto = elementoFormulario.querySelector("#m_cb_monto");

    let copiaListaCB = null;
    const arrEditarCB = {};
    const cbActual = [];
    let contador = 0;
    const agregarTr = (cb, mantener) => {
        if (tablaBody.querySelector("[colspan='100%']")) {
            tablaBody.innerHTML = "";
        }

        const i = crearElemento("i", {class: "bi bi-trash"});
        const iEditar = crearElemento("i", {class: "bi bi-pencil-square"});
        const btnEliminar = crearElemento("button", {class: "btn btn-danger btn-sm", id: `m_t_eliminar_${cb.id}`}, [i]);
        const btnEditar = crearElemento("button", {class: "btn btn-warning btn-sm", id: `m_t_editar_${cb.id}`}, [iEditar]);
        const tdCB = crearElemento("td", undefined, [cb.nombre]);
        const tdMonto = crearElemento("td", {class:"text-end"}, [formatoDecimal(cb.monto)]);
        const tdOpciones = crearElemento("td", {class:"text-nowrap"}, [btnEditar, " ", btnEliminar]);
        const tr = crearElemento("tr", undefined, [tdCB, tdMonto, tdOpciones]);
        tablaBody.appendChild(tr);

        btnEliminar.addEventListener("click", () => {
            const remover = () => {
                tr.remove();
                const a = selectCB.selectize.getOption(cb.id)
                if (a[0]) {
                    a[0].classList.remove("d-none");
                } else {
                    const opcionesSelect = selectCB.selectize.options;
                    opcionesSelect[cb.id].classes = "";
                }
                if (arrEditarCB[cb.id_arr]) {
                    if (arrEditarCB[cb.id_arr].iddetalle_caja_bancos_pagar === 0) {
                        delete arrEditarCB[cb.id_arr];
                    } else {
                        arrEditarCB[cb.id_arr].iddetalle_caja_bancos_pagar =  Number(cb.id_arr) * - 1;
                    }
                } else {
                    arrEditarCB[cb.id_arr] = {iddetalle_caja_bancos_pagar: Number(cb.id_arr) * -1, monto: 0, idcaja_bancos: cb.id};
                }
                for (const item of copiaListaCB) {
                    if (item.iddetalle_caja_bancos_pagar === cb.id_arr) {
                        copiaListaCB.splice(copiaListaCB.indexOf(item), 1);
                        break;
                    }
                }
                const tfTotal = MontoActualCB(0, copiaListaCB);
                const tdTotal = cuerpoModal.querySelector("#total");
                // if (tablaBody.children.length > 0) {
                if (tablaBody.children.length >= 0) {
                    tdTotal.textContent = formatoDecimal(tfTotal);
                }
            };
            const modal  = modalDeConfirmacion(remover);
            cuerpoModal.appendChild(modal);
        });
        btnEditar.addEventListener("click", () => {
            if (!cancelar.classList.contains("d-none")) {
                cancelar.click();
            }
            cbActual[0] = cb.id;
            cbActual[1] = cb.id_arr;
            agregar.setAttribute("class", "btn btn-warning px-4");
            agregar.textContent = "Editar";
            cancelar.classList.remove("d-none");

            selectCB.selectize.setValue(cb.id);
            inputMonto.value = cb.monto;
            const a = selectCB.selectize.getOption(cb.id)
            a[0].classList.remove("d-none");

        });
    };

    const llenarTabla = async() => {
        if (!copiaListaCB) {
            const mostrarMonto = (valor) => {
                if (agregar.classList.contains("btn-warning")) return;
                if (valor) {
                    const montoTablaCB = MontoActualCB(0, copiaListaCB);
                    const vA = Number(comprobante.monto) - montoTablaCB;
                    inputMonto.value = vA ? Number(vA.toFixed(2)) : "";
                } else {
                    inputMonto.value = "";
                }
            }
            await manejarSelect(selectCB, { urlSolicitud: `${CT_URLAPI}listar_caja_bancos_por_usuario/${empresa_id}/${usuario_id}`, llavesOpciones: { valor: "idcaja_bancos", detalle: ["codigo", "tipo_cuenta"] }, callbackInput: mostrarMonto });

            const datos = await obtenerDatos(`${CT_URLAPI}listar_cajas_bancos_pagar_por_recibo/${comprobante.id}`);
            copiaListaCB = datos ? [...datos] : false;
        }
        tablaBody.innerHTML = "";

        if (copiaListaCB && copiaListaCB.length == 0) {
            tablaBody.innerHTML = "<tr><td colspan='100%' class='text-center'>No se encontraron registros</td></tr>";
        } else if (copiaListaCB === false) {
            tablaBody.replaceChildren(crearFilaTablaError());
        }
        const opcionesSelect = selectCB.selectize.options;
        for (const cb of copiaListaCB) {
            agregarTr({id: cb.idcaja_bancos, nombre: cb.tipo_cuenta, monto: cb.monto, id_arr: cb.iddetalle_caja_bancos_pagar}, true);
            opcionesSelect[cb.idcaja_bancos].classes = "d-none";
        }
        const tfTotal = MontoActualCB(0, copiaListaCB);
        const tdTotal = cuerpoModal.querySelector("#total");
        if (tablaBody.children.length > 0) {
            tdTotal.textContent = formatoDecimal(tfTotal);
        }
    };
    llenarTabla();

    // Preparación y envio de formulario y control de la respuesta
    elementoFormulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const montoP = parseFloat(comprobante.monto || 0);
        const monto = inputMonto.value;
        const nombreCB = selectCB.options[selectCB.selectedIndex].text;

        const esAgregar = agregar.getAttribute("class").includes("btn-primary");
        if (esAgregar) {
            const total = MontoActualCB(monto, copiaListaCB);

            if (total > montoP) {
                const modal = modalDeInformacion("El monto de Cajas y Bancos no debe ser mayor al monto pagado");
                cuerpoModal.appendChild(modal);
                return;
            }
            contador++;
            agregarTr({id: selectCB.value, nombre: nombreCB, monto: monto, id_arr: `${contador}n`}, false);
            arrEditarCB[`${contador}n`] = {iddetalle_caja_bancos_pagar: 0, monto: monto, idcaja_bancos: selectCB.value};

            copiaListaCB.push({iddetalle_caja_bancos_pagar: `${contador}n`, idcaja_bancos: selectCB.value, monto: monto, tipo_cuenta: nombreCB});
            const tdTotal = cuerpoModal.querySelector("#total");
            if (tablaBody.children.length > 0) {
                tdTotal.textContent = formatoDecimal(total);
            }
        } else {
            const id = cbActual[1];
            const newCopiaListaCB = [...copiaListaCB];

            for (const cb of newCopiaListaCB) {
                if (cb.iddetalle_caja_bancos_pagar === id) {
                    cb.monto = monto;
                    break;
                }
            }
            const total = MontoActualCB(0, newCopiaListaCB);
            if (total > montoP) {
                const modal = modalDeInformacion("El monto de Cajas y Bancos no debe ser mayor al monto pagado");
                cuerpoModal.appendChild(modal);
                return;
            }
            if (arrEditarCB[id]) {
                arrEditarCB[id].monto = monto;
                arrEditarCB[id].idcaja_bancos = selectCB.value;
            } else {
                arrEditarCB[id] = {iddetalle_caja_bancos_pagar: id, monto: monto, idcaja_bancos: selectCB.value};
            }
            // const tr = tablaBody.querySelector(`#m_t_editar_${cbActual[0]}`).closest("tr");
            // tr.children[0].textContent = nombreCB;
            // tr.children[1].textContent = formatoDecimal(monto);

            agregar.setAttribute("class", "btn btn-primary px-5");
            agregar.textContent = "Agregar";
            cancelar.classList.add("d-none");

            for (const cb of copiaListaCB) {
                if (cb.iddetalle_caja_bancos_pagar === id) {
                    cb.monto = monto;
                    cb.idcaja_bancos = selectCB.value;
                    cb.tipo_cuenta = nombreCB;
                    break;
                }
            }
            llenarTabla();

        }
        const a = selectCB.selectize.getOption(selectCB.value)
        reiniciarFormulario(elementoFormulario);
        a[0].classList.add("d-none");
    });

    cancelar.addEventListener("click", () => {
        const a = selectCB.selectize.getOption(cbActual[0])
        a[0].classList.add("d-none");
        reiniciarFormulario(elementoFormulario);

        agregar.setAttribute("class", "btn btn-primary px-5");
        agregar.textContent = "Agregar";
        cancelar.classList.add("d-none");
    });

    const guardarCambios = cuerpoModal.querySelector("#m_ecb_guardar");

    guardarCambios.addEventListener("click", (e) => {
        e.preventDefault();

        if (Object.keys(arrEditarCB).length === 0) {
            cerrarModal();
            return;
        }

        const montoP = Number(comprobante.monto || 0);
        const total = MontoActualCB(0, copiaListaCB);
        if (total > montoP) {
            const modal = modalDeInformacion("El monto de Cajas y Bancos no debe ser mayor al monto pagado");
            cuerpoModal.appendChild(modal);
            return;
        }
        if (total !== montoP) {
            const modal = modalDeInformacion("El monto de Cajas y Bancos debe ser igual al monto pagado");
            cuerpoModal.appendChild(modal);
            return;
        }

        const accionEnviar = async() => {
            const modal = modalDeInformacion("Cambios guardados con éxito", "fs-5 text-success");
            vistaPrincipal.appendChild(modal);
            cerrarModal();
        };
        const error = () => {
            const modal = modalDeInformacion("Ocurrio un error al guardar los cambios", "fs-5 text-danger");
            cuerpoModal.appendChild(modal);
        }
        const misDatos = Object.values(arrEditarCB);
        const datos = {
            idrecibo: comprobante.id,
            cajasBancos: JSON.stringify(misDatos),
            idotras_cuentas: datosFactura.otras_cuentas ?? 0,
            idfactura: datosFactura.factura ?? 0,
            ver: "editar_caja_bancos_pagar_recibo"
        }
        enviarDatosOJson({
            datos: datos,
            urlSolicitud: CT_URLAPI,
            callbackExito: accionEnviar,
            callbackError: error
        });
    });

    return modal;
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Función para validar los campos del formulario de pago de factura antes de enviar la solicitud de edición.
function validarCampoEditar(vista, gestion, obtenerSaldo) {
    return async (enviarFormulario, form) => {
        const validacion = await validarCamposFormulario(vista, form, "tcpagofactura", gestion, obtenerSaldo());

        if (validacion) {
            enviarFormulario();
        }
    };
}

/**
 * Función: Valida los campos del formulario de pago de factura.
 * Descripción: Esta función verifica que la fecha ingresada corresponda a la gestión actual y que el monto a pagar no exceda el saldo pendiente de la factura.
 *              Si alguna validación falla, se muestra un modal de información con el error correspondiente.
 * Fecha: 03 de marzo de 2026
 * Autor: Joel Choque
 */
async function validarCamposFormulario(vista, form, prefijoId, gestion, saldoActual) {
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

    const monto = form.querySelector(`#${prefijoId}-montofactura`);
    if (monto) {
        const valorMonto = Number(parseFloat(monto.value ?? 0).toFixed(2));

        if (valorMonto > saldoActual) {
            const modal = modalDeInformacion("El monto debe ser menor o igual al saldo");
            vista.appendChild(modal);
            return false;
        }
    }
    return true;
}

// Función para calcular el monto actual de la factura considerando los montos asignados en Cajas y Bancos.
const MontoActualCB = (nuevoMonto, arrCajasBancos) => {
    let total = Number(nuevoMonto);
    for (const cb of arrCajasBancos) {
        total = Number((total + Number(cb.monto)).toFixed(2));
    }
    return total;
}