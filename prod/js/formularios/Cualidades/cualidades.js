import { envasesconfig } from "./envases.js";
import { tipo_material } from "./tipo_material.js";
import { caracteristicasConfig } from "./caracteristicas.js";
import { producto_comercial_estado_config } from "./producto_comercial_estado.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 0;
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

export function cualidades_config(code_, permisos_, refrescar_) {
    permisos = permisos_;
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));

    code = code_;
    refrescar = refrescar_;
    app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
        
    document.querySelector(`button[id^="refrescar"][id$="${code_}"]`).addEventListener('click', function() {
        console.log(opcion);

        switch(opcion) {
            case 1:
                tipo_material(code,permisos,refrescar,codigo);
                return;
                break;
            case 2:
                envasesconfig(code,permisos,refrescar,codigo);
                return;
                break;    
            case 3:
                caracteristicasConfig(code,permisos,refrescar,codigo);
                return;
                break;
            case 4:
                producto_comercial_estado_config(code,permisos,refrescar,codigo);
                return;
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
                    <button class="nav-link active" data-section="cualidades_material" style="background-color:blue; color:white;">Tipo material</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="cualidades_envase" style="background-color:white; color:black;">Envases</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="cualidades_caracteristicas" style="background-color:white; color:black;">Caracteristicas cualificables</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="Estado_prod_terminado" style="background-color:white; color:black;">Estado Producto Terminado</button>
                </li>
            </nav>
        </div>
        
        <div class="container" id="principal${codigo}">
           
            
        </div>
        
        <div id="content-area${codigo}"></div>
    `;
    app.innerHTML = view;

    tipo_material(code,permisos,refrescar,codigo);

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
        case 'cualidades_material':
            tipo_material(code,permisos,refrescar,codigo);
            opcion = 1;
            break;
        case 'cualidades_envase':
            envasesconfig(code,permisos,refrescar,codigo);
            opcion = 2;
            break;    
        case 'cualidades_caracteristicas':
            caracteristicasConfig(code,permisos,refrescar,codigo);
            opcion = 3;
            break;
            
        case 'Estado_prod_terminado':
            producto_comercial_estado_config(code,permisos,refrescar,codigo);
            opcion = 4;
            break;
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}


