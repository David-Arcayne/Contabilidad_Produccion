import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, InputBusqueda, seccionDriverJS } from "../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { enviarDatosOJson, obtenerDatos } from "../../funciones/Solicitudes.js";
import { formularioPlantillaReportes, optnsTipoReporte } from "./Formularios.js";
import { Importar } from "./Funcionalidades/ImportarPlantilla.js";
import { PlantillaEstadoDeResultados } from "./Funcionalidades/PlantillaEstadoDeResultados.js";
import { PlantillaBalanceGeneral } from "./Funcionalidades/PlantillaBalanceGeneral.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de plantillas de reportes.
 *              Permite importar, registrar, editar y eliminar plantillas de reportes.
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Crea el contenido principal del menú
 * @param {string} codigo - Código de la vista.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export function PlantillaReportes(codigo, permisos) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_tipo_reportes/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaPlantilla = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaPlantilla.classList.add("d-none");
    const vistaImportarPlantilla = crearElemento("div", { class: "d-none", "data-pane-id": "importar-plantilla" });
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaImportarPlantilla);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Botón para importar plantilla de reportes
    const botonImportarPlantilla = elementoBoton({
        texto: "Importar Plantilla",
        icono: "cloud-arrow-down",
        id: "i_btn_importarimp",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaImportarPlantilla);
            Importar({
                vistaPlantillaReporte: vistaPrincipal,
                vistaImportarPlantilla,
                permisos,
                contenedorAlertasPdR: contenedorDeAlertas,
                urlPlantillaReporte: URL_LT,
                cargarTablaPlantillaReportes: cargarContenidoTabla,
            });
        }
    });
    let arrayOpcionesBtn = [botonImportarPlantilla];
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioPlantillaReportes,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Plantilla de Reportes",
                },
                camposAdicionales: {
                    ver: "registrar_tipo_reportes",
                    empresa: EMPRESA_ID,
                },
            },
            vistaPrincipal
        );
        arrayOpcionesBtn.unshift(botonRegistrar);
    }
    // Opciones de la vista principal
    const opcionesBtns = divOpcionesVista(arrayOpcionesBtn);

    vistaPrincipal.appendChild(opcionesBtns);
    const encabezadoTabla = [
        "Título Reporte",
        "Descripción",
        "Tipo de Reporte",
        "Estado",
        "Opciones",
    ];

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
            const tipoReporte = optnsTipoReporte.find(opcion => opcion.clave === registro.tipo_reporte);
            const celdas = [
                crearElemento("td", undefined, [registro.nombre]),
                crearElemento("td", undefined, [registro.descripcion]),
                crearElemento("td", undefined, [tipoReporte?.valor || "-"]),
                crearElemento("td", undefined, [
                    dropdownReporte({
                        vistaPrincipal,
                        contenedorDeAlertas,
                        URL,
                        URL_LT,
                        cargarContenidoTabla,
                        registro,
                    })
                ])
            ];

            const tdOpciones = crearElemento("td", { class: "d-flex text-nowrap", style: "gap: 3px" });
            const arregloOpciones = [];

            // Botón para abrir la plantilla de reporte correspondiente
            const botonContenidoPlantilla = botonConectorReportes({
                permisos,
                vistaPlantillaReporte: vistaPrincipal,
                vistaPlantilla,
                registroPlantillaReporte: registro
            });
            arregloOpciones.push(botonContenidoPlantilla);

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                if (PUEDE_EDITAR) {
                    // // Check para cambiar de reporte en que se mostrará la plantilla
                    // const checkEtado = checkReporte({
                    //     vistaPrincipal,
                    //     contenedorDeAlertas,
                    //     URL,
                    //     URL_LT,
                    //     cargarContenidoTabla,
                    //     registro,
                    // });
                    // arregloOpciones.unshift(checkEtado);

                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioPlantillaReportes,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Plantilla de Reportes",
                            },
                            camposAdicionales: {
                                ver: "editar_tipo_reportes",
                                idtipo_reportes: registro.idtipo_reportes,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    arregloOpciones.push(botonEditar);
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}/eliminar_tipo_reportes/${registro.idtipo_reportes}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                        },
                        vistaPrincipal
                    );
                    arregloOpciones.push(botonEliminar);
                }
            }
            tdOpciones.append(...arregloOpciones);
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la vista
    seccionDriverJS(
        [
            {
                popover: {
                    title: "Plantillas de Reportes",
                    description: "Permite gestionar las plantillas de reportes que se utilizarán en el sistema.",
                },
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='__btn-registro']",
                popover: {
                    title: "Agregar Plantilla de Reporte",
                    description: "Abre un formulario para registrar una nueva plantilla de reporte.",
                },
            },
            {
                element: botonImportarPlantilla,
                popover: {
                    title: "Importar Plantillas de Reportes",
                    description: "Permite importar plantillas de reportes sugeridas desde Admin.",
                },
            },
            {
                mainElement: divBuscar,
                element: "#__buscador",
                popover: {
                    title: "Buscar registro",
                    description: "Permite buscar registros considerando todas las columnas de la tabla.",
                },
            },
            {
                element: divTabla,
                popover: {
                    title: "Tabla de Plantillas de Reportes",
                    description: "Muestra todos los registros de plantillas de reportes en el sistema, con opciones para gestionar cada plantilla.",
                },
            },
            {
                mainElement: tabla,
                element: "div.form-check.form-switch",
                popover: {
                    title: "Cambiar tipo de reporte",
                    description: `Permite cambiar si la plantilla de reporte se mostrará en el "Estado Financiero" o en el "Reporte Complementario"`,
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Plantilla']",
                popover: {
                    title: "Abrir Plantilla de Reporte",
                    description: "Abre la plantilla de reporte correspondiente para su visualización o edición.",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Editar']",
                popover: {
                    title: "Editar registro",
                    description: "Abre un formulario para modificar los datos del registro seleccionado.",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Eliminar']",
                popover: {
                    title: "Eliminar registro",
                    description: "Permite eliminar el registro seleccionado, previa confirmación.",
                },
            },
        ],
        vistaPrincipal
    );
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea el dropdown para cambiar de reporte en que se mostrará la plantilla
 * Descripción: Esta función genera un dropdown que permite al usuario cambiar si la plantilla de reporte se mostrará en el Estado Financiero, Reporte Complementario o Inactivo.
 * Fecha: 03 de febrero de 2026
 * Autor: Joel Choque
 */
function dropdownReporte(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        URL_LT,
        cargarContenidoTabla,
        registro,
    } = datosVista;

    const dropdown = crearElemento("div", { class: "dropdown-center" });
    let botonDropdown;
    if (registro.estado === "1") {
        botonDropdown = crearElemento("button", { class: "btn btn-success btn-sm dropdown-toggle", type: "button", "data-bs-toggle": "dropdown", "aria-expanded": "false" }, ["Estado Financiero"]);
    } else if (registro.estado === "2") {
        botonDropdown = crearElemento("button", { class: "btn btn-success btn-sm dropdown-toggle", type: "button", "data-bs-toggle": "dropdown", "aria-expanded": "false" }, ["Reporte Complementario"]);
    } else if (registro.estado === "0") {
        botonDropdown = crearElemento("button", { class: "btn btn-light btn-sm dropdown-toggle", type: "button", "data-bs-toggle": "dropdown", "aria-expanded": "false" }, ["Inactivo"]);
    }
    const a1 = crearElemento("a", { class: "dropdown-item", "data-id": "0" }, ["Inactivo"]);
    const a2 = crearElemento("a", { class: "dropdown-item", "data-id": "1" }, ["Estado Financiero"]);
    const a3 = crearElemento("a", { class: "dropdown-item", "data-id": "2" }, ["Reporte Complementario"]);
    const liOpcion1 = crearElemento("li", undefined, [a1]);
    const liOpcion2 = crearElemento("li", undefined, [a2]);
    const liOpcion3 = crearElemento("li", undefined, [a3]);
    const ulDropdown = crearElemento("ul", { class: "dropdown-menu" }, [liOpcion1, liOpcion2, liOpcion3]);
    dropdown.append(botonDropdown, ulDropdown);

    ulDropdown.addEventListener("click", async (e) => {
        e.preventDefault();
        const opcionSeleccionada = e.target.getAttribute("data-id");
        if (!opcionSeleccionada) return;

        const accionEnviar = async() => {
            // Obtener y actualizar los registros de la tabla de la vista principal.
            const listaDeRegistros = await obtenerDatos(URL_LT);
            cargarContenidoTabla(listaDeRegistros);
            alertaDeExito(contenedorDeAlertas, (registro.estado === "1" ? "Reporte asignado" : "Reporte asignado"));
        }
        const error = () => {
            alertaDeError(contenedorDeAlertas, "Ocurrio un error")
        }

        // Enviar el registro a la API
        const datos = {
            estado: opcionSeleccionada,
            idtipo_reportes: registro.idtipo_reportes,
            ver: "activar_desactivar_tipo_reportes"
        }
        await enviarDatosOJson({
            datos: datos,
            urlSolicitud: URL,
            callbackExito: accionEnviar,
            callbackError: error
        });
    });

    return dropdown;
}

/**
 * Función: Crea el conector para abrir la plantilla de reporte
 * Descripción: Esta función genera un botón que permite al usuario abrir la plantilla de reporte correspondiente.
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
function botonConectorReportes(datosVista){
    const {
        permisos,
        vistaPlantillaReporte,
        vistaPlantilla,
        registroPlantillaReporte
    } = datosVista;

    const icono = crearElemento("i", { class: "bi bi-list-nested" });
    const boton = crearElemento("button", { class: "btn btn-info btn-sm", type: "button", title: "Plantilla" }, [icono]);

    boton.addEventListener("click", () => {
        // Abrir la plantilla de reporte según el tipo de reporte
        if (registroPlantillaReporte.tipo_reporte === "balance_general") {
            cambiarVista(vistaPlantillaReporte, vistaPlantilla);
            PlantillaBalanceGeneral({
                permisos,
                vistaPlantillaReporte,
                vistaPlantilla,
                registroPlantillaReporte
            });
        } else {
            cambiarVista(vistaPlantillaReporte, vistaPlantilla);
            PlantillaEstadoDeResultados({
                permisos,
                vistaPlantillaReporte,
                vistaPlantilla,
                registroPlantillaReporte
            });
        }
    });
    return boton;
}