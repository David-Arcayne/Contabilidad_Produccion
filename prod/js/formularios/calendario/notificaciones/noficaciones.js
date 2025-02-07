import * as listarFunctions from "../../funciones/listar.js"
import { URL_APIE } from "../../../../../lib/services.js";
import * as modales from "../../funciones/modales/modal_registrar.js"
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let Lista_tareas_Limpieza = [];
let Lista_limpieza = [];
let Lista_seccion = [];
let listar_tareas_mantenimiento = [];
let Lista_maquinas = [];
let Lista_mantenimiento = [];
let Tareas_pendientes = [];
let privilegios;
let app;
let code_;
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "notificaciones";
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}


export async function notificaciones_conf(code, permisos, refrescar) {
  
    code_ = code ;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
  
    app = document.querySelector(`.p-2[data-value="${code}"] .card-body`);
  
      document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener("click", function () {
          sitio();
      });
  
    sitio();
  }
  



async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    const idsucursal = uk[0].empresa.idsucursal;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
        listarFunctions.listar_api_general_verd('listar_tarea_limpieza',idEmpresa),
        listarFunctions.listar_api_general_verd('listar_limpieza_fecha_reciente',idEmpresa),
        listarFunctions.listarseccion(idEmpresa),
        listarFunctions.listar_api_general_verd('listar_tareas_mantenimiento',idEmpresa),
        listarFunctions.listar_api_general('listar_maquina',idEmpresa),
        listarFunctions.listar_api_general_verd('listar_mantenimiento',idEmpresa),
        
      
    ]);
    // Asignamos los resultados a las variables correspondientes

    Lista_tareas_Limpieza = resultados[0];
    Lista_limpieza = resultados[1];
    Lista_seccion = resultados[2];
    listar_tareas_mantenimiento = resultados[3];
    Lista_maquinas = resultados[4];
    Lista_mantenimiento = resultados[5];
    console.log(Lista_tareas_Limpieza, Lista_limpieza, Lista_seccion);
    
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
 async function preparaNotificaciones() {
    
    
    
    Lista_limpieza.map(lista => {
        let tarea =  Lista_tareas_Limpieza.find(obj => Number(obj.idtarea_limpieza) === Number(lista.tarea_limpieza_idtarea_limpieza));
        
        
        let seccion =  Lista_seccion.find(obj => Number(obj.id) === Number(tarea.seccion_idseccion));
        const fecha = calcularProximoMantenimiento(lista.fecha_inicio,lista.hora_inicio,tarea.frecuencia,tarea.idcontrol_unidad_tiempo);
        
        const tiempo = 100000;
        
        let tareapendiente = {
            'tarea' : tarea.limpieza,
            'descripcion' : tarea.descripcion,
            'area': seccion.nombre_seccion,
            'fecha': fecha
        };
        console.log(tareapendiente);
        Tareas_pendientes.push(tareapendiente);
        
    })
    Lista_mantenimiento.map(lista => {
        
        let tarea =  listar_tareas_mantenimiento.find(obj => Number(obj.idtareas_mantenimiento) === Number(lista.tareas_mantenimiento_idtareas_mantenimiento));
        let maquina =  Lista_maquinas.find(obj => Number(obj.id) === Number(tarea.maquina_idmaquina));
        const fecha = calcularProximoMantenimiento(lista.fecha_inicio,lista.hora_inicio,tarea.frecuencia,tarea.idcontrol_unidad_tiempo);
        const tiempo = 100000;
        console.log(fecha);        
        
        let tareapendiente = {
            'tarea' : tarea.mantenimiento,
            'descripcion' : tarea.descripcion,
            'area': maquina.nombre,
            'fecha': fecha
        };
        Tareas_pendientes.push(tareapendiente);

    })
} 


export function calcularProximoMantenimiento(fechaInicio, horaInicio, frecuencia, unidadTiempo) {
    // Convertir la fecha inicial a objeto Date
    const [anioInicio, mesInicio, diaInicio] = fechaInicio.split('-').map(Number);
    const [horaIn, minutosIn] = horaInicio.split(':').map(Number);
    
    // Crear la fecha con los componentes
    const fecha = new Date(anioInicio, mesInicio - 1, diaInicio, horaIn, minutosIn, 0);
    
    switch (Number(unidadTiempo)) {
        case 1: // Días
            // Para días, multiplicamos la frecuencia por 24 horas
            const horasAgregar = frecuencia * 24;
            fecha.setHours(fecha.getHours() + horasAgregar);
            break;
        case 2: // Semanas
            // Para semanas, convertimos a días (7 * frecuencia) y luego a horas
            const diasAgregar = frecuencia * 7;
            fecha.setHours(fecha.getHours() + (diasAgregar * 24));
            break;
        case 3: // Meses
            // Para meses, calculamos los días aproximados (30.44 días por mes)
            const diasPorMes = 30.44; // Promedio de días en un mes
            const diasTotales = Math.round(frecuencia * diasPorMes);
            fecha.setHours(fecha.getHours() + (diasTotales * 24));
            break;
        case 4: // Años
            // Para años, usamos 365.25 días por año para considerar años bisiestos
            const diasPorAnio = 365.25;
            const diasAnio = Math.round(frecuencia * diasPorAnio);
            fecha.setHours(fecha.getHours() + (diasAnio * 24));
            break;
        default:
            throw new Error('Unidad de tiempo no válida. Usa 1 (días), 2 (semanas), 3 (meses) o 4 (años).');
    }
    
    // Formatear la fecha de salida
    const anioSalida = fecha.getFullYear();
    const mesSalida = String(fecha.getMonth() + 1).padStart(2, '0');
    const diaSalida = String(fecha.getDate()).padStart(2, '0');
    const horaSalida = String(fecha.getHours()).padStart(2, '0');
    const minutosSalida = String(fecha.getMinutes()).padStart(2, '0');
    
    return `${anioSalida}-${mesSalida}-${diaSalida} ${horaSalida}:${minutosSalida}`;
}





const empresa = {
    nombre: uk[0].empresa.nombre,
    direccion: uk[0].empresa.direccion,
    ciudad: uk[0].empresa.ociudad || '',
    estado: uk[0].empresa.oestado || '',
    pais: uk[0].empresa.opais || '',
    logo: `${URL_APIE}${uk[0].empresa.logo}`,
    nit: uk[0].empresa.nit ? `NIT.: ${uk[0].empresa.nit}` : '',
    telefono: uk[0].empresa.telefono ? `Tel.: ${uk[0].empresa.telefono}` : '',
    celular : uk[0].empresa.ocelular ? `Cel.: ${uk[0].empresa.ocelular}` : '',
    email: uk[0].empresa.email || '',
    sitioWeb: uk[0].empresa.ositioweb || ''
}; 









async function sitio() {
  await listar();
  await preparaNotificaciones();
  let view = "",ind = 1;
  view += `
        <div id="alerta${codigo}" class="mt-4"></div>
            
        <div  class="mt-4">

            <div class="row" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="company-info" style="text-align: left; flex: 1;">
                    <h6 style="font-size: 18px; font-weight: bold;">${empresa.nombre}</h6>
                    <p style="font-size: 14px;">${empresa.direccion} <br>
                    ${empresa.ciudad} <br>
                    ${empresa.estado} <br>
                    ${empresa.pais}</p>
                </div>

                <div class="logo" style="text-align: center; flex: 1;">
                    <img src="${empresa.logo}" alt="${empresa.nombre} logo" style="max-height: 100px;">
                </div>
                
                <div class="contact-info" style="text-align: right; flex: 1;">
                    <h6 style="font-size: 18px; font-weight: bold;">${empresa.nit}</h6>
                    <p style="font-size: 14px;">${empresa.telefono} <br>
                    ${empresa.celular} <br>
                    <a href="${empresa.email}">${empresa.email}</a> <br>
                    <a href="${empresa.sitioWeb}">${empresa.sitioWeb}</a></p>
                </div>
            </div>
            <div class="container">
                
                <h5 class="text-center mb-4 fw-bold fs-6" >Tareas pendientes</h5>
            </div>
            <div class="col-md-12 mt-3 d-flex justify-content-between">
                
                    <div class="col-md-6">
                        <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                    </div>
                
                <button type="submit" data-id="descargar_pdf" class="btn btn-danger" id="pdf${codigo}"> <i class="bi bi-filetype-pdf"></i> Descargar pdf</button>
            </div>
            <div>
                
                <table class="table table-striped table-hover" id = "editableTable${codigo}">
                <thead class="table-dark">
                    <tr>
                        <th scope="col">N°</th>
                        <th scope="col">Tarea</th>
                        <th scope="col">Area</th>
                        <th scope="col">Descripción</th>
                        <th scope="col">Proxima Fecha</th>
                    </tr>
                </thead>
                <tbody id="listar_tareas_pendientes${codigo}">
                
                </tbody>
                </table>
            </div>
         </div>
        `;

  app.innerHTML = view;

  listar_tareas_pendientes();
  const descargar = document.querySelector(`#pdf${codigo}`);
  descargar.addEventListener("click", vista_previa_pdf);
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
function descargar_pdf(){
     const pdf = document.querySelector(`#downPDF${codigo}`);
    console.log(pdf);

    var opt = {
        margin: 0.5,
        filename: `${generarNombreArchivo()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' } // Cambiado a 'landscape'
    };

    html2pdf().set(opt).from(pdf).save();
}

async function vista_previa_pdf() {
    const tabla_apdf = document.getElementById(`listar_tareas_pendientes${codigo}`).innerHTML;
    modales.crearModalSoS({
      code: code_,
      type:false,
      x:'1200px',
      y:'800px',
      id: `codigo_modal_detalle_produccion${codigo}`,
      header: `  
          
        

      `,
      body: `

        <div id="downPDF${codigo}" class="mt-4">

            <div class="row" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="company-info" style="text-align: left; flex: 1;">
                    <h6 style="font-size: 18px; font-weight: bold;">${empresa.nombre}</h6>
                    <p style="font-size: 14px;">${empresa.direccion} <br>
                    ${empresa.ciudad} <br>
                    ${empresa.estado} <br>
                    ${empresa.pais}</p>
                </div>

                <div class="logo" style="text-align: center; flex: 1;">
                    <img src="${empresa.logo}" alt="${empresa.nombre} logo" style="max-height: 100px;">
                </div>
                
                <div class="contact-info" style="text-align: right; flex: 1;">
                    <h6 style="font-size: 18px; font-weight: bold;">${empresa.nit}</h6>
                    <p style="font-size: 14px;">${empresa.telefono} <br>
                    ${empresa.celular} <br>
                    <a href="${empresa.email}">${empresa.email}</a> <br>
                    <a href="${empresa.sitioWeb}">${empresa.sitioWeb}</a></p>
                </div>
            </div>
            <div class="container">
                
                <h5 class="text-center mb-4 fw-bold fs-6" >Tareas pendientes</h5>
            </div>
            
            <div>
                
                <table class="table table-striped table-hover" id = "editableTable${codigo}">
                <thead class="table-dark">
                    <tr>
                        <th scope="col">N°</th>
                        <th scope="col">Tarea</th>
                        <th scope="col">Area</th>
                        <th scope="col">Descripción</th>
                        <th scope="col">Proxima Fecha</th>
                    </tr>
                </thead>
                <tbody id="listar_tareas_pendientes_modal${codigo}">
                    ${tabla_apdf}
                </tbody>
                </table>
            </div>
         </div>

      `,
      footerButtons: [
          
          {
              id: `btnCancelar${codigo}`,
              text: "Cancelar",
              class: "btn btn-outline-secondary mr-1 mt-4",
              onClick: () => '',
              dismiss: true // Cierra el modal sin ejecutar ninguna acción
          },
          {
              id: "btndescargar",
              text: `<i class="bi bi-filetype-pdf"></i>`,
              class: "btn btn-outline-success mr-1 mt-4",
              onClick: () => {
                  const pdf = document.querySelector(`#downPDF${codigo}`);
                  console.log(pdf);
                
                  var opt = {
                      margin: 0.5,
                      filename: `${generarNombreArchivo()}.pdf`,
                      image: { type: 'jpeg', quality: 0.98 },
                      html2canvas: { scale: 2, letterRendering: true },
                      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' } // Cambiado a 'landscape'
                  };
                
                  html2pdf().set(opt).from(pdf).save();

              },
              dismiss: false // Esto cierra el modal cuando se hace clic
          },
      ]
      
  });

  
 
}
function generarNombreArchivo() {
    const prefijo = 'Tareas-';
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
  
    const nombre_archivo = `${prefijo}-${currentDate}-${currentTime}`;
  
    return nombre_archivo;
  }
function listar_tareas_pendientes(){
  const table_body = document.getElementById(`listar_tareas_pendientes${codigo}`);
  let view = "",ind = 1;
  Tareas_pendientes.map((lista) => {
      view += `
              <tr>
                  <td>${ind++}</td>                
                  <td>${lista.tarea}</td>                
                  <td>${lista.descripcion}</td>                
                  <td>${lista.area}</td>                
                  <td>${lista.fecha}</td>                             
              </tr>
          `;
  });
  table_body.innerHTML = view;

  
}



