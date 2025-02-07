import { URL_APIP } from "../../../../../lib/services.js";
import { codigos } from "../constantes.js";
import * as listarFunctions from "../../funciones/listar.js"
import * as registerFunctions from "../../funciones/registrar.js"
import * as fuG from "../../funciones/generales.js"

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let code_;
let permisos_;
let refrescar_;
let Lista_etapas_produccion = [];
let Lista_empleados = [];
let Lista_etapas_empleado_registrados = [];
let Lista_etapas_empleado =[];
let Lista_rubro = [];

const codigo = codigos.codigo_etapa_empleado;

function manejarClick(event) {
  sitio();
  // Eliminar el evento click después de ejecutarlo
  event.target.removeEventListener("click", manejarClick);
}
export function registro_etapa_empleado(code, permisos, refrescar) {
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);

  sitio();
}

function vaciar_listas() {
   Lista_etapas_produccion = [];
   Lista_empleados = [];
   Lista_etapas_empleado_registrados = [];
   Lista_etapas_empleado =[];
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    const idsucursal = uk[0].empresa.idsucursal;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo Listar_etapa_empleado
      const resultados = await Promise.all([
        listarFunctions.listar_api_general("listar_etapas_produccion", idEmpresa),
        listarFunctions.listar_Empleados(idEmpresa),
        listarFunctions.listar_api_general("Listar_etapa_empleado", idEmpresa),
        listarFunctions.listar_api_general('get_trabajador_sucursal',idsucursal),
        listarFunctions.listar_rubro(idEmpresa),
        

      ]);

      // Asignamos los resultados a las variables correspondientes
      Lista_etapas_produccion = resultados[0];
      Lista_etapas_empleado_registrados = resultados[2];
      Lista_empleados = resultados[3];

      Lista_rubro = resultados[4];

      console.log( Lista_etapas_empleado_registrados);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
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
      if(condicion){
          
          const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`).value;
          const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
          const filtered = filterListaRubro.filter(item =>
              item[valor].toLowerCase().includes(searchText.toLowerCase())
          );
          populateDropdown(filtered);
      }else{
          const filtered = Lista_Material.filter(item =>
              item[valor].toLowerCase().includes(searchText.toLowerCase())
          );
          populateDropdown(filtered);
      }
      
  }

  // Mostrar y manejar eventos del input
  searchInput.addEventListener('focus', () => {
      dropdownList.style.display = 'block';
      if(condicion){
          
          const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`).value;
          const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
          populateDropdown(filterListaRubro); // Muestra todos los elementos inicialmente
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
function initializeDropdownSearch_m(codigo, Lista_Material,clave, valor,apellido, condicion,entidad) {
  const searchInput = document.getElementById(`searchInput${codigo}`);
  const dropdownList = document.getElementById(`dropdownList${codigo}`);

  // Crear la lista inicial
  function populateDropdown(filteredItems) {
      dropdownList.innerHTML = ''; // Limpia la lista
      filteredItems.forEach(item => {
          const li = document.createElement('li');
          li.textContent =item [clave] + " "+item[valor] + " "+ item[apellido];
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
        const filterLista = Lista_Material.filter((obj) => !Lista_empleados.some(list_mp => Number(list_mp.idtrabajador) === Number(obj.empleado_idempleado)) );
          const filtered = filterLista.filter(item =>
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
        const filterLista = Lista_Material.filter((obj) => !Lista_empleados.some(list_mp => Number(list_mp.idtrabajador) === Number(obj.empleado_idempleado)) );
          populateDropdown(filterLista); // Muestra todos los elementos inicialmente
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
  if(item['entidad'] === 'etapa'){
      document.getElementById(`etapas_produccion_idetapas_produccion${codigos.codigo_etapa}`).value = item.idetapas_produccion;
      
      Lista_etapas_empleado = [];
      

      let etapa_empleado_SELECT = Lista_etapas_empleado_registrados.find((obj) =>Number(obj.etapas_produccion_idetapas_produccion) === Number(item.idetapas_produccion));
      console.log('------------------------------------');
      console.log(etapa_empleado_SELECT);

      const resultado = {
        etapas_produccion_idetapas_produccion: etapa_empleado_SELECT.etapas_produccion_idetapas_produccion,
        empleados: etapa_empleado_SELECT.empleados.map((empleado) => ({
          idetapa_producccion_has_empleado: empleado.idetapa_producccion_has_empleado,
          empleado_idempleado: empleado.empleado_idempleado,
          etapas_produccion_idetapas_produccion: etapa_empleado_SELECT.etapas_produccion_idetapas_produccion,
          empresa_idempresa: uk[0].empresa.idempresa,
          fecha_inicio : empleado.fecha_inicio,
          fecha_fin : empleado.fecha_fin,     
        })),
      };

      console.log(resultado);
      let Lista_Elementos = listar_elementos_seleccionados(resultado.empleados);

      Lista_Elementos = Array.isArray(Lista_Elementos) ? Lista_Elementos : [];
      antes_Listar_Elementos(Lista_Elementos, resultado.empleados);
      

  }else if (item['entidad'] === 'empleado'){
      document.getElementById(`empleado_idempleado${codigos.codigo_empleado}`).value = item.idtrabajador;

      
  }
             
}
function listar_rubro() {
  console.log("listo");

  const listar2 = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );
  let view = "";
  Lista_rubro.map((lista) => {
    view += `
                <option value="${lista.id}">${lista.rubro}</option>
            `;
  });
  listar2.innerHTML = view;
}
async function sitio() {
  let view = `
        <div class="container">
            <h5 class="text-center mb-4 fw-bold fs-6" >Etapa Empleado</h5>
            <div class="col-md-3 mb-3 " >
                <div class="row">
                    <label for="rubro_idrubro" class="form-label">Linea de produccion:</label>
                    <select class="form-select" id="rubro_idrubro${codigos.codigoPrincipal}" name="rubro_idrubro">
                        <option value="" disabled selected>Seleccione un rubro</option>
                        
                    </select>
                </div>
            </div>
            <form id="formularioPM${codigo}">
                <input type="hidden" name="ver" value="registrar_etapa_produccion_empleado">
                <input type="hidden" name="empresa" value="${
                  uk[0].empresa.idempresa
                }">
                <div class="row">
                    <div class=" col-md-6 border p-3 m-0 rounded">
                          <div class="row">
                                            
                              <div style="position: relative;" class="col-md-12">
                                  <input type="hidden" name="etapas_produccion_idetapas_produccion" id="etapas_produccion_idetapas_produccion${codigos.codigo_etapa}" required>

                                  <label for="etapa_produccion" class="form-label">Etapa produccion:</label>
                                  <input type="text" id="searchInput${codigos.codigo_etapa}" placeholder="Buscar..." class="form-control" name="etapa_produccion" required>
                                  <ul id="dropdownList${codigos.codigo_etapa}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                              </div>
                              
                          </div>
                          
                    </div>
                    <div class=" col-md-6 border p-3 m-0 rounded">
                          <div class="row">
                                            
                              <div style="position: relative;" class="col-md-4">
                                  <input type="hidden" name="empleado_idempleado" id="empleado_idempleado${codigos.codigo_empleado}" required >

                                  <label for="empleado" class="form-label">Empleado</label>
                                  <input type="text" id="searchInput${codigos.codigo_empleado}" placeholder="Buscar..." class="form-control" name="empleado" required>
                                  <ul id="dropdownList${codigos.codigo_empleado}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                              </div>
                              
                              <div class="col-md-3">
                                  <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="agregar${codigos.codigo_empleado}" aria-label="generar">Agregar</button>
                              </div>
                          </div>
                          
                    </div>
                    
                </div>
            </form>
           <div id="alerta${codigos.codigoPrincipal}" class="mt-4"></div>
            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
            </div>
            <div class="scrollable-table mt-4">
              <table class="table table-hover" id="editableTableProvMat${codigo}">
                  <thead>
                      <tr class="table-dark">
                          <th scope="col">N°</th>
                          <th scope="col">Nombre</th>
                          <th scope="col">Apellido</th>
                          <th scope="col">Fecha Inicio</th>
                          <th scope="col">Fecha Fin</th>
                          <th scope="col">Funciones</th>
                      </tr>
                  </thead>
                  <tbody id="lista_etapas_produccion_empleado${codigo}"></tbody>
              </table>
              <div class="col-md-12 mt-3 d-flex justify-content-between">
                  <button type="button" class="btn btn-primary btn-sm" id="cancelar_${codigo}">Cancelar</button>
                  <button type="button" class="btn btn-success btn-lg" id="registrar_etapa_produccion_empleado${codigo}">Guardar</button>
              </div>
            </div>
        </div>
       
    `;
  await listar();
  app.innerHTML = view;
  listar_rubro();

  initializeDropdownSearch(codigos.codigo_etapa, Lista_etapas_produccion,'nombre_etapa',true,'etapa');
 
  initializeDropdownSearch_m(codigos.codigo_empleado, Lista_empleados,'ci','nombre','apellido',true,'empleado');

  document.getElementById(`agregar${codigos.codigo_empleado}`).addEventListener("click", function () {
    const empleado = document.getElementById(`empleado_idempleado${codigos.codigo_empleado}`);
    if (empleado.value) {
      let Lista_Elementos = listar_elementos_seleccionados([{'empleado_idempleado':empleado.value}]);
      let lista_rgs = [];
      const select_etapa = document.getElementById(`etapas_produccion_idetapas_produccion${codigos.codigo_etapa}`);
      if (!select_etapa.value) {
        alert("selecciones una etapa de producción");
        return;
      }
     
        let aux = {
          idetapa_producccion_has_empleado: 0,
          empleado_idempleado: Number(empleado.value),
          etapas_produccion_idetapas_produccion: Number(select_etapa.value),
          empresa_idempresa: uk[0].empresa.idempresa,
          fecha_inicio: fuG.fechaBolivia(),
          fecha_fin: null,
        };
        lista_rgs.push(aux);
      console.log(Lista_Elementos);
      antes_Listar_Elementos(Lista_Elementos, lista_rgs);
    } else {
      alert("No ha seleccionado");
    }
  });
  
  

  const btnregistrar_api = document.getElementById(
    `registrar_etapa_produccion_empleado${codigo}`
  );
  btnregistrar_api.addEventListener("click", function () {
    const empleados = [];
    const rows = document.querySelectorAll(
      `#lista_etapas_produccion_empleado${codigo} tr`
    );
    const etapa = document.getElementById(`etapas_produccion_idetapas_produccion${codigos.codigo_etapa}`);
    

    rows.forEach((row, index) => {
      const data_id = row.querySelector("td[data-id]");
      const data_idetapa = row.querySelector("td[data-idetapa]");
      const data_idempleado = row.querySelector("td[data-idempleado]");
      const data_idemp = row.querySelector("td[data-idemp]");

      const id = data_id ? data_id.getAttribute("data-id") : null;
      const idetapa = data_idetapa ? data_idetapa.getAttribute("data-idetapa") : null;
      const idempleado = data_idempleado ? data_idempleado.getAttribute("data-idempleado") : null;
      const idemp = data_idemp ? data_idemp.getAttribute("data-idemp") : null;

      const empleado = {
        idetapa_producccion_has_empleado: Number(id),
        empleado_idempleado: Number(idempleado),
        etapas_produccion_idetapas_produccion: Number(etapa.value),
        empresa_idempresa: uk[0].empresa.idempresa,
        fecha_inicio: fuG.fechaBolivia(),
        
      };
      empleados.push(empleado);
    });

    prepararLista_enviar(empleados);
  });



  const btn_cancelar = document.getElementById(`cancelar_${codigo}`);
  btn_cancelar.addEventListener("click", function () {
    sitio();
    vaciar_listas();
  });
}

function prepararLista_enviar(list) {
  let etapa_empleado = {
    verDavid: "registrar_etapa_produccion_empleado",
    empleados: [...list],
  };

  console.log(etapa_empleado);
  if (etapa_empleado.empleados && etapa_empleado.empleados.length > 0) {
    fetch(`${URL_APIP}api/`, {
      method: "POST", // Método HTTP
      headers: {
        "Usar-Registro-David": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(etapa_empleado), // Convertir el objeto JS a JSON antes de enviarlo
    })
      .then((response) => response.json()) // Procesar la respuesta en formato JSON
      .then((data) => {
        console.log(data);
        alertas(data);
      })
      .catch((error) => console.error("Error:", error));
  } else {
    alert("Lista vacia");
  }
}
function antes_Listar_Elementos(listar_elementos_seleccionados, seleccionados) {
  console.log(seleccionados);
  console.log(listar_elementos_seleccionados);
  console.log(Lista_etapas_empleado);
  if (
    Array.isArray(listar_elementos_seleccionados) &&
    listar_elementos_seleccionados.length > 0
  ) {
    listar_elementos_seleccionados.map((lista) => {
      let existe = Lista_etapas_empleado.some(
        (orden) => Number(orden.empleado_idempleado) === Number(lista.idtrabajador)
      );
      if (!existe) {
        let item_seleccionado = seleccionados.find(
          (obj) => Number(obj.empleado_idempleado) === Number(lista.idtrabajador)
        );
        lista["idetapa_producccion_has_empleado"] = item_seleccionado["idetapa_producccion_has_empleado"];
        lista["etapas_produccion_idetapas_produccion"] = item_seleccionado["etapas_produccion_idetapas_produccion"];
        lista["empleado_idempleado"] = item_seleccionado["empleado_idempleado"];
        lista["empresa_idempresa"] = item_seleccionado["empresa_idempresa"];
        lista["fecha_inicio"] = item_seleccionado["fecha_inicio"];
        lista["fecha_fin"] = item_seleccionado["fecha_fin"];

        Lista_etapas_empleado.push(lista);
        
      } else {
        alert("El empleado ya se agrego");
        return;
      }
    });
  }
  lista_etapas_produccion_empleado();
}

function lista_etapas_produccion_empleado() {
  const listar = document.getElementById(`lista_etapas_produccion_empleado${codigo}`);
  let view = "",
    ind = 1;
  console.log(Lista_etapas_empleado);
  Lista_etapas_empleado.map((lista) => {
   

    view += `
    <tr>
       <td>${ind++}</td>             
       <td
       data-id="${lista.idetapa_producccion_has_empleado}" 
       data-idetapa="${lista.etapas_produccion_idetapas_produccion}" 
       data-idempleado="${lista.empleado_idempleado}"
       data-idemp="${lista.empresa_idempresa}"
       >${lista.nombre}</td>
      
       <td >${lista.apellido}</td>
       <td >${fuG.cambiarFormatoFecha(lista.fecha_inicio)}</td>
       <td >${fuG.cambiarFormatoFecha(lista.fecha_fin)}</td>
    
   
       <td>
           <div class="d-flex gap-3">
               
               <div class="text-center">
                   <a 
                   data-id="Anular_empleado,
                   ${lista.id},
                   ${uk[0].empresa.idempresa}"
                   class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn-delete"
                   style="width: 2.5rem; height: 2.5rem;"
                   title="Eliminar empleado">
                       <i class="bi bi-trash fs-5"></i>
                   </a>
               </div>
               <div class="text-center">
                   <a 
                   data-id="dar_baja,
                   ${lista.idetapa_producccion_has_empleado},
                   ${uk[0].empresa.idempresa}"
                   class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn-dar_baja"
                   style="width: 2.5rem; height: 2.5rem;"
                   title="Dar de Baja">
                       <i class="bi bi-badge-cc-fill fs-5"></i>
                   </a>
               </div>
               
               
           </div>
                                      
       </td>
   </tr>
   `;//alert
  });
  listar.innerHTML = view;

  listar.querySelectorAll(".btn-delete").forEach((button) => {
    console.log("===");
    button.addEventListener("click", () => Anular_empleado(button));
  });
  listar.querySelectorAll(".btn-dar_baja").forEach((button) => {
    
    button.addEventListener("click",dar_baja_etapa);
  });

  const input = document.getElementById(`filtro${codigo}`);
  input.addEventListener("keyup", (e) => filtrar_table(e, input));
}
function filtrar_table(e, input) {
  const table = document.getElementById(`editableTableProvMat${codigo}`);
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
function Anular_empleado(button) {
  if(confirm('Desea Eliminar ...')){
    const row = button.closest("tr"); // Obtener la fila actual
    const cellWithType = row.querySelector("td[data-id]"); // Selecciona la celda con el atributo data-type

    if (cellWithType) {
      const currentType = Number(cellWithType.getAttribute("data-id")); // Obtén el valor actual
      if (currentType !== 0) {
        cellWithType.setAttribute("data-id", -Math.abs(currentType)); // Cambia el valor a negativo
        // Opcional: Ocultar la fila si deseas que desaparezca visualmente después de marcarla
        row.style.display = "none";
      } else {
        //eliminar totalmente de la tabla
        row.remove();
      }
    }
  }
}
async function dar_baja_etapa(event){
  if(confirm('Finalizar trabajador en esta etapa ...')){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "dar_baja":
          const formData = new FormData();
          formData.append('verDavid','editar_etapa_produccion_empleado');
          formData.append('idetapa_producccion_has_empleado',id1);
          formData.append('fecha_fin',fuG.fechaBolivia());
          const data  = await registerFunctions.sendformData2(formData);
          fuG.alertas(data,codigos.codigoPrincipal);

          const idetapa_empleado = Lista_etapas_empleado.find(obj => Number(obj.idetapa_producccion_has_empleado) === Number(id1));
          idetapa_empleado['fecha_fin'] = fuG.fechaBolivia();
          lista_etapas_produccion_empleado();
        break;
        //anular_distribucion
       
        
        default:
            sitio();
            break;
    }
  }
 
}

function listar_elementos_seleccionados(List_select) {
  console.log("Lista_empleado:", Lista_empleados);
  console.log("List_select:", List_select);

  if (!Array.isArray(List_select) || List_select.length === 0) {
    console.warn("List_select está vacío o no es un arreglo válido.");
    return;
  }
  
  // Crear el Set para la comparación
  const idempleadoSeleccionado = new Set(
    List_select.map((seleccionado) =>
      String(seleccionado.empleado_idempleado).trim()
    )
  );


  //Filtrado de productos usando el Set
  let empleados_filtrados = Lista_empleados.filter((empleado) =>
    idempleadoSeleccionado.has(String(empleado.idtrabajador).trim())
  );

  console.log("emp filtrados:", empleados_filtrados);

  if (empleados_filtrados.length === 0) {
    console.warn("No se encontraron emp coincidentes.");
  }
  return empleados_filtrados;
}


function alertas(data) {
  console.log(data);
  // Definir las variables al principio
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "success") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 3000;
    sitio();
    vaciar_listas();
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
