import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { BotonPDF, VistaPDF } from "../../../funciones/VistaPDF.js";
import { DetalleCobrados } from "./DetalleCobrados.js";
import { VPDetalleCobrados } from "./VPDetalleCobrados.js";

/**
 * Crea el contenido de la vista Crear Asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaCobrados - Elemento contenedor de la vista facturas cobradas.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const Cobrados = (datosVista) => {
    const {
        vistaPrincipal,
        vistaCobrados, 
        vistaDetalleC,
        permisos,
        estiloFxC,
        URL_LT_FXC,
        ctFxC,
        tbFxC,
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return () => {
        const URL = `${URL_APIC}api/`;
        const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal;
        const URL_LT = `${URL}listacobrarfacturazero/${sucursal_id}`;

        const moneda = crearElemento("p", { class: "text-center" }, ["(Expresado en Bolivianos)"]);
        const regresar = async () => { 
            const listaDeRegistros = await obtenerDatos(URL_LT_FXC);
            if (listaDeRegistros) {
                const nuevoRegistro = listaDeRegistros.filter(registro => Number(registro.saldo.toFixed(2)) !== 0);
                contenidoTBody(nuevoRegistro, {contenido: ctFxC, estiloTd: estiloFxC}, tbFxC)
                cambiarVista(vistaCobrados, vistaPrincipal)
            }
        }
        const tituloVista = encabezadoVista("Volver", "Facturas Cobradas", regresar, undefined, moneda)
        vistaCobrados.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalCbds = crearElemento("div");
        const vistaRegistrarCbds = crearElemento("div", {class: "d-none"});

        vistaCobrados.append(vistaPrincipalCbds);
        
        // Creación de elementos para la vista principal
        const alertasCbds = crearElemento("div");
        vistaPrincipalCbds.appendChild(alertasCbds);
        
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
            "nombrep",
            "monto",
            {
                nombre: "Opciones",
                // accion: {
                //     accion: DetalleCobrados({ vistaCobrados, vistaDetalleC, permisos, estiloTdC: estiloTd, URL_LT_C: URL_LT }),
                //     icono: "bi bi-card-checklist",
                //     classElemento: "btn btn-primary btn-sm",
                //     texto: "Ver",
                // },
                acciones: {
                    detalle: {
                        accion: DetalleCobrados({ vistaCobrados, vistaDetalleC, permisos, estiloTdC: estiloTd, URL_LT_C: URL_LT }),
                        icono: "bi bi-card-checklist",
                        classElemento: "btn btn-primary btn-sm",
                        texto: "Ver",
                    },
                    reporte: {
                        estilo: VerDetalle,
                    }
                },
            }
        ];
        if (permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalCbds.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { 
            const nuevoRegistro = registros.filter(registro => Number(registro.saldo.toFixed(2)) === 0);
            contenidoTBody(nuevoRegistro, {contenido: contenidoTabla, estiloTd}, tBody);
        }
        obtenerDatosAlr(URL_LT, { contenedor: alertasCbds, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
        cambiarVista(vistaPrincipal, vistaCobrados)
    }   
}

const VerDetalle = ({elemento, registro}) => {
    const icono = crearElemento("i", {class: "bi bi-file-text"});
    elemento.setAttribute("class", "btn btn-primary btn-sm");
    elemento.setAttribute("title", "Estado de cuenta");
    elemento.appendChild(icono);
    
    const URL = `${URL_APIC}api/`;
    const URL_LT = `${URL}listapagos/${registro.id}`;

    const elementosModal = VistaPDF("Detalle cobrados", {nombrePDF: "detalle_cobrados"});
    const btnVistaPrevia = BotonPDF(elementosModal, VPDetalleCobrados(URL_LT, registro));
    btnVistaPrevia(elemento);
}