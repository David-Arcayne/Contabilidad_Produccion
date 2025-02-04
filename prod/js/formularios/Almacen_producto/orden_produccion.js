import { URL_APIP } from "../../../../lib/services.js";


let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let intervaloId;
let isEditing = false;


let Lista_Orden_Produccion =[];
let Lista_productos =[];
let obt_ordenProd_aux = {
    "estado": 0,
    "empresa" :'',
    "idempleado" :'',
    "empleado" :'',
    "fecha" :'',
    "hora" : '',
    "producto_idproducto": 0,
    "cantidad" : -1,
    "observaciones": ''};
export function Orden_produccion_solic(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
    
}
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "orden_produccion";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
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
            sitio();
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
                    input.id = `ediinp${codigo}`;
                    input.className = "form-control";
                    input.type = "number";
                    input.value = valorOriginal;
                    celda.innerHTML = '';
                    celda.appendChild(input);
                }else{
                    input = document.createElement('input');
                    input.id = `ediinp${codigo}`;
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
            const input = celda.querySelector(`#ediinp${codigo}`);
            if (input) {
                input.removeEventListener("keydown", handleKeyDown);
            }
        });
    }

    boton.removeEventListener("click", toggleEditSave);
    boton.addEventListener("click", toggleEditSave);
}

function sitio(){
    
     let view = `
    <div class="container">
        
        <h5 class="text-center mb-4 fw-bold fs-6">Orden de Producción</h5>

        <form id="formulario${codigo}">
            <input type="hidden" name="estado" value="0">
            <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" name="idempleado" value="${uk[0].idusuario}">

            <div class="row g-3">
                 <div class="row g-3">
                <div class="col-md-4">
                    <label for="empleado" class="form-label">Usuario:</label>
                    <input type="text" class="form-control" id="empleado" name="empleado" value = "${uk[0].nombre}" readonly>
                </div>

                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha:</label>
                    <input type="date" class="form-control" id="fecha" name="fecha">
                </div>

                <div class="col-md-4">
                    <div class="row">
                        <div class = "col">
                            <label for="hora" class="form-label">Hora solicitud:</label>
                            <input type="text" class="form-control" id="hora" name="hora">
                        </div>
                        <div class="col mt-4">
                            <button type="button" id="editarHora" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Editar</button>
                        </div>
                        
                        

                    </div>
                </div>

                <div class="col-md-4">
                    <label for="producto" class="form-label">Producto:</label>
                    <select id="producto_idproducto${codigo}" name="producto_idproducto" class="form-select">
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
                    <button type="button" class="btn btn-primary btn-sm" id = "limpiar${codigo}">Limpiar</button>
                    <button type="submit" class="btn btn-success btn-lg"><i class="bi bi-plus-lg"></i></button>
                    
                </div>

            </div>
        </form>
        <div id="alerta${codigo}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${codigo}">
              
            </tbody>
        </table>
        <div class="col-md-12 mt-3 d-flex justify-content-between">
                    <button type="button" class="btn btn-primary btn-sm" id="cancelar${codigo}">Cancelar</button>
                    <button type="button" class="btn btn-success btn-lg" id="registrar${codigo}">Registrar</button>
                    
        </div>
    </div>`;
     app.innerHTML=view;
 
     select_lista_productos()
     .then(()=>{
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
                editarHoraBtn.textContent = 'Editar hora';
            }
        });

        
        

        const forme = document.querySelector(`#formulario${codigo}`);
        forme.addEventListener("submit", (e) => Agregar_a_lista(e, forme));
        const table = document.getElementById(`editableTable${codigo}`);
        table.addEventListener("dblclick",(e) => edit_Celda_table(e));
        const limpiar = document.querySelector(`#limpiar${codigo}`);
        limpiar.addEventListener('click',() => {
                
            forme.reset();
            establecerFechaHoy();
        });

        const btncancelar = document.querySelector(`#cancelar${codigo}`);
        btncancelar.addEventListener('click', () => {
            forme.reset();
            Lista_Orden_Produccion =[];
            Listar_OrdenProduccion();
            establecerFechaHoy();
        })
        const btnregistrar = document.querySelector(`#registrar${codigo}`);
        btnregistrar.addEventListener('click', (e) => {
        
            if (Lista_Orden_Produccion && Lista_Orden_Produccion.length > 0) {
                const dato = new FormData(forme);
                dato.append('ver', "registrar_OrdenProduccion");
                for (let [key, value] of dato.entries()) {
                    console.log(key, value);
                }
                fetch(`${URL_APIP}/api/`,{
                    method:"POST",
                    body:dato
                })
                .then(res=>res.json())
                .then(data=>{
                    if(data[0] === "ok"){
                        console.log(data[3]);
                        registrar_detalleOrdenProduccion(e,data[3]);
                    }
                    alertas(data);


                })
            }else{
                alert("Lista vacia");
            }
            
            
        })
     })
     

     
 }
 function registrar_detalleOrdenProduccion(event,id_OrdenProduccion){
   
        Lista_Orden_Produccion.forEach(item => {
            const formData = new FormData();
            formData.append('ver', 'registrar_detalleOrdenProduccion');
            
            formData.append(`cantidad`, item.cantidad);
            formData.append('observaciones', item.observaciones);
            formData.append('orden_produccion_idorden_produccion',id_OrdenProduccion);
            formData.append('producto_idproducto',item.producto_idproducto)
    
    
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            fetch(`${URL_APIP}/api/`, { 
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                
            })
        });
        sitio(); 
    
 }
 function sendformData(event, formData) {
    event.preventDefault();
    fetch(`${URL_APIP}/api/`, { 
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
 function select_lista_productos(){
    
        console.log("listo");
        const listar=document.querySelector(`#producto_idproducto${codigo}`);
        return fetch(`${URL_APIP}/api/listar_Productos_OP/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            Lista_productos.length = 0;
            Lista_productos = data;

            let view="";
            data.map(lista=>{
                
                view+=`
                    <option value="${lista.id_productos}">${lista.nombre} ${lista.codigo} </option>
                `;
            })
            listar.innerHTML=view;
            console.log(Lista_productos);


            
        })
    

    

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
function createSelectElement(inpKey) {
    const elementId = `${inpKey}${codigo}`;
    console.log(elementId);
    const innerHTMLContent = document.querySelector(`#${elementId}`).innerHTML;
    if (!innerHTMLContent) return null;
    
    const select = document.createElement('select');
    select.className = 'form-select';
    select.name = inpKey;
    select.innerHTML = innerHTMLContent;
    return select;
}
 function Agregar_a_lista(e,forme){
    e.preventDefault();
    
    let nuevoObjeto = {};
    const dato=new FormData(forme);
    for (let [key, value] of dato.entries()) {
        if(key === "cantidad" || key === "estado" || key === "producto_idproducto"){
            nuevoObjeto[key] = Number(value);  
        }else{
            nuevoObjeto[key] = value;
        }
    }
    if(agregarOrdenProduccion(nuevoObjeto)){
        console.log(Lista_Orden_Produccion);
        Listar_OrdenProduccion();
        forme.reset();
        establecerFechaHoy();
    }
    
        
 }
 function Listar_OrdenProduccion(){
    const tablaListar = document.getElementById(`ListarOrdenProduccion${codigo}`);
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
function establecerFechaHoy() {
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); 
    const dia = hoy.getDate().toString().padStart(2, '0'); 

    const fechaFormateada = `${anio}-${mes}-${dia}`;
    
    fechaInput.value = fechaFormateada;
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