import { URL_APIC } from "../../../../lib/services.js";
const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;



export const formularioTipoAsiento= [
    {
        id: "gruporep_nombre_template",
        label: "Nombre de Template",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        required: true
    },
];