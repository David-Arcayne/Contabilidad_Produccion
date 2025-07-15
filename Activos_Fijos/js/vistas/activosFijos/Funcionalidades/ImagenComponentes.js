import { crearElemento } from "../../../funciones/Funciones.js";
import { modalImagen } from "../../../funciones/Modals.js";

/**
 * Imagen del componente, y modal de la imagen.
 * @param {HTMLElement} vistaComponentes - Elemento que contiene la vista Componentes.
 * @returns 
 */
export const ImagenComponentes = (vistaComponentes) => ({elemento, registro}) => {
    elemento.classList.add("p-0", "text-center")

    if (registro.imagen === null) {
        elemento.innerHTML = "-";
        return;
    }

    const img = crearElemento("img", {
        src: `./imagenes/componentes/${registro.imagen}`,
        alt: registro.nombre,
        width: "60",
        height: "40",
        class: "rounded-2 border border-primary-subtle",
        role: "button",
    });
    elemento.append(img);

    img.addEventListener("click", () => {
        vistaComponentes.append(modalImagen(`./imagenes/componentes/${registro.imagen}`, registro.nombre));
    });
}