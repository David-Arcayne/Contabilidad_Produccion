import { URL_APIP } from "../../../../../lib/services.js";
import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { etapas_produccion } from "../principal.js";
import { grupo_etapas_produccion } from "./grupo.js";


let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let Lista_Productos =[];
let Lista_empleados = [];
let Lista_etapas_produccion =[];
let Lista_seccion=[];
let Lista_grupo_etapas = [];


const codigo = codigos.codigoGrupo_producto;
export async function registro_grupo_productos(code, permisos, refrescar) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    app=document.querySelector(`#content-area${codigos.codigosubmenu_grupo}`);
    
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.listar_etapas_produccion(idEmpresa),
            listarFunctions.listarseccion(idEmpresa),
            listarFunctions.listar_productos_comercial(idEmpresa),
            listarFunctions.listar_grupo_etapas(idEmpresa),
        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_etapas_produccion = resultados[1];
        Lista_seccion = resultados[2];
        Lista_Productos = resultados[3];
        Lista_grupo_etapas = resultados[4];
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}




async function sitio(){
    let view="",ind=1;
        view +=`
        <div class="row">
            <div class="select-container" id="select2" style="width: 300px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; margin: 5px auto;">
                <div class="row">
                    <label for="grupos" class="form-label fw-bold fs-6">Seleccionar grupo</label>
                    <select class="form-select" id="grupo_etapas_idgrupo_etapas${codigo}" name="grupos">
                        <option value="1">grupo 1</option>
                        <option value="2">grupo 2</option>
                    </select>
                </div>
            </div>
            <div class="select-container" id="select2" style="width: 600px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; margin: 5px auto;">
                <label for="seccion2" class="form-label fw-bold fs-6">Seleccionar Productos</label>
                
                <div class="select-box" id="selectBox" style="border: 1px solid #ccc; padding: 10px; cursor: pointer; background-color: #fff; display: flex; justify-content: space-between; align-items: center;">
                    Productos <span>▼</span>
                </div>
                
                <div class="select-options" id="productos_idproductos${codigo}" style="display: none; border: 1px solid #ccc; border-top: none; max-height: 200px; overflow-y: auto; background-color: #fff;">
                    <div data-value="${1}">${"lista.caracteristica"}</div>
                    <div data-value="${2}">${"lista.caracteristica"}</div>
                    <div data-value="${3}">${"lista.caracteristica"}</div>
                </div>

                <div id="selection-info" style="padding-top: 10px;">0 productos seleccionados</div>
                
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="generar_formulario2" aria-label="generar">Añadir Productos a grupo</button>
            </div>
            
        </div>
        <div id="alerta${codigo}" class="mt-4"></div>

        <div style = "max-height: 400px; overflow-y: auto; display: block;">
                
            <table class="table table-bordered table-hover table-striped">
                <thead >
                    <tr class="table-dark">
                        <th>N°</th>
                        <th>Nombre</th>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Categoría</th>
                        <th>Caracteristica</th>
                        <th>Estado Producto</th>
                        <th>Unidad medida</th>
                        <th>Rubro</th>          
                        <th>Funciones</th>
                    </tr>
                </thead>
                <tbody id="Listar_productos${codigo}">
                    
                </tbody>
            </table>
        </div>    
        `;
    await listar();
    app.innerHTML=view;
    console.log(Lista_grupo_etapas);
    llenar_select_caracteristicas();
    let selectedOptions = configurarSelect('selectBox', `productos_idproductos${codigo}`, 'selection-info');

    console.log(selectedOptions);
    listar_productos_seleccionados(selectedOptions);
    const selectrubro = document.querySelector(`#buscar_porRubro${codigos.codigoPrincipal}`);

    selectrubro.addEventListener("change", eventHandler);
    async function eventHandler() {
        sitio();
        // Remueve el evento después de ejecutarse una vez
        selectrubro.removeEventListener("change", eventHandler);
    }
    select_grupo_etapas_idgrupo_etapas();
 }
 function listar_productos_seleccionados(List_product_select) {
    console.log("Lista_Productos:", Lista_Productos);
    console.log("List_product_select:", List_product_select);

    if (!Array.isArray(List_product_select) || List_product_select.length === 0) {
        console.warn("List_product_select está vacío o no es un arreglo válido.");
        return;
    }
    List_product_select.forEach((seleccionado, index) => {
        console.log(`Elemento en List_product_select [${index}]:`, seleccionado);
        console.log(`idproduct_comercial en seleccionado:`, seleccionado.idproduct_comercial);
    });
    // Crear el Set para la comparación
    const idProductosSeleccionados = new Set(
        List_product_select.map(seleccionado => String(seleccionado.idproduct_comercial).trim())
    );

    console.log("ID productos seleccionados en Set:", Array.from(idProductosSeleccionados));

    //Inspección detallada de cada ID en ambas listas
    Lista_Productos.forEach(producto => {
        const productoId = String(producto.idproduct_comercial).trim();
        const encontrado = idProductosSeleccionados.has(productoId);
        console.log(`ID producto: ${productoId} - ¿Encontrado en seleccionados?: ${encontrado}`);
    });

    //Filtrado de productos usando el Set
    let productos_filtrados = Lista_Productos.filter(producto => 
        idProductosSeleccionados.has(String(producto.idproduct_comercial).trim())
    );

    console.log("Productos filtrados:", productos_filtrados);

    if (productos_filtrados.length === 0) {
        console.warn("No se encontraron productos coincidentes.");
    }
}




 function select_grupo_etapas_idgrupo_etapas(){
    const grupos = document.getElementById(`grupo_etapas_idgrupo_etapas${codigo}`);
    const rubros_select=document.querySelector(`#buscar_porRubro${codigos.codigoPrincipal}`);
    if (!grupos || !rubros_select) {
        console.error("No se encontraron los elementos del DOM.");
        return;
    }
    let idrubro = rubros_select.value;
    let view = "";
    Lista_grupo_etapas.map(lista => {
        //console.log(lista);
        //console.log(idrubro);
        if(Number(lista.rubro_idrubro) === Number(idrubro)){   
            view +=`
                <option value="${lista.idgrupo_etapas}">${lista.nombre}</option>
            `;
        }

    })
    grupos.innerHTML = view;
}
 

 function configurarSelect(idSelectBox, idSelectOptions, idSelectionInfo) {
    const selectBox = document.getElementById(idSelectBox);
    const selectOptions = document.getElementById(idSelectOptions);
    const selectionInfo = document.getElementById(idSelectionInfo);
    let selectedOptions = [];

    selectBox.addEventListener('click', function() {
        selectOptions.style.display = selectOptions.style.display === 'block' ? 'none' : 'block';
    });

    selectOptions.addEventListener('click', function(event) {
        const clickedOption = event.target;

        if (clickedOption.tagName === 'DIV') {
            const optionValue = clickedOption.getAttribute('data-value');
            const optionText = clickedOption.textContent;

            const optionIndex = selectedOptions.findIndex(option => option.value === optionValue);

            if (optionIndex === -1) {
                selectedOptions.push({
                    'idproduct_comercial': Number(optionValue),
                    'text': optionText
                });
                clickedOption.classList.add('selected');
            } else {
                selectedOptions.splice(optionIndex, 1);
                clickedOption.classList.remove('selected');
            }

            updateSelectionInfo();
        }
    });

    function updateSelectionInfo() {
        const totalOptions = document.querySelectorAll(`#${idSelectOptions} div`).length;
        selectionInfo.textContent = `${selectedOptions.length} de ${totalOptions} productos seleccionados`;
    }

    document.addEventListener('click', function(event) {
        if (!selectBox.contains(event.target) && !selectOptions.contains(event.target)) {
            selectOptions.style.display = 'none';
        }
    });
    console.log(selectedOptions);
    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
        console.warn("List_product_select está vacío o no es un arreglo válido.");
        return;
    }
    return selectedOptions; // Devolver la lista de opciones seleccionadas para usar después
}

function llenar_select_caracteristicas(){

    const select_div =document.querySelector(`#productos_idproductos${codigo}`);
    const rubro = document.getElementById(`buscar_porRubro${codigos.codigoPrincipal}`);

    let view="",ind=1;
    let list = Lista_Productos.filter(obj => Number(obj.rubro_idrubro) === Number(rubro.value));
    list.map(lista=>{
        view+=`
            <div data-value="${lista.idproduct_comercial}"> <span class="fw-bold text-primary">Nombre Producto:</span> ${lista.nombre} <span class="fw-bold text-primary">Codigo producto:</span> ${lista.codigo}</div>
        `;
    })
    select_div.innerHTML=view;
}

function alertas(data) {
    console.log(data);
    // Definir las variables al principio
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "success") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;
        
        
    } else {
        if(data[0] == "danger"){

            
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