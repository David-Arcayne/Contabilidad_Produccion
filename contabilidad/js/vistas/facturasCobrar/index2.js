import { URL_APIC } from "../../../../lib/services.js";
import { btnNuevoRegistro, BuscarEnTablaOpts, cambiarVista, crearElemento, encabezadoVista, InputBusquedaPlus, opciones } from "../../funciones/Funciones.js";
import { NuevoRecibo } from "./Funcionalidades/NuevoRecibo.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function MenuOtros(codigo, permisos, subVistaOtros, menuInicio) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal;
    const URL_LT = `${URL}listacobrarfactura/${sucursal_id}`;

    // Creación de Vistas para la navegación en la ventana
    // const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    // const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    // vistaRegistrar.setAttribute("class", "d-none");

    const regresar = () => { cambiarVista(subVistaOtros, menuInicio) };
    const tituloVista = encabezadoVista("Volver", "Otras Cuentas", regresar, undefined)
    const vistaPrincipal = crearElemento("div", { class: "d-block" }, [tituloVista]);

    const vistaCobrados = crearElemento("div", { class: "d-none" });
    const vistaDetalleC = crearElemento("div", { class: "d-none" });
    const vistaCobrar = crearElemento("div", { class: "d-none" });
    const vistaNuevaFactura = crearElemento("div", { class: "d-none", "data-info": "Nueva Factura" });
    const vistaNuevoRecibo = crearElemento("div", { class: "d-none", "data-info": "Nueva Factura" });
   
    const contenedorPrincipal = subVistaOtros;
    contenedorPrincipal.append(vistaPrincipal, vistaCobrados, vistaDetalleC, vistaCobrar, vistaNuevaFactura, vistaNuevoRecibo);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    if (permisos.escritura === "1") {
        const opcionesBtns = opciones([
            btnNuevoRegistro(()=> cambiarVista(vistaPrincipal, vistaNuevoRecibo), "Nuevo Recibo", "card-list"),
        ]); 
        vistaPrincipal.appendChild(opcionesBtns);
    }

    NuevoRecibo(codigo, permisos, { vistaFxC: vistaPrincipal, vistaNuevoRecibo})
}
