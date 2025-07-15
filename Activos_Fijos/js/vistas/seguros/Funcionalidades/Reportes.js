import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { obtenerDatosAlr, solicitudPDF, rellenarSelect, limpiarFormulario } from "../../../funciones/Solicitudes.js";
import { BotonPDF, VistaPDF } from "../../../funciones/VistaPDF.js";
import { ContenidoPDF } from "./ContenidoPDF.js";

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
export const Reportes = (datosVista) => {
    const {
        contenidoTabla,
        elementoTBody,
        URL,
        registrosPropios,
        vistaPrincipal,
        vistaActivosFijos,
        estiloTd,
    } = datosVista ;
    
    return () => {
        const divContenedor = crearElemento("div", {class: "pb-2"});
        const iconoRecarga = crearElemento("i", {class: "bi bi-arrow-clockwise"});
        const iconoReporte = crearElemento("i", {class: "bi bi-file-earmark-text-fill"});
        const iconoLista = crearElemento("i", {class: "bi bi-list-columns-reverse"});
        const btnRecargar = crearElemento("button", {class: "btn btn-success", title: "Recargar tabla"}, [iconoRecarga]);
        const btnReportes = crearElemento("button", {class: "btn btn-primary"}, [iconoReporte, " Reportes"]);
        const btnActivoFijos = crearElemento("button", {class: "btn btn-primary"}, [iconoLista, " Activos Fijos"]);
        const contenedorBusqueda = crearElemento("div", {class: "text-end"}, [btnRecargar, " ", btnReportes, " ", btnActivoFijos]);

        // Cración de formulario para reportes 
        const contenidoReportes = crearElemento("div", {style: "display: none;"});
        contenidoReportes.innerHTML = `
            <form>
                <div class="row justify-content-end gy-2 gx-2 pt-2">
                    <div class="col-auto text-end mt-2">
                        <button id="btn_pdf" target="_blank" class="btn btn-info rounded-1 h-100" data-btn-vp="btn_vista_previa" title="Vista previa">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
                            Vista previa
                        </button>
                    </div>
                    <div class="col-auto">
                        <div class="input-group input-group-sm">
                            <select class="form-select af-slz-auto" id="poliza_select_estado" name="estado_seguro">
                            </select>
                            <label class="input-group-text" for="poliza_select_estado">Estado seguro</label>
                        </div>
                    </div>
                </div>
            </form>`;


        
        divContenedor.append(contenedorBusqueda, contenidoReportes);

        agregarEventos({
            btnRecargar,
            btnReportes,
            btnActivoFijos,
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
            btnActivoFijos,
            contenidoReportes,
        } = elementos;
        
        let parametroUrl = [];
        
        const formReportes = contenidoReportes.querySelector("form");

        btnReportes.addEventListener("click", (e) => {
            
            if (contenidoReportes.style.display === "none") {
                contenidoReportes.style.display = "block";
            } else {
                contenidoReportes.style.display = "none";
                formReportes.reset();
            }
        });

        btnActivoFijos.addEventListener("click", (e) => {
            cambiarVista(vistaPrincipal, vistaActivosFijos);
        });

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
                contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody, registrosPropios);
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
                contenidoTBody(res, {contenido: contenidoTabla, estiloTd}, elementoTBody, registrosPropios)
            })
            .catch(error => {
                console.log("Error:: ", error);
            })
        }

        const selectEstado = contenidoReportes.querySelector("#poliza_select_estado");
        const sEstado = {datos: [{id: 1, nombre: "Vigentes"}, {id: 2, nombre: "Vencidos"}], origen: "", llaves: { id: "id", detalle: "nombre" } };
        const accionEstado = async() => { recargarTabla(); };
        rellenarSelect(selectEstado, sEstado, undefined, {accion: accionEstado});


        // const btnEstado = contenidoReportes.querySelector("#btn_estado");

        // btnEstado.addEventListener("click", async (e) => {
        //     e.preventDefault();
        //     let valor = selectEstado.value;
        //     if (valor) {
        //         parametroUrl.length = 0;
        //         parametroUrl.push(`estado=${valor}`);
        //         const recargarTabla = (registros) => {
        //             contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody, registrosPropios);
        //         }
        //         obtenerDatosAlr(`${URL}/estado?estado=${valor}`, {error: "Error", accion: recargarTabla});
        //     }
        // });

        const btnPDF = contenidoReportes.querySelector("#btn_pdf")
        const elementosModal = VistaPDF("Póliza", [`${URL}/reporte-pdf`, "POST", formulario, undefined, true, extra, "poliza"], "Letter-L");
        const btnModal = BotonPDF(elementosModal, ContenidoPDF(`${URL}/reporte`, formulario, extra));
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
                case "estado_seguro":
                    let select = formulario.querySelector("#poliza_select_estado");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "estado seguro", valor : opcion.textContent });
                    break;
                default:
                    break;
            }
        }
    }

    const datoExtra = JSON.stringify(data);
    return datoExtra;
}