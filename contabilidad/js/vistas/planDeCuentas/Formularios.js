import { URL_APIC } from "../../../../lib/services.js";
const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

export const optnsTipoSaldo = [
    {clave: "DEBE", valor: "DEBE"},
    {clave: "HABER", valor: "HABER"},
];


export const formularioPlanDeCuentas = [
    {
        id: "plancuenta_codigo",
        label: "Código",
        forma: "input",
        tipo: "text",
        nombre: "numero",
        required: true
    },
    {
        id: "plancuenta_cuenta",
        label: "Cuenta",
        forma: "input",
        tipo: "text",
        nombre: "plan",
        required: true
    },
    {
        id: "plancuenta_plandecuenta",
        label: "Cuenta de Agrupación",
        forma: "select",
        origen: `${URL_APIC}api/milistaplanes/${empresa_id}`, 
        llaves: { id: "id", detalle: ["numero", "plan"] },
        nombre: "plandecuenta",
        n_registro: "idp",
    },
    {
        id: "plancuenta_tipo_saldo",
        label: "Saldo Tipo",
        forma: "select",
        opciones: optnsTipoSaldo, 
        nombre: "tipo",
        required: true
    },
    {
        id: "plancuenta_descripcion",
        label: "Descripción",
        forma: "textarea",
        nombre: "descripcion",
        filas: 1,
        required: true
    },
];