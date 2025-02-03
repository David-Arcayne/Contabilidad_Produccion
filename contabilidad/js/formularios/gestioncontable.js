import { URL_APIC } from "../../../lib/services.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";
let code = [];
let objgestion = [];

export function cgestioncontable(codigo, permisos, refrescar) {
    code = codigo;
    app = document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    sitio(codigo);

}
function menuempresa(event) {
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id, ids] = dataid.split(',');

    switch (funcion) {
        case "estadoGestion":
            estadoGestion(id, ids);
            break;
        case "editarGestion":
            editarGestion(id);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}

function sitio() {


    const fechaActual = new Date();
    const mifecha = fechaActual.toISOString().slice(0,10);

    let view = `

    <h4>Crear Gestion</h4>
    <form id="formulario">
    <input name="ver" type="hidden" value="registrogestion">
    <input name="empresa" type="hidden" value="${uk[0].empresa.idempresa}">
    
    <div class="input-group mb-3">
    <span class="input-group-text" id="basic-addon1">Nombre de la Gestion</span>
    <input type="text" class="form-control" name="nombre" placeholder="Nombre de Gestion" >
    </div>
    <div class="input-group mb-3">
    <span class="input-group-text">Inicio de Gestion</span>
    <input type="date" name="fechaini" class="form-control" value="${mifecha}" >
    <span class="input-group-text">Final de Gestion</span>
    <input type="date" name="fechafin" class="form-control" value="${mifecha}" >
    </div>
    <button class="btn btn-primary" type="submit" >Crear Gestion</button>
    </form>
    <div id="respuesta"></div>
    <hr>
    <table class="table">
    <thead><th>Gestion</th><th>Fecha Inicio</th><th>Fecha final</th><th>Fecha</th><th></th></thead>
    <tbody id="listadegestion"></tbody>
    </table>
    
    `;

    app.innerHTML = view;
    listadegestion();
    const forme = document.querySelector("#formulario");
    forme.addEventListener("submit", (e) => sendform(e, forme));
}
function listadegestion() {
    const lg = document.querySelector("#listadegestion");
    objgestion = [];
    fetch(`${URL_APIC}/api/listadegestion/${uk[0].empresa.idempresa}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            let view = "", estado = "";
            data.map(lista => {
                objgestion.push(lista);
                if (lista.estado == 2) {
                    estado = `<a data-id="estadoGestion,${lista.id},1" class="btn btn-success"><i class="bi bi-hand-thumbs-up-fill"></i></a>`;
                } else {
                    estado = `<a data-id="estadoGestion,${lista.id},2" class="btn btn-danger"><i class="bi bi-hand-thumbs-down-fill"></i></a>`;
                }
                view += `<tr>
                <td>${lista.nombre}</td>
                <td>${lista.fechaini}</td>
                <td>${lista.fechafin}</td>
                <td>${lista.fecha}</td>
                <td>${estado} <a data-id="editarGestion,${lista.id}" class="btn btn-primary"><i class="bi bi-pencil-square"></i></a></td>
                </tr>`;
            })
            lg.innerHTML = view;
            const enlaces = document.querySelectorAll(".btn");
            enlaces.forEach(enlace => {
                enlace.addEventListener("click", menuempresa);
            });
        })
}
function editarGestion(id) {
    const gg = objgestion.filter(x => x.id == id);
    let view = `


    <nav aria-label="breadcrumb">
<ol class="breadcrumb">
  <li class="breadcrumb-item"><a data-id="sitio" class="enlace btn btn-success"><i class="bi bi-rewind-circle"></i>Volver</a></li>
  <li class="breadcrumb-item active" aria-current="page">Editar</li>
</ol>
</nav>
    <h4>Crear Gestion</h4>
    <form id="formulario">
    <input name="ver" type="hidden" value="registrogestionf5">
    <input name="idgestion" type="hidden" value="${id}">
    <input name="empresa" type="hidden" value="${uk[0].empresa.idempresa}">
    
    <div class="input-group mb-3">
    <span class="input-group-text" id="basic-addon1">Nombre de la Gestion</span>
    <input type="text" class="form-control" name="nombre" placeholder="Nombre de Gestion" value="${gg[0].nombre}" >
    </div>
    <div class="input-group mb-3">
    <span class="input-group-text">Inicio de Gestion</span>
    <input type="date" name="fechaini" class="form-control" value="${gg[0].fechaini}">
    <span class="input-group-text">Final de Gestion</span>
    <input type="date" name="fechafin" class="form-control" value="${gg[0].fechafin}">
    </div>
    <button class="btn btn-primary" type="submit">Actualizar Gestion</button>
    </form>
    <div id="respuesta"></div>
    <hr>
    <table class="table">
    <thead><th>Gestion</th><th>Fecha</th><th></th></thead>
    <tbody id="listadegestion"></tbody>
    </table>
    
    `;

    app.innerHTML = view;
    listadegestion();
    const forme = document.querySelector("#formulario");
    forme.addEventListener("submit", (e) => sendform(e, forme));

    const enlaces = document.querySelectorAll(".enlace");
    enlaces.forEach(enlace => {
        enlace.addEventListener("click", menuempresa);
    });
}

function estadoGestion(id, estado) {

    if (confirm("Desea Cambiar..?")) {
        fetch(`${URL_APIC}/api/estadogestion/${id}/${estado}/${uk[0].empresa.idempresa}`)
            .then(res => res.json())
            .then(data => {
                listadegestion();
            })
    }
}

function sendform(e, form) {
    e.preventDefault();
    const dato = new FormData(form);
    fetch(`${URL_APIC}/api/`, {
        method: "POST",
        body: dato
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data[0] == "success") {
                if (data[2] == "registrogestion") {
                    form.innerHTML = `<div class="alert alert-success" id="alerta">${data[1]}</div>`;

                    setTimeout(() => {

                        form.reset();
                        sitio();
                    }, 2000);
                    return;
                }
                if (data[2] == "registrogestionf5") {
                    form.innerHTML = `<div class="alert alert-success" id="alerta">${data[1]}</div>`;

                    setTimeout(() => {

                        form.reset();
                        sitio();
                    }, 2000);
                    return;
                }
            } else {
                form.innerHTML = `<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
                const ale = document.querySelector('#alerta');

                setTimeout(() => {
                    ale.remove();

                }, 3000);
                return;
            }
        })

}