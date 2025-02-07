import * as listarFunctions from "../funciones/listar.js"; 
import * as registrarFuntions from "../funciones/registrar.js";
import * as fuG from "../funciones/generales.js";
import { listadoEvaluacionCaracteristicas, listadoCriterio } from "../funciones/obtener.js";
import { codigos } from "./constantes.js";
import * as modales from "../funciones/modales/modal_registrar.js";
import { URL_APIP } from "../../../../lib/services.js";
import { URL_APIE } from "../../../../lib/services.js"; 
import * as Fug from "../funciones/generales.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let divsPintados = [];

let Listas_Control_calidad = [];
let Lista_empleados=[];
let Lista_Material = [];
let Lista_medidas=[];

let Lista_evaluacion = [];
let Lista_Datos = [];
let Lista_caracteristicas_muestra = [];
let Lista_caracteristicas_evaluacion = [];
let Lista_control_calidad_criterio =[];
let Lista_control_calidad_caracteristicas = [];
let Lista_lote_produccion = [];
let Lista_salida_produccion = [];
let Lista_productos = [];

let listas ;
let app = "";
let privilegios;
const codigo = codigos.codigosEncurso;
let code;
let permisos;
let refrescar;

function vaciarListas(){
     divsPintados = [];
     Listas_Control_calidad = [];
     Lista_empleados=[];
     Lista_Material = [];
     Lista_medidas=[];
     Lista_evaluacion = [];
     Lista_Datos = [];
     Lista_caracteristicas_muestra = [];
     Lista_caracteristicas_evaluacion = [];
     Lista_control_calidad_criterio =[];
     Lista_control_calidad_caracteristicas = [];
     Lista_lote_produccion = [];
     Lista_salida_produccion = [];
     Lista_productos = [];
}
export async function control_calidad_produccion_encurso(code_, permisos_, refrescar_) {
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
        
        case "mostrar_control_calidad":
            mostrar_control_calidad(id1,id2);
            break;
            
        case "generar_form_control_calidad":
            if(id4 == "L_Prod"){
                generar_form_control_calidad_produccion(id1,id2,id3);

            }
            break;
        case "actulizar_form_ctr_cal":
            actulizar_form_ctr_cal(id1,id2,id3);
            break;
        case "Finalizar_para_almacen":
            
            if(id3 == "L_Prod"){
                Finalizar_para_almacen_producto(id1,id2);
            }
            
            break;
        case "ver_documento":
            ver_documento(id1);
            break;
        case "eliminar_caracteristica_evaluacion":
            eliminar_caracteristica_evaluacion(id1);
            break;
            
        default:
            sitio();
            break;
    }
}
async function Finalizar_para_almacen_producto(idcontrol_calidad,idlote) {
    const lista = Listas_Control_calidad.find(obj => Number(obj.idcontrol_calidad) === Number(idcontrol_calidad));
    let cond = false;
    lista.detalle.map(lista => {

        if (Number(lista.cantidad) !== 0) {
          
            alert('Previamente debe hacer la evaluación');
            cond = true;
            return;
        } 
    });
    if(cond){
        return;
    }

    let Entidad_tipo = Lista_lote_produccion.find(item => Number(item.idlote) === Number(idlote));

    let itemempleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado)) || {"nombre": "-","apellido": "-"};


    modales.crearModalSoS({
        code: code,
        type:false,
        x:'1000px',
        y:'600px',
        id: `modal_control_calidad${codigos.codigosPrepararAlmacen}`,
        header: `  
            <div class="container">
                <h6 class="fw-bold text-emphasis mb-2 text-center">Productos Procesados</h6>
            </div>
        `,
        body: `
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
            <div id="Registro_almacen${codigos.codigosPrepararAlmacen}">
            </div>
            <div id="modalCargando" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 1000; justify-content: center; align-items: center;">
                <div id="modalContent" style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); width: 300px; text-align: center;">
                    <div id="spinner" style="border: 4px solid lightgray; border-top: 4px solid black; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto;"></div>
                        <p id="mensajeCargando" style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Cargando, por favor espere...</p>
                    <div id="contenido" style="display: none; font-family: Arial, sans-serif; font-size: 16px; color: #333;">Los datos se han cargado correctamente.</div>
                </div>
            </div>
        `,
        footerButtons: [
            {
                id: `btnCancelar${codigos.codigosPrepararAlmacen}`,
                text: "Cancelar",
                class: "btn btn-outline-secondary mr-1 mt-4",
                onClick: () => '',
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            },
            {
                id: "btnConfirmar",
                text: "Procesar",
                class: "btn btn-outline-success mr-1 mt-4",
                onClick: () => {
                    let datos_recolectados = recolectar_datos();
                    console.log(datos_recolectados);
                    registrar_Almacen(datos_recolectados);
                },
                dismiss: false // Esto cierra el modal cuando se hace clic
            },
        ]
        
    });
    const modalCargando = document.getElementById('modalCargando');
    const spinner = document.getElementById('spinner');
    const mensajeCargando = document.getElementById('mensajeCargando');
    const contenido = document.getElementById('contenido');

    modalCargando.style.display = 'flex';
    spinner.style.display = 'block';
    mensajeCargando.style.display = 'block';
    contenido.style.display = 'none';
    async function tareaQueTarda() {
        let listaAlmacen = await listar_almacen(idcontrol_calidad);
        return new Promise((resolve) => {
            setTimeout(() => {
                
                console.log(listaAlmacen);
                llenardatos(listaAlmacen);
                   
                resolve();
            }, 5000);
        });
    }

    try {
        
        await tareaQueTarda();
        spinner.style.display = 'none';
        mensajeCargando.style.display = 'none';
        contenido.style.display = 'block';
        modalCargando.style.display = 'none';
    } catch (error) {
        mensajeCargando.textContent = 'Ocurrió un error al cargar los datos';
        spinner.style.display = 'none';
        console.error(error);
    }
    
    async function registrar_Almacen(lista) {
        let linea = true;
    
        for (const item of lista) {
            if(item.destino == 'Devolucion'){
                const formData = new FormData();
           
                formData.append('verDavid', 'registrar_devolucion_produccion');
        
                formData.append('cantidad', item.cantidad);
                formData.append('costo_unitario', item.costo_unitario);
                formData.append('empresa_idempresa', item.empresa_idempresa);
                formData.append('control_calidad_idcontrol_calidad', item.control_calidad_idcontrol_calidad);
                formData.append('lote_idlote', item.lote_idlote);
                formData.append('producto_idproducto', item.producto_idproducto);
                for (let [key, value] of formData.entries()) {
                    console.log(key, value);
                }
                fetch(`${URL_APIP}/api/`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Usar-Registro-David': 'true'
                    }
                })
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    if(data[0] === "success"){
                        Fug.alertas(data,codigos.codigosPrincipal);
                        linea &&= true;
                    }else{
                        linea &&= false;
                        return;
                    }
                });
            }else{
                const formData = new FormData();
           
                formData.append('verDavid', 'registrarStockProductos');
        
                formData.append('cantidad', item.cantidad);
                formData.append('costo_unitario', item.costo_unitario);
                formData.append('empresa_idempresa', item.empresa_idempresa);
                formData.append('control_calidad_idcontrol_calidad', item.control_calidad_idcontrol_calidad);
                formData.append('lote_idlote', item.lote_idlote);
                formData.append('producto_idproducto', item.producto_idproducto);
            
                
        
                for (let [key, value] of formData.entries()) {
                    console.log(key, value);
                }
                fetch(`${URL_APIP}/api/`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Usar-Registro-David': 'true'
                    }
                })
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    if(data[0] === "success"){
                        Fug.alertas(data,codigos.codigosPrincipal);

                        linea &&= true;
                    }else{
                        linea &&= false;
                        return;
                    }
                });
            }
            
        }
        console.log(linea);
    
        if(linea){
            document.getElementById(`btnCancelar${codigos.codigosPrepararAlmacen}`).click();

            let doc=document.querySelector(`.p-2[data-value="${code}"] .card-body`);

            doc.querySelector(`button[data-section="finalizados"]`).click();
        }else{
            sitio();
        }
       
    }
               
    function llenardatos(listaAlmacen){

        console.log(listaAlmacen);
        const area = document.querySelector(`#Registro_almacen${codigos.codigosPrepararAlmacen}`);
        let ctr_calidad = Listas_Control_calidad.find(obj => Number(obj.idcontrol_calidad) === Number(idcontrol_calidad));
        let lote = Lista_lote_produccion.find(obj => Number(obj.idlote) === Number(idlote));
        let view = "", ind =1;

        listaAlmacen.map(lista => {
            console.log(lista);
            let ctr_detalle = Listas_Control_calidad.detalle;
            console.log(Listas_Control_calidad);
            let producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(lista[2]));
            let medida = Lista_medidas.find(obj => Number(obj.id) === Number(producto.unidad_id_unidad));
            let detalle_salida = Lista_salida_produccion.find(obj => Number(obj.idsalida_produccion) === Number(lista[3]));
            
            
            view += `
                    <div class="row align-items-center border rounded bg-light shadow-sm mt-4 p-3" id="datos_almacen${codigos.codigosPrepararAlmacen}">

                        <input type="hidden" name="destino${ind}" value="${lista[5]}">
                        <input type="hidden" name="producto_idproducto${ind}" value="${producto.idproduct_comercial}">
                       
                        <input type="hidden" name="lote_idlote${ind}" value="${idlote}">
                        <input type="hidden" name="control_calidad_idcontrol_calidad${ind}" value="${idcontrol_calidad}">
                       
                        <input type="hidden" name="cantidad${ind}" value="${Number(lista[0])}">
                        <input type="hidden" name="costo_unitario${ind}" value="${1}">
                        
                        <div class="col-md-1 text-center mb-md-0">
                            <span class="badge bg-primary fs-6">#${ind}</span>
                        </div>

                        <!-- Código -->
                        <div class="col-md-2">
                            <p class="mb-1 fw-bold">Código:</p>
                            <p class="form-control-plaintext">${producto.codigo}</p>
                        </div>

                        <!-- Insumo -->
                        <div class="col-md-3">
                            <p class="mb-1 fw-bold">Producto:</p>
                            <p class="form-control-plaintext">${lista[1]}</p>
                        </div>

                        <!-- Cantidad y Peso -->
                        <div class="col-md-2">
                            <p class="mb-1 fw-bold">Cantidad :</p>
                            <p class="form-control-plaintext">${lista[0]} ${medida.nombre}</p>
                        </div>
                        <div class="col-md-2">
                            <p class="mb-1 fw-bold">Destino:</p>
                            <p class="form-control-plaintext">${lista[5]}</p>
                        </div>      
                        <div class="col-md-1">
                            <p class="mb-1 fw-bold">Medida:</p>
                            <p class="form-control-plaintext">${medida.nombre}</p>
                        </div>
                    </div>


            `;
            ind++;
        })
        area.innerHTML = view;
    }
    async function listar_almacen(idcontrol_calidad){
        let listaAlmacen=[];
        const lista_carac_eval = await listarFunctions.listar_api_general_verd('listadoOjitoControlCalidadProduccion',idcontrol_calidad);
        lista_carac_eval.forEach((firstLevel) => {
            listaAlmacen.push(listar_productos_almacen(firstLevel));
            
        });
        lista_carac_eval.forEach((firstLevel) => {
            console.log(firstLevel);
            listaAlmacen.push(listar_productos_devolucion(firstLevel));
            
        });
        listaAlmacen = eliminarSubarraysInnecesarios(listaAlmacen);
        return listaAlmacen;
        
    }

    function eliminarSubarraysInnecesarios(arr) {
        return arr.filter(subarray => {
            // Verifica que el subarray no sea [0, 0, 0, 0, 0, null]
            return !(subarray.length === 6 &&
                     subarray[0] === 0 &&
                     subarray[1] === 0 &&
                     subarray[2] === 0 &&
                     subarray[3] === 0 &&
                     subarray[4] === 0 );
        });
    }
    function listar_productos_almacen(datos) {
        let cantidad =0;
        let producto =0;
        let idproduct_comercial = 0;
        let idsalida_produccion =0;
        let iddetalle_controlcalidad = 0;
        let destino;
        console.log(datos);
        datos.forEach((lista) => {
            console.log(lista);
            let item_producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(lista[0].idproduct_comercial) );
            let itemcriterio = Lista_control_calidad_criterio.find(obj => obj.idcriterio_control_calidad === lista[0].criterio_control_calidad_idcriterio_control_calidad);
            console.log(itemcriterio);
            if(itemcriterio.destino === "Almacen"){
                cantidad += itemcriterio.cantidad;
                producto = item_producto.nombre;
                idproduct_comercial = lista[0].idproduct_comercial;
                idsalida_produccion = lista[0].idsalida_produccion;
                iddetalle_controlcalidad = lista[0].iddetalle_control_calidad;
                destino = itemcriterio.destino;
            }
        });
        
        return [cantidad,producto ,idproduct_comercial,idsalida_produccion,iddetalle_controlcalidad,destino];
    }
    function listar_productos_devolucion(datos) {
        let cantidad =0;
        let producto =0;
        let idproduct_comercial = 0;
        let idsalida_produccion =0;
        let iddetalle_controlcalidad = 0;
        let destino;
        console.log(datos);
        datos.forEach((lista) => {
            console.log(lista);
            let item_producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(lista[0].idproduct_comercial) );
            let itemcriterio = Lista_control_calidad_criterio.find(obj => obj.idcriterio_control_calidad === lista[0].criterio_control_calidad_idcriterio_control_calidad);
            console.log(itemcriterio);
            if(itemcriterio.destino === "Devolucion"){
                cantidad += itemcriterio.cantidad;
                producto = item_producto.nombre;
                idproduct_comercial = lista[0].idproduct_comercial;
                idsalida_produccion = lista[0].idsalida_produccion;
                iddetalle_controlcalidad = lista[0].iddetalle_control_calidad;
                destino = itemcriterio.destino;
            }
        });
        
        return [cantidad,producto ,idproduct_comercial,idsalida_produccion,iddetalle_controlcalidad,destino];
    }
    function recolectar_datos() {
        const areaform = document.getElementById(`Registro_almacen${codigos.codigosPrepararAlmacen}`);
        const rows = areaform.querySelectorAll(`.row`); // Seleccionar todas las filas generadas
    
        let datos_Almacen = []; // Array donde guardaremos los objetos
    
        rows.forEach((row, index) => {
           

            let cantidad = row.querySelector(`input[name="cantidad${index + 1}"]`).value;
            let destino = row.querySelector(`input[name="destino${index + 1}"]`).value;
            let costo_unitario = row.querySelector(`input[name="costo_unitario${index + 1}"]`).value;
            let producto_idproducto = row.querySelector(`input[name="producto_idproducto${index + 1}"]`).value;
            let empresa_idempresa = uk[0].empresa.idempresa;
            let control_calidad_idcontrol_calidad = row.querySelector(`input[name="control_calidad_idcontrol_calidad${index + 1}"]`).value;
          
            let lote_idlote = row.querySelector(`input[name="lote_idlote${index + 1}"]`).value;

            datos_Almacen.push({
                cantidad : cantidad,
                producto_idproducto : producto_idproducto,
                empresa_idempresa : empresa_idempresa,
                control_calidad_idcontrol_calidad : control_calidad_idcontrol_calidad,
                lote_idlote : lote_idlote,
                costo_unitario : costo_unitario,
                destino:destino
            });
        });
        return datos_Almacen;
       
    }
}

//alert

async function generar_form_control_calidad_produccion(iddetalle_control_calidad,idcontrol_calidad,idlote) {
    console.log(iddetalle_control_calidad,idcontrol_calidad,idlote);
    const produccion = Lista_lote_produccion.find(obj => Number(obj.idlote) === Number(idlote));
    const detalle_salida = Lista_salida_produccion.filter(obj => Number(obj.produccion_idproduccion) === Number(produccion.idproduccion));
    let ww_control_calidad = Listas_Control_calidad.find(obj => Number(obj.idcontrol_calidad) === Number(idcontrol_calidad));
    let ww_detalle_control_calidad = ww_control_calidad.detalle.find(obj => Number(obj.iddetalle_control_calidad) === Number(iddetalle_control_calidad));
    let itemProducto = seleccionar_entidad_tipo(ww_detalle_control_calidad.entidad_tipo,ww_detalle_control_calidad.entidad_id);
    let itemSalida = detalle_salida.find(obj => Number(obj.producto_idproducto) == Number(itemProducto.idproduct_comercial));
    let item_medida = Lista_medidas.find(obj => Number(obj.id) === Number(itemProducto.unidad_id_unidad)) || { nombre:'Kg'};
       
    console.log(itemSalida);
    modales.crearModalSoS({
        code: code,
        type:false,
        x:'1000px',
        y:'800px',
        id: `modal_control_calidad${codigos.codigosControlCalidad}`,
        header: `  
            <div class="container">
                <div class="border rounded p-3 bg-light mb-3 text-center">
                    <h5 class="text-primary fw-bold mb-3">Control de Calidad</h5>
                    <div class="d-flex flex-wrap  align-items-center gap-3">
                        <p class="mb-0"><strong>Número de documento:</strong> ${ww_control_calidad.num_doc}</p>
                        <p class="mb-0"><strong>Fecha:</strong> ${ww_control_calidad.fecha_cc}</p>
                        <p class="mb-0"><strong>Hora:</strong> ${ww_control_calidad.hora_cc}</p>
                        <p class="mb-0"><strong>Entidad:</strong>${ww_detalle_control_calidad.entidad_tipo}</p>

                    </div>
                    <div class="d-flex flex-wrap  align-items-center gap-3">
                        <p class="mb-0"><strong>${ww_detalle_control_calidad.entidad_tipo}:</strong> ${itemProducto.codigo} ${itemProducto.nombre}</p>
                        <p class="mb-0"><strong>Cantidad:</strong> ${ww_detalle_control_calidad.cantidad} ${item_medida.nombre} </p>
                        
                    </div>
                </div>
            </div>
        `,
        body: `
         <div class="container">

            <div class="row">
                
                <div class="col">
                    <div style="position: relative;" class="col-md-4">
                        <input type="hidden" name="caracteristicas_idcaracteristicas" id="caracteristicas_idcaracteristicas${codigos.codigosCaracteristicasMuestra}" required >

                        <label for="material" class="form-label">Fase 1(1ra impresión):</label>
                        <input type="text" id="searchInput${codigos.codigosCaracteristicasMuestra}" placeholder="Buscar..." class="form-control" name="material" required>
                        <ul id="dropdownList${codigos.codigosCaracteristicasMuestra}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white; display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                        
                    </div>
                    <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="generar_formulario2" aria-label="generar">Agregar</button>
                </div>
                <div class="col">
                    <div style="position: relative;" class="col-md-4">
                        <input type="hidden" name="caracteristicas_idcaracteristicas" id="caracteristicas_idcaracteristicas${codigos.codigosCaracteristicasEvaluacion}" required >

                        <label for="material" class="form-label">Fase 2(Laboratorio):</label>
                        <input type="text" id="searchInput${codigos.codigosCaracteristicasEvaluacion}" placeholder="Buscar..." class="form-control" name="material" required>
                        <ul id="dropdownList${codigos.codigosCaracteristicasEvaluacion}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white; display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                        
                    </div>
                    <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="generar_formulario1" aria-label="generar">Agregar</button>
                </div>
                
            </div>
            <div id="alerta${codigos.codigosControlCalidad}"></div>
            
            <form id="Formulario_control${codigos.codigosControlCalidad}">
                <label for="" class="form-label fw-bold fs-6 row">Datos muestra</label>

                <div id="caracteristica_dato${codigos.codigosControlCalidad}"> 
                    <small class="form-text text-muted">Seleccione caracteristicas fisicas para añadir al formulario</small>


                </div>
                <input type="hidden"   name="ver"  value="registrar_criterio_controlCalidad">
                <input type="hidden"   name="detalle_control_calidad_iddetalle_control_calidad"  value="${iddetalle_control_calidad}">

                <div id="Formulario2" class="mt-4">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="peso_neto">Peso Neto</label>
                                <input type="number" step="0.01" class="form-control" name="peso_neto" id="peso_neto${codigos.codigosControlCalidad}" value=""  required>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="peso_envase">Peso Envase</label>
                                <input type="number" step="0.01" class="form-control" name="peso_envase" id="peso_envase${codigos.codigosControlCalidad}" required>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="peso_bruto">Peso Bruto</label>
                                <input type="number" step="0.01" class="form-control" name="peso_bruto" style="background-color: rgba(108, 117, 125, 0.5);" id="peso_bruto${codigos.codigosControlCalidad}" readonly>
                            </div>
                        </div>
                    </div>

                    

                </div>
                <label for="" class="form-label fw-bold fs-6 row">Datos evaluación</label>
    
                <div id="caracteristica_evaluacion${codigos.codigosControlCalidad}"> 
                    <small class="form-text text-muted">Seleccione caracteristicas para añadir al formulario</small>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="calificacion">Calificación</label>
                            <input type="number" step="0.01" class="form-control" name="calificacion" style="background-color: rgba(108, 117, 125, 0.5);"  id="calificacion${codigos.codigosControlCalidad}" readonly required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="observaciones">Observaciones y concluciones</label>
                            <textarea class="form-control" name="observaciones" id="observaciones" rows="2" required></textarea>
                        </div>
                    </div>
                </div> 
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="cantidad">Cantidad</label>
                            <input type="number" step="0.01" class="form-control" name="cantidad" id="cantidad${codigos.codigosControlCalidad}" value="${ww_detalle_control_calidad.cantidad}" min="1" required>
                        </div>
                    </div>
                    <div class="col-md-6 mt-4">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-check">

                                    <input class="form-check-input" type="radio" name="destino" id="radioAlmacen" value="Almacen" required title="Debes seleccionar una opción">
                                    <label class="form-check-label" for="radioAlmacen">
                                        Almacén
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="destino" id="radioDevolución" value="Devolucion" required>
                                    <label class="form-check-label" for="radioDevolución">
                                        Devolución
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
               
            </form>
        </div>
        `,
        footerButtons: [
            
            {
                id: `btnCancelar${codigos.codigosControlCalidad}`,
                text: "Cancelar",
                class: "btn btn-outline-secondary mr-1 mt-4",
                onClick: () => '',
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            },
            {
                id: `btnConfirmar${codigos.codigosControlCalidad}`,
                text: "Teminar Control Calidad",
                class: "btn btn-outline-success mr-1 mt-4",
                onClick: () => {
                    const frm = document.querySelector(`#Formulario_control${codigos.codigosControlCalidad}`);
                    if (!frm.checkValidity()) {
                        frm.reportValidity(); // Muestra los mensajes de error de validación
                        return;
                    }
                    

                    let x = recolectarEvaluaciones();
            

                    let y = recolectarEvaluaciones_fisicas();
            

                    x = x.concat(y);  
                
                    registrar_criterio_controlCalidad(frm,x);    

                },
                dismiss: false // Esto cierra el modal cuando se hace clic
            },
        ]
        
    });
    setInterval(calcularPromedio, 3000);
    initializeDropdownSearch(codigos.codigosCaracteristicasEvaluacion, Lista_evaluacion,'caracteristica',false);
    initializeDropdownSearch(codigos.codigosCaracteristicasMuestra, Lista_Datos,'caracteristica',false);
    document.getElementById('generar_formulario1').addEventListener('click', function () {
        if (Lista_caracteristicas_evaluacion.length > 0) {
            
            generarFormulario(Lista_caracteristicas_evaluacion, `caracteristica_evaluacion${codigos.codigosControlCalidad}`, true);
        } else {
            console.error('No hay opciones seleccionadas en el primer select.');
        }
    });

    document.getElementById('generar_formulario2').addEventListener('click', function () {
        if (Lista_caracteristicas_muestra.length > 0) {
            generarFormulario(Lista_caracteristicas_muestra, `caracteristica_dato${codigos.codigosControlCalidad}`, false);
        } else {
            console.error('No hay opciones seleccionadas en el segundo select.');
        }
    });

    
    function initializeDropdownSearch(codigo, Lista, valor, condicion) {
        const searchInput = document.getElementById(`searchInput${codigo}`);
        const dropdownList = document.getElementById(`dropdownList${codigo}`);
    
        // Crear la lista inicial
        function populateDropdown(filteredItems) {
            dropdownList.innerHTML = ''; // Limpia la lista
            filteredItems.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item[valor];
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
                    
                    searchInput.value = item[valor];
                    
                    
                    dropdownList.style.display = 'none'; // Oculta la lista
                    parametros_extras(item);
                });
    
                dropdownList.appendChild(li);
            });
        }
    
        // Filtrar la lista según el texto ingresado
        function filterItems(searchText) {
            if(condicion){
                const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoCompras}`).value;
                const filterListaRubro = Lista.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
                const filtered = filterListaRubro.filter(item =>
                    item[valor].toLowerCase().includes(searchText.toLowerCase())
                );
                populateDropdown(filtered);
            }else{
                const filtered = Lista.filter(item =>
                    item[valor].toLowerCase().includes(searchText.toLowerCase())
                );
                populateDropdown(filtered);
            }
            
        }
    
        // Mostrar y manejar eventos del input
        searchInput.addEventListener('focus', () => {
            dropdownList.style.display = 'block';
            if(condicion){
                const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoCompras}`).value;
                const filterListaRubro = Lista.filter((obj) => Number(obj.rubro_idrubro) === Number(idrubro));
                populateDropdown(filterListaRubro); // Muestra todos los elementos inicialmente
            }else{
                
                populateDropdown(Lista); // Muestra todos los elementos inicialmente
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
     
        if(Number(item['tipo']) === 0){
           
            document.getElementById(`caracteristicas_idcaracteristicas${codigos.codigosCaracteristicasEvaluacion}`).value = item.idcaracteristicas;
            let existe = Lista_caracteristicas_evaluacion.some(obj => Number(obj.idcaracteristicas) === Number(item.idcaracteristicas));
            if(!existe){
                Lista_caracteristicas_evaluacion.push(item);
            }else{
                alert("Caracteristica ya se agrego");
            }
            
            
        }else {
            document.getElementById(`caracteristicas_idcaracteristicas${codigos.codigosCaracteristicasMuestra}`).value = item.idcaracteristicas;
            let existe = Lista_caracteristicas_muestra.some(obj => Number(obj.idcaracteristicas) === Number(item.idcaracteristicas));
            if(!existe){
                Lista_caracteristicas_muestra.push(item);
            }else{
                alert("Caracteristica ya se agrego");

            }
        }
                   
    }
    function generarFormulario(selectedOptions, idFormulario,condicion) {
        const areaform = document.getElementById(idFormulario);
        let view = "", ind = 1;
        if(condicion){
            selectedOptions.forEach(option => {
                view += `
                    <div class="row">
                        <input type="hidden" class="form-control" name="id${ind}" value="${option.idcaracteristicas}" required>
                        <div class="col-md-2">
                            <label for="caracteristica${ind}" class="form-label fw-bold fs-6 mt-3">${option.caracteristica}</label>
                        </div>
                        <div class="col-md-2 mt-2">
                            <input type="number" class="form-control" name="evaluacion${ind}" placeholder="Evaluación" required>
                        </div>
                        <div class="col-md-6 mt-2">
                            <input type="text" class="form-control" name="detalle${ind}" placeholder="Ingrese detalles" required>
                        </div>
                        <div class="col-md-2 mt-2">
                            <a data-id="eliminar_caracteristica_evaluacion,${option.idcaracteristicas}" class="btn btn-danger btn${codigo}">
                                <i class="bi bi-trash"></i>
                            </a> 
                        </div>
                    </div>
                `;
                ind++;
            });
        }else{
            selectedOptions.forEach(option => {
                view += `
                    <div class="row">
                        <input type="hidden" class="form-control" name="id${ind}" value="${option.idcaracteristicas}" required>
                        <div class="col-md-2">
                            <label for="caracteristica${ind}" class="form-label fw-bold fs-6 mt-3">${option.caracteristica}</label>
                        </div>
                        <div class="col-md-2 mt-2">
                            <input type="text" class="form-control" name="evaluacion${ind}" placeholder="Dato" required>
                        </div>
                        <div class="col-md-6 mt-2">
                            <input type="text" class="form-control" name="detalle${ind}" placeholder="Ingrese detalles" required>
                        </div>
                        <div class="col-md-2 mt-2">
                            <a data-id="eliminar_caracteristica_dato,${option.idcaracteristicas}" class="btn btn-danger btn${codigo}">
                                <i class="bi bi-trash"></i>
                            </a> 
                        </div>
                    </div>
                `;
                ind++;
            });
        }
       
    
        areaform.innerHTML = view;
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menucontrolcalidad);
        });
    }
    function menucontrolcalidad(event){

        
        const dataid = event.currentTarget.getAttribute('data-id');
        const [funcion, id1, id2,id3] = dataid.split(',');
    
        
        switch (funcion) {
            
            
            case "eliminar_caracteristica_evaluacion":
                eliminar_caracteristica_evaluacion(id1);
                break;
                
            case "eliminar_caracteristica_dato":
                eliminar_caracteristica_dato(id1);
                break;
            default:
                sitio();
                break;
        }
    }
    function eliminar_caracteristica_evaluacion(idcaracteristicas){
        if (confirm("Desea eliminar...?")) {
            Lista_caracteristicas_evaluacion = Lista_caracteristicas_evaluacion.filter(obj => Number(obj.idcaracteristicas) !== Number(idcaracteristicas));
            generarFormulario(Lista_caracteristicas_evaluacion, `caracteristica_evaluacion${codigos.codigosControlCalidad}`, true);
        }
    }
    function eliminar_caracteristica_dato(idcaracteristicas){
        if (confirm("Desea eliminar...?")) {
            Lista_caracteristicas_muestra = Lista_caracteristicas_muestra.filter(obj => Number(obj.idcaracteristicas) !== Number(idcaracteristicas));
            generarFormulario(Lista_caracteristicas_muestra, `caracteristica_dato${codigos.codigosControlCalidad}`, false);
        }
    }


    function calcularPromedio() {
        let pro = 0;
        const inptPromedio = document.querySelector(`#calificacion${codigos.codigosControlCalidad}`);
        if (inptPromedio) {
            const peso_neto = document.querySelector(`#peso_neto${codigos.codigosControlCalidad}`);
            const peso_envase = document.querySelector(`#peso_envase${codigos.codigosControlCalidad}`);
            const peso_bruto = document.querySelector(`#peso_bruto${codigos.codigosControlCalidad}`);
            let datos = recolectarEvaluaciones();
            if (datos) {
                datos.map(obj => {
                    pro += Number(obj.evaluacion);
                });
                pro = pro / datos.length;
                pro = pro.toFixed(2); 
            }
            peso_bruto.value = (Number(peso_envase.value) + Number(peso_neto.value)).toFixed(2); 
            inptPromedio.value = pro; 
        }
    
    }
    function recolectarEvaluaciones() {
        const areaform = document.getElementById(`caracteristica_evaluacion${codigos.codigosControlCalidad}`);
        const rows = areaform.querySelectorAll('.row'); // Seleccionar todas las filas generadas
        
        let evaluaciones = []; // Array donde guardaremos los objetos
    
        rows.forEach((row, index) => {
            let id = row.querySelector(`input[name="id${index + 1}"]`).value;
    
            let evaluacion = row.querySelector(`input[name="evaluacion${index + 1}"]`).value;
            let detalle = row.querySelector(`input[name="detalle${index + 1}"]`).value;
            let label = row.querySelector('label').textContent; // Capturar el texto del label
    
            evaluaciones.push({
                id: id,
                caracteristica: label,
                evaluacion: evaluacion,
                detalle: detalle
            });
        });
    
       
    
        return evaluaciones;
       
    }
    function recolectarEvaluaciones() {
        const areaform = document.getElementById(`caracteristica_evaluacion${codigos.codigosControlCalidad}`);
        const rows = areaform.querySelectorAll('.row'); // Seleccionar todas las filas generadas
        
        let evaluaciones = []; // Array donde guardaremos los objetos
    
        rows.forEach((row, index) => {
            let id = row.querySelector(`input[name="id${index + 1}"]`).value;
    
            let evaluacion = row.querySelector(`input[name="evaluacion${index + 1}"]`).value;
            let detalle = row.querySelector(`input[name="detalle${index + 1}"]`).value;
            let label = row.querySelector('label').textContent; // Capturar el texto del label
    
            evaluaciones.push({
                id: id,
                caracteristica: label,
                evaluacion: evaluacion,
                detalle: detalle
            });
        });
    
        return evaluaciones;
       
    }
    function recolectarEvaluaciones_fisicas() {
    
    
        let evaluaciones = []; 
       
    
        const areafisicas = document.getElementById(`caracteristica_dato${codigos.codigosControlCalidad}`);
        const rowsf = areafisicas.querySelectorAll('.row'); 
    
        rowsf.forEach((row, index) => {
            let id = row.querySelector(`input[name="id${index + 1}"]`).value;
    
            let evaluacion = row.querySelector(`input[name="evaluacion${index + 1}"]`).value;
            let detalle = row.querySelector(`input[name="detalle${index + 1}"]`).value;
            let label = row.querySelector('label').textContent; 
    
            evaluaciones.push({
                id: id,
                caracteristica: label,
                evaluacion: evaluacion,
                detalle: detalle
            });
        });
    
        return evaluaciones;
       
    }
    async function registrar_criterio_controlCalidad(form, lista) {
        //e.preventDefault();
        const dato = new FormData(form);
        console.log(lista);
        for (let [key, value] of dato.entries()) {
            console.log(key, value);
        }
    
    
        fetch(`${URL_APIP}/api/`, {
            method: "POST",
            body: dato
        })
        .then(res => res.json())
        .then(data => {
            if(data[0] === "success" &&  data[2] === "registrar_criterio_controlCalidad"){
                registrar_evaluacion_caracteristicas(data[3],lista);
            }else{
                alertas(data);
            }
        });     
    }
    async function registrar_evaluacion_caracteristicas(id_criterio, lista) {
        let linea = true;
    
        for (const item of lista) {
            const formData = new FormData();
            formData.append('ver', 'registrar_evaluacion_caracteristicas');
            formData.append('evaluacion', item.evaluacion);
            formData.append('detalle', item.detalle);
            formData.append('caracteristicas_idcaracteristicas', item.id);
            formData.append('criterio_control_calidad_idcriterio_control_calidad', id_criterio);
    
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            try {
                const data = await registrarFuntions.sendformData(formData);
                console.log(data);
                if(data[0] === "success"){
                    linea *= true;
                }else{
                    linea *= false;
                }
                Fug.alertas(data,codigos.codigosPrincipal);

            } catch (error) {
                console.error('Error al registrar evaluación:', error);
                linea *= false; 
            }
        }
        console.log(linea);
    
        if(linea){
            document.getElementById(`btnCancelar${codigos.codigosControlCalidad}`).click();
            Lista_caracteristicas_evaluacion = [];
            Lista_caracteristicas_muestra = [];
            
            mostrar_control_calidad(idcontrol_calidad,idlote);
        }
       
    }
    function alertas(data) {
        console.log(data);
        let alertClass, alertMessage, timeoutDuration;
        if (data[0] == "ok") {
            alertClass = 'alert-success';
            alertMessage = data[1];
            timeoutDuration = 500;
            
        } else {
            if(data[0] == "danger"){
                alertClass = 'alert-danger';
                alertMessage = data[1];
                timeoutDuration = 2000;
                
            }else{
                alertClass = 'alert-primary';
                alertMessage = data[1];
                timeoutDuration = 3000;
    
            }
        }
        
        let divalert = document.querySelector(`#alerta${codigos.codigosControlCalidad}`);
        if (divalert) {
            let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
            divalert.innerHTML = nuevoContenido;
            
            setTimeout(() => {
                divalert.innerHTML = ``;
                
            }, timeoutDuration);
        }
    }
}

async function actulizar_form_ctr_cal_(iddetalle_control_calidad,idcontrol_calidad) {
    const modalCargando = document.getElementById('modalCargando');
    const spinner = document.getElementById('spinner');
    const mensajeCargando = document.getElementById('mensajeCargando');
    const contenido = document.getElementById('contenido');

    modalCargando.style.display = 'flex';
    spinner.style.display = 'block';
    mensajeCargando.style.display = 'block';
    contenido.style.display = 'none';

    let x = await listadoEvaluacionCaracteristicas();
    let y = await listadoCriterio();
    console.log(x);
    console.log(y);
    let z = y.filter(obj => obj.detalle_control_calidad_iddetalle_control_calidad === Number(id));
    let k = x.filter(obj => z.some(item => item.idcriterio_control_calidad === obj.criterio_control_calidad_idcriterio_control_calidad));
    console.log(z);
    console.log(k);
    function tareaQueTarda() {
        return new Promise((resolve) => {
            setTimeout(() => {
                modal_control_calidad_editar(codigo, code, privilegios, listas, id, id_compra, z, k);
                resolve();
            }, 3000);
        });
    }

    try {
        await tareaQueTarda();

        spinner.style.display = 'none';
        mensajeCargando.style.display = 'none';
        contenido.style.display = 'block';
        modalCargando.style.display = 'none';
    } catch (error) {
        mensajeCargando.textContent = 'Ocurrió un error al cargar los datos';
        spinner.style.display = 'none';
        console.error(error);
    }
}
async function actulizar_form_ctr_cal(iddetalle_control_calidad,idcontrol_calidad,idlote) {   
    console.log(iddetalle_control_calidad,idcontrol_calidad,idlote);
    let lista_criterios_evaluados;
    let Lista_evaluacion_evaluados;
    const lista = Listas_Control_calidad.find(obj => Number(obj.idcontrol_calidad) === Number(idcontrol_calidad));

    let itemempleado = Lista_empleados.find(obj => Number(obj.id) === Number(lista.empleado_idempleado)) || {"nombre": "-","apellido": "-"};
    let Entidad_tipo = Lista_lote_produccion.find(item => Number(item.idlote) === Number(idlote));
    console.log(Entidad_tipo);
    modales.crearModalSoS({
        code: code,
        type:false,
        x:'1200px',
        y:'800px',
        id: `modal_control_calidad${codigos.actulizar_form_ctr_cal}`,
        header: `  
            
            <div class="container">
                <h6 class="fw-bold text-emphasis mb-2" style="text-align: center;"> Estado control calidad</h6>
            </div>
        `,
        body: `
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
            <div class="mt-4" style = "max-height: 500px; overflow-y: auto; display: block;">
                <div id="alerta${codigos.actulizar_form_ctr_cal}"></div>

                <table class="table table-hover">
                    <thead>
                        <tr class="table-dark">
                            <th>N°</th>
                            <th>Material</th>
                            <th>Cantidad</th>
                            <th>Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="Listar_detalle_control_calidad${codigos.actulizar_form_ctr_cal}">
                        
                    </tbody>
                </table>
            </div> 
            <div id="modalCargando" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 1000; justify-content: center; align-items: center;">
                <div id="modalContent" style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); width: 300px; text-align: center;">
                    <div id="spinner" style="border: 4px solid lightgray; border-top: 4px solid black; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto;"></div>
                        <p id="mensajeCargando" style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Cargando, por favor espere...</p>
                    <div id="contenido" style="display: none; font-family: Arial, sans-serif; font-size: 16px; color: #333;">Los datos se han cargado correctamente.</div>
                </div>
            </div>

        `,
        footerButtons: [
            
            {
                id: `btnCancelar${codigos.actulizar_form_ctr_cal}`,
                text: "Cancelar",
                class: "btn btn-outline-secondary mr-1 mt-4",
                onClick: () => '',
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            },
            
        ]
        
    });
    const modalCargando = document.getElementById('modalCargando');
    const spinner = document.getElementById('spinner');
    const mensajeCargando = document.getElementById('mensajeCargando');
    const contenido = document.getElementById('contenido');

    modalCargando.style.display = 'flex';
    spinner.style.display = 'block';
    mensajeCargando.style.display = 'block';
    contenido.style.display = 'none';
    async function tareaQueTarda() {
        let x = await listadoEvaluacionCaracteristicas();
        let y = await listadoCriterio();
        console.log(x);
        console.log(y);
        let z = y.filter(obj => obj.detalle_control_calidad_iddetalle_control_calidad === Number(iddetalle_control_calidad));
        let k = x.filter(obj => z.some(item => item.idcriterio_control_calidad === obj.criterio_control_calidad_idcriterio_control_calidad));
        lista_criterios_evaluados = z;
        Lista_evaluacion_evaluados = k;
        return new Promise((resolve) => {
            setTimeout(() => {
                
                console.log(lista_criterios_evaluados);
                console.log(Lista_evaluacion_evaluados);
                
                   
                resolve();
            }, 5000);
        });
    }

    try {
        
        await tareaQueTarda();
        spinner.style.display = 'none';
        mensajeCargando.style.display = 'none';
        contenido.style.display = 'block';
        modalCargando.style.display = 'none';
    } catch (error) {
        mensajeCargando.textContent = 'Ocurrió un error al cargar los datos';
        spinner.style.display = 'none';
        console.error(error);
    }
    Listar_detalle_control_calidad();
    function seleccionar_entidad_tipo(entidad_tipo,entidad_id){
        if(entidad_tipo == "Producto"){
            return Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(entidad_id));
        }
        return {};
    }
    function Listar_detalle_control_calidad(){
        
        let ctr_calidad = {
            "idcontrol_calidad": "41",
            "fecha_cc": "2025-01-23",
            "hora_cc": "15:14:44",
            "num_doc": "DOC-Comp-0000023",
            "Entidad_tipo": "Comp",
            "Entidad_id": "33",
            "estado": "0",
            "empresa_idempresa": "50",
            "empleado_idempleado": "86",
            "detalle": [
                {
                    "iddetalle_control_calidad": "60",
                    "cantidad": "1201",
                    "entidad_tipo": "Material",
                    "entidad_id": "58",
                    "estado": null,
                    "control_calidad_idcontrol_calidad": "41"
                },
                {
                    "iddetalle_control_calidad": "61",
                    "cantidad": "12",
                    "entidad_tipo": "Material",
                    "entidad_id": "59",
                    "estado": null,
                    "control_calidad_idcontrol_calidad": "41"
                }
            ]
        };
        const area=document.querySelector(`#Listar_detalle_control_calidad${codigos.actulizar_form_ctr_cal}`);
            let view="",ind=1;
                console.log(Listas_Control_calidad);
                console.log(lista_criterios_evaluados);
                const document_ctr_calidad = Listas_Control_calidad.find(obj => Number(obj.idcontrol_calidad) === Number(idcontrol_calidad));
                lista_criterios_evaluados.map(lista=>{
                let itemdcc = document_ctr_calidad.detalle.find(obj => Number(obj.iddetalle_control_calidad) === Number(lista.detalle_control_calidad_iddetalle_control_calidad));
                    console.log(itemdcc);
                let itemProducto = seleccionar_entidad_tipo(itemdcc.entidad_tipo,itemdcc.entidad_id);
                    // console.log(itemProducto);
                view+=`
                 <tr>
                    <td>${ind++}</td>                
                    <td ">${itemProducto.nombre}</td>
                    
                    <td ">${lista.cantidad}</td>                
                    <td>
                        
                        <a data-id="Eliminar_control_calidad_criterio,${lista.idcriterio_control_calidad}" class="btn btn-danger btn-sm" id="btn${codigo}">
                            <i class="bi bi-trash"></i>
                        </a> 
                                                  
                    </td>
                </tr>
                `;
            })
            area.innerHTML = view;
    
            const enlaces = document.querySelectorAll(`#btn${codigo}`);
            enlaces.forEach(enlace => {
                enlace.addEventListener("click", eliminar_ctr_calidad);
            });
    }
    async function eliminar_ctr_calidad(event){
        const dataid = event.currentTarget.getAttribute('data-id');
        const [funcion, id1, id2] = dataid.split(',');
        
        if(confirm("Desea Eliminar..?")){
            fetch(`${URL_APIP}api/eliminar_criterio/${id1}`, {
                headers: {
                    'Usar-Listado-David': 'true' 
                }
            })
            .then(res=>res.json())
            .then(data=>{
                fuG.alertas(data,codigos.actulizar_form_ctr_cal);

                setTimeout(() => {
                    document.getElementById(`btnCancelar${codigos.actulizar_form_ctr_cal}`).click();
                    actulizar_form_ctr_cal(iddetalle_control_calidad,idcontrol_calidad,idlote);
                    Listar_Detalle_control_calidad_api(idcontrol_calidad,idlote);
                  }, 2000);
            })
        }
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
             listar_productos_almacen(firstLevel);
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
    function listar_productos_almacen(datos) {
      
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
                                        <th scope="col">Fase 1(1ra impresión)</th>
                                        <th scope="col">Dato</th>
                                        <th scope="col">Detalle</th>
                                    </tr>
                                </thead>
                                <tbody id="listar_caracteristicas_fisicas${cod}">
                                </tbody>
                            </table>
                        </div>
                    </div>


                    <div class="col-md-6">
                        <div class="p-3 border rounded">
                            <table class="table ">
                                <thead class="thead-light">
                                    <tr>
                                        <th scope="col">Fase 2(Laboratorio)</th>
                                        <th scope="col">Evaluación</th>
                                        <th scope="col">Detalle</th>
                                    </tr>
                                </thead>
                                <tbody id="listar_caracteristicas${cod}">
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
                        <td>${caracteristica.detalle}</td>
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
    console.log(idcontrol_calidad,idlote);
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
    console.log(idcontrol_calidad,idlote);
    const area = document.querySelector(`#Listar_Detalle_control_calidad${codigo}`);
    let ww_control_calidad = Listas_Control_calidad.find(obj => Number(obj.idcontrol_calidad) === Number(idcontrol_calidad));
    let view = "", ind = 1;
    ww_control_calidad.detalle.map(lista=>{
        
        let itemEntidad = seleccionar_entidad_tipo(lista.entidad_tipo,lista.entidad_id);
        console.log(itemEntidad);

    

        let registrar = {
            0: ``,
            1: `
                           
                  <div class="text-center">
                      <a data-id="generar_form_control_calidad,${lista.iddetalle_control_calidad},${idcontrol_calidad},${idlote},${ww_control_calidad.Entidad_tipo}" id="menu${codigo}"
                      class="btn btn-outline-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                      style="width: 2.5rem; height: 2.5rem;"
                      title="Registrar ctr calidad">
                          <i class="bi bi-clipboard-check-fill fs-5"></i>
                      </a>
                      <span class="d-block mt-1 small"></span>
                  </div>
                  `,
          };
        let actualizar = {
            0: ``,
            1: `                           
                  <div class="text-center">
                      <a data-id="actulizar_form_ctr_cal,${lista.iddetalle_control_calidad},${idcontrol_calidad},${idlote},u" id="menu${codigo}"
                      class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                      style="width: 2.5rem; height: 2.5rem;"
                      title="Editar ctr calidad">
                          <i class="bi bi-pencil-square fs-5"></i>
                      </a>
                      <span class="d-block mt-1 small"></span>
                  </div>
                  `,
          };
        

        let color = Number(lista.cantidad) === 0 ? '#EB879C':'white';
        view += `
            <tr >
               <td style = "background-color:  ${color}">${ind++}</td> 
               <td style = "background-color:  ${color}">${itemEntidad.codigo} </td>   
               <td style = "background-color:  ${color}">${itemEntidad.nombre} </td>   
               <td style = "background-color:  ${color}">${lista.cantidad}</td>               
               <td style = "background-color:  ${color}">${lista.entidad_tipo} </td>
                       
                <td style = "background-color:  ${color}">
                    <div class="d-flex gap-3">
                        ${registrar[privilegios[2]]}
                        ${actualizar[privilegios[2]]}
                    </div>
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
        <div id="listar_encurso${codigo}" style = "max-height: 400px; overflow-y: auto; display: block;">
            
            
        </div>
    `
    app.innerHTML = view;
    vaciarListas();
    await listar();


    const ctr_calidad = Listas_Control_calidad.filter(obj => Number(obj.estado) === 0 && obj.Entidad_tipo == "L_Prod");
    const listaUnida = ctr_calidad.map(control => {
        const empleado = Lista_empleados.find(emp => emp.id === control.empleado_idempleado);
        const compra = Lista_lote_produccion.find(obj => Number(obj.idlote) === Number(control.Entidad_id));
        return {
            ...control,
            nombre: empleado ? empleado['nombre'] : null,
            apellido: empleado ? empleado['apellido'] : null,
            lote: compra ? compra['lote'] : null,
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
    let body_encurso=document.querySelector(`#listar_encurso${codigo}`);


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
                                        <button class="btn btn-info btn-sm" 
                                                data-id="mostrar_control_calidad,${lista.idcontrol_calidad},${lista.Entidad_id}" 
                                                title="Control de Calidad">
                                            <i class="bi bi-table"></i>
                                        </button>

                                        <!-- Botón Ver Documento -->
                                        <button class="btn btn-primary btn-sm" 
                                                data-id="ver_documento,${lista.idcontrol_calidad}" 
                                                title="Ver Documento">
                                            <i class="bi bi-eye"></i>
                                        </button>

                                        <!-- Botón Enviar -->
                                        <button class="btn btn-success btn-sm d-flex align-items-center gap-1" 
                                                data-id="Finalizar_para_almacen,${lista.idcontrol_calidad},${lista.Entidad_id},${lista.Entidad_tipo}" 
                                                title="Procesar">
                                            <i class="bi bi-send-plus"></i> Procesar
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