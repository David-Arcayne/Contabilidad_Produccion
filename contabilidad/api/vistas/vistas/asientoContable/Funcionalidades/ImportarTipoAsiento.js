import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de tipos de asiento
 *              Permite importar tipos de asiento mediante formularios y tablas dinámicas.
 * Fecha: 07 de enero de 2026
 * Autor: Joel Choque
 */
export const Importar = (datosVista) => {
    const {
        codigo,
        permisos,
        vistaTipoAsiento,
        vistaImportarTipoAsiento,
        urlTipoAsiento,
        contenedorAlertasTA,
        cargarTablaTipoAsiento,
    } = datosVista;

    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const URL = CT_URLAPI;
    const URL_LT = `${URL}tipotransaccion`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaImportarTipoAsiento.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = () => {
        cambiarVista(vistaImportarTipoAsiento, vistaTipoAsiento)
        vistaImportarTipoAsiento.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Tipos de Asiento" }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Creación de elementos para la vista Principal
    const tiposAsientoAdmin = [];
    if (PUEDE_ESCRIBIR) {
        const recargarTablaTipoAsiento = async (texto) => {
            const datos = await obtenerDatos(urlTipoAsiento);
            cargarTablaTipoAsiento(datos);
            alertaDeExito(contenedorAlertasTA, texto);
            cambiarVista(vistaImportarTipoAsiento, vistaTipoAsiento);
            vistaImportarTipoAsiento.innerHTML = "";
        };
        // Creación del botón para importar todos los tipos de asiento desde administración
        const botonImportarTodo = botonImportarTiposDeAsiento({ URL, registrosTiposAsientoAdmin: tiposAsientoAdmin, vistaPrincipal, contenedorDeAlertas, recargarTablaTipoAsiento });

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonImportarTodo,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Nombre",
        "Detalle",
    ];
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
        if (PUEDE_ESCRIBIR) tiposAsientoAdmin.push(...listaRegistros);

        const fragment = document.createDocumentFragment();

        for (const registro of listaRegistros) {
            const celdas = [
                crearElemento("td", undefined, [registro.nombre || "-"]),
                crearElemento("td", undefined, [registro.detalle || "-"]),
            ];

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
                    title: "Tipos de Asiento",
                    description: "En esta sección puede importar los tipos de asiento sugeridos desde Admin.",
                }
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='ta-importar-btn-importar']",
                popover: {
                    title: "Importar Tipos de Asiento",
                    description: "Realiza la importación de todos los tipos de asiento sugeridos.",
                }
            },
            {
                element: divTabla,
                popover: {
                    title: "Listado de Tipos de Asiento",
                    description: "Muestra el listado de todos los tipos de asiento sugeridos desde Admin.",
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
 * Función: Crea el botón para importar todos los tipos de asiento desde administración.
 * Descripción: Se realiza la importación de los tipos de asiento por lotes de administración, previa confirmación.
 * Fecha: 07 de enero de 2026
 * Autor: Joel Choque
 */
function botonImportarTiposDeAsiento(datosVista) {
    const {
        URL,
        vistaPrincipal,
        registrosTiposAsientoAdmin,
        contenedorDeAlertas,
        recargarTablaTipoAsiento
    } = datosVista;

    const empresaId = getEmpresaId();
    // Función para enviar el registro de tipo de asiento al servidor
    const enviarRegistro = async (registro) => {
        const formData = new FormData();
        formData.append("nombre", registro.nombre);
        formData.append("detalle", registro.detalle);
        formData.append("empresa", empresaId);
        formData.append("ver", "creartipoasiento");
        try {
            const response = await fetch(URL, {
                method: "POST",
                body: formData
            });
            if (!response.ok) return false;

            const res = await response.json();
            return res.ok === "success";
        } catch {
            return false;
        }
    };
    // Función para importar los tipos de asiento por lotes
    const importarPorLotes = async () => {
        if (!registrosTiposAsientoAdmin?.length) {
            alertaDeError(contenedorDeAlertas, "No hay asientos para importar.");
            return;
        }

        let registrados = 0;
        const BATCH_SIZE = 5;
        const total = registrosTiposAsientoAdmin.length;
        // Procesar los registros en lotes
        for (let i = 0; i < total; i += BATCH_SIZE) {
            const lote = registrosTiposAsientoAdmin.slice(i, i + BATCH_SIZE);
            const resultados = await Promise.all(
                lote.map(enviarRegistro)
            );
            registrados += resultados.filter(Boolean).length;
        }

        // Mensaje según el resultado de la importación
        if (registrados === total) {
            await recargarTablaTipoAsiento("Asientos importados correctamente.");
        } else if (registrados > 0) {
            await recargarTablaTipoAsiento("Algunos asientos no pudieron ser importados.");
        } else {
            alertaDeError(
                contenedorDeAlertas,
                "Ocurrió un error al importar los asientos."
            );
        }
    };
    // Maneja la confirmación de la importación
    const manejarImportacion = () => {
        const modal = modalDeConfirmacion(importarPorLotes, "¿Está seguro de importar los asientos?");
        vistaPrincipal.appendChild(modal);
        modal.querySelector("button[data-id='__btn-confirmar']").focus();
    };

    return elementoBoton({
        texto: "Importar",
        icono: "file-earmark-arrow-down",
        id: "ta-importar-btn-importar",
        callback: manejarImportacion
    });
}