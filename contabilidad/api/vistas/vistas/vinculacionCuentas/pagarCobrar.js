import { manejarSelect } from "../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, divOpcionesVista, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioCuentaFactura, optnsTipoCF } from "./Formularios.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de la vinculación de cuentas por pagar y cobrar
 *              Permite registrar, editar y eliminar vinculaciones mediante formularios y tablas dinámicas.
 * Fecha: 11 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaPagarCobrar - Contenedor principal donde se renderiza la vista de vinculación de cuentas por pagar y cobrar.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export async function PagarCobrar(permisos, vistaPagarCobrar, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_vinculacion_cuentas_xcxp/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaPagarCobrar.append( vistaPrincipal);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Listado de vinculación de Cuentas"});
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.append(contenedorDeAlertas);

    const recargarCampoCuenta = () => {
        // Recarga el select con id "cuentafactura-cuenta" en el formulario de registro.
        const selectCuenta = vistaPrincipal.querySelector("#cuentafactura-cuenta");
        manejarSelect(selectCuenta, {
            urlSolicitud: `${URL}listar_cuentas_NoVinculadas_subcuentas/${EMPRESA_ID}`,
            llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        });
    };
    if (PUEDE_ESCRIBIR) {
        // if (tieneDatos) {
        //     vistaRegistrar.classList.remove("d-none");
        // }
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioCuentaFactura,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nueva Vinculación de Cuenta",
                    estiloModal: "width: 800px;"
                },
                camposAdicionales: {
                    ver: "registrar_vinculacion_cuentas_xcxp",
                    empresa_id: EMPRESA_ID,
                },
                callbacks: {
                    // alRegistrar: ActualizarCuenta,
                    alRegistrar: recargarCampoCuenta,
                }
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
        "Tipo de Cuenta",
        "Relación",
        "Cod. Cuenta",
        "Cuenta",
        "Tipo",
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
            const cobrarPagar = optnsTipoCF.find(opc => opc.clave === parseInt(registro.cobrar_pagar));
            const celdas = [
                crearElemento("td", undefined, [cobrarPagar ? cobrarPagar.valor : "-"]),
                crearElemento("td", { class: "text-center" }, [
                    crearElemento("i", { class: "bi bi-arrow-right text-primary fs-6" })
                ]),
                crearElemento("td", undefined, [registro.numero || "-"]),
                crearElemento("td", undefined, [registro.nombreplan || "-"]),
                crearElemento("td", undefined, [registro.saldonormal || "-"])
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioCuentaFactura,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Cuenta",
                                estiloModal: "width: 500px;"
                            },
                            camposAdicionales: {
                                ver: "editar_vinculacion_cuenta_xcxp",
                                idvinculacion_cuenta_xcxp: registro.idvinculacion_cuenta_xcxp,
                            },
                            callbacks: {
                                alEditar: recargarCampoCuenta,
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
                            URL: `${URL}/eliminar_vinculacion_cuenta_xcxp/${registro.idvinculacion_cuenta_xcxp}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                            callbacks: {
                                // alEliminar: ActualizarCuenta,
                                alEliminar: recargarCampoCuenta,
                            }
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
    const divContenedorCabecera = vistaPagarCobrar.closest("#contenedor-cabecera");
    const btnOtrasCuentas = divContenedorCabecera.querySelector("[data-id='pagarcobrar']");
    const informacionDJs = [
        {
            element: btnOtrasCuentas,
            popover: {
                title: "Otras Cuentas",
                description: "Permite configurar las Cuentas de exigible, vinculando a Cuentas Contables, así mismo vincular la cuenta que será utilizada para la contracuenta en las Transacciones de cierre de gestión.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Agregar Vinculación de Cuenta",
                description: "Abre un formulario para registrar una nueva vinculación de cuenta, seleccionando el tipo de cuenta disponible y la cuenta contable correspondiente. (Los tipos de cuentas disponibles se pueden vincular una sola vez).",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar Vinculación de Cuenta",
                description: "Permite buscar vinculaciones de cuentas considerando todas las columnas de la tabla.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de Otras Cuentas",
                description: "Muestra las distintas vinculaciones de cuentas.",
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
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar",
                description: "Permite eliminar el registro seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}