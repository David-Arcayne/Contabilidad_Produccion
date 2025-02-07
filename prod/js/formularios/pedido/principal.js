import { codigos } from "./constantes.js";
import { lista_pedidos_material } from "./pedidos/pedidos.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 1;
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigoPrincipal;


export function listas_compras_config(code_, permisos_, refrescar_) {
    permisos = permisos_;
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));

    code = code_;
    refrescar = refrescar_;
    app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
        
    
    sitio();    
    
}

function sitio() {
    let view = `
       
        
        <div id="content-area${codigo}"></div>
    `;
    app.innerHTML = view;
    lista_pedidos_material(code,permisos,refrescar);


    
}




