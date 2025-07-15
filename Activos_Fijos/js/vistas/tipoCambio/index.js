import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatos, obtenerDatosAlr, solicitudPDF } from "../../funciones/Solicitudes.js";
import { btnNuevoRegistro, BuscarEnTabla, cambiarVista, crearElemento, opciones, pdfYBusqueda } from "../../funciones/Funciones.js";
import { formularioTipoCambio } from "./Formularios.js";
import { editarRegistro, eliminarRegistro } from "../../funciones/OpcionesBasicas.js";
import { RegistroExcel } from "./Funcionalidades/RegistroExcel.js";
import { crearFormulario } from "../../funciones/CrearFormulario.js";
import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { AF_ENV } from "../../../db/environment.js";
import { BotonPDF, VistaPDF } from "../../funciones/VistaPDF.js";
import { ContenidoPDF } from "./Funcionalidades/ContenidoPDF.js";
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
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    // const empresa_id = 'd09bf41544a3365a46c9077ebb5e35c3'
    const URL = `${AF_ENV.apiUrl}/app/ct/api`;

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

    // if (permisos.escritura === "1") {
    //     const opcionesBtns = btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar));
    //     opcionesBtns.classList.add("mb-2");
    //     vistaPrincipal.appendChild(opcionesBtns);
    // }
    const encabezadoTabla = [
        "Fecha",
        "UFV",
        "Dolar",
        "Opciones"   
    ];
    const estiloTd = [
        "date",
        "text-end",
        "decimal",
        "text-start",
    ];

    const contenidoTabla = [
        "fecha",
        "ufv",
        "dolar",
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistro({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioTipoCambio,
                    URL: `${URL}`,
                    URL2: `${URL}/listatipodecambio/${empresa_id}`,
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
                    URL: `${URL}/eliminartipocambio`,
                }, {empresaId: empresa_id}),
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
    const elementosModal = VistaPDF("Tipo de cambio", [`./api/pdf/tipo-cambio/reporte-pdf`, "GET", undefined, undefined, undefined, undefined, "tipo_cambio"]);
    const btnModal = BotonPDF(elementosModal, ContenidoPDF(`${URL}/listatipodecambio/${empresa_id}`));
    const divBuscar = pdfYBusqueda(tabla.querySelector("table"), btnModal);
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => {
        const a = {data: registros};
        contenidoTBody(a, {contenido: contenidoTabla, estiloTd}, tBody); 
    }
    obtenerDatosAlr(`${URL}/listatipodecambio/${empresa_id}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });

    // Creación de formulario para la vista Registrar
    if (permisos.escritura === "1") {
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL,
            URL2: `${URL}/listatipodecambio/${empresa_id}`,
            camposDeFormulario: formularioTipoCambio,
            estiloTd,
            empresa_id,
        },
        false,
        {
            datosExtra: [
                { key: "ver", value: "registrotipodecambio" },
                { key: "empresa", value: empresa_id },
            ]
        });
    }
}

export const nuevoRegistro = (datosVista, extra, extraApi = false, accion = false) => {
    const {
        vistaPrincipal,
        vistaRegistrar,
        contenidoTabla,
        contenedorDeAlertas,
        tBody,
        URL,
        URL2,
        camposDeFormulario,
        registrosPropios,
        estiloTd,
        empresa_id
    } = datosVista;

    const cancelarRegistro = (e) => {
        e.preventDefault();
        cambiarVista(vistaRegistrar, vistaPrincipal);
    }
    const realizarRegistro = async () => {
        let listaDeRegistros = await obtenerDatos(URL2 ? URL2 : URL);
        listaDeRegistros = {data: listaDeRegistros}
        await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody, registrosPropios)
        cambiarVista(vistaRegistrar, vistaPrincipal);
        alertaDeExito(contenedorDeAlertas, "Registro exitoso");
        if (accion) accion();
    }
    const errorRegistro = () => {
        cambiarVista(vistaRegistrar, vistaPrincipal);
        alertaDeError(contenedorDeAlertas, "No se pudo realizar el registro");
    }

    const accionPrevia = async (enviarFormuario, formulario) => {
        let listaDeRegistros = await obtenerDatos(`${URL}/listatipodecambio/${empresa_id}`);
        const fechasExistentes = listaDeRegistros.map(registro => registro.fecha);

        const inputFecha = formulario.querySelector("#tipocambio_fecha");

        if (!fechasExistentes.includes(inputFecha.value)) {
            enviarFormuario();
        } else {
            cambiarVista(vistaRegistrar, vistaPrincipal);
            alertaDeAdvertencia(contenedorDeAlertas, "La fecha ya se encuentra registrada.");
        }
    };

    const extraForm = {};
    for (const dato of extraApi.datosExtra) {
        if (dato.value_r){
            extraForm[dato.key] = registro[dato.value_r];
        } else {
            extraForm[dato.key] = dato.value;
        }
    }
    const datosFormulario  = {
        myurl: `${URL}/`,
        datosExtra: extraForm,
        accionEnviar: realizarRegistro,
        error: errorRegistro,
        solicitudAPI: true,
        datosBtn: {
            btnClass: "btn btn-primary px-1 px-sm-4",
            nombre: "Guardar",
            accionCancelar: cancelarRegistro,
        },
        accionPrevia,
    }

    const nuevoformulario = crearFormulario(camposDeFormulario, datosFormulario);
    vistaRegistrar.appendChild(nuevoformulario);

    // const btnEliminarDatos = crearElemento("button", {class: "btn btn-danger btn-sm"}, ["Eliminar Datos"]);
    // vistaPrincipal.prepend(btnEliminarDatos);

    // btnEliminarDatos.addEventListener("click", async (e) => {
    //     e.preventDefault();
    //     const confirmacion = confirm("¿Está seguro de eliminar los datos?");
    //     if (confirmacion) {
    //         await eliminarDatosDB();
    //     }
    
    // });
}


// const eliminarDatosDB = async () => {
//     const URL = `${AF_ENV.apiUrl}/vapp/ct/api`;
//     const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
//     let listaDeRegistros = await obtenerDatos(`${URL}/listatipodecambio/${empresa_id}`);
//     console.log(listaDeRegistros);
//     const fechasMenoresYMayouresA = listaDeRegistros.filter(registro => registro.fecha < "2007-01-01" && registro.fecha > "2004-12-31");
//     // console.log(fechasMenoresYMayouresA);
//     // const fechasExistentes = fechasMenoresYMayouresA.map(registro => registro.fecha);
//     // console.log(fechasExistentes);
//     const idsExistentes = fechasMenoresYMayouresA.map(registro => registro.id);

//     let contador = 0;
//     idsExistentes.forEach(async id => {
//         contador++;
//         // console.log(id);

//         try {
//             const eliminado = await fetch(`${URL}/eliminartipocambio/${id}/${empresa_id}`);
//             console.log("Eliminado: ", id);
//         } catch (error) {
//             console.log(error);
//         }
                
//     });
//     console.log(contador);

// }