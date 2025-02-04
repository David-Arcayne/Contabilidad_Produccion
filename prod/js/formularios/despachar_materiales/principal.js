import { solicitud_finalizados } from "./solicitud_finalizados.js";
import { solicitud_pendientes } from "./solicitud_pendiente.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "despachar_materiales_alacen";
let code_;
let permisos_;
let refrescar_;
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}
export function despachar_materiales_alacen(code, permisos, refrescar) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
}

export function funcion_para_vovelr(){
    sitio();
}

function sitio(){

    let view = `
        <div class="col-md-6 mb-3 " id="menu">
            <nav class="nav nav-pills nav-fill">
                <li class="nav-item">
                    <button class="nav-link active" data-section="Pendientes" style="background-color:blue; color:white;">Pendientes</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="Finalizados" style="background-color:white; color:black;">Finalizados</button>
                </li>
               
            </nav>
        </div>
        <div id="principal_contenido${codigo}"></div>
        
    `;
    app.innerHTML=view;
    solicitud_pendientes(code_,permisos_,refrescar_,codigo);

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
   
    switch(section) {
        case 'Finalizados':
            solicitud_finalizados(code_,permisos_,refrescar_,codigo);
            break;
        case 'Pendientes':
            solicitud_pendientes(code_,permisos_,refrescar_,codigo);
            break;
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}






