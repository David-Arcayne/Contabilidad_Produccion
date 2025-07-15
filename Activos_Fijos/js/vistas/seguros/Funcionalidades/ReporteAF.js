import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { obtenerDatosAlr, solicitudPDF, rellenarSelect, limpiarFormulario } from "../../../funciones/Solicitudes.js";
import { BotonPDF, VistaPDF } from "../../../funciones/VistaPDF.js";
import { ActivosFjosPDF } from "./ContenidoPDF.js";

/**
 * Crea un formulario de reportes.
 * @param {Object} datosVista - Opciones requeridas para la creación del formulario.
 * @param {(string | Object)[]} datosVista.contenidoTabla - Array con las claves de registro.
 * @param {HTMLElement} datosVista.elementoTBody - Elemento del cuerpo de la tabla.
 * @param {string} datosVista.URL - URL principal.
 * @param {Object.<string, {clave:string, valor:string}[]>} [datosVista.registrosPropios] - Opciones de "select" propios (no API).
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns 
 */
export const ReportesAF = (datosVista) => {
    const {
        contenidoTabla,
        elementoTBody,
        URL,
        estiloTd,
    } = datosVista ;
    
    return () => {
        const divContenedor = crearElemento("div", {class: "pb-2"});
        const iconoRecarga = crearElemento("i", {class: "bi bi-arrow-clockwise"});
        const btnRecargar = crearElemento("button", {class: "btn btn-success", title: "Recargar tabla"}, [iconoRecarga]);
        const contenedorBusqueda = crearElemento("div", {class: "text-end"}, [btnRecargar]);

        // Cración de formulario para reportes 
        const contenidoReportes = crearElemento("div");
        contenidoReportes.innerHTML = `
            <form>
                <div class="row justify-content-end g-2 pt-2">
                    <div class="col-auto text-end mt-2">
                        <button id="btn_pdf" target="_blank" class="btn btn-info rounded-1 h-100" data-btn-vp="btn_vista_previa" title="Seguros AF (Vista previa)">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
                            Vista previa
                        </button>
                    </div>
                    <div class="col-auto">
                        <div class="input-group input-group-sm h-100">
                            <select class="form-select af-slz-auto" id="s_af_seguro" name="af_seguro">
                                <option value="">-- Elija una opción --</option>
                                <option value="1">Con seguro</option>
                                <option value="0">Sin seguro</option>
                            </select>
                            <label class="input-group-text" for="s_af_seguro" type="button">Activo fijo</label>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="input-group input-group-sm h-100">
                            <select class="form-select af-slz-auto" id="s_tiposeguro" name="tiposeguro_id">
                            </select>
                            <label class="input-group-text" for="s_tiposeguro" type="button">Tipo Seguro</label>
                        </div>
                    </div>
                </div>
            </form>`;


        
        divContenedor.append(contenedorBusqueda, contenidoReportes);

        agregarEventos({
            btnRecargar,
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
            contenidoReportes,
        } = elementos;
        
        let parametroUrl = [];
        
        const formReportes = contenidoReportes.querySelector("form");

        funcionamientoRecarga({btnRecargar, formReportes}, parametroUrl);
        funcionamientoReportes(contenidoReportes, parametroUrl);
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
            limpiarFormulario(formReportes);
            const recargarTabla = (registros) => {
                contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody);
            }
            obtenerDatosAlr(`${URL}`, {error: "Error", accion: recargarTabla});
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
            const cuerpo = new FormData(formulario);
            fetch(`${URL}/reporte`, {
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

        const selectAF = contenidoReportes.querySelector("#s_af_seguro");
        const sEstado = {datos: [{id: 1, nombre: "Con seguro"}, {id: 2, nombre: "Sin seguro"}], origen: "", llaves: { id: "id", detalle: "nombre" } };
        const accionAF = async() => { recargarTabla(); };
        rellenarSelect(selectAF, sEstado, undefined, {accion: accionAF});
        
        const selectTipoSeguro = contenidoReportes.querySelector("#s_tiposeguro");
        const sTipoSeguro = { origen: "./api/tipo-seguro/activos", llaves: { id: "id", detalle: "nombre" } }
        const accionTiposeguro = async() => { recargarTabla(); };
        rellenarSelect(selectTipoSeguro, sTipoSeguro, undefined, {accion: accionTiposeguro});

        // btnTipoSeguro.addEventListener("click", async (e) => {
        //   e.preventDefault();
        //   let valor = selectTipoSeguro.value;
        //   if (valor) {
        //     parametroUrl.length = 0;
        //     selectAF.value = "";
        //     parametroUrl.push(`tiposeguro_id=${valor}`);
        //     const recargarTabla = (registros) => {
        //       contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody);
        //     }
        //     obtenerDatosAlr(`${URL}?tiposeguro_id=${valor}`, {error: "Error", accion: recargarTabla});
        //   }
        // });
        
        // btnAF.addEventListener("click", async (e) => {
        //     e.preventDefault();
        //     let valor = selectAF.value;
        //     if (valor) {
        //         parametroUrl.length = 0;
        //         selectTipoSeguro.value = "";
        //         parametroUrl.push(`asegurado=${valor}`);
        //         const recargarTabla = (registros) => {
        //             contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody);
        //         }
        //         obtenerDatosAlr(`${URL}?asegurado=${valor}`, {error: "Error", accion: recargarTabla});
        //     }
        // });

        const btnPDF = contenidoReportes.querySelector("#btn_pdf")
        const elementosModal = VistaPDF("Póliza - AF", [`${URL}/reporte-pdf`, "POST", formulario, undefined, true, extra, "poliza-activosfijos"], "Letter-L");
        const btnModal = BotonPDF(elementosModal, ActivosFjosPDF(`${URL}/reporte`, formulario, extra));
        btnModal(btnPDF);
        // btnPDF.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     solicitudPDF(`${URL}/reporte-pdf`, "POST", formulario, undefined, true, extra);
        // });
    }
}

const extra = (cuerpo, formulario) => {
    let data = [];
    for(let [clave, valor] of cuerpo) {
        if (!(valor.trim() === "")) {
            switch (clave) {
                case "af_seguro": {
                    let select = formulario.querySelector("#s_af_seguro");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "seguro", valor : opcion.textContent });
                    break;
                }
                case "tiposeguro_id": {
                    let select = formulario.querySelector("#s_tiposeguro");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "tipo de seguro", valor : opcion.textContent });
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