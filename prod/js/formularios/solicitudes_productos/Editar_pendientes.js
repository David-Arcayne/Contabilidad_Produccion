import { URL_APIP } from "../../../../lib/services.js";
import { Orden_produccion_solic } from "../Almacen_producto/orden_produccion.js";
import * as listarFunctions from "../funciones/listar.js";

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

export async function modal_editar_orden_produccion(code, permisos, refrescar, codigo, id) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    id_orden_produccion = id;
    //Orden_produccion_detalle = await listarFunctions.mostrar_orden_produccion(id);
   
    console.log(Orden_produccion_detalle);
    console.log(Lista_empleados);
    //console.log(Lista_Orden_Produccion);
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
    await listar();
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
        
        <h5 class="text-center mb-4 fw-bold fs-6">Orden de Producción</h5>

        <form id="formulario${subcodigo}">
            <input type="hidden" name="estado" value="0">


            <div class="row g-3">
                 <div class="row g-3">
                <div class="col-md-4">
                    <label for="empleado" class="form-label">Usuario solicitante:</label>
                    <input type="text" class="form-control" id="empleado" name="empleado" value = "${itemempleado.nombre} ${itemempleado.apellido}" readonly>
                </div>

                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha solicitud:</label>
                    <input type="date" class="form-control" id="fecha" name="fecha" value = "${Orden_produccion_detalle.fecha_orp}">
                </div>

                <div class="col-md-4">
                    <div class="row">
                        <div class = "col">
                            <label for="hora" class="form-label">Hora solicitud:</label>
                            <input type="text" class="form-control" id="hora" name="hora" value="${Orden_produccion_detalle.hora_orp}">
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <label for="producto" class="form-label">Producto:</label>
                    <select id="producto_idproducto${subcodigo}" name="producto_idproducto" class="form-select">
                        <option value="1">Producto A</option>
                        <option value="2">Producto B</option>
                    </select>
                </div>

                <div class="col-md-4">
                    <label for="cantidad" class="form-label">Cantidad:</label>
                    <input type="number" class="form-control" id="cantidad" name="cantidad" required>
                </div>

                <div class="col-md-12">
                    <label for="observaciones" class="form-label">Observaciones:</label>
                    <textarea class="form-control" id="observaciones" name="observaciones" required></textarea>
                </div>

                <div class="col-md-12 mt-3 d-flex justify-content-between">
                    <button type="button" class="btn btn-primary btn-sm" id = "limpiar${subcodigo}">Limpiar</button>
                    <button type="submit" class="btn btn-success btn-lg"><i class="bi bi-plus-lg"></i></button>
                    
                </div>

            </div>
        </form>
        <div id="alerta${subcodigo}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${subcodigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${subcodigo}">
              
            </tbody>
        </table>
        <div class="col-md-12 mt-3 d-flex justify-content-between">
            <button type="button" class="btn btn-primary btn-sm" id="cancelar${subcodigo}">Cancelar</button>
            <button type="button" class="btn btn-success btn-lg" id="registrar${subcodigo}">Registrar</button>        
        </div>
    </div>
    `;
    variable.innerHTML = view;
    overlayy = overlay;
   
    Listar_productos_select();
    Listar_detalle_orden_produccion(Orden_produccion_detalle.detalles);
        

        
        

        const forme = document.querySelector(`#formulario${subcodigo}`);
        forme.addEventListener("submit", (e) => Agregar_a_lista(e, forme));
        const table = document.getElementById(`editableTable${subcodigo}`);
        table.addEventListener("dblclick",(e) => edit_Celda_table(e));
        const limpiar = document.querySelector(`#limpiar${subcodigo}`);
        limpiar.addEventListener('click',() => {
                
            forme.reset();
        });

        const btncancelar = document.querySelector(`#cancelar${subcodigo}`);
        btncancelar.addEventListener('click', () => {
            forme.reset();
            Lista_Orden_Produccion =[];
            Listar_OrdenProduccion();
        })
        const btnregistrar = document.querySelector(`#registrar${subcodigo}`);
        btnregistrar.addEventListener('click', (e) => {
        
            if (Lista_Orden_Produccion && Lista_Orden_Produccion.length > 0) {
                console.log(Lista_Orden_Produccion);
                console.log(Orden_produccion_detalle);
                let nueva_orden_produccion = {
                    ...Orden_produccion_detalle,
                    detalles: [...Lista_Orden_Produccion],
                    verDavid: "Editar_orden_produccion_lista_completa" // Reemplazar la lista de detalles con una copia de nuevos_detalles
                };
                console.log(nueva_orden_produccion);
                fetch(`${URL_APIP}api/`, {
                    method: 'POST', // Método HTTP
                    headers: {
                        'Usar-Registro-David': 'true',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(nueva_orden_produccion) // Convertir el objeto JS a JSON antes de enviarlo
                })
                .then(response => response.json()) // Procesar la respuesta en formato JSON
                .then(data => {
                     alertas(data);

                   
                })
                .catch(error => console.error('Error:', error));
            }else{
                alert("Lista vacia");
            }
            
            
        })
     
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
                <td>
                    <a data-id="editar,${lista.producto_idproducto}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar,${lista.producto_idproducto}" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
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
function alertas(data) {
    console.log(data);
    // Definir las variables al principio
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "success") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;
        
        // Resetear el formulario si existe
        let formulario = document.querySelector(`#formulario${subcodigo}`);
        if (formulario) {
            formulario.reset();
        }
        
        // if(data[2]==="Editar_orden_produccion_lista_completa"){
            
        //     sitio();
            
        //     // overlayy.remove(); 
        //     // Lista_Orden_Produccion = [];
        //     // app.style.removeProperty('position');  
        // }
        
    } else {
        if(data[0] == "danger"){

            
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
    let divalert = document.querySelector(`#alerta${subcodigo}`);
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