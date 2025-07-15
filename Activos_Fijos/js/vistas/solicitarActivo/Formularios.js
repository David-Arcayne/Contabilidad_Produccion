import { obtenerDatos } from "../../funciones/Solicitudes.js";

export const opcionesTipoSolicitud = [
    {clave: "1", valor: "Asignación de A.F."},
    {clave: "2", valor: "Devolución de A.F."},
]

export const formularioSolicitarAF = [
    {
        id: "solicitar_af_nombre",
        label: "Título",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
        required: true
    },
    {
        id: "solicitar_af_tipo",
        label: "Tipo de solicitud",
        forma: "select",
        opciones: opcionesTipoSolicitud, 
        nombre: "tiposolicitud",
        required: true,
        editar: false,
    },
];

/**
 * Función a ejecutar cuando se selecciona una opción.
 * @param {string} elemento - Valor de la opción seleccionada.
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
export const accionSelect = async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const nuevoActivo = form.querySelector("#s_activofijo_nombre").parentNode;
    const detalle = form.querySelector("#s_activofijo_detalle").parentNode;
    const a = document.createElement("div");

    const cantidad = form.querySelector("#s_activofijo_cantidad");
    const cantidadD = form.querySelector("#s_activofijo_cantidad_disponible");

    if (elemento) {
        nuevoActivo?.classList.add("d-none");
        detalle?.classList.add("d-none");
        const activofijo = await obtenerDatos(`./api/activo-fijo/${elemento}`);
        if (activofijo && activofijo.data?.cantidadactual) {
            cantidadD.value = activofijo.data.cantidadactual;
            cantidad.setAttribute("max", `${activofijo.data.cantidadactual}`);
        } else {
            cantidadD.value = 0;
            cantidad.removeAttribute("max");
        }
    } else {
        cantidadD.value = 0;
        nuevoActivo?.classList.remove("d-none");
        detalle?.classList.remove("d-none");
        cantidad.removeAttribute("max");
    }
}

/**
 * Función a ejecuaar cuando se llena un input text.
 * @param {Event} elemento - Evento del listener del input.
 * @param {HTMLElement} contenedor - Elemento que contiene al input.
 */
export const accionInput = (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const activoFijo = form.querySelector("#s_activofijo_af_id").parentNode;
    const cantidadD = form.querySelector("#s_activofijo_cantidad_disponible").parentNode;
    const a = $(activoFijo)
    a[0].selectize?.destroy();

    if (elemento.target.value ) {
        activoFijo?.classList.add("d-none");
        cantidadD?.classList.add("d-none");
    } else {
        activoFijo?.classList.remove("d-none");
        cantidadD?.classList.remove("d-none");
    }
}

export const formularioAF = [
    {
        id: "s_activofijo_af_id",
        label: "Activo Fijo (disponibles)",
        forma: "select",
        origen: "./api/solicitud-activo/activo-fijo/activos", 
        llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] },
        accion: accionSelect,
        nombre: "activosfijos_id",
    },
    {
        id: "s_activofijo_nombre",
        label: "Activo Fijo (nuevo)",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        accion: accionInput,
    },
    {
        id: "s_activofijo_cantidad_disponible",
        label: "Cantidad disponible",
        forma: "input",
        tipo: "number",
        desactivado: true,
    },
    {
        id: "s_activofijo_cantidad",
        label: "Cantidad",
        forma: "input",
        tipo: "number",
        nombre: "cantidad",
        required: true
    },
    {
        id: "s_activofijo_detalle",
        label: "Descipción",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
    },
];


/**
 * Función a ejecutar cuando se selecciona una opción.
 * @param {string} elemento - Valor de la opción seleccionada.
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
export const accionSelectDev = (usuarioId) => {
    return async (elemento, contenedor) => {
        const form = contenedor.parentNode;
    
        const cantidad = form.querySelector("#dev_activofijo_cantidad");
        const cantidadD = form.querySelector("#dev_activofijo_cantidad_disponible");
    
        if (elemento) {
            const activofijo = await obtenerDatos(`./api/activo-fijo/por-usuario/${elemento}/${usuarioId}`);
            if (activofijo && activofijo.data?.cantidadactual) {
                cantidadD.value = activofijo.data.cantidadactual;
                cantidad.setAttribute("max", `${activofijo.data.cantidadactual}`);
            } else {
                cantidadD.value = 0;
                cantidad.removeAttribute("max");
            }
        } else {
            cantidadD.value = 0;
            cantidad.removeAttribute("max");
        }
    
    } 
}

export const formularioAFDevolucion = (usuarioId) =>{
    return [
        {
            id: "dev_activofijo_af_id",
            label: "Activo Fijo (Adquiridos)",
            forma: "select",
            origen: `./api/solicitud-activo/activo-fijo/devolucion/${usuarioId}`, 
            llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] },
            nombre: "activosfijos_id",
            accion: accionSelectDev(usuarioId),
            required: true,
        },
        {
            id: "dev_activofijo_cantidad_disponible",
            label: "Cantidad disponible",
            forma: "input",
            tipo: "number",
            desactivado: true,
        },
        {
            id: "dev_activofijo_cantidad",
            label: "Cantidad",
            forma: "input",
            tipo: "number",
            nombre: "cantidad",
            required: true
        },
    ];
} 
    