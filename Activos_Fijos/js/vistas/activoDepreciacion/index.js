import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { eliminarDato, obtenerDatos, obtenerDatosAlr, rellenarSelect } from "../../funciones/Solicitudes.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { formularioDAF, opcionesMetodoDeprId } from "./Formularios.js";
import { editarRegistro, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { Reportes } from "./Funcionalidades/Reporte.js";
import { modalDeConfirmacion } from "../../funciones/Modals.js";
import { alertaDeAdvertencia, alertaDeExito } from "../../funciones/Alertas.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function ActivoFijoDepreciacion(codigo, permisos) {
    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    if (!objAFTI) {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Seleccione un tipo de inventario para continuar"]);
        vistaPrincipal.appendChild(h1);
        return;
    }

    const URL = "./api/depreciacion-activo-fijo";

    // Creación de Vistas para la navegación en la ventana
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaEditar = crearElemento("div", { class: "d-none" });
   
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaEditar);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (permisos.escritura === "1" && permisos.eliminar === "1") {
        const icono = crearElemento("i", { class: "bi bi-trash" });
        const eliminarTodo = crearElemento("button", { class: "btn btn-danger" }, [icono, " Quitar asignaciones"]);
        eliminarTodo.addEventListener("click", () => {
            const eliminar = async () => {
                const eliminado = () => {
                    alertaDeExito(contenedorDeAlertas, "Registros eliminados con exito");
                    const registros = obtenerDatos(URL);
                    contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody, misOpciones);
                    recargarSelect();
                }
                const alerta = () => {
                    alertaDeAdvertencia(contenedorDeAlertas, "No se puedo eliminar los registros")
                }
                await eliminarDato(`${URL}/multiple`, eliminado, alerta)
            }
            vistaPrincipal.appendChild(modalDeConfirmacion(eliminar, "¿Está seguro de eliminar todos los registros?"))
        });
        const opcionesBtns = opciones([
            btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar)),
            eliminarTodo
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
    } else if (permisos.escritura === "1") {
        const opcionesBtns = btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar));
        opcionesBtns.classList.add("mb-2");
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Código",
        "Método de depreciación",
        "Activo Fijo",
        "Detalle",
        "Opciones"
    ];
    const estiloTd = [
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start"
    ];
    const misOpciones = {
        metododepreciacion_id: opcionesMetodoDeprId,
    }
    const recargarSelect = () => {
        const selectAF = vistaRegistrar.querySelector("#depr_af_activo_fijo");
        const a = $(selectAF)
        a[0].selectize?.destroy();
        rellenarSelect(selectAF, { origen: "./api/activo-fijo/depreciacion", llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] } })
    }
    const contenidoTabla = [
        "codigoactivofijo",
        "metododepreciacion_id",
        "nombreactivofijo",
        "detalleactivofijo",
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistro({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioDAF,
                    registrosPropios: misOpciones,
                    URL,
                    estiloTd,
                }, undefined, undefined, recargarSelect),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL,
                }, undefined, recargarSelect),
                // }),
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
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true});
    const reporteAFDep = Reportes({ contenidoTabla, elementoTBody: tBody, URL, estiloTd, misOpciones })();
    vistaPrincipal.append(reporteAFDep, divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody, misOpciones); }
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
            camposDeFormulario: formularioDAF,
            registrosPropios: misOpciones,
            estiloTd,
        }, undefined, undefined, recargarSelect);
        // });
    }
}