import { URL_APIP } from "../../../../lib/services.js";
import { Editar_tabla_celda } from "../funciones/dbc_editar_celda_table.js";
import { Editar_table_fila } from "../funciones/editar_fila_table.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let List_medida =[];
let obt_medida_aux = {
    "id" : 0,
    "nombre" : "",
    "sigla" : ""
};

export function unidad_tiempo_config(code, permisos, refrescar,codigo) {
    app=document.querySelector(`#principal${codigo}`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();        
}
let Lista_unidad_tiempo = [];

let obt_unidad_aux = {
    'id_unidad':-1,
    'nombre':'',
    'descripcion':'',
    'estado':-1,
};
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "unidad_tiempo_config";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}

function menuTabla(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const forme = document.querySelector(`#alerta`);
    switch (funcion) {
        case "eliminarUnidadTiempoControl":
            

            eliminarUnidadTiempoControl(id1);
            break;
        case "editar_estado_unidad_producto":
            editar_estado_unidad_producto(event);
            break;
        case "editar_unidad_tiempo":
            toggleEditSave(event);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}
function toggleEditSave(event) {
    const permisos = [1, 2];
    const opciones_select = [];
    const opciones_number = [];
    const names = [
      "unidad",
      "detalle",
      
    ];
    const names2 = [
      "unidad",
      "detalle",
    ];
    const url_api = "editarUnidadTiempoControl";
    const ver = "verDavid";
    const nom_v_Emp = "empresa_idempresa";
    const md5 = uk[0].empresa.idempresa;
    const id = "idcontrol_unidad_tiempo";
    console.log(codigo);
    Editar_table_fila(event,codigo,Lista_unidad_tiempo,permisos, names,names2,opciones_select,opciones_number,url_api,ver,nom_v_Emp,md5,id);
}
function edit_Celda_table(e){
    const elementos_select = [
      ];
      const elementos_number = [];
      const url_api = "editarUnidadTiempoControl";
      const ver = "verDavid";
      const nom_v_Emp = "empresa_idempresa";
      const md5 = uk[0].empresa.idempresa;
      const id = "idcontrol_unidad_tiempo";
    
      Editar_tabla_celda(e,Lista_unidad_tiempo,codigo,elementos_select,elementos_number,url_api,ver,nom_v_Emp,md5,id);
}

function eliminarUnidadTiempoControl(id){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminarUnidadTiempoControl/${id}`, {
            headers: {
              "Usar-Listado-David": "true",
            },
          })
        .then(res=>res.json())
        .then(data=>{
            obt_unidad_aux ={...Lista_unidad_tiempo.find(obj => obj.id === Number(id))};

            alertas(data);
            console.log(obt_unidad_aux);

        })
    }
   
}

function editar_estado_unidad_producto(event){
    const boton = event.currentTarget;
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(','); 
    let objeto = Lista_unidad_tiempo.find(obj => obj.id === Number(id1));
   
    let est = objeto.estado == 1 ?   `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`: `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>`;
   
    const formData = new FormData();
    formData.append('ver', funcion);
    formData.append('id', id1);
    formData.append('empresa', id2);
    formData.append('estado', objeto.estado == 0 ? 1 : 0);
    objeto.estado = objeto.estado == 0 ? 1 : 0;
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    sendformData(event, formData);
    console.log("Cambio de estado confirmado");
    boton.innerHTML = est;
}

function sitio(){

    let view=`
        <div class="container">
            
            <h5 class="text-center mb-4 fw-bold fs-6" >Unidad tiempo</h5>
            <form id="formulario${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                <input type="hidden" name="verDavid" value="registroUnidadTiempoControl">
                <input type="hidden" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
               
                <div class="row">
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="unidad">Unidad</label>
                            <input type="text" class="form-control" id="unidad" name="unidad" placeholder="Ingrese la unidad" maxlength="50" required>
                        </div>
                    </div>
                
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="detalle">Detalle</label>
                            <textarea class="form-control" id="detalle" name="detalle" rows="3" placeholder="Ingrese detalles (hasta 255 caracteres)" maxlength="255" required></textarea>
                        </div>
                    </div>
              
                   
                </div>
            
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="agre" >Guardar</button>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn${codigo}" aria-label="Cancelar">Cancelar</button>          
            </form>
            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>

            <div id="alerta${codigo}" class="mt-4"></div>
            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
                
            </div>
            <div class="scrollable-table mt-4" >

                <table class="table table-hover" id = "editableTable${codigo}">
                    <thead>
                        <tr class="table-dark">
                            <th scope="col">N°</th>
                            <th scope="col">Unidad tiempo</th>
                            <th scope="col">Descripcion</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listaUnidadTiempoControl">              
                    </tbody>
                </table>
            </div>
        </div>
    `;
    app.innerHTML=view;

    listaUnidadTiempoControl();
    const forme = document.querySelector(`#formulario${codigo}`);
  
    forme.addEventListener("submit", (e) => sendform(e, forme));
    const cancelarBtn = document.getElementById(`cancelarBtn${codigo}`);
    cancelarBtn.addEventListener('click', () => {
        forme.reset();
    });
    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e,table));
    const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup",(e)=> filtrar_table(e,input));
    const toggleButton = document.getElementById(`toggleButton${codigo}`);
    toggleButton.addEventListener("click", (e) => mostrarFormulario(e,toggleButton));
  
}
function mostrarFormulario(e,toggleButton){
    const myForm = document.querySelector(`#formulario${codigo}`);

    if (myForm.style.display === "none" || myForm.style.height === "0px") {
        myForm.style.display = "block";
        setTimeout(() => {
            myForm.style.height = myForm.scrollHeight + "px";
            myForm.style.opacity = 1;
        }, 10);  // Un pequeño retraso para asegurar que la transición ocurra
        toggleButton.innerHTML = '<i class="bi bi-dash-lg danger"></i>';
    } else {
        myForm.style.height = "0";
        myForm.style.opacity = 0;
        setTimeout(() => {
            myForm.style.display = "none";
        }, 500);  // Esperar a que termine la transición
        toggleButton.innerHTML = '<i class="bi bi-plus"></i>';
    }

}
function filtrar_table(e,input){
    const table = document.getElementById(`editableTable${codigo}`);
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = tbody.getElementsByTagName('tr');
    input.addEventListener('keyup', function() {
        const filter = input.value.toLowerCase();

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let cells = row.getElementsByTagName('td');
            let rowText = '';

            for (let j = 0; j < cells.length; j++) {
                rowText += cells[j].textContent.toLowerCase() + ' ';
            }

            if (rowText.includes(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}
function areObjectsEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}

function listaUnidadTiempoControl(){
    
    fetch(`${URL_APIP}api/listaUnidadTiempoControl/${uk[0].empresa.idempresa}`, {
        headers: {
          "Usar-Listado-David": "true",
        },
      })
    .then(res=>res.json())
    .then(data=>{
        
        Lista_unidad_tiempo = data;     
    
        listaUnidadTiempoControlArray();
        
        
    })
}
function listaUnidadTiempoControlArray(){
    const mon=document.querySelector("#listaUnidadTiempoControl");
    let view="",ind=1;
        Lista_unidad_tiempo.map(lista=>{
            console.log(Lista_unidad_tiempo);
           

            view+=`
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.idcontrol_unidad_tiempo},unidad,unidad">${lista.unidad}</td>
                
                <td data-type="${lista.idcontrol_unidad_tiempo},detalle,detalle">${lista.detalle}</td>
                <td>
                    
                    <div class="d-flex gap-3">
                        <div class="text-center">
                            <a  data-id="editar_unidad_tiempo,${lista.idcontrol_unidad_tiempo}"
                            class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Editar unidad tiempo">
                                <i class="bi bi-pencil-square fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small">Editar</span>
                        </div>
                        <div class="text-center">
                            <a  data-id="eliminarUnidadTiempoControl,${lista.idcontrol_unidad_tiempo}" 
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Eliminar unidad tiempo">
                                <i class="bi bi-trash fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small">Eliminar</span>
                        </div>
                        
                        
                        
                    </div>                             
                </td>
            </tr>`;
        })
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuTabla);
        });
}

function sendformData(event, formData) {
    event.preventDefault();

    fetch(`${URL_APIP}api/`, { // Reemplaza esto con la URL de tu servidor
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

        fetch(`${URL_APIP}api/`,{
            method:"POST",
            body:dato,
            headers: {
                'Usar-Registro-David': 'true'
            }
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
    if (data[0] == "success" || data[0] === "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;
        
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        
        listaUnidadTiempoControl();

       
        
    } else {
        if(data[0] == "Error"){

            
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