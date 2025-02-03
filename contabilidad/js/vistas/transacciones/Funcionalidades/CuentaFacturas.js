import { URL_APIC } from "../../../../../lib/services.js";
import { FilaDeRegistro } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, FormatoDate, ocultarElemento } from "../../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { formularioDetalleAsientoM, formularioDetalleTr, formularioFacturasTr } from "../Formularios.js";
import { CalculoDetalle, OpcionesRegistroDetalle, TrDebe, TrHaber } from "./Opciones.js";
import { VerFacturas } from "./VerFacturas.js";

/**
 * Crea el contenido de la vista Facturas
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaTranFactura - Elemento contenedor de la vista Transacción Factura.
 * @param {HTMLElement} datosVista.vistaDetalle - Elemento contenedor de la vista Detalle transacción.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const CuentaFacturas = (datosVista) => {
    const {
        vistaPrincipal,
        vistaTranFactura,
        vistaDetalle, 
        permisos
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Transacción.
     * @param {HTMLElement} referencias.elemento - Elemento que disparo el evento.
     */
    return ({registro, elemento}) => {
        const trPadre = elemento.closest("tr");
        
        const URL = `${URL_APIC}api/`;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal
        const URL_LT = `${URL}listadetalletransaccion/${registro.id}`;

        // Creación de elementos para el encabezado de la vista
        const spanTran = crearElemento("span", { class: "fw-bold" }, [`N° Transacción: `]);
        const divTran = crearElemento("div", undefined, [spanTran, registro.ntransaccion]);
        const spanFecha = crearElemento("span", { class: "fw-bold" }, [`Fecha: `]);
        const divFecha = crearElemento("div", undefined, [spanFecha, FormatoDate(registro.fecha)]);
        const spanTipo = crearElemento("span", { class: "fw-bold" }, [`Tipo: `]);
        const divTipo = crearElemento("div", undefined, [spanTipo, registro.ttransaccion]);
        const spanGlosa = crearElemento("span", { class: "fw-bold" }, [`Glosa: `]);
        const divGlosa = crearElemento("div", undefined, [spanGlosa, registro.glosa]);
        const divInformacion = crearElemento("div", { class: "pb-2" }, [divTran, divFecha, divTipo, divGlosa]);
        const regresar = () => { cambiarVista(vistaDetalle, vistaPrincipal) }
        const tituloVista = encabezadoVista("Volver", "Facturas", regresar, undefined, divInformacion)
        vistaDetalle.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaRegistrarFTr = crearElemento("div", { class: "mb-4 d-none" });
        const vistaPrincipalFTr = crearElemento("div", undefined, [vistaRegistrarFTr]);
        const vistaEditarFTr = crearElemento("div", {class: "d-none"});
        const vistaFacturas = crearElemento("div", {class: "d-none"});

        vistaDetalle.append(vistaPrincipalFTr, vistaEditarFTr, vistaFacturas);
        
        // Creación de elementos para la vista principal
        const alertasDT = crearElemento("div");
        vistaPrincipalFTr.appendChild(alertasDT);
        let botonNuevoR;
        if (permisos.escritura === "1") {
            const nuevoRegistro = () => cambiarVista(botonNuevoR, vistaRegistrarFTr);
            botonNuevoR = btnNuevoRegistro(nuevoRegistro);
            botonNuevoR.classList.add("mb-2");
            vistaPrincipalFTr.appendChild(botonNuevoR);
        }
        const encabezadoTabla = [
            "Cuenta contable",
            "Debe",
            "Haber",
            "Nota",
            "Opciones",
        ];
        const estiloTd = [
            "text-start",
            "decimal",
            "decimal",
            "text-start",
            "text-start",
        ];
        const contenidoTabla = [
            "plan",
            "debe",
            {
                nombre: "haber",
                agregarT: TotalH(trPadre),
            },
            "nota",
            {
                nombre: "Opciones",
                accion: {
                    accion: VerFacturas({ vistaFacturas: vistaDetalle, vistaListaFacturas: vistaTranFactura, permisos, estiloCF: estiloTd, URL_LT_CF: URL_LT }),
                    icono: "bi bi-stack",
                    classElemento: "btn btn-primary btn-sm",
                    titulo: "Ver Facturas",
                },
                usarBasicos: {
                    eliminar: eliminarRegistro({
                        vistaPrincipal: vistaDetalle,
                        contenedorDeAlertas: alertasDT,
                        URL: (id) => `${URL}url_para_eliminar/${id}`,
                    }, undefined, CalculoDetalle(vistaPrincipalFTr, trPadre)),
                }
            }
        ];
        if (permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalFTr.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(URL_LT, { contenedor: alertasDT, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
        // Creación de formulario para la vista Registrar
        const accionCancelar = () => { cambiarVista(vistaRegistrarFTr, botonNuevoR) };
        if (permisos.escritura === "1") {
            nuevoRegistro({
                vistaPrincipal: vistaPrincipalFTr,
                vistaRegistrar: vistaRegistrarFTr,
                contenedorDeAlertas: alertasDT,
                contenidoTabla,
                tBody,
                URL_FORM: `${URL}`,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioFacturasTr,
                estiloTd,
                mantenerFormulario: accionCancelar,
            }, undefined, {
                datosExtra: [
                    { key: "ver", value: "dato_ver_para_registrar" },
                    { key: "empresa", value: empresa_id },
                ]
            });
        }
    
        cambiarVista(vistaPrincipal, vistaDetalle)
    }   
}

export const TotalH = (trPadre) => ({elemento, registro, arrayT}) => {
    elemento.classList.add("text-nowrap");
    const montoHaber = Number(registro.haber).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const span = crearElemento("span", undefined, [montoHaber]);
    elemento.replaceChildren(span);

    // Crear la fila de totales
    const strDebe = parseFloat(registro.debe).toFixed(2);
    const strHaber = parseFloat(registro.haber).toFixed(2);
    const debe = parseFloat(strDebe);
    const haber = parseFloat(strHaber);
    if (arrayT.length > 0) {
        arrayT[1] += debe;
        arrayT[2] += haber;
    } else {
        // Función para crear la fila de totales
        const row = (totalDebe, totalHaber) => {
            const debe = totalDebe.toFixed(2);
            const haber = totalHaber.toFixed(2);
            let colorT = "table-secondary";
            let rowInfo;
            if (debe !== haber) {
                // Si no cuadra la transacción se crea la fila de información.
                colorT = "table-danger";
                const td = crearElemento("td", { class: "text-end text-danger" }, ["No cuadra"]);
                const tdDebe = crearElemento("td", { class: "text-end text-danger", id: "td_det_tran_info_debe" }, [(totalHaber - totalDebe).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})]);
                const tdHaber = crearElemento("td", { class: "text-end text-danger", id: "td_det_tran_info_haber" }, [(totalDebe - totalHaber).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})]);
                const tdr = crearElemento("td", { colspan: "2" });
                rowInfo = crearElemento("tr", { class: colorT, id: "tr_det_tran_info" }, [td, tdDebe, tdHaber, tdr]);
            } 
            // Crear la fila de totales
            const td = crearElemento("td", { class: "text-end fw-bold" }, ["TOTALES:"]);
            const tdDebe = crearElemento("td", { class: "text-end fw-bold", id: "td_det_tran_total_debe" }, [totalDebe.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})]);
            const tdHaber = crearElemento("td", { class: "text-end fw-bold", id: "td_det_tran_total_haber" }, [totalHaber.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})]);
            const tdr = crearElemento("td", { colspan: "2" });
            const rowTotal = crearElemento("tr", { class: colorT }, [td, tdDebe, tdHaber, tdr]);

            if (rowInfo) {
                trPadre.classList.add("table-danger");
                return [rowTotal, rowInfo];
            } else {
                trPadre.classList.remove("table-danger");
                return [rowTotal];
            }
            // return rowInfo ? [rowTotal, rowInfo] : [rowTotal];
        }
        arrayT.push(row, debe, haber);
    }
}