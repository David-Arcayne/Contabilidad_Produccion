import { modal_stock_filtrado } from "./modal_stock.js";
import {funcion_para_vovelr} from "./principal.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
 
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "solicitud_finalizados";
let code_;
let permisos_;
let refrescar_;
let id_;
let codigo_;
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}
export function preparar_solicitud_para_produccion(code, permisos, refrescar,codigo,id) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    id_ = id;
    app=document.querySelector(`#principal_contenido${codigo}`);
    
    sitio();    
}
function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    switch (funcion) {
        case "ver_stock_de_material":
            ver_stock_de_material(id1);
            break;
        
        
        // Agrega otros casos según sea necesario
        default:
            
            sitio();
            break;
    }

}

function ver_stock_de_material(id){
    modal_stock_filtrado(code_,permisos_,refrescar_,codigo_,id);
}
function sitio(){
    let view = `
        
        <div id="alerta${codigo_}" class="mt-4"></div>

        <div class="row">
            <a style="float: right;" class ="cerrar"><i class="bi bi-chevron-double-left fs-5">Volver atras</i></a>

            <div class="col-md-6">

                <div class="p-3 bg-light border rounded">
                    <h5 class="text-center mb-4 fw-bold fs-6" >Lista solicitada</h5>

                    <table class="table table-hover mt-3" id="editableTable${subcodigo}">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">N°</th>
                                <th scope="col">Material</th>
                                <th scope="col">Codigo</th>
                                <th scope="col">Medida</th>
                                <th scope="col">Cantidad</th>
                                <th scope="col">Observaciones</th>
                                <th scope="col">Funciones</th>
                            </tr>
                        </thead>
                        <tbody id="ListarOrdenProduccion${subcodigo}">
                            <tr>
                                <td>1</td>
                                <td>harina</td>
                                <td>PONDL123</td>
                                <td>L</td>
                                <td>30</td>
                                <td>Observaciones del material solicitado</td>
                                <td>
                                    
                                    <a data-id="ver_stock_de_material,${1}" class="btn btn-danger btn-sm" >
                                        <i class="bi bi-plus-square fs-5"></i>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="col-md-6">
                
                <div class="p-3 bg-light border rounded" id="contenido${codigo_}">
                    
                    
                </div>
                
            </div>
        </div>
    </div>
        
    `;
    app.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });
    app.addEventListener('click', function(event) {
        //console.log(event.target);
        let aTag = event.target.closest('a.cerrar');

        if (aTag) {
            event.preventDefault();
            cerrarModal();

        }
       
    });
    function cerrarModal() {
        funcion_para_vovelr();
        
    }
    
}







