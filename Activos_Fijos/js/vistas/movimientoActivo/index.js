import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatosAlr, solicitudPDF } from "../../funciones/Solicitudes.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda } from "../../funciones/Funciones.js";
import { formularioSolicitarAF } from "./Formularios.js";
import { editarRegistro, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { ActivosFijos } from "./Funcionalidades/ActivosFijos.js";
import { Estado } from "./Funcionalidades/Estado.js";
// import { Notificacion } from "./Funcionalidades/Notificaciones.js";
import { BotonPDF, VistaPDF } from "../../funciones/VistaPDF.js";
import { ContenidoPDF } from "./Funcionalidades/ContenidoPDF.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function MovimientoActivo(codigo, permisos) {
    const URL = "./api/movimientos-admin";

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaEditar = crearElemento("div", { class: "d-none" });
    const vistaActivosFijos = crearElemento("div", { class: "d-none" });
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaEditar, vistaActivosFijos);

    // Creación de elementos para la vista Principal
    const contenedorNotificacion = crearElemento("div");
    // const notificacion = Notificacion(vistaPrincipal);
    // contenedorNotificacion.append(notificacion);
    vistaPrincipal.append(contenedorNotificacion);

    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (permisos.escritura === "1") {
        const opcionesBtns = btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar));
        opcionesBtns.classList.add("mb-2");
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Fecha",
        "Título",
        "Área",
        "Trabajador",
        "Estado",
        "Opciones"
    ];
    const estiloTd = [
        "datetime",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "fecharespuesta",
        "detalle",
        "nombrearea",
        "nombrepersonal",
        {
            nombre: "Estado",
            accion: {
                estilo: Estado({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL,
                    permisos,
                    estiloTd,
                }),
            },
        },
        {
            nombre: "Opciones",
            acciones: {
                activosFijos: {
                    accion: ActivosFijos({ vistaPrincipal, vistaActivosFijos, permisos }),
                    icono: "bi bi-list-columns-reverse",
                    classElemento: "btn btn-secondary btn-sm ",
                },
                comprobante: {
                    estilo: comprobante,
                    // icono: "bi bi-file-earmark-text-fill",
                    // classElemento: "btn btn-sm btn-primary ",
                    // titulo: "Ver comprobante",
                    condicional: { llave: "estado", falsos: [1, 3, 6, 7, "1", "3", "6", "7"] },
                }
            },
            usarBasicos: {
                editar: editarRegistro({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioSolicitarAF,
                    URL,
                    estiloTd,
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL,
                }),
                condicional: { llave: "estado", verdaderos: [1, 3, 6, 7, "1", "3", "6", "7"]},
            },
        },
    ];
    if (permisos.editar === "0" && permisos.eliminar === "0") {
        delete contenidoTabla[4].usarBasicos;
    } else if (permisos.editar === "0") {
        delete contenidoTabla[4].usarBasicos.editar;
    } else if (permisos.eliminar === "0"){
        delete contenidoTabla[4].usarBasicos.eliminar;
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(URL, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });

    // Creación de formulario para la vista Registrar
    if (permisos.escritura === "1") {
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL,
            camposDeFormulario: formularioSolicitarAF,
            estiloTd,
        });
    }
}

/**
 * Función para generar el comprobante de la solicitud.
 */
const comprobante = ({elemento, registro}) => {

    // solicitudPDF(`./api/movimientos-admin/comprobante/${registro.id}/admin`, "GET");

    const iconoPDF = crearElemento("i", {class: "bi bi-file-earmark-text-fill"});
    elemento.append(iconoPDF);
    elemento.setAttribute("class", "btn btn-sm btn-primary");
    elemento.setAttribute("title", "Ver comprobante");
    
    const elementosModal = VistaPDF("Movimiento administrador", [`./api/movimientos-admin/comprobante/${registro.id}/admin`, "GET", undefined, undefined, undefined, undefined, "comprobante-administrador"]);
    const btnModal = BotonPDF(elementosModal, ContenidoPDF(`./api/movimientos-admin/comprobante-js/${registro.id}/admin`));
    btnModal(elemento);
}