import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let code=[];
let objtipocambio=[];

export function ctipodecambio(codigo, permisos, refrescar) {
    code=codigo;
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio(codigo);    
    
}
function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id, ids] = dataid.split(',');
    
    switch (funcion) {
        case "editartipocambio":
            editartipocambio(id);
            break;
        case "eliminartipocambio":
            eliminartipocambio(id);
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
<div class="col col-md-4" id="formulariotipo"></div>
<div class="col col-md-8">
<div class="table-responsive" style="overflow:scroll; height:600px;">
<table class="table" >
<thead><th>Dolar</th><th>UFV</th><th>Fecha</th><th></th></thead>
<tbody id="listatipodecambio" ></tbody>
</table>
</div>
</div>
</div>
    `;
    app.innerHTML=view;
formulariotipo();
listatipocambio();
}
function listatipocambio(){
    objtipocambio=[];
    const tt=document.querySelector("#listatipodecambio");
    fetch(`${URL_APIC}/api/listatipodecambio/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let resu="";
        data.map(lista=>{
            objtipocambio.push({id:lista.id,dolar:lista.dolar,ufv:lista.ufv,fecha:lista.fecha});
            resu+=`
            <tr>
            <td>${lista.dolar}</td>
            <td>${lista.ufv}</td>
            <td>${lista.fecha}</td>
            <td><a data-id="editartipocambio,${lista.id}" class="btn btn-primary btn-sm">edit</a> <a data-id="eliminartipocambio,${lista.id}" class="btn btn-danger btn-sm">del</a></td>
            </tr>
            `;
        })
        tt.innerHTML=resu;
        const enlaces = document.querySelectorAll(".btn");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
    })
}

function eliminartipocambio(dato){
    if(confirm("Si desea Eliminar verifique si no esta en uso.")){
    fetch(`${URL_APIC}/api/eliminartipocambio/${dato}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        
            listatipocambio();
        
    })
}
}

function editartipocambio(dato){
    const cc=objtipocambio.filter(x=>x.id==dato);
    let view=`

    <nav aria-label="breadcrumb">
<ol class="breadcrumb">
  <li class="breadcrumb-item"><a data-id="sitio" class="enlace btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
  <li class="breadcrumb-item active" aria-current="page">Crear Asiento</li>
</ol>
</nav>
<h4>Crear Tipo de Cambio</h4>
<form id="formulario">
<input type="hidden" name="ver" value="registrotipodecambiof5">
<input type="hidden" name="id" value="${dato}">

<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Dolar</span>
<input type="text" name="dolar" id="dolar" value="${cc[0].dolar}" class="form-control">
</div>
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">UFV</span>
<input type="text" name="ufv" id="ufv" value="${cc[0].ufv}" class="form-control">
</div>
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Fecha</span>
<input type="date" name="fecha" id="fecha" value="${cc[0].fecha}" class="form-control">
</div>

<button type="submit" class="btn btn-primary">Actualizar</button>
</form>

`;
app.innerHTML=view;
const forme = document.querySelector("#formulario");
forme.addEventListener("submit", (e) => sendform(e, forme));

const enlaces = document.querySelectorAll(".enlace");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
}
function formulariotipo(){
    const form=document.querySelector("#formulariotipo");
    const fechaActual = new Date();
    const mifecha = fechaActual.toISOString().slice(0,10);
    let view=`
    <h4>Crear Tipo de Cambio</h4>
    <form id="formulario" class="d-grid">
    <input type="hidden" name="ver" id="yof" value="registrotipodecambio">
    <input type="hidden" name="empresa" id="yof" value="${uk[0].empresa.idempresa}">
    <div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Dolar</span>
<input type="text" name="dolar" id="dolar" class="form-control">
    </div>
    <div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">UFV</span>
<input type="text" name="ufv" id="ufv" class="form-control">
    </div>
    <div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Fecha</span>
<input type="date" name="fecha" id="fecha" class="form-control" value="${mifecha}">
    </div>
    
    <button type="submit" class="btn btn-primary">Registrar</button>
</form>
<div id="respuesta"></div>
    `;
    form.innerHTML=view;
    const forme = document.querySelector("#formulario");
forme.addEventListener("submit", (e) => sendform(e, forme));
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
                if(data[2]=="registrotipocambio"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        sitio();
                    }, 2000);
                    return;
                    }
                if(data[2]=="registrotipocambiof5"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        sitio();
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