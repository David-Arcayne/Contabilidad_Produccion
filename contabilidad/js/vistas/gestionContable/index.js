import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../funciones/Modals.js";
import { editarRegistroModal, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { formularioGestionContable } from "./Formularios.js";
import { Estado } from "./Funcionalidades/Estado.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function GestionContable(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}listadegestion/${empresa_id}`;

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
        const opcionesBtns = opciones([
            btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar)),
        ]); 
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Gestión",
        "Fecha inicio",
        "Fecha final",
        "Fecha",
        "Opciones"
    ];
    const estiloTd = [
        "text-start",
        "date",
        "date",
        "date",
        "text-start",
    ];
    const contenidoTabla = [
        "nombre",
        "fechaini",
        "fechafin",
        "fecha",
        {
            nombre: "Opciones",
            acciones: {
                baja: {
                    estilo: Estado({
                        vistaPrincipal,
                        contenedorDeAlertas,
                        URL,
                        URL_LT,
                        estiloTd,
                    }),
                },
            },
            usarBasicos: {
                editar: editarRegistroModal({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioGestionContable,
                    URL_FORM: `${URL}`,
                    URL_LISTAR: URL_LT,
                    estiloTd,
                    accionPrevia: ValidarFecha(vistaPrincipal),
                }, {
                    datosExtra: [
                        { key: "idgestion", value_r: "id" },
                        { key: "ver", value: "registrogestionf5" },
                        { key: "empresa", value: empresa_id },
                    ]
                }),
            },
        },
    ];
    // Eliminar las opciones de editar y eliminar si el usuario no tiene los permisos respectivos
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
            camposDeFormulario: formularioGestionContable,
            estiloTd,
            accionPrevia: ValidarFecha(vistaRegistrar),
        }, undefined, {
            datosExtra: [
                { key: "ver", value: "registrogestion" },
                { key: "empresa", value: empresa_id },
            ]
        });
    }
}

/**
 * Función para validar la fecha de inicio y final con el cierre fiscal.
 * @param {HTMLElement} vista - Vista principal de la ventana.
 * @returns 
 */
const ValidarFecha = (vista) =>  (enviarFormulario, form) => {
    const cierreFiscal = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.ocierrefiscal;
    const fechaI = form.querySelector("#gestioncontable_fecha_inicio");
    const fechaF = form.querySelector("#gestioncontable_fecha_final");

    const [dia, mes] = cierreFiscal.split("/");
    const [anioF] = fechaF?.value.split("-");

    let fechaRefF = anioF + "-" + mes + "-" + dia;
    const obtenerFI = new Date(fechaRefF);
    fechaRefF = obtenerFI.toISOString().slice(0, 10);
    obtenerFI.setDate(obtenerFI.getDate() + 1);
    obtenerFI.setFullYear(obtenerFI.getFullYear() - 1);
    const fechaRefI = obtenerFI.toISOString().slice(0, 10);

    if (fechaI.value === fechaRefI && fechaF.value === fechaRefF) {
        enviarFormulario();
    } else {
        const modal = modalDeConfirmacion(() => enviarFormulario(), `Las fechas no coinciden con la fecha de cierre fiscal: ${cierreFiscal} , ¿Desea continuar?`);
        vista.appendChild(modal);
    }
    return;
};