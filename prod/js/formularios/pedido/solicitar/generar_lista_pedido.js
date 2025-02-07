import { codigos } from "../constantes.js";
import { URL_APIP } from "../../../../../lib/services.js";
import * as listarFunctions from "../../funciones/listar.js";
import { lista_pedidos_material } from "../pedidos/pedidos.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 1;
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigoregistrar_pedido;
let Lista_Material = [];
let Lista_envases = [];
let Lista_rubro = [];
let Lista_medida = [];
let intervaloId;
let isEditing = false;
let Lista_pedido_detalle=[];

export function Generar_lista_pedido(code_, permisos_, refrescar_) {
    code = code_;
    permisos =  permisos_;
    refrescar = refrescar_;
    app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
    
    sitio();    
    
}




async function listar() {
    try {
      const idEmpresa = uk[0].empresa.idempresa;
  
      // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
      const resultados = await Promise.all([
        listarFunctions.listar_api_general("listar_rubro", idEmpresa),
        listarFunctions.listar_api_general("listar_material", idEmpresa),
        listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
        listarFunctions.listar_api_general("listaenvases", idEmpresa),
      ]);
      // Asignamos los resultados a las variables correspondientes
      Lista_rubro = resultados[0];
      Lista_Material = resultados[1];
      Lista_medida = resultados[2];
      Lista_envases = resultados[3];

    } catch (error) {
      console.error("Error al listar datos: ", error);
      throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
  }

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1] = dataid.split(',');
    switch (funcion) {
        case "eliminar_material_pedido":
            eliminar_material_pedido(id1);
            break;
        
        case "editar":
            toggleEditSave(event);
            break;
        default:
            sitio();
            break;
    }

}
function eliminar_material_pedido(idmaterial){
    if (confirm("Desea eliminar...?")) {
        Lista_pedido_detalle = Lista_pedido_detalle.filter(orden => Number(orden.material_idmaterial) !== Number(idmaterial));
        Listar_pedidoAlmacen();
        
    }
}
function toggleEditSave(event) {
    
    const permisos = [ 2, 3];
    const names = ["cantidad", "observaciones"];
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const obj_seleccionado = Lista_pedido_detalle.find(obj => obj.material_idmaterial=== Number(id1));
    console.log(obj_seleccionado);

    const obj_seleccionadoc = { ...obj_seleccionado };
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
                if (index === 1 ) {
                    
                    input = createSelectElement(names[permisos.indexOf(index)]); // Crear el elemento select correctamente
                    if (input) {
                        celda.innerHTML = '';
                        input.value = obj_seleccionado[names[permisos.indexOf(index)]];

                        celda.appendChild(input);
                    } else {
                        console.error(`No se encontró el elemento con id #${names[index]}`);
                        return;
                    }
                } else {
                    if(index === 2){
                        input = document.createElement('input');
                        input.id = `ediinp${codigo}`;
                        input.className = "form-control";
                        input.type = "number";
                        input.value = valorOriginal;
                        celda.innerHTML = '';
                        celda.appendChild(input);
                    }else{
                        input = document.createElement('input');
                        input.id = `ediinp${codigo}`;
                        input.className = "form-control";
                        input.type = "text";
                        input.value = valorOriginal;
                        celda.innerHTML = '';
                        celda.appendChild(input);
                    }
                }

                input.addEventListener("keydown", handleKeyDown);

                if (!firstInput) {
                    firstInput = input;
                }
            }
        });

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
                        if(index === 2){
                            datosnuevos.push(Number(nuevoValor));
                        }else{
                            datosnuevos.push(nuevoValor);
                        }
                        
                        linea *= true;
                    } else {
                        linea *= false;
                    }
                } else if (select) {
                    nuevoValor = select.value;
                    console.log(nuevoValor);
                    celda.textContent = select.options[select.selectedIndex].text;
                    datosnuevos.push(Number(nuevoValor));

                }
                
            }
        });
        console.error(linea);
        
        if(linea){
            obj_seleccionadoc[names[0]] = datosnuevos[0];
            obj_seleccionadoc[names[1]] = datosnuevos[1];
     
            // if (obj_seleccionado) {
            //     Object.assign(Lista_pedido_detalle, obj_seleccionado);
            // }
            console.log(obj_seleccionado);
            console.log(obj_seleccionadoc);
            console.log(areObjectsEqual(obj_seleccionado, obj_seleccionadoc));
            if (!areObjectsEqual(obj_seleccionado, obj_seleccionadoc)) {
                editarOrdenProduccion(id1,obj_seleccionadoc);
            }


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

async function sitio(){
    
     let view = `
    <div class="container">
        <form id="formulario_pedido${codigo}">
            <input type="hidden" name="estado" value="0">
            <input type="hidden" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" name="empleado_idempleado" value="${uk[0].idusuario}">
            <div class="row">
                <div class="col-md-4">
                    <label for="rubro_idrubro" class="form-label">Linea de produccion:</label>
                    <select class="form-select" id="rubro_idrubro${codigo}" name="rubro_idrubro" required>
                        <option value="" disabled selected>Seleccione un rubro</option>
                        
                    </select>
                </div>  
            </div>
            <div class="row">
                <div  class="col-lg-12 col-md-12 border p-3 rounded mt-4">
                    <div class="row">
                        <div class="col-md-4">
                            <label for="empleado" class="form-label">Usuario:</label>
                            <input type="text" class="form-control" style=" border: none; background-color: transparent;color: inherit; pointer-events: none;" id="empleado" name="empleado" value = "${uk[0].nombre}" readonly>
                        </div>

                        <div class="col-md-4">
                            <label for="fecha_p" class="form-label">Fecha:</label>
                            <input type="date" class="form-control" id="fecha${codigo}" name="fecha_p">
                        </div>

                        <div class="col-md-4">
                            <div class="row">
                                <div class = "col">
                                    <label for="hora" class="form-label">Hora solicitud:</label>
                                    <input type="text" class="form-control" id="hora${codigo}" name="hora">
                                </div>
                                <div class="col mt-4">
                                    <button type="button" id="editarHora${codigo}" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Editar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </form>
        <form id="formulario${codigo}" >   
            <div class="row">
                <div class="col-lg-12 col-md-12 border p-3 rounded mt-4" >
                    <div class="row">
                        <div style="position: relative;" class="col-md-4">
                            <input type="hidden" name="material_idmaterial" id="material_idmaterial${codigos.codigo_pedido_material}" required >

                            <label for="material" class="form-label">Material-Insumo:</label>
                            <input type="text" id="searchInput${codigos.codigo_pedido_material}" placeholder="Buscar..." class="form-control" name="material" required>
                            <ul id="dropdownList${codigos.codigo_pedido_material}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                        </div>
                        <div class="col-md-2">
                            <label for="cantidad_envases" class="form-label">N° Empaques:</label>
                            <input type="number" class="form-control" id="cantidad_envases" name="cantidad_envases" step="0.01" required>
                        </div>
                        
                        <div style="position: relative;" class="col-md-2">
                            <input type="hidden" name="tipo_envase_idtipo_envase" id="tipo_envase_idtipo_envase${codigos.codigo_pedido_envase}" required>

                            <label for="envase" class="form-label">Empaque:</label>
                            <input type="text" id="searchInput${codigos.codigo_pedido_envase}" placeholder="Buscar..." class="form-control" name="envase" required>
                            <ul id="dropdownList${codigos.codigo_pedido_envase}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                        </div>
                        <div class="col-md-3">
                            <label for="peso_neto" class="form-label">Cantidad:</label>
                            <input type="number" class="form-control" id="peso_neto" name="peso_neto" step="0.01" required>
                        </div>
                        <div class="col-md-1">
                            <label for="medida" class="form-label">Medida:</label>
                            <input type="text" class="form-control" id="medida${codigo}" name="medida" readonly required>
                        </div>
                        
                     
                    </div>
                    
                </div>
                
            </div>
            


            <div class="col-md-12 mt-3 d-flex justify-content-between">
                <button type="button" class="btn btn-primary btn-sm" id = "limpiar${codigo}">Limpiar</button>
                <button type="submit" class="btn btn-success btn-lg"><i class="bi bi-plus-lg"></i></button>
            </div>
        </form>
        <div id="alerta${codigo}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Codigo</th>
                    <th scope="col">Material</th>
                    <th scope="col">N° Empaques</th>
                    <th scope="col">Empaque</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Total</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="Listar_pedido_material${codigo}">
              
            </tbody>
        </table>
        <div class="col-md-12 mt-3 d-flex justify-content-between">
            <button type="button" class="btn btn-primary btn-sm" id="cancelar${codigo}">Cancelar</button>
            <button type="button" class="btn btn-success btn-lg" id="registrar${codigo}">Registrar</button>
        </div>
    </div>`;
    app.innerHTML=view;
    await listar();
    select_lista_rubros();    

        const horaInput = document.getElementById(`hora${codigo}`);
        const editarHoraBtn = document.getElementById(`editarHora${codigo}`);
        if (horaInput) {
            intervaloId =  setInterval(actualizarHora, 1000);
            establecerFechaHoy();
        }
        editarHoraBtn.addEventListener('click', function() {
            isEditing = !isEditing; 
            if (isEditing) {
                clearInterval(intervaloId);
                horaInput.type = 'time'; 
                horaInput.id = 'hora_editable';
                const now = new Date();
                const offset = -4; 
                now.setHours(now.getHours() + offset);
                
                const hours = String(now.getUTCHours()).padStart(2, '0');
                const minutes = String(now.getUTCMinutes()).padStart(2, '0');
            
                horaInput.value = `${hours}:${minutes}`;
                editarHoraBtn.textContent = 'Hora actual';
            } else {
                horaInput.type = 'text'; 
                horaInput.id = `hora${codigo}`;

                intervaloId = setInterval(actualizarHora, 1000); 
                editarHoraBtn.textContent = 'Editar hora';
            }
        });

        
        //===========================

       
        initializeDropdownSearch(codigos.codigo_pedido_material, Lista_Material,'codigo','nombre',true);
        initializeDropdownSearch_(codigos.codigo_pedido_envase, Lista_envases,'nombre',false);



        //===========================

        const forme = document.querySelector(`#formulario${codigo}`);
        forme.addEventListener("submit", (e) => Agregar_a_lista(e, forme));
        const table = document.getElementById(`editableTable${codigo}`);
        table.addEventListener("dblclick",(e) => edit_Celda_table(e));
        const limpiar = document.querySelector(`#limpiar${codigo}`);
        limpiar.addEventListener('click',() => {
                
            forme.reset();
            establecerFechaHoy();
        });
        const formulario = document.getElementById(`formulario_pedido${codigo}`);
        const btncancelar = document.querySelector(`#cancelar${codigo}`);
        btncancelar.addEventListener('click', ()=>{
            cancelar_todo(true);
        })
        const btnregistrar = document.querySelector(`#registrar${codigo}`);
        btnregistrar.addEventListener('click', (e) => {
            
            if (!formulario.checkValidity()) {
                formulario.reportValidity(); // Muestra los mensajes de error de validación
                return;
            }
            e.preventDefault();
            
            let pedido_json = {};
            if (Lista_pedido_detalle && Lista_pedido_detalle.length > 0) {
                const dato = new FormData(formulario);
                dato.append('verDavid', "registro_lista_pedidos");
                for (let [key, value] of dato.entries()) {
                    if(key !== "cantidad" && key !== "empleado" && key !== "material" && key !== "material_idmaterial" && key !== "medida"  && key !== "observaciones"){
                        pedido_json[key] = value;
                    }
                }
                for (let [key, value] of Lista_pedido_detalle.entries()) {
                    console.log(key,value);
                }
                pedido_json['idpedido'] = 0;
                pedido_json['detalle'] = Lista_pedido_detalle;
                console.log(pedido_json);

                fetch(`${URL_APIP}api/`, {
                    method: "POST", // Método HTTP
                    headers: {
                      "Usar-Registro-David": "true",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(pedido_json), // Convertir el objeto JS a JSON antes de enviarlo
                })
                .then((response) => response.json()) // Procesar la respuesta en formato JSON
                .then((data) => {
                      console.log(data);
                      alertas(data);
                })
                .catch((error) => console.error("Error:", error));
            }else{
                alert("Lista vacia");
            }
            
            
        })
        const selectrubro=document.querySelector(`#rubro_idrubro${codigo}`);
        selectrubro.addEventListener('change',()=>{
            
            cancelar_todo(false);
        });

 }

 function parametros_extras(item){
    if(item['rubro_idrubro']){
        const medida = Lista_medida.find((obj) => Number(obj.id) === Number(item.medida));
        document.getElementById(`material_idmaterial${codigos.codigo_pedido_material}`).value = item.id;
        document.getElementById(`medida${codigo}`).value = medida.nombre; 
    
    }else{
        document.getElementById(`tipo_envase_idtipo_envase${codigos.codigo_pedido_envase}`).value = item.id;

    }
               
}

 function cancelar_todo(salir){
    //forme.reset();
    
    Lista_pedido_detalle = [];
    Listar_pedidoAlmacen();
    establecerFechaHoy();
    if(salir){
        lista_pedidos_material(code,permisos,refrescar);
    }
    
}
function initializeDropdownSearch(codigo, Lista_Material,clave, valor, condicion) {
    const searchInput = document.getElementById(`searchInput${codigo}`);
    const dropdownList = document.getElementById(`dropdownList${codigo}`);

    // Crear la lista inicial
    function populateDropdown(filteredItems) {
        dropdownList.innerHTML = ''; // Limpia la lista
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent =item [clave] + " "+item[valor];
            li.style.padding = "5px 10px";
            li.style.cursor = "pointer";
            li.style.borderBottom = "1px solid #ddd"; // Línea de separación
            li.style.borderRadius = '8px';
            li.style.transition = "background-color 0.3s"; // Efecto suave al cambiar el color

            // Efecto hover
            li.addEventListener("mouseenter", () => {
                li.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
                li.style.color = "white";
            });

            li.addEventListener("mouseleave", () => {
                li.style.backgroundColor = "";
                li.style.color = "";
            });

            // Seleccionar el item
            li.addEventListener('click', () => {
                
                searchInput.value = item [clave] +" "+ item[valor];
                
                
                dropdownList.style.display = 'none'; // Oculta la lista
                parametros_extras(item);
            });

            dropdownList.appendChild(li);
        });
    }

    // Filtrar la lista según el texto ingresado
    function filterItems(searchText) {
        if(condicion){
            const filterLista = Lista_Material.filter((obj) => !Lista_pedido_detalle.some(list_mp => Number(list_mp.material_idmaterial) === Number(obj.id)) );

            const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoregistrar_pedido}`).value;
            const filterListaRubro = filterLista.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
            const filtered = filterListaRubro.filter(item =>
                item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
                item[clave].toLowerCase().includes(searchText.toLowerCase())
            );
            
            populateDropdown(filtered);
        }else{
            const filtered = Lista_Material.filter(item =>
                item.nombre.toLowerCase().includes(searchText.toLowerCase())
            );
            populateDropdown(filtered);
        }
        
    }

    // Mostrar y manejar eventos del input
    searchInput.addEventListener('focus', () => {
        dropdownList.style.display = 'block';
        if(condicion){
            const filterLista = Lista_Material.filter((obj) => !Lista_pedido_detalle.some(list_mp => Number(list_mp.material_idmaterial) === Number(obj.id)) );
            const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoregistrar_pedido}`).value;
            const filterListaRubro = filterLista.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
            populateDropdown(filterListaRubro); // Muestra todos los elementos inicialmente
        }else{
            
            populateDropdown(Lista_Material); // Muestra todos los elementos inicialmente
        }
       
    });

    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value;
        filterItems(searchText); // Filtra la lista
    });

    // Ocultar el dropdown si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest(`#searchInput${codigo}`) && !e.target.closest(`#dropdownList${codigo}`)) {
            dropdownList.style.display = 'none';
        }
    });
}
function initializeDropdownSearch_(codigo, Lista_Material, valor, condicion) {
    const searchInput = document.getElementById(`searchInput${codigo}`);
    const dropdownList = document.getElementById(`dropdownList${codigo}`);

    // Crear la lista inicial
    function populateDropdown(filteredItems) {
        dropdownList.innerHTML = ''; // Limpia la lista
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item[valor];
            li.style.padding = "5px 10px";
            li.style.cursor = "pointer";
            li.style.borderBottom = "1px solid #ddd"; // Línea de separación
            li.style.borderRadius = '8px';
            li.style.transition = "background-color 0.3s"; // Efecto suave al cambiar el color

            // Efecto hover
            li.addEventListener("mouseenter", () => {
                li.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
                li.style.color = "white";
            });

            li.addEventListener("mouseleave", () => {
                li.style.backgroundColor = "";
                li.style.color = "";
            });

            // Seleccionar el item
            li.addEventListener('click', () => {
                
                searchInput.value = item[valor];
                
                
                dropdownList.style.display = 'none'; // Oculta la lista
                parametros_extras(item);
            });

            dropdownList.appendChild(li);
        });
    }

    // Filtrar la lista según el texto ingresado
    function filterItems(searchText) {
        if(condicion){
            const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoregistrar_pedido}`).value;
            const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
            const filtered = filterListaRubro.filter(item =>
                item.nombre.toLowerCase().includes(searchText.toLowerCase())
            );
            populateDropdown(filtered);
        }else{
            const filtered = Lista_Material.filter(item =>
                item.nombre.toLowerCase().includes(searchText.toLowerCase())
            );
            populateDropdown(filtered);
        }
        
    }

    // Mostrar y manejar eventos del input
    searchInput.addEventListener('focus', () => {
        dropdownList.style.display = 'block';
        if(condicion){
            const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoregistrar_pedido}`).value;
            const filterListaRubro = Lista_Material.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
            populateDropdown(filterListaRubro); // Muestra todos los elementos inicialmente
        }else{
            
            populateDropdown(Lista_Material); // Muestra todos los elementos inicialmente
        }
       
    });

    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value;
        filterItems(searchText); // Filtra la lista
    });

    // Ocultar el dropdown si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest(`#searchInput${codigo}`) && !e.target.closest(`#dropdownList${codigo}`)) {
            dropdownList.style.display = 'none';
        }
    });
}

function select_lista_rubros(){
    console.log(Lista_rubro);
    const selectrubro=document.querySelector(`#rubro_idrubro${codigo}`);
    let view = "";
    Lista_rubro.map(lista =>{
        view+=`
                <option value="${lista.id}">${lista.rubro}</option>
            `;
    })
    selectrubro.innerHTML = view;
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
 function Agregar_a_lista(e,forme){
    e.preventDefault();
    
    let nuevoObjeto = {};
    const dato=new FormData(forme);
    for (let [key, value] of dato.entries()) {
        if(key === "cantidad_envases"  ||  key === "peso_neto"  || key === "material_idmaterial" || key === "tipo_envase_idtipo_envase"){
            nuevoObjeto[key] = value;
        }
        
    }
    nuevoObjeto['pedido_idpedido'] = 0;
    nuevoObjeto['iddetalle_pedido'] = 0;
    console.log(nuevoObjeto);
    if(Agregar_Lista_pedido(nuevoObjeto)){
        Listar_pedidoAlmacen();
        establecerFechaHoy();
        forme.reset();
    }
 }
 function Listar_pedidoAlmacen(){
    const tablaListar = document.getElementById(`Listar_pedido_material${codigo}`);
    let view = "", ind = 1;
    console.log(Lista_pedido_detalle);
    Lista_pedido_detalle.map(lista=>{
        let item_material = Lista_Material.find(obj => Number(obj.id) === Number(lista.material_idmaterial)) || {"id": 0,"nombre": "-","codigo": "-",};
        let item_envase = Lista_envases.find(obj => Number(obj.id) === Number(lista.tipo_envase_idtipo_envase)) || {'nombre': '-'};
        let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(item_material.medida)) || {'nombre':'-'};
        
        view +=`
            <tr>
                <td>${ind++}</td>     
                <td data-type="${lista.material_idmaterial},codigo"> ${item_material.codigo}</td>           
                <td data-type="${lista.material_idmaterial},material_idmaterial">${item_material.nombre} </td>
                <td data-type="${lista.material_idmaterial},cantidad_envases">${lista.cantidad_envases}</td>
                
                <td data-type="${lista.material_idmaterial},tipo_envase_idtipo_envase">${item_envase.nombre}</td>
                <td data-type="${lista.material_idmaterial},peso_neto">${lista.peso_neto}</td>
              
                <td data-type="${lista.material_idmaterial},Total">${Number(lista.cantidad_envases)*Number(lista.peso_neto)} ${item_medida.nombre}</td>
                <td>
                    
                    <a data-id="eliminar_material_pedido,${lista.material_idmaterial}" class="btn btn-danger btn${codigo}">
                        <i class="bi bi-trash"></i>
                    </a> 
                                                
                </td>
            </tr>
        
        `;
    });
    tablaListar.innerHTML = view;
    const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menu);
        });
 }

function edit_Celda_table(e) {
    const target = e.target;
    if (target.tagName.toLowerCase() !== "td" || target.classList.contains("editing")) return;

    const originalValue = target.textContent.trim();
    const [inpId, inpKey, inpKey2] = target.getAttribute("data-type").split(',');
    const objetoSelect = Lista_pedido_detalle.find(obj => obj.material_idmaterial === Number(inpId));
    if (!objetoSelect) {
        console.error(`material with id ${inpId} not found`);
        return;
    }
    const confirm = { ...objetoSelect };

    let input;
    const isSelect = [].includes(inpKey);

    if (isSelect) {
        input = createSelectElement(inpKey);
        if (!input) {
            alertas(["info", `No se encontró el elemento con id #${inpKey}${codigo}`]);
            return;
        }
       // input.style.width = "150px";
        input.value = objetoSelect[inpKey];
    } else {
        const inputType = ["cantidad"].includes(inpKey) ? "number" : "text";
        input = document.createElement("input");
        input.type = inputType;
        input.value = originalValue;
        input.className = "form-control";
      //  input.style.width = "150px";
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
        console.log(aux);
        objetoSelect[inpKey] = aux;
        target.textContent = isSelect ? input.options[input.selectedIndex].text : newValue;

        if (!areObjectsEqual(objetoSelect, confirm)) {
           Listar_pedidoAlmacen();
           console.log(Lista_pedido_detalle)

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
function Agregar_Lista_pedido(nueva_solicitud) {
    let existeProducto = Lista_pedido_detalle.some(orden => Number(orden.material_idmaterial) === Number(nueva_solicitud.material_idmaterial));
    if (!existeProducto) {
        Lista_pedido_detalle.push(nueva_solicitud);
        console.log("Producto agregado correctamente.");
        return true;
    } else {
        alert("Este producto ya existe en la lista.");
        return false;
    }
}
function eliminarOrdenProduccion(id) {
    console.log(Lista_pedido_detalle);
    console.log(id);
    if (confirm("Desea eliminar...?")) {
        Lista_pedido_detalle = Lista_pedido_detalle.filter(orden => orden.material_idmaterial !== Number(id));
        Listar_pedidoAlmacen();
    }
} 
function editarOrdenProduccion(id, nuevosDatos) {
    console.log(id);
    console.log(nuevosDatos);
    const index = Lista_pedido_detalle.findIndex(orden => orden.material_idmaterial === Number(id));
    console.log(index);
    if (index !== -1) {
        Lista_pedido_detalle[index] = { ...Lista_pedido_detalle[index], ...nuevosDatos };
    } else {
        console.log('Orden no encontrada');
    }
    Listar_pedidoAlmacen();
}
function establecerFechaHoy() {
    const fechaInput = document.getElementById(`fecha${codigo}`);
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); 
    const dia = hoy.getDate().toString().padStart(2, '0'); 

    const fechaFormateada = `${anio}-${mes}-${dia}`;
    
    fechaInput.value = fechaFormateada;
}
function actualizarHora() {
    const horaInput = document.getElementById(`hora${codigo}`);
    if(horaInput) {
        const now = new Date();
        const offset = -4; // Bolivia es UTC-4
        now.setHours(now.getHours() + offset);
        
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}:${seconds}`;
    
        horaInput.value = currentTime;
    }
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
            if(alertClass === "alert-success"){
                lista_pedidos_material(code,permisos,refrescar);
            }
            divalert.innerHTML = ``;

            
        }, timeoutDuration);
    }
}




