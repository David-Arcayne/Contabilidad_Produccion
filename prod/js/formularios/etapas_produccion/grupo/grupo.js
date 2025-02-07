import { URL_APIP } from "../../../../../lib/services.js";
import * as listarFunctions from "../../funciones/listar.js";
import * as registrarFuntions from "../../funciones/registrar.js";
import { codigos } from "../constantes.js";
import { Editar_fila } from "../../funciones/editar_fila.js";
import { editarCelda } from "../../funciones/celda_editar.js";
import * as FuG from "../../funciones/generales.js"

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let Lista_Orden_Producciones =[];
let Lista_detalle_orden_produccion = [];
let Lista_empleados = [];
let Lista_productos =[];
let Lista_rubro = [];
let Lista_grupo_etapas = [];
let privilegios;
const codigo = codigos.codigosubmenu_grupo;



function manejarClick(event) {
  sitio();
  // Eliminar el evento click después de ejecutarlo
  event.target.removeEventListener("click", manejarClick);
}
export async function grupo_etapas(code, permisos, refrescar) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

    app=document.querySelector(`#content-area${codigos.codigoPrincipal}`);
    await listar();

    sitio();    
    
}
async function  listar_grupo_etapas(){
  Lista_grupo_etapas =  await listarFunctions.listar_grupo_etapas(uk[0].empresa.idempresa);
  listarGruposArray();
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.listar_grupo_etapas(idEmpresa),
            listarFunctions.listar_rubro(idEmpresa),
            
        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_grupo_etapas = resultados[1];
        Lista_rubro = resultados[2];

        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}



function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "editar_grupo_etapas":
            toggleEditSave(event);
            break;
        case "eliminar_grupo_etapas":
            eliminar_grupo_etapas(id1);
            break;
        default:
            sitio();
            break;
    }
    
}
async function eliminar_grupo_etapas(idgrupo_etapas){
    if(confirm("Esta seguro de eliminar....")){
      const data = await listarFunctions.listar_api_general_verd('eliminar_grupo_etapas',idgrupo_etapas);
      FuG.alertas(data,codigo);
      if(data[0] === 'success'){
        listar_grupo_etapas();
      }
    }
  }
async function toggleEditSave(event) {
  const permisos = [1];
  const opciones_select = [];
  const opciones_number = [];
  const names = ["nombre"];
  const names2 = ["nombre"];
  const id = "idgrupo_etapas";
    console.log(Lista_grupo_etapas);
  const resultado = await Editar_fila(event,codigo,Lista_grupo_etapas,permisos,names,names2,opciones_select,opciones_number,id);
  console.log(resultado);

  if (!resultado) {
    console.warn("No changes to save or operation cancelled.");
   
  }

  const formData = new FormData();
  formData.append("verDavid", "editar_grupo_etapas");
  formData.append('empresa',uk[0].empresa.idempresa );
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
    FuG.alertas(data,codigo);
    if(data[0] === "danger" || data[0] === "Error" ){
        setTimeout(() => {
            sitio();
            
          }, 2000);
    }
  } catch (error) {
    console.error("Error submitting data to the server:", error);
  }
}


async function edit_Celda_table(event) {
  const elementos_select = []; // Columnas que usan elementos <select>
  const elementos_number = []; // Columnas que usan campos numéricos
  

  const resultado = await editarCelda(event, Lista_grupo_etapas, codigo, elementos_select, elementos_number, 'idgrupo_etapas');
 
  console.log(resultado); 
  const formData = new FormData();
  formData.append('verDavid', "editar_grupo_etapas");
  formData.append('empresa',uk[0].empresa.idempresa );
  Object.entries(resultado).forEach(([key, value]) => {
      formData.append(key, value);
  });
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const data = await registrarFuntions.sendformData2(formData);
    console.log("Server response:", data);
    FuG.alertas(data,codigo);
    if(data[0] == "danger" || data[0] == "Error" ){
      sitio();
    }
  } catch (error) {
    console.error("Error submitting data to the server:", error);
  }

}
function listar_rubro() {
    console.log("listo");
  
    const listar2 = document.querySelector(
      `#rubro_idrubro${codigo}`
    );
    let view = "";
    Lista_rubro.map((lista) => {
      view += `
                  <option value="${lista.id}">${lista.rubro}</option>
              `;
    });
    listar2.innerHTML = view;
  }

async function sitio(){
    let view="",ind=1;
        view +=`
        <div class="container" >
           <h5 class="text-center mb-4 fw-bold fs-6" >Grupo Etapas</h5>
           <div class="col-md-3 mb-3 " >
                <div class="row">
                    <label for="rubro_idrubro" class="form-label">Linea de produccion:</label>
                    <select class="form-select" id="rubro_idrubro${codigo}" name="rubro_idrubro">
                        <option value="" disabled selected>Seleccione un rubro</option>
                        
                    </select>
                </div>
            </div>
            <form id="formulario${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                <input type="hidden" name="verDavid" value="registrar_grupo_etapa">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                <div class="row">
                    <div class="col-md-6">
                        <label for="nombre">Nombre grupo</label>
                        <input type="text" class="form-control" id="nombre${codigo}" placeholder="" name="nombre" required>
                    </div>
                </div>       
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="agre" >Guardar</button>
                <button type="reset" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn${codigo}" aria-label="Cancelar">Cancelar</button>              
            </form>
            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>

            <div id="alerta${codigo}" class="mt-4"></div>
            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
                
            </div>
            <div class="scrollable-table mt-4">

                <table class="table table-hover" id = "editableTable${codigo}">
                    <thead  >
                        <tr class="table-dark">
                            <th scope="col">N°</th>
                            <th scope="col">Grupo</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listarGrupos${codigo}">              
                    </tbody>
                </table>
            </div>
        </div>
       

        `;
        await listar();

     app.innerHTML=view;

     listar_rubro();

     const forme = document.querySelector(`#formulario${codigo}`);
     forme.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(forme);
        const data = await registrarFuntions.sendformData2(formData);
        FuG.alertas(data,codigo);
              if(data[0] === 'success'){
                listar_grupo_etapas();
              }
        // let Objeto_etapa_orden = {
        //     idgrupo_etapas: 0,
        //     nombre: document.getElementById(`nombre${codigo}`).value,
        //     empresa: uk[0].empresa.idempresa,
        //     etapas_ordenes: [],
        //     rubro_idrubro: document.getElementById(`rubro_idrubro${codigo}`).value,
        //     verDavid: "registrar_grupo_etapas_ordenados",
        //   };
        //   console.log(Objeto_etapa_orden);
        //   fetch(`${URL_APIP}api/`, {
        //     method: "POST", // Método HTTP
        //     headers: {
        //       "Usar-Registro-David": "true",
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(Objeto_etapa_orden), // Convertir el objeto JS a JSON antes de enviarlo
        //   })
        //     .then((response) => response.json()) // Procesar la respuesta en formato JSON
        //     .then((data) => {
        //       console.log(data);
              
        //     })
        //     .catch((error) => console.error("Error:", error));
     });
        
     const toggleButton = document.getElementById(`toggleButton${codigo}`);
     toggleButton.addEventListener("click", (e) =>
       mostrar_formulario(toggleButton)
     );  
    
    const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup", (e) => filtrar_table(e, input));
    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e));    
    listarGruposArray();

    document.getElementById(`rubro_idrubro${codigo}`).addEventListener('change',listarGruposArray);
     
   
 }
 function mostrar_formulario(toggleButton) {
    const myForm = document.querySelector(`#formulario${codigo}`);
  
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


  async function listarGruposArray() {
    const table_body = document.querySelector(`#listarGrupos${codigo}`);
    let view = "",
      ind = 1;
    let idrubro = document.getElementById(`rubro_idrubro${codigo}`).value;
    let filtrados = Lista_grupo_etapas.filter(obj => Number(obj.rubro_idrubro) === Number(idrubro));
    filtrados.map((lista) => {

      let actualizar = {
        0: ``,
        1: `        
              <div class="text-center">
                  <a data-id="editar_grupo_etapas,${lista.idgrupo_etapas}"
                  class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Editar ">
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
                <a  data-id="eliminar_grupo_etapas,${lista.idgrupo_etapas}"
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
                  <td data-type="${lista.idgrupo_etapas},nombre,nombre">${lista.nombre}</td>
                  
                  <td>
                      <div class="d-flex gap-3">
                          ${actualizar[privilegios[2]]}
                          ${lista.detalles.length === 0 ? eliminar[privilegios[3]]: ``}
                      </div>                    
                  </td>
              </tr>`;
    });
    table_body.innerHTML = view;
  
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach((enlace) => {
      enlace.addEventListener("click", menu);
    });
  }