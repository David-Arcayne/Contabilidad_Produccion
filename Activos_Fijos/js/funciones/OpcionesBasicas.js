import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "./Alertas.js";
import { crearFormulario } from "./CrearFormulario.js";
import { contenidoTBody } from "./CrearTabla.js";
import { cambiarVista, crearElemento } from "./Funciones.js";
import { modalDeConfirmacion } from "./Modals.js";
import { eliminarDato, eliminarDatoAPI, obtenerDatos } from "./Solicitudes.js";

/**
 * Crea el contenido y la funcionalidad de la vista registro.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.vistaRegistrar - Elemento de la vista registrar.
 * @param {HTMLElement} datosVista.tBody - Elemento "tbody" que contendrá los registros.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {(string|Object)[]} datosVista.contenidoTabla - Array de claves para obtener datos del registro.
 * @param {string} datosVista.URL - URL principal.
 * @param {string} [datosVista.URL2] - URL solo para obtener registros.
 * @param {Object[]} datosVista.camposDeFormulario - Array con datos necesarios para el formulario.
 * @param {Object.<string, {clave:string, valor:string}[]>} [datosVista.registrosPropios] - Opcines de "select" propios (no API).
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @param {HTMLElement} [extra] - Un elemento adicional para la vista.
 * @param {Object} [extraApi] - Datos para las API de otros módulos.
 * @param {Function} [accion] - Funcion a ejecutar despues del registro.
 * @returns
 */
export const nuevoRegistro = (datosVista, extra, extraApi = false, accion = false) => {
    const {
        vistaPrincipal,
        vistaRegistrar,
        contenidoTabla,
        contenedorDeAlertas,
        tBody,
        URL,
        URL2,
        camposDeFormulario,
        registrosPropios,
        estiloTd,
        accionPrevia,
    } = datosVista;

    const cancelarRegistro = (e) => {
        e.preventDefault();
        cambiarVista(vistaRegistrar, vistaPrincipal);
    }
    const realizarRegistro = async () => {
        const urlTabla = URL2 ? (typeof(URL2) === "function" ? URL2() : URL2) : URL;
        let listaDeRegistros = await obtenerDatos(urlTabla);
        if (extraApi) {
            listaDeRegistros = {data: listaDeRegistros}
        }
        await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody, registrosPropios)
        cambiarVista(vistaRegistrar, vistaPrincipal);
        alertaDeExito(contenedorDeAlertas, "Registro exitoso");
        if (accion) accion();
    }
    const errorRegistro = () => {
        cambiarVista(vistaRegistrar, vistaPrincipal);
        alertaDeError(contenedorDeAlertas, "No se pudo realizar el registro");
    }
    let datosFormulario = {
        myurl: URL,
        accionEnviar: realizarRegistro,
        error: errorRegistro,
        datosBtn: {
            btnClass: "btn btn-primary px-1 px-sm-4",
            nombre: "Guardar",
            accionCancelar: cancelarRegistro,
        },
    }

    if (accionPrevia) {
        datosFormulario["accionPrevia"] = accionPrevia;
    }

    if (extraApi) {
        const extraForm = {};
        for (const dato of extraApi.datosExtra) {
            if (dato.value_r){
                extraForm[dato.key] = registro[dato.value_r];
            } else {
                extraForm[dato.key] = dato.value;
            }
        }
        datosFormulario  = {
            myurl: `${URL}/`,
            datosExtra: extraForm,
            accionEnviar: realizarRegistro,
            error: errorRegistro,
            solicitudAPI: true,
            datosBtn: {
                btnClass: "btn btn-primary px-1 px-sm-4",
                nombre: "Guardar",
                accionCancelar: cancelarRegistro,
            }
        }
    }

    const nuevoformulario = crearFormulario(camposDeFormulario, datosFormulario);
    vistaRegistrar.appendChild(nuevoformulario);
    if (extra) {
        vistaRegistrar.append(extra);
    }
}

/**
 * Crea el contenido y la funcionalidad de la vista editar.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.vistaEditar - Elemento de la vista editar.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {Object[]} datosVista.camposDeFormulario - Array con datos necesarios para el formulario.
 * @param {Object.<string, {clave:string, valor:string}[]>} [datosVista.registrosPropios] - Opcines de "select" propios (no API).
 * @param {string} datosVista.URL - URL principal.
 * @param {string} [datosVista.URL2] - URL solo para obtener registros.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @param {Object} [extraApi] - Datos para las API de otros módulos.
 * @param {Object} [elementoExtra] - Un elemento adicional para la vista.
 * @returns
 */
export const editarRegistro = (datosVista, extraApi = false, elementoExtra = undefined, accion = undefined) => {
    const {
        vistaPrincipal,
        vistaEditar,
        contenedorDeAlertas,
        camposDeFormulario,
        registrosPropios,
        URL,
        URL2,
        estiloTd,
    } = datosVista;
    return ({contenidoTabla, tbody, registro}) => {

        const realizarEdicion = async () => {
            const urlTabla = URL2 ? (typeof(URL2) === "function" ? URL2() : URL2) : URL;
            let listaDeRegistros = await obtenerDatos(urlTabla);
            if (extraApi) {
                listaDeRegistros = {data: listaDeRegistros}
            }
            await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody, registrosPropios)

            cambiarVista(vistaEditar, vistaPrincipal);
            alertaDeExito(contenedorDeAlertas, "Registro actualizado con exito");
            if (accion) accion();
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
            myurl: `${URL}/${registro.id}`,
            datosExtra: { _method: "put" },
            accionEnviar: realizarEdicion,
            error: controlarError,
            datosBtn: {
                btnClass: "btn btn-warning px-1 px-sm-4",
                nombre: "Guardar",
                accionCancelar: cancelarEditar,
            }
        }

        if (extraApi) {
            const extraForm = {};
            for (const dato of extraApi.datosExtra) {
                if (dato.value_r){
                    extraForm[dato.key] = registro[dato.value_r];
                } else {
                    extraForm[dato.key] = dato.value;
                }
            }
            datosFormulario  = {
                myurl: `${URL}/`,
                datosExtra: extraForm,
                accionEnviar: realizarEdicion,
                error: controlarError,
                solicitudAPI: true,
                datosBtn: {
                    btnClass: "btn btn-warning px-1 px-sm-4",
                    nombre: "Guardar",
                    accionCancelar: cancelarEditar,
                }
            }
        }

        const formularioEditar = crearFormulario(camposDeFormulario, datosFormulario, registro);
        vistaEditar.replaceChildren(formularioEditar);
        if (elementoExtra && elementoExtra.first) {
            vistaEditar.insertBefore(elementoExtra.first, formularioEditar);
        } else if (elementoExtra || (elementoExtra?.last)) {
            vistaEditar.appendChild(elementoExtra.last);
        }

        cambiarVista(vistaPrincipal, vistaEditar)
    };
}

/**
 * Crea la funcionalidad para eliminar un registro.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @param {Boolean | Object} [extraApi] - Hacer uso de una api externa.
 * @param {Function} [accion] - Funcion a ejecutar despues eliminar el registro.
 * @returns
 */
export const eliminarRegistro = (datosVista, extraApi=false, accion = false) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL
    } = datosVista;

    return async ({elemento, registro}) => {
        const eliminar = async () => {
            const eliminado = () => {
                const fila = elemento.closest("tr");
                const cuerpoTabla = fila.closest("tbody");
                fila.remove();
                if (!cuerpoTabla.hasChildNodes()) {
                    const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
                    const tr = crearElemento("tr", undefined, [td]);
                    cuerpoTabla.replaceChildren(tr);
                }
                alertaDeExito(contenedorDeAlertas, "Registro eliminado con exito");
                if (accion) accion(registro);
            }
            const alerta = () => {
                alertaDeAdvertencia(contenedorDeAlertas, "No se puede eliminar el registro")
            }
            if (extraApi) {
                let parametro = "";
                if (extraApi.empresaId) {
                    parametro = `/${extraApi.empresaId}`
                }
                await eliminarDatoAPI(`${URL}/${registro.id}${parametro}`, eliminado, alerta)
            } else {
                await eliminarDato(`${URL}/${registro.id}`, eliminado, alerta)
            }
        }
    
        const modal = vistaPrincipal;
        modal.appendChild(modalDeConfirmacion(eliminar))
    };
} 