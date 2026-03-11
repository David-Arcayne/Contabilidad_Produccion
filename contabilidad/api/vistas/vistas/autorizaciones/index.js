import { crearNavegacionConBotones } from "../../funciones/Funciones.js";
import { SolicitudesAAE } from "./solicitudesAAE.js";
import { SolicitudesDesconsolidar } from "./solicitudesDesconsolidar.js";
import { SolicitudesDocumentos } from "./solicitudesDocumentos.js";
import { SolicitudesInsertar } from "./solicitudesInsertar.js";
import { TransaccionesExternas } from "./transaccionesExternas.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de autorizaciones.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea el contenido principal del menú
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export async function Autorizaciones(codigo, permisos) {
    // Definir los botones y vistas iniciales
    const opciones = [
        {
            id: "desconsolidacion",
            label: "Desconsolidar",
            callbackVista: SolicitudesDesconsolidar
        },
        {
            id: "insertartrans",
            label: "Insertar",
            callbackVista: SolicitudesInsertar
        },
        {
            id: "activaranulareliminar",
            label: "Reactivar, Anular o Eliminar",
            callbackVista: SolicitudesAAE
        },
        {
            id: "transaccionesexternas",
            label: "Transacción Externa",
            callbackVista: TransaccionesExternas
        },
        {
            id: "accionsolicituddocs",
            label: "Anular Documentos",
            callbackVista: SolicitudesDocumentos
        },
    ];

    const datosMenu = {
        codigo,
        permisos
    };

    // Crear la navegación con botones y su contenido
    crearNavegacionConBotones(datosMenu, opciones);
}