import { crearElemento, exportarAXlsx, FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"

export const VPDetalleCobros = (url_rep, det_cobrados, spanSaldo) => async() => {
    const datoDetalle = await obtenerDatos(url_rep);
    if (!datoDetalle) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    let htmlTable = "";
    let tMonto = 0;
    for (const value of datoDetalle) {
        
        const monto = parseFloat(parseFloat(value.monto).toFixed(2));
        tMonto += monto;
        htmlTable += `
            <tr>
                <td>${FormatoDate(value.fecha)}</td>
                <td>${value.persona}</td>
                <td>${value.ci}</td>
                <td>${value.recibo}</td>
                <td class="afr-te">${FormatoEnUs(value.monto)}</td>
            </tr>`;
    };
    htmlTable += `
    <tr>
        <td colspan="4" class="afr-te afr-fwb">Total: </td>
        <td class="afr-fwb afr-te">${FormatoEnUs(tMonto)}</td>
    </tr>`;

    const montoCobrar = parseFloat(spanSaldo.textContent?.replace(",", ""));
    const html = `
        <div class="afr-filters-t">
            <div><h4>Detalle Cobrados</h4></div>
            <span>(Expresado en Bolivianos)</span>
        </div>
        <div class="afr-info afr-h-mb">
            <div><span>Cliente:</span> ${det_cobrados.nombrep}</div>
            <div><span>Saldo por cobrar:</span>: ${FormatoEnUs(montoCobrar)}</div>
        </div>
        <table class="afr-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Persona</th>
                    <th>CI</th>
                    <th>Recibo</th>
                    <th class="afr-te">Monto</th>
                </tr>
            </thead>
            <tbody>
                ${htmlTable}
            </tbody>
        </table>
        `;

    return html;
}