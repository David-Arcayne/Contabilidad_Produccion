import { crearElemento, elementoBoton, seccionEncabezado } from "../../funciones/Funciones.js";
import { FrecuenciaPago } from "./FrecuenciaPago.js";
import { TipoDocumentoDeCobro } from "./tipoDocumentoCobro.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión opciones para contrataciones.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaTipoDocumentoCobro - Contenedor principal donde se renderiza la vista de tipos de documentos de cobro.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function ParaContrataciones(permisos, vistaTipoDocumentoCobro, datosVistaPrincipal) {

    // Creación de Vistas para la navegación
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaTipoDocumentoCobro.append(vistaPrincipal);

    const encabezadoVista = seccionEncabezado({ titulo: "Opciones para Contrataciones" });
    vistaPrincipal.appendChild(encabezadoVista);


    const vistasConfig = {
        "tipo-documento": {
            label: "Tipo de Documento",
            render: () => TipoDocumentoDeCobro(
                permisos,
                vistas["tipo-documento"],
                datosVistaPrincipal
            )
        },
        "frecuencia-pago": {
            label: "Frecuencia de Pago",
            render: () => FrecuenciaPago({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaTipoDocumento: vistas["tipo-documento"],
                vistaFrecuenciaPago: vistas["frecuencia-pago"],
            })
        }
    };

    const vistas = {};
    const botones = {};
    const filasBotones = [];
    // Crea los botones y vistas correspondientes
    Object.entries(vistasConfig).forEach(([id, { label }]) => {
        vistas[id] = crearElemento("div", { class: "d-none", "data-view-id": id });
        botones[id] = crearElemento("button", { class: "btn btn-outline-dark", "data-action": id }, [label]);
        filasBotones.push(
            crearElemento("div", { class: "col col-auto" }, [botones[id]])
        );
    });

    const contenedorBotones = crearElemento("div", { class: "row pb-2 g-1" }, filasBotones);
    vistaPrincipal.append(contenedorBotones, ...Object.values(vistas));

    // Permite mostrar la vista seleccionada y ocultar las demás
    const mostrarVista = (id) => {
        Object.entries(vistas).forEach(([key, vista]) => {
            vista.classList.toggle("d-none", key !== id);
        });

        Object.entries(botones).forEach(([key, boton]) => {
            boton.classList.toggle("btn-dark", key === id);
            boton.classList.toggle("btn-outline-dark", key !== id);
        });

        if (vistas[id].childElementCount === 0) {
            vistasConfig[id].render();
        }
    };

    // Manejo de eventos para los botones de navegación
    contenedorBotones.addEventListener("click", (e) => {
        const id = e.target?.dataset?.action;
        if (id && vistas[id]) {
            mostrarVista(id);
        }
    });

    mostrarVista("tipo-documento");
}
