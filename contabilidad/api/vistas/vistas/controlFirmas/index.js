import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, divOpcionesVista, formatoTexto, InputBusqueda, seccionDriverJS } from "../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro } from "../../funciones/OpcionesBasicas.js";
import { formularioFirmas, optnsTipoRepoerte } from "./Formularios.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de control de firmas.
 *              Permite registrar, editar y eliminar usuarios autorizados para firmar documentos específicos.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea el contenido principal del menú
 * @param {string} codigo - Código de la vista.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export function ControlFirmas(codigo, permisos) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_firma_reporte/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioFirmas,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Usuario para Firma de Reportes",
                },
                camposAdicionales: {
                    ver: "registrar_firma_reporte",
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
        "Documento",
        "Usuario",
        "Matrícula Profesional",
        "Función o Cargo",
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
            const tipoReporte = optnsTipoRepoerte.find(opcion => opcion.clave === registro.tipo_reporte);
            const celdas = [
                crearElemento("td", undefined, [ tipoReporte ? tipoReporte.valor : "-"]),
                crearElemento("td", undefined, [ `${registro.nombre_trabajador} ${registro.ci ?  ` - ${registro.ci}` : ""}` ]),
                crearElemento("td", undefined, [ registro.matricula || "-" ]),
                crearElemento("td", undefined, [ formatoTexto(registro.funcion) || "-" ])
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioFirmas,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Editar Registro",
                            },
                            camposAdicionales: {
                                ver: "editar_firma_reporte",
                                idfirma_reporte: registro.idfirma_reporte,
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
                            URL: `${URL}eliminar_firma_reporte/${registro.idfirma_reporte}`,
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
    const informacionDJs = [
        {
            popover: {
                title: "Control de Firmas",
                description: "Permite gestionar las personas o usuarios que podrán firmar distintos documentos en formato de reporte impreso: Comprobantes Contables, Estados Financieros y reporte complementarios, etc. Exceptuando los reportes de Cajas y Bancos que se configuran desde Configuración / VinculaciónCuentas / CuentasDisponible",
            },
        },
        {
            popover: {
                description: `Después de elegir el Reporte a firmar y seleccionar persona firmante:
                <ul>
                    <li>podrá escribir la Matrícula en para del profesional afiliado a algún Colegio, en caso de no existir dejarlo en blanco y en la firma se mostrará el Carnet de Identidad.</li>
                    <li>en Función: escribir el título o cargo del firmante que desea mostrar.</li>`,
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Agregar usuario para la firma",
                description: "Abre un formulario para registrar un nuevo usuario relacionado a la firma de un documento.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar registro",
                description: "Permite buscar registros considerando todas las columnas de la tabla.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de control de firmas",
                description: "Muestra todos los registros de usuarios para control de firmas en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar registro",
                description: "Abre un formulario para modificar los datos del registro seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar registro",
                description: "Permite eliminar el registro seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}