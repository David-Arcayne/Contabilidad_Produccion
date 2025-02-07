import { URL_APIP } from "../../../../../lib/services.js";
import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { etapas_produccion } from "../principal.js";


let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;

let Lista_empleados = [];
let Lista_etapas_produccion =[];
let Lista_seccion=[];
let Lista_etapa_orden = [];
let etapa_orden = {
        idetapa_orden : 1,
        orden : 0,
        etapas_produccion_idetapas_produccion : 0,
        grupo_etapas_idgrupo_etapas : 0
    }


const codigo = codigos.codigoGrupo_crear;
export async function registro_grupo_agregar_etapa(code, permisos, refrescar) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    app=document.querySelector(`#content-area${codigos.codigosubmenu_grupo}`);
    
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.listar_etapas_produccion(idEmpresa),
            listarFunctions.listarseccion(idEmpresa)
        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_etapas_produccion = resultados[1];
        Lista_seccion = resultados[2];
        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}



function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        
        default:
            sitio();
            break;
    }
    
} 

    
function select_etapas_produccion_insertar_grupo(){
    console.log("listo");
    const rubros_select=document.querySelector(`#buscar_porRubro${codigos.codigoPrincipal}`);

    const select_=document.querySelector(`#agregar_etapas${codigo}`);
    if (!select_ || !rubros_select) {
        console.error("No se encontraron los elementos del DOM.");
        return;
    }
    let idrubro = rubros_select.value;
    let view ="";
        Lista_etapas_produccion.map(lista=>{
            if(Number(lista.rubro_idrubro) === Number(idrubro)){    

                let itemseccion = Lista_seccion.find(obj => Number(obj.id) === Number(lista.seccion_idseccion)) || {
                    "id": 0,
                    "nombre_seccion": "Nulo",
                    "ubicacion": "Nulo",
                    "codigo_seccion": "Nulo"
                };
                view+=`

                <option value="${lista.idetapas_produccion}">
                    Etapa producción: ${lista.nombre_etapa} | Detalle: ${lista.detalle} | Sección: ${itemseccion.nombre_seccion} ${itemseccion.codigo_seccion}
                </option>
                `;
            }
        })
        select_.innerHTML= view;
        console.log("lista rubro completa");
        

    
}

function Agregar_a_lista(){
    
    
    let nuevoObjeto = {
        idetapa_orden : 0,
        orden : 0,
        etapas_produccion_idetapas_produccion : document.getElementById(`agregar_etapas${codigo}`).value,
        grupo_etapas_idgrupo_etapas  : document.getElementById(`grupo_etapas_idgrupo_etapas${codigo}`).value
    };

    console.log(nuevoObjeto);

    if(agregarOrdenProduccion(nuevoObjeto)){
        Listar_orden_Etapas();
        alert("Exitoso");
    }
        
 }
 function Listar_orden_Etapas(){
    const tablaListar = document.getElementById(`tabla_etapas_orden${codigo}`);
    let view = "", ind = 1;
    Lista_etapa_orden.map(lista=>{
        
        view +=`
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.idetapa_orden}">${lista.orden} </td>
                <td data-type="${lista.idetapa_orden}">${lista.etapas_produccion_idetapas_produccion}</td>
                <td data-type="${lista.idetapa_orden}">
                    <button class="btn btn-up-down"><i class="bi bi-arrow-up"></i></button>
                    <button class="btn btn-up-down"><i class="bi bi-arrow-down"></i></button>
                
                </td>
                <td>
                     
                    <a data-id="eliminar,${lista.idetapa_orden}" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
            </tr>
        
        `;
    });
    tablaListar.innerHTML = view;
   
 }
 function agregarOrdenProduccion(nuevaOrden) {
    let existeEtapa = Lista_etapa_orden.some(orden => orden.etapas_produccion_idetapas_produccion === nuevaOrden.etapas_produccion_idetapas_produccion);
    if (!existeEtapa) {
        Lista_etapa_orden.push(nuevaOrden);
        console.log("etapa agregado correctamente.");
        return true;
    } else {
        alert("Este producto ya existe en la lista.");
        return false;
    }
}

function EditarGrupo(){
    const alv = document.getElementById(`registro_editar${codigo}`);
    let view = "";
    view = `
        <div class="row">
            <label for="registrar" class="form-label">Seleccionar Grupo</label>
            <select class="form-select" id="grupo_etapas_idgrupo_etapas${codigo}" name="registrar">
                <option value="" disabled selected>Seleccione un opcion</option>
                <option value="1">grupo 1</option>
                <option value="2">grupo 2</option>
            </select>
        </div>
    `;
    alv.innerHTML = view;
}
function nuevogrupo(){
    const alv = document.getElementById(`registro_editar${codigo}`);
    let view = "";
    view = `
        <div class="row">
            <div class="col-md-12">
                <label for="nombre" class="form-label">Nombre Grupo etapas producción</label>
                <input type="text" class="form-control" id="grupo_etapas_idgrupo_etapas${codigo}" name="nombre" maxlength="60" placeholder="Ingresa el nombre del grupo" required>
            </div>
        </div>
    `;
    alv.innerHTML = view;
}

async function sitio(){
    let view="",ind=1;
        view +=`
            <div class="container mt-4" id="datos${codigo}">
                <div class="col-md-3 mb-3 ">
                    <div class="row">
                        <label for="registrar" class="form-label">Generar o actualizar grupo:</label>
                        <select class="form-select" id="seleccionar_opcion${codigo}" name="registrar">
                            <option value="" disabled selected>Seleccione un opcion</option>
                            <option value="0">Nuevo grupo</option>
                            <option value="1">Añadir a grupo existente</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6 mb-3 " id="registro_editar${codigo}">
                        
                </div>
                <div class="col-md-12 mb-3 " id="div_etapas${codigo}">
                    <div class="row">
                        <label for="registrar" class="form-label">Agregar etapas producción:</label>
                        <select class="form-select" id="agregar_etapas${codigo}" name="registrar">
                            <option value="" disabled selected>Seleccione una etapa</option>
                            
                        </select>
                    </div>
                </div>

                <button type="button" class="btn btn-outline-success mr-1 mt-4" id="llenar_lista${codigo}" aria-label="Agregar">Agregar Etapa</button>

                

                <div class="container mt-5">
                    <table class="table table-bordered table-striped">
                        <thead >
                            <tr class="table-dark">
                                <th scope="col">Nº</th>
                                <th scope="col">Etapas producción</th>
                                <th scope="col">Orden</th>
                                <th scope="col">Funciones</th>
                            </tr>
                        </thead>
                        <tbody  id="tabla_etapas_orden${codigo}">
                            <tr>
                                <td>2</td>
                                <td>Amasado</td>
                                <td>
                                    <button class="btn btn-up-down"><i class="bi bi-arrow-up"></i></button>
                                    <button class="btn btn-up-down"><i class="bi bi-arrow-down"></i></button>
                                </td>
                                <td>
                                    <button class="btn btn-outline-danger"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>1</td>
                                <td>Orneado</td>
                                <td>
                                    <button class="btn btn-up-down"><i class="bi bi-arrow-up"></i></button>
                                    <button class="btn btn-up-down"><i class="bi bi-arrow-down"></i></button>
                                </td>
                                <td>
                                    <button class="btn btn-outline-danger"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-md-12 mt-3 d-flex justify-content-between">

                    <button type="button" class="btn btn-primary btn-sm" id="cancelar_etapa${codigo}">Cancelar</button>
                    <button type="button" class="btn btn-success btn-lg" id="registrara_lista_etapas${codigo}">Registrar</button>
                    
                </div>
                
                
            </div>
        `;
    await listar();
    
    console.log(Lista_etapas_produccion);
     app.innerHTML=view;
     select_etapas_produccion_insertar_grupo();
     

     const selectrubro = document.querySelector(`#buscar_porRubro${codigos.codigoPrincipal}`);

     selectrubro.addEventListener("change", function() {
         select_etapas_produccion_insertar_grupo();   
     });

     



     const select_nuevo_editar = document.querySelector(`#seleccionar_opcion${codigo}`);
        

     select_nuevo_editar.addEventListener("change", function() {
         if(select_nuevo_editar.value === "1"){
            EditarGrupo();
         }else{
            nuevogrupo();
         }
     });

     const btn_agregar_etp = document.getElementById(`llenar_lista${codigo}`);
     btn_agregar_etp.addEventListener('click', function(){
            const opcion_selec = document.getElementById(`seleccionar_opcion${codigo}`);
            let idvalue = opcion_selec.value;
            if(idvalue === "1" || idvalue === "0"){
                Agregar_a_lista()
            }else{
                alert("debe seleccionar una opcion");
            }
     });
    
     const btnregistrar_api =  document.getElementById(`registrara_lista_etapas${codigo}`);
     btnregistrar_api.addEventListener('click', function() {
        const etapas = [];
        const rows = document.querySelectorAll('#tabla_etapas_orden${codigo} tr');
    
        rows.forEach((row, index) => {
            const etapa = {
                numero: row.children[0].innerText.trim(),  // Columna Nº
                nombre: row.children[1].innerText.trim(),  // Columna Etapas producción
                orden: index + 1                           // Orden basado en la posición en la tabla
            };
            etapas.push(etapa);
        });
    
        console.log(etapas);  // Verificar el array de objetos
    });







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
 }
 
function mostrarSeccion(section) {
    //const contentArea = document.getElementById(`filtrar${subcodigo}`);
   // contentArea.innerHTML = ''; 
    switch(section) {

        case 'pendientes':
            //mostrar_pendientes();
            break;
        case 'encurso':
           // mostrar_encurso();
            break;
        case 'finalizados':
            //mostrar_finalizados();
            break;
        case 'negativos':
            //mostrar_negativos();
            break;
        
        default:
           // contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}
