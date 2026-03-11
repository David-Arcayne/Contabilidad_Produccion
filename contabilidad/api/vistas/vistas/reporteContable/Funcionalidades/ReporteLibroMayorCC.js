import { ajustarAlturaTabla } from "../../../funciones/CrearTabla.js";
import { getDivisaNombre } from "../../../funciones/DatosAuxiliares.js";
import { crearElemento, formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import {
    contenidoConEncabezadoPdfMake,
    crearContenedorReporte,
    defDocumentoPdfMake,
    EncabezadoPDF,
    FirmasContabilidad,
    firmasContabilidadPdfMake,
    opcionesDescargaDeReporte,
    seccionTablaPdfMake,
    verificarDatosReporte
} from "../../../funciones/VistaPDF.js";

/**
 * Función: Prepara y maneja el reporte de libro mayor por rango.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de libro mayor por rango.
 *              Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *              También proporciona opciones para descargar el reporte en diferentes formatos.
 * Fecha: 30 de enero de 2026
 * Autor: Joel Choque
 */
export async function manejarReporteLibroMayorPorRango(datos) {
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

    const conNota = datosFormulario.lm_con_notas;
    const conTipo = datosFormulario.lm_con_tipo;
    const conGlosa = datosFormulario.lm_con_glosa;
    // Crear el contenido del reporte
    const [contenedorReporte, cuerpoReporte, contenedorBotones, divReporte] = crearContenedorReporte();
    // Opciones de descarga del reporte
    const opcionesReporte = opcionesDescargaDeReporte({
        contenedorModal: contenedorPrincipal,
        // cuerpoReporte,
        // nombreArchivo: `reporte_libro_mayor`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteLibroMayorPorRangoPdfMake({ datosReporte, datosFormulario, conNota, conTipo, conGlosa });
            await defDocumentoPdfMake({ contenido: docDefinition, numeroPieDePagina });
        },
        callbackExcel: (conEncabezado) => {
            const fechaReporte = `Entre ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}`
            exportarExcelLibroMayor(
                datosReporte,
                "libro_mayor",
                {
                    conNota,
                    conTipo,
                    conGlosa,
                    encabezado: { conEncabezado, fechaReporte, divisa: `(Expresado en ${getDivisaNombre()})` }
                }
            );
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteLibroMayorPorRango({ datosReporte, datosFormulario, conNota, conTipo, conGlosa });
    const divReporteCt = crearElemento("div", { class: "reportaf" });
    divReporteCt.innerHTML = reporte;
    cuerpoReporte.replaceChildren(divReporteCt);

    ajustarAlturaTabla(divReporte);
}

// Genera el contenido HTML del reporte de libro mayor por rango
async function reporteLibroMayorPorRango({ datosReporte, datosFormulario, conNota, conTipo, conGlosa }) {
    const firmas = await FirmasContabilidad(1);
    let htmlFirmas = firmas ? `<div class="afr-signatures"> ${firmas} </div>` : "";

    const htmlEncabezado = EncabezadoPDF();

    let htmlContenido = "";
    for (const [i, libroMayor] of datosReporte.entries()) {
        const subtitulo = `
        <div><h4>Libro Mayor</h4></div>
        <div><h4 class="mt-0">${libroMayor?.codigo_cuenta ?? ""} - ${libroMayor?.nombre_plan ?? ""}</h4></div>
        <span>Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}</span>
        <div><span>(Expresado en ${getDivisaNombre()})</span></div>`;

        const FACTOR = 100;
        let htmlTable = "";
        let saldoInicial = "";
        let debe = 0;
        let haber = 0;
        let saldo = 0;
        let contador = 0;
        for (const txn of libroMayor.cuentas) {
            for (const value of txn.detalle) {
                const debeTF = Math.round(parseFloat(value.debe) * FACTOR);
                const haberTF = Math.round(parseFloat(value.haber) * FACTOR);
                debe += debeTF;
                haber += haberTF;
                saldo += txn.tipo_cuenta?.toLowerCase() === "haber" ? haberTF - debeTF : debeTF - haberTF;

                if (txn.codigo === "SALDO INICIAL") {
                    saldoInicial = `<p class="afr-end"><strong class="pe-2">Saldo Inicial: </strong> ${formatoDecimal(saldo / FACTOR)}</p>`;
                    continue;
                }
                // if (txn.codigo === "SALDO INICIAL") {
                //     saldoInicial = `<p class="afr-end"><strong class="pe-2">Saldo al ${formatoFecha(ajustarFecha({ fecha: txn.fecha, dias: -1, forma: "fecha" }))}: </strong> ${formatoDecimal(saldo / FACTOR)}</p>`;
                //     continue;
                // }

                contador++;
                htmlTable += `
                    <tr>
                        <td>${contador}</td>
                        <td style="width: 70px;">${txn.codigo}</td>
                        <td>${formatoFecha(txn.fecha)}</td>
                        ${conTipo ? `<td>${txn.tipo ?? "-"}</td>` : ""}
                        ${conGlosa ? `<td>${txn.glosa ?? "-"}</td>` : ""}
                        ${conNota ? `<td>${value.nota ?? "-"}</td>` : ""}
                        <td class="afr-te">${formatoDecimal(debeTF / FACTOR)}</td>
                        <td class="afr-te">${formatoDecimal(haberTF / FACTOR)}</td>
                        <td class="afr-te">${formatoDecimal(saldo / FACTOR)}</td>
                    </tr>`;
            };
        }
        let colspan = 0
        if (conTipo) colspan++;
        if (conNota) colspan++;
        if (conGlosa) colspan++;

        htmlTable += `
            <tr>
                <td colspan="${3 + colspan}" class="afr-te afr-fwb">TOTAL: </td>
                <td class="afr-fwb afr-te">${formatoDecimal(debe / FACTOR)}</td>
                <td class="afr-fwb afr-te">${formatoDecimal(haber / FACTOR)}</td>
                <td class="afr-fwb afr-te">${formatoDecimal(saldo / FACTOR)}</td>
            </tr>`;

        htmlContenido += `
            ${htmlEncabezado}
            <section>
                <div class="afr-filters-t">
                    ${subtitulo}
                </div>
                ${saldoInicial}
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th style="width: 70px;">Transacción</th>
                            <th>Fecha</th>
                            ${conTipo ? `<th>Tipo</th>` : ""}
                            ${conGlosa ? `<th>Glosa</th>` : ""}
                            ${conNota ? `<th>Nota</th>` : ""}
                            <th class="afr-te">DEBE</th>
                            <th class="afr-te">HABER</th>
                            <th class="afr-te">Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${htmlTable}
                    </tbody>
                </table>
                ${htmlFirmas}
            </section>
            <div class="html2pdf__page-break"></div>
        `;
    }
    return htmlContenido;
}

// Genera el contenido para PDFMake del reporte de Libro Mayor para descarga en PDF
async function reporteLibroMayorPorRangoPdfMake({ datosReporte, datosFormulario, conNota, conTipo, conGlosa }) {
    const divisaEnUso = getDivisaNombre();
    const firmas = await firmasContabilidadPdfMake(1);

    const content = [];
    const FACTOR = 100;

    for (const [i, libroMayor] of datosReporte.entries()) {
        const header = [

            { text: "Libro Mayor", style: "textoTitulo" },
            {
                text: `${libroMayor?.codigo_cuenta ?? ""} - ${libroMayor?.nombre_plan ?? ""}`,
                style: "textoSubTitulo",
            },
            {
                stack: [
                    {
                        text: `Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}`,
                        marginBottom: 1
                    },
                    { text: `(Expresado en ${divisaEnUso})` }
                ],
                style: "textoInformacion"
            }
        ];

        let debe = 0;
        let haber = 0;
        let saldo = 0;
        let contador = 0;

        // Construct table header
        const tableHeader = [
            { text: "#", style: "tablaEncabezado" },
            { text: "Transacción", style: "tablaEncabezado", width: 45 },
            { text: "Fecha", style: "tablaEncabezado" }
        ];

        const textoLargo = conNota || conGlosa
        let widths = ["auto", "auto", textoLargo ? "auto" : "*"];

        if (conTipo) {
            tableHeader.push({ text: "Tipo", style: "tablaEncabezado" });
            widths.push(textoLargo ? "auto" : "*");
        }
        if (conGlosa) {
            tableHeader.push({ text: "Glosa", style: "tablaEncabezado" });
            widths.push("*");
        }
        if (conNota) {
            tableHeader.push({ text: "Nota", style: "tablaEncabezado" });
            widths.push("*");
        }

        tableHeader.push(
            { text: "DEBE", style: "tablaEncabezado", alignment: "right" },
            { text: "HABER", style: "tablaEncabezado", alignment: "right" },
            { text: "Saldo", style: "tablaEncabezado", alignment: "right" }
        );
        widths.push("auto", "auto", "auto");

        const bodyTabla = [tableHeader];

        for (const txn of libroMayor.cuentas) {
            for (const value of txn.detalle) {
                const debeTF = Math.round(parseFloat(value.debe) * FACTOR);
                const haberTF = Math.round(parseFloat(value.haber) * FACTOR);
                debe += debeTF;
                haber += haberTF;
                saldo += txn.tipo_cuenta?.toLowerCase() === "haber" ? haberTF - debeTF : debeTF - haberTF;

                if (txn.codigo === "SALDO INICIAL") {
                    // Si es saldo inicial, agregamos una fila especial o texto antes de la tabla,
                    // en el HTML se muestra como un texto alineado a la derecha antes de la tabla.
                    // Aquí lo agregaremos al content antes de la tabla.
                    header.push({
                        text: [
                            { text: "Saldo Inicial: ", bold: true },
                            formatoDecimal(saldo / FACTOR)
                        ],
                        alignment: 'right',
                        margin: [0, 0, 0, 5]
                    });
                    continue;
                }

                contador++;

                const row = [
                    { text: contador },
                    { text: txn.codigo, fontSize: 8 },
                    { text: formatoFecha(txn.fecha) }
                ];

                if (conTipo) row.push({ text: txn.tipo ?? "-" });
                if (conGlosa) row.push({ text: txn.glosa ?? "-", fontSize: 8 });
                if (conNota) row.push({ text: value.nota ?? "-" });

                row.push(
                    { text: formatoDecimal(debeTF / FACTOR), alignment: "right" },
                    { text: formatoDecimal(haberTF / FACTOR), alignment: "right" },
                    { text: formatoDecimal(saldo / FACTOR), alignment: "right" }
                );

                bodyTabla.push(row);
            }
        }

        // Total Row
        let colspan = 3;
        if (conTipo) colspan++;
        if (conGlosa) colspan++;
        if (conNota) colspan++;

        const totalRow = [
            { text: "TOTAL:", colSpan: colspan, style: "tablaTextoTotal" }
        ];
        // Fill empty cells for colspan
        for(let k=1; k<colspan; k++) totalRow.push({});

        totalRow.push(
            { text: formatoDecimal(debe / FACTOR), style: "tablaMontoTotal" },
            { text: formatoDecimal(haber / FACTOR), style: "tablaMontoTotal" },
            { text: formatoDecimal(saldo / FACTOR), style: "tablaMontoTotal" }
        );

        bodyTabla.push(totalRow);

        content.push(...contenidoConEncabezadoPdfMake());
        content.push(...header);

        content.push(
            seccionTablaPdfMake({
                widths: widths,
                body: bodyTabla
            })
        );

        // SALTO DE PÁGINA
        if (i < datosReporte.length - 1) {
            content.push({ text: "", pageBreak: "after" });
        }
    }

    if (firmas) {
        content.push(firmas());
    }

    return content;
}

// Función para exportar los datos del reporte de libro mayor a Excel
export function exportarExcelLibroMayor(datos, nombreArchivo = "LibroMayor", {conNota = false, conTipo = false, conGlosa = false, encabezado = {conEncabezado: false, fechaReporte: "", divisa: ""}} = {}) {

    const wb = XLSX.utils.book_new();

    // Definición de Estilos (Reutilizables)
    const styleHeader  = { font: { bold: true } };
    const styleTotal   = { font: { bold: true }, alignment: { horizontal: "right" } };
    const styleAccount = { font: { bold: true } }; // Nombre de cuenta en negrita
    const styleFecha  = { alignment: { horizontal: "right" } };
    const fmtNumero    = '#,##0.00';

    const datosFinales = [];
    const merges = [];
    const FACTOR = 100;
    let currentRow = 0;

     // Definir Encabezados
    const headersText = ["#", "Transacción", "Fecha"];
    if (conTipo) headersText.push("Tipo");
    if (conGlosa) headersText.push("Glosa");
    if (conNota) headersText.push("Nota");
    headersText.push("DEBE", "HABER", "Saldo");

      // Indices de columnas
    let colCount = 3;
    if (conTipo) colCount++;
    if (conGlosa) colCount++;
    if (conNota) colCount++;
    const colDebeIndex = colCount;

    if (datos.length === 1 && encabezado.conEncabezado) {
        const rowLM = new Array(headersText.length).fill({ v: "" });
        rowLM[0] = { v: "Libro Mayor", s: styleAccount };
        datosFinales.push(rowLM);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        // Fila Nombre Cuenta
        // Creamos fila llena de celdas vacías
        const rowNombre = new Array(headersText.length).fill({ v: "" });
        // Celda Nombre (con estilo)
        rowNombre[0] = { v: `${datos[0].codigo_cuenta} - ${datos[0].nombre_plan}`, s: styleAccount };

        datosFinales.push(rowNombre);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        const rowFecha = new Array(headersText.length).fill({ v: "" });
        // Celda fecha (con estilo)
        rowFecha[0] = { v: encabezado.fechaReporte, s: styleAccount };

        datosFinales.push(rowFecha);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        const rowDivisa = new Array(headersText.length).fill({ v: "" });
        // Celda fecha (con estilo)
        rowDivisa[0] = { v: encabezado.divisa, s: styleAccount };

        datosFinales.push(rowDivisa);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;
    }

    // Convertimos textos a Objetos Celda con estilo Header
    const encabezados = headersText.map(t => ({ v: t, s: styleHeader }));

    datosFinales.push(encabezados);
    currentRow++;

    let grandTotalDebe = 0;
    let grandTotalHaber = 0;
    let grandTotalSaldo = 0;

    for (const [i, libroMayor] of datos.entries()) {
        // Fila vacía separadora (excepto la primera cuenta)
        if (i > 0) {
            const rowVacio = new Array(headersText.length).fill({ v: "" });
            rowVacio[colDebeIndex]     = { v: 0, t: 'n', z: fmtNumero };
            rowVacio[colDebeIndex + 1] = { v: 0, t: 'n', z: fmtNumero };
            rowVacio[colDebeIndex + 2] = { v: 0, t: 'n', z: fmtNumero };

            datosFinales.push(rowVacio);
            currentRow++;
        }

        if (datos.length > 1) {
            // Fila Nombre Cuenta
            // Creamos fila llena de celdas vacías
            const rowNombre = new Array(headersText.length).fill({ v: "" });
            // Celda Nombre (con estilo)
            rowNombre[0] = { v: `${libroMayor.codigo_cuenta} - ${libroMayor.nombre_plan}` || `Cuenta ${i + 1}`, s: styleAccount };
            // Celdas numéricas en 0 con formato
            rowNombre[colDebeIndex]     = { v: 0, t: 'n', z: fmtNumero };
            rowNombre[colDebeIndex + 1] = { v: 0, t: 'n', z: fmtNumero };
            rowNombre[colDebeIndex + 2] = { v: 0, t: 'n', z: fmtNumero };

            datosFinales.push(rowNombre);
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
            currentRow++;

            if (encabezado.conEncabezado) {
                const rowNombre = new Array(headersText.length).fill({ v: "" });
                rowNombre[0] = { v: encabezado.fechaReporte, s: styleAccount };
                rowNombre[colDebeIndex]     = { v: 0, t: 'n', z: fmtNumero };
                rowNombre[colDebeIndex + 1] = { v: 0, t: 'n', z: fmtNumero };
                rowNombre[colDebeIndex + 2] = { v: 0, t: 'n', z: fmtNumero };
                datosFinales.push(rowNombre);
                merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
                currentRow++;

                const rowDivisa = new Array(headersText.length).fill({ v: "" });
                rowDivisa[0] = { v: encabezado.divisa, s: styleAccount };
                rowDivisa[colDebeIndex]     = { v: 0, t: 'n', z: fmtNumero };
                rowDivisa[colDebeIndex + 1] = { v: 0, t: 'n', z: fmtNumero };
                rowDivisa[colDebeIndex + 2] = { v: 0, t: 'n', z: fmtNumero };
                datosFinales.push(rowDivisa);
                merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
                currentRow++;
            }
        }

        let accountTotalDebe = 0;
        let accountTotalHaber = 0;
        let accountTotalSaldo = 0;
        let contador = 0;

        for (const txn of libroMayor.cuentas) {
            for (const value of txn.detalle) {
                const debeTF = Math.round(parseFloat(value.debe) * FACTOR);
                const haberTF = Math.round(parseFloat(value.haber) * FACTOR);

                accountTotalDebe += debeTF;
                accountTotalHaber += haberTF;
                accountTotalSaldo += txn.tipo_cuenta?.toLowerCase() === "haber" ? haberTF - debeTF : debeTF - haberTF;

                contador++;

                // Fila de Datos (Construcción directa con formato)
                const fila = [
                    { v: contador, t: 'n' },
                    { v: txn.codigo ?? "", t: 's' },
                    { v: formatoFecha(txn.fecha), t: 's', s: styleFecha }
                ];

                if (conTipo) fila.push({ v: txn.tipo || "", t: 's' });
                if (conGlosa) fila.push({ v: txn.glosa || "", t: 's' });
                if (conNota) fila.push({ v: value.nota || "", t: 's' });

                // Números con formato
                fila.push({ v: debeTF / FACTOR, t: 'n', z: fmtNumero });
                fila.push({ v: haberTF / FACTOR, t: 'n', z: fmtNumero });
                fila.push({ v: accountTotalSaldo / FACTOR, t: 'n', z: fmtNumero });

                datosFinales.push(fila);
                currentRow++;
            }
        }

        // Fila Total Cuenta
        const rowTotal = new Array(headersText.length).fill({ v: "" });
        rowTotal[0] = { v: "TOTAL CUENTA:", s: styleTotal };

        // Totales con estilo y formato
        rowTotal[colDebeIndex]     = { v: accountTotalDebe / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
        rowTotal[colDebeIndex + 1] = { v: accountTotalHaber / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
        rowTotal[colDebeIndex + 2] = { v: accountTotalSaldo / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };

        datosFinales.push(rowTotal);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
        currentRow++;

        grandTotalDebe += accountTotalDebe;
        grandTotalHaber += accountTotalHaber;
        grandTotalSaldo += accountTotalSaldo;
    }

    // Fila Total General
    datosFinales.push([]); // Separador
    currentRow++;

    if (datos.length > 1) {
        const rowGrandTotal = new Array(headersText.length).fill({ v: "" });
        rowGrandTotal[0] = { v: "TOTAL GENERAL:", s: styleTotal };

        rowGrandTotal[colDebeIndex]     = { v: grandTotalDebe / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
        rowGrandTotal[colDebeIndex + 1] = { v: grandTotalHaber / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
        // rowGrandTotal[colDebeIndex + 2] = { v: grandTotalSaldo / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };

        datosFinales.push(rowGrandTotal);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colDebeIndex - 1 } });
    }

    // Crear Hoja (Ya contiene estilos y formatos)
    const ws = XLSX.utils.aoa_to_sheet(datosFinales);
    ws['!merges'] = merges;

    // Anchos de columnas
    const cols = [
        { wch: 8 },  // #
        { wch: 10 }, // Transacción
        { wch: 12 }  // Fecha
    ];
    if (conTipo) cols.push({ wch: 10 });
    if (conGlosa) cols.push({ wch: 30 });
    if (conNota) cols.push({ wch: 20 });
    cols.push({ wch: 15 }, { wch: 15 }, { wch: 15 }); // Numeros

    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Libro Mayor");
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`, { compression: true });
}
