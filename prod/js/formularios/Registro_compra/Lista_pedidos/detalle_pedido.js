import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { lista_pedidos_material } from "./lista_pedidos.js";




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
let Lista_Material = [];
let Lista_medida = [];
let solicitudes_material = [];
let idpedido;
export async function pedido_detalle_material(code, permisos, refrescar,id) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    idpedido = id;
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
            listarFunctions.listar_api_general_verd("Listar_pedidos_material",idEmpresa),
            listarFunctions.listar_api_general("listar_material",idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),

            
        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_productos =resultados[1];
        Lista_Orden_Producciones = resultados[2];
        Lista_detalle_orden_produccion = resultados[3];
        solicitudes_material = resultados[4];
        Lista_Material = resultados[5];
        Lista_medida = resultados[6];
        console.log(solicitudes_material);
        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
const codigo = codigos.codigodetalle_pedido;




function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "detalle_materiales":
            break;
        
       
        default:
            sitio();
            break;
    }

}


async function sitio(){
    
    await listar();
    let view="",ind=1;
        view +=`
        <a style="float: left;" class="cerrar d-flex align-items-center mt-1" id="volver${codigo}">
            <i class="bi bi-chevron-double-left fs-5 me-1"></i>
            <span>Volver</span>
        </a>
        
        <table class="table table-hover" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Material</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Medida</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="Lista_solicitud_material${codigo}">
              
            </tbody>
        </table>
        `;
     app.innerHTML=view;
    table_listar();
     const enlaces = document.querySelectorAll(".btn");
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
     const volver = document.getElementById(`volver${codigo}`);
     volver.addEventListener('click',volveratrar);
 }
 function volveratrar(){
    lista_pedidos_material(code_,permisos_,refrescar_);
 }
 function table_listar(){
    const table = document.getElementById(`Lista_solicitud_material${codigo}`);
    const idrubro =document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`);
  
    let view = "",ind = 1;
    let a =   {
        idpedido: 1,
        fecha_p: '2024-11-20',
        hora: '10:00:00',
        estado: 0,
        empleado_idempleado: 45,
        rubro_idrubro:1,
        detalles: [
            {
                iddetalle_pedido: 1,
                cantidad: 54,
                pedido_idpedido: 1,
                material_idmaterial: 12,
                observaciones: "nulo"
            }
        ]
    };
    const pedido = solicitudes_material.find(obj => Number(obj.idpedido) === Number(idpedido));
    pedido.detalles.map((lista)=>{
        console.log(lista);
        console.log(Lista_empleados);
        let item_material = Lista_Material.find(obj => Number(obj.id) === Number(lista.material_idmaterial)) || { nombre:'material'};
        let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(item_material.medida)) || { nombre:'Kg'};
        let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado));
        view += `
             <tr style = "style=width: 50px; height: 50px;">
                    <td>${ind++}</td>   
                   <td data-type="${lista.iddetalle_pedido},nombre">${item_material.nombre}</td>          
                    <td data-type="${lista.iddetalle_pedido},cantidad" >${lista.cantidad}</td>
                    <td data-type="${lista.iddetalle_pedido},cantidad" >${item_medida.nombre}</td>
                    <td data-type="${lista.iddetalle_pedido},observaciones">${lista.observaciones}</td>
                    
                    <td>
                        <div class="d-flex gap-3">
                            <div class="text-center">
                                <a data-id="editar_solicitud_material,${lista.iddetalle_pedido}"
                                class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                                style="width: 2.5rem; height: 2.5rem;"
                                title="Editar">
                                    <i class="bi bi-pencil-square fs-5"></i>
                                </a>
                                <span class="d-block mt-1 small"></span>
                            </div>
                            <div class="text-center">
                                <a  data-id="eliminar_solicitud_material,${lista.iddetalle_pedido}"
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
