
import { codigos } from "./constantes.js";
import { devoluciones_compra } from "./devoluciones_compra.js";
import { devoluciones_produccion } from "./devoluciones_produccion.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let opcion = 0;
let privilegios;
let code;
let permisos;
let refrescar;
let Lista_rubro = [];
let section = "section_compras";

const codigo = codigos.codigoPrincipal;
function rand() {
  const indice = Math.floor(Math.random() * 26);
  const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  return String.fromCharCode(65 + indice) + codigo;
}

export function Devoluciones_Comp_Prod(code_, permisos_, refrescar_) {
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
                    <button class="nav-link active" data-section="section_compras" style="background-color:blue; color:white;">Compras</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="section_produccion" style="background-color:white; color:black;">Producción</button>
                </li>
               
                
            </nav>
            
        </div>
        

    </div>    
        
        
        <div id="content-area${codigos.codigoPrincipal}"></div>
    `;
  app.innerHTML = view;
 
 
  devoluciones_compra(code, permisos, refrescar);

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
  contentArea.innerHTML = "";
  switch (section) {
    case "section_compras":
        devoluciones_compra(code, permisos, refrescar);

      opcion = 1;
      break;

    case "section_produccion":
        devoluciones_produccion(code, permisos, refrescar);
      opcion = 2;
      break;
   
    default:
      contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
      break;
  }
}

