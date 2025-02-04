import { agrupar_etapas_produccionf } from "./agrupar_etapa_produccion.js";
import { URL_APIP } from "../../../../lib/services.js";
import { listar_rubro } from "../funciones/listar.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let codigo_producto;
let productos = [];
let list_rubro=[];
let list_seccion =[];
let list_unidadTiempo = [];
let Lista_Etapas_Produccion = [];

let obt_etapas_produccion_aux ={
    "idetapas_produccion": 0,
    "nombre_etapa": "-",
    "detalle": "-",
    "tiempo_finalizacion": 0,
    "Unidad_tiempo_idUnidad_tiempo": 0,
    "seccion_idseccion": 0,
    "tipo": 0,
    "despues_de": 0,
    "principal": 0,
    "rubro_idrubro": 0
};
export function etapas_produccion_config(code, List_Producto) {
    app=document.querySelector(`#content-area${code}`);
    codigo_producto = code;
    productos = List_Producto;
    sitio();
    
}

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "etapas_produccion";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    switch (funcion) {
        case "eliminar_etapa_produccion":
            

            eliminar_etapa_produccion(id1,id2);
            break;
        case "editar_etapa_produccion":
            toggleEditSave(event);
            break;
        case "agrupar_etapas_produccion":
            agrupar_etapas_produccion(id1);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}
function agrupar_etapas_produccion(id1){
    const ObjetoSelect = Lista_Etapas_Produccion.find(obj => obj.idetapas_produccion === Number(id1));

    let containerOpen = document.getElementById(`Agrupar_grupos`);
    containerOpen.style.display = 'block';
    let containerClosed = document.getElementById(`principal${codigo}`);
    containerClosed.style.display = 'none';
    agrupar_etapas_produccionf(ObjetoSelect,productos,codigo);
}

function toggleEditSave(event) {
    
    const permisos = [1, 2, 3, 4, 5];
    const names = ["nombre_etapa", "detalle", "seccion_idseccion","tiempo_finalizacion","Unidad_tiempo_idUnidad_tiempo"];
    
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    

    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    const ObjetoSelect = Lista_Etapas_Produccion.find(obj => obj.idetapas_produccion === Number(id1));
    console.log(ObjetoSelect);

    const ObjetoSelectc = { ...ObjetoSelect };
    let originalValues = {};

    console.log(funcion, id1,id2);

    if (boton.innerHTML.includes('bi-pencil-square')) {
        // Modo Editar
        let firstInput;
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const valorOriginal = celda.textContent.trim();
                originalValues[index] = valorOriginal;

                let input;
                if (index === 3 || index === 5 ) {
                    
                    input = createSelectElement(names[permisos.indexOf(index)]); // Crear el elemento select correctamente
                    if (input) {
                        celda.innerHTML = '';
                        //input.style.width = '150px'
                        input.value = ObjetoSelect[names[permisos.indexOf(index)]];

                        celda.appendChild(input);
                    } else {
                        console.error(`No se encontró el elemento con id #${names[index]}`);
                        return;
                    }
                } else {
                    
                    if(index === 4){
                        input = document.createElement('input');
                        input.id = `ediinp${codigo}`;
                        input.className = "form-control";
                        input.type = "number";
                        input.step="0.01"
                        //input.style.width = '150px'
                        input.value = valorOriginal;
                        celda.innerHTML = '';
                        celda.appendChild(input);
                    }else{
                        input = document.createElement('input');
                        input.id = `ediinp${codigo}`;
                        input.className = "form-control";

                        input.type = "text";
                       // input.style.width = '150px'
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

          
            ObjetoSelect[names[0]] = datosnuevos[0];
            ObjetoSelect[names[1]] = datosnuevos[1];
            ObjetoSelect[names[2]] = datosnuevos[2];
            ObjetoSelect[names[3]] = datosnuevos[3];
            ObjetoSelect[names[4]] = datosnuevos[4];
            console.log(ObjetoSelect);
            if (ObjetoSelect) {
                Object.assign(Lista_Etapas_Produccion, ObjetoSelect);
            }
            console.log(ObjetoSelect);
            console.log(ObjetoSelectc);
            console.log(areObjectsEqual(ObjetoSelect, ObjetoSelectc));
            if (!areObjectsEqual(ObjetoSelect, ObjetoSelectc)) {
                const formData = new FormData();
                formData.append('ver', "editar_etapa_produccion");
                formData.append('empresa', id2);

                Object.entries(ObjetoSelect).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_etapas_produccion_aux = { ...obt_etapas_produccion_aux, ...ObjetoSelectc };
                console.log(obt_etapas_produccion_aux);

                for (let [key, value] of formData.entries()) {
                    console.log(key, value);
                }
                sendformData(event, formData);
            }

            console.log(Lista_Etapas_Produccion);

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

function eliminar_etapa_produccion(id,ids){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/eliminar_etapa_produccion/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            obt_etapas_produccion_aux ={...Lista_Etapas_Produccion.find(obj => obj.idetapas_produccion === Number(id))};

            alertas(data);
            console.log(obt_etapas_produccion_aux);

        })
    }
   
}
function listarseccion(){
    console.log("listo");
    const listar=document.querySelector(`#seccion_idseccion${codigo}`);
    return fetch(`${URL_APIP}/api/listarseccion/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
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
function listarUnidadTiempo(){
    

    return fetch(`${URL_APIP}/api/listar_unidad_tiempo`)
    .then(res=>res.json())
    .then(data=>{
        list_unidadTiempo = data;     

        

    })
}
 
function sitio(){
    let view=`
        <div class="container" id="principal${codigo}">
            <h5 class="text-center mb-4 fw-bold fs-6" >Etapas de producción</h5>
            <form id="formulario_Etapas_Produccion${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                <input type="hidden" name="ver" value="registrar_etapa_produccion">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                <div class="row " >

                    <div class="form-group col-md-3 ">
                        <label for="seccion" class="form-label fw-bold fs-6">Rubro</label>
                        <select class="form-select" id="rubro${codigo}" name="rubro_idrubro">
                                <option value="0">Prueba1</option>
                                <option value="1">Prueba2</option> 
                        </select>
                    </div>
                    <div class="form-group col-md-3">
                        <label for="" class="form-label fw-bold fs-6">tipo</label>
                        <select class="form-select" id="tipo${codigo}" name="tipo">
                                <option value="0">Principal</option>
                                <option value="1">Sub_etapa</option>
                        </select>
                    </div>
                    <div class="form-group col-md-3">
                        <label for="" class="form-label fw-bold fs-6">Etapas principales</label>
                        <select class="form-select" id="principales${codigo}" name="principal">
                            <option value="0"></option>
   
                        </select>
                    </div>
                    <div class="form-group col-md-3">
                        <label for="" class="form-label fw-bold fs-6">Despue de </label>
                        <select class="form-select" id="despues_de${codigo}" name="despues_de">
                            <option value="0"></option>

                        </select>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="nombre_etapa">Nombre de Etapa</label>
                            <input type="text" class="form-control" id="nombre_etapa" name="nombre_etapa" placeholder="Ingrese el nombre de la etapa">
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="form-group">
                            <label for="detalle">Detalle</label>
                            <textarea class="form-control" id="detalle" name="detalle" rows="3" placeholder="Ingrese el detalle de la etapa"></textarea>
                        </div>
                    </div>
                </div>   
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="seccion_idseccion">Sección</label>
                            <select class="form-select" id="seccion_idseccion${codigo}" name="seccion_idseccion">                        
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="tiempo_finalizacion" class="form-label">Tiempo finalización</label>
                            <input type="number" step="0.01" class="form-control" id="tiempo_finalizacion" name="tiempo_finalizacion" >
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                           <label for="Unidad_tiempo_idUnidad_tiempo" class="form-label">Unidad de Tiempo</label>
                            <select class="form-select" id="Unidad_tiempo_idUnidad_tiempo${codigo}" name="Unidad_tiempo_idUnidad_tiempo">
                                <option value="1" >Segundos</option>
                                <option value="2" >Minutos</option>
                                <option value="3" >Horas</option>
                                <option value="4" >Días</option>
                                <option value="5" >Semanas</option>
                                <option value="6" >Meses</option>
                                <option value="7" >Años</option>
                            </select>
                        </div>
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
                            <th scope="col">Etapa Produccion</th>
                            <th scope="col">Detalle</th>
                            <th scope="col">Seccion</th>
                            <th scope="col">Tiempo de finalizacion</th>
                            <th scope="col">Unidad de tiempo</th>
                             <th scope="col">Rubro</th>
                            <th scope="col">Tipo Etapa</th>
                            <th scope="col">Principal</th>
                            <th scope="col">Despues de</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_etapas_produccion${codigo}">              
                    </tbody>
                </table>
            </div>
        </div>
        <div id="Agrupar_grupos"></div>
    `;
    app.innerHTML=view;
    listarseccion()
    .then(()=> listarUnidadTiempo())
    .then(()=> {
        listar_etapas_produccion();
        listar_rubros();
        const forme = document.querySelector(`#formulario_Etapas_Produccion${codigo}`);
        forme.addEventListener("submit", (e) => sendform(e, forme));
        const cancelarBtn = document.getElementById(`cancelarBtn${codigo}`);
        cancelarBtn.addEventListener('click', () => {
            forme.reset();
        });


        const selectItems = document.querySelector(`#tipo${codigo}`);

        selectItems.addEventListener("change", function() {
            obtenerPrincipales(selectItems);
        });
        
        const selectItemUltimo = document.querySelector(`#principales${codigo}`);

        selectItemUltimo.addEventListener("change", function() {
            obtenerUltimo_sub_etapa(selectItemUltimo);
        });
        const table = document.getElementById(`editableTable${codigo}`);
        table.addEventListener("dblclick",(e) => edit_Celda_table(e,table));
        const input = document.getElementById(`filtro${codigo}`);
        input.addEventListener("keyup",(e)=> filtrar_table(e,input));
        const toggleButton = document.getElementById(`toggleButton${codigo}`);
        toggleButton.addEventListener("click", (e) => mostrarformulario_Etapas_Produccion(toggleButton));


        
    })
    .catch(error => {
        console.error('Error en la cadena de promesas:', error);
    });
   
  
}
function obtenerUltimo_sub_etapa(selectItems){

    const selectedValue = selectItems.value;
        console.log(Lista_Etapas_Produccion);
        console.log(selectedValue);
        const etapasFiltradas = Lista_Etapas_Produccion.filter(etapa => 
            etapa.tipo === 1 &&  etapa.principal === Number(selectedValue)
        );
        console.log(etapasFiltradas);
    mostrar_sugunadrias_array(etapasFiltradas);
    
}
function obtenerPrincipales(selectItems){

    const selectedValue = selectItems.value; 
   
    console.log(selectedValue);
    if(selectedValue === "1"){
        console.log(Lista_Etapas_Produccion);
        const etapasFiltradas = Lista_Etapas_Produccion.filter(etapa => 
            etapa.tipo === 0 && etapa.despues_de === 0 && etapa.principal === 0
        );
        console.log(etapasFiltradas);
        mostrar_principales_array(etapasFiltradas);
    }else{
        const list_one=document.querySelector(`#despues_de${codigo}`);
        const list_two=document.querySelector(`#principales${codigo}`);
        list_one.innerHTML ='<option value="0"></option>';
        list_two.innerHTML='<option value="0"></option>';
    }

}
function mostrar_sugunadrias_array(Lista_Select){
    const listar=document.querySelector(`#despues_de${codigo}`);
        
        let view=`<option value="0" >Ninguno</option>`,ind=1;
        Lista_Select.map(lista=>{
                
            view+=`
                <option value="${lista.idetapas_produccion}">${lista.nombre_etapa}</option>
            `;
        })
        listar.innerHTML=view;
}
function mostrar_principales_array(Lista_Select){
    const listar=document.querySelector(`#principales${codigo}`);

    
        
        let view=`<option value="" disabled selected>Seleccione un item</option>`,ind=1;
        Lista_Select.map(lista=>{
                
            view+=`
                <option value="${lista.idetapas_produccion}">${lista.nombre_etapa}</option>
            `;
        })
        listar.innerHTML=view;
    
}
function listar_rubros(){
    const listar=document.querySelector(`#rubro${codigo}`);

    listar_rubro(uk[0].empresa.idempresa).then(data => {
        list_rubro = data;
        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
                <option value="${lista.id}">${lista.rubro}</option>
            `;
        })
        listar.innerHTML=view;
    });
}
function mostrarformulario_Etapas_Produccion(toggleButton){
    const myForm = document.querySelector(`#formulario_Etapas_Produccion${codigo}`);

    if (myForm.style.display === "none" || myForm.style.height === "0px") {
        myForm.style.display = "block";
        setTimeout(() => {
            myForm.style.height = myForm.scrollHeight + "px";
            myForm.style.opacity = 1;
        }, 10);  
        toggleButton.innerHTML = '<i class="bi bi-dash-lg danger"></i>';
    } else {
        myForm.style.height = "0";
        myForm.style.opacity = 0;
        setTimeout(() => {
            myForm.style.display = "none";
        }, 500);  
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
    const producto_obj = Lista_Etapas_Produccion.find(obj => obj.idetapas_produccion === Number(inpId));
    if (!producto_obj) {
        console.error(`Product with id ${inpId} not found`);
        return;
    }
    const confirm = { ...producto_obj };
    console.log(confirm);
    let input;
    const isSelect = ["seccion_idseccion","Unidad_tiempo_idUnidad_tiempo"].includes(inpKey);

    if (isSelect) {
        input = createSelectElement(inpKey);
        if (!input) {
            alertas(["info", `No se encontró el elemento con id #${inpKey}${codigo}`]);
            return;
        }
       // input.style.width = "150px";
        input.value = producto_obj[inpKey];
    } else {
        const inputType = ["detalle", "nombre_etapa"].includes(inpKey) ? "text" : "number";
        input = document.createElement("input");
        input.type = inputType;
        input.value = originalValue;
        input.className = "form-control";
        //input.style.width = "150px";
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
        producto_obj[inpKey] = aux;
        target.textContent = isSelect ? input.options[input.selectedIndex].text : newValue;

        if (!areObjectsEqual(producto_obj, confirm)) {
            const formData = new FormData();
            formData.append('ver', "editar_etapa_produccion");
            formData.append('empresa',uk[0].empresa.idempresa );
            Object.entries(producto_obj).forEach(([key, value]) => formData.append(key, value));
            obt_etapas_produccion_aux = { ...obt_etapas_produccion_aux, ...confirm };
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
function listar_etapas_produccion(){
    
    fetch(`${URL_APIP}/api/listar_etapas_produccion/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        
        Lista_Etapas_Produccion = data;     
        listar_etapas_produccionArray();
        
        
    })
}
function listar_etapas_produccionArray(){
    console.log(Lista_Etapas_Produccion);
    const mon=document.querySelector(`#listar_etapas_produccion${codigo}`);
    let view="",ind=1;
        Lista_Etapas_Produccion.map(lista=>{
            console.log(list_seccion);
            let itemseccion = list_seccion.find(obj => obj.id === lista.seccion_idseccion) || {
                "id": 0,
                "nombre_seccion": "-",
                "ubicacion": "-",
                "codigo_seccion": "-"
            };
            let itemunidadTiempo = list_unidadTiempo.find(obj => obj.id === lista.Unidad_tiempo_idUnidad_tiempo) || {
                "id": 0,
                "unidad": "-"
            };
            let itemrubro = list_rubro.find(obj => obj.id === lista.rubro_idrubro) || {
                "id": 0,
                "rubro": "-",
                "detalle": "-"
            };
            let typeEtapa = lista.tipo === 0 ? 'principal': 'Sub etapa';
            let principalEtapa = Lista_Etapas_Produccion.find(obj => obj.idetapas_produccion === lista.principal) ||{
                "idetapas_produccion": 0,
                "nombre_etapa": "-",
                "detalle": "-",
                "tiempo_finalizacion": 0,
                "Unidad_tiempo_idUnidad_tiempo": 0,
                "seccion_idseccion": 0,
                "tipo": 0,
                "despues_de": 0,
                "principal": 0,
                "rubro_idrubro": 0
            }
            let item_despues_de = Lista_Etapas_Produccion.find(obj => obj.idetapas_produccion === lista.despues_de) ||{
                "idetapas_produccion": 0,
                "nombre_etapa": "-",
                "detalle": "-",
                "tiempo_finalizacion": 0,
                "Unidad_tiempo_idUnidad_tiempo": 0,
                "seccion_idseccion": 0,
                "tipo": 0,
                "despues_de": 0,
                "principal": 0,
                "rubro_idrubro": 0
            }
            console.log(itemseccion);
           
            view+=`
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.idetapas_produccion},nombre_etapa,${uk[0].empresa.idempresa}">${lista.nombre_etapa}</td>
                <td data-type="${lista.idetapas_produccion},detalle,${uk[0].empresa.idempresa}">${lista.detalle}</td>
                 <td data-type="${lista.idetapas_produccion},seccion_idseccion,${uk[0].empresa.idempresa}">${itemseccion.nombre_seccion} ${itemseccion.codigo_seccion}</td>
                <td data-type="${lista.idetapas_produccion},tiempo_finalizacion,${uk[0].empresa.idempresa}">${lista.tiempo_finalizacion || '-'}</td>
                <td data-type="${lista.idetapas_produccion},Unidad_tiempo_idUnidad_tiempo,${uk[0].empresa.idempresa}">${itemunidadTiempo.unidad}</td>
                <td >${itemrubro.rubro}</td>

                <td >${typeEtapa}</td>
                <td >${principalEtapa.nombre_etapa}</td>
                <td >${item_despues_de.nombre_etapa}</td>

                <td>
                    <a data-id="editar_etapa_produccion,${lista.idetapas_produccion},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_etapa_produccion,${lista.idetapas_produccion},${uk[0].empresa.idempresa}" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </a> 
                    <a data-id="agrupar_etapas_produccion,${lista.idetapas_produccion},${uk[0].empresa.idempresa}" class="btn btn-warning">
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

    fetch(`${URL_APIP}/api/`, { // Reemplaza esto con la URL de tu servidor
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
        for (let [key, value] of dato.entries()) {
            console.log(key, value);
        }
        fetch(`${URL_APIP}/api/`,{
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

        // Resetear el formulario_Etapas_Produccion si existe
        let formulario_Etapas_Produccion = document.querySelector(`#formulario_Etapas_Produccion${codigo}`);
        if (formulario_Etapas_Produccion) {
            formulario_Etapas_Produccion.reset();
        }
        if(data[2]==="registrar_etapa_produccion"){
            listar_etapas_produccion();

        }
        if(data[2]==="eliminar_etapa_produccion"){
            console.log(Lista_Etapas_Produccion);

            console.log(obt_etapas_produccion_aux);
            Lista_Etapas_Produccion = Lista_Etapas_Produccion.filter(obj => obj.idetapas_produccion !== Number(obt_etapas_produccion_aux['idetapas_produccion']));
            console.log(Lista_Etapas_Produccion);
            listar_etapas_produccionArray();
            obt_etapas_produccion_aux = { ...{ 
                "idetapas_produccion": 0,
                "nombre_etapa": "",
                "detalle": "",
                "tiempo_finalizacion": 0,
                "Unidad_tiempo_idUnidad_tiempo": 0,
                "seccion_idseccion": 0
             } };

        }
        if(data[2]==="editar_etapa_produccion"){
            obt_etapas_produccion_aux = { ...{ 
                "idetapas_produccion": 0,
                "nombre_etapa": "",
                "detalle": "",
                "tiempo_finalizacion": 0,
                "Unidad_tiempo_idUnidad_tiempo": 0,
                "seccion_idseccion": 0
             } };

        }
        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="editar_etapa_produccion"){
                const obj = Lista_Etapas_Produccion.find(ob => ob.idetapas_produccion === obt_etapas_produccion_aux['idetapas_produccion']);

                console.log(obt_etapas_produccion_aux);

                console.log(obj);
                if (obt_etapas_produccion_aux) {
                    Object.assign(obj, obt_etapas_produccion_aux);
                }
                console.log(obt_etapas_produccion_aux);

                console.log(obj);
                console.log(Lista_Etapas_Produccion);
                listar_etapas_produccionArray();
                obt_etapas_produccion_aux = { ...{ 
                    "idetapas_produccion": 0,
                    "nombre_etapa": "",
                    "detalle": "",
                    "tiempo_finalizacion": 0,
                    "Unidad_tiempo_idUnidad_tiempo": 0,
                    "seccion_idseccion": 0} };

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