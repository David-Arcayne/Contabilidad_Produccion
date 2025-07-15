import { AF_ENV } from "../../../db/environment.js";

export const opcionesEmpresaId = [
    {clave: "1", valor: "Aseguradora SA"},
    {clave: "2", valor: "Seguros SRL"},
    {clave: "3", valor: "Seguros Seguro"},
]

const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
const URL = `${AF_ENV.apiUrl}/app/cm/api/listaProveedor/${empresa_id}`;

export const formularioSeguros = [
    {
        id: "seguro_empresa",
        label: "Empresa Aseguradora",
        forma: "select",
        origen: URL, 
        llaves: { id: "id", detalle: "nombre" },
        extraApi: true, 
        nombre: "empresaseguro_id",
        required: true
    },
    {
        id: "seguro_tipo",
        label: "Tipo de seguro",
        forma: "select",
        origen: "./api/tipo-seguro/activos", 
        llaves: { id: "id", detalle: "nombre" },
        nombre: "tiposeguro_id",
        required: true
    },
    {
        id: "seguro_poliza",
        label: "Nro. Póliza",
        forma: "input",
        tipo: "number",
        nombre: "poliza",
        required: true
    },
    {
        id: "seguro_codigo",
        label: "Código",
        forma: "input",
        tipo: "text",
        nombre: "codigo",
        required: true
    },
    {
        id: "seguro_certificado",
        label: "Certificado",
        forma: "input",
        tipo: "text",
        nombre: "certificado",
        required: true
    },
    {
        id: "seguro_fecha_inicio",
        label: "Inicio del seguro",
        forma: "input",
        tipo: "datetime-local",
        valor: "datetime",
        nombre: "periodoa",
        required: true
    },
    {
        id: "seguro_fecha_fin",
        label: "Caducidad del seguro",
        forma: "input",
        tipo: "datetime-local",
        nombre: "periodob",
        required: true
    },
    {
        id: "seguro_detalle",
        label: "Detalle de cobertura",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
        required: true
    },
    {
        id: "seguro_contacto",
        label: "Contacto",
        forma: "input",
        tipo: "text",
        nombre: "contacto",
        required: true
    },
    {
        id: "seguro_contrato_pdf",
        label: "Contrato",
        forma: "input",
        tipo: "file",
        nombre: "contrato_pdf",
    },
];