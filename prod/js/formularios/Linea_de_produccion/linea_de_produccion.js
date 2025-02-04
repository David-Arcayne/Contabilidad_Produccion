import { producto_categoria_config } from "./producto_categoria.js";
import { producto_comercial_medida_config } from "./producto_comercial_medida.js";
import { rubro_linea_de_producio } from "./rubro.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 0;
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "Linea_produccion";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}

export function linea_de_produccion(code_, permisos_, refrescar_) {
    permisos = permisos_;
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));

    code = code_;
    refrescar = refrescar_;
    app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
        
    // document.querySelector(`button[id^="refrescar"][id$="${code_}"]`).addEventListener('click', function() {
    //     console.log(opcion);

    //     switch(opcion) {
    //         case 1:
    //             materialconfig(code,permisos,refrescar,codigo);
    //             return;
    //             break;
    //         case 2:
    //             envasesconfig(code,permisos,refrescar,codigo);
    //             return;
    //             break;    
    //         case 3:
    //             caracteristicasConfig(code,permisos,refrescar,codigo);
    //             return;
    //             break;
            
    //         default:
    //             contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
    //             break;
    //     }
    // });
    sitio();    
    
}

function sitio() {

    let view = `
        <div class="col-md-6 mb-3 " id="menu">
            <nav class="nav nav-pills nav-fill">
                <li class="nav-item">
                    <button class="nav-link active" data-section="rubro" style="background-color:blue; color:white;">Rubro</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="categoria" style="background-color:white; color:black;">Categoria</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-section="caracteristicas_producto" style="background-color:white; color:black;">Caracteristicas Producto</button>
                </li>
            </nav>
        </div>
        
        <div class="container" id="principal${codigo}">
           
            
        </div>
        
        <div id="content-area${codigo}"></div>
    `;
    app.innerHTML = view;

    rubro_linea_de_producio(code,permisos,refrescar,codigo);

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
        case 'rubro':
            rubro_linea_de_producio(code,permisos,refrescar,codigo);
            opcion = 1;
            break;
        case 'categoria':
            producto_categoria_config(code,permisos,refrescar,codigo);
            opcion = 2;
            break;    
        case 'caracteristicas_producto':
            producto_comercial_medida_config(code,permisos,refrescar,codigo);
            opcion = 3;
            break;
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}


