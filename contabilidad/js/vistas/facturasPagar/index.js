import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { NuevaFactura } from "./Funcionalidades/NuevaFactura.js";
import { NuevoRecibo } from "./Funcionalidades/NuevoRecibo.js";
import { Pagados } from "./Funcionalidades/Pagados.js";
import { PagarFactura } from "./Funcionalidades/PagarFactura.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function FacturasPagar(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal;
    const URL_LT = `${URL}listapagarfactura/${sucursal_id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaPagados = crearElemento("div", { class: "d-none" });
    const vistaDetalleP = crearElemento("div", { class: "d-none" });
    const vistaPagar = crearElemento("div", { class: "d-none" });
    const vistaNuevaFactura = crearElemento("div", { class: "d-none", "data-info": "Nueva Factura" });
    const vistaNuevoRecibo = crearElemento("div", { class: "d-none", "data-info": "Nueva Factura" });

    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaPagados, vistaDetalleP, vistaPagar, vistaNuevaFactura, vistaNuevoRecibo);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    const encabezadoTabla = [
        "#",
        "Fecha",
        "Factura",
        "#Trans.",
        "Proveedor",
        "Monto Factura",
        "Monto Cobrado",
        "Saldo",
        "Opciones",
    ];
    const estiloTd = [
        "contador",
        "date",
        "text-start",
        "text-start",
        "text-start",
        "text-end",
        // "decimal",
        "decimal",
        "decimal",
        "text-start",
    ];
    const contenidoTabla = [
        "js-cont",
        "fecha",
        "numero",
        "codigo",
        "nombre",
        {
            nombre: "monto",
            agregarT: MontoFactura,
        },
        "cobrado",
        "saldo",
        {
            nombre: "Opciones",
            accion: {
                accion: PagarFactura({ vistaPrincipal, vistaPagar, permisos, estiloFxP: estiloTd, URL_LT_FXP: URL_LT }),
                icono: "bi bi-cash",
                classElemento: "btn btn-primary btn-sm",
                texto: "Pagar",
            },
        },
    ];
    const l_ct = contenidoTabla.length -1;
    if (permisos.editar === "0" && permisos.eliminar === "0") {
        encabezadoTabla.pop();
        contenidoTabla.pop();
    } else if (permisos.editar === "0") {
        delete contenidoTabla[l_ct].usarBasicos.editar;
    } else if (permisos.eliminar === "0"){
        delete contenidoTabla[l_ct].usarBasicos.eliminar;
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    if (permisos.escritura === "1") {
        const vCobrados = Pagados({vistaPrincipal, vistaPagados, vistaDetalleP, permisos, estiloFxP: estiloTd, URL_LT_FXP: URL_LT, ctFxP:contenidoTabla, tbFxP:tBody });
        const listaCobrados = () => {
            cambiarVista(vistaPrincipal, vistaPagados);
            vCobrados();
        }
        const opcionesBtns = opciones([
            btnNuevoRegistro(listaCobrados, "Lista pagados", "list-check"),

            btnNuevoRegistro(()=> cambiarVista(vistaPrincipal, vistaNuevaFactura), "Nueva Factura", "file-earmark-plus"),
            btnNuevoRegistro(()=> cambiarVista(vistaPrincipal, vistaNuevoRecibo), "Nuevo Recibo", "card-list"),
        ]); 
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => {
        const nuevoRegistro = registros.filter(registro => Number(registro.saldo.toFixed(2)) !== 0);
        contenidoTBody(nuevoRegistro, {contenido: contenidoTabla, estiloTd}, tBody);
    };
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

    NuevaFactura(codigo, permisos, { vistaFxC: vistaPrincipal, vistaNuevaFactura})
    NuevoRecibo(codigo, permisos, { vistaFxC: vistaPrincipal, vistaNuevoRecibo})
}

export const MontoFactura = ({elemento, registro, arrayT}) => {
    const strMontoF = parseFloat(registro.monto ?? 0).toFixed(2);
    const strMontoC = parseFloat(registro.cobrado ?? 0).toFixed(2);
    const strMontoS = parseFloat(registro.saldo ?? 0).toFixed(2);
    const montoFactura = parseFloat(strMontoF);
    const montoCobrado = parseFloat(strMontoC);
    const montoSaldo = parseFloat(strMontoS);
    if (arrayT.length > 0) {
        arrayT[1] += montoFactura;
        arrayT[2] += montoCobrado;
        arrayT[3] += montoSaldo;
    } else {
        const row = (montoFT, montoCT, montoST) => {
            const td = crearElemento("td", {colspan: "5", class: "text-end fw-bold"}, ["Total:"]);
            const montoTF = montoFT.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const montoTC = montoCT.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const montoTS = montoST.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const tdFactura = crearElemento("td", {class: "text-end fw-bold", id: "td_det_tr_factura_total"}, [montoTF]);
            const tdCobrado = crearElemento("td", {class: "text-end fw-bold"}, [montoTC]);
            const tdSaldo = crearElemento("td", {class: "text-end fw-bold"}, [montoTS]);
            const tdr = crearElemento("td");
            const row = crearElemento("tr", undefined, [td, tdFactura, tdCobrado, tdSaldo, tdr]);
            return [row];
        }
        arrayT.push(row, montoFactura, montoCobrado, montoSaldo);
    }
    elemento.textContent = montoFactura.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}