import { AF_ENV } from "../../../db/environment.js";
import { rellenarSelect } from "../../funciones/Solicitudes.js";

const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
const URL_PROV = `${AF_ENV.apiUrl}/app/cm/api/listaProveedor/${empresa_id}`;

/**
 * 
 * @param {Event} elemento - 
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
function formulario (elemento, contenedor) {
    const form = contenedor.parentNode;
    const tipobien = form.querySelector("#af_tipo_bien");
    $(tipobien)[0].selectize?.destroy();
    if(elemento) {
        rellenarSelect(tipobien, {origen: `./api/tipo-bien/activos/${elemento}`, llaves: { id: "id", detalle: "nombre" }})
    } else {
        tipobien.innerHTML = "<option value>- seleccione categoria -</option>";
    }
}

export const formularioAF = [
    {
        id: "af_nombre",
        label: "Nombre",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        required: true
    },
    {
        id: "af_cantidad",
        label: "Cantidad",
        forma: "input",
        tipo: "number",
        nombre: "cantidad",
        required: true
    },
    {
        id: "af_detalle",
        label: "Detalle",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
        required: true
    },
    {
        id: "af_precio",
        label: "Precio",
        forma: "input",
        tipo: "number",
        nombre: "precio",
        intervalo: "any",
        required: true
    },
    {
        id: "af_fecha_compra",
        label: "Fecha de ingreso",
        forma: "input",
        tipo: "date",
        nombre: "fechacompra",
        valor: "date",
        required: true
    },
    {
        id: "af_categoria",
        label: "Categoría",
        forma: "select",
        origen: "./api/categoria/activos", 
        llaves: { id: "id", detalle: "nombre" },
        accion: formulario,
        nombre: "categorias_id",
        required: true,
        editar: false
    },
    {
        id: "af_tipo_bien",
        label: "Tipo de bien",
        forma: "select",
        origen: "./api/tipo-bien/activos",
        llaves: { id: "id", detalle: "nombre" },
        mensaje: "- seleccione categoria -",
        relacion: "categorias_id",
        nombre: "tipobien_id",
        required: true,
        editar: false
    },
    {
        id: "af_poliza_seguro",
        label: "Nro. Póliza seguro",
        forma: "select",
        origen: "./api/seguros/activos", 
        llaves: { id: "id", detalle: ["poliza", "nombretiposeguro"]},
        nombre: "seguros_id",
    },
    {
        id: "af_observacion",
        label: "Observación",
        forma: "input",
        tipo: "text",
        nombre: "observacion",
        required: true
    },
    {
        id: "af_estado",
        label: "Estado",
        forma: "select",
        origen: "./api/tipo-estado/activos", 
        llaves: { id: "id", detalle: "nombre"},
        nombre: "tipoestado_id",
        required: true,
        editar: false
    },
    {
        id: "af_tipo_inventario",
        label: "Inventario",
        forma: "select",
        origen: "./api/tipo-inventario/activos", 
        llaves: { id: "id", detalle: "nombre"},
        nombre: "tipoinventario_id",
        required: true,
    },
    {
        id: "af_empresa_proveedora",
        label: "Empresa Proveedora",
        forma: "select",
        origen: URL_PROV, 
        llaves: { id: "id", detalle: "nombre" },
        extraApi: true, 
        nombre: "proveedor_id",
        required: true
    },
    {
        id: "af_salvamento",
        label: "Valor de salvamento (%)",
        forma: "input",
        tipo: "number",
        intervalo: "any",
        maximo: "100",
        minimo: "0",
        nombre: "salvamento",
    },
    {
        seccion: [
            {
                id: "af_duracion",
                label: "Duración",
                forma: "input",
                tipo: "number",
                intervalo: "any",
                nombre: "duracion",
            },
            {
                id: "af_unidad_medida",
                label: "Unidad de medida",
                forma: "input",
                tipo: "text",
                nombre: "unidadmedida",
            },
        ],
        detalle: "Caso depreciación diferente a Linea recta"
    }, 
    {
        id: "af_enviar-contabilidad",
        label: "Enviar datos a contabilidad",
        classlabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "enviarcontabilidad",
        editar: false,
        valor: "1",
    },
];

export const formularioAFSituacion = [
    {
        id: "af_situacion_situacion",
        label: "Situacion del activo",
        forma: "select",
        origen: "./api/tipo-situacion/activos", 
        llaves: { id: "id", detalle: "nombre" },
        nombre: "tiposituacion_id",
        required: true
    },
    {
        id: "af_situacion_detalle",
        label: "Detalle",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
        required: true
    },
    {
        id: "af_situacion_fecha",
        label: "Fecha",
        forma: "input",
        tipo: "datetime-local",
        nombre: "fechaingreso",
        required: true
    },
];

export const formularioAFComponentes = [
    {
        id: "af_componente_nombre",
        label: "Nombre",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        required: true
    },
    // {
    //     id: "af_componente_codigo",
    //     label: "Codigo",
    //     forma: "input",
    //     tipo: "text",
    //     nombre: "codigo",
    //     required: true
    // },
    {
        id: "af_componente_cantidad",
        label: "Cantidad",
        forma: "input",
        tipo: "number",
        nombre: "cantidad",
        required: true
    },
    // {
    //     id: "af_componente_estado",
    //     label: "Estado",
    //     forma: "input",
    //     tipo: "text",
    //     nombre: "estado",
    //     required: true
    // },
    {
        id: "af_componente_descripcion",
        label: "Descripción",
        forma: "textarea",
        nombre: "descripcion",
        filas: 1,
        required: true
    },
    {
        id: "af_componente_imagen",
        label: "Imagen",
        forma: "input",
        tipo: "file",
        nombre: "imagen",
    },
];

export const formularioAFRevaluo = [
    {
        id: "af_revaluo_fecha",
        label: "Fecha incorporación",
        forma: "input",
        tipo: "date",
        nombre: "fecharevaluo",
        valor: "date",
        required: true
    },
    {
        id: "af_revaluo_vidautil",
        label: "Vida util",
        forma: "input",
        tipo: "number",
        intervalo: "any",
        nombre: "vidautilrevaluo",
    },
    {
        id: "af_revaluo_duracion",
        label: "Capacidad de fábrica",
        forma: "input",
        tipo: "number",
        intervalo: "any",
        nombre: "duracionrevaluo",
    },
    {
        id: "af_revaluo_valor",
        label: "Valor revaluo",
        forma: "input",
        tipo: "number",
        intervalo: "any",
        nombre: "valorrevaluo",
        required: true
    },
];