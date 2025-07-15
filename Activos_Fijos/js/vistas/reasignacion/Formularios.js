import { obtenerDatos, rellenarSelect } from "../../funciones/Solicitudes.js";

export const opcionesTipoSolicitud = [
    {clave: "1", valor: "Asignación de A.F."},
    {clave: "2", valor: "Devolución de A.F."},
]

export const formularioSolicitarAF = [
    {
        id: "mov_reasg_nombre",
        label: "Título",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
        required: true
    },
];

/**
 * Función a ejecutar cuando se selecciona una opción.
 * @param {string} elemento - Valor de la opción seleccionada.
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
export const accionSelectSucursal = async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const area = form.querySelector("#mov_reasg_af_area");
    const a = $(area);
    a[0].selectize?.destroy();

    if (elemento) {
        area.innerHTML = "<option value=''>cargando...</option>";
        area.setAttribute("disabled", true)
        const datos = await obtenerDatos(`./api/externo-area/by-sucursal/${elemento}`);
        area.removeAttribute("disabled");
        if (datos?.rows > 0) {
            rellenarSelect(area,{datos:datos.data, llaves:{id:"idareas", detalle:"nombre"}}, undefined, {accion: accionSelectArea, div: contenedor});
        } else {
            area.innerHTML = "";
            area.innerHTML = "<option value=''>-- no hay área --</option>";
        }
    } else {
        area.innerHTML = "";
        area.innerHTML = "<option value=''>-- elija sucursal --</option>";
    }
}

/**
 * Función a ejecutar cuando se selecciona una opción.
 * @param {string} elemento - Valor de la opción seleccionada.
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
export const accionSelectArea = async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const trabajador = form.querySelector("#mov_reasg_af_trabajador");
    const a = $(trabajador);
    const b = a[0].selectize;
    if (b) {
        b.destroy();
        a.empty();
    }

    if (elemento) {
        trabajador.innerHTML = "<option value=''>cargando...</option>";
        trabajador.setAttribute("disabled", true)
        const datos = await obtenerDatos(`./api/externo-encargado/by-areas/${elemento}`);
        trabajador.removeAttribute("disabled");
        if (datos?.rows > 0) {
            rellenarSelect(trabajador,{datos:datos.data, llaves:{id:"idtrabajador", detalle:"nombreapellido"}}, undefined, {accion: accionSelectTrabajador, div: contenedor});
        } else {
            trabajador.innerHTML = "";
            trabajador.innerHTML = "<option value=''>-- no hay trabajadores --</option>";
        }
    } else {
        trabajador.innerHTML = "";
        trabajador.innerHTML = "<option value=''>-- elija un área --</option>";
    }
}

/**
 * Función a ejecutar cuando se selecciona una opción.
 * @param {string} elemento - Valor de la opción seleccionada.
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
export const accionSelectTrabajador= async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const activoFijo = form.querySelector("#mov_reasg_af_id");
    const a = $(activoFijo);
    const b = a[0].selectize;
    if (b) {
        b.destroy();
        a.empty();
    }

    if (elemento) {
        const datos = await obtenerDatos(`./api/solicitud-activo/activo-fijo/devolucion/${elemento}`);
        if (datos?.rows > 0) {
            rellenarSelect(activoFijo,{datos:datos.data, llaves:{id:"id", detalle:["codigo", "nombre", "detalle"]}}, undefined, {accion: accionSelect(elemento), div: contenedor});
        } else {
            activoFijo.innerHTML = "";
            activoFijo.innerHTML = "<option value=''>-- sin activos fijos --</option>";
        }
    } else {
        rellenarSelect(activoFijo,{origen:`./api/solicitud-activo/activo-fijo/activos`, llaves:{id:"id", detalle:["codigo", "nombre", "detalle"]}}, undefined, {accion: accionSelect(), div: contenedor});
    }
}


/**
 * Función a ejecutar cuando se selecciona una opción.
 * @param {string} elemento - Valor de la opción seleccionada.
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
export const accionSelect = (trabajador_id = undefined) => async (elemento, contenedor) => {
    const form = contenedor.parentNode;

    const cantidad = form.querySelector("#mov_reasg_af_cantidad");
    const cantidadD = form.querySelector("#mov_reasg_af_cant_disp");

    const trabajador = form.querySelector("#mov_reasg_af_trabajador_d");
    if (trabajador_id) {
        trabajador.removeAttribute("required");
    } else {
        trabajador.setAttribute("required", "required");
    }

    if (elemento) {
        let activofijo;
        if (trabajador_id) {
            activofijo = await obtenerDatos(`./api/activo-fijo/por-usuario/${elemento}/${trabajador_id}`);
        } else {
            activofijo = await obtenerDatos(`./api/activo-fijo/${elemento}`);
        }
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

export const accionSelectSucursalD = async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const area = form.querySelector("#mov_reasg_af_area_d");
    const a = $(area);
    a[0].selectize?.destroy();

    if (elemento) {
        area.innerHTML = "<option value=''>cargando...</option>";
        area.setAttribute("disabled", true)
        const datos = await obtenerDatos(`./api/externo-area/by-sucursal/${elemento}`);
        area.removeAttribute("disabled");
        if (datos?.rows > 0) {
            rellenarSelect(area,{datos:datos.data, llaves:{id:"idareas", detalle:"nombre"}}, undefined, {accion: accionSelectAreaD, div: contenedor});
        } else {
            area.innerHTML = "";
            area.innerHTML = "<option value=''>-- no hay área --</option>";
        }
    } else {
        area.innerHTML = "";
        area.innerHTML = "<option value=''>-- elija sucursal --</option>";
    }
}

/**
 * Función a ejecutar cuando se selecciona una opción.
 * @param {string} elemento - Valor de la opción seleccionada.
 * @param {HTMLElement} contenedor - Elemento padre del elemento select.
 */
export const accionSelectAreaD = async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const trabajador = form.querySelector("#mov_reasg_af_trabajador_d");
    const a = $(trabajador);
    const b = a[0].selectize;
    if (b) {
        b.destroy();
        a.empty();
    }

    if (elemento) {
        trabajador.innerHTML = "<option value=''>cargando...</option>";
        trabajador.setAttribute("disabled", true)
        const datos = await obtenerDatos(`./api/externo-encargado/by-areas/${elemento}`);
        trabajador.removeAttribute("disabled");
        if (datos?.rows > 0) {
            rellenarSelect(trabajador,{datos:datos.data, llaves:{id:"idtrabajador", detalle:"nombreapellido"}});
        } else {
            trabajador.innerHTML = "";
            trabajador.innerHTML = "<option value=''>-- no hay trabajadores --</option>";
        }
    } else {
        trabajador.innerHTML = "";
        trabajador.innerHTML = "<option value=''>-- elija un área --</option>";
    }
}

export const formularioAF = [
    {
        id: "mov_reasg_af_sucursal",
        label: "Sucursal",
        forma: "select",
        origen: "./api/externo-sucursal/activos", 
        llaves: { id: "idsucursalcontable", detalle: "nombre" },
        accion: accionSelectSucursal,
        nombre: "sucursal_id",
    },
    {
        id: "mov_reasg_af_area",
        label: "Área de trabajo",
        forma: "select",
        nombre: "area_id",
        txtE: "elija sucursal",
    },
    {
        id: "mov_reasg_af_trabajador",
        label: "Trabajador",
        forma: "select",
        nombre: "trabajador_id",
        txtE: "elija una área ",
    },
    {
        id: "mov_reasg_af_id",
        label: "Activo Fijo (disponibles)",
        forma: "select",
        origen: "./api/solicitud-activo/activo-fijo/activos", 
        llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] },
        accion: accionSelect(),
        nombre: "activosfijos_id",
        required: true
    },
    {
        id: "mov_reasg_af_cant_disp",
        label: "Cantidad disponible",
        forma: "input",
        tipo: "number",
        desactivado: true,
    },
    {
        id: "mov_reasg_af_cantidad",
        label: "Cantidad",
        forma: "input",
        tipo: "number",
        nombre: "cantidad",
        required: true
    },
    {
        seccion: [
            {
                id: "mov_reasg_af_sucursal_d",
                label: "Sucursal",
                forma: "select",
                origen: "./api/externo-sucursal/activos", 
                llaves: { id: "idsucursalcontable", detalle: "nombre" },
                accion: accionSelectSucursalD,
                nombre: "sucursal_destino",
            },
            {
                id: "mov_reasg_af_area_d",
                label: "Área de trabajo",
                forma: "select",
                nombre: "area_destino",
                txtE: "elija sucursal",
            },
            {
                id: "mov_reasg_af_trabajador_d",
                label: "Trabajador",
                forma: "select",
                nombre: "trabajador_destino",
                txtE: "elija una área ",
            },
        ],
        detalle: "Asignar a:",
    }
];