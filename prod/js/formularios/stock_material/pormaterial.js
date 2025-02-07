import * as listarFunctions from "../funciones/listar.js";
import * as modales from "../funciones/modales/modal_registrar.js";
import { URL_APIE } from "../../../../lib/services.js";
import { codigos } from "./constantes.js";
import * as fuG from "../funciones/generales.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "stock_material";
let Listastockmaterial;
let Lista_Material;
let Lista_Medida;
let Lista_proveedor;
let Lista_seccion;
let Lista_compras;
let Lista_envases;
let list_rubro = [];
let list_tipoM = [];
let code;
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export async function stock_por_material(code_, permisos, refrescar) {
    code = code_;
    app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
    document.querySelector(`button[id^="refrescar"][id$="${code_}"]`).addEventListener('click', function() {
        stock_material_stock(code, permisos, refrescar);
    });
    await listar();
    sitio();    
    
}
  
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listadoAlmacenMaterial(idEmpresa),
            listarFunctions.listar_material(idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto", idEmpresa),
            listarFunctions.listarProveedor(idEmpresa),
            listarFunctions.listarseccion(idEmpresa),
            listarFunctions.listar_api_general_verd("listar_compras", idEmpresa),
            listarFunctions.listar_api_general("listaenvases", idEmpresa),
            listarFunctions.listar_api_general("listar_rubro", idEmpresa),
            listarFunctions.listar_api_general("listar_tipo_material", idEmpresa),


        ]);

        // Asignamos los resultados a las variables correspondientes
        Listastockmaterial = resultados[0];
        Lista_Material = resultados[1];
        Lista_Medida = resultados[2];
        Lista_proveedor = resultados[3];
        Lista_seccion = resultados[4];
        Lista_compras = resultados[5];
        Lista_envases = resultados[6];
        list_rubro = resultados[7];
        list_tipoM = resultados[8];

        console.log(Listastockmaterial);
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}



const sitio = () => {
                let view=`
    <div class="container ">
       
        <h1 class="text-center mb-4 fw-bold fs-6 ">Stock materia Prima</h1>
                    
        
       <div class="col-md-12 mt-3 d-flex justify-content-between">
                  
            <div class="col-md-6">
                <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
            </div>
                  
            <button type="submit" data-id="descargar_pdf" class="btn btn-success" id="pdf${codigo}"> <i class="bi bi-filetype-pdf"></i> Reporte</button>
        </div>
        
        <div  style = "max-height: 500px; overflow-y: auto; display: block;" class = "mt-4" id="rep${codigo}">

            

            <table class="table table-bordered table-striped" id = "editableTable${codigo}">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Codigo</th>
                        <th>Material</th>
                        <th>N° Empaques</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody id="Listar_stock_material${codigo}"></tbody>
            </table>
        </div>
    </div>
    `;
    app.innerHTML=view;
    Listar_stock_material(Listastockmaterial);


    const input = document.getElementById(`filtro${codigo}`);
    input.addEventListener("keyup", (e) => filtrar_table(e, input));
    
    
    const descargar = document.querySelector(`#pdf${codigo}`);
    descargar.addEventListener("click", descargar_pdf);
    
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
                        <h1 class="text-center fw-bold fs-6 ">Stock materia Prima</h1>
                        <h5 class="text-center mb-4 fw-normal text-muted fs-6">${subtituloreporte()}</h5>

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
                  text: `<i class="bi bi-filetype-pdf"></i> PDF`,
                  class: "btn btn-outline-danger mr-1 mt-4",
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

function subtituloreporte(){
    
    return fuG.dateTime_actual();
   
}
function generarNombreArchivo() {
    const prefijo = 'Stock_Mat-Ins';
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
  

function procesarLista(datos) {
    const materialesMap = {};

    datos.forEach((item) => {
        const materialId = item.material_idmaterial;

        if (!materialesMap[materialId]) {
            // Si no existe en el mapa, lo añadimos
            materialesMap[materialId] = { ...item }; // Copiar todo el objeto
        } else {
            // Si ya existe, sumamos las cantidades
            materialesMap[materialId].cantidad += item.cantidad;
            materialesMap[materialId].cantidad_envases += item.cantidad_envases;
        }
    });

    // Convertimos el mapa de vuelta a un array
    return Object.values(materialesMap);
}



function Listar_stock_material(Listastockmaterial){
    const aset = document.getElementById(`Listar_stock_material${codigo}`);
    let view = "", ind = 1;
    let filtrados_pormaterial = procesarLista(Listastockmaterial);
    filtrados_pormaterial.map(lista => {
        
        let medida = Lista_Medida.find(obj => Number(obj.id) === Number(lista.medida_idmedida));
        let compra = Lista_compras.find(obj => Number(obj.idcompra) === Number(lista.compra_idcompra));
        let proveedor = Lista_proveedor.find(obj => Number(obj.id) === Number(lista.proveedor_idproveedor));
        let estadoCaducidad = estaCaducado(lista.fecha_caducidad);
        let item_envase = Lista_envases.find(obj => Number(obj.id) === Number(lista.tipo_envase_idtipo_envase)) || {'nombre': '-'};

        let caducado = '';

        if (estadoCaducidad === 0) {
            caducado = `<i class="bi bi-circle-fill" style="color:red"></i>`; // Rojo: Producto caducado
        } else if (estadoCaducidad === 1) {
            caducado = `<i class="bi bi-circle-fill" style="color:yellow"></i>`; // Amarillo: Faltan menos de 30 días
        } else if (estadoCaducidad === 2) {
            caducado = `<i class="bi bi-circle-fill" style="color:green"></i>`; // Verde: Faltan más de 30 días
        }

        view += `
      
            <tr>
                <td >${ind++}</td> 
                <td >${lista.codigo_mat}</td> 
                <td >${lista.nombre_mat}</td> 
                <td >${lista.cantidad_envases}</td> 
                <td >${lista.cantidad} ${medida.nombre}</td> 
    
            </tr>
        `;
    })
    aset.innerHTML = view;
}
function estaCaducado(fechaCaducidad) {
    const now = new Date(); // Fecha actual
    const fechaCaducidadProducto = new Date(fechaCaducidad); // Convertir fecha de caducidad a objeto Date
    
    // Cálculo de la diferencia en milisegundos
    const diferenciaTiempo = fechaCaducidadProducto - now;
    
    // Convertir la diferencia de tiempo a días (1 día = 1000ms * 60s * 60min * 24h)
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) {
        return 0; // Producto caducado
    } else if (diferenciaDias <= 30) {
        return 1; // Faltan menos de 30 días para que caduque
    } else {
        return 2; // Faltan más de 30 días para que caduque
    }
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
