
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
 
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "solicitud_finalizados";
let code_;
let permisos_;
let refrescar_;
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}
export function solicitud_finalizados(code, permisos, refrescar,codigo) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    app=document.querySelector(`#principal_contenido${codigo}`);
    
    sitio();    
}



function sitio(){
    let view = `
        
        <div class="container mt-4">
            <h2 class="mb-3">Solicitudes de Enviadas</h2>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="sticky-header">
                        <tr class="bg-light">
                            <th>N°</th>
                            <th>Solicitante</th>
                            <th>Etapa Producción</th>
                            <th>Hora solicitud</th>
                            <th>Fecha solicitud</th>
                            <th>Hora entrega</th>
                            <th>Fecha entrega</th>
                            <th>Despachador</th>
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
                            <td>14:00:00</td>
                            <td>12/10/2024</td>
                            <td>María González López</td>

                            <td>
                                
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
                            <td>15:30:00</td>
                            <td>13/10/2024</td>
                            <td>Juan Orellana Martínez</td>

                            <td>
                                <button class="btn btn-sm btn-outline-primary" title="Ver solicitud">
                                    <i class="bi bi-eye-fill"></i>
                                </button>
                            </td>
                        </tr>
                        <!-- Agrega más filas según sea necesario -->
                    </tbody>
                </table>
            </div>
        </div>
        
    `;
    app.innerHTML=view;
    
    
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






