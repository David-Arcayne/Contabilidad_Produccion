import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, divOpcionesVista, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioProveedor } from "./Formularios.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de proveedores
 *              Permite registrar, editar y eliminar proveedores mediante formularios y tablas dinámicas.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaProveedores - Contenedor principal donde se renderiza la vista de proveedores.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function Proveedores(permisos, vistaProveedores, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const URL = CT_URLAPI;
    const EMPRESA_ID = getEmpresaId();
    const URL_LT = `${URL}listaproveedores/${EMPRESA_ID}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaProveedores.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Listado de Proveedores"});
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
                camposDeFormulario: formularioProveedor,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nuevo Proveedor",
                },
                camposAdicionales: {
                    ver: "registroproveedor",
                    empresa: EMPRESA_ID,
                },
                camposCondicionales: [
                    { nombre: "nit", valoresCondicionales: [""], valor: "0" }
                ]
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
        "Razon Social",
        "NIT",
        "Pais",
        "Ciudad",
        "Zona/Barrio",
        "Dirección",
        "Teléfono",
        "Móvil",
        "Detalle",
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
            const celdas = [
                crearElemento("td", undefined, [registro.nombre]),
                crearElemento("td", undefined, [registro.nit]),
                crearElemento("td", undefined, [registro.pais]),
                crearElemento("td", undefined, [registro.ciudad]),
                crearElemento("td", undefined, [registro.zona]),
                crearElemento("td", undefined, [registro.direccion]),
                crearElemento("td", undefined, [registro.telefono]),
                crearElemento("td", undefined, [registro.mobil]),
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
                            camposDeFormulario: formularioProveedor,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            datosRegistro: registro,
                            configuracionModal: {
                                tituloModal: "Edición de Proveedor",
                            },
                            camposAdicionales: {
                                ver: "registroproveedorf5",
                                empresa: EMPRESA_ID,
                                idc: registro.id,
                            },
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
                            URL: `${URL}eliminarproveedor/${registro.id}`,
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
    const divContenedorCabecera = vistaProveedores.closest("#contenedor-cabecera");
    const btnProveedores = divContenedorCabecera.querySelector("[data-id='proveedor']");
    const informacionDJs = [
        {
            element: btnProveedores,
            popover: {
                title: "Proveedor",
                description: "Sección para gestionar los proveedores con los que cuenta la Empresa.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "button[data-id='__btn-registro']",
            popover: {
                title: "Agregar nuevo Proveedor",
                description: "Abre un formulario para registrar un nuevo proveedor en el sistema.",
                side: "left",
                align: "start",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar Proveedor",
                description: "Permite buscar proveedores considerando todas las columnas de la tabla.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de Proveedores",
                description: "Muestra todos los proveedores registrados en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar Proveedor",
                description: "Abre un formulario para modificar los datos del proveedor seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar Proveedor",
                description: "Permite eliminar el registro del proveedor seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}