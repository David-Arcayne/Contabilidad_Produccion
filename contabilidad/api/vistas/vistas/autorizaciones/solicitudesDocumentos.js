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
 * @param {HTMLElement} vistaSolicitudesDocumentos - Contenedor principal donde se renderiza la vista de solicitudes de documentos.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function SolicitudesDocumentos(permisos, vistaSolicitudesDocumentos, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_anular_eliminar_factura/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaSolicitudesDocumentos.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({ titulo: "Anulación de Documentos" });
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
        "Tipo Documento",
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
                crearElemento("td", { class: "text-end" }, [ registro.fecha_proceso ? formatoFecha(registro.fecha_proceso) + " " + registro.hora_proceso : "-" ]),
                crearElemento("td", undefined, [ registro.tipo_documento || "-" ]),
                crearElemento("td", undefined, [ registro.motivo ]),
                crearElemento("td", undefined, [ registro.nombre + " " + registro.apellido ]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });

            // Crear los botones de procesar solicitud
            const botonSolicitud= botonesProcesarSolicitud({
                permisos,
                vistaPrincipal,
                contenedorDeAlertas,
                URL,
                arrUrl,
                cargarContenidoTabla,
                registro,
            });
            tdOpciones.append(botonSolicitud);

            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }


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
        permisos,
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        arrUrl,
        cargarContenidoTabla,
        registro,
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
                    cargarContenidoTabla(listaDeRegistros);
                    alertaDeExito(contenedorDeAlertas, "Solicitud aceptada con éxito");
                }
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "Ocurrió un error")
                }

                const [fecha, hora] = obtenerFechaActual("array-fechahora");
                // Enviar el registro a la API
                const datos = {
                    idsolicitud_anular_eliminar: registro.idsolicitud_anular_eliminar_documento,
                    estado_solicitud: 2,
                    estado_opcion: Number(registro.estado_opcion) > 0 ? registro.estado_opcion : 8,
                    fecha_proceso: fecha,
                    hora_proceso: hora,
                    idusuario_admin: idusuario,
                    ver: "cambiarEstado_anular_eliminar_activar_factura_caja_bancos"
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
                    cargarContenidoTabla(listaDeRegistros);
                    alertaDeExito(contenedorDeAlertas, "Solicitud denegada con éxito");
                }
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "Ocurrió un error")
                }

                const [fecha, hora] = obtenerFechaActual("array-fechahora");
                // Enviar el registro a la API
                const datos = {
                    idsolicitud_anular_eliminar: registro.idsolicitud_anular_eliminar_documento,
                    estado_solicitud: 3,
                    estado_opcion: Number(registro.estado_opcion) > 0 ? registro.estado_opcion : 8,
                    fecha_proceso: fecha,
                    hora_proceso: hora,
                    idusuario_admin: idusuario,
                    ver: "cambiarEstado_anular_eliminar_activar_factura_caja_bancos"
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