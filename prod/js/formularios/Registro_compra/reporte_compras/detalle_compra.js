import * as listarFunctions from "../../funciones/listar.js";
import * as fuG from "../../funciones/generales.js";
import * as registrarFunctions from "../../funciones/registrar.js";
import { codigos } from "../constantes.js";
import { reportes_compras } from "./reporte_compras.js";




let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;

let Lista_empleados = [];

let Lista_Material = [];
let Lista_medida = [];
let Lista_compras = [];
let List_Envases =[];
let privilegios;
let idcompra;
export async function compra_detalle_material(code, permisos, refrescar,id) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    idcompra = id;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener("click", function () {
        sitio();
      });
    app=document.querySelector(`#content-area${codigos.codigoPrincipal}`);
    
    console.log(Lista_empleados);
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.listar_api_general_verd("listar_compras",idEmpresa),
            listarFunctions.listar_api_general("listar_material",idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
            listarFunctions.listar_api_general("listaenvases",idEmpresa),

            
        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_compras = resultados[1];
        Lista_Material = resultados[2];
        Lista_medida = resultados[3];
        List_Envases = resultados[4];
        console.log(Lista_compras); 
        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
const codigo = codigos.codigodetalle_pedido;




function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "eliminar_detalle_compra":
            eliminar_detalle_compra(id1);
            break;
        
       
        default:
            sitio();
            break;
    }

}
async function eliminar_detalle_compra(iddetalle_compra){
    if (confirm("Desea Eliminar..?")) {
        const data  = await listarFunctions.listar_api_general_verd('eliminar_detalle_compra_material',iddetalle_compra);
        console.log(data);
        alertas(data)
      }
}

async function sitio(){

    let regitrar = {
        1:'',
        0:`
            <form id="formulario${codigo}" > 
                <input type="hidden" name="verDavid" value="registrar_detalle_compra_material">
                <input type="hidden" name="compra_idcompra" value="${idcompra}">  
                <div class="row">
                    <div class="col-lg-12 col-md-12 border p-3 rounded mt-4" >
                        <div class="row">
                            <div style="position: relative;" class="col-md-4">
                                <input type="hidden" name="material_idmaterial" id="material_idmaterial${codigos.codigo_material}" required >

                                <label for="material" class="form-label">Material-Insumo:</label>
                                
                                <input type="text" id="searchInput${codigos.codigo_material}" placeholder="Buscar..." class="form-control" name="material" required>
                                <ul id="dropdownList${codigos.codigo_material}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                            </div>
                            <div class="col-md-1">
                                <label for="cantidad_envases" class="form-label">N° Empaques:</label>
                                <input type="number" class="form-control" id="cantidad_envases" name="cantidad_envases" step="0.01" required>
                            </div>
                            
                            <div style="position: relative;" class="col-md-2">
                                <input type="hidden" name="tipo_envase_idtipo_envase" id="tipo_envase_idtipo_envase${codigos.codigo_envase}" required>

                                <label for="envase" class="form-label">Empaque:</label>
                                <input type="text" id="searchInput${codigos.codigo_envase}" placeholder="Buscar..." class="form-control" name="envase" required>
                                <ul id="dropdownList${codigos.codigo_envase}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                            </div>
                            <div class="col-md-1">
                                <label for="peso_neto" class="form-label">Peso neto:</label>
                                <input type="number" class="form-control" id="peso_neto" name="peso_neto" step="0.01" required>
                            </div>
                            <div class="col-md-1">
                                <label for="medida" class="form-label">Medida:</label>
                                <input type="text" class="form-control" id="medida${codigo}" name="medida" readonly required>
                            </div>
                            <div class="col-md-1">
                                <label for="precio_unitario" class="form-label">Precio:</label>
                                <input type="number" class="form-control" id="precio_unitario" name="precio_unitario" step="0.01" required>
                            </div>
                            <div class="col-md-2">
                                <label for="fecha_venci" class="form-label">Fecha vencimiento:</label>
                                <input type="date" class="form-control" id="fecha_venci" name="fecha_venci" required>
                            </div>
                        </div>
                        
                    </div>
                    
                </div>
                


                <div class="col-md-12 mt-3 d-flex justify-content-between">
                    <button type="reset" class="btn btn-primary btn-sm" id = "limpiar${codigo}">Limpiar</button>
                    <button type="submit" class="btn btn-success btn-lg"><i class="bi bi-plus-lg"></i></button>
                </div>
            </form>
        
        `
    }
    await listar();
    const compra = Lista_compras.find(obj => Number(obj.idcompra) === Number(idcompra));
    const control_calidad = Number(compra.estado);
   
    let view="",ind=1;
        view +=`
        <div class="row">
            
                    <a style="float: left;" class="cerrar d-flex align-items-center mt-1" id="volver${codigo}">
                        <i class="bi bi-chevron-double-left fs-5 me-1"></i>
                        <span>Volver</span>
                    </a>
                    ${regitrar[control_calidad]}
            
            
            
        </div>
         <div id="alerta${codigos.codigo_detalle_compras}" class="mt-4"></div>
        <table class="table table-hover" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                        <th>N°</th>
                        <th>ID Material</th>
                        <th>Cantidad</th>
                        <th>Cantidad Envases</th>
                        <th>Empaque</th>
                        <th>Peso Neto</th>
                        <th>Medida</th>
                        <th>Precio</th>
                        <th>Fecha Vencimiento</th>
                        <th>Funciones</th>
                </tr>
            </thead>
            <tbody id="listar_detalle_compra${codigo}">
            </tbody>
        </table>
        
        `;
     app.innerHTML=view;
    table_listar();
     const enlaces = document.querySelectorAll(".btn");
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
     const volver = document.getElementById(`volver${codigo}`);
     volver.addEventListener('click',volveratrar);




    initializeDropdownSearch(codigos.codigo_material, Lista_Material,'nombre',true);
    initializeDropdownSearch(codigos.codigo_envase, List_Envases,'nombre',false);


    const forme = document.querySelector(`#formulario${codigo}`);
        forme.addEventListener("submit", (e) => registrar_detalle_compra(e, forme));
 }
 async function registrar_detalle_compra(e,forme){
     e.preventDefault();
     let nuevoObjeto = {};
     const dato = new FormData(forme);
     for (let [key, value] of dato.entries()) {
        console.log(key,value);
    }
    for (let [key, value] of dato.entries()){
        if(key === "cantidad_envases"  ||  key === "peso_neto"  || key === "precio_unitario" || key === "fecha_venci"  || key === "material_idmaterial" || key === "tipo_envase_idtipo_envase"){
            
          nuevoObjeto[key] = value;
            
        }
        
    }
    nuevoObjeto['cantidad'] = Number(nuevoObjeto['cantidad_envases']) * Number(nuevoObjeto['peso_neto']);
    nuevoObjeto['total_precio'] = Number(nuevoObjeto['precio_unitario']);
    dato.append('cantidad', nuevoObjeto['cantidad'] );
    dato.append('total_precio',  nuevoObjeto['total_precio'] );
     const data  = await registrarFunctions.sendformData2(dato);
     console.log(data); 
     alertas(data);
 }
 function volveratrar(){
    reportes_compras(code_,permisos_,refrescar_);
 }
 function table_listar(){
    const table = document.getElementById(`listar_detalle_compra${codigo}`);
    let view = "",ind = 1;

    const compra = Lista_compras.find(obj => Number(obj.idcompra) === Number(idcompra));
    const control_calidad = Number(compra.estado);

    compra.detalle.map((detalle)=>{ 
        
        let item_material = Lista_Material.find(obj => Number(obj.id) === Number(detalle.material_idmaterial)) || { nombre:'material'};
        let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(item_material.medida)) || { nombre:'Kg'};
        let item_envase = List_Envases.find(obj => Number(obj.id) === Number(detalle.tipo_envase_idtipo_envase)) || { nombre:'saco'};
        let actualizar = {
            0: ``,
            1: `           
                <div class="text-center">
                    <a data-id="editar_detalle_compra,${detalle.iddetalle_compra}"
                    class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                    style="width: 2.5rem; height: 2.5rem;"
                    title="Editar">
                        <i class="bi bi-pencil-square fs-5"></i>
                    </a>
                    <span class="d-block mt-1 small"></span>
                </div>
                  `,
          };
        let eliminar = {
            0: ``,
            1: `
                <div class="text-center">
                    <a  data-id="eliminar_detalle_compra,${detalle.iddetalle_compra}" class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}" style="width: 2.5rem; height: 2.5rem;"
                    title="Eliminar">
                        <i class="bi bi-trash fs-5"></i>
                    </a>
                    <span class="d-block mt-1 small"></span>
                </div>
                `,
          };
        let estado_ctr_calidad = {
            1: '',
            0: `
               
                ${eliminar[privilegios[2]]}
            `
        }
                       
        view += `
             <tr style = "style=width: 50px; height: 50px;">
                    <td>${ind++}</td>   
                    <td>${item_material.nombre}</td>          
                    <td>${detalle.cantidad}</td>
                    <td>${detalle.cantidad_envases}</td>
                    <td>${item_envase.nombre}</td>
                    <td>${detalle.peso_neto}</td>
                    <td>${item_medida.nombre}</td>
                    <td>${detalle.total_precio}</td>
                    <td>${fuG.cambiarFormatoFecha(detalle.fecha_venci)}</td>
                    <td>
                        <div class="d-flex gap-3">
                            ${estado_ctr_calidad[control_calidad]}
                            
                        </div>

                        
                    </td>
                </tr>  
        `;
    })
    table.innerHTML = view;
    const enlaces = document.querySelectorAll(`.btn${codigo}`);
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
 }

 function parametros_extras(item){
    if(item['rubro_idrubro']){
        const medida = Lista_medida.find((obj) => Number(obj.id) === Number(item.medida));
        document.getElementById(`material_idmaterial${codigos.codigo_material}`).value = item.id;
        document.getElementById(`medida${codigo}`).value = medida.nombre; 
    }else if (item['telefono']){
        document.getElementById(`proveedor_idproveedor${codigos.codigo_proveedor}`).value = item.id;
        document.getElementById(`telefono${codigo}`).value = item.telefono; 
    }else{
        document.getElementById(`tipo_envase_idtipo_envase${codigos.codigo_envase}`).value = item.id;

    }
               
}


 function initializeDropdownSearch(codigo, Lista_Material, valor, condicion) {
    const searchInput = document.getElementById(`searchInput${codigo}`);
    const dropdownList = document.getElementById(`dropdownList${codigo}`);

    // Crear la lista inicial
    function populateDropdown(filteredItems) {
        dropdownList.innerHTML = ''; // Limpia la lista
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item[valor];
            li.style.padding = "5px 10px";
            li.style.cursor = "pointer";
            li.style.borderBottom = "1px solid #ddd"; // Línea de separación
            li.style.borderRadius = '8px';
            li.style.transition = "background-color 0.3s"; // Efecto suave al cambiar el color

            // Efecto hover
            li.addEventListener("mouseenter", () => {
                li.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
                li.style.color = "white";
            });

            li.addEventListener("mouseleave", () => {
                li.style.backgroundColor = "";
                li.style.color = "";
            });

            // Seleccionar el item
            li.addEventListener('click', () => {
                searchInput.value = item[valor];
                dropdownList.style.display = 'none'; // Oculta la lista
                parametros_extras(item);
            });

            dropdownList.appendChild(li);
        });
    }

    // Filtrar la lista según el texto ingresado
    function filterItems(searchText) {
        if(condicion){
            const compra = Lista_compras.find(obj => Number(obj.idcompra) === Number(idcompra));
            const idrubro = Number(compra.rubro_idrubro);
            const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
            const filtered = filterListaRubro.filter(item =>
                item.nombre.toLowerCase().includes(searchText.toLowerCase())
            );
            populateDropdown(filtered);
        }else{
            const filtered = Lista_Material.filter(item =>
                item.nombre.toLowerCase().includes(searchText.toLowerCase())
            );
            populateDropdown(filtered);
        }
        
    }

    // Mostrar y manejar eventos del input
    searchInput.addEventListener('focus', () => {
        dropdownList.style.display = 'block';
        if(condicion){
            const compra = Lista_compras.find(obj => Number(obj.idcompra) === Number(idcompra));
            const idrubro = Number(compra.rubro_idrubro);
            const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
            populateDropdown(filterListaRubro); // Muestra todos los elementos inicialmente
        }else{
            
            populateDropdown(Lista_Material); // Muestra todos los elementos inicialmente
        }
       
    });

    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value;
        filterItems(searchText); // Filtra la lista
    });

    // Ocultar el dropdown si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest(`#searchInput${codigo}`) && !e.target.closest(`#dropdownList${codigo}`)) {
            dropdownList.style.display = 'none';
        }
    });
}
function alertas(data) {
    console.log(data);
    // Definir las variables al principio
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "success") {
      alertClass = "alert-success";
      alertMessage = data[1];
      timeoutDuration = 1500;
  
      
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
  
    // Obtener el div de alerta
    let divalert = document.querySelector(`#alerta${codigos.codigo_detalle_compras}`);
    if (divalert) {
      // Crear el nuevo contenido de la alerta
      let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
      divalert.innerHTML = nuevoContenido;
  
      // Eliminar la alerta después del tiempo especificado
      setTimeout(() => {
        divalert.innerHTML = ``;
        if(alertClass === "alert-success"){
          sitio();
        }
        
      }, timeoutDuration);
    }
  }
   