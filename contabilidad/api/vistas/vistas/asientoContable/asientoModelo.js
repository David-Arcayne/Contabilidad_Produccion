import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, formatoTexto, InputBusqueda, resaltarTexto, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioTipoAsiento } from "./Formularios.js";
import { AgregarAsiento } from "./Funcionalidades/AgregarAsiento.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de asientos modelo
 *              Permite registrar, editar y eliminar asientos modelo mediante formularios y tablas dinámicas.
 * Fecha: 07 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaAsientoModelo - Contenedor principal donde se renderiza la vista de asientos modelo.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function AsientoModelo(permisos, vistaAsientoModelo, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listaasientos/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaAgregarAsiento = crearElemento("div", { class: "d-none", "data-pane-id": "agregar-asiento" });
    vistaAsientoModelo.append(vistaPrincipal, vistaAgregarAsiento);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Creación de Asientos Modelo"});
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para realizar un nuevo registro
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioTipoAsiento,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nuevo Asiento Modelo",
                },
                camposAdicionales: {
                    ver: "registroasiento",
                    empresa: EMPRESA_ID,
                },
            },
            vistaPrincipal
        );

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonRegistrar,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }

    const encabezadoTabla = [ // Encabezado de la tabla
        "Nombre asiento",
        "Tipo",
        "Tipo - Módulo",
        "Opciones",
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
                crearElemento("td", undefined, [registro.nombre || "-"]),
                crearElemento("td", undefined, [registro.tipo || "-"]),
                crearElemento("td", undefined, [obtenerTipoModulo(registro.tipo_modulo)]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });
            // Botón para abrir la vista de agregar asiento
            const botonAsiento = botonAgregarAsiento(
                () => {
                    cambiarVista(vistaPrincipal, vistaAgregarAsiento);
                    AgregarAsiento({
                        permisos,
                        vistaAsientoModelo: vistaPrincipal,
                        vistaAgregarAsiento,
                        registroAsiento: registro,
                    });
                }
            );
            tdOpciones.append(botonAsiento, " ");
            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioTipoAsiento,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Asiento Modelo",
                            },
                            camposAdicionales: {
                                ver: "registroasientof5",
                                empresa: EMPRESA_ID,
                                id: registro.id,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    tdOpciones.append(botonEditar, " ");
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}eliminarasiento/${registro.id}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                        },
                        vistaPrincipal
                    );
                    tdOpciones.append(botonEliminar, " ");
                }
            }
            celdas.push(tdOpciones);
            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }


    // Configuración de ayudas visuales de la vista
    const divContenedorCabecera = vistaAsientoModelo.closest("#contenedor-cabecera");
    const btnAsientoModelo = divContenedorCabecera.querySelector("[data-id='asientomodelo']");
    const informacionDJs = [
        {
            element: btnAsientoModelo,
            popover: {
                title: "Asiento Modelo",
                description: "Permite crear un Asiento Modelo, para automatizar el registro de transacciones, considerando el tipo de Comprobante y si este Asiento será una interfaz para conectarse con otros módulos.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Nuevo registro",
                description: "Abre un formulario para agregar un nuevo Asiento Modelo al sistema.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar Asiento Modelo",
                description: "Permite hacer una búsqueda considerando todas las columnas de la lista.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Lista de Asientos Modelo",
                description: "Muestra todos los Asientos Modelo registrados en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Agregar Cuentas']",
            popover: {
                title: "Agregar Cuentas",
                description: "Permite agregar cuentas al Asiento Modelo seleccionado, para definir cómo se registrarán las transacciones.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar Asiento Modelo",
                description: "Abre un formulario para modificar los datos del asiento modelo seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar Asiento Modelo",
                description: "Permite eliminar el registro del asiento modelo seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

// Crea el botón para ir a la vista de agregar asiento
function botonAgregarAsiento(callback) {
    const icono = crearElemento("i", { class: "bi bi-card-list" });
    const boton = crearElemento("button", { class: "btn btn-primary btn-sm", title: "Agregar Cuentas", type: "button" }, [icono]);
    boton.addEventListener("click", (e) => {
        e.preventDefault();
        callback();
    });
    return boton;
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Obtiene tipo de módulo formateado y resaltado
function obtenerTipoModulo (tipo) {
    if (tipo === "estandar") {
        return resaltarTexto("blue", "Estandar");
    } else if (tipo) {
        return resaltarTexto("green", formatoTexto(tipo));
    } else {
        return "-";
    }
}