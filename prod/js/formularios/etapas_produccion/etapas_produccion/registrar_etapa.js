import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "./../constantes.js";
import { Editar_fila } from "../../funciones/editar_fila.js";
import { editarCelda } from "../../funciones/celda_editar.js";
import { URL_APIP } from "../../../../../lib/services.js";
import * as modales from "../../funciones/modales/modal_registrar.js";
import * as registrarFuntions from "../../funciones/registrar.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let app = "";
let code_;
let permisos_;
let refrescar_;
let Lista_empleados = [];
let Lista_seccion = [];
let Lista_rubro = [];
let Lista_etapas_produccion = [];
const codigo = codigos.codigoPrincipal;
let privilegios;

function manejarClick(event) {
  sitio();
  // Eliminar el evento click después de ejecutarlo
  event.target.removeEventListener("click", manejarClick);
}
export async function registrar_etapa_produccion(code, permisos, refrescar) {
  code_ = code;
  permisos_ = permisos;
  refrescar_ = refrescar;
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);


  sitio();
}
function listar_rubro() {
  console.log("listo");

  const listar2 = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );
  let view = "";
  Lista_rubro.map((lista) => {
    view += `
                <option value="${lista.id}">${lista.rubro}</option>
            `;
  });
  listar2.innerHTML = view;
  console.log("lista rubro completa");
}
function listar_seccion() {
  console.log("listo");

  const write = document.querySelector(`#seccion_idseccion${codigo}`);
  const rubros_select = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );
  if (!write || !rubros_select) {
    console.error("No se encontraron los elementos del DOM.");
    return;
  }
  let idrubro = rubros_select.value;
  let view = "";
  Lista_seccion.map((lista) => {
    if (Number(lista.rubro_idrubro) === Number(idrubro)) {
      view += `
                <option value="${lista.id}">${lista.nombre_seccion} ${lista.codigo_seccion}</option>
            `;
    }
  });
  write.innerHTML = view;
  console.log("lista rubro completa");
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_Empleados(idEmpresa),
      listarFunctions.listar_rubro(idEmpresa),
      listarFunctions.listarseccion(idEmpresa),
      listarFunctions.listar_etapas_produccion(idEmpresa),
    ]);

    // Asignamos los resultados a las variables correspondientes
    Lista_empleados = resultados[0];
    Lista_rubro = resultados[1];
    Lista_seccion = resultados[2];
    Lista_etapas_produccion = resultados[3];
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "Editar_etapa_produccion":
      toggleEditSave(event);
      break;
    case "eliminar_etapa_produccion":
      eliminar_etapa_produccion(id1);//
      break;
    case "estandar_etapas_produccion":
      modal_estandar_etapas_produccion(id1);
        break;
    default:
      sitio();
      break;
  }
}


async function modal_estandar_etapas_produccion(idetapas_produccion) {

    const itemEtapa = Lista_etapas_produccion.find(obj => Number(obj.idetapas_produccion) === Number(idetapas_produccion));
    modales.crearModalSoS({
        code: code_,
        type:false,
        x:'1000px',
        y:'800px',
        id: `modal_est_etapas${codigos.codigo_estandar_etapa_produccion}`,
        header: `  
          <div class="container" style="line-height: 1.6;">
            <h5 class="text-center mb-4 fw-bold fs-6">Estandar etapas producción</h5>
            <p class="text-center">Etapa: ${itemEtapa.nombre_etapa}</p>
          </div>

        `,
        body: `
         <div class="container">
                <form id="formulario${codigos.codigo_estandar_etapa_produccion}">
                  <input type="hidden"   name="etapas_produccion_idetapas_produccion" value="${idetapas_produccion}">
                  <input type="hidden"   name="verDavid" value="registrar_estandar_etapa_produccion">

                  <div class="row">
                    <div class="col-md-4">
                        <label for="horasProduccion" class="form-label">Horas de Producción</label>
                        <input type="number" step="0.01" class="form-control" id="horasProduccion" name="horas_produccion" placeholder="Ingrese las horas de producción" required>
                    </div>

                    <!-- Porcentaje Evolución -->
                    <div class="col-md-4">
                        <label for="porcentajeEvolucion" class="form-label">Porcentaje de Evolución</label>
                        <input type="number" step="0.01" class="form-control" id="porcentajeEvolucion" name="porcentaje_evolucion" placeholder="Ingrese el porcentaje de evolución" required>
                    </div>

                    <!-- Fecha -->
                    <div class="col-md-4">
                        <label for="fecha" class="form-label">Fecha</label>
                        <input type="date" class="form-control" id="fecha${codigos.codigo_estandar_etapa_produccion}" name="fecha" required>
                    </div>

            
                  </div>
                </form>
                
                <div id="alerta${codigos.codigo_estandar_etapa_produccion}" class="mt-4"></div>

                <div class="row">
                    <div class="col-md-6">
                        <input type="text" id="filtro${codigos.codigo_estandar_etapa_produccion}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                    </div>
                    
                </div>
                <div class="container scrollable-table mt-4">
                    <table class="table table-striped table-bordered">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">N°</th>
                                <th scope="col">Horas Producción</th>
                                <th scope="col">Porcentaje Evolución</th>
                                <th scope="col">Fecha</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="listar_estandar_etapas_produccion${codigos.codigo_estandar_etapa_produccion}">
                            
                        </tbody>
                    </table>
                </div>
            </div>
        `,
        footerButtons: [
            {
                id: `btnCancelar${codigos.codigo_estandar_etapa_produccion}`,
                text: "Cancelar",
                class: "btn btn-outline-secondary mr-1 mt-4",
                onClick: () => '',
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            },
            {
                id: `btnConfirmar${codigos.codigo_estandar_etapa_produccion}`,
                text: "Guardar",
                class: "btn btn-outline-success mr-1 mt-4",
                onClick: async () => {
                    const frm = document.querySelector(`#formulario${codigos.codigo_estandar_etapa_produccion}`);
                    if (!frm.checkValidity()) {
                        frm.reportValidity(); // Muestra los mensajes de error de validación
                        return;
                    }   
                    const dato = new FormData(frm);
                    const data = await registrarFuntions.sendformData2(dato);
                    console.log(data);
                    alerta(data);
                },
                dismiss: false // Esto cierra el modal cuando se hace clic
            },
        ]
        
    });
    const Lista_estandar_etapa = await listarFunctions.listar_api_general_verd('listar_estandar_etapa_produccion',idetapas_produccion);
    establecerFechaHoy();
    listar_estandares_etapas_produccion(Lista_estandar_etapa);


    function establecerFechaHoy() {
        const fechaInput = document.getElementById(`fecha${codigos.codigo_estandar_etapa_produccion}`);
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); 
        const dia = hoy.getDate().toString().padStart(2, '0'); 
    
        const fechaFormateada = `${anio}-${mes}-${dia}`;
        
        fechaInput.value = fechaFormateada;
    }
    function filtrar_table(input) {
    
      const selectrubro = document.querySelector(`#rubro${codigo}`);
      const selectedOpcText =
        selectrubro.options[selectrubro.selectedIndex].text.toLowerCase();
    
      const selectopciones = document.querySelector(`#Opciones${codigo}`);
      const selectedOpcText2 =
        selectopciones.options[selectopciones.selectedIndex].text.toLowerCase();
    
      const table = document.getElementById(`editableTable${codigo}`);
      const tbody = table.getElementsByTagName("tbody")[0];
      const rows = tbody.getElementsByTagName("tr");
    
      const filter = input.value.toLowerCase(); // Capturar el valor del input filtrado
    
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.getElementsByTagName("td");
        let rowText = "";
        
          for (let j = 0; j < cells.length; j++) {
            rowText += cells[j].textContent.toLowerCase() + " ";
          }
    
          if (rowText.includes(filter)) {
            row.style.display = "";
          } else {
            row.style.display = "none";
          }
        
      }
    }
    
    function listar_estandares_etapas_produccion(Lista_estandar_etapa){
      
        const listar = document.querySelector(`#listar_estandar_etapas_produccion${codigos.codigo_estandar_etapa_produccion}`);
        let view = "", ind = 1;
        Lista_estandar_etapa.map((lista) => {
            let actualizar = {
              0: ``,
              1: `        
                    <div class="text-center">
                        <a data-id="editar_estandar_etapa,${lista.idestandar_etapa_produccion}"
                        class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="Editar estandar etapa">
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
                      <a  data-id="eliminar_estandar_etapa,${lista.idestandar_etapa_produccion}"
                      class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                      style="width: 2.5rem; height: 2.5rem;"
                      title="Eliminar estandar etapa">
                          <i class="bi bi-trash fs-5"></i>
                      </a>
                      <span class="d-block mt-1 small"></span>
                  </div>
                  `,
            };
            
            view += `
              <tr style = "style=width: 50px; height: 50px;" >
                  <td>${ind++}</td>    
                  <td data-type="${lista.idestandar_etapa_produccion},horas_produccion">${lista.horas_produccion}</td>     
                  <td data-type="${lista.idestandar_etapa_produccion},porcentaje_evolucion">${lista.porcentaje_evolucion}</td>       
                  <td data-type="${lista.idestandar_etapa_produccion},fecha">${lista.fecha}</td>
                  
                  <td>
                      <div class="d-flex gap-3">
                          ${actualizar[privilegios[2]]}
                          ${eliminar[privilegios[3]]}
                      </div>
                  </td>
              </tr>        
                    `;
      
          
          
        });
        listar.innerHTML = view;
      
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach((enlace) => {
          enlace.addEventListener("click", menu);
        });
      
    }
    function menu(event) {
      const dataid = event.currentTarget.getAttribute("data-id");
      const [funcion, id1, id2] = dataid.split(",");
      switch (funcion) {
        case "editar_estandar_etapa":
          toggleEditSave(event);
          break;
        case "eliminar_estandar_etapa":
          eliminar_estandar_etapa(id1);//
          break;
        
        default:
          sitio();
          break;
      }
    }
    async  function toggleEditSave(event) {
    
      const permisos = [1,2,3];
      const names = ["horas_produccion", "porcentaje_evolucion","fecha"];
      const boton = event.currentTarget;
      const fila = boton.closest("tr");
      const celdas = fila.querySelectorAll("td");
      const dataid = boton.getAttribute('data-id');
      const [funcion, id1, id2] = dataid.split(',');
      const obj_seleccionado = Lista_estandar_etapa.find(obj => Number(obj.idestandar_etapa_produccion) === Number(id1));
      console.log(obj_seleccionado);
  
      const obj_seleccionadoc = { ...obj_seleccionado };
      let originalValues = {};
  
      if (boton.innerHTML.includes('bi-pencil-square')) {
          // Modo Editar
          let firstInput;
          celdas.forEach((celda, index) => {
              if (permisos.includes(index)) {
                  const valorOriginal = celda.textContent.trim();
                  originalValues[index] = valorOriginal;
  
                  let input;
                  
                      if(index === 3){
                          input = document.createElement('input');
                          input.id = `ediinp${codigo}`;
                          input.className = "form-control";
                          input.type = "date";
                          input.value = valorOriginal;
                          celda.innerHTML = '';
                          celda.appendChild(input);
                      }else{
                          input = document.createElement('input');
                          input.id = `ediinp${codigo}`;
                          input.className = "form-control";
                          input.type = "number";
                          input.step = "0.01";
                          input.value = valorOriginal;
                          celda.innerHTML = '';
                          celda.appendChild(input);
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
  
      async function guardarCambios() {
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
                          if(index === 1 && index === 2){
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
              obj_seleccionado[names[0]] = datosnuevos[0];
              obj_seleccionado[names[1]] = datosnuevos[1];
              obj_seleccionado[names[2]] = datosnuevos[2];
       
              // if (obj_seleccionado) {
              //     Object.assign(Lista_Orden_Produccion, obj_seleccionado);
              // }
              console.log(obj_seleccionado);
              console.log(obj_seleccionadoc);
              console.log(areObjectsEqual(obj_seleccionado, obj_seleccionadoc));
              if (!areObjectsEqual(obj_seleccionado, obj_seleccionadoc)) {
                const formData = new FormData();
                formData.append('verDavid', 'editar_estandar_etapa_produccion');
                

                Object.entries(obj_seleccionado).forEach(([key, value]) => {
                  formData.append(key, value);
                });
                const data = await  registrarFuntions.sendformData2(formData);
                console.log(data);
                alerta(data);
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
 async function eliminar_estandar_etapa(idestandar_etapa_produccion){
    if(confirm("Esta seguro de eliminar....")){
      const data = await listarFunctions.listar_api_general_verd('eliminar_estandar_etapa_produccion',idestandar_etapa_produccion);
      alerta(data);
    }
  }
  async function alerta(data) {
        
    document.getElementById(`btnCancelar${codigos.codigo_estandar_etapa_produccion}`).click()
    modal_estandar_etapas_produccion(idetapas_produccion)
        console.log(data);
        let mensaje = {
          success:`<div id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                        <div >
                            <div class = "row" >
                                <!-- Modal Body -->
                                <div  style="text-align: center;">
                                    <div class="icon-success" style="font-size: 100px; color: #167e1a;"><i class="bi bi-check2-circle fs-10"></i></div>
                                    <h5 style="font-size: 24px; font-weight: bold; margin-top: 10px;">Operación Completada</h5>
                                    <p style="color: #6c757d;">${data[1]}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    `,
          danger:`<div id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                    <div >
                        <div class = "row" >
                            <!-- Modal Body -->
                            <div  style="text-align: center;">
                                <div class="icon-success" style="font-size: 100px; color:red;"><i class="bi bi-exclamation-octagon"></i></div>
                                <h5 style="font-size: 24px; font-weight: bold; margin-top: 10px;">Operación No Completada</h5>
                                <p style="color: #6c757d;">${data[1]}</p>
                            </div>
                        </div>
                    </div>
                </div>
                `,
          Error:`<div id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                      <div >
                          <div class = "row" >
                              <!-- Modal Body -->
                              <div  style="text-align: center;">
                                  <div class="icon-success" style="font-size: 100px; color:red;"><i class="bi bi-exclamation-octagon"></i></div>
                                  <h5 style="font-size: 24px; font-weight: bold; margin-top: 10px;">Operación No Completada</h5>
                                  <p style="color: #6c757d;">${data[1]}</p>
                              </div>
                          </div>
                      </div>
                  </div>
                  `,
        }
        const modal = modales.crearModal({
            code: code_,
            id: `confirmacion${codigos.codigo_anular_pedido}`,
            header: `
            `,
            body: `
                ${mensaje[data[0]]}
            `,
            footerButtons: [
                {
                    id: "btnConfirmar",
                    text: "Confirmar",
                    class: "btn-primary",
                    onClick: () => {
                            
                    },
                    dismiss: true 
                }
            ]
        });
    }




}
function eliminar_etapa_produccion(id1){
  if (confirm("Desea Eliminar..?")) {
    fetch(`${URL_APIP}/api/eliminar_etapa_produccion/${id1}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
          alertas(data);
      });
  }
}
async function toggleEditSave(event) {
  const permisos = [1, 2,  3];
  const opciones_select = [ 3];
  const opciones_number = [];
  const names = [
    "nombre_etapa",
    "detalle",
    "seccion_idseccion",
  ];
  const names2 = [
    "nombre_etapa",
    "detalle",
    "seccion_idseccion",
  ];
  const id = "idetapas_produccion";

  if (typeof codigo === "undefined" || typeof Lista_etapas_produccion === "undefined") {
    console.error("Variables 'codigo' o 'Lista_etapas_produccion' no están definidas.");
    return;
  }

  
    const resultado = await Editar_fila(
      event,
      codigo,
      Lista_etapas_produccion,
      permisos,
      names,
      names2,
      opciones_select,
      opciones_number,
      id
    );

    if (!resultado || typeof resultado !== "object") {
      console.warn("No changes to save or operation cancelled.");
    
    }

    // Prepara el FormData solo si hay cambios válidos
    const formData = new FormData();
    formData.append("ver", "editar_etapa_produccion");
    formData.append("empresa", uk[0]?.empresa?.idempresa || "");

    Object.entries(resultado).forEach(([key, value]) => {
        formData.append(key, value);
    });

    console.log("FormData prepared for submission:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const data = await registrarFuntions.sendformData(formData);
    console.log("Server response:", data);
    
    alertas(data);

  
}

async function edit_Celda_table(event) {
  const elementos_select = ["seccion_idseccion"];
  const elementos_number = [];
  const resultado = await editarCelda(event, Lista_etapas_produccion, codigo, elementos_select, elementos_number, 'idetapas_produccion');
  
    console.log(resultado); 
    const formData = new FormData();
    formData.append('ver', "editar_etapa_produccion");
    formData.append("empresa", uk[0]?.empresa?.idempresa || "");
    Object.entries(resultado).forEach(([key, value]) => {
        formData.append(key, value);
    });
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    try {
      const data = await registrarFuntions.sendformData(formData);
      console.log("Server response:", data);
      
      alertas(data);
    } catch (error) {
      console.error("Error submitting data to the server:", error);
    }
 
}
async function sitio() {
  let view = "",
    ind = 1;
  view += `
            <div class="container">
              <div class="col-md-3 mb-3 " >
                  <div class="row">
                      <label for="rubro_idrubro" class="form-label">Linea de produccion:</label>
                      <select class="form-select" id="rubro_idrubro${codigos.codigoPrincipal}" name="rubro_idrubro">
                          <option value="" disabled selected>Seleccione un rubro</option>
                          
                      </select>
                  </div>
              </div>
                <form id="formulario${codigos.codigoRegistrar}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                    <input type="hidden" name="ver" value="registrar_etapa_produccion">
                    <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                    <div class="row">
                        <div class="row">
                            <div class="col-md-6">
                                <label for="nombre_etapa" class="form-label">Nombre de la etapa</label>
                                <input type="text" class="form-control" id="nombre_etapa" name="nombre_etapa" maxlength="60" placeholder="Ingresa el nombre de la etapa" required>
                            </div>
                            <div class="col-md-6">
                                <label for="seccion_idseccion" class="form-label">Sección</label>
                                <select class="form-select" id="seccion_idseccion${codigo}" name="seccion_idseccion" required>
                                    <option value="" disabled selected>Selecciona una sección</option>
                                    <option value="1">Sección 1</option>
                                    <option value="2">Sección 2</option>
                                    <!-- Aquí puedes agregar más opciones dinámicamente -->
                                </select>
                            </div>
                            
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <label for="detalle" class="form-label">Detalle</label>
                                <textarea class="form-control" id="detalle" name="detalle" rows="2" placeholder="Ingresa los detalles de la etapa"></textarea>
                            </div>
                            
                        </div>
                    </div>
                    <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="guardarBtn${codigos.codigoRegistrar}" aria-label="Registrar">Registrar</button>
                    <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn${codigos.codigoRegistrar}" aria-label="Cancelar">Cancelar</button>
                </form>
                <button id="toggleButton${codigos.codigoRegistrar}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>
                <div id="alerta${codigos.codigoRegistrar}" class="mt-4"></div>

                <div class="row">
                    <div class="col-md-6">
                        <input type="text" id="filtro${codigos.codigoRegistrar}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                    </div>
                    
                </div>
                <div class="container scrollable-table mt-4">
                    <table class="table table-bordered table-hover" id="editable_table${codigo}">
                        <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nombre de la Etapa</th>
                            <th>Detalle</th>
                            <th>Sección</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody id="listar_etapas_de_produccion${codigos.codigoRegistrar}">
                        
                        </tbody>
                    </table>
                </div>
            </div>
        `;

  app.innerHTML = view;
  await listar();
  listar_rubro();
  listar_seccion();
  listar_etapas_de_produccion();
  const forme = document.querySelector(`#formulario${codigos.codigoRegistrar}`);
  
  forme.addEventListener("submit", (e) => sendform(e, forme));
  const cancelarBtn = document.getElementById(
    `cancelarBtn${codigos.codigoRegistrar}`
  );
  cancelarBtn.addEventListener("click", () => {
    forme.reset();
  });
  const toggleButton = document.getElementById(
    `toggleButton${codigos.codigoRegistrar}`
  );
  toggleButton.addEventListener("click", (e) =>
    mostrarFormulario(e, toggleButton, forme)
  );

  const selectrubro = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );

  selectrubro.addEventListener("change", function () {
    listar_seccion();
    listar_etapas_de_produccion();
  });
  const enlaces = document.querySelectorAll(".btn");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menu);
  });
  const table = document.getElementById(`editable_table${codigo}`);
  table.addEventListener("dblclick", (e) => edit_Celda_table(e));
  const input = document.getElementById(`filtro${codigos.codigoRegistrar}`);
  input.addEventListener("keyup", (e) => filtrar_table(e, input));
}

function filtrar_table(e, input) {
  const table = document.getElementById(`editable_table${codigo}`);
  const tbody = table.getElementsByTagName("tbody")[0];
  const rows = tbody.getElementsByTagName("tr");
  input.addEventListener("keyup", function () {
    const filter = input.value.toLowerCase();

    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let cells = row.getElementsByTagName("td");
      let rowText = "";

      for (let j = 0; j < cells.length; j++) {
        rowText += cells[j].textContent.toLowerCase() + " ";
      }

      if (rowText.includes(filter)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }
  });
}
function listar_etapas_de_produccion() {
  const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`).value;
  const table_body = document.getElementById(`listar_etapas_de_produccion${codigos.codigoRegistrar}`);
  let view = "",
    ind = 1;
  console.log(Lista_etapas_produccion);
  let Filtrados_Etapas = Lista_etapas_produccion.filter(obj => Number(obj.rubro_idrubro) === Number(idrubro));
  console.log(Filtrados_Etapas);
  Filtrados_Etapas.map((lista) => {
    
      
      let itemseccion = Lista_seccion.find(
        (obj) => Number(obj.id) === Number(lista.seccion_idseccion)
      ) || {
        id: 0,
        nombre_seccion: "Nulo",
        ubicacion: "Nulo",
        codigo_seccion: "Nulo",
      };
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="Editar_etapa_produccion,${lista.idetapas_produccion}"
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
                <a  data-id="eliminar_etapa_produccion,${lista.idetapas_produccion}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar sección">
                    <i class="bi bi-trash fs-5"></i>
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
            `,
      };

      let config = {
        0:`
        `,
        1:`
            <div class="text-center">
                <a  data-id="estandar_etapas_produccion,${lista.idetapas_produccion}"
                class="btn btn-outline-warning rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                style="width: 2.5rem; height: 2.5rem;"
                title="Estandares etapas">
                   <i class="bi bi-gear-fill"></i>
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
        `
    }
      view += `
              <tr>
                  <td>${ind++}</td>                
                  <td data-type="${lista.idetapas_produccion},nombre_etapa,nombre_etapa">${lista.nombre_etapa}</td>
                  <td data-type="${lista.idetapas_produccion},detalle,detalle">${lista.detalle}</td>             
                  <td data-type="${lista.idetapas_produccion},seccion_idseccion,seccion_idseccion">${itemseccion.nombre_seccion} ${itemseccion.codigo_seccion}</td>
                  <td>
                      <div class="d-flex gap-3">
                          
                          ${actualizar[privilegios[2]]}
                          ${eliminar[privilegios[3]]}
                          ${config[privilegios[2]]}

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

function sendform(e, form) {
  e.preventDefault();

  const dato = new FormData(form);
  const selectItems = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );
  const selectedValue = selectItems.value;
  dato.append("rubro_idrubro", selectedValue);
  for (let [key, value] of dato.entries()) {
    console.log(key, value);
  }
  fetch(`${URL_APIP}/api/`, {
    method: "POST",
    body: dato,
  })
    .then((res) => res.json())
    .then((data) => {
      
      alertas(data);
    });
}
function alertas(data) {
  console.log(data,data[0]);
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "success" ) {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 1500;
    console.log(alertClass,alertMessage,timeoutDuration);
  } else {
    if (data[0] == "danger") {
      alertClass = "alert-danger";
      alertMessage = data[1];
      timeoutDuration = 3000;
  
    } else {
      alertClass = "alert-primary";
      alertMessage = data[1];
      timeoutDuration = 3000;
      
    }
  }
  console.log(alertClass,alertMessage,timeoutDuration);
  // Obtener el div de alerta
  let divalert = document.querySelector(`#alerta${codigos.codigoRegistrar}`);
  if (divalert) {
    // Crear el nuevo contenido de la alerta
    let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
    divalert.innerHTML = nuevoContenido;

    // Eliminar la alerta después del tiempo especificado
    setTimeout(() => {
      divalert.innerHTML = ``;
      const rubro_idrubro = document.querySelector(`#rubro_idrubro${codigos.codigoPrincipal}`).value;
      
      restaurarRubro(rubro_idrubro);
      sitio();
    }, timeoutDuration);
  }
}

function restaurarRubro(rubro_idrubro){
  const selectrubro = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );
  selectrubro.value = rubro_idrubro;
}