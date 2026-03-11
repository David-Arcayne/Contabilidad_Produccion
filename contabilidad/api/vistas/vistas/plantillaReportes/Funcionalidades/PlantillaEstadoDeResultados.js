import { manejarSelect } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, formatoDecimal, InputBusqueda, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalRemovible } from "../../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro, formularioRegistrar } from "../../../funciones/OpcionesBasicas.js";
import { formularioCuentaAsociada, formularioEstadoDeResultadosNyC, formularioPlantilla, formularioPREditar, formularioReporteAsociado, planCuentaONombre } from "../Formularios.js";

/**
 * Crea y gestiona la vista para agregar un Asiento Modelo.
 * @param {Object} datosVista - Configuración de la vista.
 * @param {HTMLElement} datosVista.vistaPlantillaReporte - Contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaPlantilla - Contenedor de la vista de creación.
 * @param {Object} datosVista.permisos - Permisos del usuario (lectura, escritura, editar, eliminar).
 * @returns {function} Función que genera la vista con los datos del registro.
 */
export function PlantillaEstadoDeResultados(datosVista){
    const {
        permisos,
        vistaPlantillaReporte,
        vistaPlantilla,
        registroPlantillaReporte,
    } = datosVista;

    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}rp_listar_plantilla/${registroPlantillaReporte.idtipo_reportes}/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaPlantilla.append( vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = () => {
        cambiarVista(vistaPlantilla, vistaPlantillaReporte);
        vistaPlantilla.innerHTML = "";
    }
    const encabezadoVista = seccionEncabezado({ titulo: registroPlantillaReporte.nombre }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const recargarCampoCuentaContable = () => {
        // Recarga el select con id "plantilla-plancuenta" en el formulario de registro.
        const selectPPC = vistaPrincipal.querySelector("#plantilla-plancuenta");
        const divPPC = selectPPC.closest("div");
        manejarSelect(
            selectPPC,
            {
                urlSolicitud: `${CT_URLAPI}select_plantilla_estado_resultados/${registroPlantillaReporte.idtipo_reportes}/${EMPRESA_ID}`,
                llavesOpciones: { valor: "idplandecuenta", detalle: ["numero", "nombre"] },
                clasesOpcion: {llave: "estado", valor: "usado", clases: ["icono-ok"]},
                callbackInput: planCuentaONombre(),
            },
            undefined,
            divPPC
        );
    };
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioPlantilla(registroPlantillaReporte),
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Cuenta en Plantilla",
                },
                configuraciones: {
                    centrarFormulario: false,
                },
                camposAdicionales: {
                    ver: "rp_registrar_plantilla",
                    idempresa: EMPRESA_ID,
                    idplantilla_reporte: registroPlantillaReporte.idtipo_reportes,
                },
                camposCondicionales: [
                    { nombre: "idplandecuenta", valor: "" },
                    { nombre: "nombre_personalizado", valor: "" },
                ],
                callbacks: {
                    alRegistrar: recargarCampoCuentaContable,
                }
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
        "Plantilla",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    tabla.classList.remove("table-hover");
    const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" }, "listas");
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
            const tdContenido = crearElemento("td");
            const listadoDeCuentas = listaCuentasEstadoDeResultados({
                permisos,
                vistaPrincipal,
                contenedorDeAlertas,
                URL,
                urlEstadoDeResultados: URL_LT,
                cargarContenidoTabla,
                registroPlantillaReporte,
                recargarCampoCuentaContable,
                registroEstadoDeResultados: registro,
            });
            tdContenido.appendChild(listadoDeCuentas);

            const fila = crearElemento("tr", undefined, [ tdContenido ]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Genera la lista de cuentas para el estado de resultados.
 * Descripción: Esta función crea una lista jerárquica de cuentas para el estado de resultados.
 *              Permite la edición y eliminación de cuentas, así como la gestión de operaciones adicionales
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
const listaCuentasEstadoDeResultados = (vistaComponentes) => {
    const {
        permisos,
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        urlEstadoDeResultados,
        cargarContenidoTabla,
        registroPlantillaReporte,
        recargarCampoCuentaContable,
        registroEstadoDeResultados
    } = vistaComponentes;

    const EMPRESA_ID = getEmpresaId();

    function renderNiveles(datosLista) {
        const ul = crearElemento('ul');

        // Crear el contenido del elemento de la lista
        datosLista.forEach(item => {
            // Botón que indica si la cuenta se puede usar en otro reporte
            const iconoOtroReporte = crearElemento("i", { class: "bi bi-arrow-left-right fw-bold", title: "Se puede usar en otro reporte" });
            const btnOtroReporte = item.disponible_para_otro_reporte == "si"
                ? crearElemento(
                        "button",
                        {
                            class: "btn btn-sm btn-success me-2 py-0 px-1 fs-6 border-0 rounded-0",
                            style: "background:#16DE19; cursor: default;"
                        },
                        [iconoOtroReporte]
                    )
                : "";
            // Texto que muestra el nivel, código y nombre de la cuenta
            const nombreCuenta = `${item.codigo ? item.codigo + " : " : ""}${item.nombreplan || item.nombre_personalizado}`;
            const spanNivel = crearElemento("span", { class: "fw-bold text-info" }, [`n-${item.nivel}: `, btnOtroReporte]);
            const contenidoSpanTexto = crearElemento(
                "span",
                {
                    class: `${item.negrilla_cursiva?.includes("negrilla") ? "fw-bold" : ""} ${item.negrilla_cursiva?.includes("cursiva") ? "fst-italic" : ""}`
                },
                [ spanNivel, nombreCuenta ]
            );
            const li = crearElemento("li", { class: `text-nowrap`}, [contenidoSpanTexto]);

            // Boton para manejar otras operaciones (Agrupar cuentas con distintas operaciones)
            if(item.tipo_operacion === "calculable_y_operacion" || item.tipo_operacion === "otra_operacion") {
                const iconoOtrasOpciones = crearElemento("i", { class: "bi bi-card-checklist" });
                const btnOtrasOpcionesVincular = crearElemento("button", { class: "btn btn-sm btn-outline-info ms-1", title: "Otras operaciones" }, [iconoOtrasOpciones]);
                btnOtrasOpcionesVincular.addEventListener("click", () => {
                    manejarCuentasOtraOperacion({
                        permisos,
                        vistaEstadoResultados: vistaPrincipal,
                        registroPlantillaReporte,
                        registroItemPlantilla: item,
                    });
                });

                li.appendChild(btnOtrasOpcionesVincular);
            }
            // Boton para vincular otro reporte a la cuenta
            if(item.tipo_operacion === "calculo_otro_reporte") {
                const iconoVincular = crearElemento("i", { class: "bi bi-arrow-left-right" });
                const btnVincular = crearElemento("button", { class: "btn btn-sm btn-outline-info ms-1", title: "Vincular reporte" }, [iconoVincular]);
                btnVincular.addEventListener("click", () => {
                    manejarVinculacionReporte({
                        permisos,
                        vistaEstadoResultados: vistaPrincipal,
                        registroPlantillaReporte,
                        registroItemPlantilla: item,
                    });
                });

                li.appendChild(btnVincular);
            }

            // Verificar si el item tiene hijos para renderizarlos recursivamente
            if (item.hijos && item.hijos.length > 0) {
                // Botón editar para items con hijos
                const botonEditar = botonModalEditar(
                    {
                        contenedorDeAlertas,
                        camposDeFormulario: formularioEstadoDeResultadosNyC,
                        URL_FORM: URL,
                        URL_LISTAR: urlEstadoDeResultados,
                        configuracionModal: {
                            tituloModal: "Edición de Item de Plantilla",
                            estiloModal: "width: 500px; min-width: 240px;",
                        },
                        camposAdicionales: {
                            ver: "editar_registros_padres_ER",
                            idplantilla: item.idplantilla
                        },
                        datosRegistro: item,
                        cargarContenidoTabla
                    },
                    vistaPrincipal
                );
                botonEditar.classList.remove("btn-warning");
                botonEditar.classList.add("btn-outline-warning", "ms-2");

                li.appendChild(botonEditar);

                // Llamada recursiva para renderizar los hijos
                const subUl = renderNiveles(item.hijos);
                li.appendChild(subUl);
            } else {
                const nuevoFormulario = formularioPREditar(item, registroPlantillaReporte);
                if (item.tipo_operacion === "calculable_y_operacion" || item.tipo_operacion === "otra_operacion" || item.tipo_operacion === "calculo_otro_reporte") {
                    nuevoFormulario[4]["ocultar"] = true;
                }
                // Botón editar para items sin hijos
                const botonEditar = botonModalEditar(
                    {
                        contenedorDeAlertas,
                        camposDeFormulario: nuevoFormulario,
                        URL_FORM: URL,
                        URL_LISTAR: urlEstadoDeResultados,
                        configuracionModal: {
                            tituloModal: "Edición de Item de Plantilla",
                        },
                        camposAdicionales: {
                            ver: "rp_editar_plantilla",
                            empresa: EMPRESA_ID,
                            idplantilla: item.idplantilla,
                            idplantilla_padre: item.idplantilla_padre || "",
                        },
                        camposCondicionales: [
                            { nombre: "idplandecuenta", valor: "" },
                            { nombre: "nombre_personalizado", valor: "" },
                        ],
                        callbacks: {
                            alEditar: recargarCampoCuentaContable,
                        },
                        datosRegistro: item,
                        cargarContenidoTabla
                    },
                    vistaPrincipal
                );
                botonEditar.classList.remove("btn-warning");
                botonEditar.classList.add("btn-outline-warning", "ms-2");
                // Botón eliminar para items sin hijos
                const botonEliminar = botonModalEliminar(
                    {
                        URL: `${URL}rp_eliminar_plantilla/${item.idplantilla}/${item.idplantilla_padre || "0"}/${item.nivel}/${registroPlantillaReporte.idtipo_reportes}/${EMPRESA_ID}`,
                        contenedorDeAlertas,
                        URL_LISTAR: urlEstadoDeResultados,
                        cargarContenidoTabla,
                        callbacks: {
                            alEliminar: recargarCampoCuentaContable,
                        },
                    },
                    vistaPrincipal
                );
                botonEliminar.classList.remove("btn-danger");
                botonEliminar.classList.add("btn-outline-danger", "ms-1");

                li.append(botonEditar, " ", botonEliminar);
            }
            ul.appendChild(li);
        });

        return ul;
    }

    const divLista = crearElemento("div", { class: "listado-reporte" }, [renderNiveles([registroEstadoDeResultados])]);
    return divLista;
}

/**
 * Función: Agrupar cuentas con distintas operaciones.
 * Descripción: Esta función crea un modal para gestionar otras operaciones asociadas a una cuenta en la plantilla de estado de resultados.
 *              Esta opción solo está disponible para cuentas con operación de tipo "calculable_y_operacion" y "otra_operacion".
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
function manejarCuentasOtraOperacion(datosVista) {
    const {
        permisos,
        vistaEstadoResultados,
        registroPlantillaReporte,
        registroItemPlantilla,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_agrupacion_plantilla/${registroItemPlantilla.idplantilla}`;

    // Crear modal removible que contendrá la tabla y el formulario
    const [modal, cuerpoModal] = modalRemovible({
        tituloModal: "Otras Operaciones",
        estiloModal: "width: 800px; min-width: 240px;",
        instrucciones: {
            cerrarAlHacerClickExterno: false,
            cerrarAlPresionarEsc: false,
        }
    });

    // Título con el código y nombre de la cuenta vinculada
    const cuentaSeleccionada = crearElemento("h6", { class: "text-center text-muted mb-3" }, [`(${registroItemPlantilla.nombreplan || registroItemPlantilla.nombre_personalizado})`]);
    const contenedorDeAlertas = crearElemento("div", { class: "my-3" });
    cuerpoModal.appendChild(cuentaSeleccionada);
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para agregar nuevo usuario
        const divFormulario = formularioRegistrar(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioCuentaAsociada(registroPlantillaReporte),
                cargarContenidoTabla,
                configuraciones: {
                    configuracionBotones: {
                        botonCancelar: false,
                        nombreEnviar: "Agregar",
                    },
                    centrarFormulario: false,
                },
                camposAdicionales: {
                    ver: "registrar_agrupacion_plantilla",
                    idempresa: EMPRESA_ID,
                    idplantilla_padre: registroItemPlantilla.idplantilla,
                    idtipo_reportes: registroItemPlantilla.idtipo_reportes,
                },
            },
        );
        cuerpoModal.appendChild(divFormulario);
    }
    cuerpoModal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "Plantilla",
        "Operación",
        "Número",
        "Opciones",
    ];
    // Si no tiene permisos ni para editar ni para eliminar, se remueve la columna de opciones
    if (!PUEDE_EDITAR && !PUEDE_ELIMINAR) {
        encabezadoTabla.pop();
    }
    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    cuerpoModal.append(divTabla);

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
                crearElemento("td", undefined, [registro.tipo_operacion || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap", style: "width: 55px;" });
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioCuentaAsociada(registroPlantillaReporte),
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Registro",
                                estiloModal: "width: 780px; min-width: 240px;",
                            },
                            configuraciones: {
                                centrarFormulario: false,
                            },
                            camposAdicionales: {
                                ver: "editar_otras_operaciones",
                                empresa: EMPRESA_ID,
                                idagrupacion_plantilla: registro.idagrupacion_plantilla,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaEstadoResultados
                    );
                    tdOpciones.append(botonEditar, " ");
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}eliminar_otras_operaciones/${registro.idagrupacion_plantilla}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                        },
                        vistaEstadoResultados
                    );
                    tdOpciones.append(botonEliminar, " ");
                }
                celdas.push(tdOpciones);
            }

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    vistaEstadoResultados.appendChild(modal);
}

/**
 * Función: Vincular reporte a la cuenta.
 * Descripción: Esta función crea un modal para vincular reportes a una cuenta en la plantilla de estado de resultados.
 *              Este opción solo está disponible para cuentas con operación de tipo "calculo_otro_reporte".
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
function manejarVinculacionReporte(datosVista) {
    const {
        permisos,
        vistaEstadoResultados,
        registroPlantillaReporte,
        registroItemPlantilla,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_reportes_referencia/${registroItemPlantilla.idplantilla}`;

    // Crear modal removible que contendrá la tabla y el formulario
    const [modal, cuerpoModal] = modalRemovible({
        tituloModal: "Vincular Reporte",
        estiloModal: "width: 600px; min-width: 240px;",
        instrucciones: {
            cerrarAlHacerClickExterno: false,
            cerrarAlPresionarEsc: false,
        }
    });

    // Título con el código y nombre de la cuenta vinculada
    const cuentaSeleccionada = crearElemento("h6", { class: "text-center text-muted mb-3" }, [`(${registroItemPlantilla.nombreplan || registroItemPlantilla.nombre_personalizado})`]);
    const contenedorDeAlertas = crearElemento("div", { class: "my-3" });
    cuerpoModal.appendChild(cuentaSeleccionada);
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para agregar nuevo usuario
        const divFormulario = formularioRegistrar(
            {
                contenedorDeAlertas: contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioReporteAsociado,
                cargarContenidoTabla,
                configuraciones: {
                    configuracionBotones: {
                        botonCancelar: false,
                        nombreEnviar: "Agregar",
                    },
                    centrarFormulario: false,
                },
                camposAdicionales: {
                    ver: "registrar_reportes_referencia",
                    empresa: EMPRESA_ID,
                    idtipo_reporte: registroPlantillaReporte.idtipo_reportes,
                    idplantilla: registroItemPlantilla.idplantilla,
                },
            },
        );
        cuerpoModal.appendChild(divFormulario);
    }
    cuerpoModal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "Nombre Reporte",
        "Opciones",
    ];

    // Si no tiene permisos para eliminar, se remueve la columna de opciones
    if (!PUEDE_ELIMINAR) {
        encabezadoTabla.pop();
    }
    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    cuerpoModal.append(divTabla);

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
            ];

            if (PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap", style: "width: 55px;" });
                // Crear botón eliminar con modal de confirmación
                const botonEliminar = botonModalEliminar(
                    {
                        URL: `${URL}eliminar_reportes_referencia/${registro.idcalculo_otro_reporte}`,
                        contenedorDeAlertas,
                        datosTabla: { elementoTd: tdOpciones },
                    },
                    vistaEstadoResultados
                );
                tdOpciones.append(botonEliminar, " ");
                celdas.push(tdOpciones);
            }

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    vistaEstadoResultados.appendChild(modal);
}