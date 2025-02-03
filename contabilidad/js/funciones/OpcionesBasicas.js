import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "./Alertas.js";
import { crearFormulario } from "./CrearFormulario.js";
import { contenidoTBody } from "./CrearTabla.js";
import { cambiarVista, crearElemento } from "./Funciones.js";
import { modalDeConfirmacion, modalFormulario } from "./Modals.js";
import { eliminarDato, eliminarDatoAPI, obtenerDatos } from "./Solicitudes.js";

/**
 * Crea el contenido y la funcionalidad de la vista registro.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.vistaRegistrar - Elemento de la vista registrar.
 * @param {HTMLElement} [datosVista.vistaRForm] - Elemento que contendra al formulario.
 * @param {HTMLElement} datosVista.tBody - Elemento "tbody" que contendrá los registros.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {(string|Object)[]} datosVista.contenidoTabla - Array de claves para obtener datos del registro.
 * @param {string} datosVista.URL_FORM - URL principal.
 * @param {string} [datosVista.URL_LISTAR] - URL solo para obtener registros.
 * @param {Object[]} datosVista.camposDeFormulario - Array con datos necesarios para el formulario.
 * @param {Object.<string, {clave:string, valor:string}[]>} [datosVista.registrosPropios] - Opcines de "select" propios (no API).
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @param {function} [datosVista.accionPrevia] - Función a ejecutar antes de enviar el formulario.
 * @param {(HTMLElement|Object)} [extra] - Un elemento adicional para la vista.
 * @param {Object} [extraApi] - Datos para las API de otros módulos.
 * @param {Object[]} [extraApi.datosExtra] - Datos extra para la API.
 * @param {Function} [accion] - Funcion a ejecutar despues del registro.
 * @returns
 */
export const nuevoRegistro = (datosVista, extra, extraApi = false, accion = false) => {
    const {
        vistaPrincipal,
        vistaRegistrar,
        vistaRForm,
        contenidoTabla,
        contenedorDeAlertas,
        tBody,
        URL_FORM,
        URL_LISTAR,
        camposDeFormulario,
        registrosPropios,
        estiloTd,
        accionPrevia,
        mantenerFormulario,
    } = datosVista;

    // Funcion que se ejecuta al cancelar el registro.
    const cancelarRegistro = (e) => {
        e.preventDefault();
        if (vistaPrincipal && vistaRegistrar && !mantenerFormulario) {
            cambiarVista(vistaRegistrar, vistaPrincipal);
        } else if (mantenerFormulario) {
            mantenerFormulario();
        }
    }
    // Funcion que se ejecuta al realizar el registro.
    const realizarRegistro = async () => {
        const urlTabla = URL_LISTAR ? (typeof(URL_LISTAR) === "function" ? URL_LISTAR() : URL_LISTAR) : URL_FORM;
        let listaDeRegistros = await obtenerDatos(urlTabla);
        contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody, registrosPropios)
        if (vistaPrincipal && vistaRegistrar && !mantenerFormulario) {
            cambiarVista(vistaRegistrar, vistaPrincipal);
        }
        alertaDeExito(contenedorDeAlertas, "Registro exitoso");
        if (accion) accion();
    }
    // Funcion que se ejecuta al no poder realizar el registro.
    const errorRegistro = () => {
        if (vistaPrincipal && vistaRegistrar) {
            cambiarVista(vistaRegistrar, vistaPrincipal);
        }
        alertaDeError(contenedorDeAlertas, "No se pudo realizar el registro");
    }

    // Preparar los datos para generar el formulario.
    const datosFormulario = {
        myurl: URL_FORM,
        accionEnviar: realizarRegistro,
        error: errorRegistro,
        datosBtn: {
            btnClass: "btn btn-primary px-1 px-sm-4",
            nombre: "Guardar",
            accionCancelar: vistaPrincipal || mantenerFormulario ? cancelarRegistro : null,
        },
    }
    if (accionPrevia) {
        datosFormulario["accionPrevia"] = accionPrevia;
    }
    if (extraApi && extraApi.datosExtra) {
        const extraForm = {};
        for (const dato of extraApi.datosExtra) {
            extraForm[dato.key] = dato.value;
        }
        datosFormulario["datosExtra"] = extraForm;
    }

    // Agregar el formulario y el elemnto extra a la vista.
    const vistaR = vistaRForm ?? vistaRegistrar;
    const nuevoformulario = crearFormulario(camposDeFormulario, datosFormulario);
    vistaR.appendChild(nuevoformulario);
    if (extra && extra.first) {
        vistaR.insertBefore(extra.first, nuevoformulario);
    } else if (extra || (extra?.last)) {
        vistaR.appendChild(extra.last);
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
 * @param {string} datosVista.URL_FORM - URL principal.
 * @param {string} [datosVista.URL_LISTAR] - URL solo para obtener registros.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @param {function} [datosVista.accionPrevia] - Función a ejecutar antes de enviar el formulario.
 * @param {Object} [extraApi] - Datos para las API de otros módulos.
 * @param {Object[]} [extraApi.datosExtra] - Datos extra para la API.
 * @param {string} [extraApi.datosExtra.key] - Clave de dato extra.
 * @param {string} [extraApi.datosExtra.value] - Valor del dato extra.
 * @param {string} [extraApi.datosExtra.value_r] - Clave para obtener el valor del registro para el dato extra.
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
        URL_FORM,
        URL_LISTAR,
        estiloTd,
        accionPrevia,
    } = datosVista;
    return ({contenidoTabla, tbody, registro}) => {

        // Funcion que se ejecuta al realizar la edicion.
        const realizarEdicion = async () => {
            const urlTabla = URL_LISTAR ? (typeof(URL_LISTAR) === "function" ? URL_LISTAR() : URL_LISTAR) : URL_FORM;
            let listaDeRegistros = await obtenerDatos(urlTabla);
            contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody, registrosPropios)
            cambiarVista(vistaEditar, vistaPrincipal);
            alertaDeExito(contenedorDeAlertas, "Registro actualizado con exito");
            if (accion) accion();
        }
        // Funcion que se ejecuta al cancelar la edicion.
        const cancelarEditar = (e) => {
            e.preventDefault();
            cambiarVista(vistaEditar, vistaPrincipal);
        }
        // Funcion que se ejecuta al no poder realizar la edicion.
        const controlarError = (e) => {
            cambiarVista(vistaEditar, vistaPrincipal);
            alertaDeError(contenedorDeAlertas, "Error al actualizar registro")
        }
        // Preparar los datos para generar el formulario.
        const datosFormulario = {
            myurl: `${URL_FORM}/${registro.id}`,
            accionEnviar: realizarEdicion,
            error: controlarError,
            datosBtn: {
                btnClass: "btn btn-warning px-1 px-sm-4",
                nombre: "Guardar",
                accionCancelar: cancelarEditar,
            }
        }
        if (extraApi && extraApi.datosExtra) {
            const extraForm = {};
            for (const dato of extraApi.datosExtra) {
                // Si el valor de la clave es un registro, se obtiene el valor de la clave del registro.
                if (dato.value_r){
                    extraForm[dato.key] = registro[dato.value_r];
                } else {
                    extraForm[dato.key] = dato.value;
                }
            }
            datosFormulario["datosExtra"] = extraForm;
        }
        if (accionPrevia) {
            datosFormulario["accionPrevia"] = accionPrevia;
        }    

        // Agregar el formulario y el elemnto extra a la vista.
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
 * @param {Boolean|Object} [extraApi] - Hacer uso de una api externa.
 * @param {Function} [accion] - Funcion a ejecutar despues eliminar el registro.
 * @returns
 */
export const eliminarRegistro = (datosVista, extraApi = false, accion = false) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL
    } = datosVista;

    return async ({elemento, registro}) => {
        const eliminar = async () => {
            // Funcion que se ejecuta al eliminar el registro.
            const eliminado = () => {
                // Eliminar el registro (elemento "tr") de la tabla.
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
            // Funcion que se ejecuta al no poder eliminar el registro.
            const alerta = () => {
                alertaDeAdvertencia(contenedorDeAlertas, "No se puede eliminar el registro")
            }
            if (extraApi) {
                const urlEliminar = URL();
            } else {
                if(typeof(URL) === "object") {
                    const urlEliminar = URL.direccion(registro[URL.llave]);
                    await eliminarDato(urlEliminar, eliminado, alerta)
                }else {
                    const urlEliminar = URL(registro.id);
                    await eliminarDato(urlEliminar, eliminado, alerta)
                }
            }
        }
    
        const modal = vistaPrincipal;
        modal.appendChild(modalDeConfirmacion(eliminar))
    };
}

/**
 * Crea el contenido y la funcionalidad del modal registro.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.vistaRegistrar - Elemento de la vista registrar.
 * @param {HTMLElement} [datosVista.vistaRForm] - Elemento que contendra al formulario.
 * @param {HTMLElement} datosVista.tBody - Elemento "tbody" que contendrá los registros.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {(string|Object)[]} datosVista.contenidoTabla - Array de claves para obtener datos del registro.
 * @param {string} datosVista.URL_FORM - URL principal.
 * @param {string} [datosVista.URL_LISTAR] - URL solo para obtener registros.
 * @param {Object[]} datosVista.camposDeFormulario - Array con datos necesarios para el formulario.
 * @param {Object.<string, {clave:string, valor:string}[]>} [datosVista.registrosPropios] - Opcines de "select" propios (no API).
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @param {function} [datosVista.accionPrevia] - Función a ejecutar antes de enviar el formulario.
 * @param {HtmlElement[]} datosVista.elementosModal - Elementos de un modal donde se agregara el formulario.
 * @param {(HTMLElement|Object)} [extra] - Un elemento adicional para la vista.
 * @param {Object} [extraApi] - Datos para las API de otros módulos.
 * @param {Object[]} [extraApi.datosExtra] - Datos extra para la API.
 * @param {Function} [accion] - Funcion a ejecutar despues del registro.
 * @returns
 */
export const nuevoRegistroModal = (datosVista, extra, extraApi = false, accion = false) => {
    const {
        vistaPrincipal,
        vistaRegistrar,
        vistaRForm,
        contenidoTabla,
        contenedorDeAlertas,
        tBody,
        URL_FORM,
        URL_LISTAR,
        camposDeFormulario,
        registrosPropios,
        estiloTd,
        accionPrevia,
        elementosModal,
    } = datosVista;

    const [modal, modalCuerpo] = elementosModal;

    // Funcion que se ejecuta al cancelar el registro.
    const cancelarRegistro = (e) => {
        e.preventDefault();
        if (vistaPrincipal && vistaRegistrar) {
            modal.classList.add("d-none");
        }
    }
    // Funcion que se ejecuta al realizar el registro.
    const realizarRegistro = async () => {
        const urlTabla = URL_LISTAR ? (typeof(URL_LISTAR) === "function" ? URL_LISTAR() : URL_LISTAR) : URL_FORM;
        let listaDeRegistros = await obtenerDatos(urlTabla);
        contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody, registrosPropios)
        if (vistaPrincipal && vistaRegistrar) {
            modal.classList.add("d-none");
        }
        alertaDeExito(contenedorDeAlertas, "Registro exitoso");
        if (accion) accion();
    }
    // Funcion que se ejecuta al no poder realizar el registro.
    const errorRegistro = () => {
        if (vistaPrincipal && vistaRegistrar) {
            modal.classList.add("d-none");
        }
        alertaDeError(contenedorDeAlertas, "No se pudo realizar el registro");
    }

    // Preparar los datos para generar el formulario.
    const datosFormulario = {
        myurl: URL_FORM,
        accionEnviar: realizarRegistro,
        error: errorRegistro,
        datosBtn: {
            btnClass: "btn btn-primary px-1 px-sm-4",
            nombre: "Guardar",
            accionCancelar: vistaPrincipal ? cancelarRegistro : null,
        },
    }
    if (accionPrevia) {
        datosFormulario["accionPrevia"] = accionPrevia;
    }
    if (extraApi && extraApi.datosExtra) {
        const extraForm = {};
        for (const dato of extraApi.datosExtra) {
            extraForm[dato.key] = dato.value;
        }
        datosFormulario["datosExtra"] = extraForm;
    }

    // Agregar el formulario y el elemnto extra al modal.
    const vistaR = vistaRForm ?? modalCuerpo;
    const nuevoformulario = crearFormulario(camposDeFormulario, datosFormulario);
    vistaR.appendChild(nuevoformulario);
    if (extra && extra.first) {
        vistaR.insertBefore(extra.first, nuevoformulario);
    } else if (extra || (extra?.last)) {
        vistaR.appendChild(extra.last);
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
 * @param {string} datosVista.URL_FORM - URL principal.
 * @param {string} [datosVista.URL_LISTAR] - URL solo para obtener registros.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @param {function} [datosVista.accionPrevia] - Función a ejecutar antes de enviar el formulario.
 * @param {Object} [extraApi] - Datos para las API de otros módulos.
 * @param {Object[]} [extraApi.datosExtra] - Datos extra para la API.
 * @param {string} [extraApi.datosExtra.key] - Clave de dato extra.
 * @param {string} [extraApi.datosExtra.value] - Valor del dato extra.
 * @param {string} [extraApi.datosExtra.value_r] - Clave para obtener el valor del registro para el dato extra.
 * @param {Object} [elementoExtra] - Un elemento adicional para la vista.
 * @returns
 */
export const editarRegistroModal = (datosVista, extraApi = false, elementoExtra = undefined, accion = undefined) => {
    const {
        vistaPrincipal,
        vistaEditar,
        contenedorDeAlertas,
        camposDeFormulario,
        registrosPropios,
        URL_FORM,
        URL_LISTAR,
        estiloTd,
        accionPrevia,
    } = datosVista;
    return ({contenidoTabla, tbody, registro}) => {

        const [modal, modalCuerpo] = modalFormulario();

        // Funcion que se ejecuta al realizar la edicion.
        const realizarEdicion = async () => {
            const urlTabla = URL_LISTAR ? (typeof(URL_LISTAR) === "function" ? URL_LISTAR() : URL_LISTAR) : URL_FORM;
            let listaDeRegistros = await obtenerDatos(urlTabla);
            // console.log(tbody);
            
            contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody, registrosPropios)
            modal.remove();
            alertaDeExito(contenedorDeAlertas, "Registro actualizado con exito");
            if (accion) accion();
        }
        // Funcion que se ejecuta al cancelar la edicion.
        const cancelarEditar = (e) => {
            e.preventDefault();
            modal.remove();
        }
        // Funcion que se ejecuta al no poder realizar la edicion.
        const controlarError = (e) => {
            modal.remove();
            alertaDeError(contenedorDeAlertas, "Error al actualizar registro")
        }
        // Preparar los datos para generar el formulario.
        const datosFormulario = {
            myurl: `${URL_FORM}/${registro.id}`,
            accionEnviar: realizarEdicion,
            error: controlarError,
            datosBtn: {
                btnClass: "btn btn-warning px-1 px-sm-4",
                nombre: "Guardar",
                accionCancelar: cancelarEditar,
            }
        }
        if (extraApi && extraApi.datosExtra) {
            const extraForm = {};
            for (const dato of extraApi.datosExtra) {
                // Si el valor de la clave es un registro, se obtiene el valor de la clave del registro.
                if (dato.value_r){
                    extraForm[dato.key] = registro[dato.value_r];
                } else {
                    extraForm[dato.key] = dato.value;
                }
            }
            datosFormulario["datosExtra"] = extraForm;
        }
        if (accionPrevia) {
            datosFormulario["accionPrevia"] = accionPrevia;
        }    

        // Agregar el formulario y el elemnto extra al modal.
        const formularioEditar = crearFormulario(camposDeFormulario, datosFormulario, registro, true);
        modalCuerpo.replaceChildren(formularioEditar);
        if (elementoExtra && elementoExtra.first) {
            modalCuerpo.insertBefore(elementoExtra.first, formularioEditar);
        } else if (elementoExtra || (elementoExtra?.last)) {
            modalCuerpo.appendChild(elementoExtra.last);
        }
        vistaPrincipal.appendChild(modal);

    };
}