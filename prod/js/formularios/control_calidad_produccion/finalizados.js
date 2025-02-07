import * as listarFunctions from "../funciones/listar.js"; 
import * as registrarFuntions from "../funciones/registrar.js";
import { listadoEvaluacionCaracteristicas, listadoCriterio } from "../funciones/obtener.js";
import { codigos } from "./constantes.js";
import * as modales from "../funciones/modales/modal_registrar.js";
import { URL_APIP } from "../../../../lib/services.js";
import { URL_APIE } from "../../../../lib/services.js"; 

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let divsPintados = [];
let Listas_compras = [];
let Listas_Control_calidad = [];
let Lista_empleados=[];
let Lista_Material = [];
let Lista_medidas=[];
let List_Envases =[];
let Lista_evaluacion = [];
let Lista_Datos = [];
let Lista_caracteristicas_muestra = [];
let Lista_caracteristicas_evaluacion = [];
let Lista_control_calidad_criterio =[];
let Lista_control_calidad_caracteristicas = [];
let Lista_proveedor = [];

let listas ;
let app = "";
let privilegios;
const codigo = codigos.codigosEncurso;
let code;
let permisos;
let refrescar;
let Lista_lote_produccion = [];
let Lista_salida_produccion = [];
let Lista_productos = [];
export async function control_calidad_produccion_finalizados(code_, permisos_, refrescar_) {
    code = code_;
    permisos = permisos_;
    refrescar = refrescar_;
    privilegios =  [...permisos_.toString()].map(digito => parseInt(digito));
    app=document.querySelector(`#filtrar${codigos.codigosPrincipal}`);
    sitio();    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        const resultados = await Promise.all([
            listarFunctions.listar_api_general_verd('listadoControlCalidad',idEmpresa),//0
            listarFunctions.listar_Empleados(idEmpresa),//1
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),//2
            listarFunctions.listar_api_general_verd('listaCaracteristicas',idEmpresa),//3
            listarFunctions.listar_api_general_verd('listadoCriterio',idEmpresa),//4
            listarFunctions.listar_api_general_verd('listaCaracteristicas',idEmpresa),//5
            listarFunctions.listar_api_general_verd("listadoProduccionLote",idEmpresa),//6
            listarFunctions.listar_api_general_verd("listaSalidaProduccion",idEmpresa),//7
            listarFunctions.listar_api_general("listar_productos_comercial",idEmpresa),//8

        ]);
        Listas_Control_calidad = resultados[0];
        Lista_empleados= resultados[1];
        Lista_medidas = resultados[2];
        Lista_evaluacion = resultados[3].filter(obj => Number(obj.tipo) === 0);
        Lista_Datos= resultados[3].filter(obj => Number(obj.tipo) === 1);
        Lista_control_calidad_criterio = resultados[4];
        Lista_control_calidad_caracteristicas = resultados[5];
       
        Lista_lote_produccion = resultados[6];
        Lista_salida_produccion = resultados[7];
        Lista_productos = resultados[8];
       
    } catch (error) {1
        console.error("Error al listar datos: ", error);
        throw error; 
    }
}





function menuec(event){

    if (divsPintados.length > 0) {
        divsPintados.forEach(div => {
            div.style.backgroundColor = ''; // Quitar el color (restablecer el valor original)
        });
    }
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2,id3,id4] = dataid.split(',');

     let currentElement = event.currentTarget;
     let divsSuperiores = [];
 
     // Bucle para obtener los 4 divs superiores
     for (let i = 0; i < 4; i++) {
         if (currentElement.parentElement) {
             currentElement = currentElement.parentElement;
             divsSuperiores.push(currentElement);
         } else {
             // Si no hay más padres, termina el bucle
             break;
         }
     }
 
     // Pintar los 4 divs superiores de azul cielo y guardar la referencia
     divsSuperiores.forEach(div => {
         div.style.backgroundColor = 'skyblue'; // Color azul cielo
     });
 
     // Guardar los divs pintados en la variable global para poder restablecerlos en el futuro
     divsPintados = divsSuperiores;
 
     console.log('Los 4 divs superiores encontrados:', divsSuperiores);
    switch (funcion) {
        
       
      
       
        case "ver_documento":
            ver_documento(id1);
            break;
       
            
        default:
            sitio();
            break;
    }
}


//alert


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

async function ver_documento(idcontrol_calidad){
    let calidad = Listas_Control_calidad.find(obj => Number(obj.idcontrol_calidad) === Number(idcontrol_calidad));
    let itemEmp = Lista_empleados.find(obj => Number(obj.id) === Number(calidad.empleado_idempleado)) || {"id": 0,"nombre": "-","apellido": "-"};
           
    modales.crearModalSoS({
        code: code,
        type:false,
        x:'1200px',
        y:'800px',
        id: `modal_control_calidad${codigos.codigosControlCalidad}`,
        header: ` 
        <div id="col">
 
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
                                        <label for="razonSocial" class="form-label mb-1 fw-bold" style="font-size: 15px;">Razón Social:</label>
                                        <label for="razonSocial" class="form-label mb-1 fw-bold" style="font-size: 15px;">${empresa.nombre} </label>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="responsable" class="form-label mb-1 fw-bold" style="font-size: 15px;">Responsable:</label>
                                        <label for="responsable" class="form-label mb-1 fw-bold" style="font-size: 15px;">${itemEmp.nombre} ${itemEmp.apellido}</label>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-4">
                                        <label for="numero" class="form-label mb-1 fw-bold" style="font-size: 15px;">No.:</label>
                                        <label for="numero" class="form-label mb-1 fw-bold " style="font-size: 15px;">${calidad.num_doc}</label>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="fecha" class="form-label mb-1 fw-bold " style="font-size: 15px;">Fecha:</label>
                                        <label for="fecha" class="form-label mb-1 fw-bold " style="font-size: 15px;">${calidad.fecha_cc}</label>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="hora" class="form-label mb-1 fw-bold " style="font-size: 15px;">Hora:</label>
                                        <label for="hora" class="form-label mb-1 fw-bold " style="font-size: 15px;">${calidad.hora_cc}</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div  id="Control_calidad_datos_api_general${codigos.codigosVistaPreviaPdf}">
                                <div  id="Control_calidad_datos_api_especifico${codigos.codigosVistaPreviaPdf}">
                                    
                                    
                        
                                </div>
                            </div>
                        
                            
                            
                    
                    </div>
                </div>
            </div>
            <button type="submit" data-id="descargar_pdf" class="btn btn-danger" id="pdf${codigos.codigosVistaPreviaPdf}"> <i class="bi bi-filetype-pdf"></i> Descargar pdf</button>
        </div>
        `,
        body: `
            
       
        `,
        footerButtons: [
            // {
            //     id: "btnConfirmar",
            //     text: "Confirmar",
            //     class: "btn-primary",
            //     onClick: () => alert('hola mundo'),
            //     dismiss: false // Esto cierra el modal cuando se hace clic
            // },
            {
                id: `btnCancelar${codigos.codigosControlCalidad}`,
                text: "Cancelar",
                class: "btn-secondary",
                onClick: () => '',
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            }
        ]
        
    });
    const lista_carac_eval = await listarFunctions.listar_api_general_verd('listadoOjitoControlCalidadProduccion',idcontrol_calidad);
    const descargar = document.querySelector(`#pdf${codigos.codigosVistaPreviaPdf}`);
    descargar.addEventListener("click", descargar_pdf);
    function descargar_pdf() {
        const pdf = document.querySelector("#pagepdf");
        console.log(pdf);
    
        var opt = {
            margin: 0.5,
            filename: `${generarNombreArchivo()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, letterRendering: true, },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape'}
        };
    
        html2pdf().set(opt).from(pdf).save();
            //html2pdf(pdf);
        
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
    litar_caracteristicas();
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
        
        //click
    }
    function rand() {
        const indice = Math.floor(Math.random() * 26);
        const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    
        return String.fromCharCode(65 + indice) + codigo;
    }
    function listarMateriales(datos) {
      
        const contenedorGeneral = document.getElementById(`Control_calidad_datos_api_general${codigos.codigosVistaPreviaPdf}`); 
      
        console.log(datos);
        console.log(Lista_productos);
        datos.forEach((lista, index) => {
    
           let item_producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(lista[0].idproduct_comercial) );
           console.log(item_producto);
            let itemcriterio = Lista_control_calidad_criterio.find(obj => Number(obj.idcriterio_control_calidad) === Number(lista[0].criterio_control_calidad_idcriterio_control_calidad));
         
            const cod = Array.from({ length: 5 }, () => rand()).join("") + index; 
    
            const html = `
            <div id="Control_calidad_datos_api_especifico${cod}">
                <div class="col">
                    <label for="" class="form-label mb-4 fw-bold fs-6">${item_producto.codigo} ${item_producto.nombre}</label>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="p-3 border rounded">
                            <table class="table ">
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
                            <table class="table ">
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
                 <table class="table ">
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
       
       
        evaluaciones.forEach((evaluacion) => {
            if(evaluacion.tipo === 0){
                let itemcaracteristica = Lista_control_calidad_caracteristicas.find(obj=> Number(obj.idcaracteristicas) === Number(evaluacion.caracteristicas_idcaracteristicas ));
    
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
        
        caracteristicasFisicas.forEach((caracteristica) => {
            if(caracteristica.tipo === 1){
                let itemcaracteristica =  Lista_control_calidad_caracteristicas.find(obj=> Number(obj.idcaracteristicas) === Number(caracteristica.caracteristicas_idcaracteristicas) );
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

}




   



function seleccionar_entidad_tipo(entidad_tipo,entidad_id){
    if(entidad_tipo == "Material"){
        return Lista_Material.find(obj => obj.id === Number(entidad_id));
    }else if(entidad_tipo == "Producto"){
        return Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(entidad_id));
    }
    return {};
}
export function mostrar_control_calidad(idcontrol_calidad,idlote){
    const area = document.querySelector(`#contenido${codigos.codigosPrincipal}`);
    const lista = Listas_Control_calidad.find(obj => Number(obj.idcontrol_calidad) === Number(idcontrol_calidad));

    let Entidad_tipo = Lista_lote_produccion.find(item => Number(item.idlote) === Number(idlote));

    let itemempleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado)) || {"nombre": "-","apellido": "-"};
    
    let view = "", ind = 1;
    
        view = `
                <div class="col">
                    <div class="row">
                        <h6 class="fw-bold text-primary mb-2">Lote: ${Entidad_tipo.lote}</h6>
                    </div>
                    <div class="row">
                        <p class="col"><strong>Num Doc:</strong> ${lista.num_doc}</p>
                        <p class="col"><strong>Responsable:</strong> ${itemempleado.nombre} ${itemempleado.apellido}</p>
                        <p class="col"><strong>Fecha:</strong> ${lista.fecha_cc}</p>
                        <p class="col"><strong>Hora:</strong> ${lista.hora_cc}</p>
                    </div>
                </div>

                <div  id="tabla_control_calidad${codigo}">
                    <table class="table mt-4 table-hover" id = "tablaCuerpo">
                        <thead id=lcompra>
                            <tr class="table-dark">
                                <th scope="col">N°</th>
                                <th scope="col">Codigo</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">cantidad</th>
                                <th scope="col">Entidad</th>
                                
                                <th scope="col">Funciones</th>
                            </tr>
                        </thead>
                        <tbody id="Listar_Detalle_control_calidad${codigo}">  
                        
                        </tbody>
                    </table>
                    

                </div>
                <div  id="formulario_control_calidad${codigo}"></div>  
            `;
            area.innerHTML = view;
            
            Listar_Detalle_control_calidad_api(idcontrol_calidad,idlote);
            
            
    
}
export async function Listar_Detalle_control_calidad_api(idcontrol_calidad,idlote){
    await listar();

    const area = document.querySelector(`#Listar_Detalle_control_calidad${codigo}`);
    let ww_control_calidad = Listas_Control_calidad.find(obj => Number(obj.idcontrol_calidad) === Number(idcontrol_calidad));
    let view = "", ind = 1;
    ww_control_calidad.detalle.map(lista=>{
        
        let itemEntidad = seleccionar_entidad_tipo(lista.entidad_tipo,lista.entidad_id);
        console.log(itemEntidad);

        let registrar = {
            0: ``,
            1: `<a data-id="generar_form_control_calidad,${lista.iddetalle_control_calidad},${idcontrol_calidad},${idlote},${ww_control_calidad.Entidad_tipo}" class="btn btn-primary btn-sm" id="menu${codigo}">
                    <i class="bi bi-clipboard-check-fill"></i>
                </a>`
        }
        let actualizar = {
            0: ``,
            1: `<a data-id="actulizar_form_ctr_cal,${lista.iddetalle_control_calidad},${idcontrol_calidad},${idlote}" class="btn btn-primary btn-sm" id="menu${codigo}">
                    <i class="bi bi-pencil-square"></i>
                </a>`
        }
        let eliminar = {
            0: ``,
            1: `<a data-id="Finalizar_control_calidad,${lista.iddetalle_control_calidad},${idcontrol_calidad},${idlote}" class="btn btn-danger btn-sm" id="menu${codigo}">
                    Finalizar
                </a> `
        }

        let color = Number(lista.cantidad) === 0 ? '#EB879C':'white';
        view += `
            <tr >
               <td style = "background-color:  ${color}">${ind++}</td> 
               <td style = "background-color:  ${color}">${itemEntidad.codigo} </td>   
               <td style = "background-color:  ${color}">${itemEntidad.nombre} </td>   
               <td style = "background-color:  ${color}">${lista.cantidad}</td>               
               <td style = "background-color:  ${color}">${lista.entidad_tipo} </td>
                       
                <td style = "background-color:  ${color}">
                    ${registrar[privilegios[2]]}
                    ${actualizar[privilegios[2]]}
                </td>
           </tr>
            `;
    })
    area.innerHTML = view;
   // console.log(view);
    const enlaces = document.querySelectorAll(`#menu${codigo}`);
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuec);
    });

}





export async function sitio(){
    let view = `
    <div class="row">
        <div class="col-md-12">
            <input type="text" id="filtro${codigo}" placeholder="Buscar en la lista...." class="form-control form-control-sm ">
        </div>
        
    </div>
    <div id="listar_finalizados${codigo}" style = "max-height: 400px; overflow-y: auto; display: block;">
        
        
    </div>
`
    app.innerHTML = view;
    await listar();
    const ctr_calidad = Listas_Control_calidad.filter(obj => Number(obj.estado) === 1 && obj.Entidad_tipo == "L_Prod");
    const listaUnida = ctr_calidad.map(control => {
        const empleado = Lista_empleados.find(emp => emp.id === control.empleado_idempleado);
        const lote_prod = Lista_lote_produccion.find(obj => Number(obj.idlote) === Number(control.Entidad_id));
        return {
            ...control,
            nombre: empleado ? empleado['nombre'] : null,
            apellido: empleado ? empleado['apellido'] : null,
            lote: lote_prod ? lote_prod['lote'] : null,
        };
    });
    listar_en_curso(listaUnida);
    // Esperar a que el DOM tenga el input de búsqueda
    setTimeout(() => {
        const searchInput = document.getElementById(`filtro${codigo}`);
        if (searchInput) {

            searchInput.addEventListener('input', (e) => {
                const searchText = e.target.value;
                filterItems(searchText); // Filtra la lista
            });
        }
    }, 0);

    function filterItems(searchText) {
        const filtered = listaUnida.filter(item =>
            (item['lote'] || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (item['fecha_cc'] || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (item['nombre'] || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (item['apellido'] || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (item['num_doc'] || "").toLowerCase().includes(searchText.toLowerCase())
        );

        listar_en_curso(filtered);
    }







   
    
    

}

async function listar_en_curso(listaUnida){
    let view="",ind=1;
    let body_encurso=document.querySelector(`#listar_finalizados${codigo}`);
   
    listaUnida.map(lista=>{
        
            view +=`
                <div class="container my-4">
                    <div class="card shadow-sm border-0 mb-3">
                        
                            <h6 class="fw-bold text-primary mb-2">Lote: ${lista.lote}</h6>

                            <div class="row align-items-center ">
                                <div class="col-md-6 ">
                                    <ul class="list-unstyled">
                                        <li><strong>N°:</strong> ${ind++}</li>
                                        <li><strong>Fecha:</strong> ${lista.fecha_cc}</li>
                                        <li><strong>Hora:</strong> ${lista.hora_cc}</li>
                                        <li><strong>Responsable:</strong> ${lista.nombre} ${lista.apellido}</li>
                                        <li><strong>Num Doc:</strong> ${lista.num_doc}</li>
                                    </ul>
                                </div>
                                <div class="col-md-6 text-md-end text-center ">
                                    <div class="btn-group ">
                                        <!-- Botón Control de Calidad -->
                                       

                                        <!-- Botón Ver Documento -->
                                        <button class="btn btn-primary btn-sm" 
                                                data-id="ver_documento,${lista.idcontrol_calidad}" 
                                                title="Ver Documento">
                                            <i class="bi bi-eye"></i>
                                        </button>

                                     
                                        
                                    </div>
                                </div>
                            </div>
                        
                    </div>
                </div>
                
                
                `;

    })  
     body_encurso.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuec);
    });


}
