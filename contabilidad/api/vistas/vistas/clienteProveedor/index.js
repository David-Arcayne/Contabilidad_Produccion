import { crearNavegacionConBotones } from "../../funciones/Funciones.js";
import { Clientes } from "./cliente.js";
import { Proveedores } from "./proveedor.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de clientes y proveedores.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea el contenido principal del menú
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export async function ClienteOProveedor(codigo, permisos) {
    // Definir los botones y vistas iniciales
    const opciones = [
        {
            id: "cliente",
            label: "Cliente",
            callbackVista: Clientes
        },
        {
            id: "proveedor",
            label: "Proveedor",
            callbackVista: Proveedores
        },
    ];

    const datosMenu = {
        codigo,
        permisos
    };

    // Crear la navegación con botones y su contenido
    crearNavegacionConBotones(datosMenu, opciones);
}