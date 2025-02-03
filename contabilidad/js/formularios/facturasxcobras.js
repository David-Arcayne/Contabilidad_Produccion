import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let objfactura=[];
let objgestion=[];
let objpagos=[];

const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100)+"cfacturasxcobrar";

export function cfacturasxcobrar(code, permisos, refrescar) {

    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
}

function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id,ids] = dataid.split(',');
    
    switch (funcion) {
        case "verDetalleCobro":
            verDetalleCobro(id);
            break;
        case "cobrarFactura":
            cobrarFactura(id);
            break;
        case "listaCobrados":
            listaCobrados(id);
            break;
        case "eliminarPago":
            eliminarPago(id,ids);
            break;
        case "descargarPDFA":
            descargarPDFA(id);
            break;
        case "editarPago":
            editarPago(id,ids);
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
    <h4>Facturas por Cobrar <a data-id="listaCobrados" class="btn btn-primary">Lista Cobrados</a></h4>
    <input type="text" id="buscarlistacobrarfactura" class="form-control"  placeholder="Buscar ">
    <div class="table-responsive" style="overflow:scroll; height:600px;">
    <table class="table datatable" >
            <thead>
                <th>#</th>
                <th>Fecha</th>
                <th>Factura</th>
                <th>#Trans.</th>
                <th>Cliente</th>
                <th>Monto Factura</th>
                <th>Monto Cobrado</th>
                <th>Saldo</th>
                <th></th>
                <th></th>
            </thead>
            <tbody id="listacobrarfactura" >
            </tbody>
        </table>
    </div>
    
    </div>
    `;
    app.innerHTML=view;
    listacobrarfactura()

    let searchInput = document.getElementById("buscarlistacobrarfactura");
    searchInput.addEventListener("input", buscarlistacobrarfactura);
    }
    function listaCobrados(){
        
        let view=`

<nav aria-label="breadcrumb">
<ol class="breadcrumb">
  <li class="breadcrumb-item"><a data-id="sitio" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></a></li>
  <li class="breadcrumb-item active" aria-current="page">Lista Cobrados</li>
</ol>
</nav>
<a data-id="descargarPDFA,reportelistacobrados" class="btn btn-success btn-sm">Descargar PDF</a>
            <table class="table" id="contenidoPDF">
        <thead>
        <th>#</th><th>Fecha</th><th>Factura</th><th>#Trans</th><th>Proveedor</th><th>Monto</th><th></th>
        </thead>
            <tbody id="listacobrarfactura" >
        </tbody>
        </table>
        `;
        app.innerHTML=view;
        listacobradofactura();
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', menuempresa);
        })
    
    }
    
    function listacobradofactura(){
        const ff=document.querySelector("#listacobrarfactura");
        objfactura=[];
        fetch(`${URL_APIC}/api/listacobrarfacturazero/${uk[0].empresa.idsucursal}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let view="",numero=0;
            data.map(lista=>{
                objfactura.push(lista);
                numero=numero+1;
                let pa=0;
                if(lista.pagado==null){
                    pa=0;
                }else{
                    pa=lista.pagado;
                }
                if(lista.saldo==0){
                    let total=0;
                    let fecha=convertirFecha(lista.fecha);
                    view+=`<tr>
                    <td>${numero}</td>
                    <td>${fecha}</td>
                    <td>${lista.numero}</td>
                    <td>${lista.codigo}</td>
                    <td>${lista.nombrep}</td>
                    <td>${lista.monto}</td>
                    
                    <td><a data-id="verDetalleCobro,${lista.id}," class="btn btn-primary">Ver</a></td>
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
    
    function verDetalleCobro(id){
        console.log("verdetalleCobro")
        const ff=objfactura.filter(x=>x.id==id);
        console.log(ff)
        let view=`
        <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a data-id="listaCobrados" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></a></li>
          <li class="breadcrumb-item active" aria-current="page">Lista Cobrados</li>
        </ol>
        </nav>
            <p><a data-id="descargarPDFA,'reportelistacobrados'" class="btn btn-success btn-sm">Descargar PDF</a> </p>
            <div  id="contenidoPDF">
            <h4>Estado de Cobro</h4>
                <p class="fw-bold">Fecha: ${ff[0].fecha}<br>
                Factura: ${ff[0].numero}<br>
                Transaccion: ${ff[0].codigo}<br>
                Cliente: ${ff[0].nombrep}<br>
                Monto: ${ff[0].monto}</p>
                <div id="listadecobros"></div>
        
        
            </div>
            
            `;
        
            app.innerHTML=view;
            listadecobros(id);
            const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', menuempresa);
        })
        }

        function listadecobros(id){
            const lp=document.querySelector("#listadecobros");
            fetch(`${URL_APIC}/api/listapagos/${id}`)
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
                            <td><a onclick="eliminarCobroF(${lista.id},${id})" class="btn btn-danger"><i class="bi bi-trash"></i></a></td>
                            </tr>`;
                })
                view+=`<tr><td colspan="4">Total</td><td colspan="2">${monto}</td></tr></tbody>
                </table>`;
                lp.innerHTML=view;
            })
        }
        
        function eliminarCobroF(id,idc){
            if(confirm("Desea eliminar..?")){
                fetch(`./api/eliminarcobrados/${id}`)
                .then(res=>res.json())
                .then(data=>{
                    listadecobros(idc);
                })
            }
        }
        
    function eliminarCobrados(id){
        if(confirm("Desea eliminar..?")){
            fetch(`./api/eliminarcobrados/${id}`)
            .then(res=>res.json())
            .then(data=>{
                listaCobrados();
            })
        }
    }
    
    
    function listacobrarfactura(){
        const ff=document.querySelector("#listacobrarfactura");
        objfactura=[];
        fetch(`${URL_APIC}/api/listacobrarfactura/${uk[0].empresa.idsucursal}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let view="",numero=0;
            data.map(lista=>{
    objfactura.push({id:lista.id,fecha:lista.fecha,numero:lista.numero,codigo:lista.codigo,idproveedor:lista.idproveedor,proveedor:lista.nombrep,monto:lista.monto,pagado:lista.pagado,saldo:lista.saldo,transaccion:lista.transaccion,cuenta:lista.cuenta});
                numero=numero+1;
                let pa=0;
                if(lista.pagado==null){
                    pa=0;
                }else{
                    pa=lista.pagado;
                }
                if(lista.saldo!=0){
            view+=`<tr>
            <td>${numero}</t>
            <td>${lista.fecha}</t>
            <td>${lista.numero}</t>
            <td>${lista.codigo}</t>
            <td>${lista.nombrep}</t>
            <td>${lista.monto}</t>
            <td>${pa}</t>
            <td>${lista.saldo}</t>
            <td><a data-id="cobrarFactura,${lista.id}" class="btn btn-primary">Cobrar</a></td>
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
    
    function cobrarFactura(idfactura){
    const ff=objfactura.filter(x=>x.id==idfactura);
    console.log(ff);

    
    const fechaActual = new Date();
    const mifecha = fechaActual.toISOString().slice(0,10);

    let view=`

<nav aria-label="breadcrumb">
<ol class="breadcrumb">
  <li class="breadcrumb-item"><a data-id="sitio" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></a></li>
  <li class="breadcrumb-item active" aria-current="page">Cobrar Factura : ${ff[0].proveedor} Saldo:${ff[0].saldo}</li>
</ol>
</nav>
    <div id="gestion"></div>
    <form id="formulario${codigo}">
    <input name="ver" type="hidden" value="registrocobrarfactura">
    <input name="idfactura" type="hidden" value="${idfactura}">
    <input name="idtransaccion" type="hidden" value="${ff[0].transaccion}">
    <input name="idcuenta" type="hidden" value="${ff[0].cuenta}">
    <input name="idcliente" type="hidden" value="${ff[0].idproveedor}">
    <input name="sucursal" type="hidden" value="${uk[0].empresa.idsucursal}">
    <input name="empresa" type="hidden" value="${uk[0].empresa.idempresa}">
    <label>Fecha <input name="fecha" id="fecha" type="date" class="form-control" value="${mifecha}"></label>
    <label>N.Recibo<input name="nrecibo" type="text" class="form-control"></label>
    <label>Persona<input name="persona" type="text" class="form-control" required></label>
    <label>CI<input name="ci" type="text" class="form-control" required></label>
    <label>Monto <input name="monto" type="text" class="form-control"></label>
    <label>Registrar al Asiento <select name="asiento" class="form-select" id="listaasientos"></select></label><br>
    <button type="submit" class="btn btn-primary">Registrar Cobro</button>
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
    getgestion();
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => {
        e.preventDefault();
        const fr=document.querySelector(`#fecha`).value;
        console.log(fr);
        const gg=objgestion;
        console.log(gg[0].fechaini,gg[0].fechafin);
       if(fr>=gg[0].fechaini && fr<=gg[0].fechafin){
            sendform(e, forme);
        }else{
            alert("La fecha no corresponde a la gestion actual");
        }
        

    });

    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
    }

    function getgestion(){
        const gg=document.querySelector("#gestion");
        objgestion=[];
        fetch(`${URL_APIC}/api/getgestionactual/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            objgestion.push(data);
            let view=`Gestion Activa: ${data.nombre}(<span class="fs-6 fst-italic">${data.fechaini} a ${data.fechafin}</span>)`;
            gg.innerHTML=view;
        })
        }
        
    function editarPago(idcobro,idfactura){
        const ff=objfactura.filter(x=>x.id==idfactura);
        const pg=objpagos.filter(p=>p.id==idcobro);
        console.log(ff);
        console.log(pg);
        //editarPago,${lista.id},${idfactura}
        
        let view=`
    
    <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a data-id="cobrarFactura,${idfactura}" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></a></li>
      <li class="breadcrumb-item active" aria-current="page">Cobrar Factura : ${ff[0].proveedor} Saldo:${ff[0].saldo}</li>
    </ol>
    </nav>
    <div id="gestion"></div>
        <form id="formulario${codigo}">
        <input name="ver" type="hidden" value="registrocobrarfacturaf5">
        <input name="idfactura" type="hidden" value="${idfactura}">
        <input name="idcobro" type="hidden" value="${idcobro}">
        <input name="idtransaccion" type="hidden" value="${ff[0].transaccion}">
        <input name="idcuenta" type="hidden" value="${ff[0].cuenta}">
        <input name="idcliente" type="hidden" value="${ff[0].idproveedor}">
        <input name="sucursal" type="hidden" value="${uk[0].empresa.idsucursal}">
        <input name="empresa" type="hidden" value="${uk[0].empresa.idempresa}">
        <label>Fecha <input name="fecha" type="date" id="fecha" class="form-control" value="${pg[0].fecha}"></label>
        <label>N.Recibo<input name="nrecibo" type="text" class="form-control" value="${pg[0].recibo}"></label>
        <label>Persona<input name="persona" type="text" class="form-control" value="${pg[0].persona}" required></label>
        <label>CI<input name="ci" type="text" class="form-control" value="${pg[0].ci}" required></label>
        
        
        <button type="submit" class="btn btn-primary">Actualizar Cobro</button>
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
        getgestion();
      //  const forme = document.querySelector(`#formulario${codigo}`);
        //forme.addEventListener("submit", (e) => sendform(e, forme));

        const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => {
        e.preventDefault();
        const fr=document.querySelector(`#fecha`).value;
        console.log(fr);
        const gg=objgestion;
        console.log(gg[0].fechaini,gg[0].fechafin);
       if(fr>=gg[0].fechaini && fr<=gg[0].fechafin){
            sendform(e, forme);
        }else{
            alert("La fecha no corresponde a la gestion actual");
        }
        

    });
    
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });
        }

    function listapagos(idfactura){
        console.log(idfactura);
    const lp=document.querySelector("#listapagos");
    fetch(`${URL_APIC}/api/listapagos/${idfactura}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        objpagos=[];
        let view="";
        data.map(lista=>{
            objpagos.push(lista);
            let fecha=convertirFecha(lista.fecha);
            view+=`<tr>
            <td>${fecha}</td>
            <td>${lista.persona}</td>
            <td>${lista.ci}</td>
            <td>${lista.recibo}</td>
            <td>${lista.monto}</td>
            <td><a class="btn btn-primary" data-id="editarPago,${lista.id},${idfactura}"><i class="bi bi-pencil-square"></i></a></td>
            </tr>`;
        })
        lp.innerHTML=view;
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });
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
      
        return `${dia}/${mes}/${anio}`;
      }
    
      function buscarlistacobrarfactura(dato) {
        console.log(dato);
          var input, filter, table, tr, i,j;
          input = document.getElementById("buscarlistacobrarfactura");
          filter = input.value.toUpperCase();
          console.log(filter);
          table = document.getElementById("listacobrarfactura");
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
      

    function eliminarPago(pago,idfactura){
        
    if(confirm(`Desea Eliminar`)){
        fetch(`${URL_APIC}/api/eliminarpago/${pago}`)
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
            let view=`<option value="0">Ninguno</option>`;
            data.map(lista=>{
                view+=`<option value="${lista.id}">${lista.nombre}</option>`;
            })
            cc.innerHTML=view;
        })
    }
    function descargarPDFA(nombre){
        const pdf=document.querySelector("#contenidoPDF");
        console.log(pdf);
        const botones = document.querySelectorAll(".btn"); // Obtener todos los botones

    // Ocultar los botones antes de generar el PDF
    botones.forEach(boton => {
        boton.style.display = "none";
    });
        
        let fecha=new Date();
        var opt = {
            margin:       0.5,
            filename:     `${nombre} ${fecha}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          
        //html2pdf().set(opt).from(pdf).save();
        html2pdf().set(opt).from(pdf).save()
        .then(() => {
            // Después de guardar el PDF, restaurar la visibilidad de los botones
            botones.forEach(boton => {
                boton.style.display = ""; // Restaurar la visibilidad original
            });
        });
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
                    if(data[2]=="registrocobrarfactura"){
                        form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                        
                        setTimeout(() => {
                        
                            form.reset();
                            cobrarFactura(data[3]);
                        }, 2000);
                        return;
                        }
                }else{
                    form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                    
                    
                    setTimeout(() => {
                        ale.remove();
                        sitio();
                    }, 3000);
                    return;
                }
            })
        
    }
    