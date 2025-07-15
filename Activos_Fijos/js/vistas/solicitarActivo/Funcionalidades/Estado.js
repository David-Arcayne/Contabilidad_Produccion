import { alertaDeAdvertencia, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatos, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Crea un boton segun el estado con la funcionalidad de un modal de confirmación.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns
 */
export const Estado = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        permisos,
        estiloTd,
    } = datosVista;

    return ({ elemento, registro, contenidoTabla, tbody}) => {
    
        if (registro.estado == null) {
            const i = crearElemento("i", {class: "bi bi-envelope-plus-fill"});
            elemento.setAttribute("class", "btn btn-sm btn-info")
            elemento.append(i, " Enviar a")

            if (permisos.editar === "0") {
                elemento.classList.add("pe-none");
                return;
            }
    
            elemento.addEventListener("click", () => {

                const solicitar = async() => {
                    
                    const  activosFijos = await obtenerDatos(`${URL}/activo-fijo/${registro.id}`);
                    if (activosFijos.data && activosFijos.data.length > 0) {
                        const solicitud = await enviarDatos(`${URL}/solicitar/${registro.id}/2`, "PUT");
                        if (solicitud && solicitud.ok) {
                            const listaDeRegistros = obtenerDatos(URL);
                            await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                            alertaDeExito(contenedorDeAlertas, "Solictud Realizada con exito")
                        } else {
                            alertaDeError(contenedorDeAlertas, "No se pudo realizar la solicitud")
                        }
                    } else {
                        alertaDeAdvertencia(contenedorDeAlertas, "No se tiene ningun activo solicitado")
                    }
                }
                vistaPrincipal.appendChild(modalDeConfirmacion(solicitar, "Esta seguro de Enviar la solicitud"));
            });
        } else if (registro.estado == 5) {
            const i = crearElemento("i", {class: "bi bi-envelope-dash-fill"});
            elemento.setAttribute("class", "btn btn-sm btn-info")
            elemento.append(i, " Enviar de")

            if (permisos.editar === "0") {
                elemento.classList.add("pe-none");
                return;
            }
    
            elemento.addEventListener("click", () => {

                const solicitar = async() => {
                    
                    const  activosFijos = await obtenerDatos(`${URL}/activo-fijo/${registro.id}`);
                    if (activosFijos.data && activosFijos.data.length > 0) {
                        const solicitud = await enviarDatos(`${URL}/solicitar/${registro.id}/8`, "PUT");
                        if (solicitud && solicitud.ok) {
                            const listaDeRegistros = obtenerDatos(URL);
                            await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                            alertaDeExito(contenedorDeAlertas, "Solictud Realizada con exito")
                        } else {
                            alertaDeError(contenedorDeAlertas, "No se pudo realizar la solicitud")
                        }
                    } else {
                        alertaDeAdvertencia(contenedorDeAlertas, "No se tiene ningun activo seleccionado")
                    }
                }
                vistaPrincipal.appendChild(modalDeConfirmacion(solicitar, "Esta seguro de Enviar la solicitud"));
            });
        // } else if (registro.estado == 1 && registro.estado_a >= 1 && registro.encargado_id != null) {
        //     const i = crearElemento("i", {class: "bi bi-arrow-bar-right"});
        //     elemento.setAttribute("class", "btn btn-sm btn-success pe-none");
        //     elemento.append(i, " Asignado");
        } else if (registro.estado == 1 && registro.estado_a >= 1) {
            const i = crearElemento("i", {class: "bi bi-hand-thumbs-up-fill"});
            elemento.setAttribute("class", "btn btn-sm btn-success pe-none");
            elemento.append(i, " Adquirido");
        } else if (registro.estado == 2 || registro.estado == 8) {
            const i = crearElemento("i", {class: "bi bi-hourglass"});
            elemento.setAttribute("class", "btn btn-sm btn-warning pe-none");
            elemento.append(i, " Pendiente");
        } else if (registro.estado == 3 || (registro.estado_r >= 1 && registro.estado_r  == registro.estado_t && registro.estado == 1)) {
            const i = crearElemento("i", {class: "bi bi-hand-thumbs-down-fill"});
            elemento.setAttribute("class", "btn btn-sm btn-danger pe-none");
            elemento.append(i, " Rechazado");
        } else if (registro.estado == 6 && registro.estado_a >= 1) {
            const i = crearElemento("i", {class: "bi bi-check-lg"});
            elemento.setAttribute("class", "btn btn-sm btn-success pe-none");
            elemento.append(i, " Devuelto");
        } else if (registro.estado == 7 || (registro.estado_r >= 1 && registro.estado_r  == registro.estado_t)) {
            const i = crearElemento("i", {class: "bi bi-x-lg"});
            elemento.setAttribute("class", "btn btn-sm btn-danger pe-none");
            elemento.append(i, " Rechazado");
        }
    }
}
