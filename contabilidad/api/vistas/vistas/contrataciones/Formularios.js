import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
const EMPRESA_ID = getEmpresaId();
const URL = CT_URLAPI;

// =========================================================
// FORMULARIOS Y FUNCIONES PARA DOCUMENTO DE COBRO
// =========================================================

const llenarCamposSegunCliente = async (valor, contenedorInput) => {
    const form = contenedorInput.parentNode;
    const nit = form.querySelector("#documentodecobro-nrotributario");

    if (valor) {
        const datosComtrato = await obtenerDatos(`${URL}listar_nro_tributario_cliente/${valor}/1`);

        if (datosComtrato?.[0]?.nro_tributario) {
            nit.value = datosComtrato[0].nro_tributario;
            nit.readOnly = true;
        } else {
            nit.value = "";
            nit.readOnly = false;
        }
    } else {
        nit.value = "";
        nit.readOnly = false;
    }
}

export const formularioDocumentoDeCobro = [
    {
        id: "documentodecobro-asiento-transaccion",
        forma: "hidden",
    },
    {
        id: "documentodecobro-lugar",
        label: "Lugar",
        forma: "input",
        tipo: "text",
        nombre: "lugar",
        requerido: true
    },
    {
        id: "documentodecobro-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true
    },
    {
        id: "documentodecobro-fechafin",
        label: "Fecha final",
        forma: "input",
        tipo: "date",
        nombre: "fecha_vencimiento",
        llaveRegistro: "fecha_venci",
        valor: "fecha",
        requerido: true
    },
    {
        id: "documentodecobro-cliente",
        label: "Cliente",
        forma: "select",
        urlSolicitud: `${URL}listaclientes/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nsocial"] },
        nombre: "id_cliente_proveedor",
        requerido: true,
        callbackInput: llenarCamposSegunCliente
    },
    {
        id: "documentodecobro-nrotributario",
        label: "N° Tributario",
        forma: "input",
        tipo: "text",
        nombre: "nro_tributario",
        requerido: true,
    },
    {
        id: "documentodecobro-repcontacto",
        label: "Representante/Contacto",
        forma: "input",
        tipo: "text",
        nombre: "contacto",
        requerido: true,
    },
    {
        id: "documentodecobro-nrodocidentidad",
        label: "N° Doc. Identidad",
        forma: "input",
        tipo: "text",
        nombre: "nro_doc_identidad",
        requerido: true,
    },
    {
        id: "documentodecobro-tipo",
        label: "Tipo",
        forma: "select",
        urlSolicitud: `${URL}listar_tipo/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idtipo", detalle: [{dato: "nombre", tipo: "estilo"}, "descripcion"] },
        nombre: "idtipo",
        requerido: true
    },
    {
        id: "documentodecobro-concepto",
        label: "Concepto (breve)",
        forma: "input",
        tipo: "text",
        nombre: "concepto",
        requerido: true
    },
    {
        id: "documentodecobro-condiciones",
        label: "Condiciones",
        forma: "textarea",
        nombre: "condiciones",
        filas: 1,
        requerido: true
    },
    {
        id: "documentodecobro-observaciones",
        label: "Observaciones",
        forma: "input",
        tipo: "text",
        nombre: "observaciones",
        requerido: true
    },
    {
        id: "documentodecobro-precio",
        label: "Precio",
        forma: "input",
        tipo: "number",
        nombre: "precio",
        intervalo: "0.01",
        minimo: "0.01",
        requerido: true
    },
    {
        id: "documentodecobro-formapago",
        label: "Frecuencia de Pago",
        forma: "select",
        urlSolicitud: `${URL}listar_forma_pago/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idforma_pago", detalle: ["nombre"] },
        nombre: "forma_pago",
        llaveRegistro: "idforma_pago",
        requerido: true
    },
    {
        id: "documentodecobro-archivo",
        label: "Archivo",
        forma: "input",
        tipo: "file",
        nombre: "archivo",
        divInformacion: true,
    },
];

// =========================================================
// FORMULARIOS Y FUNCIONES PARA DOCUMENTO DE PAGO
// =========================================================

const llenarCamposSegunProveedor = async (valor, contenedorInput) => {
    const form = contenedorInput.parentNode;
    const nit = form.querySelector("#documentodepago-nrotributario");

    if (valor) {
        const datosComtrato = await obtenerDatos(`${URL}listar_nro_tributario_cliente/${valor}/2`);

        if (datosComtrato?.[0]?.nro_tributario) {
            nit.value = datosComtrato[0].nro_tributario;
            nit.readOnly = true;
        } else {
            nit.value = "";
            nit.readOnly = false;
        }
    } else {
        nit.value = "";
        nit.readOnly = false;
    }
}
export const formularioDocumentoDePago = [
    {
        id: "documentodepago-asiento-transaccion",
        forma: "hidden",
    },
    {
        id: "documentodepago-lugar",
        label: "Lugar",
        forma: "input",
        tipo: "text",
        nombre: "lugar",
        requerido: true
    },
    {
        id: "documentodepago-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true
    },
    {
        id: "documentodepago-fechafin",
        label: "Fecha final",
        forma: "input",
        tipo: "date",
        nombre: "fecha_vencimiento",
        llaveRegistro: "fecha_venci",
        valor: "fecha",
        requerido: true
    },
    {
        id: "documentodepago-proveedor",
        label: "Proveedor",
        forma: "select",
        urlSolicitud: `${URL}listaproveedores/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nombre"] },
        nombre: "id_cliente_proveedor",
        requerido: true,
        callbackInput: llenarCamposSegunProveedor
    },
    {
        id: "documentodepago-nrotributario",
        label: "N° Tributario",
        forma: "input",
        tipo: "text",
        nombre: "nro_tributario",
        requerido: true,
    },
    {
        id: "documentodepago-repcontacto",
        label: "Representante/Contacto",
        forma: "input",
        tipo: "text",
        nombre: "contacto",
        requerido: true,
    },
    {
        id: "documentodepago-nrodocidentidad",
        label: "N° Doc. Identidad",
        forma: "input",
        tipo: "text",
        nombre: "nro_doc_identidad",
        requerido: true,
    },
    {
        id: "documentodepago-tipo",
        label: "Tipo",
        forma: "select",
        urlSolicitud: `${URL}listar_tipo/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idtipo", detalle: [{dato: "nombre", tipo: "estilo"}, "descripcion"] },
        nombre: "idtipo",
        requerido: true
    },
    {
        id: "documentodepago-concepto",
        label: "Concepto (breve)",
        forma: "input",
        tipo: "text",
        nombre: "concepto",
        requerido: true
    },
    {
        id: "documentodepago-condiciones",
        label: "Condiciones",
        forma: "textarea",
        nombre: "condiciones",
        filas: 1,
        requerido: true
    },
    {
        id: "documentodepago-observaciones",
        label: "Observaciones",
        forma: "input",
        tipo: "text",
        nombre: "observaciones",
        requerido: true
    },
    {
        id: "documentodepago-precio",
        label: "Precio",
        forma: "input",
        tipo: "number",
        nombre: "precio",
        intervalo: "0.01",
        minimo: "0.01",
        requerido: true
    },
    {
        id: "documentodepago-formapago",
        label: "Frecuencia de Pago",
        forma: "select",
        urlSolicitud: `${URL}listar_forma_pago/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idforma_pago", detalle: ["nombre"] },
        nombre: "forma_pago",
        llaveRegistro: "idforma_pago",
        requerido: true
    },
    {
        id: "documentodepago-archivo",
        label: "Archivo",
        forma: "input",
        tipo: "file",
        nombre: "archivo",
        divInformacion: true,
    },
];