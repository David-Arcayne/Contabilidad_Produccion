import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, refreshDivisaCache } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, divOpcionesVista, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../funciones/Modals.js";
import { botonModalEditar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { enviarDatosOJson, obtenerDatos } from "../../funciones/Solicitudes.js";
import { formularioDivisas } from "./Formularios.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de divisas
 *              Permite registrar, editar y activar divisas mediante formularios y tablas dinámicas.
 * Fecha: 31 de diciembre de 2025
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaDivisas - Contenedor principal donde se renderiza la vista de divisas.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function Divisas(permisos, vistaDivisas, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_divisa/${EMPRESA_ID}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaDivisas.append(vistaPrincipal);


    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Listado de Divisas"});
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioDivisas,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nueva Divisa",
                    estiloModal: "width: 800px;",
                },
                camposAdicionales: {
                    ver: "registrar_divisa",
                    idempresa: EMPRESA_ID,
                    estado: 2,
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

    const encabezadoTabla = [
        "Simbolo",
        "Nombre",
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
                crearElemento("td", undefined, [registro.simbolo]),
                crearElemento("td", undefined, [registro.nombre]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioDivisas,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Divisa",
                                estiloModal: "width: 800px;",
                            },
                            camposAdicionales: {
                                ver: "editar_divisa",
                                idempresa: EMPRESA_ID,
                                iddivisa: registro.iddivisa,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );

                    // Crear botón para cambiar el estado de la divisa
                    const botonEstado = botonCambiarEstadoDivisa({
                        vistaPrincipal,
                        contenedorDeAlertas,
                        cargarContenidoTabla,
                        URL_LT,
                        registro,
                    });

                    fragmentOpciones.append(botonEstado, " ", botonEditar, " ");
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
    const divContenedorCabecera = vistaDivisas.closest("#contenedor-cabecera");
    const btnDivisas = divContenedorCabecera.querySelector("[data-id='divisas']");
    const informacionDJs = [
        {
            element: btnDivisas,
            popover: {
                title: "Divisas",
                description: "Permite crear la moneda oficial que se usará para el manejo del sistema, puede registrar varios pero, solo podrá habilitar una.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Agregar divisa",
                description: "Abre un formulario para registrar una nueva divisa en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "#__buscador",
            popover: {
                title: "Buscar divisa",
                description: "Permite buscar divisas considerando todos los campos disponibles.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de divisas",
                description: "Muestra todas las divisas registradas en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Activar']",
            popover: {
                title: "Activar divisa",
                description: "Permite activar la divisa seleccionada. Solo una divisa puede estar activa a la vez.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar divisa",
                description: "Abre un formulario para modificar los datos de la divisa seleccionada.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea el botón para cambiar el estado de la divisa
 * Descripción: Esta función genera un botón que permite activar una divisa si está inactiva.
 * Fecha: 31 de diciembre de 2025
 * Autor: Joel Choque
 */
function botonCambiarEstadoDivisa(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        URL_LT,
        registro,
    } = datosVista;

    const URL = CT_URLAPI;
    const botonEstado = crearElemento("button", { type: "button", "data-id": "boton-estado" });

    if (registro.estado === 2) {
        // Crear estilos y funcionamiendo del boton para activar la divisa
        const i = crearElemento("i", {class: "bi bi-hand-thumbs-down-fill"});
        botonEstado.setAttribute("class", "btn btn-danger btn-sm");
        botonEstado.setAttribute("title", "Activar");
        botonEstado.append(i);
        const activar = async () => {
            const enviado = async () => {
                // Guardar la divisa activada en el localStorage y cargar la tabla
                localStorage.setItem("divisa", JSON.stringify(registro));
                refreshDivisaCache();
                const listaDeRegistros = await obtenerDatos(URL_LT);
                alertaDeExito(contenedorDeAlertas, "Divisa activada");
                cargarContenidoTabla(listaDeRegistros);

            }
            const error = () => {
                alertaDeError(contenedorDeAlertas, "Ocurrio un error al activar la divisa");
            }
            const datos = {
                iddivisa: registro.iddivisa,
                ver: "activar_divisa"
            }
            // Enviar solicitud para activar la divisa
            await enviarDatosOJson({
                datos,
                urlSolicitud: URL,
                callbackExito: enviado,
                callbackError: error,
            });
        }
        // Evento para actuvar la divisa
        botonEstado.addEventListener("click", () => {
            const modal = modalDeConfirmacion(activar, "¿Desea activar esta divisa?");
            vistaPrincipal.append(modal);
            modal.querySelector("button[data-id='__btn-confirmar']").focus();
        });
    } else {
        // Crear estilos del boton cuando la divisa ya está activada
        const i = crearElemento("i", {class: "bi bi-hand-thumbs-up-fill"});
        botonEstado.setAttribute("class", "btn btn-success btn-sm pe-none");
        botonEstado.setAttribute("title", "Divisa Activada");
        botonEstado.append(i);
    }

    return botonEstado;
}