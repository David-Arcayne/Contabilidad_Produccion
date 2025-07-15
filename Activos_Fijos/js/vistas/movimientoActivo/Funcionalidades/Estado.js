import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatos, enviarDatosObj, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Crea un boton segun el estado con la funcionalidad de un modal de confirmación.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns
 */
export const Estado = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        permisos,
        estiloTd,
    } = datosVista;

    return ({ elemento, registro, contenidoTabla, tbody}) => {

        if (registro.estado == null) {
            const i = crearElemento("i", {class: "bi bi-plus-circle"});
            elemento.setAttribute("class", "btn btn-sm btn-info");
            elemento.append(i, " Asignar");

            if (permisos.editar === "0") {
                elemento.classList.add("pe-none");
                return;
            }
    
            elemento.addEventListener("click", () => {
                const registrar = async() => {
                    const  activosFijos = await obtenerDatos(`${URL}/activo-fijo/${registro.id}`);
                    if (activosFijos.data && activosFijos.data.length > 0) {
                        const accionEnviar = async() => {
                            const listaDeRegistros = await obtenerDatos(`${URL}`);
                            await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody);
                            alertaDeExito(contenedorDeAlertas, "Activos asignados con éxito")
                        }
                        const error = () => {
                            alertaDeError(contenedorDeAlertas, "Ocurrio un error en la asignación de activos")
                        }
                
                        // let parametosUrlA = `${URL}/aceptar-todo/${datosSolicitud.id}/1`;
                        // parametosUrlA = `${URL}/aceptar-todo/${datosSolicitud.id}/6`;
                        const datos = {
                            movimientos_id: registro.id,
                            _method: "put",
                            idtrabajador: registro.idtrabajador,
                            iddepartamento: registro.iddepartamento,
                            idsucursal: registro.idsucursal,
                            // fechaentrega: registro.fechaentrega,
                        }
                        const opciones = {
                            datos: datos,
                            myUrl: `${URL}/aceptar-todo/${registro.id}/1`,
                            redireccion: accionEnviar,
                            error: error
                        }
                        enviarDatosObj(opciones);
                    } else {
                        alertaDeAdvertencia(contenedorDeAlertas, "No se tiene ningun activo seleccionado")
                    }
                }
                vistaPrincipal.appendChild(modalDeConfirmacion(registrar, "Esta seguro de asignar los activos a este trabajador"));
            });
        } else if (registro.estado == 5) {
            const i = crearElemento("i", {class: "bi bi-dash-circle"});
            elemento.setAttribute("class", "btn btn-sm btn-info")
            elemento.append(i, " Devolver")

            if (permisos.editar === "0") {
                elemento.classList.add("pe-none");
                return;
            }
    
            elemento.addEventListener("click", () => {

                const registrar = async() => {
                    const  activosFijos = await obtenerDatos(`${URL}/activo-fijo/${registro.id}`);
                    if (activosFijos.data && activosFijos.data.length > 0) {
                        const accionEnviar = async() => {
                            const listaDeRegistros = await obtenerDatos(`${URL}`);
                            await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody);
                            alertaDeExito(contenedorDeAlertas, "Activos devueltos con éxito")
                        }
                        const error = () => {
                            alertaDeError(contenedorDeAlertas, "Ocurrio un error al devolver los activos")
                        }
                        const datos = {
                            movimientos_id: registro.id,
                            _method: "put",
                            idtrabajador: registro.idtrabajador,
                            iddepartamento: registro.iddepartamento,
                            idsucursal: registro.idsucursal,
                            // fechaentrega: registro.fechaentrega,
                        }
                        const opciones = {
                            datos: datos,
                            myUrl: `${URL}/aceptar-todo/${registro.id}/6`,
                            redireccion: accionEnviar,
                            error: error
                        }
                        enviarDatosObj(opciones);
                    } else {
                        alertaDeAdvertencia(contenedorDeAlertas, "No se tiene ningun activo seleccionado")
                    }
                }
                vistaPrincipal.appendChild(modalDeConfirmacion(registrar, "Esta seguro de devolver los activos de este trabajador"));
            });
        } else if (registro.estado == 1 ) {
            const i = crearElemento("i", {class: "bi bi-hand-thumbs-up-fill"});
            elemento.setAttribute("class", "btn btn-sm btn-success pe-none");
            elemento.append(i, " Asignado");
        } else if (registro.estado == 6 ) {
            const i = crearElemento("i", {class: "bi bi-check-lg"});
            elemento.setAttribute("class", "btn btn-sm btn-success pe-none");
            elemento.append(i, " Devuelto");
        } 
    }
}
