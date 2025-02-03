import { URL_APIC } from "../../../../../lib/services.js";
import { alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista, opciones } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { AgregarPlanes, ReemplazarPlanes } from "./AgregarPlanDeC.js";

/**
 * Crea el contenido de la vista Agregar plan de cuenta.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaPlanCuentas - Elemento contenedor de la vista plan de cuentas.
 * @param {HTMLElement} datosVista.cntAlertasPdC - Contenedor de alertas de la vista principal.
 * @param {HTMLElement} datosVista.URL_LT - URL para obtener los registros.
 * @param {Array} datosVista.tablaPdC - Datos para actualizar la tabla principla.
 * @param {Function} datosVista.recargarPdC - Función para recargar la tabla de la vista principal.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns
 */
export const PlanCuentas = (datosVista) => {
    const {
        vistaPrincipal,
        vistaPlanCuentas, 
        permisos,
        cntAlertasPdC,
        URL_LT,
        tablaPdC,
        recargarPdC,

    } = datosVista;

    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

    // Crear la sección de cabecera de la vista.
    // (El presente plan de cuentas se sugiere en base a su rubro empresarial)

    const subtittulo = crearElemento("h6", { class: "text-center my-2" }, ["(El presente plan de cuentas se sugiere en base a su rubro empresarial)"]);
    const regresar = () => { cambiarVista(vistaPlanCuentas, vistaPrincipal) };
    const tituloVista = encabezadoVista("Volver", "Plan de cuentas modelo", regresar, undefined, subtittulo);
    vistaPlanCuentas.replaceChildren(tituloVista);

    const contenedorDeAlertas = crearElemento("div");
    // Función para recargar la tabla de la vista principal.
    const accionR = (texto) => async () => {
        const datos = await obtenerDatos(URL_LT);
        if (datos) {
            contenidoTBody(datos, ...tablaPdC);
            recargarPdC();
        }
        alertaDeExito(cntAlertasPdC, texto);
        cambiarVista(vistaPlanCuentas, vistaPrincipal);
    };
    // Creación de elementos para la vista.
    const opcionesBtns =  opciones([
        AgregarPlanes(`${URL}agregarplanes/${empresa_id}`, { vista: vistaPlanCuentas, contenedor: contenedorDeAlertas, accion: accionR }),
        ReemplazarPlanes(`${URL}reemplazarplanes/${empresa_id}`, { vista: vistaPlanCuentas, contenedor: contenedorDeAlertas, accion: accionR }),
    ]);
    const encabezadoTabla = [
        "Código",
        "Cuenta",
        "Tipo",
        "Descripción",
    ];
    const estiloTd = [
        "text-end",
        "text-start",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "numero",
        "plan",
        "tipo",
        "descripcion",
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    vistaPlanCuentas.append(contenedorDeAlertas, opcionesBtns, tabla);

    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(`${URL}listaplanesempresa/${empresa_id}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
}