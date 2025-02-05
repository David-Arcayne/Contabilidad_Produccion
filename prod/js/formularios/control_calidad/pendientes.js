
import { preparar_listas,listas_enviadas,obtenerListaCompras } from "../funciones/obtener.js";

import * as registrarFuntions from "../funciones/registrar.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let listas ;
let app = "";
let ComprasestadoCero =[];
let isEditing = false;
let intervaloId;
let ComprasestadoUno = [];
let ComprasestadoDos = [];
let codigo;
const code = Array.from({ length: 5 }, () => rand()).join("") + "pendiente";
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export async function control_calidad_compra_pendiente(codigor) {
    codigo = codigor;
    app=document.querySelector(`#filtrar${codigor}`);
    await  obtenerListas(); 
    let c = await obtenerListaCompras();
    console.log(c);
    sitio();    
    
}
async function obtenerListas() {
    try {
        // Llamar a preparar_listas para que llene todas las listas
        await preparar_listas();  // Asegurarse de que preparar_listas() se complete
        
        // Acceder a listas_enviadas una vez que esté lleno
        console.log(listas_enviadas);
        
        listas = listas_enviadas;

    } catch (error) {
        console.error('Error al obtener las listas:', error);
    }
}
function generarNumeroDocumento() {
    const prefijo = 'DOC'; 
    const numeroSecuencial = String(listas.calidad.length + 1).padStart(7, '0'); 
    return `${prefijo}-${numeroSecuencial}`;
}
function generarLoteCompra() {
    const prefijo = 'Lote';
    const now = new Date();
    const boliviaTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - 4 * 60 * 60000); 
    const year = boliviaTime.getUTCFullYear();
    const month = String(boliviaTime.getUTCMonth() + 1).padStart(2, '0'); 
    const day = String(boliviaTime.getUTCDate()).padStart(2, '0'); 
    const currentDate = `${year}-${month}-${day}`;
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);

    const numeroCompra =  listas.m.length + 1;
    console.log(listas.m);
    const numeroLote = `${prefijo}-${currentDate}-${numeroCompra}-${numeroAleatorio}`;

    return numeroLote;
}


function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, ids] = dataid.split(',');
     console.log(funcion,id1);
 
    switch (funcion) {
        case "registrar_control_calidad": 
            registrar_control_calidad(id1,ids);
            break;
        case "mostrar_datos":
       
                mostrar_datos(id1);   
            break;
        
        default:
            sitio();
            break;
    }
}
function mostrar_datos(id_compra){
    const area = document.querySelector(`#contenido${codigo}`);
    let view = "";
    view = `
        <table class="table mt-4 table-hover" id = "tablaCuerpo">
            <thead id=lcompra>
                <tr class="table-dark">
                    <th scope="col">N°</th>
                    <th scope="col">Material</th>
                    <th scope="col">Contenido envases</th>
                    <th scope="col">Cantidad envase</th>
                    <th scope="col">Precio_Unitario</th>
                     <th scope="col">Fecha_Venci</th>
                    <th scope="col">Total_Precio</th>
                </tr>
            </thead>
            <tbody id="contenidoListaDetalleCompra">  
            </tbody>
        </table>
        <div id ="totalCompra" style="text-align: right;"> 

        </div>
    `;
    area.innerHTML = view;
    listarDetalleCompra(id_compra);
    
}
function listarDetalleCompra(id_compra){

    const listarr=document.querySelector("#contenidoListaDetalleCompra");
    const listar2 = document.querySelector("#totalCompra");
        let totalyti= 0;
       let view="",ind=1;
       console.log(listas.md);
       let lista_detalle = listas.md.filter(obj => obj.compra_id === Number(id_compra));
       console.log(lista_detalle);
       lista_detalle.map(lista=>{
      
           let itemMaterial = listas.material.find(item => item.id == lista.material_id);
            let item_unidad_cm = listas.medidas.find(obj => obj.id === lista.medida_id) || {
                'id':-1,
                'nombre':'-',
                'descripcion':'-',
                'estado':-1,
            }
           view+=`
            <tr id = "cuerpoLista">
               <td>${ind++}</td> 
               <td>${itemMaterial.nombre}</td>               
               <td>${lista.contenido} ${item_unidad_cm.nombre}</td>
               <td>${lista.cantidad} </td>           
               <td>${lista.precio_unitario}</td>
               <td>${lista.fecha_vencimiento}</td>
               <td>${lista.total_precio}</td>
               
           </tr>
           `;
           
           totalyti =totalyti + Number(lista.total_precio);
           console.log(totalyti);
       })
       console.log(totalyti);
       let view2 = `<h6>Total Compra: ${totalyti}</h6>`
    //    view+=view2;
       listarr.innerHTML=view;
       listar2.innerHTML=view2;
       const enlaces = document.querySelectorAll(".btn");
       enlaces.forEach(enlace => {
       enlace.addEventListener("click", menu);
    });
}

function registrar_control_calidad(id_compra,lote){
    const area = document.querySelector(`#contenido${codigo}`);
    let view = "";
    let item_compra = ComprasestadoCero.find(obj => obj.id === id_compra) || {
        
            "id": "-1",
            "fecha": "",
            "hora": "",
            "lote": "",
            "estado": "",
            "empleado": "",
            "proveedor": ""
        
    };
    
    view = `
      
        <form id="formulario_controlCalidad${codigo}">
            <input type="hidden" name="verDavid" value="registrarControlCalidad">
            <input type="hidden" class="form-control" id="Entidad_tipo" name="Entidad_tipo" value="compra">
            <input type="hidden" class="form-control" id="Entidad_id" name="Entidad_id" value="${id_compra}">
            <input type="hidden" class="form-control" id="empresa_idempresa" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" class="form-control" id="empleado_idempleado" name="empleado_idempleado" value ="${uk[0].idusuario}">


            <label  class="form-label">Empleado: ${uk[0].nombre}</label>
            <label  class="form-label">Lote: ${lote}</label>


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
                <input type="text" class="form-control" id="num_doc" name="num_doc" value= "${generarNumeroDocumento()}" >
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
    forme.addEventListener("submit", (e) =>{
        registrarControlCalidad(e, forme,id_compra);
        item_compra['estado'] = "1";

    } );
    
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
function sitio(){
    ComprasestadoCero = listas.compra.filter(item => item.estado === "0");

    ComprasestadoUno = listas.compra.filter(item => item.estado === "1");

    ComprasestadoDos = listas.compra.filter(item => item.estado === "2");
    
    let view="",ind=1;
        
    ComprasestadoCero.map(lista=>{
        let itemempleado = listas.empleados.find(obj => Number(obj.id) === Number(lista.empleado)) || {
            "id": 0,
            "nombre": "-",
            "apellido": "-"
        };
        view +=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                <span>${ind++}  ${lista.fecha}   ${lista.hora} ${itemempleado.nombre} ${itemempleado.apellido}</span>
                <span>Lote: ${lista.lote}  </span>
                <div>
                    <a data-id="registrar_control_calidad,${lista.id},${lista.lote}" 
                    class="btn btn-success btn-sm rounded-circle " >
                        <i class="bi bi-send-check fs-5"></i>
                    </a>
                    <a data-id="mostrar_datos,${lista.id}" 
                    class="btn btn-primary btn-sm rounded-circle " >
                        <i class="bi bi-table fs-5"></i>
                    </a>
                </div>
                
            </div>`;
        
        

    })
        
    app.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });
    

}
async function registrarControlCalidad(e,form,id_compra){
    e.preventDefault();
    console.log(form);
    const dato=new FormData(form);
    for (let [key, value] of dato.entries()) {
        console.log(key, value);
    }
    
    try {
        const data = await registrarFuntions.sendformData2(dato);
        console.log(data);

        if (data[0] === "success" && data[2] === "registrarControlCalidad") {
            registrar_detalle_control_calidad(data[3], id_compra);
        }
    } catch (error) {
        console.error("Error al enviar control de calidad:", error);
    }
        
   
}

async function registrar_detalle_control_calidad(id_ctr_calidad, id_compra) {
    console.log(id_compra);
    console.log(listas.md);

    let Listas_Detalle_aux = listas.md.filter(obj => obj.compra_id == Number(id_compra));
    console.log(Listas_Detalle_aux);

    for (const item of Listas_Detalle_aux) {
        const formData = new FormData();
        formData.append('verDavid', 'registrarDetalleControlCalidad');
        formData.append('cantidad', item.cantidad);
        formData.append('entidad_tipo', 'Material');
        formData.append('entidad_id', item.material_id);
        formData.append('control_calidad_idcontrol_calidad', id_ctr_calidad);

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const data = await registrarFuntions.sendformData2(formData);
            console.log(data);
        } catch (error) {
            console.error('Error al registrar detalle de control de calidad:', error);
        }
    }
    const area = document.querySelector(`#contenido${codigo}`);
    area.innerHTML = '';
    sitio(); 
    
}