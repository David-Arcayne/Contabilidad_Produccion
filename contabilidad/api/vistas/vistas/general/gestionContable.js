import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresa, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { ajustarFecha, crearElemento, divOpcionesVista, formatoFecha, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { formularioGestionContable, optnsTipoDocumento } from "./Formularios.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión contable
 *              Permite registrar, editar, eliminar y cambiar el estado de las gestiones contables mediante formularios y tablas dinámicas.
 * Fecha: 30 de diciembre de 2025
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaGestionContable - Contenedor principal donde se renderiza la vista de gestión contable.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function GestionContable(permisos, vistaGestionContable, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listadegestion/${EMPRESA_ID}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaGestionContable.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({ titulo: "Listado de Gestiones Contables" });
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.append(encabezadoVista, contenedorDeAlertas);
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioGestionContable(),
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nueva Gestión Contable",
                },
                camposAdicionales: {
                    ver: "registrogestion",
                    empresa: EMPRESA_ID,
                },
                callbacks: {
                    previaSolicitud: validarFechaGestion(vistaPrincipal),
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

    // Crear la estructura de la tabla y su buscador
    const encabezadoTabla = [
        "Gestión",
        "Fecha inicio",
        "Fecha final",
        "Fecha",
        "Formato Trans.",
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
            const formatoTransaccion = optnsTipoDocumento.find(opc => opc.clave === registro.formato_transaccion);
            const celdas = [
                crearElemento("td", undefined, [registro.nombre || "-"]),
                crearElemento("td", { class: "text-end"}, [formatoFecha(registro.fechaini) || "-"]),
                crearElemento("td", { class: "text-end"}, [formatoFecha(registro.fechafin) || "-"]),
                crearElemento("td", { class: "text-end"}, [formatoFecha(registro.fecha) || "-"]),
                crearElemento("td", undefined, [formatoTransaccion ? formatoTransaccion.valor : "-"]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioGestionContable(registro),
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Gestión Contable",
                            },
                            camposAdicionales: {
                                ver: "registrogestionf5",
                                empresa: EMPRESA_ID,
                                idgestion: registro.id,
                            },
                            callbacks: {
                                previaSolicitud: validarFechaGestion(vistaPrincipal),
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );

                    // Crear botón para cambiar el estado de la gestión contable
                    const botonEstado = botonCambiarEstadoGestion({
                        vistaPrincipal,
                        contenedorDeAlertas,
                        cargarContenidoTabla,
                        URL_LT,
                        registro,
                    });

                    fragmentOpciones.append(botonEstado, " ", botonEditar, " ");
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}eliminar_gestion_contable/${registro.id}`,
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
    const divContenedorCabecera = vistaGestionContable.closest("#contenedor-cabecera");
    const btnGestionContable = divContenedorCabecera.querySelector("[data-id='gestioncontable']");
    const informacionDJs = [
        {
            element: btnGestionContable,
            popover: {
                title: "Gestiones contables",
                description: "Permite crear la gestión contable y habilitarla, periodo según la determinación tributaria. Las fechas establecidas son los parámetros para los registros y reportes.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Agregar gestión contable",
                description: "Abre un formulario para registrar una nueva gestión contable en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "#__buscador",
            popover: {
                title: "Buscar gestión",
                description: "Permite buscar gestiones contables considerando todos los campos disponibles.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de gestiones contables",
                description: "Muestra todas las gestiones contables registradas en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[data-id='boton-estado']",
            popover: {
                title: "Activar / Desactivar",
                description: "Permite activar o desactivar la gestión contable seleccionada. Al activar una nueva gestión, se desactivará la anterior.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar gestión",
                description: "Abre un formulario para modificar los datos de la gestión contable seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar gestión",
                description: "Permite eliminar la gestión contable seleccionada, previa confirmación.",
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
 * Función: Crea el botón para cambiar el estado de la gestión contable.
 * Descripción: Esta función crea un botón que permite activar o desactivar una gestión contable según su estado actual, previa confirmación.
 * Fecha: 30 de diciembre de 2025
 * Autor: Joel Choque
 */
function botonCambiarEstadoGestion(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        URL_LT,
        registro,
    } = datosVista;

    const URL = CT_URLAPI;
    const botonEstado = crearElemento("button", { type: "button", "data-id": "boton-estado" });

    const empresa_id = getEmpresaId();
    if (registro.estado == 2) {
        // Crear estilos y funcionamiento del boton para desactivar la gestion
        const i = crearElemento("i", {class: "bi bi-hand-thumbs-up-fill"});
        botonEstado.setAttribute("class", "btn btn-success btn-sm");
        botonEstado.setAttribute("title", "Desactivar");
        botonEstado.append(i);
        const desactivar = async () => {
            // Desactivar la gestion
            const datos = await obtenerDatos(`${URL}estadogestion/${registro.id}/1/${empresa_id}`);
            if (datos !== false) {
                // Recargar la tabla con los nuevos datos
                const listaDeRegistros = await obtenerDatos(URL_LT);
                alertaDeExito(contenedorDeAlertas, "Gestión desactivada");
                cargarContenidoTabla(listaDeRegistros);
            } else {
                alertaDeError(contenedorDeAlertas, "Ocurrio un error");
            }
        };
        // Evento para desactivar la gestion
        botonEstado.addEventListener("click", () => {
            const modal = modalDeConfirmacion(desactivar, "¿Desea desactivar la gestion?");
            vistaPrincipal.append(modal);
            modal.querySelector("button[data-id='__btn-confirmar']").focus();
        })

    } else {
        // Crear estilos y funcionamiento del boton para activar la gestion
        const i = crearElemento("i", {class: "bi bi-hand-thumbs-down-fill"});
        botonEstado.setAttribute("class", "btn btn-danger btn-sm");
        botonEstado.setAttribute("title", "Activar");
        botonEstado.append(i);
        const activar = async () => {
            // Activar la gestion
            const datos = await obtenerDatos(`${URL}estadogestion/${registro.id}/2/${empresa_id}`);
            if (datos !== false) {
                // Recargar la tabla con los nuevos datos
                const listaDeRegistros = await obtenerDatos(URL_LT);
                alertaDeExito(contenedorDeAlertas, "Gestión activada");
                cargarContenidoTabla(listaDeRegistros);
            } else {
                alertaDeError(contenedorDeAlertas, "Ocurrio un error");
            }
        };
        // Evento para activar la gestion
        botonEstado.addEventListener("click", () => {
            const modal = modalDeConfirmacion(activar, "¿Desea activar la gestión?");
            vistaPrincipal.append(modal);
            modal.querySelector("button[data-id='__btn-confirmar']").focus();
        });
    }

    return botonEstado;
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

/**
 * Función: Valida que las fechas de gestión coincidan con el cierre fiscal.
 * Descripción: Esta función verifica que la fecha ingresada en el formulario tengan relación con la fecha de cierre fiscal de la empresa.
 *              Esta función se maneja como una función previa al envío del formulario de registro o edición de gestión contable.
 * Fecha: 30 de diciembre de 2025
 * Autor: Joel Choque
 */
function validarFechaGestion(vista){
    return (enviarFormulario, formulario) => {
        const cierreFiscal = getEmpresa()?.ocierrefiscal;
        const fechaInicio = formulario.querySelector("#gestioncontable-fechainicio")?.value;
        const fechaFin = formulario.querySelector("#gestioncontable-fechafinal")?.value;

        if (!cierreFiscal) {
            enviarFormulario();
            return;
        }
        // Obtener la fecha de referencia según el cierre fiscal
        const [dia, mes] = cierreFiscal.split("/");
        const [anioF] = fechaFin?.split("-");
        const fechaRefFinal = anioF + "-" + mes.toString().padStart(2, "0") + "-" + dia.toString().padStart(2, "0");
        const fechaRefInicial = ajustarFecha({ fecha: fechaRefFinal, anios: -1, dias: 1, forma: "fecha" });

        if (fechaInicio === fechaRefInicial && fechaFin === fechaRefFinal) {
            enviarFormulario();
        } else {
            const modal = modalDeConfirmacion(() => enviarFormulario(), `Las fechas no coinciden con la fecha de cierre fiscal: ${cierreFiscal} , ¿Desea continuar?`);
            vista.appendChild(modal);
            modal.querySelector("button.btn-primary").focus();
        }
        return;
    };
}
