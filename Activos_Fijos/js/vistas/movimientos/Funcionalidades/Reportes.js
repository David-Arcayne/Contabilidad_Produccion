import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { obtenerDatosAlr, solicitudPDF, rellenarSelect, limpiarFormulario } from "../../../funciones/Solicitudes.js";

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
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm">
                            <label class="input-group-text" for="sucursal">Sucursal</label>
                            <select class="form-select " id="sucursal" aria-label="campo de filtro" name="sucursal_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm">
                            <label class="input-group-text" for="areatrabajo">Área T.</label>
                            <select class="form-select " id="areatrabajo" aria-label="campo de filtro" name="areatrabajo_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm">
                            <label class="input-group-text" for="responsable">Personal</label>
                            <select class="form-select " id="responsable" aria-label="campo de filtro" name="responsable_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="input-group input-group-sm">
                            <label class="input-group-text" for="estado">Estado</label>
                            <select class="form-select" id="estado" aria-label="campo de filtro" name="estado_id">
                                <option value>-- No hay registros --</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-auto">
                        <button id="btn_pdf" target="_blank" class="btn btn-danger rounded-1 px-4" title="Historial (PDF)">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
                            PDF
                        </button>
                    </div>
                    <div class="col-auto">
                        <button id="btn-pdf-personal" target="_blank" class="btn btn-info rounded-1 px-4 d-none" title="(PDF) Personal">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
                            PDF Trabajador
                        </button>
                    </div>
                    <div class="col-auto">
                        <button id="btn-pdf-nosolicitados" target="_blank" class="btn btn-info rounded-1 px-4 d-none" title="(PDF) Activos fijos no asignados">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
                            PDF no solicitados
                        </button>
                    </div>
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
            const recargarTabla = (registros) => {
                contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, elementoTBody);
            }
            obtenerDatosAlr(URL, {error: "Error", accion: recargarTabla});
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
            fetch(`${URL}/filtro`, {
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
        const accionResponsable = async(valor) => { 
            recargarTabla(); 
            const btnPersonal = contenidoReportes.querySelector("#btn-pdf-personal");
            if (valor) {
                btnPersonal.classList.remove("d-none");
            } else {
                btnPersonal.classList.add("d-none");
            }
        };
        rellenarSelect(selectResponsable, sResponsable, undefined, {accion: accionResponsable});
        
        const selectEstado = contenidoReportes.querySelector("#estado");
        const sEstado = {datos: [{id: 1, nombre: "Asignados"}, {id: 3, nombre: "Rechazados"}/*, {id: 5, nombre: "No solicitados"}*/], origen: "", llaves: { id: "id", detalle: "nombre" } }
        const accionEstado = async(valor) => { 
            const btnNoSolicitados = contenidoReportes.querySelector("#btn-pdf-nosolicitados");
            if (valor == 5) {
                    btnNoSolicitados.classList.remove("d-none");
            } else {
                btnNoSolicitados.classList.add("d-none");
                recargarTabla(); 
            }
        };
        rellenarSelect(selectEstado, sEstado, undefined, {accion: accionEstado});

        const btnPDF = contenidoReportes.querySelector("#btn_pdf")        
        btnPDF.addEventListener("click", (e) => {
            e.preventDefault();
            solicitudPDF(`${URL}/filtro-pdf`, "POST", formulario, undefined, true, extra);
        });

        const btnPersonal = contenidoReportes.querySelector("#btn-pdf-personal");
        btnPersonal.addEventListener("click", (e) => {
            e.preventDefault();
            solicitudPDF(`${URL}/filtro-pdfp`, "POST", formulario, undefined, true, extra);
        });
        
        const btnNoSolicitados = contenidoReportes.querySelector("#btn-pdf-nosolicitados");
        btnNoSolicitados.addEventListener("click", (e) => {
            e.preventDefault();
            solicitudPDF(`${URL}/no-solicitados`, "POST", formulario, undefined, true);
        });
    }
}

const extra = (cuerpo, formulario) => {
    let data = [];
    for(let [clave, valor] of cuerpo) {
        if (!(valor.trim() === "")) {
            switch (clave) {
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