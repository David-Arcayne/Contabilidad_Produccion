import { ReporteActivoDisponible } from "./ReporteActivoDisponible.js";

export const ReportePeriodico = (formulario, contenedorReporte, datosUrl, contPDF, contInfo) => {

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());
        const tipoReporte = datosForm.reportede;
        const fechaini = datosForm.fechaini;
        const fechafin = datosForm.fechafin;
        const planCuenta = datosForm.cuenta;
        if (tipoReporte == 1) {
            if (contPDF.classList.contains("d-none")) {
                contPDF.classList.remove("d-none");
                contInfo.classList.add("d-none");
            }
            const principal = contenedorReporte.querySelector("main");
            principal.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;
            const contenidoTabla = await ReporteActivoDisponible(datosForm, `${datosUrl.URL}reporteactivodisponible/${fechaini}/${fechafin}/${tipoReporte}/${datosUrl.empresa_id}`);
            principal.innerHTML = contenidoTabla;


        } else if (tipoReporte == 2) {
            console.log("Detalle de Transacción");
        } else if (tipoReporte == 3) {
            console.log("Detalle Factura p/Transacción");
        }
    });
}