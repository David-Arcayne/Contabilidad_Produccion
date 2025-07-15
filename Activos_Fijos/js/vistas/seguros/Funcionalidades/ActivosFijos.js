import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { ReportesAF } from "./ReporteAF.js";

/**
 * Crea el contenido de la vista activos fijos.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaActivosFijos - Elemento contenedor de la vista activos fijos.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns
 */
export const ActivosFijos = (datosVista) => {
    const {
        vistaPrincipal,
        vistaActivosFijos, 
        permisos
    } = datosVista;

        const URL = "./api/seguros/activo-fijo";

        const regresar = () => { cambiarVista(vistaActivosFijos, vistaPrincipal) };
        const tituloVista = encabezadoVista("Volver", "Seguros - Activos fijos", regresar);
        vistaActivosFijos.replaceChildren(tituloVista);

        // Creación de elementos para la vista.
        const contenedorDeAlertas = crearElemento("div");
        const encabezadoTabla = [
            "Código",
            "Nombre",
            "Detalle",
            "Precio",
            "Fecha de ingreso",
            "Categoría",
            "Tipo de bien",
            "Tipo seguro",
        ];
        const estiloTd = [
            "text-start",
            "text-start",
            "text-start",
            "decimal",
            "date",
            "text-start",
            "text-start",
            "text-start",
        ];
        const contenidoTabla = [
            "codigo",
            "nombre",
            "detalle",
            "precio",
            "fechacompra",
            "nombrecategoria",
            "nombretipobien",
            "nombretiposeguro",
        ];
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        const formularioReportes = ReportesAF({ contenidoTabla, elementoTBody: tBody, URL, estiloTd})();

        vistaActivosFijos.append(contenedorDeAlertas, formularioReportes, tabla);

        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(`${URL}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
}