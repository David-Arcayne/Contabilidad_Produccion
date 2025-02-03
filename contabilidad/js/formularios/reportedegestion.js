import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let ukM=localStorage.getItem("yofinancieromenu");
let me=JSON.parse(ukM);
let app="";

let objactivodisponible=[];
let objactivoexigible=[];
let objactivorealizable=[];
let objactivofijo=[];
let objotroactivo=[];
let objpasivocortoplazo=[];
let objpasivolargoplazo=[];
let objpatrimoniopasivo=[];

const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100)+"sreportedegestion";
export function sreportedegestion(code, permisos, refrescar) {

    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
}

function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id] = dataid.split(',');
    
    switch (funcion) {
        
        case "descargarPDF":
            descargarPDF(id);
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

    <h4>Reporte Contable Gestion</h4>
    <div id="gestion"></div>
    <div class="row">
    <div class="col col-md-3 shadow" id="formularioreporte"></div>
        <div class="col col-md-9" id="reportecontablegestion" >
        <a><i class="bi bi-file-earmark-excel-fill"></i> | <i class="bi bi-filetype-pdf"></i></a>
        </div>
    </div>
    
    `;
    app.innerHTML=view;
formularioreporte();
getgestion();
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
function formularioreporte(){
    const rr=document.querySelector("#formularioreporte");
    const fechaActual = new Date();
    const mifecha = fechaActual.toISOString().slice(0,10);
    let view=`
    <div id="gestion"></div>
    
<form id="formulario${codigo}" class="d-grid" >
<div class="input-group mb-3">
<span class="input-group-text">Desde</span>
<input type="date" class="form-control" name="fechaini" id="fechaini"  value="${mifecha}">
<span class="input-group-text">Hasta</span>
<input type="date" class="form-control col-md-6" name="fechafin" id="fechafin"  value="${mifecha}">
</div>
<select class="form-select" size="10" name="reportede" id="reportede" multiple aria-label="multiple 3 select" >
    <option value="1">Sumas y saldos Periodicos</option>
    <option value="2">Sumas y Saldos hasta</option>
    <option value="3">Activo y Pasivo Periodico</option>
    <option value="4">Activo y Pasido hasta</option>
    <option value="5">Cuentas de Resultado</option>
    <option value="6">Balance General Periodico</option>
    <option value="7">Balance General hasta</option>
    <!--option value="8">Estado de Actividades</option -->
</select>

    <hr>
          
<button type="submit"  class="btn btn-primary">Obtener Reporte</button>
</form>
    `;
    rr.innerHTML=view;
    getgestion();
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => reporteGestion(e, forme));

}

function reporteGestion(e,form){
    //const form=document.querySelector("#formulario");
    
    //form.addEventListener("submit",e=>{
        e.preventDefault();
        const fechai=document.querySelector("#fechaini").value;
        const fechaf=document.querySelector("#fechafin").value;
        const reportede=document.querySelector("#reportede").value;
        if(reportede==1){
            reportebalancedesumasysaldos(fechai,fechaf);
        }
        if(reportede==2){
            reportebalancedesumasysaldoshasta(fechai,fechaf);
        }
        if(reportede==3){
            reporteactivoypasivo(fechai,fechaf);
        }
        if(reportede==4){
            reporteactivoypasivohasta(fechai,fechaf);
        }
        if(reportede==5){
            reportecuentasderesultado(fechai,fechaf);
        }
        if(reportede==6){
            reportebalancegeneral(fechai,fechaf);
        }
        if(reportede==7){
            reportebalancegeneralhasta(fechai,fechaf);
        }
    //})
}

function reportebalancegeneralhasta(fechai,fechaf){
    const repo=document.querySelector("#reportecontablegestion");
    let view=`
    <a data-id="descargarPDF,reportecuentasderesultado" class="btn btn-success btn-sm">Descargar PDF ***</a>
        <div class="table-responsive" id="contenidoPDF">
        <div id="encabezado"></div>
        <p class="text-center"><b>Reporte Balance General</b><br>
        Fecha:Inicio - ${fechaf}</p>
        <h1>Activo</h1>
        <h4>Activo Circulante</h4>
        <h6>Activo Disponible</h6>
        <table class="table">
        <thead><th>Código</th><th>Cuenta</th><th>Total</th></thead>
        <tbody id="activodisponible">
        </tbody>
        </table>
        <h6>Activo Exigible</h6>
        <table class="table">
        <thead><th>Código</th><th>Cuenta</th><th>Total</th></thead>
        <tbody id="activoexigible"></tbody>
        </table>
        <h6>Activo Realizable</h6>
        <table class="table">
        <thead><th>Código</th><th>Cuenta</th><th>Total</th></thead>
        <tbody id="activorealizable"></tbody>
        </table>
        <h4>Activo Fijo</h4>
        <h6>Activo Fijo</h6>
        <table class="table">
        <thead><th>Código</th><th>Cuenta</th><th>Total</th></thead>
        <tbody id="activofijo"></tbody>
        </table>
        <h4>Otros Activos</h4>
        <h6>Otros Activo </h6>
        <table class="table">
        <thead><th>Código</th><th>Cuenta</th><th>Total</th></thead>
        <tbody id="otroactivo"></tbody>
        </table>
        <h4>Pasivos</h4>
        <h6>Pasivo a corto plazo </h6>
        <table class="table">
        <thead><th>Código</th><th>Cuenta</th><th>Total</th></thead>
        <tbody id="pasivoacortoplazo"></tbody>
        </table>
        <h6>Pasivo a Largo plazo </h6>
        <table class="table">
        <thead><th>Código</th><th>Cuenta</th><th>Total</th></thead>
        <tbody id="pasivoalargoplazo"></tbody>
        </table>
        <h4>Patrimonio</h4>
        <h6>Pasivo a Largo plazo </h6>
        <table class="table">
        <thead><th>Código</th><th>Cuenta</th><th>Total</th></thead>
        <tbody id="patrimoniopasivopargoplazo"></tbody>
        </table>
        <div id="firmas"></div>
        </div>
    `;
    repo.innerHTML=view;
    encabezado();
    activodisponiblehasta(fechai,fechaf);
    activoexigiblehasta(fechai,fechaf);
    activorealizablehasta(fechai,fechaf);
    activofijohasta(fechai,fechaf);
    otroactivohasta(fechai,fechaf);
    pasivoacortoplazohasta(fechai,fechaf);
    pasivoalargoplazohasta(fechai,fechaf);
    patrimoniopasivopargoplazohasta(fechai,fechaf);
    firmas();
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });

}


function reportebalancegeneral(fechai,fechaf){
    
    const repo=document.querySelector("#reportecontablegestion");
    
    let view=`
    <a data-id="descargarPDF,reportecuentasderesultado" class="btn btn-success btn-sm">Descargar PDF</a>
        <div class="table-responsive" id="contenidoPDF">
        <div id="encabezado"></div>
        <p class="text-center"><b>Reporte Balance General</b><br>
        Fecha:${fechai} - ${fechaf}</p>
        
        <table class="table table-hover">`;
        
        view+=`
        <tr><th></th><th>Activo</th><th></th><th></th><th id="activot"></th></tr>
        <tr><th></th><th>Activo Circulante</th><th></th><th id="activocirculantet"></th><th></th></tr>
        <tr><th></th><th>Activo Disponible</th><th id="activodisponiblet"></th><th></th><th></th></tr>
        <tbody id="activodisponible"></tbody>
        <tr><th></th><th>Activo Exigible</th><th id="activoexigiblet"></th><th></th><th></th></tr>
        <tbody id="activoexigible"></tbody>
        <tr><th></th><th>Activo Realizable</th><th id="activorealizablet"></th><th></th><th></th></tr>
        <tbody id="activorealizable"></tbody>
        <tr><th></th><th>Activo Fijo</th><th id="activofijot"></th><th></th><th></th></tr>
        <tbody id="activofijo"></tbody>
        <tr><th></th><th>Otros Activos</th><th id="otroactivot"></th><th></th><th></th></tr>
        
        <tbody id="otroactivo"></tbody>
        
        <tr><th></th><th>Pasivos</th><th></th><th></th><th id="pasivot"></th></tr>
        <tr><th></th><th>Pasivo a corto plazo</th><th id="pasivocortoplazot"></th> <th></th><th></th></tr>
        <tbody id="pasivoacortoplazo"></tbody>
        
        <tr><th></th><th>Pasivo a largo plazo</th><th id="pasivolargoplazot"></th><th></th><th></th></tr>
        <tbody id="pasivoalargoplazo"></tbody>
        
        <tr><th></th><th>Patrimonio</th><th></th><th id="patrimoniot"></th><th></th></tr>
        
        <tbody id="patrimoniopasivopargoplazo"></tbody>
        <tr><th></th><th>Total Pasivo y Patrimonio</th><th></th><th></th><th id="tpasivopatrimoniot"></th></tr>
        </table>
        <div id="firmas"></div>
        </div>
    `;
    repo.innerHTML=view;
    encabezado();
    activodisponible(fechai,fechaf);
    activoexigible(fechai,fechaf);
    activorealizable(fechai,fechaf);
    activofijo(fechai,fechaf);
    otroactivo(fechai,fechaf);
    pasivoacortoplazo(fechai,fechaf);
    pasivoalargoplazo(fechai,fechaf);
    patrimoniopasivopargoplazo(fechai,fechaf);

    const ad=document.querySelector("#activodisponiblet");
    const ae=document.querySelector("#activoexigiblet");
    const ar=document.querySelector("#activorealizablet");
    const af=document.querySelector("#activofijot");
    const oa=document.querySelector("#otroactivot");
    
    const pc=document.querySelector("#pasivocortoplazot");
    const pl=document.querySelector("#pasivolargoplazot");
    const pt=document.querySelector("#patrimoniot");
    const ac=document.querySelector("#activocirculantet");
    const at=document.querySelector("#activot");
    const pa=document.querySelector("#pasivot");
    const tpp=document.querySelector("#tpasivopatrimoniot");
    
    setTimeout(() => {
        const act=parseFloat(objactivodisponible[0])+parseFloat(objactivoexigible[0])+parseFloat(objactivorealizable[0]);
        const att=parseFloat(act)+parseFloat(objactivofijo[0])+parseFloat(objotroactivo[0]);
        const ptt=parseFloat(objpasivocortoplazo)+parseFloat(objpasivolargoplazo);
        const tppt=parseFloat(ptt)+parseFloat(objpatrimoniopasivo); 
        ad.innerHTML=`${objactivodisponible[0]}`;
        ae.innerHTML=`${objactivoexigible[0]}`;    
        ar.innerHTML=`${objactivorealizable[0]}`;
        af.innerHTML=`${objactivofijo[0]}`;
        oa.innerHTML=`${objotroactivo[0]} `;
        pc.innerHTML=`${objpasivocortoplazo[0]}`;
        pl.innerHTML=`${objpasivolargoplazo[0]}`;
        pt.innerHTML=`${objpatrimoniopasivo[0]}`;

        ac.innerHTML=`${act.toFixed(2)}`;
        at.innerHTML=`${att.toFixed(2)}`;
        pa.innerHTML=`${ptt.toFixed(2)}`;
        tpp.innerHTML=`${tppt.toFixed(2)}`;
    }, 100);
    firmas();
    const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });

}

function patrimoniopasivopargoplazohasta(fechai,fechaf){
    const ad=document.querySelector("#patrimoniopasivopargoplazo");
    const numeroa='3.0.0.00.00';
    const numerob='4.0.0.00.00';
    fetch(`${URL_APIC}/api/reportebalancegeneralhastapp/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="",total=0;
        data.map(lista=>{
            total=total+parseFloat(lista.total);
            view+=`<tr>
            <td>${lista.numero}</td>
            <td>${lista.plan}</td>
            <td>${lista.total}</td>
            </tr>`;
        })
        view+=`<tr><td colspan="2">Total</td><td>${total.toFixed(2)}</td></tr>`;
        ad.innerHTML=view;
    })
    }
    

function pasivoalargoplazohasta(fechai,fechaf){
const ad=document.querySelector("#pasivoalargoplazo");
const numeroa='2.2.0.00.00';
const numerob='3.0.0.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneralhastapp/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        </tr>`;
    })
    view+=`<tr><td colspan="2">Total</td><td>${total.toFixed(2)}</td></tr>`;
    ad.innerHTML=view;
})
}

function pasivoacortoplazohasta(fechai,fechaf){
const ad=document.querySelector("#pasivoacortoplazo");
const numeroa='2.0.0.00.00';
const numerob='2.2.0.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneralhastapp/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        </tr>`;
    })
    view+=`<tr><td colspan="2">Total</td><td>${total.toFixed(2)}</td></tr>`;
    ad.innerHTML=view;
})
}
    

function otroactivohasta(fechai,fechaf){
const ad=document.querySelector("#otroactivo");
const numeroa='1.2.2.00.00';
const numerob='2.0.0.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneralhasta/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        </tr>`;
    })
    view+=`<tr><td colspan="2">Total</td><td>${total.toFixed(2)}</td></tr>`;
    ad.innerHTML=view;
})
}

    
function activofijohasta(fechai,fechaf){
const ad=document.querySelector("#activofijo");
const numeroa='1.2.1.00.00';
const numerob='1.2.2.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneralhasta/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        </tr>`;
    })
    view+=`<tr><td colspan="2">Total</td><td>${total.toFixed(2)}</td></tr>`;
    ad.innerHTML=view;
})
}
    

function activorealizablehasta(fechai,fechaf){
const ad=document.querySelector("#activorealizable");
const numeroa='1.1.3.00.00';
const numerob='1.2.0.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneralhasta/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        </tr>`;
    })
    view+=`<tr><td colspan="2">Total</td><td>${total.toFixed(2)}</td></tr>`;
    ad.innerHTML=view;
})
}


function activoexigiblehasta(fechai,fechaf){
const ad=document.querySelector("#activoexigible");
const numeroa='1.1.2.00.00';
const numerob='1.1.3.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneralhasta/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        </tr>`;
    })
    view+=`<tr><td colspan="2">Total</td><td>${total.toFixed(2)}</td></tr>`;
    ad.innerHTML=view;
})
}

function activodisponiblehasta(fechai,fechaf){
const ad=document.querySelector("#activodisponible");
const numeroa='1.1.1.01.00';
const numerob='1.1.2.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneralhasta/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        </tr>`;
    })
    view+=`<tr><td colspan="2">Total</td><td>${total.toFixed(2)}</td></tr>`;
    ad.innerHTML=view;
})
}


function patrimoniopasivopargoplazo(fechai,fechaf){
    const ad=document.querySelector("#patrimoniopasivopargoplazo");
    const numeroa='3.0.0.00.00';
    const numerob='4.0.0.00.00';
    fetch(`${URL_APIC}/api/reportebalancegeneralpp/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        objpatrimoniopasivo=[];
        let view="",total=0;
        data.map(lista=>{
            total=total+parseFloat(lista.total);
            view+=`<tr>
            <td>${lista.numero}</td>
            <td>${lista.plan}</td>
            <td>${lista.total}</td>
            <td></td>
            <td></td>
            </tr>`;
        })

        ad.innerHTML=view;
        objpatrimoniopasivo.push(total.toFixed(2));
    })
    }
    

function pasivoalargoplazo(fechai,fechaf){
const ad=document.querySelector("#pasivoalargoplazo");
const numeroa='2.2.0.00.00';
const numerob='3.0.0.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneralpp/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    objpasivolargoplazo=[];
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        <td></td>
        <td></td>
        </tr>`;
    })
    
    ad.innerHTML=view;
    objpasivolargoplazo.push(total.toFixed(2));
})
}

function pasivoacortoplazo(fechai,fechaf){
const ad=document.querySelector("#pasivoacortoplazo");
const numeroa='2.0.0.00.00';
const numerob='2.2.0.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneralpp/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    objpasivocortoplazo=[];
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        <td></td>
        <td></td>
        </tr>`;
    })

    ad.innerHTML=view;
    objpasivocortoplazo.push(total.toFixed(2));
})
}
    

function otroactivo(fechai,fechaf){
const ad=document.querySelector("#otroactivo");
const numeroa='1.2.2.00.00';
const numerob='2.0.0.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneral/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    objotroactivo=[];
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        <td></td>
        <td></td>
        </tr>`;
    })
    
    ad.innerHTML=view;
    objotroactivo.push(total.toFixed(2));
})
}

    
function activofijo(fechai,fechaf){
const ad=document.querySelector("#activofijo");
const numeroa='1.2.1.00.00';
const numerob='1.2.2.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneral/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    objactivofijo=[];
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        <td></td>
        <td></td>
        </tr>`;
    })
    
    ad.innerHTML=view;
    objactivofijo.push(total.toFixed(2));
})
}
    

function activorealizable(fechai,fechaf){
const ad=document.querySelector("#activorealizable");
const numeroa='1.1.3.00.00';
const numerob='1.2.0.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneral/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    objactivorealizable=[];
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        <td></td>
        <td></td>
        </tr>`;
    })
    
    ad.innerHTML=view;
    objactivorealizable.push(total.toFixed(2));
})
}


function activoexigible(fechai,fechaf){
const ad=document.querySelector("#activoexigible");
const numeroa='1.1.2.00.00';
const numerob='1.1.3.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneral/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    objactivoexigible=[];
    let view="",total=0;
    data.map(lista=>{
        total=total+parseFloat(lista.total);
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        <td></td>
        <td></td>
        </tr>`;
    })
    
    ad.innerHTML=view;
    objactivoexigible.push(total.toFixed(2));
})
}

function activodisponible(fechai,fechaf){
const ad=document.querySelector("#activodisponible");

const numeroa='1.1.1.01.00';
const numerob='1.1.2.00.00';
fetch(`${URL_APIC}/api/reportebalancegeneral/${fechai}/${fechaf}/${numeroa}/${numerob}/${uk[0].empresa.idempresa}`)
.then(res=>res.json())
.then(data=>{
    objactivodisponible=[];
    console.log(data);
    let view="",total=0;
    data.map(lista=>{
        
        total=total+parseFloat(lista.total);
        view+=`<tr>
        
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.total}</td>
        <td></td>
        <td></td>
        </tr>`;
    })
    
    
    ad.innerHTML=view;
    objactivodisponible.push(total.toFixed(2));
})
}

function reportecuentasderesultado(fechai,fechaf){
    const repo=document.querySelector("#reportecontablegestion");
    fetch(`${URL_APIC}/api/reportecuentasderesultado/${fechai}/${fechaf}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let debe=0,haber=0,deudor=0,acreedor=0;

        let view=`
        <a data-id="descargarPDF,reportecuentasderesultado" class="btn btn-success btn-sm">Descargar PDF</a>
        <div class="table-responsive" id="contenidoPDF">
        <div id="encabezado"></div>
        <p class="text-center"><b>Reporte Cuentas de Resultado</b><br>
        Fecha:${fechai} - ${fechaf}
        <p>
        <table class="table">
        <thead><th>Codigo</th><th>Cuenta</th><th>Debe</th><th>Haber</th><th>Deudor</th><th>Acreedor</th></thead>
        <tbody>`;
        data.map(lista=>{
            debe=debe+parseFloat(lista.debe);
            haber=haber+parseFloat(lista.haber);
            deudor=deudor+parseFloat(lista.deudor);
            acreedor=acreedor+parseFloat(lista.acreedor);
            view+=`
            <tr>
            <td>${lista.codigo}</td>
            <td>${lista.plan}</td>
            <td>${lista.debe}</td>
            <td>${lista.haber}</td>
            <td>${lista.deudor}</td>
            <td>${lista.acreedor}</td>
            </tr>
            `;
        })
        view+=`
        <tr><td colspan="2">TOTAL</td><td>${debe.toFixed(2)}</td><td>${haber.toFixed(2)}</td><td>${deudor.toFixed(2)}</td><td>${acreedor.toFixed(2)}</td></tr>
        </tbody>
        </table>
        <div id="firmas"></div>
        </div>
        `;
    repo.innerHTML=view;
        encabezado();
        firmas();
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });


    })

}


function reporteactivoypasivohasta(fechai,fechaf){
    const repo=document.querySelector("#reportecontablegestion");
    fetch(`${URL_APIC}/api/reporteactivoypasivohasta/${fechai}/${fechaf}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let debe=0,haber=0,deudor=0,acreedor=0;

        let view=`
        <a data-id="descargarPDF,reporteactivoypasivohasta" class="btn btn-success btn-sm">Descargar PDF</a>
        <div class="table-responsive" id="contenidoPDF">
        <div id="encabezado"></div>
        <p class="text-center"><b>Reporte Activo y Pasivo</b><br>
        Fecha:Inicio - ${fechaf}
        <p>
        <table class="table">
        <thead><th>Codigo</th><th>Cuenta</th><th>Debe</th><th>Haber</th><th>Deudor</th><th>Acreedor</th></thead>
        <tbody>`;
        data.map(lista=>{
            debe=debe+parseFloat(lista.debe);
            haber=haber+parseFloat(lista.haber);
            deudor=deudor+parseFloat(lista.deudor);
            acreedor=acreedor+parseFloat(lista.acreedor);
            view+=`
            <tr>
            <td>${lista.codigo}</td>
            <td>${lista.plan}</td>
            <td>${lista.debe}</td>
            <td>${lista.haber}</td>
            <td>${lista.deudor}</td>
            <td>${lista.acreedor}</td>
            </tr>
            `;
        })
        view+=`
        <tr><td colspan="2">TOTAL</td><td>${debe.toFixed(2)}</td><td>${haber.toFixed(2)}</td><td>${deudor.toFixed(2)}</td><td>${acreedor.toFixed(2)}</td></tr>
        </tbody>
        </table>
        <div id="firmas"></div>
        </div>
        `;
    repo.innerHTML=view;
        encabezado();
        firmas();
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });

    })

}

function reporteactivoypasivo(fechai,fechaf){
    const repo=document.querySelector("#reportecontablegestion");
    fetch(`${URL_APIC}/api/reporteactivoypasivo/${fechai}/${fechaf}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let debe=0,haber=0,deudor=0,acreedor=0;

        let view=`
        <a data-id="descargarPDF,reporteactivoypasivo" class="btn btn-success btn-sm">Descargar PDF</a>
        <div class="table-responsive" id="contenidoPDF">
        <div id="encabezado"></div>
        <p class="text-center"><b>Reporte Activo y Pasivo</b><br>
        Fecha:${fechai} - ${fechaf}
        <p>
        <table class="table">
        <thead><th>Codigo</th><th>Cuenta</th><th>Debe</th><th>Haber</th><th>Deudor</th><th>Acreedor</th></thead>
        <tbody>`;
        data.map(lista=>{
            debe=debe+parseFloat(lista.debe);
            haber=haber+parseFloat(lista.haber);
            deudor=deudor+parseFloat(lista.deudor);
            acreedor=acreedor+parseFloat(lista.acreedor);
            view+=`
            <tr>
            <td>${lista.codigo}</td>
            <td>${lista.plan}</td>
            <td>${lista.debe}</td>
            <td>${lista.haber}</td>
            <td>${lista.deudor}</td>
            <td>${lista.acreedor}</td>
            </tr>
            `;
        })
        view+=`
        <tr><td colspan="2">TOTAL</td><td>${debe.toFixed(2)}</td><td>${haber.toFixed(2)}</td><td>${deudor.toFixed(2)}</td><td>${acreedor.toFixed(2)}</td></tr>
        </tbody>
        </table>
        <div id="firmas"></div>
        </div>
        `;
    repo.innerHTML=view;
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
    /*fetch(`./api/encabezado`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let resu="";
        data.map(lista=>{ */
        let resu="";
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
        fetch(`${URL_APIC}/api/firmas/${uk[0].empresa.idempresa}/${me[0].modulo}`)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let resu=`<div class="p-5 row text-center">`;
            data.map(lista=>{
                resu+=`
                <div class="col-3">
                <span class=" pt-5">${lista.nombre}</span><br>${lista.cargo} </div>
                `;
            })
            resu+=`</div>`;
            enca.innerHTML=resu;
        })
    }

function reportebalancedesumasysaldos(fechai,fechaf){
    const repo=document.querySelector("#reportecontablegestion");
    fetch(`${URL_APIC}/api/reportebalancedesumasysaldos/${fechai}/${fechaf}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let debe=0,haber=0,deudor=0,acreedor=0;

        let view=`
        <a data-id="descargarPDF,reportebalancedesumasysaldo" class="btn btn-success btn-sm">Descargar PDF</a>
        <div class="table-responsive" id="contenidoPDF">
        <div id="encabezado"></div>
        <p class="text-center"><b>Reporte Balance Sumas y Saldos</b><br>
        Fecha:${fechai} - ${fechaf}
        <p>
        <table class="table">
        <thead><th>Codigo</th><th>Cuenta</th><th>Debe</th><th>Haber</th><th>Deudor</th><th>Acreedor</th></thead>
        <tbody>`;
        data.map(lista=>{
            debe=debe+parseFloat(lista.debe);
            haber=haber+parseFloat(lista.haber);
            deudor=deudor+parseFloat(lista.deudor);
            acreedor=acreedor+parseFloat(lista.acreedor);
            view+=`
            <tr>
            <td>${lista.codigo}</td>
            <td>${lista.plan}</td>
            <td>${lista.debe}</td>
            <td>${lista.haber}</td>
            <td>${lista.deudor}</td>
            <td>${lista.acreedor}</td>
            </tr>
            `;
        })
        view+=`
        <tr><td colspan="2">TOTAL</td><td>${debe.toFixed(2)}</td><td>${haber.toFixed(2)}</td><td>${deudor.toFixed(2)}</td><td>${acreedor.toFixed(2)}</td></tr>
        </tbody>
        </table>
        <div id="firmas"></div>
        </div>
        `;
    repo.innerHTML=view;
        encabezado();
        firmas();
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });
    })

}

function reportebalancedesumasysaldoshasta(fechai,fechaf){
    const repo=document.querySelector("#reportecontablegestion");
    fetch(`${URL_APIC}/api/reportebalancedesumasysaldoshasta/${fechai}/${fechaf}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let debe=0,haber=0,deudor=0,acreedor=0;

        let view=`
        <a data-id="descargarPDF,reportebalancedesumasysaldohasta" class="btn btn-success btn-sm">Descargar PDF</a>
        <div class="table-responsive" id="contenidoPDF">
        <div id="encabezado"></div>
        <p class="text-center"><b>Reporte Balance Sumas y Saldos</b><br>
        Fecha:Inicio - ${fechaf}
        <p>
        <table class="table">
        <thead><th>Codigo</th><th>Cuenta</th><th>Debe</th><th>Haber</th><th>Deudor</th><th>Acreedor</th></thead>
        <tbody>`;
        data.map(lista=>{
            debe=debe+parseFloat(lista.debe);
            haber=haber+parseFloat(lista.haber);
            deudor=deudor+parseFloat(lista.deudor);
            acreedor=acreedor+parseFloat(lista.acreedor);
            view+=`
            <tr>
            <td>${lista.codigo}</td>
            <td>${lista.plan}</td>
            <td>${lista.debe}</td>
            <td>${lista.haber}</td>
            <td>${lista.deudor}</td>
            <td>${lista.acreedor}</td>
            </tr>
            `;
        })
        view+=`
        <tr><td colspan="2">TOTAL</td><td>${debe.toFixed(2)}</td><td>${haber.toFixed(2)}</td><td>${deudor.toFixed(2)}</td><td>${acreedor.toFixed(2)}</td></tr>
        </tbody>
        </table>
        <div id="firmas"></div>
        </div>
        `;
    repo.innerHTML=view;
        encabezado();
        firmas();
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });

    })

}

function descargarPDF(nombre){
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