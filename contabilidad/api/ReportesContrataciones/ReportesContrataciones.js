import { getDivisaNombre, getDivisaSimbolo } from "../../../funciones/DatosAuxiliares.js";
import { formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { seccionTablaPdfMake } from "../../../funciones/VistaPDF.js";

// =========================================================
// CONTRATOS DE COBRO
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de contratos de cobro
export function pdfMakeContratosDeCobro(obtenerDatos, tituloReporte = "Contratos de Cobro") {
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "N° Doc.", style: "tablaEncabezado" },
                { text: "Lugar", style: "tablaEncabezado" },
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Fecha Final", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "N° Tributario", style: "tablaEncabezado" },
                { text: "N° Doc. Identidad", style: "tablaEncabezado" },
                { text: "Tipo", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Precio", style: "tablaEncabezado", alignment: "right" },
                { text: "Cobrado", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalPagado = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.precio || 0) * FACTOR);
            totalPagado += Math.round(parseFloat(value.pagado || 0) * FACTOR);
            bodyTabla.push([
                { text: value.nro_otras_cuentas || "-" },
                { text: value.lugar || "-" },
                { text: formatoFecha(value.fecha) || "-" },
                { text: formatoFecha(value.fecha_venci) || "-" },
                { text: value.nombrep || "-" },
                { text: value.nro_tributario || "-" },
                { text: value.nro_doc_identidad || "-" },
                { text: value.nombre_tipo || "-" },
                { text: value.concepto || "-" },
                { text: formatoDecimal(value.precio), alignment: "right" },
                { text: formatoDecimal(value.pagado), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 9, style: "tablaTextoTotal" },
            {}, {}, {}, {}, {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalPagado / FACTOR)}`, style: "tablaMontoTotal" },
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "*", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: tituloReporte, style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// =========================================================
// CONTRATOS DE PAGO
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de contratos de pago
export function pdfMakeContratosDePago(obtenerDatos, tituloReporte = "Contratos de Pago") {
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "N° Doc.", style: "tablaEncabezado" },
                { text: "Lugar", style: "tablaEncabezado" },
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Fecha Final", style: "tablaEncabezado" },
                { text: "Proveedor", style: "tablaEncabezado" },
                { text: "N° Tributario", style: "tablaEncabezado" },
                { text: "N° Doc. Identidad", style: "tablaEncabezado" },
                { text: "Tipo", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Precio", style: "tablaEncabezado", alignment: "right" },
                { text: "Pagado", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalPagado = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.precio || 0) * FACTOR);
            totalPagado += Math.round(parseFloat(value.pagado || 0) * FACTOR);
            bodyTabla.push([
                { text: value.nro_otras_cuentas || "-" },
                { text: value.lugar || "-" },
                { text: formatoFecha(value.fecha) || "-" },
                { text: formatoFecha(value.fecha_venci) || "-" },
                { text: value.nombrep || "-" },
                { text: value.nro_tributario || "-" },
                { text: value.nro_doc_identidad || "-" },
                { text: value.nombre_tipo || "-" },
                { text: value.concepto || "-" },
                { text: formatoDecimal(value.precio), alignment: "right" },
                { text: formatoDecimal(value.pagado), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 9, style: "tablaTextoTotal" },
            {}, {}, {}, {}, {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalPagado / FACTOR)}`, style: "tablaMontoTotal" },
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "*", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: tituloReporte, style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// =========================================================
// REPORTES DE CONTRATOS
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de reportes de contratos (tanto de cobro como de pago)
export function pdfMakeReporteDeContratos(obtenerDatos, tituloReporte = "Reportes de Contratos") {
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "N° Doc.", style: "tablaEncabezado" },
                { text: "Lugar", style: "tablaEncabezado" },
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Fecha Final", style: "tablaEncabezado" },
                { text: "Cliente/Proveedor", style: "tablaEncabezado" },
                { text: "N° Tributario", style: "tablaEncabezado" },
                { text: "N° Doc. Identidad", style: "tablaEncabezado" },
                { text: "Tipo", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Precio", style: "tablaEncabezado", alignment: "right" },
                { text: "Cobrado/Pagado", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalPagado = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.precio || 0) * FACTOR);
            totalPagado += Math.round(parseFloat(value.pagado || 0) * FACTOR);
            bodyTabla.push([
                { text: value.nro_otras_cuentas || "-" },
                { text: value.lugar || "-" },
                { text: formatoFecha(value.fecha) || "-" },
                { text: formatoFecha(value.fecha_venci) || "-" },
                { text: value.nombrep || "-" },
                { text: value.nro_tributario || "-" },
                { text: value.nro_doc_identidad || "-" },
                { text: value.nombre_tipo || "-" },
                { text: value.concepto || "-" },
                { text: formatoDecimal(value.precio), alignment: "right" },
                { text: formatoDecimal(value.pagado), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 9, style: "tablaTextoTotal" },
            {}, {}, {}, {}, {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalPagado / FACTOR)}`, style: "tablaMontoTotal" },
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "*", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: tituloReporte, style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}
