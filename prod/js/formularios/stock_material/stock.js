import * as listarFunctions from "../funciones/listar.js";



let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "stock_material";
let Listastockmaterial;

let Lista_Material;
let Lista_Medida;
let Lista_proveedor;
let Lista_seccion;
let Lista_compras;
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export async function stock_material_stock(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        stock_material_stock(code, permisos, refrescar);
    });
    await listar();
    console.log(Listastockmaterial);
    console.log(Lista_Material);
    console.log(Lista_Medida);
    console.log(Lista_proveedor);
    console.log(Lista_seccion);
    console.log(Lista_compras);
    sitio();    
    
}
  
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listadoAlmacenMaterial(idEmpresa),
            listarFunctions.listar_material(idEmpresa),
            listarFunctions.listar_medidas(idEmpresa),
            listarFunctions.listarProveedor(idEmpresa),
            listarFunctions.listarseccion(idEmpresa),
            listarFunctions.Listarcompras(idEmpresa)
        ]);

        // Asignamos los resultados a las variables correspondientes
        Listastockmaterial = resultados[0];
        Lista_Material = resultados[1];
        Lista_Medida = resultados[2];
        Lista_proveedor = resultados[3];
        Lista_seccion = resultados[4];
        Lista_compras = resultados[5];
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}



const sitio = () => {
                let view=`
        <div class="container mt-5">
        <div class="row">
            <div class="col-md-4">
                <div class="row">
                    <div class="col-md-6">
                        <label for="Item" class="form-label">Items:</label>
                        <select class="form-select" id="item${codigo}" name="item">
                            <option value="" disabled selected>Seleccione un item</option>
                            <option value="rubro">Proveedor</option>
                            <option value="idcategorias_p">Sección</option>
                            <option value="idunidad_p">Medida</option>
                            <option value="idmedida_p">Material</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="Opciones" class="form-label">Opciones:</label>
                        
                        <select class="form-select" id="Opciones${codigo}" name="Opciones">
                        </select>
                    </div>
                </div>
            </div>
            <div class="col-md-4"> 
                <div class="row">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="checkbox1${codigo}">
                        <label class="form-check-label" for="checkbox1${codigo}">
                            Buscar por Lote
                        </label>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <input type="text" class="form-control" id=""/>
                    </div>
                </div>
                
            </div>
            <div class="col-md-4"> 
                <div class="row">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="checkbox2${codigo}">
                        <label class="form-check-label" for="checkbox2${codigo}">
                            Buscar por fecha de caducidad
                        </label>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <label class="form-label">Fecha Desde</label>
                        <input type="date" class="form-control" id="creationDateFromCampaign"/>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Fecha Hasta</label>
                        <input type="date" class="form-control" id="creationDateToCampaign"/>
                    </div>
                </div>
                
            </div>
        </div>
        <div class="col-12">
            <br> <br>
            <button type="button" class="btn btn-primary col-md-2" id="filtrarBusqueda${codigo}"><i class="bi bi-search"></i></button>
            <button type="button" class="btn btn-primary col-md-2" id="cancelarfiltro${codigo}"><i class="bi bi-x-circle"></i></button>
            <br> <br>
        </div>
      
        
        <table class="table table-striped table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>N°</th>
                    <th>Material</th>
                    <th>Cantidad</th>
                    <th>Medida</th>
                    <th>Costo Unitario</th>
                    <th>Fecha de Caducidad</th>
                    <th>Lote</th>
                    <th>Proveedor</th>
                    <th>Sección</th>
                    <th>Caducados</th>
                </tr>
            </thead>
            <tbody id="Listar_stock_material${codigo}">
                
            </tbody>
        </table>
    </div>
    `;
    app.innerHTML=view;
   Listar_stock_material();
}
function Listar_stock_material(){
    const aset = document.getElementById(`Listar_stock_material${codigo}`);
    let view = "", ind = 1;
    
    Listastockmaterial.map(lista => {
        let medida = Lista_Medida.find(obj => obj.id === lista.medida_idmedida);
        let compra = Lista_compras.find(obj => obj.id === lista.compra_idcompra);
        let proveedor = Lista_proveedor.find(obj => Number(obj.id) === lista.proveedor_idproveedor);
        let seccion = Lista_seccion.find(obj => obj.id === lista.seccion_idseccion);
        let caducado = estaCaducado(lista.fecha_caducidad) ? `<i class="bi bi-circle-fill" style="color:red"></i>` : `<i class="bi bi-circle-fill" style="color:green"></i>`;

        view += `
      
            <tr>
                <td >${ind++}</td> 
                <td >${lista.nombre_mat}</td> 
                <td >${lista.cantidad}</td> 
                <td >${medida.nombre}</td> 
                <td >${lista.costo_unitario}</td> 
                <td >${lista.fecha_caducidad}</td> 
                <td >${compra.lote}</td> 
                <td >${proveedor.nombre}</td> 
                <td >${seccion.nombre_seccion}</td> 
                <td >${caducado}</td> 


            </tr>
        `;
    })
    aset.innerHTML = view;
}
function estaCaducado(fechaCaducidad) {
    const now = new Date(); // Obtiene la fecha actual del sistema (incluyendo la zona horaria)
    const fechaCaducidadProducto = new Date(fechaCaducidad); // Convierte la fecha de caducidad a objeto Date
    
    // Compara si la fecha actual es mayor que la fecha de caducidad
    if (now > fechaCaducidadProducto) {
        return true; // El producto está caducado
    } else {
        return false; // El producto no está caducado
    }
}

function obtener_fecha_bolivia(){
    const now = new Date();
    const offset = -4; // Bolivia es UTC-4
    now.setHours(now.getHours() + offset);
    
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;

    return currentDate;
}
function sendformData(event, formData) {
    event.preventDefault();

    fetch(`./api/`, { // Reemplaza esto con la URL de tu servidor
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

        fetch(`./api/`,{
            method:"POST",
            body:dato
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
    if (data[0] == "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;
        if(data[2]=="editar_estado_divisa"){
            return;
        }
        // Resetear el formulario si existe
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        if(data[2]==="registrar_divisa"){
            listar_divisas();

        }
        if(data[2]==="eliminar_divisa"){
            console.log(List_Divisa);

            console.log(obt_divisa_aux);
            List_Divisa = List_Divisa.filter(obj => obj.id !== Number(obt_divisa_aux['id']));
            console.log(List_Divisa);
            listar_divisasArray();
            obt_divisa_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        if(data[2]==="editar_divisa"){
            obt_divisa_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="editar_divisa"){
                const obj = List_Divisa.find(ob => ob.id === obt_divisa_aux['id']);

                console.log(obt_divisa_aux);

                console.log(obj);
                if (obt_divisa_aux) {
                    Object.assign(obj, obt_divisa_aux);
                }
                console.log(obt_divisa_aux);

                console.log(obj);
                console.log(List_Divisa);
                listar_divisasArray();
                obt_divisa_aux = { ...{ id: 0, nombre: "", sigla: "" } };

            }
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