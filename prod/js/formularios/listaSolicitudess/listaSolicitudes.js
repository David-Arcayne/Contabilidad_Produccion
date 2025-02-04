import { listarTipo_envase,listarmedida,listarProveedorSelect, listarMaterial,listarProveedor,listarMaterial2, listarmedida2 } from "./selectsFormulario.js";
import { envaseArray,medidaArray,materialArray, proveedorArray } from "./selectsFormulario.js";
import { URL_APIP } from "../../../../lib/services.js";
import { vistaListaCompraRealizada1,listaCompraRealizada2, ojitoListaCompraRealizada, cuerpoListaDetalleCompra } from "../listaSolicitudess/vistaRegistros.js";
import { listarEdicionCompraEspera, listar_compraPorProveedorEdit,SumaTotalCompraEdit,
         formularioEditarSoli, eliminar_listaCompraSoli_edit, eliminar_compraEspera,eliminar_listaCompraSoli } from "../listaSolicitudess/editarRegistros.js";
import { editarListaCompraSoli, edit_Celda_table, editarListaCompraSoli_Edicion } from "../listaSolicitudess/edicionDobleCLick.js";
import { obtenerListaCompras } from "../funciones/obtener.js";  
import { listaCompraRealizadas } from "../listaSolicitudess/vistaRegistros.js";
// import { modalVistaProveedorMaterial } from "./modalProvMat.js"; ATRAS
let incrementable = 1;
let ukS=localStorage.getItem("yofinanciero");
export let uk=JSON.parse(ukS);
export let empleado =[];
export let idcompra;
console.log(uk[0].usuario);
let app="";
export let loteGeneral;
export let idRegistro = 0;
export let proveedorGeneral;
export let idpedido;
export const codigo = Array.from({ length: 3 }, () => rand()).join("") + "listaSolicitudesConfig";
export let ListaCompra_Soli;
let ArrayDetalleCompra;
export let compras = [];
let currentId = 0;
let idRegEdit;
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function listaSolicitudesConfig(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
    
}
const proveedorSelect = "proveedor";
export function menuListaCompra(event){
    // const proveedorSelect = document.querySelector("proveedor");
    
    const dataid = event.currentTarget.getAttribute('data-id');
    console.log(dataid);
    const [funcion, id1, id2, proveedor, lote] = dataid.split(','); //id1 = id del registro,   id2= id empresa
    console.log(proveedor);
    const formuu = document.querySelector(`#alerta`);
    idpedido = id1;
    console.log(idpedido);
    console.log(formuu);
    switch (funcion) {
        case "eliminar_listaCompra":
            console.log(formuu);
            eliminar_listaCompra(id1,id2,formuu);
            break;
        case "comprarListaSolicitud":
        compras = []; 
        currentId = 0;
            console.log("estoy vivoooo");
        const vistaPrincipal = document.querySelector("#contenedorGenerarListaSolicitudes");
        const vistapedido = document.querySelector("#verLista");
        vistaPrincipal.style.display = 'none';
        vistapedido.style.display = 'block';
         idRegistro = id1;
         idRegEdit = id1;
         console.log(id1);
            vistaVerLista(id1);
            console.log(id1);
            vistaProveedorMaterial();
            modalVistaProveedorMaterial();
            vistaEnEsperaCompra(id1);
            formularioCompra(id1);
            listarProveedorSelect(proveedorSelect)
            .then(() =>listarMaterial(`material${codigo}`))
            .then(() =>  listarTipo_envase(`tipoEnvase${codigo}`))
            .then(() =>   listarmedida(`medida${codigo}`))
            .then(() => {
                mostrarCompras();
                listar_compraPorProveedor(id1);
                listaCompraEnEspera(id1);
                comprarListaSolicitud(id1);
                listarProveedorDeMateriales(id1);
                listarProveedorDeMaterialesModal(id1);
                 SumaTotalCompra(id1);
                console.log(compras);
                const forme = document.querySelector(`#formularioCompraProveedor${codigo}`);
                console.log(forme);
                forme.addEventListener("submit", (e) => comprarPorProveedor(e, forme,id1));
                forme.reset();
            }).catch(error => {
                console.error('Error en la cadena de promesas:', error);
            });
            break;
        // Agrega otros casos según sea necesario
        case "ver_listaCompra":           
             vistaVerLista(id1); // esto es la vista de la ventana completa de la lista
             verListaCompra(id1); //lista de la api 
             break;
        case "eliminar_compraEspera":
            console.log(formuu);
            eliminar_compraEspera(id1,id2,formuu, idRegistro);
                break;  
        case "ver_listaCompraRealizada":       
        const vistaCompraRealizada = document.querySelector("#contenedorGenerarListaSolicitudes");
        const vistaOjitoCompraRealizada = document.querySelector("#ojitoCompraRealizada");
        vistaCompraRealizada.style.display = 'none';  
        vistaOjitoCompraRealizada.style.display = 'block';
                  ojitoListaCompraRealizada(true);
                  cuerpoListaDetalleCompra(id1);
                  break;
        case "ver_listaCompraRealizada2":       
        const vistaCompraRealizada2 = document.querySelector("#contenedorGenerarListaSolicitudes");
        const vistaOjitoCompraRealizada2 = document.querySelector("#ojitoCompraRealizada");
        const vistaEnEspera2 = document.querySelector("#compraPorProveedorEnEspera");
        vistaEnEspera2.style.display = 'none';  
        vistaOjitoCompraRealizada2.style.display = 'block';
            ojitoListaCompraRealizada(false);
            cuerpoListaDetalleCompra(id1);
            break;
        case "editar_compra_espera": 
        loteGeneral = lote;    
        proveedorGeneral = proveedor;
        console.log(proveedor);  
        idcompra = idpedido;
        console.log(idpedido);
        console.log(idRegistro);
        const vistaEditar= document.querySelector("#vistaEditarCompraEspera");
        const vistaEnEspera = document.querySelector("#compraPorProveedorEnEspera");
        vistaEnEspera.style.display = 'none'; 
        vistaEditar.style.display = 'block';
        listarEdicionCompraEspera(idpedido, idRegistro, proveedorGeneral, loteGeneral);
        // listarmedida()
        // listarMaterial2()
        // .then(() =>  listarTipo_envase2())
        // .then(() =>   listarmedida2())
        listarProveedorSelect("proveedorEd", proveedorGeneral)
        listarMaterial(`materialEd${codigo}`)
        .then(() =>  listarTipo_envase(`tipoEnvaseEd${codigo}`))
        .then(() =>   listarmedida(`medidaEd${codigo}`))
        // listarMaterial2()
        // .then(() =>  listarTipo_envase())
        // .then(() =>   listarmedida2())
        .then(() => {
            console.log(idpedido);
            listar_compraPorProveedorEdit(idpedido);
            SumaTotalCompraEdit(idpedido);
            // listar_ListaCompra_Editable(idpedido);
             const formEdit = document.querySelector(`#formularioCompraEditar${codigo}`);
            // console.log(formEdit);
            formEdit.addEventListener("submit", (e) => formularioEditarSoli(e, formEdit,idpedido));
            formEdit.reset();
        });
        break;
        case "eliminar_listaCompraSoli_edit":
            // idpedido = id1;
            console.log(idpedido);
            console.log(idRegistro);
            console.log(idcompra);
            console.log(formuu);
            eliminar_listaCompraSoli_edit(id1,id2,formuu,idcompra);
            break;
        case "eliminar_listaCompraSoli":
            console.log(idpedido);
            console.log(idRegistro); //siii
            console.log(idcompra);
            console.log(formuu);
            eliminar_listaCompraSoli(id1,id2,formuu,idRegistro);
            break;
        case "editarListaCompraSoli":
            console.log(idRegEdit);
            editarListaCompraSoli(event,idRegEdit);
        break;
        case "editarListaCompraSoli_Edicion":
            //cambiar el idRegEdit
            console.log(idRegistro);
            console.log(idpedido);
            console.log(idcompra);
            editarListaCompraSoli_Edicion(event,idcompra);
        break;
        default:
            // Manejo para casos no coincidentes
           sitio();
            break;
    }

}
function vistaProveedorMaterial(){
    console.log("soy vista de proveedor  Material");
    let listar = document.querySelector("#vistaProveedorMaterial");
    let view = `  
    <button id="btnRetroceder" class="btn btn-primary" style="float: left;">
            <i class="bi bi-arrow-left"></i> VOLVER
    </button>  
    <br>
    <h1 class="text-center" id = "tituloLista">Lista de Proveedores</h1>
    <p>${idRegistro}</p>
        <table class="table mt-4 table-hover" id = "tablaCuerpo">
            <thead id=lcompra>
                <tr class="table-dark">
                    <th scope="col">N°</th>
                    <th scope="col">Proveedor</th>
                    <th scope="col">Material</th>
                    <th scope="col">Telefono</th>
                    <th scope="col">Direccion</th>
                </tr>
            </thead>
            <tbody id="contenidoListaProveedor">  
                <!-- Filas de datos aquí -->
            </tbody>
        </table>

                `;
                
    listar.innerHTML = view;
    const btnRetroceder = document.querySelector('#btnRetroceder');
    const vistaListaPedido = document.querySelector('#listaCompraPedido');
    const vistaProveedores = document.querySelector("#vistaProveedorMaterial");
    const vistapedido = document.querySelector("#verLista");
    console.log(vistaListaPedido);
    const vistaProveedorMaterial = document.querySelector('#vistaProveedorMaterial')
    btnRetroceder.addEventListener('click', () => {
        
        vistaProveedores.style.display = 'none'; 
        vistapedido.style.display = 'block'; 
         
    });
}

function listarProveedorDeMateriales(id1){ 
    console.log("estoy dentro de Lista Proveedor Material");  
    const listarr=document.querySelector("#contenidoListaProveedor");
        fetch(`${URL_APIP}/api/listarProveedorDeMateriales/${uk[0].empresa.idempresa}/${id1}`)
        .then(res=>res.json())
        .then(data=>{
            let view="",ind=1;
            console.log(data);
            data.map(lista=>{
    
                console.log("===============");

                let idProveedor = Number(lista.nombre_proveedor);
                let idMaterial = Number(lista.nombre_material);

                let itemMaterial = materialArray.find(item => item.id === idMaterial);
                let itemProveedor = proveedorArray.find(dat => dat.id == idProveedor);        
                view+=`
                <tr id = "cuerpoLista">
                    <td>${ind++}</td> 
                    <td>${itemProveedor.nombre}</td>               
                    <td>${itemMaterial.nombre} </td>
                    <td>${itemProveedor.telefono} </td>
                    <td>${itemProveedor.direccion}</td>
                </tr>
                `;
            })
            listarr.innerHTML=view;
            console.log(listarr);
            const enlaces = document.querySelectorAll(".btn");
            enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuListaCompra);
            });
            
        })
        console.log("estoy dentro de veerrrr");
    }

function vistaVerLista(id1){
    console.log("estoy en vistaVErListaaa");
    let listar = document.querySelector("#verLista");
    
    idRegistro = id1;
    let view = ` 
       <button id="btnAtrass" class="btn btn-primary" style="float: left;">
            <i class="bi bi-arrow-left"></i> VOLVER
        </button>  
        <br>
    <h1 class="text-center" id = "tituloLista">Lista de pedido</h1>
    <p>${idRegistro}</p>
        <table class="table mt-4 table-hover" id = "tablaCuerpo">
            <thead id=lcompra>
                <tr class="table-dark">
                    <th scope="col">N°</th>
                    <th scope="col">Material</th>
                    <th scope="col">Cantidad envases</th>
                    <th scope="col">Tipo envase</th>
                    <th scope="col">Contenido envase</th>
                    <th scope="col">Total</th>
                </tr>
            </thead>
            <tbody id="contenidoListaPedido">  
                <!-- Filas de datos aquí -->
            </tbody>
        </table>
            <button id="btnComprar" class="btn btn-success" style="float: right;">
                <i class="bi bi-send"></i> Generar Compra
            </button>
            <button id="btnVerificarProveedor" class="btn btn-success" style="float: right;">
                <i class="bi bi-send"></i> Verificar Proveedor
            </button>
            <button id="btnVerCompra" class="btn btn-success" style="float: right;">
                <i class="bi bi-send"></i> Ver Compra
            </button>


                `;
                
    listar.innerHTML = view;
    const vistaPrincipal = document.querySelector("#contenedorGenerarListaSolicitudes");
    vistaPrincipal.style.display = 'none';
    // ------------------
    const btnVerCompra = document.querySelector("#btnVerCompra");
    const btnGenerarCompra = document.querySelector("#btnComprar");
    const btnVerificarProveedor = document.querySelector("#btnVerificarProveedor");
    
    const btnMostrar1 = document.getElementById('btnMostrar11');
    const vistaCompra = document.querySelector("#vent");
    const vistaEnEsperaCompra = document.querySelector("#compraPorProveedorEnEspera");
    const vistapedido = document.querySelector("#verLista");
    const vistaForm = document.querySelector("#vistaFormularioCompra");
    // const vistaFormu = document.querySelector("#vent");
    const vistaProveedores = document.querySelector("#vistaProveedorMaterial");
    console.log(vistapedido);
    const vistaVer = document.querySelector("#listaCompraPedido");
    console.log(vistaVer);
    console.log(vistaCompra);
idRegistro = id1;
console.log(idRegistro);

const vistaPrincipall = document.querySelector("#contenedorGenerarListaSolicitudes");
const btnAtras = document.querySelector("#btnAtrass");
btnVerCompra.addEventListener('click', () => {
    console.log("soy boton VEr Compra");
    vistaEnEsperaCompra.style.display = 'block'; 
    vistapedido.style.display = 'none';    
     
});

// const btnGenerarCompra = document.querySelector("#btnComprarRegreso");
//     btnGenerarCompra.addEventListener('click', () => {
//         vistaFormu.style.display = 'block'; 
//         vistaEnEspera.style.display = 'none'; 
         
//     });

    btnGenerarCompra.addEventListener('click', () => {
        console.log("soy boton generar");
        vistaCompra.style.display = 'block'; 
        vistapedido.style.display = 'none';    
         
    });
    btnVerificarProveedor.addEventListener('click', () => {
        
        vistaProveedores.style.display = 'block'; 
        vistapedido.style.display = 'none'; 
         
    });
    btnMostrar1.addEventListener('click', () => {
        contenedor1.style.display = 'block';
        contenedor2.style.display = 'none';
    });
    btnAtras.addEventListener('click', () => {
        console.log("soy boton atras");
        // vistaEnEsperaCompra.style.display = 'block'; 
        vistaPrincipall.style.display = 'block'; 
        vistapedido.style.display = 'none';    
         
    });
    console.log("ultima linea de vista Ver LIsta");
}

export function comprarListaSolicitud(id1){
console.log("estoy dentro de comprarListaSolicitud");  
console.log(id1);
const listarr=document.querySelector("#contenidoListaPedido");
console.log(listarr);
    fetch(`${URL_APIP}/api/ver_listaCompra/${uk[0].empresa.idempresa}/${id1}`)
    .then(res=>res.json())
    .then(data=>{
        let view="",ind=1;
        console.log(data);
        console.log(envaseArray);
        console.log(materialArray);
        console.log(medidaArray);
        data.map(lista=>{

            let idMaterial = Number(lista.material);
            let idEnvase = Number(lista.tipoEnvase);
            // let idMedida = Number(lista.medida);
            let itemEnvase = envaseArray.find(obj => obj.id == idEnvase);
            let itemMaterial = materialArray.find(item => item.id === idMaterial);
            // let itemMedida = medidaArray.find(dat => dat.id === idMedida);
            let itemMedida = medidaArray.find(item => item.id === itemMaterial.medida);
            console.log(itemMedida);
            
            view+=`
             <tr id = "cuerpoLista">
                <td>${ind++}</td> 
                <td>${itemMaterial.nombre}</td>               
                <td>${lista.cantidadEnvase} </td>
                <td>${itemEnvase.nombre} </td>
                <td>${lista.contenidoEnvase} ${itemMedida.nombre} </td>
                <td>${lista.total_material}</td>
            </tr>
            <p>${id1}</p>
            `;
        })

        listarr.innerHTML=view;
        console.log(listarr);
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuListaCompra);
        });
        
    })
    console.log("estoy dentro de veerrrr");
    console.log(id1);
}

function listaPedidos(){
    
    const listar=document.querySelector("#contenedorSoli");
    let view =  `
    <table class="table table-hover mt-4">
        <thead>
            <tr class="table-dark">
            <th scope="col">N°</th>
            <th scope="col">Fecha solicitud</th>
            <th scope="col">Hora solicitud</th>
            <th scope="col">Empleado</th>
            <th scope="col">Estado</th>
            <th scope="col">Funciones</th>
            </tr>
        </thead>
        <tbody id=listaPedidoSoli>
        
        </tbody>
    </table>`
    listar.innerHTML=view;
}
function listar_PedidoCompra(){
    const listarr=document.querySelector("#listaPedidoSoli");
   fetch(`${URL_APIP}/api/listar_PedidoCompra/${uk[0].empresa.idempresa}`)
   .then(res=>res.json())
   .then(data=>{
       // data.length = 0;
       let view="",ind=1;
       console.log(data);
    //    console.log(empleado);
        data.map(lista=>{
            // console.log(empleado);
            let itemEmpleado = empleado.find(item => Number(item.id) == Number(lista.empleado));  
            // console.log(itemEmpleado);  
    let estadoPedido = lista.estado;
    if(lista.estado == 0){
        estadoPedido = "Pendiente";
        view+=`
        <tr>
           <td>${ind++}</td> 
           <td>${lista.fecha}</td>               
           <td>${lista.hora} </td>
          <td>${itemEmpleado.nombre} ${itemEmpleado.apellido}</td>
           <td>${estadoPedido} </td>

          <td>                
               
               <a data-id="comprarListaSolicitud,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-success" style="color: white;" title="Comprar">
                   <i class="bi bi-cart-fill"></i>
               </a> 
               
          </td>
       </tr>
       `;
    }else{
        estadoPedido = "Finalizado";
        view+=`
        <tr>
           <td>${ind++}</td> 
           <td>${lista.fecha}</td>               
           <td>${lista.hora} </td>
             <td>${itemEmpleado.nombre} ${itemEmpleado.apellido}</td>
           <td>${estadoPedido} </td>

          <td>                
               <a data-id="comprarListaSolicitud,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
                   <i class="bi bi-pencil" style="color: white;"></i>
               </a>
          </td>
       </tr>
       `;
    }
        })
    //    console.log(view);
       listarr.innerHTML=view;

       const enlaces = document.querySelectorAll(".btn");
       enlaces.forEach(enlace => {
       enlace.addEventListener("click", menuListaCompra);
       });
       
   })
}
export function formularioCompra(idRegistro){
    console.log("estoy dentro de formulario Compraaa");
    console.log(idRegistro);
    const listar = document.querySelector("#vent");

    let view = `
    <div id="vistaFormularioCompra" >
       <button id="btnAtrasFormu" class="btn btn-primary" style="float: left;">
            <i class="bi bi-arrow-left"></i> VOLVER
        </button>  
        <button id="btnVerificarProveedorr" class="btn btn-success" style="float: right;">
            <i class="bi bi-send"></i> Verificar Proveedor
        </button>
        <br>
    <h5 class="text-center">Compras</h5>
<p>${idRegistro}</p>
    <form action="" class="row" id="formularioCompraProveedor${codigo}">
    <input type="hidden" name="verDavid" value="registrar_Compra_Proveedor">
        <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
        <input type="hidden" class="form-control" name="idpedido" id="idpedido" value="${idRegistro}">

        
        <div class="row">

            <div class="col">
                <label for="">Fecha vencimiento</label>
                <input type="date" class="form-control" id ="fechaVenci" name = "fechaVenci" required>
            </div>
        </div>

        <div class="row">
            
  
            <div class="col-md-6">
                <div class="form-group">
                    <label for="material">Seleccione un Material</label>
                    <select class="form-select" id="material${codigo}" name="material"> </select>
                </div>
            </div>
  
        </div>

        <div class="row">
            <div class="form-group">          
                <label for="tipoEnvase">Tipo envase</label>
                <select class="form-select" id="tipoEnvase${codigo}" name="tipoEnvase"> </select>
            </div>

            <div class="col">
                <label for="">Contenido</label>
                <input type="text" class="form-control" id="contenido" name= "contenido">
            </div>

            <div class="form-group">
                <label for="medida">Medida</label>
                <input type="text" class="form-control" id="medidaSoli" name="medida" readonly>
            </div>

            <div class="col">
                <label for="">Cantidad</label>
                <input type="text" class="form-control" id="cantidad" name="cantidad">
            </div>
             <div class="col">
                <label for="">Precio Unitario</label>
                <input type="text" class="form-control" id="precioUni" name="precioUni">
            </div>
        </div>
        <div class="row">
            <div class="col">
             <button class="btn btn-success mt-4" type="" style="float: right;">
                <i class="bi bi-plus fs-3"> Añadir</i>
            </button>


            </div>
        </div>        
    </form>
    <table class="table table-hover" id= "editableTableSoli${codigo}">
        <thead>
            <tr class="table-dark">
                <th>N°</th>
                <th>Material</th>
                <th>Cantidad</th>
                <th>Envase</th>
                <th>Contenido</th>
                <th>Precio unitario</th>
                <th>Precio total</th>
                <th>Fecha vencimiento</th>
                <th>Funciones</th>
            </tr>
        </thead>
        <tbody id="listarCompraPorProveedorBoddy">
        </tbody>
    </table>
    <div>
        
        <form action="" class="row" id="formularioCompra${codigo}">
            <input type="hidden" name="verDavid" value="registrarCompra">
            <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
             <input type="hidden" name="usuario" value="${uk[0].idusuario}">
            <input type="hidden" class="form-control" name="idpedido" id="idpedido" value="${idRegistro}">
            <div class="row">

               <div class="row g-3" >
                    <div class="col-auto" id = "totalSuma">
                    
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="col">
                        <label for="">Fecha Registro</label>
                        <input type="date" class="form-control" id ="fechaReg" name = "fechaReg">
                    </div>
                    <div>
                        <label for="proveedor">Seleccione un Proveedor</label>
                        <select class="form-select" id="proveedor" name="proveedor"> </select>
                    </div>
                </div>
                <div class="col"> 
                    <label for="lote">Lote</label>
                    <input type="text" class="form-control" id="lote" name="lote" value= "${generarLoteCompra()}" >


            </div>
            </div>
        <div class="row">
            <div class="col">
                <button class="btn btn-success mt-4" type="" style="float: right;" id="btnRegistrarCompra">
                    <i class="bi bi-send"></i> Registrar Compra
                </button>
            </div>
        </div>
        </form>   
    <button id="cancelarListaFormulario" class="btn btn-primary">
        <i class="bi bi-x-circle"></i> Cancelar Lista
    </button>
    </div>
    </div>

    `

    listar.innerHTML=view;
    const vistapedido = document.querySelector("#verLista");
    const vistaForm = document.querySelector("#vent");

    const vistaProveedores = document.querySelector("#modalVistaProveedorMaterial");
    const btnVerificarProveedorr = document.querySelector("#btnVerificarProveedorr");
    btnVerificarProveedorr.addEventListener('click', () => {
        
        vistaProveedores.style.display = 'block'; 
        vistaForm.style.display = 'none'; 
         
    });

    const table = document.getElementById(`editableTableSoli${codigo}`);
    console.log(table);
    console.log(idRegistro);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e, idRegistro));

    const btnAtrasForm = document.querySelector("#btnAtrasFormu");
    const vistaEnEspera = document.querySelector("#compraPorProveedorEnEspera");
    const vistaFormu = document.querySelector("#vent");
    const btnGenerarCompra = document.querySelector("#btnComprarRegreso");
    btnAtrasForm.addEventListener('click', () => {
    vistaFormu.style.display = 'none'; 
    vistapedido.style.display = 'block'; 
     
});

    const btnCancelar = document.querySelector('#cancelarListaFormulario');
    btnCancelar.addEventListener('click', () => {
        cancelarListaCompraForm(idRegistro);
    });
     const formu = document.querySelector(`#formularioCompra${codigo}`);
     let formularioo = formu;
     console.log(formularioo);
     const btnCompra = document.querySelector('#btnRegistrarCompra');
     //--------------------------------------------------

     const selectopciones = document.querySelector(`#material${codigo}`);
     console.log(selectopciones);
     selectopciones.addEventListener("change", function() {
         mostrarSeleccionSoli();
     });

     btnCompra.addEventListener('click', () => {
        console.log(formularioo);
        const fechaReg = document.querySelector('#fechaReg');
        const fechaEstaVacia = fechaReg.value;
        // if(fechaEstaVacia ==""){
        //     console.log("la fecha esta vacia");
        // }else{
        //     console.log(fechaEstaVacia.value);
        //       
     formularioo.addEventListener("submit", (e) => registrarCompra(e, formularioo,idRegistro,fechaEstaVacia));
    });
}
function mostrarSeleccionSoli(){
    const medida = document.querySelector(`#material${codigo}`).value;
    console.log(materialArray);
    let itemMaterial = materialArray.find(item => item.id == medida);
    console.log(medida);
    let itemMedida = medidaArray.find(item => item.id == itemMaterial.medida);
    console.log(itemMaterial.medida);
    document.getElementById("medidaSoli").value = itemMedida.nombre;
}
function sitio(mostrarContenedor2 = true){
    console.log("estoy en sitioooo");
    let view=`
    <div class="container" id = "contenedorGenerarListaSolicitudes">
    <h1 class="text-center">Lista solicitudes</h1>
        <button id="btnMostrar11" class="btn btn-primary">Lista Solicitudes</button>
        <button id="btnMostrar22" class="btn btn-success">Compras Realizadas</button>

        <div class="container mt-3" id="contenedorSoli">
        </div>
        <div class="container mt-3" id="contenedor22" style="display: none;">
     
        </div>
    </div>

        <div class="container mt-3" id="verLista">

        </div>
        
        <div id = "vent" style="display: none;">
        
        </div>
        <div id = "compraPorProveedorEnEspera" style="display: none;">
        
        </div>
        <div id = "vistaProveedorMaterial" style="display: none;">
        
        </div>
        <div class="container mt-3" id = "ojitoCompraRealizada">

        </div>
        <div class="container mt-3" id="vistaEditarCompraEspera" style="display: none;">
         
            </div> 
         <div id = "modalVistaProveedorMaterial" style="display: none;">
        
        </div>
        
`;
app.innerHTML=view;
    // -----------------------------------------------------------------------------
    listaPedidos();
    getempleado();
    vistaListaCompraRealizada1();

    listarProveedor()
    .then(() => {
        listar_PedidoCompra();
        listarMaterial2();
        listarmedida2();
        listaCompraRealizada2();
    })
      
    // vistaEnEsperaCompra();
     const btnMostrar1 =document.querySelector("#btnMostrar11");
     const btnMostrar2 =document.querySelector("#btnMostrar22");
     const contenedor1 =document.querySelector("#contenedorSoli");
     const contenedor2 =document.querySelector("#contenedor22");
    btnMostrar1.addEventListener('click', () => {
        contenedor1.style.display = 'block';
        contenedor2.style.display = 'none';
    });
    btnMostrar2.addEventListener('click', () => {
        contenedor1.style.display = 'none';
        contenedor2.style.display = 'block';
    });
}
export function mostrarCompras() {
    const comprasTableBody = document.getElementById('listarCompraPorProveedorBoddy');
    comprasTableBody.innerHTML = '';
    console.log(compras);
    compras.forEach(compra => {
        // let medidaAux = Number(compra.medida);
        if(!isNaN(parseFloat(compra.medida)) && isFinite(compra.medida)){
            console.log(compra.medida);
            console.log(medidaArray);
            let itemMedida = medidaArray.find(item => item.id == compra.medida);
            console.log(itemMedida);
            compra.medida = itemMedida.nombre;
        }
        console.log(compra);
        let itemMaterial = materialArray.find(item => item.id == compra.material);
        let itemEnvase = envaseArray.find(item => item.id == compra.tipoEnvase);
        // let itemMedida = medidaArray.find(item => item.id === compra.medida);
        const row = document.createElement('tr');
    //     view+=`
    //    <tr>
        row.innerHTML =
         `
            <td>${compra.id}</td>
            <td data-type="${compra.id},material">${itemMaterial.nombre}</td>
            <td data-type="${compra.id},cantidad">${compra.cantidad}</td>
            <td data-type="${compra.id},tipoEnvase">${itemEnvase.nombre}</td>
            <td data-type="${compra.id},contenido">${compra.contenido} ${compra.medida}</td>
            <td data-type="${compra.id},precioUni">${compra.precioUni}</td>
            <td data-type="${compra.id},precio_total">${compra.precio_total}</td>
             <td data-type="${compra.id},fechaVenci">${compra.fechaVenci}</td>
                
                <td>
                  <a data-id="editarListaCompraSoli,${compra.id}" class="btn btn-primary btn-sm" title="Editar">
                       <i class="bi bi-pencil-square"></i>
                   </a> 

                   <a data-id="eliminar_listaCompraSoli,${compra.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
                       <i class="bi bi-trash"></i>
                   </a> 
                                              
               </td>
        `;
        comprasTableBody.appendChild(row);
        console.log(comprasTableBody);
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuListaCompra);
        });

    });
    // <td data-type="${nuevaCompra.id},material">${itemMaterial.nombre}</td>               
    // <td data-type="${nuevaCompra.id},cantidad">${nuevaCompra.cantidad} </td>
    // <td data-type="${nuevaCompra.id},tipoEnvase">${itemEnvase.nombre} </td>
    // <td data-type="${nuevaCompra.id},contenido">${nuevaCompra.contenido} ${itemMedida.nombre} </td>
    // <td data-type="${nuevaCompra.id},precioUni">${nuevaCompra.precioUni} </td>
    // <td data-type="${nuevaCompra.id},precio_total">${nuevaCompra.precio_total} </td>
    // <td data-type="${nuevaCompra.id},fechaVenci"> ${nuevaCompra.fechaVenci} </td>
//     view+=`
//     <tr>
//        <td>${ind++}</td>           
//        <td data-type="${lista.id},material,${uk[0].empresa.idempresa}">${itemMaterial.nombre}</td>               
//        <td data-type="${lista.id},cantidad,${uk[0].empresa.idempresa}">${nuevaCompra.cantidad} </td>
//        <td data-type="${lista.id},tipoEnvase,${uk[0].empresa.idempresa}">${itemEnvase.nombre} </td>
//        <td data-type="${lista.id},contenido,${uk[0].empresa.idempresa}">${nuevaCompra.contenido} ${itemMedida.nombre} </td>
//        <td data-type="${lista.id},precioUni,${uk[0].empresa.idempresa}">${nuevaCompra.precioUni} </td>
//        <td data-type="${lista.id},precio_total,${uk[0].empresa.idempresa}">${nuevaCompra.precio_total} </td>
//        <td data-type="${lista.id},fechaVenci,${uk[0].empresa.idempresa}"> ${nuevaCompra.fechaVenci} </td>
      
//        <td>
//            <a data-id="editarListaCompraSoli,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
//                <i class="bi bi-pencil-square"></i>
//            </a>  
//            <a data-id="eliminar_listaCompraSoli,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
//                <i class="bi bi-trash"></i>
//            </a> 
                                      
//        </td>
//    </tr>
//    `;
}
export function comprarPorProveedor(e, form,id1) {
    e.preventDefault();
    console.log("estoy dentro de comprar por proveedor");
    console.log(compras);
    // const id = document.getElementById('compraId').value;
    const material = document.getElementById(`material${codigo}`).value;
    const tipoEnvase = document.getElementById(`tipoEnvase${codigo}`).value;
    const medida = document.getElementById(`medidaSoli`).value;
    const contenido = document.getElementById('contenido').value;
    const cantidad = document.getElementById('cantidad').value;
    const precioUni = document.getElementById('precioUni').value;
    const fechaVenci = document.getElementById('fechaVenci').value;
    const precio_total = precioUni * cantidad;
    // console.log(id);
    // if (id) {
    //     // Editar compra existente
    //     const compra = compras.find(compra => compra.id == id);
    //     compra.producto = producto;
    //     compra.cantidad = cantidad;
    //     compra.precio = precio;
    // } else {
        // Crear nueva compra
        const nuevaCompra = {
            id: ++currentId,
            material,
            tipoEnvase,
            medida,
            contenido,
            cantidad,
            precioUni,
            precio_total,
            fechaVenci
        };
        compras.push(nuevaCompra);
    // }
    console.log(compras);
    // document.getElementById('compraForm').reset();
    // document.getElementById('compraId').value = '';
    mostrarCompras();
    
    console.log(id1);
    console.log(form);
    const dato = new FormData(form);
    // const usarRegistroDavid = ('David' == 'David').toString();
    // console.log(typeof(usarRegistroDavid));
    console.log(dato);
        // fetch(`${URL_APIP}/api/`,{
        //     method:"POST",
        //     body:dato,
            
        //     headers: {
        //         'Usar-Registro-David': 'true'
        //     }
           
        // })
        // .then(res=>res.json())
        // .then(data=>{
        //     console.log(data);
        //     if(data[0]=="success"){
        //         form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                
        //         setTimeout(() => {                   
        //              form.reset();
        //             formularioCompra(id1);
        //     listarProveedorSelect(proveedorSelect)
        //     .then(() =>listarMaterial(`material${codigo}`))
        //     .then(() =>  listarTipo_envase(`tipoEnvase${codigo}`))
        //     .then(() =>   listarmedida(`medida${codigo}`))
        //     .then(() => {
        //         // comprarListaSolicitud(id1); 
        //         listar_compraPorProveedor(id1);
        //         listaCompraEnEspera(id1);
        //         comprarListaSolicitud(id1);
        //          SumaTotalCompra(id1);
        //         const forme = document.querySelector(`#formularioCompraProveedor${codigo}`);
        //         console.log(forme);
        //         forme.addEventListener("submit", (e) => comprarPorProveedor(e, forme,id1));
        //         forme.reset();
        //     }).catch(error => {
        //         console.error('Error en la cadena de promesas:', error);
        //     });

        //         }, 2000);
        //         return;
        //     }else{
        //     form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
        //     setTimeout(() => {
        //         form.remove();
        //         // sitio();
        //         //  formularioCompra(id1);
        //     }, 3000);
        //     return;
        // }
        // })       
}
// let totalCompra= 0;
export function listar_compraPorProveedor(id1){
    // let totalCompra= 0;
    console.log(compras);
    const listarr=document.querySelector("#listarCompraPorProveedorBoddy");
//    fetch(`${URL_APIP}/api/listar_compraPorProveedor/${uk[0].empresa.idempresa}/${id1}`)
   fetch(`${URL_APIP}/api/listar_ListaCompraEditable/${id1}/${uk[0].empresa.idempresa}`, {
    headers: {
        'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
    }
})
   .then(res=>res.json())
   .then(data=>{
    // let totalCompra = 0;
       // data.length = 0;
       console.log(data);
       console.log(compras);
       let view="",ind=1;
       console.log(id1);
       console.log(data);
       ListaCompra_Soli = data;
    //    compras = data;
       console.log(compras);

       data.map(lista=>{
           // listaCompra.push(lista);
        // Crear nueva compra
        const nuevaCompra = {
            id: ++currentId,
            material: lista.material2,
            tipoEnvase: lista.tipoEnvase2,
            cantidad: lista.cantidadEnvase,
            contenido: lista.contenidoEnvase, 
            precioUni: 0,
            fechaVenci: "00-00-0000",
            medida: lista.medida2,
            precio_total: 0
        };
        compras.push(nuevaCompra);
        console.log(compras);

           console.log("===============")
           console.log(envaseArray);
           console.log(materialArray);
           console.log(medidaArray);
           let idMaterial = Number(nuevaCompra.material);
           let idEnvase = Number(nuevaCompra.tipoEnvase);
        //    let idMedida = Number(nuevaCompra.medida);
           
           let itemEnvase = envaseArray.find(obj => obj.id == idEnvase);
           let itemMaterial = materialArray.find(item => item.id === idMaterial);
        //    let itemMedida = medidaArray.find(dat => dat.id === idMedida);
           let itemMedida = medidaArray.find(item => item.id === itemMaterial.medida);
           nuevaCompra.medida = itemMedida.nombre;
           console.log(itemMaterial);
           console.log(nuevaCompra);
           view+=`
            <tr>
               <td>${ind++}</td>           
               <td data-type="${nuevaCompra.id},material">${itemMaterial.nombre}</td>               
               <td data-type="${nuevaCompra.id},cantidad">${nuevaCompra.cantidad} </td>
               <td data-type="${nuevaCompra.id},tipoEnvase">${itemEnvase.nombre} </td>
               <td data-type="${nuevaCompra.id},contenido">${nuevaCompra.contenido} ${itemMedida.nombre} </td>
               <td data-type="${nuevaCompra.id},precioUni">${nuevaCompra.precioUni} </td>
               <td data-type="${nuevaCompra.id},precio_total">${nuevaCompra.precio_total} </td>
               <td data-type="${nuevaCompra.id},fechaVenci"> ${nuevaCompra.fechaVenci} </td>
              
               <td>
                   <a data-id="editarListaCompraSoli,${nuevaCompra.id}" class="btn btn-primary btn-sm" title="Editar">
                       <i class="bi bi-pencil-square"></i>
                   </a>  
                   <a data-id="eliminar_listaCompraSoli,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
                       <i class="bi bi-trash"></i>
                   </a> 
                                              
               </td>
           </tr>
           `;
 
       })

       listarr.innerHTML=view;
       const enlaces = document.querySelectorAll(".btn");
       enlaces.forEach(enlace => {
       enlace.addEventListener("click", menuListaCompra);
       });
       
   })
   console.log(compras);
}
export function SumaTotalCompra(id1){
     let totalCompra= 0;
    let listaCompraProveedor = [];
    const listarr=document.querySelector("#totalSuma");
   fetch(`${URL_APIP}/api/listar_compraPorProveedor/${uk[0].empresa.idempresa}/${id1}`)
   .then(res=>res.json())
   .then(data=>{
       let view="",ind=1;
       console.log(data);
       data.map(lista=>{
           console.log("===============")
           let precioTotalNumber = Number(lista.precio_total);
           totalCompra = totalCompra + precioTotalNumber;
       })
       console.log(totalCompra);
       console.log(listaCompraProveedor);
       view= `
       <label for="total">Total:</label>
       <input type="text" class="form-control" id="total" name = "totalSuma" value = "${totalCompra}" readonly>
       `;
       listarr.innerHTML = view;  
         
   })

}
export function vistaEnEsperaCompra(id1){
    console.log("estoy en vistaEnEsperaCompra");
    console.log(id1);
    const listar=document.querySelector("#compraPorProveedorEnEspera");
    let view =      `<div class="container">
        <button id="btnAtras" class="btn btn-primary" style="float: left;">
            <i class="bi bi-arrow-left"></i> VOLVER
        </button>  
        <br>
    <h1 class="text-center">Lista Compra por Proveedor</h1>
     <p>${id1}</p>
        <div id="alerta" class="mt-4"></div>
    <table class="table table-hover mt-4">
        <thead>
            <tr class="table-dark">
              <th scope="col">N°</th>
              <th scope="col">Fecha compra</th>
              <th scope="col">Hora compra</th>
               <th scope="col">Lote</th>
              <th scope="col">Empleado</th>
              <th scope="col">Proveedor</th>
              <th scope="col">Funciones</th>
            </tr>
          </thead>
          <tbody id=listaCompraEnEspera>
           
          </tbody>
    </table>
    <button id="btnComprarRegreso" class="btn btn-success" style="float: right;">
            <i class="bi bi-send"></i> Generar Compra
    </button>
 <form action="" class="row" id="formularioFinalizarCommpra${codigo}">
 <input type="hidden" name="verDavid" value="finalizarCompra">
            <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" class="form-control" name="idpedido" id="idpedido" value="${id1}">
        <button id="btnFinalizar" class="btn btn-success" style="float: right; width: 150px; height: 40px;">
            <i class="bi bi-send"></i> Finalizar Compra
        </button>

    </form>
</div>`
listar.innerHTML=view;
const vistaEnEspera = document.querySelector("#compraPorProveedorEnEspera");
const vistaFormu = document.querySelector("#vent");
const vistaPrincipal = document.querySelector("#contenedorGenerarListaSolicitudes");
const btnGenerarCompra = document.querySelector("#btnComprarRegreso");
    btnGenerarCompra.addEventListener('click', () => {
        vistaFormu.style.display = 'block'; 
        vistaEnEspera.style.display = 'none'; 
         
    });
    const btnFinalizar = document.querySelector("#btnFinalizar");
    btnFinalizar.addEventListener('click', () => {
        // registrarCompra(e, formu,idRegistro);
        vistaPrincipal.style.display = 'block'; 
        vistaEnEspera.style.display = 'none'; 
         
    });
    const formu = document.querySelector(`#formularioFinalizarCommpra${codigo}`);
    formu.addEventListener("click", (e) =>finalizarCompra(e, formu));


    const btnRetroceder = document.querySelector('#btnAtras');
    const vistaListaPedido = document.querySelector('#listaCompraPedido');
    const vistaProveedores = document.querySelector("#vistaProveedorMaterial");
    const vistaEnEsperaCompra = document.querySelector("#compraPorProveedorEnEspera");
    const vistapedido = document.querySelector("#verLista");
    console.log(vistaListaPedido);
    const vistaProveedorMaterial = document.querySelector('#vistaProveedorMaterial')
    btnRetroceder.addEventListener('click', () => {
        
        vistaEnEsperaCompra.style.display = 'none'; 
        vistapedido.style.display = 'block';  
         
    });

    // ----------------------------
   
    // btnGenerarCompra.addEventListener('click', () => {
    //     console.log("soy boton generar");
    //     vistaEnEsperaCompra.style.display = 'block'; 
    //     vistapedido.style.display = 'none';    
         
    // });

}

export function listaCompraEnEspera(id1){
    console.log(id1);
    const listarr=document.querySelector("#listaCompraEnEspera");
    console.log(listarr);
   fetch(`${URL_APIP}/api/listaCompraEnEspera/${uk[0].empresa.idempresa}/${id1}`)
   .then(res=>res.json())
   .then(data=>{
        // data.length = 0;
        
        let view="",ind=1;
        console.log(data);
         data.map(lista=>{
            //  getempleado(lista.empleado); 
            // console.log(getempleado(lista.empleado));
            let idProveedor = Number(lista.proveedor);
            let itemProveedor = proveedorArray.find(item => item.id == idProveedor);  
           
            // let idLote =  Number(lista.lote);
            // let itemProveedor = proveedorArray.find(item => item.id == idLote);  
            // console.log(empleado);
            
            let itemEmpleado = empleado.find(item => Number(item.id) == Number(lista.empleado));
              
                console.log(itemEmpleado);  
             view+=`
              <tr>
                 <td>${ind++}</td> 
                 <td>${lista.fecha}</td>               
                 <td>${lista.hora} </td>
                  <td>${lista.lote} </td>
                  <td>${itemEmpleado.nombre} ${itemEmpleado.apellido}</td>
                 <td>${itemProveedor.nombre} </td>
 
                <td>
                     <a data-id="ver_listaCompraRealizada2,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Visualizar Compra">
                         <i class="bi bi-eye" style="color: white;"></i>
                     </a>
                    <a data-id="editar_compra_espera,${lista.id},${uk[0].empresa.idempresa},${itemProveedor.nombre},${lista.lote}" class="btn btn-primary btn-sm" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </a>  
                    <a data-id="eliminar_compraEspera,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </a> 
                                               
                </td>
             </tr>
             `;
         })
     //    console.log(view);
        listarr.innerHTML=view;
        console.log(listarr);
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuListaCompra);
        });
   })
}

function registrarCompra(e,formu,id1,fechaEstaVacia) {
    console.log(id1);
    console.log("SOY LA PRIMERA EJECUCION DEL BOTON REGISTRAR COMPRA");
    e.preventDefault();
    const dato = new FormData(formu);
    console.log(dato);
    const now = new Date();
    const offset = -4; // Bolivia es UTC-4
    now.setHours(now.getHours() + offset);
    
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;
    dato.append('hora', currentTime);
    if(fechaEstaVacia ==""){
        console.log("la fecha esta vacia");
         // Obtener la fecha y hora actual en Bolivia
    // const now = new Date();
    // const offset = -4; // Bolivia es UTC-4
    // now.setHours(now.getHours() + offset);
    
    // const hours = String(now.getUTCHours()).padStart(2, '0');
    // const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    // const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    // const currentTime = `${hours}:${minutes}:${seconds}`;
    
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    dato.append('fecha', currentDate);
    console.log(dato);
    }else{
         console.log(fechaEstaVacia);
    }
           fetch(`${URL_APIP}/api/`, {
               method: "POST",
               body: dato,
               headers: {
                'Usar-Registro-David': 'true'
                }
           })
           .then(res => res.json())
           .then(data => {
            console.log(data);
               if(data[0] === "success"){
                   formu.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                   setTimeout(() => {
                   incrementable+=1;
                        formu.reset();
                        // vistaEnEsperaCompra()
                        // listaCompraRealizada2();
                        listaCompraEnEspera(id1);
                         // vistaEnEsperaCompra();
                         formularioCompra(id1);
            listarProveedorSelect(proveedorSelect)
            .then(() =>listarMaterial(`material${codigo}`))
            .then(() =>  listarTipo_envase(`tipoEnvase${codigo}`))
            .then(() =>   listarmedida(`medida${codigo}`))
            .then(() => {
                // comprarListaSolicitud(id1); 
                listar_compraPorProveedor(id1);
                listaCompraEnEspera(id1);
                comprarListaSolicitud(id1);
                // listaCompraRealizada2();
                const vistaFormularioCompra = document.querySelector("#vent");
                   const vistaEnEsperaCompraPorProveedor = document.querySelector("#compraPorProveedorEnEspera");
                   console.log("SOY LA SEGUMDA EJECUCION DEL BOTON REGISTRAR COMPRA");
                     vistaEnEsperaCompraPorProveedor.style.display = 'block'; 
                    vistaFormularioCompra.style.display = 'none';

                const forme = document.querySelector(`#formularioCompraProveedor${codigo}`);
                console.log(forme);
                forme.addEventListener("submit", (e) => comprarPorProveedor(e, forme,id1));
                forme.reset();
            }).catch(error => {
                console.error('Error en la cadena de promesas:', error);
            });
                    //    sitio(false);
                   }, 2000);
               }else{
                   formu.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                   setTimeout(() => {
                    formu.reset();
                    // vistaEnEsperaCompra()
                    listaCompraEnEspera(id1);
                     // vistaEnEsperaCompra();
                     formularioCompra(id1);
        listarProveedorSelect(proveedorSelect)
        .then(() =>listarMaterial(`material${codigo}`))
        .then(() =>  listarTipo_envase(`tipoEnvase${codigo}`))
        .then(() =>   listarmedida(`medida${codigo}`))
        .then(() => {
            // comprarListaSolicitud(id1); 
            listar_compraPorProveedor(id1);
            listaCompraEnEspera(id1);
            comprarListaSolicitud(id1);
            SumaTotalCompra(id1);
            const vistaFormularioCompra = document.querySelector("#vent");
                   const vistaEnEsperaCompraPorProveedor = document.querySelector("#compraPorProveedorEnEspera");
                   console.log("SOY LA SEGUMDA EJECUCION DEL BOTON REGISTRAR COMPRA");
                     vistaEnEsperaCompraPorProveedor.style.display = 'block'; 
                    vistaFormularioCompra.style.display = 'none'; 
            const forme = document.querySelector(`#formularioCompraProveedor${codigo}`);
            console.log(forme);
            forme.addEventListener("submit", (e) => comprarPorProveedor(e, forme,id1));
            forme.reset();
        }).catch(error => {
            console.error('Error en la cadena de promesas:', error);
        });
                   }, 2000);
                   
               }
           });
}
function finalizarCompra(e, form) {
    e.preventDefault();
    console.log(form);
    const dato = new FormData(form);
    console.log(dato);
        fetch(`${URL_APIP}/api/`,{
            method:"POST",
            body:dato,
            headers: {
                'Usar-Registro-David': 'true'
                }
        })
        .then(res=> res.json())
        .then(data=>{
             console.log(data);
            if(data[0]=="success"){
                form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                
                setTimeout(() => {                   
                     form.reset();
                     sitio(false);
                }, 2000);
                return;
            }else{
            form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
            setTimeout(() => {
                form.remove();
            }, 3000);
            return;
        }
        })       
}
function cancelarListaCompraForm(idRegistro){
    console.log("cancela listaCompra");
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/cancelarListaCompraForm/${idRegistro}`)
        .then(res=>res.json())
        .then(data=>{
            if(data[0]=="ok"){
                    setTimeout(() => {
                        // formu.reset();
                        // vistaEnEsperaCompra()
                        // listaCompraRealizada2();
                        listaCompraEnEspera(idRegistro);
                         // vistaEnEsperaCompra();
                         formularioCompra(idRegistro);
            listarProveedorSelect(proveedorSelect)
            .then(() =>listarMaterial(`material${codigo}`))
            .then(() =>  listarTipo_envase(`tipoEnvase${codigo}`))
            .then(() =>   listarmedida(`medida${codigo}`))
            .then(() => {
                // comprarListaSolicitud(id1); 
                listar_compraPorProveedor(idRegistro);
                listaCompraEnEspera(idRegistro);
                comprarListaSolicitud(idRegistro);
                // listaCompraRealizada2();
                const vistaFormularioCompra = document.querySelector("#vent");
                   const vistaEnEsperaCompraPorProveedor = document.querySelector("#compraPorProveedorEnEspera");
                   console.log("SOY LA SEGUMDA EJECUCION DEL BOTON REGISTRAR COMPRA");
                     vistaEnEsperaCompraPorProveedor.style.display = 'block'; 
                    vistaFormularioCompra.style.display = 'none';

                const forme = document.querySelector(`#formularioCompraProveedor${codigo}`);
                console.log(forme);
                forme.addEventListener("submit", (e) => comprarPorProveedor(e, forme,idRegistro));
                forme.reset();
            }).catch(error => {
                console.error('Error en la cadena de promesas:', error);
            });
                    }, 2000);
                    return;
                
               
            }else{
                setTimeout(() => {
                    sitio();
                }, 3000);
                return;
            }
            
        })
    }
}

export function getempleado(){
    fetch(`${URL_APIP}/api/getempleado/${uk[0].empresa.idempresa}`)
   .then(res=>res.json())
   .then(data=>{
    //    console.log(data);
        empleado = data;
        
        // console.log(empleado);
    // return empleado;       
   })
   
   console.log(empleado);
//    return empleado;   
}
function generarLoteCompra() {
    // listaCompraRealizada2();
    const prefijo = 'Lote';
    const now = new Date();
    const boliviaTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - 4 * 60 * 60000); 
    const year = boliviaTime.getUTCFullYear();
    const month = String(boliviaTime.getUTCMonth() + 1).padStart(2, '0'); 
    const day = String(boliviaTime.getUTCDate()).padStart(2, '0'); 
    const currentDate = `${year}-${month}-${day}`;
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    const numeroCompra = obtenerListaCompras();
console.log(numeroCompra);
console.log(listaCompraRealizadas);
    // const numeroLote = `${prefijo}-${currentDate}-${listaCompraRealizadas.length+1}`;
    const numeroLote = `${prefijo}-${currentDate}-${incrementable}`;
    return numeroLote;
}
// function generarNumeroDocumento() {
//     const prefijo = 'DOC'; 
//     const numeroSecuencial = String(listas.calidad.length + 1).padStart(5, '0'); 
//     return ${prefijo}-${numeroSecuencial};
// }

// function obtenerDatosfiltracion(selectItems) {
//     const selectopciones = document.querySelector(#Opciones${codigo});

//     const selectedValue = selectItems.value; 
//     const htmlopciones = document.querySelector(#${selectedValue}${codigo}).innerHTML;

//     selectopciones.innerHTML = htmlopciones;
//     console.log(htmlopciones);
// }
// const selectItems = document.querySelector(#item${codigo});

//         selectItems.addEventListener("change", function() {
//             obtenerDatosfiltracion(selectItems);
//         }); RetrocederGenerar Compra Lista de Proveedores

function modalVistaProveedorMaterial(){
    console.log("soy vista de proveedor  Material");
    let listar = document.querySelector("#modalVistaProveedorMaterial");
    let view = `  
    <button id="btnRetrocederMod" class="btn btn-primary" style="float: left;">
            <i class="bi bi-arrow-left"></i> VOLVER
    </button>  
    <br>
    <h1 class="text-center" id = "tituloLista">Lista de Proveedores</h1>
   
        <table class="table mt-4 table-hover" id = "tablaCuerpo">
            <thead id=lcompra>
                <tr class="table-dark">
                    <th scope="col">N°</th>
                    <th scope="col">Proveedor</th>
                    <th scope="col">Material</th>
                    <th scope="col">Telefono</th>
                    <th scope="col">Direccion</th>
                </tr>
            </thead>
            <tbody id="contenidoListaProveedorModal">  
                <!-- Filas de datos aquí -->
            </tbody>
        </table>

                `;
                
    listar.innerHTML = view;
    const btnRetroceder = document.querySelector('#btnRetrocederMod');
    const vistaFormularioCompra = document.querySelector('#vent');
    console.log(vistaFormularioCompra);
    const vistaProveedoresMat = document.querySelector("#modalVistaProveedorMaterial");
    // const vistapedido = document.querySelector("#verLista");
    // console.log(vistaListaPedido);
    // const vistaProveedorMaterial = document.querySelector('#vistaProveedorMaterial')
    btnRetroceder.addEventListener('click', () => {
        vistaFormularioCompra.style.display = 'block'; 
        vistaProveedoresMat.style.display = 'none'; 
         
    });
}

function listarProveedorDeMaterialesModal(id1){ 
    console.log("estoy dentro de Lista Proveedor Material");  
    const listarr=document.querySelector("#contenidoListaProveedorModal");
        fetch(`${URL_APIP}/api/listarProveedorDeMateriales/${uk[0].empresa.idempresa}/${id1}`)
        .then(res=>res.json())
        .then(data=>{
            let view="",ind=1;
            console.log(data);
            data.map(lista=>{
    
                console.log("===============");

                let idProveedor = Number(lista.nombre_proveedor);
                let idMaterial = Number(lista.nombre_material);

                let itemMaterial = materialArray.find(item => item.id === idMaterial);
                let itemProveedor = proveedorArray.find(dat => dat.id == idProveedor);        
                view+=`
                <tr id = "cuerpoLista">
                    <td>${ind++}</td> 
                    <td>${itemProveedor.nombre}</td>               
                    <td>${itemMaterial.nombre} </td>
                    <td>${itemProveedor.telefono} </td>
                    <td>${itemProveedor.direccion}</td>
                </tr>
                `;
            })
            listarr.innerHTML=view;
            console.log(listarr);
            const enlaces = document.querySelectorAll(".btn");
            enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuListaCompra);
            });
            
        })
        console.log("estoy dentro de veerrrr");
    }
    // Lista de Pedido Lista Compra por ProveedorLista de pedido