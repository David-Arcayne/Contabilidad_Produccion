import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { formularioTipoAsiento } from "./Formularios.js";
import { AgregarAsiento } from "./Funcionalidades/AgregarAsiento.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function AsientoModelo(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}listaasientos/${empresa_id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaAgregarAsiento = crearElemento("div", { class: "d-none" });
   
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaAgregarAsiento);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    if (permisos.escritura === "1") {
        const opcionesBtns = opciones([
            btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar)),
        ]); 
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Nombre asiento",
        "Tipo",
        "Opciones",
    ];
    const estiloTd = [
        "text-start",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "nombre",
        "tipo",
        {
            nombre: "Opciones",
            accion: {
                accion: AgregarAsiento({ vistaPrincipal, vistaAgregarAsiento, permisos }),
                icono: "bi bi-card-list",
                classElemento: "btn btn-primary btn-sm ",
                titulo: "Agregar Asientos",
            },
            usarBasicos: {
                editar: editarRegistroModal({
                    vistaPrincipal,
                    // vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioTipoAsiento,
                    URL_FORM: `${URL}`,
                    URL_LISTAR: URL_LT,
                    estiloTd,
                }, {
                    datosExtra: [
                        { key: "id", value_r: "id" },
                        { key: "ver", value: "registroasientof5" },
                        { key: "empresa", value: empresa_id },
                    ]
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: (id) => `${URL}eliminarasiento/${id}`,
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
            camposDeFormulario: formularioTipoAsiento,
            estiloTd,
        }, undefined, {
            datosExtra: [
                { key: "ver", value: "registroasiento" },
                { key: "empresa", value: empresa_id },
            ]
        });
    }
}