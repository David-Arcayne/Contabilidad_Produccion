export const opcionesMetodoDeprId = [
    {clave: "1", valor: "Línea recta"},
    {clave: "2", valor: "Suma de dígitos"},
    {clave: "3", valor: "Unidades Producción"},
];

/**
 * Función a ejecuaar cuando se llena un input text.
 * @param {Event} elemento - Evento del listener del input.
 * @param {HTMLElement} contenedor - Elemento que contiene al input.
 */
export const accionInput = (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const activoFijo = form.querySelector("#depr_af_activo_fijo").parentNode;

    if (elemento.target.checked) {
        activoFijo?.classList.add("d-none");
    } else {
        activoFijo?.classList.remove("d-none");
    }
}

export const formularioDAF = [
    {
        id: "depr_af_depreciacion",
        label: "Método de depreciación",
        forma: "select",
        opciones: opcionesMetodoDeprId, 
        nombre: "metododepreciacion_id",
        required: true
    },
    {
        id: "depr_af_todos",
        label: "Selecionar todos los activos",
        classlabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "seleccionar_todo",
        accion: accionInput,
        // valor: "1",
        editar: false,
    },
    {
        id: "depr_af_activo_fijo",
        label: "Activo fijo",
        forma: "select",
        origen: "./api/activo-fijo/depreciacion", 
        // origen: "./api/activo-fijo/activos", 
        llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] },
        nombre: "activosfijos_id[]",
        multiple: true,
        columnas: "col-12",
        // required: true
    },
];