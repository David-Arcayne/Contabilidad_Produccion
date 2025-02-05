import { URL_APIP } from "../../../../lib/services.js";
import * as listarFunctions from "../funciones/listar.js";
import { modal_editar_orden_produccion } from "./Editar_pendientes.js";
import { modal_crear_lote_produccion } from "./modal_enviar_aproduccion.js";


let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let Lista_Orden_Producciones =[];
let Lista_detalle_orden_produccion = [];
let Lista_empleados = [];
let Lista_productos =[];
export async function solicitudes_productos_pendientes(code, permisos, refrescar, codigo) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    app=document.querySelector(`#content-area${codigo}`);
    await listar();
    console.log(Lista_empleados);
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.select_lista_productos(idEmpresa),
            listarFunctions.mostrar_ordenproduccion(idEmpresa),
            listarFunctions.listar_detalle_produccion(idEmpresa),
            
        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_productos =resultados[1];
        Lista_Orden_Producciones = resultados[2];
        Lista_detalle_orden_produccion = resultados[3];
        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "solicitud_pendientes";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const subcodigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + subcodigo;
}


function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "modal_crear_lote_produccion":
            crear_lote(id1);
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
function crear_lote(id){
    modal_crear_lote_produccion(code_,permisos_,refrescar_,codigo_,id);

}
function pendiente_editar(id){
    modal_editar_orden_produccion(code_,permisos_,refrescar_,codigo_,id);
    
}
function sitio(){
    
    let lista_pendientes = Lista_Orden_Producciones.filter(Obj => Obj.estado === 0);
    let view="",ind=1;
    lista_pendientes.map(lista =>{
        let empleado = Lista_empleados.find(obj => Number(obj.id) === lista.empleado_idempleado );

        view +=`
                <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded shadow-sm border">
                    <!-- Información de la solicitud -->
                    <div class="d-flex flex-column">
                        <span class="fw-bold text-primary">${ind++}. Fecha solicitud: ${lista.fecha_orp}</span>
                        <span class="text-muted small">Hora solicitud: ${lista.hora_orp}</span>
                    </div>
                    
                    <!-- Información del empleado -->
                    <span class="fw-bold text-dark">Nombre solicitante: ${empleado.nombre} ${empleado.apellido}</span>
                    
                    <!-- Botones de acción -->
                    <div class="d-flex gap-3">
                        <!-- Botón Ver/Editar -->
                        <div class="text-center">
                            <a href="#" data-id="pendiente_editar,${lista.idorden_produccion}"
                            class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Ver o Editar">
                                <i class="bi bi-eye"></i>
                            </a>
                            <span class="d-block mt-1 small">Ver/Editar</span>
                        </div>
                        
                        <!-- Botón Enviar -->
                        <div class="text-center">
                            <a href="#" data-id="modal_crear_lote_produccion,${lista.idorden_produccion}"
                            class="btn btn-outline-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Enviar">
                                <i class="bi bi-send-check"></i>
                            </a>
                            <span class="d-block mt-1 small">Crear Lote</span>
                        </div>
                        <div class="text-center">
                            <a href="#" data-id="pendiente_enviar,${lista.idorden_produccion}"
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Cancelar">
                                <i class="bi bi-send-x "></i>
                            </a>
                            <span class="d-block mt-1 small">Cancelar</span>
                        </div>
                    </div>
                </div>


        `;

    })   
        
       

        
     app.innerHTML=view;
     const enlaces = document.querySelectorAll(".btn");
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
 

        
        
    
     
   
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
