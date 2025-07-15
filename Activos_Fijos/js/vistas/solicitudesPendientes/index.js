import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { crearElemento, InputBusqueda } from "../../funciones/Funciones.js";
import { ActivosFijos } from "./Funcionalidades/ActivosFijos.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function SolicitudesAFPendientes(codigo, permisos) {
    const URL = "./api/solicitud-af-pendiente";

    // Creacion de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaActivosFijos = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaActivosFijos.setAttribute("class", "d-none");
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaActivosFijos);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    const encabezadoTabla = [
        "Título",
        "Sucursal",
        "Área de trabajo",
        "Personal",
        "Tipo",
        "Activos fijos"
    ];
    const estiloTd = [
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "detalle",
        "nombresucursal",
        "nombredepartamento",
        "nombrepersonal",
        {
            nombre: "detalle",
            miEstilo: estadoSolicitud,
        },
        {
            nombre: "Opciones",
            accion: {
                accion: ActivosFijos({ vistaPrincipal, vistaActivosFijos, contenedorDeAlertas, permisos }),
                icono: "bi bi-list-columns-reverse",
                classElemento: "btn btn-primary btn-sm ",
                texto : "Revisar"
            }
        },
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(contenedorDeAlertas, divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(URL, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

}

/**
 * Obtine el tipo de solicitud.
 */
const estadoSolicitud = ({elemento, registro}) => {

    elemento.classList.add("text-nowrap");
    if (registro.estado == 8) {
        const boton = crearElemento("button", {class: "btn btn-sm btn-info pe-none"}, ["Devolución"]);
        elemento.append(boton);
        return;
    } else {
        const boton = crearElemento("button", {class: "btn btn-sm btn-info pe-none"}, ["Solicitud"]);
        elemento.append(boton);
    }
}