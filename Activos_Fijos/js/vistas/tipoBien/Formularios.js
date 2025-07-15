export const formularioTipoBien = [
    {
        id: "tipobien_nombre",
        label: "Nombre",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        required: true
    },
    {
        id: "tipobien_descripcion",
        label: "Descripción",
        forma: "input",
        tipo: "text",
        nombre: "descripcion",
        required: true
    },
    {
        id: "tipobien_categoria_id",
        label: "Categoria",
        forma: "select",
        origen: "./api/categoria/activos", 
        llaves: { id: "id", detalle: "nombre" },
        nombre: "categorias_id",
        required: true
    },
];