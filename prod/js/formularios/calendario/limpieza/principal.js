import { tareas_limpieza } from "./tareas_limpieza.js";
import { registro_limpieza } from "./limpieza.js";

import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "./constantes.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";

let privilegios;
let code;
let permisos;
let refrescar;
let section = "limpieza";

let Lista_rubro = [];

export function limpieza_secciones(code_, permisos_, refrescar_) {
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
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_rubro(idEmpresa),
    ]);
    // Asignamos los resultados a las variables correspondientes
    Lista_rubro = resultados[0];
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

async function sitio() {
  let view = `
    <div class="row" >
        <div class="col-md-6 mb-3 " id="menu">
            <nav class="nav nav-pills nav-fill">
                <li class="nav-item">
                    <button class="nav-link active" data-section="limpieza" style="background-color:blue; color:white;">Limpieza</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="tareas_limpieza" style="background-color:white; color:black;">Tareas</button>
                </li>
                
                
            </nav>
            
        </div>
        

    </div>    
        
        
    <div id="content-area${codigos.codigoprincipal}"></div>
    `;
  app.innerHTML = view;
  await listar();
  console.log(Lista_rubro);


  registro_limpieza(code, permisos, refrescar)
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
    case "limpieza":
      registro_limpieza(code,permisos,refrescar);
      break;
    case "tareas_limpieza":
      tareas_limpieza(code,permisos,refrescar);
      break;
    case "calendario_limpieza":
      alert('calendario_limpieza');
      break;
    default:
      contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
      break;
  }
}

function listar_rubro() {
  const rubro = document.querySelector(`#rubro_idrubro${codigos.codigoprincipal}`);
  let view = "";
  Lista_rubro.map((lista) => {
    view += `
                <option value="${lista.id}">${lista.rubro}</option>
            `;
  });
  rubro.innerHTML = view;

}
