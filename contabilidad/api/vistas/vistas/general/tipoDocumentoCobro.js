import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioTipoDocumentoCobro } from "./Formularios.js";
import { FrecuenciaPago } from "./FrecuenciaPago.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de tipos de documentos de cobro
 *              Permite registrar, editar y eliminar tipos de documentos mediante formularios y tablas dinámicas.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaTipoDocumentoCobro - Contenedor principal donde se renderiza la vista de tipos de documentos de cobro.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function TipoDocumentoDeCobro(permisos, vistaTipoDocumentoCobro, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_tipo/${EMPRESA_ID}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaFrecuenciaPago = crearElemento("div", { class: "d-none", "data-pane-id": "frecuencia-pago" });
    vistaTipoDocumentoCobro.append(vistaPrincipal);


    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Tipos de Documento", alinearTitulo: "start" });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // // Botón que abre la vista de frecuencia de pago
    // const botonFrecuenciaPago = elementoBoton({
    //     texto: "Frecuencia de Pago",
    //     icono: "calendar-event",
    //     id: "gen-pc-btn-frecuenciapago",
    //     callback: () => {
    //         cambiarVista(vistaPrincipal, vistaFrecuenciaPago);
    //         FrecuenciaPago({
    //             codigo: datosVistaPrincipal.codigo,
    //             permisos,
    //             vistaTipoDocumento: vistaPrincipal,
    //             vistaFrecuenciaPago,
    //         });
    //     }
    // });

    // let arrayOpcionesBtn = [botonFrecuenciaPago];
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioTipoDocumentoCobro,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nuevo Tipo de Documento",
                    estiloModal: "width: 800px;",
                },
                camposAdicionales: {
                    ver: "registrar_tipo",
                    empresa: EMPRESA_ID,
                },
            },
            vistaPrincipal,
        );

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonRegistrar,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }

    const encabezadoTabla = [
        "Tipo de documento",
        "Descripción",
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
                crearElemento("td", undefined, [registro.nombre ?? "-"]),
                crearElemento("td", undefined, [registro.descripcion ?? "-"]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioTipoDocumentoCobro,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Tipo de Documento",
                                estiloModal: "width: 800px;",
                            },
                            camposAdicionales: {
                                ver: "editar_tipo",
                                empresa: EMPRESA_ID,
                                idtipo: registro.idtipo,
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
                            URL: `${URL}eliminar_tipo/${registro.idtipo}`,
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
    const divContenedorCabecera = vistaTipoDocumentoCobro.closest("#contenedor-cabecera");
    const btnParaContrataciones = divContenedorCabecera.querySelector("[data-id='tipodocumentocobro']");
    const btnTipoDocumento = divContenedorCabecera.querySelector("[data-action='tipo-documento']");
    const informacionDJs = [
        {
            element: btnParaContrataciones,
            popover: {
                title: "Para Contrataciones",
                description: "Permite estableces los datos necesarios para generar una Contratación.",
            },
        },
        {
            element: btnTipoDocumento,
            popover: {
                title: "Tipo Otros Documentos",
                description: "Permite establecer los tipos de documentos de Cobro o Pago que se maneja y son diferentes a las facturas que no generan Crédito o Débito Fiscal.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Agregar Tipo de Documento",
                description: "Abre un formulario para registrar un nuevo tipo de documento en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "#__buscador",
            popover: {
                title: "Buscar Tipo de Documento",
                description: "Permite buscar tipos de documentos considerando todos los campos disponibles.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de Tipos de Documentos",
                description: "Muestra todos los tipos de documentos registrados en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar Tipo de Documento",
                description: "Abre un formulario para modificar los datos del tipo de documento seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar Tipo de Documento",
                description: "Permite eliminar el tipo de documento seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}