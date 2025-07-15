import { alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { ImplementarScanner } from "../../../funciones/Scanner.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { CodigoQR } from "./CodigoQR.js";
import { Estado } from "./Estado.js";
import { Reportes } from "./Reportes.js";
import { VerEstado } from "./VerEstado.js";

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

    return ({registro}) => {
        const URL = "./api/inventarios/activo-fijo";

        const regresar = () => { cambiarVista(vistaActivosFijos, vistaPrincipal) };
        const tituloVista = encabezadoVista("Volver", "Activos fijos", regresar);
        vistaActivosFijos.replaceChildren(tituloVista);

        // Creación de elementos para la vista.
        const contenedorDeAlertas = crearElemento("div");
        const encabezadoTabla = [
            "Código",
            "Cantidad",
            "Nombre",
            "Detalle",
            "Fecha de ingreso",
            "Categoría",
            "Tipo de bien",
            "Póliza de seguro",
            "QR",
            // "Observación",
            "Esdado"
        ];
        const estiloTd = [
            "text-start",
            "text-end",
            "text-start",
            "text-start",
            "date",
            "text-start",
            "text-start",
            "text-start",
            "text-start",
            // "text-start",
            "text-start",
        ];
        const contenidoTabla = [
            "codigo",
            "cantidad",
            "nombre",
            "detalle",
            "fechacompra",
            "nombrecategoria",
            "nombretipobien",
            {
                nombre: "polizaseguro",
                miEstilo: Poliza,
            },
            {
                nombre: "Acción",
                miEstilo: CodigoQR({
                    vistaPrincipal,
                    vistaActivosFijos,
                }),
            },
            // "observacioninv",
            {
                nombre: "Opciones",
                acciones: {
                    accionEstado: {
                        estilo: Estado({vistaActivosFijos, contenedorDeAlertas, inventario: registro, URL, permisos})
                    },
                    verEstados: {
                        estilo: VerEstado({vistaActivosFijos, contenedorDeAlertas, inventario: registro, URL, permisos, estiloTd})
                    }
                }
            }
        ];
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        const formularioReportes = Reportes({ contenidoTabla, elementoTBody: tBody, URL, inventarioId: registro.id, estiloTd })();

        vistaActivosFijos.append(contenedorDeAlertas, formularioReportes, tabla);
        const modalBodyScanner = formularioReportes.querySelector("#modalBodyScanner");

        ImplementarScanner(modalBodyScanner, "pantalla-escaner-busqueda", FiltroQR({ contenidoTabla, elementoTBody: tBody, URL, inventarioId: registro.id, estiloTd, contenedorDeAlertas }), "busqueda");

        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(`${URL}/${registro.id}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
        cambiarVista(vistaPrincipal, vistaActivosFijos);
    }   
}

/**
 * Obtine la poliza con el nombre del tipo de seguro.
 */
const Poliza = ({elemento, registro}) => {
    if (registro.polizaseguro) {
        elemento.innerHTML = registro.polizaseguro + ": " + registro.nombretiposeguro;
    } else {
        elemento.innerHTML = "-"
    }
}


const FiltroQR = ({contenidoTabla, elementoTBody, URL, inventarioId, estiloTd, contenedorDeAlertas}) => {
    return (qrCodeAFId) => {
        const activoDeIntentario = obtenerDatos(`${URL}/qr/${inventarioId}/${qrCodeAFId}`);
        if (activoDeIntentario) {
            alertaDeExito(contenedorDeAlertas, "Se realizo la busqueda mediante el Scanner QR.");
            contenidoTBody(activoDeIntentario, {contenido: contenidoTabla, estiloTd}, elementoTBody);
        } else {
            contenidoTBody([], {}, elementoTBody);
        }
    }
}
