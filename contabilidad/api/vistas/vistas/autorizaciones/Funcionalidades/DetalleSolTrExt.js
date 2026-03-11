import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { manejarSelect } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, crearFilaTotalTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId, getSucursalId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, contenidoDeCargaBtn, crearElemento, formatoDecimal, formatoFecha, mostrarJerarquiaPlanDeCuentas, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { salirConEsc } from "../../../funciones/Modals.js";
import { botonModalEditar, botonModalEliminar, modalFormularioEditar } from "../../../funciones/OpcionesBasicas.js";
import { enviarDatosOJson, obtenerDatos, reiniciarFormulario, verificarErroresNativosDeInputs } from "../../../funciones/Solicitudes.js";
import { agregarImpuestoCalculado, formularioTransaccionAsientoContable } from "../../transacciones/Formularios.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión del detalle de transacciones externas
 * Fecha: 19 de enero de 2026
 * Autor: Joel Choque
 */
export const DetalleTransExterna = (datosVista) => {
    const {
        permisos,
        vistaTransaccion,
        vistaDetalle,
        registroTransaccion,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const URL = CT_URLAPI;
    const EMPRESA_ID = getEmpresaId();
    const SUCURSAL_ID = getSucursalId();
    const URL_LT = `${URL}listadetalletransaccion___/${registroTransaccion.id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    const vistaTranFacturaVenta = crearElemento("div", { class: "d-none", "data-pane-id": "trans-factura-venta"});
    const vistaTranFacturaCompra = crearElemento("div", {class: "d-none", "data-pane-id": "trans-factura-compra"});

    vistaDetalle.append(vistaPrincipal, vistaTranFacturaVenta, vistaTranFacturaCompra);
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
        { titulo: "Asiento Contable", elementoAdicional: divInformacion },
        { callback: regresar }
    );
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);


    const encabezadoTabla = [
        "Código",
        "Cuenta contable",
        "Debe",
        "Haber",
        "Nota",
        "Opciones",
    ];

    const [divTabla, tabla, [tbodyRegistro, tbody]] = tablaResponsiva(encabezadoTabla, {cuerpo: 2, cuerpoPrincipal: 1});

    if ((registroTransaccion.consolidar === "1"  || registroTransaccion.estado === "10") && registroTransaccion.estado !== "2") {
        // Función para crear la fila de registro de nueva cuenta
        async function cargarFilaRegistro () {
            const impuestos = await obtenerDatos(`${URL}impuestolista/${EMPRESA_ID}`);

            const filaRegistro = crearElemento("tr");
            // Crear campos para el registro de una nueva cuenta
            const selectCuenta = crearElemento("select", { class: "form-select", id: "filasolasiento-cuenta", required: true });
            manejarSelect(
                selectCuenta,
                {
                    urlSolicitud: `${URL}lista_plande_subcuentas/${EMPRESA_ID}`,
                    llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
                    panelDetalle: mostrarJerarquiaPlanDeCuentas,
                    callbackInput: agregarImpuestoCalculado("filasolasiento")
                },
                undefined,
                filaRegistro
            );
            const inputDebe = crearElemento("input", { type: "number", step: "0.01", id:"filasolasiento-debe", class: "form-control", value: 0, onkeydown: "return event.key !== 'e' && event.key !== 'E'", required: true, "data-default": "0" });
            const divDebe = crearElemento("div", { class: "d-flex gap-1" }, [inputDebe, botonCalcularMontoImpuesto({inputMonto,impuestos, vistaPrincipal})]);
            const inputHaber = crearElemento("input", { type: "number", step: "0.01", id:"filasolasiento-haber", class: "form-control", value: 0, onkeydown: "return event.key !== 'e' && event.key !== 'E'", required: true, "data-default": "0" });
            const divHaber = crearElemento("div", { class: "d-flex gap-1" }, [inputHaber, botonCalcularMontoImpuesto({inputMonto,impuestos, vistaPrincipal})]);
            const inputNota = crearElemento("textarea", { id:"filasolasiento-nota", class: "form-control", value: "", rows: 1 });

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
                    ver: "detalletransaccionnormal___",
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



            if (PUEDE_EDITAR || PUEDE_ELIMINAR || PUEDE_ESCRIBIR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });

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
                                ver: "detalletransaccionnormal___",
                                trans: registroTransaccion.id,
                                empresa: EMPRESA_ID,
                                sucursal: SUCURSAL_ID,
                                iddetalletransaccion: registro.id,
                            },
                        });
                        vistaPrincipal.appendChild(modal);
                    });
                    tdOpciones.append(botonInsertar, " ");
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
                                ver: "detalletransaccionnormalf5___",
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
                            URL: `${URL}eliminardetalle___/${registro.id}`,
                            contenedorDeAlertas,
                            datosTabla: { elementoTd: tdOpciones },
                            URL_LISTAR: URL_LT,
                            cargarContenidoTabla,
                        },
                        vistaPrincipal
                    );
                    tdOpciones.append(botonEliminar, " ");
                }
                celdas.push(tdOpciones);
            }
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
        }

        tbody.replaceChildren(fragment);
    }

    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
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
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea un botón que abre un menú desplegable para calcular montos de impuestos basados en un monto base.
 * Descripción: Este botón, al ser clickeado, muestra una lista de impuestos configurados. Al seleccionar un impuesto, calcula el monto correspondiente basado en el valor ingresado en un campo de monto y actualiza el cambo de DEBE o HABER con el resultado.
 * Fecha: 19 de enero de 2026
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