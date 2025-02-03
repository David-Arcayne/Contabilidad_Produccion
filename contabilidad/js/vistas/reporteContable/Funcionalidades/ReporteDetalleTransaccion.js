import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"
import { FirmasPDF } from "../../../funciones/VistaPDF.js";

export const ReporteDetalleTransaccion = async (datosForm, url_rep) => {
    const datoReporte = await obtenerDatos(url_rep);
    if (!datoReporte) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    const firmas = await FirmasPDF();
    let htmlFirmas = "";
    if (firmas) {
        htmlFirmas = `<div class="afr-signatures">
            ${firmas}
        </div>`;
    }
    
    const subtitulo = `<div><h4>Reporte Detalle Transacción</h4></div> <span>${FormatoDate(datosForm.fechaini)} - ${FormatoDate(datosForm.fechafin)}</span>`;

    let htmlContenido = "";
    for (const txn of datoReporte) {
        let htmlTable = "";
        let debe = 0;
        let haber = 0;
        for (const value of txn.detalle) {
            const debeTF = parseFloat(parseFloat(value.debe).toFixed(2));
            const haberTF = parseFloat(parseFloat(value.haber).toFixed(2));
            debe += debeTF;
            haber += haberTF;
            htmlTable += `
                <tr>
                    <td>${value.cuenta}</td>
                    <td>${value.plan}</td>
                    <td>${value.nota || "-"}</td>
                    <td class="afr-te">${FormatoEnUs(debeTF)}</td>
                    <td class="afr-te">${FormatoEnUs(haberTF)}</td>
                </tr>`;
        };
        htmlTable += `
            <tr>
                <td colspan="3" class="afr-te afr-fwb">TOTAL: </td>
                <td class="afr-fwb afr-te">${FormatoEnUs(debe)}</td>
                <td class="afr-fwb afr-te">${FormatoEnUs(haber)}</td>
            </tr>`;
    
        htmlContenido += `
            <p><span class="afr-fwb">Transacción: </span> ${txn.codigo}, <span class="afr-fwb">Fecha: </span> ${FormatoDate(txn.fecha)}</p>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cuenta</th>
                        <th>Nota</th>
                        <th class="afr-te">Debe</th>
                        <th class="afr-te">Haber</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTable}
                </tbody>
            </table>
            <p><span class="afr-fwb">Glosa: </span> ${txn.glosa}</p>
            <hr style="border: 0px solid; border-top: 1px solid #cccccc; margin: 30px 0px" />`;
    }

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        ${htmlContenido}
        ${htmlFirmas} 
    `;

    return html;
}