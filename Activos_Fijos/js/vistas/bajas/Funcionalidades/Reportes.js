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
                        <div class="input-group input-group-sm h-100">
                            <select class="form-select af-slz-auto" id="bajas_select_categoria" name="categoria_id">
                            </select>
                            <label class="input-group-text" for="bajas_select_categoria">Categoría</label>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="input-group input-group-sm h-100">
                            <select class="form-select af-slz-auto" id="bajas_select_a_i" name="altasbajas">
                            </select>
                            <label class="input-group-text" for="bajas_select_a_i">Altas/Bajas</label>
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
            obtenerDatosAlr(`${URL}/${objAFTI.tipo_inventario}`, {error: "Error", accion: recargarTabla});
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
                obtenerDatosAlr(`${URL}/buscar/${value}`, {error: "Error", accion: recargarTabla});
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
            fetch(`${URL}/reporte/${objAFTI.tipo_inventario}`, {
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

        const selectCategoria = contenidoReportes.querySelector("#bajas_select_categoria");
        const sCategorias = { origen: "./api/categoria/activos", llaves: { id: "id", detalle: "nombre" } }
        const accionCategoria = async() => { recargarTabla(); };
        rellenarSelect(selectCategoria, sCategorias, undefined, {accion: accionCategoria});
        
        const selectAcIn = contenidoReportes.querySelector("#bajas_select_a_i");
        const sAcIn = {datos: [{id: 1, nombre: "Activos"}, {id: 2, nombre: "Inactivos"}], origen: "", llaves: { id: "id", detalle: "nombre" } };
        const accionAcIn = async(value) => { 
            recargarTabla();

            const divTabla = elementoTBody.closest(".table-responsive");
            const divPadre = divTabla.parentElement;

            if (value === "2") {
                const icono = crearElemento("i", {class: "pe-2 bi bi-exclamation-triangle-fill"});
                const p = crearElemento("p", {class: "m-0"}, [icono, " Nota: Listado de bienes, dados de baja al 100% de su cantidad"]);
                const divAlert = crearElemento("div", {style: "background-color: #FFF3CF", class: "rounded py-2 px-3 mb-2 border border-warning fw-bold text-warning-emphasis", id: "info_2_baja"}, [p]);
                divPadre.insertBefore(divAlert, divTabla);
            }else {
                const divAlert = divPadre.querySelector("#info_2_baja");
                if (divAlert) {
                    divAlert.remove();
                }
            }
         };
        rellenarSelect(selectAcIn, sAcIn, undefined, {accion: accionAcIn});

        const btnPDF = contenidoReportes.querySelector("#btn_pdf")
        const fnURL = () => `${URL}/reporte-pdf/${JSON.parse(sessionStorage.getItem("af_tipo_inventario")).tipo_inventario}`;
        const elementosModal = VistaPDF("Bajas", [fnURL, "POST", formulario, undefined, true, extra, "bajas"], "Letter-L");
        const btnModal = BotonPDF(elementosModal, ContenidoPDF(formulario, extra));
        btnModal(btnPDF);
        // btnPDF.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
        //     solicitudPDF(`${URL}/reporte-pdf/${objAFTI.tipo_inventario}`, "POST", formulario, undefined, true, extra);
        // });
    }
}

const extra = (cuerpo, formulario) => {
    let data = [];
    for(let [clave, valor] of cuerpo) {
        if (!(valor.trim() === "")) {
            switch (clave) {
                case "categoria_id":
                    let select = formulario.querySelector("#bajas_select_categoria");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "categoría", valor : opcion.textContent });
                    break;
                case "altasbajas":{
                    let select = formulario.querySelector("#bajas_select_a_i");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "altas/bajas", valor : opcion.textContent });
                    break;
                }
                default:
                    break;
            }
        }
    }

    const datoExtra = JSON.stringify(data);
    return datoExtra;
}