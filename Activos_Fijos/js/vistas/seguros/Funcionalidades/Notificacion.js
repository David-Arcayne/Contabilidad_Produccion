import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { enviarDatos, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Imagen del componente, y modal de la imagen.
 * @param {HTMLElement} vistaComponentes - Elemento que contiene la vista Componentes.
 * @returns 
 */
export const Notificacion = (vistaPrincipal, vistaEditar, {contenedorDeAlertas, formularioSeguros, estiloTd}) => ({elemento, registro, contenidoTabla, tbody}) => {
    const i = crearElemento("i", {class: "bi bi-bell-fill"});
    elemento.setAttribute("class", "btn btn-sm btn-primary rounded-circle");
    elemento.setAttribute("title", "Ver notificaciones");
    elemento.append(i);

    elemento.addEventListener("click", async () => {

        const modalDarDeBaja = () => {
            const innerDiv = crearElemento("div", {class: "inner-div"});
            const floatingDiv = crearElemento("div", {class: "floating-message px-md-4"});

            const btnNuevo = crearElemento("button", {class: "btn btn-success rounded-1 mb-2", style:"width: 100px"}, ["Nuevo"]);
            const btnRenovar = crearElemento("button", {class: "btn btn-success rounded-1 mb-2", style:"width: 100px"}, ["Renovar"]);
            const div = crearElemento("div", {class: "mt-3"}, [btnRenovar, " ", btnNuevo]);

            const btnCancelar = crearElemento("button", {class: "btn btn-secondary btn-sm"}, ["Cancelar"]);
            
            const titulo = crearElemento("h5", undefined, ["¿Qué desea hacer?"]);
            const divContenedor = crearElemento("div", {class: "text-center"}, [btnCancelar, titulo, div , btnCancelar]);

            floatingDiv.appendChild(divContenedor);
            innerDiv.appendChild(floatingDiv);

            const URL = "./api/seguros";
            btnRenovar.addEventListener("click", async () => {
                innerDiv.remove();
                
                const realizarEdicion = async () => {
                    let listaDeRegistros = await obtenerDatos(URL);
                    await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
        
                    cambiarVista(vistaEditar, vistaPrincipal);
                    alertaDeExito(contenedorDeAlertas, "Registro actualizado con exito");
                }
                const cancelarEditar = (e) => {
                    e.preventDefault();
                    cambiarVista(vistaEditar, vistaPrincipal);
                }
                const controlarError = (e) => {
                    cambiarVista(vistaEditar, vistaPrincipal);
                    alertaDeError(contenedorDeAlertas, "Error al actualizar registro")
                }
                let datosFormulario = {
                    myurl: `${URL}`,
                    datosExtra: { segurocaducado_id: registro.id },
                    accionEnviar: realizarEdicion,
                    error: controlarError,
                    datosBtn: {
                        btnClass: "btn btn-success px-1 px-sm-4",
                        nombre: "Guardar",
                        accionCancelar: cancelarEditar,
                    }
                }
                const formularioEditar = crearFormulario(formularioSeguros, datosFormulario, registro);
                vistaEditar.replaceChildren(formularioEditar);

                cambiarVista(vistaPrincipal, vistaEditar);
            });
            
            btnNuevo.addEventListener("click", async () => {
                innerDiv.remove();
                
                const realizarEdicion = async () => {
                    let listaDeRegistros = await obtenerDatos(URL);
                    await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
        
                    cambiarVista(vistaEditar, vistaPrincipal);
                    alertaDeExito(contenedorDeAlertas, "Registro actualizado con exito");
                }
                const cancelarEditar = (e) => {
                    e.preventDefault();
                    cambiarVista(vistaEditar, vistaPrincipal);
                }
                const controlarError = (e) => {
                    cambiarVista(vistaEditar, vistaPrincipal);
                    alertaDeError(contenedorDeAlertas, "Error al actualizar registro")
                }
                let datosFormulario = {
                    myurl: `${URL}`,
                    datosExtra: { segurocaducado_id: registro.id },
                    accionEnviar: realizarEdicion,
                    error: controlarError,
                    datosBtn: {
                        btnClass: "btn btn-success px-1 px-sm-4",
                        nombre: "Guardar",
                        accionCancelar: cancelarEditar,
                    }
                }
                const formularioEditar = crearFormulario(formularioSeguros, datosFormulario);
                vistaEditar.replaceChildren(formularioEditar);

                cambiarVista(vistaPrincipal, vistaEditar);
            });
        
            // Elimina el modal si se hace click fuera del contendor de mensaje
            innerDiv.addEventListener('click', function(event) {
                if ((floatingDiv && !floatingDiv.contains(event.target)) || (btnCancelar && btnCancelar.contains(event.target))) {
                    innerDiv.remove();
                }
            });
            
            return innerDiv;
        }
        
        vistaPrincipal.appendChild(modalDarDeBaja())
    })

}