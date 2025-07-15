import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";

export const ContenidoPDF = (url) => async () => {
    const data = await obtenerDatos(url);
    if(data.length === 0) {
        return `<div class="py-5 fw-bold text-center">No se encontraron datos</div>`;
    }
    if (!data || !data[0].hasOwnProperty("ufv")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }
    
    const dataST = data;

    let tbody = '';
    for (const value of dataST) {
        tbody += `
            <tr>
                <td>${FormatoDate(value.fecha)}</td>
                <td class="afr-te">${value.ufv}</td>
                <td class="afr-te">${FormatoEnUs(value.dolar)}</td>
            </tr>`;
    };

    let html = '';
    if (dataST && dataST.length > 0) {
        html = `
            <div>
                <h1>Reporte tipo de cambio</h1>
            </div>
            <div class="afr-filter-void"></div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>UFV</th>
                        <th>Dolar</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbody}
                </tbody>
            </table>`;
    }

    return html;
}