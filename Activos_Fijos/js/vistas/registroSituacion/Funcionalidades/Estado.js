import { AF_ENV } from "../../../../db/environment.js";
import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { obtenerDatos, rellenarSelect } from "../../../funciones/Solicitudes.js";
import { formularioSituacion } from "../Formularios.js";
import { Notificacion } from "./Notificacion.js";

/**
 * Crea un boton segun la situación y la funcionalidad de crear un formulario.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.vistaSituacion - Elemento de la vista situación.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @param {HTMLElement} datosVista.contenedorNotificacion - Contenedor de notificaciones.
 * @returns
 */
export const Estado = (datosVista) => {
    const {
        vistaPrincipal,
        vistaSituacion,
        contenedorDeAlertas,
        URL,
        permisos,
        estiloTd,
        contenedorNotificacion,
    } = datosVista;

    return ({ elemento, registro, contenidoTabla, tbody}) => {
        elemento.setAttribute("class", "btn btn-sm btn-primary");
        elemento.append(registro.nombretiposituacion);

        if (registro.estado == 0 || registro.editado_en != null || registro.fechasalida != null) {
            elemento.setAttribute("class", "btn btn-sm btn-primary pe-none disabled");
            return;
        }

        if (permisos.editar === "1") {
            elemento.addEventListener("click", () => {
                const cancelarRegistro = (e) => {
                    e.preventDefault();
                    cambiarVista(vistaSituacion, vistaPrincipal);
                }
                const realizarRegistro = async () => {
                    let listaDeRegistros = obtenerDatos(URL);
                    await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                    const nuevaNotificacion = Notificacion(vistaPrincipal);
                    contenedorNotificacion.replaceChildren(nuevaNotificacion);
                    cambiarVista(vistaSituacion, vistaPrincipal);
                    alertaDeExito(contenedorDeAlertas, "Acción exitosa");
                }
                const errorRegistro = () => {
                    cambiarVista(vistaSituacion, vistaPrincipal);
                    alertaDeError(contenedorDeAlertas, "No se pudo realizar la acción");
                }
                const datosFormulario = {
                    myurl: `${URL}/${registro.id}`,
                    accionEnviar: realizarRegistro,
                    error: errorRegistro,
                    datosExtra: {_method: "put"},
                    datosBtn: {
                        btnClass: "btn btn-primary",
                        nombre: "Guardar",
                        accionCancelar: cancelarRegistro,
                    },
                    accionPrevia: AccionPrevia(vistaSituacion),
                }
            
                const nuevoformulario = crearFormulario(formularioSituacion, datosFormulario);
                vistaSituacion.replaceChildren(nuevoformulario);
    
                cambiarVista(vistaPrincipal, vistaSituacion);
            });
        }

        if (!registro.fechaingreso || !registro.fechasalida || !registro.costo) {
            elemento.setAttribute("class", "btn btn-sm btn-warning");
        }
        if (permisos.editar === "0") {
            elemento.classList.add("pe-none");
        }
    }
}

const AccionPrevia = (vistaPrincipal) =>  (enviarFormulario, form) => {
    const checkCont = form.querySelector("#situacion_enviar-contabilidad");

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

        const precio = form.querySelector("#situacion_costo");
        const fechaIngreso = form.querySelector("#situacion_fecha");

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
            c_fecha.remove();
            c_monto.remove();
            c_detalle.remove();
            c_tipo.remove();
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
