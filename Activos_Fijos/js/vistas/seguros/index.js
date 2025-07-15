import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatos, obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda } from "../../funciones/Funciones.js";
import { formularioSeguros, opcionesEmpresaId } from "./Formularios.js";
import { editarRegistro, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { Reportes } from "./Funcionalidades/Reportes.js";
import { ActivosFijos } from "./Funcionalidades/ActivosFijos.js";
import { AF_ENV } from "../../../db/environment.js";
import { Contratos } from "./Funcionalidades/Contratos.js";
import { Notificacion } from "./Funcionalidades/Notificacion.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export async function Seguros(codigo, permisos) {
    const URL = "./api/seguros";

    const prov = await proveedores();

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaEditar = crearElemento("div", { class: "d-none" });
   
    const contenedorPrincipal = vistaPrincipal.parentNode;
    const vistaActivosFijos = crearElemento("div", { class: "d-none" });
    ActivosFijos({ vistaPrincipal, vistaActivosFijos, permisos });
    contenedorPrincipal.append(vistaEditar, vistaActivosFijos);

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
        "Aseguradora",
        "Tipo de seguro",
        "Nro. Póliiza",
        "Certificado",
        "Fecha inicio seguro",
        "Caducidad",
        "Detalle",
        "Contacto",
        "Contratos",
        "Opciones"
    ];
    const estiloTd = [
        "text-end",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "datetime",
        "datetime",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
    ];
    // const misOpciones = {
    //     empresaseguro_id: opcionesEmpresaId,
    // }
    const contenidoTabla = [
        "codigo",
        {
            nombre: "empresaseguro_id",
            miEstilo: nombreEmpresa(prov),
        },
        "nombretiposeguro",
        "poliza",
        "certificado",
        "periodoa",
        {
            nombre: "periodob",
            miEstilo: caducidad,
        },
        "detalle",
        "contacto",
        {
            nombre: "Contratos",
            miEstilo: Contratos,
            
        },
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistro({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioSeguros,
                    // registrosPropios: misOpciones,
                    URL,
                    estiloTd,
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL,
                }),
            },
            accion: {
                estilo: Notificacion(vistaPrincipal, vistaEditar, {contenedorDeAlertas, formularioSeguros, estiloTd}),
                condicional: { llave: "fechaporvencer", falsos: [1, "1", 2, "2"] },
            },
        },
    ];
    // if (permisos.editar === "0" && permisos.eliminar === "0") {
        // encabezadoTabla.pop();
        // contenidoTabla.pop();
    // } else 
    if (permisos.editar === "0") {
        delete contenidoTabla[9].usarBasicos.editar;
    }
    if (permisos.eliminar === "0"){
        delete contenidoTabla[9].usarBasicos.eliminar;
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    const formularioReportes = Reportes({ contenidoTabla, elementoTBody: tBody, URL, vistaPrincipal, vistaActivosFijos, estiloTd })();
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true });
    vistaPrincipal.append(formularioReportes, divBuscar, tabla);
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
            camposDeFormulario: formularioSeguros,
            // registrosPropios: misOpciones,
            estiloTd,
        });
    }
}

/**
 * Cambia el color de la fila si el seguro está expirado.
 */
const caducidad = ({elemento, registro}) => {
    elemento.append(registro.periodob);
    if (registro.estadoseguro != null) {
        return;
    }
    if(registro.estadofecha == "1"){
        const fila = elemento.closest("tr");
        fila.setAttribute("class", "table-danger");
    } else if (registro.estadofecha == "0" && registro.fechaporvencer == "1") {
        const fila = elemento.closest("tr");
        fila.setAttribute("class", "af-table-yellow");
    } else if (registro.estadofecha == "0" && registro.fechaporvencer == "2") {
        const fila = elemento.closest("tr");
        fila.setAttribute("class", "af-table-orange");
    }
}

/**
 * Obtener el nombre de la emprese aseguradora.
 */
const nombreEmpresa = (datos) => ({elemento, registro}) => {

    for (const empresa of datos) {
        if (empresa.id == registro.empresaseguro_id) {
            elemento.append(empresa.nombre);
            break;
        }
    }
    if (!elemento.hasChildNodes()) {
        elemento.innerHTML = "-";
    }
    
}

const proveedores = async() => {
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL = `${AF_ENV.apiUrl}/app/cm/api/listaProveedor/${empresa_id}`;

    const datos = await obtenerDatos(URL);
    return datos;
}
