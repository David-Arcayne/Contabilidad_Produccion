import { URL_APIP } from "../../../../../lib/services.js";
import { codigos } from "../constantes.js";
import * as listarFunctions from "../../funciones/listar.js"

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let code_;
let permisos_;
let refrescar_;
let Lista_grupo_etapas = [];
let Lista_Productos = [];
let Lista_grupo_productos_registrados = [];
let Lista_productos_grupo =[];
let list_categoria = [];
let list_medida = [];
let list_estados = [];
let list_unidad = [];
let privilegios;
let Lista_rubro = [];
const codigo = codigos.codigo_etapa_maquina;

function manejarClick(event) {
  sitio();
  // Eliminar el evento click después de ejecutarlo
  event.target.removeEventListener("click", manejarClick);
}
export function registro_grupo_productos(code, permisos, refrescar) {
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);

  sitio();
}

function vaciar_listas() {
    Lista_grupo_etapas = [];
    Lista_Productos = [];
    Lista_grupo_productos_registrados = [];
    Lista_productos_grupo =[];
    list_categoria = [];
    list_medida = [];
    list_estados = [];
    list_unidad = [];
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo Listar_etapa_maquina
      const resultados = await Promise.all([
        listarFunctions.listar_api_general_verd("listar_grupo_etapas", idEmpresa),
        listarFunctions.listar_api_general("listar_productos_comercial", idEmpresa),
        listarFunctions.listar_api_general_verd("listar_productos_porGrupo", idEmpresa),
        listarFunctions.listar_api_general("listar_estados_productos", idEmpresa),
        listarFunctions.listar_api_general("listar_unidad_producto", idEmpresa),
        listarFunctions.listar_api_general("listar_categorias_comercial", idEmpresa),
        listarFunctions.listar_api_general("listar_caracteristica_comercial", idEmpresa),
        listarFunctions.listar_rubro(idEmpresa),


      ]);

      // Asignamos los resultados a las variables correspondientes
      Lista_grupo_etapas = resultados[0];
      Lista_Productos = resultados[1];
      Lista_grupo_productos_registrados = resultados[2];
      list_estados = resultados[3];
      list_unidad = resultados[4];
      list_categoria = resultados[5];
      list_medida = resultados[6];
      Lista_rubro = resultados[7];

        
      console.log( Lista_Productos, Lista_grupo_etapas, Lista_grupo_productos_registrados);
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
          const filterLista = Lista_Productos.filter((obj) => !Lista_productos_grupo.some(list_mp => Number(list_mp.producto_idproducto) === Number(obj.idproduct_comercial)) );
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
          const filterLista =Lista_Productos.filter((obj) => !Lista_productos_grupo.some(list_mp => Number(list_mp.producto_idproducto) === Number(obj.id)) );

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
function initializeDropdownSearch_(codigo, Lista_Material, valor, condicion,entidad) {
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

function initializeDropdownSearch_m(codigo, Lista_Material,clave, valor, condicion,entidad) {
    const searchInput = document.getElementById(`searchInput${codigo}`);
    const dropdownList = document.getElementById(`dropdownList${codigo}`);

    // Crear la lista inicial
    function populateDropdown(filteredItems) {
        dropdownList.innerHTML = ''; // Limpia la lista
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent =item [clave] + " "+item[valor];
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
                
                searchInput.value = item [clave] +" "+ item[valor];
                
                
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
          console.log(Lista_productos_grupo);
          const filterLista = Lista_Productos.filter((obj) => !Lista_productos_grupo.some(list_mp => Number(list_mp.producto_idproducto) === Number(obj.idproduct_comercial)) );
          const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`).value;
          const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
            const filtered = filterListaRubro.filter(item =>
                item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
                item[clave].toLowerCase().includes(searchText.toLowerCase())
            );
            
            populateDropdown(filtered);
        }else{
            const filtered = Lista_Material.filter(item =>
                item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
                item[clave].toLowerCase().includes(searchText.toLowerCase())
            );
            populateDropdown(filtered);
        }
        
    }

    // Mostrar y manejar eventos del input
    searchInput.addEventListener('focus', () => {
        dropdownList.style.display = 'block';
        if(condicion){
          const filterLista =Lista_Productos.filter((obj) => !Lista_productos_grupo.some(list_mp => Number(list_mp.producto_idproducto) === Number(obj.idproduct_comercial)) );

          const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`).value;
          const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro))
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
  if(item['entidad'] === 'grupo'){
      document.getElementById(`grupo_etapas_idgrupo_etapas${codigos.codigo_grupo}`).value = item.idgrupo_etapas;
      
      Lista_productos_grupo = [];
      Listar_productos();
      console.log(Lista_grupo_productos_registrados);
      let etapa_grupo_producto_SELECT = Lista_grupo_productos_registrados
    .find((obj) =>Number(obj.grupo_etapas_idgrupo_etapas) === Number(item.idgrupo_etapas));
      console.log(etapa_grupo_producto_SELECT);

      const resultado = {
        grupo_etapas_idgrupo_etapas: etapa_grupo_producto_SELECT.grupo_etapas_idgrupo_etapas,
        detalles: etapa_grupo_producto_SELECT.grupo_productos.map((producto) => ({
          idgrupo_productos: producto.idgrupo_productos,
          producto_idproducto: producto.producto_idproducto,
          grupo_etapas_idgrupo_etapas: etapa_grupo_producto_SELECT.grupo_etapas_idgrupo_etapas,
        })),
      };

      console.log(resultado);
      let Lista_Elementos = listar_elementos_seleccionados(resultado.detalles);

      Lista_Elementos = Array.isArray(Lista_Elementos) ? Lista_Elementos : [];
      antes_Listar_Elementos(Lista_Elementos, resultado.detalles);
      

  }else if (item['entidad'] === 'producto'){
      document.getElementById(`producto_idproducto${codigos.codigo_producto}`).value = item.idproduct_comercial;
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
            <h5 class="text-center mb-4 fw-bold fs-6" >Etapa producto</h5>
             <div class="col-md-3 mb-3 " >
                <div class="row">
                    <label for="rubro_idrubro" class="form-label">Linea de produccion:</label>
                    <select class="form-select" id="rubro_idrubro${codigos.codigoPrincipal}" name="rubro_idrubro">
                        <option value="" disabled selected>Seleccione un rubro</option>
                        
                    </select>
                </div>
            </div>
            <form id="formularioPM${codigo}">
                <input type="hidden" name="ver" value="registro_maquina_etapas">
                <div class="row">
                    <div class=" col-md-6 border p-3 m-0 rounded">
                          <div class="row">
                                            
                              <div style="position: relative;" class="col-md-12">
                                  <input type="hidden" name="grupo_etapas_idgrupo_etapas" id="grupo_etapas_idgrupo_etapas${codigos.codigo_grupo}" required>

                                  <label for="grupo_etapas" class="form-label">Grupo etapas:</label>
                                  <input type="text" id="searchInput${codigos.codigo_grupo}" placeholder="Buscar..." class="form-control" name="grupo_etapas" required>
                                  <ul id="dropdownList${codigos.codigo_grupo}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                              </div>
                              
                          </div>
                          
                    </div>
                    <div class=" col-md-6 border p-3 m-0 rounded">
                          <div class="row">
                                            
                              <div style="position: relative;" class="col-md-4">
                                  <input type="hidden" name="producto_idproducto" id="producto_idproducto${codigos.codigo_producto}" required >

                                  <label for="producto" class="form-label">Producto: </label>
                                  <input type="text" id="searchInput${codigos.codigo_producto}" placeholder="Buscar..." class="form-control" name="producto" required>
                                  <ul id="dropdownList${codigos.codigo_producto}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                              </div>
                              
                              <div class="col-md-3">
                                  <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="agregar${codigos.codigo_producto}" aria-label="generar">Agregar</button>
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
                            <th scope="col">Codigo</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Caracteristica</th>
                            <th>Estado Producto</th>
                            <th>Unidad medida</th>   
                            <th>Funciones</th> 
                      </tr>
                  </thead>
                  <tbody id="Listar_productos${codigo}"></tbody>
              </table>
              <div class="col-md-12 mt-3 d-flex justify-content-between">
                  <button type="button" class="btn btn-primary btn-sm" id="cancelar_${codigo}">Cancelar</button>
                  <button type="button" class="btn btn-success btn-lg" id="registro_productos_grupo${codigo}">Guardar</button>
              </div>
            </div>
        </div>
       
    `;
  await listar();
  app.innerHTML = view;
  listar_rubro();

  const productos = Lista_grupo_productos_registrados.flatMap(grupo => 
    grupo.grupo_productos.map(producto => producto.producto_idproducto)
  );
  console.log(productos);
  const List_product = Lista_Productos.filter(obj => !productos.some(data => Number(data) === Number(obj.idproduct_comercial)));
  initializeDropdownSearch_(codigos.codigo_grupo, Lista_grupo_etapas,'nombre',true,'grupo');
  //initializeDropdownSearch(codigos.codigo_producto, Lista_Productos,'nombre',true,'producto');
  initializeDropdownSearch_m(codigos.codigo_producto, List_product,'codigo','nombre',true,'producto');
  
  document.getElementById(`agregar${codigos.codigo_producto}`).addEventListener("click", function () {
    const producto = document.getElementById(`producto_idproducto${codigos.codigo_producto}`);
    if (producto.value) {
      let Lista_Elementos = listar_elementos_seleccionados([{'producto_idproducto':producto.value}]);
      let lista_rgs = [];
      const select_etapa = document.getElementById(`grupo_etapas_idgrupo_etapas${codigos.codigo_grupo}`);
      if (!select_etapa.value) {
        alert("selecciones una proveedor de producción");
        return;
      }
     
        let aux = {
          idgrupo_productos: 0,
          producto_idproducto: Number(producto.value),
          grupo_etapas_idgrupo_etapas: Number(select_etapa.value),
          empresa_idempresa: uk[0].empresa.idempresa,
        };
        console.log(aux);
        lista_rgs.push(aux);
      
      antes_Listar_Elementos(Lista_Elementos, lista_rgs);
    } else {
      alert("No ha seleccionado");
    }
  });
  
  

  const btnregistrar_api = document.getElementById(
    `registro_productos_grupo${codigo}`
  );
  btnregistrar_api.addEventListener("click", function () {
    const productos = [];
    const rows = document.querySelectorAll(
      `#Listar_productos${codigo} tr`
    );
    const grupo = document.getElementById(`grupo_etapas_idgrupo_etapas${codigos.codigo_grupo}`);
    

    rows.forEach((row, index) => {
      const data_id = row.querySelector("td[data-id]");
      const data_idproducto = row.querySelector("td[data-idproducto]");
  

      const id = data_id ? data_id.getAttribute("data-id") : null;
      const idproducto = data_idproducto ? data_idproducto.getAttribute("data-idproducto") : null;

      const producto = {
        idgrupo_productos: Number(id),
        producto_idproducto: Number(idproducto),
        grupo_etapas_idgrupo_etapas: Number(grupo.value),
      };
      productos.push(producto);
    });

    prepararLista_enviar(productos);
  });



  const btn_cancelar = document.getElementById(`cancelar_${codigo}`);
  btn_cancelar.addEventListener("click", function () {
    sitio();
    vaciar_listas();
  });
}

function prepararLista_enviar(list) {
  let etapa_maquina = {
    verDavid: "registro_productos_grupo",
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
  console.log(Lista_productos_grupo);
  if (
    Array.isArray(listar_elementos_seleccionados) &&
    listar_elementos_seleccionados.length > 0
  ) {
    listar_elementos_seleccionados.map((lista) => {
      let existe = Lista_productos_grupo.some(
        (orden) => Number(orden.producto_idproducto) === Number(lista.idproduct_comercial)
      );
      if (!existe) {
        let item_seleccionado = seleccionados.find(
          (obj) => Number(obj.producto_idproducto) === Number(lista.idproduct_comercial)
        );
        lista["idgrupo_productos"] = item_seleccionado["idgrupo_productos"];
        lista["grupo_etapas_idgrupo_etapas"] = item_seleccionado["grupo_etapas_idgrupo_etapas"];
        lista["producto_idproducto"] = item_seleccionado["producto_idproducto"];

        Lista_productos_grupo.push(lista);
        
      } else {
        alert("El producto ya se agrego");
        return;
      }
    });
  }
  Listar_productos();
}

function Listar_productos() {
  const listar = document.getElementById(`Listar_productos${codigo}`);
  let view = "",
    ind = 1;
  console.log(Lista_productos_grupo);
  Lista_productos_grupo.map((lista) => {  
    let itemcategoria = list_categoria.find((obj) =>Number(obj.id_categorias) === Number(lista.categorias_id_categorias)) || {nombre: "-"};
    let item_medida_cm = list_medida.find((obj) => Number(obj.id_medida) === Number(lista.medida_id_medida)) || {nombre_medida: "-"};

    let item_estado_cm = list_estados.find((obj) => obj.id === lista.estados_productos_id_estados_productos) || {tipos_estado: "-"};
    let item_unidad_cm = list_unidad.find((obj) => obj.id === lista.unidad_id_unidad) || {nombre: "-"};

    view += `
    <tr>
       <td>${ind++}</td>   
       <td >${lista.codigo}</td>          
       <td
       data-id="${lista.idgrupo_productos}" 
       data-idgrupo="${lista.grupo_etapas_idgrupo_etapas}" 
       data-idproducto="${lista.producto_idproducto}"
       data-idemp="${lista.empresa_idempresa}">${lista.nombre}</td>
      
      
      <td >${lista.descripcion}</td>                    
      <td >${itemcategoria.nombre}</td>
      <td >${item_medida_cm.nombre_medida}</td>
      <td>${item_estado_cm.tipos_estado}</td>
      <td >${item_unidad_cm.nombre}</td>
    
   
       <td>
           <div class="d-flex gap-3">
               
               <div class="text-center">
                   <a 
                   data-id="Anular_maquina,
                   ${lista.idproduct_comercial},
                   ${uk[0].empresa.idempresa}"
                   class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn-delete"
                   style="width: 2.5rem; height: 2.5rem;"
                   title="Eliminar producto">
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
  console.log("Lista_maquina:", Lista_Productos);
  console.log("List_select:", List_select);

  if (!Array.isArray(List_select) || List_select.length === 0) {
    console.warn("List_select está vacío o no es un arreglo válido.");
    return;
  }
 
  // Crear el Set para la comparación
  const idproductoSeleccionado = new Set(
    List_select.map((seleccionado) =>
      String(seleccionado.producto_idproducto).trim()
    )
  );

  
  //Inspección detallada de cada ID en ambas listas
  Lista_Productos.forEach((producto) => {
    const prducto_id = String(producto.idproduct_comercial).trim();
    const encontrado = idproductoSeleccionado.has(prducto_id);
  });

  //Filtrado de productos usando el Set
  let productos_filtrados = Lista_Productos.filter((producto) =>
    idproductoSeleccionado.has(String(producto.idproduct_comercial).trim())
  );

  console.log("emp filtrados:", productos_filtrados);

  if (productos_filtrados.length === 0) {
    console.warn("No se encontraron emp coincidentes.");
  }
  return productos_filtrados;
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
