

import { control_calidad_produccion_encurso } from "./encurso.js";
import * as registrarFuntions from "../funciones/registrar.js";
import * as listarFunctions from "../funciones/listar.js"
import * as FuG from "../funciones/generales.js"
import { codigos } from "./constantes.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app = "";
let isEditing = false;
let intervaloId;
let Produccion_pendientes = []; 
let Lista_compras = [];
let Lista_empleados = [];

let Lista_medida = [];
let Lista_lote_produccion = [];
let Lista_Control_Calidad = [];
let Lista_salida_produccion = [];
let Lista_productos = [];
let code;
let permisos;
let refrescar;
const codigo = codigos.codigosPrincipal;
export async function control_calidad_produccion_pendiente(code_, permisos_, refrescar_) {
    code = code_;
    permisos = permisos_;
    refrescar = refrescar_;
    app=document.querySelector(`#filtrar${codigos.codigosPrincipal}`);
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            // listarFunctions.listar_api_general_verd("listarProveedor", idEmpresa),
            
            // listarFunctions.listar_api_general("listar_rubro", idEmpresa),

            listarFunctions.listar_api_general("getempleado",idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
            listarFunctions.listar_api_general_verd("listadoControlCalidad",idEmpresa),
            listarFunctions.listar_api_general_verd("listadoProduccionLote",idEmpresa),//
            listarFunctions.listar_api_general_verd("listaSalidaProduccion",idEmpresa),
            listarFunctions.listar_api_general("listar_productos_comercial",idEmpresa),
            


        ]);     
        Lista_empleados = resultados[0];
        Lista_medida = resultados[1];
        Lista_Control_Calidad = resultados[2];
        Lista_lote_produccion = resultados[3];
        Lista_salida_produccion = resultados[4];
        Lista_productos = resultados[5];
        console.log(Lista_salida_produccion);
    } catch (error) {

        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}

function generarNumeroDocumento(Entidad_tipo) {
    const ListaEntidad = Lista_Control_Calidad.filter(obj => obj.Entidad_tipo === Entidad_tipo);
    const prefijo = `DOC-${Entidad_tipo}`; 
    const numeroSecuencial = String(ListaEntidad.length + 1).padStart(7, '0'); 
    return `${prefijo}-${numeroSecuencial}`;
}

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2,id3] = dataid.split(',');
     console.log(funcion,id1);
 
    switch (funcion) {
       
        case "registrar_control_calidad_produccion":
            registrar_control_calidad_(id1,id2,id3);   
            break;
        case "mostrar_datos_produccion":
            mostrar_datos_produccion(id1);   
            break;

            //
        default:
            sitio();
            break;
    }
}
function registrar_control_calidad_(lote,Entidad_id,Entidad_tipo){
    const area = document.querySelector(`#contenido${codigo}`);
    let view = "";

    
    view = `
        <div class="container" id="">
            <h1 class="text-center mb-4 fw-bold fs-6 ">Crear Documento Ctr Calidad</h1>
        </div>
        <form id="formulario_controlCalidad${codigo}">
            <input type="hidden" name="verDavid" value="registrarControlCalidad">
            <input type="hidden" class="form-control" id="Entidad_tipo" name="Entidad_tipo" value="${Entidad_tipo}">
            <input type="hidden" class="form-control" id="Entidad_id" name="Entidad_id" value="${Entidad_id}">
            <input type="hidden" class="form-control" id="empresa_idempresa" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" class="form-control" id="empleado_idempleado" name="empleado_idempleado" value ="${uk[0].idusuario}">
            
            <div class="col-md-12 mt-3 d-flex justify-content-between">
                <label class="form-label fw-bold fs-5 mb-4">Responsable: ${uk[0].nombre}</label>
                <label class="form-label fw-bold fs-5 mb-4">Lote: ${lote}</label>
            </div>


            <div class="mb-3">
                <label for="fecha_cc" class="form-label">Fecha de Control de Calidad</label>
                <input type="date" class="form-control" id="fecha" name="fecha_cc">
            </div>

            <div class="row">
                <div class = "col">
                    <label for="hora_cc" class="form-label">Hora de Control de Calidad</label>
                    <input type="text" class="form-control" id="hora" name="hora_cc">
                </div>
                <div class="col mt-4">
                    <button type="button" id="editarHora" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Editar</button>
                </div>
            </div>

            <div class="mb-3">
                <label for="num_doc" class="form-label">Número de Documento</label>
                <input type="text" class="form-control" id="num_doc" name="num_doc" value= "${generarNumeroDocumento(Entidad_tipo)}" >
            </div>
            <button type="submit" class="btn btn-primary">Confirmar</button>
        </form>
    `;
    area.innerHTML = view;
    const horaInput = document.getElementById('hora');
    const editarHoraBtn = document.getElementById('editarHora');
    console.log(horaInput);
    if (horaInput) {
        intervaloId =  setInterval(actualizarHora, 1000);
        establecerFechaHoy();
    }
    editarHoraBtn.addEventListener('click', function() {
        isEditing = !isEditing; 
        if (isEditing) {
            clearInterval(intervaloId);
            horaInput.type = 'time'; 
            horaInput.id = 'hora_editable';
            const now = new Date();
            const offset = -4; 
            now.setHours(now.getHours() + offset);
            
            const hours = String(now.getUTCHours()).padStart(2, '0');
            const minutes = String(now.getUTCMinutes()).padStart(2, '0');
          
            horaInput.value = `${hours}:${minutes}`;
            editarHoraBtn.textContent = 'Hora actual';
        } else {
            horaInput.type = 'text'; 
            horaInput.id = 'hora';

            intervaloId = setInterval(actualizarHora, 1000); 
            editarHoraBtn.textContent = 'Editar';
        }
    });


    const forme = document.querySelector(`#formulario_controlCalidad${codigo}`);
    forme.addEventListener("submit", async (e) =>{
        e.preventDefault();
        
        const dato=new FormData(forme);
        for (let [key, value] of dato.entries()) {
            console.log(key, value);
        }
        
        try {
            const data = await registrarFuntions.sendformData2(dato);
            console.log(data);
    
            if (data[0] === "success" && data[2] === "registrarControlCalidad") {
                if(Entidad_tipo === "L_Prod"){
                    alert('desarrollo');
                    registrar_detalle_produccion(data[3], Entidad_id);
                }
            }
        } catch (error) {
            console.error("Error al enviar control de calidad:", error);
        }

    } );
    
}

async function registrar_detalle_produccion(idcontrol_calidad,idproduccion) {
    console.log(idproduccion);
    console.log(Lista_salida_produccion);
    const detalle = Lista_salida_produccion.filter(obj => Number(obj.produccion_idproduccion) ===  Number(idproduccion));
    console.log(detalle);
    let data;
    for (const item of detalle) {
        
        const formData = new FormData();
        formData.append('verDavid', 'registrarDetalleControlCalidad');
        formData.append('cantidad', item.cantidad);
        formData.append('entidad_tipo', 'Producto');
        formData.append('entidad_id', item.producto_idproducto);
        formData.append('control_calidad_idcontrol_calidad', idcontrol_calidad);

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            data = await registrarFuntions.sendformData2(formData);
            console.log(data);
            
        } catch (error) {
            console.error('Error al registrar detalle de control de calidad:', error);
        }
    }
    const area = document.querySelector(`#contenido${codigo}`);
    area.innerHTML = '';
     FuG.alertas([data[0],data[0] === 'success' ? 'Su control de calidad esta en curso': data[1]],codigos.codigosPrincipal);
        if(data[0] === "success"){
            let doc=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
            console.log(doc);
            doc.querySelector(`button[data-section="encurso"]`).click();
    
        }
}
function mostrar_datos_produccion(idlote){
    let lista = Lista_lote_produccion.find(item => Number(item.idlote) === Number(idlote));
    let itemempleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado)) || {"nombre": "-","apellido": "-"};
    const area = document.querySelector(`#contenido${codigo}`);
    let view = "";
    view = `
        <div class="row">
            <div class="col">
                <div class="row">
                    <h6 class="fw-bold text-primary mb-2">Lote: ${lista.lote}</h6>
                </div>
                <div class="row">
                    <p class="col"><strong>Responsable:</strong> ${itemempleado.nombre} ${itemempleado.apellido}</p>
                    <p class="col"><strong>Fecha:</strong> ${lista.fecha_lote}</p>
                    <p class="col"><strong>Hora:</strong> ${lista.hora_lote}</p>
                </div>
                    
                
            </div>
            <div class="scrollable-table mt-4">
                <table class="table table-hover" id="editableTable${codigos.codigoVerproduccion}">
                    <thead class="table-dark">
                        <tr>
                            <th>N°</th>
                            <th>Codigo</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Medida</th>
                        </tr>
                    </thead>
                    <tbody id="listar_detalle_produccion${codigos.codigoVerproduccion}">

                    </tbody>
                </table>
            </div>
        </div>
        
    `;
    area.innerHTML = view;
    listarDetalleProduccion_(idlote);
}
function listarDetalleProduccion_(idlote){
    const listarr=document.querySelector(`#listar_detalle_produccion${codigos.codigoVerproduccion}`);
    const produccion = Lista_lote_produccion.find(obj => Number(obj.idlote) === Number(idlote));
    const detalle_salida = Lista_salida_produccion.filter(obj => Number(obj.produccion_idproduccion) === Number(produccion.idproduccion));
    console.log(produccion);
    console.log(detalle_salida);
    let view="",ind=1;
    detalle_salida.forEach(detalle=>{
    
        let item_producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(detalle.producto_idproducto));
        let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(item_producto.unidad_id_unidad)) || { nombre:'Kg'};
       
                    
        view += `

            <tr style = "style=width: 50px; height: 50px;">
                <td>${ind++}</td> 
                <td>${item_producto.codigo}</td>    
                <td>${item_producto.nombre}</td>  
                <td>${detalle.cantidad}</td>        
                <td> ${item_medida.nombre}</td>
            </tr>  
    `;
    })

    listarr.innerHTML=view;
    
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
    });
}





function establecerFechaHoy() {
    const fechaInput = document.getElementById('fecha');
    const now = new Date();
    const offset = -4; // Bolivia es UTC-4
    now.setHours(now.getHours() + offset);
    
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;
    
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    fechaInput.value = currentDate;
}
function actualizarHora() {
    const horaInput = document.getElementById('hora');
    if(horaInput) {
        const now = new Date();
        const offset = -4; // Bolivia es UTC-4
        now.setHours(now.getHours() + offset);
        
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}:${seconds}`;
    
        horaInput.value = currentTime;
    }
}
async function sitio(){

    let view = `
    <div class="row">
        <div class="col-md-12">
            <input type="text" id="filtro${codigo}" placeholder="Buscar en la lista...." class="form-control form-control-sm ">
        </div>
        
    </div>
    <div id="listar_pendientes${codigo}" style = "max-height: 400px; overflow-y: auto; display: block;">
        
        
    </div>
    ` 
    app.innerHTML = view;
    await listar();

    const Produccion_pendientes = Lista_lote_produccion.filter(obj => Number(obj.lote_estado) === 1 );
    const listaUnida = Produccion_pendientes.map(lote => {
        const empleado = Lista_empleados.find(emp => Number(emp.id) === Number(lote.empleado_idempleado));
        return {
            ...lote,
            nombre: empleado ? empleado['nombre'] : null,
            apellido: empleado ? empleado['apellido'] : null,
        
        };
    });
    listar_en_curso(listaUnida);
    setTimeout(() => {
        const searchInput = document.getElementById(`filtro${codigo}`);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchText = e.target.value;
                filterItems(searchText); // Filtra la lista
            });
        }
    }, 0);

    function filterItems(searchText) {
        const filtered = listaUnida.filter(item =>
            (item['lote'] || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (item['fecha'] || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (item['nombre'] || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (item['apellido'] || "").toLowerCase().includes(searchText.toLowerCase()) 
        );

        listar_en_curso(filtered);
    }



   

}

async function listar_en_curso(listaUnida){
    
        
    let view=``,ind=1;
    let body_encurso=document.querySelector(`#listar_pendientes${codigo}`);

    listaUnida.map(lista => {
        
        view +=`
        <div class="container my-4" >
            <div class="card shadow-sm border-0 mb-3" >
                
                    <h6 class="fw-bold text-primary mb-2">Lote: ${lista.lote}</h6>

                    <div class="row align-items-center ">
                        <div class="col-md-6 ">
                            <ul class="list-unstyled">
                                <li><strong>N°:</strong> ${ind++}</li>
                                <li><strong>Fecha:</strong>  ${FuG.cambiarFormatoFecha(lista.fecha_lote)}</li>
                                <li><strong>Hora:</strong> ${lista.hora_lote}</li>
                                <li><strong>Responsable:</strong> ${lista.nombre} ${lista.apellido}</li>
                                
                            </ul>
                        </div>
                        <div class="col-md-6 text-md-end text-center ">
                            <div class="btn-group ">
                                <!-- Botón Control de Calidad -->
                                <button class="btn btn-success btn-sm" 
                                        data-id="registrar_control_calidad_produccion,${lista.lote},${lista.idlote},L_Prod"  
                                        title="Comenzar Control Calidad">
                                    <i class="bi bi-send-check fs-5"></i>
                                </button>

                                <!-- Botón Ver Documento -->
                                <button class="btn btn-primary btn-sm" 
                                        data-id="mostrar_datos_produccion,${lista.idlote}"  
                                        title="Ver Lote Producción">
                                    <i class="bi bi-table fs-5"></i>
                                </button>

                                
                            </div>
                        </div>
                    </div>
                
            </div>
        </div>
        
        
        `;
    })
        
    body_encurso.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });
    

}

