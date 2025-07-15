import { alertaDeError } from "../../../funciones/Alertas.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { rellenarSelect } from "../../../funciones/Solicitudes.js";

export const TipoInventario = (contenedorTI, accion) => {
    const usuario_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].idusuario;

    const innerDiv = crearElemento("div", {class: "inner-div"});
    const floatingDiv = crearElemento("div", {class: "floating-message text-center p-md-4", style: "width: 100%; max-width:450px; min-width: 250px"});
    
    const selectAFInv = crearElemento("select", {class: "form-select text-start", name: "altas_tipoinventario", required: true, id:"altas_tipoinventario"});
    const aceptar = crearElemento("button", {class: "btn btn-primary"}, "Aceptar");
    const cancelar = crearElemento("a", {class: "btn btn-secondary"}, "Cancelar");
    const colOpciones = crearElemento("div", {class: "col"}, [aceptar, " ", cancelar]);
    const titulo = crearElemento("h2", {class: ""}, "Elija el tipo de inventario");
    const formulario = crearElemento("form", {class: "row g-3 mx-3 mb-2 mt-0"}, [selectAFInv, colOpciones]);
    const contenido = crearElemento("div", undefined, [titulo, formulario]);
    floatingDiv.appendChild(contenido);
    innerDiv.appendChild(floatingDiv);

    // Preparación y envio de formulario y control de la respuesta
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        let afTipoInventario;
        if (selectAFInv.value == "default") {
            afTipoInventario = {usuario: usuario_id, tipo_inventario: "", nombre: ""};
        } else {
            afTipoInventario = {usuario: usuario_id, tipo_inventario: selectAFInv.value, nombre: selectAFInv.options[selectAFInv.selectedIndex].text};
        }
        const sesionTI = await insertarTipoInventario(afTipoInventario);
        if (sesionTI && sesionTI.tipoinventario === afTipoInventario.tipo_inventario && sesionTI.usuario === usuario_id) {
            sessionStorage.setItem("af_tipo_inventario", JSON.stringify(afTipoInventario));
        }
        const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));

        if (objAFTI && objAFTI.usuario == usuario_id) {
            const subtitulo = contenedorTI.closest(".card").querySelector(".card-header h6");
            subtitulo.textContent = `${"Altas"} (Inventario: ${objAFTI.nombre})`;
            accion();
        } else {
            alertaDeError(contenedorTI, "Ocurrio un error ...")
        }
        innerDiv.remove();
    })
    const selectDato = {
        origen: `./api/tipo-inventario/activos`, 
        llaves: { id: "id", detalle: "nombre" },
        opcionesExtra: [
            {
                value: "default",
                text: "Todos (prueba)",
            }
        ]
    }
    rellenarSelect(selectAFInv, selectDato);

    // Elimina el modal si se hace click fuera del contendor de mensaje
    innerDiv.addEventListener('click', function(event) {
        if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
            innerDiv.remove();
        }
    });
    
    contenedorTI.appendChild(innerDiv);
}

async function insertarTipoInventario(tipoInventario) {
    let datos = null;
    const body = new FormData();
    // body.append("af_idusuario", tipoInventario[0].idusuario);
    // body.append("af_idempresa", tipoInventario[0].empresa.idempresa);
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