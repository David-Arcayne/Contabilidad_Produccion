import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getUsuarioId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, formatoFecha, InputBusqueda, obtenerFechaActual, resaltarTexto, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos } from "../../funciones/Solicitudes.js";
import { DetalleTransExterna } from "./Funcionalidades/DetalleSolTrExt.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de solicitudes de transacciones externas.
 *              (realizadas desde otros módulos)
 *              Permite aprobar la transacción y editar el asiento contable asociado.
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaTransaccionesExternas - Contenedor principal donde se renderiza la vista de solicitudes de transacciones externas.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function TransaccionesExternas(permisos, vistaTransaccionesExternas, datosVistaPrincipal) {
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listatransacciones_comercial/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaEditarAsiento = crearElemento("div", { class: "d-none", "data-pane-id": "editar-asiento" });
    vistaTransaccionesExternas.append(vistaPrincipal, vistaEditarAsiento);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({ titulo: "Listado de Solicitudes de Transacciones Externas" });
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
        // "N° Transacción",
        "Fecha",
        "Tipo",
        "Glosa",
        "Módulo",
        "Tipo transacción",
        "Asiento Modelo",
        "Opciones"
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
                crearElemento("td", { class: "text-end" }, [ formatoFecha(registro.fecha) ]),
                crearElemento("td", undefined, [ registro.ttransaccion || "-" ]),
                crearElemento("td", undefined, [ registro.glosa || "-" ]),
                crearElemento("td", undefined, [ registro.nombre_modulo ? resaltarTexto("blue", registro.nombre_modulo) : "-" ]),
                crearElemento("td", undefined, [ registro.nombre_operacion ? resaltarTexto("blue", registro.nombre_operacion) : "-" ]),
                crearElemento("td", undefined, [ registro.nombre ? resaltarTexto("blue", registro.nombre) : "-" ])
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
                vistaEditarAsiento,
            });
            tdOpciones.append(botonSolicitud);

            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }


    // Configuración de ayudas visuales de la vista
    const divContenedorCabecera = vistaTransaccionesExternas.closest("#contenedor-cabecera");
    const btnTransExternas = divContenedorCabecera.querySelector("[data-id='transaccionesexternas']");
    const informacionDJs = [
        {
            element: btnTransExternas,
            popover: {
                title: "Transacción Externa",
                description: "Sección donde llegan las transacciones de otros módulos para su verificación y aprobación. (La solicitud de aprobación se muestra como una alerta en la campanita de notificaciones.)",
            },
        },
        {
            element: botonTodos,
            popover: {
                title: "Todas las gestiones",
                description: "Visualiza las transacciones externas registradas en todas las gestiones.",
            },
        },
        {
            element: botonActual,
            popover: {
                title: "Gestión actual",
                description: "Visualiza las transacciones externas registradas en la gestión actual.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar transacción",
                description: "Permite buscar transacciones considerando todos los campos disponibles.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de transacciones externas",
                description: "Muestra todas las transacciones por verificar.",
            },
        },
        {
            mainElement: tabla,
            element: ".btn.btn-sm.btn-success",
            popover: {
                title: "Aceptar transacción",
                description: "Aprueba la transacción seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: ".btn.btn-sm.btn-warning",
            popover: {
                title: "Asiento Contable",
                description: "Premite ver y editar el asiento contable de la transacción seleccionada.",
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
 * Función: Crear los botones de procesar las solicitudes de transacciones externas
 * Descripción: Crea los botones para procesar la solicitud de transacción externa, permitiendo aprobar la transacción o editar el asiento contable asociado.
 *
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
        vistaEditarAsiento
    } = datosVista;

    const PUEDE_ESCRIBIR = permisos.escritura === "1";

    if (registro.estado === "6") {
        const fragmentOpciones = document.createDocumentFragment();

        if (PUEDE_ESCRIBIR) {
            const iconoAceptar = crearElemento("i", { class: "bi bi-check-circle me-1" });
            const btnAceptar = crearElemento("button", { class : "btn btn-sm btn-success"}, [iconoAceptar, "Aprobar"]);

            const idusuario = getUsuarioId();

            // Acción del botón para manejar la solicitud de aceptación
            btnAceptar.addEventListener("click", () => {
                const activar = async() => {
                    const accionEnviar = async() => {
                        // Obtener y actualizar los registros de la tabla de la vista principal.
                        const listaDeRegistros = await obtenerDatos(arrUrl[0]);
                        cargarContenidoTabla(listaDeRegistros);
                        alertaDeExito(contenedorDeAlertas, "Transacción aprobada con éxito");
                    }
                    const error = () => {
                        alertaDeError(contenedorDeAlertas, "Ocurrió un error")
                    }

                    const [fecha, hora] = obtenerFechaActual("array-fechahora");
                    // Enviar el registro a la API
                    const datos = {
                        idsolicitud_anular_eliminar: registro.idsolicitud_anular_eliminar,
                        estado: 2,
                        estado_opcion: Number(registro.estado_opcion) > 0 ? registro.estado_opcion : 8,
                        fecha_proceso: fecha,
                        hora_proceso: hora,
                        idusuario_admin: idusuario,
                        ver: "cambiarestado___"
                    }
                    enviarDatosOJson({
                        datos: datos,
                        urlSolicitud: URL,
                        callbackExito: accionEnviar,
                        callbackError: error
                    });
                }
                const modal = modalDeConfirmacion(activar, "¿Esta seguro de aceptar esta transacción?");
                vistaPrincipal.appendChild(modal);
                modal.querySelector("button[data-id='__btn-confirmar']").focus();
            });

            fragmentOpciones.append(btnAceptar, " ");
        }

        const iconoEditar = crearElemento("i", { class: "bi bi-pencil-square me-1" });
        const btnEditar = crearElemento("button", { class : "btn btn-sm btn-warning"}, [iconoEditar, "Editar Asiento"]);
        // Acción del botón para manejar la solicitud de denegación
        btnEditar.addEventListener("click", () => {
            DetalleTransExterna({
                permisos,
                vistaTransaccion: vistaPrincipal,
                vistaDetalle: vistaEditarAsiento,
                registroTransaccion: registro,
            });
        });

        fragmentOpciones.appendChild(btnEditar);

        return fragmentOpciones;
    }
}