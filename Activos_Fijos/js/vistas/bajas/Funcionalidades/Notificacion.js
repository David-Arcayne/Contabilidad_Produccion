import { AF_ENV } from "../../../../db/environment.js";
import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { enviarDatos, enviarDatosFormulario, obtenerDatos, rellenarSelect } from "../../../funciones/Solicitudes.js";

/**
 * Imagen del componente, y modal de la imagen.
 * @param {HTMLElement} vistaComponentes - Elemento que contiene la vista Componentes.
 * @returns 
 */
export const Notificacion = (vistaPrincipal) => ({elemento, registro}) => {
    const i = crearElemento("i", {class: "bi bi-bell-fill"});
    elemento.setAttribute("class", "btn btn-sm btn-primary rounded-circle");
    elemento.setAttribute("title", "Ver notificaciones");
    elemento.append(i);

    elemento.addEventListener("click", async () => {
        const listaDeRegistros = await obtenerDatos(`./api/inventarios-activofijo/lista-notificaciones/${registro.id}`);
        if (listaDeRegistros && listaDeRegistros.rows) {
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
                                    <div class="p-2 pe-0">
                                        <h6 class="card-title mb-1 text-primary text-nowrap">${registro.codigo}</h6>
                                        <h6 class="card-text mb-1">${registro.obs_observacion}</h6>
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
                            if (contador === 0) {
                                elemento.remove();
                                innerDiv.remove();

                            }
                        }
                    });
                });

                const h4 = crearElemento("h4", {class: "text-center"}, ["Observaciones"]);
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
            
            vistaPrincipal.appendChild(modalDarDeBaja())
        }
    })
}

export const NotificacionInventario = (vistaPrincipal, funcVariables) => {
    const notificacion = crearElemento("div", {class: "d-flex justify-content-end "});
    (async () => {
            const listaDeRegistros = await obtenerDatos(`./api/inventarios-activofijo/lista-notificaciones/bajas`);
            console.log({listaDeRegistros});
            
            if (listaDeRegistros && listaDeRegistros.rows) {
                const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));

                const i = crearElemento("i", {class: "bi bi-bell-fill"});
                const btnAlerta = crearElemento("button", {class: "btn btn-sm btn-warning rounded-5 mb-4"}, [i, " Ver alertas"]); 
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
                                            <div class="p-2 pe-0" role="button" id="obs-all-${registro.obs_id}">
                                                <h6 class="card-title mb-0 text-primary text-nowrap">${registro.codigoaf}</h6>
                                                <i class="card-text p-0 m-0">${registro.nombreaf}: ${registro.detalleaf}</i>
                                                <h6 class="card-text mb-1">${registro.obs_observacion ?? "-"}</h6>
                                                <b class="card-text">Tipo inventario: <span class="text-info">${registro.nombretipoinventario}</span></b>
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

                            const accionObs = () => {
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

                            if (objAFTI) {
                                const obsAll = div.querySelector(`#obs-all-${registro.obs_id}`);
                                obsAll.addEventListener("click", () => {
                                    if (registro.eliminado_en_af) {
                                        const divRow = obsAll.closest(".row");
                                        divRow.classList.add("bg-warning-subtle");
                                        setTimeout(() => {
                                            divRow.classList.remove("bg-warning-subtle");
                                        }, 3000);
                                    } else {
                                        console.log("clickkk");
                                        
                                        DarDeBaja(funcVariables, registro, accionObs);
                                    }
                                });
                            } else {
                                console.log("no procede");
                            }
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

export const SoloNotificacion = ({contenidoTabla, elementoTBody, URL, estiloTd,}) => {
    const btn = crearElemento("button", {class: "btn btn-outline-primary h-100"}, [crearElemento("i", {class: "bi bi-bell"})]);
    const div = crearElemento("div", {class: "col-auto"}, [btn]);

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cuerpo = new FormData();
        if (btn.classList.contains("btn-outline-primary")) {
            cuerpo.append("con_alertas", "true");
        }
        const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
        fetch(`${URL}/reporte/${objAFTI.tipo_inventario}`, {
            method:"POST",
            body: cuerpo
        })
        .then(res => res.json())
        .then(res => {
            contenidoTBody(res, {contenido: contenidoTabla, estiloTd}, elementoTBody);
            if (btn.classList.contains("btn-outline-primary")) {
                btn.classList.remove("btn-outline-primary");
                btn.classList.add("btn-primary");
            } else {
                btn.classList.remove("btn-primary");
                btn.classList.add("btn-outline-primary");
            }
        })
        .catch(error => {
            console.log("Error:: ", error);
        })
    });

    return div;

}

/**
 * Crea un modal de confirmación para dar de baja.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns
 */
export const DarDeBaja = (funcVariables, registro, accionObs) => {
    const datosVista = funcVariables();
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        estiloTd,
        contenidoTabla,
        tBody
    } = datosVista;
    
    if (!registro.eliminado_en_af) {
        // Crea un modal con un formulario
        const innerDiv = crearElemento("div", {class: "inner-div"});
        const modalDarDeBaja = async() => {
            const floatingDiv = crearElemento("div", {class: "floating-message text-center p-md-4"});

            const listaDeRegistros = await obtenerDatos(`./api/inventarios-activofijo/lista-asignados/${registro.idaf}`);
            
            let opcionesCodigo = "";
            const codigoCantidad = {};
            let cantidadMaxima = "";
            if (listaDeRegistros && listaDeRegistros.rows) {
                cantidadMaxima = `max=${listaDeRegistros.data[0].cantidad}`;
                listaDeRegistros.data.forEach((elemento) => {
                    if (elemento.codigo === registro.codigo) {
                        opcionesCodigo += `<option value="${elemento.codigo}">${elemento.codigo}</option>`;
                        codigoCantidad[elemento.codigo] = elemento.cantidad;
                    }
                });
            }
            
            const formulario = `<div >
                <h2 class="" >¿Dar de baja al activo?</h2>
                <form class="row g-3 mx-3 mb-2 mt-0">
                    <select class="form-select" id="codigo" name="codigo" required>
                        ${opcionesCodigo}
                    </select>
                    <input type="number" id="cantidad" class="form-control" placeholder="Cantidad" name="cantidad" ${cantidadMaxima} value="${registro.obs_cantidad ?? ""}" required>
                    <select class="form-select text-start" id="tipo-baja" name="tipobaja_id" required></select>
                    <textarea rows="1" class="form-control" placeholder="Detalle" name="detallebaja">${registro.obs_observacion ?? ""}</textarea>
                    <input type="datetime-local" class="form-control" name="fechabaja" required id="b_fecha">
                    <input type="number" step="any" class="form-control" placeholder="Costo" name="precio" id="b_costo">
                    
                    <div class="form-check text-start">
                        <input class="form-check-input  p-2 mt-2" id="af_enviar-contabilidad" name="enviarcontabilidad" type="checkbox" value="1">
                        <label class="form-label-ckeck p-2" for="af_enviar-contabilidad">Enviar datos a contabilidad</label>
                    </div>

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
                    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
                    const listaDeRegistros = obtenerDatos(`${URL}/${objAFTI.tipo_inventario}`);
                    await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
                    innerDiv.remove();
                    alertaDeExito(contenedorDeAlertas, "Activo fijo desactivado con éxito")
                    accionObs();
                }
                const error = () => {
                    innerDiv.remove();
                    alertaDeError(contenedorDeAlertas, "No se pudo dar de baja")
                }
                
                const opciones = {
                    refForm: elementoFormulario,
                    myUrl: `${URL}/desactivar/${registro.idaf}`,
                    datosExtra: {"_method": "put", activosfijos_id: registro.idaf, obs_id: registro.obs_id},
                    redireccion: accionEnviar,
                    error: error
                }
                const enviarForm = () => enviarDatosFormulario(opciones, true);
                AccionPrevia(vistaPrincipal)(enviarForm, elementoFormulario);
            })
            const selectDato = {
                origen: "./api/tipo-baja/activos", 
                llaves: { id: "id", detalle: "nombre" },
            }
            const select = elementoFormulario.querySelector("#tipo-baja");
            rellenarSelect(select, selectDato);
            const codigo = elementoFormulario.querySelector("#codigo");
            const cantidad = elementoFormulario.querySelector("#cantidad");
            codigo.addEventListener("change", (e) => {
                const valor = e.target.value;
                cantidad.setAttribute("max", codigoCantidad[valor]);
            });
        
            // Elimina el modal si se hace click fuera del contendor de mensaje
            innerDiv.addEventListener('click', function(event) {
                if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
                    innerDiv.remove();
                }
            });
        }
        modalDarDeBaja();
        vistaPrincipal.appendChild(innerDiv)
    }
}

const AccionPrevia = (vistaPrincipal) =>  (enviarFormulario, form) => {
    const checkCont = form.querySelector("#af_enviar-contabilidad");

    const innerDiv = crearElemento("div", {class: "inner-div"});
    const modalDarDeBaja = () => {
        const floatingDiv = crearElemento("div", {class: "floating-message text-center p-md-4 border border-2 border-success"});
        
        const formulario = `<div >
            <h2 class="" >Enviar a contabilidad</h2>
            <form class="row g-3 mx-3 mb-2 mt-0">
                <input type="date" class="form-control" id="cont-fecha" required>
                <input type="number" id="cont-monto" class="form-control" placeholder="monto" required>
                <textarea rows="1" class="form-control" placeholder="glosa" id="cont-detalle" required></textarea>
                <select class="form-select text-start" id="cont-tipo" required> </select>
                <div class="col">
                    <button class="btn btn-success" id="btn-enviar-formulario">Aceptar</button>
                    <a class="btn btn-danger">Cancelar</a>
                </div>
            </form>
        </div>`;
        floatingDiv.innerHTML = formulario;
        innerDiv.appendChild(floatingDiv);

        const precio = form.querySelector("#b_costo");
        const fechaIngreso = form.querySelector("#b_fecha");

        const fecha = floatingDiv.querySelector("#cont-fecha");
        const monto = floatingDiv.querySelector("#cont-monto");
        const detalle = floatingDiv.querySelector("#cont-detalle");
        const tipo = floatingDiv.querySelector("#cont-tipo");
        
        fecha.value = fechaIngreso.value?.split("T")[0];
        monto.value = precio.value;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        rellenarSelect(tipo, {origen: `${AF_ENV.apiUrl}/app/ct/api/listaasientos/${empresa_id}`, llaves: { id: "id", detalle: "nombre" }, extraApi: true, text: "Asiento modelo"});

        const cancelar = floatingDiv.querySelector(".btn-danger");
        const elementoFormulario = floatingDiv.querySelector("form");
        
        elementoFormulario.addEventListener("submit", async (e) => {
            e.preventDefault();
            const c_fecha = crearElemento("input", {type: "hidden", name: "c_fecha", value: fecha.value});
            const c_monto = crearElemento("input", {type: "hidden", name: "c_monto", value: monto.value});
            const c_detalle = crearElemento("input", {type: "hidden", name: "c_detalle", value: detalle.value});
            const c_tipo = crearElemento("input", {type: "hidden", name: "c_tipo", value: tipo.value});

            form.append(c_fecha, c_monto, c_detalle, c_tipo);
            await enviarFormulario();
            innerDiv.remove();
        });

        // Elimina el modal si se hace click fuera del contendor de mensaje
        innerDiv.addEventListener('click', function(event) {
            if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
                innerDiv.remove();
            }
        });
    }
    if (checkCont.checked) {
        modalDarDeBaja();
        vistaPrincipal.appendChild(innerDiv)
    } else {
        enviarFormulario();
    }
};