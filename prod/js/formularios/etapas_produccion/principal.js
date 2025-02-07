import { registrar_etapa_produccion } from "./etapas_produccion/registrar_etapa.js";
import { grupo_etapas } from "./grupo/grupo.js";
import { registro_etapa_maquina } from "./maquinas_etapas/maquinas_etapas.js";
import { registro_etapa_empleado } from "./empleado_etapa/empleado_etapa.js";
import { codigos } from "./constantes.js";
import { registro_grupo_productos } from "./grupo/grupo_productos.js";
import { registro_grupo_agregar_etapa } from "./grupo/grupo_etapas.js";
import * as listarFunctions from "../funciones/listar.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let opcion = 0;
let privilegios;
let code;
let permisos;
let refrescar;
let Lista_rubro = [];
let section = "section_etapas_produccion";
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "etapas_produccion";

function rand() {
  const indice = Math.floor(Math.random() * 26);
  const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  return String.fromCharCode(65 + indice) + codigo;
}

export function etapas_produccion(code_, permisos_, refrescar_) {
  privilegios = [...permisos_.toString()].map((digito) => parseInt(digito));
  permisos = permisos_;
  code = code_;
  refrescar = refrescar_;
  app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
  sitio();
  let recargar = document.querySelector(`button[id^="refrescar"][id$="${code_}"]`);
  recargar.addEventListener("click", ()=>{
      mostrarSeccion(section);
  });
  
}

async function sitio() {
  let view = `
    <div class="row" >
        <div class="col-md-6 mb-3 " id="menu">
            <nav class="nav nav-pills nav-fill">
                <li class="nav-item">
                    <button class="nav-link active" data-section="section_etapas_produccion" style="background-color:blue; color:white;">Etapas producción</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="section_grupo" style="background-color:white; color:black;">Grupo</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="section_grupo_etapas" style="background-color:white; color:black;">Grupo Etapas</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="registro_grupo_productos" style="background-color:white; color:black;">Grupo productos</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="section_maquina_material" style="background-color:white; color:black;">Maquinas</button>
                </li>
                 <li class="nav-item">
                    <button class="nav-link" data-section="section_etapas_empleado" style="background-color:white; color:black;">Etapas empleado</button>
                </li>
                
            </nav>
            
        </div>
        

    </div>    
        
        
        <div id="content-area${codigos.codigoPrincipal}"></div>
    `;
  app.innerHTML = view;
 
 
  registrar_etapa_produccion(code, permisos, refrescar);

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
  const contentArea = document.getElementById(
    `content-area${codigos.codigoPrincipal}`
  );


  if (!contentArea) {
    console.error("El contenedor de contenido no existe.");
    return;
  }
  contentArea.innerHTML = "";
  switch (section) {
    case "section_etapas_produccion":
      registrar_etapa_produccion(code, permisos, refrescar);

      opcion = 1;
      break;

    case "section_grupo_productos":
      grupo_etapas_produccion(code, permisos, refrescar);
      opcion = 2;
      break;
    case "section_grupo_etapas":
      registro_grupo_agregar_etapa(code, permisos, refrescar);
      opcion = 2;
      break;
    case "section_grupo":
      grupo_etapas(code, permisos, refrescar);
      opcion = 2;
      break;
    
    case "registro_grupo_productos":
      registro_grupo_productos(code, permisos, refrescar);
      opcion = 2;
      break;
    case "section_maquina_material":
      registro_etapa_maquina(code, permisos, refrescar);
      opcion = 3;
      break;
    case "section_etapas_empleado":
      registro_etapa_empleado(code, permisos, refrescar);
        opcion = 4;
        break;
    case "section_estandares_etapa":
      contentArea.innerHTML = "section_estandares_etapa";
      opcion = 3;
      break;
    default:
      contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
      break;
  }
}

