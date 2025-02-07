import * as listarFunctions from "../funciones/listar.js";
import { codigos } from "./constantes.js";

import { editarCelda } from "../funciones/celda_editar.js";
import { Editar_fila_ } from "../funciones/editar_fila_.js";
import * as fuG from "../funciones/generales.js";
import * as registrarFuntions from "../funciones/registrar.js";

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
let Lista_modoPagos = [
    {
      "idmodopago": 1,
      "nombre": "Efectivo",
      "descripcion": "Pago realizado en moneda física o billetes.",
      "estado": 1,
   
    },
    {
      "idmodopago": 2,
      "nombre": "Transferencia Bancaria",
      "descripcion": "Pago realizado a través de una transferencia entre cuentas bancarias.",
      "estado": 1,

    },
    {
      "idmodopago": 3,
      "nombre": "Tarjeta de Crédito",
      "descripcion": "Pago efectuado mediante tarjeta de crédito, con posibilidad de pagos diferidos.",
      "estado": 1,
     
    },
    {
      "idmodopago": 4,
      "nombre": "Tarjeta de Débito",
      "descripcion": "Pago realizado con tarjeta de débito, descontado directamente de la cuenta bancaria.",
      "estado": 1,
 
    },
    {
      "idmodopago": 5,
      "nombre": "Pago Móvil",
      "descripcion": "Pago realizado mediante aplicaciones móviles como PayPal, Venmo o Zelle.",
      "estado": 1,
    
    },
    {
      "idmodopago": 6,
      "nombre": "Cheque",
      "descripcion": "Pago realizado mediante cheque bancario.",
      "estado": 0,
     
    }
  ];
  
  
let Lista_unidad_tiempo = [];
const codigo = codigos.codigoTipoContrato;
let privilegios;

export async function modoPagos_rh_config(code, permisos, refrescar) {
  code_ = code;
  permisos_ = permisos;
  refrescar_ = refrescar;
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
  

  sitio();
}

async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    const idsucursal = uk[0].empresa.idsucursal;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      
      listarFunctions.listar_api_general_verd('listar_modopago',idEmpresa),
      
    ]);

    // Asignamos los resultados a las variables correspondientes
    
    Lista_modoPagos = resultados[0];
    
    console.log(Lista_modoPagos);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "editar_modopago":
      toggleEditSave(event);
      break;
    case "editar_estado_modopago":
      editar_estado_modopago(event);
      break;
    case "eliminar_modopago":
      eliminar_modopago(id1);//
      break;
    
    default:
      sitio();
      break;
  }
}


async function editar_estado_modopago(idmodopago ){
  const modopago = Lista_modoPagos.find(obj => Number(obj.idmodopago) === Number(idmodopago));
  let nuevo_estado = Number(modopago) === 1 ? 0 : 1;
   const formData = new FormData();
  formData.append("verDavid", "editar_estado_modopago");
  formData.append("estado", nuevo_estado);
  formData.append("idmodopago", idmodopago);

    const data = await registrarFuntions.sendformData2(formData);
      if(data[0] == "success" || data[0] === 'ok' ){
        sitio();
        fuG.alertas(data,codigo);
      }
  
}
async function eliminar_modopago(idtipocontrato ){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general_verd('eliminar_modopago',idtipocontrato);
      if(data[0] == "success" || data[0] === 'ok' ){
        sitio();
        fuG.alertas(data,codigo);
      }
  }
}
async function toggleEditSave(event){
    const columnas = [
            {
                index: 1,
                editable: true,
                type: 'text',
                field: 'nombre',
                validations: { required: true }
            },
            {
                index: 2,
                editable: true,
                type: 'text',
                field: 'descripcion',
                validations: { required: true }
            },
           
            
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_modoPagos, columnas, 'idmodopago');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
    
      const formData = new FormData();
      formData.append("verDavid", "editar_modopago");
      formData.append('idempresa',uk[0].empresa.idempresa);
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
  formData.append('verDavid', "editar_modopago");
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

async function sitio() {
  await listar();
  let view = "",ind = 1;
  view += `
        <div class="container">
               
            <h5 class="text-center mb-4 fw-bold fs-6" >Modo Pago</h5>
            <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">

              
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" placeholder="Ingrese el nombre del modo de pago" required>
                </div>
                
                <!-- Descripción -->
                <div class="mb-3">
                    <label for="descripcion" class="form-label">Descripción</label>
                    <textarea class="form-control" id="descripcion" name="descripcion" rows="3" placeholder="Ingrese una descripción" required></textarea>
                </div>
                
                <!-- Estado -->
                <div class="mb-3">
                    <label for="estado" class="form-label">Estado</label>
                    <select class="form-select" id="estado" name="estado" required>
                        <option value="" disabled selected>Seleccione el estado</option>
                        <option value="1">Activo</option>
                        <option value="0">Inactivo</option>
                    </select>
                </div>
                
             
            
                <div class="d-flex justify-content-end mt-4">
                    <button type="submit" class="btn btn-outline-success me-2" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                    <button type="reset" class="btn btn-outline-primary" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>
                </div>
            </form>
            
            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>
            <div id="alerta${codigo}" class="mt-4"></div>


             <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
            </div>
            <div class="mt-4" style = "max-height: 350px; overflow-y: auto; display: block;">
                
                <table class="table table-striped table-hover" id = "editableTable${codigo}">
                  <thead class="table-dark">
                    <tr>
                      <th scope="col">N°</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Descripción</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Funciones</th>
                    </tr>
                  </thead>
                  <tbody id="listar_modopago${codigo}">
                
                  </tbody>
                </table>
            </div>
          </div>
        `;
//listar_modopago      
//editar_modopago
// eliminar_modopago
//registro_modopago
    app.innerHTML = view;

    
    
    listar_modopago();
    
    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e));
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit",async  (e) => {
        e.preventDefault();
        const formData = new FormData(forme);
        const idempresa = uk[0].empresa.idempresa;
        formData.append('idempresa',idempresa);
        formData.append('verDavid','registrar_modopago');

                
        
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        
        const data = await registrarFuntions.sendformData2(formData);
            if(data[0] == "success" || data[0] == 'ok' ){
                sitio();
                fuG.alertas(data,codigo);
            }
        
        
    });
    const toggleButton = document.getElementById(`toggleButton${codigo}`);
    toggleButton.addEventListener("click", (e) =>mostrarFormulario(e, toggleButton, forme));


    const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup", (e) => filtrar_table(e, input));
}


function filtrar_table(e, input) {
  const table = document.getElementById(`editableTable${codigo}`);
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


function listar_modopago() {
  const table_body = document.getElementById(`listar_modopago${codigo}`);
  let view = "",ind = 1;

  Lista_modoPagos.map((lista) => {
    let a = {
        "idmodopago": 1,
        "nombre": "Efectivo",
        "descripcion": "Pago realizado en moneda física o billetes.",
        "estado": 1,
     
      };
      let est = lista.estado === 0 ? `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>` : `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`;
      console.log(lista.estado);
      let estados = {
        0: ``,
        1: `<a data-id="editar_estado_modopago,${lista.idmodopago}"  class="btn">${est}</a> `,
      };
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_modopago,${lista.idmodopago}"
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
                <a  data-id="eliminar_modopago,${lista.idmodopago}"
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
                <td data-type="${lista.idmodopago},nombre,nombre">${lista.nombre}</td>
                <td data-type="${lista.idmodopago},descripcion,descripcion">${lista.descripcion}</td>             
                <td  style="text-align: center; vertical-align: middle;">
                        ${estados[privilegios[2]]}
                </td>


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



