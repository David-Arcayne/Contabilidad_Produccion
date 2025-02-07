import { URL_APIP } from "../../../../../lib/services.js";
import { codigos } from "../constantes.js";
import * as listarFunctions from "../../funciones/listar.js";
import { modal_editar_proveedor } from "../Editar_proveedor/editar.js";
import { Editar_tabla_celda } from "../../funciones/dbc_editar_celda_table.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let Lista_proveedores = [];
let privilegios;

let obt_rubro_aux = {
  id: 0,
  rubro: "",
  detalle: "",
};
const codigo = codigos.codigoRegistrar;
let code_;
let permisos_;
let refrescar_;

export function registrar_proveedor(code, permisos, refrescar) {
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
  code_ = code;
  permisos_ = permisos;
  refrescar_ = refrescar;
  sitio();
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_api_general_verd("listarProveedor", idEmpresa),
      listarFunctions.listar_api_general_verd(
        "listar_productos_porGrupo",
        idEmpresa
      ),
      listarFunctions.listar_api_general_verd(
        "listar_grupo_etapas_porProducto",
        idEmpresa
      ),
      listarFunctions.listar_api_general_verd(
        "listar_productos_porGrupo_y_etapas",
        idEmpresa
      ),
    ]);
    // Asignamos los resultados a las variables correspondientes
    Lista_proveedores = resultados[0];
    console.log(Lista_proveedores);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
function menuPrveedores(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  const forme = document.querySelector(`#alerta`);
  switch (funcion) {
    case "eliminar_proveedor":
      eliminar_proveedor(id1);
      break;
    case "editar_Proveedor":
      modal_editar_proveedor(code_, permisos_, refrescar_, id1);
      break;
    // Agrega otros casos según sea necesario
    default:
      // Manejo para casos no coincidentes
      sitio();
      break;
  }
}
 async function eliminar_proveedor(id){
  if (confirm("Desea Eliminar..?")) {
      let data = await listarFunctions.listar_api_general_verd("eliminar_proveedor",id); 
      alertas(data);
  }
 }
async function sitio() {
  let view = `
        <div class="container">
            
            <h5 class="text-center mb-4 fw-bold fs-6" >Proveedores</h5>

            <form id="formulario${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" >

                <input type="hidden" name="ver" value="registroProveedor">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="nombre_proveedor" class="form-label">Nombre Proveedor:</label>
                        <input type="text" class="form-control" id="nombre_proveedor" name="nombre_proveedor" required>
                    </div>
                    <div class="col-md-6">
                        <label for="codigo" class="form-label">Código:</label>
                        <input type="text" class="form-control" id="codigo" name="codigo" required>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="nit" class="form-label">NIT:</label>
                        <input type="text" class="form-control" id="nit" name="nit" value="0" required>
                    </div>
                    <div class="col-md-4">
                        <label for="detalle" class="form-label">Detalle:</label>
                        <input type="text" class="form-control" id="detalle" name="detalle" value="-" required>
                    </div>
                    <div class="col-md-4">
                        <label for="direccion" class="form-label">Dirección:</label>
                        <input type="text" class="form-control" id="direccion" name="direccion" value="-" required>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="telefono" class="form-label">Teléfono:</label>
                        <input type="number" class="form-control" id="telefono" name="telefono" value="0" maxlength="11" required>
                    </div>
                    <div class="col-md-4">
                        <label for="mobil" class="form-label">Móvil:</label>
                        <input type="number" class="form-control" id="mobil" name="mobil" value="0" required>
                    </div>
                    <div class="col-md-4">
                        <label for="email" class="form-label">Email:</label>
                        <input type="email" class="form-control" id="email" name="email" value="ejemplo@gmail.com" required>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="web" class="form-label">Web:</label>
                        <input type="text" class="form-control" id="web" name="web" value="-">
                    </div>
                    <div class="col-md-3">
                        <label for="pais" class="form-label">País:</label>
                        <input type="text" class="form-control" id="pais" name="pais" value="-" required>
                    </div>
                    <div class="col-md-3">
                        <label for="ciudad" class="form-label">Ciudad:</label>
                        <input type="text" class="form-control" id="ciudad" name="ciudad"  value="-" required>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="zona" class="form-label">Zona:</label>
                        <input type="text" class="form-control" id="zona" name="zona"  value="-" required>
                    </div>
                    <div class="col-md-8">
                        <label for="contacto" class="form-label">Contacto:</label>
                        <input type="text" class="form-control" id="contacto" name="contacto"  value="-" required>
                    </div>
                </div>

                <div class="d-flex justify-content-end mt-4">
                    <button type="submit" class="btn btn-outline-success mr-2" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                    <button type="button" class="btn btn-outline-primary" id="cancelarBtn${codigo}" aria-label="Cancelar">Cancelar</button>
                </div>

            </form>

            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>

            <div id="alerta${codigos.codigoPrincipal}" class="mt-4"></div>

            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
                
            </div>
            <div class="scrollable-table mt-4">

                <table class="table table-hover" id = "editableTable${codigo}">
                    <thead>
                        <tr class="table-dark">
                            <th>N°</th>
                            <th>Codigo</th>
                            <th>Nombre</th>
                            
                            <th>Nit</th>
                            <th>Detalle</th>
                            <th>Direccion</th>
                            <th>Telefono</th>
                            <th>Mobil</th>
                            <th>Email</th>
                            <th>Web</th>
                            <th>Pais</th>
                            <th>Ciudad</th>
                            <th>Zona</th>
                            <th>Contacto</th>
                            <th>Funciones</th>   
                            
                        </tr>
                    </thead>
                    <tbody id="listaproveedor${codigo}">
                        
                    </tbody>
                </table>
            </div>
        </div>
    `;
  app.innerHTML = view;
  await listar();
  listarProveedor();
  const forme = document.querySelector(`#formulario${codigo}`);
  forme.addEventListener("submit", (e) => sendform(e, forme));
  const cancelarBtn = document.getElementById(`cancelarBtn${codigo}`);
  cancelarBtn.addEventListener("click", () => {
    forme.reset();
  });
  const table = document.getElementById(`editableTable${codigo}`);
  table.addEventListener("dblclick", (e) => edit_Celda_table(e, table));
  const input = document.getElementById(`filtro${codigo}`);
  input.addEventListener("keyup", (e) => filtrar_table(e, input));
  const toggleButton = document.getElementById(`toggleButton${codigo}`);
  toggleButton.addEventListener("click", (e) =>
    mostrarFormulario(e, toggleButton)
  );
}
function mostrarFormulario(e, toggleButton) {
  const myForm = document.querySelector(`#formulario${codigo}`);

  if (myForm.style.display === "none" || myForm.style.height === "0px") {
    myForm.style.display = "block";
    setTimeout(() => {
      myForm.style.height = myForm.scrollHeight + "px";
      myForm.style.opacity = 1;
    }, 10); // Un pequeño retraso para asegurar que la transición ocurra
    toggleButton.innerHTML = '<i class="bi bi-dash-lg danger"></i>';
  } else {
    myForm.style.height = "0";
    myForm.style.opacity = 0;
    setTimeout(() => {
      myForm.style.display = "none";
    }, 500); // Esperar a que termine la transición
    toggleButton.innerHTML = '<i class="bi bi-plus"></i>';
  }
}
function filtrar_table(e, input) {
  const table = document.getElementById(`editableTable${codigo}`);
  const tbody = table.getElementsByTagName("tbody")[0];
  const rows = tbody.getElementsByTagName("tr");
  input.addEventListener("keyup", function () {
    const filter = input.value.toLowerCase();

    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let cells = row.getElementsByTagName("td");
      let rowText = "";

      for (let j = 0; j < cells.length; j++) {
        rowText += cells[j].textContent.toLowerCase() + " ";
      }

      if (rowText.includes(filter)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }
  });
}
function edit_Celda_table(e) {
  const elementos = [
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
  ];
  const elementos_select = [];
  const elementos_number = ["telefono", "mobil"];
  const url_api = "editar_Proveedor";
  const ver = "ver";
  const nom_v_Emp = "empresa";
  const md5 = uk[0].empresa.idempresa;
  const id = "id";

  Editar_tabla_celda(
    e,
    Lista_proveedores,
    codigos.codigoPrincipal,
    elementos_select,
    elementos_number,
    url_api,
    ver,
    nom_v_Emp,
    md5,
    id
  );
}

function listarProveedor() {
  const listarr = document.querySelector(`#listaproveedor${codigo}`);
  let view = "",
    ind = 1;

  Lista_proveedores.map((lista) => {
    console.log(lista.email);
    let actualizar;
    let eliminar;
    actualizar = {
      0: ``,
      1: `
                 
                <div class="text-center">
                    <a data-id="editar_Proveedor,${lista.id},${uk[0].empresa.idempresa}" 
                    class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                    style="width: 2.5rem; height: 2.5rem;"
                    title="Editar proveedor">
                        <i class="bi bi-pencil-square fs-5"></i>
                    </a>
                   
                </div>
                `,
    };
    eliminar = {
      0: ``,
      1: `
                <div class="text-center">
                    <a data-id="eliminar_proveedor,${lista.id},${uk[0].empresa.idempresa}" 
                    class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                    style="width: 2.5rem; height: 2.5rem;"
                    title="Eliminar proveedor">
                        <i class="bi bi-trash fs-5"></i>
                    </a>
                   
                </div>
                `,
    };
    view += `
          <tr>
            <td >${ind++}</td> 
            <td data-type="${lista.id},codigo,codigo">${lista.codigo}</td> 
            <td data-type="${lista.id},nombre,nombre">${lista.nombre}</td>               
             <td data-type="${lista.id},nit,nit">${lista.nit} </td>
             <td data-type="${lista.id},detalle,detalle">${lista.detalle}</td> 
             <td data-type="${lista.id},direccion,direccion">${lista.direccion}</td> 
             <td data-type="${lista.id},telefono,telefono">${lista.telefono}</td> 
             <td data-type="${lista.id},mobil,mobil">${lista.mobil}</td>  
             <td data-type="${lista.id},email,email">${lista.email}</td>  
             <td data-type="${lista.id},web,web">${lista.web}</td> 
             <td data-type="${lista.id},pais,pais">${lista.pais}</td>  
             <td data-type="${lista.id},ciudad,ciudad">${lista.ciudad}</td>           
             <td data-type="${lista.id},zona,zona">${lista.zona}</td>  
             <td data-type="${lista.id},contacto,contacto">${lista.contacto}</td>   
            
            <td>
                <div class="d-flex gap-3">
                    ${actualizar[privilegios[2]]}
                    ${eliminar[privilegios[3]]} 
                </div>
                                           
            </td>
         </tr>
         `;
  });
  //  console.log(view);
  listarr.innerHTML = view;

  const enlaces = document.querySelectorAll(".btn");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menuPrveedores);
  });
}

function sendformData(event, formData) {
  event.preventDefault();

  fetch(`${URL_APIP}api/`, {
    // Reemplaza esto con la URL de tu servidor
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alertas(data);
    })
    .catch((error) => {
      console.error("Error al enviar los datos:", error);
    });
}

function sendform(e, form) {
  e.preventDefault();
  const dato = new FormData(form);
  console.log(dato);
  fetch(`${URL_APIP}api/`, {
    method: "POST",
    body: dato,
  })
    .then((res) => res.json())
    .then((data) => {
      alertas(data);
    });
}
export async function alertas(data) {
  Lista_proveedores = await listarFunctions.listar_api_general_verd("listarProveedor", uk[0].empresa.idempresa);
  console.log(data);
  // Definir las variables al principio
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "success" || data[0] ===  "ok") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 1500;

    // Resetear el formulario si existe
    let formulario = document.querySelector(`#formulario${codigo}`);
    if (formulario) {
      formulario.reset();
    }
    listarProveedor();
    
  } else {
    if (data[0] == "danger") {
      alertClass = "alert-danger";
      alertMessage = data[1];
      timeoutDuration = 3000;
    } else {
      alertClass = "alert-primary";
      alertMessage = data[1];
      timeoutDuration = 3000;
    }
  }

  // Obtener el div de alerta
  let divalert = document.querySelector(`#alerta${codigos.codigoPrincipal}`);
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
