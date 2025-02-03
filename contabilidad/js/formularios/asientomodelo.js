import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100)+"asiento";

export function casientomodelo(code, permisos, refrescar) {
    
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
    
    
    
}
function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id, ids] = dataid.split(',');
    
    switch (funcion) {
        case "eliminarAsiento":
            eliminarAsiento(id);
            break;
        case "crearAsiento":
            crearAsiento(id, ids);
            break;
        case "eliminartasiento":
            eliminartasiento(id, ids);
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
<div class="col col-md-3">
<p>Crear Tipos de Asientos</p>
<form id="formulario${codigo}" class="d-grid">
<input name="ver" type="hidden" value="registroasiento">
<input name="empresa" type="hidden" value="${uk[0].empresa.idempresa}">
<label>Nombre de Asiento <input name="nombre" type="text" class="form-control"></label>
<label>Tipo<select name="tipo" class="form-select" id="tipoingreso"></select></label>
<hr>
<button class="btn btn-primary" type="submit" onclick="sendForm()">Registrar</button>
</form>
<div id="respuesta"></div>
</div>
<div class="col col-md-9">
<div class="table-responsive" style="overflow:scroll; height:600px;">
<table class="table" >
<thead><th>Asiento</th><th>Tipo</th><th></th></thead>
<tbody id="listaasientos" ></tbody>
</table>
</div>
</div>
</div>
    `;
    app.innerHTML=view;
    listatipoingreso();
    listaasientos();
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));

}
function listaasientos(){
    const aa=document.querySelector("#listaasientos");
    fetch(`${URL_APIC}/api/listaasientos/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view="";
        data.map(lista=>{
            view+=`<tr>
            <td>${lista.nombre}</td>
            <td>${lista.tipo}</td>
            <td><a data-id="eliminarAsiento,${lista.id}" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></a> <a data-id="crearAsiento,${lista.id}" class="btn btn-primary btn-sm"><i class="bi bi-hdd-stack-fill"></i></a></td>
            </tr>`;
        })
        aa.innerHTML=view;
        const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', menuempresa);
    });
    })
}
function crearAsiento(asiento){

    let view=`
    
<nav aria-label="breadcrumb">
<ol class="breadcrumb">
  <li class="breadcrumb-item"><a data-id="sitio" class="enlace btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
  <li class="breadcrumb-item active" aria-current="page">Crear Asiento</li>
</ol>
</nav>
    <div class="row">
    <div class="col col-md-3">
    <p>Crear Asientos</p>
    <form id="formulario${codigo}" class="d-grid">
    <input name="ver" type="hidden" value="registrocrearasientos">
    <input name="asiento" type="hidden" value="${asiento}">
    <input name="empresa" type="hidden" value="${uk[0].empresa.idempresa}">
    <label>Cuenta <select name="cuenta" id="plandecuentas" class="form-select"></select></label>

    <label>Porciento<input name="porciento" type="text" class="form-control"></label>
    <label>Tipo<select name="tipo" class="form-select" id="tipoingreso">
    <option value="DEBE">DEBE</option>
    <option value="HABER">HABER</option>
    </select></label>

    <hr>
    <button class="btn btn-primary" type="submit">Registrar</button>
    </form>
    <div id="respuesta"></div>
    </div>
    <div class="col col-md-9">
    <div class="table-responsive" style="overflow:scroll; height:600px;">
    <table class="table" >
    <thead><th>Codigo</th><th>Cuenta</th><th>%</th><th>Tipo</th><th></th</thead>
    <tbody id="listaasientos" ></tbody>
    </table>
    </div>
    </div>
    </div>
        `;
        app.innerHTML=view;
        plandecuentas();
        listaasientosc(asiento);
        const forme = document.querySelector(`#formulario${codigo}`);
forme.addEventListener("submit", (e) => sendform(e, forme));

const enlaces = document.querySelectorAll(".enlace");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
}
function listaasientosc(asiento){
const as=document.querySelector("#listaasientos");
fetch(`${URL_APIC}/api/listaasientosc/${asiento}`)
.then(res=>res.json())
.then(data=>{
    console.log(data);
    let view="";
    data.map(lista=>{
        view+=`<tr>
        <td>${lista.numero}</td>
        <td>${lista.plan}</td>
        <td>${lista.porciento}</td>
        <td>${lista.tipo}</td>
        <td><a data-id="eliminartasiento,${lista.id},${asiento}" class="btn btn-danger "><i class="bi bi-trash"></i></a></td>
        </tr>`;
    })
    as.innerHTML=view;


const enlaces = document.querySelectorAll(".btn");
enlaces.forEach(enlace => {
    enlace.addEventListener("click", menuempresa);
});
})
}
function eliminartasiento(id,asiento){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIC}/api/eliminartasiento/${id}`)
        .then(res=>res.json())
        .then(data=>{
            listaasientosc(asiento);
        })
    }

}
function eliminarAsiento(asiento){
    if(confirm("Desea Eliminar ..?")){
        fetch(`${URL_APIC}/api/eliminarasiento/${asiento}`)
        .then(res=>res.json())
        .then(data=>{
            listaasientos();
        })
    }
}

function listatipoingreso(){
    const tt=document.querySelector("#tipoingreso");
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
function plandecuentas(){
    const mil=document.querySelector("#plandecuentas");

    fetch(`${URL_APIC}/api/milistaplanes/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let resu="";
        data.map(lista=>{
            resu+=`
            <option value="${lista.id}">${lista.plan}</option>
            `;
        })
        mil.innerHTML=resu;
    })
    
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
                if(data[2]=="registroasiento"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        sitio();
                    }, 2000);
                    return;
                    }
                    
                if(data[2]=="crearasiento"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        crearAsiento(data[3]);
                    }, 2000);
                    return;
                    }

            }else{
                resp.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                const ale=document.querySelector('#alerta');
                
                setTimeout(() => {
                    ale.remove();
                    
                }, 3000);
                return;

            }


        })

}