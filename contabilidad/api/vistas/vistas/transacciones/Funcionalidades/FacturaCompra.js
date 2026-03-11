import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId, getUsuarioId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, cambiarVista, crearElemento, crearEstadoCajaBancos, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, InputBusquedaPlus, manejarLlenadoCajaBancos, obtenerFechaActual, rellenarFacturaPagoDelQR, seccionDriverJS, seccionEncabezado, verificarOpcionCajaBanco } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion, modalFijo } from "../../../funciones/Modals.js";
import { botonModalEditar } from "../../../funciones/OpcionesBasicas.js";
import { botonAbrirScanner } from "../../../funciones/Scanner.js";
import { enviarDatosOJson, obtenerDatos, reiniciarFormulario } from "../../../funciones/Solicitudes.js";
import { formularioTransaccionFacturaCompra, optnsPagar } from "../Formularios.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de facturas de compra de una transacción.
 * Fecha: 05 de diciembre de 2025
 * Autor: Joel Choque
 */
export const FacturaCompra = (datosVista) => {
    const {
        permisos,
        vistaDetalle,
        vistaTranFacturaCompra,
        registroTransaccion,
    } = datosVista;

    const ES_EDITABLE = permisos.esEditable;
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listafactura_pago_trans/${registroTransaccion.id}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaTranFacturaCompra.append(vistaPrincipal);

    // Creación de elementos para la vista principal
    const regresar = () => {
        cambiarVista(vistaTranFacturaCompra, vistaDetalle);
        vistaTranFacturaCompra.innerHTML = "";
    }
    const encabezadoVista = seccionEncabezado({ titulo: "Facturas de Compra"}, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Creación de formulario para la vista Registrar
    if (PUEDE_ESCRIBIR && ES_EDITABLE) {
        const modalRegistro = modalFormulariFacturaCompra(
            vistaPrincipal,
            contenedorDeAlertas,
            URL_LT,
            registroTransaccion,
            cargarContenidoTabla
        );
        vistaPrincipal.appendChild(modalRegistro);
        const botonRegistrar =  elementoBoton({ texto: "Nuevo registro", icono: "plus-lg", id: "__btn-registro", callback: () => {
            modalRegistro.classList.remove("d-none");
        }})

        // const contenedorScanner = crearElemento("div", undefined, [modalScanner]);

        // Implementación de la opción para realizar Scanner
        const botonScanner = botonAbrirScanner({
            contenedor: vistaPrincipal,
            idLector: "qr-trans-factura-compra",
            callback: rellenarFacturaPagoDelQR({
                vistaPrincipal,
                contenidoFormulario: modalRegistro,
                prefijoId: "transfacturacompra",
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
        "Desvincular",
        "Fecha",
        "Factura",
        "Proveedor",
        "Nit",
        "Monto",
        "Estado",
        "Opciones",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divBuscar = InputBusquedaPlus(tabla, { fila: true, alineado: "fin" }, {colSumar: [4], colTotal: [1]});
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
        let totalMonto = 0;
        for (const registro of listaRegistros) {
            totalMonto += Math.round(parseFloat(registro.montofactura) * 100);

            const nombreEstado = optnsPagar.find(opcion => opcion.clave == registro.pagado)?.valor || "-";
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
                crearElemento("td", undefined, [formatoFecha(registro.fecha) || "-"]),
                crearElemento("td", undefined, [registro.nfactura || "-"]),
                crearElemento("td", undefined, [registro.procli || "-"]),
                crearElemento("td", undefined, [registro.nit || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montofactura)]),
                crearElemento("td", undefined, [nombreEstado]),
            ];

            if ((PUEDE_EDITAR || PUEDE_ELIMINAR) && ES_EDITABLE) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                const fragmentOpciones = document.createDocumentFragment();
                if (PUEDE_EDITAR && registro.registro_desde === "transaccion_x_pagar") {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioTransaccionFacturaCompra,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Editar Factura de Compra",
                            },
                            camposAdicionales: {
                                ver: "crearfacturasf5",
                                idfactura: registro.id,
                                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    fragmentOpciones.append(botonEditar, " ");
                }

                tdOpciones.appendChild(fragmentOpciones);
                celdas.push(tdOpciones);
            }

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);


        }
        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 4,
            columnasFinal: 2,
            valores: [totalMonto/100]
        });
        fragment.appendChild(filaTotal);

        tbody.replaceChildren(fragment);
    }



    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Nuevo Registro",
                description: "Abre un formulario para realizar el registro manual de la factura de compra.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__lectorqr']",
            popover: {
                title: "Leer QR",
                description: "Permite escanear el QR de la factura y cargar automáticamente los datos existentes, para lo cual su equipo deberá contar con cámara ",
            },
        },
        {
            mainElement: divBuscar,
            element: "#__buscador",
            popover: {
                title: "Buscar factura",
                description: "Permite buscar los registros considerando todas las columnas de la tabla.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Facturas de compra",
                description: "Tabla en la que se muestran las facturas de compra registradas.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar",
                description: "Permite editar el registro seleccionado, siempre que este haya sido registrado desde esta transacción y no se haya pagado aún.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla);
}

// =========================================================
// FUNCIONES BOTONES DE LA VISTA
// =========================================================

/**
 * Función: Crea un modal con el formulario para registrar una factura de compra.
 * Descripción: Esta función genera un modal que contiene el formulario necesario para registrar una nueva factura de compra asociada a una transacción.
 *              Maneja la lógica de envío del formulario y la verificación de montos en Cajas y Bancos si corresponde.
 * Fecha: 05 de diciembre de 2025
 * Autor: Joel Choque
 */
function modalFormulariFacturaCompra(vistaPrincipal, contenedorDeAlertas, URL_LT, registroTransaccion, cargarContenidoTabla) {
    const [modal, cuerpoModal, cerrarModal] = modalFijo( { tituloModal: "Registro de Nueva Factura", estiloModal: "width: 100%; max-width: 1400px;" } );

    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const USUARIO_ID = getUsuarioId();
    const PREFIJO_ID = "transfacturacompra";
    const estadoCajaBancos = crearEstadoCajaBancos(vistaPrincipal, PREFIJO_ID ); // Estado para manejar los datos de Cajas y Bancos
    // Funcion que se ejecuta al cancelar el registro.
    const cancelarRegistro = (evento, formulario) => {
        evento.preventDefault();
        reiniciarFormulario(formulario);
        estadoCajaBancos.limpiar();
        cerrarModal();
    }
    // Agregar el formulario al modal.
    const nuevoformulario = crearFormulario(formularioTransaccionFacturaCompra, {
        opcionesParaBotones: {
            clasesEnviar: "btn btn-primary px-1 px-sm-4",
            nombreEnviar: "Guardar",
            callbackCancelar: vistaPrincipal ? cancelarRegistro : null,
        },
    });
    nuevoformulario.id = "form-registro";
    const botonEnviar = nuevoformulario.querySelector("#btn-enviar-formulario")
    // ACCIONES CAMPOS FORMULARIO
    manejarLlenadoCajaBancos(nuevoformulario, vistaPrincipal, estadoCajaBancos, PREFIJO_ID);
    cuerpoModal.appendChild(nuevoformulario);
    nuevoformulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const botonNormal = botonEnCarga(botonEnviar)

        const esCorrecto = await verificarOpcionCajaBanco(vistaPrincipal, estadoCajaBancos, nuevoformulario, PREFIJO_ID);
        let idcajas_bancos = ""

        if (typeof(esCorrecto) === "string") {
            idcajas_bancos = esCorrecto;
        } else if (esCorrecto === false){
            botonNormal();
            return;
        }

        // Funcion que se ejecuta al realizar el registro.
        const realizarRegistro = async () => {
            estadoCajaBancos.limpiar();
            const listaDeRegistros = await obtenerDatos(URL_LT);
            cargarContenidoTabla(listaDeRegistros);
            alertaDeExito(contenedorDeAlertas, "Solicitud realizada exitosamente");
            botonNormal();
            cerrarModal();
            reiniciarFormulario(nuevoformulario);
            const botonCajaBanco = nuevoformulario.querySelector(`#${PREFIJO_ID}-cajasbancos`);
            botonCajaBanco?.classList.remove("btn-primary");
            botonCajaBanco?.classList.add("btn-warning");
        }
        // Funcion que se ejecuta al no poder realizar el registro.
        const errorRegistro = () => {
            botonNormal();
            cerrarModal();
            alertaDeError(contenedorDeAlertas, "No se pudo realizar la solicitud");
        }
        // Envío de datos para registrar el precierre
        const datos = {
            ver: "registrar_factura_pagos_transaccion",
            zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            usuario: USUARIO_ID,
            empresa: EMPRESA_ID,
            sucursal: SUCURSAL_ID,
            trans: registroTransaccion.id,
            clasefactura: "1",
            especificacion: "1",
            codigocontrol: "0",
            idcajas_bancos
        }
        enviarDatosOJson({
            formulario: nuevoformulario,
            datos,
            urlSolicitud: CT_URLAPI,
            callbackExito: realizarRegistro,
            callbackError: errorRegistro,
        });
    });

    return modal;
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
                    const factura = {idfactura: objetoRegistros[key].id, monto: objetoRegistros[key].montofactura};
                    datosFactura.push(factura);
                }

                // Datos para el envío
                const fecha = obtenerFechaActual();
                const datos = {
                    ver: "desvincular_facturas_contabilidad_de_transaccion",
                    idempresa: empresa_id,
                    idsucursal: sucursal_id,
                    facturas_contabilidad: datosFactura,
                    idtrans: registroTransaccion.id,
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
