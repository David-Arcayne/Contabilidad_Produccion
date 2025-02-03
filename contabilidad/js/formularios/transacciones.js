import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let code=[];
const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100)+"transaccion";
let objtransacciones=[];
let objdetalletransaccion=[];
let objfactura=[];


const bloqueoElement = document.createElement('div');
bloqueoElement.style.position = 'fixed';
bloqueoElement.style.top = 0;
bloqueoElement.style.left = 0;
bloqueoElement.style.width = '100%';
bloqueoElement.style.height = '100%';
bloqueoElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
bloqueoElement.style.display = 'none';
document.body.appendChild(bloqueoElement);




export function ctransacciones(codigo, permisos, refrescar) {
    code=codigo;
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
}

function enlaces(){
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
}


function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id, ids,idt,idc] = dataid.split(',');
    
    switch (funcion) {
        case "detalletransaccion":
            detalletransaccion(id,ids);
            break;
        case "registronormal":
            registronormal(id);
            break;
        case "registromodelo":
            registromodelo(id);
            break;
        case "crearfactura":
            crearfactura(id,ids,idt);
            break;
        case "editarfactura":
            editarfactura(id,ids,idt,idc);
            break;
        case "eliminarFactura":
            eliminarFactura(id,ids,idt,idc);
            break;
        case "eliminarTransaccion":
            eliminarTransaccion(id);
            break;
        case "editartransaccion":
            editartransaccion(id);
            break;
        case "editardetalle":
            editardetalle(id,ids);
            break;
        case "eliminardetalle":
            eliminardetalle(id,ids);
            break;
        //
        case "duplicartransaccion":
            duplicartransaccion(id);
            break;
        case "transaccionnormal":
            transaccionnormal();
            break;
        case "transaccioninsertar":
            transaccioninsertar();
            break;
        
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}


function sitio(){

    let view=`

<div class="row">
<div class="col col-md-4" id="formulariotransaccion"></div>
<div class="col col-md-8">
<h4> <span id="gestion"></spna></h4>
<input type="text" id="buscartransaccion" class="form-control"  placeholder="Buscar ">
<div class="table-responsive"  style="height: 600px; overflow-y: scroll;">
<table class="table" >
<thead><th class="col-md-1">Nº Trans.</th><th class="col-md-2">Fecha</th><th class="col-md-1">Tipo</th><th class="col-md-6">Glosa</th><th></th></thead>

<tbody id="listatransacciones" ></tbody>

</table>
</div>
</div>
</div>
    
    `;
    app.innerHTML=view;
    listatransacciones();
    formulariotransaccion();
    getgestion();

    let searchInput = document.getElementById("buscartransaccion");
    searchInput.addEventListener("input", buscartransaccion);
    

}

function modal(){

    let view=`
    <button id="openModalBtn">Abrir Modal</button>

<div id="myModal" class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Actualizar Datos</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" id="modalContent">
        <!-- Aquí se mostrará el contenido del modal -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
        <button type="button" class="btn btn-primary" id="updateDataBtn">Actualizar</button>
      </div>
    </div>
  </div>
</div>
    `;

}

function buscartransaccion(dato) {
  console.log(dato);
    var input, filter, table, tr, i,j;
    input = document.getElementById("buscartransaccion");
    filter = input.value.toUpperCase();
    console.log(filter);
    table = document.getElementById("listatransacciones");
    tr = table.getElementsByTagName("tr");
    console.log(tr);
    for (i = 0; i < tr.length; i++) {
      let tds = tr[i].getElementsByTagName("td");
      console.log(tds)
      let flag=false;
      for (j=0;j<tds.length;j++){
          let td=tds[j];
          if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
              flag = true;
            } 
      }
      if(flag){
          tr[i].style.display = "";
      }
      else {
          tr[i].style.display = "none";
      }
    }
  }


function getgestion(){
const gg=document.querySelector("#gestion");
fetch(`${URL_APIC}/api/getgestionactual/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    
    let view=`Gestion Activa: ${data.nombre}(<span class="fs-6 fst-italic">${data.fechaini} a ${data.fechafin}</span>)`;
    gg.innerHTML=view;
})
}

function listatransacciones(){
    objtransacciones=[];
const tt=document.querySelector("#listatransacciones");
fetch(`${URL_APIC}/api/listatransacciones/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    const jsonString = JSON.stringify(data);
    localStorage.setItem("transacciones", jsonString);

    let view="",conso="";
    data.map(lista=>{

objtransacciones.push({id:lista.id,ntransaccion:lista.ntransaccion,fecha:lista.fecha,ttransaccion:lista.ttransaccion,glosa:lista.glosa,consolidar:lista.consolidar,gestion:lista.gestion,tipodecambio:lista.tipocambio});
    
if(lista.consolidar==1){
conso=` <a data-id="editartransaccion,${lista.id}" class="btn btn-primary btn-sm" data-bs-toggle="tooltip" data-bs-title="Editar Transaccion"><i class="bi bi-pencil-square"></i><a> <a data-id="eliminarTransaccion,${lista.id}" class="btn btn-danger btn-sm" ><i class="bi bi-trash"></i><a>  <a data-id="detalletransaccion,${lista.id}" class="btn btn-primary btn-sm"><i class="bi bi-card-list"></i><a> <a data-id="duplicartransaccion,${lista.id}" class="btn btn-info btn-sm"><i class="bi bi-copy"></i></a>`;
}else{
conso=`<a data-id="verdetalletransaccion(${lista.id})" class="btn btn-primary btn-sm"><i class="bi bi-card-list"></i><a>`;
}
        let debe=0,haber=0;
        lista.detalle.map(de=>{
        debe=debe+parseFloat(de.debe);
        haber=haber+parseFloat(de.haber);
        })
        debe=debe.toFixed(2);
        haber=haber.toFixed(2);
        let color="";
        if(debe==haber){
            color="";
        }else{
            color="table-danger"
        }
let fecha=convertirFecha(lista.fecha);
        view+=`
        <tr class="${color}">
        <td>${lista.ntransaccion}</td>
        <td>${fecha}</td>
        <td>${lista.ttransaccion}</td>
        <td style="width:200px;">${lista.glosa}</td>
        <td>${conso}</td>
        </tr>
        `;
    });
    tt.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });


})
}
function duplicartransaccion(id){
if(confirm("Desea duplicara la transaccion..?")){
    fetch(`${URL_APIC}/api/duplicartransaccion/${id}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        sitio();
    })
}
}

function eliminarTransaccion(id){
    if(confirm("Desea Eliminar ..?")){
        fetch(`${URL_APIC}/api/eliminartransaccion/${id}/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            if(data[0]=="success"){
            sitio();
            }else{
                alert(data[1]);
            }
        })
    }
}
function detalletransaccion(dato){
    
    const tt=objtransacciones.filter(x=>x.id==dato);
    
    let view=`
    <div class="row">
    <div class="col col-4">
    <nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a data-id="sitio" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
    <li class="breadcrumb-item active" aria-current="page">Detalle Transaccion</li>
  </ol>
</nav>

    <p><b>Asiento Contable #</b> ${tt[0].ntransaccion} <br> <b>Glosa:</b> ${tt[0].glosa}</p>
    <a data-id="registronormal,${tt[0].id}" class="btn btn-dark btn-sm">Registro Normal</a> <a data-id="registromodelo,${tt[0].id}" class="btn btn-dark btn-sm">Asiento Modelo</a>
    <hr>
    <div id="registroformulario"></div>
    
    </div>
    <div class="col col-8">
    <p><b>Detalle</b></p>
    <div class="table-responsive"  style="overflow:scroll; height:400px;">
    <table class="table">
    <thead><th>Cuenta Contable</th><th>Debe</th><th>Haber</th><th>Nota</th><th></th></thead>
    <tbody id="listadetalletransaccion"></tbody>
    </table>
    </div>
    </div>
    </div>

    
    `;
    app.innerHTML=view;    
    registronormal(tt[0].id);
    listadetalletransaccion(tt[0].id);
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
}

function listadetalletransaccion(dato){
    const dt=document.querySelector("#listadetalletransaccion");
    objdetalletransaccion=[];
    fetch(`${URL_APIC}/api/listadetalletransaccion/${dato}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        let debe=0,haber=0,diferencia="";
        data.map(lista=>{
            objdetalletransaccion.push({id:lista.id,idplan:lista.idplan,debe:lista.debe,haber:lista.haber,nota:lista.nota,plan:lista.plan});
            debe=debe+parseFloat(lista.debe);
            haber=haber+parseFloat(lista.haber);
            view+=`<tr>
            <td>${lista.plan}</td>
            <td>${lista.debe} <a data-id="crearfactura,${dato},2,${lista.id}" class="btn btn-primary btn-sm">F</a> <!--a onclick="crearrecibo(${dato},2,${lista.id})" class="btn btn-warning btn-sm">R</a --></td>
            <td>${lista.haber} <a data-id="crearfactura,${dato},1,${lista.id}" class="btn btn-primary btn-sm">F</a> <!--a onclick="crearrecibo(${dato},1,${lista.id})" class="btn btn-warning btn-sm">R</a --></td>
            <td>${lista.nota}</td>
            <td><a data-id="editardetalle,${lista.id},${dato}" class="btn btn-primary btn-sm"><i class="bi bi-pencil-square"></i></a> <a data-id="eliminardetalle,${lista.id},${dato}" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></a></td>
            </tr>`;
        })
        debe=debe.toFixed(2);
        haber=haber.toFixed(2);
        let color="",text="";
        if(debe===haber){
            color="secondary";
        }else{
            color="danger"
            diferencia=`<tr class="table-${color} text-white"><td class="text-danger">No cuadra</td><td class="text-danger">${(haber-debe).toFixed(2)}</td><td class="text-danger">${(debe-haber).toFixed(2)}</td><td></td><td></td></tr>`;
            text=`<div class="alert alert-danger"> Por favor verifique los resultados, por que no cuadra.</div>`;
        }
        view+=`<tr class="table-${color}"><td>TOTALES</td><td>${debe}</td><td>${haber}</td><td></td><td></td></tr>${diferencia}<hr>${text}`;
        dt.innerHTML=view;
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });
    })
}
function editardetalle(idcuenta,idtransaccion){
    console.log(idcuenta+"--"+idtransaccion)
    const dd=objdetalletransaccion.filter(x=>x.id==idcuenta);
    console.log(dd)
    let view=`
    
    <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a data-id="detalletransaccion,${idtransaccion}" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
      <li class="breadcrumb-item active" aria-current="page">Editar Cuenta ${dd[0].plan} </li>
    </ol>
  </nav>

    <form id="formulario${codigo}">
    <input type="hidden" name="ver" id="yof" value="detalletransaccionnormalf5">
    <input type="hidden" name="iddetalle" id="trans" value="${idcuenta}">
    <input type="hidden" name="trans"  value="${idtransaccion}">

    <input type="text" id="searchInputEdit" class="form-control" placeholder="Buscar Plan..">
    <div class="input-group">
    <span class="input-group-text">Cuenta</span>
    <select id="plandecuentaEdit" size="5" name="plandecuenta" class="form-select" required>
    </select> 
    </div>

    <label> DEBE<input type="text" name="debe" class="form-control" value="${dd[0].debe}" required> </label>
    <label>HABER<input type="text" name="haber" value="${dd[0].haber}" class="form-control" required> </label>
    <textarea name="nota" placeholder="Nota" class="form-control" cols="10" rows="3">${dd[0].nota}</textarea>
    
    
    <button type="submit" class="btn btn-primary" > Actualizar</button> 
    </form>
    
    `;
    app.innerHTML=view;
    plandecuentaEdit(dd[0].idplan)
    let searchInput = document.getElementById("searchInputEdit");
    searchInput.addEventListener("input", searchSelectEdit);

    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));
    const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });

}

function crearfactura(transaccion,tipo,cuenta){
    
    const fechaActual = new Date();
    const mifecha = fechaActual.toISOString().slice(0,10);

//debe es venta(tipo=2) cliente, haber es compra(tipo=1)
let ti="",proc="",estado="";
if(tipo==2){
    ti=`Crear Factura Venta`;
    proc=`<div class="input-group mb-1">
    <span class="input-group-text">Cliente</span><select id="cliente" size="5" name="cliente" class="form-select" required></select></div>`;
    estado=`<label>Estado Cobro
    <select name="cobrar" class="form-select" >
    <option value="1">Por Cobrar</option>
    <option value="2" selected>Cobrado</option>
    </select></label>`;
    
}else{
    ti=`Crear Factura Compra`;
    proc=`<div class="input-group mb-1">
    <span class="input-group-text">Proveedor</span><select id="proveedor" size="5" name="cliente" class="form-select" required></select></div>`;
    estado=`<label>Estado Pago
    <select name="pagar" class="form-select" >
    <option value="1">Por Pagar</option>
    <option value="2" selected>Pagado</option>
    </select></label>
    `;
    
}

    let view=`
   
    <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a data-id="detalletransaccion,${transaccion}" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
      <li class="breadcrumb-item active" aria-current="page">${ti}</li>
    </ol>
  </nav>
  <button type="button" id="clickqr" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#qrModal">
  Leer QR
</button>
<div class="modal fade" id="qrModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-md">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Escaneo de QR</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      <div style="width: 400px" id="reader"></div>
      <div id="qrResultado"></div>
      
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
      </div>
    </div>
  </div>
</div>

    <form id="formulario${codigo}">
    <input type="hidden" name="ver" id="yof" value="crearfacturas">
    <input type="hidden" name="trans" id="trans" value="${transaccion}">
    <input type="hidden" name="clasefactura" id="clasefactura" value="${tipo}">
    <input type="hidden" name="cuenta" id="cuenta" value="${cuenta}">
    <input type="hidden" name="empresa" id="empresa" value="${uk[0].empresa.idempresa}">
    <input type="hidden" name="sucursal" id="sucursal" value="${uk[0].empresa.idsucursal}">
    <input type="hidden" name="espesificacion" id="tipo" value="${tipo}">
    
    <label>Fecha <input type="date" id="fechafactura" name="fechatfactura" placeholder="fecha" class="form-control" value="${mifecha}" required></label>
    <label>#Factura<input type="number" id="nfactura" name="nfactura" placeholder="# factura" class="form-control" required>
    </label>
    <label>#Autorizacion<input type="text" id="nautorizacion" name="nautorizacion" placeholder="# Autorizacion CUF" class="form-control" required>
    </label>
    <input type="hidden" id="codigocontrol" name="codigocontrol"  class="form-control" value="0" >
    
    <label>Monto<input type="number" name="montofactura" id="montofactura" placeholder="Monto Factura" class="form-control"  step="0.01" required>
    </label>
    <label>Tasa 0<input type="number" name="tasacero" id="tasa0" placeholder="Tasa 0" class="form-control"  step="0.01" value="0" required>
    </label>
    <label>Export<input type="number" name="export" id="export" placeholder="Export" class="form-control"  step="0.01" value="0" required>
    </label>
    <label># Poliza<input type="text" name="npoliza" id="npoliza" placeholder="# Poliza" class="form-control" value="0" required>
    </label>
    <label>Iceiecdhotros<input type="number" name="iceiecdhotros" id="iceiecdhotros" placeholder="Iceiecdhotros"  step="0.01" value="0" class="form-control" required>
    </label>
    <label>Descuento Bonificacion<input type="text" name="descuentobonificacion" id="descuetobonificacion" placeholder="Descuento Bonificacion" class="form-control" value="0" step="0.01" required>
    </label>
    <!--label>Especificacion <select name="especificacionBorrar" class="form-select" required>
    <option value="1">Compras</option>
    <option value="2">Ventas</option>
    </select -->
    </label>
    <input type="text" id="searchInputplan" class="form-control"  placeholder="Buscar ..">
    ${proc}

    ${estado}        

        <hr>
        <button type="submit" id="boton" class="btn btn-primary btn-sm" >Crear Factura</button>
        
    </form>
    
    <hr>
    <div class="table-responsive">
    <table class="table">
    <thead><th>Fecha</th><th>Factura</th><th>Cliente</th><th>Nit</th><th>Monto</th><th>Estado</th></thead>
    <tbody id="listafactura"></tbody>
    </table>
    </div>
    
    
    `;

    app.innerHTML=view;
    if(tipo==2){
    listaclientes();
    }else{
    listaproveedores();
    }
    listafactura(transaccion,tipo,cuenta);
// Accede al elemento de video y al área de salida dentro del modal
const qr=document.getElementById('clickqr');
qr.addEventListener('click', () => {
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);    
});

let searchInput = document.getElementById("searchInputplan");
console.log(searchInput);
searchInput.addEventListener("input", searchSelectPro);

  
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));

    const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });

}
function searchSelectPro() {
    const tipo=document.getElementById("tipo").value;
    console.log(tipo)
    // Obtenemos el valor del input y el select
    let plandecuenta;
    if(tipo==2){
    plandecuenta= document.getElementById("cliente");
    }else{
        plandecuenta= document.getElementById("proveedor");
    }
    console.log(plandecuenta)
    let filter = document.getElementById("searchInputplan").value.toLowerCase(); // Obtener el valor del filtro

    // Obtener todas las opciones del select
    let options = plandecuenta.getElementsByTagName("option");

    // Recorrer las opciones y aplicar el filtro
    for (let i = 0; i < options.length; i++) {
        const optionValue = options[i].text.toLowerCase();
        options[i].style.display = optionValue.includes(filter) ? "" : "none";
    }
}

function onScanSuccess(decodedText, decodedResult) {

    const resultdato=document.querySelector("#qrResultado");
    const parametrosURL = obtenerParametrosURL(decodedText);
    const nfactura=document.querySelector("#nfactura");
    const nautorizacion=document.querySelector("#nautorizacion");
    const nitu=document.querySelector("#searchInputplan");

// Accede a los parámetros por separado
const nit = parametrosURL['nit'];
const cuf = parametrosURL['cuf'];
const numero = parametrosURL['numero'];
    resultdato.innerHTML=`<hr> <br> NIT:${nit}<br>CUF:${cuf}<br>N.Factura:${numero}<br>
    `;
    nfactura.value=numero;
    nautorizacion.value=cuf;
    nitu.value=nit;

    // Handle on success condition with the decoded text or result.
    console.log(`Scan result: ${decodedText}`, decodedResult);
    // ...
    html5QrcodeScanner.clear();
    // ^ this will stop the scanner (video feed) and clear the scan area.
}

function obtenerParametrosURL(url) {
    // Divide la URL en base al símbolo '?'
    const partes = url.split('?');
    if (partes.length < 2) {
        return {}; // Devuelve un objeto vacío si no hay parámetros en la URL
    }
    
    // Obtiene la parte de la URL después del símbolo '?'
    const queryString = partes[1];
    
    // Divide la cadena de consulta en pares clave-valor
    const pares = queryString.split('&');
    
    // Crea un objeto para almacenar los parámetros
    const parametros = {};
    pares.forEach(par => {
        const [clave, valor] = par.split('=');
        parametros[clave] = valor;
    });
    
    return parametros;
}


function listafactura(transaccion,tipo,cuenta){
const lf=document.querySelector("#listafactura");
objfactura=[];
fetch(`${URL_APIC}/api/listafactura/${cuenta}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="",monto=0;
    data.map(lista=>{
        objfactura.push(lista);
        let cobrado="",pagado="";
            if(lista.cobrado==1)
            {
                cobrado="Por Cobrar";
            }else if(lista.cobrado==2){
                cobrado="Cobrado";
            }
            if(lista.pagado==1)
            {
                pagado="Por Pagar";
            }else if(lista.pagado==2){
                pagado="Pagado";
            }
            
        monto=monto+parseFloat(lista.montofactura);
        view+=`<tr>
        <td>${lista.fecha}</td>
        <td>${lista.nfactura}</td>
        <td>${lista.procli}</td>
        <td>${lista.nit}</td>
        <td>${lista.montofactura}</td>
        <td>${cobrado} ${pagado}</td>
        <td><a data-id="editarfactura,${lista.id},${transaccion},${tipo},${cuenta}" class="btn btn-primary"><i class="bi bi-pencil-square"></i></a> <a data-id="eliminarFactura,${lista.id},${transaccion},${tipo},${cuenta}," class="btn btn-danger"><i class="bi bi-trash"></i></a></td>
        </tr>`;
    })
    view+=`<tr><td colspan="4">Total</td><td>${monto.toFixed(2)}</td><td colspan="2"></td></tr>`;
    lf.innerHTML=view;
    const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });
})
}

function editarfactura(idfactura,transaccion,tipo,cuenta){
    //debe es venta(tipo=2) cliente, haber es compra(tipo=1)
    const fa=objfactura.filter(x=>x.id==idfactura);
    let ti="",proc="",estado="";
    if(tipo==2){
        ti=`Editar Factura Venta`;
        proc=`<label>Cliente<select id="cliente"  name="cliente" class="form-select" required></select></label>`;
        estado=`<label>Estado Cobro
        <select name="cobrar" class="form-select" >
        <option value="1">Por Cobrar</option>
        <option value="2" selected>Cobrado</option>
        </select></label>`;
        
    }else{
        ti=`Editar Factura Compra`;
        proc=`<label>Proveedor<select id="proveedor"  name="cliente" class="form-select" required></select></label>`;
        estado=`<label>Estado Pago
        <select name="pagar" class="form-select" >
        <option value="1">Por Pagar</option>
        <option value="2" selected>Pagado</option>
        </select></label>
        `;
        
    }
    
        let view=`

        <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a data-id="crearfactura,${transaccion},${tipo},${cuenta}" class="btn btn-success"><i class="bi bi-rewind-circle"></i> Volver</a></li>
          <li class="breadcrumb-item active" aria-current="page">${ti}</li>
        </ol>
      </nav>

        <form id="formulario${codigo}">
        <input type="hidden" name="ver" id="yof" value="crearfacturasf5">
        <input type="hidden" name="idfactura" id="yof" value="${idfactura}">
        <input type="hidden" name="trans" id="trans" value="${transaccion}">
        <input type="hidden" name="clasefactura" id="clasefactura" value="${tipo}">
        <input type="hidden" name="cuenta" id="cuenta" value="${cuenta}">

    
        <label>Fecha <input type="date" id="fechafactura" name="fechatfactura" placeholder="fecha" class="form-control" value="${fa[0].fecha}" required></label>
        <label>#Factura<input type="number" id="nfactura" name="nfactura" placeholder="# factura" class="form-control" value="${fa[0].nfactura}" required>
        </label>
        <label>#Autorizacion<input type="text" id="nautorizacion" name="nautorizacion" placeholder="# Autorizacion" class="form-control" value="${fa[0].nautorizacion}" required>
        </label>
        <label>#CUF<input type="text" id="codigocontrol" name="codigocontrol" placeholder="# CUF" class="form-control" value="${fa[0].codigocontrol}" required>
        </label>
        <label>Monto<input type="number" name="montofactura" id="montofactura" placeholder="Monto Factura" class="form-control" value="${fa[0].montofactura}" step="0.01" required>
        </label>
        <label>Tasa 0<input type="number" name="tasacero" id="tasa0" placeholder="Tasa 0" class="form-control"  step="0.01" value="${fa[0].tasacero}" required>
        </label>
        <label>Export<input type="number" name="export" id="export" placeholder="Export" class="form-control"  step="0.01" value="${fa[0].export}" required>
        </label>
        <label># Poliza<input type="text" name="npoliza" id="npoliza" placeholder="# Poliza" class="form-control" value="${fa[0].npoliza}" required>
        </label>
        <label>Iceiecdhotros<input type="number" name="iceiecdhotros" id="iceiecdhotros" placeholder="Iceiecdhotros"  step="0.01" value="${fa[0].ice}" class="form-control" required>
        </label>
        <label>Descuento Bonificacion<input type="text" name="descuentobonificacion" id="descuetobonificacion" placeholder="Descuento Bonificacion" class="form-control" value="${fa[0].descuentobonificacion}" step="0.01" required>
        </label>
        <label>Especificacion <select name="especificacion" class="form-select" required>
        <option value="1">Compras</option>
        <option value="2">Ventas</option>
        </select>
        </label>
    

        
        ${proc}
    
        ${estado}        
    
            <hr>
            <button type="submit" id="boton" class="btn btn-primary btn-sm">Actualizar Factura</button>
            
        </form>
        <div id="respuesta"></div>
        <hr>
        <div class="table-responsive">
        <table class="table">
        <thead><th>Fecha</th><th>Factura</th><th>Cliente</th><th>Nit</th><th>Monto</th><th>Estado</th></thead>
        <tbody id="listafactura"></tbody>
        </table>
        </div>
        
        `;
    
        app.innerHTML=view;
        if(tipo==2){
        listaclientesf5(fa[0].idcliente);
        }else{
        listaproveedoresf5(fa[0].idproveedor);
        }
        listafactura(transaccion,tipo,cuenta)

        const forme = document.querySelector(`#formulario${codigo}`);
        forme.addEventListener("submit", (e) => sendform(e, forme));
    
        const enlaces = document.querySelectorAll(".btn");
            enlaces.forEach(enlace => {
                enlace.addEventListener("click", menuempresa);
            });
    
    }

function eliminarFactura(idfactura,transaccion,tipo,cuenta){
    //eliminarFactura,${lista.id},${transaccion},${tipo},${cuenta}
if(confirm("Desea Eliminar")){
    fetch(`${URL_APIC}/api/eliminarfactura/${idfactura}`)
    .then(res=>res.json())
    .then(data=>{
        listafactura(transaccion,tipo,cuenta);
    })
}
}
function listaclientes(){
const cl=document.querySelector("#cliente");
fetch(`${URL_APIC}/api/listaclientes/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="";
    data.sort((a, b) => a.nsocial.localeCompare(b.nsocial));
    //data.sort((a, b) => a.nsocial.localeCompare(b.nsocial, 'es', { sensitivity: 'base' }));

    data.map(lista=>{
        view+=`<option value="${lista.id}">${lista.nit} ${lista.nsocial}</option>`;
    });
    cl.innerHTML=view;
})
}

function listaclientesf5(id){
    console.log(id)
    const cl=document.querySelector("#cliente");
    fetch(`${URL_APIC}/api/listaclientes/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        //data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        //data.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

        data.map(lista=>{
            if(id==lista.id){
                view+=`<option value="${lista.id}" selected>${lista.nsocial}</option>`;
            }else{
            view+=`<option value="${lista.id}">${lista.nsocial}</option>`;
            }
        })
        cl.innerHTML=view;
    })
    }
    
function listaproveedores(){
const pro=document.querySelector("#proveedor");
fetch(`${URL_APIC}/api/listaproveedores/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="";
    data.sort((a, b) => a.nombre.localeCompare(b.nombre));
    data.map(lista=>{
        view+=`<option value="${lista.id}">${lista.nit} ${lista.nombre}</option>`;
    })
    pro.innerHTML=view;
})
}

function listaproveedoresf5(id){
    const pro=document.querySelector("#proveedor");
    fetch(`${URL_APIC}/api/listaproveedores/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        data.map(lista=>{
            if(id==lista.id){
                view+=`<option value="${lista.id}" selected>${lista.nombre}</option>`;
            }else{
                view+=`<option value="${lista.id}">${lista.nombre}</option>`;
            }
        })
        pro.innerHTML=view;
    })
    }

function eliminardetalle(dato,id){
if(confirm("Desea Eliminar..?")){
    fetch(`${URL_APIC}/api/eliminardetalle/${dato}`)
    .then(res=>res.json())
    .then(data=>{
        detalletransaccion(id);
    })
}

}
function registronormal(dato){
    console.log(dato);
      
    const rr=document.querySelector("#registroformulario");
    
    let view=`
    <form id="formulario${codigo}" class="d-grid">
    <input type="hidden" name="ver" id="yof" value="detalletransaccionnormal">
    <input type="hidden" name="trans" id="trans" value="${dato}">
    <input type="hidden" name="empresa" id="trans" value="${uk[0].empresa.idempresa}">
    <input type="hidden" name="sucursal" id="trans" value="${uk[0].empresa.idsucursal}">
    
    <input type="text" id="searchInput" class="form-control" placeholder="Buscar Plan..">

    <div class="input-group mb-1 shadow">
    <span class="input-group-text">Cuenta</span>
    
    <select id="plandecuenta" size="5" name="plandecuenta" class="form-select" required>

    </select>
    </div>
    <div class="input-group mb-1 shadow">
    <span class="input-group-text">DEBE</span>
    <input type="number" name="debe" class="form-control" value="0" step="0.01" required>
    <span class="input-group-text">HABER</span>
    <input type="number" name="haber" value="0" class="form-control" step="0.01" required>
    </div>

    <div class="input-group mb-1 shadow">
    <span class="input-group-text">NOTA</span>
    <textarea name="nota" placeholder="Nota" class="form-control" cols="10" rows="3"></textarea>
    </div>
    
    <button type="submit" class="btn btn-primary"> Registrar</button> 
    </form>
    
    `;
rr.innerHTML=view;
plandecuenta();
    // Obtenemos el valor del input y el select
    let searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", searchSelect);


    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));
      
}

function convertirFecha(fecha) {
    const fechaParts = fecha.split('-');
    if (fechaParts.length !== 3) {
      throw new Error('Fecha en formato incorrecto. Debe ser YYYY-MM-DD');
    }
  
    const anio = fechaParts[0];
    const mes = fechaParts[1];
    const dia = fechaParts[2];
  
    return `${dia}-${mes}-${anio}`;
  }

function searchSelect() {
    let plandecuenta = document.getElementById("plandecuenta");
     // Obtener el valor del filtro
     const filter = searchInput.value.toLowerCase();

     // Obtener todas las opciones del select
     const options = plandecuenta.getElementsByTagName("option");
 
     // Recorrer las opciones y aplicar el filtro
     for (let i = 0; i < options.length; i++) {
       const optionValue = options[i].text.toLowerCase();
       options[i].style.display = optionValue.includes(filter) ? "" : "none";
     }
  }

  function searchSelectEdit() {
    // Obtener el valor del filtro del input de búsqueda
    let filter = document.getElementById("searchInputEdit").value.toLowerCase();

    // Obtener el select y todas sus opciones
    let plandecuenta = document.getElementById("plandecuentaEdit");
    let options = plandecuenta.getElementsByTagName("option");

    // Recorrer todas las opciones y aplicar el filtro
    for (let i = 0; i < options.length; i++) {
        const optionValue = options[i].textContent.toLowerCase(); // Obtener el texto de la opción

        // Verificar si el texto de la opción incluye el filtro
        if (optionValue.includes(filter)) {
            options[i].style.display = ""; // Mostrar la opción si coincide con el filtro
        } else {
            options[i].style.display = "none"; // Ocultar la opción si no coincide con el filtro
        }
    }
}


function plandecuentaEdit(dato){
    const pp=document.querySelector("#plandecuentaEdit");
    fetch(`${URL_APIC}/api/milistaplanes/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        let resu="";
        data.map(lista=>{
            if(lista.id==dato){
            resu+=`<option value="${lista.id}" selected>${lista.numero} ${lista.plan}</option>`;
            }else{
                resu+=`<option value="${lista.id}">${lista.numero} ${lista.plan}</option>`;
            }
        })
        pp.innerHTML=resu;
    })
}

function plandecuenta(){
    const pp=document.querySelector("#plandecuenta");
    fetch(`${URL_APIC}/api/milistaplanes/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        let resu="";
        data.map(lista=>{
            resu+=`<option value="${lista.id}">${lista.numero} ${lista.plan}</option>`;
        })
        pp.innerHTML=resu;
    })
}

function registromodelo(dato){
    console.log(dato)
    const rr=document.querySelector("#registroformulario");
    
    let view=`
    <form id="formulario${codigo}" class="d-grid">
        <input type="hidden" name="ver" value="detalletransaccion">
        <input type="hidden" name="trans" id="trans" value="${dato}">
        <input type="hidden" name="empresa" id="trans" value="${uk[0].empresa.idempresa}">
        <input type="hidden" name="sucursal" id="trans" value="${uk[0].empresa.idsucursal}">
        <div class="input-group mb-1 shadow">
        <span class="input-group-text">Asiento</span>
        <select   name="tipoasiento" id="tipoasiento" class="form-select" required>
                    
                </select>
        </div>

        <div class="input-group mb-1 shadow">
        <span class="input-group-text">Monto</span>
        <input type="number" name="monto" class="form-control"  required>
        </div>
            
        <button type="submit" class="btn btn-primary"> Registrar</button>
    </form>
    <div id="respuesta"></div>
    `;
rr.innerHTML=view;
listaasientosd();

const forme = document.querySelector(`#formulario${codigo}`);
forme.addEventListener("submit", (e) => sendform(e, forme));
}
function listaasientosd(){
    const cc=document.querySelector("#tipoasiento");
    fetch(`${URL_APIC}/api/listaasientos/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        data.map(lista=>{
            view+=`<option value="${lista.id}">${lista.nombre}</option>`;
        })
        cc.innerHTML=view;
    })
}

function editartransaccion(dato){
    const tt=objtransacciones.filter(x=>x.id==dato);
    console.log(tt);
    

    let view=`
    <nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a data-id="sitio" class="btn btn-success">Volver</a></li>
    <li class="breadcrumb-item active" aria-current="page">Editar Transaccione ${tt[0].ntransaccion}</li>
  </ol>
</nav>
    <p class="fw-bolder">Actualizacion : ${tt[0].ntransaccion}</p>
    <form id="formulario${codigo}" class="d-grid">
    <input type="hidden" name="ver" id="yof" value="registrotransaccionf5">
    <input type="hidden" name="idt" value="${dato}">
    <div class="flex">
    
    <div class="input-group mb-1" id="codigo"><span class="input-group-text">N.Transaccion</span><input type="text" name="codigo" value="${tt[0].ntransaccion}"  class="form-control"></div>

    <div class="input-group mb-1">
    <span class="input-group-text" >Fecha</span>
    <input type="date" name="fecha" class="form-control" value="${tt[0].fecha}" required>
    </div>
    <div class="input-group mb-1">
    <span class="input-group-text" >Tipo Cambio</span>
    
    <select name="tipodecambio" id="tipodecambio"  class="form-select" required></select>
    </div>
    <div class="input-group mb-1">
    <span class="input-group-text" >Tipo Asiento</span>
    <select id="tipotransaccion" name="tipotransaccion" class="form-select" required>  </select>
    </div>

    <div class="input-group mb-1">
    <span class="input-group-text" >Glosa</span>
    <textarea name="descripcion" id="descripcion"  class="form-control" cols="10" rows="3" required>${tt[0].glosa}</textarea>
    </div>
    <div class="input-group mb-1">
    <span class="input-group-text" >Gestion</span>
    <select id="gestion" name="gestion" class="form-select" required>  </select>
    </div>

    </div>
    <button type="submit" class="btn btn-primary"> Actualizar</button>
    </form>
<div id="respuesta"></div>

    `;
    app.innerHTML=view;
    tipodecambiof5(tt[0].tipodecambio);
    tipotransaccionf5(tt[0].ttransaccion);
    gestionlista(tt[0].gestion);

    

    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });

}

function gestionlista(id){
    const gg=document.querySelector("#gestion");
    fetch(`${URL_APIC}/api/gestionlista/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view=``,option="";
        data.map(lista=>{
            if(lista.id==id)
            {
                option=`<option value="${lista.id}" selected>${lista.gestion}</option>`;
            }else{
                option=`<option value="${lista.id}">${lista.gestion}</option>`;
            }
            view+=`${option}`;
        })
        gg.innerHTML=view;
    })

}

function formulariotransaccion(){
    
    const ft=document.querySelector("#formulariotransaccion");
    
    let view=`
    <p class="fw-bolder">Registro Transacciones</p>
    <a data-id="transaccionnormal" class="btn btn-dark btn-sm">Registro Normal</a> <a data-id="transaccioninsertar" class="btn btn-dark btn-sm">Insertar abajo de</a>
   <div id="formutransaccion"></div>
    `;
    ft.innerHTML=view;
    enlaces();
    transaccionnormal();
    
}

function transaccionnormal(){

    const fechaActual = new Date();
    const mifecha = fechaActual.toISOString().slice(0,10);
    const ft=document.querySelector("#formutransaccion");
    let view=`
    <hr>
    <form id="formulario${codigo}" class="d-grid">
    <input type="hidden" name="ver" id="yof" value="registrotransaccion">
    <input type="hidden" name="empresa" id="yof" value="${uk[0].empresa.idempresa}">
    <input type="hidden" name="sucursal" id="yof" value="${uk[0].empresa.idsucursal}">
    <div class="flex">
  
    <div class="input-group mb-1" id="codigo">
    </div>
  
    <div class="input-group mb-1">
    <span class="input-group-text" >Fecha</span>
    <input type="date" name="fecha" class="form-control" value="${mifecha}" required>
    </div>
    <div class="input-group mb-1">
    <span class="input-group-text" >Tipo de Cambio</span>
    
    <select name="tipodecambio" id="tipodecambio"  class="form-select" required></select>
    </div>
    <div class="input-group mb-1">
    <span class="input-group-text" >Tipo de Asiento</span>
    <select id="tipotransaccion" name="tipotransaccion" class="form-select" required>  </select>
    </div>
  
    <div class="input-group mb-1">
    <span class="input-group-text" >Glosa</span>
    <textarea name="descripcion" id="descripcion"  class="form-control" cols="10" rows="3" required></textarea>
    </div>
  
    </div>
    <button type="submit" class="btn btn-primary"> Registrar</button>
    </form>
  
    `;
    ft.innerHTML=view;
    tipodecambio();
    ultimotransaccion();
    tipotransaccion();
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));
}

function transaccioninsertar(){

    const fechaActual = new Date();
    const mifecha = fechaActual.toISOString().slice(0,10);
    const ft=document.querySelector("#formutransaccion");
    let view=`
    <hr>
    <form id="formulario${codigo}" class="d-grid">
    <input type="hidden" name="ver" id="yof" value="registrotransaccion">
    <input type="hidden" name="empresa" id="yof" value="${uk[0].empresa.idempresa}">
    <input type="hidden" name="sucursal" id="yof" value="${uk[0].empresa.idsucursal}">
    <div class="flex">
  
    <div class="input-group mb-1">
    <span class="input-group-text" >Nº Transaccion</span><input type="text" name="codigo"  class="form-control" required>
    </div>
  
    <div class="input-group mb-1">
    <span class="input-group-text" >Fecha</span>
    <input type="date" name="fecha" class="form-control" value="${mifecha}" required>
    </div>
    <div class="input-group mb-1">
    <span class="input-group-text" >Tipo de Cambio</span>
    
    <select name="tipodecambio" id="tipodecambio"  class="form-select" required></select>
    </div>
    <div class="input-group mb-1">
    <span class="input-group-text" >Tipo de Asiento</span>
    <select id="tipotransaccion" name="tipotransaccion" class="form-select" required>  </select>
    </div>
  
    <div class="input-group mb-1">
    <span class="input-group-text" >Glosa</span>
    <textarea name="descripcion" id="descripcion"  class="form-control" cols="10" rows="3" required></textarea>
    </div>
  
    </div>
    <button type="submit" class="btn btn-primary"> Registrar</button>
    </form>
  
    `;
    ft.innerHTML=view;
    tipodecambio();
    ultimotransaccion();
    tipotransaccion();
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));
}


function tipotransaccion(){
    const tt=document.querySelector("#tipotransaccion");
    fetch(`${URL_APIC}/api/tipotransaccion`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        data.map(lista=>{
            view+=`<option value="${lista[0]}">${lista[1]}</option>`;
        })
        tt.innerHTML=view;
    })
}

function tipotransaccionf5(tipo){
    const tt=document.querySelector("#tipotransaccion");
    fetch(`${URL_APIC}/api/tipotransaccion`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        data.map(lista=>{
            if(lista[1]==tipo){
            view+=`<option value="${lista[0]}" selected>${lista[1]}</option>`;
            }else{
            view+=`<option value="${lista[0]}">${lista[1]}</option>`;
            }
        })
        tt.innerHTML=view;
    })
}

function ultimotransaccion(){
    console.log("ultimotransacicon")
    const cc=document.querySelector("#codigo");
    fetch(`${URL_APIC}/api/listatransacciones/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        
        let nn=0;
        if(data[0]){
            nn=parseInt(data[0].ntransaccion)+parseInt(1);
            cc.innerHTML=`<span class="input-group-text" >Nº Transaccion</span><input type="text" name="codigo" value="${nn}" readonly class="form-control" >`;
        }else{
            cc.innerHTML=`<span class="input-group-text" >Nº Transaccion</span><input type="text" name="codigo" value="1" readonly class="form-control" >`;
        }
        
    })
    
}
function tipodecambio(){
    const tc=document.querySelector("#tipodecambio");
    fetch(`${URL_APIC}/api/listatipodecambio/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        data.map(lista=>{
            view+=`<option value="${lista.id}">Dolar:${lista.dolar} UFV:${lista.ufv} - ${lista.fecha}</option>`;
        })
        tc.innerHTML=view;
    })
}
function tipodecambiof5(id){
    const tc=document.querySelector("#tipodecambio");
    fetch(`${URL_APIC}/api/listatipodecambio/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        data.map(lista=>{
            if(lista.id==id){
            view+=`<option value="${lista.id}" selected>Dolar:${lista.dolar} UFV:${lista.ufv} - ${lista.fecha}</option>`;
            }else{
                view+=`<option value="${lista.id}">Dolar:${lista.dolar} UFV:${lista.ufv} - ${lista.fecha}</option>`;
            }
        })
        tc.innerHTML=view;
    })
}

function sendform(e,form){
        e.preventDefault();

        const dato=new FormData(form);
        //bloqueoElement.style.display = 'block';
        
        fetch(`${URL_APIC}/api/`,{
            method:"POST",
            body:dato
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            
            //bloqueoElement.style.display = 'none';
            if(data[0]=="success"){
                if(data[2]=="registrotransaccion"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        sitio();
                    }, 2000);
                    return;
                }
                if(data[2]=="registrotransaccionf5"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                        
                        form.reset();
                        sitio();
                    }, 2000);
                    return;
                }
                if(data[2]=="detalletransaccionnormal"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        detalletransaccion(data[3]);
                    }, 2000);
                    return;
                }
                if(data[2]=="detalletransaccion"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        detalletransaccion(data[3]);
                    }, 2000);
                    return;
                }
                if(data[2]=="detalletransaccionnormalf5"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        detalletransaccion(data[3]);
                    }, 2000);
                    return;
                }
                
                if(data[2]=="crearfactura"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    console.log(data);
                    setTimeout(() => {
                        
                        form.reset();
                        crearfactura(data[3],data[4],data[5]);
                    }, 2000);
                    return;
                }
                

            }else{
                form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                
                
                setTimeout(() => {
                
                    sitio();
                }, 3000);
                return;
            }
        })
    
}