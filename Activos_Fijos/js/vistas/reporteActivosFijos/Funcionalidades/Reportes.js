import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento, ErrorTabla, FormatoDate, SpinnerRow } from "../../../funciones/Funciones.js";
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
export const Reportes = (datosVista) => {
    const {
        contenidoTabla,
        elementoTBody,
        URL,
        estiloTd,
    } = datosVista ;
    
    return () => {
        const divContenedor = crearElemento("div", {class: "pb-2"});
        const iconoRecarga = crearElemento("i", {class: "bi bi-arrow-clockwise"});
        const iconoReporte = crearElemento("i", {class: "bi bi-file-earmark-text-fill"});
        const btnRecargar = crearElemento("button", {class: "btn btn-success", title: "Recargar tabla"}, [iconoRecarga]);
        const btnReportes = crearElemento("button", {class: "btn btn-primary"}, [iconoReporte, " Reportes"]);
        const contenedorFiltro = crearElemento("div", {class: "text-end"}, [btnRecargar, " ", btnReportes]);

        // Cración de formulario para reportes 
        const contenidoReportes = crearElemento("div", {style: "display: none;"});
        contenidoReportes.innerHTML = `
            <form>
                <div class="row justify-content-end gy-2 gx-2 p-0 pt-2">
                    <div class="row  justify-content-end p-0 m-0 pt-2">
                        <div class="col-auto">
                            <div class="input-group input-group-sm">
                                <label class="input-group-text" for="fecha_inicio">Fecha Inicio</label>
                                <input type="date" class="form-control" aria-label="campo de filtro" id="fecha_inicio" name="fecha_inicio">
                            </div>
                        </div>
                        <div class="col-auto">
                            <div class="input-group input-group-sm">
                                <input type="date" class="form-control" aria-label="campo de filtro" id="fecha_fin" name="fecha_fin">
                                <label class="input-group-text" for="fecha_fin">Fecha Fin</label>
                            </div>
                            
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="categoria">Categoría</label>
                            <select class="form-select " id="categoria" aria-label="campo de filtro" name="categoria_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="tipo_bien">Tipo Bien</label>
                            <select class="form-select " id="tipo_bien" aria-label="campo de filtro" name="tipobien_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="sucursal">Sucursal</label>
                            <select class="form-select " id="sucursal" aria-label="campo de filtro" name="sucursal_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="areatrabajo">Área T.</label>
                            <select class="form-select " id="areatrabajo" aria-label="campo de filtro" name="areatrabajo_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="responsable">Responsable</label>
                            <select class="form-select " id="responsable" aria-label="campo de filtro" name="responsable_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm h-100">
                            <label class="input-group-text" for="estado_af">Estado</label>
                            <select class="form-select" id="estado_af" aria-label="campo de filtro" name="estado_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="col text-end mt-2">
                    <button id="btn_pdf" target="_blank" class="btn btn-info rounded-1 px-4" data-btn-vp="btn_vista_previa" title="Vista previa">
                        <i class="bi bi-file-earmark-pdf-fill"></i>
                        Vista previa
                    </button>
                </div>
            </form>`;

        divContenedor.append(contenedorFiltro, contenidoReportes);

        agregarEventos({
            btnRecargar,
            btnReportes,
            contenidoReportes,
        })
        return divContenedor;
    }

    /**
     * Agrega evetos "click" para ocultar y mostrar elementos de reportes
     * @param {Object.<string, Node>} elementos - Botones y elementos contenedores de reportes y busqueda
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
                formReportes.reset();
            }
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
            parametroUrl.length = 0;
            limpiarFormulario(formReportes);
            SpinnerRow(elementoTBody);
            const recargarTabla = (registros) => {
                contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody);
            }
            obtenerDatosAlr(`${URL}/vista-reporte`, {error: "Error", accion: recargarTabla});
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
            fetch(`${URL}/filtros`, {
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

        const fechaInicio = contenidoReportes.querySelector("#fecha_inicio");
        fechaInicio.addEventListener("change", (e) => {
            const datoFecha = e.target.value;
            const fechaRx = /^(\d{1,2}\W\d{1,2}\W[1-3]\d{3}|[1-3]\d{3}\W\d{1,2}\W\d{1,2})$/;
            if (datoFecha.match(fechaRx)) recargarTabla();
        });
        fechaInicio.addEventListener("keydown", (e) => {
            const key = e.key;
            if (key === "Backspace" || key === "Delete") {
                e.target.value = "";
                recargarTabla();
            }
        });

        const fechaFin = contenidoReportes.querySelector("#fecha_fin");
        fechaFin.addEventListener("change", (e) => {
            const datoFecha = e.target.value;
            const fechaRx = /^(\d{1,2}\W\d{1,2}\W[1-3]\d{3}|[1-3]\d{3}\W\d{1,2}\W\d{1,2})$/;
            if (datoFecha.match(fechaRx)) recargarTabla();
        });
        fechaFin.addEventListener("keydown", (e) => {
            const key = e.key;
            if (key === "Backspace" || key === "Delete") {
                e.target.value = "";
                recargarTabla(); 
            }
        });
        
        const selectTipoBien = contenidoReportes.querySelector("#tipo_bien");
        const sTipoBien = { origen: "./api/tipo-bien/activos", llaves: { id: "id", detalle: "nombre" } }
        const accionTipoBien = async(valor) => { recargarTabla(); };
        rellenarSelect(selectTipoBien, sTipoBien, undefined, {accion: accionTipoBien});

        const selectCategoria = contenidoReportes.querySelector("#categoria");
        const sCategorias = { origen: "./api/categoria/activos", llaves: { id: "id", detalle: "nombre" } }
        const accionCategoria = async(valor) => {
            $(selectTipoBien)[0].selectize?.destroy();
            await rellenarSelect(selectTipoBien, {origen: `./api/tipo-bien/activos/${valor}`, llaves: { id: "id", detalle: "nombre" }}, undefined, {accion: accionTipoBien});
            recargarTabla();
        }
        rellenarSelect(selectCategoria, sCategorias, undefined, {accion: accionCategoria});

        // selectCategoria.addEventListener("change", (e) => {
        //     // if(e.target.value) {
        //         rellenarSelect(selectTipoBien, {origen: `./api/tipo-bien/activos/${e.target.value}`, llaves: { id: "id", detalle: "nombre" }})
        //     // } else {
        //     //     selectTipoBien.innerHTML = "<option value>-- No hay registros --</option>";
        //     // }
        // });

        const selectSucursal = contenidoReportes.querySelector("#sucursal");
        const sSucursal = { origen: "./api/externo-sucursal/activos", llaves: { id: "idsucursalcontable", detalle: "nombre" } }
        const accionSucursal = async(valor) => { recargarTabla(); };
        rellenarSelect(selectSucursal, sSucursal, undefined, {accion: accionSucursal});
        
        const selectArea = contenidoReportes.querySelector("#areatrabajo");
        const sArea = { origen: "./api/externo-area/activos", llaves: { id: "idareas", detalle: "nombre" } }
        const accionArea = async(valor) => { recargarTabla(); };
        rellenarSelect(selectArea, sArea, undefined, {accion: accionArea});
        
        const selectResponsable = contenidoReportes.querySelector("#responsable");
        const sResponsable = { origen: "./api/externo-encargado/activos", llaves: { id: "idtrabajador", detalle: "nombreapellido" } }
        const accionResponsable = async(valor) => { recargarTabla(); };
        rellenarSelect(selectResponsable, sResponsable, undefined, {accion: accionResponsable});

        const selectEstado = contenidoReportes.querySelector("#estado_af");
        const sEstado = {datos: [{id: 1, nombre: "Solicitados"}, {id: 2, nombre: "No solicitados"}], origen: "", llaves: { id: "id", detalle: "nombre" } }
        const accionEstado = async(valor) => { 
            const btnNoSolicitados = contenidoReportes.querySelector("#btn-pdf-nosolicitados");
            if (valor == 1) {
                $(selectTipoBien)[0].selectize.enable();
                $(selectCategoria)[0].selectize.enable();
                $(selectSucursal)[0].selectize.enable();
                $(selectArea)[0].selectize.enable();
                $(selectResponsable)[0].selectize.enable();
                recargarTabla(); 
            } else if(valor == 2){
                // btnNoSolicitados.classList.add("d-none");
                
                $(selectTipoBien)[0].selectize.disable();
                $(selectCategoria)[0].selectize.disable();
                $(selectSucursal)[0].selectize.disable();
                $(selectArea)[0].selectize.disable();
                $(selectResponsable)[0].selectize.disable();

                $(selectTipoBien)[0].selectize.clear();
                $(selectCategoria)[0].selectize.clear();
                $(selectSucursal)[0].selectize.clear();
                $(selectArea)[0].selectize.clear();
                $(selectResponsable)[0].selectize.clear();
                
                recargarTabla(); 
            } else {
                $(selectTipoBien)[0].selectize.enable();
                $(selectCategoria)[0].selectize.enable();
                $(selectSucursal)[0].selectize.enable();
                $(selectArea)[0].selectize.enable();
                $(selectResponsable)[0].selectize.enable();
                recargarTabla(); 
            }
        };
        rellenarSelect(selectEstado, sEstado, undefined, {accion: accionEstado});

        const btnPDF = contenidoReportes.querySelector("#btn_pdf")
        const elementosModal = VistaPDF("Reporte inventario", [`${URL}/filtros-pdf`, "POST", formulario, undefined, true, extra, "reporte_inventario"], "Letter-L");
        const btnModal = BotonPDF(elementosModal, ContenidoPDF(`${URL}/filtros`, formulario, extra));
        btnModal(btnPDF);
        // btnPDF.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     solicitudPDF(`${URL}/filtros-pdf`, "POST", formulario, undefined, true, extra);
        // });
    }
}

const extra = (cuerpo, formulario) => {
    let data = [];
    for(let [clave, valor] of cuerpo) {
        if (!(valor.trim() === "")) {
            switch (clave) {
                case "fecha_inicio":
                    data.push({ nombre: "fecha inicio", valor: FormatoDate(valor) });
                    break;
                case "fecha_fin":
                    data.push({ nombre: "fecha fin", valor: FormatoDate(valor) });
                    break;
                case "categoria_id":{
                    let select = formulario.querySelector("#categoria");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "categoría", valor : opcion.textContent });
                    break;
                }
                case "tipobien_id":{
                    let select = formulario.querySelector("#tipo_bien");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "tipo bien", valor : opcion.textContent });
                    break;
                }
                case "sucursal_id":{
                    let select = formulario.querySelector("#sucursal");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "sucursal", valor : opcion.textContent });
                    break;
                }
                case "areatrabajo_id":{
                    let select = formulario.querySelector("#areatrabajo");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "area de trabajo", valor : opcion.textContent });
                    break;
                }
                case "responsable_id":{
                    let select = formulario.querySelector("#responsable");
                    let opcion = select.querySelector(`option[value="${valor}"]`)
                    data.push({ nombre: "responsable", valor : opcion.textContent });
                    break;
                }
                case "estado_id":{
                    let select = formulario.querySelector("#estado_af");
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