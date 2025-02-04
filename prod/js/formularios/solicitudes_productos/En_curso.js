import { URL_APIP } from "../../../../lib/services.js";



let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;

export function solicitudes_productos_En_curso(code, permisos, refrescar, codigo) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    app=document.querySelector(`#content-area${codigo}`);
   
    sitio();    
    
}
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "solicitud_curso";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const subcodigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + subcodigo;
}


function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "pendiente_enviar":
            pendiente_enviar();
            break;
        
        case "pendiente_editar":
            pendiente_editar(id1);
            break;
            
        case "mostrar_progreso_de_solicitud":
            mostrar_progreso_de_solicitud();
            break;
            
        case "mostrar_finalizados_desarrollo":
            mostrar_finalizados_desarrollo();
            break;
            
        case "negativos_mostrar":
            negativos_mostrar();
            break;
        default:
            sitio();
            break;
    }

}

function sitio(){
    
  let view = `
    
        <h1>En curso</h1>
    
  `;
     app.innerHTML=view;
    
 

        
        
    
     
   
 }
 
function mostrarSeccion(section) {
    //const contentArea = document.getElementById(`filtrar${subcodigo}`);
   // contentArea.innerHTML = ''; 
    switch(section) {

        case 'pendientes':
            //mostrar_pendientes();
            break;
        case 'encurso':
           // mostrar_encurso();
            break;
        case 'finalizados':
            //mostrar_finalizados();
            break;
        case 'negativos':
            //mostrar_negativos();
            break;
        
        default:
           // contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}
