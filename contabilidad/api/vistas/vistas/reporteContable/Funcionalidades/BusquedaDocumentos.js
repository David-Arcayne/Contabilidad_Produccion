import { ajustarAlturaTabla } from "../../../funciones/CrearTabla.js";
import { getDivisaNombre } from "../../../funciones/DatosAuxiliares.js";
import { formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import {
    contenidoConEncabezadoPdfMake,
    crearContenedorReporte,
    defDocumentoPdfMake,
    estructuraReporteConEncabezado,
    opcionesDescargaDeReporte,
    seccionTablaPdfMake,
    verificarDatosReporte
} from "../../../funciones/VistaPDF.js";

/**
 * Función: Prepara y maneja el reporte de búsqueda de documentos.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de búsqueda de documentos.
 *              Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *              También proporciona opciones para descargar el reporte en diferentes formatos.
 * Fecha: 05 de febrero de 2026
 * Autor: Joel Choque
 */
export async function manejarReporteBusquedaDocumentos(datos) {
    const {
        urlSolicitud,
        datosFormulario,
        vistaReporte,
        contenedorPrincipal,
        filtrosAplicados
    } = datos;

    // Obtener datos del reporte y verificar si hay error o no hay datos
    const datosReporte = await obtenerDatos(urlSolicitud);
    const estado = verificarDatosReporte(datosReporte);
    if (estado.error) {
        vistaReporte.innerHTML = estado.mensaje;
        return;
    }

    // Crear el contenido del reporte
    const [contenedorReporte, cuerpoReporte, contenedorBotones, divReporte] = crearContenedorReporte();
    // Opciones de descarga del reporte
    const opcionesReporte = opcionesDescargaDeReporte({
        contenedorModal: contenedorPrincipal,
        // cuerpoReporte,
        // nombreArchivo: `documentos`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteBusquedaDocumentosPdfMake({ datosReporte, filtrosAplicados: filtrosAplicados.filtroPdfMake });
            await defDocumentoPdfMake({ contenido: docDefinition, numeroPieDePagina });
        },
        callbackExcel: (conEncabezado) => {
            exportarExcelFiltroDocs({
                datos: datosReporte,
                encabezado: { conEncabezado, divisa: `(Expresado en ${getDivisaNombre()})` }
            });
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteBusquedaDocumentos({ datosReporte, filtrosAplicados: filtrosAplicados.filtroHtml });
    const estructura = estructuraReporteConEncabezado();
    cuerpoReporte.innerHTML = estructura;
    const principal = cuerpoReporte.querySelector("main");
    principal.innerHTML = reporte;

    ajustarAlturaTabla(divReporte);
}

// Genera el contenido HTML del reporte de búsqueda de documentos
async function reporteBusquedaDocumentos({ datosReporte, filtrosAplicados }) {

    let htmlFirmas = "";

    const subtitulo = `
        <div><h4>Documentos</h4></div>
        <div><p class="m-0">${filtrosAplicados}</p></div>
        <div><span>(Expresado en ${getDivisaNombre()})</span></div>`;

    const FACTOR = 100;
    let htmlTable = "";
    let saldo = 0;
    let contador = 0;
    for (const txn of datosReporte) {
        saldo += Math.round(parseFloat(txn.precio || 0) * FACTOR);
        contador++;
        htmlTable += `
            <tr>
                <td>${contador}</td>
                <td>${formatoFecha(txn.fecha)}</td>
                <td>${txn.nro_otras_cuentas}</td>
                <td>${txn.razon_social || "-"}</td>
                <td class="afr-te">${formatoDecimal(txn.precio)}</td>
                <td>${txn.estado_ || "-"}</td>
                <td>${txn.nro_transaccion || "-"}</td>
            </tr>`;
    }
    htmlTable += `
        <tr>
            <td colspan="4" class="afr-te afr-fwb">TOTAL: </td>
            <td class="afr-fwb afr-te">${formatoDecimal(saldo / FACTOR)}</td>
        </tr>`;

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <table class="afr-table">
            <thead>
                <tr>
                    <th>N°</th>
                    <th>Fecha</th>
                    <th>N°. Doc.</th>
                    <th>Nombre o Razón social</th>
                    <th class="afr-te">Monto</th>
                    <th>Estado</th>
                    <th>N° Trans.</th>
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

// Genera el contenido para PDFMake del reporte de documentos para descarga en PDF
async function reporteBusquedaDocumentosPdfMake({ datosReporte, filtrosAplicados }) {
    const divisaEnUso = getDivisaNombre();

    const content = [];
    const FACTOR = 100;
    let saldo = 0;
    let contador = 0;

    const bodyTabla = [
        [
            { text: "N°", style: "tablaEncabezado" },
            { text: "Fecha", style: "tablaEncabezado" },
            { text: "N°. Doc.", style: "tablaEncabezado" },
            { text: "Nombre o Razón social", style: "tablaEncabezado" },
            { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            { text: "Estado", style: "tablaEncabezado" },
            { text: "N° Trans.", style: "tablaEncabezado" }
        ]
    ];

    for (const txn of datosReporte) {
        contador++;
        const precioTF = Math.round(parseFloat(txn.precio || 0) * FACTOR);
        saldo += precioTF;

        bodyTabla.push([
            { text: contador },
            { text: formatoFecha(txn.fecha) },
            { text: txn.nro_otras_cuentas ?? "-" },
            { text: txn.razon_social || "-" },
            { text: formatoDecimal(precioTF / FACTOR), alignment: "right" },
            { text: txn.estado_ || "-" },
            { text: txn.nro_transaccion || "-" }
        ]);
    }

    bodyTabla.push([
        { text: "TOTAL:", colSpan: 4, style: "tablaTextoTotal" },
        {}, {}, {},
        { text: formatoDecimal(saldo / FACTOR), style: "tablaMontoTotal" },
        { text: "", colSpan: 2 }, {}
    ]);

    content.push(...contenidoConEncabezadoPdfMake());
    content.push(
        { text: "Documentos", style: "textoTitulo" },
        {
            stack: [
                { text: filtrosAplicados, marginBottom: 1 },
                { text: `(Expresado en ${divisaEnUso})` },
            ],
            style: "textoInformacion",
        }
    );

    content.push(
        seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "*", "auto", "auto", "auto"],
            body: bodyTabla
        })
    );

    return content;
}

// Función para exportar los datos del reporte de búsqueda de documentos a Excel
function exportarExcelFiltroDocs({datos, encabezado = {conEncabezado: false, divisa: ""}} = {}) {

    const wb = XLSX.utils.book_new();

    // Definición de Estilos (Reutilizables)
    const styleHeader  = { font: { bold: true } };
    const styleTotal   = { font: { bold: true }, alignment: { horizontal: "right" } };
    const styleAccount = { font: { bold: true } };
    const styleFecha  = { alignment: { horizontal: "right" } };
    const fmtNumero    = '#,##0.00';

    const datosFinales = [];
    const merges = [];
    const FACTOR = 100;
    let currentRow = 0;

     // Definir Encabezados
    const headersText = ["N°", "Fecha", "N° Doc.", "Nombre o Razón social", "Monto", "Estado", "N° Trans."];

      // Indices de columnas
    let colCount = 4;
    const colDebeIndex = colCount;

    if (encabezado.conEncabezado) {
        const rowLM = new Array(headersText.length).fill({ v: "" });
        rowLM[0] = { v: "Documentos", s: styleAccount };
        datosFinales.push(rowLM);
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

    let contador = 0;
    let totalMonto = 0;

    for (const value of datos) {
        contador ++;
        const monto = Math.round(parseFloat(value.precio || 0) * FACTOR);

        totalMonto += monto;

        // Fila de Datos (Construcción directa con formato)
        const fila = [
            { v: contador, t: 'n' },
            { v: formatoFecha(value.fecha), t: 's', s: styleFecha },
            { v: value.nro_otras_cuentas || "", t: 's' },
            { v: value.razon_social || "", t: 's' },
            { v: monto / FACTOR, t: 'n', z: fmtNumero },
            { v: value.estado || "", t: 's' },
            { v: value.nro_transaccion || "", t: 's' },
        ];

        datosFinales.push(fila);
        currentRow++;
    }

    // Fila Total Cuenta
    const rowTotal = new Array(headersText.length).fill({ v: "" });
    rowTotal[0] = { v: "TOTAL:", s: styleTotal };
    rowTotal[colDebeIndex] = { v: totalMonto / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };

    datosFinales.push(rowTotal);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
    currentRow++;

    // Crear Hoja (Ya contiene estilos y formatos)
    const ws = XLSX.utils.aoa_to_sheet(datosFinales);
    ws['!merges'] = merges;

    // Anchos de columnas
    const cols = [
        { wch: 8 },
        { wch: 12 },
        { wch: 12 },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 },
        { wch: 10 }
    ];
    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Documentos");
    XLSX.writeFile(wb, `documentos.xlsx`, { compression: true });
}