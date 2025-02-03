import { URL_APIC } from "../../../../lib/services.js";
const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

export const formularioPagarFactura= [
    {
        id: "fxppagarfactura_fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "date",
        // required: true
    },
    {
        id: "fxppagarfactura_nro_recibo",
        label: "N. Recibo",
        forma: "input",
        tipo: "text",
        nombre: "nrecibo",
        // required: true
        n_registro: "recibo",
    },
    {
        id: "fxppagarfactura_persona",
        label: "Persona",
        forma: "input",
        tipo: "text",
        nombre: "persona",
        required: true
    },
    {
        id: "fxppagarfactura_ci",
        label: "CI",
        forma: "input",
        tipo: "text",
        nombre: "ci",
        required: true
    },
    {
        id: "fxppagarfactura_monto",
        label: "Monto",
        forma: "input",
        tipo: "text",
        nombre: "monto",
        // required: true
        editar: false,
    },
    {
        id: "fxppagarfactura_asiento",
        label: "Registrar al Asiento",
        forma: "select",
        origen: `${URL_APIC}api/listaasientos/${empresa_id}`, 
        llaves: { id: "id", detalle: "nombre"},
        nombre: "asiento",
        editar: false,
        required: true,
    },
];


export const optnsPagar = [
    {clave: 1, valor: "Por Pagar"},
    {clave: 2, valor: "Pagado"},
];
export const optnsFacturaEspecificacion = [
    {clave: 1, valor: "Compras"},
    {clave: 2, valor: "Ventas"},
];
export const formularioNuevaFactura = [
    {
        id: "trandetallefcompra_fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fechatfactura",
        required: true,
        valor: "date",
        n_registro: "fecha",
    },
    {
        id: "trandetallefcompra_nfactura",
        label: "# Factura",
        forma: "input",
        tipo: "number",
        nombre: "nfactura",
        required: true,
    },
    {
        id: "trandetallefcompra_nautorizacion",
        label: "# Autorizacion",
        forma: "input",
        tipo: "text",
        nombre: "nautorizacion",
        required: true,
    },
    // {
    //     id: "trandetallefcompra_codigocontrol",
    //     label: "#CUF",
    //     forma: "input",
    //     tipo: "text",
    //     nombre: "codigocontrol",
    //     required: true,
    //     editar: true,
    // },
    {
        id: "trandetallefcompra_montofactura",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "montofactura",
        intervalo: "any",
        required: true,
    },
    {
        id: "trandetallefcompra_tasa0",
        label: "Tasa 0",
        forma: "input",
        tipo: "number",
        nombre: "tasacero",
        intervalo: "any",
        required: true,
        valor: "0",
    },
    {
        id: "trandetallefcompra_export",
        label: "Export",
        forma: "input",
        tipo: "number",
        nombre: "export",
        intervalo: "any",
        required: true,
        valor: "0",
    },
    {
        id: "trandetallefcompra_npoliza",
        label: "# Poliza",
        forma: "input",
        tipo: "text",
        nombre: "npoliza",
        required: true,
        valor: "0",
    },
    {
        id: "trandetallefcompra_iceiecdhotros",
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
        id: "trandetallefcompra_descuentobonificacion",
        label: "Descuento Bonificacion",
        forma: "input",
        tipo: "text",
        nombre: "descuentobonificacion",
        required: true,
        valor: "0",
    },
    // {
    //     id: "trandetallefcompra_especificacion",
    //     label: "Especificacion",
    //     forma: "select",
    //     opciones: optnsFacturaEspecificacion, 
    //     nombre: "especificacion",
    //     required: true,
    //     editar: true,
    //     n_registro: "espesificacion",
    // },

    {
        id: "trandetallefcompra_proveedor",
        label: "Proveedor",
        forma: "select",
        origen: `${URL_APIC}api/listaproveedores/${empresa_id}`, 
        llaves: { id: "id", detalle: ["nit", "nombre"] },
        nombre: "cliente",
        required: true,
        n_registro: "idproveedor",
    },
    {
        id: "trandetallefcompra_cobrar",
        label: "Estado Pago",
        forma: "select",
        opciones: optnsPagar, 
        nombre: "pagar",
        required: true,
        valor: 2,
        n_registro: "pagado",
    },
];

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
        required: true
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
        required: true
    },
    {
        id: "reciboxcobrar_saldo",
        label: "Saldo",
        forma: "input",
        tipo: "number",
        nombre: "saldo",
        required: true
    },
    {
        id: "reciboxcobrar_total",
        label: "Total",
        forma: "input",
        tipo: "number",
        // nombre: "total",
        // required: true,
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