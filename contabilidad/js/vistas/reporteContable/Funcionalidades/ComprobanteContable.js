import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"
import { EncabezadoPDF, FirmasPDF } from "../../../funciones/VistaPDF.js";

export const ComprobanteContable = async (datosForm, url_rep) => {
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

    const subtitulo = `<div><h4>Comprobante Contable</h4></div> <span>(Expresado en Bolivianos)</span>`;

    const htmlEncabezado= EncabezadoPDF();

    let htmlContenido = "";
    for (const tt of datoReporte) {
        let debe = 0;
        let haber = 0;
        let htmlTable = "";
        let htmlFacturas = "";
        for (const lista of tt.detalle) {
            const debeTF = parseFloat(parseFloat(lista.debe).toFixed(2));
            const haberTF = parseFloat(parseFloat(lista.haber).toFixed(2));
            debe += debeTF;
            haber += haberTF;
            htmlTable += `
                <tr>
                    <td>${lista.numero}</td>
                    <td>${lista.plan}</td>
                    <td class="afr-te">${FormatoEnUs(debeTF)}</td>
                    <td class="afr-te">${FormatoEnUs(haberTF)}</td>
                </tr>`;
        }
        htmlTable += `
            <tr>
                <td colspan="2" class="afr-te afr-fwb">Total: </td>
                <td class="afr-te afr-fwb">${FormatoEnUs(debe)}</td>
                <td class="afr-te afr-fwb">${FormatoEnUs(haber)}</td>
            </tr>`;
        
        if (tt.facturas?.length > 0) {
            let total = 0;
            let htmlTableF = "";
            for (const lista of tt.facturas) {
                total += parseFloat(parseFloat(lista.monto).toFixed(2));
                htmlTableF += `
                    <tr>
                        <td>${FormatoDate(lista.fecha)}</td>
                        <td>${lista.cliente}</td>
                        <td>${lista.nfactura}</td>
                        <td>${lista.nit}</td>
                        <td class="afr-te">${FormatoEnUs(lista.monto)}</td>
                    </tr>`;
            }
            htmlTableF += `
                <tr>
                    <td colspan="4" class="afr-te afr-fwb">Total: </td>
                    <td class="afr-te afr-fwb">${FormatoEnUs(total)}</td>
                </tr>`;

            htmlFacturas = `
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Nombre o Razón Social</th>
                            <th>N°. Factura</th>
                            <th>NIT</th>
                            <th class="afr-te">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${htmlTableF}
                    </tbody>
                </table>`;
        }

        htmlContenido += `
            ${htmlEncabezado}
            <section>
                <div class="afr-filters-t">
                    ${subtitulo}
                </div>
                <div class="afr-info">
                    <div><span>N° Transacción:</span> ${tt.codigo}</div>
                    <div><span>Fecha:</span> ${FormatoDate(tt.fecha)}</div>
                    <div><span>Tipo de Transacción:</span> ${tt.tipo ?? "-"}</div>
                </div>
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cuenta</th>
                            <th class="afr-te">Debe</th>
                            <th class="afr-te">Haber</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${htmlTable}
                    </tbody>
                </table>
                <p><span class="afr-fwb">Glosa: </span> ${tt.glosa}</p>
                ${htmlFacturas}
                ${htmlFirmas}
            </section>
            <div class="html2pdf__page-break"></div>`;
    }

    return htmlContenido;
}