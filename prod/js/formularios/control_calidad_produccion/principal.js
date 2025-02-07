
import { control_calidad_produccion_pendiente } from "./pendientes.js";
import { control_calidad_produccion_encurso } from "./encurso.js"; 
import { control_calidad_produccion_finalizados } from "./finalizados.js";

import { codigos } from "./constantes.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let privilegios;
let code;
let permisos;
let refrescar;
const codigo =codigos.codigosPrincipal;
let section = "pendientes";

export function control_calidad_produccion(code_, permisos_, refrescar_) {
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


function sitio(){
    let view=`
    <h5 class="text-center mb-4 fw-bold fs-6"></h5>
    <div id="alerta${codigo}" class="mt-4"></div>

        <div class="row">
            <div class="col-md-4">
                <div class="p-3 bg-light border rounded">
                    <div class="col-md-6 mb-3 " id="menu">
                        <nav class="nav nav-pills nav-fill">
                            <li class="nav-item">
                                <button class="nav-link active" data-section="pendientes" style="background-color:blue; color:white;">Pendietes</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="encurso" style="background-color:white; color:black;">En curso</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="finalizados" style="background-color:white; color:black;">Finalizados</button>
                            </li>
                           
                        </nav>
                    </div>
                    
                    <div id="filtrar${codigo}" class="item-list" >
                       
                    </div>
                </div>
            </div>
            
            <div class="col-md-8">
                <div id="alerta${codigo}" class="mt-4"></div>
                <div class="p-3 bg-light border rounded" id="contenido${codigo}">
                    
                    
                </div>
                
            </div>
        </div>
    
    `;
    app.innerHTML=view;
    control_calidad_produccion_pendiente(code,permisos,refrescar);
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

function mostrarSeccion(section) {
    const contentArea = document.getElementById(`filtrar${codigo}`);
    contentArea.innerHTML = ''; 
    switch(section) {
        case 'pendientes':
            control_calidad_produccion_pendiente(code,permisos,refrescar);

            break;
        case 'finalizados':
            control_calidad_produccion_finalizados(code,permisos,refrescar);
            break;
        case 'encurso':
            control_calidad_produccion_encurso(code,permisos,refrescar);
            break;
        
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}


