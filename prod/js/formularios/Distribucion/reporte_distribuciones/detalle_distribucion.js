import * as listarFunctions from "../../funciones/listar.js";
import * as fuG from "../../funciones/generales.js";
import { codigos } from "../constantes.js";
import { distribucion_producto } from "../principal.js";
import * as modales from "../../funciones/modales/modal_registrar.js";
import * as Registrar from "../../funciones/registrar.js";
import { Editar_table_fila } from "../../funciones/editar_fila_table.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;

let Lista_productos = [];
let Lista_medida = [];
let Lista_solicitud_producto = [];
let iddistribucion;
let Listastockproducto;
let Lista_lotes_produccion;
let Listas_Control_calidad = [];
let Lista_envases;
let privilegios;
export async function solicitudes_detalle_producto(code, permisos, refrescar,id) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    iddistribucion = id;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            
            listarFunctions.listar_api_general_verd("listar_distribucion", idEmpresa),
            listarFunctions.listar_api_general("listar_productos_comercial",idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
            listarFunctions.listar_api_general_verd("listadoProduccionLote",idEmpresa),
            listarFunctions.listar_api_general_verd('listadoControlCalidad',idEmpresa),//0

        ]);

        // Asignamos los resultados a las variables correspondientes
       
        Lista_solicitud_producto = resultados[0];
        Lista_productos = resultados[1];
        Lista_medida =  resultados[2];
        Lista_lotes_produccion=resultados[3];
        Listas_Control_calidad = resultados[4];

        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
const codigo = codigos.codigo_detalle_solicitud;

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "detalle_materiales":
            break;
        case "ver_stock_de_producto":
            ver_stock_de_producto(id1,id2);
            break;
        case "editar_solicitud_material":
            editar_solicitud_material(event);
            break;
        case "eliminar_solicitud_producto":
            eliminar_solicitud_producto(id1);
            break;
        case "finalizar_solicitud":
            finalizar_solicitud(id1);
            break;

            
        default:
            sitio();
            break;
    }

}
async function finalizar_solicitud(iddistribucion) {
    modales.crearModalSoS({
        code: code_,
        type:false,
        x:'1000px',
        y:'800px',
        id: `modal_finalizar_produccion${codigos.codigomodalFinalizarSOlicitud}`,
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
                            <p style="color: #6c757d;">Se finalizará solicitud..</p>
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
                        finalizar(iddistribucion);
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
    async function finalizar(iddistribucion){
        const formData = new FormData();
        formData.append('verDavid', 'actualizar_estado_distribucion');
        formData.append('estado',1);
        formData.append('iddistribucion',iddistribucion);
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        const data  = await Registrar.sendformData2(formData);
        modales.crearModalSoS({
            code: code_,
            type:false,
            x:'1000px',
            y:'800px',
            id: `confirmacion${codigos.Finalizar_produccion_codigo}`,
            header: `
                
            `,
            body: `

                <div id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                    <div >
                        <div class = "row" >
                            <!-- Modal Body -->
                            <div  style="text-align: center;">
                                <div class="icon-success" style="font-size: 100px; color: #167e1a;"><i class="bi bi-check2-circle fs-10"></i></div>
                                <h5 style="font-size: 24px; font-weight: bold; margin-top: 10px;">Operacion Completada</h5>
                                <p style="color: #6c757d;">${data[1]}</p>
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
                            
                    },
                    dismiss: true // Esto NO cierra el modal cuando se hace clic
                }
            ]
        });
    }
}
async function eliminar_solicitud_producto(iddetalle_distribucion) {
    if (confirm("Desea Eliminar..?")) {
        const data = await listarFunctions.listar_api_general_verd('eliminar_detalle_distribucion',iddetalle_distribucion);
        fuG.alertas(data,codigos.codigo_detalle_solicitud);    
        if(data[0] === 'success' || data[0] === 'ok'){
            sitio();
        } 
    }
}
async function editar_solicitud_material(event) {
    const solicitud = Lista_solicitud_producto.find(obj => Number(obj.idsolicitud_material) === Number(iddistribucion));

    const permisos = [ 3, 5];
    const opciones_select = [];
    const opciones_number = [];
    const names = [
        "cantidad",
        "observaciones"
    ];
    const names2 = [
        "cantidad",
        "observaciones"
       
    ];
    const url_api = "editar_detalle_solicitud_material";
    const ver = "verDavid";
    const nom_v_Emp = "empresa";
    const md5 = uk[0].empresa.idempresa;
    const id = "iddetalle_distribucion";
    await Editar_table_fila(event,codigo,solicitud.detalles,permisos, names,names2,opciones_select,opciones_number,url_api,ver,nom_v_Emp,md5,id);
   
}


































async function ver_stock_de_producto(iddetalle_distribucion,producto_idproducto){


    
    Listastockproducto = await listarFunctions.listar_api_general_verd('listadoAlmacenProducto',uk[0].empresa.idempresa);
    const producto_entragado = await listarFunctions.listar_api_general_verd('despacho_producto',uk[0].empresa.idempresa);
    const solicitud = Lista_solicitud_producto.find(obj => Number(obj.iddistribucion) === Number(iddistribucion));


    const detalle = solicitud.detalle.find(obj => Number(obj.iddetalle_distribucion) === Number(iddetalle_distribucion));
    const pro_detallle_entregado =  producto_entragado.filter(obj => Number(obj.detalle_distribucion_iddetalle_distribucion) === Number(iddetalle_distribucion));
    let cantidad_entragado = 0;

    pro_detallle_entregado.map(lista => {
        cantidad_entragado += Number(lista.cantidad);
    })

    let producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(detalle.producto_idproducto));
    let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(producto.unidad_id_unidad));
    let canitidad_solicitado = Number(detalle.cantidad) - Number(cantidad_entragado);

    modales.crearModalSoS({
        code: code_,
        type:false,
        x:'1000px',
        y:'800px',
        id: `ver_stock_para_solicitud${codigos.codigoModalverStock}`,
        header: `  
            
            <div class="container">
                <div class="border rounded p-3 bg-light mb-3 text-center">
                    <h5 class="text-primary fw-bold mb-3">Despachar Producto</h5>
                    <div class="d-flex flex-wrap  align-items-center gap-3">
                        <p class="mb-0"><strong>Codigo:</strong> ${producto.codigo}</p>
                        <p class="mb-0"><strong>Producto:</strong> ${producto.nombre }</p>
                        <p class="mb-0" id="cantidad${codigos.codigoModalverStock}"><strong>Cantidad:</strong> ${canitidad_solicitado}</p>
                        <p class="mb-0"><strong>Medida:</strong> ${item_medida.nombre}</p>
                    </div>
                    
                </div>
            </div>
        `,
        body: `
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigos.codigoModalverStock}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
                
            </div>
            
            <div class="scrollable-table mt-4">

                

                <table class="table table-bordered table-striped" id = "editableTable${codigos.codigoModalverStock}">
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
                            
                            <th>Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="Listar_stock_productos_mdl${codigos.codigoModalverStock}"></tbody>
                </table>
            </div>
        </div>
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
                id: `btnCancelar${codigos.codigoModalverStock}`,
                text: "Cancelar",
                class: "btn-secondary",
                onClick: () => '',
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            }
        ]
        
    });
    Listar_stock_productos_mdl();
    async function Listar_stock_productos_mdl(){
        
        const filtrado = Listastockproducto.filter(obj => Number(obj.producto_idproducto) === Number(producto_idproducto));
        const aset = document.getElementById(`Listar_stock_productos_mdl${codigos.codigoModalverStock}`);
        let view = "", ind = 1;
        filtrado.map(lista => {
            let medida = Lista_medida.find(obj => Number(obj.id) === Number(lista.medida_idmedida));
            let item_lote = Lista_lotes_produccion.find(obj => Number(obj.idlote) === Number(lista.lote_idlote));
            let item_ctr_calidad = Listas_Control_calidad.find(obj => Number(obj.Entidad_id) === Number(lista.lote_idlote) );

            
            let actualizar = {
                0: ``,
                1: `
                               
                      <div class="text-center">
                          <a data-id="despachar_producto_distrubucion,${lista.idalmacen_producto}"
                          class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigos.codigoModalverStock}"
                          style="width: 2.5rem; height: 2.5rem;" 
                          title="Despachar material">
                              <i class="bi bi-send-plus-fill"></i>
                          </a>
                          <span class="d-block mt-1 small"></span>
                      </div>
                      `,
              };
    
            view += `
          
                <tr>
                    <td >${lista.idalmacen_producto}</td> 
                    <td >${lista.codigo}</td> 
                    <td >${lista.producto}</td> 
                    <td >${item_lote.lote}</td>
                    <td >${item_ctr_calidad.fecha_cc}</td> 
                    <td >${lista.rubro}</td> 
                    <td >${lista.cantidad}</td> 
                    <td >${lista.medida} </td> 
                    <td >${lista.costo_unitario}</td> 
                    <td >
                        <div class="d-flex gap-3">
                            ${actualizar[privilegios[2]]}    
                        </div>
                    </td> 
                </tr>
            `;
        })
        aset.innerHTML = view;
        const enlaces = document.querySelectorAll(`.btn${codigos.codigoModalverStock}`);
        enlaces.forEach((enlace) => {
          enlace.addEventListener("click", menu);
        });
        function menu(event){
            const boton = event.currentTarget;

      
            boton.disabled = true;
            const dataid = event.currentTarget.getAttribute('data-id');
            const [funcion, id1,id2] = dataid.split(',');
            switch (funcion) {
               
                case "despachar_producto_distrubucion":
                    despachar_producto_distrubucion(id1);
                    break;
               
                default:
                    sitio();
                    break;
            }
        
        }
       
    }
    async function despachar_producto_distrubucion(idalmacen_producto){
        const almacen = Listastockproducto.find(obj => Number(obj.idalmacen_producto) === Number(idalmacen_producto));
        const cantidad_almacen = Number(almacen['cantidad']);
        console.log(cantidad_almacen);
        if(cantidad_almacen>canitidad_solicitado){
    
            if(canitidad_solicitado !== 0){

                
                const form = new FormData();
                form.append('verDavid','registro_despacho_producto');
                form.append('empresa_idempresa',uk[0].empresa.idempresa);
                form.append('detalle_distribucion_iddetalle_distribucion',iddetalle_distribucion);
                form.append('almacen_producto_idalmacen_producto',idalmacen_producto);
                form.append('cantidad', canitidad_solicitado)
                const data  = await Registrar.sendformData2(form);
                fuG.alertas(data,codigos.codigo_detalle_solicitud);    
                
                document.getElementById(`btnCancelar${codigos.codigoModalverStock}`).click();
                sitio();
                ver_stock_de_producto(iddetalle_distribucion,producto_idproducto);
              
            }else{
                alert('la cantidad solicitada es cero' )
            }
            
        }else if(cantidad_almacen <= canitidad_solicitado){
            if(cantidad_almacen !== 0){
                const form = new FormData();
                form.append('verDavid','registro_despacho_producto');
                form.append('detalle_distribucion_iddetalle_distribucion',iddetalle_distribucion);
                form.append('empresa_idempresa',uk[0].empresa.idempresa);
                form.append('almacen_producto_idalmacen_producto',idalmacen_producto);
                form.append('cantidad', cantidad_almacen)
                const data  = await Registrar.sendformData2(form);
                alert('la cantidad de salida es ' + cantidad_almacen )
                fuG.alertas(data,codigos.codigo_detalle_solicitud);    

                document.getElementById(`btnCancelar${codigos.codigoModalverStock}`).click();
                
                sitio();
                ver_stock_de_producto(iddetalle_distribucion,producto_idproducto);

            }else{
                alert('la cantidad del almacen es cero')
            }
            
        }
                      
    }
    
}



async function sitio(){
    await listar();
    const solicitud = Lista_solicitud_producto.find(obj => Number(obj.iddistribucion) === Number(iddistribucion));
    console.log(solicitud);
    const estado = Number(solicitud.estado) === 0 ? '':'disabled';
    
    let view="",ind=1;
        view +=`
        
        
        <div id="alerta${codigos.codigo_detalle_solicitud}" class="mt-4"></div>

        <div class="row">
           <a style="float: right;" class="cerrar d-flex align-items-center mt-1" id="volver${codigo}">
            <i class="bi bi-chevron-double-left fs-5 me-1"></i>
            <span>Volver</span>
        </a>
            <div class="col-md-6">

                <div class="p-3 bg-light border rounded">
                    <table class="table table-hover" id="editableTable${codigo}">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">N°</th>
                                <th scope="col">Codigo</th>
                                <th scope="col">Producto</th>
                                <th scope="col">Cantidad</th>
                                <th scope="col">Medida</th>
                                <th scope="col">Entregado</th>
                                <th scope="col">Funciones</th>
                            </tr>
                        </thead>
                        <tbody id="listar_solicitud_producto${codigo}">
                        
                        </tbody>
                    </table>
                    
                </div>
            </div>
            
            <div class="col-md-6">
                
                <div class="p-3 bg-light border rounded" id="contenido${codigo}">
                     <table class="table table-hover" id="edit${codigo}">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">N°</th>
                                <th scope="col">Codigo</th>
                                <th scope="col">Producto</th>
                                <th scope="col">Cantidad</th>
                                <th scope="col">Lote</th>
                            </tr>
                        </thead>
                        <tbody id="listar_salida_producto${codigo}">
                        
                        </tbody>
                    </table>
                     <div class="row">
                        <a data-id="finalizar_solicitud,${iddistribucion}"
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center ${estado}"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Finalizar">
                            <i class="bi bi-send-x fs-5"></i>
                        </a>
                        <span class="d-block mt-1 small">Finalizar</span>
                    </div>
                </div>
               
                
            </div>
            
        </div>
        
        `;
     app.innerHTML=view;
    table_listar();
    listar_salida_producto();
     const enlaces = document.querySelectorAll(".btn");
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
     const volver = document.getElementById(`volver${codigo}`);
     volver.addEventListener('click',volveratrar);
 }
 function volveratrar(){
    distribucion_producto(code_,permisos_,refrescar_);
 }
 async function table_listar(){

    const table = document.getElementById(`listar_solicitud_producto${codigo}`);

    let view = "",ind = 1;
    let a = {
        "idsolicitud_material": "1",
        "fecha": "2024-11-08",
        "hora": "15:25:55",
        "estado": "0",
        "empleado_idempleado": "85",
        "produccion_idproduccion": "1",
        "detalles": [
            {
                "iddetalle_distribucion": "1",
                "cantidad": "111",
                "observaciones": "MeEditaron11",
                "solicitud_material_idsolicitud_material": "1",
                "producto_idproducto": "39"
            },
            {
                "iddetalle_distribucion": "6",
                "cantidad": "3",
                "observaciones": "soyninguna",
                "solicitud_material_idsolicitud_material": "1",
                "producto_idproducto": "33"
            }
        ]
    }

    
    Listastockproducto = await listarFunctions.listar_api_general_verd('listadoAlmacenProducto',uk[0].empresa.idempresa);
    const producto_entragado = await listarFunctions.listar_api_general_verd('despacho_producto',uk[0].empresa.idempresa);
    const solicitud = Lista_solicitud_producto.find(obj => Number(obj.iddistribucion) === Number(iddistribucion));

    solicitud.detalle.map((lista)=>{
       console.log(solicitud);
    
        const pro_detallle_entregado =  producto_entragado.filter(obj => Number(obj.detalle_distribucion_iddetalle_distribucion) === Number(lista.iddetalle_distribucion));
        let cantidad_entragado = 0;

        pro_detallle_entregado.map(item => {
            cantidad_entragado += Number(item.cantidad);
        })

   
        let canitidad_solicitado = Number(lista.cantidad) - Number(cantidad_entragado);
        let producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(lista.producto_idproducto));
        let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(producto.unidad_id_unidad));
        let color = canitidad_solicitado === 0 ? 'background-color:rgba(145, 23, 45, 0.549);':'';
       
        let actualizar = {
            0:``,
            1:`
                <a data-id="editar_solicitud_material,${lista.iddetalle_distribucion}"
                    class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                    style="width: 2.5rem; height: 2.5rem;"
                    title="Editar">
                        <i class="bi bi-pencil-square fs-5"></i>
                </a>
            `
        }
        let eliminar = {
            0:``,
            1:`
                <a  data-id="eliminar_solicitud_producto,${lista.iddetalle_distribucion}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar">
                    <i class="bi bi-trash fs-5"></i>
                </a>
            `
        }
        let ver_stock = {
            '0':`
                
                ${eliminar[privilegios[3]]}
                <a  data-id="ver_stock_de_producto,${lista.iddetalle_distribucion},${lista.producto_idproducto}"
                class="btn btn-outline-warning rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                style="width: 2.5rem; height: 2.5rem;"
                title="Almacen">
                    <i class="bi bi-box-seam fs-5"></i>
                </a>
            `,
            '1':`
               
            `,
            "-1":``
        }
        view += `
             <tr >
                    <td style = " ${color}">${lista.iddetalle_distribucion}</td>   
                    <td style = " ${color}" data-type="${lista.iddetalle_distribucion},codigo">${producto.codigo}</td>    
                    <td style = " ${color}" data-type="${lista.iddetalle_distribucion},nombre">${producto.nombre}</td>          
                    <td style = " ${color}" data-type="${lista.iddetalle_distribucion},cantidad" >${lista.cantidad}</td>
                    <td style = " ${color}" data-type="${lista.iddetalle_distribucion},medida" >${item_medida.nombre}</td>
                    <td style = " ${color}" data-type="${lista.iddetalle_distribucion},cantidadEntregado">${cantidad_entragado} ${item_medida.nombre}</td>
                    
                    <td style = " ${color}" >
                        ${ver_stock[solicitud.estado]}          
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
 async function listar_salida_producto(){
    const table_body = document.getElementById(`listar_salida_producto${codigo}`);
    Listastockproducto = await listarFunctions.listar_api_general_verd('listadoAlmacenProducto',uk[0].empresa.idempresa);
    const producto_entragado = await listarFunctions.listar_api_general_verd('despacho_producto',uk[0].empresa.idempresa);
    const solicitud = Lista_solicitud_producto.find(obj => Number(obj.iddistribucion) === Number(iddistribucion));
    const resultado = producto_entragado.filter(itemA => 
        solicitud.detalle.some(itemB => 
            itemA.detalle_distribucion_iddetalle_distribucion == itemB.iddetalle_distribucion
        )
    );
    
    let d = [
        {
            "idmaterial_produccion": 4,
            "cantidad": 278.84,
            "detalle_distribucion_iddetalle_distribucion": 2,
            "almacen_producto_idalmacen_producto": 25
        },
        {
            "idmaterial_produccion": 3,
            "cantidad": 7.2,
            "detalle_distribucion_iddetalle_distribucion": 4,
            "almacen_producto_idalmacen_producto": 20
        },
        {
            "idmaterial_produccion": 2,
            "cantidad": 24,
            "detalle_distribucion_iddetalle_distribucion": 2,
            "almacen_producto_idalmacen_producto": 23
        },
        {
            "idmaterial_produccion": 1,
            "cantidad": 8.45,
            "detalle_distribucion_iddetalle_distribucion": 1,
            "almacen_producto_idalmacen_producto": 22
        }
    ]
    // <th scope="col">N°</th>
    // <th scope="col">Codigo</th>
    // <th scope="col">Material</th>
    // <th scope="col">Cantidad</th>
    // <th scope="col">Proveedor</th>
    let view = "", ind = 1 ;
    resultado.map(lista =>{
        let detalle = solicitud.detalle.find(obj => Number(obj.iddetalle_distribucion)==Number(lista.detalle_distribucion_iddetalle_distribucion));
        let almacen = Listastockproducto.find(obj => Number(obj.idalmacen_producto) == Number(lista.almacen_producto_idalmacen_producto));
        console.log(almacen);
        let producto = Lista_productos.find(obj => Number(obj.idproduct_comercial) === Number(detalle.producto_idproducto));
        let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(producto.unidad_id_unidad));
        let produccion = Lista_lotes_produccion.find(obj => Number(obj.lote_idlote) === Number(almacen.lote_idlote));


        view += `
                <tr>
                    <td >${lista.iddespacho_producto}</td> 
                    <td >${producto.codigo}</td> 
                    <td >${producto.nombre}</td> 
                    <td >${lista.cantidad} ${item_medida.nombre}</td>
                    <td >${produccion.lote}</td>
                </tr>
        
        `;

    })
    table_body.innerHTML= view;

}