// GESTION CONTABLE
export const optnsTipoDocumento = [
    {clave: "por_tipo_mes", valor: "Por tipo y mes"},
    {clave: "por_tipo_gestion", valor: "Por tipo y gestión"},
    {clave: "por_gestion", valor: "Por gestión"},
];
export const formularioGestionContable = (registro) =>  [
    {
        id: "gestioncontable-nombre",
        label: "Nombre de la Gestión",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true
    },
    {
        id: "gestioncontable-fechainicio",
        label: "Inicio de gestión",
        forma: "input",
        tipo: "date",
        nombre: "fechaini",
        valor: "fecha",
        requerido: true
    },
    {
        id: "gestioncontable-fechafinal",
        label: "Final de gestión",
        forma: "input",
        tipo: "date",
        nombre: "fechafin",
        valor: "fecha",
        requerido: true
    },
    {
        id: "gestioncontable-formatotransaccion",
        label: "Formato de Numeración Trans.",
        forma: "select",
        opcionesPredefinidas: optnsTipoDocumento,
        nombre: "formato_transaccion",
        requerido: true,
        ocultar: registro?.tiene_transaccion === "si" ? true : false,
    },
];

// DIVISAS
export const formularioDivisas = [
    {
        id: "divisas-simbolo",
        label: "Símbolo",
        forma: "input",
        tipo: "text",
        nombre: "simbolo",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: "divisas-nombre",
        label: "Nombre",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
];

// TIPO DOCUMENTO DE COBRO
export const formularioTipoDocumentoCobro = [
    {
        id: "tipodocuemntocobro-nombre",
        label: "Tipo de documento",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: "tipodocuemntocobro-descripcion",
        label: "Descripción",
        forma: "input",
        tipo: "text",
        nombre: "descripcion",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
];

// FRECUENCIA DE PAGO
export const formularioFrecuenciaPago = [
    {
        id: "frecuenciapago-nombre",
        label: "Frecuencia de Pago",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: "frecuenciapago-descripcion",
        label: "Descripción",
        forma: "input",
        tipo: "text",
        nombre: "descripcion",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
];