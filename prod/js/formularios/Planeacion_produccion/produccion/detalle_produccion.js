import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { crearModal } from "../../funciones/modales/modal_registrar.js";
import { Editar_table_fila } from "../../funciones/editar_fila_table.js";

import * as html_fin_etapa_produccion from "../html/html_finalizar_etapa_produccion.js"
import * as html_uso_maquinas from "../html/html_uso_de_maquina.js"
import * as registerFuntions from "../../funciones/registrar.js"
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let code_;
let permisos_;
let refrescar_;
let id_grupo_etapas;
let id_produccion;
let Lista_maquinas_de_etapa = [];
let privilegios;
let List_Maquina = [];
let Lista_etapas_produccion = [];
let Lista_etapa_maquina = [];
let Lista_produccion_etapa = [];
const subcodigo = codigos.codigoDetalleProduccion;
export async function detalle_produccion(code, permisos, refrescar,ids) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
    id_grupo_etapas = ids[0];
    id_produccion = ids[1];
    app=document.querySelector(`#contenido2${codigos.codigoproduccion_comenzar}`);
    sitio();    
    
}




function menu(event) {
    const dataid = event.currentTarget.getAttribute("data-id");
    const [funcion, id1, id2] = dataid.split(",");
    
    switch (funcion) {
        case "Finalizar_etapa_produccion":
            modal_finalizar_etapa(id1,id2);
            break;
        case "registrar_uso_maquinas":
            modal_registrar_uso_maquina(id1,id2);
            break;
        case "finalizar_uso_maquina":
            finalizar_uso_maquina(id1);
            break;
        case "editar_uso_maquina":
            toggleEditSave(event);
            break;
        case "eliminar_uso_maquina":
            eliminar_uso_maquina(id1,id2);
            break;   
        default:
            sitio();
            break;
    }
}
async function  eliminar_uso_maquina(iduso_maquina,idproduccion_etapa) {
    if(confirm("Esta seguro eliminar...?")){
        const data = await listarFunctions.listar_api_general_verd('eliminar_uso_maquina_produccion',iduso_maquina);
        console.log(data);
        alertas(data,codigos.codigoRegistrar_usuMaquina);
        if(data[0] === 'success'){
            f_listar_maquinas_iniciadas(idproduccion_etapa);
        }
    }
}
async function modal_finalizar_etapa(etapas_produccion_idetapas_produccion,idproduccion_etapa) {
    console.log(etapas_produccion_idetapas_produccion,idproduccion_etapa);
    const modal = crearModal({
        code: code_,
        id: `modal_finalizar_etapa${subcodigo}`,
        header: html_fin_etapa_produccion.getTitle(),
        body: html_fin_etapa_produccion.getBody() ,
        footerButtons: [
            {
                id: "btnConfirmar",
                text: "Confirmar",
                class: "btn-primary",
                onClick: () => {
                   finalizar_etapa_produccion(etapas_produccion_idetapas_produccion,idproduccion_etapa);
                },
                dismiss: true // Esto cierra el modal cuando se hace clic
            },
            {
                id: "btnCancelar",
                text: "Cancelar",
                class: "btn-secondary",
                onClick: () => {
                    console.log("Cancelado!");
                },
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            }
        ]
    });
}
async function finalizar_etapa_produccion(etapas_produccion_idetapas_produccion,idproduccion_etapa) {
   
    const formData = new FormData();
    console.log(f_asignar_fecha(),f_asignar_hora());
    formData.append('verDavid', 'finalizar_produccion_etapa');
    formData.append('idproduccion_etapa',idproduccion_etapa );
    formData.append('fecha_fin',f_asignar_fecha());
    formData.append('hora_fin',f_asignar_hora());
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    let data  = await registerFuntions.sendformData2(formData);
    
    alertas(data,codigos.codigoPrincipal);
}
async function toggleEditSave(event) {
    
    const permisos = [4];
    const names = ["observaciones",];
    const opciones_select = [];
    const opciones_number = [];
    const names2 = ["observaciones",];
    const url_api = "Editar_uso_maquina_produccion";
    const ver = "verDavid";
    const nom_v_Emp = "empresa";
    const md5 = uk[0].empresa.idempresa;
    const id = "iduso_maquina";
    Editar_table_fila(event,codigos.codigoRegistrar_usuMaquina,Lista_etapa_maquina,permisos, names,names2,opciones_select,opciones_number,url_api,ver,nom_v_Emp,md5,id);
}
async function finalizar_uso_maquina(iduso_maquina){  
    let uso_maquina = Lista_etapa_maquina.find(obj => Number(obj.iduso_maquina) === Number(iduso_maquina))
    const formData = new FormData();
    console.log(f_asignar_fecha(),f_asignar_hora());
    formData.append('verDavid', 'Editar_uso_maquina_produccion');
    formData.append('iduso_maquina', iduso_maquina);
    formData.append('observaciones', uso_maquina.observaciones);

    formData.append('fecha_fin',f_asignar_fecha());
    formData.append('hora_fin',f_asignar_hora());
   
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    let data  = await registerFuntions.sendformData2(formData);
    data[1] = 'Maquina finalizada';
    console.log(data);
    alertas(data,codigos.codigoRegistrar_usuMaquina);
}

function modal_registrar_uso_maquina(etapas_produccion_idetapas_produccion,idproduccion_etapa){
    const modal = crearModal({
        code: code_,
        id: `modal_registrar_uso_maquina${subcodigo}`,
        header: html_uso_maquinas.getTitle(),
        body: html_uso_maquinas.getBody() + html_uso_maquinas.getBody_2(),
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
                },
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            }
        ]
    });
    f_listar_select_maquina(etapas_produccion_idetapas_produccion);
    const forme = document.getElementById(`formulario${codigos.codigoRegistrar_usuMaquina}`);
    forme.addEventListener('submit',(e)=> {f_registrar_uso_maquina(e,forme,idproduccion_etapa)});
    f_listar_maquinas_iniciadas(idproduccion_etapa);
    

}
async function f_listar_maquinas_iniciadas(idproduccion_etapa){
    let eliminar,actualizar,finalizar_maquina;
    Lista_etapa_maquina = await listarFunctions.listar_api_general_verd(`listar_uso_maquina_produccion`,idproduccion_etapa);
    let view = "", ind = 1;
    let tabla_body = document.getElementById(`listar_uso_maquina_produccion${codigos.codigoRegistrar_usuMaquina}`);
    Lista_etapa_maquina.map(lista=>{
        let itemMaquina = List_Maquina.find(obj => Number(obj.id) === Number(lista.maquina_idmaquina));


        actualizar = {
            0: ``,
            1: `<div class="text-center">
                    <a data-id="editar_uso_maquina,${lista.iduso_maquina}"
                    class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigos.codigoRegistrar_usuMaquina}"
                    style="width: 2.5rem; height: 2.5rem;"
                    title="Editar">
                        <i class="bi bi-pencil-square fs-5"></i>
                    </a>
                    <span class="d-block mt-1 small"></span>
                </div>`,
          };
        eliminar = {
            0: ``,
            1: `<div class="text-center">
                    <a  data-id="eliminar_uso_maquina,${lista.iduso_maquina},${idproduccion_etapa}"
                    class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigos.codigoRegistrar_usuMaquina}"
                    style="width: 2.5rem; height: 2.5rem;"
                    title="Eliminar">
                        <i class="bi bi-trash fs-5"></i>
                    </a>
                    <span class="d-block mt-1 small"></span>
                </div>
                `,
          };//nombre_lote
        finalizar_maquina = {
            0: ``,
            1: `<div class="text-center">
                    <a  data-id="finalizar_uso_maquina,${lista.iduso_maquina}"
                    class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigos.codigoRegistrar_usuMaquina}"
                    style="width: 2.5rem; height: 2.5rem;"
                    title="Finalizar uso maquina">
                        <i class="bi bi-stop fs-5"></i>
                    </a>
                    <span class="d-block mt-1 small"></span>
                </div>
                `,
          };
        view += `
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.iduso_maquina}">${itemMaquina.nombre}</td>
                <td data-type="${lista.iduso_maquina}">${lista.fecha_ini}</td>
                <td data-type="${lista.iduso_maquina}">${lista.hora_ini}</td>
                <td data-type="${lista.iduso_maquina},observaciones,observaciones">${lista.observaciones}</td>
                <td>
                    <div class="d-flex gap-3">
                        ${actualizar[privilegios[2]]}
                        ${eliminar[privilegios[3]]}
                        ${finalizar_maquina[privilegios[2]]} 
                    </div>                         
                </td>
            </tr>
            `;
    })
    console.log(view);
    tabla_body.innerHTML = view;
    const enlaces = document.querySelectorAll(`.btn${codigos.codigoRegistrar_usuMaquina}`);
    enlaces.forEach((enlace) => {
        enlace.addEventListener("click", menu);
    });
        
}
async function f_registrar_uso_maquina(e,forme,idproduccion_etapa) {
    e.preventDefault();
    console.log(idproduccion_etapa);
    const formData = new FormData(forme);
    console.log(f_asignar_fecha(),f_asignar_hora());
    formData.append('verDavid', 'registrar_uso_maquina_produccion');
    formData.append('produccion_etapa_idproduccion_etapa', idproduccion_etapa);
    formData.append('produccion_idproduccion',id_produccion );
    formData.append('fecha_ini',f_asignar_fecha());
    formData.append('hora_ini',f_asignar_hora());
    formData.append('fecha_fin',f_asignar_fecha());
    formData.append('hora_fin',f_asignar_hora());
    formData.append('observaciones','ninguna');
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    let data  = await registerFuntions.sendformData2(formData);
    
    alertas(data,codigos.codigoRegistrar_usuMaquina);
    if(data[0] === 'success'){
        f_listar_maquinas_iniciadas(idproduccion_etapa);
    }
}
async function f_listar_select_maquina(etapas_produccion_idetapas_produccion) {
    console.log(etapas_produccion_idetapas_produccion);
    const maquinas = Lista_maquinas_de_etapa.find(obj => Number(obj.idetapas_produccion) === Number(etapas_produccion_idetapas_produccion));
    const select_maquina_m = document.getElementById(`maquina_idmaquina${codigos.codigoRegistrar_usuMaquina}`);
    let view ="";
    console.log(maquinas);
    maquinas.detalles.map(lista=> {
        let item_maquina = List_Maquina.find(obj => Number(obj.id) === Number(lista.maquina_idmaquina));
        view += `
        <option value="${item_maquina.id}">${item_maquina.nombre}</option>
        `
    })
    console.log(view);
    select_maquina_m.innerHTML = view;
}

function f_asignar_fecha(){
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
function f_asignar_hora(){
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

async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        const resultados = await Promise.all([
            listarFunctions.listar_api_general("listar_maquina",idEmpresa),
            listarFunctions.listar_api_general_verd("listado_maquina_etapas", idEmpresa),
            listarFunctions.listar_api_general_verd("listar_produccion_etapa", `${id_produccion}/${id_grupo_etapas}`),
            listarFunctions.listar_etapas_produccion(idEmpresa),
            
        ]);
        List_Maquina = resultados[0];
        Lista_maquinas_de_etapa = resultados[1];
        Lista_produccion_etapa = resultados[2];
        Lista_etapas_produccion = resultados[3];
        console.log(resultados[0],resultados[1],resultados[2], resultados[3]);
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
async function sitio(){
    let view="",ind=1;
        view +=`
            <h5 class="text-center mb-4 fw-bold fs-6" >Proceso</h5>
           <div class="container mt-4" style = "max-height: 190px; overflow-y: auto; display: block;">
                <div id="listar_produccion_etapas${subcodigo}">
                </div>
            </div>
        `; 
    app.innerHTML=view;
    await listar();
    listar_produccion_etapas();  
 }
 function listar_produccion_etapas(){
    const tbody = document.getElementById(`listar_produccion_etapas${subcodigo}`);
        let registrar_maquina,finalizar_etapa;
        let view = "",
            ind = 1;
            const Activos = Lista_produccion_etapa.filter(obj => Number(obj.estado) === 0);
            Lista_produccion_etapa.map((lista) => {
                let itemEtapa = Lista_etapas_produccion.find(obj => Number(obj.idetapas_produccion) === Number(lista.etapas_produccion_idetapas_produccion));
                console.log(itemEtapa);
                console.log(lista);
                let color = Number(lista.estado) === 1 ?  'background-color:red;':'';
                let disable = Number(lista.estado) === 1 ?  'disabled':'';

                registrar_maquina = {
                    0: '',
                    1: `
                    
                        <div class="text-center ">
                            <a href="#" data-id="registrar_uso_maquinas,${lista.etapas_produccion_idetapas_produccion},${lista.idproduccion_etapa}"
                                class="btn btn-warning rounded-circle p-1 d-inline-flex justify-content-center align-items-center ${subcodigo} ${disable}"
                                style="width: 2.5rem; height: 2.5rem;"
                                title="Registrar uso máquina">
                                <i class="bi bi-gear-fill"></i>
                            </a>
                            <span class="d-block mt-1 small">Máquina</span>
                        </div>
                    `
                }
                finalizar_etapa ={
                    0:'',
                    1:`
                        <div class="text-center ">
                            <a href="#" data-id="Finalizar_etapa_produccion,${lista.etapas_produccion_idetapas_produccion},${lista.idproduccion_etapa}"
                                class="btn btn-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center ${subcodigo} ${disable}"
                                id="registrarEtapas${subcodigo}"
                                style="width: 2.5rem; height: 2.5rem;"
                                title="Finalizar Etapa producción">
                                <i class="bi bi-send-x fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small">Finalizar</span>
                        </div>
                    `,

                }
                view += `

                <div class="d-flex align-items-center border-bottom py-2" style="${color} rounded">
                    <!-- Columna: ID -->
                    <div class="flex-shrink-0 me-3">
                        <strong>${ind++}</strong> 
                    </div>
                    <!-- Columna: Nombre de la Etapa -->
                    <div class="flex-grow-1 me-3">
                        <strong>Etapa: </strong> ${itemEtapa.nombre_etapa}
                    </div>
                    <div class="flex-grow-1 me-3" data-type="${lista.etapas_produccion_idetapas_produccion},${lista.produccion_idproduccion}" data-group="${lista.produccion_idproduccion}" data-id="${lista.idproduccion_etapa}">
                        <strong>Fecha:</strong> ${lista.fecha_pe}
                    </div>
                    <div class="flex-grow-1 me-3">
                        <strong>Hora:</strong> ${lista.hora_pe}
                    </div>
                    
                    <!-- Columna: Acciones -->
                    <div class="d-flex gap-3 ms-auto">
                        ${registrar_maquina[privilegios[2]]}
                        ${finalizar_etapa[privilegios[2]]}
                        
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

 function alertas(data,codigo_alertas) {
    console.log(data,data[0]);
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "success") {
      alertClass = "alert-success";
      alertMessage = data[1];
      if(data[2] === "editar_produccion_etapa"){
        alertMessage = "Etapa produccion finalizada"
      }
      
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
    let divalert = document.querySelector(`#alerta${codigo_alertas}`);
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