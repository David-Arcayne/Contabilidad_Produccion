import { crearElemento, exportarAXlsx, FormatoDate } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"

export const VPDetalle = (url_rep, det_tr) => async() => {
    const datoDetalle = await obtenerDatos(url_rep);
    if (!datoDetalle) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    let htmlTable = "";
    for (const value of datoDetalle) {
        htmlTable += `
            <tr>
                <td>${value.plan}</td>
                <td class="afr-te">${value.debe}</td>
                <td class="afr-te">${value.haber}</td>
                <td>${value.nota}</td>
            </tr>`;
    };

    const html = `
        <div class="afr-filters-t">
            <div><h4>Transacción contable</h4></div>
        </div>
        <div class="afr-info afr-h-mb">
            <div><span>N° Transacción: </span> ${det_tr.ntransaccion}</div>
            <div><span>Fecha:</span> ${FormatoDate(det_tr.fecha)}</div>
            <div><span>Tipo:</span> ${det_tr.ttransaccion ?? "-"}</div>
            <div><span>Glosa:</span> ${det_tr.glosa}</div>
        </div>
        <table class="afr-table">
            <thead>
                <tr>
                    <th>Cuenta contable</th>
                    <th class="afr-te">Debe</th>
                    <th class="afr-te">Haber</th>
                    <th>Nota</th>
                </tr>
            </thead>
            <tbody>
                ${htmlTable}
            </tbody>
        </table>
        `;

    return html;
}