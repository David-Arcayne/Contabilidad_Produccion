import { URL_APIP } from "../../../../lib/services.js";


let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let List_seccion = [];
let obt_seccion_aux = {
    "id" : 0,
    "nombre_seccion" : "",
    "codigo_seccion" : "",
    "ubicacion":""
};

const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "seccion";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const subcodigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + subcodigo;
}
export function seccionconfig(code, permisos, refrescar,codigo) {
    app=document.querySelector(`#principal${codigo}`);
    
    sitio();    
    
}

function menudivisas(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    switch (funcion) {
        case "eliminarseccion":
            

            eliminarseccion(id1,id2);
            break;
        case "editarseccion":
            toggleEditSave(event);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}
function toggleEditSave(event) {
    const permisos = [1, 2, 3];
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const objseccion = List_seccion.find(obj => obj.id === Number(id1));
    const objseccionc = {...objseccion};

    console.log(funcion, id1, id2);

    if (boton.innerHTML.includes('bi-pencil-square')) {
        // Modo Editar
        let firstInput;
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const valorOriginal = celda.textContent.trim();
                celda.innerHTML = `<input id="ediinp${subcodigo}" class="form-control" type="text" value="${valorOriginal}">`;

                // Añadir evento de teclado
                const input = celda.querySelector(`#ediinp${subcodigo}`);
                input.addEventListener("keydown", handleKeyDown);

                // Establecer el primer input para enfocar
                if (!firstInput) {
                    firstInput = input;
                }
            }
        });

        // Enfocar el primer input
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
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector(`#ediinp${subcodigo}`);
                if (input) {
                    const nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        datosnuevos.push(nuevoValor);
                        celda.textContent = nuevoValor;
                        linea *= true;
                    }else{
                        linea *= false;
                    }
                }
            }
        });
        console.log(linea);

        if(linea){
            objseccion['nombre_seccion'] = datosnuevos[0];
            objseccion['subcodigo_seccion'] = datosnuevos[1];
            objseccion['ubicacion'] = datosnuevos[2];
            if (objseccion) {
                Object.assign(List_seccion, objseccion);
            }

            if (!areObjectsEqual(objseccion, objseccionc)) {
                const formData = new FormData();
                formData.append('ver', "editar_seccion");
                formData.append('id', id1);
                formData.append('empresa', id2);
                Object.entries(objseccion).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_seccion_aux = { ...obt_seccion_aux, ...objseccionc };
                sendformData(event, formData);
            }

            console.log(List_seccion);

            boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
            celdas.forEach(celda => {
                const input = celda.querySelector(`#ediinp${subcodigo}`);
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
                const input = celda.querySelector(`#ediinp${subcodigo}`);
                if (input) {
                    const valorOriginal = input.getAttribute('value');
                    celda.textContent = valorOriginal;
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




function eliminarseccion(id,ids){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminar_seccion/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            obt_seccion_aux ={...List_seccion.find(obj => obj.id === Number(id))};

            alertas(data);

        })
    }
   
}




function sitio(){
    let view=`
        <div class="container mt-5">
            <h2 class="text-center">Sección</h2>

            <form id="formulario${subcodigo}" >

                <input type="hidden" name="ver" value="registro_seccion">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="nombre_seccion" class="form-label">Nombre sección:</label>
                        <input type="text" class="form-control" id="nombre_seccion" name="nombre_seccion" required>
                    </div>
                    <div class="col-md-4">
                        <label for="subcodigo_seccion" class="form-label">Código sección:</label>
                        <input type="text" class="form-control" id="subcodigo_seccion" name="subcodigo_seccion" required>
                    </div>
                    <div class="col-md-4">
                        <label for="ubicacion" class="form-label">Ubicación:</label>
                        <input type="text" class="form-control" id="ubicacion" name="ubicacion" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="guardarBtn${subcodigo}" aria-label="Registrar">Registrar</button>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn${subcodigo}" aria-label="Cancelar">Cancelar</button>
            </form>
            <button id="toggleButton${subcodigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>

            <div id="alerta${subcodigo}" class="mt-4"></div>

            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${subcodigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
                
            </div>
            <div class="scrollable-table mt-4">

                <table class="table table-hover" id = "editableTable${subcodigo}">
                    <thead>
                        <tr class="table-dark">
                            <th>N°</th>
                            <th>Sección</th>
                            <th>Código sección</th>
                            <th>Ubicación</th>
                            <th>Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listaseccion">
                        
                    </tbody>
                </table>
            </div>

        </div>
        
    `;
    app.innerHTML=view;

    listaseccion();
    const forme = document.querySelector(`#formulario${subcodigo}`);
    forme.style.display = "none";
    forme.style.opacity = 0;
    forme.style.height = "0";
    forme.style.overflow = "hidden";
    forme.style.transition = "height 0.5s ease, opacity 0.5s ease";
    forme.addEventListener("submit", (e) => sendform(e, forme));
    const cancelarBtn = document.getElementById(`cancelarBtn${subcodigo}`);
    cancelarBtn.addEventListener('click', () => {
        forme.reset();
    });
    const table = document.getElementById(`editableTable${subcodigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e,table));
    const input = document.getElementById(`filtro${subcodigo}`);
    input.addEventListener("keyup",(e)=> filtrar_table(e,input));
    const toggleButton = document.getElementById(`toggleButton${subcodigo}`);
    toggleButton.addEventListener("click", (e) => mostrarFormulario(e,toggleButton));
    // let searchInput = document.getElementById("buscarclientes");
// searchInput.addEventListener("input", buscarclientes);
}
function mostrarFormulario(e,toggleButton){
    const myForm = document.querySelector(`#formulario${subcodigo}`);

    if (myForm.style.display === "none" || myForm.style.height === "0px") {
        myForm.style.display = "block";
        setTimeout(() => {
            myForm.style.height = myForm.scrollHeight + "px";
            myForm.style.opacity = 1;
        }, 10);  // Un pequeño retraso para asegurar que la transición ocurra
        toggleButton.innerHTML = '<i class="bi bi-dash-lg danger"></i>';
    } else {
        myForm.style.height = "0";
        myForm.style.opacity = 0;
        setTimeout(() => {
            myForm.style.display = "none";
        }, 500);  // Esperar a que termine la transición
        toggleButton.innerHTML = '<i class="bi bi-plus"></i>';
    }

}
function filtrar_table(e,input){
    const table = document.getElementById(`editableTable${subcodigo}`);
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = tbody.getElementsByTagName('tr');
    input.addEventListener('keyup', function() {
        const filter = input.value.toLowerCase();

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let cells = row.getElementsByTagName('td');
            let rowText = '';

            for (let j = 0; j < cells.length; j++) {
                rowText += cells[j].textContent.toLowerCase() + ' ';
            }

            if (rowText.includes(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
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
function edit_Celda_table(e){
    const target = e.target;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            const [inpId,inpKey,id2] = dataType.split(',');            
            let seccion_obj = List_seccion.find(obj => obj.id === Number(inpId));
            const confirm ={...List_seccion.find(obj => obj.id === Number(inpId))};

            console.log(confirm);
            target.classList.add("editing");
            target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

            const input = target.querySelector("input");
            input.focus();


            input.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    
                    target.classList.remove("editing");

                    
                    target.textContent = input.value || originalValue;
                    Object.entries(seccion_obj).forEach(([key, value]) => {
                        if(key === inpKey){
                            seccion_obj[key] = target.textContent;
                        }
                    });
                    if (seccion_obj) {
                        Object.assign(List_seccion, seccion_obj);
                    }
                    console.log(List_seccion);
                    console.log(areObjectsEqual(seccion_obj,confirm));
                    if(!areObjectsEqual(seccion_obj,confirm)){
                        const formData = new FormData();
                        formData.append('ver', "editar_seccion");
                        formData.append('id', inpId);
                        formData.append('empresa', id2);
                        Object.entries(seccion_obj).forEach(([key, value]) => {
                            formData.append(key,value);
                        });
                        obt_seccion_aux = { ...obt_seccion_aux, ...confirm };

                        sendformData(e,formData);
                    }
                    
                   
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
}
function listaseccion(){
    
    fetch(`${URL_APIP}api/listarseccion/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        List_seccion.length =0;
        List_seccion = data;
        listaseccionArray();
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        
        
    })
}
function listaseccionArray(){
    const listar=document.querySelector("#listaseccion");
    let view="",ind=1;
        List_seccion.map(lista=>{
            view+=`
             <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.id},nombre_seccion,${uk[0].empresa.idempresa}">${lista.nombre_seccion}</td>
                <td data-type="${lista.id},codigo_seccion,${uk[0].empresa.idempresa}">${lista.codigo_seccion}</td>
                <td data-type="${lista.id},ubicacion,${uk[0].empresa.idempresa}">${lista.ubicacion}</td>

                <td>
                    <a data-id="editarseccion,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminarseccion,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
            </tr>
            `;
        })
        listar.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menudivisas);
        });
}



function sendform(e,form){
        e.preventDefault();
        console.log(form);
        const dato=new FormData(form);
        console.log(dato);

        fetch(`${URL_APIP}api/`,{
            method:"POST",
            body:dato
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            alertas(data);
        })
    
}
function sendformData(event, formData) {
    event.preventDefault();
    fetch(`${URL_APIP}api/`, { 
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

function alertas(data) {
    console.log(data);
    // Definir las variables al principio
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;

        // Resetear el formulario si existe
        let formulario = document.querySelector(`#formulario${subcodigo}`);
        if (formulario) {
            formulario.reset();
        }
        if(data[2]==="registro_seccion"){
            listaseccion();

        }
        if(data[2]==="eliminar_seccion"){
            List_seccion = List_seccion.filter(obj => obj.id !== Number(obt_seccion_aux['id']));
            listaseccionArray();
            obt_seccion_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        if(data[2]==="editar_seccion"){
            obt_seccion_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="editar_seccion"){
                const obj = List_seccion.find(ob => ob.id === obt_seccion_aux['id']);

                console.log(obt_seccion_aux);

                console.log(obj);
                if (obt_seccion_aux) {
                    Object.assign(obj, obt_seccion_aux);
                }
                console.log(obt_seccion_aux);

                console.log(obj);
                console.log(List_seccion);
                listaseccionArray();
                obt_seccion_aux = { ...{ id: 0, nombre: "", sigla: "" } };

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
