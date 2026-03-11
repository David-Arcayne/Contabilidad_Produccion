import { ajustarAlturaTabla } from "../../../funciones/CrearTabla.js";
import { getDivisaNombre } from "../../../funciones/DatosAuxiliares.js";
import { crearElemento, convertirFechaATexto, formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { contenidoConEncabezadoPdfMake, crearContenedorReporte, defDocumentoPdfMake, EncabezadoPDF, FirmasContabilidad, firmasContabilidadPdfMake, opcionesDescargaDeReporte, seccionTablaPdfMake, verificarDatosReporte } from "../../../funciones/VistaPDF.js";
import { obtenerEstadoTransaccion } from "./Funciones.js";

/**
 * Función: Prepara y maneja el reporte de comprobante contable.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de comprobante contable.
 *             Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *            También proporciona opciones para descargar el reporte en diferentes formatos.
 * Fecha: 30 de enero de 2026
 * Autor: Joel Choque
 */
export async function manejarComprobanteContable(datos) {
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

    const sinNota = datosFormulario.cc_con_notas;

    // Crear el contenido del reporte
    const [contenedorReporte, cuerpoReporte, contenedorBotones, divReporte] = crearContenedorReporte();
    // Opciones de descarga del reporte
    const opcionesReporte = opcionesDescargaDeReporte({
        contenedorModal: contenedorPrincipal,
        // cuerpoReporte,
        // nombreArchivo: `comprobante_contable`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteComprobanteContablePdfMake({ datosReporte, sinNota});
            await defDocumentoPdfMake({ contenido: docDefinition, numeroPieDePagina });
        },
        callbackExcel: (conEncabezado) => {
            const fechaReporte = `${!datosFormulario.por_mes ? `Entre: ${formatoFecha(datosFormulario.fechainib)} y ${formatoFecha(datosFormulario.fechafinb)}` : `De: ${convertirFechaATexto(datosFormulario.por_mes)}`}`;
            exportarExcelComprobanteContable({
                datos: datosReporte,
                conNota: sinNota,
                encabezado: { conEncabezado, fechaReporte, divisa: `(Expresado en ${getDivisaNombre()})` }
            });
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteComprobanteContable({ datosReporte, datosFormulario, sinNota });
    const divReporteCt = crearElemento("div", { class: "reportaf" });
    divReporteCt.innerHTML = reporte;
    cuerpoReporte.replaceChildren(divReporteCt);

    ajustarAlturaTabla(divReporte);
}

// Genera el contenido HTML del reporte de comprobante contable
async function reporteComprobanteContable({ datosReporte, datosFormulario, sinNota }) {

    const firmas = await FirmasContabilidad(1);
    let htmlFirmas = firmas ? `<div class="afr-signatures"> ${firmas} </div>` : "";

    const subtitulo = `<div><h4>Comprobante Contable</h4></div> <span>(Expresado en ${getDivisaNombre()})</span>`;
    const htmlEncabezado= EncabezadoPDF();

    const FACTOR = 100;
    let htmlContenido = "";
    for (const tt of datosReporte) {
        let debe = 0;
        let haber = 0;
        let htmlTable = "";
        let htmlFacturas = "";
        let htmlComprobante = "";
        for (const lista of tt.detalle) {
            const debeTF = Math.round(parseFloat(lista.debe || 0) * FACTOR);
            const haberTF = Math.round(parseFloat(lista.haber || 0) * FACTOR);
            debe += debeTF;
            haber += haberTF;
            htmlTable += `
                <tr>
                    <td>${lista.numero}</td>
                    <td><div class="afr-fwb">${lista.cuenta_padre ? lista.cuenta_padre : ""}</div>${lista.plan}</td>
                    ${!sinNota ? "" : `<td>${lista.nota ?? "-"}</td>`}
                    <td class="afr-te">${formatoDecimal(debeTF / FACTOR)}</td>
                    <td class="afr-te">${formatoDecimal(haberTF / FACTOR)}</td>
                </tr>`;
        }

        let estadoTransaccion = obtenerEstadoTransaccion(tt.estado, debe, haber);

        htmlTable += `
            <tr>
                <td colspan="${!sinNota ? 2 : 3}" class="afr-te afr-fwb">Total: </td>
                <td class="afr-te afr-fwb">${formatoDecimal(debe / FACTOR)}</td>
                <td class="afr-te afr-fwb">${formatoDecimal(haber / FACTOR)}</td>
            </tr>`;

        if (tt.facturas?.length > 0) {
            let total = 0;
            let htmlTableF = "";
            for (const lista of tt.facturas) {
                total += Math.round(parseFloat(lista.monto || 0) * FACTOR);
                htmlTableF += `
                    <tr>
                        <td>${formatoFecha(lista.fecha)}</td>
                        <td>${lista.cliente || "-"}</td>
                        <td>${lista.nfactura || "-"}</td>
                        <td>${lista.nit || "-"}</td>
                        <td class="afr-te">${formatoDecimal(lista.monto)}</td>
                    </tr>`;
            }
            htmlTableF += `
                <tr>
                    <td colspan="4" class="afr-te afr-fwb">Total: </td>
                    <td class="afr-te afr-fwb">${formatoDecimal(total / FACTOR)}</td>
                </tr>`;

            htmlFacturas = `
                <p><span class="afr-fwb">Facturas: </span></p>
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
        if (tt.recibos?.length > 0) {
            let total = 0;
            let htmlTableR = "";
            for (const lista of tt.recibos) {
                total += Math.round(parseFloat(lista.monto || 0) * FACTOR);
                htmlTableR += `
                    <tr>
                        <td>${formatoFecha(lista.fecha)}</td>
                        <td>${lista.nrecibo || "-"}</td>
                        <td>${lista.nro_documento || "-"}</td>
                        <td>${lista.persona || "-"}</td>
                        <td>${lista.ci || "-"}</td>
                        <td class="afr-te">${formatoDecimal(lista.monto)}</td>
                    </tr>`;
            }
            htmlTableR += `
                <tr>
                    <td colspan="5" class="afr-te afr-fwb">Total: </td>
                    <td class="afr-te afr-fwb">${formatoDecimal(total / FACTOR)}</td>
                </tr>`;

            htmlComprobante = `
                <p><span class="afr-fwb">Comprobante Efectivo: </span></p>
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>N° Comprobante Efectivo</th>
                            <th>N° Fact/Recibo</th>
                            <th>Proveedor/Cliente</th>
                            <th>CI</th>
                            <th class="afr-te">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${htmlTableR}
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
                    <div class="afr-info-left">
                        <div><span>N° Transacción:</span> ${tt.codigo}</div>
                        <div><span>Fecha:</span> ${formatoFecha(tt.fecha)}</div>
                        <div><span>Tipo de Transacción:</span> ${tt.tipo ?? "-"}</div>
                    </div>
                    <!-- <div class="afr-info-right afr-end"> -->
                    <div class="afr-info-right">
                        <div><span>Estado:</span> ${estadoTransaccion}</div>
                    </div>
                </div>
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cuenta</th>
                            ${!sinNota ? "" : "<th>Nota</th>"}
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
                ${htmlComprobante}
                ${htmlFirmas}
            </section>
            <div class="html2pdf__page-break"></div>`;
    }

    return htmlContenido;
}

// Genera el contenido para PDFMake del reporte de comprobante contable para descarga en PDF
async function reporteComprobanteContablePdfMake({ datosReporte, sinNota }) {

    const divisaEnUso = getDivisaNombre();

    const firmas = await firmasContabilidadPdfMake(1);

    const content = [];

    const FACTOR = 100;

    for (let i = 0; i < datosReporte.length; i++) {
        const tt = datosReporte[i];

        let debe = 0;
        let haber = 0;

        const bodyTabla = [
            [
                { text: "Código", style: "tablaEncabezado" },
                { text: "Cuenta", style: "tablaEncabezado" },
                sinNota ? { text: "Nota", style: "tablaEncabezado" } : null,
                { text: "Debe", style: "tablaEncabezado", alignment: "right" },
                { text: "Haber", style: "tablaEncabezado", alignment: "right" }
            ].filter(Boolean)
        ];

        for (const lista of tt.detalle) {
            const debeTF = Math.round(Number(lista.debe || 0) * FACTOR);
            const haberTF = Math.round(Number(lista.haber || 0) * FACTOR);

            debe += debeTF;
            haber += haberTF;

            let cuenta = [{ text: lista.plan }];
            lista.cuenta_padre ? cuenta.unshift({ text: lista.cuenta_padre, bold: true }) : null;
            bodyTabla.push([
                { text: lista.numero },
                {
                    stack: cuenta
                },
                sinNota ? { text: lista.nota ?? "-" } : null,
                { text: formatoDecimal(debeTF / FACTOR), alignment: "right" },
                { text: formatoDecimal(haberTF / FACTOR), alignment: "right" }
            ].filter(Boolean));
        }

        bodyTabla.push([
            { text: "TOTAL:", colSpan: sinNota ? 3 : 2, style: "tablaTextoTotal" },
            {},
            sinNota ? {} : null,
            { text: formatoDecimal(debe / FACTOR), style: "tablaMontoTotal" },
            { text: formatoDecimal(haber / FACTOR), style: "tablaMontoTotal" }
        ].filter(Boolean));

        content.push(...contenidoConEncabezadoPdfMake());
        content.push(
            { text: "Comprobante Contable", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            {
                columns: [
                    {
                        stack: [
                            {
                                text: [
                                    { text: "N° Transacción: ", bold: true },
                                    { text: tt.codigo || "-"}
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Fecha: ", bold: true },
                                    { text: formatoFecha(tt.fecha)  || "-"  }
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Tipo de Transacción: ", bold: true },
                                    { text: tt.tipo || "-"  }
                                ],
                            }
                        ],
                        style: "columnaInicio"
                    }, {
                        stack: [
                            {
                                text: [
                                    { text: "Estado: ", bold: true }, obtenerEstadoTransaccion(tt.estado, debe, haber)
                                ],
                            }
                        ],
                        style: "columnaFinal"
                    }
                ],
                marginBottom: 8
            },
            seccionTablaPdfMake({
                widths: ["auto", "*", sinNota ? "*" : 0, "auto", "auto"].filter(w => w !== 0),
                body: bodyTabla
            }),
            {
                text: [
                    { text: "Glosa: ", bold: true }, tt.glosa
                ],
                marginTop: 8
            }
        );

        if (tt.facturas?.length) {
            content.push(tablaFacturasPdfMake(tt.facturas));
        }
        if (tt.recibos?.length) {
            content.push(tablaRecibosPdfMake(tt.recibos));
        }
        if (firmas) {
            content.push(firmas());
        }

        // SALTO DE PÁGINA
        if (i < datosReporte.length - 1) {
            content.push({ text: "", pageBreak: "after" });
        }
    }

    return content;
};

// Genera la tabla de facturas para PDFMake
function tablaFacturasPdfMake(facturas) {
    const FACTOR = 100;
    let total = 0;

    const body = [
        [
            { text: "Fecha", style: "tablaEncabezado" },
            { text: "Nombre o Razón Social", style: "tablaEncabezado" },
            { text: "N° Factura", style: "tablaEncabezado" },
            { text: "NIT", style: "tablaEncabezado" },
            { text: "Monto", style: "tablaEncabezado", alignment: "right" }
        ]
    ];

    facturas.forEach(factura => {
        const monto =  Math.round(Number(factura.monto || 0) * FACTOR);
        total += monto;
        body.push([
            { text: formatoFecha(factura.fecha) || "-" },
            { text: factura.cliente || "-" },
            { text: factura.nfactura || "-" },
            { text: factura.nit || "-" },
            { text: formatoDecimal(monto / FACTOR), alignment: "right" }
        ]);
    });

    body.push([
        { text: "TOTAL:", colSpan: 4, style: "tablaTextoTotal" },
        {}, {}, {},
        { text: formatoDecimal(total / FACTOR), style: "tablaMontoTotal" }
    ]);

    return {
        stack: [
            { text: "Facturas:", style: "textoSeccion" },
            seccionTablaPdfMake({
                widths: ["auto", "*", "auto", "auto", "auto"],
                body
            }),
        ],
        marginBottom: 8
    };
}

// Genera la tabla de recibos para PDFMake
function tablaRecibosPdfMake(recibos) {
    const FACTOR = 100;
    let total = 0;

    const body = [
        [
            { text: "Fecha", style: "tablaEncabezado" },
            { text: "N° Comprobante Efectivo", style: "tablaEncabezado" },
            { text: "N° Fact/Recibo", style: "tablaEncabezado" },
            { text: "Proveedor/Cliente", style: "tablaEncabezado" },
            { text: "CI", style: "tablaEncabezado" },
            { text: "Monto", style: "tablaEncabezado", alignment: "right" }
        ]
    ];

    recibos.forEach(recibo => {
        const monto =  Math.round(Number(recibo.monto || 0) * FACTOR);
        total += monto;
        body.push([
            { text: formatoFecha(recibo.fecha) || "-" },
            { text: recibo.nrecibo || "-" },
            { text: recibo.nro_documento || "-" },
            { text: recibo.persona || "-" },
            { text: recibo.ci || "-" },
            { text: formatoDecimal(monto / FACTOR), alignment: "right" }
        ]);
    });

    body.push([
        { text: "TOTAL:", colSpan: 5, style: "tablaTextoTotal" },
        {}, {}, {}, {},
        { text: formatoDecimal(total / FACTOR), style: "tablaMontoTotal" }
    ]);

    return {
        stack: [
            { text: "Comprobante Efectivo:", style: "textoSeccion" },
            {
                table: {
                    headerRows: 0,
                    widths: ["auto", "auto", "auto", "*", "auto", "auto"],
                    body
                },
                layout: "lineasHorizontales"
            }
        ],
        marginBottom: 8,
    };
}

// function resolverEstado(estado) {
//     return {
//         "1": "Válido",
//         "2": "Pendiente Anulación",
//         "3": "Pendiente Eliminación",
//         "4": "Anulado",
//         "5": "Pendiente Activación",
//         "7": "Pendiente Desconsolidación"
//     }[estado] || "Inválido";
// }

// Función para exportar los datos del reporte de comprobante contable a Excel
export function exportarExcelComprobanteContable({ datos, conNota, encabezado = { conEncabezado: false, fechaReporte: "", divisa: "" } } = {}) {
    const wb = XLSX.utils.book_new();

    // Estilos generales
    const styleHeader = { font: { bold: true } };
    const styleTitle = { font: { bold: true, sz: 12 } };
    const styleTotal = { font: { bold: true }, alignment: { horizontal: "right" } };
    const styleCenter = { alignment: { horizontal: "center" } };
    const fmtNumero = '#,##0.00';

    const datosFinales = [];
    const merges = [];
    const FACTOR = 100;
    let currentRow = 0;

    // --- Definición de Columnas ---
    // Usaremos un grid de 6 columnas para acomodar todos los tipos de tablas.
    let colCount = 6;

    // Encabezado del Reporte
    if (encabezado.conEncabezado) {
        const rowTitulo = new Array(colCount).fill({ v: "" });
        rowTitulo[0] = { v: "Comprobante Contable", s: styleTitle };
        datosFinales.push(rowTitulo);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colCount - 1 } });
        currentRow++;

        const rowFecha = new Array(colCount).fill({ v: "" });
        rowFecha[0] = { v: encabezado.fechaReporte, s: styleHeader };
        datosFinales.push(rowFecha);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colCount - 1 } });
        currentRow++;

        const rowDivisa = new Array(colCount).fill({ v: "" });
        rowDivisa[0] = { v: encabezado.divisa, s: styleHeader };
        datosFinales.push(rowDivisa);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colCount - 1 } });
        currentRow++;

        datosFinales.push([]); // Espacio
        currentRow++;
    }

    datos.forEach((tt, index) => {
        if (index > 0) {
            datosFinales.push([]); // Espacio entre transacciones
            currentRow++;
            datosFinales.push([]);
            currentRow++;
        }

        // --- Información Transacción ---
        const rowInfo1 = new Array(colCount).fill({ v: "" });
        rowInfo1[0] = { v: "N° Transacción:", s: styleHeader };
        rowInfo1[1] = { v: tt.codigo, t: 's' };
        rowInfo1[2] = { v: "Fecha:", s: styleHeader };
        rowInfo1[3] = { v: formatoFecha(tt.fecha), t: 's' };
        rowInfo1[4] = { v: "Tipo:", s: styleHeader };
        rowInfo1[5] = { v: tt.tipo || "-", t: 's' };
        datosFinales.push(rowInfo1);
        currentRow++;

        const rowInfo2 = new Array(colCount).fill({ v: "" });
        let estadoR = obtenerEstadoTransaccion(tt.estado, null, null, tt.detalle);

        rowInfo2[0] = { v: "Estado:", s: styleHeader };
        rowInfo2[1] = { v: estadoR, t: 's' };
        datosFinales.push(rowInfo2);
        currentRow++;

        const rowGlosa = new Array(colCount).fill({ v: "" });
        rowGlosa[0] = { v: "Glosa:", s: styleHeader };
        rowGlosa[1] = { v: tt.glosa, t: 's' };
        datosFinales.push(rowGlosa);
        merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: colCount - 1 } });
        currentRow++;

        datosFinales.push([]); // Espacio
        currentRow++;

        // --- Tabla Principal ---
        const headersMain = ["Código", "Cuenta"];
        if (conNota) headersMain.push("Nota");
        headersMain.push("Debe", "Haber");

        const rowHeaderMain = new Array(colCount).fill({ v: "" });
        rowHeaderMain[0] = { v: headersMain[0], s: styleHeader };
        rowHeaderMain[1] = { v: headersMain[1], s: styleHeader };
        if (conNota) {
            rowHeaderMain[3] = { v: headersMain[2], s: styleHeader }; // Nota
            rowHeaderMain[4] = { v: headersMain[3], s: styleHeader, s: { ...styleHeader, alignment: { horizontal: "right" } } }; // Debe
            rowHeaderMain[5] = { v: headersMain[4], s: styleHeader, s: { ...styleHeader, alignment: { horizontal: "right" } } }; // Haber
            merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
        } else {
            rowHeaderMain[4] = { v: headersMain[2], s: styleHeader, s: { ...styleHeader, alignment: { horizontal: "right" } } }; // Debe
            rowHeaderMain[5] = { v: headersMain[3], s: styleHeader, s: { ...styleHeader, alignment: { horizontal: "right" } } }; // Haber
            merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
        }
        datosFinales.push(rowHeaderMain);
        currentRow++;

        let totalDebe = 0;
        let totalHaber = 0;

        tt.detalle.forEach(item => {
            const debeVal = Math.round(parseFloat(item.debe || 0) * FACTOR);
            const haberVal = Math.round(parseFloat(item.haber || 0) * FACTOR);
            totalDebe += debeVal;
            totalHaber += haberVal;

            const rowDet = new Array(colCount).fill({ v: "" });
            rowDet[0] = { v: item.numero, t: 's' };

            const cuentaNombre = (item.cuenta_padre ? item.cuenta_padre + ": " : "") + item.plan;
            rowDet[1] = { v: cuentaNombre, t: 's' };

            if (conNota) {
                merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
                rowDet[3] = { v: item.nota || "", t: 's' };
                rowDet[4] = { v: debeVal / FACTOR, t: 'n', z: fmtNumero };
                rowDet[5] = { v: haberVal / FACTOR, t: 'n', z: fmtNumero };
            } else {
                merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
                rowDet[4] = { v: debeVal / FACTOR, t: 'n', z: fmtNumero };
                rowDet[5] = { v: haberVal / FACTOR, t: 'n', z: fmtNumero };
            }
            datosFinales.push(rowDet);
            currentRow++;
        });

        // Totales Main
        const rowTotalMain = new Array(colCount).fill({ v: "" });
        rowTotalMain[0] = { v: "TOTAL:", s: styleTotal };
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });

        rowTotalMain[4] = { v: totalDebe / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
        rowTotalMain[5] = { v: totalHaber / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
        datosFinales.push(rowTotalMain);
        currentRow++;

        // --- Facturas ---
        if (tt.facturas && tt.facturas.length > 0) {
            datosFinales.push([]); currentRow++;

            const rowTitleFact = new Array(colCount).fill({ v: "" });
            rowTitleFact[0] = { v: "Facturas:", s: styleHeader };
            datosFinales.push(rowTitleFact);
            currentRow++;

            const rowHeadF = new Array(colCount).fill({ v: "" });
            rowHeadF[0] = { v: "Fecha", s: styleHeader };
            rowHeadF[1] = { v: "Razón Social", s: styleHeader };
            rowHeadF[3] = { v: "N° Factura", s: styleHeader };
            rowHeadF[4] = { v: "NIT", s: styleHeader };
            rowHeadF[5] = { v: "Monto", s: styleHeader, s: { ...styleHeader, alignment: { horizontal: "right" } } };
            merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
            datosFinales.push(rowHeadF);
            currentRow++;

            let totalF = 0;
            tt.facturas.forEach(f => {
                totalF += Math.round(parseFloat(f.monto || 0) * FACTOR);
                const rowF = new Array(colCount).fill({ v: "" });
                rowF[0] = { v: formatoFecha(f.fecha), t: 's' };
                rowF[1] = { v: f.cliente, t: 's' };
                rowF[3] = { v: f.nfactura, t: 's' };
                rowF[4] = { v: f.nit, t: 's' };
                rowF[5] = { v: parseFloat(f.monto), t: 'n', z: fmtNumero };
                merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
                datosFinales.push(rowF);
                currentRow++;
            });

            const rowTotalF = new Array(colCount).fill({ v: "" });
            rowTotalF[0] = { v: "TOTAL:", s: styleTotal };
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 4 } });
            rowTotalF[5] = { v: totalF / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
            datosFinales.push(rowTotalF);
            currentRow++;
        }

        // --- Recibos ---
        if (tt.recibos && tt.recibos.length > 0) {
            datosFinales.push([]); currentRow++;

            const rowTitleRec = new Array(colCount).fill({ v: "" });
            rowTitleRec[0] = { v: "Comprobante Efectivo:", s: styleHeader };
            datosFinales.push(rowTitleRec);
            currentRow++;

            const rowHeadR = new Array(colCount).fill({ v: "" });
            rowHeadR[0] = { v: "Fecha", s: styleHeader };
            rowHeadR[1] = { v: "N° Comprobante Efectivo", s: styleHeader };
            rowHeadR[2] = { v: "N° F/R", s: styleHeader };
            rowHeadR[3] = { v: "Prov/Cliente", s: styleHeader };
            rowHeadR[4] = { v: "CI", s: styleHeader };
            rowHeadR[5] = { v: "Monto", s: styleHeader, s: { ...styleHeader, alignment: { horizontal: "right" } } };
            datosFinales.push(rowHeadR);
            currentRow++;

            let totalR = 0;
            tt.recibos.forEach(r => {
                totalR += Math.round(parseFloat(r.monto || 0) * FACTOR);
                const rowR = new Array(colCount).fill({ v: "" });
                rowR[0] = { v: formatoFecha(r.fecha), t: 's' };
                rowR[1] = { v: r.nrecibo, t: 's' };
                rowR[2] = { v: r.nro_documento || "-", t: 's' };
                rowR[3] = { v: r.persona, t: 's' };
                rowR[4] = { v: r.ci, t: 's' };
                rowR[5] = { v: parseFloat(r.monto), t: 'n', z: fmtNumero };
                datosFinales.push(rowR);
                currentRow++;
            });

            const rowTotalR = new Array(colCount).fill({ v: "" });
            rowTotalR[0] = { v: "TOTAL:", s: styleTotal };
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 4 } });
            rowTotalR[5] = { v: totalR / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
            datosFinales.push(rowTotalR);
            currentRow++;
        }
    });

    const ws = XLSX.utils.aoa_to_sheet(datosFinales);
    ws['!merges'] = merges;

    const cols = [
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 12 },
        { wch: 12 }
    ];
    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Comprobantes");
    XLSX.writeFile(wb, "Reporte_Comprobantes.xlsx", { compression: true });
}