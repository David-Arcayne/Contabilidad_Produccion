import { URL_APIP } from "../../../../lib/services.js";
import * as listarFunctions from "../funciones/listar.js"; 
import * as registrarFuntions from "../funciones/registrar.js"; 
import * as fuG from "../funciones/generales.js"; 
import { codigos } from "./constantes.js";
import { Editar_fila_ } from "../funciones/editar_fila_.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let Lista_Maquina = [];
let Lista_secciones = [];
let Lista_Material = [];
let Lista_Productos = [];
let Lista_riesgo = [];
export function riesgos_conf(code, permisos, refrescar) {
    app=document.querySelector(`#principal${codigos.codigoPrincipal}`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();        
}

const codigo = codigos.codigoRiesgos;

async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
           
           
            listarFunctions.listar_api_general("listar_material",idEmpresa),
            listarFunctions.listar_api_general("listar_productos_comercial",idEmpresa),
            listarFunctions.listar_api_general("listar_maquina",idEmpresa),
            listarFunctions.listar_api_general("listarseccion",idEmpresa),
            listarFunctions.listar_api_general_verd("listado_riesgo",idEmpresa),
            
            

            
        ]);
        Lista_Material = resultados[0];
        Lista_Productos = resultados[1];
        Lista_Maquina = resultados[2];
        Lista_secciones = resultados[3];


        Lista_riesgo = resultados[4];
        if(Lista_riesgo.length === 0){
            Lista_riesgo = [
                {
                  "idriesgo": 1,
                  "codigo": "R001",
                  "descripcion": "Riesgo de producción",
                  "probabilidad": 0.8,
                  "impacto": 0.6,
                  "tipo_variable": "maquina",
                  "idtipo_variable": 101,
                  "empresa_idempresa": 1
                },
                {
                  "idriesgo": 2,
                  "codigo": "R002",
                  "descripcion": "Riesgo logístico",
                  "probabilidad": 0.5,
                  "impacto": 0.7,
                  "tipo_variable": "material",
                  "idtipo_variable": 203,
                  "empresa_idempresa": 1
                },];
        }
        console.log(Lista_riesgo);
        console.log(Lista_Material,Lista_Productos,Lista_Maquina,Lista_secciones);
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}

function menuTabla(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const forme = document.querySelector(`#alerta`);
    switch (funcion) {
        case "eliminar_riesgo":
            eliminar_riesgo(id1);
            break;
        case "editar_estado_unidad_producto":
            editar_estado_unidad_producto(event);
            break;
        case "editar_riesgo":
            toggleEditSave(event);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }


}

async function toggleEditSave(event){
    const columnas = [
            {
                index: 1,
                editable: true,
                type: 'text',
                field: 'codigo',
                validations: { required: true }
            },
            {
                index: 2,
                editable: true,
                type: 'text',
                field: 'descripcion',
                validations: { required: true }
            },
           
            {
                index: 3,
                editable: true,
                type: 'number',
                field: 'probabilidad',
                validations: { required: true }
        
            },
            {
                index: 4,
                editable: true,
                type: 'number',
                field: 'impacto',
                validations: { required: true }
            }
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_riesgo, columnas, 'idriesgo');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
    
      const formData = new FormData();
      formData.append("verDavid", "editar_riesgo");
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
async function eliminar_riesgo(idriesgo){
    if(confirm("Desea Eliminar..?")){
        const data = await listarFunctions.listar_api_general_verd('eliminar_riesgo',idriesgo);
        console.log(data);
        fuG.alertas(data,codigo);
        if(data[0] === 'success' || data[0] === 'ok'){
            sitio();
        }
    }
   
}



async function sitio(){

    let view=`
        <div class="container">
            
            <h5 class="text-center mb-4 fw-bold fs-6" >Riesgos</h5>
            <form id="formulario${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                

                    <div class="row">
                        <div class="col-md-12">

                            <label for="codigo" class="form-label">Codigo</label>
                            
                            <input type="text" s class="form-control" id="codigo" name="codigo" placeholder="Ej. ADXC123">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">

                            <label for="descripcion" class="form-label">Descripción</label>
                            <textarea class="form-control" id="descripcion" name="descripcion" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="impacto" class="form-label">Impacto</label>
                            <input type="number" step="0.01" class="form-control" id="impacto" name="impacto" placeholder="Ej. 1.0">
                            
                        </div>
                        <div class="col-md-6">
                            <label for="probabilidad" class="form-label">Probabilidad</label>
                            <input type="number" step="0.01" class="form-control" id="probabilidad" name="probabilidad" placeholder="Ej. 0.5">
                            
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <label for="tipo_variable">Variable:</label>
                            <select class="form-select" id="tipo_variable${codigo}" name="tipo_variable" required>
                                <option value="" disabled selected>Seleccione una opción</option>

                                <option value="maquina">Maquina</option>
                                <option value="seccion">Sección</option>
                                <option value="material">Material</option>
                                <option value="producto">Producto</option>
                            </select>
                            
                        </div>
                        <div class="col-md-6">
                            <label for="idtipo_variable">Opciones:</label>
                            <select class="form-select" id="idtipo_variable${codigo}" name="idtipo_variable" required>
                                
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
            <div class="scrollable-table mt-4" >

                <table class="table table-hover" id = "editableTable${codigo}">
                    <thead>
                        <tr class="table-dark">
                            <th scope="col">N°</th>
                            <th scope="col">Codigo</th>
                            <th scope="col">Descripcion</th>
                            <th scope="col">Probabilidad</th>
                            <th scope="col">Impacto</th>
                            <th scope="col">Tipo variable</th>
                            <th scope="col">Variable</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_riesgo${codigo}">              
                    </tbody>
                </table>
            </div>
        </div>
    `;
    await listar();
    app.innerHTML=view;
    listar_riesgos();
    const tipo_variable = document.getElementById(`tipo_variable${codigo}`);
    tipo_variable.addEventListener('change',mostrarVariable)


    const forme = document.querySelector(`#formulario${codigo}`);
  
    forme.addEventListener("submit", async (e) => {
        e.preventDefault();
        const dato = new FormData(forme);
        dato.append('verDavid','registrar_riesgo');
        dato.append('empresa_idempresa',uk[0].empresa.idempresa);
        for (let [key, value] of dato.entries()) {
            console.log(key, value);
        }
        const data = await registrarFuntions.sendformData2(dato);
        fuG.alertas(data,codigo);
        if(data[0] === 'success' || data[0] === "ok"){
            sitio();

        }
        console.log(data);
    });
  
    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e,table));
    const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup",(e)=> filtrar_table(e,input));
    const toggleButton = document.getElementById(`toggleButton${codigo}`);
    toggleButton.addEventListener("click", (e) => mostrarFormulario(e,toggleButton));
  
}
function mostrarVariable(){
    let variable = document.getElementById(`tipo_variable${codigo}`).value;
    switch (variable) {
        case 'maquina':
            listarVariable(Lista_Maquina,'id','nombre');
            break;
        case 'seccion':
            listarVariable(Lista_secciones,'id','codigo_seccion','nombre_seccion');
            break;
        case 'material':
            listarVariable(Lista_Material,'id','codigo','nombre');
            break;
        case 'producto':
            listarVariable(Lista_Productos,'idproduct_comercial','codigo','nombre');
            break;
    
        default:
            break;
    }
}
function listarVariable(Lista,idelemento,nom1,nom2){
    let opciones = document.getElementById(`idtipo_variable${codigo}`);
    let view = "";
    Lista.map(lista =>{
        view += `
        <option value="${lista[idelemento]}">${lista[nom1]} ${lista[nom2]}</option>
        `;
    })
    
    opciones.innerHTML = view;
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
function Entidad_item(valor,idEntidad){
    switch (valor) {
        case 'maquina':
            return Lista_Maquina.find(obj=> Number(obj.id) === Number(idEntidad))['nombre'];
            break;
        case 'seccion':
            return Lista_secciones.find(obj=> Number(obj.id) === Number(idEntidad))['nombre_seccion'];
            break;
        case 'material':
            return Lista_Material.find(obj=> Number(obj.id) === Number(idEntidad))['nombre'];
            break;
        case 'producto':
            return Lista_Productos.find(obj=> Number(obj.idproduct_comercial) === Number(idEntidad))['nombre'];
            break;
    
        default:
            return [null];
            break;
    }
}

function listar_riesgos(){
    const table_body = document.querySelector(`#listar_riesgo${codigo}`);
    let view="",ind=1;
        Lista_riesgo.map(lista=>{
            let item_entidad = Entidad_item(lista.tipo_variable,lista.idtipo_variable)
            let a = {
                "idriesgo": "1",
                "codigo": "892hihsda",
                "descripcion": "descripcones",
                "probabilidad": "32",
                "impacto": "21",
                "tipo_variable": "maquina",
                "idtipo_variable": "44"
            };

            view+=`
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.idriesgo},codigo,codigo">${lista.codigo}</td>
                <td data-type="${lista.idriesgo},descripcion,descripcion">${lista.descripcion}</td>
                <td data-type="${lista.idriesgo},probabilidad,probabilidad">${lista.probabilidad}</td>
                <td data-type="${lista.idriesgo},impacto,impacto">${lista.impacto}</td>
                <td data-type="${lista.idriesgo},tipo_variable,tipo_variable">${lista.tipo_variable}</td>
                <td data-type="${lista.idriesgo},idtipo_variable,idtipo_variable">${item_entidad}</td>
               
             
                <td>
                    
                    <div class="d-flex gap-3">
                        <div class="text-center">
                            <a  data-id="editar_riesgo,${lista.idriesgo}"
                            class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Editar">
                                <i class="bi bi-pencil-square fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small"></span>
                        </div>
                        <div class="text-center">
                            <a  data-id="eliminar_riesgo,${lista.idriesgo}" 
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Eliminar">
                                <i class="bi bi-trash fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small"></span>
                        </div>
                        
                        
                        
                    </div>                             
                </td>
            </tr>`;
        })
        table_body . innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuTabla);
        });
}

