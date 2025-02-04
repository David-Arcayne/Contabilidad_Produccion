let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let List_medida =[];
let obt_medida_aux = {
    "id" : 0,
    "nombre" : "",
    "sigla" : ""
};
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "medidas";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function medidasconfig(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();        
}
// console.log(app);
function menumedidas(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, ids] = dataid.split(',');
    const forme = document.querySelector(`#formulario${codigo}`);
    switch (funcion) {
        case "eliminarmedida":        

        eliminarmedida(id1,ids,forme);
            break;
        case "editar_Medida":
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
    const objMedida = List_medida.find(obj => obj.id === Number(id1));
    const objMedidac = {...List_medida.find(obj => obj.id === Number(id1))};

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
                        linea *=true;
                    }else{
                        linea *=false;
                    }
                }
            }
        });
        if(linea){
            objMedida['nombre'] = datosnuevos[0];
            objMedida['sigla'] = datosnuevos[1];
            if (objMedida) {
                Object.assign(List_medida, objMedida);
            }
    
            if (!areObjectsEqual(objMedida, objMedidac)) {
                const formData = new FormData();
                formData.append('ver', "editar_Medida");
                formData.append('id', id1);
                formData.append('empresa', id2);
                Object.entries(objMedida).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_medida_aux = { ...obt_medida_aux, ...objMedidac };
                sendformData(event, formData);
            }
    
            console.log(List_medida);
    
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
function eliminarmedida(id,ids){
    

    if(confirm("Desea Eliminar..?")){
        fetch(`./api/eliminarmedida/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            obt_medida_aux ={...List_medida.find(obj => obj.id === Number(id))};

            alertas(data);

            console.log(obt_medida_aux);
        })
    }
   
}


function sitio(){
    let view=`
        <div class="container">
            <h2 class="text-center">Medidas</h2>

            <form id="formulario${codigo}">
                <input type="hidden" name="ver" value="registroMedidas">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">

                <div class="row">
                    <div class="col-md-6">
                        <label for="nombre">Nombre medida:</label>
                        <input type="text" class="form-control" id="nombre" placeholder="Pie" name="nombre" required>
                    </div>
                    <div class="col-md-6">
                        <label for="sigla">Sigla</label>
                        <input type="text" class="form-control" id="sigla" placeholder="Ft" name="sigla" required>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="agre" href="#">Guardar</button>
                <button type="submit" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn${codigo}" aria-label="Cancelar">Cancelar</button>

                
            
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
                            <th scope="col">Medida</th>
                            <th scope="col">Sigla</th>
                            <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    

                    <tbody id="listamedidas">
                    </tbody>
                </table>
            </div>
        </div>
    `;
    app.innerHTML=view;

    listamedidas();
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


    // let searchInput = document.getElementById("buscarclientes");
// searchInput.addEventListener("input", buscarclientes);
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
function edit_Celda_table(e){
    const target = e.target;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            const [inpId,inpKey,id2] = dataType.split(',');            
            let medida_obj = List_medida.find(obj => obj.id === Number(inpId));
            const confirm ={...List_medida.find(obj => obj.id === Number(inpId))};

            console.log(confirm);
            target.classList.add("editing");
            target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

            const input = target.querySelector("input");
            input.focus();


            input.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    
                    target.classList.remove("editing");

                    
                    target.textContent = input.value || originalValue;
                    Object.entries(medida_obj).forEach(([key, value]) => {
                        if(key === inpKey){
                            medida_obj[key] = target.textContent;
                        }
                    });
                    console.log(List_medida);
                    if (medida_obj) {
                        Object.assign(List_medida, medida_obj);
                    }
                    console.log(List_medida);
                    console.log(areObjectsEqual(medida_obj,confirm));
                    if(!areObjectsEqual(medida_obj,confirm)){
                        const formData = new FormData();
                        formData.append('ver', "editar_Medida");
                        formData.append('id', inpId);
                        formData.append('empresa', id2);
                        Object.entries(medida_obj).forEach(([key, value]) => {
                            formData.append(key,value);
                        });
                        obt_medida_aux = { ...obt_medida_aux, ...confirm };

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
function listamedidas(){
    
    fetch(`./api/listamedidas/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        List_medida.length = 0;
        List_medida = data;
        console.log(data);
        listamedidasArray();
        
    })
}
function listamedidasArray(){
    const medida=document.querySelector("#listamedidas");
    let resu="", indice=1;
    List_medida.map(lista=>{
        resu+=`
        <tr>
        <td>${indice++}</td>
            <td data-type="${lista.id},nombre,${uk[0].empresa.idempresa}">${lista.nombre}</td>
            <td data-type="${lista.id},sigla,${uk[0].empresa.idempresa}">${lista.sigla}</td>
            <td>
                <a data-id="editar_Medida,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm">
                    <i class="bi bi-pencil-square"></i>
                </a>    
                <a data-id="eliminarmedida,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger">
                    <i class="bi bi-trash"></i>
                </a>                          
            </td>
        </tr>`;
    })
    medida.innerHTML=resu;

    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menumedidas);
    });
}



  


function sendform(e,form){
    e.preventDefault();
    console.log(form);
    const dato=new FormData(form);
    fetch(`./api/`,{
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
            if(data[2]==="registroMedidas"){
                listamedidas();

            }
            if(data[2]==="eliminarmedida"){
                console.log(List_medida);
                console.log(obt_medida_aux);

                List_medida = List_medida.filter(obj => obj.id !== Number(obt_medida_aux['id']));
                console.log(List_medida);

                listamedidasArray();
                obt_medida_aux = { ...{ id: 0, nombre: "", sigla: "" } };

            }
            if(data[2]==="editar_Medida"){
                obt_medida_aux = { ...{ id: 0, nombre: "", sigla: "" } };

            }

            
        } else {
            if(data[0] == "Error"){

                if(data[2]==="editar_Medida"){
                    const obj = List_medida.find(ob => ob.id === obt_medida_aux['id']);

                    console.log(obt_medida_aux);

                    console.log(obj);
                    if (obt_medida_aux) {
                        Object.assign(obj, obt_medida_aux);
                    }
                    console.log(obt_medida_aux);

                    console.log(obj);
                    console.log(List_medida);
                    listamedidasArray();
                    obt_medida_aux = { ...{ id: 0, nombre: "", sigla: "" } };

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