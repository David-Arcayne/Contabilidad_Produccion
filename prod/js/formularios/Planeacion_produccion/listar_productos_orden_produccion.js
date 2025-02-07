import * as listarFunctions from "../funciones/listar.js";
import { produccion_ini } from "./produccion.js";


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
export async function orden_produccion_en_curso(code, permisos, refrescar, codigo) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    app=document.querySelector(`#content-area${codigo}`);
    await listar();
    console.log(Lista_empleados);
    sitio();    
    //nombre_lote
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            
            
        ]);

        // Asignamos los resultados a las variables correspondientes
        // Lista_empleados = resultados[0];
        // Lista_productos =resultados[1];
        // Lista_Orden_Producciones = resultados[2];
        // Lista_detalle_orden_produccion = resultados[3];
        
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
        case "comenzar_produccion":
            comenzar_produccion(id1);
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
function comenzar_produccion(id){
    produccion_ini(code_,permisos_,refrescar_,codigo_);
}
function sitio(){
    
    
    let view="",ind=1;
    

        view +=`
            <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded shadow-sm border">
                    <!-- Información de la solicitud -->
                    <div class="d-flex flex-column">
                        <span class="fw-bold text-primary">${ind++}. Fecha solicitud: ${"Fecha solicitud"}</span>
                        <span class="text-muted small">Hora solicitud: ${"hora solicitud"}</span>
                    </div>
                    
                    <!-- Información del empleado -->
                    <span class="fw-bold text-dark">Nombre solicitante: ${"nombre"} ${"apellido"}</span>
                    

                    <div class="d-flex flex-column">
                        <span class="fw-bold text-primary"> Fecha entrega estimada: ${"Fecha solicitud"}</span>
                        <span class="text-muted small">Hora entrega estimada: ${"hora solicitud"}</span>
                    </div>
                    <span class="fw-bold text-dark">Aprobado Por: ${"nombre"} ${"apellido"}</span>
                    <!-- Botones de acción -->
                    <div class="d-flex gap-3">
                        <!-- Botón Ver/Editar -->
                        <div class="text-center">
                            <a href="#" data-id="ver_lista_orden_produccion,${"lista.idorden_produccion"}"
                            class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Ver o Editar">
                                <i class="bi bi-eye fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small">Ver orden producción</span>
                        </div>
                        
                        <!-- Botón Enviar -->
                        <div class="text-center">
                            <a href="#" data-id="comenzar_produccion,${"lista.idorden_produccion"}"
                            class="btn btn-outline-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Enviar">
                                <i class="bi bi-skip-start-circle-fill fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small">Comenzar producción</span>
                        </div>
                        <div class="text-center">
                            <a href="#" data-id="finalizar_produccion,${"lista.idorden_produccion"}"
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Cancelar">
                                <i class="bi bi-send-x fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small">Finalizar producción</span>
                        </div>
                    </div>
                </div>
        `;

    
        
       

        
     app.innerHTML=view;
     const enlaces = document.querySelectorAll(".btn");
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
 

        
        
    
     
   
 }
 

