import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { enviarDatos, rellenarSelect } from "../../../funciones/Solicitudes.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { confirmacion } from "./Confirmacion.js";

/**
 * Crea los botones de confimación o rechaso para los activos solicitados.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaActivosFijos - Elemento contenedor de la vista activos fijos.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento de la vista principal que contendrá las alertas.
 * @param {HTMLElement} datosVista.contenedorDeAlertasAF - Elemento que contendrá las alertas.
 * @param {HTMLElement} datosVista.datosPendiente - Elemento de la vista principal que contendrá las alertas.
 * @param {number[]} datosVista.contador - Array que contiene la cantidad de registros procesados y exitentes.
 * @param {HTMLElement} datosVista.formularioConfirmar - Elemento que contendra el formulario.
 * @param {(string|Object)[]} datosVista.contenidoTabla - Array con las llaves de llaves de los registros.
 * @param {HTMLElement} datosVista.tbody - Cuerpo de la tabla de solicitudes pendientes.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns
 */
export const AccionSolicitud = (datosVista) => {
    const {
        vistaPrincipal,
        vistaActivosFijos,
        contenedorDeAlertas, 
        contenedorDeAlertasAF,
        datosPendiente,
        contador,
        formularioConfirmar,
        contenidoTabla,
        tbody,
        estiloTd,
    } = datosVista;

    return ({elemento, registro}) => {
        elemento.setAttribute("class", "text-nowrap");
        const URL = "./api/solicitud-af-pendiente";

        if (registro.estado == 2 && registro.activosfijos_id === null) {
            const iconoAsignar = crearElemento("i", { class: "bi bi-bag-plus-fill" });
            const btnAsignar = crearElemento("button", { class : "btn btn-sm btn-primary"}, [iconoAsignar, " asignar"]);
            const iconoDenegar = crearElemento("i", { class: "bi bi-hand-thumbs-down-fill"})
            const btnDenegar = crearElemento("button", { class : "btn btn-sm btn-danger"}, [iconoDenegar, " denegar"])
            elemento.append(btnAsignar, " ", btnDenegar);

            btnAsignar.addEventListener("click", () => {
                // Crea un modal con un formulario
                const modalDarDeBaja = () => {
                    const innerDiv = crearElemento("div", {class: "inner-div"});
                    const floatingDiv = crearElemento("div", {class: "floating-message text-center p-md-4"});
                    
                    const selectAF = crearElemento("select", {class: "form-select text-start", name: "activosfijos_id", required: true, id:"actiofijo"});
                    const aceptar = crearElemento("button", {class: "btn btn-primary"}, "Aceptar");
                    const cancelar = crearElemento("a", {class: "btn btn-secondary"}, "Cancelar");
                    const colOpciones = crearElemento("div", {class: "col"}, [aceptar, " ", cancelar]);
                    const titulo = crearElemento("h2", {class: ""}, "Asignar activo fijo");
                    const formulario = crearElemento("form", {class: "row g-3 mx-3 mb-2 mt-0"}, [selectAF, colOpciones]);
                    const contenido = crearElemento("div", undefined, [titulo, formulario]);
                    floatingDiv.appendChild(contenido);
                    innerDiv.appendChild(floatingDiv);

                    // Preparación y envio de formulario y control de la respuesta
                    formulario.addEventListener("submit", async (e) => {
                        e.preventDefault();
                        const respuesta = await enviarDatos(`${URL}/asignar/${selectAF.value}/${registro.id}`, "PUT");
                        if (respuesta && respuesta.ok) {
                            const i = crearElemento("i", { class: "bi bi-hand-thumbs-up-fill" });
                            const btnAceptado = crearElemento("button", { class : "btn btn-sm btn-success pe-none" }, [i, " asignado"]);
                            elemento.replaceChildren(btnAceptado);
                            alertaDeExito(contenedorDeAlertasAF, "Solicitud aceptada");
                            contador[0] = contador[0] + 1;
                            if (contador[0] === 1) {
                                confirmacion(
                                    formularioConfirmar,
                                    vistaPrincipal,
                                    vistaActivosFijos,
                                    URL,
                                    datosPendiente,
                                    contenidoTabla,
                                    tbody,
                                    contenedorDeAlertas,
                                    contenedorDeAlertasAF,
                                    contador,
                                    estiloTd
                                );
                            }
                        } else {
                            alertaDeError(contenedorDeAlertasAF, "Ocurrio un error ...")
                        }
                        innerDiv.remove();
                    })
                    const selectDato = {
                        origen: `${URL}/activo-fijo/activos/${registro.cantidad}`, 
                        llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] },
                    }
                    rellenarSelect(selectAF, selectDato);
                
                    // Elimina el modal si se hace click fuera del contendor de mensaje
                    innerDiv.addEventListener('click', function(event) {
                        if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
                            innerDiv.remove();
                        }
                    });
                    
                    return innerDiv;
                }
                
                vistaActivosFijos.appendChild(modalDarDeBaja())
            });

            btnDenegar.addEventListener("click", () => {
                const activar = async() => {
                    const respuesta = await enviarDatos(`${URL}/denegar/${registro.id}/3`, "PUT");
                    if (respuesta && respuesta.ok) {
                        const i = crearElemento("i", { class: "bi bi-hand-thumbs-down-fill" });
                        const btnDenegado = crearElemento("button", { class : "btn btn-sm btn-danger pe-none" }, [i, " rechazado"]);
                        elemento.replaceChildren(btnDenegado);
                        alertaDeExito(contenedorDeAlertasAF, "Solicitud denegada")
                        contador[0] = contador[0] + 1;
                        if (contador[0] === 1) {
                            confirmacion(
                                formularioConfirmar,
                                vistaPrincipal,
                                vistaActivosFijos,
                                URL,
                                datosPendiente,
                                contenidoTabla,
                                tbody,
                                contenedorDeAlertas,
                                contenedorDeAlertasAF,
                                contador,
                                estiloTd
                            );
                        }
                    } else {
                        alertaDeError(contenedorDeAlertasAF, "Ocurrio un error ...")
                    }
                }
                vistaActivosFijos.appendChild(modalDeConfirmacion(activar, "Esta seguro de denegar esta solicitud"))
            });

        } else if (registro.estado == 2) {
            const iconoAceptar = crearElemento("i", { class: "bi bi-hand-thumbs-up-fill"})
            const btnAceptar = crearElemento("button", { class : "btn btn-sm btn-success"}, [iconoAceptar, " aceptar"])
            const iconoDenegar = crearElemento("i", { class: "bi bi-hand-thumbs-down-fill"})
            const btnDenegar = crearElemento("button", { class : "btn btn-sm btn-danger"}, [iconoDenegar, " denegar"])
            elemento.append(btnAceptar, " ", btnDenegar);

            btnAceptar.addEventListener("click", () => {
                const activar = async() => {
                    const respuesta = await enviarDatos(`${URL}/aceptar/${registro.id}/1`, "PUT");
                    if (respuesta && respuesta.ok) {
                        const i = crearElemento("i", { class: "bi bi-hand-thumbs-up-fill" });
                        const btnAceptado = crearElemento("button", { class : "btn btn-sm btn-success pe-none" }, [i, " asignado"]);
                        const td = btnAceptar.closest("td");
                        td.replaceChildren(btnAceptado);
                        alertaDeExito(contenedorDeAlertasAF, "Solicitud aceptada");
                        contador[0] = contador[0] + 1;
                        if (contador[0] === 1) {
                            confirmacion(
                                formularioConfirmar,
                                vistaPrincipal,
                                vistaActivosFijos,
                                URL,
                                datosPendiente,
                                contenidoTabla,
                                tbody,
                                contenedorDeAlertas,
                                contenedorDeAlertasAF,
                                contador,
                                estiloTd
                            );
                        }
                    } else {
                        alertaDeError(contenedorDeAlertasAF, "Ocurrio un error ...")
                    }
                }
                vistaActivosFijos.appendChild(modalDeConfirmacion(activar, "Esta seguro de aceptar esta solicitud"))
            });
            btnDenegar.addEventListener("click", () => {
                const activar = async() => {
                    const respuesta = await enviarDatos(`${URL}/denegar/${registro.id}/3`, "PUT");
                    if (respuesta && respuesta.ok) {
                        const i = crearElemento("i", { class: "bi bi-hand-thumbs-down-fill" });
                        const btnDenegado = crearElemento("button", { class : "btn btn-sm btn-danger pe-none" }, [i, " rechazado"]);
                        const td = btnDenegar.closest("td");
                        td.replaceChildren(btnDenegado);
                        alertaDeExito(contenedorDeAlertasAF, "Solicitud denegada")
                        contador[0] = contador[0] + 1;
                        if (contador[0] === 1) {
                            confirmacion(
                                formularioConfirmar,
                                vistaPrincipal,
                                vistaActivosFijos,
                                URL,
                                datosPendiente,
                                contenidoTabla,
                                tbody,
                                contenedorDeAlertas,
                                contenedorDeAlertasAF,
                                contador,
                                estiloTd
                            );
                        }
                    } else {
                        alertaDeError(contenedorDeAlertasAF, "Ocurrio un error ...")
                    }
                }
                vistaActivosFijos.appendChild(modalDeConfirmacion(activar, "Esta seguro de denegar esta solicitud"))
            });
        } else if (registro.estado == 1) {
            contador[0] = contador[0]+1;
            const i = crearElemento("i", { class: "bi bi-hand-thumbs-up-fill" })
            const btnAceptado = crearElemento("button", { class : "btn btn-sm btn-success pe-none" }, [i, " asignado"])
            elemento.append(btnAceptado);
        } else if (registro.estado == 3) {
            contador[0] = contador[0]+1;
            const i = crearElemento("i", { class: "bi bi-hand-thumbs-down-fill" })
            const btnDenegado = crearElemento("button", { class : "btn btn-sm btn-danger pe-none" }, [i, " rechazado"])
            elemento.append(btnDenegado);
        }
        
    }   
}