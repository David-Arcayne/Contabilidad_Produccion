import { AF_ENV } from "../../../../db/environment.js";
import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
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
export const RegistroExcel = (datosVista) => {
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
                    <input type="file" class="form-control" id="tc_excel" name="file" required>
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

            const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
            const enviados = [0, 0, 0, 0];
            function enviarFilaALaAPI(fecha, ufv, dolar) {
                const datosPost = new FormData();
                datosPost.append('fecha', fecha);
                datosPost.append('ufv', ufv);
                datosPost.append('dolar', dolar);
                datosPost.append('ver', 'registrotipodecambio');
                datosPost.append('empresa', empresa_id);
                fetch(`${AF_ENV.apiUrl}/app/ct/api/`, {
                    method: 'POST',
                    body: datosPost
                })
                .then(response => {
                    enviados[2] = enviados[2] + 1;
                    if (response.ok) {
                        enviados[1] = enviados[1] + 1;
                        console.log('Datos enviados a la API');
                    } else {
                        console.error('Error al enviar datos a la API');
                    }
                })
                .catch(error => {
                    enviados[2] = enviados[2] + 1;
                    console.error('Error:', error);
                });
            }

            function enviarDatosALaAPI() {
                let intervalo = setInterval(async function() {
                    if (enviados[2] === enviados[0]) {
                        if (enviados[0] == enviados[1]) {
                            let listaDeRegistros = await obtenerDatos(`${URL}/listatipodecambio/${empresa_id}`);
                            listaDeRegistros = {data: listaDeRegistros};
                            contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
                            alertaDeExito(contenedorDeAlertas, "Registros guardados exitosamente");
                        } else if (enviados[1] === 0) {
                            alertaDeError(contenedorDeAlertas, "Error al guardar registros");
                        } else {
                            alertaDeAdvertencia(contenedorDeAlertas, "Ocurrío un error al guardar algunos registros");
                        }
                        innerDiv.remove();
                        clearInterval(intervalo);
                    } else {
                        console.log("esperando");
                    }
                }, 1000); // Intervalo de 1000 milisegundos (1 segundo)
            }

            // Función para leer el archivo Excel como CSV
            async function leerArchivoExcel(archivo) {

                let listaDeRegistros = await obtenerDatos(`${URL}/listatipodecambio/${empresa_id}`);
                const fechasExistentes = listaDeRegistros.map(registro => registro.fecha);

                const nombreArchivo = archivo.name;
                const extension = nombreArchivo.split('.').pop().toLowerCase();
                if (extension ==="csv") {
                    let lector = new FileReader();
                    lector.onload = async function(evento) {
                        const contenido = evento.target.result;
                        const filas = contenido.split('\n');
                        let envioLotes = 0;
                        for (let i = 1; i < filas.length; i++) {
                            let columnas = filas[i].split(';');
                            if (columnas.length === 4) {
                                if (columnas[1] && (columnas[2] || columnas[3])) {
                                    const fecha = columnas[1].split('/');
                                    const dia = fecha[0];
                                    const mes = fecha[1];
                                    const año = fecha[2];
                                    const fechaFormateada = `${año}-${mes}-${dia}`;
                                    const ufv = parseFloat(columnas[2].replace(',', '.'));
                                    const dolar = parseFloat(columnas[3].replace(',', '.'));
                                    enviados[3] = enviados[3] + 1;
                                    if (!fechasExistentes.includes(fechaFormateada)) {
                                        envioLotes ++;
                                        enviados[0] = enviados[0] + 1;
                                        enviarFilaALaAPI(fechaFormateada, ufv, dolar);
                                        if (envioLotes === 20) {
                                            envioLotes = 0;
                                            await new Promise(resolve => setTimeout(resolve, 1000));
                                        }
                                    }
                                }
                            }
                        }
                        enviarDatosALaAPI();
                    };
                    lector.readAsText(archivo);
                } else if (extension === "xls" || extension === "xlsx") {
                    function obtenerFechaDesdeNumeroDeSerie(serial) {
                        let fecha = new Date((serial - (25567 + 1)) * 86400 * 1000);
                        let año = fecha.getFullYear();
                        let mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
                        let dia = ('0' + fecha.getDate()).slice(-2);
                        return año + '-' + mes + '-' + dia;
                    }

                    let lector = new FileReader();
                    lector.onload = async function(evento) {
                        let envioLotes = 0;

                        const data = new Uint8Array(evento.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const nombreHoja = workbook.SheetNames[0];
                        const hoja = workbook.Sheets[nombreHoja];
                        const datos = XLSX.utils.sheet_to_json(hoja);

                        for (let i = 0; i < datos.length; i++) {
                            let fila = datos[i];
                            let fecha = null;
                            let ufv = null;
                            let dolar = null;
                            for (let columna in fila) {
                                if (columna.toLowerCase() === "fecha") {
                                    fecha = obtenerFechaDesdeNumeroDeSerie(fila[columna]);
                                }
                                if (columna.toLowerCase() === "ufv") {
                                    ufv = fila[columna];
                                }
                                if (columna.toLowerCase() === "dólar" || columna.toLowerCase() === "dolar") {
                                    dolar = fila[columna];
                                }
                            }
                            if (fecha && (ufv || dolar)) {
                                enviados[3] = enviados[3] + 1;
                                if (!fechasExistentes.includes(fecha)) {
                                    enviados[0] = enviados[0] + 1;
                                    enviarFilaALaAPI(fecha, ufv, dolar);
                                    envioLotes++;
                                    if (envioLotes === 20) {
                                        envioLotes = 0;
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                    }
                                }
                            }
                        }
                        enviarDatosALaAPI();
                    };
                
                    lector.readAsArrayBuffer(archivo);
                }
            }

            const inputArchivo = elementoFormulario.querySelector('#tc_excel');
            elementoFormulario.addEventListener('submit', (e) => {
                e.preventDefault();
                if (inputArchivo.files.length > 0) {
                    let archivo = inputArchivo.files[0];
                    leerArchivoExcel(archivo);
                } else {
                    console.log('No se seleccionó ningún archivo.');
                }
            });
            
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