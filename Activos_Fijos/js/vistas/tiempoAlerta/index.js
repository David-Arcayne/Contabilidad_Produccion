import { enviarDatosObj, obtenerDatos } from "../../funciones/Solicitudes.js";
import { crearElemento } from "../../funciones/Funciones.js";
import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export async function TiempoAlerta(codigo, permisos) {
    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");

    const contenedorAlerta = crearElemento("div", { class: "mt-3" });
    vistaPrincipal.appendChild(contenedorAlerta);
   
    const seccionSeguros = seccion(permisos, contenedorAlerta, "Alerta seguros", "168", "alertaseguros");
    const seccionSituacion = seccion(permisos, contenedorAlerta, "Alerta situacion", "24", "alertasituacion");

    vistaPrincipal.append(seccionSeguros, seccionSituacion);
}

const seccion = (permisos, contenedorAlerta, titulo, tiempo, llave) => {
    const url = `./api/tiempo-alertas`;

    const button = crearElemento("button", { class: "btn btn-primary" }, ["Enviar"]);
    const input = crearElemento("input", { class: "form-control", placeholder: "ingrese el tiempo (hrs)" });
    const div = crearElemento("div", { class: "input-group" }, [input, button]);
    const divCol = crearElemento("div", { class: "col-md-auto mb-3" }, [div]);

    const span = crearElemento("span", { class: "fw-bold text-primary" }, [tiempo]);
    const span2 = crearElemento("span", { class: "text-primary" }, ["hrs."]);
    const p = crearElemento("p", { class: "shadow-sm p-3 bg-body-tertiary rounded fs-6 text-center text-md-start" }, ["Tiempo de anticipación: ", span, span2]);
    const divCol2 = crearElemento("div", { class: "col-md-auto" }, [p]);

    const divRow = crearElemento("div", { class: "row align-items-center" }, [divCol, divCol2]);
    const h3 = crearElemento("h3", { class: "mb-4" }, [titulo]);
    const section = crearElemento("section", { class: "mb-5" }, [h3, divRow]);

    (async () => {
        const datos = await obtenerDatos(`${url}?nombre=${llave}`);
        if (datos && datos.data) {
            const tiempo = datos.data.tiempo;
            if (tiempo) {
                span.textContent = tiempo;
            }
        }
    })();

    if (permisos.escritura === "0" || permisos.editar === "0") {
        divCol.remove();
    } else {
        button.addEventListener("click", () => {
            const texto = input.value;
            if (texto.trim() === "") {
                input.focus();
                return;
            }
    
            const accionEnviar = async() => {
                span.textContent = texto;
                alertaDeExito(contenedorAlerta, "Tiempo de anticipación actualizado correctamente");
                input.value = "";
            }
            const error = () => {
                alertaDeError(contenedorAlerta, "Ocurrió un error al actualizar el tiempo de anticipación");
                input.value = "";
            }
            const opciones = {
                datos: { nombre: llave, tiempo: texto},
                myUrl: `${url}`,
                redireccion: accionEnviar,
                error: error
            }
            enviarDatosObj(opciones);
        });
    }

    return section;
}