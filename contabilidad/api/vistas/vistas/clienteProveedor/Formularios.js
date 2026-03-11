// CLIENTE
export const optnsTipo = [
    {clave: 0, valor: "Cliente"},
];

export const optnsTipoDocumento = [
    {clave: 1, valor: "Cedula de identidad"},
    {clave: 2, valor: "Cedula de identidad de extranjero"},
    {clave: 3, valor: "Pasaporte"},
    {clave: 4, valor: "Otro documento de identidad"},
    {clave: 5, valor: "Número de Identificación Tributaria"},
];


export const formularioClientes= [
    {
        id: "clientes-razonsocial",
        label: "Razon Social",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true,
        llaveRegistro: "nsocial",
    },
    {
        id: "clientes-tipodocumento",
        label: "Tipo de documento",
        forma: "select",
        opcionesPredefinidas: optnsTipoDocumento,
        nombre: "tipodocumento",
        requerido: true,
        llaveRegistro: "tdocumento"
    },
    {
        id: "clientes-nrodocumento",
        label: "Nro de documento",
        forma: "input",
        tipo: "text",
        nombre: "nit",
        requerido: true
    },
    {
        id: "clientes-nombrecomercial",
        label: "Nombre comercial",
        forma: "input",
        tipo: "text",
        nombre: "nombrecomercial",
        llaveRegistro: "ncomercial"
    },
    {
        id: "clientes-tipo",
        label: "Tipo de Cliente",
        forma: "select",
        opcionesPredefinidas: optnsTipo,
        nombre: "tipo",
    },
    {
        id: "clientes-email",
        label: "Email",
        forma: "input",
        tipo: "email",
        nombre: "email",
    },
    {
        id: "clientes-direccion",
        label: "Direccion",
        forma: "input",
        tipo: "text",
        nombre: "direccion",
    },
    {
        id: "clientes-telefono",
        label: "Telefono",
        forma: "input",
        tipo: "text",
        nombre: "telefono",
    },
    {
        id: "clientes-movil",
        label: "Movil",
        forma: "input",
        tipo: "text",
        nombre: "mobil",
    },
    {
        id: "clientes-pais",
        label: "Pais",
        forma: "input",
        tipo: "text",
        nombre: "pais",
    },
    {
        id: "clientes-ciudad",
        label: "Ciudad",
        forma: "input",
        tipo: "text",
        nombre: "ciudad",
    },
    {
        id: "clientes-zona",
        label: "Zona",
        forma: "input",
        tipo: "text",
        nombre: "zona",
    },
    {
        id: "clientes-web",
        label: "Web",
        forma: "input",
        tipo: "text",
        nombre: "web",
    },
    {
        id: "clientes-contacto",
        label: "Contacto",
        forma: "input",
        tipo: "text",
        nombre: "contacto",
    },
    {
        id: "clientes-detalle",
        label: "Detalle del Cliente",
        forma: "textarea",
        nombre: "detalle",
        filas: 1,
    },
];

// PROVEEDOR
/** @type {DatosInput[]}*/
export const formularioProveedor = [
    {
        id: "proveedores-nombre",
        label: "Nombre",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true
    },
    {
        id: "proveedores-nit",
        label: "NIT",
        forma: "input",
        tipo: "text",
        nombre: "nit",
    },
    {
        id: "proveedores-pais",
        label: "Pais",
        forma: "input",
        tipo: "text",
        nombre: "pais",
    },
    {
        id: "proveedores-ciudad",
        label: "Ciudad",
        forma: "input",
        tipo: "text",
        nombre: "ciudad",
    },
    {
        id: "proveedores-zona",
        label: "Zona/Barrio",
        forma: "input",
        tipo: "text",
        nombre: "zonabarrio",
        llaveRegistro: "zona"
    },
    {
        id: "proveedores-direccion",
        label: "Dirección",
        forma: "input",
        tipo: "text",
        nombre: "direccion",
    },
    {
        id: "proveedores-telefono",
        label: "Teléfono",
        forma: "input",
        tipo: "text",
        nombre: "telefono",
    },
    {
        id: "proveedores-movil",
        label: "Móvil",
        forma: "input",
        tipo: "text",
        nombre: "mobil",

    },
    {
        id: "proveedores-detalle",
        label: "Detalle",
        forma: "textarea",
        nombre: "detalle",
        filas: 1,
    },
];