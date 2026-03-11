import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioTiposDeAsiento } from "./Formularios.js";
import { Importar } from "./Funcionalidades/ImportarTipoAsiento.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de tipos de asiento contable
 *              Permite registrar, editar, eliminar e importar tipos de asiento mediante formularios y tablas dinámicas.
 * Fecha: 07 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaTipoAsiento - Contenedor principal donde se renderiza la vista de tipos de asiento.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function TipoAsiento(permisos, vistaTipoAsiento, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}creartipoasientolista/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaImportarTipoAsiento = crearElemento("div", { class: "d-none", "data-pane-id": "importar" });
    vistaTipoAsiento.append( vistaPrincipal, vistaImportarTipoAsiento);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Tipos de Comprobante Contable"});
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Botón para abrir la vista de importar tipos de asiento
    const botonImportarTipoAsiento = elementoBoton({
        texto: "Importar tipos de asiento",
        icono: "cloud-arrow-down",
        id: "ta_btn_importarasiento",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaImportarTipoAsiento);
            Importar({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaTipoAsiento: vistaPrincipal,
                vistaImportarTipoAsiento,
                urlTipoAsiento: URL_LT,
                contenedorAlertasTA: contenedorDeAlertas,
                cargarTablaTipoAsiento: cargarContenidoTabla,
            });
        }
    });

    let arrayOpcionesBtn = [botonImportarTipoAsiento];
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioTiposDeAsiento,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nuevo Tipo de Comprobante",
                    estiloModal: "width: 800px;",
                },
                camposAdicionales: {
                    ver: "creartipoasiento",
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
        "Tipo",
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
                crearElemento("td", undefined, [registro.nombre]),
                crearElemento("td", undefined, [registro.detalle]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioTiposDeAsiento,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Tipo de Asiento",
                                estiloModal: "width: 800px;",
                            },
                            camposAdicionales: {
                                ver: "creartipoasientof5",
                                id: registro.id,
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
                            URL: `${URL}creartipoasientodelete/${registro.id}`,
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
    const divContenedorCabecera = vistaTipoAsiento.closest("#contenedor-cabecera");
    const btnTipoAsiento = divContenedorCabecera.querySelector("[data-id='tipoasiento']");
    const informacionDJs = [
        {
            element: btnTipoAsiento,
            popover: {
                title: "Tipos de Asiento",
                description: "Vista para crear los tipos Transacción o Comprobante Ej. Ingreso, Egreso, etc.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Nuevo registro",
                description: "Abre un formulario para registrar un nuevo tipo de Comprobante Contable en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='ta_btn_importarasiento']",
            popover: {
                title: "Importar tipo de Comprobante Contable",
                description: "Abre una vista desde donde se pueden importar los tipos de Comprobante Contable desde Admin de MisterSofts.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar tipo de asiento",
                description: "Permite hacer una búsqueda considerando todas las columnas de la lista.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla/Lista de tipos de Comprobante Contable",
                description: "Muestra todos los tipos de Comprobante Contable registrados en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar tipo de Comprobante Contable",
                description: "Abre un formulario para modificar los datos del tipo de Comprobante Contable seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar tipo de Comprobante Contable",
                description: "Permite eliminar el registro del tipo de Comprobante Contable seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}