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
let Lista_tipoContrato = [
    {
      "idtipocontrato": 1,
      "nombre": "Contrato Permanente",
      "observacion": "Este tipo de contrato es a largo plazo y asegura estabilidad laboral.",
      "fecha": "2025-01-01",
    },
    {
      "idtipocontrato": 2,
      "nombre": "Contrato Temporal",
      "observacion": "Se utiliza para proyectos específicos o de corta duración.",
      "fecha": "2025-02-15",
    },
    {
      "idtipocontrato": 3,
      "nombre": "Contrato por Obra",
      "observacion": "Contrato que finaliza una vez se termina la obra acordada.",
      "fecha": "2025-03-10",
    },
    {
      "idtipocontrato": 4,
      "nombre": "Contrato Freelance",
      "observacion": "Diseñado para trabajos autónomos sin vínculo laboral formal.",
      "fecha": "2025-04-05",
    },
    {
      "idtipocontrato": 5,
      "nombre": "Contrato de Prácticas",
      "observacion": "Orientado a estudiantes o recién graduados para obtener experiencia laboral.",
      "fecha": "2025-05-20",
    }
  ];

  
let Lista_unidad_tiempo = [];
const codigo = codigos.codigoTipoContrato;
let privilegios;

export async function tipoContrato_rh_config(code, permisos, refrescar) {
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
      
      listarFunctions.listar_api_general_verd('listar_tipocontrato',idEmpresa),
      
    ]);

    // Asignamos los resultados a las variables correspondientes
    
    Lista_tipoContrato = resultados[0];
    
    console.log(Lista_tipoContrato);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "editar_tipocontrato":
      toggleEditSave(event);
      break;
    case "eliminar_tipocontrato":
      eliminar_tipocontrato(id1);//
      break;
    
    default:
      sitio();
      break;
  }
}


async function eliminar_tipocontrato(idtipocontrato ){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general_verd('eliminar_tipocontrato',idtipocontrato);
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
                field: 'observacion',
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
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_tipoContrato, columnas, 'idtipocontrato');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
    
      const formData = new FormData();
      formData.append("verDavid", "editar_tipocontrato");
      formData.append("idempresa", uk[0].empresa.idempresa);

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
  formData.append('verDavid', "editar_tipocontrato");
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
               
              <h5 class="text-center mb-4 fw-bold fs-6" >Tipo Contrato</h5>
              <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">

              
                
                <!-- Nombre -->
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" placeholder="Ingrese el nombre del contrato" required>
                </div>
                
                <!-- Observación -->
                <div class="mb-3">
                    <label for="observacion" class="form-label">Observación</label>
                    <textarea class="form-control" id="observacion" name="observacion" rows="3" placeholder="Ingrese una observación" required></textarea>
                </div>
                
                <!-- Fecha -->
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
                        <th scope="col">Observación</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Funciones</th>
                    </tr>
                  </thead>
                  <tbody id="listar_tipocontrato${codigo}">
                
                  </tbody>
                </table>
            </div>
          </div>


        `;
//listar_tipocontrato       
//editar_tipocontrato
//eliminar_tipocontrato 
//registro_tipocontrato
    app.innerHTML = view;

    
    
    listar_tipocontrato();
    document.getElementById(`fecha${codigo}`).value = fuG.fechaBolivia();
    
    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e));
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit",async  (e) => {
        e.preventDefault();
        const formData = new FormData(forme);
        const idempresa = uk[0].empresa.idempresa;
        formData.append('idempresa',idempresa);
        formData.append('verDavid','registrar_tipocontrato');

                
        
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        
        const data = await registrarFuntions.sendformData2(formData);
            if(data[0] == "success" || data[0] == 'ok' ){
                sitio();
                fuG.alertas(data,codigo);
            }
        
        
        
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


function listar_tipocontrato() {
  const table_body = document.getElementById(`listar_tipocontrato${codigo}`);
  let view = "",ind = 1;

  Lista_tipoContrato.map((lista) => {
    let a = {
        "idtipocontrato": 1,
        "nombre": "Contrato Permanente",
        "observacion": "Este tipo de contrato es a largo plazo y asegura estabilidad laboral.",
        "fecha": "2025-01-01",
      }
  
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_tipocontrato,${lista.idtipocontrato}"
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
                <a  data-id="eliminar_tipocontrato,${lista.idtipocontrato}"
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
                  <td data-type="${lista.idtipocontrato},nombre,nombre">${lista.nombre}</td>
                  <td data-type="${lista.idtipocontrato},observacion,observacion">${lista.observacion}</td>             
                  <td data-type="${lista.idtipocontrato},fecha,fecha">${lista.fecha}</td>


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



