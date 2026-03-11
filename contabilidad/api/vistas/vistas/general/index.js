import { crearNavegacionConBotones } from "../../funciones/Funciones.js";
import { Divisas } from "./divisas.js";
import { GestionContable } from "./gestionContable.js";
import { ParaContrataciones } from "./paraContrataciones.js";
import { TipoDocumentoDeCobro } from "./tipoDocumentoCobro.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión general.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea el contenido principal del menú
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export async function General(codigo, permisos) {
    // Definir los botones y vistas iniciales
    const opciones = [
        {
            id: "gestioncontable",
            label: "Gestión Contable",
            callbackVista: GestionContable
        },
        {
            id: "divisas",
            label: "Divisas",
            callbackVista: Divisas
        },
        {
            id: "tipodocumentocobro",
            label: "Para Contrataciones",
            callbackVista: ParaContrataciones
        },
    ];

    const datosMenu = {
        codigo,
        permisos
    };

    // Crear la navegación con botones y su contenido
    crearNavegacionConBotones(datosMenu, opciones);
}