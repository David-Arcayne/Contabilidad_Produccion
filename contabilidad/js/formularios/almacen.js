import { almacenF } from "./formularios.js";
import { crearFormulario } from "../funciones/crearFormularios.js";
import { peticionPOST, peticionGET } from "../funciones/peticionesFetch.js";
import { mostrarCollapse } from "../funciones/funcionesCss.js";
import { validarUsuario } from "../funciones/funcionesGenerales.js";

let idformulario;
let contenidoTabla;
let privilegios;
let idcollapse;
let mostrar;

export function crearFormularioA(codigo, permisos) {
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));
        console.log(privilegios[1]);
    try {
        const respuesta = crearFormulario(codigo, almacenF, privilegios[1]);
        if (respuesta.estado === "exito") {
            console.log("formulario cargado con exito");
            idformulario = document.getElementById(respuesta.formulario);
            contenidoTabla = document.getElementById(respuesta.tablacontenido);
            idcollapse = document.getElementById(respuesta.collap);
            mostrar = document.getElementById(respuesta.mostrar);
            registro();
            listarDatos();
            eventoCambiarTextoBoton();
            selectTipoAlmacen();
            selectSucursal();
        } else {

        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

function registro() {
    idformulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        peticionPOST(idformulario)
            .then(data => {
                // Manejar los datos aquí si la promesa se resuelve correctamente
                console.log('Datos recibidos:', data);
                if(data.estado == "exito"){
                    listarDatos();
                    resetearFormulario();
                }
            })
            .catch(error => {
                //Manejar errores aquí si la promesa se rechaza
                console.error('Error:', error);
            });
    });
}

function eventoCambiarTextoBoton(){
    mostrar.addEventListener('click', () => {
        cambiarTextoBoton();
    });
}

function cambiarTextoBoton(){
        setTimeout(() => {
            if (idcollapse.classList.contains('show')){
                if (mostrar) {
                    mostrar.textContent = "Cancelar Registro";
                }
            }
            else{
                if (mostrar) {
                    mostrar.textContent = "Nuevo Registro";
                }
                resetearFormulario();
            }
        }, 400);
}

function selectTipoAlmacen(){
    const contenidousuario = validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    const endpoint = `./api/listaTipoAlmacen/${idempresa}`;
    peticionGET(endpoint)
    .then(resultado => {
        if (resultado.estado == "error") {

        } else {
            document.getElementById('tipoalmacenA').innerHTML="";
            let text = document.createElement('option');
            text.value = "";
            text.innerHTML = "Escoja un Tipo de Almacen";
            text.selected = "true";
            document.getElementById('tipoalmacenA').appendChild(text);
            let use = resultado.filter(u => u.estado == 1)
            use.map(key => {
                let option = document.createElement('option');
                option.value = key.id
                option.innerHTML = key.tipoalmacen
                document.getElementById('tipoalmacenA').appendChild(option);
            })
        }
    });
}

function selectRegion(){
    const contenidousuario = validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    const endpoint = `./api/listaTipoAlmacen/${idempresa}`;
    peticionGET(endpoint)
    .then(resultado => {
        if (resultado.estado == "error") {

        } else {
            document.getElementById('tipoalmacenA').innerHTML="";
            let text = document.createElement('option');
            text.value = "";
            text.innerHTML = "Escoja un Tipo de Almacen";
            text.selected = "true";
            document.getElementById('tipoalmacenA').appendChild(text);
            let use = resultado.filter(u => u.estado == 1)
            use.map(key => {
                let option = document.createElement('option');
                option.value = key.id
                option.innerHTML = key.tipoalmacen
                document.getElementById('tipoalmacenA').appendChild(option);
            })
        }
    });
}

function selectSucursal(){
    const contenidousuario = validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    const endpoint = `./api/listaSucursales/${idempresa}`;
    peticionGET(endpoint)
    .then(resultado => {
        if (resultado.estado == "error") {

        } else {
            document.getElementById('sucursalA').innerHTML="";
            let text = document.createElement('option');
            text.value = "";
            text.innerHTML = "Escoja una Sucursal";
            text.selected = "true";
            document.getElementById('sucursalA').appendChild(text);
            resultado.map(key => {
                let option = document.createElement('option');
                option.value = key.id
                option.innerHTML = key.sucursal
                document.getElementById('sucursalA').appendChild(option);
            })
        }
    });
}

function listarDatos() {
    const contenidousuario = validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    const endpoint = `./api/listaAlmacen/${idempresa}`;
    peticionGET(endpoint)
        .then(resultado => {
            console.log(resultado);
            if (resultado[0].estado == "error") {
                console.log(resultado.mensaje);
            }
            else {
                let lista = "";
                let c = 0;
                let estados;
                let actualizar;
                let eliminar;
                resultado.map(key => {
                    c++;
                    estados = {
                        0: ``,
                        1: {
                            1: `<span class="btn btn-primary btn-estadoA" data-value="${key.id},2"><i class="bi bi-hand-thumbs-up-fill"></i></span>`,
                            2: `<span class="btn btn-danger btn-estadoA" data-value="${key.id},1"><i class="bi bi-hand-thumbs-down-fill"></i></span>`
                        }
                    };
                    actualizar = {
                        0: ``,
                        1: `<span type="button" class="btn btn-info btn-actualizarA" data-value="${key.id}"><i class="bi bi-pencil-square"></i></span>`

                    }
                    eliminar = {
                        0: ``,
                        1: `<span type="button" class="btn btn-danger btn-eliminarA" data-value="${key.id}"><i class="bi bi-trash3-fill"></i></span>`
                    }

                    lista += `
                <tr>
                <td>${c}</td>
                <td>${key.nombre}</td>
                <td>${key.direccion}</td>
                <td>${key.telefono}</td>
                <td>${key.email}</td>
                <td>${key.tipoalmacen}</td>
                <td>${key.region}</td>
                <td>${key.stockmin}</td>
                <td>${key.stockmax}</td>
                <td>${key.sucursales[0].nombre}</td>
                <td>${estados[privilegios[2]][key.estado]}</td>
                <td class="text-nowrap">${actualizar[privilegios[2]]}${eliminar[privilegios[3]]}</td>      
                </tr>
                `;
                });
                contenidoTabla.innerHTML = lista;
            }
            escucharEventos();
        })
        .catch(error => {
            console.error(error);
        });
}

function escucharEventos() {
    const botonactualizar = document.querySelectorAll('.btn.btn-info.btn-actualizarA');
    
    botonactualizar.forEach(function (boton) {
        boton.addEventListener('click', function (event) {
            // Evitar que el evento se propague al li
            event.stopPropagation();

            const dato = this.getAttribute('data-value');
            actualizar(dato);
            //cerrarTargeta(dato);
        });
    });

    const botoneliminar = document.querySelectorAll('.btn.btn-danger.btn-eliminarA');
    
    botoneliminar.forEach(function (boton) {
        boton.addEventListener('click', function (event) {
            // Evitar que el evento se propague al li
            event.stopPropagation();

            const dato = this.getAttribute('data-value');
            eliminar(dato);
            //cerrarTargeta(dato);
        });
    });

    const botonestado = document.querySelectorAll('.btn.btn-estadoA');
    
    botonestado.forEach(function (boton) {
        boton.addEventListener('click', function (event) {
            // Evitar que el evento se propague al li
            event.stopPropagation();

            const dato = this.getAttribute('data-value').split(',');
            console.log("cambiar "+dato);
            cambiarEstado(dato[0], dato[1]);
        });
    });
}

function actualizar(id){
    //console.log("funcion actualizar"+ id);
    console.log(id)
    const endpoint = `./api/verificarExistenciaAlmacen/${id}`;
    peticionGET(endpoint)
        .then(resultado => {
            console.log(resultado);
            if (!idcollapse.classList.contains('show')){
                mostrarCollapse(idcollapse);
                cambiarTextoBoton();
            }
            if (resultado.estado == "exito") {
                if (document.querySelector('#idA')) {
                    document.querySelector('#idA').remove();
                }
                const id = document.createElement('input');
                id.setAttribute("type", "hidden");
                id.setAttribute("name", "id");
                id.setAttribute("id", "idA");
                id.setAttribute("value", resultado.datos.id);
                idformulario.appendChild(id);
                document.querySelector('#verA').value = "editarAlmacen";
                document.querySelector('#nombreA').value = resultado.datos.nombre;
                document.querySelector('#direccionA').value = resultado.datos.direccion;
                document.querySelector('#telefonoA').value = resultado.datos.telefono;
                document.querySelector('#emailA').value = resultado.datos.email;
                document.querySelector('#tipoalmacenA').value = resultado.datos.idtipoalmacen;
                document.querySelector('#regionA').value = resultado.datos.idregion;
                document.querySelector('#stockminA').value = resultado.datos.stockmin;
                document.querySelector('#stockmaxA').value = resultado.datos.stockmax;
                document.querySelector('#sucursalA').value = resultado.datos.idsucursal;
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function eliminar(id){
    const endpoint = `./api/eliminarAlmacen/${id}`;
    peticionGET(endpoint)
        .then(resultado => {
            console.log(resultado);
            if (resultado.estado == "error") {
                console.log(resultado.mensaje);
            }
            else {
               console.log(resultado.mensaje);
               listarDatos();
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function cambiarEstado(id, estado){
    const endpoint = `./api/actualizarEstadoAlmacen/${id}/${estado}`;
    peticionGET(endpoint)
        .then(resultado => {
            if (resultado.estado == "error") {
                console.log(resultado.mensaje);
            }
            else {
               console.log(resultado.mensaje);
               listarDatos();
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function resetearFormulario(){
    if (privilegios[1] == 1) {
        document.querySelector('#verA').value = "registrarAlmacen";
    }
    idformulario.reset();
}