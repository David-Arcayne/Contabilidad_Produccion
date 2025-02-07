import { cambiarVista, mostrarCollapse, mostrarElemento, ocultarElemento } from "../funciones/funcionesCss.js";
import * as funGeneral from "../funciones/funcionesGenerales.js";
import * as alertas from "../funciones/alertas.js";

let idformulario;
let idnuevo;
let idcollapse;
let privilegios;
let recargar;
let Frecagar;
let Fidnuevo;
let Fcargos;
let Festado;
let Findefinido;
let Fatras;
let idcontenidoTabla;
let contenedor;
let idfiltroCargo = 0;
let idfiltroEstado = 1;

export function contrataciones(codigo, permisos, refrescar) {
    contenedor = codigo;
    recargar = document.getElementById(refrescar);
    privilegios = [...permisos.toString()].map(digito => parseInt(digito));
    const formulario = "form" + codigo;
    const nuevo = "nuevo" + codigo;
    const collapse = "collapse" + codigo;
    const contenidoTabla = "tabla" + codigo;
    contenedor = codigo;
    cargarContenido(codigo, formulario, nuevo, collapse, contenidoTabla, privilegios[1]);
}

function registro() {
    idformulario.addEventListener("submit", async (e) => {
        const boton = idformulario.querySelector('button[type="submit"]');
        boton.disabled = true; // Deshabilitar el botón de registro
        e.preventDefault();

        const datos = new FormData(idformulario);
        fetch(`./api/`, {
            method: 'POST',
            body: datos
        })
            .then(resp => resp.json())
            .then(data => {
                console.log('Datos recibidos:', data);
                if (data.codigo === 100) {
                    document.querySelector('#filtrocargosCON').value = data.cargo;
                    idfiltroCargo = data.cargo;
                    listarDatos();
                    listaTrabajadoresDisponibles();
                    resetearFormulario();
                    idcollapse.classList.remove('show');
                    cambiarTextoBoton();
                }
            })
            .catch(error => {
                console.error('Error al realizar la solicitud:', error);
                boton.disabled = false;
            })
            .finally(() => {
                boton.disabled = false; // Habilitar el botón nuevamente después de recibir respuesta
            });
    });
}

function listaTrabajadoresDisponibles() {
    const contenidousuario = funGeneral.validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    if (idempresa) {
        fetch(`./api/listatrabajador/${idempresa}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(resultado => {
                console.log(resultado)
                if (resultado[0] == "error") {
                    console.log(resultado.error);
                }
                else {
                    let use = resultado.filter(u => u.estadot == 1 || u.estadot == 5);
                    crearOpcionesTrabajador(use);
                }
            })
            .catch(error => {
                console.error('Hubo un problema con la solicitud:', error);
            });
    } else {
        alert("Hubo un error intentelo nuevamentes");
        cambiarVista(idmenusegundario, idmenuprimario);
    }

}

function crearOpcionesTrabajador(options) {
    const input = document.querySelector('#trabajadorcon');
    document.querySelector('#listatrabajadorescon').innerHTML = "";
    options.forEach(option => {
        const optionElement = document.createElement('a');
        optionElement.className = 'dropdown-item custom-optionCONT';
        optionElement.textContent = option.nombres + " - " + option.apellidos + " - " + option.ci;

        optionElement.addEventListener('click', () => {
            input.value = option.nombres + " - " + option.apellidos + " - " + option.ci;
            document.querySelector('#listatrabajadorescon').style.display = 'none';
            document.querySelector('#idtrabajadorCON').value = option.id;
            document.querySelector('#InputSalarioCON').value = option.salario;
        });

        document.querySelector('#listatrabajadorescon').appendChild(optionElement);
    });
    inputListeners();
}

function inputListeners() {
    const input = document.querySelector('#trabajadorcon');
    input.addEventListener('click', function (event) {
        const customOptions = this.nextElementSibling;
        customOptions.style.display = 'block';
        if (input.value.trim() == "") {
            document.querySelector('#idtrabajadorCON').value = "";
        }
        event.stopPropagation();
    });

    document.querySelector(`.p-2[data-value="${contenedor}"] .card-body`).addEventListener('click', function (event) {
        if (!input.contains(event.target)) {
            const customOptions = input.nextElementSibling;
            customOptions.style.display = 'none';
        }
        if (input.value.trim() == "") {
            document.querySelector('#idtrabajadorCON').value = "";
        }
    });

    input.addEventListener('input', function () {
        const searchTerm = funGeneral.normalizeText(input.value).toLowerCase();
        const customOptions = this.nextElementSibling;
        const optionItems = customOptions.querySelectorAll('.custom-optionCONT');
        optionItems.forEach(option => {
            const optionText = funGeneral.normalizeText(option.textContent).toLowerCase();
            option.style.display = optionText.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

function selectCargos(select1, select2) {
    const contenidousuario = funGeneral.validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;

    fetch(`./api/listaCargos/${idempresa}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.estado === "error") {
                console.log(data.mensaje);
                return;
            }

            const addOptions = (selectId, includeTodos = false) => {
                const select = document.getElementById(selectId);
                select.innerHTML = "";  // Limpiar select

                // Añadir opción "Todos" si es necesario
                if (includeTodos) {
                    let todosOption = document.createElement('option');
                    todosOption.value = 0;
                    todosOption.innerHTML = "Todos";
                    todosOption.selected = true;
                    select.appendChild(todosOption);
                }

                // Añadir opciones de los cargos
                data.forEach(item => {
                    let option = document.createElement('option');
                    option.value = item.id;
                    option.innerHTML = item.cargo;
                    option.dataset.value = item.salario;
                    select.appendChild(option);
                });
            };

            // Llamar a la función para cada select
            addOptions(select1);
            addOptions(select2, true);
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
        });
}


function selectMetodopago(select) {
    const contenidousuario = funGeneral.validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    fetch(`./api/listametodopago/${idempresa}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.estado == "error") {
                console.log(data.mensaje);
            }
            else {
                document.getElementById(select).innerHTML = "";
                data.map(key => {
                    let option = document.createElement('option');
                    option.value = key.id;
                    option.innerHTML = key.nombre;
                    document.getElementById(select).appendChild(option);
                });
            }

        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
        });
}

function selectTipoContrato(select) {
    const contenidousuario = funGeneral.validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    fetch(`./api/listaTipocontrato/${idempresa}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.estado == "error") {
                console.log(data.mensaje);
            }
            else {
                document.getElementById(select).innerHTML = "";
                data.map(key => {
                    let option = document.createElement('option');
                    option.value = key.id;
                    option.innerHTML = key.nombre;
                    document.getElementById(select).appendChild(option);
                });
            }

        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
        });
}

function listarDatos() {
    const contenidousuario = funGeneral.validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    fetch(`./api/listacontrataciones/${idempresa}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.estado == "error") {
                console.log(resultado.error);
            }
            else {
                let lista = "";
                let c = 0;
                let actualizar;
                let eliminar;
                let historial;
                let horario;
                let use = data.filter(u => (idfiltroCargo == 0 || u.idcargo == idfiltroCargo) && u.estado == idfiltroEstado);
                console.log(use);
                use.map(key => {
                    c++;
                    actualizar = {
                        0: ``,
                        1: `<span type="button" class="btn btn-info btn-actualizarCON" data-value="${key.id}"><i class="bi bi-pencil-square"></i></span>`

                    }
                    eliminar = {
                        0: ``,
                        1: `<span type="button" class="btn btn-danger btn-eliminarCON" data-value="${key.id},2,${key.idtrabajdor}"><i class="bi bi-trash3-fill"></i></span>`
                    }
                    historial = `<span type="button" class="btn btn-info btn-historialCON" data-value="${key.id},2,${key.idtrabajdor}"><i class="bi bi-trash3-fill"></i></span>`;

                    horario = {
                        0: ``,
                        1: `<span type="button" class="btn btn-info btn-horarioCON" data-value="${key.id},${key.idtrabajdor}"><i class="bi bi-calendar-plus"></i></span>`
                    };

                    lista += `
                <tr class="opcionesCONT">
                <td class="text-end">${c}</td>
                <td>${funGeneral.cambiarFormatoFechaHora(key.fecharegistro)}</td>
                <td>${key.nombres}</td>
                <td>${key.apellidos}</td>
                <td class="text-end">${key.ci}</td>
                <td class="text-end">${key.horas}</td>
                <td class="text-end">${funGeneral.cambiarFormatoFecha(key.fechai)}</td>
                ${key.fechaf == null ? `<td>Indefinido</td>` : `<td class="text-end">${funGeneral.cambiarFormatoFecha(key.fechaf)}</td>`}
                <td class="text-end">${funGeneral.cambiarFormatoFecha(key.fechafirma)}</td>
                ${idfiltroEstado == 1 ? `` : `<td class="text-end">${funGeneral.cambiarFormatoFecha(key.fechab)}</td>`}
                <td>${key.modo == 1 ? 'Directa' : 'Convocatoria'}</td>
                <td class="text-end">${funGeneral.decimas(key.salario)}</td>
                <td>${key.modopago}</td>
                ${key.tipo == 1 ? `<td>Si</td>` : `<td>No</td>`}
                <td>${key.cargo}</td>
                <td>${key.tipocontrato}</td>
                ${idfiltroEstado == 1 ? `<td class="text-nowrap text-center">${actualizar[privilegios[2]]}${eliminar[privilegios[3]]}<!--${horario[privilegios[1]]}--></td>` : ``}      
                </tr>
                `;
                });
                idcontenidoTabla.innerHTML = lista;
            }
            eventosSegundarios();
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
        });
}

function eventosSegundarios() {
    const botonactualizar = document.querySelectorAll('.btn-actualizarCON');

    if (botonactualizar) {
        botonactualizar.forEach(function (boton) {
            boton.addEventListener('click', function (event) {
                // Evitar que el evento se propague al li
                event.stopPropagation();

                const dato = this.getAttribute('data-value');
                actualizar(dato);
                //cerrarTargeta(dato);
            });
        });
    }

    const botoneliminar = document.querySelectorAll('.btn-eliminarCON');

    if (botoneliminar) {
        botoneliminar.forEach(function (boton) {
            boton.addEventListener('click', function (event) {
                // Evitar que el evento se propague al li
                event.stopPropagation();

                const dato = this.getAttribute('data-value').split(',');
                eliminar(dato);
                //cerrarTargeta(dato);
            });
        });
    }
    const botonhorario = document.querySelectorAll('.btn-horarioCON');

    if (botonhorario) {
        botonhorario.forEach(function (boton) {
            boton.addEventListener('click', function (event) {
                // Evitar que el evento se propague al li
                event.stopPropagation();

                const dato = this.getAttribute('data-value').split(',');
                horario(dato);
                //cerrarTargeta(dato);
            });
        });
    }
}

function actualizar(dato) {
    const contenidousuario = funGeneral.validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    fetch(`./api/verificarIDcontratacion/${dato}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (!idcollapse.classList.contains('show')) {
                mostrarCollapse(idcollapse);
                idnuevo.textContent = "Cancelar Registro";
            }
            if (data.estado == "exito") {
                if (document.querySelector('#idCON')) {
                    document.querySelector('#idCON').remove();
                }
                const id = document.createElement('input');
                id.setAttribute("type", "hidden");
                id.setAttribute("name", "id");
                id.setAttribute("id", "idCON");
                id.setAttribute("value", data.datos.id);
                idformulario.appendChild(id);
                document.querySelector('#verCON').value = "editarcontratacion";
                document.querySelector('#idtrabajadorCON').value = data.datos.idtrabajdor;
                document.querySelector('#trabajadorcon').value = data.datos.nombres + " - " + data.datos.apellidos + " - " + data.datos.ci;
                document.querySelector('#InputHorasCON').value = data.datos.horas;
                document.querySelector('#InputeFechaiCON').value = data.datos.fechai;
                document.querySelector('#InputeFechafCON').value = data.datos.fechaf;
                document.querySelector('#SelectCargosCON').value = data.datos.idcargoC;
                document.querySelector('#SelectModoCON').value = data.datos.modo;
                document.querySelector('#InputSalarioCON').value = data.datos.salario;
                document.querySelector('#SelectModopagoCON').value = data.datos.idmodopago;
                document.querySelector('#SelectTipocontratoCON').value = data.datos.idtipocontrato;
                document.querySelector('#SelectTipoCON').value = data.datos.tipo;
                document.querySelector('#InputeFechafirmaCON').value = data.datos.fechafirma;
                document.querySelector('#InputeFechaRCON').value = data.datos.fecharegistro;
                data.datos.fechaf == null ? document.querySelector('#checkindefinido').checked = true : document.querySelector('#checkindefinido').checked = false;
                data.datos.fechaf == null ? document.querySelector('#InputeFechafCON').disabled = true : document.querySelector('#InputeFechafCON').disabled = false;
            }
            else {
                console.log(data.mensaje);
            }

        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
        });
}

function eliminar(dato) {
    // Muestra la alerta de confirmación
    alertas.mostrarAlertaConfirmacion(contenedor, '¿Esta Seguro?', 'EL contrato se dara de baja y no podra cambiar su estado', 'warning').then((result) => {
        if (result.isConfirmed) {
            // Realiza la lógica de eliminación aquí
            fetch(`./api/cambiarestadocontratacion/${dato[0]}/${dato[1]}/${dato[2]}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    if (data.codigo == 100) {
                        alertas.mostrarAlertaInformacion(contenedor, 'Exito', 'EL contrato se dio de baja correctamente.\n El trabajador pasara al estado inactivo', 'success');
                        listarDatos();
                        listaTrabajadoresDisponibles();
                    }
                })
                .catch(error => {
                    console.error('Hubo un problema con la solicitud:', error);
                });
        }
    });
}

function horario(dato) {
    document.querySelector('#hcon').value = dato[0];
    cambiarVista(document.querySelector('#contenedor1con'), document.querySelector('#contenedor2con'))
}

function escucharBotonHorario() {
    const botonhorario = document.querySelectorAll('.newCON');

    if (botonhorario) {
        botonhorario.forEach(function (boton) {
            boton.addEventListener('click', function (event) {
                // Evitar que el evento se propague al li
                event.stopPropagation();

                const dato = this.getAttribute('data-value');
                añadir(dato);
                //cerrarTargeta(dato);
            });
        });
    }
}

function añadir(dato) {
    const body = `
    <form>
        <input type="hidden" name="ver" value="registrarjornada">
        <input type="hidden" name="dia" value="${dato}">
        <input type="hidden" name="contrato" value="${document.querySelector('#hcon').value}">
        <div class="row row-cols-1 row-cols-md-3 g-1">
            <div class="">
                <input type="time" class="form-control" value="08:30">
            </div>
            <div class="">
                <input type="time" class="form-control" value="12:30">
            </div>
            <div class="">
                <button type="button" class="btn btn-primary">Añadir</button>
            </div>
        <div>
    </form>
    `;
    alertas.mostrarFormulario(contenedor, 'Ingrese las horas de entreda y salida', body);
}

function listarHorarios() {
    const contenidousuario = funGeneral.validarUsuario();
    const idempresa = contenidousuario[0]?.empresa?.idempresa;
    fetch(`./api/listacontrataciones/${idempresa}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.estado == "error") {
                console.log(resultado.error);
            }
            else {
                let lista = "";
                let c = 0;
                let actualizar;
                let eliminar;
                let historial;
                let horario;
                let card;
                data.map(key => {
                    c++;
                    actualizar = {
                        0: ``,
                        1: `<span type="button" class="btn btn-info btn-actualizarCON" data-value="${key.id}"><i class="bi bi-pencil-square"></i></span>`

                    }
                    eliminar = {
                        0: ``,
                        1: `<span type="button" class="btn btn-danger btn-eliminarCON" data-value="${key.id},2,${key.idtrabajdor}"><i class="bi bi-trash3-fill"></i></span>`
                    }
                    card = `
                    <div class="card border-warning mb-3" style="max-width: 18rem;">
                        <div class="card-body">
                            <p class=""></p>
                        </div>
                    </div>
                    `;

                    lista += `
                
                `;
                });
                /*<tr>
                <td>${key.nombres}</td>
                <td>${key.apellidos}</td>
                <td class="text-end">${key.ci}</td>
                <td class="text-end">${funGeneral.cambiarFormatoFecha(key.fechai)}</td>
                ${key.fechaf == null ? `<td>Indefinido</td>`: `<td class="text-end">${funGeneral.cambiarFormatoFecha(key.fechaf)}</td>`}
                <td>${key.modo == 1 ? 'Directa':'Convocatoria'}</td>
                <td class="text-end">${funGeneral.decimas(key.salario)}</td>
                <td>${key.modopago}</td>
                <td>${key.cargo}</td>
                <td>${key.tipocontrato}</td>
                <td class="text-nowrap text-center">${actualizar[privilegios[2]]}${eliminar[privilegios[3]]}${horario[privilegios[1]]}</td>      
                </tr> */
                idcontenidoTabla.innerHTML = lista;
            }
            eventosSegundarios();
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
        });
}

function eliminarEventos() {
    if (recargar) {
        recargar.removeEventListener('click', Frecagar);
        document.querySelector('#filtrocargosCON').removeEventListener('change', Fcargos);
    }

    if (idnuevo) {
        idnuevo.removeEventListener("click", Fidnuevo);
    }
}

function eventosIniciales() {
    idfiltroEstado = 1;
    idfiltroCargo = 0;
    escucharBotonHorario();
    Frecagar = () => {
        eliminarEventos();
        const formulario = "form" + contenedor;
        const nuevo = "nuevo" + contenedor;
        const collapse = "collapse" + contenedor;
        const contenidoTabla = "tabla" + contenedor;
        cargarContenido(contenedor, formulario, nuevo, collapse, contenidoTabla, privilegios[1]);
    }
    Fidnuevo = () => {
        cambiarTextoBoton();
    }
    Fcargos = () => {
        idfiltroCargo = document.querySelector('#filtrocargosCON').value;
        listarDatos();
    }
    Festado = () => {
        idfiltroEstado = document.querySelector('#filtroestadoCON').value;
        if (idfiltroEstado == 2) {
            mostrarElemento(document.querySelector('#fechaFFCON'));
        } else if (idfiltroEstado == 1) {
            ocultarElemento(document.querySelector('#fechaFFCON'));
        }
        listarDatos();
    }
    Findefinido = () => {
        if (document.querySelector('#checkindefinido').checked) {
            document.querySelector('#InputeFechafCON').value = "";
            document.querySelector('#InputeFechafCON').disabled = true;
            document.querySelector('#InputeFechafCON').required = false;
        } else {
            document.querySelector('#InputeFechafCON').disabled = false;
            document.querySelector('#InputeFechafCON').required = true;
        }
    }
    Fatras = () => {
        cambiarVista(document.querySelector('#contenedor2con'), document.querySelector('#contenedor1con'));
    }

    recargar.addEventListener('click', Frecagar);
    idnuevo.addEventListener("click", Fidnuevo);
    document.querySelector('#filtrocargosCON').addEventListener('change', Fcargos);

    document.querySelector('#filtroestadoCON').addEventListener('change', Festado);
    const decimales = document.querySelectorAll('.validar-decimal');

    decimales.forEach(elemento => {
        elemento.addEventListener('input', () => {
            funGeneral.validarNumeros(elemento);
        });
    });

    document.querySelector('#checkindefinido').addEventListener('change', Findefinido);

    document.querySelector('#btnatrasCON').addEventListener('click', Fatras);
}

function cambiarTextoBoton() {
    setTimeout(() => {
        if (idcollapse.classList.contains('show')) {
            if (idnuevo) {
                idnuevo.textContent = "Cancelar Registro";
                resetearFormulario();
            }
        }
        else {
            if (idnuevo) {
                idnuevo.textContent = "Nuevo Registro";
            }
            resetearFormulario();
        }
    }, 400);
}

function resetearFormulario() {
    idformulario.reset();
    document.querySelector('#verCON').value = "registrocontrato";
    document.querySelector('#InputeFechafCON').disabled = false;
    funGeneral.obtenerFechaActual('fechaActualCON');
    funGeneral.obtenerFechayHoraActual('fechaHActualCON');
}//baja

function cargarContenido(codigo, formulario, nuevo, collapse, contenidoTabla, escritura) {
    const botonNuevoRegistro = escritura !== 0
        ? `<a class="btn btn-primary m-1" data-bs-toggle="collapse" href="#${collapse}" role="button" id="${nuevo}" aria-expanded="false" aria-controls="collapseExample">Nuevo Registro</a>`
        : '';
    const contenido = `
    <div id="contenedor1con" class="d-block">
    <div class="collapse" id="${collapse}">
                    <div class="container">
                    <form id="${formulario}">

                        <input type="hidden" id="verCON" name="ver" value="registrocontrato">
                        <div class="row">
                            <div class="col-md-4 text-start">
                                <div class="mb-2">
                                    <label class="form-label" for="username">Trabajador*</label>
                                    <div class="dropdown">
                                        <input type="hidden" name="idtrabajador" id="idtrabajadorCON">
                                        <input type="text" class="form-control" id="trabajadorcon" placeholder="Ingrese el nombre, apellido o CI" aria-label="Recipient's username" autocomplete="off" aria-describedby="button-addon2">
                                        <div class="dropdown-menu" id="listatrabajadorescon"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="InputSalarioCON" class="form-label">Salario*</label>
                                    <input type="text" class="form-control validar-decimal" id="InputSalarioCON" name="salario"
                                        placeholder="Ingrese el salario">
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="SelectModopagoCON" class="form-label">Método de pago*</label>
                                    <select name="modopago" id="SelectModopagoCON" class="form-select" required></select>
                                </div>
                            </div>

                            <div class="col-md-2">
                                <div class="mb-2">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="fechaf" value="" id="checkindefinido">
                                        <label class="form-check-label" for="checkindefinido">INDEFINIDO</label>
                                    </div>                                   
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="mb-2">
                                    <label class="form-check-label" for="InputHorasCON">Horas*</label>
                                    <input class="form-control validar-entero" type="text" name="horas" id="InputHorasCON" required>                                      
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="InputeFechaiCON" class="form-label">Fecha inicial*</label>
                                    <input type="date" class="form-control fechaActualCON" id="InputeFechaiCON" name="fechai" required>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="InputeFechafCON" class="form-label">Fecha final*</label>
                                    <input type="date" class="form-control fechaActualCON" id="InputeFechafCON" name="fechaf" required>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="SelectCargosCON" class="form-label">Cargo*</label>
                                    <select name="cargo" id="SelectCargosCON" class="form-select" required></select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="SelectTipocontratoCON" class="form-label">Tipo de contrato*</label>
                                    <select name="tipocontrato" id="SelectTipocontratoCON" class="form-select" required></select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="SelectModoCON" class="form-label">Modo contratación*</label>
                                    <select name="modo" id="SelectModoCON" class="form-select" required>
                                        <option value="1" selected>Directa</option>
                                        <option value="2">Convocatoria</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="SelectTipoCON" class="form-label">¿Contrato con planilla*?</label>
                                    <select name="tipo" id="SelectTipoCON" class="form-select" required>
                                        <option value="1" selected>Si</option>
                                        <option value="2">No</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="InputeFechafirmaCON" class="form-label">Fecha firma contrato*</label>
                                    <input type="date" class="form-control fechaActualCON" id="InputeFechafirmaCON" name="fechafirma" required>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2">
                                    <label for="InputeFechaRCON" class="form-label">Fecha registro*</label>
                                    <input type="datetime-local" class="form-control fechaHActualCON" id="InputeFechaRCON" name="fecha" required>
                                </div>
                            </div>
                            
                            <div class="mb-3 d-flex justify-content-center align-items-center">
                                <button type="submit" class="btn btn-primary">Registrar</button>
                            </div>
                        </div>
                    </form>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                    ${botonNuevoRegistro}
                    </div>
                    <div class="row col-md-4">
                        <div class="col-md-6">
                            <select name="" id="filtrocargosCON" class="form-select m-1" required>
                                <option value="">No se cargaron los cargos</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <select name="" id="filtroestadoCON" class="form-select m-1" required>
                                <option value="1">Vigentes</option>
                                <option value="2">Fenecidos</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="input-group  m-1">
                            <input class="form-control" type="text" placeholder="Filtrar..." aria-label="Search"
                                aria-describedby="button-addon2" id="filtrartablaConT" autocomplete="off" /><span
                                class="input-group-text" id="basic-addon1"><i class="bi bi-search"></i></span>
                        </div>
                    </div>
                </div>
                <div class="table-responsive mt-3"
                    style="max-height: calc(100vh - 200px); overflow-y: auto; width: 100%;">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="text-center" scope="col">N°</th>
                                <th class="text-center" scope="col">Fecha registro</th>
                                <th class="text-center" scope="col">Nombres</th>
                                <th class="text-center" scope="col">Apellidos</th>
                                <th class="text-center" scope="col">CI</th>
                                <th class="text-center" scope="col">Horas</th>
                                <th class="text-center" scope="col">Inicio</th>
                                <th class="text-center" scope="col">Final</th>
                                <th class="text-center" scope="col">Fecha firma</th>
                                <th class="text-center d-none" id="fechaFFCON" scope="col">Fecha fenecido</th>
                                <th class="text-center" scope="col">Contratación</th>
                                <th class="text-center" scope="col">Salario</th>
                                <th class="text-center" scope="col">Método pago</th>
                                <th class="text-center" scope="col">Planilla</th>
                                <th class="text-center" scope="col">Cargo</th>
                                <th class="text-center text-nowrap" scope="col">Tipo Contrato</th>
                                <th class="text-center" scope="col">Opciones</th>
                            </tr>
                        </thead>
                        <tbody id="${contenidoTabla}">
                        </tbody>
                    </table>
                </div>
    </div>
    <div id="contenedor2con" class="d-none">
                    <input type="hidden" id="hcon">
                     <!-- Botones para pantallas normales -->
                        <div class="row d-none d-md-flex col-12 col-md-12 text-start align-items-center">
                            <div class="col-md-2 text-start">
                                <button class="btn btn-primary btn-sm" id="btnatrasCON"><i class="bi bi-arrow-left-circle fs-6"></i> Volver</button>
                            </div>
                            <div class="col-md-8 text-center">
                                <h4>Jornada laboral:</h4>
                            </div>
                            <div class="col-md-2 text-end">
                                
                            </div>
                        </div>
                        
                        <!-- Botones para pantallas pequeñas y de celular -->
                        <div class="row d-flex d-md-none">
                            <div class="col-md-12 text-center">
                                <h4>Lista de Productos Disponibles:</h4>
                            </div>
                            <div class="col-md-12 text-center">
                                <button class="btn btn-primary btn-sm" id="btnatrasCON"><i class="bi bi-arrow-left-circle fs-6"></i> Volver</button>
                            </div>
                        </div>
                        <table class="table">
                        
                          <tr>
                            <td class="text-primary">Lunes <button type="button" data-value="1" class="btn btn-outline-primary border-0 newCON"><i class="bi bi-calendar-check"></i></button></td>
                            <td class="text-primary">Martes <button type="button" data-value="2" class="btn btn-outline-primary border-0 newCON"><i class="bi bi-calendar-check"></i></button></td>
                            <td class="text-primary">Miercoles <button type="button" data-value="3" class="btn btn-outline-primary border-0  newCON"><i class="bi bi-calendar-check"></i></button></td>
                            <td class="text-primary">Jueves <button type="button" data-value="4" class="btn btn-outline-primary border-0 newCON"><i class="bi bi-calendar-check"></i></button></td>
                            <td class="text-primary">Viernes <button type="button" data-value="5" class="btn btn-outline-primary border-0 newCON"><i class="bi bi-calendar-check"></i></button></td>
                            <td class="text-primary">Sabado <button type="button" data-value="6" class="btn btn-outline-primary border-0 newCON"><i class="bi bi-calendar-check"></i></button></td>
                            <td class="text-primary">Domingo <button type="button" data-value="7" class="btn btn-outline-primary border-0 newCON"><i class="bi bi-calendar-check"></i></button></td>
                          </tr>
                        
                        <tbody>
                          <tr>
                            
                            <td>Mark</td>
                            <td>Otto</td>
                            <td>@mdo</td>
                          </tr>
                          <tr>
                            
                            <td>Jacob</td>
                            <td>Thornton</td>
                            <td>@fat</td>
                          </tr>
                          <tr>
                            
                            <td colspan="2">Larry the Bird</td>
                            <td>@twitter</td>
                          </tr>
                        </tbody>
                      </table>
    </div>
    `;
    const main = document.querySelector(`.p-2[data-value="${codigo}"] .card-body`);
    main.innerHTML = contenido;
    idformulario = document.getElementById(formulario);
    idnuevo = document.getElementById(nuevo);
    idcollapse = document.getElementById(collapse);
    idcontenidoTabla = document.getElementById(contenidoTabla);
    eventosIniciales();
    selectCargos('SelectCargosCON', 'filtrocargosCON');
    selectMetodopago('SelectModopagoCON');
    selectTipoContrato('SelectTipocontratoCON');
    listaTrabajadoresDisponibles();
    registro();
    funGeneral.filtrarTabla('filtrartablaConT', 'opcionesCONT', 0);
    funGeneral.obtenerFechaActual('fechaActualCON');
    listarDatos();
}