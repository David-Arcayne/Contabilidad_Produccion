import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { campoInput, campoInputGroup, campoSelectGroup, manejarSelect } from "../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTablaSpinner, crearFilaTotalTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getDivisaNombre, getEmpresaId, getSucursalId, getUsuarioId } from "../../funciones/DatosAuxiliares.js";
import { botonEnCarga, botonMostrarAdjunto, cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, formatoDecimal, formatoFecha, manejarEliminarArchivoDesdeFormulario, obtenerFecha, obtenerFechaActual, rellenarFacturaPagoDelQR, rellenarFacturaVentaDelQR, resaltarTexto, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { modalRemovible, modalValidarFechaSegunGestion } from "../../funciones/Modals.js";
import { botonModalEditar, formularioRegistrar } from "../../funciones/OpcionesBasicas.js";
import { botonAbrirScanner } from "../../funciones/Scanner.js";
import { manejarEnvioFormulario, obtenerDatos } from "../../funciones/Solicitudes.js";
import { crearBotonIconoPdfMake, defDocumentoPdfMake } from "../../funciones/VistaPDF.js";
import { formularioCBDdCEditar, formularioCBDdPEditar, formularioCBDocumentoDeCobro, formularioCBDocumentoDePago, formularioCBFxCConFactura, formularioCBFxCEditarConFactura, formularioCBFxCEditarFactura, formularioCBFxCNuevaFactura, formularioCBFxPConFactura, formularioCBFxPEditarConFactura, formularioCBFxPEditarFactura, formularioCBFxPNuevaFactura } from "./Formularios.js";
import { pdfMakeComprobanteGeneral, pdfMakeReporteEfectivo, xlsxReporteEfectivo } from "./Funcionalidades/VP_Comprobante.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de Cajas y Bancos (Efectivo)
 *              Permite registrar y manejar distintos tipos de movimientos de efectivo (ingresos y egresos).
 *              Además, permite filtrar los registros por cuenta, fecha y tipo de comprobante, así como generar reportes en PDF de los movimientos registrados.
 * Fecha: 26 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaCajaYBancos - Contenedor principal donde se renderiza la vista de Cajas y Bancos.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export async function CajaYBancos(permisos, vistaCajaYBancos, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const URL = CT_URLAPI;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();
    const controladorFiltro = crearGestorFiltro(`${URL}/listar_recibo_por_caja_bancos`);

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaRegistroFormulario = crearElemento("div", { class: "d-none", "data-pane-id": "registro-formulario" });
    vistaCajaYBancos.append(vistaPrincipal, vistaRegistroFormulario);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Administración de Efectivo", textoInformacion: `(Expresado en ${getDivisaNombre()})`});
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.append(encabezadoVista, contenedorDeAlertas);

    const encabezadoTabla = [
        "N°",
        "Fecha",
        "N° Comp.",
        "N° Trans.",
        "N° Doc.",
        "Prov/Cliente",
        "Concepto",
        "Ingreso",
        "Egreso",
        "Saldo",
        "Tipo",
        "Estado",
        "Opciones",
    ];
    const estiloTd = [
        "contador",
        "date",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "decimal",
        "decimal",
        "decimal",
        // "text-start",
        "text-start",
        "text-start",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

    const divFiltros = crearFiltrosTabla({
        botonesReportesPersonalizados: [
            crearBotonReporteEfectivoPdfMake({
                contenedorModal: vistaPrincipal,
                obtenerContenido: pdfMakeReporteEfectivo(controladorTabla.getDatosOriginales, controladorFiltro.getValoresDeFiltro),
            }),
            crearBotonReporteEfectivoXlsx({
                contenedorModal: vistaPrincipal,
                obtenerContenido: xlsxReporteEfectivo(controladorTabla.getDatosOriginales, controladorFiltro.getValoresDeFiltro),
            }),
        ],
        controladorTabla,
        filtroFecha: false,
    });
    const divFormularioFiltro = await filtroCajaBancos({
        tbody,
        controladorFiltro,
        cargarContenidoTabla,
        mostrarRegistro: cambiarVisibilidadRegistro,
    });

    // Select para elegir entre factura o recibo para realizar un nuevo registro
    const [selectRegistroFactura, divRegistroFactura] = campoSelectGroup(
        { atributos: { id: "tsra-efectivo-factura", name: "facturas" } },
        { contenido: "Registro Factura" },
    );
    const [selectRegistroRecibo, divRegistroRecibo] = campoSelectGroup(
        { atributos: { id: "tsra-efectivo-recibo", name: "recibos" } },
        { contenido: "Registro Recibo" },
    );
    selectRegistroFactura.innerHTML = `
        <option value="">- Elija una opción -</option>
        <option value="1">Cobro/Venta</option>
        <option value="2">Pago/Compra</option>
        <option value="3">Cobro de Cuentas</option>
        <option value="4">Pago de Cuentas</option>`;
    selectRegistroRecibo.innerHTML = `
        <option value="">- Elija una opción -</option>
        <option value="5">Cobro/Venta</option>
        <option value="6">Pago/Compra</option>`;
    const divTipoForm = crearElemento("div", { class: "row g-1 mb-2 d-none"}, [divRegistroFactura, divRegistroRecibo]);
    function cambiarVisibilidadRegistro(visible = true) {
        if (visible) {
            divTipoForm.classList.remove("d-none");
        } else {
            divTipoForm.classList.add("d-none");
        }
        ajustarAlturaTabla(divTabla);
    }

    if (PUEDE_ESCRIBIR) {
        vistaPrincipal.append(divFormularioFiltro, divFiltros, divTipoForm, divTabla);
    } else {
        vistaPrincipal.append(divFormularioFiltro, divFiltros, divTabla);
    }

    const fnAbrirRegistro = (e) => {
        cambiarVista(vistaPrincipal, vistaRegistroFormulario);
        const valorSelect = e.target.value;
        e.target.value = ""
        manejarRegistros({
            vistaPrincipal,
            tipoRegistro: valorSelect,
            responsable: controladorFiltro.getResponsable(),
            urlSolicitud: controladorFiltro.getRuta(),
            idCajaBanco: controladorFiltro.getValoresDeFiltro().idCajaBanco,
            contenedorDeAlertas,
            vistaRegistroFormulario,
            cargarContenidoTabla,
        });
    }
    selectRegistroFactura.addEventListener("change", fnAbrirRegistro);
    selectRegistroRecibo.addEventListener("change", fnAbrirRegistro);

    // Inicialización del controlador de la tabla para gestionar los datos y filtros
    controladorTabla.suscribir("tabla", async (lista) => {
        const validado = validarListadoTabla(lista);
        if ( !validado.valido ) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        const esResponsable = controladorFiltro.getResponsable().funcion === "responsable";

        let totalIngreso = 0;
        let totalEgreso = 0;
        for (const item of lista) {
            const registro = item.raw;
            if (registro.estado_documento !== "anulado") {
                totalIngreso += Math.round(parseFloat(registro.ingreso || 0) * 100);
                totalEgreso += Math.round(parseFloat(registro.egreso || 0) * 100);
            }

            const celdas = [
                crearElemento("td", { class: "text-center" }, [registro.contador]),
                crearElemento("td", { class: "text-end" }, [item.fechaTexto]),
                crearElemento("td", undefined, [registro.nrecibo || "-"]),
                crearElemento("td", undefined, [registro.codigotransaccion || "-"]),
                crearElemento("td", undefined, [registro.nro_documento || "-"]),
                crearElemento("td", undefined, [registro.nombre_cliente || "-"]),
                crearElemento("td", undefined, [registro.descripcion || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.ingreso)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.egreso)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.saldo)]),
                crearElemento("td", undefined, [registro.factura_recibo || "-"]),
                crearElemento("td", undefined, [obtenerEstado(registro.estado_documento)]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });

            // Opciones para ver comprobante y adjunto
            const botonAdjunto = botonMostrarAdjunto(vistaPrincipal, registro.archivo, { color: "info" });
            if (botonAdjunto) {
                tdOpciones.append(botonAdjunto, " ");
            }
            const botonComprobante = botonVerComprobante(registro, vistaPrincipal);
            tdOpciones.append(botonComprobante, " ");

            if (esResponsable) {
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar = crearBotonEditarCB({
                        obtenerUrl: controladorFiltro.getRuta(),
                        contenedorModal: vistaPrincipal,
                        contenedorDeAlertas,
                        cargarContenidoTabla,
                        registro,
                    })
                    botonEditar ? tdOpciones.append(botonEditar, " ") : null;

                }

                // Crear botón de opciones para poder anular, activarr o eliminar.
                const botonDropdown = crearBotonDropdown({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    urlSolicitud: controladorFiltro.getRuta(),
                    cargarContenidoTabla,
                    registro,
                });
                if (botonDropdown) {
                    tdOpciones.append(botonDropdown);
                }
            }


            celdas.push(tdOpciones);


            const fila = crearElemento("tr", undefined, celdas);
            fragment.appendChild(fila);
        }

        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 7,
            columnasFinal: 4,
            valores: [totalIngreso / 100, totalEgreso / 100]
        });
        fragment.appendChild(filaTotal);

        tbody.replaceChildren(fragment);
    });

    // Función para cargar el contenido de la tabla con los registros obtenidos
    function cargarContenidoTabla(listaRegistros) {
        if (!Array.isArray(listaRegistros)) {
            controladorTabla.setDatosRegistro(null);
            return;
        }

        const normalizados = listaRegistros
            .map((registro, index) => {
                let registroConNumeracion = { ...registro, contador: index + 1 };
                return {
                    raw: registroConNumeracion,
                    fechaTexto: formatoFecha(registro.fecha) || "-",
                    textoBusqueda: [
                        registro.nrecibo,
                        registro.codigotransaccion,
                        registro.nro_documento,
                        registro.nombre_cliente,
                        registro.descripcion,
                        formatoDecimal(registro.ingreso),
                        formatoDecimal(registro.egreso),
                        formatoDecimal(registro.saldo),
                        registro.factura_recibo,
                        registro.estado_documento,
                    ].join("|").toLowerCase()
                };
            });
        controladorTabla.setDatosRegistro(normalizados);
    }

    // Cargar los datos iniciales para mostrar en la tabla segun la primera opción de una Caja o Banco
    const selectCB = divFormularioFiltro.querySelector("#tsra-efectivo-cajabanco");
    const selectizeCB = selectCB.selectize;
    if (selectizeCB?.options && Object.keys(selectizeCB.options).length > 0) {
        for (const key in selectizeCB.options) {
            if (selectizeCB.options[key]?.$order === 2) {
                selectizeCB.setValue(key);
                break;;
            }
        }
    }

    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            popover: {
                title: "Tesorería",
                description: "Permite el registro de los ingresos o egresos de efectivo que la Empresa tiene en o desde una Caja o Banco, según los permisos asignados al usuario desde: Configuración/Vinculación Cuentas/Cuentas de Disponible. Así mismo podra generar reportes de los registros ya existentes.",
            },
        },
        {
            element: divFormularioFiltro,
            popover: {
                title: "Filtros de búsqueda",
                description: "Formulario para filtrar los registros de Cajas o Bancos; Permite buscar por fecha, tipo de Transacción y tipo de uso de fondos (Ingreso/Egreso).",
            },
        },
        {
            mainElement: divFiltros,
            element: "#__reporte",
            popover: {
                title: "Reporte",
                description: "Genera un reporte de los registros filtrados. (El reporte se genera considerando los filtros aplicados en el formulario, con lugar y fecha completados. Solo se habilita si se realiza el filtro).",
            },
        },
        {
            mainElement: divFiltros,
            element: "#__buscador",
            popover: {
                title: "Buscar Cajas/Bancos",
                description: "Permite buscar registros de Cajas y Bancos considerando todas las columnas de la tabla.",
            },
        },
        {

            mainElement: divTipoForm,
            element: "[data-id='div-tsra-efectivo-factura']",
            popover: {
                title: "Registro Factura",
                description: `Permite seleccionar el tipo de registro que se desea crear (Facturas Cobro/Pago).
                <ul>
                    <li>
                        Facturas de Cobro o Pago: Le permite cargar la factura de forma manual o por medio de scanner de QR
                        <ul>
                            <li>Leer QR: Escanea el QR de factura por medio de la cámara de su equipo y recupera datos de la factura.</li>
                            <li>Más datos…: Le muestra los demás campos para la factura, en caso de requerir.</li>
                            <li>Adjuntar Archivo: Puede adjuntar un archivo o foto en formato PDF o JPG desde su equipo.</li>
                        </ul>
                    </li>
                </ul>`,
            },
        },
        {
            mainElement: divTipoForm,
            element: "[data-id='div-tsra-efectivo-factura']",
            popover: {
                description: `
                <ul>
                    <li> También permite seleccionar el tipo de registro Cobro o Pago de Cuentas, los cuales permiten realizar el cobro o pago de una factura ya existente.</li>
                </ul> `,
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='div-tsra-efectivo-recibo']",
            popover: {
                title: "Registro Recibo",
                description: `Permite seleccionar el tipo de registro que se desea crear (Recibo de Cobro/Pago).
                <ul>
                    <li> Recibo de Cobro o Pago: Le permite cargar el recibo de forma manual el cual pertenecerá a un contrato existente, donde puede adjuntar un archivo o foto en formato PDF o JPG desde su equipo.</li>
                </ul>`,
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Tabla Cajas y Bancos",
                description: "Muestra todos los registros de Cajas y Bancos en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Imagen']",
            popover: {
                title: "Imagen adjunta",
                description: "Permite ver la imagen adjunta al registro. (Si no hay imagen, no se muestra el botón).",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Comprobante']",
            popover: {
                title: "Comprobante",
                description: "Permite ver el comprobante de ingreso o egreso del registro.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar Caja/Banco",
                description: "Abre el formulario para editar el registro seleccionado. (Disponible solo para registros realizados desde esta ventana de Cajas y Bancos).",
            },
        },
        // {
        //     mainElement: tabla,
        //     element: "button[data-id='btn-dropdown']",
        //     popover: {
        //         title: "Mostrar más opciones",
        //         description: `Muestra un menú desplegable con más opciones para el documento. (Disponible solo para registros realizados desde esta ventana "Efectivo").
        //         <ul>
        //             <li>Anular: Cambia el estado del registro a anulado, pero se mantiene el registro para fines históricos.</li>
        //             <li>Activar: Cambia el estado del registro a activo, lo que indica que el documento es válido.</li>
        //             <li>Eliminar: Elimina completamente el registro del sistema.</li>
        //         </ul>`,
        //     },
        // }
        {
            mainElement: tabla,
            element: "button[data-id='btn-dropdown']",
            popover: {
                title: "Mostrar más opciones",
                description: `Muestra un menú desplegable con más opciones para el documento. (Disponible solo para registros realizados desde esta ventana "Efectivo").
                <ul>
                    <li>Anular: Cambia el estado del registro a anulado, pero se mantiene el registro para fines históricos.</li>
                </ul>`,
            },
        }
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
}

// =========================================================
// FUNCIONES DE OPCIONES Y FILTROS DE LA VISTA
// =========================================================

/**
 * Función: Crea y gestiona el formulario de filtros para Cajas y Bancos.
 * Descripción: La función genera un formulario con campos que al cambiar cualquier valor, se actualizan los registros mostrados en la tabla según los criterios seleccionados.
 *              Obtiene las cuentas de Caja y Banco disponibles para el usuario y gestiona los permisos para mostrar u ocultar opciones de registro.
 * Fecha: 23 de febrero de 2026
 * Autor: Joel Choque
 */
const filtroCajaBancos = async (datos) => {
    const {
        tbody,
        controladorFiltro,
        cargarContenidoTabla,
        mostrarRegistro,
    } = datos;
    const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["Seleccione una cuenta de Caja y Bancos"]);
    const tr = crearElemento("tr", undefined, [td]);
    tbody.replaceChildren(tr);

    const URL = CT_URLAPI;
    const USUARIO_ID = getUsuarioId();
    const EMPRESA_ID = getEmpresaId();

    const [selectCajaBanco, divCajaBanco] = campoSelectGroup(
        { atributos: { id: "tsra-efectivo-cajabanco", name: "caja_banco", required: true, style: "width: 300px" } },
        { contenido: "Caja o Banco" },
    );
    const [fechaInicio, divFechaInicio] = campoInputGroup(
        { atributos: { type: "date", id: "tsra-efectivo-fechainicio", name: "fecha_inicio", value: obtenerFecha("fecha", { dia: 1 }), required: true } },
        { contenido: "Fecha Inicio" }
    );
    const [fechaFin, divFechaFin] = campoInputGroup(
        { atributos: { type: "date", id: "tsra-efectivo-fechafin", name: "fecha_fin", value: obtenerFechaActual(), required: true } },
        { contenido: "Fecha Fin" }
    );
    const [selectComprobante, divComprobante] = campoSelectGroup(
        { atributos: { id: "tsra-efectivo-comprobante", name: "tipo_filtro", required: true } },
        { contenido: "Comprobante" }
    );
    selectComprobante.innerHTML = `
        <option value="3">Todos</option>
        <option value="1">Ingreso</option>
        <option value="2">Egreso</option>
    `;

    const formularioFiltro = crearElemento(
        "form",
        { class: "row justify-content-start g-2" },
        [divCajaBanco, divFechaInicio, divFechaFin, divComprobante]
    );

    const div = crearElemento("div", undefined, [formularioFiltro]);

    const listaCajaBanco = await obtenerDatos(`${URL}listar_caja_bancos_por_usuario/${EMPRESA_ID}/${USUARIO_ID}`);
    const enviarFormulario = () => {
        formularioFiltro.requestSubmit();
    };
    if (listaCajaBanco) {
        await manejarSelect( selectCajaBanco, {
            datosRegistro:listaCajaBanco,
            llavesOpciones: { valor: "idcaja_bancos", detalle: ["codigo", "tipo_cuenta"]},
            opcionesExtraInicio: [ { value: "todos", text: "Todos" } ],
            callbackInput: enviarFormulario,
        });
    }

    fechaInicio.addEventListener("change", (e) => {
        if (e.target.value)  enviarFormulario();
    });
    fechaFin.addEventListener("change", (e) => {
        if (e.target.value) enviarFormulario();
    });
    selectComprobante.addEventListener("change", (e) => {
        enviarFormulario();
    });

    formularioFiltro.addEventListener("submit", async (e) => {
        e.preventDefault();
        const spinnerTabla = crearFilaTablaSpinner();
        tbody.replaceChildren(spinnerTabla);

        const idsCajaBancoPorUsuario = listaCajaBanco.map((cb) => cb.idcaja_bancos);

        const valorCajaBanco = selectCajaBanco.value;
        const valorFechaInicio = fechaInicio.value;
        const valorFechaFin = fechaFin.value;
        const valorTipoComprobante = selectComprobante.value;
        const idCajaBancoEnUso = valorCajaBanco === "todos" ? idsCajaBancoPorUsuario : valorCajaBanco;

        controladorFiltro.setValoresFiltro({
            idCajaBanco: idCajaBancoEnUso,
            fechaInicio: valorFechaInicio,
            fechaFin: valorFechaFin,
            tipoComprobante: valorTipoComprobante,

            nombreCajaBanco: null,
            codigoCajaBanco: null,
        });

        controladorFiltro.setResponsable({
            funcion: null,
            idusuario: null,
            permiso_registrar: null,
        });

        const urlListarCajaBanco = controladorFiltro.getRuta();
        if(valorCajaBanco === "todos"){
            mostrarRegistro(false);
            const registros = await obtenerDatos(urlListarCajaBanco);
            cargarContenidoTabla(registros);
        } else if(valorCajaBanco) {
            const usuarioCB = await obtenerDatos(`${URL}usuario_con_permiso_registrar_transaccion/${valorCajaBanco}/${USUARIO_ID}`);
            const { funcion, idusuario, permiso_registrar } = usuarioCB?.[0] || {};

            if (idusuario) {
                mostrarRegistro(funcion === "responsable");

                controladorFiltro.setResponsable({
                    funcion,
                    idusuario,
                    permiso_registrar,
                });

                const datosCajaBanco = listaCajaBanco.find(cb => cb.idcaja_bancos === valorCajaBanco);
                controladorFiltro.setValoresFiltro({
                    nombreCajaBanco: datosCajaBanco?.tipo_cuenta || null,
                    codigoCajaBanco: datosCajaBanco?.codigo || null,
                });

                const registros = await obtenerDatos(urlListarCajaBanco);
                cargarContenidoTabla(registros);
            } else {
                mostrarRegistro(false);
                cargarContenidoTabla([]);
            }
        } else {
            mostrarRegistro(false);
            const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["Seleccione una cuenta de Caja/Bancos"]);
            const tr = crearElemento("tr", undefined, [td]);
            tbody.replaceChildren(tr);
        }
    });

    return div;
}

/**
 * Función: Crea un botón para generar un reporte en PDF de los movimientos de efectivo.
 * Descripción: Genera un botón que abre un modal para ingresar información adicional (lugar, fecha y numeración de página).
 *              Se genera un reporte en PDF utilizando pdfMake con los datos filtrados actualmente en la tabla.
 * Fecha: 24 de febrero de 2026
 * Autor: Joel Choque
 */
function crearBotonReporteEfectivoPdfMake(opciones) {
    const {
        contenedorModal,
        obtenerContenido,
    } = opciones;

    const icono = crearElemento("i", { class: "bi bi-file-earmark-pdf pe-1" });
    const boton = crearElemento("button", { class: "btn btn-primary btn-sm h-100", id: "__reporte" }, [icono, "Reporte"]);

    boton.addEventListener("click", async () => {
        const fragment = document.createDocumentFragment();
        const span = crearElemento("i", undefined, ["(Solo si desea generar con numeración de página)"]);
        fragment.append("Página de Inicio ", span, ": ");

        const divInfo = crearElemento("div");

        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Cargar Documento", estiloModal: "width: 400px;"});
        const [inputLugar, divLugar] = campoInput(
            { atributos: { type: "text", id: "pdfMake-lugar", nombre: "lugar", required: true } },
            { contenido: "Lugar" },
        );
        const [inputFecha, divFecha] = campoInput(
            { atributos: { type: "date", id: "pdfMake-fecha", nombre: "fecha", value: obtenerFecha(), required: true } },
            { contenido: "Fecha" },
            { atributos: { class: "mt-1" } }
        );
        const hr = crearElemento("hr", { class: "my-3 border-success" });
        const [inputNumeracion, divNumeracion] = campoInput(
            { atributos: { type: "number", id: "pdfMake-numeracion", nombre: "numeracion", min: "0", placeholder: "Sín Numeración" } },
            { contenido: fragment },
        );
        const botonContinuar = crearElemento("button", { class: "btn btn-primary", type: "submit", style: "min-width: 90px;" }, ["Continuar"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-outline-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 90px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-3" }, [botonContinuar, botonCancelar]);

        const formulario = crearElemento("form", undefined, [divInfo, divLugar, divFecha, hr, divNumeracion, divBotones]);
        cuerpoModal.append(formulario);

        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();
            divInfo.innerHTML = "";
            const fnBotonInicial = botonEnCarga(botonContinuar);
            try {
                const numeracion = inputNumeracion.value;
                await defDocumentoPdfMake({
                    numeroPieDePagina: numeracion,
                    contenido: await obtenerContenido({lugar: inputLugar.value, fecha: inputFecha.value}),
                });
                cerrarModal();
            } catch (error) {
                fnBotonInicial();
                divInfo.innerHTML = `<div class="text-danger mb-3"> <i class="bi bi-exclamation-triangle-fill pe-1"></i> Ocurrio un error al generar el PDF</div>`;
            }
        });

        contenedorModal.appendChild(modal);
        botonContinuar.focus();
    });

    return boton;
}
/**
 * Función: Crea un botón para generar un reporte en Excel de los movimientos de efectivo.
 * Descripción: Genera un botón que abre un modal para ingresar información adicional (lugar, fecha).
 *              Se genera un reporte en Excel utilizando los datos filtrados actualmente en la tabla.
 * Fecha: 07 de marzo de 2026
 * Autor: Joel Choque
 */
function crearBotonReporteEfectivoXlsx(opciones) {
    const {
        contenedorModal,
        obtenerContenido,
    } = opciones;

    const icono = crearElemento("i", { class: "bi bi-file-earmark-spreadsheet pe-1" });
    const boton = crearElemento("button", { class: "btn btn-success btn-sm h-100", id: "__reporte" }, [icono, "Reporte"]);

    boton.addEventListener("click", async () => {
        const divInfo = crearElemento("div");

        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Cargar Documento", estiloModal: "width: 400px;"});
        const [inputLugar, divLugar] = campoInput(
            { atributos: { type: "text", id: "pdfMake-lugar", nombre: "lugar", required: true } },
            { contenido: "Lugar" },
        );
        const [inputFecha, divFecha] = campoInput(
            { atributos: { type: "date", id: "pdfMake-fecha", nombre: "fecha", value: obtenerFecha(), required: true } },
            { contenido: "Fecha" },
            { atributos: { class: "mt-1" } }
        );
        const botonContinuar = crearElemento("button", { class: "btn btn-primary", type: "submit", style: "min-width: 90px;" }, ["Continuar"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-outline-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 90px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-3" }, [botonContinuar, botonCancelar]);

        const formulario = crearElemento("form", undefined, [divInfo, divLugar, divFecha, divBotones]);
        cuerpoModal.append(formulario);

        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();
            divInfo.innerHTML = "";
            const fnBotonInicial = botonEnCarga(botonContinuar);
            try {
                await obtenerContenido({lugar: inputLugar.value, fecha: inputFecha.value}),
                cerrarModal();
            } catch (error) {
                fnBotonInicial();
                divInfo.innerHTML = `<div class="text-danger mb-3"> <i class="bi bi-exclamation-triangle-fill pe-1"></i> Ocurrio un error al generar el reporte</div>`;
            }
        });

        contenedorModal.appendChild(modal);
        botonContinuar.focus();
    });

    return boton;
}

/**
 * Función: Maneja el registro de nuevos movimientos de efectivo (ingresos o egresos) para Cajas y Bancos.
 * Descripción: Según el tipo de registro seleccionado, se genera un formulario específico para ingresar los datos correspondientes.
 *              El formulario de cobro/pago de contratos con factura permite cargar los datos por medio de un scanner de QR.
 * Fecha: 26 de febrero de 2026
 * Autor: Joel Choque
 */
function manejarRegistros(datosVista) {
    const {
        vistaPrincipal,
        responsable,
        tipoRegistro,
        vistaRegistroFormulario,
        cargarContenidoTabla,
        urlSolicitud,
        contenedorDeAlertas,
        idCajaBanco,
    } = datosVista;

    vistaRegistroFormulario.innerHTML = "";

    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const permisoTransaccion = responsable?.permiso_registrar === "si";

    const callbacksComunes = {
        alCancelar: () => {
            cambiarVista(vistaRegistroFormulario, vistaPrincipal);
        },
        alRegistrar: () => {
            cambiarVista(vistaRegistroFormulario, vistaPrincipal);
        },
        enError: () => {
            cambiarVista(vistaRegistroFormulario, vistaPrincipal);
            alertaDeError(contenedorDeAlertas, "Error al realizar el registro");
        }
    }

    if (tipoRegistro === "1") {
        const divFormulario = formularioRegistrar({
            contenedorDeAlertas: contenedorDeAlertas,
            URL_FORM: CT_URLAPI,
            URL_LISTAR: urlSolicitud,
            camposDeFormulario: formularioCBFxCNuevaFactura(permisoTransaccion),
            cargarContenidoTabla,
            camposAdicionales: {
                ver: "registrar_factura_recibo_cobro_cajaBancos",
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,
                usuario: USUARIO_ID,
                idcaja_bancos: idCajaBanco,
                cobrado: "2",
                pagado: "0",
                codigocontrol: "0",
                clasefactura: "2",
                especificacion: "2",
                registro_desde: "caja_bancos",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            configuraciones: {
                centrarFormulario: false,
            },
            camposCondicionales: [
                { nombre: "asiento", valor: "" },
                { nombre: "trans", valor: "" },
                { nombre: "tipo", valor: "" },
                { nombre: "cuenta", valor: "" },
                { nombre: "fecha_transaccion", valor: "" },
            ],
            callbacks: {
                ...callbacksComunes,
                previaSolicitud: validarFechaTransaccion("tecobrocontratofactura", vistaRegistroFormulario),
            },
            mostrarErrorEnModal: {
                contenedorModal: vistaRegistroFormulario
            },
        });

         // Implementación de la opción para realizar Scanner
        const botonScanner = botonAbrirScanner({
            contenedor: vistaRegistroFormulario,
            idLector: "qr-tesoreria-factura-cobro",
            callback: rellenarFacturaVentaDelQR({
                vistaPrincipal: vistaRegistroFormulario,
                contenidoFormulario: divFormulario,
                prefijoId: "tecobrocontratofactura",
            }),
        });

        const divScanner = crearElemento("div", {class: "text-end my-2"}, [botonScanner]);
        const titulo = crearElemento("h5", {class: "text-center mb-4 fw-bold"}, ["Registrar Factura de Cobro"]);
        vistaRegistroFormulario.append(divScanner, titulo, divFormulario);

    } else if (tipoRegistro === "2") {
        const divFormulario = formularioRegistrar({
            contenedorDeAlertas: contenedorDeAlertas,
            URL_FORM: CT_URLAPI,
            URL_LISTAR: urlSolicitud,
            camposDeFormulario: formularioCBFxPNuevaFactura(permisoTransaccion),
            cargarContenidoTabla,
            camposAdicionales: {
                ver: "registrar_factura_recibo_pago_cajaBancos",
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,
                usuario: USUARIO_ID,
                idcaja_bancos: idCajaBanco,
                cobrado: "0",
                pagado: "2",
                codigocontrol: "0",
                clasefactura: "1",
                especificacion: "1",
                registro_desde: "caja_bancos",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            configuraciones: {
                centrarFormulario: false,
            },
            camposCondicionales: [
                { nombre: "asiento", valor: "" },
                { nombre: "trans", valor: "" },
                { nombre: "tipo", valor: "" },
                { nombre: "cuenta", valor: "" },
                { nombre: "fecha_transaccion", valor: "" },
            ],
            callbacks: {
                ...callbacksComunes,
                previaSolicitud: validarFechaTransaccion("tepagocontratofactura", vistaRegistroFormulario),
            },
            mostrarErrorEnModal: {
                contenedorModal: vistaRegistroFormulario
            },
        });

         // Implementación de la opción para realizar Scanner
        const botonScanner = botonAbrirScanner({
            contenedor: vistaRegistroFormulario,
            idLector: "qr-tesoreria-factura-pago",
            callback: rellenarFacturaPagoDelQR({
                vistaPrincipal: vistaRegistroFormulario,
                contenidoFormulario: divFormulario,
                prefijoId: "tepagocontratofactura",
            }),
        });

        const divScanner = crearElemento("div", {class: "text-end my-2"}, [botonScanner]);
        const titulo = crearElemento("h5", {class: "text-center mb-4 fw-bold"}, ["Registrar Factura de Pago"]);
        vistaRegistroFormulario.append(divScanner, titulo, divFormulario);

    } else if (tipoRegistro === "3") {
        const divFormulario = formularioRegistrar({
            contenedorDeAlertas: contenedorDeAlertas,
            URL_FORM: CT_URLAPI,
            URL_LISTAR: urlSolicitud,
            camposDeFormulario: formularioCBFxCConFactura(permisoTransaccion),
            cargarContenidoTabla,
            camposAdicionales: {
                ver: "registrar_recibo_cobro_cajaBancos_en_facturas",
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,
                usuario: USUARIO_ID,
                idcaja_bancos: idCajaBanco,
                registro_desde: "caja_bancos_factura",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            configuraciones: {
                centrarFormulario: false,
            },
            camposCondicionales: [
                { nombre: "asiento", valor: "" },
                { nombre: "trans", valor: "" },
                { nombre: "tipo", valor: "" },
                { nombre: "cuenta", valor: "" },
                { nombre: "fecha_transaccion", valor: "" },
            ],
            callbacks: {
                ...callbacksComunes,
                previaSolicitud: validarFechaTransaccion("tecobrofactura", vistaRegistroFormulario),
            },
            mostrarErrorEnModal: {
                contenedorModal: vistaRegistroFormulario
            },
        });

        const titulo = crearElemento("h5", {class: "text-center mb-4 mt-3 fw-bold"}, ["Cobro de Cuentas"]);
        vistaRegistroFormulario.append(titulo, divFormulario);

    } else if (tipoRegistro === "4") {
        const divFormulario = formularioRegistrar({
            contenedorDeAlertas: contenedorDeAlertas,
            URL_FORM: CT_URLAPI,
            URL_LISTAR: urlSolicitud,
            camposDeFormulario: formularioCBFxPConFactura(permisoTransaccion),
            cargarContenidoTabla,
            camposAdicionales: {
                ver: "registrar_recibo_pago_cajaBancos_en_facturas",
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,
                usuario: USUARIO_ID,
                idcaja_bancos: idCajaBanco,
                registro_desde: "caja_bancos_factura",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            configuraciones: {
                centrarFormulario: false,
            },
            camposCondicionales: [
                { nombre: "asiento", valor: "" },
                { nombre: "trans", valor: "" },
                { nombre: "tipo", valor: "" },
                { nombre: "cuenta", valor: "" },
                { nombre: "fecha_transaccion", valor: "" },
            ],
            callbacks: {
                ...callbacksComunes,
                previaSolicitud: validarFechaTransaccion("tepagofactura", vistaRegistroFormulario),
            },
            mostrarErrorEnModal: {
                contenedorModal: vistaRegistroFormulario
            },
        });

        const titulo = crearElemento("h5", {class: "text-center mb-4 mt-3 fw-bold"}, ["Pago de Cuentas"]);
        vistaRegistroFormulario.append(titulo, divFormulario);

    } else if (tipoRegistro === "5") {
        const divFormulario = formularioRegistrar({
            contenedorDeAlertas: contenedorDeAlertas,
            URL_FORM: CT_URLAPI,
            URL_LISTAR: urlSolicitud,
            camposDeFormulario: formularioCBDocumentoDeCobro(permisoTransaccion),
            cargarContenidoTabla,
            camposAdicionales: {
                ver: "registrar_recibo_cobro_cajaBancos_en_otras_cuentas",
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,
                usuario: USUARIO_ID,
                idcaja_bancos: idCajaBanco,
                registro_desde: "caja_bancos",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            configuraciones: {
                centrarFormulario: false,
            },
            camposCondicionales: [
                { nombre: "asiento", valor: "" },
                { nombre: "trans", valor: "" },
                { nombre: "tipo", valor: "" },
                { nombre: "cuenta", valor: "" },
                { nombre: "fecha_transaccion", valor: "" },
            ],
            callbacks: {
                ...callbacksComunes,
                previaSolicitud: validarFechaTransaccion("tecobrorecibo", vistaRegistroFormulario),
            },
            mostrarErrorEnModal: {
                contenedorModal: vistaRegistroFormulario
            },
        });

        const titulo = crearElemento("h5", {class: "text-center mb-4 mt-3 fw-bold"}, ["Recibo de Cobro"]);
        vistaRegistroFormulario.append(titulo, divFormulario);

    } else if (tipoRegistro === "6") {
        const divFormulario = formularioRegistrar({
            contenedorDeAlertas: contenedorDeAlertas,
            URL_FORM: CT_URLAPI,
            URL_LISTAR: urlSolicitud,
            camposDeFormulario: formularioCBDocumentoDePago(permisoTransaccion),
            cargarContenidoTabla,
            camposAdicionales: {
                ver: "registrar_recibo_pago_cajaBancos_en_otras_cuentas",
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,
                usuario: USUARIO_ID,
                idcaja_bancos: idCajaBanco,
                registro_desde: "caja_bancos",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            configuraciones: {
                centrarFormulario: false,
            },
            camposCondicionales: [
                { nombre: "asiento", valor: "" },
                { nombre: "trans", valor: "" },
                { nombre: "tipo", valor: "" },
                { nombre: "cuenta", valor: "" },
                { nombre: "fecha_transaccion", valor: "" },
            ],
            callbacks: {
                ...callbacksComunes,
                previaSolicitud: validarFechaTransaccion("tepagorecibo", vistaRegistroFormulario),
            },
            mostrarErrorEnModal: {
                contenedorModal: vistaRegistroFormulario
            },
        });

        const titulo = crearElemento("h5", {class: "text-center mb-4 mt-3 fw-bold"}, ["Recibo de Pago"]);
        vistaRegistroFormulario.append(titulo, divFormulario);

    }
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea un botón para ver el comprobante.
 * Descripción: Genera un botón que al ser presionado muestra una vista previa del comprobante asociado al registro proporcionado.
 * Fecha: 23 de febrero de 2026
 * Autor: Joel Choque
 */
function botonVerComprobante (registro, contenedorModal) {
    const URL = CT_URLAPI;
    if (registro.tipo_documento === 1) {
        return crearBotonIconoPdfMake({
            contenedorModal,
            obtenerContenido: pdfMakeComprobanteGeneral(`${URL}listar_comprobantes_de_factura_cobro/${registro.idcomprobante}`, "factura", "cobro", registro),
            tituloBoton: "Comprobante",
        });
    } else if (registro.tipo_documento === 2) {
        return crearBotonIconoPdfMake({
            contenedorModal,
            obtenerContenido: pdfMakeComprobanteGeneral(`${URL}listar_comprobantes_de_factura_pago/${registro.idcomprobante}`, "factura", "pago", registro),
            tituloBoton: "Comprobante",
        });
    } else if (registro.tipo_documento === 3) {
        return crearBotonIconoPdfMake({
            contenedorModal,
            obtenerContenido: pdfMakeComprobanteGeneral(`${URL}listar_comprobantes_de_recibo_cobro/${registro.idcomprobante}`, "recibo", "cobro", registro),
            tituloBoton: "Comprobante",
        });
    } else if (registro.tipo_documento === 4) {
        return crearBotonIconoPdfMake({
            contenedorModal,
            obtenerContenido: pdfMakeComprobanteGeneral(`${URL}listar_comprobantes_de_recibo_pago/${registro.idcomprobante}`, "recibo", "pago", registro),
            tituloBoton: "Comprobante",
        });
    } else {
        const boton = crearElemento("button", {class: "btn btn-secondary btn-sm", disabled: true}, ["Sin comprobante"]);
        return boton;
    }
}

/**
 * Función: Crea un botón para editar un registro de Caja o Banco.
 * Descripción: Permite crear un botón que abre un formulario modal para editar el registro seleccionado.
 *              La opción se crea según el tipo de documento y origen del registro, se genera un formulario específico para editar la información correspondiente, con campos adicionales y condicionales según corresponda.
 *              Además, se incluye la funcionalidad para eliminar archivos adjuntos relacionados al registro, si los hubiera.
 * Fecha: 26 de febrero de 2026
 * Autor: Joel Choque
 */
function crearBotonEditarCB(datosVista) {
    const {
        obtenerUrl,
        contenedorModal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registro,
    } = datosVista;

    if (registro.estado_documento === "anulado" || registro.estado_documento === "pendiente anulacion") {
        return null;
    }

    const opcionesBoton = {
        contenedorModal,
        contenedorDeAlertas,
        obtenerUrl,
        registro,
        cargarContenidoTabla,
    }

    if (registro.registro_desde === "caja_bancos" && registro.tipo_documento === 1) {
        return botonEditarCB({
            ...opcionesBoton,
            obtenerDatosFormulario: formularioCBFxCEditarFactura,
            camposAdicionales: {
                ver: "editar_caja_bancos_facturas",
                idcomprobante: registro.idcomprobante,
                tipo_documento: 1,
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                lugar: "",
                persona: "",
                ci: "",
            },
            datosEliminarArchivo: {
                archivo: "archivo",
                idRegistro: "idcomprobante",
                tipoDocumento: "comprobante_cobro"
            }
        });
    } else if (registro.registro_desde === "caja_bancos" && registro.tipo_documento === 2) {
        return botonEditarCB({
            ...opcionesBoton,
            obtenerDatosFormulario: formularioCBFxPEditarFactura,
            camposAdicionales: {
                ver: "editar_caja_bancos_facturas",
                idcomprobante: registro.idcomprobante,
                tipo_documento: 2,
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                lugar: "",
                persona: "",
                ci: "",
            },
            datosEliminarArchivo: {
                archivo: "archivo",
                idRegistro: "idcomprobante",
                tipoDocumento: "comprobante_pago"
            }
        });
    } else if (registro.registro_desde === "caja_bancos_factura" && registro.tipo_documento === 1) {
        return botonEditarCB({
            ...opcionesBoton,
            obtenerDatosFormulario: formularioCBFxCEditarConFactura,
            camposAdicionales: {
                ver: "editar_caja_bancos_facturas_existentes",
                idcomprobante: registro.idcomprobante,
                tipo_documento: 1,
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            datosEliminarArchivo: {
                archivo: "archivo",
                idRegistro: "idcomprobante",
                tipoDocumento: "comprobante_cobro"
            }
        });
    } else if (registro.registro_desde === "caja_bancos_factura" && registro.tipo_documento === 2) {
        return botonEditarCB({
            ...opcionesBoton,
            obtenerDatosFormulario: formularioCBFxPEditarConFactura,
            camposAdicionales: {
                ver: "editar_caja_bancos_facturas_existentes",
                idcomprobante: registro.idcomprobante,
                tipo_documento: 2,
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            datosEliminarArchivo: {
                archivo: "archivo",
                idRegistro: "idcomprobante",
                tipoDocumento: "comprobante_pago"
            }
        });
    } else if (registro.registro_desde === "caja_bancos" && registro.tipo_documento === 3) {
        return botonEditarCB({
            ...opcionesBoton,
            obtenerDatosFormulario: formularioCBDdCEditar,
            camposAdicionales: {
                ver: "editar_recibo_caja_bancos",
                idcomprobante: registro.idcomprobante,
                tipo_documento: 1,
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            datosEliminarArchivo: {
                archivo: "archivo",
                idRegistro: "idrecibo",
                tipoDocumento: "recibo"
            }
        });
    } else if (registro.registro_desde === "caja_bancos" && registro.tipo_documento === 4) {
        return botonEditarCB({
            ...opcionesBoton,
            obtenerDatosFormulario: formularioCBDdPEditar,
            camposAdicionales: {
                ver: "editar_recibo_caja_bancos",
                idcomprobante: registro.idcomprobante,
                tipo_documento: 2,
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            datosEliminarArchivo: {
                archivo: "archivo",
                idRegistro: "idrecibo",
                tipoDocumento: "recibo"
            }
        });
    }

    return null;
}

/**
 * Función: Crea un botón para editar un registro de Caja o Banco.
 * Descripción: Genera un botón que abre un formulario modal para editar el registro seleccionado.
 *              Se incluye la funcionalidad para eliminar archivos adjuntos relacionados al registro, si los hubiera.
 * Fecha: 25 de febrero de 2026
 * Autor: Joel Choque
 */
function botonEditarCB(datosVista) {
    const {
        contenedorModal,
        contenedorDeAlertas,
        obtenerDatosFormulario,
        obtenerUrl,
        camposAdicionales,
        registro,
        cargarContenidoTabla,
        datosEliminarArchivo,
    } = datosVista;


    const crearBotonEliminarArchivo = manejarEliminarArchivoDesdeFormulario({
        contenedorDeAlertas,
        vistaPrincipal: contenedorModal,
        cargarContenidoTabla,
        urlListadoTabla: obtenerUrl,
        llaves: datosEliminarArchivo,
    });
    const formulario = obtenerDatosFormulario(registro, crearBotonEliminarArchivo);
    const botonEditar= botonModalEditar(
        {
            contenedorDeAlertas,
            camposDeFormulario: formulario,
            URL_FORM: CT_URLAPI,
            URL_LISTAR: obtenerUrl,
            configuracionModal: {
                tituloModal: "Edición de Documento",
            },
            camposAdicionales,
            datosRegistro: registro,
            cargarContenidoTabla,
        },
        contenedorModal,
    );

    return botonEditar;
}

/**
 * Función: Crea un botón para manejar varias acciones relacionadas con un registro de Caja o Banco.
 * Descripción: Genera un botón con un menú desplegable que muestra opciones adicionales para el registro seleccionado.
 *              Las opciones se crean según el tipo de documento y origen del registro, se genera una solicitud específica para cada caso.
 * Fecha: 26 de febrero de 2026
 * Autor: Joel Choque
 */
function crearBotonDropdown(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        urlSolicitud,
        cargarContenidoTabla,
        registro,
    } = datosVista;


    const datos = {
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        urlListadoTabla: urlSolicitud,
    }

    const dropdownMenu = [];
    let anularCallback;

    if (registro.registro_desde === "caja_bancos" && registro.tipo_documento === 1) {
        anularCallback = manejarSolicitudAnulacion({
            ...datos,
            datosFormulario: {
                id: registro.idfactura,
                tipoDocumento: registro.factura_recibo,
                registroDesde: registro.registro_desde,
            }
        });
    } else if (registro.registro_desde === "caja_bancos" && registro.tipo_documento === 2) {
        anularCallback = manejarSolicitudAnulacion({
            ...datos,
            datosFormulario: {
                id: registro.idfactura,
                tipoDocumento: registro.factura_recibo,
                registroDesde: registro.registro_desde,
            }
        });
    } else if (registro.registro_desde === "caja_bancos_factura" && registro.tipo_documento === 1) {
        anularCallback = manejarSolicitudAnulacion({
            ...datos,
            datosFormulario: {
                id: registro.idfactura,
                tipoDocumento: registro.factura_recibo,
                registroDesde: registro.registro_desde,
            }
        });

    } else if (registro.registro_desde === "caja_bancos_factura" && registro.tipo_documento === 2) {
        anularCallback = manejarSolicitudAnulacion({
            ...datos,
            datosFormulario: {
                id: registro.idfactura,
                tipoDocumento: registro.factura_recibo,
                registroDesde: registro.registro_desde,
            }
        });

    } else if (registro.registro_desde === "caja_bancos" && registro.tipo_documento === 3) {
        anularCallback = manejarSolicitudAnulacion({
            ...datos,
            datosFormulario: {
                id: registro.idrecibo,
                tipoDocumento: registro.factura_recibo,
                registroDesde: registro.registro_desde,
            }
        });

    } else if (registro.registro_desde === "caja_bancos" && registro.tipo_documento === 4) {
        anularCallback = manejarSolicitudAnulacion({
            ...datos,
            datosFormulario: {
                id: registro.idrecibo,
                tipoDocumento: registro.factura_recibo,
                registroDesde: registro.registro_desde,
            }
        });
    }

    if (anularCallback && registro.estado_documento === "activo") {
        dropdownMenu.push({
            texto: "Anular",
            callback: anularCallback,
        });
    }

    // Creación del menú desplegable para más opciones, solo si hay opciones disponibles
    if (dropdownMenu.length > 0) {
        const icono = crearElemento("i", {class: "bi bi-three-dots-vertical"});
        const btnDropdown = crearElemento("button", {type: "button", class: "btn btn-info btn-sm rounded-1", "data-bs-toggle": "dropdown", "aria-expanded": "false", title: "Más opciones", "data-id": "btn-dropdown" }, [icono]);
        const ul = crearElemento("ul", {class: "dropdown-menu dropdown-menu-end"});
        const div = crearElemento("div", {class: "btn-group dropstart"}, [btnDropdown, ul]);

        for (const data of dropdownMenu) {
            const a = crearElemento("a", { class: "dropdown-item" }, [data.texto]);
            a.addEventListener("click", () => {
                data.callback()
            });
            const li = crearElemento("li", undefined, [a]);
            ul.append(li, " ");
        }
        return div;
    }
    return null;
}

/**
 * Función: Maneja la solicitud de anulación de un registro de Caja o Banco.
 * Descripción: Genera un modal para ingresar el motivo de la solicitud de anulación, luego envía la solicitud al servidor y actualiza la tabla con los nuevos datos.
 * Fecha: 26 de febrero de 2026
 * Autor: Joel Choque
 */
function manejarSolicitudAnulacion(datosSolicitud) {
    const {
        urlListadoTabla,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        datosFormulario
    } = datosSolicitud;

    return () => {
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
                const listaDeRegistros = await obtenerDatos(urlListadoTabla);
                cerrarModal();
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Solicitud enviada con éxito");
            }
            const error = () => {
                alertaDeError(contenedorDeAlertas, "No se pudo enviar la solicitud")
                cerrarModal();
            }

            const [fecha, hora] = obtenerFechaActual("array-fechahora");
            const camposAdicionales = {
                ver: "registrar_anular_eliminar_activar_factura_caja_bancos",
                id_documento: datosFormulario.id,
                tipo_documento: datosFormulario.tipoDocumento,
                registro_desde: datosFormulario.registroDesde,

                hora,
                fecha,
                estado_solicitud: "1",
                estado_opcion: "1",
                idusuario: usuario_id,
                idempresa: empresa_id,
            };
            // Envio de datos para la solicitud de anulación
            manejarEnvioFormulario({
                refFormulario: elementoFormulario,
                urlSolicitud: CT_URLAPI,
                camposAdicionales,
                callbackExito: accionEnviar,
                callbackError: error
            });
        });
        vistaPrincipal.appendChild(modal);
    }

}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

/**
 * Función: Crea un gestor para manejar los filtros aplicados en la vista de Cajas y Bancos.
 * Descripción: Esta función genera un objeto que permite almacenar y actualizar los valores de los filtros seleccionados por el usuario.
 *              Obtiene la ruta de solicitud para listar los registros según esos filtros.
 *              También gestiona la información del responsable de los registros mostrados.
 * Fecha: 23 de febrero de 2026
 * Autor: Joel Choque
 */
function crearGestorFiltro(urlSolicitud) {
    let filtros = {
        idCajaBanco: null,
        fechaInicio: null,
        fechaFin: null,
        tipoComprobante: null,

        nombreCajaBanco: null,
        codigoCajaBanco: null,
    };

    let responsable = {};

    return {
        setValoresFiltro(lista) {
            filtros = { ...filtros, ...lista };
        },
        setResponsable(usuario) {
            responsable = {
                funcion: usuario.funcion || null,
                idusuario: usuario.idusuario || null,
                permiso_registrar: usuario.permiso_registrar || null,
            }
        },
        getRuta() {
            const ruta = `${urlSolicitud}/${filtros.idCajaBanco}/${filtros.fechaInicio}T00:00:00/${filtros.fechaFin}T23:59:59/${filtros.tipoComprobante}`;
            return ruta;
        },
        getValoresDeFiltro() {
            return  filtros;
        },
        getResponsable() {
            return responsable;
        }
    };
}

// Valida la fecha de transacción esté en el rango de la gestión actual.
function validarFechaTransaccion(prefijoId, vistaRegistroFormulario) {
    return async (enviarFormulario, formulario) => {
        const fechaTransaccion = formulario.querySelector(`#${prefijoId}-fechatrans`);
        if (fechaTransaccion?.value && !await modalValidarFechaSegunGestion(fechaTransaccion.value, vistaRegistroFormulario)) {
            return;
        }
        enviarFormulario();
    }
}

// Obtiene el estado de un registro y lo resalta según su valor.
function obtenerEstado (estado) {
    if (estado === "activo") {
        return resaltarTexto("green", estado);
    } else if (estado === "anulado") {
        return resaltarTexto("yellow", estado);
    } else if (estado === "pendiente anulacion") {
        return resaltarTexto("blue", estado);
    } else if (estado === "pendiente eliminacion") {
        return resaltarTexto("blue", estado);
    } else if (estado === "pendiente activacion") {
        return resaltarTexto("blue", estado);
    } else {
        return resaltarTexto("green", "Activo");
    }
}