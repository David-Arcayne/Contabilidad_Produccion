import { crearFormulario } from "../../funciones/CrearFormulario.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, formatoFecha, seccionDriverJS } from "../../funciones/Funciones.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { formularioRepGestion } from "./Formularios.js";
import { ReporteDeGestion } from "./Funcionalidades/TipoReporte.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la ventana de Reporte de Gestión.
 * Fecha: 05 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos de la vista.
 */
export async function ReporteGestion(codigo, permisos) {
    const URL = CT_URLAPI;
    const EMPRESA_ID = getEmpresaId();

    // Creación de Vistas para la navegación en la ventana
    const vistaFormulario = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    vistaFormulario.setAttribute("class", "col-12 col-md-3 shadow-sm pb-3 bt-2 border border-light-subtle h-100");
    vistaPrincipal.setAttribute("class", "col-12 col-md-9 mt-4 mt-md-0 pe-0");

    const contenedorPrincipal = vistaPrincipal.parentNode;

    // Creación de elementos para la sección formulario
    const contenedorOpciones = crearElemento("div", { class: "my-3" });
    const contenedorFormGestion = crearElemento("div");
    vistaFormulario.append(contenedorOpciones, contenedorFormGestion);

    // Información de formulario
    const datoGA = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);
    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`Entre ${formatoFecha(datoGA.fechaini)} y ${formatoFecha(datoGA.fechafin)}`]);
        const textGA = crearElemento("p", { style: "font-size:12px;" }, ["Gestión Contable: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-start" }, [textGA])
        contenedorOpciones.appendChild(gestionActiva);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        vistaPrincipal.appendChild(h1);
        return;
    }

    // Formulario de Reporte Contable Periodico
    const datosFormularioG = {
        datosBtn: {
            btnClass: "btn btn-primary px-2 text-nowrap",
            colbtn: "col-12",
            nombre: "Obtener Reporte",
        },
    }
    formularioRepGestion[0].valor = datoGA?.fechaini || "date";
    const formularioG = crearFormulario(formularioRepGestion, {
        opcionesParaBotones:{
            nombreEnviar: "Obtener Reporte",
            clasesEnviar: "btn btn-primary px-2 text-nowrap",
            clasesContenedor: "d-grid",
        }
    });
    contenedorFormGestion.appendChild(formularioG);
    formularioG.setAttribute("class", "row gx-2 gy-4");

    // Contenido de la vista principal (PDF)
    ReporteDeGestion({
        formulario : formularioG,
        vistaReporte: vistaPrincipal,
        contenedorPrincipal,
        URL,
        EMPRESA_ID,
        datosGestion: datoGA,
    });

    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            popover: {
                title: "Reporte de Gestión",
                description: "Reporte acumulados de toda la gestión o periodo solicitado dentro la Gestión Contable Activa.",
            },
        },
        {
            element: formularioG.querySelector("#repgestion-reportescomplementarios")?.parentElement,
            popover: {
                title: "Reportes Complementarios",
                description: "Son reportes previos a los Estados Financieros para verificar y analizar la información contable de la Empresa, dentro el Periodo solicitado o Hasta (desde inicio hasta la fecha indicada).",
            },
        },
        {
            element: formularioG.querySelector("#repgestion-estadosfinancieros")?.parentElement,
            popover: {
                title: "Estados Financieros",
                description: "Reportes que muestran la situación financiera u económica de la Empresa u Organización, dentro el Periodo solicitado o Hasta (desde inicio hasta la fecha indicada). Normalmente exigidos por normas legales nacionales y cumpliendo Principios y Normas de Contabilidad Nacionales e Internacionales.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, contenedorFormGestion);
}