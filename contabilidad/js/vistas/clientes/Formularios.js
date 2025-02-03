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
        id: "clientes_razon_social",
        label: "Razon Social",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        required: true,
        n_registro: "nsocial"
    },
    {
        id: "clientes_nombre_comercial",
        label: "Nombre comercial",
        forma: "input",
        tipo: "text",
        nombre: "nombrecomercial",
        required: true,
        n_registro: "ncomercial"
    },
    {
        id: "clientes_tipo",
        label: "Tipo de Cliente",
        forma: "select",
        opciones: optnsTipo,
        nombre: "tipo",
        required: true
    },
    {
        id: "clientes_tipo_documento",
        label: "Tipo de documento",
        forma: "select",
        opciones: optnsTipoDocumento,
        nombre: "tipodocumento",
        required: true,
        n_registro: "tdocumento"
    },
    {
        id: "clientes_nro_documento",
        label: "Nro de documento",
        forma: "input",
        tipo: "text",
        nombre: "nit",
        required: true
    },
    {
        id: "clientes_email",
        label: "Email",
        forma: "input",
        tipo: "email",
        nombre: "email",
    },
    {
        id: "clientes_direccion",
        label: "Direccion",
        forma: "input",
        tipo: "text",
        nombre: "direccion",
        required: true
    },
    {
        id: "clientes_telefono",
        label: "Telefono",
        forma: "input",
        tipo: "text",
        nombre: "telefono",
        required: true
    },
    {
        id: "clientes_movil",
        label: "Movil",
        forma: "input",
        tipo: "text",
        nombre: "mobil",
        required: true
    },
    {
        id: "clientes_pais",
        label: "Pais",
        forma: "input",
        tipo: "text",
        nombre: "pais",
        required: true
    },
    {
        id: "clientes_ciudad",
        label: "Ciudad",
        forma: "input",
        tipo: "text",
        nombre: "ciudad",
        required: true
    },
    {
        id: "clientes_zona",
        label: "Zona",
        forma: "input",
        tipo: "text",
        nombre: "zona",
    },
    {
        id: "clientes_web",
        label: "Web",
        forma: "input",
        tipo: "text",
        nombre: "web",
    },
    {
        id: "clientes_contacto",
        label: "Contacto",
        forma: "input",
        tipo: "text",
        nombre: "contacto",
    },
    {
        id: "clientes_detalle",
        label: "Detalle del Cliente",
        forma: "textarea",
        nombre: "detalle",
        filas: 1,
    },
];