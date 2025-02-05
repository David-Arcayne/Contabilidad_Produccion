import { URL_APIP } from "../../../../lib/services.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let List_area = [];
let materialArray = [];
let proveedorArray = [];
let Lista_Proveedor= [];
let Lista_ProvMat=[];
let obt_proveedor_aux = {
    "id" : 0,
    "nombre" : "",
    "codigo" : "",
    "nit" : "",
    "detalle" : "",
    "direccion" : "",
    "telefono" : "",
    "mobil" : "",
    "email" : "",
    "web" : "",
    "pais" : "",
    "ciudad" : "",
    "zona" : "",
    "contacto" : "",
};
let obt_proveedorMaterial_aux = {
    "proveedor" : "",
    "material" : "",
};
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "proveedor";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function proveedoresConfig(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
    
}

function menudivisas(event){
    console.log(Lista_Proveedor);
    console.log(Lista_ProvMat);
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    console.log(id1);
    switch (funcion) {
        case "eliminar_proveedor":
        eliminar_proveedor(id1,id2);
            break;
        case "eliminar_proveedor_material":
        eliminar_proveedor_material(id1,id2);    
            break;
        case "editar_Proveedor":
            console.log(id1);
            toggleEditSave(event);
            break;
        case "editar_proveedor_material":
            console.log(id1);
            toggleEditSaveProvMat(event);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}

function eliminar_proveedor(id,ids){
    console.log(Lista_Proveedor);
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/eliminar_proveedor/${id}/${ids}`, {
            // method: 'GET', // Cambia el método si es necesario
            headers: {
                // 'Content-Type': 'application/json',
                'Usar-Listado-David': 'true' // Aquí envías el valor en el encabezado
            }
        })
        .then(res=> res.json())
        .then(data=>{
            console.log(Lista_Proveedor);
            obt_proveedor_aux ={...Lista_Proveedor.find(obj => obj.id === Number(id))};

            alertas(data);
            
        })
    }
   
}
function eliminar_proveedor_material(id,ids){
    console.log(Lista_ProvMat);
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/eliminar_proveedor_material/${id}/${ids}`, {
            // method: 'GET', // Cambia el método si es necesario
            headers: {
                // 'Content-Type': 'application/json',
                'Usar-Listado-David': 'true' // Aquí envías el valor en el encabezado
            }
        })
        .then(res=> res.json())
        .then(data=>{
            console.log(Lista_ProvMat);
            obt_proveedorMaterial_aux ={...Lista_ProvMat.find(obj => obj.id === Number(id))};

            alertas(data);
            
        })
    }
   
}
function listarMaterialSelect(){
    console.log("listo material");

    const listar=document.querySelector(`#material${codigo}`);
    return fetch(`${URL_APIP}api/listar_material/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        materialArray.length = 0;
        materialArray = data;     
        console.log(materialArray);
        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
            <div data-value="${lista.id}">${lista.nombre}</div>
                
            `;
        })
        listar.innerHTML=view;
        console.log("lista material completa");

    })
    // <option value="${lista.id}">${lista.nombre} </option>
}
function listarProveedorSelect(){
    console.log("listo proveedor seleccionable ");

    const listar=document.querySelector(`#proveedor${codigo}`);
    return   fetch(`${URL_APIP}api/listarProveedor/${uk[0].empresa.idempresa}`, {
        headers: {
            'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
        }
    })
    // fetch(`./api/listarProveedor/${uk[0].empresa.idempresa}`)
    
    .then(res=>res.json())
    .then(data=>{
        materialArray.length = 0;
        materialArray = data;     
        console.log("entre al data");
        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
                <option value="${lista.id}">${lista.nombre} </option>
            `;
        })
        listar.innerHTML=view;
        console.log("lista proveedor completa");

    })
}
function listarProveedorVista(){
    const listar = document.querySelector("#contenedorProveedor");
    let view = ` <h2 class="text-center">Proveedores</h2>

            <form id="formulario${codigo}" >

                <input type="hidden" name="ver" value="registroProveedor">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="nombre_proveedor" class="form-label">Nombre Proveedor:</label>
                        <input type="text" class="form-control" id="nombre_proveedor" name="nombre_proveedor" required>
                    </div>
                      <div class="col-md-4">
                        <label for="codigo" class="form-label">Codigo:</label>
                        <input type="text" class="form-control" id="codigo" name="codigo" required>
                    </div>
                    <div class="col-md-4">
                        <label for="nit" class="form-label">Nit:</label>
                        <input type="text" class="form-control" id="nit" name="nit" required>
                    </div>
                      <div class="col-md-4">
                        <label for="detalle" class="form-label">Detalle:</label>
                        <input type="text" class="form-control" id="detalle" name="detalle" required>
                    </div>
                    <div class="col-md-4">
                        <label for="direccion" class="form-label">Direccion:</label>
                        <input type="text" class="form-control" id="direccion" name="direccion" required>
                    </div>
                    <div class="col-md-4">
                        <label for="telefono" class="form-label">Telefono:</label>
                        <input type="number" class="form-control" id="telefono" name="telefono" required>
                    </div>
                    <div class="col-md-4">
                        <label for="mobil" class="form-label">Mobil:</label>
                        <input type="number" class="form-control" id="mobil" name="mobil" required>
                    </div>
                    <div class="col-md-4">
                        <label for="email" class="form-label">Email:</label>
                        <input type="text" class="form-control" id="email" name="email" required>
                    </div>
                    <div class="col-md-4">
                        <label for="web" class="form-label">Web:</label>
                        <input type="text" class="form-control" id="web" name="web" required>
                    </div>
                    <div class="col-md-4">
                        <label for="pais" class="form-label">Pais:</label>
                        <input type="text" class="form-control" id="pais" name="pais" required>
                    </div>
                    <div class="col-md-4">
                        <label for="ciudad" class="form-label">Ciudad:</label>
                        <input type="text" class="form-control" id="ciudad" name="ciudad" required>
                    </div>
                    <div class="col-md-4">
                        <label for="zona" class="form-label">Zona:</label>
                        <input type="text" class="form-control" id="zona" name="zona" required>
                    </div>
                      <div class="col-md-4">
                        <label for="contacto" class="form-label">Contacto:</label>
                        <input type="text" class="form-control" id="contacto" name="contacto" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
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
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Codigo</th>
                            <th>Nit</th>
                            <th>Detalle</th>
                            <th>Direccion</th>
                            <th>Telefono</th>
                            <th>Mobil</th>
                            <th>Email</th>
                            <th>Web</th>
                            <th>Pais</th>
                            <th>Ciudad</th>
                            <th>Zona</th>
                            <th>Contacto</th>
                            <th>Funciones</th>   
                            
                        </tr>
                    </thead>
                    <tbody id="listaproveedor">
                        
                    </tbody>
                </table>
            </div>`
            listar.innerHTML = view;

}

function listarProveedorMaterial() {
    const listar = document.querySelector("#formProveedorMaterial");
    let view = `<h2 class="text-center">Generar Proveedor Material</h2>
    <form id="formularioPM${codigo}">
        <input type="hidden" name="ver" value="registrar_proveedor_material">
        <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label for="proveedor">Seleccione un Proveedor</label>
                    <select class="form-select" id="proveedor${codigo}" name="proveedor"> </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="material">Seleccione un Material</label>
                    <div class="select-box" id="selectBox">Seleccione material <span>▼</span></div>
                    <div class="select-options" id="material${codigo}"> </div>
                    <input type="hidden" id="selectedMaterials" name="material">
                    <div id="selection-info">0 materiales seleccionados</div>
                </div>
            </div>
            <div class="col-auto ms-auto">
                <br><br>
                <button class="btn btn-success mt-4" type="" style="float: right; font-size: 1.5rem;">
    <i class="bi bi-plus fs-2"> Añadir</i>
</button>
            </div>
        </div>
    </form>
    <div id="alerta" class="mt-4"></div>
    <table class="table table-hover" id="editableTableProvMat${codigo}">
        <thead>
            <tr class="table-dark">
                <th scope="col">N°</th>
                <th scope="col">Proveedor</th>
                <th scope="col">Material envases</th>
                <th scope="col">Funciones</th>
            </tr>
        </thead>
        <tbody id="listaProveedorMaterial"></tbody>
    </table>`;

    listar.innerHTML = view;

    const table = document.getElementById(`editableTableProvMat${codigo}`);
    table.addEventListener("dblclick", (e) => edit_Celda_table_Prov_Mat(e));

    const selectBox = document.getElementById('selectBox');
    const selectOptions = document.getElementById(`material${codigo}`);
    const selectionInfo = document.getElementById('selection-info');
    const hiddenInput = document.getElementById('selectedMaterials');
    let selectedValues = [];

    // Mostrar/ocultar la lista de opciones
    selectBox.addEventListener('click', function() {
        selectOptions.style.display = selectOptions.style.display === 'block' ? 'none' : 'block';
    });

    // Selección de opciones
    selectOptions.addEventListener('click', function(event) {
        const clickedOption = event.target;

        if (clickedOption.tagName === 'DIV') {
            const optionValue = clickedOption.getAttribute('data-value');
            const optionIndex = selectedValues.indexOf(optionValue);

            // Alternar selección
            if (optionIndex === -1) {
                selectedValues.push(optionValue);
                clickedOption.classList.add('selected');
            } else {
                selectedValues.splice(optionIndex, 1);
                clickedOption.classList.remove('selected');
            }
console.log(hiddenInput.value);
            hiddenInput.value = selectedValues.join(','); // Actualiza el input oculto
            updateSelectionInfo();
        }
    });

    // Actualizar el texto de la selección
    function updateSelectionInfo() {
        const totalOptions = document.querySelectorAll(`#material${codigo} div`).length;
        selectionInfo.textContent = `${selectedValues.length} de ${totalOptions} materiales seleccionados`;
    }
    console.log(selectedValues);
    // Cerrar el select si se hace clic fuera
    document.addEventListener('click', function(event) {
        if (!selectBox.contains(event.target) && !selectOptions.contains(event.target)) {
            selectOptions.style.display = 'none';
        }
    });
    const selectopciones = document.querySelector(`#proveedor${codigo}`);
    console.log(selectopciones);
    selectopciones.addEventListener("change", function() {
        // mostrarSeleccion();
        const provvSelect = document.querySelector(`#proveedor${codigo}`).value;
    console.log(provvSelect);
    buscarProveedorPorMaterial(provvSelect);
    });
    // // Manejar el envío del formulario
    // const form = document.getElementById(`formularioPM${codigo}`);
    // form.addEventListener('submit', function(event) {
    //     event.preventDefault(); // Previene el envío inmediato del formulario
    //     // Aquí podrías realizar alguna validación o acción adicional antes de enviar
    //     console.log(hiddenInput.value); // Verifica el valor antes de enviar
    //     // Ahora puedes enviar el formulario utilizando fetch o el método que estés utilizando
    //     // Por ejemplo:
    //     // fetch('tu_api_endpoint', {
    //     //     method: 'POST',
    //     //     body: new FormData(form)
    //     // }).then(response => { /* manejar respuesta */ });
    // });
}
function buscarProveedorPorMaterial(provvSelect){
    const listarr=document.querySelector("#listaProveedorMaterial");
    // fetch(`./api/listarProveedorMaterial/${uk[0].empresa.idempresa}`)
    fetch(`${URL_APIP}api/buscarProveedorPorMaterial/${provvSelect}/${uk[0].empresa.idempresa}`, {
        headers: {
            'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
        }
    })
    .then(res=>res.json())
    .then(data=>{
        // console.log(data);
        // Lista_ProvMat.length =0;
        // Lista_ProvMat = data;
        // listaareasArray();
        let view="",ind=1;
        console.log(data);
         data.map(lista=>{
            let idMaterial = Number(lista.material);
            let idProveedor = Number(lista.proveedor);
            let itemProveedor = proveedorArray.find(obj => obj.id == idProveedor);
            let itemMaterial = materialArray.find(item => item.id === idMaterial);
             view+=`
              <tr>
                 <td>${ind++}</td> 
                 <td data-type="${lista.id_ProveedorMaterial},proveedor,${uk[0].empresa.idempresa}">${itemProveedor.nombre}</td>               
                 <td data-type="${lista.id_ProveedorMaterial},material,${uk[0].empresa.idempresa}">${itemMaterial.nombre} </td>       
                
                <td>
                    <a data-id="editar_proveedor_material,${lista.id_ProveedorMaterial},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_proveedor_material,${lista.id_ProveedorMaterial},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
             </tr>
             `;
         })
        //  console.log(view);
        listarr.innerHTML=view;
 
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
        enlace.addEventListener("click", menudivisas);
        });
        
        
    })
}

function sitio(mostrarContenedor2=true){
    
    let view=`
       <div class="container" id = "contenedorPrincipal">

        <button id="btnMostrarProv" class="btn btn-primary">Proveedores</button>
        <button id="btnMostrarProvMat" class="btn btn-success">Proveedor-Material</button>

        <div class="container mt-3" id="contenedorProveedor">
        </div>
        <div class="container mt-3" id="formProveedorMaterial" style="display: none;">
     
        </div>
    </div>
        
    `;

    app.innerHTML=view;
    listarProveedorVista();
    listarProveedorMaterial();
    listarProveedorBoddy();
     listarProveedorSelect()
    .then(() => listarMaterialSelect())
    .then(() => listarProveedorMaterialBoddy());
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
    
// --------------------------------------------------------------------------------------------
const formePM = document.querySelector(`#formularioPM${codigo}`);
formePM.addEventListener("submit", (e) => registrar_proveedorMaterial(e, formePM));
    // let searchInput = document.getElementById("buscarclientes");
// searchInput.addEventListener("input", buscarclientes);
const btnMostrar1 =document.querySelector("#btnMostrarProv");
const btnMostrar2 =document.querySelector("#btnMostrarProvMat");
const contenedor1 =document.querySelector("#contenedorProveedor");
const contenedor2 =document.querySelector("#formProveedorMaterial");
btnMostrar1.addEventListener('click', () => {
   contenedor1.style.display = 'block';
   contenedor2.style.display = 'none';
});
btnMostrar2.addEventListener('click', () => {
   contenedor1.style.display = 'none';
   contenedor2.style.display = 'block';
});
    const contenedorProveedor =document.querySelector("#contenedorProveedor");
    const formProveedorMaterial =document.querySelector("#formProveedorMaterial");
if (mostrarContenedor2) {
    contenedorProveedor.style.display = 'block';
    formProveedorMaterial.style.display = 'none';
} else {
    contenedorProveedor.style.display = 'none';
    formProveedorMaterial.style.display = 'block';
}
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
function listarProveedorBoddy(){
    const listarr=document.querySelector("#listaproveedor");
    // fetch(`./api/listarProveedor/${uk[0].empresa.idempresa}`)
    fetch(`${URL_APIP}api/listarProveedor/${uk[0].empresa.idempresa}`, {
        headers: {
            'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
        }
    })
    .then(res=>res.json())
    .then(data=>{
        proveedorArray.length = 0;
        proveedorArray = data;     
         console.log(proveedorArray);
        // List_area.length =0;
        // List_area = data;
        // listaareasArray();
        let view="",ind=1;
        console.log(data);
        Lista_Proveedor =0;
        Lista_Proveedor = data;
         data.map(lista=>{
            
             view+=`
              <tr>
                <td >${ind++}</td> 
                 <td data-type="${lista.id},nombre,${uk[0].empresa.idempresa}">${lista.nombre}</td>               
                 <td data-type="${lista.id},codigo,${uk[0].empresa.idempresa}">${lista.codigo}</td>  
                 <td data-type="${lista.id},nit,${uk[0].empresa.idempresa}">${lista.nit} </td>
                 <td data-type="${lista.id},detalle,${uk[0].empresa.idempresa}">${lista.detalle}</td> 
                 <td data-type="${lista.id},direccion,${uk[0].empresa.idempresa}">${lista.direccion}</td> 
                 <td data-type="${lista.id},telefono,${uk[0].empresa.idempresa}">${lista.telefono}</td> 
                 <td data-type="${lista.id},mobil,${uk[0].empresa.idempresa}">${lista.mobil}</td>  
                 <td data-type="${lista.id},email,${uk[0].empresa.idempresa}">${lista.email}</td>  
                 <td data-type="${lista.id},web,${uk[0].empresa.idempresa}">${lista.web}</td> 
                 <td data-type="${lista.id},pais,${uk[0].empresa.idempresa}">${lista.pais}</td>  
                 <td data-type="${lista.id},ciudad,${uk[0].empresa.idempresa}">${lista.ciudad}</td>           
                 <td data-type="${lista.id},zona,${uk[0].empresa.idempresa}">${lista.zona}</td>  
                 <td data-type="${lista.id},contacto,${uk[0].empresa.idempresa}">${lista.contacto}</td>   
                
                <td>
                    <a data-id="editar_Proveedor,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_proveedor,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
             </tr>
             `;
         })
        //  console.log(view);
        listarr.innerHTML=view;
 
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
        enlace.addEventListener("click", menudivisas);
        });
        
        
    })
}
function listarProveedorMaterialBoddy(){
    const listarr=document.querySelector("#listaProveedorMaterial");
    // fetch(`./api/listarProveedorMaterial/${uk[0].empresa.idempresa}`)
    fetch(`${URL_APIP}api/listarProveedorMaterial/${uk[0].empresa.idempresa}`, {
        headers: {
            'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
        }
    })
    .then(res=>res.json())
    .then(data=>{
        // console.log(data);
        Lista_ProvMat.length =0;
        Lista_ProvMat = data;
        // listaareasArray();
        let view="",ind=1;
        console.log(data);
         data.map(lista=>{
            let idMaterial = Number(lista.material);
            let idProveedor = Number(lista.proveedor);
            let itemProveedor = proveedorArray.find(obj => obj.id == idProveedor);
            let itemMaterial = materialArray.find(item => item.id === idMaterial);
             view+=`
              <tr>
                 <td>${ind++}</td> 
                 <td data-type="${lista.id_ProveedorMaterial},proveedor,${uk[0].empresa.idempresa}">${itemProveedor.nombre}</td>               
                 <td data-type="${lista.id_ProveedorMaterial},material,${uk[0].empresa.idempresa}">${itemMaterial.nombre} </td>       
                
                <td>
                    <a data-id="editar_proveedor_material,${lista.id_ProveedorMaterial},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_proveedor_material,${lista.id_ProveedorMaterial},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
             </tr>
             `;
         })
        //  console.log(view);
        listarr.innerHTML=view;
 
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
        enlace.addEventListener("click", menudivisas);
        });
        
        
    })
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
            // console.log(data);
            // alertas(data);

            console.log(data);
            if(data[0]=="success"){
                form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                
                setTimeout(() => {
                    
                    // form.reset();
                    sitio(true);
                }, 2000);
                return;
            }else{
            form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
            setTimeout(() => {
                form.remove();
                sitio(true);
            }, 3000);
            return;
        }
        })
    
}
function registrar_proveedorMaterial(e,form){
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
        // console.log(data);
        // alertas(data);

        console.log(data);
        if(data[0]=="success"){
            form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
            
            setTimeout(() => {
                
                // form.reset();
                sitio(false);
            }, 2000);
            return;
        }else{
        form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
        setTimeout(() => {
            form.remove();
            sitio(false);
        }, 3000);
        return;
    }
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
        timeoutDuration = 2000;

        // Resetear el formulario si existe
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        if(data[2]==="registroarea"){
            listaareas();

        }
        if(data[2]==="eliminar_proveedor"){
            Lista_Proveedor = Lista_Proveedor.filter(obj => obj.id !== Number(obt_proveedor_aux['id']));
            listarProveedorBoddy();
            obt_proveedor_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        if(data[2]==="eliminar_proveedor_material"){
            Lista_ProvMat = Lista_ProvMat.filter(obj => obj.id !== Number(obt_proveedorMaterial_aux['id']));
            listarProveedorMaterialBoddy();
            obt_proveedorMaterial_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        if(data[2]==="editararea"){
            obt_area_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        
    } else {
        if(data[0] == "danger"){
            alertClass = 'alert-danger';
            alertMessage = data[1];
            timeoutDuration = 2000;
            if(data[2]==="editarProveedorMaterial"){
                console.log(Lista_ProvMat);
                console.log(obt_proveedorMaterial_aux);
                const obj = Lista_ProvMat.find(ob => ob.id_ProveedorMaterial === obt_proveedorMaterial_aux['id_ProveedorMaterial']);

                console.log(obt_proveedorMaterial_aux);

                console.log(obj);
                if (obt_proveedorMaterial_aux) {
                    Object.assign(obj, obt_proveedorMaterial_aux);
                }
                console.log(obt_proveedorMaterial_aux);

                console.log(obj);
                console.log(Lista_ProvMat);
                listarProveedorMaterialBoddy();
                obt_proveedorMaterial_aux = { ...{ id_ProveedorMaterial: 0, proveedor: "", material: "" } };

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

function toggleEditSave(event) {
    console.log(Lista_Proveedor);
    const permisos = [1, 2,3,4,5,6,7,8,9,10,11,12,13];
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const objProveedor = Lista_Proveedor.find(obj => obj.id == Number(id1));
    const objProveedorc = {...Lista_Proveedor.find(obj => obj.id == Number(id1))};
console.log(objProveedor);
console.log(objProveedorc);
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
            objProveedor['nombre'] = datosnuevos[0];
            objProveedor['codigo'] = datosnuevos[1];
            objProveedor['nit'] = datosnuevos[2];
            objProveedor['detalle'] = datosnuevos[3];
            objProveedor['direccion'] = datosnuevos[4];
            objProveedor['telefono'] = datosnuevos[5];
            objProveedor['mobil'] = datosnuevos[6];
            objProveedor['email'] = datosnuevos[7];
            objProveedor['web'] = datosnuevos[8];
            objProveedor['pais'] = datosnuevos[9];
            objProveedor['ciudad'] = datosnuevos[10];
            objProveedor['zona'] = datosnuevos[11];
            objProveedor['contacto'] = datosnuevos[12];

            if (objProveedor) {
                Object.assign(Lista_Proveedor, objProveedor);
            }
    
            if (!areObjectsEqual(objProveedor, objProveedorc)) {
                const formData = new FormData();
                formData.append('ver', "editar_Proveedor");
                formData.append('id', id1);
                formData.append('empresa', id2);
                Object.entries(objProveedor).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_proveedor_aux = { ...obt_proveedor_aux, ...objProveedorc };
                sendformData(event, formData);
            }
    
            console.log(Lista_Proveedor);
    
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

function edit_Celda_table(e){
    const target = e.target;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            console.log(dataType);
            const [inpId,inpKey,id2] = dataType.split(',');    
            console.log(inpId,inpKey,id2);        
            let proveedor_obj = Lista_Proveedor.find(obj => obj.id == Number(inpId));
            const confirm ={...Lista_Proveedor.find(obj => obj.id == Number(inpId))};
            console.log(proveedor_obj);
            console.log(confirm);
            target.classList.add("editing");
            target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

            const input = target.querySelector("input");
            input.focus();


            input.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    
                    target.classList.remove("editing");

                    console.log(proveedor_obj);
                    target.textContent = input.value || originalValue;
                    console.log(target.textContent);
                    Object.entries(proveedor_obj).forEach(([key, value]) => {
                        if(key === inpKey){
                            proveedor_obj[key] = target.textContent;
                        }
                    });
                    console.log(Lista_Proveedor);
                    if (proveedor_obj) {
                        Object.assign(Lista_Proveedor, proveedor_obj);
                    }
                    console.log(Lista_Proveedor);
                    console.log(areObjectsEqual(proveedor_obj,confirm));
                    if(!areObjectsEqual(proveedor_obj,confirm)){
                        const formData = new FormData();
                        formData.append('ver', "editar_Proveedor");
                        formData.append('id', inpId);
                        formData.append('empresa', id2);
                        Object.entries(proveedor_obj).forEach(([key, value]) => {
                            formData.append(key,value);
                        });
                        obt_proveedor_aux = { ...obt_proveedor_aux, ...confirm };

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

//-==========================================================================

function toggleEditSaveProvMat(event) {
    
    const permisos = [1, 2];
const names = ["proveedor", "material"];
const boton = event.currentTarget;
const fila = boton.closest("tr");
const celdas = fila.querySelectorAll("td");
const dataid = boton.getAttribute('data-id');
const [funcion, id1, id2] = dataid.split(',');
console.log(Lista_ProvMat);
console.log(id1);
const objProvMat = Lista_ProvMat.find(obj => obj.id_ProveedorMaterial == Number(id1));
console.log(objProvMat);

const objProvMatc = { ...objProvMat };
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
            if (index === 1 || index === 2 ) {
                
                input = createSelectElement(names[permisos.indexOf(index)]); // Crear el elemento select correctamente
                console.log(input);
                if (input) {
                    celda.innerHTML = '';
                    input.value = objProvMat[names[permisos.indexOf(index)]];

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
            console.log(datosnuevos);
            objProvMat['proveedor'] = Number(datosnuevos[0]);
            
            objProvMat['material'] = Number(datosnuevos[1]);
            // objProvMat['area'] = Number(datosnuevos[2]);
            if (objProvMat) {
                Object.assign(Lista_ProvMat, objProvMat);
            }
            console.log(objProvMat);
            console.log(objProvMatc);
            console.log(areObjectsEqual(objProvMat, objProvMatc));
            if (!areObjectsEqual(objProvMat, objProvMatc)) {
                const formData = new FormData();
                formData.append('ver', "editar_proveedor_material");
                formData.append('id', id1);
                formData.append('empresa', id2);
                Object.entries(objProvMat).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_proveedorMaterial_aux = { ...obt_proveedorMaterial_aux, ...objProvMatc };
                console.log(formData);
                sendformData(event, formData);
            }

            console.log(Lista_ProvMat);

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

    boton.removeEventListener("click", toggleEditSaveProvMat);
    boton.addEventListener("click", toggleEditSaveProvMat);
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
function edit_Celda_table_Prov_Mat(e){
    const target = e.target;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            const [inpId,inpKey,id2] = dataType.split(',');    
            console.log(inpId);
            console.log(Lista_ProvMat);        
            let proveedorMaterial_obj = Lista_ProvMat.find(obj => obj.id_ProveedorMaterial == Number(inpId));
            const confirm = { ...proveedorMaterial_obj };             
            let input = null;
            if(inpKey === "proveedor" || inpKey === "material"){
                input = createSelectElement(inpKey);
                if (input) {
                    target.classList.add("editing");
                    target.innerHTML = '';
                    target.appendChild(input);
                    input.focus();
                    console.log(input.value);
                    console.log(inpKey);
                    console.log(proveedorMaterial_obj);
                    input.value = proveedorMaterial_obj[inpKey];
                    console.log(input.value);
                    
                } else {
                    alertas(["info",`No se encontró el elemento con id #${inpKey}${codigo}`]);
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
                        
                        console.log(aux);
                        console.log(proveedorMaterial_obj);
                        Object.entries(proveedorMaterial_obj).forEach(([key, value]) => {
                            if(key === inpKey){
                                proveedorMaterial_obj[key] = aux ;
                            }
                        });
                        if (proveedorMaterial_obj) {
                            Object.assign(Lista_ProvMat, proveedorMaterial_obj);
                        }
                        console.log(Lista_ProvMat);
                        console.log(proveedorMaterial_obj);
                        console.log(confirm);
                        console.log(areObjectsEqual(proveedorMaterial_obj,confirm));
                        if(!areObjectsEqual(proveedorMaterial_obj,confirm)){
                            const formData = new FormData();
                            formData.append('ver', "editar_proveedor_material");
                            formData.append('empresa', id2);
                            // formData.append('id', id1);
                            Object.entries(proveedorMaterial_obj).forEach(([key, value]) => {
                                formData.append(key,value);
                            });
                            obt_proveedorMaterial_aux = { ...obt_proveedorMaterial_aux, ...confirm };
                            console.log(obt_proveedorMaterial_aux);
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


