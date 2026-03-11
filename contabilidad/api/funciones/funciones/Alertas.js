import { crearElemento } from "./Funciones.js";

/**
 * Función: Crea una alerta de Exito
 * Descripción: Esta función crea una alerta de éxito que se muestra en el elemento contenedor especificado y desaparece después de un tiempo determinado.
 * Autor: Joel Choque
 */
/**
 * Crea una alerta de Exito
 * @param {HTMLElement} contenedor - Elemento contenedor de la alerta
 * @param {string} mensaje - Mensaje de la alerta
 * @param {number} [tiempo] - Tiempo en milisegundos antes de que la alerta desaparezca
 */
export const alertaDeExito = (contenedor, mensaje, tiempo = 1000) => {
    const icono = crearElemento("i", { class: "bi bi-check-circle-fill" });
    const alerta = crearElemento("div", { class: "alert alert-success", role: "alert" }, [icono, " ", mensaje]);

    contenedor.replaceChildren(alerta);

    setTimeout(function () {
        alerta.remove();
    }, tiempo); // Tiempo en milisegundos antes de que la alerta desaparezca
}

/**
 * Función: Crea una alerta de Advertencia
 * Descripción: Esta función crea una alerta de advertencia que se muestra en el elemento contenedor especificado y desaparece después de un tiempo determinado.
 * Autor: Joel Choque
 */

/**
 * Crea una alerta de Advertencia
 * @param {HTMLElement} contenedor - Elemento contenedor de la alerta
 * @param {string} mensaje - Mensaje de la alerta
 * @param {number} [tiempo] - Tiempo en milisegundos antes de que la alerta desaparezca
 */
export const alertaDeAdvertencia = (contenedor, mensaje, tiempo = 5000) => {
    const icono = crearElemento("i", { class: "bi bi-exclamation-triangle-fill" });
    const alerta = crearElemento("div", { class: "alert alert-warning", role: "alert" }, [icono, " ", mensaje]);

    contenedor.replaceChildren(alerta);

    setTimeout(function () {
        alerta.remove();
    }, tiempo); // Tiempo en milisegundos antes de que la alerta desaparezca
}

/**
 * Función: Crea una alerta de Error
 * Descripción: Esta función crea una alerta de error que se muestra en el elemento contenedor especificado y desaparece después de un tiempo determinado.
 * Autor: Joel Choque
 */
/** * Crea una alerta de Error
 * @param {HTMLElement} contenedor - Elemento contenedor de la alerta
 * @param {string} mensaje - Mensaje de la alerta
 * @param {number} [tiempo] - Tiempo en milisegundos antes de que la alerta desaparezca
 */
export const alertaDeError = (contenedor, mensaje, tiempo = 2000) => {
    const icono = crearElemento("i", { class: "bi bi-x-octagon-fill" });
    const alerta = crearElemento("div", { class: "alert alert-danger", role: "alert" }, [icono, " ", mensaje]);

    contenedor.replaceChildren(alerta);

    setTimeout(function () {
        alerta.remove();
    }, tiempo); // Tiempo en milisegundos antes de que la alerta desaparezca
}
