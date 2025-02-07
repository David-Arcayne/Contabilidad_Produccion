import * as listarFunctions from "../../funciones/listar.js";
import { registrar_mantenimiento } from "./mantenimiento.js";
import { tareas_mantenimiento } from "./tareas_mantenimiento.js";

import { codigos } from "./constantes.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";

let privilegios;
let code;
let permisos;
let refrescar;
let section = "mantenimiento";

let Lista_rubro = [];

export function mantenimiento_maquinas(code_, permisos_, refrescar_) {
  privilegios = [...permisos_.toString()].map((digito) => parseInt(digito));
  permisos = permisos_;
  code = code_;
  refrescar = refrescar_;
  app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);

  let recargar = document.querySelector(`button[id^="refrescar"][id$="${code_}"]`);
  recargar.addEventListener("click", ()=>{
      mostrarSeccion(section);
  });
  sitio();
}


async function sitio() {
  let view = `
    <div class="row" >
        <div class="col-md-6 mb-3 " id="menu">
            <nav class="nav nav-pills nav-fill">
                <li class="nav-item">
                    <button class="nav-link active" data-section="mantenimiento" style="background-color:blue; color:white;">Mantenimiento</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="tareas_mantenimiento" style="background-color:white; color:black;">Tareas</button>
                </li>
              
                
            </nav>
            
        </div>
        

    </div>    
     <div id="alerta${codigos.codigoprincipal}"></div>    
        
        <div id="content-area${codigos.codigoprincipal}"></div>
    `;
  app.innerHTML = view;
 

  registrar_mantenimiento(code,permisos,refrescar);



  const navButtons = document.querySelectorAll("#menu .nav-link");

  navButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      navButtons.forEach((btn) => {
        btn.style.backgroundColor = "white";
        btn.style.color = "black";
      });
      this.style.backgroundColor = "blue";
      this.style.color = "white";
      section = this.getAttribute("data-section");
      mostrarSeccion(section);
    });
  });
}

function mostrarSeccion(section) {
  const contentArea = document.getElementById(`content-area${codigos.codigoprincipal}`);
  contentArea.innerHTML = "";
  switch (section) {
    case "mantenimiento":
      registrar_mantenimiento(code,permisos,refrescar);
      break;
    case "tareas_mantenimiento":
      tareas_mantenimiento(code,permisos,refrescar);

      break;
    case "calendario_mantenimiento":
      alert('calendario_mantenimiento');

      break;
    
    default:
      contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
      break;
  }
}


