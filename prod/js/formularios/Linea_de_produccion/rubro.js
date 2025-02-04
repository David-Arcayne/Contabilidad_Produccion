import { URL_APIP } from "../../../../lib/services.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let Lista_Rubro = [];

let obt_rubro_aux = {
    "id" : 0,
    "rubro" : "",
    "detalle" : ""
};
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "rubro";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function rubro_linea_de_producio(code, permisos, refrescar,codigo) {
    app=document.querySelector(`#principal${codigo}`);
    
    sitio();    
    
}

function menudivisas(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const forme = document.querySelector(`#alerta`);
    switch (funcion) {
        case "eliminar_rubro":
            

            eliminar_rubro(id1,id2);
            break;
        case "editar_rubro":
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
    const ObjetoSeleccionado = Lista_Rubro.find(obj => obj.id === Number(id1));
    const ObjetoSeleccionadoc = {...ObjetoSeleccionado};

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
            ObjetoSeleccionado['rubro'] = datosnuevos[0];
            ObjetoSeleccionado['detalle'] = datosnuevos[1];
            if (ObjetoSeleccionado) {
                Object.assign(Lista_Rubro, ObjetoSeleccionado);
            }

            if (!areObjectsEqual(ObjetoSeleccionado, ObjetoSeleccionadoc)) {
                const formData = new FormData();
                formData.append('ver', "editar_rubro");
                formData.append('id', id1);
                formData.append('empresa', id2);
                Object.entries(ObjetoSeleccionado).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_rubro_aux = { ...obt_rubro_aux, ...ObjetoSeleccionadoc };
                sendformData(event, formData);
            }

            console.log(Lista_Rubro);

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

function eliminar_rubro(id,ids){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminar_rubro/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            obt_rubro_aux ={...Lista_Rubro.find(obj => obj.id === Number(id))};

            alertas(data);
            console.log(obt_rubro_aux);

        })
    }
   
}



function sitio(){
    let view=`
        <div class="container">
            <h5 class="text-center mb-4 fw-bold fs-6" >Rubro productivo</h5>

            <form id="formulario${codigo}">

                <input type="hidden" name="ver" value="registrar_rubro">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                <div class="row">
                    <div class="col-md-6">
                        <label for="rubro">Rubro:</label>

                        <input type="text" class="form-control" id="rubro" placeholder="" name="rubro" required>
                    </div>
                    <div class="col-md-6">
                        <label for="detalle">detalle</label>
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
                            <th scope="col">Rubro</th>
                            <th scope="col">Detalle</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_rubro">              
                    </tbody>
                </table>
            </div>
        </div>
    `;
    app.innerHTML=view;

    listar_rubro();
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.style.display = "none";
    forme.style.opacity = 0;
    forme.style.height = "0";
    forme.style.overflow = "hidden";
    forme.style.transition = "height 0.5s ease, opacity 0.5s ease";
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
    toggleButton.addEventListener("click", (e) => mostrarFormulario(e,toggleButton));
  
}
function mostrarFormulario(e,toggleButton){
    const myForm = document.querySelector(`#formulario${codigo}`);

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
            let objetoselect = Lista_Rubro.find(obj => obj.id === Number(inpId));
            const confirm ={...Lista_Rubro.find(obj => obj.id === Number(inpId))};

            console.log(confirm);
            target.classList.add("editing");
            target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

            const input = target.querySelector("input");
            input.focus();


            input.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    
                    target.classList.remove("editing");

                    
                    target.textContent = input.value || originalValue;
                    Object.entries(objetoselect).forEach(([key, value]) => {
                        if(key === inpKey){
                            objetoselect[key] = target.textContent;
                        }
                    });
                    if (objetoselect) {
                        Object.assign(Lista_Rubro, objetoselect);
                    }
                    console.log(Lista_Rubro);
                    console.log(areObjectsEqual(objetoselect,confirm));
                    if(!areObjectsEqual(objetoselect,confirm)){
                        const formData = new FormData();
                        formData.append('ver', "editar_rubro");
                        formData.append('id', inpId);
                        formData.append('empresa', id2);
                        Object.entries(objetoselect).forEach(([key, value]) => {
                            formData.append(key,value);
                        });
                        obt_rubro_aux = { ...obt_rubro_aux, ...confirm };

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
function listar_rubro(){
    
    fetch(`${URL_APIP}api/listar_rubro/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        Lista_Rubro.length = 0;
        Lista_Rubro = data;     
        console.log(data);
        listar_rubroArray();
        
        
    })
}
function listar_rubroArray(){
    console.log(Lista_Rubro);
    const mon=document.querySelector("#listar_rubro");
    let view="",ind=1;
        Lista_Rubro.map(lista=>{
            view+=`
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.id},rubro,${uk[0].empresa.idempresa}">${lista.rubro}</td>
                <td data-type="${lista.id},detalle,${uk[0].empresa.idempresa}">${lista.detalle}</td>
                <td>
                    <a data-id="editar_rubro,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_rubro,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
            </tr>`;
        })
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menudivisas);
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
        console.log(form);
        e.preventDefault();
        const dato=new FormData(form);
        console.log(dato);
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
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        if(data[2]==="registrar_rubro"){
            listar_rubro();

        }
        if(data[2]==="eliminar_rubro"){
            console.log(Lista_Rubro);

            console.log(obt_rubro_aux);
            Lista_Rubro = Lista_Rubro.filter(obj => obj.id !== Number(obt_rubro_aux['id']));
            console.log(Lista_Rubro);
            listar_rubroArray();
            obt_rubro_aux = { ...{ id: 0, rubro: "", detalle: "" } };

        }
        if(data[2]==="editar_rubro"){
            obt_rubro_aux = { ...{ id: 0, rubro: "", detalle: "" } };

        }
        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="editar_rubro"){
                const obj = Lista_Rubro.find(ob => ob.id === obt_rubro_aux['id']);

                console.log(obt_rubro_aux);

                console.log(obj);
                if (obt_rubro_aux) {
                    Object.assign(obj, obt_rubro_aux);
                }
                console.log(obt_rubro_aux);

                console.log(obj);
                console.log(Lista_Rubro);
                listar_rubroArray();
                obt_rubro_aux = { ...{ id: 0, rubro: "", detalle: "" } };

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