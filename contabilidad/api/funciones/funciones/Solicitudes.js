import { botonEnCarga } from "./Funciones.js";

/**
 * Obtiene los datos de una API (retorna false en caso de error)
 * @param {string} urlSolicitud - URL de la API que se va a consultar
 * @returns {Promise<Object[]|boolean|{}>}
 */
export const obtenerDatos = async (urlSolicitud) => {
    try {
        const respuestaFetch = await fetch(urlSolicitud);
        if (!respuestaFetch.ok) {
            return false;
        }
        const copia = respuestaFetch.clone(); // ::logShow
        console.log("ResponseText: ", await copia.text()); // ::logShow

        const datos = await respuestaFetch.json();
        console.log("listar: ", datos); // ::logShow

        return datos;
    } catch (error) {
        console.log(error); // ::logShow
        return false;
    }
}

/**
 * Realiza múltiples solicitudes fetch en paralelo y devuelve un array
 * con los resultados (o false si una solicitud falla).
 * También obtiene los mensajes personalizados del servidor para estados 400/500.
 *
 * @param {string[]} urls - Array de URLs para realizar las solicitudes fetch.
 * @param {(url: string, infoError: any) => void} callbackError - Función que se ejecuta en caso de error en una solicitud.
 * @returns {Promise<any[]>}
 */
export async function manejarMultiplesSolicitudes(urls, callbackError = () => {}) {
    const solicitudes = urls.map(async (url) => {
        try {
            const res = await fetch(url);
            let body = null;
            // Intentar leer JSON siempre, incluso si hay error
            try {
                body = await res.clone().json();
            } catch {
                body = null;
            }
            if (!res.ok) {
                // Lanza un error que incluye el cuerpo de la respuesta para manejo posterior con allSettled
                throw {
                    status: res.status,
                    statusText: res.statusText,
                    body
                };
            }
            return body; // respuesta normal
        } catch (error) {
            throw error; // deja que lo maneje allSettled
        }
    });

    const resultados = await Promise.allSettled(solicitudes);

    return resultados.map((result, i) => {
        if (result.status === "fulfilled") {
            return result.value;
        }
        // Ejecutar callback con info detallada del error
        callbackError(urls[i], result.reason);
        return false;
    });
};

/**
 * Maneja una solicitud para eliminar un registro
 * @param {OpcionesSolicitudEliminar} opciones - Opciones para la solicitud.
 */
export async function manejarSolicitudEliminacion(opciones) {
    const { urlSolicitud, metodo, esperarPromesa, callbackExito, callbackError } = opciones;

    // callbackExito();
    // return;

    try {
        const respuestaFetch = await fetch(urlSolicitud, {
            method: metodo || "GET"
        });
        if (respuestaFetch.ok) {
            const respuesta = await respuestaFetch.json();
            const esExitoso = (respuesta.length > 0 && respuesta[0] === "success") || (respuesta.ok === "success") || (respuesta === true);
            if (esExitoso) {
                esperarPromesa ? await callbackExito(respuesta) : callbackExito(respuesta);
            } else {
                esperarPromesa ? await callbackError(respuesta) : callbackError(respuesta);
            }
        } else {
            esperarPromesa ? await callbackError() : callbackError();
        }
    } catch (error) {
        esperarPromesa ? await callbackError() : callbackError();
    }
}

/**
 * Realiza a una solicitud sin cuerpo a la API
 * @param {string} apiURL - URL de la API.
 * @param {string} metodo - Metodo de la solicitud (POST, PUT).
 * @returns Una promesa con datos de la API
 */
export const enviarDatos = async (apiURL, metodo = "POST") => {
    try {
        const datosFetch = await fetch(apiURL, {
            method: metodo
        });
        return datosFetch;
    } catch (error) {
        return false;
    }
}

/**
 * Realiza a una solicitud a una API
 * @param {OpcionesSolicitudDatosJSON} opciones - Opciones para la solicitud.
 */
export async function enviarDatosOJson(opciones) {
    let configuraciones = {};
    if (opciones.tipoJSON) {
        configuraciones = {
            method: "POST",
            body: JSON.stringify(opciones.datos),
            headers: {
                "Content-Type": "application/json"
            }
        }
    } else {
        let cuerpo = null;
        if (opciones.formulario) {
            cuerpo = new FormData(opciones.formulario);
        } else {
            cuerpo = new FormData();
        }
        for (const dato in opciones.datos) {
            const valor = opciones.datos[dato];
            cuerpo.set(dato, typeof valor === "function" ? await valor() : valor);
        }

        // Agregar campos al cuerpo de la solicitud solo si el campo no existe o el valor coincide con los valores condicionales
        if (opciones.camposCondicionales) {
            for (const objeto of opciones.camposCondicionales) {
                const valor = cuerpo.get(objeto.nombre);
                if (valor == null || objeto.valoresCondicionales?.includes(valor)) {
                    cuerpo.set(objeto.nombre, objeto.valor);
                }
            }
        }
        configuraciones = {
            method: "POST",
            body: cuerpo
        }
        // const objFormulario = Object.fromEntries(cuerpo.entries()); // ::ftest
        // console.log(objFormulario); // ::ftest
    }

    // console.log(configuraciones); // ::ftest
    // console.log(opciones.datos); // ::ftest
    // opciones.callbackExito(); // ::ftest
    // return; // ::ftest

    try {
        const respuesta = await fetch(opciones.urlSolicitud, configuraciones);

        const copia = respuesta.clone();  // ::logShow
        console.log("ResponseText: ", await copia.text()); // ::logShow

        const datos = await respuesta.json();

        if (datos[0] === "danger" || datos[0] === "error") {
            opciones.callbackError(datos);
            return;
        }
        if (datos[0] === "warning") {
            opciones.callbackAdvertencia ? opciones.callbackAdvertencia(datos) : opciones.callbackError(datos);
            return;
        }
        opciones.callbackExito(datos);
    } catch (error) {
        opciones.callbackError();
    }
}

/**
 * Función: Reinicia los campos de un formulario o una lista de campos.
 * Descripción: Esta función restablece los valores de los campos de un formulario o una lista de campos a sus valores predeterminados.
 * Fecha: 20 de diciembre de 2025
 * Autor: Joel Choque
 */
/**
 * Reinicia los campos de un formulario o una lista de campos.
 * @param {HTMLFormElement|HTMLElement[]} formulario - El formulario o lista de campos a reiniciar.
 */
export function reiniciarFormulario(formulario) {
    const campos = Array.isArray(formulario) ? formulario : formulario.querySelectorAll("input, select, textarea");

    campos.forEach((campo) => {
        const tipo = campo.type;
        const mantenerValor = campo.dataset.keep === "true";

        // SELECT con Selectize
        if (campo.tagName === "SELECT" && campo.selectize && !mantenerValor) {
            campo.selectize.clear();
            return;
        }

        // CHECKBOX
        if (tipo === "checkbox") {
            if (!mantenerValor) {
                campo.checked = false;
                campo.dispatchEvent(new Event("change"));
            }
            return;
        }

        // INPUT de texto / textarea
        if (tipo !== "date" && tipo !== "datetime-local" && !mantenerValor) {
            campo.value = campo.dataset.default ?? "";
            campo.dispatchEvent(new Event("input"));
            campo.dispatchEvent(new Event("change"));
        }
    });
};

/**
 * Función: Verifica errores nativos de inputs.
 * Descripción: Esta función verifica si los inputs proporcionados cumplen con las validaciones nativas del navegador.
 * Fecha: 15 de enero de 2025
 * Autor: Joel Choque
 */
/**
 * Verifica errores nativos de inputs.
 * @param {HTMLElement[]} inputs - Lista de inputs a verificar.
 * @returns {boolean} - Retorna true si todos los inputs son válidos, false si alguno tiene errores.
 */
export function verificarErroresNativosDeInputs(inputs) {
    for (const input of inputs) {
        if (input.tagName === "SELECT" && input.selectize) {
            if (input.value === "") {
                input.selectize?.focus();
                return false;
            }
        } else if (!input.checkValidity()) {
            input.reportValidity();
            return false;
        }
    }
    return true;
}

export const VerificarFormulario = (formulario) => {
    let contador = 0;
    const $formulario = $(formulario);
    $formulario.find(":input").each(function() {
        let tipo = $(this).attr("type");
        if (tipo !== "date" && tipo !== "datetime-local" && tipo !== "hidden" && this.value.trim() !== "" ) {
            if (!($(this).attr("data-default") && this.value.trim() === $(this).attr("data-default").trim())) {
                if(!($(this).attr("data-suffix"))) {
                    contador++;
                }
            }
        }
    });
    return contador;
}

/** * Envía los datos de un formulario mediante una petición POST.
 * @param {OpcionesManejoFormulario} opciones - Las opciones de configuración para la petición.
 * @param {boolean} [removerVacios] - Si es verdadero quita los campos vacios del cuerpo de la solicitud.
 */
export async function manejarEnvioFormulario(opciones, removerVacios = false) {
    const formulario = opciones.refFormulario;

    // Bloquear el botón de envío y mostrar en estado de carga
    const btn = formulario.querySelector("#btn-enviar-formulario");
    let fnBotonInicial;
    if (btn) {
        btn.dataset.inForm = true; // Marcar el botón como "en formulario" para controlar su estado desde la función previa a la solicitud
        fnBotonInicial = botonEnCarga(btn);
    }

    const cuerpoForm = new FormData(formulario);

    // Eliminar los campos vacios del cuerpo de la solicitud
    if (removerVacios) {
        const claves = [];
        for(let [clave, valor] of cuerpoForm) {
            if (valor.trim() === "") claves.push(clave);
        }
        claves.forEach((clave) => { cuerpoForm.delete(clave); })
    }

    // Borrar los mensajes de error de los inputs
    if (opciones.limpiarInfoError) {
        for(let [clave, valor] of cuerpoForm) {
            const input = formulario.querySelector(`[name="${clave}"]`);
            if (input && input.type !== "hidden") {
                const div = input.closest("div");
                const divError = div.lastChild
                if (divError?.classList?.contains("invalid-feedback") || divError?.classList?.contains("valid-feedback")) {
                    divError.innerHTML = "";
                    input.classList.remove("is-invalid");
                }
            }
        }
    }

    // Agregar campos al cuerpo de la solicitud solo si el campo no existe o el valor coincide con los valores condicionales
    if (opciones.camposCondicionales) {
        for (const objeto of opciones.camposCondicionales) {
            const valor = cuerpoForm.get(objeto.nombre);
            if (valor == null || objeto.valoresCondicionales?.includes(valor)) {
                cuerpoForm.set(objeto.nombre, objeto.valor);
            }
        }
    }

    // Agregar campos adicionales al cuerpo de la solicitud
    const camposAdicionales = opciones.camposAdicionales;
    if (camposAdicionales) {
        for (const clave in camposAdicionales) {
            const valor = camposAdicionales[clave];
            cuerpoForm.append(clave, (typeof(valor) === "function" ? await valor() : valor));
        }
    }

    // reiniciarFormulario(formulario); // ::ftest
    // const datosForm = Object.fromEntries(cuerpoForm.entries()); // ::ftest
    // console.log(datosForm); // ::ftest
    // fnBotonInicial?.(); // ::ftest
    // opciones.callbackExito(); // ::ftest
    // return; // ::ftest

    try {
        const respuestaFetch = await fetch(opciones.urlSolicitud, {
            method: "POST",
            body: cuerpoForm
        });

        const copia = respuestaFetch.clone(); // ::logShow
        console.log("ResponseText: ", await copia.text()); // ::logShow

        const respuesta = await respuestaFetch.json();

        if (respuesta[0] === "success" || respuesta.ok === "success" || respuesta[0] === "info") {
            reiniciarFormulario(formulario);
            opciones.esperarPromesa ? await opciones.callbackExito(respuesta) : opciones.callbackExito(respuesta);
        } else {
            opciones.esperarPromesa ? await opciones.callbackError(respuesta) : opciones.callbackError(respuesta);
        }
    } catch (error) {
        opciones.esperarPromesa ? await opciones.callbackError() : opciones.callbackError();
    } finally {
        fnBotonInicial?.();
    }
}