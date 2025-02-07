import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { crearModal } from "../../funciones/modales/modal_registrar.js";
import { crearModalPasos } from "../../funciones/modales/modal_registrar.js";
import * as html_star_etapa_produccion from "../html/html_comenzar_etapa_produccion.js"
import * as html_fin_etapa_produccion from "../html/html_finalizar_etapa_produccion.js"
import * as html_uso_maquinas from "../html/html_uso_de_maquina.js"
import * as html_detalle_etapa from "../html/html_detalle_etapa.js"
import { URL_APIP } from "../../../../../lib/services.js";
import * as registerFuntions from "../../funciones/registrar.js"
import { detalle_produccion } from "./detalle_produccion.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let id_grupo_etapas;
let id_produccion;

let Orden_produccion_detalle;
let Lista_empleados;

let aux=[];

let Lista_productos =[];
let List_Maquina = [];
let Lista_etapas_produccion = [];
let Lista_etapas_producto = [];
const subcodigo = codigos.codigoplanaceacion_etapas;
export async function produccion_etapas_produccion(code, permisos, refrescar,ids) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    id_grupo_etapas = ids[0];
    id_produccion = ids[1];
    app=document.querySelector(`#contenido1${codigos.codigoproduccion_comenzar}`);
    sitio();    
    
}




function menu(event) {
    const dataid = event.currentTarget.getAttribute("data-id");
    const [funcion, id1, id2] = dataid.split(",");
    switch (funcion) {
        case "comenzar_etapa_produccion":
            modal_comenzar_etapa(id1);
            break;
    
        case "Finalizar_etapa_produccion":
            modal_finalizar_etapa(id1);
            break;
        case "registrar_uso_maquinas":
            modal_registrar_uso_maquina(id1);
            break;
        case "Detalle_etapa":
            modal_mostrardetalle_etapa(id1);
            break;
        default:
            sitio();
            break;
    }
}
function modal_mostrardetalle_etapa(id){
    let itemEtapa = Lista_etapas_produccion.find(obj => Number(obj.idetapas_produccion) === Number(id));
    console.log(itemEtapa);
    const modal = crearModal({
        code: code_,
        id: `modal_mostrardetalle_etapa${subcodigo}`,
        header: '<h5 class="text-center mb-4 fw-bold fs-6">Detalle</h5>',
        body: html_detalle_etapa.getBody(),
        footerButtons: [
        ]
    });

    document.getElementById(`detalle${codigos.codigodetalleEtapa}`).innerHTML = itemEtapa.detalle;
}
function modal_registrar_uso_maquina(id){
    crearModalPasos({
        code: code_,
        id: `modal_registro_de_uso_maquina${subcodigo}`,
        header: html_uso_maquinas.getTitle(),
        steps: [
            html_uso_maquinas.getBody(),
            //html_uso_maquinas.getBody_2(),
            
        ],
        footerButtons: [
            {
                id: 'customButton',
                class: 'btn-custom',
                text: 'Custom Button',
                onClick: () => alert('Button clicked!')
            }
        ]
    });
    f_listar_select_maquina(id);
    f_asignar_fecha_hora(id,codigos.codigoRegistrar_usuMaquina,'fecha_ru','hora_ru');

}
async function f_listar_select_maquina(id) {
    const select_maquina_m = document.getElementById(`maquina_idmaquina${codigos.codigoRegistrar_usuMaquina}`);
    let view ="";
    List_Maquina.map(lista=> {
        view += `
        <option value="${lista.id}">${lista.nombre}</option>
        `
    })
    console.log(view);
    select_maquina_m.innerHTML = view;
}
function f_asignar_fecha(id, cod,name_fecha, name_hora){
    const hoy = new Date();
    hoy.setHours(hoy.getHours() + (-4));
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); 
    const dia = hoy.getDate().toString().padStart(2, '0'); 
    const hours = String(hoy.getUTCHours()).padStart(2, '0');
    const minutes = String(hoy.getUTCMinutes()).padStart(2, '0');
    const seconds = String(hoy.getUTCSeconds()).padStart(2, '0');

    
    return `${anio}-${mes}-${dia}`;
    
}
function f_asignar_hora(id, cod,name_fecha, name_hora){
    const hoy = new Date();
    hoy.setHours(hoy.getHours() + (-4));
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); 
    const dia = hoy.getDate().toString().padStart(2, '0'); 
    const hours = String(hoy.getUTCHours()).padStart(2, '0');
    const minutes = String(hoy.getUTCMinutes()).padStart(2, '0');
    const seconds = String(hoy.getUTCSeconds()).padStart(2, '0');

    
    
    return `${hours}:${minutes}:${seconds}`;
}
async function f_asignar_fecha_hora(id, cod,name_fecha, name_hora){
    const hoy = new Date();
    hoy.setHours(hoy.getHours() + (-4));
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); 
    const dia = hoy.getDate().toString().padStart(2, '0'); 
    const hours = String(hoy.getUTCHours()).padStart(2, '0');
    const minutes = String(hoy.getUTCMinutes()).padStart(2, '0');
    const seconds = String(hoy.getUTCSeconds()).padStart(2, '0');
//nombre_lote
    
    document.getElementById(`${name_fecha}${cod}`).value = `${anio}-${mes}-${dia}`;
    document.getElementById(`${name_hora}${cod}`).value = `${hours}:${minutes}`;
}

function modal_finalizar_etapa(id){
    const modal = crearModal({
        code: code_,
        id: `modal_finalizar_etapa_produccion${subcodigo}`,
        header: html_fin_etapa_produccion.getTitle(),
        body: html_fin_etapa_produccion.getBody(),
        footerButtons: [
            {
                id: "btnConfirmar",
                text: "Confirmar",
                class: "btn-primary",
                onClick: () => {
                    console.log("Confirmado!");
                    // Puedes agregar aquí cualquier acción personalizada
                },
                dismiss: true // Esto cierra el modal cuando se hace clic
            },
            {
                id: "btnCancelar",
                text: "Cancelar",
                class: "btn-secondary",
                onClick: () => {
                    console.log("Cancelado!");
                    f_registrar_final_etapa(id);
                },
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            }
        ]
    });
    f_asignar_fecha_hora(id,codigos.codigoFinalizar_etapa_produccion,'fecha_etp','hora_etp');
}
function modal_comenzar_etapa(id){
    const modal = crearModal({
        code: code_,
        id: `modal_comenzar_etapa_produccion${subcodigo}`,
        header: html_star_etapa_produccion.getTitle(),
        body: html_star_etapa_produccion.getBody(),
        footerButtons: [
            {
                id: "btnConfirmar",
                text: "Confirmar",
                class: "btn-primary",
                onClick: () => {
                    f_registrar_inicio_etapa(id);
                   
                },
                dismiss: true // Esto cierra el modal cuando se hace clic
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
    f_asignar_fecha_hora(id,codigos.codigoComenzar_etapa_produccion,'fecha_pe','hora_pe');
}


async function f_registrar_inicio_etapa(idetapa_produccion) {
        const form = document.getElementById(`formulario${codigos.codigoComenzar_etapa_produccion}`);
        const formData = new FormData(form);
        console.log(f_asignar_fecha(),f_asignar_hora());
        formData.append('verDavid', 'registrar_produccion_etapa');
        formData.append('etapas_produccion_idetapas_produccion', idetapa_produccion);
        formData.append('produccion_idproduccion',id_produccion );
        formData.append('grupo_etapas_idgrupo_etapas',id_grupo_etapas);
        formData.append('fecha_fin',f_asignar_fecha());
        formData.append('hora_fin',f_asignar_hora());
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        let data  = await registerFuntions.sendformData2(formData);
        alertas(data);
    
}
async function f_registrar_final_etapa(idetapa_produccion) {
    const form = document.getElementById(`formulario${codigos.codigoFinalizar_etapa_produccion}`);
    const formData = new FormData(form);
    formData.append('ver', 'registrar_etapa_concluidad');
    formData.append('etapas_produccion_idetapas_produccion', idetapa_produccion);
    formData.append('produccion_idproduccion',id_produccion );
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    // fetch(`${URL_APIP}/api/`, { 
    //     method: 'POST',
    //     body: formData
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log(data);
    //     alertas(data);
    // })

}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        const resultados = await Promise.all([
            listarFunctions.listar_api_general_verd("listar_grupo_etapas",idEmpresa),
            listarFunctions.listar_etapas_produccion(idEmpresa),
            listarFunctions.listar_api_general("listar_maquina",idEmpresa),

        ]);
        Lista_etapas_producto= resultados[0];
        Lista_etapas_produccion = resultados[1];
        List_Maquina = resultados[2];
        console.log(resultados[0],resultados[1],resultados[2]);
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}







async function sitio(){
    
    let view="",ind=1;
        view +=`
            <h5 class="text-center mb-4 fw-bold fs-6" >Etapas producción</h5>
           <div class="container mt-4" style = "max-height: 190px; overflow-y: auto; display: block;">
                
                <div id="listar_etapas_de_produccion${subcodigo}">
                </div>
            </div>
        `; 
    
           
    app.innerHTML=view;
     await listar();
 
     console.log(Lista_etapas_produccion);
    console.log(Lista_etapas_producto);
    const Lista_etapa_orden = Lista_etapas_producto.find((obj)=> Number(obj.idgrupo_etapas) === Number(id_grupo_etapas));
    console.log(Lista_etapa_orden);
    listar_etapas_de_produccion(Lista_etapa_orden.detalles);  
 }
 function listar_etapas_de_produccion(Lista_etapa_orden){
    const tbody = document.getElementById(`listar_etapas_de_produccion${subcodigo}`);
        console.log(Lista_etapa_orden,Lista_etapas_produccion);
        let view = "",
            ind = 1;
        Lista_etapa_orden.map((lista) => {
            let itemEtapa = Lista_etapas_produccion.find(
            (obj) =>
                Number(obj.idetapas_produccion) ===
                Number(lista.etapas_produccion_idetapas_produccion)
            );

            view += `
            <div class="d-flex align-items-center border-bottom py-2">
                <!-- Columna: ID -->
                <div class="flex-shrink-0 me-3">
                    <strong>${ind++}</strong> 
                </div>
                <!-- Columna: Nombre de la Etapa -->
                <div class="flex-grow-1 me-3" data-type="${lista.etapas_produccion_idetapas_produccion}" data-group="${lista.grupo_etapas_idgrupo_etapas}" data-id="${lista.idetapa_orden}">
                    <strong>Etapa producción:</strong> ${itemEtapa.nombre_etapa}
                </div>
                <!-- Columna: Acciones -->
                <div class="d-flex gap-3 ms-auto">
                    <div class="text-center">
                        <a href="#" data-id="Detalle_etapa,${lista.etapas_produccion_idetapas_produccion}"
                            class="btn btn-info rounded-circle p-1 d-inline-flex justify-content-center align-items-center ${subcodigo}"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Inf Etapa Produccion">
                            <i class="bi bi-info-circle"></i>
                        </a>
                        <span class="d-block mt-1 small">Detalle</span>
                    </div>
                    
                    <div class="text-center">
                        <a href="#" data-id="comenzar_etapa_produccion,${lista.etapas_produccion_idetapas_produccion}"
                            class="btn btn-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center ${subcodigo}"
                            id="registrarEtapas${subcodigo}"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Iniciar Etapa Producción">
                            <i class="bi bi-play fs-5"></i>
                        </a>
                        <span class="d-block mt-1 small">Comenzar</span>
                    </div>
                    
                </div>
            </div>
                `;
        });
  tbody.innerHTML = view;
  const enlaces = document.querySelectorAll(`.${subcodigo}`);
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menu);
  });
 }

 function alertas(data) {
    console.log(data,data[0]);
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "success") {
      alertClass = "alert-success";
      alertMessage = data[1];
      timeoutDuration = 1500;
      console.log(alertClass,alertMessage,timeoutDuration);
    } else {
      if (data[0] == "danger") {
        alertClass = "alert-danger";
        alertMessage = data[1];
        timeoutDuration = 3000;
      } else {
        alertClass = "alert-primary";
        alertMessage = data[1];
        timeoutDuration = 3000;
      }
    }
    console.log(alertClass,alertMessage,timeoutDuration);
    // Obtener el div de alerta
    let divalert = document.querySelector(`#alerta${codigos.codigoPrincipal}`);
    if (divalert) {
      // Crear el nuevo contenido de la alerta
      let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
      divalert.innerHTML = nuevoContenido;
  
      // Eliminar la alerta después del tiempo especificado
      setTimeout(() => {
        if(alertClass === "alert-success"){
            detalle_produccion(code_, permisos_, refrescar_,[id_grupo_etapas,id_produccion]);
            //produccion_etapas_produccion(code_, permisos_, refrescar_,[id_grupo_etapas,id_produccion]);
        }
        //app.innerHTML = ``;
        divalert.innerHTML = ``;
        
      }, timeoutDuration);
    }
  }