import { crearElemento, exportarAXlsx, FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"

export const VPCobros = async (url_rep, fechaInicio, fechaFin) => {
    const datoCobrados = await obtenerDatos(url_rep);
    const filtroCobrados = datoCobrados.filter(registro => registro.fecha >= fechaInicio && registro.fecha <= fechaFin && registro.pagado !== null);

    if (!datoCobrados) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    const subtitulo = `<div><h4>Cobros</h4></div> <span>${FormatoDate(fechaInicio)} - ${FormatoDate(fechaFin)}</span>`;

    let htmlTable = "";
    let deudor = 0;
    let acreedor = 0;
    for (const value of filtroCobrados) {
        // const deudorTF = parseFloat(parseFloat(value.deudor).toFixed(2));
        // const acreedorTF = parseFloat(parseFloat(value.acreedor).toFixed(2));
        // deudor += deudorTF;
        // acreedor += acreedorTF;

        htmlTable += `
            <tr>
                <td>${FormatoDate(value.fecha)}</td>
                <td>${value.numero}</td>
                <td>${value.codigo}</td>
                <td>${value.nombrep}</td>
                <td class="afr-te">${FormatoEnUs(value.monto)}</td>
                <td class="afr-te">${FormatoEnUs(value.pagado)}</td>
                <td class="afr-te">${FormatoEnUs(value.saldo)}</td>
            </tr>`;
    };
    // htmlTable += `
    //     <tr>
    //         <td colspan="2" class="afr-te afr-fwb">TOTAL: </td>
    //         <td class="afr-fwb afr-te">${FormatoEnUs(deudor)}</td>
    //         <td class="afr-fwb afr-te">${FormatoEnUs(acreedor)}</td>
    //     </tr>`;

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <table class="afr-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Factura</th>
                    <th>N° Trans.</th>
                    <th>Cliente</th>
                    <th class="afr-te">Monto Factura</th>
                    <th class="afr-te">Monto Cobrado</th>
                    <th class="afr-te">Saldo</th>
                </tr>
            </thead>
            <tbody>
                ${htmlTable}
            </tbody>
        </table>
        `;

    return html;
}