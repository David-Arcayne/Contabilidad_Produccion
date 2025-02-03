import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { formularioTipoCambio } from "./Formularios.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { RegistroExcel } from "./Funcionalidades/RegistroExcel.js";
import { URL_APIC } from "../../../../lib/services.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function TipoCambio(codigo, permisos) {
    // const URL = `${AF_ENV.apiUrl}/vapp/ct/api`;
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}listatipodecambio/${empresa_id}`;

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

    const encabezadoTabla = [
        "Fecha",
        "Dolar",
        "UFV",
        "Opciones"   
    ];
    const estiloTd = [
        "date",
        "decimal",
        "text-end",
        "text-start",
    ];

    const contenidoTabla = [
        "fecha",
        "dolar",
        "ufv",
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistroModal({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioTipoCambio,
                    URL_FORM: `${URL}`,
                    URL_LISTAR: URL_LT,
                    estiloTd,
                }, {
                    datosExtra: [
                        { key: "id", value_r: "id" },
                        { key: "ver", value: "registrotipodecambiof5" },
                    ]
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: (id) => `${URL}eliminartipocambio/${id}/${empresa_id}`,
                }),
            },
        },
    ];
    // Controlar si el usuario tiene permisos para realizar registros, ediciones o eliminaciones.
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
        const arrayOpciones = [
            btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar)),
            RegistroExcel({
                vistaPrincipal,
                contenedorDeAlertas,
                contenidoTabla,
                tBody,
                URL,
                estiloTd,
            }),
        ];
        const opcionesPrincipales = opciones(arrayOpciones);
        vistaPrincipal.appendChild(opcionesPrincipales);
    }
    // const elementosModal = VistaPDF("Tipo de cambio", [`./api/pdf/tipo-cambio/reporte-pdf`, "GET", undefined, undefined, undefined, undefined, "tipo_cambio"]);
    // const btnModal = BotonPDF(elementosModal, ContenidoPDF(URL_LT));
    // const divBuscar = pdfYBusqueda(tabla.querySelector("table"), btnModal);
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => {
        contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); 
    }
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

    // Creación de formulario para la vista Registrar
    if (permisos.escritura === "1") {
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL_FORM:URL,
            URL_LISTAR: URL_LT,
            camposDeFormulario: formularioTipoCambio,
            estiloTd,
        }, undefined,
        {
            datosExtra: [
                { key: "ver", value: "registrotipodecambio" },
                { key: "empresa", value: empresa_id },
            ]
        });
    }
}