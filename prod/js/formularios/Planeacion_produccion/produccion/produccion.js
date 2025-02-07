import * as listarFunctions from "../../funciones/listar.js";
import { produccion_productos } from "./produccion_productos.js";
import { funcion_para_vovelr } from "../principal.js";
import { codigos } from "../constantes.js";

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
let id_orden_produccion;
let produccion_idproduccion;
export async function produccion_ini(code, permisos, refrescar, codigo, id_orden_produccion_, produccion_idproduccion_) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    id_orden_produccion = id_orden_produccion_;
    produccion_idproduccion = produccion_idproduccion_;

    app=document.querySelector(`#content-area${codigo}`);
    await listar();
  
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
const subcodigo = codigos.codigoproduccion_comenzar;

function sitio(){
    let view="",ind=1;
        view =`
            <a style="float: right;" class="cerrar d-flex align-items-center mt-1">
                <i class="bi bi-chevron-double-left fs-5 me-1"></i>
                <span>Volver</span>
            </a>
            <h5 class="text-center mb-4 fw-bold fs-6">Producción</h5>

            <div class="row" style="height: 80vh;">
                <div class="col-md-6" style="height: 100%;">
                    <div class="p-3 bg-light border rounded" style="height: 100%;">
                        <div id="Listar_lista_orden_produccion${subcodigo}" style = " max-height: 100%; overflow-y: auto; display: block;">
                        
                        </div>
                    </div>
                </div>
                <div class="col-md-6" style="height: 100%;">
                    <div class="p-3 bg-light border rounded mb-3" id="contenido1${subcodigo}" style="height: 50%;">

                    </div>
                    <div class="p-3 bg-light border rounded" id="contenido2${subcodigo}" style="height: 50%;">

                    </div>
                </div>
            </div>
        `;

    
    console.log(subcodigo);
    app.innerHTML=view;
    produccion_productos(code_,permisos_,refrescar_,subcodigo,id_orden_produccion,produccion_idproduccion);  

        
     
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
 

