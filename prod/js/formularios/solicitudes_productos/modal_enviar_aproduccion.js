import { URL_APIP } from "../../../../lib/services.js";
import { Orden_produccion_solic } from "../Almacen_producto/orden_produccion.js";
import * as listarFunctions from "../funciones/listar.js";
import * as registerFuntions from "../funciones/registrar.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let Listas_Control_calidad;
let Lista_Detalle_Control_calidad;
let overlayy;
let app = "";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let id_orden_produccion;
let listas;
let id_Detalle;
let id;
let Orden_produccion_detalle;
let Lista_empleados;
let intervaloId;
let isEditing = false;
let aux=[];

let Lista_Orden_Produccion =[];
let Lista_productos =[];
let obt_ordenProd_aux = {
    "iddetalle_produccion": 0,
    "cantidad": 0,
    "observaciones": "detalle",
    "orden_produccion_idorden_produccion": 0,
    "producto_idproducto": 0
};
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.mostrar_orden_produccion(id_orden_produccion),
            listarFunctions.select_lista_productos(idEmpresa)
        ]);

        Lista_empleados = resultados[0];
        Orden_produccion_detalle = resultados[1];
        Lista_productos = resultados[2];
        aux = {...resultados[2]}
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}

const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "modal";
function rand(){
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}

export async function modal_crear_lote_produccion(code, permisos, refrescar, codigo, id) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    id_orden_produccion = id;
    //Orden_produccion_detalle = await listarFunctions.mostrar_orden_produccion(id);
    await listar();
    console.log(Orden_produccion_detalle);
    console.log(Lista_empleados);
    sitio();    
}
function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    switch (funcion) {
        case "eliminar":
            eliminarOrdenProduccion(id1);
            break;
        
        case "editar":
            toggleEditSave(event);
            break;
        default:
            console.error("Entro aqui");
            break;
    }

}
function toggleEditSave(event) {
    
    const permisos = [1, 2, 3];
const names = ["producto_idproducto", "cantidad", "observaciones"];
const boton = event.currentTarget;
const fila = boton.closest("tr");
const celdas = fila.querySelectorAll("td");
const dataid = boton.getAttribute('data-id');
const [funcion, id1, id2] = dataid.split(',');
const obj_seleccionado = Lista_Orden_Produccion.find(obj => obj.producto_idproducto=== Number(id1));
console.log(obj_seleccionado);

const obj_seleccionadoc = { ...obj_seleccionado };
let originalValues = {};

console.log(funcion, id1, id2);

if (boton.innerHTML.includes('bi-pencil-square')) {
    // Modo Editar
    let firstInput;
    celdas.forEach((celda, index) => {
        if (permisos.includes(index)) {
            const valorOriginal = celda.textContent.trim();
            originalValues[index] = valorOriginal;

            let input;
            if (index === 1 ) {
                
                input = createSelectElement(names[permisos.indexOf(index)]); // Crear el elemento select correctamente
                if (input) {
                    celda.innerHTML = '';
                    input.value = obj_seleccionado[names[permisos.indexOf(index)]];

                    celda.appendChild(input);
                } else {
                    console.error(`No se encontró el elemento con id #${names[index]}`);
                    return;
                }
            } else {
                if(index === 2){
                    input = document.createElement('input');
                    input.id = `ediinp${subcodigo}`;
                    input.className = "form-control";
                    input.type = "number";
                    input.value = valorOriginal;
                    celda.innerHTML = '';
                    celda.appendChild(input);
                }else{
                    input = document.createElement('input');
                    input.id = `ediinp${subcodigo}`;
                    input.className = "form-control";
                    input.type = "text";
                    input.value = valorOriginal;
                    celda.innerHTML = '';
                    celda.appendChild(input);
                }
            }

            input.addEventListener("keydown", handleKeyDown);

            if (!firstInput) {
                firstInput = input;
            }
        }
    });

    if (firstInput) {
        firstInput.focus();
    }

    boton.innerHTML = '<i class="bi bi-floppy"></i>';
} else {
    guardarCambios();
}

function handleKeyDown(event) {
    if (event.key === "Enter") {
        guardarCambios();
    } else if (event.key === "Escape") {
        cancelarCambios();
    }
}

    function guardarCambios() {
        const datosnuevos = [];
        let linea = true;
        let nuevoValor = "";
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector(`input`);
                const select = celda.querySelector('select');
                if (input) {
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        if(index === 2){
                            datosnuevos.push(Number(nuevoValor));
                        }else{
                            datosnuevos.push(nuevoValor);
                        }
                        
                        linea *= true;
                    } else {
                        linea *= false;
                    }
                } else if (select) {
                    nuevoValor = select.value;
                    console.log(nuevoValor);
                    celda.textContent = select.options[select.selectedIndex].text;
                    datosnuevos.push(Number(nuevoValor));

                }
                
            }
        });
        console.error(linea);
        
        if(linea){
            obj_seleccionadoc[names[0]] = datosnuevos[0];
            obj_seleccionadoc[names[1]] = datosnuevos[1];
            obj_seleccionadoc[names[2]] = datosnuevos[2];
     
            // if (obj_seleccionado) {
            //     Object.assign(Lista_Orden_Produccion, obj_seleccionado);
            // }
            console.log(obj_seleccionado);
            console.log(obj_seleccionadoc);
            console.log(areObjectsEqual(obj_seleccionado, obj_seleccionadoc));
            if (!areObjectsEqual(obj_seleccionado, obj_seleccionadoc)) {
                editarOrdenProduccion(id1,obj_seleccionadoc);
            }


            boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
            celdas.forEach(celda => {
                const input = celda.querySelector(`#ediinp${codigo}`);
                if (input) {
                    input.removeEventListener("keydown", handleKeyDown);
                }
            });
        }else{
            cancelarCambios();
        }
    }
   
    function cancelarCambios() {
        
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector('input');
                const select = celda.querySelector('select');
                
                if (input) {
                    celda.innerHTML = originalValues[index];
                } else if (select) {
                    celda.innerHTML = originalValues[index];
                }
            }
        });

        boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
        celdas.forEach(celda => {
            const input = celda.querySelector(`#ediinp${subcodigo}`);
            if (input) {
                input.removeEventListener("keydown", handleKeyDown);
            }
        });
    }

    boton.removeEventListener("click", toggleEditSave);
    boton.addEventListener("click", toggleEditSave);
}

async function sitio() {
    
    app.style.position = 'relative';
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.cursor = 'pointer';
    app.appendChild(overlay);
    const variable = document.createElement('div');
    variable.style.width = '1000px';
    variable.style.height = '580px';

    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.cursor = 'auto';
    variable.style.maxHeight = '680px';
    variable.style.overflowY = 'auto';
    variable.style.display = 'block';
    overlay.appendChild(variable);

    let itemempleado = Lista_empleados.find(obj => Number(obj.id) === Number(Orden_produccion_detalle.empleado_idempleado));
    
   
    let view = `
         <a style="float: right;" class ="cerrar"><i class="bi bi-x-lg fs-5"></i></a>
    <div class="container">
        
        <h5 class="text-center mb-4 fw-bold fs-6">Creación Lote Producción</h5>
        
        <form id="formulario${subcodigo}">
            <input type="hidden" name="verDavid" value="registrarLote">

            <input type="hidden" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" name="empleado_idempleado" value="${uk[0].idusuario}">
            <input type="hidden" name="estado" value="1">
            <div class="row">
                    <div class="col-md-4">
                        <label for="fecha_lote" class="form-label">Fecha registro</label>
                        <input type="date" class="form-control" id="fecha_lote" name="fecha_lote" value="${establecerFechaHoy()}" required>
                    </div>
                    <div class="col-md-4">
                        <label for="hora" class="form-label">Hora registro</label>
                        <input type="time" class="form-control" id="hora" name="hora_lote" required>
                         
                    </div>
                    <div class="col-md-4 mt-4">
                        <button type="button" id="editarHora" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Editar</button>
                    </div>
            </div>
            <div class="row g-3">
                <div class="col-md-4">
                    <label for="empleado" class="form-label">Usuario:</label>
                    <label class="form-control" id="empleado">${uk[0].nombre}</label>
                </div>
            </div>
            <div class="row g-3">
                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha prevista de entrega:</label>
                    <input type="date" class="form-control" id="fecha" name="fecha_entrega" value="${establecerFechaHoy()}" required>
                </div>

                <div class="col-md-4">
                    <label for="hora" class="form-label">Hora prevista de entrega:</label>
                    <input type="time" class="form-control"  name="hora_entrega" required>
                </div>

            </div>
              
            

            <div class="mb-3">
                <label for="nombre_lote" class="form-label">Nombre del Lote</label>
                <input type="text" class="form-control" id="nombre_lote" name="nombre_lote" maxlength="60" value="${generarLoteProduccion()}" required>
            </div>

            <div class="row g-3">
                <div class="col-md-4">
                    <label for="empleado" class="form-label">Usuario solicitante:</label>
                    <label class="form-control" id="empleado">${itemempleado.nombre} ${itemempleado.apellido}</label>
                </div>

                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha solicitud:</label>
                    <label class="form-control" id="fecha">${Orden_produccion_detalle.fecha_orp}</label>
                </div>

                <div class="col-md-4">
                    <div class="row">
                        <div class="col">
                            <label for="hora" class="form-label">Hora solicitud:</label>
                            <label class="form-control" id="hora">${Orden_produccion_detalle.hora_orp}</label>
                        </div>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-success btn-lg" id="registrar${subcodigo}">Crear Lote</button> 
        </form>
        <div id="alerta${subcodigo}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${subcodigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Observaciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${subcodigo}">
              
            </tbody>
        </table>
        
    </div>
    `;
    variable.innerHTML = view;
    overlayy = overlay;
    Listar_detalle_orden_produccion(Orden_produccion_detalle.detalles);
    const forme = document.getElementById(`formulario${subcodigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));
    const horaInput = document.getElementById('hora');
    const editarHoraBtn = document.getElementById('editarHora');
    console.log(horaInput);
    if (horaInput) {
        intervaloId =  setInterval(actualizarHora, 1000);
        
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

   
    variable.addEventListener('click', function(event) {
        //console.log(event.target);
        let aTag = event.target.closest('a.cerrar');

        if (aTag) {
            event.preventDefault();
            cerrarModal();

        }
       
    });
    function cerrarModal() {
        overlay.remove(); 
        Lista_Orden_Produccion = [];
        app.style.removeProperty('position');  
    }
}

function establecerFechaHoy() {
   // const fechaInput = document.getElementById('fecha');
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
    
    //fechaInput.value = currentDate;
    return currentDate;
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

function Listar_productos_select(){
    
    console.log("listo");
    const listar=document.querySelector(`#producto_idproducto${subcodigo}`);
    
    let view="";
        Lista_productos.map(lista=>{
            
            view+=`
                <option value="${lista.id_productos}">${lista.nombre} ${lista.codigo} </option>
            `;
        })
        listar.innerHTML=view;
        console.log(Lista_productos);
}
let Lista_produccion = [
    {},
    {}
]
function generarLoteProduccion() {
    const prefijo = 'Lote_Produccion';
    const now = new Date();
    const boliviaTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - 4 * 60 * 60000); 
    const year = boliviaTime.getUTCFullYear();
    const month = String(boliviaTime.getUTCMonth() + 1).padStart(2, '0'); 
    const day = String(boliviaTime.getUTCDate()).padStart(2, '0'); 
    const currentDate = `${year}-${month}-${day}`;

    const numeroCompra =  Lista_produccion.length + 1;
    const numeroLote = `${prefijo}-${currentDate}-${numeroCompra}`;

    return numeroLote;
}
let Object_detalle = {
    "iddetalle_produccion": 1,
    "cantidad": 50,
    "observaciones": "detalle",
    "orden_produccion_idorden_produccion": 1,
    "producto_idproducto": 16
}
function Agregar_a_lista(e,forme){
    e.preventDefault();
    
    let nuevoObjeto = {};
    const dato=new FormData(forme);
    for (let [key, value] of dato.entries()) {
        if(key === "cantidad"  || key === "producto_idproducto" || key === "observaciones"){
            if(key === "cantidad" || key === "estado" || key === "producto_idproducto"){
                nuevoObjeto[key] = Number(value);  
            }else{
                nuevoObjeto[key] = value;
            }
        }
        
    }
    
    if(nuevoObjeto){
        nuevoObjeto["orden_produccion_idorden_produccion"] = Orden_produccion_detalle.idorden_produccion;
        
        nuevoObjeto["iddetalle_produccion"] = 0;
    }
    console.log(nuevoObjeto);

    if(agregarOrdenProduccion(nuevoObjeto)){
        console.log(Lista_Orden_Produccion);
        Listar_OrdenProduccion();
        forme.reset();
    }
    
        
 }
function Listar_detalle_orden_produccion(detalle){
    detalle.map(lista => {
        Agregar_a_lista_Array(lista);
    })
}
function Agregar_a_lista_Array(Object_detalle){
    
    const nuevoObjeto = {};

    for (const [key, value] of Object.entries(Object_detalle)) {
        // Convert specific fields to numbers
        if (["cantidad", "orden_produccion_idorden_produccion", "producto_idproducto", "iddetalle_produccion"].includes(key)) {
            nuevoObjeto[key] = Number(value);
        } else {
            nuevoObjeto[key] = value;
        }
    }
    console.log(nuevoObjeto);
    if(agregarOrdenProduccion(nuevoObjeto)){
        console.log(Lista_Orden_Produccion);
        Listar_OrdenProduccion();
        return true;
    }
    
    return false; 
 }
function agregarOrdenProduccion(nuevaOrden) {
    let existeProducto = Lista_Orden_Produccion.some(orden => orden.producto_idproducto === nuevaOrden.producto_idproducto);
    if (!existeProducto) {
        Lista_Orden_Produccion.push(nuevaOrden);
        console.log("Producto agregado correctamente.");
        return true;
    } else {
        alert("Este producto ya existe en la lista.");
        return false;
    }
}
function Listar_OrdenProduccion(){
    const tablaListar = document.getElementById(`ListarOrdenProduccion${subcodigo}`);
    let view = "", ind = 1;
    console.log(Lista_Orden_Produccion);
    Lista_Orden_Produccion.map(lista=>{
        let itemproducto = Lista_productos.find(obj => obj.id_productos === lista.producto_idproducto) || {
            "id_productos": 0,
            "nombre": "-",
            "codigo": "-",
        };
        view +=`
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.producto_idproducto},producto_idproducto">${itemproducto.nombre} ${itemproducto.codigo}</td>
                <td data-type="${lista.producto_idproducto},cantidad">${lista.cantidad}</td>
                <td data-type="${lista.producto_idproducto},observaciones">${lista.observaciones}</td>
                
            </tr>
        
        `;
    });
    tablaListar.innerHTML = view;
    const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });
 }
 function edit_Celda_table(e) {
    const target = e.target;
    if (target.tagName.toLowerCase() !== "td" || target.classList.contains("editing")) return;

    const originalValue = target.textContent.trim();
    const [inpId, inpKey, inpKey2] = target.getAttribute("data-type").split(',');
    const objetoSelect = Lista_Orden_Produccion.find(obj => obj.producto_idproducto === Number(inpId));
    if (!objetoSelect) {
        console.error(`Product with id ${inpId} not found`);
        return;
    }
    const confirm = { ...objetoSelect };

    let input;
    const isSelect = ["producto_idproducto"].includes(inpKey);

    if (isSelect) {
        input = createSelectElement(inpKey);
        if (!input) {
            alertas(["info", `No se encontró el elemento con id #${inpKey}${codigo}`]);
            return;
        }
       // input.style.width = "150px";
        input.value = objetoSelect[inpKey];
    } else {
        const inputType = ["cantidad"].includes(inpKey) ? "number" : "text";
        input = document.createElement("input");
        input.type = inputType;
        input.value = originalValue;
        input.className = "form-control";
      //  input.style.width = "150px";
        if (inputType === "number") input.step = "0.01";
    }

    target.classList.add("editing");
    target.innerHTML = '';
    target.appendChild(input);
    input.focus();

    function handleInputChange(newValue) {
        target.classList.remove("editing");
        console.log(newValue);
        const aux = isSelect ? Number(newValue) || confirm[inpKey] : newValue || confirm[inpKey];
        console.log(aux);
        console.log(inpKey);
        console.log(aux);
        objetoSelect[inpKey] = aux;
        target.textContent = isSelect ? input.options[input.selectedIndex].text : newValue;

        if (!areObjectsEqual(objetoSelect, confirm)) {
           Listar_OrdenProduccion();
           console.log(Lista_Orden_Produccion)

        }
    }

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
           
            handleInputChange(this.value);
        } else if (event.key === "Escape") {
            target.classList.remove("editing");
            target.textContent = originalValue;
        }
    });

    input.addEventListener("blur", function() {
        target.classList.remove("editing");
        target.textContent = originalValue;
    });
}
function eliminarOrdenProduccion(idproducto) {
    console.log(Lista_Orden_Produccion);
    console.log(idproducto);
    if (confirm("Desea eliminar...?")) {
        Lista_Orden_Produccion = Lista_Orden_Produccion.filter(orden => orden.producto_idproducto !== Number(idproducto));
        Listar_OrdenProduccion();
    }
} 
function editarOrdenProduccion(idproducto, nuevosDatos) {
    console.log(idproducto);
    console.log(nuevosDatos);
    const index = Lista_Orden_Produccion.findIndex(orden => orden.producto_idproducto === Number(idproducto));
    console.log(index);
    if (index !== -1) {
        Lista_Orden_Produccion[index] = { ...Lista_Orden_Produccion[index], ...nuevosDatos };
    } else {
        console.log('Orden no encontrada');
    }
    Listar_OrdenProduccion();
}

function createSelectElement(inpKey) {
    const elementId = `${inpKey}${subcodigo}`;
    console.log(elementId);
    const innerHTMLContent = document.querySelector(`#${elementId}`).innerHTML;
    if (!innerHTMLContent) return null;
    
    const select = document.createElement('select');
    select.className = 'form-select';
    select.name = inpKey;
    select.innerHTML = innerHTMLContent;
    return select;
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
async function sendform(e, form) {
    e.preventDefault();

    const dato = new FormData(form);

    for (let [key, value] of dato.entries()) {
        console.log(key, value);
    }
    fetch(`${URL_APIP}api/`, {
        method: 'POST',
        headers: {
            'Usar-Registro-David': 'true'
        },
        body: dato
    })
    .then(response => response.text()) // Cambia .json() a .text() temporalmente para depurar
    .then(data => {
        try {
            const jsonData = JSON.parse(data); // Intenta convertir a JSON si el texto no está vacío
            console.log('Success:', jsonData);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            console.log('Raw response:', data); // Muestra la respuesta sin procesar para entender el fallo
        }
    })
    .catch(error => console.error('Fetch error:', error));
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