import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { formularioImpuesto } from "./Formularios.js";
import { BtnImportarIm } from "./Funcionalidades/Opciones.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function Impuesto(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}impuestolista/${empresa_id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaEditar = crearElemento("div", { class: "d-none" });
    const vistaImportar = crearElemento("div", { class: "d-none" });
   
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaEditar, vistaImportar);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    
    const encabezadoTabla = [
        "Código",
        "Nombre",
        "Tasa",
        "Descripción",
        "Opciones",
    ];
    const estiloTd = [
        "text-start",
        "text-start",
        "decimal",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "codigoimpuesto",
        "nombreimpuesto",
        "tasa",
        "descripcion",
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistroModal({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioImpuesto,
                    URL_FORM: URL,
                    URL_LISTAR: URL_LT,
                    estiloTd,
                }, {
                    datosExtra: [
                        { key: "idimpuesto", value_r: "id" },
                        { key: "ver", value: "impuestocrearf5" },
                    ]
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: (id) => `${URL}impuestocreardelete/${id}`,
                }),
            },
        },
    ];
    // Eliminar las opciones de editar y eliminar si el usuario no tiene los permisos respectivos.
    const l_ct = contenidoTabla.length -1;
    if (permisos.editar === "0" && permisos.eliminar === "0") {
        encabezadoTabla.pop();
        contenidoTabla.pop();
    } else if (permisos.editar === "0") {
        delete contenidoTabla[l_ct].usarBasicos.editar;
    } else if (permisos.eliminar === "0"){
        delete contenidoTabla[l_ct].usarBasicos.eliminar;
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    if (permisos.escritura === "1") {
        const opcionesBtns = opciones([
            btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar)),
            BtnImportarIm({ 
                vistaPrincipal,
                vistaImportar,
                permisos,
                cntAlertasIm: contenedorDeAlertas,
                URL_LT,
                tablaIm: [{contenido: contenidoTabla, estiloTd}, tBody],
            }),
        ]); 
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { 
        contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
    };
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

    // Creación de formulario para la vista Registrar
    if (permisos.escritura === "1") {
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL_FORM: `${URL}`,
            URL_LISTAR: URL_LT,
            camposDeFormulario: formularioImpuesto,
            estiloTd,
        }, undefined, {
            datosExtra: [
                { key: "ver", value: "impuestocrear" },
                { key: "idempresa", value: empresa_id },
            ]
        });
    }
}