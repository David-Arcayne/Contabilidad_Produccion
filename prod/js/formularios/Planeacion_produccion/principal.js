import * as listarFunctions from "../funciones/listar.js";
import { orden_produccion_en_curso } from "./ordenes/Lista_orden_produccion.js";
import { orden_produccion_finalizadas } from "./produccion_finalizadas/produccion_finalizadas.js";
import { codigos } from "./constantes.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigoPrincipal;
let Lista_rubro = [];
let section = "Planeación";

async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_api_general("listar_rubro",idEmpresa),
          
        ]);

        // Asignamos los resultados a las variables correspondientes
       Lista_rubro = resultados[0];
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}



export function planeacion_produccion_star(code_, permisos_, refrescar_) {
    code = code_;
    permisos = permisos_;
    refrescar = refrescar_;

    privilegios = [...permisos.toString()].map(digito => parseInt(digito));
    
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    
    sitio();    
    let recargar = document.querySelector(`button[id^="refrescar"][id$="${code_}"]`);
    recargar.addEventListener("click", ()=>{
        mostrarSeccion(section);
    });
}

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, ids] = dataid.split(',');
     console.log(funcion,id1);
 
    switch (funcion) {
        
        case "mostrar_control_calidad":
            mostrar_control_calidad(id1);
            break;
            
        case "generar_form_control_calidad":
            generar_form_control_calidad(id1,ids);
            break;
        default:
            sitio();
            break;
    }
}
export function funcion_para_vovelr(){
    sitio();
}
async function sitio(){
    let view=`
        <div class="row" >
            <div class="col-md-6 mb-3 " id="menu">
                <nav class="nav nav-pills nav-fill">
                    <li class="nav-item">
                        <button class="nav-link" data-section="Planeación" style="background-color: blue ; color:white;">Planeación</button>
                    </li>
                    
                    <li class="nav-item">
                        <button class="nav-link" data-section="produccion_finalizados" style="background-color:white; color:black;">Producción finalizados</button>
                    </li>
                </nav>
            </div>
            <div class="col-md-2 mb-3 " >
                <div class="row">
                    <select class="form-select" id="rubro_idrubro${codigo}" name="rubro_idrubro">
                        <option value="" disabled selected>Seleccione un rubro</option>
                    </select>
                </div>
            </div>
            <div id="alerta${codigos.codigoPrincipal}" class="mt-4"></div>
            <div id="content-area${codigo}" class="row"></div>
        </div>
        


    `;
    app.innerHTML=view;//nombre_lote
    await listar();
    llenar_select_rubro();
    orden_produccion_en_curso(code,permisos,refrescar,codigo);

    const navButtons = document.querySelectorAll('#menu .nav-link');
        navButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                navButtons.forEach(btn => {
                    btn.style.backgroundColor = 'white';
                    btn.style.color = 'black';
                });
                this.style.backgroundColor = 'blue';
                this.style.color = 'white';
                section = this.getAttribute('data-section');
                mostrarSeccion(section);
            });
        
        });
}
function llenar_select_rubro(){
    const rubro = document.getElementById(`rubro_idrubro${codigo}`);
    let view = "";
    Lista_rubro.map(lista=>{
        view +=`
             <option value="${lista.id}">${lista.rubro}</option>
        `;
    })
    rubro.innerHTML =  view;
}

function mostrarSeccion(section) {
    //const contentArea = document.getElementById(`filtrar${codigo}`);
   // contentArea.innerHTML = ''; 
    switch(section) {
        case 'solicitudes_materiales':
            solicitudes_material_produccion(code,permisos,refrescar);
            break;
        case 'Planeación':
            orden_produccion_en_curso(code,permisos,refrescar,codigo);
            break;
        case 'produccion_finalizados':
            orden_produccion_finalizadas(code,permisos,refrescar,codigo);
            break;
        default:
           // contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}


