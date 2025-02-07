import { URL_APIP } from "../../../../lib/services.js";
import * as listarFunctions from "../funciones/listar.js"; 
import * as registrarFuntions from "../funciones/registrar.js"; 
import * as fuG from "../funciones/generales.js"; 
import { codigos } from "./constantes.js";
import { Editar_fila_ } from "../funciones/editar_fila_.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 1;
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigoProcedimiento;
let Lista_empleados = [];
let Lista_riesgo = [];
let Lista_emergencia = [];
export function contingencia_emergencia(code_, permisos_, refrescar_) {
    code = code_;
    permisos =  permisos_;
    refrescar = refrescar_;
    app=document.querySelector(`#principal${codigos.codigoPrincipal}`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener("click", function () {
        sitio();
      });
    sitio();    
    
}
function menuTabla(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const forme = document.querySelector(`#alerta`);
    switch (funcion) {
        case "eliminar_emergencia":
            eliminar_emergencia(id1);
            break;
        case "editar_estado_unidad_producto":
            editar_estado_unidad_producto(event);
            break;
        case "editar_emergencia":
            toggleEditSave(event);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }


}
async function eliminar_emergencia(idemergencia){
    if(confirm("Desea Eliminar..?")){
        const data = await listarFunctions.listar_api_general_verd('eliminar_emergencia',idemergencia);
        console.log(data);
        fuG.alertas(data,codigo);
        if(data[0] === 'success' || data[0] === 'ok'){
            sitio();
        }
    }
   
}
async function toggleEditSave(event){
    let a = {
        "idemergencia": "1",
        "fecha_inicio": "2025-01-07",
        "hora_inicio": "18:04:00",
        "horas": "3",
        "descripcion": "prensado.",
        "empleado_idempleado": "54",
        "riesgo_idriesgo": "5"
    }
    const columnas = [
            {
                index: 2,
                editable: true,
                type: 'date',
                field: 'fecha_inicio',
                validations: { required: true }
            },
            {
                index: 3,
                editable: true,
                type: 'time',
                field: 'hora_inicio',
                validations: { required: true }
            },
           
            {
                index: 4,
                editable: true,
                type: 'number',
                field: 'horas',
                validations: { required: true }
        
            },
            {
                index: 5,
                editable: true,
                type: 'text',
                field: 'descripcion',
                validations: { required: true }
            }
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_emergencia, columnas, 'idemergencia');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
    
      const formData = new FormData();
      formData.append("verDavid", "editar_emergencia");
      formData.append("empresa_idempresa", uk[0].empresa.idempresa);

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

async function listar() {
    try {
      const idEmpresa = uk[0].empresa.idempresa;
      const idsucursal = uk[0].empresa.idsucursal;

      // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
      const resultados = await Promise.all([
        listarFunctions.listar_api_general('get_trabajador_sucursal',idsucursal),
        listarFunctions.listar_api_general_verd("listado_riesgo",idEmpresa),
        listarFunctions.listar_api_general_verd("listado_emergencia",idEmpresa),
        
                    
      ]);
      // Asignamos los resultados a las variables correspondientes
      Lista_empleados = resultados[0];
      Lista_riesgo =resultados[1];
      Lista_emergencia = resultados[2];
      console.log(Lista_empleados);
    } catch (error) {
      console.error("Error al listar datos: ", error);
      throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
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
  function initializeDropdownSearch_(codigo, Lista_Material,clave, valor, condicion,entidad) {
    const searchInput = document.getElementById(`searchInput${codigo}`);
    const dropdownList = document.getElementById(`dropdownList${codigo}`);
  
    // Crear la lista inicial
    function populateDropdown(filteredItems) {
        dropdownList.innerHTML = ''; // Limpia la lista
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent =item [clave] + " : "+item[valor];
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
                
                searchInput.value = item [clave] +" : "+ item[valor] ;
                
                
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
  if(item['entidad'] === 'riesgo'){
    document.getElementById(`riesgo_idriesgo${codigos.codigoRiesgos}`).value = item.idriesgo;

      

  }else if (item['entidad'] === 'empleado'){
      document.getElementById(`empleado_idempleado${codigos.codigo_empleado}`).value = item.idtrabajador;
  }
             
}

async function sitio(){
    
     let view = `
    <div class="continer">
        <div class="row">

            <form id="formulario${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                
                <div class="row">
                    <div class=" col-md-6 border p-3 m-0 rounded">
                            <div class="row">
                                            
                                <div style="position: relative;" class="col-md-12">
                                    <input type="hidden" name="riesgo_idriesgo" id="riesgo_idriesgo${codigos.codigoRiesgos}" required>

                                    <label for="riesgos" class="form-label">Riesgos:</label>
                                    <input type="text" id="searchInput${codigos.codigoRiesgos}" placeholder="Buscar..." class="form-control" name="riesgos" required>
                                    <ul id="dropdownList${codigos.codigoRiesgos}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                                </div>
                                
                            </div>
                            
                    </div>
                    <div class=" col-md-6 border p-3 m-0 rounded">
                            <div class="row">
                                            
                                <div style="position: relative;" class="col-md-12">
                                    <input type="hidden" name="empleado_idempleado" id="empleado_idempleado${codigos.codigo_empleado}" required >

                                    <label for="empleado" class="form-label">Empleado</label>
                                    <input type="text" id="searchInput${codigos.codigo_empleado}" placeholder="Buscar..." class="form-control" name="empleado" required>
                                    <ul id="dropdownList${codigos.codigo_empleado}" style="position: absolute; top: 100%; left: 0; right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                                </div>
                                
                                
                            </div>
                            
                    </div>
                    
                </div>
                <div class="row">
                    <div class=" col-md-12 border p-3 m-0 rounded">
                        <div class="row">
                            <div class="col-md-4">
                                <label for="fecha_inicio" class="form-label">Fecha:</label>
                                <input type="date" id="fecha_inicio${codigo}"  class="form-control" name="fecha_inicio" required>
                            </div>
                            <div class="col-md-4">
                                <label for="hora_inicio" class="form-label">Hora comienzo:</label>
                                <input type="time" id="hora_inicio${codigo}"  class="form-control" name="hora_inicio" required>
                            </div>
                            <div class="col-md-4">
                                <label for="horas" class="form-label">Horas:</label>
                                <input type="number" step="0.01" id="horas${codigo}"  class="form-control" name="horas" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12">

                                <label for="descripcion" class="form-label">Descripción</label>
                                <textarea class="form-control" id="descripcion" name="descripcion" rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-end mt-4">
                    <button type="submit" class="btn btn-outline-success me-2" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                    <button type="reset" class="btn btn-outline-primary" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>
                </div> 
            </form>
        </div> 

         <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>

            <div id="alerta${codigo}" class="mt-4"></div>
            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
                
            </div>
        

        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Codigo riesgo</th>
                    <th scope="col">Fecha inicio</th>
                    <th scope="col">Hora inicio</th>
                    <th scope="col">Horas</th>
                    <th scope="col">Descripción</th>
                    <th scope="col">Trabajador</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="listado_emergencia${codigo}">
              
            </tbody>
        </table>
        
    </div>`;
    app.innerHTML=view;
    await listar();
    listado_emergencia();
    initializeDropdownSearch_(codigos.codigoRiesgos, Lista_riesgo,'codigo','descripcion',true,'riesgo');
    initializeDropdownSearch_m(codigos.codigo_empleado, Lista_empleados,'ci','nombre','apellido',false,'empleado');
    document.getElementById(`fecha_inicio${codigo}`).value = fuG.fechaBolivia();
    document.getElementById(`hora_inicio${codigo}`).value = fuG.horasBolivia_input();
//registrar_emergencia                    editar_emergencia                      listado_emergencia         eliminar_emergencia


    const forme = document.querySelector(`#formulario${codigo}`);
      
        forme.addEventListener("submit", async (e) => {
            e.preventDefault();
            const dato = new FormData(forme);
            dato.append('verDavid','registrar_emergencia');
            dato.append('empresa_idempresa',uk[0].empresa.idempresa);
            for (let [key, value] of dato.entries()) {
                console.log(key, value);
            }
            const data = await registrarFuntions.sendformData2(dato);
            
            if(data[0] === 'success' || data[0] === "ok"){
                sitio();
                fuG.alertas(data,codigo);
            }
            console.log(data);
        });

    const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup",(e)=> filtrar_table(e,input));

    const toggleButton = document.getElementById(`toggleButton${codigo}`);
    toggleButton.addEventListener("click", (e) => mostrarFormulario(e,toggleButton));
 }
function listado_emergencia(){
    const table_body = document.getElementById(`listado_emergencia${codigo}`);
    let view = "", ind = 1;
    let a = {
        "idemergencia": "1",
        "fecha_inicio": "2025-01-07",
        "hora_inicio": "18:04:00",
        "horas": "3",
        "descripcion": "prensado.",
        "empleado_idempleado": "54",
        "riesgo_idriesgo": "5"
    }
    Lista_emergencia.map(lista => {
        let item_riesgo = Lista_riesgo.find(obj => Number(obj.idriesgo) === Number(lista.riesgo_idriesgo));
        let item_empleado = Lista_empleados.find(obj => Number(obj.idtrabajador) === Number(lista.empleado_idempleado))
        view += `
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.idemergencia},riesgo_idriesgo,riesgo_idriesgo">${item_riesgo.codigo}</td>
                <td data-type="${lista.idemergencia},fecha_inicio,fecha_inicio">${lista.fecha_inicio}</td>
                <td data-type="${lista.idemergencia},hora_inicio,hora_inicio">${lista.hora_inicio}</td>
                <td data-type="${lista.idemergencia},horas,horas">${lista.horas}</td>
                <td data-type="${lista.idemergencia},descripcion,descripcion">${lista.descripcion}</td>
                <td data-type="${lista.idemergencia},empleado_idempleado,empleado_idempleado">${item_empleado.nombre} ${item_empleado.apellido}</td>
               
             
                <td>
                    
                    <div class="d-flex gap-3">
                        <div class="text-center">
                            <a  data-id="editar_emergencia,${lista.idemergencia}"
                            class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Editar">
                                <i class="bi bi-pencil-square fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small"></span>
                        </div>
                        <div class="text-center">
                            <a  data-id="eliminar_emergencia,${lista.idemergencia}" 
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Eliminar">
                                <i class="bi bi-trash fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small"></span>
                        </div>
                        
                        
                        
                    </div>                             
                </td>
            </tr>
        `;
    })
    table_body.innerHTML = view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuTabla);
    });
 }
 function mostrarFormulario(e,toggleButton){
    const myForm = document.querySelector(`#formulario${codigo}`);

    if (myForm.style.display === "none" || myForm.style.height === "0px") {
        myForm.style.display = "block";
        setTimeout(() => {
            myForm.style.height = myForm.scrollHeight + "px";
            myForm.style.opacity = 1;
        }, 10);  // Un pequeño retraso para asegurar que la transición ocurra
        toggleButton.innerHTML = '<i class="bi bi-dash-lg danger"></i>';
    } else {
        myForm.style.height = "0";
        myForm.style.opacity = 0;
        setTimeout(() => {
            myForm.style.display = "none";
        }, 500);  // Esperar a que termine la transición
        toggleButton.innerHTML = '<i class="bi bi-plus"></i>';
    }

}
function filtrar_table(e,input){
    const table = document.getElementById(`editableTable${codigo}`);
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = tbody.getElementsByTagName('tr');
    input.addEventListener('keyup', function() {
        const filter = input.value.toLowerCase();

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let cells = row.getElementsByTagName('td');
            let rowText = '';

            for (let j = 0; j < cells.length; j++) {
                rowText += cells[j].textContent.toLowerCase() + ' ';
            }

            if (rowText.includes(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}







