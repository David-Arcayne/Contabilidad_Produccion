import { URL_APIP } from "../../../../../lib/services.js";
import { codigos } from "../constantes.js";
import * as listarFunctions from "../../funciones/listar.js"

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let code_;
let permisos_;
let refrescar_;
let Lista_etapas_produccion = [];
let Lista_maquinas = [];
let Lista_etapas_maquinas_registrados = [];
let Lista_etapas_maquinas =[];
let list_seccion = [];
let list_tipo_Maquina = [];

const codigo = codigos.codigo_etapa_maquina;

export function registro_etapa_maquina(code, permisos, refrescar) {
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
  document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener("click", function () {
    sitio();
  });
  sitio();
}

function vaciar_listas() {
   Lista_etapas_produccion = [];
   Lista_maquinas = [];
   Lista_etapas_maquinas_registrados = [];
   Lista_etapas_maquinas =[];
   list_seccion = [];
   list_tipo_Maquina = [];
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo Listar_etapa_maquina
      const resultados = await Promise.all([
        listarFunctions.listar_api_general("listar_etapas_produccion", idEmpresa),
        listarFunctions.listar_api_general("listar_maquina", idEmpresa),
        listarFunctions.listar_api_general_verd("listado_maquina_etapas", idEmpresa),
        listarFunctions.listar_api_general("listar_tipomaquina", idEmpresa),
        listarFunctions.listar_api_general("listarseccion", idEmpresa),
      ]);

      // Asignamos los resultados a las variables correspondientes
      Lista_etapas_produccion = resultados[0];
      Lista_maquinas = resultados[1];
      Lista_etapas_maquinas_registrados = resultados[2];
      list_tipo_Maquina = resultados[3];
      list_seccion = resultados[4];
      console.log( Lista_maquinas);
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
          const filterLista = Lista_maquinas.filter((obj) => !Lista_etapas_maquinas.some(list_mp => Number(list_mp.maquina_idmaquina) === Number(obj.id)) );
          const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`).value;
          const filterListaRubro = filterLista.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
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
          const filterLista =Lista_maquinas.filter((obj) => !Lista_etapas_maquinas.some(list_mp => Number(list_mp.maquina_idmaquina) === Number(obj.id)) );

          const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`).value;
          const filterListaRubro = filterLista.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
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
function parametros_extras(item){
  console.log(item);
  if(item['entidad'] === 'etapa'){
      document.getElementById(`etapas_produccion_idetapas_produccion${codigos.codigo_etapa}`).value = item.idetapas_produccion;
      
      Lista_etapas_maquinas = [];
      

      let etapa_maquina_SELECT = Lista_etapas_maquinas_registrados.find((obj) =>Number(obj.etapas_produccion_idetapas_produccion) === Number(item.idetapas_produccion));
      console.log(etapa_maquina_SELECT);

      const resultado = {
        etapas_produccion_idetapas_produccion: etapa_maquina_SELECT.idetapa_maquina,
        detalles: etapa_maquina_SELECT.detalles.map((maquina) => ({
          idetapa_maquina: maquina.idetapa_maquina,
          maquina_idmaquina: maquina.maquina_idmaquina,
          etapas_produccion_idetapas_produccion: etapa_maquina_SELECT.idetapas_produccion,
          empresa_idempresa: uk[0].empresa.idempresa,
        })),
      };

      console.log(resultado);
      let Lista_Elementos = listar_elementos_seleccionados(resultado.detalles);

      Lista_Elementos = Array.isArray(Lista_Elementos) ? Lista_Elementos : [];
      antes_Listar_Elementos(Lista_Elementos, resultado.detalles);
      

  }else if (item['entidad'] === 'maquina'){
      document.getElementById(`maquina_idmaquina${codigos.codigo_maquina}`).value = item.id;

      
  }
             
}
async function sitio() {
  let view = `
        <div class="container">
            <h5 class="text-center mb-4 fw-bold fs-6" >Etapa maquina</h5>

            <form id="formularioPM${codigo}">
                <input type="hidden" name="ver" value="registro_maquina_etapas">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
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
                                  <input type="hidden" name="maquina_idmaquina" id="maquina_idmaquina${codigos.codigo_maquina}" required >

                                  <label for="maquina" class="form-label">maquina</label>
                                  <input type="text" id="searchInput${codigos.codigo_maquina}" placeholder="Buscar..." class="form-control" name="maquina" required>
                                  <ul id="dropdownList${codigos.codigo_maquina}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                              </div>
                              
                              <div class="col-md-3">
                                  <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="agregar${codigos.codigo_maquina}" aria-label="generar">Agregar</button>
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
                          <th scope="col">Funciones</th>
                      </tr>
                  </thead>
                  <tbody id="lista_etapas_produccion_maquina${codigo}"></tbody>
              </table>
              <div class="col-md-12 mt-3 d-flex justify-content-between">
                  <button type="button" class="btn btn-primary btn-sm" id="cancelar_${codigo}">Cancelar</button>
                  <button type="button" class="btn btn-success btn-lg" id="registrar_etapa_produccion_maquina${codigo}">Guardar</button>
              </div>
            </div>
        </div>
       
    `;
  await listar();
  app.innerHTML = view;
  
  initializeDropdownSearch(codigos.codigo_etapa, Lista_etapas_produccion,'nombre_etapa',true,'etapa');
  initializeDropdownSearch(codigos.codigo_maquina, Lista_maquinas,'nombre',true,'maquina');
  
  document.getElementById(`agregar${codigos.codigo_maquina}`).addEventListener("click", function () {
    const maquina = document.getElementById(`maquina_idmaquina${codigos.codigo_maquina}`);
    if (maquina.value) {
      let Lista_Elementos = listar_elementos_seleccionados([{'maquina_idmaquina':maquina.value}]);
      let lista_rgs = [];
      const select_etapa = document.getElementById(`etapas_produccion_idetapas_produccion${codigos.codigo_etapa}`);
      if (!select_etapa.value) {
        alert("selecciones una proveedor de producción");
        return;
      }
     
        let aux = {
          idetapa_maquina: 0,
          maquina_idmaquina: Number(maquina.value),
          etapas_produccion_idetapas_produccion: Number(select_etapa.value),
          empresa_idempresa: uk[0].empresa.idempresa,
        };
        lista_rgs.push(aux);
      
      antes_Listar_Elementos(Lista_Elementos, lista_rgs);
    } else {
      alert("No ha seleccionado");
    }
  });
  
  

  const btnregistrar_api = document.getElementById(
    `registrar_etapa_produccion_maquina${codigo}`
  );
  btnregistrar_api.addEventListener("click", function () {
    const maquinas = [];
    const rows = document.querySelectorAll(
      `#lista_etapas_produccion_maquina${codigo} tr`
    );
    const etapa = document.getElementById(`etapas_produccion_idetapas_produccion${codigos.codigo_etapa}`);
    

    rows.forEach((row, index) => {
      const data_id = row.querySelector("td[data-id]");
      const data_idetapa = row.querySelector("td[data-idetapa]");
      const data_idmaquina = row.querySelector("td[data-idmaquina]");
      const data_idemp = row.querySelector("td[data-idemp]");

      const id = data_id ? data_id.getAttribute("data-id") : null;
      const idetapa = data_idetapa ? data_idetapa.getAttribute("data-idetapa") : null;
      const idmaquina = data_idmaquina ? data_idmaquina.getAttribute("data-idmaquina") : null;
      const idemp = data_idemp ? data_idemp.getAttribute("data-idemp") : null;

      const maquina = {
        idetapa_maquina: Number(id),
        maquina_idmaquina: Number(idmaquina),
        etapas_produccion_idetapas_produccion: Number(etapa.value),
        empresa_idempresa: uk[0].empresa.idempresa,
      };
      maquinas.push(maquina);
    });

    prepararLista_enviar(maquinas);
  });



  const btn_cancelar = document.getElementById(`cancelar_${codigo}`);
  btn_cancelar.addEventListener("click", function () {
    sitio();
    vaciar_listas();
  });
}

function prepararLista_enviar(list) {
  let etapa_maquina = {
    verDavid: "registro_maquina_etapas",
    detalle: [...list],
  };

  console.log(etapa_maquina);
  if (etapa_maquina.detalle && etapa_maquina.detalle.length > 0) {
    fetch(`${URL_APIP}api/`, {
      method: "POST", // Método HTTP
      headers: {
        "Usar-Registro-David": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(etapa_maquina), // Convertir el objeto JS a JSON antes de enviarlo
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
  console.log(Lista_etapas_maquinas);
  if (
    Array.isArray(listar_elementos_seleccionados) &&
    listar_elementos_seleccionados.length > 0
  ) {
    listar_elementos_seleccionados.map((lista) => {
      let existe = Lista_etapas_maquinas.some(
        (orden) => Number(orden.maquina_idmaquina) === Number(lista.id)
      );
      if (!existe) {
        let item_seleccionado = seleccionados.find(
          (obj) => Number(obj.maquina_idmaquina) === Number(lista.id)
        );
        lista["idetapa_maquina"] = item_seleccionado["idetapa_maquina"];
        lista["etapas_produccion_idetapas_produccion"] = item_seleccionado["etapas_produccion_idetapas_produccion"];
        lista["maquina_idmaquina"] = item_seleccionado["maquina_idmaquina"];
        lista["empresa_idempresa"] = item_seleccionado["empresa_idempresa"];

        Lista_etapas_maquinas.push(lista);
        
      } else {
        alert("El maquina ya se agrego");
        return;
      }
    });
  }
  lista_etapas_produccion_maquina();
}

function lista_etapas_produccion_maquina() {
  const listar = document.getElementById(`lista_etapas_produccion_maquina${codigo}`);
  let view = "",
    ind = 1;
  console.log(Lista_etapas_maquinas);
  Lista_etapas_maquinas.map((lista) => {
   

    view += `
    <tr>
       <td>${ind++}</td>             
       <td
       data-id="${lista.idetapa_maquina}" 
       data-idetapa="${lista.etapas_produccion_idetapas_produccion}" 
       data-idmaquina="${lista.maquina_idmaquina}"
       data-idemp="${lista.empresa_idempresa}"
       >${lista.nombre}</td>
      
       <td >${lista.apellido}</td>
    
   
       <td>
           <div class="d-flex gap-3">
               
               <div class="text-center">
                   <a 
                   data-id="Anular_maquina,
                   ${lista.id},
                   ${uk[0].empresa.idempresa}"
                   class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn-delete"
                   style="width: 2.5rem; height: 2.5rem;"
                   title="Eliminar material">
                       <i class="bi bi-trash fs-5"></i>
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
    button.addEventListener("click", () => Anular_maquina(button));
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
function Anular_maquina(button) {
  console.log("===");
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

function listar_elementos_seleccionados(List_select) {
  console.log("Lista_maquina:", Lista_maquinas);
  console.log("List_select:", List_select);

  if (!Array.isArray(List_select) || List_select.length === 0) {
    console.warn("List_select está vacío o no es un arreglo válido.");
    return;
  }
  List_select.forEach((seleccionado, index) => {
    console.log(`Elemento en List_select [${index}]:`, seleccionado);
    console.log(
      `maquina_idmaquina en seleccionado:`,
      seleccionado.maquina_idmaquina
    );
  });
  // Crear el Set para la comparación
  const idmaquinaSeleccionado = new Set(
    List_select.map((seleccionado) =>
      String(seleccionado.maquina_idmaquina).trim()
    )
  );

  console.log(
    "ID material seleccionados en Set:",
    Array.from(idmaquinaSeleccionado)
  );

  //Inspección detallada de cada ID en ambas listas
  Lista_maquinas.forEach((maquina) => {
    const maquinaId = String(maquina.id).trim();
    const encontrado = idmaquinaSeleccionado.has(maquinaId);
    console.log(
      `ID emp: ${maquinaId} - ¿Encontrado en seleccionados?: ${encontrado}`
    );
  });

  //Filtrado de productos usando el Set
  let maquinas_filtrados = Lista_maquinas.filter((material) =>
    idmaquinaSeleccionado.has(String(material.id).trim())
  );

  console.log("emp filtrados:", maquinas_filtrados);

  if (maquinas_filtrados.length === 0) {
    console.warn("No se encontraron emp coincidentes.");
  }
  return maquinas_filtrados;
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
