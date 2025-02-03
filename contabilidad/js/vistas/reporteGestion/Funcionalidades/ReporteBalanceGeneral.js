import { FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"
import { FirmasPDF } from "../../../funciones/VistaPDF.js";

export const ReporteBalanceGeneral = async (datosForm, datosUrl) => {

    const firmas = await FirmasPDF();
    let htmlFirmas = "";
    if (firmas) {
        htmlFirmas = `<div class="afr-signatures">
            ${firmas}
        </div>`;
    }
    
    const subtitulo = `<div><h4>Reporte Activo y Pasivo</h4></div> <span>Fecha: ${FormatoDate(datosForm.fechaini)} - ${FormatoDate(datosForm.fechafin)}</span>`;

    const activoDisponible = await TrTipoA(datosForm, datosUrl, '1.1.1.01.00', '1.1.2.00.00');
    const activoExigible = await TrTipoA(datosForm, datosUrl, '1.1.2.00.00', '1.1.3.00.00');
    const activoRealizable = await TrTipoA(datosForm, datosUrl, '1.1.3.00.00', '1.2.0.00.00');
    const activofijo = await TrTipoA(datosForm, datosUrl, '1.2.1.00.00', '1.2.2.00.00');
    const otroactivo = await TrTipoA(datosForm, datosUrl, '1.2.2.00.00', '2.0.0.00.00');
    const pasivoACortoPlazo = await TrTipoPP(datosForm, datosUrl, '2.0.0.00.00', '2.2.0.00.00');
    const pasivoALargoPlazo = await TrTipoPP(datosForm, datosUrl, '2.2.0.00.00', '3.0.0.00.00');
    const patrimonioPasivoLargoPlazo = await TrTipoPP(datosForm, datosUrl, '3.0.0.00.00', '4.0.0.00.00');

    const ad_ae_ar = parseFloat(activoDisponible[1]) + parseFloat(activoExigible[1]) + parseFloat(activoRealizable[1]);
    const t_af_oa = ad_ae_ar + parseFloat(activofijo[1]) + parseFloat(otroactivo[1]);
    const pcp_plp = parseFloat(pasivoACortoPlazo[1]) + parseFloat(pasivoALargoPlazo[1]);
    const t_pplp = pcp_plp + parseFloat(patrimonioPasivoLargoPlazo[1]);

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <table class="afr-table-bordered">
                <tr>
                    <th></th>
                    <th>Activo</th>
                    <th></th>
                    <th></th>
                    <th class="afr-te" id="activot">${FormatoEnUs(t_af_oa)}</th>
                </tr>
                <tr>
                    <th></th>
                    <th>Activo Circulante</th>
                    <th></th>
                    <th class="afr-te" id="activocirculantet">${FormatoEnUs(ad_ae_ar)}</th>
                    <th></th>
                </tr>
                <tr>
                    <th></th>
                    <th>Activo Disponible</th>
                    <th class="afr-te" id="activodisponiblet">${FormatoEnUs(activoDisponible[1])}</th>
                    <th></th>
                    <th></th>
                </tr>
                <tbody id="activodisponible">
                    ${activoDisponible[0]}
                </tbody>
                <tr>
                    <th></th>
                    <th>Activo Exigible</th>
                    <th class="afr-te" id="activoexigiblet">${FormatoEnUs(activoExigible[1])}</th>
                    <th></th>
                    <th></th>
                </tr>
                <tbody id="activoexigible">
                    ${activoExigible[0]}
                </tbody>
                <tr>
                    <th></th>
                    <th>Activo Realizable</th>
                    <th class="afr-te" id="activorealizablet">${FormatoEnUs(activoRealizable[1])}</th>
                    <th></th>
                    <th></th>
                </tr>
                <tbody id="activorealizable">
                    ${activoRealizable[0]}
                </tbody>
                <tr>
                    <th></th>
                    <th>Activo Fijo</th>
                    <th class="afr-te" id="activofijot">${FormatoEnUs(activofijo[1])}</th>
                    <th></th>
                    <th></th>
                </tr>
                <tbody id="activofijo">
                    ${activofijo[0]}
                </tbody>
                <tr>
                    <th></th>
                    <th>Otros Activos</th>
                    <th class="afr-te" id="otroactivot">${FormatoEnUs(otroactivo[1])}</th>
                    <th></th>
                    <th></th>
                </tr>
                <tbody id="otroactivo">
                    ${otroactivo[0]}
                </tbody>
                <tr>
                    <th></th>
                    <th>Pasivos</th>
                    <th></th>
                    <th></th>
                    <th class="afr-te" id="pasivot">${FormatoEnUs(pcp_plp)}</th>
                </tr>
                <tr>
                    <th></th>
                    <th>Pasivo a corto plazo</th>
                    <th class="afr-te" id="pasivocortoplazot">${FormatoEnUs(pasivoACortoPlazo[1])}</th>
                    <th></th>
                    <th></th>
                </tr>
                <tbody id="pasivoacortoplazo">
                    ${pasivoACortoPlazo[0]}
                </tbody>
                <tr>
                    <th></th>
                    <th>Pasivo a largo plazo</th>
                    <th class="afr-te" id="pasivolargoplazot">${FormatoEnUs(pasivoALargoPlazo[1])}</th>
                    <th></th>
                    <th></th>
                </tr>
                <tbody id="pasivoalargoplazo">
                    ${pasivoALargoPlazo[0]}
                </tbody>
                <tr>
                    <th></th>
                    <th>Patrimonio</th>
                    <th></th>
                    <th class="afr-te" id="patrimoniot">${FormatoEnUs(patrimonioPasivoLargoPlazo[1])}</th>
                    <th></th>
                </tr>
                <tbody id="patrimoniopasivopargoplazo">
                    ${patrimonioPasivoLargoPlazo[0]}
                </tbody>
                <tr>
                    <th></th>
                    <th>Total Pasivo y Patrimonio</th>
                    <th></th>
                    <th></th>
                    <th class="afr-te" id="tpasivopatrimoniot">${FormatoEnUs(t_pplp)}</th>
                </tr>
        </table>
        ${htmlFirmas}
    `;

    return html;
}

const TrTipoA= async (dForm, dUrl, numeroa, numerob) => {
    const datoReporte = await obtenerDatos(`${dUrl.URL}/reportebalancegeneral/${dForm.fechaini}/${dForm.fechafin}/${numeroa}/${numerob}/${dUrl.empresa_id}`);
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
            <td></td>
            <td></td>
        </tr>`;
    }

    return [tr, total.toFixed(2)];
}

const TrTipoPP= async (dForm, dUrl, numeroa, numerob) => {
    const datoReporte = await obtenerDatos(`${dUrl.URL}/reportebalancegeneralpp/${dForm.fechaini}/${dForm.fechafin}/${numeroa}/${numerob}/${dUrl.empresa_id}`);
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
            <td></td>
            <td></td>
        </tr>`;
    }

    return [tr, total.toFixed(2)];
}