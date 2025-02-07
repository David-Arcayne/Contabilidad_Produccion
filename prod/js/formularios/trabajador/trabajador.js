import * as listarFunctions from "../funciones/listar.js";
import { codigos } from "./constantes.js";

import { editarCelda } from "../funciones/celda_editar.js";
import { Editar_fila_ } from "../funciones/editar_fila_.js";
import * as fuG from "../funciones/generales.js";
import { actualizarSelectProduccion_condicion } from "../funciones/listar_select.js";
import * as registrarFuntions from "../funciones/registrar.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let app = "";
let code_;
let permisos_;
let refrescar_;



let Lista_cargos =[];
let Lista_trabajadores = [
        {
        "idtrabajador": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "ci": "12345678",
        "telefono": "555123456",
        "email": "juan.perez@example.com",
        "fnacimiento": "1985-06-15",
        "direccion": "Av. Siempre Viva 123",
        "estado": "Activo",
        "foto": "juan_perez.jpg",
        "nacionalidad": "Boliviana",
        "profesion": "Ingeniero",
        "estadot": "Soltero",
        "fecha": "2025-01-08",
        "cargos_idcargos": 3
        },
        {
        "idtrabajador": 2,
        "nombre": "María",
        "apellido": "González",
        "ci": "87654321",
        "telefono": "555654321",
        "email": "maria.gonzalez@example.com",
        "fnacimiento": "1990-03-22",
        "direccion": "Calle Falsa 456",
        "estado": "Activo",
        "foto": "maria_gonzalez.jpg",
        "nacionalidad": "Argentina",
        "profesion": "Contadora",
        "estadot": "Casada",
        "fecha": "2025-01-08",
        "cargos_idcargos": 23
        },
        {
        "idtrabajador": 3,
        "nombre": "Luis",
        "apellido": "Ramírez",
        "ci": "23456789",
        "telefono": "555789123",
        "email": "luis.ramirez@example.com",
        "fnacimiento": "1980-11-12",
        "direccion": "Plaza Principal 789",
        "estado": "Inactivo",
        "foto": "luis_ramirez.jpg",
        "nacionalidad": "Peruana",
        "profesion": "Abogado",
        "estadot": "Divorciado",
        "fecha": "2025-01-08",
        "cargos_idcargos": 39
        }
    ];
const codigo = codigos.codigoAreas;
let privilegios;

export async function Trabajador_rh_config(code, permisos, refrescar) {
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
      
      listarFunctions.listar_api_general('listado_cargos',idsucursal),
      listarFunctions.listar_api_general('get_trabajador_recursos_humanos',idsucursal),
    ]);

    // Asignamos los resultados a las variables correspondientes
    
    Lista_cargos = resultados[0];
    Lista_trabajadores = resultados[1];
    console.log(Lista_cargos,Lista_trabajadores);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "editar_trabajador":
      toggleEditSave(event);
      break;
    case "eliminar_trabajador":
      eliminar_trabajador(id1);//
      break;
    default:
      sitio();
      break;
  }
}


async function eliminar_trabajador(idtrabajador ){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general_verd('eliminar_trabajador',idtrabajador);
      
      
    if(data[0] == "success" || data[0] == "ok" ){
        sitio();
    }
  }
}
async function toggleEditSave(event){
    // <th scope="col">N°</th>
    // <th scope="col">Ci</th>
    // <th scope="col">Nombre</th>
    // <th scope="col">Apellido</th>
    
    // <th scope="col">Telëfono</th>
    // <th scope="col">F. Nac</th>
    // <th scope="col">Dirección</th>
    // <th scope="col">Nacionalidad</th>
    // <th scope="col">Profeción</th>
    
    // <th scope="col">Funciones</th>
    const columnas = [
            {
                index: 1,
                editable: true,
                type: 'text',
                field: 'ci',
                validations: { required: true }
            },
            {
                index: 2,
                editable: true,
                type: 'text',
                field: 'nombre',
                validations: { required: true }
            },
            {
                index: 3,
                editable: true,
                type: 'text',
                field: 'apellido',
                validations: { required: true }
            },
            {
                index: 4,
                editable: true,
                type: 'text',
                field: 'telefono',
                validations: { required: true }
            },
            {
                index: 5,
                editable: true,
                type: 'date',
                field: 'fnacimiento',
                validations: { required: true }
            },
            {
                index: 6,
                editable: true,
                type: 'text',
                field: 'direccion',
                validations: { required: true }
            },
            {
                index: 7,
                editable: true,
                type: 'text',
                field: 'nacionalidad',
                validations: { required: true }
            },
            {
                index: 8,
                editable: true,
                type: 'text',
                field: 'profesion',
                validations: { required: true }
            },
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_trabajadores, columnas, 'idtrabajador');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
      const formData = new FormData();
      formData.append("verDavid", "editar_trabajador");
      formData.append("sucursal_idsucursal",uk[0].empresa.idsucursal);
      formData.append("fecha",fuG.fechaBolivia());
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
  

  const resultado = await editarCelda(event, Lista_cargos, codigo, elementos_select, elementos_number, 'idtarea_limpieza');
 
  console.log(resultado); 
  const formData = new FormData();
  formData.append('verDavid', "editar_trabajador");
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
function listado_cargos() {
    const select = document.querySelector(`#cargos_idcargos${codigo}`);
  
    let view = "",
      ind = 1;
    Lista_cargos.map((lista) => {

        view += `<option value="${lista.idcargos}">${lista.cargo} </option>`;
      
    });
    select.innerHTML = view;
  }

async function sitio() {
  await listar();
  let view = "",ind = 1;
  view += `
          <div class="container">
              <h5 class="text-center mb-4 fw-bold fs-6" >Trabajador</h5>
              <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="nombre" class="form-label">Nombre:</label>
                        <input type="text" class="form-control" id="nombre" name="nombre" placeholder="Ingrese el nombre">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="apellido" class="form-label">Apellido:</label>
                        <input type="text" class="form-control" id="apellido" name="apellido" placeholder="Ingrese el apellido">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="ci" class="form-label">Cédula de Identidad (CI):</label>
                        <input type="text" class="form-control" id="ci" name="ci" placeholder="Ingrese el CI">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="telefono" class="form-label">Teléfono:</label>
                        <input type="text" class="form-control" id="telefono" name="telefono" placeholder="Ingrese el teléfono">
                    </div>
                   
                    <div class="col-md-6 mb-3">
                        <label for="fnacimiento" class="form-label">Fecha de Nacimiento:</label>
                        <input type="date" class="form-control" id="fnacimiento" name="fnacimiento">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="direccion" class="form-label">Dirección:</label>
                        <input type="text" class="form-control" id="direccion" name="direccion" placeholder="Ingrese la dirección">
                    </div>
                    
                   
                    <div class="col-md-6 mb-3">
                        <label for="nacionalidad" class="form-label">Nacionalidad:</label>
                        <input type="text" class="form-control" id="nacionalidad" name="nacionalidad" placeholder="Ingrese la nacionalidad">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="profesion" class="form-label">Profesión</label>
                        <input type="text" class="form-control" id="profesion" name="profesion" placeholder="Ingrese la profesión">
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label for="fecha" class="form-label">Fecha de Registro:</label>
                        <input type="date" class="form-control" id="fecha${codigo}" name="fecha">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="cargos_idcargos" class="form-label">Cargo:</label>
                        <select class="form-control" id="cargos_idcargos${codigo}" name="cargos_idcargos">
                            <option value="1">Cargo 1</option>
                            <option value="2">Cargo 2</option>
                            <!-- Aquí puedes añadir más cargos dinámicamente -->
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
                        <th scope="col">Ci</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Apellido</th>
                       
                        <th scope="col">Telëfono</th>
                        <th scope="col">F. Nac</th>
                        <th scope="col">Dirección</th>
                        <th scope="col">Nacionalidad</th>
                        <th scope="col">Profeción</th>
                        
                        <th scope="col">Funciones</th>
                      
                    </tr>
                  </thead>
                  <tbody id="listar_trabajador${codigo}">
                
                  </tbody>
                </table>
            </div>
          </div>


        `;
    //listado_areas       listado_cargos       eliminar_trabajador       eliminar_trabajador
    //editar_trabajador($idareas,$nombre, $descripcion, $fecha,$sucursal)
    //editar_trabajador($idcargos,$cargo, $salario, $descripcion, $fecha,$sucursal)
    app.innerHTML = view;
    //listado_areas();
    listado_cargos();
    listar_trabajador();
    document.getElementById(`fecha${codigo}`).value = fuG.fechaBolivia();
  
    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e));
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit",async  (e) => {
        e.preventDefault();
        const formData = new FormData(forme);
    
        formData.append('verDavid','registrar_trabajador');

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


function listar_trabajador() {
  const table_body = document.getElementById(`listar_trabajador${codigo}`);
  let view = "",ind = 1;

  Lista_trabajadores.map((lista) => {
    let aa = {
      "idtrabajador": "93",
      "nombre": "Cynthia Patrona ",
      "apellido": "Ramos Tirado ",
      "ci": "5275320",
      "telefono": "4223544",
      "email": "cynthiapetrona9212@gmail.com",
      "fnacimiento": "1981-09-13",
      "direccion": "Av. Blanco Galindo",
      "nacionalidad": "1",
      "profesion": ""
      
  }
  let b = {
    "idtrabajador": "59",
    "nombre": "Marcel",
    "apellido": "Kohler Aguilera",
    "ci": "5358385 SC",
    "telefono": "78451255",
    "email": "marcel@gmail.com",
    "fnacimiento": "1981-02-05",
    "direccion": "Av. blanco galindo",
    "nacionalidad": "Boliviana",
    "profesion": "Gerente",
    "salario": "25000"
} 
    let a ={
            "***idtrabajador": 1,
            "***nombre": "Juan",
            "***apellido": "Pérez",
            "***ci": "12345678",
            "***telefono": "555123456",
            "***email": "juan.perez@example.com",
            "***fnacimiento": "1985-06-15",
            "***direccion": "Av. Siempre Viva 123",
            "estado": "Activo",
            "***nacionalidad": "Boliviana",
            "***profesion": "Ingeniero",
            "estadot": "Soltero",
            "fecha": "2025-01-08",
            "cargos_idcargos": 1,
            "sexo" : 'M',
            "estadocivil": 'soltero'
        };
        
      
        let cargo = Lista_cargos.find(obj => Number(obj.idcargos) === Number(lista.cargos_idcargos));
  
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_trabajador,${lista.idtrabajador}"
                  class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Editar">
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
                <a  data-id="eliminar_trabajador,${lista.idtrabajador}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar">
                    <i class="bi bi-trash fs-5"></i>
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
            `,
      };
      //<td data-type="${lista.idtrabajador},cargos_idcargos,cargos_idcargos">${cargo.cargo}</td>   
      view += `
              <tr>
                    <td>${ind++}</td>                
                    <td data-type="${lista.idtrabajador},ci,ci">${lista.ci}</td>
                    <td data-type="${lista.idtrabajador},nombre,nombre">${lista.nombre}</td>             
                    <td data-type="${lista.idtrabajador},apellido,apellido">${lista.apellido}</td>             
                             
                    <td data-type="${lista.idtrabajador},telefono,telefono">${lista.telefono}</td>             
                    <td data-type="${lista.idtrabajador},fnacimiento,fnacimiento">${lista.fnacimiento}</td>             
                    <td data-type="${lista.idtrabajador},direccion,direccion">${lista.direccion}</td>             
                    <td data-type="${lista.idtrabajador},nacionalidad,nacionalidad">${lista.nacionalidad}</td>             
                    <td data-type="${lista.idtrabajador},profesion,profesion">${lista.profesion}</td>             
                              
                    
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



