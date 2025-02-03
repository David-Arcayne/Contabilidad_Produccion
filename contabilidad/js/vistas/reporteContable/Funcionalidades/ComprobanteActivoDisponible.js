import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"
import { EncabezadoPDF, FirmasPDF } from "../../../funciones/VistaPDF.js";

export const ComprobanteActivoDisponible = async (datosForm, url_rep) => {
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

    const subtitulo = `<div><h4>Reporte Activo Disponible</h4></div> <span>Comprobante: ${datosForm.fechainib} - ${datosForm.fechafinb}</span>`;
    const htmlEncabezado= EncabezadoPDF();


    let htmlTable = "";
    let deudor = 0;
    let acreedor = 0;
    for (const value of datoReporte) {
        const deudorTF = parseFloat(parseFloat(value.deudor).toFixed(2));
        const acreedorTF = parseFloat(parseFloat(value.acreedor).toFixed(2));
        deudor += deudorTF;
        acreedor += acreedorTF;;
        htmlTable += `
            <tr>
                <td>${value.codigo}</td>
                <td>${value.nombre}</td>
                <td class="afr-te">${FormatoEnUs(deudorTF)}</td>
                <td class="afr-te">${FormatoEnUs(acreedorTF)}</td>
            </tr>`;
    };
    htmlTable += `
        <tr>
            <td colspan="2" class="afr-te afr-fwb">TOTAL: </td>
            <td class="afr-fwb afr-te">${FormatoEnUs(deudor)}</td>
            <td class="afr-fwb afr-te">${FormatoEnUs(acreedor)}</td>
        </tr>`;

    const html = `
        ${htmlEncabezado}
        <main>
            <div class="afr-filters-t">
                ${subtitulo}
            </div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cuenta</th>
                        <th class="afr-te">Deudor</th>
                        <th class="afr-te">Acreedor</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTable}
                </tbody>
            </table>
            ${htmlFirmas}
        </main>`;

    return html;
}