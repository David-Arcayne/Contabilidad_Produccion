import * as listarFunctions from "../../funciones/listar.js";
import * as fuG from "../../funciones/generales.js";
import { codigos } from "../constantes.js";
import { produccion_ini } from "../produccion/produccion.js";
import { verORdenProduccion } from "../verOrden_produccion.js";
import { crearModal } from "../../funciones/modales/modal_registrar.js";
import * as registerFunctions from "../../funciones/registrar.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let Lista_Orde_produccion_lote;
let Lista_Orden_Produccion;
let Lista_Empleados;
let privilegios;
let solicitudes_material = [];
const subcodigo = codigos.codigosolicitud_pendientes;
export async function orden_produccion_en_curso(code, permisos, refrescar, codigo) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
    app=document.querySelector(`#content-area${codigo}`);

    sitio();
} 
async function finalizar_produccion_modal(idproduccion) {
    const modal = crearModal({
        code: code_,
        id: `modal_finalizar_produccion${codigos.Finalizar_produccion_codigo}`,
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
                            <p style="color: #6c757d;">Se finalizará produccion..</p>
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
                        f_finalizar_produccion(idproduccion);
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
}
async function f_finalizar_produccion(idproduccion) {
    const formData = new FormData();
    formData.append('verDavid', 'finalizar_produccion');
    formData.append('idproduccion',idproduccion);
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    const data = await registerFunctions.sendformData2(formData)
    const modal = crearModal({
        code: code_,
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
                        
                },
                dismiss: true // Esto NO cierra el modal cuando se hace clic
            }
        ]
    });
}
async function salida_produccion_modal(orden_produccion_idorden_produccion,idproduccion){
    const modal = crearModal({
        code: code_,
        id: `modal_dalida_produccion${codigos.codigoSalidaProduccion}`,
        header: `
            <h2 class="text-center">Salida de Producción</h2>
        `,
        body: `
            <div id="alerta${codigos.codigoSalidaProduccion}" class="mt-4"></div>
            <div class="container ">
                
                <table class="table table-striped table-bordered table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>N°</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="datos_salida_produccion${codigos.codigoSalidaProduccion}">
                  
                        
                    </tbody>
                </table>
            </div>
        
        `,
        footerButtons: [
            {
                id: "btnConfirmar",
                text: "Confirmar",
                class: "btn-primary",
                onClick: () => {
                    f_registrar_salida_produccion(orden_produccion_idorden_produccion,idproduccion);
                   
                },
                dismiss: false // Esto cierra el modal cuando se hace clic
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
    const produccion = await listarFunctions.mostrar_orden_produccion(orden_produccion_idorden_produccion);
    let detalles_produccion = produccion.detalles;
    f_listar_salida_produccion(detalles_produccion);
    async function f_registrar_salida_produccion(orden_produccion_idorden_produccion,idproduccion) {
        console.log(detalles_produccion);
        detalles_produccion.forEach(async item => { 
            const formData = new FormData();
            formData.append('verDavid', 'registro_salida_produccion');
            
            formData.append(`cantidad`, item.cantidad);
            formData.append('produccion_idproduccion',idproduccion);
            formData.append('producto_idproducto',item.producto_idproducto);
            formData.append('empresa_idempresa',uk[0].empresa.idempresa);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const data = await registerFunctions.sendformData2(formData)
            console.log(data);
            alertas(data,codigos.codigoSalidaProduccion);

            
        });

    }
    function aumentar_cantidad(iddetalle_produccion){
        let  detalle =  detalles_produccion.find(obj => Number(obj.iddetalle_produccion) === Number(iddetalle_produccion));
        detalle['cantidad'] = Number(detalle['cantidad']) + 1;
        f_listar_salida_produccion(detalles_produccion,idproduccion);
    }
    function bajar_cantidad(iddetalle_produccion){
        let  detalle =  detalles_produccion.find(obj => Number(obj.iddetalle_produccion) === Number(iddetalle_produccion));
        detalle['cantidad'] = Number(detalle['cantidad']) - 1;
        f_listar_salida_produccion(detalles_produccion,idproduccion);
    }
    async function f_listar_salida_produccion(detalles_produccion){
        const tabla_body = document.getElementById(`datos_salida_produccion${codigos.codigoSalidaProduccion}`);
        let view = "", ind = 1;
       
        const Lista_productos = await listarFunctions.listar_api_general("listar_productos_comercial",uk[0].empresa.idempresa);
    
        detalles_produccion.map(lista => {
            const item_prod = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(lista.producto_idproducto));
            let subir = {
                0: '',
                1: `
                    <div class="text-center">
                        <a href="#" data-id="aumentar_cantidad,${lista.iddetalle_produccion}"
                            class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigos.codigoSalidaProduccion}"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Subir Cantidad">
                            <i class="bi bi-arrow-up"></i>
                        </a>
                    
                    </div>
                `
            };
            let bajar = {
                0: '',
                1: `
                    <div class="text-center">
                        <a href="#" data-id="bajar_cantidad,${lista.iddetalle_produccion}"
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigos.codigoSalidaProduccion}"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Bajar Cantidad">
                            <i class="bi bi-arrow-down"></i>
                        </a>
                    
                    </div>
                `
            };
    
            let eliminar = {
                0: ``,
                1: `
                    <div class="text-center">
                        <a  data-id="Eliminar,${lista.iddetalle_produccion}"
                        class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigos.codigoSalidaProduccion}"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="Eliminar ">
                            <i class="bi bi-trash fs-5"></i>
                        </a>
                        <span class="d-block mt-1 small"></span>
                    </div>
                    `,
              };
    
    
    
            view += `
                <tr>
                    <td>${ind++}</td>
                    <td>${item_prod.nombre}</td>
                    <td>${lista.cantidad}</td>
                 
                    <td>
                        <div class="d-flex gap-3">
                            ${subir[privilegios[2]]}
                            ${bajar[privilegios[2]]}
                            ${eliminar[privilegios[3]]}
                        </div>
                    </td>
                </tr>
    
            `;
        })
        tabla_body.innerHTML = view;
        const enlaces = document.querySelectorAll(`.btn${codigos.codigoSalidaProduccion}`);
        enlaces.forEach((enlace) => {
            enlace.addEventListener("click", menu_salida);
        });
    }
    
    function menu_salida(event){
        const dataid = event.currentTarget.getAttribute('data-id');
        const [funcion, id1,id2] = dataid.split(',');
        switch (funcion) {
            
            case "aumentar_cantidad":
                aumentar_cantidad(id1);
                break;

            case "bajar_cantidad":
                bajar_cantidad(id1);
                break;
                
            default:
                sitio();
                break;
        }
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
                sitio();
            }
            //app.innerHTML = ``;
            divalert.innerHTML = ``;
            
          }, timeoutDuration);
        }
      }
}

async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_api_general_verd("listadoProduccionLote",idEmpresa),
            listarFunctions.listar_api_general_verd("mostrar_orden_produccionPor_empresa",idEmpresa),

            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.listar_api_general_verd("listado_produccion_grupo_etapas",idEmpresa),
            listarFunctions.listar_api_general_verd("Listar_solicitud_material_produccion",idEmpresa),
            
        ]);
        // Asignamos los resultados a las variables correspondientes
        Lista_Orde_produccion_lote = resultados[0];
        Lista_Orden_Produccion = resultados[1];
        Lista_Empleados = resultados[2];
        localStorage.setItem('listado_produccion_grupos_etapas', JSON.stringify(resultados[3]));
       
        solicitudes_material = resultados[4];
        console.log(solicitudes_material);
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}




function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "comenzar_produccion":
            comenzar_produccion(id1,id2);
            break;
        
        case "ver_lista_orden_produccion":
            verORdenProduccion(code_,permisos_,refrescar_,codigo_,id1);
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
        case "salida_produccion":
            salida_produccion_modal(id1,id2);
            break;
        case "aumentar_cantidad":
            salida_produccion_modal(id1,id2);
            break;

        case "finalizar_produccion":
            finalizar_produccion_modal(id1);
            break;
            
            
        default:
            sitio();
            break;
    }
}
function comenzar_produccion(idorden_produccion,idproduccion){
    produccion_ini(code_,permisos_,refrescar_,codigo_,idorden_produccion,idproduccion);
}
async function sitio(){
    await listar();


    const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`).value;
 

    console.log(Lista_Orde_produccion_lote);
    let view=`<h5 class="text-center mb-4 fw-bold fs-6">Listas orden de producción</h5>`,ind=1;
    const en_proceso = Lista_Orde_produccion_lote.filter(obj => (Number(obj.produccion_estado) === 0 || Number(obj.produccion_estado) === 1) && Number(obj.rubro_idrubro) === Number(idrubro) );
    console.log(en_proceso);
    for (const lista of en_proceso) {
        console.log(lista);
        console.log('=======================================================================');
        let se_puede_solicitar_material = await verificar_estado(lista) ? '' : 'disabled';
        console.log(lista.produccion_estado);
        let se_puede_finalizar_produccion = Number(lista.produccion_estado) === 1 ? '': 'disabled';
        // Buscar la orden y el empleado relacionados
        let item_orden = Lista_Orden_Produccion.find(obj => Number(obj.idorden_produccion) === Number(lista.orden_produccion_idorden_produccion));
        let item_empleado = Lista_Empleados.find(obj => Number(obj.id) === Number(item_orden.empleado_idempleado));
        let estadoSolicitud = await verificar_estado_solicitud(lista.idproduccion);
        // Definir botones basados en privilegios y estado
        let comenzar_produccion = {
            0: '',
            1: `
                <div class="text-center">
                    <a href="#" data-id="comenzar_produccion,${lista.orden_produccion_idorden_produccion},${lista.idproduccion}"
                        class="btn btn-outline-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="Enviar">
                        <i class="bi bi-play fs-5"></i>
                    </a>
                    <span class="d-block mt-1 small">Comenzar producción</span>
                </div>
            `
        };
        let salida_produccion = {
            0: '',
            1: `
                <div class="text-center">
                    <a href="#" data-id="salida_produccion,${lista.orden_produccion_idorden_produccion},${lista.idproduccion}"
                        class="btn btn-outline-warning rounded-circle p-1 d-inline-flex justify-content-center align-items-center ${se_puede_solicitar_material}"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="Finalizar">
                        <i class="bi bi-collection"></i>
                    </a>
                    <span class="d-block mt-1 small">Salida producción</span>
                </div>
            `
        };
        let finalizar_produccion = {
            0: '',
            1: `
                <div class="text-center">
                    <a href="#" data-id="finalizar_produccion,${lista.idproduccion}"
                        class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center ${se_puede_finalizar_produccion}"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="Finalizar">
                        <i class="bi bi-send-x fs-5"></i>
                    </a>
                    <span class="d-block mt-1 small">Finalizar producción</span>
                </div>
            `
        };
        //nombre_lote

        view += `
            <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded shadow-sm border">
                <span class="fw-bold text-primary">Lote: ${lista.lote}</span>

                <div class="d-flex flex-column">
                    <span class="fw-bold text-primary">${lista.idproduccion}. Fecha solicitud: ${fuG.cambiarFormatoFecha(item_orden.fecha_orp)}</span>
                    <span class="text-muted small">Hora solicitud: ${item_orden.hora_orp}</span>
                </div>
                
                <div class="d-flex flex-column">
                    <span class="fw-bold text-primary">Fecha entrega : ${fuG.cambiarFormatoFecha(lista.fecha_entrega)}</span>
                    <span class="text-muted small">Hora entrega estimada: ${lista.hora_entrega}</span>
                </div>
                <span class="fw-bold text-dark">Nombre: ${item_empleado.nombre} ${item_empleado.apellido}</span>
                <div class="d-flex flex-column bg-${estadoSolicitud.color}-subtle p-3 text-${estadoSolicitud.color}-emphasis  border border-${estadoSolicitud.color}-subtle rounded-3" >
                    
                    <span class="">Estado solicitud: ${estadoSolicitud.mesaje}</span>
                </div>
                <div class="d-flex gap-3" style="backgroundColor">
                    <div class="text-center">
                        <a href="#" data-id="ver_lista_orden_produccion,${lista.orden_produccion_idorden_produccion},${item_orden.idorden_produccion}"
                            class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Ver o Editar">
                            <i class="bi bi-eye fs-5"></i>
                        </a>
                        <span class="d-block mt-1 small">Ver orden producción</span>
                    </div>
                    ${comenzar_produccion[privilegios[2]]}
                    ${salida_produccion[privilegios[2]]}
                    ${finalizar_produccion[privilegios[2]]}
                </div>
            </div>
        `;
    }
    app.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });
    const selectrubro=document.querySelector(`#rubro_idrubro${codigos.codigoPrincipal}`);
        selectrubro.addEventListener('change',()=>{
            sitio();
        });
}

async function verificar_estado_solicitud(idproduccion) {
    console.log(solicitudes_material);
    let res = solicitudes_material.find(obj => Number(obj.produccion_idproduccion) === Number(idproduccion));
    console.log(res);
    if(res){
        if(Number(res.estado) === 1){
            return {mesaje:'Entregados',color:'success'};
        }else if (Number(res.estado) === 0) {
            return {mesaje:'En espera..',color:'info'};
        }
    }else{
        return {mesaje:'No solicitado',color:'danger'};
    }
    
        
        
    
}
async function verificar_estado(lista){
    console.log(lista);
    let registro_produccion = [];
    registro_produccion = await listarFunctions.listar_api_general_verd('listar_produccion_etapa_porProduccion',lista.idproduccion);
    console.log(registro_produccion);
    const produccion_grupo_etapas = JSON.parse(localStorage.getItem('listado_produccion_grupos_etapas'));
    const produccion = produccion_grupo_etapas.find(obj => Number(obj.idproduccion)===Number(lista.idproduccion));
    console.log(produccion);
    if(Number(lista.produccion_estado) === 1){
        return false;
    }
    

    
    if(registro_produccion && registro_produccion.length === 0){
        return false;
    }
    //verificar que todas las etapas de produccion esten finalizados
    let res = !registro_produccion.some(item => Number(item.estado) !== 1);
    console.log(res);
    if(res){
       
        produccion.grupo_etapas.map(lista => {
            console.log('=====================');
            console.log(lista);
            console.log(res);
            console.log(registro_produccion.some(obj => Number(obj.grupo_etapas_idgrupo_etapas) === Number(lista.grupo_etapas_idgrupo_etapas)));
            res = res && registro_produccion.some(obj => Number(obj.grupo_etapas_idgrupo_etapas) === Number(lista.grupo_etapas_idgrupo_etapas))
            console.log(res);
            console.log('=====================');

        })
    }
    console.log(res);
    if(res){
        
        produccion.grupo_etapas.map(lista => {
            lista.etapas_produccion.map(detalle => {
                res = res && registro_produccion.some(obj => Number(obj.etapas_produccion_idetapas_produccion) === Number(detalle.etapas_produccion_idetapas_produccion));
            })
        })
    }
    console.log(res);

    return res;
}

