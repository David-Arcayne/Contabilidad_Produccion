import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda } from "../../funciones/Funciones.js";
import { formularioESeguro } from "./Formularios.js";
import { editarRegistro, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { AF_ENV } from "../../../db/environment.js";
/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function EmpresaSeguro(codigo, permisos) {
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL = `${AF_ENV.apiUrl}/app/cm/api`;

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
        "Nombre",
        "Código",
        "NIT",
        "Detalle",
        "Dirección",
        "Teléfono",
        "Móvil",
        "Email",
        "Web",
        "Pais",
        "Ciudad",
        "Zona",
        "Contacto",
        "Opciones"   
    ];
    const estiloTd = [
        "text-start",
        "text-end",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
    ];

    const formularioEditado = [...formularioESeguro];
    formularioEditado[6] = {...formularioESeguro[6]} 
    formularioEditado[6].nombre = "mobil";
    const contenidoTabla = [
        "nombre",
        "codigo",
        "nit",
        "detalle",
        "direccion",
        "telefono",
        "mobil",
        "email",
        "web",
        "pais",
        "ciudad",
        "zona",
        "contacto",
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistro({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioEditado,
                    URL: `${URL}`,
                    URL2: `${URL}/listaProveedor/${empresa_id}`,
                    estiloTd,
                }, {
                    datosExtra: [
                        { key: "id", value_r: "id" },
                        { key: "ver", value: "editarProveedor" },
                    ]
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: `${URL}/eliminarProveedor`,
                }, true),
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
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => {
        const a = {data: registros};
        contenidoTBody(a, {contenido: contenidoTabla, estiloTd}, tBody); 
    }
    obtenerDatosAlr(`${URL}/listaProveedor/${empresa_id}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });

    // Creación de formulario para la vista Registrar
    if (permisos.escritura === "1") {
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL,
            URL2: `${URL}/listaProveedor/${empresa_id}`,
            camposDeFormulario: formularioESeguro,
            estiloTd,
        },
        false,
        {
            datosExtra: [
                { key: "ver", value: "registrarProveedor" },
                { key: "idempresa", value: empresa_id },
            ]
        });
    }
}