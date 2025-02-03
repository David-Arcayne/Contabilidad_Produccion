import { alertaDeError, alertaDeExito } from "./Alertas.js";
import { ErrorTabla, FormatoDate } from "./Funciones.js";

/**
 * Obtiene los datos de una API 
 * @param {string} apiURL - URL de la API que se va a consultar
 * @returns {Object} Un objeto JSON que contiene los datos de la API
 */
export const obtenerDatos = async (apiURL) => {
    try {
        const registros = await fetch(apiURL);
        if (!registros.ok) {
            // console.log(await registros.json());
            return false;
        }
        let datos = await registros.json();
        // console.log("listar: ", datos);
        
        return datos;
    } catch (error) {
        console.log(error);
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
 * @param {HTMLElement} [opciones.tBody] - Elemento "tbody" donde se mostrara el error
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
            ErrorTabla(opciones.tBody);
        }
    }
}

/**
 * Eliminar un registro
 * @param {string} apiURL - URL de la API.
 * @param {Function} accion - Funcion para ejecutar si la respuesta es exitosa.
 * @param {Function} alerta - Funcion de una alerta de advertencia.
 * @param {string} [metodo="GET"] - Metodo de la solicitud (GET, POST, DELETE).
 */
export const eliminarDato = async (apiURL, accion, alerta, metodo="GET") => {
    try {
        const datosFetch = await fetch(apiURL, {
            method: metodo
        });
        if (datosFetch.ok) {
            let a = await datosFetch.json();
            // console.log("eliminar:", a);
            if (a.length > 0 && a[0] === "success") {
                accion();
            } else if (a.ok === "success") {
                accion();
            } else if (a === true){
                accion();
            } else {
                alerta();
            }
        } else {
            alerta();
        }
    } catch (error) {
        console.log(error);
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

    // for (let [clave, valor] of cuerpoForm) {
    //     console.log(clave, valor);
    // }
    // return;

    fetch(opciones.myUrl, {
        method: "POST",
        body: cuerpoForm
    })
    .then(respuesta => {
        return respuesta.json();
    })
    .then(respuesta => {
        // if ("data" in respuesta) {
            // console.log("resObj: ", respuesta);
            
            opciones.redireccion(respuesta.data);
        // } else {
        //     opciones.error();
        // }
    })
    .catch(res => {
        opciones.error();
    });
}

/**
 * Limpia los campos de un formulario
 * @param {HTMLFormElement} formulario - El formulario que se desea limpiar.
 */
export const limpiarFormulario = (formulario) => {
    const $formulario = $(formulario);
    $formulario.find(':input').each(function() {
        if ($(this).is('select') && $(this)[0].selectize) {
            $(this)[0].selectize.clear();
        }
        else {
            // Limpiar los campos de texto y los checkbox excepto los que tienen el atributo "data-iclear" con el valor "false" y los de tipo "date" o "datetime-local"
            let tipo = $(this).attr("type");
            if ($(this).is(':checkbox')) {
                this.checked = false;
                const event = new Event("change");
                this.dispatchEvent(event);
            } else if (!(tipo === "date" || tipo === "datetime-local" || ($(this).attr("data-iclear") && $(this).attr("data-iclear") === "false") )) {
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

    // Eliminar los "inputs" vacios del formulario
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

    const datosForm = Object.fromEntries(cuerpoForm.entries());
    // console.log(datosForm);
    // return;

    fetch(opciones.myUrl, {
        method: "POST",
        body: cuerpoForm
    })
    .then(respuesta => {
        return respuesta.json();
    })
    .then(respuesta => {
        // console.log("guardar: ", respuesta);
        // if (respuesta.estado == "exito") {
        if (respuesta[0] == "success") {
            limpiarFormulario(formulario);
            opciones.redireccion(respuesta.data);
        } else if(respuesta.ok == "success") {
            limpiarFormulario(formulario);
            opciones.redireccion(respuesta.data);
        } else if (respuesta[0] === "info") {
            limpiarFormulario(formulario);
            opciones.redireccion(respuesta.data);
        } else {
            opciones.error();
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
            limpiarFormulario(formulario);
            opciones.redireccion(respuesta.data);
        } else {
            opciones.error();
        }
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
 * @param {string} datosSelect.llaves.id - La llave que es el valor (attr: "value") de cada opción
 * @param {string} datosSelect.llaves.sid - La llave del registro que se desea seleccionar por defecto.
 * @param {(string|string[])} datosSelect.llaves.detalle - La llave o llaves que son el contenido de cada opción.
 * @param {Object[]} [datosSelect.datos] - Los datos que se desean mostrar en el select.
 * @param {string} [datosSelect.text] - El texto que se muestra en la primera opción del select.
 * @param {string} [datosSelect.textNF] - El texto que se muestra si no hay registros.
 * @param {Object[]} [datosSelect.opcionesExtraInicio] - Opciones extra que se desean mostrar al inicio del select.
 * @param {Object[]} [datosSelect.opcionesExtra] - Opciones extra que se desean mostrar en el select.
 * @param {boolean} [datosSelect.multiple] - Si es verdadero, el select permite seleccionar varias opciones.
 * @param {Object} [accion] - Acciones que se ejecutan al seleccionar una opción.
 * @param {HTMLElement} [accion.div] - Elemento que se desea modificar.
 * @param {Function} [accion.accion] - Función que se ejecuta al seleccionar una opción.
 * @param {string} [id] - El id de la opción que se debe seleccionar por defecto.
 * @returns
 */
export const rellenarSelect = async (select, datosSelect, id = false, accion = false) => {
    // Deshabilitar el select y si el select ya tiene un selectize, destruirlo 
    $(select)[0].selectize?.destroy();
    select.setAttribute("disabled", "");
    select.innerHTML = "<option value=''>cargando...</option>";

    let datosApi;

    if (select.hasAttribute("multiple") && !datosSelect.multiple) {
        datosSelect.multiple = true;
    }

    // Obtener los datos de la API si no se han proporcionado
    if (!datosSelect.datos) {
        const urlOrigen = typeof(datosSelect.origen) === "function" ? datosSelect.origen() : datosSelect.origen;
        datosApi = await obtenerDatos(urlOrigen);
    } else {
        datosApi = datosSelect.datos;
    }

    select.innerHTML = "";
    
    // Si no hay datos en la API o no se proporcionaron datos mostrar un mensaje
    if (!datosApi || datosApi.length === 0) {
        select.innerHTML = `<option value> -- ${ datosSelect.textNF ?? "No hay registros"} -- </option>`;
        if (select.hasAttribute("multiple")) {
            select.setAttribute("size", "1");
        }
        if (select.hasAttribute("disabled")) {
            select.removeAttribute("disabled");
        }
        return;
    }

    // Crear la primera opción (sin valor) del select
    const primeraOpcion = document.createElement('option');
    primeraOpcion.value = "";
    primeraOpcion.innerHTML = `-- ${datosSelect.text ? datosSelect.text : "Elija una opción"} --`;
    select.appendChild(primeraOpcion);

    // Crear las opciones extra que se desean mostrar al inicio del select
    if (datosSelect.opcionesExtraInicio) {
        for (const opcionExtra of datosSelect.opcionesExtraInicio) {
            const opcion = document.createElement('option');
            opcion.value = opcionExtra.value;
            opcion.innerHTML = opcionExtra.text;
            select.appendChild(opcion);
        }
    }

    // Crear las opciones del select con los datos y de acuerdo a las llaves proporcionadas
    for (const dato of datosApi) {
        const opcion = document.createElement('option');
        opcion.value = dato[datosSelect.llaves.id];
        let detalleOpcion = "";
        if (typeof (datosSelect.llaves.detalle) != "string") {
            for (const detalle of datosSelect.llaves.detalle) {
                if (typeof(detalle) !== "string") {
                    if (detalle[1] === "date") {
                        detalleOpcion += FormatoDate(dato[detalle[0]]) + ": ";
                    }
                } else {
                    detalleOpcion += dato[detalle] + ": ";
                }
            }
            detalleOpcion = detalleOpcion.substring(0, detalleOpcion.length - 2);
        } else {
            detalleOpcion = dato[datosSelect.llaves.detalle];
        }
        opcion.innerHTML = detalleOpcion;
        if (id && datosSelect.llaves?.sid && id == dato[datosSelect.llaves.sid]) opcion.selected = true;
        else if (id && id == dato[datosSelect.llaves.id]) opcion.selected = true;
        select.appendChild(opcion);
    }

    const div = select.parentNode;
    // let inputSelect = null;
    const $divSelect = $(div);
    const $select = $divSelect.find(`#${select.id}`);
    // Inicializar el select con Selectize
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

    // Crear las opciones extra que se desean mostrar en el select
    if (datosSelect.opcionesExtra) {
        const selectize = $select[0].selectize;
        for (const opcionExtra of datosSelect.opcionesExtra) {
            selectize.addOption(opcionExtra);
        }
    }

    // Habilitar el select
    $select[0].selectize ? $select[0].selectize.enable() : $select[0].removeAttribute("disabled");
}

/**
 * Realiza una solicitud para generar un PDF.
 * @param {(string|function)} myURL - Url a la que se dea enviar el formulario.
 * @param {string} metodo - Metodo de la solicitud (GET, POST).
 * @param {HTMLFormElement} [formulario] - El formulario que se desea enviar.
 * @param {Object} [acciones] - Funcionalidades para la solicitud.
 * @param {Function} [acciones.informacion] - Funcion que se ejecuta si la solicitud falla.
 * @param {Function} [acciones.exitoso] - Funcion que se ejecuta si la solicitud es exitosa.
 * @param {Function} [acciones.error] - Funcion que se ejecuta si la solicitud falla.
 * @param {boolean} [noVaciar] - Si es verdadero no limpia el formulario.
 * @param {Object} [extra] - datos extra para enviar en el formulario.
 * @param {string} [descargar] - Nombre del archivo a descargar.
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
        if (extra) {
            const datosExtra = extra(body, formulario);
            body.append("informacion", datosExtra);
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
                const blob = await response.blob();
                // Si se proporciona un nombre para descargar el archivo, se descarga, de lo contrario se abre en una nueva pestaña
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
        })
        .catch(async (error) => {
            console.log(error);
            acciones?.error();
        });

}