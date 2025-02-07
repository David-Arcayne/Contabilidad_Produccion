import { URL_APIP } from "../../../../../lib/services.js";
import { codigos } from "../constantes.js";
import { Editar_table_fila } from "../../funciones/editar_fila_table.js";
import { Editar_tabla_celda } from "../../funciones/dbc_editar_celda_table.js";
import * as listarFunctions from "../../funciones/listar.js";
import { URL_APIE } from "../../../../../lib/services.js";
import * as modales from "../../funciones/modales/modal_registrar.js";

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
let code ;
export function proveedor_material_config(code_, permisos, refrescar) {
  code = code_;
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
    console.log(Lista_mat_pro_reg);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
function initializeDropdownSearch_m(codigo, Lista_Material,clave, valor, condicion, entidad) {
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
          const filtered = Lista_Material.filter(item =>
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
          populateDropdown(Lista_Material);  // Muestra todos los elementos inicialmente
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
          const filterLista = Lista_materiales.filter((obj) => !Lista_materiales_proveedores.some(list_mp => Number(list_mp.material_idmaterial) === Number(obj.id)) );
          const filtered = filterLista.filter(item =>
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
          const filterLista = Lista_materiales.filter((obj) => !Lista_materiales_proveedores.some(list_mp => Number(list_mp.material_idmaterial) === Number(obj.id)) );
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
  if(item['entidad'] === 'material'){
      const medida = list_medida.find((obj) => Number(obj.id) === Number(item.medida));
      document.getElementById(`material_idmaterial${codigos.codigo_material}`).value = item.id;
      document.getElementById(`medida${codigo}`).value = medida.nombre; 

      






  }else if (item['entidad'] === 'proveedor'){
      document.getElementById(`proveedor_idproveedor${codigos.codigo_proveedor}`).value = item.id;
      document.getElementById(`telefono${codigo}`).value = item.telefono; 

      Lista_materiales_proveedores = [];
      

      let Proveedor_Material_SELECT = Lista_mat_pro_reg.find((obj) =>Number(obj.proveedor_idproveedor) === Number(item.id));
      console.log(Proveedor_Material_SELECT);

      const resultado = {
        proveedor_idproveedor: Proveedor_Material_SELECT.proveedor_idproveedor,
        materiales: Proveedor_Material_SELECT.materiales.map((material) => ({
          idproveedor_has_material: material.idproveedor_has_material,
          material_idmaterial: material.material_idmaterial,
          proveedor_idproveedor: Proveedor_Material_SELECT.proveedor_idproveedor,
          empresa_idempresa: uk[0].empresa.idempresa,
        })),
      };

      console.log(resultado);
      let Lista_Elementos = listar_elementos_seleccionados(resultado.materiales);

      Lista_Elementos = Array.isArray(Lista_Elementos) ? Lista_Elementos : [];
      antes_Listar_Elementos(Lista_Elementos, resultado.materiales);
  }
             
}

const empresa = {
    nombre: uk[0].empresa.nombre,
    direccion: uk[0].empresa.direccion,
    ciudad: uk[0].empresa.ociudad || '',
    estado: uk[0].empresa.oestado || '',
    pais: uk[0].empresa.opais || '',
    logo: `${URL_APIE}${uk[0].empresa.logo}`,
    nit: uk[0].empresa.nit ? `NIT.: ${uk[0].empresa.nit}` : '',
    telefono: uk[0].empresa.telefono ? `Tel.: ${uk[0].empresa.telefono}` : '',
    celular : uk[0].empresa.ocelular ? `Cel.: ${uk[0].empresa.ocelular}` : '',
    email: uk[0].empresa.email || '',
    sitioWeb: uk[0].empresa.ositioweb || ''
};
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
                                  <input type="hidden" name="proveedor_idproveedor" id="proveedor_idproveedor${codigos.codigo_proveedor}" required>

                                  <label for="Proveedor" class="form-label">Proveedor:</label>
                                  <input type="text" id="searchInput${codigos.codigo_proveedor}" placeholder="Buscar..." class="form-control" name="Proveedor" required>
                                  <ul id="dropdownList${codigos.codigo_proveedor}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                              </div>
                              <div class="col-md-6">
                                  <label for="telefono" class="form-label">Telefono:</label>
                                  <input type="text" class="form-control" id="telefono${codigo}" name="telefono" required readonly >
                              </div>
                          </div>
                          
                    </div>
                    <div class=" col-md-6 border p-3 m-0 rounded">
                          <div class="row">
                                            
                              <div style="position: relative;" class="col-md-4">
                                  <input type="hidden" name="material_idmaterial" id="material_idmaterial${codigos.codigo_material}" required >

                                  <label for="material" class="form-label">Material-Insumo:</label>
                                  <input type="text" id="searchInput${codigos.codigo_material}" placeholder="Buscar..." class="form-control" name="material" required>
                                  <ul id="dropdownList${codigos.codigo_material}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                              </div>
                              <div class="col-md-3">
                                  <label for="medida" class="form-label">Medida:</label>
                                  <input type="text" class="form-control" id="medida${codigo}" name="medida" readonly required>
                              </div>
                              <div class="col-md-3">
                                  <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="agregar${codigos.codigo_material}" aria-label="generar">Agregar</button>
                              </div>
                          </div>
                          
                    </div>
                    
                </div>
            </form>
           <div id="alerta${codigos.codigoPrincipal}" class="mt-4"></div>
            <div class="col-md-12 mt-3 d-flex justify-content-between">
                  
                <div class="col-md-6">
                    <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
                      
                <button type="submit" data-id="descargar_pdf" class="btn btn-success" id="pdf${codigo}"> <i class="bi bi-filetype-pdf"></i> Generar Reporte</button>
            </div>
            <div class="scrollable-table mt-4">
              <table class="table table-hover" id="editableTableProvMat${codigo}">
                  <thead>
                      <tr class="table-dark">
                          <th scope="col">N°</th>
                          <th scope="col">Codigo</th>
                          <th scope="col">Material</th>
                          
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
  
 // initializeDropdownSearch(codigos.codigo_proveedor, Lista_proveedores,'nombre',false,'proveedor');
  initializeDropdownSearch_m(codigos.codigo_proveedor, Lista_proveedores,'codigo','nombre',true,'proveedor');
  initializeDropdownSearch_m(codigos.codigo_material, Lista_materiales,'codigo','nombre',true,'material');
  
  document.getElementById(`agregar${codigos.codigo_material}`).addEventListener("click", function () {
    const material = document.getElementById(`material_idmaterial${codigos.codigo_material}`);
    if (material.value) {
      let Lista_Elementos = listar_elementos_seleccionados([{'material_idmaterial':material.value}]);
      let lista_rgs = [];
      const select_proveedor = document.getElementById(`proveedor_idproveedor${codigos.codigo_proveedor}`);
      if (!select_proveedor.value) {
        alert("selecciones una proveedor de producción");
        return;
      }
     
        let aux = {
          idproveedor_has_material: 0,
          material_idmaterial: Number(material.value),
          proveedor_idproveedor: Number(select_proveedor.value),
          empresa_idempresa: uk[0].empresa.idempresa,
        };
        lista_rgs.push(aux);
      
      antes_Listar_Elementos(Lista_Elementos, lista_rgs);
    } else {
      alert("No ha seleccionado un material");
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
    const proveedor = document.getElementById(`proveedor_idproveedor${codigos.codigo_proveedor}`);
    

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



  const btn_cancelar = document.getElementById(`cancelar_${codigo}`);
  btn_cancelar.addEventListener("click", function () {
    sitio();
    vaciar_listas();
  });


  const descargar = document.querySelector(`#pdf${codigo}`);
  descargar.addEventListener("click", descargar_pdf);
}

function descargar_pdf() {
  const idproveedor = document.getElementById(`proveedor_idproveedor${codigos.codigo_proveedor}`).value;
  let proveedor = Lista_proveedores.find(obj => Number(obj.id) === Number(idproveedor));
  console.log(proveedor);
  modales.crearModalSoS({
          code: code,
          type:false,
          x:'1200px',
          y:'800px',
          id: `modal_stockmaterial${codigo}`,
          header: `  
              
             
  
          `,
          body: `
  
              <div  id="reporte${codigo}">
                <div class="row" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="company-info" style="text-align: left; flex: 1;">
                        <h6 style="font-size: 18px; font-weight: bold;">${empresa.nombre}</h6>
                        <p style="font-size: 14px;">${empresa.direccion} <br>
                        ${empresa.ciudad} <br>
                        ${empresa.estado} <br>
                        ${empresa.pais}</p>
                    </div>

                    <div class="logo" style="text-align: center; flex: 1;">
                        <img src="${empresa.logo}" alt="${empresa.nombre} logo" style="max-height: 100px;">
                    </div>
                    
                    <div class="contact-info" style="text-align: right; flex: 1;">
                        <h6 style="font-size: 18px; font-weight: bold;">${empresa.nit}</h6>
                        <p style="font-size: 14px;">${empresa.telefono} <br>
                        ${empresa.celular} <br>
                        <a href="${empresa.email}">${empresa.email}</a> <br>
                        <a href="${empresa.sitioWeb}">${empresa.sitioWeb}</a></p>
                    </div>
                    <div class="container" id="">
                      <h1 class="text-center mb-4 fw-bold fs-6 ">Lista Materiales por Proveedor</h1>
                    </div>
                    <div class="col">
                          <div class="row">
                              <h6 class="fw-bold text-primary mb-2">Proveedor: ${proveedor.codigo} ${proveedor.nombre}</h6>
                          </div> 
                          <div class="row">
                              <p class="col"><strong>Nit:</strong> ${proveedor.nit} </p>
                              <p class="col"><strong>Dirección:</strong> ${proveedor.direccion} </p>
                              <p class="col"><strong>Telefono:</strong> ${proveedor.telefono}</p>
                              <p class="col"><strong>Email:</strong> ${proveedor.email}</p>
                          </div>
                      </div>
                    <div class="container">
                         <table class="table table-hover" id="editableTableProvMat${codigo}">
                            <thead>
                                <tr class="table-dark">
                                    <th scope="col">N°</th>
                                    <th scope="col">Codigo</th>
                                    <th scope="col">Material</th>
                                    
                                    <th scope="col">Medida</th>
                                    <th scope="col">Tipo material</th>
                                  
                                </tr>
                            </thead>
                            <tbody id="listaProveedorMaterial"></tbody>
                        </table>
                    </div>
                    
                </div>
              </div>
  
          `,
          footerButtons: [
              
              {
                  id: `btnCancelar${codigo}`,
                  text: "Cancelar",
                  class: "btn btn-outline-secondary mr-1 mt-4",
                  onClick: () => '',
                  dismiss: true // Cierra el modal sin ejecutar ninguna acción
              },
              {
                  id: "btndescargar",
                  text: `<i class="bi bi-filetype-pdf"></i> PDF`,
                  class: "btn btn-outline-danger mr-1 mt-4",
                  onClick: () => {
                      const pdf = document.querySelector(`#reporte${codigo}`);
                      console.log(pdf);
                    
                      var opt = {
                          margin: 0.5,
                          filename: `${generarNombreArchivo()}.pdf`,
                          image: { type: 'jpeg', quality: 0.98 },
                          html2canvas: { scale: 2, letterRendering: true },
                          jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' } // Cambiado a 'landscape'
                      };
                    
                      html2pdf().set(opt).from(pdf).save();
  
                  },
                  dismiss: false // Esto cierra el modal cuando se hace clic
              },
          ]
          
      });
      listaProveedorMaterial();
      function generarNombreArchivo() {
        const prefijo = 'Proveedor_insumos';
        const now = new Date();
        const offset = -4; // Bolivia es UTC-4
        now.setHours(now.getHours() + offset);
        
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}:${seconds}`;
        
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;
      
        const nombre_archivo = `${prefijo}-${currentDate}-${currentTime}`;
      
        return nombre_archivo;
      }
      function listaProveedorMaterial() {
        const listar = document.getElementById(`listaProveedorMaterial`);
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
            <td >${lista.codigo}</td>             
             <td
             data-id="${lista.idproveedor_has_material}" 
             data-idprv="${lista.proveedor_idproveedor}" 
             data-idmat="${lista.material_idmaterial}"
             data-idemp="${lista.empresa_idempresa}"
             >${lista.nombre}</td>
            
             <td >${itemMedida.nombre}</td>
             <td>${itemTipo.nombre}</td>
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
}

function filtrar_materiales_proveedor(){
  console.log(Lista_materiales);
  console.log(Lista_materiales_proveedores);
  return Lista_materiales.filter((obj) => !Lista_materiales_proveedores.some(list_mp => Number(list_mp.material_idmaterial) === Number(obj.id)) );
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
        lista["idproveedor_has_material"] = item_seleccionado["idproveedor_has_material"];
        lista["proveedor_idproveedor"] = item_seleccionado["proveedor_idproveedor"];
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
      <td >${lista.codigo}</td>             
       <td
       data-id="${lista.idproveedor_has_material}" 
       data-idprv="${lista.proveedor_idproveedor}" 
       data-idmat="${lista.material_idmaterial}"
       data-idemp="${lista.empresa_idempresa}"
       >${lista.nombre}</td>
      
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
      `material_idmaterial en seleccionado:`,
      seleccionado.material_idmaterial
    );
  });
  // Crear el Set para la comparación
  const idProductosSeleccionados = new Set(
    List_select.map((seleccionado) =>
      String(seleccionado.material_idmaterial).trim()
    )
  );

  console.log(
    "ID material seleccionados en Set:",
    Array.from(idProductosSeleccionados)
  );

  //Inspección detallada de cada ID en ambas listas
  Lista_materiales.forEach((material) => {
    const productoId = String(material.id).trim();
    const encontrado = idProductosSeleccionados.has(productoId);
    console.log(
      `ID material: ${productoId} - ¿Encontrado en seleccionados?: ${encontrado}`
    );
  });

  //Filtrado de productos usando el Set
  let materiales_filtrados = Lista_materiales.filter((material) =>
    idProductosSeleccionados.has(String(material.id).trim())
  );

  console.log("material filtrados:", materiales_filtrados);

  if (materiales_filtrados.length === 0) {
    console.warn("No se encontraron materiales coincidentes.");
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
