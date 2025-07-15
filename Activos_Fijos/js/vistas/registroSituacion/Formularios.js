import { rellenarSelect } from "../../funciones/Solicitudes.js";

export const formularioSituacion = [
    {
        id: "situacion_fecha",
        label: "Fecha salida",
        forma: "input",
        tipo: "datetime-local",
        nombre: "fechasalida",
        required: true
    },
    {
        id: "situacion_costo",
        label: "Costo",
        forma: "input",
        tipo: "number",
        nombre: "costo",
        intervalo: "any",
        required: true
    },
    {
        id: "situacion_situacion",
        label: "Nombre",
        forma: "select",
        origen: "./api/tipo-situacion/activos", 
        llaves: { id: "id", detalle: "nombre" },
        nombre: "tiposituacion_id",
        required: true
    },
    {
        id: "situacion_enviar-contabilidad",
        label: "Enviar datos a contabilidad",
        classlabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "enviarcontabilidad",
        editar: false,
        valor: "1",
    },
];

/**
 * 
 * @param {Event} elemento - 
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
function formulario (elemento, contenedor) {
    const form = contenedor.parentNode;
    const tipobien = form.querySelector("#situacion_componentes");

    const a = $(tipobien)
    a[0].selectize?.destroy();
    
    if (elemento) {
        rellenarSelect(tipobien, {origen: `./api/componentes/activofijo/${elemento}`, llaves: { id: "id", detalle: "nombre" }})
    } else {
        tipobien.value = "";
    }
}

export const formularioAFSituacion = [
    {
        id: "situacion_activofijo",
        label: "Activos Fijos",
        forma: "select",
        origen: "./api/activo-fijo/activos-inv-unitarios", 
        llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] },
        accion: formulario,
        nombre: "activosfijos_id",
        required: true
    },
    {
        id: "situacion_componentes",
        label: "Componentes",
        forma: "select",
        origen: "./api/componentes", 
        llaves: { id: "id", detalle: ["nombre", "detalle"]},
        mensaje: "- seleccione A.F. -",
        relacion: "activosfijos_id",
        nombre: "componentes_id",
    },
    {
        id: "situacion_situacion",
        label: "Situacion del activo",
        forma: "select",
        origen: "./api/tipo-situacion/activos", 
        llaves: { id: "id", detalle: "nombre" },
        nombre: "tiposituacion_id",
        required: true
    },
    {
        id: "situacion_detalle",
        label: "Detalle",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
        required: true
    },
    {
        id: "situacion_fecha",
        label: "Fecha Ingreso",
        forma: "input",
        tipo: "datetime-local",
        nombre: "fechaingreso",
        valor: "datetime",
        required: true
    },
    {
        id: "situacion_fecha_tentativa",
        label: "Fecha Salida (tentativo)",
        forma: "input",
        tipo: "datetime-local",
        nombre: "fechafin",
        valor: "datetime",
        required: true
    },
];