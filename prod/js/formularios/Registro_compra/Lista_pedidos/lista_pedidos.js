import { codigos } from "../constantes.js";
import { pedido_detalle_material } from "./detalle_pedido.js";
import * as listarFunctions from "../../funciones/listar.js";

let list_pedidos = [
    {
        idpedido: 1,
        fecha_p: '2024-11-20',
        hora: '10:00:00',
        estado: 0,
        empleado_idempleado: 45,
        detalles: [
            {
                iddetalle_pedido: 1,
                cantidad: 54,
                pedido_idpedido: 1,
                material_idmaterial: 12,
                observaciones: "nulo"
            }
        ]
    },
    {
        idpedido: 2,
        fecha_p: '2024-11-19',
        hora: '14:00:00',
        estado: 0,
        empleado_idempleado: 12,
        detalles: [
            {
                iddetalle_pedido: 2,
                cantidad: 30,
                pedido_idpedido: 2,
                material_idmaterial: 15,
                observaciones: "sin observaciones"
            }
        ]
    }
];

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 1;
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigolista_pedido;
let Lista_Orden_Producciones =[];
let Lista_detalle_orden_produccion = [];
let Lista_empleados = [];
let Lista_productos =[];
let solicitudes_material = [];
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

export function lista_pedidos_material(code_, permisos_, refrescar_) {
    code = code_;
    permisos = permisos_;
    refrescar =  refrescar_;
    app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
    sitio();
}

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "detalle_materiales":
            pedido_detalle_material(code,permisos,refrescar,id1);
            break;
        
       
        default:
            sitio();
            break;
    }

}
async function sitio() {
    await listar();
    let view = `
    <div class="container ">
        <h5 class="text-center mb-4">Listas pedidos</h5>
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
    app.innerHTML = view;
    table_listar();
}

function table_listar(){
    const table = document.getElementById(`Lista_solicitud_material${codigo}`);
    //const idrubro =document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`);
    let view = "", ind = 1;
   
    solicitudes_material.map(lista=>{
        
        let estado = lista.estado === 0 ? 'Aceptado':'Pendiente';
        let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado)) || {nombre : 'Benjamin_0', apellido: 'Mora_0'};
        view += ` 
            <tr>
                    <td>${ind++}</td>                
                    <td data-type="${lista.idpedido}" >${lista.fecha_p}</td>

                    <td data-type="${lista.idpedido},nombre">${lista.hora}</td>
                    <td data-type="${lista.idpedido},codigo">${estado}</td>
                    <td data-type="${lista.idpedido},empleado_idempleado">${item_empleado.nombre} ${item_empleado.apellido}</td>
                    
                    <td>
                        <div class="d-flex gap-3">
                            <div class="text-center">
                                <a data-id="detalle_materiales,${lista.idpedido}"
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
                                <a  data-id="eliminar_solicitud_material,${lista.idpedido}"
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
