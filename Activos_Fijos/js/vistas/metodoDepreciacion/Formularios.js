export const opcionesMetodoDeprId = [
    {clave: "1", valor: "Línea recta (ligislación boliviana)"},
    {clave: "2", valor: "Suma de dígitos"},
    {clave: "3", valor: "Unidades Producción"},
    {clave: "4", valor: "Mixto"},
];

export const formularioMetodoDpr = [
    {
        id: "metodo_depreciacion_id",
        label: "Método de Depreciación",
        forma: "select",
        // origen: "./api/registro/metodos-depreciacion", 
        // llaves: { id: "id", detalle: "nombre" },
        opciones: opcionesMetodoDeprId, 
        nombre: "metododepreciacion_id",
        required: true
    },
];