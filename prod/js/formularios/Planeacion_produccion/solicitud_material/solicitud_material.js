import { URL_APIP } from "../../../../../lib/services.js";

import { codigos } from "../constantes.js";
import * as listarFunctions from "../../funciones/listar.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let overlayy;
let app = "";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let id_orden_produccion;

let intervaloId;
let isEditing = false;
let aux=[];


async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.mostrar_orden_produccion(id_orden_produccion),
            listarFunctions.select_lista_productos(idEmpresa)
        ]);

        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}

const codigo = codigos.codigoRegistrar_usuMaquina;

export async function modal_solicitud_material_produccion(code, permisos, refrescar, id) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;

    id_orden_produccion = id;
  
    sitio();    
}
function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    switch (funcion) {
        case "eliminar":
            eliminarOrdenProduccion(id1);
            break;
        
        case "editar":
            toggleEditSave(event);
            break;
        default:
            console.error("Entro aqui");
            break;
    }

}


async function sitio() {
    await listar();
    app.style.position = 'relative';
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.cursor = 'pointer';
    app.appendChild(overlay);
    const variable = document.createElement('div');
    variable.style.width = '1000px';
    variable.style.height = '580px';

    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.cursor = 'auto';
    variable.style.maxHeight = '680px';
    variable.style.overflowY = 'auto';
    variable.style.display = 'block';
    overlay.appendChild(variable);
    

    let view = `
         <a style="float: right;" class ="cerrar"><i class="bi bi-x-lg fs-5"></i></a>
         <div class="container">
        
        <h5 class="text-center mb-4 fw-bold fs-6">Solicitud material</h5>

        <form id="formulario${codigo}">
            <input type="hidden" name="estado" value="0">


            <div class="row g-3">
                 <div class="row g-3">
                <div class="col-md-4">
                    <label for="empleado" class="form-label">Usuario solicitante:</label>
                    <input type="text" class="form-control" id="empleado" name="empleado" value = "" readonly>
                </div>

                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha solicitud:</label>
                    <input type="date" class="form-control" id="fecha" name="fecha" value = "">
                </div>

                <div class="col-md-4">
                    <div class="row">
                        <div class = "col">
                            <label for="hora" class="form-label">Hora solicitud:</label>
                            <input type="text" class="form-control" id="hora" name="hora" value="">
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <label for="material_idmaterial" class="form-label">Material:</label>
                    <select id="material_idmaterial${codigo}" name="material_idmaterial" class="form-select">
                        <option value="1">Material A</option>
                        <option value="2">Material B</option>
                    </select>
                </div>

                <div class="col-md-4">
                    <label for="cantidad" class="form-label">Cantidad:</label>
                    <input type="number" class="form-control" id="cantidad" name="cantidad" required>
                </div>
                <div class="col-md-4">
                    <label for="medida" class="form-label">Medida:</label>
                    <input type="text" class="form-control" id="medida" name="medida" value = "Kg" required readonly>
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
        <div id="alerta${codigo}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Material</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="Lista_solicitud_material${codigo}">
              
            </tbody>
        </table>
        <div class="col-md-12 mt-3 d-flex justify-content-between">
            <button type="button" class="btn btn-primary btn-sm" id="cancelar${codigo}">Cancelar</button>
            <button type="button" class="btn btn-success btn-lg" id="registrar${codigo}">Registrar</button>        
        </div>
    </div>
    `;
    variable.innerHTML = view;
    overlayy = overlay;
   
    // Listar_productos_select();
    // Listar_detalle_orden_produccion(Orden_produccion_detalle.detalles);
        

        
        

        
     
    variable.addEventListener('click', function(event) {
        //console.log(event.target);
        let aTag = event.target.closest('a.cerrar');

        if (aTag) {
            event.preventDefault();
            cerrarModal();

        }
       
    });
    function cerrarModal() {
        overlay.remove(); 
        Lista_Orden_Produccion = [];
        app.style.removeProperty('position');  
    }
}

function alertas(data) {
    console.log(data);
    // Definir las variables al principio
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "success") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;
        
        // Resetear el formulario si existe
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        
        // if(data[2]==="Editar_orden_produccion_lista_completa"){
            
        //     sitio();
            
        //     // overlayy.remove(); 
        //     // Lista_Orden_Produccion = [];
        //     // app.style.removeProperty('position');  
        // }
        
    } else {
        if(data[0] == "danger"){

            
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