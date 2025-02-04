import { preparar_solicitud_para_produccion } from "./segundario.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
 
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "solicitud_pendientes";
let code_;
let permisos_;
let refrescar_;
let codigo_;
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}
export function solicitud_pendientes(code, permisos, refrescar,codigo) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    app=document.querySelector(`#principal_contenido${codigo}`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
}
function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    switch (funcion) {
        case "enviar_material_a_produccion":
            enviar_material_a_produccion(id1);
            break;
        
        
        // Agrega otros casos según sea necesario
        default:
            
            sitio();
            break;
    }

}
function enviar_material_a_produccion(id){
    preparar_solicitud_para_produccion(code_,permisos_,refrescar_,codigo_,id);
}

function sitio(){
    let view = `
        
        <div class="container mt-4">
            <h2 class="mb-3">Solicitudes de Producción</h2>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="sticky-header">
                        <tr class="bg-light">
                            <th>N°</th>
                            <th>Solicitante</th>
                            <th>Etapa Producción</th>
                            <th>Hora solicitud</th>
                            <th>Fecha solicitud</th>
                            <th>Funciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Juan Orellana Martínez</td>
                            <td>Amasado<br><small class="text-muted">descripción</small></td>
                            <td>14:00:00</td>
                            <td>12/10/2024</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger mb-1" title="Enviar solicitud">
                                    <i class="bi bi-send-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-primary" title="Ver solicitud">
                                    <i class="bi bi-eye-fill"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>María González López</td>
                            <td>Horneado<br><small class="text-muted">descripción</small></td>
                            <td>15:30:00</td>
                            <td>13/10/2024</td>
                            <td>
                                <a data-id="enviar_material_a_produccion,${1}" class="btn btn-danger btn-sm" >
                                    <i class="bi bi-send-plus"></i>
                                </a>
                                <button class="btn btn-sm btn-outline-primary" title="Ver solicitud">
                                    <i class="bi bi-eye-fill"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    app.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });
}
function mostrarSeccion(section) {
    const contentArea = document.getElementById(`content-area${codigo}`);
    contentArea.innerHTML = ''; 
    switch(section) {
        case 'Finalizados':
            mostrarFinalizados();
            break;
        case 'Pendientes':
            mostrarPendientes();
            break;
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}






