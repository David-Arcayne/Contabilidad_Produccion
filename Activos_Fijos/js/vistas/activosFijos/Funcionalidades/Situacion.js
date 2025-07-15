import { formularioAFSituacion } from "../Formularios.js";
import { alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { modalMensaje } from "../../../funciones/Modals.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Crea el contenido de la vista situación, y modal de información.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.vistaSituacion - Elemento de la vista situacion.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns
 */
export const Situacion = (datosVista) => {
    const {
        vistaPrincipal,
        vistaSituacion,
        contenedorDeAlertas,
        URL,
        permisos,
        estiloTd,
    } = datosVista;

    return ({ elemento, registro, contenidoTabla, tbody}) => {
    
        if (registro.tiposituacion == 0) {
            // Creación de un modal con el código del Activo.
            const i = crearElemento("i", {class: "bi bi-tools"});
            elemento.setAttribute("class", "btn btn-sm btn-warning");
            elemento.append(i, " no operativo")
    
            elemento.addEventListener("click", () => {
                vistaPrincipal.appendChild(modalMensaje(registro.codigohistorial, "Codigo de activo fijo"))
            });
        } else {
            // Creación de formulario para la vista Situación.
            const i = crearElemento("i", {class: "bi bi-check-lg"});
            elemento.setAttribute("class", `btn btn-sm btn-success ${permisos.editar === "1" ? "" : "pe-none"}`)
            elemento.append(i, " operativo")
    
            if (permisos.editar === "1") {
                elemento.addEventListener("click", () => {
                    const cancelar = (e) => {
                        e.preventDefault();
                        cambiarVista(vistaSituacion, vistaPrincipal);
                    }
                    const realizarCambioSituacion = async () => {
                        let listaDeRegistros = obtenerDatos(URL);
                        await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
                        cambiarVista(vistaSituacion, vistaPrincipal);
                        alertaDeExito(contenedorDeAlertas, "Situación cambiada exitosamente");
                    }
                    let datosExtra = datosVista.activofijo_id ? {componentes_id:registro.id, activosfijos_id: datosVista.activofijo_id } : { activosfijos_id: registro.id };
                    const datosFormulario = {
                        myurl: `./api/historial`,
                        datosExtra,
                        accionEnviar: realizarCambioSituacion,
                        datosBtn: {
                            btnClass: "btn btn-info",
                            nombre: "Cambiar",
                            accionCancelar: cancelar,
                        }
                    }
        
                    const fomularioSituacion = crearFormulario(formularioAFSituacion, datosFormulario);
                    vistaSituacion.replaceChildren(fomularioSituacion);
        
                    cambiarVista(vistaPrincipal, vistaSituacion);
                });
            }
        }
    }
}
