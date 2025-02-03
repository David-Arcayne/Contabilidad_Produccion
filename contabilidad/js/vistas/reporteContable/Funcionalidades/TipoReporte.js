import { modalDeInformacion } from "../../../funciones/Modals.js";
import { ComprobanteActivoDisponible } from "./ComprobanteActivoDisponible.js";
import { ComprobanteContable } from "./ComprobanteContable.js";
import { ReporteActivoDisponible } from "./ReporteActivoDisponible.js";
import { ReporteDetalleFacturaTr } from "./ReporteDetalleFacturaTr.js";
import { ReporteDetalleTransaccion } from "./ReporteDetalleTransaccion.js";
import { ReporteLibroMayorCC } from "./ReporteLibroMayorCC.js";

export const ReportePeriodico = (formulario, contenedorReporte, datosUrl, contPDF, contInfo, vistaPrincipal) => {

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());
        
        const tipoReporte = datosForm.reportede;
        const fechaini = datosForm.fechaini;
        const fechafin = datosForm.fechafin;
        const planCuenta = datosForm.cuenta;
        if (tipoReporte !== "" && planCuenta !== "") {
            vistaPrincipal.append(modalDeInformacion(`Debe seleccionar solo "Reporte de" o "Cuentas"`));
            return;
        }
        
        if(tipoReporte !==  "") {
            if (contPDF.classList.contains("d-none")) {
                contPDF.classList.remove("d-none");
                contInfo.classList.add("d-none");
            }

            const principal = contenedorReporte.querySelector("main");
            principal.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;

            if (tipoReporte == 1) {
                contenedorReporte.setAttribute("data-namepdf", "activo_disponible");
                const trUrl = `${datosUrl.URL}reporteactivodisponible/${fechaini}/${fechafin}/${tipoReporte}/${datosUrl.empresa_id}`;
                const contenidoTabla = await ReporteActivoDisponible(datosForm, trUrl);
                principal.innerHTML = contenidoTabla;
            } else if (tipoReporte == 2) {
                contenedorReporte.setAttribute("data-namepdf", "detalle_transaccion");
                const trUrl = `${datosUrl.URL}reportedetalletransaccion/${fechaini}/${fechafin}/${tipoReporte}/${datosUrl.empresa_id}`;
                const contenidoTabla = await ReporteDetalleTransaccion(datosForm, trUrl);
                principal.innerHTML = contenidoTabla;
            } else if (tipoReporte == 3) {
                let trUrl = `${datosUrl.URL}reportedetallefpt/${fechaini}/${fechafin}/${datosUrl.empresa_id}`;
                const tipoFactura = datosForm.tipofactura;
                if (tipoFactura == "1" || tipoFactura == "2") {
                    trUrl = `${datosUrl.URL}reportedetallefptclasefactura/${fechaini}/${fechafin}/${datosUrl.empresa_id}/${tipoFactura}`;
                }
                contenedorReporte.setAttribute("data-namepdf", "detalle_factura_tr");
                const contenidoTabla = await ReporteDetalleFacturaTr(datosForm, trUrl);
                principal.innerHTML = contenidoTabla;
            }
        } else if (planCuenta !== "") {
            if (contPDF.classList.contains("d-none")) {
                contPDF.classList.remove("d-none");
                contInfo.classList.add("d-none");
            }

            const principal = contenedorReporte.querySelector("main");
            principal.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;
            const opcionS = formulario.querySelector("#repcontableperiodico_plancuenta");

            const texto = opcionS.options[opcionS.selectedIndex].text;
            const nombreCuenta = texto.split(" ").slice(1).join(" ");
            contenedorReporte.setAttribute("data-namepdf", "reporte_mayor");
            const trUrl = `${datosUrl.URL}mayorcuentacontable/${fechaini}/${fechafin}/${planCuenta}/${datosUrl.empresa_id}`;
            const contenidoTabla = await ReporteLibroMayorCC(datosForm, trUrl, nombreCuenta);
            principal.innerHTML = contenidoTabla;
            
        } else {
            vistaPrincipal.append(modalDeInformacion(`Debe seleccionar "Reporte de" o "Cuentas"`));
        }
    });
}

export const ReporteComprobante = (formulario, contenedorReporte, datosUrl, contPDF, contInfo, vistaPrincipal) => {

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());
        
        const tipoReporte = datosForm.reportede;
        const fechaini = datosForm.fechainib;
        const fechafin = datosForm.fechafinb;
        
        if (contPDF.classList.contains("d-none")) {
            contPDF.classList.remove("d-none");
            contInfo.classList.add("d-none");
        }

        contenedorReporte.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;

        if (tipoReporte == 1) {
            let trUrl = `${datosUrl.URL}reportecomprobantecontable/${fechaini}/${fechafin}/${datosUrl.empresa_id}/2`;
            if (datosForm.check_factura == "1") {
                trUrl = `${datosUrl.URL}reportecomprobantecontable/${fechaini}/${fechafin}/${datosUrl.empresa_id}/1`;
            }
            contenedorReporte.setAttribute("data-namepdf", "comprobante_contable");
            const contenidoTabla = await ComprobanteContable(datosForm, trUrl);
            contenedorReporte.innerHTML = contenidoTabla;
        } else if (tipoReporte == 2) {
            contenedorReporte.setAttribute("data-namepdf", "comprobante_activo_disponible");
            const trUrl = `${datosUrl.URL}reporteactivodiaponibledos/${fechaini}/${fechafin}/${datosUrl.empresa_id}`;
            const contenidoTabla = await ComprobanteActivoDisponible(datosForm, trUrl);
            contenedorReporte.innerHTML = contenidoTabla;
        } else {
            contenedorReporte.innerHTML = `<div class="py-5 text-danger text-center fw-bold">No se encontro el tipo de reporte</div>`;
            // vistaPrincipal.append(modalDeInformacion(`No se encontro el tipo de reporte`));
        }
    });
}