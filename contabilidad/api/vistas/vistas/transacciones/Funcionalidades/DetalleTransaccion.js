import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { campoCheckbox, campoInputGroup, campoSelect, campoSelectGroup, manejarSelect, selectEnEspera } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId, getUsuarioId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, cambiarVista, contenidoDeCargaBtn, crearElemento, crearFiltrosTabla, crearGestorTabla, divOpcionesVista, elementoBoton, formatoDecimal, formatoFecha, mostrarJerarquiaPlanDeCuentas, obtenerFechaActual, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion, modalDeInformacion, modalRemovible, salirConEsc } from "../../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar, botonModalRegistro, modalFormularioEditar } from "../../../funciones/OpcionesBasicas.js";
import { enviarDatosOJson, obtenerDatos, reiniciarFormulario, verificarErroresNativosDeInputs } from "../../../funciones/Solicitudes.js";
import { agregarImpuestoCalculado, formularioPorAsientoModelo, formularioTransaccionAsientoContable } from "../Formularios.js";
import { FacturaCompra } from "./FacturaCompra.js";
import { FacturaVenta } from "./FacturaVenta.js";
import { FacturaVentaComercial } from "./FacturaVentaComercial.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión del detalle de una transacción
 *              Permite registrar, editar, eliminar cuentas del detalle y también gestionar facturas de compra y venta vinculadas.
 * Fecha: 05 de febrero de 2026
 * Autor: Joel Choque
 */
export const DetalleTransaccion = (datosVista) => {
    const {
        permisos,
        vistaTransaccion,
        vistaDetalle,
        registroTransaccion,
        elementoTd
    } = datosVista;

    // Obtener el elemento del botón consolidar para mostrar u ocultar dependiendo si el asiento cuadra o no.
    const trDeTransaccion = elementoTd.closest("tr");
    const botonConsolidar = trDeTransaccion.querySelector("button[title='Consolidar']") || trDeTransaccion.querySelector("button[title='Desconsolidar']");

    const ES_EDITABLE = registroTransaccion.estado === "10" || (registroTransaccion.estado === "1" && registroTransaccion.consolidar === "1" );
    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listadetalletransaccion/${registroTransaccion.id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaTranFacturaVenta = crearElemento("div", { class: "d-none", "data-pane-id": "trans-factura-venta"});
    const vistaTranFacturaCompra = crearElemento("div", {class: "d-none", "data-pane-id": "trans-factura-compra"});
    const vistaTranComercialFacturaVenta = crearElemento("div", { class: "d-none", "data-pane-id": "trans-comercial-factura-venta"});

    vistaDetalle.append(vistaPrincipal, vistaTranFacturaVenta, vistaTranFacturaCompra, vistaTranComercialFacturaVenta);
    cambiarVista(vistaTransaccion, vistaDetalle);

    // Creación de elementos para la vista principal
    const spanNroTrans = crearElemento("span", { class: "fw-bold" }, [`N° Transacción: `]);
    const divNroTrans = crearElemento("div", undefined, [spanNroTrans, registroTransaccion.ntransaccion]);
    const spanFecha = crearElemento("span", { class: "fw-bold" }, [`Fecha: `]);
    const divFecha = crearElemento("div", undefined, [spanFecha, formatoFecha(registroTransaccion.fecha)]);
    const spanTipo = crearElemento("span", { class: "fw-bold" }, [`Tipo: `]);
    const divTipo = crearElemento("div", undefined, [spanTipo, registroTransaccion.ttransaccion ?? "-"]);
    const spanGlosa = crearElemento("span", { class: "fw-bold" }, [`Glosa: `]);
    const divGlosa = crearElemento("div", undefined, [spanGlosa, registroTransaccion.glosa]);
    const divInformacion = crearElemento("div", { class: "pb-2" }, [divNroTrans, divFecha, divTipo, divGlosa]);
    const regresar = () => {
        cambiarVista(vistaDetalle, vistaTransaccion);
        vistaDetalle.innerHTML = "";
    }
    const encabezadoVista = seccionEncabezado(
        { titulo: "Creación Asiento Contable", elementoAdicional: divInformacion },
        { callback: regresar }
    );
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    // Select para elegir abrir las vistas de facturas de compra o venta
    const [selectTipoFacturas, divTipoFacturas] = campoSelectGroup(
        { atributos: { id: "tr-ac-tipofacturas", name: "tipo_facturas", required: true } },
        { contenido: "Añadir Facturas" }
    )
    selectTipoFacturas.innerHTML = `
        <option value="">--Elija una opción --</option>
        <option value="1">Compras</option>
        <option value="2">Ventas</option>
        <option value="3">Ventas Comercial</option>`;
    const permisosTransaccion = { esEditable: ES_EDITABLE, ...permisos}
    selectTipoFacturas.addEventListener("change", (e) => {
        if (e.target.value === "1") {
            cambiarVista(vistaPrincipal, vistaTranFacturaCompra)
            FacturaCompra({vistaDetalle: vistaPrincipal, vistaTranFacturaCompra, permisos: permisosTransaccion, registroTransaccion});
        } else if (e.target.value === "2") {
            cambiarVista(vistaPrincipal, vistaTranFacturaVenta)
            FacturaVenta({vistaDetalle: vistaPrincipal, vistaTranFacturaVenta, permisos: permisosTransaccion, registroTransaccion});
        } else if (e.target.value === "3") {
            cambiarVista(vistaPrincipal, vistaTranComercialFacturaVenta)
            FacturaVentaComercial({vistaDetalle: vistaPrincipal, vistaTranComercialFacturaVenta, permisos: permisosTransaccion, registroTransaccion});
        }
        selectTipoFacturas.value = "";
    });

    let arrayOpcionesBtn = [];
    if (PUEDE_ESCRIBIR && ES_EDITABLE) {
        // Creación de formulario para registrar nueva cuenta por asiento modelo
        const botonRegistrar = botonModalRegistro(
            {
                contenedorDeAlertas,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioPorAsientoModelo,
                cargarContenidoTabla,
                configuracionModal: {
                    tituloModal: "Registro por Asiento Modelo",
                    estiloModal: "width: 100%; max-width: 800px;"
                },
                configuraciones: {
                    configuracionBotones:{
                        nombreEnviar: "Registrar",
                    }
                },
                camposAdicionales: {
                    ver: "detalletransaccion",
                    empresa: EMPRESA_ID,
                    sucursal: SUCURSAL_ID,
                    trans: registroTransaccion.id,
                },
            },
            vistaPrincipal
        );
        // Botón para abrir modal de nuevo registro mediante calculo base
        const botonCalcular = elementoBoton({
            texto: "Calcular",
            icono: "calculator",
            id: "tr-ac-btn-calcular",
            callback:() => realizarCalculoBase({
                vistaPrincipal,
                contenedorDeAlertas,
                URL_LT,
                montoInicial:inputMonto,
                registroTransaccion,
                cargarContenidoTabla
            })
        });

        arrayOpcionesBtn.push(botonRegistrar, botonCalcular);
    }
    arrayOpcionesBtn.push(divTipoFacturas);
    // Opciones de la vista principal
    const opcionesBtns = divOpcionesVista(arrayOpcionesBtn);
    vistaPrincipal.appendChild(opcionesBtns);

    // Campo donde se ingresa el monto para los cálculos y registros automáticos
    const [inputMonto, divMonto] = campoInputGroup(
        { atributos: { type: "number", step: "0.01", id: "tr-ac-input-monto", name: "monto" } },
        { contenido: "Monto" }
    )
    const contenidoMonto = crearElemento("div", {class: "row pb-2"}, [divMonto]);
    vistaPrincipal.appendChild(contenidoMonto);
    inputMonto.addEventListener("input", (e) => {
        // Limitar a dos decimales
        const valor = inputMonto.value;
        if (valor.includes(".")) {
            const [entero, decimal] = valor.split(".");
            if (decimal.length > 2) {
                inputMonto.value = entero + "." + decimal.slice(0, 2);
            }
        }
    });

    const encabezadoTabla = [
        "Código",
        "Cuenta contable",
        "Debe",
        "Haber",
        "Nota",
        "Opciones",
    ];

    const [divTabla, tabla, [tbodyRegistro, tbody]] = tablaResponsiva(encabezadoTabla, {cuerpo: 2, cuerpoPrincipal: 1});


    if (PUEDE_ESCRIBIR && ES_EDITABLE) {
        // Función para crear la fila de registro de nueva cuenta
        async function cargarFilaRegistro () {
            const impuestos = await obtenerDatos(`${URL}impuestolista/${EMPRESA_ID}`);

            const filaRegistro = crearElemento("tr");
            // Crear campos para el registro de una nueva cuenta
            const selectCuenta = crearElemento("select", { class: "form-select", id: "filaasientocontable-cuenta", required: true });
            manejarSelect(
                selectCuenta,
                {
                    urlSolicitud: `${URL}lista_plande_subcuentas/${EMPRESA_ID}`,
                    llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
                    panelDetalle: mostrarJerarquiaPlanDeCuentas,
                    callbackInput: agregarImpuestoCalculado("filaasientocontable")
                },
                undefined,
                filaRegistro
            );
            const inputDebe = crearElemento("input", { type: "number", step: "0.01", id:"filaasientocontable-debe", class: "form-control", value: 0, onkeydown: "return event.key !== 'e' && event.key !== 'E'", required: true, "data-default": "0" });
            const divDebe = crearElemento("div", { class: "d-flex gap-1" }, [inputDebe, botonCalcularMontoImpuesto({inputMonto,impuestos, vistaPrincipal})]);
            const inputHaber = crearElemento("input", { type: "number", step: "0.01", id:"filaasientocontable-haber", class: "form-control", value: 0, onkeydown: "return event.key !== 'e' && event.key !== 'E'", required: true, "data-default": "0" });
            const divHaber = crearElemento("div", { class: "d-flex gap-1" }, [inputHaber, botonCalcularMontoImpuesto({inputMonto,impuestos, vistaPrincipal})]);
            const inputNota = crearElemento("textarea", { id:"filaasientocontable-nota", class: "form-control", value: "", rows: 1 });

            const textoRegistrar = "Registrar";
            const iconoRegistrar = crearElemento("i", { class: "bi bi-plus-lg pe-1" });
            const botonRegistrar = crearElemento("button", { class: "btn btn-primary text-nowrap" }, [iconoRegistrar, textoRegistrar]);

            const campos = [selectCuenta, inputDebe, inputHaber, inputNota];
            // Preparación de datos para el envío al registrar
            botonRegistrar.addEventListener("click", async (e) => {
                e.preventDefault();
                botonRegistrar.disabled = true;
                botonRegistrar.innerHTML = contenidoDeCargaBtn(textoRegistrar);
                if (!verificarErroresNativosDeInputs(campos)){
                    botonRegistrar.disabled = false;
                    botonRegistrar.innerHTML = `${iconoRegistrar.outerHTML} ${textoRegistrar}`;
                    return;
                }
                const accionEnviar = async() => {
                    reiniciarFormulario(campos);
                    // Actualizar la tabla con los nuevos datos
                    const listaDeRegistros = await obtenerDatos(URL_LT);
                    alertaDeExito(contenedorDeAlertas, "Registro de cuenta exitoso");
                    cargarContenidoTabla(listaDeRegistros)
                    botonRegistrar.disabled = false;
                    botonRegistrar.innerHTML = `${iconoRegistrar.outerHTML} ${textoRegistrar}`;
                };
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "Error al registrar la cuenta");
                    botonRegistrar.disabled = false;
                    botonRegistrar.innerHTML = `${iconoRegistrar.outerHTML} ${textoRegistrar}`;
                };
                const advertencia = (respuesta) => {
                    alertaDeAdvertencia(contenedorDeAlertas, respuesta[1]);
                    botonRegistrar.disabled = false;
                    botonRegistrar.innerHTML = `${iconoRegistrar.outerHTML} ${textoRegistrar}`;
                };
                // Preparación de datos para el envío
                const datos = {
                    ver: "detalletransaccionnormal",
                    empresa: EMPRESA_ID,
                    sucursal: SUCURSAL_ID,
                    trans: registroTransaccion.id,
                    iddetalletransaccion: 0,
                    plandecuenta: selectCuenta.value,
                    debe: inputDebe.value,
                    haber: inputHaber.value,
                    nota: inputNota.value,
                }
                // Envío de datos para registrar la cuenta
                enviarDatosOJson({
                    datos: datos,
                    urlSolicitud: URL,
                    callbackExito: accionEnviar,
                    callbackError: error,
                    callbackAdvertencia: advertencia
                });
            });
            // Llenar una fila con los campos de registro
            filaRegistro.append(
                crearElemento("td", undefined, ["-"]),
                crearElemento("td", { style: "width: 340px;min-width: 340px; max-width: 340px;" }, [selectCuenta]),
                crearElemento("td", { style: "min-width: 130px;" }, [divDebe]),
                crearElemento("td", { style: "min-width: 130px;" }, [divHaber]),
                crearElemento("td", { style: "min-width: 250px;" }, [inputNota]),
                crearElemento("td", undefined, [botonRegistrar]),
            );
            tbodyRegistro.appendChild(filaRegistro);
        }
        cargarFilaRegistro();
    }
    vistaPrincipal.append(divTabla);

    // Manejar el listado en la tabla
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
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

        const montoInt = Number(Number(inputMonto.value).toFixed(2));
        let totalDebe = 0;
        let totalHaber = 0;
        for (const registro of listaRegistros) {
            if (!(montoInt > 0)) inputMonto.value = Number(registro.monto_ini).toFixed(2);

            totalDebe += Math.round(parseFloat(registro.debe || 0) * 100);
            totalHaber += Math.round(parseFloat(registro.haber || 0) * 100);

            const celdas = [
                crearElemento("td", undefined, [registro.numero || "-"]),
                crearElemento("td", { style: "width: 340px;min-width: 340px; max-width: 340px;" }, [
                    crearElemento("div", {class: "fw-bold"}, [registro.cuenta_padre ? registro.cuenta_padre : ""]),
                    crearElemento("div", undefined, [registro.plan || "-"])
                ]),
                crearElemento("td", { class: "text-end", style: "min-width: 130px;" }, [formatoDecimal(registro.debe)]),
                crearElemento("td", { class: "text-end", style: "min-width: 130px;" }, [formatoDecimal(registro.haber)]),
                crearElemento("td", { class: "min-width: 250px"}, [registro.nota || "-"]),
            ];


            const tdOpciones = crearElemento("td", { class: "text-nowrap" });
            const menuAgregar = [];
            const menuVer = [];

            if ((PUEDE_EDITAR || PUEDE_ELIMINAR || PUEDE_ESCRIBIR) && ES_EDITABLE) {

                if (PUEDE_ESCRIBIR) {
                    // Opción para insertar una nueva cuenta después de la cuenta actual
                    const botonInsertar = botonInsertarCuenta(() => {
                        const modal = modalFormularioEditar({ // se reutiliza la función de editar para crear un nuevo registro
                            contenedorDeAlertas,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            camposDeFormulario: formularioTransaccionAsientoContable,
                            cargarContenidoTabla,
                            configuracionModal: {
                                tituloModal: "Insertar Cuenta",
                            },
                            configuraciones: {
                                configuracionBotones:{
                                    nombreEnviar: "Insertar",
                                    clasesEnviar: "btn btn-info",
                                },
                                mensajeExito: "Registro insertado exitosamente",
                                mensajeError: "Error al insertar el registro",
                            },
                            camposAdicionales: {
                                ver: "detalletransaccionnormal",
                                trans: registroTransaccion.id,
                                empresa: EMPRESA_ID,
                                sucursal: SUCURSAL_ID,
                                iddetalletransaccion: registro.id,
                            },
                        });
                        vistaPrincipal.appendChild(modal);
                    });
                    tdOpciones.append(botonInsertar, " ");

                    // Opción para crear una factura relacionada a la cuenta
                    const botonCrearFactura = agregarFacturaACuenta({
                        URL,
                        URL_LT,
                        vistaPrincipal,
                        contenedorDeAlertas,
                        cargarContenidoTabla,
                        registroTransaccion,
                        registro,
                    });
                    // Opción para crear un documento de cobro/pago relacionado a la cuenta
                    const botonCrearDocCobroPago = agregarCobroPagoACuenta({
                        URL,
                        URL_LT,
                        vistaPrincipal,
                        contenedorDeAlertas,
                        cargarContenidoTabla,
                        registroTransaccion,
                        registro,
                    });
                    // Opción para crear un recibo relacionado a la cuenta
                    const botonAgregarRecibo = agregarReciboACuenta({
                        URL,
                        URL_LT,
                        vistaPrincipal,
                        contenedorDeAlertas,
                        cargarContenidoTabla,
                        registroTransaccion,
                        registro,
                    });
                    const botonAgregarFComercial = agregarFactComACuenta({
                        URL,
                        URL_LT,
                        vistaPrincipal,
                        contenedorDeAlertas,
                        cargarContenidoTabla,
                        registroTransaccion,
                        registro,
                    });
                    menuAgregar.push(
                        { texto: "Factura", callback: botonCrearFactura },
                        { texto: "Cobro/Pago", callback: botonCrearDocCobroPago },
                        { texto: "Recibo", callback: botonAgregarRecibo },
                        { texto: "Factura (Comercial)", callback: botonAgregarFComercial },
                    );
                }
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioTransaccionAsientoContable,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Cuenta",
                            },
                            camposAdicionales: {
                                ver: "detalletransaccionnormalf5",
                                trans: registroTransaccion.id,
                                iddetalle: registro.id,
                            },
                            datosRegistro: registro,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    tdOpciones.append(botonEditar, " ");
                }
                if (PUEDE_ELIMINAR) {
                    // Crear botón eliminar con modal de confirmación
                    const botonEliminar = botonModalEliminar(
                        {
                            URL: `${URL}eliminardetalle/${registro.id}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                            URL_LISTAR: URL_LT,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    tdOpciones.append(botonEliminar, " ");
                }

            }

            // Opciones para los documentos agregados a la cuenta
            const verFacturas = verFacturasDeCuenta(vistaPrincipal, registro, registroTransaccion, permisosTransaccion);
            const verCobrosPagos = verCobrosPagosDeCuenta(vistaPrincipal, registro, registroTransaccion, permisosTransaccion);
            const verRecibos = verRecibosDeCuenta(vistaPrincipal, registro, registroTransaccion, permisosTransaccion);
            const verFComercial = verFacturasComercial(vistaPrincipal, registro, registroTransaccion, permisosTransaccion);
            menuVer.push(
                { texto: "Facturas", callback: verFacturas },
                { texto: "Cobros/Pagos", callback: verCobrosPagos },
                { texto: "Recibos", callback: verRecibos },
                { texto: "Facturas (Comercial)", callback: verFComercial },
            );

            const menu = [{
                texto: "Ver",
                callback: verVinculacionesDeCuenta(vistaPrincipal, registro, registroTransaccion, permisosTransaccion),
            }];
            if (menuAgregar.length > 0) {
                menu.unshift({
                    texto: "Agregar",
                    items: menuAgregar
                });
            }

            // Creación del menú desplegable para más opciones
            // if (menuAgregar.length > 0 || menuVer.length > 0) {
            //     const icono = crearElemento("i", {class: "bi bi-three-dots-vertical"});
            //     const btnDropdown = crearElemento("button", {type: "button", class: "btn btn-info btn-sm rounded-1", "data-bs-toggle": "dropdown", "data-bs-auto-close": "outside", "aria-expanded": "false", title: "Más opciones"}, [icono]);
            //     const ul = crearElemento("ul", {class: "dropdown-menu dropdown-menu-end"});
            //     const div = crearElemento("div", {class: "btn-group dropstart"}, [btnDropdown, ul]);

            //     const crearSubmenu = (texto, items) => {
            //         if (items.length === 0) return null;

            //         const ulSub = crearElemento("ul", { class: "dropdown-menu shadow" });

            //         for (const op of items) {
            //             const a = crearElemento("a", { class: "dropdown-item" }, [op.texto]);
            //             a.addEventListener("click", (e) => {
            //                 e.preventDefault();
            //                 op.callback();
            //                 bootstrap.Dropdown.getInstance(btnDropdown).hide();
            //             });
            //             ulSub.appendChild(crearElemento("li", undefined, [a]));
            //         }

            //         const aToggle = crearElemento("a", {
            //             class: "dropdown-item dropdown-toggle",
            //             "data-bs-toggle": "dropdown",
            //             "data-bs-auto-close": "outside",
            //             "aria-expanded": "false"
            //         }, [crearElemento("span", { class: "ms-2" }, [texto])]);

            //         const li = crearElemento("li", { class: "dropstart" }, [aToggle, ulSub]);
            //         return li;
            //     };

            //     if (menuAgregar.length > 0) {
            //         const submenu = crearSubmenu("Agregar", menuAgregar);
            //         if (submenu) ul.appendChild(submenu);
            //     }

            //     if (menuVer.length > 0) {
            //         const submenu = crearSubmenu("Ver", menuVer);
            //         if (submenu) ul.appendChild(submenu);
            //     }

            //     tdOpciones.append(div, " ");
            // }

            if (menu.length > 0) {
                const icono = crearElemento("i", { class: "bi bi-three-dots-vertical" });

                const btnDropdown = crearElemento("button", {
                    type: "button",
                    class: "btn btn-info btn-sm rounded-1",
                    "data-bs-toggle": "dropdown",
                    "data-bs-auto-close": "outside",
                    "aria-expanded": "false",
                    title: "Más opciones"
                }, [icono]);

                const ul = crearElemento("ul", { class: "dropdown-menu dropdown-menu-end" });
                const div = crearElemento("div", { class: "btn-group dropstart" }, [btnDropdown, ul]);

                const crearItems = (items) => {
                    const ulSub = crearElemento("ul", { class: "dropdown-menu shadow" });
                    for (const op of items) {
                        const li = crearElemento("li");
                        // Si tiene submenú
                        if (op.items && op.items.length) {
                            const aToggle = crearElemento("a", {
                                class: "dropdown-item dropdown-toggle",
                                "data-bs-toggle": "dropdown",
                                "data-bs-auto-close": "outside",
                                "aria-expanded": "false"
                            }, [op.texto]);
                            const sub = crearItems(op.items);
                            li.classList.add("dropstart");
                            li.append(aToggle, sub);

                        } else {
                            const a = crearElemento("a", { class: "dropdown-item" }, [op.texto]);
                            a.addEventListener("click", (e) => {
                                e.preventDefault();
                                op.callback?.();
                                bootstrap.Dropdown.getInstance(btnDropdown)?.hide();
                            });
                            li.appendChild(a);
                        }
                        ulSub.appendChild(li);
                    }
                    return ulSub;
                };

                const itemsMenu = crearItems(menu);
                ul.replaceWith(itemsMenu);
                div.append(btnDropdown, itemsMenu);
                tdOpciones.append(div, " ");
            }
            celdas.push(tdOpciones);

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        // Agregar fila de totales al final de la tabla
        const filaTotal = crearFilaTotalTabla({
            columnasTexto: 2,
            columnasFinal: 2,
            valores: [totalDebe/100, totalHaber/100]
        });
        if (totalDebe === totalHaber) {
            filaTotal.classList.add("table-secondary");
            fragment.appendChild(filaTotal);
            trDeTransaccion.classList.remove("table-danger");
            botonConsolidar ? botonConsolidar.style.display = "" : null;
        } else {
            filaTotal.classList.add("table-danger");
            // Fila de alerta que muestra la diferencia entre debe y haber
            const difDebe = (totalHaber - totalDebe)/100;
            const difHaber = (totalDebe - totalHaber)/100;
            const filaAlerta = crearElemento("tr", { class: "table-danger" }, [
                crearElemento("td", { colSpan: 2, class: "text-end text-danger" }, ["No cuadra"]),
                crearElemento("td", { class: "text-end text-danger" }, [formatoDecimal(difDebe)]),
                crearElemento("td", { class: "text-end text-danger" }, [formatoDecimal(difHaber)]),
                crearElemento("td", { colSpan: 2 }),
            ]);
            fragment.append(filaTotal, filaAlerta);
            trDeTransaccion.classList.add("table-danger");
            botonConsolidar ? botonConsolidar.style.display = "none" : null;
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            mainElement: vistaPrincipal,
            element: "[data-id='__btn-registro']",
            popover: {
                title: "Por asiento Modelo",
                description: "Le despliega la opción con la lista de Asientos Modelo que se creo desde configuración previamente, podrá seleccionar una y añadir el monto, a ejecutar el proceso se generará el asiento con el detalle de cuentas y montos.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='tr-ac-btn-calcular']",
            popover: {
                title: "Cálculo",
                description: "Calculadora tributaria.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: "[data-id='div-tr-ac-tipofacturas']",
            popover: {
                title: "Añadir Facturas: Compras/Ventas",
                description: "Permite añadir facturas de compras o ventas relacionadas a la transacción, que le permitirá visualizar junto al reporte de Comprobante Contable.",
            },
        },
        {
            element: divMonto,
            popover: {
                title: "Monto",
                description: "Casilla para escribir un valor numérico, para: a) automatizar el registro de cuentas tributarias en el asiento, b) la calculadora pueda generar los montos s/g cada tributarios.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: "Asiento Contable",
                description: "Tabla o lista en la que se muestra el asiento con su detalle de cuentas y valores.",
            },
        },
        {
            element: divTabla,
            popover: {
                title: `Casilla "Notas"`,
                description: "Podrá registrar alguna nota aclaratoria al registro realizado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Impuestos']",
            popover: {
                title: "Impuesto",
                description: "Al ejecutar le lista los impuestos configurados por la Empresa, que al seleccionar se rellenará el monto correspondiente al tributo (casilla monto debe tener valor).",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Agregar Factura']",
            popover: {
                title: "Agregar Factura",
                description: "Le permite crear una factura de compra o venta relacionada a la cuenta contable seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Ver Facturas']",
            popover: {
                title: "Ver Facturas",
                description: "Le permite visualizar las facturas relacionadas a la cuenta contable seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Insertar']",
            popover: {
                title: "Insertar",
                description: "Le permite insertar una cuenta abajo la cuenta ejecutada.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar",
                description: "Permite editar el registro con todos sus detalles.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar",
                description: "Permite eliminar el registro.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla, 300);
}

// =========================================================
// FUNCIONES BOTONES DE LA VISTA
// =========================================================

/**
 * Función: Realiza el cálculo de montos tributarios basado en una base de cálculo.
 * Descripción: Esta función abre un modal que permite al usuario ingresar una base de cálculo y seleccionar cuentas para calcular montos tributarios como IVA, IT, Retenciones, etc. Los resultados se muestran en el modal y se pueden registrar automáticamente en el asiento contable.
 * Fecha: 10 de diciembre de 2025
 * Autor: Joel Choque
 */
const realizarCalculoBase = async (opciones) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL_LT,
        cargarContenidoTabla,
        montoInicial,
        registroTransaccion
    } = opciones;

    const [modal, cuerpoModal, cerrarModal] = modalRemovible({
        tituloModal: "Calcular",
        estiloModal: "width: 600px; min-width: 240px;",
        instrucciones: {
            cerrarAlHacerClickExterno: false,
            cerrarAlPresionarEsc: false
        }
    });

    const formulario = `
    <form class="">
        <div class="row g-2 align-items-end">
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_base" class="form-label">Base de Cálculo</label>
                <input type="text" class="form-control" id="dtrans_cal_base" name="base" value="${montoInicial.value || "0.00"}">
            </div>
            <div class="row"></div>
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_c_iva" class="form-label">Cuenta (IVA)</label>
                <select class="form-select" id="dtrans_cal_c_iva" name="c_iva"></select>
            </div>
            <div class="col-12 col-md-6">
                <input type="text" class="form-control" id="dtrans_cal_v_iva" name="v_iva" readonly value="0.00">
            </div>
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_c_valor_neto" class="form-label">Cuenta (Valor Neto)</label>
                <select class="form-select" id="dtrans_cal_c_valor_neto" name="c_valor_neto"></select>
            </div>
            <div class="col-12 col-md-6">
                <input type="text" class="form-control" id="dtrans_cal_v_valor_neto" name="v_valor_neto" readonly value="0.00">
            </div>
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_c_it" class="form-label">Cuenta (IT)</label>
                <select class="form-select" id="dtrans_cal_c_it" name="c_it"></select>
            </div>
            <div class="col-12 col-md-6">
                <input type="text" class="form-control" id="dtrans_cal_v_it" name="v_it" readonly value="0.00">
            </div>
        </div>
        <div class="pt-4">
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="tipo_impuesto" id="dtrans_cal_servicios" value="1" checked>
                <label class="form-check-label" for="dtrans_cal_servicios">Servicios</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="tipo_impuesto" id="dtrans_cal_bienes" value="2">
                <label class="form-check-label" for="dtrans_cal_bienes">Bienes</label>
            </div>
        </div>
        <div class="row g-2 mt-0 align-items-end" id="dtrans_cal_s">
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_s_c_ret_iue" class="form-label">Cuenta (Ret IUE)</label>
                <select class="form-select" id="dtrans_cal_s_c_ret_iue" name="sc_ret_iue"></select>
            </div>
            <div class="col-12 col-md-6">
                <input type="text" class="form-control" id="dtrans_cal_s_v_ret_iue" name="sv_ret_iue" readonly value="0.00">
            </div>
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_s_c_ret_it" class="form-label">Cuenta (Ret IT)</label>
                <select class="form-select" id="dtrans_cal_s_c_ret_it" name="sc_ret_it"></select>
            </div>
            <div class="col-12 col-md-6">
                <input type="text" class="form-control" id="dtrans_cal_s_v_ret_it" name="sv_ret_it" readonly value="0.00">
            </div>
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_s_c_valor_aplc" class="form-label">Cuenta (Valor Aplc.)</label>
                <select class="form-select" id="dtrans_cal_s_c_valor_aplc" name="sc_valor_aplc"></select>
            </div>
            <div class="col-12 col-md-6">
                <input type="text" class="form-control" id="dtrans_cal_s_v_valor_aplc" name="sv_valor_aplc" readonly value="0.00">
            </div>
        </div>
        <div class="row g-2 mt-0 align-items-end d-none" id="dtrans_cal_b">
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_b_c_ret_iue" class="form-label">Cuenta (Ret IUE)</label>
                <select class="form-select" id="dtrans_cal_b_c_ret_iue" name="bc_ret_iue"></select>
            </div>
            <div class="col-12 col-md-6">
                <input type="text" class="form-control" id="dtrans_cal_b_v_ret_iue" name="bv_ret_iue" readonly value="0.00">
            </div>
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_b_c_ret_it" class="form-label">Cuenta (Ret IT)</label>
                <select class="form-select" id="dtrans_cal_b_c_ret_it" name="bc_ret_it"></select>
            </div>
            <div class="col-12 col-md-6">
                <input type="text" class="form-control" id="dtrans_cal_b_v_ret_it" name="bv_ret_it" readonly value="0.00">
            </div>
            <div class="col-12 col-md-6">
                <label for="dtrans_cal_b_c_valor_aplc" class="form-label">Cuenta (Valor Aplc.)</label>
                <select class="form-select" id="dtrans_cal_b_c_valor_aplc" name="bc_valor_aplc"></select>
            </div>
            <div class="col-12 col-md-6">
                <input type="text" class="form-control" id="dtrans_cal_b_v_valor_aplc" name="bv_valor_aplc" readonly value="0.00">
            </div>
        </div>

        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4">
            <button class="btn btn-primary" id="btn-enviar-formulario" style="min-width: 100px;">Guardar</button>
            <button type="button" class="btn btn-secondary" data-id="__opcion-cierre-externo" style="min-width: 100px;">Cancelar</button>
        </div>
    </form>`;
    const empresa_id = getEmpresaId();
    const sucursal_id = getSucursalId();
    const URL = CT_URLAPI;

    cuerpoModal.innerHTML = formulario;
    const elementoFormulario = cuerpoModal.querySelector("form");

    const selectIVA = elementoFormulario.querySelector("#dtrans_cal_c_iva");
    const selectValorNeto = elementoFormulario.querySelector("#dtrans_cal_c_valor_neto");
    const selectIT = elementoFormulario.querySelector("#dtrans_cal_c_it");

    const selectRetIUES = elementoFormulario.querySelector("#dtrans_cal_s_c_ret_iue");
    const selectRetITS = elementoFormulario.querySelector("#dtrans_cal_s_c_ret_it");
    const selectValorAplcS = elementoFormulario.querySelector("#dtrans_cal_s_c_valor_aplc");

    const selectRetIUEB = elementoFormulario.querySelector("#dtrans_cal_b_c_ret_iue");
    const selectRetITB = elementoFormulario.querySelector("#dtrans_cal_b_c_ret_it");
    const selectValorAplcB = elementoFormulario.querySelector("#dtrans_cal_b_c_valor_aplc");

    vistaPrincipal.appendChild(modal);

    // Obtener las cuentas contables para llenar los select
    const cuentasImpuesto = await obtenerDatos(`${URL}milistaplanes/${empresa_id}`);
    if (cuentasImpuesto) {
        manejarSelect(selectIVA, { datosRegistro: cuentasImpuesto, llavesOpciones: { valor: "id", detalle: ["numero", "plan"]} });
        manejarSelect(selectValorNeto, { datosRegistro: cuentasImpuesto, llavesOpciones: { valor: "id", detalle: ["numero", "plan"]} });
        manejarSelect(selectIT, { datosRegistro: cuentasImpuesto, llavesOpciones: { valor: "id", detalle: ["numero", "plan"]} });
        manejarSelect(selectRetIUES, { datosRegistro: cuentasImpuesto, llavesOpciones: { valor: "id", detalle: ["numero", "plan"]} });
        manejarSelect(selectRetITS, { datosRegistro: cuentasImpuesto, llavesOpciones: { valor: "id", detalle: ["numero", "plan"]} });
        manejarSelect(selectValorAplcS, { datosRegistro: cuentasImpuesto, llavesOpciones: { valor: "id", detalle: ["numero", "plan"]} });
        manejarSelect(selectRetIUEB, { datosRegistro: cuentasImpuesto, llavesOpciones: { valor: "id", detalle: ["numero", "plan"]} });
        manejarSelect(selectRetITB, { datosRegistro: cuentasImpuesto, llavesOpciones: { valor: "id", detalle: ["numero", "plan"]} });
        manejarSelect(selectValorAplcB, { datosRegistro: cuentasImpuesto, llavesOpciones: { valor: "id", detalle: ["numero", "plan"]} });
    } else {
        alertaDeError(contenedorDeAlertas, "Ocurrio un error al cargar las cuentas contables");
        cerrarModal();
    }

    const inputBase = elementoFormulario.querySelector("#dtrans_cal_base");
    const inputIVA = elementoFormulario.querySelector("#dtrans_cal_v_iva");
    const inputValorNeto = elementoFormulario.querySelector("#dtrans_cal_v_valor_neto");
    const inputIT = elementoFormulario.querySelector("#dtrans_cal_v_it");

    const inputRetIUES = elementoFormulario.querySelector("#dtrans_cal_s_v_ret_iue");
    const inputRetITS = elementoFormulario.querySelector("#dtrans_cal_s_v_ret_it");
    const inputValorAplcS = elementoFormulario.querySelector("#dtrans_cal_s_v_valor_aplc");

    const inputRetIUEB = elementoFormulario.querySelector("#dtrans_cal_b_v_ret_iue");
    const inputRetITB = elementoFormulario.querySelector("#dtrans_cal_b_v_ret_it");
    const inputValorAplcB = elementoFormulario.querySelector("#dtrans_cal_b_v_valor_aplc");

    const debounce = (func, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };
    const calcularValores = (e) => {
        // Cálculo de valores tributarios basados en la 'base' ingresada
        e.preventDefault();
        const base = Number(inputBase.value.replace(/,/g, ""));
        const iva = base * 0.13;
        const valorNeto = base - iva;
        const it = base * 0.03;

        const valorAplcS = base / (1 - 0.125 - 0.03);
        const retIUES = valorAplcS * 0.125;
        const retITS = valorAplcS * 0.03;

        const valorAplcB = base / (1 - 0.05 - 0.03);
        const retIUEB = valorAplcB * 0.05;
        const retITB = valorAplcB * 0.03;

        inputIVA.value = formatoDecimal(iva);
        inputValorNeto.value = formatoDecimal(valorNeto);
        inputIT.value = formatoDecimal(it);

        inputRetIUES.value = formatoDecimal(retIUES);
        inputRetITS.value = formatoDecimal(retITS);
        inputValorAplcS.value = formatoDecimal(valorAplcS);

        inputRetIUEB.value = formatoDecimal(retIUEB);
        inputRetITB.value = formatoDecimal(retITB);
        inputValorAplcB.value = formatoDecimal(valorAplcB);
    }
    // Aplicar debounce para reducir la frecuencia de cálculo durante la entrada de datos
    const debounceCalcularValores = debounce(calcularValores, 500);
    inputBase.addEventListener("input", debounceCalcularValores);
    inputBase.dispatchEvent(new Event("input"));

    const radioServicios = elementoFormulario.querySelector("#dtrans_cal_servicios");
    const radioBienes = elementoFormulario.querySelector("#dtrans_cal_bienes");
    const divServicios = elementoFormulario.querySelector("#dtrans_cal_s");
    const divBienes = elementoFormulario.querySelector("#dtrans_cal_b");
    selectRetITB.selectize?.disable();
    selectRetIUEB.selectize?.disable();
    selectValorAplcB.selectize?.disable();
    radioServicios.addEventListener("change", (e) => {
        if (e.target.checked) {
            divServicios.classList.remove("d-none");
            divBienes.classList.add("d-none");
        }
    });
    radioBienes.addEventListener("change", (e) => {
        if (e.target.checked) {
            divBienes.classList.remove("d-none");
            divServicios.classList.add("d-none");
        }
    });

    const botonGuardar = elementoFormulario.querySelector("#btn-enviar-formulario");
    // Preparación y envio de formulario y control de la respuesta
    elementoFormulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const fnBotonInicial = botonEnCarga(botonGuardar);

        const cuerpoForm = new FormData(elementoFormulario);
        const datosForm = Object.fromEntries(cuerpoForm.entries());
        // Preparar los datos para el registro automático en el asiento contable
        const cuentaIVA = datosForm.c_iva;
        const cuentaValorNeto = datosForm.c_valor_neto;
        const cuentaIT = datosForm.c_it;
        const valorIVA = Number(datosForm.v_iva.replace(/,/g, ""));
        const valorValorNeto = Number(datosForm.v_valor_neto.replace(/,/g, ""));
        const valorIT = Number(datosForm.v_it.replace(/,/g, ""));
        // Cuentas y valores según el tipo de impuesto seleccionado
        let cuentaRetIUE;
        let cuentaRetIT;
        let cuentaValorAplc;
        let valorRetIUE;
        let valorRetIT;
        let valorValorAplc;
        if (datosForm.tipo_impuesto === "1") {
            cuentaRetIUE = datosForm.sc_ret_iue;
            cuentaRetIT = datosForm.sc_ret_it;
            cuentaValorAplc = datosForm.sc_valor_aplc;
            valorRetIUE = Number(datosForm.sv_ret_iue.replace(/,/g, ""));
            valorRetIT = Number(datosForm.sv_ret_it.replace(/,/g, ""));
            valorValorAplc = Number(datosForm.sv_valor_aplc.replace(/,/g, ""));
        } else {
            cuentaRetIUE = datosForm.bc_ret_iue;
            cuentaRetIT = datosForm.bc_ret_it;
            cuentaValorAplc = datosForm.bc_valor_aplc;
            valorRetIUE = Number(datosForm.bv_ret_iue.replace(/,/g, ""));
            valorRetIT = Number(datosForm.bv_ret_it.replace(/,/g, ""));
            valorValorAplc = Number(datosForm.bv_valor_aplc.replace(/,/g, ""));
        }

        const cuentasCalc = [
            cuentaIVA,
            cuentaValorNeto,
            cuentaIT,
            cuentaRetIUE,
            cuentaRetIT,
            cuentaValorAplc
        ]

        const filtrados = cuentasImpuesto.filter(obj => cuentasCalc.includes(obj.id));

        const objCuentas = Object.fromEntries(
            filtrados.map(obj => [obj.id.toString(), obj])
        );
        // Preparar los datos en el formato requerido para el registro
        const datos = [
            cuentaValorAplc && {
                idplan: cuentaValorAplc,
                debe: objCuentas[cuentaValorAplc].tipo?.trim().toUpperCase() === "DEBE" ? valorValorAplc : 0,
                haber: objCuentas[cuentaValorAplc].tipo?.trim().toUpperCase() === "HABER" ? valorValorAplc : 0,
                tipo: objCuentas[cuentaValorAplc].tipo,
                numero: objCuentas[cuentaValorAplc].numero,
            },
            cuentaRetIUE && {
                idplan: cuentaRetIUE,
                debe: objCuentas[cuentaRetIUE].tipo?.trim().toUpperCase() === "DEBE" ? valorRetIUE : 0,
                haber: objCuentas[cuentaRetIUE].tipo?.trim().toUpperCase() === "HABER" ? valorRetIUE : 0,
                tipo: objCuentas[cuentaRetIUE].tipo,
                numero: objCuentas[cuentaRetIUE].numero,
            },
            cuentaRetIT && {
                idplan: cuentaRetIT,
                debe: objCuentas[cuentaRetIT].tipo?.trim().toUpperCase() === "DEBE" ? valorRetIT : 0,
                haber: objCuentas[cuentaRetIT].tipo?.trim().toUpperCase() === "HABER" ? valorRetIT : 0,
                tipo: objCuentas[cuentaRetIT].tipo,
                numero: objCuentas[cuentaRetIT].numero,
            },
            cuentaValorNeto && {
                idplan: cuentaValorNeto,
                debe: objCuentas[cuentaValorNeto].tipo?.trim().toUpperCase() === "DEBE" ? valorValorNeto : 0,
                haber: objCuentas[cuentaValorNeto].tipo?.trim().toUpperCase() === "HABER" ? valorValorNeto : 0,
                tipo: objCuentas[cuentaValorNeto].tipo,
                numero: objCuentas[cuentaValorNeto].numero,
            },
            cuentaIVA && {
                idplan: cuentaIVA,
                debe: objCuentas[cuentaIVA].tipo?.trim().toUpperCase() === "DEBE" ? valorIVA : 0,
                haber: objCuentas[cuentaIVA].tipo?.trim().toUpperCase() === "HABER" ? valorIVA : 0,
                tipo: objCuentas[cuentaIVA].tipo,
                numero: objCuentas[cuentaIVA].numero,
            },
            cuentaIT && {
                idplan: cuentaIT,
                debe: objCuentas[cuentaIT].tipo?.trim().toUpperCase() === "DEBE" ? valorIT : 0,
                haber: objCuentas[cuentaIT].tipo?.trim().toUpperCase() === "HABER" ? valorIT : 0,
                tipo: objCuentas[cuentaIT].tipo,
                numero: objCuentas[cuentaIT].numero,
            },
        ];
        // Filtrar los datos válidos
        const datosOrdenados = datos.filter(Boolean);
        if (datosOrdenados.length === 0) {
            fnBotonInicial();
            vistaPrincipal.appendChild(modalDeInformacion("No hay cuentas para registrar"));
            return;
        }
        // Ordenar los datos por tipo y número de cuenta
        datosOrdenados.sort((a, b) => {
            if (a.tipo === b.tipo) {
                return a.numero.localeCompare(b.numero);
            }
            return a.tipo.localeCompare(b.tipo);
        });

        // Preparar los datos para el envío
        const datosEnviar = datosOrdenados.map((obj) => {
            return {
                idplan: obj.idplan,
                debe: obj.debe,
                haber: obj.haber
            };
        });
        const accionEnviar = async() => {
            const listaDeRegistros = await obtenerDatos(`${URL_LT}`);
            alertaDeExito(contenedorDeAlertas, "Registro exitoso");
            cargarContenidoTabla(listaDeRegistros);
            cerrarModal();
        }
        const error = () => {
            alertaDeError(contenedorDeAlertas, "No se pudo realizar el registro");
            fnBotonInicial();
        }
        const misDatos = {
            idtransaccion: registroTransaccion.id,
            empresa: empresa_id,
            sucursal: sucursal_id,
            datos_json: JSON.stringify(datosEnviar),
            ver: "registrar_detalle_transaccion_json",
        }
        // Enviar los datos para el registro
        enviarDatosOJson({
            datos: misDatos,
            urlSolicitud: URL,
            callbackExito: accionEnviar,
            callbackError: error
        });
    });
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea un botón que abre un menú desplegable para calcular montos de impuestos basados en un monto base.
 * Descripción: Este botón, al ser clickeado, muestra una lista de impuestos configurados. Al seleccionar un impuesto, calcula el monto correspondiente basado en el valor ingresado en un campo de monto y actualiza el cambo de DEBE o HABER con el resultado.
 * Fecha: 10 de diciembre de 2025
 * Autor: Joel Choque
 */
function botonCalcularMontoImpuesto(datosVista) {
    const {inputMonto, impuestos, vistaPrincipal} = datosVista;

    const icono = crearElemento("i", { class: "bi bi-menu-up px-1" });
    const boton = crearElemento( "button", { class: "btn btn-outline-dark px-1", title: "Impuestos", type: "button" }, [icono] );

    boton.addEventListener("click", () => {
        // Obtener el monto base y el campo de resultado
        const monto = Number(Number(inputMonto.value).toFixed(2));
        const input = boton.closest("td").querySelector("input");

        const ul = crearElemento("ul", {
            class: "dropdown-menu show position-static w-100 p-0 pt-1",
            style: "max-height:250px; overflow:auto; max-width:400px;"
        });
        // Rellenar la lista de impuestos
        if (impuestos?.length) {
            for (const impto of impuestos) {
                const li = crearElemento("li", { class: "border-bottom" }, [
                    crearElemento("a", {
                        class: "dropdown-item text-wrap py-2",
                        href: "#",
                        "data-tasa": impto.tasa
                    }, [impto.nombreimpuesto, ` (${impto.tasa}%)`])
                ]);
                ul.appendChild(li);
            }
        } else {
            ul.appendChild(
                crearElemento("li", { class: "dropdown-item text-muted fs-6" }, ["-- No se encontraron impuestos --"])
            );
        }

        // Manejo de la selección de un impuesto
        ul.addEventListener("click", (e) => {
            const item = e.target.closest("a[data-tasa]");
            if (!item) return;
            e.preventDefault();
            const tasa = parseFloat(item.dataset.tasa);
            input.value = (monto * (tasa / 100)).toFixed(2);
            innerDiv.remove();
        });

        const floatingDiv = crearElemento("div", { class: "floating-message p-1 bg-white rounded shadow" }, [ul]);
        const innerDiv = crearElemento("div", { class: "inner-div", style: "background-color:#00000040;" }, [floatingDiv]);
        vistaPrincipal.appendChild(innerDiv);

        const cerrarModal = salirConEsc(innerDiv);

        // Cerrar al hacer click fuera del contenedor flotante
        innerDiv.addEventListener("click", (e) => {
            if (!floatingDiv.contains(e.target)) {
                innerDiv.remove();
                cerrarModal();
            }
        });
    });
    return boton;
};

// Botón para insertar cuenta debajo de la cuenta actual
function botonInsertarCuenta(callback) {
    const icono = crearElemento("i", { class: "bi bi-chevron-bar-down" });
    const boton = crearElemento("button", { class: "btn btn-info btn-sm", type: "button", title: "Insertar" }, [icono]);

    boton.addEventListener("click", () => {
        callback();
    });
    return boton;
}

/**
 * Función: Crea un modal con formulario para agregar facturas a una cuenta.
 * Descripción: Muestra un modal con un formulario que permite seleccionar facturas y el tipo de asignación (agregar, reemplazar o vincular).
 *              Al agregar la factura se actualizarán los datos del DEBE o HABER de la cuenta correspondiente en la tabla principal.
 * Fecha: 10 de diciembre de 2025
 * Autor: Joel Choque
 */
function agregarFacturaACuenta(datosVista) {
    const {
        URL,
        URL_LT,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registroTransaccion,
        registro,
    } = datosVista;

    const empresa_id = getEmpresaId();
    const sucursal_id = getSucursalId();

    return async () => {
        // Creación del modal y formulario
        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Agregar Factura"});
        const [selectFacturas, divFacturas] = campoSelect(
            { atributos: { id: "transasiento-factura", name: "factura[]", required: true, multiple: true } },
            { contenido: "Facturas" },
        );
        const [, divConNotas] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-suma`, name: "sumar_reemplazar", value: "suma", required: true } },
            { contenido: "Agregar" },
            { atributos: { class: "col col-auto" } }
        );
        const [, divConFacturas] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-reemplazo`, name: "sumar_reemplazar", value: "reemplazo" } },
            { contenido: "Reemplazar" },
            { atributos: { class: "col col-auto" } }
        );
        const [, divConRecibos] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-vincular`, name: "sumar_reemplazar", value: "vincular" } },
            { contenido: "Solo vincular" },
            { atributos: { class: "col col-auto" } }
        );
        const divSumarReemplazar = crearElemento("div", { class: "d-flex flex-wrap gap-3 mt-3" }, [divConNotas, divConFacturas, divConRecibos]);

        const botonConsolidar = crearElemento("button", { class: "btn btn-primary", type: "submit", id:"btn-enviar-formulario", style: "min-width: 100px;" }, ["Agregar"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 100px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-4" }, [botonConsolidar, botonCancelar]);
        const elementoFormulario = crearElemento("form", undefined, [divFacturas, divSumarReemplazar, divBotones]);

        cuerpoModal.appendChild(elementoFormulario);
        vistaPrincipal.appendChild(modal);

        // Rellenar select de facturas
        selectEnEspera(selectFacturas);
        const facturas = await obtenerDatos(`${URL}listar_facturas_cobro_pago/${registro.id}/${empresa_id}`);
        manejarSelect(selectFacturas, { datosRegistro: facturas, llavesOpciones: { valor: "id", detalle: [{dato:"fecha", tipo:"fecha"}, "nfactura", "cliente_proveedor", "tipo"] } });

        // Preparación y envio de formulario y control de la respuesta
        // Al enviar el formulario, se registra registra la factura a la cuenta y se actualiza la tabla principal
        elementoFormulario.addEventListener("submit", (e) => {
            e.preventDefault();

            botonConsolidar.disabled = true;
            botonConsolidar.innerHTML = contenidoDeCargaBtn("Agregar");

            const datosFormulario = new FormData(elementoFormulario);
            const objFormulario = Object.fromEntries(datosFormulario.entries());

            // IDs seleccionados (string)
            const facturasSeleccionadas = new Set(datosFormulario.getAll("factura[]"));
            // Preparar los datos de las facturas seleccionadas
            const datosFactura = facturas
                .filter(({ id }) => facturasSeleccionadas.has(id.toString()))
                .map(({ id, montofactura }) => ({
                    idfactura: id,
                    monto: montofactura
                }));

            // Datos para el envío
            const fecha = obtenerFechaActual();
            const datos = {
                ver: "asignar_facturas_A_cuentas",
                idempresa: empresa_id,
                idsucursal: sucursal_id,
                fecha: fecha,
                facturas:  datosFactura,
                idtrans: registroTransaccion.id,
                idasientotipo: "",
                glosa: "",
                sumar_reemplazar: objFormulario.sumar_reemplazar,
                cuenta: registro.id,
            }
            const enviado = async () => {
                const listaDeRegistros = await obtenerDatos(URL_LT);
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Registro exitoso");
                cerrarModal();
            }
            const error = () => {
                alertaDeError(contenedorDeAlertas, "Ocurrió un error al realizar el registro");
                cerrarModal();
            }
            // Envío de datos para el registro
            enviarDatosOJson({
                datos: datos,
                urlSolicitud: URL,
                callbackExito: enviado,
                callbackError: error,
                tipoJSON: true,
            });
        });
    };
}

/**
 * Función: Crea un modal con formulario para agregar a una cuenta los Cobros o Pagos existentes.
 * Descripción: Muestra un modal con un formulario que permite seleccionar cobros o pagos, el tipo de asignación (agregar, reemplazar o vincular).
 *              Al agregar el cobro o pago se actualizarán los datos del DEBE o HABER de la cuenta correspondiente en la tabla principal.
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
function agregarCobroPagoACuenta(datosVista) {
    const {
        URL,
        URL_LT,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registroTransaccion,
        registro,
    } = datosVista;

    const empresa_id = getEmpresaId();
    const sucursal_id = getSucursalId();

    return async () => {
        // Creación del modal y formulario
        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Agregar Cobro/Pago"});
        const [selectFacturas, divFacturas] = campoSelect(
            { atributos: { id: "transasiento-factura", name: "factura[]", required: true, multiple: true } },
            { contenido: "Cobros/Pagos existentes" },
        );
        const [, divConNotas] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-suma`, name: "sumar_reemplazar", value: "suma", required: true } },
            { contenido: "Agregar" },
            { atributos: { class: "col col-auto" } }
        );
        const [, divConFacturas] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-reemplazo`, name: "sumar_reemplazar", value: "reemplazo" } },
            { contenido: "Reemplazar" },
            { atributos: { class: "col col-auto" } }
        );
        const [, divConRecibos] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-vincular`, name: "sumar_reemplazar", value: "vincular" } },
            { contenido: "Solo vincular" },
            { atributos: { class: "col col-auto" } }
        );
        const divSumarReemplazar = crearElemento("div", { class: "d-flex flex-wrap gap-3 mt-3" }, [divConNotas, divConFacturas, divConRecibos]);
        const botonConsolidar = crearElemento("button", { class: "btn btn-primary", type: "submit", id:"btn-enviar-formulario", style: "min-width: 100px;" }, ["Agregar"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 100px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-4" }, [botonConsolidar, botonCancelar]);
        const elementoFormulario = crearElemento("form", undefined, [divFacturas, divSumarReemplazar, divBotones]);

        cuerpoModal.appendChild(elementoFormulario);
        vistaPrincipal.appendChild(modal);

        // Rellenar select de facturas
        selectEnEspera(selectFacturas);

        const facturas = await obtenerDatos(`${URL}listar_comprobantes_cobro_pago/${registro.id}/${empresa_id}`);
        manejarSelect(selectFacturas, { datosRegistro: facturas, llavesOpciones: { valor: "idcomprobante", detalle: [{dato:"fecha", tipo:"fecha"}, "nrecibo", "persona", "tipo"] } });

        // Preparación y envio de formulario y control de la respuesta
        // Al enviar el formulario, se registra registra la factura a la cuenta y se actualiza la tabla principal
        elementoFormulario.addEventListener("submit", (e) => {
            e.preventDefault();

            botonConsolidar.disabled = true;
            botonConsolidar.innerHTML = contenidoDeCargaBtn("Agregar");

            const datosFormulario = new FormData(elementoFormulario);
            const objFormulario = Object.fromEntries(datosFormulario.entries());

            // IDs seleccionados (string)
            const facturasSeleccionadas = new Set(datosFormulario.getAll("factura[]"));
            // Preparar los datos de las facturas seleccionadas
            const datosFactura = facturas
                .filter(({ idcomprobante }) => facturasSeleccionadas.has(idcomprobante.toString()))
                .map(({ idcomprobante, monto, tipo }) => ({
                    idcomprobante: idcomprobante,
                    monto: monto,
                    tipo_comprobante: tipo
                }));

            // Datos para el envío
            const fecha = obtenerFechaActual();
            const datos = {
                ver: "asignar_comprobantes_A_cuentas",
                idempresa: empresa_id,
                fecha: fecha,
                comprobantes:  datosFactura,
                idtrans: registroTransaccion.id,
                idasientotipo: "",
                sumar_reemplazar: objFormulario.sumar_reemplazar,
                cuenta: registro.id,
                // tipo_comprobante: tipoComprobante,
            }
            const enviado = async () => {
                const listaDeRegistros = await obtenerDatos(URL_LT);
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Registro exitoso");
                cerrarModal();
            }
            const error = () => {
                alertaDeError(contenedorDeAlertas, "Ocurrió un error al realizar el registro");
                cerrarModal();
            }
            // Envío de datos para el registro
            enviarDatosOJson({
                datos: datos,
                urlSolicitud: URL,
                callbackExito: enviado,
                callbackError: error,
                tipoJSON: true,
            });
        });
    };
}

/**
 * Función: Crea un modal con formulario para agregar a una cuenta los Recibos de Cobro o Pago existentes.
 * Descripción: Muestra un modal con un formulario que permite seleccionar recibos, el tipo de asignación (agregar, reemplazar o vincular).
 *              Al agregar el recibo se actualizarán los datos del DEBE o HABER de la cuenta correspondiente en la tabla principal.
 * Fecha: 02 de febrero de 2026
 * Autor: Joel Choque
 */
function agregarReciboACuenta(datosVista) {
    const {
        URL,
        URL_LT,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registroTransaccion,
        registro,
    } = datosVista;

    const empresa_id = getEmpresaId();
    const sucursal_id = getSucursalId();

    return async () => {
        // Creación del modal y formulario
        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Agregar Recibo"});
        const [selectFacturas, divFacturas] = campoSelect(
            { atributos: { id: "transasiento-factura", name: "factura[]", required: true, multiple: true } },
            { contenido: "Recibos" },
        );
        const [, divConNotas] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-suma`, name: "sumar_reemplazar", value: "suma", required: true } },
            { contenido: "Agregar" },
            { atributos: { class: "col col-auto" } }
        );
        const [, divConFacturas] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-reemplazo`, name: "sumar_reemplazar", value: "reemplazo" } },
            { contenido: "Reemplazar" },
            { atributos: { class: "col col-auto" } }
        );
        const [, divConRecibos] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-vincular`, name: "sumar_reemplazar", value: "vincular" } },
            { contenido: "Solo vincular" },
            { atributos: { class: "col col-auto" } }
        );
        const divSumarReemplazar = crearElemento("div", { class: "d-flex flex-wrap gap-3 mt-3" }, [divConNotas, divConFacturas, divConRecibos]);

        const botonConsolidar = crearElemento("button", { class: "btn btn-primary", type: "submit", id:"btn-enviar-formulario", style: "min-width: 100px;" }, ["Agregar"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 100px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-4" }, [botonConsolidar, botonCancelar]);
        const elementoFormulario = crearElemento("form", undefined, [divFacturas, divSumarReemplazar, divBotones]);

        cuerpoModal.appendChild(elementoFormulario);
        vistaPrincipal.appendChild(modal);

        // Rellenar select de facturas
        selectEnEspera(selectFacturas);
        const facturas = await obtenerDatos(`${URL}listar_recibos_cobro_pago/${registro.id}/${empresa_id}`);
        manejarSelect(selectFacturas, { datosRegistro: facturas, llavesOpciones: { valor: "id", detalle: [{dato:"fecha", tipo:"fecha"}, "nro_recibo", "cliente_proveedor", "tipo"] } });

        // Preparación y envio de formulario y control de la respuesta
        // Al enviar el formulario, se registra registra la factura a la cuenta y se actualiza la tabla principal
        elementoFormulario.addEventListener("submit", (e) => {
            e.preventDefault();

            botonConsolidar.disabled = true;
            botonConsolidar.innerHTML = contenidoDeCargaBtn("Agregar");

            const datosFormulario = new FormData(elementoFormulario);
            const objFormulario = Object.fromEntries(datosFormulario.entries());

            // IDs seleccionados (string)
            const facturasSeleccionadas = new Set(datosFormulario.getAll("factura[]"));
            // Preparar los datos de las facturas seleccionadas
            const datosFactura = facturas
                .filter(({ id }) => facturasSeleccionadas.has(id.toString()))
                .map(({ id, monto }) => ({
                    idrecibo: id,
                    monto: monto
                }));

            // Datos para el envío
            const fecha = obtenerFechaActual();
            const datos = {
                ver: "asignar_recibos_A_cuentas",
                idempresa: empresa_id,
                idsucursal: sucursal_id,
                fecha: fecha,
                recibos:  datosFactura,
                idtrans: registroTransaccion.id,
                idasientotipo: "",
                glosa: "",
                sumar_reemplazar: objFormulario.sumar_reemplazar,
                cuenta: registro.id,
            }
            const enviado = async () => {
                const listaDeRegistros = await obtenerDatos(URL_LT);
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Registro exitoso");
                cerrarModal();
            }
            const error = () => {
                alertaDeError(contenedorDeAlertas, "Ocurrió un error al realizar el registro");
                cerrarModal();
            }
            // Envío de datos para el registro
            enviarDatosOJson({
                datos: datos,
                urlSolicitud: URL,
                callbackExito: enviado,
                callbackError: error,
                tipoJSON: true,
            });
        });
    };
}

function agregarFactComACuenta(datosVista) {
    const {
        URL,
        URL_LT,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registroTransaccion,
        registro,
    } = datosVista;

    const empresa_id = getEmpresaId();
    const sucursal_id = getSucursalId();
    const usuario_id = getUsuarioId();

    return async () => {
        // Creación del modal y formulario
        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Agregar Factura (Comercial)"});
        const [selectFacturas, divFacturas] = campoSelect(
            { atributos: { id: "transasiento-factura", name: "factura[]", required: true, multiple: true } },
            { contenido: "Facturas" },
        );
        const [, divConNotas] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-suma`, name: "sumar_reemplazar", value: "suma", required: true } },
            { contenido: "Agregar" },
            { atributos: { class: "col col-auto" } }
        );
        const [, divConFacturas] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-reemplazo`, name: "sumar_reemplazar", value: "reemplazo" } },
            { contenido: "Reemplazar" },
            { atributos: { class: "col col-auto" } }
        );
        const [, divConRecibos] = campoCheckbox(
            { atributos: { type: "radio", id: `transasiento-vincular`, name: "sumar_reemplazar", value: "vincular" } },
            { contenido: "Solo vincular" },
            { atributos: { class: "col col-auto" } }
        );
        const divSumarReemplazar = crearElemento("div", { class: "d-flex flex-wrap gap-3 mt-3" }, [divConNotas, divConFacturas, divConRecibos]);

        const botonConsolidar = crearElemento("button", { class: "btn btn-primary", type: "submit", id:"btn-enviar-formulario", style: "min-width: 100px;" }, ["Agregar"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 100px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-4" }, [botonConsolidar, botonCancelar]);
        const elementoFormulario = crearElemento("form", undefined, [divFacturas, divSumarReemplazar, divBotones]);

        cuerpoModal.appendChild(elementoFormulario);
        vistaPrincipal.appendChild(modal);

        // Rellenar select de facturas
        selectEnEspera(selectFacturas);
        const facturas = await obtenerDatos(`${URL}listar_facturas_comercial_cobro/${registro.id}/${empresa_id}`);
        manejarSelect(selectFacturas, { datosRegistro: facturas, llavesOpciones: { valor: "id", detalle: [{dato:"fechaventa", tipo:"fecha"}, "nfactura", "cliente", "tipo"] } });

        // Preparación y envio de formulario y control de la respuesta
        // Al enviar el formulario, se registra registra la factura a la cuenta y se actualiza la tabla principal
        elementoFormulario.addEventListener("submit", (e) => {
            e.preventDefault();

            botonConsolidar.disabled = true;
            botonConsolidar.innerHTML = contenidoDeCargaBtn("Agregar");

            const datosFormulario = new FormData(elementoFormulario);
            const objFormulario = Object.fromEntries(datosFormulario.entries());

            // IDs seleccionados (string)
            const facturasSeleccionadas = new Set(datosFormulario.getAll("factura[]"));
            // Preparar los datos de las facturas seleccionadas
            const datosFactura = facturas
                .filter(({ id }) => facturasSeleccionadas.has(id.toString()))
                .map(({ id, montototal }) => {
                    return {
                        idfactura_comercial: id,
                        monto: montototal
                    }
                });

            // Datos para el envío
            const datos = {
                ver: "asignar_facturas_comercial_A_cuentas",
                facturas_comercial: JSON.stringify(datosFactura),
                // cajasBancos: "",
                // asiento_modelo: "",
                // transaccion: registroTransaccion.id,
                // fecha: "",
                empresa: empresa_id,
                // sucursal: sucursal_id,
                // zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                // usuario: usuario_id,
                cuenta: registro.id,
                sumar_reemplazar: objFormulario.sumar_reemplazar,
                // glosa: "",
            }

            const enviado = async () => {
                const listaDeRegistros = await obtenerDatos(URL_LT);
                cargarContenidoTabla(listaDeRegistros);
                alertaDeExito(contenedorDeAlertas, "Registro exitoso");
                cerrarModal();
            }
            const error = () => {
                alertaDeError(contenedorDeAlertas, "Ocurrió un error al realizar el registro");
                cerrarModal();
            }
            // Envío de datos para el registro
            enviarDatosOJson({
                datos: datos,
                urlSolicitud: URL,
                callbackExito: enviado,
                callbackError: error,
                tipoJSON: true,
            });
        });
    };
}

/**
 * Función: Abre un modal para ver las facturas asociadas a una cuenta.
 * Descripción: Muestra un modal con una tabla que lista todas las facturas asociadas a la cuenta seleccionada.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
function verFacturasDeCuenta(vistaPrincipal, registroCuenta, registroTransaccion, permisos) {
    const ES_EDITABLE = permisos.esEditable;

    return () => {
        const [modal, cuerpoModal] = modalRemovible({tituloModal: "Facturas", estiloModal: "width: 900px; min-width: 300px;"});

        const URL_LT = `${CT_URLAPI}listar_facturas_asignado_cuentas/${registroCuenta.id}`;

        const encabezadoTabla = [
            "Desvincular",
            "Fecha",
            "N° Factura",
            "Concepto",
            "Cliente/Proveedor",
            "Monto Factura",
        ]
        const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
        const contenedorDeAlertas = crearElemento("div");
        cuerpoModal.append(contenedorDeAlertas, divTabla);

        // Manejar el listado en la tabla
        manejarListadoTabla({
            urlSolicitud: URL_LT,
            callbackCargarTabla: cargarContenidoTabla,
            cuerpoTabla: tbody,
        });
        // Función para cargar el contenido de la tabla
        function cargarContenidoTabla(listaRegistros) {
            const validado = validarListadoTabla(listaRegistros);
            if ( !validado.valido ) {
                tbody.replaceChildren(validado.fila);
                return;
            }

            let objetoRegistros = {};
            const fragment = document.createDocumentFragment();

            let montoFactura = 0;
            for (const registro of listaRegistros) {
                montoFactura += Math.round(parseFloat(registro.montofactura || 0) * 100);
                const celdas = [
                    crearElemento("td", { class: "text-center", style: "width: 70px;" }, [
                        ES_EDITABLE
                            ? columnaCheckboxDesvincular({
                                vistaPrincipal: cuerpoModal,
                                contenedorDeAlertas,
                                cargarContenidoTabla,
                                registroCuenta,
                                registro,
                                divTabla,
                                URL_LT,
                                objetoRegistros,
                                registroTransaccion,
                                tipoDocumento: "facturas"
                            })
                            : "-"
                    ]),
                    crearElemento("td", undefined, [formatoFecha(registro.fecha) || "-"]),
                    crearElemento("td", undefined, [registro.nfactura || "-"]),
                    crearElemento("td", undefined, [registro.por_concepto_de || "-"]),
                    crearElemento("td", undefined, [registro.cliente_proveedor || "-"]),
                    crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montofactura)]),
                ];

                const fila = crearElemento("tr", undefined, [ ...celdas]);
                fragment.appendChild(fila);
            }
            // Agregar fila de totales al final de la tabla
            const filaTotal = crearFilaTotalTabla({
                columnasTexto: 5,
                columnasFinal: 0,
                valores: [montoFactura/100]
            });
            fragment.appendChild(filaTotal);

            tbody.replaceChildren(fragment);
        }
        vistaPrincipal.appendChild(modal);
    };
}

/**
 * Función: Abre un modal para ver los Cobros o Pagos asociadas a una cuenta.
 * Descripción: Muestra un modal con una tabla que lista todos los cobros o pagos asociadas a la cuenta seleccionada.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
function verCobrosPagosDeCuenta(vistaPrincipal, registroCuenta, registroTransaccion, permisos) {
    const ES_EDITABLE = permisos.esEditable;

    return () => {
        const [modal, cuerpoModal] = modalRemovible({tituloModal: "Pagos/Cobros", estiloModal: "width: 1100px; min-width: 300px;"});

        const URL_LT = `${CT_URLAPI}listar_comprobantes_asignado_cuentas/${registroCuenta.id}`;
        const encabezadoTabla = [
            "Desvincular",
            "Fecha",
            "N° Comprobante",
            "Lugar",
            "Persona",
            "CI",
            "Tipo",
            "Monto"
        ]
        const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
        const contenedorDeAlertas = crearElemento("div");
        cuerpoModal.append(contenedorDeAlertas, divTabla);

        // Manejar el listado en la tabla
        manejarListadoTabla({
            urlSolicitud: URL_LT,
            callbackCargarTabla: cargarContenidoTabla,
            cuerpoTabla: tbody,
        });
        // Función para cargar el contenido de la tabla
        function cargarContenidoTabla(listaRegistros) {
            const validado = validarListadoTabla(listaRegistros);
            if ( !validado.valido ) {
                tbody.replaceChildren(validado.fila);
                return;
            }

            let objetoRegistros = {};
            const fragment = document.createDocumentFragment();
            let totalMonto = 0;
            for (const registro of listaRegistros) {
                totalMonto += Math.round(parseFloat(registro.monto || 0) * 100);
                const celdas = [
                    crearElemento("td", { class: "text-center", style: "width: 70px;" }, [
                        ES_EDITABLE
                            ? columnaCheckboxDesvincular({
                                vistaPrincipal: cuerpoModal,
                                contenedorDeAlertas,
                                cargarContenidoTabla,
                                registroCuenta,
                                registro,
                                divTabla,
                                URL_LT,
                                objetoRegistros,
                                registroTransaccion,
                                tipoDocumento: "comprobantes"
                            })
                            : "-"
                    ]),
                    crearElemento("td", undefined, [formatoFecha(registro.fecha) || "-"]),
                    crearElemento("td", undefined, [registro.nrecibo || "-"]),
                    crearElemento("td", undefined, [registro.lugar || "-"]),
                    crearElemento("td", undefined, [registro.persona || "-"]),
                    crearElemento("td", undefined, [registro.ci || "-"]),
                    crearElemento("td", undefined, [registro.tipo || "-"]),
                    crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                ];

                const fila = crearElemento("tr", undefined, [ ...celdas]);
                fragment.appendChild(fila);
            }
            // Agregar fila de totales al final de la tabla
            const filaTotal = crearFilaTotalTabla({
                columnasTexto: 7,
                columnasFinal: 0,
                valores: [totalMonto/100]
            });
            fragment.appendChild(filaTotal);

            tbody.replaceChildren(fragment);
        }
        vistaPrincipal.appendChild(modal);
    };
}

/**
 * Función: Abre un modal para ver los Recibos asociadas a una cuenta.
 * Descripción: Muestra un modal con una tabla que lista todos los recibos asociadas a la cuenta seleccionada.
 * Fecha: 02 de febrero de 2026
 * Autor: Joel Choque
 */
function verRecibosDeCuenta(vistaPrincipal, registroCuenta, registroTransaccion, permisos) {
    const ES_EDITABLE = permisos.esEditable;

    return () => {
        const [modal, cuerpoModal] = modalRemovible({tituloModal: "Recibos", estiloModal: "width: 1100px; min-width: 300px;"});

        const URL_LT = `${CT_URLAPI}listar_recibos_asignado_cuentas/${registroCuenta.id}`;
        const encabezadoTabla = [
            "Desvincular",
            "Fecha",
            "N° Recibo",
            "Concepto",
            "Cliente/Proveedor",
            "Monto Recibo",
        ]
        const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
        const contenedorDeAlertas = crearElemento("div");
        cuerpoModal.append(contenedorDeAlertas, divTabla);

        // Manejar el listado en la tabla
        manejarListadoTabla({
            urlSolicitud: URL_LT,
            callbackCargarTabla: cargarContenidoTabla,
            cuerpoTabla: tbody,
        });
        // Función para cargar el contenido de la tabla
        function cargarContenidoTabla(listaRegistros) {
            const validado = validarListadoTabla(listaRegistros);
            if ( !validado.valido ) {
                tbody.replaceChildren(validado.fila);
                return;
            }

            let objetoRegistros = {};
            const fragment = document.createDocumentFragment();
            let totalMonto = 0;
            for (const registro of listaRegistros) {
                totalMonto += Math.round(parseFloat(registro.monto || 0) * 100);
                const celdas = [
                    crearElemento("td", { class: "text-center", style: "width: 70px;" }, [
                        ES_EDITABLE
                        ? columnaCheckboxDesvincular({
                            vistaPrincipal: cuerpoModal,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registroCuenta,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                            registroTransaccion,
                            tipoDocumento: "recibos"
                        })
                        : "-"
                    ]),
                    crearElemento("td", undefined, [formatoFecha(registro.fecha) || "-"]),
                    crearElemento("td", undefined, [registro.nro_recibo || "-"]),
                    crearElemento("td", undefined, [registro.concepto || "-"]),
                    crearElemento("td", undefined, [registro.cliente_proveedor || "-"]),
                    crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                ];

                const fila = crearElemento("tr", undefined, [ ...celdas]);
                fragment.appendChild(fila);
            }
            // Agregar fila de totales al final de la tabla
            const filaTotal = crearFilaTotalTabla({
                columnasTexto: 5,
                columnasFinal: 0,
                valores: [totalMonto/100]
            });
            fragment.appendChild(filaTotal);

            tbody.replaceChildren(fragment);
        }
        vistaPrincipal.appendChild(modal);
    };
}

function verFacturasComercial(vistaPrincipal, registroCuenta, registroTransaccion, permisos) {
    const ES_EDITABLE = permisos.esEditable;

    return () => {
        const [modal, cuerpoModal] = modalRemovible({tituloModal: "Facturas (Comercial)", estiloModal: "width: 1100px; min-width: 300px;"});

        const URL_LT = `${CT_URLAPI}listar_facturas_comercial_asignado_cuentas/${registroCuenta.id}`;
        const encabezadoTabla = [
            "Desvincular",
            "Fecha",
            "N° Factura",
            "Cliente/Proveedor",
            "Monto Factura",
        ]
        const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
        const contenedorDeAlertas = crearElemento("div");
        cuerpoModal.append(contenedorDeAlertas, divTabla);

        // Manejar el listado en la tabla
        manejarListadoTabla({
            urlSolicitud: URL_LT,
            callbackCargarTabla: cargarContenidoTabla,
            cuerpoTabla: tbody,
        });
        // Función para cargar el contenido de la tabla
        function cargarContenidoTabla(listaRegistros) {
            const validado = validarListadoTabla(listaRegistros);
            if ( !validado.valido ) {
                tbody.replaceChildren(validado.fila);
                return;
            }

            let objetoRegistros = {};
            const fragment = document.createDocumentFragment();
            let totalMonto = 0;
            for (const registro of listaRegistros) {
                totalMonto += Math.round(parseFloat(registro.montofactura || 0) * 100);
                const celdas = [
                    crearElemento("td", { class: "text-center", style: "width: 70px;" }, [
                        ES_EDITABLE
                        ? columnaCheckboxDesvincular({
                            vistaPrincipal: cuerpoModal,
                            contenedorDeAlertas,
                            cargarContenidoTabla,
                            registroCuenta,
                            registro,
                            divTabla,
                            URL_LT,
                            objetoRegistros,
                            registroTransaccion,
                            tipoDocumento: "comercial"
                        })
                        : "-"
                    ]),
                    crearElemento("td", undefined, [formatoFecha(registro.fecha) || "-"]),
                    crearElemento("td", undefined, [registro.nfactura || "-"]),
                    crearElemento("td", undefined, [registro.cliente || "-"]),
                    crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.montofactura)]),
                ];

                const fila = crearElemento("tr", undefined, [ ...celdas]);
                fragment.appendChild(fila);
            }
            // Agregar fila de totales al final de la tabla
            const filaTotal = crearFilaTotalTabla({
                columnasTexto: 4,
                columnasFinal: 0,
                valores: [totalMonto/100]
            });
            fragment.appendChild(filaTotal);

            tbody.replaceChildren(fragment);
        }
        vistaPrincipal.appendChild(modal);
    };
}

function verVinculacionesDeCuenta(vistaPrincipal, registroCuenta, registroTransaccion, permisos) {
    const ES_EDITABLE = permisos.esEditable;

    return () => {
        // Controlador de la tabla para gestionar los datos y filtros
        const controladorTabla = crearGestorTabla();

        const [modal, cuerpoModal] = modalRemovible({tituloModal: "Documentos", estiloModal: "width: 1100px; min-width: 300px;"});

        const URL_LT = `${CT_URLAPI}listar_todos_documentos_asignado_cuenta/${registroCuenta.id}`;
        const encabezadoTabla = [
            // "Desvincular",
            "Fecha",
            "N° Doc.",
            "Concepto",
            "Cliente/Proveedor",
            "Monto",
            "Tipo Doc.",
        ];
        const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
        const contenedorDeAlertas = crearElemento("div");

        // Filtro para mostrar las los documentos por tipo (factura, recibo, comprobante)
        const { divTipo, selectTipo, limpiarFiltros} = filtroPersonalizadoPorTipo(controladorTabla.setOtrosFiltros);
        const divFiltros = crearFiltrosTabla({
            // obtenerContenidoReporte: pdfMakeFacturasDeCobro(controladorTabla.getDatosOriginales),
            // contenedorPrincipal: vistaPrincipal,
            controladorTabla,
            filtroFecha: false,
            filtrosPersonalizados: {
            elementosFiltro: [
                { contenedor: divTipo, elemento: selectTipo }
            ],
            limpiar: limpiarFiltros
        }
        });
        cuerpoModal.append(contenedorDeAlertas, divFiltros, divTabla);

        // Inicialización del controlador de la tabla para gestionar los datos y filtros
        controladorTabla.suscribir("tabla", (lista) => {
            const validado = validarListadoTabla(lista);
            if ( !validado.valido ) {
                tbody.replaceChildren(validado.fila);
                return;
            }

            let objetoRegistros = {};
            const fragment = document.createDocumentFragment();
            let totalMonto = 0;
            for (const item of lista) {
                const registro = item.raw;
                totalMonto += Math.round(parseFloat(registro.monto || 0) * 100);
                const celdas = [
                    // crearElemento("td", { class: "text-center", style: "width: 70px;" }, [
                    //     ES_EDITABLE
                    //     ? columnaCheckboxDesvincular({
                    //         vistaPrincipal: cuerpoModal,
                    //         contenedorDeAlertas,
                    //         cargarContenidoTabla,
                    //         registroCuenta,
                    //         registro,
                    //         divTabla,
                    //         URL_LT,
                    //         objetoRegistros,
                    //         registroTransaccion,
                    //         tipoDocumento: "comercial"
                    //     })
                    //     : "-"
                    // ]),
                    crearElemento("td", undefined, [formatoFecha(registro.fecha) || "-"]),
                    crearElemento("td", undefined, [registro.nro_documento || "-"]),
                    crearElemento("td", undefined, [registro.concepto || "-"]),
                    crearElemento("td", undefined, [registro.cliente_proveedor || "-"]),
                    crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
                    crearElemento("td", undefined, [obtenerTipoDocumento(registro.tipo) || "-"]),
                ];

                const fila = crearElemento("tr", undefined, [ ...celdas]);
                fragment.appendChild(fila);
            }
            // Agregar fila de totales al final de la tabla
            const filaTotal = crearFilaTotalTabla({
                columnasTexto: 4,
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
                    return {
                        raw: registro,
                        fechaTexto: formatoFecha(registro.fecha) || "-",
                        tipoDocumento: registro.tipo || "",
                        textoBusqueda: [
                            registro.nro_documento,
                            registro.concepto,
                            registro.cliente_proveedor,
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
            cuerpoTabla: tbody,
        });

        vistaPrincipal.appendChild(modal);
    };
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

/**
 * Función: Crea una columna con un checkbox para desvincular registros.
 * Descripción: Esta función crea un checkbox que permite seleccionar registros para desvincularlos. Al marcar el checkbox, se agrega el registro a un objeto de registros seleccionados y se muestra un botón para realizar la desvinculación.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
function columnaCheckboxDesvincular(datosVista) {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        registro,
        registroCuenta,
        divTabla,
        objetoRegistros,
        URL_LT,
        registroTransaccion,
        tipoDocumento,
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
        switch(tipoDocumento) {
            case "facturas":
                botonDesvincularFactura({ botonAsientoOTransaccion, divOpciones, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, objetoRegistros, URL_LT, registroTransaccion, registroCuenta});
                break;
            case "comprobantes":
                botonDesvincularComprobante({ botonAsientoOTransaccion, divOpciones, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, objetoRegistros, URL_LT, registroTransaccion, registroCuenta});
                break;
            case "recibos":
                botonDesvincularRecibos({ botonAsientoOTransaccion, divOpciones, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, objetoRegistros, URL_LT, registroTransaccion, registroCuenta});
                break;
            // case "comercial":
            //     botonDesvincularFacturasComercial({ botonAsientoOTransaccion, divOpciones, vistaPrincipal, contenedorDeAlertas, cargarContenidoTabla, objetoRegistros, URL_LT, registroTransaccion, registroCuenta});
            //     break;
            default:
                break;
        }

    });

    return input;
}

/**
 * Función: Crea un botón que abre un modal para desvincular facturas de una cuenta.
 * Descripción: Al hacer clic en el botón, se muestra un modal de confirmación. Si se confirma, se envían los datos para desvincular las facturas seleccionadas de la cuenta y se actualiza la tabla principal.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
function botonDesvincularFactura(datos) {
    const {
        botonAsientoOTransaccion,
        divOpciones,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        objetoRegistros,
        URL_LT,
        registroTransaccion,
        registroCuenta
    } = datos;

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
                ver: "desvincular_facturas_de_cuentas",
                idempresa: empresa_id,
                idsucursal: sucursal_id,
                fecha: fecha,
                facturas:  datosFactura,
                idtrans: registroTransaccion.id,
                idasientotipo: "",
                glosa: "",
                cuenta: registroCuenta.id,
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
}

/**
 * Función: Crea un botón que abre un modal para desvincular comprobantes de una cuenta.
 * Descripción: Al hacer clic en el botón, se muestra un modal de confirmación. Si se confirma, se envían los datos para desvincular los comprobantes seleccionados de la cuenta y se actualiza la tabla principal.
 * Fecha: 06 de enero de 2026
 * Autor: Joel Choque
 */
function botonDesvincularComprobante(datos) {
    const {
        botonAsientoOTransaccion,
        divOpciones,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        objetoRegistros,
        URL_LT,
        registroTransaccion,
        registroCuenta
    } = datos;

    botonAsientoOTransaccion.addEventListener("click", async (e) => {
        const empresa_id = getEmpresaId();
        const URL = CT_URLAPI;

        // Obtener el formulario modal con los campos necesarios
        const desvincular = async () => {
            // Preparar los datos de las facturas seleccionadas
            const datosComprobante = [];
            for (const key in objetoRegistros) {
                const factura = {idcomprobante: objetoRegistros[key].id, monto: objetoRegistros[key].monto, tipo_comprobante: objetoRegistros[key].tipo};
                datosComprobante.push(factura);
            }

            // Datos para el envío
            const fecha = obtenerFechaActual();
            const datos = {
                ver: "desvincular_comprobantes_de_cuentas",
                idempresa: empresa_id,
                fecha: fecha,
                comprobantes:  datosComprobante,
                idtrans: registroTransaccion.id,
                idasientotipo: "",
                cuenta: registroCuenta.id,
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
}

/**
 * Función: Crea un botón que abre un modal para desvincular recibos de una cuenta.
 * Descripción: Al hacer clic en el botón, se muestra un modal de confirmación. Si se confirma, se envían los datos para desvincular los recibos seleccionados de la cuenta y se actualiza la tabla principal.
 * Fecha: 25 de febrero de 2026
 * Autor: Joel Choque
 */
function botonDesvincularRecibos(datos) {
    const {
        botonAsientoOTransaccion,
        divOpciones,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        objetoRegistros,
        URL_LT,
        registroTransaccion,
        registroCuenta
    } = datos;

    botonAsientoOTransaccion.addEventListener("click", async (e) => {
        const empresa_id = getEmpresaId();
        const URL = CT_URLAPI;

        // Obtener el formulario modal con los campos necesarios
        const desvincular = async () => {
            // Preparar los datos de las facturas seleccionadas
            const datosComprobante = [];
            for (const key in objetoRegistros) {
                const recibo = {idrecibo: objetoRegistros[key].id, monto: objetoRegistros[key].monto};
                datosComprobante.push(recibo);
            }

            // Datos para el envío
            const fecha = obtenerFechaActual();
            const datos = {
                ver: "desvincular_recibos_de_cuentas",
                idempresa: empresa_id,
                // fecha: fecha,
                recibos:  datosComprobante,
                // idtrans: registroTransaccion.id,
                // idasientotipo: "",
                cuenta: registroCuenta.id,
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
}

/**
 * Función: Crea un botón que abre un modal para desvincular las facturas de comercial de una cuenta.
 * Descripción: Al hacer clic en el botón, se muestra un modal de confirmación. Si se confirma, se envían los datos para desvincular las facturas seleccionadas de la cuenta y se actualiza la tabla principal.
 * Fecha: 25 de febrero de 2026
 * Autor: Joel Choque
 */
function botonDesvincularFacturasComercial(datos) {
    const {
        botonAsientoOTransaccion,
        divOpciones,
        vistaPrincipal,
        contenedorDeAlertas,
        cargarContenidoTabla,
        objetoRegistros,
        URL_LT,
        registroTransaccion,
        registroCuenta
    } = datos;

    botonAsientoOTransaccion.addEventListener("click", async (e) => {
        const empresa_id = getEmpresaId();
        const URL = CT_URLAPI;

        // Obtener el formulario modal con los campos necesarios
        const desvincular = async () => {
            // Preparar los datos de las facturas seleccionadas
            const datosComprobante = [];
            for (const key in objetoRegistros) {
                const factura = {idcomprobante: objetoRegistros[key].id, monto: objetoRegistros[key].monto, tipo_comprobante: objetoRegistros[key].tipo};
                datosComprobante.push(factura);
            }

            // Datos para el envío
            const fecha = obtenerFechaActual();
            const datos = {
                ver: "desvincular___de_cuentas",
                idempresa: empresa_id,
                fecha: fecha,
                comprobantes:  datosComprobante,
                idtrans: registroTransaccion.id,
                idasientotipo: "",
                cuenta: registroCuenta.id,
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
}


function filtroPersonalizadoPorTipo(setOtrosFiltros) {
    const [selectTipo, divTipo] = campoSelectGroup(
        { atributos: { id: "facventacm-tipodoc", name: "tipo_doc"} },
        { contenido: "Tipo" },
    );
    selectTipo.innerHTML = `
        <option value="" selected>Todos</option>
        <option value="factura_contabilidad">Facturas Contabilidad</option>
        <option value="factura_comercial">Factura Comercial</option>
        <option value="comprobante">Comprobantes</option>
        <option value="recibo">Recibos</option>
        `;
    const fnFiltroTipoPago = (item) => {
        if (selectTipo.value && !item.tipoDocumento.includes(selectTipo.value)) {
            return false;
        }
        return true;
    }
    const limpiarFiltros = () => {
        selectTipo.value = "";
    }
    selectTipo.addEventListener("change", (e) => {
        setOtrosFiltros(fnFiltroTipoPago);
    });
    return { selectTipo, divTipo, limpiarFiltros };
}

function obtenerTipoDocumento(tipo) {
    let tipoDocumento;
    switch (tipo) {
        case "factura_contabilidad":
            tipoDocumento = "Factura (Contabilidad)";
            break;
        case "factura_comercial":
            tipoDocumento = "Factura (Comercial)";
            break;
        case "comprobante":
            tipoDocumento = "Comprobante";
            break;
        case "recibo":
            tipoDocumento = "Recibo";
            break;
        default:
            tipoDocumento = "";
    }
    return tipoDocumento;
}