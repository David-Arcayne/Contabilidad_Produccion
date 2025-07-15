import { crearElemento } from "../../../funciones/Funciones.js";

/**
 * Crea un boton segun el estado del activo.
 * @returns {Function}
 */
export const Estado = () => {

    return ({ elemento, registro, contenidoTabla, tbody}) => {
    
        const color = (registro.estado_a >= 1) 
            ? "btn-success" 
            : ((registro.estado_r >= 1 && registro.estado_r  == registro.estado_t) ? "btn-danger" : "af-btn-orange");
        const estado = registro.estado;
        if (estado == 12) {
            const i = crearElemento("i", {class: "bi bi-arrow-left-right pe-1"});
            elemento.setAttribute("class", `btn btn-sm ${color} pe-none`);
            elemento.append(i, " Reasignación");
        } else if (estado == 1 || estado == 3) {
            const i = crearElemento("i", {class: "bi bi-box-arrow-in-right pe-1"});
            elemento.setAttribute("class", `btn btn-sm ${color} pe-none`);
            elemento.append(i, " Asignación");
        } else if (estado == 6 || estado == 7) {
            const i = crearElemento("i", {class: "bi bi-box-arrow-right pe-1"});
            elemento.setAttribute("class", `btn btn-sm ${color} pe-none`);
            elemento.append(i, " Devolución");
        } 
        // else if (registro.estado_a >= 1) {
        //     const i = crearElemento("i", {class: "bi bi-hand-thumbs-up-fill"});
        //     elemento.setAttribute("class", "btn btn-sm btn-success");
        //     elemento.setAttribute("style", "pointer-events: none");
        //     elemento.append(i, " Asignado");
        // } else if (estado == 2) {
        //     const i = crearElemento("i", {class: "bi bi-hourglass"});
        //     elemento.setAttribute("class", "btn btn-sm btn-info");
        //     elemento.setAttribute("style", "pointer-events: none");
        //     elemento.append(i, " Confirmar");
        // } else if (registro.estado_r >= 1 && registro.estado_r  == registro.estado_t) {
        //     const i = crearElemento("i", {class: "bi bi-hand-thumbs-down-fill"});
        //     elemento.setAttribute("class", "btn btn-sm btn-danger");
        //     elemento.setAttribute("style", "pointer-events: none");
        //     elemento.append(i, " Rechazado");
        // } 
    }
}
