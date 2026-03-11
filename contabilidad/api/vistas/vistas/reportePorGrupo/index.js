import { crearFormulario } from "../../funciones/CrearFormulario.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento } from "../../funciones/Funciones.js";
import { PdfPrincipal } from "../../funciones/VistaPDF.js";
import { formularioRepPorGrupo } from "./Formularios.js";
import { BotonesDescarga, ReporteTemplate } from "./Funcionalidades/TipoReporte.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export async function ReportePorGrupo(codigo, permisos) {
    const URL = CT_URLAPI;
    const empresa_id = getEmpresaId();

    // Creación de Vistas para la navegación en la ventana
    const vistaFormulario = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    vistaFormulario.setAttribute("class", "col-12 col-md-3 shadow-sm pb-3 bt-2 border border-light-subtle h-100");
    vistaPrincipal.setAttribute("class", "col-12 col-md-9 mt-4 mt-md-0 pe-0");

    const contenedorPrincipal = vistaPrincipal.parentNode;
    // contenedorPrincipal.append(vistaEditar);

    // Creación de elementos para la sección formulario
    const contenedorOpciones = crearElemento("div", { class: "my-3" });
    const contenedorFormGestion = crearElemento("div");
    vistaFormulario.append(contenedorOpciones, contenedorFormGestion);

    // Creación de elementos para la sección principal
    const contenedorBotones = crearElemento("div", { class: "mb-4 px-4" });
    const contenedorPDF = crearElemento("div", { class: "af-seccion" });
    const divcontPDF = crearElemento("div", { style: "min-width:600px" }, [contenedorPDF]);
    const divContenedorPDF = crearElemento("div", { class: "px-4 overflow-auto ct-md-mw-none" }, [divcontPDF]);
    const contenidoPDF = crearElemento("div", { class: "d-none overflow-auto" }, [contenedorBotones, divContenedorPDF]);
    const contenidoInfo = crearElemento("div");
    vistaPrincipal.append(contenidoInfo, contenidoPDF);

    const body = vistaPrincipal.closest(".card-body");
    const altura = body.offsetHeight  - (divContenedorPDF.offsetTop);
    divContenedorPDF.setAttribute("style", `max-height: ${altura- 80}px;`);

    // Información de formulario
    // const datoGA = await obtenerDatos(`${URL}getgestionactual/${empresa_id}`);
    // if (datoGA && datoGA.nombre) {
    //     const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datoGA.nombre}`]);
    //     const textGA = crearElemento("p", { class: "fs-6" }, ["Gestion: ", spanGA]);
    //     const gestionActiva = crearElemento("div", { class: "text-start" }, [textGA])
    //     contenedorOpciones.appendChild(gestionActiva);
    // } else {
    //     const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestion activa"]);
    //     vistaPrincipal.appendChild(h1);
    //     return;
    // }

    // Formulario de Reporte Contable Periodico
    const formularioG = crearFormulario(formularioRepPorGrupo, {
        opcionesParaBotones:{
            nombreEnviar: "Obtener Reporte",
            clasesEnviar: "btn btn-primary px-2 text-nowrap",
            clasesContenedor: "d-grid",
        }
    });
    contenedorFormGestion.appendChild(formularioG);
    formularioG.setAttribute("class", "row gx-2 gy-4");

    // Contenido de la vista principal (PDF)
    contenidoInfo.appendChild(crearElemento("p", { class: "text-center fs-5 mt-4" }, ["Reporte."]));
    contenedorBotones.appendChild(BotonesDescarga(contenedorPDF));
    PdfPrincipal(contenedorPDF);
    ReporteTemplate(formularioG, contenedorPDF, {URL, empresa_id}, contenidoPDF, contenidoInfo, contenedorPrincipal);
}


