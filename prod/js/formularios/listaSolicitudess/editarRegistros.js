// import { uk } from "./listaSolicitudes.js"; Habilitar Proveedor
import { uk,menuListaCompra,idRegistro,codigo, vistaEnEsperaCompra, listaCompraEnEspera, formularioCompra, comprarListaSolicitud, listar_compraPorProveedor, idpedido, SumaTotalCompra, comprarPorProveedor, loteGeneral,proveedorGeneral} from "../listaSolicitudess/listaSolicitudes.js";
// import { descargarPDF } from "../listaCompra.js";
import { edit_Celda_table_edicion } from "./edicionDobleCLick.js";
import { proveedorArray,listarProveedorSelect, envaseArray, materialArray, medidaArray,listarMaterial,listarTipo_envase, listarmedida } from "./selectsFormulario.js";
// import { materialArray,proveedorArray,medidaArray } from "../listaSolicitudess/selectsFormulario.js";
import { URL_APIP } from "../../../../lib/services.js";
export let ListaCompra_Soli_Editable;
let disabledEstado = false;
export function listarEdicionCompraEspera(idRegistro, idpedido, proveedorGeneral, loteGeneral){
    console.log("soy el inicio de listarEdicionn");
    const listar=document.querySelector("#vistaEditarCompraEspera");
    let view = `
    <div id="vistaFormularioCompra" >
       <button id="btnAtrasFormuEdit" class="btn btn-primary" style="float: left;">
            <i class="bi bi-arrow-left"></i> VOLVER
        </button>  
        <br>
    <h5 class="text-center">Editar Formulario Compra</h5>
<p>${idRegistro}</p>
    <form action="" class="row" id="formularioCompraEditar${codigo}">
    <input type="hidden" name="verDavid" value="registrar_ListaCompraSoli_Editar">
        <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
        <input type="hidden" class="form-control" name="idcompra" id="idcompra" value="${idRegistro}">
        <input type="hidden" class="form-control" name="idpedido" id="idpedido" value="${idpedido}">
        
        <div class="row">

            <div class="col">
                <label for="">Fecha vencimiento</label>
                <input type="date" class="form-control" id ="fechaVenciEd${codigo}" name = "fechaVenciEd" required>
            </div>
        </div>

        <div class="row">
            
  
            <div class="col-md-6">
                <div class="form-group">
                    <label for="material">Seleccione un Material</label>
                    <select class="form-select" id="materialEd${codigo}" name="materialEd"> </select>
                </div>
            </div>
  
        </div>

        <div class="row">
            <div class="form-group">          
                <label for="tipoEnvase">Tipo envase</label>
                <select class="form-select" id="tipoEnvaseEd${codigo}" name="tipoEnvaseEd"> </select>
            </div>

            <div class="col">
                <label for="">Contenido</label>
                <input type="text" class="form-control" id="contenidoEd" name= "contenidoEd">
            </div>

            <div class="form-group">
                <label for="medida">Medida</label>
                <select class="form-select" id="medidaEd${codigo}" name="medidaEd"> </select>
            </div>

            <div class="col">
                <label for="">Cantidad</label>
                <input type="text" class="form-control" id="cantidadEd" name="cantidadEd">
            </div>
             <div class="col">
                <label for="">Precio Unitario</label>
                <input type="text" class="form-control" id="precioUniEd" name="precioUniEd">
            </div>
        </div>
        <div class="row">
            <div class="col">
                 <button class="btn btn-success mt-4" type="" style="float: right;">
                    <i class="bi bi-plus fs-3"></i>
                </button>
            </div>
        </div>        
    </form>
    <div id="alerta" class="mt-4"></div>
    <table class="table table-hover" id = "editableTableSoli_edicion${codigo}">
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
        <tbody id="listarCompraEsperaEdit">
        </tbody>
    </table>
    <div>
        
        <form action="" class="row" id="formularioCompraEdit${codigo}">
            <input type="hidden" name="verDavid" value="editarRegistroCompra">
            <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
             <input type="hidden" name="usuario" value="${uk[0].idusuario}">
            <input type="hidden" class="form-control" name="idcompra" id="idcompra" value="${idRegistro}">
            <div class="row">

               <div class="row g-3" >
                    <div class="col-auto" id = "totalSumaEdit">
                    
                    </div>
                </div>
                <div class="col-md-6">
                    <div>
                    <h4> Proveedor Actual: ${proveedorGeneral}</h4>
                        <label for="proveedor">Seleccione un Proveedor</label>
                         <button class="btn btn-success mt-4" id="habilitarBtn" type="button">Habilitar Proveedor</button>
                        <select class="form-select" id="proveedorEd" name="proveedorEd" disabled> </select>
                    </div>
                </div>
                <div class="col"> 
                    <label for="lote">Lote</label>
                <input type="text" class="form-control" id="lote" name = "lote" required value= "${loteGeneral}">
            </div>
            </div>
        <div class="row">
            <div class="col">
                <button class="btn btn-success mt-4" type="" style="float: right;" id="btnFinEdicion">
                    <i class="bi bi-send"></i> Finalizar Edicion
                </button>
            </div>
        </div>
        </form>   
    </div>
    </div>
        `
    listar.innerHTML = view;
    console.log(listar);
    const selectt = document.querySelector("#proveedorEd");
    console.log(selectt);

    const table = document.getElementById(`editableTableSoli_edicion${codigo}`);
    console.log(table);
    console.log(idRegistro);
    table.addEventListener("dblclick",(e) => edit_Celda_table_edicion(e, idRegistro));
    // HABILITAR Y DESABILITAR BOTON
    document.getElementById('habilitarBtn').addEventListener('click', function(event) {
        event.preventDefault();
        let selectElement = document.getElementById('proveedorEd');
        selectElement.disabled = !selectElement.disabled;

              // Cambiar el texto del botón según el estado del select
              if (selectElement.disabled) {
                this.textContent = 'Habilitar Proveedor';
            } else {
                this.textContent = 'Deshabilitar Proveedor';
            }
    });

     const btnAtrasEditt = document.querySelector("#btnAtrasFormuEdit");

    const vistaEditar= document.querySelector("#vistaEditarCompraEspera");
        const vistaEnEspera = document.querySelector("#compraPorProveedorEnEspera");
    btnAtrasEditt.addEventListener('click', () => {
        vistaEnEspera.style.display = 'block'; 
        vistaEditar.style.display = 'none';
    });

    const formuEdit = document.querySelector(`#formularioCompraEdit${codigo}`);
    const btnFinEdicion = document.querySelector('#btnFinEdicion');
    btnFinEdicion.addEventListener('click', () => {
       console.log(formuEdit);
    //    const fechaReg = document.querySelector('#fechaReg');
    //    const fechaEstaVacia = fechaReg.value;
       // if(fechaEstaVacia ==""){
       //     console.log("la fecha esta vacia");
       // }else{
       //     console.log(fechaEstaVacia.value);
       //       
       formuEdit.addEventListener("submit", (e) => finalizarEdicion(e, formuEdit,idRegistro,idpedido));
   });
    console.log("soy el finalll de listarEdicionn");
}

export function listar_compraPorProveedorEdit(id1){
    // id1 = id de la compra
    const listarr=document.querySelector("#listarCompraEsperaEdit");
//    fetch(`./api/listarCompraEsperaEdit/${uk[0].empresa.idempresa}/${id1}`)
   fetch(`${URL_APIP}/api/listarCompraEsperaEdit/${uk[0].empresa.idempresa}/${id1}`, {
    headers: {
        'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
    }
})
   .then(res=>res.json())
   .then(data=>{
    console.log(id1);
    // let totalCompra = 0;
       // data.length = 0;
       ListaCompra_Soli_Editable = data;
       let view="",ind=1;
       console.log(data);
       data.map(lista=>{
           // listaCompra.push(lista);

           console.log("===============")
           console.log(envaseArray);
           console.log(materialArray);
           console.log(medidaArray);
           let idMaterial = Number(lista.materialEd);
           let idEnvase = Number(lista.tipoEnvaseEd);
           let idMedida = Number(lista.medidaEd);
           
           let itemEnvase = envaseArray.find(obj => obj.id == idEnvase);
           let itemMaterial = materialArray.find(item => item.id === idMaterial);
           let itemMedida = medidaArray.find(dat => dat.id === idMedida);
           console.log(itemMaterial);
           view+=`
            <tr>
               <td>${ind++}</td>         
               <td data-type="${lista.id},materialEd,${uk[0].empresa.idempresa}">${itemMaterial.nombre}</td>               
               <td data-type="${lista.id},cantidadEd,${uk[0].empresa.idempresa}">${lista.cantidadEd} </td>
               <td data-type="${lista.id},tipoEnvaseEd,${uk[0].empresa.idempresa}">${itemEnvase.nombre} </td>
               <td data-type="${lista.id},contenidoEd,${uk[0].empresa.idempresa}">${lista.contenidoEd} ${itemMedida.sigla} </td>
               <td data-type="${lista.id},precioUniEd,${uk[0].empresa.idempresa}">${lista.precioUniEd} </td>
               <td data-type="${lista.id},precio_total,${uk[0].empresa.idempresa}">${lista.precio_total} </td>
               <td data-type="${lista.id},fechaVenciEd,${uk[0].empresa.idempresa}">${lista.fechaVenciEd} </td>
              
               <td>
                   <a data-id="editarListaCompraSoli_Edicion,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
                       <i class="bi bi-pencil-square"></i>
                   </a>  
                   <a data-id="eliminar_listaCompraSoli_edit,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
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
}
export function SumaTotalCompraEdit(id1){
    let totalCompra= 0;
   const listarr=document.querySelector("#totalSumaEdit");
   fetch(`${URL_APIP}/api/listarCompraEsperaEdit/${uk[0].empresa.idempresa}/${id1}`, {
    headers: {
        'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
    }
})
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
      view= `
      <label for="total">Total:</label>
      <input type="text" class="form-control" id="total" name = "totalSumaEdit" value = "${totalCompra}" readonly>
      `;
      listarr.innerHTML = view;  
        
  })

}
export function formularioEditarSoli(e, form,idcompra) {
    e.preventDefault();
    console.log(form);
    console.log(idcompra);
    const dato = new FormData(form);
    console.log(dato);
        fetch(`${URL_APIP}/api/`,{
            method:"POST",
            body:dato,
            headers: {
                'Usar-Registro-David': 'true'
                }
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data[0]=="success"){
                form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                
                setTimeout(() => {
                    
                     form.reset();
                    // sitio(false);
                    console.log(proveedorGeneral);
                    console.log(idRegistro);
                    listarEdicionCompraEspera(idcompra,idRegistro,proveedorGeneral,loteGeneral)
                    // listarMaterial(`material${codigo}`)
                    listarProveedorSelect("proveedorEd", proveedorGeneral)
                    listarMaterial(`materialEd${codigo}`)
                    .then(() =>  listarTipo_envase(`tipoEnvaseEd${codigo}`))
                    .then(() =>   listarmedida(`medidaEd${codigo}`))
                    .then(() => {
                        // listar_ListaCompra_Editable(idcompra);
                        listar_compraPorProveedorEdit(idcompra);
                        SumaTotalCompraEdit(idcompra);
                        const formEdit = document.querySelector(`#formularioCompraEditar${codigo}`);
                        console.log(formEdit);
                        formEdit.addEventListener("submit", (e) => formularioEditarSoli(e, formEdit,idcompra));
                        formEdit.reset();
                    });
                }, 2000);
                return;
            }else{
            form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
            setTimeout(() => {
                form.remove();
                sitio(false);
            }, 3000);
            return;
        }
        })       
}

export function eliminar_listaCompraSoli_edit(id,ids,form,idcompra){
    console.log("elimina listaCompra");
    console.log(idcompra);
    console.log(id);
    console.log(ids);
    console.log(form);
    if(confirm("Desea Eliminar..?")){
        // fetch(`./api/eliminar_listaCompra/${id}/${ids}`)
        fetch(`${URL_APIP}/api/eliminar_listaCompraSoli_edit/${id}/${ids}`, {
            // method: 'GET', // Cambia el método si es necesario
            headers: {
                // 'Content-Type': 'application/json',
                'Usar-Listado-David': 'true' // Aquí envías el valor en el encabezado
            }
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data[0]=="success"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    console.log(form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`);
                    setTimeout(() => {
                        // form.style.display="none";
                        console.log(proveedorGeneral);
                        listarEdicionCompraEspera(idcompra,idRegistro,proveedorGeneral,loteGeneral)
                        listarProveedorSelect("proveedorEd", proveedorGeneral)
                        listarMaterial(`materialEd${codigo}`)
                        .then(() =>  listarTipo_envase(`tipoEnvaseEd${codigo}`))
                        .then(() =>   listarmedida(`medidaEd${codigo}`))
                    .then(() => {
                        // listar_ListaCompra_Editable(idcompra);
                        listar_compraPorProveedorEdit(idcompra);
                        SumaTotalCompraEdit(idcompra);
                        const formEdit = document.querySelector(`#formularioCompraEditar${codigo}`);
                        console.log(formEdit);
                        formEdit.addEventListener("submit", (e) => formularioEditarSoli(e, formEdit,idcompra));
                        formEdit.reset();
                    });
                    }, 2000);
                    return;
               
            }else{
                form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                
                
                setTimeout(() => {
                    form.style.display="none";
                    sitio(false);
                }, 3000);
                return;
            }
            
        })
    }
    // listar_ListaCompra();
}
export function eliminar_compraEspera(id,ids,form, idpedido){
    console.log("elimina pedidoCompra");
    console.log(id);
    console.log(form);
    if(confirm("Desea Eliminar..?")){
        // fetch(`${URL_APIP}/api/eliminar_compraEspera/${id}/${ids}`)
        fetch(`${URL_APIP}/api/eliminar_compraEspera/${id}/${ids}`, {
            // method: 'GET', // Cambia el método si es necesario
            headers: {
                // 'Content-Type': 'application/json',
                'Usar-Listado-David': 'true' // Aquí envías el valor en el encabezado
            }
        })
        .then(res=>res.json() )
        .then(data=>{
            console.log(data);
            if(data[0]=="ok"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                        
                        form.style.display="none";
                        vistaEnEsperaCompra(idpedido);
                        listaCompraEnEspera(idpedido);
                    }, 2000);
                    return;
                
               
            }else{
                form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                
                
                setTimeout(() => {
                    form.style.display="none";
                    vistaEnEsperaCompra(idpedido);
                    listaCompraEnEspera(idpedido);
                }, 3000);
                return;
            }
            
        })
    }
}
export function eliminar_listaCompraSoli(id,ids,form,idpedido){
    console.log("elimina listaCompra");
    console.log(idpedido);
    console.log(id);
    console.log(ids);
    console.log(form);
    if(confirm("Desea Eliminar..?")){
        // fetch(`./api/eliminar_listaCompra/${id}/${ids}`)
        fetch(`${URL_APIP}/api/eliminar_listaCompraSoli/${id}/${ids}`, {
            // method: 'GET', // Cambia el método si es necesario
            headers: {
                // 'Content-Type': 'application/json',
                'Usar-Listado-David': 'true' // Aquí envías el valor en el encabezado
            }
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data[0]=="success"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    console.log(form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`);
                    setTimeout(() => {
                        // form.style.display="none";
                        formularioCompra(idpedido);
                        listarProveedorSelect("proveedor")
                        .then(() =>listarMaterial(`material${codigo}`))
                        .then(() =>  listarTipo_envase(`tipoEnvase${codigo}`))
                        .then(() =>   listarmedida(`medida${codigo}`))
                        .then(() => {
                            // comprarListaSolicitud(id1); 
                            listar_compraPorProveedor(idpedido);
                            listaCompraEnEspera(idpedido);
                            comprarListaSolicitud(idpedido);
                             SumaTotalCompra(idpedido);
                            const forme = document.querySelector(`#formularioCompraProveedor${codigo}`);
                            console.log(forme);
                            forme.addEventListener("submit", (e) => comprarPorProveedor(e, forme,idpedido));
                            forme.reset();
                        }).catch(error => {
                            console.error('Error en la cadena de promesas:', error);
                        });
                    }, 2000);
                    return;
               
            }else{
                form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                
                
                setTimeout(() => {
                    form.style.display="none";
                    console.log("porq se salta aquiiiii");
                    sitio(false);
                }, 3000);
                return;
            }
            
        })
    }
    // listar_ListaCompra();
}

function finalizarEdicion(e,formu,id1,idpedido) {
    console.log(id1);
    console.log(idpedido);
    console.log("SOY LA PRIMERA EJECUCION DEL BOTON REGISTRAR COMPRA");
    e.preventDefault();
    const dato = new FormData(formu);
    console.log(dato);
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
                        formu.reset();
                        // vistaEnEsperaCompra()
                        // listaCompraRealizada2();
                        listaCompraEnEspera(idpedido);
                         // vistaEnEsperaCompra();
                         formularioCompra(idpedido);
            listarProveedorSelect("proveedor")
            .then(() =>listarMaterial(`material${codigo}`))
            .then(() =>  listarTipo_envase(`tipoEnvase${codigo}`))
            .then(() =>   listarmedida(`medida${codigo}`))
            .then(() => {
                // comprarListaSolicitud(id1); 
                listar_compraPorProveedor(idpedido);
                listaCompraEnEspera(idpedido);
                comprarListaSolicitud(idpedido);
                // listaCompraRealizada2();
                const vistaEditar= document.querySelector("#vistaEditarCompraEspera");
                const vistaEnEspera = document.querySelector("#compraPorProveedorEnEspera");
            // btnAtrasEditt.addEventListener('click', () => {
                vistaEnEspera.style.display = 'block'; 
                vistaEditar.style.display = 'none';
            // });
                   console.log("SOY LA SEGUMDA EJECUCION DEL BOTON REGISTRAR COMPRA");
                    //  vistaEnEsperaCompraPorProveedor.style.display = 'block'; 
                    // vistaFormularioCompra.style.display = 'none';

                const forme = document.querySelector(`#formularioCompraProveedor${codigo}`);
                console.log(forme);
                forme.addEventListener("submit", (e) => comprarPorProveedor(e, forme,idpedido));
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
                    // listar_compraPorProveedorEdit(idcompra);
                    // SumaTotalCompraEdit(idcompra);


                    listarEdicionCompraEspera(idcompra,idRegistro,proveedorGeneral,loteGeneral)
                    // listarMaterial(`material${codigo}`)
                    listarProveedorSelect("proveedorEd", proveedorGeneral)
                    listarMaterial(`materialEd${codigo}`)
                    .then(() =>  listarTipo_envase(`tipoEnvaseEd${codigo}`))
                    .then(() =>   listarmedida(`medidaEd${codigo}`))
                    .then(() => {
                        // listar_ListaCompra_Editable(idcompra);
                        listar_compraPorProveedorEdit(idcompra);
                        
                        SumaTotalCompraEdit(idcompra);
                        const formEdit = document.querySelector(`#formularioCompraEditar${codigo}`);
                        console.log(formEdit);
                        formEdit.addEventListener("submit", (e) => formularioEditarSoli(e, formEdit,idcompra));
                        formEdit.reset();
                    });
                   }, 2000);
                   
               }
           });
}