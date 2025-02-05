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
let list_rubro = [];
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
export function materialconfig_admin(code, permisos, refrescar ) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
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


//=================================================================================================================================

function toggleEditSave(event) {
    
    const permisos = [1, 2, 3, 4, 6, 7];
const names = ["nombre", "codigo", "medida", "tipo", "seccion", "rubro_idrubro"];
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
            if (index === 3 || index === 4 || index === 6 || index === 7) {
                
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
            objmaterial['rubro_idrubro'] = Number(datosnuevos[5]);

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
function listar_rubro(){
    console.log("listo");

    const listar2=document.querySelector(`#rubro_idrubro${codigo}`);

    return fetch(`${URL_APIP}/api/listar_rubro/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        list_rubro.length = 0;
        list_rubro = data;     

        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
                <option value="${lista.id}">${lista.rubro}</option>
            `;
        })
        listar2.innerHTML= view;
        console.log(data);
        

    })
}
function listarseccion_mat(){
        console.log("listo");
        const listar=document.querySelector(`#seccion${codigo}`);
        return fetch(`${URL_APIP}api/listarseccion/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            list_seccion.length = 0;
            list_seccion = data;

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
function listartipo_mat(){
        console.log("listo");

        return fetch(`${URL_APIP}api/listar_tipo_material/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            list_tipoM.length = 0;
            list_tipoM = data;
            llenarSelectTipo();
        })
    

    
}
function llenarSelectTipo(){
    const listar=document.querySelector(`#tipo${codigo}`);

    let view="";
    list_tipoM.map(lista=>{
        view+=`
            <option value="${lista.id}">${lista.nombre} </option>
        `;
    })
    listar.innerHTML=view;
    
}

function listarmedida_mat(){
        console.log("listo");

        const listar=document.querySelector(`#medida${codigo}`);
        return fetch(`${URL_APIP}api/listar_unidad_producto/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            list_medida.length = 0;
            list_medida = data;     
            console.log(list_medida);
            let view="",ind=1;
            data.map(lista=>{
                if(lista.estado === 1){
                    view+=`
                    <option value="${lista.id}">${lista.nombre} </option>
                `;
                }    
                
            })
            listar.innerHTML=view;
            console.log("lista medida completa");
            

        })
}




function sitio() {
    
    let view = `
        <div class="container ">

            <h2 class="text-center mb-4">Material</h2>
            
            <div class="col-md-3 mb-3">
                <label for="rubro_idrubro" class="form-label">Linea de produccion:</label>
                <select class="form-select" id="rubro_idrubro${codigo}" name="rubro_idrubro">
                    <option value="" disabled selected>Seleccione un rubro</option>
                    
                </select>
            </div>
            <form id="formulario${codigo}">
                <div class="row">
                    <input type="hidden" name="ver" value="registrar_material">
                    <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                    <div class="col-md-6 mb-3">
                        <div class="form-group">
                            <label for="nombre">Nombre del Material</label>
                            <input type="text" class="form-control" id="nombre" name="nombre" placeholder="Ejm. Harina" required>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="form-group">
                            <label for="codigo">Código del Material</label>
                            <input type="text" class="form-control" id="codigo" name="codigo" placeholder="Ejm. 2024A" required>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="form-group">
                            <label for="seccion">Seleccione Seccion:</label>
                            <select class="form-select" id="seccion${codigo}" name="seccion"></select>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="form-group">
                            <label for="estado">Seleccione Estado</label>
                            <select class="form-select" id="estado${codigo}" name="estado">
                                <option value="0">Activo</option>
                                <option value="1">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="form-group">
                            <label for="medida">Seleccione Medida de Control</label>
                            <select class="form-select" id="medida${codigo}" name="medida"></select>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="form-group">
                            <label for="tipo">Seleccione Tipo de Material</label>
                            <select class="form-select" id="tipo${codigo}" name="tipo"></select>
                        </div>
                    </div>
                    
                    
                </div>
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>
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
                            <th scope="col">Material</th>
                            <th scope="col">Código</th>
                            <th scope="col">Medida</th>
                            <th scope="col">Tipo</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Seccion</th>
                            <th scope="col">Rubro</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Hora</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_material"></tbody>
                </table>
             </div>
        </div>
    `;

    app.innerHTML = view;
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.style.display = "none";
    forme.style.opacity = 0;
    forme.style.height = "0";
    forme.style.overflow = "hidden";
    forme.style.transition = "height 0.5s ease, opacity 0.5s ease";
    listartipo_mat()
    .then(() => listarseccion_mat())
    .then(() => listarmedida_mat())
    .then(() => listar_rubro())
    .then(() => listar_material())
    .then(() => {
        
        filtrar_por_rubros();

        const selectrubro = document.querySelector(`#rubro_idrubro${codigo}`);
        

        selectrubro.addEventListener("change", function() {
            filtrar_por_rubros();
        });

        
        
        forme.addEventListener("submit", (e) => sendform(e, forme));

        

        const table = document.getElementById(`editableTable${codigo}`);
        table.addEventListener("dblclick",(e) => edit_Celda_table(e));

        const input = document.getElementById(`filtro${codigo}`);
        input.addEventListener("keyup",(e)=> filtrar_table(e,input));

        
        const cancelarBtn2 = document.getElementById(`cancelarBtn2${codigo}`);
        cancelarBtn2.addEventListener('click', () => {
            forme.reset();
            
        });

       const toggleButton = document.getElementById(`toggleButton${codigo}`);
        toggleButton.addEventListener("click", (e) => mostrarFormulario(e,toggleButton,forme,"Formulario"));
    })
    .catch(error => {
        console.error('Error en la cadena de promesas:', error);
    });
       
}
function filtrar_por_rubros(){
    // const selectItems = document.querySelector(`#rubro_idrubro${codigo}`);
    // const selectedValue = selectItems.value;
    const selectrubro = document.querySelector(`#rubro_idrubro${codigo}`);
    const selectedOpcText = selectrubro.options[selectrubro.selectedIndex].text;

    let selectedColumnIndex = 7;
    const tabla = document.querySelector(`#editableTable${codigo}`);
    const filas = tabla.getElementsByTagName("tr");

    for (let i = 1; i < filas.length; i++) {
        const celdas = filas[i].getElementsByTagName("td");

        if (celdas[selectedColumnIndex]) {
            const valorCelda = celdas[selectedColumnIndex].textContent || celdas[selectedColumnIndex].innerText;

            if (valorCelda.trim() !== selectedOpcText.trim()) {
                filas[i].style.display = "none";
            } else {
                filas[i].style.display = "";  
            }
        } else {
            
            filas[i].style.display = "none";
        }
    }
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
            if(inpKey === "seccion" || inpKey === "tipo" || inpKey === "medida" || inpKey === "rubro_idrubro"){
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

function listar_material(){
    const listar=document.querySelector("#listar_material");
    
    return fetch(`${URL_APIP}api/listar_material/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        List_Material.length=0;
        List_Material = data;
        listar_material_array();
        
    })
}

function listar_material_array(){

    const listar=document.querySelector("#listar_material");
    //console.log(List_Material);
    let view="",ind=1;
        List_Material.map(lista=>{
            let est = lista.estado == 0 ? `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>` : `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`;
            
            let itemrubro = list_rubro.find(obj => obj.id === lista.rubro_idrubro) || {
                "id": 0,
                "rubro": "-",
                "detalle": "-"
            };
            let itemseccion = list_seccion.find(obj => obj.id === lista.seccion) || {
                "id": 0,
                "nombre_seccion": "Nulo",
                "ubicacion": "Nulo",
                "codigo_seccion": "Nulo"
            };
            let itemTipo = list_tipoM.find(item => item.id === lista.tipo);
            let itemMedida = list_medida.find(dat => dat.id === lista.medida);
          
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
                <td data-type="${lista.id},codigo,${uk[0].empresa.idempresa}">${lista.codigo}</td>
                <td data-type="${lista.id},medida,${uk[0].empresa.idempresa}">${itemMedida.nombre} </td>
                <td data-type="${lista.id},tipo,${uk[0].empresa.idempresa}">${itemTipo.nombre}</td>
                <td>
                    <a data-id="editar_estado,${lista.id},${uk[0].empresa.idempresa}"  class="btn">
                        ${est}
                    </a>
                </td>
                <td data-type="${lista.id},seccion,${uk[0].empresa.idempresa}">${itemseccion.nombre_seccion} ${itemseccion.codigo_seccion}</td>
                <td data-type="${lista.id},rubro_idrubro,${uk[0].empresa.idempresa}">${itemrubro.rubro}</td>
                <td>${lista.fecha}</td>
                <td>${lista.hora}</td>
                <td>
                    <a data-id="editar_material,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_material,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger">
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
    const selectItems = document.querySelector(`#rubro_idrubro${codigo}`);
    const selectedValue = selectItems.value;
    dato.append('rubro_idrubro',selectedValue);
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
