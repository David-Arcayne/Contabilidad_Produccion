import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatos, enviarDatosObj, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Imagen del componente, y modal de la imagen.
 * @param {HTMLElement} vistaComponentes - Elemento que contiene la vista Componentes.
 * @returns 
 */
export const Notificacion = (vistaPrincipal, funcVariables) => {
    

    const notificacion = crearElemento("div", {class: "d-flex justify-content-end mb-2 mb-sm-0"});
    (async () => {    
            const listaDeRegistros = await obtenerDatos(`./api/movimientos-admin/lista-sugerencias`);
            if (listaDeRegistros && listaDeRegistros.rows) {
                const i = crearElemento("i", {class: "bi bi-bell-fill"});
                const btnAlerta = crearElemento("button", {class: "btn btn-sm btn-primary rounded-5"}, [i, " Ver alertas"]); 
                notificacion.append(btnAlerta);
    
                btnAlerta.addEventListener("click", async () => {
                    const datosVista = funcVariables();
                    const {
                        URL,
                        contenedorDeAlertas,
                        estiloTd,
                        contenidoTabla,
                        tBody
                    } = datosVista;
    
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
                                            <div class="p-2 pe-0" role="button" id="obs-all-${registro.obs_id}">
                                                <h6 class="card-title mb-0 text-primary text-nowrap">${registro.codigo}</h6>
                                                <i class="card-text p-0 m-0">${registro.nombreactivofijo}: ${registro.detalleactivofijo}</i>
                                                <h6 class="card-text mb-1">${registro.obs_observacion || "-"}</h6>
                                                <span class="card-text mb-1">Cantidad: ${registro.obs_cantidad ?? "-"}</span>
                                                <!--<p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>-->
                                            </div>
                                        </div>
                                        <div class="col-auto p-1">
                                            <a class="btn btn-primary px-1 py-0" id="borra-observacion-${registro.obs_id}"><i class="bi bi-x-lg fw-bold"></i></a>
                                        </div>
                                    </div>
                                </div>`;
                            div.insertAdjacentHTML("beforeend", notificaciones);
    
                            const btnBorrar = div.querySelector(`#borra-observacion-${registro.obs_id}`);
                            btnBorrar.addEventListener("click", async () => {
                                const respuesta = await enviarDatos(`./api/inventarios-activofijo/cambiar-accion/${registro.obs_id}`, "PUT");
                                if (respuesta) {
                                    btnBorrar.closest(".card").remove();
                                    contador--;
                                    
                                    const index = listaDeRegistros.data.findIndex(dato => dato.obs_id === registro.obs_id);
                                    if (index !== -1) {
                                        listaDeRegistros.data.splice(index, 1);
                                    }
                                    if (contador === 0 || !listaDeRegistros.data.length) {
                                        btnAlerta.remove();
                                        innerDiv.remove();
                                    }
                                }
                            });

                            const obsAll = div.querySelector(`#obs-all-${registro.obs_id}`);
                            obsAll.addEventListener("click", async () => {
                                const partes = registro.codigo.split("-");
                                const segundaParte = partes[1];  // "0190030003"

                                const parte1 = segundaParte.substring(0, 3);  // "019"
                                const parte2 = segundaParte.substring(3, 6);  // "003"
                                const parte3 = segundaParte.substring(6);     // "0003"

                                const sucursal = parseInt(parte1, 10);  // 19
                                const area = parseInt(parte2, 10);  // 3
                                const trabajador = parseInt(parte3, 10);  // 3

                                if (!registro.obs_cantidad || (segundaParte === "0000000000" && !registro.obs_trabajador && !registro.obs_area && !registro.obs_sucursal)) {
                                    const divRow = obsAll.closest(".row");
                                    divRow.classList.add("bg-warning-subtle");
                                    setTimeout(() => {
                                        divRow.classList.remove("bg-warning-subtle");
                                    }, 3000);
                                    return;
                                }
                                

                                const activar = async() => {
                                    const accionEnviar = async() => {
                                        btnBorrar.closest(".card").remove();
                                        contador--;
                                        const index = listaDeRegistros.data.findIndex(dato => dato.obs_id === registro.obs_id);
                                        if (index !== -1) {
                                            listaDeRegistros.data.splice(index, 1);
                                        }
                                        if (contador === 0 || !listaDeRegistros.data.length) {
                                            btnAlerta.remove();
                                            innerDiv.remove();
                                        }
                                        
                                        const datosReasignacion = await obtenerDatos(`${URL}`);
                                        await contenidoTBody(datosReasignacion, {contenido: contenidoTabla, estiloTd}, tBody);
                                        alertaDeExito(contenedorDeAlertas, "Registro exitoso");
                                    }
                                    const error = () => {
                                        alertaDeError(contenedorDeAlertas, "Ocurrio un error")
                                    }
                            
                                    const datos = {
                                        detalle: registro.obs_observacion,
                                        obs_id: registro.obs_id,
                                        
                                        o_sucursal: sucursal || "",
                                        o_area: area || "",
                                        o_trabajador: trabajador || "",
                                        d_sucursal: registro.obs_sucursal || "",
                                        d_area: registro.obs_area || "",
                                        d_trabajador: registro.obs_trabajador || "",
                                        obs_cantidad: registro.obs_cantidad || "",
                                        id_af: registro.id_af || "",
                                    }
                                    
                                    const opciones = {
                                        datos: datos,
                                        myUrl: `${URL}/registro-automatico`,
                                        redireccion: accionEnviar,
                                        error: error
                                    }
                                    enviarDatosObj(opciones);
                                }
                                const confirmar = modalDeConfirmacion(activar, "¿Esta seguro registrar este movimiento?");
                                vistaPrincipal.appendChild(confirmar);
                                
                            });
                        });
    
                        const h4 = crearElemento("h4", {class: "text-center"}, "Sugerencias");
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