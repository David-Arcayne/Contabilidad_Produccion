import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { formularioAF, formularioAFDev } from "../Formularios.js";

/**
 * Funcionalidad de los botones del formulario.
 * @param {HTMLElement} formularioConfirmar - Elemento que contendra el formulario.
 * @param {HTMLElement} vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} vistaActivosFijos - Elemento de la vista activos fijos.
 * @param {string} URL - URL principal
 * @param {number} datosSolicitud - Datos de la solicitud pendiente.
 * @param {(string|Object)[]} contenidoTabla - Array con las llaves de llaves de los registros.
 * @param {HTMLSelectElement} tBody - Cuerpo de la tabla de solicitudes pendientes.
 * @param {HTMLElement} contenedorDeAlertas - Elemento de la vista principal que contendra las alertas
 * @param {HTMLElement} contenedorDeAlertasAF - Elemento que contendra las alertas.
 * @param {number[]} contador - Array que contiene la cantidad de registros procesados y exitentes.
 * @param {string[]} estiloTd - Estilos para las columnas de la tabla.
 */
export const confirmacion = (
    formularioConfirmar,
    vistaPrincipal,
    vistaActivosFijos,
    URL,
    datosSolicitud,
    contenidoTabla,
    tBody,
    contenedorDeAlertas,
    contenedorDeAlertasAF,
    contador,
    estiloTd,
) => {
    const realizarRegistro = async () => {
        let listaDeRegistros = obtenerDatos(`${URL}`);
        await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody);
        cambiarVista(vistaActivosFijos, vistaPrincipal);
        alertaDeExito(contenedorDeAlertas, "Solicitud procesada con exito");
    };
    const errorRegistro = () => {
        cambiarVista(vistaActivosFijos, vistaPrincipal);
        alertaDeError(contenedorDeAlertas, "Ocurrio un erro ...");
    };

    let informacionBtns = [];
    const contenedorBtns = crearElemento("div", { class: "" });

    // Verifica que ningun activo este procesado para poder aceptar o denegar todos los registros a la vez.
    if (contador[0] === 0) {
        const iconoA = crearElemento("i", { class: "bi bi-hand-thumbs-up-fill" });
        const aceptarTodo = crearElemento("button", { class: "btn btn-sm btn-success mt-2" }, [iconoA, " aceptar todo"]);
        const iconoD = crearElemento("i", { class: "bi bi-hand-thumbs-down-fill" });
        const denegarTodo = crearElemento("button", { class: "btn btn-sm btn-danger mt-2" }, [iconoD, " denegar todo"]);
        contenedorBtns.append(aceptarTodo, " ", denegarTodo);

        const accionAceptar = (enviarFormuario) => {
            vistaActivosFijos.appendChild(modalDeConfirmacion(enviarFormuario, "Se aceptara la solicitud con todo el listado"));
        };
        const accionRechazar = (enviarFormuario) => {
            vistaActivosFijos.appendChild(modalDeConfirmacion(enviarFormuario, "Se denegara la solicitud"));
        };
        let parametosUrlA = `${URL}/aceptar-todo/${datosSolicitud.id}/1`;
        let parametosUrlR = `${URL}/denegar-todo/${datosSolicitud.id}/3`;
        if (datosSolicitud.estado == 8) {
            parametosUrlA = `${URL}/aceptar-todo/${datosSolicitud.id}/6`;
            parametosUrlR = `${URL}/denegar-todo/${datosSolicitud.id}/7`;
        }
        informacionBtns = {
            contenido: contenedorBtns,
            informacion: [
                {
                    url: parametosUrlA,
                    boton: aceptarTodo,
                    accionPrevia: accionAceptar,
                },
                {
                    url: parametosUrlR,
                    boton: denegarTodo,
                    accionPrevia: accionRechazar,
                },
            ],
        };
    } else {
        const confirmar = crearElemento("button", { class: "btn btn-success px-2 px-sm-5", id: "btn-enviar-formulario" }, ["Responder solicitud"]);
        contenedorBtns.append(confirmar);

        const accionConfirmar = (enviarFormuario) => {
            if (contador[0] === contador[1]) {
                enviarFormuario();
            } else {

                alertaDeAdvertencia(contenedorDeAlertasAF, "Es necesario porcesar todos los activos.");
            }
        };
        let parametosUrlC = `${URL}/confirmar/${datosSolicitud.id}/1`;
        if (datosSolicitud.estado == 8) {
            parametosUrlC = `${URL}/confirmar/${datosSolicitud.id}/6`;
        }
        informacionBtns = {
            contenido: contenedorBtns,
            informacion: [
                {
                    url: parametosUrlC,
                    boton: confirmar,
                    accionPrevia: accionConfirmar,
                },
            ],
        };
    }

    const datosFormulario = {
        datosExtra: { 
            movimientos_id: datosSolicitud.id,
            _method: "put",
            idtrabajador: datosSolicitud.idtrabajador,
            iddepartamento: datosSolicitud.iddepartamento,
            idsucursal: datosSolicitud.idsucursal,
        },
        accionEnviar: realizarRegistro,
        error: errorRegistro,
        botones: informacionBtns,
    };

    const formularioEnUso = (datosSolicitud.estado == 8) ? formularioAFDev : formularioAF;
    const nuevoformulario = crearFormulario(formularioEnUso, datosFormulario);
    formularioConfirmar.replaceChildren(nuevoformulario);
};
