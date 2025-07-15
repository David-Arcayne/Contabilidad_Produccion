import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { AccionSolicitud } from "./AccionSolicitud.js";
import { confirmacion } from "./Confirmacion.js";

/**
 * Crea el contenido de la vista activos fijos.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaActivosFijos - Elemento contenedor de la vista activos fijos.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns
 */
export const ActivosFijos = (datosVista) => {
    const { 
        vistaPrincipal, 
        vistaActivosFijos, 
        contenedorDeAlertas,
        permisos
    } = datosVista;

    return async ({ registro, contenidoTabla, tbody }) => {
        const URL = "./api/solicitud-af-pendiente/activo-fijo";

        const regresar = () => {
            cambiarVista(vistaActivosFijos, vistaPrincipal);
        };
        const tituloVista = encabezadoVista(
            "Volver",
            "Activos fijos",
            regresar
        );
        vistaActivosFijos.replaceChildren(tituloVista);

        // Creación de elementos para la vista.
        const contenedorDeAlertasAF = crearElemento("div");
        const formularioConfirmar = crearElemento("div");
        let contador = [0, 0];
        let encabezadoTabla = [
            "Activo Fijo",
            "Detalle",
            "Cantidad",
            "Acción",
        ];
        let estiloTd = [
            "text-start",
            "text-start",
            "text-end",
            "text-start",
        ];
        let contenidoTablaAF = [
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
                nombre: "Acción",
                miEstilo: AccionSolicitud({
                    vistaPrincipal,
                    vistaActivosFijos,
                    contenedorDeAlertas,
                    contenedorDeAlertasAF,
                    URL,
                    datosPendiente: registro,
                    contador,
                    formularioConfirmar,
                    contenidoTabla,
                    tbody,
                    estiloTd,
                }),
            },
        ];
        
        if (registro.estado == 8) {
            encabezadoTabla = [
                "Activo Fijo",
                "Detalle",
                "Acción",
            ];
            estiloTd = [
                "text-start",
                "text-start",
                "text-start",
            ];
            contenidoTablaAF = [
                {
                    nombre: "nombreactivofijo",
                    miEstilo: NombreAF,
                },
                {
                    nombre: "detalle",
                    miEstilo: DetalleAF,
                },
                {
                    nombre: "Acción",
                    miEstilo: AccionSolicitud({
                        vistaPrincipal,
                        vistaActivosFijos,
                        contenedorDeAlertas,
                        contenedorDeAlertasAF,
                        URL,
                        datosPendiente: registro,
                        contador,
                        formularioConfirmar,
                        contenidoTabla,
                        tbody,
                        estiloTd,
                    }),
                },
            ];
        }

        if (permisos.escritura === "0" || permisos.editar === "0") {
            encabezadoTabla.pop();
            contenidoTablaAF.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        tabla.classList.add("mb-4")
        vistaActivosFijos.append(contenedorDeAlertasAF, tabla, formularioConfirmar);
        // Listar los registros en la tabla.
        const cargarContenido = async (registros) => {
            await contenidoTBody(registros, {contenido: contenidoTablaAF, estiloTd}, tBody);
            contador[1] = registros.rows;
            if (permisos.escritura === "1" && permisos.editar === "1") {
                confirmacion(
                    formularioConfirmar,
                    vistaPrincipal,
                    vistaActivosFijos,
                    "./api/solicitud-af-pendiente",
                    registro,
                    contenidoTabla,
                    tbody,
                    contenedorDeAlertas,
                    contenedorDeAlertasAF,
                    contador,
                    estiloTd
                );
            }
           
        };
        await obtenerDatosAlr(`${URL}/${registro.id}`, {
            contenedor: contenedorDeAlertasAF,
            error: "Ocurrio un error al cargar los registros",
            accion: cargarContenido
        });

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