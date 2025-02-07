import { URL_APIP } from "../../../../../lib/services.js";
import { codigos } from "../constantes.js";
import * as listarFunctions from "../../funciones/listar.js";
import * as fuG from "../../funciones/generales.js";
import { Editar_fila_ } from "../../funciones/editar_fila_.js";

import { reporte_distribuciones } from "../reporte_distribuciones/reporte_distribuciones.js";
let intervaloId;
let isEditing = false;
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let Lista_proveedores = [];
let Lista_Producto = [];
let Lista_medida = [];
let privilegios;
let Lista_rubro = [];
let Lista_envases = [];
let Lista_Distribuciones = [];
let Lista_detalle_ditribucion = [];
let Lista_pedidos_material = [];
let Lista_empleados = [];

const codigo = codigos.codigo_distribucion;
let code;
let permisos_;
let refrescar_;

export function registrar_distribucion(code_, permisos, refrescar) {
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
  code = code_;
  permisos_ = permisos;
  refrescar_ = refrescar;
  
  sitio();
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_api_general_verd("listarProveedor", idEmpresa),
            
            listarFunctions.listar_api_general("listar_productos_comercial", idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
            listarFunctions.listar_api_general("listar_rubro", idEmpresa),
            listarFunctions.listar_api_general("listaenvases", idEmpresa),
            listarFunctions.listar_api_general_verd("listar_distribucion", idEmpresa),
            listarFunctions.listar_api_general_verd("Listar_pedidos_material",idEmpresa),
            listarFunctions.listar_Empleados(idEmpresa),


        ]);
        // Asignamos los resultados a las variables correspondientes
        Lista_proveedores = resultados[0];
        
        Lista_Producto = resultados[1];
        Lista_medida = resultados[2];
        Lista_rubro = resultados[3];
        Lista_envases = resultados[4];
        Lista_Distribuciones = resultados[5];
        Lista_pedidos_material = resultados[6];
        Lista_empleados = resultados[7];

        console.log(Lista_Distribuciones);
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  const forme = document.querySelector(`#alerta`);
  switch (funcion) {
    case "eliminar_producto_distribucion":
        eliminar_producto_distribucion(id1);
      break;
    case "editar_detalle_distribucion":
        toggleEditSave(event);
      break;
    // Agrega otros casos según sea necesario
    default:
      // Manejo para casos no coincidentes
      sitio();
      break;
  }
}
async function toggleEditSave(event){
    const columnas = [
           
            
            {
                index: 3,
                editable: true,
                type: 'number',
                field: 'cantidad',
                validations: { required: true }
            },
            
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_detalle_ditribucion, columnas, 'producto_idproducto');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
    
     Listar_orden();
}

function eliminar_producto_distribucion(producto_idproducto){
    if (confirm("Desea eliminar...?")) {
        Lista_detalle_ditribucion = Lista_detalle_ditribucion.filter(orden => Number(orden.producto_idproducto) !== Number(producto_idproducto));
        Listar_orden();
      
    }
}
function listar_rubro() {
    console.log("listo");
  
    const listar2 = document.querySelector(
      `#rubro_idrubro${codigo}`
    );
    let view = "";
    Lista_rubro.map((lista) => {
      view += `
                  <option value="${lista.id}">${lista.rubro}</option>
              `;
    });
    listar2.innerHTML = view;
    console.log("lista rubro completa");
  }
function Agregar_a_lista(e,forme){
    e.preventDefault();
    
    let nuevoObjeto = {};
    const dato=new FormData(forme);
    for (let [key, value] of dato.entries()){
        if(key === "cantidad"  ||  key === "producto_idproducto" ){
            
          nuevoObjeto[key] = value;
        }
        
    }
   
    nuevoObjeto['distribucion_iddistribucion'] = 0 ;
    console.log(nuevoObjeto);
    if(Agregar_Lista_distribucion(nuevoObjeto)){
        Listar_orden();
        forme.reset();
        establecerFechaHoy();
    }
    
        
 }

function Agregar_Lista_distribucion(nuevo_objeto) {
  let existe = Lista_detalle_ditribucion.some(orden => Number(orden.material_idmaterial) === Number(nuevo_objeto.material_idmaterial));
  
    if (!existe) {
        Lista_detalle_ditribucion.push(nuevo_objeto);
        console.log("material agregado correctamente.");
        return true;
    } else {
        alert("Este material ya existe en la lista.");
        return false;
    }
}
function Listar_orden(){
  const tablaListar = document.getElementById(`listar_elemetos_orden${codigo}`);
  let view = "", ind = 1;
  
  Lista_detalle_ditribucion.map(lista=>{
      let producto = Lista_Producto.find(obj => Number(obj.idproduct_comercial) === Number(lista.producto_idproducto)) || {"nombre": "-","codigo": "-"};
      
      let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(producto.unidad_id_unidad)) || {'nombre':'-'};
      

      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_detalle_distribucion,${lista.producto_idproducto}"
                  class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Editar sección">
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
                <a  data-id="eliminar_producto_distribucion,${lista.producto_idproducto}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar sección">
                    <i class="bi bi-trash fs-5"></i>
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
            `,
      };

     
      view +=`
          <tr>
                <td>${ind++}</td> 
                <td data-type="${lista.producto_idproducto},codigo,codigo">${producto.codigo}</td>               
                <td data-type="${lista.producto_idproducto},producto_idproducto,producto_idproducto">${producto.nombre}</td>
                <td data-type="${lista.producto_idproducto},cantidad,cantidad">${lista.cantidad}</td>
                
                <td data-type="${lista.producto_idproducto},medida,medida">${item_medida.nombre}</td>
                
                <td>
                    <div class="d-flex gap-3">
                          
                       
                        ${eliminar[privilegios[3]]}
           

                    </div>                         
                </td>
          </tr>
      
      `;
  });
  tablaListar.innerHTML = view;
  
  const enlaces = document.querySelectorAll(".btn");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menu);
  });
      
}


function initializeDropdownSearch_m(codigo, Lista_Material,clave, valor, condicion,entidad) {
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
                
                searchInput.value = item [clave] +" "+ item[valor] ;
                
                
                dropdownList.style.display = 'none'; // Oculta la lista
                item['entidad']=entidad;
                parametros_extras(item);
            });
  
            dropdownList.appendChild(li);
        });
    }
  
    // Filtrar la lista según el texto ingresado
    function filterItems(searchText) {
        if(condicion){
            const filterLista = Lista_Material.filter((obj) => !Lista_detalle_ditribucion.some(list_mp => Number(list_mp.producto_idproducto) === Number(obj.idproduct_comercial)) );

           const idrubro = document.getElementById(`rubro_idrubro${codigos.codigo_distribucion}`).value;
            const filterListaRubro = filterLista.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
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
            const filterLista = Lista_Material.filter((obj) => !Lista_detalle_ditribucion.some(list_mp => Number(list_mp.producto_idproducto) === Number(obj.idproduct_comercial)) );
            const idrubro = document.getElementById(`rubro_idrubro${codigos.codigo_distribucion}`).value;
            const filterListaRubro = filterLista.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
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

function parametros_extras(item){
    console.log(item);
    if(item['entidad'] === 'producto'){
        document.getElementById(`producto_idproducto${codigos.codigo_producto}`).value = item.idproduct_comercial;
        
  
    }      
  }

async function sitio() {
    await listar();
    Lista_detalle_ditribucion = [];
    let view = `
        <div class="container">
            <div class="row">
                <form id="formulario_compra${codigo}" >
                    <input type="hidden" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
                    <input type="hidden" name="estado" value="0">
                    <input type="hidden" name="usuario_idusuario" value="${uk[0].idusuario}">
                    <div class="row">
                        <div class="col-md-3 mb-3 " >
                            <div class="row">
                                
                                <select class="form-select" id="rubro_idrubro${codigo}" name="rubro_idrubro">
                                    <option value="" disabled selected>Seleccione un rubro</option>
                                    
                                </select>
                            </div>
                            
                        </div>
                    </div>

                    <div class="row">
                        <div class=" col-md-6 border p-3 m-0 rounded">
                            <div class="row">
                                <div class="col-md-12">
                                    <label for="usuario" class="form-label">Usuario:</label>
                                   <input type="text" class="form-control" style=" border: none; background-color: transparent;color: inherit; pointer-events: none;" id="usuario" name="usuario" value = "${uk[0].nombre}" readonly>
                                </div>
                            </div>
                            
                        </div>
                        <div class=" col-md-6 border p-3 m-0 rounded">
                            <div class="row">
                                <div class="col-md-3">
                                    <label for="fecha" class="form-label">Fecha:</label>
                                    <input type="date" class="form-control" id="fecha${codigo}" name="fecha" required>
                                </div>

                                <div class="col-md-5">
                                    <div class="row">
                                        <div class = "col">
                                            <label for="hora" class="form-label">Hora solicitud:</label>
                                            <input type="text" class="form-control" id="hora${codigo}" name="hora">
                                        </div>
                                        <div class="col mt-4">
                                            <button type="button" id="editarHora${codigo}" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Editar</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <label for="numerodoc" class="form-label">Numero Doc:</label>
                                    <input type="text" class="form-control" id="numerodoc${codigo}" name="numerodoc" value="${generar_numero_doc()}" required>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </form>   
                <form id="formulario${codigo}" >   
                    <div class="row">
                        <div class="col-lg-12 col-md-12 border p-3 rounded mt-4" >
                            <div class="row">
                                <div style="position: relative;" class="col-md-5">
                                    <input type="hidden" name="producto_idproducto" id="producto_idproducto${codigos.codigo_producto}" required >

                                    <label for="producto" class="form-label">Producto:</label>
                                    <input type="text" id="searchInput${codigos.codigo_producto}" placeholder="Buscar..." class="form-control" name="producto" required>
                                    <ul id="dropdownList${codigos.codigo_producto}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                                </div>
                                <div class="col-md-4">
                                    <label for="cantidad" class="form-label">Cantidad:</label>
                                    <input type="number" class="form-control" id="cantidad" name="cantidad" step="0.0001" required>
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
            <div id="alerta${codigos.codigoPrincipal}" class="mt-4"></div>
            <div style = "max-height: 350px; overflow-y: auto; display: block;" class="mt-4">
                <table class="table table-bordered table-hover table-striped" id = "editableTable${codigo}">
                    <thead >
                        <tr class="table-dark">
                            <th>N°</th>
                            <th>Codigo</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Medida</th>
                            <th>Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_elemetos_orden${codigo}">
                        
                    </tbody>
                </table>
               
                
                <div class="col-md-12 mt-3 d-flex justify-content-between">
                    <button type="button" class="btn btn-primary btn-sm" id="cancelar${codigo}">Cancelar</button>
                    <button type="button" class="btn btn-success btn-lg" id="registrar${codigo}">Registrar</button>
                </div>
            </div>
        </div>
    `;
    app.innerHTML = view;
    listar_rubro();
    // fecha y hora
    const horaInput = document.getElementById(`hora${codigo}`);
    const editarHoraBtn = document.getElementById(`editarHora${codigo}`);
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
            horaInput.id = `hora${codigo}`;

            intervaloId = setInterval(actualizarHora, 1000); 
            editarHoraBtn.textContent = 'Editar hora';
        }
    });
    // seleccionables y buscadores
    
    initializeDropdownSearch_m(codigos.codigo_producto, Lista_Producto,'codigo','nombre',true,'producto');
   


    //formulario
        
        const forme = document.querySelector(`#formulario${codigo}`);
        forme.addEventListener("submit", (e) => Agregar_a_lista(e, forme));

        const formulario = document.getElementById(`formulario_compra${codigo}`);

        const limpiar = document.querySelector(`#limpiar${codigo}`);
        limpiar.addEventListener('click',() => {
                
            forme.reset();
            establecerFechaHoy();
        });

        const btncancelar = document.querySelector(`#cancelar${codigo}`);
        btncancelar.addEventListener('click', ()=>{
            cancelar_todo(forme);
            reporte_distribuciones(code,permisos_,refrescar_);
        })
        const btnregistrar = document.querySelector(`#registrar${codigo}`);
        btnregistrar.addEventListener('click', (e) => {
            if (!formulario.checkValidity()) {
                formulario.reportValidity(); // Muestra los mensajes de error de validación
                return;
            }
            e.preventDefault();
            let compra_json = {};
            if (Lista_detalle_ditribucion && Lista_detalle_ditribucion.length > 0) {
                const forme_compra = document.getElementById(`formulario_compra${codigo}`)
                const dato = new FormData(forme_compra);
                dato.append('verDavid', "registrar_distribucion");
                
                for (let [key, value] of dato.entries()) {
                    if(key !== "Proveedor" && key !== "telefono "){
                        compra_json[key] = value;
                    }
                    console.log(key,value);
                }
                for (let [key, value] of Lista_detalle_ditribucion.entries()) {
                    console.log(key,value);
                }
                compra_json['iddistribucion'] = 0;
                compra_json['detalle'] = Lista_detalle_ditribucion;
                console.log(compra_json);

                fetch(`${URL_APIP}api/`, {
                    method: "POST", // Método HTTP
                    headers: {
                      "Usar-Registro-David": "true",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(compra_json), // Convertir el objeto JS a JSON antes de enviarlo
                  })
                .then((response) => response.json()) // Procesar la respuesta en formato JSON
                .then( (data) => {
                    console.log(data);
                     fuG.alertas(data,codigos.codigoPrincipal);
                    setTimeout(() => {
                        reporte_distribuciones(code,permisos_,refrescar_);
                        
                      }, 2100);
                    

                })
                .catch((error) => console.error("Error:", error));
            }else{
                alert("Lista vacia");
            }
            
            
        })
        const selectrubro=document.querySelector(`#rubro_idrubro${codigo}`);
        selectrubro.addEventListener('change',()=>{
            
            cancelar_todo(forme);
        });

  
}

function cancelar_todo(forme){
    
    forme.reset();
    Lista_detalle_ditribucion = [];
    Listar_orden();
    establecerFechaHoy();
}

function actualizarHora() {
    const horaInput = document.getElementById(`hora${codigo}`);
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
function fecha(){
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); 
    const dia = hoy.getDate().toString().padStart(2, '0'); 

    const fechaFormateada = `${anio}-${mes}-${dia}`;
    
    return fechaFormateada;
}
function establecerFechaHoy() {
    const fechaInput = document.getElementById(`fecha${codigo}`);
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); 
    const dia = hoy.getDate().toString().padStart(2, '0'); 

    const fechaFormateada = `${anio}-${mes}-${dia}`;
    
    fechaInput.value = fechaFormateada;
}



function generar_numero_doc() {
    const prefijo = `DOC-SALIDA`; 
    const numeroSecuencial = String(Lista_Distribuciones.length + 1).padStart(7, '0'); 
    return `${prefijo}-${numeroSecuencial}`;
}



