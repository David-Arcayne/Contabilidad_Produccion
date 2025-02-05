import { URL_APIP } from "../../../../lib/services.js"; 
import { mostrar_ordenproduccion,listar_detalle_produccion,listar_Empleados,select_lista_productos} from "../funciones/listar.js"; 

let Lista_Orden_Producciones =[];
let Lista_detalle_orden_produccion = [];
let Lista_empleados = [];
let Lista_productos =[];
function importar_select_lista_productos(){
    return select_lista_productos(uk[0].empresa.idempresa).then(data => {
        Lista_productos = data;
        console.log(Lista_productos);
    })
}

function importar_mostrar_ordenproduccion(){
    return mostrar_ordenproduccion(uk[0].empresa.idempresa).then(data => {
        Lista_Orden_Producciones = data;
            console.log(Lista_Orden_Producciones)
        });
    
}
function importar_Lista_detalle_orden_produccion(){
    return listar_detalle_produccion(uk[0].empresa.idempresa).then(data => {
        Lista_detalle_orden_produccion = data;
            console.log(Lista_detalle_orden_produccion)
        });
    
}
function importar_listar_Empleados(){
    return listar_Empleados(uk[0].empresa.idempresa).then(data => {
        Lista_empleados = data;
            console.log(Lista_empleados)
        });
    
}

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";


export function administracion_solicitudes(code, permisos, refrescar) {

    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
    
}
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "admin_sollicitudes";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}


function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "pendiente_enviar":
            pendiente_enviar();
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

function sitio(){
    
  let view = `
    
        <h5 class="text-center mb-4 fw-bold fs-6"></h5>
        <div id="alerta${codigo}" class="mt-4"></div>

        <div class="row">
            <div class="col-md-4">
                <div class="p-3 bg-light border rounded">
                    <div class="col-md-8 mb-3 " id="menu">
                        <nav class="nav nav-pills nav-fill">
                            <li class="nav-item">
                                <button class="nav-link active" data-section="pendientes" style="background-color:blue; color:white;">Pendientes</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="encurso" style="background-color:white; color:black;">En curso</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="finalizados" style="background-color:white; color:black;">Finalizados</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="negativos" style="background-color:white; color:black;">Negativos</button>
                            </li>
                        </nav>
                    </div>
                    <div id="filtrar${codigo}" class="item-list" style = "max-height: 400px; overflow-y: auto; display: block;">
                       
                    </div>
                </div>
            </div>

            <div class="col-md-8">
                <div class="p-3 bg-light border rounded" id="contenido${codigo}">
                    
                   
                </div>
            </div>
        </div>
    
  `;
     app.innerHTML=view;
    
    return Promise.all([
        importar_mostrar_ordenproduccion(),
        importar_Lista_detalle_orden_produccion(),
        importar_select_lista_productos(),
        importar_listar_Empleados()

    ])
    .then(() => {
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
    .catch(error => {
        console.error('Error:', error);
    });
    
     
   
 }
 function pendiente_editar(){
    const contentArea = document.getElementById(`contenido${codigo}`);
    contentArea.innerHTML = '';
    let view ="", ind = 1;
    view = `
        <div class="container">
        
        <h5 class="text-center mb-4 fw-bold fs-6">Orden de Producción</h5>

        <form id="formulario${codigo}">
            <input type="hidden" name="estado" value="0">
            <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" name="idempleado" value="${uk[0].idusuario}">
            <input type="hidden" name="idorden_produccion" value="">

            <div class="row g-3">
                 <div class="row g-3">
                <div class="col-md-4">
                    <label for="empleado" class="form-label">Solicitante: ${uk[0].nombre}</label>
                  
                </div>

                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha solicitud: ${"fecha"}</label>
                    
                </div>

                <div class="col-md-4">
                    <label for="hora" class="form-label">Hora solicitud: ${"hora"}</label>
                    
                </div>

                <div class="col-md-4">
                    <label for="producto" class="form-label">Producto:</label>
                    <select id="producto_idproducto${codigo}" name="producto_idproducto" class="form-select">
                        <option value="1">Producto A</option>
                        <option value="2">Producto B</option>
                    </select>
                </div>

                <div class="col-md-4">
                    <label for="cantidad" class="form-label">Cantidad:</label>
                    <input type="number" class="form-control" id="cantidad" name="cantidad" required>
                </div>

                <div class="col-md-12">
                    <label for="observaciones" class="form-label">Observaciones:</label>
                    <textarea class="form-control" id="observaciones" name="observaciones" required></textarea>
                </div>

                <div class="col-md-12 mt-3 d-flex justify-content-between">
                    <button type="button" class="btn btn-primary btn-sm" id = "limpiar${codigo}">Limpiar</button>
                    <button type="submit" class="btn btn-success btn-lg"><i class="bi bi-plus-lg"></i></button>
                    
                </div>

            </div>
        </form>
        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${codigo}">
              
            </tbody>
        </table>
        <div class="col-md-12 mt-3 d-flex justify-content-between">
            <button type="button" class="btn btn-primary btn-sm" id="cancelar${codigo}">Cancelar</button>
            <button type="button" class="btn btn-success btn-lg" id="editar${codigo}">Editar</button>
                    
        </div>
    </div>
    `;
    contentArea.innerHTML = view;
 }
 function pendiente_suspender(){

 }
 function pendiente_enviar(){
    const contentArea = document.getElementById(`contenido${codigo}`);
    contentArea.innerHTML = '';
    let view ="", ind = 1;
    view = `
        <form id="formulario${codigo}">
            <div class="row g-3">
                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha prevista de entrega:</label>
                    <input type="date" class="form-control" id="fecha" name="fecha">
                </div>

                <div class="col-md-4">
                    <label for="hora" class="form-label">Hora prevista de entrega:</label>
                    <input type="time" class="form-control"  name="hora" >
                </div>

            </div>
            <div class="mb-3">
                <label for="fecha_lote" class="form-label">Fecha registro</label>
                <input type="date" class="form-control" id="fecha_lote" name="fecha_lote" required>
            </div>

            
            <div class="mb-3">
                <label for="hora_lote" class="form-label">Hora registro</label>
                <input type="time" class="form-control" id="hora_lote" name="hora_lote" required>
            </div>

            <div class="mb-3">
                <label for="nombre_lote" class="form-label">Nombre del Lote</label>
                <input type="text" class="form-control" id="nombre_lote" name="nombre_lote" maxlength="60" placeholder="Nombre del lote" required>
            </div>

            

            

        
        </form>
    
        <table class="table table-hover mt-3" >
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${codigo}">
              
            </tbody>
        </table>
        <div class="col-md-12 mt-3 d-flex justify-content-between">
                    <button type="button" class="btn btn-primary btn-sm" id="cancelar${codigo}">Cancelar</button>
                    <button type="button" class="btn btn-success btn-lg" id="registrar${codigo}"> <i class="bi bi-send"></i> Produción</button>
                    
        </div>
    `;
    contentArea.innerHTML = view;
 }
 function mostrar_progreso_de_solicitud(){
    const contentArea = document.getElementById(`contenido${codigo}`);
    contentArea.innerHTML = '';
    let view ="", ind = 1;
    view = `
        
    
        <table class="table table-hover mt-3" >
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Etapa produccion</th>
                    <th scope="col">Fecha inicio</th>
                    <th scope="col">Hora inicio</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${codigo}">
              
            </tbody>
        </table>
        
    `;
    contentArea.innerHTML = view;
 } 
 function mostrar_finalizados_desarrollo(){
    const contentArea = document.getElementById(`contenido${codigo}`);
    contentArea.innerHTML = '';
    let view ="", ind = 1;
    view = `
        
    
        <table class="table table-hover mt-3" >
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Fecha inicio</th>
                    <th scope="col">Hora inicio</th>
                    <th scope="col">Fecha finalizacion</th>
                    <th scope="col">Hora finalizacion</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${codigo}">
              
            </tbody>
        </table>
        
    `;
    contentArea.innerHTML = view;
 }
 function negativos_mostrar(){
    const contentArea = document.getElementById(`contenido${codigo}`);
    contentArea.innerHTML = '';
    let view ="", ind = 1;
    view = `
        <div class="container">
        
        <h5 class="text-center mb-4 fw-bold fs-6">Orden de Producción</h5>

        <form id="formulario${codigo}">
            <input type="hidden" name="estado" value="0">
            <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" name="idempleado" value="${uk[0].idusuario}">
            <input type="hidden" name="idorden_produccion" value="">

            <div class="row g-3">
                 <div class="row g-3">
                <div class="col-md-4">
                    <label for="empleado" class="form-label">Solicitante: ${uk[0].nombre}</label>
                  
                </div>

                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha solicitud: ${"fecha"}</label>
                    
                </div>

                <div class="col-md-4">
                    <label for="hora" class="form-label">Hora solicitud: ${"hora"}</label>
                    
                </div>

                

            </div>
        </form>
        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${codigo}">
              
            </tbody>
        </table>
        
    </div>
    `;
    contentArea.innerHTML = view;
 }
 function mostrarSeccion(section) {
    const contentArea = document.getElementById(`filtrar${codigo}`);
    contentArea.innerHTML = ''; 
    switch(section) {

        case 'pendientes':
            mostrar_pendientes();
            break;
        case 'encurso':
            mostrar_encurso();
            break;
        case 'finalizados':
            mostrar_finalizados();
            break;
        case 'negativos':
            mostrar_negativos();
            break;
        
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}
function mostrar_pendientes(){
   
    let lista_pendientes = Lista_Orden_Producciones.filter(Obj => Obj.estado === 0);
    const mon=document.querySelector(`#filtrar${codigo}`);
    let view="",ind=1;
    lista_pendientes.map(lista =>{
        let empleado = Lista_empleados.find(obj => Number(obj.id) === lista.empleado_idempleado );

        view +=`
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
            <span>${ind++}   ${ lista.fecha_orp}   ${ lista.hora_orp}</span>
            <span> Empleado: ${empleado.nombre}   </span>

            <div>
                <a data-id="pendiente_enviar,${lista.idorden_produccion}" 
                class="btn btn-success btn-sm rounded-circle " >
                    <i class="bi bi-send-check fs-5"></i>
                </a>
                <a data-id="cancelar_orden,${lista.idorden_produccion},Productos" 
                class="btn btn-danger btn-sm rounded-circle " >
                    <i class="bi bi-send-x fs-5"></i>
                </a>
                <a data-id="pendiente_editar,${lista.idorden_produccion}" 
                class="btn btn-primary btn-sm rounded-circle " >
                    <i class="bi bi-eye fs-5"></i>
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
function mostrar_encurso(){
    
    const mon=document.querySelector(`#filtrar${codigo}`);
    let view="",ind=1;
        
            view=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                <span>${1}  ${"lista.nombre"}   ${"lista.codigo"}</span>
              
                <a data-id="mostrar_progreso_de_solicitud" 
                    class="btn btn-primary btn-sm rounded-circle " >
                        <i class="bi bi-activity fs-5"></i>
                    </a>
            </div>`;
        
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });


}
function mostrar_finalizados(){
    
    const mon=document.querySelector(`#filtrar${codigo}`);
    let view="",ind=1;
        
            view=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                <span>${1}  ${"lista.nombre"}   ${"lista.codigo"}</span>
                <a data-id="mostrar_finalizados_desarrollo" 
                    class="btn btn-primary btn-sm rounded-circle " >
                        <i class="bi bi-kanban-fill fs-5"></i>
                    </a>
            </div>`;
        
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });


}

function mostrar_negativos(){
    
    const mon=document.querySelector(`#filtrar${codigo}`);
    let view="",ind=1;
        
            view=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                <span>${1}  ${"lista.nombressss"}   ${"lista.codigo"}</span>
                <div>
                    <a data-id="Agregar_a_grupo,${'lista.idproduct_comercial'},Productos" 
                    class="btn btn-success btn-sm rounded-circle " >
                        <i class="bi bi-align-start fs-5"></i>
                    </a>
                    
                    <a data-id="negativos_mostrar" 
                    class="btn btn-primary btn-sm rounded-circle " >
                        <i class="bi bi-eye fs-5" ></i>
                    </a>
                </div>
            </div>`;
        
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });

}