import { URL_APIP } from "../../../../lib/services.js";
import * as listarFunctions from "../funciones/listar.js"; 
import * as registrarFuntions from "../funciones/registrar.js"; 
import * as fuG from "../funciones/generales.js"; 
import { codigos } from "./constantes.js";
import { Editar_fila_ } from "../funciones/editar_fila_.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let Lista_rescursos = [];

export function recursos_conf(code, permisos, refrescar) {
    app=document.querySelector(`#principal${codigos.codigoPrincipal}`);
    
    sitio();        
}

const codigo = codigos.codigoRecursos;
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
             
            listarFunctions.listar_api_general_verd("listado_recurso_riesgo",idEmpresa),
            
        ]);
        Lista_rescursos = resultados[0];
        console.log(Lista_rescursos);
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
        case "eliminar_recurso_riesgo":
            eliminar_recurso_riesgo(id1);
            break;
        case "editar_estado_unidad_producto":
            editar_estado_unidad_producto(event);
            break;
        case "editar_recurso_riesgo":
            toggleEditSave(event);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}
async function eliminar_recurso_riesgo(idrecurso_riesgo){
        if(confirm("Desea Eliminar..?")){
            const data = await listarFunctions.listar_api_general_verd('eliminar_recurso_riesgo',idrecurso_riesgo);
            console.log(data);
        
            if(data[0] === 'success' || data[0] === 'ok'){
                sitio();
                fuG.alertas(data,codigo);
            }
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
                field: 'nombre_recurso',
                validations: { required: true }
            },
           
            {
                index: 3,
                editable: true,
                type: 'text',
                field: 'ubicacion',
                validations: { required: true }
        
            }
        
        ];
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_rescursos, columnas, 'idrecurso_riesgo');
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
    
      const formData = new FormData();
      formData.append("verDavid", "editar_recurso_riesgo");
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

//registrar_recurso_riesgo        ,editar_recurso_riesgo      ,listado_recurso_riesgo    eliminar_recurso_riesgo
async function sitio(){

    let view=`
        <div class="container">
            
            <h5 class="text-center mb-4 fw-bold fs-6" >Recursos</h5>
            <form id="formulario${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                    
                    <div class="row">
                        <div class="col-md-6">

                            <label for="codigo" class="form-label">Codigo</label>
                            
                            <input type="text" s class="form-control" id="codigo" name="codigo"  required>
                        </div>
                        <div class="col-md-6">

                            <label for="nombre_recurso" class="form-label">Nombre recurso:</label>
                            
                            <input type="text" s class="form-control" id="nombre_recurso" name="nombre_recurso" required>
                        </div>
                       
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12">
                            <label for="ubicacion" class="form-label">Ubicación:</label>
                            <input type="text"  class="form-control" id="ubicacion" name="ubicacion" >
                            
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
                            <th scope="col">Nombre recurso</th>
                            <th scope="col">Ubicación</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listado_recurso_riesgo${codigo}">              
                    </tbody>
                </table>
            </div>
        </div>
    `;
    app.innerHTML=view;
    await listar();
    listado_recurso_riesgo();
    const forme = document.querySelector(`#formulario${codigo}`);
  
     forme.addEventListener("submit", async (e) => {
           e.preventDefault();
           const dato = new FormData(forme);
           dato.append('verDavid','registrar_recurso_riesgo');
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
  
    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e,table));
    const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup",(e)=> filtrar_table(e,input));
    const toggleButton = document.getElementById(`toggleButton${codigo}`);
    toggleButton.addEventListener("click", (e) => mostrarFormulario(e,toggleButton));
  
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


function listado_recurso_riesgo(){
    const table_body=document.querySelector(`#listado_recurso_riesgo${codigo}`);
    let view="",ind=1;
    Lista_rescursos.map(lista=>{
        

            view+=`
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.idrecurso_riesgo},codigo,codigo">${lista.codigo}</td>
                <td data-type="${lista.idrecurso_riesgo},nombre_recurso,nombre_recurso">${lista.nombre_recurso}</td>
                <td data-type="${lista.idrecurso_riesgo},ubicacion,ubicacion">${lista.ubicacion}</td>
                
                
                <td>
                    
                    <div class="d-flex gap-3">
                        <div class="text-center">
                            <a  data-id="editar_recurso_riesgo,${lista.idrecurso_riesgo}"
                            class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Editar ">
                                <i class="bi bi-pencil-square fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small"></span>
                        </div>
                        <div class="text-center">
                            <a  data-id="eliminar_recurso_riesgo,${lista.idrecurso_riesgo}" 
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Eliminar ">
                                <i class="bi bi-trash fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small"></span>
                        </div>
                        
                        
                        
                    </div>                             
                </td>
            </tr>`;
        })
        table_body.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuTabla);
        });
}

