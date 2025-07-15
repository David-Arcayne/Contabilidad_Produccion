import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { crearElemento } from "../../funciones/Funciones.js";
import { formularioMetodoDpr, opcionesMetodoDeprId } from "./Formularios.js";
import { crearFormulario } from "../../funciones/CrearFormulario.js";
import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { cargarFormulario } from "../../targetas/cargarFormularios.js";
import { crearTargetas } from "../../targetas/cargartemplate.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export async function MetodoDepreciacion(codigo, permisos) {
    const URL = "./api/metodo-depreciacion";

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
   
    const contenedorPrincipal = vistaPrincipal.parentNode;

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    const contendorFormulario = crearElemento("div");
    const separador = crearElemento("hr", {class: "mt-3"});
    const contenedorContenido = crearElemento("div");

    const icono = crearElemento("i", {class: "bi bi-info-circle-fill"});
    const titulo = crearElemento("p", {class: "fs-6 text-success fw-semibold"}, [icono, " Método de depreciación de uso:"]);
    const contenido = crearElemento("p", {class: "text-center fs-5 text-uppercase fst-italic"});
    const div = crearElemento("div", {class: "col-md-5"}, [titulo, contenido]);
    const divContenedor = crearElemento("div", {class: "row justify-content-center mt-5"}, [div]);
    contenedorContenido.appendChild(divContenedor);

    // const iconoaf = crearElemento("i", {class: "bi bi-chevron-double-right"})
    // const btnAsignarActivos = crearElemento("button", {class: "btn btn-warning"}, [iconoaf, " Asignar activos fijos"]);
    // const divMixto = crearElemento("div", {class:"mt-5 d-none"}, [btnAsignarActivos]);

    contenedorPrincipal.append(contendorFormulario, separador, contenedorDeAlertas, contenedorContenido);

    const registro = await obtenerDatos(URL);
    if (registro && registro.data && registro.data.length != 0) {
        for (const opcion of opcionesMetodoDeprId) {
            if (opcion.clave == registro.data.metododepreciacion_id) {
                contenido.innerHTML = opcion.valor;
                // if (opcion.clave == 4) {
                //     divMixto.classList.remove("d-none");
                //     divMixto.classList.add("d-block");
                // }
                break;
            }
        }
    } else {
        const icono = crearElemento("i", {class: "bi bi-exclamation-triangle-fill"})
        const contenido = crearElemento("p", {class: "fs-6 text-center text-warning fw-semibold"}, [icono, "  Ningún método de depreciación selecionado."]);
        div.replaceChildren(contenido);
    }

    // btnAsignarActivos.addEventListener("click", () => {
    //     const formulario = cargarFormulario("asignardepreciacion", permisos.lectura + permisos.escritura + permisos.editar + permisos.eliminar);
    //     if(formulario) {
    //         crearTargetas(formulario, "Asignación de Depreciación", "asignardepreciacion");
    //     }
    // });

    // Creación del formulario
    if (permisos.escritura === "1") {
        const realizarRegistro = async (res) => {
            if (!registro.data) div.replaceChildren(titulo, contenido);
    
            for (const opcion of opcionesMetodoDeprId) {
                if (opcion.clave == res.metododepreciacion_id) {
                    contenido.innerHTML = opcion.valor;

                    // if (opcion.clave == 4) {
                    //     divMixto.classList.remove("d-none");
                    //     divMixto.classList.add("d-block");
                    // } else {
                    //     divMixto.classList.remove("d-block");
                    //     divMixto.classList.add("d-none");
                    // }
                    break;
                }
            }
            alertaDeExito(contenedorDeAlertas, "Método de depreciación cambiado");
        }
        const errorRegistro = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo realizar la operación");
        }
        const datosFormulario = {
            myurl: URL,
            accionEnviar: realizarRegistro,
            error: errorRegistro,
            datosBtn: {
                btnClass: "btn btn-primary",
                columna: "col-12",
                nombre: "Cambiar",
            },
        }
        const nuevoformulario = crearFormulario(formularioMetodoDpr, datosFormulario);
        contendorFormulario.appendChild(nuevoformulario);
    } else {
        separador.remove();
    }
}