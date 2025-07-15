import { crearElemento } from "../../../funciones/Funciones.js";

/**
 * Crea un formulario con un boton para descargar un archivo Excel
 * @returns {HTMLElement}
 */
export const btnExportarExcel = () => {
    const icono = crearElemento("i", {class: "bi bi-download pe-1"});
    const boton = crearElemento("button", {class: "btn btn-success ms-0"}, [icono, " Exportar a EXCEL"])
    const formulario = crearElemento("form", {action: "./api/activo-fijo/export-excel", method: "GET"}, [boton]);

    return formulario; 
}


export const btnExcelFormat = () => {
    const icono = crearElemento("i", {class: "bi bi-file-earmark-arrow-down"});
    const boton = crearElemento("button", {class: "btn btn-success ms-0", title: "descargar formato"}, [icono]);
    const formulario = crearElemento("form", {action: "./api/activo-fijo/formato-excel", method: "GET"}, [boton]);

    return formulario; 
}

