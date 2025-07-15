import { alertaDeError, alertaDeExito } from "./Alertas.js";

/**
 * Obtiene los datos de una API 
 * @param {string} apiURL - URL de la API que se va a consultar
 * @returns {Object} Un objeto JSON que contiene los datos de la API
 */
export const obtenerDatos = async (apiURL) => {
    try {
        const registros = await fetch(apiURL);
        if (!registros.ok) {
            return false;
        }
        let datos = await registros.json();
        return datos;
    } catch (error) {
        return false;
    }
}

/**
 * Obtine los datos de una API, y muestra alertas de acuerdo a la respuesta obtenida
 * @param {string} apiUrl - URL de la API que se va a consultar
 * @param {Object} opciones - Opciones
 * @param {HTMLElement} opciones.contenedor - Elemento que contendra la alerta
 * @param {string} opciones.error - Mensaje de la alerta de error
 * @param {string} [opciones.correcto] - Mensaje de la alerta de exito
 * @param {Function} [opciones.accion] - Funcion que recibe un argumento con los registros de la API
 */
export const obtenerDatosAlr = async (apiUrl, opciones) => {
    const registros = await obtenerDatos(apiUrl);
    if (registros) {
        if (opciones.accion) {
            await opciones.accion(registros);
        }
        if (opciones.correcto) {
            alertaDeExito(opciones.contenedor, opciones.correcto)
        }
    } else {
        if (opciones.contenedor && opciones.error) {
            alertaDeError(opciones.contenedor, opciones.error);
        }
        if (opciones.tBody) {
            const td = document.createElement("td");
            td.setAttribute("colspan", "100%");
            td.classList.add("text-center");
            td.textContent = "Error al cargar los datos";
            const tr = document.createElement("tr");
            tr.appendChild(td);
            opciones.tBody.replaceChildren(tr);
        }
    }
}

/**
 * Eliminar un registro
 * @param {string} apiURL - URL de la API.
 * @param {Function} accion - Funcion para ejecutar si la respuesta es exitosa.
 * @param {Function} alerta - Funcion de una alerta de advertencia.
 */
export const eliminarDato = async (apiURL, accion, alerta) => {
    try {
        const datosFetch = await fetch(apiURL, {
            method: "DELETE"
        });
        // console.log(await datosFetch.json());
        if (datosFetch.ok) {
            accion();
        } else {
            alerta();
        }
    } catch (error) {
        alerta();
    }
}

/**
 * Eliminar un registro
 * @param {string} apiURL - URL de la API.
 * @param {Function} accion - Funcion para ejecutar si la respuesta es exitosa.
 * @param {Function} alerta - Funcion de una alerta de advertencia.
 */
export const eliminarDatoAPI = async (apiURL, accion, alerta) => {
    const datosFetch = await fetch(apiURL);
    if (datosFetch.ok) {
        accion();
    } else {
        alerta()
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
 * @param {Object} opciones - Opciones para la solicitud.
 * @param {string} opciones.myUrl - URL de la API.
 * @param {Object} opciones.datos - Datos que se enviaran a la API.
 * @param {Function} opciones.redireccion - Funcion que se ejecuta si la peticion es exitosa.
 * @param {Function} opciones.error - Funcion que se ejecuta si la peticion falla.
 */
export const enviarDatosObj = (opciones) => {
    const cuerpoForm = new FormData();

    for (const dato in opciones.datos) {
        cuerpoForm.append(dato, opciones.datos[dato]); 
    }

    fetch(opciones.myUrl, {
        method: "POST",
        body: cuerpoForm
    })
    .then(respuesta => {
        return respuesta.json();
    })
    .then(respuesta => {
        if ("data" in respuesta) {
            opciones.redireccion(respuesta.data);
        } else {
            opciones.error();
        }
    })
    .catch(res => {
        opciones.error();
    });
}

export const limpiarFormulario = (formulario) => {
    const $formulario = $(formulario);
    $formulario.find(':input').each(function() {
        if ($(this).is('select') && $(this)[0].selectize) {
            $(this)[0].selectize.clear();
        }
        else {
            let tipo = $(this).attr("type");
            if ($(this).is(':checkbox')) {
                this.checked = false;
                const event = new Event("change");
                this.dispatchEvent(event);
            } else if (!(tipo === "date" || tipo === "datetime-local")) {
                this.value = "";
                const event = new Event("input");
                this.dispatchEvent(event);
            }
        }
    });
}

/**
 * Envía los datos de un formulario mediante una petición POST.
 * @param {Object} opciones - Las opciones de configuración para la petición.
 * @param {HTMLFormElement} opciones.refForm - El formulario que se desea enviar.
 * @param {string} opciones.myUrl - La URL a la que se desea enviar el formulario.
 * @param {Object} [opciones.datosExtra] - Datos adicionales que se desean enviar junto con el formulario.
 * @param {function} [opciones.redireccion] - La función que se desea ejecutar en caso de que la petición sea exitosa.
 * @param {function} [opciones.error] - La función que se desea ejecutar en caso de que la petición falle.
 * @param {boolean} [limpiar] - Si es verdadero elimina los "inputs" vacios del formulario.
 * @return
 */
export const enviarDatosFormulario = (opciones, limpiar=false) => {
    const formulario = opciones.refForm;

    const btn = formulario.querySelector("#btn-enviar-formulario");
    btn?.setAttribute("disabled", "");
    
    const cuerpoForm = new FormData(formulario);

    if (limpiar) {
        const claves = [];
        for(let [clave, valor] of cuerpoForm) {
            if (valor.trim() === "") claves.push(clave);
        }

        claves.forEach((clave) => { cuerpoForm.delete(clave); })
    }

    // Borrar los mensajes de error de los inputs
    for(let [clave, valor] of cuerpoForm) {
        const input = formulario.querySelector(`[name='${clave}']`);
        if (input) {
            const div = input.closest("div");

            const error = div.lastChild
            error.innerHTML = "";
            input.classList.remove("is-invalid");
        }
    }
    if (opciones.datosExtra) {
        for (const dato in opciones.datosExtra) {
            cuerpoForm.append(dato, opciones.datosExtra[dato]);
        }
    }

    fetch(opciones.myUrl, {
        method: "POST",
        body: cuerpoForm
    })
    .then(respuesta => {
        return respuesta.json();
    })
    .then(respuesta => {
        if ("data" in respuesta) {
            // formulario.reset();
            limpiarFormulario(formulario);
            opciones.redireccion(respuesta.data);
        } else {
            if (respuesta.errors) {
                for (const nombreInput of Object.keys(respuesta.errors)) {
                    const input = document.querySelector(`[name='${nombreInput}']`)
                    input.classList.add("is-invalid");
                    const divError = input.nextElementSibling;
                    divError.innerHTML = respuesta.errors[nombreInput];
                    // input.nextElementSibling?.innerHTML = res.errors[nombreInput];
                }
            } else if (respuesta.msg_error) {
                opciones.error();
            } else {
                console.log("No se pudo realizar la operación");
                opciones.error();
            }
        }

        btn?.removeAttribute("disabled")
    })
    .catch(res => {
        opciones.error();
        btn?.removeAttribute("disabled")
    });
}

/**
 * Envía los datos de un formulario mediante una petición POST.
 * @param {Object} opciones - Las opciones de configuración para la petición.
 * @param {HTMLFormElement} opciones.refForm - El formulario que se desea enviar.
 * @param {string} opciones.myUrl - La URL a la que se desea enviar el formulario.
 * @param {Object} [opciones.datosExtra] - Datos adicionales que se desean enviar junto con el formulario.
 * @param {function} [opciones.redireccion] - La función que se desea ejecutar en caso de que la petición sea exitosa.
 * @param {function} [opciones.error] - La función que se desea ejecutar en caso de que la petición falle.
 * @param {boolean} [limpiar] - Si es verdadero elimina los "inputs" vacios del formulario.
 * @return
 */
export const enviarDatosFormularioAPI = (opciones, limpiar=false) => {
    const formulario = opciones.refForm;

    const btn = formulario.querySelector("#btn-enviar-formulario");
    btn?.setAttribute("disabled", "");
    
    const cuerpoForm = new FormData(formulario);

    if (opciones.datosExtra) {
        for (const dato in opciones.datosExtra) {
            cuerpoForm.append(dato, opciones.datosExtra[dato]);
        }
    }
    
    fetch(opciones.myUrl, {
        method: "POST",
        body: cuerpoForm
    })
    .then(respuesta => {
        return respuesta.json();
    })
    .then(respuesta => {
        if (respuesta.estado = "exito") {
            // formulario.reset();
            limpiarFormulario(formulario);
            opciones.redireccion(respuesta.data);
        } else {
            opciones.error();
        }
        // {"estado": "exito", "mensaje": "Registro exitoso"}

        btn?.removeAttribute("disabled")
    })
    .catch(res => {
        opciones.error();
        btn?.removeAttribute("disabled")
    });
}

/**
 * Rellena un elemento select con registros obtenidod de una API.
 * @param {HTMLSelectElement} select - El elemento select a rellenar.
 * @param {Object} datosSelect - Los datos necesarios para rellenar el select.
 * @param {string} datosSelect.origen - La URL para obtener datos de la API.
 * @param {Object} datosSelect.llaves - Las llaves necesarias para obtener los datos del registro.
 * @param {string} datosSelect.llaves.id - La llave que es el valor de cada opción.
 * @param {(string|string[])} datosSelect.llaves.detalle - La llave o llaves que son el contenido de cada opción.
 * @param {Object[]} [datosSelect.datos] - Los datos que se desean mostrar en el select.
 * @param {string} [datosSelect.text] - El texto que se muestra en la primera opción del select.
 * @param {Boolean} [datosSelect.extraApi] - Si los datos de la API no se encuentran en un objeto llamado "data".
 * @param {Object} [accion] - Acciones que se ejecutan al seleccionar una opción.
 * @param {HTMLElement} [accion.div] - Elemento que se desea modificar.
 * @param {Function} [accion.accion] - Función que se ejecuta al seleccionar una opción.
 * @param {string} [id] - El id de la opción que se debe seleccionar por defecto.
 * @returns
 */
export const rellenarSelect = async (select, datosSelect, id = false, accion = false) => {
    $(select)[0].selectize?.destroy();
    select.setAttribute("disabled", "");
    select.innerHTML = "<option value=''>cargando...</option>";

    let datosApi = {};

    if (select.hasAttribute("multiple") && !datosSelect.multiple) {
        datosSelect.multiple = true;
    }

    if (!datosSelect.datos) {
        const urlOrigen = typeof(datosSelect.origen) === "function" ? datosSelect.origen() : datosSelect.origen;
        
        datosApi = await obtenerDatos(urlOrigen);
        if (datosSelect.extraApi) {
            datosApi = {data: datosApi}
        }
    } else {
        datosApi = {data: datosSelect.datos};
    }

    select.innerHTML = "";
    
    if (!datosApi.data || datosApi.data.length === 0) {
        select.innerHTML = `<option value> -- ${ datosSelect.textNF ?? "No hay registros"} -- </option>`;
        if (select.hasAttribute("multiple")) {
            select.setAttribute("size", "1");
        }
        if (select.hasAttribute("disabled")) {
            select.removeAttribute("disabled");
        }
        return;
    }

    const primeraOpcion = document.createElement('option');
    primeraOpcion.value = "";
    primeraOpcion.innerHTML = `-- ${datosSelect.text ? datosSelect.text : "Elija una opción"} --`;
    select.appendChild(primeraOpcion);

    for (const dato of datosApi.data) {
        const opcion = document.createElement('option');
        opcion.value = dato[datosSelect.llaves.id];
        let detalleOpcion = "";
        if (typeof (datosSelect.llaves.detalle) != "string") {
            for (const detalle of datosSelect.llaves.detalle) {
                detalleOpcion += dato[detalle] + ": ";
            }
            detalleOpcion = detalleOpcion.substring(0, detalleOpcion.length - 2);
        } else {
            detalleOpcion = dato[datosSelect.llaves.detalle];
        }
        opcion.innerHTML = detalleOpcion;
        if (id && id == dato[datosSelect.llaves.id]) opcion.selected = true;
        select.appendChild(opcion);
    }

    const div = select.parentNode;
    // let inputSelect = null;

    const $divSelect = $(div);
    const $select = $divSelect.find(`#${select.id}`);
    // $(`#${select.id}`).selectize({
    $select.selectize({
        plugins: ["remove_button"],
        openOnFocus: false,
        onChange: function(value) {
            if (accion) {
                if (accion.div) {
                    accion.accion(value, accion.div)
                } else {
                    accion.accion(value)
                }
            }
            // if (inputSelect) {
            //     const instance = this;
            //     if (instance.items.length === 0) {
            //         inputSelect.style.top = "";
            //     } else {
            //         inputSelect.style.top = "-10px";
            //     }
            // }
        },
        onFocus: function () {
            if (!this.ignoreFocusOpen) {
                this.open();
            }
        },
        selectOnTab: false,
        onInitialize: function() {
            // Obtener los elementos creados por Selectize
            const instance = this;
            // const dropdownContent = instance.$dropdown_content; // El contenedor del dropdown
            const control = instance.$control[0];               // El contenedor del input
            const controlInput = instance.$control_input[0];       // El input de control
            if (control.children.length === 1) {
                controlInput.removeAttribute("style");
            }
        }
    });

    const divSelect = div.querySelector(".selectize-input");
    if (datosSelect.multiple) {
        // inputSelect = divSelect.querySelector("input[type='select-one']");
    } else {
        divSelect.setAttribute("style", "display: inline-flex");
    }

    if (datosSelect.opcionesExtra) {
        const selectize = $select[0].selectize;
        
        for (const opcionExtra of datosSelect.opcionesExtra) {
            selectize.addOption(opcionExtra);
        }
    }

    $select[0].selectize ? $select[0].selectize.enable() : $select[0].removeAttribute("disabled");
}

/**
 * Realiza una solicitud para generar un PDF.
 * @param {string} myURL - Url a la que se dea enviar el formulario.
 * @param {string} metodo - Metodo de la solicitud (GET, POST).
 * @param {HTMLFormElement} [formulario] - El formulario que se desea enviar.
 * @param {Object} [acciones] - Funcionalidades para la solicitud.
 * @param {Object} [extra] - datos extra para enviar en el formulario.
 */
export const solicitudPDF = async (myURL, metodo, formulario, acciones, noVaciar, extra, descargar) => {
    let fetchData = {};
    if (metodo == "GET") {
        fetchData["method"] = "GET";
    } else {
        let body = {};
        if (formulario) {
            body = new FormData(formulario);
        } else {
            body = new FormData();
        }
        if (typeof(extra) === "function") {
            const datosExtra = extra(body, formulario);
            body.append("informacion", datosExtra);
        } else if (typeof(extra) === "object") {
            for (const dato in extra) {
                body.append(dato, extra[dato]);
            }
        }
        fetchData = { method: "POST", body }
    }

    myURL =  typeof(myURL) === "function" ? myURL() : myURL;

    await fetch(myURL, fetchData)
    .then(async response => {
        if (!response.ok) {
            const res = await response.json();
            acciones?.informacion(res);
        } else {
            // const res = await response.json();
            const blob = await response.blob();
            if (descargar) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = descargar;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            }
            if (acciones && acciones.exitoso) {
                acciones.exitoso();
            }
                
        }
        if (formulario && !noVaciar) limpiarFormulario(formulario);;
        // if (formulario && !noVaciar) formulario.reset();
    })
    .catch(async (error) => {
        console.log(error);
        acciones?.error();
    });
}