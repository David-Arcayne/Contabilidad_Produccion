import { URL_APIP } from "../../../../lib/services.js";
import { getempleado, empleado } from "../listaSolicitudess/listaSolicitudes.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
console.log(uk[0].usuario);
let app="";
let envaseArray =[];
let medidaArray = [];
let materialArray = [];
let idpedido;
let Lista_compra_pedido = [];
let Lista_compra_pedido_editable = [];
// let list_seccion =[];
// let list_medida =[];
// let list_tipoM =[]; VOLVER
let obt_material_aux = {
    seccion: -1,
    codigo: "",
    estado: -1,
    fecha: "",
    hora: "",
    id: -1,
    medida: -1,
    nombre: "",
    tipo: -1
};
let obt_tipo_material_aux = {
    id:-1,
    nombre:"",
    detalle:"",
};

const codigo = Array.from({ length: 3 }, () => rand()).join("") + "listaCompra";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function listaconfig(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
    
}

function menuListaCompra(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(','); //id1 = id del registro,   id2= id empresa
    const forme = document.querySelector(`#alerta`);
    switch (funcion) {
        case "eliminar_listaCompra":
            eliminar_listaCompra(id1,id2,forme);
            break;
        case "eliminar_listaCompra_edit":
            eliminar_listaCompra_edit(id1,id2,forme);
            break;
        case "editarListaPedido":
            // .then(() =>  listarTipo_envase())
            // .then(() =>  listarMaterial())
            // .then(() => {
            //     listarEdicion();
            // });
            idpedido = id1;
            console.log(idpedido);
            const vistaEditar= document.querySelector("#vistaEditar");
            const vistaPrincipall = document.querySelector("#contenedorGenerarListaCompra");
            vistaPrincipall.style.display = 'none'; 
            vistaEditar.style.display = 'block';
            listarEdicion(idpedido);

            listarMaterial2()
            .then(() =>  listarTipo_envase2())
            // .then(() =>   listarmedida2())
            .then(() => {
                listar_ListaCompra_Editable(idpedido);
                const formEdit = document.querySelector(`#formulariooo${codigo}`);
                console.log(formEdit);
                formEdit.addEventListener("submit", (e) => formularioEditar(e, formEdit,idpedido));
                formEdit.reset();
            });

            // listarEdicion();

            // listarEdicion();
            // editarListaPedido(event);
            break;
        // Agrega otros casos según sea necesario
        case "ver_listaCompra":
            const vistaPrincipal = document.querySelector("#contenedorGenerarListaCompra");
            const vistaVer = document.querySelector("#verListaC");
            vistaPrincipal.style.display = 'none'; 
            vistaVer.style.display = 'block'
    // contenedor1.style.display = 'none';
    // contenedor2.style.display = 'none';
             vistaVerLista();
             verListaCompra(id1);
             break;
        case "eliminar_pedidoCompra":
                eliminar_pedidoCompra(id1,id2,forme);
                break; 
        case "IconoEditarPedido":
                    IconoEditarPedido(event);
                    break; 
        case "iconoEditarPedidoEdicion":
                    iconoEditarPedidoEdicion(event);
                    break;     
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}
function listarMaterial(){
    console.log("listo material");

    const listar=document.querySelector(`#material${codigo}`);
    return fetch(`${URL_APIP}/api/listar_material/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        materialArray.length = 0;
        materialArray = data;     
        console.log("entre al data");
        let view="",ind=1;
        data.map(lista=>{
            let itemMedida = medidaArray.find(dat => dat.id === lista.medida);
            view+=`
                <option value="${lista.id}">${lista.nombre} ${itemMedida.nombre}</option>
            `;
        })
        listar.innerHTML=view;
        console.log(listar);
        console.log("lista material completa");

    })
}

function listarTipo_envase(){
    console.log("listo");
    const listar=document.querySelector(`#tipoEnvase${codigo}`);
    return fetch(`${URL_APIP}/api/listaenvases/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        envaseArray.length = 0;
        envaseArray = data;
        let view="";
        data.map(lista=>{
            
            view+=`
                <option value="${lista.id}">${lista.nombre} </option>
            `;
        })
        listar.innerHTML=view;
        console.log("lista envase completa");
        
    })   
}
function listarmedida(){
    console.log("listo medida");

    // const listar=document.querySelector(`#medida${codigo}`);
    // console.log(listar);
    return fetch(`${URL_APIP}/api/listar_unidad_producto/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        medidaArray.length = 0;
        medidaArray = data;     
        console.log("entre al data");
        let view="",ind=1;
        // data.map(lista=>{
                
        //     view+=`
        //         <option value="${lista.id}">${lista.nombre}</option>
        //     `;
        // })
        // listar.innerHTML=view;
        console.log("lista medida completa");

    })
}
function listar_ListaCompra(){
    const listarr=document.querySelector(`#listaCompra${codigo}`);
   fetch(`${URL_APIP}/api/listar_ListaCompra/${uk[0].empresa.idempresa}`)
   .then(res=>res.json())
   .then(data=>{
       // data.length = 0;
       let view="",ind=1;
       console.log(data);
       Lista_compra_pedido = data;
       data.map(lista=>{
           // listaCompra.push(lista);

           console.log("===============")
           let idMaterial = Number(lista.material);
           let idEnvase = Number(lista.tipoEnvase);
        //    let idMedida = Number(lista.medida);
           let itemEnvase = envaseArray.find(obj => obj.id == idEnvase);
           let itemMaterial = materialArray.find(item => item.id === idMaterial);
           let itemMedida = medidaArray.find(dat => dat.id == lista.medida);
           console.log(medidaArray);
           console.log(lista.medida);
           console.log(itemMedida);
           
           view+=`
            <tr>
               <td>${ind++}</td> 
                <td data-type="${lista.id},material,${uk[0].empresa.idempresa}">${itemMaterial.nombre}</td>             
               <td data-type="${lista.id},cantidadEnvase,${uk[0].empresa.idempresa}">${lista.cantidadEnvase} </td>
               <td data-type="${lista.id},tipoEnvase,${uk[0].empresa.idempresa}">${itemEnvase.nombre} </td>
               <td data-type="${lista.id},contenidoEnvase,${uk[0].empresa.idempresa}">${lista.contenidoEnvase} ${itemMedida.nombre} </td>
               <td data-type="${lista.id},total_material,${uk[0].empresa.idempresa}">${lista.total_material}</td>

               <td>
                   <a data-id="IconoEditarPedido,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
                       <i class="bi bi-pencil-square"></i>
                   </a>  
                   <a data-id="eliminar_listaCompra,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
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

function listar_PedidoCompra(){
    const listarr=document.querySelector("#listaPedido");
   fetch(`${URL_APIP}/api/listar_PedidoCompra/${uk[0].empresa.idempresa}`)
   .then(res=>res.json())
   .then(data=>{
       // data.length = 0;
       let view="",ind=1;
       console.log(data);
        data.map(lista=>{
            console.log(empleado);
            let itemEmpleado = empleado.find(item => Number(item.id) == Number(lista.empleado));  
            console.log(itemEmpleado);  
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
               <a data-id="ver_listaCompra,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Visualizar Pedido">
                   <i class="bi bi-eye" style="color: white;"></i>
               </a>
              <a data-id="editarListaPedido,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
                  <i class="bi bi-pencil-square"></i>
              </a>  
              <a data-id="eliminar_pedidoCompra,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
                  <i class="bi bi-trash"></i>
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
            <td>${uk[0].nombre}</td>
           <td>${estadoPedido} </td>

          <td>
               <a data-id="ver_listaCompra,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Visualizar Pedido">
                   <i class="bi bi-eye" style="color: white;"></i>
               </a> 
              <a data-id="eliminar_pedidoCompra,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
                  <i class="bi bi-trash"></i>
              </a> 
                                         
          </td>
       </tr>
       `;
    }
        })
       listarr.innerHTML=view;

       const enlaces = document.querySelectorAll(".btn");
       enlaces.forEach(enlace => {
       enlace.addEventListener("click", menuListaCompra);
       });
       
   })
}
function vistaVerLista(){
    let listar = document.querySelector("#verListaC");
    let view = `
        <div style="text-align: right;">
            <button id="btnAtrasVer" class="btn btn-primary" style="float: left;">
                <i class="bi bi-arrow-left"></i> VOLVER
            </button> 
            <button id="btnDescargar" class="btn btn-primary">
                <i class="bi bi-filetype-pdf"></i> Descargar pdf
            </button>
        </div>
  
    <h1 class="text-center" id = "tituloLista">Lista de pedido</h1>
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
            <tbody id="contenidoLista">  
                <!-- Filas de datos aquí -->
            </tbody>
        </table>`;
    listar.innerHTML = view;
    const btnAtrasVer = document.querySelector("#btnAtrasVer");
    const vistaPrincipal = document.querySelector("#contenedorGenerarListaCompra");
    const vistaVer = document.querySelector("#verListaC");

    btnAtrasVer.addEventListener('click', () => {
         vistaPrincipal.style.display = 'block'; 
         vistaVer.style.display = 'none'
    });
    const btnDescargar = document.querySelector("#btnDescargar");
    btnDescargar.addEventListener('click', descargarPDF);
}

export async function descargarPDF() {
    const { jsPDF } = window.jspdf;

    // Crear un nuevo documento PDF
    const doc = new jsPDF();
    console.log(uk[0].usuario);

    // Datos de la empresa
    const empresa = {
        nombre: uk[0].empresa.nombre,
        sucursal: uk[0].empresa.sucursal || '',
        region: uk[0].empresa.region || '',
        pais: uk[0].empresa.opais || '',
        // logo: '../em/logos/yof_a241d6258a.png' || '',
        logo: `../em/${uk[0].empresa.logo}`,
        // "logos/yof_a241d6258a.png"
        nit: uk[0].empresa.nit ? `NIT: ${uk[0].empresa.nit}` : '',
        telefono: uk[0].empresa.telefono ? `Telefono: ${uk[0].empresa.telefono}` : '',
        email: uk[0].empresa.email || '',
        sitioWeb: uk[0].empresa.ositioweb || ''
    };

    // Cargar la imagen y agregarla al PDF si existe
    if (empresa.logo) {
        console.log("soy imagen");
        const img = new Image();
        img.src = empresa.logo;
        img.onload = function() {
            doc.addImage(img, 'PNG', 90, 10, 20, 20); // Ajusta las coordenadas y el tamaño según sea necesario
            console.log("soy imagen pero mas adentro");

            // Agregar datos de la empresa al PDF después de cargar la imagen
            doc.setFontSize(8); // Tamaño de fuente para los datos de la empresa

            if (empresa.nombre) doc.text(empresa.nombre, 10, 10);
            if (empresa.sucursal) doc.text(empresa.sucursal, 10, 20);
            if (empresa.region) doc.text(empresa.region, 10, 30);
            if (empresa.pais) doc.text(empresa.pais, 10, 40);
            if (empresa.nit) doc.text(empresa.nit, 160, 10);
            if (empresa.telefono) doc.text(empresa.telefono, 160, 20);
            if (empresa.email) doc.text(empresa.email, 160, 30);
            if (empresa.sitioWeb) doc.text(empresa.sitioWeb, 160, 40);

            // Capturar el título
            const titulo = document.querySelector("#tituloLista").textContent;

            // Agregar el título al PDF
            doc.text(titulo, 50, 45);

             // Obtener los datos de la tabla
    const table = document.querySelector("#tablaCuerpo");
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent);
    const rows = Array.from(table.querySelectorAll("tbody tr")).map(tr => 
        Array.from(tr.querySelectorAll("td")).map(td => td.textContent)
    );

    // Agregar la tabla al PDF
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 50, // Ajustar la posición de inicio de la tabla
        theme: 'striped',
        styles: {
            headerFillColor: [255, 0, 0], // Color de fondo para los encabezados
            alternateRowFillColor: [240, 240, 240], // Color de fondo para filas alternas
            textColor: [0, 0, 0], // Color del texto
        }
    });
// }

            // Guardar el PDF
            doc.save('empresa.pdf');
        };
    } else {
        // Agregar datos de la empresa al PDF si no hay imagen
        doc.setFontSize(8); // Tamaño de fuente para los datos de la empresa

        if (empresa.nombre) doc.text(empresa.nombre, 10, 10);
        if (empresa.sucursal) doc.text(empresa.sucursal, 10, 20);
        if (empresa.region) doc.text(empresa.region, 10, 30);
        if (empresa.pais) doc.text(empresa.pais, 10, 40);
        if (empresa.nit) doc.text(empresa.nit, 160, 10);
        if (empresa.telefono) doc.text(empresa.telefono, 160, 20);
        if (empresa.email) doc.text(empresa.email, 160, 30);
        if (empresa.sitioWeb) doc.text(empresa.sitioWeb, 160, 40);

        // Capturar el título
        const titulo = document.querySelector("#tituloLista").textContent;

        // Agregar el título al PDF
        doc.text(titulo, 10, 50);

        // Guardar el PDF
        doc.save('empresa.pdf');
    }
}

function  verListaCompra(id1){
     const listarr=document.querySelector("#contenidoLista");
     console.log(listarr);
    fetch(`${URL_APIP}/api/ver_listaCompra/${uk[0].empresa.idempresa}/${id1}`)
    .then(res=>res.json())
    .then(data=>{
        // data.length = 0;
        let view="",ind=1;
        console.log(data);
        data.map(lista=>{
            // listaCompra.push(lista);

            console.log("===============")
            // console.log(lista.medida);
console.log(materialArray);
            let idMaterial = Number(lista.material);
            let idEnvase = Number(lista.tipoEnvase);
            let itemEnvase = envaseArray.find(obj => obj.id == idEnvase);
            let itemMaterial = materialArray.find(item => item.id === idMaterial);
            let itemMedida = medidaArray.find(item => item.id === itemMaterial.medida);
            // let itemMedida = medidaArray.find(dat => dat.id === idMedida);
            
            view+=`
             <tr id = "cuerpoLista">
                <td>${ind++}</td> 
                <td>${itemMaterial.nombre}</td>               
                <td>${lista.cantidadEnvase} </td>
                <td>${itemEnvase.nombre} </td>
                <td>${lista.contenidoEnvase} ${itemMedida.nombre} </td>
                <td>${lista.total_material}</td>
            </tr>
            `;
        })
        console.log(view);
        listarr.innerHTML=view;

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuListaCompra);
        });
        
    })
    console.log("estoy dentro de veerrrr");
    console.log(id1);
    // innerHTML = '<h2> holaa</h2>';
}
function listarPedido(){
    const listar=document.querySelector("#contenedor1");
    let view =      `<div class="container">
    <h1 class="text-center">Lista pedidos</h1>
    <form action="" class="row g-3" id="formBuscar">
       
        <input type="hidden" name="ver" value="registrar_PedidoCompra">
        <div class="form-check">
            <input type="checkbox" class="form-check-input" id="buscarFecha">
            <label for="buscarFecha" class="form-check-label">
                Buscar por fecha
            </label>
        </div>
        <div class="col-auto">
            <label for="estado" class="">Seleccione estado</label>
            <select name="estado" id="estado" class="form-select">
                <option value="0">Pendiente</option>
                <option value="1">Finalizado</option>
                <option value="2">Todos</option>
            </select>
        </div>
        
        <div class="row">
            <div class="col-md-6" >
                <label for="fechaInicio">Fecha Inicio</label>
                
                <input name = "fechaInicio" type="date" id="fechaInicio" class="form-control" disabled=false>
            </div>
            <div class="col-md-6">
                <label for="fechaFinal">Fecha Final</label>
                <input name = "fechaFinal" type="date" id="fechaFinal" class="form-control" disabled=false>
            </div>
        </div>
       
        <div class="col-auto  ms-auto"> 
            <button id = btn-buscar class="btn btn-primary">
                <i class="bi bi-search"></i> Buscar            
            </button>
        </div>
    </form>
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
          <tbody id=listaPedido>
           
          </tbody>
    </table>
</div>`
listar.innerHTML=view;
let fechaIni = document.querySelector('#fechaInicio');
console.log(fechaIni.value);

 const forme = document.querySelector(`#formBuscar`);
        console.log(forme);
        forme.addEventListener("submit", (e) => buscarPorFecha(e, forme));

    // -----------TICKEAR EL CHECKBOX PARA BUSCAR POR FECHAS--------------------------------------------
    const checkbox = document.getElementById("buscarFecha");
    const fechaInicioInput = document.getElementById("fechaInicio");
    const fechaFinInput = document.getElementById("fechaFinal");

    checkbox.addEventListener("change", function() {
        if (checkbox.checked) {
            fechaInicioInput.disabled = false;
            fechaFinInput.disabled = false;
        } else {
            fechaInicioInput.disabled = true;
            fechaInicioInput.value = null;
            fechaFinInput.disabled = true;
            fechaFinInput.value = null;
        }
    });  
    //------------------------------------------------------------------------------

}
function buscarPorFecha(e,forme){
    e.preventDefault();
    const fechaInputIni = document.getElementById("fechaInicio");
    let fechaSeleccionadaIni = fechaInputIni.value;
    if(fechaSeleccionadaIni == null || fechaSeleccionadaIni==""){
        // console.log("soy vacio");
        fechaSeleccionadaIni = "soyVacio";
    }
    console.log(fechaSeleccionadaIni);
    const fechaInputFin = document.getElementById("fechaFinal");
    let fechaSeleccionadaFin = fechaInputFin.value;
    if(fechaSeleccionadaFin == null || fechaSeleccionadaFin==""){
        fechaSeleccionadaFin = "soyVacio";
    }
    console.log(fechaSeleccionadaFin);
    // --------------------------------------------------------------------------
    const selectElement = document.getElementById("estado");
    const selectedValue = selectElement.value;
    console.log("Valor seleccionado:", selectedValue);
    // selectElement.addEventListener("change", function() {
    // const selectedValue = selectElement.value;
    // console.log("Valor seleccionado:", selectedValue);
    // });
// ------------------------------------------------------
    const listarr=document.querySelector("#listaPedido");
    fetch(`${URL_APIP}/api/listar_PorFechas/${uk[0].empresa.idempresa}/${fechaSeleccionadaIni}/${fechaSeleccionadaFin}/${selectedValue}`)
    .then(res=> res.json())
    .then(data=>{
        console.log(data);
        let view="",ind=1;
        data.map(lista=>{

    let estadoPedido = lista.estado;
    if(lista.estado == 0){
        estadoPedido = "Pendiente";
    }else {
        estadoPedido = "Finalizado";
    }
           
            view+=`
             <tr>
                <td>${ind++}</td> 
                <td>${lista.fecha}</td>               
                <td>${lista.hora} </td>
                 <td>${uk[0].nombre}</td>
                <td>${estadoPedido} </td>
               <td>
                    <a data-id="ver_listaCompra,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Visualizar Pedido">
                        <i class="bi bi-eye" style="color: white;"></i>
                    </a>
                   <a data-id="editar_material,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
                       <i class="bi bi-pencil-square"></i>
                   </a>  
                   <a data-id="eliminar_listaCompra,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
                       <i class="bi bi-trash"></i>
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
function listarSolicitud(){
    const listar=document.querySelector("#contenedor2");
    let view = `<h2 class="text-center">Generar Lista Compra</h2>

    <form id="formulario${codigo}">
    <input type="hidden" name="ver" value="registrar_ListaCompra">
  
        <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
      <div class="row">
        
        <div class="col-md-6">
          <div class="form-group">
            <label for="material">Seleccione un material</label>
            <select class="form-select" id="material${codigo}" name="material"> </select>
          </div>
          <div class="form-group">          
            <label for="tipoEnvase">Tipo envase</label>
             <select class="form-select" id="tipoEnvase${codigo}" name="tipoEnvase"> </select>
          </div>
          <div class="form-group">
            <label for="cantidadEnvase">Cantidad envases</label>
            <input type="number" class="form-control" id="cantidadEnvase" name="cantidadEnvase" placeholder="cantidad de envases" required>
          </div> 
        </div>
  
        <div class="col-md-6">
          <div class="form-group">
            <label for="medida">Medida</label>
             <input type="text" class="form-control" id="medida" name="medida" readonly>
          </div>
          <div class="form-group">
            <label for="cantidad">Contenido envase</label>
            <input type="number" class="form-control" id="cantidad" name="contenidoEnvase" required>
          </div>
        </div>
        
        <div class="col-auto ms-auto" >
           <button class="btn btn-success mt-4" type="" style="float: right; font-size: 1.5rem;">
    <i class="bi bi-plus fs-2"> Añadir</i>
</button>
        </div>
      </div>
      
    </form>
<div id="alerta" class="mt-4"></div>
<table class="table table-hover" >
 <table class="table mt-4 table-hover" id= "editableTable${codigo}">
        <thead>
            <tr class="table-dark">
                <th scope="col">N°</th>
                <th scope="col">Material</th>
                <th scope="col">Cantidad envases</th>
                <th scope="col">Tipo envase</th>
                <th scope="col">Contenido envase</th>
                <th scope="col">Total</th>
                
                <th scope="col">Funciones</th>
            </tr>
        </thead>
        <tbody id = "listaCompra${codigo}">

        </tbody>
    </table>

            <form id="formularioPedido${codigo}">
                <input type="hidden" name="ver" value="registrar_PedidoCompra">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                <input type="hidden" name="usuario" value="${uk[0].idusuario}">
                 <button id=registrarLista class="btn btn-success" style="float: right;">
                    <i class="bi bi-send"></i> Registrar Lista
                </button>
            </form>

    <button id="cancelarLista" class="btn btn-primary">
        <i class="bi bi-x-circle"></i> Cancelar
    </button>`
    listar.innerHTML = view;
    const formu = document.querySelector(`#formularioPedido${codigo}`);
    document.querySelector('#cancelarLista').addEventListener('click', cancelarLista);
    formu.addEventListener("click", (e) => registrarPedido(e, formu));
    formu.reset();
    console.log("casi entro en mostrarSeleccion");

    const selectopciones = document.querySelector(`#material${codigo}`);
    console.log(selectopciones);
    selectopciones.addEventListener("change", function() {
        mostrarSeleccion();
    });
}
function mostrarSeleccion(){
    // var seleccion = document.getElementById("opciones").value;
    const medida = document.querySelector(`#material${codigo}`).value;
    console.log(materialArray);
    let itemMaterial = materialArray.find(item => item.id == medida);
    console.log(medida);
    let itemMedida = medidaArray.find(item => item.id == itemMaterial.medida);
    console.log(itemMaterial.medida);
    document.getElementById("medida").value = itemMedida.nombre;
}
function sitio(mostrarContenedor2 = true){
    let view=`
        <div class="container" id = contenedorGenerarListaCompra>
            <button id="btnMostrar1" class="btn btn-primary">Lista pedidos</button>
            <button id="btnMostrar2" class="btn btn-success">Nueva Solicitud</button>

            <div class="container mt-3" id="contenedor1">
        
            </div>
            <div class="container mt-3" id="contenedor2" style="display: none;">
         
            </div>
        </div>

      <div class="container mt-3" id="verListaC">

            </div>
            <div class="container mt-3" id="vistaEditar" style="display: none;">
         
            </div> 
    `;
    app.innerHTML=view;
    //  vistaVerLista();
    listarPedido();
    listarSolicitud();
    getempleado();
    // listarPedido();

    listarmedida()
    .then(() =>  listarTipo_envase())
    .then(() =>  listarMaterial())
    .then(() => {
        listar_ListaCompra();
        listar_PedidoCompra();
       
        // verListaCompra();
        const forme = document.querySelector(`#formulario${codigo}`);
        console.log(forme);
        forme.addEventListener("submit", (e) => sendform(e, forme));
        forme.reset();

        const table = document.getElementById(`editableTable${codigo}`);
        console.log(table);
        table.addEventListener("dblclick",(e) => edit_Celda_table(e));

        const medida = document.querySelector(`#material${codigo}`).value;
    console.log(materialArray);
    let itemMaterial = materialArray.find(item => item.id == medida);
    console.log(medida);
    let itemMedida = medidaArray.find(item => item.id == itemMaterial.medida);
    console.log(itemMaterial.medida);
    document.getElementById("medida").value = itemMedida.nombre;

    }).catch(error => {
        console.error('Error en la cadena de promesas:', error);
    });

    const btnMostrar1 = document.getElementById('btnMostrar1');
    const btnMostrar2 = document.getElementById('btnMostrar2');
    const contenedor1 = document.getElementById('contenedor1');
    const contenedor2 = document.getElementById('contenedor2');
    const vistaVerLista = document.getElementById('contenedor2');

    btnMostrar1.addEventListener('click', () => {
        contenedor1.style.display = 'block';
        contenedor2.style.display = 'none';
    });

    btnMostrar2.addEventListener('click', () => {
        contenedor1.style.display = 'none';
        contenedor2.style.display = 'block';
    });

    if (mostrarContenedor2) {
        contenedor1.style.display = 'block';
        contenedor2.style.display = 'none';
    } else {
        contenedor1.style.display = 'none';
        contenedor2.style.display = 'block';
    }
}
function eliminar_listaCompra_edit(id,ids,form){
    console.log("elimina listaCompra");
    console.log(idpedido);
    console.log(id);
    console.log(ids);
    console.log(form);
    if(confirm("Desea Eliminar..?")){
        // fetch(`./api/eliminar_listaCompra/${id}/${ids}`)
        fetch(`${URL_APIP}/api/eliminar_listaCompra_edit/${id}/${ids}`, {
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
                        listarEdicion(idpedido);
                        listarMaterial2()
                        .then(() =>  listarTipo_envase2())
                        // .then(() =>   listarmedida2())
                        .then(() => {
                            listar_ListaCompra_Editable(idpedido);
                            const formEdit = document.querySelector(`#formulariooo${codigo}`);
                            console.log(formEdit);
                            formEdit.addEventListener("submit", (e) => formularioEditar(e, formEdit,idpedido));
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
function eliminar_listaCompra(id,ids,form){
    console.log("elimina listaCompra");
    console.log(form);
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/eliminar_listaCompra/${id}/${ids}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data[0]=="ok"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    console.log(form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`);
                    setTimeout(() => {
                        
                        form.style.display="none";
                        sitio(false);
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
function eliminar_pedidoCompra(id,ids,form){
    console.log("elimina pedidoCompra");
    console.log(id);
    console.log(form);
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/eliminar_pedidoCompra/${id}/${ids}`)
        .then(res=>res.json() )
        .then(data=>{
            console.log(data);
            if(data[0]=="ok"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                        
                        form.style.display="none";
                        sitio(true);
                    }, 2000);
                    return;
                
               
            }else{
                form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                
                
                setTimeout(() => {
                    form.style.display="none";
                    sitio(true);
                }, 3000);
                return;
            }
            
        })
    }
}
function cancelarLista(){
    const botonCancelar = document.querySelector('#cancelarLista');
    console.log("cancela listaCompra");
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIP}/api/cancelar_listaCompra`)
        .then(res=>res.json())
        .then(data=>{
            if(data[0]=="ok"){
                    // form.innerHTML=<div class="alert alert-success" id="alerta">${data[1]}</div>;
                    
                    setTimeout(() => {
                        
                        // form.style.display="none";
                        sitio();
                    }, 2000);
                    return;
                
               
            }else{
                // form.innerHTML=<div class="alert alert-danger" id="alerta">${data[1]}</div>;
                
                
                setTimeout(() => {
                    // form.style.display="none";
                    sitio();
                }, 3000);
                return;
            }
            
        })
    }
    // listar_ListaCompra();
}
function sendform(e, form) {
    e.preventDefault();
    console.log(form);
    const dato = new FormData(form);
    console.log(dato);
        fetch(`${URL_APIP}/api/`,{
            method:"POST",
            body:dato
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data[0]=="success"){
                form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                
                setTimeout(() => {
                    
                    // form.reset();
                    sitio(false);
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
function registrarPedido(e, formu) {
    e.preventDefault();
    const dato = new FormData(formu);
    console.log(dato);

    // Obtener la fecha y hora actual en Bolivia
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
    
    dato.append('fecha', currentDate);
    dato.append('hora', currentTime);
    // dato.append('estado', '0');
    // dato.append('empleado', '1');
    console.log(dato);

    fetch(`${URL_APIP}/api/`, {
        method: "POST",
        body: dato
    })
    .then(res => res.json())
    .then(data => {
        console.log();
        if (data[0] === "success") {
            formu.innerHTML = `<div class="alert alert-success" id="alerta">${data[1]}</div>`;
            setTimeout(() => {
                formu.reset();
                sitio(true);
            }, 2000);
        } else {
            formu.innerHTML = `<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
            setTimeout(() => {
                sitio(true);
            }, 2000);
        }
    });
}
function listarMaterial2(){
    console.log("listo material");

    const listar=document.querySelector(`#material2${codigo}`);
    return fetch(`${URL_APIP}/api/listar_material/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        materialArray.length = 0;
        materialArray = data;     
        console.log("entre al data");
        let view="",ind=1;
        data.map(lista=>{
                
            view+=`
                <option value="${lista.id}">${lista.nombre} </option>
            `;
        })
        listar.innerHTML=view;
        console.log(listar);
        console.log("lista material completa");

    })
}

function listarTipo_envase2(){
    console.log("listo");
    const listar=document.querySelector(`#tipoEnvase2${codigo}`);
    return fetch(`${URL_APIP}/api/listaenvases/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        envaseArray.length = 0;
        envaseArray = data;
        let view="";
        data.map(lista=>{
            
            view+=`
                <option value="${lista.id}">${lista.nombre} </option>
            `;
        })
        listar.innerHTML=view;
        console.log("lista envase completa");
        
    })   
}
// function listarmedida2(){
//     console.log("listo medida");

//     const listar=document.querySelector(`#medida2${codigo}`);
//     return fetch(`${URL_APIP}/api/listamedidas/${uk[0].empresa.idempresa}`)
//     .then(res=>res.json())
//     .then(data=>{
//         medidaArray.length = 0;
//         medidaArray = data;     
//         console.log("entre al data");
//         let view="",ind=1;
//         data.map(lista=>{
                
//             view+=`
//                 <option value="${lista.id}">${lista.nombre} (${lista.sigla})</option>
//             `;
//         })
//         listar.innerHTML=view;
//         console.log("lista medida completa");

//     })
// }

function listarEdicion(idpedido){
    console.log("soy el inicio de listarEdicionn");
    const listar=document.querySelector("#vistaEditar");
    let view = `
     <button id="btnAtrasEdit" class="btn btn-primary" style="float: left;">
            <i class="bi bi-arrow-left"></i> VOLVER
        </button>  
        <br>
    <h2 class="text-center">Editar Lista Pedido</h2>
    <form id="formulariooo${codigo}">
    <input type="hidden" name="verDavid" value="registrar_ListaCompra_Editar">
   <input type="hidden" class="form-control" name="idpedido" id="idpedido" value="${idpedido}">
        <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="material2">Seleccione un material</label>
            <select class="form-select" id="material2${codigo}" name="material2"> </select>
          </div>
          <div class="form-group">          
            <label for="tipoEnvase2">Tipo envase</label>
             <select class="form-select" id="tipoEnvase2${codigo}" name="tipoEnvase2"> </select>
          </div>
          <div class="form-group">
            <label for="cantidadEnvase">Cantidad envases</label>
            <input type="number" class="form-control" id="cantidadEnvase" name="cantidadEnvase" placeholder="cantidad de envases">
          </div> 
        </div>
  
        <div class="col-md-6">
          <div class="form-group">
                <label for="medida">Medida</label>
                 <input type="text" class="form-control" id="medida2" name="medida2" value = "Hola">
          </div>
          <div class="form-group">
            <label for="cantidad">Contenido envase</label>
            <input type="number" class="form-control" id="cantidad" name="contenidoEnvase">
          </div>
         
        </div>
        
        <div class="col-auto ms-auto" >
           <button class="btn btn-success mt-4" type="" style="float: right;">
                    <i class="bi bi-plus fs-3"></i>
                </button>
        </div>
      </div>
      
    </form>
<div id="alerta" class="mt-4"></div>
<table class="table table-hover" >
 <table class="table mt-4 table-hover" id= "editableTable2${codigo}">
        <thead>
            <tr class="table-dark">
                <th scope="col">N°</th>
                <th scope="col">Material</th>
                <th scope="col">Cantidad envases</th>
                <th scope="col">Tipo envase</th>
                <th scope="col">Contenido envase</th>
                <th scope="col">Total</th>
                
                <th scope="col">Funciones</th>
            </tr>
        </thead>
        <tbody id = "listaCompraEditable${codigo}">

        </tbody>
    </table>
                <button id="btnFinEdit" class="btn btn-success" style="float: right;">
                    <i class="bi bi-send"></i> Finalizar Edicion
                </button>
        `
    listar.innerHTML = view;
    console.log(listar);
    const btnFinEdit = document.querySelector("#btnFinEdit");
    const btnAtrasEdit = document.querySelector("#btnAtrasEdit");
    const vistaEditar= document.querySelector("#vistaEditar");
    const vistaPrincipall = document.querySelector("#contenedorGenerarListaCompra");

    const table2 = document.getElementById(`editableTable2${codigo}`);
    console.log(table2);
    table2.addEventListener("dblclick",(e) => edit_Celda_table_edicion(e));

    btnAtrasEdit.addEventListener('click', () => {
        vistaPrincipall.style.display = 'block'; 
        vistaEditar.style.display = 'none';
    });
    btnFinEdit.addEventListener('click', () => {
        vistaPrincipall.style.display = 'block'; 
        vistaEditar.style.display = 'none';
    });
    console.log("soy el finalll de listarEdicionn");
}

function listar_ListaCompra_Editable(idpedido){
    console.log(idpedido);
    const listarr=document.querySelector(`#listaCompraEditable${codigo}`);
//    fetch(`./api/listar_ListaCompra/${idpedido}/${uk[0].empresa.idempresa}`)
   fetch(`${URL_APIP}/api/listar_ListaCompraEditable/${idpedido}/${uk[0].empresa.idempresa}`, {
    headers: {
        'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
    }
})
   .then(res=>res.json())
   .then(data=>{
       // data.length = 0;
       let view="",ind=1;
       console.log(data);
       Lista_compra_pedido_editable = data;
       console.log(Lista_compra_pedido_editable);
       data.map(lista=>{
           // listaCompra.push(lista);

           console.log("===============")
           let idMaterial = Number(lista.material2);
           let idEnvase = Number(lista.tipoEnvase2);
           let idMedida = Number(lista.medida2);
           console.log(idMedida);
           console.log(medidaArray);
           let itemEnvase = envaseArray.find(obj => obj.id == idEnvase);
           let itemMaterial = materialArray.find(item => item.id === idMaterial);
           let itemMedida = medidaArray.find(dat => dat.id === idMedida);
           
           view+=`
            <tr>
               <td >${ind++}</td>             
               <td data-type="${lista.id},material2,${uk[0].empresa.idempresa}">${itemMaterial.nombre}</td>               
               <td data-type="${lista.id},cantidadEnvase,${uk[0].empresa.idempresa}">${lista.cantidadEnvase} </td>
               <td data-type="${lista.id},tipoEnvase2,${uk[0].empresa.idempresa}">${itemEnvase.nombre} </td>
               <td data-type="${lista.id},medida2,${uk[0].empresa.idempresa}">${lista.contenidoEnvase} ${itemMedida.sigla} </td>
               <td data-type="${lista.id},total_material,${uk[0].empresa.idempresa}">${lista.total_material}</td>

               <td>
                   <a data-id="iconoEditarPedidoEdicion,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-primary btn-sm" title="Editar">
                       <i class="bi bi-pencil-square"></i>
                   </a>  
                   <a data-id="eliminar_listaCompra_edit,${lista.id},${uk[0].empresa.idempresa}" class="btn btn-danger" title="Eliminar">
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

function formularioEditar(e, form,idpedido) {
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
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data[0]=="success"){
                form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                
                setTimeout(() => {
                    
                     form.reset();
                    // sitio(false);
                    listarEdicion(idpedido)
                    listarMaterial2()
                    .then(() =>  listarTipo_envase2())
                    // .then(() =>   listarmedida2())
                    .then(() => {
                        listar_ListaCompra_Editable(idpedido);
                        const formEdit = document.querySelector(`#formulariooo${codigo}`);
                        console.log(formEdit);
                        formEdit.addEventListener("submit", (e) => formularioEditar(e, formEdit,idpedido));
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

function IconoEditarPedido(event) {
    console.log(Lista_compra_pedido);
    const permisos = [1, 2, 3, 4];
    // contenidoEnvase  cantEnvase  tipoEnvase  material
const names = ["material", "cantEnvase", "tipoEnvase", "medida", "contenidoEnvase"];
const boton = event.currentTarget;
const fila = boton.closest("tr");
const celdas = fila.querySelectorAll("td");
console.log(celdas);
const dataid = boton.getAttribute('data-id');
console.log(dataid);
console.log(fila);
const [funcion, id1, id2] = dataid.split(',');
const objmaterial = Lista_compra_pedido.find(obj => obj.id == Number(id1));
console.log(objmaterial);
console.log(Lista_compra_pedido);
const objmaterialc = { ...objmaterial };
let originalValues = {};

console.log(funcion, id1, id2);

if (boton.innerHTML.includes('bi-pencil-square')) {
    // Modo Editar
    let firstInput;
    celdas.forEach((celda, index) => {
        if (permisos.includes(index)) {
            const valorOriginal = celda.textContent.trim();
            console.log(valorOriginal);
            originalValues[index] = valorOriginal;
    
            let input;
            let select;
    
            if (index === 1 || index === 3 || index === 4) {
                if (index === 4) {
                    // Crear y añadir el input solo con valores numéricos
                    input = document.createElement('input');
                    input.id = `ediinp${codigo}`;
                    input.className = "form-control";
                    input.type = "number";  // Solo valores numéricos
                    input.value = valorOriginal.match(/\d+/)[0];  // Extraer el valor numérico
    
                    // Crear y añadir el select
                    select = createSelectElement(names[permisos.indexOf(index)]);
                    select.value = objmaterial[names[permisos.indexOf(index)]];
    
                    // Limpiar la celda y añadir ambos elementos
                    celda.innerHTML = '';
                    celda.appendChild(input);
                    celda.appendChild(select);
                } else {
                    // Crear y añadir solo el select
                    select = createSelectElement(names[permisos.indexOf(index)]);
                    console.log(select);
                    if (select) {
                        celda.innerHTML = '';
                        select.value = objmaterial[names[permisos.indexOf(index)]];
                        celda.appendChild(select);
                    } else {
                        console.error(`No se encontró el elemento con id #${names[index]}`);
                        return;
                    }
                }
            } else {
                // Crear y añadir solo el input
                input = document.createElement('input');
                input.id = `ediinp${codigo}`;
                input.className = "form-control";
                input.type = "text";
                input.value = valorOriginal;
                celda.innerHTML = '';
                celda.appendChild(input);
            }
                 // Añadir evento de teclado
                 console.log(input);
                 console.log(select);
                 if(input){
                    input.addEventListener("keydown", handleKeyDown);
                 }else{
                    select.addEventListener("keydown", handleKeyDown);
                 }

            // Establecer el primer input para enfocar
            if (!firstInput) {
                firstInput = input;
            }
        }
    });
    


    // Enfocar el primer input
    if (firstInput) {
        firstInput.focus();
    }
    boton.innerHTML = '<i class="bi bi-floppy"></i>';
} else {
    guardarCambios();
}

function handleKeyDown(event) {
    if (event.key === "Enter") {
        console.log("estoy en el enterrrr");
        guardarCambios();
    } else if (event.key === "Escape") {
        cancelarCambios();
    }
}

    function guardarCambios() {
        const datosnuevos = [];
        let linea = true;
        let nuevoValor = "";
        console.log(celdas);
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector(`input`);

                const select = celda.querySelector('select');
                if(input && select){
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        console.log(nuevoValor);
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }

                    nuevoValor = select.value;
                    let aux = medidaArray.find(obj => obj.id === Number(nuevoValor));
                    console.log(nuevoValor);
                    celda.textContent += " "+aux.sigla;//select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);
                }else if (input) {
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        console.log(nuevoValor);
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }
                } else if (select) {
                    nuevoValor = select.value;
                    console.log(nuevoValor);
                    celda.textContent = select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);

                }
                
            }
        });
        console.error(linea);
        
        if(linea){
            console.log(datosnuevos);
            // "material", "cantEnvase", "tipoEnvase", "medida", "contenidoEnvase"
            objmaterial['material'] = datosnuevos[0];
            objmaterial['cantidadEnvase'] = datosnuevos[1];
            objmaterial['tipoEnvase'] =Number(datosnuevos[2]);
            objmaterial['contenidoEnvase'] = Number(datosnuevos[3]);
            objmaterial['medida'] = Number(datosnuevos[4]);
            if (objmaterial) {
                Object.assign(Lista_compra_pedido, objmaterial);
            }
            console.log(objmaterial);
            console.log(objmaterialc);
            console.log(areObjectsEqual(objmaterial, objmaterialc));
            if (!areObjectsEqual(objmaterial, objmaterialc)) {
                const formData = new FormData();
                formData.append('verDavid', "IconoEditarPedido");
                formData.append('empresa', id2);
                Object.entries(objmaterial).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_material_aux = { ...obt_material_aux, ...objmaterialc };
                sendformData(event, formData);
            }

            console.log(Lista_compra_pedido);

            boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
            console.log(celdas);
            celdas.forEach(celda => {
                const input = celda.querySelector(`#ediinp${codigo}`);
                console.log(input);
                if (input) {
                    input.removeEventListener("keydown", handleKeyDown);
                }
            });
        }else{
            cancelarCambios();
        }
    }
   
    function cancelarCambios() {
        
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector('input');
                const select = celda.querySelector('select');
                
                if (input) {
                    celda.innerHTML = originalValues[index];
                } else if (select) {
                    celda.innerHTML = originalValues[index];
                }
            }
        });

        boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
        celdas.forEach(celda => {
            const input = celda.querySelector(`#ediinp${codigo}`);
            console.log(input);
            if (input) {
                input.removeEventListener("keydown", handleKeyDown);
            }
        });
    }

    boton.removeEventListener("click", IconoEditarPedido);
    boton.addEventListener("click", IconoEditarPedido);
}
function createSelectElement(inpKey) { 
    const elementId = `${inpKey}${codigo}`;
    console.log(elementId);
    const innerHTMLContent = document.querySelector(`#${elementId}`).innerHTML;
    console.log(innerHTMLContent);
    if (!innerHTMLContent) return null;
    
    const select = document.createElement('select');
    select.className = 'form-select';
    select.name = inpKey;
    select.innerHTML = innerHTMLContent;
    return select;
}

function areObjectsEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {

        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}

function sendformData(event, formData) {
    event.preventDefault();
    fetch(`${URL_APIP}/api/`, { // Reemplaza esto con la URL de tu servidor
        method: 'POST',
        body: formData,
        headers: {
            'Usar-Registro-David': 'true'
        }
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        // alertas(data);
        console.log(data);
        if(data[0]=="success"){
            formData.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
            
            setTimeout(() => {
                
                // form.reset();
                sitio(false);
            }, 2000);
            return;
        }else{
            formData.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
        setTimeout(() => {
            formData.remove();
            sitio(false);
        }, 3000);
        return;
    }
        
    })
    .catch(error => {
        console.error('Error al enviar los datos:', error);
    });
}

function iconoEditarPedidoEdicion(event) {
    console.log(Lista_compra_pedido_editable);
    const permisos = [1, 2, 3, 4];
    // contenidoEnvase  cantEnvase  tipoEnvase  material
const names = ["material2", "cantEnvase", "tipoEnvase2", "medida2", "contenidoEnvase"];
const boton = event.currentTarget;
const fila = boton.closest("tr");
const celdas = fila.querySelectorAll("td");
console.log(celdas);
const dataid = boton.getAttribute('data-id');
console.log(dataid);
console.log(fila);
const [funcion, id1, id2] = dataid.split(',');
const objmaterial = Lista_compra_pedido_editable.find(obj => obj.id == Number(id1));
console.log(objmaterial);
console.log(Lista_compra_pedido_editable);
const objmaterialc = { ...objmaterial };
let originalValues = {};

console.log(funcion, id1, id2);

if (boton.innerHTML.includes('bi-pencil-square')) {
    // Modo Editar
    let firstInput;
    celdas.forEach((celda, index) => {
        if (permisos.includes(index)) {
            const valorOriginal = celda.textContent.trim();
            console.log(valorOriginal);
            originalValues[index] = valorOriginal;
    
            let input;
            let select;
    
            if (index === 1 || index === 3 || index === 4) {
                if (index === 4) {
                    // Crear y añadir el input solo con valores numéricos
                    input = document.createElement('input');
                    input.id = `ediinp${codigo}`;
                    input.className = "form-control";
                    input.type = "number";  // Solo valores numéricos
                    input.value = valorOriginal.match(/\d+/)[0];  // Extraer el valor numérico
    
                    // Crear y añadir el select
                    select = createSelectElement(names[permisos.indexOf(index)]);
                    select.value = objmaterial[names[permisos.indexOf(index)]];
    
                    // Limpiar la celda y añadir ambos elementos
                    celda.innerHTML = '';
                    celda.appendChild(input);
                    celda.appendChild(select);
                } else {
                    // Crear y añadir solo el select
                    select = createSelectElement(names[permisos.indexOf(index)]);
                    console.log(select);
                    if (select) {
                        celda.innerHTML = '';
                        select.value = objmaterial[names[permisos.indexOf(index)]];
                        celda.appendChild(select);
                    } else {
                        console.error(`No se encontró el elemento con id #${names[index]}`);
                        return;
                    }
                }
            } else {
                // Crear y añadir solo el input
                input = document.createElement('input');
                input.id = `ediinp${codigo}`;
                input.className = "form-control";
                input.type = "text";
                input.value = valorOriginal;
                celda.innerHTML = '';
                celda.appendChild(input);
            }
          // Añadir evento de teclado
          console.log(input);
          console.log(select);
          if(input){
             input.addEventListener("keydown", handleKeyDown);
          }else{
             select.addEventListener("keydown", handleKeyDown);
          }

     // Establecer el primer input para enfocar
     if (!firstInput) {
         firstInput = input;
     }
        }
    });
    


    // Enfocar el primer input
    if (firstInput) {
        firstInput.focus();
    }
    boton.innerHTML = '<i class="bi bi-floppy"></i>';
} else {
    guardarCambios();
}

function handleKeyDown(event) {
    if (event.key === "Enter") {
        guardarCambios();
    } else if (event.key === "Escape") {
        cancelarCambios();
    }
}

    function guardarCambios() {
        const datosnuevos = [];
        let linea = true;
        let nuevoValor = "";
        console.log(celdas);
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector(`input`);

                const select = celda.querySelector('select');
                if(input && select){
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        console.log(nuevoValor);
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }

                    nuevoValor = select.value;
                    let aux = medidaArray.find(obj => obj.id === Number(nuevoValor));
                    console.log(nuevoValor);
                    celda.textContent += " "+aux.sigla;//select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);
                }else if (input) {
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        console.log(nuevoValor);
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }
                } else if (select) {
                    nuevoValor = select.value;
                    console.log(nuevoValor);
                    celda.textContent = select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);

                }
                
            }
        });
        console.error(linea);
        
        if(linea){
            console.log(datosnuevos);
            // "material", "cantEnvase", "tipoEnvase", "medida", "contenidoEnvase"
            objmaterial['material2'] = datosnuevos[0];
            objmaterial['cantidadEnvase'] = datosnuevos[1];
            objmaterial['tipoEnvase2'] =Number(datosnuevos[2]);
            objmaterial['contenidoEnvase'] = Number(datosnuevos[3]);
            objmaterial['medida2'] = Number(datosnuevos[4]);
            if (objmaterial) {
                Object.assign(Lista_compra_pedido_editable, objmaterial);
            }
            console.log(objmaterial);
            console.log(objmaterialc);
            console.log(areObjectsEqual(objmaterial, objmaterialc));
            if (!areObjectsEqual(objmaterial, objmaterialc)) {
                const formData = new FormData();
                formData.append('verDavid', "iconoEditarPedidoEdicion");
                formData.append('empresa', id2);
                Object.entries(objmaterial).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_material_aux = { ...obt_material_aux, ...objmaterialc };
                sendformDataEditicion(event, formData);
            }

            console.log(Lista_compra_pedido_editable);

            boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
            celdas.forEach(celda => {
                const input = celda.querySelector(`#ediinp${codigo}`);
                if (input) {
                    input.removeEventListener("keydown", handleKeyDown);
                }
            });
        }else{
            cancelarCambios();
        }
    }
   
    function cancelarCambios() {
        
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector('input');
                const select = celda.querySelector('select');
                
                if (input) {
                    celda.innerHTML = originalValues[index];
                } else if (select) {
                    celda.innerHTML = originalValues[index];
                }
            }
        });

        boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
        celdas.forEach(celda => {
            const input = celda.querySelector(`#ediinp${codigo}`);
            if (input) {
                input.removeEventListener("keydown", handleKeyDown);
            }
        });
    }

    boton.removeEventListener("click", iconoEditarPedidoEdicion);
    boton.addEventListener("click", iconoEditarPedidoEdicion);
}

function sendformDataEditicion(event, formData) {
    event.preventDefault();
    console.log("estoy dentro de sendFormDataEditiicion");
    fetch(`${URL_APIP}/api/`, { // Reemplaza esto con la URL de tu servidor
        method: 'POST',
        body: formData,
        headers: {
            'Usar-Registro-David': 'true'
        }
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        // alertas(data);
        console.log(data);
        if(data[0]=="success"){
            formData.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
            
            setTimeout(() => {
                
                // form.reset();
                listarEdicion(idpedido)
                listarMaterial2()
                .then(() =>  listarTipo_envase2())
                // .then(() =>   listarmedida2())
                .then(() => {
                    listar_ListaCompra_Editable(idpedido);
                    const formEdit = document.querySelector(`#formulariooo${codigo}`);
                    console.log(formEdit);
                    formEdit.addEventListener("submit", (e) => formularioEditar(e, formEdit,idpedido));
                    formEdit.reset();
                });
            }, 2000);
            return;
        }else{
            formData.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
        setTimeout(() => {
            formData.remove();
            sitio(false);
        }, 3000);
        return;
    }
        
    })
    .catch(error => {
        console.error('Error al enviar los datos:', error);
    });
}
function edit_Celda_table(e){
    const target = e.target;
    //   let input = null;
        let select = null;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            const [inpId,inpKey,id2] = dataType.split(',');            
            let listaPedido_obj = Lista_compra_pedido.find(obj => obj.id == Number(inpId));
            const confirm = { ...listaPedido_obj };
            let input = null;
            console.log(inpKey);
            if (inpKey === "contenidoEnvase") {
                        target.classList.add("editing");
                        target.innerHTML = '';
            console.log(listaPedido_obj);
                        // Crear el input
                        input = document.createElement("input");
                        input.type = "text";
                        input.value = listaPedido_obj["contenidoEnvase"];
                        input.className = "form-control";
                        // Crear el select
                        target.classList.add("editing");
                        target.innerHTML = '';
                        select = createSelectElement("medida");
                        select.value = listaPedido_obj["medida"];
                        // Añadir ambos elementos a la celda
                        target.appendChild(input);
                        target.appendChild(select);
                        input.focus();
                        // target.focus();
        }else if(inpKey === "material" || inpKey === "tipoEnvase"){
                input = createSelectElement(inpKey);
                if (input) {
                    target.classList.add("editing");
                    target.innerHTML = '';
                    target.appendChild(input);
                    input.focus();
                    console.log(input);
                    console.log(listaPedido_obj);
                    input.value = listaPedido_obj[inpKey];
                    
                    
                } else {
                    console.error(`No se encontró el elemento con id #${inpKey}${codigo}`);
                }
            }else if(inpKey === "cantidadEnvase"){
                target.classList.add("editing");
                target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

                input = target.querySelector("input");
                input.focus();
            }
            
            console.log(input);
            console.log(select);
            if(input){
                console.log(input);
                
                input.addEventListener("keydown", function(event) {
                    if (event.key === "Enter") {
                        
                        target.classList.remove("editing");
                        console.log(confirm);
                        let aux ;
                        let aux2;
                        if(select != null  && input.tagName.toLowerCase() != "select"){
                            target.textContent = input.value || originalValue;
                            aux = input.value || confirm[inpKey];

                            target.textContent = select.options[select.selectedIndex].text || originalValue;
                            aux2 = Number(select.value) || confirm[inpKey];
                        }else if (input.tagName.toLowerCase() === "select") {
                            target.textContent = input.options[input.selectedIndex].text || originalValue;
                            aux = Number(input.value) || confirm[inpKey];

                        } else {
                            target.textContent = input.value || originalValue;
                            aux = input.value || confirm[inpKey];

                        }
                        
                        console.log(listaPedido_obj);
                        console.log(inpKey);
                        Object.entries(listaPedido_obj).forEach(([key, value]) => {
                            console.log(key);
                            if(key === inpKey){
                                if(inpKey === "contenidoEnvase"){
                                    listaPedido_obj[key] = aux ;
                                    listaPedido_obj["medida"] = aux2;
                                }else{
                                listaPedido_obj[key] = aux ; //key=contenidoEnvase
                            }
                        }
                        });
                        console.log(listaPedido_obj);
                        if (listaPedido_obj) {
                            Object.assign(Lista_compra_pedido, listaPedido_obj);
                        }
                        console.log(Lista_compra_pedido);
                        console.log(areObjectsEqual(listaPedido_obj,confirm));
                        if(!areObjectsEqual(listaPedido_obj,confirm)){
                            const formData = new FormData();
                            formData.append('verDavid', "IconoEditarPedido");
                            formData.append('id', inpId);
                            formData.append('empresa', id2);
                            Object.entries(listaPedido_obj).forEach(([key, value]) => {
                                formData.append(key,value);
                            });
                            obt_material_aux = { ...obt_material_aux, ...confirm };
    
                            sendformData(e,formData);
                        }
                        
                       
                    } else if (event.key === "Escape") {
                        target.classList.remove("editing");
                        target.textContent = originalValue;
                    }
                });
    
                target.addEventListener("blur", function() {
                    target.classList.remove("editing");
                    target.textContent = originalValue;
                });
            }
            
            
        }
}

function edit_Celda_table_edicion(e){
    console.log("hola soy edicion de celda");
    const target = e.target;
      let input = null;
        let select = null;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            console.log(dataType);
            const [inpId,inpKey,id2] = dataType.split(',');      
            console.log(inpId);
            console.log(Lista_compra_pedido_editable);      
            let listaPedido_obj = Lista_compra_pedido_editable.find(obj => obj.id == Number(inpId));
            console.log(listaPedido_obj);
            const confirm = { ...listaPedido_obj };
            let input = null;
            console.log(inpKey);
            if (inpKey === "medida2") {
                        target.classList.add("editing");
                        target.innerHTML = '';
            console.log(listaPedido_obj);
                        // Crear el input
                        input = document.createElement("input");
                        input.type = "text";
                        input.value = listaPedido_obj["contenidoEnvase"];
                        input.className = "form-control";
                        // Crear el select
                        select = createSelectElement("medida2");
                        select.value = listaPedido_obj["medida2"];
                        // Añadir ambos elementos a la celda
                        target.appendChild(input);
                        target.appendChild(select);
                        input.focus();
                        target.focus();
        }else if(inpKey === "material2" || inpKey === "tipoEnvase2"){
                input = createSelectElement(inpKey);
                if (input) {
                    target.classList.add("editing");
                    target.innerHTML = '';
                    target.appendChild(input);
                    input.focus();
                    console.log(input);
                    console.log(listaPedido_obj);
                    input.value = listaPedido_obj[inpKey];
                    
                    
                } else {
                    console.error(`No se encontró el elemento con id #${inpKey}${codigo}`);
                }
            }else if(inpKey === "cantidadEnvase"){
                target.classList.add("editing");
                target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

                input = target.querySelector("input");
                input.focus();
            }
            

            if(input){
                input.addEventListener("keydown", function(event) {
                    if (event.key === "Enter") {
                        
                        target.classList.remove("editing");
                        console.log(confirm);
                        let aux ;
                        let aux2;
                        if(select != null && input.tagName.toLowerCase() != "select"){
                            target.textContent = input.value || originalValue;
                            aux = input.value || confirm[inpKey];

                            target.textContent = select.options[select.selectedIndex].text || originalValue;
                            aux2 = Number(select.value) || confirm[inpKey];
                        }else if (input.tagName.toLowerCase() === "select") {
                            target.textContent = input.options[input.selectedIndex].text || originalValue;
                            aux = Number(input.value) || confirm[inpKey];

                        } else {
                            target.textContent = input.value || originalValue;
                            aux = input.value || confirm[inpKey];

                        }
                        
                        
                        Object.entries(listaPedido_obj).forEach(([key, value]) => {
                            // if(key === inpKey){
                            //     listaPedido_obj[key] = aux ;
                            // }
                            console.log(key);
                            console.log(inpKey);
                            if(key === inpKey){
                                if(inpKey === "medida2"){
                                    listaPedido_obj["contenidoEnvase"] = aux ;
                                    listaPedido_obj["medida2"] = aux2;
                                }else{
                                listaPedido_obj[key] = aux ; //key=contenidoEnvase
                            }
                        }
                        });
                        if (listaPedido_obj) {
                            Object.assign(Lista_compra_pedido_editable, listaPedido_obj);
                        }
                        console.log(Lista_compra_pedido_editable);
                        console.log(areObjectsEqual(listaPedido_obj,confirm));
                        if(!areObjectsEqual(listaPedido_obj,confirm)){
                            const formData = new FormData();
                            formData.append('verDavid', "iconoEditarPedidoEdicion");
                            formData.append('id', inpId);
                            formData.append('empresa', id2);
                            Object.entries(listaPedido_obj).forEach(([key, value]) => {
                                formData.append(key,value);
                            });
                            obt_material_aux = { ...obt_material_aux, ...confirm };
    
                            sendformDataEditicion(e,formData);
                        }
                        
                       
                    } else if (event.key === "Escape") {
                        target.classList.remove("editing");
                        target.textContent = originalValue;
                    }
                });
    
                target.addEventListener("blur", function() {
                    target.classList.remove("editing");
                    target.textContent = originalValue;
                });
            }
            
            
        }
}