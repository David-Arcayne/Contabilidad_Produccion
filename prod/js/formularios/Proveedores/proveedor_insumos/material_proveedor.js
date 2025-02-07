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
let list_rubro = [];
let obt_rubro_aux = {
  id: 0,
  rubro: "",
  detalle: "",
};
const codigo = codigos.codigoAddMatPro;
let code ;
export function material_proveedor_config(code_, permisos, refrescar) {
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
      listarFunctions.listar_api_general("listar_rubro", idEmpresa),

    ]);

    // Asignamos los resultados a las variables correspondientes
    Lista_proveedores = resultados[0];
    Lista_materiales = resultados[1];
    list_tipoM = resultados[2];
    list_medida = resultados[3];

    Lista_mat_pro_reg = resultados[4];
    list_rubro = resultados[5];

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
function obtenerProveedoresPorMaterial(materialId) {
    const listaProveedores = Lista_mat_pro_reg
        .filter(proveedor => 
            proveedor.materiales.some(material => Number(material.material_idmaterial) === Number(materialId))
        )
        .map(proveedor => ({
            proveedor_id: proveedor.proveedor_idproveedor,
            nombre: proveedor.nombre,
            codigo: proveedor.codigo,
            nit: proveedor.nit
        }));
    return listaProveedores;
}
function parametros_extras(item){
  console.log(item);
  if(item['entidad'] === 'material'){
      const medida = list_medida.find((obj) => Number(obj.id) === Number(item.medida));
      document.getElementById(`material_idmaterial${codigos.codigo_material}`).value = item.id;
      document.getElementById(`medida${codigo}`).value = medida.nombre; 

      let resultado = obtenerProveedoresPorMaterial(Number(item.id));

    console.log(resultado);


    listarProveedor(resultado);

  }
             
}
function listarProveedor(resultado) {
    const listarr = document.querySelector(`#listaproveedor${codigo}`);
    let view = "",
      ind = 1;
    let proveedores_dis = Lista_proveedores.filter(proveedor => resultado.some(obj => Number(obj.proveedor_id) === Number(proveedor.id)));
    proveedores_dis.map((lista) => {
      let actualizar;
      let eliminar;
     
      view += `
            <tr>
              <td >${ind++}</td> 
              <td data-type="${lista.id},codigo,codigo">${lista.codigo}</td> 
              <td data-type="${lista.id},nombre,nombre">${lista.nombre}</td>               
                
               <td data-type="${lista.id},nit,nit">${lista.nit} </td>
               <td data-type="${lista.id},detalle,detalle">${lista.detalle}</td> 
               <td data-type="${lista.id},direccion,direccion">${lista.direccion}</td> 
               <td data-type="${lista.id},telefono,telefono">${lista.telefono}</td> 
               <td data-type="${lista.id},mobil,mobil">${lista.mobil}</td>  
               <td data-type="${lista.id},email,email">${lista.email}</td>  
               <td data-type="${lista.id},web,web">${lista.web}</td> 
               <td data-type="${lista.id},pais,pais">${lista.pais}</td>  
               <td data-type="${lista.id},ciudad,ciudad">${lista.ciudad}</td>           
               <td data-type="${lista.id},zona,zona">${lista.zona}</td>  
               <td data-type="${lista.id},contacto,contacto">${lista.contacto}</td>   
              
            
           </tr>
           `;
    });
    //  console.log(view);
    listarr.innerHTML = view;
  
    
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
            <h5 class="text-center mb-4 fw-bold fs-6" >Material-Proveedor</h5>

            <form id="formularioPM${codigo}">
                <input type="hidden" name="ver" value="registrar_proveedor_material">
                <input type="hidden" name="empresa" value="${
                  uk[0].empresa.idempresa
                }">
                <div class="row">
                    <div class=" col-md-6 border p-3 m-0 rounded">
                          <div class="row">
                                            
                              <div style="position: relative;" class="col-md-9">
                                  <input type="hidden" name="material_idmaterial" id="material_idmaterial${codigos.codigo_material}" required >

                                  <label for="material" class="form-label">Material-Insumo:</label>
                                  <input type="text" id="searchInput${codigos.codigo_material}" placeholder="Buscar..." class="form-control" name="material" required>
                                  <ul id="dropdownList${codigos.codigo_material}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                              </div>
                              <div class="col-md-3">
                                  <label for="medida" class="form-label">Medida:</label>
                                  <input type="text" class="form-control" id="medida${codigo}" name="medida" readonly required>
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

                <table class="table table-hover" id = "editableTable${codigo}">
                    <thead>
                        <tr class="table-dark">
                            <th>N°</th>
                            <th>Codigo</th>
                            <th>Nombre</th>
                            
                            <th>Nit</th>
                            <th>Detalle</th>
                            <th>Direccion</th>
                            <th>Telefono</th>
                            <th>Mobil</th>
                            <th>Email</th>
                            <th>Web</th>
                            <th>Pais</th>
                            <th>Ciudad</th>
                            <th>Zona</th>
                            <th>Contacto</th>
                            
                        </tr>
                    </thead>
                    <tbody id="listaproveedor${codigo}">
                        
                    </tbody>
                </table>
            </div>
        </div>
       
    `;
  await listar();
  app.innerHTML = view;
  console.log(Lista_materiales, Lista_proveedores);
  
  initializeDropdownSearch_m(codigos.codigo_material, Lista_materiales,'codigo','nombre',true,'material');
  
  
  const input = document.getElementById(`filtro${codigo}`);
  input.addEventListener("keyup", (e) => filtrar_table(e, input));
  
  

 
 


  const descargar = document.querySelector(`#pdf${codigo}`);
  descargar.addEventListener("click", descargar_pdf);
}

function descargar_pdf() {
  const idmaterial = document.getElementById(`material_idmaterial${codigos.codigo_material}`).value;
  let material = Lista_materiales.find(obj => Number(obj.id) === Number(idmaterial));
 const table_body = document.getElementById(`listaproveedor${codigo}`).innerHTML;
  console.log(material);
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
                      <h1 class="text-center mb-4 fw-bold fs-6 ">Lista Proveedores por Material</h1>
                    </div>
                    <div class="col">
                          <div class="row">
                              <h6 class="fw-bold text-primary mb-2">Material: ${material.codigo} ${material.nombre}</h6>
                          </div> 
                          
                      </div>
                     <div class="scrollable-table mt-4">

                        <table class="table table-hover" id = "editableTable${codigo}">
                            <thead>
                                <tr class="table-dark">
                                    <th>N°</th>
                                    <th>Codigo</th>
                                    <th>Nombre</th>
                                    
                                    <th>Nit</th>
                                    <th>Detalle</th>
                                    <th>Direccion</th>
                                    <th>Telefono</th>
                                    <th>Mobil</th>
                                    <th>Email</th>
                                    <th>Web</th>
                                    <th>Pais</th>
                                    <th>Ciudad</th>
                                    <th>Zona</th>
                                    <th>Contacto</th>
                                    
                                </tr>
                            </thead>
                            <tbody id="listaproveedor${codigo}">
                                ${table_body}
                            </tbody>
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

