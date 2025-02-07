import { codigos } from "./constantes.js";
import { registrar_compra } from "./compra/compras.js";
import { reportes_compras } from "./reporte_compras/reporte_compras.js";
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


export function Registrar_compras(code_, permisos_, refrescar_) {
    permisos = permisos_;
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));

    code = code_;
    refrescar = refrescar_;
    app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
        
    
    sitio();    
    
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
                
                
            </nav>
        </div>
        
    </div>   
        <div id="content-area${codigo}"></div>
    `;
    app.innerHTML = view;
    await listar();
    reportes_compras(code,permisos,refrescar);

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
            reportes_compras(code,permisos,refrescar);
            opcion = 2;
            break;
        
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}

  