import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión del plan de cuentas
 *              Permite importar planes de cuentas, ya sea agregándolos o reemplazándolos.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
export const PlanCuentas = (datosVista) => {
    const {
        codigo,
        permisos,
        vistaPlanDeCuentas,
        vistaImportarPlanCuentas,
        contenedorAlertasPdC,
        urlPlanDeCuentas,
        cargarTablaPlanDeCuenta,
        recargarCampoPdC,

    } = datosVista;

    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listaplanesempresa/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaImportarPlanCuentas.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = () => {
        cambiarVista(vistaImportarPlanCuentas, vistaPlanDeCuentas)
        vistaImportarPlanCuentas.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Plan de Cuentas Modelo", textoInformacion: "(El presente plan de cuentas se sugiere en base a su rubro empresarial)" }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (PUEDE_ESCRIBIR) {
        // Función para recargar la tabla de la vista principal.
        const recargarTablaPlanDeCuentas = async (texto) => {
            const datos = await obtenerDatos(urlPlanDeCuentas);
            cargarTablaPlanDeCuenta(datos);
            recargarCampoPdC();
            alertaDeExito(contenedorAlertasPdC, texto);
            cambiarVista(vistaImportarPlanCuentas, vistaPlanDeCuentas);
            vistaImportarPlanCuentas.innerHTML = "";
        };
        // Botón para agregar los planes de cuentas
        const botonAgregarPlanes = botonAgregarPlanDeCuentas({
            urlSolicitud: `${URL}agregarplanes/${EMPRESA_ID}`,
            vista: vistaPrincipal,
            contenedorDeAlertas,
            callback: recargarTablaPlanDeCuentas
        });

        // Botón para agregar los planes de cuenta y reemplazar los existentes
        const botonReemplazarPlanes = botonReemplazarPlanDeCuentas({
            urlSolicitud: `${URL}reemplazarplanes/${EMPRESA_ID}`,
            vista: vistaPrincipal,
            contenedorDeAlertas,
            callback: recargarTablaPlanDeCuentas
        });

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonAgregarPlanes,
            botonReemplazarPlanes,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }

    const encabezadoTabla = [
        "Código",
        "Cuenta",
        "Tipo",
        "Descripción",
    ];
    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    vistaPrincipal.append(divTabla);

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
                crearElemento("td", { class: "text-end" }, [registro.numero || "-"]),
                crearElemento("td", undefined, [registro.plan || "-"]),
                crearElemento("td", undefined, [registro.tipo || "-"]),
                crearElemento("td", undefined, [registro.descripcion || "-"]),
            ];

            const fila = crearElemento("tr", undefined, celdas);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la ventana
    seccionDriverJS(
        [
            {
                popover: {
                    title: "Plan de Cuentas Modelo",
                    description: "En esta sección, puede importar un plan de cuentas modelo sugerido para su rubro empresarial.",
                }
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='pdc-importar-btn-agregar']",
                popover: {
                    title: "Agregar Plan de Cuentas",
                    description: "Agrega el plan de cuentas modelo sugerido a su configuración actual. Esta acción no eliminará ni modificará las cuentas existentes en su plan actual.",
                }
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='pdc-importar-btn-reemplazar']",
                popover: {
                    title: "Reemplazar Plan de Cuentas",
                    description: "Reemplaza su plan de cuentas actual con el plan modelo sugerido. Esta acción eliminará todas las cuentas existentes en su plan actual y las sustituirá por las nuevas cuentas del plan modelo.",
                }
            },
            {
                element: divTabla,
                popover: {
                    title: "Listado de Cuentas (Administración)",
                    description: "Muestra el listado de cuentas incluidas en el plan de cuentas modelo sugerido para su rubro empresarial.",
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
 * Función: Crea el botón para agregar planes de cuentas
 * Descripción: Este botón permite agregar planes de cuentas al sistema previa confirmación.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
function botonAgregarPlanDeCuentas(opciones) {
    const {
        urlSolicitud,
        contenedorDeAlertas,
        callback,
        vista
    } = opciones;
    const Agregar = async () => {
        const datos = await obtenerDatos(urlSolicitud);
        if (datos !== false) {
            // Recargar la tabla de plan de cuentas con los nuevos datos
            await callback("Se agregaron los planes de cuentas correctamente.");
        } else {
            alertaDeError(contenedorDeAlertas, "Ocurrio un error al agregar");
        }
    };
    const agregarPlanes = () => {
        const modal = modalDeConfirmacion(Agregar, "¿Está seguro de agregar los planes de cuentas?");
        vista.appendChild(modal);
        modal.querySelector("button[data-id='__btn-confirmar']").focus();
    };

    const boton = elementoBoton({
        texto: "Agregar Plan de Cuentas",
        icono: "file-earmark-arrow-down",
        id: "pdc-importar-btn-agregar",
        callback: agregarPlanes,
    })
    return boton;
}

/**
 * Función: Crea el botón para reemplazar planes de cuentas
 * Descripción: Este botón permite reemplazar los planes de cuentas existentes en el sistema previa confirmación.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
function botonReemplazarPlanDeCuentas(opciones) {
    const {
        urlSolicitud,
        contenedorDeAlertas,
        callback,
        vista
    } = opciones;
    const reemplazar = async () => {
        const datos = await obtenerDatos(urlSolicitud);
        if (datos !== false) {
            // Recargar la tabla de plan de cuentas con los nuevos datos
            await callback("Se reemplazaron los planes de cuentas correctamente.");
        } else {
            alertaDeError(contenedorDeAlertas, "Ocurrio un error al reemplazar");
        }
    };
    const reemplazarPlanes = () => {
        const modal = modalDeConfirmacion(reemplazar, "¿Está seguro de reemplazar los planes de cuentas?");
        vista.appendChild(modal);
        modal.querySelector("button[data-id='__btn-confirmar']").focus();
    };
    const boton = elementoBoton({
        texto: "Reemplazar Plan de Cuentas",
        icono: "arrow-repeat",
        id: "pdc-importar-btn-reemplazar",
        callback: reemplazarPlanes,
    })
    return boton;
}