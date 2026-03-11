import { crearNavegacionConBotones } from "../../funciones/Funciones.js";
import { FacturacionCobro } from "./facturacionCobro.js";
import { FacturacionPago } from "./facturacionPago.js";
import { FacturasComercial } from "./facturasComercial.js";
import { FacturasDeCuenta } from "./facturasDeCuenta.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión tributaria.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea el contenido principal del menú
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export async function Tributario(codigo, permisos) {

    // Definir los botones y vistas iniciales
    const opciones = [
        {
            id: "facturacioncobros",
            label: "Facturación Cobros",
            callbackVista: FacturacionCobro
        },
        {
            id: "facturacionpagos",
            label: "Facturación Pagos",
            callbackVista: FacturacionPago
        },
        {
            id: "facturascomercial",
            label: "Facturas Comercial",
            callbackVista: FacturasComercial
        },
        {
            id: "reportesdecuenta",
            label: "Reportes",
            callbackVista: FacturasDeCuenta
        },
    ];

    const datosMenu = {
        codigo,
        permisos
    };

    // Crear la navegación con botones y su contenido
    crearNavegacionConBotones(datosMenu, opciones);
}