
import { codigos } from "./constantes.js";
import { riesgos_conf } from "./riesgos.js";
import { recursos_conf } from "./recursos.js";
import { contigencia_procedimiento } from "./procedimientos.js";
import { contingencia_emergencia } from "./emergencia.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 1;
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigoPrincipal;
let section = "mensurable_contingencias";



export function contingencias_conf(code_, permisos_, refrescar_) {
    permisos = permisos_;
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));

    code = code_;
    refrescar = refrescar_;
    app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
        
    
    sitio();    
    let recargar = document.querySelector(`button[id^="refrescar"][id$="${code_}"]`);
    recargar.addEventListener("click", ()=>{
        mostrarSeccion(section);
    });
    
}
function sitio() {
    let view = `
        <div class="col-md-6 mb-3 " id="menu">
            <nav class="nav nav-pills nav-fill">
                
                <li class="nav-item">
                    <button class="nav-link" data-section="mensurable_contingencias" style="background-color:white; color:black;">Contingencias</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="mensurable_recursos_contingencias" style="background-color:white; color:black;">Recursos Contingencias</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="mensurable_procedimiento" style="background-color:white; color:black;">Procedimiento</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="mensurable_emergenccia" style="background-color:white; color:black;">Reportar</button>
                </li>
            </nav>
        </div>
        
        <div class="container" id="principal${codigo}">
        
            
        </div>
        
        <div id="content-area${codigo}"></div>
    `;
    app.innerHTML = view;

    riesgos_conf(code,permisos,refrescar);

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
    const contentArea = document.getElementById(`content-area${codigo}`);
    contentArea.innerHTML = ''; 
    switch(section) {
        case 'mensurable_emergenccia':
            contingencia_emergencia(code,permisos,refrescar);
            opcion = 4;
            break;
        case 'mensurable_contingencias':
            riesgos_conf(code,permisos,refrescar);
            opcion = 4;
            break;
        case 'mensurable_procedimiento':
            contigencia_procedimiento(code,permisos,refrescar);
            opcion = 4;
            break;
        case 'mensurable_recursos_contingencias':
            recursos_conf(code,permisos,refrescar);
            opcion = 4;
            break;
      
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}


