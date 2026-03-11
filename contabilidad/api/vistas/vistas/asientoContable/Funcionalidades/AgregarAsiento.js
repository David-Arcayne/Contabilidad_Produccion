import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { manejarSelect } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { botonEnCarga, cambiarVista, crearElemento, formatoDecimal, mostrarJerarquiaPlanDeCuentas, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { botonModalEditar, botonModalEliminar } from "../../../funciones/OpcionesBasicas.js";
import { enviarDatosOJson, obtenerDatos, reiniciarFormulario, verificarErroresNativosDeInputs } from "../../../funciones/Solicitudes.js";
import { formularioAgregarAsiento } from "../Formularios.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de asientos modelo
 *              Permite agregar cuentas al asiento mediante formularios y tablas dinámicas.
 * Fecha: 07 de enero de 2026
 * Autor: Joel Choque
 */
export const AgregarAsiento = (datosVista) => {
    const {
        permisos,
        vistaAsientoModelo,
        vistaAgregarAsiento,
        registroAsiento,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const PUEDE_ELIMINAR = permisos.eliminar === "1";
    const PUEDE_ESCRIBIR = permisos.escritura === "1";
    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;
    const URL_LT = `${URL}listaasientosc/${registroAsiento.id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaAgregarAsiento.append(vistaPrincipal);


    // Creación de elementos para la vista principal
    const spanAsiento = crearElemento("span", { class: "fw-bold" }, [`Asiento: `]);
    const divAsiento = crearElemento("div", undefined, [spanAsiento, registroAsiento.nombre]);
    const spanTipo = crearElemento("span", { class: "fw-bold" }, [`Tipo: `]);
    const divTipo = crearElemento("div", undefined, [spanTipo, registroAsiento.tipo ?? "-"]);
    const divInformacion = crearElemento("div", { class: "pb-2" }, [divAsiento, divTipo]);
    const regresar = () => {
        cambiarVista(vistaAgregarAsiento, vistaAsientoModelo);
        vistaAgregarAsiento.innerHTML = "";
    }
    const encabezadoVista = seccionEncabezado(
        { titulo: "Creación de Asiento Modelo", elementoAdicional: divInformacion },
        { callback: regresar }
    );
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    const encabezadoTabla = [
        "Código",
        "Cuenta",
        "%",
        "Tipo",
        "Opciones",
    ];
    // Si no tiene permisos ni para editar ni para eliminar, se remueve la columna de opciones
    if (!PUEDE_EDITAR && !PUEDE_ELIMINAR) {
        encabezadoTabla.pop();
    }
    const [divTabla, tabla, [tbodyRegistro, tbody]] = tablaResponsiva(encabezadoTabla, {cuerpo: 2, cuerpoPrincipal: 1});

    if (PUEDE_ESCRIBIR) {
        // Función para crear la fila de registro de nueva cuenta
        async function cargarFilaRegistro () {
            const filaRegistro = crearElemento("tr");
            // Crear campos para el registro de una nueva cuenta
            const selectCuenta = crearElemento("select", { class: "form-select", id: "filaasientomodelo-cuenta", required: true });
            manejarSelect(
                selectCuenta,
                {
                    urlSolicitud: `${URL}lista_plande_subcuentas/${EMPRESA_ID}`,
                    llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
                    panelDetalle: mostrarJerarquiaPlanDeCuentas,
                },
                undefined,
                filaRegistro
            );
            const inputPorcentaje = crearElemento("input", { type: "number", step: "0.01", id:"filaasientomodelo-porcentaje", class: "form-control", onkeydown: "return event.key !== 'e' && event.key !== 'E'", required: true, min: 0, max: 100 });
            const selectTipo = crearElemento("select", { class: "form-select", id: "filaasientomodelo-tipo", required: true });
            selectTipo.innerHTML = `
                <option value="">-- Elija una opción --</option>
                <option value="DEBE">DEBE</option>
                <option value="HABER">HABER</option>`;

            const textoRegistrar = "Registrar";
            const iconoRegistrar = crearElemento("i", { class: "bi bi-plus-lg pe-1" });
            const botonRegistrar = crearElemento("button", { class: "btn btn-primary text-nowrap" }, [iconoRegistrar, textoRegistrar]);

            const campos = [selectCuenta, inputPorcentaje, selectTipo];
            // Preparación de datos para el envío al registrar
            botonRegistrar.addEventListener("click", async (e) => {
                e.preventDefault();
                const fnBotonInicial = botonEnCarga(botonRegistrar);
                if (!verificarErroresNativosDeInputs(campos)){
                    fnBotonInicial();
                    return;
                }
                const accionEnviar = async() => {
                    reiniciarFormulario(campos);
                    // Actualizar la tabla con los nuevos datos
                    const listaDeRegistros = await obtenerDatos(URL_LT);
                    alertaDeExito(contenedorDeAlertas, "Registro de cuenta exitoso");
                    cargarContenidoTabla(listaDeRegistros)
                    fnBotonInicial();
                };
                const error = () => {
                    alertaDeError(contenedorDeAlertas, "Error al registrar la cuenta");
                    fnBotonInicial();
                };
                const advertencia = (respuesta) => {
                    alertaDeAdvertencia(contenedorDeAlertas, respuesta[1]);
                    fnBotonInicial();
                };
                // Preparación de datos para el envío
                const datos = {
                    ver: "registrocrearasientos",
                    empresa: EMPRESA_ID,
                    asiento: registroAsiento.id,
                    cuenta: selectCuenta.value,
                    porciento: inputPorcentaje.value,
                    tipo: selectTipo.value,
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
                crearElemento("td", { class: "text-end" }, ["-"]),
                crearElemento("td", { style: "width: 30%; min-width: 340px; max-width: 340px;" }, [selectCuenta]),
                crearElemento("td", { style: "min-width: 100px"}, [inputPorcentaje]),
                crearElemento("td", undefined, [selectTipo]),
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

        let totalDebe = 0;
        let totalHaber = 0;
        for (const registro of listaRegistros) {

            totalDebe += registro.tipo === "DEBE" ? Math.round(parseFloat(registro.porciento || 0) * 100) : 0;
            totalHaber += registro.tipo === "HABER" ? Math.round(parseFloat(registro.porciento || 0) * 100) : 0;

            const celdas = [
                crearElemento("td", { class: "text-end" }, [registro.numero || "-"]),
                crearElemento("td", { style: "width: 30%; min-width: 340px; max-width: 340px;" }, [registro.plan || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.porciento)]),
                crearElemento("td", undefined, [registro.tipo || "-"]),
            ];

            if (PUEDE_EDITAR || PUEDE_ELIMINAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap" });
                if (PUEDE_EDITAR) {
                    // Crear botón editar con modal de formulario
                    const botonEditar= botonModalEditar(
                        {
                            contenedorDeAlertas,
                            camposDeFormulario: formularioAgregarAsiento,
                            URL_FORM: URL,
                            URL_LISTAR: URL_LT,
                            configuracionModal: {
                                tituloModal: "Edición de Asiento Modelo",
                            },
                            camposAdicionales: {
                                ver: "registrocrearasientosf5",
                                empresa: EMPRESA_ID,
                                id: registro.id,
                                asiento: registroAsiento.id,
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
                            URL: `${URL}eliminartasiento/${registro.id}`,
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
        const tdTotal = crearElemento("td", { colspan: "100%", class: "text-center" }, [`DEBE = ${formatoDecimal(totalDebe / 100)}%, HABER = ${formatoDecimal(totalHaber / 100)}%`]);
        const filaPorcentajes = crearElemento("tr", { class: "fw-bold totales" }, [tdTotal]);
        fragment.appendChild(filaPorcentajes);

        tbody.replaceChildren(fragment);
    }


    // Configuración de ayudas visuales de la vista
    const informacionDJs = [
        {
            element: divTabla,
            popover: {
                description: "Dentro el asiento modelo, Las cuentas se eligen a criterio profesional y asignando un % para que el sistema asigne el monto a la cuenta según ese dato. Posteriormente debe indicar si el monto se registrará lado Debe o Haber. Los % del Debe y Haber deben ser iguales, por principio de Partida Doble. A medida que se va diseñando el asiento ya está guardado automáticamente.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Editar']",
            popover: {
                title: "Editar",
                description: "Abre un formulario para modificar los datos del registro seleccionado.",
            },
        },
        {
            mainElement: tabla,
            element: "button[title='Eliminar']",
            popover: {
                title: "Eliminar",
                description: "Permite eliminar el registro seleccionado, previa confirmación.",
            },
        },
    ];
    seccionDriverJS(informacionDJs, vistaPrincipal);
    ajustarAlturaTabla(divTabla, 300);
}