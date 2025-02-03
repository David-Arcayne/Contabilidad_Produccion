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
export const Consolidar = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        URL_LT,
        estiloTd,
    } = datosVista;
    
    return ({elemento, registro, contenidoTabla, tbody, td}) => {
        const tr = td.closest("tr");
        if (tr.classList.contains("table-danger")) {
            elemento.style.display = "none";
        }

        if (registro.consolidar && registro.consolidar === "1") {
            const i = crearElemento("i", {class: "bi bi-unlock-fill"});
            elemento.setAttribute("class", "btn btn-success btn-sm");
            elemento.setAttribute("title", "Consolidar");
            elemento.append(i);
    
            // Evento para activar el registro
            elemento.addEventListener("click", () => {
                const activar = async() => {
                    const respuesta = await obtenerDatos(`${URL}consolidar/${registro.id}/2`);
                    if (respuesta) {
                        const listaDeRegistros = await obtenerDatos(`${URL_LT}`);
                        contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                        alertaDeExito(contenedorDeAlertas, "Registro consolidado con éxito")
                    } else {
                        alertaDeError(contenedorDeAlertas, "No se pudo consolidar el registro")
                    }
                }
                const confirmar = modalDeConfirmacion(activar, "¿Esta seguro de consolidar el registro?");
                vistaPrincipal.appendChild(confirmar);
            });   
        } else {
            const i = crearElemento("i", {class: "bi bi-lock-fill"});
            elemento.setAttribute("class", "btn btn-danger btn-sm");
            elemento.setAttribute("title", "Desconsolidar");
            elemento.append(i);
            // Evento para solicitar la desconslidación de la transacción
            elemento.addEventListener("click", () => {
                // Crea un modal con un formulario
                const innerDiv = crearElemento("div", {class: "inner-div"});
                const modalSolicitud = async() => {
                    const floatingDiv = crearElemento("div", {class: "floating-message p-md-4"});

                    const formulario = `<div >
                        <h5 class="text-center fw-bold">Solicitar desconsolidación</h5>
                        <form class="row g-3 mb-2 mt-0">
                            <div>
                                <label for="detalle_aa" class="form-label">Motivo</label>
                                <textarea rows="2" class="form-control" name="motivo" id="detalle_aa"></textarea>
                            </div>

                            <div class="col text-center">
                                <button type="submit" class="btn btn-primary" id="btn-enviar-formulario">Solicitar</button>
                                <a class="btn btn-secondary">Cancelar</a>
                            </div>
                        </form>
                    </div>`;
                    floatingDiv.innerHTML = formulario;
                    innerDiv.appendChild(floatingDiv);
                    const cancelar = floatingDiv.querySelector(".btn-secondary");
                    const elementoFormulario = floatingDiv.querySelector("form");

                    const usuario_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].idusuario;
                    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

                    // Preparación y envio de formulario y control de la respuesta
                    elementoFormulario.addEventListener("submit", (e) => {
                        e.preventDefault();
                        const accionEnviar = async() => {
                            // const listaDeRegistros = obtenerDatos(`${URL}/${objAFTI.tipo_inventario}`);
                            // await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                            alertaDeExito(contenedorDeAlertas, "Solicitud enviada con éxito")
                            innerDiv.remove();
                        }
                        const error = () => {
                            innerDiv.remove();
                            alertaDeError(contenedorDeAlertas, "No se pudo enviar la solicitud")
                        }
                        
                        const fechaActual = new Date();
                        const fecha = fechaActual.toISOString().slice(0, 10);
                        const hora = fechaActual.toTimeString().slice(0, 8);
                        const opciones = {
                            refForm: elementoFormulario,
                            myUrl: `${URL}`,
                            datosExtra: {
                                idtransaccion: registro.id, 
                                ver: "registrardesconsolidar",
                                fecha,
                                hora,
                                idusuario: usuario_id,
                                idempresa: empresa_id
                            },
                            redireccion: accionEnviar,
                            error: error
                        }
                        enviarDatosFormulario(opciones, true);
                    });

                    // Elimina el modal si se hace click fuera del contendor de mensaje
                    innerDiv.addEventListener('click', function(event) {
                        if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
                            innerDiv.remove();
                        }
                    });
                }
                modalSolicitud();
                vistaPrincipal.appendChild(innerDiv)
            });
        }
    }
}

export const DesconsolidacionMultiple = (vistaPrincipal, URL, contenedorDeAlertas) => {
    // Crea un modal con un formulario
    const innerDiv = crearElemento("div", {class: "inner-div"});
    const modalSolicitud = async() => {
        const floatingDiv = crearElemento("div", {class: "floating-message p-md-4", style: "width: 100%; max-width: 500px; min-width: 240px"});

        const formulario = `<div >
            <h5 class="text-center fw-bold">Solicitar desconsolidación</h5>
            <form class="row g-3 mt-0">
                <div>
                    <label for="detalle_aa" class="form-label">Motivo</label>
                    <textarea rows="2" class="form-control" name="motivo" id="detalle_aa"></textarea>
                </div>
                <div class="col-12 col-md-6">
                    <label for="nro_tr_inicio" class="form-label">Trans. Inicio:</label>
                    <input type="number" class="form-control" name="rangoa" id="nro_tr_inicio">
                </div>
                <div class="col-12 col-md-6">
                    <label for="nro_tr_fin" class="form-label">Trans. Final:</label>
                    <input type="number" class="form-control" name="rangob" id="nro_tr_fin">
                </div>

                <div class="col-12 text-center mt-4">
                    <button class="btn btn-primary" id="btn-enviar-formulario">Solicitar</button>
                    <a class="btn btn-secondary">Cancelar</a>
                </div>
            </form>
        </div>`;
        floatingDiv.innerHTML = formulario;
        innerDiv.appendChild(floatingDiv);
        const cancelar = floatingDiv.querySelector(".btn-secondary");
        const elementoFormulario = floatingDiv.querySelector("form");

        const usuario_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].idusuario;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

        // Preparación y envio de formulario y control de la respuesta
        elementoFormulario.addEventListener("submit", (e) => {
            e.preventDefault();
            const accionEnviar = async() => {
                // const listaDeRegistros = obtenerDatos(`${URL}/${objAFTI.tipo_inventario}`);
                // await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                alertaDeExito(contenedorDeAlertas, "Solicitud enviada con éxito")
                innerDiv.remove();
            }
            const error = () => {
                innerDiv.remove();
                alertaDeError(contenedorDeAlertas, "No se pudo enviar la solicitud")
            }
            
            const fechaActual = new Date();
            const fecha = fechaActual.toISOString().slice(0, 10);
            const hora = fechaActual.toTimeString().slice(0, 8);
            const opciones = {
                refForm: elementoFormulario,
                myUrl: `${URL}`,
                datosExtra: {
                    ver: "rangosolicituddesconsolidar",
                    estado: 0,
                    hora,
                    fecha,
                    idusuario: usuario_id,
                    idempresa: empresa_id
                },
                redireccion: accionEnviar,
                error: error
            }
            enviarDatosFormulario(opciones, true);
        })

        // Elimina el modal si se hace click fuera del contendor de mensaje
        innerDiv.addEventListener('click', function(event) {
            if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
                innerDiv.remove();
            }
        });
    }
    modalSolicitud();
    vistaPrincipal.appendChild(innerDiv)

}
