import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, divOpcionesVista, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { modalRemovible } from "../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro, formularioRegistrar } from "../../funciones/OpcionesBasicas.js";
import { formularioCBUsuario, formularioVinculacionCajasYBancos } from "./Formularios.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de la vinculación entre cajas y bancos con cuentas contables.
 *              Permite registrar, editar y eliminar vinculaciones mediante formularios y tablas dinámicas.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaPagarCobrar - Contenedor principal donde se renderiza la vista de vinculación de cajas y bancos.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export async function CajasYBancos(permisos, vistaPagarCobrar, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_caja_bancos/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaPagarCobrar.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Listado vinculación Cajas/Bancos con Cuentas Contables"});
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioVinculacionCajasYBancos,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nueva Vinculación",
                },
                camposAdicionales: {
                    ver: "registrar_caja_bancos",
                    idempresa: EMPRESA_ID,
                },
            },
            vistaPrincipal
        );

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonRegistrar,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Código",
        "Nombre Caja o Banco",
        "Descripción",
        "Relación",
        "Cod. Cuenta",
        "Cuenta de Activo Disponible",
        "Tipo",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, divTabla);

    // Manejar el listado en la tabla
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
        contenedorAlertas: contenedorDeAlertas,
        cuerpoTabla: tbody,
    });
    // Función para cargar el contenido de la tabla
    function cargarContenidoTabla(listaRegistros) {
        const validado = validarListadoTabla(listaRegistros);
        if ( !validado.valido ) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        for (const registro of listaRegistros) {
            const celdas = [
                crearElemento("td", undefined, [registro.codigo || "-"]),
                crearElemento("td", undefined, [registro.tipo_cuenta || "-"]),
                crearElemento("td", undefined, [registro.glosa || "-"]),
                crearElemento("td", { class: "text-center" }, [
                    crearElemento("i", { class: "bi bi-arrow-right text-primary fs-6" })
                ]),
                crearElemento("td", undefined, [registro.codigo_cuenta || "-"]),
                crearElemento("td", undefined, [registro.cuenta || "-"]),
                crearElemento("td", undefined, [registro.tipo || "-"]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });

            // Opción para asignar usuarios a la vinculación
            const botonAsignar = botonAsignarUsuarios({
                vistaPrincipal,
                elemento: tdOpciones,
                registroVinculacionCB: registro,
                permisos,
            });
            tdOpciones.append(botonAsignar, " ");

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioVinculacionCajasYBancos,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Vinculación",
                            },
                            camposAdicionales: {
                                ver: "editar_caja_bancos",
                                idcaja_bancos: registro.idcaja_bancos,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    tdOpciones.append(botonEditar, " ");
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}eliminar_caja_bancos/${registro.idcaja_bancos}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                        },
                        vistaPrincipal
                    );
                    tdOpciones.append(botonEliminar, " ");
                }
            }
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la vista
    const divContenedorCabecera = vistaPagarCobrar.closest("#contenedor-cabecera");
    const btnCuentasDisponible = divContenedorCabecera.querySelector("[data-id='cajasybancos']");
    const informacionDJs = [
        {
            element: btnCuentasDisponible,
            popover: {
                title: "Tesorería",
                description: "Permite la habilitación de Cajas, Cajas Chicas y Bancos que la Empresa administra, logrando que el sistema realice un control y validación, en cada Transacción registrada por el responsable del manejo o control de estos Fondos. <br> Previamente debe asignarse una Cuenta Contable relacionado al manejo de ese Fondo de efectivo.",
            },
        },
        {
            element: btnCuentasDisponible,
            popover: {
                description: `Posteriormente debe asignarse al usuario que realizará el control de estos fondos con las sgtes funciones:
                <ul>
                    <li>Responsable: persona encargada del fondo.</li>
                    <li>Supervisor: persona que da el VoBo en los informes.</li>
                    <li>No Firma: persona que verifica el correcto Manejo pero no aparece su nombre para firmas en reportes</li>
                </ul>
                Y los permisos: Se le habilita a la persona, para que el sistema le permita o no crear transacciones en base a cualquier movimiento de fondos.`,
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Nuevo registro",
                description: "Abre un formulario para agregar una nueva Caja o Banco en el sistema.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar Caja o Banco",
                description: "Permite buscar registros considerando todas las columnas de la tabla.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de Cajas y Bancos",
                description: "Muestra todas las Cajas y Bancos registrados en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Asignar Permisos']",
            popover: {
                title: "Asignar Permisos",
                description: "Abre un modal para asignar usuarios que realizarán el control de la Caja o Banco seleccionado, permitiendo definir sus funciones y permisos.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar Caja o Banco",
                description: "Abre un formulario para modificar los datos de la Caja o Banco seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar Caja o Banco",
                description: "Permite eliminar el registro de la Caja o Banco seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea el botón para asignar usuarios a la vinculación de caja o banco.
 * Descripción: Esta función genera un botón que abre un modal para poder asignar usuarios responsables del control de la caja o banco seleccionado.
 *              En el modal se muestra una tabla con los usuarios asignados y un formulario para agregar nuevos usuarios con sus funciones y permisos.
 * Fecha: 11 de enero de 2026
 * Autor: Joel Choque
 */
function botonAsignarUsuarios(datosVista) {
    const {
        vistaPrincipal,
        registroVinculacionCB,
        permisos
    } = datosVista;

    const icono = crearElemento("i", { class: "bi bi-person-plus-fill" });
    const boton = crearElemento("button", { class: "btn btn-info btn-sm ", type: "button", title: "Asignar Permisos" }, [icono]);
    boton.addEventListener("click", () => {
        const PUEDE_EDITAR = permisos.editar === "1";
        const PUEDE_ELIMINAR = permisos.eliminar === "1";
        const PUEDE_ESCRIBIR = permisos.escritura === "1";
        const EMPRESA_ID = getEmpresaId();
        const URL = CT_URLAPI;
        const URL_LT = `${URL}listar_caja_bancos_usuarios/${registroVinculacionCB.idcaja_bancos}`;

        // Crear modal removible que contendrá la tabla y el formulario
        const [modal, cuerpoModal] = modalRemovible({
            tituloModal: "Asignación de Permisos",
            estiloModal: "width: 700px; min-width: 240px;",
            instrucciones: {
                cerrarAlHacerClickExterno: false,
                cerrarAlPresionarEsc: false,
            }
        });

        // Título con el código y nombre de la cuenta vinculada
        const cuentaSeleccionada = crearElemento("h6", { class: "text-center text-muted mb-3" }, [`(${registroVinculacionCB.codigo} - ${registroVinculacionCB.tipo_cuenta})`]);
        const contenedorDeAlertas = crearElemento("div", { class: "my-3" });
        cuerpoModal.appendChild(cuentaSeleccionada);
        if (PUEDE_ESCRIBIR) {
            // Creación de formulario para agregar nuevo usuario
            const divFormulario = formularioRegistrar(
                {
                    contenedorDeAlertas: contenedorDeAlertas,
                    URL_FORM: URL,
                    URL_LISTAR: URL_LT,
                    camposDeFormulario: formularioCBUsuario(),
                    cargarContenidoTabla,
                    configuraciones: {
                        configuracionBotones: {
                            botonCancelar: false,
                            nombreEnviar: "Agregar",
                        },
                        centrarFormulario: false,
                    },
                    camposAdicionales: {
                        ver: "registrar_caja_bancos_usuarios",
                        empresa: EMPRESA_ID,
                        idcaja_bancos: registroVinculacionCB.idcaja_bancos,
                    },
                },
            );
            cuerpoModal.appendChild(divFormulario);
        }
        cuerpoModal.appendChild(contenedorDeAlertas);
        const encabezadoTabla = [
            "Persona asignada",
            "Función",
            "Permiso",
            "Opciones",
        ];
        // Si no tiene permisos ni para editar ni para eliminar, se remueve la columna de opciones
        if (!PUEDE_EDITAR && !PUEDE_ELIMINAR) {
            encabezadoTabla.pop();
        }
        const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
        cuerpoModal.append(divTabla);

        // Manejar el listado en la tabla
        manejarListadoTabla({
            urlSolicitud: URL_LT,
            callbackCargarTabla: cargarContenidoTabla,
            contenedorAlertas: contenedorDeAlertas,
            cuerpoTabla: tbody,
        });
        // Función para cargar el contenido de la tabla
        function cargarContenidoTabla(listaRegistros) {
            const validado = validarListadoTabla(listaRegistros);
            if ( !validado.valido ) {
                tbody.replaceChildren(validado.fila);
                return;
            }

            const fragment = document.createDocumentFragment();

            for (const registro of listaRegistros) {
                const celdas = [
                    crearElemento("td", undefined, [
                        registro.nombre_usuario
                            ? `${registro.nombre_usuario} - ${registro.nombre_trabajador} ${registro.ci ?  ` - ${registro.ci}` : ""}`
                            : registro.nombre_trabajador ? `${registro.nombre_trabajador} ${registro.ci ?  ` - ${registro.ci}` : ""}`: "-"
                        ]),
                    crearElemento("td", undefined, [registro.funcion ? registro.funcion.charAt(0).toUpperCase() + registro.funcion.slice(1) : "-"]),
                    crearElemento("td", undefined, [registro.permiso_registrar || "-"]),
                ];

                if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                    const tdOpciones = crearElemento("td", { class: "text-nowrap", style: "width: 55px;" });
                    if (PUEDE_EDITAR) {
                        // Crear botón editar con modal de formulario
                        const botonEditar= botonModalEditar(
                            {
                                contenedorDeAlertas,
                                camposDeFormulario: formularioCBUsuario("editar"),
                                URL_FORM: URL,
                                URL_LISTAR: URL_LT,
                                configuracionModal: {
                                    tituloModal: "Edición de Asignación",
                                    estiloModal: "width: 680px; min-width: 240px;",
                                },
                                configuraciones: {
                                    centrarFormulario: false,
                                },
                                camposAdicionales: {
                                    ver: "editar_caja_bancos_usuarios",
                                    empresa: EMPRESA_ID,
                                    idcaja_bancos: registro.idcaja_bancos,
                                    idcaja_banco_usuario: registro.idcaja_banco_usuarios,
                                },
                                datosRegistro: registro,
                                cargarContenidoTabla,
                            },
                            vistaPrincipal
                        );
                        tdOpciones.append(botonEditar, " ");
                    }
                    if (PUEDE_ELIMINAR) {
                        // Crear botón eliminar con modal de confirmación
                        const botonEliminar = botonModalEliminar(
                            {
                                URL: `${URL}eliminar_caja_bancos_usuario/${registro.idcaja_banco_usuarios}`,
                                contenedorDeAlertas,
                                datosTabla: { elementoTd: tdOpciones },
                            },
                            vistaPrincipal
                        );
                        tdOpciones.append(botonEliminar, " ");
                    }
                    celdas.push(tdOpciones);
                }

                const fila = crearElemento("tr", undefined, [ ...celdas]);
                fragment.appendChild(fila);
            }

            tbody.replaceChildren(fragment);
        }

        vistaPrincipal.appendChild(modal);
    });

    return boton;
}