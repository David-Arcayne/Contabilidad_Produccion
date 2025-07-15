import { crearElemento } from "./Funciones.js";

/**
 * Crea una alerta de Exito que se desaparece despues de 5 segundos
 * @param {HTMLElement} contenedor - Elemento donde se agregara la alerta
 * @param {string} mensaje - Mensaje de la alerta
 */
export const alertaDeExito = (contenedor, mensaje) => {
    const icono = crearElemento("i", { class: "bi bi-check-circle-fill" });
    const alerta = crearElemento("div", { class: "alert alert-success", role: "alert" }, [icono, " ", mensaje]);

    contenedor.replaceChildren(alerta);

    setTimeout(function () {
        alerta.remove();
    }, 5000);
}

/**
 * Crea una alerta de Advertencia que se desaparece despues de 5 segundos
 * @param {HTMLElement} contenedor - Elemento donde se agregara la alerta
 * @param {string} mensaje - Mensaje de la alerta
 */
export const alertaDeAdvertencia = (contenedor, mensaje) => {
    const icono = crearElemento("i", { class: "bi bi-exclamation-triangle-fill" });
    const alerta = crearElemento("div", { class: "alert alert-warning", role: "alert" }, [icono, " ", mensaje]);

    contenedor.replaceChildren(alerta);

    setTimeout(function () {
        alerta.remove();
    }, 5000);
}

/**
 * Crea una alerta de Error que se desaparece despues de 5 segundos
 * @param {HTMLElement} contenedor - Elemento donde se agregara la alerta
 * @param {string} mensaje - Mensaje de la alerta
 */
export const alertaDeError = (contenedor, mensaje) => {
    const icono = crearElemento("i", { class: "bi bi-x-octagon-fill" });
    const alerta = crearElemento("div", { class: "alert alert-danger", role: "alert" }, [icono, " ", mensaje]);

    contenedor.replaceChildren(alerta);

    setTimeout(function () {
        alerta.remove();
    }, 5000);
}
