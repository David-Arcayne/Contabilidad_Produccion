import { URL_APIP } from "../../../../../lib/services.js";
import { codigos } from "../constantes.js";
import * as listarFunctions from "../../funciones/listar.js";
import * as fuG from "../../funciones/generales.js";
import { reportes_compras } from "../reporte_compras/reporte_compras.js";
import { Editar_fila_ } from "../../funciones/editar_fila_.js";
let intervaloId;
let isEditing = false;
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let Lista_proveedores = [];
let Lista_Material = [];
let Lista_medida = [];
let privilegios;
let Lista_rubro = [];
let Lista_envases = [];
let Lista_compras = [];
let Lista_detalle_compra = [];
let Lista_pedidos_material = [];
let Lista_empleados = [];

const codigo = codigos.codigoCompras;
let code;
let permisos_;
let refrescar_;

export function registrar_compra(code_, permisos, refrescar) {
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
            
            listarFunctions.listar_api_general("listar_material", idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
            listarFunctions.listar_api_general("listar_rubro", idEmpresa),
            listarFunctions.listar_api_general("listaenvases", idEmpresa),
            listarFunctions.listar_api_general("listaCompraRealizada", idEmpresa),
            listarFunctions.listar_api_general_verd("Listar_pedidos_material",idEmpresa),
            listarFunctions.listar_Empleados(idEmpresa),


        ]);
        // Asignamos los resultados a las variables correspondientes
        Lista_proveedores = resultados[0];
        
        Lista_Material = resultados[1];
        Lista_medida = resultados[2];
        Lista_rubro = resultados[3];
        Lista_envases = resultados[4];
        Lista_compras = resultados[5];
        Lista_pedidos_material = resultados[6];
        Lista_empleados = resultados[7];

        console.log(resultados[0], resultados[1],resultados[2], resultados[3], resultados[4],resultados[5]);
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
    case "eliminar_material_compra":
        eliminar_material_compra(id1);
      break;
    case "editar_detalle_compra":
        toggleEditSave(event);
      break;
    // Agrega otros casos según sea necesario
    default:
      // Manejo para casos no coincidentes
      sitio();
      break;
  }
}
// function toggleEditSave(event) {
    
//     const permisos = [6, 7];
//     const names = ["fecha_venci", "total_precio"];
//     const boton = event.currentTarget;
//     const fila = boton.closest("tr");
//     const celdas = fila.querySelectorAll("td");
//     const dataid = boton.getAttribute('data-id');
//     const [funcion, id1, id2] = dataid.split(',');
//     const obj_seleccionado = Lista_detalle_compra.find(obj => Number(obj.material_idmaterial) === Number(id1));
//     console.log(obj_seleccionado);

//     const obj_seleccionadoc = { ...obj_seleccionado };
//     let originalValues = {};

//     if (boton.innerHTML.includes('bi-pencil-square')) {
//         // Modo Editar
//         let firstInput;
//         celdas.forEach((celda, index) => {
//             if (permisos.includes(index)) {
//                 const valorOriginal = celda.textContent.trim();
//                 originalValues[index] = valorOriginal;

//                 let input;
                
//                     if(index === 6){
//                         input = document.createElement('input');
//                         input.id = `ediinp${codigo}`;
//                         input.className = "form-control";
//                         input.type = "date";
//                         input.value = valorOriginal;
//                         celda.innerHTML = '';
//                         celda.appendChild(input);
//                     }else{
//                         input = document.createElement('input');
//                         input.id = `ediinp${codigo}`;
//                         input.className = "form-control";
//                         input.type = "number";
//                         input.step = "0.01";
//                         input.value = valorOriginal;
//                         celda.innerHTML = '';
//                         celda.appendChild(input);
//                     }
                

//                 input.addEventListener("keydown", handleKeyDown);

//                 if (!firstInput) {
//                     firstInput = input;
//                 }
//             }
//         });

//         if (firstInput) {
//             firstInput.focus();
//         }

//         boton.innerHTML = '<i class="bi bi-floppy"></i>';
//     } else {
//         guardarCambios();
//     }

//     function handleKeyDown(event) {
//         if (event.key === "Enter") {
//             guardarCambios();
//         } else if (event.key === "Escape") {
//             cancelarCambios();
//         }
//     }

//     function guardarCambios() {
//         const datosnuevos = [];
//         let linea = true;
//         let nuevoValor = "";
//         celdas.forEach((celda, index) => {
//             if (permisos.includes(index)) {
//                 const input = celda.querySelector(`input`);
//                 const select = celda.querySelector('select');
//                 if (input) {
//                     nuevoValor = input.value.trim();
//                     if (nuevoValor !== "") {
//                         celda.textContent = nuevoValor;
//                         if(index === 7){
//                             datosnuevos.push(Number(nuevoValor));
//                         }else{
//                             datosnuevos.push(nuevoValor);
//                         }
                        
//                         linea *= true;
//                     } else {
//                         linea *= false;
//                     }
//                 } else if (select) {
//                     nuevoValor = select.value;
//                     console.log(nuevoValor);
//                     celda.textContent = select.options[select.selectedIndex].text;
//                     datosnuevos.push(Number(nuevoValor));

//                 }
                
//             }
//         });
//         console.error(linea);
        
//         if(linea){
//             obj_seleccionado[names[0]] = datosnuevos[0];
//             obj_seleccionado[names[1]] = datosnuevos[1];
      
     
//             // if (obj_seleccionado) {
//             //     Object.assign(Lista_Orden_Produccion, obj_seleccionado);
//             // }
//             console.log(obj_seleccionado);
//             console.log(obj_seleccionadoc);
//             console.log(areObjectsEqual(obj_seleccionado, obj_seleccionadoc));
          
//             Listar_orden();
//             calcularTotal();
            
//             boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
//             celdas.forEach(celda => {
//                 const input = celda.querySelector(`#ediinp${codigo}`);
//                 if (input) {
//                     input.removeEventListener("keydown", handleKeyDown);
//                 }
//             });
//         }else{
//             cancelarCambios();
//         }
//     }
   
//     function cancelarCambios() {
        
//         celdas.forEach((celda, index) => {
//             if (permisos.includes(index)) {
//                 const input = celda.querySelector('input');
//                 const select = celda.querySelector('select');
                
//                 if (input) {
//                     celda.innerHTML = originalValues[index];
//                 } else if (select) {
//                     celda.innerHTML = originalValues[index];
//                 }
//             }
//         });

//         boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
//         celdas.forEach(celda => {
//             const input = celda.querySelector(`#ediinp${codigo}`);
//             if (input) {
//                 input.removeEventListener("keydown", handleKeyDown);
//             }
//         });
//     }

//     boton.removeEventListener("click", toggleEditSave);
//     boton.addEventListener("click", toggleEditSave);
// }

async function toggleEditSave(event){
    let opc_tipo_envase = [];
    Lista_envases.map(lista => {
      let obj ={ 
        'value': lista.id,
        'label': lista.nombre
      }
      opc_tipo_envase.push(obj);
    });
    console.log(opc_tipo_envase);
    console.log(Lista_detalle_compra);
    
    const columnas = [
            {
                index: 3,
                editable: true,
                type: 'number',
                field: 'cantidad_envases',
                validations: { required: true },
                
            },
            {
                index: 4,
                editable: true,
                type: 'select',
                field: 'tipo_envase_idtipo_envase',
                validations: { required: true },
                options:  opc_tipo_envase,
                
            },
            {
                index: 5,
                editable: true,
                type: 'number',
                field: 'peso_neto',
                validations: { required: true }
            },
            {
                index: 7,
                editable: true,
                type: 'date',
                field: 'fecha_venci',
                validations: { required: false }
            },
            {
                index: 8,
                editable: true,
                type: 'number',
                field: 'precio',
                validations: { required: true }
            },
           
            
           
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_detalle_compra, columnas, 'material_idmaterial');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
      const formData = new FormData();
      formData.append("verDavid", "editar_cargos");
      formData.append("sucursal_idsucursal",uk[0].empresa.idsucursal);

      Object.entries(resultado).forEach(([key, value]) => {
        formData.append(key, value);
      });
    
      console.log("FormData prepared for submission:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
    
    Listar_orden();
      
      
}

function areObjectsEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
}
function eliminar_material_compra(id){
    if (confirm("Desea eliminar...?")) {
        Lista_detalle_compra = Lista_detalle_compra.filter(orden => Number(orden.material_idmaterial) !== Number(id));
        Listar_orden();
        calcularTotal();
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
        if(key === "cantidad_envases"  ||  key === "peso_neto"  || key === "precio_unitario" || key === "fecha_venci"  || key === "material_idmaterial" || key === "tipo_envase_idtipo_envase"){
            
          nuevoObjeto[key] = value;
            
        }
        
    }
    nuevoObjeto['cantidad'] = Number(nuevoObjeto['cantidad_envases']) * Number(nuevoObjeto['peso_neto']);
    nuevoObjeto['total_precio'] = Number(nuevoObjeto['precio_unitario']);
    nuevoObjeto['compra_idcompra'] = 0 ;
    console.log(nuevoObjeto);
    if(Agregar_Lista_pedido(nuevoObjeto)){
        Listar_orden();
        forme.reset();
        establecerFechaHoy();
    }
    
        
 }
 function Agregar_a_lista_pedido(e, lista) {
    e.preventDefault();

    let nuevoObjeto = {};
    
    // Iterar directamente sobre el objeto lista
    for (let [key, value] of Object.entries(lista)) {
        if (key === "cantidad_envases" || key === "peso_neto" || key === "precio_unitario" || key === "fecha_venci" || key === "material_idmaterial" || key === "tipo_envase_idtipo_envase") {
            nuevoObjeto[key] = value;
        }
    }

    // Calcular las propiedades adicionales
    nuevoObjeto['cantidad'] = Number(nuevoObjeto['cantidad_envases'] || 0) * Number(nuevoObjeto['peso_neto'] || 0);
    nuevoObjeto['total_precio'] = Number(nuevoObjeto['precio_unitario'] || 0);
    nuevoObjeto['compra_idcompra'] = 0;

    console.log(nuevoObjeto);

    // Validar y agregar el objeto a la lista
    if (Agregar_Lista_pedido(nuevoObjeto)) {
        Listar_orden();
        establecerFechaHoy();
    }
}
function Agregar_Lista_pedido(nuevo_objeto) {
  let existe = Lista_detalle_compra.some(orden => Number(orden.material_idmaterial) === Number(nuevo_objeto.material_idmaterial));
  
    if (!existe) {
        Lista_detalle_compra.push(nuevo_objeto);
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
  
  Lista_detalle_compra.map(lista=>{
      let item_material = Lista_Material.find(obj => Number(obj.id) === Number(lista.material_idmaterial)) || {"nombre": "-","codigo": "-"};
      let item_envase = Lista_envases.find(obj => Number(obj.id) === Number(lista.tipo_envase_idtipo_envase)) || {'nombre': '-'};
      let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(item_material.medida)) || {'nombre':'-'};
      
      view +=`
          <tr>
              <td>${ind++}</td> 
              <td data-type="${lista.material_idmaterial},codigo">${item_material.codigo}</td>               
              <td data-type="${lista.material_idmaterial},material_idmaterial">${item_material.nombre}</td>
              <td data-type="${lista.material_idmaterial},cantidad_envases">${lista.cantidad_envases}</td>
              <td data-type="${lista.material_idmaterial},tipo_envase_idtipo_envase">${item_envase.nombre}</td>
              <td data-type="${lista.material_idmaterial},peso_neto">${lista.peso_neto}</td>
              <td data-type="${lista.material_idmaterial},medida">${item_medida.nombre}</td>
              <td data-type="${lista.material_idmaterial},fecha_venci">${fuG.cambiarFormatoFecha(lista.fecha_venci)}</td>
              <td data-type="${lista.material_idmaterial},precio">${Number(lista.total_precio)  }</td>
              <td data-type="${lista.material_idmaterial},total_precio" class="subtotal">${Number(lista.total_precio) * Number(lista.cantidad_envases)}</td>
              <td>
                <a data-id="editar_detalle_compra,${lista.material_idmaterial}" class="btn btn-primary btn${codigo}">
                    <i class="bi bi-pencil-square"></i>

                  </a>                            
                  <a data-id="eliminar_material_compra,${lista.material_idmaterial}" class="btn btn-danger btn${codigo}">
                      <i class="bi bi-trash"></i>
                  </a>                            
              </td>
          </tr>
      
      `;
  });
  tablaListar.innerHTML = view;
  calcularTotal();
  const enlaces = document.querySelectorAll(`.btn${codigo}`);
      enlaces.forEach(enlace => {
          enlace.addEventListener("click", menu);
      });
      
}

async function sitio() {
    await listar();
    Lista_detalle_compra = [];
    let view = `
        <div class="container">
            <div class="row">
                <form id="formulario_compra${codigo}" >
                    <input type="hidden" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
                    <input type="hidden" name="estado" value="0">
                    <input type="hidden" name="empleado_idempleado" value="${uk[0].idusuario}">
                    <div class="row">
                        <div class="col-md-3 mb-3 " >
                            <div class="row">
                                
                                <select class="form-select" id="rubro_idrubro${codigo}" name="rubro_idrubro">
                                    <option value="" disabled selected>Seleccione un rubro</option>
                                    
                                </select>
                            </div>
                            
                        </div>
                        <div class="col-md-3 mb-3 " >
                            
                            <div class="row">
                                
                                <select class="form-select" id="tipocompra${codigo}" name="tipocompra">
                                    <option value="1" >Sin Pedido</option>
                                    <option value="2" >Con Pedido</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3 " >
                            
                            <div class="row">
                                
                                <select class="form-select" id="pedido_idpedido${codigo}" name="pedido_idpedido">
                                    <option value="0" >Sin pedido</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class=" col-md-6 border p-3 m-0 rounded">
                            <div class="row">
                  
                                <div style="position: relative;" class="col-md-6">
                                    <input type="hidden" name="proveedor_idproveedor" id="proveedor_idproveedor${codigos.codigo_proveedor}" required>

                                    <label for="Proveedor" class="form-label">Proveedor:</label>
                                    <input type="text" id="searchInput${codigos.codigo_proveedor}" placeholder="Buscar..." class="form-control" name="Proveedor" required>
                                    <ul id="dropdownList${codigos.codigo_proveedor}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                                </div>
                                <div class="col-md-6">
                                    <label for="telefono" class="form-label">Telefono:</label>
                                    <input type="text" class="form-control" id="telefono${codigo}" name="telefono" required readonly >
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
                                    <label for="lote" class="form-label">Lote:</label>
                                    <input type="text" class="form-control" id="lote${codigo}" name="lote" value="${generarLoteCompra()}" required>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </form>   
                <form id="formulario${codigo}" >   
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
                                    <label for="peso_neto" class="form-label">Cantidad:</label>
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
                                    <input type="date" class="form-control" id="fecha_venci" name="fecha_venci" >
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
                            <th>Material</th>
                            <th>N° Empaque</th>
                            <th>Empaque</th>
                            <th>Cantidad</th>
                            <th>Medida</th>
                            <th>Fecha vencimiento</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                            <th>Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_elemetos_orden${codigo}">
                        
                    </tbody>
                </table>
                <div  style = "float: right;">
                    <div class="col-md-6">
                        <label for="total" class="form-label">Total:</label>
                        <input type="text" class="form-control" id="total${codigo}" name="total" readonly>
                    </div>
                </div>
                
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
    initializeDropdownSearch_m(codigos.codigo_material, Lista_Material,'codigo','nombre',true);
    initializeDropdownSearch_m(codigos.codigo_proveedor, Lista_proveedores,'codigo','nombre',false);
    initializeDropdownSearch_(codigos.codigo_envase, Lista_envases,'nombre',false);


    //formulario
        const pedidos = document.getElementById(`pedido_idpedido${codigo}`);
        const tipocompra = document.getElementById(`tipocompra${codigo}`);
        tipocompra.addEventListener('change',()=>{
            if(Number(tipocompra.value) === 1){
                pedidos.innerHTML = `<option value="0" >Sin pedido</option>`;
            }else{
                const selectrubro=document.querySelector(`#rubro_idrubro${codigo}`);

                let view = `<option value="" disabled selected>Seleccione un pedido</option>
`;
                let filtrados = Lista_pedidos_material.filter(obj => Number(obj.estado) === 0 && Number(obj.rubro_idrubro) === Number(selectrubro.value));
                filtrados.map(lista =>{
                    let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado)) || {nombre : 'Benjamin_0', apellido: 'Mora_0'};
                    view += `
                        <option value="${lista.idpedido}" > ${lista.fecha_p} ${item_empleado.nombre} ${item_empleado.apellido}</option>
                    `;
                })
                pedidos.innerHTML = view;
            }
        });
        pedidos.addEventListener('change', (e) => {
            Lista_detalle_compra = [];
             Listar_orden();
            let idpedido = pedidos.value;
            let pedido = Lista_pedidos_material.find(obj => Number(obj.idpedido) === Number(idpedido));
        
            if (!pedido) {
                console.error('Pedido no encontrado');
                return;
            }
        
            let detalle = pedido.detalles;
            detalle.forEach(lista => {
                // Asegurarse de que las propiedades necesarias existan en el objeto
                lista['precio_unitario'] = lista['precio_unitario'] || 1;
                lista['fecha_venci'] = lista['fecha_venci'] || fecha();
        
                // Pasar directamente el objeto lista a Agregar_a_lista
                Agregar_a_lista_pedido(e, lista);
            });
        });
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
            reportes_compras(code,permisos_,refrescar_);
        })
        const btnregistrar = document.querySelector(`#registrar${codigo}`);
        btnregistrar.addEventListener('click', (e) => {
            if (!formulario.checkValidity()) {
                formulario.reportValidity(); // Muestra los mensajes de error de validación
                return;
            }
            e.preventDefault();
            let compra_json = {};
            if (Lista_detalle_compra && Lista_detalle_compra.length > 0) {
                const forme_compra = document.getElementById(`formulario_compra${codigo}`)
                const dato = new FormData(forme_compra);
                dato.append('verDavid', "registrar_compras");
                for (let [key, value] of dato.entries()) {
                    if(key !== "Proveedor" && key !== "telefono "){
                        compra_json[key] = value;
                    }
                    console.log(key,value);
                }
                for (let [key, value] of Lista_detalle_compra.entries()) {
                    console.log(key,value);
                }
                compra_json['idcompra'] = 0;
                compra_json['num_registro'] = Lista_compras.length + 1;
                compra_json['total'] = document.getElementById(`total${codigo}`).value;
                compra_json['detalle'] = Lista_detalle_compra;
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
                    .then((data) => {
                      console.log(data);
                      alertas(data);
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

function calcularTotal() {
    let total = 0;
  
    // Selecciona todas las celdas de subtotal
    document.querySelectorAll(`#listar_elemetos_orden${codigo} .subtotal`).forEach(function(subtotalCell) {
      const valor = parseFloat(subtotalCell.textContent) || 0;
      total += valor;
    });
  
    // Actualiza el campo de total
    document.getElementById(`total${codigo}`).value = total.toFixed(2);
  }
function cancelar_todo(forme){
    const pedidos = document.getElementById(`pedido_idpedido${codigo}`);
    pedidos.innerHTML = `<option value="0" >Sin pedido</option>`;
    forme.reset();
    Lista_detalle_compra = [];
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

function generarLoteCompra() {
   
    const prefijo = 'Lote-C';
    const now = new Date();
    const boliviaTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - 4 * 60 * 60000); 
    const year = boliviaTime.getUTCFullYear();
    const month = String(boliviaTime.getUTCMonth() + 1).padStart(2, '0'); 
    const day = String(boliviaTime.getUTCDate()).padStart(2, '0'); 
    const currentDate = `${year}-${month}-${day}`;
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    console.log(Lista_compras.length);
     const numeroLote = `${prefijo}-${currentDate}-${Lista_compras.length+1}`;
   
    return numeroLote;
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
            const filterLista = Lista_Material.filter((obj) => !Lista_detalle_compra.some(list_mp => Number(list_mp.material_idmaterial) === Number(obj.id)) );
            const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoCompras}`).value;
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
            const filterLista = Lista_Material.filter((obj) => !Lista_detalle_compra.some(list_mp => Number(list_mp.material_idmaterial) === Number(obj.id)) );
            const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoCompras}`).value;
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
function initializeDropdownSearch_(codigo, Lista_Material, valor, condicion) {
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
            const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoCompras}`).value;
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
            const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoCompras}`).value;
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


function sendformData(event, formData) {
  event.preventDefault();

  fetch(`${URL_APIP}api/`, {
    // Reemplaza esto con la URL de tu servidor
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alertas(data);
    })
    .catch((error) => {
      console.error("Error al enviar los datos:", error);
    });
}

function sendform(e, form) {
  e.preventDefault();
  const dato = new FormData(form);
  console.log(dato);
  fetch(`${URL_APIP}api/`, {
    method: "POST",
    body: dato,
  })
    .then((res) => res.json())
    .then((data) => {
      alertas(data);
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
  let divalert = document.querySelector(`#alerta${codigos.codigoPrincipal}`);
  if (divalert) {
    // Crear el nuevo contenido de la alerta
    let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
    divalert.innerHTML = nuevoContenido;

    // Eliminar la alerta después del tiempo especificado
    setTimeout(() => {
      divalert.innerHTML = ``;
      if(alertClass === "alert-success"){
        reportes_compras(code,permisos_,refrescar_);
      }
      
    }, timeoutDuration);
  }
}
