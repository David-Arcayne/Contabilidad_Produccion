import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, formatoDecimal, formatoFecha, InputBusquedaPlus, obtenerFechaActual, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de facturas de ventas (Comercial) de una transacción.
 * Fecha: 04 de febrero de 2026
 * Autor: Joel Choque
 */
export const FacturaVentaComercial = (datosVista) => {
    const {
        permisos,
        vistaDetalle,
        vistaTranComercialFacturaVenta,
        registroTransaccion,
    } = datosVista;

    const ES_EDITABLE = permisos.esEditable;
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listafactura_cobro_trans_comercial/${registroTransaccion.id}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaTranComercialFacturaVenta.append(vistaPrincipal);

    // Creación de elementos para la vista principal
    const regresar = () => {
        cambiarVista(vistaTranComercialFacturaVenta, vistaDetalle);
        vistaTranComercialFacturaVenta.innerHTML = "";
    }
    const encabezadoVista = seccionEncabezado({ titulo: "Comercial - Facturas de Venta"}, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "Desvincular",
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
    const divBuscar = InputBusquedaPlus(tabla, { fila: true, alineado: "fin" }, {colSumar: [6, 7], colTotal: [1,2]});
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

        let objetoRegistros = {};
        let contador = 0;
        let totalMonto = 0;
        let totalSaldo = 0;
        for (const registro of listaRegistros) {
            contador ++;
            totalMonto += Math.round(parseFloat(registro.montototal || 0) * 100);
            totalSaldo += Math.round(parseFloat(registro.saldo || 0) * 100);

            let tipoVenta = "-";
            if (registro.tipoventa === "0") {
                tipoVenta = "Comprobante";
            } else if (registro.tipoventa === "1") {
                tipoVenta = "Factura Compra Venta";
            } else if (registro.tipoventa === "2") {
                tipoVenta = "Alquileres";
            } else if (registro.tipoventa === "3") {
                tipoVenta = "Exportación";
            }

            const celdas = [
                crearElemento("td", { class: "text-center", style: "width: 70px;" }, [
                    ES_EDITABLE
                        ? columnaCheckboxDesvincular({
                            vistaPrincipal,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                            registroTransaccion,
                        })
                        : "-"
                ]),
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fechaventa) || "-"]),
                crearElemento("td", undefined, [registro.cliente || "-"]),
                crearElemento("td", undefined, [registro.sucursal || "-"]),
                crearElemento("td", undefined, [tipoVenta]),
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
            columnasTexto: 6,
            columnasFinal: 1,
            valores: [totalMonto/100, totalSaldo/100]
        });
        fragment.appendChild(filaTotal);

        tbody.replaceChildren(fragment);
    }


        // Configuración de ayudas visuales de la vista
    seccionDriverJS(
        [
            {
                popover: {
                    title: "Comercial - Facturas de Venta",
                    description: "Muestra las facturas de venta del módulo de Comercial registradas en la transacción seleccionada.",
                },
            },
            {
                mainElement: divBuscar,
                element: "#__buscador",
                popover: {
                    title: "Buscar registros",
                    description: "Permite buscar los registros considerando todas las columnas de la tabla.",
                },
            },
            {
                element: divTabla,
                popover: {
                    title: "Facturas de venta",
                    description: "Tabla en la que se muestran las facturas de venta vinculadas a la transacción.",
                },
            },
        ],
        vistaPrincipal
    );
    ajustarAlturaTabla(divTabla);
}



function columnaCheckboxDesvincular(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registro,
        divTabla,
        objetoRegistros,
        URL_LT,
        registroTransaccion,
    } = datosVista;

    const input = crearElemento("input", {type: "checkbox", class: "form-check-input border-primary"});

    input.addEventListener("change", (e) => {
        const divOpcionesExistentes = vistaPrincipal.querySelector("#opcion-desvincular")

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
        const botonAsientoOTransaccion = crearElemento("button", {class: "btn btn-outline-danger btn-sm"}, ["Desvincular"]);
        const divOpciones = crearElemento("div", {class: "d-flex justify-content-start mb-2", id: "opcion-desvincular"}, [botonAsientoOTransaccion]);
        vistaPrincipal.insertBefore(divOpciones, divTabla);

        botonAsientoOTransaccion.addEventListener("click", async (e) => {
            const empresa_id = getEmpresaId();
            const sucursal_id = getSucursalId();
            const URL = CT_URLAPI;

            // Obtener el formulario modal con los campos necesarios
            const desvincular = async () => {
                // Preparar los datos de las facturas seleccionadas
                const datosFactura = [];
                for (const key in objetoRegistros) {
                    const factura = {idfactura_comercial: objetoRegistros[key].id, monto: objetoRegistros[key].montototal};
                    datosFactura.push(factura);
                }

                // Datos para el envío
                const fecha = obtenerFechaActual();
                const datos = {
                    ver: "desvincular_facturas_comercial_de_transaccion",
                    idempresa: empresa_id,
                    idsucursal: sucursal_id,
                    fecha: fecha,
                    facturas_comercial: datosFactura,
                    idtrans: registroTransaccion.id,
                    idasientotipo: "",
                    glosa: "",
                }

                const enviado = async () => {
                    // Actualizar la tabla con los datos actualizados
                    const listaDeRegistros = await obtenerDatos(URL_LT);
                    cargarContenidoTabla(listaDeRegistros);
                    alertaDeExito(contenedorDeAlertas, "Desvinculación exitosa");
                    divOpciones.remove();
                }
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "Ocurrio un error");
                }
                // Enviar los datos a la API
                await enviarDatosOJson({
                    datos,
                    urlSolicitud: URL,
                    callbackExito: enviado,
                    callbackError: error,
                    tipoJSON: true,
                });
            };

            const modal = modalDeConfirmacion(desvincular, "¿Está seguro de desvincular estos documentos?");
            vistaPrincipal.appendChild(modal);
            modal.querySelector("[data-id='__btn-confirmar']").focus();
        });

    });

    return input;
}