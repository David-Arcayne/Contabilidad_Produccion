import { codigos } from "./constantes.js";
import * as listarFunctions from "../funciones/listar.js";
import * as modales from "../funciones/modales/modal_registrar.js";
import { URL_APIE } from "../../../../lib/services.js";
import * as registerFunctions from "../funciones/registrar.js";
import * as fuG from "../funciones/generales.js"
import { Orden_produccion_solic } from "./orden_produccion.js";
import { detalle_orden_produccion } from "./detalle_orden_produccion.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";

let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigolista_pedido;
let Lista_Orden_Producciones =[];
let Lista_detalle_orden_produccion = [];
let Lista_empleados = [];
let Lista_productos =[];
let Lista_rubro = [];
let Lista_Material = [];
let Lista_medida = [];

let List_Envases =[];
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.listar_api_general_verd("mostrar_orden_produccionPor_empresa",idEmpresa),
            listarFunctions.listar_detalle_produccion(idEmpresa),
            listarFunctions.listar_api_general("listar_rubro", idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
            listarFunctions.listar_api_general("listar_productos_comercial",idEmpresa),

        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_Orden_Producciones = resultados[1];
        Lista_detalle_orden_produccion = resultados[2];
        Lista_rubro = resultados[3];
        Lista_medida = resultados[4];
        Lista_productos = resultados[5]
        console.log(resultados[0],resultados[1],resultados[2],resultados[3],resultados[4],resultados[5]);
        listar_rubro();
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
function listar_rubro() {

  
    const listar2 = document.querySelector(`#rubro_idrubro${codigo}`);
    let view = "";
    Lista_rubro.map((lista) => {
      view += `
                  <option value="${lista.id}">${lista.rubro}</option>
              `;
    });
    listar2.innerHTML = view;

  }

export function ordenes_produccion(code_, permisos_, refrescar_) {
    code = code_;
    permisos = permisos_;
    refrescar =  refrescar_;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

    app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
    
    sitio();
}

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "detalle_productos":
            detalle_orden_produccion(code,permisos,refrescar,id1,Number(document.querySelector(`#rubro_idrubro${codigo}`).value));
            break;
      
        case "descargar_pdfpedido":
            descargar_pdfpedido(id1);
            break;
        case "anular_orden_produccion":
            anular_orden_produccion(id1);
            break;
        default:
            sitio();
            break;
    }

}
function anular_orden_produccion(idorden_produccion){
  const orden_prod = Lista_Orden_Producciones.find(obj => Number(obj.idorden_produccion)=== Number(idorden_produccion));
  let mensaje = {
    "0": 'Se anulara el orden_prod..',
    "1": 'Se anulara el orden_prod..',
    "-1": 'Se activara el orden_prod',
  };
  
      const modal = modales.crearModal({
          code: code,
          id: `modal_finalizar_produccion${codigos.codigo_anular_orden_produccion}`,
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
                              <p style="color: #6c757d;">${mensaje[orden_prod.estado]}</p>
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
                        f_anular_compra(idorden_produccion);
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
  
  async function f_anular_compra(idorden_produccion) {
      const formData = new FormData();
      formData.append('verDavid', 'anularPedido');
      formData.append('idorden_produccion',idorden_produccion);
      for (let [key, value] of formData.entries()) {
          console.log(key, value);
      }
      const data = await registerFunctions.sendformData2(formData)
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
          id: `confirmacion${codigos.codigo_anular_orden_produccion}`,
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

function descargar_pdfpedido(idorden_produccion) {
  const lista_orden_produccion = Lista_Orden_Producciones.find(obj => Number(obj.idorden_produccion) === Number(idorden_produccion));
  
  let itemrubro = Lista_rubro.find((obj) => Number(obj.id) === Number(lista_orden_produccion.rubro_idrubro)) || {id: 0,rubro: "-",detalle: "-",};
  let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista_orden_produccion.empleado_idempleado)) || {nombre : 'Benjamin_0', apellido: 'Mora_0'};
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
                        <h5 class="text fw-bold mb-3">Orden Producción</h5>
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
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Numero Registro:</strong> ${lista_orden_produccion.idorden_produccion}</p>
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Fecha:</strong> ${lista_orden_produccion.fecha_orp}</p>
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Hora:</strong> ${lista_orden_produccion.hora_orp}</p>
                        <p class="mb-0" style = "font-size: calc(1em + 2px);"><strong>Rubro:</strong>${itemrubro.rubro}</p>
                    </div>
                    
                    <div class="mt-4" >
                        <table class="table table-hover" id="editableTable${codigo}">
                            <thead class="table-dark">
                                <tr>
                                    <th scope="col">N°</th>
                                    <th scope="col">Codigo</th>
                                    <th scope="col">Producto</th>
                                    <th scope="col">Cantidad</th>
                                    <th scope="col">Observaciones</th>
                                                    
                                </tr>
                            </thead>
                            <tbody id="lista_orden_produccion${codigo}">
                            
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
      table_listar(idorden_produccion);
       async function table_listar(idorden_produccion){
            const lista_orden_produccion_ = await listarFunctions.mostrar_orden_produccion(idorden_produccion);
            console.log(lista_orden_produccion_);
            const table = document.getElementById(`lista_orden_produccion${codigo}`);

            let view = "",ind = 1;    
            lista_orden_produccion_.detalles.map((lista)=>{
                console.log(lista);
                
                    let itemproducto = Lista_productos.find(obj => obj.id_productos === lista.producto_idproducto) || {
                    "id_productos": 0,
                    "nombre": "-",
                    "codigo": "-",
                    };
                view += `
                    <tr style = "style=width: 50px; height: 50px;">
                        <td>${ind++}</td>                 
                        <td data-type="${lista.producto_idproducto}">${itemproducto.codigo}</td>
                        <td data-type="${lista.producto_idproducto}">${itemproducto.nombre}</td>
                        <td data-type="${lista.producto_idproducto}">${lista.cantidad}</td>
                        <td data-type="${lista.producto_idproducto}">${lista.observaciones}</td>
                            
                    </tr>  
                `;
            });
            table.innerHTML = view;
          
       }
  
}

function generarNombreArchivo() {
  const prefijo = 'Orden_produccion';
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
    <div class="container ">
        <div class="col-md-12 mt-3 d-flex justify-content-between">
          <button type="button" class="btn btn-success" id="nueva_orden_produccion${codigo}" style = "height:30px;">Nueva Orden</button>

          <div class="col-md-3 mb-3 " >
              <div class="row">
                  
                  <select class="form-select" id="rubro_idrubro${codigo}" name="rubro_idrubro">
                      <option value="" disabled selected>Seleccione un rubro</option>
                      
                  </select>
              </div>
          </div>
                   
        </div>
        <div class="row mb-4">
            <div class="col-md-6">
                <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
            </div>
            
        </div>
        <div class="container scrollable-table mt-4">
            <table class="table table-hover" id="editableTable${codigo}">
                <thead class="table-dark">
                    <tr>
                        <th scope="col">N°</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Hora</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Solicitante</th>
                        <th scope="col">Detalle</th>
                        <th scope="col">Funciones</th>
                    </tr>
                </thead>
                <tbody id="listar_ordenes_produccion${codigo}">
                    
                </tbody>
            </table>  
        </div>
    </div>
    `;//cambiaEstadoOrdenProduccion

    app.innerHTML = view;
    await listar();
    table_listar();
    const selectrubro = document.querySelector(`#rubro_idrubro${codigo}`);

    selectrubro.addEventListener("change", function () {
        table_listar();
        
    });

    const btn_compra = document.getElementById(`nueva_orden_produccion${codigo}`);
    btn_compra.addEventListener('click',nueva_orden_produccion);
    const input = document.getElementById(`filtro${codigo}`);
      input.addEventListener("keyup", (e) => filtrar_table(e, input));
}
function nueva_orden_produccion(e){
    e.preventDefault();
    Orden_produccion_solic(code,permisos,refrescar);
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
function table_listar(){
    const table = document.getElementById(`listar_ordenes_produccion${codigo}`);
    const idrubro =document.getElementById(`rubro_idrubro${codigo}`).value;   
     let view = "", ind = 1;
    const filtrados = Lista_Orden_Producciones.filter(obj => Number(obj.rubro_idrubro)=== Number(idrubro));
    const inveritido = fuG.reverseArray(filtrados);
    inveritido.map(lista=>{
        let estado = Number(lista.estado) === 1 ? '<div class="icon-success" style="font-size: 30px; color: #167e1a; width:10px;"><i class="bi bi-check2"></i></div>' : '<div class="icon-danger" style="font-size: 30px; color: #cf0927; width:10px;"><i class="bi bi-question"></i></div>';
        let anulado = Number(lista.estado) === -1 ? `<i class="bi bi-hand-thumbs-down-fill" style="color:red;"></i>`:`<i class="bi bi-hand-thumbs-up-fill" style="color:blue;"></i> `;
        let color = Number(lista.estado) === -1 ? 'danger':'primary';
        //let estado = Number(lista.estado) === 0 ? 'Pendiente':'Aceptado';
        let item_empleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado)) || {nombre : 'Benjamin_0', apellido: 'Mora_0'};



        let  pdf = {
            0: ``,
            1: `
                           
                  <div class="text-center">
                      <a data-id="descargar_pdfpedido,${lista.idorden_produccion}"
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
                    <a  data-id="anular_orden_produccion,${lista.idorden_produccion}"
                    class="btn btn-outline-${color} rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                    style="width: 2.5rem; height: 2.5rem;"
                    title="Anular orden_prod">
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
                    <a data-id="detalle_productos,${lista.idorden_produccion}"
                        class="btn btn-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                        id="registrarMateriales${codigo}"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="Detalle ">
                        <i class="bi bi-border-width"></i>
                    </a>
                    <span class="d-block mt-1 small">Productos</span>
                </div>
                `,
          };





        view += ` 
            <tr>
                    <td>${ind++}</td>                
                    <td data-type="${lista.idorden_produccion}">${fuG.cambiarFormatoFecha(lista.fecha_orp)}</td>
                    <td data-type="${lista.idorden_produccion}">${lista.hora_orp}</td>
                    <td data-type="${lista.idorden_produccion}">${estado}</td>
                    <td data-type="${lista.idorden_produccion}">${item_empleado.nombre} ${item_empleado.apellido}</td>
                    
                    <td>
                        <div class="d-flex gap-3">
                            ${ver_detalle[privilegios[0]]} 
                        </div>
                    </td>
                    <td>
                        <div class="d-flex gap-3">
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
