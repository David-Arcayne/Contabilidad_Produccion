import { URL_APIC } from "../../../lib/services.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let templates="";

const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100) + "grupodereporte";
let app = "";

export function cgrupodeReporte(code, permisos, menuprimario, menusegundario, refrescar) {
    app = document.querySelector(`.p-2[data-value="${code}"] .card-body`);

    sitio();

}

function menugrupo(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id, ids] = dataid.split(',');
    switch (funcion) {
        case "agregarlista":
            agregarlista(id);
            break;
        case "importartemplates":
            importartemplates();
            break;
        case "vergrupo":
            verGrupo(id);
            break;
        case "eliminarLista":
            eliminarLista(id, ids);
            break;
        case "eliminargrupo":
            eliminargrupo(id);
            break;
        case "importar":
            importar(id);
            break;
        case "verLista":
            verLista(id);
            break;
        case "verTemplates":
            verTemplates(id);
            break;
        case "eliminartemplate":
            eliminartemplate(id);
            break;
        default:
            sitio();
            break;
    }
}

function agregarlista(id){

    let view=`
    <nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a data-id="sitio" class="enlace btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
    <li class="breadcrumb-item active" aria-current="page">Agregar Lista</li>
  </ol>
</nav>
    <form id="formulario${codigo}">
    <input name="ver" type="hidden" value="registrolista">
    <input name="idg" type="hidden" value="${id}">
    <label># Orden <input name="orden" type="number" class="form-control"></label>
    <div class="input-group mb-1">
    <span class="input-group-text">Cuenta</span>
    <select id="plandecuenta" size="5" name="plandecuenta" class="form-select" required="">
    </select>
    
    </div>

    <button type="submit" class="btn btn-primary btn-sm">Agregar al Grupo</button>
    </form>
    <div id="respuesta"></div>
    <hr>
    <table class="table">
    <thead><th>Numero</th><th>Cuenta</th><th>orden</th><th></th></thead>
    <tbody id="listacuentas"></tbody>
    </table>
    `;
    app.innerHTML=view;
    plancuentas(id);
    listacuentas(id);
    const form=document.querySelector("#formulario"+codigo);
    form.addEventListener("submit",e=>{ sendform(e,form)});

    const buttons = document.querySelectorAll('a');
        buttons.forEach(button => {
            button.addEventListener('click', menugrupo);
        });

}
function listacuentas(id){
    const cc=document.querySelector("#listacuentas");
    fetch(`${URL_APIC}/api/listacuentas/${id}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view = ``;
        data.map(lista => {
            view += `<tr><td>${lista.cuenta}</td><td>${lista.nombre}</td><td>${lista.orden}</td><td><a data-id="eliminarLista,${lista.id},${id}" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></a></td></tr>`;
        });
        cc.innerHTML = view;
        const buttons = document.querySelectorAll('a');
        buttons.forEach(button => {
            button.addEventListener('click', menugrupo);
        });
    })

}

function eliminarLista(id, ids) {

    console.log(id,ids)
    fetch(`${URL_APIC}/api/eliminarlistacuentas/${id}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            listacuentas(ids);

        })
}

function plancuentas(id){
    const pp=document.querySelector("#plandecuenta");
    let resu=`<option value="0">NINGUNO</option>`;
    fetch(`${URL_APIC}/api/milistaplanes/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        data.map(lista=>{
            resu+=`<option value="${lista.numero}">${lista.numero} ${lista.plan}</option>`;
        })
        pp.innerHTML=resu;
    })    
}

function importartemplates(){

    let view=`
    <a data-id="sitio" class="btn btn-success">Volver</a><br>
    <h4>Lista de Templates</h4>
    <hr>
    <div id="listatemplates"></div>`;

    app.innerHTML = view;
    listatemplates();
    const enlace=document.querySelectorAll("a");
    enlace.forEach(lista=>{
        lista.addEventListener("click",menugrupo);
    })

}

function listatemplates(){
    let cc=document.querySelector("#listatemplates");
    fetch(`${URL_API}/ad/api/listadetemplates/${uk[0].empresa.idtiponegocio}`)
    .then(res=>res.json())
    .then(data=>{
        templates=[];
        console.log(data);
        
        let view=`
        <table class="table"><thead><th>Template</th><th></th></thead><tbody>`;
        data.map(lista=>{
            templates.push(lista);
            view+=`<tr><td>${lista.nombre}</td><td><a data-id="vergrupo,${lista.codigo}" class="btn btn-primary">Ver</a> <a data-id="importar,${lista.codigo}" class="btn btn-primary">Importar</a></td></tr>`;
        })
        view+=`</tbody></table>`;
        
        cc.innerHTML=view;
        const buttons = document.querySelectorAll('a');
        buttons.forEach(button => {
            button.addEventListener('click', menugrupo);
        });
        


    })
    .catch(e=>{
        console.log(e);
    })
}

function importar(id) {
    console.log(id,uk[0].empresa.idempresa)
    const imp=templates.find(lista=>lista.codigo==id);
    console.log(imp);
    

    const formData = new FormData();
    formData.append('ver', 'impotardato');
    formData.append('empresa', uk[0].empresa.idempresa);
    formData.append('template', JSON.stringify(imp)); 
    
    //aqui codigo

    fetch(`${URL_APIC}/api/`, { 
        method: 'POST', 
        body: formData // Cuerpo de la solicitud
      })
      .then(response => response.json()) // Convertir la respuesta a JSON
      .then(data => {
        console.log('Éxito:', data); // Manejar la respuesta exitosa
        sitio();
      })
}


function verGrupo(id){
    
    let cc=document.querySelector("#listatemplates");

    const tem=templates.find(lista=>lista.codigo==id);
    console.log(tem.nombre);
    
        
        let view=`<a data-id="importartemplates" class="btn btn-primary">Volver</a><br>
        ${tem.nombre}
        <table class="table"><thead><th>Nombre</th><th>Lista</th><th></th></thead><tbody>`;
        tem.grupo.map(lista=>{
            view+=`<tr><td><b>${lista.orden} ${lista.nombre} </b></td><td>`;

            lista.listagrupo.map(lista2=>{
                view+=`<b> ${lista2.orden} ${lista2.cuenta} ${lista2.nplan} </b> <br>`;
            })
            
            view+=`</td><td>-</td></tr>`;
        })
        view+=`</tbody></table>`;
        cc.innerHTML=view;
        const buttons = document.querySelectorAll('a');
        buttons.forEach(button => {
            button.addEventListener('click', menugrupo);
        });
    
}

function verLista(id){
    
    let cc=document.querySelector("#listatemplates");

    const tem=templates.find(lista=>lista.codigo==id);
    console.log(tem.nombre);

        
        let view=`<a data-id="importartemplates" class="btn btn-primary">Volver</a><br>
        ${tem.nombre}
    `;
    
}

function sitio(){

    let view=`
    <div class="alert alert-warning">Modo DEMO / Tipo Alfa</div>
    <a data-id="importartemplates" class="btn btn-primary">Importar Templates</a><br>
    <h4>Configuracion de Template de reporte.</h4>
    <form id="formulario${codigo}">
    <input name="ver" type="hidden" value="creartemplate">
    <input name="empresa" type="hidden" value="${uk[0].empresa.idempresa}">
    <label>Nombre de Template<input name="nombre" type="text" class="form-control" required></label>
    
    
    <button type="submit" class="btn btn-primary">Crear Template</button>
    </form>
    <hr>
    <div id="listadetemplate"></div>`;

    app.innerHTML = view;
    
    listadetemplate();
    const form=document.querySelector("#formulario"+codigo);
    form.addEventListener("submit",e=>{ sendform(e,form)});
    const buttons = document.querySelectorAll('a');
    buttons.forEach(button => {
        button.addEventListener('click', menugrupo);
    });


}

function listadetemplate(){
    
    const lista=document.querySelector("#listadetemplate");
    fetch(`${URL_APIC}/api/listatemplate/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view=`<table class="table"><thead><th>Template</th><th></th></thead><tbody>`;
        data.map(lista=>{
            view+=`<tr>
            <td>${lista.nombre}</td>
            <td><a data-id="verTemplates,${lista.codigo}" class="btn btn-primary"><i class="bi bi-box-seam-fill"></i></a> <a data-id="eliminartemplate,${lista.codigo}" class="btn btn-danger"><i class="bi bi-trash"></i></a></td> </td>
            </tr>`;
            
        })
        view+=`</tbody></table>`;
        lista.innerHTML = view;
        const buttons = document.querySelectorAll('a');
    buttons.forEach(button => {
        button.addEventListener('click', menugrupo);
    });

    })
}

function verTemplates(codigo) {
    let cc = document.querySelector("#listadetemplate");
    console.log(cc);

    fetch(`${URL_APIC}/api/vertemplate/${codigo}/${uk[0].empresa.idempresa}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            
            let view = `<a data-id="listadetemplate" class="btn btn-primary">Volver</a><br>`;
            
            // Crear encabezados de tabla
            view += `<table class="table">
                        <thead>
                            <tr>
                                <th>Grupo</th>
                                <th>Detalle de Grupo</th>
                            </tr>
                        </thead>
                        <tbody>`;
            
            // Recorrer los datos del template
            data.forEach(template => {
                template.grupo.forEach(grupo => {
                    view += `<tr>
                                <td>
                                    <b>${grupo.orden}:  ${grupo.nombre}</b> <br>
                                    
                                </td>
                                <td>`;
                    
                    // Recorrer los detalles del grupo
                    grupo.detallegrupo.forEach(detalle => {
                        view += `<b>${detalle.orden} ${detalle.nombreplan} ${detalle.nplancuenta} </b> <br>
                                 `;
                    });
                    
                    view += `</td>
                            </tr>`;
                });
            });
            
            view += `</tbody>
                     </table>`;
            
            cc.innerHTML = view;
            
            const buttons = document.querySelectorAll('a');
            buttons.forEach(button => {
                button.addEventListener('click', menugrupo);
            });
        });
}


function eliminartemplate(codigo){
    console.log(codigo,uk[0].empresa.idempresa)
    fetch(`${URL_APIC}/api/eliminartemplate/${codigo}/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        listadetemplate();
    })
}

function listadegrupos(){
console.log(uk[0].empresa.idempresa)
    
    const lista=document.querySelector("#listadegrupos");
    fetch(`${URL_APIC}/api/listagrupos/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view=`<table class="table"><thead> <th>Nombre</th> <th>Funcion</th><th>Orden</th><th></th></thead><tbody>`;
        data.map(lista=>{
            view+=`<tr>
            <td>${lista.nombre}</td>
            <td>${lista.funcion}</td>
            <td>${lista.idp}</td>
            <td><a data-id="agregarlista,${lista.id}" class="btn btn-primary">ADD</a> <a data-id="eliminargrupo,${lista.id}" class="btn btn-danger"><i class="bi bi-trash"></i></a></td>
            </tr>`;
        })
        view+=`</tbody></table>`;
        lista.innerHTML = view;
        const enlace=document.querySelectorAll("a");
        enlace.forEach(lista=>{
            lista.addEventListener("click",menugrupo);
        })

    })

}

function eliminargrupo(id){

    fetch(`${URL_APIC}/api/eliminargrupo/${id}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        
            sitio();
        
    })

}

function funciones(){
    
    const ff=document.querySelector("#funcion");
    fetch(`${URL_APIC}/ad/api/funciones`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        let view=`<option value="0">Ninguno</option>`;
        data.map(lista=>{
            view+=`<option value="${lista.id}">${lista.nombre}</option>`;
        })
        ff.innerHTML=view;
    })

}

function pgrupos() {

    const gg = document.querySelector("#pgrupos");
    fetch(`./api/listagrupos/${uk[0].empresa.idempresa}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            let view = `<option value="0">Ninguno</option>`;
            data.map(lista => {
                view += `<option value="${lista.id}">${lista.nombre} </option>`;
            })
            gg.innerHTML = view;
        })
}

function sendform(e,form){

    e.preventDefault();
    const datos=new FormData(form);
    fetch(`${URL_APIC}/api/`,{
        method:"POST",
        body:datos
    })
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        if(data.ok=="success"){
            if(data.estado=="registrogrupos"){
                sitio();
            }
            if(data.estado=="registrolista"){
                agregarlista(data.dato);
            }
            
        }else{
            sitio();
        }
        


    })

}
