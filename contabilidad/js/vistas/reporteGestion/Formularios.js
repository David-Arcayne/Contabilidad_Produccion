export const optnsRGTipoReporte = [
    // {clave: 0, valor: "Ninguno"},
    {clave: 1, valor: "Sumas y saldos Periodicos"},
    {clave: 2, valor: "Sumas y Saldos hasta"},
    {clave: 3, valor: "Activo y Pasivo Periodico"},
    {clave: 4, valor: "Activo y Pasido hasta"},
    {clave: 5, valor: "Cuentas de Resultado"},
    {clave: 6, valor: "Balance General Periodico"},
    {clave: 7, valor: "Balance General hasta"},
];

export const formularioRepGestion = [
    {
        id: "repgestion_fechaini",
        label: "Desde",
        forma: "input",
        tipo: "date",
        nombre: "fechaini",
        required: true,
        valor: "date",
        columnas: "col-12 col-sm-6",
    },
    {
        id: "repgestion_fechafin",
        label: "Hasta",
        forma: "input",
        tipo: "date",
        nombre: "fechafin",
        required: true,
        valor: "date",
        columnas: "col-12 col-sm-6",
    },
    {
        id: "repgestion_reportede",
        label: "Reporte de",
        forma: "select",
        opciones:optnsRGTipoReporte,
        nombre: "reportede",
        columnas: "col-12",
        required: true,
    },
];
