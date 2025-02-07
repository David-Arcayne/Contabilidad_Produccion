import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "./constantes.js";
import { Editar_table_fila } from "../../funciones/editar_fila_table.js";
import { Editar_tabla_celda } from "../../funciones/dbc_editar_celda_table.js";
import { editarCelda } from "../../funciones/celda_editar.js";
import { Editar_fila } from "../../funciones/editar_fila.js";
import { URL_APIP } from "../../../../../lib/services.js";
import * as fuG from "../../funciones/generales.js";
import * as registrarFuntions from "../../funciones/registrar.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let app = "";
let code_;
let permisos_;
let refrescar_;
let Lista_empleados = [];
let Lista_seccion = [];
let Lista_rubro = [];

let Lista_tareas_Limpieza = [];

let Lista_unidad_tiempo = [
  {
      "idcontrol_unidad_tiempo": 1,
      "unidad": "Dias",
     
  },
  {
      "idcontrol_unidad_tiempo": 2,
      "unidad": "Semanas",
      
  },
  {
      "idcontrol_unidad_tiempo": 3,
      "unidad": "Mes",
     
  },
  {
      "idcontrol_unidad_tiempo": 4,
      "unidad": "Años",
      
  }
];
const codigo = codigos.codigoTareas;
let privilegios;

export async function tareas_limpieza(code, permisos, refrescar) {
  code_ = code;
  permisos_ = permisos;
  refrescar_ = refrescar;
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

  app = document.querySelector(`#content-area${codigos.codigoprincipal}`);
  

  sitio();
}

async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_Empleados(idEmpresa),
      listarFunctions.listar_rubro(idEmpresa),
      listarFunctions.listarseccion(idEmpresa),
      listarFunctions.listar_api_general_verd('listar_tarea_limpieza',idEmpresa),
      listarFunctions.listar_api_general('listarseccion',idEmpresa),
      listarFunctions.listar_api_general_verd('listaUnidadTiempoControl',idEmpresa),
    ]);

    // Asignamos los resultados a las variables correspondientes
    Lista_empleados = resultados[0];
    Lista_rubro = resultados[1];
    Lista_seccion = resultados[2];
    Lista_tareas_Limpieza = resultados[3];
    
    console.log(Lista_empleados,Lista_rubro,Lista_seccion,Lista_unidad_tiempo);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "editar_tarea_limpieza":
      toggleEditSave(event);
      break;
    case "eliminar_tarea_limpieza":
      eliminar_tarea_limpieza(id1);//
      break;
    case "estandar_etapas_produccion":
      modal_estandar_etapas_produccion(id1);
        break;
    default:
      sitio();
      break;
  }
}


async function eliminar_tarea_limpieza(idtarea_limpieza ){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general_verd('eliminar_tarea_limpieza',idtarea_limpieza);
      
      fuG.alertas(data,codigo);
      if(data[0] == "success" ){
        sitio();
      }
  }
}
async function toggleEditSave(event) {
  const permisos = [1, 2, 3, 4, 5,6];
  const opciones_select = [6,4];
  const opciones_number = [3, 5];
  const names = [
    "limpieza",
    "descripcion",
    "frecuencia",
    "idcontrol_unidad_tiempo",
    "costo",
    "seccion_idseccion",];
  const names2 = [
    "limpieza",
    "descripcion",
    "frecuencia",
    "idcontrol_unidad_tiempo",
    "costo",
    "seccion_idseccion",
  ];
  const id = "idtarea_limpieza";

  const resultado = await Editar_fila(event,codigo,Lista_tareas_Limpieza,permisos,names,names2,opciones_select,opciones_number,id);

  if (!resultado) {
    console.warn("No changes to save or operation cancelled.");
   
  }

  const formData = new FormData();
  formData.append("verDavid", "editar_tarea_limpieza");
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
   
    if(data[0] == "danger" || data[0] == "Error" ){
      sitio();
      fuG.alertas(data,codigo);
    }
  } catch (error) {
    console.error("Error submitting data to the server:", error);
  }
}


async function edit_Celda_table(event) {
  const elementos_select = ["seccion_idseccion","idcontrol_unidad_tiempo"]; // Columnas que usan elementos <select>
  const elementos_number = ['frecuencia', 'costo']; // Columnas que usan campos numéricos
  

  const resultado = await editarCelda(event, Lista_tareas_Limpieza, codigo, elementos_select, elementos_number, 'idtarea_limpieza');
 
  console.log(resultado); 
  const formData = new FormData();
  formData.append('verDavid', "editar_tarea_limpieza");
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
               
              <h5 class="text-center mb-4 fw-bold fs-6" >Tareas Limpieza</h5>
              <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">
                <input type="hidden" name="verDavid" value="registrar_tarea_limpieza">

                <div class="row g-3">
          
                  <div class="col-md-4">
                    <label for="limpieza" class="form-label">Nombre de la Limpieza</label>
                        <input type="text" class="form-control" id="limpieza" name="limpieza" placeholder="Ingrese el nombre de la limpieza" required>
                  </div>

                  <div class="col-md-4">
                    <label for="frecuencia" class="form-label">Frecuencia</label>
                    <input type="number" step="0.01" class="form-control" id="frecuencia" name="frecuencia" placeholder="Frecuencia">
                  </div>
                   <div class="col-md-4">
                      <label for="idcontrol_unidad_tiempo" class="form-label">Tiempo:</label>
                      <select class="form-select" id="idcontrol_unidad_tiempo${codigo}" name="idcontrol_unidad_tiempo" required>
                        <option value="" disabled selected>Seleccione la sección</option>
                        
                      </select>
                  </div>
       
                  <div class="col-md-12">
                    <label for="descripcion" class="form-label">Descripción</label>
                    <textarea class="form-control" id="descripcion" name="descripcion" rows="4" placeholder="Descripción detallada de la tarea"></textarea>
                  </div>
          
                  <div class="col-md-6">
                    <label for="costo" class="form-label">Costo</label>
                    <input type="number" step="0.01" class="form-control" id="costo" name="costo" placeholder="Costo estimado">
                  </div>
                  <!-- ID Máquina -->
                  <div class="col-md-6">
                      <label for="seccion_idseccion" class="form-label">Sección</label>
                      <select class="form-select" id="seccion_idseccion${codigo}" name="seccion_idseccion" required>
                        <option value="" disabled selected>Seleccione la sección</option>
                        <option value="101">Sección A</option>
                        <option value="102">Sección B</option>
                        <option value="103">Sección C</option>
                      </select>
                  </div>
                </div>
       
                <div class="d-flex justify-content-end mt-4">
                    <button type="submit" class="btn btn-outline-success me-2" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                    <button type="reset" class="btn btn-outline-primary" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>
                </div>
              </form>
            
            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>
            <div id="alerta${codigo}" class="mt-4"></div>
            <div >
                <div class="d-flex flex-wrap mb-3">
                  
                  <span class="me-3"><strong>Eje.:</strong></span>
                  <span class="me-3"><strong>Tarea:</strong>Nombre tarea/ Barrer</span>
                  <span class="me-3"><strong>Descripción:</strong> Barrer el pasillo principal</span>
                  <span class="me-3"><strong>Frecuencia:</strong> Cada 2</span>
                  <span class="me-3"><strong>Tiempo:</strong> Dias</span>
                  
                  
                </div>
                <table class="table table-striped table-hover" id = "editableTable${codigo}">
                  <thead class="table-dark">
                    <tr>
                      <th scope="col">N°</th>
                      <th scope="col">Tarea</th>
                      <th scope="col">Descripción</th>
                      <th scope="col">Frecuencia</th>
                      <th scope="col">Tiempo</th>
                      <th scope="col">Costo</th>
                      <th scope="col">Seccion</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="listar_tarea_limpieza${codigo}">
                
                  </tbody>
                </table>
            </div>
          </div>


        `;

  app.innerHTML = view;

  listar_seccion();
  listar_unidad_time();
  listar_tarea_limpieza();
  const table = document.getElementById(`editableTable${codigo}`);
  table.addEventListener("dblclick",(e) => edit_Celda_table(e));
  const forme = document.querySelector(`#formulario${codigo}`);
  forme.addEventListener("submit",async  (e) => {
    e.preventDefault();
    const formData = new FormData(forme);
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const data = await registrarFuntions.sendformData2(formData);
    fuG.alertas(data,codigo);
    if(data[0] == "success" ){
      sitio();
    }
  });
  const toggleButton = document.getElementById(`toggleButton${codigo}`);
  toggleButton.addEventListener("click", (e) =>mostrarFormulario(e, toggleButton, forme));

}



function listar_seccion(){
  const listar=document.querySelector(`#seccion_idseccion${codigo}`);
  let view="";
  Lista_seccion.map(lista=>{
      
          view+=`
              <option value="${lista.id}">${lista.nombre_seccion}</option>
          `;
      
      
  })
  listar.innerHTML=view;

}
function listar_unidad_time(){
  const unidad_tiempo=document.querySelector(`#idcontrol_unidad_tiempo${codigo}`);
  let view="";
  Lista_unidad_tiempo.map(lista=>{
      
          view+=`
              <option value="${lista.idcontrol_unidad_tiempo}">${lista.unidad}</option>
          `;
      
      
  })
  unidad_tiempo.innerHTML=view;
}
function listar_tarea_limpieza() {
  const table_body = document.getElementById(`listar_tarea_limpieza${codigo}`);
  let view = "",ind = 1;

  Lista_tareas_Limpieza.map((lista) => {

    let seccion =  Lista_seccion.find(obj => Number(obj.id) === Number(lista.seccion_idseccion));
    let tiempo = Lista_unidad_tiempo.find(obj => Number(obj.idcontrol_unidad_tiempo) === Number(lista.idcontrol_unidad_tiempo));
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_tarea_limpieza,${lista.idtarea_limpieza}"
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
                <a  data-id="eliminar_tarea_limpieza,${lista.idtarea_limpieza}"
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
                  <td data-type="${lista.idtarea_limpieza},limpieza,limpieza">${lista.limpieza}</td>
                  <td data-type="${lista.idtarea_limpieza},descripcion,descripcion">${lista.descripcion}</td>             
                  <td data-type="${lista.idtarea_limpieza},frecuencia,frecuencia">${lista.frecuencia}</td>
                  <td data-type="${lista.idtarea_limpieza},idcontrol_unidad_tiempo,idcontrol_unidad_tiempo">${tiempo.unidad}</td>
                  <td data-type="${lista.idtarea_limpieza},costo,costo">${lista.costo}</td>
                  <td data-type="${lista.idtarea_limpieza},seccion_idseccion,seccion_idseccion">${seccion.nombre_seccion}</td>

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



