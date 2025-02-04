import { conservacion_config } from "../conservacion/conservacion.js";


import { URL_APIP } from "../../../../lib/services.js";
import { etapas_produccion_config } from "../etapas_produccion/etapas_produccion.js" 

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";

let List_Producto= [];
let list_rubro = [];
let list_unidadTiempo = [];

let list_categoria = [];
let list_medida = [];
let list_estados =[];
let list_unidad = [];

let obt_producto_aux = {
    "id": 0,
    "nombre": "",
    "codigo": "",
    "estado": 0,
    "medida": 0,
    "rubro": 0,
    "seccion": 0,
    "idestandar": 0,
    "cantidad": 0,
    "tiempo": 0,
    "unidadtiempo": 0
}; 
let privilegios;

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "producto";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}

export function productoConfig(code, permisos, refrescar) {
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));
    console.log(privilegios);
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
        
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    
    
    sitio();    
    
}
  
    


function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    switch (funcion) {
        case "eliminar_producto":
            eliminar_producto(id1);
            break;
        
        case "editar_producto_comercial":
            toggleEditSave(event);
            break;
            
        case "editar_estado_producto":
            editar_estado_producto(event);
            break;
        case "configuracion":
            addModal(id1);
            break;
            
        case "etapas_produccion":
            modaletapasproduccion(id1);
            break;
        // Agrega otros casos según sea necesario
        default:
            
            sitio();
            break;
    }

}
function modaletapasproduccion(){
    
    let containerOpen = document.getElementById(`content-area${codigo}`);
    containerOpen.style.display = 'block';
    let containerClosed = document.getElementById(`principal${codigo}`);
    containerClosed.style.display = 'none';
    console.log("Listo ----------------")
    etapas_produccion_config(codigo,List_Producto);
   
}
function producto_conservacion(){
    let containerOpen = document.getElementById(`content-area${codigo}`);
    containerOpen.style.display = 'block';
    let containerClosed = document.getElementById(`principal${codigo}`);
    containerClosed.style.display = 'none';
    conservacion_config(codigo,List_Producto);
}
function producto_categoria_c(){
  
    let containerOpen = document.getElementById(`content-area${codigo}`);
    containerOpen.style.display = 'block';
    let containerClosed = document.getElementById(`principal${codigo}`);
    containerClosed.style.display = 'none';
    producto_categoria_config(codigo);
}
function producto_comercial_medida_c(){
  
    let containerOpen = document.getElementById(`content-area${codigo}`);
    containerOpen.style.display = 'block';
    let containerClosed = document.getElementById(`principal${codigo}`);
    containerClosed.style.display = 'none';
    producto_comercial_medida_config(codigo);
}
function producto_comercial_estado_c(){
    
    let containerOpen = document.getElementById(`content-area${codigo}`);
    containerOpen.style.display = 'block';
    let containerClosed = document.getElementById(`principal${codigo}`);
    containerClosed.style.display = 'none';
    producto_comercial_estado_config(codigo);
}
function producto_comercial_unidad_c(){
    let containerOpen = document.getElementById(`content-area${codigo}`);
    containerOpen.style.display = 'block';
   
    let containerClosed = document.getElementById(`principal${codigo}`);
    containerClosed.style.display = 'none';
    producto_comercial_unidad_config(codigo);
}
function configurar_subproducto(){
    let containerOpen = document.getElementById(`content-area${codigo}`);
    containerOpen.style.display = 'block';
   
    let containerClosed = document.getElementById(`principal${codigo}`);
    containerClosed.style.display = 'none';
    producto_proceso_config(codigo,List_Producto,privilegios);
}


function toggleEditSave(event) {
    
    const permisos = [2, 3,4, 5, 6, 7, 8, 9, 10, 11, 12, 13,14];
      
    const names = [
        'nombre', 'codigo', 'descripcion', 'cod_barras', 
        'idcategorias_p', 'idmedida_p', 'idestadosproductos_p', 'idunidad_p',
          'rubro', 'seccion', 'cantidad', 'tiempo', 'unidadtiempo'
    ];
    const names2 =[
        "nombre",
        "codigo",
        "descripcion",
        "cod_barras",
        "categorias_id_categorias",
        "medida_id_medida",
        "estados_productos_id_estados_productos",
        "unidad_id_unidad",
        "rubro_idrubro",
        "seccion_idseccion",
        "cantidad",
        "tiempo_produccion",
        "Unidad_tiempo_idUnidad_tiempo"
   
    ]
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    

    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    const objproducto = List_Producto.find(obj => obj.idproduct_comercial === Number(id1));
    console.log(objproducto);

    const objproductoc = { ...objproducto };
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
                if (index === 6 || index === 7 || index === 8 || index === 9 || index === 10 || index === 11 || index === 14 ) {
                    
                    input = createSelectElement(names[permisos.indexOf(index)]); // Crear el elemento select correctamente
                    if (input) {
                        celda.innerHTML = '';
                        input.style.width = '150px'
                        input.value = objproducto[names2[permisos.indexOf(index)]];

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
                        input.style.width = '150px'
                        input.value = valorOriginal;
                        celda.innerHTML = '';
                        celda.appendChild(input);
                    }else{
                        input = document.createElement('input');
                        input.id = `ediinp${codigo}`;
                        input.className = "form-control";

                        input.type = "text";
                        input.style.width = '150px'
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

          
            objproducto[names2[0]] = datosnuevos[0];
            
            objproducto[names2[1]] = datosnuevos[1];
            objproducto[names2[2]] = datosnuevos[2];
            objproducto[names2[3]] = datosnuevos[3];

            objproducto[names2[4]] = datosnuevos[4];

            objproducto[names2[5]] = datosnuevos[5];
            objproducto[names2[6]] = datosnuevos[6];
            objproducto[names2[7]] = datosnuevos[7];
            objproducto[names2[8]] = datosnuevos[8];
            objproducto[names2[9]] = datosnuevos[9];
            objproducto[names2[10]] = datosnuevos[10];
            objproducto[names2[11]] = datosnuevos[11];
            objproducto[names2[12]] = datosnuevos[12];
            console.log(objproducto);
            if (objproducto) {
                Object.assign(List_Producto, objproducto);
            }
            console.log(objproducto);
            console.log(objproductoc);
            console.log(areObjectsEqual(objproducto, objproductoc));
            if (!areObjectsEqual(objproducto, objproductoc)) {
                const formData = new FormData();
                formData.append('ver', "editar_producto_comercial");
                formData.append('empresa', `${uk[0].empresa.idempresa}`);

                Object.entries(objproducto).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_producto_aux = { ...obt_producto_aux, ...objproductoc };
                console.log(obt_producto_aux);

                for (let [key, value] of formData.entries()) {
                    console.log(key, value);
                }
                sendformData(event, formData);
            }

            console.log(List_Producto);

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

function eliminar_producto(id){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/eliminar_producto/${id}`)
        .then(res=>res.json())
        .then(data=>{
            obt_producto_aux ={...List_Producto.find(obj => obj.idproduct_comercial === Number(id))};
            alertas(data);
            
        })
    }
   
}

function editar_estado_producto(event){
    const boton = event.currentTarget;
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(','); 
    let objeto = List_Producto.find(obj => obj.idproduct_comercial === Number(id1));
    console.log(List_Producto);
    console.log(objeto);
    let est = objeto.estado == 0 ?   `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`: `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>`;
   
    const formData = new FormData();
    formData.append('ver', funcion);
    formData.append('id', id1);

    formData.append('estado', objeto.estado === 0 ? 1 : 0);
    objeto.estado = objeto.estado === 0 ? 1 : 0;
    sendformData(event, formData);
    console.log("Cambio de estado confirmado");
    boton.innerHTML = est;
}

function listar_rubro(){
    console.log("listo");

    const listar2=document.querySelector(`#buscar_porRubro${codigo}`);

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
        console.log("lista rubro completa");
        

    })
}
function listar_idcategorias_p(){
    console.log("listo");

    const listar=document.querySelector(`#idcategorias_p${codigo}`);
    return fetch(`${URL_APIP}/api/listarCategorias/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        list_categoria.length = 0;
        list_categoria = data;     

        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
                <option value="${lista.id}">${lista.nombre}</option>
            `;
        })
        listar.innerHTML=view;
        console.log("lista categorias completa");
        

    })
}
function listar_idmedida_p(){
    console.log("listo");

    const listar=document.querySelector(`#idmedida_p${codigo}`);
    return fetch(`${URL_APIP}/api/listar_medidas_producto/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        list_medida.length = 0;
        list_medida = data;     

        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
                <option value="${lista.id}">${lista.nombre_medida}</option>
            `;
        })
        listar.innerHTML=view;
        console.log("lista medida completa");
        

    })
}
function listar_idestadosproductos_p(){
    console.log("listo");

    const listar=document.querySelector(`#idestadosproductos_p${codigo}`);
    return fetch(`${URL_APIP}/api/listar_estados_productos/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        list_estados.length = 0;
        list_estados = data;     

        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
                <option value="${lista.id}">${lista.tipos_estado}</option>
            `;
        })
        listar.innerHTML=view;
        console.log("lista estados completa");
        console.log(list_estados);

    })
}
function listar_idunidad_p(){
    console.log("listo");

    const listar=document.querySelector(`#idunidad_p${codigo}`);
    return fetch(`${URL_APIP}/api/listar_unidad_producto/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        list_unidad.length = 0;
        list_unidad = data;     

        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
                <option value="${lista.id}">${lista.nombre}</option>
            `;
        })
        listar.innerHTML=view;
        console.log("lista Unidad completa");
        

    })
}
function listarUnidadTiempo(){
    console.log("listo");

    const listar=document.querySelector(`#unidadtiempo${codigo}`);
    return fetch(`${URL_APIP}/api/listar_unidad_tiempo`)
    .then(res=>res.json())
    .then(data=>{
        list_unidadTiempo.length = 0;
        list_unidadTiempo = data;     

        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
                <option value="${lista.id}">${lista.unidad}</option>
            `;
        })
        listar.innerHTML=view;
        console.log("lista medida completa");
        

    })
}

function sitio() {
    let view = `
        <div class="col-md-12 mb-3 " id="menu">
            <nav class="nav nav-pills nav-fill">
                <li class="nav-item">
                    <button class="nav-link active" data-section="INICIO_HOME" style="background-color:blue; color:white;"><i class="bi bi-node-plus-fill fs-3" ></i></button>
                </li>
            
                <li class="nav-item">
                    <button class="nav-link" data-section="producto_conservacion" style="background-color:white; color:black;">Conservacion producto</button>
                </li>
                
                <li class="nav-item">
                    <button class="nav-link" data-section="etapasproduccion" style="background-color:white; color:black;">Etapas Producción</button>
                </li>
                
                
                <div class="row">
                    <label for="buscar_porRubro" class="form-label">Linea de produccion:</label>
                    <select class="form-select" id="buscar_porRubro${codigo}" name="buscar_porRubro">
                        <option value="" disabled selected>Seleccione un rubro</option>
                        
                    </select>
                </div>
                
            </nav>
        </div>
        
        <div class="container" id="principal${codigo}">
            <h5 class="text-center mb-4 fw-bold fs-6" >Productos</h5>
            
            <form class="" id="formulario${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                <input type="hidden" name="ver" value="registro_producto_comercial">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
               
                <div class="row">
                    <label for="seccion" class="form-label fw-bold fs-6">Datos producto</label>

                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="nombre">Nombre del Producto</label>
                            <input type="text" class="form-control" id="nombre" name="nombre" required>
                        </div>
                        <div class="form-group">
                            <label for="codigo">Código</label>
                            <input type="text" class="form-control" id="codigo" name="codigo" required>
                        </div>
                        <div class="form-group">
                            <label for="cod_barras">Código de Barras</label>
                            <input type="text" class="form-control" id="cod_barras" name="cod_barras" required>
                        </div>
                        
                    </div>
                    <div class="col-md-3">
                       
                        <div class="form-group">
                            <label for="idcategorias_p">Categoría</label>
                            <select class="form-select" id="idcategorias_p${codigo}" name="idcategorias_p" required>
                                
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="idmedida_p">Caracteristicas</label>
                            <select class="form-select" id="idmedida_p${codigo}" name="idmedida_p" required>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="imagen">Imagen</label>
                            <input type="file" class="form-control" id="imagen" name="imagen">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="idestadosproductos_p">Estado del Producto</label>
                            <select class="form-select" id="idestadosproductos_p${codigo}" name="idestadosproductos_p" required>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="idunidad_p">Medida</label>
                            <select class="form-select" id="idunidad_p${codigo}" name="idunidad_p" required>
                            </select>
                        </div>
                        
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="descripcion">Descripción</label>
                            <textarea class="form-control" id="descripcion" name="descripcion" rows="3" required></textarea>
                        </div>                       
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <div class="form-group">
                            <label for="estado" class="form-label">Seleccione condición</label>
                            <select class="form-select" id="estado${codigo}" name="estado">
                                <option value="0">Activo</option>
                                <option value="1">Inactivo</option>
                            </select>
                        </div>
                    </div>
                   
                    <div class="col-md-6 mb-3" >
                        <div class="form-group">
                            
                            
                        </div>
                    </div>
                    
                </div>
                <label for="" class="form-label fw-bold fs-6">Estandar produccion</label>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="form-group">
                            <label for="cantidad" class="form-label">Cantidad producción:</label>
                            <input type="number" class="form-control" id="cantidad" value="" name="cantidad"  step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="form-group">
                            <label for="tiempo" class="form-label">Tiempo producción:</label>
                            <input type="number" class="form-control" id="tiempo" name="tiempo" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="form-group">
                            <label for="unidadtiempo" class="form-label">Unidad de Tiempo:</label>
                            <select class="form-select" id="unidadtiempo${codigo}" name="unidadtiempo">
                                
                            </select>
                        </div>
                    </div>
                </div>

                
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>

            </form>
            <div id="alerta${codigo}" class="mt-4"></div>
            
            
            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1" ><i class="bi bi-plus"></i></button>
            <div class="mt-4" id="tableProducto${codigo}" style="display: block; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <label for="filtro" class="form-label">Buscar:</label>

                        <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm">
                        
                    </div>
                    <div class="col-md-2">
                        <label for="Item" class="form-label">Items:</label>
                        <select class="form-select" id="item${codigo}" name="item">
                            <option value="" disabled selected>Seleccione un item</option>
                            <option value="idcategorias_p">Categoria</option>
                            <option value="idunidad_p">Medida</option>
                            <option value="idmedida_p">Caracteristicas</option>
                            <option value="idestadosproductos_p">Estados</option>

                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="Opciones" class="form-label">Opciones:</label>
                        
                        <select class="form-select" id="Opciones${codigo}" name="Opciones">
                            <option value=""></option>

                        </select>
                    </div>
                     <div class="col-md-2 mt-4">
                        
                        <button type="button" class="btn btn-primary" id="cancelarfiltro${codigo}"><i class="bi bi-x-circle"></i></button>

                    </div>
                   
                    
                </div>
                <div style = "max-height: 400px; overflow-y: auto; display: block;">
                
                    <table class="table table-bordered table-hover table-striped" id = "editableTable${codigo}">
                        <thead >
                            <tr class="table-dark">
                                <th>N°</th>
                                <th>Fecha Registro</th>
                                <th>Nombre</th>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Código de Barras</th>
                                <th>Categoría</th>
                                <th>Caracteristica</th>
                                <th>Estado Producto</th>
                                <th>Unidad medida</th>
                                <th>Rubro</th>
                                <th>Cantidad</th>
                                <th>Tiempo Producción</th>
                                <th>Unidad Tiempo</th>                               
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="listar_productos_comercial${codigo}">
                           
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
        
        <div id="content-area${codigo}"></div>
    `;

    app.innerHTML = view;
   
     listarUnidadTiempo()
    .then(() => listar_rubro())
    .then(() => listar_idcategorias_p())
    .then(() => listar_idmedida_p())
    .then(() => listar_idestadosproductos_p())
    .then(() => listar_idunidad_p())
    .then(() => listar_productos_comercial())
    .then(() => {
        const selectrubro = document.querySelector(`#buscar_porRubro${codigo}`);
        filtrar_por_rubros();

        selectrubro.addEventListener("change", function() {
            filtrar_por_rubros();
        });

        const forme = document.querySelector(`#formulario${codigo}`);
        forme.addEventListener("submit", (e) => sendform(e, forme));
        const selectItems = document.querySelector(`#item${codigo}`);

        selectItems.addEventListener("change", function() {
            obtenerDatosfiltracion(selectItems);
        });
        
        const btncancelarFiltro = document.querySelector(`#cancelarfiltro${codigo}`);
        btncancelarFiltro.addEventListener("click", function() {
            CancelarFiltracion();
        });
        const input = document.getElementById(`filtro${codigo}`);
        input.addEventListener("keyup", function() {
            filtrar_table(input);
        });

        const selectopciones = document.querySelector(`#Opciones${codigo}`);
        selectopciones.addEventListener("change", function() {
            filtrar_table(input);
        });
        const table = document.getElementById(`editableTable${codigo}`);
        table.addEventListener("dblclick",(e) => edit_Celda_table(e));

        const tableprod = document.querySelector(`#tableProducto${codigo}`);
    
        const toggleButton = document.getElementById(`toggleButton${codigo}`);
        toggleButton.addEventListener("click", (e) => toggleFormTable(e,toggleButton,forme,tableprod));
        const navButtons = document.querySelectorAll('#menu .nav-link');

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
function filtrar_por_rubros(){
    // const selectItems = document.querySelector(`#buscar_porRubro${codigo}`);
    // const selectedValue = selectItems.value;
    const selectrubro = document.querySelector(`#buscar_porRubro${codigo}`);
    const selectedOpcText = selectrubro.options[selectrubro.selectedIndex].text;

    let selectedColumnIndex = 10;
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

function filtrarBusqueda() {
    let selectedColumnIndex;
    const selectItems = document.querySelector(`#item${codigo}`);
    const selectedValue = selectItems.value;

    const selectopciones = document.querySelector(`#Opciones${codigo}`);
    const selectedOpcValue = selectopciones.value;
    const selectedOpcText = selectopciones.options[selectopciones.selectedIndex].text;

    console.log(selectedValue);
    console.log(selectedOpcValue);
    console.log(selectedOpcText);

    // Asignar el índice de columna basado en el valor seleccionado
    switch (selectedValue) {
        case 'rubro':
            selectedColumnIndex = 10;
            break;
        case 'idcategorias_p':
            selectedColumnIndex = 6;
            break;
        case 'idunidad_p':
            selectedColumnIndex = 9;
            break;
        case 'idmedida_p':
            selectedColumnIndex = 7;
            break;
        case 'idestadosproductos_p':
            selectedColumnIndex = 8;
            break;
        default:
            console.error("Columna no válida seleccionada.");
            return;  // Si no se selecciona una columna válida, salir de la función
    }

    filtrarColumna(selectedColumnIndex, selectedOpcText);
}

function filtrarColumna(selectedColumnIndex, selectedOpcText) {
    const tabla = document.querySelector(`#editableTable${codigo}`);
    const filas = tabla.getElementsByTagName("tr");

    for (let i = 1; i < filas.length; i++) {
        const fila = filas[i];

        if (fila.style.display === "none") {
            continue;
        }

        const celdas = fila.getElementsByTagName("td");

        if (celdas[selectedColumnIndex]) {
            const valorCelda = celdas[selectedColumnIndex].textContent || celdas[selectedColumnIndex].innerText;

            if (valorCelda.trim() !== selectedOpcText.trim()) {
                fila.style.display = "none";
            } else {
                fila.style.display = "";  // Mostrar la fila si coincide
            }
        } else {
            // Si no hay celda en esa columna, ocultar la fila
            fila.style.display = "none";
        }
    }
}


function CancelarFiltracion() {
    const tabla = document.querySelector(`#editableTable${codigo}`);
    const filas = tabla.getElementsByTagName("tr");

    for (let i = 1; i < filas.length; i++) {
        filas[i].style.display = "";  
            
    }
    const selectopciones = document.querySelector(`#Opciones${codigo}`);
    selectopciones.innerHTML='<option value=""></option>';
    filtrar_por_rubros();
}

function obtenerDatosfiltracion(selectItems) {
    const selectopciones = document.querySelector(`#Opciones${codigo}`);

    const selectedValue = selectItems.value; 
    const htmlopciones = document.querySelector(`#${selectedValue}${codigo}`).innerHTML;

    selectopciones.innerHTML = `<option value="" disabled selected>Seleccione un opción</option>`+htmlopciones;
    console.log(htmlopciones);
}
function mostrarSeccion(section) {
    const contentArea = document.getElementById(`content-area${codigo}`);
    contentArea.innerHTML = ''; 
    switch(section) {
        case 'etapasproduccion':
            modaletapasproduccion();
            break;
            
        case 'producto_conservacion':
            producto_conservacion();
            break;
        
        case 'INICIO_HOME':
            let containerClosed = document.getElementById(`content-area${codigo}`);
            containerClosed.style.display = 'none';
            let containerOpen = document.getElementById(`principal${codigo}`);
            containerOpen.style.display = 'block';
            break;
        default:
            contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}

function toggleFormTable(e,toggleButton,forme,tableprod) {

    if (forme.style.display === "none") {
        forme.style.display = "block";
        setTimeout(() => {
            forme.style.height = forme.scrollHeight + "px";
            forme.style.opacity = 1;
        }, 10);  

        tableprod.style.height = "0";
        tableprod.style.opacity = 0;
        setTimeout(() => {
            tableprod.style.display = "none";
        }, 500);
        toggleButton.classList.remove("btn-outline-success"); 
        toggleButton.classList.add("btn-outline-danger"); 
        toggleButton.innerHTML = `<i class="bi bi-dash-lg danger"></i>`;
    } else {
        tableprod.style.display = "block";
        setTimeout(() => {
            tableprod.style.height = tableprod.scrollHeight + "px";
            tableprod.style.opacity = 1;
        }, 10);  

        forme.style.height = "0";
        forme.style.opacity = 0;
        setTimeout(() => {
            forme.style.display = "none";
        }, 500);
         
        toggleButton.classList.remove("btn-outline-danger"); 
        toggleButton.classList.add("btn-outline-success");
        toggleButton.innerHTML = `<i class="bi bi-plus"></i>`;
    }
}
function filtrar_table(input) {
    filtrar_por_rubros();
    filtrarBusqueda();
    const selectrubro = document.querySelector(`#buscar_porRubro${codigo}`);
    const selectedOpcText = selectrubro.options[selectrubro.selectedIndex].text.toLowerCase();

    const selectopciones = document.querySelector(`#Opciones${codigo}`);
    const selectedOpcText2 = selectopciones.options[selectopciones.selectedIndex].text.toLowerCase();

    const table = document.getElementById(`editableTable${codigo}`);
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = tbody.getElementsByTagName('tr');

    const filter = input.value.toLowerCase(); // Capturar el valor del input filtrado

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.getElementsByTagName('td');
        let rowText = '';
        if(row.style.display !== 'none'){
            for (let j = 0; j < cells.length; j++) {
                rowText += cells[j].textContent.toLowerCase() + ' ';
            }
    
            if (rowText.includes(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
        
    }
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
    const producto_obj = List_Producto.find(obj => obj.idproduct_comercial === Number(inpId));
    if (!producto_obj) {
        console.error(`Product with id ${inpId} not found`);
        return;
    }
    const confirm = { ...producto_obj };

    let input;
    const isSelect = ["rubro", "seccion", "unidadtiempo", "idcategorias_p", "idmedida_p", "idestadosproductos_p", "idunidad_p"].includes(inpKey);

    if (isSelect) {
        input = createSelectElement(inpKey);
        if (!input) {
            alertas(["info", `No se encontró el elemento con id #${inpKey}${codigo}`]);
            return;
        }
        input.style.width = "150px";
        input.value = producto_obj[inpKey2];
    } else {
        const inputType = ["cantidad", "tiempo"].includes(inpKey) ? "number" : "text";
        input = document.createElement("input");
        input.type = inputType;
        input.value = originalValue;
        input.className = "form-control";
        input.style.width = "150px";
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
        console.log(inpKey2);
        producto_obj[inpKey2] = aux;
        target.textContent = isSelect ? input.options[input.selectedIndex].text : newValue;

        if (!areObjectsEqual(producto_obj, confirm)) {
            const formData = new FormData();
            formData.append('ver', "editar_producto_comercial");
            formData.append('empresa',uk[0].empresa.idempresa );
            Object.entries(producto_obj).forEach(([key, value]) => formData.append(key, value));
            obt_producto_aux = { ...obt_producto_aux, ...confirm };
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
function listar_productos_comercial(){
    return fetch(`${URL_APIP}/api/listar_productos_comercial/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        // const jsonString = JSON.stringify(data);
        // localStorage.setItem("clientes", jsonString);
        List_Producto.length=0;
        List_Producto = data;
        console.log(List_Producto);
        listar_productos_comercial_Array();
    })
}
function listar_productos_comercial_Array(){
  
    const listar=document.querySelector(`#listar_productos_comercial${codigo}`);
    let view="",ind=1;
        List_Producto.map(lista=>{
            let estados;
                let actualizar;
                let eliminar;
            let est = lista.estado === 0 ? `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>` : `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`;
           
            
            let itemrubro = list_rubro.find(obj => obj.id === lista.rubro_idrubro) || {
                "id": 0,
                "rubro": "-",
                "detalle": "-"
            };
          
            let itemunidadTiempo = list_unidadTiempo.find(obj => obj.id === lista.Unidad_tiempo_idUnidad_tiempo) || {
                "id": 0,
                "unidad": "-"
            };
            let itemcategoria = list_categoria.find(obj => obj.id === lista.categorias_id_categorias) || {
                "id" : -1,
                "nombre" : '-',
                "descripcion" : '-',
                "estado" : '-'
            }
            let item_medida_cm = list_medida.find(obj => obj.id === lista.medida_id_medida) || {
                'id':-1,
                'nombre_medida':'-',
                'descripcion':'-',
                'estado':-1,
            }
          
            let item_estado_cm = list_estados.find(obj => obj.id === lista.estados_productos_id_estados_productos) ||{
                "id" : -1,
                "tipos_estado" : '-',
                "descripcion" : '-',
                "estado" : ''
            }
            let item_unidad_cm = list_unidad.find(obj => obj.id === lista.unidad_id_unidad) || {
                'id':-1,
                'nombre':'-',
                'descripcion':'-',
                'estado':-1,
            }
            estados = {
                0: ``,
                1: `<a data-id="editar_estado_producto,${lista.idproduct_comercial}"  class="btn">
                        ${est}
                    </a>`
                
            };
            actualizar = {
                0: ``,
                1: `<a data-id="editar_producto_comercial,${lista.idproduct_comercial}" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil-square"></i>
                    </a>`

            }
            eliminar = {
                0: ``,
                1: `<a data-id="eliminar_producto,${lista.idproduct_comercial}" class="btn btn-danger btn-sm" >
                        <i class="bi bi-trash"></i>
                    </a> `
            }
            view+=`
                <tr style = "style=width: 50px; height: 50px;" >
                    <td>${ind++}</td>                
                    <td >${lista.fecha_registro}</td>

                    <td data-type="${lista.idproduct_comercial},nombre">${lista.nombre}</td>
                    <td data-type="${lista.idproduct_comercial},codigo">${lista.codigo}</td>
                    <td data-type="${lista.idproduct_comercial},descripcion">${lista.descripcion}</td>
                    <td data-type="${lista.idproduct_comercial},cod_barras">${lista.cod_barras}</td>
                    
                    <td data-type="${lista.idproduct_comercial},idcategorias_p,categorias_id_categorias">${itemcategoria.nombre}</td>
                    <td data-type="${lista.idproduct_comercial},idmedida_p,medida_id_medida">${item_medida_cm.nombre_medida}</td>
                    <td data-type="${lista.idproduct_comercial},idestadosproductos_p,estados_productos_id_estados_productos">${item_estado_cm.tipos_estado}</td>
                    <td data-type="${lista.idproduct_comercial},idunidad_p,unidad_id_unidad">${item_unidad_cm.nombre}</td>

                    <td data-type="${lista.idproduct_comercial},rubro,rubro_idrubro">${itemrubro.rubro}</td>

                    <td data-type="${lista.idproduct_comercial},cantidad">${lista.cantidad !== null ? lista.cantidad : '-'}</td>
                    <td data-type="${lista.idproduct_comercial},tiempo">${lista.tiempo_produccion !== null ? lista.tiempo_produccion : '-'}</td>
                    <td data-type="${lista.idproduct_comercial},unidadtiempo,Unidad_tiempo_idUnidad_tiempo">${itemunidadTiempo.unidad}</td>

                    <td><img src="${URL_APIP + lista.imagen}" alt="${lista.nombre}" style="width: 50px; height: 50px;"></td>
                    <td  style="text-align: center; vertical-align: middle;">
                         ${estados[privilegios[2]]}
                    </td>

                    <td>
                       ${actualizar[privilegios[2]]}
                       ${eliminar[privilegios[3]]} 
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
    const selectItems = document.querySelector(`#buscar_porRubro${codigo}`);
    const selectedValue = selectItems.value;
    dato.append('rubro',selectedValue);
    dato.append('fecha_registro', currentDate);

    for (let [key, value] of dato.entries()) {
        console.log(key, value);
    }
    fetch(`${URL_APIP}/api/`, {
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


function alertas(data) {

    console.log(data);
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;
        if(data[2]=="editar_estado_producto"){
            return;
        }
        // Resetear el formulario si existe 
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        
        
        
        if(data[2]==="registrar_producto"){
            listar_productos_comercial();
            const forme = document.querySelector(`#formulario${codigo}`);
            const tableprod = document.querySelector(`#tableProducto${codigo}`);
            let e;
            const toggleButton = document.getElementById(`toggleButton${codigo}`);
            toggleFormTable(e,toggleButton,forme,tableprod);

        }
        
        
        if(data[2]==="eliminar_producto"){
            List_Producto = List_Producto.filter(obj => obj.id !== Number(obt_producto_aux['id']));
            listar_producto_Array();
            obt_producto_aux = { ...{
                "id": 0,
                "nombre": "",
                "codigo": "",
                "estado": 0,
                "medida": 0,
                "rubro": 0,
                "seccion": 0,
                "idestandar": 0,
                "cantidad": 0,
                "tiempo": 0,
                "unidadtiempo": 0
            } };
        }
        if(data[2]==="editar_producto_comercial"){
            
            obt_producto_aux = { ...{
                "id": 0,
                "nombre": "",
                "codigo": "",
                "estado": 0,
                "medida": 0,
                "rubro": 0,
                "seccion": 0,
                "idestandar": 0,
                "cantidad": 0,
                "tiempo": 0,
                "unidadtiempo": 0
            } };
        }
        
       
    } else {
        if(data[0] == "Error"){
            

            if(data[2]==="editar_producto_comercial"){
                const obj = List_Producto.find(ob => ob.id === obt_producto_aux['id']);

                console.log(obt_producto_aux);

                console.log(obj);
                if (obt_producto_aux) {
                    Object.assign(obj, obt_producto_aux);
                }
                console.log(obt_producto_aux);

                console.log(obj);
                console.log(List_Producto);

                listar_producto_Array();

                obt_producto_aux = { ...{
                    "id": 0,
                    "nombre": "",
                    "codigo": "",
                    "estado": 0,
                    "medida": 0,
                    "rubro": 0,
                    "seccion": 0,
                    "idestandar": 0,
                    "cantidad": 0,
                    "tiempo": 0,
                    "unidadtiempo": 0
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
