import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { solicitudes_detalle_material } from "./detalle_material.js";

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
let solicitudes_material = [];
export async function solicitudes_material_produccion(code, permisos, refrescar) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;

    app=document.querySelector(`#content-area${codigos.codigoPrincipal}`);
    
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
            listarFunctions.listar_api_general_verd("Listar_solicitud_material_produccion",idEmpresa),

            
        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_productos =resultados[1];
        Lista_Orden_Producciones = resultados[2];
        Lista_detalle_orden_produccion = resultados[3];
        solicitudes_material = resultados[4];
        console.log(solicitudes_material);
        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
const codigo = codigos.codigosEditarSolicitudmaterial;




function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "detalle_materiales":
            solicitudes_detalle_material(code_,permisos_,refrescar_,id1);
            break;
        
       
        default:
            sitio();
            break;
    }

}
function detalle_materiales(id){

}

async function sitio(){
    
    await listar();
    let view="",ind=1;
        view +=`
            <div class="container">
                <h5 class="text-center mb-4">Listas solicitudes</h5>
                <table class="table table-hover" id="editableTable${codigo}">
                    <thead class="table-dark">
                        <tr>
                            <th scope="col">N°</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Hora</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Empleado</th>
                            <th scope="col">Detalle</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="Lista_solicitud_material${codigo}">
                    
                    </tbody>
                </table>
                    
            </div>
        
        `;
     app.innerHTML=view;
    table_listar();
     const enlaces = document.querySelectorAll(".btn");
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
 }
 
 function table_listar(){
    const table = document.getElementById(`Lista_solicitud_material${codigo}`);
    const idrubro =document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`);
    console.log(idrubro.value);
    let view = "",ind = 1;
    let a = {
        "idsolicitud_material": "1",
        "fecha": "2024-11-08",
        "hora": "15:25:55",
        "estado": "0",
        "empleado_idempleado": "85",
        "produccion_idproduccion": "1",
        "detalles": [
            {
                "iddetalle_solicitud_material": "1",
                "cantidad": "111",
                "observaciones": "MeEditaron11",
                "solicitud_material_idsolicitud_material": "1",
                "material_idmaterial": "39"
            },
            {
                "iddetalle_solicitud_material": "6",
                "cantidad": "3",
                "observaciones": "soyninguna",
                "solicitud_material_idsolicitud_material": "1",
                "material_idmaterial": "33"
            }
        ]
    }
    solicitudes_material.map((lista)=>{
        console.log(lista);
        console.log(Lista_empleados);
        let estado = lista.estado === 0 ? 'Aceptado':'Pendiente'; 
        let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado));
        view += `
             <tr>
                    <td>${ind++}</td>                
                    <td data-type="${lista.idsolicitud_material}" >${lista.fecha}</td>

                    <td data-type="${lista.idsolicitud_material},nombre">${lista.hora}</td>
                    <td data-type="${lista.idsolicitud_material},codigo">${estado}</td>
                    <td data-type="${lista.idsolicitud_material},empleado_idempleado">${item_empleado.nombre} ${item_empleado.apellido}</td>
                    
                    <td>
                        <div class="d-flex gap-3">
                            <div class="text-center">
                                <a data-id="detalle_materiales,${lista.idsolicitud_material}"
                                    class="btn btn-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                                    id="registrarMateriales${codigo}"
                                    style="width: 2.5rem; height: 2.5rem;"
                                    title="Detalle material">
                                    <i class="bi bi-border-width"></i>
                                </a>
                                <span class="d-block mt-1 small">Materiales</span>
                            </div>
                        </div>
                        
                    </td>
                    <td>
                        <div class="d-flex gap-3">
                            
                            <div class="text-center">
                                <a  data-id="eliminar_solicitud_material,${lista.idsolicitud_material}"
                                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                                style="width: 2.5rem; height: 2.5rem;"
                                title="Eliminar">
                                    <i class="bi bi-trash fs-5"></i>
                                </a>
                                <span class="d-block mt-1 small"></span>
                            </div>
                        </div>

                        
                    </td>
                </tr>  
        `;
    })
    table.innerHTML = view;
    const enlaces = document.querySelectorAll(`.btn${codigo}`);
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
 }
