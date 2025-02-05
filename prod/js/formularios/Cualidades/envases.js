import { URL_APIP } from "../../../../lib/services.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let List_Envases =[];
let obt_envases_aux = {
    "id" : 0,
    "nombre" : "",
    "detalle" : ""
};

const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "envases";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const subcodigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + subcodigo;
}

export function envasesconfig(code, permisos, refrescar,codigo) {
    app=document.querySelector(`#principal${codigo}`);
    
    sitio();    
    
}

function menu(event){
    console.log("estoy dentro de menuEnvases");
    console.log(event);
    const dataid = event.currentTarget.getAttribute('data-id');
    // empresaid = event.currentTarget.getAttribute('data-id');
// Supongamos que la cadena completa es "editarEnvase,2,8f14e45fceea167a5a36dedd4bea2543"
// var cadenaCompleta = "editarEnvase,2,8f14e45fceea167a5a36dedd4bea2543";

    const [funcion, id1, ids] = dataid.split(',');
    // console.log(ids);
 
    switch (funcion) {
        case "eliminarenvase": //este valor viene del icono eliminar, basurero
            eliminarenvase(id1,ids);
            break;
        case "editarEnvase"://este valor viene del icono editar, lapicito
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
    const permisos = [1, 2];
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const objEnvases = List_Envases.find(obj => obj.id === Number(id1));
    const objEnvasesc = {...objEnvases};


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
                        linea *=true;
                    }else{
                        linea *=false;
                    }
                }
            }
        });
        if(linea){
            objEnvases['nombre'] = datosnuevos[0];
            objEnvases['detalle'] = datosnuevos[1];
            if (objEnvases) {
                Object.assign(List_Envases, objEnvases);
            }
    
            if (!areObjectsEqual(objEnvases, objEnvasesc)) {
                const formData = new FormData();
                formData.append('ver', "editarEnvase");
                formData.append('empresa', id2);
                Object.entries(objEnvases).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                for (let [clave, valor] of formData.entries()) {
                    console.log(clave, valor);
                } 
                obt_envases_aux = { ...obt_envases_aux, ...objEnvasesc };
                sendformData(event, formData);
            }
    
            console.log(List_Envases);
    
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
function eliminarenvase(id,ids){
    

    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminarenvase/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            obt_envases_aux ={...List_Envases.find(obj => obj.id === Number(id))};

            alertas(data);

            console.log(obt_envases_aux);
        })
    }
   
}

function sitio(){
    let view=`
        <div class="container">
        <h2 class="text-center">Envases</h2>
        <form id="formulario${subcodigo}">
            <input type="hidden" name="ver" value="registroEnvase">
            <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">

            <div class="row">
                <div class="col-md-6">
                    <label for="nombre">Nombre envase: </label>
                    <input type="text" class="form-control" id="nombre" placeholder="Ejemplo: saco" name="nombre" required>
                </div>
                <div class="col-md-6">
                    <label for="detalle">Detalle: </label>
                    <input type="text" class="form-control" id="detalle" placeholder="" name="detalle" required>
                </div>
            </div>
            

            <button type="submit" class="btn btn-outline-success mr-1 mt-4" >Guardar</button>
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
                        <th scope="col">N°</th>
                        <th scope="col">Envase</th>
                        <th scope="col">Detalle</th>
                        <th scope="col">Funciones</th>
                    </tr>
                </thead>
                <tbody id="listaenvases">
                
                </tbody>
            </table>
        </div>
    </div>
    `;
    app.innerHTML=view;

    listaenvases();
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
    table.addEventListener("dblclick",(e) => edit_Celda_table(e));
    const input = document.getElementById(`filtro${subcodigo}`);
    input.addEventListener("keyup",(e)=> filtrar_table(e,input));
    const toggleButton = document.getElementById(`toggleButton${subcodigo}`);
    toggleButton.addEventListener("click", (e) => mostrarFormulario(e,toggleButton));
}
function mostrarFormulario(e,toggleButton){
    const myForm = document.querySelector(`#formulario${subcodigo}`);

    if (myForm.style.display === "none" || myForm.style.height === "0px") {
        myForm.style.display = "block";
        setTimeout(() => {
            myForm.style.height = myForm.scrollHeight + "px";
            myForm.style.opacity = 1;
        }, 10);  // Un pequeño retraso para asegurar que la transición ocurra
        toggleButton.innerHTML = '<i class="bi bi-dash-lg"></i>';
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
            let envase_obj = List_Envases.find(obj => obj.id === Number(inpId));
            const confirm ={...envase_obj};

            console.log(confirm);
            target.classList.add("editing");
            target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

            const input = target.querySelector("input");
            input.focus();


            input.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    
                    target.classList.remove("editing");

                    
                    target.textContent = input.value || originalValue;
                    Object.entries(envase_obj).forEach(([key, value]) => {
                        if(key === inpKey){
                            envase_obj[key] = target.textContent;
                        }
                    });
                    console.log(List_Envases);
                    if (envase_obj) {
                        Object.assign(List_Envases, envase_obj);
                    }
                    console.log(List_Envases);
                    console.log(areObjectsEqual(envase_obj,confirm));
                    if(!areObjectsEqual(envase_obj,confirm)){
                        const formData = new FormData();
                        formData.append('ver', "editarEnvase");
                        formData.append('empresa', id2);
                        Object.entries(envase_obj).forEach(([key, value]) => {
                            formData.append(key,value);
                        });
                        for (let [clave, valor] of formData.entries()) {
                            console.log(clave, valor);
                        }     
                        obt_envases_aux = { ...obt_envases_aux, ...confirm };

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



function listaenvases() {
    const envase = document.querySelector("#listaenvases");

    fetch(`${URL_APIP}api/listaenvases/${uk[0].empresa.idempresa}`)
        .then(res => res.json())
        .then(data => {
            List_Envases.length =0;
            List_Envases = data;
            console.log(data);
            listaenvasesArray();
        })
}
function listaenvasesArray(){
    const div=document.querySelector("#listaenvases");
    let resu="", indice=1;
    List_Envases.map(lista=>{
        resu+=`
        <tr>
        <td>${indice++}</td>
            <td data-type="${lista.id},nombre,${uk[0].empresa.idempresa}">${lista.nombre}</td>
            <td data-type="${lista.id},detalle,${uk[0].empresa.idempresa}">${lista.detalle}</td>
            <td>
                <a data-id="editarEnvase,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                    <i class="bi bi-pencil-square"></i>
                </a>    
                <a data-id="eliminarenvase,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger">
                    <i class="bi bi-trash"></i>
                </a>                          
            </td>
        </tr>`;
    })
    div.innerHTML=resu;

    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });
}

function sendformData(event, formData) {
    event.preventDefault();

    fetch(`${URL_APIP}api/`, { // Reemplaza esto con la URL de tu servidor
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
    e.preventDefault();
    console.log(form);
    const dato=new FormData(form);
    fetch(`${URL_APIP}api/`,{
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

        // Resetear el formulario si existe
        let formulario = document.querySelector(`#formulario${subcodigo}`);
        if (formulario) {
            formulario.reset();
        }
        if(data[2]==="registroEnvases"){
            listaenvases();

        }
        if(data[2]==="eliminarenvase"){
            console.log(List_Envases);
            console.log(obt_envases_aux);

            List_Envases = List_Envases.filter(obj => obj.id !== Number(obt_envases_aux['id']));
            console.log(List_Envases);

            listaenvasesArray();
            obt_envases_aux = { ...{ id: 0, nombre: "", detalle: "" } };

        }
        if(data[2]==="editar_envase"){
            obt_envases_aux = { ...{ id: 0, nombre: "", detalle: "" } };

        }

        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="editar_envase"){
                const obj = List_Envases.find(ob => ob.id === obt_envases_aux['id']);

                console.log(obt_envases_aux);

                console.log(obj);
                if (obt_envases_aux) {
                    Object.assign(obj, obt_envases_aux);
                }
                console.log(obt_envases_aux);

                console.log(obj);
                console.log(List_Envases);
                listaenvasesArray();
                obt_envases_aux = { ...{ id: 0, nombre: "", detalle: "" } };

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