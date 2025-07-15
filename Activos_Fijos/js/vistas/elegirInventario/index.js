import { rellenarSelect } from "../../funciones/Solicitudes.js";
import { crearElemento } from "../../funciones/Funciones.js";
import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export async function ElegirInventario(codigo, permisos) {
    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
   
    const contenedorPrincipal = vistaPrincipal.parentNode;

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    const contendorFormulario = crearElemento("div");
    const separador = crearElemento("hr", {class: "mt-3"});
    const contenedorContenido = crearElemento("div");

    const icono = crearElemento("i", {class: "bi bi-info-circle-fill"});
    const titulo = crearElemento("p", {class: "fs-6 text-success fw-semibold"}, [icono, " Tipo de Inventario:"]);
    const contenido = crearElemento("p", {class: "text-center fs-5 text-uppercase fst-italic"});
    const div = crearElemento("div", {class: "col-md-5"}, [titulo, contenido]);
    const divContenedor = crearElemento("div", {class: "row justify-content-center mt-5"}, [div]);
    contenedorContenido.appendChild(divContenedor);

    contenedorPrincipal.append(contendorFormulario, separador, contenedorDeAlertas, contenedorContenido);

    // const objAFTI = await obtenerDatos(URL);
    const usuario_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].idusuario;
    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));

    if (objAFTI && objAFTI.usuario == usuario_id) {
        if (objAFTI.nombre === "") {
            contenido.innerHTML = "* Todos los inventarios";
        } else {
            contenido.innerHTML = `${objAFTI.nombre}`;
        }
    } else {
        const icono = crearElemento("i", {class: "bi bi-exclamation-triangle-fill"})
        const contenido = crearElemento("p", {class: "fs-6 text-center text-warning fw-semibold"}, [icono, "  Ningún inventario selecionado."]);
        div.replaceChildren(contenido);
    }

    // Creación del formulario
    if (permisos.escritura === "1") {
        const selectInv = crearElemento("select", {class: "form-select", id: "tipo_inventario_id", required: true});
        const labelInv = crearElemento("label", {class: "form-label", for: "tipo_inventario_id"}, ["Tipo de Inventario"]);
        const colInv = crearElemento("div", {class: "col-md-6 col-lg-4"}, [labelInv, selectInv]);

        const btnEnviar = crearElemento("button", {class: "btn btn-primary", type: "submit", id: "btn-enviar-formulario", style: "min-width: 120px"}, "Cambiar");
        const gridBtn = crearElemento("div", {class: "d-grid mx-5 mx-md-0"}, [btnEnviar]);
        const colBtn = crearElemento("div", {class: "col-md-auto"}, [gridBtn]);
        const rowBtn = crearElemento("div", {class: "row"}, [colBtn]);
        const colInvBtn = crearElemento("div", {class: "col-12"}, [rowBtn]);

        const formInv = crearElemento("form", {class: "row g-3"}, [colInv, colInvBtn]);
        contendorFormulario.appendChild(formInv);

        const selectDato = {
            origen: `./api/tipo-inventario/activos`, 
            llaves: { id: "id", detalle: "nombre" },
            opcionesExtra: [
                {
                    value: "default",
                    text: "* Todos los inventarios",
                }
            ]
        }
        rellenarSelect(selectInv, selectDato);

        // Preparación y envio de formulario y control de la respuesta
        formInv.addEventListener("submit", async (e) => {
            e.preventDefault();
            let afTipoInventario;
            if (selectInv.value == "default") {
                afTipoInventario = {usuario: usuario_id, tipo_inventario: "", nombre: ""};
            } else {
                afTipoInventario = {usuario: usuario_id, tipo_inventario: selectInv.value, nombre: selectInv.options[selectInv.selectedIndex].text};
            }
            const sesionTI = await insertarTipoInventario(afTipoInventario);
            if (sesionTI && sesionTI.tipoinventario === afTipoInventario.tipo_inventario && sesionTI.usuario === usuario_id) {
                sessionStorage.setItem("af_tipo_inventario", JSON.stringify(afTipoInventario));
            }
            const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));

            if (objAFTI && objAFTI.usuario == usuario_id) {
                div.replaceChildren(titulo, contenido);
                if (objAFTI.nombre === "") {
                    contenido.innerHTML = "* Todos los inventarios";
                } else {
                    contenido.innerHTML = `${objAFTI.nombre}`;
                }
                alertaDeExito(contenedorDeAlertas, "Se cambio el tipo de inventario");
            } else {
                alertaDeError(contenedorDeAlertas, "Ocurrio un error ...");
            }
        });
    } else {
        separador.remove();
    }
}

async function insertarTipoInventario(tipoInventario) {
    let datos = null;
    const body = new FormData();
    body.append("af_tipoinventario", JSON.stringify(tipoInventario));
    await fetch("./api/iniciar-tipoinventario", {
        method:"POST",
        body,
    })
    .then(res => res.json())
    .then(res =>{ 
        datos = res;
    })
    .catch(error => {
        datos = false;
    })

    return datos;
}