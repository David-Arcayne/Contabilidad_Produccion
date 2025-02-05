import { URL_APIP } from "../../../../lib/services.js";



let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";

let obj_etapa = [];
let Lista_productos = [];
let List_Maquina =[];
let List_Material =[];
let Lista_SubProductos = [];
let Lista_AGrupados_registrar =[];

let list_has_Maquinas =[];
let list_has_Productos =[];
let list_has_Material =[];
let list_has_subProducto = [];
let code ;
export function agrupar_etapas_produccionf(etapa_select,productos,cod) {
    app=document.querySelector(`#Agrupar_grupos`);
    Lista_productos = productos;
    obj_etapa = etapa_select;
    code = cod;
    sitio();    
    
}
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "agrupar";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    switch (funcion) {
        case "Agregar_a_grupo":
            

            Agregar_a_grupo(event,id1,id2);
            break;
        case "editar_grupo":
            toggleEditSave(event);
            break;
        case "delete_hasconservacion":
            delete_hasconservacion(id1);
            break;
        default:

            sitio();
            break;
    }

}


function sitio(){
   Lista_AGrupados_registrar = [];
    let view = `
        <a style="float: right; color:blue" id ="cerrar_agrupar"> <i class="bi bi-x-circle" style="font-size: 2rem;"></i> </a>
    <div class="container mt-4">
        <h5 class="text-center mb-4 fw-bold fs-6">${obj_etapa.nombre_etapa}</h5>
        <div id="alerta${codigo}" class="mt-4"></div>

        <div class="row">
            <div class="col-md-6">
                <div class="p-3 bg-light border rounded">
                    <div class="col-md-6 mb-3 " id="menu">
                        <nav class="nav nav-pills nav-fill">
                            <li class="nav-item">
                                <button class="nav-link active" data-section="Productos" style="background-color:blue; color:white;">Productos</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="Maquinas" style="background-color:white; color:black;">Máquinas</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="Materiales" style="background-color:white; color:black;">Materiales</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-section="Subproductos" style="background-color:white; color:black;">Subproductos</button>
                            </li>
                        </nav>
                    </div>
                    <div id="Listar${codigo}" class="item-list" style = "max-height: 400px; overflow-y: auto; display: block;">
                       
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="p-3 bg-light border rounded">
                    <h5 class="mb-4 fw-bold fs-6">Productos Agrupados</h5>
                    <div id="listarproductos${codigo}" class="d-flex flex-wrap"></div>
                    <div id="selected-Productos-list" class="d-flex flex-wrap"></div>

                    <h5 class="mb-4 fw-bold fs-6">Materiales Agrupados</h5>
                    <div id="listarmateriales${codigo}" class="d-flex flex-wrap"></div>
                    <div id="selected-Materiales-list" class="d-flex flex-wrap"></div>

                    <h5 class="mb-4 fw-bold fs-6">Máquinas Agrupadas</h5>
                    <div id="listarmaquinas${codigo}" class="d-flex flex-wrap"></div>
                    <div id="selected-Maquinas-list" class="d-flex flex-wrap"></div>

                    <h5 class="mb-4 fw-bold fs-6">Subproductos Agrupados</h5>
                    <div id="listarsubproductos${codigo}" class="d-flex flex-wrap"></div>
                    <div id="selected-Subproductos-list" class="d-flex flex-wrap"></div>

                    <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="btn_Agrupar${codigo}" aria-label="Registrar">Agrupar</button>
                </div>
            </div>
        </div>
    </div>
    
    `;
    app.innerHTML=view;
    listar_maquina()
    .then(()=> listar_material())
    .then(()=> listar_subproductos())
    .then(()=> {
        listar_productos();
        listar_etapas_has_maquina();
        listar_etapas_has_material();
        listar_etapas_has_subproducto();
        listar_etapas_has_producto();
        mostrar_Productos();
        const boton_cerrar = document.querySelector(`#cerrar_agrupar`);
        boton_cerrar.addEventListener("click" , cerrar);

        const navButtons = document.querySelectorAll('#menu .nav-link');

        const btn_Agrupar = document.getElementById(`btn_Agrupar${codigo}`);
        btn_Agrupar.addEventListener("click", (e) => Agrupar_grupo_registrar(e));


        navButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
    
                navButtons.forEach(btn => {
                    btn.style.backgroundColor = 'white';
                    btn.style.color = 'black';
                });
    
                this.style.backgroundColor = 'blue';
                this.style.color = 'white';
    
                const section = this.getAttribute('data-section');
                mostrarSeccion(section);
            });
        });
    })
    .catch(error => {
        console.error('Error en la cadena de promesas:', error);
    });
  
    
}
 function cerrar(){
    const contentArea = document.getElementById(`Agrupar_grupos`);
    contentArea.innerHTML = '';
    let containerClosed = document.getElementById(`principal${code}`);
    containerClosed.style.display = 'block';
     
 }
 function listar_etapas_has_maquina(){
    fetch(`${URL_APIP}/api/listar_etapas_has_maquina/${obj_etapa.idetapas_produccion}`)
    .then(res=>res.json())
    .then(data=>{
        list_has_Maquinas = data;
        
        listar_etapas_has_maquina_Array();
        
    })

}
function listar_etapas_has_maquina_Array() {
    const contenedor = document.querySelector(`#listarmaquinas${codigo}`);
    const fragment = document.createDocumentFragment();

    list_has_Maquinas.forEach(lista => {
        const item = List_Maquina.find(obj => obj.id === lista.maquina_idmaquina);
        console.log(item);
        const div = document.createElement('div');
        div.className = "bg-success text-white d-flex align-items-center rounded p-2 me-2 mb-2";
        div.id = `Maquinas-${lista.maquina_idmaquina}`;
        div.innerHTML = `
            ${item.nombre} 
            <span data-id="eliminar_etapas_has_maquina,${lista.id}" class="ms-2 fw-bold eliminar_etapas_has_maquina" style="cursor:pointer;">×</span>
        `;
        div.querySelector('.eliminar_etapas_has_maquina').addEventListener("click", eliminar_etapas_has_maquina);
        fragment.appendChild(div);
    });

    contenedor.innerHTML = '';
    contenedor.appendChild(fragment);
}

function eliminar_etapas_has_maquina(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    console.log(funcion,id1);
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/${funcion}/${id1}`)
        .then(res=>res.json())
        .then(data=>{

            alertas(data);
            sitio();
        })
    }
}



function listar_etapas_has_material(){
    fetch(`${URL_APIP}/api/listar_etapas_has_material/${obj_etapa.idetapas_produccion}`)
    .then(res=>res.json())
    .then(data=>{
        list_has_Material = data;
        
        listar_etapas_has_material_Array();
        
    })

}
function listar_etapas_has_material_Array() {
    const contenedor = document.querySelector(`#listarmateriales${codigo}`);
    const fragment = document.createDocumentFragment();

    list_has_Material.forEach(lista => {
        const item = List_Material.find(obj => obj.id === lista.material_idmaterial);
        console.log(item);
        const div = document.createElement('div');
        div.className = "bg-success text-white d-flex align-items-center rounded p-2 me-2 mb-2";
        div.id = `Materiales-${lista.material_idmaterial}`;
        div.innerHTML = `
            ${item.nombre} ${item.codigo}
            <span data-id="eliminar_etapas_has_material,${lista.id}" class="ms-2 fw-bold eliminar_etapas_has_material" style="cursor:pointer;">×</span>
        `;
        div.querySelector('.eliminar_etapas_has_material').addEventListener("click", eliminar_etapas_has_material);
        fragment.appendChild(div);
    });

    contenedor.innerHTML = '';
    contenedor.appendChild(fragment);
}
function eliminar_etapas_has_material(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    console.log(funcion,id1);
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/${funcion}/${id1}`)
        .then(res=>res.json())
        .then(data=>{

            alertas(data);
            sitio();
        })
    }
}



function listar_etapas_has_producto(){
    fetch(`${URL_APIP}/api/listar_etapas_has_producto/${obj_etapa.idetapas_produccion}`)
    .then(res=>res.json())
    .then(data=>{
        list_has_Productos = data;
        
        listar_etapas_has_producto_Array();
        
    })

}
function listar_etapas_has_producto_Array() {
    const contenedor = document.querySelector(`#listarproductos${codigo}`);
    const fragment = document.createDocumentFragment();

    list_has_Productos.forEach(lista => {
        const item = Lista_productos.find(obj => obj.idproduct_comercial === lista.producto_idproducto);
        console.log(item);
        const div = document.createElement('div');
        div.className = "bg-success text-white d-flex align-items-center rounded p-2 me-2 mb-2";
        div.id = `Productos-${lista.producto_idproducto}`;
        div.innerHTML = `
            ${item.nombre} ${item.codigo}
            <span data-id="eliminar_etapas_has_producto,${lista.id}" class="ms-2 fw-bold eliminar_etapas_has_producto" style="cursor:pointer;">×</span>
        `;
        div.querySelector('.eliminar_etapas_has_producto').addEventListener("click", eliminar_etapas_has_producto);
        fragment.appendChild(div);
    });

    contenedor.innerHTML = '';
    contenedor.appendChild(fragment);
}
function eliminar_etapas_has_producto(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    console.log(funcion,id1);
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/${funcion}/${id1}`)
        .then(res=>res.json())
        .then(data=>{

            alertas(data);
            sitio();
        })
    }
}



function listar_etapas_has_subproducto(){
    fetch(`${URL_APIP}/api/listar_etapas_has_subproducto/${obj_etapa.idetapas_produccion}`)
    .then(res=>res.json())
    .then(data=>{
        list_has_subProducto = data;
        
        listar_etapas_has_subproducto_Array();
        
    })

}
function listar_etapas_has_subproducto_Array() {
    const contenedor = document.querySelector(`#listarsubproductos${codigo}`);
    const fragment = document.createDocumentFragment();

    list_has_subProducto.forEach(lista => {
        const item = Lista_SubProductos.find(obj => obj.idsub_producto === lista.sub_producto_idsub_producto);
        console.log(item);
        const div = document.createElement('div');
        div.className = "bg-success text-white d-flex align-items-center rounded p-2 me-2 mb-2";
        div.id = `Subproductos-${lista.sub_producto_idsub_producto}`;
        div.innerHTML = `
            ${item.nombre} ${item.codigo}
            <span data-id="eliminar_etapas_has_subproducto,${lista.id}" class="ms-2 fw-bold eliminar_etapas_has_subproducto" style="cursor:pointer;">×</span>
        `;
        div.querySelector('.eliminar_etapas_has_subproducto').addEventListener("click", eliminar_etapas_has_subproducto);
        fragment.appendChild(div);
    });

    contenedor.innerHTML = '';
    contenedor.appendChild(fragment);
}
function eliminar_etapas_has_subproducto(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    console.log(funcion,id1);
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/${funcion}/${id1}`)
        .then(res=>res.json())
        .then(data=>{

            alertas(data);
            sitio();
        })
    }
}



































 function mostrarSeccion(section) {
    const contentArea = document.getElementById(`Listar${codigo}`);
    contentArea.innerHTML = ''; 
    switch(section) {

        case 'Productos':
            mostrar_Productos();
            break;
        case 'Maquinas':
            mostrar_Maquinas();
            break;
        case 'Materiales':
            mostrar_Materiales();
            break;
        case 'Subproductos':
            mostrar_Subproductos();
            break;
        
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}
                  
function mostrar_Productos(){
    
        const mon=document.querySelector(`#Listar${codigo}`);
        let view="",ind=1;
                Lista_productos.map(lista=>{
                view+=`
                <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                    <span>${ind++}  ${lista.nombre}   ${lista.codigo}</span>
                    <a data-id="Agregar_a_grupo,${lista.idproduct_comercial},Productos" class="btn btn-success btn-sm" >
                            <i class="bi bi-plus-square"></i>
                    </a> 
                </div>`;
            })
            mon.innerHTML=view;
    
            const enlaces = document.querySelectorAll(".btn");
            enlaces.forEach(enlace => {
                enlace.addEventListener("click", menu);
            });
    
}
function mostrar_Maquinas(){
    const mon=document.querySelector(`#Listar${codigo}`);
    let view="",ind=1;
            List_Maquina.map(lista=>{
            view+=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                <span>${ind++}  ${lista.nombre}   </span>
                <a data-id="Agregar_a_grupo,${lista.id},Maquinas" class="btn btn-success btn-sm" >
                        <i class="bi bi-plus-square"></i>
                </a> 
            </div>`;
        })
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });
}

function mostrar_Materiales(){
    const mon=document.querySelector(`#Listar${codigo}`);
    let view="",ind=1;
            List_Material.map(lista=>{
            view+=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                <span>${ind++}  ${lista.nombre}  ${lista.codigo} </span>
                <a data-id="Agregar_a_grupo,${lista.id},Materiales" class="btn btn-success btn-sm" >
                        <i class="bi bi-plus-square"></i>
                </a> 
            </div>`;
        })
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });
}
function mostrar_Subproductos(){
    const mon=document.querySelector(`#Listar${codigo}`);
    let view="",ind=1;
            Lista_SubProductos.map(lista=>{
            view+=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                <span>${ind++}  ${lista.nombre}  ${lista.codigo} </span>
                <a data-id="Agregar_a_grupo,${lista.idsub_producto},Subproductos" class="btn btn-success btn-sm" >
                        <i class="bi bi-plus-square"></i>
                </a> 
            </div>`;
        })
        mon.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });
}


function Agregar_a_grupo(e, id, area,codigo) {
    e.preventDefault(); // Prevent default if it's a link or button
    console.log(id);
    let obj;
    let key;
    switch(area) {

      
                case 'Productos':
                    obj = Lista_productos.find(producto => producto.idproduct_comercial === Number(id));
                    key = 'producto_idproducto';
                    break;
                case 'Maquinas':
                    obj = List_Maquina.find(ob => ob.id === Number(id));
                    key = 'maquina_idmaquina';
                    break;
                case 'Materiales':
                    obj = List_Material.find(ob => ob.id === Number(id));
                    key = 'material_idmaterial';
                    break;
                case 'Subproductos':
                    obj = Lista_SubProductos.find(ob => ob.idsub_producto === Number(id));
                    key = 'sub_producto_idsub_producto';
                    break;
                
                default:
                    alert("Error en la seleccion");
                    break;
    }
    let divId = `selected-${area}-list`;
    let targetDiv = document.getElementById(divId);
    
     
    if (!obj) {
        console.error('Producto no encontrado');
        return;
    }
    console.log(`${area}-` + id);
    if (document.getElementById(`${area}-` + id)) {
        alert('El producto ya ha sido seleccionado.');
        return;
    }
    let item = {
        "id": Number(id),
        "area": area,
        "codigo": obj.codigo,
        "ver" : `registrar_etapas_has_${area}`,
        "idetapa" : obj_etapa.idetapas_produccion,
        "key" : key
    };
    agregarALista(item, obj);
}

function agregarALista(item, obj) {
    const existingIndex = Lista_AGrupados_registrar.findIndex(
        i => i.id === item.id && i.area === item.area
    );

    if (existingIndex === -1) {
        Lista_AGrupados_registrar.push(item);
        console.log('Item added to lista_aRegistrar:', item);
        actualizarUILista(obj,item);
    } else {
        console.log('Item already exists in lista_aRegistrar');
    }
   
}

function eliminarDeLista(entidad_id, tipo_entidad, item) {
    Lista_AGrupados_registrar = Lista_AGrupados_registrar.filter(
        (i) => !(i.id === entidad_id && i.area === tipo_entidad)
    );
    console.log('Item removed from lista_aRegistrar');
    actualizarUILista();
}

function actualizarUILista() {
    // Limpiar las listas existentes
    const selectedProductsLists = document.querySelectorAll('[id^="selected-"]');
    selectedProductsLists.forEach((list) => {
        list.innerHTML = '';
    });
    console.log(Lista_AGrupados_registrar);
    Lista_AGrupados_registrar.forEach((item) => {
        console.log(item);
        let divId = `selected-${item.area}-list`;
        const selectedProductsList = document.getElementById(divId);
        let obj;
        

        switch (item.area) {
            case 'Productos':
                obj = Lista_productos.find((ob) => ob.idproduct_comercial === item.id);
                break;
            case 'Maquinas':
                obj = List_Maquina.find((ob) => ob.id === item.id);
                break;
            case 'Materiales':
                obj = List_Material.find((ob) => ob.id === item.id);
                break;
            case 'Subproductos':
                obj = Lista_SubProductos.find((ob) => ob.idsub_producto === item.id);
                break;
            default:
                alert('Error en la selección');
                return;
        }

        if (obj && obj.nombre) {
            const newProduct = document.createElement('div');
            newProduct.className = 'bg-info text-white d-flex align-items-center rounded p-2 me-2 mb-2';
            newProduct.id = `${item.area}-${item.id}`;
            newProduct.innerHTML = `${obj.nombre} ${obj.codigo} <span class="ms-2 fw-bold eliminar-${item.area}" style="cursor:pointer;">&times;</span>`;
            newProduct.querySelector(`.eliminar-${item.area}`).onclick = () => eliminarDeLista(item.id, item.area, item);
            selectedProductsList.appendChild(newProduct);
        } else {
            console.error(`No se encontró el objeto para el área "${item.area}" y el ID "${item.id}".`);
        }
    });
}

function Agrupar_grupo_registrar(event){
    
    if (Lista_AGrupados_registrar && Lista_AGrupados_registrar.length > 0) {
        Lista_AGrupados_registrar.forEach(item => {
            const formData = new FormData();
            formData.append('ver', item.ver);
            formData.append('etapas_produccion_idetapas_produccion', item.idetapa);
            formData.append(`${item.key}`, item.id);
    
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            sendformData(event, formData); 
        });
        sitio(); 
    }
   
}
function listar_maquina(){
    
    return fetch(`${URL_APIP}/api/listar_maquina/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        List_Maquina = data;
      
        
    })
}
function listar_material(){
    const listar=document.querySelector("#listar_material");
    
    return fetch(`${URL_APIP}/api/listar_material/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        List_Material = data;
        
    })
}
function listar_subproductos(){
    return fetch(`${URL_APIP}/api/listar_sub_productos/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        Lista_SubProductos = data;
    })
}
function listar_productos(){
    console.log(Lista_productos);
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
        return;
        
    } else {
        if(data[0] == "Error"){

           
            alertClass = 'alert-danger';
            alertMessage = data[1];
            timeoutDuration = 1000;
        }else{
            alertClass = 'alert-primary';
            alertMessage = data[1];
            timeoutDuration = 1000;

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