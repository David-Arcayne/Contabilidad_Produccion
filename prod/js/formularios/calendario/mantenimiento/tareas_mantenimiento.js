import * as listarFunctions from "../../funciones/listar.js";
import * as fuG from "../../funciones/generales.js";
import { codigos } from "./constantes.js";
import { editarCelda } from "../../funciones/celda_editar.js";
import { Editar_fila } from "../../funciones/editar_fila.js";
import { URL_APIP } from "../../../../../lib/services.js";
import * as modales from "../../funciones/modales/modal_registrar.js";
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
let Lista_etapas_produccion = [];
let Lista_mantenimientos = [];
let Lista_maquinas = [];
let Lista_unidad_tiempo = [
  {
      "idcontrol_unidad_tiempo": 1,
      "unidad": "dias",
     
  },
  {
      "idcontrol_unidad_tiempo": 2,
      "unidad": "semanas",
      
  },
  {
      "idcontrol_unidad_tiempo": 3,
      "unidad": "mes",
     
  },
  {
      "idcontrol_unidad_tiempo": 4,
      "unidad": "años",
      
  }
];

const codigo = codigos.codigoTareas;
let privilegios;

export async function tareas_mantenimiento(code, permisos, refrescar) {
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
      listarFunctions.listar_etapas_produccion(idEmpresa),
      listarFunctions.listar_api_general_verd('listar_tareas_mantenimiento',idEmpresa),
      listarFunctions.listar_api_general('listar_maquina',idEmpresa),
      listarFunctions.listar_api_general_verd('listaUnidadTiempoControl',idEmpresa),
      
    ]);

    // Asignamos los resultados a las variables correspondientes
    Lista_empleados = resultados[0];
    Lista_rubro = resultados[1];
    Lista_seccion = resultados[2];
    Lista_etapas_produccion = resultados[3];
    Lista_mantenimientos = resultados[4];
    Lista_maquinas = resultados[5];

    console.log(Lista_maquinas);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "editar_tareas_mantenimiento":
      toggleEditSave(event);
      break;
    case "eliminar_tareas_mantenimiento":
      eliminar_tareas_mantenimiento(id1);//
      break;
    case "estandar_etapas_produccion":
      modal_estandar_etapas_produccion(id1);
        break;
    default:
      sitio();
      break;
  }
}


async function eliminar_tareas_mantenimiento(idtareas_mantenimiento ){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general_verd('eliminar_tareas_mantenimiento',idtareas_mantenimiento);
    fuG.alertas(data,codigo)

  }
}
async function toggleEditSave(event) {
  const permisos = [1, 2, 3, 4, 5,6];
  const opciones_select = [6,4];
  const opciones_number = [3, 5];
  const names = [
    "mantenimiento",
    "descripcion",
    "frecuencia",
    "idcontrol_unidad_tiempo",

    "costo",
    "maquina_idmaquina",];
  const names2 = [
    "mantenimiento",
    "descripcion",
    "frecuencia",
    "idcontrol_unidad_tiempo",
    "costo",
    "maquina_idmaquina",
  ];
  const id = "idtareas_mantenimiento";

  const resultado = await Editar_fila(event,codigo,Lista_mantenimientos,permisos,names,names2,opciones_select,opciones_number,id);

  if (!resultado) {
    console.warn("No changes to save or operation cancelled.");
   
  }

  const formData = new FormData();
  formData.append("verDavid", "editar_tareas_mantenimiento");
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
  const elementos_select = ["maquina_idmaquina","idcontrol_unidad_tiempo"]; // Columnas que usan elementos <select>
  const elementos_number = ['frecuencia', 'costo']; // Columnas que usan campos numéricos
 

  let obj_elemento = {}; // Inicialización del objeto resultante

 // Ejemplo de uso

  const resultado = await editarCelda(event, Lista_mantenimientos, codigo, elementos_select, elementos_number, 'idtareas_mantenimiento');
 
  console.log(resultado); 
  const formData = new FormData();
  formData.append('verDavid', "editar_tareas_mantenimiento");
  Object.entries(resultado).forEach(([key, value]) => {
      formData.append(key, value);
  });
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const data = await registrarFuntions.sendformData2(formData);
    console.log("Server response:", data);
   fuG.alertas(data,codigo)
  } catch (error) {
    console.error("Error submitting data to the server:", error);
  }

}






async function sitio() {
  await listar();
  let view = "",ind = 1;
  view += `
            <div class="container mt-5">
               <h5 class="text-center mb-4 fw-bold fs-6" >Formulario de Tareas de Mantenimiento</h5>
              <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">
                              <input type="hidden" name="verDavid" value="registrar_tareas_mantenimiento">

                <div class="row g-3">
                  
                  <div class="col-md-4">
                    <label for="mantenimiento" class="form-label">Mantenimiento</label>
                    <input type="text" class="form-control" id="mantenimiento" name="mantenimiento" placeholder="Nombre del mantenimiento">
                  </div>
                  <!-- Frecuencia -->
                  <div class="col-md-4">
                    <label for="frecuencia" class="form-label">Frecuencia</label>
                    <input type="number" step="0.01" class="form-control" id="frecuencia" name="frecuencia" placeholder="Frecuencia en días">
                  </div>
                  <div class="col-md-4">
                      <label for="idcontrol_unidad_tiempo" class="form-label">Tiempo:</label>
                      <select class="form-select" id="idcontrol_unidad_tiempo${codigo}" name="idcontrol_unidad_tiempo" required>
                        <option value="" disabled selected>Seleccione la sección</option>
                        
                      </select>
                  </div>
                  <!-- Descripción -->
                  <div class="col-md-12">
                    <label for="descripcion" class="form-label">Descripción</label>
                    <textarea class="form-control" id="descripcion" name="descripcion" rows="4" placeholder="Descripción detallada de la tarea"></textarea>
                  </div>
                  <!-- Costo -->
                  <div class="col-md-6">
                    <label for="costo" class="form-label">Costo</label>
                    <input type="number" step="0.01" class="form-control" id="costo" name="costo" placeholder="Costo estimado">
                  </div>
                  <!-- ID Máquina -->
                  <div class="col-md-6">
                    <label for="maquina_idmaquina" class="form-label">Maquina</label>
                            
                    <select class="form-select" id="maquina_idmaquina${codigo}" name="maquina_idmaquina">
                    
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
           
                <table class="table table-striped table-hover" id = "editableTable${codigo}">
                  <thead class="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Mantenimiento</th>
                      <th scope="col">Descripción</th>
                      <th scope="col">Frecuencia</th>1
                      <th scope="col">Tiempo</th>
                      <th scope="col">Costo</th>
                      <th scope="col">Máquina</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="listar_mantenimiento${codigo}">
                
                  </tbody>
                </table>
            </div>



        `;

  app.innerHTML = view;
  listar_maquinas();
  listar_unidad_time();

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

function listar_maquinas(){
  const listar=document.querySelector(`#maquina_idmaquina${codigo}`);
  let view="";
  Lista_maquinas.map(lista=>{
      
          view+=`
              <option value="${lista.id}">${lista.nombre}</option>
          `;
      
      
  })
  listar.innerHTML=view;
  listar_mantenimiento();
}
function listar_mantenimiento() {
  const table_body = document.getElementById(`listar_mantenimiento${codigo}`);
  let view = "",ind = 1;
 console.log(Lista_mantenimientos);
  Lista_mantenimientos.map((lista) => {
    let tiempo = Lista_unidad_tiempo.find(obj => Number(obj.idcontrol_unidad_tiempo) === Number(lista.idcontrol_unidad_tiempo));
    let maquina =  Lista_maquinas.find(obj => Number(obj.id) === Number(lista.maquina_idmaquina));
      let actualizar = {
        0: ``,
        1: `
                       
              <div class="text-center">
                  <a  data-id="editar_tareas_mantenimiento,${lista.idtareas_mantenimiento}"
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
                <a  data-id="eliminar_tareas_mantenimiento,${lista.idtareas_mantenimiento}"
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
                  <td data-type="${lista.idtareas_mantenimiento},mantenimiento,mantenimiento">${lista.mantenimiento}</td>
                  <td data-type="${lista.idtareas_mantenimiento},descripcion,descripcion">${lista.descripcion}</td>             
                  <td data-type="${lista.idtareas_mantenimiento},frecuencia,frecuencia">${lista.frecuencia}</td>
                  <td data-type="${lista.idtareas_mantenimiento},idcontrol_unidad_tiempo,idcontrol_unidad_tiempo">${tiempo.unidad}</td>
                  <td data-type="${lista.idtareas_mantenimiento},costo,costo">${lista.costo}</td>
                  <td data-type="${lista.idtareas_mantenimiento},maquina_idmaquina,maquina_idmaquina">${maquina.nombre}</td>

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


function alertas(data) {
  console.log(data,data[0]);
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "success") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 2000;
    console.log(alertClass,alertMessage,timeoutDuration);
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
  console.log(alertClass,alertMessage,timeoutDuration);
  // Obtener el div de alerta
  let divalert = document.querySelector(`#alerta${codigos.codigoprincipal}`);
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

