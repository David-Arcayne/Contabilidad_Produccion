import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { campoCheckbox, campoInput, manejarSelect } from "../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId, getUsuarioId } from "../../funciones/DatosAuxiliares.js";
import { cambiarVista, contenidoDeCargaBtn, crearElemento, divOpcionesVista, elementoBoton, formatoFecha, InputBusqueda, obtenerFechaActual, resaltarTexto, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { modalDeConfirmacion, modalDeInformacion, modalManejarRespuestaError, modalRemovible } from "../../funciones/Modals.js";
import { botonModalEditar, botonModalRegistro, modalFormularioEditar } from "../../funciones/OpcionesBasicas.js";
import { enviarDatosOJson, manejarEnvioFormulario, manejarMultiplesSolicitudes, obtenerDatos } from "../../funciones/Solicitudes.js";
import { crearBotonIconoPdfMake } from "../../funciones/VistaPDF.js";
import { formularioTransaccion, formularioTransaccionInsertar } from "./Formularios.js";
import { DetalleTransaccion } from "./Funcionalidades/DetalleTransaccion.js";
import { PendientesDeRegistro } from "./Funcionalidades/PendientesDeRegistro.js";
import { pdfMakeDetalleTransaccion } from "./Funcionalidades/ReportesTransacciones.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de transacciones
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 */
export async function Transacciones(codigo, permisos) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const URL = CT_URLAPI;
    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();

    const URL_LT = `${URL}listatransacciones/${EMPRESA_ID}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaDetalleTransaccion = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaDetalleTransaccion.setAttribute("class", "d-none");
    const vistaDocsSinTransaccion = crearElemento("div", { class: "d-none", "data-pane-id": "docs-sin-transaccion" });

    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaDocsSinTransaccion);

    const vistaPrincipalEncabezado = crearElemento("div");
    const vistaPrincipalContenido = crearElemento("div");
    vistaPrincipal.append(vistaPrincipalEncabezado, vistaPrincipalContenido);

    // Creación de elementos para la vista Principal
    const datoGA = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);

    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento("span", { class: "text-secondary" }, [`${datoGA.nombre}`]);
        const divFecha = crearElemento("div", { class: "text-secondary" }, [` (${formatoFecha(datoGA.fechaini)} a ${formatoFecha(datoGA.fechafin)})`]);
        const textGA = crearElemento("div", { class: "" }, ["Gestión Activa: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-center m-0", style: "font-size: 13px" }, [textGA, divFecha]);

        const encabezadoVista = seccionEncabezado({titulo: "Transacciones Contables", elementoAdicional: gestionActiva});
        vistaPrincipalEncabezado.appendChild(encabezadoVista);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        contenedorPrincipal.appendChild(h1);
        return;
    }

    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipalContenido.appendChild(contenedorDeAlertas);
    // Boton que abre la vista de documentos sin transacción
    const botonDocumentosSinTransaccion = elementoBoton({
        texto: "Docs. por asignar",
        icono: "file-earmark-ruled",
        id: "tr-btn-pendientesregistro",
        callback: () => {
            cambiarVista(vistaPrincipal, vistaDocsSinTransaccion);
            PendientesDeRegistro({
                codigo,
                permisos,
                vistaTransaccion: vistaPrincipal,
                vistaDocsSinTransaccion,
                urlTransaccion: URL_LT,
                cargarTablaTransaccion: cargarContenidoTabla
            });
        }
    });

    const manejarErrorTransaccion = (respuesta, {cerrarModal}) => {
        if (modalManejarRespuestaError(vistaPrincipalContenido, respuesta)) {
            return;
        }
        cerrarModal();
        alertaDeError(contenedorDeAlertas, "Ocurrio un error al realizar la operación");
    };

    let arrayOpcionesBtn = [botonDocumentosSinTransaccion];
    if (PUEDE_ESCRIBIR) {
        arrayOpcionesBtn = [];
        let [esPrecierre, esCierre, esApertura, cierreAnterior] = await manejarMultiplesSolicitudes([
            `${URL}existe_apertura_pre_cierre/precierre/${EMPRESA_ID}`,
            `${URL}existe_apertura_pre_cierre/cierre/${EMPRESA_ID}`,
            `${URL}existe_apertura_pre_cierre/apertura/${EMPRESA_ID}`,
            `${URL}existe_cierre_de_gestion_anterior/${EMPRESA_ID}`
        ]);
        esPrecierre = esPrecierre[0]?.respuesta;
        esCierre = esCierre[0]?.respuesta;
        esApertura = esApertura[0]?.respuesta;
        const esCierreAnterior = cierreAnterior[0]?.respuesta;
        const idGestionAnterior = cierreAnterior[0]?.idgestionanterior;

        if ( esPrecierre === "false" && esCierre === "false") {
            // Botón para abrir el modal de registro de transacción
            const botonRegistrar = botonModalRegistro(
                {
                    contenedorDeAlertas,
                    URL_FORM: URL,
                    URL_LISTAR: URL_LT,
                    camposDeFormulario: formularioTransaccion(),
                    cargarContenidoTabla,
                    configuracionModal: {
                        tituloModal: "Datos Generales Transacción",
                    },
                    camposAdicionales: {
                        ver: "registrotransaccion",
                        empresa: EMPRESA_ID,
                        sucursal: SUCURSAL_ID,
                    },
                    mostrarErrorEnModal: {
                        contenedorModal: vistaPrincipalContenido
                    },
                    callbacks: {
                        previaSolicitud: validarFechaTransaccion(vistaPrincipalContenido),
                        manejarRespuestaExitosa: procesoRegistro({
                            vistaPrincipal,
                            urlTransaccion: URL_LT,
                            cargarContenidoTabla,
                            vistaDetalleTransaccion,
                            permisos
                        }),
                        // enError: manejarErrorTransaccion
                    }
                },
                vistaPrincipalContenido,
                { texto: "Nuevo (manual)" }
            );

            // Botón para abrir el modal de registro de transacción con asiento
            const botonTransAsiento = elementoBoton({
                texto: "Nuevo (auto)",
                icono: "plus-lg",
                id: "tr-btn-transaccionasiento",
                callback:() => crearTransaccionPorAsiento(
                    URL,
                    URL_LT,
                    vistaPrincipalContenido,
                    contenedorDeAlertas,
                    cargarContenidoTabla,
                    manejarErrorTransaccion
                )
            });
            arrayOpcionesBtn.push(botonRegistrar, botonTransAsiento);
        }

        // Boton para abrir el modal de consolidación múltiple
        const botonSolicitudConsolidacionMultiple = elementoBoton({
            texto: "Consolidar",
            icono: "lock-fill",
            id: "tr-btn-consolidarmultiple",
            callback: () => consolidacionMultiple(vistaPrincipalContenido, contenedorDeAlertas, URL, URL_LT, cargarContenidoTabla)
        });
        arrayOpcionesBtn.push(botonDocumentosSinTransaccion, botonSolicitudConsolidacionMultiple );
        if (esPrecierre === "false" && esCierre === "false") {
            // Boton para abrir el modal de desconsolidación múltiple
            arrayOpcionesBtn.push( elementoBoton({
                    texto: "Desconsolidar",
                    icono: "unlock-fill",
                    id: "tr-btn-desconsolidarmultiple",
                    callback: () => solicitudDesconsolidacionMultiple(vistaPrincipalContenido, URL, contenedorDeAlertas)
            }) );
        }
        if (esPrecierre === "false" || esCierre === "false") {
            // Botón para abrir el modal de cierre y precierre de gestión
            arrayOpcionesBtn.push( elementoBoton({
                texto: "Asientos de Cierre",
                icono: "archive-fill",
                id: "tr-btn-asientocierre",
                callback: () => crearTransaccionCierreYPrecierre({
                    URL,
                    urlTransaccion: URL_LT,
                    vistaTrans: vistaPrincipalContenido,
                    contenedorDeAlertas,
                    cargarContenidoTabla,
                    esPrecierre,
                    esCierre
                }),
            }) );
        }
        if ( esApertura === "false" && esCierreAnterior === "true") {
            // Botón para abrir el modal de apertura de gestión
            arrayOpcionesBtn.push( elementoBoton({
                texto: "Apertura",
                icono: "archive",
                id: "tr-btn-asientoapertura",
                callback: () => crearTransaccionDeApertura({
                    URL,
                    urlTransaccion: URL_LT,
                    vistaTrans: vistaPrincipalContenido,
                    contenedorDeAlertas,
                    cargarContenidoTabla,
                    idGestionAnterior
                }),
            }) );
        }
    }
    vistaPrincipalContenido.appendChild(divOpcionesVista(arrayOpcionesBtn));

    const encabezadoTabla = [
        "N° Trans.",
        "Fecha",
        "Tipo",
        "Glosa",
        "Estado",
        "Opciones"
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
    vistaPrincipalContenido.append(divBuscar, divTabla);


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
                crearElemento("td", undefined, [registro.ntransaccion ?? "-"]),
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fecha)]),
                crearElemento("td", undefined, [registro.ttransaccion || "-"]),
                crearElemento("td", { style: "min-width: 250px;"}, [registro.glosa ?? "-"]),
                crearElemento("td", undefined, [obtenerEstado(registro.estado)]),
            ];

            const valorConsolidar = registro.consolidar;
            const valorEstado = registro.estado;
            const valorExiste = registro.existe;

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });

            if (!["4", "7"].includes(valorEstado) && [0, "0"].includes(valorExiste)) {
                // Opcion para conolidar o desconsolidar la transaccion
                const btnConsolidar =  botonConsolidarTransaccion({
                    vistaPrincipal: vistaPrincipalContenido,
                    contenedorDeAlertas,
                    URL,
                    URL_LT,
                    cargarContenidoTabla,
                    registro,
                    td: tdOpciones,
                });
                tdOpciones.append(btnConsolidar, " ");
            }
            if (valorConsolidar === "2" && ["1", 1].includes(valorExiste)) {
                // Opción que indica que la transacción está consolidada y con precierre o cierre realizado
                const icono = crearElemento("i", { class: "bi bi-lock-fill" });
                const btnConsolidado = crearElemento("button", {class: "btn btn-danger btn-sm disabled", title: "Consolidado", type: "button"}, [icono]);
                tdOpciones.append(btnConsolidado, " ");
            }
            if (valorEstado === "4") {
                // Opción para solicitar la activación de la transacción
                const btnActivar = botonSolicitarActivacion({
                    URL,
                    URL_LT,
                    vistaPrincipal: vistaPrincipalContenido,
                    contenedorDeAlertas,
                    cargarContenidoTabla,
                    registro,
                });
                tdOpciones.append(btnActivar, " ");
            }
            // Opción para ingresar al detalle de la transacción
            const btnDetalleTransaccion = botonDetalleTransaccion(
                () => DetalleTransaccion({
                    codigo,
                    permisos,
                    vistaTransaccion: vistaPrincipal,
                    vistaDetalle: vistaDetalleTransaccion,
                    registroTransaccion: registro,
                    elementoTd:tdOpciones
                }),
            );
            // Botón para abir el reporte PDF del estado de cuenta de la factura seleccionada
            const btnVPDetalleTrans = crearBotonIconoPdfMake({
                contenedorModal: vistaPrincipal,
                obtenerContenido: pdfMakeDetalleTransaccion(`${URL}listadetalletransaccion/${registro.id}`, registro),
                tituloBoton: "Comprobante contable",
            });

            tdOpciones.append(btnDetalleTransaccion, " ", btnVPDetalleTrans, " ");

            if (PUEDE_EDITAR && (([1, "1"].includes(valorConsolidar) && !["4"].includes(valorEstado)) || valorEstado === "10")) {
                // Opción para editar la transacción
                // Crear botón editar con modal de formulario
                const botonEditar= botonModalEditar(
                    {
                        contenedorDeAlertas,
                        camposDeFormulario: formularioTransaccion(registro),
                        URL_FORM: URL,
                        URL_LISTAR: URL_LT,
                        configuracionModal: {
                                tituloModal: "Edición de Transacción",
                            },
                        camposAdicionales: {
                            ver: "registrotransaccionf5",
                            idt: registro.id,
                            fecha_siguiente: registro.fecha_siguiente,

                        },
                        datosRegistro: registro,
                        cargarContenidoTabla,
                        callbacks: {
                            previaSolicitud: validarFechaTransaccion(vistaPrincipalContenido, undefined, {
                                fechaInicio:  registro.fecha_siguiente,
                                fechaFin: registro.fecha_anterior,
                            }),
                        },
                    },
                    vistaPrincipalContenido
                );
                tdOpciones.append(botonEditar, " ");
            }

            const dropdownMenu = [];
            if (PUEDE_ESCRIBIR && ((valorConsolidar === "1" || valorConsolidar === 1) && valorEstado !== "4")) {
                // Opción para más opciones: duplicar, insertar, anular, eliminar
                const duplicarTr = duplicarTransaccion({
                    urlDuplicar: `${URL}duplicartransaccion/${registro.id}`,
                    URL_LT,
                    contenedorDeAlertas,
                    vistaPrincipal: vistaPrincipalContenido,
                    cargarContenidoTabla,
                });
                dropdownMenu.push({
                    texto: "Duplicar",
                    callback: duplicarTr,
                });
            }
            if (PUEDE_ESCRIBIR) {
                // Opción para solicitar la inserción de una transacción
                // La inserción hace que en N° de la transacción actual y las posteriores se incrementen en 1, previa aprobación desde el menú de autorizaciones
                const solicitarInsertarTransaccion = () => {
                    const [fecha, hora] = obtenerFechaActual("array-fechahora");
                    const modalInsertar = modalFormularioEditar({ // se reutiliza la función de editar para crear un nuevo registro
                        contenedorDeAlertas,
                        camposDeFormulario: formularioTransaccionInsertar(registro),
                        URL_FORM: URL,
                        URL_LISTAR: URL_LT,
                        configuracionModal: {
                            tituloModal: "Solicitud de Inserción de Transacción",
                        },
                        configuraciones: {
                            configuracionBotones: {
                                nombreEnviar: "Solicitar",
                                clasesEnviar: "btn btn-info",
                            },
                            mensajeExito: "Solicitud de inserción enviada con éxito.",
                            mensajeError: "Error al enviar la solicitud de inserción.",
                        },
                        camposAdicionales: {
                            ver: "registrar_transaccionEn_espera",
                            idempresa: EMPRESA_ID,
                            sucursal: SUCURSAL_ID,
                            fecha,
                            hora,
                            estado: "0",
                            idusuario: USUARIO_ID,
                            transacciones_idtransacciones: registro.id,
                            fecha_siguiente: registro.fecha_siguiente,
                        },
                        callbacks: {
                            previaSolicitud: validarFechaTransaccion(vistaPrincipalContenido, "insertartransaccion", {
                                fechaInicio:  registro.fecha_siguiente,
                                fechaFin: registro.fecha_anterior,
                            }),
                            // enError: manejarErrorTransaccion,
                        },
                        cargarContenidoTabla,
                    });
                    vistaPrincipalContenido.appendChild(modalInsertar);
                };
                dropdownMenu.push({
                    texto: "Insertar",
                    callback: solicitarInsertarTransaccion,
                });
            }
            if (PUEDE_ELIMINAR && !["4", "2", "3", "5"].includes(valorEstado)) {
                // Opción para solicitar la anulación de la transacción
                const anularTr = () => solicitarAnularTransaccion({
                    URL,
                    URL_LT,
                    contenedorDeAlertas,
                    vistaPrincipal: vistaPrincipalContenido,
                    cargarContenidoTabla,
                    registro,
                });
                dropdownMenu.push({
                    texto: "Anular",
                    callback: anularTr,
                });
            }
            if (PUEDE_ELIMINAR && ((["1", 1].includes(valorConsolidar) && !["2", "3", "5", "10"].includes(valorEstado)) || valorEstado === "10")) {
                // Opción para solicitar la eliminación de la transacción
                // Al aceptar la solicitud, las facturas vinculadas a la transacción quedan disponibles para ser reasignadas a otra transacción y se actualiza el N° de las transacciones posteriores
                const solicitudEliminarTr = () =>  solicitarEliminarTransaccion({
                    URL,
                    URL_LT,
                    contenedorDeAlertas,
                    vistaPrincipal: vistaPrincipalContenido,
                    cargarContenidoTabla,
                    registro,
                });
                dropdownMenu.push({
                    texto: "Eliminar",
                    callback: solicitudEliminarTr,
                });
            }

            // Creación del menú desplegable para más opciones, solo si hay opciones disponibles
            if (dropdownMenu.length > 0) {
                const icono = crearElemento("i", {class: "bi bi-three-dots-vertical"});
                const btnDropdown = crearElemento("button", {type: "button", class: "btn btn-info btn-sm rounded-1", "data-bs-toggle": "dropdown", "aria-expanded": "false", title: "Más opciones"}, [icono]);
                const ul = crearElemento("ul", {class: "dropdown-menu dropdown-menu-end"});
                const div = crearElemento("div", {class: "btn-group dropup"}, [btnDropdown, ul]);

                for (const data of dropdownMenu) {
                    const a = crearElemento("a", { class: "dropdown-item" }, [data.texto]);
                    a.addEventListener("click", () => {
                        data.callback()
                    });
                    const li = crearElemento("li", undefined, [a]);
                    ul.append(li, " ");
                }
                tdOpciones.append(div, " ");
            }
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            const estadoAsientoTrans =  estadoAsientoTransaccion(registro);
            if (!estadoAsientoTrans) {
                fila.classList.add("table-danger");
            }
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            popover: {
                title: "Transacciones",
                description: "Área que permite la gestión de transacciones y asientos contables de la Empresa según la gestión activa.",
            },
        },
        {
            mainElement: vistaPrincipalContenido,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Nuevo Registro",
                description: "Abre un formulario para registrar una nueva transacción en el sistema. Solo disponible si no se ha realizado el cierre de gestión.",
            },
        },
        {
            mainElement: vistaPrincipalContenido,
            element: "[data-id='tr-btn-transaccionasiento']",
            popover: {
                title: "Transacción con Asiento",
                description: "Abre un modal para registrar una nueva transacción junto con su asiento contable. Solo disponible si no se ha realizado el cierre de gestión.",
            },
        },
        {
            mainElement: vistaPrincipalContenido,
            element: "[data-id='tr-btn-pendientesregistro']",
            popover: {
                title: "Pendientes de Registro",
                description: "Lista las facturas u otros documentos registrados desde Caja o Bancos que aún no están asignados a alguna transacción o que se hubieran desvinculado al eliminar una Transacción o se hubiera creado y aún no estuviera asignado a ninguna Transacción.",
            },
        },
        {
            mainElement: vistaPrincipalContenido,
            element: "[data-id='tr-btn-consolidarmultiple']",
            popover: {
                title: "Consolidar múltiples transacciones",
                description: "Abre un modal que permite consolidar todas las transacciones o por rangos según el N° de transacción.",
            },
        },
        {
            mainElement: vistaPrincipalContenido,
            element: "[data-id='tr-btn-desconsolidarmultiple']",
            popover: {
                title: "Desconsolidar múltiples transacciones",
                description: "Abre un modal que permite desconsolidar transacciones por rangos según el N° de transacción. No disponible si existen asientos de cierre o precierre.",
            },
        },
        {
            mainElement: vistaPrincipalContenido,
            element: "[data-id='tr-btn-asientocierre']",
            popover: {
                title: "Agregar asientos de cierre",
                description: `Abre un modal para agregar asientos de pre-cierre(Cuentas de Resultado) y cierre definitivo(Cuenta de Balance). No disponible si ya se realizó el cierre de gestión. <br>
                Previamente deberá tener seleccionado la cuenta de Cierre de gestión en (Configuración &gt; Vinculación de cuentas &gt; Otras Cuentas) y no tener transacciones "cojas"`
            },
        },
        {
            mainElement: vistaPrincipalContenido,
            element: "[data-id='tr-btn-asientoapertura']",
            popover: {
                title: "Agregar asientos de apertura",
                description: "Abre un modal para agregar asientos de apertura. No disponible si ya se realizó la apertura de gestión.",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar transacción",
                description: "Permite buscar transacciones considerando todas las columnas de la tabla.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla de transacciones",
                description: "Muestra todas las transacciones registradas en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Consolidar']",
            popover: {
                title: "Consolidar",
                description: "Consolidar: Permite Asegurar el registro de Transacción ante cualquier modificación posterior, así mismo habilitando este registro para ser tomado en cuenta en reportes de Gestión. Puede ser nuevamente Activado/Desconsolidado previa aprobación de solicitud de autorización.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Desconsolidar']",
            popover: {
                title: "Desconsolidar transacción",
                description: "Abre un modal que permite solicitar la desconsolidación de la transacción seleccionada. (Disponible si la transacción está consolidada y no está anulada o eliminada).",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Asiento Contable']",
            popover: {
                title: "Asiento contable",
                description: "Permite crear o editar el Asiento Contable de la transacción seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Comprobante contable']",
            popover: {
                title: "Comprobante contable",
                description: "Muestra el comprobante contable de la transacción seleccionada. Se puede descargar en formato PDF.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar transacción",
                description: "Abre un formulario para modificar los datos de la transacción seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Más opciones']",
            popover: {
                title: "Mostrar más opciones",
                description: `Muestra un menú desplegable con más opciones para la transacción seleccionada: duplicar, insertar, anular o eliminar, a ejecutarse previa aprobación de solicitud.
                <ul>
                    <li>Duplicar: Duplica la transacción con todos sus detalles Ej Cuentas y valores, etc, como una nueva Transacción. </li>
                    <li>Insertar: Inserta una Transacción abajo de la actual, previamente se solicita autorización, de ser aprobado se crea la Transacción haciendo que todas las posteriores se incrementen en 1 para mantener el correlativo. </li>
                </ul>`,
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Más opciones']",
            popover: {
                description: `<ul>
                    <li>Anular: La Transacción queda inactiva no se considerarán para ningún reporte contable. Las facturas adjuntas permanecen allí. </li>
                    <li>Eliminar: Se genera una solicitud de autorización para eliminar la Transacción en caso de aprobarse se elimina definitivamente y las facturas adjuntas en caso de existir se desvinculan mostrándose en una lista en un estado disponible para reasignación a nueva Transacción. </li>
                </ul>`,
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipalEncabezado);
    ajustarAlturaTabla(divTabla, 200);
}

// =========================================================
// FUNCIONES BOTONES DE LA VISTA
// =========================================================

/**
 * Función: Crear un modal para registrar una transacción por asiento modelo
 * Descripción: Esta función crea un modal con un formulario para registrar una transacción utilizando un asiento modelo predefinido.
 * Fecha: 25 de junio de 2024
 * Autor: Joel Choque
 */
function crearTransaccionPorAsiento(URL, URL_LT, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, manejarErrorTransaccion) {
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Crear Transacción"});
    const formulario = `
        <form class="row g-3">
            <div>
                <label for="transasiento-fecha" class="form-label">Fecha <span class="text-danger fw-bold">*</span></label>
                <input type="date" class="form-control" name="fecha" id="transasiento-fecha" value="${obtenerFechaActual()}" required>
            </div>
            <div>
                <label for="transasiento-monto" class="form-label">Monto <span class="text-danger fw-bold">*</span></label>
                <input type="number" class="form-control" name="monto" id="transasiento-monto" onkeydown="return event.key !== 'e' && event.key !== 'E'" required>
            </div>
            <div>
                <label for="transasiento-asiento" class="form-label">Asiento Modelo <span class="text-danger fw-bold">*</span></label>
                <select class="form-select" name="idasiento" id="transasiento-asiento" required></select>
            </div>
            <div>
                <label for="transasiento-glosa" class="form-label">Glosa</label>
                <textarea class="form-control" name="glosa" id="transasiento-glosa" rows="1"></textarea>
            </div>
            <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <button class="btn btn-primary" id="btn-enviar-formulario" style="min-width: 100px;">Guardar</button>
                <button type="button" class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 100px;">Cancelar</button>
            </div>
        </form>`;
    cuerpoModal.innerHTML = formulario;
    const elementoFormulario = cuerpoModal.querySelector("form");
    const selectAsiento = elementoFormulario.querySelector("#transasiento-asiento");
    const inputGlosa = elementoFormulario.querySelector("#transasiento-glosa");

    const empresa_id = getEmpresaId();
    const sucursal_id = getSucursalId();

    // Función para asignar la glosa por defecto según el asiento seleccionado
    const glosaDefaultNombreAsiento = (valorSelect) => {
        if (valorSelect) {
            inputGlosa.value = selectAsiento.options[selectAsiento.selectedIndex].text;
        } else {
            inputGlosa.value = "";
        }
    };
    manejarSelect(selectAsiento, { urlSolicitud: `${URL}listaasientos/${empresa_id}`, llavesOpciones: { valor: "id", detalle: "nombre" }, callbackInput: glosaDefaultNombreAsiento });

    // Preparación y envio de formulario y control de la respuesta
    // Al enviar el formulario, se registra la transacción y se actualiza la tabla de transacciones.
    elementoFormulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const accionEnviar = async() => {
            const listaDeRegistros = await obtenerDatos(URL_LT);
            await cargarContenidoTabla(listaDeRegistros);
            alertaDeExito(contenedorDeAlertas, "Registro exitoso");
            cerrarModal();
        }
        const error = (respuesta) => {
            manejarErrorTransaccion(respuesta, {cerrarModal});
            // cerrarModal();
            // alertaDeError(contenedorDeAlertas, "Ocurrió un error al realizar el registro");
        }

        // const fecha = obtenerFechaActual();
        manejarEnvioFormulario({
            refFormulario: elementoFormulario,
            urlSolicitud: URL,
            camposAdicionales: {
                empresa: empresa_id,
                sucursal: sucursal_id,
                ver: "registrotransaccion_por_asiento"
            },
            callbackExito: accionEnviar,
            callbackError: error,
        });
    });
    vistaPrincipal.appendChild(modal);
}

/**
 * Función: Realiza la consolidación múltiple de transacciones.
 * Descripción: Esta función abre un modal que permite al usuario consolidar múltiples transacciones ya sea todas o dentro de un rango específico de números de transacción.
 * Fecha: 26 de junio de 2024
 * Autor: Joel Choque
 */
function consolidacionMultiple(vistaPrincipal, contenedorDeAlertas, URL, urlTransaccion, cargarContenidoTabla) {
    // Crea un modal con un formulario
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Consolidación"});

    const [inputTransInicio, divTransInicio] = campoInput(
        { atributos: { type: "number", name: "inicio", id: "consolidacionmultiple-inicio", required: "required", min: 1 } },
        { contenido: "Trans. Inicio" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const [inputTransFin, divTransFin] = campoInput(
        { atributos: { type: "number", name: "fin", id: "consolidacionmultiple-fin", required: "required", min: 1 } },
        { contenido: "Trans. Final" },
        { atributos: { class: "col-12 col-md-6" } }
    );
    const [checkboxTodos, divCheckboxTodos] = campoCheckbox(
        { atributos: { id: "consolidacionmultiple-todos", name: "todos", value: "1" } },
        { contenido: "Todos" },
    );

    const botonConsolidar = crearElemento("button", { class: "btn btn-primary", type: "submit", style: "min-width: 100px;" }, ["Consolidar"]);
    const botonCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 100px;" }, ["Cancelar"]);
    const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center" }, [botonConsolidar, botonCancelar]);

    const elementoFormulario = crearElemento("form", { class: "row g-3" }, [ divTransInicio, divTransFin, divCheckboxTodos, divBotones ]);
    cuerpoModal.appendChild(elementoFormulario);

    // Lógica para habilitar/deshabilitar los campos de rango según el checkbox
    checkboxTodos.addEventListener("change", () => {
        const esChecked = checkboxTodos.checked;
        if (esChecked) {
            inputTransInicio.value = "";
            inputTransFin.value = "";
            inputTransInicio.disabled = true;
            inputTransFin.disabled = true;
        } else {
            inputTransInicio.disabled = false;
            inputTransFin.disabled = false;
        }
    });

    // Preparación y envio de formulario y control de la respuesta
    elementoFormulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        botonConsolidar.disabled = true;
        botonCancelar.disabled = true;
        botonConsolidar.innerHTML = contenidoDeCargaBtn("Consolidar");

        const inicio = inputTransInicio.value;
        const fin = inputTransFin.value;
        const todos = checkboxTodos.checked;

        const listaTrans = await obtenerDatos(urlTransaccion)
        // Validaciones de la lista de transacciones
        if (!listaTrans) {
            alertaDeError(contenedorDeAlertas, "No se pudo obtener la lista de transacciones")
            cerrarModal();
            return;
        }
        // Filtrar transacciones según la selección del usuario, para consolidar solo las válidas
        const resultados = todos ? filtrarTransacciones(listaTrans): filtrarTransacciones(listaTrans, Number(inicio), Number(fin));
        if (resultados.length === 0) {
            alertaDeAdvertencia(contenedorDeAlertas, "No se consolidaron transacciones")
            cerrarModal();
            return;
        }
        // Preparar datos para la solicitud de consolidación
        const datosTrans = resultados.map(item => {
            return {
                idtransacciones: item.id,
                consolidar: item.consolidar,
                estado: item.estado,
                ntransaccion: item.ntransaccion,
            }
        });
        const accionEnviar = async() => {
            // Actualizar la tabla con los nuevos datos
            const listaDeRegistros = await obtenerDatos(urlTransaccion);
            cargarContenidoTabla(listaDeRegistros);
            alertaDeExito(contenedorDeAlertas, "Consolidación exitosa")
            cerrarModal();
        }
        const error = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo realizar la consolidación")
            cerrarModal();
        }
        const advertencia = (respuesta) => {
            alertaDeAdvertencia(contenedorDeAlertas, respuesta[1]);
            cerrarModal();
        }

        // Envío de datos para la consolidación múltiple
        const datos = {
            transacciones: JSON.stringify(datosTrans),
            ver: "consolidacion_multiple"
        }
        enviarDatosOJson({
            datos,
            urlSolicitud: URL,
            callbackExito: accionEnviar,
            callbackError: error,
            callbackAdvertencia: advertencia
        });
    });

    vistaPrincipal.appendChild(modal);
}

/**
 * Función: Solicita la desconsolidación múltiple de transacciones.
 * Descripción: Esta función abre un modal que permite al usuario solicitar la desconsolidación de múltiples transacciones dentro de un rango específico de números de transacción.
 *              Esta solicitud aparecerá para su aprobación en el menú de autorizaciones.
 * Fecha: 26 de junio de 2024
 * Autor: Joel Choque
 */
function solicitudDesconsolidacionMultiple(vistaPrincipal, URL, contenedorDeAlertas) {
    // Crea un modal con un formulario
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Solicitar Desconsolidación"});
    const formulario = `<form class="row g-3">
            <div>
                <label for="desconsolidacionmultiple-motivo" class="form-label">Motivo <span class="text-danger fw-bold">*</span></label>
                <textarea rows="2" class="form-control" name="motivo" id="desconsolidacionmultiple-motivo" required></textarea>
            </div>
            <div class="col-12 col-md-6">
                <label for="desconsolidacionmultiple-inicio" class="form-label">Trans. Inicio: <span class="text-danger fw-bold">*</span></label>
                <input type="number" class="form-control" name="rangoa" id="desconsolidacionmultiple-inicio" onkeydown="return event.key !== 'e' && event.key !== 'E'" min="1" required>
            </div>
            <div class="col-12 col-md-6">
                <label for="desconsolidacionmultiple-fin" class="form-label">Trans. Final: <span class="text-danger fw-bold">*</span></label>
                <input type="number" class="form-control" name="rangob" id="desconsolidacionmultiple-fin" onkeydown="return event.key !== 'e' && event.key !== 'E'" min="1" required>
            </div>

            <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <button class="btn btn-primary" id="btn-enviar-formulario" style="min-width: 100px;">Solicitar</button>
                <button type="button" class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 100px;">Cancelar</button>
            </div>
        </form>`;
    cuerpoModal.innerHTML = formulario;
    const elementoFormulario = cuerpoModal.querySelector("form");

    const usuario_id = getUsuarioId();
    const empresa_id = getEmpresaId();

    // Preparación y envio de formulario y control de la respuesta
    elementoFormulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const accionEnviar = async() => {
            alertaDeExito(contenedorDeAlertas, "Solicitud enviada con éxito")
            cerrarModal();
        }
        const error = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo enviar la solicitud")
            cerrarModal();
        }

        const [fecha, hora] = obtenerFechaActual("array-fechahora");
        // Envío de datos para la solicitud de desconsolidación múltiple
        manejarEnvioFormulario({
            refFormulario: elementoFormulario,
            urlSolicitud: URL,
            camposAdicionales: {
                ver: "rangosolicituddesconsolidar",
                estado: 0,
                hora,
                fecha,
                idusuario: usuario_id,
                idempresa: empresa_id
            },
            callbackExito: accionEnviar,
            callbackError: error
        });
    });
    vistaPrincipal.appendChild(modal);
}

/**
 * Función: Crea una transacción de cierre o precierre de gestión.
 * Descripción: Esta función abre un modal que permite al usuario crear una transacción de cierre o precierre de gestión.
 *              Estas transacciones solo se pueden crear si no existen previamente en la gestión activa.
 * Fecha: 26 de junio de 2024
 * Autor: Joel Choque
 */
function crearTransaccionCierreYPrecierre(datosTrans) {
    const {
        vistaTrans,
        contenedorDeAlertas,
        URL,
        urlTransaccion,
        cargarContenidoTabla,
        esPrecierre,
        esCierre
    } = datosTrans;

    // Referencias a botones para ocultarlos si se crea el precierre o cierre
    const divBotonDescnMultiple = vistaTrans.querySelector("[data-id='tr-btn-desconsolidarmultiple']")?.closest(".col.col-auto");
    const divBotonCierre = vistaTrans.querySelector("[data-id='tr-btn-asientocierre']").closest(".col.col-auto");
    const divBotonNuevo = vistaTrans.querySelector("[data-id='__btn-registro']")?.closest(".col.col-auto");

    // Crea un modal con un formulario
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Crear Transacción"});
    const [inputFecha, divInputFecha] = campoInput(
        { atributos: { type: "date", name: "fecha", id: "transcierre-fecha", value: obtenerFechaActual() } },
        { contenido: "Fecha" },
    );
    const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-start mt-4" });
    let botonPrecierre;
    let botonCierre;
    if (esPrecierre === "false") {
        botonPrecierre = crearElemento("button", { class: "btn btn-warning", type:"button" }, ["Asiento de Precierre"]);
        divBotones.appendChild(botonPrecierre);
    }
    if (esCierre === "false") {
        botonCierre = crearElemento("button", { class: "btn btn-warning", type:"button" }, ["Asiento de Cierre"]);
        divBotones.appendChild(botonCierre);
    }
    const contenido = crearElemento("div", undefined, [ divInputFecha, divBotones ]);
    cuerpoModal.appendChild(contenido);

    const empresa_id = getEmpresaId();
    const sucursal_id = getSucursalId();

    // Preparación y envio de formulario y control de la respuesta para precierre
    // Al enviar el formulario, se registra la transacción y se actualiza la tabla de transacciones.
    botonPrecierre?.addEventListener("click", async(e) => {
        e.preventDefault();
        botonPrecierre.disabled = true;
        botonPrecierre.innerHTML = contenidoDeCargaBtn("Asiento de Precierre");
        botonCierre?.setAttribute("disabled", "");

        // Validar que la fecha esté dentro de la gestión activa
        const fechaCierreTr = inputFecha.value;
        const datoGestionActiva = await obtenerDatos(`${URL}getgestionactual/${empresa_id}`);
        if (datoGestionActiva && datoGestionActiva.nombre) {
            if (!(datoGestionActiva.fechaini <= fechaCierreTr && fechaCierreTr <= datoGestionActiva.fechafin)) {
                const modalInfo = modalDeInformacion("La fecha no corresponde a la Gestión Activa");
                vistaTrans.appendChild(modalInfo);
                modalInfo.querySelector("button[data-id='__btn-cerrar']").focus();
                botonPrecierre.disabled = false;
                botonPrecierre.innerHTML = "Asiento de Precierre";
                botonCierre?.removeAttribute("disabled");
                return;
            }
        } else {
            const modalInfo = modalDeInformacion("No se pudo obtener la Gestión Activa");
            vistaTrans.appendChild(modalInfo);
            modalInfo.querySelector("button[data-id='__btn-cerrar']").focus();
            botonPrecierre.disabled = false;
            botonPrecierre.innerHTML = "Asiento de Precierre";
            botonCierre?.removeAttribute("disabled");
            return;
        }
        // Acción a realizar en caso de éxito
        const accionEnviar = async() => {
            divBotonDescnMultiple?.remove();
            divBotonNuevo?.remove();
            esPrecierre = "true";
            if (esPrecierre === "true" && esCierre === "true") {
                divBotonCierre.remove();
            }
            // Actualizar la tabla con los nuevos datos
            const listaDeRegistros = await obtenerDatos(urlTransaccion);
            alertaDeExito(contenedorDeAlertas, "Precierre creado con éxito")
            cargarContenidoTabla(listaDeRegistros)
            cerrarModal();
        }
        const error = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo crear el precierre")
            cerrarModal();
        }
        const advertencia = (respuesta) => {
            alertaDeAdvertencia(contenedorDeAlertas, respuesta[1]);
            cerrarModal();
        }

        // Envío de datos para registrar el precierre
        const datos = {
            fecha,
            empresa: empresa_id,
            sucursal: sucursal_id,
            ver: "registrar_cuenta_pre_cierre"
        }
        const fecha = obtenerFechaActual();
        enviarDatosOJson({
            datos,
            urlSolicitud: URL,
            callbackExito: accionEnviar,
            callbackError: error,
            callbackAdvertencia: advertencia
        });
    });
    // Preparación y envio de formulario y control de la respuesta para cierre
    // Al enviar el formulario, se registra la transacción y se actualiza la tabla de transacciones.
    botonCierre?.addEventListener("click", async (e) => {
        e.preventDefault();
        botonCierre.disabled = true;
        botonCierre.innerHTML = contenidoDeCargaBtn("Asiento de Cierre");
        botonPrecierre?.setAttribute("disabled", "");

        // Validar que la fecha esté dentro de la gestión activa
        const fechaCierreTr = inputFecha.value;
        const datoGestionActual = await obtenerDatos(`${URL}getgestionactual/${empresa_id}`);
        if (datoGestionActual && datoGestionActual.nombre) {
            if (!(datoGestionActual.fechaini <= fechaCierreTr && fechaCierreTr <= datoGestionActual.fechafin)) {
                const modal = modalDeInformacion("La fecha no corresponde a la Gestión Activa");
                vistaTrans.appendChild(modal);
                modal.querySelector("button[data-id='__btn-cerrar']").focus();
                botonCierre.disabled = false;
                botonCierre.innerHTML = "Asiento de Cierre";
                botonPrecierre?.removeAttribute("disabled");
                return;
            }
        } else {
            const modal = modalDeInformacion("No se pudo obtener la Gestión Activa");
            vistaTrans.appendChild(modal);
            modal.querySelector("button[data-id='__btn-cerrar']").focus();
            botonCierre.disabled = false;
            botonCierre.innerHTML = "Asiento de Cierre";
            botonPrecierre?.removeAttribute("disabled");
            return;
        }
        const accionEnviar = async() => {
            divBotonDescnMultiple?.remove();
            divBotonNuevo?.remove();
            esCierre = "true";
            if (esPrecierre === "true" && esCierre === "true") {
                divBotonCierre.remove();
            }
            // Actualizar la tabla con los nuevos datos
            const listaDeRegistros = await obtenerDatos(urlTransaccion);
            alertaDeExito(contenedorDeAlertas, "Cierre creado con éxito")
            cargarContenidoTabla(listaDeRegistros)
            cerrarModal();
        }
        const error = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo crear el cierre")
            cerrarModal();
        }
        const advertencia = (respuesta) => {
            alertaDeAdvertencia(contenedorDeAlertas, respuesta[1]);
            cerrarModal();
        }

        // Envío de datos para registrar el cierre
        const fecha = obtenerFechaActual();
        const datos = {
            fecha,
            empresa: empresa_id,
            sucursal: sucursal_id,
            ver: "registrar_cuenta_cierre"
        }
        enviarDatosOJson({
            datos: datos,
            urlSolicitud: URL,
            callbackExito: accionEnviar,
            callbackError: error,
            callbackAdvertencia: advertencia
        });
    });

    vistaTrans.appendChild(modal);
}

/**
 * Función: Crea una transacción de apertura de gestión.
 * Descripción: Esta función abre un modal que permite al usuario crear una transacción de apertura de gestión.
 *              La transacción de apertura se basa en la gestión anterior, por lo que no se puede crear si no existe una gestión previa con su respectivo cierre.
 * Fecha: 26 de junio de 2024
 * Autor: Joel Choque
 */
function crearTransaccionDeApertura(datosTrans) {
    const {
        URL,
        URL_LT_TRS,
        vistaTrans,
        contenedorDeAlertas,
        cargarContenidoTabla,
        idGestionAnterior
    } = datosTrans;

    // Crea un modal con un formulario
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Crear Transacción"});

    const [inputFecha, divInputFecha] = campoInput(
        { atributos: { type: "date", name: "fecha", id: "transapertura-fecha", value: obtenerFechaActual() } },
        { contenido: "Fecha" },
    );
    const botonApertura = crearElemento("button", { class: "btn btn-warning mt-4", type:"button" }, ["Asiento de Apertura"]);
    const contenido = crearElemento("div", undefined, [ divInputFecha, botonApertura ]);
    cuerpoModal.appendChild(contenido);

    const empresa_id = getEmpresaId();
    const sucursal_id = getSucursalId();

    // Preparación y envio de formulario y control de la respuesta
    botonApertura.addEventListener("click", async(e) => {
        e.preventDefault();
        botonApertura.disabled = true;
        botonApertura.innerHTML = contenidoDeCargaBtn("Asiento de Apertura");

        // Validar que la fecha esté dentro de la gestión activa
        const fechaAperturaTr = inputFecha.value;
        const datoGestionActiva = await obtenerDatos(`${URL}getgestionactual/${empresa_id}`);
        if (datoGestionActiva && datoGestionActiva.nombre) {
            if (!(datoGestionActiva.fechaini <= fechaAperturaTr && fechaAperturaTr <= datoGestionActiva.fechafin)) {
                const modalInf = modalDeInformacion("La fecha no corresponde a la Gestión Activa");
                vistaTrans.appendChild(modalInf);
                modalInf.querySelector("button[data-id='__btn-cerrar']").focus();

                botonApertura.disabled = false;
                botonApertura.innerHTML = "Asiento de Apertura";
                return;
            }
        } else {
            const modal = modalDeInformacion("No se pudo obtener la Gestión Activa");
            vistaTrans.appendChild(modal);
            botonApertura.disabled = false;
            botonApertura.innerHTML = "Asiento de Apertura";
            return;
        }

        const accionEnviar = async() => {
            // Actualizar la tabla con los nuevos datos
            const listaDeRegistros = await obtenerDatos(URL_LT_TRS);
            alertaDeExito(contenedorDeAlertas, "Transacción creada con éxito")
            cargarContenidoTabla(listaDeRegistros)
            cerrarModal();
            // Ocultar el botón de asiento de apertura
            vistaTrans.querySelector("[data-id='tr-btn-asientoapertura']").closest(".col.col-auto").remove();
        };
        const error = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo crear la transacción de apertura");
            cerrarModal();
        };
        const advertencia = (respuesta) => {
            alertaDeAdvertencia(contenedorDeAlertas, respuesta[1]);
            cerrarModal();
        };

        // Envío de datos para registrar el asiento de apertura
        const fecha = obtenerFechaActual();
        const datos = {
            fecha,
            idgestion_anterior: idGestionAnterior.idgestion,
            empresa: empresa_id,
            sucursal: sucursal_id,
            ver: "registrar_cuenta_apertura",
        }
        enviarDatosOJson({
            datos: datos,
            urlSolicitud: URL,
            callbackExito: accionEnviar,
            callbackError: error,
            callbackAdvertencia: advertencia
        });
    });
    vistaTrans.appendChild(modal);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/** Función: Crea el botón para consolidar o desconsolidar una transacción.
 * Descripción: Esta función crea un botón que permite al usuario consolidar o desconsolidar una transacción, dependiendo de su estado actual.
 *              Para la desconsolidación se realiza una solicitud mediante un formulario en un modal, la solicitud se verá para su aprobación en el menú de autorizaciones.
 * Fecha: 27 de junio de 2024
 * Autor: Joel Choque
 */
function botonConsolidarTransaccion(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        URL_LT,
        cargarContenidoTabla,
        registro,
    } = datosVista;
    const botonConsolidar = crearElemento("button");
    if (!estadoAsientoTransaccion(registro)){
        botonConsolidar.style.display = "none";
    }

    if (registro.consolidar && registro.consolidar === "1") {
        const i = crearElemento("i", {class: "bi bi-unlock-fill"});
        botonConsolidar.setAttribute("class", "btn btn-success btn-sm");
        botonConsolidar.setAttribute("title", "Consolidar");
        botonConsolidar.append(i);

        // Evento para consolidar la transacción
        botonConsolidar.addEventListener("click", () => {
            // Crea un modal de confirmación para consolidar el registro
            const activar = async() => {
                const respuesta = await obtenerDatos(`${URL}consolidar/${registro.id}/2`);
                if (respuesta) {
                    const listaDeRegistros = await obtenerDatos(`${URL_LT}`);
                    cargarContenidoTabla(listaDeRegistros)
                    alertaDeExito(contenedorDeAlertas, "Registro consolidado con éxito")
                } else {
                    alertaDeError(contenedorDeAlertas, "No se pudo consolidar el registro")
                }
            }
            const modalConfirmar = modalDeConfirmacion(activar, "¿Esta seguro de consolidar el registro?");
            vistaPrincipal.appendChild(modalConfirmar);
            modalConfirmar.querySelector("[data-id='__btn-confirmar']").focus();
        });
    } else {
        const i = crearElemento("i", {class: "bi bi-lock-fill"});
        botonConsolidar.setAttribute("class", "btn btn-danger btn-sm");
        botonConsolidar.setAttribute("title", "Desconsolidar");
        botonConsolidar.append(i);
        // Evento para solicitar la desconsolidación de la transacción
        botonConsolidar.addEventListener("click", () => {
            // Crea un modal con un formulario
            const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Solicitar Desconsolidación"});
            const formulario = `
                <form class="row g-3">
                    <div>
                        <label for="desconsolidacion-motivo" class="form-label">Motivo <span class="text-danger fw-bold">*</span></label>
                        <textarea rows="2" class="form-control" name="motivo" id="desconsolidacion-motivo" required></textarea>
                    </div>

                    <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                        <button type="submit" class="btn btn-primary" id="btn-enviar-formulario" style="min-width: 100px;">Solicitar</button>
                        <a class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 100px;">Cancelar</a>
                    </div>
                </form>`;
            cuerpoModal.innerHTML = formulario;
            const elementoFormulario = cuerpoModal.querySelector("form");

            const usuario_id = getUsuarioId();
            const empresa_id = getEmpresaId();

            // Preparación y envio de formulario y control de la respuesta
            elementoFormulario.addEventListener("submit", (e) => {
                e.preventDefault();
                const accionEnviar = async() => {
                    alertaDeExito(contenedorDeAlertas, "Solicitud enviada con éxito")
                    cerrarModal();
                }
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "No se pudo enviar la solicitud")
                    cerrarModal();
                }
                // Envio de datos para registrar la solicitud de desconsolidación
                const [fecha, hora] = obtenerFechaActual("array-fechahora");
                manejarEnvioFormulario({
                    refFormulario: elementoFormulario,
                    urlSolicitud: URL,
                    camposAdicionales: {
                        idtransaccion: registro.id,
                        ver: "registrardesconsolidar",
                        fecha,
                        hora,
                        idusuario: usuario_id,
                        idempresa: empresa_id
                    },
                    callbackExito: accionEnviar,
                    callbackError: error
                });
            });
            vistaPrincipal.appendChild(modal)
        });
    }
    return botonConsolidar;
}

/**
 * Función: Crea el botón para solicitar la activación de una transacción anulada.
 * Descripción: Esta función crea un botón que permite al usuario solicitar la activación de una transacción que se encuentra en estado anulado.
 *              La solicitud se realiza mediante un formulario en un modal, y la solicitud se verá para su aprobación en el menú de autorizaciones.
 * Fecha: 27 de junio de 2024
 * Autor: Joel Choque
 */
function botonSolicitarActivacion ({URL, URL_LT, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, registro}) {
    const icono = crearElemento("i", {class: "bi bi-hand-thumbs-down-fill"});
    const botonActivar = crearElemento("button", {class: "btn btn-danger btn-sm", title: "Activar", type: "button"}, [icono]);

    // Evento para solicitar la activación de la transacción
    botonActivar.addEventListener("click", (e) => {
        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Solicitud de Activación"});

        const formulario = `
            <form class="row g-3">
                <div>
                    <label for="motivo_anular" class="form-label">Motivo <span class="text-danger fw-bold">*</span></label>
                    <textarea rows="2" class="form-control" name="motivo" id="motivo_anular" required></textarea>
                </div>
                <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <button class="btn btn-primary" id="btn-enviar-formulario" style="min-width: 100px;">Solicitar</button>
                    <a class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 100px;">Cancelar</a>
                </div>
            </form>`;
        cuerpoModal.innerHTML = formulario;
        const elementoFormulario = cuerpoModal.querySelector("form");

        const usuario_id = getUsuarioId();
        const empresa_id = getEmpresaId();

        // Preparación y envio de formulario y control de la respuesta
        // Al enviar el formulario, se registra la solicitud y se actualiza la tabla de transacciones.
        elementoFormulario.addEventListener("submit", (e) => {
            e.preventDefault();
            const accionEnviar = async() => {
                // Obtener y actualizar la lista de transacciones.
                const listaDeRegistros = await obtenerDatos(URL_LT);
                alertaDeExito(contenedorDeAlertas, "Solicitud enviada con éxito")
                cargarContenidoTabla(listaDeRegistros);
                cerrarModal();
            }
            const error = () => {
                alertaDeError(contenedorDeAlertas, "No se pudo enviar la solicitud")
                cerrarModal();
            }
            // Envio de datos para registrar la solicitud de activación
            const [fecha, hora] = obtenerFechaActual("array-fechahora");
            manejarEnvioFormulario({
                refFormulario: elementoFormulario,
                urlSolicitud: URL,
                camposAdicionales: {
                    ver: "registrar_anular_eliminar_activar_transaccion",
                    transacciones_idtransacciones: registro.id,
                    hora,
                    fecha,
                    estado_solicitud: "1",
                    estado_opcion: "3",
                    idusuario: usuario_id,
                    idempresa: empresa_id
                },
                callbackExito: accionEnviar,
                callbackError: error
            });
        })
        vistaPrincipal.appendChild(modal)
    });
    return botonActivar;
}

// Crea el botón para ver el detalle de la transacción
function botonDetalleTransaccion(callback) {
    const icono = crearElemento("i", { class: "bi bi-card-list" });
    const boton = crearElemento("button", {class: "btn btn-primary btn-sm", title: "Asiento Contable", type: "button"}, [icono]);
    boton.addEventListener("click", () => {
        callback();
    });
    return boton;
}

// =========================================================
// FUNCIONES OPCIONES DROPDOWN
// =========================================================

/**
 * Función: Duplicar una transacción existente.
 * Descripción: Esta función crea un modal de confirmación que permite al usuario duplicar una transacción existente.
 *              Al confirmar, se crea una nueva transacción con los mismos datos que la original, pero con un nuevo número de transacción.
 * Fecha: 26 de junio de 2024
 * Autor: Joel Choque
 */
function duplicarTransaccion (datosVista){
    const {urlDuplicar, URL_LT, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla} = datosVista;

    return () => {
        const confirmar = async () => {
            const resultado = await obtenerDatos(urlDuplicar);
            if (resultado) {
                alertaDeExito(contenedorDeAlertas, "Registro duplicado exitosamente");
                const listaDeRegistros = await obtenerDatos(URL_LT);
                cargarContenidoTabla(listaDeRegistros)
            } else {
                alertaDeError(contenedorDeAlertas, "Error al duplicar registro");
            }
        }
        const modal = modalDeConfirmacion(confirmar, "¿Desea duplicar la transacción?");
        vistaPrincipal.append(modal);
        modal.querySelector("button[data-id='__btn-confirmar']").focus();
    };
}

/**
 * Función: Solicita la anulación de una transacción.
 * Descripción: Esta función abre un modal que permite al usuario solicitar la anulación de una transacción específica.
 *              La solicitud realizada, se puede ver para su aprobación en el menú de autorizaciones.
 * Fecha: 26 de junio de 2024
 * Autor: Joel Choque
 */
function solicitarAnularTransaccion (datosVista) {
    const {URL, URL_LT, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, registro} = datosVista;

    const [modal, cuerpoModal, cerrarModal] = modalRemovible( {tituloModal: "Solicitud de Anulación"} );

    const formulario = `
        <form class="row g-3">
            <div>
                <label for="solicitudanular-motivo" class="form-label">Motivo <span class="text-danger fw-bold">*</span></label>
                <textarea rows="2" class="form-control" name="motivo" id="solicitudanular-motivo" required></textarea>
            </div>
            <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <button class="btn btn-primary" id="btn-enviar-formulario" style="min-width: 100px;">Solicitar</button>
                <button type="button" class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 100px;">Cancelar</button>
            </div>
        </form>`;
    cuerpoModal.innerHTML = formulario;
    const elementoFormulario = cuerpoModal.querySelector("form");

    const usuario_id = getUsuarioId();
    const empresa_id = getEmpresaId();

    // Preparación y envio de formulario y control de la respuesta
    // Al enviar el formulario, se registra la solicitud y se actualiza la tabla de transacciones.
    elementoFormulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const accionEnviar = async() => {
            // Obtener y actualizar los registros de la tabla de la vista principal.
            const listaDeRegistros = await obtenerDatos(URL_LT);
            cargarContenidoTabla(listaDeRegistros);
            alertaDeExito(contenedorDeAlertas, "Solicitud enviada con éxito")
            cerrarModal();
        }
        const error = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo enviar la solicitud")
            cerrarModal();
        }

        // Envio de datos para la solicitud de anulación
        const [fecha, hora] = obtenerFechaActual("array-fechahora");
        manejarEnvioFormulario({
            refFormulario: elementoFormulario,
            urlSolicitud: URL,
            camposAdicionales: {
                ver: "registrar_anular_eliminar_activar_transaccion",
                transacciones_idtransacciones: registro.id,
                hora,
                fecha,
                estado_solicitud: "1",
                estado_opcion: "1",
                idusuario: usuario_id,
                idempresa: empresa_id
            },
            callbackExito: accionEnviar,
            callbackError: error
        });
    });
    vistaPrincipal.appendChild(modal)
}

/**
 * Función: Solicita la eliminación de una transacción.
 * Descripción: Esta función abre un modal que permite al usuario solicitar la eliminación de una transacción específica.
 *              La solicitud realizada, se puede ver para su aprobación en el menú de autorizaciones.
 * Fecha: 26 de junio de 2024
 * Autor: Joel Choque
 */
function solicitarEliminarTransaccion (datosVista) {
    const {
        URL,
        URL_LT,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registro
    } = datosVista;

    // Crea un modal con un formulario
    const [modal, cuerpoModal, cerrarModal] = modalRemovible( {tituloModal: "Solicitud de Eliminación"} );
    const formulario = `
        <form class="row g-3">
            <div>
                <label for="solicitudeliminar-motivo" class="form-label">Motivo <span class="text-danger fw-bold">*</span></label>
                <textarea rows="2" class="form-control" name="motivo" id="solicitudeliminar-motivo" required></textarea>
            </div>
            <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <button class="btn btn-primary" id="btn-enviar-formulario" style="min-width: 100px;">Solicitar</button>
                <button type="button" class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 100px;">Cancelar</button>
            </div>
        </form>`;
    cuerpoModal.innerHTML = formulario;
    const elementoFormulario = cuerpoModal.querySelector("form");

    const usuario_id = getUsuarioId();
    const empresa_id = getEmpresaId();

    // Preparación y envio de formulario y control de la respuesta
    // Al enviar el formulario, se registra la solicitud y se actualiza la tabla de transacciones.
    elementoFormulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const accionEnviar = async() => {
            // Obtener y actualizar los registros de la tabla de la vista principal.
            const listaDeRegistros = await obtenerDatos(URL_LT);
            alertaDeExito(contenedorDeAlertas, "Solicitud enviada con éxito")
            cargarContenidoTabla(listaDeRegistros);
            cerrarModal();
        }
        const error = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo enviar la solicitud")
            cerrarModal();
        }
        // Envio de datos para la solicitud de eliminación
        const [fecha, hora] = obtenerFechaActual("array-fechahora");
        manejarEnvioFormulario({
            refFormulario: elementoFormulario,
            urlSolicitud: URL,
            camposAdicionales: {
                ver: "registrar_anular_eliminar_activar_transaccion",
                transacciones_idtransacciones: registro.id,
                hora,
                fecha,
                estado_solicitud: "1",
                estado_opcion: "2",
                idusuario: usuario_id,
                idempresa: empresa_id
            },
            callbackExito: accionEnviar,
            callbackError: error
        });
    });
    vistaPrincipal.appendChild(modal)
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

/**
 * Función: Valida que la fecha de la transacción esté dentro de la gestión activa.
 * Descripción: Esta función verifica que la fecha ingresada en el formulario de transacción esté comprendida dentro del rango de fechas de la gestión activa de la empresa.
 *              Además, si se proporcionan datos adicionales para validar, verifica que la fecha esté dentro de los límites establecidos.
 *              Esta función se maneja como una función previa al envío del formulario de registro o edición de transacción.
 * Fecha: 24 de junio de 2024
 * Autor: Joel Choque
 */
function validarFechaTransaccion(vista, prefijo = "transaccion", datosValidarOrden = null) {
    return async (enviarFormulario, formulario) => {
        const empresa_id = getEmpresaId();
        const fechaTr = formulario.querySelector(`#${prefijo}-fecha`).value;
        const datoGA = await obtenerDatos(`${CT_URLAPI}getgestionactual/${empresa_id}`);
        if (datoGA && datoGA.nombre) {
            if (datoGA.fechaini <= fechaTr && fechaTr <= datoGA.fechafin) {
                if (datosValidarOrden) {
                    // Valida la fecha según los límites proporcionados en datosValidarOrden
                    const { fechaInicio, fechaFin } = datosValidarOrden;

                    let mensaje;
                    if (fechaInicio && fechaFin && (fechaInicio > fechaTr || fechaTr > fechaFin)) {
                        mensaje = `La fecha ${prefijo === "insertartransaccion" ? "de inserción" : ""} no deberá ser anterior al ${formatoFecha(fechaInicio)}, tampoco posterior al ${formatoFecha(fechaFin)}.`;
                    } else if (fechaInicio && fechaInicio > fechaTr) {
                        mensaje = `La fecha ${prefijo === "insertartransaccion" ? "de inserción" : ""} debe ser igual o posterior al ${formatoFecha(fechaInicio)}.`;
                    } else if (fechaFin && fechaTr > fechaFin) {
                        mensaje = `La fecha ${prefijo === "insertartransaccion" ? "de inserción" : ""} debe ser igual o anterior al ${formatoFecha(fechaFin)}.`;
                    }
                    if (mensaje) {
                        const modalInfo = modalDeInformacion(mensaje, "fs-6 text-danger-emphasis");
                        vista.appendChild(modalInfo);
                        return;
                    }
                }

                enviarFormulario();
                return;
            }
        }
        const modal = modalDeInformacion("La fecha no corresponde a la Gestión Activa");
        vista.appendChild(modal);
        modal.querySelector("button[data-id='__btn-cerrar']").focus();
    };
}

/**
 * Función: Filtra transacciones con asientos balanceados dentro de un rango opcional.
 * Descripción: Esta función recibe una lista de transacciones y filtra aquellas que tienen sus asientos balanceados (suma del debe igual a la suma del haber).
 *              Además, permite filtrar por un rango específico de números de transacción si se proporcionan los parámetros ntransMin y ntransMax.
 * Fecha: 26 de junio de 2024
 * Autor: Joel Choque
 */
function filtrarTransacciones(data, ntransMin, ntransMax) {
    return data.filter(item => {
        const ntrans = Number(item.ntransaccion);

        // Filtrar por rango
        if (ntransMin && ntrans < ntransMin) return false;
        if (ntransMax && ntrans > ntransMax) return false;

        const detalle = item.detalle;
        if (!Array.isArray(detalle) || detalle.length === 0) return false;

        let sumaDebe = 0;
        let sumaHaber = 0;
        for (const d of detalle) {
            sumaDebe  += Math.round(parseFloat(d.debe || 0) * 100);
            sumaHaber += Math.round(parseFloat(d.haber || 0) * 100);
        }
        return sumaDebe === sumaHaber;
    });
};

/**
 * Función: Verifica si el asiento contable de una transacción está balanceado.
 * Descripción: Esta función revisa los detalles del asiento contable de una transacción para determinar si los totales del debe y haber están equilibrados.
 * Fecha: 27 de junio de 2024
 * Autor: Joel Choque
 */
function estadoAsientoTransaccion(registro) {
    if (registro.detalle && registro.detalle.length > 0) {
        let debe = 0;
        let haber = 0;
        for (const dh of registro.detalle) {
            debe += Math.round(parseFloat(dh.debe || 0) * 100);
            haber += Math.round(parseFloat(dh.haber || 0) * 100);
        }
        // debe = debe/100;
        // haber = haber/100;
        if (debe === haber) {
            return true;
        }
    }
    return false;
}

// Obtiene el estado de la transacción con diseño resaltado
function obtenerEstado (estado) {
    if (estado === "1") {
        return resaltarTexto("green", "Activo");
    } else if (estado === "2") {
        return resaltarTexto("blue", "Pendiente Anulación");
    } else if (estado === "3") {
        return resaltarTexto("blue", "Pendiente Eliminación");
    } else if (estado === "4") {
        return resaltarTexto("yellow", "Anulado");
    } else if (estado === "5") {
        return resaltarTexto("blue", "Pendiente Activación");
    } else if (estado === "7") {
        return resaltarTexto("blue", "Pendiente Desconsolidación");
    } else {
        return resaltarTexto("green", "Activo");
    }
}

/**
 * Función: Maneja el proceso posterior al registro de una transacción.
 * Descripción: Esta función da la opción de abrir el detalle de la transacción recién registrada y actualiza la tabla de transacciones en la vista principal.
 * Fecha: 26 de junio de 2024
 * Autor: Joel Choque
 */
function procesoRegistro (datosTransaccion) {
    const {
        vistaPrincipal,
        urlTransaccion,
        cargarContenidoTabla,
        vistaDetalleTransaccion,
        permisos
    } = datosTransaccion;

    return async (respuesta, { cerrarModal } ) => {
        const abrirDetalleTransaccion = async () => {
            // Preparar los datos de la transacción en base a la respuesta recibida del registro.
            const registro = {
                id: respuesta[3],
                ntransaccion: respuesta[4],
                fecha: respuesta[5],
                glosa: respuesta[6],
                consolidar: respuesta[7],
                ttransaccion: respuesta[8],
                idtipotransaccion: respuesta[9],
                gestion: respuesta[10],
                estado: "1", // Al registrar una transacción, su estado inicial es "Activo"
                tipocambio: respuesta[12],
            };
            // Buscar el elemento en la tabla que coincide con el número de transacción registrado.
            const celdas = vistaPrincipal.querySelectorAll("table td");
            let elemento = null;
            for (let i = 0; i < celdas.length && i < 60; i++) {
                if (celdas[i].textContent.trim() === respuesta[4].toString()) {
                    elemento = celdas[i];
                    break;
                }
            }
            // Abrir el detalle de la transacción
            cerrarModal();
            await DetalleTransaccion({ vistaTransaccion: vistaPrincipal, vistaDetalle: vistaDetalleTransaccion, permisos, registroTransaccion: registro, elementoTd: elemento });
        }

        // Crear un modal de confirmación para abrir el detalle de la transacción.
        const modal = modalDeConfirmacion(abrirDetalleTransaccion, "¿Continuar con Asiento Contable?", undefined, "Continuar", "Cancelar");
        const botonContinuar = modal.querySelector("button[data-id='__btn-confirmar']");
        const botonCancelar = modal.querySelector("button[data-id='__btn-cancelar']");
        botonContinuar.disabled = true;
        botonCancelar.disabled = true;
        vistaPrincipal.appendChild(modal);

        // Actualizar la tabla de transacciones en la vista principal.
        const listaDeRegistros = await obtenerDatos(urlTransaccion);
        cargarContenidoTabla(listaDeRegistros);

        botonCancelar.disabled = false;
        botonContinuar.disabled = false;
        botonContinuar.focus();
    }
}