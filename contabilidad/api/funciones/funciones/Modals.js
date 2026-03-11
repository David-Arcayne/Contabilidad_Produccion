import { CT_URLAPI, getEmpresaId } from "./DatosAuxiliares.js";
import { contenidoDeCargaBtn, crearElemento } from "./Funciones.js";
import { obtenerDatos } from "./Solicitudes.js";

/**
 * Función: Crea un evento para cerrar el modal al presionar la tecla Esc
 * Descripción: Esta función agrega un evento al documento que escucha la tecla Esc para cerrar el modal.
 *              Si el modal es de tipo "fijo", se oculta el modal. Si es de tipo "removible" (por defecto), se elimina el modal del DOM.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Crea un evento para cerrar el modal al presionar la tecla Esc
 * @param {HTMLElement} modal - Contenedor del modal
 * @param {string} [tipo] - Tipo de modal: "fijo" o "removible"
 * @return {function} Función para eliminar el evento
 */
export function salirConEsc(modal, tipo) {
    let cerrarModal;
    if (tipo === "fijo") {
        // Oculta el modal si se presiona la tecla Esc
        cerrarModal = (event) => {
            if (event.key === "Escape") {
                modal.classList.add("d-none");
            }
        }
    } else {
        // Remueve el modal si se presiona la tecla Esc
        cerrarModal = (event) => {
            if (!event) {
                // En caso de que se llame a "cerrarModal" sin evento, se remueve el listener
                document.removeEventListener("keydown", cerrarModal);
            } else if (event.key === "Escape") {
                event.preventDefault();
                modal.remove();
                document.removeEventListener("keydown", cerrarModal);
            }
        }
    }
    document.addEventListener("keydown", cerrarModal);
    return cerrarModal;
}

/**
 * Crea un modal de confirmación de una operación
 * @param {Function} confirmar - Función que se ejecutara al confirmar la operación
 * @param {string} [texto] - Información del modal
 * @param {string} [info] - Información adicional
 * @param {string} [textoConfirmar] - Texto del botón de confirmar
 * @param {string} [textoCancelar] - Texto del botón de cancelar
 * @param {Function} [cancelar] - Función que se ejecutara al cancelar la operación
 * @returns {HTMLElement}
 */
export const modalDeConfirmacion = (confirmar, texto = "¿Está seguro de eliminar el registro?", info = null, textoConfirmar = "Sí", textoCancelar = "No", cancelar) => {
    const btnMinWidth = "min-width: 65px;";
    const informacion = crearElemento("p", {class: "fs-5"}, [texto]);
    const btnContinuar = crearElemento("button", {class: "btn btn-primary", style: btnMinWidth, "data-id": "__btn-confirmar", type:"button", style:"min-width: 80px;"}, [textoConfirmar]);
    const btnCancelar = crearElemento("button", {class: "btn btn-outline-danger", style: btnMinWidth, "data-id": "__btn-cancelar", type:"button", style:"min-width: 80px;"}, [textoCancelar]);
    const divBotones = crearElemento("div", {class: "d-flex justify-content-center gap-2 mt-3"}, [btnContinuar, btnCancelar]);
    const contenedorMensaje = crearElemento("div", {class: "floating-message text-center p-2 p-md-4", style:"min-width: 200px; max-width: 500px;"});
    const contenedorModal = crearElemento("div", {class: "inner-div"}, [contenedorMensaje]);
    contenedorMensaje.appendChild(informacion);
    if (info) {
        const textoInfo = crearElemento("p", {class: "fst-italic fw-bold text-warning-emphasis"}, [info]);
        contenedorMensaje.appendChild(textoInfo);
        informacion.classList.add("mb-1");
    }
    contenedorMensaje.appendChild(divBotones);

    // Crear evento para cerrar el modal si se presiona la tecla Esc
    const accionEsc = salirConEsc(contenedorModal);

    btnContinuar.addEventListener("click", async (e) => {
        e.preventDefault();
        btnContinuar.disabled = true;
        btnCancelar.disabled = true;
        btnContinuar.innerHTML = contenidoDeCargaBtn(textoConfirmar);
        await confirmar();
        accionEsc(); // Elimina el evento de la tecla Esc
        contenedorModal.remove();
    });

    // Elimina el modal si se hace click fuera del contendor de mensaje
    contenedorModal.addEventListener("click", function (event) {
        event.stopPropagation();
        if (!contenedorMensaje.contains(event.target) || btnCancelar.contains(event.target)) {
            if (cancelar) {
                cancelar();
            }
            accionEsc(); // Elimina el evento de la tecla Esc
            contenedorModal.remove();
        }
    });

    return contenedorModal;
}

/**
 * Crea un modal de información
 * @param {string} [mensaje] - Información del modal
 * @returns {HTMLElement}
 */
export const modalDeInformacion = (mensaje, clasesMensaje = "fs-5 text-info-emphasis", textoBoton = "Cerrar") => {
    const informacion = crearElemento("p", { class: clasesMensaje }, [mensaje]);
    const btnContinuar = crearElemento("button", {class: "btn btn-outline-info", type:"button", style: "min-width: 90px;", "data-id":  "__btn-cerrar"}, [textoBoton]);
    const contenedorMensaje = crearElemento("div", {class: "floating-message text-center p-2 p-md-4", style:"min-width: 200px; max-width: 500px;"}, [informacion, btnContinuar]);
    const contenedorModal = crearElemento("div", {class: "inner-div"}, [contenedorMensaje]);

    // Crear evento para cerrar el modal si se presiona la tecla Esc
    const accionEsc = salirConEsc(contenedorModal);

    // Elimina el modal si se hace click fuera del contendor de mensaje
    contenedorModal.addEventListener("click", function (event) {
        if ((contenedorMensaje && !contenedorMensaje.contains(event.target)) || btnContinuar.contains(event.target)) {
            contenedorModal.remove();
            accionEsc(); // Elimina el evento de la tecla Esc
        }
    });

    return contenedorModal;
}


/**
 * Crea un modal que muestra la imagen deseada.
 * @param {string} urlImagen - URL de donde se encuentra la imagen.
 * @param {string} [alt] - Texto alternativo para la imagen.
 */
export const modalImagen = (urlImagen, alt = "Imagen" ) => {
    const imagen = crearElemento("img", {
        src: urlImagen,
        alt: alt,
        class: "img-fluid img-thumbnail",
        style: "max-height: 100%;"
    });
    const i = crearElemento("i", { class: "bi bi-x-lg" });
    const cerrar = crearElemento(
        "button",
        { class: "position-absolute top-0 start-50 translate-middle-x btn btn-dark btn-lg mt-3" },
        [i]
    );
    const contenedorModal = crearElemento(
        "div",
        {
            class: "inner-div d-flex align-items-center justify-content-center",
            style: "background-color: #000000e6;",
        },
        [imagen, cerrar]
    );

    // Elimina el modal si se presiona la tecla Esc
    const salirConEsc = (event) => {
        if (event.key === "Escape") {
            contenedorModal.remove();
            document.removeEventListener("keydown", salirConEsc);
        }
    }
    document.addEventListener("keydown", salirConEsc);

    // Elimina el modal si se hace click fuera del contendor de mensaje
    contenedorModal.addEventListener("click", function (event) {
        if ((imagen && !imagen.contains(event.target)) || (cerrar && cerrar.contains(event.target))) {
            contenedorModal.remove();
            document.removeEventListener("keydown", salirConEsc);
        }
    });

    return contenedorModal;
}

/**
 * Función: Crea el cuerpo del modal
 * Descripción: Esta función genera los elementos básicos del modal, incluyendo el encabezado (si se proporciona un título), el cuerpo y el botón de cierre.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Crea el cuerpo del modal
 * @param {ConfiguracionModal} configuracionModal - Datos para configurar el modal
 * @returns {{modal: HTMLElement, contenidoModal: HTMLElement, cuerpo: HTMLElement, btnCerrar: HTMLElement}} - Elementos del modal
 */
export function crearCuerpoModal(configuracionModal) {
    const { clasesContenedor, estiloModal, tituloModal } = configuracionModal || {};
    const mostrarEncabezado = tituloModal && tituloModal.trim() !== "";

    // Crear elementos del modal, se maneja distinstos estilos en el encabezado dependiendo si se proporciono el título.
    const titulo = crearElemento("h6", {class: "modal-title"}, [mostrarEncabezado ? tituloModal : ""]);
    const btnCerrar = crearElemento(
        "button",
        {
            class: `btn-close p-2 ${mostrarEncabezado ? "" : "mt-md-2"}`,
            style: "min-width: 16px; min-height: 16px;",
            type: "button"
        }
    );
    const encabezado = crearElemento(
        "div",
        { class: `p-1 ps-2 ps-md-4 pe-md-3 modal-header ${mostrarEncabezado ? "border-bottom ct-modal-header" : ""}`, "data-section": "header" },
        [ titulo, btnCerrar ]
    );
    // Agregar tema oscuro para que el botón de cierre se vea bien en fondo oscuro
    if (mostrarEncabezado) {
        encabezado.setAttribute("data-bs-theme", "dark");
    }
    const cuerpo = crearElemento(
        "div",
        { class: `p-2 p-md-4 ${mostrarEncabezado ? "" : "pt-0 pt-md-0"}`, "data-section": "body" }
    );
    const contenidoModal = crearElemento(
        "div",
        { class: "floating-message p-0", style: estiloModal || "width: 500px", "data-section": "content" },
        [ encabezado, cuerpo ]
    );
    const modal = crearElemento("div", {class: `inner-div p-2 ${clasesContenedor || "px-md-4"}`, "data-section": "container" }, [contenidoModal]);

    return {
        modal,
        contenidoModal: contenidoModal,
        cuerpo,
        btnCerrar
    };
}

/**
 * Función: Crea un modal que se crear y elimina (modal removible)
 * Descripción: Esta función genera un modal vacío con un botón de cierre
 *              El modal se remueve del DOM al hacer clic el el botón de cierre, fuera del contenedor o al presionar la tecla Esc.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Crea un modal que se crear y elimina (modal removible)
 * @param {ConfiguracionModal} configuracionModal - Datos para configurar el modal
 * @returns {[HTMLElement, HTMLElement, function]} Contenedor del modal y el cuerpo del modal
 */
export const modalRemovible = (configuracionModal) => {
    const { modal, contenidoModal, cuerpo, btnCerrar } = crearCuerpoModal(configuracionModal);
    const { cerrarAlHacerClickExterno = true, cerrarAlPresionarEsc = true } = configuracionModal?.instrucciones || {};

    // Eliminar el modal si se presiona la tecla Esc
    const accionEsc = cerrarAlPresionarEsc ? salirConEsc(modal) : null;

    const cerrarModal = () => {
        accionEsc?.();
        modal.remove();
    }
    // Elimina el modal si se hace click fuera del contendor de mensaje
    modal.addEventListener("click", function (event) {
        const cierreExterno = cuerpo.querySelector("[data-id='__opcion-cierre-externo']");
        if ((cerrarAlHacerClickExterno && !contenidoModal.contains(event.target)) || btnCerrar.contains(event.target) || cierreExterno?.contains(event.target)) {
            cerrarModal();
        }
    });
    return [modal, cuerpo, cerrarModal, btnCerrar];
}
/**
 * Función: Crea un modal que se muestra y oculta (modal fijo)
 * Descripción: Esta función genera un modal vacío con un botón de cierre
 *              El modal se oculta al hacer clic el en botón de cierre, fuera del contenedor o al presionar la tecla Esc.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Crea un modal que se muestra y oculta (modal fijo)
 * @param {ConfiguracionModal} configuracionModal - Datos para configurar el modal
 * @returns {[HTMLElement, HTMLElement, function]} Contenedor del modal y el cuerpo del modal
 */
export const modalFijo = (configuracionModal) => {
    const {modal, contenidoModal, cuerpo, btnCerrar} = crearCuerpoModal(configuracionModal);
    const { cerrarAlHacerClickExterno = true, cerrarAlPresionarEsc = true } = configuracionModal?.instrucciones || {};

    modal.classList.add("d-none");

    // Ocultar el modal si se presiona la tecla Esc
    cerrarAlPresionarEsc ? salirConEsc(modal, "fijo") : null;

    const ocultarModal = () => {
        modal.classList.add("d-none");
    }
    // Oculta el modal si se hace click fuera del contendor de mensaje
    modal.addEventListener("click", function (event) {
        if ((cerrarAlHacerClickExterno && !contenidoModal.contains(event.target)) || btnCerrar.contains(event.target)) {
            ocultarModal();
        }
    });
    return [modal, cuerpo, ocultarModal, btnCerrar];
}

/**
 * Función: Maneja errores en modales
 * Descripción: Esta función verifica si el error es un array con el primer elemento como 'danger'.
 *              Si es así, crea un modal de información con el mensaje de error y lo agrega al contenedor del modal.
 * Fecha: 04 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Maneja errores en modales
 * @param {HTMLElement} contenedorModal - Contenedor del modal
 * @param {any} error - Error recibido
 * @param {string} [valorError="danger"] - Valor que indica un error
 * @param {"primary"|"secondary"|"success"|"danger"|"warning"|"info"|"light"|"dark"} [colorTexto="danger"] - Color del texto del modal de error
 * @returns {boolean} Indica si se manejó el error
 */
export function modalManejarRespuestaError(contenedorModal, error, valorError = "danger", colorTexto = "danger") {
    if (Array.isArray(error) && error[0] === valorError) {
        const modalInfo = modalDeInformacion(error[1], `fs-6 text-${colorTexto}-emphasis`);
        contenedorModal.appendChild(modalInfo);
        modalInfo.querySelector("button[data-id='__btn-cerrar']").focus();
        return true;
    }
    return false;
}

/**
 * Función: Valida si una fecha corresponde a la gestión activa
 * Descripción: Esta función verifica si la fecha proporcionada está dentro del rango de fechas de la gestión activa.
 *              Si no es así, crea un modal de información y lo agrega al contenedor del modal.
 * Fecha: 04 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Valida si una fecha corresponde a la gestión activa
 * @param {string} fecha - Fecha a validar (formato 'YYYY-MM-DD')
 * @param {HTMLElement} contenedorModal - Contenedor del modal
 * @param {Object} [gestion] - Datos de la gestión activa
 * @param {string} [mensajeError] - Mensaje de error a mostrar en el modal si la fecha no es válida
 * @returns {Promise<boolean>} Indica si la fecha es válida
 */
export async function modalValidarFechaSegunGestion(
    fecha,
    contenedorModal,
    gestion,
    mensajeError = "La fecha de transacción no corresponde a la Gestión Activa"
) {
    const datoGestionActiva = gestion ?? await obtenerDatos(`${CT_URLAPI}getgestionactual/${getEmpresaId()}`);
    if (datoGestionActiva && datoGestionActiva.nombre) {
        if (!(datoGestionActiva.fechaini <= fecha && fecha <= datoGestionActiva.fechafin)) {
            const modalInfo = modalDeInformacion(mensajeError, "fs-6 text-danger-emphasis");
            contenedorModal.appendChild(modalInfo);
            // modalInfo.querySelector("button[data-id='__btn-cerrar']").focus();
            return false;
        } else {
            return true;
        }
    } else {
        const modalInfo = modalDeInformacion("No se pudo obtener la Gestión Activa", "fs-6 text-danger-emphasis");
        contenedorModal.appendChild(modalInfo);
        // modalInfo.querySelector("button[data-id='__btn-cerrar']").focus();
        return false;
    }
}