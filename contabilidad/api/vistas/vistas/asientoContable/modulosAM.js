import { manejarSelect } from "../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, divOpcionesVista, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalRegistro, modalFormularioEditar } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { formularioModuloAM, optnsMAMBandera } from "./Formularios.js";

/**
 * Función: Crea el contenido principal del menú.
 * Descripción: Esta función genera el contenido principal del menú para la gestión de la vinculación de módulos con asientos modelo.
 * Fecha: 08 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaModulosAM - Contenedor principal donde se renderiza la vista.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function ModulosAM(permisos, vistaModulosAM, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_asignacion_asiento_operacion/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaModulosAM.replaceChildren(vistaPrincipal);

    // Creación de elementos para la vista principal
    const encabezadoVista = seccionEncabezado({ titulo: "Listado de vinculación de Módulos con Asientos Modelo" });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    if (PUEDE_ESCRIBIR) {
        // Función para limpiar los selects del formulario después de registrar
        const limpiarSelectsFormulario = () => {
            const selectTipoTransaccion = vistaPrincipal.querySelector("#moduloam-tipotransaccion");
            const selectAsientoModelo = vistaPrincipal.querySelector("#moduloam-asientomodelo");

            selectTipoTransaccion.selectize?.destroy();
            selectAsientoModelo.selectize?.destroy();
            selectTipoTransaccion.innerHTML = "<option value=''>-- Seleccione un Módulo --</option>";
            selectAsientoModelo.innerHTML = "<option value=''>-- Seleccione un Módulo --</option>";
        };
        // Creación de formulario para realizar un nuevo registro
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioModuloAM,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nueva Vinculación",
                },
                camposAdicionales: {
                    ver: "registrar_asignacion_asiento_operacion",
                    idempresa: EMPRESA_ID,
                },
                callbacks: {
                   alRegistrar: limpiarSelectsFormulario
                }
            },
            vistaPrincipal
        );

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonRegistrar
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }

    // Crear la estructura de la tabla y su buscador
    const encabezadoTabla = [
        "Módulo",
        "Tipo Operación",
        "Asiento Modelo",
        "Tipo de registro",
        "Opciones",
    ];
    // Si no tiene permisos ni para editar ni para eliminar, se remueve la columna de opciones
    if (!PUEDE_EDITAR) {
        encabezadoTabla.pop();
    }

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, divTabla);

    // Manejo del listado
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
        contenedorAlertas: contenedorDeAlertas,
        cuerpoTabla: tbody,
    });

    function cargarContenidoTabla(listaRegistros) {
        const validado = validarListadoTabla(listaRegistros);
        if (!validado.valido) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        for (const registro of listaRegistros) {
            const bandera = optnsMAMBandera.find(opc => opc.clave === registro.bandera?.toString());
            const celdas = [
                crearElemento("td", { class: "text-start" }, [registro.nombre_modulo || "-"]),
                crearElemento("td", { class: "text-start" }, [registro.nombre_operacion || "-"]),
                crearElemento("td", { class: "text-start" }, [registro.nombre_asiento || "-"]),
                crearElemento("td", { class: "text-start" }, [bandera ? bandera.valor : "-"]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();

                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar = botonEditarVinculacion(
                        () => {
                            const modalEditar = modalFormularioEditar({
                                contenedorDeAlertas,
                                camposDeFormulario: formularioModuloAM,
                                URL_FORM: URL,
                                URL_LISTAR: URL_LT,
                                configuracionModal: {
                                    tituloModal: "Edición de Vinculación",
                                },
                                camposAdicionales: {
                                    ver: "editar_asignacion_asiento_operacion",
                                    idasignacion_asiento_operacion_modulos: registro.idasignacion_asiento_operacion_modulos
                                },
                                datosRegistro: registro,
                                cargarContenidoTabla
                            });

                            recargarSelectsFormulario(modalEditar, registro);
                            vistaPrincipal.appendChild(modalEditar);
                        }
                    );
                    fragmentOpciones.append(botonEditar, " ");
                }

                tdOpciones.appendChild(fragmentOpciones);
                celdas.push(tdOpciones);
            }
            const fila = crearElemento("tr", undefined, celdas);
            fragment.appendChild(fila);
        }
        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la vista
    const divContenedorCabecera = vistaModulosAM.closest("#contenedor-cabecera");
    const btnMomoduloAM = divContenedorCabecera.querySelector("[data-id='moduloam']");
    const informacionDJs = [
        {
            element: btnMomoduloAM,
            popover: {
                title: "Módulo Asiento Modelo",
                description: "En esta sección los Asientos Modelo Creados previamente, podrá asignar a las operaciones del Módulo a vincular (Ej. Comercial). Así mismo podrá indicar si la transacción generada se registrará automáticamente en el libro diario o estará sujeto a aprobación.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Nuevo registro",
                description: "Abre un formulario para vincular un Asiento Modelo a una operación del Módulo seleccionado.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar",
                description: "Permite hacer una búsqueda considerando todas las columnas de la lista.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Lista de Módulos vinculados",
                description: "Muestra todos los Módulos vinculados a los Asientos Modelo registrados en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar",
                description: "Abre un formulario para modificar los datos del registro seleccionado.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

// Botón para insertar cuenta debajo de la cuenta actual
function botonEditarVinculacion(callback) {
    const icono = crearElemento("i", { class: "bi bi-pencil-square" });
    const boton = crearElemento("button", { class: "btn btn-warning btn-sm", type: "button", title: "Editar" }, [icono]);

    boton.addEventListener("click", async () => {
        await callback();
    });
    return boton;
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

/**
 * Función: Recargar los selects del formulario de edición.
 * Descripción: Esta función se encarga de recargar los selects del formulario de edición, basándose en los datos del registro a editar.
 * Fecha: 08 de enero de 2026
 * Autor: Joel Choque
 */
async function recargarSelectsFormulario(formulario, registro) {
    const empresa_id = getEmpresaId();
    const URL = CT_URLAPI;
    const selectTipoTransaccion = formulario.querySelector("#moduloam-tipotransaccion");
    const selectAsientoModelo = formulario.querySelector("#moduloam-asientomodelo");

    // Recargar select Asiento Modelo
    manejarSelect(
        selectAsientoModelo,
        {
            urlSolicitud: `${URL}listar_asiento_por_modulo/${registro.nombre_modulo}/${empresa_id}`,
            llavesOpciones: { valor: "idasientotipo", detalle: "nombre" },
        },
        registro.idasientotipo
    );

    // Recargar select Tipo Transacción
    const datosListaOp = await obtenerDatos(`${URL}listar_operacion_modulo_filtrado/${registro.nombre_modulo}`);
    if (datosListaOp) {
        // Asegurar que la opción actual de Tipo Transacción esté en la lista
        if (registro.idoperacion_modulos) {
            datosListaOp.unshift({
                idoperacion_modulos: registro.idoperacion_modulos,
                nombre_operacion: registro.nombre_operacion,
                descripcion: registro.descripcion_operacion
            });
        }
        manejarSelect(
            selectTipoTransaccion,
            {
                datosRegistro: datosListaOp,
                llavesOpciones: { valor: "idoperacion_modulos", detalle: ["nombre_operacion", "descripcion"] }
            },
            registro.idoperacion_modulos
        );
    } else {
        selectTipoTransaccion.selectize?.destroy();
        selectTipoTransaccion.innerHTML = "<option value=''>-- error al listar --</option>";
    }
}