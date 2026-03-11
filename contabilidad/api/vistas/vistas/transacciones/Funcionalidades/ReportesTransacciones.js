import { getDivisaNombre, getDivisaSimbolo } from "../../../funciones/DatosAuxiliares.js";
import { formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { firmasContabilidadPdfMake, seccionTablaPdfMake } from "../../../funciones/VistaPDF.js";
import { obtenerEstadoTransaccion } from "../../reporteContable/Funcionalidades/Funciones.js";
import { obtenerTipoVentaComercial } from "../../tributario/facturasComercial.js";

// =========================================================
// PENDIENTES DE REGISTRO
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF de facturas de cobro
export function pdfMakeFacturasDeCobroSinTrans(obtenerDatos){
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
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "NIT", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.montofactura || 0) * FACTOR);
            bodyTabla.push([
                { text: formatoFecha(value.fecha) || "-" },
                { text: value.nfactura || "-" },
                { text: value.procli || "-" },
                { text: value.nit || "-" },
                { text: value.por_concepto_de || "-" },
                { text: formatoDecimal(value.montofactura), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "auto", "*", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Facturas de Cobro", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de facturas de pago
export function pdfMakeFacturasDePagoSinTrans(obtenerDatos){
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
                { text: "Proveedor", style: "tablaEncabezado" },
                { text: "NIT", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.montofactura || 0) * FACTOR);
            bodyTabla.push([
                { text: formatoFecha(value.fecha) || "-" },
                { text: value.nfactura || "-" },
                { text: value.procli || "-" },
                { text: value.nit || "-" },
                { text: value.por_concepto_de || "-" },
                { text: formatoDecimal(value.montofactura), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "auto", "*", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Facturas de Pago", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de Recibos de Cobro
export function pdfMakeRecibosDeCobroSinTrans(obtenerDatos){
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Lugar", style: "tablaEncabezado" },
                { text: "Cliente", style: "tablaEncabezado" },
                { text: "N° Recibo", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.monto || 0) * FACTOR);
            bodyTabla.push([
                { text: formatoFecha(value.fecha) || "-" },
                { text: value.lugar || "-" },
                { text: value.nombre_cliente || "-" },
                { text: value.nro_recibo || "-" },
                { text: value.concepto || "-" },
                { text: formatoDecimal(value.monto), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "auto", "*", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Recibos de Cobro", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de Recibos de Pago
export function pdfMakeRecibosDePagoSinTrans(obtenerDatos){
    return () => {
        const registros = obtenerDatos();

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Fecha", style: "tablaEncabezado" },
                { text: "Lugar", style: "tablaEncabezado" },
                { text: "Proveedor", style: "tablaEncabezado" },
                { text: "N° Recibo", style: "tablaEncabezado" },
                { text: "Concepto", style: "tablaEncabezado" },
                { text: "Monto", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalMonto = 0;
        for (const value of registros) {
            totalMonto += Math.round(parseFloat(value.monto || 0) * FACTOR);
            bodyTabla.push([
                { text: formatoFecha(value.fecha) || "-" },
                { text: value.lugar || "-" },
                { text: value.nombre_proveedor || "-" },
                { text: value.nro_recibo || "-" },
                { text: value.concepto || "-" },
                { text: formatoDecimal(value.monto), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 5, style: "tablaTextoTotal" },
            {}, {}, {}, {},
            { text: `${formatoDecimal(totalMonto / FACTOR)}`, style: "tablaMontoTotal"}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "auto", "*", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Recibos de Pago", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}

// Funcionalidad que genera el contenido para el reporte PDF de Facturas de venta de Comercial.
export function pdfMakeComercialFacturaVentaSinTrans(obtenerDatos){
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
                { text: "N° Factura", style: "tablaEncabezado"},
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
                { text: formatoDecimal(value.montototal), alignment: "right" },
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
            { text: "Comercial - Facturas de Venta", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}


// =========================================================
// TRANSACCIONES
// =========================================================

// Funcionalidad que genera el contenido para el reporte PDF del detalle de una transacción
export function pdfMakeDetalleTransaccion(urlSolicitud, registroTransaccion){
    return async () => {

        const registros = await obtenerDatos(urlSolicitud);
        if (!registros) throw new Error("Error al obtener los datos");
        // if (registros.length === 0) return [];

        const firmas = await firmasContabilidadPdfMake(1);

        const divisaEnUso = getDivisaNombre();
        const simbolo = getDivisaSimbolo();

        const bodyTabla = [
            [
                { text: "Código", style: "tablaEncabezado" },
                { text: "Cuenta", style: "tablaEncabezado" },
                { text: "Nota", style: "tablaEncabezado" },
                { text: "Debe", style: "tablaEncabezado", alignment: "right" },
                { text: "Haber", style: "tablaEncabezado", alignment: "right" },
            ]
        ];

        const FACTOR = 100;
        let totalDebe = 0;
        let totalHaber = 0;
        for (const value of registros) {
            totalDebe += Math.round(parseFloat(value.debe || 0) * FACTOR);
            totalHaber += Math.round(parseFloat(value.haber || 0) * FACTOR);

            let cuenta = [{ text: value.plan }];
            value.cuenta_padre ? cuenta.unshift({ text: value.cuenta_padre, bold: true }) : null;
            bodyTabla.push([
                { text: value.numero || "-" },
                {
                    stack: cuenta
                },
                { text: value.nota || "-" },
                { text: formatoDecimal(value.debe), alignment: "right" },
                { text: formatoDecimal(value.haber), alignment: "right" },
            ]);
        };
        bodyTabla.push([
            { text: `Total ${simbolo}:`, colSpan: 3, style: "tablaTextoTotal" },
            {}, {},
            { text: `${formatoDecimal(totalDebe / FACTOR)}`, style: "tablaMontoTotal"},
            { text: `${formatoDecimal(totalHaber / FACTOR)}`, style: "tablaMontoTotal"}
        ]);

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "*", "*", "auto", "auto"],
            body: bodyTabla,
        });

        const content = [
            { text: "Comprobante Contable", style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            {
                columns: [
                    {
                        stack: [
                            {
                                text: [
                                    { text: "N° Transacción: ", bold: true },
                                    { text: registroTransaccion.ntransaccion || "-"}
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Fecha: ", bold: true },
                                    { text: formatoFecha(registroTransaccion.fecha)  || "-"  }
                                ],
                                style: "espaciadoTextoVertical"
                            },
                            {
                                text: [
                                    { text: "Tipo de Transacción: ", bold: true },
                                    { text: registroTransaccion.ttransaccion || "-"  }
                                ],
                            }
                        ],
                        style: "columnaInicio"
                    }, {
                        stack: [
                            {
                                text: [
                                    { text: "Estado: ", bold: true }, obtenerEstadoTransaccion(registroTransaccion.estado, totalDebe, totalHaber)
                                ],
                            }
                        ],
                        style: "columnaFinal"
                    }
                ],
                marginBottom: 8
            },
            tablaContenido,
            {
                text: [
                    { text: "Glosa: ", bold: true }, registroTransaccion.glosa
                ],
                marginTop: 8
            }
        ];

        if (firmas) {
            content.push(firmas());
        }

        return content;
    }
}