import { URL_APIC } from "../../../../lib/services.js";
const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

export const optnsTipo = [
    {clave: "DEBE", valor: "DEBE"},
    {clave: "HABER", valor: "HABER"},
];


export const formularioTipoAsiento= [
    {
        id: "tipoasiento_nombre",
        label: "Nombre de Asiento",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        required: true
    },
    {
        id: "tipoasiento_tipo",
        label: "Saldo Tipo",
        forma: "select",
        // origen: `${URL_APIC}api/tipotransaccion`, 
        // llaves: { id: "0", detalle: "1"},
        // llaves: { id: "idtipotransaccion", sid:"nombre", detalle: "nombre"},
        origen: `${URL_APIC}api/creartipoasientolista/${empresa_id}`, 
        llaves: { id: "id", detalle: "nombre"},
        nombre: "tipo",
        n_registro: "idtipo",
        required: true
    },
];

export const formularioAA = [
    {
        id: "agregarasiento_plandecuenta",
        label: "Cuenta",
        forma: "select",
        origen: `${URL_APIC}api/milistaplanes/${empresa_id}`, 
        llaves: { id: "id", detalle: ["numero", "plan"] },
        nombre: "cuenta",
        n_registro: "idplandecuenta",
        required: true
    },
    {
        id: "agregarasiento_porcentaje",
        label: "Porcentaje",
        forma: "input",
        tipo: "number",
        minimo: "0",
        maximo: "100",
        nombre: "porciento",
        intervalo: "0.01",
        required: true
    },
    {
        id: "agregarasiento_tipo",
        label: "Tipo",
        forma: "select",
        opciones: optnsTipo, 
        nombre: "tipo",
        required: true
    },
];