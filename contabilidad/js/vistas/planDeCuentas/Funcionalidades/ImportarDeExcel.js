import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Crea un formulario para importar un archivo Excel
 * @param {Object} datosVista - Valores requeridos para el formulario
 * @param {HTMLDivElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas
 * @param {(string|Object)[]} datosVista.contenidoTabla - Array de claves de registro
 * @param {HTMLDivElement} datosVista.tBody - Cuerpo de la tabla
 * @param {string} datosVista.URL - URL principal
 * @param {string} datosVista.URL_LT - URL para listar los registros
 * @param {HTMLDivElement} datosVista.vistaPrincipal - Elemento que contiene a la vista principal
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns 
 */
export const ImportarDeExcel = (datosVista) => {
    const {
        contenedorDeAlertas,
        contenidoTabla,
        tBody,
        URL,
        URL_LT,
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
                <h3 class="" >Importar de un archivo EXCEL</h3>
                <form class="row g-3 mx-3 mb-2 mt-0">
                    <input type="file" class="form-control" id="pdc_excel" name="file" required>
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
            // Arreglo para contar los registros enviados a la API: [total_enviados, exitosos, fallidos|response, total_reg_encontrados]
            const enviados = [0, 0, 0, 0];
            // Función para enviar los datos a la API
            function enviarFilaALaAPI(codigo, nombre, saldoTipo, descripcion, cuentaP) {
                const datosPost = new FormData();
                datosPost.append('numero', codigo);
                datosPost.append('plan', nombre);
                datosPost.append('tipo', saldoTipo);
                datosPost.append('descripcion', descripcion);
                datosPost.append('plandecuenta', cuentaP||'');
                datosPost.append('ver', 'registroplanes');
                datosPost.append('empresa', empresa_id);
                fetch(URL, {
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

            // Función para verificar si se enviaron todos los datos y mostrar su respectiva alerta
            function enviarDatosALaAPI() {
                let intervalo = setInterval(async function() {
                    if (enviados[2] === enviados[0]) {
                        if (enviados[0] == enviados[1]) {
                            const listaDeRegistros = await obtenerDatos(URL_LT);
                            contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
                            alertaDeExito(contenedorDeAlertas, "Registros importados exitosamente");
                        } else if (enviados[1] === 0) {
                            alertaDeError(contenedorDeAlertas, "Error al importar registros");
                        } else {
                            alertaDeAdvertencia(contenedorDeAlertas, "Ocurrío un error al importar algunos registros");
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
                const nombreArchivo = archivo.name;
                const extension = nombreArchivo.split('.').pop().toLowerCase();
                if (extension ==="csv") {
                    // Leer el archivo CSV
                    let lector = new FileReader();
                    lector.onload = async function(evento) {
                        const contenido = evento.target.result;
                        const filas = contenido.split('\n');
                        let envioLotes = 0;
                        // Recorre el archivo CSV y envía los datos a la API
                        for (let i = 1; i < filas.length; i++) {
                            let columnas = filas[i].split(';');
                            if (columnas.length === 6) {
                                if (columnas[1] && columnas[2] && columnas[3] && columnas[4]) {
                                    const codigo = columnas[1];
                                    const nombre = columnas[2];
                                    const saldoTipo = columnas[3];
                                    const descripcion = columnas[4];
                                    const cuentaP = columnas[5];
                                    enviados[3] = enviados[3] + 1;
                                    envioLotes ++;
                                    enviados[0] = enviados[0] + 1;
                                    enviarFilaALaAPI(codigo, nombre, saldoTipo, descripcion);
                                    if (envioLotes === 20) {
                                        envioLotes = 0;
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                    }
                                }
                            }
                        }
                        enviarDatosALaAPI();
                    };
                    lector.readAsText(archivo);
                } else if (extension === "xls" || extension === "xlsx") {
                    // Leer el archivo Excel
                    let lector = new FileReader();
                    lector.onload = async function(evento) {
                        let envioLotes = 0;

                        const data = new Uint8Array(evento.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const nombreHoja = workbook.SheetNames[0];
                        const hoja = workbook.Sheets[nombreHoja];
                        const datos = XLSX.utils.sheet_to_json(hoja);

                        // Recorre las filas del archivo Excel y envía los datos a la API
                        for (let i = 0; i < datos.length; i++) {
                            let fila = datos[i];
                            let id = null;
                            let codigo = null;
                            let nombreCuenta = null;
                            let saldoTipo = null;
                            let descripcion = null;
                            let cuentaP = null;

                            for (let columna in fila) {
                                if (columna.toLowerCase() === "id") {
                                    id = fila[columna];
                                }
                                if (columna.toLowerCase() === "código" || columna.toLowerCase() === "codigo") {
                                    codigo = fila[columna];
                                }
                                if (columna.toLowerCase() === "cuenta") {
                                    nombreCuenta = fila[columna];
                                }
                                if (columna.toLowerCase() === "saldo tipo") {
                                    saldoTipo = fila[columna];
                                }
                                if (columna.toLowerCase() === "descripción" || columna.toLowerCase() === "descripcion") {
                                    descripcion = fila[columna];
                                }
                                if (columna.toLowerCase() === "cuenta asociada") {
                                    cuentaP = fila[columna];
                                }
                            }
                            if (id && codigo && nombreCuenta && saldoTipo && descripcion) {
                                enviados[3] = enviados[3] + 1;
                                enviados[0] = enviados[0] + 1;
                                enviarFilaALaAPI(codigo, nombreCuenta, saldoTipo, descripcion);
                                envioLotes++;
                                if (envioLotes === 20) {
                                    envioLotes = 0;
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                }
                            }
                        }
                        enviarDatosALaAPI();
                    };
                
                    lector.readAsArrayBuffer(archivo);
                }
            }

            // Evento para obtener el archivo seleccionado al enviar el formulario
            const inputArchivo = elementoFormulario.querySelector('#pdc_excel');
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