import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { URL_APIP } from "../../../../../lib/services.js";
import { alertas } from "../registrar/registra.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let Lista_proveedores = [];

async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_api_general_verd("listarProveedor", idEmpresa),
    ]);
    // Asignamos los resultados a las variables correspondientes
    Lista_proveedores = resultados[0];
    console.log(Lista_proveedores);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
let overlayy;
let app = "";
let code;
let privilegios;

let listas;
let id_Detalle;
let id;
const codigo = codigos.codigoEditarProveedor;
export function modal_editar_proveedor(code_, permisos, refrescar, id_) {
  app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);

  code = code_;

  id = id_;

  sitio();
}

async function sitio() {
  await listar();
  app.style.position = "relative";
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "1000";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.cursor = "pointer";
  app.appendChild(overlay);
  const variable = document.createElement("div");
  variable.style.width = "1000px";
  variable.style.height = "580px";

  variable.style.backgroundColor = "white";
  variable.style.padding = "20px";
  variable.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.3)";
  variable.style.zIndex = "1001";
  variable.style.position = "relative";
  variable.style.cursor = "auto";
  variable.style.maxHeight = "680px";
  variable.style.overflowY = "auto";
  variable.style.display = "block";
  overlay.appendChild(variable);

  let item_proveedor = Lista_proveedores.find(
    (obj) => Number(obj.id) === Number(id)
  );

  let view = `
         <a style="float: right;" class ="cerrar"><i class="bi bi-x-lg fs-5"></i></a>
         <div class="container">
            
            <h5 class="text-center mb-4 fw-bold fs-6" >Proveedores</h5>

            <form id="formulario${codigo}" >

                <input type="hidden" name="ver" value="editar_Proveedor">
                <input type="hidden" name="empresa" value="${
                  uk[0].empresa.idempresa
                }">
                <input type="hidden" name="id" value="${id}">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="nombre" class="form-label">Nombre Proveedor:</label>
                        <input type="text" class="form-control" id="nombre_proveedor" name="nombre" value="${
                          item_proveedor.nombre
                        }" required >
                    </div>
                    <div class="col-md-6">
                        <label for="codigo" class="form-label">Código:</label>
                        <input type="text" class="form-control" id="codigo" name="codigo" value="${
                          item_proveedor.codigo
                        }" required>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="nit" class="form-label">NIT:</label>
                        <input type="text" class="form-control" id="nit" name="nit" value="${
                          item_proveedor.nit
                        }" required>
                    </div>
                    <div class="col-md-4">
                        <label for="detalle" class="form-label">Detalle:</label>
                        <input type="text" class="form-control" id="detalle" name="detalle" value="${
                          item_proveedor.detalle
                        }" required>
                    </div>
                    <div class="col-md-4">
                        <label for="direccion" class="form-label">Dirección:</label>
                        <input type="text" class="form-control" id="direccion" name="direccion"  value="${
                          item_proveedor.direccion
                        }" required>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="telefono" class="form-label">Teléfono:</label>
                        <input type="number" class="form-control" id="telefono" name="telefono" maxlength="11" value="${Number(
                          item_proveedor.telefono
                        )}" required>
                    </div>
                    <div class="col-md-4">
                        <label for="mobil" class="form-label">Móvil:</label>
                        <input type="number" class="form-control" id="mobil" name="mobil" value="${Number(
                          item_proveedor.mobil
                        )}" required>
                    </div>
                    <div class="col-md-4">
                        <label for="email" class="form-label">Email:</label>
                        <input type="email" class="form-control" id="email" name="email" value="${
                          item_proveedor.email
                        }" required>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="web" class="form-label">Web:</label>
                        <input type="text" class="form-control" id="web" name="web" value="${
                          item_proveedor.web
                        }">
                    </div>
                    <div class="col-md-3">
                        <label for="pais" class="form-label">País:</label>
                        <input type="text" class="form-control" id="pais" name="pais" value="${
                          item_proveedor.pais
                        }" required>
                    </div>
                    <div class="col-md-3">
                        <label for="ciudad" class="form-label">Ciudad:</label>
                        <input type="text" class="form-control" id="ciudad" name="ciudad" value="${
                          item_proveedor.ciudad
                        }" required>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="zona" class="form-label">Zona:</label>
                        <input type="text" class="form-control" id="zona" name="zona"  value="${
                          item_proveedor.zona
                        }" required>
                    </div>
                    <div class="col-md-8">
                        <label for="contacto" class="form-label">Contacto:</label>
                        <input type="text" class="form-control" id="contacto" name="contacto" value="${
                          item_proveedor.contacto
                        }" required>
                    </div>
                </div>

                <div class="d-flex justify-content-end mt-4">
                    <button type="submit" class="btn btn-outline-success mr-2" id="guardarBtn${codigo}" aria-label="Editar">Registrar</button>
                    <button type="button" class="btn btn-outline-primary" id="cancelarBtn${codigo}" aria-label="Cancelar">Cancelar</button>
                </div>

            </form>

            
        </div>
    `;
  variable.innerHTML = view;
  overlayy = overlay;

  const btncancelar = document.getElementById(`cancelarBtn${codigo}`);
  btncancelar.addEventListener('click',cerrarModal);
  const forme = document.querySelector(`#formulario${codigo}`);

  forme.addEventListener("submit", (e) => sendform(e, forme));

  variable.addEventListener("click", function (event) {
    //console.log(event.target);
    let aTag = event.target.closest("a.cerrar");

    if (aTag) {
      event.preventDefault();
      cerrarModal();
    }
  });
  function cerrarModal() {
    overlay.remove();
    app.style.removeProperty("position");
  }


  function sendform(e, form) {
    e.preventDefault();
    const dato = new FormData(form);
    console.log(dato);
    for (let [key, value] of dato.entries()) {
      console.log(key, value);
    }
    fetch(`${URL_APIP}api/`, {
      method: "POST",
      body: dato,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        alertas_modal(data);
      });
  }
  function alertas_modal(data){
    console.log(data);
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "success") {
      cerrarModal();
      alertas(data);
    } else {
      
        alertClass = "alert-danger";
        alertMessage = data[1];
        timeoutDuration = 3000;
      
    }
  
    // Obtener el div de alerta
    let divalert = document.querySelector(`#alerta${codigo}`);
    if (divalert) {
      // Crear el nuevo contenido de la alerta
      let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
      divalert.innerHTML = nuevoContenido;
  
      // Eliminar la alerta después del tiempo especificado
      setTimeout(() => {
        divalert.innerHTML = ``;
      }, timeoutDuration);
    }
  }


}

