import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { crearFormulario, manejarSelect } from "../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId, getUsuarioId } from "../../funciones/DatosAuxiliares.js";
import { botonEnCarga, cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, divOpcionesVista, formatoDecimal, formatoFecha, seccionDriverJS } from "../../funciones/Funciones.js";
import { modalDeInformacion, modalManejarRespuestaError, modalRemovible, modalValidarFechaSegunGestion } from "../../funciones/Modals.js";
import { botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { enviarDatosOJson, obtenerDatos, reiniciarFormulario } from "../../funciones/Solicitudes.js";
import { crearBotonIconoPdfMake } from "../../funciones/VistaPDF.js";
import { formularioTribFacturaPago } from "../tributario/Formularios.js";
import { pdfMakeDetallePagados } from "../tributario/Funcionalidades/ReportesTributario.js";
import { formularioPagarFacturaMultiple } from "./Formularios.js";
import { PagarFactura } from "./Funcionalidades/PagarFactura.js";
import { pdfMakePagosDeFacturas } from "./Funcionalidades/ReportesCobroPago.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de cobros de facturas.
 *              Permite visualizar y administrar los cobros pendientes, así como generar reportes en PDF.
 * Fecha: 01 de marzo de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaFacturasPorPagar - Contenedor principal donde se renderiza la vista de facturación de pagos.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function PagarFacturas(permisos, vistaFacturasPorPagar, datosVistaPrincipal) {

    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const PUEDE_EDITAR = permisos.editar === "1";
    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const PREFIJO_ID = "creditopagarfactura";
    const URL = CT_URLAPI;
    const URL_LT = `${URL}lista_pagar_pagado_factura/${SUCURSAL_ID}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaPagar = crearElemento("div", { class: "d-none", "data-pane-id": "pagar" });
    vistaFacturasPorPagar.append(vistaPrincipal, vistaPagar);

    // Creación de elementos para la vista Principal
    const gestionActual = obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioTribFacturaPago(PREFIJO_ID, false),
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nueva Factura de Pago",
                },
                camposAdicionales: {
                    ver: "registrar_factura_pagos_tributario",
                    zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    usuario: USUARIO_ID,
                    empresa: EMPRESA_ID,
                    sucursal: SUCURSAL_ID,
                    cobrado: 0,
                    clasefactura: 1,
                    especificacion: 1,
                    codigocontrol: 0,
                    idcajas_bancos: "",
                },
                camposCondicionales: [
                    { nombre: "asiento", valor: "" },
                    { nombre: "trans", valor: "" },
                    { nombre: "tipo", valor: "" },
                    { nombre: "cuenta", valor: "" },
                    { nombre: "fecha_transaccion", valor: "" },
                    { nombre: "pagado", valor: "1" },
                ],
                callbacks: {
                    previaSolicitud: async (enviarFormulario, formulario) => {
                        const fechaTransaccion = formulario.querySelector(`#${PREFIJO_ID}-fechatrans`);
                        if (fechaTransaccion?.value && !await modalValidarFechaSegunGestion(fechaTransaccion.value, vistaPrincipal)) {
                            return;
                        }
                        enviarFormulario();
                    },
                },
                mostrarErrorEnModal: {
                    contenedorModal: vistaPrincipal
                },
            },
            vistaPrincipal
        );

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonRegistrar,
            // botonCobroMultiple,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }

    const encabezadoTabla = [
        "N°",
        "Selección",
        "Fecha",
        "N° Factura",
        "N° Trans.",
        "Proveedor",
        "Concepto",
        "Monto Factura",
        "Pagado",
        "Saldo",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

    const divFiltros = crearFiltrosTabla({
        obtenerContenidoReporte: pdfMakePagosDeFacturas(controladorTabla.getDatosOriginales),
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

        const objetoRegistros = {}; // Objeto para almacenar los registros seleccionados para pago múltiple
        let contador = 0;
        let totalMonto = 0;
        let totalCobrado = 0;
        let totalSaldo = 0;
        for (const item of lista) {
            const registro = item.raw;
            contador++;
            totalMonto += Math.round(parseFloat(registro.monto || 0) * 100);
            totalCobrado += Math.round(parseFloat(registro.cobrado || 0) * 100);
            totalSaldo += Math.round(parseFloat(registro.saldo || 0) * 100);

            const celdas = [
                crearElemento("td", { class: "text-center" }, [contador]),
                crearElemento("td", { class: "text-center" }, [
                    (PUEDE_ESCRIBIR && PUEDE_EDITAR)
                        ? columnaCheckbox({
                            gestionActual,

                            vistaPrincipal,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            objetoRegistros,
                            URL_LT,
                        })
                        : "-"
                ]),
                crearElemento("td", { class: "text-end" }, [item.fechaTexto]),
                crearElemento("td", undefined, [registro.numero || "-"]),
                crearElemento("td", undefined, [registro.codigo || "-"]),
                crearElemento("td", undefined, [registro.nombrep || "-"]),
                crearElemento("td", undefined, [registro.por_concepto_de || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.cobrado)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.saldo)]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });
            // Botón para mostrar el detalle de los pagos realizados para la factura seleccionada
            const botonDetalle = botonDetallePagos(
                () => {
                    cambiarVista(vistaPrincipal, vistaPagar);
                    PagarFactura({
                        permisos,
                        vistaPagosDeFacturas: vistaPrincipal,
                        vistaPagar,
                        urlPagosDeFacturas: URL_LT,
                        registroFactura: registro,
                        cargarTablaPagosDeFacturas: cargarContenidoTabla,
                    });
                }
            );
            // Botón para abrir el reporte PDF del estado de cuenta de la factura seleccionada
            const botonReporte = crearBotonIconoPdfMake({
                contenedorModal: vistaPrincipal,
                obtenerContenido: pdfMakeDetallePagados(`${URL}listapagos_individuales/${registro.id}`, registro, registro.saldo),
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
            valores: [totalMonto / 100, totalCobrado / 100, totalSaldo / 100],
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
            .filter(registro => Math.abs(Number(Number(registro.saldo).toFixed(2))) !== 0)
            .map(registro => {
                const [anio, mes, dia] = (registro.fecha || "").split("-").map(Number);
                return {
                    raw: registro,
                    fechaBusqueda: { anio, mes, dia },
                    fechaTexto: formatoFecha(registro.fecha) || "-",
                    textoBusqueda: [
                        registro.numero,
                        registro.codigo,
                        registro.nombrep,
                        registro.por_concepto_de,
                        formatoDecimal(registro.monto),
                        formatoDecimal(registro.cobrado),
                        formatoDecimal(registro.saldo),
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
                    title: "Pagar Facturas",
                    description: "Sección para gestionar el pago de facturas pendientes (crédito).",
                },
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='__btn-registro']",
                popover: {
                    title: "Agregar Nuevo Factura",
                    description: "Abre un formulario para registrar una nueva factura en el sistema",
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
                    description: "Elimina los filtros de búsqueda aplicados y muestra todos los registros.",
                },
            },
            {
                mainElement: divFiltros,
                element: "#__reporte",
                popover: {
                    title: "Reporte de pagos",
                    description: "Permite visualizar y descargar el reporte en formato PDF.",
                },
            },
            {
                element: divTabla,
                popover: {
                    title: "Tabla de facturas de pagos",
                    description: "Muestra todos los registros de facturas de pagos pendientes en el sistema.",
                },
            },
            {
                mainElement: tabla,
                element: "button.btn-primary.btn-sm",
                popover: {
                    title: "Realizar pago",
                    description: "Abre una vista donde se puede registrar el pago de la factura seleccionada. Así mismo se genera automáticamente el Comprobante de Egreso",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Estado de cuenta']",
                popover: {
                    title: "Estado de cuenta",
                    description: "Genera un reporte en formato PDF del estado de cuenta de la factura seleccionada.",
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
    const icono = crearElemento("i", { class: "bi bi-cash pe-1" });
    const boton = crearElemento("button", { class: "btn btn-primary btn-sm", type: "button" }, [icono, "Pagar"]);
    boton.addEventListener("click", (e) => {
        e.preventDefault();
        callback();
    });

    return boton;
}

/**
 * Función: Crea una columna con checkbox para seleccionar facturas en la tabla de pagos.
 * Descripción: Esta función genera una columna con un checkbox para cada fila de la tabla de pagos.
 *              Permite seleccionar múltiples facturas para realizar un pago múltiple, también poder agregarlos a una Caja o Banco.
 *              Al seleccionar una factura, se valida que solo se puedan seleccionar facturas del mismo proveedor y se muestra un botón para realizar el pago múltiple.
 * Fecha: 05 de marzo de 2026
 * Autor: Joel Choque
 */
function columnaCheckbox({
    gestionActual,

    vistaPrincipal,
    contenedorDeAlertas,
    cargarContenidoTabla,
    registro,
    divTabla,
    objetoRegistros,
    URL_LT,
}) {

    const PREFIJO_ID = "tcpagofacturamultiple";
    const input = crearElemento("input", {type: "checkbox", class: "form-check-input border-primary"});

    input.addEventListener("change", (e) => {
        const divOpcionesExistentes = vistaPrincipal.querySelector("#opcion-agrupar")

        if (!input.checked) {
            // Eliminar el registro del objeto de registros seleccionados
            delete objetoRegistros[registro.id];
            if (Object.keys(objetoRegistros).length === 0) {
                vistaPrincipal.removeChild(divOpcionesExistentes);
            }
            return;
        }

        // Validar que solo se puedan seleccionar facturas del mismo proveedor
        const proveedor = Object.values(objetoRegistros)?.[0]?.idproveedor || null;
        if (!(proveedor === null || proveedor === registro.idproveedor)) {
            const modal = modalDeInformacion("Solo puede seleccionar facturas de un mismo proveedor");
            vistaPrincipal.appendChild(modal);
            input.checked = false;
            return;
        }

        // Agregar el registro al objeto de registros seleccionados
        objetoRegistros[registro.id] = registro;
        if (divOpcionesExistentes)  return;

        // Crear el botón para abrir el modal si no existe
        const icono = crearElemento("i", { class: "bi bi-cash-stack pe-1" });
        const botonPagarMultiple = crearElemento("button", {class: "btn btn-info btn-sm"}, [icono, "Realizar Pago"]);
        const divOpciones = crearElemento("div", {class: "d-flex justify-content-start mb-2", id: "opcion-agrupar"}, [botonPagarMultiple]);
        vistaPrincipal.insertBefore(divOpciones, divTabla);
        // Evento para abrir el modal de pago múltiple al hacer click en el botón
        botonPagarMultiple.addEventListener("click", async (e) => {
            const datosGestion = await gestionActual;
            const empresa_id = getEmpresaId();
            const sucursal_id = getSucursalId();
            const usuario_id = getUsuarioId();
            const URL = CT_URLAPI;

            const [modal, cuerpoModal, cerrarModal] = modalRemovible({
                tituloModal: "Pago Múltiple de Facturas",
                estiloModal: "width: 1400px;",
                instrucciones: {
                    cerrarAlHacerClickExterno: false,
                    cerrarAlPresionarEsc: false,
                }
            });
            vistaPrincipal.appendChild(modal);
            // Mostrar información de la gestión activa en el sistema
            if (datosGestion?.nombre) {
                const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datosGestion.nombre} (${formatoFecha(datosGestion.fechaini)} a ${formatoFecha(datosGestion.fechafin)})`]);
                const textGA = crearElemento("p", { style: "font-size:14px;" }, ["Gestión Activa: ", spanGA]);
                const gestionActiva = crearElemento("div", { class: "text-end" }, [textGA])
                cuerpoModal.appendChild(gestionActiva);
            } else {
                const h1 = crearElemento("h1", { class: "h6 text-center text-danger-emphasis" }, ["Es necesario tener una gestión activa para realizar pagos."]);
                cuerpoModal.appendChild(h1);
                return;
            }

            // Crear el formulario para el pago múltiple y preparar los campos.
            const formulario = crearFormulario(formularioPagarFacturaMultiple(), {
                opcionesParaBotones: {
                    clasesEnviar: "btn btn-primary px-1 px-sm-4",
                    nombreEnviar: "Guardar",
                    callbackCancelar: () => cerrarModal(),
                },
            });
            cuerpoModal.appendChild(formulario);
            const inputMonto = formulario.querySelector(`#${PREFIJO_ID}-montofactura`);
            let totalSaldo = 0;
            for (const key in objetoRegistros) {
                totalSaldo += parseFloat(objetoRegistros[key].saldo);
            }
            inputMonto.value = parseFloat(totalSaldo).toFixed(2);

            const botonEnviar = formulario.querySelector("#btn-enviar-formulario");
            const btnCajaBanco = formulario.querySelector(`#${PREFIJO_ID}-cajasbancos`);
            const monto = Number(Number(totalSaldo).toFixed(2));
            const arrayDeCajaBancos = [];
            const divModal = await modalCajaBanco(monto, arrayDeCajaBancos, objetoRegistros, btnCajaBanco);
            btnCajaBanco.addEventListener("click", () => {
                vistaPrincipal.appendChild(divModal);
            });
            // Evento para enviar el formulario de cobro múltiple
            formulario.addEventListener("submit", async (e) => {
                e.preventDefault();

                const fnBotonInicial = botonEnCarga(botonEnviar);

                if(! await validarCamposFormulario(vistaPrincipal, datosGestion, formulario, arrayDeCajaBancos, monto, PREFIJO_ID)){
                    fnBotonInicial();
                    return;
                }

                const datosFactura = [];
                for (const key in objetoRegistros) {
                    const factura = {idfactura: objetoRegistros[key].id, monto: objetoRegistros[key].monto, saldo: objetoRegistros[key].saldo};
                    datosFactura.push(factura);
                }
                const datosExtra = {
                    empresa: empresa_id,
                    sucursal: sucursal_id,
                    facturas: JSON.stringify(datosFactura),
                    cajasBancos: arrayDeCajaBancos.length === 0 ? "" : JSON.stringify(arrayDeCajaBancos),
                    ver: "registropagarfacturaGrupal",
                    zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    usuario:  usuario_id,
                }

                const enviado = async () => {
                    btnCajaBanco?.classList.remove("btn-primary");
                    btnCajaBanco?.classList.add("btn-warning");
                    arrayDeCajaBancos.length = 0;

                    const listaDeRegistros = await obtenerDatos(URL_LT);
                    cargarContenidoTabla(listaDeRegistros);
                    divOpciones.remove();
                    alertaDeExito(contenedorDeAlertas, "Facturas pagadas");
                    cerrarModal();
                }
                const error = (respuesta) => {
                    if (modalManejarRespuestaError(vistaPrincipal, respuesta)) {
                        fnBotonInicial();
                        return;
                    }
                    alertaDeError(contenedorDeAlertas, "Ocurrio un error al pagar las facturas");
                    cerrarModal();
                }

                enviarDatosOJson({
                    datos: datosExtra,
                    formulario: formulario,
                    camposCondicionales: [
                        { nombre: "idasientotipo", valor: "" },
                        { nombre: "idtransaccion", valor: "" },
                        { nombre: "tipo", valor: "" },
                        { nombre: "cuenta", valor: "" },
                        { nombre: "fecha_transaccion", valor: "" },
                    ],
                    urlSolicitud: URL,
                    callbackExito: enviado,
                    callbackError: error,
                });
            });
        });
    });

    return input;
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

/**
 * Función: Valida los campos del formulario de pago múltiple antes de enviar la solicitud al servidor.
 * Descripción: Esta función valida que la fecha esté dentro del rango de la gestión activa, valida que el monto de las cajas y bancos no sea mayor al monto total a pagar, entre otras validaciones.
 *              Si alguna validación falla, se muestra un modal con el mensaje de error correspondiente.
 * Fecha: 05 de marzo de 2026
 * Autor: Joel Choque
 */
async function validarCamposFormulario(vista, gestion, form, arrayDeCajaBancos, monto, PREFIJO_ID) {
    // Validar fecha de la factura
    const fecha = form.querySelector(`#${PREFIJO_ID}-fecha`);
    if (fecha.value < gestion.fechaini || fecha.value > gestion.fechafin) {
        const modal = modalDeInformacion("La fecha no corresponde a la gestion actual");
        vista.appendChild(modal);
        return false;
    }
    // Validar fecha de transacción si se ha ingresado
    const fechaTransaccion = form.querySelector(`#${PREFIJO_ID}-fechatrans`);
    if (fechaTransaccion?.value && !await modalValidarFechaSegunGestion(fechaTransaccion.value, vista, gestion)) {
        return false;
    }
    // Validar que el monto de las cajas y bancos no sea mayor al monto total a pagar
    const usuario_id = getUsuarioId();
    const empresa_id = getEmpresaId();
    const datosCB = await obtenerDatos(`${CT_URLAPI}listar_caja_bancos_por_usuario/${empresa_id}/${usuario_id}`);
    if (datosCB && datosCB.length > 0 && arrayDeCajaBancos) {
        if (arrayDeCajaBancos.length > 0) {
            let total = 0;
            for (const cb of arrayDeCajaBancos) {
                total = Number((total + Number(cb.monto)).toFixed(2));
            }
            if (total > monto) {
                const modal = modalDeInformacion("El monto de Cajas y Bancos no debe ser mayor al monto a pagar");
                vista.appendChild(modal);
                return false;
            }
            if (total !== monto) {
                const modal = modalDeInformacion("El monto de Cajas y Bancos debe ser igual al monto a pagar");
                vista.appendChild(modal);
                return false;
            }
        } else {
            const modal = modalDeInformacion("Debe registrar el monto en Caja o Bancos");
            vista.appendChild(modal);
            return false;
        }
    }

    return true;
};

/**
 * Función: Crea un modal para asignar montos a las cajas y bancos al realizar un pago múltiple de facturas.
 * Descripción: Genera un modal donde se pueden asignar montos a las cajas y bancos disponibles para el pago múltiple de facturas.
 *              Permite seleccionar la factura a la que se le asignará el monto, así como la caja o banco correspondiente.
 *              Al agregar una asignación, se muestra en una tabla dentro del modal y se valida que el monto total asignado no sea mayor al monto total a pagar.
 * Fecha: 05 de marzo de 2026
 * Autor: Joel Choque
 */
async function modalCajaBanco(montoPrincipal, arrayDeCajaBancos, objetoRegistros, botonCajaBanco) {
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({
        tituloModal: "Asignar Montos Caja/Bancos",
        estiloModal: "width: 600px;",
        instrucciones: {
            cerrarAlHacerClickExterno: false,
            cerrarAlPresionarEsc: false,
        }
    });

    const formulario = `
    <div>
        <div class="">Monto total: <span>${formatoDecimal(montoPrincipal) || "0.00"}</span></div>
        <div class="">Monto factura: <span class="text-info fw-bold" id="span_monto_factura">-</span></div>
        <form class="row g-2 mt-0">
            <div>
                <div class="col-12 col-md-6">
                    <label for="m_cb_facturas" class="form-label">Facturas</label>
                    <select class="form-select" id="m_cb_facturas" name="factura" required data-keep="true">
                    </select>
                </div>
            </div>
            <div class="col-12 col-md-6">
                <label for="m_cb_cajabanco" class="form-label">Cajas y Bancos</label>
                <select class="form-select" id="m_cb_cajabanco" name="cajabanco" required>
                </select>
            </div>
            <div class="col-12 col-md-6">
                <label for="m_cb_monto" class="form-label">Monto</label>
                <input class="form-control" id="m_cb_monto" name="monto" type="number" required="" onkeydown="return event.key !== 'e' &amp;&amp; event.key !== 'E'" step="0.01" min="0.01">
            </div>
            <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-primary" id="btn-enviar-formulario" style="min-width: 90px;">Agregar</button>
                <button type="button" class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 90px;">Cancelar</button>
            </div>
        </form>
        <div class="table-responsive mt-3 d-none">
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
    </div>`;
    const usuario_id = getUsuarioId();
    const empresa_id = getEmpresaId();

    cuerpoModal.innerHTML = formulario;
    const elementoFormulario = cuerpoModal.querySelector("form");
    const tablaBody = cuerpoModal.querySelector("#m_cb_tabla");
    const selectCB = elementoFormulario.querySelector("#m_cb_cajabanco");
    const divResp = cuerpoModal.querySelector(".table-responsive");
    const inputMonto = elementoFormulario.querySelector("#m_cb_monto");

    const mostrarMonto = (valor) => {
        if (valor) {
            let montoTablaCB = 0;
            for (const cb of arrayDeCajaBancos) {
                if (cb.idfactura === facturaActual[0])
                {
                    montoTablaCB = Number((montoTablaCB + Number(cb.monto)).toFixed(2));
                }
            }
            inputMonto.value = facturaActual[1] - montoTablaCB ? Number((facturaActual[1] - montoTablaCB).toFixed(2)) : "";
        } else {
            inputMonto.value = "";
        }
    }
    await manejarSelect(selectCB, { urlSolicitud: `${CT_URLAPI}listar_caja_bancos_por_usuario/${empresa_id}/${usuario_id}`, llavesOpciones: { valor: "idcaja_bancos", detalle: ["codigo", "tipo_cuenta"] }, callbackInput: mostrarMonto});

    const selectFactura = elementoFormulario.querySelector("#m_cb_facturas");
    const spanMontoFactura = cuerpoModal.querySelector("#span_monto_factura");
    const datosFactura = [];
    const facturaActual = []; // [id, saldo, objetoCajasBancos]
    const cbFacturas = {};
    const objTBody = {};
    const stringCB = JSON.stringify(selectCB.selectize?.options ?? {});
    for (const key in objetoRegistros) {
        const factura = {id: objetoRegistros[key].id, saldo: objetoRegistros[key].saldo, numero: objetoRegistros[key].numero, fecha: formatoFecha(objetoRegistros[key].fecha)};
        datosFactura.push(factura);
        cbFacturas[objetoRegistros[key].id] = JSON.parse(stringCB);
        objTBody[objetoRegistros[key].id] = null
    }

    const FiltrarTabla = (valor) => {
        if(!valor) return;

        facturaActual[0] = valor;
        facturaActual[1] = Number(datosFactura.find((item) => item.id === valor).saldo);
        spanMontoFactura.textContent = formatoDecimal(facturaActual[1]);
        facturaActual[2] = cbFacturas[valor];

        selectCB.selectize?.clear();
        selectCB.selectize?.clearOptions();
        Object.values(cbFacturas[valor]).forEach(option => {
            selectCB.selectize?.addOption(option);
        });
        selectCB.selectize?.refreshOptions(false);

        tablaBody.querySelectorAll("tr").forEach((tr) => {
            if (tr.dataset.id === valor) {
                tr.style.display = ""; // Mostrar la fila
            } else {
                tr.style.display = "none"; // Ocultar la fila
            }
        });
        const tdTotal = cuerpoModal.querySelector("#total");
        let total = 0;
        for (const cb of arrayDeCajaBancos) {
            if (cb.idfactura === facturaActual[0]) total = Number((total + Number(cb.monto)).toFixed(2));
        }
        tdTotal.textContent = formatoDecimal(total);
    }
    manejarSelect(selectFactura, { datosRegistro: datosFactura, llavesOpciones: { valor: "id", detalle: ["fecha", "numero"] }, callbackInput: FiltrarTabla})

    // Preparación y envio de formulario y control de la respuesta
    elementoFormulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const montoP = facturaActual[1];
        const monto = elementoFormulario.querySelector("#m_cb_monto").value;
        let total = Number(monto);
        let totalCB = Number(monto);
        for (const cb of arrayDeCajaBancos) {
            totalCB = Number((totalCB + Number(cb.monto)).toFixed(2));
            if (cb.idfactura === facturaActual[0])
            {
                total = Number((total + Number(cb.monto)).toFixed(2));
            }
        }

        if (total > montoP) {
            const modal = modalDeInformacion("El monto de Cajas y Bancos no debe ser mayor al monto a pagar");
            cuerpoModal.appendChild(modal);
            return;
        }
        if (totalCB === montoPrincipal) {
            botonCajaBanco.classList.remove("btn-warning");
            botonCajaBanco.classList.add("btn-primary");
        }
        if (tablaBody.children.length === 0) {
            divResp.classList.remove("d-none");
        }
        const valueOption = selectCB.value;

        const cajaBanco = selectCB.options[selectCB.selectedIndex].text;
        const i = crearElemento("i", {class: "bi bi-trash"});
        const btnEliminar = crearElemento("button", {class: "btn btn-danger btn-sm", id: `m_t_eliminar_${valueOption}`}, [i]);
        const tdCB = crearElemento("td", undefined, [cajaBanco]);
        const tdMonto = crearElemento("td", {class:"text-end"}, [formatoDecimal(monto)]);
        const tdEliminar = crearElemento("td", undefined, [btnEliminar]);
        const tr = crearElemento("tr", {"data-id": facturaActual[0]}, [tdCB, tdMonto, tdEliminar]);
        tablaBody.appendChild(tr);

        const tdTotal = cuerpoModal.querySelector("#total");
        tdTotal.textContent = formatoDecimal(total);

        const a = selectCB.selectize.getOption(valueOption)
        reiniciarFormulario(elementoFormulario);
        a[0].classList.add("d-none");
        const opcionesSelect = cbFacturas[facturaActual[0]];
        opcionesSelect[valueOption].classes = "d-none";

        arrayDeCajaBancos.push({id: valueOption, monto: monto, idfactura: facturaActual[0]});

        const szFact = selectFactura.selectize?.getOption(facturaActual[0])
        if (szFact && szFact[0] && total === facturaActual[1]) {
            szFact[0].classList.add("icono-ok");
        } else {
            szFact[0].classList.remove("icono-ok");
        }

        btnEliminar.addEventListener("click", () => {
            tr.remove();
            const a = selectCB.selectize.getOption(valueOption)
            a[0].classList.remove("d-none");
            opcionesSelect[valueOption].classes = "";
            selectCB.selectize.refreshOptions(false);
            arrayDeCajaBancos.splice(arrayDeCajaBancos.findIndex((item) => item.id === valueOption && item.idfactura === facturaActual[0]), 1);
            let total = 0;
            for (const cb of arrayDeCajaBancos) {
                if (cb.idfactura === facturaActual[0]) total = Number((total + Number(cb.monto)).toFixed(2));
            }
            const szFact = selectFactura.selectize?.getOption(facturaActual[0])
            if (szFact && szFact[0] && total === facturaActual[1]) {
                szFact[0].classList.add("icono-ok");
            } else {
                szFact[0].classList.remove("icono-ok");
            }
            tdTotal.textContent = formatoDecimal(total);
            if (total < montoP) {
                botonCajaBanco.classList.remove("btn-primary");
                botonCajaBanco.classList.add("btn-warning");
            }
            if (tablaBody.children.length === 0) {
                divResp.classList.add("d-none");
            }
        })
    })

    return modal;
}