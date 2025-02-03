import { ReporteActivoPasivo } from "./ReporteActivoPasivo.js";
import { ReporteActivoPasivoHasta } from "./ReporteActivoPasivoHasta.js";
import { ReporteBalanceGeneral } from "./ReporteBalanceGeneral.js";
import { ReporteBalanceGeneralHasta } from "./ReporteBalanceGeneralHasta.js";
import { ReporteBalanceSumasSaldos } from "./ReporteBalanceSumasSaldos.js";
import { ReporteBalanceSumasSaldosHasta } from "./ReporteBalanceSumasSaldosHasta.js";
import { ReporteCuentaResultado } from "./ReporteCuentaResultado.js";

export const ReporteDeGestion = (formulario, contenedorReporte, datosUrl, contPDF, contInfo, vistaPrincipal) => {

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());
        
        const tipoReporte = datosForm.reportede;
        const fechaini = datosForm.fechaini;
        const fechafin = datosForm.fechafin;
        
        if (contPDF.classList.contains("d-none")) {
            contPDF.classList.remove("d-none");
            contInfo.classList.add("d-none");
        }

        const principal = contenedorReporte.querySelector("main");
        principal.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;

        if (tipoReporte == 1) {
            contenedorReporte.setAttribute("data-namepdf", "balance_sumas_y_saldos");
            const trUrl = `${datosUrl.URL}reportebalancedesumasysaldos/${fechaini}/${fechafin}/${datosUrl.empresa_id}`;
            const contenidoTabla = await ReporteBalanceSumasSaldos(datosForm, trUrl);
            principal.innerHTML = contenidoTabla;
        } else if (tipoReporte == 2) {
            contenedorReporte.setAttribute("data-namepdf", "balance_sumas_y_saldos_hasta");
            const trUrl = `${datosUrl.URL}reportebalancedesumasysaldoshasta/${fechaini}/${fechafin}/${datosUrl.empresa_id}`;
            const contenidoTabla = await ReporteBalanceSumasSaldosHasta(datosForm, trUrl);
            principal.innerHTML = contenidoTabla;
        } else if (tipoReporte == 3) {
            contenedorReporte.setAttribute("data-namepdf", "reporte_activo_y_pasivo");
            const trUrl = `${datosUrl.URL}reporteactivoypasivo/${fechaini}/${fechafin}/${datosUrl.empresa_id}`;
            const contenidoTabla = await ReporteActivoPasivo(datosForm, trUrl);
            principal.innerHTML = contenidoTabla;
        } else if (tipoReporte == 4) {
            contenedorReporte.setAttribute("data-namepdf", "reporte_activo_y_pasivo_hasta");
            const trUrl = `${datosUrl.URL}reporteactivoypasivohasta/${fechaini}/${fechafin}/${datosUrl.empresa_id}`;
            const contenidoTabla = await ReporteActivoPasivoHasta(datosForm, trUrl);
            principal.innerHTML = contenidoTabla;
        } else if (tipoReporte == 5) {
            contenedorReporte.setAttribute("data-namepdf", "cuenta_de_resultado");
            const trUrl = `${datosUrl.URL}reportecuentasderesultado/${fechaini}/${fechafin}/${datosUrl.empresa_id}`;
            const contenidoTabla = await ReporteCuentaResultado(datosForm, trUrl);
            principal.innerHTML = contenidoTabla;
        } else if (tipoReporte == 6) {
            contenedorReporte.setAttribute("data-namepdf", "balance_general");
            const contenidoTabla = await ReporteBalanceGeneral(datosForm, datosUrl);
            principal.innerHTML = contenidoTabla;
        } else if (tipoReporte == 7) {
            contenedorReporte.setAttribute("data-namepdf", "balance_general_hasta");
            const contenidoTabla = await ReporteBalanceGeneralHasta(datosForm, datosUrl);
            principal.innerHTML = contenidoTabla;
        } else {
            principal.innerHTML = `<div class="py-5 text-danger text-center fw-bold">No se encontro el tipo de reporte</div>`;
            // vistaPrincipal.append(modalDeInformacion(`No se encontro el tipo de reporte`));
        }
    });
}