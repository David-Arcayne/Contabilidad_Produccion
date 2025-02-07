import { codigos } from "./constantes.js";
import { registrar_proveedor } from "./registrar/registra.js";
import { proveedor_material_config } from "./proveedor_insumos/provedor_material.js";
import { material_proveedor_config } from "./proveedor_insumos/material_proveedor.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";

let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigoPrincipal;
let section = "registrar_proveedor";


export function proveedor_config(code_, permisos_, refrescar_) {
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
                    <button class="nav-link active" data-section="registrar_proveedor" style="background-color:blue; color:white;">Provedores</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="proveedor_material" style="background-color:white; color:black;">Proveedor-Material</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="material_proveedor" style="background-color:white; color:black;">Material-Proveedor</button>
                </li>
            </nav>
        </div>
        
        <div id="content-area${codigo}"></div>
    `;
    app.innerHTML = view;
    registrar_proveedor(code,permisos,refrescar);


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
        
        case 'registrar_proveedor':
            registrar_proveedor(code,permisos,refrescar);
          
            break;
        case 'proveedor_material':
            proveedor_material_config(code,permisos,refrescar);
        
            break;
        case 'material_proveedor':
            material_proveedor_config(code,permisos,refrescar);
        
            break;
        
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}


