import * as listarFunctions from "../funciones/listar.js";

import { URL_APIP } from "../../../../lib/services.js";
import * as registrarFuntions from "../funciones/registrar.js";
import { control_calidad_pdf } from "./pdf_vista_previa.js";

import * as encurso from "./encurso.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let Listas_Control_calidad;
let Lista_Detalle_Control_calidad;

async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        const resultados = await Promise.all([
            listarFunctions.Listar_control_calidad_Api(idEmpresa),
            listarFunctions.Listar_detalle_control_calidad_Api(idEmpresa),
        ]);

        Listas_Control_calidad = resultados[0];
        Lista_Detalle_Control_calidad = resultados[1];

    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
let overlayy;
let app = "";
let code ;
let privilegios;
let codigo;
let listas;
let id_Detalle;
let id;
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "modal";
function rand(){
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function modal_control_lista(codigo_,code_,previlegios_,listas_,id_Detalle_,id_) {
    app=document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
    codigo = codigo_;
    code = code_;
    privilegios = previlegios_;
    listas = listas_;
    id_Detalle = id_Detalle_;
    id = id_;
    console.log(listas);
    console.log("codigo: "+codigo);
    console.log("privilegios: "+privilegios);
    console.log("iddetalle: "+id_Detalle);
    console.log("id "+id);
    sitio();    
    
}

async function sitio() {
    await listar();
    app.style.position = 'relative';
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.cursor = 'pointer';
    app.appendChild(overlay);
    const variable = document.createElement('div');
    variable.style.width = '1000px';
    variable.style.height = '580px';

    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.cursor = 'auto';
    variable.style.maxHeight = '680px';
    variable.style.overflowY = 'auto';
    variable.style.display = 'block';
    overlay.appendChild(variable);

  

    let view = `
         <a style="float: right;" class ="cerrar"><i class="bi bi-x-lg fs-5"></i></a>
         <div class="row">
            <div class="select-container">
                
                <label for="seccion" class="form-label fw-bold fs-6 row">Numero documento: </label>
                <label for="seccion" class="form-label fw-bold fs-6 row">Fecha: </label>
                <label for="seccion" class="form-label fw-bold fs-6 row">Hora: </label>
                <label for="seccion" class="form-label fw-bold fs-6 row"></label>
                <label for="seccion" class="form-label fw-bold fs-6 row">Cantidad: </label>

            </div>
            <div class="select-container" id="select1">
                <label for="seccion1" class="form-label fw-bold fs-6">Seleccionar Características</label>
                <div class="select-box" id="selectBox1">Opciones características <span>▼</span></div>
                <div class="select-options" id="caracteristicas_idcaracteristicas1${codigo}"></div>
                <div id="selection-info1">0 características seleccionadas</div>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="generar_formulario1" aria-label="generar">Generar Formulario</button>
            </div>

            <!-- Segundo select (para características físicas) -->
            <div class="select-container" id="select2">
                <label for="seccion2" class="form-label fw-bold fs-6">Seleccionar Características Físicas</label>
                <div class="select-box" id="selectBox2">Opciones características físicas <span>▼</span></div>
                <div class="select-options" id="caracteristicas_idcaracteristicas2${codigo}"></div>
                <div id="selection-info2">0 características seleccionadas</div>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="generar_formulario2" aria-label="generar">Generar Formulario</button>
            </div>
        </div>
        <div id="alerta${subcodigo}"></div>
        
        <form id="Formulario_control${subcodigo}">
            <div id="caracteristicas${subcodigo}"> 
                    
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
                            <input type="number" step="0.01" class="form-control" name="cantidad" id="cantidad${subcodigo}" value="${item_detalle.cantidad}" min="1" required>

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
            <div id="caracteristicas_fisicas${subcodigo}"> 
                    
            </div>
            <button type="submit" class="btn btn-primary mt-4">Editar</button>
            
        </form>
    `;
    variable.innerHTML = view;
    overlayy = overlay;

    llenar_select_caracteristicas();
    llenar_select_caracteristicas_fisicas();
    let selectedOptions1 = configurarSelect('selectBox1', `caracteristicas_idcaracteristicas1${codigo}`, 'selection-info1');
    let selectedOptions2 = configurarSelect('selectBox2', `caracteristicas_idcaracteristicas2${codigo}`, 'selection-info2');

     
    const calif = document.getElementById(`calificacion${codigo}`);
    if(calif){
        setInterval(calcularPromedio, 3000);
    }
    const frm = document.querySelector(`#Formulario_control${subcodigo}`);
    frm.addEventListener("submit", (e) => {
        e.preventDefault();  // Prevenir el comportamiento por defecto

        let x = recolectarEvaluaciones();
        console.log(x);

        let y = recolectarEvaluaciones_fisicas();
        console.log();

        x = x.concat(y);  
        console.log(x);
        registrar_criterio_controlCalidad(e,frm,x);
    });
    
    
    // Eventos para generar formularios
    document.getElementById('generar_formulario1').addEventListener('click', function () {
        if (selectedOptions1.length > 0) {
            generarFormulario(selectedOptions1, `caracteristicas${subcodigo}`, true);
        } else {
            console.error('No hay opciones seleccionadas en el primer select.');
        }
    });

    document.getElementById('generar_formulario2').addEventListener('click', function () {
        if (selectedOptions2.length > 0) {
            generarFormulario(selectedOptions2, `caracteristicas_fisicas${subcodigo}`, false);
        } else {
            console.error('No hay opciones seleccionadas en el segundo select.');
        }
    });
    variable.addEventListener('click', function(event) {
        //console.log(event.target);
        let aTag = event.target.closest('a.cerrar');

        if (aTag) {
            event.preventDefault();
            cerrarModal();

        }
       
    });
    function cerrarModal() {
        overlay.remove(); 
        app.style.removeProperty('position');  
    }
}

function calcularPromedio() {
    let pro = 0;
    const inptPromedio = document.querySelector(`#calificacion${codigo}`);
    
    if (inptPromedio) {
        const peso_neto = document.querySelector(`#peso_neto${codigo}`);
        const peso_envase = document.querySelector(`#peso_envase${codigo}`);
        const peso_bruto = document.querySelector(`#peso_bruto${codigo}`);
        
        let datos = recolectarEvaluaciones();
        
        if (datos) {
            datos.map(obj => {
                pro += Number(obj.evaluacion);
            });
          
            pro = pro / datos.length;
            pro = pro.toFixed(2); 
        }
        
        peso_bruto.value = (Number(peso_envase.value) + Number(peso_neto.value)).toFixed(2); 
        inptPromedio.value = pro; 
    }

}

function generarFormulario(selectedOptions, idFormulario,condicion) {
    const areaform = document.getElementById(idFormulario);
    let view = "", ind = 1;
    if(condicion){
        selectedOptions.forEach(option => {
            view += `
                <div class="row">
                    <input type="hidden" class="form-control" name="id${ind}" value="${option.value}" required>
                    <div class="col-md-3">
                        <label for="caracteristica${ind}" class="form-label fw-bold fs-6 mt-3">${option.text}</label>
                    </div>
                    <div class="col-md-3 mt-2">
                        <input type="number" class="form-control" name="evaluacion${ind}" placeholder="Evaluación" required>
                    </div>
                    <div class="col-md-6 mt-2">
                        <input type="text" class="form-control" name="detalle${ind}" placeholder="Ingrese detalles" required>
                    </div>
                </div>
            `;
            ind++;
        });
    }else{
        selectedOptions.forEach(option => {
            view += `
                <div class="row">
                    <input type="hidden" class="form-control" name="id${ind}" value="${option.value}" required>
                    <div class="col-md-2">
                        <label for="caracteristica${ind}" class="form-label fw-bold fs-6 mt-3">${option.text}</label>
                    </div>
                    <div class="col-md-5 mt-2">
                        <input type="text" class="form-control" name="evaluacion${ind}" placeholder="Dato" required>
                    </div>
                    <div class="col-md-5 mt-2">
                        <input type="text" class="form-control" name="detalle${ind}" placeholder="Ingrese detalles" required>
                    </div>
                </div>
            `;
            ind++;
        });
    }
   

    areaform.innerHTML = view;
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
                    value: optionValue,
                    text: optionText
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
        selectionInfo.textContent = `${selectedOptions.length} de ${totalOptions} características seleccionadas`;
    }

    document.addEventListener('click', function(event) {
        if (!selectBox.contains(event.target) && !selectOptions.contains(event.target)) {
            selectOptions.style.display = 'none';
        }
    });

    return selectedOptions; // Devolver la lista de opciones seleccionadas para usar después
}
function recolectarEvaluaciones() {
    const areaform = document.getElementById(`caracteristicas${subcodigo}`);
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

   

    return evaluaciones;
   
}

function recolectarEvaluaciones_fisicas() {
    
    
    let evaluaciones = []; 
   

    const areafisicas = document.getElementById(`caracteristicas_fisicas${subcodigo}`);
    const rowsf = areafisicas.querySelectorAll('.row'); 

    rowsf.forEach((row, index) => {
        let id = row.querySelector(`input[name="id${index + 1}"]`).value;

        let evaluacion = row.querySelector(`input[name="evaluacion${index + 1}"]`).value;
        let detalle = row.querySelector(`input[name="detalle${index + 1}"]`).value;
        let label = row.querySelector('label').textContent; 

        evaluaciones.push({
            id: id,
            caracteristica: label,
            evaluacion: evaluacion,
            detalle: detalle
        });
    });

    return evaluaciones;
   
}
   

function llenar_select_caracteristicas(){

    const listar=document.querySelector(`#caracteristicas_idcaracteristicas1${codigo}`);
    

    let view="",ind=1;
    let list = listas.caracteristica.filter(obj => obj.tipo === 0);
    list.map(lista=>{
            
        view+=`
        <div data-value="${lista.idcaracteristicas}">${lista.caracteristica}</div>
            
        `;
    })
    listar.innerHTML=view;
}
function llenar_select_caracteristicas_fisicas(){

    const listar=document.querySelector(`#caracteristicas_idcaracteristicas2${codigo}`);
    let view="",ind=1;
    let list = listas.caracteristica.filter(obj => obj.tipo === 1);
    list.map(lista=>{
        view+=`
        <div data-value="${lista.idcaracteristicas}">${lista.caracteristica}</div>
        `;
    })
    listar.innerHTML=view;    
}





function alertas(data) {
    console.log(data);
    let alertClass, alertMessage, timeoutDuration;
    if (data[0] == "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 500;
        
    } else {
        if(data[0] == "danger"){
            alertClass = 'alert-danger';
            alertMessage = data[1];
            timeoutDuration = 2000;
            
        }else{
            alertClass = 'alert-primary';
            alertMessage = data[1];
            timeoutDuration = 3000;

        }
    }
    
    let divalert = document.querySelector(`#alerta${subcodigo}`);
    if (divalert) {
        let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
        divalert.innerHTML = nuevoContenido;
        
        setTimeout(() => {
            divalert.innerHTML = ``;
            
        }, timeoutDuration);
    }
}
