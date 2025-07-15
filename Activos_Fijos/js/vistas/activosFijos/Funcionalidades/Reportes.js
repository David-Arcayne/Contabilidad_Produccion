import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { obtenerDatosAlr, solicitudPDF, rellenarSelect, limpiarFormulario } from "../../../funciones/Solicitudes.js";
import { BotonPDF, VistaPDF } from "../../../funciones/VistaPDF.js";
import { ContenidoPDF } from "./ContenidoPDF.js";

/**
 * Crea un formulario de reportes y busqueda.
 * @param {Object} datosVista - Opciones requeridas para la creación del formulario.
 * @param {(string | Object)[]} datosVista.contenidoTabla - Array con las claves de registro.
 * @param {HTMLElement} datosVista.elementoTBody - Elemento del cuerpo de la tabla.
 * @param {string} datosVista.URL - URL principal.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns 
 */
export const BusquedaYReportes = (datosVista) => {
    const {
        contenidoTabla,
        elementoTBody,
        URL,
        estiloTd,
    } = datosVista ;
    
    return () => {
        // Cración de formulario para reportes 
        const formulario = crearElemento("form");
        formulario.innerHTML = `
                <div class="row justify-content-end gy-2 gx-2 pt-2">
                    <div class="col-auto">
                        <button class="btn btn-success h-100" title="Recargar tabla" id="recargar"><i class="bi bi-arrow-clockwise"></i></button>
                    </div>
                    <div class="col-auto">
                        <button id="btn_pdf" target="_blank" class="btn btn-info rounded-1 h-100" data-btn-vp="btn_vista_previa" title="Vista previa">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
                            Vista previa
                        </button>
                    </div>
                    <div class="col-auto">
                        <div class="input-group input-group-sm">
                            <select class="form-select af-slz-auto" id="altas_select_categoria" name="categoria_id">
                            </select>
                            <label class="input-group-text" for="altas_select_categoria"> Categoría</label>
                        </div>
                    </div>
                </div>`;

        
        let parametroUrl = [];
        funcionamientoRecarga(formulario, parametroUrl);
        funcionamientoReportes(formulario, parametroUrl);        
        // funcionamientoBuscar(formulario, parametroUrl);

        const divContenedor = crearElemento("div", {class: "pb-2"});
        divContenedor.append(formulario);
    
        return divContenedor;
    }

    /**
     * Vuelve a cargar los registros de la tabla y limpia el formulario de reportes/busqueda al hacer click en el boton
     * @param {Object.<string, Node>} elementos - Elementos requeridos para el boton recargar
     * @param {string[]} parametroUrl - Parametro para el tipo de reporte PDF requerido
     */
    function funcionamientoRecarga(elemento, parametroUrl) {
        const btnRecargar = elemento.querySelector("#recargar");

        btnRecargar.addEventListener("click", async(e) => {
            e.preventDefault();
            parametroUrl.length = 0;
            limpiarFormulario(elemento);
            const recargarTabla = (registros) => {
                contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody);
            }
            const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
            obtenerDatosAlr(`${URL}/habilitados/${objAFTI.tipo_inventario}`, {error: "Error", accion: recargarTabla});
        });
    }

    /**
     * Agrega la funcionalidad de busqueda y carga la tabla con el contenido requerido 
     * @param {Object.<string, Node>} elementos - Elementos requeridos para el boton buscar
     * @param {string[]} parametroUrl - Parametro para el tipo de reporte PDF requerido
     */
    function funcionamientoBuscar(formulario, parametroUrl) {
        const inputBuscar = formulario.querySelector("#input_buscar");
        const selectCategoria = formulario.querySelector("#select_categoria");

        const btnBuscar = formulario.querySelector("#btn_buscar");
        btnBuscar.addEventListener("click", async (e) => {
            e.preventDefault();
            let value = inputBuscar.value.trim();
            if (value && value != "0") {
                $(selectCategoria)[0].selectize.clear();

                const recargarTabla = (registros) => {
                    contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody);
                }
                obtenerDatosAlr(`${URL}/buscar/${value}?altas=1`, {error: "Error", accion: recargarTabla});
                parametroUrl.length = 0;
            }
        });
    }

    /**
     * Agrega la funcionalidad a los formularios de Reportes para carga la tabla con el contenido requerido y PDF.
     * @param {HTMLElement} contenidoReportes - Elemento que contine los formularios de reporte
     * @param {string[]} parametroUrl - Parametro para el tipo de reporte PDF requerido
     */
    function funcionamientoReportes(contenidoReportes, parametroUrl) {
        const formulario = contenidoReportes;
        const recargarTabla = () => {
            const cuerpo = new FormData(formulario);
            const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
            fetch(`${URL}/altas/reporte/${objAFTI.tipo_inventario}`, {
                method:"POST",
                body: cuerpo
            })
            .then(res => res.json())
            .then(res => {
                contenidoTBody(res, {contenido: contenidoTabla, estiloTd}, elementoTBody)
            })
            .catch(error => {
                console.log("Error:: ", error);
            })
        }

        // const filtrar = (valor) => {
        //     const recargarTabla = (registros) => {
        //         contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody);
        //     }
        //     if (valor) {
        //         obtenerDatosAlr(`${URL}/reporte?categorias=${valor}&altas=1`, {error: "Error", accion: recargarTabla});
        //         parametroUrl.length = 0;
        //         parametroUrl.push(`categorias=${valor}`);

        //     } else {
        //         obtenerDatosAlr(`${URL}/habilitados`, {error: "Error", accion: recargarTabla});
        //         parametroUrl.length = 0;
        //     }
        // }

        const selectCategoria = contenidoReportes.querySelector("#altas_select_categoria");
        const sCategorias = { origen: "./api/categoria/activos", llaves: { id: "id", detalle: "nombre" } }
        const accionCategoria = async() => { recargarTabla(); };
        rellenarSelect(selectCategoria, sCategorias, undefined, {accion: accionCategoria});

        const btnPDF = contenidoReportes.querySelector("#btn_pdf")

        // btnPDF.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     if (parametroUrl.length === 1) {
        //         solicitudPDF(`${URL}/reporte-pdf?${parametroUrl[0]}&altas=1`, "GET");
        //     } else {
        //         solicitudPDF(`${URL}/reporte-pdf?altas=1`, "GET");
        //     }
        // });
        const fnURL = () => `${URL}/altas/reporte-pdf/${JSON.parse(sessionStorage.getItem("af_tipo_inventario")).tipo_inventario}`;
        const elementosModal = VistaPDF("Altas", [fnURL, "POST", formulario, undefined, true, extra, "altas"], "Letter-L");
        const btnModal = BotonPDF(elementosModal, ContenidoPDF(formulario, extra));
        btnModal(btnPDF);
        // btnPDF.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
        //     solicitudPDF(`${URL}/altas/reporte-pdf/${objAFTI.tipo_inventario}`, "POST", formulario, undefined, true, extra);
        // });
    }
}

const extra = (cuerpo, formulario) => {
    let data = [];
    for(let [clave, valor] of cuerpo) {
        if (!(valor.trim() === "")) {
            switch (clave) {
                case "categoria_id":
                    let select = formulario.querySelector("#altas_select_categoria");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "categoría", valor : opcion.textContent });
                    break;
                default:
                    break;
            }
        }
    }

    const datoExtra = JSON.stringify(data);
    return datoExtra;
}