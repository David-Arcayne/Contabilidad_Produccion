import { ajustarAlturaTabla } from "../../../funciones/CrearTabla.js";
import { getDivisaNombre } from "../../../funciones/DatosAuxiliares.js";
import { formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import {
    contenidoConEncabezadoPdfMake,
    crearContenedorReporte,
    defDocumentoPdfMake,
    estructuraReporteConEncabezado,
    FirmasContabilidad,
    firmasContabilidadPdfMake,
    opcionesDescargaDeReporte,
    seccionTablaPdfMake,
    verificarDatosReporte
} from "../../../funciones/VistaPDF.js";

/**
 * Función: Prepara y maneja el reporte de cuenta de resultado.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de cuenta de resultado.
 *              Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *              También proporciona opciones para descargar el reporte en diferentes formatos.
 * Fecha: 05 de febrero de 2024
 * Autor: Joel Choque
 */
export async function manejarReporteCuentaResultado(datos) {
    const {
        urlSolicitud,
        datosFormulario,
        vistaReporte,
        contenedorPrincipal,
    } = datos;

    // Obtener datos del reporte y verificar si hay error o no hay datos
    const datosReporte = await obtenerDatos(urlSolicitud);
    const estado = verificarDatosReporte(datosReporte);
    if (estado.error) {
        vistaReporte.innerHTML = estado.mensaje;
        return;
    }

    const fechaReporte = `Entre: ${formatoFecha(datosFormulario.fechaini)} y ${formatoFecha(datosFormulario.fechafin)}`;

    // Crear el contenido del reporte
    const [contenedorReporte, cuerpoReporte, contenedorBotones, divReporte] = crearContenedorReporte();
    // Opciones de descarga del reporte
    const opcionesReporte = opcionesDescargaDeReporte({
        contenedorModal: contenedorPrincipal,
        // cuerpoReporte,
        // nombreArchivo: `cuenta_de_resultado`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteCuentaResultadoPdfMake({ datosReporte, fechaReporte });
            await defDocumentoPdfMake({ contenido: docDefinition, numeroPieDePagina });
        },
        callbackExcel: (conEncabezado) => {
            exportarExcelCuentaResultado({
                datos: datosReporte,
                encabezado: { conEncabezado, fechaReporte, divisa: `(Expresado en ${getDivisaNombre()})` }
            });
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteCuentaResultado({ datosReporte, fechaReporte });
    const estructura = estructuraReporteConEncabezado();
    cuerpoReporte.innerHTML = estructura;
    const principal = cuerpoReporte.querySelector("main");
    principal.innerHTML = reporte;

    ajustarAlturaTabla(divReporte);
}

// Genera el contenido HTML del reporte de Cuenta de Resultado para vista en pantalla
async function reporteCuentaResultado({ datosReporte, fechaReporte }) {
    if (datosReporte.error) {
        return `<div class="py-5 fw-bold text-center text-info">Las transacciones dentro del periodo seleccionado previamente deben ser consolidados</div>`;
    }

    const firmas = await FirmasContabilidad(5);
    let htmlFirmas = firmas ? `<div class="afr-signatures"> ${firmas} </div>` : "";


    const subtitulo = `
        <div><h4>Detalle de Cuentas de Resultado</h4></div>
        <span>${fechaReporte}</span>
        <div><span>(Expresado en ${getDivisaNombre()})</span></div>`;

    const FACTOR = 100;
    let htmlTable = "";
    let debe = 0;
    let haber = 0;
    let deudor = 0;
    let acreedor = 0;
    for (const value of datosReporte) {
        const debeTF = Math.round(parseFloat(value.debe || 0) * FACTOR);
        const haberTF = Math.round(parseFloat(value.haber || 0) * FACTOR);
        const deudorTF = Math.round(parseFloat(value.deudor || 0) * FACTOR);
        const acreedorTF = Math.round(parseFloat(value.acreedor || 0) * FACTOR);
        debe += debeTF;
        haber += haberTF;
        deudor += deudorTF;
        acreedor += acreedorTF;
        htmlTable += `
            <tr>
                <td>${value.codigo}</td>
                <td>${value.plan}</td>
                <td class="afr-te">${formatoDecimal(debeTF / FACTOR)}</td>
                <td class="afr-te">${formatoDecimal(haberTF / FACTOR)}</td>
                <td class="afr-te">${formatoDecimal(deudorTF / FACTOR)}</td>
                <td class="afr-te">${formatoDecimal(acreedorTF / FACTOR)}</td>
            </tr>`;
    };
    htmlTable += `
        <tr>
            <td colspan="2" class="afr-te afr-fwb">TOTAL: </td>
            <td class="afr-fwb afr-te">${formatoDecimal(debe / FACTOR)}</td>
            <td class="afr-fwb afr-te">${formatoDecimal(haber / FACTOR)}</td>
            <td class="afr-fwb afr-te">${formatoDecimal(deudor / FACTOR)}</td>
            <td class="afr-fwb afr-te">${formatoDecimal(acreedor / FACTOR)}</td>
        </tr>`;

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <table class="afr-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Cuenta</th>
                    <th class="afr-te">Debe</th>
                    <th class="afr-te">Haber</th>
                    <th class="afr-te">Deudor</th>
                    <th class="afr-te">Acreedor</th>
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

// Genera el contenido para PDFMake del reporte de Cuenta de Resultado para descarga en PDF
async function reporteCuentaResultadoPdfMake({ datosReporte, fechaReporte }) {
    if (datosReporte.error) {
        return;
    }

    const divisaEnUso = getDivisaNombre();
    const firmas = await firmasContabilidadPdfMake(5);

    const content = [];
    const FACTOR = 100;

    let debe = 0;
    let haber = 0;
    let deudor = 0;
    let acreedor = 0;

    const bodyTabla = [
        [
            { text: "Código", style: "tablaEncabezado" },
            { text: "Cuenta", style: "tablaEncabezado" },
            { text: "Debe", style: "tablaEncabezado", alignment: "right" },
            { text: "Haber", style: "tablaEncabezado", alignment: "right" },
            { text: "Deudor", style: "tablaEncabezado", alignment: "right" },
            { text: "Acreedor", style: "tablaEncabezado", alignment: "right" }
        ]
    ];

    for (const value of datosReporte) {
        const debeTF = Math.round(parseFloat(value.debe || 0) * FACTOR);
        const haberTF = Math.round(parseFloat(value.haber || 0) * FACTOR);
        const deudorTF = Math.round(parseFloat(value.deudor || 0) * FACTOR);
        const acreedorTF = Math.round(parseFloat(value.acreedor || 0) * FACTOR);

        debe += debeTF;
        haber += haberTF;
        deudor += deudorTF;
        acreedor += acreedorTF;

        bodyTabla.push([
            { text: value.codigo ?? "-" },
            { text: value.plan ?? "-" },
            { text: formatoDecimal(debeTF / FACTOR), alignment: "right" },
            { text: formatoDecimal(haberTF / FACTOR), alignment: "right" },
            { text: formatoDecimal(deudorTF / FACTOR), alignment: "right" },
            { text: formatoDecimal(acreedorTF / FACTOR), alignment: "right" }
        ]);
    }

    bodyTabla.push([
        { text: "TOTAL:", colSpan: 2, style: "tablaTextoTotal" },
        {},
        { text: formatoDecimal(debe / FACTOR), style: "tablaMontoTotal" },
        { text: formatoDecimal(haber / FACTOR), style: "tablaMontoTotal" },
        { text: formatoDecimal(deudor / FACTOR), style: "tablaMontoTotal" },
        { text: formatoDecimal(acreedor / FACTOR), style: "tablaMontoTotal" }
    ]);

    content.push(...contenidoConEncabezadoPdfMake());
    content.push(
        { text: "Detalle de Cuentas de Resultado", style: "textoTitulo" },
        {
            stack: [
                { text: fechaReporte, marginBottom: 1 },
                { text: `(Expresado en ${divisaEnUso})` }
            ],
            style: "textoInformacion"
        }
    );

    content.push(
        seccionTablaPdfMake({
            widths: ["auto", "*", "auto", "auto", "auto", "auto"],
            body: bodyTabla
        })
    );

    if (firmas) {
        content.push(firmas());
    }

    return content;
}

export function exportarExcelCuentaResultado({datos, encabezado = {conEncabezado: false, fechaReporte: "", divisa: ""}} = {}) {
    const wb = XLSX.utils.book_new();

    // Definición de Estilos (Reutilizables)
    const styleHeader  = { font: { bold: true } };
    const styleTotal   = { font: { bold: true }, alignment: { horizontal: "right" } };
    const styleAccount = { font: { bold: true } }; // Nombre de cuenta en negrita
    const fmtNumero    = '#,##0.00';

    const FACTOR = 100;
    const datosFinales = [];
    const merges = [];
    let currentRow = 0;

     // Definir Encabezados
    const headersText = ["Código", "Cuenta", "Debe", "Haber", "Deudor", "Acreedor"];

      // Indices de columnas
    let colCount = 2;
    const colDebeIndex = colCount;

    if (encabezado.conEncabezado) {
        const rowLM = new Array(headersText.length).fill({ v: "" });
        rowLM[0] = { v: "Detalle de Cuentas de Resultado", s: styleAccount };
        datosFinales.push(rowLM);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        const rowFecha = new Array(headersText.length).fill({ v: "" });
        rowFecha[0] = { v: encabezado.fechaReporte, s: styleAccount };
        datosFinales.push(rowFecha);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        const rowDivisa = new Array(headersText.length).fill({ v: "" });
        rowDivisa[0] = { v: encabezado.divisa, s: styleAccount };
        datosFinales.push(rowDivisa);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        const rowVacio = new Array(headersText.length).fill({ v: "" });
        datosFinales.push(rowVacio);
        currentRow++;
    }

    // Convertimos textos a Objetos Celda con estilo Header
    const encabezados = headersText.map(t => ({ v: t, s: styleHeader }));

    datosFinales.push(encabezados);
    currentRow++;

    let totalDebe = 0;
    let totalHaber = 0;
    let totalDeudor = 0;
    let totalAcreedor = 0;
    for (const valor of datos) {

        const debe = Math.round(parseFloat(valor.debe) * FACTOR);
        const haber = Math.round(parseFloat(valor.haber) * FACTOR);
        const deudor = Math.round(parseFloat(valor.deudor) * FACTOR);
        const acreedor = Math.round(parseFloat(valor.acreedor) * FACTOR);

        totalDebe += debe;
        totalHaber += haber;
        totalDeudor += deudor;
        totalAcreedor += acreedor;

        // Fila de Datos (Construcción directa con formato)
        const claseFactura = valor.clasefactura ? (valor.clasefactura === "1" ? "Compra" : (valor.clasefactura === "2" ? "Venta" : "-")) : "-";
        const fila = [
            { v: valor.codigo || "", t: 's' },
            { v: valor.plan || "", t: 's' },
            { v: debe / FACTOR, t: 'n', z: fmtNumero},
            { v: haber / FACTOR, t: 'n', z: fmtNumero},
            { v: deudor / FACTOR, t: 'n', z: fmtNumero},
            { v: acreedor / FACTOR, t: 'n', z: fmtNumero},
        ];

        datosFinales.push(fila);
        currentRow++;
    }

    // Fila Total Cuenta
    const rowTotal = new Array(headersText.length).fill({ v: "" });
    rowTotal[0] = { v: "TOTAL:", s: styleTotal };

    // Totales con estilo y formato
    rowTotal[colDebeIndex]     = { v: totalDebe / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
    rowTotal[colDebeIndex + 1]     = { v: totalHaber / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
    rowTotal[colDebeIndex + 2]     = { v: totalDeudor / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
    rowTotal[colDebeIndex + 3]     = { v: totalAcreedor / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };

    datosFinales.push(rowTotal);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
    currentRow++;


    // Crear Hoja (Ya contiene estilos y formatos)
    const ws = XLSX.utils.aoa_to_sheet(datosFinales);
    ws['!merges'] = merges;

    // Anchos de columnas
    const cols = [
        { wch: 12 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
    ];
    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Cuentas de Resultado");
    XLSX.writeFile(wb, `cuentas_de_resultado.xlsx`, { compression: true });
}