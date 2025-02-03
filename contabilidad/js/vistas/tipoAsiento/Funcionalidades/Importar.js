import { URL_APIA, URL_APIC } from "../../../../../lib/services.js";
import { alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista, opciones } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { ImportarTiposDeAsiento } from "./Opciones.js";

/**
 * Crea el contenido de la vista Importar Tipo Asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaImportar - Elemento contenedor de la vista Importar.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @param {HTMLElement} datosVista.cntAlertasTA - Contenedor de alertas de la vista principal.
 * @param {string} datosVista.URL_LT - URL para obtener los registros para la tabla de la vista principal.
 * @param {Array} datosVista.tablaTA - Datos requeridos para la acutliazación de la tabla de la vista principal.
 * @returns
 */
export const Importar = (datosVista) => {
    const {
        vistaPrincipal,
        vistaImportar, 
        permisos,
        cntAlertasTA,
        URL_LT,
        tablaTA,
    } = datosVista;

    const URL = `${URL_APIA}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

    // Crear la sección de cabecera de la vista.
    const regresar = () => { cambiarVista(vistaImportar, vistaPrincipal) };
    const tituloVista = encabezadoVista("Volver", "Tipos de asiento", regresar);
    vistaImportar.replaceChildren(tituloVista);

    const contenedorDeAlertas = crearElemento("div");
    const accionR = (texto) => async () => {
        // Obtener y actualizar los registros de la tabla de la vista principal.
        const datos = await obtenerDatos(URL_LT);
        if (datos) {
            contenidoTBody(datos, ...tablaTA);
        }
        alertaDeExito(cntAlertasTA, texto);
        cambiarVista(vistaImportar, vistaPrincipal);
    };
    // Creación de elementos para la vista.
    const tiposAsientoAdmin = [];
    const opcionesBtns =  opciones([
        ImportarTiposDeAsiento(`${URL_APIC}api/`, tiposAsientoAdmin, { vista: vistaImportar, contenedor: contenedorDeAlertas, accion: accionR }),
    ]);
    const encabezadoTabla = [
        "Nombre",
        "Detalle",
    ];
    const estiloTd = [
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "nombre",
        "detalle",
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    vistaImportar.append(contenedorDeAlertas, opcionesBtns, tabla);

    // Listar los registros en la tabla.
    const cargarContenido = (registros) => {
        tiposAsientoAdmin.push(...registros);
        contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
    }
    obtenerDatosAlr(`${URL}tipotransaccion`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
}