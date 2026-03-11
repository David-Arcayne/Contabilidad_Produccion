import { manejarSelect } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, divOpcionesVista, InputBusqueda, seccionEncabezado } from "../../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro, modalFormularioEditar } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { formularioBalanceGeneral, formularioBGNegrillaCursiva, formularioBGPREditar, formularioBGPRInsertar, formularioBGPRVincular, optnsBGGrupo } from "../Formularios.js";

/**
 * Crea y gestiona la vista para agregar un Asiento Modelo.
 * @param {Object} datosVista - Configuración de la vista.
 * @param {HTMLElement} datosVista.vistaPlantillaReporte - Contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaPlantilla - Contenedor de la vista de creación.
 * @param {Object} datosVista.permisos - Permisos del usuario (lectura, escritura, editar, eliminar).
 * @returns {function} Función que genera la vista con los datos del registro.
 */
export function PlantillaBalanceGeneral(datosVista){
    const {
        permisos,
        vistaPlantillaReporte,
        vistaPlantilla,
        registroPlantillaReporte,
    } = datosVista;

    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_configuracion_reporte/${registroPlantillaReporte.idtipo_reportes}/${EMPRESA_ID}`;

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
        // Recarga el select con id "plantillabg-tipodocumento" en el formulario de registro.
        const selectPPC = vistaPrincipal.querySelector("#plantillabg-tipodocumento");
        manejarSelect(
            selectPPC,
            {
                urlSolicitud: `${CT_URLAPI}select_plantilla_balance_general/${registroPlantillaReporte.idtipo_reportes}/${EMPRESA_ID}`,
                llavesOpciones: { valor: "idplandecuenta", detalle: ["numero", "nombre"] },
                clasesOpcion: {llave: "estado", valor: "usado", clases: ["icono-ok"]}
            }
        );
    };
    if (PUEDE_ESCRIBIR) {
        // Creación de formulario para la vista Registrar
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioBalanceGeneral(registroPlantillaReporte),
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro de Cuenta en Plantilla",
                },
                configuraciones: {
                    centrarFormulario: false,
                },
                camposAdicionales: {
                    ver: "registrar_configuracion_reporte",
                    empresa: EMPRESA_ID,
                    idplantilla_reporte: registroPlantillaReporte.idtipo_reportes,
                    reporte: "balance_general",
                },
                camposCondicionales: [
                    { nombre: "es_calculable", valor: "no" },
                    { nombre: "es_activo_fijo", valor: "no" },
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
        "Cuentas",
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

            const listadoDeCuentas = ListaCuentasBalanceGeneral({
                permisos,
                vistaPrincipal,
                contenedorDeAlertas,
                URL,
                urlBalanceGeneral: URL_LT,
                cargarContenidoTabla,
                registroPlantillaReporte,
                recargarCampoCuentaContable,
                registroBalanceGeneral: registro,
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
 * Función: Genera la lista de cuentas para el Balance General.
 * Descripción: Esta función crea una estructura jerárquica de cuentas para el Balance General.
 *              Permite la inserción, edición, vinculación y eliminación de cuentas.
 * Fecha: 15 de Enero de 2026
 * Autor: Joel Choque
 */
const ListaCuentasBalanceGeneral = (vistaComponentes) => {
    const empresa_id = getEmpresaId();
    const {
        permisos,
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        urlBalanceGeneral,
        cargarContenidoTabla,
        registroPlantillaReporte,
        recargarCampoCuentaContable,
        registroBalanceGeneral,
    } = vistaComponentes;

    const tipoGrupos = optnsBGGrupo;

    function renderNiveles(data, nivel = 1) {
        const ul = crearElemento('ul');

        // Crea el contenido de cada nivel
        data.forEach(item => {
            // Nombre del campo dinámico para el nivel actual
            const nombreClave = `nombre_nivel_${nivel}`;
            const siguienteNivel = `nivel_${nivel + 1}`;

            const texto = item[nombreClave] || item['reporte'] || 'Sin nombre';
            const contenidoTexto = crearElemento('span', { class: `${item.negrilla_cursiva?.includes("negrilla") ? "fw-bold" : ""} ${item.negrilla_cursiva?.includes("cursiva") ? "fst-italic" : ""}` }, [`${item.codigo? item.codigo + " : " : ""}${texto}`]);
            const li = crearElemento('li', {class: `text-nowrap`}, [contenidoTexto]);

            // Botón insertar para items que no son activos fijos o que tienen hijos
            if (item.es_activo_fijo === "no" || item[siguienteNivel]?.length > 0) {
                const iconoInsertar = crearElemento('i', { class: "bi bi-chevron-bar-down" });
                const btnInsertar = crearElemento('button', { class: "btn btn-sm btn-outline-info ms-2", title: "Insertar" }, [iconoInsertar]);
                li.append(btnInsertar);
                btnInsertar.addEventListener("click", async () => {
                    btnInsertar.classList.add("disabled");
                    // Obtener datos del item a insertar debajo
                    const arrItem = await obtenerDatos(`${URL}listar_plantilla_por_registro/${item.idconfiguracion_reporte}`)
                    const datosItem = arrItem?.length > 0 ? arrItem[0] : null;
                    delete datosItem?.idplandecuenta;
                    for (const tipo of tipoGrupos) {
                        if (datosItem?.grupo == tipo.clave) {
                            datosItem["nombre_grupo"] = tipo.valor;
                        }
                    }

                    const modal = modalFormularioEditar({ // se reutiliza la función de editar para insertar un registro
                        contenedorDeAlertas,
                        camposDeFormulario: formularioBGPRInsertar(registroPlantillaReporte),
                        URL_FORM: URL,
                        URL_LISTAR: urlBalanceGeneral,
                        configuracionModal: {
                            tituloModal: "Insertar nuevo registro",
                        },
                        configuraciones: {
                            configuracionBotones:{
                                nombreEnviar: "Insertar",
                                clasesEnviar: "btn btn-info"
                            },
                            mensajeExito: "Registro insertado exitosamente",
                            mensajeError: "Error al insertar el registro",
                        },
                        camposAdicionales: {
                            ver: "insertar_debajo_de",
                            empresa: empresa_id,
                            idplantilla_reporte: registroPlantillaReporte.idtipo_reportes,
                            grupo: datosItem.grupo,
                            reporte: "balance_general",
                        },
                        camposCondicionales: [
                            { nombre: "es_calculable", valor: "no" },
                            { nombre: "es_activo_fijo", valor: "no" },
                        ],
                        callbacks: {
                            alEditar: recargarCampoCuentaContable,
                        },
                        datosRegistro: datosItem,
                        cargarContenidoTabla
                    });
                    vistaPrincipal.appendChild(modal);
                    btnInsertar.classList.remove("disabled");
                });
            }

            // Botón editar para items con hijos
            const botonEditar = botonModalEditar(
                {
                    contenedorDeAlertas,
                    camposDeFormulario: formularioBGNegrillaCursiva,
                    URL_FORM: URL,
                    URL_LISTAR: urlBalanceGeneral,
                    configuracionModal: {
                        tituloModal: "Edición de Item de Plantilla",
                        estiloModal: "width: 500px; min-width: 240px;",
                    },
                    camposAdicionales: {
                        ver: "editar_registros_padres_BG",
                        idconfiguracion_reporte: item.idconfiguracion_reporte,
                    },
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

            if (item[siguienteNivel] && item[siguienteNivel].length > 0) {
                // Si el item tiene un siguiente nivel, renderiza recursivamente
                li.appendChild(botonEditar);
                const subUl = renderNiveles(item[siguienteNivel], nivel + 1);
                li.appendChild(subUl);
            } else {
                // Opción para items sin hijos y sin ser activos fijos
                if (item.es_activo_fijo === "no") {
                    // Botón editar para items sin hijos
                    const botonEditar = botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioBGPREditar(registroPlantillaReporte),
                            URL_FORM: URL,
                            URL_LISTAR: urlBalanceGeneral,
                            configuracionModal: {
                                tituloModal: "Edición de Item de Plantilla",
                            },
                            camposAdicionales: {
                                ver: "editar_configuracion_reporte",
                                empresa: empresa_id,
                                idconfiguracion_reporte: item.idconfiguracion_reporte,
                            },
                            camposCondicionales: [
                                { nombre: "es_calculable", valor: "no" },
                                { nombre: "es_activo_fijo", valor: "no" },
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

                    li.classList.add("fw-normal");
                    li.append(botonEditar);
                }
                // Opciones para activos fijos
                if (item.es_activo_fijo === "si" && item.es_depreciacion === "no") {
                    li.appendChild(botonEditar);

                    const iconoVincular = crearElemento('i', { class: "bi bi-plus-circle" });
                    const btnVincular = crearElemento('button', { class: "btn btn-sm btn-outline-info ms-1", title: "Vincular" }, [iconoVincular]);
                    li.appendChild(btnVincular);
                    btnVincular.addEventListener("click", () => {
                        const modal = modalFormularioEditar({ // se reutiliza la función de editar para vincular un registro
                            contenedorDeAlertas,
                            camposDeFormulario: formularioBGPRVincular,
                            URL_FORM: URL,
                            URL_LISTAR: urlBalanceGeneral,
                            configuracionModal: {
                                tituloModal: "Vincular Depreciación a Activo Fijo",
                                estiloModal: "width: 500px; min-width: 240px;",
                            },
                            configuraciones: {
                                configuracionBotones:{
                                    nombreEnviar: "Vincular",
                                },
                                mensajeExito: "Registro vinculado exitosamente",
                                mensajeError: "Error al vincular el registro",
                            },
                            camposAdicionales: {
                                ver: "registrar_vinculacion_depreciacion",
                                empresa: empresa_id,
                                idcuenta: item.idplandecuenta,
                                idtipo_reportes: registroPlantillaReporte.idtipo_reportes,
                            },
                            callbacks: {
                                alEditar: recargarCampoCuentaContable,
                            },
                            cargarContenidoTabla
                        });
                        vistaPrincipal.appendChild(modal);
                    });
                }
                // Botón eliminar para todos los items sin hijos
                const botonEliminar = botonModalEliminar(
                    {
                        URL: `${URL}eliminar_configuracion_reporte/${item.idconfiguracion_reporte}`,
                        contenedorDeAlertas,
                        URL_LISTAR: urlBalanceGeneral,
                        cargarContenidoTabla,
                        callbacks: {
                            alEliminar: recargarCampoCuentaContable,
                        },
                    },
                    vistaPrincipal
                );
                botonEliminar.classList.remove("btn-danger");
                botonEliminar.classList.add("btn-outline-danger", "ms-1");

                li.appendChild(botonEliminar);
            }

            ul.appendChild(li);
        });

        return ul;
    }
    const divLista = crearElemento("div", { class: "listado-reporte" }, [renderNiveles(registroBalanceGeneral.nivel_1, 1)]);

    return divLista;
}