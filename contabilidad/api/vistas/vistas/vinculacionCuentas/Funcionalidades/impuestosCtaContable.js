import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { manejarSelect, selectEnEspera } from "../../../funciones/CrearFormulario.js";
import { ajustarAlturaTabla, manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI, getEmpresaId } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, formatoDecimal, InputBusqueda, seccionDriverJS, seccionEncabezado } from "../../../funciones/Funciones.js";
import { enviarDatosOJson, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de la vinculación entre impuestos y cuentas contables.
 *              Permite agregar o cambiar la cuenta contable asociada a cada impuesto.
 * Fecha: 08 de enero de 2026
 * Autor: Joel Choque
 */
export async function ImpuestosCtaContable(datosVista) {
    const {
        codigo,
        permisos,
        vistaImpuestos,
        vistaVincularCuentas,
    } = datosVista;

    const PUEDE_EDITAR = permisos.editar === "1";
    const URL = CT_URLAPI;
    const EMPRESA_ID = getEmpresaId();
    const URL_LT = `${URL}listaimpuestoentreplan/${EMPRESA_ID}`;
    const datosCuenta = await obtenerDatos(`${URL}lista_plan_cuenta_no_vinculada/${EMPRESA_ID}`);

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaVincularCuentas.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = () => {
        cambiarVista(vistaVincularCuentas, vistaImpuestos);
        vistaVincularCuentas.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Impuesto - Cta. Contable" }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "Cod. Impuesto",
        "Impuesto",
        "Tasa",
        "Relación",
        "Cod. Cuenta",
        "Cuenta",
        "Tipo",
        "Opciones",
    ];
    // Si no tiene permisos para editar, se remueve la columna de opciones
    if (!PUEDE_EDITAR) {
        encabezadoTabla.pop();
    }
    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, divTabla);

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

        for (const registro of listaRegistros) {
            const celdas = [
                crearElemento("td", undefined, [registro.codigo || "-"]),
                crearElemento("td", undefined, [registro.nombre || "-"]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.tasa)]),
                crearElemento("td", { class: "text-center" }, [
                    crearElemento("i", { class: "bi bi-arrow-right text-primary fs-6" })
                ]),
                crearElemento("td", undefined, [registro.plannumero || "-"]),
                crearElemento("td", undefined, [registro.plancuenta || "-"]),
                crearElemento("td", undefined, [registro.plantipo || "-"]),
            ];

            if (PUEDE_EDITAR) {
                const tdOpciones = crearElemento("td", { class: "text-nowrap", "data-name": "editar", style:"width: 350px; max-width: 350px; min-width: 350px;" });
                // Agrega un select para cambiar la cuenta contable vinculada
                const inputCambiar = inputCambiarCuenta({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    registroCuentas: datosCuenta,
                    URL_LT,
                    cargarContenidoTabla,
                    registro,
                });

                tdOpciones.append(inputCambiar, " ");
                celdas.push(tdOpciones);
            }

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);

    }

    // Configuración de ayudas visuales de la ventana
    seccionDriverJS(
        [
            {
                popover: {
                    title: "Impuesto - Cta. Contable",
                    description: "En esta sección puede vincular o cambiar la cuenta contable asociada a cada impuesto.",
                }
            },
            {
                mainElement: divBuscar,
                element: "#__buscador",
                popover: {
                    title: "Búsqueda",
                    description: "Permite buscar registros considerando todas las columnas de la tabla.",
                }
            },
            {
                element: divTabla,
                popover: {
                    title: "Listado de Impuestos y Cuentas Contables",
                    description: "Muestra el listado de impuestos junto con sus cuentas contables vinculadas. Desde aquí puede cambiar la cuenta contable asociada a cada impuesto.",
                }
            },
            {
                mainElement: tabla,
                element: "[data-name='editar']",
                popover: {
                    title: "Cambiar Cuenta Contable",
                    description: "Seleccione una cuenta contable diferente para vincularla al impuesto correspondiente.",
                }
            }
        ],
        vistaPrincipal
    );

    ajustarAlturaTabla(divTabla, 300);
}

// =========================================================
// FUNCIONES BOTONES DE TABLA
// =========================================================

/**
 * Función: Crea el input para cambiar la cuenta contable vinculada a un impuesto
 * Descripción: Esta función genera un input de selección que permite cambiar la cuenta contable vinculada a un impuesto específico.
 * Fecha: 08 de enero de 2026
 * Autor: Joel Choque
 */
const inputCambiarCuenta = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        registroCuentas,
        URL_LT,
        registro,
        cargarContenidoTabla
    } = datosVista;

    const EMPRESA_ID = getEmpresaId();
    const URL = CT_URLAPI;

    const input = crearElemento("select", {class: "form-select af-shadow-0" , id: "ci_plandecuentas" });

    const nuevaCuenta = (value) => {
        let datos;
        // Solo proceder si se seleccionó un valor
        if (value.trim() !== ""){
            if(registro.idrelacionip){
                // Si ya existe una relación, se actualiza
                datos = {
                    ver: "registrorelacionipf5",
                    id: registro.idrelacionip,
                    idplandecuenta: value,
                    idimpuesto: registro.idimpuesto,
                    idempresa: EMPRESA_ID
                }
            } else {
                // Si no existe una relación, se crea una nueva
                datos = {
                    ver: "registrorelacionip",
                    idplandecuenta: value,
                    idimpuesto: registro.idimpuesto,
                    idempresa: EMPRESA_ID,
                }
            }
        } else {
            return;
        }

        selectEnEspera(input, "Guardando...");
        const accionEnviar = async() => {
            // Actualizar la tabla con los nuevos datos
            const listado = await obtenerDatos(URL_LT);
            const nuevoListaCuentas = await obtenerDatos(`${URL}lista_plan_cuenta_no_vinculada/${EMPRESA_ID}`);
            registroCuentas.length = 0;
            registroCuentas.push(...nuevoListaCuentas);
            cargarContenidoTabla(listado);
            alertaDeExito(contenedorDeAlertas, "Cuenta vinculada con exito");
        }
        const error = () => {
            alertaDeError(contenedorDeAlertas, "Ocurrio un error");
            manejarSelect(input, { datosRegistro: registroCuentas, llavesOpciones: { valor: "idplandecuenta", detalle: ["numero", "nombreplan"] }, callbackInput: nuevaCuenta });
        }

        // Envío de datos para la consolidación múltiple
        enviarDatosOJson({
            datos,
            urlSolicitud: URL,
            callbackExito: accionEnviar,
            callbackError: error,
        });
    }
    manejarSelect(input, { datosRegistro: registroCuentas, llavesOpciones: { valor: "idplandecuenta", detalle: ["numero", "nombreplan"] }, callbackInput: nuevaCuenta });

    return input;
}