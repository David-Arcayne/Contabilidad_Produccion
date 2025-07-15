import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { obtenerDatosAlr, solicitudPDF, rellenarSelect, limpiarFormulario } from "../../../funciones/Solicitudes.js";
import { BotonPDF, VistaPDF } from "../../../funciones/VistaPDF.js";
import { ContenidoPDF } from "./ContenidoPDF.js";

/**
 * Crea un formulario de reportes.
 * @param {Object} datosVista - Opciones requeridas para la creación del formulario.
 * @param {(string | Object)[]} datosVista.contenidoTabla - Array con las claves de registro.
 * @param {HTMLElement} datosVista.elementoTBody - Elemento del cuerpo de la tabla.
 * @param {string} datosVista.URL - URL principal.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns 
 */
export const Reportes = (datosVista) => {
    const {
        contenidoTabla,
        elementoTBody,
        URL,
        estiloTd,
        misOpciones,
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
                        <select class="form-select af-slz-auto" id="asg_dep_metodo" name="metodo_dep_id">
                        </select>
                        <label class="input-group-text" for="asg_dep_metodo"> Método</label>
                    </div>
                </div>
            </div>`;

        
        funcionamientoRecarga(formulario);
        funcionamientoReportes(formulario);        

        const divContenedor = crearElemento("div", {class: "pb-2"});
        divContenedor.append(formulario);
    
        return divContenedor;
    }

    /**
     * Vuelve a cargar los registros de la tabla y limpia el formulario de reportes/busqueda al hacer click en el boton
     * @param {Object.<string, Node>} elementos - Elementos requeridos para el boton recargar
     */
    function funcionamientoRecarga(elemento) {
        const btnRecargar = elemento.querySelector("#recargar");

        btnRecargar.addEventListener("click", async(e) => {
            e.preventDefault();
            limpiarFormulario(elemento);
            const recargarTabla = (registros) => {
                contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody, misOpciones);
            }
            obtenerDatosAlr(`${URL}`, {error: "Error", accion: recargarTabla});
        });
    }

    /**
     * Agrega la funcionalidad a los formularios de Reportes para carga la tabla con el contenido requerido y PDF.
     * @param {HTMLElement} contenidoReportes - Elemento que contine los formularios de reporte
     */
    function funcionamientoReportes(contenidoReportes) {
        const formulario = contenidoReportes;
        const recargarTabla = () => {
            const cuerpo = new FormData(formulario);
            fetch(`${URL}/reporte`, {
                method:"POST",
                body: cuerpo
            })
            .then(res => res.json())
            .then(res => {
                contenidoTBody(res, {contenido: contenidoTabla, estiloTd}, elementoTBody, misOpciones)
            })
            .catch(error => {
                console.log("Error:: ", error);
            })
        }

        const selectMetodo = contenidoReportes.querySelector("#asg_dep_metodo");
        const sMetodo = {datos: [{id: 1, nombre: "Línea recta"}, {id: 2, nombre: "Suma de dígitos"}, {id: 3, nombre: "Unidades Producción"}, {id: 11, nombre: "Ninguno"}], origen: "", llaves: { id: "id", detalle: "nombre" } };
        const accionMwtodo = async() => { recargarTabla(); };
        rellenarSelect(selectMetodo, sMetodo, undefined, {accion: accionMwtodo});

        const btnPDF = contenidoReportes.querySelector("#btn_pdf")
        const elementosModal = VistaPDF("Asignar depreciación", [`${URL}/reporte-pdf`, "POST", formulario, undefined, true, extra, "asignar_depreciacion"]);
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
                case "metodo_dep_id":
                    let select = formulario.querySelector("#asg_dep_metodo");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "método", valor : opcion.textContent });
                    break;
                default:
                    break;
            }
        }
    }

    const datoExtra = JSON.stringify(data);
    return datoExtra;
}