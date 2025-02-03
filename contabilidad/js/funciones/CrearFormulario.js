import { alertaDeError, alertaDeExito } from "./Alertas.js";
import { contenidoTBody } from "./CrearTabla.js";
import { crearElemento } from "./Funciones.js";
import { enviarDatosFormulario, enviarDatosFormularioAPI, limpiarFormulario, obtenerDatos, rellenarSelect } from "./Solicitudes.js";

/**
 * Crea un formulario con los "inputs" requeridos.
 * @param {Object[]} inputs - Array de objetos con valores para crear "inputs".

 *
 * @param {Object} datosFormulario - Objeto con valores y funcionalidades para el formulario.
 * @param {string} [datosFormulario.myurl] - Url de la API a la que se enviara el formulario.
 * @param {Object.<string,string>} [datosFormulario.datosExtra] - Datos para enviar en el formulario.
 * @param {Function} datosFormulario.accionEnviar - La función que se ejecutara si el formulario se envía correctamente.
 * @param {Function} [datosFormulario.error] - La función que se ejecutara si ocurre un error al enviar el formulario.
 * @param {Boolean} [datosFormulario.solicitudAPI] - Determina si se usara otra función para el envío de formulario.
 * @param {Function} [datosFormulario.accionPrevia] - Funcion que se ejecutara antes de enviar el formulario.
 * @param {Object} datosFormulario.botones - Objeto que contiene los botones y sus datos para el formulario.
 * @param {HTMLElement} datosFormulario.botones.contenido - Elemento que contiene los botones para el formulario.
 * @param {Object[]} datosFormulario.botones.informacion - Array de objetos con los datos de cada boton.
 * @param {string} datosFormulario.botones.informacion.url - URL del boton donde se envirá el formulario
 * @param {HTMLElement} datosFormulario.botones.informacion.boton - Elemento del boton.
 * @param {function} datosFormulario.botones.informacion.accionPrevia - Funcion que se ejecutara antes de enviar el formulario.
 * @param {Object} datosFormulario.datosBtn - Los datos de los botones.
 * @param {string} datosFormulario.datosBtn.btnClass - La clase CSS para el botón.
 * @param {string} datosFormulario.datosBtn.nombre - El nombre del botón.
 * @param {string} [datosFormulario.datosBtn.columna] - La clase CSS para el contenedor de la columna.
 * @param {Function} [datosFormulario.datosBtn.accionCancelar] - La función que se ejecuta cuando se hace clic en el botón Cancelar.
 * @param {Object} [registro] - Los datos de un registro.
 * @returns 
 */
export const crearFormulario = (inputs, datosFormulario, registro = false, centrar = false) => {
    const form = document.createElement("form");
    if (centrar) {
        form.setAttribute("class", "row g-3 justify-content-center");
    } else {
        form.setAttribute("class", "row g-3");
    }

    // console.log("datos: ", registro);

    for (const input of inputs) {
        if (registro && input?.editar === false){
            continue;
        }
        if (!registro && input?.editar === true){
            continue;
        }
        if (input?.seccion) {
            const infoSeccion = crearElemento("p", {class: "text-center mt-4 mb-1 fs-6"}, [input.detalle]);
            const hr = crearElemento("hr");
            const divSeccion = crearElemento("div", {class: "row pe-0"}, [infoSeccion, hr]);
            for (const item of input.seccion) {
                divSeccion.appendChild(labelInput(item, registro));
            }
            form.appendChild(divSeccion);
            continue;
        }
        form.appendChild(labelInput(input, registro));
    }

    if (datosFormulario.myurl || datosFormulario.botones) {
        if (datosFormulario.botones && datosFormulario.botones.informacion) {
            form.appendChild(datosFormulario.botones.contenido)
            datosFormulario.botones.informacion.forEach(element => {
                element.boton.addEventListener("click", (e) => {
                    e.preventDefault();
                    if (form.reportValidity()) {
                        const opciones = {
                            refForm: form,
                            myUrl: element.url,
                            datosExtra: datosFormulario.datosExtra,
                            redireccion: datosFormulario.accionEnviar,
                            error: datosFormulario.error
                        }
                        if (element.accionPrevia) {
                            element.accionPrevia(() => { datosFormulario.solicitudAPI ? enviarDatosFormularioAPI(opciones) : enviarDatosFormulario(opciones); }, form);
                        } else {
                            datosFormulario.solicitudAPI ? enviarDatosFormularioAPI(opciones) : enviarDatosFormulario(opciones);
                        }
                    }
                });
            });
            
        } else {
            form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const opciones = {
                        refForm: form,
                        myUrl: datosFormulario.myurl,
                        datosExtra: datosFormulario.datosExtra,
                        redireccion: datosFormulario.accionEnviar,
                        error: datosFormulario.error
                    }
                    if (datosFormulario.accionPrevia) {
                        datosFormulario.accionPrevia(() => { datosFormulario.solicitudAPI ? enviarDatosFormularioAPI(opciones) : enviarDatosFormulario(opciones); }, form);
                    } else {
                        datosFormulario.solicitudAPI ? enviarDatosFormularioAPI(opciones) : enviarDatosFormulario(opciones);
                    }
            });
    
            form.appendChild(botonesDeFormulario(datosFormulario.datosBtn, form));
        }
    } else {
        form.appendChild(botonesDeFormulario(datosFormulario.datosBtn, form));
    }

    return form;
}

/**
 * Crea un elemento de formulario.
 * @param {Object} datosInput - Los datos del elemento de formulario.
 * @param {string} datosInput.id - El ID del elemento de formulario.
 * @param {string} datosInput.nombre - El nombre del elemento de formulario.
 * @param {string} [datosInput.label] - El texto de la etiqueta "label".
 * @param {number} [datosInput.mensaje] - Texto dentro del input/select.
 * @param {Boolean} [datosInput.extraApi] - Datos para las API de otros módulos.
 * @param {number} [datosInput.relacion] - Identificador del elemento con el que tiene relación.
 * @param {string} datosInput.forma - La forma del elemento de formulario (input, textarea, select).
 * @param {string} [datosInput.tipo] - El tipo de entrada para el elemento de formulario (solo para "input").
 * @param {string} [datosInput.valor] - El valor que tendrá el elemento input.
 * @param {string} [datosInput.classlabel] - La clase CSS para la etiqueta "label".
 * @param {boolean} [datosInput.desactivado] - Si el elemento de formulario está desactivado.
 * @param {number} [datosInput.filas] - El número de filas para el elemento de formulario (solo para "textarea").
 * @param {(number|"any")} [datosInput.intervalo] - Especifica el intervalo entre números legales para el elemento de formulario (solo para "input").
 * @param {(number|string)} [datosInput.minimo] -  Define el valor mínimo que es aceptable y válido para el elemento de formulario (solo para "input").
 * @param {(number|string)} [datosInput.maximo] -  Define el valor máximo que es aceptable y válido para el elemento de formulario (solo para "input").
 * @param {Object[]} [datosInput.opciones] - Las opciones para el elemento (solo para "select").
 * @param {string} [datosInput.origen] - La URL para optener datos de la API (solo para "select").
 * @param {string} [datosInput.txtE] - Texto para la opción vacía.
 * @param {function} [datosInput.accion] - Funcion que se ejecuta cuando se seleccione una opción o se cambia un input (solo para "select e input").
 * @param {function} [datosInput.accionload] - Funcion que se ejecuta cuando se carga el formulario.
 * @param {string} datosInput.opciones.clave - El valor para el atributo  value.
 * @param {string} datosInput.opciones.valor - El contenido de la opción,
 * @param {boolean} [datosInput.required] - Si el elemento de formulario es obligatorio.
 * @param {boolean} [datosInput.editar] - Si el elemento de formulario es editable.
 * @param {boolean} [datosInput.readonly] - Si el elemento de formulario es de solo lectura.
 * @param {string} [datosInput.iclear] - Si el elemento de formulario tiene la funcionalidad de limpiar.
 * @param {string} [datosInput.valori] - El valor por defecto del elemento.
 * @param {string} [datosInput.n_registro] - El nombre de la clave del registro para obtener el valor.
 * 
 * 
 * @param {string} datosInput.opciones.clave - El valor para el atributo  value.
 * @param {string} datosInput.opciones.valor - El contenido de la opción,
 * @param {boolean} [datosInput.required] - Si el elemento de formulario es obligatorio.
 * @param {Object} [registro] - Los datos de un registro.
 * @returns
 */
function labelInput(datosInput, registro) {
    const elementoId = datosInput.id;
    const nombreElemento = datosInput.nombre;
    const div = crearElemento("div", { class: (datosInput.columnas ? datosInput.columnas : "col-md-6 col-lg-4") });

    let label = "";
    if (datosInput.label) {
        let textoLabel = [];
        textoLabel.push(datosInput.label);
        if(datosInput.required && ["input", "select", "textarea"].includes(datosInput.forma) && !["file"].includes(datosInput.tipo)){
            const asterisco = crearElemento("span", {class: "text-danger fw-bold"}, ["*"]);
            textoLabel = [textoLabel, " ", asterisco];
        }
        label = crearElemento("label", { class: datosInput.classlabel ? datosInput.classlabel + " p-2" : "form-label", for: elementoId }, textoLabel);
        if (!datosInput.classlabel) {
            div.appendChild(label);
        }
    }

    CrearInput(datosInput, registro, div, label);
    const errorDiv = crearElemento("div", { class: "invalid-feedback" });
    div.appendChild(errorDiv);

    return div;
}

/**
 * Crea un formulario con botones.
 * @param {Object} datosBtn - Los datos de los botones.
 * @param {string} datosBtn.btnClass - La clase CSS para el botón.
 * @param {string} datosBtn.nombre - El nombre del botón.
 * @param {string} [datosBtn.columna] - La clase CSS para el contenedor de la columna.
 * @param {Function} [datosBtn.accionCancelar] - La función que se ejecuta cuando se hace clic en el botón Cancelar.
 * @param {HTMLFormElement} form - Formulario
 * @returns El elemento HTML del formulario con los botones.
 */
function botonesDeFormulario(datosBtn, form) {
    const botonContinuar = crearElemento('button', { class: datosBtn.btnClass, type: "submit", id: "btn-enviar-formulario", style: "min-width: 120px" }, [datosBtn.nombre]);
    const divContinuar = crearElemento('div', { class: "d-grid mx-5 mx-md-0" }, [botonContinuar]);
    const contenedorContinuar = crearElemento('div', { class: (datosBtn.colbtn ?? "col-md-auto") }, [divContinuar]);
    const contenedorBtns = crearElemento("div", { class: `row ${!datosBtn.columna ? "justify-content-center" : ""}` });
    const contenedorPrincipal = crearElemento("div", { class: `${datosBtn.columna ? datosBtn.columna : "col-12 text-center"}` }, [contenedorBtns]);

    contenedorBtns.appendChild(contenedorContinuar);
    if (datosBtn.accionCancelar) {
        const botonCancelar = crearElemento('a', { class: "btn btn-secondary px-1 px-md-4", style: "min-width: 120px" }, ["Cancelar"]);
        const divCancelar = crearElemento('div', { class: "d-grid gap-2 mx-5 mx-md-0" }, [botonCancelar]);
        const contenedorCancelar = crearElemento('div', { class: "col-md-auto pt-2 pt-md-0" }, [divCancelar]);

        contenedorBtns.appendChild(contenedorCancelar);

        botonCancelar.addEventListener("click", (e) => {
            // form.reset();
            limpiarFormulario(form);
            datosBtn.accionCancelar(e);
        });
    }

    return contenedorPrincipal;
}

/**
 * Crea un input, textarea o select.
 * @param {Object} datosInput - Los datos del elemento de formulario.
 * @param {string} datosInput.id - El ID del elemento de formulario.
 * @param {string} datosInput.nombre - El nombre del elemento de formulario.
 * @param {string} datosInput.forma - La forma del elemento de formulario (input, textarea, select).
 * @param {string} [datosInput.label] - El texto de la etiqueta "label".
 * @param {number} [datosInput.mensaje] - Texto dentro del input/select.
 * @param {Boolean} [datosInput.extraApi] - Datos para las API de otros módulos.
 * @param {number} [datosInput.relacion] - Identificador del elemento con el que tiene relación.
 * @param {string} [datosInput.tipo] - El tipo de entrada para el elemento de formulario (solo para "input").
 * @param {string} [datosInput.valor] - El valor que tendrá el elemento input.
 * @param {string} [datosInput.classlabel] - La clase CSS para la etiqueta "label".
 * @param {boolean} [datosInput.desactivado] - Si el elemento de formulario está desactivado.
 * @param {number} [datosInput.filas] - El número de filas para el elemento de formulario (solo para "textarea").
 * @param {(number|"any")} [datosInput.intervalo] - Especifica el intervalo entre números legales para el elemento de formulario (solo para "input").
 * @param {(number|string)} [datosInput.minimo] -  Define el valor mínimo que es aceptable y válido para el elemento de formulario (solo para "input").
 * @param {(number|string)} [datosInput.maximo] -  Define el valor máximo que es aceptable y válido para el elemento de formulario (solo para "input").
 * @param {string} [datosInput.origen] - La URL para optener datos de la API (solo para "select").
 * @param {string} [datosInput.txtE] - Texto para la opción vacía.
 * @param {function} [datosInput.accion] - Funcion que se ejecuta cuando se seleccione una opción o se cambia un input (solo para "select e input").
 * @param {Object[]} [datosInput.opciones] - Las opciones para el elemento (solo para "select").
 * @param {string} datosInput.opciones.clave - El valor para el atributo  value.
 * @param {string} datosInput.opciones.valor - El contenido de la opción,
 * @param {boolean} [datosInput.required] - Si el elemento de formulario es obligatorio.
 * @param {boolean} [datosInput.editar] - Si el elemento de formulario es editable.
 * @param {string} [datosInput.readonly] - Si el elemento de formulario es de solo lectura.
 * @param {string} [datosInput.iclear] - Si el elemento de formulario tiene la funcionalidad de limpiar.
 * @param {string} [datosInput.valori] - El valor por defecto del elemento.
 * @param {string} [datosInput.n_registro] - El nombre de la clave del registro para obtener el valor.
 * @param {string} [datosInput.columnas] - La clase CSS para el contenedor de la columna.
 * @param {function} [datosInput.accionload] - Funcion que se ejecuta cuando se carga el input del formulario.
 * 
 * @param {Object} [registro] - Los datos de un registro.
 * @param {HTMLElement} [div] - El contenedor del elemento.
 * @param {HTMLElement} [label] - La etiqueta del elemento.
 */
export const CrearInput = (datosInput, registro, div = null, label = null) => {
    if (registro && datosInput?.editar === false){
        return "-";
    }
    if (!registro && datosInput?.editar === true){
        return "-";
    }

    const elementoId = datosInput.id;
    const nombreElemento = datosInput.nombre;

    if (datosInput.forma === "input") {
        const input = crearElemento("input", { class: "form-control", id: elementoId, name: nombreElemento, type: datosInput.tipo });
        if (datosInput.tipo === "file") {
            if (datosInput.required && !registro) input.setAttribute("required", "");
        } else {
            if (datosInput.required) input.setAttribute("required", "");
            if (registro) input.value = (datosInput.n_registro ? registro[datosInput.n_registro] : (registro[nombreElemento] ?? ""));
        }
        if(datosInput.intervalo) input.setAttribute("step", datosInput.intervalo);
        if(datosInput.minimo) input.setAttribute("min", datosInput.minimo);
        if(datosInput.maximo) input.setAttribute("max", datosInput.maximo);
        if(datosInput.desactivado) input.setAttribute("disabled", "");
        if(datosInput.readonly){
            if(datosInput.readonly === "crear" && !registro) input.setAttribute("readonly", "");
            else if(datosInput.readonly === "editar" && registro) input.setAttribute("readonly", "");
            else if(datosInput.readonly === "all") input.setAttribute("readonly", "");
        }
        if(datosInput.iclear) input.setAttribute("data-iclear", datosInput.iclear);
        if(datosInput.valori) input.setAttribute("data-default", datosInput.valori);
        div?.appendChild(input);

        if (datosInput.accion) {
            input.addEventListener("input", (e) => {
                datosInput.accion(e, div);
            });
        };

        if (datosInput.valor == "date" && !registro) {
            const fechaActual = new Date();
            const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
            const fechaTexto = fechaActual.toLocaleDateString('en-CA', opciones).replace(/\//g, '-');
            input.value = fechaTexto;
        } else if (datosInput.valor == "datetime" && !registro) {
            const fechaActual = new Date();
            const opciones = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
            const fechaTexto = fechaActual.toLocaleString('en-CA', opciones).replace(/\//g, '-').replace(", ", "T");
            input.value = fechaTexto;
        } else if (datosInput.valor && !registro) {
            input.value = datosInput.valor;
        }

        if (datosInput.accionload && !registro) {
            datosInput.accionload(input, div);
        }
        return input;
    }
    if (datosInput.forma === "textarea") {
        const textarea = crearElemento("textarea", { class: "form-control", id: elementoId, name: nombreElemento });
        if (datosInput.filas) textarea.setAttribute("rows", datosInput.filas);
        if (datosInput.required) textarea.setAttribute("required", "");
        if (registro) textarea.value = (datosInput.n_registro ? registro[datosInput.n_registro] : (registro[nombreElemento] ?? ""));
        if(datosInput.desactivado) textarea.setAttribute("disabled", "");

        div?.appendChild(textarea);
        return textarea;
    }
    if (datosInput.forma === "checkbox") {
        const checkbox = crearElemento("input", { class: "form-check-input p-2 mt-2", id: elementoId, name: nombreElemento, type: "checkbox", value: datosInput.valor });
        if (registro) checkbox.value = (datosInput.n_registro ? registro[datosInput.n_registro] : (registro[nombreElemento] ?? ""));

        if (datosInput.classlabel) {
            const errorDiv = crearElemento("div", { class: "invalid-feedback" });
            const divCheck = crearElemento("div", { class: "form-check pt-4" }, [checkbox, label, errorDiv]);
            div?.appendChild(divCheck);
        }else {
            div?.appendChild(checkbox);
        }

        if (datosInput.accion) {
            checkbox.addEventListener("change", (e) => {
                datosInput.accion(e, div);
            });
        };
        return checkbox;
    }
    if (datosInput.forma === "select") {
        const select = crearElemento("select", { class: "form-select", id: elementoId, name: nombreElemento });
        if (datosInput.required) select.setAttribute("required", "");
        if (datosInput.desactivado) select.setAttribute("disabled", "");
        if (datosInput.multiple && !registro){
            select.setAttribute("multiple", "");;
        } else if(datosInput.multiple && registro){
            const nuevoNombre = nombreElemento.replace("[]", "");
            select.setAttribute("name", nuevoNombre);
        }
        
        let selectize = null;
        if (datosInput.opciones) {
            const msgOpcion = crearElemento('option', {value: ""}, ["-- Elija una opción --"]);
            select.appendChild(msgOpcion);
            for (const opcion of datosInput.opciones) {
                const elemntoOpcion = crearElemento('option', {value: opcion.clave}, [opcion.valor]);
                if (registro && (opcion.clave == registro[nombreElemento] || opcion.clave == registro[datosInput.n_registro])) elemntoOpcion.selected = true;
                select.appendChild(elemntoOpcion);
            }
            if(datosInput.accion){
                select.addEventListener("change", (e) => {
                    datosInput.accion(e.target.value, div);
                });
            }
        } else if (datosInput.origen) {
            if (registro && datosInput.mensaje) { //cuando se edite un registro y se quiere obtener datos con un id en específico.
                const nuevoDatosInput = {...datosInput};
                nuevoDatosInput.origen = `${datosInput.origen}/${registro[datosInput.relacion]}`
                rellenarSelect(select, nuevoDatosInput, (datosInput.n_registro ? registro[datosInput.n_registro] : registro[nombreElemento]));
            } else if (datosInput.mensaje) {
                const msjOpcion = crearElemento('option', {value: ""}, [datosInput.mensaje], datosInput.accion ? {accion:datosInput.accion, div:div} : false);
                select.appendChild(msjOpcion);
            } else {
                rellenarSelect(select, datosInput, registro ? (datosInput.n_registro ? registro[datosInput.n_registro] : registro[nombreElemento]) : false, datosInput.accion ? {accion:datosInput.accion, div:div} : false);
            }
        } else {
            const msgOpcion = crearElemento('option', {value: ""}, [ datosInput.txtE ? `-- ${datosInput.txtE} --` : "-- No hay registros --"]);
            select.appendChild(msgOpcion);
        }

        div?.appendChild(select);
        return select;
    }
}

/**
 * Crea un formulario en una tabla.
 * @param {HTMLElement} tBodyR - El cuerpo de la tabla.
 * @param {Object} datosVista - Los datos de la vista.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - El contenedor de alertas.
 * @param {Object[]} datosVista.contenidoTabla - El contenido de la tabla.
 * @param {HTMLElement} datosVista.tBody - El cuerpo de la tabla.
 * @param {string} datosVista.URL_FORM - La URL para enviar el formulario.
 * @param {string} datosVista.URL_LISTAR - La URL para listar los registros.
 * @param {Object[]} datosVista.camposDeFormulario - Array de los campos del formulario.
 * @param {Object} datosVista.estiloTd - El estilo de las celdas de la tabla.
 * @param {Object[]} [datosVista.datosExtra] - Datos adicionales para enviar en el formulario.
 * @param {Object} [datosVista.registrosPropios] - Objeto con registros para mostrar en la tabla segun la clave del registro.
 * @param {Object} [registro] - Los datos de un registro.
 */
export const FilaDeRegistro = (tBodyR, datosVista, registro = null) => {
    const {
        contenidoTabla,
        contenedorDeAlertas,
        tBody,
        URL_FORM,
        URL_LISTAR,
        camposDeFormulario,
        registrosPropios,
        estiloTd,
        datosExtra
    } = datosVista;

    // Crear la fila de la tabla con los campos del formulario.
    const tr = crearElemento("tr");
    const referencias = [];
    for (const input of camposDeFormulario) {
        const td = crearElemento("td");
        if (input === null) {
            td.textContent = "-";
            tr.appendChild(td);
            continue;
        }
        if (registro && input?.editar === false){
            td.textContent = "-";
            tr.appendChild(td);
            continue;
        }
        if (!registro && input?.editar === true){
            td.textContent = "-";
            tr.appendChild(td);
            continue;
        }
        const nuevoInput = CrearInput(input);
        td.appendChild(nuevoInput);
        tr.appendChild(td);
        referencias.push({forma: input.forma, elemento: nuevoInput, tipo: input.tipo, nombre: input.nombre});
    }
    const icono = crearElemento("i", { class: "bi bi-plus-lg" });
    const btn = crearElemento("button", { class: "btn btn-primary" }, [icono, " Guardar"]);
    const td = crearElemento("td", undefined, [btn]);
    tr.appendChild(td);
    tBodyR.appendChild(tr);

    const realizarRegistro = async () => {
        const urlTabla = URL_LISTAR ? (typeof(URL_LISTAR) === "function" ? URL_LISTAR() : URL_LISTAR) : URL_FORM;
        let listaDeRegistros = await obtenerDatos(urlTabla);
        contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody, registrosPropios)
        alertaDeExito(contenedorDeAlertas, "Registro exitoso");
    }
    const errorRegistro = () => {
        alertaDeError(contenedorDeAlertas, "No se pudo realizar el registro");
    }
    btn.addEventListener("click", async() => {
        btn.disabled = true;
        const datosFormulario = new FormData();
        for (const {forma, elemento, tipo, nombre} of referencias) {
            if (!elemento.checkValidity()) {
                elemento.reportValidity();
                btn.disabled = false;
                return;
            } else {
                if(forma === "select" && elemento.value === ""){
                    elemento.selectize?.focus();
                    btn.disabled = false;
                    return;
                }
                datosFormulario.append(nombre, elemento.value);
            }
        }
        if (datosExtra ) {
            for (const dato of datosExtra) {
                datosFormulario.append(dato.key, dato.value);
            }
        }
        // Enviar los datos del formulario.
        try {
            const res = await fetch(URL_FORM, {body: datosFormulario, method: "POST"});
            if (res.ok) {
                const data = await res.json();
                // if (data.estado == "exito") {
                if (data[0] == "success") {
                    LimpiarFormTabla(referencias);
                    realizarRegistro();
                } else {
                    errorRegistro();
                }
            } else {
                errorRegistro();
            }
            btn.disabled = false;
        } catch (error) {
            errorRegistro();
            btn.disabled = false;
        }
    });
}

/**
 * Limpia los inputs de un formulario.
 * @param {Object[]} inputs - Array con los elementos "input".
 */
export const LimpiarFormTabla = (inputs) => {
    for (const {elemento} of inputs) {
        if (elemento.tagName === "SELECT" && elemento.selectize) {
            elemento.selectize.clear();
        }
        else {
            let tipo = elemento.getAttribute("type");
            if (elemento.type === "checkbox") {
                elemento.checked = false;
                const event = new Event("change");
                elemento.dispatchEvent(event);
            // Limpiar los inputs que no son de tipo "date" o "datetime-local" y que no tengan el atributo "data-iclear" con el valor "false".
            } else if (!(tipo === "date" || tipo === "datetime-local" || (elemento.getAttribute("data-iclear") && elemento.getAttribute("data-iclear") === "false") )) {
                // Mostrar el valor por defecto si existe.
                if(elemento.getAttribute("data-default")){
                    elemento.value = elemento.getAttribute("data-default");
                } else {
                    elemento.value = "";
                }
                const event = new Event("input");
                elemento.dispatchEvent(event);
            }
        }
    }
}