let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let codigo_producto;
let obj_grupo = [];
let productos = [];
let Lista_no_Agrupados_productos = [];
let Lista_Agregado_aGrupo=[];
let has_conservaciones =[];
let lista_aRegistrar=[ ];
let Datos_Conservacion = {};

export function agrupar_conf(objeto_grupo,Lista_productos) {
    app=document.querySelector(`#Agrupar_grupos`);
    productos = Lista_productos;
    obj_grupo = objeto_grupo;
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
            

            Agregar_a_grupo(event,id1);
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
function delete_hasconservacion(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    console.log(funcion,id1);
    if(confirm("Desea Eliminar..?")){
        fetch(`./api/${funcion}/${id1}`)
        .then(res=>res.json())
        .then(data=>{

            alertas(data);
            sitio();
           // event.currentTarget.closest('div').remove();
        })
    }
   
}

function sitio(){
    let view = `
        <a style="float: right; color:blue" id ="cerrar_agrupar"> <i class="bi bi-x-circle" style="font-size: 2rem;"></i> </a>
        <div class="container ">
           
            <h5 class="text-center mb-4 fw-bold fs-6" >Agrupar Productos</h5>


            <div class="row">
                <div class="col-md-4">
                    <div class="p-3 bg-light border rounded"  >
                      
                        <h5 class="text-center mb-4 fw-bold fs-6" >Productos no agrupados</h5>

                        <div id="Listar_no_agrupados${codigo}" style = "max-height: 400px; overflow-y: auto; display: block;">
                        
                        </div>
                       
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="p-3 bg-light border rounded">
                     
                        <h5 class="text-center mb-4 fw-bold fs-6" >Productos agrupado al grupo ${obj_grupo.nombre}</h5>
                        <div id="productos_guardados${codigo}" class="d-flex flex-wrap" >
                            
                        </div>
                        <div id="selected-products-list" class="d-flex flex-wrap" >
                            
                        </div>

                        <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="btn_Agrupar${codigo}" aria-label="Registrar">Agrupar</button>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="p-3 bg-light border rounded">
                        <h5 class="text-center mb-4 fw-bold fs-6" >Datos de Conservación</h5>
                        <form id="formulario${codigo}" >
                            
                            
                        </form>
                    </div>
                </div>
            </div>
        </div>
    
    `;
    app.innerHTML=view;
    Listar_no_agrupados();
    Listar_Agregados();
    Obtener_datos_conservacion();
    const btn_Agrupar = document.getElementById(`btn_Agrupar${codigo}`);
    btn_Agrupar.addEventListener("click", (e) => Agrupar_grupo_registrar(e));

    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));


    cerrar_agrupar
    const boton_cerrar = document.querySelector(`#cerrar_agrupar`);
    boton_cerrar.addEventListener("click" , cerrar);
}
 function cerrar(){
    const contentArea = document.getElementById(`Agrupar_grupos`);
    contentArea.innerHTML = '';
    let containerClosed = document.getElementById(`principal_conservacion`);
    containerClosed.style.display = 'block';
     
 }
function Obtener_datos_conservacion(){
    fetch(`./api/Listar_conservacion/${obj_grupo.id}`)
    .then(res=>res.json())
    .then(data=>{
        Datos_Conservacion = data;
        console.log(data);
        console.log(obj_grupo.id);
        Mostrar_datos_conservacion();
        
    })
}
                  
function Mostrar_datos_conservacion() {
    let formu = document.querySelector(`#formulario${codigo}`);
    let funcion = "";
    if(Datos_Conservacion.idconservacion == 0){
        funcion = "registrar_conservacion";
    }else{
        funcion = "editar_conservacion";
    }
    console.log(funcion);

    let view = "";

        

        view = `
            <div id="alerta${codigo}" class="mt-4"></div>
            <input type="hidden" name="ver" value="${funcion}">
            <input type="hidden" name="idgrupo" value="${obj_grupo.id}">
            <input type="hidden" name="id" value="${Datos_Conservacion.idconservacion || ''} ">
            <div class="mb-3">
                <label for="duracion" class="form-label">Duración</label>
                <input type="number" step="0.01" class="form-control" id="duracion" name="duracion" value="${Datos_Conservacion.duracion || ''}">
            </div>

            <div class="mb-3">
                <label for="Unidad_tiempo_idUnidad_tiempo" class="form-label">Unidad de Tiempo</label>
                <select class="form-select" id="Unidad_tiempo_idUnidad_tiempo" name="unidadtiempo">
                    <option value="1" ${Datos_Conservacion.Unidad_tiempo_idUnidad_tiempo == 1 ? 'selected' : ''}>Segundos</option>
                    <option value="2" ${Datos_Conservacion.Unidad_tiempo_idUnidad_tiempo == 2 ? 'selected' : ''}>Minutos</option>
                    <option value="3" ${Datos_Conservacion.Unidad_tiempo_idUnidad_tiempo == 3 ? 'selected' : ''}>Horas</option>
                    <option value="4" ${Datos_Conservacion.Unidad_tiempo_idUnidad_tiempo == 4 ? 'selected' : ''}>Días</option>
                    <option value="5" ${Datos_Conservacion.Unidad_tiempo_idUnidad_tiempo == 5 ? 'selected' : ''}>Semanas</option>
                    <option value="6" ${Datos_Conservacion.Unidad_tiempo_idUnidad_tiempo == 6 ? 'selected' : ''}>Meses</option>
                    <option value="7" ${Datos_Conservacion.Unidad_tiempo_idUnidad_tiempo == 7 ? 'selected' : ''}>Años</option>
                </select>
            </div>

            <div class="mb-3">
                <label for="temperatura" class="form-label">Temperatura</label>
                <input type="text" class="form-control" id="temperatura" name="temperatura" value="${Datos_Conservacion.temperatura || ''}">
            </div>

            <div class="mb-3">
                <label for="humedad" class="form-label">Humedad</label>
                <input type="text" class="form-control" id="humedad" name="humedad" value="${Datos_Conservacion.humedad || ''}">
            </div>

            <div class="mb-3">
                <label for="exp_luz" class="form-label">Exposición a la Luz</label>
                <input type="text" class="form-control" id="exp_luz" name="exp_luz" value="${Datos_Conservacion.exp_luz || ''}">
            </div>

            <div class="text-center">
                <button type="submit" class="btn btn-primary">Registrar</button>
            </div>
        `;
    

    formu.innerHTML = view;
}
function Listar_Agregados(){
    fetch(`./api/listar_agrupados_conservacion/producto/${uk[0].empresa.idempresa}/${obj_grupo.id}`)
    .then(res=>res.json())
    .then(data=>{
        has_conservaciones = data;
        Lista_Agregado_aGrupo = productos.filter(producto => 
            data.some(item => item.entidad_id === producto.idproduct_comercial)
        );
       Listar_Agregados_Array();
        
    })

}
function Listar_Agregados_Array() {
    const contenedor = document.querySelector(`#productos_guardados${codigo}`);
    const fragment = document.createDocumentFragment();

    Lista_Agregado_aGrupo.forEach(lista => {
        const item = has_conservaciones.find(obj => obj.entidad_id === lista.idproduct_comercial);
        console.log(item);
        const div = document.createElement('div');
        div.className = "bg-success text-white d-flex align-items-center rounded p-2 me-2 mb-2";
        div.id = `producto-${lista.idproduct_comercial}`;
        div.innerHTML = `
            ${lista.nombre} ${lista.codigo}
            <span data-id="delete_hasconservacion,${item.idhas_conservacion}" class="ms-2 fw-bold eliminar-producto" style="cursor:pointer;">×</span>
        `;
        div.querySelector('.eliminar-producto').addEventListener("click", delete_hasconservacion);
        fragment.appendChild(div);
    });

    contenedor.innerHTML = '';
    contenedor.appendChild(fragment);
}


function Agregar_a_grupo(e, id) {
    e.preventDefault(); // Prevent default if it's a link or button
    console.log(id);
    const obj = productos.find(producto => producto.idproduct_comercial === Number(id));
    if (!obj) {
        console.error('Producto no encontrado');
        return;
    }
    if (document.getElementById('producto-' + id)) {
        alert('El producto ya ha sido seleccionado.');
        return;
    }
    let item = {
        'ver': 'register_hasconnservacion',
        'entidad_id': id,
        'tipo_entidad': 'producto',
        'idgrupo': obj_grupo.id
    };
    agregarALista(item, obj);
}

function agregarALista(item, obj) {
    const existingIndex = lista_aRegistrar.findIndex(
        i => i.entidad_id === item.entidad_id && i.tipo_entidad === item.tipo_entidad
    );

    if (existingIndex === -1) {
        lista_aRegistrar.push(item);
        console.log('Item added to lista_aRegistrar:', item);
        actualizarUILista(obj);
    } else {
        console.log('Item already exists in lista_aRegistrar');
    }
}

function eliminarDeLista(entidad_id, tipo_entidad) {
    lista_aRegistrar = lista_aRegistrar.filter(
        item => !(item.entidad_id === entidad_id && item.tipo_entidad === tipo_entidad)
    );
    console.log('Item removed from lista_aRegistrar');
    actualizarUILista();
}

function actualizarUILista(obj = null) {
    const selectedProductsList = document.getElementById('selected-products-list');
    
    if (obj) {
        // Add only the new item to the UI
        const newProduct = document.createElement('div');
        newProduct.className = 'bg-info text-white d-flex align-items-center rounded p-2 me-2 mb-2';
        newProduct.id = 'producto-' + lista_aRegistrar[lista_aRegistrar.length - 1].entidad_id;
        newProduct.innerHTML = `${obj.nombre} ${obj.codigo} <span class="ms-2 fw-bold eliminar-producto" style="cursor:pointer;">&times;</span>`;
        newProduct.querySelector('.eliminar-producto').onclick = () => eliminarDeLista(lista_aRegistrar[lista_aRegistrar.length - 1].entidad_id, 'producto');
        selectedProductsList.appendChild(newProduct);
    } else {
        // Refresh the entire list
        selectedProductsList.innerHTML = '';
        lista_aRegistrar.forEach(item => {
            const obj = productos.find(producto => producto.idproduct_comercial === Number(item.entidad_id));

            const itemElement = document.createElement('div');
            itemElement.className = 'bg-info text-white d-flex align-items-center rounded p-2 me-2 mb-2';
            itemElement.id = 'producto-' + item.entidad_id;
            itemElement.innerHTML = `${obj.nombre} ${obj.codigo} <span class="ms-2 fw-bold eliminar-producto" style="cursor:pointer;">&times;</span>`;
            itemElement.querySelector('.eliminar-producto').onclick = () => eliminarDeLista(item.entidad_id, item.tipo_entidad);
            selectedProductsList.appendChild(itemElement);
        });
    }
}

function Agrupar_grupo_registrar(event){
    if (lista_aRegistrar && lista_aRegistrar.length > 0) {
        lista_aRegistrar.forEach(item => {
            const formData = new FormData();
            formData.append('ver', item.ver);
            formData.append('entidad_id', item.entidad_id);
            formData.append('tipo_entidad', item.tipo_entidad);
            formData.append('idgrupo', item.idgrupo);
            
            sendformData(event, formData); 
        });
        sitio(); 
    }
   
}


function Listar_no_agrupados(){
    fetch(`./api/Listar_no_agrupados/producto/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        Lista_no_Agrupados_productos.length = 0;
        Lista_no_Agrupados_productos = data;     
        
        const idProductComercialSet = new Set(Lista_no_Agrupados_productos.map(p => p.idproduct_comercial));

        const productosFiltrados = productos.filter(pna => idProductComercialSet.has(pna.idproduct_comercial));

        Listar_no_agrupados_Array(productosFiltrados);
        
        
    })
}
function Listar_no_agrupados_Array(productosFiltrados){
    const mon=document.querySelector(`#Listar_no_agrupados${codigo}`);
    let view="",ind=1;
            productosFiltrados.map(lista=>{
            view+=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
                <span>${ind++}  ${lista.nombre}   ${lista.codigo}</span>
                <a data-id="Agregar_a_grupo,${lista.idproduct_comercial}" class="btn btn-success btn-sm" >
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
    for (let [key, value] of dato.entries()) {
        console.log(key, value);
    }

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