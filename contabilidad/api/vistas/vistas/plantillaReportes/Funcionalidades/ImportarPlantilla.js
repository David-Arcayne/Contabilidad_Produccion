import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { ADMIN_URLAPI, CT_URLAPI, getEmpresa, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion, modalDeInformacion } from "../../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Función: Importar Plantilla de Reportes
 * Descripción: Esta función maneja la importación de plantillas de reportes desde Admin.
 *             Permite importar todas las plantillas o de forma individual.
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
export const Importar = (datosVista) => {
    const {
        permisos,
        vistaPlantillaReporte,
        vistaImportarPlantilla,
        contenedorAlertasPdR,
        urlPlantillaReporte,
        cargarTablaPlantillaReportes,
    } = datosVista;

    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const IDTN = getEmpresa()?.idtn || "0";
    const URL = CT_URLAPI;
    const URL_LT = `${ADMIN_URLAPI}getListaplantillareporterubro/${IDTN}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaImportarPlantilla.append(vistaPrincipal);

    // Creación de elementos para la vista principal
    const regresar = async () => {
        const datos = await obtenerDatos(urlPlantillaReporte);
        cargarTablaPlantillaReportes(datos);
        cambiarVista(vistaImportarPlantilla, vistaPlantillaReporte);
        vistaImportarPlantilla.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Importar Plantillas" }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    if (PUEDE_ESCRIBIR) {
        const recargarTablaPReporte = async (texto) => {
            const datos = await obtenerDatos(urlPlantillaReporte);
            cargarTablaPlantillaReportes(datos);
            alertaDeExito(contenedorAlertasPdR, texto);
            cambiarVista(vistaImportarPlantilla, vistaPlantillaReporte);
            vistaImportarPlantilla.innerHTML = "";
        };
        // Creación de elementos para la vista.
        const opcionesbotonImportarTodoBtns = botonImportarPlantillas({
            URL,
            vistaPrincipal,
            contenedorDeAlertas,
            recargarTablaPReporte
        });

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            opcionesbotonImportarTodoBtns,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Título Reporte",
        "Descripción",
        "Tipo de Reporte",
        "Opciones",
    ];

    // Si no tiene permisos para escribir, se remueve la columna de opciones
    if (!PUEDE_ESCRIBIR) {
        encabezadoTabla.pop();
    }
    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    vistaPrincipal.append(divTabla);

    // Manejar el listado en la tabla
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
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
                crearElemento("td", undefined, [registro.nombre || ""]),
                crearElemento("td", undefined, [registro.descripcion || ""]),
                crearElemento("td", undefined, [registro.tiporeporte || ""])
            ];

            if (PUEDE_ESCRIBIR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const botonImportar= botonImportacionIndividual({
                    URL,
                    contenedorDeAlertas,
                    vistaImportarPlantilla,
                    registro,
                });

                tdOpciones.append(botonImportar, " ");
                celdas.push(tdOpciones);
            }

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la ventana
    seccionDriverJS(
        [
            {
                popover: {
                    title: "Importar Plantillas",
                    description: "En esta sección puede importar las plantillas sugeridas desde Admin.",
                }
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='pr-importar-btn-importartodo']",
                popover: {
                    title: "Importar Todos",
                    description: "Realiza la importación de todas las plantillas sugeridas.",
                }
            },
            {
                element: divTabla,
                popover: {
                    title: "Listado de Plantillas",
                    description: "Muestra el listado de todas las plantillas sugeridas desde Admin.",
                }
            },
            {
                mainElement: tabla,
                element: "button[title='Importar']",
                popover: {
                    title: "Importar Plantilla Individual",
                    description: "Permite importar la plantilla sugerida individualmente.",
                }
            }
        ],
        vistaPrincipal
    );

    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE LA VISTA
// =========================================================

/**
 * Función: Crea el botón para importar todos las plantillas desde administración.
 * Descripción: Se realiza la importación de las plantillas sugeridas desde administración, previa confirmación.
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
function botonImportarPlantillas(datosVista) {
    const {
        URL,
        vistaPrincipal,
        contenedorDeAlertas,
        recargarTablaPReporte
    } = datosVista;

    const EMPRESA_ID = getEmpresaId();
    const idtn = getEmpresa()?.idtn || "0";

    const icono = crearElemento("i", { class: "bi bi-file-earmark-arrow-down pe-1" });
    const boton = crearElemento("button", { class: "btn btn-primary", "data-id": "pr-importar-btn-importartodo" }, [icono, " Importar todo"]);
    boton.addEventListener("click", () => {
        const importarTodo = async() => {
            const exito = (respuesta) => {
                if (respuesta) {
                    recargarTablaPReporte("Importación exitosa");
                } else {
                    alertaDeError(contenedorDeAlertas, "Ocurrió un error al importar las plantillas.");
                }
            };
            const error = () => {
                alertaDeError(contenedorDeAlertas, "Ocurrió un error al importar las plantillas.");
            };

            const datos = {
                idtn: idtn,
                empresa: EMPRESA_ID,
                ver: "importar_todo_admin"
            };
            await enviarDatosOJson({
                urlSolicitud : URL,
                datos : datos,
                callbackExito: exito,
                callbackError: error,
            });
        };
        const modal = modalDeConfirmacion(importarTodo, "¿Está seguro de importar todas las plantillas de Administración?");
        vistaPrincipal.appendChild(modal);
        modal.querySelector("[data-id='__btn-confirmar']").focus();
    });
    return boton;
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea el botón para importar una plantilla individualmente desde administración.
 * Descripción: Se realiza la importación de la plantilla individualmente, previa confirmación.
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
export const botonImportacionIndividual = (datosVista) => {
    const {
        URL,
        contenedorDeAlertas,
        vistaImportarPlantilla,
        registro,
    } = datosVista;
    const idtn = getEmpresa()?.idtn || "0";
    const empresa_id = getEmpresaId();

    const icono = crearElemento("i", { class: "bi bi-plus-lg" });
    const boton = crearElemento("button", { class: "btn btn-primary btn-sm", title: "Importar"}, [icono, " Importar"]);

    boton.addEventListener("click", (e) => {
        e.preventDefault();
        let apiReporte = false;
        if (registro.tiporeporte === "balance_general") {
            apiReporte = "registrar_balance_general_admin";
        } else if (registro.tiporeporte === "estado_resultado") {
            apiReporte = "registrar_estado_resultados_admin";
        } else {
            const modal = modalDeInformacion("No disponible");
            vistaImportarPlantilla.appendChild(modal);
            modal.querySelector("button.btn-info").focus();
            return;
        }
        const Importar = async() => {
            const exito = (respuesta) => {
                if (respuesta) {
                    alertaDeExito(contenedorDeAlertas, "Importación exitosa");
                } else {
                    alertaDeError(contenedorDeAlertas, "Ocurrió un error al importar la plantilla.");
                }
            };
            const error = () => {
                alertaDeError(contenedorDeAlertas, "Ocurrió un error al importar la plantilla.");
            };
            const datos = {
                idplantilla_reporte: registro.idctplantilla,
                idtn: idtn,
                empresa: empresa_id,
                ver: apiReporte,
            }
            await enviarDatosOJson({
                urlSolicitud : URL,
                datos : datos,
                callbackExito: exito,
                callbackError: error,
            });
        };
        const modal = modalDeConfirmacion(Importar, "¿Está seguro de importar los registros?");
        vistaImportarPlantilla.appendChild(modal);
        modal.querySelector("button.btn-primary").focus();
    });

    return boton;
}