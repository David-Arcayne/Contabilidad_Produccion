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
let Lista_contrataciones = [
    {
        "idcontrataciones": 1,
        "fechai": "2025-01-01",
        "fechaf": "2025-12-31",
        "fechab": null,
        "modo": 1,
        "salario": 1500.00,
        "modopago_idmodopago": 1,
        "trabajador_idtrabajador": 1,
        "tipocontrato_idtipocontrato": 1,
        "estado": 1,
        "tipo": 1,
        "horas": 40,
        "fechafirma": "2025-01-01",
        "fecha": "2025-01-01T10:00:00",
        "cargo_idcargo": 1
    },
    {
        "idcontrataciones": 2,
        "fechai": "2025-02-01",
        "fechaf": "2026-01-31",
        "fechab": null,
        "modo": 2,
        "salario": 2000.00,
        "modopago_idmodopago": 2,
        "trabajador_idtrabajador": 2,
        "tipocontrato_idtipocontrato": 2,
        "estado": 1,
        "tipo": 2,
        "horas": 35,
        "fechafirma": "2025-02-01",
        "fecha": "2025-02-01T15:00:00",
        "cargo_idcargo": 2
    },
    {
        "idcontrataciones": 3,
        "fechai": "2025-03-01",
        "fechaf": null,
        "fechab": null,
        "modo": 1,
        "salario": 1800.00,
        "modopago_idmodopago": 3,
        "trabajador_idtrabajador": 3,
        "tipocontrato_idtipocontrato": 1,
        "estado": 0,
        "tipo": 1,
        "horas": 40,
        "fechafirma": "2025-03-01",
        "fecha": "2025-03-01T09:00:00",
        "cargo_idcargo": 3
    }
];
let Lista_tipoContrato = [
    {
      "idtipocontrato": 1,
      "nombre": "Contrato Permanente",
      "observacion": "Este tipo de contrato es a largo plazo y asegura estabilidad laboral.",
      "fecha": "2025-01-01",
    },
    {
      "idtipocontrato": 2,
      "nombre": "Contrato Temporal",
      "observacion": "Se utiliza para proyectos específicos o de corta duración.",
      "fecha": "2025-02-15",
    },
    {
      "idtipocontrato": 3,
      "nombre": "Contrato por Obra",
      "observacion": "Contrato que finaliza una vez se termina la obra acordada.",
      "fecha": "2025-03-10",
    },
    {
      "idtipocontrato": 4,
      "nombre": "Contrato Freelance",
      "observacion": "Diseñado para trabajos autónomos sin vínculo laboral formal.",
      "fecha": "2025-04-05",
    },
    {
      "idtipocontrato": 5,
      "nombre": "Contrato de Prácticas",
      "observacion": "Orientado a estudiantes o recién graduados para obtener experiencia laboral.",
      "fecha": "2025-05-20",
    }
  ];
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
let list_trabajador = [
    {
        "idtrabajador": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "ci": "12345678",
        "telefono": "555-1234",
        "email": "juan.perez@example.com",
        "fnacimiento": "1985-05-20",
        "direccion": "Av. Principal 123",
        "estado": "Activo",
        "foto": "juan_perez.jpg",
        "nacionalidad": "Boliviana",
        "profesion": "Ingeniero",
        "estadot": "Contratado",
        "fecha": "2025-01-01",
        "cargos_idcargos": 1,
        "sexo": 1,
        "estadocivil": 1
    },
    {
        "idtrabajador": 2,
        "nombre": "María",
        "apellido": "Gómez",
        "ci": "87654321",
        "telefono": "555-5678",
        "email": "maria.gomez@example.com",
        "fnacimiento": "1990-08-15",
        "direccion": "Calle Secundaria 456",
        "estado": "Activo",
        "foto": "maria_gomez.jpg",
        "nacionalidad": "Argentina",
        "profesion": "Contadora",
        "estadot": "Contratado",
        "fecha": "2025-01-05",
        "cargos_idcargos": 2,
        "sexo": 2,
        "estadocivil": 2
    },
    {
        "idtrabajador": 3,
        "nombre": "Carlos",
        "apellido": "Ramírez",
        "ci": "13579246",
        "telefono": "555-6789",
        "email": "carlos.ramirez@example.com",
        "fnacimiento": "1980-12-10",
        "direccion": "Av. Siempreviva 789",
        "estado": "Inactivo",
        "foto": "carlos_ramirez.jpg",
        "nacionalidad": "Peruana",
        "profesion": "Abogado",
        "estadot": "Retirado",
        "fecha": "2024-12-31",
        "cargos_idcargos": 3,
        "sexo": 1,
        "estadocivil": 3
    }
];
let Lista_cargos = [
    {
        "idcargos": 1,
        "cargo": "Gerente General",
        "salario": 10000,
        "descripcion": "Responsable de la gestión estratégica de la empresa.",
        "fecha": "2025-01-01",
        "areas_idareas": 1
    },
    {
        "idcargos": 2,
        "cargo": "Analista Financiero",
        "salario": 7000,
        "descripcion": "Encargado del análisis financiero y presupuestario.",
        "fecha": "2025-01-05",
        "areas_idareas": 2
    },
    {
        "idcargos": 3,
        "cargo": "Desarrollador de Software",
        "salario": 5000,
        "descripcion": "Desarrollo y mantenimiento de aplicaciones web y móviles.",
        "fecha": "2025-01-10",
        "areas_idareas": 3
    },
    {
        "idcargos": 4,
        "cargo": "Asistente Administrativo",
        "salario": 3000,
        "descripcion": "Soporte en las tareas administrativas del departamento.",
        "fecha": "2025-01-15",
        "areas_idareas": 4
    },
    {
        "idcargos": 5,
        "cargo": "Especialista en Recursos Humanos",
        "salario": 4500,
        "descripcion": "Gestión de procesos de selección, capacitación y nómina.",
        "fecha": "2025-01-20",
        "areas_idareas": 5
    }
];
let Lista_trabajadores = [];
const codigo = codigos.codigoTipoContrato;
let privilegios;

export async function contratacion_rh_config(code, permisos, refrescar) {
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
      
      listarFunctions.listar_api_general_verd('listar_contrataciones',idsucursal),
      listarFunctions.listar_api_general_verd('listar_tipocontrato',idEmpresa),
      listarFunctions.listar_api_general_verd('listar_modopago',idEmpresa),
      listarFunctions.listar_api_general('get_trabajador_recursos_humanos',idsucursal),
      listarFunctions.listar_api_general('listado_cargos',idsucursal),
      
    ]);

    // Asignamos los resultados a las variables correspondientes
    
    Lista_contrataciones = resultados[0];
    Lista_tipoContrato = resultados[1];
    Lista_modoPagos = resultados[2];
    list_trabajador = resultados[3];
    Lista_cargos = resultados[4];
    console.log(Lista_contrataciones,Lista_tipoContrato,Lista_modoPagos,list_trabajador,Lista_cargos);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "editar_contrataciones":
      toggleEditSave(event);
      break;
    case "editar_estado_contrataciones":
      editar_estado_contrataciones(id1);//
      break;
    
    default:
      sitio();
      break;
  }
}


async function editar_estado_contrataciones(idcontrataciones ){
    const contrato = Lista_contrataciones.find(obj => Number(obj.idcontrataciones) === Number(idcontrataciones));
    const nuevo_estado = Number(contrato.estado) === 1 ? 0 : 1;
    const formData = new FormData();
    formData.append("verDavid", "editar_estado_contrataciones");
    formData.append("estado", nuevo_estado);
    formData.append("idcontrataciones", idcontrataciones);
  
    const data = await registrarFuntions.sendformData2(formData);
      if(data[0] == "success" || data[0] === 'ok' ){
        sitio();
        fuG.alertas(data,codigo);
      }
  
}
async function toggleEditSave(event){

 let a = {
    "idcontrataciones": "5",
    "fechai": "2020-01-01",
    "fechaf": null,
    "fechab": "0000-00-00",
    "modo": "1",
    "salario": "25000",
    "modopago_idmodopago": "6",
    "trabajador_idtrabajador": "59",
    "tipocontrato_idtipocontrato": "11",
    "estado": "1",
    "tipo": "1",
    "horas": "8",
    "fechafirma": "2020-01-01",
    "cargo_idcargo": "39",
    "fecha": "2024-12-05 22:41:00"
}

      // <th>Fecha Inicio</th>
      // <th>Fecha Fin</th>
      // <th>Fecha Baja</th>

      // <th>Salario</th>
      // <th>Modo Pago</th>
      // <th>Trabajador</th>
      // <th>Tipo Contrato</th>
      // <th>Estado</th>
      // <th>Horas</th>
      // <th>Fecha Firma</th>
      // <th>Fecha</th>
      // <th>Cargo</th>
    let opc_modopago = [];
    Lista_modoPagos.map(lista => {
      let obj ={ 
        'value': lista.idmodopago,
        'label': lista.nombre
      }
      opc_modopago.push(obj);
    });
    console.log(opc_modopago);
    let opc_tipocontrato = [];
    Lista_tipoContrato.map(lista => {
      let obj ={ 
        'value': lista.idtipocontrato,
        'label': lista.nombre
      }
      opc_tipocontrato.push(obj);
    });
    console.log(opc_tipocontrato);
    let opc_cargo = [];
    Lista_cargos.map(lista => {
      let obj ={ 
        'value': lista.idcargos,
        'label': lista.cargo
      }
      opc_cargo.push(obj);
    });
    console.log(opc_cargo);
    
    const columnas = [
            {
                index: 1,
                editable: true,
                type: 'date',
                field: 'fechai',
                validations: { required: true },
                format: {                    // Formato opcional para visualización
                 
                  style: 'height:200px',
                  
                }
            },
            {
                index: 2,
                editable: true,
                type: 'date',
                field: 'fechaf',
                validations: { required: false }
            },
            {
                index: 3,
                editable: true,
                type: 'date',
                field: 'fechab',
                validations: { required: false }
            },
            {
                index: 4,
                editable: true,
                type: 'number',
                field: 'salario',
                validations: { required: true }
            },
           
            {
                index: 5,
                editable: true,
                type: 'select',
                field: 'modopago_idmodopago',
                validations: { required: true },
                options:  opc_modopago,
                
            },
            {
                index: 7,
                editable: true,
                type: 'select',
                field: 'tipocontrato_idtipocontrato',
                validations: { required: true },
                options:  opc_tipocontrato,
                
            },
            
            
            {
              index: 9,
              editable: true,
              type: 'number',
              field: 'horas',
              validations: { required: true },
              
              
            },
            {
              index: 10,
              editable: true,
              type: 'date',
              field: 'fechafirma',
              validations: { required: false },
              
              
            },
            {
              index: 11,
              editable: true,
              type: 'datetime',
              field: 'fecha',
              validations: { required: true },
              
              
            },
            {
              index: 12,
              editable: true,
              type: 'select',
              field: 'cargo_idcargo',
              validations: { required: true },
              options:  opc_cargo,
              
            },
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_contrataciones, columnas, 'idcontrataciones');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
    
      const formData = new FormData();
      formData.append("verDavid", "editar_contrataciones");
      formData.append("sucursal_idsucursal", uk[0].empresa.idsucursal);

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
  formData.append('verDavid', "editar_contrataciones");
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

function initializeDropdownSearch_m(codigo, Lista_Material,clave, valor,apellido, condicion,entidad) {
  const searchInput = document.getElementById(`searchInput${codigo}`);
  const dropdownList = document.getElementById(`dropdownList${codigo}`);

  // Crear la lista inicial
  function populateDropdown(filteredItems) {
      dropdownList.innerHTML = ''; // Limpia la lista
      filteredItems.forEach(item => {
          const li = document.createElement('li');
          li.textContent =item [clave] + " "+item[valor] + " "+ item[apellido];
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
              
              searchInput.value = item [clave] +" "+ item[valor] + " " + item[apellido];
              
              
              dropdownList.style.display = 'none'; // Oculta la lista
              item['entidad']=entidad;
              parametros_extras(item);
          });

          dropdownList.appendChild(li);
      });
  }

  // Filtrar la lista según el texto ingresado
  function filterItems(searchText) {
      if(condicion){
        
          const filtered = Lista_Material.filter(item =>
              item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
              item[clave].toLowerCase().includes(searchText.toLowerCase()) ||
              item[apellido].toLowerCase().includes(searchText.toLowerCase()) 

          );
          
          populateDropdown(filtered);
      }else{
          const filtered = Lista_Material.filter(item =>
              item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
              item[clave].toLowerCase().includes(searchText.toLowerCase()) ||
              item[apellido].toLowerCase().includes(searchText.toLowerCase())
          );
          populateDropdown(filtered);
      }
      
  }

  // Mostrar y manejar eventos del input
  searchInput.addEventListener('focus', () => {
      dropdownList.style.display = 'block';
      if(condicion){
        
          populateDropdown(Lista_Material); // Muestra todos los elementos inicialmente
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
function parametros_extras(item){
  
  if(item['entidad'] === 'etapa'){
      document.getElementById(`etapas_produccion_idetapas_produccion${codigos.codigo_etapa}`).value = item.idetapas_produccion;
  }else if (item['entidad'] === 'trabajador'){
      document.getElementById(`trabajador_idtrabajador${codigos.codigoTrabajador}`).value = item.idtrabajador;
  }
}
async function sitio() {
  await listar();
  let view = "",ind = 1;
  view += `
        <div class="container">
               
            <h5 class="text-center mb-4 fw-bold fs-6" >Contratación</h5>
            <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">
                <div class=" col-md-12 border p-3 m-0 rounded">
                    <div class="row">
                                      
                        <div style="position: relative;" class="col-md-6">
                            <input type="hidden" name="trabajador_idtrabajador" id="trabajador_idtrabajador${codigos.codigoTrabajador}" required >

                            <label for="trabajador" class="form-label">Trabajador:</label>
                            <input type="text" id="searchInput${codigos.codigoTrabajador}" placeholder="Buscar..." class="form-control" name="trabajador" required>
                            <ul id="dropdownList${codigos.codigoTrabajador}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="fechai" class="form-label">Fecha de Inicio</label>
                            <input type="date" class="form-control" id="fechai${codigo}" name="fechai" required>
                        </div>
                    </div>
                     
                </div>
                
                <!-- Sección de Fechas -->
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="fechaf" class="form-label">Fecha de Finalización</label>
                        <input type="date" class="form-control" id="fechaf" name="fechaf">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="fechab" class="form-label">Fecha de Baja</label>
                        <input type="date" class="form-control" id="fechab" name="fechab">
                    </div>
                   
                </div>

                <!-- Información principal -->
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label for="tipocontrato_idtipocontrato" class="form-label">Tipo de Contrato</label>
                        <select class="form-select" id="tipocontrato_idtipocontrato${codigo}" name="tipocontrato_idtipocontrato" required>
                            <option value="" disabled selected>Seleccione un tipo de contrato</option>
                            <!-- Opciones a llenar dinámicamente -->
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="cargo_idcargo" class="form-label">Cargo</label>
                        <select class="form-select" id="cargo_idcargo${codigo}" name="cargo_idcargo" required>
                            <option value="" disabled selected>Seleccione un cargo</option>
                            <!-- Opciones a llenar dinámicamente -->
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="salario" class="form-label">Salario</label>
                        <input type="number" step="0.01" class="form-control" id="salario" name="salario" placeholder="Ingrese el salario" required>
                    </div>
                </div>

                <!-- Relaciones con otras tablas -->

                <!-- Estado y Tipo -->
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <label for="estado" class="form-label">Estado</label>
                        <select class="form-select" id="estado" name="estado" required>
                            <option value="1">Activo</option>
                            <option value="2">Inactivo</option>
                        </select>
                    </div>
                     <div class="col-md-3 mb-3">
                        <label for="horas" class="form-label">Horas</label>
                        <input type="number" step="0.1" class="form-control" id="horas" name="horas" placeholder="Horas contratadas">
                    </div>
                    <div class="col-md-3 mb-3">
                        <label for="fechafirma" class="form-label">Fecha de Firma</label>
                        <input type="date" class="form-control" id="fechafirma${codigo}" name="fechafirma">
                    </div>
                    <div class="col-md-3 mb-3">
                        <label for="fecha" class="form-label">Fecha</label>
                        <input type="datetime-local" class="form-control" id="fecha${codigo}" name="fecha">
                    </div>
                </div>

                
                 <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="modopago_idmodopago" class="form-label">Modo de Pago</label>
                        <select class="form-select" id="modopago_idmodopago${codigo}" name="modopago_idmodopago" required>
                            <option value="" disabled selected>Seleccione el modo de pago</option>
                            <!-- Opciones a llenar dinámicamente -->
                        </select>
                    </div>
                    
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
                            <th>ID</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Fecha Baja</th>
                            <th>Salario</th>
                            <th>Modo Pago</th>
                            <th>Trabajador</th>
                            <th>Tipo Contrato</th>
                            <th>Estado</th>
                            <th>Horas</th>
                            <th>Fecha Firma</th>
                            <th>Fecha</th>
                            <th>Cargo</th>
                            <th>Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_contrataciones${codigo}">
                    
                    </tbody>
                </table>
            </div>
          </div>
        `;
//listar_contrataciones      
//editar_contrataciones
// eliminar_contrato
//registro_contrato
    app.innerHTML = view;

    
    
    listar_contrataciones();
    initializeDropdownSearch_m(codigos.codigoTrabajador, list_trabajador,'ci','nombre','apellido',true,'trabajador');
    await fuG.llenarSelects(Lista_tipoContrato,'idtipocontrato','nombre',`tipocontrato_idtipocontrato${codigo}`);
    await fuG.llenarSelects(Lista_cargos,'idcargos','cargo',`cargo_idcargo${codigo}`);
    await fuG.llenarSelects(Lista_modoPagos,'idmodopago','nombre',`modopago_idmodopago${codigo}`);
    document.getElementById(`fecha${codigo}`).value = fuG.dateTime_actual();
    document.getElementById(`fechai${codigo}`).value = fuG.fechaBolivia();
    document.getElementById(`fechafirma${codigo}`).value = fuG.fechaBolivia();

    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e));
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit",async  (e) => {
       e.preventDefault();

 
              const formData = new FormData(forme);
              const idempresa = uk[0].empresa.idempresa;
              formData.append('idempresa',idempresa);
              formData.append('verDavid','registrar_contrataciones'); 
              formData.append('modo','1'); 
              formData.append('tipo','1'); 
              
              for (let [key, value] of formData.entries()) {
                console.log(key, value);
              }
              
              const data = await registrarFuntions.sendformData2(formData);
                  if(data[0] == "success" || data[0] == 'ok' ){
                      sitio();
                      fuG.alertas(data,codigo);
                  }else{
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


function listar_contrataciones() {
  const table_body = document.getElementById(`listar_contrataciones${codigo}`);
  let view = "",ind = 1;

  Lista_contrataciones.map((lista) => {
    let a = {
        "idcontrataciones": 1,
        "fechai": "2025-01-01",
        "fechaf": "2025-12-31",
        "fechab": null,
        "modo": 1,
        "salario": 1500.00,
        "modopago_idmodopago": 1,
        "trabajador_idtrabajador": 1,
        "tipocontrato_idtipocontrato": 1,
        "estado": 1,
        "tipo": 1,
        "horas": 40,
        "fechafirma": "2025-01-01",
        "fecha": "2025-01-01T10:00:00",
        "cargo_idcargo": 1
    };
    let b ={
        "idtipocontrato": 1,
        "nombre": "Contrato Permanente",
        "observacion": "Este tipo de contrato es a largo plazo y asegura estabilidad laboral.",
        "fecha": "2025-01-01",
      };
      let c = {
        "idmodopago": 1,
        "nombre": "Efectivo",
        "descripcion": "Pago realizado en moneda física o billetes.",
        "estado": 1,
     
      };
      let d = {
        "idtrabajador": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "ci": "12345678",
        "telefono": "555-1234",
        "email": "juan.perez@example.com",
        "fnacimiento": "1985-05-20",
        "direccion": "Av. Principal 123",
        "estado": "Activo",
       
        "nacionalidad": "Boliviana",
        "profesion": "Ingeniero",
        "estadot": "Contratado",
        "fecha": "2025-01-01",
        "cargos_idcargos": 1,
        "sexo": 1,
        "estadocivil": 1
    };
    let e = {
        "idcargos": 1,
        "cargo": "Gerente General",
        "salario": 10000,
        "descripcion": "Responsable de la gestión estratégica de la empresa.",
        "fecha": "2025-01-01",
        "areas_idareas": 1
    };
      let modopago = Lista_modoPagos.find(obj => Number(obj.idmodopago) === Number(lista.modopago_idmodopago));
      let trabajador = list_trabajador.find(obj => Number(obj.idtrabajador) === Number(lista.trabajador_idtrabajador));
      let tipo_contrato = Lista_tipoContrato.find(obj => Number(obj.idtipocontrato) === Number(lista.tipocontrato_idtipocontrato));
      let cargo = Lista_cargos.find(obj => Number(obj.idcargos) === Number(lista.cargo_idcargo));
      let est = Number(lista.estado) === 1 ? `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>` : `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`;
      let estados = {
        0: ``,
        1: `<a data-id="editar_estado_contrataciones,${lista.idcontrataciones}"  class="btn">${est}</a> `,
      };
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_contrataciones,${lista.idcontrataciones}"
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
                <a  data-id="eliminar_contrato,${lista.idcontrataciones}"
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
                <td data-type="${lista.idcontrataciones},fechai,fechai" style="width:80px">${fuG.cambiarFormatoFecha(lista.fechai)}</td>
                <td data-type="${lista.idcontrataciones},fechaf,fechaf" style="width:80px">${fuG.cambiarFormatoFecha(lista.fechaf)}</td>             
                <td data-type="${lista.idcontrataciones},fechab,fechab" style="width:80px">${fuG.cambiarFormatoFecha(lista.fechab)}</td>             
                <td data-type="${lista.idcontrataciones},salario,salario">${lista.salario}</td>             
                <td data-type="${lista.idcontrataciones},modopago_idmodopago,modopago_idmodopago">${modopago.nombre}</td>             
                <td data-type="${lista.idcontrataciones},trabajador_idtrabajador,trabajador_idtrabajador">${trabajador.ci} ${trabajador.nombre} ${trabajador.apellido}</td>             
                <td data-type="${lista.idcontrataciones},tipocontrato_idtipocontrato,tipocontrato_idtipocontrato">${tipo_contrato.nombre}</td>      
                <td  style="text-align: center; vertical-align: middle;">
                        ${estados[privilegios[2]]}
                </td>      
                <td data-type="${lista.idcontrataciones},horas,horas">${lista.horas}</td>             
                <td data-type="${lista.idcontrataciones},fechafirma,fechafirma" style="width:80px">${fuG.cambiarFormatoFecha(lista.fechafirma)}</td>             
                <td data-type="${lista.idcontrataciones},fecha,fecha">${lista.fecha}</td>             
                <td data-type="${lista.idcontrataciones},cargo_idcargo,cargo_idcargo">${cargo.cargo}</td>                         
                


                <td>
                    <div class="d-flex gap-3">
                        
                        ${actualizar[privilegios[2]]}
                        
        

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



