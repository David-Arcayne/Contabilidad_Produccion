
import { URL_APIE } from "../../../../lib/services.js"; 
import { URL_APIP } from "../../../../lib/services.js";
import * as listarFunctions from "../funciones/listar.js";
import * as registrarFuntions from "../funciones/registrar.js";
import { convertirPdf } from "./descargar_pdf.js";
import { preparar_listas_vista_previa,listas_enviadas } from "../funciones/obtener.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let privilegios;
let listas ;
let id;
let codigo;
let lista_carac_eval;
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "pdf_control_calidad";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}


export async function control_calidad_pdf(codigo_,previlegios_,id_) {
    id = id_;
    codigo = codigo_;
    app=document.querySelector(`#contenido${codigo_}`);
    privilegios = previlegios_;
    //lista_carac_eval = await listarFunctions.listar_evaluacion_caracteristicas_de_ctc(id_);
    lista_carac_eval = await listarFunctions.listadoOjitoControlCalidad(id);

    await obtenerListas();
    sitio();    
    
}
async function obtenerListas() {
    try {
        await preparar_listas_vista_previa(); 
        console.log(listas_enviadas);
        listas = listas_enviadas;
    } catch (error) {
        console.error('Error al obtener las listas:', error);
    }
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
async function listarprincipal(){
    
    
     
        
        

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
    console.log(id);
    console.log(listas_enviadas.Calidad);
    let calidad = listas_enviadas.Calidad.find(obj => obj.id === id);
    let itemEmp = listas_enviadas.Emp.find(obj => obj.id === calidad.empleado);
  
    // let agrupadoPorCriterio = lista_carac_eval.reduce((acumulador, item) => {
    //     let criterio = item.criterio_control_calidad_idcriterio_control_calidad;
    //     if (!acumulador[criterio]) {
    //         acumulador[criterio] = [];
    //     }
    //     acumulador[criterio].push(item);
    //     return acumulador;
    // }, {});
    // console.log(agrupadoPorCriterio);
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
                <div class="container" id="">
                    <h1 class="text-center mb-4 fw-bold fs-6 ">INFORME DE CONTROL DE CALIDAD</h1>
                    
                        <div class="row">
                            <div class="row">
                                <div class="col-md-6">
                                    <label for="razonSocial" class="form-label mb-1 fw-bold fs-6">Razón Social:</label>
                                    <label for="razonSocial" class="form-label mb-1 fw-bold fs-6">${empresa.nombre} </label>
                                </div>
                                <div class="col-md-6">
                                    <label for="responsable" class="form-label mb-1 fw-bold fs-6">Responsable:</label>
                                    <label for="responsable" class="form-label mb-1 fw-bold fs-6">${itemEmp.nombre} ${itemEmp.apellido}</label>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-4">
                                    <label for="numero" class="form-label mb-1 fw-bold fs-6">No.:</label>
                                    <label for="numero" class="form-label mb-1 fw-bold fs-6">${calidad.num_docu}</label>
                                </div>
                                <div class="col-md-4">
                                    <label for="fecha" class="form-label mb-1 fw-bold fs-6">Fecha:</label>
                                    <label for="fecha" class="form-label mb-1 fw-bold fs-6">${calidad.fecha}</label>
                                </div>
                                <div class="col-md-4">
                                    <label for="hora" class="form-label mb-1 fw-bold fs-6">Hora:</label>
                                    <label for="hora" class="form-label mb-1 fw-bold fs-6">${calidad.hora}</label>
                                </div>
                            </div>
                        </div>
                        
                        <div  id="Control_calidad_datos_api_general${codigo}">
                            <div  id="Control_calidad_datos_api_especifico${codigo}">
                                
                                
                    
                            </div>
                        </div>
                         

                        
                        <button type="submit" data-id="descargar_pdf" class="btn btn-danger" id="pdf${codigo}"> <i class="bi bi-filetype-pdf"></i> Descargar pdf</button>
                   
                </div>
            </div>
        </div>
    `;
    app.innerHTML=view;
    litar_caracteristicas();

    const enlaces = document.querySelectorAll(`#pdf${codigo}`);
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", descargar_pdf);
    });
}
async function litar_caracteristicas(){
    console.log(lista_carac_eval);
    lista_carac_eval.forEach((firstLevel) => {
       // console.log(firstLevel);
         listarMateriales(firstLevel);
        if (Array.isArray(firstLevel)) {
            firstLevel.forEach((secondLevel) => {
                if (Array.isArray(secondLevel)) {
                    secondLevel.forEach((item) => {
                       // console.log(item);
                    });
                }
            });
        } else {
            console.error("firstLevel no es un array:", firstLevel);
        }
    });
    
    
}
function listarMateriales(datos) {
    //console.log(codigo);
    const contenedorGeneral = document.getElementById(`Control_calidad_datos_api_general${codigo}`); 
   // console.log(contenedorGeneral);
    console.log(datos);
    datos.forEach((lista, index) => {

        console.log("========listas======")
        console.log(lista);
        console.log(listas.Criterio);
        let itemcriterio = listas.Criterio.find(obj => obj.idcriterio_control_calidad === lista[0].criterio_control_calidad_idcriterio_control_calidad);
        console.log(itemcriterio);
        // Crear la estructura HTML para cada material
        const cod = Array.from({ length: 5 }, () => rand()).join("") + index; 

        const html = `
        <div id="Control_calidad_datos_api_especifico${cod}">
            <div class="col">
                <label for="" class="form-label mb-4 fw-bold fs-6">${lista[0].nombre_mat}</label>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="p-3 border rounded">
                        <table class="table table-bordered">
                            <thead class="thead-light">
                                <tr>
                                    <th scope="col">Características evaluación</th>
                                    <th scope="col">Evaluación</th>
                                    <th scope="col">Detalle</th>
                                </tr>
                            </thead>
                            <tbody id="listar_caracteristicas${cod}">
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="p-3 border rounded">
                        <table class="table table-bordered">
                            <thead class="thead-light">
                                <tr>
                                    <th scope="col">Característica muestra</th>
                                    <th scope="col">Dato</th>
                                </tr>
                            </thead>
                            <tbody id="listar_caracteristicas_fisicas${cod}">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
             <table class="table table-bordered">
                <tbody>
                    <tr>
                        <td><label for="calificacion">Calificación</label></td>
                        <td>
                            ${itemcriterio.calificacion}
                        </td>
                        <td><label for="observaciones">Observaciones</label></td>
                        <td>
                            ${itemcriterio.observaciones}

                        </td>
                    </tr>
                    <tr>
                        <td><label for="peso_neto">Peso Neto</label></td>
                        <td>
                            ${itemcriterio.peso_neto}
                        </td>
                        <td><label for="peso_envase">Peso Envase</label></td>
                        <td>
                              ${itemcriterio.peso_envase}
                        </td>
                    </tr>
                    <tr>
                        <td><label for="peso_bruto">Peso Bruto</label></td>
                        <td>
                            ${itemcriterio.peso_bruto}
                        </td>
                        <td><label for="cantidad">Cantidad</label></td>
                        <td>
                            ${itemcriterio.cantidad}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <div class="form-check">
                                
                                <label class="form-check-label" for="radioAlmacen">Destino: ${itemcriterio.destino}</label>
                            </div>
                        </td>
                        
                    </tr>
                </tbody>
            </table>

        </div>
        `;

        // Agregar el HTML generado al contenedor general
        contenedorGeneral.insertAdjacentHTML('beforeend', html);

        // Llenar las listas de características
        llenarCaracteristicas(lista, `listar_caracteristicas${cod}`);
        llenarCaracteristicasFisicas(lista, `listar_caracteristicas_fisicas${cod}`);
        
    });
    
}
function llenarCaracteristicas(evaluaciones, idTabla) {
    const tabla = document.getElementById(idTabla);
    console.log(listas);
   
    evaluaciones.forEach((evaluacion) => {
        if(evaluacion.tipo === 0){
            let itemcaracteristica = listas.Caracteristica.find(obj=> obj.idcaracteristicas === evaluacion.caracteristicas_idcaracteristicas );

            const fila = `
                <tr>
                    <td>${itemcaracteristica.caracteristica}</td>
                    <td>${evaluacion.evaluacion}</td>
                    <td>${evaluacion.detalle}</td>
                </tr>
            `;
            tabla.insertAdjacentHTML('beforeend', fila);
        }
        
    });
}
function llenarCaracteristicasFisicas(caracteristicasFisicas, idTablaFisicas) {
    const tablaFisicas = document.getElementById(idTablaFisicas);
    //console.log(caracteristicasFisicas);
    caracteristicasFisicas.forEach((caracteristica) => {
        if(caracteristica.tipo === 1){
            let itemcaracteristica = listas.Caracteristica.find(obj=> obj.idcaracteristicas === caracteristica.caracteristicas_idcaracteristicas );
            const filaFisica = `
                <tr>
                    <td>${itemcaracteristica.caracteristica}</td>
                    <td>${caracteristica.evaluacion}</td>
                </tr>
            `;
            tablaFisicas.insertAdjacentHTML('beforeend', filaFisica);
        }
        
    });
}
let e = [
    [
        [
            {
                "idevaluacion_caracteristica": 179,
                "evaluacion": 5,
                "detalle": "buen aroma",
                "caracteristicas_idcaracteristicas": 3,
                "criterio_control_calidad_idcriterio_control_calidad": 65,
                "tipo": 0,
                "nombre_mat": "Aceite",
                "iddetalle_control_calidad": 24
            },
            {
                "idevaluacion_caracteristica": 180,
                "evaluacion": 7,
                "detalle": "tiene un buen aspecto",
                "caracteristicas_idcaracteristicas": 4,
                "criterio_control_calidad_idcriterio_control_calidad": 65,
                "tipo": 0,
                "nombre_mat": "Aceite",
                "iddetalle_control_calidad": 24
            },
            {
                "idevaluacion_caracteristica": 181,
                "evaluacion": 0,
                "detalle": "tiene un buen color",
                "caracteristicas_idcaracteristicas": 1,
                "criterio_control_calidad_idcriterio_control_calidad": 65,
                "tipo": 1,
                "nombre_mat": "Aceite",
                "iddetalle_control_calidad": 24
            }
        ]
    ],
    [
        [
            {
                "idevaluacion_caracteristica": 190,
                "evaluacion": 5,
                "detalle": "buen aroma",
                "caracteristicas_idcaracteristicas": 3,
                "criterio_control_calidad_idcriterio_control_calidad": 69,
                "tipo": 0,
                "nombre_mat": "Comino",
                "iddetalle_control_calidad": 25
            },
            {
                "idevaluacion_caracteristica": 191,
                "evaluacion": 7,
                "detalle": "tiene un buen aspecto",
                "caracteristicas_idcaracteristicas": 4,
                "criterio_control_calidad_idcriterio_control_calidad": 69,
                "tipo": 0,
                "nombre_mat": "Comino",
                "iddetalle_control_calidad": 25
            },
            {
                "idevaluacion_caracteristica": 192,
                "evaluacion": 0,
                "detalle": "tiene un buen color",
                "caracteristicas_idcaracteristicas": 1,
                "criterio_control_calidad_idcriterio_control_calidad": 69,
                "tipo": 1,
                "nombre_mat": "Comino",
                "iddetalle_control_calidad": 25
            }
        ]
    ],
    [
        [
            {
                "idevaluacion_caracteristica": 193,
                "evaluacion": 5,
                "detalle": "buen aroma",
                "caracteristicas_idcaracteristicas": 3,
                "criterio_control_calidad_idcriterio_control_calidad": 70,
                "tipo": 0,
                "nombre_mat": "Agua",
                "iddetalle_control_calidad": 26
            },
            {
                "idevaluacion_caracteristica": 194,
                "evaluacion": 7,
                "detalle": "tiene un buen aspecto",
                "caracteristicas_idcaracteristicas": 4,
                "criterio_control_calidad_idcriterio_control_calidad": 70,
                "tipo": 0,
                "nombre_mat": "Agua",
                "iddetalle_control_calidad": 26
            },
            {
                "idevaluacion_caracteristica": 195,
                "evaluacion": 0,
                "detalle": "tiene un buen color",
                "caracteristicas_idcaracteristicas": 1,
                "criterio_control_calidad_idcriterio_control_calidad": 70,
                "tipo": 1,
                "nombre_mat": "Agua",
                "iddetalle_control_calidad": 26
            }
        ],
        [
            {
                "idevaluacion_caracteristica": 196,
                "evaluacion": 5,
                "detalle": "buen aroma",
                "caracteristicas_idcaracteristicas": 3,
                "criterio_control_calidad_idcriterio_control_calidad": 71,
                "tipo": 0,
                "nombre_mat": "Agua",
                "iddetalle_control_calidad": 26
            },
            {
                "idevaluacion_caracteristica": 197,
                "evaluacion": 7,
                "detalle": "tiene un buen aspecto",
                "caracteristicas_idcaracteristicas": 4,
                "criterio_control_calidad_idcriterio_control_calidad": 71,
                "tipo": 0,
                "nombre_mat": "Agua",
                "iddetalle_control_calidad": 26
            },
            {
                "idevaluacion_caracteristica": 198,
                "evaluacion": 0,
                "detalle": "tiene un buen color",
                "caracteristicas_idcaracteristicas": 1,
                "criterio_control_calidad_idcriterio_control_calidad": 71,
                "tipo": 1,
                "nombre_mat": "Agua",
                "iddetalle_control_calidad": 26
            }
        ]
    ]
]