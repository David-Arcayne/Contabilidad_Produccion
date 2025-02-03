import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"
import { FirmasPDF } from "../../../funciones/VistaPDF.js";

export const ReporteLibroMayorCC = async (datosForm, url_rep, nombreCuenta) => {
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
    
    const subtitulo = `<div><h4>Reporte Libro Mayor Cuenta Contable</h4></div> <span>(${nombreCuenta}): ${FormatoDate(datosForm.fechaini)} - ${FormatoDate(datosForm.fechafin)}</span>`;

    let htmlTable = "";
    let debe = 0;
    let haber = 0;
    let saldo = 0;
    let contador = 0;
    for (const txn of datoReporte) {
        for (const value of txn.detalle) {
            const debeTF = parseFloat(parseFloat(value.debe).toFixed(2));
            const haberTF = parseFloat(parseFloat(value.haber).toFixed(2));
            debe += debeTF;
            haber += haberTF;
            saldo += debeTF - haberTF;
            contador++;
            htmlTable += `
                <tr>
                    <td>${contador}</td>
                    <td>${txn.codigo}</td>
                    <td>${FormatoDate(txn.fecha)}</td>
                    <td>${txn.tipo ?? "-"}</td>
                    <td class="afr-te">${FormatoEnUs(debeTF)}</td>
                    <td class="afr-te">${FormatoEnUs(haberTF)}</td>
                    <td class="afr-te">${FormatoEnUs(saldo)}</td>
                </tr>`;
        };
    }
    htmlTable += `
        <tr>
            <td colspan="4" class="afr-te afr-fwb">TOTAL: </td>
            <td class="afr-fwb afr-te">${FormatoEnUs(debe)}</td>
            <td class="afr-fwb afr-te">${FormatoEnUs(haber)}</td>
            <td class="afr-fwb afr-te">${FormatoEnUs(saldo)}</td>
        </tr>`;

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <table class="afr-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Transacción</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th class="afr-te">DEBE</th>
                    <th class="afr-te">HABER</th>
                    <th class="afr-te">Saldo</th>
                </tr>
            </thead>
            <tbody>
                ${htmlTable}
            </tbody>
        </table>
        ${htmlFirmas} 
    `;

    return html;
}