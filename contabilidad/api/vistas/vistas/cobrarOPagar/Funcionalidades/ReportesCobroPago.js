import { getDivisaNombre, getDivisaSimbolo } from "../../../funciones/DatosAuxiliares.js";
import { formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { seccionTablaPdfMake } from "../../../funciones/VistaPDF.js";

// =========================================================
// COBROS DE FACTURAS
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de cobros de facturas
export function pdfMakeCobrosDeFacturas(obtenerDatos){
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "N° Factura", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Monto Factura", style: "tablaEncabezado", alignment: "right" },
                { text: "Cobrado", style: "tablaEncabezado", alignment: "right" },
                { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalCobrado = 0;
        let totalSaldo = 0;
        for (const value of registros) {
            const monto = Math.round(parseFloat(value.monto || 0) * FACTOR);
            const cobrado = Math.round(parseFloat(value.pagado || 0) * FACTOR);
            const saldo = Math.round(parseFloat(value.saldo || 0) * FACTOR);
            totalMonto += monto;
            totalCobrado += cobrado;
            totalSaldo += saldo;
            bodyTabla.push([
                { text: formatoFecha(value.fecha) || "-" },
                { text: value.numero || "-" },
                { text: value.codigo || "-" },
                { text: value.nombrep || "-" },
                { text: value.por_concepto_de || "-" },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
                { text: formatoDecimal(cobrado / FACTOR), alignment: "right" },
                { text: formatoDecimal(saldo / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalCobrado / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalSaldo / FACTOR)}`, style: "tablaMontoTotal"},
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "*", "*", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Cobros Pendientes", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// =========================================================
// PAGOS DE FACTURAS
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de pagos de facturas
export function pdfMakePagosDeFacturas(obtenerDatos){
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "N° Factura", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Proveedor", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Monto Factura", style: "tablaEncabezado", alignment: "right" },
                { text: "Pagado", style: "tablaEncabezado", alignment: "right" },
                { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalPagado = 0;
        let totalSaldo = 0;
        for (const value of registros) {
            const monto = Math.round(parseFloat(value.monto || 0) * FACTOR);
            const cobrado = Math.round(parseFloat(value.cobrado || 0) * FACTOR);
            const saldo = Math.round(parseFloat(value.saldo || 0) * FACTOR);
            totalMonto += monto;
            totalPagado += cobrado;
            totalSaldo += saldo;
            bodyTabla.push([
                { text: formatoFecha(value.fecha) || "-" },
                { text: value.numero || "-" },
                { text: value.codigo || "-" },
                { text: value.nombrep || "-" },
                { text: value.por_concepto_de || "-" },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
                { text: formatoDecimal(cobrado / FACTOR), alignment: "right" },
                { text: formatoDecimal(saldo / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalPagado / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalSaldo / FACTOR)}`, style: "tablaMontoTotal"},
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "*", "*", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Pagos Pendientes", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// =========================================================
// COBROS DE CONTRATOS
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de detalle de cobros de contratos con recibo
export function pdfMakeCobrosContratoConRecibo(url_rep, registroContrato) {
    return async () => {
        const datoDetalle = await obtenerDatos(url_rep);
        if (!datoDetalle) throw new Error("Error al obtener los datos");

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const FACTOR = 100;
        let tMonto = 0;
        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Lugar", style: "tablaEncabezado" },
                { text: "Persona", style: "tablaEncabezado" },
                { text: "CI", style: "tablaEncabezado" },
                { text: "N° Recibo", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];
        for (const value of datoDetalle) {
            const monto = Math.round(parseFloat(value.monto || 0) * FACTOR);
            tMonto += monto;

            bodyTabla.push([
                { text: formatoFecha(value.fecha) },
                { text: value.lugar },
                { text: value.persona },
                { text: value.ci },
                { text: value.recibo },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: formatoDecimal(tMonto / FACTOR), style: "tablaMontoTotal" },
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "*", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Detalle Recibos de Cobros", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            {
                text: [
                    { text: "Fecha: ", bold: true },
                    formatoFecha(registroContrato.fecha)
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'N° Doc.: ', bold: true },
                    registroContrato.nro_otras_cuentas
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'Cliente: ', bold: true },
                    registroContrato.nombrep
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: `Monto ${simbolo}: `, bold: true },
                    formatoDecimal(registroContrato.precio)
                ],
                marginBottom: 8,
            },
            tablaContenido,
        ];

        return content;
    };
}

// Funcionalidad que genera el contenido para el reporte PDF de detalle de cobros de contratos con factura
export function pdfMakeCobrosContratoConFactura(url_rep, registroContrato) {
    return async () => {
        const datoDetalle = await obtenerDatos(url_rep);
        if (!datoDetalle) throw new Error("Error al obtener los datos");

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const FACTOR = 100;
        let tMonto = 0;
        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "N° Factura", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];
        for (const value of datoDetalle) {
            const monto = Math.round(parseFloat(value.montofactura || 0) * FACTOR);
            tMonto += monto;

            bodyTabla.push([
                { text: formatoFecha(value.fecha) },
                { text: value.nfactura },
                { text: value.codigotransaccion },
                { text: value.prov_client },
                { text: value.por_concepto_de },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: formatoDecimal(tMonto / FACTOR), style: "tablaMontoTotal" },
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "auto", "*", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Detalle Facturas de Cobros", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            {
                text: [
                    { text: "Fecha: ", bold: true },
                    formatoFecha(registroContrato.fecha)
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'N° Doc.: ', bold: true },
                    registroContrato.nro_otras_cuentas
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'Cliente: ', bold: true },
                    registroContrato.nombrep
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: `Monto ${simbolo}: `, bold: true },
                    formatoDecimal(registroContrato.precio)
                ],
                marginBottom: 8,
            },
            tablaContenido,
        ];

        return content;
    };
}

// =========================================================
// PAGOS DE CONTRATOS
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de detalle de pagos de contratos con recibo
export function pdfMakePagosContratoConRecibo(url_rep, registroContrato) {
    return async () => {
        const datoDetalle = await obtenerDatos(url_rep);
        if (!datoDetalle) throw new Error("Error al obtener los datos");

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const FACTOR = 100;
        let tMonto = 0;
        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Lugar", style: "tablaEncabezado" },
                { text: "Persona", style: "tablaEncabezado" },
                { text: "CI", style: "tablaEncabezado" },
                { text: "N° Recibo", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];
        for (const value of datoDetalle) {
            const monto = Math.round(parseFloat(value.monto || 0) * FACTOR);
            tMonto += monto;

            bodyTabla.push([
                { text: formatoFecha(value.fecha) },
                { text: value.lugar },
                { text: value.persona },
                { text: value.ci },
                { text: value.recibo },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: formatoDecimal(tMonto / FACTOR), style: "tablaMontoTotal" },
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "*", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Detalle Recibos de Pagos", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            {
                text: [
                    { text: "Fecha: ", bold: true },
                    formatoFecha(registroContrato.fecha)
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'N° Doc.: ', bold: true },
                    registroContrato.nro_otras_cuentas
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'Proveedor: ', bold: true },
                    registroContrato.nombrep
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: `Monto ${simbolo}: `, bold: true },
                    formatoDecimal(registroContrato.precio)
                ],
                marginBottom: 8,
            },
            tablaContenido,
        ];

        return content;
    };
}

// Funcionalidad que genera el contenido para el reporte PDF de detalle de pagos de contratos con factura
export function pdfMakePagosContratoConFactura(url_rep, registroContrato) {
    return async () => {
        const datoDetalle = await obtenerDatos(url_rep);
        if (!datoDetalle) throw new Error("Error al obtener los datos");

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const FACTOR = 100;
        let tMonto = 0;
        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "N° Factura", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];
        for (const value of datoDetalle) {
            const monto = Math.round(parseFloat(value.montofactura || 0) * FACTOR);
            tMonto += monto;

            bodyTabla.push([
                { text: formatoFecha(value.fecha) },
                { text: value.nfactura },
                { text: value.codigotransaccion },
                { text: value.prov_client },
                { text: value.por_concepto_de },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: formatoDecimal(tMonto / FACTOR), style: "tablaMontoTotal" },
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "auto", "*", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Detalle Facturas de Pagos", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            {
                text: [
                    { text: "Fecha: ", bold: true },
                    formatoFecha(registroContrato.fecha)
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'N° Doc.: ', bold: true },
                    registroContrato.nro_otras_cuentas
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'Proveedor: ', bold: true },
                    registroContrato.nombrep
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: `Monto ${simbolo}: `, bold: true },
                    formatoDecimal(registroContrato.precio)
                ],
                marginBottom: 8,
            },
            tablaContenido,
        ];

        return content;
    };
}