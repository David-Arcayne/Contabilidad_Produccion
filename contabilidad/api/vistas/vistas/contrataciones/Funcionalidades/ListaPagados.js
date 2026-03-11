import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getDivisaNombre, getDivisaSimbolo, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, formatoDecimal, formatoFecha, seccionEncabezado } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { crearBotonIconoPdfMake } from "../../../funciones/VistaPDF.js";
import { pdfMakeComprobanteGeneral } from "../../cajaYBancos/Funcionalidades/VP_Comprobante.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de contratos de pago pagados.
 * Fecha: 21 de febrero de 2026
 * Autor: Joel Choque
 */
export async function ListaPagados(datosVista) {
    const {
        permisos,
        vistaDocumentosDePago,
        vistaContratosPagados,
        urlDocsDePago,
        cargarContenidoTablaDocsDePago,
        registro
    } = datosVista;

    const URL = CT_URLAPI;
    const EMPRESA_ID = getEmpresaId();
    const URL_LT = `${URL}listar_recibo_facturas_otras_cuentas/${registro.idotras_cuentas}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaContratosPagados.append(vistaPrincipal);

    // Creación del encabezado de la vista
    const nombreDivisa = getDivisaNombre();
    const simboloDivisa = getDivisaSimbolo();
    const moneda = `(Expresado en ${nombreDivisa})`;
    const divNombre = crearElemento("div", undefined, [crearElemento("b", undefined, ["Proveedor:"]), ` ${registro.nombrep}`]);
    const spanMonto = crearElemento("span", { class: "fw-normal", id: "cdc-pagos-span-saldo" }, [formatoDecimal(registro.precio)])
    const divMonto = crearElemento("div", { class: "fw-bold" }, [`Monto ${simboloDivisa}: `, spanMonto]);
    const divInicio = crearElemento("div", undefined, [divNombre, divMonto]);
    const divFinal = crearElemento("div", { class: "text-end" });
    const divColumnas = crearElemento("div", { class: "d-flex justify-content-between align-items-start mt-2" }, [divInicio, divFinal]);
    const regresar = async () => {
        const listaDeRegistros = await obtenerDatos(urlDocsDePago);
        cargarContenidoTablaDocsDePago(listaDeRegistros);
        cambiarVista(vistaContratosPagados, vistaDocumentosDePago)
        vistaContratosPagados.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado(
        { titulo: "Detalle de Pagos", textoInformacion: moneda, elementoAdicional: divColumnas  },
        { callback: regresar }
    );
    vistaPrincipal.appendChild(encabezadoVista);

    const datoGA = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);
    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento(
            "span",
            { class: "text-secondary" },
            [`${datoGA.nombre} (${formatoFecha(datoGA.fechaini)} a ${formatoFecha(datoGA.fechafin)})`]
        );
        const textGA = crearElemento("div", { style: "font-size: 14px;" }, ["Gestión Activa: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-end" }, [textGA])
        divFinal.appendChild(gestionActiva);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        vistaPrincipal.appendChild(h1);
        return;
    }

    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    const encabezadoTabla = [
        "Fecha",
        "N° Doc.",
        "N° Trans.",
        "Proveedor",
        "Concepto",
        "Monto",
        "Tipo",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divFiltros = crearFiltrosTabla({
        controladorTabla,
        contenedorPrincipal: vistaPrincipal,
        filtroFecha: false,
    });
    vistaPrincipal.append(divFiltros, divTabla);

    // Inicialización del controlador de la tabla para gestionar los datos y filtros
    controladorTabla.suscribir("tabla", (lista) => {
        const validado = validarListadoTabla(lista);
        if ( !validado.valido ) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        let totalMonto = 0;
        for (const item of lista) {
            const registro = item.raw;
            totalMonto += Math.round(parseFloat(registro.monto || 0) * 100);

            const celdas = [
                crearElemento("td", undefined, [item.fechaTexto]),
                crearElemento("td", undefined, [registro.nro_documento || "-"]),
                crearElemento("td", undefined, [registro.codigotransaccion || "-"]),
                crearElemento("td", undefined, [registro.cliente_proveedor || "-"]),
                crearElemento("td", undefined, [registro.concepto || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                crearElemento("td", undefined, [registro.tipo || "-"]),
            ];

            const tdOpciones = crearElemento("td", { class: "text-nowrap" });

            if (registro.idcomprobante) {
                // Crear botón abrir la vista previa del comprobante
                const botonComprobante = botonVerComprobante(registro, vistaPrincipal);
                tdOpciones.appendChild(botonComprobante);
            }

            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 5,
            columnasFinal: 2,
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
                // const [anio, mes, dia] = (registro.fecha || "").split("-").map(Number);
                const fechaTexto = formatoFecha(registro.fecha);
                return {
                    raw: registro,
                    // fechaBusqueda: { anio, mes, dia },
                    fechaTexto: fechaTexto || "-",
                    textoBusqueda: [
                        fechaTexto,
                        registro.nro_documento,
                        registro.codigotransaccion,
                        registro.cliente_proveedor,
                        registro.concepto,
                        formatoDecimal(registro.monto),
                        registro.tipo,
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

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea un botón para ver el comprobante.
 * Descripción: Esta función genera un botón que, al ser presionado, muestra una vista previa del comprobante asociado al registro proporcionado.
 * Fecha: 21 de febrero de 2026
 * Autor: Joel Choque
 */
function botonVerComprobante (registro, contenedorModal) {
    const URL = CT_URLAPI;
    if (registro.tipo === "factura") {
        return crearBotonIconoPdfMake({
            contenedorModal,
            obtenerContenido: pdfMakeComprobanteGeneral(`${URL}listar_comprobantes_de_factura_pago/${registro.idcomprobante}`, "factura", "pago"),
            tituloBoton: "Comprobante",
        });
    }
    return crearBotonIconoPdfMake({
        contenedorModal,
        obtenerContenido: pdfMakeComprobanteGeneral(`${URL}listar_comprobantes_de_recibo_pago/${registro.idcomprobante}`, "recibo", "pago"),
        tituloBoton: "Comprobante",
    });
}