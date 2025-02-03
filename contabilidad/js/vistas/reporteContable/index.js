import { URL_APIC } from "../../../../lib/services.js";
import { crearFormulario } from "../../funciones/CrearFormulario.js";
import { crearElemento } from "../../funciones/Funciones.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { PdfPrincipal } from "../../funciones/VistaPDF.js";
import { formularioRepContableComprobante, formularioRepContablePeriodico } from "./Formularios.js";
import { BotonesDescarga, OpcionesReporteContable } from "./Funcionalidades/Funciones.js";
import { ReporteComprobante, ReportePeriodico } from "./Funcionalidades/TipoReporte.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export async function ReporteContable(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

    // Creación de Vistas para la navegación en la ventana
    const vistaFormulario = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    vistaFormulario.setAttribute("class", "col-12 col-md-3 shadow-sm pb-3 bt-2 border border-light-subtle");
    vistaPrincipal.setAttribute("class", "col-12 col-md-9 mt-4 mt-md-0");
   
    const contenedorPrincipal = vistaPrincipal.parentNode;
    // contenedorPrincipal.append(vistaEditar);

    // Creación de elementos para la sección formulario
    const contenedorDeAlertas = crearElemento("div");
    const contenedorOpciones = crearElemento("div", { class: "my-3" });
    const contenedorFormPeriodico = crearElemento("div");
    const contenedorFormComprobante = crearElemento("div", {class: "d-none"});
    vistaFormulario.append(contenedorOpciones, contenedorFormPeriodico,contenedorFormComprobante);

    // Creación de elementos para la sección principal
    const contenedorBotones = crearElemento("div", { class: "mb-4" });
    const contenedorPDF = crearElemento("div", { class: "af-seccion" });
    const divcontPDF = crearElemento("div", { style: "min-width:600px" }, [contenedorPDF]);
    const divContenedorPDF = crearElemento("div", { class: "overflow-auto" }, [divcontPDF]);
    const contenidoPDF = crearElemento("div", { class: "px-4 d-none overflow-auto" }, [contenedorBotones, divContenedorPDF]);
    const contenidoInfo = crearElemento("div");
    vistaPrincipal.append(contenidoInfo, contenidoPDF);

    // Información y opciones de Reporte
    const datoGA = await obtenerDatos(`${URL}getgestionactual/${empresa_id}`);
    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datoGA.nombre}`]);
        const textGA = crearElemento("p", { class: "fs-6" }, ["Gestión: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-start" }, [textGA])
        contenedorOpciones.appendChild(gestionActiva);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        vistaPrincipal.appendChild(h1);
        return;
    }
    contenedorOpciones.appendChild(OpcionesReporteContable(contenedorFormPeriodico, contenedorFormComprobante, contenedorPDF, contenidoInfo, contenidoPDF));

    // Formulario de Reporte Contable Periodico
    const datosFormularioP = {
        datosBtn: {
            btnClass: "btn btn-primary px-2 text-nowrap",
            colbtn: "col-12",
            nombre: "Obtener Reporte",
        },
    }
    const formularioP = crearFormulario(formularioRepContablePeriodico, datosFormularioP);
    contenedorFormPeriodico.appendChild(formularioP);
    formularioP.setAttribute("class", "row gx-2 gy-4");
    // Formulario de Reporte Contable Comprobante
    const datosFormularioC = {
        datosBtn: {
            btnClass: "btn btn-primary px-2 text-nowrap",
            colbtn: "col-12",
            // columna: "col-12",
            nombre: "Obtener Reporte",
        },
    }
    const formularioC = crearFormulario(formularioRepContableComprobante, datosFormularioC);
    contenedorFormComprobante.appendChild(formularioC);
    formularioC.setAttribute("class", "row gx-2 gy-4");

    // Contenido de la vista principal (PDF)
    contenidoInfo.appendChild(crearElemento("p", { class: "text-center fs-5 mt-4" }, ["Reporte."]));
    contenedorBotones.appendChild(BotonesDescarga(contenedorPDF));
    PdfPrincipal(contenedorPDF);
    ReportePeriodico(formularioP, contenedorPDF, {URL, empresa_id}, contenidoPDF, contenidoInfo, contenedorPrincipal);
    ReporteComprobante(formularioC, contenedorPDF, {URL, empresa_id}, contenidoPDF, contenidoInfo, contenedorPrincipal);
}


