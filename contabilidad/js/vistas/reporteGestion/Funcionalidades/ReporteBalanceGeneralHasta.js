import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"
import { FirmasPDF } from "../../../funciones/VistaPDF.js";

export const ReporteBalanceGeneralHasta = async (datosForm, datosUrl) => {

    const firmas = await FirmasPDF();
    let htmlFirmas = "";
    if (firmas) {
        htmlFirmas = `<div class="afr-signatures">
            ${firmas}
        </div>`;
    }
    
    const subtitulo = `<div><h4>Reporte Balance General</h4></div> <span>Fecha: Inicio - ${FormatoDate(datosForm.fechafin)}</span>`;

    const activoDisponible = await TrTipoA(datosForm, datosUrl, '1.1.1.01.00', '1.1.2.00.00');
    const activoExigible = await TrTipoA(datosForm, datosUrl, '1.1.2.00.00', '1.1.3.00.00');
    const activoRealizable = await TrTipoA(datosForm, datosUrl, '1.1.3.00.00', '1.2.0.00.00');
    const activofijo = await TrTipoA(datosForm, datosUrl, '1.2.1.00.00', '1.2.2.00.00');
    const otroactivo = await TrTipoA(datosForm, datosUrl, '1.2.2.00.00', '2.0.0.00.00');
    const pasivoACortoPlazo = await TrTipoPP(datosForm, datosUrl, '2.0.0.00.00', '2.2.0.00.00');
    const pasivoALargoPlazo = await TrTipoPP(datosForm, datosUrl, '2.2.0.00.00', '3.0.0.00.00');
    const patrimonioPasivoLargoPlazo = await TrTipoPP(datosForm, datosUrl, '3.0.0.00.00', '4.0.0.00.00');

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <h4>Activo</h4>
        <h5>Activo Circulante</h5>
        <h6>Activo Disponible</h6>
        <table class="afr-table">
            <thead>
                <th>Código</th>
                <th>Cuenta</th>
                <th>Total</th>
            </thead>
            <tbody id="activodisponible">
                ${activoDisponible}
            </tbody>
        </table>
        <h6 style="margin-top: 20px;">Activo Exigible</h6>
        <table class="afr-table">
            <thead>
                <th>Código</th>
                <th>Cuenta</th>
                <th>Total</th>
            </thead>
            <tbody id="activoexigible">
                ${activoExigible}
            </tbody>
        </table>
        <h6 style="margin-top: 20px;">Activo Realizable</h6>
        <table class="afr-table">
            <thead>
                <th>Código</th>
                <th>Cuenta</th>
                <th>Total</th>
            </thead>
            <tbody id="activorealizable">
                ${activoRealizable}
            </tbody>
        </table>
        <h5 style="margin-top: 20px;">Activo Fijo</h5>
        <h6>Activo Fijo</h6>
        <table class="afr-table">
            <thead>
                <th>Código</th>
                <th>Cuenta</th>
                <th>Total</th>
            </thead>
            <tbody id="activofijo">
                ${activofijo}
            </tbody>
        </table>
        <h5 style="margin-top: 20px;">Otros Activos</h5>
        <h6>Otros Activo </h6>
        <table class="afr-table">
            <thead>
                <th>Código</th>
                <th>Cuenta</th>
                <th>Total</th>
            </thead>
            <tbody id="otroactivo">
                ${otroactivo}
            </tbody>
        </table>
        <h5 style="margin-top: 20px;">Pasivos</h5>
        <h6>Pasivo a corto plazo </h6>
        <table class="afr-table">
            <thead>
                <th>Código</th>
                <th>Cuenta</th>
                <th>Total</th>
            </thead>
            <tbody id="pasivoacortoplazo">
                ${pasivoACortoPlazo}
            </tbody>
        </table>
        <h6 style="margin-top: 20px;">Pasivo a Largo plazo </h6>
        <table class="afr-table">
            <thead>
                <th>Código</th>
                <th>Cuenta</th>
                <th>Total</th>
            </thead>
            <tbody id="pasivoalargoplazo">
                ${pasivoALargoPlazo}
            </tbody>
        </table>
        <h5 style="margin-top: 20px;">Patrimonio</h5>
        <h6>Pasivo a Largo plazo </h6>
        <table class="afr-table">
            <thead>
                <th>Código</th>
                <th>Cuenta</th>
                <th>Total</th>
            </thead>
            <tbody id="patrimoniopasivopargoplazo">
                ${patrimonioPasivoLargoPlazo}
            </tbody>
        </table>
        ${htmlFirmas}
    `;

    return html;
}

const TrTipoA= async (dForm, dUrl, numeroa, numerob) => {
    const datoReporte = await obtenerDatos(`${dUrl.URL}/reportebalancegeneralhasta/${dForm.fechaini}/${dForm.fechafin}/${numeroa}/${numerob}/${dUrl.empresa_id}`);
    if (!datoReporte) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    let tr = "";
    let total = 0;
    for (const value of datoReporte) {
        total += parseFloat(parseFloat(value.total).toFixed(2));
        tr += `<tr>
            <td>${value.numero}</td>
            <td>${value.plan}</td>
            <td class="afr-te">${FormatoEnUs(value.total)}</td>
        </tr>`;
    }
    tr += `
        <tr>
            <td colspan="2" class="afr-te afr-fwb">TOTAL: </td>
            <td class="afr-fwb afr-te">${FormatoEnUs(total)}</td>
        </tr>`;

    return tr;
}

const TrTipoPP= async (dForm, dUrl, numeroa, numerob) => {
    const datoReporte = await obtenerDatos(`${dUrl.URL}/reportebalancegeneralhastapp/${dForm.fechaini}/${dForm.fechafin}/${numeroa}/${numerob}/${dUrl.empresa_id}`);
    if (!datoReporte) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    let tr = "";
    let total = 0;
    for (const value of datoReporte) {
        total += parseFloat(parseFloat(value.total).toFixed(2));
        tr += `<tr>
            <td>${value.numero}</td>
            <td>${value.plan}</td>
            <td class="afr-te">${FormatoEnUs(value.total)}</td>
        </tr>`;
    }
    tr += `
        <tr>
            <td colspan="2" class="afr-te afr-fwb">TOTAL: </td>
            <td class="afr-fwb afr-te">${FormatoEnUs(total)}</td>
        </tr>`;

    return tr;
}