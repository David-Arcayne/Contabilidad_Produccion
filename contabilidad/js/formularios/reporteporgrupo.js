import { URL_APIC } from "../../../lib/services.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";


const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100)+"reporteporgrupo";
export function sReporteporGrupo(code, permisos, refrescar) {

    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio();    
}

function enlaces(dato){
    //console.log(dato)
    const enlaces = document.querySelectorAll(`${dato}`);
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menu);
    });
}
function menu(e){
    const dataid = e.currentTarget.getAttribute('data-id');
    const [funcion, id, ids,idt,idc] = dataid.split(',');
    switch(funcion){
        case "sitio":
            sitio();
            break;
        default:
            sitio();
            break;
    }
}



function sitio() {

    let view=`
    
    <h4>Lista de Reportes</h4>
    <form id="formulario${codigo}">
    <label>Template:<select name="codigo" id="listagrupos" class="form-select" required></select></label>
    <label>De <input name="fini" id="fini" type="date" class="form-control"></label><label>Hasta <input name="ffin" id="ffin" type="date" class="form-control"></label>
    <button class="btn btn-primary" type="submit">Obtener</button>
    </form>
    <div id="reporteporgrupo"></div>
    `;
    app.innerHTML=view;
    listatemplates();
    const form=document.querySelector("#formulario"+codigo);
    form.addEventListener("submit",e=>{ ObtenerReporte(e)});
}




function listatemplates() {
    fetch(`${URL_APIC}/api/listatemplate/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        let view=`<option value="">Ninguno</option>`;
        data.map(lista=>{
            view+=`<option value="${lista.codigo}">${lista.nombre}</option>`;
        })
        document.querySelector("#listagrupos").innerHTML=view;

    })
}

function ObtenerReporte(e) {
    e.preventDefault();
    const repo=document.querySelector("#reporteporgrupo");
    const codigo=document.querySelector("#listagrupos").value;
    const fini=document.querySelector("#fini").value;
    const ffin=document.querySelector("#ffin").value;
    
    fetch(`${URL_APIC}/api/vertemplatedatos/${codigo}/${uk[0].empresa.idempresa}/${fini}/${ffin}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        let view = `<a data-id="sitio" class="btn btn-primary">Limpiar</a><hr>`;
        
        // Crear encabezados de tabla
        view += `<table class="table">
                    <thead>
                        <tr>
                            
                            <th colspan="2">${data[0].nombre}</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        // Recorrer los datos del template
        data.forEach(template => {
            template.grupo.forEach(grupo => {
                view += `<tr>
                            <td>
                                <b>${grupo.nombre}</b> <br>`;
                // Recorrer los detalles del grupo
                let totalg=0;
                grupo.detallegrupo.forEach(detalle => {
                    //${detalle.nplancuenta}
                    totalg=totalg+parseFloat(detalle.total);
                    view += `  ${detalle.nombreplan} : ${detalle.total}<br>
                             `;
                });
                            view+=`</td>
                            `;
                
                
                
                view += `<td>${totalg}</td>
                        </tr>`;
            });
        });
        
        view += `</tbody>
                 </table>`;
        
        repo.innerHTML = view;
        enlaces("a");
        
    })


}