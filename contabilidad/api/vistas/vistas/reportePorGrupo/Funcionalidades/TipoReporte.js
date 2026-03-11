import { crearElemento, Html2pdfDescargar } from "../../../funciones/Funciones.js";
import { ReporteGrupoTemplate } from "./ReporteGrupoTemplate.js";


export const ReporteTemplate = (formulario, contenedorReporte, datosUrl, contPDF, contInfo, vistaPrincipal) => {

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());

        const codigo = datosForm.codigo;
        const fechaini = datosForm.fini;
        const fechafin = datosForm.ffin;

        if (contPDF.classList.contains("d-none")) {
            contPDF.classList.remove("d-none");
            contInfo.classList.add("d-none");
        }

        const principal = contenedorReporte.querySelector("main");
        principal.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;

        if (codigo !== "") {
            contenedorReporte.setAttribute("data-namepdf", "reporte_por_grupo");
            const trUrl = `${datosUrl.URL}vertemplatedatos/${codigo}/${datosUrl.empresa_id}/${fechaini}/${fechafin}`;
            const contenidoTabla = await ReporteGrupoTemplate(datosForm, trUrl);
            principal.innerHTML = contenidoTabla;
        } else {
            setTimeout(() => {
                principal.innerHTML = `<div class="py-5 text-danger text-center fw-bold">Elija un Template</div>`;
            }, 500);
            // vistaPrincipal.append(modalDeInformacion(`No se encontro el tipo de reporte`));
        }
    });
}

export const BotonesDescarga = (contenidoPDF) => {
    const iconoDP = crearElemento("i", { class: "bi bi-download me-1" });
    const btnPDF = crearElemento("button", { class: "btn btn-primary btn-sm", style: "min-width: 100px" }, [iconoDP, " Descargar PDF"]);
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
