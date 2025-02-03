import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { DetallePagados } from "./DetallePagados.js";

/**
 * Crea el contenido de la vista Crear Asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaPagados - Elemento contenedor de la vista facturas cobradas.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const Pagados = (datosVista) => {
    const {
        vistaPrincipal,
        vistaPagados, 
        vistaDetalleP,
        permisos,
        estiloFxP,
        URL_LT_FXP,
        ctFxP,
        tbFxP,
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return () => {
        const URL = `${URL_APIC}api/`;
        const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal;
        const URL_LT = `${URL}listapagarfactura/${sucursal_id}`;

        const moneda = crearElemento("p", { class: "text-center" }, ["(Expresado en Bolivianos)"]);
        const regresar = async () => { 
            const listaDeRegistros = await obtenerDatos(URL_LT_FXP);
            if (listaDeRegistros) {
                const nuevoRegistro = listaDeRegistros.filter(registro => Number(registro.saldo.toFixed(2)) !== 0);
                contenidoTBody(nuevoRegistro, {contenido: ctFxP, estiloTd: estiloFxP}, tbFxP)
                cambiarVista(vistaPagados, vistaPrincipal)
            }
        }
        const tituloVista = encabezadoVista("Volver", "Facturas Pagadas", regresar, undefined, moneda)
        vistaPagados.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalPagados = crearElemento("div");

        vistaPagados.append(vistaPrincipalPagados);
        
        // Creación de elementos para la vista principal
        const alertasPagados = crearElemento("div");
        vistaPrincipalPagados.appendChild(alertasPagados);
        
        const encabezadoTabla = [
            "#",
            "Fecha",
            "Factura",
            "#Trans.",
            "Proveedor",
            "Monto",
            "Opciones",
        ];
        const estiloTd = [
            "contador",
            "date",
            "text-start",
            "text-start",
            "text-start",
            "decimal",
            "text-start",
        ];
        const contenidoTabla = [
            "js-cont",
            "fecha",
            "numero",
            "codigo",
            "nombre",
            "monto",
            {
                nombre: "Opciones",
                accion: {
                    accion: DetallePagados({ vistaPagados, vistaDetalleP, permisos, estiloTdP: estiloTd, URL_LT_P: URL_LT }),
                    icono: "bi bi-card-checklist",
                    classElemento: "btn btn-primary btn-sm",
                    texto: "Ver",
                },
            }
        ];
        if (permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalPagados.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { 
            const nuevoRegistro = registros.filter(registro => Number(registro.saldo.toFixed(2)) === 0);
            contenidoTBody(nuevoRegistro, {contenido: contenidoTabla, estiloTd}, tBody);
        }
        obtenerDatosAlr(URL_LT, { contenedor: alertasPagados, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
        cambiarVista(vistaPrincipal, vistaPagados)
    }   
}