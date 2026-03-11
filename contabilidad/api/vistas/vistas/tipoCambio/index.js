import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { campoInput } from "../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { botonEnCarga, crearElemento, divOpcionesVista, elementoBoton, exportarAXlsx, formatoDecimal, formatoFecha, InputBusqueda, seccionDriverJS } from "../../funciones/Funciones.js";
import { modalDeConfirmacion, modalRemovible } from "../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { formularioTipoCambio } from "./Formularios.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function TipoCambio(codigo, permisos) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listatipodecambio/${EMPRESA_ID}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Botón para exportar el plan de cuentas a Excel
    const botonExportarXlsx = botonExportarAExcel(
        URL_LT,
        ["id", "Fecha", "Dolar", "UFV"],
        vistaPrincipal
    );
    let arrayOpcionesBtn = [botonExportarXlsx];
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioTipoCambio,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nuevo Tipo de Cambio",
                },
                camposAdicionales: {
                    ver: "registrotipodecambio",
                    empresa: EMPRESA_ID,
                }
            },
            vistaPrincipal
        );

        // Botón que abre un modal para importar plan de cuentas desde un archivo EXCEL
        const botonImportarXlsx = botonImportarDeExcel({
            URL,
            URL_LT,
            vistaPrincipal,
            contenedorDeAlertas,
            cargarContenidoTabla,
        });

        arrayOpcionesBtn.unshift(botonRegistrar, botonImportarXlsx);
    }
    const opcionesBtns = divOpcionesVista(arrayOpcionesBtn);
    vistaPrincipal.appendChild(opcionesBtns);

    const encabezadoTabla = [
        "Fecha",
        "Dolar",
        "UFV",
        "Opciones"
    ];

    // Si no tiene permisos ni para editar ni para eliminar, se remueve la columna de opciones
    if (!PUEDE_EDITAR && !PUEDE_ELIMINAR) {
        encabezadoTabla.pop();
    }
    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, divTabla);

    // Manejar el listado en la tabla
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
        contenedorAlertas: contenedorDeAlertas,
        cuerpoTabla: tbody,
    });
    // Función para cargar el contenido de la tabla
    function cargarContenidoTabla(listaRegistros) {
        const validado = validarListadoTabla(listaRegistros);
        if ( !validado.valido ) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        for (const registro of listaRegistros) {
            const celdas = [
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fecha) || ""]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.dolar)]),
                crearElemento("td", { class: "text-end" }, [registro.ufv || ""]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioTipoCambio,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Tipo de Cambio",
                            },
                            camposAdicionales: {
                                ver: "registrotipodecambiof5",
                                id: registro.id,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    fragmentOpciones.append(botonEditar, " ");
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}eliminartipocambio/${registro.id}/${EMPRESA_ID}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                        },
                        vistaPrincipal
                    );
                    fragmentOpciones.append(botonEliminar, " ");
                }
                tdOpciones.appendChild(fragmentOpciones);
                celdas.push(tdOpciones);
            }
            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            popover: {
                title: "Tipos de Cambio",
                description: "Permite gestionar los tipos de cambio de Dólar y UFV, para mostrarlo al momento de generar una nueva Transacción u otros módulo Ej Inventarios&Activos Fijos para la generación del Cuadro de Depreciación.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Agregar tipo de cambio",
                description: "Abre un formulario para registrar un nuevo tipo de cambio.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='tc-btn-importarxlsx']",
            popover: {
                title: "Importar desde Excel",
                description: "Permite importar datos de tipo de cambio desde un archivo Excel.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='tc-btn-exportarxls']",
            popover: {
                title: "Exportar a Excel",
                description: "Permite exportar los datos de tipo de cambio a un archivo Excel.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar tipo de cambio",
                description: "Permite buscar tipos de cambio considerando todos los campos disponibles.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de tipos de cambio",
                description: "Muestra todos los tipos de cambio registrados en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar tipo de cambio",
                description: "Abre un formulario para modificar los datos del tipo de cambio seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar tipo de cambio",
                description: "Permite eliminar el tipo de cambio seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE LA VISTA
// =========================================================

/**
 * Función: Botón para importar tipo de cambio desde Excel
 * Descripción: Crea un botón que abre un modal con un formulario para importar un tipo de cambio desde un archivo EXCEL o CSV.
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
function botonImportarDeExcel(datosVista) {
    const {
        URL,
        URL_LT,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
    } = datosVista;

    const manejarImportacion = () => {
        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Importar de un archivo EXCEL"});

        const [inputArchivo, divArchivo] = campoInput(
            { atributos: { type: "file", id: "pdc-importarxlsx-archivo", name: "file", class: "form-control", required: "required" } },
            { contenido: "Archivo" }
        );

        const botonCargar = crearElemento("button", { class: "btn btn-primary", type: "submit", style: "min-width: 100px;" }, ["Cargar EXCEL"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 100px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center" }, [botonCargar, botonCancelar]);

        const elementoFormulario = crearElemento("form", { class: "row g-3" }, [divArchivo, divBotones]);
        cuerpoModal.appendChild(elementoFormulario);

        const empresa_id = getEmpresaId();

        // Función para enviar una fila a la API, retorna una Promesa
        const enviarFilaALaAPI = (datos) => {
            const { fecha, ufv, dolar } = datos;
            const datosPost = new FormData();
            datosPost.append("fecha", fecha);
            datosPost.append("ufv", ufv);
            datosPost.append("dolar", dolar);
            datosPost.append("ver", "registrotipodecambio");
            datosPost.append("empresa", empresa_id);

            return fetch(URL, {
                method: "POST",
                body: datosPost
            }).then(response => {
                if (!response.ok) throw new Error("Error en la solicitud");
                return response;
            });
        };

        // Procesamiento por lotes y promesas
        const procesarDatos = async (listaDatos) => {
            let exitosos = 0;
            let fallidos = 0;
            const total = listaDatos.length;
            const BATCH_SIZE = 5; // Tamaño del lote

            // Deshabilitar botón durante el proceso
            const fnBotonInicial = botonEnCarga(botonCargar);

            // Procesar los datos que envía en lotes
            for (let i = 0; i < total; i += BATCH_SIZE) {
                const lote = listaDatos.slice(i, i + BATCH_SIZE);
                const promesas = lote.map(d => enviarFilaALaAPI(d));

                const resultados = await Promise.allSettled(promesas);

                resultados.forEach(res => {
                    if (res.status === 'fulfilled') exitosos++;
                    else fallidos++;
                });
            }

            // Actualizar tabla y notificar
            const listaDeRegistros = await obtenerDatos(URL_LT);
            cargarContenidoTabla(listaDeRegistros);

            if (fallidos === 0 && exitosos > 0) {
                alertaDeExito(contenedorDeAlertas, `Se importaron ${exitosos} registros exitosamente.`);
            } else if (exitosos === 0) {
                alertaDeError(contenedorDeAlertas, "Error al importar los registros. Ninguno fue procesado exitosamente.");
            } else {
                alertaDeAdvertencia(contenedorDeAlertas, `Proceso finalizado. Exitosos: ${exitosos}, Fallidos: ${fallidos}.`);
            }

            fnBotonInicial();
            cerrarModal();
        };

        // Parseo de archivos
        const leerArchivo = async (archivo) => {
            const nombreArchivo = archivo.name;
            const extension = nombreArchivo.split(".").pop().toLowerCase();

            let listaDeRegistros = await obtenerDatos(`${URL}listatipodecambio/${empresa_id}`);
            const fechasExistentes = listaDeRegistros.map(registro => registro.fecha);

            const listaParaEnviar = [];

            if (extension === "csv") {
                // Leer archivo CSV
                const lector = new FileReader();
                lector.onload = async (e) => {
                    const filas = e.target.result.split("\n");
                    // Se empieza en 1 asumiendo cabecera
                    for (let i = 1; i < filas.length; i++) {
                        const cols = filas[i].split(";");
                        if (cols.length === 4 && (cols[1] && (cols[2] || cols[3]))) {
                            // Calidar si está en formato YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY o DD/MM/YYYY
                            if (!cols[1].match(/^(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})$/)) continue;

                            // fecha en formato YYYY-MM-DD
                            let fechaPartes = cols[1].includes("-") ? cols[1].split("-") : cols[1].split("/");
                            if (fechaPartes[0].length === 2) {
                                fechaPartes = [fechaPartes[2], fechaPartes[1], fechaPartes[0]];
                            }
                            const fechaFormateada = `${fechaPartes[0]}-${fechaPartes[1].padStart(2, '0')}-${fechaPartes[2].padStart(2, '0')}`;

                            // Evitar duplicados por fecha
                            if (fechasExistentes.includes(fechaFormateada)) continue;

                            // Validar valores numéricos
                            const ufv = parseFloat(cols[2].replace(/,/g, "."));
                            const dolar = parseFloat(cols[3].replace(/,/g, "."));
                            if (isNaN(dolar) && isNaN(ufv)) continue;

                            listaParaEnviar.push({
                                fecha: fechaFormateada,
                                ufv: ufv,
                                dolar: dolar,
                            });
                        }
                    }
                    if (listaParaEnviar.length > 0) await procesarDatos(listaParaEnviar);
                    else alertaDeAdvertencia(contenedorDeAlertas, "No se encontraron datos válidos en el CSV");
                };
                lector.readAsText(archivo);

            } else if (["xls", "xlsx"].includes(extension)) {
                function obtenerFechaDesdeNumeroDeSerie(serial) {
                    let fecha = new Date((serial - (25567 + 1)) * 86400 * 1000);
                    let año = fecha.getFullYear();
                    let mes = ("0" + (fecha.getMonth() + 1)).slice(-2);
                    let dia = ("0" + fecha.getDate()).slice(-2);
                    return año + "-" + mes + "-" + dia;
                }

                // Leer archivo Excel
                const lector = new FileReader();
                lector.onload = async (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);

                    jsonData.forEach(fila => {
                        // Normalización de claves
                        const keys = Object.keys(fila);
                        const getVal = (k) => fila[keys.find(key => key.toLowerCase() === k)];

                        const fecha = getVal("fecha");
                        const ufv = getVal("ufv");
                        const dolar = getVal("dólar") || getVal("dolar");

                        if (fecha && (ufv || dolar)) {
                            let fechaFormateada = "";
                            if (typeof fecha === "number") {
                                // Fecha en formato número de serie de Excel
                                fechaFormateada = obtenerFechaDesdeNumeroDeSerie(fecha);
                            } else if (typeof fecha === "string") {
                                // Validar si está en formato YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY o DD/MM/YYYY
                                if (!fecha.match(/^(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})$/)) return;

                                let fechaPartes = fecha.includes("-") ? fecha.split("-") : fecha.split("/");
                                if (fechaPartes[0].length === 2) {
                                    fechaPartes = [fechaPartes[2], fechaPartes[1], fechaPartes[0]];
                                }
                                fechaFormateada = `${fechaPartes[0]}-${fechaPartes[1].padStart(2, '0')}-${fechaPartes[2].padStart(2, '0')}`;
                            } else {
                                return;
                            }

                            // Evitar duplicados por fecha
                            if (fechasExistentes.includes(fechaFormateada)) return;

                            // Validar valores numéricos
                            const valorUfv = parseFloat(String(ufv).replace(/,/g, "."));
                            const valorDolar = parseFloat(String(dolar).replace(/,/g, "."));
                            if (isNaN(valorDolar) && isNaN(valorUfv)) return;

                            listaParaEnviar.push({
                                fecha: fechaFormateada, ufv: valorUfv, dolar: valorDolar
                            });
                        }
                    });

                    if (listaParaEnviar.length > 0) await procesarDatos(listaParaEnviar);
                    else alertaDeAdvertencia(contenedorDeAlertas, "No se encontraron datos válidos en el Excel");
                };
                lector.readAsArrayBuffer(archivo);
            } else {
                 alertaDeAdvertencia(contenedorDeAlertas, "Formato de archivo no soportado");
            }
        };

         elementoFormulario.addEventListener("submit", (e) => {
            e.preventDefault();
            if (inputArchivo.files.length > 0) {
                leerArchivo(inputArchivo.files[0]);
            } else {
                 alertaDeAdvertencia(contenedorDeAlertas, "Seleccione un archivo");
            }
        });

        vistaPrincipal.appendChild(modal)
    };

    const botonImportar = elementoBoton({
        texto: " Importar EXCEL",
        icono: "box-arrow-in-right",
        id: "tc-btn-importarxlsx",
        callback: manejarImportacion,
    });
    return botonImportar;
}

/**
 * Función: Botón para exportar el tipo de cambio a Excel
 * Descripción: Crea un botón que permite exportar el tipo de cambio a un archivo Excel previa confirmación.
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
function botonExportarAExcel(url_rep, encabezado, vistaPrincipal) {
    const manejarExportacion = () => {
        const exportar = async() => {
            const datoReporte = await obtenerDatos(url_rep);
            if (!datoReporte) {
                return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
            }
            // Preparar datos para exportar
            const filas = datoReporte.map((dato, index) => {
                return [(index + 1), dato.fecha, dato.dolar, dato.ufv];
            });
            const data = [encabezado, ...filas];
            // Exportar a Excel
            exportarAXlsx(data, "tipo_cambio", undefined, [
                { wch: 8 },
                { wch: 12 },
                { wch: 12 },
                { wch: 12 },
            ]);
        }
        const modal = modalDeConfirmacion(exportar, "¿Está seguro de exportar el Tipo de Cambio a Excel?");
        vistaPrincipal.appendChild(modal);
        modal.querySelector("button[data-id='__btn-confirmar']").focus();
    }

    const btnExportar = elementoBoton({
        texto: " Exportar EXCEL",
        icono: "table",
        id: "tc-btn-exportarxls",
        callback: manejarExportacion,
    });
    return btnExportar;
}