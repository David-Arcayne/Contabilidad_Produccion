import { crearElemento } from "../../../funciones/Funciones.js";

/**
 * Muestra el Archivo del contrato.
 */
export const Contratos = ({ elemento, registro}) => {
    if (registro.contratopdf === null) {
        elemento.innerHTML = "-";
        return;        
    }
    const i = crearElemento("i", {class: "bi bi-file-earmark-pdf-fill"});
    const btnPDF = crearElemento("a", {class: "btn btn-sm btn-primary border border-dark", title: "PDF Contrato", href: `./archivos/seguros/${registro.contratopdf}`, target: "_blank"}, [i]);
    elemento.appendChild(btnPDF);
}
        