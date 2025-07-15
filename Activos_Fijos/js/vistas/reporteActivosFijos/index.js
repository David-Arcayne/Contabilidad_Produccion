import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { BuscarEnTabla, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { Reportes } from "./Funcionalidades/Reportes.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function ReporteActivoFijo(codigo, permisos) {
    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    if (!objAFTI) {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Seleccione un tipo de inventario para continuar"]);
        vistaPrincipal.appendChild(h1);
        return;
    }

    const URL = "./api/activo-fijo";

    // Creación de Vistas para la navegación en la ventana
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaEditar = crearElemento("div", { class: "d-none" });
    const vistaImagen = crearElemento("div", { class: "d-none" });
    const vistaSituacion = crearElemento("div", { class: "d-none" });
    const vistaComponentes = crearElemento("div", { class: "d-none" });
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaEditar, vistaImagen, vistaSituacion, vistaComponentes);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    const encabezadoTabla = [
        "N°",
        "Código",
        "Cantidad",
        "Nombre",
        "Detalle",
        "Observación",
        // "Precio",
        "Fecha de ingreso",
        "Categoría",
        "Tipo de bien",
        "Póliza de seguro",
        "Estado",
        "Área",
        "Resonsable",
    ];
    const estiloTd = [
        "contador",
        "text-end",
        "text-end",
        "text-start",
        "text-start",
        "text-start",
        // "decimal",
        "date",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "js-cont",
        "codigo",
        "cantidad",
        "nombre",
        "detalle",
        "afobservacion",
        // "precio",
        "fechacompra",
        "nombrecategoria",
        "nombretipobien",
        {
            nombre: "polizaseguro",
            miEstilo: Poliza,
        },
        "nombreestado",
        "nombrearea",
        "nombretrabajador",
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    const formularioReportes = Reportes({ contenidoTabla, elementoTBody: tBody, URL, estiloTd })();

    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true });
    vistaPrincipal.append(contenedorDeAlertas, formularioReportes, divBuscar, tabla);
    
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(`${URL}/vista-reporte`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
}

/**
 * Obtine la poliza con el nombre del tipo de seguro.
 */
const Poliza = ({elemento, registro}) => {
    if (registro.polizaseguro) {
        elemento.innerHTML = registro.polizaseguro + ": " + registro.nombretiposeguro;
    } else {
        elemento.innerHTML = "-"
    }
}