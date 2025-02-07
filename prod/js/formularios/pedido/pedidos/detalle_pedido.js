import * as listarFunctions from "../../funciones/listar.js";
import * as registrarFunctions from "../../funciones/registrar.js";
import * as FuG from "../../funciones/generales.js";
import { codigos } from "../constantes.js";
import { lista_pedidos_material } from "./pedidos.js";




let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let Lista_Orden_Producciones =[];
let Lista_detalle_orden_produccion = [];
let Lista_empleados = [];
let Lista_productos =[];
let Lista_Material = [];
let Lista_medida = [];
let solicitudes_material = [];
let idpedido;
let List_Envases =[];
export async function pedido_detalle_material(code, permisos, refrescar,idpedido_) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    idpedido = idpedido_;
    app=document.querySelector(`#content-area${codigos.codigoPrincipal}`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener("click", function () {
        sitio();
      });
   
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.select_lista_productos(idEmpresa),
            listarFunctions.mostrar_ordenproduccion(idEmpresa),
            listarFunctions.listar_detalle_produccion(idEmpresa),
            listarFunctions.listar_api_general_verd("Listar_pedidos_material",idEmpresa),
            listarFunctions.listar_api_general("listar_material",idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
            listarFunctions.listar_api_general("listaenvases",idEmpresa),


            
        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_productos =resultados[1];
        Lista_Orden_Producciones = resultados[2];
        Lista_detalle_orden_produccion = resultados[3];
        solicitudes_material = resultados[4];
        Lista_Material = resultados[5];
        Lista_medida = resultados[6];
        List_Envases = resultados[7];
        console.log(solicitudes_material);
        
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
        case "detalle_materiales":
            break;
        
        case "eliminar_solicitud_material":
            eliminar_solicitud_material(id1);
            break;
       //editar_solicitud_material
        default:
            sitio();
            break;
    }

}

async function  eliminar_solicitud_material(iddetalle_pedido) {
    if(confirm("Desea Eliminar..?")){
        const data = await listarFunctions.listar_api_general_verd('eliminar_detalle_pedido',iddetalle_pedido);
        FuG.alertas(data,codigo);
    }
}
async function sitio(){
    
    await listar();
    let view="",ind=1;
        view +=`
        <div class="row">
            <a style="float: left;" class="cerrar d-flex align-items-center mt-1" id="volver${codigo}">
                <i class="bi bi-chevron-double-left fs-5 me-1"></i>
                <span>Volver</span>
            </a>
            <form id="formulario${codigo}" >   
                <input type="hidden" name="verDavid" value="registrar_detalle_pedido">
                <input type="hidden" name="pedido_idpedido" value="${idpedido}">  
                <div class="row">
                    <div class="col-lg-12 col-md-12 border p-3 rounded mt-4" >
                        <div class="row">
                            <div style="position: relative;" class="col-md-4">
                                <input type="hidden" name="material_idmaterial" id="material_idmaterial${codigos.codigo_pedido_material}" required >

                                <label for="material" class="form-label">Material-Insumo:</label>
                                <input type="text" id="searchInput${codigos.codigo_pedido_material}" placeholder="Buscar..." class="form-control" name="material" required>
                                <ul id="dropdownList${codigos.codigo_pedido_material}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                            </div>
                            <div class="col-md-2">
                                <label for="cantidad_envases" class="form-label">N° Empaques:</label>
                                <input type="number" class="form-control" id="cantidad_envases" name="cantidad_envases" step="0.01" required>
                            </div>
                            
                            <div style="position: relative;" class="col-md-2">
                                <input type="hidden" name="tipo_envase_idtipo_envase" id="tipo_envase_idtipo_envase${codigos.codigo_pedido_envase}" required>

                                <label for="envase" class="form-label">Empaque:</label>
                                <input type="text" id="searchInput${codigos.codigo_pedido_envase}" placeholder="Buscar..." class="form-control" name="envase" required>
                                <ul id="dropdownList${codigos.codigo_pedido_envase}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                            </div>
                            <div class="col-md-3">
                                <label for="peso_neto" class="form-label">Peso neto:</label>
                                <input type="number" class="form-control" id="peso_neto" name="peso_neto" step="0.01" required>
                            </div>
                            <div class="col-md-1">
                                <label for="medida" class="form-label">Medida:</label>
                                <input type="text" class="form-control" id="medida${codigo}" name="medida" readonly required>
                            </div>
                            
                        
                        </div>
                        
                    </div>
                    
                </div>
                


                <div class="col-md-12 mt-3 d-flex justify-content-between">
                    <button type="button" class="btn btn-primary btn-sm" id = "limpiar${codigo}">Limpiar</button>
                    <button type="submit" class="btn btn-success btn-lg"><i class="bi bi-plus-lg"></i></button>
                </div>
            </form>
        </div>
        <div id="alerta${codigo}" class="mt-4"></div>

        
        <table class="table table-hover" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                     <th scope="col">Codigo</th>
                    <th scope="col">Material</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Empaque</th>
                    <th scope="col">Peso neto</th>
                    <th scope="col">Medida</th>
                     
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="Lista_solicitud_material${codigo}">
              
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



     
     initializeDropdownSearch_m(codigos.codigo_pedido_material, Lista_Material,'codigo','nombre',true);
     initializeDropdownSearch(codigos.codigo_pedido_envase, List_Envases,'nombre',false);


    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => registrar_detalle_pedido(e, forme));

 }
 async function registrar_detalle_pedido(e,forme){
    e.preventDefault();
    let nuevoObjeto = {};
    const dato = new FormData(forme);
   
   for (let [key, value] of dato.entries()){      
        nuevoObjeto[key] = value;   
        console.log(key,value);

   }
   
    const data  = await registrarFunctions.sendformData2(dato);
    console.log(data); 
    alertas(data);
}

 function parametros_extras(item){
    if(item['rubro_idrubro']){
        const medida = Lista_medida.find((obj) => Number(obj.id) === Number(item.medida));
        document.getElementById(`material_idmaterial${codigos.codigo_pedido_material}`).value = item.id;
        document.getElementById(`medida${codigo}`).value = medida.nombre; 
    }else{
        document.getElementById(`tipo_envase_idtipo_envase${codigos.codigo_pedido_envase}`).value = item.id;

    }
               
}
function initializeDropdownSearch_m(codigo, Lista_Material,clave, valor, condicion) {
    const searchInput = document.getElementById(`searchInput${codigo}`);
    const dropdownList = document.getElementById(`dropdownList${codigo}`);

    // Crear la lista inicial
    function populateDropdown(filteredItems) {
        dropdownList.innerHTML = ''; // Limpia la lista
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent =item [clave] + " "+item[valor];
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
                
                searchInput.value = item [clave] +" "+ item[valor];
                
                
                dropdownList.style.display = 'none'; // Oculta la lista
                parametros_extras(item);
            });

            dropdownList.appendChild(li);
        });
    }

    // Filtrar la lista según el texto ingresado
    function filterItems(searchText) {
        if(condicion){
            const compra = solicitudes_material.find(obj => Number(obj.idpedido) === Number(idpedido));
            const idrubro = Number(compra.rubro_idrubro);
            const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
            const filtered = filterListaRubro.filter(item =>
                item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
                item[clave].toLowerCase().includes(searchText.toLowerCase())
            );
            
            populateDropdown(filtered);
        }else{
            const filtered = Lista_Material.filter(item =>
                item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
                item[clave].toLowerCase().includes(searchText.toLowerCase())
            );
            populateDropdown(filtered);
        }
        
    }

    // Mostrar y manejar eventos del input
    searchInput.addEventListener('focus', () => {
        dropdownList.style.display = 'block';
        if(condicion){
            const compra = solicitudes_material.find(obj => Number(obj.idpedido) === Number(idpedido));
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
                item[valor].toLowerCase().includes(searchText.toLowerCase())
            );
            populateDropdown(filtered);
        }else{
            const filtered = Lista_Material.filter(item =>
                item[valor].toLowerCase().includes(searchText.toLowerCase())
            );
            populateDropdown(filtered);
        }
        
    }

    // Mostrar y manejar eventos del input
    searchInput.addEventListener('focus', () => {
        dropdownList.style.display = 'block';
        if(condicion){
            const compra = solicitudes_material.find(obj => Number(obj.idpedido) === Number(idpedido));
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
 function volveratrar(){
    lista_pedidos_material(code_,permisos_,refrescar_);
 }
 function table_listar(){
    const table = document.getElementById(`Lista_solicitud_material${codigo}`);
    const idrubro =document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`);
  
    let view = "",ind = 1;
    let a =   {
        idpedido: 1,
        fecha_p: '2024-11-20',
        hora: '10:00:00',
        estado: 0,
        empleado_idempleado: 45,
        rubro_idrubro:1,
        detalles: [
            {
                iddetalle_pedido: 1,
                cantidad: 54,
                pedido_idpedido: 1,
                material_idmaterial: 12,
                observaciones: "nulo"
            }
        ]
    };
    const pedido = solicitudes_material.find(obj => Number(obj.idpedido) === Number(idpedido));
    pedido.detalles.map((lista)=>{
        console.log(lista);
        
        console.log(Lista_empleados);
        let item_material = Lista_Material.find(obj => Number(obj.id) === Number(lista.material_idmaterial)) || { nombre:'material'};
        let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(item_material.medida)) || { nombre:'Kg'};
        let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado));
        let item_envase = List_Envases.find(obj => Number(obj.id) === Number(lista.tipo_envase_idtipo_envase)) || { nombre:'saco'};
        view += `
             <tr style = "style=width: 50px; height: 50px;">
                    <td>${ind++}</td> 
                    <td data-type="${lista.iddetalle_pedido},nombre">${item_material.codigo}</td>          
                    <td data-type="${lista.iddetalle_pedido},nombre">${item_material.nombre}</td>          
                    <td data-type="${lista.iddetalle_pedido},cantidad" >${lista.cantidad_envases}</td>
                    <td data-type="${lista.iddetalle_pedido},tipo_envase_idtipo_envase">${item_envase.nombre}</td>
                    <td data-type="${lista.iddetalle_pedido},peso_neto" >${lista.peso_neto}</td>
                    <td data-type="${lista.iddetalle_pedido},medida" >${item_medida.nombre}</td>
                    
                    
                    <td>
                        <div class="d-flex gap-3">
                            
                            <div class="text-center">
                                <a  data-id="eliminar_solicitud_material,${lista.iddetalle_pedido}"
                                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                                style="width: 2.5rem; height: 2.5rem;"
                                title="Eliminar">
                                    <i class="bi bi-trash fs-5"></i>
                                </a>
                                <span class="d-block mt-1 small"></span>
                            </div>
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
    let divalert = document.querySelector(`#alerta${codigo}`);
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