import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";

const empresa_id = getEmpresaId();

export const optnsTipoRepoerte = [
    {clave: 1, valor: "Comprobante Contable y Reportes"},
    // {clave: 2, valor: "Comprobante Caja o I/E"},
    // {clave: 3, valor: "Reporte de Caja/Bancos"},
    {clave: 4, valor: "Estados Financieros"},
    {clave: 5, valor: "Reportes Complementarios"},
];
export const optnsTipo = [
    {clave: "responsable", valor: "Responsable"},
    {clave: "no firma", valor: "No firma"},
];

/** @type {DatosInput[]}*/
export const formularioFirmas = [
    {
        id: "controlfirmas-tiporeporte",
        label: "Documento",
        forma: "select",
        opcionesPredefinidas: optnsTipoRepoerte,
        nombre: "tipo_reporte",
        requerido: true,
    },
    {
        id: "controlfirmas-usuario",
        label: "Usuario",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}listar_usuarios/${empresa_id}`,
        llavesOpciones: { valor: "idtrabajador", detalle: ["nombre_usuario", "nombre_trabajador", "ci"] },
        nombre: "idtrabajador",
        requerido: true,
    },
    {
        id: "controlfirmas-matriculaprofesional",
        label: "Matrícula Profesional",
        forma: "input",
        tipo: "text",
        nombre: "matricula",
    },
    {
        id: "controlfirmas-permisos",
        label: "Función",
        forma: "input",
        tipo: "text",
        nombre: "funcion",
        requerido: true,
    },
];