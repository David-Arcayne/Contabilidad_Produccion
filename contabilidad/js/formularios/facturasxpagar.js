import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let objfactura="";
const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100)+"cfacturasxpagar";

export function cfacturasxpagar(code, permisos, refrescar) {

    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
}

function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id] = dataid.split(',');
    
    switch (funcion) {
        case "verDetallePago":
            verDetallePago(id);
        case "pagarFactura":
            pagarFactura(id);
            break;
        case "listaPagados":
            listaPagados(id);
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

    <div class="col col-md-12">
    <h4>Facturas por Pagar <a data-id="listaPagados" class="btn btn-primary">Lista Pagados</a></h4>
    
    <input type="text" id="buscarlistapagarfactura" class="form-control"  placeholder="Buscar ">
    <div class="table-responsive" style="overflow:scroll; height:600px;">
    <table class="table datatable" >
            <thead>
                <th>#</th>
                <th>Fecha</th>
                <th>Factura</th>
                <th>#Trans.</th>
                <th>Proveedor</th>
                <th>Monto Factura</th>
                <th>Monto Cobrado</th>
                <th>Saldo</th>
                <th></th>
                
            </thead>
            <tbody id="listapagarfactura" >
            </tbody>
        </table>
    </div>
    
    </div>
    `;
    app.innerHTML=view;
    listapagarfactura()
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', menuempresa);
    })
    let searchInput = document.getElementById("buscarlistapagarfactura");
    searchInput.addEventListener("input", buscarlistapagarfactura);
    }
    function listaPagados(){
        
        let view=`
        
        <nav aria-label="breadcrumb">
<ol class="breadcrumb">
  <li class="breadcrumb-item"><a data-id="sitio" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></a></li>
  <li class="breadcrumb-item active" aria-current="page">Lista Pagados</li>
</ol>
</nav>
<a data-id="descargarPDFA,reportelistacobrados" class="btn btn-success btn-sm">Descargar PDF</a> 
        <table class="table" id="contenidoPDF">
        <thead>
        <th>#</th><th>Fecha</th><th>Factura</th><th>#Trans</th><th>Proveedor</th><th>Monto</th><th></th>
        </thead>
            <tbody id="listapagadosfactura" >
        </tbody>
        </table>
        
        `;
        app.innerHTML=view;
        listapagadofactura();
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', menuempresa);
        })
    
    }
    function listapagadofactura(){
        const ff=document.querySelector("#listapagadosfactura");
        objfactura=[];
        fetch(`${URL_APIC}/api/listapagarfactura/${uk[0].empresa.idsucursal}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let view="",numero=0;
            data.map(lista=>{
    objfactura.push(lista);
                numero=numero+1;
                let pa=0;
                if(lista.cobrado==null){
                    pa=0;
                }else{
                    pa=lista.cobrado;
                }
                if(lista.saldo==0){
        let fecha=convertirFecha(lista.fecha);
            view+=`<tr>
            <td>${numero}</td>
            <td>${fecha}</td>
            <td>${lista.numero}</td>
            <td>${lista.codigo}</td>
            <td>${lista.nombre}</td>
            <td>${lista.monto}</td>
            
            <td><a data-id="verDetallePago,${lista.id}" class="btn btn-primary">Ver</a></td>
            </tr>`;
                }
    
        })
        ff.innerHTML=view;
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', menuempresa);
        })
        })
        
    }
    function verDetallePago(id){
    const ff=objfactura.filter(x=>x.id==id);
    console.log(ff)
    let view=`
        <div class="card alert-dismissible">
        <div class="card-header">Lista Cobrados <a onclick="descargarPDFA('reportelistacobrados')" class="btn btn-success btn-sm">Descargar PDF</a> <button type="button" class="btn-close btn-close-dark" onclick="listaPagados()"></button></div>
        <div class="card-body" id="contenidoPDF">
            <p class="fw-bold">Fecha: ${ff[0].fecha}<br>
            Factura: ${ff[0].numero}<br>
            Transaccion: ${ff[0].codigo}<br>
            Cliente: ${ff[0].nombre}<br>
            Monto: ${ff[0].monto}</p>
            <div id="listadepagos"></div>
    
    
        </div>
        </div>
        `;
    
        main.innerHTML=view;
        listadepagos(id);
    }
    
    function listadepagos(id){
        const lp=document.querySelector("#listadepagos");
        fetch(`${URL_APIC}/api/listapagoscobros/${id}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data)
            let monto=0;
            let view=`<table class="table">
            <thead><th>Fecha</th><th>Persona</th><th>CI</th><th>Recibo</th><th>Monto</th><th></th></thead>
            <tbody>
            `;
            data.map(lista=>{
                monto=monto+parseFloat(lista.monto);
                view+=`<tr>
                        <td>${lista.fecha}</td>
                        <td>${lista.persona}</td>
                        <td>${lista.ci}</td>
                        <td>${lista.recibo}</td>
                        <td>${lista.monto}</td>
                        <td><a onclick="eliminarPagoF(${lista.id},${id})" class="btn btn-danger"><i class="bi bi-trash"></i></a></td>
                        </tr>`;
            })
            view+=`<tr><td colspan="4">Total</td><td colspan="2">${monto}</td></tr></tbody>
            </table>`;
            lp.innerHTML=view;
        })
    }
    function eliminarPagoF(pago,id){
        
        if(confirm(`Desea Eliminar`)){
            fetch(`./api/eliminarpagar/${pago}`)
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                listadepagos(id);
            })
        }
        }
    function listapagarfactura(){
        const ff=document.querySelector("#listapagarfactura");
        objfactura=[];
        fetch(`${URL_APIC}/api/listapagarfactura/${uk[0].empresa.idsucursal}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let view="",numero=0;
            data.map(lista=>{
    objfactura.push(lista);
                numero=numero+1;
                let pa=0;
                if(lista.cobrado==null){
                    pa=0;
                }else{
                    pa=lista.cobrado;
                }
                if(lista.saldo!=0){
        let fecha=convertirFecha(lista.fecha);
            view+=`<tr>
            <td>${numero}</td>
            <td>${fecha}</td>
            <td>${lista.numero}</td>
            <td>${lista.codigo}</td>
            <td>${lista.nombre}</td>
            <td>${lista.monto}</td>
            <td>${pa}</td>
            <td>${lista.saldo}</td>
            <td><a data-id="pagarFactura,${lista.id}" class="btn btn-primary">Pagar</a></td>
            </tr>`;
                }
    
        })
        ff.innerHTML=view;
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', menuempresa);
        })
        })
        
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
      function buscarlistapagarfactura(dato) {
        console.log(dato);
          var input, filter, table, tr, i,j;
          input = document.getElementById("buscarlistapagarfactura");
          filter = input.value.toUpperCase();
          console.log(filter);
          table = document.getElementById("listapagarfactura");
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
      
    
    function pagarFactura(idfactura){
    const ff=objfactura.filter(x=>x.id==idfactura);
    console.log(ff)
    const fechaActual = new Date();
    const mifecha = fechaActual.toISOString().slice(0,10);
    
    let view=`
    
    <nav aria-label="breadcrumb">
<ol class="breadcrumb">
  <li class="breadcrumb-item"><a data-id="sitio" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></a></li>
  <li class="breadcrumb-item active" aria-current="page">Pagar Factura : ${ff[0].nombre} Saldo:${ff[0].saldo}</li>
</ol>
</nav>

    <form id="formulario${codigo}">
    <input name="ver" type="hidden" value="registropagarfactura">
    <input name="idfactura" type="hidden" value="${idfactura}">
    <input name="idtransaccion" type="hidden" value="${ff[0].transaccion}">
    <input name="idcuenta" type="hidden" value="${ff[0].cuenta}">
    <input name="idcliente" type="hidden" value="${ff[0].idproveedor}">
    <input name="sucursal" type="hidden" value="${uk[0].empresa.idsucursal}">
    <input name="empresa" type="hidden" value="${uk[0].empresa.idempresa}">

    <label>Fecha <input name="fecha" type="date" class="form-control" value="${mifecha}"></label>
    <label>N.Recibo<input name="nrecibo" type="text" class="form-control"></label>
    <label>Persona<input name="persona" type="text" class="form-control" required></label>
    <label>CI<input name="ci" type="text" class="form-control" required></label>
    <label>Monto <input name="monto" type="text" class="form-control"></label>
    <label>Registrar al Asiento <select name="asiento" class="form-select" id="listaasientos"></select></label><br>
    <button type="submit" class="btn btn-primary" >Registrar Cobro</button>
    </form>
    <div id="respuesta"></div>
    <hr>
    <table class="table">
    <thead> <th>Fecha</th><th>Persona</th><th>CI</th><th>Recibo</th><th>Monto</th><th></th></thead>
    <tbody id="listapagos"></tbody>
    </table>
    
    `;
    app.innerHTML=view;
    listaasientos();
    listapagos(idfactura)
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));

    const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', menuempresa);
        })
    }
    function listapagos(idfactura){
        console.log(idfactura);
    const lp=document.querySelector("#listapagos");
    fetch(`${URL_APIC}/api/listapagoscobros/${idfactura}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        data.map(lista=>{
            view+=`<tr>
            <td>${lista.fecha}</td>
            <td>${lista.persona}</td>
            <td>${lista.ci}</td>
            <td>${lista.recibo}</td>
            <td>${lista.monto}</td>
            <td><a class="btn btn-danger" onclick="eliminarPago(${lista.id},${idfactura})"><i class="bi bi-trash"></i></a></td>
            </tr>`;
        })
        lp.innerHTML=view;
    })
    }
    function eliminarPago(pago,idfactura){
        
    if(confirm(`Desea Eliminar`)){
        fetch(`${URL_APIC}/api/eliminarpagar/${pago}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            listapagos(idfactura);
        })
    }
    }
    
    function listaasientos(){
        const cc=document.querySelector("#listaasientos");
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
    function descargarPDFA(nombre){
        const pdf=document.querySelector("#contenidoPDF");
        console.log(pdf);
        
        let fecha=new Date();
        var opt = {
            margin:       0.5,
            filename:     `${nombre} ${fecha}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          
        html2pdf().set(opt).from(pdf).save();
        //html2pdf(pdf);
    }
    
    function sendform(e,form){
            e.preventDefault();
            const dato=new FormData(form);
            fetch(`${URL_APIC}/api/`,{
                method:"POST",
                body:dato
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if(data[0]=="success"){
                    if(data[2]=="registropagarfactura"){
                        form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                        
                        setTimeout(() => {
                        
                            form.reset();
                            pagarFactura(data[3]);
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
    