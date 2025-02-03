import { alertaDeError } from "../../../funciones/Alertas.js";
import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { Importar } from "./Importar.js";

/**
 * Botón para abrir y cargar la vista de importar tipos de asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaImportar - Elemento contenedor de la vista Importar.
 * @returns {HTMLButtonElement} Botón para abrir la vista de importar.
 */
export const BtnImportarTA = (datosVista) => {
    const icono = crearElemento("i", { class: "bi bi-file-earmark-arrow-down" });
    const boton = crearElemento("button", { class: "btn btn-info" }, [icono, " Importar tipos de asiento"]);
    Importar(datosVista);
    boton.addEventListener("click", () => {
        cambiarVista(datosVista.vistaPrincipal, datosVista.vistaImportar);
        const body = datosVista.vistaImportar.closest(".card-body");
        const div = datosVista.vistaImportar.querySelector(".table-responsive");
        const altura = body.offsetHeight  - (div.offsetTop);
        if (altura > 230) {
            div.setAttribute("style", `max-height: ${altura + 30}px`);
        }else {
            div.setAttribute("style", `max-height: 260px`);
        }
    });
    return boton;
}

/**
 * Botón para importar los tipos de asiento.
 * @param {string} url - URL para realizar la importación.
 * @param {Array} registros - Arreglo con los registros a importar.
 * @param {Object} opciones - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} opciones.vista - Elemento contenedor de la vista principal.
 * @param {HTMLElement} opciones.contenedor - Elemento contenedor de las alertas.
 * @param {function} opciones.accion - Acción a realizar después de la importación.
 * @returns {HTMLButtonElement} Botón para importar los tipos de asiento.
 */
export const ImportarTiposDeAsiento = (url, registros, opciones) => {
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

    const icono = crearElemento("i", { class: "bi bi-file-earmark-arrow-down" });
    const boton = crearElemento("button", { class: "btn btn-info" }, [icono, " Importar"]);
    boton.addEventListener("click", () => {
        const ImportarDeAdmin = async() => {
            let enviados = 0;
            let registrados = 0;
            let fallidos = 0;
        
            // Función para enviar un solo registro a la API
            const enviarRegistro = async (registro) => {
                const formData = new FormData();
                formData.append('nombre', registro.nombre);
                formData.append('detalle', registro.detalle);
                formData.append('empresa', empresa_id);
                formData.append('ver', 'creartipoasiento');
                try {
                    const response = await fetch(`${url}`, {
                        method: 'POST',
                        body: formData
                    });
                    enviados++;
                    if (response.ok) {
                        const res = await response.json();
                        if (res.ok == "success") {
                            registrados++;
                        } else {
                            fallidos++;
                        }
                    } else {
                        fallidos++;
                    }
                } catch (error) {
                    fallidos++;
                }
            };
        
            // Envío individual de cada registro
            for (const registro of registros) {
                await enviarRegistro(registro);
            }
            // Mostrar mensajes de acuerdo a los registros enviados
            if (enviados === registrados) {
                opciones.accion("Asientos importados correctamente.")();
            } else if (registrados > 0 && fallidos > 0) {
                opciones.accion("Algunos asientos no pudieron ser importados.")();
            } else {
                alertaDeError(opciones.contenedor, "Ocurrió un error al importar los asientos.");
            }
        };
        opciones.vista.appendChild(modalDeConfirmacion(ImportarDeAdmin, "¿Está seguro de importar los asientos?"));
    });
    return boton;
}