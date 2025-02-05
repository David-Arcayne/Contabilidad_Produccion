import { cargarFormulario } from "./cargarFormularios.js";
import { ocultarElemento, mostrarElemento, cambiarVista } from "../funciones/funcionesCss.js";

const iframe = document.querySelector('#iframetemeplate');
const fragment = document.createDocumentFragment();

export function crearTargetas(dato, codigo, permisos) {
    const contenedorPrincipal = document.querySelector('#main');
    const tarjetasVisibles = document.querySelectorAll('#main > div.p-2.d-block').length;
    //const targeta = document.querySelector(`[data-value="${dato}"].p-2`);
    if (existeCoincidencia(dato, codigo)) {
        return;
    }

    if (tarjetasVisibles == 1) {
        contenedorPrincipal.classList.replace('row-cols-md-1', 'row-cols-md-2');
    }
    else{
        if (tarjetasVisibles == 2) {
            //contenedorPrincipal.classList.replace('row-cols-md-2', 'row-cols-md-1');
            const primeraTarjetaVisible = contenedorPrincipal.querySelector('div.p-2.d-block');
            console.log(primeraTarjetaVisible)
            if (primeraTarjetaVisible) {
                console.log(primeraTarjetaVisible);
                ocultarElemento(primeraTarjetaVisible);
            }
        }
        else {

        }
    }

    const templateContent = iframe.contentDocument.getElementById('targetas').content;
    const clonTargeta = crearNuevaTarjeta(dato, codigo, templateContent);
    fragment.appendChild(clonTargeta);
    //console.log(fragment)
    contenedorPrincipal.appendChild(fragment);
    const menuprimario = "interfazPrimaria"+codigo;
    const menusegundario = "interfazSegundaria"+codigo;
    const refrescar = "refrescar"+codigo;
    crearIconos(dato,codigo);
    const navbarNav = document.querySelector('.navbar-nav.auto-scroll.mx-auto');
    navbarNav.scrollTo({
        left: navbarNav.scrollWidth,
        behavior: 'smooth'
    });
    //agregarElementos(dato, codigo, permisos);
    //crea el contenido de la pagina o el formulario
 
    const code = codigo.split('-');
    cargarFormulario(code[0], codigo, permisos, menuprimario, menusegundario, refrescar);
}

function existeCoincidencia(dato, codigo) {
    const coleccionTargetas = document.querySelectorAll('div.p-2');
    return Array.from(coleccionTargetas).some((elemento) => {
        if (elemento.getAttribute('data-value') == codigo) {
            mostrarTargeta(codigo);
            console.log("Ya existe");
            return true;
        }
        return false;
    });
}

function crearNuevaTarjeta(dato, codigo, templateContent) {
    const clonTargeta = templateContent.cloneNode(true);
    clonTargeta.querySelector('div.p-2').setAttribute('data-value', codigo);
    clonTargeta.querySelector('h6.mb-0').textContent = dato;
    clonTargeta.querySelector('button.minimizar').setAttribute('data-value', codigo);
    clonTargeta.querySelector('button.cerrar').setAttribute('data-value', codigo);
    clonTargeta.querySelector('div.primario').id = "interfazPrimaria"+codigo;
    clonTargeta.querySelector('div.segundario').id = "interfazSegundaria"+codigo;
    clonTargeta.querySelector('button.refrescar').id = "refrescar"+codigo;
    return clonTargeta;
}

function crearIconos(dato, codigo){
    const templateContent = iframe.contentDocument.getElementById('iconos').content;

    const clonIcono = templateContent.cloneNode(true);
    clonIcono.querySelector('li.nav-item').setAttribute('data-value', codigo);
    clonIcono.querySelector('li.nav-item').addEventListener('click', function() {
        mostrarTargeta(codigo);
      });
    clonIcono.querySelector('a.nav-link').setAttribute('data-value', codigo);
    clonIcono.querySelector('a.nav-link').innerHTML = dato + `<button role="button" data-value="${codigo}" class="btn btn-link cerrar"><i class="bi bi-x"></i></button>`;
    fragment.appendChild(clonIcono);

    const menuInferior = document.querySelector(".navbar-nav.mx-auto");
    menuInferior.appendChild(fragment);
    llamarBotonCerrar();
    llamarBotonMinimizar();
}

function llamarBotonCerrar(){
    const buttonCerrar = document.querySelectorAll('button.cerrar');
    
    buttonCerrar.forEach(function (boton) {
        boton.addEventListener('click', function (event) {
            // Evitar que el evento se propague al li
            event.stopPropagation();

            const dato = this.getAttribute('data-value');
            console.log("Cerrar la targeta"+dato);
            cerrarTargeta(dato);
        });
    });
}


function cerrarTargeta(dato) {
    const contenedorPrincipal = document.querySelector('#main');
    const elementosElegidos = document.querySelectorAll(`[data-value="${dato}"].p-2, [data-value="${dato}"].nav-item`);
    
    if (elementosElegidos.length > 0) {
        const tieneClaseDNone = elementosElegidos[0].classList.contains('d-block');
        console.log(tieneClaseDNone)
        elementosElegidos.forEach((elemento) => {
            elemento.remove();
            //eliminarOpcion(dato);
        });

        if (tieneClaseDNone) {
            contenedorPrincipal.classList.replace('row-cols-md-2', 'row-cols-md-1');
        }
    }
}


function llamarBotonMinimizar(){
    const buttonMinimizar = document.querySelectorAll('.minimizar');
    buttonMinimizar.forEach(function (boton) {
        boton.addEventListener('click', function () {
            const dato = this.getAttribute('data-value');
            console.log("Minimizar la targeta"+dato);
            minizarTargeta(dato);
        });
    });
}

function minizarTargeta(dato){
    const contenedorPrincipal = document.querySelector('#main');
    const elementosElegidos = document.querySelectorAll(`[data-value="${dato}"].p-2`);
    if(elementosElegidos){
        contenedorPrincipal.classList.replace('row-cols-md-2', 'row-cols-md-1');
        elementosElegidos.forEach((elemento) => {
            //elemento.style.display = "none";
            /*elemento.classList.remove('d-block');
            elemento.classList.add('d-none');*/
            ocultarElemento(elemento);
        });
    }
}

function mostrarTargeta(dato) {
    const contenedorPrincipal = document.querySelector('#main');
    const targeta = document.querySelector(`[data-value="${dato}"].p-2`);
    const tarjetasVisibles = document.querySelectorAll('#main > div.p-2.d-block').length;
    console.log(tarjetasVisibles);
    if (targeta.classList.contains('d-none')) {
        if (tarjetasVisibles == 1) {
            contenedorPrincipal.classList.replace('row-cols-md-1', 'row-cols-md-2');
            /*targeta.classList.remove('d-none');
            targeta.classList.add('d-block');*/
            mostrarElemento(targeta);
        }
        if (tarjetasVisibles == 2) {
            const primeraTarjetaVisible = contenedorPrincipal.querySelector('div.p-2.d-block');
            if (primeraTarjetaVisible) {
                //contenedorPrincipal.classList.replace('row-cols-md-2', 'row-cols-md-1')
                console.log(primeraTarjetaVisible);
                /*primeraTarjetaVisible.classList.remove('d-block');
                primeraTarjetaVisible.classList.add('d-none');*/
                //ocultarElemento(primeraTarjetaVisible);
                /*targeta.classList.remove('d-none');
                targeta.classList.add('d-block');*/
                //mostrarElemento(targeta);
                cambiarVista(primeraTarjetaVisible, targeta);
            }
        }
        if (tarjetasVisibles == 0){
            /*targeta.classList.remove('d-none');
            targeta.classList.add('d-block');*/
            mostrarElemento(targeta);
        }

    }
}

function agregarElementos(dato, codigo, permisos){
    const localStorageMenuActivo = localStorage.getItem('yofinancieromenuactivo');
    let datosobjeto = [];
    const nuevoElemento = {
        nombre: dato,
        codigo: codigo,
        permisos: permisos
    }

    if (localStorageMenuActivo) {
        datosobjeto = JSON.parse(localStorageMenuActivo);
        datosobjeto.push(nuevoElemento);
        localStorage.setItem('yofinancieromenuactivo', JSON.stringify(datosobjeto));
    } else {
        datosobjeto.push(nuevoElemento);
        localStorage.setItem('yofinancieromenuactivo', JSON.stringify(datosobjeto));
    }
    
}

function eliminarOpcion(codigo) {
    const localStorageMenuActivo = JSON.parse(localStorage.getItem('yofinancieromenuactivo'));
    if (localStorageMenuActivo){
        const nuevoArreglo = localStorageMenuActivo.filter(u => u.codigo !== codigo);
        localStorage.setItem('yofinancieromenuactivo', JSON.stringify(nuevoArreglo));
    }
    if (localStorageMenuActivo.length == 0) {
        localStorage.removeItem("yofinancieromenuactivo");
    }
}