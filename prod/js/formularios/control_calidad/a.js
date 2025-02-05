
import { URL_APIE } from "../../../../lib/services.js"; 
import * as listarFunctions from "../funciones/listar.js";
import * as registrarFuntions from "../funciones/registrar.js";
import { convertirPdf } from "./descargar_pdf.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let privilegios;
let listas ;
let id;
let codigo;
//const codigo = Array.from({ length: 5 }, () => rand()).join("") + "pdf_control_calidad";




function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}


export function control_calidad_pdf(codigor,lista,previle,ids) {
    id = id;
    codigo = codigor;
    app=document.querySelector(`#contenido${codigor}`);
    listas = lista;
    privilegios = previle;
    console.log(listas);
    sitio();    
    
}
function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, ids] = dataid.split(',');
     console.log(funcion,id1);
 
    switch (funcion) {
        
        case "descargar_pdf":
            descargar_pdf();
            break;
        default:
            sitio();
            break;
    }
}

function generarNombreArchivo() {
    const prefijo = 'Control_Calidad';
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

    const controCalidad = `${prefijo}-${currentDate}-${currentTime}`;

    return controCalidad;
}
function descargar_pdf() {
   
    convertirPdf("pagepdf");
   
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

function sitio(){
    let view=`
       <div class="container mt-4" id="pagepdf">
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
            <div id="informe">
                <div class="container ">
                    <h1 class="text-center mb-4 fw-bold fs-6 ">INFORME DE CONTROL DE CALIDAD</h1>
                    
                        <div class="row">
                            <div class="row">
                                <div class="col-md-6">
                                    <label for="razonSocial" class="form-label mb-4 fw-bold fs-6">Razón Social:</label>
                                    <label for="razonSocial" class="form-label mb-4 fw-bold fs-6"> CIACNEN</label>
                                    
                                </div>
                                <div class="col-md-6">
                                    <label for="responsable" class="form-label  mb-4 fw-bold fs-6">Responsable:</label>
                                    <label for="responsable" class="form-label  mb-4 fw-bold fs-6">APCA. - MADIDI - APOLO</label>

                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <label for="numero" class="form-label mb-4 fw-bold fs-6">No.:</label>
                                    <label for="numero" class="form-label mb-4 fw-bold fs-6">021 / 21</label>

                                </div>
                                <div class="col-md-4">
                                    <label for="fecha" class="form-label mb-4 fw-bold fs-6">Fecha:</label>
                                    <label for="fecha" class="form-label mb-4 fw-bold fs-6">2021-07-14</label>

                                </div>
                                <div class="col-md-4">
                                    <label for="hora" class="form-label mb-4 fw-bold fs-6">Hora:</label>
                                    <label for="hora" class="form-label mb-4 fw-bold fs-6">18:30</label>
                                </div>
                            </div>
                        
                        
                        </div>
                        
                        
                        <div class="col">
                            <label for="" class="form-label mb-4 fw-bold fs-6">Evaluación Características:</label>
                            <label for="" class="form-label mb-4 fw-bold ">8 = excelente / 7 = muy bueno / 6 = bueno / 5 = normal / 4 = malo / 3 = muy malo / 2 = horrrible</label>

                        </div>
                        <div class="col">
                            <label for="" class="form-label mb-4 fw-bold fs-6">Material</label>
                            

                        </div>
                         <div class="row">
                            <div class="col-md-6">
                                <div class="p-3 bg-light border rounded">
                                    <div class="row" style="margin-bottom: 15px; background-color: #f8f9fa; ">
                                        <div class="col-4 font-weight-bold mb-4 fw-bold fs-6" style="padding: 10px;">Características</div>
                                        <div class="col-4 font-weight-bold mb-4 fw-bold fs-6" style="padding: 10px;">Puntaje</div>
                                        <div class="col-4 font-weight-bold mb-4 fw-bold fs-6" style="padding: 10px;">Detalle</div>
                                    </div>
                                    <div id="llenar">
                                        <div class="row" style="margin-bottom: 15px; background-color: #ffffff; ">
                                            <div class="col-4" style="padding: 10px;">Fragancia/Aroma</div>
                                            <div class="col-4" style="padding: 10px;">6.2</div>
                                            <div class="col-4" style="padding: 10px;">Limpia</div>
                                        </div>
                                        <div class="row" style="margin-bottom: 15px; background-color: #ffffff; ">
                                            <div class="col-4" style="padding: 10px;">Sabor</div>
                                            <div class="col-4" style="padding: 10px;">6.2</div>
                                            <div class="col-4" style="padding: 10px;">Salado</div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <label for="" class="form-label mb-4 fw-bold fs-6">Calificacion.:</label>
                                        <label for="" class="form-label mb-4 fw-bold fs-6">70</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                
                                <div class="p-3 bg-light border rounded" id="">
                                    <div class="row" style="margin-bottom: 15px; background-color: #f8f9fa; ">
                                        <div class="col-6 font-weight-bold mb-4 fw-bold fs-6" style="padding: 10px;">Evaluacion fisica</div>
                                        <div class="col-6 font-weight-bold mb-4 fw-bold fs-6" style="padding: 10px;">Valor</div>
                                    </div>

                                    <div class="row" style="margin-bottom: 15px; background-color: #ffffff; ">
                                        <div class="col-6" style="padding: 10px;">Humedad</div>
                                        <div class="col-6" style="padding: 10px;">10,4 %</div>
                                    </div>
                                    
                                </div>
                                
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="observaciones" class="form-label">Observaciones:</label>
                            <textarea class="form-control" id="observaciones" rows="3"></textarea>
                        </div>
                        
                        <button type="submit" data-id="descargar_pdf" class="btn btn-danger" id="pdf${codigo}"> <i class="bi bi-filetype-pdf"></i> Descargar pdf</button>
                   
                </div>
            </div>
        </div>
    `;
    app.innerHTML=view;
    const enlaces = document.querySelectorAll(`#pdf${codigo}`);
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", descargar_pdf);
    });
}



















