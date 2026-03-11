import { crearFormulario } from "../../funciones/CrearFormulario.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, formatoFecha, seccionDriverJS } from "../../funciones/Funciones.js";
import { obtenerDatos, reiniciarFormulario } from "../../funciones/Solicitudes.js";
import { formularioComprobante, formularioLibroMayor, formularioPeriodico, formularioRepContableBusqueda } from "./Formularios.js";
import { OpcionesReporteContable } from "./Funcionalidades/Funciones.js";
import { ReporteBusqueda, ReporteComprobante, ReporteLibroMayor, ReportePeriodico } from "./Funcionalidades/TipoReporte.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la ventana de Reporte Contable.
 * Fecha: 06 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {PermisosVista} permisos - Permisos de la vista.
 */
export async function ReporteContable(codigo, permisos) {
    const URL = CT_URLAPI;
    const EMPRESA_ID = getEmpresaId();

    // Creación de Vistas para la navegación en la ventana
    const vistaFormulario = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    vistaFormulario.setAttribute("class", "col-12 col-md-3 shadow-sm pb-3 bt-2 border border-light-subtle h-100");
    vistaPrincipal.setAttribute("class", "col-12 col-md-9 mt-4 mt-md-0 pe-0");

    const contenedorPrincipal = vistaPrincipal.parentNode;
    // contenedorPrincipal.append(vistaEditar);

    // Creación de elementos para la sección formulario
    const contenedorOpciones = crearElemento("div", { class: "my-3" });
    const contenedorFormPeriodico = crearElemento("div");
    const contenedorFormComprobante = crearElemento("div", {class: "d-none"});
    const contenedorFormLibroMayor = crearElemento("div", {class: "d-none"});
    const contenedorFormBusquedaDocs = crearElemento("div", {class: "d-none"});
    vistaFormulario.append(contenedorOpciones, contenedorFormPeriodico,contenedorFormComprobante, contenedorFormLibroMayor, contenedorFormBusquedaDocs);

    // Información y opciones de Reporte
    const datoGA = await obtenerDatos(`${URL}getgestionactual/${EMPRESA_ID}`);
    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`Entre ${formatoFecha(datoGA.fechaini)} y ${formatoFecha(datoGA.fechafin)}`]);
        const textGA = crearElemento("p", { style: "font-size:12px;" }, ["Gestión Contable: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-start" }, [textGA])
        contenedorOpciones.appendChild(gestionActiva);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        vistaPrincipal.appendChild(h1);
        return;
    }
    contenedorOpciones.appendChild(OpcionesReporteContable(
        {
            periodico: contenedorFormPeriodico,
            comprobante: contenedorFormComprobante,
            libroMayor: contenedorFormLibroMayor,
            busqueda: contenedorFormBusquedaDocs
        },
        vistaPrincipal,
    ));

    // Formulario de Reporte Contable Periodico
    const formularioP = formularioPeriodico(datoGA);
    contenedorFormPeriodico.appendChild(formularioP);
    // Formulario de Reporte Contable Comprobante
    const formularioC = formularioComprobante(datoGA);
    contenedorFormComprobante.append(formularioC);

    const formularioLM = formularioLibroMayor(datoGA);
    contenedorFormLibroMayor.appendChild(formularioLM);

    const formularioB = crearFormulario(formularioRepContableBusqueda, {
        opcionesParaBotones: {
            nombreEnviar: "Realizar Búsqueda",
            clasesEnviar: "btn btn-primary px-2 text-nowrap",
            nombreCancelar: "Limpiar formulario",
            clasesCancelar: "btn btn-secondary px-2 text-nowrap mt-2",
            callbackCancelar: (evento) => {
                const fecha = formularioB.querySelector("#repcontablebusqueda-fecha");
                fecha.value = "";
                evento.preventDefault();
                reiniciarFormulario(formularioB);
            },

            clasesContenedor: "d-grid",
        }
    });
    contenedorFormBusquedaDocs.append(formularioB);
    formularioB.setAttribute("class", "row gx-2 gy-4");

    // Contenido de la vista principal (PDF)
    ReportePeriodico({
        formulario : formularioP,
        vistaReporte: vistaPrincipal,
        contenedorPrincipal,
        URL,
        EMPRESA_ID,
        datosGestion: datoGA,
    });
    ReporteComprobante({
        formulario: formularioC,
        vistaReporte: vistaPrincipal,
        contenedorPrincipal,
        URL,
        EMPRESA_ID,
        datosGestion: datoGA,
    });
    ReporteLibroMayor({
        formulario: formularioLM,
        vistaReporte: vistaPrincipal,
        contenedorPrincipal,
        URL,
        EMPRESA_ID,
        datosGestion: datoGA,
    });
    ReporteBusqueda({
        formulario: formularioB,
        vistaReporte: vistaPrincipal,
        contenedorPrincipal,
        URL,
        EMPRESA_ID,
        datosGestion: datoGA,
    });


    // Configuración de ayudas visuales de la vista
    const informacionDJsPeriodico = [
        {
            popover: {
                title: "Reporte Contable",
                description: "Reporte Contables relacionados al periodo contable activo en sistema.",
            },
        },
        {
            mainElement: contenedorOpciones,
            element: "[data-id='__periodico']",
            popover: {
                title: "Periódico",
                description: "Reportes dentro de un periodo de inicio y fin, el rango debe determinarse dentro la gestión activa, con las firmas establecidas desde: <i>Configuración/Control Firmas</i>.",
            },
        },
        {
            element: formularioP.querySelector("#repcontableperiodico-reportede")?.parentElement,
            popover: {
                title: "Reporte de",
                description: `<ul>
                    <li>Activo Disponible: muestra los saldos de las cuentas del Activo Disponible.</li>
                    <li>Detalle de Transacciones: Genera un reporte de las transacciones en formato de Libro Diario, con la opción de mostrar con o sin notas. </li>
                    <li>Detalle Facturas p/Transacción: Lista las facturas de Ventas/Compra, que se registraron vinculadas a las transacciones.</li>
                </ul>`,
            },
        },
    ];
    seccionDriverJS(informacionDJsPeriodico, contenedorFormPeriodico);
    const informacionDJsLibroMayor = [
        {
            mainElement: contenedorOpciones,
            element: "[data-id='__libroMayor']",
            popover: {
                title: "Reporte Libro Mayor",
                description: "Genera un Libro Mayor para la Cuenta seleccionada. Se puede obtener entre un rango de cuentas y también elegir mostrar las columnas de Notas y Tipo.",
            },
        },
    ];
    seccionDriverJS(informacionDJsLibroMayor, contenedorFormLibroMayor);

    const informacionDJsComprobante = [
        {
            mainElement: contenedorOpciones,
            element: "[data-id='__comprobante']",
            popover: {
                title: "Comprobante",
                description: "Le permite generar reporte dentro de un periodo cronológico o rango según N° Comprobante.",
            },
        },
        {
            mainElement: formularioC,
            element: "#opciones-c-fecha-numero",
            popover: {
                description: "Permite elegir si se obtendra el reporte dentro de un rango de fechas o por N° Comprobante.",
            },
        },
        {
            element: formularioC.querySelector("#repcontablecomprobante-reportede")?.parentElement,
            popover: {
                title: "Reporte de",
                description: `<ul>
                    <li>Comprobante Contable: generar reporte con o sin: detalle de facturas, notas o lista de Comprobantes de Caja (Ingreso y Egreso) vinculados a la Transacción.</li>
                    <li>Comprobante Caja/Bancos: le permite ver los comprobantes de Ingreso o Egreso.</li>
                </ul>`,
            },
        },
    ];
    seccionDriverJS(informacionDJsComprobante, contenedorFormComprobante);

    const informacionDJsBusqueda = [
        {
            mainElement: contenedorOpciones,
            element: "[data-id='__busqueda']",
            popover: {
                title: "Búsqueda",
                description: "Le permite generar una búsqueda general de documentos de respaldo de transacciones u otras operaciones contables.",
            },
        },
        {
            element: formularioB.querySelector("#repcontablebusqueda-reporte")?.parentElement,
            popover: {
                title: "Documento",
                description: "En base a Facturas y otros documentos de respaldo contable.",
            },
        },
        {
            element: formularioB.querySelector("#repcontablebusqueda-gestion")?.parentElement,
            popover: {
                title: "Buscar en Gestión",
                description: "En base a la gestión contable determinada.",
            },
        },
        {
            element: formularioB.querySelector("#repcontablebusqueda-numero")?.parentElement,
            popover: {
                title: "N° de Documento",
                description: "En base al número de documento.",
            },
        },
        {
            element: formularioB.querySelector("#repcontablebusqueda-nit")?.parentElement,
            popover: {
                title: "Número Tributario",
                description: "En base al NIT del cliente o proveedor.",
            },
        },
        {
            element: formularioB.querySelector("#repcontablebusqueda-tipo")?.parentElement,
            popover: {
                title: "Acción",
                description: "En base al tipo, ya sea de Venta o Compra. Una vez seleccionado el tipo, se habilitará el campo correspondiente [Usuario, Proveedor].",
            },
        },
        {
            element: formularioB.querySelector("#repcontablebusqueda-fecha")?.parentElement,
            popover: {
                title: "Fecha",
                description: "En base a la fecha de emisión del documento.",
            },
        },
        {
            element: formularioB.querySelector("#repcontablebusqueda-monto")?.parentElement,
            popover: {
                title: "Monto",
                description: "En base un monto determinado.",
            },
        },
    ];
    seccionDriverJS(informacionDJsBusqueda, contenedorFormBusquedaDocs);
}