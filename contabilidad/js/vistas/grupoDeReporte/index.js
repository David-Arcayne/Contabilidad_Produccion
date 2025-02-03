import { URL_APIC } from "../../../../lib/services.js";
import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { eliminarRegistro } from "../../funciones/OpcionesBasicas.js";
import { enviarDatosFormulario, obtenerDatos, obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { DetalleTemplate } from "./Funcionalidades/DetalleTemplate.js";
import { ImportarTemplate } from "./Funcionalidades/ImportarTemplate.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function GrupoDeReporte(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}listatemplate/${empresa_id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    // vistaRegistrar.setAttribute("class", "d-none");
    const vistaImportarT = crearElemento("div", { class: "d-none" });
    const vistaDetalleT = crearElemento("div", { class: "d-none" });
   
    const icono = crearElemento("i", { class: "bi bi-exclamation-triangle-fill" });
    const alertaDemo = crearElemento("div", { class: "alert alert-warning", role: "alert" }, [icono, " Modo DEMO, tipo Alfa"]);
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaImportarT, vistaDetalleT);
    contenedorPrincipal.prepend(alertaDemo);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (permisos.escritura === "1") {
        const label = crearElemento("label", { class: "form-label", for: "gruporep_nombre_template" }, ["Nombre de Template"]);
        const input = crearElemento("input", { class: "form-control", id: "gruporep_nombre_template", name: "nombre", type: "text", required: "" });
        const divInvalid = crearElemento("div", { class: "invalid-feedback" });
        const colInput = crearElemento("div", { class: "col-auto" }, [label, input, divInvalid]);
        const btnCrear = crearElemento("button", { class: "btn btn-primary", id: "btn-enviar-formulario" }, ["Crear Template"]);
        const colBtn = crearElemento("div", { class: "col-auto" }, [btnCrear]);
        const formularioRegistro = crearElemento("form", { class: "row g-3 align-items-end" }, [colInput, colBtn]);
        const div = crearElemento("div", undefined, [formularioRegistro]);

        const iconoImportar = crearElemento("i", { class: "bi bi-box-arrow-in-down me-1" });
        const btnImportar = crearElemento("button", { class: "btn btn-primary" }, [iconoImportar, " Importar Template"]);
        const divImportar = crearElemento("div", { class: "mb-3" }, [btnImportar]);
        vistaPrincipal.append(divImportar, div);

        btnCrear.addEventListener("click", (e) => {
            e.preventDefault();
            registrar(formularioRegistro, {
                contenedorDeAlertas,
                contenidoTabla,
                tBody,
                URL_FORM: URL,
                URL_LISTAR: URL_LT,
                estiloTd,
            });
        });

        btnImportar.addEventListener("click", () => {
            cambiarVista(vistaPrincipal, vistaImportarT);
        });
    }
    const encabezadoTabla = [
        "Template",
        "Opciones",
    ];
    const estiloTd = [
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "nombre",
        {
            nombre: "Opciones",
            accion: {
                accion: DetalleTemplate({ vistaPrincipal, vistaDetalleT, permisos }),
                icono: "bi bi-box-seam-fill",
                classElemento: "btn btn-primary btn-sm ",
                titulo: "Ver detalle",
            },
            usarBasicos: {
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: {llave: "codigo", direccion: (id) => `${URL}eliminartemplate/${id}/${empresa_id}`},
                }),
            },
        },
    ];
    if (permisos.eliminar === "0") {
        encabezadoTabla.pop();
        contenidoTabla.pop();
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { 
        contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
    };
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

    // BtnAgrRemPC({ 
    //     vistaPrincipal,
    //     vistaPlanCuentas,
    //     permisos,
    //     cntAlertasPdC: contenedorDeAlertas,
    //     URL_LT, 
    //     tablaPdC: [{contenido: contenidoTabla, estiloTd}, tBody, misOpciones],
    //     recargarPdC,
    // }),
    ImportarTemplate({
        vistaPrincipal,
        vistaImportarT,
        vistaDetalleT,
        permisos,
        contAlertasGR: contenedorDeAlertas,
        URL_LT, 
        tablaGR: [{contenido: contenidoTabla, estiloTd}, tBody],
        // recargarPdC,
    });
}

const registrar = (form, datos) => {
    const {
        contenedorDeAlertas,
        contenidoTabla,
        tBody,
        URL_FORM,
        URL_LISTAR,
        estiloTd,
    } = datos;

    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const realizarRegistro = async () => {
        const listaDeRegistros = await obtenerDatos(URL_LISTAR);
        contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
        alertaDeExito(contenedorDeAlertas, "Registro exitoso");
    }
    const errorRegistro = () => {
        alertaDeError(contenedorDeAlertas, "No se pudo realizar el registro");
    }
    const opciones = {
        refForm: form,
        myUrl: URL_FORM,
        datosExtra: {
            ver: "creartemplate",
            empresa: empresa_id,
        },
        redireccion: realizarRegistro,
        error: errorRegistro,
    }
    enviarDatosFormulario(opciones);
}