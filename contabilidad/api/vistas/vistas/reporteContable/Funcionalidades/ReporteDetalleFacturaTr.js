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
 * Función: Prepara y maneja el reporte de detalle de facturas por transacción.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de detalle de facturas por transacción.
 *              Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *              También proporciona opciones para descargar el reporte en diferentes formatos.
 * Fecha: 29 de enero de 2026
 * Autor: Joel Choque
 */
export async function manejarReporteDetalleFactTrans(datos) {
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

    // Crear el contenido del reporte
    const [contenedorReporte, cuerpoReporte, contenedorBotones, divReporte] = crearContenedorReporte();
    // Opciones de descarga del reporte
    const opcionesReporte = opcionesDescargaDeReporte({
        contenedorModal: contenedorPrincipal,
        // cuerpoReporte,
        // nombreArchivo: `detalle_factura_tr`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteDetalleFactTransPdfMake({ datosReporte, datosFormulario });
            await defDocumentoPdfMake({ contenido: docDefinition, numeroPieDePagina });
        },
        callbackExcel: (conEncabezado) => {
            const fechaReporte = `${!datosFormulario.por_mes ? `Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}` : `De: ${convertirFechaATexto(datosFormulario.por_mes)}`}`
            exportarExcelFacturaTransaccion({
                datos: datosReporte,
                encabezado: { conEncabezado, fechaReporte, divisa: `(Expresado en ${getDivisaNombre()})` }
            });
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteDetalleFactTrans({ datosReporte, datosFormulario });
    const estructura = estructuraReporteConEncabezado();
    cuerpoReporte.innerHTML = estructura;
    const principal = cuerpoReporte.querySelector("main");
    principal.innerHTML = reporte;

    ajustarAlturaTabla(divReporte);
}

// Genera el contenido HTML del reporte de detalle de facturas por transacción
async function reporteDetalleFactTrans({ datosReporte, datosFormulario }) {
    const firmas = await FirmasContabilidad(1);
    let htmlFirmas = firmas ? `<div class="afr-signatures"> ${firmas} </div>` : "";

    const subtitulo = `
        <div><h4>Detalle Facturas por Transacción</h4></div>
        <span>${!datosFormulario.por_mes ? `Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}` : `De: ${convertirFechaATexto(datosFormulario.por_mes)}`}</span>
        <div><span>(Expresado en ${getDivisaNombre()})</span></div>`;

    const FACTOR = 100;
    let htmlContenido = "";

    for (const txn of datosReporte) {
        let htmlTabla = "";
        let monto = 0;
        for (const value of txn.facturas) {
            const claseFactura = value.clasefactura ? (value.clasefactura === "1" ? "Compra" : (value.clasefactura === "2" ? "Venta" : "-")) : "-";
            const montoTF = Math.round(parseFloat(value.monto) * FACTOR);
            monto += montoTF;
            htmlTabla += `
                <tr>
                    <td>${formatoFecha(value.fecha)}</td>
                    <td>${value.nit}</td>
                    <td>${value.proveedor}</td>
                    <td>${value.nfactura}</td>
                    <td>${claseFactura}</td>
                    <td class="afr-te">${formatoDecimal(montoTF / FACTOR)}</td>
                </tr>`;
        };

        let estadoTransaccion = obtenerEstadoTransaccion(txn.estado);

        htmlTabla += `
            <tr>
                <td colspan="5" class="afr-te afr-fwb">TOTAL: </td>
                <td class="afr-fwb afr-te">${formatoDecimal(monto / FACTOR)}</td>
            </tr>`;

        htmlContenido += `
            <div class="afr-info-n">
                <div class="afr-info-left">
                    <p><span class="afr-fwb">Transacción: </span> ${txn.transaccion}, <span class="afr-fwb">Fecha: </span> ${formatoFecha(txn.fechat)}</p>
                </div>
                <div class="afr-info-right">
                    <p><span>Estado:</span> ${estadoTransaccion}</p>
                </div>
            </div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Nit</th>
                        <th>Nombre o Razon Social</th>
                        <th>N. Factura</th>
                        <th>Tipo factura</th>
                        <th class="afr-te">Total Facturado</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTabla}
                </tbody>
            </table>
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

// Genera el contenido para PDFMake del reporte de detalle de facturas por transacción para descarga en PDF
async function reporteDetalleFactTransPdfMake({ datosReporte, datosFormulario }) {
    const divisaEnUso = getDivisaNombre();
    const firmas = await firmasContabilidadPdfMake(1);

    const content = [];
    const FACTOR = 100;

    content.push(...contenidoConEncabezadoPdfMake());
    content.push(
        { text: "Detalle Facturas por Transacción", style: "textoTitulo" },
        {
            stack: [
                {
                    text: !datosFormulario.por_mes ? `Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}` : `De: ${convertirFechaATexto(datosFormulario.por_mes)}`,
                    marginBottom: 1
                },
                { text: `(Expresado en ${divisaEnUso})` }
            ],
            style: "textoInformacion"
        }
    );

    for (const [i, txn] of datosReporte.entries()) {
        let monto = 0;

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Nit", style: "tablaEncabezado" },
                { text: "Nombre o Razon Social", style: "tablaEncabezado" },
                { text: "N. Factura", style: "tablaEncabezado" },
                { text: "Tipo factura", style: "tablaEncabezado" },
                { text: "Total Facturado", style: "tablaEncabezado", alignment: "right" }
            ]
        ];

        for (const value of txn.facturas) {
            const claseFactura = value.clasefactura ? (value.clasefactura === "1" ? "Compra" : (value.clasefactura === "2" ? "Venta" : "-")) : "-";
            const montoTF = Math.round(parseFloat(value.monto) * FACTOR);
            monto += montoTF;

            bodyTabla.push([
                { text: formatoFecha(value.fecha) || "-" },
                { text: value.nit || "-" },
                { text: value.proveedor || "-" },
                { text: value.nfactura || "-" },
                { text: claseFactura },
                { text: formatoDecimal(montoTF / FACTOR), alignment: "right" }
            ]);
        }

        bodyTabla.push([
            { text: "TOTAL:", colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: formatoDecimal(monto / FACTOR), style: "tablaMontoTotal" }
        ]);

        content.push({
            columns: [
                {
                    text: [
                        { text: "Transacción: ", bold: true }, txn.transaccion,
                        { text: ", Fecha: ", bold: true }, formatoFecha(txn.fechat)
                    ],
                    style: "columnaInicio"
                },
                {
                    text: [
                        { text: "Estado: ", bold: true },
                        obtenerEstadoTransaccion(txn.estado)
                    ],
                    style: "columnaFinal"
                }
            ],
            marginBottom: 8
        });

        content.push(
            seccionTablaPdfMake({
                widths: ["auto", "auto", "*", "auto", "auto", "auto"],
                body: bodyTabla
            }, {
                estilosTabla: { marginBottom: i === datosReporte.length -1 ? 0 : 30 }
            })
        );
    }

    if (firmas) {
        content.push(firmas());
    }

    return content;
}

// Función para exportar los datos del reporte de detalle de facturas por transacción a Excel
export function exportarExcelFacturaTransaccion({datos, encabezado = {conEncabezado: false, fechaReporte: "", divisa: ""}} = {}) {
    const wb = XLSX.utils.book_new();

    // Definición de Estilos (Reutilizables)
    const styleHeader  = { font: { bold: true } };
    const styleTotal   = { font: { bold: true }, alignment: { horizontal: "right" } };
    const styleAccount = { font: { bold: true } };
    const styleFecha   = { alignment: { horizontal: "right" } };
    const fmtNumero    = '#,##0.00';

    const datosFinales = [];
    const merges = [];
    const FACTOR = 100;
    let currentRow = 0;

     // Definir Encabezados
    const headersText = ["Fecha", "Nit", "Nombre o Razon Social", "N. Factura", "Tipo factura", "Total Facturado"];

      // Indices de columnas
    let colCount = 5;
    const colDebeIndex = colCount;

    if (encabezado.conEncabezado) {
        const rowLM = new Array(headersText.length).fill({ v: "" });
        rowLM[0] = { v: "Detalle Facturas por Transacción", s: styleAccount };
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
        nroTransaccion[1] = { v: transaccion.transaccion };
        datosFinales.push(nroTransaccion);
        merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        const rowFecha = new Array(headersText.length).fill({ v: "" });
        rowFecha[0] = { v: "Fecha: ", s: styleAccount};
        rowFecha[1] = { v: formatoFecha(transaccion.fechat), t: 's' };
        datosFinales.push(rowFecha);
        merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        let totalMonto = 0;

        for (const value of transaccion.facturas) {
            const monto = Math.round(parseFloat(value.monto) * FACTOR);

            totalMonto += monto;

            // Fila de Datos (Construcción directa con formato)
            const claseFactura = value.clasefactura ? (value.clasefactura === "1" ? "Compra" : (value.clasefactura === "2" ? "Venta" : "-")) : "-";
            const fila = [
                { v: formatoFecha(value.fecha), t: 's', s: styleFecha },
                { v: value.nit || "", t: 's' },
                { v: value.proveedor || "", t: 's' },
                { v: value.nfactura, t: 's' },
                { v: claseFactura, t: 's' },
                { v: monto / FACTOR, t: 'n', z: fmtNumero}
            ];

            datosFinales.push(fila);
            currentRow++;
        }

        // Fila Total Cuenta
        const rowTotal = new Array(headersText.length).fill({ v: "" });
        rowTotal[0] = { v: "TOTAL:", s: styleTotal };

        // Totales con estilo y formato
        rowTotal[colDebeIndex]     = { v: totalMonto / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };

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
        { wch: 12 },
        { wch: 15 },
        { wch: 30 },
        { wch: 12 },
        { wch: 10 },
        { wch: 15 },
    ];
    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Facturas Transacción");
    XLSX.writeFile(wb, `detalle_factura_tr.xlsx`, { compression: true });
}