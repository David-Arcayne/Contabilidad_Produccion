import { cambiarVista, crearElemento, Html2pdfDescargar } from "../../../funciones/Funciones.js";

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
