import { botonEnCarga } from "../../../funciones/Funciones.js";
import { modalDeInformacion } from "../../../funciones/Modals.js";
import { manejarReporteActivoPasivo } from "./ReporteActivoPasivo.js";
import { manejarReporteBalanceGeneral } from "./ReporteBalanceGeneral.js";
import { manejarReporteBalanceSumasSaldos } from "./ReporteBalanceSumasSaldos.js";
import { manejarReporteCuentaResultado } from "./ReporteCuentaResultado.js";
import { manejarReporteEstadoDeResultados } from "./ReporteEstadoResultados.js";

// export const ReporteDeGestion = async (formulario, contenedorReporte, datosUrl, contPDF, contInfo, vistaPrincipal) => {
export async function ReporteDeGestion(datosVista) {
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

        const fechaI = formulario.querySelector("#repgestion-fechaini");

        const datos = new FormData(formulario);
        const datosForm = Object.fromEntries(datos.entries());

        const tipoReporte = datosForm.reportede;
        const estadosfinancieros = datosForm.estadosfinancieros;
        const fechaini = datosForm.fechaini;
        const fechafin = datosForm.fechafin;

        if (datosGestion && datosGestion.nombre) {
            if (fechaI.offsetParent === null) {
                if (!(datosGestion.fechaini <= fechafin && fechafin <= datosGestion.fechafin)) {
                    const modal = modalDeInformacion("La fecha no corresponde a la Gestión Activa");
                    contenedorPrincipal.appendChild(modal);
                    fnBotonInicial();
                    return;
                }
            } else {
                if (!(datosGestion.fechaini <= fechaini && fechaini <= datosGestion.fechafin && datosGestion.fechaini <= fechafin && fechafin <= datosGestion.fechafin)) {
                    const modal = modalDeInformacion("Las fechas no corresponden a la Gestión Activa");
                    contenedorPrincipal.appendChild(modal);
                    fnBotonInicial();
                    return;
                }
            }
        }

        vistaReporte.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;

        if(tipoReporte && tipoReporte !==  "") {
            const tipo = datosForm.radio_p_h;
            if (tipoReporte == 1) {
                if (tipo == 1) {
                    const urlSolicitud = `${URL}reportebalancedesumasysaldos/${fechaini}/${fechafin}/${EMPRESA_ID}`;
                    await manejarReporteBalanceSumasSaldos({
                        urlSolicitud,
                        datosFormulario: datosForm,
                        vistaReporte,
                        contenedorPrincipal,
                        tipoReporte: "rango"
                    });
                } else if (tipo == 2) {
                    const urlSolicitud = `${URL}reportebalancedesumasysaldoshasta/${fechafin}/${EMPRESA_ID}`;
                    await manejarReporteBalanceSumasSaldos({
                        urlSolicitud,
                        datosFormulario: datosForm,
                        vistaReporte,
                        contenedorPrincipal,
                        tipoReporte: "hasta"
                    });
                }
            } else if (tipoReporte == 2) {
                if (tipo == 1) {
                    const urlSolicitud = `${URL}reporteactivoypasivo/${fechaini}/${fechafin}/${EMPRESA_ID}`;
                    await manejarReporteActivoPasivo({
                        urlSolicitud,
                        datosFormulario: datosForm,
                        vistaReporte,
                        contenedorPrincipal,
                        tipoReporte: "rango"
                    });
                } else if (tipo == 2) {
                    const urlSolicitud = `${URL}reporteactivoypasivohasta/${fechafin}/${EMPRESA_ID}`;
                    await manejarReporteActivoPasivo({
                        urlSolicitud,
                        datosFormulario: datosForm,
                        vistaReporte,
                        contenedorPrincipal,
                        tipoReporte: "hasta"
                    });
                }
            } else if (tipoReporte == 3) {
                const urlSolicitud = `${URL}reportecuentasderesultado/${fechaini}/${fechafin}/${EMPRESA_ID}`;
                await manejarReporteCuentaResultado({
                    urlSolicitud,
                    datosFormulario: datosForm,
                    vistaReporte,
                    contenedorPrincipal,
                });
            } else if (tipoReporte.includes("|")) {
                const selectizeRepComplementario = formulario.querySelector("#repgestion-reportescomplementarios").selectize;
                const valor = selectizeRepComplementario.getValue();
                const textoSelect = selectizeRepComplementario.options[valor]?.text;
                const tipoReporteCom = tipoReporte.split("|")
                const nivel = datosForm.nivel_ef || "5";
                if (tipoReporteCom[1] === "balance_general") {
                    const urlSolicitud = `${URL}reporte_balance_general_por_niveles/${tipoReporteCom[0]}/${fechaini}/${fechafin}/${EMPRESA_ID}/${nivel}`;
                    await manejarReporteBalanceGeneral({
                        urlSolicitud,
                        datosFormulario: datosForm,
                        vistaReporte,
                        contenedorPrincipal,
                        nombreReporte: textoSelect,
                        tipoReporte: "rango"
                    });
                } else if (tipoReporteCom[1] === "estado_resultado") {
                    // const urlSolicitud = `${URL}reporte_estado_resultados_actualizado/${tipoReporteCom[0]}/${fechaini}/${fechafin}/${EMPRESA_ID}`;
                    const urlSolicitud = `${URL}reporte_estado_resultados_actualizado_por_niveles/${tipoReporteCom[0]}/${fechaini}/${fechafin}/${EMPRESA_ID}/${nivel}`;
                    await manejarReporteEstadoDeResultados({
                        urlSolicitud,
                        datosFormulario: datosForm,
                        vistaReporte,
                        contenedorPrincipal,
                        nombreReporte: textoSelect,
                    });
                }
            } else {
                setTimeout(() => {
                    principal.innerHTML = `<div class="py-5 text-danger text-center fw-bold">No se encontro el tipo de reporte</div>`;
                }, 500);
                // vistaPrincipal.append(modalDeInformacion(`No se encontro el tipo de reporte`));
            }
        } else if (estadosfinancieros && estadosfinancieros !== "") {
            const sTipoEF = formulario.querySelector("#repgestion-estadosfinancieros").selectize;
            const valor = sTipoEF.getValue();
            const textoSelect = sTipoEF.options[valor]?.text;

            const nivel = datosForm.nivel_ef || "5";
            const tipoReporteEF = estadosfinancieros.split("|")
            if (tipoReporteEF[1] === "balance_general") {
                const tipo = datosForm.radio_p_h;
                if (tipo == 1) {
                    const urlSolicitud = `${URL}reporte_balance_general_por_niveles_consolidados/${tipoReporteEF[0]}/${fechaini}/${fechafin}/${EMPRESA_ID}/${nivel}`;
                    await manejarReporteBalanceGeneral({
                        urlSolicitud,
                        datosFormulario: datosForm,
                        vistaReporte,
                        contenedorPrincipal,
                        nombreReporte: textoSelect,
                        tipoReporte: "rango"
                    });
                } else if (tipo == 2) {
                    const urlSolicitud = `${URL}reporte_balance_general_hasta/${tipoReporteEF[0]}/${fechafin}/${EMPRESA_ID}`;
                    await manejarReporteBalanceGeneral({
                        urlSolicitud,
                        datosFormulario: datosForm,
                        vistaReporte,
                        contenedorPrincipal,
                        nombreReporte: textoSelect,
                        tipoReporte: "hasta"
                    });
                }
            } else if (tipoReporteEF[1] === "estado_resultado") {
                // const urlSolicitud = `${URL}reporte_estado_resultados_actualizado_consolidado/${tipoReporteEF[0]}/${fechaini}/${fechafin}/${EMPRESA_ID}`;
                const urlSolicitud = `${URL}reporte_estado_resultados_actualizado_consolidado_por_niveles/${tipoReporteEF[0]}/${fechaini}/${fechafin}/${EMPRESA_ID}/${nivel}`;
                await manejarReporteEstadoDeResultados({
                    urlSolicitud,
                    datosFormulario: datosForm,
                    vistaReporte,
                    contenedorPrincipal,
                    nombreReporte: textoSelect,
                });
            } else {
                setTimeout(() => {
                    principal.innerHTML = `<div class="py-5 text-danger text-center fw-bold">No se encontro el tipo de reporte</div>`;
                }, 500);
            }
        } else {
            contenedorPrincipal.append(modalDeInformacion(`Debe seleccionar "Reportes Complementarios" o "Estados Financieros"`));
        }
        fnBotonInicial();
    });
}