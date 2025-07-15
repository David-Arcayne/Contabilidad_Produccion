import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatos, enviarDatosFormulario, obtenerDatos, rellenarSelect } from "../../../funciones/Solicitudes.js";

/**
 * Crea un modal de confirmación para dar de baja.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns
 */
export const DarDeBaja = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        estiloTd,
    } = datosVista;
    
    return ({elemento, registro, contenidoTabla, tbody}) => {
        if (!registro.eliminado_en) {
            const i = crearElemento("i", {class: "bi bi-hand-thumbs-up-fill"});
            elemento.setAttribute("class", "btn btn-success btn-sm");
            elemento.setAttribute("title", "Dar de baja");
            elemento.append(i);
    
            // Evento para dar de baja el registro
            elemento.addEventListener("click", () => {
                // Crea un modal con un formulario
                const modalDarDeBaja = () => {
                    const innerDiv = crearElemento("div", {class: "inner-div"});
                    const floatingDiv = crearElemento("div", {class: "floating-message text-center p-md-4"});
                    
                    const formulario = `<div >
                        <h2 class="" >Razon de la baja del activo</h2>
                        <form class="row g-3 mx-3 mb-2 mt-0">
                            <select class="form-select" name="tipobaja_id" required></select>
                            <textarea rows="1" class="form-control" placeholder="Detalle" name="detallebaja"></textarea>
                            <input type="datetime-local" class="form-control" name="fechabaja">
                            <input type="number" step="any" class="form-control" placeholder="Costo" name="precio">
                            <div class="col">
                                <button class="btn btn-primary" id="btn-enviar-formulario">Aceptar</button>
                                <a class="btn btn-secondary">Cancelar</a>
                            </div>
                        </form>
                    </div>`;
                    floatingDiv.innerHTML = formulario;
                    innerDiv.appendChild(floatingDiv);
                    const cancelar = floatingDiv.querySelector(".btn-secondary");
                    const elementoFormulario = floatingDiv.querySelector("form");

                    // Preparación y envio de formulario y control de la respuesta
                    elementoFormulario.addEventListener("submit", (e) => {
                        e.preventDefault();
                        const accionEnviar = async() => {
                            const listaDeRegistros = obtenerDatos(URL);
                            await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                            innerDiv.remove();
                            alertaDeExito(contenedorDeAlertas, "Activo fijo desactivado con éxito")
                        }
                        const error = () => {
                            innerDiv.remove();
                            alertaDeError(contenedorDeAlertas, "No se pudo dar de baja")
                        }
                        
                        const opciones = {
                            refForm: elementoFormulario,
                            myUrl: `${URL}/desactivar/${registro.id}`,
                            datosExtra: {"_method": "put", activosfijos_id: registro.id},
                            redireccion: accionEnviar,
                            error: error
                        }
                        enviarDatosFormulario(opciones, true);  
                    })
                    const selectDato = {
                        origen: "./api/tipo-baja/activos", 
                        llaves: { id: "id", detalle: "nombre" },
                    }
                    const select = elementoFormulario.querySelector("select");
                    rellenarSelect(select, selectDato);
                
                    // Elimina el modal si se hace click fuera del contendor de mensaje
                    innerDiv.addEventListener('click', function(event) {
                        if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
                            innerDiv.remove();
                        }
                    });
                    
                    return innerDiv;
                }
                
                vistaPrincipal.appendChild(modalDarDeBaja())
            })
    
        } else {
            const i = crearElemento("i", {class: "bi bi-hand-thumbs-down-fill"});
            elemento.setAttribute("class", "btn btn-danger btn-sm");
            elemento.setAttribute("title", "Activar");
            elemento.append(i);
    
            // Evento para activar el registro
            elemento.addEventListener("click", () => {
                const activar = async() => {
                    const respuesta = await enviarDatos(`${URL}/activar/${registro.id}`, "PUT");
                    if (respuesta && respuesta.ok) {
                        const listaDeRegistros = obtenerDatos(URL);
                        await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                        alertaDeExito(contenedorDeAlertas, "Registro activado")
                    } else {
                        alertaDeError(contenedorDeAlertas, "No se pudo activar el registro")
                    }
                }
                const confirmar = modalDeConfirmacion(activar, "Esta seguro de activar");
                vistaPrincipal.appendChild(confirmar);
            });        
        }
    }
}