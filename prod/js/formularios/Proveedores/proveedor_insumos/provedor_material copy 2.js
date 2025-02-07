import { URL_APIP } from "../../../../../lib/services.js";
import { codigos } from "../constantes.js";
import { Editar_table_fila } from "../../funciones/editar_fila_table.js";
import { Editar_tabla_celda } from "../../funciones/dbc_editar_celda_table.js";
import * as listarFunctions from "../../funciones/listar.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let Lista_proveedores = [];
let Lista_materiales = [];
let Lista_materiales_proveedores = [];
let Lista_mat_pro_reg = [];
let list_medida = [];
let list_tipoM = [];
let obt_rubro_aux = {
  id: 0,
  rubro: "",
  detalle: "",
};
const codigo = codigos.codigoAddMatPro;

export function proveedor_material_config(code, permisos, refrescar) {
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
  sitio();
}

function vaciar_listas() {
  Lista_proveedores = [];
  Lista_materiales = [];
  Lista_materiales_proveedores = [];
  Lista_mat_pro_reg = [];
  list_medida = [];
  list_tipoM = [];
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_api_general_verd("listarProveedor", idEmpresa),
      listarFunctions.listar_api_general("listar_material", idEmpresa),
      listarFunctions.listar_api_general("listar_tipo_material", idEmpresa),
      listarFunctions.listar_api_general("listar_unidad_producto", idEmpresa),
      listarFunctions.listar_api_general_verd(
        "Listar_proveedor_material",
        idEmpresa
      ),
    ]);

    // Asignamos los resultados a las variables correspondientes
    Lista_proveedores = resultados[0];
    Lista_materiales = resultados[1];
    list_tipoM = resultados[2];
    list_medida = resultados[3];

    Lista_mat_pro_reg = resultados[4];
    console.log(resultados[4]);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
function menu_proveedor_material(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  const forme = document.querySelector(`#alerta`);
  switch (funcion) {
    case "eliminar_rubro":
      eliminar_rubro(id1, id2);
      break;
    case "editar_rubro":
      toggleEditSave(event);
      break;
    // Agrega otros casos según sea necesario
    default:
      // Manejo para casos no coincidentes
      sitio();
      break;
  }
}
function toggleEditSave(event) {
  const permisos = [1, 2];
  const opciones_select = [];
  const opciones_number = [];
  const names = ["rubro", "detalle"];

  const url_api = "editar_rubro";
  const ver = "ver";
  const nom_v_Emp = "empresa";
  const md5 = uk[0].empresa.idempresa;
  const id = "id";
  Editar_table_fila(
    event,
    codigos.codigoPrincipal,
    Lista_Rubro,
    permisos,
    names,
    names,
    opciones_select,
    opciones_number,
    url_api,
    ver,
    nom_v_Emp,
    md5,
    id
  );
}
function edit_Celda_table(e) {
  const elementos_select = [];
  const elementos_number = [];
  const url_api = "editar_rubro";
  const ver = "ver";
  const nom_v_Emp = "empresa";
  const md5 = uk[0].empresa.idempresa;
  const id = "id";
  Editar_tabla_celda(
    e,
    Lista_Rubro,
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

function eliminar_rubro(id, ids) {
  if (confirm("Desea Eliminar..?")) {
    fetch(`${URL_APIP}api/eliminar_rubro/${id}/${ids}`)
      .then((res) => res.json())
      .then((data) => {
        obt_rubro_aux = { ...Lista_Rubro.find((obj) => obj.id === Number(id)) };

        alertas(data);
        console.log(obt_rubro_aux);
      });
  }
}
function initializeDropdownSearch(codigo, Lista_Material, valor, condicion) {
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
              parametros_extras(item);
          });

          dropdownList.appendChild(li);
      });
  }

  // Filtrar la lista según el texto ingresado
  function filterItems(searchText) {
      if(condicion){
          const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoCompras}`).value;
          const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
          const filtered = filterListaRubro.filter(item =>
              item.nombre.toLowerCase().includes(searchText.toLowerCase())
          );
          populateDropdown(filtered);
      }else{
          const filtered = Lista_Material.filter(item =>
              item.nombre.toLowerCase().includes(searchText.toLowerCase())
          );
          populateDropdown(filtered);
      }
      
  }

  // Mostrar y manejar eventos del input
  searchInput.addEventListener('focus', () => {
      dropdownList.style.display = 'block';
      if(condicion){
          const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoCompras}`).value;
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
function parametros_extras(item){
  if(item['rubro_idrubro']){
      const medida = Lista_medida.find((obj) => Number(obj.id) === Number(item.medida));
      document.getElementById(`material_idmaterial${codigos.codigo_material}`).value = item.id;
      document.getElementById(`medida${codigo}`).value = medida.nombre; 
  }else if (item['telefono']){
      document.getElementById(`proveedor_idproveedor${codigos.codigo_proveedor}`).value = item.id;
      document.getElementById(`telefono${codigo}`).value = item.telefono; 
  }else{
      document.getElementById(`tipo_envase_idtipo_envase${codigos.codigo_envase}`).value = item.id;

  }
             
}
async function sitio() {
  let view = `
        <div class="container">
            <h5 class="text-center mb-4 fw-bold fs-6" >Generar Proveedor Material</h5>

            <form id="formularioPM${codigo}">
                <input type="hidden" name="ver" value="registrar_proveedor_material">
                <input type="hidden" name="empresa" value="${
                  uk[0].empresa.idempresa
                }">
                <div class="row">
                    <div class=" col-md-6 border p-3 m-0 rounded">
                          <div class="row">
                
                              <div style="position: relative;" class="col-md-6">
                                  <input type="hidden" name="proveedor_idproveedor" id="proveedor_idproveedor${codigo}">

                                  <label for="Proveedor" class="form-label">Proveedor:</label>
                                  <input type="text" id="searchInput${codigo}" placeholder="Buscar..." class="form-control" name="Proveedor">
                                  <ul id="dropdownList${codigo}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                              </div>
                              <div class="col-md-6">
                                  <label for="telefono" class="form-label">Telefono:</label>
                                  <input type="text" class="form-control" id="telefono${codigo}" name="telefono" readonly>
                              </div>
                          </div>
                          
                      </div>
                    <div class="select-container" id="select2" style="width: 600px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3); padding: 20px; margin: 5px auto;">
                        <label for="seccion2" class="form-label fw-bold fs-6">Seleccionar material</label>
                        
                        <div class="select-box" id="selectBox" style="border: 1px solid #ccc; padding: 10px; cursor: pointer; background-color: #fff; display: flex; justify-content: space-between; align-items: center;">
                            Materiales <span>▼</span>
                        </div>
                        
                        <div class="select-options" id="material_idmaterial${codigo}" style="display: none; border: 1px solid #ccc; border-top: none; max-height: 200px; overflow-y: auto; background-color: #fff;">
                            <div data-value="${1}">${"lista.caracteristica"}</div>
                            <div data-value="${2}">${"lista.caracteristica"}</div>
                            <div data-value="${3}">${"lista.caracteristica"}</div>
                        </div>

                        <div id="selection-info" style="padding-top: 10px;">0 materiales seleccionados</div>
                        
                        <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="agregar_material${codigo}" aria-label="generar">Agregar Material</button>
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
                          <th scope="col">Material</th>
                          <th scope="col">Codigo</th>
                          <th scope="col">Medida</th>
                          <th scope="col">Tipo material</th>
                          <th scope="col">Funciones</th>
                      </tr>
                  </thead>
                  <tbody id="listaProveedorMaterial${codigo}"></tbody>
              </table>
              <div class="col-md-12 mt-3 d-flex justify-content-between">
                  <button type="button" class="btn btn-primary btn-sm" id="cancelar_${codigo}">Cancelar</button>
                  <button type="button" class="btn btn-success btn-lg" id="registrara_proveedor_material${codigo}">Guardar</button>
              </div>
            </div>
        </div>
       
    `;
  await listar();
  app.innerHTML = view;
  console.log(Lista_materiales, Lista_proveedores);
  initializeDropdownSearch(codigo, Lista_proveedores,'nombre',false);
  llenar_select_caracteristicas();
  
  let selectedOptions = configurarSelect(
    "selectBox",
    `material_idmaterial${codigo}`,
    "selection-info"
  );
  console.log(selectedOptions);
  
  document.getElementById(`agregar_material${codigo}`).addEventListener("click", function () {
      if (selectedOptions.length > 0) {
        console.log(selectedOptions);
        let Lista_Elementos = listar_elementos_seleccionados(selectedOptions);
        let lista_rgs = [];
        const select_proveedor = document.getElementById(
          `proveedor_idproveedor${codigo}`
        );
        if (!select_proveedor.value) {
          alert("selecciones una etapa de producción");
          return;
        }
        console.log("proveedor:", select_proveedor.value);
        selectedOptions.map((lista) => {
          let aux = {
            idproveedor_has_material: 0,
            material_idmaterial: lista["material_idmaterial"],
            proveedor_idproveedor: Number(select_proveedor.value),
            empresa_idempresa: uk[0].empresa.idempresa,
          };
          lista_rgs.push(aux);
        });
        antes_Listar_Elementos(Lista_Elementos, lista_rgs);
      } else {
        console.error("No hay opciones seleccionadas en el primer select.");
      }
    });

  const btnregistrar_api = document.getElementById(
    `registrara_proveedor_material${codigo}`
  );
  btnregistrar_api.addEventListener("click", function () {
    const materiales = [];
    const rows = document.querySelectorAll(
      `#listaProveedorMaterial${codigo} tr`
    );
    const proveedor = document.querySelector(`#proveedor_idproveedor${codigo}`);

    rows.forEach((row, index) => {
      const data_id = row.querySelector("td[data-id]");
      const data_idprv = row.querySelector("td[data-idprv]");
      const data_idmat = row.querySelector("td[data-idmat]");
      const data_idemp = row.querySelector("td[data-idemp]");

      const id = data_id ? data_id.getAttribute("data-id") : null;
      const idprv = data_idprv ? data_idprv.getAttribute("data-idprv") : null;
      const idmat = data_idmat ? data_idmat.getAttribute("data-idmat") : null;
      const idemp = data_idemp ? data_idemp.getAttribute("data-idemp") : null;

      const material = {
        idproveedor_has_material: Number(id),
        material_idmaterial: Number(idmat),
        proveedor_idproveedor: Number(proveedor.value),
        empresa_idempresa: uk[0].empresa.idempresa,
      };
      materiales.push(material);
    });

    prepararLista_enviar(materiales);
  });
  const proveedor_select = document.querySelector(
    `#proveedor_idproveedor${codigo}`
  );
  proveedor_select.addEventListener("change", function () {
    Lista_materiales_proveedores = [];
    console.log(proveedor_select.value);

    let productos_seleccionados = Lista_mat_pro_reg.find((obj) =>Number(obj.proveedor_idproveedor) === Number(proveedor_select.value));
    console.log(productos_seleccionados);

    const resultado = {
      proveedor_idproveedor: productos_seleccionados.proveedor_idproveedor,
      materiales: productos_seleccionados.materiales.map((material) => ({
        idproveedor_has_material: material.idproveedor_has_material,
        material_idmaterial: material.material_idmaterial,
        proveedor_idproveedor: productos_seleccionados.proveedor_idproveedor,
        empresa_idempresa: uk[0].empresa.idempresa,
      })),
    };

    console.log(resultado);
    let Lista_Elementos = listar_elementos_seleccionados(resultado.materiales);

    Lista_Elementos = Array.isArray(Lista_Elementos) ? Lista_Elementos : [];
    antes_Listar_Elementos(Lista_Elementos, resultado.materiales);
  });

  const btn_cancelar = document.getElementById(`cancelar_${codigo}`);
  btn_cancelar.addEventListener("click", function () {
    sitio();
    vaciar_listas();
  });
}
function prepararLista_enviar(list) {
  let proveedor_material = {
    verDavid: "registrar_proveedor_material",
    detalle: [...list],
  };

  console.log(proveedor_material);
  if (proveedor_material.detalle && proveedor_material.detalle.length > 0) {
    fetch(`${URL_APIP}api/`, {
      method: "POST", // Método HTTP
      headers: {
        "Usar-Registro-David": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(proveedor_material), // Convertir el objeto JS a JSON antes de enviarlo
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

  if (
    Array.isArray(listar_elementos_seleccionados) &&
    listar_elementos_seleccionados.length > 0
  ) {
    listar_elementos_seleccionados.map((lista) => {
      let existe = Lista_materiales_proveedores.some(
        (orden) => Number(orden.material_idmaterial) === Number(lista.id)
      );
      if (!existe) {
        let item_seleccionado = seleccionados.find(
          (obj) => Number(obj.material_idmaterial) === Number(lista.id)
        );
        lista["idproveedor_has_material"] =
          item_seleccionado["idproveedor_has_material"];
        lista["proveedor_idproveedor"] =
          item_seleccionado["proveedor_idproveedor"];
        lista["material_idmaterial"] = item_seleccionado["material_idmaterial"];
        lista["empresa_idempresa"] = item_seleccionado["empresa_idempresa"];

        Lista_materiales_proveedores.push(lista);
        listaProveedorMaterial();
      } else {
        alert("Ya existe producto");
      }
    });
  } else {
    listaProveedorMaterial();
  }
}

function listaProveedorMaterial() {
  const listar = document.getElementById(`listaProveedorMaterial${codigo}`);
  let view = "",
    ind = 1;
  console.log(Lista_materiales_proveedores);
  Lista_materiales_proveedores.map((lista) => {
    let itemTipo = list_tipoM.find(
      (item) => Number(item.id) === Number(lista.tipo)
    );
    let itemMedida = list_medida.find(
      (dat) => Number(dat.id) === Number(lista.medida)
    );

    view += `
    <tr>
       <td>${ind++}</td>                
       <td
       data-id="${lista.idproveedor_has_material}" 
       data-idprv="${lista.proveedor_idproveedor}" 
       data-idmat="${lista.material_idmaterial}"
       data-idemp="${lista.empresa_idempresa}"
       >${lista.nombre}</td>
       <td >${lista.codigo}</td>
       <td >${itemMedida.nombre}</td>
       <td>${itemTipo.nombre}</td>
   
       <td>
           <div class="d-flex gap-3">
               
               <div class="text-center">
                   <a 
                   data-id="eliminar_material,
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
   `;
  });
  listar.innerHTML = view;

  listar.querySelectorAll(".btn-delete").forEach((button) => {
    console.log("===");
    button.addEventListener("click", () => Eliminar_Material(button));
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
function Eliminar_Material(button) {
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
  console.log("Lista_material:", Lista_materiales);
  console.log("List_select:", List_select);

  if (!Array.isArray(List_select) || List_select.length === 0) {
    console.warn("List_select está vacío o no es un arreglo válido.");
    return;
  }
  List_select.forEach((seleccionado, index) => {
    console.log(`Elemento en List_select [${index}]:`, seleccionado);
    console.log(
      `idproduct_comercial en seleccionado:`,
      seleccionado.material_idmaterial
    );
  });
  // Crear el Set para la comparación
  const idMaterialSeleccionado = new Set(
    List_select.map((seleccionado) =>
      String(seleccionado.material_idmaterial).trim()
    )
  );

  console.log(
    "ID productos seleccionados en Set:",
    Array.from(idMaterialSeleccionado)
  );

  //Inspección detallada de cada ID en ambas listas
  Lista_materiales.forEach((material) => {
    const materialId = String(material.id).trim();
    const encontrado = idMaterialSeleccionado.has(materialId);
    console.log(
      `ID producto: ${materialId} - ¿Encontrado en seleccionados?: ${encontrado}`
    );
  });

  //Filtrado de productos usando el Set
  let materiales_filtrados = Lista_materiales.filter((material) =>
    idMaterialSeleccionado.has(String(material.id).trim())
  );

  console.log("Productos filtrados:", materiales_filtrados);

  if (materiales_filtrados.length === 0) {
    console.warn("No se encontraron productos coincidentes.");
  }
  return materiales_filtrados;
}

function select_proveedor() {
  const select_proveedor = document.getElementById(
    `proveedor_idproveedor${codigo}`
  );

  if (!select_proveedor) {
    console.error("No se encontraron los elementos del DOM.");
    return;
  }

  let view = `<option value="" disabled selected>Seleccione un grupo</option>`;

  Lista_proveedores.map((lista) => {
    view += `
            <option value="${lista.id}"> Proveedor: ${lista.nombre} || Codigo: ${lista.codigo} || Nit: ${lista.nit}</option>
        `;
  });
  select_proveedor.innerHTML = view;
}

function configurarSelect(idSelectBox, idSelectOptions, idSelectionInfo) {
  const selectBox = document.getElementById(idSelectBox);
  const selectOptions = document.getElementById(idSelectOptions);
  const selectionInfo = document.getElementById(idSelectionInfo);
  let selectedOptions = [];

  selectBox.addEventListener("click", function () {
    selectOptions.style.display =
      selectOptions.style.display === "block" ? "none" : "block";
  });

  selectOptions.addEventListener("click", function (event) {
    const clickedOption = event.target;

    if (clickedOption.tagName === "DIV") {
      const optionValue = clickedOption.getAttribute("data-value");
      const optionText = clickedOption.textContent;

      const optionIndex = selectedOptions.findIndex(
        (option) => option.material_idmaterial === Number(optionValue)
      );

      if (optionIndex === -1) {
        selectedOptions.push({
          material_idmaterial: Number(optionValue),
          text: optionText,
        });
        clickedOption.classList.add("selected");
      } else {
        selectedOptions.splice(optionIndex, 1);
        clickedOption.classList.remove("selected");
      }

      updateSelectionInfo();
      console.log("Opciones seleccionadas actualizadas:", selectedOptions);
    }
  });

  function updateSelectionInfo() {
    const totalOptions = document.querySelectorAll(
      `#${idSelectOptions} div`
    ).length;
    selectionInfo.textContent = `${selectedOptions.length} de ${totalOptions} productos seleccionados`;
  }

  document.addEventListener("click", function (event) {
    if (
      !selectBox.contains(event.target) &&
      !selectOptions.contains(event.target)
    ) {
      selectOptions.style.display = "none";
    }
  });

  // Solo retornamos el array de opciones seleccionadas sin verificar su contenido

  return selectedOptions;
}

function llenar_select_caracteristicas() {
  const select_div = document.querySelector(`#material_idmaterial${codigo}`);
  let a = {
    id: 33,
    fecha: "2024-08-23",
    hora: "17:19:45",
    nombre: "harina",
    estado: 0,
    codigo: "Ghsa",
    tipo: 10,
    medida: 53,
    seccion: 51,
    rubro_idrubro: 6,
  };
  let view = "",
    ind = 1;
  console.log(Lista_materiales);
  Lista_materiales.map((lista) => {
    view += `
            <div data-value="${lista.id}"> <span class="fw-bold text-primary">Nombre material:</span> ${lista.nombre} <span class="fw-bold text-primary">Codigo material:</span> ${lista.codigo}</div>
        `;
  });
  select_div.innerHTML = view;
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
  console.log(form);
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
function alertas(data) {
  console.log(data);
  // Definir las variables al principio
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "success") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 1500;
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
