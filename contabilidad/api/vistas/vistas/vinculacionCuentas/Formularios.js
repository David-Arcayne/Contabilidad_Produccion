import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { mostrarJerarquiaPlanDeCuentas } from "../../funciones/Funciones.js";
const EMPRESA_ID = getEmpresaId();

// IMPUESTOS
/** @type {DatosInput[]}*/
export const formularioImpuesto = [
    {
        id: "impuesto-codigo",
        label: "Código",
        forma: "input",
        tipo: "text",
        nombre: "codigo",
        requerido: true,
        llaveRegistro: "codigoimpuesto",
    },
    {
        id: "impuesto-nombre",
        label: "Nombre",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true,
        llaveRegistro: "nombreimpuesto",
    },
    {
        id: "impuesto-tasa",
        label: "Tasa",
        forma: "input",
        tipo: "number",
        nombre: "tasa",
        requerido: true,
    },
    {
        id: "impuesto-descripcion",
        label: "Descripción",
        forma: "input",
        tipo: "text",
        nombre: "descripcion",
        requerido: true,
    },
    {
        id: "impuesto-vencimiento",
        label: "Vencimiento",
        forma: "input",
        tipo: "text",
        nombre: "vencimiento",
        requerido: true,
    },
    {
        id: "impuesto-periodicidad",
        label: "Periodicidad",
        forma: "input",
        tipo: "text",
        nombre: "periodicidad",
        requerido: true,
    },
];

// CUENTAS
export const optnsTipoCF = [
    {clave: 1, valor: "Cuenta por Cobrar"},
    {clave: 2, valor: "Cuenta por Pagar"},
    {clave: 3, valor: "Cuenta de cierre de gestión"},
];
/** @type {DatosInput[]}*/
export const formularioCuentaFactura = [
    {
        id: "cuentafactura-tipo",
        label: "Tipo de Cuenta",
        forma: "select",
        opcionesPredefinidas: optnsTipoCF,
        nombre: "tipocuenta_id",
        llaveRegistro: "cobrar_pagar",
        requerido: true,
        editar: false,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: "cuentafactura-cuenta",
        label: "Cuenta",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}listar_cuentas_NoVinculadas_subcuentas/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "plancuenta_id",
        llaveRegistro: "idplandecuenta",
        panelDetalle: mostrarJerarquiaPlanDeCuentas,
        requerido: true,
        editar: false,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: "cuentafactura-cuenta",
        label: "Cuenta",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}listar_cuentas_NoVinculadas_subcuentas/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "idplandecuenta",
        requerido: true,
        panelDetalle: mostrarJerarquiaPlanDeCuentas,
        editar: true,
        clasesColumna: "col-12",
    },
];

// CUENTAS - CAJAS Y BANCOS
/** @type {DatosInput[]}*/
export const formularioVinculacionCajasYBancos = [
    {
        id: "vinculacioncbcc-codigo",
        label: "Código",
        forma: "input",
        tipo: "text",
        nombre: "codigo",
        requerido: true,
    },
    {
        id: "vinculacioncbcc-tipo",
        label: "Nombre Caja o Banco",
        forma: "input",
        tipo: "text",
        nombre: "tipo_cuenta",
        requerido: true,
    },
    {
        id: "vinculacioncbcc-glosa",
        label: "Descripción",
        forma: "input",
        tipo: "text",
        nombre: "glosa",
        requerido: true,
    },
    {
        id: "vinculacioncbcc-cuenta",
        label: "Cuenta de Activo Disponible",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "idplandecuenta",
        panelDetalle: mostrarJerarquiaPlanDeCuentas,
        requerido: true,
    },
];

export const formularioCBUsuario = (prefijo = "" ) => [
    {
        id: `${prefijo}cbusuarios-usuario`,
        label: "Persona asignada",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}listar_usuarios/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idtrabajador", detalle: ["nombre_usuario", "nombre_trabajador", "ci"] },
        nombre: "idtrabajador",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: `${prefijo}cbusuarios-funcion`,
        label: "Función",
        forma: "select",
        opcionesPredefinidas: [
            {clave: "responsable", valor: "Responsable"},
            {clave: "supervisor", valor: "Supervisor"},
            {clave: "no firma", valor: "No firma"},
        ],
        nombre: "funcion",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: `${prefijo}cbusuarios-permiso`,
        label: "Permiso (registro Transacción)",
        forma: "select",
        opcionesPredefinidas: [
            {clave: "si", valor: "Si"},
            {clave: "no", valor: "No"},
        ],
        nombre: "permiso_registrar",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },

];