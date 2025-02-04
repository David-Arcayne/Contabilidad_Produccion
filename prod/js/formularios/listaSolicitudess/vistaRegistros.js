// import { uk } from "./listaSolicitudes.js";
import { uk, menuListaCompra, empleado  } from "../listaSolicitudess/listaSolicitudes.js";
import { descargarPDF } from "../Administracion/listaCompra.js";
import { URL_APIP } from "../../../../lib/services.js";
// import { proveedorArray } from "./selectsFormulario.js"; ATRAS
import { materialArray,proveedorArray,medidaArray } from "../listaSolicitudess/selectsFormulario.js";
export let listaCompraRealizadas;
export function vistaListaCompraRealizada1(){
    console.log("estoy en listaCompraRealizada1 aaa");
const listar=document.querySelector("#contenedor22");
let view =  `
<table class="table table-hover mt-4">
    <thead>
        <tr class="table-dark">
        <th scope="col">N°</th>
        <th scope="col">Fecha comprAAa</th>
        <th scope="col">Hora compra</th>
        <th scope="col">Lote</th>
        <th scope="col">Empleado</th>
        <th scope="col">Proveedor</th>
        <th scope="col">Funciones</th>
        </tr>
    </thead>
    <tbody id=listaCompraRealizada>
    
    </tbody>
</table>`
listar.innerHTML=view;
}
export function listaCompraRealizada2(){
    console.log(proveedorArray);
    // getempleado(lista.empleado)
    console.log("estoy en listaCompraRealizada2 aaa");
    const listarr=document.querySelector("#listaCompraRealizada");
   fetch(`${URL_APIP}/api/listaCompraRealizada/${uk[0].empresa.idempresa}`)
   .then(res=>res.json())
   .then(data=>{
       // data.length = 0;
       let view="",ind=1;
       console.log(data);
       listaCompraRealizadas = data;
        data.map(lista=>{
            // console.log(empleado);
            let itemEmpleado = empleado.find(item => Number(item.id) == Number(lista.empleado));  
            // console.log(itemEmpleado);  

            let idProveedor = Number(lista.proveedor);
            let itemProveedor = proveedorArray.find(item => item.id == idProveedor);
            // console.log(itemProveedor);
    // let estadoPedido = lista.estado;
    // if(lista.estado == 0){
    //     estadoPedido = "Pendiente";
    // }else{
    //     estadoPedido = "Finalizado";
    // }
    view+=`
    <tr>
       <td>${ind++}</td> 
       <td>${lista.fecha}</td>               
       <td>${lista.hora} </td>
       <td>${lista.lote} </td>
        <td>${itemEmpleado.nombre} ${itemEmpleado.apellido}</td>
       <td>${itemProveedor.nombre} </td>

      <td>
           <a data-id="ver_listaCompraRealizada,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Visualizar Compra">
               <i class="bi bi-eye" style="color: white;"></i>
           </a>
                                     
      </td>
   </tr>
   `;
        })
    //    console.log(view);
       listarr.innerHTML=view;

       const enlaces = document.querySelectorAll(".btn");
       enlaces.forEach(enlace => {
       enlace.addEventListener("click", menuListaCompra);
       });
       
   })
}
export function ojitoListaCompraRealizada(esTrue){
    console.log("estoy en ojitoListaCompraRealizada");
    // comprarListaSolicitud(id1);
    let listar = document.querySelector("#ojitoCompraRealizada");
    
    // idRegistro = id1;
    let view = `
    <div style="text-align: right;">

            <button id="btnAtrasOjito" class="btn btn-primary" style="float: left;">
                    <i class="bi bi-arrow-left"></i> VOLVER
            </button>  
            <br>
            <button id="btnDescargarListaCompra" class="btn btn-primary">
                <i class="bi bi-filetype-pdf"></i> Descargar pdf
            </button> 
        </div>
    <h1 class="text-center" id = "tituloLista">Lista Detallada Compra Realizada</h1>
        <table class="table mt-4 table-hover" id = "tablaCuerpo">
            <thead id=lcompra>
                <tr class="table-dark">
                    <th scope="col">N°</th>
                    <th scope="col">Material</th>
                    <th scope="col">Contenido envases</th>
                    <th scope="col">Cantidad envase</th>
                    <th scope="col">Precio_Unitario</th>
                     <th scope="col">Fecha_Venci</th>
                    <th scope="col">Total_Precio</th>
                </tr>
            </thead>
            <tbody id="contenidoListaDetalleCompra">  
                <!-- Filas de datos aquí -->
            </tbody>
        </table>
         <div id ="totalCompra" style="text-align: right;"> 

            </div>
                `;
                // console.log(view);
    listar.innerHTML = view;
    const btnDescargar = document.querySelector("#btnDescargarListaCompra");
    btnDescargar.addEventListener('click', descargarPDF);
    const btnAtras = document.querySelector("#btnAtrasOjito");
    const vistaCompraRealizada = document.querySelector("#contenedorGenerarListaSolicitudes");
    const vistaOjitoCompraRealizada = document.querySelector("#ojitoCompraRealizada");

    const vistaEnEspera2 = document.querySelector("#compraPorProveedorEnEspera");
            //   ojitoListaCompraRealizada();
            //   cuerpoListaDetalleCompra(id1);
            if(esTrue){
                btnAtras.addEventListener('click', () => {
                    vistaCompraRealizada.style.display = 'block';  
                    vistaOjitoCompraRealizada.style.display = 'none';         
                });
            }
            else{
                btnAtras.addEventListener('click', () => {
                    vistaEnEspera2.style.display = 'block';  
                    vistaOjitoCompraRealizada.style.display = 'none';         
                });
            }
          
}

export function  cuerpoListaDetalleCompra(id1){
    const listarr=document.querySelector("#contenidoListaDetalleCompra");
    const listar2 = document.querySelector("#totalCompra");
    console.log(listarr);
    console.log(id1);
   fetch(`${URL_APIP}/api/listadoDetalleCompraRealizada/${uk[0].empresa.idempresa}/${id1}`)
   .then(res=>res.json())
   .then(data=>{
    let totalyti= 0;
       // data.length = 0;
       let view="",ind=1;
       console.log(data);
       data.map(lista=>{
           // listaCompra.push(lista);
           console.log("===============")
           // console.log(lista.medida);

           let idMaterial = Number(lista.material);
           console.log(idMaterial);
        //    let idEnvase = Number(lista.tipoEnvase);
            let idMedida = Number(lista.medida);
        //    let itemEnvase = envaseArray.find(obj => obj.id == idEnvase);
        console.log(materialArray);
           let itemMaterial = materialArray.find(item => item.id == idMaterial);
           console.log(itemMaterial);
            let itemMedida = medidaArray.find(dat => dat.id === idMedida);
           
           view+=`
            <tr id = "cuerpoLista">
               <td>${ind++}</td> 
               <td>${itemMaterial.nombre}</td>               
               <td>${lista.contenidoEnvase} ${itemMedida.sigla}</td>
               <td>${lista.cantidadEnvase} </td>           
               <td>${lista.precio_unitario}</td>
               <td>${lista.fecha_venci}</td>
               <td>${lista.total_precio}</td>
               
           </tr>
           `;
           let totalPrecio = Number(lista.total_precio);
           totalyti =totalyti + totalPrecio;
           console.log(totalyti);
       })
       console.log(totalyti);
       let view2 = `<h6>Total Compra: ${totalyti}</h6>`
    //    view+=view2;
       listarr.innerHTML=view;
       listar2.innerHTML=view2;
       const enlaces = document.querySelectorAll(".btn");
       enlaces.forEach(enlace => {
       enlace.addEventListener("click", menuListaCompra);
       });
       
   })
   console.log("estoy dentro de veerrrr");
   console.log(id1);
}
