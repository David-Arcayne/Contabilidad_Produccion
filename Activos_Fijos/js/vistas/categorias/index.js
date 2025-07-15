import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatosAlr, solicitudPDF } from "../../funciones/Solicitudes.js";
import { btnNuevoRegistro, BuscarEnTabla, cambiarVista, crearElemento, pdfYBusqueda } from "../../funciones/Funciones.js";
import { formularioCat } from "./Formularios.js";
import { editarRegistro, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { CategoriasLR } from "./Funcionalidades/CategoriasLR.js";
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
export function Categorias(codigo, permisos) {
    const URL = "./api/categoria";

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
        "Código",
        "Nombre",
        "Descripción",
        "Vida útil",
        "Coeficiente",
        "Opciones",
    ];
    const estiloTd = [
        "text-end",
        "text-start",
        "text-start",
        "text-end",
        "decimal",
        "text-start",
    ];
    const contenidoTabla = [
        "codificacion",
        "nombre",
        "descripcion",
        "vidautil",
        "coeficiente",
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistro({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioCat,
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
    const elementosModal = VistaPDF("Categorías", [`${URL}/reporte-pdf`, "GET", undefined, undefined, undefined, undefined, "categorias"]);
    const btnModal = BotonPDF(elementosModal, ContenidoPDF);
    const divBuscar = pdfYBusqueda(tabla.querySelector("table"), btnModal);
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(URL, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });

    // Creación de formulario para la vista Registrar

    const btnCategoria = crearElemento("button", {class: "btn btn-warning px-md-5"}, ["Agregar categoria"])
    const contenedorBtn = crearElemento("div", {class: "text-center"}, [btnCategoria]);
    const contenedorCategoriaLR = crearElemento("div", {class: "d-none"});
    const divRegistroCat = crearElemento("div", {class:"pt-4"}, [contenedorBtn, contenedorCategoriaLR]); 
    CategoriasLR({contenedorCategoria: contenedorCategoriaLR, estiloTdCat: estiloTd, contenidoTablaCat: contenidoTabla, tBodyCat: tBody, vistas: {vistaPrincipal, vistaRegistrar}});

    btnCategoria.addEventListener("click", () => {
        contenedorCategoriaLR.classList.toggle("d-none");
        
        const body = contenedorCategoriaLR.closest(".card-body");
        const div = contenedorCategoriaLR.querySelector(".table-responsive");
        const altura = body.offsetHeight  - (div.offsetTop);
        if (altura > 230) {
            div.setAttribute("style", `max-height: ${altura + 30}px`);
        }else {
            div.setAttribute("style", `max-height: 260px`);
        }
    })
    
    if (permisos.escritura === "1") {
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL,
            camposDeFormulario: formularioCat,
            estiloTd,
        }, divRegistroCat);
    }
}