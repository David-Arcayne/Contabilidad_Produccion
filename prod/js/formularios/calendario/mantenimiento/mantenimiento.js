import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "./constantes.js";
import { Editar_table_fila } from "../../funciones/editar_fila_table.js";
import { Editar_tabla_celda } from "../../funciones/dbc_editar_celda_table.js";
import { editarCelda } from "../../funciones/celda_editar.js";
import { Editar_fila_ } from "../../funciones/editar_fila_.js";
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

let Lista_tareas = [];
let Lista_mantenimiento = [];
const codigo = codigos.codigoTareas;
let privilegios;

export async function registrar_mantenimiento(code, permisos, refrescar) {
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
    const idsucursal = uk[0].empresa.idsucursal;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_Empleados(idEmpresa),
      listarFunctions.listar_rubro(idEmpresa),
      listarFunctions.listarseccion(idEmpresa),
      listarFunctions.listar_api_general_verd('listar_tareas_mantenimiento',idEmpresa),
      listarFunctions.listar_api_general('listarseccion',idEmpresa),
      listarFunctions.listar_api_general('get_trabajador_sucursal',idsucursal),
      listarFunctions.listar_api_general_verd('listar_mantenimiento',idEmpresa),

    ]);

    // Asignamos los resultados a las variables correspondientes
    Lista_empleados = resultados[5];
    Lista_rubro = resultados[1];
    Lista_seccion = resultados[2];
    Lista_tareas = resultados[3];
    Lista_mantenimiento = resultados[6];
    
    console.log(Lista_mantenimiento, Lista_tareas);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "editar_limpieza":
      toggleEditSave(event);
      break;
    case "eliminar_limpieza":
      eliminar_limpieza(id1);//
      break;
    case "estandar_etapas_produccion":
      modal_estandar_etapas_produccion(id1);
        break;
    default:
      sitio();
      break;
  }
}

async function eliminar_limpieza(idlimpieza){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general_verd('eliminar_mantenimiento',idlimpieza);
      
      fuG.alertas(data,codigo);
      if(data[0] == "success" ){
        Lista_mantenimiento = await listarFunctions.listar_api_general_verd('listar_mantenimiento',uk[0].empresa.idempresa);
        listar_mantenimiento();
      }
  }
}

async function toggleEditSave(event) {

  const columnas = [
    {
      index: 3,
      editable: true,
      type: 'date',
      field: 'fecha_inicio',
      validations: { required: true }
    },
    {
      index: 4,
      editable: true,
      type: 'time',
      field: 'hora_inicio',
      validations: { required: true }
    },
    {
      index: 5,
      editable: true,
      type: 'number',
      field: 'horas',
      validations: { required: true }

    },
    {
      index: 6,
      editable: true,
      type: 'text',
      field: 'observaciones',
      validations: { required: true }
    }
  ];
  const resultado = await Editar_fila_(event, codigo, Lista_mantenimiento, columnas, 'idmantenimiento');


  if (!resultado) {
    console.warn("No changes to save or operation cancelled.");
   
  }

  const formData = new FormData();
  formData.append("verDavid", "editar_mantenimiento");
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
    
    if(data[0] == "success" || data[0] == "ok" ){
      sitio();
      fuG.alertas(data,codigo);
    }
  } catch (error) {
    console.error("Error submitting data to the server:", error);
  }
}


function initializeDropdownSearch(codigo, Lista_Material, valor, condicion, entidad) {
  const searchInput = document.getElementById(`searchInput${codigo}`);
  const dropdownList = document.getElementById(`dropdownList${codigo}`);

  // Crear la lista inicial
  function populateDropdown(filteredItems) {
      dropdownList.innerHTML = ''; // Limpia la lista
      filteredItems.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item[valor];
          li.style.padding = "5px 10px";
          li.style.cursor = "pointer";
          li.style.borderBottom = "1px solid #ddd"; // Línea de separación
          li.style.borderRadius = '8px';
          li.style.transition = "background-color 0.3s"; // Efecto suave al cambiar el color

          // Efecto hover
          li.addEventListener("mouseenter", () => {
              li.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
              li.style.color = "white";
          });

          li.addEventListener("mouseleave", () => {
              li.style.backgroundColor = "";
              li.style.color = "";
          });

          // Seleccionar el item
          li.addEventListener('click', () => {
              
              searchInput.value = item[valor];
              
              
              dropdownList.style.display = 'none'; // Oculta la lista
              item['entidad']=entidad;
              parametros_extras(item);
          });

          dropdownList.appendChild(li);
      });
  }

  // Filtrar la lista según el texto ingresado
  function filterItems(searchText) {
      
          const filtered = Lista_Material.filter(item =>
              item[valor].toLowerCase().includes(searchText.toLowerCase())
          );
          populateDropdown(filtered);
      
  }

  // Mostrar y manejar eventos del input
  searchInput.addEventListener('focus', () => {
      dropdownList.style.display = 'block';
     
          
          populateDropdown(Lista_Material); // Muestra todos los elementos inicialmente
      
     
  });

  searchInput.addEventListener('input', (e) => {
      const searchText = e.target.value;
      filterItems(searchText); // Filtra la lista
  });

  // Ocultar el dropdown si se hace clic fuera
  document.addEventListener('click', (e) => {
      if (!e.target.closest(`#searchInput${codigo}`) && !e.target.closest(`#dropdownList${codigo}`)) {
          dropdownList.style.display = 'none';
      }
  });
}

function initializeDropdownSearch_m(codigo, Lista_Material,clave, valor,apellido, condicion,entidad) {
  const searchInput = document.getElementById(`searchInput${codigo}`);
  const dropdownList = document.getElementById(`dropdownList${codigo}`);

  // Crear la lista inicial
  function populateDropdown(filteredItems) {
      dropdownList.innerHTML = ''; // Limpia la lista
      filteredItems.forEach(item => {
          const li = document.createElement('li');
          li.textContent =item [clave] + " "+item[valor] + " " + item[apellido];
          li.style.padding = "5px 10px";
          li.style.cursor = "pointer";
          li.style.borderBottom = "1px solid #ddd"; // Línea de separación
          li.style.borderRadius = '8px';
          li.style.transition = "background-color 0.3s"; // Efecto suave al cambiar el color

          // Efecto hover
          li.addEventListener("mouseenter", () => {
              li.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
              li.style.color = "white";
          });

          li.addEventListener("mouseleave", () => {
              li.style.backgroundColor = "";
              li.style.color = "";
          });

          // Seleccionar el item
          li.addEventListener('click', () => {
              
              searchInput.value = item [clave] +" "+ item[valor] + " " + item[apellido];
              
              
              dropdownList.style.display = 'none'; // Oculta la lista
              item['entidad']=entidad;
              parametros_extras(item);
          });

          dropdownList.appendChild(li);
      });
  }

  // Filtrar la lista según el texto ingresado
  function filterItems(searchText) {
      if(condicion){
       
          const filtered = Lista_Material.filter(item =>
              item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
              item[clave].toLowerCase().includes(searchText.toLowerCase()) ||
              item[apellido].toLowerCase().includes(searchText.toLowerCase())
          );
          
          populateDropdown(filtered);
      }else{
          const filtered = Lista_Material.filter(item =>
              item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
              item[clave].toLowerCase().includes(searchText.toLowerCase()) ||
              item[apellido].toLowerCase().includes(searchText.toLowerCase())
          );
          populateDropdown(filtered);
      }
      
  }

  // Mostrar y manejar eventos del input
  searchInput.addEventListener('focus', () => {
      dropdownList.style.display = 'block';
      if(condicion){
          
          populateDropdown(Lista_Material); // Muestra todos los elementos inicialmente
      }else{
          
          populateDropdown(Lista_Material); // Muestra todos los elementos inicialmente
      }
     
  });

  searchInput.addEventListener('input', (e) => {
      const searchText = e.target.value;
      filterItems(searchText); // Filtra la lista
  });

  // Ocultar el dropdown si se hace clic fuera
  document.addEventListener('click', (e) => {
      if (!e.target.closest(`#searchInput${codigo}`) && !e.target.closest(`#dropdownList${codigo}`)) {
          dropdownList.style.display = 'none';
      }
  });
}

function parametros_extras(item){
console.log(item);
if(item['entidad'] === 'tarea'){
    document.getElementById(`tareas_mantenimiento_idtareas_mantenimiento${codigos.codigoTareas}`).value = item.idtareas_mantenimiento;
    
    
    

}else if (item['entidad'] === 'trabajador'){
    document.getElementById(`empleado_idempleado${codigos.codigotrabajador}`).value = item.idtrabajador;
}
           
}





async function sitio() {
  await listar();
  let view = "",ind = 1;
  view += `
        <div class="container mt-5">
            <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">
                <input type="hidden" name="verDavid" value="registrar_mantenimiento">

                <div class="row g-3">
          
                  <div class="col-md-6">
                        <div style="position: relative;" class="col-md-12">
                            <input type="hidden" name="tareas_mantenimiento_idtareas_mantenimiento" id="tareas_mantenimiento_idtareas_mantenimiento${codigos.codigoTareas}" required>

                            <label for="Proveedor" class="form-label">Tarea:</label>
                            <input type="text" id="searchInput${codigos.codigoTareas}" placeholder="Buscar..." class="form-control" name="Proveedor" required>
                            <ul id="dropdownList${codigos.codigoTareas}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                        </div>
                        
                  </div>

                  <div class="col-md-6">
                        <div style="position: relative;" class="col-md-12">
                            <input type="hidden" name="empleado_idempleado" id="empleado_idempleado${codigos.codigotrabajador}" required>

                            <label for="trabajador" class="form-label">Trabajador:</label>
                            <input type="text" id="searchInput${codigos.codigotrabajador}" placeholder="Buscar..." class="form-control" name="trabajador" required>
                            <ul id="dropdownList${codigos.codigotrabajador}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                        </div>
                  </div>
                  <div class="col-md-4">
                        <label for="fecha_inicio">Fecha de Inicio:</label>
                        <input type="date" class="form-control" id="fecha_inicio${codigo}" name="fecha_inicio">
                  </div>
                  <div class="col-md-4">
                            <label for="hora_inicio">Hora de Inicio:</label>
                            <input type="time"  class="form-control" id="hora_inicio" name="hora_inicio" >
                  </div>
                  <div class="col-md-4">
                            <label for="horas">Total Horas:</label>
                            <input type="number" step="0.01" class="form-control" id="horas" name="horas" placeholder="Ingrese la cantidad de horas">
                  </div>
       
                  <div class="col-md-12">
                        <label for="observaciones">Observaciones</label>
                        <textarea class="form-control" id="observaciones" name="observaciones" rows="4" placeholder="Ingrese observaciones"></textarea>
                  </div>
          
                  
                </div>
               
                 <div class="d-flex justify-content-end mt-4">
                    <button type="submit" class="btn btn-outline-success me-2" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                    <button type="reset" class="btn btn-outline-primary" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>
                </div>
            </form>

            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>
            <div id="alerta${codigo}" class="mt-4"></div>
              <div>
                  
                  <table class="table table-striped table-hover" id = "editableTable${codigo}">
                    <thead class="table-dark">
                      <tr>
                        <th scope="col">N°</th>
                        <th scope="col">Tarea</th>
                        <th scope="col">Trabajador</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Hora</th>
                        <th scope="col">Hrs</th>
                        <th scope="col">Observaciones</th>
                        <th scope="col">Funciones</th>
                      </tr>
                    </thead>
                    <tbody id="listar_mantenimiento${codigo}">
                  
                    </tbody>
                  </table>
              </div>
        </div>
        `;

  app.innerHTML = view;

  listar_mantenimiento();
  initializeDropdownSearch(codigos.codigoTareas, Lista_tareas,'mantenimiento',true,'tarea');
  initializeDropdownSearch_m(codigos.codigotrabajador, Lista_empleados,'ci','nombre','apellido',true,'trabajador');

  document.getElementById(`fecha_inicio${codigo}`).value = fuG.fechaBolivia();
  const toggleButton = document.getElementById(`toggleButton${codigo}`);
  toggleButton.addEventListener("click", (e) =>mostrarFormulario(e, toggleButton, forme));
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
      Lista_mantenimiento = await listarFunctions.listar_api_general_verd('listar_mantenimiento',uk[0].empresa.idempresa);
      listar_mantenimiento();
      mostrarFormulario(e, toggleButton, forme);
    }
  });
 
}

function listar_mantenimiento(){
  const table_body = document.getElementById(`listar_mantenimiento${codigo}`);
  let view = "",ind = 1;
  Lista_mantenimiento.map((lista) => {

    let tarea =  Lista_tareas.find(obj => Number(obj.idtareas_mantenimiento) === Number(lista.tareas_mantenimiento_idtareas_mantenimiento));
    let empleado = Lista_empleados.find(obj => Number(obj.idtrabajador) === Number(lista.empleado_idempleado));
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_limpieza,${lista.idmantenimiento}"
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
                <a  data-id="eliminar_limpieza,${lista.idmantenimiento}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar">
                    <i class="bi bi-trash fs-5"></i>
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
            `,
      };

   
      view += `
              <tr>
                  <td>${ind++}</td>                
                  <td data-type="${lista.idmantenimiento},tareas_mantenimiento_idtareas_mantenimiento,tareas_mantenimiento_idtareas_mantenimiento">${tarea.mantenimiento}</td>
                  <td data-type="${lista.idmantenimiento},empleado_idempleado,empleado_idempleado">${empleado.nombre} ${empleado.apellido}</td>
                  <td data-type="${lista.idmantenimiento},fecha_inicio,fecha_inicio">${lista.fecha_inicio}</td>
                  <td data-type="${lista.idmantenimiento},hora_inicio,hora_inicio">${lista.hora_inicio}</td>
                  <td data-type="${lista.idmantenimiento},horas,horas">${lista.horas}</td>
                  <td data-type="${lista.idmantenimiento},observaciones,observaciones">${lista.observaciones}</td>
                  

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

