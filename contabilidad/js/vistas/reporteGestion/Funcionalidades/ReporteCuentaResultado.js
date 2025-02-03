import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"
import { FirmasPDF } from "../../../funciones/VistaPDF.js";

export const ReporteCuentaResultado = async (datosForm, url_rep) => {
    const datoReporte = await obtenerDatos(url_rep);
    if (!datoReporte) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }
    if (datoReporte.error) {
        return `<div class="py-5 fw-bold text-center text-info">Las transacciones dentro del periodo seleccionado previamente deben ser consolidados</div>`;
    }

    const firmas = await FirmasPDF();
    let htmlFirmas = "";
    if (firmas) {
        htmlFirmas = `<div class="afr-signatures">
            ${firmas}
        </div>`;
    }
    
    const subtitulo = `<div><h4>Reporte Cuentas de Resultado</h4></div> <span>Fecha: ${FormatoDate(datosForm.fechaini)} - ${FormatoDate(datosForm.fechafin)}</span>`;

    let htmlTable = "";
    let debe = 0;
    let haber = 0;
    let deudor = 0;
    let acreedor = 0;
    for (const value of datoReporte) {
        const debeTF = parseFloat(parseFloat(value.debe).toFixed(2));
        const haberTF = parseFloat(parseFloat(value.haber).toFixed(2));
        const deudorTF = parseFloat(parseFloat(value.deudor).toFixed(2));
        const acreedorTF = parseFloat(parseFloat(value.acreedor).toFixed(2));
        debe += debeTF;
        haber += haberTF;
        deudor += deudorTF;
        acreedor += acreedorTF;
        htmlTable += `
            <tr>
                <td>${value.codigo}</td>
                <td>${value.plan}</td>
                <td class="afr-te">${FormatoEnUs(debeTF)}</td>
                <td class="afr-te">${FormatoEnUs(haberTF)}</td>
                <td class="afr-te">${FormatoEnUs(deudorTF)}</td>
                <td class="afr-te">${FormatoEnUs(acreedorTF)}</td>
            </tr>`;
    };
    htmlTable += `
        <tr>
            <td colspan="2" class="afr-te afr-fwb">TOTAL: </td>
            <td class="afr-fwb afr-te">${FormatoEnUs(debe)}</td>
            <td class="afr-fwb afr-te">${FormatoEnUs(haber)}</td>
            <td class="afr-fwb afr-te">${FormatoEnUs(deudor)}</td>
            <td class="afr-fwb afr-te">${FormatoEnUs(acreedor)}</td>
        </tr>`;

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <table class="afr-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Cuenta</th>
                    <th class="afr-te">Debe</th>
                    <th class="afr-te">Haber</th>
                    <th class="afr-te">Deudor</th>
                    <th class="afr-te">Acreedor</th>
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