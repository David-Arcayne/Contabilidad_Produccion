import { eliminarDato, obtenerDatos, obtenerDatosAlr, solicitudPDF } from "../../funciones/Solicitudes.js";
import { crearElemento } from "../../funciones/Funciones.js";
import { formularioCuadroDpr, opcionesMetodoDeprId } from "./Formularios.js";
import { crearFormulario } from "../../funciones/CrearFormulario.js";
import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { modalDeConfirmacion } from "../../funciones/Modals.js";
import { ActivosFijos } from "./Funcionalidades/ActivosFijos.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export async function EstadoSituacionIndividual(codigo, permisos) {
    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    if (!objAFTI) {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Seleccione un tipo de inventario para continuar"]);
        vistaPrincipal.appendChild(h1);
        return;
    }

    const URL = `./api/cuadro-depreciacion`;
    const metodoDprActual = await obtenerDatos("./api/metodo-depreciacion");


    // Creacion de Vistas para la navegación en la ventana
    const contenedorPrincipal = vistaPrincipal.parentNode;
    const vistaActivoFijo = crearElemento("div", {class: "d-none"});
    const vistaValoresUso = crearElemento("div", {class: "d-none"});
    contenedorPrincipal.append(vistaActivoFijo, vistaValoresUso);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    const contenedorFormulario = crearElemento("div", {class: "pb-5"});
    
    const btnUso = crearElemento("button", {class: "btn btn-sm btn-warning"}, ["Registrar valores de Uso"]);
    const contenedorBtn = crearElemento("div", {id: "contenido-btn-uso", class:"pt-4 pb-2 d-none"}, [btnUso]);

    const icono = crearElemento("i", {class: "pe-2 bi bi-info-circle"});
    const p = crearElemento("p", {class: "m-0"}, [icono, " El cálculo se realizará en base al último reporte de Cuadro de Depreciación"]);
    const divAlert = crearElemento("div", { style: "background-color: #D4EDF3", class: "rounded py-2 px-3 mb-5 border border-info fw-bold text-primary-emphasis" }, [p]);

    vistaPrincipal.append(divAlert, contenedorDeAlertas, contenedorFormulario);

    // if (metodoDprActual && metodoDprActual.data && metodoDprActual.data.metododepreciacion_id == 3) {
    //     contenedorBtn.classList.remove("d-none");
    //     contenedorFormulario.classList.remove("pb-5");

    //     ActivosFijos({vistaPrincipal, vistaActivoFijo, vistaValoresUso, permisos, btnUso});
    // }

    if (permisos.escritura === "1") {
        
    }
    const encabezadoTabla = [
        "Método depreciación",
        "Fecha",
        "Opciones"
    ];
    const estiloTd = [
        "text-start",
        "text-end",
        "text-start",
    ];
    const misOpciones = {
        metododepreciacion_id: opcionesMetodoDeprId,
    }
    const contenidoTabla = [
        "metododepreciacion_id",
        "id", // fechadepreciacion
        {
            nombre: "Opciones",
            accion: {
                accion: generarCuadroDepreciacion(),
                icono: "bi bi-file-earmark-pdf-fill",
                classElemento: "btn btn-sm btn-dark border border-danger",
            },
            usarBasicos: {
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL,
                }),
            },
        },
    ];
    if (permisos.eliminar === "0"){
        delete contenidoTabla[2].usarBasicos.eliminar;
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    // vistaPrincipal.append(tabla);
    // Listar los registros en la tabla.
    // const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody, misOpciones); }
    // obtenerDatosAlr(URL, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
    

    // Creación de formulario
    const datosFormulario = {
        datosBtn: {
            btnClass: "btn btn-info px-2 px-sm-5 text-nowrap",
            columna: "col-12",
            nombre: "Generar PDF",
        },
    }

    const formularioCD = [...formularioCuadroDpr]; 
    if (metodoDprActual && ((metodoDprActual.data && metodoDprActual.data.metododepreciacion_id != 4) || metodoDprActual.data === null)) {
        formularioCD.pop();
    }

    const nuevoformulario = crearFormulario(formularioCD, datosFormulario);
    contenedorFormulario.appendChild(nuevoformulario);

    const informacion = (respuesta) => {
        alertaDeAdvertencia(contenedorDeAlertas, respuesta.message);
    }
    const registrado = async () => {
        const listaDeRegistros = await obtenerDatos(URL);
        await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody, misOpciones)
        alertaDeExito(contenedorDeAlertas, "Depreciación realizada con exito");
    }
    const error = () => {
        alertaDeError(contenedorDeAlertas, "Ocurrio un error al genera PDF");
    }
    nuevoformulario.addEventListener("submit", (e) => {
        e.preventDefault();
        solicitudPDF(`./api/pdf/activo-fijo/depreciacion`, "POST", nuevoformulario, {informacion, exitoso: registrado, error});
    });


    // const selectMetodoDpr = nuevoformulario.querySelector("#cuadro_dpr_depreciacion");
    // if (selectMetodoDpr) {
    //     selectMetodoDpr.addEventListener("change", (e) => {
    //         if (e.target.value == 3) {
    //             contenedorBtn.classList.remove("d-none");
    //             contenedorFormulario.classList.remove("pb-5");

    //             ActivosFijos({vistaPrincipal, vistaActivoFijo, vistaValoresUso, permisos, btnUso, mixUrl: `${URL}/activo-fijo/mixto`});
    //         } else {
    //             contenedorBtn.classList.add("d-none");
    //             contenedorFormulario.classList.add("pb-5");
    //         }
    //     });
    // }
}


/**
 * Crea la funcionalidad para eliminar un registro.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento de la vista principal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @returns
 */
export const eliminarRegistro = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL
    } = datosVista;

    return async ({elemento, registro}) => {
        const eliminar = async () => {
            const eliminado = () => {
                const fila = elemento.closest("tr");
                const cuerpoTabla = fila.closest("tbody");
                fila.remove();
                if (!cuerpoTabla.hasChildNodes()) {
                    const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
                    const tr = crearElemento("tr", undefined, [td]);
                    cuerpoTabla.replaceChildren(tr);
                }
                alertaDeExito(contenedorDeAlertas, "Registro eliminado con exito");
            }
            const alerta = () => {
                alertaDeAdvertencia(contenedorDeAlertas, "No se puede eliminar el registro")
            }

            await eliminarDato(`${URL}/${registro.id}/${registro.metododepreciacion_id} `, eliminado, alerta)
        }
    
        const modal = vistaPrincipal;
        modal.appendChild(modalDeConfirmacion(eliminar))
    };
} 

/**
 * Crea la funcionalidad para generar PDF.
 */
export const generarCuadroDepreciacion = () => {

    return async ({elemento, registro}) => {
        solicitudPDF(`./api/pdf/activo-fijo/generar-cd?fechadepreciacion=${registro.id}&depreciacion_mixto=${registro.depreciacion_mixto}&metododepreciacion=${registro.metododepreciacion_id}`, "GET");
    };
} 