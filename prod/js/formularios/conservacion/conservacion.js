import { agrupar_conf } from "./agrupar_cons.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);


let app="";
let cod_producto;
let productos = [];


let List_Grupo = [];

let obt_grupo_aux = {
    "id" : 0,
    "nombre" : "",
    "detalle" : ""
};
export function conservacion_config(code, List_Producto) {
    app=document.querySelector(`#content-area${code}`);
    cod_producto = code;
    productos = List_Producto;
    sitio();    
    
}

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "conservacion";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    switch (funcion) {
        case "eliminar_grupo":
            

            eliminar_grupo(id1,id2);
            break;
        case "editar_grupo":
            toggleEditSave(event);
            break;
        case "agregar_productos":
            agregar_productos(id1);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}
function agregar_productos(id){
    const ObjetoSelect = List_Grupo.find(obj => obj.id === Number(id));

    let containerOpen = document.getElementById(`Agrupar_grupos`);
    containerOpen.style.display = 'block';
    let containerClosed = document.getElementById(`principal_conservacion`);
    containerClosed.style.display = 'none';
    agrupar_conf(ObjetoSelect,productos);
}
function toggleEditSave(event) {
    const permisos = [1, 2];
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const ObjetoSelect = List_Grupo.find(obj => obj.id === Number(id1));
    const ObjetoSelectc = {...List_Grupo.find(obj => obj.id === Number(id1))};

    console.log(funcion, id1, id2);

    if (boton.innerHTML.includes('bi-pencil-square')) {
        // Modo Editar
        let firstInput;
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const valorOriginal = celda.textContent.trim();
                celda.innerHTML = `<input id="ediinp${codigo}" class="form-control" type="text" value="${valorOriginal}">`;

                // Añadir evento de teclado
                const input = celda.querySelector(`#ediinp${codigo}`);
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
                const input = celda.querySelector(`#ediinp${codigo}`);
                if (input) {
                    const nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        datosnuevos.push(nuevoValor);
                        celda.textContent = nuevoValor;
                        linea *= true;
                    }else{
                        linea *=false;
                    }
                }
            }
        });
        console.log(linea);

        if(linea){
            ObjetoSelect['nombre'] = datosnuevos[0];
            ObjetoSelect['detalle'] = datosnuevos[1];
            if (ObjetoSelect) {
                Object.assign(List_Grupo, ObjetoSelect);
            }

            if (!areObjectsEqual(ObjetoSelect, ObjetoSelectc)) {
                const formData = new FormData();
                formData.append('ver', "editar_grupo");
                formData.append('id', id1);
                formData.append('empresa', id2);
                Object.entries(ObjetoSelect).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_grupo_aux = { ...obt_grupo_aux, ...ObjetoSelectc };
                sendformData(event, formData);
            }

            console.log(List_Grupo);

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
                const input = celda.querySelector(`#ediinp${codigo}`);
                if (input) {
                    const valorOriginal = input.getAttribute('value');
                    celda.textContent = valorOriginal;
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

function eliminar_grupo(id,ids){
    if(confirm("Desea Eliminar..?")){
        fetch(`./api/eliminar_grupo/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            obt_grupo_aux ={...List_Grupo.find(obj => obj.id === Number(id))};

            alertas(data);
            console.log(obt_grupo_aux);

        })
    }
   
}



function sitio(){
    let view=`
        <div class="container" id="principal_conservacion">
            <h5 class="text-center mb-4 fw-bold fs-6" >Grupos</h5>
            <form id="formulario_conservacion${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                <input type="hidden" name="ver" value="registroGrupo">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                <div class="row">
                    <div class="col-md-6">
                        <label for="nombre">Nombre grupo</label>
                        <input type="text" class="form-control" id="nombre" placeholder="" name="nombre" required>
                    </div>
                    <div class="col-md-6">
                        <label for="detalle">Detalle</label>
                        <input type="text" class="form-control" id="detalle" placeholder="" name="detalle" required>
                    </div>
                </div>       
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="agre" >Guardar</button>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn${codigo}" aria-label="Cancelar">Cancelar</button>              
            </form>
            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>

            <div id="alerta${codigo}" class="mt-4"></div>
            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
                
            </div>
            <div class="scrollable-table mt-4">

                <table class="table table-hover" id = "editableTable${codigo}">
                    <thead  >
                        <tr class="table-dark">
                            <th scope="col">N°</th>
                            <th scope="col">Grupo</th>
                            <th scope="col">Detalle</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listarGrupos${codigo}">              
                    </tbody>
                </table>
            </div>
        </div>
        <div id="Agrupar_grupos"></div>
    `;
    app.innerHTML=view;

    listarGrupos();
    const forme = document.querySelector(`#formulario_conservacion${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));
    const cancelarBtn = document.getElementById(`cancelarBtn${codigo}`);
    cancelarBtn.addEventListener('click', () => {
        forme.reset();
    });
    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e,table));
    const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup",(e)=> filtrar_table(e,input));
    const toggleButton = document.getElementById(`toggleButton${codigo}`);
    toggleButton.addEventListener("click", (e) => mostrarFormulario_conservacion(toggleButton));
  
}
function mostrarFormulario_conservacion(toggleButton){
    const myForm = document.querySelector(`#formulario_conservacion${codigo}`);

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
    const table = document.getElementById(`editableTable${codigo}`);
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
            let grupo_obj = List_Grupo.find(obj => obj.id === Number(inpId));
            const confirm ={...grupo_obj};

            console.log(confirm);
            target.classList.add("editing");
            target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

            const input = target.querySelector("input");
            input.focus();


            input.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    
                    target.classList.remove("editing");

                    
                    target.textContent = input.value || originalValue;
                    Object.entries(grupo_obj).forEach(([key, value]) => {
                        if(key === inpKey){
                            grupo_obj[key] = target.textContent;
                        }
                    });
                    if (grupo_obj) {
                        Object.assign(List_Grupo, grupo_obj);
                    }
                    console.log(List_Grupo);
                    console.log(areObjectsEqual(grupo_obj,confirm));
                    if(!areObjectsEqual(grupo_obj,confirm)){
                        const formData = new FormData();
                        formData.append('ver', "editar_grupo");
                        formData.append('id', inpId);
                        formData.append('empresa', id2);
                        Object.entries(grupo_obj).forEach(([key, value]) => {
                            formData.append(key,value);
                        });
                        obt_grupo_aux = { ...obt_grupo_aux, ...confirm };

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
function listarGrupos(){
    
    fetch(`./api/listarGrupos/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        List_Grupo.length = 0;
        List_Grupo = data;     
        listarGruposArray();
        
        
    })
}
function listarGruposArray(){
    const mon=document.querySelector(`#listarGrupos${codigo}`);
    let view="",ind=1;
        List_Grupo.map(lista=>{
            view+=`
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.id},nombre,${uk[0].empresa.idempresa}">${lista.nombre}</td>
                <td data-type="${lista.id},detalle,${uk[0].empresa.idempresa}">${lista.detalle}</td>
                <td>
                    <a data-id="editar_grupo,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_grupo,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </a> 
                    <a data-id="agregar_productos,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-warning">
                        <i class="bi bi-collection-fill"></i>
                    </a> 
                                               
                </td>
            </tr>`;
        })
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });
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

        // Resetear el formulario_conservacion si existe
        let formulario_conservacion = document.querySelector(`#formulario_conservacion${codigo}`);
        if (formulario_conservacion) {
            formulario_conservacion.reset();
        }
        if(data[2]==="registrar_grupo"){
            listarGrupos();

        }
        if(data[2]==="eliminar_grupo"){
            console.log(List_Grupo);

            console.log(obt_grupo_aux);
            List_Grupo = List_Grupo.filter(obj => obj.id !== Number(obt_grupo_aux['id']));
            console.log(List_Grupo);
            listarGruposArray();
            obt_grupo_aux = { ...{ id: 0, nombre: "", detalle: "" } };

        }
        if(data[2]==="editar_grupo"){
            obt_grupo_aux = { ...{ id: 0, nombre: "", detalle: "" } };

        }
        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="editar_grupo"){
                const obj = List_Grupo.find(ob => ob.id === obt_grupo_aux['id']);

                console.log(obt_grupo_aux);

                console.log(obj);
                if (obt_grupo_aux) {
                    Object.assign(obj, obt_grupo_aux);
                }
                console.log(obt_grupo_aux);

                console.log(obj);
                console.log(List_Grupo);
                listarGruposArray();
                obt_grupo_aux = { ...{ id: 0, nombre: "", detalle: "" } };

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