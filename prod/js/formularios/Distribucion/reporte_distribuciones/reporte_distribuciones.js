import { URL_APIP } from "../../../../../lib/services.js";
import { URL_APIE } from "../../../../../lib/services.js";
import { codigos } from "../constantes.js";
import * as listarFunctions from "../../funciones/listar.js";
import { solicitudes_detalle_producto } from "./detalle_distribucion.js";
import { registrar_distribucion } from "../distribucion/distribucion.js";
import * as modales from "../../funciones/modales/modal_registrar.js";
import * as registerFunctions from "../../funciones/registrar.js";
import { control_calidad_compra } from "../../control_calidad/principal.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let Lista_proveedores = [];
let privilegios;
let Lista_distribuciones = [];
let Lista_rubro = [];
let Lista_empleados = [];
let Lista_productos = [];
let Lista_medida = [];
let List_Envases =[];
const codigo = codigos.codigo_reporte_distribucion;
let code;
let permisos_;
let refrescar_;

export function reporte_distribuciones(code_, permisos, refrescar) {
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
  code = code_;
  permisos_ = permisos;
  refrescar_ = refrescar;
  document.querySelector(`button[id^="refrescar"][id$="${code_}"]`).addEventListener("click", function () {
    sitio();
  });
  sitio();
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([

      listarFunctions.listar_api_general_verd("listar_distribucion", idEmpresa),
      listarFunctions.listar_api_general("listar_rubro", idEmpresa),
      listarFunctions.listar_Empleados(idEmpresa),
      listarFunctions.listar_api_general("listar_productos_comercial",idEmpresa),
      listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
      
      
    ]);
    // Asignamos los resultados a las variables correspondientes
    
    Lista_distribuciones = resultados[0];
    Lista_rubro = resultados[1];
    Lista_empleados = resultados[2];
    Lista_productos = resultados[3];
    Lista_medida = resultados[4];


    listar_rubro();
    console.log(resultados[3], resultados[1]);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
function menu(event){
  const dataid = event.currentTarget.getAttribute('data-id');
  const [funcion, id1,id2] = dataid.split(',');
  switch (funcion) {
      case "detalle_distribucion":
        solicitudes_detalle_producto(code,permisos_,refrescar_,id1);
          break;
      //anular_distribucion
      case "descargar_pdf":
        descargar_pdf(id1);
          break;
      case "anular_distribucion":
        anular_distribucion(id1);
          break;
      case "estado":
        estado(id1);
          break;
      
      default:
          sitio();
          break;
  }

}
function estado(iddistribucion){
  const distribucion = Lista_distribuciones.find(obj => Number(obj.iddistribucion) === Number(iddistribucion));
  if(Number(distribucion.estado) === 0){
    control_calidad_compra(code,permisos_,refrescar_);
  }

}
function anular_distribucion(iddistribucion){
  const distribucion = Lista_distribuciones.find(obj => Number(obj.iddistribucion)=== Number(iddistribucion));
  let mensaje = {
    "0": 'Se anulara la distribucion..',
    "-1": 'Se activara la distribucion',
  };
  
      const modal = modales.crearModal({
          code: code,
          id: `modal_finalizar_produccion${codigos.codigo_anular_distribucion}`,
          header: `
              
          `,
          body: `
  
              <div id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                  <div >
                      <div class = "row" >
                          <!-- Modal Body -->
                          <div  style="text-align: center;">
                              <div class="icon-warning" style="font-size: 100px; color: #f5c06b;">⚠️</div>
                              <h5 style="font-size: 24px; font-weight: bold; margin-top: 10px;">Esta seguro....?</h5>
                              <p style="color: #6c757d;">${mensaje[distribucion.estado]}</p>
                          </div>
                      </div>
                  </div>
              </div>
          
          `,
          footerButtons: [
              {
                  id: "btnConfirmar",
                  text: "Confirmar",
                  class: "btn-primary",
                  onClick: () => {
                        f_anular_compra(iddistribucion);
                  },
                  dismiss: true // Esto NO cierra el modal cuando se hace clic
              },
              {
                  id: "btnCancelar",
                  text: "Cancelar",
                  class: "btn-secondary",
                  onClick: () => {
                      // Puedes agregar aquí cualquier acción personalizada
                  },
                  dismiss: true // Cierra el modal sin ejecutar ninguna acción
              }
          ]
      });
  
  async function f_anular_compra(iddistribucion) {
      const formData = new FormData();
      formData.append('verDavid', 'anularDistribucion');
      formData.append('iddistribucion',iddistribucion);
      for (let [key, value] of formData.entries()) {
          console.log(key, value);
      }
      const data = await registerFunctions.sendformData2(formData)

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
              ${await sitio()}`,
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
      }
      const modal = modales.crearModal({
          code: code,
          id: `confirmacion${codigos.codigo_anular_distribucion}`,
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
                  dismiss: true // Esto NO cierra el modal cuando se hace clic
              }
          ]
      });
  }
}
function listar_rubro() {
  console.log("listo");

  const listar2 = document.querySelector(
    `#rubro_idrubro${codigo}`
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

function descargar_pdf(iddistribucion) {
  const distribucion = Lista_distribuciones.find(obj => Number(obj.iddistribucion) === Number(iddistribucion));
  console.log(distribucion)
  let estado_distribucion = Number(distribucion.estado) === 1 ? '<div class="icon-success" style="font-size: 30px; color: #167e1a; width:10px;"><i class="bi bi-check-circle"></i></div>' : '<div class="icon-danger" style="font-size: 30px; color: #cf0927; width:10px;"><i class="bi bi-question"></i></div>';
  let estado_mesaje = Number(distribucion.estado)  === 0 ? 'Pendiente': Number(distribucion.estado) === 1 ? 'Entregado': 'Anulado'; 

  let itemrubro = Lista_rubro.find((obj) => Number(obj.id) === Number(distribucion.rubro_idrubro)) || {id: 0,rubro: "-",detalle: "-",};
  let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(distribucion.usuario_idusuario)) || {nombre : 'Benjamin_0', apellido: 'Mora_0'};
  modales.crearModalSoS({
          code: code,
          type:false,
          x:'1200px',
          y:'800px',
          id: `modal_control_calidad${codigo}`,
          header: `  
              
             
  
          `,
          body: `
  
              <div  id="reporte${codigo}">
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
                        <h5 class="text fw-bold mb-3">Distribución</h5>
                    </div>
                    
                    <div class="contact-info" style="text-align: right; flex: 1;">
                        <h6 style="font-size: 18px; font-weight: bold;">${empresa.nit}</h6>
                        <p style="font-size: 14px;">${empresa.telefono} <br>
                        ${empresa.celular} <br>
                        <a href="${empresa.email}">${empresa.email}</a> <br>
                        <a href="${empresa.sitioWeb}">${empresa.sitioWeb}</a></p>
                    </div>
                    
                </div>
                
                

                     
                    <div class="d-flex flex-wrap  align-items-center gap-3">
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Responsable:</strong> ${item_empleado.nombre} ${item_empleado.apellido}</p>
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Numero Registro:</strong> ${distribucion.numerodoc}</p>
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Estado:</strong> ${estado_mesaje}</p>
                        
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Fecha:</strong> ${distribucion.fecha}</p>
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Hora:</strong> ${distribucion.hora}</p>
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Rubro:</strong>${itemrubro.rubro}</p>
                    </div>
                    
                    <div class="mt-4" >
                      <table class="table table-hover" id="editableTable${codigo}">
                          <thead class="table-dark">
                              <tr>
                                      <th>N°</th>
                                      <th>Codigo</th>
                                      <th>Producto</th>
                                      <th>Cantidad</th>
                                      <th>Medida</th>
                                      
                              </tr>
                          </thead>
                          <tbody id="listar_detalle_distribucion${codigo}">
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
                      const pdf = document.querySelector(`#reporte${codigo}`);
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
      table_listar();
      function table_listar(){
        const table = document.getElementById(`listar_detalle_distribucion${codigo}`);
       
      
        let view = "",ind = 1;
    
        const distribucion = Lista_distribuciones.find(obj => Number(obj.iddistribucion) === Number(iddistribucion));
        
        distribucion.detalle.map((detalle)=>{ 
            
          let producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(detalle.producto_idproducto)) || {"nombre": "-","codigo": "-"};
      
          let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(producto.unidad_id_unidad)) || {'nombre':'-'};
                           
            view += `
                 <tr style = "style=width: 50px; height: 50px;">
                        <td>${ind++}</td>   
                        <td>${producto.codigo}</td>          
                        <td>${producto.nombre} </td>
                        <td>${detalle.cantidad}</td>
                        <td>${item_medida.nombre}</td>
                    </tr>  
            `;
        })
        table.innerHTML = view;
        const enlaces = document.querySelectorAll(`.btn${codigo}`);
         enlaces.forEach(enlace => {
             enlace.addEventListener("click", menu);
         });
     }
  
}

function generarNombreArchivo() {
  const prefijo = 'Distribucion';
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

async function sitio() {
  let view = `
      <div class="">
        <div class="col-md-12 mt-3 d-flex justify-content-between">
          <button type="button" class="btn btn-success" id="nueva_distribucion${codigo}" style = "height:30px;">Despachar Producto</button>

          <div class="col-md-3 mb-3 " >
              <div class="row">
                  
                  <select class="form-select" id="rubro_idrubro${codigo}" name="rubro_idrubro">
                      <option value="" disabled selected>Seleccione un rubro</option>
                      
                  </select>
              </div>
          </div>
                   
        </div>
        <div style = "max-height: 500px; overflow-y: auto; display: block;">
              <table class="table table-hover" id="editableTable${codigo}">
                <thead class="table-dark">
                    <tr>
                          <th>N°</th>
                          <th>Numero Doc</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Empleado</th>
                          <th>Rubro</th>
                          <th>Estado</th>
                          <th scope="col">Detalle</th>
                          <th scope="col">Funciones</th>
                    </tr>
                </thead>
                <tbody id="listar_distribucion${codigo}">
                    
                </tbody>
            </table>    
        </div>
          
      </div>
    `;
  app.innerHTML = view;
  await listar();
  table_listar();
  const selectrubro = document.querySelector(`#rubro_idrubro${codigo}`);

  selectrubro.addEventListener("change", function () {
    table_listar();
    
  });

  const btn_compra = document.getElementById(`nueva_distribucion${codigo}`);
  btn_compra.addEventListener('click',nueva_distribucion);
}
function nueva_distribucion(e){
  e.preventDefault();

  registrar_distribucion(code,permisos_,refrescar_)
}
function table_listar(){
  const table = document.getElementById(`listar_distribucion${codigo}`);
  const idrubro =document.getElementById(`rubro_idrubro${codigo}`).value;
  let view = "", ind = 1;
  const filtrados = Lista_distribuciones.filter(obj => Number(obj.rubro_idrubro)=== Number(idrubro));

  filtrados.map(distribucion=>{
      let estado_distribucion = Number(distribucion.estado) === 1 ? '<div class="icon-success" style="font-size: 30px; color: #167e1a; width:10px;"><i class="bi bi-check-circle"></i></div>' : '<div class="icon-danger" style="font-size: 30px; color: #cf0927; width:10px;"><i class="bi bi-question"></i></div>';
      let anulado = Number(distribucion.estado) === -1 ? `<i class="bi bi-hand-thumbs-down-fill" style="color:red;"></i>`:`<i class="bi bi-hand-thumbs-up-fill" style="color:blue;"></i> `;
      let color = Number(distribucion.estado) === -1 ? 'danger':'primary';
      let itemrubro = Lista_rubro.find((obj) => Number(obj.id) === Number(distribucion.rubro_idrubro)) || {id: 0,rubro: "-",detalle: "-",};
      let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(distribucion.usuario_idusuario)) || {nombre : 'Benjamin_0', apellido: 'Mora_0'};
      let estadocss = Number(distribucion.estado)  === 0 ? '': Number(distribucion.estado) === 1 ? 'disabled':''; 

      //<button type="submit" data-id="descargar_pdf" class="btn btn-danger" id="pdf${codigos.codigo_pdf}"> <i class="bi bi-filetype-pdf"></i> Descargar pdf</button>

      let  pdf = {
        0: ``,
        1: `
                       
              <div class="text-center">
                  <a data-id="descargar_pdf,${distribucion.iddistribucion}"
                  class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Descargar pdf">
                     <i class="bi bi-filetype-pdf fs-5"></i>
                  </a>
                  <span class="d-block mt-1 small"></span>
              </div>
              `,
      };
      let eliminar = {
        0: ``,
        1: `
            <div class="text-center">
                <a  data-id="anular_distribucion,${distribucion.iddistribucion}"
                class="btn btn-outline-${color} rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo} ${estadocss}"
                style="width: 2.5rem; height: 2.5rem;"
                title="Anular distribucion">
                    ${anulado}
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
            `,
      };

      let ver_detalle = {
        0: ``,
        1: `
            <div class="text-center">
                <div class="text-center">
                    <a data-id="detalle_distribucion,${distribucion.iddistribucion}"
                        class="btn btn-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                        id="detalle_distribucion${codigo}"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="Detalle distribucion">
                        <i class="bi bi-border-width"></i>
                    </a>
                    <span class="d-block mt-1 small">Detalle</span>
                </div>
            </div>
            `,
      };
      let estado = {
        0: ``,
        1: `
            <div class="text-center">
                <div class="text-center">
                    <a data-id="estado,${distribucion.iddistribucion}"
                        class="btn  p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                        id="estado${codigo}"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="estado">
                         ${estado_distribucion} 
                    </a>
                    
                </div>
            </div>
            `,
      };
      view += ` 
          <tr>
                   
                  <td>${ind++}</td>
                  <td>${distribucion.numerodoc}</td>
            
                  <td>${distribucion.fecha}</td>
                  <td>${distribucion.hora}</td>
                  <td>${item_empleado.nombre} ${item_empleado.apellido}</td>
                  
                  <td>${itemrubro.rubro}</td>
                
                  <td>
                      <div class="d-flex gap-3">
                          ${estado_distribucion}
                      </div>
                  </td>
                  <td>
                      <div class="d-flex gap-3">
                          ${ver_detalle[privilegios[0]]} 
                      </div>
                      
                  </td>
                  <td>
                      <div class="d-flex gap-3">
                         
                          ${eliminar[privilegios[3]]}
                          ${pdf[privilegios[2]]}    
                          
                      </div>

                      
                  </td>
              </tr>  
      `;
  })
  table.innerHTML = view;

  const enlaces = document.querySelectorAll(`.btn${codigo}`);
  enlaces.forEach(enlace => {
      enlace.addEventListener("click", menu);
  });
}

function alertas(data) {
  console.log(data);
  // Definir las variables al principio
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "success") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 1500;

    // Resetear el formulario si existe
    let formulario = document.querySelector(`#formulario${codigo}`);
    if (formulario) {
      formulario.reset();
    }

    sitio();
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

  // Obtener el div de alerta
  let divalert = document.querySelector(`#alerta${codigos.codigoPrincipal}`);
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
