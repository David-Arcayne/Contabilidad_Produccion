import { maquinaConfig } from "./maquina.js";
import { seccionconfig } from "./seccion.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 1;
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "Equipamiento";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}

export function equipamiento_config(code_, permisos_, refrescar_) {
    permisos = permisos_;
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));

    code = code_;
    refrescar = refrescar_;
    app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
        
    document.querySelector(`button[id^="refrescar"][id$="${code_}"]`).addEventListener('click', function() {
        switch(opcion) {
            case 1:
                seccionconfig(code,permisos,refrescar,codigo);
                opcion = 2;
                break;
            case 2:
                maquinaConfig(code,permisos,refrescar,codigo);
                opcion = 1;
                break;
            
            
            default:
                contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
                break;
        }
    });
    sitio();    
    
}

function sitio() {
    let view = `
        <div class="col-md-6 mb-3 " id="menu">
            <nav class="nav nav-pills nav-fill">
                <li class="nav-item">
                    <button class="nav-link active" data-section="equipamiento_seccion" style="background-color:blue; color:white;">Sección</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="equipamiento_maquina" style="background-color:white; color:black;">Tipo maquina</button>
                </li>
            </nav>
        </div>
        
        <div class="container" id="principal${codigo}">
           
            
        </div>
        
        <div id="content-area${codigo}"></div>
    `;
    app.innerHTML = view;

    seccionconfig(code,permisos,refrescar,codigo);

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
    const contentArea = document.getElementById(`content-area${codigo}`);
    contentArea.innerHTML = ''; 
    switch(section) {
        
        case 'equipamiento_seccion':
            seccionconfig(code,permisos,refrescar,codigo);
            opcion = 1;
            break;
        case 'equipamiento_maquina':
            maquinaConfig(code,permisos,refrescar,codigo);
            opcion = 2;
            break;
        
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}


