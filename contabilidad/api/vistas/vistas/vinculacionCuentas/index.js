import { crearNavegacionConBotones } from "../../funciones/Funciones.js";
import { CajasYBancos } from "./cajasYBancos.js";
import { Impuesto } from "./impuesto.js";
import { PagarCobrar } from "./pagarCobrar.js";

/**
 * Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la vinculación de cuentas.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea el contenido principal de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export async function VinculacionCuentas(codigo, permisos) {
    // Definir los botones y vistas iniciales
    const opciones = [
        {
            id: "impuestos",
            label: "Tributario",
            callbackVista: Impuesto
        },
        {
            id: "cajasybancos",
            label: "Tesorería",
            callbackVista: CajasYBancos
        },
        {
            id: "pagarcobrar",
            label: "Otras Cuentas",
            callbackVista: PagarCobrar
        },
    ];

    const datosMenu = {
        codigo,
        permisos
    };

    // Crear la navegación con botones y su contenido
    crearNavegacionConBotones(datosMenu, opciones);
}