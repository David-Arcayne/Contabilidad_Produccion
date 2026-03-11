import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { formatoFecha, mostrarJerarquiaPlanDeCuentas } from "../../funciones/Funciones.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
const EMPRESA_ID = getEmpresaId();
const URL = CT_URLAPI;

// =========================================================
// FORMULARIOS Y FUNCIONES PARA TRANSACCIONES
// =========================================================
function filtrarTipoCambio(inputT, contenedor) {
    const valor = inputT.target.value;
    const form = contenedor.closest("form");
    const tcUfv = form.querySelector("#transaccion-tipocambio-ufv");
    const tcDolar = form.querySelector("#transaccion-tipocambio-dolar");
    const tipoCambio = form.querySelector("#transaccion-tipocambio");
    const selectizeTC = tipoCambio.selectize;
    if (valor && selectizeTC) {
        const fecha = formatoFecha(valor);
        const opciones = Object.values(selectizeTC.options);
        let opcionFiltrada = null;
        for (let i = 0; i < opciones.length; i++) {
            if (opciones[i].text.includes(fecha)) {
                opcionFiltrada = opciones[i].value;
                break;
            }
        }
        if (opcionFiltrada) {
            selectizeTC.setValue(opcionFiltrada);
            if(tcUfv) {
                tcUfv.removeAttribute("required");
                tcDolar.removeAttribute("required");
                tcUfv.value = "";
                tcDolar.value = "";
                tcUfv.closest("div").classList.add("d-none");
                tcDolar.closest("div").classList.add("d-none");
            }
        } else {
            selectizeTC.clear();
            if(tcUfv) {
                tcUfv.setAttribute("required", "true");
                tcDolar.setAttribute("required", "true");
                tcUfv.closest("div").classList.remove("d-none");
                tcDolar.closest("div").classList.remove("d-none");
            }
        }
    }
}
function accionTipoCambioI(selectize, contendor) {
    const form = contendor.closest("form");
    const tcUfv = form.querySelector("#transaccion-tipocambio-ufv");
    const tcDolar = form.querySelector("#transaccion-tipocambio-dolar");
    const fechaForm = form.querySelector("#transaccion-fecha").value;
    const fecha = formatoFecha(fechaForm);

    const opciones = Object.values(selectize.options);
    let opcionFiltrada = null;
    for (let i = 0; i < opciones.length; i++) {
        if (opciones[i].text.includes(fecha)) {
            opcionFiltrada = opciones[i].value;
            break;
        }
    }
    if (opcionFiltrada) {
        selectize.setValue(opcionFiltrada);
        if(tcUfv) {
            tcUfv.removeAttribute("required");
            tcDolar.removeAttribute("required");
            tcUfv.value = "";
            tcDolar.value = "";
            tcUfv.closest("div").classList.add("d-none");
            tcDolar.closest("div").classList.add("d-none");
        }
    } else {
        selectize.clear();
        if(tcUfv) {
            tcUfv.setAttribute("required", "true");
            tcDolar.setAttribute("required", "true");
            tcUfv.closest("div").classList.remove("d-none");
            tcDolar.closest("div").classList.remove("d-none");
        }
    }
}

function accionTipoCambio(valor, contendor) {
    const form = contendor.closest("form");
    const tcUfv = form.querySelector("#transaccion-tipocambio-ufv");
    const tcDolar = form.querySelector("#transaccion-tipocambio-dolar");

    if(tcUfv && valor) {
        tcUfv.removeAttribute("required");
        tcDolar.removeAttribute("required");
        tcUfv.value = "";
        tcDolar.value = "";
        tcUfv.closest("div").classList.add("d-none");
        tcDolar.closest("div").classList.add("d-none");
    } else if (tcUfv) {
        tcUfv.setAttribute("required", "true");
        tcDolar.setAttribute("required", "true");
        tcUfv.closest("div").classList.remove("d-none");
        tcDolar.closest("div").classList.remove("d-none");
    }
};

export const formularioTransaccion = (transaccion) => [
    // {
    //     id: "transaccion_codigo",
    //     label: "Cod. transacción",
    //     forma: "input",
    //     tipo: "text",
    //     nombre: "codigotransaccion",
    //     required: true,
    //     n_registro: "ntransaccion",
    //     editar: true,
    // },
    {
        id: "transaccion-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true,
        callbackInput: filtrarTipoCambio,
        ocultar: (transaccion?.formato_transaccion === "por_tipo_mes")? true : false,
    },
    {
        id: "transaccion-tipocambio",
        label: "Historial de Tipo de cambio",
        forma: "select",
        urlSolicitud: `${URL}listatipodecambio/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: [{dato: "fecha", tipo:"fecha"}, "dolar", "ufv"] },
        nombre: "tipodecambio",
        // requerido: true,
        llaveRegistro: "tipocambio",
        callbackAlCargar: accionTipoCambioI,
        callbackInput: accionTipoCambio,
        mantenerValor: true,
    },
    {
        id: "transaccion-tipocambio-ufv",
        label: "UFV",
        forma: "input",
        tipo: "number",
        nombre: "ufv",
        intervalo: "any",
        requerido: true,
        editar: false,
    },
    {
        id: "transaccion-tipocambio-dolar",
        label: "Dolar",
        forma: "input",
        tipo: "number",
        nombre: "dolar",
        requerido: true,
        intervalo: "0.01",
        editar: false,
    },
    {
        id: "transaccion-tipoasiento",
        label: "Tipo de asiento",
        forma: "select",
        urlSolicitud: `${URL}creartipoasientolista/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: "nombre"},
        // origen: `${URL}tipotransaccion`,
        // llaves: { id: "0", sid:"1", detalle: "1"},
        // llaves: { id: "idtipotransaccion", sid:"nombre", detalle: "nombre"},
        nombre: "tipotransaccion",
        requerido: true,
        // llaveRegistro: "ttransaccion",
        llaveRegistro: "idtipotransaccion",
        ocultar: (transaccion?.formato_transaccion === "por_tipo_mes" || transaccion?.formato_transaccion === "por_tipo_gestion" )? true : false,
    },
    {
        id: "transaccion-glosa",
        label: "Glosa",
        forma: "textarea",
        nombre: "descripcion",
        filas: 2,
        requerido: true,
        llaveRegistro: "glosa",
    },
    {
        id: "transaccion-gestion",
        label: "Gestión",
        forma: "select",
        urlSolicitud: `${URL}gestionlista/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: "gestion"},
        nombre: "gestion",
        requerido: true,
        editar: true,
        desactivado: true,
    },
];

export const formularioTransaccionInsertar = (transaccion) => [
    {
        id: "insertartransaccion-codigo",
        label: "N° transacción",
        forma: "input",
        tipo: "text",
        nombre: "codigotransaccion",
        requerido: true,
        valor: transaccion?.ntransaccion ?? "",
        soloLectura: "al_crear",
    },
    {
        id: "insertartransaccion-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha_del_usuario",
        valor: "fecha",
        requerido: true
    },
    {
        id: "insertartransaccion-tipocambio",
        label: "Historial de Tipo de cambio",
        forma: "select",
        urlSolicitud: `${URL}listatipodecambio/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: [{dato: "fecha", tipo:"fecha"}, "dolar", "ufv"] },
        nombre: "tipocambio",
        requerido: true,
    },
    {
        id: "insertartransaccion-tipoasiento",
        label: "Tipo de asiento",
        forma: "select",
        urlSolicitud: `${URL}creartipoasientolista/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: "nombre"},
        nombre: "tipotransaccion",
        requerido: true,
        valor: (transaccion?.formato_transaccion === "por_tipo_mes" || transaccion?.formato_transaccion === "por_tipo_gestion" )? transaccion.idtipotransaccion : null,
        soloLectura: (transaccion?.formato_transaccion === "por_tipo_mes" || transaccion?.formato_transaccion === "por_tipo_gestion" )? "siempre" : null
    },
    {
        id: "insertartransaccion-glosa",
        label: "Glosa",
        forma: "textarea",
        nombre: "glosa",
        filas: 2,
        requerido: true,
    },
];


// =========================================================
// FORMULARIOS Y FUNCIONES PARA DETALLE DE TRANSACCIONES
// =========================================================
export function agregarImpuestoCalculado(prefijoId) {
    return async (inputT, contenedor) => {
        if (!inputT) return;
        const div = contenedor.closest(".card-body");
        const form = contenedor.closest("form") ?? contenedor;
        const inputMonto = div.querySelector("#tr-ac-input-monto");
        const monto = Number(Number(inputMonto.value).toFixed(2));

        const debe = form.querySelector(`#${prefijoId}-debe`);
        const haber = form.querySelector(`#${prefijoId}-haber`);

        const datosImp = await obtenerDatos(`${URL}listar_detalle_trans_monto/${monto}/${inputT}/${EMPRESA_ID}`);
        if (datosImp) {
            if (datosImp.debe || datosImp.haber) {
                const debeImp = Number(Number(datosImp.debe).toFixed(2));
                const haberImp = Number(Number(datosImp.haber).toFixed(2));
                debe.value = debeImp;
                haber.value = haberImp;
            }
        }
    }
}
/** @type {DatosInput[]}*/
export const formularioTransaccionAsientoContable = [
    {
        id: "transasientoccuenta-cuenta",
        label: "Cuenta",
        forma: "select",
        urlSolicitud: `${URL}lista_plande_subcuentas/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "plandecuenta",
        requerido: true,
        llaveRegistro: "idplan",
        callbackInput: agregarImpuestoCalculado("transasientoccuenta"),
        panelDetalle: mostrarJerarquiaPlanDeCuentas,
        editar: false,
    },
    {
        id: "transasientoccuenta-cuenta",
        label: "Cuenta",
        forma: "select",
        urlSolicitud: `${URL}lista_plande_subcuentas/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "plandecuenta",
        requerido: true,
        llaveRegistro: "idplan",
        panelDetalle: mostrarJerarquiaPlanDeCuentas,
        editar: true,
    },
    {
        id: "transasientoccuenta-debe",
        label: "DEBE",
        forma: "input",
        tipo: "number",
        nombre: "debe",
        intervalo: "0.01",
        requerido: true,
        valor: "0",
        valorPorDefecto: "0",
    },
    {
        id: "transasientoccuenta-haber",
        label: "HABER",
        forma: "input",
        tipo: "number",
        nombre: "haber",
        intervalo: "0.01",
        requerido: true,
        valor: "0",
        valorPorDefecto: "0",
    },
    {
        id: "transasientoccuenta-nota",
        label: "Nota",
        forma: "textarea",
        nombre: "nota",
        filas: 1,
    },
];

export const formularioPorAsientoModelo = [
    {
        id: "transasientocontable-asiento",
        label: "Asiento",
        forma: "select",
        urlSolicitud: `${URL}listaasientos/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: "nombre" },
        nombre: "tipoasiento",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: "transasientocontable-monto",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "monto",
        intervalo: "0.01",
        valorMinimo: "0",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
];

// =========================================================
// FORMULARIOS Y FUNCIONES PARA FACTURAS DE VENTAS Y COMPRAS
// =========================================================

export function alternarTipoFactYBtnCajaBanco(prefijoId) {
    return (valor, contenedorInput) => {
        const formulario = contenedorInput.parentNode;
        const btnCajasBancos = formulario.querySelector(`#${prefijoId}-cajasbancos`);
        const tipoFactura = formulario.querySelector(`#${prefijoId}-tipofactura`);

        if (valor === "2") {
            tipoFactura.value = "contado";
        } else if (valor === "1") {
            tipoFactura.value = "credito";
        } else {
            tipoFactura.value = "";
        }

        if (!btnCajasBancos) return;
        const divBtnCajasBancos = btnCajasBancos.closest("div");

        if (valor === "2") {
            divBtnCajasBancos.classList.remove("d-none");
        } else {
            divBtnCajasBancos.classList.add("d-none");
        }
    }
}

export const optnsCobrar = [
    {clave: 1, valor: "Por Cobrar"},
    {clave: 2, valor: "Cobrado"},
];
export const formularioTransaccionFacturaVenta = [
    {
        id: "transfacturaventa-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fechatfactura",
        requerido: true,
        valor: "fecha",
        llaveRegistro: "fecha",
    },
    {
        id: "transfacturaventa-numerofactura",
        label: "# Factura",
        forma: "input",
        tipo: "number",
        nombre: "nfactura",
        requerido: true,
    },
    {
        id: "transfacturaventa-montofactura",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "montofactura",
        intervalo: "0.01",
        requerido: true,
        soloLectura: "al_editar",
    },
    {
        id: "transfacturaventa-cliente",
        label: "Cliente",
        forma: "select",
        urlSolicitud: `${URL}listaclientes/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nsocial"] },
        nombre: "cliente",
        requerido: true,
        llaveRegistro: "idcliente_proveedor",
    },
    {
        id: "transfacturaventa-estado",
        label: "Estado Cobro",
        forma: "select",
        opcionesPredefinidas: optnsCobrar,
        nombre: "cobrado",
        requerido: true,
        llaveRegistro: "cobrado",
        callbackInput: alternarTipoFactYBtnCajaBanco("transfacturaventa"),
        editar: false,
    },
    {
        id: "transfacturaventa-tipofactura",
        label: "Tipo factura",
        forma: "input",
        tipo: "text",
        nombre: "tipo_factura",
        soloLectura: "siempre",
        editar: false,
        ocultar: true,
    },
    {
        id: "transfacturaventa-porconceptode",
        label: "Por concepto de",
        forma: "input",
        tipo: "text",
        nombre: "por_concepto_de",
        requerido: true,
    },
    {
        id: "transfacturaventa-cajasbancos",
        label: "Cajas y Bancos",
        forma: "button",
        nombre: "Asignar Caja/Banco",
        editar: false,
        desactivado: true,
        ocultar: true,
    },
    {
        id: "transfacturaventa-seccionmasregistros",
        textoBoton: "Más datos ...",
        botonConSeccionModal: [
            {
                id: "transfacturaventa-nautorizacion",
                label: "# Autorizacion",
                forma: "input",
                tipo: "text",
                nombre: "nautorizacion",
                valor: "0",
                valorPorDefecto: "0",
            },
            {
                id: "transfacturaventa-codigocontrol",
                label: "#CUF",
                forma: "input",
                tipo: "text",
                nombre: "codigocontrol",
                editar: true,
            },
            {
                id: "transfacturaventa-tasa0",
                label: "Tasa 0",
                forma: "input",
                tipo: "number",
                nombre: "tasacero",
                intervalo: "any",
                valor: "0",
                valorPorDefecto: "0",
            },
            {
                id: "transfacturaventa-export",
                label: "Export",
                forma: "input",
                tipo: "number",
                nombre: "export",
                intervalo: "any",
                valor: "0",
                valorPorDefecto: "0",
            },
            {
                id: "transfacturaventa-npoliza",
                label: "# Poliza",
                forma: "input",
                tipo: "text",
                nombre: "npoliza",
                valor: "0",
                valorPorDefecto: "0",
            },
            {
                id: "transfacturaventa-iceiecdhotros",
                label: "Iceiecdhotros",
                forma: "input",
                tipo: "number",
                nombre: "iceiecdhotros",
                intervalo: "any",
                valor: "0",
                valorPorDefecto: "0",
                llaveRegistro: "ice",
            },
            {
                id: "transfacturaventa-descuentobonificacion",
                label: "Descuento Bonificacion",
                forma: "input",
                tipo: "text",
                nombre: "descuentobonificacion",
                valor: "0",
                valorPorDefecto: "0",
            },
        ]
    }
];

export const optnsPagar = [
    {clave: 1, valor: "Por Pagar"},
    {clave: 2, valor: "Pagado"},
];
/** @type {DatosInput[]}*/
export const formularioTransaccionFacturaCompra = [
    {
        id: "transfacturacompra-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fechatfactura",
        requerido: true,
        valor: "fecha",
        llaveRegistro: "fecha",
    },
    {
        id: "transfacturacompra-numerofactura",
        label: "# Factura",
        forma: "input",
        tipo: "number",
        nombre: "nfactura",
        requerido: true,
    },
    {
        id: "transfacturacompra-montofactura",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "montofactura",
        intervalo: "0.01",
        requerido: true,
        soloLectura: "al_editar",
    },
    {
        id: "transfacturacompra-proveedor",
        label: "Proveedor",
        forma: "select",
        urlSolicitud: `${URL}listaproveedores/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nombre"] },
        nombre: "cliente",
        requerido: true,
        llaveRegistro: "idproveedor",
    },
    {
        id: "transfacturacompra-estado",
        label: "Estado Pago",
        forma: "select",
        opcionesPredefinidas: optnsPagar,
        nombre: "pagado",
        requerido: true,
        llaveRegistro: "pagado",
        callbackInput: alternarTipoFactYBtnCajaBanco("transfacturacompra"),
        editar: false,
    },
    {
        id: "transfacturacompra-tipofactura",
        label: "Tipo factura",
        forma: "input",
        tipo: "text",
        nombre: "tipo_factura",
        soloLectura: "siempre",
        editar: false,
        ocultar: true,
    },
    {
        id: "transfacturacompra-porconceptode",
        label: "Por concepto de",
        forma: "input",
        tipo: "text",
        nombre: "por_concepto_de",
        requerido: true,
    },
    {
        id: "transfacturacompra-cajasbancos",
        label: "Cajas y Bancos",
        forma: "button",
        nombre: "Asignar Caja/Banco",
        editar: false,
        desactivado: true,
        ocultar: true,
    },
    {
        id: "transfacturacompra-seccionmasregistros",
        textoBoton: "Más datos ...",
        botonConSeccionModal: [
            {
                id: "transfacturacompra-nautorizacion",
                label: "# Autorizacion",
                forma: "input",
                tipo: "text",
                nombre: "nautorizacion",
                valor: "0",
                valorPorDefecto: "0",
            },
            {
                id: "transfacturacompra-codigocontrol",
                label: "#CUF",
                forma: "input",
                tipo: "text",
                nombre: "codigocontrol",
                editar: true,
            },
            {
                id: "transfacturacompra-tasa0",
                label: "Tasa 0",
                forma: "input",
                tipo: "number",
                nombre: "tasacero",
                intervalo: "any",
                valor: "0",
                valorPorDefecto: "0",
            },
            {
                id: "transfacturacompra-export",
                label: "Export",
                forma: "input",
                tipo: "number",
                nombre: "export",
                intervalo: "any",
                valor: "0",
                valorPorDefecto: "0",
            },
            {
                id: "transfacturacompra-npoliza",
                label: "# Poliza",
                forma: "input",
                tipo: "text",
                nombre: "npoliza",
                valor: "0",
                valorPorDefecto: "0",
            },
            {
                id: "transfacturacompra-iceiecdhotros",
                label: "Iceiecdhotros",
                forma: "input",
                tipo: "number",
                nombre: "iceiecdhotros",
                intervalo: "any",
                valor: "0",
                valorPorDefecto: "0",
                llaveRegistro: "ice",
            },
            {
                id: "transfacturacompra-descuentobonificacion",
                label: "Descuento Bonificacion",
                forma: "input",
                tipo: "text",
                nombre: "descuentobonificacion",
                valor: "0",
                valorPorDefecto: "0",
            },
        ]
    },
];
