import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"
import { FirmasPDF } from "../../../funciones/VistaPDF.js";

export const ReporteGrupoTemplate = async (datosForm, url_rep) => {
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
    
    const subtitulo = `<div><h4>Reporte Por Grupo</h4></div> <span>Fecha: ${FormatoDate(datosForm.fini)} - ${FormatoDate(datosForm.ffin)}</span>`;

    let htmlTable = "";
    for (const template of datoReporte) {
        for (const grupo of template.grupo) {
            let detalleG = "";
            let totalG = 0;
            for (const detalle of grupo.detallegrupo) {
                totalG += parseFloat(parseFloat(detalle.total).toFixed(2));
                detalleG += ` ${detalle.nombreplan} : ${FormatoEnUs(detalle.total)} <br/>`;
            }
            htmlTable += `
                <tr>
                    <td>
                        <b>${grupo.nombre}</b><br>
                        ${detalleG}
                    </td>
                    <td class="afr-te">${FormatoEnUs(totalG)}</td>
                </tr>`;
        }
    };

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <table class="afr-table">
            <thead>
                <tr>
                    <th colspan="2">${datoReporte[0].nombre}</th>
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