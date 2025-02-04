import * as listarFunctions from "../funciones/listar.js";
import { envaseArray,medidaArray,materialArray, proveedorArray, listarTipo_envase2,listarMaterial2,listarmedida2 } from "../listaSolicitudess/selectsFormulario.js"; 
import { control_calidad_compra_pendiente } from "./pendientes.js";
import { control_calidad_compra_encurso } from "./encurso.js"; 

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let privilegios;

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "control_calidad_compra";


let Listas_Compras =[];
let Lista_Empleados = [];
let Lista_Detalle_Compra =[];
let ComprasestadoCero =[];
let ComprasestadoUno = [];
let ComprasestadoDos = [];
let Listas_Control_calidad =[];
let Lista_Detalle_Control_calidad = [];
let Lista_Material = [];
let Lista_Caracteristicas_api = [];
let Listas_Compras_m = [];
let Listas_Compras_md = [];
let Lista_Medidas =[];
export let listas_enviadas ;
async function  preparar_listas() {
     listas_enviadas = {
        compra: Listas_Compras,
        empleados: Lista_Empleados,
        detallecompra: Lista_Detalle_Compra,
        calidad: Listas_Control_calidad,
        detallecalidad: Lista_Detalle_Control_calidad,
        material:Lista_Material,
        caracteristica: Lista_Caracteristicas_api,
        m: Listas_Compras_m,
        md: Listas_Compras_md,
        medidas: Lista_Medidas
};
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_compras(idEmpresa),
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.Listarcompras_detalle(idEmpresa),
            listarFunctions.Listar_control_calidad_Api(idEmpresa),
            listarFunctions.Listar_detalle_control_calidad_Api(idEmpresa),
            listarFunctions.listar_material(idEmpresa),
            listarFunctions.listar_caracteristicas(idEmpresa),
            listarFunctions.listar_compras(idEmpresa),
            listarFunctions.Listarcompras_detalle(idEmpresa),
            listarFunctions.listar_medidas(idEmpresa)
        ]);

        // Asignamos los resultados a las variables correspondientes
        Listas_Compras = resultados[0];
        Lista_Empleados = resultados[1];
        Lista_Detalle_Compra = resultados[2];
        Listas_Control_calidad = resultados[3];
        Lista_Detalle_Control_calidad = resultados[4];
        Lista_Material = resultados[5];
        Lista_Caracteristicas_api = resultados[6];
        Listas_Compras_m = resultados[7];
        Listas_Compras_md = resultados[8];
        Lista_Medidas = resultados[9];
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
let code_;

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}

export function control_calidad_compra(code, permisos, refrescar) {
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));
    console.log(privilegios[1]);
    console.log(refrescar);
    code_ = code;
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
    
}

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, ids] = dataid.split(',');
     console.log(funcion,id1);
 
    switch (funcion) {
        
        case "mostrar_control_calidad":
            mostrar_control_calidad(id1);
            break;
            
        case "generar_form_control_calidad":
            generar_form_control_calidad(id1,ids);
            break;
        default:
            sitio();
            break;
    }
}

function sitio(){
    let view=`
    <h5 class="text-center mb-4 fw-bold fs-6"></h5>
    <div id="alerta${codigo}" class="mt-4"></div>

        <div class="row">
            <div class="col-md-4">
                <div class="p-3 bg-light border rounded">
                    <div class="col-md-6 mb-3 " id="menu">
                        <nav class="nav nav-pills nav-fill">
                            <li class="nav-item">
                                <button class="nav-link active" data-section="pendientes" style="background-color:blue; color:white;">Pendietes</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="encurso" style="background-color:white; color:black;">En curso</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="finalizados" style="background-color:white; color:black;">Finalizados</button>
                            </li>
                           
                        </nav>
                    </div>
                    <div id="alerta${codigo}" class="mt-4"></div>
                    <div id="filtrar${codigo}" class="item-list" style = "max-height: 400px; overflow-y: auto; display: block;">
                       
                    </div>
                </div>
            </div>
            
            <div class="col-md-8">
                
                <div class="p-3 bg-light border rounded" id="contenido${codigo}">
                    
                    
                </div>
                
            </div>
        </div>
    </div>
    `;
    app.innerHTML=view;
    
           
    listar()
    .then(()=>{
        ComprasestadoCero = Listas_Compras.filter(item => item.estado === "0");
        ComprasestadoUno = Listas_Compras.filter(item => item.estado === "1");
        ComprasestadoDos = Listas_Compras.filter(item => item.estado === "2");
        preparar_listas();
        mostrar_pendientes();
        const navButtons = document.querySelectorAll('#menu .nav-link');
        navButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                navButtons.forEach(btn => {
                    btn.style.backgroundColor = 'white';
                    btn.style.color = 'black';
                });
                this.style.backgroundColor = 'blue';
                this.style.color = 'white';
                const section = this.getAttribute('data-section');
                mostrarSeccion(section);
            });
        });
    })

       
    
    
}

function mostrarSeccion(section) {
    const contentArea = document.getElementById(`filtrar${codigo}`);
    contentArea.innerHTML = ''; 
    switch(section) {

        case 'pendientes':
            mostrar_pendientes();
            break;
        case 'finalizados':
            mostrar_finalizados();
            break;
        case 'encurso':
            mostrar_encurso();
            break;
        
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}






// function mostrar_encurso() {
//     const mon=document.querySelector(`#filtrar${codigo}`);
//     let view="",ind=1;
  
//     Listas_Control_calidad.map(lista=>{
//         let itemempleado = Lista_Empleados.find(obj => Number(obj.id) === Number(lista.empleado)) || {
//             "id": 0,
//             "nombre": "-",
//             "apellido": "-"
//         };
//         view +=`
//             <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
//                 <span>${ind++}  ${lista.fecha}   ${lista.hora} ${itemempleado.nombre} ${itemempleado.apellido}</span>
//                 <span>Numero Documento: ${lista.num_docu}  </span>
//                 <div>
                    
//                     <a data-id="mostrar_control_calidad,${lista.id}" 
//                     class="btn btn-primary btn-sm rounded-circle " >
//                         <i class="bi bi-table fs-5"></i>
//                     </a>
//                 </div>
                
//             </div>`;
        
        

//     })      
//     mon.innerHTML=view;
//     const enlaces = document.querySelectorAll(".btn");
//     enlaces.forEach(enlace => {
//         enlace.addEventListener("click", menu);
//     });
// }
function mostrar_encurso(){
    control_calidad_compra_encurso(codigo,code_,privilegios);
}
// function mostrar_pendientes(){
    
//     const mon=document.querySelector(`#filtrar${codigo}`);
//     let view="",ind=1;
        
//     ComprasestadoCero.map(lista=>{
//         let itemempleado = Lista_Empleados.find(obj => Number(obj.id) === Number(lista.empleado)) || {
//             "id": 0,
//             "nombre": "-",
//             "apellido": "-"
//         };
//         view +=`
//             <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
//                 <span>${ind++}  ${lista.fecha}   ${lista.hora} ${itemempleado.nombre} ${itemempleado.apellido}</span>
//                 <span>Lote: ${lista.lote}  </span>
//                 <div>
//                     <a data-id="registrar_control_calidad,${lista.id},${lista.lote}" 
//                     class="btn btn-success btn-sm rounded-circle " >
//                         <i class="bi bi-send-check fs-5"></i>
//                     </a>
//                     <a data-id="mostrar_datos,${lista.id}" 
//                     class="btn btn-primary btn-sm rounded-circle " >
//                         <i class="bi bi-table fs-5"></i>
//                     </a>
//                 </div>
                
//             </div>`;
        
        

//     })      
//     mon.innerHTML=view;
//     const enlaces = document.querySelectorAll(".btn");
//     enlaces.forEach(enlace => {
//         enlace.addEventListener("click", menu);
//     });

// }
function mostrar_pendientes(){
    
    control_calidad_compra_pendiente(codigo);

}




function mostrar_finalizados(){
    
    const mon=document.querySelector(`#filtrar${codigo}`);
    let view="",ind=1;
        
    ComprasestadoDos.map(lista=>{
        let itemempleado = Lista_Empleados.find(obj => Number(obj.id) === Number(lista.empleado)) || {
            "id": 0,
            "nombre": "-",
            "apellido": "-"
        };
        view +=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                <span>${ind++}  ${lista.fecha}   ${lista.hora} ${itemempleado.nombre} ${itemempleado.apellido}</span>
                 <span>Lote: ${lista.lote}  </span>
                <div>
                    <a data-id="registrar_control_calidad,${lista.id},${lista.lote}" 
                    class="btn btn-success btn-sm rounded-circle " >
                        <i class="bi bi-send-check fs-5"></i>
                    </a>
                    <a data-id="mostrar_datos,${lista.id}" 
                    class="btn btn-primary btn-sm rounded-circle " >
                        <i class="bi bi-table fs-5"></i>
                    </a>
                </div>
                
            </div>`;
    })      
    mon.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });


}








function alertas(data) {
    console.log(data);

    // Definir las variables al principio
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;

        // Resetear el formulario si existe
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        if(data[2]==="registrarCaracteristica"){
            listaCaracteristicas();

        }
        if(data[2]==="eliminarCaracteristica"){
            console.log(List_Envases);
            console.log(obt_envases_aux);

            List_Envases = List_Envases.filter(obj => obj.id !== Number(obt_envases_aux['id']));
            console.log(List_Envases);

            listaCaracteristicas();
            obt_envases_aux = { ...{ id: 0, nombre: "", detalle: "" } };

        }
        if(data[2]==="edicionCaracteristica"){
            obt_envases_aux = { ...{ id: 0, nombre: "" } };

        }

        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="edicionCaracteristica"){
                const obj = List_Envases.find(ob => ob.id === obt_envases_aux['id']);

                console.log(obt_envases_aux);

                console.log(obj);
                if (obt_envases_aux) {
                    Object.assign(obj, obt_envases_aux);
                }
                console.log(obt_envases_aux);

                console.log(obj);
                console.log(List_Envases);
                listaCaracteristicas();
                obt_envases_aux = { ...{ id: 0, nombre: "", detalle: "" } };

            }
            alertClass = 'alert-danger';
            alertMessage = data[1];
            timeoutDuration = 3000;
        }else{
            alertClass = 'alert-primary';
            alertMessage = data[1];
            timeoutDuration = 3000;

        }
    }
    
    // Obtener el div de alerta
    let divalert = document.querySelector(`#alerta${codigo}`);
    if (divalert) {
        // Crear el nuevo contenido de la alerta
        let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
        divalert.innerHTML = nuevoContenido;
        
        // Eliminar la alerta después del tiempo especificado
        setTimeout(() => {
            divalert.innerHTML = ``;
            
        }, timeoutDuration);
    }
}
