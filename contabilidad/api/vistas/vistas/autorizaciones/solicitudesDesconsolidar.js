import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getUsuarioId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, formatoFecha, InputBusqueda, obtenerFechaActual, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos } from "../../funciones/Solicitudes.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de solicitudes de desconsolidación
 *              Permite aprobar o rechazar las solicitudes de desconsolidación.
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaSolicitudesDesconsolidar - Contenedor principal donde se renderiza la vista de solicitudes de desconsolidación.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function SolicitudesDesconsolidar(permisos, vistaSolicitudesDesconsolidar, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listadesconsolidar/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaSolicitudesDesconsolidar.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({ titulo: "Listado de Solicitudes de Desconsolidar" });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const arrUrl = [`${URL_LT}/0`]; // 0 = gestión actual, 1 = todas las gestiones

    // Botones para cambiar la vista entre todas las gestiones y gestión actual
    const botonTodos = elementoBoton({
        texto: "Todas las gestiones",
        // icono: "list-columns-reverse",
        icono: "plus-circle",
        id: "desc-btn-todos",
        callback: async () => {
            arrUrl[0] = `${URL_LT}/1`; // 1 = todas las gestiones
            const registros = await obtenerDatos(arrUrl[0]);
            cargarContenidoTabla(registros);
            const divTodos = botonTodos.closest(".col-auto");
            const divActual = botonActual.closest(".col-auto");
            cambiarVista(divTodos, divActual);
        }
    });
    const botonActual = elementoBoton({
        texto: "Gestión actual",
        // icono: "list-task",
        icono: "dash-circle",
        id: "desc-btn-actual",
        callback: async () => {
            arrUrl[0] = `${URL_LT}/0`; // 0 = gestión actual
            const registros = await obtenerDatos(arrUrl[0]);
            cargarContenidoTabla(registros);
            const divActual = botonActual.closest(".col-auto");
            const divTodos = botonTodos.closest(".col-auto");
            cambiarVista(divActual, divTodos);
        }
    });

    // Opciones de la vista principal
    const opcionesBtns = divOpcionesVista([
        botonTodos,
        botonActual,
    ]);
    botonActual.closest(".col-auto").classList.add("d-none");
    vistaPrincipal.appendChild(opcionesBtns);

    const encabezadoTabla = [
        "Fecha Solicitado",
        "Fecha Procesado",
        "N° Transacción",
        "Motivo",
        "Solicitante",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, divTabla);

    // Manejar el listado en la tabla
    manejarListadoTabla({
        urlSolicitud: arrUrl[0],
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
                crearElemento("td", { class: "text-end" }, [ formatoFecha(registro.fecha) + " " + registro.hora]),
                crearElemento("td", { class: "text-end" }, [ registro.fechaproceso ? formatoFecha(registro.fechaproceso) + " " + registro.horaproceso : "-" ]),
                crearElemento("td", undefined, [
                    registro.desde_primero == registro.desde_ultimo
                        ? registro.desde_primero
                        : registro.desde_primero + " - " + registro.desde_ultimo
                ]),
                crearElemento("td", undefined, [ registro.motivo ]),
                crearElemento("td", undefined, [ registro.nombre + " " + registro.apellido ])
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });

            // Crear los botones de procesar solicitud
            const botonSolicitud= botonesProcesarSolicitud({
                vistaPrincipal,
                contenedorDeAlertas,
                URL,
                arrUrl,
                cargarContenidoTabla,
                registro,
                PUEDE_EDITAR
            });
            tdOpciones.append(botonSolicitud);

            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la vista
    const divContenedorCabecera = vistaSolicitudesDesconsolidar.closest("#contenedor-cabecera");
    const btnSDesconsolidar = divContenedorCabecera.querySelector("[data-id='desconsolidacion']");
    const informacionDJs = [
        {
            element: btnSDesconsolidar,
            popover: {
                title: "Desconsolidar",
                description: "Sección donde se recibe las solicitudes de desconsolidación de Transacciones. (La solicitud de aprobación se muestra como una alerta en la campanita de notificaciones.)",
            },
        },
        {
            element: botonTodos,
            popover: {
                title: "Todos las gestiones",
                description: "Visualiza todas las solicitudes de desconsolidación registradas en todas las gestiones.",
            },
        },
        { element: botonActual,
            popover: {
                title: "Gestión actual",
                description: "Visualiza las solicitudes de desconsolidación registradas en la gestión actual.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar solicitudes",
                description: "Permite buscar solicitudes considerando todos los campos disponibles.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de solicitudes",
                description: "Muestra todas las solicitudes de desconsolidación registradas.",
            },
        },
        {
            mainElement: tabla,
            element: ".btn.btn-sm.btn-success",
            popover: {
                title: "Aceptar solicitud",
                description: "Aprueba la solicitud de desconsolidación seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: ".btn.btn-sm.btn-danger",
            popover: {
                title: "Rechazar solicitud",
                description: "Rechaza la solicitud de desconsolidación seleccionada.",
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
 * Función: Crear los botones de procesar solicitud
 * Descripción: Crea los botones para procesar la solicitud de desconsolidación en la tabla.
 *              Si la solicitud ya ha sido procesada, muestra un botón deshabilitado indicando el estado.
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
function botonesProcesarSolicitud(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        arrUrl,
        cargarContenidoTabla,
        registro,
        PUEDE_EDITAR
    } = datosVista;

    if (registro.estado === "0") {
        if (!PUEDE_EDITAR) {
            return "-";
        }
        const iconoAceptar = crearElemento("i", { class: "bi bi-check-circle me-1" });
        const btnAceptar = crearElemento("button", { class : "btn btn-sm btn-success"}, [iconoAceptar, "aceptar"]);
        const iconoDenegar = crearElemento("i", { class: "bi bi-x-circle me-1" });
        const btnDenegar = crearElemento("button", { class : "btn btn-sm btn-danger"}, [iconoDenegar, "denegar"]);
        const fragmentOpciones = document.createDocumentFragment();
        fragmentOpciones.append(btnAceptar, " ", btnDenegar);

        const idusuario = getUsuarioId();

        // Acción del botón para manejar la solicitud de aceptación
        btnAceptar.addEventListener("click", () => {
            const activar = async() => {
                const accionEnviar = async() => {
                    // Obtener y actualizar los registros de la tabla de la vista principal.
                    const listaDeRegistros = await obtenerDatos(arrUrl[0]);
                    cargarContenidoTabla(listaDeRegistros);
                    alertaDeExito(contenedorDeAlertas, "Solicitud aceptada con éxito");
                }
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "Ocurrió un error")
                }

                const [fecha, hora] = obtenerFechaActual("array-fechahora");
                // Enviar el registro a la API
                const datos = {
                    grupo: registro.grupo,
                    estado: 1,
                    fecha,
                    hora,
                    idusuario,
                    ver: "cambiarestadoconsolidado"
                }
                enviarDatosOJson({
                    datos: datos,
                    urlSolicitud: URL,
                    callbackExito: accionEnviar,
                    callbackError: error
                });
            }
            const modal = modalDeConfirmacion(activar, "¿Esta seguro de aceptar esta solicitud?");
            vistaPrincipal.appendChild(modal);
            modal.querySelector("button[data-id='__btn-confirmar']").focus();
        });
        // Acción del botón para manejar la solicitud de denegación
        btnDenegar.addEventListener("click", () => {
            const activar = async() => {
                const accionEnviar = async() => {
                    // Obtener y actualizar los registros de la tabla de la vista principal.
                    const listaDeRegistros = await obtenerDatos(arrUrl[0]);
                    cargarContenidoTabla(listaDeRegistros);
                    alertaDeExito(contenedorDeAlertas, "Solicitud denegada con éxito");
                }
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "Ocurrió un error")
                }

                const [fecha, hora] = obtenerFechaActual("array-fechahora");
                // Enviar el registro a la API
                const datos = {
                    grupo: registro.grupo,
                    estado: 2,
                    fecha,
                    hora,
                    idusuario,
                    ver: "cambiarestadoconsolidado"
                }
                enviarDatosOJson({
                    datos: datos,
                    urlSolicitud: URL,
                    callbackExito: accionEnviar,
                    callbackError: error
                });
            }
            const modal = modalDeConfirmacion(activar, "¿Esta seguro de denegar esta solicitud?");
            vistaPrincipal.appendChild(modal);
            modal.querySelector("button[data-id='__btn-confirmar']").focus();
        });

        return fragmentOpciones;
    } else {
        // Botón deshabilitado que indica el estado de la solicitud ya procesada
        if (registro.estado === "1") {
            const i = crearElemento("i", { class: "bi bi-hand-thumbs-up-fill me-1" });
            const btnAceptado = crearElemento("button", { class : "btn btn-sm btn-info pe-none" }, [i, "aceptado"]);
            return btnAceptado;
        } else {
            const i = crearElemento("i", { class: "bi bi-hand-thumbs-down-fill me-1" });
            const btnDenegado = crearElemento("button", { class : "btn btn-sm btn-info pe-none" }, [i, "denegado"]);
            return btnDenegado;
        }
    }
}