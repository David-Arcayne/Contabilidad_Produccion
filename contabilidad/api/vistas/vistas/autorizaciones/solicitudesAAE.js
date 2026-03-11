import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { ajustarAlturaTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getUsuarioId } from "../../funciones/DatosAuxiliares.js";
import { buscarEnArrayYCargarTabla, cambiarVista, crearElemento, divOpcionesVista, elementoBoton, formatoFecha, InputBusqueda, obtenerFechaActual, resaltarTexto, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos } from "../../funciones/Solicitudes.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de solicitudes de reactivar, anular o eliminar transacciones.
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaSolicitudesAAE - Contenedor principal donde se renderiza la vista de solicitudes AAE.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export async function SolicitudesAAE(permisos, vistaSolicitudesAAE, datosVistaPrincipal) {
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_anular_eliminar_transaccion/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaSolicitudesAAE.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({ titulo: "Listado de Solicitudes de Reactivar, Anular o Eliminar" });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const arrayCargarTabla = []; // Array para almacenar la función de actualización de datos de la tabla
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
            arrayCargarTabla[0](registros);
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
            arrayCargarTabla[0](registros);
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
        "Tipo",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
    const selectBusqueda = await selectDeFiltro(cargarContenidoTabla, `${URL_LT}/0`, arrayCargarTabla);
    divBuscar.prepend(selectBusqueda);
    vistaPrincipal.append(divBuscar, divTabla);

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
                crearElemento("td", { class: "text-end" }, [ registro.fecha_proceso ? formatoFecha(registro.fecha_proceso) + " " + registro.hora_proceso : "-" ]),
                crearElemento("td", undefined, [ registro.codigotransaccion || "-" ]),
                crearElemento("td", undefined, [ registro.motivo ]),
                crearElemento("td", undefined, [ registro.nombre + " " + registro.apellido ]),
                crearElemento("td", { class: "text-center" }, [ obtenerTipoSolicitud(registro.estado_opcion) ])
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });

            // Crear los botones de procesar solicitud
            const botonSolicitud= botonesProcesarSolicitud({
                permisos,
                vistaPrincipal,
                contenedorDeAlertas,
                URL,
                arrUrl,
                registro,
                arrayCargarTabla
            });
            tdOpciones.append(botonSolicitud);

            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }


    // Configuración de ayudas visuales de la vista
    const divContenedorCabecera = vistaSolicitudesAAE.closest("#contenedor-cabecera");
    const btnAAE = divContenedorCabecera.querySelector("[data-id='activaranulareliminar']");
    const informacionDJs = [
        {
            element: btnAAE,
            popover: {
                title: "Reactivar, Anular o eliminar",
                description: "Muestra las solicitudes de Anular o Rehabilitar Transacciones, así mismo aprobar la eliminación de Transacciones. (La solicitud de aprobación se muestra como una alerta en la campanita de notificaciones.)",
            },
        },
        {
            element: botonTodos,
            popover: {
                title: "Todas las gestiones",
                description: "Visualiza todas las solicitudes registradas en todas las gestiones.",
            },
        },
        {
            element: botonActual,
            popover: {
                title: "Gestión actual",
                description: "Visualiza las solicitudes registradas únicamente en la gestión actual.",
            },
        },
        {
            element: selectBusqueda,
            popover: {
                title: "Tipo de solicitud",
                description: "Permite filtrar las solicitudes por tipo: Activar, Anular o Eliminar.",
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
                description: "Muestra todas las solicitudes de Anular, Rehabilitar o Eliminar registradas.",
            },
        },
        {
            mainElement: tabla,
            element: ".btn.btn-sm.btn-success",
            popover: {
                title: "Aceptar solicitud",
                description: "Aprueba la solicitud de Anular, Rehabilitar o Eliminar seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: ".btn.btn-sm.btn-danger",
            popover: {
                title: "Rechazar solicitud",
                description: "Rechaza la solicitud de Anular, Rehabilitar o Eliminar seleccionada.",
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
 * Función: Crea los botones para procesar distintas solicitudes en la tabla.
 * Descripción: Esta función genera los botones necesarios para aceptar o denegar solicitudes de reactivar, anular o eliminar transacciones en la tabla de solicitudes.
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
function botonesProcesarSolicitud(datosVista) {
    const {
        permisos,
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        arrUrl,
        registro,
        arrayCargarTabla,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";

    if (registro.estado_solicitud === "1") {
        if (!PUEDE_EDITAR && (registro.estado_opcion == 1 || registro.estado_opcion == 3)) {
            return "-";
        }
        if (!PUEDE_ELIMINAR && registro.estado_opcion == 2) {
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
                    arrayCargarTabla[0](listaDeRegistros);
                    alertaDeExito(contenedorDeAlertas, "Solicitud aceptada con éxito");
                }
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "Ocurrió un error")
                }

                const [fecha, hora] = obtenerFechaActual("array-fechahora");
                // Enviar el registro a la API
                const datos = {
                    idsolicitud_anular_eliminar: registro.idsolicitud_anular_eliminar,
                    estado_solicitud: 2,
                    estado_opcion: Number(registro.estado_opcion) > 0 ? registro.estado_opcion : 8,
                    fecha_proceso: fecha,
                    hora_proceso: hora,
                    idusuario_admin: idusuario,
                    ver: "cambiarEstado_anular_eliminar_activar_transaccion"
                }
                enviarDatosOJson({
                    datos: datos,
                    urlSolicitud: URL,
                    callbackExito: accionEnviar,
                    callbackError: error
                });
            }
            const modal = modalDeConfirmacion(
                activar,
                "¿Esta seguro de aceptar esta solicitud?",
                (registro.estado_opcion == 2)
                    ? "Al aceptar esta solicitud, la transacción será eliminada permanentemente del sistema y el N° de todas las transacciones posteriores a este serán actualizados en consecuencia."
                    : null
            );
            vistaPrincipal.appendChild(modal);
            modal.querySelector("button[data-id='__btn-confirmar']").focus();
        });
        // Acción del botón para manejar la solicitud de denegación
        btnDenegar.addEventListener("click", () => {
            const activar = async() => {
                const accionEnviar = async() => {
                    // Obtener y actualizar los registros de la tabla de la vista principal.
                    const listaDeRegistros = await obtenerDatos(arrUrl[0]);
                    arrayCargarTabla[0](listaDeRegistros);
                    alertaDeExito(contenedorDeAlertas, "Solicitud denegada con éxito");
                }
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "Ocurrió un error")
                }

                const [fecha, hora] = obtenerFechaActual("array-fechahora");
                // Enviar el registro a la API
                const datos = {
                    idsolicitud_anular_eliminar: registro.idsolicitud_anular_eliminar,
                    estado_solicitud: 3,
                    estado_opcion: Number(registro.estado_opcion) > 0 ? registro.estado_opcion : 8,
                    fecha_proceso: fecha,
                    hora_proceso: hora,
                    idusuario_admin: idusuario,
                    ver: "cambiarEstado_anular_eliminar_activar_transaccion"
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
        if (registro.estado_solicitud === "2") {
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

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

/**
 * Función: Crea un select para filtrar las solicitudes por tipo.
 * Descripción: Esta función genera un elemento select que permite filtrar las solicitudes de reactivar, anular o eliminar transacciones según su tipo.
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
export const selectDeFiltro = async (cargarContenidoTabla, URL_LT, arrayCargarTabla) => {
    const span = crearElemento("span", {class: "input-group-text bg-white border-0 pe-1 text-body-tertiary", for:"buscar__solicitudes_tipo"}, ["Tipo"]);
    const inputBuscar = crearElemento("select", {class: "form-select border-0 shadow-none"});
    inputBuscar.innerHTML = `
        <option value="" selected>-- todos --</option>
        <option value="3">Activar</option>
        <option value="1">Anular</option>
        <option value="2">Eliminar</option>
    `;
    const divGroup = crearElemento("div", {class: "input-group input-group-sm border rounded-1 ", style: "max-width: 180px;"}, [span, inputBuscar]);

    const miarray = await obtenerDatos(URL_LT);
    const editArray = buscarEnArrayYCargarTabla(miarray, inputBuscar, ["estado_opcion"], cargarContenidoTabla);
    arrayCargarTabla[0] = editArray;
    span.addEventListener("click", () => {
        inputBuscar.focus();
    });
    inputBuscar.addEventListener("focus", () => {
        divGroup.classList.add("border-primary-subtle","shadow-af-primary");

    });
    inputBuscar.addEventListener("blur", () => {
        divGroup.classList.remove("border-primary-subtle","shadow-af-primary");
    });

    return divGroup;
}

// Obtiene tipo de solicitud formateado y resaltado
function obtenerTipoSolicitud (tipo) {
    let span;
    if (tipo == 2) {
        span = resaltarTexto("red", "Eliminar");
    } else if (tipo == 3) {
        span = resaltarTexto("green", "Activar");
    } else if (tipo == 1) {
        span = resaltarTexto("yellow", "Anular");
    } else {
        return "-";
    }
    span.classList.add("d-inline-block");
    span.style.minWidth = "70px";
    span.style.padding = "1px 12px";
    return span;
}