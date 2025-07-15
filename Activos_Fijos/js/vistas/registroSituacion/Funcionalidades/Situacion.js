import { formularioAFSituacion } from "../Formularios.js";
import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
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

    return (contenidoTabla, tBody) => {
    
        const realizarCambioSituacion = async () => {
            let listaDeRegistros = obtenerDatos(URL);
            await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
            alertaDeExito(contenedorDeAlertas, "Situación registrada exitosamente");
        }
        const errorRegistro = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo realizar el registro");
        }
    
        const datosFormulario = {
            myurl: `./api/historial`,
            accionEnviar: realizarCambioSituacion,
            error: errorRegistro,
            datosBtn: {
                btnClass: "btn btn-info px-1 px-sm-5",
                nombre: "Cambiar",
            }
        }

        const fomularioSituacion = crearFormulario(formularioAFSituacion, datosFormulario);
        vistaSituacion.replaceChildren(fomularioSituacion);
    
    }
}
