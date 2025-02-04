import * as listarFunctions from "../funciones/listar.js";

import { listadoEvaluacionCaracteristicas, listadoCriterio } from "../funciones/obtener.js";
import { preparar_listas,listas_enviadas } from "../funciones/obtener.js";
import { modal_control_lista } from "./modal_control_calidad.js";
import { modal_control_calidad_editar } from "./modal_editar_ctr_c.js";
import * as registrarFuntions from "../funciones/registrar.js";
import { control_calidad_pdf } from "./pdf_vista_previa.js";
import { preparar_para_almacen } from "./preparar_para_almacen.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let divsPintados = [];
let Lista_Detalle_Control_calidad = [];
let Listas_Control_calidad = [];
let listas ;
let app = "";
let isEditing = false;
let intervaloId;
let privilegios;
let codigo;
let code;
let lis_eva;
let lis_cri;
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        const resultados = await Promise.all([
      
            listarFunctions.Listar_control_calidad_Api(idEmpresa),
            listarFunctions.Listar_detalle_control_calidad_Api(idEmpresa),
            
        ]);

        
        Listas_Control_calidad = resultados[0];
        Lista_Detalle_Control_calidad = resultados[1];
        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; 
    }
}
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "pendiente";
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export async function control_calidad_compra_encurso(codigo_,code_,privilegios_) {
    codigo = codigo_;
    app=document.querySelector(`#filtrar${codigo_}`);
    code = code_;
    privilegios = privilegios_;
    await obtenerListas(); 

    sitio();    
    
}
async function obtenerListas() {
    try {
        await preparar_listas();  
        console.log(listas_enviadas);
        
        listas = listas_enviadas;

    } catch (error) {
        console.error('Error al obtener las listas:', error);
    }
}
async function obtner_datos_avaluados(){
    lis_eva = await listadoEvaluacionCaracteristicas();
    lis_cri = await listadoCriterio();
    console.log(lis_eva,lis_cri);

}
function menuec(event){

    if (divsPintados.length > 0) {
        divsPintados.forEach(div => {
            div.style.backgroundColor = ''; // Quitar el color (restablecer el valor original)
        });
    }
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, ids] = dataid.split(',');
     console.log(funcion,id1,ids);
     let currentElement = event.currentTarget;
     let divsSuperiores = [];
 
     // Bucle para obtener los 4 divs superiores
     for (let i = 0; i < 4; i++) {
         if (currentElement.parentElement) {
             currentElement = currentElement.parentElement;
             divsSuperiores.push(currentElement);
         } else {
             // Si no hay más padres, termina el bucle
             break;
         }
     }
 
     // Pintar los 4 divs superiores de azul cielo y guardar la referencia
     divsSuperiores.forEach(div => {
         div.style.backgroundColor = 'skyblue'; // Color azul cielo
     });
 
     // Guardar los divs pintados en la variable global para poder restablecerlos en el futuro
     divsPintados = divsSuperiores;
 
     console.log('Los 4 divs superiores encontrados:', divsSuperiores);
    switch (funcion) {
        
        case "mostrar_control_calidad":
            mostrar_control_calidad(id1);
            break;
            
        case "generar_form_control_calidad":
            generar_form_control_calidad(id1,ids);
            break;
        case "actulizar_form_ctr_cal":
            actulizar_form_ctr_cal(id1,ids);
            break;
        case "Finalizar_para_almacen":
            Finalizar_para_almacen(id1,ids);
            break;
        case "ver_documento":
            ver_documento(id1);
            break;
        default:
            sitio();
            break;
    }
}
async function Finalizar_para_almacen(id,id_compra){
    
    preparar_para_almacen(codigo,code,privilegios,id,id_compra);
               

}
async function generar_form_control_calidad(id_Detalle,id){
    const modalCargando = document.getElementById('modalCargando');
    const spinner = document.getElementById('spinner');
    const mensajeCargando = document.getElementById('mensajeCargando');
    const contenido = document.getElementById('contenido');

    modalCargando.style.display = 'flex';
    spinner.style.display = 'block';
    mensajeCargando.style.display = 'block';
    contenido.style.display = 'none';

    

    function tareaQueTarda() {
        return new Promise((resolve) => {
            setTimeout(() => {
                modal_control_lista(codigo, code, privilegios, listas, id_Detalle, id);
                resolve();
            }, 3000);
        });
    }

    try {
        await tareaQueTarda();

        spinner.style.display = 'none';
        mensajeCargando.style.display = 'none';
        contenido.style.display = 'block';
        modalCargando.style.display = 'none';
    } catch (error) {
        mensajeCargando.textContent = 'Ocurrió un error al cargar los datos';
        spinner.style.display = 'none';
        console.error(error);
    }
   

}
async function actulizar_form_ctr_cal(id, id_compra) {
    const modalCargando = document.getElementById('modalCargando');
    const spinner = document.getElementById('spinner');
    const mensajeCargando = document.getElementById('mensajeCargando');
    const contenido = document.getElementById('contenido');

    modalCargando.style.display = 'flex';
    spinner.style.display = 'block';
    mensajeCargando.style.display = 'block';
    contenido.style.display = 'none';

    let x = await listadoEvaluacionCaracteristicas();
    let y = await listadoCriterio();
    console.log(x);
    console.log(y);
    let z = y.filter(obj => obj.detalle_control_calidad_iddetalle_control_calidad === Number(id));
    let k = x.filter(obj => z.some(item => item.idcriterio_control_calidad === obj.criterio_control_calidad_idcriterio_control_calidad));
    console.log(z);
    console.log(k);
    function tareaQueTarda() {
        return new Promise((resolve) => {
            setTimeout(() => {
                modal_control_calidad_editar(codigo, code, privilegios, listas, id, id_compra, z, k);
                resolve();
            }, 3000);
        });
    }

    try {
        await tareaQueTarda();

        spinner.style.display = 'none';
        mensajeCargando.style.display = 'none';
        contenido.style.display = 'block';
        modalCargando.style.display = 'none';
    } catch (error) {
        mensajeCargando.textContent = 'Ocurrió un error al cargar los datos';
        spinner.style.display = 'none';
        console.error(error);
    }
}


function ver_documento(id){
    control_calidad_pdf(codigo,privilegios,id);

}




   



function seleccionar_entidad_tipo(entidad_tipo,entidad_id){
    if(entidad_tipo == "Material"){
        return listas.material.find(obj => obj.id === Number(entidad_id));
    }
    return {};
}
export function mostrar_control_calidad(id_ctr_calidad){
    const area = document.querySelector(`#contenido${codigo}`);
    
    let view = "", ind = 1;
    
        view = `
                <div  id="tabla_control_calidad${codigo}">
                    <table class="table mt-4 table-hover" id = "tablaCuerpo">
                        <thead id=lcompra>
                            <tr class="table-dark">
                                <th scope="col">N°</th>
                                <th scope="col">cantidad</th>
                                <th scope="col">Entidad</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Funciones</th>
                            </tr>
                        </thead>
                        <tbody id="Listar_Detalle_control_calidad${codigo}">  
                        
                        </tbody>
                    </table>
                    

                </div>
                <div  id="formulario_control_calidad${codigo}"></div>
                

                
                
            `;
            area.innerHTML = view;
            
            Listar_Detalle_control_calidad_api(id_ctr_calidad);
            
            
    
}
export async function Listar_Detalle_control_calidad_api(id_ctr_calidad){
    await listar();

    const area = document.querySelector(`#Listar_Detalle_control_calidad${codigo}`);
    console.log(Lista_Detalle_Control_calidad);
    let lista_dcc = Lista_Detalle_Control_calidad.filter(obj => obj.control_calidad_idcontrol_calidad === Number(id_ctr_calidad));
    let view = "", ind = 1;
    console.log(lista_dcc);
    lista_dcc.map(lista=>{
        let actualizar;
        let eliminar;
        let registrar;
        let itemMaterial = seleccionar_entidad_tipo(lista.entidad_tipo,lista.entidad_id);
        console.log(itemMaterial);

        registrar = {
            0: ``,
            1: `<a data-id="generar_form_control_calidad,${lista.iddetalle_control_calidad},${id_ctr_calidad}" class="btn btn-primary btn-sm" id="menu${codigo}">
                    <i class="bi bi-clipboard-check-fill"></i>
                </a>`
        }
        actualizar = {
            0: ``,
            1: `<a data-id="actulizar_form_ctr_cal,${lista.iddetalle_control_calidad},${id_ctr_calidad}" class="btn btn-primary btn-sm" id="menu${codigo}">
                    <i class="bi bi-pencil-square"></i>
                </a>`
        }
        eliminar = {
            0: ``,
            1: `<a data-id="Finalizar_control_calidad,${lista.iddetalle_control_calidad},${id_ctr_calidad}" class="btn btn-danger btn-sm" id="menu${codigo}">
                    Finalizar
                </a> `
        }

        let color = Number(lista.cantidad) === 0 ? '#EB879C':'white';
        view += `
            <tr >
               <td style = "background-color:  ${color}">${ind++}</td> 
               <td style = "background-color:  ${color}">${lista.cantidad}</td>               
               <td style = "background-color:  ${color}">${lista.entidad_tipo} </td>
               <td style = "background-color:  ${color}">${itemMaterial.nombre} </td>           
                <td style = "background-color:  ${color}">
                    ${registrar[privilegios[2]]}
                    ${actualizar[privilegios[2]]}
                </td>
           </tr>
            `;
    })
    area.innerHTML = view;
   // console.log(view);
    const enlaces = document.querySelectorAll(`#menu${codigo}`);
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuec);
    });

}






export function sitio(){
    obtner_datos_avaluados();
    listar();
    let view="",ind=1;
  
    listas.calidad.map(lista=>{
        if(lista.estado !== "1"){
            let compra = listas.compra.find(obj => Number(obj.id) === Number(lista.entidadId));
            console.log(compra);
            let itemComprador = listas.empleados.find(obj => Number(obj.id) === Number(compra.empleado))|| {
                "id": 0,
                "nombre": "-",
                "apellido": "-"
            };
            let itemempleado = listas.empleados.find(obj => Number(obj.id) === Number(lista.empleado)) || {
                "id": 0,
                "nombre": "-",
                "apellido": "-"
            };
            view +=`
                <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                
                   
                    <div class="row">
                        <div class="col-md-8">
                            <div class="row">
                                <span>N° ${ind++}</span>
                                <span>Compra lote: ${compra.lote}</span>
                                <span>Comprador: ${itemComprador.nombre} ${itemComprador.apellido}</span>
                                
                                <span>Fecha control calidad: ${lista.fecha}</span>
                                <span>Hora control calidad: ${lista.hora}</span>
                                <span>Inspector de calidad: ${itemempleado.nombre} ${itemempleado.apellido}</span>
                                <span>Num Doc: ${lista.num_docu}</span>
                            </div>
                            
                        </div>
                        
                        <div class="col-md-4  mb-3">
                            <div class="d-flex gap-2 justify-content-end align-items-center column-content">
                                <!-- Botón Control de Calidad -->
                                <a data-id="mostrar_control_calidad,${lista.id}" class="btn btn-info btn-sm rounded-circle" title="Control de Calidad">
                                    <i class="bi bi-table fs-5"></i>
                                </a>
                                
                                <!-- Botón Ver Documento -->
                                <a data-id="ver_documento,${lista.id}" class="btn btn-primary btn-sm rounded-circle" title="Ver Documento">
                                    <i class="bi bi-eye fs-5"></i>
                                </a>
                                
                                <!-- Botón Enviar -->
                                <a data-id="Finalizar_para_almacen,${lista.id},${lista.entidadId}" class="btn btn-success btn-sm d-flex align-items-center gap-2" title="Enviar al Almacén">
                                    <i class="bi bi-send-plus fs-5"></i>
                                    <span>Enviar</span>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
                <div id="modalCargando" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 1000; justify-content: center; align-items: center;">
                    <div id="modalContent" style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); width: 300px; text-align: center;">
                        <div id="spinner" style="border: 4px solid lightgray; border-top: 4px solid black; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto;"></div>
                        <p id="mensajeCargando" style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Cargando, por favor espere...</p>
                        <div id="contenido" style="display: none; font-family: Arial, sans-serif; font-size: 16px; color: #333;">Los datos se han cargado correctamente.</div>
                    </div>
                </div>
                
                `;
                
        }
        
        

    })  
     app.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuec);
    });
    
    

}

