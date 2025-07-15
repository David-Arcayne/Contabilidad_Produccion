import { crearElemento } from "./Funciones.js";

/**
 * Crea un modal de confirmación de una operación
 * @param {Function} confirmar - Función que se ejecutara al confirmar la operación
 * @param {string} [texto] - Información del modal
 * @returns {HTMLElement}
 */
export const modalDeConfirmacion = (confirmar, texto = "Está seguro de eliminar el registro") => {
    const informacion = crearElemento("p", {class: "fs-5 text-secondary"}, [texto]);
    const btnContinuar = crearElemento("button", {class: "btn btn-primary px-md-4"}, ["Sí"]);
    const btnCancelar = crearElemento("button", {class: "btn btn-danger px-md-4"}, ["No"]);
    const contenedorMensaje = crearElemento("div", {class: "floating-message text-center p-md-4"}, [informacion, btnContinuar, " ", btnCancelar]);
    const contenedorModal = crearElemento("div", {class: "inner-div"}, [contenedorMensaje]);
    
    btnContinuar.addEventListener("click", async () => {
        btnContinuar?.setAttribute("disabled", "");
        await confirmar();
        contenedorModal.remove();
    });

    // Elimina el modal si se hace click fuera del contendor de mensaje
    contenedorModal.addEventListener("click", function (event) {
        if ((contenedorMensaje && !contenedorMensaje.contains(event.target)) || (btnCancelar && btnCancelar.contains(event.target))) {
            contenedorModal.remove();
        }
    });

    return contenedorModal;
}

/**
 * Crea un modal que muestra un mensaje que se puede copiar
 * @param {string} mensaje - Menjase para copear
 * @param {string} texto - Información del modal
 * @returns {HTMLElement}
 */
export const modalMensaje = (mensaje, texto) => {
    const message = crearElemento('p', {class: " text-secondary"}, [texto]);
    const i = crearElemento("i", {class: "bi bi-clipboard"});
    const btnCopiar = crearElemento("button", {class: "btn btn-outline-warning btn-sm ms-2", title: "Copiar"}, [i]);
    const codigo = crearElemento('p', {class: "text-primary-emphasis fs-5"}, [mensaje, " ", btnCopiar]);
    const continueButton = crearElemento('button', {class: "btn btn-info px-md-4"}, ["Ok"]);
    const contenedorMensaje = crearElemento('div', {class: "floating-message text-center p-md-4"}, [codigo, message, continueButton]);
    const contenedorModal = crearElemento('div', {class: "inner-div"}, [contenedorMensaje]);

    btnCopiar.addEventListener("click", () => {
        copiarAlPortapapeles(codigo.textContent);
        i.setAttribute("class", "bi bi-clipboard-check-fill")
        btnCopiar.setAttribute("title", "Copiado")
    });

    // Elimina el modal si se hace click fuera del contendor de mensaje
    contenedorModal.addEventListener('click', function (event) {
        if ((contenedorMensaje && !contenedorMensaje.contains(event.target)) || (continueButton && continueButton.contains(event.target))) {
            contenedorModal.remove();
        }
    });

    return contenedorModal;
}

/**
 * Copia una cadena al portapapeles
 * @param {string} str - Cadena a copear
 */
const copiarAlPortapapeles = async str => {
    try {
        await navigator.clipboard.writeText(str);
    } catch (error) {
        console.log(error);
    }
};

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

    // Elimina el modal si se hace click fuera del contendor de mensaje
    contenedorModal.addEventListener('click', function (event) {
        if ((imagen && !imagen.contains(event.target)) || (cerrar && cerrar.contains(event.target))) {
            contenedorModal.remove();
        }
    });

    return contenedorModal;
}