import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let ukM=localStorage.getItem("yofinancieromenu");
let me=JSON.parse(ukM);

let app="";
//const tiporeporte=document.querySelector("#tiporeporte");
//const reporte=document.querySelector("#reportecontabledetalle");
let objreporteactivo=[];
let objencabezado=[];
let objfirmas=[];
let listafirmas=[];
let objplancuenta=[];

const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100)+"sreportecontable";
export function sreportecontable(code, permisos, refrescar) {

    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
}
function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id] = dataid.split(',');
    
    switch (funcion) {
        case "reporteA":
            reporteA(id);
            break;
        case "reporteB":
            reporteB(id);
            break;
        case "reporteD":
            reporteD(id);
            break;
        case "descargarPDFA":
            descargarPDFA(id);
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
    <div class="col col-md-3 shadow" id="tiporeporte">
    <div id="gestion"></div>
    <a data-id="reporteA" class="btn btn-primary btn-sm">Periodicos</a>
    <a data-id="reporteB" class="btn btn-primary btn-sm">Comprobante</a>
    <!-- a onclick="reporteC()" class="btn btn-primary btn-sm">Libro M.</a -->
    <!--a data-id="reporteD" class="btn btn-primary btn-sm">Factura</a -->
    
    <div id="tipoformulario" class="pt-5"> <div class="alert alert-info">Por favor Elija su tipo de Reporte</div></div>
    </div>
    <div class="col col-md-9" id="reportecontabledetalle" >
    <a><i class="bi bi-file-earmark-excel-fill"></i> | <i class="bi bi-filetype-pdf"></i></a>
    </div>
    `;
    app.innerHTML=view;
    reporteA();
    getgestion();

    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
}

  function convertirFecha(fecha) {
    // Separar la fecha en partes utilizando el delimitador "-"
    const fechaParts = fecha.split('-');
    
    // Verificar si la fecha tiene tres partes (año, mes, día)
    if (fechaParts.length !== 3) {
        throw new Error('Fecha en formato incorrecto. Debe ser YYYY-MM-DD');
    }
    
    // Obtener el año, mes y día de las partes de la fecha
    const anio = fechaParts[0];
    const mes = fechaParts[1];
    const dia = fechaParts[2];
    
    // Construir la fecha en el formato "DD-MM-YYYY"
    return `${dia}-${mes}-${anio}`;
}


function getgestion(){
    const gg=document.querySelector("#gestion");
    fetch(`${URL_APIC}/api/getgestionactual/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        
        let view=`Gestion: ${data.nombre}`;
        gg.innerHTML=view;
    })
    }
function reporteD(){
    const tf=document.querySelector("#tipoformulario");
    let view=`
    <form class="d-grid" id="formularioD">
    <label for="fechaini">Desde <input type="date" class="form-control" name="fechaini" id="fechaini" required></label>
    <label for="fechafin">Hasta <input type="date" class="form-control" name="fechafin" id="fechafin" required></label>
    <p>Otros Reportes:</p>
    <select class="form-select" name="reportede" id="reportede" size="6" multiple aria-label="multiple 6 select">
        <option value="1">Facturas por Cobrar</option>
        <option value="2">Facturas por Pagar</option>
        <!--option value="3">Facturas Cobradas</option>
        <option value="4">Facturas Pagadas</option -->
        

    </select>
    <br>
    <button type="submit" class="btn btn-primary d-grid" onclick="obtenerReporteD()">Obtener Reportar</button>
    </form>
    <br>
    `;

    tf.innerHTML=view;
}

function obtenerReporteD(e,formc){
    const reporte=document.querySelector("#reportecontabledetalle");
    //const formc=document.querySelector("#formularioD");
    const fini=document.querySelector("#fechaini").value;
    const ffin=document.querySelector("#fechafin").value;
    const tipo=document.querySelector("#reportede").value;
    let ini=convertirFecha(fini);
    let fin=convertirFecha(ffin);
    if(tipo==1){
    //formc.addEventListener("submit",e=>{
        e.preventDefault();

        fetch(`${URL_APIC}/api/obtenereportefacturacobrar/${fini}/${ffin}/${uk[0].empresa.idsucursal}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let numero=0,factura=0,cobrado=0,saldo=0;
            
        let view=` <a onclick="descargarPDFA('reportefacturacobrar')" class="btn btn-success btn-sm">Descargar PDF</a>
        <div class="table-responsive" id="contenidoPDF">
        <div id="encabezado"></div>
        <p class="text-center"><b>Reporte Factura por Cobrar</b><br>
         ${ini} - ${fin}</p>
         <table class="table" >
        <thead>
            <th>#</th>
            <th>Fecha</th>
            <th>Factura</th>
            <th>#Trans.</th>
            <th>Cliente</th>
            <th>Monto Factura</th>
            <th>Monto Cobrado</th>
            <th>Saldo</th>
            
        </thead>
        <tbody>
        
         `;
            data.map(lista=>{
                factura=factura+parseFloat(lista.monto);
                let fecha=convertirFecha(lista.fecha);
                saldo=saldo+parseFloat(lista.saldo);
                numero=numero+1;
                let pa=0;
                if(lista.pagado==null){
                    pa=0;
                }else{
                    pa=lista.pagado;
                    cobrado=cobrado+parseFloat(lista.pagado);
                }
                if(lista.saldo!=0){
            view+=`<tr>
            <td>${numero}</t>
            <td>${fecha}</t>
            <td>${lista.numero}</t>
            <td>${lista.codigo}</t>
            <td>${lista.nombrep}</t>
            <td>${lista.monto}</t>
            <td>${pa}</t>
            <td>${lista.saldo}</t>
            
            </tr>`;
                }

            })

        view+=`
        <tr><td colspan="5">TOTAL</td><td>${factura.toFixed(2)}</td><td>${cobrado.toFixed(2)}</td><td>${saldo.toFixed(2)}</td></tr>
        </tbody>
        </table><div id="firmas"></div>
        </div>`;


        reporte.innerHTML=view;
        encabezado();
        firmas();
        })

    //});
    }
    if(tipo==2){
        //formc.addEventListener("submit",e=>{
            e.preventDefault();
    
            fetch(`${URL_APIC}/api/obtenereportefacturapagar/${fini}/${ffin}/${uk[0].empresa.idsucursal}`)
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                let numero=0,factura=0,cobrado=0,saldo=0;
    
            let view=` <a onclick="descargarPDFA('reportefacturapagar')" class="btn btn-success btn-sm">Descargar PDF</a>
            <div class="table-responsive" id="contenidoPDF">
            <div id="encabezado"></div>
            <p class="text-center"><b>Reporte Factura por Pagar</b><br>
             ${ini} - ${fin}</p>
             <table class="table" >
            <thead>
                <th>#</th>
                <th>Fecha</th>
                <th>Factura</th>
                <th>#Trans.</th>
                <th>Proveedor</th>
                <th>Monto Factura</th>
                <th>Monto Cobrado</th>
                <th>Saldo</th>
                
            </thead>
            <tbody >
            
             `;
                data.map(lista=>{
                    factura=factura+parseFloat(lista.monto);
                    let fecha=convertirFecha(lista.fecha);
                    saldo=saldo+parseFloat(lista.saldo);
                    numero=numero+1;
                    let pa=0;
                    if(lista.cobrado==null){
                        pa=0;
                    }else{
                        pa=lista.cobrado;
                        cobrado=cobrado+parseFloat(lista.cobrado);
                    }
                    if(lista.saldo!=0){
                view+=`<tr>
                <td>${numero}</t>
                <td>${fecha}</t>
                <td>${lista.numero}</t>
                <td>${lista.codigo}</t>
                <td>${lista.nombre}</t>
                <td>${lista.monto}</t>
                <td>${pa}</t>
                <td>${lista.saldo}</t>
                
                </tr>`;
                    }
    
                })
    
            view+=`
            <tr><td colspan="5">TOTAL</td><td>${factura.toFixed(2)}</td><td>${cobrado.toFixed(2)}</td><td>${saldo.toFixed(2)}</td></tr>
            </tbody>
            </table><div id="firmas"></div>
            </div>`;
    
    
            reporte.innerHTML=view;
            encabezado();
            firmas();
            })
    
        //});

    }
}
/*
function reporteC(){
    const tf=document.querySelector("#tipoformulario");
    let view=`
    <p><b>Reporte Libro Mayor de cuenta Contable</b></p>
    <form id="formularioC" class="d-grid">
    <input type="hidden" name="reporte"  value="reportemayortres">
    <label for="fechaini">Desde <input type="date" class="form-control" name="fechaini" id="fechaini" required></label>
    <label for="fechafin">Hasta <input type="date" class="form-control" name="fechafin" id="fechafin" required></label>
    <label for="cuenta">Cuenta Contable <select name="cuenta" class="form-select" id="plancuenta">
    </select></label><br>
    
    <button type="submit" class="btn btn-primary d-grid" onclick="obtenerReporteC()">Obtener Reportar</button>
    </form>
    <br>
    `;

    tf.innerHTML=view;
    plancuenta();
}
*/
function obtenerReporteC(e,formc){
    const reporte=document.querySelector("#reportecontabledetalle");
//const formc=document.querySelector("#formulario");//formularioC
const fini=document.querySelector("#fechaini").value;
const ffin=document.querySelector("#fechafin").value;
const plan=document.querySelector("#plancuenta").value;
const cp=objplancuenta.filter(x=>x.id==plan);
//formc.addEventListener("submit",e=>{
    e.preventDefault();
    fetch(`${URL_APIC}/api/mayorcuentacontable/${fini}/${ffin}/${plan}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let debe=0,haber=0,saldo=0,num=0;
        let ini=convertirFecha(fini);
        let fin=convertirFecha(ffin);
        let view=`
        <a data-id="descargarPDFA,reportemayor" class="btn btn-success btn-sm">Descargar PDF</a>
        <div class="table-responsive" id="contenidoPDF">
        <div id="encabezado"></div>
        <p class="text-center"><b>Reporte Libro Mayor Cuenta Contable</b><br>
        (${cp[0].plan}): ${ini} - ${fin}</p>
        <table class="table table-striped" id="descargaexcel">
        <thead><th>#</th><th>Trans.</th><th>Fecha</th><th>Titulo</th><th>DEBE</th><th>HABER</th><th>Saldo</th></thead>
        <tbody>
        `;
        data.map(trans=>{
            trans.detalle.map(lista=>{
            let fecha=convertirFecha(trans.fecha);
            debe=debe+parseFloat(lista.debe);
            haber=haber+parseFloat(lista.haber);
            saldo=((saldo)+(parseFloat(lista.debe)-parseFloat(lista.haber)));
            num=num+1;
            view+=`<tr>
            <td>${num}</td>
            <td>${trans.codigo}</td>
            <td>${fecha}</td>
            <td>${trans.tipo}</td>
            <td>${lista.debe}</td>
            <td>${lista.haber}</td>
            <td>${saldo.toFixed(2)}</td>
            </tr>`;
            })

        })
        view+=`<tr>
        <td colspan="4">Total</td>
            <td>${debe.toFixed(2)}</td>
            <td>${haber.toFixed(2)}</td>
            <td>${saldo.toFixed(2)}</td>
        </tr></tbody></table>
        <div id="firmas"></div>
        <div>`;

        reporte.innerHTML=view;
        encabezado();
        firmas();
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });
    })
//});

}
function plancuenta(){
    const pp=document.querySelector("#plancuenta");
    objplancuenta=[];
    fetch(`${URL_APIC}/api/milistaplanes/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view=`<option value="0">Ninguno</option>`;
        data.map(lista=>{
            objplancuenta.push({id:lista.id,numero:lista.numero,plan:lista.plan});
            view+=`<option value="${lista.id}">${lista.numero} ${lista.plan}</option>`;
        })
        pp.innerHTML=view;
    })
}
function reporteB(){
    const tf=document.querySelector("#tipoformulario");
    let view=`
    <p><b>Reporte por Comprobante</b></p>
        <form id="formularioB${codigo}" class="d-grid">
        <div class="row">
        <div class="col-md-6">
        <label for="fechaini">N. Inicio <input type="text" class="form-control" name="fechainib" id="fechainib" placeholder="N. comprobante" required></label>
        </div>
        <div class="col-md-6">
        <label for="fechafin">N. Final <input type="text" class="form-control" name="fechafinb" id="fechafinb" placeholder="N. comprobante" required></label>
        </div>
        </div>
        <p>Reporte segun # Comprobante</p>
        <select class="form-select" name="reportede" id="reportedeb" multiple aria-label="multiple 6 select">
        <option value="1">Comprobante Contable</option>
        <option value="2">Activo Disponible</option>
        </select><br>
        <button type="submit" class="btn btn-primary d-grid">Obtener Reportar</button>
        </form>
        <br>
    `;
    tf.innerHTML=view;

    const forme = document.querySelector(`#formularioB${codigo}`);
    forme.addEventListener("submit", (e) => obtenerReporteB(e, forme));

}
function obtenerReporteB(e,formb){
    
    //const formb=document.querySelector("#formularioB");
    const fechai=document.querySelector("#fechainib").value;
    const fechaf=document.querySelector("#fechafinb").value;
    const reportede=document.querySelector("#reportedeb").value;
    
    //formb.addEventListener("submit", e=>{
        e.preventDefault();
        
        if(formb){ 

        if(reportede==1){
            
            reportecomprobantecontable(fechai,fechaf);
            formb.reset();
        }else
        if(reportede==2){
            
            reporteactivodisponibledos(fechai,fechaf);
            formb.reset();
        }else{
            formb.reset();
            return;
        }
        
        return;
        }
    //});
}

function reporteactivodisponibledos(fechai,fechaf){
    const reporte=document.querySelector("#reportecontabledetalle");
    
fetch(`${URL_APIC}/api/reporteactivodiaponibledos/${fechai}/${fechaf}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let resu="",deudor=0,acreedor=0;
    //let ini=convertirFecha(fechai);
    //let fin=convertirFecha(fechaf);
    resu+=`
    
    <a onclick="descargarexcel('xlsx')" class="btn btn-success btn-sm">Descargar Excel</a>
    <a data-id="descargarPDFA,reporteactivodisponibledos" class="btn btn-success btn-sm">Descargar PDF</a>
    <div class="table-responsive" id="contenidoPDF">
    <div id="encabezado"></div>
    <p class="text-center"><b>Reporte Activo Disponible<b><br>
    Comprobante: ${fechai} - ${fechaf}</p>
    <table class="table table-striped" id="descargaexcel">
    <thead><th>Código</th><th>Cuenta</th><th>Deudor</th><th>Acreedor</th></thead>
    <tbody>
    `;
    data.map(lista=>{
        deudor=deudor+parseFloat(lista.deudor);
        acreedor=acreedor+parseFloat(lista.acreedor);
        objreporteactivo.push({codigo:lista.codigo,cuenta:lista.nombre,deudor:deudor.toFixed(2),acreedor:lista.acreedor.toFixed(2)});
        resu+=`
        <tr>
        <td>${lista.codigo}</td>
        <td>${lista.nombre}</td>
        <td>${lista.deudor.toFixed(2)}</td>
        <td>${lista.acreedor.toFixed(2)}</td>
        </tr>
        `;
    })
    resu+=`<tr><td colspan="2">TOTAL</td><th>${deudor.toFixed(2)}</th><th>${acreedor.toFixed(2)}</th></tr>
    </tbody>
    </table>
    <div id="firmas"></div>
    </div>`;
        reporte.innerHTML=resu;
        encabezado();
        firmas();
        const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
})
}

function reportecomprobantecontable(fechai,fechaf){
const reporte=document.querySelector("#reportecontabledetalle");
    firmasConta();
    
    fetch(`${URL_APIC}/api/reportecomprobantecontable/${fechai}/${fechaf}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        
        let resu="";
        resu+=`
        <a data-id="descargarPDFA,reportecomprobantecontable" class="btn btn-success btn-sm">Descargar PDF</a>
        <div id="contenidoPDF">
        
        <div class="table-responsive" >
        `;
        data.map(tt=>{
            let debe=0,haber=0;
            let fecha=convertirFecha(tt.fecha);
            resu+=`
            <div class="row"><div class="col-4"><b>
            <h5>${uk[0].empresa.nombre}</h5>
            ${uk[0].empresa.direccion}
            <br>${uk[0].empresa.ociudad}
            <br>${uk[0].empresa.oestado}
            <br>${uk[0].empresa.opais}
            </b>
            </div>
            <div class="col-4 text-center"><img src="../em/${uk[0].empresa.logo}" width="100"></div>
            <div class="col-4 text-sm-end"><b>
            
            <h5>NIT:${uk[0].empresa.nit}</h5>
            Tel.:${uk[0].empresa.telefono}
            <br>Cel.:${uk[0].empresa.ocelular}
            <br>${uk[0].empresa.email}
            <br>${uk[0].empresa.ositioweb}
            </b>
            </div>
            </div>
            <hr>
             
            <p class="text-center"><b>Comprobante Contable</b><br>
            (Expresado en Bolivianos)
            </p> 
            <p>Transaccion N: ${tt.codigo}</p>
            <p>Fecha: ${fecha}</p>
            <p>Tipo de Transaccion: ${tt.tipo}</p><hr>
            <table class="table">
            <thead> <th>Codigo</th><th>Cuenta</th><th>DEBE</th><th>HABER</th> </thead>
            <tbody>`;
        tt.detalle.map(lista=>{
            debe=debe+parseFloat(lista.debe);
            haber=haber+parseFloat(lista.haber);
            resu+=`<tr>
            <td>${lista.numero}</td>
            <td>${lista.plan}</td>
            <td>${lista.debe}</td>
            <td>${lista.haber}</td>
            </tr>`;
        })
        resu+=`
            <tr>
            <td colspan="2">Total</td><td>${debe.toFixed(2)}</td><td>${haber.toFixed(2)}</td>
            </tr>
            </tbody>
            </table>
            <p>Glosa:${tt.glosa}</p>
            `;
            if(tt.facturas<1){

            }else{
                let total=0;
            resu+=`<table class="table"><thead><th>Fecha</th><th>Nombre O Razon Social</th><th>N.Factura</th><th>NIT</th><th>Monto</th></thead><tbody>`;
        tt.facturas.map(lista=>{
            total=total+parseFloat(lista.monto);
            let lfecha=convertirFecha(lista.fecha);
            resu+=`<tr>
            <td>${lfecha}</td>
            <td>${lista.cliente}</td>
            <td>${lista.nfactura}</td>
            <td>${lista.nit}</td>
            <td>${lista.monto}</td>
            </tr>`;
        })
        resu+=`<tr><td colspan="4">Total</td><td>${total.toFixed(2)}</td></tr>`;
            }
            
            resu+=`
            </tbody></table>
            <hr>`;
            
             resu+=`<div class="p-5 row justify-content-center align-items-center ">`;

            listafirmas.forEach(lista=>{
                //console.log(lista.nombre);
                resu+=`
                <div class="col-md-3 text-center">
                <span class=" pt-5">${lista.nombre}</span><br>${lista.cargo}</div> 
                `;
            })
            
                resu += `</div> <div class="html2pdf__page-break"></div>`; // Agregar un salto de página después de cada lista
                
            
            
        })
        resu+=`</div></div></div>`;
        
        reporte.innerHTML=resu;
        //encabezado();
    
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
    
    })
    

}

function reporteA(){
    const tf=document.querySelector("#tipoformulario");
    const fechaActual = new Date();
    const mifecha = fechaActual.toISOString().slice(0,10);
    let view=`
    <p><b>Reporte por Fecha</b></p>
<form id="formulario${codigo}" class="d-grid" >
<div class="input-group mb-3">
<span class="input-group-text">Desde</span>
<input type="date" class="form-control" name="fechaini" id="fechaini" value="${mifecha}" >
<span class="input-group-text">Hasta</span>
<input type="date" class="form-control col-md-6" name="fechafin" id="fechafin" value="${mifecha}">
</div>
<select class="form-select" size="4" name="reportede" id="reportede" multiple aria-label="multiple 4 select" >
<option value="0">Ninguno</option>    
<option value="1">Activo Disponible</option>
    <option value="2">Detalle de Transacción</option>
    <option value="3">Detalle Factura p/Transacción</option>
</select>

    <hr>
    <input type="text" id="searchInputplan" class="form-control"  placeholder="Buscar Cuenta..">
    <div class="input-group mb-1">
<span class="input-group-text">Cuentas</span>
<select id="plancuenta" size="5" name="cuenta" class="form-select">
</select>
</div>
    <br>
          
<button type="submit" class="btn btn-primary">Obtener Reporte</button>
</form>
<br>
    `;

    tf.innerHTML=view;
    plancuenta();

    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => obtenerReporteA(e, forme));

    let searchInput = document.getElementById("searchInputplan");
    searchInput.addEventListener("input", searchSelectplan);
}
function searchSelectplan() {
    // Obtenemos el valor del input y el select
    let plandecuenta = document.getElementById("plancuenta");
    let filter = document.getElementById("searchInputplan").value.toLowerCase(); // Obtener el valor del filtro

    // Obtener todas las opciones del select
    let options = plandecuenta.getElementsByTagName("option");

    // Recorrer las opciones y aplicar el filtro
    for (let i = 0; i < options.length; i++) {
        const optionValue = options[i].text.toLowerCase();
        options[i].style.display = optionValue.includes(filter) ? "" : "none";
    }
}


function obtenerReporteA(e,forme){
    //const form=document.querySelector("#formulario");
    const fechai=document.querySelector("#fechaini").value;
    const fechaf=document.querySelector("#fechafin").value;
    const reportede=document.querySelector("#reportede").value;
    const plan=document.querySelector("#plancuenta").value;

    //forme.addEventListener("submit", e=>{
        e.preventDefault();
        if(reportede!=0 && plan!=0){
            alert("Por favor, seleccione la opcion NINGUNO, para exluirse en el reporte, Gracias.")
        }
        if(reportede!=0){
        if(reportede==1){
            reportecontableA(fechai,fechaf,reportede);
        }
        if(reportede==2){
            reportecontableT(fechai,fechaf,reportede);
        }
        if(reportede==3){
            reportecontableF(fechai,fechaf);
        }
        }else{
        if(plan!=0){
            obtenerReporteC(e,forme);
        }
        }
        return;
    //});
}

function reportecontableF(fechai,fechaf){
const reporte=document.querySelector("#reportecontabledetalle");
console.log("contableF");
fetch(`${URL_APIC}/api/reportedetallefpt/${fechai}/${fechaf}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let resu="";
    let ini=convertirFecha(fechai);
    let fin=convertirFecha(fechaf);
    resu+=`
    <!--a onclick="descargarexcel('xlsx')" class="btn btn-success btn-sm">Descargar Excel</a -->
    <a data-id="descargarPDFA,reportedetallefpt" class="btn btn-success btn-sm">Descargar PDF</a>
    <div class="table-responsive" id="contenidoPDF">
    <div id="encabezado"></div>
    <p class="text-center"><b>Reporte Detalle Transacciones</b><br>
    ${ini} - ${fin}</p> `;
    data.map(trans=>{
        let monto=0;
        let fechat=convertirFecha(trans.fechat);
        resu+=`
        <p>Trans:${trans.transaccion} , Fecha:${fechat}</p>
        <table class="table table-striped" id="descargaexcel">
        <thead><th>Fecha</th><th>Nit</th><th>Nombre o Razon Social</th><th>N. Factura</th><th>Total Facturado</th></thead>
        <tbody id="detalle">
        `;
        
        trans.facturas.map(lista=>{
            monto=monto+parseFloat(lista.monto);
            let fecha=convertirFecha(lista.fecha);
            resu+=`
            <tr>
            <td>${fecha}</td>
            <td>${lista.nit}</td>
            <td>${lista.proveedor}</td>
            <td>${lista.nfactura}</td>
            <td>${lista.monto}</td>
            </tr>
            `;
        });
        resu+=`<tr>
                <td colspan="4">Total</td>
                <td>${monto.toFixed(2)}</td>
                </tr>`;
        
        resu+=`</tbody></table>

        <hr>`;  
    })
    resu+=`<div id="firmas"></div></div>`;
    reporte.innerHTML=resu;
    encabezado();
    firmas();
            const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });

})
}
    

function reportecontableT(fechai,fechaf,reportede){
const reporte=document.querySelector("#reportecontabledetalle");
fetch(`${URL_APIC}/api/reportedetalletransaccion/${fechai}/${fechaf}/${reportede}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let resu="";
    let ini=convertirFecha(fechai);
    let fin=convertirFecha(fechaf);
    let pro="";
    resu+=`
    <!--a onclick="descargarexcel('xlsx')" class="btn btn-success btn-sm">Descargar Excel</a -->
    <a data-id="descargarPDFA,reportedetalletransaccion" class="btn btn-success btn-sm">Descargar PDF</a>
    <div class="table-responsive" id="contenidoPDF">
    <div id="encabezado"></div>
    <p class="text-center"><b>Reporte Detalle Transaccion</b><br>
    ${ini} - ${fin}</p>
    
    `;
    data.map(trans=>{
        let fecha=convertirFecha(trans.fecha);
        let tdebe=0,thaber=0;
        resu+=`
        <p>Trans:${trans.codigo} , Fecha:${fecha}</p>
        <table class="table table-striped" id="descargaexcel">
        <thead><th>Código</th><th>Cuenta</th><th>Debe</th><th>Haber</th></thead>
        <tbody id="detalle">
        `;
        
        trans.detalle.map(lista=>{
            tdebe=tdebe+parseFloat(lista.debe);
            thaber=thaber+parseFloat(lista.haber);
            resu+=`
            <tr>
            <td>${lista.cuenta}</td>
            <td>${lista.plan}</td>
            <td>${lista.debe}</td>
            <td>${lista.haber}</td>
            </tr>
            `;
        });
        
        resu+=`
        <tr><td colspan="2">Total</td><td>${tdebe.toFixed(2)}</td><td>${thaber.toFixed(2)}</td></tr>
        </tbody></table>
        <p>Glosa:${trans.glosa}</p><hr>`;  
    })
    resu+=`<div id="firmas"></div></div>`;
    reporte.innerHTML=resu;
    encabezado();
    firmas();

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });

})
}

function reportecontableA(fechai,fechaf,reportede){
    console.log(reportede)
    const reporte=document.querySelector("#reportecontabledetalle");
fetch(`${URL_APIC}/api/reporteactivodisponible/${fechai}/${fechaf}/${reportede}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    objreporteactivo=[];
    console.log(data);
    
    let resu="",deudor=0,acreedor=0;
    let ini=convertirFecha(fechai);
    let fin=convertirFecha(fechaf);
    resu+=`
    
    <a data-id="descargarexcel,'xlsx'" class="btn btn-success btn-sm">Descargar Excel</a>
    <a data-id="descargarPDFA,reporteactivodisponible" class="btn btn-success btn-sm">Descargar PDF</a>
    <div class="table-responsive" id="contenidoPDF">
    <div id="encabezado"></div>
    <p class="text-center"><b>Reporte Activo Disponible</b><br>
    ${ini} - ${fin}</p>
    <table class="table table-striped" id="descargaexcel">
    <thead><th>Código</th><th>Cuenta</th><th>Deudor</th><th>Acreedor</th></thead>
    <tbody>
    `;
    data.map(lista=>{
        deudor=deudor+parseFloat(lista.deudor);
        acreedor=acreedor+parseFloat(lista.acreedor);
        objreporteactivo.push({codigo:lista.codigo,cuenta:lista.nombre,deudor:deudor.toFixed(2),acreedor:lista.acreedor.toFixed(2)});
        resu+=`
        <tr>
        <td>${lista.codigo}</td>
        <td>${lista.nombre}</td>
        <td>${lista.deudor.toFixed(2)}</td>
        <td>${lista.acreedor.toFixed(2)}</td>
        </tr>
        `;
    })
    resu+=`<tr><td colspan="2">TOTAL</td><th>${deudor.toFixed(2)}</th><th>${acreedor.toFixed(2)}</th></tr>
    </tbody>
    </table>
    <div id="firmas"></div>
    </div>`;
        reporte.innerHTML=resu;
        encabezado();
        firmas();

        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });
})  
}

function encabezado(){
const enca=document.querySelector("#encabezado");
/*objencabezado=[];
    fetch(`./api/encabezado`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);*/
        let resu="";
        //data.map(lista=>{
            
            resu+=`
            <div class="row"><div class="col-4"><b>
            <h5>${uk[0].empresa.nombre}</h5>
            ${uk[0].empresa.direccion}
            <br>${uk[0].empresa.ociudad}
            <br>${uk[0].empresa.oestado}
            <br>${uk[0].empresa.opais}
            </b>
            </div>
            <div class="col-4 text-center"><img src="../em/${uk[0].empresa.logo}" width="100"></div>
            <div class="col-4 text-sm-end"><b>
            
            <h5>NIT:${uk[0].empresa.nit}</h5>
            Tel.:${uk[0].empresa.telefono}
            <br>Cel.:${uk[0].empresa.ocelular}
            <br>${uk[0].empresa.email}
            <br>${uk[0].empresa.ositioweb}
            </b>
            </div>
            </div>
            <hr>
            `;
        //})
        enca.innerHTML=resu;
    //})
}

function firmas(){
    const enca=document.querySelector("#firmas");
    // objfirmas=[];
    //     fetch(`${URL_APIC}/api/firmas/${uk[0].empresa.idempresa}/${me[0].modulo}`)
    //     .then(res=>res.json())
    //     .then(data=>{
    //         //console.log(data);
            let resu=`<div class="p-5 row justify-content-center align-items-center ">`;
            [
                {nombre: "Nombre para firma 1", cargo: "cargo de firma 1"},
                {nombre: "Nombre para firma 2", cargo: "cargo de firma 2"},
                {nombre: "Nombre para firma 3", cargo: "cargo de firma 3"},
                {nombre: "Nombre para firma 4", cargo: "cargo de firma 4"},
                {nombre: "Nombre para firma 5", cargo: "cargo de firma 5"},
            ].map(lista=>{
                objfirmas.push({nombre:lista.nombre,cargo:lista.cargo});
                resu+=`
                <div class="col-md-3 text-center">
                <span class=" pt-5">${lista.nombre}</span><br>${lista.cargo}</div> 
                `;
            })
            resu+=`</div>`;
            enca.innerHTML=resu;
        // })
    }
    function firmasConta() {
        
        fetch(`${URL_APIC}/api/firmas/${uk[0].empresa.idempresa}/${me[0].modulo}`)
            .then(res => res.json())
            .then(data => {
                data.map(lista => {
                    listafirmas.push({ nombre: lista.nombre, cargo: lista.cargo });
                })
            });
    }
    
    
function descargarPDFA(nombre){
    const pdf=document.querySelector("#contenidoPDF");
    pdf.style.fontSize = "11px"; 
    
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

function descargarexcel(type, fn, dl) {
    var elt = document.getElementById('descargaexcel');
    var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
    let fecha=new Date();
    return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
        XLSX.writeFile(wb, fn || (`Reporte ${fecha}.` + (type || 'xlsx')));
}


