import { URL_APIA, URL_APIC } from "../../../../../lib/services.js";
import { alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista, opciones } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { ImportarImpuestos, Individual } from "./Opciones.js";

/**
 * Crea el contenido de la vista Importar impuestos.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaImportar - Elemento contenedor de la vista Importar.
 * @param {HTMLElement} datosVista.cntAlertasIm - Contenedor de alertas de la vista importar.
 * @param {HTMLElement} datosVista.URL_LT - URL para obtener los registros para la tabla de la vista principal.
 * @param {Array} datosVista.tablaIm - Datos para actualizar la tabla de Impuestos.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns
 */
export const Importar = (datosVista) => {
    const {
        vistaPrincipal,
        vistaImportar, 
        permisos,
        cntAlertasIm,
        URL_LT,
        tablaIm,
    } = datosVista;

    const URL = `${URL_APIA}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

    // Crear la sección de cabecera de la vista.
    const regresar = () => { cambiarVista(vistaImportar, vistaPrincipal) };
    const tituloVista = encabezadoVista("Volver", "Importar impuestos", regresar);
    vistaImportar.replaceChildren(tituloVista);

    const contenedorDeAlertas = crearElemento("div");
    const accionR = (texto) => async () => {
        // Obtener y actualizar los registros de la tabla de la vista principal.
        const datos = await obtenerDatos(URL_LT);
        if (datos) {
            contenidoTBody(datos, ...tablaIm);
        }
        alertaDeExito(cntAlertasIm, texto);
        cambiarVista(vistaImportar, vistaPrincipal);
    };
    // Creación de elementos para la vista.
    const impuestosAdmin = [];
    const opcionesBtns =  opciones([
        ImportarImpuestos(`${URL_APIC}api/`, impuestosAdmin, { vista: vistaImportar, contenedor: contenedorDeAlertas, accion: accionR }),
    ]);
    const encabezadoTabla = [
        "Código",
        "Nombre",
        "Tasa",
        "Descripción",
        "Opciones",
    ];
    const estiloTd = [
        "text-start",
        "text-start",
        "decimal",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "codigoimpuesto",
        "nombreimpuesto",
        "tasa",
        "descripcion",
        {
            nombre: "Opciones",
            accion: {
                accion: Individual(`${URL_APIC}api/`, URL_LT, contenedorDeAlertas, vistaImportar, tablaIm),
                icono: "bi bi-plus-lg",
                classElemento: "btn btn-primary btn-sm ",
                texto: " Impportar",
            },
        }
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    vistaImportar.append(contenedorDeAlertas, opcionesBtns, tabla);

    // Listar los registros en la tabla.
    const cargarContenido = (registros) => {
        impuestosAdmin.push(...registros);
        contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
    }
    obtenerDatosAlr(`${URL}listaimpuesto/${empresa_id}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
}