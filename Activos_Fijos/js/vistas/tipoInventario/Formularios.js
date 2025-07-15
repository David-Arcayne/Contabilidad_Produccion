export const opcionesTipo = [
    {clave: "1", valor: "Depreciable"},
    {clave: "2", valor: "No Depreciable"},
];

export const formularioTipoIventario = [
    {
        id: "tipo_inventario_nombre",
        label: "Nombre",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        required: true
    },
    {
        id: "tipo_inventario_detalle",
        label: "Detalle",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
        required: true
    },
    {
        id: "tipo_inventario_tipo",
        label: "Tipo",
        forma: "select",
        opciones: opcionesTipo,  
        nombre: "tipo",
        required: true
    },
];