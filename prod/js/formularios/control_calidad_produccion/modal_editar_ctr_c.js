import { listadoEvaluacionCaracteristicas, listadoCriterio } from "../funciones/obtener.js";
import { URL_APIP } from "../../../../lib/services.js";

import * as encurso from "./encurso.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);



let app = "";
let code ;
let privilegios;
let codigo;
let listas;
let id_Detalle;
let id;
let criterio;
let evaluacion;
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "modal_ctrl_cld";
function rand(){
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    switch (funcion) {
        case "Editar_control_calidad_criterio":
            Editar_control_calidad_criterio();
            break;
        case "Eliminar_control_calidad_criterio":
            Eliminar_control_calidad_criterio(id1);
            break;
        default:
            sitio();
            break;
    }

}

export async function modal_control_calidad_editar(codigo_,code_,previlegios_,listas_,id_Detalle_,id_,criterio_,evaluacion_) {
    app=document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
    codigo = codigo_;
    code = code_;
    privilegios = previlegios_;
    listas = listas_;
    id_Detalle = id_Detalle_;
    id = id_;

    criterio = criterio_;
    evaluacion = evaluacion_;
    console.log(listas);
    console.log("codigo: "+codigo);
    console.log("privilegios: "+privilegios);
    console.log("iddetalle: "+id_Detalle);
    console.log("id "+ id);
    sitio();    
    
}
//export function modal_control_lista(codigo_,code_,previlegios_,listas_,id_Detalle_,id_) {
async function Eliminar_control_calidad_criterio(ids){

    let x = await listadoEvaluacionCaracteristicas();
    let y = await listadoCriterio();
    console.log(x);
    console.log(y);
    let z = y.filter(obj => obj.detalle_control_calidad_iddetalle_control_calidad === id);
    let k = x.filter(obj => z.some(item => item.idcriterio_control_calidad === obj.criterio_control_calidad_idcriterio_control_calidad));
    criterio = z;
    console.log(criterio);
    evaluacion = k;
    console.log(evaluacion);
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminar_criterio/${ids}`, {
            headers: {
                'Usar-Listado-David': 'true' 
            }
        })
        .then(res=>res.json())
        .then(data=>{
            
            Listar_detalle_control_calidad();

            console.log(data,ids,id);
            alertas(data);
        })
    }
}
async function Editar_control_calidad_criterio(){
    console.log("codigo: "+codigo);
    console.log("privilegios: "+privilegios);
    console.log("iddetalle: "+id_Detalle);
    console.log("id "+ id);

    modal_control_lista(codigo,code,privilegios,listas,id_Detalle,id);
}
function sitio() {
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
    variable.style.width = '1300px';
    variable.style.height = '680px';
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
        <div class="mt-4" style = "max-height: 500px; overflow-y: auto; display: block;">
            <div id="alerta${subcodigo}"></div>

            <table class="table table-hover">
                <thead>
                    <tr class="table-dark">
                        <th>N°</th>
                        <th>Material</th>
                        <th>Cantidad</th>
                        <th>Funciones</th>
                    </tr>
                </thead>
                <tbody id="Listar_detalle_control_calidad${subcodigo}">
                    
                </tbody>
            </table>
        </div> 
    `;
    variable.innerHTML = view;
    Listar_detalle_control_calidad();
    
    
    variable.addEventListener('click', function(event) {
        let aTag = event.target.closest('a.cerrar');
        if (aTag) {
            event.preventDefault();
            cerrarModal();
        }
    });
    function cerrarModal() {
        overlay.remove(); 
        app.style.removeProperty('position');  
        encurso.mostrar_control_calidad(id);

    }
}
function seleccionar_entidad_tipo(entidad_tipo,entidad_id){
    if(entidad_tipo == "Material"){
        return listas.material.find(obj => obj.id === Number(entidad_id));
    }
    return {};
}
function Listar_detalle_control_calidad(){
    let a = {
        "idcriterio_control_calidad": "6",
        "calificacion": "6.5",
        "observaciones": "detalle",
        "peso_bruto": "13.5",
        "peso_envase": "1.5",
        "peso_neto": "12",
        "cantidad": "2",
        "detalle_control_calidad_iddetalle_control_calidad": "1"
    };
    let dcc= {
        "iddetalle_control_calidad": "1",
        "cantidad": "2",
        "entidad_tipo": "Material",
        "entidad_id": "39",
        "estado": null,
        "control_calidad_idcontrol_calidad": "1"
    };
    const area=document.querySelector(`#Listar_detalle_control_calidad${subcodigo}`);
        let view="",ind=1;
        console.log(criterio);
            criterio.map(lista=>{
                console.log(listas.detallecalidad);
                let itemdcc = listas.detallecalidad.find(obj => obj.iddetalle_control_calidad === lista.detalle_control_calidad_iddetalle_control_calidad);
                console.log(itemdcc);
                let itemMaterial = seleccionar_entidad_tipo(itemdcc.entidad_tipo,itemdcc.entidad_id);
                console.log(itemMaterial);
            view+=`
             <tr>
                <td>${ind++}</td>                
                <td ">${itemMaterial.nombre}</td>
                
                <td ">${lista.cantidad}</td>                
                <td>
                    
                    <a data-id="Eliminar_control_calidad_criterio,${lista.idcriterio_control_calidad}" class="btn btn-danger btn-sm" id="btn${codigo}">
                        <i class="bi bi-trash"></i>
                    </a> 
                                              
                </td>
            </tr>
            `;
        })
        area.innerHTML = view;

        const enlaces = document.querySelectorAll(`#btn${codigo}`);
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });
}

function alertas(data) {
    console.log(data);
    let alertClass, alertMessage, timeoutDuration;
    if (data[0] == "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 500;
        
    } else {
        if(data[0] == "danger"){
            alertClass = 'alert-danger';
            alertMessage = data[1];
            timeoutDuration = 2000;
            
        }else{
            alertClass = 'alert-primary';
            alertMessage = data[1];
            timeoutDuration = 3000;

        }
    }
    
    let divalert = document.querySelector(`#alerta${subcodigo}`);
    if (divalert) {
        let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
        divalert.innerHTML = nuevoContenido;
        
        setTimeout(() => {
            divalert.innerHTML = ``;
            
        }, timeoutDuration);
    }
}


   





