export const opcionesAccion = [
    {clave: "1", valor: "Rehabilitado"},
    {clave: "0", valor: "Deshabilitado"},
];

export const formularioTSituation = [
    {
        id: "t_situacion_nombre",
        label: "Nombre",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        required: true
    },
    {
        id: "t_situacion_tipo",
        label: "Acción",
        forma: "select",
        opciones: opcionesAccion,  
        nombre: "tipo",
        required: true
    }
];