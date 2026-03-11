import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId, getUsuarioId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, cambiarVista, crearElemento, crearEstadoCajaBancos, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, InputBusqueda, manejarLlenadoCajaBancos, rellenarFacturaPagoDelQR, seccionDriverJS, seccionEncabezado, verificarOpcionCajaBanco } from "../../../funciones/Funciones.js";
import { modalFijo, modalManejarRespuestaError, modalValidarFechaSegunGestion } from "../../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar } from "../../../funciones/OpcionesBasicas.js";
import { botonAbrirScanner } from "../../../funciones/Scanner.js";
import { manejarEnvioFormulario, obtenerDatos, reiniciarFormulario } from "../../../funciones/Solicitudes.js";
import { columnaCheckboxTransPendientes } from "../../transacciones/Funcionalidades/PendientesDeRegistro.js";
import { formularioTribFacturaPago } from "../Formularios.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de facturas de pago.
 *              Permite registrar nuevas facturas, editar y eliminar facturas existentes, asignar facturas a asientos modelos o transacciones, y también ofrece la opción de llenar parte del formulario de registro escaneando un código QR.
 * Fecha: 16 de febrero de 2026
 * Autor: Joel Choque
 */
export function NuevaFactura(elementosFxC) {

    const {
        codigo,
        permisos,
        vistaFacturacionPago,
        vistaNuevaFactura,
        urlFacturacionPago,
        cargarTablaFacturacionPago,
    } = elementosFxC;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listafacturaapi_pagado/${EMPRESA_ID}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaRegistrar = crearElemento("div", { class: "d-none" });
    vistaNuevaFactura.append(vistaPrincipal, vistaRegistrar);

    // Crear la sección de cabecera de la vista.
    const regresar = async () => {
        const listaDeRegistros = await obtenerDatos(urlFacturacionPago);
        cargarTablaFacturacionPago(listaDeRegistros);
        cambiarVista(vistaNuevaFactura, vistaFacturacionPago)
        vistaNuevaFactura.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Facturas" }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Creación de formulario para la vista Registrar
    if (PUEDE_ESCRIBIR) {
        const modalRegistro = modalFormularioFacturaPago(
            vistaPrincipal,
            contenedorDeAlertas,
            URL_LT,
            cargarContenidoTabla
        );
        vistaPrincipal.appendChild(modalRegistro);
        const botonRegistrar =  elementoBoton({ texto: "Nuevo registro", icono: "plus-lg", id: "__btn-registro", callback: () => {
            modalRegistro.classList.remove("d-none");
        }})

        // Implementación de la opción para realizar Scanner
        const botonScanner = botonAbrirScanner({
            contenedor: vistaPrincipal,
            idLector: "qr-trib-factura-pago",
            callback: rellenarFacturaPagoDelQR({
                vistaPrincipal,
                contenidoFormulario: modalRegistro,
                prefijoId: "tribfacturapago",
            }),
        });

        // Opciones de la vista principal
        const opcionesBtns = divOpcionesVista([
            botonRegistrar,
            botonScanner,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    }

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
        "Opciones",
    ];

    // Si no tiene permisos ni para editar ni para eliminar, se remueve la columna de opciones
    if (!PUEDE_EDITAR && !PUEDE_ELIMINAR) {
        encabezadoTabla.pop();
    }

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

            const cobrado = registro.pagado === "1" ? "Por pagar" : ( registro.pagado === "2" ? "Pagado" : "-");
            const celdas = [
                crearElemento("td", { class: "text-center", style: "width: 70px;" }, [
                    (PUEDE_ESCRIBIR && PUEDE_EDITAR)
                        ? columnaCheckboxTransPendientes({
                            vistaPrincipal,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registro,
                            divTabla,
                            objetoRegistros,
                            URL_LT,
                            tipoDocumento: "factura_pago",
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
                crearElemento("td", undefined, [cobrado]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioTribFacturaPago(),
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Editar Factura de Pago",
                            },
                            camposAdicionales: {
                                ver: "crearsolofacturasapif5",
                                idfactura: registro.id,
                                clasefactura: "1",
                                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    fragmentOpciones.append(botonEditar, " ");
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}eliminarfactura/${registro.id}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                        },
                        vistaPrincipal
                    );
                    fragmentOpciones.append(botonEliminar, " ");
                }
                tdOpciones.appendChild(fragmentOpciones);
                celdas.push(tdOpciones);
            }

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }

    seccionDriverJS(
        [
            {
                popover: {
                    title: "Facturas de pago",
                    description: "En esta sección puedes gestionar las facturas de pago, tales como registrar y visualizar las facturas que no están asignadas a una transacción.",
                },
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='__btn-registro']",
                popover: {
                    title: "Agregar nueva factura",
                    description: "Abre un formulario para registrar una nueva factura de pago en el sistema.",
                    side: "left",
                    align: "start",
                },
            },
            {
                mainElement: vistaPrincipal,
                element: "[data-id='__lectorqr']",
                popover: {
                    title: "Leer QR",
                    description: "Permite escanear el QR de la factura y cargar automáticamente los datos existentes en el formulario de registro, para lo cual su equipo deberá contar con cámara y haber otorgado los permisos correspondientes.",
                },
            },
            {
                mainElement: divBuscar,
                element: "#__buscador",
                popover: {
                    title: "Buscar factura",
                    description: "Permite buscar facturas de pago considerando todas las columnas de la tabla.",
                },
            },
            {
                element: divTabla,
                popover: {
                    title: "Tabla de facturas",
                    description: "Muestra todas las facturas de pago registradas que no están asignadas a una transacción.",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Editar']",
                popover: {
                    title: "Editar factura",
                    description: "Abre un formulario para modificar los datos de la factura de pago seleccionada.",
                },
            },
            {
                mainElement: tabla,
                element: "button[title='Eliminar']",
                popover: {
                    title: "Eliminar factura",
                    description: "Permite eliminar el registro de la factura de pago seleccionada, previa confirmación.",
                },
            },
        ],
        vistaPrincipal
    );
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE LA VISTA
// =========================================================

/**
 * Función: Crea un modal con el formulario para registrar una factura de pago.
 * Descripción: Esta función genera un modal que contiene el formulario necesario para registrar una nueva factura de pago asociada a una transacción.
 *              Maneja la lógica de envío del formulario y la verificación de montos en Cajas y Bancos si corresponde.
 * Fecha: 13 de febrero de 2026
 * Autor: Joel Choque
 */
function modalFormularioFacturaPago(vistaPrincipal, contenedorDeAlertas, URL_LT, cargarContenidoTabla) {
    const [modal, cuerpoModal, cerrarModal] = modalFijo( { tituloModal: "Registro de Nueva Factura", estiloModal: "width: 100%; max-width: 1400px;" } );

    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const PREFIJO_ID = "tribfacturapago";
    const estadoCajaBancos = crearEstadoCajaBancos(vistaPrincipal, PREFIJO_ID); // Estado para manejar los datos de Cajas y Bancos
    // Funcion que se ejecuta al cancelar el registro.
    const cancelarRegistro = (evento, formulario) => {
        evento.preventDefault();
        reiniciarFormulario(formulario);
        estadoCajaBancos.limpiar();
        cerrarModal();
    }
    // Agregar el formulario al modal.
    const nuevoformulario = crearFormulario(formularioTribFacturaPago(), {
        opcionesParaBotones: {
            clasesEnviar: "btn btn-primary px-1 px-sm-4",
            nombreEnviar: "Guardar",
            callbackCancelar: vistaPrincipal ? cancelarRegistro : null,
        },
    });
    nuevoformulario.id = "form-registro"; // Asignar un ID al formulario para facilitar su manipulación, [ crearEstadoCajaBancos() lo requiere ]

    // Gestiona el llenado y la lógica del formulario de Cajas y Bancos, así como el manejo del modal de Cajas y Bancos.
    manejarLlenadoCajaBancos(nuevoformulario, vistaPrincipal, estadoCajaBancos, PREFIJO_ID);

    cuerpoModal.appendChild(nuevoformulario);

    // ACCIONES CAMPOS FORMULARIO
    const botonEnviar = nuevoformulario.querySelector("#btn-enviar-formulario")
    nuevoformulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fnBotonInicial = botonEnCarga(botonEnviar);

        // validar la fecha de transacción según la gestión
        const fechaTransaccion = nuevoformulario.querySelector(`#${PREFIJO_ID}-fechatrans`);
        if (fechaTransaccion?.value && !await modalValidarFechaSegunGestion(fechaTransaccion.value, vistaPrincipal)) {
            fnBotonInicial();
            return;
        }

        // Verificar que se haya asignado (si corresponde) el monto en Cajas y Bancos, y obtener los datos asignados.
        const esCorrecto = await verificarOpcionCajaBanco(vistaPrincipal, estadoCajaBancos, nuevoformulario, PREFIJO_ID);
        let idcajas_bancos = ""
        if (typeof(esCorrecto) === "string") {
            idcajas_bancos = esCorrecto;
        } else if (esCorrecto === false){
            fnBotonInicial();
            return;
        }

        // Funcion que se ejecuta al realizar el registro.
        const realizarRegistro = async () => {
            estadoCajaBancos.limpiar();
            const listaDeRegistros = await obtenerDatos(URL_LT);
            cargarContenidoTabla(listaDeRegistros);
            alertaDeExito(contenedorDeAlertas, "Solicitud realizada exitosamente");
            cerrarModal();
        }
        // Funcion que se ejecuta al no poder realizar el registro.
        const errorRegistro = (respuestaSolicitud) => {
            if (modalManejarRespuestaError(vistaPrincipal, respuestaSolicitud)) return;
            cerrarModal();
            alertaDeError(contenedorDeAlertas, "No se pudo realizar la solicitud");
        }


        // Envío de datos
        fnBotonInicial(); // Poner el botón a su estado oiginal, ya que manejarEnvioFormulario también controla el estado del botón.
        manejarEnvioFormulario({
            refFormulario: nuevoformulario,
            urlSolicitud: CT_URLAPI,
            camposAdicionales: {
                ver: "registrar_factura_pagos_tributario",
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                usuario: USUARIO_ID,
                empresa: EMPRESA_ID,
                sucursal: SUCURSAL_ID,
                cobrado: 0,
                clasefactura: 1,
                especificacion: 1,
                codigocontrol: 0,
                idcajas_bancos,
            },
            camposCondicionales: [
                { nombre: "asiento", valor: "" },
                { nombre: "trans", valor: "" },
                { nombre: "tipo", valor: "" },
                { nombre: "cuenta", valor: "" },
                { nombre: "fecha_transaccion", valor: "" },
            ],
            callbackExito: realizarRegistro,
            callbackError: errorRegistro
        });
    });

    return modal;
}
