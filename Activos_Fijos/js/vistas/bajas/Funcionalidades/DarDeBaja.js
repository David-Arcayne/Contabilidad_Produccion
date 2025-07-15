import { AF_ENV } from "../../../../db/environment.js";
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
                const innerDiv = crearElemento("div", {class: "inner-div"});
                const modalDarDeBaja = async() => {
                    const floatingDiv = crearElemento("div", {class: "floating-message text-center p-md-4"});

                    const listaDeRegistros = await obtenerDatos(`./api/inventarios-activofijo/lista-asignados/${registro.id}`);
                    let opcionesCodigo = "";
                    const codigoCantidad = {};
                    let cantidadMaxima = "";
                    if (listaDeRegistros && listaDeRegistros.rows) {
                        cantidadMaxima = `max=${listaDeRegistros.data[0].cantidad}`;
                        listaDeRegistros.data.forEach((elemento) => {
                            opcionesCodigo += `<option value="${elemento.codigo}">${elemento.codigo}</option>`;
                            codigoCantidad[elemento.codigo] = elemento.cantidad;
                        });
                    }
                    
                    const formulario = `<div >
                        <h2 class="" >Razon de la baja del activo</h2>
                        <form class="row g-3 mx-3 mb-2 mt-0">
                            <select class="form-select" id="codigo" name="codigo" required>
                                ${opcionesCodigo}
                            </select>
                            <input type="number" id="cantidad" class="form-control" placeholder="Cantidad" name="cantidad" ${cantidadMaxima} required>
                            <select class="form-select text-start" id="tipo-baja" name="tipobaja_id" required></select>
                            <textarea rows="1" class="form-control" placeholder="Detalle" name="detallebaja"></textarea>
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
                        const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
                        const listaDeRegistros = obtenerDatos(`${URL}/${objAFTI.tipo_inventario}`);
                        await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                        alertaDeExito(contenedorDeAlertas, "Registro activado")
                    } else {
                        alertaDeError(contenedorDeAlertas, "No se pudo activar el registro")
                    }
                }
                const confirmar = modalDeConfirmacion(activar, "Esta seguro de activar todas las bajas del activo");
                vistaPrincipal.appendChild(confirmar);
            });        
        }
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