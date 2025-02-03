import { URL_APIC, URL_APIE } from "../../../lib/services.js";
import { crearElemento, Html2pdfDescargar } from "./Funciones.js";
import { obtenerDatos } from "./Solicitudes.js";
// import { solicitudPDF } from "./Solicitudes.js";

/**
 * Función para crear un modal para visualizar un diseño para descargar en PDF
 * @param {string} titulo  - Título del modal
 * @param {Object} solicitud - Objeto con los datos para la solicitud del PDF
 * @param {string} tipoHoja - Tipo de hoja para el PDF
 * @returns {Object} Retorna un objeto con el modal y el div principal
 */
export const VistaPDF = (titulo, solicitud, tipoHoja = "Letter") => {
    let estiloHoja = "";
    if (tipoHoja === "Letter") {
        estiloHoja = "min-width: 8.5in; max-width: 8.5in; min-height: 11in;";
    } else if (tipoHoja === "Letter-L") {
        estiloHoja = "min-width: 11in; max-width: 11in; min-height: 8.5in;";
    } else if (tipoHoja === "Legal") {
        estiloHoja = "min-width: 8.5in; max-width: 8.5in; min-height: 14in;";
    } else if (tipoHoja === "Legal-L") {
        estiloHoja = "min-width: 14in; max-width: 14in; min-height: 8.5in;";
    }
    const modalH1 = crearElemento("h1", {class: "modal-title fs-5"}, [titulo]);
    const btnCerrar = crearElemento("button", {type: "button", class: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close"});
    const modalHeader = crearElemento("div", {class: "modal-header"}, [modalH1, btnCerrar]);

    const contenidoPDF = crearElemento("div", { class: "af-seccion" });
    const divPage = crearElemento("div", {style: `${estiloHoja} padding:15mm; background-color: #ffffff; box-sizing: border-box;`, class:"mx-auto"}, [contenidoPDF]);
    const modalBody = crearElemento("div", {class: "modal-body shadow-none bg-dark bg-opacity-25 p-1 p-md-3"}, [divPage]);
    // const contenedorPDF = crearElemento("div", undefined, [divPage]);
    // const modalBody = crearElemento("div", {class: "modal-body shadow-none bg-dark bg-opacity-25 p-1 p-md-3"}, [contenedorPDF]);

    // Crear botón para descargar el PDF
    const iconoDescargar = crearElemento("i", {class: "bi bi-download pe-1"});
    const btnDescargar = crearElemento("button", {type: "button", class: "btn btn-primary rounded-1"}, [iconoDescargar, " Descargar"]);
    btnDescargar.addEventListener("click", async () => {
        btnDescargar.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Descargando...`;
        btnDescargar.disabled = true;


        const nombrePDF = solicitud.nombrePDF;
        Html2pdfDescargar(`${nombrePDF}-`, contenidoPDF);
        
        btnDescargar.innerHTML = `${iconoDescargar.outerHTML} Descargar`;
        btnDescargar.disabled = false;
    });
    const modalFooter = crearElemento("div", {class: "modal-footer"}, [btnDescargar]);

    const modalContent = crearElemento("div", {class: "modal-content"}, [modalHeader, modalBody, modalFooter]);
    const modalDialog = crearElemento("div", {class: "modal-dialog modal-fullscreen"}, [modalContent]);
    const modal = crearElemento("div", {class: "modal fade", tabindex: "-1", "aria-labelledby": "exampleModalLabel", "aria-hidden": "true"}, [modalDialog]);

    PdfPrincipal(contenidoPDF);
    return { modal, divPage: contenidoPDF };
};

/**
 * Crear el diseño del encabezado de un PDF
 * @returns {string} Retorna un string (HTML) con el diseño del encabezado del PDF
 */
export const EncabezadoPDF = () => {
    const empresa = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa;
    const htmlHeader =`
        <div class="afr-header afr-h-mb">
            <div class="afr-h-left afr-pb">
                <div class="afr-text-lg"> ${empresa.nombre} </div>
                <div> ${empresa.direccion ?? ""} </div>
                <div> ${empresa.ociudad ?? ""} </div>
                <div> ${empresa.oestado ?? ""} </div>
                <div> ${empresa.opais ?? ""} </div>
            </div>
            <div class="afr-h-center">
                <table class="afr-h-table">
                    <tr>
                        <td>
                            <img class="afr-logo" src="${URL_APIE}${empresa.logo}">
                        </td>
                    </tr>
                </table>
            </div>
            <div class="afr-h-right afr-pb">
                <div class="afr-text-lg"> NIT: ${empresa.nit} </div>
                <div>Tel: ${empresa.telefono ?? " -"} </div>
                <div>Cel: ${empresa.ocelular ?? " -"} </div>
                <div> ${empresa.email ?? ""} </div>
                <div> ${empresa.ositioweb ?? ""} </div>
            </div>
        </div>`;

    return htmlHeader;
}

/**
 * Crear el diseño principal de un PDF
 * @param {HTMLElement} divPage - Elemento HTML donde se agregará el contenido del PDF
 */
export const PdfPrincipal = (divPage) => {
    const htmlHeader =`
        <div class="reportaf">
            ${EncabezadoPDF()}
            <main>
                    
            </main>
        </div>`;

    divPage.innerHTML =  htmlHeader;
}

/**
 * Crear un texto (HYML) con los filtros aplicados en un reporte
 * @param {Array} filtros - Arreglo con los filtros aplicados en el reporte
 * @returns {string} Retorna un string (HTML) con los filtros aplicados en el report
 */
export const FiltrosPDF = (filtros) => {
    let subtitle = "";
    if (filtros && filtros.length > 0) {
        filtros.forEach(value => {
            subtitle += `<span>${value.nombre}</span>: ${value.valor}, `;
        });
        subtitle = subtitle.slice(0, -2);
    }

    return subtitle;
}

/**
 * Agrega un evento al botón para visualizar el PDF
 * @param {Object} modal - Modal que contiene el diseño del PDF
 * @param {HTMLElement} divPage - Elemento HTML donde se agregará el contenido del PDF
 * @param {Function} contenido - Función que retorna el contenido del PDF
 */
export const BotonPDF = ({modal, divPage}, contenido) => {
    const modalInstance = new bootstrap.Modal(modal);
    const principal = divPage.querySelector("main");
    return (btn) => {
        // Evento para mostrar el modal y cargar el contenido del PDF
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            principal.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;
            modalInstance.show();
            principal.innerHTML = await contenido();
        });
    };
}

/**
 * Agrega un evento al botón para visualizar el PDF
 * @param {Object} modal - Modal que contiene el diseño del PDF
 * @param {HTMLElement} divPage - Elemento HTML donde se agregará el contenido del PDF
 * @param {Function} contenido - Función que retorna el contenido del PDF
 */
export const BtnVistaPrevia = ({modal, divPage}, contenido, clsBtn = "btn-success") => {
    const modalInstance = new bootstrap.Modal(modal);
    const principal = divPage.querySelector("main");
    const icono = crearElemento("i", {class: "bi bi-file-earmark-pdf pe-1"});
    const btn = crearElemento("button", {class: `btn ${clsBtn}`}, [icono, " Vista previa"]);

    // Evento para mostrar el modal y cargar el contenido del PDF
    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        principal.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;
        modalInstance.show();
        principal.innerHTML = await contenido();
    });

    return btn;
}

/**
 * Función para obtener las firmas de un PDF en un maximo de 4 columnas
 * @returns {string} Retorna un string (HTML) con las firmas
 */
export const FirmasPDF = async () => {
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const menuyofinanciero = JSON.parse(localStorage.getItem("yofinancieromenu"));
    const datosFirma = await obtenerDatos(`${URL_APIC}api/firmas/${empresa_id}/${menuyofinanciero[0].modulo}`);
    const lnFirmas = datosFirma.length;
    if (datosFirma && lnFirmas > 0) {
        let firmasD = "";
        if (lnFirmas <= 4) {
            // Si hay menos de 4 firmas se divide el espacio en partes iguales
            const porcentaje = Math.floor(100 / lnFirmas);
            for (const lista of datosFirma) {
                firmasD+=`<div class="afr-sig" style="width: ${porcentaje}%;">
                    <span>${lista.nombre}</span><br>${lista.cargo}
                </div>`;
            }
        } else {
            // Si hay más de 4 firmas se divide en filas de 4 firmas
            const maximo = 4;
            let contador = 0;
            for (const lista of datosFirma) {
                let porcentaje;
                const filaActual = Math.floor(contador / maximo);
                const inicioFila = filaActual * maximo;
                const firmasRestantes = lnFirmas - inicioFila;
                const firmasEnFila = Math.min(firmasRestantes, maximo);
                porcentaje = Math.floor(100 / firmasEnFila);
                firmasD += `<div class="afr-sig" style="width: ${porcentaje}%;"><span>${lista.nombre}</span><br>${lista.cargo}</div>`;
                contador++;
            }
        }
        return firmasD;
    } else {
        return false;
    }
}