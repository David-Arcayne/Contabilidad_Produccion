import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100)+"clientes";

export function cproveedores(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
    
}

function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id, ids] = dataid.split(',');
    
    switch (funcion) {
        case "eliminarProveedor":
            eliminarProveedor(id,ids);
            break;
        case "editarProveedor":
            editarProveedor(id);
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

    <h4>Proveedores:</h4>
    <form id="formulario${codigo}">
    <input name="ver" type="hidden" value="registroproveedor">
    <input name="empresa" type="hidden" value="${uk[0].empresa.idempresa}">
    <label>Nombre: <input type="text" name="nombre" placeholder="Nombre" class="form-control" required></label>
    <label>Nit: <input type="text" name="nit" placeholder="Nit" class="form-control" required></label>
    <label>Pais: <input type="text" name="pais" placeholder="Pais" class="form-control" required></label>
    <label>Ciudad: <input type="text" name="ciudad" placeholder="Ciudad" class="form-control" required></label>
    <label>Zona/Barrio: <input type="text" name="zonabarrio" placeholder="Zona/Barrio" class="form-control" required></label>
    <label>Direccion: <input type="text" name="direccion" placeholder="Direccion" class="form-control" required></label>
    <label>Telefono: <input type="text" name="telefono" placeholder="Telefono" class="form-control" required></label>
    <label>Mobil: <input type="text" name="mobil" placeholder="Mobil" class="form-control" required></label>
    <textarea name="detalle" class="form-control" cols="30" placeholder="Detalles" rows="2"></textarea>
    <button type="submit" class="btn btn-primary" >Registrar</button>
    </form>
    <div id="respuesta"></div><hr>
    <div class="table-responsive">
    <input type="text" id="buscarproveedor" class="form-control"  placeholder="Buscar ">
    <table class="table">
    <thead>
    <th>Razon Social</th>
    <th>NIT</th>
    <th>Pais</th>
    <th>Ciudad</th>
    <th>Zona/Barrio</th>
    <th>Direccion</th>
    <th>Telefono</th>
    <th>Mobil</th>
    <th>Detalle</th>
    <th></th>
    </thead>
    <tbody id="listaproveedores"></tbody>
    </table>
    </div>
    `;
    app.innerHTML=view;

    listaproveedores();
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit", (e) => sendform(e, forme));
    let searchInput = document.getElementById("buscarproveedor");
searchInput.addEventListener("input", buscarproveedor);
}

function buscarproveedor(dato) {
    console.log(dato);
      var input, filter, table, tr, i,j;
      input = document.getElementById("buscarproveedor");
      filter = input.value.toUpperCase();
      console.log(filter);
      table = document.getElementById("listaproveedores");
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

function listaproveedores(){
    const cl=document.querySelector("#listaproveedores");
    
    fetch(`${URL_APIC}/api/listaproveedores/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        const jsonString = JSON.stringify(data);
        localStorage.setItem("proveedores", jsonString);
        let resu="";
        data.map(lista=>{
            
            resu+=`<tr>
            <td>${lista.nombre}</td>
            <td>${lista.nit}</td>
            <td>${lista.pais}</td>
            <td>${lista.ciudad}</td>
            <td>${lista.zona}</td>
            <td>${lista.direccion}</td>
            <td>${lista.telefono}</td>
            <td>${lista.mobil}</td>
            <td>${lista.detalle}</td>
            <td><a data-id="eliminarProveedor,${lista.id}" class="btn btn-danger"><i class="bi bi-trash"></i></a> <a data-id="editarProveedor,${lista.id}" class="btn btn-primary btn-sm"><i class="bi bi-pencil-square"></i></a></td>
            </tr>`;
        })
        cl.innerHTML=resu;
        const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });
    })
}
function eliminarProveedor(dato){
if(confirm("DEsea Eliminar..?")){
fetch(`${URL_APIC}/api/eliminarproveedor/${dato}`)
.then(res=>res.json())
.then(data=>{
    listaproveedores();
})
}
}

function buscador(dato) {
  
    var input, filter, table, tr, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById(dato);
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      let tds = tr[i].getElementsByTagName("td");
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


function editarProveedor(dato){
    let prove=localStorage.getItem("proveedores");
    let obpro=JSON.parse(prove);
    const cl=obpro.filter(x=>x.id==dato);
     
    let view=`
    <nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a data-id="sitio" class="btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
    <li class="breadcrumb-item active" aria-current="page">Editar ${cl[0].nombre}</li>
  </ol>
</nav>
    <h4>Editar:</h4>
    <form id="formulario${codigo}">
    <input name="ver" type="hidden" value="registroproveedorf5">
    <input name="idc" type="hidden" value="${dato}">
    <label>Nombre: <input type="text" name="nombre" placeholder="Nombre" class="form-control" value="${cl[0].nombre}" required></label>
    <label>Nit: <input type="text" name="nit" placeholder="Nit" class="form-control" value="${cl[0].nit}" required></label>
    <label>Pais: <input type="text" name="pais" placeholder="Pais" class="form-control" value="${cl[0].pais}" required></label>
    <label>Ciudad: <input type="text" name="ciudad" placeholder="Ciudad" class="form-control" value="${cl[0].ciudad}" required></label>
    <label>Zona/Barrio: <input type="text" name="zonabarrio" placeholder="Zona/Barrio" class="form-control" value="${cl[0].zona}" required></label>
    <label>Direccion: <input type="text" name="direccion" placeholder="Direccion" class="form-control" value="${cl[0].direccion}" required></label>
    <label>Telefono: <input type="text" name="telefono" placeholder="Telefono" class="form-control" value="${cl[0].telefono}" required></label>
    <label>Mobil: <input type="text" name="mobil" placeholder="Mobil" class="form-control" value="${cl[0].mobil}" required></label>
    <textarea name="detalle" class="form-control" cols="30" placeholder="Detalles" rows="2">${cl[0].detalle}</textarea>
    <button type="submit" class="btn btn-primary" onclick="sendForm()">Actualizar</button>
    </form>
    
    `;
    app.innerHTML=view;

    const enlaces = document.querySelectorAll(".btn");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuempresa);
        });

    const forme = document.querySelector(`#formulario${codigo}`);
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

            if(data[0]=="success"){
                if(data[2]=="registroproveedor"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        sitio();
                    }, 2000);
                    return;
                }
                if(data[2]=="registroproveedorf5"){
                    form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                    
                    setTimeout(() => {
                    
                        form.reset();
                        sitio();
                    }, 2000);
                    return;
                }
            }else{
                form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                
                
                setTimeout(() => {
                    form.remove();
                    sitio();
                }, 3000);
                return;
            }
        })
    
}