import { codigos } from "./constantes.js";
import { registrar_distribucion } from "./distribucion/distribucion.js";
import { reporte_distribuciones } from "./reporte_distribuciones/reporte_distribuciones.js";
import * as listarFunctions from "../funciones/listar.js"
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 1;
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigoPrincipal;
let Lista_rubro = [];


export function distribucion_producto(code_, permisos_, refrescar_) {
    permisos = permisos_;
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));

    code = code_;
    refrescar = refrescar_;
    app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
        
    
    sitio();    
    
}

async function sitio() {
    let view = `
        <div class="row" >
            <div class="col-md-6 mb-3 " id="menu">
                <nav class="nav nav-pills nav-fill">
                    
                    
                </nav>
            </div>
            
        </div>   
        <div id="content-area${codigo}"></div>
    `;
    app.innerHTML = view;
  
    reporte_distribuciones(code,permisos,refrescar);

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
        
        case 'registrar_compra':
            registrar_compra(code,permisos,refrescar);
            opcion = 1;
            break;
        case 'compras':
            reporte_distribuciones(code,permisos,refrescar);
            opcion = 2;
            break;
        
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}

  