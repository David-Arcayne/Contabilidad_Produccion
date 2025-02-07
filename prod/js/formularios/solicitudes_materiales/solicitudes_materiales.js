import * as listarFunctions from "../funciones/listar.js";
import { codigos } from "./constantes.js";
import { solicitudes_detalle_material } from "./detalle_material.js";
import * as modales from "../funciones/modales/modal_registrar.js";
import * as Registrar from "../funciones/registrar.js";
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
export async function despachar_materiales_almacen(code, permisos, refrescar) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;

    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);

    
 
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
const codigo = codigos.codigoPrincipal;


async function anular_solicitud_material(idsolicitud_material) {
    let solicitud = solicitudes_material.find(obj => Number(obj.idsolicitud_material) === Number(idsolicitud_material));

    let mensaje = Number(solicitud.estado)  === 0 ? 'Se anulara la solicitud': Number(solicitud.estado) === -1 ? 'Se validara la solicitud':'1'; 

    modales.crearModalSoS({
        code: code_,
        type:false,
        x:'1000px',
        y:'800px',
        id: `modal_finalizar_produccion${codigos.codigomodalFinalizarSOlicitud}`,
        header: `
            
        `,
        body: `

            <div id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div >
                    <div class = "row" >
                        <!-- Modal Body -->
                        <div  style="text-align: center;">
                            <div class="icon-warning" style="font-size: 100px; color: #f5c06b;">⚠️</div>
                            <h5 style="font-size: 24px; font-weight: bold; margin-top: 10px;">Esta seguro....?</h5>
                            <p style="color: #6c757d;">${mensaje}</p>
                        </div>
                    </div>
                </div>
            </div>
        
        `,
        footerButtons: [
            {
                id: "btnConfirmar",
                text: "Confirmar",
                class: "btn-primary",
                onClick: () => {
                        finalizar(idsolicitud_material);
                },
                dismiss: true // Esto NO cierra el modal cuando se hace clic
            },
            {
                id: "btnCancelar",
                text: "Cancelar",
                class: "btn-secondary",
                onClick: () => {
                    // Puedes agregar aquí cualquier acción personalizada
                },
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            }
        ]
    });
    async function finalizar(idsolicitud_material){
        let solicitud = solicitudes_material.find(obj => Number(obj.idsolicitud_material) === Number(idsolicitud_material));
        let est = Number(solicitud.estado) === -1 ? 0:-1;
        
        const formData = new FormData();
        formData.append('verDavid', 'actualizar_estado_solicitud_material');
        formData.append('estado',est);
        formData.append('idsolicitud_material',idsolicitud_material);
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        const data  = await Registrar.sendformData2(formData);
        modales.crearModalSoS({
            code: code_,
            type:false,
            x:'1000px',
            y:'800px',
            id: `confirmacion${codigos.Finalizar_produccion_codigo}`,
            header: `
                
            `,
            body: `

                <div id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                    <div >
                        <div class = "row" >
                            <!-- Modal Body -->
                            <div  style="text-align: center;">
                                <div class="icon-success" style="font-size: 100px; color: #167e1a;"><i class="bi bi-check2-circle fs-10"></i></div>
                                <h5 style="font-size: 24px; font-weight: bold; margin-top: 10px;">Operacion Completada</h5>
                                <p style="color: #6c757d;">${data[1]}</p>
                            </div>
                        </div>
                    </div>
                </div>
            
            `,
            footerButtons: [
                {
                    id: "btnConfirmar",
                    text: "Confirmar",
                    class: "btn-primary",
                    onClick: () => {
                            sitio();
                    },
                    dismiss: true // Esto NO cierra el modal cuando se hace clic
                }
            ]
        });
    }
}

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "detalle_materiales":
            solicitudes_detalle_material(code_,permisos_,refrescar_,id1);
            break;
        case "anular_solicitud_material":
            anular_solicitud_material(id1);
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
        <div  class = "container">
            <h5 class="text-center mb-4">Listas solicitudes</h5>
            <div  style = "max-height: 500px; overflow-y: auto; display: block;">
                
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
        
        let estado = Number(lista.estado)  === 0 ? 'Pendiente': Number(lista.estado) === 1 ? 'Aceptado':'Anulado'; 
        let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado));
        let estadocss = Number(lista.estado)  === 0 ? 'danger': Number(lista.estado) === 1 ? 'secondary  disabled':'success'; 
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
                                <a  data-id="anular_solicitud_material,${lista.idsolicitud_material}"
                                class="btn btn-outline-${estadocss} rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo} "
                                style="width: 2.5rem; height: 2.5rem;"
                                title="Cambiar de estado">
                                    <i class="bi bi-ban fs-5"></i>
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
