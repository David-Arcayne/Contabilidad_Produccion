import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, FormatoDate, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { editarRegistro, editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { formularioClientes } from "./Formularios.js";
import { ProcesarSolicitud } from "./Funcionalidades/PorcesarSolicitud.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function SolicitudesDesconsolidar(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}listadesconsolidar/${empresa_id}`;

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
        "Fecha Solicitado",
        "Fecha Procesado",
        "N° Transacción",
        "Motivo",
        "Solicitante",
        "Opciones",
    ];
    const estiloTd = [
        "datetime",
        "datetime",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        {
            nombre: "fecha hora",
            miEstilo: ({elemento, registro}) => {
                elemento.textContent = FormatoDate(registro.fecha) + " " + registro.hora;
            }
        },
        {
            nombre: "fechaproceso horaproceso",
            miEstilo: ({elemento, registro}) => {
                elemento.textContent = registro.fechaproceso ? FormatoDate(registro.fechaproceso) + " " + registro.horaproceso : "-";
            }
        },
        {
            nombre: "numerotransaccion",
            miEstilo: ({elemento, registro}) => {
                elemento.textContent = registro.desde_primero == registro.desde_ultimo ? registro.desde_primero : registro.desde_primero + " - " + registro.desde_ultimo;
            }
        },
        "motivo",
        {
            nombre: "nombre apellido",
            miEstilo: ({elemento, registro}) => {
                elemento.textContent = registro.nombre + " " + registro.apellido;
            }
        },
        {
            nombre: "Opciones",
            miEstilo: ProcesarSolicitud({
                vistaPrincipal,
                contenedorDeAlertas,
                URL,
                URL_LT,
                estiloTd,
            })
        },
    ];
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
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { 
        contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
    };
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

    // const test = [
    //     {
    //         "id": 1,
    //         "numerotransaccion": "1 - 12",
    //         "motivo": "Texto de prueba para la solicitud por rangos",
    //         "solicitante": "Juan Perez",
    //         "empresa": 1,
    //         "estado": 1,
    //         "fecha_solicitado": "2024-09-10 08:00:00",
    //     },
    //     {
    //         "id": 2,
    //         "numerotransaccion": "24",
    //         "motivo": "Texto de prueba para la solicitud 1",
    //         "solicitante": "Juan Perez",
    //         "empresa": 1,
    //         "estado": 1,
    //         "fecha_solicitado": "2024-09-10 08:00:00",
    //     },
    //     {
    //         "id": 3,
    //         "numerotransaccion": "18",
    //         "motivo": "Texto de prueba para la solicitud 2",
    //         "solicitante": "Maria Lopez",
    //         "estado": 2,
    //         "fecha_solicitado": "2024-09-10 00:00:00",
    //         "fecha_procesado": "2024-09-10 00:00:00"
    //     },
    //     {
    //         "id": 4,
    //         "numerotransaccion": "11",
    //         "motivo": "Texto de prueba para la solicitud 3",
    //         "solicitante": "Pedro Ramirez",
    //         "estado": 3,
    //         "fecha_solicitado": "2024-09-10 08:00:00",
    //         "fecha_procesado": "2021-09-10 16:00:00"
    //     }
    // ]
    // contenidoTBody(test, {contenido: contenidoTabla, estiloTd}, tBody);

}