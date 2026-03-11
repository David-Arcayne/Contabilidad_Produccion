import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, crearFiltrosTabla, crearGestorTabla, formatoDecimal, formatoFecha, seccionEncabezado } from "../../../funciones/Funciones.js";
import { filtroPersonalizadoComercial, obtenerTipoVentaComercial } from "../facturasComercial.js";
import { pdfMakeFacturasComercialAnuladas } from "./ReportesTributario.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de facturas comerciales anuladas.
 *              Permite visualizar una tabla con las facturas anuladas, junto con opciones de búsqueda y filtrado.
 * Fecha: 18 de febrero de 2026
 * Autor: Joel Choque
 */
export function FC_Anuladas({ permisos, vistaFacturasComercial, vistaFacturasAnuladas }) {

    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_factura_comercial_anuladas/${EMPRESA_ID}`;

    // Controlador de la tabla para gestionar los datos y filtros
    const controladorTabla = crearGestorTabla();

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaFacturasAnuladas.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = async () => {
        cambiarVista(vistaFacturasAnuladas, vistaFacturasComercial);
        vistaFacturasAnuladas.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Facturas Anuladas" }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "N°",
        "Fecha",
        "Cliente",
        "Sucursal",
        "Tipo-Venta",
        "N° Trans.",
        "Tipo-Pago",
        "N° Factura",
        "Monto",
        "Saldo",
        "Descuento",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

    // Filtro para mostrar las facturas según el tipo de pago seleccionado.
    const { divTipoPago, selectTipoPago, limpiarFiltros} = filtroPersonalizadoComercial(controladorTabla.setOtrosFiltros);
    // Crear los filtros de la tabla, incluyendo el filtro personalizado para el tipo de pago.
    const divFiltros = crearFiltrosTabla({
        obtenerContenidoReporte: pdfMakeFacturasComercialAnuladas(controladorTabla.getDatosOriginales),
        controladorTabla,
        contenedorPrincipal: vistaPrincipal,
        filtrosPersonalizados: {
            elementosFiltro: [
                { contenedor: divTipoPago, elemento: selectTipoPago }
            ],
            limpiar: limpiarFiltros
        }
    });
    vistaPrincipal.append(divFiltros, divTabla);

    // Inicialización del controlador de la tabla para gestionar los datos y filtros
    controladorTabla.suscribir("tabla", (lista) => {
        const validado = validarListadoTabla(lista);
        if (!validado.valido) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        let contador = 0;
        let totalMonto = 0;
        let totalSaldo = 0;
        for (const item of lista) {
            const registro = item.raw;
            contador++;
            totalMonto += Math.round(parseFloat(registro.montototal || 0) * 100);
            totalSaldo += Math.round(parseFloat(registro.saldo || 0) * 100);

            const celdas = [
                crearElemento("td", { class: "text-center" }, [contador]),
                crearElemento("td", { class: "text-end" }, [item.fechaTexto]),
                crearElemento("td", undefined, [registro.cliente || "-"]),
                crearElemento("td", undefined, [registro.sucursal || "-"]),
                crearElemento("td", undefined, [obtenerTipoVentaComercial(registro.tipoventa)]),
                crearElemento("td", undefined, [registro.codigotransaccion || "-"]),
                crearElemento("td", undefined, [registro.tipopago || "-"]),
                crearElemento("td", undefined, [registro.nfactura || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montototal)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.saldo)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.descuento)]),
            ];

            const fila = crearElemento("tr", undefined, celdas);
            fragment.appendChild(fila);
        }

        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 8,
            columnasFinal: 1,
            valores: [totalMonto / 100, totalSaldo / 100]
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
                    tipoPago: registro.tipopago?.toLowerCase() || "",
                    textoBusqueda: [
                        registro.fechaventa,
                        registro.cliente,
                        registro.sucursal,
                        obtenerTipoVentaComercial(registro.tipoventa),
                        registro.codigotransaccion,
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

    // Cargar los datos iniciales en la tabla al cargar la vista
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
        contenedorAlertas: contenedorDeAlertas,
        cuerpoTabla: tbody,
    });

    ajustarAlturaTabla(divTabla);
}