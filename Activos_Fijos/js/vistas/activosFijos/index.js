import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatos, obtenerDatosAlr, rellenarSelect } from "../../funciones/Solicitudes.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { formularioAF } from "./Formularios.js";
import { FormularioExcel } from "./Funcionalidades/RegistroExcel.js";
import { ComponentesAF } from "./Funcionalidades/Componentes.js";
import { btnExcelFormat, btnExportarExcel } from "./Funcionalidades/funciones.js";
import { BusquedaYReportes } from "./Funcionalidades/Reportes.js";
import { editarRegistro, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { Imagen } from "./Funcionalidades/Imagen.js";
import { Revaluo } from "./Funcionalidades/Revaluo.js";
import { AF_ENV } from "../../../db/environment.js";
import { BotonPDF, VistaPDF } from "../../funciones/VistaPDF.js";
import { HistorialPDF } from "./Funcionalidades/ContenidoPDF.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
// export function ActivosFijos(codigo, permisos) {
//     const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
//     const contenedorPrincipal = vistaPrincipal.parentNode;
//     const contenedorTI = crearElemento("div");
//     contenedorPrincipal.prepend(contenedorTI);

//     const usuario_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].idusuario;
//     const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));

//     // Crea un modal con un formulario
//     if (!objAFTI || objAFTI.usuario != usuario_id) {
//         const accion = () => Altas(codigo, permisos, contenedorTI);
//         TipoInventario(contenedorTI, accion);
//     } else {
//         const subtitulo = vistaPrincipal.closest(".card").querySelector(".card-header h6");
//         // const textoTitulo = subtitulo.textContent;
//         subtitulo.textContent = `${"Altas"} (Inventario: ${objAFTI.nombre})`;
//         Altas(codigo, permisos, contenedorTI);

//     }

// }

export async function ActivosFijos(codigo, permisos) {
    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    if (!objAFTI) {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Seleccione un tipo de inventario para continuar"]);
        vistaPrincipal.appendChild(h1);
        return;
    }

    const URL = "./api/activo-fijo";

    const prov = await proveedores();

    // Creación de Vistas para la navegación en la ventana
    // const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaEditar = crearElemento("div", { class: "d-none" });
    const vistaImagen = crearElemento("div", { class: "d-none" });
    const vistaSituacion = crearElemento("div", { class: "d-none" });
    const vistaComponentes = crearElemento("div", { class: "d-none" });
    const vistaRevaluo = crearElemento("div", { class: "d-none" });
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaEditar, vistaImagen, vistaSituacion, vistaComponentes, vistaRevaluo);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    
    // Contenido para la tabla con permisos.
    const estiloTd = [
        "text-start",
        "text-end",
        "text-end",
        "text-start",
        "text-start",
        "decimal",
        "date",
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
    let acciones = {
        // baja: {
        //     estilo: DarDeBaja({
        //         vistaPrincipal,
        //         contenedorDeAlertas,
        //         URL,
        //         estiloTd,
        //     }),
        // },
        componentes: {
            accion: ComponentesAF({ vistaPrincipal, vistaComponentes, permisos}),
            icono: "bi bi-list-columns-reverse",
            classElemento: "btn btn-secondary btn-sm ",
            titulo: "Componentes",
            condicional: { llave: "eliminado_en" },
        },
        revaluo: {
            accion: Revaluo({ vistaPrincipal, vistaRevaluo, permisos}),
            icono: "bi bi-cash-stack",
            classElemento: "btn btn-warning btn-sm border border-danger",
            titulo: "Revaluos",
        },
        pdf: {
            estilo: pdfHistorial,
            // classElemento: "btn btn-sm btn-dark border border-danger",
            // titulo: "PDF Historial",
            // href: (id) => `./api/pdf/activo-fijo/historial/${id}`,
        }
    };
    const titulo = crearElemento("h3", { class: "text-center mb-4"}, ["Edición Activo Fijo"]);
    let usarBasicos = {
        editar: editarRegistro({
            vistaPrincipal,
            vistaEditar,
            contenedorDeAlertas,
            camposDeFormulario: formularioAF,
            URL,
            URL2: () => `${URL}/habilitados/${JSON.parse(sessionStorage.getItem("af_tipo_inventario")).tipo_inventario}`,
            estiloTd,
        }, undefined, {first: titulo}),
        eliminar: eliminarRegistro({
            vistaPrincipal,
            contenedorDeAlertas,
            URL,
        })
    };
    if(permisos.editar === "0") {
        delete usarBasicos.editar;
        delete acciones.baja;
    }
    if(permisos.eliminar === "0") {
        delete usarBasicos.eliminar;
    }
    let colOpciones = {acciones};
    if (!(Object.keys(usarBasicos).length === 0)) {
        usarBasicos["condicional"] = { llave: "eliminado_en" };
        colOpciones["usarBasicos"] = usarBasicos;
    }
    const encabezadoTabla = [
        "Código",
        "Cantidad",
        "Disponibles",
        "Nombre",
        "Detalle",
        "Precio",
        "Fecha de Ingreso",
        "Categoría",
        "Tipo de bien",
        "Póliza de seguro",
        "Observación",
        "Estado",
        "Inventario",
        "Proveedor",
        "Imágenes",
        // "Situación",
        "Opciones"];
    const contenidoTabla = [
        "codigo",
        "cantidad",
        "cantidaddisponible",
        "nombre",
        "detalle",
        "precio",
        "fechacompra",
        "nombrecategoria",
        "nombretipobien",
        {
            nombre: "polizaseguro",
            miEstilo: Poliza,
        },
        "observacion",
        {
            nombre: "nombretipoestado",
            accion: {
                accion: VerEstados(vistaPrincipal, URL),
                icono: "bi bi-list-check",
                classElemento: "btn btn-info btn-sm",
                titulo: "Ver estados",
                condicional: { llave: "eliminado_en" },
            },
        },
        "nombretipoinventario",
        {
            nombre: "proveedor_id",
            miEstilo: nombreEmpresa(prov),
        },
        {
            nombre: "Imágenes",
            accion: {
                accion: Imagen({ vistaPrincipal, vistaImagen, URL, permisos }),
                icono: "bi bi-image",
                classElemento: "btn btn-info btn-sm px-3",
                titulo: "Imagenes",
                condicional: { llave: "eliminado_en" },
            },
        },
        // {
        //     nombre: "Situación",
        //     accion: {
        //         estilo: Situacion({
        //             vistaPrincipal,
        //             vistaSituacion,
        //             contenedorDeAlertas,
        //             URL,
        //             permisos
        //         }),
        //         condicional: { llave: "eliminado_en" },
        //     },
        // },
        {
            nombre: "Opciones",
            ...colOpciones,
        },
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    const formularioReportes = BusquedaYReportes({ contenidoTabla, elementoTBody: tBody, URL, estiloTd })();
    // const iconoCambiarTI = crearElemento("i", { class: "bi bi-arrow-repeat pe-1" });
    // const btnCambiarTI = crearElemento("button", { class: "btn btn-primary", title: "Cambiar tipo de inventario"}, [iconoCambiarTI, " Inventario"]);
    // btnCambiarTI.addEventListener("click", () => {
    //     const accion = () => {
    //         const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));  
    //         alertaDeExito(contenedorDeAlertas, "Se cambio el tipo de inventario");
    //         const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    //         obtenerDatosAlr(`${URL}/habilitados/${objAFTI.tipo_inventario}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    //     }
    //     TipoInventario(contenedorTI, accion);
    // });
    let arrayOpciones;
    if (permisos.escritura === "1") {
        arrayOpciones = [
            btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar)),
            FormularioExcel({
                vistaPrincipal,
                contenedorDeAlertas,
                contenidoTabla,
                tBody,
                URL,
                estiloTd,
            }),
            btnExcelFormat(),
            btnExportarExcel(),
            // btnCambiarTI,
        ]
    } else {
        arrayOpciones = [
            btnExportarExcel(),
            // btnCambiarTI
        ]
    }
    const opcionesPrincipales = opciones(arrayOpciones);
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true });
    vistaPrincipal.append(contenedorDeAlertas, opcionesPrincipales, formularioReportes, divBuscar, tabla);
    // Listar los registros en la tabla.
    // const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(`${URL}/habilitados/${objAFTI.tipo_inventario}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });

    // Creación de formularios para la vista Registrar}

    if (permisos.escritura === "1") {
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL,
            URL2: () => `${URL}/habilitados/${JSON.parse(sessionStorage.getItem("af_tipo_inventario")).tipo_inventario}`,
            camposDeFormulario: formularioAF,
            estiloTd,
            accionPrevia: AccionPrevia(vistaRegistrar),
        })
    }
}

/**
 * Obtine la poliza con el nombre del tipo de seguro.
 */
const Poliza = ({elemento, registro}) => {
    if (registro.polizaseguro) {
        elemento.innerHTML = registro.polizaseguro + ": " + registro.nombretiposeguro;
    } else {
        elemento.innerHTML = "-"
    }

    if(registro.eliminado_en){
        const fila = elemento.closest("tr");
        fila.setAttribute("class", "table-warning");
    }
}

const AccionPrevia = (vistaPrincipal) =>  (enviarFormulario, form) => {
    const checkCont = form.querySelector("#af_enviar-contabilidad");

    const innerDiv = crearElemento("div", {class: "inner-div"});
    const modalDarDeBaja = () => {
        const floatingDiv = crearElemento("div", {class: "floating-message text-center p-md-4 border border-2 border-success"});
        
        const formulario = `<div >
            <h2 class="" >Enviar a contabilidad</h2>
            <form class="row g-3 mx-3 mb-2 mt-0">
                <input type="date" class="form-control" id="cont-fecha" required>
                <input type="number" id="cont-monto" class="form-control" placeholder="monto" required>
                <textarea rows="1" class="form-control" placeholder="glosa" id="cont-detalle" required></textarea>
                <select class="form-select text-start" id="cont-tipo" required> </select>
                <div class="col">
                    <button class="btn btn-success" id="btn-enviar-formulario">Aceptar</button>
                    <a class="btn btn-danger">Cancelar</a>
                </div>
            </form>
        </div>`;
        floatingDiv.innerHTML = formulario;
        innerDiv.appendChild(floatingDiv);

        const precio = form.querySelector("#af_precio");
        const fechaIngreso = form.querySelector("#af_fecha_compra");

        const fecha = floatingDiv.querySelector("#cont-fecha");
        const monto = floatingDiv.querySelector("#cont-monto");
        const detalle = floatingDiv.querySelector("#cont-detalle");
        const tipo = floatingDiv.querySelector("#cont-tipo");
        
        fecha.value = fechaIngreso.value;
        monto.value = precio.value;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        rellenarSelect(tipo, {origen: `${AF_ENV.apiUrl}/app/ct/api/listaasientos/${empresa_id}`, llaves: { id: "id", detalle: "nombre" }, extraApi: true, text: "Asiento modelo"});

        const cancelar = floatingDiv.querySelector(".btn-danger");
        const elementoFormulario = floatingDiv.querySelector("form");
        
        elementoFormulario.addEventListener("submit", async (e) => {
            e.preventDefault();
            const c_fecha = crearElemento("input", {type: "hidden", name: "c_fecha", value: fecha.value});
            const c_monto = crearElemento("input", {type: "hidden", name: "c_monto", value: monto.value});
            const c_detalle = crearElemento("input", {type: "hidden", name: "c_detalle", value: detalle.value});
            const c_tipo = crearElemento("input", {type: "hidden", name: "c_tipo", value: tipo.value});

            form.append(c_fecha, c_monto, c_detalle, c_tipo);
            await enviarFormulario();
            c_fecha.remove();
            c_monto.remove();
            c_detalle.remove();
            c_tipo.remove();
            innerDiv.remove();
        });

    
        // Elimina el modal si se hace click fuera del contendor de mensaje
        innerDiv.addEventListener('click', function(event) {
            if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
                innerDiv.remove();
            }
        });
    }
    if (checkCont.checked) {
        modalDarDeBaja();
        vistaPrincipal.appendChild(innerDiv)
    } else {
        enviarFormulario();
    }
};

/**
 * Obtener el nombre de la emprese proveedora.
 */
const nombreEmpresa = (datos) => ({elemento, registro}) => {
    for (const empresa of datos) {
        if (empresa.id == registro.proveedor_id) {
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

const pdfHistorial = ({elemento, registro}) => {
    const iconoPDF = crearElemento("i", {class: "bi bi-file-text"});
    elemento.append(iconoPDF);
    elemento.setAttribute("class", "btn btn-sm btn-dark border border-danger");
    elemento.setAttribute("title", "Historial (Vista previa)");
    
    const elementosModal = VistaPDF("Historial activo");
    // const accion = () => {
    //     const main = elementosModal.divPage.querySelector("main");
    //     const tablas = main.querySelectorAll("table");
    //     tablas.forEach(tabla => {
    //         const btn = crearElemento("button", {style: "padding: 2px 10px; margin-bottom: 10px;"}, ["ocultar / ver"]);
    //         tabla.insertAdjacentElement('beforebegin', btn);
    //         btn.addEventListener("click", () => {
    //             tabla.classList.toggle("d-none");
    //         });
    //     });
    // }
    
    const opcionesPdf = [`./api/pdf/activo-fijo/historial/${registro.id}`, "POST", undefined, undefined, undefined, undefined, "historial_activo_fijo"]
    const btnModal = BotonPDF(elementosModal, HistorialPDF(`./api/pdf/activo-fijo/historial-js/${registro.id}`), opcionesPdf);
    btnModal(elemento);

}

const VerEstados = (vistaPrincipal, URL) => async ({elemento, registro}) => {
    // elemento.append(empresa.nombre);

    const estados = await obtenerDatos(`${URL}/ver-estado/${registro.id}`);

    console.log({estados});
    // {
    //     "status": 200,
    //     "rows": 2,
    //     "data": [
    //         {
    //             "id": "5",
    //             "codigo": "03060005-0000000000",
    //             "cantidad": "8",
    //             "inventarios_id": null,
    //             "activosfijos_id": "5",
    //             "empresa_id": "c0c7c76d30bd3dcaefc96f40275bdc0a",
    //             "sucursal_id": null,
    //             "departamento_id": null,
    //             "trabajador_id": null,
    //             "creado_en": "2024-10-18 07:38:09",
    //             "usu_creador": null,
    //             "id_ai": "8",
    //             "array_cantidad": [
    //                 {
    //                     "id": "2",
    //                     "cantidad": "4",
    //                     "observacion": "reparar",
    //                     "tipoestado_id": "2",
    //                     "activosinventarios_id": "8",
    //                     "nombreestado": "Dañado"
    //                 }
    //             ]
    //         },
    //         {
    //             "id": "10",
    //             "codigo": "03060005-0370400088",
    //             "cantidad": "2",
    //             "inventarios_id": null,
    //             "activosfijos_id": "5",
    //             "empresa_id": "c0c7c76d30bd3dcaefc96f40275bdc0a",
    //             "sucursal_id": "37",
    //             "departamento_id": "40",
    //             "trabajador_id": "88",
    //             "creado_en": "2024-10-18 08:30:51",
    //             "usu_creador": null,
    //             "id_ai": "10"
    //         }
    //     ]
    // }
    if (estados && estados.data) {
        const contenedorMensaje = crearElemento("div", {class: "floating-message p-md-4", style:"width: 100%; max-width:450px; min-width: 250px"});
        const contenedorModal = crearElemento("div", {class: "inner-div"}, [contenedorMensaje]);
        const titulo = crearElemento("h6", {class: "text-center fw-bold mb-3"}, ["Estados"]);
        const divContEstados = crearElemento("div", {class: ""});
        let informacion = "";
        estados.data.forEach((registro) => {

            const codigo = crearElemento("p", {class: "card-text fw-bold text-primary"}, [registro.codigo]);
            const divCabecera = crearElemento("div", {class: "mb-2"}, [codigo]);
            const divContenido = crearElemento("div", {class: ""});

            if (registro.array_cantidad) {
                registro.array_cantidad.forEach((estado) => {
                    const detalle = `
                        <p class="card-text mb-1"><span class="fw-bold">Cantidad: </span> ${estado.cantidad}</p>
                        <p class="card-text mb-1"><span class="fw-bold">Estado: </span> ${estado.nombreestado}</p>
                        <p class="card-text mb-1"><span class="fw-bold">Observación: </span> ${estado.observacion ?? "-"}</p>
                    `;
                    const divEstado = crearElemento("div", {class: "co border-top pt-2 mb-2"}, []);
                    divEstado.innerHTML = detalle;
                    divContenido.append(divEstado);
                });
            } else {
                const vacio = crearElemento("i", {class: "card-text fw-bold"}, ["Sin estado"]);
                divContenido.appendChild(vacio);
            }
            const divCard = crearElemento("div", {class: "card p-2 pb-0 mb-2"}, [divCabecera, divContenido]);
            divContEstados.append(divCard);
        });
        const btnOk = crearElemento("button", {class: "btn btn-info px-md-4"}, ["Ok"]);
        const divBtns = crearElemento("div", {class: "text-center mt-3"}, [btnOk]);
        contenedorMensaje.append(titulo, divContEstados, divBtns);
        vistaPrincipal.appendChild(contenedorModal);

        // Elimina el modal si se hace click fuera del contendor de mensaje
        contenedorModal.addEventListener("click", function (event) {
            if ((contenedorMensaje && !contenedorMensaje.contains(event.target)) || (btnOk && btnOk.contains(event.target))) {
                contenedorModal.remove();
            }
        });
    }    
}
