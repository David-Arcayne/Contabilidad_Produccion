import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { alternarTransaccionYAsiento, campoSelectGroup, manejarSelect, selectEnEspera } from "../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId, getUsuarioId } from "../../funciones/DatosAuxiliares.js";
import { botonEnCarga, cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { modalDeInformacion, modalManejarRespuestaError, modalRemovible, modalValidarFechaSegunGestion } from "../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos, reiniciarFormulario } from "../../funciones/Solicitudes.js";
import { FacturasComercialCobradas } from "./Funcionalidades/FacturasComercialCobradas.js";
import { FC_Anuladas } from "./Funcionalidades/FC_Anuladas.js";
import { FC_Asignados } from "./Funcionalidades/FC_Asignados.js";
import { FC_Proformas } from "./Funcionalidades/FC_Proformas.js";
import { FC_Validas } from "./Funcionalidades/FC_Validas.js";
import { pdfMakeFacturasComercial } from "./Funcionalidades/ReportesTributario.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de facturas de venta de comercial
 *              Permite registrar, editar y eliminar facturas mediante formularios y tablas dinámicas.
 * Fecha: 17 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaFacturasComercial - Contenedor principal donde se renderiza la vista de facturas de comercial.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function FacturasComercial(permisos, vistaFacturasComercial, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_factura_comercial/${EMPRESA_ID}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaAsignados = crearElemento("div", { class: "d-none", "data-pane-id": "asignados" });
    const vistaDetalleCobros = crearElemento("div", { class: "d-none", "data-pane-id": "cobradas" });
    vistaFacturasComercial.append(vistaPrincipal, vistaAsignados, vistaDetalleCobros);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({ titulo: "Listado de Facturas de Comercial sin Transacción" });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Botón para ver las facturas de comercial asignadas a una transacción.
    const verAsignados = elementoBoton({
        texto: "Facturas Asignadas",
        icono: "card-checklist",
        id: "trb-fcm-asignados",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaAsignados);
            FC_Asignados({
                permisos,
                vistaFacturasComercial: vistaPrincipal,
                vistaFacturasAsignadas: vistaAsignados
            });
        }
    });
    // Select para mostrar las facturas según el tipo especificado.
    const [selectTipo, divTipo] = campoSelectGroup(
        { atributos: { id: "facventacm-tipo", name: "tipo"} },
        { contenido: "Tipo" },
    );
    selectTipo.innerHTML = `
        <option value="">--Elija una opción --</option>
        <option value="1">Válidas</option>
        <option value="2">Anuladas</option>
        <option value="3">Proformas</option>`;
    selectTipo.addEventListener("change", (e) => {
        cambiarVista(vistaPrincipal, vistaAsignados);
        if (e.target.value === "1") {
            FC_Validas({
                permisos,
                vistaFacturasComercial: vistaPrincipal,
                vistaFacturasValidas: vistaAsignados,
            })
        } else if (e.target.value === "2") {
            FC_Anuladas({
                permisos,
                vistaFacturasComercial: vistaPrincipal,
                vistaFacturasAnuladas: vistaAsignados,
            })
        } else if (e.target.value === "3") {
            FC_Proformas({
                permisos,
                vistaFacturasComercial: vistaPrincipal,
                vistaFacturasProformas: vistaAsignados,
            })
        }
        selectTipo.value = "";
    });

    // Opciones de la vista principal
    const opcionesBtns = divOpcionesVista([
        verAsignados,
        divTipo,
    ]);
    vistaPrincipal.appendChild(opcionesBtns);

    const encabezadoTabla = [
        "Selección",
        "Fecha",
        "Cliente",
        "Sucursal",
        "Tipo-Venta",
        "Tipo-Pago",
        "N° Factura",
        "Monto",
        "Saldo",
        "Descuento",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

    // Filtro para mostrar las facturas según el tipo de pago seleccionado.
    const { divTipoPago, selectTipoPago, limpiarFiltros} = filtroPersonalizadoComercial(controladorTabla.setOtrosFiltros);
    // Crear los filtros de la tabla, incluyendo el filtro personalizado para el tipo de pago.
    const divFiltros = crearFiltrosTabla({
        obtenerContenidoReporte: pdfMakeFacturasComercial(controladorTabla.getDatosOriginales),
        controladorTabla,
        contenedorPrincipal: vistaPrincipal,
        filtrosPersonalizados: {
            elementosFiltro: [
                { contenedor: divTipoPago, elemento: selectTipoPago }
            ],
            limpiar: limpiarFiltros
        }
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

        let objetoRegistros = {};
        let totalMonto = 0;
        let totalSaldo = 0;
        for (const item of lista) {
            const registro = item.raw;
            totalMonto += Math.round(parseFloat(registro.montototal || 0) * 100);
            totalSaldo += Math.round(parseFloat(registro.saldo || 0) * 100);

            const celdas = [
                crearElemento("td", { class: "text-center" }, [
                    (PUEDE_EDITAR && PUEDE_ESCRIBIR)
                        ? columnaCheckbox({
                            vistaPrincipal,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                        })
                        : "-"
                ]),
                crearElemento("td", { class: "text-end" }, [item.fechaTexto]),
                crearElemento("td", undefined, [registro.cliente || "-"]),
                crearElemento("td", undefined, [registro.sucursal || "-"]),
                crearElemento("td", undefined, [obtenerTipoVentaComercial(registro.tipoventa)]),
                crearElemento("td", undefined, [registro.tipopago || "-"]),
                crearElemento("td", undefined, [registro.nfactura || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montototal)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.saldo)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.descuento)]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });
            // Botón para mostrar el detalle de los cobros realizados para la factura seleccionada
            const botonDetalle = botonFacturasCobradas(
                () => {
                    cambiarVista(vistaPrincipal, vistaDetalleCobros);
                    FacturasComercialCobradas({
                        permisos,
                        vistaFacturaVentaComercial: vistaPrincipal,
                        vistaDetalleCobros,
                        registroFactura: registro,
                    });
                }
            );
            tdOpciones.appendChild(botonDetalle);
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, celdas);
            fragment.appendChild(fila);
        }

        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 7,
            columnasFinal: 2,
            valores: [totalMonto / 100, totalSaldo / 100]
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
                const [anio, mes, dia] = (registro.fechaventa || "").split("-").map(Number);
                return {
                    raw: registro,
                    fechaBusqueda: { anio, mes, dia },
                    fechaTexto: formatoFecha(registro.fechaventa) || "-",
                    tipoPago: registro.tipopago?.toLowerCase() || "",
                    textoBusqueda: [
                        registro.fechaventa,
                        registro.cliente,
                        registro.sucursal,
                        obtenerTipoVentaComercial(registro.tipoventa),
                        registro.tipopago,
                        registro.nfactura,
                        formatoDecimal(registro.montototal),
                        formatoDecimal(registro.saldo),
                        formatoDecimal(registro.descuento),
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
    const divContenedorCabecera = vistaFacturasComercial.closest("#contenedor-cabecera");
    const btnFacturaComercial = divContenedorCabecera.querySelector("[data-id='facturascomercial']");
    seccionDriverJS(
        [
            {
                element: btnFacturaComercial,
                popover: {
                    title: "Facturas Comercial",
                    description: "Permite gestionar las facturas comercial realizadas.",
                },
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='trb-fcm-asignados']",
                popover: {
                    title: "Facturas Asignadas",
                    description: "Muestra las facturas de comercial asignadas a una transacción.",
                },
            },
            {
                element: divTipo,
                popover: {
                    title: "Tipo de factura",
                    description: "Permite seleccionar el tipo de facturas que se desea visualizar.",
                },
            },
            {
                mainElement: divFiltros,
                element: "#__buscador",
                popover: {
                    title: "Buscar factura",
                    description: "Permite buscar las facturas considerando todas las columnas de la tabla.",
                },
            },
            {
                mainElement: divFiltros,
                element: "[data-id='div-facventacm-tipopago']",
                popover: {
                    title: "Buscar por tipo de pago",
                    description: "Permite filtrar los registros por el tipo de pago de la factura.",
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
                    description: "Elimina los filtros de búsqueda, tipo de pago y fecha aplicados, mostrando todos los registros.",
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
                    title: "Tabla de facturas",
                    description: "Muestra las facturas de comercial que no están asignadas a una transacción, las cuales pueden ser asignadas individualmente o en grupo a una transacción.",
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

// Crear un botón para mostrar el detalle de los cobros
function botonFacturasCobradas(callback) {
    const icono = crearElemento("i", { class: "bi bi-list-ul" });
    const boton = crearElemento("button", { class: "btn btn-primary btn-sm", title: "Detalle cobros", type: "button" }, [icono]);
    boton.addEventListener("click", (e) => {
        e.preventDefault();
        callback();
    });

    return boton;
}

/**
 * Función: Crea un elementocheckbox para seleccionar registros en una tabla.
 * Descripción: Esta función genera un elemento de entrada tipo checkbox que permite seleccionar o deseleccionar registros en una tabla.
 *              Permite manejar la asignación de facturas a una transacción y a Cajas/Bancos mediante un formulario modal.
 *              Al seleccionar un registro, se agrega a un objeto de registros seleccionados y se muestra un botón que abre un modal.
 *              Al deseleccionar, se elimina del objeto y se quita el botón si no hay registros seleccionados.
 * Fecha: 18 de febrero de 2026
 * Autor: Joel Choque
 */
function columnaCheckbox(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registro,
        divTabla,
        URL_LT,
        objetoRegistros,
    } = datosVista;

    const input = crearElemento("input", {type: "checkbox", class: "form-check-input border-primary"});

    input.addEventListener("change", (e) => {
         const divOpcionesExistentes = vistaPrincipal.querySelector("#opciondes_agrupar")

        if (!input.checked) {
            // Eliminar el registro del objeto de registros seleccionados
            delete objetoRegistros[registro.id];
            if (Object.keys(objetoRegistros).length === 0) {
                vistaPrincipal.removeChild(divOpcionesExistentes);
            }
            return;
        }
        // Agregar el registro al objeto de registros seleccionados
        objetoRegistros[registro.id] = registro;
        if (divOpcionesExistentes)  return;

        // Crear el botón para abrir el modal si no existe
        const botonAsientoOTransaccion = crearElemento("button", {class: "btn btn-info btn-sm"}, ["Transacción / Cuenta"]);
        const divOpciones = crearElemento("div", {class: "d-flex justify-content-start mb-2", id: "opciondes_agrupar"}, [botonAsientoOTransaccion]);
        vistaPrincipal.insertBefore(divOpciones, divTabla);

        botonAsientoOTransaccion.addEventListener("click", async (e) => {
            const fnBotonInicial = botonEnCarga(botonAsientoOTransaccion);
            const empresa_id = getEmpresaId();
            const sucursal_id = getSucursalId();
            const usuario_id = getUsuarioId();
            const URL = CT_URLAPI;

            const arrCB = [];
            let totalSaldo = 0;
            for (const key in objetoRegistros) {
                totalSaldo += parseFloat(objetoRegistros[key].saldo ?? 0);
            }

            const { modal, cerrarModal, selectAsientoModelo, selectTransaccion } = await modalFormularioTransCajaBanco(totalSaldo, arrCB, objetoRegistros);
            const btnRegistrar = modal.querySelector("#btn-enviar-formulario");

            vistaPrincipal.appendChild(modal)
            fnBotonInicial();

            if (btnRegistrar) {
                const sumaMonto = parseFloat(totalSaldo.toFixed(2));
                btnRegistrar.addEventListener("click", async (e) => {
                    e.preventDefault();
                    const fnBotonInicial = botonEnCarga(btnRegistrar);

                    if (selectAsientoModelo.value === "" && selectTransaccion.value === "") {
                        const modal = modalDeInformacion("Se debe seleccionar un Asiento Modelo o una Transacción");
                        vistaPrincipal.appendChild(modal);
                        fnBotonInicial();
                        return;
                    }

                    const formularioTransaccion = selectAsientoModelo?.closest("form");
                    const fechaTransaccion = formularioTransaccion.querySelector("#m-cb-fechatrans");
                    if (fechaTransaccion?.value && !await modalValidarFechaSegunGestion(fechaTransaccion.value, vistaPrincipal)) {
                        fnBotonInicial();
                        return;
                    }

                    const datosCB = await obtenerDatos(`${URL}listar_caja_bancos_por_usuario/${empresa_id}/${usuario_id}`);
                    if (datosCB && datosCB.length > 0) {
                        if (arrCB.length > 0) {
                            let total = 0;
                            for (const cb of arrCB) {
                                total = Number((total + Number(cb.monto)).toFixed(2));
                            }
                            if (total > sumaMonto) {
                                const modal = modalDeInformacion("El monto de Cajas y Bancos no debe ser mayor al Monto total");
                                vistaPrincipal.appendChild(modal);
                                fnBotonInicial();
                                return;
                            }
                            if (total !== sumaMonto) {
                                const modal = modalDeInformacion("El monto de Cajas y Bancos debe ser igual al Monto total");
                                vistaPrincipal.appendChild(modal);
                                fnBotonInicial();
                                return;
                            }
                        }
                    }

                    const datosFactura = [];
                    let montoFTotal = 0;
                    for (const key in objetoRegistros) {
                        const factura = {idfactura: objetoRegistros[key].id, monto: objetoRegistros[key].montototal, saldo: objetoRegistros[key].saldo};
                        datosFactura.push(factura);
                        montoFTotal += parseFloat(parseFloat(objetoRegistros[key].montototal).toFixed(2));
                    }
                    const datos = {
                        facturas_comercial: JSON.stringify(datosFactura),
                        cajasBancos: arrCB.length === 0 ? "" : JSON.stringify(arrCB),
                        asiento_modelo: selectAsientoModelo.value,
                        transaccion: selectTransaccion.value,
                        monto_total: montoFTotal,
                        monto_recibo: sumaMonto,
                        fecha: formularioTransaccion?.querySelector("#m-cb-fechatrans")?.value || "",
                        empresa: empresa_id,
                        sucursal: sucursal_id,
                        ver: "cobro_asignacion_factura_comercial",
                        zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        usuario:  usuario_id,
                        tipo: formularioTransaccion?.querySelector(`#m-cb-tipo-transaccion`)?.value || "",
                        cuenta: formularioTransaccion?.querySelector(`#m-cb-cuenta`)?.value || "",
                    }

                    const enviado = async () => {
                        const listaDeRegistros = await obtenerDatos(URL_LT);
                        cargarContenidoTabla(listaDeRegistros);
                        cerrarModal();
                        divOpciones.remove();
                        alertaDeExito(contenedorDeAlertas, "Facturas cobradas");
                    }
                    const error = (respuesta) => {
                        if (modalManejarRespuestaError(vistaPrincipal, respuesta)) {
                            fnBotonInicial();
                            return;
                        }
                        alertaDeError(contenedorDeAlertas, "Ocurrio un error al cobrar las facturas");
                        cerrarModal();
                        divOpciones.remove();
                    }
                    enviarDatosOJson({
                        datos: datos,
                        urlSolicitud: URL,
                        callbackExito: enviado,
                        callbackError: error,
                    });
                });
            }
        });


    });

    return input;
}

/**
 * Función: Crea un modal para asignar facturas a una transacción y a Cajas/Bancos.
 * Descripción: Esta función genera un formulario dentro de un modal que permite asignar facturas a una transacción y a Cajas/Bancos.
 *              Permite seleccionar un asiento modelo o una transacción, y asignar montos a cada factura según las cajas y bancos disponibles.
 *              Al enviar el formulario, se valida la información ingresada y se realiza la asignación correspondiente.
 * Fecha: 18 de febrero de 2026
 * Autor: Joel Choque
 */
async function modalFormularioTransCajaBanco(montoPrincipal, arrCB, objectT) {
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Asignar a un Asiento Modelo o Transacción", estiloModal: "width: 600px;"});

    const formulario = `
    <div>
        <form class="row g-2 mt-0 mb-3">
            <div class="col-12 col-md-6">
                <label for="fcm-mcb-asiento" class="form-label">Asiento Modelo</label>
                <select class="form-select" id="fcm-mcb-asiento" name="asiento_modelo" required data-iclear="false">
                </select>
            </div>
            <div class="col-12 col-md-6">
                <label for="fcm-mcb-transaccion" class="form-label">Transacción</label>
                <select class="form-select" id="fcm-mcb-transaccion" name="transaccion" required data-iclear="false">
                </select>
            </div>
        </form>

        <div class="${montoPrincipal === 0 ? "d-none" : ""}">
            <h6 class="fw-bold">Asignar Montos</h6>
            <div class="">Saldo total: <span>${formatoDecimal(montoPrincipal) || "0.00"}</span></div>
            <div class="">Saldo factura: <span class="text-info fw-bold" id="span_monto_factura">-</span></div>
        </div>
        <form class="mt-0 ${montoPrincipal === 0 ? "d-none" : ""}" id="form_caja_banco">
            <div class= "row g-2 mb-2">
                <div class="col-12 col-md-6">
                    <label for="fcm-mcb-facturas" class="form-label">Facturas</label>
                    <select class="form-select" id="fcm-mcb-facturas" name="factura" required data-iclear="false">
                    </select>
                </div>
            </div>
            <div class="row g-2">
                <div class="col-12 col-md-6">
                    <label for="fcm-mcb-cajabanco" class="form-label">Cajas y Bancos</label>
                    <select class="form-select" id="fcm-mcb-cajabanco" name="cajabanco" required>
                    </select>
                </div>
                <div class="col-12 col-md-6">
                    <label for="fcm-mcb-monto" class="form-label">Monto</label>
                    <input class="form-control" id="fcm-mcb-monto" name="monto" type="number" required="" onkeydown="return event.key !== 'e' &amp;&amp; event.key !== 'E'" step="0.01" min="0.01">
                </div>
                <div class="col-12 text-center pt-2">
                    <button class="btn btn-primary px-5" id="btn-agregar-cb">Agregar</button>
                </div>
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
                <tbody id="fcm-mcb-tabla">
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
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <button class="btn btn-primary" id="btn-enviar-formulario" style="min-width: 100px;">Asignar</button>
            <button type="button" class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 100px;">Cancelar</button>
        </div>
    </div>`;
    const usuario_id = getUsuarioId();
    const empresa_id = getEmpresaId();

    cuerpoModal.innerHTML = formulario;
    const formAsientoTransaccion = cuerpoModal.querySelector("form");
    const selectAsientoModelo = formAsientoTransaccion.querySelector("#fcm-mcb-asiento");
    const selectTransaccion = formAsientoTransaccion.querySelector("#fcm-mcb-transaccion");
    const formCajaBanco = cuerpoModal.querySelector("#form_caja_banco");
    const selectCB = formCajaBanco.querySelector("#fcm-mcb-cajabanco");
    const inputMonto = formCajaBanco.querySelector("#fcm-mcb-monto");
    const divSeccionCB = selectCB.closest(".row");
    const divResp = cuerpoModal.querySelector(".table-responsive");
    const tablaBody = divResp.querySelector("#fcm-mcb-tabla");

    // Funciones y eventos para manejar la lógica de asignación de facturas a asiento modelo o transacción, y la asignación de montos a cajas y bancos.
    const mostrarMonto = (valor) => {
        if (valor) {
            let montoTablaCB = 0;
            for (const cb of arrCB) {
                if (cb.idfactura === facturaActual[0]) {
                    montoTablaCB = Number((montoTablaCB + Number(cb.monto)).toFixed(2));
                }
            }
            inputMonto.value = facturaActual[1] - montoTablaCB ? Number((facturaActual[1] - montoTablaCB).toFixed(2)) : "";
        } else {
            inputMonto.value = "";
        }
    }
    selectEnEspera(selectAsientoModelo);
    selectEnEspera(selectTransaccion);
    selectEnEspera(selectCB);
    const promises = [
        obtenerDatos(`${CT_URLAPI}listaasientos/${empresa_id}`),
        obtenerDatos(`${CT_URLAPI}listatransacciones/${empresa_id}`),
        obtenerDatos(`${CT_URLAPI}listar_caja_bancos_por_usuario/${empresa_id}/${usuario_id}`),
    ];
    const [dataAsientos, dataTransacciones, dataCB] = await Promise.all(promises);
    manejarSelect(
        selectAsientoModelo,
        {
            datosRegistro: dataAsientos,
            llavesOpciones: { valor: "id", detalle: "nombre" },
            mensajeOpcionPorDefecto: "Elija un asiento modelo",
            callbackInput: alternarTransaccionYAsiento("fcm-mcb", undefined, "col-md-6")
        },
        undefined,
        selectAsientoModelo.parentNode
    );
    manejarSelect(
        selectTransaccion,
        {
            datosRegistro: dataTransacciones,
            llavesOpciones: { valor: "id", detalle: ["ntransaccion", "glosa"] },
            mensajeOpcionPorDefecto: "Elija una transacción",
            callbackInput: alternarTransaccionYAsiento("fcm-mcb", undefined, "col-md-6")
        },
        undefined,
        selectTransaccion.parentNode,
    );
    manejarSelect(
        selectCB,
        {
            datosRegistro: dataCB,
            llavesOpciones: { valor: "idcaja_bancos", detalle: ["codigo", "tipo_cuenta"] },
            mensajeOpcionPorDefecto: "Elija una caja/banco",
            callbackInput: mostrarMonto
        },
    );

    // Preparación de datos de las facturas para mostrar el saldo y las opciones de cajas y bancos disponibles según la factura seleccionada, y para manejar la lógica de asignación de montos a cada factura.
    const selectFactura = formCajaBanco.querySelector("#fcm-mcb-facturas");
    const spanMontoFactura = cuerpoModal.querySelector("#span_monto_factura");
    const datosFactura = [];
    const facturaActual = []; // [id, saldo, objetoCajasBancos]
    const cbFacturas = {};
    const objTBody = {};
    const stringCB = JSON.stringify(selectCB.selectize?.options ?? {});
    for (const key in objectT) {
        const factura = {id: objectT[key].id, saldo: objectT[key].saldo, numero: objectT[key].nfactura, fecha: formatoFecha(objectT[key].fechaventa)};
        datosFactura.push(factura);
        cbFacturas[objectT[key].id] = JSON.parse(stringCB);
        objTBody[objectT[key].id] = null;
    }
    const FiltrarTabla = (valor) => {
        facturaActual[0] = valor;
        facturaActual[1] = Number(datosFactura.find((item) => item.id === valor).saldo);
        spanMontoFactura.textContent = formatoDecimal(facturaActual[1]);
        facturaActual[2] = cbFacturas[valor];

        if (facturaActual[1] === 0) {
            divResp.classList.add("d-none");
            divSeccionCB.classList.add("d-none");
        } else {
            divResp.classList.remove("d-none");
            divSeccionCB.classList.remove("d-none");
        }

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
        for (const cb of arrCB) {
            if (cb.idfactura === facturaActual[0]) total = Number((total + Number(cb.monto)).toFixed(2));
        }
        tdTotal.textContent = formatoDecimal(total);
    }
    const CheckFacturas = (selectize) => {
        datosFactura.forEach((factura) => {
            const option = selectize.options[factura.id];
            if (option && Number(factura.saldo) === 0) {
                option.classes = "icono-ok";
            }
        });
    }
    manejarSelect(selectFactura, { datosRegistro: datosFactura, llavesOpciones: { valor: "id", detalle: ["fecha", "numero"] }, callbackAlCargar: CheckFacturas, callbackInput: FiltrarTabla})

    // Preparación y envio de formulario y control de la respuesta
    formCajaBanco.addEventListener("submit", (e) => {
        e.preventDefault();
        const montoP = facturaActual[1];
        const monto = formCajaBanco.querySelector("#fcm-mcb-monto").value;
        let total = Number(monto);
        for (const cb of arrCB) {
            if (cb.idfactura === facturaActual[0])
            {
                total = Number((total + Number(cb.monto)).toFixed(2));
            }
        }

        if (total > montoP) {
            const modal = modalDeInformacion("El monto de Cajas y Bancos no debe ser mayor al monto a cobrar");
            cuerpoModal.appendChild(modal);
            return;
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
        reiniciarFormulario(formCajaBanco);
        a[0].classList.add("d-none");
        const opcionesSelect = cbFacturas[facturaActual[0]];
        opcionesSelect[valueOption].classes = "d-none";

        arrCB.push({id: valueOption, monto: monto, idfactura: facturaActual[0]});

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
            arrCB.splice(arrCB.findIndex((item) => item.id === valueOption && item.idfactura === facturaActual[0]), 1);
            let total = 0;
            for (const cb of arrCB) {
                if (cb.idfactura === facturaActual[0]) total = Number((total + Number(cb.monto)).toFixed(2));
            }
            const szFact = selectFactura.selectize?.getOption(facturaActual[0])
            if (szFact && szFact[0] && total === facturaActual[1]) {
                szFact[0].classList.add("icono-ok");
            } else {
                szFact[0].classList.remove("icono-ok");
            }
            tdTotal.textContent = formatoDecimal(total);
        })
    })

    return { modal, cerrarModal, selectAsientoModelo, selectTransaccion };
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Función para obtener el tipo de venta en formato texto según su código
export function obtenerTipoVentaComercial(tipoVenta) {
    switch (tipoVenta) {
        case "0":
            return "Comprobante";
        case "1":
            return "Factura Compra Venta";
        case "2":
            return "Alquileres";
        case "3":
            return "Exportación";
        default:
            return "-";
    }
}

/**
 * Función: Crea un filtro personalizado para el tipo de pago en la vista de facturas comercial.
 * Descripción: Esta función genera un elemento select que permite filtrar las facturas comercial según el tipo de pago (Contado o Crédito).
 *             Al seleccionar una opción, se aplica el filtro correspondiente a la tabla de facturas.
 *              También proporciona una función para limpiar el filtro y mostrar todas las facturas.
 * Fecha: 18 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Crea un filtro personalizado para el tipo de pago en la vista de facturas comercial.
 * @param {function} setOtrosFiltros - Función para establecer los filtros adicionales en la tabla de facturas.
 * @returns {object} - Un objeto que contiene el elemento select para el tipo de pago, el contenedor del filtro y la función para limpiar los filtros.
 */
export function filtroPersonalizadoComercial(setOtrosFiltros) {
    const [selectTipoPago, divTipoPago] = campoSelectGroup(
        { atributos: { id: "facventacm-tipopago", name: "tipo_pago"} },
        { contenido: "Tipo de pago" },
    );
    selectTipoPago.innerHTML = `
        <option value="" selected>Todos</option>
        <option value="contado">Contado</option>
        <option value="credito">Credito</option>`;
    const fnFiltroTipoPago = (item) => {
        if (selectTipoPago.value && !item.tipoPago.includes(selectTipoPago.value)) {
            return false;
        }
        return true;
    }
    const limpiarFiltros = () => {
        selectTipoPago.value = "";
    }
    selectTipoPago.addEventListener("change", (e) => {
        setOtrosFiltros(fnFiltroTipoPago);
    });
    return { selectTipoPago, divTipoPago, limpiarFiltros };
}