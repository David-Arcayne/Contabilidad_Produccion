import { URL_APIP } from "../../../../lib/services.js";
import { solicitudes_productos_pendientes } from "./pendientes.js";
import { solicitudes_productos_En_curso } from "./En_curso.js";
import { solicitudes_productos_Finalizados } from "./finalizados.js";
import { solicitudes_productos_Negativos } from "./Negativos.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;

export function solicitudes_productos(code, permisos, refrescar) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
    
}
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "admin_sollicitudes";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}


function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "pendiente_enviar":
            pendiente_enviar();
            break;
        
        case "pendiente_editar":
            pendiente_editar(id1);
            break;
            
        case "mostrar_progreso_de_solicitud":
            mostrar_progreso_de_solicitud();
            break;
            
        case "mostrar_finalizados_desarrollo":
            mostrar_finalizados_desarrollo();
            break;
            
        case "negativos_mostrar":
            negativos_mostrar();
            break;
        default:
            sitio();
            break;
    }

}

function sitio(){
    
  let view = `
    
        <div class="col-md-6 mb-3 " id="menu">
            <nav class="nav nav-pills nav-fill">
                
                <li class="nav-item">
                    <button class="nav-link" data-section="pendientes" style="background-color:blue; color:white;">Pendientes</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="en_curso" style="background-color:white; color:black;">En curso</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="finalizados" style="background-color:white; color:black;">Finalizados</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="negativos" style="background-color:white; color:black;">Negativos</button>
                </li>
                
                
            </nav>
        </div>
        <div id="content-area${codigo}" style = " max-height: 620px; overflow-y: auto; display: block;"></div>
    
  `;
    app.innerHTML=view;
    
    solicitudes_productos_pendientes(code_,permisos_,refrescar_,codigo);


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

                const section = this.getAttribute('data-section');
                mostrarSeccion(section);
            });
        
        });
        
    
     
   
 }
 
function mostrarSeccion(section) {
    //const contentArea = document.getElementById(`filtrar${codigo}`);
   // contentArea.innerHTML = ''; 
    switch(section) {

        case 'pendientes':
            solicitudes_productos_pendientes(code_,permisos_,refrescar_,codigo);
            break;
        case 'en_curso':
            solicitudes_productos_En_curso(code_,permisos_,refrescar_,codigo);
            break;
        case 'finalizados':
            solicitudes_productos_Finalizados(code_,permisos_,refrescar_,codigo);            
            break;
        case 'negativos':
            solicitudes_productos_Negativos(code_,permisos_,refrescar_,codigo);
            break;
        
        default:
           // contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}
