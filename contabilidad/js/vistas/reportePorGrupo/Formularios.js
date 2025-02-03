import { URL_APIC } from "../../../../lib/services.js";
const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

export const formularioRepPorGrupo = [
    {
        id: "repporgrupo_fechaini",
        label: "Desde",
        forma: "input",
        tipo: "date",
        nombre: "fini",
        required: true,
        valor: "date",
        columnas: "col-12 col-sm-6",
    },
    {
        id: "repporgrupo_fechafin",
        label: "Hasta",
        forma: "input",
        tipo: "date",
        nombre: "ffin",
        required: true,
        valor: "date",
        columnas: "col-12 col-sm-6",
    },
    {
        id: "repporgrupo_template",
        label: "Template",
        forma: "select",
        origen: `${URL_APIC}api/listatemplate/${empresa_id}`, 
        llaves: { id: "codigo", detalle: "nombre" },
        nombre: "codigo",
        columnas: "col-12",
        required: true,
    },
];
