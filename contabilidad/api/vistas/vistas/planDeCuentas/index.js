import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { campoInput, campoSelect, manejarSelect } from "../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { botonEnCarga, cambiarVista, crearElemento, divOpcionesVista, elementoBoton, exportarAXlsx, InputBusqueda, seccionDriverJS } from "../../funciones/Funciones.js";
import { modalDeConfirmacion, modalRemovible } from "../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro, modalFormularioEditar } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { crearBotonReportePdfMake } from "../../funciones/VistaPDF.js";
import { formularioPlanDeCuentas, optnsTipoSaldo } from "./Formularios.js";
import { PlanCuentas } from "./Funcionalidades/PlanCuentas.js";
import { VincularTipoCuenta } from "./Funcionalidades/VincularTipoCuenta.js";
import { pdfMakePlanDeCuentas } from "./Funcionalidades/VistaPrevia.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión del plan de cuentas contables.
 *              Permite registrar, editar y eliminar cuentas.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export function PlanDeCuentas(codigo, permisos) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}milistaplanes/${EMPRESA_ID}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaImportarPlanCuentas = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaImportarPlanCuentas.setAttribute("class", "d-none");
    const vistaCuentasRubros = crearElemento("div", { class: "d-none" });

    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaCuentasRubros);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const recargarCampoPdC = () => {
        // Recarga el select con id "plancuenta-cuentaagrupacion" en el formulario de registro.
        const selectAF = vistaPrincipal.querySelector("#plancuenta-cuentaagrupacion");
        manejarSelect(selectAF, { urlSolicitud: URL_LT, llavesOpciones: { valor: "id", detalle: ["numero", "plan"] } })
    }

    // Opciones de la vista principal
    // Botón que abre la vista para importar plan de cuentas modelo
    const botonPlanCuentasModelo = elementoBoton({
        texto: "Plan de Cuentas Modelo",
        icono: "cloud-arrow-down",
        id: "pdc-btn-administracion",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaImportarPlanCuentas);
            PlanCuentas({
                codigo,
                permisos,
                vistaPlanDeCuentas: vistaPrincipal,
                vistaImportarPlanCuentas,
                urlPlanDeCuentas: URL_LT,
                contenedorAlertasPdC: contenedorDeAlertas,
                cargarTablaPlanDeCuenta: cargarContenidoTabla,
                recargarCampoPdC,
            });
        }
    });
    // Botón para exportar el plan de cuentas a Excel
    const botonExportarXlsx = botonExportarAExcel(
        URL_LT,
        ["id", "Código", "Cuenta", "Tipo", "Descripción"],
        vistaPrincipal
    );
    // Botón para generar el reporte PDF del plan de cuentas
    const botonVistaPrevia = crearBotonReportePdfMake({
        contenedorModal: contenedorPrincipal,
        obtenerContenido: pdfMakePlanDeCuentas(URL_LT),
        botonId: "pdc-btn-vistaprevia",
        botonTexto: "Exportar en PDF",
    });
    // Botón para abrir la vista de vinculación de cuentas y rubros
    const botonCuentasRubros = elementoBoton({
        texto: "Cuentas - Rubros",
        icono: "arrow-left-right",
        id: "pdc-btn-cuentasrubro",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaCuentasRubros);
            VincularTipoCuenta({vistaPlanDeCuentas: vistaPrincipal, vistaVincularDepreciacion: vistaCuentasRubros, codigo, permisos});
        }
    });

    let botonImportarXlsx;
    let arrayOpcionesBtn = [botonPlanCuentasModelo, botonExportarXlsx, botonVistaPrevia, botonCuentasRubros];
    if (PUEDE_ESCRIBIR) {
        arrayOpcionesBtn = [];
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioPlanDeCuentas,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nueva Cuenta",
                },
                camposAdicionales: {
                    ver: "registroplanes",
                    empresa: EMPRESA_ID,
                },
                callbacks: {
                    alRegistrar: recargarCampoPdC,
                }
            },
            vistaPrincipal
        );

        // Botón que abre un modal para importar plan de cuentas desde un archivo EXCEL
        botonImportarXlsx = botonImportarDeExcel({
            URL,
            URL_LT,
            vistaPrincipal,
            contenedorDeAlertas,
            cargarContenidoTabla,
            recargarCampoPdC,
        });

        arrayOpcionesBtn.push(botonRegistrar, botonPlanCuentasModelo, botonImportarXlsx, botonExportarXlsx, botonVistaPrevia, botonCuentasRubros);
    }
    const opcionesBtns = divOpcionesVista(arrayOpcionesBtn);
    vistaPrincipal.appendChild(opcionesBtns);

    const encabezadoTabla = [
        "Código",
        "Cuenta",
        "Tipo",
        "Descripción",
        "Cuentas padre",
        "Rubro",
        "Opciones"
    ];
    // Si no tiene permisos para escribir, editar ni para eliminar, se remueve la columna de opciones
    if (!PUEDE_ESCRIBIR && !PUEDE_EDITAR && !PUEDE_ELIMINAR) {
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
            botonPlanCuentasModelo.disabled = false;
            botonImportarXlsx ? botonImportarXlsx.disabled = false : null;
            tbody.replaceChildren(validado.fila);
            return;
        }

        botonPlanCuentasModelo.disabled = true;
        botonImportarXlsx ? botonImportarXlsx.disabled = true : null;

        const fragment = document.createDocumentFragment();

        for (const registro of listaRegistros) {
            const nombreTipo = optnsTipoSaldo.find(opc => opc.clave === registro.tipo);
            const celdas = [
                crearElemento("td", { class: "text-end" }, [registro.numero || "-"]),
                crearElemento("td", { class: registro.idp == 0 ? "text-danger" : "text-primary" }, [registro.plan || "-"]),
                crearElemento("td", undefined, [nombreTipo ? nombreTipo.valor : "-"]),
                crearElemento("td", undefined, [registro.descripcion || "-"]),
                crearElemento("td", undefined, [registro.nombre_padre || "-"]),
                crearElemento("td", undefined, [registro.nombre_rubro || "-"]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR || PUEDE_ESCRIBIR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_ESCRIBIR) {
                    // Opción para insertar una nueva cuenta después de la cuenta actual
                    const botonInsertar = botonInsertarCuenta(async () => {
                        const codigoNuevo = await obtenerDatos(`${URL}codigo_correlativo_plandecuenta/${registro.numero}/${EMPRESA_ID}`);
                        let nuevoRegistro = null;
                        if (codigoNuevo && codigoNuevo[0]?.codigo) {
                            nuevoRegistro = { numero: codigoNuevo[0].codigo, idp: registro.idp, tipo: registro.tipo, idagrupacion_rubro_plandecuenta: registro.idagrupacion_rubro_plandecuenta };
                        } else {
                            nuevoRegistro = { numero: incrementarCodigoPlanDeCuentas(registro.numero), idp: registro.idp, tipo: registro.tipo, idagrupacion_rubro_plandecuenta: registro.idagrupacion_rubro_plandecuenta };
                        }
                        const modal = modalFormularioEditar( // se reutiliza la función de editar para crear un nuevo registro
                            {
                                contenedorDeAlertas,
                                URL_FORM: URL,
                                URL_LISTAR: URL_LT,
                                camposDeFormulario: formularioPlanDeCuentas,
                                configuracionModal: {
                                    tituloModal: "Insertar Cuenta",
                                },
                                configuraciones: {
                                    configuracionBotones:{
                                        nombreEnviar: "Insertar",
                                        clasesEnviar: "btn btn-info",
                                    },
                                    mensajeExito: "Registro insertado exitosamente",
                                    mensajeError: "Error al insertar el registro",
                                },
                                camposAdicionales: {
                                    ver: "registroplanes",
                                    empresa: EMPRESA_ID,
                                },
                                callbacks: {
                                    alEditar: recargarCampoPdC,
                                },
                                datosRegistro: nuevoRegistro,
                                cargarContenidoTabla,
                            },
                        );
                        vistaPrincipal.appendChild(modal);
                    });
                    fragmentOpciones.append(botonInsertar, " ");
                }
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioPlanDeCuentas,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Cuenta",
                            },
                            camposAdicionales: {
                                ver: "registroplanesf5",
                                empresa_id: EMPRESA_ID,
                                idplan: registro.id,
                            },
                            callbacks: {
                                alEditar: recargarCampoPdC,
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
                            URL: `${URL}deleteplan/${registro.id}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                            callbacks: {
                                alEliminar: recargarCampoPdC,
                                alEliminarTodo: () => {
                                    botonPlanCuentasModelo.disabled = false;
                                    botonImportarXlsx ? botonImportarXlsx.disabled = false : null;
                                }
                            }
                        },
                        vistaPrincipal
                    );
                    fragmentOpciones.append(botonEliminar, " ");
                }
                tdOpciones.appendChild(fragmentOpciones);
                celdas.push(tdOpciones);
            }
            const fila = crearElemento("tr", undefined, [ ...celdas]);
            if (!registro.idagrupacion_rubro_plandecuenta || registro.idagrupacion_rubro_plandecuenta === "0") {
                fila.classList.add("table-warning");
            }
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }



    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            popover: {
                title: "Plan de Cuentas",
                description: "Permite la Administración del Plan General de Cuentas Contables. Existe un plan modelo que se ofrece según el rubro de su Empresa u Organización",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Agregar cuenta",
                description: "Abre un formulario para registrar una nueva cuenta en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='pdc-btn-administracion']",
            popover: {
                title: "Plan de Cuentas Modelo",
                description: "Permite descargar el plan de cuentas modelo propuesto, según su rubro o actividad de negocio. (Esta opción solo estará habilitada cuando no exista ninguna cuenta registrada)",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='pdc-btn-importarxlsx']",
            popover: {
                title: "Importar desde Excel",
                description: "Permite importar desde excel un Plan de Cuentas para su Contabilidad. (Esta opción solo estará habilitada cuando no exista ninguna cuenta registrada)",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='pdc-btn-exportarxls']",
            popover: {
                title: "Exportar a Excel",
                description: "Permite exportar el Plan de Cuentas a Excel, o descargar el formato para crear su Plan de Cuentas e Importarlo al Sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "#pdc-btn-vistaprevia",
            popover: {
                title: "Vista previa del plan de cuentas",
                description: "Muestra una vista previa del plan de cuentas, con opción de descarga en formato PDF.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='pdc-btn-cuentasrubro']",
            popover: {
                title: "Cuentas - Rubros",
                description: "Permite crear Rubros y vincular las cuentas contables a dichos rubros para una mejor organización y clasificación.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar cuenta",
                description: "Permite buscar cuentas considerando todas las columnas de la tabla.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Lista de Cuentas Contables",
                description: "Permite ver un listado de todas las cuentas del Plan de Cuentas que se usará en la contabilidad (Los registros en color amarillo indican que la cuenta no está vinculada a ningún rubro)",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Insertar']",
            popover: {
                title: "Insertar cuenta",
                description: "Abre un formulario (con algunos campos prellenados) para insertar una nueva cuenta en el plan de cuentas.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar cuenta",
                description: "Abre un formulario para modificar los datos de la cuenta seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar cuenta",
                description: "Permite eliminar el registro de la cuenta seleccionada, previa confirmación.",
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
 * Función: Botón para importar plan de cuentas
 * Descripción: Crea un botón que abre un modal con un formulario para importar un plan de cuentas desde un archivo EXCEL o CSV.
 *              Permite agregar o reemplazar el plan de cuentas existente.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
function botonImportarDeExcel(datosVista) {
    const {
        URL,
        URL_LT,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        recargarCampoPdC,
    } = datosVista;

    const manejarImportacion = () => {
        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Importar de un archivo EXCEL"});

        const [inputArchivo, divArchivo] = campoInput(
            { atributos: { type: "file", id: "pdc-importarxlsx-archivo", name: "file", class: "form-control", required: "required" } },
            { contenido: "Archivo" }
        );
        const [selectTipo, divTipo] = campoSelect(
            { atributos: { id: "pdc-importarxlsx-tipo", name: "tipo", class: "form-select", required: "required"}},
            { contenido: "Tipo de importación" },
        );
        selectTipo.innerHTML = `
            <option value=""> -- Elija una opción -- </option>
            <option value="1">Agregar</option>
            <option value="2">Remplazar</option>
        `;

        const botonConsolidar = crearElemento("button", { class: "btn btn-primary", type: "submit", style: "min-width: 100px;" }, ["Cargar EXCEL"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 100px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center" }, [botonConsolidar, botonCancelar]);

        const elementoFormulario = crearElemento("form", { class: "row g-3" }, [divArchivo, divTipo, divBotones]);
        cuerpoModal.appendChild(elementoFormulario);

        const empresa_id = getEmpresaId();

        // Función para enviar una fila a la API, retorna una Promesa
        const enviarFilaALaAPI = (datos) => {
            const { codigo, nombre, saldoTipo, descripcion, cuentaP } = datos;
            const datosPost = new FormData();
            datosPost.append("numero", codigo);
            datosPost.append("plan", nombre);
            datosPost.append("tipo", saldoTipo);
            datosPost.append("descripcion", descripcion);
            datosPost.append("plandecuenta", cuentaP || "");
            datosPost.append("ver", "registroplanes");
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
            const fnBotonInicial = botonEnCarga(botonConsolidar);

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
            recargarCampoPdC();

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
            const esReemplazo = selectTipo.value === "2";

            if (esReemplazo) {
                const solEliminar = await obtenerDatos(`${URL}reemplazar_todos_planescuentas/${empresa_id}`);
                if (solEliminar && solEliminar[0] === "danger") {
                    alertaDeAdvertencia(contenedorDeAlertas, "No se pueden remplazar las cuentas porque están en uso");
                    cerrarModal();
                    return;
                } else if (solEliminar === false) {
                    alertaDeError(contenedorDeAlertas, "Ocurrió un error al limpiar los registros existentes");
                    cerrarModal();
                    return;
                }
            }

            const listaParaEnviar = [];

            if (extension === "csv") {
                // Leer archivo CSV
                const lector = new FileReader();
                lector.onload = async (e) => {
                    const filas = e.target.result.split("\n");
                    // Se empieza en 1 asumiendo cabecera
                    for (let i = 1; i < filas.length; i++) {
                        const cols = filas[i].split(";");
                        if (cols.length >= 5 && cols[1] && cols[2] && cols[3] && cols[4]) {
                            listaParaEnviar.push({
                                codigo: cols[1],
                                nombre: cols[2],
                                saldoTipo: cols[3],
                                descripcion: cols[4],
                                cuentaP: cols[5]
                            });
                        }
                    }
                    if (listaParaEnviar.length > 0) await procesarDatos(listaParaEnviar);
                    else alertaDeAdvertencia(contenedorDeAlertas, "No se encontraron datos válidos en el CSV");
                };
                lector.readAsText(archivo);

            } else if (["xls", "xlsx"].includes(extension)) {
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

                        const codigo = getVal("código") || getVal("codigo");
                        const nombre = getVal("cuenta");
                        const tipo = getVal("tipo");
                        const desc = getVal("descripción") || getVal("descripcion");
                        const pad = getVal("cuenta asociada");

                        if (codigo && nombre && tipo && desc) {
                            listaParaEnviar.push({
                                codigo, nombre, saldoTipo: tipo, descripcion: desc, cuentaP: pad
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
        id: "pdc-btn-importarxlsx",
        callback: manejarImportacion,
    });
    return botonImportar;
}

/**
 * Función: Botón para exportar el plan de cuentas a Excel
 * Descripción: Crea un botón que permite exportar el plan de cuentas a un archivo Excel previa confirmación.
 * Fecha: 06 de enero de 2026
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
                return [(index + 1), dato.numero, dato.plan, dato.tipo, dato.descripcion?.replace(/[\r\n]+/g, " ")]
            });
            const data = [encabezado, ...filas];
            // Exportar a Excel
            exportarAXlsx(data, "plan_de_cuentas", undefined, [
                { wch: 8 },
                { wch: 12 },
                { wch: 30 },
                { wch: 12 },
                { wch: 50 },
            ]);
        }
        const modal = modalDeConfirmacion(exportar, "¿Está seguro de exportar el Plan de Cuentas a Excel?");
        vistaPrincipal.appendChild(modal);
        modal.querySelector("button[data-id='__btn-confirmar']").focus();
    }

    const btnExportar = elementoBoton({
        texto: " Exportar EXCEL",
        icono: "table",
        id: "pdc-btn-exportarxls",
        callback: manejarExportacion,
    });
    return btnExportar;
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

// Botón para insertar cuenta debajo de la cuenta actual
function botonInsertarCuenta(callback) {
    const icono = crearElemento("i", { class: "bi bi-plus-lg" });
    const boton = crearElemento("button", { class: "btn btn-info btn-sm", type: "button", title: "Insertar" }, [icono]);

    boton.addEventListener("click", async () => {
        boton.disabled = true;
        await callback();
        boton.disabled = false;
    });
    return boton;
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

/**
 * Función: Incrementar código del plan de cuentas
 * Descripción: Dado un código en formato jerárquico separado por puntos (.), incrementa el último segmento numérico.
 *              Si el último segmento es cero, se busca el segmento anterior para incrementar.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
function incrementarCodigoPlanDeCuentas(cadena) {
    let partes = cadena.split(".");

    for (let i = partes.length - 1; i >= 0; i--) {
        let original = partes[i];
        let num = parseInt(original, 10);
        if (num > 0){
            let incrementado = (num + 1).toString();
            if (incrementado.length < original.length) {
                partes[i] = incrementado.padStart(original.length, "0");
            } else {
                partes[i] = incrementado;
            }
            return partes.join(".");
        }
    }
    return "0.0.0.00.00";
}