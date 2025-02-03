import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { PlanCuentas } from "./PlanCuentas.js";

/**
 * Botón para agregar o remover el plan de cuentas.
 * @param {Object} datosVista - Datos de la vista.
 * @param {HTMLElement} datosVista.vistaPrincipal - Vista principal.
 * @param {HTMLElement} datosVista.vistaPlanCuentas - Vista de plan de cuentas.
 * @returns {HTMLElement} Botón.
 */
export const BtnAgrRemPC = (datosVista) => {
    const boton = crearElemento("button", { class: "btn btn-info" }, ["Plan de cuentas modelo"]);
    PlanCuentas(datosVista);
    boton.addEventListener("click", () => {
        cambiarVista(datosVista.vistaPrincipal, datosVista.vistaPlanCuentas);

        // Ajustar la altura de la tabla
        const body = datosVista.vistaPlanCuentas.closest(".card-body");
        const div = datosVista.vistaPlanCuentas.querySelector(".table-responsive");
        const altura = body.offsetHeight  - (div.offsetTop);
        if (altura > 230) {
            div.setAttribute("style", `max-height: ${altura + 30}px`);
        }else {
            div.setAttribute("style", `max-height: 260px`);
        }
    });
    return boton;
}

/**
 * Botón para agregar los planes de cuentas.
 * @param {string} url - URL de la API.
 * @param {Object} opciones - Opciones.
 * @param {HTMLElement} opciones.contenedor - Contenedor de alertas.
 * @param {HTMLElement} opciones.vista - Vista principal.
 * @param {Function} opciones.accion - Funcion que se ejecutará al agregar los planes correctamente.
 * @returns {HTMLElement} Botón.
 */
export const AgregarPlanes = (url, opciones) => {
    const boton = crearElemento("button", { class: "btn btn-info" }, ["Agregar Plan de Cuentas"]);
    boton.addEventListener("click", () => {
        const Agregar = () => {
            return obtenerDatosAlr(url, {
                contenedor: opciones.contenedor,
                error: "Ocurrio un error al Aaregar",
                accion: opciones.accion("Se agregaron los planes de cuentas correctamente.")
            });
        };
        opciones.vista.appendChild(modalDeConfirmacion(Agregar, "¿Está seguro de agregar los planes de cuentas?"));
    });
    return boton;
}

/**
 * Botón para reemplazar los planes de cuentas.
 * @param {string} url - URL de la API.
 * @param {Object} opciones - Opciones.
 * @param {HTMLElement} opciones.contenedor - Contenedor de alertas.
 * @param {HTMLElement} opciones.vista - Vista principal.
 * @param {Function} opciones.accion - Funcion que se ejecutará al reemplazar los planes correctamente.
 * @returns {HTMLElement} Botón.
 */
export const ReemplazarPlanes = (url, opciones) => {
    const boton = crearElemento("button", { class: "btn btn-primary" }, ["Reemplazar Plan de Cuentas"]);
    boton.addEventListener("click", async () => {
        const reemplazar = () => {
            return obtenerDatosAlr(url, {
                contenedor: opciones.contenedor,
                error: "Ocurrio un error al reemplazar",
                accion: opciones.accion("Se reemplazaron los planes de cuentas correctamente.")
            });
        };
        opciones.vista.appendChild(modalDeConfirmacion(reemplazar, "¿Está seguro de reemplazar los planes de cuentas?"));
    });
    return boton;
}