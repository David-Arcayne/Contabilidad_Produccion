import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";

/**
 * Crea el contenido de la vista activos fijos.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaActivosFijos - Elemento contenedor de la vista activos fijos.
 * @returns
 */
export const activosFijos = (datosVista) => {
    const {
        vistaPrincipal,
        vistaActivosFijos, 
    } = datosVista;

    return ({registro}) => {
        const URL = "./api/movimientos/activo-fijo";

        const regresar = () => { cambiarVista(vistaActivosFijos, vistaPrincipal) }
        const tituloVista = encabezadoVista("Volver", "Activos fijos", regresar)
        vistaActivosFijos.replaceChildren(tituloVista);

        // Creación de elementos para la vista Principal
        const contenedorDeAlertas = crearElemento("div");
        vistaActivosFijos.appendChild(contenedorDeAlertas);
        const encabezadoTabla = [
            "Código",
            "Categoria",
            "Activo Fijo",
            "Detalle",
            "Cantidad",
            "Estado",
        ];
        const estiloTd = [
            "text-start",
            "text-start",
            "text-start",
            "text-start",
            "text-end",
            "text-start",
        ];
        const contenidoTabla = [
            "codigoactivofijo",
            "nombrecategoria",
            {
                nombre: "nombreactivofijo",
                miEstilo: NombreAF,
            },
            {
                nombre: "detalle",
                miEstilo: DetalleAF,
            },
            "cantidad",
            {
                nombre: "estado",
                miEstilo: EstadoAF(registro.estado),
            },
        ];

        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaActivosFijos.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(`${URL}/individual/${registro.id}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
        cambiarVista(vistaPrincipal, vistaActivosFijos);
    }   
}

/**
 * Obtine el nombre del registro.
 */
const NombreAF = ({elemento, registro}) => {
    elemento.innerHTML = registro.activosfijos_id ? registro.nombreactivofijo : registro.nombre || "";
}

/**
 * Obtine el detalle del registro.
 */
const DetalleAF = ({elemento, registro}) => {
    elemento.innerHTML = registro.activosfijos_id ? registro.detalleactivofijo : registro.detalle || "";
}

/**
 * Muestra el estado del activo fijo,
 */
const EstadoAF = (estadoSolicitud) => ({elemento, registro}) => {
    elemento.setAttribute("class", "text-nowrap");
    const estado = registro.estado;
    if (estadoSolicitud == 12) {
        const texto = registro.trabajador_id ? " Retirado" : " Asignado";
        const icono = registro.trabajador_id ? "bi-box-arrow-right" : "bi-box-arrow-in-right";
        const i = crearElemento("i", {class: `bi ${icono} pe-1`});
        const boton = crearElemento("button", {class: "btn btn-sm btn-success pe-none"}, [i, texto]);
        elemento.append(boton);
    } else if (estadoSolicitud == 7) {
        const i = crearElemento("i", {class: "bi bi-box-arrow-right pe-1"});
        const boton = crearElemento("button", {class: `btn btn-sm btn-danger pe-none`}, [i, " Rechazado"]);
        elemento.append(boton);
    } else if (estadoSolicitud == 6) {
        const texto = estado == 1 ? " Aceptado" : " Rechazado";
        const color = estado == 1 ? "btn-success" : "btn-danger";
        const i = crearElemento("i", {class: "bi bi-box-arrow-right pe-1"});
        const boton = crearElemento("button", {class: `btn btn-sm ${color} pe-none`}, [i, texto]);
        elemento.append(boton);
    } else if (estadoSolicitud == 3) {
        const i = crearElemento("i", {class: "bi bi-box-arrow-in-right pe-1"});
        const boton = crearElemento("button", {class: `btn btn-sm btn-danger pe-none`}, [i, " Rechazado"]);
        elemento.append(boton);
    } else if (estadoSolicitud == 1) {
        const texto = estado == 1 ? " Aceptado" : " Rechazado";
        const color = estado == 1 ? "btn-success" : "btn-danger";
        const i = crearElemento("i", {class: "bi bi-box-arrow-in-right pe-1"});
        const boton = crearElemento("button", {class: `btn btn-sm ${color} pe-none`}, [i, texto]);
        elemento.append(boton);
    } 
}
