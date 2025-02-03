import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"
import { FirmasPDF } from "../../../funciones/VistaPDF.js";

export const ReporteDetalleFacturaTr = async (datosForm, url_rep) => {
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
    
    const subtitulo = `<div><h4>Reporte Detalle Transacciones</h4></div> <span>${FormatoDate(datosForm.fechaini)} - ${FormatoDate(datosForm.fechafin)}</span>`;

    let htmlContenido = "";
    for (const txn of datoReporte) {
        let htmlTable = "";
        let monto = 0;
        for (const value of txn.facturas) {
            const claseFactura = value.clasefactura ? (value.clasefactura === "1" ? "Compra" : (value.clasefactura === "2" ? "Venta" : "-")) : "-";
            const montoTF = parseFloat(parseFloat(value.monto).toFixed(2));
            monto += montoTF;
            htmlTable += `
                <tr>
                    <td>${FormatoDate(value.fecha)}</td>
                    <td>${value.nit}</td>
                    <td>${value.proveedor}</td>
                    <td>${value.nfactura}</td>
                    <td>${claseFactura}</td>
                    <td class="afr-te">${FormatoEnUs(montoTF)}</td>
                </tr>`;
        };
        htmlTable += `
            <tr>
                <td colspan="4" class="afr-te afr-fwb">TOTAL: </td>
                <td class="afr-fwb afr-te">${FormatoEnUs(monto)}</td>
            </tr>`;
    
        htmlContenido += `
            <p><span class="afr-fwb">Transacción: </span> ${txn.transaccion}, <span class="afr-fwb">Fecha: </span> ${FormatoDate(txn.fechat)}</p>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Nit</th>
                        <th>Nombre o Razon Social</th>
                        <th>N. Factura</th>
                        <th>Tipo factura</th>
                        <th class="afr-te">Total Facturado</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTable}
                </tbody>
            </table>
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