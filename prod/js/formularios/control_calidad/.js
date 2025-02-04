

import * as registrarFuntions from "../funciones/registrar.js";
import { control_calidad_pdf } from "./pdf_vista_previa.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let listas ;
let app = "";
let isEditing = false;
let intervaloId;
let privilegios;
let codigo;
const code = Array.from({ length: 5 }, () => rand()).join("") + "pendiente";
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function control_calidad_compra_encurso(codigor,lista,previle) {
    codigo = codigor;
    app=document.querySelector(`#filtrar${codigor}`);
    listas = lista;
    privilegios = previle;
    console.log(listas);
    sitio();    
    
}
function menuec(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, ids] = dataid.split(',');
     console.log(funcion,id1);
 
    switch (funcion) {
        
        case "mostrar_control_calidad":
            mostrar_control_calidad(id1);
            break;
            
        case "generar_form_control_calidad":
            generar_form_control_calidad(id1,ids);
            break;
            
        case "ver_documento":
            ver_documento(id1);
            break;
        default:
            sitio();
            break;
    }
}
function ver_documento(id){
    control_calidad_pdf(codigo,listas,privilegios);

}

function generar_form_control_calidad(id_Detalle,id){
    let item_detalle = listas.detallecalidad.find(obj => obj.iddetalle_control_calidad === (id_Detalle));
    let lista_dcc = listas.calidad.find(obj => obj.id == Number(id));
    let itemMaterial = seleccionar_entidad_tipo(item_detalle.entidad_tipo,item_detalle.entidad_id);

    let contenido = document.querySelector(`#tabla_control_calidad${codigo}`);
    contenido.style.display = 'none';
    let fromulario = document.querySelector(`#formulario_control_calidad${codigo}`);
    fromulario.style.display = 'block';
    let view = "";
   
    console.log(lista_dcc);
    view = `
    
         <div class="row">
            <div class="select-container">
                
                <label for="seccion" class="form-label fw-bold fs-6 row">Numero documento: ${lista_dcc.num_docu}</label>
                <label for="seccion" class="form-label fw-bold fs-6 row">Fecha: ${lista_dcc.fecha}</label>
                <label for="seccion" class="form-label fw-bold fs-6 row">Hora: ${lista_dcc.hora}</label>
                <label for="seccion" class="form-label fw-bold fs-6 row">${item_detalle.entidad_tipo}: ${itemMaterial.nombre}</label>
                <label for="seccion" class="form-label fw-bold fs-6 row">Cantidad: ${item_detalle.cantidad}</label>

            </div>
            <div class="select-container" id="select1">
                <label for="seccion1" class="form-label fw-bold fs-6">Seleccionar Características</label>
                <div class="select-box" id="selectBox1">Opciones características <span>▼</span></div>
                <div class="select-options" id="caracteristicas_idcaracteristicas1"></div>
                <div id="selection-info1">0 características seleccionadas</div>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="generar_formulario1" aria-label="generar">Generar Formulario</button>
            </div>

            <!-- Segundo select (para características físicas) -->
            <div class="select-container" id="select2">
                <label for="seccion2" class="form-label fw-bold fs-6">Seleccionar Características Físicas</label>
                <div class="select-box" id="selectBox2">Opciones características físicas <span>▼</span></div>
                <div class="select-options" id="caracteristicas_idcaracteristicas2"></div>
                <div id="selection-info2">0 características seleccionadas</div>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="generar_formulario2" aria-label="generar">Generar Formulario</button>
            </div>
        </div>
        
        <form id="Formulario_control${codigo}">
            <div id="caracteristicas${codigo}"> 
                    
            </div>
            <input type="hidden"   name="ver"  value="registrar_criterio_controlCalidad">
            <input type="hidden"   name="detalle_control_calidad_iddetalle_control_calidad"  value="${id_Detalle}">

            <div id="Formulario2" class="mt-4">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="calificacion">Calificación</label>
                            <input type="number" step="0.01" class="form-control" name="calificacion" id="calificacion${codigo}" readonly required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="observaciones">Observaciones</label>
                            <textarea class="form-control" name="observaciones" id="observaciones" rows="2" required></textarea>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="peso_neto">Peso Neto</label>
                            <input type="number" step="0.01" class="form-control" name="peso_neto" id="peso_neto${codigo}" required>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="peso_envase">Peso Envase</label>
                            <input type="number" step="0.01" class="form-control" name="peso_envase" id="peso_envase${codigo}" required>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="peso_bruto">Peso Bruto</label>
                            <input type="number" step="0.01" class="form-control" name="peso_bruto" id="peso_bruto${codigo}" readonly>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="cantidad">Cantidad</label>
                            <input type="number" step="0.01" class="form-control" name="cantidad" id="cantidad" required>
                        </div>
                    </div>
                    <div class="col-md-6 mt-4">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-check">

                                    <input class="form-check-input" type="radio" name="radioOptions" id="radioAlmacen" value="almacen" required title="Debes seleccionar una opción">
                                    <label class="form-check-label" for="radioAlmacen">
                                        Almacén
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="radioOptions" id="radioDevolución" value="devolucion" required>
                                    <label class="form-check-label" for="radioDevolución">
                                        Devolución
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>

            </div>

            <button type="submit" class="btn btn-primary mt-4">Enviar</button>
            
        </form>
    `;
    fromulario.innerHTML = view;
    llenar_select_caracteristicas();
    const calif = document.getElementById(`calificacion${codigo}`);
        if(calif){
            setInterval(calcularPromedio, 3000);
        }
        const frm = document.querySelector(`#Formulario_control${codigo}`);
        frm.addEventListener("submit", (e) => {
            
            registrar_criterio_controlCalidad(e,frm,recolectarEvaluaciones());
        });
        
        const selectBox = document.getElementById('selectBox');
        const selectOptions = document.getElementById(`caracteristicas_idcaracteristicas${codigo}`);
        const selectionInfo = document.getElementById('selection-info');
        let selectedOptions = [];
        console.log(selectedOptions.length);
        // Mostrar u ocultar la lista de opciones
        selectBox.addEventListener('click', function() {
            selectOptions.style.display = selectOptions.style.display === 'block' ? 'none' : 'block';
        });

        // Selección de opciones
        selectOptions.addEventListener('click', function(event) {
            const clickedOption = event.target;

            if (clickedOption.tagName === 'DIV') {
                const optionValue = clickedOption.getAttribute('data-value');
                const optionText = clickedOption.textContent;  // También obtenemos el texto de la opción

                const optionIndex = selectedOptions.findIndex(option => option.value === optionValue);

                // Alternar selección
                if (optionIndex === -1) {
                    // Agregar opción seleccionada como objeto
                    selectedOptions.push({
                        value: optionValue,
                        text: optionText
                    });
                    clickedOption.classList.add('selected');
                } else {
                    // Eliminar opción si ya estaba seleccionada
                    selectedOptions.splice(optionIndex, 1);
                    clickedOption.classList.remove('selected');
                }

                updateSelectionInfo();
            }
        });

        function updateSelectionInfo() {
            const totalOptions = document.querySelectorAll(`#caracteristicas_idcaracteristicas${codigo} div`).length;
            selectionInfo.textContent = `${selectedOptions.length} de ${totalOptions} caracteristicas seleccionados`;
            console.log(selectedOptions);  
        }
        console.log(selectedOptions);
        document.addEventListener('click', function(event) {
            if (!selectBox.contains(event.target) && !selectOptions.contains(event.target)) {
                selectOptions.style.display = 'none';
            }
        });

        let button_generarFormulario = document.querySelectorAll(`#generar_fromulario${codigo}`);
        button_generarFormulario.forEach(button => {
            button.addEventListener('click', (e) => {
               
                if (selectedOptions && selectedOptions.length> 0) {
                    generarFormulario(selectedOptions);
                } else {
                    console.error('selectOptions no es válido o está vacío');
                }
            });
        });
        

}
function calcularPromedio(){

    const inptPromedio = document.querySelector(`#calificacion${codigo}`);
    if(inptPromedio){
        const peso_neto = document.querySelector(`#peso_neto${codigo}`);
        const peso_envase = document.querySelector(`#peso_envase${codigo}`);
        const peso_bruto = document.querySelector(`#peso_bruto${codigo}`);

        let datos = recolectarEvaluaciones();
        let pro = 0;
        if(datos){
            datos.map(obj => {
                pro += Number(obj.evaluacion);
            })
            pro = pro/datos.length;
        }
        peso_bruto.value = Number(peso_envase.value) + Number(peso_neto.value);
        inptPromedio.value = pro;
    }
    
    //console.log(pro);
}
function generarFormulario(selectedOptions) {
    const areaform = document.getElementById(`caracteristicas${codigo}`);
    let view = "", ind = 1;
    console.log(selectedOptions);
    
    selectedOptions.map(lista => {
        view += `
            <div class="row">
                <input type="hidden" class="form-control" name="id${ind}" id="id${ind}" value="${lista.value}" required>
                <div class="col-md-3">
                    <label for="caracteristica${ind}" class="form-label fw-bold fs-6 mt-3">${lista.text}</label>
                </div>
                <div class="col-md-3 mt-2">
                    <input type="number" class="form-control" name="evaluacion${ind}" id="evaluacion${ind}" placeholder="Evaluación" required>
                </div>
                <div class="col-md-6 mt-2">
                    <input type="text" class="form-control" name="detalle${ind}" id="detalle${ind}" placeholder="Ingrese detalles" required>
                </div>
            </div>
        `;
        ind++; // Incrementar para tener identificadores únicos
    });
    
    areaform.innerHTML = view;
}
function recolectarEvaluaciones() {
    const areaform = document.getElementById(`caracteristicas${codigo}`);
    const rows = areaform.querySelectorAll('.row'); // Seleccionar todas las filas generadas
    
    let evaluaciones = []; // Array donde guardaremos los objetos

    rows.forEach((row, index) => {
        let id = row.querySelector(`input[name="id${index + 1}"]`).value;

        let evaluacion = row.querySelector(`input[name="evaluacion${index + 1}"]`).value;
        let detalle = row.querySelector(`input[name="detalle${index + 1}"]`).value;
        let label = row.querySelector('label').textContent; // Capturar el texto del label

        evaluaciones.push({
            id: id,
            caracteristica: label,
            evaluacion: evaluacion,
            detalle: detalle
        });
    });
    //console.log(evaluaciones);

    return evaluaciones;
   
}

   

function llenar_select_caracteristicas(){

    const listar=document.querySelector(`#caracteristicas_idcaracteristicas${codigo}`);
    

    let view="",ind=1;
    listas.caracteristica.map(lista=>{
            
        view+=`
        <div data-value="${lista.id}">${lista.nombre}</div>
            
        `;
    })
    listar.innerHTML=view;
      
        

    
}
function seleccionar_entidad_tipo(entidad_tipo,entidad_id){
    if(entidad_tipo == "Material"){
        return listas.material.find(obj => obj.id === Number(entidad_id));
    }
    return {};
}
function mostrar_control_calidad(id_ctr_calidad){
    const area = document.querySelector(`#contenido${codigo}`);
    
    let view = "", ind = 1;
    
        view = `
                <div  id="tabla_control_calidad${codigo}">
                    <table class="table mt-4 table-hover" id = "tablaCuerpo">
                        <thead id=lcompra>
                            <tr class="table-dark">
                                <th scope="col">N°</th>
                                <th scope="col">cantidad</th>
                                <th scope="col">Entidad</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Funciones</th>
                            </tr>
                        </thead>
                        <tbody id="Listar_Detalle_control_calidad${codigo}">  
                        
                        </tbody>
                    </table>
                    <button type="submit" class="btn btn-primary">Finalizar</button>

                </div>
                <div  id="formulario_control_calidad${codigo}"></div>

                
                
            `;
            area.innerHTML = view;
            Listar_Detalle_control_calidad_api(id_ctr_calidad);
    
    
}
function Listar_Detalle_control_calidad_api(id_ctr_calidad){
    const area = document.querySelector(`#Listar_Detalle_control_calidad${codigo}`);

    let lista_dcc = listas.detallecalidad.filter(obj => obj.control_calidad_idcontrol_calidad == Number(id_ctr_calidad));
    let view = "", ind = 1;

    lista_dcc.map(lista=>{
        let actualizar;
        let eliminar;
        let registrar;
        let itemMaterial = seleccionar_entidad_tipo(lista.entidad_tipo,lista.entidad_id);
        console.log(itemMaterial);

        registrar = {
            0: ``,
            1: `<a data-id="generar_form_control_calidad,${lista.iddetalle_control_calidad},${id_ctr_calidad}" class="btn btn-primary btn-sm">
                    <i class="bi bi-clipboard-check-fill"></i>
                </a>`

        }
        actualizar = {
            0: ``,
            1: `<a data-id="generar_form_control_calidad,${lista.iddetalle_control_calidad},${id_ctr_calidad}" class="btn btn-primary btn-sm">
                    <i class="bi bi-pencil-square"></i>
                </a>`

        }
        eliminar = {
            0: ``,
            1: `<a data-id="eliminar_producto,${lista.iddetalle_control_calidad}" class="btn btn-danger btn-sm" >
                    <i class="bi bi-trash"></i>
                </a> `
        }
        view += `
            <tr >
               <td>${ind++}</td> 
               <td>${lista.cantidad}</td>               
               <td>${lista.entidad_tipo} </td>
               <td>${itemMaterial.nombre} </td>           
                <td>
                    ${registrar[privilegios[2]]}
                    ${actualizar[privilegios[2]]}
                </td>
           </tr>
            `;
    })
    area.innerHTML = view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuec);
    });

}
function generarNumeroDocumento() {
    const prefijo = 'DOC'; 
    const numeroSecuencial = String(listas.calidad.length + 1).padStart(7, '0'); 
    return `${prefijo}-${numeroSecuencial}`;
}
function generarLoteCompra(listas) {
    const prefijo = 'Lote';
    const now = new Date();
    const boliviaTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - 4 * 60 * 60000); 
    const year = boliviaTime.getUTCFullYear();
    const month = String(boliviaTime.getUTCMonth() + 1).padStart(2, '0'); 
    const day = String(boliviaTime.getUTCDate()).padStart(2, '0'); 
    const currentDate = `${year}-${month}-${day}`;
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    const numeroCompra = listas && listas.m ? listas.m.length + 1 : 1;
    const numeroLote = `${prefijo}-${currentDate}-${numeroCompra}-${numeroAleatorio}`;

    return numeroLote;
}






function establecerFechaHoy() {
    const fechaInput = document.getElementById('fecha');
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
    
    fechaInput.value = currentDate;
}
function actualizarHora() {
    const horaInput = document.getElementById('hora');
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
function sitio(){
  
    let view="",ind=1;
  
    listas.calidad.map(lista=>{
        let itemempleado = listas.empleados.find(obj => Number(obj.id) === Number(lista.empleado)) || {
            "id": 0,
            "nombre": "-",
            "apellido": "-"
        };
        view +=`
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded shadow-sm">
            <div>
                
                
                </div>
               
                <div class="row">
                    <div class="col-md-9">
                        <div class="row">
                            <span>N° ${ind++}</span>
                            <span>Fecha: ${lista.fecha}</span>
                            <span>Hora: ${lista.hora}</span>
                            <span>Responsable: ${itemempleado.nombre} ${itemempleado.apellido}</span>
                            <span>Num Doc.: ${lista.num_docu}</span>
                        </div>
                        
                    </div>
                    
                    <div class="col-md-3">
                        <div class="column-content">
                            <a data-id="mostrar_control_calidad,${lista.id}" class="btn btn-primary btn-sm rounded-circle " >
                                <i class="bi bi-table fs-5"></i>
                            </a>
                            <a data-id="ver_documento,${lista.id}" class="btn btn-primary btn-sm rounded-circle " >
                                <i class="bi bi-eye fs-5"></i>
                            </a>
                        
                        </div>
                        
                    </div>
                
                </div>
                
                
            </div>`;
        
        

    })  
     app.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuec);
    });
    

}
async function registrar_criterio_controlCalidad(e, form, lista) {
    e.preventDefault();
    const dato = new FormData(form);
    console.log(lista);
    for (let [key, value] of dato.entries()) {
        console.log(key, value);
    }
    try {
        let data = await registrarFuntions.sendformData(dato);
        if(data[0] === "success" &&  data[2] === "registrar_criterio_controlCalidad"){
            registrar_evaluacion_caracteristicas(data[3],lista);
        }
    } catch (error) {
        console.error("Error al registrar: ", error);
    }
    
        
    
}
function registrar_evaluacion_caracteristicas(id_criterio, lista) {
    lista.forEach(async item => {
        const formData = new FormData();
        formData.append('ver', 'registrar_evaluacion_caracteristicas');
        formData.append('evaluacion', item.evaluacion);
        formData.append('detalle', item.detalle);
        formData.append('caracteristicas_idcaracteristicas', item.id);
        formData.append('criterio_control_calidad_idcriterio_control_calidad', id_criterio);

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        // Usamos la función genérica para el envío
        try {
            const data = await registrarFuntions.sendformData(formData);
            console.log(data);
        } catch (error) {
            console.error('Error al registrar evaluación:', error);
        }
    });

    let contenido = document.querySelector(`#tabla_control_calidad${codigo}`);
    contenido.style.display = 'block';
    let formulario = document.querySelector(`#formulario_control_calidad${codigo}`);
    formulario.innerHTML = '';
}

