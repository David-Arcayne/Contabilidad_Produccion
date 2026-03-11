import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { campoSelectGroup, formularioModalAsientoOTransaccion, manejarSelect } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId, getUsuarioId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, formatoDecimal, formatoFecha, obtenerFechaActual, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalManejarRespuestaError, modalRemovible, modalValidarFechaSegunGestion } from "../../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos } from "../../../funciones/Solicitudes.js";
import { obtenerTipoVentaComercial } from "../../tributario/facturasComercial.js";
import { pdfMakeComercialFacturaVentaSinTrans, pdfMakeFacturasDeCobroSinTrans, pdfMakeFacturasDePagoSinTrans, pdfMakeRecibosDeCobroSinTrans, pdfMakeRecibosDePagoSinTrans } from "./ReportesTransacciones.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de documentos que no están asignados a una transacción.
 *              Permite visualizar los documentos pendientes de registro, filtrarlos por tipo, estado y caja/banco.
 * Fecha: 19 de febrero de 2026
 * Autor: Joel Choque
 */
export const PendientesDeRegistro = async (datosTrans) => {
    const {
        codigo,
        permisos,
        vistaTransaccion,
        vistaDocsSinTransaccion,
        urlTransaccion,
        cargarTablaTransaccion
    } = datosTrans;

    const URL = CT_URLAPI;
    const USUARIO_ID = getUsuarioId();
    const EMPRESA_ID = getEmpresaId();

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaDocsSinTransaccion.append(vistaPrincipal);


    // Creación de elementos para la vista Principal
    const regresar = async () => {
        const listaDeRegistros = await obtenerDatos(urlTransaccion);
        cargarTablaTransaccion(listaDeRegistros);
        cambiarVista(vistaDocsSinTransaccion, vistaTransaccion);
        vistaDocsSinTransaccion.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Pendientes de Registro" }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);

    const vistaFacturasCobro = crearElemento("div", { "data-for-list-id": "facturas-cobro" });
    const vistaFacturasPago = crearElemento("div", { class: "d-none", "data-for-list-id": "facturas-pago" });
    const vistaRecibosCobro = crearElemento("div", { class: "d-none", "data-for-list-id": "recibos-cobro" });
    const vistaRecibosPago = crearElemento("div", { class: "d-none", "data-for-list-id": "recibos-pago" });
    const formularioTipoDocumento = crearElemento("form", { class: "row pb-2 g-1" });
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.append(formularioTipoDocumento, contenedorDeAlertas, vistaFacturasCobro, vistaFacturasPago, vistaRecibosCobro, vistaRecibosPago);

    // Creación de campos del formulario para obtener datos por tipo de documento
    const [selectPendientes, divPendientes] = campoSelectGroup(
        { atributos: { id: "tipodoc-pendientes", name: "doc_pendiente"} },
        { contenido: "Pendientes Local" },
    );
    const [selectPendientesReferidos, divPendientesReferidos] = campoSelectGroup(
        { atributos: { id: "tipodoc-pendientes-referidos", name: "doc_pendiente_referido" } },
        { contenido: "Pendientes Referidos" },
    );
    const [selectEstado, divEstado] = campoSelectGroup(
        { atributos: { id: "tipodoc-estado", name: "estado", required: true } },
        { contenido: "Estado" },
    );
    const [selectCajaBanco, divCajaBanco] = campoSelectGroup(
        { atributos: { id: "tipodoc-cajabanco", name: "cajabanco", required: true, style: "width: 180px;" } },
        { contenido: "Caja/Banco" },
    );
    selectPendientes.innerHTML = `
        <option value="">-- Elija una opción --</option>
        <option value="1" selected>Facturas de Cobro</option>
        <option value="2">Facturas de Pago</option>
        <option value="3">Recibo de Cobro</option>
        <option value="4">Recibo de Pago</option>`;
    selectPendientesReferidos.innerHTML = `
        <option value="">-- Elija una opción --</option>
        <option value="1">Factura Venta Comercial</option>`;
    selectEstado.innerHTML = `
        <option value="0">Todos</option>
        <option value="1">Por Cobrar</option>
        <option value="2">Cobrado</option>`;
    formularioTipoDocumento.append(divPendientes, divPendientesReferidos, divEstado, divCajaBanco);

    let cbPorUsuario = await obtenerDatos(`${URL}listar_caja_bancos_por_usuario/${EMPRESA_ID}/${USUARIO_ID}`);
    if (cbPorUsuario && cbPorUsuario.length > 0) {
        // Hay cajas o bancos asociados al usuario, se llenan las opciones del select
        manejarSelect(selectCajaBanco, {
            datosRegistro: cbPorUsuario,
            llavesOpciones: { valor: "idcaja_bancos", detalle: ["codigo", "tipo_cuenta"]},
            opcionesExtraInicio: [{ value: "0", text: "Todos" }],
            opcionPorDefecto: false,
            callbackInput: () => formularioTipoDocumento.requestSubmit(),
        });
    } else {
        // No hay cajas o bancos asociados al usuario, se establece una opción por defecto
        cbPorUsuario = [{idcaja_bancos: 0 , texto: "Todos"}];
        manejarSelect(selectCajaBanco, {
            datosRegistro: cbPorUsuario,
            llavesOpciones: { valor: "idcaja_bancos", detalle: ["texto"]},
            opcionPorDefecto: false,
            callbackInput: () => formularioTipoDocumento.requestSubmit(),
        });
    }
    // Obtener los IDs de las cajas y bancos del usuario para el filtro
    const idCBPorUsuario = cbPorUsuario.map((cb) => cb.idcaja_bancos);

    const opcionesCobros = `
        <option value="0">Todos</option>
        <option value="1">Por Cobrar</option>
        <option value="2">Cobrado</option>`;
    const opcionesPagos = `
        <option value="0">Todos</option>
        <option value="1">Por Pagar</option>
        <option value="2">Pagado</option>`;

    selectPendientes.addEventListener("change", (e) => {
        selectPendientesReferidos.value = "";
        selectEstado.innerHTML = selectPendientes.value === "1" || selectPendientes.value === "3" ? opcionesCobros : opcionesPagos;
        formularioTipoDocumento.requestSubmit();
    });
    selectPendientesReferidos.addEventListener("change", (e) => {
        selectPendientes.value = "";
        formularioTipoDocumento.requestSubmit();
    });
    selectEstado.addEventListener("change", (e) => {
        formularioTipoDocumento.requestSubmit();
    });
    formularioTipoDocumento.addEventListener("submit", async (e) => {
        e.preventDefault();

        const valorTipo = selectPendientes.value;
        const valorTipoReferido = selectPendientesReferidos.value;
        const valorEstado = selectEstado.value;
        let valorCajaBanco = selectCajaBanco.value;
        if (valorCajaBanco === "0" || valorCajaBanco === "") {
            valorCajaBanco = idCBPorUsuario;
        } else {
            valorCajaBanco = [valorCajaBanco];
        }

        vistaFacturasCobro.classList.add("d-none");
        vistaFacturasPago.classList.add("d-none");
        vistaRecibosCobro.classList.add("d-none");
        vistaRecibosPago.classList.add("d-none");

        if (valorTipo === "1") { // Facturas de Cobro
            vistaFacturasCobro.innerHTML = "";
            vistaFacturasCobro.classList.remove("d-none");

            const URL_LT = `${URL}listar_facturas_cobros_sin_transaccion/${valorEstado}/${valorCajaBanco}/${EMPRESA_ID}`;
            const arrInformacion = [
                { nombre: "Fecha", llave: "fecha" },
                { nombre: "N° Factura", llave: "nfactura" },
                { nombre: "N° Autorización", llave: "nautorizacion" },
                { nombre: "Código Control", llave: "codigocontrol" },
                { nombre: "Tasa Cero", llave: "tasacero" },
                { nombre: "Export", llave: "export" },
                { nombre: "N° Póliza", llave: "npoliza" },
                { nombre: "ICE/IECDH/OTROS", llave: "iceiecdhotros" },
                { nombre: "Descuento/Bonificación", llave: "descuentobonificacion" },
                { nombre: "Especificación", llave: "espesificacion" },
                { nombre: "Cliente", llave: "procli" },
                { nombre: "NIT", llave: "nit" },
                { nombre: "Concepto", llave: "por_concepto_de" },
                { nombre: "Monto", llave: "montofactura" },
                { nombre: "Estado", llave: (registro) => {
                    return registro.cobrado === "1" ? "Por cobrar" : ( registro.cobrado === "2" ? "Cobrado" : "-");
                } },
            ];

            // Controlador de la tabla para gestionar los datos y filtros
            const controladorTabla = crearGestorTabla();

            const encabezadoTabla = [
                "N°",
                "Selección",
                "Fecha",
                "N° Factura",
                "Cliente",
                "NIT",
                "Concepto",
                "Monto",
                "Opciones",
            ];

            const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

            const divFiltros = crearFiltrosTabla({
                obtenerContenidoReporte: pdfMakeFacturasDeCobroSinTrans(controladorTabla.getDatosOriginales),
                controladorTabla,
                contenedorPrincipal: vistaPrincipal,
            });
            vistaFacturasCobro.append(divFiltros, divTabla);

            // Inicialización del controlador de la tabla para gestionar los datos y filtros
            controladorTabla.suscribir("tabla", (lista) => {
                const validado = validarListadoTabla(lista);
                if (!validado.valido) {
                    tbody.replaceChildren(validado.fila);
                    return;
                }

                const fragment = document.createDocumentFragment();

                let objetoRegistros = {};
                let contador = 0;
                let totalMonto = 0;
                for (const item of lista) {
                    const registro = item.raw;
                    contador ++;
                    totalMonto += Math.round(parseFloat(registro.montofactura || 0) * 100);

                    const celdas = [
                        crearElemento("td", { class: "text-center", style: "width: 30px;" }, [contador]),
                        crearElemento("td", { class: "text-center", style: "width: 70px;" }, [columnaCheckboxTransPendientes({
                            vistaPrincipal: vistaFacturasCobro,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                            tipoDocumento: "factura_cobro",
                        })]),
                        crearElemento("td", undefined, [item.fechaTexto]),
                        crearElemento("td", undefined, [registro.nfactura || "-"]),
                        crearElemento("td", undefined, [registro.procli || "-"]),
                        crearElemento("td", undefined, [registro.nit || "-"]),
                        crearElemento("td", undefined, [registro.por_concepto_de || "-"]),
                        crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montofactura)]),
                    ];

                    const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                    const botonInformacion = botonMostrarInformacion(vistaFacturasCobro, arrInformacion, registro);
                    tdOpciones.appendChild(botonInformacion);

                    celdas.push(tdOpciones);
                    const fila = crearElemento("tr", undefined, [ ...celdas]);
                    fragment.appendChild(fila);
                }

                // Agregar fila de totales al final de la tabla
                const filaTotal = crearFilaTotalTabla({
                    columnasTexto: 7,
                    columnasFinal: 1,
                    valores: [totalMonto/100]
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
                    .map(registro => {
                        const [anio, mes, dia] = (registro.fecha || "").split("-").map(Number);
                        return {
                            raw: registro,
                            fechaBusqueda: { anio, mes, dia },
                            fechaTexto: formatoFecha(registro.fecha) || "-",
                            textoBusqueda: [
                                registro.nfactura,
                                registro.procli,
                                registro.nit,
                                registro.por_concepto_de,
                                formatoDecimal(registro.montofactura)
                            ].join("|").toLowerCase()
                        };
                    });
                controladorTabla.setDatosRegistro(normalizados);
            }

            // Cargar los datos iniciales en la tabla al cargar la vista
            manejarListadoTabla({
                urlSolicitud: URL_LT,
                callbackCargarTabla: cargarContenidoTabla,
                contenedorAlertas: contenedorDeAlertas,
                cuerpoTabla: tbody,
            });

            ajustarAlturaTabla(divTabla);

        } else if (valorTipo === "2") { // Facturas de Pago
            vistaFacturasPago.innerHTML = "";
            vistaFacturasPago.classList.remove("d-none");

            const URL_LT = `${URL}listar_facturas_pagos_sin_transaccion/${valorEstado}/${valorCajaBanco}/${EMPRESA_ID}`;
            const arrInformacion = [
                { nombre: "Fecha", llave: "fecha" },
                { nombre: "N° Factura", llave: "nfactura" },
                { nombre: "N° Autorización", llave: "nautorizacion" },
                { nombre: "Código Control", llave: "codigocontrol" },
                { nombre: "Tasa Cero", llave: "tasacero" },
                { nombre: "Export", llave: "export" },
                { nombre: "N° Póliza", llave: "npoliza" },
                { nombre: "ICE/IECDH/OTROS", llave: "iceiecdhotros" },
                { nombre: "Descuento/Bonificación", llave: "descuentobonificacion" },
                { nombre: "Especificación", llave: "espesificacion" },
                { nombre: "Proveedor", llave: "procli" },
                { nombre: "NIT", llave: "nit" },
                { nombre: "Concepto", llave: "por_concepto_de" },
                { nombre: "Monto", llave: "montofactura" },
                { nombre: "Estado", llave: (registro) => {
                    return registro.pagado === "1" ? "Por pagar" : ( registro.pagado === "2" ? "Pagado" : "-");
                } },
            ];

            // Controlador de la tabla para gestionar los datos y filtros
            const controladorTabla = crearGestorTabla();

            const encabezadoTabla = [
                "N°",
                "Selección",
                "Fecha",
                "N° Factura",
                "Proveedor",
                "NIT",
                "Concepto",
                "Monto",
                "Opciones",
            ];

            const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

            const divFiltros = crearFiltrosTabla({
                obtenerContenidoReporte: pdfMakeFacturasDePagoSinTrans(controladorTabla.getDatosOriginales),
                controladorTabla,
                contenedorPrincipal: vistaPrincipal,
            });
            vistaFacturasPago.append(divFiltros, divTabla);

            // Inicialización del controlador de la tabla para gestionar los datos y filtros
            controladorTabla.suscribir("tabla", (lista) => {
                const validado = validarListadoTabla(lista);
                if ( !validado.valido ) {
                    tbody.replaceChildren(validado.fila);
                    return;
                }

                const fragment = document.createDocumentFragment();

                let objetoRegistros = {};
                let contador = 0;
                let totalMonto = 0;
                for (const item of lista) {
                    const registro = item.raw;
                    contador ++;
                    totalMonto += Math.round(parseFloat(registro.montofactura || 0) * 100);

                    const celdas = [
                        crearElemento("td", { class: "text-center", style: "width: 30px;" }, [contador]),
                        crearElemento("td", { class: "text-center", style: "width: 70px;" }, [columnaCheckboxTransPendientes({
                            vistaPrincipal: vistaFacturasPago,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                            tipoDocumento: "factura_pago",
                        })]),
                        crearElemento("td", undefined, [item.fechaTexto]),
                        crearElemento("td", undefined, [registro.nfactura || "-"]),
                        crearElemento("td", undefined, [registro.procli || "-"]),
                        crearElemento("td", undefined, [registro.nit || "-"]),
                        crearElemento("td", undefined, [registro.por_concepto_de || "-"]),
                        crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montofactura)]),
                    ];

                    const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                    const botonInformacion = botonMostrarInformacion(vistaFacturasPago, arrInformacion, registro);
                    tdOpciones.appendChild(botonInformacion);

                    celdas.push(tdOpciones);
                    const fila = crearElemento("tr", undefined, [ ...celdas]);
                    fragment.appendChild(fila);
                }

                // Agregar fila de totales al final de la tabla
                const filaTotal = crearFilaTotalTabla({
                    columnasTexto: 7,
                    columnasFinal: 1,
                    valores: [totalMonto/100]
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
                    .map(registro => {
                        const [anio, mes, dia] = (registro.fecha || "").split("-").map(Number);
                        return {
                            raw: registro,
                            fechaBusqueda: { anio, mes, dia },
                            fechaTexto: formatoFecha(registro.fecha) || "-",
                            textoBusqueda: [
                                registro.nfactura,
                                registro.procli,
                                registro.nit,
                                registro.por_concepto_de,
                                formatoDecimal(registro.montofactura)
                            ].join("|").toLowerCase()
                        };
                    });
                controladorTabla.setDatosRegistro(normalizados);
            }

            // Manejar el listado en la tabla
            manejarListadoTabla({
                urlSolicitud: URL_LT,
                callbackCargarTabla: cargarContenidoTabla,
                contenedorAlertas: contenedorDeAlertas,
                cuerpoTabla: tbody,
            });

            ajustarAlturaTabla(divTabla);
        } else if (valorTipo === "3") { // Recibos de Cobro
            vistaRecibosCobro.innerHTML = "";
            vistaRecibosCobro.classList.remove("d-none");

            const URL_LT = `${URL}listar_documentos_cobros_sin_transaccion/${valorEstado}/${valorCajaBanco}/${EMPRESA_ID}`;
            const arrInformacion = [
                { nombre: "Fecha", llave: "fecha" },
                { nombre: "Lugar", llave: "lugar" },
                { nombre: "Cliente", llave: "nombre_cliente" },
                { nombre: "Persona", llave: "persona" },
                { nombre: "CI", llave: "ci" },
                { nombre: "N° Recibo", llave: "nro_recibo" },
                { nombre: "Concepto", llave: "concepto" },
                { nombre: "Monto", llave: "monto" },
            ];

            // Controlador de la tabla para gestionar los datos y filtros
            const controladorTabla = crearGestorTabla();

            const encabezadoTabla = [
                "N°",
                "Selección",
                "Fecha",
                "Lugar",
                "Cliente",
                "N° Recibo",
                "Concepto",
                "Monto",
                "Opciones",
            ];
            const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

            const divFiltros = crearFiltrosTabla({
                obtenerContenidoReporte: pdfMakeRecibosDeCobroSinTrans(controladorTabla.getDatosOriginales),
                controladorTabla,
                contenedorPrincipal: vistaPrincipal,
            });
            vistaRecibosCobro.append(divFiltros, divTabla);

             // Inicialización del controlador de la tabla para gestionar los datos y filtros
            controladorTabla.suscribir("tabla", (lista) => {
                const validado = validarListadoTabla(lista);
                if ( !validado.valido ) {
                    tbody.replaceChildren(validado.fila);
                    return;
                }

                const fragment = document.createDocumentFragment();

                let objetoRegistros = {};
                let contador = 0;
                let totalMonto = 0;
                for (const item of lista) {
                    const registro = item.raw;
                    contador ++;
                    totalMonto += Math.round(parseFloat(registro.monto || 0) * 100);

                    const celdas = [
                        crearElemento("td", { class: "text-center", style: "width: 30px;" }, [contador]),
                        crearElemento("td", { class: "text-center", style: "width: 70px;" }, [columnaCheckboxTransPendientes({
                            vistaPrincipal: vistaRecibosCobro,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                            tipoDocumento: "recibo_cobro",
                        })]),
                        crearElemento("td", undefined, [item.fechaTexto]),
                        crearElemento("td", undefined, [registro.lugar || "-"]),
                        crearElemento("td", undefined, [registro.nombre_cliente || "-"]),
                        crearElemento("td", undefined, [registro.nro_recibo || "-"]),
                        crearElemento("td", undefined, [registro.concepto || "-"]),
                        crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                    ];

                    const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                    const botonInformacion = botonMostrarInformacion(vistaRecibosCobro, arrInformacion, registro);
                    tdOpciones.appendChild(botonInformacion);

                    celdas.push(tdOpciones);
                    const fila = crearElemento("tr", undefined, [ ...celdas]);
                    fragment.appendChild(fila);
                }

                // Agregar fila de totales al final de la tabla
                const filaTotal = crearFilaTotalTabla({
                    columnasTexto: 7,
                    columnasFinal: 1,
                    valores: [totalMonto/100]
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
                    .map(registro => {
                        const [anio, mes, dia] = (registro.fecha || "").split("-").map(Number);
                        return {
                            raw: registro,
                            fechaBusqueda: { anio, mes, dia },
                            fechaTexto: formatoFecha(registro.fecha) || "-",
                            textoBusqueda: [
                                registro.lugar,
                                registro.nombre_cliente,
                                registro.nro_recibo,
                                registro.concepto,
                                formatoDecimal(registro.monto)
                            ].join("|").toLowerCase()
                        };
                    });
                controladorTabla.setDatosRegistro(normalizados);
            }

            // Manejar el listado en la tabla
            manejarListadoTabla({
                urlSolicitud: URL_LT,
                callbackCargarTabla: cargarContenidoTabla,
                contenedorAlertas: contenedorDeAlertas,
                cuerpoTabla: tbody,
            });

            ajustarAlturaTabla(divTabla);
        } else if (valorTipo === "4") { // Recibos de Pago
            vistaRecibosPago.innerHTML = "";
            vistaRecibosPago.classList.remove("d-none");

            const URL_LT = `${URL}listar_documentos_pagos_sin_transaccion/${valorEstado}/${valorCajaBanco}/${EMPRESA_ID}`;
            const arrInformacion = [
                { nombre: "Fecha", llave: "fecha" },
                { nombre: "Lugar", llave: "lugar" },
                { nombre: "Proveedor", llave: "nombre_proveedor" },
                { nombre: "Persona", llave: "persona" },
                { nombre: "CI", llave: "ci" },
                { nombre: "N° Recibo", llave: "nro_recibo" },
                { nombre: "Concepto", llave: "concepto" },
                { nombre: "Monto", llave: "monto" },
            ];

            // Controlador de la tabla para gestionar los datos y filtros
            const controladorTabla = crearGestorTabla();

            const encabezadoTabla = [
                "N°",
                "Selección",
                "Fecha",
                "Lugar",
                "Proveedor",
                "N° Recibo",
                "Concepto",
                "Monto",
                "Opciones",
            ];
            const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

            const divFiltros = crearFiltrosTabla({
                obtenerContenidoReporte: pdfMakeRecibosDePagoSinTrans(controladorTabla.getDatosOriginales),
                controladorTabla,
                contenedorPrincipal: vistaPrincipal,
            });
            vistaRecibosPago.append(divFiltros, divTabla);

            // Inicialización del controlador de la tabla para gestionar los datos y filtros
            controladorTabla.suscribir("tabla", (lista) => {
                const validado = validarListadoTabla(lista);
                if ( !validado.valido ) {
                    tbody.replaceChildren(validado.fila);
                    return;
                }

                const fragment = document.createDocumentFragment();

                let objetoRegistros = {};
                let contador = 0;
                let totalMonto = 0;
                for (const item of lista) {
                    const registro = item.raw;
                    contador ++;
                    totalMonto += Math.round(parseFloat(registro.monto || 0) * 100);

                    const celdas = [
                        crearElemento("td", { class: "text-center", style: "width: 30px;" }, [contador]),
                        crearElemento("td", { class: "text-center", style: "width: 70px;" }, [columnaCheckboxTransPendientes({
                            vistaPrincipal: vistaRecibosPago,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                            tipoDocumento: "recibo_pago",
                        })]),
                        crearElemento("td", undefined, [item.fechaTexto]),
                        crearElemento("td", undefined, [registro.lugar || "-"]),
                        crearElemento("td", undefined, [registro.nombre_proveedor || "-"]),
                        crearElemento("td", undefined, [registro.nro_recibo || "-"]),
                        crearElemento("td", undefined, [registro.concepto || "-"]),
                        crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                    ];

                    const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                    const botonInformacion = botonMostrarInformacion(vistaRecibosPago, arrInformacion, registro);
                    tdOpciones.appendChild(botonInformacion);

                    celdas.push(tdOpciones);
                    const fila = crearElemento("tr", undefined, [ ...celdas]);
                    fragment.appendChild(fila);
                }

                // Agregar fila de totales al final de la tabla
                const filaTotal = crearFilaTotalTabla({
                    columnasTexto: 7,
                    columnasFinal: 1,
                    valores: [totalMonto/100]
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
                    .map(registro => {
                        const [anio, mes, dia] = (registro.fecha || "").split("-").map(Number);
                        return {
                            raw: registro,
                            fechaBusqueda: { anio, mes, dia },
                            fechaTexto: formatoFecha(registro.fecha) || "-",
                            textoBusqueda: [
                                registro.lugar,
                                registro.nombre_proveedor,
                                registro.nro_recibo,
                                registro.concepto,
                                formatoDecimal(registro.monto)
                            ].join("|").toLowerCase()
                        };
                    });
                controladorTabla.setDatosRegistro(normalizados);
            }

            // Manejar el listado en la tabla
            manejarListadoTabla({
                urlSolicitud: URL_LT,
                callbackCargarTabla: cargarContenidoTabla,
                contenedorAlertas: contenedorDeAlertas,
                cuerpoTabla: tbody,
            });

            ajustarAlturaTabla(divTabla);
        } else if (valorTipoReferido === "1") { // Comercial Facturas de Venta
            vistaRecibosPago.innerHTML = "";
            vistaRecibosPago.classList.remove("d-none");

            const URL_LT = `${URL}listar_factura_comercial/${EMPRESA_ID}`;

            // Controlador de la tabla para gestionar los datos y filtros
            const controladorTabla = crearGestorTabla();

            const encabezadoTabla = [
                "N°",
                "Selección",
                "Fecha",
                "Cliente",
                "Sucursal",
                "Tipo-Venta",
                "Tipo-Pago",
                "N° Factura",
                "Monto",
                "Saldo",
                "Descuento",
            ];
            const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

            const divFiltros = crearFiltrosTabla({
                obtenerContenidoReporte: pdfMakeComercialFacturaVentaSinTrans(controladorTabla.getDatosOriginales),
                controladorTabla,
                contenedorPrincipal: vistaPrincipal,
            });
            vistaRecibosPago.append(divFiltros, divTabla);

            // Inicialización del controlador de la tabla para gestionar los datos y filtros
            controladorTabla.suscribir("tabla", (lista) => {
                const validado = validarListadoTabla(lista);
                if ( !validado.valido ) {
                    tbody.replaceChildren(validado.fila);
                    return;
                }

                const fragment = document.createDocumentFragment();

                let objetoRegistros = {};
                let contador = 0;
                let totalMonto = 0;
                let totalSaldo = 0;
                for (const item of lista) {
                    const registro = item.raw;
                    contador ++;
                    totalMonto += Math.round(parseFloat(registro.montototal || 0) * 100);
                    totalSaldo += Math.round(parseFloat(registro.saldo || 0) * 100);

                    const celdas = [
                        crearElemento("td", { class: "text-center", style: "width: 30px;" }, [contador]),
                        crearElemento("td", { class: "text-center", style: "width: 70px;" }, [columnaCheckboxTransPendientes({
                            vistaPrincipal: vistaRecibosPago,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                            tipoDocumento: "factura_venta_comercial",
                        })]),
                        crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fechaventa) || "-"]),
                        crearElemento("td", undefined, [registro.cliente || "-"]),
                        crearElemento("td", undefined, [registro.sucursal || "-"]),
                        crearElemento("td", undefined, [obtenerTipoVentaComercial(registro.tipoventa)]),
                        crearElemento("td", undefined, [registro.tipopago || "-"]),
                        crearElemento("td", undefined, [registro.nfactura || "-"]),
                        crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montototal)]),
                        crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.saldo)]),
                        crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.descuento)]),
                    ];

                    const fila = crearElemento("tr", undefined, [ ...celdas]);
                    fragment.appendChild(fila);
                }

                // Agregar fila de totales al final de la tabla
                const filaTotal = crearFilaTotalTabla({
                    columnasTexto: 8,
                    columnasFinal: 1,
                    valores: [totalMonto/100, totalSaldo/100]
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
                    .map(registro => {
                        const [anio, mes, dia] = (registro.fechaventa || "").split("-").map(Number);
                        return {
                            raw: registro,
                            fechaBusqueda: { anio, mes, dia },
                            fechaTexto: formatoFecha(registro.fechaventa) || "-",
                            textoBusqueda: [
                                registro.cliente,
                                registro.sucursal,
                                obtenerTipoVentaComercial(registro.tipoventa),
                                registro.tipopago,
                                registro.nfactura,
                                formatoDecimal(registro.montototal),
                                formatoDecimal(registro.saldo),
                                formatoDecimal(registro.descuento),
                            ].join("|").toLowerCase()
                        };
                    });
                controladorTabla.setDatosRegistro(normalizados);
            }

            // Manejar el listado en la tabla
            manejarListadoTabla({
                urlSolicitud: URL_LT,
                callbackCargarTabla: cargarContenidoTabla,
                contenedorAlertas: contenedorDeAlertas,
                cuerpoTabla: tbody,
            });

            ajustarAlturaTabla(divTabla);
        }
    });

    formularioTipoDocumento.requestSubmit();
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

// Crear un botón para mostrar la información más completa en un modal
function botonMostrarInformacion(vistaFacturasPago, arrInformacion, registro) {
    const icono = crearElemento("i", { class: "bi bi-info-circle" });
    const botonInfo = crearElemento("button", { class: "btn btn-info btn-sm", title: "Ver más información", type: "button" }, [icono]);
    botonInfo.addEventListener("click", (e) => {
        mostrarModalInformacion(vistaFacturasPago, arrInformacion, registro);
    });

    return botonInfo;
}

/**
 * Función: Muestra un modal con información detallada de un registro.
 * Descripción: Esta función crea y muestra un modal que contiene información detallada sobre un registro específico.
 *              La información a mostrar se define mediante un arreglo de objetos que especifican los nombres y llaves de los datos.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
function mostrarModalInformacion(vistaPrincipal, datosAMostrar, registro) {
    const [modal, cuerpoModal, cerrarModal] = modalRemovible({estiloModal: "width: 400px; min-width: 240px;"});

    const divInformacion = crearElemento("div", {style: "font-size: 0.7rem"});
    const nombre = crearElemento("div", {class: "fw-bold"}, ["Nombre:"]);
    const detalle = crearElemento("div", {class: ""}, ["Detalle dsfs fsdf sdf sdf"]);
    const hr = crearElemento("hr", {class: "my-1 border-secondary"});
    divInformacion.append(nombre, detalle, hr);

    // Agregar la información
    for (const obj of datosAMostrar) {
        const { nombre, llave } = obj;
        divInformacion.append(
            crearElemento("div", {class: "fw-bold"}, [`${nombre}:`]),
            crearElemento("div", undefined, [`${typeof(llave) === "function" ? llave(registro) : (registro[llave] ?? "-")}`]),
            crearElemento("hr", {class: "my-2"})
        );
    }

    const botonOk = crearElemento("button", {class: "btn btn-info mt-3", type: "button", "data-id": "__opcion-cierre-externo", style: "width: 100px;"}, "Cerrar");
    const divBtns = crearElemento("div", {class: "text-center"}, [botonOk]);
    const divContenedor = crearElemento("div", undefined, [divInformacion, divBtns]);
    cuerpoModal.appendChild(divContenedor);

    vistaPrincipal.appendChild(modal);
    botonOk.focus();
}

/**
 * Función: Crea una columna con un checkbox para seleccionar registros en una tabla.
 * Descripción: Esta función genera un elemento de entrada tipo checkbox que permite seleccionar o deseleccionar registros en una tabla.
 *              Al seleccionar un registro, se agrega a un objeto de registros seleccionados y se muestra un botón que abre un modal.
 *              Al deseleccionar, se elimina del objeto y se quita el botón si no hay registros seleccionados.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Crea una columna con un checkbox para seleccionar registros en una tabla.
 * @param {Object} datosVista
 * @param {HTMLElement} datosVista.vistaPrincipal
 * @param {HTMLElement} datosVista.contenedorDeAlertas
 * @param {Function} datosVista.cargarContenidoTabla
 * @param {Object} datosVista.registro
 * @param {HTMLElement} datosVista.divTabla
 * @param {Object} datosVista.objetoRegistros
 * @param {string} datosVista.URL_LT
 * @param {string} datosVista.tipoDocumento
 * @returns {HTMLElement}
 */
export function columnaCheckboxTransPendientes(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registro,
        divTabla,
        objetoRegistros,
        URL_LT,
        tipoDocumento,
    } = datosVista;

    const input = crearElemento("input", {type: "checkbox", class: "form-check-input border-primary"});

    input.addEventListener("change", (e) => {
        const divOpcionesExistentes = vistaPrincipal.querySelector("#opciondes_agrupar")

        if (!input.checked) {
            // Eliminar el registro del objeto de registros seleccionados
            delete objetoRegistros[registro.id];
            if (Object.keys(objetoRegistros).length === 0) {
                vistaPrincipal.removeChild(divOpcionesExistentes);
            }
            return;
        }
        // Agregar el registro al objeto de registros seleccionados
        objetoRegistros[registro.id] = registro;
        if (divOpcionesExistentes)  return;

        // Crear el botón para abrir el modal si no existe
        const botonAsientoOTransaccion = crearElemento("button", {class: "btn btn-info btn-sm"}, ["Asiento Modelo/Transacción"]);
        const divOpciones = crearElemento("div", {class: "d-flex justify-content-start mb-2", id: "opciondes_agrupar"}, [botonAsientoOTransaccion]);
        vistaPrincipal.insertBefore(divOpciones, divTabla);
        switch(tipoDocumento) {
            case "factura_cobro":
                accionBotonFacturaCobro({ botonAsientoOTransaccion, divOpciones, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, objetoRegistros, URL_LT});
                break;
            case "factura_pago":
                accionBotonFacturaCobro({ botonAsientoOTransaccion, divOpciones, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, objetoRegistros, URL_LT});
                break;
            case "recibo_cobro":
                accionBotonReciboCobro({ botonAsientoOTransaccion, divOpciones, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, objetoRegistros, URL_LT});
                break;
            case "recibo_pago":
                accionBotonReciboCobro({ botonAsientoOTransaccion, divOpciones, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, objetoRegistros, URL_LT});
                break;
            case "factura_venta_comercial":
                accionBotonFacturaComercial({ botonAsientoOTransaccion, divOpciones, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, objetoRegistros, URL_LT});
                break;
        }

    });

    return input;
}

/**
 * Función: Maneja la acción del botón para asignar un asiento o transacción a facturas de cobro o pago.
 * Descripción: Esta función agrega un evento al botón que, al ser clickeado, muestra un formulario modal para ingresar detalles del asiento o transacción.
 *              Al enviar el formulario, se recopilan los datos y se envían a la API para asignar las facturas seleccionadas al asiento o transacción.
 *              Después de una asignación exitosa, se actualiza la tabla y se muestra una alerta de éxito.
 * Fecha: 10 de enero de 2024
 * Autor: Joel Choque
 */
function accionBotonFacturaCobro(datos) {
    const {
        botonAsientoOTransaccion,
        divOpciones,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        objetoRegistros,
        URL_LT
    } = datos;

    botonAsientoOTransaccion.addEventListener("click", async (e) => {
        const empresa_id = getEmpresaId();
        const sucursal_id = getSucursalId();
        const URL = CT_URLAPI;

        // Obtener el formulario modal con los campos necesarios
        const { form, modal, cerrarModal, botonAsignar } = formularioModalAsientoOTransaccion();

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fnBotonInicial = botonEnCarga(botonAsignar);

            const datosFormulario = new FormData(form);
            const objFormulario = Object.fromEntries(datosFormulario.entries());

            if (objFormulario.fecha_transaccion && !await modalValidarFechaSegunGestion(objFormulario.fecha_transaccion, vistaPrincipal)) {
                fnBotonInicial();
                return;
            };

            // Preparar los datos de las facturas seleccionadas
            const datosFactura = [];
            for (const key in objetoRegistros) {
                const factura = {idfactura: objetoRegistros[key].id, monto: objetoRegistros[key].montofactura};
                datosFactura.push(factura);
            }

            // Preparar los datos adicionales para enviar
            const datosExtra = {
                ver: "asignar_asiento_A_factura",
                idempresa: empresa_id,
                idsucursal: sucursal_id,
                facturas:  datosFactura,
                fecha: objFormulario.fecha_transaccion ?? "",
                idtrans: objFormulario.id_transaccion ?? "",
                idasientotipo: objFormulario.id_asientotipo ?? "",
                glosa: objFormulario.glosa ?? "",
                cuenta: objFormulario.cuenta ?? "",
                tipo: objFormulario.tipo ?? "",
            }

            const enviado = async () => {
                // Actualizar la tabla con los datos actualizados
                const listaDeRegistros = await obtenerDatos(URL_LT);
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Factura asignada");
                divOpciones.remove();
                cerrarModal();
            }
            const error = (respuesta) => {
                if (modalManejarRespuestaError(vistaPrincipal, respuesta)) {
                    fnBotonInicial();
                    return;
                };
                alertaDeError(contenedorDeAlertas, "Ocurrio un error al asignar la factura");
                cerrarModal();
            }
            // Enviar los datos a la API
            enviarDatosOJson({
                datos: datosExtra,
                urlSolicitud: URL,
                callbackExito: enviado,
                callbackError: error,
                tipoJSON: true,
            });
        });

        vistaPrincipal.appendChild(modal);
    });
}
/** * Función: Maneja la acción del botón para asignar un asiento o transacción a recibos de cobro y pago.
 * Descripción: Esta función agrega un evento al botón que, al ser clickeado, muestra un formulario modal para ingresar detalles del asiento o transacción.
 *              Al enviar el formulario, se recopilan los datos y se envían a la API para asignar los recibos seleccionados al asiento o transacción .
 *              Después de una asignación exitosa, se actualiza la tabla y se muestra una alerta de éxito.
 * Fecha: 10 de enero de 2024
 * Autor: Joel Choque
 */
function accionBotonReciboCobro(datos) {
    const {
        botonAsientoOTransaccion,
        divOpciones,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        objetoRegistros,
        URL_LT
    } = datos;

    botonAsientoOTransaccion.addEventListener("click", async (e) => {
        const empresa_id = getEmpresaId();
        const sucursal_id = getSucursalId();
        const URL = CT_URLAPI;

        // Obtener el formulario modal con los campos necesarios
        const { form, modal, cerrarModal, botonAsignar } = formularioModalAsientoOTransaccion();

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fnBotonInicial = botonEnCarga(botonAsignar);

            const datosFormulario = new FormData(form);
            const objFormulario = Object.fromEntries(datosFormulario.entries());

            if (objFormulario.fecha_transaccion && !await modalValidarFechaSegunGestion(objFormulario.fecha_transaccion, vistaPrincipal)) {
                fnBotonInicial();
                return;
            }

            // Preparar los datos de los recibos seleccionados
            const datosRecibo = [];
            for (const key in objetoRegistros) {
                const recibo = {idrecibo: objetoRegistros[key].idrecibo, monto: objetoRegistros[key].monto};
                datosRecibo.push(recibo);
            }
            // Preparar los datos adicionales para enviar
            const fecha = obtenerFechaActual();
            const datosExtra = {
                ver: "asignar_asiento_A_recibos",
                idempresa: empresa_id,
                idsucursal: sucursal_id,
                // fecha: fecha,
                recibos:  datosRecibo,
                fecha: objFormulario.fecha_transaccion ?? "",
                idtrans: objFormulario.id_transaccion ?? "",
                idasientotipo: objFormulario.id_asientotipo ?? "",
                glosa: objFormulario.glosa ?? "",
                cuenta: objFormulario.cuenta ?? "",
                tipo: objFormulario.tipo ?? "",
            }

            const enviado = async () => {
                // Actualizar la tabla con los datos actualizados
                const listaDeRegistros = await obtenerDatos(URL_LT);
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Recibo asignado");
                divOpciones.remove();
                cerrarModal();
            }
            const error = (respuesta) => {
                if (modalManejarRespuestaError(vistaPrincipal, respuesta)) {
                    fnBotonInicial();
                    return;
                }
                alertaDeError(contenedorDeAlertas, "Ocurrio un error al asignar el recibo");
                cerrarModal();
            }
            // Enviar los datos a la API
            enviarDatosOJson({
                datos: datosExtra,
                urlSolicitud: URL,
                callbackExito: enviado,
                callbackError: error,
                tipoJSON: true,
            });
        });

        vistaPrincipal.appendChild(modal);
    });
}

/**
 * Función: Maneja la acción del botón para asignar un asiento o transacción a facturas de venta comercial.
 * Descripción: Esta función agrega un evento al botón que muestra un formulario modal para ingresar detalles del asiento o transacción.
 *              Al enviar el formulario, se recopilan los datos y se envían a la API para asignar las facturas seleccionadas al asiento o transacción.
 * Fecha: 05 de febrero de 2026
 * Autor: Joel Choque
 */
function accionBotonFacturaComercial(datos) {
    const {
        botonAsientoOTransaccion,
        divOpciones,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        objetoRegistros,
        URL_LT
    } = datos;

    botonAsientoOTransaccion.addEventListener("click", async (e) => {
        const empresa_id = getEmpresaId();
        const sucursal_id = getSucursalId();
        const usuario_id = getUsuarioId();
        const URL = CT_URLAPI;

        // Obtener el formulario modal con los campos necesarios
        const { form, modal, cerrarModal, botonAsignar } = formularioModalAsientoOTransaccion();

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fnBotonInicial = botonEnCarga(botonAsignar);

            const datosFormulario = new FormData(form);
            const objFormulario = Object.fromEntries(datosFormulario.entries());

            if (objFormulario.fecha_transaccion && !await modalValidarFechaSegunGestion(objFormulario.fecha_transaccion, vistaPrincipal)) {
                fnBotonInicial();
                return;
            };

            // Preparar los datos de las facturas seleccionadas
            const datosFactura = [];
            let montoFTotal = 0;
            let sumaMonto = 0;
            for (const key in objetoRegistros) {
                const factura = {idfactura: objetoRegistros[key].id, monto: objetoRegistros[key].montototal, saldo: objetoRegistros[key].saldo};
                datosFactura.push(factura);
                montoFTotal += Math.round(parseFloat(objetoRegistros[key].montototal || 0) * 100);
                sumaMonto += Math.round(parseFloat(objetoRegistros[key].saldo || 0) * 100);
            }

            // Preparar los datos adicionales para enviar
            const datosExtra = {

                ver: "cobro_asignacion_factura_comercial",
                facturas_comercial: JSON.stringify(datosFactura),
                cajasBancos: "",
                asiento_modelo: objFormulario.id_asientotipo ?? "",
                transaccion: objFormulario.id_transaccion ?? "",
                monto_total: montoFTotal / 100,
                monto_recibo: sumaMonto / 100,
                fecha: objFormulario.fecha_transaccion ?? "",
                empresa: empresa_id,
                sucursal: sucursal_id,
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                usuario: usuario_id,
                cuenta: objFormulario.cuenta ?? "",
                tipo: objFormulario.tipo ?? "",
                glosa: objFormulario.glosa ?? "",
            }

            const enviado = async () => {
                // Actualizar la tabla con los datos actualizados
                const listaDeRegistros = await obtenerDatos(URL_LT);
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Factura asignada");
                divOpciones.remove();
                cerrarModal();
            }
            const error = (respuesta) => {
                if (modalManejarRespuestaError(vistaPrincipal, respuesta)) {
                    fnBotonInicial();
                    return;
                };
                alertaDeError(contenedorDeAlertas, "Ocurrio un error al asignar la factura");
                cerrarModal();
            }
            // Enviar los datos a la API
            enviarDatosOJson({
                datos: datosExtra,
                urlSolicitud: URL,
                callbackExito: enviado,
                callbackError: error,
            });
        });

        vistaPrincipal.appendChild(modal);
    });
}