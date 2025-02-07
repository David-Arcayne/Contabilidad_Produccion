import { URL_APIP } from "../../../../lib/services.js";
import { URL_APIE } from "../../../../lib/services.js";
import * as listarFunctions from "../funciones/listar.js";
import * as modales from "../funciones/modales/modal_registrar.js";
import { codigos } from "./constantes.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let obt_seccion_aux = {
  id: 0,
  nombre_seccion: "",
  codigo_seccion: "",
  ubicacion: "",
};

let List_Material = [];
let list_seccion = [];
let list_rubro = [];
let list_medida = [];
let list_tipoM = [];
let list_Divivas = [];
let Lista_reporte_produccion = [];
let Lista_empleados = [];
let Lista_productos =[];
let Lista_etapas_produccion = [];
let code;
let privilegios;
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "material";

function rand() {
  const indice = Math.floor(Math.random() * 26);
  const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

  return String.fromCharCode(65 + indice) + codigo;
}
export function reporte_produccion(code_, permisos, refrescar) {
  code = code_;
  app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

  sitio();
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_api_general("listar_rubro", idEmpresa),
      listarFunctions.listar_api_general("listarseccion", idEmpresa),
      listarFunctions.listar_api_general("listar_tipo_material", idEmpresa),
      listarFunctions.listar_api_general("listar_unidad_producto", idEmpresa),
      listarFunctions.listar_api_general("listar_material", idEmpresa),
      listarFunctions.listar_api_general("listar_divisas", idEmpresa),
      listarFunctions.listar_api_general_verd("reporte_produccion", idEmpresa),
      listarFunctions.listar_Empleados(idEmpresa),
      listarFunctions.listar_api_general("listar_productos_comercial",idEmpresa),
      listarFunctions.listar_etapas_produccion(idEmpresa),
      
    ]);

    // Asignamos los resultados a  vlasariables correspondientes

    list_rubro = resultados[0];
    list_seccion = resultados[1];
    list_tipoM = resultados[2];
    list_medida = resultados[3];
    List_Material = resultados[4];
    list_Divivas = resultados[5];
    Lista_reporte_produccion =resultados[6];
    Lista_empleados = resultados[7];
    Lista_productos = resultados[8];
    Lista_etapas_produccion = resultados[9];
    console.log(resultados[6]);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
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
  let view = `
        <div class="">
            <h5 class="text-center mb-4 fw-bold fs-6" >Informe Producción</h5>

            <div class="col-md-12 mt-3 d-flex justify-content-between">
                  
                      <div class="col-md-6">
                          <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                      </div>
                  
                  <button type="submit" data-id="descargar_pdf" class="btn btn-danger" id="pdf${codigo}"> <i class="bi bi-filetype-pdf"></i> Descargar pdf</button>
            </div>
            
            <div  id="rep${codigo}"  style = "max-height: 500px; overflow-y: auto; display: block;">
                
                <div id = "reporte_tabla${codigo}" >
                  <table class="table table-hover" id = "editableTable${codigo}">
                      <thead class="table-dark">
                          <tr>
                              <th>N°</th>
                              <th>Empleado</th>
                              <th>Lote</th>
                              <th>Estado</th>
                              <th>Fecha</th>
                              <th>Hora</th>
                              <th>Rubro</th>
                              <th>Costo material</th>
                              <th>Costo mano de obra</th>
                              <th>Funciones</th>
                              
                          </tr>
                      </thead>
                      <tbody id="reporte_produccion${codigo}">
                      </tbody>
                  </table>

                  <div class="d-flex justify-content-end align-items-center mb-3">
                      <label for="total" class="form-label mb-0 me-2 fw-bold">Total Material & Insumo:</label>
                      <p id="total${codigo}" class="mb-0 fs-6 text-end"></p>
                  </div>
                  <div class="d-flex justify-content-end align-items-center mb-3">
                      <label for="total" class="form-label mb-0 me-2 fw-bold">Total Mano Obra:</label>
                      <p id="total_mo${codigo}" class="mb-0 fs-6 text-end"></p>
                  </div>
                </div>
               
            </div>
        </div>
    `;
  await listar();
  
  app.innerHTML = view;
  listar_reporte();
  const descargar = document.querySelector(`#pdf${codigo}`);
  descargar.addEventListener("click", descargar_pdf);
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
      calcularTotal();
      calcularTotal_mo();
      if (rowText.includes(filter)) {
        row.style.display = "";
        
      } else {
        row.style.display = "none";
        
      }
    }
  });
}

function descargar_pdf() {
  const table = document.getElementById(`rep${codigo}`).innerHTML;
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
                    </div>
                    
                    <div class="contact-info" style="text-align: right; flex: 1;">
                        <h6 style="font-size: 18px; font-weight: bold;">${empresa.nit}</h6>
                        <p style="font-size: 14px;">${empresa.telefono} <br>
                        ${empresa.celular} <br>
                        <a href="${empresa.email}">${empresa.email}</a> <br>
                        <a href="${empresa.sitioWeb}">${empresa.sitioWeb}</a></p>
                    </div>
                    ${table}
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
  
}

function generarNombreArchivo() {
  const prefijo = 'Costo_produccion';
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
function calcular_costo(lista){
  let detalle = lista.produccion[0].solicitud_material[0].detalle_solicitud_material;
  let costo = 0;
  detalle.map(lista => {
      costo += Number(lista.costo);
  })
  return costo;
}
function calcular_costo_mano_de_obra(lista){
  let detalle = lista.produccion[0].produccion_etapa;
  let costo = 0;
  detalle.map(lista => {
      costo += Number(lista.costo_mano_obra);
  })
  return costo;
}



function listar_reporte() {
    const tableBody = document.querySelector(`#reporte_produccion${codigo}`);
    let view = "", ind = 1;
    Lista_reporte_produccion.map((lista) => {
      calcular_costo(lista);
      
        let est = {
            0:'En proceso',
            1:'Proceso control calidad',
            2:'finalizado'
        }
        let itemrubro = list_rubro.find((obj) => Number(obj.id) === Number(lista.rubro_idrubro)) || {rubro: "-"};
        let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado)) || {nombre : 'Benjamin_0', apellido: 'Mora_0'};

    
      
        let itemTipo = list_tipoM.find((item) => item.id === lista.tipo);
        let itemMedida = list_medida.find((dat) => dat.id === lista.medida);
       
        let ver_detalle = {
          0: ``,
          1: `
              <div class="text-center">
                  <div class="text-center">
                      <a data-id="detalle_produccion,${lista.idlote}"
                          class="btn btn-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                          id="detalle_compras${codigo}"
                          style="width: 2.5rem; height: 2.5rem;"
                          title="Detalle producción">
                          <i class="bi bi-border-width"></i>
                      </a>
                      <span class="d-block mt-1 small">Detalle Producción</span>
                  </div>
              </div>
              `,
        };

        view += `
                <tr>
                    <td>${ind++}</td>                
                    <td data-type="${lista.idlote}">${item_empleado.nombre} ${item_empleado.apellido}</td>
                    <td data-type="${lista.idlote}">${lista.lote}</td>
                    <td data-type="${lista.idlote}">${est[lista.estado]}</td>
                    <td data-type="${lista.idlote}">${lista.fecha_entrega}</td>
                    <td data-type="${lista.idlote}">${lista.hora_entrega}</td>
                    <td data-type="${lista.idlote}">${itemrubro.rubro}</td>
                    <td data-type="${lista.idlote}" class="subtotal">${calcular_costo(lista)}</td>
                    <td data-type="${lista.idlote}" class="subtotal_mo">${calcular_costo_mano_de_obra(lista)}</td>
                    <td >
                      <div class="d-flex gap-3">
                            ${ver_detalle[privilegios[2]]}
                        </div>
                    </td>
                </tr>
          `;

    
    
    });
    tableBody.innerHTML = view;
    calcularTotal();
    calcularTotal_mo();
    const enlaces = document.querySelectorAll(`.btn${codigo}`);
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });
  
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "detalle_produccion":
      detalle_produccion(id1);
      break;
    default:
      // Manejo para casos no coincidentes
      sitio();
      break;
  }
} 
async function detalle_produccion(idlote) {
    modales.crearModalSoS({
      code: code,
      type:false,
      x:'1200px',
      y:'800px',
      id: `codigo_modal_detalle_produccion${codigos.codigo_modal_detalle_produccion}`,
      header: `  
          
        

      `,
      body: `

          <div class="row" >
                 <div class="col-md-6 mb-3 " id="menu">
                     <nav class="nav nav-pills nav-fill">
                         <li class="nav-item">
                             <button class="nav-link active" data-section="orden_produccion" style="background-color:blue; color:white;">Orden Producción</button>
                         </li>
                         <li class="nav-item">
                             <button class="nav-link" data-section="solicitud_material" style="background-color:white; color:black;">Material-Insumos</button>
                         </li>
                         <li class="nav-item">
                             <button class="nav-link" data-section="etapas_produccion" style="background-color:white; color:black;">Etapas Producción</button>
                         </li>
                          <li class="nav-item">
                             <button class="nav-link" data-section="salida_produccion" style="background-color:white; color:black;">Salida Producción</button>
                         </li>
                         
                     </nav>
                     
                 </div>
          </div>    
                 
                 
          <div id="content-area${codigos.codigo_modal_detalle_produccion}"></div>

      `,
      footerButtons: [
          
          {
              id: `btnCancelar${codigos.codigo_modal_detalle_produccion}`,
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
                  const pdf = document.querySelector(`#content-area${codigos.codigo_modal_detalle_produccion}`);
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

  const navButtons = document.querySelectorAll("#menu .nav-link");
  orden_produccion(idlote);
  navButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      navButtons.forEach((btn) => {
        btn.style.backgroundColor = "white";
        btn.style.color = "black";
      });
      this.style.backgroundColor = "blue";
      this.style.color = "white";
      const section = this.getAttribute("data-section");
      mostrarSeccion(section);
    });
  });

  function mostrarSeccion(section) {
    const contentArea = document.getElementById(`content-area${codigos.codigo_modal_detalle_produccion}`);
    contentArea.innerHTML = "";
    switch (section) {
      case "orden_produccion":
        orden_produccion(idlote);
        break;
      case "solicitud_material":
        solicitud_material(idlote);
        break;
      case "etapas_produccion":
        etapas_produccion(idlote);
        break;
      case "salida_produccion":
        salida_produccion(idlote);
          break;
      case "section_estandares_etapa":
        contentArea.innerHTML = "section_estandares_etapa";
        opcion = 3;
        break;
      default:
        contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
        break;
    }
  }




  function orden_produccion(idlote){
     let contenido = document.querySelector(`#content-area${codigos.codigo_modal_detalle_produccion}`);
     const lote = Lista_reporte_produccion.find(obj => Number(obj.idlote) === Number(idlote));
     const orden_produccion = lote.produccion[0].orden_produccion[0];
     console.log(orden_produccion);
     let itemempleado = Lista_empleados.find(obj => Number(obj.id) === Number(orden_produccion.empleado_idempleado)) || {"nombre": "-","apellido": "-"};
     sitio();
     async function sitio(){
      let view = `
              
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

                <div class="container" id="">
                  <h1 class="text-center mb-4 fw-bold fs-6 ">ORDEN PRODUCCIÓN</h1>
                </div>
                <div class="col">
                      <div class="row">
                          <h6 class="fw-bold text-primary mb-2">Lote: ${lote.lote}</h6>
                      </div> 
                      <div class="row">
                          <p class="col"><strong>Responsable:</strong> ${itemempleado.nombre} ${itemempleado.apellido}</p>
                          <p class="col"><strong>Fecha:</strong> ${orden_produccion.fecha_orp}</p>
                          <p class="col"><strong>Hora:</strong> ${orden_produccion.hora_orp}</p>
                      </div>
                </div>
                  
                <div style = "max-height: 350px; overflow-y: auto; display: block;" class="mt-4">
                      <table class="table table-bordered table-hover table-striped" id = "editableTable${codigos.codigo_orden_produccion}">
                          <thead >
                              <tr class="table-dark">
                                  <th>N°</th>
                                  <th>Codigo</th>
                                  <th>Producto</th>
                                  <th>Cantidad</th>
                                  <th>Medida</th>
                                  <th>observaciones</th>
                                  <th>Costo estimado</th>
                              </tr>
                          </thead>
                          <tbody id="listar_orden_produccion${codigos.codigo_orden_produccion}">
                              
                          </tbody>
                      </table>
                      
                      <div class="d-flex justify-content-end align-items-center mb-3">
                              <label for="total" class="form-label mb-0 me-2 fw-bold">Total:</label>
                              <p id="total${codigos.codigo_orden_produccion}" class="mb-0 fs-6 text-end"></p>
                      </div>
                    
                </div>
              
          `;
          contenido.innerHTML = view;
          await listar_orden_produccion();
         
     }
     
     async function listar_orden_produccion(){
      const tablebody = document.querySelector(`#listar_orden_produccion${codigos.codigo_orden_produccion}`);
      
      let view = "", ind = 1;
      orden_produccion.detalle_produccion.map(lista=>{
          
        // <th>N°</th>
        // <th>Codigo</th>
        // <th>Producto</th>
        // <th>Cantidad</th>
        // <th>Medida</th>
        // <th>observaciones</th>
        // <th>Costo estimado</th>
          let producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(lista.producto_idproducto));
          let medida = list_medida.find(obj => Number(obj.id) === Number(producto.unidad_id_unidad));
  
         
          view += `
              <tr>
                <td>${ind++}</td> 
                <td>${producto.codigo} </td>   
                <td>${producto.nombre} </td>   
                <td>${lista.cantidad}</td>               
                <td>${medida.nombre} </td>
                <td>${lista.observaciones}</td>               
                <td class="subtotal">${lista.costo}</td>    
                
             </tr>
              `;
      })
      tablebody.innerHTML = view;
      await calcularTotal_();
        
     }
     async function calcularTotal_(){
      let total = 0;
    
      // Selecciona todas las celdas de subtotal
      document.querySelectorAll(`#listar_orden_produccion${codigos.codigo_orden_produccion} .subtotal`).forEach(function(subtotalCell) {
        const valor = parseFloat(subtotalCell.textContent) || 0;
        total += valor;
      });
    
      // Actualiza el campo de total
      document.getElementById(`total${codigos.codigo_orden_produccion}`).innerText = total.toFixed(4);
      
    }
     
  }
  function solicitud_material(idlote){
    let contenido = document.querySelector(`#content-area${codigos.codigo_modal_detalle_produccion}`);
    const lote = Lista_reporte_produccion.find(obj => Number(obj.idlote) === Number(idlote));
     const solicitud_material = lote.produccion[0].solicitud_material[0];
     console.log(solicitud_material);
     let itemempleado = Lista_empleados.find(obj => Number(obj.id) === Number(solicitud_material.empleado_idempleado)) || {"nombre": "-","apellido": "-"};
    sitio();
    async function sitio(){
     let view = `
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

                <div class="container" id="">
                  <h1 class="text-center mb-4 fw-bold fs-6 ">SOLICITUD MATERIAL</h1>
                </div>
                <div class="col">
                      <div class="row">
                          <h6 class="fw-bold text-primary mb-2">Lote: ${lote.lote}</h6>
                      </div> 
                      <div class="row">
                          <p class="col"><strong>Responsable:</strong> ${itemempleado.nombre} ${itemempleado.apellido}</p>
                          <p class="col"><strong>Fecha:</strong> ${solicitud_material.fecha}</p>
                          <p class="col"><strong>Hora:</strong> ${solicitud_material.hora}</p>
                      </div>
                </div>
                  
                <div style = "max-height: 350px; overflow-y: auto; display: block;" class="mt-4">
                      <table class="table table-bordered table-hover table-striped" id = "editableTable${codigos.codigo_reporte_solicitud_material}">
                          <thead >
                              <tr class="table-dark">
                                  <th>N°</th>
                                  <th>Codigo</th>
                                  <th>Material-Insumo</th>
                                  <th>Cantidad</th>
                                  <th>Medida</th>
                                  <th>observaciones</th>
                                  <th>Costo Material-Insumos</th>
                              </tr>
                          </thead>
                          <tbody id="listar_solicitud_material${codigos.codigo_reporte_solicitud_material}">
                              
                          </tbody>
                      </table>
                      
                      <div class="d-flex justify-content-end align-items-center mb-3">
                              <label for="total" class="form-label mb-0 me-2 fw-bold">Total:</label>
                              <p id="total${codigos.codigo_reporte_solicitud_material}" class="mb-0 fs-6 text-end"></p>
                      </div>
                </div>
         `;
         contenido.innerHTML = view;
         await listar_solicitud_material();
    }
    async function listar_solicitud_material(params) {
      const tablebody = document.querySelector(`#listar_solicitud_material${codigos.codigo_reporte_solicitud_material}`);


      let view = "", ind = 1;
      solicitud_material.detalle_solicitud_material.map(lista=>{
          
        // <th>N°</th>
        // <th>Codigo</th>
        // <th>Material-Insumo</th>
        // <th>Cantidad</th>
        // <th>Medida</th>
        // <th>observaciones</th>
        // <th>Costo estimado</th>
        console.log(lista);
        console.log(List_Material);
          let material = List_Material.find(obj => Number(obj.id) === Number(lista.material_idmaterial));
          let medida = list_medida.find(obj => Number(obj.id) === Number(material.medida));
          
         
          view += `
              <tr>
                <td>${ind++}</td> 
                <td>${material.codigo} </td>   
                <td>${material.nombre} </td>   
                <td>${lista.cantidad}</td>               
                <td>${medida.nombre} </td>
                <td>${lista.observaciones}</td>               
                <td class="subtotal">${lista.costo}</td>    
                
             </tr>
              `;
      })
      tablebody.innerHTML = view;
      await calcularTotal_();
    }
    async function calcularTotal_(){
      let total = 0;
    
      // Selecciona todas las celdas de subtotal
      document.querySelectorAll(`#listar_solicitud_material${codigos.codigo_reporte_solicitud_material} .subtotal`).forEach(function(subtotalCell) {
        const valor = parseFloat(subtotalCell.textContent) || 0;
        total += valor;
      });
    
      // Actualiza el campo de total
      document.getElementById(`total${codigos.codigo_reporte_solicitud_material}`).innerText = total.toFixed(4);
      
    }
  }
  async function etapas_produccion(idlote){
    let contenido = document.querySelector(`#content-area${codigos.codigo_modal_detalle_produccion}`);
    const lote = Lista_reporte_produccion.find(obj => Number(obj.idlote) === Number(idlote));
     const produccion_etapa = lote.produccion[0].produccion_etapa;
     console.log(produccion_etapa);
     


    sitio();
    async function sitio(){
    let view = `
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

                <div class="container" id="">
                  <h1 class="text-center mb-4 fw-bold fs-6 ">PRODUCCIÓN ETAPAS PRODUCCIÓN</h1>
                </div>
                <div class="col">
                      <div class="row">
                          <h6 class="fw-bold text-primary mb-2">Lote: ${lote.lote}</h6>
                      </div> 
                      
                </div>
                  
                <div style = "max-height: 350px; overflow-y: auto; display: block;" class="mt-4">
                      <table class="table table-bordered table-hover table-striped" id = "editableTable${codigos.codigo_reportes_produccion_etapa}">
                          <thead >
                              <tr class="table-dark">
                                  <th>N°</th>
                                  <th>Etapas Producción</th>
                                  <th>Empleado</th>
                                  <th>Fecha Hora Inicio</th>
                                  <th>Fecha Hora Fin</th>
                                  
                                  <th class="subtotal">Costo Mano de Obra</th>
                              </tr>
                          </thead>
                          <tbody id="listar_etapas_produccion${codigos.codigo_reportes_produccion_etapa}">
                              
                          </tbody>
                      </table>
                      
                      <div class="d-flex justify-content-end align-items-center mb-3">
                              <label for="total" class="form-label mb-0 me-2 fw-bold">Total:</label>
                              <p id="total${codigos.codigo_reportes_produccion_etapa}" class="mb-0 fs-6 text-end"></p>
                      </div>
                </div>
        `;
        contenido.innerHTML = view;
        await listar_etapas_produccion();
    }
    async function listar_etapas_produccion() {
      const tablebody = document.querySelector(`#listar_etapas_produccion${codigos.codigo_reportes_produccion_etapa}`);
      let view = "", ind = 1;
      produccion_etapa.map(lista=>{
        let itemempleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado)) || {"nombre": "-","apellido": "-"};
        console.log(Lista_etapas_produccion);
        let etapa = Lista_etapas_produccion.find(obj => Number(obj.idetapas_produccion) === Number(lista.etapas_produccion_idetapas_produccion));
        // <th>N°</th>
        // <th>Empleado</th>
        // <th>Fecha Hora Inicio</th>
        // <th>Fecha Hora Fin</th>
        
        // <th>Costo Mano de Obra</th>
       
          
         
          view += `
              <tr>
                <td>${ind++}</td> 
                <td>${etapa.nombre_etapa}</td>
                <td>${itemempleado.nombre} ${itemempleado.apellido} </td>   
                <td>${lista.fecha_pe} ${lista.hora_pe} </td>   
                <td>${lista.fecha_fin} ${lista.hora_fin}</td>               
                           
                <td class="subtotal">${lista.costo_mano_obra}</td>    
                
             </tr>
              `;
      })
      tablebody.innerHTML = view;
      await calcularTotal_();
    }
    async function calcularTotal_(){
      let total = 0;
    
      // Selecciona todas las celdas de subtotal
      document.querySelectorAll(`#listar_etapas_produccion${codigos.codigo_reportes_produccion_etapa} .subtotal`).forEach(function(subtotalCell) {
        const valor = parseFloat(subtotalCell.textContent) || 0;
        total += valor;
      });
    
      // Actualiza el campo de total
      document.getElementById(`total${codigos.codigo_reportes_produccion_etapa}`).innerText = total.toFixed(4);
      
    }
  }
  function salida_produccion(idlote){
    
    let contenido = document.querySelector(`#content-area${codigos.codigo_modal_detalle_produccion}`);


    const lote = Lista_reporte_produccion.find(obj => Number(obj.idlote) === Number(idlote));
     const salida_produccion = lote.produccion[0].salida_produccion;
     console.log(salida_produccion);
    
    sitio();
    async function sitio(){
    let view = `
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

                <div class="container" id="">
                  <h1 class="text-center mb-4 fw-bold fs-6 ">SALIDA PRODUCCIÓN</h1>
                </div>
                <div class="col">
                      <div class="row">
                          <h6 class="fw-bold text-primary mb-2">Lote: ${lote.lote}</h6>
                      </div> 
                    
                </div>
                  
                <div style = "max-height: 350px; overflow-y: auto; display: block;" class="mt-4">
                      <table class="table table-bordered table-hover table-striped" id = "editableTable${codigos.codigo_salida_produccion}">
                          <thead >
                              <tr class="table-dark">
                                  <th>N°</th>
                                  <th>Codigo</th>
                                  <th>Producto</th>
                                  <th>Cantidad</th>
                                  <th>Medida</th>
                               
                                  <th>Costo estimado</th>
                              </tr>
                          </thead>
                          <tbody id="listar_salida_produccion${codigos.codigo_salida_produccion}">
                              
                          </tbody>
                      </table>
                      
                      <div class="d-flex justify-content-end align-items-center mb-3">
                              <label for="total" class="form-label mb-0 me-2 fw-bold">Total:</label>
                              <p id="total${codigos.codigo_salida_produccion}" class="mb-0 fs-6 text-end"></p>
                      </div>
                </div>
        `;
        contenido.innerHTML = view;
        await listar_salida_produccion();
    }
    async function listar_salida_produccion() {
      const tablebody = document.querySelector(`#listar_salida_produccion${codigos.codigo_salida_produccion}`);


      let view = "", ind = 1;
      salida_produccion.map(lista=>{
          
        // <th>N°</th>
        // <th>Codigo</th>
        // <th>Producto</th>
        // <th>Cantidad</th>
        // <th>Medida</th>
        // <th>observaciones</th>
        // <th>Costo estimado</th>
          let producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(lista.producto_idproducto));
          let medida = list_medida.find(obj => Number(obj.id) === Number(producto.unidad_id_unidad));
  
         
          view += `
              <tr>
                <td>${ind++}</td> 
                <td>${producto.codigo} </td>   
                <td>${producto.nombre} </td>   
                <td>${lista.cantidad}</td>               
                <td>${medida.nombre} </td>
                          
                <td class="subtotal">${lista.costo}</td>    
                
             </tr>
              `;
      })
      tablebody.innerHTML = view;
      await calcularTotal_();
    }
    async function calcularTotal_(){
      let total = 0;
    
      // Selecciona todas las celdas de subtotal
      document.querySelectorAll(`#listar_salida_produccion${codigos.codigo_salida_produccion} .subtotal`).forEach(function(subtotalCell) {
        const valor = parseFloat(subtotalCell.textContent) || 0;
        total += valor;
      });
    
      // Actualiza el campo de total
      document.getElementById(`total${codigos.codigo_salida_produccion}`).innerText = total.toFixed(4);
      
    }
  }
}
function calcularTotal() {
  let total = 0;
  const filasVisibles = document.querySelectorAll(`#reporte_produccion${codigo} .subtotal`);

  filasVisibles.forEach(function(subtotalCell) {
    const fila = subtotalCell.closest("tr");
    // Verificar si la fila es visible
    if (fila.style.display !== "none") {
      const valor = parseFloat(subtotalCell.textContent) || 0;
      total += valor;
    }
  });

  // Actualiza el campo de total
  document.getElementById(`total${codigo}`).innerText = total.toFixed(4);
}
function calcularTotal_mo() {
  let total = 0;
  const filasVisibles = document.querySelectorAll(`#reporte_produccion${codigo} .subtotal_mo`);

  filasVisibles.forEach(function(subtotalCell) {
    const fila = subtotalCell.closest("tr");
    // Verificar si la fila es visible
    if (fila.style.display !== "none") {
      const valor = parseFloat(subtotalCell.textContent) || 0;
      total += valor;
    }
  });

  // Actualiza el campo de total
  document.getElementById(`total_mo${codigo}`).innerText = total.toFixed(4);
}
