import { URL_APIPANEL } from "../../lib/services.js";

window.administracion = administracion;
window.contabilidad = contabilidad;
window.comercial = comercial;
window.recursoshumanos = recursoshumanos;
window.activosfijos = activosfijos;
window.desarrollo = desarrollo;
window.produccion = produccion;
//window.salir = salir;
const app=document.querySelector("#app");
const modulos = [
    { id: 1, nombre: "Administracion", onclick: "administracion" },
    { id: 2, nombre: "Contabilidad", onclick: "contabilidad" },
    { id: 3, nombre: "Comercial", onclick: "comercial" },
    { id: 4, nombre: "Recursos Humanos", onclick: "recursoshumanos" },
    { id: 5, nombre: "Activos Fijos", onclick: "activosfijos" },
    { id: 6, nombre: "Desarrollo", onclick: "desarrollo" },
    { id: 7, nombre: "Produccion", onclick: "produccion" },

  ];
let datosUKS = localStorage.getItem("yofinanciero");
let uks = JSON.parse(datosUKS);
if(app){
    if(!datosUKS){
      window.location=`../`;
    }else{
      Panel();
      
    }
}
function salirYo(){
    const ap=document.querySelector("#apagar");
    let view=`<a  class="btn btn-danger btn-sm derecho"  data-bs-toggle="modal" data-bs-target="#staticBackdrop"><i class="bi bi-power text-white"></i></a>
    
    <!-- Modal -->
<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="staticBackdropLabel">Salir de la Aplicacion.</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
       <div class="alert alert-warning">Por favor confirmar si desea salir de la aplicacion</div>
      </div>
      <div class="modal-footer">
        <!--button type="button" class="btn btn-info" data-bs-dismiss="modal">Cerrar</button -->
        <a onclick="apagar()" class="btn btn-danger"><i class="bi bi-power text-white fs-3"></i>Salir de la aplicacion</a>
      </div>
    </div>
  </div>
</div>`;
    ap.innerHTML=view;
    document.querySelector('.btn-danger').addEventListener('click', apagar);

}
function apagar(){
    console.log("Salir");
    localStorage.removeItem("yofinanciero");
    localStorage.clear();
    window.location.href="../index.html";
}

function renderizarModulo(modulo) {
  return `
    <div class="col col-md-3">
      <div class="card mb-2 rounded-3 shadow-sm">
        <div class="card-header">
          <p class="my-0 fw-normal">${modulo.nombre}</p>
        </div>
        <div class="card-body">
          <ul class="list-unstyled mt-3 mb-4">
            <li>Yo Financiero</li>
            <li>Help center access</li>
          </ul>
          <button class="w-100 btn btn-lg btn-outline-primary" id="${modulo.onclick}Button">Ingresar a ${modulo.nombre} </button>
        </div>
      </div>
    </div>
  `;
}
  
function Panel() {
  let iduk = uks[0].empresa.idempresa;
  let iduu=uks[0].idusuario;
  //console.log(iduk,iduu);

  fetch(`${URL_APIPANEL}/api/accesodesktop/${iduk}/${iduu}`)
    .then(res => res.json())
    .then(data => {
      console.log(data)

      let view = `
        <div class="container-fluid p-2">
          <div class="card shadow-lg ">
            <div class="card-header">${uks[0].empresa.nombre}  <div id="apagar"></div></div>
            <div class="card-body ">
              <div class="row">
                <div class="col col-md-10">
                  <div class="row">
      `;

      data.map(lista => {
          const moduloEncontrado = modulos.find(modulo => modulo.id == lista.modulo);
          if (moduloEncontrado) {
            view += renderizarModulo(moduloEncontrado);
          } else {
            view += `<p>No hay módulo encontrado para el ID proporcionado.</p>`;
          }
      });

      view += `
                  </div>
                </div>
                <div class="col col-md-2">
                  <div class="card">
                    <div class="card-header">
                      <img src="../assets/img/icon.png" alt="profile" class="img-fluid rounded-3">
                    </div>
                    <div class="card-body">
                      <p class="fw-bold text-center">${uks[0].nombre}</p>
                      <hr>
                      <p class="text-center">${uks[0].cargo}</p>
                      <p class="text-center">${uks[0].area}</p>
                      <p class="text-center">${uks[0].empresa.sucursal}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      app.innerHTML = view;
      salirYo();

      // Asignar los eventos onclick después de que los botones se hayan renderizado
      modulos.forEach(modulo => {
          const button = document.getElementById(`${modulo.onclick}Button`);
          if (button) {
              button.addEventListener('click', window[modulo.onclick]);
          }
      });
  });
}
  

function administracion(){
    //fetch('./js/administracion.json')
    fetch(`${URL_APIPANEL}/api/obtenermenu/1/${uks[0].idusuario}`)
    .then(response => response.json())
    .then(data => {
        const jsonString = JSON.stringify(data);
        localStorage.setItem("yofinancieromenu", jsonString);
        console.log("Menu desde localStorage:", JSON.parse(localStorage.getItem("menu")));
        window.location=`../ad/`;
    })
    .catch(error => console.error('Error al cargar el JSON:', error));

}
/*
function empresa(){
    fetch('./js/empresa.json')
    .then(response => response.json())
    .then(data => {
        const jsonString = JSON.stringify(data);
        localStorage.setItem("yofinancieromenu", jsonString);
        console.log("Menu desde localStorage:", JSON.parse(localStorage.getItem("menu")));
        window.location=`../em/`;
    })
    .catch(error => console.error('Error al cargar el JSON:', error));

}
*/

function contabilidad(){
  
    fetch(`${URL_APIPANEL}/api/obtenermenu/2/${uks[0].idusuario}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        const jsonString = JSON.stringify(data);
        localStorage.setItem("yofinancieromenu", jsonString);
        console.log("Menu desde localStorage:", JSON.parse(localStorage.getItem("menu")));
        window.location=`../ct/`;
        
    })
    .catch(error => console.error('Error al cargar el JSON:', error));

}
function comercial(){
    //fetch('./js/comercial.json')
    fetch(`${URL_APIPANEL}/api/obtenermenu/3/${uks[0].idusuario}`)
    .then(response => response.json())
    .then(data => {
        const jsonString = JSON.stringify(data);
        localStorage.setItem("yofinancieromenu", jsonString);
        console.log("Menu desde localStorage:", JSON.parse(localStorage.getItem("menu")));
        window.location=`../cm/`;
    })
    .catch(error => console.error('Error al cargar el JSON:', error));

}
function recursoshumanos(){
    
    
    fetch(`${URL_APIPANEL}/api/obtenermenu/4/${uks[0].idusuario}`)
    .then(response => response.json())
    .then(data => {
        const jsonString = JSON.stringify(data);
        localStorage.setItem("yofinancieromenu", jsonString);
        console.log("Menu desde localStorage:", JSON.parse(localStorage.getItem("menu")));
        window.location=`../rh/`;
    })
    .catch(error => console.error('Error al cargar el JSON:', error));

}
function activosfijos(){

    fetch(`${URL_APIPANEL}/api/obtenermenu/5/${uks[0].idusuario}`)
    .then(response => response.json())
    .then(data => {
        const jsonString = JSON.stringify(data);
        localStorage.setItem("yofinancieromenu", jsonString);
        console.log("Menu desde localStorage:", JSON.parse(localStorage.getItem("menu")));
        window.location=`../af/`;
    })
    .catch(error => console.error('Error al cargar el JSON:', error));
  
}
function desarrollo(){

  fetch(`${URL_APIPANEL}/api/obtenermenu/6/${uks[0].idusuario}`)
  .then(response => response.json())
  .then(data => {
      const jsonString = JSON.stringify(data);
      localStorage.setItem("yofinancieromenu", jsonString);
      console.log("Menu desde localStorage:", JSON.parse(localStorage.getItem("menu")));
      window.location=`../dev/`;
  })
  .catch(error => console.error('Error al cargar el JSON:', error));

}
function produccion(){

  fetch(`${URL_APIPANEL}/api/obtenermenu/7/${uks[0].idusuario}`)
  .then(response => response.json())
  .then(data => {
      const jsonString = JSON.stringify(data);
      localStorage.setItem("yofinancieromenu", jsonString);
      console.log("Menu desde localStorage:", JSON.parse(localStorage.getItem("menu")));
      window.location=`../prod/`;
  })
  .catch(error => console.error('Error al cargar el JSON:', error));

}

function desarrollo88(){
        window.location=`../dev/`;   

}