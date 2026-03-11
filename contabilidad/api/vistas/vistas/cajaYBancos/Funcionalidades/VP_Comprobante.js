import { CT_URLAPI, getDivisaNombre } from "../../../funciones/DatosAuxiliares.js";
import { ajustarFecha, convertirFechaATexto, formatoDecimal, formatoFecha, formatoTexto } from "../../../funciones/Funciones.js";
import { NumerosALetras } from "../../../funciones/NumeroALetras.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { contenidoConEncabezadoPdfMake, firmasContabilidadPdfMake, seccionTablaPdfMake } from "../../../funciones/VistaPDF.js";

/**
 * Crea el contenido de la vista previa para el detalle de los cobros realizados.
 * @param {string} urlSolicitud - URL de la API para obtener los datos.
 * @param {"factura"|"recibo"} tipoDocumento - Tipo de documento para determinar la estructura de los datos.
 * @param {"cobro"|"pago"} tipoReporte - Tipo de reporte para determinar cómo mostrar los montos en la tabla.
 * @return {Array} Contenido formateado para PDFMake.
 */
export const pdfMakeComprobanteGeneral = (urlSolicitud, tipoDocumento, tipoReporte) => async () => {
    const datoDetalle = await obtenerDatos(urlSolicitud);

    if (!datoDetalle) throw new Error("Error al obtener los datos");

    const divisaEnUso = getDivisaNombre();

    const bodyTabla = [
        [
            { text: "Código", style: "tablaEncabezado" },
            { text: "Cuenta", style: "tablaEncabezado" },
            { text: "Débito", style: "tablaEncabezado", alignment: "right" },
            { text: "Crédito", style: "tablaEncabezado", alignment: "right" },
            { text: "Responsable", style: "tablaEncabezado" },
            { text: "Firmas", style: "tablaEncabezado" },
        ]
    ];

    for (const item of datoDetalle.caja_bancos) {
        let textoResponsables = [];
        if (item.responsables && item.responsables.length > 0) {
            for (const [i, responsable] of item.responsables.entries()) {
                textoResponsables.push({
                    text: `${responsable.nombre ?? "-"} ${responsable.apellido ?? "-"}`,
                    marginTop: i > 0 ? 4 : 0
                });
                if (responsable.ci) textoResponsables.push({ text: "CI: " + responsable.ci});
            }
        }
        bodyTabla.push([
            { text: item.codigo ?? "-" },
            { text: item.nombre ?? "-" },
            {
                text: tipoReporte === "cobro" ? (item.codigo && item.nombre ? formatoDecimal(item.monto ?? 0) : "-") : "-",
                alignment: "right"
            },
            {
                text: tipoReporte === "pago" ? (item.codigo && item.nombre ? formatoDecimal(item.monto ?? 0) : "-") : "-",
                alignment: "right"
            },
            { stack: textoResponsables },
            { text: "" }
        ]);
    }

    const datos = datoDetalle.facturas
    let montoT = datoDetalle.monto_total;
    const infC = {};
    if (tipoDocumento === 'factura') {
        if (datos?.length > 0) {
            for (const item of datos) {
                infC["lugar"] = item.lugar;
                infC["nit"] = item.nit;
                infC["direccion"] = item.direccion;
                infC["nrecibo"] = item.nrecibo;
                infC["fecha"] = item.fecha;
                infC["persona"] = item.persona;
                infC["nombre"] = item.nombre;
                infC["concepto"] = item.por_concepto_de;
                infC["estado"] = formatoTexto(item.estado_documento) || null;
            }
        }
    } else if (tipoDocumento === 'recibo') {
        if (datos?.length > 0) {
            for (const item of datos) {
                infC["lugar"] = item.lugar;
                infC["nit"] = item.nit;
                infC["direccion"] = item.direccion;
                infC["nrecibo"] = item.nrecibo;
                infC["fecha"] = item.fecha;
                infC["persona"] = item.persona;
                infC["nombre"] = item.nombre;
                infC["concepto"] = item.concepto;
                infC["estado"] = formatoTexto(item.estado_documento) || null;
            }
        }
    }
    // infC["estado"] = formatoTexto(registro?.estado_documento) || null;
    // infC["estado"] = null;

    const tablaContenido = seccionTablaPdfMake({
        widths: ["auto", "*", "auto", "auto", "*", 100],
        body: bodyTabla,
    });

    const content = [
        {
            text: `Comprobante de ${tipoReporte === "cobro" ? "Ingreso" : "Egreso"}`,
            style: "textoTitulo"
        },
        { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },

        {
            text: [{ text: 'N°: ', bold: true }, infC.nrecibo ?? ""],
            alignment: "right",
            style: infC.estado ? "espaciadoTextoVertical" : null
        },
    ];

    if (infC.estado) {
        content.push(
            {
                text: [{ text: 'Estado: ', bold: true }, infC.estado ?? ""],
                alignment: "right"
            },
        );
    }

    content.push(
        {
            text: [
                { text: 'Lugar y Fecha: ', bold: true },
                `${infC.lugar ? infC.lugar + ", " : ""} ${formatoFecha(infC.fecha ?? "")}`
            ],
            style: "espaciadoTextoVertical"
        },
        {
            text: [{ text: 'Monto Bs./$us:', bold: true }],
            alignment: "right",
            style: "espaciadoTextoVertical"
        },
        {
            text: formatoDecimal(montoT),
            alignment: "right"
        },
        {
            columns: [
                { text: [{ text: 'Recibí de: ', bold: true }, `${infC.nombre ?? ""} ${infC.persona ? "(" + infC.persona + ")": ""}`] },
                { text: [{ text: 'NIT: ', bold: true }, infC.nit ?? ""] }
            ],
            style: "espaciadoTextoVertical"
        },
        {
            text: [ { text: 'Dirección: ', bold: true }, infC.direccion ?? "" ],
            style: "espaciadoTextoVertical"
        },
        {
            text: [ { text: 'La suma de: ', bold: true }, NumerosALetras(montoT) ],
            style: "espaciadoTextoVertical"
        },
        {
            text: [ { text: 'Por concepto de: ', bold: true }, infC.concepto ?? "" ],
            marginBottom: 8
        },
        tablaContenido,
    );

    return content;
}

export const pdfMakeReporteEfectivo = (obtenerLista, obtenerDatosFiltro) => async ({lugar, fecha}) => {
    const {
        fechaInicio,
        fechaFin,
        tipoComprobante,

        idCajaBanco,
        nombreCajaBanco,
        codigoCajaBanco,
    } = obtenerDatosFiltro() || {};

    let tituloReporte = `${codigoCajaBanco} - ${nombreCajaBanco}`;
    let esTodos = false;

    if (Array.isArray(idCajaBanco)) {
        tituloReporte = "Todos";
        esTodos = true;
    }

    const registros = obtenerLista();
    const usuarios = await obtenerDatos(`${CT_URLAPI}listar_caja_bancos_usuarios/${idCajaBanco}`);

    if (!registros || !usuarios) throw new Error("Error al obtener los datos");

    const datosFirmas = usuarios.filter((item) => item.funcion === "supervisor" || item.funcion === "responsable");
    datosFirmas.sort((a, b) => a.funcion.localeCompare(b.funcion));

    let firmasColumns;
    if (datosFirmas.length > 0) {
        const arrFirmas = datosFirmas.map((item) => {
            return {
                nombre: item.nombre_trabajador,
                cargo: item.funcion ? item.funcion.charAt(0).toUpperCase() + item.funcion.slice(1) : "",
                ci: item.ci,
            }
        });
        firmasColumns = await firmasContabilidadPdfMake(undefined, arrFirmas)
    }

    const nombreResponsable = usuarios.find((item) => item.funcion === "responsable");

    const divisaEnUso = JSON.parse(localStorage.getItem("divisa"))?.nombre || "Bolivianos";
    const simboloDivisa = JSON.parse(localStorage.getItem("divisa"))?.simbolo || "BOB";

    const bodyTabla = [
        [
            { text: "N°", style: "tablaEncabezado" },
            { text: "Fecha", style: "tablaEncabezado" },
            { text: "N° Comp", style: "tablaEncabezado" },
            { text: "N° Doc", style: "tablaEncabezado" },
            { text: "Prov/Cliente", style: "tablaEncabezado" },
            { text: "Concepto", style: "tablaEncabezado" },
            { text: "Ingreso", style: "tablaEncabezado", alignment: "right" },
            { text: "Egreso", style: "tablaEncabezado", alignment: "right" },
            { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
        ]
    ];

    if (registros.length > 0) {

        const fechaSaldo = ajustarFecha({ fecha: fechaInicio, dias: -1, forma: "fecha" });
        bodyTabla.push([
            { text: "", colSpan: 5 }, {}, {}, {}, {},
            { text: `Saldo al ${convertirFechaATexto(fechaSaldo)}`, colSpan: 3 },
            {}, {},
            { text: formatoDecimal(registros[0].saldo_inicial), alignment: "right" }
        ]);
    }

    const FACTOR = 100;
    let tIngreso = 0;
    let tEgreso = 0;

    for (const value of registros) {
        const descripcion = value.descripcion;
        const texto = descripcion;

        const ingresoT = Math.round(parseFloat(value.ingreso || 0) * FACTOR);
        const egresoT = Math.round(parseFloat(value.egreso || 0) * FACTOR);
        if (value.estado_documento !== "anulado") {
            tIngreso += ingresoT;
            tEgreso += egresoT;
        }

        bodyTabla.push([
            { text: value.contador },
            { text: formatoFecha(value.fecha) },
            { text: value.nrecibo || "-" },
            { text: value.nro_documento ?? "-" },
            { text: value.nombre_cliente || "-" },
            { text: texto || "-" },
            { text: formatoDecimal(ingresoT / FACTOR), alignment: "right" },
            { text: formatoDecimal(egresoT / FACTOR), alignment: "right" },
            { text: formatoDecimal(value.saldo), alignment: "right" },
        ]);
    }

    bodyTabla.push([
        { text: `Sumas ${simboloDivisa}: `, colSpan: 6, style: "tablaTextoTotal", alignment: "right" },
        {}, {}, {}, {}, {},
        { text: formatoDecimal(tIngreso / FACTOR), style: "tablaMontoTotal", alignment: "right" },
        { text: formatoDecimal(tEgreso / FACTOR), style: "tablaMontoTotal", alignment: "right" },
        { text: "" }
    ]);

    const tablaContenido = seccionTablaPdfMake({
        widths: ["auto", "auto", "auto", "auto", "auto", "*", "auto", "auto", "auto"],
        body: bodyTabla,
    });

    const content = [
        ...contenidoConEncabezadoPdfMake(),
        { text: tituloReporte, style: "textoTitulo" },
        {
            stack: [
                {
                    text: `Entre: ${formatoFecha(fechaInicio)} y ${formatoFecha(fechaFin)}`,
                    marginBottom: 1
                },
                { text: `(Expresado en ${divisaEnUso})`},
            ],
            style: "textoInformacion"
        }
    ];

    if (!esTodos) {
        content.push(
            {

                text: [
                    { text: 'Responsable: ', bold: true },
                    nombreResponsable?.nombre_trabajador ?? ""
                ],
                style: "espaciadoTextoVertical"
            }
        );
    }

    content.push(
        {
            text: [
                { text: 'Lugar y Fecha: ', bold: true },
                `${lugar}, ${formatoFecha(fecha)}`
            ],
            marginBottom: 8,
        },

        tablaContenido,
    );

    if (firmasColumns && !esTodos) {
        content.push(firmasColumns());
    }

    return content;
}

export const xlsxReporteEfectivo = (obtenerLista, obtenerDatosFiltro) => async ({lugar, fecha}) => {
    const {
        fechaInicio,
        fechaFin,
        idCajaBanco,
        nombreCajaBanco,
        codigoCajaBanco,
    } = obtenerDatosFiltro() || {};

    let tituloReporte = `${codigoCajaBanco} - ${nombreCajaBanco}`;
    let esTodos = false;

    if (Array.isArray(idCajaBanco)) {
        tituloReporte = "Todos";
        esTodos = true;
    }

    const registros = obtenerLista();
    const usuarios = await obtenerDatos(`${CT_URLAPI}listar_caja_bancos_usuarios/${idCajaBanco}`);

    if (!registros || !usuarios) throw new Error("Error al obtener los datos");

    const nombreResponsable = usuarios.find((item) => item.funcion === "responsable");

    const divisaEnUso = JSON.parse(localStorage.getItem("divisa"))?.nombre || "Bolivianos";
    const simboloDivisa = JSON.parse(localStorage.getItem("divisa"))?.simbolo || "BOB";

    const wb = XLSX.utils.book_new();
    const datosFinales = [];
    const merges = [];
    let currentRow = 0;

    // Estilos Básicos
    const styleTitle = { font: { bold: true, sz: 14 } };
    const styleSubtitle = { font: { bold: true } };
    // const styleHeader = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" } };
    const styleHeader = { font: { bold: true } };
    const styleCurrency = { numFmt: "#,##0.00" };
    const styleTotal = { font: { bold: true }, numFmt: "#,##0.00", alignment: { horizontal: "right" } };
    const styleTextTotal = { font: { bold: true }, alignment: { horizontal: "right" } };
    const styleBold = { font: { bold: true } };

    // Título
    datosFinales.push([{ v: tituloReporte, s: styleTitle }]);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 11 } });
    currentRow++;

    // Subtítulos
    datosFinales.push([{ v: `Entre: ${formatoFecha(fechaInicio)} y ${formatoFecha(fechaFin)}`, s: styleSubtitle }]);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 11 } });
    currentRow++;

    datosFinales.push([{ v: `(Expresado en ${divisaEnUso})`, s: styleSubtitle }]);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 11 } });
    currentRow++;

    datosFinales.push([]); // Espacio
    currentRow++;

    // Información
    if (!esTodos && nombreResponsable) {
        datosFinales.push([{ v: `Responsable: ${nombreResponsable.nombre_trabajador ?? ""}`, s: styleBold }]);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 4 } });
        currentRow++;
    }
    datosFinales.push([{ v: `Lugar y Fecha: ${lugar}, ${formatoFecha(fecha)}`, s: styleBold }]);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 4 } });
    currentRow++;

    datosFinales.push([]); // Espacio
    currentRow++;

    // Encabezados Tabla
    const headers = ["N°", "Fecha", "N° Comp.", "N° Trans.", "N° Doc.", "Prov/Cliente", "Concepto", "Ingreso", "Egreso", "Saldo", "Tipo", "Estado"];
    datosFinales.push(headers.map(t => ({ v: t, s: styleHeader })));
    currentRow++;

    // Saldo Inicial
    if (registros.length > 0) {
        const fechaSaldo = ajustarFecha({ fecha: fechaInicio, dias: -1, forma: "fecha" });
        const rowBalance = new Array(12).fill({ v: "", t: "s" });

        rowBalance[6] = { v: `Saldo al ${convertirFechaATexto(fechaSaldo)}` };
        rowBalance[9] = { v: parseFloat(registros[0].saldo_inicial || 0), t: 'n', s: styleCurrency };

        datosFinales.push(rowBalance);
        merges.push({ s: { r: currentRow, c: 6 }, e: { r: currentRow, c: 8 } });
        currentRow++;
    }

    const FACTOR = 100;
    let tIngreso = 0;
    let tEgreso = 0;

    for (const value of registros) {
        const descripcion = value.descripcion;
        const texto = descripcion;

        const ingresoT = Math.round(parseFloat(value.ingreso || 0) * FACTOR);
        const egresoT = Math.round(parseFloat(value.egreso || 0) * FACTOR);

        if (value.estado_documento !== "anulado") {
            tIngreso += ingresoT;
            tEgreso += egresoT;
        }

        const row = [
            { v: value.contador, t: 's' },
            { v: formatoFecha(value.fecha), t: 's' },
            { v: value.nrecibo || "-", t: 's' },
            { v: value.codigotransaccion || "-", t: 's' },
            { v: value.nro_documento ?? "-", t: 's' },
            { v: value.nombre_cliente || "-", t: 's' },
            { v: texto || "-", t: 's' },
            { v: ingresoT / FACTOR, t: 'n', s: styleCurrency },
            { v: egresoT / FACTOR, t: 'n', s: styleCurrency },
            { v: parseFloat(value.saldo), t: 'n', s: styleCurrency },
            { v: value.factura_recibo || "-", t: 's' },
            { v: value.estado_documento || "Activo", t: 's' },
        ];
        datosFinales.push(row);
        currentRow++;
    }

    // Totales
    const rowTotal = new Array(12).fill({ v: "", t: "s" });
    rowTotal[0] = { v: `Sumas ${simboloDivisa}: `, s: styleTextTotal };
    rowTotal[7] = { v: tIngreso / FACTOR, t: 'n', s: styleTotal };
    rowTotal[8] = { v: tEgreso / FACTOR, t: 'n', s: styleTotal };

    datosFinales.push(rowTotal);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 6 } });
    currentRow++;

    datosFinales.push([]); // Espacio
    currentRow++;

    const ws = XLSX.utils.aoa_to_sheet(datosFinales);
    ws['!merges'] = merges;
    ws['!cols'] = [
        { wch: 8 },  // N
        { wch: 12 }, // Fecha
        { wch: 10 }, // N Comp
        { wch: 10 }, // N Trans
        { wch: 10 }, // N Doc
        { wch: 25 }, // Prov/Cliente
        { wch: 40 }, // Concepto
        { wch: 12 }, // Ingreso
        { wch: 12 }, // Egreso
        { wch: 12 }, // Saldo
        { wch: 12 }, // Tipo
        { wch: 12 }, // Estado
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Reporte_Efectivo");
    const safeTitle = (tituloReporte || "Reporte").replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    XLSX.writeFile(wb, `${safeTitle}.xlsx`, { compression: true });
}