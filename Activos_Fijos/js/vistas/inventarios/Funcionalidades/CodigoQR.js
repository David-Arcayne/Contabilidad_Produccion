import { crearElemento } from "../../../funciones/Funciones.js";

/**
 * Crea un QR con el código del activo fijo.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaActivosFijos - Elemento contenedor de la vista activos fijos.
 * @returns
 */
export const CodigoQR = (datosVista) => {
    const {
        vistaActivosFijos,
    } = datosVista;

    return ({elemento, registro}) => {

        elemento.setAttribute("class", "text-nowrap");

        const div = crearElemento("div", {class: "p-2"});
        const qrcode = new QRCode(div, {
            text: registro.codigo,
            width: 300,
            height:300,
            colorDark : "#000000", // "#44A09E"
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        const img  = div.querySelector("img");
        img.setAttribute("class", "img-fluid img-thumbnail");

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
                style: "background-color: #000000c6;", // #000000e6
            },
            [div, cerrar]
        );
    
        // Elimina el modal si se hace click fuera del contendor de mensaje
        contenedorModal.addEventListener('click', function (event) {
            if ((div && !div.contains(event.target)) || (cerrar && cerrar.contains(event.target))) {
                contenedorModal.remove();
            }
        });

        const icono = crearElemento("i", {class: "bi bi-qr-code"});
        const btnQR = crearElemento("button", {class: "btn btn-sm btn-warning"}, [icono, " QR"]);
        elemento.append(btnQR);

        btnQR.addEventListener("click", (e) => {
            vistaActivosFijos.append(contenedorModal);
        })
        
    }   
}