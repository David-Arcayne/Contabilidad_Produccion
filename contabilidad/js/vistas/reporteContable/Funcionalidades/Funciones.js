import { cambiarVista, crearElemento, Html2pdfDescargar } from "../../../funciones/Funciones.js";
import { PdfPrincipal } from "../../../funciones/VistaPDF.js";

export const OpcionesReporteContable = (formP, formC, contenedorPDF, contenidoInfo, contenidoPDF) => {
    const btnP = crearElemento("button", { class: "btn btn-success btn-sm", style: "min-width: 100px" }, ["Periodico"]);
    const btnCom = crearElemento("button", { class: "btn btn-outline-success btn-sm", style: "min-width: 100px" }, ["Comprobante"]);
    const div = crearElemento("div", { class: "text-start" }, [btnP, " ",btnCom]);

    btnP.addEventListener("click", () => {
        btnP.setAttribute("class", "btn btn-success btn-sm");
        btnCom.setAttribute("class", "btn btn-outline-success btn-sm");
        if (contenidoInfo.classList.contains("d-none")) {
            contenidoInfo.classList.remove("d-none");
            contenidoPDF.classList.add("d-none");
        }
        PdfPrincipal(contenedorPDF);
        if (formP.classList.contains("d-none")) {
            cambiarVista(formC, formP);
        }
    });

    btnCom.addEventListener("click", () => {
        btnCom.setAttribute("class", "btn btn-success btn-sm");
        btnP.setAttribute("class", "btn btn-outline-success btn-sm");
        if (contenidoInfo.classList.contains("d-none")) {
            contenidoInfo.classList.remove("d-none");
            contenidoPDF.classList.add("d-none");
        }
        contenedorPDF.innerHTML = "";
        if (formC.classList.contains("d-none")) {
            cambiarVista(formP, formC);
        }
    });
    
    return div;
}

export const BotonesDescarga = (contenidoPDF) => {
    const iconoDP = crearElemento("i", { class: "bi bi-download me-1" });
    const btnPDF = crearElemento("button", { class: "btn btn-danger btn-sm", style: "min-width: 100px" }, [iconoDP, " Descargar PDF"]);
    const iconoDX = crearElemento("i", { class: "bi bi-download me-1" });
    // const btnXlsx = crearElemento("button", { class: "btn btn-success btn-sm", style: "min-width: 100px" }, [iconoDX, " Descargar Excel"]);
    const div = crearElemento("div", { class: "text-start" }, [btnPDF]);

    btnPDF.addEventListener("click", () => {
        const nombrePDF = contenidoPDF.getAttribute("data-namepdf");
        Html2pdfDescargar(`${nombrePDF}-`, contenidoPDF);
    });

    // btnXlsx.addEventListener("click", () => {
    //     exportarExcel("ReporteContable-", contenidoPDF);
    // });
    
    return div;
}
