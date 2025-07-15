export const formularioMetodoDpr = [
    {
        id: "tipo_inventario",
        label: "Tipo de Inventario",
        forma: "select",
        origen: "./api/tipo-inventario/activos", 
        llaves: { id: "id", detalle: "nombre" },
        nombre: "metododepreciacion_id",
        required: true
    },
];