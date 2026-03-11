import { campoCheckbox, campoInput, campoSelect, manejarSelect } from "../../funciones/CrearFormulario.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, obtenerFechaActual } from "../../funciones/Funciones.js";
const EMPRESA_ID = getEmpresaId();

// =========================================================
// FORMULARIOS Y FUNCIONES PARA BUSQUEDA DE DOCUMENTOS
// =========================================================

function accionRCBCambiarCliProv(valor, contenedorInput) {
    const form = contenedorInput.parentNode;
    const cliente = form.querySelector("#repcontablebusqueda-cliente");
    const proveedor = form.querySelector("#repcontablebusqueda-proveedor");

    const divCliente = cliente.closest("div");
    const divProveedor = proveedor.closest("div");
    const sCliente = cliente.selectize;
    const sProveedor = proveedor.selectize;

    if (valor === "1") {
        sProveedor ? sProveedor.disable() : proveedor.disabled = true;
        divProveedor.classList.add("d-none");
        sCliente ? sCliente.enable() : cliente.disabled = false;
        divCliente.classList.remove("d-none");
    } else if (valor === "2") {
        sCliente ? sCliente.disable() : cliente.disabled = true;
        divCliente.classList.add("d-none");
        sProveedor ? sProveedor.enable() : proveedor.disabled = false;
        divProveedor.classList.remove("d-none");
    } else {
        sCliente ? sCliente.disable() : cliente.disabled = true;
        divCliente.classList.add("d-none");
        sProveedor ? sProveedor.disable() : proveedor.disabled = true;
        divProveedor.classList.add("d-none");
    }
}
const optnsRCBTipoBusqueda = [
    {clave: 1, valor: "Facturas (Contabilidad)"},
    {clave: 2, valor: "Facturas (Comercial)"},
    {clave: 3, valor: "Documentos"},
];
const optnsRCBTipoTr = [
    {clave: 1, valor: "Venta"},
    {clave: 2, valor: "Compra"},
];
/** @type {DatosInput[]}*/
export const formularioRepContableBusqueda = [
    {
        id: "repcontablebusqueda-reporte",
        label: "Documento:",
        forma: "select",
        opcionesPredefinidas: optnsRCBTipoBusqueda,
        nombre: "tipo_reporte",
        requerido: true,
        clasesColumna: "col-12",
    },
    {
        id: "repcontablebusqueda-gestion",
        label: "Buescar en Gestión:",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}gestionlista/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: "gestion"},
        nombre: "gestion",
        clasesColumna: "col-12",
    },
    {
        id: "repcontablebusqueda-numero",
        label: "N° de Documento:",
        forma: "input",
        tipo: "number",
        nombre: "numero",
        clasesColumna: "col-12",
    },
    {
        id: "repcontablebusqueda-nit",
        label: "Número Tributario:",
        forma: "input",
        tipo: "number",
        nombre: "nit",
        clasesColumna: "col-12",
    },
    {
        id: "repcontablebusqueda-tipo",
        label: "Acción:",
        forma: "select",
        opcionesPredefinidas: optnsRCBTipoTr,
        nombre: "tipo",
        clasesColumna: "col-12",
        callbackInput: accionRCBCambiarCliProv,
    },
    {
        id: "repcontablebusqueda-cliente",
        label: "Cliente:",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}listaclientes/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nsocial"] },
        nombre: "cliente",
        clasesColumna: "col-12",
        ocultar: true,
    },
    {
        id: "repcontablebusqueda-proveedor",
        label: "Proveedor:",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}listaproveedores/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nombre"] },
        nombre: "proveedor",
        clasesColumna: "col-12",
        ocultar: true,
    },
    {
        id: "repcontablebusqueda-fecha",
        label: "Fecha:",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        clasesColumna: "col-12",
    },
    {
        id: "repcontablebusqueda-monto",
        label: "Monto:",
        forma: "input",
        tipo: "number",
        nombre: "monto",
        intervalo: "0.01",
        clasesColumna: "col-12",
    },
];

// =========================================================
// FORMULARIOS Y FUNCIONES PARA REPORTE PERIODICO
// =========================================================

export function formularioPeriodico (datoGA) {
    const arrFiltros = [];
    const arrCamposFormulario = [];

    // input de Mes y Select de Tipo de Asiento que se mostrarán según el formato de transacción
    const [inputMes, divPorMes] = campoInput(
        { atributos: { type: "month", id: "rd-dt-por-mes", name: "por_mes", } },
        { contenido: "Por Mes", agregarClases: "mt-1 mb-1" }
    );
    const [selectTipoAsiento, divPorTipoAsiento] = campoSelect(
        { atributos: { id: "rd-dt-tipo-asiento", name: "por_tipoasiento[]", value: "1", multiple: true } },
        { contenido: "Por Tipo Asiento", agregarClases: "mt-2 mb-1" }
    );
    if (datoGA?.formato_transaccion === "por_tipo_mes") {
        arrFiltros.push(divPorMes, divPorTipoAsiento);
    } else {
        arrFiltros.push(divPorTipoAsiento);
    }
    // Creación de campos del formulario
    const [, divFechaDesde] = campoInput(
        { atributos: { type: "date", id: "fecha-desde", name: "fecha_desde", required: true, value: datoGA?.fechaini || obtenerFechaActual() } },
        { contenido: "Fecha Desde", agregarClases: "mt-2 mb-1" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const [, divFechaHasta] = campoInput(
        { atributos: { type: "date", id: "fecha-hasta", name: "fecha_hasta", required: true, value: obtenerFechaActual() } },
        { contenido: "Fecha Hasta", agregarClases: "mt-2 mb-1" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const [, divConsolidado] = campoCheckbox(
        { atributos: { id: "consolidados-global-general", name: "consolidados_global", value: "1" } },
        { contenido: "Solo Consolidados" },
    );
    const seccionFechas = crearElemento("div", { class: "row g-2 mb-3" }, [divFechaDesde, divFechaHasta ]);
    arrCamposFormulario.push(divConsolidado, seccionFechas);

    const [selectReporteDe, divReporteDe] = campoSelect(
        { atributos: { id: "repcontableperiodico-reportede", name: "reportede", required: true} },
        { contenido: "Reporte de" },
    );
    const filtrosReporteDe = crearElemento("div", { id: "filtros-reportede" });
    const seccionReporteDe = crearElemento("div", { class: "mb-3 p-1 rounded" }, [ divReporteDe, filtrosReporteDe ]);

    const botonEnviar = crearElemento("button", { class: "btn btn-primary px-2 text-nowrap", type: "submit", id: "btn-enviar-formulario" }, ["Obtener Reporte"]);
    const divBotonEnviar = crearElemento("div", { class: "d-grid gap-2" }, [botonEnviar]);

    arrCamposFormulario.push(seccionReporteDe, divBotonEnviar);
    const formulario = crearElemento("form", undefined, arrCamposFormulario);

    // Manejo de eventos y carga de datos de los campos del formulario
    inputMes.addEventListener("change", () => {
        if (inputMes.value) {
            seccionFechas.classList.add("d-none");
        } else {
            seccionFechas.classList.remove("d-none");
        }
    });

    selectReporteDe.innerHTML = `
        <option value="">-- Elija una opción --</option>
        <option value="1">Activo Disponible</option>
        <option value="2">Detalle de Transacción</option>
        <option value="3">Detalle Factura p/Transacción</option>`;
    selectReporteDe.addEventListener("change", (e) => manejarSelectReporteDe(e.target.value));

    manejarSelect( selectTipoAsiento, { urlSolicitud: `${CT_URLAPI}creartipoasientolista/${EMPRESA_ID}`, llavesOpciones: { valor: "id", detalle: "nombre" }, mensajeOpcionPorDefecto: " Todos " });

    // Función para crear los filtros dinámicos del select Reporte de
    async function manejarSelectReporteDe(valor) {
        if (!valor) {
            filtrosReporteDe.innerHTML = "";
            return;
        }
        seccionFechas.classList.remove("d-none");
        inputMes.value = "";
        selectTipoAsiento.selectize ? selectTipoAsiento.selectize.clear() : selectTipoAsiento.value = "";

        filtrosReporteDe.innerHTML = "";

        if (valor === "2") {
            const [, divNotas] = campoCheckbox(
                { atributos: { id: "rd-dt-connota", name: "rd_dettrans_connota", value: "1" } },
                { contenido: "Con notas" },
                { atributos: { class: "mt-2" } }
            );

            filtrosReporteDe.append(...arrFiltros, divNotas);
        } else if (valor === "3") {
            const [selectTipoFactura, divTipoFactura] = campoSelect(
                { atributos: { id: "rd-dft-tipo-factura", name: "rd_detfactrans_tipofactura", value: "1" } },
                { contenido: "Tipo de factura", agregarClases: "mt-2 mb-1" }
            );
            selectTipoFactura.innerHTML = `
                <option value="3" selected>Todos</option>
                <option value="1">Compra</option>
                <option value="2">Venta</option>`;

            filtrosReporteDe.append(...arrFiltros, divTipoFactura);
        }
    }

    return formulario;
}

// =========================================================
// FORMULARIOS Y FUNCIONES PARA REPORTE LIBRO MAYOR
// =========================================================

export function formularioLibroMayor (datoGA) {
    const arrCamposFormulario = [];

    const [, divConsolidado] = campoCheckbox(
        { atributos: { id: "consolidados-global-libromayor", name: "consolidados_global", value: "1" } },
        { contenido: "Solo Consolidados" },
    );
    // Creación de campos del formulario
    const [, divFechaDesde] = campoInput(
        { atributos: { type: "date", id: "fecha-desde", name: "fecha_desde", required: true, value: datoGA?.fechaini || obtenerFechaActual() } },
        { contenido: "Fecha Desde", agregarClases: "mt-2 mb-1" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const [, divFechaHasta] = campoInput(
        { atributos: { type: "date", id: "fecha-hasta", name: "fecha_hasta", required: true, value: obtenerFechaActual() } },
        { contenido: "Fecha Hasta", agregarClases: "mt-2 mb-1" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const seccionFechas = crearElemento("div", { class: "row g-2 mb-3" }, [ divFechaDesde, divFechaHasta ]);
    arrCamposFormulario.push(divConsolidado, seccionFechas);


    const [selectLibroMayor, divLibroMayor] = campoSelect(
        { atributos: { id: "reportelibromayor-plancuenta", name: "cuenta", required: true} },
        { contenido: "Cuenta para Libro Mayor" },
    );
    const [selectLibroMayorFinal, divLibroMayorFinal] = campoSelect(
        { atributos: {id: "reportelibromayor-plancuentafinal", name: "cuenta_final"} },
        { contenido: "Cuenta para Libro Mayor (Final)", agregarClases: "mt-2 mb-1" },
        { atributos: { class: "d-none"}}
    );
    const [checkRangos, divRangos] = campoCheckbox(
        { atributos: { id: "reportelibromayor-simple-rangos", name: "por_rangos", value: "1" } },
        { contenido: "Obtener por rangos" },
        { atributos: { class: "mb-2" } }
    );
    const filtrosLibroMayor = crearElemento("div", { id: "filtros-libromayor" });
    const filtroPrincipalLibroMayor = crearElemento("div", undefined, [divLibroMayorFinal, filtrosLibroMayor]);
    const seccionLibroMayor = crearElemento("div", { class: "mb-3 p-1 rounded" }, [ divRangos, divLibroMayor, filtroPrincipalLibroMayor ]);

    const botonEnviar = crearElemento("button", { class: "btn btn-primary px-2 text-nowrap", type: "submit", id: "btn-enviar-formulario" }, ["Obtener Reporte"]);
    const divBotonEnviar = crearElemento("div", { class: "d-grid gap-2" }, [botonEnviar]);

    arrCamposFormulario.push(seccionLibroMayor, divBotonEnviar);
    const formulario = crearElemento("form", undefined, arrCamposFormulario);

    checkRangos.addEventListener("change", (e) => {
        if (e.target.checked) divLibroMayorFinal.classList.remove("d-none");
        else divLibroMayorFinal.classList.add("d-none");
    });

    manejarSelect( selectLibroMayor, { urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas/${EMPRESA_ID}`, llavesOpciones: { valor: "numero", detalle: ["numero", "plan"] }, callbackInput: manejarSelectLibroMayor }, undefined,  divLibroMayor );

    manejarSelect( selectLibroMayorFinal, { urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas/${EMPRESA_ID}`, llavesOpciones: { valor: "numero", detalle: ["numero", "plan"] }});

    // Funcion para crear los filtros dinámicos del select Libro Mayor
    async function manejarSelectLibroMayor(valor) {
        if (!valor) {
            filtrosLibroMayor.innerHTML = "";
            return;
        }

        if (filtrosLibroMayor.children.length < 1) {
            const [, divTipo] = campoCheckbox(
                { atributos: { id: "lm-con-tipo", name: "lm_con_tipo", valor: "1" } },
                { contenido: "Con Tipo" },
                { atributos: { class: "mt-2" } }
            );
            const [, divNotas] = campoCheckbox(
                { atributos: { id: "lm-con-notas", name: "lm_con_notas", valor: "1" } },
                { contenido: "Con Notas" }
            );
            const [, divGlosa] = campoCheckbox(
                { atributos: { id: "lm-con-glosa", name: "lm_con_glosa", valor: "1" } },
                { contenido: "Con Glosa" }
            );
            filtrosLibroMayor.append(divTipo, divGlosa, divNotas);
        }

        if (selectLibroMayor.value === "") {
            manejarSelect(selectLibroMayorFinal, { urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas/${EMPRESA_ID}`, llavesOpciones: { valor: "numero", detalle: ["numero", "plan"] }});
        } else {
            manejarSelect(selectLibroMayorFinal, { urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas_final/${selectLibroMayor.value}/${EMPRESA_ID}`, llavesOpciones: { valor: "numero", detalle: ["numero", "plan"] }});
        }
    };

    return formulario;
}

// =========================================================
// FORMULARIOS Y FUNCIONES PARA REPORTE COMPROBANTE
// =========================================================

export function formularioComprobante (datoGA) {
    const arrFiltros = [];
    const arrCamposFormulario = [];

    const [inputMes, divPorMes] = campoInput(
        { atributos: { type: "month", id: "rd-dt-por-mes", name: "por_mes", } },
        { contenido: "Por Mes", agregarClases: "mt-1 mb-1" }
    );
    const [selectTipoAsiento, divPorTipoAsiento] = campoSelect(
        { atributos: { id: "rd-dt-tipo-asiento", name: "por_tipoasiento[]", value: "1", multiple: true } },
        { contenido: "Por Tipo Asiento", agregarClases: "mt-2 mb-1" }
    );

    const [inputFechaDesde, divFechaDesde] = campoInput(
        { atributos: { type: "date", id: "repcontablecomprobante-fechainib", name: "fechainib", required: true, value: datoGA?.fechaini || obtenerFechaActual() } },
        { contenido: "Fecha inicio", agregarClases: "mt-2 mb-1" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const [inputFechaHasta, divFechaHasta] = campoInput(
        { atributos: { type: "date", id: "repcontablecomprobante-fechafinb", name: "fechafinb", required: true, value: obtenerFechaActual() } },
        { contenido: "Fecha final", agregarClases: "mt-2 mb-1" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const seccionFechas = crearElemento("div", { class: "row g-2 mb-3" }, [ divFechaDesde, divFechaHasta ]);

    const [inputNumInicio, divNumInicio] = campoInput(
        { atributos: { type: "number", id: "repcontablecomprobante-numini", name: "numini", required: true, disabled: true } },
        { contenido: "N° Inicio", agregarClases: "mt-2 mb-1" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const [inputNumFinal, divNumFinal] = campoInput(
        { atributos: { type: "number", id: "repcontablecomprobante-numfin", name: "numfin", required: true, disabled: true } },
        { contenido: "N° Final", agregarClases: "mt-2 mb-1" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const seccionNumeros = crearElemento("div", { class: "row g-2 mb-3 d-none" }, [ divNumInicio, divNumFinal ]);

    const [selectReporteDe, divReporteDe] = campoSelect(
        { atributos: { id: "repcontablecomprobante-reportede", name: "reportede", required: true } },
        { contenido: "Reporte de" },
    );
    const filtrosReporteDe = crearElemento("div", { id: "filtros-reportede-c" });
    const seccionReporteDe = crearElemento("div", { class: "mb-3 p-1 rounded" }, [ divReporteDe, filtrosReporteDe ]);

    const botonEnviar = crearElemento("button", { class: "btn btn-primary px-2 text-nowrap", type: "submit", id: "btn-enviar-formulario" }, ["Obtener Reporte"]);
    const divBotonEnviar = crearElemento("div", { class: "d-grid gap-2" }, [botonEnviar]);

    const [, divConsolidado] = campoCheckbox(
        { atributos: { id: "consolidados-global-comprobante", name: "consolidados_global", value: "1" } },
        { contenido: "Solo Consolidados" },
    );

    // Agregando los campos al formulario según el formato de transacción
    if (datoGA?.formato_transaccion === "por_tipo_mes") {
        arrFiltros.push(divPorMes, divPorTipoAsiento);
        arrCamposFormulario.push(divConsolidado);
    } else {
        arrFiltros.push(divPorTipoAsiento);
        if (datoGA?.formato_transaccion !== "por_tipo_gestion") {
            divConsolidado.classList.add("col-auto");
            const opciones = crearElemento("div", { class: "col-auto" }, [opcionesFechaNumero()]);
            const divFlex = crearElemento("div", { class: "row g-2 justify-content-between" }, [opciones, divConsolidado]);
            arrCamposFormulario.push(divFlex);
        } else {
            arrCamposFormulario.push(divConsolidado);
        }
    }
    arrCamposFormulario.push(seccionFechas, seccionNumeros, seccionReporteDe, divBotonEnviar);
    const formulario = crearElemento("form", undefined, arrCamposFormulario);

    // Manejo de eventos y carga de datos de los campos del formulario
    selectReporteDe.innerHTML = `
        <option value="">-- Elija una opción --</option>
        <option value="1">Comprobante Contable</option>
        <option value="2">Comprobante de Efectivo</option>`;
    selectReporteDe.addEventListener("change", (e) => manejarSelectReporteDe(e.target.value));

    manejarSelect( selectTipoAsiento, { urlSolicitud: `${CT_URLAPI}creartipoasientolista/${EMPRESA_ID}`, llavesOpciones: { valor: "id", detalle: "nombre" }, mensajeOpcionPorDefecto: " Todos " });

    inputMes.addEventListener("change", () => {
        if (inputMes.value) {
            seccionFechas.classList.add("d-none");
            inputFechaDesde.disabled = true;
            inputFechaHasta.disabled = true;
        } else {
            seccionFechas.classList.remove("d-none");
            inputFechaDesde.disabled = false;
            inputFechaHasta.disabled = false;
        }
    });

    // Función para crear los filtros dinámicos del select Reporte de.
    function manejarSelectReporteDe(valor) {
        filtrosReporteDe.innerHTML = "";
        inputMes.value = "";
        selectTipoAsiento.selectize ? selectTipoAsiento.selectize.clear() : selectTipoAsiento.value = "";
        const opcionRangos = formulario.querySelector("button[data-id='rangos']");
        if (!opcionRangos?.classList.contains("btn-success")) {
            seccionFechas.classList.remove("d-none");
            inputFechaDesde.disabled = false;
            inputFechaHasta.disabled = false;
        }

        if (!valor) return;

        if (valor === "1") {
            const [, divConNotas] = campoCheckbox(
                { atributos: { id: "cc-con-notas", name: "cc_con_notas", value: "1" } },
                { contenido: "Con notas" },
                { atributos: { class: "mt-2" } }
            );
            const [, divConFacturas] = campoCheckbox(
                { atributos: { id: "cc-con-facturas", name: "cc_con_facturas", value: "1" } },
                { contenido: "Con Facturas" },
            );
            const [, divConRecibos] = campoCheckbox(
                { atributos: { id: "cc-con-recibos", name: "cc_con_recibos", value: "1" } },
                { contenido: "Con Comprobante de Efectivo" }
            );

            filtrosReporteDe.append(...arrFiltros, divConNotas, divConFacturas, divConRecibos);

        } else if (valor === "2") {
            const [, divConRecibos] = campoCheckbox(
                { atributos: { id: "cie-ingresos", name: "cie_in_eg", value: "1", type:"radio", checked: true } },
                { contenido: "Ingresos" },
                { atributos: { class: "mt-2" } }
            );
            const [, divConEgresos] = campoCheckbox(
                { atributos: { id: "cie-egresos", name: "cie_in_eg", value: "2", type:"radio" } },
                { contenido: "Egresos" }
            );
            filtrosReporteDe.append(divConRecibos, divConEgresos);
        }
    }

    // Función para crear el botón de opciones Fecha / Número
    function opcionesFechaNumero() {
        const btnF = crearElemento("button", { class: "btn btn-success btn-sm", type:"button", "data-id": "fechas" }, ["Fechas"]);
        const btnR = crearElemento("button", { class: "btn btn-outline-success btn-sm", type:"button", "data-id": "rangos" }, ["Rangos"]);
        const div = crearElemento("div", { class: "btn-group", id: "opciones-c-fecha-numero", role: "group", "aria-label": "Small button group" }, [btnF, btnR]);

        seccionFechas.classList.remove("d-none");
        inputFechaDesde.disabled = false;
        inputFechaHasta.disabled = false;
        seccionNumeros.classList.add("d-none");
        inputNumInicio.disabled = true;
        inputNumFinal.disabled = true;

        btnF.addEventListener("click", () => {
            btnF.setAttribute("class", "btn btn-success btn-sm");
            btnR.setAttribute("class", "btn btn-outline-success btn-sm");

            seccionNumeros.classList.add("d-none");
            inputNumInicio.disabled = true;
            inputNumFinal.disabled = true;
            seccionFechas.classList.remove("d-none");
            inputFechaDesde.disabled = false;
            inputFechaHasta.disabled = false;
        });

        btnR.addEventListener("click", () => {
            btnF.setAttribute("class", "btn btn-outline-success btn-sm");
            btnR.setAttribute("class", "btn btn-success btn-sm");

            seccionNumeros.classList.remove("d-none");
            inputNumInicio.disabled = false;
            inputNumFinal.disabled = false;
            seccionFechas.classList.add("d-none");
            inputFechaDesde.disabled = true;
            inputFechaHasta.disabled = true;
        });

        return div;
    }

    return formulario;
}
