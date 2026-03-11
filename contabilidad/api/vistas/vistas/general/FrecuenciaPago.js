import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioFrecuenciaPago } from "./Formularios.js";

/**
 * Función: Crea el contenido de la vista de Frecuencia de Pago
 * Descripción: Esta función genera el contenido para la gestión de frecuencias de pago
 *              Permite registrar, editar y eliminar frecuencias de pago mediante formularios y tablas dinámicas.
 * Fecha: 31 de diciembre de 2025
 * Autor: Joel Choque
 */
export function FrecuenciaPago(datosVista) {
    const {
        codigo,
        permisos,
        vistaTipoDocumento,
        vistaFrecuenciaPago,
    } = datosVista;
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_forma_pago/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaFrecuenciaPago.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({ titulo: "Frecuencia de Pago", alinearTitulo: "start" });
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
                camposDeFormulario: formularioFrecuenciaPago,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nueva Frecuencia de Pago",
                    estiloModal: "width: 800px;",
                },
                camposAdicionales: {
                    ver: "registrar_forma_pago",
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

    const encabezadoTabla = [
        "Frecuencia de Pago",
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
                            camposDeFormulario: formularioFrecuenciaPago,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Frecuencia de Pago",
                                estiloModal: "width: 800px;",
                            },
                            camposAdicionales: {
                                ver: "editar_forma_pago",
                                empresa: EMPRESA_ID,
                                idforma_pago: registro.idforma_pago,
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
                            URL: `${URL}eliminar_forma_pago/${registro.idforma_pago}`,
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
    const divContenedorCabecera = vistaFrecuenciaPago.closest("#contenedor-cabecera");
    const btnFrecuenciaPago = divContenedorCabecera.querySelector("[data-action='frecuencia-pago']");
    const informacionDJs = [
        {
            element: btnFrecuenciaPago,
            popover: {
                title: "Frecuencia de Pago",
                description: "Permite establecer las frecuencias de pago que se manejan en las contrataciones.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "button[data-id='__btn-registro']",
            popover: {
                title: "Agregar Frecuencia de Pago",
                description: "Abre un formulario para registrar una nueva frecuencia de pago en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "#__buscador",
            popover: {
                title: "Buscar",
                description: "Permite buscar frecuencias de pago considerando todos los campos disponibles.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de Frecuencias de Pago",
                description: "Muestra todas las frecuencias de pago registradas en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar Frecuencia de Pago",
                description: "Abre un formulario para modificar los datos de la frecuencia de pago seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar Frecuencia de Pago",
                description: "Permite eliminar la frecuencia de pago seleccionada, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}