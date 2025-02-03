import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let code=[];

let objlistaplan=[];
const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100)+"plandecuentas";

export function plandecuentas(codigo, permisos, refrescar) {
    code=codigo;
     app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
     sitio(codigo); 

    console.log(permisos+" : "+refrescar+" : "+codigo);
}
function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id, ids] = dataid.split(',');
    
    switch (funcion) {
        case "copiarplandecuentas":
            copiarplandecuentas()
        case "editplan":
            editplan(id, ids);
            break;
        case "deleteplan":
            deleteplan(id);
            break;
        case "editPlan":
            editPlan(id);
            break;
        case "eliminarPlan":
            eliminarPlan(id);
            break;
        case "misplanes":
            misplanes();
            break;
        case "editarDetalle":
            editarDetalle(id,ids);
            break;
        case "eliminarDetalle":
            eliminarDetalle(id,ids);
            break;
        case "agregarPlanes":
            agregarPlanes();
            break;
        case "reemplazarPlanes":
            reemplazarPlanes();
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
<div class="col col-md-4" id="formularioplan"></div>
<div class="col col-md-8">
<input type="text" id="buscarplanes" class="form-control"  placeholder="Buscar ">
<div class="table-responsive" style="overflow:scroll; height:600px;">
<table class="table" >
<thead><th>Codigo</th><th>Cuenta</th><th>Tipo</th><th>Descripcion</th><th></th></thead>
<tbody id="milistaplanes" ></tbody>
</table>
</div>
</div>
</div>
`;

app.innerHTML=view;
formularioplan();
milistaplanes();
let searchInput = document.getElementById("buscarplanes");
searchInput.addEventListener("input", buscarplanes);

}

function buscarplanes(dato) {
    console.log(dato);
      var input, filter, table, tr, i,j;
      input = document.getElementById("buscarplanes");
      filter = input.value.toUpperCase();
      console.log(filter);
      table = document.getElementById("milistaplanes");
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

function formularioplan(){
    const form=document.querySelector("#formularioplan");
    let view=`
    <h4>Crear Plan de Cuentas </h4>
    <h4><a data-id="copiarplandecuentas" class='btn btn-info'>Agregar / Reemplazar plan de cuentas </a>
</h4>
<hr>

<form id="formulario${codigo}" class="d-grid">
<input type="hidden" name="ver"  value="registroplanes">
<input type="hidden" name="empresa"  value="${uk[0].empresa.idempresa}">
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Codigo</span>
<input type="text" name="numero" id="numero" class="form-control" required>
</div>
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Cuenta</span>
<input type="text" name="plan" class="form-control" id="nombreplan" required>
</div>
<input type="text" id="searchInputplan" class="form-control"  placeholder="Buscar Cuenta..">
<div class="input-group mb-1">
<span class="input-group-text">Listado Cuentas</span>

<select id="plandecuentaf" size="5" name="plandecuenta" class="form-select" required="">

</select>
</div>

<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Saldo Tipo</span>
<select  name="tipo" class="form-select" required>
<option value="DEBE">DEBE</option>
<option value="HABER">HABER</option> </select>
</div>
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Descripcion</span>

<textarea name="descripcion" placeholder="descripcion" id="descripcion" class="form-control" cols="10" rows="3" required></textarea>
</div>

<button type="submit" class="btn btn-primary"> Registrar</button>
</form>
<div id="respuesta"></div>
    `;
    form.innerHTML=view;
    plandecuentaf();
    let searchInput = document.getElementById("searchInputplan");
    searchInput.addEventListener("input", searchSelectplan);

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', menuempresa);
    });
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));
    

}

function searchSelectplan() {
    // Obtenemos el valor del input y el select
    let plandecuenta = document.getElementById("plandecuentaf");
    let filter = document.getElementById("searchInputplan").value.toLowerCase(); // Obtener el valor del filtro

    // Obtener todas las opciones del select
    let options = plandecuenta.getElementsByTagName("option");

    // Recorrer las opciones y aplicar el filtro
    for (let i = 0; i < options.length; i++) {
        const optionValue = options[i].text.toLowerCase();
        options[i].style.display = optionValue.includes(filter) ? "" : "none";
    }
}

function searchSelectplanE() {
    // Obtenemos el valor del input y el select
    let plandecuenta = document.getElementById("plandecuentafe");
    let filter = document.getElementById("searchInputplanE").value.toLowerCase(); // Obtener el valor del filtro

    // Obtener todas las opciones del select
    let options = plandecuenta.getElementsByTagName("option");

    // Recorrer las opciones y aplicar el filtro
    for (let i = 0; i < options.length; i++) {
        const optionValue = options[i].text.toLowerCase();
        options[i].style.display = optionValue.includes(filter) ? "" : "none";
    }
}


function plandecuentaf(){
    
    const pp=document.querySelector("#plandecuentaf");
    let resu=`<option value="0">NINGUNO</option>`;
    fetch(`${URL_APIC}/api/milistaplanes/${uk[0].empresa.idempresa}`) 
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        data.map(lista=>{
            resu+=`<option value="${lista.id}">${lista.numero} ${lista.plan}</option>`;
        })
        pp.innerHTML=resu;
    })
}
function plandecuentafe(){
    
    const pp=document.querySelector("#plandecuentafe");
    let resu=`<option value="0">NINGUNO</option>`;
    fetch(`${URL_APIC}/api/milistaplanes/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        data.map(lista=>{
            resu+=`<option value="${lista.id}">${lista.numero} ${lista.plan}</option>`;
        })
        pp.innerHTML=resu;
    })
}

function milistaplanes(){
    const mil=document.querySelector("#milistaplanes");
objlistaplan=[];
    fetch(`${URL_APIC}/api/milistaplanes/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let resu="";
        data.map(lista=>{
            objlistaplan.push({id:lista.id,numero:lista.numero,plan:lista.plan,tipo:lista.tipo,descripcion:lista.descripcion,consolidar:lista.consolidar,empresa:lista.empresa,idp:lista.idp});
            let color=""
            if(lista.idp==0){
                color=`class="text-danger"`;
            }else{
                color=`class="text-primary"`;
            }
            resu+=`
            <tr>
            <td>${lista.numero}</td>
            <td ${color}>${lista.plan}</td>
            <td>${lista.tipo}</td>
            <td>${lista.descripcion}</td>
            <td><a data-id="editplan,${lista.id}" class="btn btn-primary btn-sm">Edit</a> <a data-id="deleteplan,${lista.id}" class="btn btn-danger btn-sm">Del</a></td>
            </tr>
            `;
        })
        mil.innerHTML=resu;
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
});

    })
    
}

function deleteplan(dato){
    if(confirm("Desea Eliminar..?")){
        fetch(`${URL_APIC}/api/deleteplan/${dato}`)
        .then(res=>res.json())
        .then(data=>{
            if(data[0]=="danger"){
                alert(data[1]);
            }else{
            sitio();
            }
        })
    }
}

function editplan(plan){
const pp=objlistaplan.filter(x=>x.id==plan);
let view=`

<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a data-id="sitio" class="enlace btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
    <li class="breadcrumb-item active" aria-current="page">Editar ${pp[0].plan}</li>
  </ol>
</nav>

<form id="formulario">
<input type="hidden" name="ver" id="yof" value="registroplanesf5">
<input type="hidden" name="idplan" value="${plan}">
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Codigo</span>
<input type="text" name="numero" id="numero" value="${pp[0].numero}" class="form-control" required>
</div>
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Cuenta</span>
<input type="text" name="plan" class="form-control" value="${pp[0].plan}"id="nombreplan" required>
</div>



<input type="text" id="searchInputplanE" class="form-control"  placeholder="Buscar Cuenta..">
<div class="input-group mb-1">
<span class="input-group-text">Listado Cuenta</span>

<select id="plandecuentafe" size="5" name="plandecuenta" class="form-select" required="">

</select>
</div>

<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Saldo Tipo:${pp[0].tipo}</span>
<select  name="tipo" class="form-select" required>

<option value="DEBE">DEBE</option>
<option value="HABER">HABER</option> 

</select>
</div>
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">Descripcion</span>

<textarea name="descripcion" placeholder="descripcion" id="descripcion" class="form-control" cols="10" rows="3" required>${pp[0].descripcion}</textarea>
</div>

<button type="submit" class="btn btn-primary"> Registrar</button>
</form>

`;

app.innerHTML=view;
plandecuentafe();
let searchInput = document.getElementById("searchInputplanE");
searchInput.addEventListener("input", searchSelectplanE);

const forme = document.querySelector("#formulario");
forme.addEventListener("submit", (e) => sendform(e, forme));

const enlaces = document.querySelectorAll(".enlace");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
}
function copiarplandecuentas(){
    let view=`
    <nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a data-id="sitio" class="enlace btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
    <li class="breadcrumb-item active" aria-current="page">Copiar Plan de Cuentas</li>
  </ol>
</nav>
    
    <a data-id="agregarPlanes" class="btn btn-info enlace">Agregar Plan de Cuentas</a>
    <a data-id="reemplazarPlanes" class="btn btn-primary enlace">Reemplazar Plan de Cuentas</a> 
    <div class="table-responsive" style="overflow:scroll; height:600px;">
<table class="table" >
<thead><th>Codigo</th><th>Cuenta</th><th>Tipo</th><th>Descripcion</th></thead>
<tbody id="listaplanesempresa" ></tbody>
</table>
</div>
    `;
    
    app.innerHTML=view;    
    listaplanesempresa();
    const enlaces = document.querySelectorAll(".enlace");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
    
}
function agregarPlanes(){
    if(confirm("Por favor confirme el Agregar y esperre unos 10 segundos")){
        //bloqueoElement.style.display = 'block';
    fetch(`${URL_APIC}/api/agregarplanes/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        //bloqueoElement.style.display = 'none';
        sitio();
    })
}
}
function reemplazarPlanes(){


    if(confirm("Por favor confirme el Agregar y espere unos 10 segundos")){
        //bloqueoElement.style.display = 'block';
        fetch(`${URL_APIC}/api/reemplazarplanes/${uk[0].empresa.idempresa}`)
        .then(res=>res.json())
        .then(data=>{
            //alert("Se agrego correctamente..!!");
            //bloqueoElement.style.display = 'none';
            sitio();
        })
    }
}
function listaplanesempresa(){
    const planes=document.querySelector("#listaplanesempresa");
    fetch(`${URL_APIC}/api/listaplanesempresa/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let resu="";
        data.map(lista=>{
            
            resu+=`
            <tr>
            <td>${lista.numero}</td>
            <td>${lista.plan}</td>
            <td>${lista.tipo}</td>
            <td>${lista.descripcion}</td>
            
            </tr>
            `;
        })
        planes.innerHTML=resu;
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
                if(data[2]=="registroplanes"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    setTimeout(() => {
                        form.reset();
                        sitio();
                    }, 2000);
                    return;
                    }

                if(data[2]=="registroplanesf5"){
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


