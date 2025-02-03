import { URL_APIC } from "../../../../lib/services.js";
const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

export const formularioCobrarFactura= [
    {
        id: "fxccobrarfactura_fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "date",
        // required: true
    },
    {
        id: "fxccobrarfactura_nro_recibo",
        label: "N. Recibo",
        forma: "input",
        tipo: "text",
        nombre: "nrecibo",
        // required: true
        n_registro: "recibo",
    },
    {
        id: "fxccobrarfactura_persona",
        label: "Persona",
        forma: "input",
        tipo: "text",
        nombre: "persona",
        required: true
    },
    {
        id: "fxccobrarfactura_ci",
        label: "CI",
        forma: "input",
        tipo: "text",
        nombre: "ci",
        required: true
    },
    {
        id: "fxccobrarfactura_monto",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "monto",
        required: true,
        intervalo: "0.01",
        editar: false,
    },
    {
        id: "fxccobrarfactura_asiento",
        label: "Registrar al Asiento",
        forma: "select",
        origen: `${URL_APIC}api/listaasientos/${empresa_id}`, 
        llaves: { id: "id", detalle: "nombre"},
        opcionesExtraInicio: [{ value: "0", text: "NINGUNO" }],
        nombre: "asiento",
        editar: false,
    },
];

export const optnsFacturaCobrar = [
    {clave: 1, valor: "Por Cobrar"},
    {clave: 2, valor: "Cobrado"},
];
export const optnsFacturaEspecificacion = [
    {clave: 1, valor: "Compras"},
    {clave: 2, valor: "Ventas"},
];
export const formularioNuevaFactura= [
    {
        id: "trandetallefventa_fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fechatfactura",
        required: true,
        valor: "date",
        n_registro: "fecha",
    },
    {
        id: "trandetallefventa_nfactura",
        label: "# Factura",
        forma: "input",
        tipo: "number",
        nombre: "nfactura",
        required: true,
    },
    {
        id: "trandetallefventa_nautorizacion",
        label: "# Autorizacion",
        forma: "input",
        tipo: "text",
        nombre: "nautorizacion",
        required: true,
    },
    // {
    //     id: "trandetallefventa_codigocontrol",
    //     label: "#CUF",
    //     forma: "input",
    //     tipo: "text",
    //     nombre: "codigocontrol",
    //     required: true,
    //     editar: true,
    // },
    {
        id: "trandetallefventa_montofactura",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "montofactura",
        intervalo: "any",
        required: true,
    },
    {
        id: "trandetallefventa_tasa0",
        label: "Tasa 0",
        forma: "input",
        tipo: "number",
        nombre: "tasacero",
        intervalo: "any",
        required: true,
        valor: "0",
    },
    {
        id: "trandetallefventa_export",
        label: "Export",
        forma: "input",
        tipo: "number",
        nombre: "export",
        intervalo: "any",
        required: true,
        valor: "0",
    },
    {
        id: "trandetallefventa_npoliza",
        label: "# Poliza",
        forma: "input",
        tipo: "text",
        nombre: "npoliza",
        required: true,
        valor: "0",
    },
    {
        id: "trandetallefventa_iceiecdhotros",
        label: "Iceiecdhotros",
        forma: "input",
        tipo: "number",
        nombre: "iceiecdhotros",
        intervalo: "any",
        required: true,
        valor: "0",
        n_registro: "ice",
    },
    {
        id: "trandetallefventa_descuentobonificacion",
        label: "Descuento Bonificacion",
        forma: "input",
        tipo: "text",
        nombre: "descuentobonificacion",
        required: true,
        valor: "0",
    },
    // {
    //     id: "trandetallefventa_especificacion",
    //     label: "Especificacion",
    //     forma: "select",
    //     opciones: optnsFacturaEspecificacion, 
    //     nombre: "especificacion",
    //     required: true,
    //     editar: true,
    //     n_registro: "espesificacion",
    // },
    {
        id: "trandetallefventa_cliente",
        label: "Cliente",
        forma: "select",
        origen: `${URL_APIC}api/listaclientes/${empresa_id}`, 
        llaves: { id: "id", detalle: ["nit", "nsocial"] },
        nombre: "cliente",
        required: true,
        n_registro: "idcliente",
    },
    {
        id: "trandetallefventa_cobrar",
        label: "Estado Cobro",
        forma: "select",
        opciones: optnsFacturaCobrar, 
        nombre: "cobrar",
        required: true,
        n_registro: "cobrado",
    },
    // {
    //     id: "trandetallefventa_cuenta",
    //     label: "Cuenta",
    //     forma: "select",
    //     origen: `${URL_APIC}api/milistaplanes/${empresa_id}`, 
    //     llaves: { id: "id", detalle: ["numero", "plan"] },
    //     nombre: "cuenta",
    //     required: true,
    // },
];

// He recibido de:
// La suma de:
// Moneda: Bolivianos, Dólares
// Por concepto de:
// A cuenta:
// Saldo:
// Total:
// Fecha:
// Usuario que recibe:

export const AccionReciboSumar = (valor, contenedor) => {
    const inputTotal = document.getElementById("reciboxcobrar_total");
    const inpputACuenta = document.getElementById("reciboxcobrar_acuenta");
    const inputSaldo = document.getElementById("reciboxcobrar_saldo");

    const valorACuenta = inpputACuenta.value && inpputACuenta.value.trim() !== "" ? parseFloat(inpputACuenta.value) : 0;
    const valorSaldo = inputSaldo.value && inputSaldo.value.trim() !== "" ? parseFloat(inputSaldo.value) : 0;

    inputTotal.value = (valorACuenta + valorSaldo).toFixed(2);
}

export const formularioRecibo = [
    {
        id: "reciboxcobrar_nrorecibo",
        label: "N° Recibo",
        forma: "input",
        tipo: "text",
        nombre: "recibido_de",
        required: true
    },
    {
        id: "reciboxcobrar_recibidode",
        label: "Recibido de",
        forma: "input",
        tipo: "text",
        nombre: "recibido_de",
        required: true
    },
    {
        id: "reciboxcobrar_lasumade",
        label: "La suma de",
        forma: "input",
        tipo: "number",
        nombre: "la_suma_de",
        required: true,
        valor: "0",
    },
    {
        id: "reciboxcobrar_moneda",
        label: "Moneda",
        forma: "select",
        opciones: [
            {clave: 1, valor: "Bolivianos"},
            {clave: 2, valor: "Dólares"},
        ],
        nombre: "moneda",
        required: true
    },
    {
        id: "reciboxcobrar_porconceptode",
        label: "Por concepto de",
        forma: "input",
        tipo: "text",
        nombre: "por_concepto_de",
        required: true
    },
    {
        id: "reciboxcobrar_acuenta",
        label: "A cuenta",
        forma: "input",
        tipo: "number",
        nombre: "a_cuenta",
        required: true,
        valor: "0",
        intervalo: "0.01",
        accion: AccionReciboSumar,
    },
    {
        id: "reciboxcobrar_saldo",
        label: "Saldo",
        forma: "input",
        tipo: "number",
        nombre: "saldo",
        required: true,
        valor: "0",
        intervalo: "0.01",
        accion: AccionReciboSumar,
    },
    {
        id: "reciboxcobrar_total",
        label: "Total",
        forma: "input",
        tipo: "number",
        // nombre: "total",
        // required: true,
        valor: "0",
        intervalo: "any",
        desactivado: true,
    },
    {
        id: "reciboxcobrar_fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        valor: "date",
        nombre: "fecha",
        required: true
    },
    // {
    //     id: "reciboxcobrar_cobrar",
    //     label: "Estado Cobro",
    //     forma: "select",
    //     opciones: optnsFacturaCobrar, 
    //     nombre: "cobrar",
    //     required: true,
    //     n_registro: "cobrado",
    // },
    {
        detalle: "Entregué conforme:",
        seccion: [
            {
                id: "reciboxcobrar_usuario_entrega",
                label: "Nombre completo",
                forma: "input",
                tipo: "text",
                nombre: "usuario_entrega",
                required: true
            },
            {
                id: "reciboxcobrar_ci",
                label: "CI",
                forma: "input",
                tipo: "text",
                nombre: "ci_entrega",
                required: true
            },
        ],
    }, 
    {
        detalle: "Recibi conforme:",
        seccion: [
            {
                id: "reciboxcobrar_usuario_recibe",
                label: "Nombre completo",
                forma: "input",
                tipo: "text",
                nombre: "usuario_recibe",
                // required: true
            },
            {
                id: "reciboxcobrar_ci_recibe",
                label: "CI",
                forma: "input",
                tipo: "text",
                nombre: "ci_recibe",
                // required: true
            },
        ],
    },
];