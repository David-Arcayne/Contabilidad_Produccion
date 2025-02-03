import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, FormatoDate, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatos, obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { BotonPDF, VistaPDF } from "../../funciones/VistaPDF.js";
import { formularioTransaccion, ultimaTransaccion } from "./Formularios.js";
import { Consolidar, DesconsolidacionMultiple } from "./Funcionalidades/Consolidar.js";
import { CuentaFacturas } from "./Funcionalidades/CuentaFacturas.js";
import { DetalleTransaccion } from "./Funcionalidades/DetalleTransaccion.js";
import { ColorFila, Duplicar, OpcionesRegistro } from "./Funcionalidades/Opciones.js";
import { VPDetalle } from "./Funcionalidades/VPDetalle.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export async function Transacciones(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal
    const URL_LT = `${URL}listatransacciones/${empresa_id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaEditar = crearElemento("div", { class: "d-none" });
    const vistaDetalle = crearElemento("div", { class: "d-none" });
    const vistaTranFactura = crearElemento("div", { class: "d-none" });
   
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaEditar, vistaDetalle, vistaTranFactura);

    // Creación de elementos para la vista Principal
    const datoGA = await obtenerDatos(`${URL}getgestionactual/${empresa_id}`);
    
    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datoGA.nombre} (${FormatoDate(datoGA.fechaini)} a ${FormatoDate(datoGA.fechafin)})`]);
        const textGA = crearElemento("p", { class: "fs-6" }, ["Gestión Activa: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-end" }, [textGA])
        vistaPrincipal.appendChild(gestionActiva);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        contenedorPrincipal.appendChild(h1);
        return;
    }
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const recargarNT = () => {
        const input = vistaRegistrar.querySelector("#transaccion_codigo");
        ultimaTransaccion(input);
    }
    const encabezadoTabla = [
        "N° Transacción",
        "Fecha",
        "Tipo",
        "Glosa",
        "Opciones"
    ];
    const estiloTd = [
        "text-start",
        "date",
        "text-start",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        {
            nombre: "ntransaccion",
            miEstilo: ColorFila,
        },
        "fecha",
        "ttransaccion",
        "glosa",
        {
            nombre: "Opciones",
            acciones: {
                consolidar: {
                    estilo: Consolidar({
                        vistaPrincipal,
                        contenedorDeAlertas,
                        URL,
                        URL_LT,
                        estiloTd,
                    }),
                },
                detalleT: {
                    accion: DetalleTransaccion({ vistaPrincipal, vistaDetalle, vistaTranFactura, permisos}),
                    icono: "bi bi-card-list",
                    classElemento: "btn btn-primary btn-sm ",
                    titulo: "Asiento Contable",
                },
                // facturaT: {
                //     accion: CuentaFacturas({ vistaPrincipal, vistaDetalle, vistaTranFactura, permisos}),
                //     icono: "bi bi-file-earmark-ruled",
                //     classElemento: "btn btn-primary btn-sm ",
                //     titulo: "Facturas",
                // // },
                // duplicar: {
                //     accion: Duplicar({
                //         url_d: `${URL}duplicartransaccion/`, 
                //         URL_LT,
                //         contenedorDeAlertas,
                //         vistaPrincipal,
                //         estiloTd
                //     }),
                //     icono: "bi bi-copy",
                //     classElemento: "btn btn-info btn-sm ",
                //     titulo: "Duplicar transacción",
                //     condicional: { llave: "consolidar", falsos: [1, "1"]},
                // },
            },
            
            usarBasicos: {
                editar: editarRegistroModal({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioTransaccion,
                    URL_FORM: `${URL}`,
                    URL_LISTAR: URL_LT,
                    estiloTd,
                }, {
                    datosExtra: [
                        { key: "idt", value_r: "id" },
                        { key: "ver", value: "registrotransaccionf5" },
                    ]
                }, undefined, recargarNT),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: (id) => `${URL}eliminartransaccion/${id}/${empresa_id}`,
                }, undefined, recargarNT),
                condicional: { llave: "consolidar", falsos: [1, "1"]},
            },
            dropdown: [
                {
                    accion: Duplicar({
                        url_d: `${URL}duplicartransaccion/`, 
                        URL_LT,
                        contenedorDeAlertas,
                        vistaPrincipal,
                        estiloTd
                    }),
                    icono: "bi bi-copy",
                    classElemento: "btn btn-info btn-sm ",
                    titulo: "Duplicar transacción",
                    condicional: { llave: "consolidar", falsos: [1, "1"]},
                },
                {
                    estilo: VerDetalle,
                    condicional: { llave: "consolidar", falsos: [1, "1"]},
                },
            ],
        },
    ];
    // Eliminar las opciones de editar y eliminar si el usuario no tiene permisos.
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
            btnNuevoRegistro(() => DesconsolidacionMultiple(vistaPrincipal, URL, contenedorDeAlertas), "Desconsolidar", "unlock-fill"),
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
    const opnsRegistro = OpcionesRegistro(vistaRegistrar, recargarNT);
    if (permisos.escritura === "1") {
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL_FORM: `${URL}`,
            URL_LISTAR: URL_LT,
            camposDeFormulario: formularioTransaccion,
            estiloTd,
        }, {first: opnsRegistro}, {
            datosExtra: [
                { key: "ver", value: "registrotransaccion" },
                { key: "empresa", value: empresa_id },
                { key: "sucursal", value: sucursal_id },
            ]
        }, recargarNT);
    }
}

const VerDetalle = ({elemento, registro}) => {
    const icono = crearElemento("i", {class: "bi bi-file-text"});
    elemento.setAttribute("class", "btn btn-primary btn-sm");
    elemento.setAttribute("title", "Detalle transacción");
    elemento.appendChild(icono);
    
    const URL = `${URL_APIC}api/`;
    const URL_LT = `${URL}listadetalletransaccion/${registro.id}`;

    const elementosModal = VistaPDF("Transacción contable", {nombrePDF: "transaccion_contable"});
    const btnVistaPrevia = BotonPDF(elementosModal, VPDetalle(URL_LT, registro));
    btnVistaPrevia(elemento);
}