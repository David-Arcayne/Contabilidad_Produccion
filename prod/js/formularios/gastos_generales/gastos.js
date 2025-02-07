import * as listarFunctions from "../funciones/listar.js";
import { codigos } from "./constantes.js";

import { editarCelda } from "../funciones/celda_editar.js";
import { Editar_fila_ } from "../funciones/editar_fila_.js";
import * as fuG from "../funciones/generales.js";

import * as registrarFuntions from "../funciones/registrar.js";
import * as modales from "../funciones/modales/modal_registrar.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let app = "";
let code_;
let permisos_;
let refrescar_;
let Lista_empleados = [];
let Lista_seccion = [];
let Lista_rubro = [];

let Lista_Areas = [];
let Lista_gastos_generales =[];
let Lista_unidad_tiempo = [];
const codigo = codigos.codigoPrincipal;
let privilegios;

export async function gastos_generales_config(code, permisos, refrescar) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

    app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener("click", function () {
        sitio();
        return null;
    });

  sitio();
}

async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    const idsucursal = uk[0].empresa.idsucursal;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      
      listarFunctions.listar_api_general('listado_areas',idsucursal),
      listarFunctions.listar_api_general_verd('listar_gastos_generales',idEmpresa),

    ]);

    // Asignamos los resultados a las variables correspondientes
    
    Lista_Areas = resultados[0];
    Lista_gastos_generales = resultados[1];
    console.log(Lista_gastos_generales);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  if (typeof dataid === "string" && dataid.split(",").length === 2) {
    const [funcion, id1, id2] = dataid.split(",");
    console.log(funcion, id1, id2);
    switch (funcion) {
      case "editar_gastos_generales":
        toggleEditSave(event);
        break;
      case "eliminar_gastos_generales":
        eliminar_gastos_generales(id1,codigos.codigoAreas);//
        break;
      case "gastos":
        modal_gstos(id1,codigos.codigoAreas);//
        break;
      default:
        sitio();
        break;
    }
  } else {
    console.error("El formato de dataid no es válido. Debe contener dos comas.");
  }
  
}

async function modal_gstos(idgastos_generales,codigo) {
    function menumodal(event) {
      const dataid = event.currentTarget.getAttribute("data-id");
      if (typeof dataid === "string" && dataid.split(",").length === 2) {
        const [funcion, id1, id2] = dataid.split(",");
        console.log(funcion, id1, id2);
        switch (funcion) {
          case "editar_detalle_gastos":
            toggleEditSave(event);
            break;
          case "eliminar_detalle_gastos":
            eliminar_detalle_gastos(id1);//
            break;
        
          default:
            sitio();
            break;
        }
      } else {
        console.error("El formato de dataid no es válido. Debe contener dos comas.");
      }
      
      
    }
    let  Lista_detalle = await listarFunctions.listar_api_general_verd('listar_detalle_gastos',idgastos_generales) ;
    console.log(Lista_detalle);
    // Lista_detalle = [
    //   {
    //     "iddetalle_gastos": 1,
    //     "monto": 150.75,
    //     "tiempo": "Enero",
    //     "gastos_generales_idgastos_generales": 1
    //   },
    //   {
    //     "iddetalle_gastos": 2,
    //     "monto": 250.00,
    //     "tiempo": "Febrero",
    //     "gastos_generales_idgastos_generales": 2
    //   },
    //   {
    //     "iddetalle_gastos": 3,
    //     "monto": 325.50,
    //     "tiempo": "Marzo",
    //     "gastos_generales_idgastos_generales": 3
    //   },
    //   {
    //     "iddetalle_gastos": 4,
    //     "monto": 400.00,
    //     "tiempo": "Abril",
    //     "gastos_generales_idgastos_generales": 1
    //   },
    //   {
    //     "iddetalle_gastos": 5,
    //     "monto": 180.25,
    //     "tiempo": "Mayo",
    //     "gastos_generales_idgastos_generales": 2
    //   }
    // ];    
   
    modales.crearModalSoS({
            code: code_,
            type:false,
            x:'1200px',
            y:'800px',
            id: `modal_gastos${codigo}`,
            header: `  
                
                <div class="container">
                    <h6 class="fw-bold text-emphasis mb-2" style="text-align: center;"> Detalle Gastos generales</h6>
                </div>
            `,
            body: `
                <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">
                    <div class="row">
                      <div class="col-md-6">
                        <label for="tiempo" class="form-label">Tiempo</label>
                        <select class="form-select" id="tiempo" name="tiempo">
                          <option value="Enero">Enero</option>
                          <option value="Febrero">Febrero</option>
                          <option value="Marzo">Marzo</option>
                          <option value="Abril">Abril</option>
                          <option value="Mayo">Mayo</option>
                          <option value="Junio">Junio</option>
                          <option value="Julio">Julio</option>
                          <option value="Agosto">Agosto</option>
                          <option value="Septiembre">Septiembre</option>
                          <option value="Octubre">Octubre</option>
                          <option value="Noviembre">Noviembre</option>
                          <option value="Diciembre">Diciembre</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                          <label for="monto" class="form-label">Monto</label>
                          <input type="number" step="0.0001" class="form-control" id="monto" name="monto" placeholder="Ingrese el monto">
                      </div>
                      
                    </div>
                    
                
                    <div class="d-flex justify-content-end mt-4">
                        <button type="submit" class="btn btn-outline-success me-2" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                        <button type="reset" class="btn btn-outline-primary" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>
                    </div>
                </form>
                <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>
                <div id="alerta${codigo}" class="mt-4"></div>
                <div class="scrollable-table mt-4">
                    
                    <table class="table table-striped table-hover" id = "editableTable${codigo}">
                    <thead class="table-dark">
                        <tr>
                        <th scope="col">N°</th>
                        <th scope="col">Tiempo</th>
                        <th scope="col">Monto</th>
                        
                        
                        <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_gastos_generales${codigo}">
                    
                    </tbody>
                    </table>
                </div>
    
            `,
            footerButtons: [
                
                {
                    id: `btnCancelar${codigo}`,
                    text: "salir",
                    class: "btn btn-outline-secondary mr-1 mt-4",
                    onClick: () => '',
                    dismiss: true // Cierra el modal sin ejecutar ninguna acción
                }
            ]
            
        });
    listar_gastos_generales();
    const toggleButton = document.getElementById(`toggleButton${codigo}`);
    toggleButton.addEventListener("click", (e) =>mostrarFormulario(e, toggleButton, forme));
    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e));
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit",async  (e) => {
          e.preventDefault();
          const formData = new FormData(forme);
          formData.append('verDavid','registrar_detalle_gastos');
          formData.append('gastos_generales_idgastos_generales',idgastos_generales);
          for (let [key, value] of formData.entries()) {
              console.log(key, value);
          }
            
          const data = await registrarFuntions.sendformData2(formData);
     
          if(data[0] == "success" ){
            forme.reset();
            mostrarFormulario(e, toggleButton, forme);
            fuG.alertas(data,codigo);
            Lista_detalle = await listarFunctions.listar_api_general_verd('listar_detalle_gastos',idgastos_generales) ;
            
            listar_gastos_generales();
              //document.getElementById(`btnCancelar${codigo}`).click();
              //modal_gstos(idgastos_generales,codigo);
             
          }else{
              fuG.alertas(data,codigo);
          }
              
          
      
    });
    

    

function listar_gastos_generales() {
  const table_body = document.getElementById(`listar_gastos_generales${codigo}`);
  table_body.innerHTML = '';
  let view = "",ind = 1;

  Lista_detalle.map((lista) => {

        
  
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_detalle_gastos,${lista.iddetalle_gastos}"
                  class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Editar sección">
                      <i class="bi bi-pencil-square fs-5"></i>
                  </a>
                  <span class="d-block mt-1 small"></span>
              </div>
              `,
      };
      
      let eliminar = {
        0: ``,
        1: `
            <div class="text-center">
                <a  data-id="eliminar_detalle_gastos,${lista.iddetalle_gastos}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar sección">
                    <i class="bi bi-trash fs-5"></i>
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
            `,
      };

     
      view += `
              <tr>
                  <td>${ind++}</td>                
                  <td data-type="${lista.iddetalle_gastos},tiempo,tiempo">${lista.tiempo}</td>
                  <td data-type="${lista.iddetalle_gastos},monto,monto">${lista.monto}</td>             
                               
                  <td>
                      <div class="d-flex gap-3">
                          
                          ${actualizar[privilegios[2]]}
                          ${eliminar[privilegios[3]]}
                      </div>                           
                  </td>
              </tr>
          `;
  });
  table_body.innerHTML = view;

  const enlaces = document.querySelectorAll(".btn");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menumodal);
  });
}
async function eliminar_detalle_gastos(iddetalle_gastos ){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general_verd('eliminar_detalle_gastos',iddetalle_gastos);
      
      
    if(data[0] == "success" || data[0] == "ok" ){
      Lista_detalle = await listarFunctions.listar_api_general_verd('listar_detalle_gastos',idgastos_generales) ;
            
      listar_gastos_generales();
    }
  }
}
async function toggleEditSave(event){
    const columnas = [
            {
                index: 2,
                editable: true,
                type: 'number',
                field: 'monto',
                validations: { required: true }
            },
            {
                index: 1,
                editable: true,
                type: 'select',
                field: 'tiempo',
                options: [                   // Solo para type: 'select'
                           { value: 'Enero', label: 'Enero' },
                           { value: 'Febrero', label: 'Febrero' },
                           { value: 'Marzo', label: 'Marzo' },
                           { value: 'Abril', label: 'Abril' },
                           { value: 'Mayo', label: 'Mayo' },
                           { value: 'Junio', label: 'Junio' },
                           { value: 'Julio', label: 'Julio' },
                           { value: 'Agosto', label: 'Agosto' },
                           { value: 'Septiembre', label: 'Septiembre' },
                           { value: 'Octubre', label: 'Octubre' },
                           { value: 'Noviembre', label: 'Noviembre' },
                           { value: 'Diciembre', label: 'Diciembre' },
                          
                         ]
            }
        ];
        
        try {
          const resultado = await Editar_fila_(event, codigo, Lista_detalle, columnas, 'iddetalle_gastos');
          console.log("Resultado:", resultado);
          if (!resultado) {
            console.warn("No changes to save or operation cancelled.");
           
          }
          const formData = new FormData();
          formData.append("verDavid", "editar_detalle_gastos");
          formData.append("empresa_idempresa",uk[0].empresa.idempresa);
    
          Object.entries(resultado).forEach(([key, value]) => {
            formData.append(key, value);
          });
        
          console.log("FormData prepared for submission:");
          for (let [key, value] of formData.entries()) {
            console.log(key, value);
          }
        
          try {
            const data = await registrarFuntions.sendformData2(formData);
            console.log("Server response:", data);
            fuG.alertas(data,codigo);
            if(data[0] == "danger" || data[0] == "Error" ){
              sitio();
            }
          } catch (error) {
            console.error("Error submitting data to the server:", error);
          }
        } catch (error) {
          console.error("Error en Editar_fila_:", error);
        }
    
    
      // const resultado = await Editar_fila_(event, codigo, Lista_detalle, columnas, 'iddetalle_gastos');
    
    
      
}
}
async function eliminar_gastos_generales(idgastos_generales ){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general_verd('eliminar_gastos_generales',idgastos_generales);
      
      
    if(data[0] == "success" || data[0] == "ok" ){
        sitio();
    }
  }
}
async function toggleEditSave(event){
    const columnas = [
            {
                index: 1,
                editable: true,
                type: 'text',
                field: 'codigo',
                validations: { required: true }
            },
            {
                index: 2,
                editable: true,
                type: 'text',
                field: 'nombre',
                validations: { required: true }
            },
            {
                index: 3,
                editable: true,
                type: 'text',
                field: 'descripcion',
                validations: { required: true }
            },
            {
                index: 4,
                editable: true,
                type: 'text',
                field: 'tipo_variable',
                validations: { required: true }
            }
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_gastos_generales, columnas, 'idgastos_generales');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
      const formData = new FormData();
      formData.append("verDavid", "editar_gastos_generales");
      formData.append("empresa_idempresa",uk[0].empresa.idempresa);

      Object.entries(resultado).forEach(([key, value]) => {
        formData.append(key, value);
      });
    
      console.log("FormData prepared for submission:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
    
      try {
        const data = await registrarFuntions.sendformData2(formData);
        console.log("Server response:", data);
        fuG.alertas(data,codigo);
        if(data[0] == "danger" || data[0] == "Error" ){
          sitio();
        }
      } catch (error) {
        console.error("Error submitting data to the server:", error);
      }
}


async function edit_Celda_table(event) {
  const elementos_select = ["seccion_idseccion","idcontrol_unidad_tiempo"]; // Columnas que usan elementos <select>
  const elementos_number = ['frecuencia', 'costo']; // Columnas que usan campos numéricos
  

  const resultado = await editarCelda(event, Lista_Areas, codigo, elementos_select, elementos_number, 'idtarea_limpieza');
 
  console.log(resultado); 
  const formData = new FormData();
  formData.append('verDavid', "editar_gastos_generales");
  Object.entries(resultado).forEach(([key, value]) => {
      formData.append(key, value);
  });
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const data = await registrarFuntions.sendformData2(formData);
    console.log("Server response:", data);
    fuG.alertas(data,codigo);
    if(data[0] == "danger" || data[0] == "Error" ){
      sitio();
    }
  } catch (error) {
    console.error("Error submitting data to the server:", error);
  }

}
function listar_areas() {
    const select = document.querySelector(`#areas_idareas${codigo}`);
  
    let view = "",
      ind = 1;
    Lista_Areas.map((lista) => {

        view += `<option value="${lista.idareas}">${lista.nombre} </option>`;
      
    });
    select.innerHTML = view;
  }

async function sitio() {
  await listar();
  let view = "",ind = 1;
  view += `
          <div class="container">
               
              <h5 class="text-center mb-4 fw-bold fs-6" >Gastos generales</h5>
              <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">

               <div class="mb-3">
                    <label for="codigo" class="form-label">Código</label>
                    <input type="text" class="form-control" id="codigo" name="codigo" maxlength="30" placeholder="Ingrese el código">
                </div>
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" maxlength="50" placeholder="Ingrese el nombre">
                </div>
                <div class="mb-3">
                    <label for="descripcion" class="form-label">Descripción</label>
                    <textarea class="form-control" id="descripcion" name="descripcion" rows="4" placeholder="Ingrese la descripción"></textarea>
                </div>
                <div class="mb-3">
                    <label for="tipo_variable" class="form-label">Tipo de Variable</label>
                    <input type="text" class="form-control" id="tipo_variable" name="tipo_variable" maxlength="30" placeholder="Ingrese el tipo de variable">
                </div>
             
                <div class="d-flex justify-content-end mt-4">
                    <button type="submit" class="btn btn-outline-success me-2" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                    <button type="reset" class="btn btn-outline-primary" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>
                </div>
              </form>
            
            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>
            <div id="alerta${codigo}" class="mt-4"></div>
            <div >
                
                <table class="table table-striped table-hover" id = "editableTable${codigo}">
                  <thead class="table-dark">
                    <tr>
                      <th scope="col">N°</th>
                      <th scope="col">Codigo</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Descripción</th>
                      <th scope="col">Tipo</th>
                      <th scope="col">Funciones</th>
                    </tr>
                  </thead>
                  <tbody id="listar_gastos_generales${codigo}">
                
                  </tbody>
                </table>
            </div>
          </div>


        `;
//listado_areas       listar_gastos_generales       eliminar_gastos_generales       eliminar_gastos_generales
//editar_gastos_generales($idareas,$nombre, $descripcion, $fecha,$sucursal)
//editar_gastos_generales($idgastos_generales,$cargo, $salario, $descripcion, $fecha,$sucursal)
  app.innerHTML = view;
  //listado_areas();
  listar_gastos_generales();
  //document.getElementById(`fecha${codigo}`).value = fuG.fechaBolivia();
  const table = document.getElementById(`editableTable${codigo}`);
  table.addEventListener("dblclick",(e) => edit_Celda_table(e));
  const forme = document.querySelector(`#formulario${codigo}`);
  forme.addEventListener("submit",async  (e) => {
    e.preventDefault();
    const formData = new FormData(forme);

    formData.append('verDavid','registrar_gastos_generales');
    formData.append('empresa_idempresa',uk[0].empresa.idempresa);
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    
    const data = await registrarFuntions.sendformData2(formData);
   
        if(data[0] == "success" ){
            sitio();
            fuG.alertas(data,codigo);
        }
            
    
    
  });
  const toggleButton = document.getElementById(`toggleButton${codigo}`);
  toggleButton.addEventListener("click", (e) =>mostrarFormulario(e, toggleButton, forme));

}




function listar_gastos_generales() {
  const table_body = document.getElementById(`listar_gastos_generales${codigo}`);
  let view = "",ind = 1;

  Lista_gastos_generales.map((lista) => {

        
  
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_gastos_generales,${lista.idgastos_generales}"
                  class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Editar sección">
                      <i class="bi bi-pencil-square fs-5"></i>
                  </a>
                  <span class="d-block mt-1 small"></span>
              </div>
              `,
      };
      let gastos = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="gastos,${lista.idgastos_generales}"
                  class="btn btn-outline-warning rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Editar sección">
                      <i class="bi bi-gear-fill fs-5"></i>
                  </a>
                  <span class="d-block mt-1 small"></span>
              </div>
              `,
      };
      let eliminar = {
        0: ``,
        1: `
            <div class="text-center">
                <a  data-id="eliminar_gastos_generales,${lista.idgastos_generales}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar sección">
                    <i class="bi bi-trash fs-5"></i>
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
            `,
      };

     
      view += `
              <tr>
                  <td>${ind++}</td>                
                  <td data-type="${lista.idgastos_generales},codigo,codigo">${lista.codigo}</td>
                  <td data-type="${lista.idgastos_generales},nombre,nombre">${lista.nombre}</td>             
                  <td data-type="${lista.idgastos_generales},descripcion,descripcion">${lista.descripcion}</td>             
                  <td data-type="${lista.idgastos_generales},tipo_variable,tipo_variable">${lista.tipo_variable}</td>             
                  <td>
                      <div class="d-flex gap-3">
                          
                          ${actualizar[privilegios[2]]}
                          ${eliminar[privilegios[3]]}
                            ${gastos[privilegios[2]]}

                      </div>                           
                  </td>
              </tr>
          `;
  });
  table_body.innerHTML = view;

  const enlaces = document.querySelectorAll(".btn");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menu);
  });
}
function mostrarFormulario(e, toggleButton, myForm) {
  if (myForm.style.display === "none" || myForm.style.height === "0px") {
    myForm.style.display = "block";
    setTimeout(() => {
      myForm.style.height = myForm.scrollHeight + "px";
      myForm.style.opacity = 1;
    }, 10); // Un pequeño retraso para asegurar que la transición ocurra
    toggleButton.innerHTML = '<i class="bi bi-dash-lg danger"></i>';
  } else {
    myForm.style.height = "0";
    myForm.style.opacity = 0;
    setTimeout(() => {
      myForm.style.display = "none";
    }, 500); // Esperar a que termine la transición
    toggleButton.innerHTML = '<i class="bi bi-plus"></i>';
  }
}
function filtrar_por_rubros() {
  // const selectItems = document.querySelector(`#rubro_idrubro${codigo}`);
  // const selectedValue = selectItems.value;
  const selectrubro = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );
  const selectedOpcText = selectrubro.options[selectrubro.selectedIndex].text;

  let selectedColumnIndex = 3;
  const tabla = document.querySelector(
    `#editable_table${codigos.codigoPrincipal}`
  );
  const filas = tabla.getElementsByTagName("tr");

  for (let i = 1; i < filas.length; i++) {
    const celdas = filas[i].getElementsByTagName("td");

    if (celdas[selectedColumnIndex]) {
      const valorCelda =
        celdas[selectedColumnIndex].textContent ||
        celdas[selectedColumnIndex].innerText;

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



