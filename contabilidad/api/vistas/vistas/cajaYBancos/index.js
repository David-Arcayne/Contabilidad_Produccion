import { crearNavegacionConBotones } from "../../funciones/Funciones.js";
import { CobrarOPagar } from "../cobrarOPagar/index.js";
import { CajaYBancos } from "./efectivo.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de tesorería.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */

/**
 * Crea el contenido principal del menú
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export async function Tesoreria(codigo, permisos) {
    // Definir los botones y vistas dinámicamente
    const opciones = [
        { id: "efectivo",
            label: "Efectivo",
            callbackVista: CajaYBancos
        },
        { id: "credito",
            label: "Crédito",
            callbackVista: CobrarOPagar
        },
    ];

    const datosMenu = {
        codigo,
        permisos
    };

    // Crear la navegación con botones y su contenido
    crearNavegacionConBotones(datosMenu, opciones);
}