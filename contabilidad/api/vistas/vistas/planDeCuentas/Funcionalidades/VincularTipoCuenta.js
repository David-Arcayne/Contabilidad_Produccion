import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { campoSelect, manejarSelect } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion, modalRemovible } from "../../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../../funciones/OpcionesBasicas.js";
import { enviarDatosOJson, manejarEnvioFormulario, obtenerDatos } from "../../../funciones/Solicitudes.js";
import { formularioVTipoCuenta } from "../Formularios.js";

/**
 * Función: Crea el contenido de la vista Agregar Rubros a Cuentas.
 * Descripción: Esta función genera el contenido principal del menú para la gestión de rubros y su vinculación con cuentas del plan de cuentas.
 *              Permite registrar, editar, eliminar rubros y vincular cuentas mediante formularios y tablas dinámicas.
 * Fecha: 20 de junio de 2025
 * Autor: Joel Choque
 */
/**
 * Crea el contenido de la vista Agregar Rubros a Cuentas.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {string} datosVista.codigo - Código de la vista principal.
 * @param {PermisosVista} datosVista.permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} datosVista.vistaPlanDeCuentas - Contenedor principal donde se renderiza la vista del plan de cuentas.
 * @param {HTMLElement} datosVista.vistaVincularDepreciacion - Contenedor principal donde se renderiza la vista de vincular rubros a cuentas.
 * @returns
 */
export const VincularTipoCuenta = (datosVista) => {
    const {
        codigo,
        permisos,
        vistaPlanDeCuentas,
        vistaVincularDepreciacion,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_agrupacion_rubro_plandecuenta/${EMPRESA_ID}`;

    vistaVincularDepreciacion.innerHTML = "";
    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });

    const vistaRegistrar = crearElemento("div", { class: "d-none mb-3" });
    vistaVincularDepreciacion.append(vistaRegistrar, vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = () => { cambiarVista(vistaVincularDepreciacion, vistaPlanDeCuentas) };
    const encabezadoVista = seccionEncabezado({ titulo: "Cuentas - Rubros"}, { callback: regresar });
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.append(encabezadoVista, contenedorDeAlertas);

    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioVTipoCuenta,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Rubro",
                    estiloModal: "width: 100%; max-width: 800px;"
                },
                camposAdicionales: {
                    ver: "registrar_agrupacion_rubro_plandecuenta",
                    empresa: EMPRESA_ID,
                },
            },
            vistaPrincipal
        );

        // Crear botón para importar rubros de administración
        const botonImportar = botonImportarRubros(vistaPrincipal, contenedorDeAlertas, URL_LT, cargarContenidoTabla);

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonRegistrar,
            botonImportar,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }

    const encabezadoTabla = [
        "Tipo Cuenta",
        "Rubro",
        "Estado",
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
                crearElemento("td", undefined, [registro.tipo_plandecuenta || ""]),
                crearElemento("td", undefined, [registro.numero || ""]),
                crearElemento("td", { class: `${registro.vinculado === "si" ? "" : "text-danger"}`}, [
                    registro.vinculado === "si"
                        ? "Vinculado"
                        : "Pendiente de vinculación"
                ]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR || PUEDE_ESCRIBIR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_ESCRIBIR) {
                    const botonVincular = botonVincularCuentas({
                        URL_LT,
                        vistaPrincipal,
                        contenedorDeAlertas,
                        registro,
                        cargarContenidoTabla,
                    });
                    fragmentOpciones.append(botonVincular, " ");
                }
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioVTipoCuenta,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Editar Ruebro",
                                estiloModal: "width: 100%; max-width: 800px;"
                            },
                            camposAdicionales: {
                                ver: "editar_agrupacion_rubro_plandecuenta",
                                empresa: EMPRESA_ID,
                                idagrupacion_rubro_plandecuenta: registro.idagrupacion_rubro_plandecuenta,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    fragmentOpciones.append(botonEditar, " ");
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}eliminar_agrupacion_rubro_plandecuenta/${registro.idagrupacion_rubro_plandecuenta}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                        },
                        vistaPrincipal
                    );
                    fragmentOpciones.append(botonEliminar, " ");
                }
                tdOpciones.appendChild(fragmentOpciones);
                celdas.push(tdOpciones);
            }
            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la ventana
    seccionDriverJS(
        [
            {
                popover: {
                    title: "Cuentas - Rubros",
                    description: "En esta sección, puede gestionar los rubros contables y vincularlos con las cuentas correspondientes de su plan de cuentas.",
                }
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='__btn-registro']",
                popover: {
                    title: "Agregar nuevo Rubro",
                    description: "Abre un formulario para registrar un nuevo rubro contable en el sistema.",
                }
            },
            {
                mainElement: vistaPrincipal,
                element: "button[data-id='pdc-rubros-btn-importar']",
                popover: {
                    title: "Importar Rubros de Administración",
                    description: "Realiza la importación de los rubros contables de administración.",
                }
            },
            {
                mainElement: divBuscar,
                element: "#__buscador",
                popover: {
                    title: "Buscar Rubro",
                    description: "Permite buscar rubros en el listado considerando todas las columnas de la tabla.",
                }
            },
            {
                element: divTabla,
                popover: {
                    title: "Listado de Rubros",
                    description: "Muestra el listado de rubros contables registrados en el sistema junto con las opciones para gestionarlos.",
                }
            },
            {
                mainElement: tabla,
                element: "button[title='Asignar Rubro']",
                popover: {
                    title: "Asignar Rubro a Cuentas",
                    description: "Abre un formulario que le permitirá seleccionar una cuenta. Al enviar el formulario, todas las cuentas pertenecientes a la cuenta seleccionada se vincularán con el rubro correspondiente.",
                }
            },
            {
                mainElement: tabla,
                element: "button[title='Editar']",
                popover: {
                    title: "Editar Rubro",
                    description: "Abre un formulario que le permitirá editar la información del rubro seleccionado.",
                }
            },
            {
                mainElement: tabla,
                element: "button[title='Eliminar']",
                popover: {
                    title: "Eliminar Rubro",
                    description: "Permite eliminar el rubro seleccionado del sistema, previa confirmación.",
                }
            }
        ],
        vistaPrincipal
    );

    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE LA VISTA
// =========================================================

/**
 * Función: Crea un botón para importar rubros de administración.
 * Descripción: Crea un botón que al ser presionado, muestra un modal de confirmación. Si el usuario confirma, se envía una solicitud para importar los rubros de administración.
 * Fecha: 20 de junio de 2025
 * Autor: Joel Choque
 */
function botonImportarRubros(vistaPrincipal, contenedorDeAlertas, utlListaRubros, cargarContenidoTabla) {
    const manejarImportacionRubros = () => {
        // Preparación y envio de la solicitud y control de la respuesta
        // Al enviar la solicitud, se importarán los rubros y se actualiza la tabla de rubros.
        const importar = () => {
            const accionEnviar = async() => {
                // Actualizar la tabla con los nuevos datos
                const listaDeRegistros = await obtenerDatos(utlListaRubros);
                alertaDeExito(contenedorDeAlertas, "Rubros importados con éxito")
                cargarContenidoTabla(listaDeRegistros)
            };
            const error = (respuesta) => {
                if (Array.isArray(respuesta) && respuesta[0] === "danger") {
                    alertaDeError(contenedorDeAlertas, respuesta[1]);
                    return;
                }
                alertaDeError(contenedorDeAlertas, "No se pudo importar los rubros de Administración");
            };

            // Envío de datos para registrar el asiento de apertura
            const datos = {
                empresa: getEmpresaId(),
                ver: "descargar_listarubroscontables",
            }
            enviarDatosOJson({
                datos: datos,
                urlSolicitud: CT_URLAPI,
                callbackExito: accionEnviar,
                callbackError: error,
            });
        };
        // Mostrar modal de confirmación
        const modal = modalDeConfirmacion(importar, "¿Está seguro de importar los rubros de Administración?");
        vistaPrincipal.appendChild(modal);
        modal.querySelector("[data-id=__btn-confirmar]").focus();
    };

    const boton = elementoBoton({
        texto: "Importar Rubros",
        icono: "cloud-arrow-down",
        id: "pdc-rubros-btn-importar",
        callback: manejarImportacionRubros,
    })
    return boton;
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea un botón para vincular cuentas a un rubro.
 * Descripción: Crea un botón que al ser presionado, muestra un modal con un formulario para seleccionar una cuenta.
 *              Al enviar el formulario, se vinculan todas las cuentas perteneciente a la cuenta seleccionada con el rubro correspondiente.
 * Fecha: 20 de junio de 2025
 * Autor: Joel Choque
 */
function botonVincularCuentas(datosVista) {
    const {
        URL_LT,
        vistaPrincipal,
        contenedorDeAlertas,
        registro,
        cargarContenidoTabla,
    } = datosVista;

    const icono = crearElemento("i", { class: "bi bi-link-45deg" });
    const botonVincular = crearElemento("button", { class: "btn btn-info btn-sm ", title: "Asignar Rubro" }, [icono]);

    botonVincular.addEventListener("click", () => {
        const EMPRESA_ID = getEmpresaId();

        // Creación del modal y formulario
        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Asignar Rubros a Cuentas"});
        const [selectCuentas, divCuentas] = campoSelect(
            { atributos: { id: "cuentarubrostodos-cuenta", required: true } },
            { contenido: "Cuenta" }
        );
        const botonConsolidar = crearElemento("button", { class: "btn btn-primary", type: "submit", id:"btn-enviar-formulario", style: "min-width: 100px;" }, ["Asignar"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 100px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-4" }, [botonConsolidar, botonCancelar]);
        manejarSelect(selectCuentas, {
            urlSolicitud: `${CT_URLAPI}listar_select_rango_codigos/${EMPRESA_ID}`,
            llavesOpciones: { valor: ["numero", "numero_final"], detalle: ["numero","nombreplan"] },
        });

        const formulario = crearElemento("form", undefined, [divCuentas, divBotones]);
        cuerpoModal.appendChild(formulario);

        // Manejo del envío del formulario
        // Al enviar el formulario, se vincularán las cuentas seleccionadas con el rubro y se actualizará la tabla de rubros.
        formulario.addEventListener("submit", (e) => {
            e.preventDefault();

            const [inicio, fin] = selectCuentas.value.split("|");

            const accionEnviar = async() => {
                // Actualizar la tabla con los nuevos datos
                const listaDeRegistros = await obtenerDatos(URL_LT);
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Asignación exitosa");
                cerrarModal();
            }
            const error = () => {
                cerrarModal();
                alertaDeError(contenedorDeAlertas, "Ocurrió un error al realizar la asignación");
            }

            // Envío de datos para vincular las cuentas al rubro
            manejarEnvioFormulario({
                refFormulario: formulario,
                urlSolicitud: CT_URLAPI,
                camposAdicionales: {
                    numero_ini: inicio,
                    numero_fin: fin,
                    idrubro: registro.idagrupacion_rubro_plandecuenta,
                    empresa: EMPRESA_ID,
                    ver: "vincular_rubro_plandecuentas"
                },
                callbackExito: accionEnviar,
                callbackError: error,
            });
        });

        vistaPrincipal.appendChild(modal);

    });

    return botonVincular;
}