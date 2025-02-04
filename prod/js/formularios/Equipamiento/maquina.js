import { URL_APIP } from "../../../../lib/services.js";


let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let List_Maquina = [];
let list_seccion =[];
let list_tipo_Maquina =[];

let obt_maquina_aux = {
    "id": -1,
    "nombre": "",
    "estado": -1,
    "tipo": -1,
    "seccion": -1
};
let obt_tipo_maquina_aux = {
    "id":-1,
    "tipo":"",
    "detalle":"",
};


const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "maquina";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const subcodigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + subcodigo;
}
export function maquinaConfig(code, permisos, refrescar,codigo) {
    
    app=document.querySelector(`#principal${codigo}`);
    
    sitio();    
    
}
function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    switch (funcion) {
        case "eliminar_maquina":
            eliminar_maquina(id1,id2);
            break;
        case "eliminar_tipomaquina":

            eliminar_tipomaquina(id1,id2);
            break;
        case "editar_maquina":
            toggleEditSave(event);
            break;
            
        case "editar_estado_maquina":
            editar_estado(event);
            break;
        case "editar_tipomaquina":
            toggleEditSaveTypeMaquina(event);
            break;

        case "configuracion":
            addVariableProcesoMaquina(id1);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}
function addVariableProcesoMaquina(id){
    let List_Variables=[];
    let obt_variable_aux ={
        "id":-1,
        "variable":"",
        "detalle":"",
        "idmaquina":1
    };
    const maquinaSeleccionada = List_Maquina.find(obj => obj.id === Number(id));
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
    variable.style.width = '500px';
    
    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.cursor = 'auto';
    overlay.appendChild(variable);
    let view = "";
    view += `
        <a style="float: right;" class ="cerrar"><i class="bi bi-x-lg"></i></a>
        <h3 class="text-center mb-4">Agregar variable (máquina)</h3>
        <labelclass="label-control">Maquina: ${maquinaSeleccionada['nombre']}</label>

        <form id="formularioVariableProceso${subcodigo}" class="mt-4">

            <div class="row">
                <input type="hidden" name="idmaquina" value="${maquinaSeleccionada['id']}">

                <input type="hidden" name="ver" value="registrar_variable_proceso">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">

                <div class="col-md-6 mb-3">
                    <div class="form-group">
                        <label for="variable" class="label-control">Variable proceso</label>
                        <input type="text" class="form-control" id="variable" name="variable" placeholder="" required>
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <div class="form-group">
                        <label for="detalle" class="label-control">Detalle</label>
                        <input type="text" class="form-control" id="detalle" name="detalle" placeholder="" required>
                    </div>
                </div>    
            </div>
            <button type="submit" class="btn btn-outline-success mr-1  registrar"  aria-label="Registrar">Registrar</button>
            <button type="button" class="btn btn-outline-primary mr-1  cancelar"  aria-label="Cancelar">Cancelar</button>
        </form>
        <div id="alertamodal${subcodigo}" class="mt-4"></div>
        <div class="mt-4" style = "max-height: 200px; overflow-y: auto; display: block;">
            <table class="table table-hover">
                <thead>
                    <tr class="table-dark">
                        <th>N°</th>
                        <th>Variable proceso</th>
                        <th>Detalle</th>
                        <th>Funciones</th>
                    </tr>
                </thead>
                <tbody id="listar_variable${subcodigo}">
                    
                </tbody>
            </table>
        </div> 
    `;
    variable.innerHTML=view;
    variable.style.display = "block";
    listar_variables();
    variable.addEventListener('click', function(event) {
        console.log(event.target);
        let aTag = event.target.closest('a.cerrar');
        let btnr = event.target.closest('button.registrar');
        let btnc = event.target.closest('button.cancelar');

        if (aTag) {
            event.preventDefault();
         
            cerrarModal();


        }
        if(btnr){
            let formulario = event.target.closest('form'); 
            sendformmodal(event,formulario);

        
            formulario.reset();
        }
        if(btnc){
            let formulario = event.target.closest('form'); 
            console.log(formulario);
            formulario.reset();
        }
    });
    function menumodal(event){
        const dataid = event.currentTarget.getAttribute('data-id');
        const [funcion, id1, id2] = dataid.split(',');
        switch (funcion) {
            case "eliminar_maquina":
                eliminar_maquina(id1,id2);
                break;
            case "editar_variables_proceso":
                toggleEditSavemodal(event);
                break;
            case "eliminar_variable_proceso_maquina":
                eliminar_variable(id1,maquinaSeleccionada['id']);
                break;
            // Agrega otros casos según sea necesario
            default:
                console.log("No hay acciones")
                break;
        }
    
    }
    function toggleEditSavemodal(event) {
        const permisos = [1, 2];
        const boton = event.currentTarget;
        const fila = boton.closest("tr");
        const celdas = fila.querySelectorAll("td");
        const dataid = boton.getAttribute('data-id');
        const [funcion, id1, id2] = dataid.split(',');
        const objVariableP = List_Variables.find(obj => obj.id === Number(id1));
        const objVariablePc = {...objVariableP};
    
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
                            linea *=false;
                        }
                    }
                }
            });
            console.log(linea);
    
            if(linea){
                objVariableP['variable'] = datosnuevos[0];
                objVariableP['detalle'] = datosnuevos[1];
                if (objVariableP) {
                    Object.assign(List_Variables, objVariableP);
                }
    
                if (!areObjectsEqual(objVariableP, objVariablePc)) {
                    const formData = new FormData();
                    formData.append('ver', "editar_variable_proceso");
                    Object.entries(objVariableP).forEach(([key, value]) => {
                        formData.append(key, value);
                    });
                    obt_variable_aux = { ...obt_variable_aux, ...objVariablePc };
                    sendformDatamodal(event, formData);
                }
    
                console.log(List_Variables);
    
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
    function listar_variables(){
        console.log("hola");

        fetch(`${URL_APIP}api/listar_variables_proceso/${maquinaSeleccionada['id']}`)
        .then(res=>res.json())
        .then(data=>{
            List_Variables.length = 0;
            List_Variables = data;
            listar_variables_Array();
            
        })
    } 
    function eliminar_variable(id,ids){
        if(confirm("Desea Eliminar..?")){
            fetch(`${URL_APIP}api/eliminar_variable_proceso_maquina/${id}/${ids}`)
            .then(res=>res.json())
            .then(data=>{
                obt_variable_aux ={...List_Variables.find(obj => obj.id === Number(id))};
    
                alertasmodal(data);
                
            })
        }
    }
    function listar_variables_Array(){
        const listar=document.querySelector(`#listar_variable${subcodigo}`);
        let view="",ind=1;
            List_Variables.map(lista=>{
            view+=`
             <tr>
                <td>${ind++}</td>                
                <td ">${lista.variable}</td>
                
                <td ">${lista.detalle}</td>                
                <td>
                    <a data-id="editar_variables_proceso,${lista.id}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_variable_proceso_maquina,${lista.id}" class="btn btn-danger btn-sm">
                        <i class="bi bi-trash"></i>
                    </a> 
                                              
                </td>
            </tr>
            `;
        })
        if (listar) {
            listar.innerHTML = view;
        } else {
            console.error('El elemento no fue encontrado');
        }

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menumodal);
        });
    }
    function cerrarModal() {
        overlay.remove(); // Vacía el contenido del contenedor del modal
        app.style.removeProperty('position');  // Quita el 'position' inline y lo restaura a su valor original del CSS
    }
    function sendformmodal(e,form){
        
        e.preventDefault();
        const dato=new FormData(form);
        

        fetch(`${URL_APIP}/api/`,{
            method:"POST",
            body:dato
        })
        .then(res=>res.json())
        .then(data=>{
            alertasmodal(data);
            
        })
    
    }
    function sendformDatamodal(event, formData) {
        event.preventDefault();
        fetch(`${URL_APIP}/api/`, { 
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alertasmodal(data);
            
        })
        .catch(error => {
            console.error('Error al enviar los datos:', error);
        });
    }
    function alertasmodal(data) {
        console.log(data);
        // Definir las variables al principio
        let alertClass, alertMessage, timeoutDuration;
        // Determinar el tipo de alerta y su mensaje
        if (data[0] == "ok") {
            alertClass = 'alert-success';
            alertMessage = data[1];
            timeoutDuration = 1500;
    
            
            if(data[2]==="registrar_variable_proceso"){
                listar_variables();
    
            }
            if(data[2]==="eliminar_variable_proceso_maquina"){
                
                List_Variables = List_Variables.filter(obj => obj.id !== Number(obt_variable_aux['id']));
                listar_variables_Array();
                obt_variable_aux = {...{
                    "id":-1,
                    "variable":"",
                    "detalle":"",
                    "idmaquina":1
                }};
            }
            if(data[2]==="editar_variable_proceso"){
                obt_variable_aux ={...{
                    "id":-1,
                    "variable":"",
                    "detalle":"",
                    "idmaquina":1
                }};
    
            }
            
        } else {
            if(data[0] == "Error"){
    
                if(data[2]==="editar_variable_proceso"){
                    const obj = List_Variables.find(ob => ob.id === obt_variable_aux['id']);
    
                    if (obt_variable_aux) {
                        Object.assign(obj, obt_variable_aux);
                    }
    
                    listar_variables_Array();
                    obt_variable_aux ={...{
                        "id":-1,
                        "variable":"",
                        "detalle":"",
                        "idmaquina":1
                    }};
    
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
        let divalert = document.querySelector(`#alertamodal${subcodigo}`);
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
}

function toggleEditSaveTypeMaquina(event) {
    const permisos = [1, 2];
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const objTypeMaq = list_tipo_Maquina.find(obj => obj.id === Number(id1));
    const objTypeMaqc = {...objTypeMaq};

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
            objTypeMaq['tipo'] = datosnuevos[0];
            objTypeMaq['detalle'] = datosnuevos[1];
           
            if (objTypeMaq) {
                Object.assign(list_tipo_Maquina, objTypeMaq);
            }

            if (!areObjectsEqual(objTypeMaq, objTypeMaqc)) {
                const formData = new FormData();
                formData.append('ver', "editar_tipomaquina");
                formData.append('empresa', id2);
                Object.entries(objTypeMaq).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_tipo_maquina_aux = { ...obt_tipo_maquina_aux, ...objTypeMaqc };
                sendformData(event, formData);
            }

            console.log(list_tipo_Maquina);

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

    boton.removeEventListener("click", toggleEditSaveTypeMaquina);
    boton.addEventListener("click", toggleEditSaveTypeMaquina);
}


//=================================================================================================================================

function toggleEditSave(event) {
    
    const permisos = [1, 3, 4];
const names = ["nombre", "tipo", "seccion"];
const boton = event.currentTarget;
const fila = boton.closest("tr");
const celdas = fila.querySelectorAll("td");
const dataid = boton.getAttribute('data-id');
const [funcion, id1, id2] = dataid.split(',');
const objmaquina = List_Maquina.find(obj => obj.id === Number(id1));
console.log(objmaquina);

const objmaquinac = { ...objmaquina };
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
            if (index === 3 || index === 4 ) {
                
                input = createSelectElement(names[permisos.indexOf(index)]); // Crear el elemento select correctamente
                if (input) {
                    celda.innerHTML = '';
                    input.value = objmaquina[names[permisos.indexOf(index)]];

                    celda.appendChild(input);
                } else {
                    console.error(`No se encontró el elemento con id #${names[index]}`);
                    return;
                }
            } else {
                input = document.createElement('input');
                input.id = `ediinp${subcodigo}`;
                input.className = "form-control";
                input.type = "text";
                input.value = valorOriginal;
                celda.innerHTML = '';
                celda.appendChild(input);
                
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
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }
                } else if (select) {
                    nuevoValor = select.value;
                    console.log(nuevoValor);
                    celda.textContent = select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);

                }
                
            }
        });
        console.error(linea);
        
        if(linea){
            objmaquina['nombre'] = datosnuevos[0];
            
            objmaquina['tipo'] = Number(datosnuevos[1]);
            objmaquina['seccion'] = Number(datosnuevos[2]);
            if (objmaquina) {
                Object.assign(List_Maquina, objmaquina);
            }
            console.log(objmaquina);
            console.log(objmaquinac);
            console.log(areObjectsEqual(objmaquina, objmaquinac));
            if (!areObjectsEqual(objmaquina, objmaquinac)) {
                const formData = new FormData();
                formData.append('ver', "editar_maquina");
                formData.append('empresa', id2);
                Object.entries(objmaquina).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_maquina_aux = { ...obt_maquina_aux, ...objmaquinac };
                sendformData(event, formData);
            }

            console.log(List_Maquina);

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
function eliminar_maquina(id,ids){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminar_maquina/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            obt_maquina_aux ={...List_Maquina.find(obj => obj.id === Number(id))};

            alertas(data);
            
        })
    }
   
}
function eliminar_tipomaquina(id,ids){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminar_tipomaquina/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            obt_tipo_maquina_aux={...list_tipo_Maquina.find(obj => obj.id === Number(id))};

            alertas(data);
            
        })
    }
}
function editar_estado(event){
    const boton = event.currentTarget;
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(','); 
    let objeto = List_Maquina.find(obj => obj.id === Number(id1));
   
    let est = objeto.estado == 0 ?   `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`: `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>`;
   
    const formData = new FormData();
    formData.append('ver', funcion);
    formData.append('id', id1);
    formData.append('empresa', id2);
    formData.append('estado', objeto.estado == 0 ? 1 : 0);
    objeto.estado = objeto.estado == 0 ? 1 : 0;
    sendformData(event, formData);
    console.log("Cambio de estado confirmado");
    boton.innerHTML = est;
}
function listarseccion_mat(){
        console.log("listo");
        const listar=document.querySelector(`#seccion${subcodigo}`);
        return fetch(`${URL_APIP}api/listarseccion/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            list_seccion.length = 0;
            list_seccion = data;
            console.log(data);
            let view="";
            data.map(lista=>{
                
                view+=`
                    <option value="${lista.id}">${lista.nombre_seccion} ${lista.codigo_seccion} </option>
                `;
            })
            listar.innerHTML=view;
            console.log("lista seccion completa");


            
        })
    

    
}
function listartipo_maquina(){
        console.log("listo");

        return fetch(`${URL_APIP}api/listar_tipomaquina/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            list_tipo_Maquina.length = 0;
            list_tipo_Maquina = data;
            listar_tipo_maquina_array();
        })
    

    
}
function llenarSelectTipo(){
    const listar=document.querySelector(`#tipo${subcodigo}`);

    let view="";
    list_tipo_Maquina.map(lista=>{
        view+=`
            <option value="${lista.id}">${lista.tipo} </option>
        `;
    })
    listar.innerHTML=view;
    console.log("lista tipo completa");
    listar_tipo_maquina_array();
}
function listar_tipo_maquina_array(){
    const listar=document.querySelector(`#listar_tipomaquina${subcodigo}`);
    let view="",ind=1;
    list_tipo_Maquina.map(lista=>{
            view+=`
             <tr>
                <td>${ind++}</td>                
                <td >${lista.tipo}</td>
                <td >${lista.detalle}</td>
                <td>
                    <a data-id="editar_tipomaquina,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_tipomaquina,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
            </tr>
            `;
        })
        listar.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });
}







function sitio() {
    
    let view = `
        <div class="container ">

            <h5 class="text-center mb-4">Máquina</h5>
            <div class="container " id="tipodiv${subcodigo}">
                <div class="container my-4">
                    <div class="row mt-4">
                        <div class="col-md-6 form-container mt-4">
                            <label for="" class="form-label fw-bold fs-6">Registrar tipo máquina</label>

                            <form id="formulario_tipo${subcodigo}">
                                <div class="row">
                                    <input type="hidden" name="ver" value="registrar_tipomaquina">
                                    <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                                    <div class="row mt-4">
                                        <div class="col-md-12 mb-3">
                                            <div class="form-group">
                                                <label for="tipo">Tipo Maquina</label>
                                                <input type="text" class="form-control" id="tipo" name="tipo" placeholder="" required>
                                            </div>
                                        </div>
                                        <div class="col-md-12 mb-3">
                                            <div class="form-group">
                                                <label for="detalle">Detalle</label>
                                                <input type="text" class="form-control" id="detalle" name="detalle" placeholder="" required>
                                            </div>
                                        </div> 
                                    </div>
                                       
                                </div>
                                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="guardarBtn${subcodigo}" aria-label="Registrar">Registrar</button>
                                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn${subcodigo}" aria-label="Cancelar">Cancelar</button>
                            </form>
                        </div>
                        <div class="col-md-6 table-container mt-4" style = " max-height: 200px; overflow-y: auto; display: block;">

                            <table class="table table-hover">
                                <thead>
                                    <tr class="table-dark">
                                        <th scope="col">#</th>
                                        <th scope="col">Tipo</th>
                                        <th scope="col">Detalle</th>
                                        <th scope="col">Fuciones</th>

                                    </tr>
                                </thead>
                                <tbody id="listar_tipomaquina${subcodigo}">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            
        </div>
    `;

    app.innerHTML = view;
    const tipo = document.querySelector(`#tipodiv${subcodigo}`);
   
    
    listartipo_maquina()
    
        
        

        const formetipomaquina = document.querySelector(`#formulario_tipo${subcodigo}`);
        formetipomaquina.addEventListener("submit", (e) => sendform(e, formetipomaquina));


        

        const cancelarBtn = document.getElementById(`cancelarBtn${subcodigo}`);
        cancelarBtn.addEventListener('click', () => {
            
            formetipomaquina.reset();
        });
     

        

 
       
}
function mostrarFormulario(e,toggleButton,myForm,abc){
    //const myForm = document.querySelector(`#formulario${subcodigo}`);
    if(abc ==="Tipo"){
        listar_tipo_maquina_array();
    }
    if (myForm.style.display === "none" || myForm.style.height === "0px") {
        myForm.style.display = "block";
        setTimeout(() => {
            myForm.style.height = myForm.scrollHeight + "px";
            myForm.style.opacity = 1;
        }, 10);  // Un pequeño retraso para asegurar que la transición ocurra
        toggleButton.innerHTML = `<i class="bi bi-dash-lg danger">${abc}</i>`;
    } else {
        myForm.style.height = "0";
        myForm.style.opacity = 0;
        setTimeout(() => {
            myForm.style.display = "none";
        }, 500);  // Esperar a que termine la transición
        toggleButton.innerHTML = `<i class="bi bi-plus">${abc}</i>`;
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
function edit_Celda_table(e){
    const target = e.target;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            const [inpId,inpKey,id2] = dataType.split(',');            
            let maquina_obj = List_Maquina.find(obj => obj.id === Number(inpId));
            const confirm = { ...maquina_obj };
            let input = null;
            if(inpKey === "seccion" || inpKey === "tipo"){
                input = createSelectElement(inpKey);
                if (input) {
                    target.classList.add("editing");
                    target.innerHTML = '';
                    target.appendChild(input);
                    input.focus();
                    input.value = maquina_obj[inpKey];
                    
                    
                } else {
                    alertas(["info",`No se encontró el elemento con id #${inpKey}${subcodigo}`]);
                }
            }else{
                target.classList.add("editing");
                target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

                input = target.querySelector("input");
                input.focus();
            }
            

            if(input){
                input.addEventListener("keydown", function(event) {
                    if (event.key === "Enter") {
                        
                        target.classList.remove("editing");
                        console.log(confirm);
                        let aux ;

                        if (input.tagName.toLowerCase() === "select") {
                            target.textContent = input.options[input.selectedIndex].text || originalValue;
                            aux = Number(input.value) || confirm[inpKey];

                        } else {
                            target.textContent = input.value || originalValue;
                            aux = input.value || confirm[inpKey];

                        }
                        
                        
                        Object.entries(maquina_obj).forEach(([key, value]) => {
                            if(key === inpKey){
                                maquina_obj[key] = aux ;
                            }
                        });
                        if (maquina_obj) {
                            Object.assign(List_Maquina, maquina_obj);
                        }
                        console.log(List_Maquina);
                        console.log(areObjectsEqual(maquina_obj,confirm));
                        if(!areObjectsEqual(maquina_obj,confirm)){
                            const formData = new FormData();
                            formData.append('ver', "editar_maquina");
                            formData.append('empresa', id2);
                            Object.entries(maquina_obj).forEach(([key, value]) => {
                                formData.append(key,value);
                            });
                            obt_maquina_aux = { ...obt_maquina_aux, ...confirm };
    
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
}

function listar_maquina(){
    
    return fetch(`${URL_APIP}api/listar_maquina/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        List_Maquina.length=0;
        List_Maquina = data;
        console.log(List_Maquina);
        listar_maquina_array();
        
    })
}

function listar_maquina_array(){
    
    const listar=document.querySelector("#listar_maquina");
    //console.log(List_Material);
    let view="",ind=1;
        List_Maquina.map(lista=>{
            let est = lista.estado == 0 ? `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>` : `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`;
            
            let itemseccion = list_seccion.find(obj => obj.id === lista.seccion) || {
                "id": 0,
                "nombre_seccion": "Nulo",
                "ubicacion": "Nulo",
                "codigo_seccion": "Nulo"
            };
            let itemTipo = list_tipo_Maquina.find(item => item.id === lista.tipo);
            
          
            // console.log(typeof lista.tipo); // Verifica el tipo de dato
            // console.log(typeof list_tipoM[0].id); 

            // console.log(typeof lista.seccion); // Verifica el tipo de dato
            // console.log(typeof list_seccion[0].id);

            // console.log(typeof lista.medida); // Verifica el tipo de dato
            // console.log(typeof list_medida[0].id);
            view+=`
             <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.id},nombre,${uk[0].empresa.idempresa}">${lista.nombre}</td>
                <td>
                    <a data-id="editar_estado_maquina,${lista.id},${uk[0].empresa.idempresa}"  class="btn">
                        ${est}
                    </a>
                </td>
                <td data-type="${lista.id},tipo,${uk[0].empresa.idempresa}">${itemTipo.tipo}</td>
                
                <td data-type="${lista.id},seccion,${uk[0].empresa.idempresa}">${itemseccion.nombre_seccion} ${itemseccion.codigo_seccion}</td>
                
                <td>
                    <a data-id="editar_maquina,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_maquina,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger btn-sm">
                        <i class="bi bi-trash"></i>
                    </a> 
                    <a data-id="configuracion,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-warning btn-sm">
                        <i class="bi bi-motherboard"></i>                    
                    </a>                           
                </td>
            </tr>
            `;
        })
        listar.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });
}

function sendform(e,form){
        
        e.preventDefault();
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
    let divalert = document.querySelector(`#alerta${subcodigo}`);
    if(data[2]==="registrar_variable_proceso"){
        divalert = document.querySelector(`#alertamodal${subcodigo}`);

    }
    console.log(data);
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;
        if(data[2]=="editar_estado"){
            return;
        }
        // Resetear el formulario si existe 
        let formulario = document.querySelector(`#formulario${subcodigo}`);
        if (formulario) {
            formulario.reset();
        }
        let formulario2 = document.querySelector(`#formulario_tipo${subcodigo}`);
        if (formulario2) {
            formulario2.reset();
        }
        
        if(data[2]==="registrar_tipomaquina"){
            listartipo_maquina();

        }
        if(data[2]==="registrar_maquina"){
            listar_maquina();

        }
        
        if(data[2]==="eliminar_tipomaquina"){
            list_tipo_Maquina = list_tipo_Maquina.filter(obj => obj.id !== Number(obt_tipo_maquina_aux['id']));
            listar_tipo_maquina_array();
            llenarSelectTipo();
            
            obt_tipo_maquina_aux = {...{
                "id":-1,
                "tipo":"",
                "detalle":"",
            }};
        }
        if(data[2]==="eliminar_maquina"){
            List_Maquina = List_Maquina.filter(obj => obj.id !== Number(obt_maquina_aux['id']));
            listar_maquina_array();
            obt_maquina_aux = { ...{
                "id": -1,
                "nombre": "",
                "estado": -1,
                "tipo": -1,
                "seccion": -1
            } };
        }
        if(data[2]==="editar_maquina"){
            
            obt_maquina_aux = { ...{
                "id": -1,
                "nombre": "",
                "estado": -1,
                "tipo": -1,
                "seccion": -1
            } };
        }
        
        if(data[2]==="editar_tipomaquina"){
            
            obt_tipo_maquina_aux = { ...{ "id":-1,"tipo":"","detalle":"",} };
            llenarSelectTipo();
        }
    } else {
        if(data[0] == "Error"){
            if(data[2]==="editar_tipomaquina"){
                const obj = list_tipo_Maquina.find(ob => ob.id === obt_tipo_maquina_aux['id']);

                console.log(obt_tipo_maquina_aux);

                console.log(obj);
                if (obt_tipo_maquina_aux) {
                    Object.assign(obj, obt_tipo_maquina_aux);
                }
                console.log(obt_tipo_maquina_aux);

                console.log(obj);
                console.log(list_tipo_Maquina);

                listar_tipo_maquina_array();
                llenarSelectTipo();
                obt_tipo_maquina_aux = { ...{ "id":-1,"tipo":"","detalle":"",} };
            }

            if(data[2]==="editar_maquina"){
                const obj = List_Maquina.find(ob => ob.id === obt_maquina_aux['id']);

                console.log(obt_maquina_aux);

                console.log(obj);
                if (obt_maquina_aux) {
                    Object.assign(obj, obt_maquina_aux);
                }
                console.log(obt_maquina_aux);

                console.log(obj);
                console.log(List_Maquina);

                listar_maquina_array();

                obt_maquina_aux = { ...{
                    "id": -1,
                    "nombre": "",
                    "estado": -1,
                    "tipo": -1,
                    "seccion": -1
                } };

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
