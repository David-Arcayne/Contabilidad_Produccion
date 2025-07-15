import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento, ErrorTabla, SpinnerRow } from "../../../funciones/Funciones.js";
import { Scanner } from "../../../funciones/Scanner.js";
import { obtenerDatosAlr, solicitudPDF, rellenarSelect, limpiarFormulario } from "../../../funciones/Solicitudes.js";
import { BotonPDF, VistaPDF } from "../../../funciones/VistaPDF.js";
import { ContenidoPDF } from "./ContenidoPDF.js";

/**
 * Crea un formulario de reportes.
 * @param {Object} datosVista - Opciones requeridas para la creación del formulario.
 * @param {(string | Object)[]} datosVista.contenidoTabla - Array con las claves de registro.
 * @param {HTMLElement} datosVista.elementoTBody - Elemento del cuerpo de la tabla.
 * @param {string} datosVista.URL - URL principal.
 * @param {string} datosVista.inventarioId - Id del inventario.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns 
 */
export const Reportes = (datosVista) => {
    const {
        contenidoTabla,
        elementoTBody,
        URL,
        inventarioId,
        estiloTd,
    } = datosVista ;
    
    return () => {
        const divContenedor = crearElemento("div", {class: "pb-2"});
        const iconoRecarga = crearElemento("i", {class: "bi bi-arrow-clockwise"});
        const iconoReporte = crearElemento("i", {class: "bi bi-file-earmark-text-fill"});
        const iconoScanner = crearElemento("i", {class: "bi bi-webcam-fill"});
        const btnRecargar = crearElemento("button", {class: "btn btn-success", title: "Recargar tabla"}, [iconoRecarga]);
        const btnReportes = crearElemento("button", {class: "btn btn-primary"}, [iconoReporte, " Reportes"]);
        const btnScanner = crearElemento("button", {class: "btn btn-primary"}, [iconoScanner, " Scanner"]);
        const contenedorBusqueda = crearElemento("div", {class: "text-end"}, [btnRecargar, " ", btnScanner, " ", btnReportes]);

        // Cración de formulario para reportes 
        const contenidoReportes = crearElemento("div", {style: "display: none;"});
        contenidoReportes.innerHTML = `
            <form>
                <div class="row justify-content-end gy-2 gx-2 p-0 pt-2">
                    
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="region">Región</label>
                            <select class="form-select" id="region" aria-label="campo de filtro" name="region_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="areatrabajo">Área T.</label>
                            <select class="form-select" id="areatrabajo" aria-label="campo de filtro" name="areatrabajo_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="areatrabajo">Categoría</label>
                            <select class="form-select" id="categoria" aria-label="campo de filtro" name="categoria_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="areatrabajo">Estado</label>
                            <select class="form-select" id="estado" aria-label="campo de filtro" name="estado_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-auto text-end mt-2">
                        <button id="btn_pdf" target="_blank" class="btn btn-info rounded-1 px-4 h-100" data-btn-vp="btn_vista_previa" title="Vista previa">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
                            Vista previa
                        </button>
                    </div>
                </div>
            </form>`;

        const modalScanner = Scanner();
        const contenidoScanner = crearElemento("div", undefined, [modalScanner]);
        divContenedor.append(contenedorBusqueda, contenidoReportes, contenidoScanner);

        abrirScanner(btnScanner, modalScanner);

        agregarEventos({
            btnRecargar,
            btnReportes,
            contenidoReportes,
        })
        return divContenedor;
    }

    /**
     * Agrega evetos "click" para ocultar y mostrar elementos de reportes
     * @param {Object.<string, Node>} elementos - Botones y elementos contenedores de reportes
     */
    function agregarEventos(elementos) {
        const {
            btnRecargar,
            btnReportes,
            contenidoReportes,
        } = elementos;
        
        let parametroUrl = [];
        
        const formReportes = contenidoReportes.querySelector("form");

        btnReportes.addEventListener("click", (e) => {
            
            if (contenidoReportes.style.display === "none") {
                contenidoReportes.style.display = "block";
            } else {
                contenidoReportes.style.display = "none";
                limpiarFormulario(formReportes);
            }
        });

        funcionamientoRecarga({btnRecargar, formReportes}, parametroUrl);
        funcionamientoReportes(contenidoReportes, parametroUrl);
    }

    function abrirScanner(btnScanner, modalScanner) {
        btnScanner.addEventListener("click", (e) => {
            e.preventDefault();
            const modal = new bootstrap.Modal(modalScanner);
            modal.show();
        });
    }

    /**
     * Vuelve a cargar los registros de la tabla y limpia el formulario de reportes al hacer click en el boton
     * @param {Object.<string, Node>} elementos - Elementos requeridos para el boton recargar
     * @param {string[]} parametroUrl - Parametro para el tipo de reporte PDF requerido
     */
    function funcionamientoRecarga(elementos, parametroUrl) {
        const {
            btnRecargar,
            formReportes, 
        } = elementos;

        btnRecargar.addEventListener("click", async(e) => {
            parametroUrl.length = 0;
            limpiarFormulario(formReportes);
            SpinnerRow(elementoTBody);
            const recargarTabla = (registros) => {
                contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody);
            }
            obtenerDatosAlr(`${URL}/${inventarioId}`, {error: "Error", accion: recargarTabla});
        });
    }

    /**
     * Agrega la funcionalidad a los formularios de Reportes para carga la tabla con el contenido requerido y PDF.
     * @param {HTMLElement} contenidoReportes - Elemento que contine los formularios de reporte
     * @param {string[]} parametroUrl - Parametro para el tipo de reporte PDF requerido
     */
    function funcionamientoReportes(contenidoReportes, parametroUrl) {
        const formulario = contenidoReportes.querySelector("form");
        const recargarTabla = () => {
            SpinnerRow(elementoTBody);
            const cuerpo = new FormData(formulario);
            fetch(`${URL}/reporte/${inventarioId}`, {
                method:"POST",
                body: cuerpo
            })
            .then(res => res.json())
            .then(res => {
                contenidoTBody(res, {contenido: contenidoTabla, estiloTd}, elementoTBody)
            })
            .catch(error => {
                ErrorTabla(elementoTBody);
            })
        }

        const selectRegion = contenidoReportes.querySelector("#region");
        const sRegion = { origen: "./api/externo-region/activos", llaves: { id: "idregion", detalle: "nombre" } }
        const accionRegion = async(valor) => { recargarTabla(); };
        rellenarSelect(selectRegion, sRegion, undefined, {accion: accionRegion});
        
        const selectArea = contenidoReportes.querySelector("#areatrabajo");
        const sArea = { origen: "./api/externo-area/activos", llaves: { id: "idareas", detalle: "nombre" } }
        const accionArea = async(valor) => { recargarTabla(); };
        rellenarSelect(selectArea, sArea, undefined, {accion: accionArea});
        
        const selectCategoria = contenidoReportes.querySelector("#categoria");
        const sCategoria = { origen: "./api/categoria/activos", llaves: { id: "id", detalle: "nombre" } }
        const accionCategoria = async(valor) => { recargarTabla(); };
        rellenarSelect(selectCategoria, sCategoria, undefined, {accion: accionCategoria});
        
        const selectEstado = contenidoReportes.querySelector("#estado");
        const sEstado = { origen: "./api/tipo-estado/activos", llaves: { id: "id", detalle: "nombre" } }
        const accionEstado = async(valor) => { recargarTabla(); };
        rellenarSelect(selectEstado, sEstado, undefined, {accion: accionEstado});

        const btnPDF = contenidoReportes.querySelector("#btn_pdf")
        const elementosModal = VistaPDF("Planificar inventario", [`${URL}/reporte-pdf/${inventarioId}`, "POST", formulario, undefined, true, extra, "planificar_inventario"], "Letter-L");
        const btnModal = BotonPDF(elementosModal, ContenidoPDF(`${URL}/reporte/${inventarioId}`, formulario, extra));
        btnModal(btnPDF);
        // btnPDF.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     solicitudPDF(`${URL}/reporte-pdf/${inventarioId}`, "POST", formulario, undefined, true, extra);
        // });

        // btnPDF.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     if (parametroUrl.length === 1) {
        //         solicitudPDF(`${URL}/reporte-pdf/${inventarioId}?${parametroUrl[0]}`, "GET");
        //     } else {
        //         solicitudPDF(`${URL}/reporte-pdf/${inventarioId}`, "GET");
        //     }
        // });
    }
}

const extra = (cuerpo, formulario) => {
    let data = [];
    for(let [clave, valor] of cuerpo) {
        if (!(valor.trim() === "")) {
            switch (clave) {
                case "region_id":{
                    let select = formulario.querySelector("#region");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "región", valor : opcion.textContent });
                    break;
                }
                case "areatrabajo_id":{
                    let select = formulario.querySelector("#areatrabajo");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "area de trabajo", valor : opcion.textContent });
                    break;
                }
                case "categoria_id":{
                    let select = formulario.querySelector("#categoria");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "categoría", valor : opcion.textContent });
                    break;
                }
                case "estado_id":{
                    let select = formulario.querySelector("#estado");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "estado", valor : opcion.textContent });
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