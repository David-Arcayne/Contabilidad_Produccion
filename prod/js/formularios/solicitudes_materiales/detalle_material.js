import * as listarFunctions from "../funciones/listar.js";
import * as fuG from "../funciones/generales.js";
import { codigos } from "./constantes.js";
import { despachar_materiales_almacen } from "./solicitudes_materiales.js";
import * as modales from "../funciones/modales/modal_registrar.js";
import * as Registrar from "../funciones/registrar.js";
import { Editar_table_fila } from "../funciones/editar_fila_table.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let Lista_Orden_Producciones =[];
let Lista_detalle_orden_produccion = [];
let Lista_empleados = [];
let Lista_productos =[];
let Lista_Material = [];
let Lista_medida = [];
let solicitudes_material = [];
let idsolicitud;
let Listastockmaterial;
let Lista_proveedor;
let Lista_compras;
let Lista_envases;
let privilegios;
export async function solicitudes_detalle_material(code, permisos, refrescar,id) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    idsolicitud = id;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.select_lista_productos(idEmpresa),
            listarFunctions.mostrar_ordenproduccion(idEmpresa),
            listarFunctions.listar_detalle_produccion(idEmpresa),
            listarFunctions.listar_api_general_verd("Listar_solicitud_material_produccion",idEmpresa),
            listarFunctions.listar_api_general("listar_material",idEmpresa),
            listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
            listarFunctions.listarProveedor(idEmpresa),
            listarFunctions.listar_api_general_verd("listar_compras", idEmpresa),
            listarFunctions.listar_api_general("listaenvases", idEmpresa),
        ]);

        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_productos =resultados[1];
        Lista_Orden_Producciones = resultados[2];
        Lista_detalle_orden_produccion = resultados[3];
        solicitudes_material = resultados[4];
        Lista_Material = resultados[5];
        Lista_medida =  resultados[6];

         
         Lista_proveedor=resultados[7];
         Lista_compras=resultados[8];
         Lista_envases=resultados[9];
        
        
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
const codigo = codigos.codigosDetalleSolicitud;

function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "detalle_materiales":
            break;
        case "ver_stock_de_material":
            ver_stock_de_material(id1,id2);
            break;
        case "editar_solicitud_material":
            editar_solicitud_material(event);
            break;
        case "eliminar_solicitud_material":
            eliminar_solicitud_material(id1);
            break;
        case "finalizar_solicitud":
            finalizar_solicitud(id1);
            break;

            
        default:
            sitio();
            break;
    }

}
async function finalizar_solicitud(idsolicitud) {
    const material_entregado = await listarFunctions.listar_api_general_verd('lista_material_produccion',uk[0].empresa.idempresa);
    let mensaje_solicitud ;
    const solicitud = solicitudes_material.find(obj => Number(obj.idsolicitud_material) === Number(idsolicitud));
    const resultado = material_entregado.filter(itemA => 
        solicitud.detalles.some(itemB => 
            itemA.detalle_solicitud_material_iddetalle_solicitud_material == itemB.iddetalle_solicitud_material
        )
    );
    if(resultado.length === 0){
        mensaje_solicitud ={
        
            memsaje: 'No se Despacho Ningun Material e Insumo',
            botones: [
            
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
            
    
        
        }
    }else{
        mensaje_solicitud ={
        
            memsaje: 'Se finalizará solicitud..',
            botones:[
            
                    {
                        id: "btnCancelar",
                        text: "Cancelar",
                        class: "btn-secondary",
                        onClick: () => {
                            // Puedes agregar aquí cualquier acción personalizada
                        },
                        dismiss: true // Cierra el modal sin ejecutar ninguna acción
                    },
                    {
                        id: "btnConfirmar",
                        text: "Confirmar",
                        class: "btn-primary",
                        onClick: () => {
                                finalizar(idsolicitud);
                        },
                        dismiss: true // Esto NO cierra el modal cuando se hace clic
                    }
                ]
    
        
        }
    }
    console.log(mensaje_solicitud.boton);
    console.log(mensaje_solicitud);

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
                            <p style="color: #6c757d;">${mensaje_solicitud.memsaje}</p>
                        </div>
                    </div>
                </div>
            </div>
        
        `,
        footerButtons: mensaje_solicitud.botones
    });
    async function finalizar(idsolicitud){
        const formData = new FormData();
        formData.append('verDavid', 'actualizar_estado_solicitud_material');
        formData.append('estado',1);
        formData.append('idsolicitud_material',idsolicitud);
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
                        sitio();
                    },
                    dismiss: true // Esto NO cierra el modal cuando se hace clic
                }
            ]
        });
    }
}
async function eliminar_solicitud_material(iddetalle_solicitud_material) {
    if (confirm("Desea Eliminar..?")) {
        const data = await listarFunctions.listar_api_general_verd('eliminar_detalle_solicitud_material',iddetalle_solicitud_material);
            console.log(data);
            let divalert = document.querySelector(`#alerta${codigos.codigosDetalleSolicitud}`);
            if (divalert) {
              // Crear el nuevo contenido de la alerta
              let nuevoContenido = `<div class="alert alert-${data[0]}">${data[1]}</div>`;
              divalert.innerHTML = nuevoContenido;
              
              // Eliminar la alerta después del tiempo especificado
              setTimeout(() => {
                divalert.innerHTML = ``;
                sitio();
              }, 3000);
            }
            
          
    }
}
async function editar_solicitud_material(event) {
    const solicitud = solicitudes_material.find(obj => Number(obj.idsolicitud_material) === Number(idsolicitud));

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
    const id = "iddetalle_solicitud_material";
    await Editar_table_fila(event,codigo,solicitud.detalles,permisos, names,names2,opciones_select,opciones_number,url_api,ver,nom_v_Emp,md5,id);
   
}
async function ver_stock_de_material(iddetalle_solicitud_material,material_idmaterial){


    Listastockmaterial = await listarFunctions.listadoAlmacenMaterial(uk[0].empresa.idempresa);
    const material_entregado = await listarFunctions.listar_api_general_verd('lista_material_produccion',uk[0].empresa.idempresa)
    const solicitud = solicitudes_material.find(obj => Number(obj.idsolicitud_material) === Number(idsolicitud));
    const detalle = solicitud.detalles.find(obj => Number(obj.iddetalle_solicitud_material) === Number(iddetalle_solicitud_material));
    const mat_detalle_entregado =  material_entregado.filter(obj => Number(obj.detalle_solicitud_material_iddetalle_solicitud_material) === Number(iddetalle_solicitud_material));
    let cantidad_entragado = 0;

    mat_detalle_entregado.map(lista => {
        cantidad_entragado += Number(lista.cantidad);
    })

    let item_material = Lista_Material.find(obj => Number(obj.id) === Number(detalle.material_idmaterial));
    let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(item_material.medida));
    let canitidad_solicitado = Number(detalle.cantidad) - Number(cantidad_entragado);

    modales.crearModalSoS({
        code: code_,
        type:false,
        x:'1300px',
        y:'800px',
        id: `ver_stock_para_solicitud${codigos.codigoModalverStock}`,
        header: `  
            
            <div class="container">
                <div class="border rounded p-3 bg-light mb-3 text-center">
                    <h5 class="text-primary fw-bold mb-3">Despachar material-insumo</h5>
                    <div class="d-flex flex-wrap  align-items-center gap-3">
                        <p class="mb-0"><strong>Codigo:</strong> ${item_material.codigo}</p>
                        <p class="mb-0"><strong>Material:</strong> ${item_material.nombre }</p>
                        <p class="mb-0" id="cantidad${codigos.codigoModalverStock}"><strong>Cantidad:</strong> ${canitidad_solicitado}</p>
                        <p class="mb-0"><strong>Medida:</strong> ${item_medida.nombre}</p>
                        <p class="mb-0"><strong>Observaciones:</strong>${detalle.observaciones}</p>
                    </div>
                    
                </div>
            </div>
        `,
        body: `
        <div class="">
            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="filtro${codigos.codigoModalverStock}" placeholder="Buscar en la tabla..." class="form-control form-control-sm w-50">
                </div>
                
            </div>
            
            <div class="scrollable-table mt-4">

                

                <table class="table table-bordered table-striped" id = "editableTable${codigos.codigoModalverStock}">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Codigo</th>
                            <th>Material</th>
                            <th>Lote</th>
                            <th>Proveedor</th>
                            <th>Cantidad Empaques</th>
                            <th>Empaque</th>
                            <th>Cantidad</th>
                            <th>Medida</th>
                            <th>Total</th>
                            <th>Costo Unitario</th>
                            <th>Costo empaque</th>
                            <th>Fecha Caducidad</th>
                            <th>Estado</th>
                            <th>Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="Listar_stock_material${codigos.codigoModalverStock}"></tbody>
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
    Listar_stock_material();
    const input = document.getElementById(`filtro${codigos.codigoModalverStock}`);
    function filtrar_table(e, input) {
        const table = document.getElementById(`editableTable${codigos.codigoModalverStock}`);
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
      input.addEventListener("keyup", (e) => filtrar_table(e, input));
    async function Listar_stock_material(){
        
        const filtrado = Listastockmaterial.filter(obj => Number(obj.material_idmaterial) === Number(material_idmaterial));
        const aset = document.getElementById(`Listar_stock_material${codigos.codigoModalverStock}`);
        let view = "", ind = 1;
        filtrado.map(lista => {
            let medida = Lista_medida.find(obj => Number(obj.id) === Number(lista.medida_idmedida));
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
            let actualizar = {
                0: ``,
                1: `
                               
                      <div class="text-center">
                          <a data-id="despachar_material_produccion,${lista.idalmacen_material}"
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
                    <td >${lista.idalmacen_material}</td> 
                    <td >${lista.codigo_mat}</td> 
                    <td >${lista.nombre_mat}</td> 
                    <td >${compra.lote}</td> 
                    <td >${proveedor.nombre}</td>
                    <td >${lista.cantidad_envases}</td> 
                    <td >${item_envase.nombre}</td> 
                    <td >${lista.peso_neto}</td> 
                    <td >${medida.nombre}</td> 
                    <td >${lista.cantidad} ${medida.nombre}</td> 
                    <td >${lista.costo_unitario}</td> 
                    <td >${lista.costo_envase}</td> 
                    <td >${fuG.cambiarFormatoFecha(lista.fecha_caducidad)}</td> 
                    <td >${caducado}</td> 
                    <td ><div class="d-flex gap-3">
                              ${actualizar[privilegios[2]]}
                            
                          </div></td> 
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
               
                case "despachar_material_produccion":
                    despachar_material_produccion(id1);
                    break;
               
                default:
                    sitio();
                    break;
            }
        
        }
       
    }
    async function despachar_material_produccion(idalmacen_material){
        const almacen = Listastockmaterial.find(obj => Number(obj.idalmacen_material) === Number(idalmacen_material));
        const cantidad_almacen = Number(almacen['cantidad']);
        
        if(cantidad_almacen>canitidad_solicitado){
    
            if(canitidad_solicitado !== 0){

                
                const form = new FormData();
                form.append('verDavid','salida_material_produccion');
                form.append('empresa_idempresa',uk[0].empresa.idempresa);
                form.append('detalle_solicitud_material_iddetalle_solicitud_material',iddetalle_solicitud_material);
                form.append('almacen_material_idalmacen_material',idalmacen_material);
                form.append('cantidad', canitidad_solicitado)
                const data  = await Registrar.sendformData2(form);
                fuG.alertas(data,codigos.codigosDetalleSolicitud);
                document.getElementById(`btnCancelar${codigos.codigoModalverStock}`).click();
                sitio();
                //ver_stock_de_material(iddetalle_solicitud_material,material_idmaterial);
              
            }else{
                alert('la cantidad solicitada es cero' )
            }
            
        }else if(cantidad_almacen <= canitidad_solicitado){
            if(cantidad_almacen !== 0){
                const form = new FormData();
                form.append('verDavid','salida_material_produccion');
                form.append('detalle_solicitud_material_iddetalle_solicitud_material',iddetalle_solicitud_material);
                form.append('empresa_idempresa',uk[0].empresa.idempresa);
                form.append('almacen_material_idalmacen_material',idalmacen_material);
                form.append('cantidad', cantidad_almacen)
                const data  = await Registrar.sendformData2(form);
                fuG.alertas(data,codigos.codigosDetalleSolicitud);

                document.getElementById(`btnCancelar${codigos.codigoModalverStock}`).click();
                sitio();
                ver_stock_de_material(iddetalle_solicitud_material,material_idmaterial);

            }else{
                alert('la cantidad del almacen es cero')
            }
            
        }
                      
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
}



async function sitio(){
    await listar();
    const solicitud = solicitudes_material.find(obj => Number(obj.idsolicitud_material) === Number(idsolicitud));
    console.log(solicitud);
    const estado = Number(solicitud.estado) === 0 ? '':'disabled';
    
    let view="",ind=1;
        view +=`
        
        
        <div id="alerta${codigos.codigosDetalleSolicitud}" class="mt-4"></div>

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
                                <th scope="col">Material</th>
                                <th scope="col">Cantidad</th>
                                <th scope="col">Medida</th>
                                <th scope="col">Observaciones</th>
                                <th scope="col">Entregado</th>
                                <th scope="col">Funciones</th>
                            </tr>
                        </thead>
                        <tbody id="Lista_solicitud_material${codigo}">
                        
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
                                <th scope="col">Material</th>
                                <th scope="col">Cantidad</th>
                                <th scope="col">Proveedor</th>
                            </tr>
                        </thead>
                        <tbody id="Lista_salida_material${codigo}">
                        
                        </tbody>
                    </table>
                     <div class="row">
                        <a data-id="finalizar_solicitud,${idsolicitud}"
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
    listar_salida_material();
     const enlaces = document.querySelectorAll(".btn");
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
     const volver = document.getElementById(`volver${codigo}`);
     volver.addEventListener('click',volveratrar);
 }
 function volveratrar(){
    despachar_materiales_almacen(code_,permisos_,refrescar_);
 }
 async function table_listar(){

    const table = document.getElementById(`Lista_solicitud_material${codigo}`);

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
                "iddetalle_solicitud_material": "1",
                "cantidad": "111",
                "observaciones": "MeEditaron11",
                "solicitud_material_idsolicitud_material": "1",
                "material_idmaterial": "39"
            },
            {
                "iddetalle_solicitud_material": "6",
                "cantidad": "3",
                "observaciones": "soyninguna",
                "solicitud_material_idsolicitud_material": "1",
                "material_idmaterial": "33"
            }
        ]
    }

    Listastockmaterial = await listarFunctions.listadoAlmacenMaterial(uk[0].empresa.idempresa);
    const material_entregado = await listarFunctions.listar_api_general_verd('lista_material_produccion',uk[0].empresa.idempresa)
    const solicitud = solicitudes_material.find(obj => Number(obj.idsolicitud_material) === Number(idsolicitud));

    solicitud.detalles.map((lista)=>{
       console.log(solicitud);
    
        const mat_detalle_entregado =  material_entregado.filter(obj => Number(obj.detalle_solicitud_material_iddetalle_solicitud_material) === Number(lista.iddetalle_solicitud_material));
        let cantidad_entragado = 0;

        mat_detalle_entregado.map(item => {
            cantidad_entragado += Number(item.cantidad);
        })

   
        let canitidad_solicitado = Number(lista.cantidad) - Number(cantidad_entragado);
        let item_material = Lista_Material.find(obj => Number(obj.id) === Number(lista.material_idmaterial));
        let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(item_material.medida));
        let color = canitidad_solicitado === 0 ? 'background-color:rgba(145, 23, 45, 0.549);':'';
       
        let actualizar = {
            0:``,
            1:`
                <a data-id="editar_solicitud_material,${lista.iddetalle_solicitud_material}"
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
                <a  data-id="eliminar_solicitud_material,${lista.iddetalle_solicitud_material}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn${codigo}"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar">
                    <i class="bi bi-trash fs-5"></i>
                </a>
            `
        }
        let ver_stock = {
            '0':`
                ${actualizar[privilegios[2]]}
                ${eliminar[privilegios[3]]}
                <a  data-id="ver_stock_de_material,${lista.iddetalle_solicitud_material},${lista.material_idmaterial}"
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
                    <td style = " ${color}">${lista.iddetalle_solicitud_material}</td>   
                    <td style = " ${color}" data-type="${lista.iddetalle_solicitud_material},codigo">${item_material.codigo}</td>    
                    <td style = " ${color}" data-type="${lista.iddetalle_solicitud_material},nombre">${item_material.nombre}</td>          
                    <td style = " ${color}" data-type="${lista.iddetalle_solicitud_material},cantidad" >${lista.cantidad}</td>
                    <td style = " ${color}" data-type="${lista.iddetalle_solicitud_material},medida" >${item_medida.nombre}</td>
                    <td style = " ${color}" data-type="${lista.iddetalle_solicitud_material},observaciones">${lista.observaciones}</td>
                    <td style = " ${color}" data-type="${lista.iddetalle_solicitud_material},cantidadEntregado">${cantidad_entragado} ${item_medida.nombre}</td>
                    
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
 async function listar_salida_material(){
    const table_body = document.getElementById(`Lista_salida_material${codigo}`);
    const material_entregado = await listarFunctions.listar_api_general_verd('lista_material_produccion',uk[0].empresa.idempresa);
    const lista_stock = await listarFunctions.listadoAlmacenMaterial(uk[0].empresa.idempresa);

    const solicitud = solicitudes_material.find(obj => Number(obj.idsolicitud_material) === Number(idsolicitud));
    const resultado = material_entregado.filter(itemA => 
        solicitud.detalles.some(itemB => 
            itemA.detalle_solicitud_material_iddetalle_solicitud_material == itemB.iddetalle_solicitud_material
        )
    );
    
    let d = [
        {
            "idmaterial_produccion": 4,
            "cantidad": 278.84,
            "detalle_solicitud_material_iddetalle_solicitud_material": 2,
            "almacen_material_idalmacen_material": 25
        },
        {
            "idmaterial_produccion": 3,
            "cantidad": 7.2,
            "detalle_solicitud_material_iddetalle_solicitud_material": 4,
            "almacen_material_idalmacen_material": 20
        },
        {
            "idmaterial_produccion": 2,
            "cantidad": 24,
            "detalle_solicitud_material_iddetalle_solicitud_material": 2,
            "almacen_material_idalmacen_material": 23
        },
        {
            "idmaterial_produccion": 1,
            "cantidad": 8.45,
            "detalle_solicitud_material_iddetalle_solicitud_material": 1,
            "almacen_material_idalmacen_material": 22
        }
    ]
    // <th scope="col">N°</th>
    // <th scope="col">Codigo</th>
    // <th scope="col">Material</th>
    // <th scope="col">Cantidad</th>
    // <th scope="col">Proveedor</th>
    let view = "", ind = 1 ;
    resultado.map(lista =>{
        let detalle = solicitud.detalles.find(obj => Number(obj.iddetalle_solicitud_material)==Number(lista.detalle_solicitud_material_iddetalle_solicitud_material));
        let almacen = lista_stock.find(obj => Number(obj.idalmacen_material) == Number(lista.almacen_material_idalmacen_material));
        console.log(almacen);
        let item_material = Lista_Material.find(obj => Number(obj.id) === Number(detalle.material_idmaterial));
        let item_medida = Lista_medida.find(obj => Number(obj.id) === Number(item_material.medida));
        let proveedor = Lista_proveedor.find(obj => Number(obj.id) === Number(almacen.proveedor_idproveedor));


        view += `
                <tr>
                    <td >${lista.idmaterial_produccion}</td> 
                    <td >${item_material.codigo}</td> 
                    <td >${item_material.nombre}</td> 
                    <td >${lista.cantidad} ${item_medida.nombre}</td>
                    <td >${proveedor.nombre}</td>
                </tr>
        
        `;

    })
    table_body.innerHTML= view;

}