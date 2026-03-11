import { getDivisaNombre, getDivisaSimbolo } from "../../../funciones/DatosAuxiliares.js";
import { formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { seccionTablaPdfMake } from "../../../funciones/VistaPDF.js";
import { obtenerTipoVentaComercial } from "../facturasComercial.js";

// =========================================================
// FACTURAS DE COBRO
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de facturas de cobro
export function pdfMakeFacturasDeCobro(obtenerDatos){
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
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        for (const value of registros) {
            const monto = Math.round(parseFloat(value.monto || 0) * FACTOR);
            totalMonto += monto;
            bodyTabla.push([
                { text: formatoFecha(value.fecha) || "-" },
                { text: value.numero || "-" },
                { text: value.codigo || "-" },
                { text: value.nombrep || "-" },
                { text: value.por_concepto_de || "-" },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "*", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Facturas Cobradas", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de detalle de cobrados
export function pdfMakeDetalleCobrados(url_rep, det_cobrados, saldo) {
    return async () => {
        const datoDetalle = await obtenerDatos(url_rep);
        if (!datoDetalle) throw new Error("Error al obtener los datos");
        // if (datoDetalle.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const FACTOR = 100;
        let tMonto = 0;
        let colMonto = Math.round(parseFloat(det_cobrados.monto || 0) * FACTOR);
        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Persona", style: "tablaEncabezado" },
                { text: "CI", style: "tablaEncabezado" },
                { text: "N° Comprobante", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
                { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
            ]
        ];
        for (const value of datoDetalle) {
            colMonto = colMonto - Math.round(parseFloat(value.monto || 0) * FACTOR);
            const monto = Math.round(parseFloat(value.monto || 0) * FACTOR);
            tMonto += monto;

            bodyTabla.push([
                { text: formatoFecha(value.fecha) },
                { text: value.persona },
                { text: value.ci },
                { text: value.recibo },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
                { text: formatoDecimal(colMonto / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: "Total cobrado: ", colSpan: 4, style: "tablaTextoTotal" },
            {},
            {},
            {},
            { text: formatoDecimal(tMonto / FACTOR), style: "tablaMontoTotal" },
            { text: "" },
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "*", "auto", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Detalle Cobrados", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            {
                text: [
                    { text: "Fecha: ", bold: true },
                    formatoFecha(det_cobrados.fecha)
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'N° Factura: ', bold: true },
                    det_cobrados.numero
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'N° Transacción: ', bold: true },
                    det_cobrados.codigo
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'Cliente: ', bold: true },
                    det_cobrados.nombrep
                ],
                style: "espaciadoTextoVertical"
            },
        ];

        if (saldo) {
            content.push(
                {
                    text: [
                        { text: `Monto ${simbolo}: `, bold: true },
                        formatoDecimal(det_cobrados.monto)
                    ],
                    style: "espaciadoTextoVertical"
                },
                {
                    text: [
                        { text: `Saldo por cobrar ${simbolo}: `, bold: true },
                        formatoDecimal(typeof saldo === "function" ? saldo() : saldo)
                    ],
                    marginBottom: 8,
                }
            );
        } else {
            content.push({
                text: [
                    { text: `Monto ${simbolo}: `, bold: true },
                    formatoDecimal(det_cobrados.monto)
                ],
                marginBottom: 8,
            });
        }

        content.push(
            tablaContenido,
        );

        return content;
    };
}

// =========================================================
// FACTURAS DE PAGOS
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de facturas de pago
export function pdfMakeFacturasDePago(obtenerDatos){
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
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        for (const value of registros) {
            const monto = Math.round(parseFloat(value.monto || 0) * FACTOR);
            totalMonto += monto;
            bodyTabla.push([
                { text: formatoFecha(value.fecha) || "-" },
                { text: value.numero || "-" },
                { text: value.codigo || "-" },
                { text: value.nombrep || "-" },
                { text: value.por_concepto_de || "-" },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "*", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Facturas Pagadas", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de detalle de pagados
export function pdfMakeDetallePagados(url_rep, det_pagados, saldo) {
    return async () => {
        const datoDetalle = await obtenerDatos(url_rep);
        if (!datoDetalle) throw new Error("Error al obtener los datos");

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const FACTOR = 100;
        let tMonto = 0;
        let colMonto = Math.round(parseFloat(det_pagados.monto || 0) * FACTOR);
        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Persona", style: "tablaEncabezado" },
                { text: "CI", style: "tablaEncabezado" },
                { text: "N° Comprobante", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
                { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
            ]
        ];
        for (const value of datoDetalle) {
            colMonto = colMonto - Math.round(parseFloat(value.monto || 0) * FACTOR);
            const monto = Math.round(parseFloat(value.monto || 0) * FACTOR);
            tMonto += monto;

            bodyTabla.push([
                { text: formatoFecha(value.fecha) },
                { text: value.persona },
                { text: value.ci },
                { text: value.recibo },
                { text: formatoDecimal(monto / FACTOR), alignment: "right" },
                { text: formatoDecimal(colMonto / FACTOR), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: "Total cobrado: ", colSpan: 4, style: "tablaTextoTotal" },
            {},
            {},
            {},
            { text: formatoDecimal(tMonto / FACTOR), style: "tablaMontoTotal" },
            { text: "" },
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "*", "auto", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Detalle Pagos", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            {
                text: [
                    { text: "Fecha: ", bold: true },
                    formatoFecha(det_pagados.fecha)
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'N°Factura: ', bold: true },
                    det_pagados.numero
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'N° Transacción: ', bold: true },
                    det_pagados.codigo
                ],
                style: "espaciadoTextoVertical"
            },
            {
                text: [
                    { text: 'Proveedor: ', bold: true },
                    det_pagados.nombrep
                ],
                style: "espaciadoTextoVertical"
            },
        ];

        if (saldo) {
            content.push(
                {
                    text: [
                        { text: `Monto ${simbolo}: `, bold: true },
                        formatoDecimal(det_pagados.monto)
                    ],
                    style: "espaciadoTextoVertical"
                },
                {
                    text: [
                        { text: `Saldo por pagar ${simbolo}: `, bold: true },
                        formatoDecimal(typeof saldo === "function" ? saldo() : saldo)
                    ],
                    marginBottom: 8,
                }
            );
        } else {
            content.push({
                text: [
                    { text: `Monto ${simbolo}: `, bold: true },
                    formatoDecimal(det_pagados.monto)
                ],
                marginBottom: 8,
            });
        }

        content.push(
            tablaContenido,
        );

        return content;
    };
}

// =========================================================
// FACTURAS DE COMERCIAL
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de facturas de comercial
export function pdfMakeFacturasComercial(obtenerDatos){
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "Sucursal", style: "tablaEncabezado" },
                { text: "Tipo-Venta", style: "tablaEncabezado" },
                { text: "Tipo-Pago", style: "tablaEncabezado" },
                { text: "N° Factura", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
                { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
                { text: "Descuento", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalSaldo = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.montototal || 0) * FACTOR);
            totalSaldo += Math.round(parseFloat(value.saldo || 0) * FACTOR);
            bodyTabla.push([
                { text: formatoFecha(value.fechaventa) || "-" },
                { text: value.cliente || "-" },
                { text: value.sucursal || "-" },
                { text: obtenerTipoVentaComercial(value.tipoventa) },
                { text: value.tipopago || "-" },
                { text: value.nfactura || "-" },
                { text: formatoDecimal(value.monto), alignment: "right" },
                { text: formatoDecimal(value.saldo), alignment: "right" },
                { text: formatoDecimal(value.descuento), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 6, style: "tablaTextoTotal" },
            {}, {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalSaldo / FACTOR)}`, style: "tablaMontoTotal"},
            { text: ""}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Facturas Comercial", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de facturas de comercial asignadas
export function pdfMakeFacturasComercialAsignados(obtenerDatos){
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "Sucursal", style: "tablaEncabezado" },
                { text: "Tipo-Venta", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Tipo-Pago", style: "tablaEncabezado" },
                { text: "N° Factura", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
                { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
                { text: "Descuento", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalSaldo = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.montototal || 0) * FACTOR);
            totalSaldo += Math.round(parseFloat(value.saldo || 0) * FACTOR);
            bodyTabla.push([
                { text: formatoFecha(value.fechaventa) || "-" },
                { text: value.cliente || "-" },
                { text: value.sucursal || "-" },
                { text: obtenerTipoVentaComercial(value.tipoventa) },
                { text: value.codigotransaccion || "-" },
                { text: value.tipopago || "-" },
                { text: value.nfactura || "-" },
                { text: formatoDecimal(value.montototal), alignment: "right" },
                { text: formatoDecimal(value.saldo), alignment: "right" },
                { text: formatoDecimal(value.descuento), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 7, style: "tablaTextoTotal" },
            {}, {}, {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalSaldo / FACTOR)}`, style: "tablaMontoTotal"},
            { text: ""}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Facturas Comercial Asignadas", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de facturas de comercial válidas
export function pdfMakeFacturasComercialValidas(obtenerDatos){
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "Sucursal", style: "tablaEncabezado" },
                { text: "Tipo-Venta", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Tipo-Pago", style: "tablaEncabezado" },
                { text: "N° Factura", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
                { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
                { text: "Descuento", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalSaldo = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.montototal || 0) * FACTOR);
            totalSaldo += Math.round(parseFloat(value.saldo || 0) * FACTOR);
            bodyTabla.push([
                { text: formatoFecha(value.fechaventa) || "-" },
                { text: value.cliente || "-" },
                { text: value.sucursal || "-" },
                { text: obtenerTipoVentaComercial(value.tipoventa) },
                { text: value.codigotransaccion || "-" },
                { text: value.tipopago || "-" },
                { text: value.nfactura || "-" },
                { text: formatoDecimal(value.montototal), alignment: "right" },
                { text: formatoDecimal(value.saldo), alignment: "right" },
                { text: formatoDecimal(value.descuento), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 7, style: "tablaTextoTotal" },
            {}, {}, {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalSaldo / FACTOR)}`, style: "tablaMontoTotal"},
            { text: ""}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Facturas Comercial Válidas", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de facturas de comercial anuladas
export function pdfMakeFacturasComercialAnuladas(obtenerDatos){
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "Sucursal", style: "tablaEncabezado" },
                { text: "Tipo-Venta", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Tipo-Pago", style: "tablaEncabezado" },
                { text: "N° Factura", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
                { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
                { text: "Descuento", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalSaldo = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.montototal || 0) * FACTOR);
            totalSaldo += Math.round(parseFloat(value.saldo || 0) * FACTOR);
            bodyTabla.push([
                { text: formatoFecha(value.fechaventa) || "-" },
                { text: value.cliente || "-" },
                { text: value.sucursal || "-" },
                { text: obtenerTipoVentaComercial(value.tipoventa) },
                { text: value.codigotransaccion || "-" },
                { text: value.tipopago || "-" },
                { text: value.nfactura || "-" },
                { text: formatoDecimal(value.montototal), alignment: "right" },
                { text: formatoDecimal(value.saldo), alignment: "right" },
                { text: formatoDecimal(value.descuento), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 7, style: "tablaTextoTotal" },
            {}, {}, {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalSaldo / FACTOR)}`, style: "tablaMontoTotal"},
            { text: ""}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Facturas Comercial Anuladas", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de facturas de comercial proformas
export function pdfMakeFacturasComercialProformas(obtenerDatos){
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "Sucursal", style: "tablaEncabezado" },
                { text: "Tipo-Venta", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Tipo-Pago", style: "tablaEncabezado" },
                { text: "N° Factura", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
                { text: "Saldo", style: "tablaEncabezado", alignment: "right" },
                { text: "Descuento", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        let totalSaldo = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.montototal || 0) * FACTOR);
            totalSaldo += Math.round(parseFloat(value.saldo || 0) * FACTOR);
            bodyTabla.push([
                { text: formatoFecha(value.fechaventa) || "-" },
                { text: value.cliente || "-" },
                { text: value.sucursal || "-" },
                { text: obtenerTipoVentaComercial(value.tipoventa) },
                { text: value.codigotransaccion || "-" },
                { text: value.tipopago || "-" },
                { text: value.nfactura || "-" },
                { text: formatoDecimal(value.montototal), alignment: "right" },
                { text: formatoDecimal(value.saldo), alignment: "right" },
                { text: formatoDecimal(value.descuento), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 7, style: "tablaTextoTotal" },
            {}, {}, {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalSaldo / FACTOR)}`, style: "tablaMontoTotal"},
            { text: ""}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Proformas", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// =========================================================
// REPORTES DE FACTURAS/CUENTAS
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de detalle de facturas por cuenta
export function pdfMakeReporteCuentasDetalleFactura(urlSolicitud, registroFactura){
    return async () => {
        const registros = await obtenerDatos(urlSolicitud);

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "N°", style: "tablaEncabezado" },
                { text: "Fecha Trans.", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Cuenta Contable", style: "tablaEncabezado" },
                { text: "Monto Cobro/Pago", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let contador = 0;
        let totalMonto = 0;
        for (const value of registros) {
            contador++;
            totalMonto += Math.round(parseFloat(value.monto || 0) * FACTOR);
            bodyTabla.push([
                { text:  contador },
                { text: value.fecha_transaccion || "-" },
                { text: value.codigotransaccion || "-" },
                { text: value.nombre_cuenta || "-" },
                { text: formatoDecimal(value.monto), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 4, style: "tablaTextoTotal" },
            {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "*", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Cobros / Pagos", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            {
                columns: [
                    {
                        stack: [
                            {
                                text: [
                                    { text: "Fecha: ", bold: true },
                                    formatoFecha(registroFactura.fecha)
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "N° Transacción: ", bold: true },
                                    registroFactura.nro_transaccion || ""
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Cuenta: ", bold: true },
                                    registroFactura.nombre_cuenta || ""
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: `Monto ${simbolo}: `, bold: true },
                                    formatoDecimal(registroFactura.montofactura)
                                ],
                            },


                        ],
                        style: "columnaInicio"
                    }, {
                        stack: [
                            {
                                text: [
                                    { text: "N° Doc.: ", bold: true },
                                    registroFactura.nfactura || ""
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Estado: ", bold: true },
                                    registroFactura.estado_factura || ""
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Tipo: ", bold: true },
                                    registroFactura.tipo_factura || ""
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Origen: ", bold: true },
                                    registroFactura.factura_de || ""
                                ],
                            },
                        ],
                        style: "columnaFinal"
                    }
                ],
                marginBottom: 8
            },

            tablaContenido,
        ];

        return content;
    }
}
// Funcionalidad que genera el contenido para el reporte PDF de detalle de recibos por cuenta
export function pdfMakeReporteCuentasDetalleRecibo(urlSolicitud, registroRecibo){
    return async () => {
        const registros = await obtenerDatos(urlSolicitud);

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "N°", style: "tablaEncabezado" },
                { text: "Fecha Trans.", style: "tablaEncabezado" },
                { text: "N° Trans.", style: "tablaEncabezado" },
                { text: "Cuenta Contable", style: "tablaEncabezado" },
                { text: "Monto Cobro/Pago", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let contador = 0;
        let totalMonto = 0;
        for (const value of registros) {
            contador++;
            totalMonto += Math.round(parseFloat(value.monto || 0) * FACTOR);
            bodyTabla.push([
                { text:  contador },
                { text: value.fecha_transaccion || "-" },
                { text: value.codigotransaccion || "-" },
                { text: value.nombre_cuenta || "-" },
                { text: formatoDecimal(value.monto), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 4, style: "tablaTextoTotal" },
            {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"},
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "*", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Cobros / Pagos", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },

            {
                columns: [
                    {
                        stack: [
                            {
                                text: [
                                    { text: "Fecha: ", bold: true },
                                    formatoFecha(registroRecibo.fecha)
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "N° Transacción: ", bold: true },
                                    registroRecibo.nro_transaccion || ""
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Cuenta: ", bold: true },
                                    registroRecibo.nombre_cuenta || ""
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: `Monto ${simbolo}: `, bold: true },
                                    formatoDecimal(registroRecibo.monto)
                                ],
                            },

                        ],
                        style: "columnaInicio"
                    }, {
                        stack: [
                            {
                                text: [
                                    { text: "N° Doc.: ", bold: true },
                                    registroRecibo.nro_recibo || ""
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Estado: ", bold: true },
                                    registroRecibo.estado_recibo || ""
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Tipo: ", bold: true },
                                    registroRecibo.tipo_recibo || ""
                                ],
                            },
                        ],
                        style: "columnaFinal"
                    }
                ],
                marginBottom: 8
            },

            tablaContenido,
        ];

        return content;
    }
}