import { crearFormulario, manejarSelect } from "../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, tablaResponsiva, validarListadoTabla } from "../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId } from "../../funciones/DatosAuxiliares.js";
import { botonEnCarga, crearElemento, formatoDecimal, formatoFecha, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../funciones/Funciones.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { crearBotonIconoPdfMake } from "../../funciones/VistaPDF.js";
import { pdfMakeReporteCuentasDetalleFactura, pdfMakeReporteCuentasDetalleRecibo } from "./Funcionalidades/ReportesTributario.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de documentos de cobro
 *              Permite registrar y editar documentos de cobro.
 * Fecha: 20 de junio de 2024
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaDocumentoCobro - Contenedor principal donde se renderiza la vista de documentos de cobro.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export function FacturasDeCuenta(permisos, vistaDocumentoCobro, datosVistaPrincipal) {
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const SUCURSAL_ID = getSucursalId();
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}facturas_perteneciente_a_cuenta/${EMPRESA_ID}`;

    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaContratosVencidos = crearElemento("div", { class: "d-none", "data-pane-id": "contratos-vencidos" });
    const vistaContratosCobrados = crearElemento("div", { class: "d-none", "data-pane-id": "contratos-cobrados" });
    vistaDocumentoCobro.append(vistaPrincipal, vistaContratosVencidos, vistaContratosCobrados);

    // Creación de elementos para la vista Principal
    const encabezadoVista = seccionEncabezado({titulo: "Reporte de Facturas por Cuenta"});
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    const [contenedorFiltros, formularioFiltros] = RFiltroYFecha(manejarTablasDocumentos);
    const contenidoTabla = crearElemento("div");
    vistaPrincipal.append(contenedorFiltros, contenidoTabla);

    // accionar submit del formulario de filtros
    formularioFiltros.dispatchEvent(new Event("submit"));

    function manejarTablasDocumentos(listaRegistros, tipoDocumento) {
        contenidoTabla.innerHTML = "";
        if (tipoDocumento === "factura") {
            const encabezadoTabla = [
                "N° Doc.",
                "Fecha Fact",
                "Trans N°",
                "Cuenta",
                "Monto",
                "Estado",
                "Tipo",
                "Origen",
                "Opciones"
            ];

            const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

            const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
            contenidoTabla.append(divBuscar, divTabla);

            // Manejar el listado en la tabla
            const validado = validarListadoTabla(listaRegistros);
            if ( !validado.valido ) {
                tbody.replaceChildren(validado.fila);
                return;
            }

            const fragment = document.createDocumentFragment();

            let totalPrecio = 0;
            for (const registro of listaRegistros) {
                totalPrecio += Math.round(parseFloat(registro.montofactura || 0) * 100);

                const celdas = [
                    crearElemento("td", undefined, [ registro.nfactura || "-" ]),
                    crearElemento("td", undefined, [ formatoFecha(registro.fecha) ]),
                    crearElemento("td", undefined, [ registro.nro_transaccion || "-" ]),
                    crearElemento("td", undefined, [ registro.nombre_cuenta || "-" ]),
                    crearElemento("td", { class: "text-end" }, [ formatoDecimal(registro.montofactura) ]),
                    crearElemento("td", undefined, [ registro.estado_factura|| "-" ]),
                    crearElemento("td", undefined, [ registro.tipo_factura || "-" ]),
                    crearElemento("td", undefined, [ registro.factura_de || "-" ]),
                ];

                const tdOpciones = crearElemento("td", { class: "text-nowrap" });

                // Botón para abir el reporte PDF del detalle de cobros/pagos de la factura
                const botonReporte = crearBotonIconoPdfMake({
                    contenedorModal: vistaPrincipal,
                    obtenerContenido: pdfMakeReporteCuentasDetalleFactura(`${URL}listar_comprobantes_de_factura/${registro.idfactura}`, registro),
                    tituloBoton: "Pagos/Cobros",
                });
                tdOpciones.append(botonReporte, " ");

                celdas.push(tdOpciones);
                const fila = crearElemento("tr", undefined, [ ...celdas]);
                fragment.appendChild(fila);
            }

            tbody.replaceChildren(fragment);
            ajustarAlturaTabla(divTabla);

        } else if (tipoDocumento === "recibo") {
            const encabezadoTabla = [
                "N° Doc.",
                "Fecha Recibo",
                "Trans N°",
                "Cuenta",
                "Monto",
                "Estado",
                "Tipo",
                "Opciones"
            ];

            const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

            const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
            contenidoTabla.append(divBuscar, divTabla);

            // Manejar el listado en la tabla
            const validado = validarListadoTabla(listaRegistros);
            if ( !validado.valido ) {
                tbody.replaceChildren(validado.fila);
                return;
            }

            const fragment = document.createDocumentFragment();

            let totalPrecio = 0;
            for (const registro of listaRegistros) {
                totalPrecio += Math.round(parseFloat(registro.monto || 0) * 100);

                const celdas = [
                    crearElemento("td", undefined, [ registro.nro_recibo || "-" ]),
                    crearElemento("td", undefined, [ formatoFecha(registro.fecha) ]),
                    crearElemento("td", undefined, [ registro.nro_transaccion || "-" ]),
                    crearElemento("td", undefined, [ registro.nombre_cuenta || "-" ]),
                    crearElemento("td", { class: "text-end" }, [ formatoDecimal(registro.monto) ]),
                    crearElemento("td", undefined, [ registro.estado_recibo || "-" ]),
                    crearElemento("td", undefined, [ registro.tipo_recibo || "-" ]),
                ];

                const tdOpciones = crearElemento("td", { class: "text-nowrap" });

                // Botón para abir el reporte PDF del detalle de cobros/pagos de la factura
                const botonReporte = crearBotonIconoPdfMake({
                    contenedorModal: vistaPrincipal,
                    obtenerContenido: pdfMakeReporteCuentasDetalleRecibo(`${URL}listar_comprobantes_de_recibo/${registro.idrecibo}`, registro),
                    tituloBoton: "Pagos/Cobros",
                });
                tdOpciones.append(botonReporte, " ");

                celdas.push(tdOpciones);
                const fila = crearElemento("tr", undefined, [ ...celdas]);
                fragment.appendChild(fila);
            }

            tbody.replaceChildren(fragment);
            ajustarAlturaTabla(divTabla);

        } else if (tipoDocumento === "cobro_pago") {
            const encabezadoTabla = [
                "N° Doc.",
                "Fecha Doc.",
                "Trans N°",
                "Cuenta",
                "Monto",
            ];

            const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);

            const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
            contenidoTabla.append(divBuscar, divTabla);

            // Manejar el listado en la tabla
            const validado = validarListadoTabla(listaRegistros);
            if ( !validado.valido ) {
                tbody.replaceChildren(validado.fila);
                return;
            }

            const fragment = document.createDocumentFragment();

            let totalPrecio = 0;
            for (const registro of listaRegistros) {
                totalPrecio += Math.round(parseFloat(registro.monto || 0) * 100);

                const celdas = [
                    crearElemento("td", undefined, [ registro.nro_comprobante || "-" ]),
                    crearElemento("td", undefined, [ formatoFecha(registro.fecha) ]),
                    crearElemento("td", undefined, [ registro.nro_transaccion || "-" ]),
                    crearElemento("td", undefined, [ registro.nombre_cuenta || "-" ]),
                    crearElemento("td", { class: "text-end" }, [ formatoDecimal(registro.monto) ]),
                ];

                const fila = crearElemento("tr", undefined, [ ...celdas]);
                fragment.appendChild(fila);
            }

            tbody.replaceChildren(fragment);

            ajustarAlturaTabla(divTabla);

        }
    }

    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            popover: {
                title: "Resportes de facturas por cuenta",
                description: "Vista principal para gestionar los documentos de cobro relacionados a las cuentas. Permite filtrar por tipo de documento, fecha, transacción y cuenta, así como visualizar el detalle de cobros/pagos asociados a cada factura o recibo.",
            },
        },
        {
            element: contenedorFiltros,
            popover: {
                title: "Filtros de búsqueda",
                description: "Permite filtrar los registros por tipo de documento, fecha, transacción y cuenta.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "#__buscador",
            popover: {
                title: "Buscar documento",
                description: "Permite buscar documentos considerando todos los campos disponibles.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: ".table-responsive",
            popover: {
                title: "Tabla de documentos",
                description: "Muestra todos los documentos registrados en el sistema, que no tienen saldo pendiente.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "table button[title='Detalle Cobros']",
            popover: {
                title: "Detalle Cobros",
                description: "Abre una ventana para ver los cobros del documento seleccionado.",
            },
        },

    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
}



export const RFiltroYFecha = (manejarTablasDocumentos) => {
    const EMPRESA_ID = getEmpresaId();

    const filtrarCuentaPorTransaccion = (valor, contenedor) => {
        const selectCuenta = nuevoformulario.querySelector("#cuentafactura-cuenta");

        if (!valor) {
            manejarSelect(selectCuenta, { urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas/${EMPRESA_ID}`, llavesOpciones: { valor: "id", detalle: ["numero", "plan"] } });
            return;
        }

        manejarSelect(selectCuenta, { urlSolicitud: `${CT_URLAPI}listadetalletransaccion/${valor}`, llavesOpciones: { valor: "id", detalle: ["numero", "plan"] } });
    }

/** @type {DatosInput[]}*/
    const formularioFiltros = [
        {
            id: "cuentafactura-tipo",
            label: "Tipo",
            forma: "select",
            opcionesPredefinidas: [
                { clave: "factura", valor: "Facturas" },
                { clave: "cobro_pago", valor: "Cobros/Pagos" },
                { clave: "recibo", valor: "Recibos" },
            ],
            nombre: "tipo",
            requerido: true,
            opcionPorDefecto: false,
        },
        {
            id: "cuentafactura-fechainicio",
            label: "Fecha Inicio",
            forma: "input",
            tipo: "date",
            valor: "fecha",
            nombre: "fecha_inicio",
        },
        {
            id: "cuentafactura-fechafin",
            label: "Fecha Fin",
            forma: "input",
            tipo: "date",
            valor: "fecha",
            nombre: "fecha_fin",
        },
        {
            id: "cuentafactura-transaccion",
            label: "Transacción",
            forma: "select",
            urlSolicitud: `${CT_URLAPI}listatransacciones/${EMPRESA_ID}`,
            llavesOpciones: { valor: "id", detalle: ["ntransaccion", "glosa"] },
            nombre: "transaccion",
            callbackInput: filtrarCuentaPorTransaccion,
        },
        {
            id: "cuentafactura-cuenta",
            label: "Cuenta",
            forma: "select",
            urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas/${EMPRESA_ID}`,
            llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
            nombre: "cuenta",
        },
    ]

    const nuevoformulario = crearFormulario(formularioFiltros, {
        opcionesParaBotones: {
            clasesEnviar: "btn btn-info px-1 px-sm-4",
            nombreEnviar: "Filtrar",
        },
    });

    nuevoformulario.classList.remove("g-3");
    nuevoformulario.classList.add("g-2");

    nuevoformulario.addEventListener("submit", async (e) => {
        const boton = nuevoformulario.querySelector("#btn-enviar-formulario");
        const fnBotonInicial = botonEnCarga(boton);
        e.preventDefault();
        const formData = new FormData(nuevoformulario);
        const datos = Object.fromEntries(formData.entries());

        const tipo = datos.tipo || "";
        const fecha_inicio = datos.fecha_inicio || "";
        const fecha_fin = datos.fecha_fin || "";
        const transaccion = datos.transaccion || "";
        const cuenta = datos.cuenta || "";

        let registros;
        if (tipo === "factura") {
            registros = await obtenerDatos(`${CT_URLAPI}facturas_perteneciente_a_cuenta/${transaccion || 0}/${cuenta || 0}/${fecha_inicio || 0}/${fecha_fin || 0}/${EMPRESA_ID}`);
        } else if (tipo === "cobro_pago") {
            registros = await obtenerDatos(`${CT_URLAPI}comprobantes_perteneciente_a_cuenta/${transaccion || 0}/${cuenta || 0}/${fecha_inicio || 0}/${fecha_fin || 0}/${EMPRESA_ID}`);
        } else if (tipo === "recibo") {
            registros = await obtenerDatos(`${CT_URLAPI}recibos_perteneciente_a_cuenta/${transaccion || 0}/${cuenta || 0}/${fecha_inicio || 0}/${fecha_fin || 0}/${EMPRESA_ID}`);
        }

        if (!registros) {
            fnBotonInicial();
            return;
        }
        manejarTablasDocumentos(registros, tipo);
        fnBotonInicial();

    });

    const div = crearElemento("div", { class: "mb-3" }, [nuevoformulario]);

    return [div, nuevoformulario];
}