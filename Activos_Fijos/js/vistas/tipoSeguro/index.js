import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda } from "../../funciones/Funciones.js";
import { formularioTipoSeguro } from "./Formularios.js";
import { editarRegistro, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function TipoSeguro(codigo, permisos) {
    const URL = "./api/tipo-seguro";

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaEditar = crearElemento("div", { class: "d-none" });
   
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaEditar);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (permisos.escritura === "1") {
        const opcionesBtns = btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar));
        opcionesBtns.classList.add("mb-2");
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Tipo de Seguro",
        "Descripción",
        "Opciones"
    ];
    const estiloTd = [
        "text-start",
        "text-start",
        "text-start"
    ];
    const contenidoTabla = [
        "nombre",
        "descripcion",
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistro({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioTipoSeguro,
                    URL,
                    estiloTd,
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL,
                }),
            },
        },
    ];
    if (permisos.editar === "0" && permisos.eliminar === "0") {
        encabezadoTabla.pop();
        contenidoTabla.pop();
    } else if (permisos.editar === "0") {
        delete contenidoTabla[2].usarBasicos.editar;
    } else if (permisos.eliminar === "0"){
        delete contenidoTabla[2].usarBasicos.eliminar;
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
            camposDeFormulario: formularioTipoSeguro,
            estiloTd,
        });
    }
}