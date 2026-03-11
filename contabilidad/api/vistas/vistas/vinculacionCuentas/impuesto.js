import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, elementoBoton, formatoDecimal, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioImpuesto } from "./Formularios.js";
import { ImportarImpuesto } from "./Funcionalidades/ImportarImpuesto.js";
import { ImpuestosCtaContable } from "./Funcionalidades/impuestosCtaContable.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function Impuesto(permisos, vistaImpuesto, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}impuestolista/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaImportarImpuestos = crearElemento("div", { class: "d-none", "data-pane-id": "importar-impuestos" });
    const vistaVincularCuentas = crearElemento("div", { class: "d-none", "data-pane-id": "vincular-cuentas" });
    vistaImpuesto.append(vistaPrincipal, vistaImportarImpuestos, vistaVincularCuentas);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Listado de Impuestos"});
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Boton para abrir la vista de importar impuestos
    const botonVistaImportarImpuestos = elementoBoton({
        texto: "Importar Impuestos",
        icono: "cloud-arrow-down",
        id: "vc-i-btn-importarimpuesto",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaImportarImpuestos);
            ImportarImpuesto({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaImpuesto: vistaPrincipal,
                vistaImportarImpuestos,
                urlImpuesto: URL_LT,
                cargarTablaImpuesto: cargarContenidoTabla,
                contenedorAlertasImpuesto: contenedorDeAlertas,
            });
        }
    });

    // Boton para abrir la vista de vincular impuestos con cuentas contables
    const botonVincularCuentaContable = elementoBoton({
        texto: "Impto-Cta Contable",
        icono: "node-plus",
        id: "vc-i-btn-impuestosctacontable",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaVincularCuentas);
            ImpuestosCtaContable({
                codigo: datosVistaPrincipal.codigo,
                permisos,
                vistaImpuestos: vistaPrincipal,
                vistaVincularCuentas,
            });
        }
    });

    let arrayOpcionesBtn = [botonVistaImportarImpuestos, botonVincularCuentaContable];
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioImpuesto,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Nuevo Impuesto",
                },
                camposAdicionales: {
                    ver: "impuestocrear",
                    idempresa: EMPRESA_ID,
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
        "Código",
        "Nombre",
        "Tasa",
        "Descripción",
        "Vencimiento",
        "Periodicidad",
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
                crearElemento("td", undefined, [registro.codigoimpuesto || "-"]),
                crearElemento("td", undefined, [registro.nombreimpuesto || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.tasa)]),
                crearElemento("td", undefined, [registro.descripcion || "-"]),
                crearElemento("td", undefined, [registro.vencimiento || "-"]),
                crearElemento("td", undefined, [registro.periodicidad || "-"]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioImpuesto,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Impuesto",
                            },
                            camposAdicionales: {
                                ver: "impuestocrearf5",
                                idimpuesto: registro.id,
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
                            URL: `${URL}impuestocreardelete/${registro.id}`,
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
    const divContenedorCabecera = vistaImpuesto.closest("#contenedor-cabecera");
    const btnCuentaTributaria = divContenedorCabecera.querySelector("[data-id='impuestos']");
    const informacionDJs = [
        {
            element: btnCuentaTributaria,
            popover: {
                title: "Tributos",
                description: "Registro de Impto en términos más familiares y asignado la tasa (%) o bien importarlo de nuestro modelo, posteriormente vinculado a una cuenta contable correspondiente.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Agregar impuesto",
                description: "Abre un formulario para registrar un nuevo impuesto en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='vc-i-btn-importarimpuesto']",
            popover: {
                title: "Importar impuestos",
                description: "Abre una vista desde donde se pueden importar los impuestos modelo que se tiene (todos o de uno en uno).",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='vc-i-btn-impuestosctacontable']",
            popover: {
                title: "Impuestos - Cuenta contable",
                description: "Abre una vista para vincular los impuestos creados con las Cuentas Contables.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar impuesto",
                description: "Permite buscar impuestos considerando todas las columnas de la tabla.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de impuestos",
                description: "Muestra todos los impuestos registrados en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar impuesto",
                description: "Abre un formulario para modificar los datos del impuesto seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar impuesto",
                description: "Permite eliminar el registro del impuesto seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}