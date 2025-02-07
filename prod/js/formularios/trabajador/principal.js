import { areas_rh_config } from "./areas.js";
import { cargos_rh_config } from "./cargos.js";
import { Trabajador_rh_config } from "./trabajador.js";
import { tipoContrato_rh_config } from "./tipo_contrato.js";
import { modoPagos_rh_config } from "./modo_pago.js";
import { contratacion_rh_config } from "./contrato.js";
import { codigos } from "./constantes.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";

let privilegios;
let code;
let permisos;
let refrescar;
let section = "seccion_trabajador";

export function trabajador_conf(code_, permisos_, refrescar_) {
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
                    <button class="nav-link active" data-section="seccion_trabajador" style="background-color:blue; color:white;">Trabajador</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="seccion_cargos" style="background-color:white; color:black;">Cargos</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="seccion_areas" style="background-color:white; color:black;">Areas</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="seccion_tipocontrato" style="background-color:white; color:black;">Tipo Contrato</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="seccion_modo_pago" style="background-color:white; color:black;">Modo Pago</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="seccion_contrato" style="background-color:white; color:black;">Contrataciones</button>
                </li>
            </nav>
            
        </div>
        

    </div>    
        
        
    <div id="content-area${codigos.codigoPrincipal}"></div>
    `;
  app.innerHTML = view;

  

  Trabajador_rh_config(code,permisos,refrescar);

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
  const contentArea = document.getElementById(`content-area${codigos.codigoPrincipal}`);
  contentArea.innerHTML = "";
  switch (section) {
    case "seccion_areas":
      areas_rh_config(code,permisos,refrescar);
      break;
    case "seccion_cargos":
      cargos_rh_config(code,permisos,refrescar);
      break;
    case "seccion_trabajador":
      Trabajador_rh_config(code,permisos,refrescar);
      break;
    case "seccion_tipocontrato":
      tipoContrato_rh_config(code,permisos,refrescar);
      break;
    case "seccion_modo_pago":
      modoPagos_rh_config(code,permisos,refrescar);
      break;
    case "seccion_contrato":
      contratacion_rh_config(code,permisos,refrescar);
      break;
    default:
      contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
      break;
  }
}


