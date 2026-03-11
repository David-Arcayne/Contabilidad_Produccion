import { botonEnCarga, formatoFecha } from "../../../funciones/Funciones.js";
import { modalDeInformacion } from "../../../funciones/Modals.js";
import { manejarReporteBusquedaDocumentos } from "./BusquedaDocumentos.js";
import { manejarReporteBusquedaFactura } from "./BusquedaFacturas.js";
import { ComprobanteActivoDisponible } from "./ComprobanteActivoDisponible.js";
import { manejarComprobanteContable } from "./ComprobanteContable.js";
import { manejarReporteComprobanteDeEfectivo } from "./ComprobanteIE.js";
import { manejarReporteActivoDisponible } from "./ReporteActivoDisponible.js";
import { manejarReporteDetalleFactTrans } from "./ReporteDetalleFacturaTr.js";
import { manejarReporteDetalleTransaccion } from "./ReporteDetalleTransaccion.js";
import { manejarReporteLibroMayorPorRango } from "./ReporteLibroMayorCC.js";

// export const ReportePeriodico = async (formulario, contenedorReporte, datosUrl, contPDF, contInfo, vistaPrincipal) => {
export async function ReportePeriodico(datosVista) {
    const {
        formulario,
        vistaReporte,
        contenedorPrincipal,
        URL,
        EMPRESA_ID,
        datosGestion,
    } = datosVista;

    vistaReporte.innerHTML = `<p class="text-center fs-5 mt-4">Contenido.</p>`;

    // const datoGA = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const boton = formulario.querySelector("#btn-enviar-formulario");
        const fnBotonInicial = botonEnCarga(boton);

        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());

        const porTipoAsiento = datos.getAll("por_tipoasiento[]").length > 0 ? datos.getAll("por_tipoasiento[]") : 0;
        const porMes = datosForm.por_mes || 0;

        const fechaini = porMes ? null : datosForm.fecha_desde;
        const fechafin = porMes ? null : datosForm.fecha_hasta;
        const tipoReporte = datosForm.reportede;

        let consolidados = "no";
        if (datosForm.consolidados_global) {
            consolidados = "si";
        }

        if (datosGestion && datosGestion.nombre) {
            if (fechaini && !(datosGestion.fechaini <= fechaini && fechaini <= datosGestion.fechafin && datosGestion.fechaini <= fechafin && fechafin <= datosGestion.fechafin)) {
                const modal = modalDeInformacion("Las fechas no corresponden a la Gestión Activa");
                contenedorPrincipal.appendChild(modal);
                fnBotonInicial();
                return;
            }
        }

        if(tipoReporte) {

            vistaReporte.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;

            if (tipoReporte == 1) {
                const urlSolicitud = `${URL}reporteactivodisponible/${fechaini}/${fechafin}/${tipoReporte}/${EMPRESA_ID}/${consolidados}`;

                await manejarReporteActivoDisponible({
                    urlSolicitud,
                    datosFormulario: datosForm,
                    vistaReporte,
                    contenedorPrincipal,
                });
            } else if (tipoReporte == 2) {
                const urlSolicitud = `${URL}reportedetalletransaccion/${fechaini}/${fechafin}/${porMes}/${porTipoAsiento}/${EMPRESA_ID}/${consolidados}`;
                await manejarReporteDetalleTransaccion({
                    urlSolicitud,
                    datosFormulario: datosForm,
                    vistaReporte,
                    contenedorPrincipal,
                });
            } else if (tipoReporte == 3) {
                const tipoFactura = datosForm.rd_detfactrans_tipofactura;
                let urlSolicitud = `${URL}reportedetallefpt/${fechaini}/${fechafin}/${porMes}/${porTipoAsiento}/${tipoFactura}/${EMPRESA_ID}/${consolidados}`;
                await manejarReporteDetalleFactTrans({
                    urlSolicitud,
                    datosFormulario: datosForm,
                    vistaReporte,
                    contenedorPrincipal,
                });
            }
        } else {
            vistaReporte.innerHTML = `<h3 class="text-emphasis-info">Debe seleccionar un tipo de reporte</h3>`;
        }
        fnBotonInicial();
    });
}

// export const ReporteComprobante = async (formulario, contenedorReporte, datosUrl, contPDF, contInfo, vistaPrincipal) => {
export async function ReporteComprobante(datosVista) {
    const {
        formulario,
        vistaReporte,
        contenedorPrincipal,
        URL,
        EMPRESA_ID,
        datosGestion,
    } = datosVista;

    vistaReporte.innerHTML = `<p class="text-center fs-5 mt-4">Contenido.</p>`;

    // const datosGestion = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const boton = formulario.querySelector("#btn-enviar-formulario");
        const fnBotonInicial = botonEnCarga(boton);

        const fechaI = formulario.querySelector("#repcontablecomprobante-fechainib");

        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());

        const porTipoAsiento = datos.getAll("por_tipoasiento[]").length > 0 ? datos.getAll("por_tipoasiento[]") : 0;
        const porMes = datosForm.por_mes || 0;

        const tipoReporte = datosForm.reportede;
        const fechaini = porMes ? null : datosForm.fechainib ?? null ;
        const fechafin =  porMes ? null : datosForm.fechafinb ?? null;
        const numini = fechaini ? 0 :  datosForm.numini ?? 0;
        const numfin = fechaini ? 0 : datosForm.numfin ?? 0;

        let consolidados = "no";
        if (datosForm.consolidados_global) {
            consolidados = "si";
        }

        if (datosGestion && datosGestion.nombre && fechaI.offsetParent !== null && !porMes) {
            if (!(datosGestion.fechaini <= fechaini && fechaini <= datosGestion.fechafin && datosGestion.fechaini <= fechafin && fechafin <= datosGestion.fechafin)) {
                const modal = modalDeInformacion("Las fechas no corresponden a la Gestión Activa");
                contenedorPrincipal.appendChild(modal);
                fnBotonInicial();
                return;
            }
        }

        vistaReporte.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;

        if (tipoReporte == 1) {
            // 1 --> no tiene ni factura ni recibos
            // 2 --> no tiene factura pero si recibos
            // 3 --> si tiene factura pero no tiene recibos
            // 4 --> tiene factura y tiene recibos
            let urlSolicitud = `${URL}reportecomprobantecontable/${numini}/${numfin}/${fechaini}/${fechafin}/${porMes}/${porTipoAsiento}/${EMPRESA_ID}/1/${consolidados}`;
            if (datosForm.cc_con_facturas == "1" && datosForm.cc_con_recibos == "1") {
                urlSolicitud = `${URL}reportecomprobantecontable/${numini}/${numfin}/${fechaini}/${fechafin}/${porMes}/${porTipoAsiento}/${EMPRESA_ID}/4/${consolidados}`;
            } else if (datosForm.cc_con_recibos == "1") {
                urlSolicitud = `${URL}reportecomprobantecontable/${numini}/${numfin}/${fechaini}/${fechafin}/${porMes}/${porTipoAsiento}/${EMPRESA_ID}/2/${consolidados}`;
            } else if (datosForm.cc_con_facturas == "1") {
                urlSolicitud = `${URL}reportecomprobantecontable/${numini}/${numfin}/${fechaini}/${fechafin}/${porMes}/${porTipoAsiento}/${EMPRESA_ID}/3/${consolidados}`;
            }
            await manejarComprobanteContable({
                urlSolicitud,
                datosFormulario: datosForm,
                vistaReporte,
                contenedorPrincipal,
            });
        } else if (tipoReporte == 2) {
            const urlSolicitud = `${URL}reporte_comprobante_ingreso_egreso/${fechaini}/${fechafin}/${numini}/${numfin}/${datosForm.cie_in_eg}/${EMPRESA_ID}`;
            await manejarReporteComprobanteDeEfectivo({
                urlSolicitud,
                datosFormulario: datosForm,
                vistaReporte,
                contenedorPrincipal,
            });
        } else if (tipoReporte == 3) {
            // contenedorReporte.setAttribute("data-namepdf", "comprobante_activo_disponible");
            const urlSolicitud = `${URL}reporteactivodiaponibledos/${numini}/${numfin}/${fechaini}/${fechafin}/${EMPRESA_ID}`;
            await ComprobanteActivoDisponible(datosForm, urlSolicitud);
        } else {
            setTimeout(() => {
                vistaReporte.innerHTML = `<div class="py-5 text-danger text-center fw-bold">No se encontro el tipo de reporte</div>`;
            }, 500);
        }
        fnBotonInicial();
    });
}

// export const ReporteLibroMayor = async (formulario, contenedorReporte, datosUrl, contPDF, contInfo, vistaPrincipal) => {
export async function ReporteLibroMayor(datosVista) {
    const {
        formulario,
        vistaReporte,
        contenedorPrincipal,
        URL,
        EMPRESA_ID,
        datosGestion,
    } = datosVista;

    vistaReporte.innerHTML = `<p class="text-center fs-5 mt-4">Contenido.</p>`;
    // const datosGestion = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const boton = formulario.querySelector("#btn-enviar-formulario");
        const fnBotonInicial = botonEnCarga(boton);

        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());

        const checkRangos = datosForm.por_rangos || null;

        const fechaini = datosForm.fecha_desde;
        const fechafin = datosForm.fecha_hasta;
        const planCuenta = datosForm.cuenta;
        const planCuentaFinal = datosForm.cuenta_final;

        let consolidados = "no";
        if (datosForm.consolidados_global) {
            consolidados = "si";
        }

        if (datosGestion && datosGestion.nombre) {
            if (!(datosGestion.fechaini <= fechaini && fechaini <= datosGestion.fechafin && datosGestion.fechaini <= fechafin && fechafin <= datosGestion.fechafin)) {
                const modal = modalDeInformacion("Las fechas no corresponden a la Gestión Activa");
                contenedorPrincipal.appendChild(modal);
                fnBotonInicial();
                return;
            }
        }

        vistaReporte.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;

        if (checkRangos) {
            vistaReporte.setAttribute("data-namepdf", "reporte_mayor");
            const urlSolicitud = `${URL}mayorcuentacontable/${fechaini}/${fechafin}/${planCuenta}/${planCuentaFinal}/${EMPRESA_ID}/${consolidados}`;
            await manejarReporteLibroMayorPorRango({
                urlSolicitud,
                datosFormulario: datosForm,
                vistaReporte,
                contenedorPrincipal,
            });
        } else if (planCuenta !== "") {
            vistaReporte.setAttribute("data-namepdf", "reporte_mayor");
            const urlSolicitud = `${URL}mayorcuentacontable/${fechaini}/${fechafin}/${planCuenta}/${planCuenta}/${EMPRESA_ID}/${consolidados}`;
            await manejarReporteLibroMayorPorRango({
                urlSolicitud,
                datosFormulario: datosForm,
                vistaReporte,
                contenedorPrincipal,
            });
        } else {
            contenedorPrincipal.append(modalDeInformacion(`Debe seleccionar "Reporte de" o "Cuenta para Libro Mayor"`));
        }

        fnBotonInicial();
    });
}

// export const ReporteBusqueda = (formulario, contenedorReporte, datosUrl, contPDF, contInfo, vistaPrincipal) => {
export async function ReporteBusqueda(datosVista) {
    const {
        formulario,
        vistaReporte,
        contenedorPrincipal,
        URL,
        EMPRESA_ID,
        datosGestion,
    } = datosVista;

    vistaReporte.innerHTML = `<p class="text-center fs-5 mt-4">Contenido.</p>`;

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const boton = formulario.querySelector("#btn-enviar-formulario");
        const fnBotonInicial = botonEnCarga(boton);

        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());

        const tipoReporte = datosForm.tipo_reporte;
        const tipo = datosForm.tipo || -1;
        const numero = datosForm.numero || -1;
        const nit = datosForm.nit || -1;
        const cliente = datosForm.cliente || -1;
        const proveedor = datosForm.proveedor || -1;
        const fecha = datosForm.fecha || -1;
        const monto = datosForm.monto || -1;
        const cliente_proveedor = cliente !== -1 ? cliente : proveedor;
        const gestion = datosForm.gestion || -1;

        const { filtroHtml, filtroPdfMake } = obtenerCadenaFiltrosBusqueda(datosForm, formulario);

        vistaReporte.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;

        if(tipoReporte !==  "") {
            if (tipoReporte == 1) {
                const urlSolicitud = `${URL}busqueda_facturas_contabilidad/${numero}/${nit}/${tipo}/${cliente_proveedor}/${fecha}/${monto}/${gestion}/${EMPRESA_ID}`;
                await manejarReporteBusquedaFactura({
                    urlSolicitud,
                    datosFormulario: datosForm,
                    vistaReporte,
                    contenedorPrincipal,
                    filtrosAplicados: {
                        filtroHtml,
                        filtroPdfMake
                    }
                });
            } else if (tipoReporte == 2) {
                vistaReporte.innerHTML = `<div class="py-5 text-danger text-center fw-bold">No disponible</div>`;
            } else if (tipoReporte == 3) {
                const urlSolicitud = `${URL}busqueda_documentos_contabilidad/${numero}/${nit}/${tipo}/${cliente_proveedor}/${fecha}/${monto}/${gestion}/${EMPRESA_ID}`;
                await manejarReporteBusquedaDocumentos({
                    urlSolicitud,
                    datosFormulario: datosForm,
                    vistaReporte,
                    contenedorPrincipal,
                    filtrosAplicados: {
                        filtroHtml,
                        filtroPdfMake
                    }
                });
            }
        } else {
            contenedorPrincipal.append(modalDeInformacion(`Debe seleccionar un tipo de reporte`));
        }
        fnBotonInicial();
    });
}

/**
 * Función: Obtiene la cadena de filtros aplicados en la búsqueda para mostrar en el reporte.
 * Descripción: Toma los datos del formulario y el formulario mismo para construir una cadena que representa los filtros aplicados en la búsqueda.
 *              La cadena se devuelve tanto en formato HTML como en formato adecuado para PDFMake.
 * Fecha: 05 de febrero de 2026
 * Autor: Joel Choque
 */
function obtenerCadenaFiltrosBusqueda(datosForm, formulario) {
    const arrPdfMake = [];
    const arrHtml = [];
    if (datosForm.tipo_reporte) {
        arrHtml.push(`<span class="afr-fwb">Tipo reporte: </span> ${datosForm.tipo_reporte === "1" ? "Facturas" : datosForm.tipo_reporte === "2" ? "Comercial" : "Documentos"}`);
        arrPdfMake.push(
            "Tipo reporte: ",
            {
                text: `${datosForm.tipo_reporte === "1" ? "Facturas" : datosForm.tipo_reporte === "2" ? "Comercial" : "Documentos"}`,
                style: "colorTextoPrincipal",
            }
        );
    }
    if (datosForm.gestion) {
        const sGestion = formulario.querySelector("#repcontablebusqueda-gestion").selectize;
        const valor = sGestion.getValue();
        const texto = sGestion.options[valor]?.text;
        arrHtml.push(`<span class="afr-fwb">Gestión: </span> ${texto}`);
        arrPdfMake.push(
            ", Gestión: ",
            { text: texto, style: "colorTextoPrincipal" }
        );
    }
    if (datosForm.numero) {
        arrHtml.push(`<span class="afr-fwb">N° Doc.: </span> ${datosForm.numero}`);
        arrPdfMake.push(
            ", N° Doc.: ",
            { text: datosForm.numero, style: "colorTextoPrincipal" }
        );
    }
    if (datosForm.nit) {
        arrHtml.push(`<span class="afr-fwb">NIT: </span> ${datosForm.nit}`);
        arrPdfMake.push(
            ", NIT: ",
            { text: datosForm.nit, style: "colorTextoPrincipal" }
        );
    }
    if (datosForm.tipo) {
        arrHtml.push(`<span class="afr-fwb">Tipo: </span> ${datosForm.tipo === "1" ? "Venta" : "Compra"}`);
        arrPdfMake.push(
            ", Tipo: ",
            {
                text: `${datosForm.tipo === "1" ? "Venta" : "Compra"}`,
                style: "colorTextoPrincipal",
            }
        );
    }
    if (datosForm.cliente) {
        const sCliente = formulario.querySelector("#repcontablebusqueda-cliente").selectize;
        const valor = sCliente.getValue();
        const texto = sCliente.options[valor]?.text;
        arrHtml.push(`<span class="afr-fwb">Cliente: </span> ${texto}`);
        arrPdfMake.push(
            ", Cliente: ",
            { text: texto, style: "colorTextoPrincipal" },
        );
    }
    if (datosForm.proveedor) {
        const sProveedor = formulario.querySelector("#repcontablebusqueda-proveedor").selectize;
        const valor = sProveedor.getValue();
        const texto = sProveedor.options[valor]?.text;
        arrHtml.push(`<span class="afr-fwb">Proveedor: </span> ${texto}`);
        arrPdfMake.push(
            ", Proveedor: ",
            { text: texto, style: "colorTextoPrincipal" }
        );
    }
    if (datosForm.fecha) {
        arrHtml.push(`<span class="afr-fwb">Fecha: </span> ${formatoFecha(datosForm.fecha)}`);
        arrPdfMake.push(
            ", Fecha: ",
            { text: formatoFecha(datosForm.fecha), style: "colorTextoPrincipal" }
        );
    }
    if (datosForm.monto) {
        arrHtml.push(`<span class="afr-fwb">Monto: </span> ${datosForm.monto}`);
        arrPdfMake.push(
            ", Monto: ",
            { text: datosForm.monto, style: "colorTextoPrincipal" }
        );
    }

    return arrPdfMake.length > 0
        ? { filtroHtml: arrHtml.join(", "), filtroPdfMake: arrPdfMake  }
        : { filtroHtml: "No se aplicaron filtros",  filtroPdfMake: [{ text: "No se aplicaron filtros" }] };
}