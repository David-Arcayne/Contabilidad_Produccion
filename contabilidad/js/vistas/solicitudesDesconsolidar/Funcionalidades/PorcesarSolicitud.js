import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatos, enviarDatosFormulario, enviarDatosObj, obtenerDatos, rellenarSelect } from "../../../funciones/Solicitudes.js";

/**
 * Crea un modal de confirmación para dar de baja.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns
 */
export const ProcesarSolicitud = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        URL_LT,
        estiloTd,
    } = datosVista;
    
    return ({elemento, registro, contenidoTabla, tbody}) => {
        elemento.classList.add("text-nowrap");
        if (registro.estado === "0") {
            const iconoAceptar = crearElemento("i", { class: "bi bi-check-circle me-1" });
            const btnAceptar = crearElemento("button", { class : "btn btn-sm btn-success"}, [iconoAceptar, " aceptar"]);
            const iconoDenegar = crearElemento("i", { class: "bi bi-x-circle me-1" });
            const btnDenegar = crearElemento("button", { class : "btn btn-sm btn-danger"}, [iconoDenegar, " denegar"]);
            elemento.append(btnAceptar, " ", btnDenegar);

            const idusuario = JSON.parse(localStorage.getItem("yofinanciero"))[0].idusuario;

            btnAceptar.addEventListener("click", () => {
                const activar = async() => {
                    const accionEnviar = async() => {
                        // Obtener y actualizar los registros de la tabla de la vista principal.
                        const listaDeRegistros = await obtenerDatos(URL_LT);
                        if (listaDeRegistros) {
                            contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody);
                            alertaDeExito(contenedorDeAlertas, "Solcitud aceptada con exito");
                        } else {
                            alertaDeError(contenedorDeAlertas, "Ocurrio un error")
                        }
                    }
                    const error = () => {
                        alertaDeError(contenedorDeAlertas, "Ocurrio un error")
                    }
        
                    const fechaActual = new Date();
                    const fecha = fechaActual.toISOString().slice(0, 10);
                    const hora = fechaActual.toTimeString().slice(0, 8);
                    // Enviar el registro a la API
                    const datos = {
                        grupo: registro.grupo,
                        estado: 1,
                        fecha,
                        hora,
                        idusuario,
                        ver: 'cambiarestadoconsolidado'
                    }
                    const opciones = {
                        datos: datos,
                        myUrl: URL,
                        redireccion: accionEnviar,
                        error: error
                    }
                    enviarDatosObj(opciones);
                }
                vistaPrincipal.appendChild(modalDeConfirmacion(activar, "¿Esta seguro de aceptar esta solicitud?"));
            });
            btnDenegar.addEventListener("click", () => {
                const activar = async() => {
                    const accionEnviar = async() => {
                        // Obtener y actualizar los registros de la tabla de la vista principal.
                        const listaDeRegistros = await obtenerDatos(URL_LT);
                        if (listaDeRegistros) {
                            contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody);
                            alertaDeExito(contenedorDeAlertas, "Solcitud denegada con exito");
                        } else {
                            alertaDeError(contenedorDeAlertas, "Ocurrio un error")
                        }
                    }
                    const error = () => {
                        alertaDeError(contenedorDeAlertas, "Ocurrio un error")
                    }
        
                    const fechaActual = new Date();
                    const fecha = fechaActual.toISOString().slice(0, 10);
                    const hora = fechaActual.toTimeString().slice(0, 8);
                    // Enviar el registro a la API
                    const datos = {
                        grupo: registro.grupo,
                        estado: 2,
                        fecha,
                        hora,
                        idusuario,
                        ver: 'cambiarestadoconsolidado'
                    }
                    const opciones = {
                        datos: datos,
                        myUrl: URL,
                        redireccion: accionEnviar,
                        error: error
                    }
                    enviarDatosObj(opciones);
                }
                vistaPrincipal.appendChild(modalDeConfirmacion(activar, "¿Esta seguro de denegar esta solicitud?"));
            });
        } else {
            if (registro.estado === "1") {
                const i = crearElemento("i", { class: "bi bi-hand-thumbs-up-fill me-1" });
                const btnAceptado = crearElemento("button", { class : "btn btn-sm btn-info pe-none" }, [i, " aceptado"]);
                elemento.replaceChildren(btnAceptado);
            } else {
                const i = crearElemento("i", { class: "bi bi-hand-thumbs-down-fill me-1" });
                const btnDenegado = crearElemento("button", { class : "btn btn-sm btn-info pe-none" }, [i, " denegado"]);
                elemento.replaceChildren(btnDenegado);
            }
        }
    }
}
