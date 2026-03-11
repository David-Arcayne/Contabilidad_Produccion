import { CT_URLAPI, getEmpresaId } from "./DatosAuxiliares.js";
import { crearElemento, formatoFecha, formatoFechaHora, obtenerFechaActual } from "./Funciones.js";
import { modalFijo, modalRemovible } from "./Modals.js";
import { manejarEnvioFormulario, obtenerDatos, reiniciarFormulario } from "./Solicitudes.js";

/**
 * Función: Crea un formulario con los "inputs" requeridos.
 * Descripción: Esta función crea un formulario dinámicamente basado en una lista de entradas y datos adicionales proporcionados.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Crea un formulario con los "inputs" requeridos.
 * @param {DatosInput[]} inputs - Array de objetos con valores para crear "inputs".
 * @param {DatosCrearFormulario} datosFormulario - Datos adicionales para el formulario.
 * @param {Object} [registro] - Dato del registro, en acaso de editar.
 * @param {boolean} [centrar] - Indica si centrar el formulario.
 */
export function crearFormulario (inputs, datosFormulario, registro, centrar = false) {
    const form = crearElemento("form", { class: `row g-3 ${centrar ? "justify-content-center" : ""} align-items-end` });

    const fragmentFormulario = document.createDocumentFragment();

    for (const input of inputs) {
        // Verificar si el input debe ser mostrado o no
        if (!input) continue;
        if (registro && input?.editar === false) continue;
        if (!registro && input?.editar === true) continue;

        // Crear input oculto
        if (input?.forma === "hidden") {
            const hidden = crearElemento("input", { type: "hidden", id: input.id });
            if (input.nombre) hidden.setAttribute("name", input.nombre);
            if (input.valor) hidden.setAttribute("value", input.valor);
            fragmentFormulario.appendChild(hidden);
            continue;
        }
        // Crear sección de formulario con título
        if (input?.seccion) {
            const tituloSeccion = crearElemento("p", {class: "text-center mt-4 mb-1 fs-6"}, [input.detalle]);
            const hr = crearElemento("hr");
            const divSeccion = crearElemento("div", {class: "row pe-0"}, [tituloSeccion, hr]);
            for (const item of input.seccion) {
                if (registro && item?.editar === false) continue;
                if (!registro && item?.editar === true) continue;
                divSeccion.appendChild(crearCampoFormulario(item, registro));
            }
            fragmentFormulario.appendChild(divSeccion);
            continue;
        }
        // Crear campo de un botón que abre un modal con campos pertenecientes al formulario
        if (input?.botonConSeccionModal) {
            const [modal, cuerpoModal, cerrarModal] = modalFijo({estiloModal: input.estiloModal || "width: 1380px;"});
            modal.classList.add("mt-0");
            const campoBoton = crearElemento("button", { class: "btn btn-info w-100 focus-ring", id: input.id, type: "button" }, [input.textoBoton]);
            const divCampoBoton = crearElemento("div", { class: (input.clasesColumna ? input.clasesColumna : "col-md-6 col-lg-4") }, [campoBoton]);
            const divCamposFormulario = crearElemento("div", { class: "row g-3" });
            modal.appendChild(divCamposFormulario);

            // Agregar los campos dentro del modal
            for (const item of input.botonConSeccionModal) {
                if (registro && item?.editar === false) continue;
                if (!registro && item?.editar === true) continue;
                divCamposFormulario.appendChild(crearCampoFormulario(item, registro));
            }
            cuerpoModal.appendChild(divCamposFormulario);
            fragmentFormulario.appendChild(modal);
            fragmentFormulario.appendChild(divCampoBoton);

            campoBoton.addEventListener("click", (e) => {
                e.preventDefault();
                modal.classList.remove("d-none");
            });
            continue;
        }
        fragmentFormulario.appendChild(crearCampoFormulario(input, registro));
    }
    form.appendChild(fragmentFormulario);

    // Manejo del envío del formulario
    if (datosFormulario.urlSolicitud) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();


            const opciones = {
                camposAdicionales: datosFormulario.camposAdicionales,
                camposCondicionales: datosFormulario.camposCondicionales,
                callbackExito: datosFormulario.callbackExito,
                callbackError: datosFormulario.callbackError,
                refFormulario: form,
                urlSolicitud: datosFormulario.urlSolicitud,
                esperarPromesa: datosFormulario.esperarPromesa,
            }
            // Ejecutar callback previo a la solicitud si existe
            if (datosFormulario.callbackPreviaSolicitud) {
                const botonEnviar = form.querySelector("#btn-enviar-formulario");
                if (botonEnviar) {
                    // Deshabilitar botón de enviar mientras se ejecuta la función previa
                    botonEnviar.disabled = true;
                    botonEnviar.removeAttribute("data-in-form");
                }

                await datosFormulario.callbackPreviaSolicitud(() => manejarEnvioFormulario(opciones), form);
                if (botonEnviar) {
                    // Habilitar botón de enviar después de la función previa solo si no se ejecuto 'manejarEnvioFormulario'
                    // Esto permite que la función previa controle el envío del formulario y el estado del botón de enviar, evitando habilitarlo si la función previa aún está procesando o si ya se ejecutó el envío del formulario.
                    if (botonEnviar.dataset.inForm) {
                        botonEnviar.removeAttribute("data-in-form");
                    } else {
                        botonEnviar.disabled = false;
                    }
                }
            } else {
                manejarEnvioFormulario(opciones);
            }
        });
    }
    // Agregar botones al formulario
    if (datosFormulario.opcionesParaBotones){
        form.appendChild(crearBotonesDeFormulario(datosFormulario.opcionesParaBotones, form));
    }

    return form;
}

/**
 * Función: Crea un campo del formulario.
 * Descripción: Esta función crea un campo de formulario basico completo con su label, input y div de error.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Crea un campo del formulario.
 * @param {DatosInput} datosInput - Los datos del input.
 * @param {Object} registro - El registro actual.
 * @returns {HTMLDivElement}
 */
function crearCampoFormulario(datosInput, registro) {
    const elementoId = datosInput.id;
    const div = crearElemento("div", { class: (datosInput.clasesColumna ? datosInput.clasesColumna : "col-md-6 col-lg-4") });
    if (datosInput.ocultar) div.classList.add("d-none");

    let label = "";
    if (datosInput.label) {
        let textoLabel = [];
        textoLabel.push(datosInput.label);
        let esRequerido = false;
        if (datosInput.requerido === "siempre" || datosInput.requerido === true) esRequerido = true;
        else if (datosInput.requerido === "al_crear" && !registro) esRequerido = true;
        else if (datosInput.requerido === "al_editar" && registro) esRequerido = true;
        if(esRequerido && ["input", "select", "textarea"].includes(datosInput.forma)){
            const asterisco = crearElemento("span", {class: "text-danger fw-bold"}, ["*"]);
            textoLabel = [textoLabel, " ", asterisco];
        }
        label = crearElemento("label", { class: datosInput.clasesLabel || "form-label", for: elementoId }, textoLabel);
        if (!datosInput.clasesLabel) {
            div.appendChild(label);
        }
    }

    // Agregar div de información entre el label y el input
    if (datosInput.divInformacion) {
        const divInformacion = crearElemento("div", { class: "text-primary", "data-name": "div-info" });
        div.appendChild(divInformacion);
    }

    const elementoInput = crearInput(datosInput, registro, div);
    const errorDiv = crearElemento("div", { class: "invalid-feedback" });

    const opcionesBotonesInput = datosInput.opcionesInput;
    if (opcionesBotonesInput) {
        // Manejar opciones de botones junto al input
        // Crear contenedores para el input y los botones
        const divInput = crearElemento("div", { class: "flex-grow-1" }, [elementoInput]);
        const divBotones = crearElemento("div", { class: "col-auto", style: "display: flex; gap: 2px; margin-left: 2px;" });
        const divPrincipal = crearElemento("div", { class: "d-flex align-items-center" }, [divInput, divBotones]);
        div.appendChild(divPrincipal);
        div.appendChild(errorDiv);

        if (opcionesBotonesInput.botones) {
            const botones = opcionesBotonesInput.botones;
            if (Array.isArray(botones)) {
                for (const boton of botones) {
                    boton.classList.add("rounded-1");
                    divBotones.appendChild(boton);
                }
            } else {
                botones.classList.add("rounded-1");
                divBotones.appendChild(botones);
            }
        }
        opcionesBotonesInput.callback?.({divBotones, contenedorInput: div, elementoInput, registro});
    } else {
        if (datosInput.forma === "checkbox" && datosInput.clasesLabel) {
            const divCheck = crearElemento("div", { class: "form-check fs-6" }, [elementoInput, label, errorDiv]);
            div.appendChild(divCheck);
        } else {
            div.appendChild(elementoInput);
            div.appendChild(errorDiv);
        }
    }

    return div;
}

/**
 * Función: Crea un elemento de formulario.
 * Descripción: Esta función crea diferentes tipos de elementos de formulario (input, textarea, checkbox, select, button) basados en los datos proporcionados.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/**
 * Crea un elemento de formulario.
 * @param {DatosInput} datosInput - Los datos del input.
 * @param {Object} [datosRegistro] - Los datos del registro.
 * @param {HTMLDivElement} [div] - Elemento que contiene el input.
 * @param {HTMLElement} [tabla] - La tabla donde se encuentra el input.
 * @returns {HTMLElement}
 */
function crearInput(datosInput, datosRegistro, div, tabla) {
    if (datosRegistro && datosInput?.editar === false){
        return "-";
    }
    if (!datosRegistro && datosInput?.editar === true){
        return "-";
    }

    const elementoId = datosInput.id;
    const nombreElemento = datosInput.nombre;

    const valorElemento = typeof(datosInput.valor) === "function" ? datosInput.valor() : datosInput.valor;
    const tipoFecha = datosInput.tipo === "date" ? "fecha" : (datosInput.tipo === "datetime-local" ? "fecha-hora" : null);
    const llaveDelRegistro = datosInput.llaveRegistro ? datosInput.llaveRegistro : nombreElemento;
    const valorDelRegistro = datosRegistro ? datosRegistro[llaveDelRegistro] : null;

    if (datosInput.forma === "input") {
        const input = crearElemento("input", { class: datosInput.clasesInput ? datosInput.clasesInput : "form-control", id: elementoId, name: nombreElemento, type: datosInput.tipo });
        if (datosInput.tipo !== "file" && datosRegistro) {
            // Asignar valor según la llaveDelRegistro si se proporciona un registro
            input.value = tipoFecha === "fecha" ? (valorDelRegistro?.slice(0, 10) ?? "") : (valorDelRegistro ?? "");
        }
        // Asignar attributos al input
        if (datosInput.requerido === "siempre" || datosInput.requerido === true) input.required = true;
        else if (datosInput.requerido === "al_crear" && !datosRegistro) input.required = true;
        else if (datosInput.requerido === "al_editar" && datosRegistro) input.required = true;
        if (datosInput.tipo === "number") input.setAttribute("onkeydown", "return event.key !== 'e' && event.key !== 'E'");
        if (datosInput.intervalo) input.setAttribute("step", datosInput.intervalo);
        if (datosInput.valorMinimo) input.setAttribute("min", datosInput.valorMinimo);
        if (datosInput.valorMaximo) input.setAttribute("max", datosInput.valorMaximo);
        if (datosInput.desactivado) input.disabled = true;
        if (datosInput.mantenerValor) input.dataset.keep = datosInput.mantenerValor;
        if (datosInput.valorPorDefecto) input.dataset.default = datosInput.valorPorDefecto;
        if (datosInput.soloLectura){
            if (datosInput.soloLectura === "al_crear" && !datosRegistro) input.setAttribute("readonly", "");
            else if (datosInput.soloLectura === "al_editar" && datosRegistro) input.setAttribute("readonly", "");
            else if (datosInput.soloLectura === "siempre") input.setAttribute("readonly", "");
        }
        // Asignar valor si no se proporciona un registro
        if (valorElemento && !datosRegistro) {
            if (tipoFecha && (valorElemento === "fecha" || valorElemento === "fecha-hora")) {
                input.value = obtenerFechaActual(tipoFecha);
            } else {
                input.value = valorElemento;
            }
        }
        // Detectar cambios en el input
        if (datosInput.callbackInput) {
            input.addEventListener("input", (e) => {
                datosInput.callbackInput(e, tabla ?? div);
            });
        }
        // Ejecutar función al cargar el input
        if (datosInput.callbackAlCargar && !datosRegistro) {
            datosInput.callbackAlCargar(input, tabla ?? div);
        }

        return input;
    }
    if (datosInput.forma === "textarea") {
        const textarea = crearElemento("textarea", { class: datosInput.clasesInput ? datosInput.clasesInput : "form-control", id: elementoId, name: nombreElemento });
        if (datosInput.filas) textarea.setAttribute("rows", datosInput.filas);
        if (datosInput.requerido === "siempre" || datosInput.requerido === true) textarea.required = true;
        else if (datosInput.requerido === "al_crear" && !datosRegistro) textarea.required = true;
        else if (datosInput.requerido === "al_editar" && datosRegistro) textarea.required = true;
        if (datosRegistro) textarea.value = (valorDelRegistro ?? "");
        if (datosInput.desactivado) textarea.disabled = true;

        return textarea;
    }
    if (datosInput.forma === "checkbox") {
        const checkbox = crearElemento("input", { class: datosInput.clasesInput ? datosInput.clasesInput : "form-check-input fs-6", id: elementoId, name: nombreElemento, type: "checkbox", value: valorElemento });

        // Asignar atributos y valores al checkbox
        if (datosRegistro) {
            if (datosInput.arregloDeValores) checkbox.checked = datosInput.arregloDeValores.includes(valorDelRegistro);
            else checkbox.checked = (valorDelRegistro === valorElemento)
        } else if (valorElemento) checkbox.checked = datosInput.activar ? true : false;
        if (datosInput.requerido === "siempre" || datosInput.requerido === true) checkbox.required = true;
        else if (datosInput.requerido === "al_crear" && !datosRegistro) checkbox.required = true;
        else if (datosInput.requerido === "al_editar" && datosRegistro) checkbox.required = true;
        if (datosInput.desactivado) checkbox.disabled = true;
        if(datosInput.mantenerValor) checkbox.dataset.keep = datosInput.mantenerValor;

        // Detectar cambios en el checkbox
        if (datosInput.callbackInput) {
            checkbox.addEventListener("change", (e) => {
                datosInput.callbackInput(e, tabla ?? div);
            });
        };
        return checkbox;
    }
    if (datosInput.forma === "select") {
        const select = crearElemento("select", { class: datosInput.clasesInput ? datosInput.clasesInput : "form-select", id: elementoId, name: nombreElemento });
        // Asignar atributos y valores al select
        if (datosInput.requerido === "siempre" || datosInput.requerido === true) select.required = true;
        else if (datosInput.requerido === "al_crear" && !datosRegistro) select.required = true;
        else if (datosInput.requerido === "al_editar" && datosRegistro) select.required = true;
        if (datosInput.desactivado) select.disabled = true;
        if(datosInput.mantenerValor) select.dataset.keep = datosInput.mantenerValor;
        if (datosInput.multiple && !datosRegistro){
            select.setAttribute("multiple", "");;
        } else if(datosInput.multiple && datosRegistro){
            const nuevoNombre = nombreElemento.replace("[]", "");
            select.setAttribute("name", nuevoNombre);
        }

        // Crea un input oculto para manejar el valor en caso de solo lectura (disabled), ya que los elementos deshabilitados no se envían en el formulario
        let inputOculto;
        if (datosInput.soloLectura) {
            if (datosInput.soloLectura === "al_crear" && !datosRegistro) select.disabled = true;
            else if (datosInput.soloLectura === "al_editar" && datosRegistro) select.disabled = true;
            else if (datosInput.soloLectura === "siempre") select.disabled = true;

            inputOculto = crearElemento("input", { type: "hidden", id: `${elementoId}-hidden`, name: nombreElemento });
            div.appendChild(inputOculto);
        }
        if (datosInput.datosRegistro || datosInput.urlSolicitud || datosInput.opcionesPredefinidas) {
            // Rellenar el select con las opciones proporcionadas
            if (datosRegistro) {
                manejarSelect(
                    select,
                    datosInput,
                    valorDelRegistro,
                    tabla ?? div,
                    inputOculto
                );
            } else {
                manejarSelect(
                    select,
                    datosInput,
                    valorElemento,
                    tabla ?? div,
                    inputOculto
                );
            }
        } else {
            const msgOpcion = crearElemento("option", {value: ""}, [ datosInput.mensajeVacio || "-- No hay registros --"]);
            select.appendChild(msgOpcion);
        }

        return select;
    }
    if (datosInput?.forma === "button") {
        const button = crearElemento("button", { class: datosInput.clasesInput ? datosInput.clasesInput : "btn btn-warning w-100 focus-ring", type: "button", id: datosInput.id }, [datosInput.nombre]);
        if (datosInput.desactivado) button.disabled = true;
        if (datosInput.callbackInput) {
            button.addEventListener("click", (e) => {
                datosInput.callbackInput(e, tabla ?? div);
            });
        }
        return button;
    }
}

/**
 * Función: Crea los botones para el formulario.
 * Descripción: Esta función crea los botones de enviar y cancelar para un formulario, con opciones personalizables.
 * Fecha: 10 de octubre de 2025
 * Autor: Joel Choque
 */
/** Crea los botones para el formulario.
 * @param {DatosBotonesFormulario} opcionesBtn - Las opciones para los botones del formulario.
 * @param {HTMLElement} form - El formulario al que se agregarán los botones.
 */
function crearBotonesDeFormulario(opcionesBtn, form) {
    // Crear botón Guardar
    const minWidth = "min-width: 120px";
    const botonGuardar = crearElemento("button", { class: `${opcionesBtn.clasesEnviar || "btn btn-primary"}`, type: "submit", id: "btn-enviar-formulario", style: minWidth }, [opcionesBtn.nombreEnviar || "Guardar"]);
    const divPrincipal = crearElemento("div", { class: `${opcionesBtn.clasesContenedor || "d-grid gap-2 gap-md-3 d-md-flex justify-content-md-center"}` }, [botonGuardar]);

    // Agregar botón Cancelar si se proporcionan opciones
    const existeCancelar = opcionesBtn.nombreCancelar || opcionesBtn.clasesCancelar || opcionesBtn.callbackCancelar;
    if (opcionesBtn.botonCancelar !== false && existeCancelar) {
        const botonCancelar = crearElemento("button", { class: `${opcionesBtn.clasesCancelar || "btn btn-secondary"}`, type: "button", id:"btn-cancelar-formulario", style: minWidth }, [opcionesBtn.nombreCancelar || "Cancelar"]);
        divPrincipal.appendChild(botonCancelar);

        botonCancelar.addEventListener("click", (evento) => {
            if (opcionesBtn.callbackCancelar) {
                opcionesBtn.callbackCancelar(evento, form);
                return;
            }
            evento.preventDefault();
            reiniciarFormulario(form);
        });
    }

    return divPrincipal;
}

/**
 * Función: Crea un campo de tipo input, textarea, checkbox o select.
 * Descripción: Estas funciones permiten crear campos de formulario comunes con su respectivo label y contenedor div.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea un campo de tipo input con su label y contenedor.
 * @param {DatosCampoInput} datosInput - Configuración del input.
 * @param {DatosCampoILabel} datosLabel - Configuración del label.
 * @param {DatosCampoIDiv} [datosDiv] - Configuración del div contenedor.
 * @returns {[HTMLInputElement, HTMLDivElement, HTMLLabelElement]|HTMLDivElement} El div contenedor o un array con los elementos [input, div, label].
 */
export function campoInput(datosInput, datosLabel, datosDiv) {
    const input = crearElemento(
        "input",
        { class: `form-control ${datosInput.agregarClases ?? ""}`, ...datosInput.atributos }
    );
    if (datosInput.atributos.type === "number") {
        input.setAttribute("onkeydown", "return event.key !== 'e' && event.key !== 'E'");
    }
    const label = crearElemento(
        "label",
        { class:`form-label ${datosLabel.agregarClases ?? ""}`, for: datosInput.atributos.id , ...datosLabel.atributos },
    );
    if (typeof(datosLabel.contenido) === "string") {
        if (datosInput.atributos.required) label.innerHTML = datosLabel.contenido + " <span class='text-danger fw-bold'>*</span>";
        else label.innerHTML = datosLabel.contenido;
    } else {
        label.appendChild(datosLabel.contenido);
    }

    const div = crearElemento(
        "div",
        { "data-id": `div-${ datosInput.atributos.id }`, ...datosDiv?.atributos },
        [label, input]
    );

    return datosInput.obtenerElementos === false ? div : [input, div, label];
}
/**
 * Crea un campo de tipo textarea con su label y contenedor.
 * @param {DatosCampoInput} datosTextarea - Configuración del textarea.
 * @param {DatosCampoILabel} datosLabel - Configuración del label.
 * @param {DatosCampoIDiv} [datosDiv] - Configuración del div contenedor.
 * @returns {[HTMLTextAreaElement, HTMLDivElement, HTMLLabelElement]|HTMLDivElement} El div contenedor o un array con los elementos [textarea, div, label].
 */
export function campoTextarea(datosTextarea, datosLabel, datosDiv) {
    const textarea = crearElemento(
        "textarea",
        { class: `form-control ${datosTextarea.agregarClases ?? ""}`, ...datosTextarea.atributos }
    );
    const label = crearElemento(
        "label",
        { class:`form-label ${datosLabel.agregarClases ?? ""}`, for: datosTextarea.atributos.id, ...datosLabel.atributos },
    );
    if (typeof(datosLabel.contenido) === "string") {
        if (datosTextarea.atributos.required) label.innerHTML = datosLabel.contenido + " <span class='text-danger fw-bold'>*</span>";
        else label.innerHTML = datosLabel.contenido;
    } else {
        label.appendChild(datosLabel.contenido);
    }

    const div = crearElemento(
        "div",
        { "data-id": `div-${ datosTextarea.atributos.id }`, ...datosDiv?.atributos },
        [label, textarea]
    );

    return datosTextarea.obtenerElementos === false ? div : [textarea, div, label];
}
/**
 * Crea un campo de tipo checkbox con su label y contenedor.
 * @param {DatosCampoInput} datosCheckbox - Configuración del checkbox.
 * @param {DatosCampoILabel} datosLabel - Configuración del label.
 * @param {DatosCampoIDiv} [datosDiv] - Configuración del div contenedor.
 * @returns {[HTMLInputElement, HTMLDivElement, HTMLLabelElement]|HTMLDivElement} El div contenedor o un array con los elementos [checkbox, div, label].
 */
export function campoCheckbox(datosCheckbox, datosLabel, datosDiv) {
    const checkbox = crearElemento(
        "input",
        { type: "checkbox", class: `form-check-input fs-6 ${datosCheckbox.agregarClases ?? ""}`, ...datosCheckbox.atributos }
    );
    const label = crearElemento(
        "label",
        { class:`form-check-label ${datosLabel.agregarClases ?? ""}`, for: datosCheckbox.atributos.id, ...datosLabel.atributos },
    );
    if (typeof(datosLabel.contenido) === "string") {
        // if (datosCheckbox.atributos.required) label.innerHTML = datosLabel.contenido + " <span class='text-danger fw-bold'>*</span>";
        // else
        label.innerHTML = datosLabel.contenido;
    } else {
        label.appendChild(datosLabel.contenido);
    }

    const divCheck = crearElemento(
        "div",
        { class: "form-check fs-6" },
        [checkbox, label]
    );
    const div = crearElemento(
        "div",
        { "data-id": `div-${ datosCheckbox.atributos.id }`, ...datosDiv?.atributos },
        [divCheck]
    );

    return datosCheckbox.obtenerElementos === false ? div : [checkbox, div, label];
}
/**
 * Crea un campo de tipo select con su label y contenedor.
 * @param {DatosCampoInput} datosSelect - Configuración del select.
 * @param {DatosCampoILabel} [datosLabel] - Configuración del label.
 * @param {DatosCampoIDiv} [datosDiv] - Configuración del div contenedor.
 * @returns {[HTMLSelectElement, HTMLDivElement, HTMLLabelElement]|HTMLDivElement} El div contenedor o un array con los elementos [select, div, label].
 */
export function campoSelect(datosSelect, datosLabel, datosDiv) {
    const select = crearElemento(
        "select",
        { class: `form-select ${datosSelect.agregarClases ?? ""}`, ...datosSelect.atributos }
    );
    if (datosSelect.atributos.multiple && !datosSelect.atributos.size) {
        select.size = 1;
    }
    const label = crearElemento(
        "label",
        { class:`form-label ${datosLabel.agregarClases ?? ""}`, for: datosSelect.atributos.id, ...datosLabel.atributos },
    );
    if (typeof(datosLabel.contenido) === "string") {
        if (datosSelect.atributos.required) label.innerHTML = datosLabel.contenido + " <span class='text-danger fw-bold'>*</span>";
        else label.innerHTML = datosLabel.contenido;
    } else {
        label.appendChild(datosLabel.contenido);
    }

    const div = crearElemento(
        "div",
        { "data-id": `div-${ datosSelect.atributos.id }`, ...datosDiv?.atributos },
        [label, select]
    );

    return datosSelect.obtenerElementos === false ? div : [select, div, label];
}
/**
 * Crea un campo de tipo input dentro de un grupo con su label y contenedor.
 * @param {DatosCampoInput} datosInput - Configuración del input.
 * @param {DatosCampoILabel} datosLabel - Configuración del label.
 * @param {DatosCampoIDiv} [datosDiv] - Configuración del div contenedor.
 * @returns {[HTMLInputElement, HTMLDivElement, HTMLLabelElement]|HTMLDivElement} El div contenedor o un array con los elementos [input, div, label].
 */
export function campoInputGroup(datosInput, datosLabel, datosDiv) {
    const input = crearElemento(
        "input",
        { class: `form-control form-control-sm ${datosInput.agregarClases ?? ""}`, ...datosInput.atributos }
    );
     if (datosInput.atributos.type === "number") {
        input.setAttribute("onkeydown", "return event.key !== 'e' && event.key !== 'E'");
    }
    const label = crearElemento(
        "label",
        { class:`input-group-text fw-bold px-2 ${datosLabel.agregarClases ?? ""}`, for: datosInput.atributos.id, ...datosLabel.atributos },
        [datosLabel.contenido]
    );
    const divGroup = crearElemento(
        "div",
        { class: "input-group" },
        [label, input]
    );

    const div = crearElemento(
        "div",
        { "data-id": `div-${ datosInput.atributos.id }`, class:"col col-auto", ...datosDiv?.atributos },
        [divGroup]
    );

    return datosInput.obtenerElementos === false ? div : [input, div, label];
}
/**
 * Crea un campo de tipo select dentro de un grupo con su label y contenedor.
 * @param {DatosCampoInput} datosSelect - Configuración del select.
 * @param {DatosCampoILabel} datosLabel - Configuración del label.
 * @param {DatosCampoIDiv} [datosDiv] - Configuración del div contenedor.
 * @returns {[HTMLSelectElement, HTMLDivElement, HTMLLabelElement]|HTMLDivElement} El div contenedor o un array con los elementos [select, div, label].
 */
export function campoSelectGroup(datosSelect, datosLabel, datosDiv) {
    const select = crearElemento(
        "select",
        { class: `form-select form-select-sm ${datosSelect.agregarClases ?? ""}`, ...datosSelect.atributos }
    );
    const label = crearElemento(
        "label",
        { class:`input-group-text fw-bold px-2 ${datosLabel.agregarClases ?? ""}`, for: datosSelect.atributos.id, ...datosLabel.atributos },
        [datosLabel.contenido]
    );
    const divGroup = crearElemento(
        "div",
        { class: "input-group" },
        [label, select]
    );

    const div = crearElemento(
        "div",
        { "data-id": `div-${ datosSelect.atributos.id }`, class:"col col-auto", ...datosDiv?.atributos },
        [divGroup]
    );

    return datosSelect.obtenerElementos === false ? div : [select, div, label];
}


/**
 * Maneja la creación de un select con datos obtenidos de una API o con opciones predefinidas.
 * @param {HTMLSelectElement} select - El elemento select que se desea manejar.
 * @param {DatosSelect} datosSelect - Los datos del select.
 * @param {string|boolean} [valorOpcion=false] - El id del valor que se desea seleccionar por defecto.
 * @param {HTMLElement|boolean} [contenedorSelect=false] - El contenedor del select.
 * @param {HTMLInputElement} [inputOculto=null] - Un input oculto para almacenar el valor seleccionado si el select está en modo solo lectura.
 */
export const manejarSelect = async (select, datosSelect, valorOpcion = false, contenedorSelect = false, inputOculto = null) => {

    // Si se proporcionaron opciones predefinidas, crear el select simple con esas opciones
    if (datosSelect.opcionesPredefinidas) {
        selectBasico(select, datosSelect, valorOpcion, contenedorSelect, inputOculto);
        return;
    }

    // Deshabilitar el select y si el select ya está instanciado con Selectize, destruye la instancia antes de continuar
    selectEnEspera(select)

    if (select.multiple && !datosSelect.multiple) datosSelect.multiple = true;

    // Obtener los datos de una url o de los datos proporcionados
    let opcionesSelect;
    if (datosSelect.datosRegistro) {
        const obtener = datosSelect.datosRegistro;
        opcionesSelect = typeof obtener === "function" ? await obtener() : await obtener;
    } else if (datosSelect.urlSolicitud) {
        const url = typeof datosSelect.urlSolicitud === "function" ? datosSelect.urlSolicitud() : datosSelect.urlSolicitud;
        opcionesSelect = await obtenerDatos(url);
    }

    select.innerHTML = "";

    // Si no datos para mostrar, crea una opción indicando que no hay registros
    if (!Array.isArray(opcionesSelect) || !opcionesSelect.length) {
        select.innerHTML = `<option value="">${datosSelect.mensajeVacio ?? "No hay registros"}</option>`;
        if (!datosSelect.desactivado) select.disabled = false;
        if (select.multiple) select.size = 1;
        return;
    }

    // Creación de las opciones del select
    // Crear un elemento <option>
    const crearOpcion = (value, text, clases = []) => {
        const opcion = document.createElement("option");
        opcion.value = value;
        opcion.innerHTML = text ?? value;
        if (clases.length) opcion.classList.add(...clases);
        return opcion;
    };
    // obtener el dato para el atributo 'value'
    const obtenerValor = (dato) => {
        const { valor } = datosSelect.llavesOpciones;
        return Array.isArray(valor)
            ? valor.map(llave => dato[llave]).join("|") // TODO: verificar
            : dato[valor];
    };
    // Obtener el contenido la de opcion
    const obtenerTexto = (dato) => {
        const llaveDetalle = datosSelect.llavesOpciones.detalle;
        if (typeof llaveDetalle === "string") return dato[llaveDetalle] ?? "";

        let partes = [];

        for (const llave of llaveDetalle) {
            if (typeof llave === "string") {
                if (dato[llave]) partes.push(dato[llave]);
                continue;
            }
            // objeto: { tipo, dato }
            const valorTexto = dato[llave.dato];
            if (!valorTexto) continue;

            switch (llave.tipo) {
                case "fecha": partes.push(formatoFecha(valorTexto)); break;
                case "fecha-hora": partes.push(formatoFechaHora(valorTexto)); break;
                default: partes.push(valorTexto);
            }
        }
        return partes.join(": ");
    };
    // Seleccionar por defecto la opción correspondiente
    const marcarSeleccion = (opcion, dato) => {
        const { seleccionado, valor } = datosSelect.llavesOpciones;
        if (seleccionado && valorOpcion == dato[seleccionado]) {
            opcion.selected = true;
            if (inputOculto) inputOculto.value = dato[seleccionado];
        }
        else if (valorOpcion == dato[valor]) {
            opcion.selected = true;
            if (inputOculto) inputOculto.value = dato[valor];
        }
    };

    const fragment = document.createDocumentFragment();

    // Opción por defecto, si corresponde
    if (datosSelect.opcionPorDefecto !== false) {
        fragment.appendChild(crearOpcion("", datosSelect.mensajeOpcionPorDefecto ?? "-- Elija una opción --"));
    }

    // Opciones extra que se añaden al inicio del select, si corresponde
    if (Array.isArray(datosSelect.opcionesExtraInicio)) {
        for (const opcion of datosSelect.opcionesExtraInicio) {
            fragment.appendChild(crearOpcion(opcion.value, opcion.text));
        }
    }

    // Opciones de datos
    for (const dato of opcionesSelect) {
        const valor = obtenerValor(dato);
        const texto = obtenerTexto(dato);
        let clases = [];
        if (datosSelect.clasesOpcion && dato[datosSelect.clasesOpcion.llave] == datosSelect.clasesOpcion.valor) {
            clases = datosSelect.clasesOpcion.clases;
        }
        const opcion = crearOpcion(valor, texto, clases);
        if (valorOpcion) marcarSeleccion(opcion, dato);

        fragment.appendChild(opcion);
    }

    // Insertar todas las opciones de golpe
    select.appendChild(fragment);

    // Inicializar Selectize
    const contenedorSuperior = select.parentNode;
    const $sel = $(select);

    $sel.selectize({
        plugins: ["remove_button"],
        openOnFocus: false,
        selectOnTab: false,

        onChange: function (value) {
            datosSelect.callbackInput?.(value, contenedorSelect ?? undefined);
        },
        onFocus: function () {
            if (!this.ignoreFocusOpen) this.open();
        },

        onInitialize: function () {
            // Obtener los elementos creados por Selectize
            const instancia = this;
            // const dropdownContent = instancia.$dropdown_content;     // El contenedor del dropdown
            const input = instancia.$control_input[0]; // El input de control
            if (instancia.$control[0].children.length === 1) input.removeAttribute("style");

            datosSelect.callbackAlCargar?.(instancia, contenedorSuperior);
        },

        async onItemAdd(value) {
            if (!datosSelect.panelDetalle) return;
            // Mantener abierto el dropdown
            this.open();
            // Eliminar cualquier panel de detalle existente
            document.querySelectorAll(".menu-detalle").forEach(el => el.remove());

            const opt = this.getOption(value); // obtine el <div> del dropdown
            if (!opt?.length) return;

            const datos = await datosSelect.panelDetalle(value);
            if (!datos) return;

            if (!this.isOpen) return;

            const contenedor = document.createElement("div");
            contenedor.className = "menu-detalle";
            contenedor.appendChild(datos);

            const rect = opt[0].getBoundingClientRect();
            Object.assign(contenedor.style, {
                position: "absolute",
                top: rect.top + "px",
                left: rect.right + 10 + "px",
                background: "#fff",
                border: "1px solid #ccc",
                padding: "5px 10px",
                borderRadius: "5px",
                zIndex: 9999
            });

            document.body.appendChild(contenedor);
        },

        onDropdownOpen() {
            // Cerrar otros selects abiertos
            $(".selectized").each((_, el) => {
                const otros = el.selectize;
                if (otros && otros !== this) {
                    otros.close();
                    otros.blur();
                }
            });
        },
        onDropdownClose() {
            // Eliminar el panel de detalle al cerrar el dropdown
            if (datosSelect.panelDetalle) {
                document.querySelectorAll(".menu-detalle").forEach(el => el.remove());
            }
        },

        onItemRemove() {
            // Eliminar el panel de detalle al eliminar un ítem
            if (datosSelect.panelDetalle) {
                document.querySelectorAll(".menu-detalle").forEach(el => el.remove());
            }
        }
    });

    const instanciaSelectize = select.selectize;
    const divSelect = contenedorSuperior.querySelector(".selectize-input");
    if (!datosSelect.multiple) divSelect.style.display = "inline-flex";

    // Agregar opciones extra al final del listado, si corresponde
    if (Array.isArray(datosSelect.opcionesExtra)) {
        for (const opcion of datosSelect.opcionesExtra) {
            instanciaSelectize.addOption(opcion);
        }
    }

    datosSelect.desactivado || datosSelect.soloLectura ? instanciaSelectize.disable() : instanciaSelectize.enable();
};

/** Rellena un elemento select con opciones predefinidas.
 * @param {HTMLSelectElement} select - El elemento select a rellenar.
 * @param {DatosSelectSimple} datosSelect - Los datos necesarios para rellenar el select.
 * @param {string} [valorOpcion=false] - El id de la opción que se debe seleccionar por defecto.
 * @param {HTMLElement} [contenedorSelect=null] - El contenedor del select.
 */
export function selectBasico(select, datosSelect, valorOpcion = false, contenedorSelect = null, inputOculto = null) {
    // Opción por defecto, si corresponde
    if (datosSelect.opcionPorDefecto !== false) {
        const msgOpcion = crearElemento("option", { value: "" }, [datosSelect.mensajeOpcionPorDefecto || "-- Elija una opción --"]);
        select.appendChild(msgOpcion);
    }
    for (const opcion of datosSelect.opcionesPredefinidas) {
        const elementoOpcion = crearElemento("option", { value: opcion.clave }, [opcion.valor]);
        if (valorOpcion && (opcion.clave == valorOpcion)) {
            elementoOpcion.selected = true;
            if (inputOculto) inputOculto.value = opcion.clave;
        }
        select.appendChild(elementoOpcion);
    }
    if (datosSelect.callbackInput) {
        select.addEventListener("change", (e) => {
            datosSelect.callbackInput(e.target.value, contenedorSelect);
        });
    }
}

// Deshabilita un select y muestra un mensaje de carga.
export function selectEnEspera(select, mensaje = "cargando...") {
    select.selectize?.destroy();
    select.disabled = true;
    select.innerHTML = `<option value="">${mensaje}</option>`;
}

/**
 * Función: Formulario para asignar un asiento modelo o una transacción.
 * Descripción: Esta función crea un formulario dentro de un modal para asignar un asiento modelo o una transacción.
 * Fecha: 25 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Formulario para asignar un asiento modelo o una transacción.
 * @param {string} [prefijoId="__aamot"] - Un prefijo para los ids de los elementos del formulario, para evitar conflictos con otros elementos en la página.
 * @param {string} [tipo="todos"] - El tipo de registros a mostrar en los selects, puede ser "asiento", "transaccion" o "todos".
 * @param {string} [tituloModal] - El título del modal.
 * @returns {{form: HTMLFormElement, modal: HTMLElement, cerrarModal: function, botonAsignar: HTMLButtonElement}} Un objeto con el formulario, el modal y la función para cerrar el modal.
 */
export function formularioModalAsientoOTransaccion(
    prefijoId = "__aamot",
    tipo = "todos",
    tituloModal = "Asignar Asiento Modelo o Transacción"
) {
    const empresa_id = getEmpresaId();
    const URL = CT_URLAPI;

    // Estructura del modal
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({ tituloModal, estiloModal: "width: 400px; min-width: 240px" });

    // Definición de variables para elementos condicionales
    let selectAsiento, divAsiento;
    let selectTransaccion, divTransaccion;
    let inputFechaTrans, divFechaTrans;
    let inputGlosa, divGlosa;
    let selectCuenta, divCuenta;

    // Contenedores dinámicos
    const divCuentaYTipo = crearElemento("div", { class: "d-none col-12" });
    const elementosFormulario = [];

    // Creación de campos según el tipo
    const esTipoAsiento = tipo === "asiento" || tipo === "todos";
    const esTipoTransaccion = tipo === "transaccion" || tipo === "todos";

    // Sección Asiento Modelo
    if (esTipoAsiento) {
        [selectAsiento, divAsiento] = campoSelect(
            { atributos: { id: `${prefijoId}-asientomodelo`, name: "id_asientotipo", required: true } },
            { contenido: "Asiento Modelo" }
        );

        // Campos auxiliares para asiento
        [inputFechaTrans, divFechaTrans] = campoInput(
            { atributos: { id: `${prefijoId}-fechatrans`, name: "fecha_transaccion", type: "date", required: true, value: obtenerFechaActual(), disabled: true } },
            { contenido: "Fecha de transacción" },
            { atributos: { class: "d-none" } }
        );

        [inputGlosa, divGlosa] = campoInput(
            { atributos: { id: `${prefijoId}-glosa`, name: "glosa", type: "text", required: true } },
            { contenido: "Glosa" },
            { atributos: { class: "d-none" } }
        );

        elementosFormulario.push(divAsiento, divFechaTrans, divGlosa);
    }

    // Sección Transacción
    if (esTipoTransaccion) {
        [selectTransaccion, divTransaccion] = campoSelect(
            { atributos: { id: `${prefijoId}-transaccion`, name: "id_transaccion", required: true } },
            { contenido: "Transacción" }
        );

        // Elementos internos de transacción (se inyectan dinámicamente)
        [selectCuenta, divCuenta] = campoSelect(
            { atributos: { id: `${prefijoId}-cuenta`, name: "cuenta" } },
            { contenido: "Cuenta" },
            { atributos: { class: "mt-2" } },
        );

        // Radios para Tipo de operación
        const radios = [
            { val: "suma", label: "Agregar", req: true },
            { val: "reemplazo", label: "Reemplazar" },
            { val: "vincular", label: "Solo vincular" }
        ].map(({ val, label, req }) => {
            const [, div] = campoCheckbox(
                { atributos: { type: "radio", id: `${prefijoId}-${val}`, name: "tipo", value: val, required: req } },
                { contenido: label },
                { atributos: { class: "col col-auto" } }
            );
            return div;
        });
        const divTipoRegistro = crearElemento("div", { class: "d-flex flex-wrap gap-3 mt-2" }, radios);

        // Guardamos referencia a los elementos internos
        divCuentaYTipo._elementos = { divCuenta, divTipoRegistro };

        elementosFormulario.push(divTransaccion, divCuentaYTipo);
    }

    // Botones
    const btnAsignar = crearElemento("button", { class: "btn btn-primary", type: "submit", style: "min-width: 100px;" }, ["Asignar"]);
    const btnCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 100px;" }, ["Cancelar"]);
    const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-4 col-12" }, [btnAsignar, btnCancelar]);
    elementosFormulario.push(divBotones);

    // Renderizar formulario en el modal
    const formulario = crearElemento("form", { class: "row g-2" }, elementosFormulario);
    cuerpoModal.appendChild(formulario);

    // FUNCIONES con lógica de Control
    // Habilita/Deshabilita un selectize o select normal
    const toggleSelect = (selectElement, habilitar) => {
        if (!selectElement) return;
        if (selectElement.selectize) {
            habilitar ? selectElement.selectize.enable() : selectElement.selectize.disable();
            if (!habilitar) selectElement.selectize.clear();
        } else {
            selectElement.disabled = !habilitar;
            if (!habilitar) selectElement.value = "";
        }
    };
    // Muestra/Oculta div y habilita/deshabilita input asociado
    const toggleVisibility = (divElement, inputElement, mostrar) => {
        if (!divElement) return;
        if (mostrar) {
            divElement.classList.remove("d-none");
            if (inputElement) inputElement.disabled = false;
        } else {
            divElement.classList.add("d-none");
            if (inputElement) inputElement.disabled = true;
        }
    };
    // Callback: Selección de Asiento
    const procesarSeleccionAsiento = (valor) => {
        const seleccionado = !!valor;
        toggleVisibility(divGlosa, inputGlosa, seleccionado);
        toggleVisibility(divFechaTrans, inputFechaTrans, seleccionado);

        if (esTipoTransaccion) toggleSelect(selectTransaccion, !seleccionado);
    };
    // Callback: Selección de Transacción
    const procesarSeleccionTransaccion = (valor) => {
        const seleccionado = !!valor;

        if (esTipoAsiento) {
            toggleSelect(selectAsiento, !seleccionado);
            toggleVisibility(divFechaTrans, inputFechaTrans, false);
            toggleVisibility(divGlosa, inputGlosa, false);
        }

        if (seleccionado) {
            divCuentaYTipo.classList.remove("d-none");
            divCuentaYTipo.replaceChildren(divCuentaYTipo._elementos.divCuenta);

            manejarSelect(selectCuenta, {
                urlSolicitud: `${URL}listadetalletransaccion/${valor}`,
                llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
                callbackInput: (valCuenta) => {
                    const { divTipoRegistro } = divCuentaYTipo._elementos;
                    valCuenta ? divCuentaYTipo.appendChild(divTipoRegistro) : divTipoRegistro.remove();
                }
            });
        } else {
            divCuentaYTipo.classList.add("d-none");
            divCuentaYTipo.innerHTML = "";
            if (selectCuenta.selectize) selectCuenta.selectize.clear();
        }
    };

    // Inicialización de Datos
    (async () => {
        const promises = [];
        if (esTipoAsiento) {
            selectEnEspera(selectAsiento);
            promises.push(obtenerDatos(`${URL}listaasientos/${empresa_id}`));
        } else promises.push(null);

        if (esTipoTransaccion) {
            selectEnEspera(selectTransaccion);
            promises.push(obtenerDatos(`${URL}listatransacciones/${empresa_id}`));
        } else promises.push(null);

        const [dataAsientos, dataTransacciones] = await Promise.all(promises);

        if (esTipoAsiento && dataAsientos) {
            manejarSelect(selectAsiento, {
                datosRegistro: dataAsientos,
                llavesOpciones: { valor: "id", detalle: "nombre" },
                callbackInput: procesarSeleccionAsiento,
            });
        }

        if (esTipoTransaccion && dataTransacciones) {
             manejarSelect(selectTransaccion, {
                datosRegistro: dataTransacciones,
                llavesOpciones: { valor: "id", detalle: ["ntransaccion", "glosa"] },
                callbackInput: procesarSeleccionTransaccion,
            });
        }
    })();

    return { form: formulario, modal, cerrarModal, botonAsignar: btnAsignar  };
}

/**
 * Función: Agrega campos dinámicos al formulario de asignación de asiento modelo o transacción.
 * Descripción: Estas funciones permiten agregar campos adicionales al formulario según la selección del usuario.
 * Fecha: 22 de enero de 2026
 * Autor: Joel Choque
 */
/** Agrega campos dinámicos al formulario de asignación de transacción.
 * @param {string} prefijoId - El prefijo para los IDs de los campos.
 * @param {string} [clasesColuma="col-md-6 col-lg-4"] - Las clases CSS para el contenedor de los campos.
 * @returns {function} Una función que agrega los campos dinámicos según el valor seleccionado.
 */
export function agregarCamposTransaccion(prefijoId, clasesColuma = "col-md-6 col-lg-4") { // TODO: unir los parametros, manejar bien clasesColumna
    return (valorSelect, contenedor) => {
        const form = contenedor.closest("form");

        const cuenta = form.querySelector(`#${prefijoId}-cuenta`);
        const tipoRegistro = form.querySelector(`#${prefijoId}-tipo-transaccion`);
        cuenta ? cuenta.closest("div").remove() : null;
        tipoRegistro ? tipoRegistro.closest("div").remove() : null;

        if (valorSelect) {
            const [selectTipoRegistro, divTipoRegistro] = campoSelect(
                { atributos: {id: `${prefijoId}-tipo-transaccion`, name: "tipo"} },
                { contenido: "Tipo registro de cuenta", class: "col-12 d-none" },
                { atributos: { class: clasesColuma } }
            );
            selectTipoRegistro.innerHTML = `
                <option value="suma">Agregar</option>
                <option value="reemplazo">Reemplazar</option>
                <option value="vincular">Solo vincular</option>
            `;

            const manejarTipoRegistro = async (valor) => {
                if (valor) divCuenta.after(divTipoRegistro);
                else divTipoRegistro.remove();
            };
            const [selectCuenta, divCuenta] = campoSelect(
                { atributos: {id: `${prefijoId}-cuenta`, name: "cuenta"} },
                { contenido: "Cuenta" },
                { atributos: { class: clasesColuma } },
            );
            manejarSelect(selectCuenta, {
                urlSolicitud: `${CT_URLAPI}listadetalletransaccion/${valorSelect}`,
                llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
                callbackInput: manejarTipoRegistro
            });
            contenedor.after(divCuenta);
        }
    }
}

/**
 * Función: Agrega campos dinámicos al formulario de asignación de asiento modelo.
 * Descripción: Estas funciones permiten agregar campos adicionales al formulario según la selección del usuario.
 * Fecha: 22 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Agrega campos dinámicos al formulario de asignación de asiento modelo.
 * @param {string} prefijoId - El prefijo para los IDs de los campos.
 * @param {string} [clasesColuma="col-md-6 col-lg-4"] - Las clases CSS para las columnas.
 * @returns {function} Una función que agrega los campos dinámicos según el valor seleccionado.
 */
export function agregarCamposAsientoModelo(prefijoId, clasesColuma = "col-md-6 col-lg-4") { // TODO: unir los parametros, manejar bien clasesColumna
    return (valorSelect, contenedor) => {
        const form = contenedor.closest("form");
        const fechaTrans = form.querySelector(`#${prefijoId}-fechatrans`);
        fechaTrans ? fechaTrans.closest("div").remove() : null;
        if (valorSelect) {
            const [inputFechaTrans, divFechaTrans] = campoInput(
                { atributos: {id: `${prefijoId}-fechatrans`, name: "fecha_transaccion", type: "date", required: true, value: obtenerFechaActual()} },
                { contenido: "Fecha de transacción" },
                { atributos: { class: clasesColuma } }
            );
            contenedor.after(divFechaTrans);
        }
    }
}

/**
 * Función: Alterna entre la selección de transacción y asiento modelo en el formulario de asignación.
 * Descripción: Esta función habilita o deshabilita campos en el formulario según si el usuario selecciona una transacción o un asiento modelo.
 *              Además, muestra u oculta campos adicionales relacionados con cada tipo de selección.
 * Fecha: 22 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Alterna entre la selección de transacción y asiento modelo en el formulario de asignación.
 * @param {string} prefijoId - El prefijo para los IDs de los campos.
 * @param {HTMLElement} [contenedorPrincipal=null] - Un contenedor principal para buscar los campos, si no se proporciona se buscará en el contenedor del input que dispara el evento.
 * @returns {function} Una función que alterna los campos según la selección del usuario.
 */
export function alternarTransaccionYAsiento(prefijoId, contenedorPrincipal = null, clasesColuma = "col-md-6 col-lg-4") {
    return async (valor, contenedorInput) => {
        const form = contenedorPrincipal ?? contenedorInput.parentNode;
        let transaccion = contenedorInput.querySelector(`#${prefijoId}-transaccion`);
        if (transaccion) {
            const asiento = form.querySelector(`#${prefijoId}-asiento`);
            const sAsiento = asiento.selectize;
            agregarCamposTransaccion(prefijoId, clasesColuma)(valor, contenedorInput);
            if (valor) {
                sAsiento ? sAsiento.disable() : asiento.disabled = true;
            } else {
                sAsiento ? sAsiento.enable() : asiento.disabled = false;
            }
        } else {
            transaccion = form.querySelector(`#${prefijoId}-transaccion`);
            const sTransaccion = transaccion.selectize;
            agregarCamposAsientoModelo(prefijoId, clasesColuma)(valor, contenedorInput);
            if (valor) {
                sTransaccion ? sTransaccion.disable() : transaccion.disabled = true;
            } else {
                sTransaccion ? sTransaccion.enable() : transaccion.disabled = false;
            }
        }
    }
}