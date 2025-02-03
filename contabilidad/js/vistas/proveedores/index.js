import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { editarRegistro, editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { formularioProveedor } from "./Formularios.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function Proveedores(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}listaproveedores/${empresa_id}`;

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
        "Razon Social",
        // "Código",
        "NIT",
        "Pais",
        "Ciudad",
        "Zona/Barrio",
        "Dirección",
        "Teléfono",
        "Móvil",
        "Detalle",
        // "Email",
        // "Web",
        // "Contacto",
        "Opciones"   
    ];
    const estiloTd = [
        "text-start",
        // "text-start",
        "text-end",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        // "text-start",
        // "text-start",
        // "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "nombre",
        // "codigo",
        "nit",
        "pais",
        "ciudad",
        "zona",
        "direccion",
        "telefono",
        "mobil",
        "detalle",
        // "email",
        // "web",
        // "contacto",
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistroModal({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioProveedor,
                    URL_FORM: URL,
                    URL_LISTAR: URL_LT,
                    estiloTd,
                }, {
                    datosExtra: [
                        { key: "idc", value_r: "id" },
                        { key: "ver", value: "registroproveedorf5" },
                    ]
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: (id) => `${URL}eliminarproveedor/${id}`,
                }),
            },
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
            camposDeFormulario: formularioProveedor,
            estiloTd,
        }, undefined, {
            datosExtra: [
                { key: "ver", value: "registroproveedor" },
                { key: "empresa", value: empresa_id },
            ]
        });
    }
}