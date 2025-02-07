import * as listarFunctions from "../funciones/listar.js";
import { codigos } from "./constantes.js";

import { editarCelda } from "../funciones/celda_editar.js";
import { Editar_fila_ } from "../funciones/editar_fila_.js";
import * as fuG from "../funciones/generales.js";
import * as registrarFuntions from "../funciones/registrar.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let app = "";
let code_;
let permisos_;
let refrescar_;
let Lista_empleados = [];
let Lista_seccion = [];
let Lista_rubro = [];

let Lista_Areas = [];

let Lista_unidad_tiempo = [];
const codigo = codigos.codigoAreas;
let privilegios;

export async function areas_rh_config(code, permisos, refrescar) {
  code_ = code;
  permisos_ = permisos;
  refrescar_ = refrescar;
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
  

  sitio();
}

async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    const idsucursal = uk[0].empresa.idsucursal;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      
      listarFunctions.listar_api_general('listado_areas',idsucursal),
      
    ]);

    // Asignamos los resultados a las variables correspondientes
    
    Lista_Areas = resultados[0];
    
    console.log(Lista_Areas);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "editar_areas":
      toggleEditSave(event);
      break;
    case "eliminar_areas":
      eliminar_areas(id1);//
      break;
    
    default:
      sitio();
      break;
  }
}


async function eliminar_areas(idareas ){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general('eliminar_areas',idareas);
      
      
      if(data[0] == "success" || data[0] === 'ok' ){
        sitio();
        fuG.alertas(data,codigo);
      }
  }
}
async function toggleEditSave(event){
    const columnas = [
            {
                index: 1,
                editable: true,
                type: 'text',
                field: 'nombre',
                validations: { required: true }
            },
            {
                index: 2,
                editable: true,
                type: 'text',
                field: 'descripcion',
                validations: { required: true }
            },
           
            {
                index: 3,
                editable: true,
                type: 'date',
                field: 'fecha',
                validations: { required: true }
        
            }
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_Areas, columnas, 'idareas');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
    
      const formData = new FormData();
      formData.append("verDavid", "editar_areas");
      formData.append("sucursal_idsucursal", uk[0].empresa.idsucursal);

      Object.entries(resultado).forEach(([key, value]) => {
        formData.append(key, value);
      });
    
      console.log("FormData prepared for submission:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
    
      try {
        const data = await registrarFuntions.sendformData2(formData);
        console.log("Server response:", data);
        fuG.alertas(data,codigo);
        if(data[0] == "danger" || data[0] == "Error" ){
          sitio();
        }
      } catch (error) {
        console.error("Error submitting data to the server:", error);
      }
}


async function edit_Celda_table(event) {
  const elementos_select = ["seccion_idseccion","idcontrol_unidad_tiempo"]; // Columnas que usan elementos <select>
  const elementos_number = ['frecuencia', 'costo']; // Columnas que usan campos numéricos
  

  const resultado = await editarCelda(event, Lista_Areas, codigo, elementos_select, elementos_number, 'idtarea_limpieza');
 
  console.log(resultado); 
  const formData = new FormData();
  formData.append('verDavid', "editar_areas");
  Object.entries(resultado).forEach(([key, value]) => {
      formData.append(key, value);
  });
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const data = await registrarFuntions.sendformData2(formData);
    console.log("Server response:", data);
    fuG.alertas(data,codigo);
    if(data[0] == "danger" || data[0] == "Error" ){
      sitio();
    }
  } catch (error) {
    console.error("Error submitting data to the server:", error);
  }

}







async function sitio() {
  await listar();
  let view = "",ind = 1;
  view += `
          <div class="container">
               
              <h5 class="text-center mb-4 fw-bold fs-6" >Areas</h5>
              <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">

                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" placeholder="Ingrese el nombre del área" required>
                </div>
                <!-- Descripción -->
                <div class="mb-3">
                    <label for="descripcion" class="form-label">Descripción</label>
                    <textarea class="form-control" id="descripcion" name="descripcion" rows="3" placeholder="Descripción del área"></textarea>
                </div>
                <div class="mb-3">
                    <label for="fecha" class="form-label">Fecha</label>
                    <input type="date" class="form-control" id="fecha${codigo}" name="fecha" required>
                </div>
                <div class="d-flex justify-content-end mt-4">
                    <button type="submit" class="btn btn-outline-success me-2" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                    <button type="reset" class="btn btn-outline-primary" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>
                </div>
              </form>
            
            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>
            <div id="alerta${codigo}" class="mt-4"></div>
            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
            </div>
            <div class="mt-4" style = "max-height: 350px; overflow-y: auto; display: block;">
                
                <table class="table table-striped table-hover" id = "editableTable${codigo}">
                  <thead class="table-dark">
                    <tr>
                      <th scope="col">N°</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Descripción</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Funciones</th>
                    </tr>
                  </thead>
                  <tbody id="listado_areas${codigo}">
                
                  </tbody>
                </table>
            </div>
          </div>


        `;
//listado_areas       listado_cargos       eliminar_areas       eliminar_cargos
//editar_areas($idareas,$nombre, $descripcion, $fecha,$sucursal)
//editar_cargos($idcargos,$cargo, $salario, $descripcion, $fecha,$sucursal)
  app.innerHTML = view;

 
 
  listado_areas();
document.getElementById(`fecha${codigo}`).value = fuG.fechaBolivia();
  
  const table = document.getElementById(`editableTable${codigo}`);
  table.addEventListener("dblclick",(e) => edit_Celda_table(e));
  const forme = document.querySelector(`#formulario${codigo}`);
  forme.addEventListener("submit",async  (e) => {
    e.preventDefault();
    const formData = new FormData(forme);
    const idsucursal = uk[0].empresa.idsucursal;
    formData.append('sucursal',idsucursal);
    formData.append('ver','registroAreas');

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }//https://yofinanciero.com/vapp/rh/api/registroAreas
    
    fetch(`https://vivasoft.link/vapp/rh/api/`, {
        // Reemplaza esto con la URL de tu servidor
        method: "POST",
        body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
        if(data['estado'] == "exito" ){
            sitio();
            fuG.alertas(data,codigo);
          }
    })
    .catch((error) => {
        console.error("Error al enviar los datos:", error);
    });
    
    
  });
  const toggleButton = document.getElementById(`toggleButton${codigo}`);
  toggleButton.addEventListener("click", (e) =>mostrarFormulario(e, toggleButton, forme));
  const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup", (e) => filtrar_table(e, input));
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


function listado_areas() {
  const table_body = document.getElementById(`listado_areas${codigo}`);
  let view = "",ind = 1;

  Lista_Areas.map((lista) => {
    let a = {
        "idareas": "3",
        "nombre": "Comercial",
        "descripcion": "Administativo comercial",
        "fecha": "2023-12-27"
    }
  
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_areas,${lista.idareas}"
                  class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Editar sección">
                      <i class="bi bi-pencil-square fs-5"></i>
                  </a>
                  <span class="d-block mt-1 small"></span>
              </div>
              `,
      };
      let eliminar = {
        0: ``,
        1: `
            <div class="text-center">
                <a  data-id="eliminar_areas,${lista.idareas}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar sección">
                    <i class="bi bi-trash fs-5"></i>
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
            `,
      };

     
      view += `
              <tr>
                  <td>${ind++}</td>                
                  <td data-type="${lista.idareas},nombre,nombre">${lista.nombre}</td>
                  <td data-type="${lista.idareas},descripcion,descripcion">${lista.descripcion}</td>             
                  <td data-type="${lista.idareas},fecha,fecha">${lista.fecha}</td>


                  <td>
                      <div class="d-flex gap-3">
                          
                          ${actualizar[privilegios[2]]}
                          ${eliminar[privilegios[3]]}
           

                      </div>                           
                  </td>
              </tr>
          `;
  });
  table_body.innerHTML = view;

  const enlaces = document.querySelectorAll(".btn");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menu);
  });
}
function mostrarFormulario(e, toggleButton, myForm) {
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
function filtrar_por_rubros() {
  // const selectItems = document.querySelector(`#rubro_idrubro${codigo}`);
  // const selectedValue = selectItems.value;
  const selectrubro = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );
  const selectedOpcText = selectrubro.options[selectrubro.selectedIndex].text;

  let selectedColumnIndex = 3;
  const tabla = document.querySelector(
    `#editable_table${codigos.codigoPrincipal}`
  );
  const filas = tabla.getElementsByTagName("tr");

  for (let i = 1; i < filas.length; i++) {
    const celdas = filas[i].getElementsByTagName("td");

    if (celdas[selectedColumnIndex]) {
      const valorCelda =
        celdas[selectedColumnIndex].textContent ||
        celdas[selectedColumnIndex].innerText;

      if (valorCelda.trim() !== selectedOpcText.trim()) {
        filas[i].style.display = "none";
      } else {
        filas[i].style.display = "";
      }
    } else {
      filas[i].style.display = "none";
    }
  }
}



