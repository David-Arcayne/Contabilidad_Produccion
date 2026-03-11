import { ajustarAlturaTabla } from "../../../funciones/CrearTabla.js";
import { getDivisaNombre } from "../../../funciones/DatosAuxiliares.js";
import { formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import {
    crearContenedorReporte,
    estructuraReporteConEncabezado,
    FirmasContabilidad,
    opcionesDescargaDeReporte,
    verificarDatosReporte,
    contenidoConEncabezadoPdfMake,
    defDocumentoPdfMake,
    seccionTablaPdfMake,
    firmasContabilidadPdfMake
} from "../../../funciones/VistaPDF.js";

/**
 * Función: Prepara y maneja el reporte de activo disponible.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de activo disponible.
 *              Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *              También proporciona opciones para descargar el reporte en diferentes formatos.
 * Fecha: 29 de enero de 2026
 * Autor: Joel Choque
 */
export async function manejarReporteActivoDisponible(datos) {
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
        // nombreArchivo: `activo_disponible`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteActivoDisponiblePdfMake({ datosReporte, datosFormulario });
            await defDocumentoPdfMake({ contenido: docDefinition, numeroPieDePagina });
        },
        callbackExcel: (conEncabezado) => {
            const fechaReporte = `Entre ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}`
            exportarExcelActivoDisponible({
                datos: datosReporte,
                encabezado: { conEncabezado, fechaReporte, divisa: `(Expresado en ${getDivisaNombre()})` }
            });
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteActivoDisponible({datosReporte, datosFormulario});
    const estructura = estructuraReporteConEncabezado();
    cuerpoReporte.innerHTML = estructura;
    const principal = cuerpoReporte.querySelector("main");
    principal.innerHTML = reporte;

    ajustarAlturaTabla(divReporte);
}

// Genera el contenido HTML del reporte de activo disponible
async function reporteActivoDisponible({ datosReporte, datosFormulario }) {
    const firmas = await FirmasContabilidad(1);
    let htmlFirmas = firmas ? `<div class="afr-signatures"> ${firmas} </div>` : "";

    const subtitulo = `
        <div><h4>Reporte Activo Disponible</h4></div>
        <span>Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}</span>
        <div><span>(Expresado en ${getDivisaNombre()})</span></div>`;

    const FACTOR = 100;
    let htmlTabla = "";
    let deudor = 0;
    let acreedor = 0;

    for (const value of datosReporte) {
        const deudorTF = Math.round(parseFloat(value.deudor || 0) * FACTOR);
        const acreedorTF = Math.round(parseFloat(value.acreedor || 0) * FACTOR);
        deudor += deudorTF;
        acreedor += acreedorTF;
        htmlTabla += `
            <tr>
                <td>${value.codigo}</td>
                <td>${value.nombre}</td>
                <td class="afr-te">${formatoDecimal(deudorTF / FACTOR)}</td>
                <td class="afr-te">${formatoDecimal(acreedorTF / FACTOR)}</td>
            </tr>`;
    };
    htmlTabla += `
        <tr>
            <td colspan="2" class="afr-te afr-fwb">TOTAL: </td>
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
                    <th class="afr-te">Deudor</th>
                    <th class="afr-te">Acreedor</th>
                </tr>
            </thead>
            <tbody>
                ${htmlTabla}
            </tbody>
        </table>
        ${htmlFirmas}
        `;

    return html;
}

// Genera el contenido para PDFMake del reporte de activo disponible para descarga en PDF
async function reporteActivoDisponiblePdfMake({ datosReporte, datosFormulario }) {
    const divisaEnUso = getDivisaNombre();
    const firmas = await firmasContabilidadPdfMake(1);

    const content = [];
    const FACTOR = 100;
    let deudor = 0;
    let acreedor = 0;

    const bodyTabla = [
        [
            { text: "Código", style: "tablaEncabezado" },
            { text: "Cuenta", style: "tablaEncabezado" },
            { text: "Deudor", style: "tablaEncabezado", alignment: "right" },
            { text: "Acreedor", style: "tablaEncabezado", alignment: "right" }
        ]
    ];

    for (const value of datosReporte) {
        const deudorTF = Math.round(parseFloat(value.deudor || 0) * FACTOR);
        const acreedorTF = Math.round(parseFloat(value.acreedor || 0) * FACTOR);
        deudor += deudorTF;
        acreedor += acreedorTF;

        bodyTabla.push([
            { text: value.codigo ?? "-" },
            { text: value.nombre ?? "-" },
            { text: formatoDecimal(deudorTF / FACTOR), alignment: "right" },
            { text: formatoDecimal(acreedorTF / FACTOR), alignment: "right" }
        ]);
    }

    bodyTabla.push([
        { text: "TOTAL:", colSpan: 2, style: "tablaTextoTotal" },
        {},
        { text: formatoDecimal(deudor / FACTOR), style: "tablaMontoTotal" },
        { text: formatoDecimal(acreedor / FACTOR), style: "tablaMontoTotal" }
    ]);

    content.push(...contenidoConEncabezadoPdfMake());
    content.push(
        { text: "Reporte Activo Disponible", style: "textoTitulo" },
        {
            stack: [
                {
                    text: `Entre: ${formatoFecha(datosFormulario.fecha_desde)} y ${formatoFecha(datosFormulario.fecha_hasta)}`,
                    marginBottom: 1
                },
                { text: `(Expresado en ${divisaEnUso})`},
            ],
            style: "textoInformacion"
        }
    );

    content.push(
        seccionTablaPdfMake({
            widths: ["auto", "*", "auto", "auto"],
            body: bodyTabla
        })
    );

    if (firmas) {
        content.push(firmas());
    }

    return content;
}

// Función para exportar los datos del reporte de activo disponible a Excel
function exportarExcelActivoDisponible({datos, nombreArchivo="ActivoDisponible", encabezado = {conEncabezado: false, fechaReporte: "", divisa: ""}} = {}) {

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
    const headersText = ["Código", "Cuenta", "Deudor", "Acreedor"];

      // Indices de columnas
    let colCount = 2;
    const colDebeIndex = colCount;

    if (encabezado.conEncabezado) {
        const rowLM = new Array(headersText.length).fill({ v: "" });
        rowLM[0] = { v: "Reporte Activo Disponible", s: styleAccount };
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
    }

    // Convertimos textos a Objetos Celda con estilo Header
    const encabezados = headersText.map(t => ({ v: t, s: styleHeader }));

    datosFinales.push(encabezados);
    currentRow++;

    let totalDeudor = 0;
    let totalAcreedor = 0;

    for (const value of datos) {
        const deudor = Math.round(parseFloat(value.deudor) * FACTOR);
        const acreedor = Math.round(parseFloat(value.acreedor) * FACTOR);

        totalDeudor += deudor;
        totalAcreedor += acreedor;

        // Fila de Datos (Construcción directa con formato)
        const fila = [
            { v: value.codigo ?? "", t: 's' },
            { v: value.nombre, t: 's' },
            { v: deudor / FACTOR, t: 'n', z: fmtNumero },
            { v: acreedor / FACTOR, t: 'n', z: fmtNumero },
        ];

        datosFinales.push(fila);
        currentRow++;
    }

    // Fila Total Cuenta
    const rowTotal = new Array(headersText.length).fill({ v: "" });
    rowTotal[0] = { v: "TOTAL:", s: styleTotal };
    rowTotal[colDebeIndex] = { v: totalDeudor / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };
    rowTotal[colDebeIndex + 1] = { v: totalAcreedor / FACTOR, t: 'n', z: fmtNumero, s: styleTotal };

    datosFinales.push(rowTotal);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 1 } });
    currentRow++;

    // Crear Hoja (Ya contiene estilos y formatos)
    const ws = XLSX.utils.aoa_to_sheet(datosFinales);
    ws['!merges'] = merges;

    // Anchos de columnas
    const cols = [
        { wch: 8 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 }
    ];
    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Activo Disponible");
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`, { compression: true });
}
