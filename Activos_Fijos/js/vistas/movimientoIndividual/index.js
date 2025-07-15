import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatosAlr, solicitudPDF } from "../../funciones/Solicitudes.js";
import { crearElemento, InputBusqueda, pdfYBusqueda } from "../../funciones/Funciones.js";
import { activosFijos } from "./Funcionalidades/ActivosFijos.js";
import { Estado } from "./Funcionalidades/Estado.js";
import { Reportes } from "./Funcionalidades/Reportes.js";
import { BotonPDF, VistaPDF } from "../../funciones/VistaPDF.js";
import { ContenidoPDF, MisBienesPDF } from "../movimientos/Funcionalidades/ContenidoPDF.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function MovimientoIndividual(codigo, permisos) {
    const URL = "./api/movimientos/individual";

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaActivosFijos = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaActivosFijos.setAttribute("class", "d-none");

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    const encabezadoTabla = [
        "Encargado",
        "Fecha",
        // "Personal",
        "Título",
        // "Sucursal",
        // "Área de trabajo",
        "Estado",
        "Opciones"
    ];
    const estiloTd = [
        "text-start",
        "datetime",
        // "text-start",
        "text-start",
        // "text-start",
        // "text-start",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "nombreencargado",
        "fecharespuesta",
        // "nombrepersonal",
        "detalle",
        // "nombresucursal",
        // "nombredepartamento",
        {
            nombre: "Estado",
            accion: {
                estilo: Estado(),
            },
        },
        {
            nombre: "Opciones",
            acciones: {
                activosFijos: {
                    accion: activosFijos({ vistaPrincipal, vistaActivosFijos }),
                    icono: "bi bi-list-columns-reverse",
                    classElemento: "btn btn-secondary btn-sm ",
                },
                pdf: {
                    estilo: generarPDF,
                    // icono: "bi bi-file-earmark-pdf-fill",
                    // classElemento: "btn btn-sm btn-dark border border-danger",
                    // titulo: "PDF Asignación",
                }
            }
        },
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    // const formularioReportes = Reportes({ contenidoTabla, elementoTBody: tBody, URL, estiloTd })();
    // const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin"});
    const estiloBtn = { btn: "btn btn-sm btn-danger px-3 me-2", texto: " Mis bienes" };
    const elementosModal = VistaPDF("Control individual", [`${URL}/mis-activos-pdf`, "GET", undefined, undefined, undefined, undefined, "mis_bienes"]);
    const btnModal = BotonPDF(elementosModal, MisBienesPDF(`${URL}/mis-activos-js`));
    const divBuscar = pdfYBusqueda(tabla.querySelector("table"), btnModal, estiloBtn);
    vistaPrincipal.append(contenedorDeAlertas, divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(URL, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
}


/**
* Crea la funcionalidad para generar PDF.
*/
export const generarPDF = ({elemento, registro}) => {
    // return async ({elemento, registro}) => {
    //     solicitudPDF(`./api/movimientos/reporte/individual/${registro.id}`, "POST", undefined, undefined, true, () => {
    //         const datosUsuario = {
    //             responsable: registro.nombreencargado,
    //             sucursal: registro.nombresucursal,
    //             area: registro.nombredepartamento,
    //             personal: registro.nombrepersonal
    //         };
    //         const datos = JSON.stringify(datosUsuario);
    //         return datos;
    //     });
    // };

    const iconoPDF = crearElemento("i", {class: "bi bi-file-earmark-pdf-fill"});
    elemento.append(iconoPDF);
    elemento.setAttribute("class", "btn btn-sm btn-dark border border-danger");
    elemento.setAttribute("title", "PDF Asignación");
    
    const datosExtra = () => {
        const datosUsuario = {
            responsable: registro.nombreencargado,
            sucursal: registro.nombresucursal,
            area: registro.nombredepartamento,
            personal: registro.nombrepersonal
        };
        const datos = JSON.stringify(datosUsuario);
        return datos;
    };
    const elementosModal = VistaPDF("Control individual", [`./api/movimientos/reporte/individual/${registro.id}`, "POST", undefined, undefined, true, datosExtra, "control-individual"], "Letter-L");
    const btnModal = BotonPDF(elementosModal, ContenidoPDF(`./api/movimientos/reporte-js/individual/${registro.id}`, elementosModal.divPage, datosExtra));
    btnModal(elemento);
}

