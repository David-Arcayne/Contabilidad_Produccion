import { URL_APIP } from "../../../../lib/services.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let obt_seccion_aux = {
    "id" : 0,
    "nombre_seccion" : "",
    "codigo_seccion" : "",
    "ubicacion":""
};
 
let List_Material = [];
let list_seccion =[];
let list_medida =[];
let list_tipoM =[];
let obt_material_aux = {
    seccion: -1,
    codigo: "",
    estado: -1,
    fecha: "",
    hora: "",
    id: -1,
    medida: -1,
    nombre: "",
    tipo: -1
};
let obt_tipo_material_aux = {
    id:-1,
    nombre:"",
    detalle:"",
};
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "material";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function tipo_material(code, permisos, refrescar, codigo_) {
    app=document.querySelector(`#principal${codigo_}`);
    sitio();    
    
}

function menuMaterial(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    switch (funcion) {
        case "eliminar_material":
            

            eliminar_material(id1,id2);
            break;
        case "eliminar_tipo_material":

            eliminar_tipo_material(id1,id2);
            break;
        case "editar_material":
            toggleEditSave(event);
            break;
            
        case "editar_estado":
            editar_estado(event);
            break;
        case "editar_tipo_material":
            toggleEditSaveTypeMaterial(event);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}
function toggleEditSaveTypeMaterial(event) {
    const permisos = [1, 2];
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const objTypeMat = list_tipoM.find(obj => obj.id === Number(id1));
    const objTypeMatc = {...objTypeMat};

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
                        linea *= false;
                    }
                }
            }
        });
        console.log(linea);

        if(linea){
            objTypeMat['nombre'] = datosnuevos[0];
            objTypeMat['detalle'] = datosnuevos[1];
           
            if (objTypeMat) {
                Object.assign(list_tipoM, objTypeMat);
            }

            if (!areObjectsEqual(objTypeMat, objTypeMatc)) {
                const formData = new FormData();
                formData.append('ver', "editar_tipo_material");
                formData.append('empresa', id2);
                Object.entries(objTypeMat).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_tipo_material_aux = { ...obt_tipo_material_aux, ...objTypeMatc };
                sendformData(event, formData);
            }

            console.log(list_tipoM);

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

    boton.removeEventListener("click", toggleEditSaveTypeMaterial);
    boton.addEventListener("click", toggleEditSaveTypeMaterial);
}


//=================================================================================================================================

function toggleEditSave(event) {
    
    const permisos = [1, 2, 3, 4, 6];
const names = ["nombre", "codigo", "medida", "tipo", "seccion"];
const boton = event.currentTarget;
const fila = boton.closest("tr");
const celdas = fila.querySelectorAll("td");
const dataid = boton.getAttribute('data-id');
const [funcion, id1, id2] = dataid.split(',');
const objmaterial = List_Material.find(obj => obj.id === Number(id1));
console.log(objmaterial);

const objmaterialc = { ...objmaterial };
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
            if (index === 3 || index === 4 || index === 6) {
                
                input = createSelectElement(names[permisos.indexOf(index)]); // Crear el elemento select correctamente
                if (input) {
                    celda.innerHTML = '';
                    input.value = objmaterial[names[permisos.indexOf(index)]];

                    celda.appendChild(input);
                } else {
                    console.error(`No se encontró el elemento con id #${names[index]}`);
                    return;
                }
            } else {
                input = document.createElement('input');
                input.id = `ediinp${codigo}`;
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
            objmaterial['nombre'] = datosnuevos[0];
            objmaterial['codigo'] = datosnuevos[1];
            objmaterial['medida'] =Number(datosnuevos[2]);
            objmaterial['tipo'] = Number(datosnuevos[3]);
            objmaterial['seccion'] = Number(datosnuevos[4]);
            if (objmaterial) {
                Object.assign(List_Material, objmaterial);
            }
            console.log(objmaterial);
            console.log(objmaterialc);
            console.log(areObjectsEqual(objmaterial, objmaterialc));
            if (!areObjectsEqual(objmaterial, objmaterialc)) {
                const formData = new FormData();
                formData.append('ver', "editar_material");
                formData.append('empresa', id2);
                Object.entries(objmaterial).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_material_aux = { ...obt_material_aux, ...objmaterialc };
                sendformData(event, formData);
            }

            console.log(List_Material);

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
function eliminar_material(id,ids){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminar_material/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            obt_material_aux ={...List_Material.find(obj => obj.id === Number(id))};

            alertas(data);
            
        })
    }
   
}
function eliminar_tipo_material(id,ids){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}api/eliminar_tipo_material/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            obt_tipo_material_aux ={...list_tipoM.find(obj => obj.id === Number(id))};

            alertas(data);
            
        })
    }
}
function editar_estado(event){
    const boton = event.currentTarget;
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2,id3] = dataid.split(','); 
    let objeto = List_Material.find(obj => obj.id === Number(id1));
   
    let est = objeto.estado == 0 ?   `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`: `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>`;
   
    const formData = new FormData();
    formData.append('ver', funcion);
    formData.append('id_mat', id1);
    formData.append('empresa', id2);
    formData.append('estado_mat', objeto.estado == 0 ? 1 : 0);
    objeto.estado = objeto.estado == 0 ? 1 : 0;
    sendformData(event, formData);
    console.log("Cambio de estado confirmado");
    boton.innerHTML = est;
}

function listartipo_mat(){
        console.log("listo");

        return fetch(`${URL_APIP}api/listar_tipo_material/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            list_tipoM = data;
            listar_tipo_material_array();
        })
    

    
}


function listar_tipo_material_array(){
    const listar=document.querySelector(`#listar_tipomaterial${codigo}`);
    let view="",ind=1;
        list_tipoM.map(lista=>{
            view+=`
             <tr>
                <td>${ind++}</td>                
                <td >${lista.nombre}</td>
                <td >${lista.detalle}</td>
                <td>
                    <a data-id="editar_tipo_material,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_tipo_material,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
            </tr>
            `;
        })
        listar.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuMaterial);
        });
}








function sitio() {
    
    let view = `
        <div class="container ">

            <label for="" class="form-label fw-bold fs-6 center">Tipo material</label>
            <div class="container " id="tipomaterial${codigo}">
                     <div class="container my-4">
                        <div class="row mt-4">
                            <div class="col-md-6 form-container mt-4">

                                <form id="formulario_tipo_material${codigo}">
                                    <input type="hidden" name="ver" value="registrar_tipo_material">
                                    <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                                    <div class="row mt-4">
                                        <div class="col-md-12 mb-3">
                                            <div class="form-group">
                                                <label for="nombre">Tipo Material</label>
                                                <input type="text" class="form-control" id="nombre" name="nombre" placeholder="" required>
                                            </div>
                                        </div>
                                        <div class="col-md-12 mb-3">
                                            <div class="form-group">
                                                <label for="detalle">Detalle</label>
                                                <input type="text" class="form-control" id="detalle" name="detalle" placeholder="" required>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                                    <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn${codigo}" aria-label="Cancelar">Cancelar</button>
                                </form>
                            </div>

                            <div class="col-md-6 table-container mt-4" style = " max-height: 200px; overflow-y: auto; display: block;">
                                <table class="table table-hover ">
                                    <thead>
                                        <tr class="table-dark">
                                            <th scope="col">N°</th>
                                            <th scope="col">Tipo</th>
                                            <th scope="col">Detalle</th>
                                            <th scope="col">Funciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="listar_tipomaterial${codigo}">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
            </div>
         
    `;

    app.innerHTML = view;
    const tipoMat = document.querySelector(`#tipomaterial${codigo}`);
    
   
    
    listartipo_mat();
        

        const formetipomaquina = document.querySelector(`#formulario_tipo_material${codigo}`);
        formetipomaquina.addEventListener("submit", (e) => sendform(e, formetipomaquina));

       
        
        const cancelarBtn = document.getElementById(`cancelarBtn${codigo}`);
        cancelarBtn.addEventListener('click', () => {
            
            formetipomaquina.reset();
        });
       

        
   
       
}
function mostrarFormulario(e,toggleButton,myForm,abc){
    //const myForm = document.querySelector(`#formulario${codigo}`);
    if(abc ==="Tipo"){
        listar_tipo_material_array();
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
function edit_Celda_table(e){
    const target = e.target;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            const [inpId,inpKey,id2] = dataType.split(',');            
            let material_obj = List_Material.find(obj => obj.id === Number(inpId));
            const confirm = { ...material_obj };
            let input = null;
            if(inpKey === "seccion" || inpKey === "tipo" || inpKey === "medida"){
                input = createSelectElement(inpKey);
                if (input) {
                    target.classList.add("editing");
                    target.innerHTML = '';
                    target.appendChild(input);
                    input.focus();
                    input.value = material_obj[inpKey];
                    
                    
                } else {
                    console.error(`No se encontró el elemento con id #${inpKey}${codigo}`);
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
                        
                        
                        Object.entries(material_obj).forEach(([key, value]) => {
                            if(key === inpKey){
                                material_obj[key] = aux ;
                            }
                        });
                        if (material_obj) {
                            Object.assign(List_Material, material_obj);
                        }
                        console.log(List_Material);
                        console.log(areObjectsEqual(material_obj,confirm));
                        if(!areObjectsEqual(material_obj,confirm)){
                            const formData = new FormData();
                            formData.append('ver', "editar_material");
                            formData.append('id', inpId);
                            formData.append('empresa', id2);
                            Object.entries(material_obj).forEach(([key, value]) => {
                                formData.append(key,value);
                            });
                            obt_material_aux = { ...obt_material_aux, ...confirm };
    
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




function sendform(e, form) {
    e.preventDefault();
    const dato = new FormData(form);
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
    
    dato.append('fecha', currentDate);
    dato.append('hora', currentTime);
    

    
    fetch(`${URL_APIP}api/`, {
        method: "POST",
        body: dato
    })
    .then(res => res.json())
    .then(data => {
        alertas(data);
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


function alertas(data) {

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
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        let formulario2 = document.querySelector(`#formulario_tipo_material${codigo}`);
        if (formulario2) {
            formulario2.reset();
        }
        
        if(data[2]==="registrar_tipo_material"){
            listartipo_mat();

        }
        if(data[2]==="registromaterial"){
            listar_material();

        }
        
        if(data[2]==="eliminar_tipo_material"){
            list_tipoM = list_tipoM.filter(obj => obj.id !== Number(obt_tipo_material_aux['id']));
            listar_tipo_material_array();
            llenarSelectTipo();
            obt_tipo_material_aux = { ...{ id:-1,nombre:"",detalle:""} };
        }
        if(data[2]==="eliminarmaterial"){
            List_Material = List_Material.filter(obj => obj.id !== Number(obt_material_aux['id']));
            listar_material_array();
            obt_material_aux = { ...{seccion: -1,codigo: "",estado: -1,fecha: "",hora: "",id: -1,medida: -1,nombre: "",tipo: -1} };
        }
        if(data[2]==="editar_material"){
            
            obt_material_aux = { ...{seccion: -1,codigo: "",estado: -1,fecha: "",hora: "",id: -1,medida: -1,nombre: "",tipo: -1} };
        }
        
        if(data[2]==="editar_tipo_material"){
            
            obt_tipo_material_aux = { ...{ id:-1,nombre:"",detalle:""} };
        }
    } else {
        if(data[0] == "Error"){
            if(data[2]==="editar_tipo_material"){
                const obj = list_tipoM.find(ob => ob.id === obt_tipo_material_aux['id']);

                console.log(obt_material_aux);

                console.log(obj);
                if (obt_tipo_material_aux) {
                    Object.assign(obj, obt_tipo_material_aux);
                }
                console.log(obt_tipo_material_aux);

                console.log(obj);
                console.log(list_tipoM);

                listar_tipo_material_array();
                obt_tipo_material_aux = { ...{ id:-1,nombre:"",detalle:""} };
            }

            if(data[2]==="editar_material"){
                const obj = List_Material.find(ob => ob.id === obt_material_aux['id']);

                console.log(obt_material_aux);

                console.log(obj);
                if (obt_material_aux) {
                    Object.assign(obj, obt_material_aux);
                }
                console.log(obt_material_aux);

                console.log(obj);
                console.log(List_Material);

                listar_material_array();

                obt_material_aux = { ...{seccion: -1,codigo: "",estado: -1,fecha: "",hora: "",id: -1,medida: -1,nombre: "",tipo: -1} };

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
