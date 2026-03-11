import { ajustarAlturaTabla } from "../../../funciones/CrearTabla.js";
import { getDivisaNombre } from "../../../funciones/DatosAuxiliares.js";
import { convertirFechaATexto, formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
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
import { obtenerEstadoTransaccion } from "./Funciones.js";

/**
 * Función: Prepara y maneja el reporte de detalle de transacción.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de detalle de transacción.
 *              Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *              También proporciona opciones para descargar el reporte en diferentes formatos.
 * Fecha: 29 de enero de 2026
 * Autor: Joel Choque
 */
export async function manejarReporteDetalleTransaccion(datos) {
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

    const conNota = datosFormulario.rd_dettrans_connota;

    // Crear el contenido del reporte
    const [contenedorReporte, cuerpoReporte, contenedorBotones, divReporte] = crearContenedorReporte();
    // Opciones de descarga del reporte
    const opcionesReporte = opcionesDescargaDeReporte({
        contenedorModal: contenedorPrincipal,
        // cuerpoReporte,
        // nombreArchivo: `detalle_transaccion`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteDetalleTransaccionPdfMake({ datosReporte, datosFormulario, conNota });
            await defDocumentoPdfMake({ contenido: docDefinition, numeroPieDePagina });
        },
        callbackExcel: (conEncabezado) => {
            const fechaReporte = `${!datosFormulario.por_mes ? `Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}` : `De: ${convertirFechaATexto(datosFormulario.por_mes)}`}`
            exportarExcelDetalleTransaccion({
                datos: datosReporte,
                conNota: conNota,
                encabezado: { conEncabezado, fechaReporte, divisa: `(Expresado en ${getDivisaNombre()})` }
            });
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteDetalleTransaccion({ datosReporte, datosFormulario, conNota });
    const estructura = estructuraReporteConEncabezado();
    cuerpoReporte.innerHTML = estructura;
    const principal = cuerpoReporte.querySelector("main");
    principal.innerHTML = reporte;

    ajustarAlturaTabla(divReporte);
}

// Genera el contenido HTML del reporte de detalle de transacción
async function reporteDetalleTransaccion({ datosReporte, datosFormulario, conNota }) {
    const firmas = await FirmasContabilidad(1);
    let htmlFirmas = firmas ? `<div class="afr-signatures"> ${firmas} </div>` : "";

    const subtitulo = `
        <div><h4>Reporte Detalle Transacción</h4></div>
        <span>${!datosFormulario.por_mes ? `Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}` : `De: ${convertirFechaATexto(datosFormulario.por_mes)}`}</span>
        <div><span>(Expresado en ${getDivisaNombre()})</span></div>`;

    const FACTOR = 100;
    let htmlContenido = "";
    for (const txn of datosReporte) {
        let htmlTabla = "";
        let debe = 0;
        let haber = 0;
        for (const value of txn.detalle) {
            const debeTF = Math.round(parseFloat(value.debe || 0) * FACTOR);
            const haberTF = Math.round(parseFloat(value.haber || 0) * FACTOR);
            debe += debeTF;
            haber += haberTF;
            htmlTabla += `
                <tr>
                    <td>${value.cuenta}</td>
                    <td>${value.plan}</td>
                    ${!conNota ? "" : `<td>${value.nota}</td>`}
                    <td class="afr-te">${formatoDecimal(debeTF / FACTOR)}</td>
                    <td class="afr-te">${formatoDecimal(haberTF / FACTOR)}</td>
                </tr>`;
        };

        let estadoTransaccion = obtenerEstadoTransaccion(txn.estado, debe, haber);

        htmlTabla += `
            <tr>
                <td colspan="${!conNota ? 2 : 3}" class="afr-te afr-fwb">TOTAL: </td>
                <td class="afr-fwb afr-te">${formatoDecimal(debe / FACTOR)}</td>
                <td class="afr-fwb afr-te">${formatoDecimal(haber / FACTOR)}</td>
            </tr>`;

        htmlContenido += `
            <div class="afr-info-n">
                <div class="afr-info-left">
                    <p><span class="afr-fwb">Transacción: </span> ${txn.codigo}, <span class="afr-fwb">Fecha: </span> ${formatoFecha(txn.fecha)}</p>
                </div>
                <div class="afr-info-right">
                    <p><span>Estado:</span> ${estadoTransaccion}</p>
                </div>
            </div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cuenta</th>
                        ${!conNota ? "" : "<th>Nota</th>"}
                        <th class="afr-te">Debe</th>
                        <th class="afr-te">Haber</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTabla}
                </tbody>
            </table>
            <p><span class="afr-fwb">Glosa: </span> ${txn.glosa}</p>
            <hr style="border: 0px solid; border-top: 1px solid #cccccc; margin: 30px 0px" />`;
    }

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        ${htmlContenido}
        ${htmlFirmas}
    `;

    return html;
}

// Genera el contenido para PDFMake del reporte de detalle de transacción para descarga en PDF
async function reporteDetalleTransaccionPdfMake({ datosReporte, datosFormulario, conNota }) {
    const divisaEnUso = getDivisaNombre();
    const firmas = await firmasContabilidadPdfMake(1);

    const content = [];
    const FACTOR = 100;

    content.push(...contenidoConEncabezadoPdfMake());
    content.push(
        { text: "Reporte Detalle Transacción", style: "textoTitulo" },
        {
            stack: [
                {
                    text: !datosFormulario.por_mes ? `Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}` : `De: ${convertirFechaATexto(datosFormulario.por_mes)}`,
                    marginBottom: 1
                },
                { text: `(Expresado en ${divisaEnUso})`}
            ],
            style: "textoInformacion"
        }
    );

    for (const [i, txn] of datosReporte.entries()) {
        let debe = 0;
        let haber = 0;

        const bodyTabla = [
            [
                { text: "Código", style: "tablaEncabezado" },
                { text: "Cuenta", style: "tablaEncabezado" },
                conNota ? { text: "Nota", style: "tablaEncabezado" } : null,
                { text: "Debe", style: "tablaEncabezado", alignment: "right" },
                { text: "Haber", style: "tablaEncabezado", alignment: "right" }
            ].filter(Boolean)
        ];

        for (const value of txn.detalle) {
            const debeTF = Math.round(parseFloat(value.debe || 0) * FACTOR);
            const haberTF = Math.round(parseFloat(value.haber || 0) * FACTOR);

            debe += debeTF;
            haber += haberTF;

            bodyTabla.push([
                { text: value.cuenta || "-" },
                { text: value.plan || "-" },
                conNota ? { text: value.nota || "-" } : null,
                { text: formatoDecimal(debeTF / FACTOR), alignment: "right" },
                { text: formatoDecimal(haberTF / FACTOR), alignment: "right" }
            ].filter(Boolean));
        }

        // Fila Total
        bodyTabla.push([
            { text: "TOTAL:", colSpan: conNota ? 3 : 2, style: "tablaTextoTotal" },
            {},
            conNota ? {} : null,
            { text: formatoDecimal(debe / FACTOR), style: "tablaMontoTotal" },
            { text: formatoDecimal(haber / FACTOR), style: "tablaMontoTotal" }
        ].filter(Boolean));

        // Información de la transacción
        content.push({
            columns: [
                {
                    text: [
                        { text: "Transacción: ", bold: true }, txn.codigo,
                        { text: ", Fecha: ", bold: true }, formatoFecha(txn.fecha)
                    ],
                    style: "columnaInicio"
                },
                {
                    text: [
                        { text: "Estado: ", bold: true },
                        obtenerEstadoTransaccion(txn.estado, debe, haber)
                    ],
                    style: "columnaFinal"
                }
            ],
            marginBottom: 8
        });

        content.push(
            seccionTablaPdfMake({
                widths: ["auto", "*", conNota ? "*" : 0, "auto", "auto"].filter(w => w !== 0),
                body: bodyTabla
            })
        );

        content.push({
            text: [{ text: "Glosa: ", bold: true }, txn.glosa],
            margin: [0, 8, 0, datosReporte.length - 1 === i ? 0 : 30]
        });
    }

    if (firmas) {
        content.push(firmas());
    }

    return content;
}

// Función para exportar los datos del reporte de detalle de transacción a Excel
export function exportarExcelDetalleTransaccion({datos, conNota, encabezado = {conEncabezado: false, fechaReporte: "", divisa: ""}} = {}) {
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
    const headersText = ["Código", "Cuenta"];
    if (conNota) headersText.push("Nota");
    headersText.push("Debe", "Haber");

      // Indices de columnas
    let colCount = 2;
    if (conNota) colCount++;
    const colDebeIndex = colCount;

    if (encabezado.conEncabezado) {
        const rowLM = new Array(headersText.length).fill({ v: "" });
        rowLM[0] = { v: "Reporte Detalle Transacción", s: styleAccount };
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

    for (const [i, transaccion] of datos.entries()) {
        // Fila vacía separadora (excepto la primera cuenta)
        if (i > 0) {
            const rowVacio = new Array(headersText.length).fill({ v: "" });
            datosFinales.push(rowVacio);
            currentRow++;
        }


        const nroTransaccion = new Array(headersText.length).fill({ v: "" });
        nroTransaccion[0] = { v: "Transaccion: ", s: styleAccount};
        nroTransaccion[1] = { v: transaccion.codigo };
        datosFinales.push(nroTransaccion);
        merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        const rowFecha = new Array(headersText.length).fill({ v: "" });
        rowFecha[0] = { v: "Fecha: ", s: styleAccount};
        rowFecha[1] = { v: formatoFecha(transaccion.fecha), t: 's' };
        datosFinales.push(rowFecha);
        merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        const rowGlosa = new Array(headersText.length).fill({ v: "" });
        rowGlosa[0] = { v: "Glosa: ", s: styleAccount};
        rowGlosa[1] = { v: transaccion.glosa };
        datosFinales.push(rowGlosa);
        merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        let totalDebe = 0;
        let totalHaber = 0;

        for (const value of transaccion.detalle) {
            const debe = Math.round(parseFloat(value.debe) * FACTOR);
            const haber = Math.round(parseFloat(value.haber) * FACTOR);

            totalDebe += debe;
            totalHaber += haber;

            // Fila de Datos (Construcción directa con formato)
            const fila = [
                { v: value.cuenta ?? "", t: 's' },
                { v: value.plan, t: 's' }
            ];

            if (conNota) fila.push({ v: value.nota || "", t: 's' });

            // Números con formato
            fila.push({ v: debe / FACTOR, t: 'n', z: fmtNumero });
            fila.push({ v: haber / FACTOR, t: 'n', z: fmtNumero });

            datosFinales.push(fila);
            currentRow++;
        }

        // Fila Total Cuenta
        const rowTotal = new Array(headersText.length).fill({ v: "" });
        rowTotal[0] = { v: "TOTAL:", s: styleTotal };

        // Totales con estilo y formato
        rowTotal[colDebeIndex]     = { v: totalDebe / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
        rowTotal[colDebeIndex + 1] = { v: totalHaber / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };

        datosFinales.push(rowTotal);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;
    }

    // Fila Total General
    datosFinales.push([]); // Separador
    currentRow++;

    // Crear Hoja (Ya contiene estilos y formatos)
    const ws = XLSX.utils.aoa_to_sheet(datosFinales);
    ws['!merges'] = merges;

    // Anchos de columnas
    const cols = [
        { wch: 10 },
        { wch: 25 }
    ];
    if (conNota) cols.push({ wch: 30 });
    cols.push({ wch: 15 }, { wch: 15 });

    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Detalle Transacción");
    XLSX.writeFile(wb, `detalle_transaccion.xlsx`, { compression: true });
}