import { crearElemento } from "../../../funciones/Funciones.js";
import { enviarDatos, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Imagen del componente, y modal de la imagen.
 * @param {HTMLElement} vistaComponentes - Elemento que contiene la vista Componentes.
 * @returns 
 */
export const Notificacion = (vistaPrincipal, contenedorFormulario) => {
    const notificacion = crearElemento("div", {class: "d-flex justify-content-end "});
    (async () => {

            const obsAlertaConcluidos = await obtenerDatos(`./api/historial/menu-notificacion/concluidos`);
            if (obsAlertaConcluidos && obsAlertaConcluidos.rows > 0) {
                const cantidad = parseInt(obsAlertaConcluidos.data?.cantidad);
                if (!(cantidad === 0)) {
                    const i = crearElemento("i", {class: "bi bi-exclamation-circle-fill"});
                    const btnAlerta = crearElemento("button", {class: "btn btn-sm btn-success rounded-5 mb-4 me-2 pe-none"}, [i, ` ${cantidad}: pronto a funcionamiento`]);
                    notificacion.append(btnAlerta);
                }
            }
    
            const listaDeRegistros = await obtenerDatos(`./api/inventarios-activofijo/lista-notificaciones/situacion`);
    
            if (listaDeRegistros && listaDeRegistros.rows) {
                const i = crearElemento("i", {class: "bi bi-bell-fill"});
                const btnAlerta = crearElemento("button", {class: "btn btn-sm btn-primary rounded-5 mb-3"}, [i, " Ver alertas"]); 
                notificacion.append(btnAlerta);
    
                btnAlerta.addEventListener("click", async () => {
    
                    const modalDarDeBaja = () => {
                        const innerDiv = crearElemento("div", {class: "inner-div"});
                        const floatingDiv = crearElemento("div", {class: "floating-message p-md-4", style: "width: 100%; max-width: 400px; min-width: 240px"});
                        
                        const div = crearElemento("div", {class: "overflow-y-auto", style: "max-height: 500px"});
                        let contador = listaDeRegistros.rows;
                        listaDeRegistros.data.forEach((registro) => {
                            const notificaciones = `
                                <div class="card mb-2">
                                    <div class="row g-0">
                                        
                                        <div class="col">
                                            <div class="p-2 pe-0" id="contenido-obs-${registro.id}">
                                                <h6 class="card-title mb-0 text-primary text-nowrap">${registro.codigoaf}</h6>
                                                <i class="card-text p-0 m-0">${registro.nombreaf}: ${registro.detalleaf}</i>
                                                <h6 class="card-text mb-1">${registro.obs_observacion ?? "-"}</h6>
                                                <!--<p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>-->
                                            </div>
                                        </div>
                                        <div class="col-auto p-1">
                                            <a class="btn btn-primary px-1 py-0" id="borra-observacion-${registro.id}"><i class="bi bi-x-lg fw-bold"></i></a>
                                        </div>
                                    </div>
                                </div>`;
                            div.insertAdjacentHTML("beforeend", notificaciones);
    
                            const btnBorrar = div.querySelector(`#borra-observacion-${registro.id}`);
                            btnBorrar.addEventListener("click", async () => {
                                const respuesta = await enviarDatos(`./api/inventarios-activofijo/cambiar-accion/${registro.obs_id}`, "PUT");
                                if (respuesta) {
                                    btnBorrar.closest(".card").remove();
                                    contador--;
                                    if (contador === 0) {
                                        btnAlerta.remove();
                                        innerDiv.remove();
    
                                    }
                                }
                            });

                            const inputAF = contenedorFormulario.querySelector("#situacion_activofijo");
                            const inputDetalle = contenedorFormulario.querySelector("#situacion_detalle");

                            const contenidoObs = div.querySelector(`#contenido-obs-${registro.id}`);
                            contenidoObs.addEventListener("click", () => {
                                const inputAFSelectize = $(inputAF)[0].selectize;
                                inputAFSelectize?.setValue(registro.activosfijos_id);
                                inputDetalle.value = registro.obs_observacion;
                                innerDiv.remove();
                            });
                        });
    
                        const h4 = crearElemento("h4", {class: "text-center"}, "Observaciones");
                        const divContenedor = crearElemento("div", undefined, [h4, div]);
    
                        floatingDiv.appendChild(divContenedor);
                        innerDiv.appendChild(floatingDiv);
                    
                        // Elimina el modal si se hace click fuera del contendor de mensaje
                        innerDiv.addEventListener('click', function(event) {
                            if ((floatingDiv && !floatingDiv.contains(event.target))) {
                                innerDiv.remove();
                            }
                        });
                        
                        return innerDiv;
                    }
                    
                    vistaPrincipal.appendChild(modalDarDeBaja());
                });
            }
        })()
    return notificacion;
}