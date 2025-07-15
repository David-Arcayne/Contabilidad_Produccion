import { obtenerDatos } from "../../funciones/Solicitudes.js";

export const opcionesMetodoDeprId = [
    {clave: "1", valor: "Línea recta"},
    {clave: "2", valor: "Suma de dígitos"},
    {clave: "3", valor: "Unidades Producción"},
];

export const accionSelect = async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    const cantidadD = form.querySelector("#cuadro_dpr_ind_cantidadaf");
    const cantidad = form.querySelector("#cuadro_dpr_ind_cantidad");

    if (elemento) {
        const activofijo = await obtenerDatos(`./api/activo-fijo/${elemento}`);
        if (activofijo && activofijo.data?.cantidad) {
            console.log(activofijo.data);
            
            cantidadD.value = activofijo.data.cantidad;
            cantidad.setAttribute("max", `${activofijo.data.cantidad}`);
        } else {
            cantidadD.value = 0;
            cantidad.removeAttribute("max");
        }
    } else {
        cantidadD.value = "";
        cantidad.value = "";
        cantidad.removeAttribute("max");
    }
}

export const formularioCuadroDpr = [
    {
        id: "cuadro_dpr_ind_fecha",
        label: "Obtener los registros hasta la fecha:",
        forma: "input",
        tipo: "date",
        nombre: "fechadepreciacion",
        valor: "date",
        required: true
    },
    {
        id: "cuadro_dpr_ind_activo_fijo",
        label: "Activos fijos",
        forma: "select",
        origen: "./api/activo-fijo/activos-inv-dpr", 
        llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] },
        accion: accionSelect,
        nombre: "activosfijos_id",
        required: true,
    },
    {
        id: "cuadro_dpr_ind_ventabaja",
        label: "Valor venta o baja (total)",
        forma: "input",
        tipo: "number",
        intervalo: "any",
        nombre: "venta_o_baja",
    },
    {
        id: "cuadro_dpr_ind_cantidadaf",
        label: "Cantidad A.F.",
        forma: "input",
        tipo: "number",
        desactivado: true,
    },
    {
        id: "cuadro_dpr_ind_cantidad",
        label: "Cantidad",
        forma: "input",
        tipo: "number",
        nombre: "cantidad_vb",
    },
    {
        id: "cuadro_dpr_ind_depreciacion",
        label: "Método de depreciación",
        forma: "select",
        opciones: opcionesMetodoDeprId, 
        nombre: "metododepreciacion_id",
        required: true,
    },
];

export const formularioCuadroDprUso = [
    {
        id: "usoaf_fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        valor: "date",
        nombre: "fecha",
        required: true
    },
    {
        id: "usoaf_uso",
        label: "Valor uso",
        forma: "input",
        tipo: "number",
        intervalo: "any",
        nombre: "uso",
        required: true,
    },
];