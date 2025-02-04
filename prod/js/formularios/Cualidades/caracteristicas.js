import * as listarFunctions from "../funciones/listar.js";
import { URL_APIP } from "../../../../lib/services.js";



let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let List_Envases =[];
let obt_envases_aux = {
    "idcaracteristicas" : 0,
    "caracteristica" : "",
    "tipo" : 0
};

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "envases";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}

export async function caracteristicasConfig(code, permisos, refrescar,codigo_) {
    app=document.querySelector(`#principal${codigo_}`);
    
    sitio();    
    
}

function menu(event){
    console.log("estoy dentro de menuCaracteristicas");
    console.log(event);
    const dataid = event.currentTarget.getAttribute('data-id');
    // empresaid = event.currentTarget.getAttribute('data-id');
// Supongamos que la cadena completa es "editarEnvase,2,8f14e45fceea167a5a36dedd4bea2543"
// var cadenaCompleta = "editarEnvase,2,8f14e45fceea167a5a36dedd4bea2543";

    const [funcion, id1, ids] = dataid.split(',');
    // console.log(ids);
 
    switch (funcion) {
        case "eliminarCaracteristica": //este valor viene del icono eliminar, basurero
            eliminarenvase(id1,ids);
            break;
        case "editarCaracteristicas"://este valor viene del icono editar, lapicito
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
    
    const permisos = [1,2];
      
    const names = [
        'caracteristica', 'tipo'
    ];
   
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    

    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    const objetoseleccionado = List_Envases.find(obj => obj.idcaracteristicas === Number(id1));
    console.log(objetoseleccionado);

    const objetoseleccionadoc = { ...objetoseleccionado };
    let originalValues = {};

    console.log(funcion, id1);

    if (boton.innerHTML.includes('bi-pencil-square')) {
        // Modo Editar
        let firstInput;
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const valorOriginal = celda.textContent.trim();
                originalValues[index] = valorOriginal;

                let input;
                if (index === 2 ) {
                    
                    input = createSelectElement(names[permisos.indexOf(index)]); // Crear el elemento select correctamente
                    if (input) {
                        celda.innerHTML = '';
                        
                        input.value = objetoseleccionado[names[permisos.indexOf(index)]];

                        celda.appendChild(input);
                    } else {
                        console.error(`No se encontró el elemento con id #${names[index]}`);
                        return;
                    }
                } else {
                    if(index === 12 || index === 13 ){
                        input = document.createElement('input');
                        input.id = `ediinp${codigo}`;
                        input.className = "form-control";
                        input.type = "number";
                        input.step="0.01"
                     
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

                // Añadir evento de teclado
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
        let nuevoValor = "";
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector(`input`);
                const select = celda.querySelector('select');
                if (input) {
                    nuevoValor = input.value.trim();
                    console.log(nuevoValor);

                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }
                } else if (select) {
                    nuevoValor = select.value;
                    
                    if(nuevoValor){
                        celda.textContent = select.options[select.selectedIndex].text;

                        datosnuevos.push(Number(nuevoValor));

                    }else{
                        celda.textContent = "-";
                        datosnuevos.push(-1 );

                    }
                    

                }
                
            }
        });
        console.error(linea);
        console.log(datosnuevos);
        if(linea){

          
            objetoseleccionado[names[0]] = datosnuevos[0];
            
            objetoseleccionado[names[1]] = datosnuevos[1];
           
            console.log(objetoseleccionado);
            if (objetoseleccionado) {
                Object.assign(List_Envases, objetoseleccionado);
            }
            console.log(objetoseleccionado);
            console.log(objetoseleccionadoc);
            console.log(areObjectsEqual(objetoseleccionado, objetoseleccionadoc));
            if (!areObjectsEqual(objetoseleccionado, objetoseleccionadoc)) {
                const formData = new FormData();
                formData.append('verDavid', "editarCaracteristicas");
                formData.append('empresa', `${uk[0].empresa.idempresa}`);

                Object.entries(objetoseleccionado).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_envases_aux = { ...obt_envases_aux, ...objetoseleccionadoc };
                console.log(obt_envases_aux);

                for (let [key, value] of formData.entries()) {
                    console.log(key, value);
                }
                sendformData(event, formData);
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
        console.log(originalValues);
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
function eliminarenvase(id,ids){
    

    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminarCaracteristica/${id}/${ids}`, {
            headers: {
                'Usar-Listado-David': 'true' 
            }
        })
        .then(res=>res.json())
        .then(data=>{
            obt_envases_aux ={...List_Envases.find(obj => obj.id === Number(id))};

            alertas(data);

            console.log(obt_envases_aux);
        })
    }
   
}
async function  sitio(){
    await listaCaracteristicas();

    let view=`
        <div class="container">
        <h2 class="text-center">Caracteristicas</h2>
        <form id="formulario${codigo}">
            <input type="hidden" name="verDavid" value="registroCaracteristicas">
            <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">

            <div class="row">
                <div class="col-md-6">
                    <label for="nombre">Nombre caracteristica: </label>
                    <input type="text" class="form-control" id="nombre" placeholder="Ejemplo: tamanio" name="caracteristica" required>
                </div>
                <div class="col-md-6">
                    <label for="tipo">Nombre Tipo caracteristica: </label>
                    <select class="form-select" id="tipo${codigo}" name="tipo">
                        <option value="0">Caracteristica de evaluacion</option>
                        <option value="1">Caracteristica Fisica</option>
                    </select>
                </div>
            </div>

            <button type="submit" class="btn btn-outline-success mr-1 mt-4" >Guardar</button>
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
                <thead>
                    <tr class="table-dark">
                        <th scope="col">N°</th>
                        <th scope="col">Caracteristica</th>
                        <th scope="col">tipo</th>

                        <th scope="col">Funciones</th>
                    </tr>
                </thead>
                <tbody id="listaCaracteristicas">
                
                </tbody>
            </table>
        </div>
    </div>
    `;
    app.innerHTML=view;

    listaCaracteristicas_array();
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
    table.addEventListener("dblclick",(e) => edit_Celda_table(e));
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
function edit_Celda_table(e) {
    const target = e.target;
    if (target.tagName.toLowerCase() !== "td" || target.classList.contains("editing")) return;

    const originalValue = target.textContent.trim();
    const [inpId, inpKey, inpKey2] = target.getAttribute("data-type").split(',');
    const objeto_seleccionado = List_Envases.find(obj => obj.idcaracteristicas === Number(inpId));
    if (!objeto_seleccionado) {
        console.error(`Product with id ${inpId} not found`);
        return;
    }
    const confirm = { ...objeto_seleccionado};
    console.log(confirm);
    let input;
    const isSelect = ["tipo"].includes(inpKey);

    if (isSelect) {
        input = createSelectElement(inpKey);
        if (!input) {
            alertas(["info", `No se encontró el elemento con id #${inpKey}${codigo}`]);
            return;
        }
        input.value = objeto_seleccionado[inpKey];
    } else {
        const inputType = [""].includes(inpKey) ? "number" : "text";
        input = document.createElement("input");
        input.type = inputType;
        input.value = originalValue;
        input.className = "form-control";
       
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
        objeto_seleccionado[inpKey] = aux;
        target.textContent = isSelect ? input.options[input.selectedIndex].text : newValue;

        if (!areObjectsEqual(objeto_seleccionado, confirm)) {
            const formData = new FormData();
            formData.append('verDavid', "editarCaracteristicas");
            formData.append('empresa',uk[0].empresa.idempresa );
            Object.entries(objeto_seleccionado).forEach(([key, value]) => formData.append(key, value));
            obt_envases_aux = { ...obt_envases_aux, ...confirm };
            console.log(obt_envases_aux);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            sendformData(e, formData);
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
async function listaCaracteristicas(){
    List_Envases = await listarFunctions.listar_caracteristicas(uk[0].empresa.idempresa);
    console.log(List_Envases);
}


function listaCaracteristicas_array() {
    const envase = document.querySelector("#listaCaracteristicas");

         
            let view="",ind=1;

            List_Envases.map(lista=>{
                let typeCaract = lista.tipo === 0 ? 'Caracteristica de evaluacion':'Caracteristica Fisica';

                 view+=`
                  <tr>
                    <td >${ind++}</td> 
                     <td data-type="${lista.idcaracteristicas},caracteristica,${uk[0].empresa.idempresa}">${lista.caracteristica}</td>               
                    <td data-type="${lista.idcaracteristicas},tipo,${lista.tipo}">${typeCaract}</td>  
                    <td>
                        <a data-id="editarCaracteristicas,${lista.idcaracteristicas},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                            <i class="bi bi-pencil-square"></i>
                        </a>  
                        <a data-id="eliminarCaracteristica,${lista.idcaracteristicas},${uk[0].empresa.idempresa}" class="btn btn-danger">
                            <i class="bi bi-trash"></i>
                        </a> 
                                                   
                    </td>
                 </tr>
                 `;
             })
            //  console.log(view);
            envase.innerHTML=view;
     
            const enlaces = document.querySelectorAll(".btn");
            enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
            });
            
            
            // listaenvasesArray();
        
}

function sendformData(event, formData) {
    event.preventDefault();

    fetch(`${URL_APIP}api/`, { // Reemplaza esto con la URL de tu servidor
        method: "POST",
        body: formData,
        headers: {
            'Usar-Registro-David': 'true'
            }
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
    for (let [key, value] of dato.entries()) {
        console.log(key, value);
    }
    fetch(`${URL_APIP}api/`,{
        method:"POST",
        body:dato,
        headers: {
            'Usar-Registro-David': 'true'
            }
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
        if(data[2]==="registrarCaracteristica"){
            sitio();

        }
        if(data[2]==="eliminarCaracteristica"){
            console.log(List_Envases);
            console.log(obt_envases_aux);

            List_Envases = List_Envases.filter(obj => obj.id !== Number(obt_envases_aux['id']));
            console.log(List_Envases);

            listaCaracteristicas();
            obt_envases_aux = { ...{ id: 0, nombre: "", detalle: "" } };

        }
        if(data[2]==="edicionCaracteristica"){
            obt_envases_aux = { ...{ id: 0, nombre: "" } };

        }

        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="edicionCaracteristica"){
                const obj = List_Envases.find(ob => ob.id === obt_envases_aux['id']);

                console.log(obt_envases_aux);

                console.log(obj);
                if (obt_envases_aux) {
                    Object.assign(obj, obt_envases_aux);
                }
                console.log(obt_envases_aux);

                console.log(obj);
                console.log(List_Envases);
                listaCaracteristicas();
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