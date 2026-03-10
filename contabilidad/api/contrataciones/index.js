import { crearNavegacionConBotones } from "../../funciones/Funciones.js";
import { DocumentoDeCobro } from "./documentoDeCobro.js";
import { DocumentoDePago } from "./documentoDePago.js";
import { DocumentoReportes } from "./documentoReportes.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de contrataciones.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */

/**
 * Crea el contenido principal del menú
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export async function Contrataciones(codigo, permisos) {
    // Definir los botones y vistas dinámicamente
    const opciones = [
        { id: "documentocobro",
            label: "Documento de Cobro",
            callbackVista: DocumentoDeCobro
        },
        { id: "documentopago",
            label: "Documento de Pago",
            callbackVista: DocumentoDePago
        },
        { id: "documentoreportes",
            label: "Reportes",
            callbackVista: DocumentoReportes
        },
    ];

    const datosMenu = {
        codigo,
        permisos
    };

    // Crear la navegación con botones y su contenido
    crearNavegacionConBotones(datosMenu, opciones);
}