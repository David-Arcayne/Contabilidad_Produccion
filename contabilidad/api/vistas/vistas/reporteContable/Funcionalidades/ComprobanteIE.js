import { ajustarAlturaTabla } from "../../../funciones/CrearTabla.js";
import { getDivisaNombre } from "../../../funciones/DatosAuxiliares.js";
import { formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { NumerosALetras } from "../../../funciones/NumeroALetras.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { contenidoConEncabezadoPdfMake, crearContenedorReporte, defDocumentoPdfMake, EncabezadoPDF, opcionesDescargaDeReporte, seccionTablaPdfMake, verificarDatosReporte } from "../../../funciones/VistaPDF.js";

/**
 * Función: Prepara y maneja el reporte de comprobante de ingreso/egreso.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de comprobante de ingreso/egreso.
 *              Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *              También proporciona la opción para descargar el reporte en formato PDF.
 * Fecha: 28 de enero de 2026
 * Autor: Joel Choque
 */
export async function manejarReporteComprobanteDeEfectivo(datos) {
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

    const tipoIE = datosFormulario.cie_in_eg;

    // Crear el contenido del reporte
    const [contenedorReporte, cuerpoReporte, contenedorBotones, divReporte] = crearContenedorReporte();
    // Opciones de descarga del reporte
    const opcionesReporte = opcionesDescargaDeReporte({
        // contenedorModal: contenedorPrincipal,
        // cuerpoReporte,
        // nombreArchivo: `comprobante_i_e`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteComprobanteDeEfectivoPdfMake({ datosReporte, tipoIE });
            await defDocumentoPdfMake({ contenido: docDefinition, numeroPieDePagina });
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteComprobanteDeEfectivo({ datosReporte, datosFormulario, tipoIE });
    cuerpoReporte.innerHTML = reporte;

    ajustarAlturaTabla(divReporte);
}

// Genera el contenido HTML del reporte de comprobante de ingreso/egreso
async function reporteComprobanteDeEfectivo({ datosReporte, datosFormulario, tipoIE }) {

    const htmlEncabezado= EncabezadoPDF();

    let htmlContenido = "";
    for (const comprobante of datosReporte) {
        let divResponsables = "";
        if (comprobante.responsables && comprobante.responsables.length > 0) {
            for (const responsable of comprobante.responsables) {
                divResponsables += `<div>${responsable.nombre ?? "-"} ${responsable.apellido ?? "-"}</div>${responsable.ci ? "<div><span class=''>CI: </span>" + responsable.ci + "</div>" : ""}`;
            }
        }

        let contenidoTBody = "";

        if (comprobante.detalle?.length > 0) {
            for (const item of comprobante.detalle) {
                contenidoTBody += `
                <tr>
                    <td>${item.codigo ?? "-"}</td>
                    <td>${item.nombre ?? "-"}</td>
                    <td>${item.codigo && item.nombre && tipoIE === "1" ? formatoDecimal(item.monto ?? 0) : "-"}</td>
                    <td>${item.codigo && item.nombre && tipoIE === "2" ? formatoDecimal(item.monto ?? 0) : "-"}</td>
                    <td>${divResponsables}</td>
                    <td></td>
                </tr>`;
            }
        } else {
            contenidoTBody += `
                <tr>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>`;
        }

        htmlContenido += `
            ${htmlEncabezado}
            <section class="reportaf">
                <div class="afr-filters-t">
                    <div><h4>Comprobante de ${tipoIE === "1" ? "Ingreso" : "Egreso"}</h4></div>
                    <span>(Expresado en ${getDivisaNombre()})</span>
                </div>

                <div class="">
                    <div class="afr-info">
                        <div class="afr-info-right afr-end">
                            <div><span>N°:</span> ${comprobante.nrecibo ?? ""}</div>
                        </div>
                    </div>
                    <div class="afr-info">
                        <div class="afr-info-left">
                            <div><span>Lugar y Fecha: </span>${comprobante.lugar ? comprobante.lugar + ", " : ""} ${formatoFecha(comprobante.fecha_recibo ?? "")}</div>
                        </div>
                    </div>
                    <div class="afr-info">
                        <div class="afr-info-right afr-end">
                            <div><span>Monto Bs./$us:</span></div>
                        </div>
                    </div>
                    <div class="afr-info">
                        <div class="afr-info-right afr-end">
                            <div>${formatoDecimal(comprobante.monto_recibo ?? "")}</div>
                        </div>
                    </div>
                    <div class="afr-info">
                        <div class="afr-info-left">
                            <div><span>Recibí de: </span>${comprobante.nombre_cliente ?? ""} (${comprobante.persona ?? ""})</div>
                        </div>
                        <div class="afr-info-right">
                            <div><span>NIT:</span> ${comprobante.nit ?? ""}</div>
                        </div>
                    </div>
                    <div class="afr-info">
                        <div><span>Dirección: </span> ${comprobante.direccion ?? ""}</div>
                        <div><span>La suma de: </span> ${NumerosALetras(comprobante.monto_recibo ?? "")} </div>
                        <div><span>Por concepto de: </span> Cobro de factura N° ${comprobante.nfactura ?? ""} con fecha ${formatoFecha(comprobante.fecha_factura ?? "")}</div>
                    </div>
                    <!-- <div class="afr-info">
                        <div class="afr-info-left" style="width: 25%;">
                            <span>Cheque N°: </span> ${""}
                        </div>
                        <div class="afr-info-left" style="width: 25%;">
                            <span>Banco: </span> ${""}
                        </div>
                        <div class="afr-info-left" style="width: 25%;">
                            <span>Sucursal: </span> ${""}
                        </div>
                        <div class="afr-info-left" style="width: 25%;">
                            <span>Efectivo: </span> ${""}
                        </div>
                    </div> -->

                    <br/>

                    <table class="afr-table" >
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Cuenta</th>
                                <th>Débito</th>
                                <th>Crédito</th>
                                <th>Responsables</th>
                                <th>Firmas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${contenidoTBody}
                        </tbody>
                    </table>
                </div>
            </section>
            <div class="html2pdf__page-break"></div>`;
    }

    return htmlContenido;
}

// Genera el contenido para PDFMake del reporte de comprobante de efectivo para descarga en PDF
async function reporteComprobanteDeEfectivoPdfMake({ datosReporte, tipoIE }) {

    const divisaEnUso = getDivisaNombre();

    const content = [];

    for (let i = 0; i < datosReporte.length; i++) {
        const comprobante = datosReporte[i];

        const bodyTabla = [
            [
                { text: "Código", style: "tablaEncabezado" },
                { text: "Cuenta", style: "tablaEncabezado" },
                { text: "Débito", style: "tablaEncabezado", alignment: "right" },
                { text: "Crédito", style: "tablaEncabezado", alignment: "right" },
                { text: "Responsables", style: "tablaEncabezado" },
                { text: "Firmas", style: "tablaEncabezado" }
            ]
        ];

        let detalle = comprobante.detalle || [];
        if (detalle.length === 0) {
            bodyTabla.push([
                { text: "-" }, { text: "-" }, { text: "-" }, { text: "-" }, { text: "-" }, { text: "" }
            ]);
        } else {
            for (const item of detalle) {
                // Responsables formatting
                let responsablesStack = [];
                if (comprobante.responsables && comprobante.responsables.length > 0) {
                    for (const r of comprobante.responsables) {
                        responsablesStack.push({ text: `${r.nombre ?? "-"} ${r.apellido ?? "-"}`, fontSize: 8 });
                        if (r.ci) responsablesStack.push({ text: `CI: ${r.ci}`, fontSize: 8, italics: true });
                    }
                }

                bodyTabla.push([
                    { text: item.codigo ?? "-" },
                    { text: item.nombre ?? "-" },
                    { text: (item.codigo && item.nombre && tipoIE === "1") ? formatoDecimal(item.monto ?? 0) : "-", alignment: "right" },
                    { text: (item.codigo && item.nombre && tipoIE === "2") ? formatoDecimal(item.monto ?? 0) : "-", alignment: "right" },
                    { stack: responsablesStack },
                    { text: "" }
                ]);
            }
        }

        content.push(...contenidoConEncabezadoPdfMake());
        content.push(
            { text: `Comprobante de ${tipoIE === "1" ? "Ingreso" : "Egreso"}`, style: "textoTitulo" },
            { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion", margin: [0, 0, 0, 10] }
        );

        content.push({
            stack: [
                // {
                //     columns: [
                //         { width: '*', text: '' },
                //         { width: 'auto', text: [{ text: 'N°: ', bold: true }, comprobante.nrecibo ?? ""] }
                //     ]
                // },
                {
                    text: [{ text: 'N°: ', bold: true }, comprobante.nrecibo ?? ""],
                    alignment: "right"
                },
                {
                    text: [{ text: 'Lugar y Fecha: ', bold: true }, `${comprobante.lugar ? comprobante.lugar + ", " : ""} ${formatoFecha(comprobante.fecha_recibo ?? "")}`],
                    style: "espaciadoTextoVertical"
                },
                {
                    text: [{ text: 'Monto Bs./$us:', bold: true }],
                    alignment: "right"
                },
                {
                    text: formatoDecimal(comprobante.monto_recibo),
                    alignment: "right"
                },
                {
                    columns: [
                        { text: [{ text: 'Recibí de: ', bold: true }, `${comprobante.nombre_cliente ?? ""} (${comprobante.persona ?? ""})`] },
                        { text: [{ text: 'NIT: ', bold: true }, comprobante.nit ?? ""] }
                    ],
                    style: "espaciadoTextoVertical"
                },
                {
                    text: [{ text: 'Dirección: ', bold: true }, comprobante.direccion ?? ""],
                    style: "espaciadoTextoVertical"
                },
                {
                    text: [{ text: 'La suma de: ', bold: true }, NumerosALetras(comprobante.monto_recibo ?? "")],
                    style: "espaciadoTextoVertical"
                },
                {
                    text: [{ text: 'Por concepto de: ', bold: true }, `Cobro de factura N° ${comprobante.nfactura ?? ""} con fecha ${formatoFecha(comprobante.fecha_factura ?? "")}`],
                }
            ],
            marginBottom: 8
        });

        content.push(
            seccionTablaPdfMake({
                widths: ["auto", "*", "auto", "auto", "*", 100],
                body: bodyTabla
            })
        );

        // SALTO DE PÁGINA
        if (i < datosReporte.length - 1) {
            content.push({ text: "", pageBreak: "after" });
        }
    }

    return content;
};