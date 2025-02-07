import { insumos_relacionados } from "./buscar_materiales_relacionados.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "despachar_materiales_alacen";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}
export function despachar_materiales_alacensssss(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
}
function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "material_solicitado":
            material_solicitado(id1);
            break;
        case "buscar_materiales_relacionados":
            buscar_materiales_relacionados(id1);
            break;
        default:
            sitio();
            break;
    }
}
function buscar_materiales_relacionados(id){
    
}
function material_solicitado(id){
    const contentArea = document.getElementById(`contenido${codigo}`);
    contentArea.innerHTML = '';
    let view ="", ind = 1;
    view = `
        <table class="table table-bordered table-hover">
        <thead class="table-dark">
            <tr>
                <th>Empleado</th>
                <th>Fecha Solicitud</th>
                <th>Hora Solicitud</th>
                <th>Producción Etapa</th>
                <th>Detalles de la Solicitud</th>
                <th>Funciones</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Juan Pérez</td> <!-- Nombre del empleado -->
                <td>2024-09-26</td> <!-- Fecha de la solicitud -->
                <td>08:30:00</td> <!-- Hora de la solicitud -->
                <td>Etapa 1</td> <!-- Producción Etapa -->
                <td>
                    <ul>
                        <li>Cantidad: 50, Entidad: Material A, ID: 1001</li>
                        <li>Cantidad: 20, Entidad: Material B, ID: 1002</li>
                    </ul>
                </td>
                <td>
                    <a data-id="buscar_materiales_relacionados" 
                    class="btn btn-primary btn-sm rounded-circle " >
                        <i class="bi bi-search fs-5"></i>
                    </a>
                </td>
            </tr>
            <tr>
                <td>María López</td>
                <td>2024-09-26</td>
                <td>09:15:00</td>
                <td>Etapa 2</td>
                <td>
                    <ul>
                        <li>Cantidad: 10, Entidad: Material C, ID: 1003</li>
                    </ul>
                </td>
                <td>
                    <a data-id="buscar_materiales_relacionados" 
                    class="btn btn-primary btn-sm rounded-circle " >
                        <i class="bi bi-search fs-5"></i>
                    </a>
                </td>
            </tr>
        </tbody>
    </table>
    `;
    contentArea.innerHTML = view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });
}
function sitio(){
    let view=`
       <h5 class="text-center mb-4 fw-bold fs-6"></h5>
        <div id="alerta${codigo}" class="mt-4"></div>

        <div class="row"> 
            <div class="col-md-4">
                <div class="p-3 bg-light border rounded">
                    <div class="col-md-8 mb-3 " id="menu">
                        <nav class="nav nav-pills nav-fill">
                            <li class="nav-item">
                                <button class="nav-link active" data-section="pendientes" style="background-color:blue; color:white;">Solicitudes pendientes</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="finalizados" style="background-color:white; color:black;">Solicitudes finalizados</button>
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

    ])
    .then(() => {

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
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}

function mostrar_pendientes(){
   
    //let lista_pendientes = Lista_Orden_Producciones.filter(Obj => Obj.estado === 0);
    const mon=document.querySelector(`#filtrar${codigo}`);
    let view="",ind=1;
    //lista_pendientes.map(lista =>{
        //let empleado = Lista_empleados.find(obj => Number(obj.id) === lista.empleado_idempleado );

        view =`
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
            <span>${ind++}   ${ "fecha"}   ${ "hora"}</span>
            <span> Empleado: ${"empleado.nombre"}   </span>

            <div>
                <a data-id="pendiente_enviar,${"lista.idorden_produccion"}" 
                class="btn btn-success btn-sm rounded-circle " >
                    <i class="bi bi-send-check fs-5"></i>
                </a>
                <a data-id="cancelar_orden,${"lista.idorden_produccion"},Productos" 
                class="btn btn-danger btn-sm rounded-circle " >
                    <i class="bi bi-send-x fs-5"></i>
                </a>
                <a data-id="material_solicitado,${"lista.idorden_produccion"}" 
                class="btn btn-primary btn-sm rounded-circle " >
                    <i class="bi bi-eye fs-5"></i>                
                </a>
            </div>
            
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
            <span>${ind++}   ${ "fecha"}   ${ "hora"}</span>
            <span> Empleado: ${"empleado.nombre"}   </span>

            <div>
                <a data-id="pendiente_enviar,${"lista.idorden_produccion"}" 
                class="btn btn-success btn-sm rounded-circle " >
                    <i class="bi bi-send-check fs-5"></i>
                </a>
                <a data-id="cancelar_orden,${"lista.idorden_produccion"},Productos" 
                class="btn btn-danger btn-sm rounded-circle " >
                    <i class="bi bi-send-x fs-5"></i>
                </a>
                <a data-id="material_solicitado,${"lista.idorden_produccion"}" 
                class="btn btn-primary btn-sm rounded-circle " >
                    <i class="bi bi-eye fs-5"></i>                
                </a>
            </div>
            
        </div>`;

    //})   
        
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });

}
function sendformData(event, formData) {
    event.preventDefault();

    fetch(`./api/`, { // Reemplaza esto con la URL de tu servidor
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alertas(data);
    })
    .catch(error => {
        console.error('Error al enviar los datos:', error);
    });
}



function sendform(e,form){
        console.log(form);
        e.preventDefault();
        const dato=new FormData(form);
        console.log(dato);

        fetch(`./api/`,{
            method:"POST",
            body:dato
        })
        .then(res=>res.json())
        .then(data=>{

            alertas(data);
        })
    
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
        if(data[2]=="editar_estado_divisa"){
            return;
        }
        // Resetear el formulario si existe
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        if(data[2]==="registrar_divisa"){
            listar_divisas();

        }
        if(data[2]==="eliminar_divisa"){
            console.log(List_Divisa);

            console.log(obt_divisa_aux);
            List_Divisa = List_Divisa.filter(obj => obj.id !== Number(obt_divisa_aux['id']));
            console.log(List_Divisa);
            listar_divisasArray();
            obt_divisa_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        if(data[2]==="editar_divisa"){
            obt_divisa_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="editar_divisa"){
                const obj = List_Divisa.find(ob => ob.id === obt_divisa_aux['id']);

                console.log(obt_divisa_aux);

                console.log(obj);
                if (obt_divisa_aux) {
                    Object.assign(obj, obt_divisa_aux);
                }
                console.log(obt_divisa_aux);

                console.log(obj);
                console.log(List_Divisa);
                listar_divisasArray();
                obt_divisa_aux = { ...{ id: 0, nombre: "", sigla: "" } };

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