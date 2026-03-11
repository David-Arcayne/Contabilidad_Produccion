import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
const empresa_id =getEmpresaId();

/** @type {DatosInput[]}*/
export const formularioRepPorGrupo = [
    {
        id: "repporgrupo_fechaini",
        label: "Desde",
        forma: "input",
        tipo: "date",
        nombre: "fini",
        requerido: true,
        valor: "fecha",
        clasesColumna: "col-12 col-sm-6",
    },
    {
        id: "repporgrupo_fechafin",
        label: "Hasta",
        forma: "input",
        tipo: "date",
        nombre: "ffin",
        requerido: true,
        valor: "fecha",
        clasesColumna: "col-12 col-sm-6",
    },
    {
        id: "repporgrupo_template",
        label: "Template",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}listatemplate/${empresa_id}`,
        llavesOpciones: { valor: "codigo", detalle: "nombre" },
        nombre: "codigo",
        clasesColumna: "col-12",
        requerido: true,
    },
];
