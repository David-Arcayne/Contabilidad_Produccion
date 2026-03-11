import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "./Alertas.js";
import { crearFormulario } from "./CrearFormulario.js";
import { crearElemento, elementoBoton } from "./Funciones.js";
import { modalDeConfirmacion, modalFijo, modalManejarRespuestaError, modalRemovible } from "./Modals.js";
import { manejarSolicitudEliminacion, obtenerDatos, reiniciarFormulario } from "./Solicitudes.js";

/**
 * Función: Crear un formulario de registro.
 * Descripción: Esta función genera un formulario para registrar nuevos datos.
 *              El formulario se crea dinámicamente según los campos proporcionados y maneja las acciones de registro, cancelación y errores.
 * Fecha: 10 de octubre de 2024
 * Autor: Joel Choque
 */
/**
 * Crear un formulario de registro.
 * @param {DatosModalFormularioRegistro} datosVista - Opciones requeridas para crear el contenido.
 * @returns {HTMLElement}
 */
export function formularioRegistrar(datosVista) {
    const {
        contenedorDeAlertas,
        URL_FORM,
        URL_LISTAR,
        camposDeFormulario,
        camposAdicionales,
        camposCondicionales,
        cargarContenidoTabla,
        elementosAInsertar,
        esperarPromesa,
        configuraciones,
        callbacks,
        mostrarErrorEnModal
    } = datosVista;

    const { mensajeExito, mensajeError, configuracionBotones, centrarFormulario = true } = configuraciones || {};

    const contenedorFormulario = crearElemento("div", { id: "contenedor-formulario-registro" });

    // Funcion que se ejecuta al cancelar el registro.
    const cancelarRegistro = (evento, formulario) => {
        evento.preventDefault();
        reiniciarFormulario(formulario);
        if (callbacks?.alCancelar) callbacks.alCancelar();
    }
    // Funcion que se ejecuta al realizar el registro.
    const realizarRegistro = async (respuestaSolicitud) => {
        // Obtener los nuevos registros y actualizar la tabla.
        const urlTabla = URL_LISTAR ? (typeof(URL_LISTAR) === "function" ? URL_LISTAR() : URL_LISTAR) : URL_FORM;

        if (callbacks?.manejarRespuestaExitosa) {
            // Manejar la respuesta exitosa de forma personalizada.
            callbacks.manejarRespuestaExitosa(respuestaSolicitud, { urlListado: urlTabla });
            return;
        }

        const listaDeRegistros = await obtenerDatos(urlTabla);
        alertaDeExito(contenedorDeAlertas, mensajeExito || "Registro exitoso");
        cargarContenidoTabla(listaDeRegistros);
        if (callbacks?.alRegistrar) callbacks.alRegistrar();
    }
    // Funcion que se ejecuta al no poder realizar el registro.
    const errorRegistro = (respuestaSolicitud) => {
        if (mostrarErrorEnModal) {
            const { contenedorModal, valorError, colorTexto } = mostrarErrorEnModal;
            const contenidoError = modalManejarRespuestaError(contenedorModal, respuestaSolicitud, valorError, colorTexto);
            if (contenidoError) return;
        }
        if (callbacks?.enError) {
            callbacks.enError(respuestaSolicitud);
            return;
        }
        alertaDeError(contenedorDeAlertas, mensajeError || "Error al realizar el registro");
    }

    // Preparar los datos para generar el formulario.
    const opcionesParaBotones = {
        nombreEnviar: configuracionBotones?.nombreEnviar || "Guardar",
    }
    if (configuracionBotones?.botonCancelar !== false) {
        opcionesParaBotones.callbackCancelar = configuracionBotones?.callbackCancelar || cancelarRegistro;
    }
    const datosFormulario = {
        urlSolicitud: URL_FORM,
        camposAdicionales,
        camposCondicionales,
        callbackPreviaSolicitud: callbacks?.previaSolicitud,
        callbackExito: realizarRegistro,
        callbackError: errorRegistro,
        esperarPromesa,
        opcionesParaBotones,
    }

    // Agregar el formulario y el elemento extra al modal.
    const nuevoformulario = crearFormulario(camposDeFormulario, datosFormulario, undefined, centrarFormulario);
    contenedorFormulario.appendChild(nuevoformulario);
    for (const elemento of elementosAInsertar || []) {
        if (elemento?.alInicio) {
            contenedorFormulario.insertBefore(elemento.alInicio, nuevoformulario);
        } else if (elemento?.alFinal) {
            contenedorFormulario.appendChild(elemento.alFinal);
        }
    }

    return contenedorFormulario;
}

/**
 * Función: Crear un modal con formulario de registro.
 * Descripción: Esta función genera un modal que contiene un formulario para registrar nuevos datos.
 *             El formulario se crea dinámicamente según los campos proporcionados y maneja las acciones de registro, cancelación y errores.
 * Fecha: 10 de octubre de 2024
 * Autor: Joel Choque
 */
/**
 * Crear un modal con formulario de registro.
 * @param {DatosModalFormularioRegistro} datosVista - Opciones requeridas para crear el contenido.
 * @returns {HTMLElement}
 */
export function modalFormularioRegistrar(datosVista) {
    const {
        contenedorDeAlertas,
        URL_FORM,
        URL_LISTAR,
        camposDeFormulario,
        camposAdicionales,
        camposCondicionales,
        cargarContenidoTabla,
        elementosAInsertar,
        esperarPromesa,
        configuracionModal,
        configuraciones,
        mostrarErrorEnModal,
        callbacks,
    } = datosVista;

    const { mensajeExito, mensajeError, configuracionBotones, centrarFormulario = true } = configuraciones || {};

    const [modal, cuerpoModal, ocultarModal] = modalFijo({estiloModal: "width: 100%; max-width: 1400px;", ...configuracionModal});

    // Funcion que se ejecuta al cancelar el registro.
    const cancelarRegistro = (evento, formulario) => {
        evento.preventDefault();
        reiniciarFormulario(formulario);
        if (callbacks?.alCancelar) callbacks.alCancelar();
        ocultarModal();
    }
    // Funcion que se ejecuta al realizar el registro.
    const realizarRegistro = async (respuestaSolicitud) => {
        // Obtener los nuevos registros y actualizar la tabla.
        const urlTabla = URL_LISTAR ? (typeof(URL_LISTAR) === "function" ? URL_LISTAR() : URL_LISTAR) : URL_FORM;

        if (callbacks?.manejarRespuestaExitosa) {
            // Manejar la respuesta exitosa de forma personalizada.
            callbacks.manejarRespuestaExitosa(respuestaSolicitud, {urlListado: urlTabla, cerrarModal:ocultarModal});
            return;
        }

        const listaDeRegistros = await obtenerDatos(urlTabla);
        alertaDeExito(contenedorDeAlertas, mensajeExito || "Registro exitoso");
        cargarContenidoTabla(listaDeRegistros);
        if (callbacks?.alRegistrar) callbacks.alRegistrar();
        ocultarModal();
    }
    // Funcion que se ejecuta al no poder realizar el registro.
    const errorRegistro = (respuestaSolicitud) => {
        if (mostrarErrorEnModal) {
            const { contenedorModal, valorError, colorTexto } = mostrarErrorEnModal;
            const contenidoError = modalManejarRespuestaError(contenedorModal, respuestaSolicitud, valorError, colorTexto);
            if (contenidoError) return;
        }
        if (callbacks?.enError) {
            callbacks.enError(respuestaSolicitud, {cerrarModal: ocultarModal});
            return;
        }
        ocultarModal();
        alertaDeError(contenedorDeAlertas, mensajeError || "Error al realizar el registro");
    }

    // Preparar los datos para generar el formulario.
    const datosFormulario = {
        urlSolicitud: URL_FORM,
        camposAdicionales,
        camposCondicionales,
        callbackPreviaSolicitud: callbacks?.previaSolicitud,
        callbackExito: realizarRegistro,
        callbackError: errorRegistro,
        esperarPromesa,
        opcionesParaBotones: {
            nombreEnviar: configuracionBotones?.nombreEnviar || "Guardar",
            callbackCancelar: configuracionBotones?.callbackCancelar || cancelarRegistro,
        },
    }

    // Agregar el formulario y el elemento extra al modal.
    const nuevoformulario = crearFormulario(camposDeFormulario, datosFormulario, undefined, centrarFormulario);
    cuerpoModal.appendChild(nuevoformulario);
    for (const elemento of elementosAInsertar || []) {
        if (elemento?.alInicio) {
            cuerpoModal.insertBefore(elemento.alInicio, nuevoformulario);
        } else if (elemento?.alFinal) {
            cuerpoModal.appendChild(elemento.alFinal);
        }
    }

    return modal;
}

/**
 * Función: Crear un modal con formulario de edición.
 * Descripción: Esta función genera un modal que contiene un formulario para editar datos existentes.
 *             El formulario se crea dinámicamente según los campos proporcionados y maneja las acciones de edición, cancelación y errores.
 * Fecha: 10 de octubre de 2024
 * Autor: Joel Choque
 */
/**
 * Crear un modal con formulario de edición.
 * @param {DatosModalFormularioEditar} datosVista - Opciones requeridas para crear el contenido.
 * @param {Object} [datosTabla] - Datos de la tabla donde se encuentra el registro.
 * @returns {HTMLElement}
 */
export function modalFormularioEditar(datosVista) {
    const {
        contenedorDeAlertas,
        camposDeFormulario,
        camposAdicionales,
        camposCondicionales,
        cargarContenidoTabla,
        URL_FORM,
        URL_LISTAR,
        datosRegistro,
        elementosAInsertar,
        esperarPromesa,
        configuracionModal,
        configuraciones,
        datosTabla,
        callbacks,
    } = datosVista;

    const { mensajeExito, mensajeError, configuracionBotones, centrarFormulario = true } = configuraciones || {};

    const [modal, cuerpoModal, cerrarModal] = modalRemovible({estiloModal: "width: 100%; max-width: 1400px;", ...configuracionModal});

    // Funcion que se ejecuta al realizar la edicion.
    const realizarEdicion = async () => {
        // Obtener los nuevos registros y actualizar la tabla.
        const urlTabla = URL_LISTAR ? (typeof(URL_LISTAR) === "function" ? URL_LISTAR() : URL_LISTAR) : URL_FORM;
        const listaDeRegistros = await obtenerDatos(urlTabla);
        alertaDeExito(contenedorDeAlertas, mensajeExito || "Registro actualizado con exito");
        cargarContenidoTabla(listaDeRegistros);
        if (callbacks?.alEditar) callbacks.alEditar();
        cerrarModal();
    }
    // Funcion que se ejecuta al cancelar la edicion.
    const cancelarEditar = (evento, formulario) => {
        evento.preventDefault();
        reiniciarFormulario(formulario);
        cerrarModal();
    }
    // Funcion que se ejecuta al no poder realizar la edicion.
    const controlarError = (respuestaSolicitud) => {
        if (callbacks?.enError) {
            callbacks.enError(respuestaSolicitud, {cerrarModal});
            return;
        }
        cerrarModal();
        alertaDeError(contenedorDeAlertas, mensajeError || "Error al actualizar registro")
    }
    // Preparar los datos para generar el formulario.
    const datosFormulario = {
        urlSolicitud: URL_FORM,
        camposAdicionales,
        camposCondicionales,
        callbackPreviaSolicitud: callbacks?.previaSolicitud,
        callbackExito: realizarEdicion,
        callbackError: controlarError,
        esperarPromesa,
        opcionesParaBotones: {
            clasesEnviar: configuracionBotones?.clasesEnviar || "btn btn-warning",
            nombreEnviar: configuracionBotones?.nombreEnviar || "Guardar",
            callbackCancelar: configuracionBotones?.callbackCancelar || cancelarEditar,
        }
    }

    // Agregar el formulario y el elemnto extra al modal.
    const caposForm = Array.isArray(camposDeFormulario) ? camposDeFormulario : camposDeFormulario(datosRegistro);
    const formularioEditar = crearFormulario(caposForm, datosFormulario, datosRegistro, centrarFormulario);
    cuerpoModal.replaceChildren(formularioEditar);
    for (const elemento of elementosAInsertar || []) {
        if (elemento?.alInicio) {
            cuerpoModal.insertBefore(elemento.alInicio, formularioEditar);
        } else if (elemento?.alFinal) {
            cuerpoModal.appendChild(elemento.alFinal);
        }
    }

    return modal;
}

/**
 * Función: Crear un modal de confirmación para eliminar un registro.
 * Descripción: Esta función genera un modal que solicita confirmación al usuario antes de eliminar un registro.
 *             Si el usuario confirma, se realiza la eliminación y se actualiza la tabla de registros.
 * Fecha: 10 de octubre de 2024
 * Autor: Joel Choque
 */
/**
 * Crear un modal de confirmación para eliminar un registro.
 * @param {DatosModalFormularioEliminar} datosVista - Opciones requeridas para crear el contenido.
 * @returns {HTMLElement}
 */
export function modalEliminarRegistro(datosVista) {
    const {
        contenedorDeAlertas,
        cargarContenidoTabla,
        URL,
        URL_LISTAR,
        esperarPromesa,
        datosTabla,
        callbacks,
    } = datosVista;

    const eliminar = async () => {
        // Funcion que se ejecuta al eliminar el registro.
        const callbackExito = async(respuestaSolicitud) => {
            if (URL_LISTAR) {
                const urlTabla = typeof(URL_LISTAR) === "function" ? URL_LISTAR() : URL_LISTAR;
                const listaDeRegistros = await obtenerDatos(urlTabla);
                if (listaDeRegistros) {
                    cargarContenidoTabla(listaDeRegistros);
                } else {
                    alertaDeError(contenedorDeAlertas, "No se pudo cargar la tabla");
                    return;
                }
            } else {
                // Eliminar el registro (elemento "tr") de la tabla.
                const fila = datosTabla.elementoTd.closest("tr");
                const cuerpoTabla = fila.closest("tbody");
                fila.remove();
                if (!cuerpoTabla.hasChildNodes()) {
                    const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
                    const tr = crearElemento("tr", undefined, [td]);
                    cuerpoTabla.replaceChildren(tr);
                    if (callbacks?.alEliminarTodo) callbacks.alEliminarTodo();
                }
            }
            alertaDeExito(contenedorDeAlertas, "Registro eliminado con exito");
            if (callbacks?.alEliminar) callbacks.alEliminar();
        }
        // Funcion que se ejecuta al no poder eliminar el registro.
        const callbackError = (respuestaSolicitud) => {
            if (callbacks?.enError) {
                callbacks.enError(respuestaSolicitud);
                return;
            }
            alertaDeAdvertencia(contenedorDeAlertas, "No se puede eliminar el registro")
        }

        await manejarSolicitudEliminacion({
            urlSolicitud: URL,
            callbackError,
            callbackExito,
            esperarPromesa,
        })
    }

    const modal = modalDeConfirmacion(eliminar);
    return modal;
}

/**
 * Crea un botón que abre un modal para registrar un nuevo dato.
 * @param {DatosModalFormularioRegistro} opcionesFormulario - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} contenedor - Contenedor donde se agregará el modal.
 * @param {object} [datosBoton] - Opciones para personalizar el botón.
 * @returns {HTMLButtonElement}
 */
export function botonModalRegistro(opcionesFormulario, contenedor, datosBoton) {
    const { texto="Nuevo registro", identificador="__btn-registro", conModal=false } = datosBoton || {};

    // const icono = crearElemento("i", { class: 'bi bi-plus-lg pe-1' });
    // const boton = crearElemento("button", { class: 'btn btn-primary text-nowrap', type:"button", "data-id": identificador }, [icono, ` ${texto}`]);
    // const modal =  modalFormularioRegistrar(opcionesFormulario);
    // contenedor.appendChild(modal);
    // boton.addEventListener("click", () => {
    //     modal.classList.remove("d-none");
    // });
    // return boton;

    const modal =  modalFormularioRegistrar(opcionesFormulario);
    contenedor.appendChild(modal);
    const boton = elementoBoton({ texto, icono: "plus-lg", id: identificador, callback: () => {modal.classList.remove("d-none");} });
    return conModal ? [boton, modal] : boton;
}
/**
 * Crea un botón que abre un modal para editar un registro.
 * @param {DatosModalFormularioEditar} opcionesFormulario - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} contenedor - Contenedor donde se agregará el modal.
 * @returns {HTMLButtonElement}
 */
export function botonModalEditar(opcionesFormulario, contenedor) {
    const icono = crearElemento("i", { class: 'bi bi-pencil-square' });
    const boton = crearElemento("button", { class: 'btn btn-sm btn-warning', title: "Editar" , type:"button"}, [icono]);
    boton.addEventListener("click", () => {
        // Crear y mostrar el modal de formulario para editar el registro.
        const modal =  modalFormularioEditar(opcionesFormulario);
        contenedor.appendChild(modal);
    });
    return boton;
}
/**
 * Crea un botón que abre un modal para eliminar un registro.
 * @param {DatosModalFormularioEliminar} opcionesEliminar - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} contenedor - Contenedor donde se agregará el modal.
 * @returns {HTMLButtonElement}
 */
export function botonModalEliminar(opcionesEliminar, contenedor) {
    const icono = crearElemento("i", { class: 'bi bi-trash-fill' });
    const boton = crearElemento("button", { class: 'btn btn-sm btn-danger', title: "Eliminar" , type:"button"}, [icono]);
    boton.addEventListener("click", () => {
        // Crear y mostrar el modal de confirmación para eliminar el registro.
        const modal =  modalEliminarRegistro(opcionesEliminar);
        contenedor.appendChild(modal);
        modal.querySelector("[data-id='__btn-confirmar']").focus();
    });
    return boton;
}

