import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatosObj, obtenerDatos } from "../../../funciones/Solicitudes.js";
import { Importar } from "./Importar.js";

/**
 * Botón para abrir y cargar la vista de importar impuestos.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaImportar - Elemento contenedor de la vista Importar.
 * @returns {HTMLButtonElement} Botón para abrir la vista de importar.
 */
export const BtnImportarIm = (datosVista) => {
    const icono = crearElemento("i", { class: "bi bi-file-earmark-arrow-down" });
    const boton = crearElemento("button", { class: "btn btn-info" }, [icono, " Importar Impuestos"]);
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
 * Botón para importar los impuestos.
 * @param {string} url - URL para realizar la importación.
 * @param {Array} registros - Arreglo con los registros a importar.
 * @param {Object} opciones - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} opciones.vista - Elemento contenedor de la vista principal.
 * @param {HTMLElement} opciones.contenedor - Elemento contenedor de las alertas.
 * @param {function} opciones.accion - Acción a realizar después de la importación.
 * @returns {HTMLButtonElement} Botón para importar los impuestos.
 */
export const ImportarImpuestos = (url, registros, opciones) => {
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

    const icono = crearElemento("i", { class: "bi bi-file-earmark-arrow-down" });
    const boton = crearElemento("button", { class: "btn btn-info" }, [icono, " Importar todo"]);
    boton.addEventListener("click", () => {
        const Importar = async() => {
            let enviados = 0;
            let registrados = 0;
            let fallidos = 0;
        
            // Función para enviar un solo registro a la API
            const enviarRegistro = async (registro) => {
                const formData = new FormData();
                formData.append('codigo', registro.codigoimpuesto);
                formData.append('nombre', registro.nombreimpuesto);
                formData.append('tasa', registro.tasa);
                formData.append('descripcion', registro.descripcion);
                formData.append('idempresa', empresa_id);
                formData.append('ver', 'impuestocrear');
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
                opciones.accion("Impuestos importados correctamente.")();
            } else if (registrados > 0 && fallidos > 0) {
                opciones.accion("Algunos impuestos no pudieron ser importados.")();
            } else {
                alertaDeError(opciones.contenedor, "Ocurrió un error al importar los impuestos.");
            }
        };
        opciones.vista.appendChild(modalDeConfirmacion(Importar, "¿Está seguro de importar los registros?"));
    });
    return boton;
}

/**
 * Importar un registro de impuesto.
 * @param {string} url - URL para realizar la importación.
 * @param {string} URL_LT - URL para listar los registros de impuestos.
 * @param {HTMLElement} contAlertas - Contenedor de alertas.
 * @param {HTMLElement} vistaImportar - Contenedor de la vista de importar.
 * @param {Array} tablaImpuestos - Datos para actualizar la tabla de impuestos.
 * @returns {function} Función para importar un registro de impuesto.
 */
export const Individual = (url, URL_LT, contAlertas, vistaImportar, tablaImpuestos) => {
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

    return ({registro}) => {        
        const registrar = () => {
            const accionEnviar = async() => {
                // Obtener y actualizar los registros de la tabla de la vista principal.
                const listaDeRegistros = await obtenerDatos(URL_LT);
                if (listaDeRegistros) {
                    contenidoTBody(listaDeRegistros, ...tablaImpuestos);
                    alertaDeExito(contAlertas, "Importación exitosa")
                } else {
                    alertaDeError(contAlertas, "Ocurrio un error")
                }
            }
            const error = () => {
                alertaDeError(contAlertas, "Ocurrio un error")
            }

            // Enviar el registro a la API
            const datos = {
                codigo: registro.codigoimpuesto,
                nombre: registro.nombreimpuesto,
                tasa: registro.tasa,
                descripcion: registro.descripcion,
                idempresa: empresa_id,
                ver: 'impuestocrear'
            }
            const opciones = {
                datos: datos,
                myUrl: url,
                redireccion: accionEnviar,
                error: error
            }
            enviarDatosObj(opciones);

        }
        vistaImportar.appendChild(modalDeConfirmacion(registrar, "¿Esta seguro de importar este Impuesto?"));
    }
}