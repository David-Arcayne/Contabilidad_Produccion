import * as listarFunctions from "../funciones/listar.js";
import * as modales from "../funciones/modales/modal_registrar.js";
import { URL_APIE } from "../../../../lib/services.js";
import { codigos } from "./constantes.js";


let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let Lista_stock_productos = [];
let Lista_Medidas = [];
let Lista_lote_produccion = [];
let Listas_Control_calidad = [];
let code ;
const codigo = Array.from({ length: 5 }, () => rand()).join("") + "stock_producto";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
///listadoAlmacenProducto
export function devoluciones_produccion(code_, permisos, refrescar) {
    code = code_;
    app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
     
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_api_general_verd('listado_devolucion_produccion',idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto", idEmpresa),
            listarFunctions.listar_api_general_verd("listadoProduccionLote",idEmpresa),//
            listarFunctions.listar_api_general_verd('listadoControlCalidad',idEmpresa),//0
            
            

        ]);
        Lista_stock_productos = resultados[0];
        Lista_Medidas = resultados[1];
        Lista_lote_produccion = resultados[2];
        Listas_Control_calidad = resultados[3];


        // Asignamos los resultados a las variables correspondientes
        console.log(Lista_stock_productos,Lista_Medidas,Listas_Control_calidad);
       
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}






async function sitio(){
    await listar();
    
    let view=`
    <div class="container ">
        <h1 class="text-center mb-4 fw-bold fs-6 ">Devolución Productos</h1>
        <div class="row">
            
            <div class="col-md-12"> 
                
                
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">Fecha Desde</label>
                        <input type="date" class="form-control" id="fechaIni${codigo}"/>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Fecha Hasta</label>
                        <input type="date" class="form-control" id="fechaFin${codigo}"/>
                    </div> 
                    <div class="col-4">
                        <br> <br>
                        <button type="button" class="btn btn-primary col-md-2" id="filtrarBusqueda${codigo}"><i class="bi bi-search"></i></button>
                        <button type="button" class="btn btn-primary col-md-2" id="cancelarfiltro${codigo}"><i class="bi bi-x-circle"></i></button>
                        <br> <br>
                    </div>
                </div>
                
            </div>
        </div>
        <div class="col-md-12 mt-3 d-flex justify-content-between">
                  
            <div class="col-md-6">
                <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
            </div>
                  
            <button type="submit" data-id="descargar_pdf" class="btn btn-danger" id="pdf${codigo}"> <i class="bi bi-filetype-pdf"></i> Descargar pdf</button>
        </div>
        <div  style = "max-height: 500px; overflow-y: auto; display: block;" class = "mt-4" id="rep${codigo}">
            <table class="table table-striped table-bordered" id = "editableTable${codigo}">
                <thead class="table-dark">
                    <tr>
                        <th>N°</th>
                        <th>Codigo</th>
                        <th>Producto</th>
                        <th>Lote</th>
                        <th>Fecha</th>
                        <th>Rubro</th>
                        <th>Cantidad</th>
                        <th>Medida</th>
                        <th>Costo Unitario</th>
                    </tr>
                </thead>
                <tbody id="Listar_stock_producto${codigo}">
                    
                </tbody>
            </table>
        </div>
    </div>
    `;
    app.innerHTML=view;
    Listar_stock_producto(Lista_stock_productos);

    const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup", (e) => filtrar_table(e, input));

    const descargar = document.querySelector(`#pdf${codigo}`);
    descargar.addEventListener("click", descargar_pdf);




    const buscar = document.getElementById(`filtrarBusqueda${codigo}`);
    buscar.addEventListener('click',()=>{
        const fechaInicio = document.getElementById(`fechaIni${codigo}`).value; // Fecha inicial
        const fechaFin = document.getElementById(`fechaFin${codigo}`).value;    // Fecha final

        // Filtrar la lista
        const productosFiltrados = Lista_stock_productos.filter(obj => {
            return Listas_Control_calidad.some(ctr => {
                if (Number(ctr.Entidad_id) === Number(obj.lote_idlote)) {
                    const fecha = new Date(ctr.fecha_cc); // Usar 'obj' en lugar de 'material'
                    return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
                }
                return false; // Retornar explícitamente false si no cumple la condición
            });
        });
        
        Listar_stock_producto(productosFiltrados);
    });
    const cancelar = document.getElementById(`cancelarfiltro${codigo}`);
    cancelar.addEventListener('click', ()=>{
        Listar_stock_producto(Lista_stock_productos);

    })
  
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
function descargar_pdf() {
  const table = document.getElementById(`rep${codigo}`).innerHTML;
  modales.crearModalSoS({
          code: code,
          type:false,
          x:'1200px',
          y:'800px',
          id: `modal_stockmaterial${codigo}`,
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
                    <div class="container">
                        <h1 class="text-center mb-4 fw-bold fs-6 ">Devolución Productos</h1>

                        ${table}
                    </div>
                    
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
    const prefijo = 'Stock_Productos';
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
function Listar_stock_producto(Lista_stock_productos){
    const aset = document.getElementById(`Listar_stock_producto${codigo}`);
    let view = "", ind = 1;
    let p = {
        "idalmacen_producto": 2,
        //"cantidad": 12,
        //"costo_unitario": 1,
        "empresa_idempresa": 50,
       // "lote_idlote": 1,
        "control_calidad_idcontrol_calidad": 8,
        "producto_idproducto": 249,
        //"producto": "Cafe HI",
        //"codigo": 280712412,
        "unidad_id_unidad": 12,
       // "medida": "L",
        "rubro_idrubro": 5,
        "rubro": "cafes"
    }
    Lista_stock_productos.map(lista => {
        let item_ctr_calidad = Listas_Control_calidad.find(obj => Number(obj.Entidad_id) === Number(lista.lote_idlote) );
        let item_lote = Lista_lote_produccion.find(obj => Number(obj.idlote) === Number(lista.lote_idlote));
        

        view += `
      
            <tr>
                <td >${ind++}</td> 
                <td >${lista.codigo}</td> 
                <td >${lista.producto}</td> 
                <td >${item_lote.lote}</td>
                <td >${item_ctr_calidad.fecha_cc}</td> 
                <td >${lista.rubro}</td> 
                <td >${lista.cantidad}</td> 
                <td >${lista.medida} </td> 
                <td >${lista.costo_unitario}</td> 
               
            </tr>
        `;
    })
    aset.innerHTML = view;
    
    
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