import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { AD_URLAPI, CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, formatoDecimal, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de importacion impuestos.
 *              Permite importar los impuestos individualmente o todos.
 * Fecha: 08 de enero de 2026
 * Autor: Joel Choque
 */
export const ImportarImpuesto = (datosVista) => {
    const {
        codigo,
        permisos,
        vistaImpuesto,
        vistaImportarImpuestos,
        contenedorAlertasImpuesto,
        urlImpuesto,
        cargarTablaImpuesto,
    } = datosVista;

    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${AD_URLAPI}listaimpuesto/${EMPRESA_ID}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaImportarImpuestos.append( vistaPrincipal);

    // Creación de elementos para la vista principal
    const regresar = () => {
        cambiarVista(vistaImportarImpuestos, vistaImpuesto);
        vistaImportarImpuestos.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Importar Impuestos" }, { callback: regresar } );
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const impuestosAdmin = [];
    if (PUEDE_ESCRIBIR) {
        const recargarTablaImpuestos = async (texto) => {
            const datos = await obtenerDatos(urlImpuesto);
            cargarTablaImpuesto(datos);
            alertaDeExito(contenedorAlertasImpuesto, texto);
            cambiarVista(vistaImportarImpuestos, vistaImpuesto);
            vistaImportarImpuestos.innerHTML = "";
        };
        // Creación del botón para importar todos los impuestos desde administración
        const botonImportarTodo = botonImportarImpuestos({
            URL,
            vistaPrincipal,
            registrosImpuestosAdmin: impuestosAdmin,
            contenedorDeAlertas,
            recargarTablaImpuestos
        });

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonImportarTodo,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Código",
        "Nombre",
        "Tasa",
        "Descripción",
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
        if (PUEDE_ESCRIBIR) impuestosAdmin.push(...listaRegistros);

        const fragment = document.createDocumentFragment();

        for (const registro of listaRegistros) {
            const celdas = [
                crearElemento("td", undefined, [registro.codigoimpuesto || "-"]),
                crearElemento("td", undefined, [registro.nombreimpuesto || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.tasa)]),
                crearElemento("td", undefined, [registro.descripcion || "-"]),
            ];

            if (PUEDE_ESCRIBIR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const botonImportar= botonImportacionIndividual({
                    URL,
                    urlImpuesto,
                    contenedorDeAlertas,
                    vistaPrincipal,
                    cargarTablaImpuesto,
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
                    title: "Importar Impuestos",
                    description: "En esta sección puede importar los impuestos sugeridos desde Admin.",
                }
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='trib-importar-btn-importartodo']",
                popover: {
                    title: "Importar Todos",
                    description: "Realiza la importación de todos los impuestos sugeridos.",
                }
            },
            {
                element: divTabla,
                popover: {
                    title: "Listado de Impuestos",
                    description: "Muestra el listado de todos los impuestos sugeridos desde Admin.",
                }
            },
            {
                mainElement: tabla,
                element: "button[title='Importar']",
                popover: {
                    title: "Importar Impuesto Individual",
                    description: "Permite importar el impuesto sugerido individualmente.",
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
 * Función: Crea el botón para importar todos los impuestos desde administración.
 * Descripción: Se realiza la importación de los impuestos por lotes de administración, previa confirmación.
 * Fecha: 08 de enero de 2026
 * Autor: Joel Choque
 */
function botonImportarImpuestos(datosVista) {
    const {
        URL,
        vistaPrincipal,
        registrosImpuestosAdmin,
        contenedorDeAlertas,
        recargarTablaImpuestos
    } = datosVista;

    const empresa_id = getEmpresaId();

    // Función para enviar el registro de impuesto a la API
    const enviarRegistro = async (registro) => {
        const formData = new FormData();
        formData.append("codigo", registro.codigoimpuesto);
        formData.append("nombre", registro.nombreimpuesto);
        formData.append("tasa", registro.tasa);
        formData.append("descripcion", registro.descripcion);
        formData.append("idempresa", empresa_id);
        formData.append("ver", "impuestocrear");
        try {
            const response = await fetch(URL, {
                method: "POST",
                body: formData
            });
            if (!response.ok) return false;

            const res = await response.json();
            return res[0] === "success";
        } catch {
            return false;
        }
    };

    // Función para importar los impuestos por lotes
    const importarPorLotes = async () => {
        if (!registrosImpuestosAdmin?.length) {
            alertaDeError(contenedorDeAlertas, "No hay impuestos para importar.");
            return;
        }

        let registrados = 0;
        const BATCH_SIZE = 5;
        const total = registrosImpuestosAdmin.length;
        // Procesar los registros en lotes
        for (let i = 0; i < total; i += BATCH_SIZE) {
            const lote = registrosImpuestosAdmin.slice(i, i + BATCH_SIZE);
            const resultados = await Promise.all(
                lote.map(enviarRegistro)
            );
            registrados += resultados.filter(Boolean).length;
        }

        // Mensaje según el resultado de la importación
        if (registrados === total) {
            await recargarTablaImpuestos("Impuestos importados correctamente.");
        } else if (registrados > 0) {
            await recargarTablaImpuestos("Algunos impuestos no pudieron ser importados.");
        } else {
            alertaDeError(
                contenedorDeAlertas,
                "Ocurrió un error al importar los impuestos."
            );
        }
    };

    // Maneja la confirmación de la importación
    const manejarImportacion = () => {
        const modal = modalDeConfirmacion(importarPorLotes, "¿Está seguro de importar los registros?");
        vistaPrincipal.appendChild(modal);
        modal.querySelector("button[data-id='__btn-confirmar']").focus();
    };

    return elementoBoton({
        texto: "Importar todo",
        icono: "file-earmark-arrow-down",
        id: "trib-importar-btn-importartodo",
        callback: manejarImportacion
    });
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea el botón para importar un impuesto individualmente desde administración.
 * Descripción: Se realiza la importación del impuesto individualmente, previa confirmación.
 * Fecha: 08 de enero de 2026
 * Autor: Joel Choque
 */
function botonImportacionIndividual(datosVista) {
    const {
        URL,
        urlImpuesto,
        contenedorDeAlertas,
        vistaPrincipal,
        cargarTablaImpuesto,
        registro,
    } = datosVista;

    const EMPRESA_ID = getEmpresaId();

    const icono = crearElemento("i", { class: "bi bi-plus-lg pe-1" });
    const boton = crearElemento("button", { class: "btn btn-primary btn-sm", title: "Importar" }, [icono, "Importar"]);

    boton.addEventListener("click", (e) => {
        e.preventDefault();
        const registrar = () => {
            const accionEnviar = async() => {
                // Obtener y actualizar los registros de la tabla de la vista principal.
                const listaDeRegistros = await obtenerDatos(urlImpuesto);
                cargarTablaImpuesto(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Importación exitosa")
            }
            const error = () => {
                alertaDeError(contenedorDeAlertas, "Ocurrió un error")
            }

            // Enviar el registro a la API
            const datos = {
                codigo: registro.codigoimpuesto,
                nombre: registro.nombreimpuesto,
                tasa: registro.tasa,
                descripcion: registro.descripcion,
                idempresa: EMPRESA_ID,
                ver: "impuestocrear"
            }
            enviarDatosOJson({
                datos: datos,
                urlSolicitud: URL,
                callbackExito: accionEnviar,
                callbackError: error
            });

        }
        const modal = modalDeConfirmacion(registrar, "¿Está seguro de importar este Impuesto?");
        vistaPrincipal.appendChild(modal);
        modal.querySelector("button[data-id='__btn-confirmar']").focus();
    });

    return boton;
}