import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { formularioModalAsientoOTransaccion } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, cambiarVista, crearElemento, formatoDecimal, formatoFecha, InputBusqueda, obtenerFechaActual, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalManejarRespuestaError } from "../../../funciones/Modals.js";
import { enviarDatosOJson, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de facturas sin cuenta contable.
 *              Permite visualizar una tabla con las facturas que no tienen cuenta contable asignada, junto con opciones para seleccionar las facturas y asignarlas a una transacción y cuenta contable mediante un formulario modal.
 * Fecha: 09 de febrero de 2026
 * Autor: Joel Choque
 */
export function FacturasPagoSinCuenta(elementosFxC) {

    const {
        codigo,
        permisos,
        vistaFacturacionPago,
        vistaFacturasSinCuenta,
        urlFacturacionPago,
        cargarTablaFacturacionPago,
    } = elementosFxC;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_factura_pago_sin_cuentas/${EMPRESA_ID}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaFacturasSinCuenta.append(vistaPrincipal,);

    // Crear elementos para la vista Principal
    const regresar = async () => {
        const listaDeRegistros = await obtenerDatos(urlFacturacionPago);
        cargarTablaFacturacionPago(listaDeRegistros);
        cambiarVista(vistaFacturasSinCuenta, vistaFacturacionPago);
        vistaFacturasSinCuenta.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Facturas sin Cuenta" }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "Selección",
        "Fecha de Factura",
        "N° Factura",
        "N° Autorización",
        "Codigo control",
        "Concepto",
        "Monto",
        "Tasa cero",
        "Export",
        "N° Poliza",
        "Iceiecdhotros",
        "Descuento/Bonificación",
        "Especificación",
        "Proveedor",
        "Estado",
    ];

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

        let objetoRegistros = {};
        for (const registro of listaRegistros) {

            const estado = registro.pagado === "1" ? "Por pagar" : ( registro.pagado === "2" ? "Pagado" : "-");

            const celdas = [
                crearElemento("td", { class: "text-center" }, [
                    (PUEDE_EDITAR && PUEDE_ESCRIBIR)
                        ? columnaCheckbox({
                            vistaPrincipal,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                        })
                        : "-"
                ]),
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fecha) || "-"]),
                crearElemento("td", undefined, [registro.nfactura || "-"]),
                crearElemento("td", undefined, [registro.nautorizacion || "-"]),
                crearElemento("td", undefined, [registro.codigocontrol || "-"]),
                crearElemento("td", undefined, [registro.por_concepto_de || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montofactura)]),
                crearElemento("td", undefined, [registro.tasacero || "-"]),
                crearElemento("td", undefined, [registro.export || "-"]),
                crearElemento("td", undefined, [registro.npoliza || "-"]),
                crearElemento("td", undefined, [registro.ice || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.descuentobonificacion)]),
                crearElemento("td", undefined, [registro.espesificacion || "-"]),
                crearElemento("td", undefined, [registro.procli || "-"]),
                crearElemento("td", undefined, [estado]),
            ];

            const fila = crearElemento("tr", undefined, [ ...celdas]);
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
 * Función: Crea la columna con checkbox para selección de facturas
 * Descripción: Esta función genera una columna con un checkbox en cada fila de la tabla.
 *              Permite seleccionar múltiples facturas, y muestra un botón para asignar las facturas seleccionadas a una transacción y cuenta contable mediante un formulario modal.
 * Fecha: 09 de febrero de 2026
 * Autor: Joel Choque
 */
function columnaCheckbox(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registro,
        divTabla,
        objetoRegistros,
        URL_LT,
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
        const botonAsientoOTransaccion = crearElemento("button", {class: "btn btn-info btn-sm"}, ["Transacción / Cuenta"]);
        const divOpciones = crearElemento("div", {class: "d-flex justify-content-start mb-2", id: "opciondes_agrupar"}, [botonAsientoOTransaccion]);
        vistaPrincipal.insertBefore(divOpciones, divTabla);

        botonAsientoOTransaccion.addEventListener("click", async (e) => {
            const empresa_id = getEmpresaId();
            const sucursal_id = getSucursalId();
            const URL = CT_URLAPI;

            // Obtener el formulario modal con los campos necesarios
            const { form, modal, cerrarModal, botonAsignar } = formularioModalAsientoOTransaccion("fpsincuenta", "transaccion", "Asignar a Transacción y Cuenta");

            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const fnBotonInicial = botonEnCarga(botonAsignar);

                const datosFormulario = new FormData(form);
                const objFormulario = Object.fromEntries(datosFormulario.entries());

                // Preparar los datos de las facturas seleccionadas
                const datosFactura = [];
                for (const key in objetoRegistros) {
                    const factura = {idfactura: objetoRegistros[key].id, monto: objetoRegistros[key].montofactura};
                    datosFactura.push(factura);
                }

                // Preparar los datos adicionales para enviar
                const fecha = obtenerFechaActual();
                const datosExtra = {
                    ver: "asignar_facturas_A_cuentas",
                    idempresa: empresa_id,
                    idsucursal: sucursal_id,
                    facturas:  datosFactura,
                    idtrans: objFormulario.id_transaccion ?? "",
                    cuenta: objFormulario.cuenta ?? "",
                    sumar_reemplazar: objFormulario.tipo ?? "",
                    idasientotipo: "",
                    glosa: "",
                    fecha,
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
    });

    return input;
}