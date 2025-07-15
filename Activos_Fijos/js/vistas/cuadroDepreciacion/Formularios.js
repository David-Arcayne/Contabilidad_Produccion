export const opcionesMetodoDeprId = [
    {clave: "1", valor: "Línea recta"},
    {clave: "2", valor: "Suma de dígitos"},
    {clave: "3", valor: "Unidades Producción"},
];

export const formularioCuadroDpr = [
    {
        id: "cuadro_dpr_fecha",
        label: "Practicado al:",
        forma: "input",
        tipo: "date",
        nombre: "fechadepreciacion",
        valor: "date",
        required: true
    },
    {
        id: "cuadro_dpr_mayorque",
        label: "Valor residual mayor a:",
        forma: "input",
        tipo: "number",
        nombre: "mayorque",
    },
    {
        id: "cuadro_dpr_menorque",
        label: "Valor residual menor a:",
        forma: "input",
        tipo: "number",
        nombre: "menorque",
    },
    // {
    //     id: "cuadro_dpr_activo_fijo",
    //     label: "Estado de situación individual",
    //     forma: "select",
    //     origen: "./api/activo-fijo/activos", 
    //     llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] },
    //     nombre: "activosfijos_id",
    // },
    {
        id: "cuadro_dpr_depreciacion",
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