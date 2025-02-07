import { stock_material_stock_conf } from "./stock.js";
import { stock_por_material } from "./pormaterial.js";
import { stock_material_porcompra } from "./porcompra.js";
import { codigos } from "./constantes.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";

let privilegios;
let code;
let permisos;
let refrescar;
let section = "seccion_trabajador";

export function stock_material_stock(code_, permisos_, refrescar_) {
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
                    <button class="nav-link active" data-section="stock" style="background-color:blue; color:white;">Stock</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="por_material" style="background-color:white; color:black;">Por Material</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="por_compra" style="background-color:white; color:black;">Por Compra</button>
                </li>
               
            </nav>
            
        </div>
        

    </div>    
        
        
    <div id="content-area${codigos.codigoPrincipal}"></div>
    `;
  app.innerHTML = view;

  

  stock_material_stock_conf(code,permisos,refrescar);

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
        case "stock":
            stock_material_stock_conf(code,permisos,refrescar);
        break;
        case "por_material":
            stock_por_material(code,permisos,refrescar);
        break;
        case "por_compra":
            stock_material_porcompra(code,permisos,refrescar);
        break;
        
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
        break;
    }
}


