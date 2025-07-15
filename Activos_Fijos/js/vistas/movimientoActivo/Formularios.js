import { obtenerDatos, rellenarSelect } from "../../funciones/Solicitudes.js";

export const opcionesTipoSolicitud = [
    {clave: "1", valor: "Asignación de A.F."},
    {clave: "2", valor: "Devolución de A.F."},
]

/**
 * Función a ejecutar cuando se selecciona una opción.
 * @param {string} elemento - Valor de la opción seleccionada.
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
export const accionSelectArea = async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const trabajador = form.querySelector("#mov_af_trabajador");

    if (elemento) {
        rellenarSelect(trabajador,{origen:`./api/externo-encargado/by-areas/${elemento}`, llaves:{id:"idtrabajador", detalle:"nombreapellido"}, textNF: "no hay trabajadores"});
    } else {
        trabajador.innerHTML = "";
        trabajador.innerHTML = "<option value=''>-- elija un área --</option>";
    }
}

export const formularioSolicitarAF = [
    {
        id: "mov_af_nombre",
        label: "Título",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
        required: true
    },
    {
        id: "mov_af_tipo",
        label: "Tipo de solicitud",
        forma: "select",
        opciones: opcionesTipoSolicitud, 
        nombre: "tiposolicitud",
        required: true,
        editar: false,
    },
    {
        id: "mov_af_area",
        label: "Área de trabajo",
        forma: "select",
        origen: "./api/externo-area/activos", 
        llaves: { id: "idareas", detalle: "nombre" },
        accion: accionSelectArea,
        nombre: "area_id",
        required: true,
        editar: false,

    },
    {
        id: "mov_af_trabajador",
        label: "Trabajador",
        forma: "select",
        // origen: "./api/externo-area/activos", 
        // llaves: { id: "id", detalle: ["poliza", "nombretiposeguro"]},
        nombre: "trabajador_id",
        txtE: "elija una área ",
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

    const cantidad = form.querySelector("#s_activofijo_cantidad");
    const cantidadD = form.querySelector("#s_activofijo_cantidad_disponible");

    if (elemento) {
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
        cantidad.removeAttribute("max");
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
];


/**
 * Función a ejecutar cuando se selecciona una opción.
 * @param {string} elemento - Valor de la opción seleccionada.
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
export const accionSelectDev = (trabajador_id) => {
    return async (elemento, contenedor) => {
        const form = contenedor.parentNode;
    
        const cantidad = form.querySelector("#dev_activofijo_cantidad");
        const cantidadD = form.querySelector("#dev_activofijo_cantidad_disponible");
    
        if (elemento) {
            const activofijo = await obtenerDatos(`./api/activo-fijo/por-usuario/${elemento}/${trabajador_id}`);
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

export const formularioAFDevolucion = (trabajador_id) =>{
    return [
        {
            id: "dev_activofijo_af_id",
            label: "Activo Fijo (Adquiridos)",
            forma: "select",
            origen: `./api/solicitud-activo/activo-fijo/devolucion/${trabajador_id}`, 
            llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] },
            nombre: "activosfijos_id",
            accion: accionSelectDev(trabajador_id),
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
    