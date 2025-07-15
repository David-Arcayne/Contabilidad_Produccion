import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatosAlr, rellenarSelect } from "../../funciones/Solicitudes.js";
import { crearElemento, FormatoDateTime } from "../../funciones/Funciones.js";
import { Estado } from "./Funcionalidades/Estado.js";
import { Situacion } from "./Funcionalidades/Situacion.js";
import { Notificacion } from "./Funcionalidades/Notificacion.js";
import { BotonPDF, VistaPDF } from "../../funciones/VistaPDF.js";
import { ContenidoPDF } from "./Funcionalidades/ContenidoPDF.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function RegistroSituacion(codigo, permisos) {
    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    if (!objAFTI) {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Seleccione un tipo de inventario para continuar"]);
        vistaPrincipal.appendChild(h1);
        return;
    }

    const URL = "./api/historial";

    // Creación de Vistas para la navegación en la ventana
    const vistaSituacion = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaSituacion.setAttribute("class", "d-none");
    const contenidoFormulario = crearElemento("div", {class: "pb-5"});
   

    // Creación de elementos para la vista Principal
    const contenedorNotificacion = crearElemento("div");
    const notificacion = Notificacion(vistaPrincipal, contenidoFormulario);
    contenedorNotificacion.append(notificacion);

    const icono = crearElemento("i", {class: "pe-2 bi bi-info-circle"});
    const p = crearElemento("p", {class: "m-0"}, [icono, " Esta sección funciona con bienes cuya cantidad es igual a 1"]);
    const divAlert = crearElemento("div", { style: "background-color: #D4EDF3", class: "rounded py-2 px-3 mb-4 border border-info fw-bold text-primary-emphasis" }, [p]);

    vistaPrincipal.append(contenedorNotificacion, divAlert);
    const contenedorDeAlertas = crearElemento("div");
    
    const encabezadoTabla = [
        "Código",
        "Activo Fijo",
        "Componente",
        "Detalle",
        "Fecha de ingreso",
        "Fecha tentativa de salida",
        "Fecha de salida",
        "Costo",
        "Situación"
    ];
    const estiloTd = [
        "text-end",
        "text-start",
        "text-start",
        "text-start",
        "datetime",
        "text-end",
        "datetime",
        "decimal",
        "text-start",
    ];
    const contenidoTabla = [
        "codigoactivofijo",
        "nombreactivofijo",
        "nombrecomponente",
        "detalle",
        "fechaingreso",
        {
            nombre: "fechafin",
            miEstilo: salida,
        },
        "fechasalida",
        "costo",
        {
            nombre: "Estado",
            acciones: {
                accionEstado: {
                    estilo: Estado({vistaPrincipal, vistaSituacion, contenedorDeAlertas, URL, permisos, estiloTd, contenedorNotificacion}),
                },
                comprobante: {
                    estilo: comprobante,
                    condicional: { llave: "cod_comprobante", verdaderos: [null] },
                }
            }
            // accion: {
            //     estilo: Estado({vistaPrincipal, vistaSituacion, contenedorDeAlertas, URL, permisos, estiloTd, contenedorNotificacion}),
            // }
        },
    ];
        // Creación de elementos para la busqueda y recarga de registros.
    const label = crearElemento("label", {class: "input-group-text", for: "select_activofijo"}, ["Activo Fijo"]);
    const option = crearElemento("option", {value:""}, ["-- Elija una opción --"]);
    const input = crearElemento("select", {class: "form-select af-slz-auto", id: "select_activofijo"}, [option]);
    const divGroup = crearElemento("div", {class: "input-group input-group-sm"}, [input, label]);
    const colBuscar = crearElemento("div", {class: "col-auto mb-2"}, [divGroup]);;
    const divContenedor = crearElemento("div", {class: "row g-2"}, [colBuscar]);
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    vistaPrincipal.append(contenidoFormulario, contenedorDeAlertas, divContenedor, tabla);
    if (permisos.escritura === "1") {
        Situacion({
            vistaPrincipal,
            vistaSituacion: contenidoFormulario,
            contenedorDeAlertas,
            URL,
            permisos,
            estiloTd,
        })(contenidoTabla, tBody)
    }

        // Realiza la busqueda de registros por código.
    const accionAF = (elemento) => {
        let value = input.value.trim();
        if (value && value != "") {
            const recargarTabla = (registros) => {
                contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
            }
            obtenerDatosAlr(`${URL}/buscar-codigo/${value}`, {error: "Error", accion: recargarTabla});
        }else if (value == "") {
            const recargarTabla = (registros) => {
                contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
            }
            obtenerDatosAlr(URL, {error: "Error", accion: recargarTabla});
        }
    }

    const sCategorias = { origen: "./api/activo-fijo/activos-inv", llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] } };
    rellenarSelect(input, sCategorias, undefined, {accion: accionAF});

    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(URL, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
}

const salida = ({elemento, registro}) => {
    elemento.append(FormatoDateTime(registro.fechafin));
    
    if (registro.estadoseguro != null) {
        return;
    }
    if(registro.tiemposalida == "1"){
        const fila = elemento.closest("tr");
        fila.setAttribute("class", "table-success");
    }
}

/**
 * Función para generar el comprobante.
 */
const comprobante = ({elemento, registro}) => {
    const iconoPDF = crearElemento("i", {class: "bi bi-file-earmark-text-fill"});
    elemento.append(iconoPDF);
    elemento.setAttribute("class", "btn btn-sm btn-info");
    elemento.setAttribute("title", "Ver comprobante");
    
    // const elementosModal = VistaPDF("Registro situación", [`./api/historial/comprobante/${registro.id}`, "GET", undefined, undefined, undefined, undefined, "comprobante_situacion"]);
    const elementosModal = VistaPDF("Registro situación");
    const opcionesPdf = [`./api/historial/comprobante/${registro.id}`, "POST", undefined, undefined, undefined, undefined, "comprobante_situacion"]
    const btnModal = BotonPDF(elementosModal, ContenidoPDF(`./api/historial/comprobante-js/${registro.id}`), opcionesPdf);
    btnModal(elemento);
}