import { crearNavegacionConBotones } from "../../funciones/Funciones.js";
import { AsientoModelo } from "./asientoModelo.js";
import { ModulosAM } from "./modulosAM.js";
import { TipoAsiento } from "./tipoAsiento.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de asientos contables.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea el contenido principal del menú
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export async function AsientoContable(codigo, permisos) {

    // Definir los botones y vistas iniciales
    const opciones = [
        {
            id: "tipoasiento",
            label: "Tipo Asiento",
            callbackVista: TipoAsiento
        },
        {
            id: "asientomodelo",
            label: "Asiento Modelo",
            callbackVista: AsientoModelo
        },
        {
            id: "moduloam",
            label: "Módulo - Asiento Modelo",
            callbackVista: ModulosAM
        },
    ];

    const datosMenu = {
        codigo,
        permisos
    };

    // Crear la navegación con botones y su contenido
    crearNavegacionConBotones(datosMenu, opciones);
}