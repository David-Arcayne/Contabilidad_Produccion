import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Crea un modal de confirmación para cambiar el estado de la gestion.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas de la vista principal.
 * @param {string} datosVista.URL - URL principal.
 * @param {string} datosVista.URL_LT - URL para obtener los datos para la tabla de la vista principal.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla de la vista principal.
 * @returns
 */
export const Estado = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        URL_LT,
        estiloTd,
    } = datosVista;
    
    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {HTMLElement} referencias.elemento - Elemento "button" del estado de la gestion.
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Gestion contable.
     * @param {Object} referencias.contenidoTabla - Objeto con los registros y estilos a usar de la tabla de la vista principal.
     * @param {HTMLElement} referencias.tbody - Elemento "tbody" de la tabla de la vista principal.
     */
    return ({elemento, registro, contenidoTabla, tbody}) => {
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        if (registro.estado == 2) {
            // Crear estilos y funcionamiendo del boton para desactivar la gestion
            const i = crearElemento("i", {class: "bi bi-hand-thumbs-up-fill"});
            elemento.setAttribute("class", "btn btn-success btn-sm");
            elemento.setAttribute("title", "Desactivar");
            elemento.append(i);
            const desactivar = async () => {
                const datos = await obtenerDatos(`${URL}estadogestion/${registro.id}/1/${empresa_id}`);
                if (datos !== false) {
                    alertaDeExito(contenedorDeAlertas, "Gestión desactivada");
                    const datosT = await obtenerDatos(URL_LT);
                    if (datosT) {
                        contenidoTBody(datosT, { contenido: contenidoTabla, estiloTd }, tbody);
                    } else {
                        alertaDeError(contenedorDeAlertas, "Ocurrio un error");
                    }
                } else {
                    alertaDeError(contenedorDeAlertas, "Ocurrio un error");
                }
            }
            // Evento para desactivar la gestion
            elemento.addEventListener("click", () => {
                vistaPrincipal.append(modalDeConfirmacion(desactivar, "¿Desea desactivar la gestion?"));
            })
    
        } else {
            // Crear estilos y funcionamiendo del boton para activar la gestion
            const i = crearElemento("i", {class: "bi bi-hand-thumbs-down-fill"});
            elemento.setAttribute("class", "btn btn-danger btn-sm");
            elemento.setAttribute("title", "Activar");
            elemento.append(i);
            const activar = async () => {
                const datos = await obtenerDatos(`${URL}estadogestion/${registro.id}/2/${empresa_id}`);
                if (datos !== false) {
                    alertaDeExito(contenedorDeAlertas, "Gestión activada");
                    const datosT = await obtenerDatos(URL_LT);
                    if (datosT) {
                        contenidoTBody(datosT, { contenido: contenidoTabla, estiloTd }, tbody);
                    } else {
                        alertaDeError(contenedorDeAlertas, "Ocurrio un error");
                    }
                } else {
                    alertaDeError(contenedorDeAlertas, "Ocurrio un error");
                }
            }
            // Evento para actuvar la gestion
            elemento.addEventListener("click", () => {
                vistaPrincipal.append(modalDeConfirmacion(activar, "¿Desea activar la gestión?"));
            });        
        }
    }
}