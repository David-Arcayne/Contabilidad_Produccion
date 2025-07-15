import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { obtenerDatos, obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { DarDeBaja } from "./Funcionalidades/DarDeBaja.js";
import { BusquedaYReportes } from "./Funcionalidades/Reportes.js";
import { Imagen } from "./Funcionalidades/Imagen.js";
import { Notificacion, NotificacionInventario, SoloNotificacion } from "./Funcionalidades/Notificacion.js";
import { VerBajas } from "./Funcionalidades/VerBajas.js";
import { alertaDeExito } from "../../funciones/Alertas.js";
import { TipoInventario } from "./Funcionalidades/TipoInventario.js";
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

// export function Bajas(codigo, permisos) {
//     const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
//     const contenedorPrincipal = vistaPrincipal.parentNode;
//     const contenedorTI = crearElemento("div");
//     contenedorPrincipal.prepend(contenedorTI);

//     const usuario_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].idusuario;
//     const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));

//     // Crea un modal con un formulario
//     if (!objAFTI || objAFTI.usuario != usuario_id) {
//         const accion = () => BajasFA(codigo, permisos, contenedorTI);
//         TipoInventario(contenedorTI, accion);
//     } else {
//         const subtitulo = vistaPrincipal.closest(".card").querySelector(".card-header h6");
//         // const textoTitulo = subtitulo.textContent;
//         subtitulo.textContent = `${"Bajas"} (Inventario: ${objAFTI.nombre})`;
//         BajasFA(codigo, permisos, contenedorTI);

//     }

// }

export function Bajas(codigo, permisos) {
    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);

    // const iconoObservacion = crearElemento("i", { class: "bi bi-bell-fill" });
    // const btnObservacion = crearElemento("button", { class: "btn btn-sm btn-primary rounded-5 mb-4" }, [iconoObservacion, " Ver sugerencias"]);
    // const divObservacion = crearElemento("div", {class: "d-flex justify-content-end"}, [btnObservacion]);
    // const divAlertaObs = crearElemento("div", undefined, [divObservacion]);
    // vistaPrincipal.appendChild(divAlertaObs);

    const divAlertaObs = crearElemento("div");
    

    if (!objAFTI) {
        const notificacion = NotificacionInventario(vistaPrincipal);
        divAlertaObs.append(notificacion);
        vistaPrincipal.append(divAlertaObs);

        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Seleccione un tipo de inventario para continuar"]);
        vistaPrincipal.appendChild(h1);
        return;
    } else {
        const notificacion = NotificacionInventario(vistaPrincipal, () => { 
            return {
                vistaPrincipal,
                contenedorDeAlertas,
                URL,
                estiloTd,
                contenidoTabla,
                tBody
            }
        });
        divAlertaObs.append(notificacion);
        vistaPrincipal.append(divAlertaObs);
    }

    const URL = "./api/activo-fijo/bajas";

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
    ];
    let acciones = {
        baja: {
            estilo: DarDeBaja({
                vistaPrincipal,
                contenedorDeAlertas,
                URL,
                estiloTd,
            }),
        },
        bajas: {
            estilo: VerBajas({
                vistaPrincipal,
                contenedorDeAlertas,
                URL,
                estiloTd,
            }),
        },
        pdf: {
            estilo: pdfHistorial,
            // classElemento: "btn btn-sm btn-dark border border-danger",
            // titulo: "PDF Bajas",
            // href: (id) => `./api/pdf/activo-fijo/historial-baja/${id}`,
        },
        notificacion: {
            estilo: Notificacion(vistaPrincipal),
            condicional: { llave: "notificaciones", verdaderos: [0, "0"] },
        }
    };
    
    let colOpciones = {acciones};
    const encabezadoTabla = [
        "Código",
        "Cantidad",
        "Cantidad actual",
        "Nombre",
        "Detalle",
        "Precio",
        "Fecha de ingreso",
        "Categoría",
        "Tipo de bien",
        "Póliza de seguro",
        "Observación",
        "Estado",
        "Inventario",
        "Imágenes",
        // "Situación",
        "Opciones"];
    const contenidoTabla = [
        "codigo",
        "cantidad",
        "cantidadaltas",
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
                accion: VerEstados(vistaPrincipal, `./api/activo-fijo`),
                icono: "bi bi-list-check",
                classElemento: "btn btn-info btn-sm",
                titulo: "Ver estados",
                condicional: { llave: "eliminado_en" },
            },
        },
        "nombretipoinventario",
        {
            nombre: "Imágenes",
            accion: {
                accion: Imagen({ vistaPrincipal, vistaImagen, URL: `./api/activo-fijo`, permisos }),
                icono: "bi bi-image",
                classElemento: "btn btn-info btn-sm px-3",
                titulo: "Imagenes",
                condicional: { llave: "eliminado_en" },
            },
        },
        {
            nombre: "Opciones",
            ...colOpciones,
            
        },
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    // const iconoCambiarTI = crearElemento("i", { class: "bi bi-arrow-repeat pe-1" });
    // const btnCambiarTI = crearElemento("button", { class: "btn btn-primary", title: "Cambiar tipo de inventario"}, [iconoCambiarTI, " Inventario"]);
    // btnCambiarTI.addEventListener("click", () => {
    //     const accion = () => {
    //         const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
    //         alertaDeExito(contenedorDeAlertas, "Se cambio el tipo de inventario");
    //         const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    //         obtenerDatosAlr(`${URL}/${objAFTI.tipo_inventario}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    //     }
    //     TipoInventario(contenedorTI, accion);
    // });
    // const opcionesPrincipales = opciones([btnCambiarTI]);

    const formularioReportes = BusquedaYReportes({ contenidoTabla, elementoTBody: tBody, URL, estiloTd })();
    const divBuscar = InputBusqueda(tabla.querySelector("table"));
    const btnFitroNot = SoloNotificacion({ contenidoTabla, elementoTBody: tBody, URL, estiloTd })
    const divBuscarYNotificacion = crearElemento("div", { class: "row m-0 pb-2" }, [divBuscar, btnFitroNot]);
    vistaPrincipal.append(contenedorDeAlertas, formularioReportes, divBuscarYNotificacion, tabla);
    // Listar los registros en la tabla.
    // const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(`${URL}/${objAFTI.tipo_inventario}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
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
}

const pdfHistorial = ({elemento, registro}) => {
    const iconoPDF = crearElemento("i", {class: "bi bi-file-text"});
    elemento.append(iconoPDF);
    elemento.setAttribute("class", "btn btn-sm btn-dark border border-danger");
    elemento.setAttribute("title", "Historial bajas (vista previa)");
    
    const elementosModal = VistaPDF("Historial bajas", [`./api/pdf/activo-fijo/historial-baja/${registro.id}`, "GET", undefined, undefined, undefined, undefined, "historial_bajas"]);
    const btnModal = BotonPDF(elementosModal, HistorialPDF(`./api/pdf/activo-fijo/historial-baja-js/${registro.id}`));
    btnModal(elemento);
}

const VerEstados = (vistaPrincipal, URL) => async ({elemento, registro}) => {

    const estados = await obtenerDatos(`${URL}/ver-estado/${registro.id}`);

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