import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { enviarDatosFormulario, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Crea un formulario para importar un archivo Excel
 * @param {Object} datosVista - Valores requeridos para el formulario
 * @param {HTMLDivElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas
 * @param {(string|Object)[]} datosVista.contenidoTabla - Array de claves de registro
 * @param {HTMLDivElement} datosVista.tBody - Cuerpo de la tabla
 * @param {string} datosVista.URL - URL principal
 * @param {HTMLDivElement} datosVista.vistaPrincipal - Elemento que contiene a la vista principal
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns 
 */
export const FormularioExcel = (datosVista) => {
    const {
        contenedorDeAlertas,
        contenidoTabla,
        tBody,
        URL,
        vistaPrincipal,
        estiloTd,
    } = datosVista;
    
    const icono = crearElemento("i", {class: "bi bi-box-arrow-in-right pe-1"});
    const boton = crearElemento("button", {class: "btn btn-success ms-0"}, [icono, " Importar EXCEL"]);

    boton.addEventListener("click", () => {
        // Crea un modal con un formulario
        const modalImportarExcel = () => {
            const innerDiv = crearElemento("div", {class: "inner-div"});
            const floatingDiv = crearElemento("div", {class: "floating-message text-center p-md-4"});
            
            const formulario = `<div >
                <h3 class="" >Cargar desde un archivo EXCEL</h3>
                <form class="row g-3 mx-3 mb-2 mt-0">
                    <input type="file" class="form-control" id="fa_excel" name="file" required>
                    <div class="invalid-feedback"></div>
                    <select id="fa_type" class="form-select" name="tipo" required>
                        <option value=""> - Elija una opción - </option>
                        <option value="1">Agregar</option>
                        <option value="2">Remplazar</option>
                    </select>
                    <div class="invalid-feedback"></div>
                    <div class="col">
                        <button class="btn btn-success" id="btn-enviar-formulario">Cargar EXCEL</button>
                        <a class="btn btn-secondary">Cancelar</a>
                    </div>
                </form>
            </div>`;
            floatingDiv.innerHTML = formulario;
            innerDiv.appendChild(floatingDiv);
            const cancelar = floatingDiv.querySelector(".btn-secondary");
            const elementoFormulario = floatingDiv.querySelector("form");

            // Preparación y envio de formulario y control de la respuesta
            elementoFormulario.addEventListener("submit", (e) => {
                e.preventDefault();
                const accionEnviar = async() => {
                    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
                    const listaDeRegistros = obtenerDatos(`${URL}/habilitados/${objAFTI.tipo_inventario}`);
                    await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
                    innerDiv.remove();
                    alertaDeExito(contenedorDeAlertas, "Registro exitoso")
                }
                const error = () => {
                    innerDiv.remove();
                    alertaDeError(contenedorDeAlertas, "Falló al momento de cargar registros del archivo")
                }
                
                const opciones = {
                    refForm: elementoFormulario,
                    myUrl: `${URL}/import-excel`,
                    redireccion: accionEnviar,
                    error: error
                }
                enviarDatosFormulario(opciones);  
            })
        
            // Elimina el modal si se hace click fuera del contendor de mensaje
            innerDiv.addEventListener('click', function(event) {
                if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
                    innerDiv.remove();
                }
            });
            
            return innerDiv;
        }
        
        vistaPrincipal.appendChild(modalImportarExcel())
    });

    return boton; 
}