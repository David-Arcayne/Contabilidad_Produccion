// Importar la función 'crearTargetas' desde un archivo específico
import { crearTargetas } from "../targetas/cargartemplate.js";

// Función para crear el menú principal
export function menuPrincipal() {
    const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'));
    // Obtener el elemento iframe del documento
    const iframe = document.querySelector('#iframetemeplate');

    // Crear un fragmento para acumular los cambios
    const fragment = document.createDocumentFragment();

    // Obtener el contenido de la plantilla para la barra inferior del iframe
    const templateContent = iframe.contentDocument.getElementById('barra-inferior').content;

    // Clonar el contenido de la plantilla
    const clonMenu = document.importNode(templateContent, true);
    clonMenu.querySelector('#closeBtn').addEventListener('click', function () {
        eliminarMenu();
    });
    clonMenu.querySelector('.flex-grow-1.ml-2.usuario.text-center.text-white').childNodes[0].nodeValue = contenidousuario[0].nombre;
    clonMenu.querySelector('.d-block.cargo').textContent = contenidousuario[0].cargo;
    fragment.appendChild(clonMenu);

    // Obtener el panel principal y agregar el fragmento
    const panelprincipal = document.getElementById("app");
    panelprincipal.appendChild(fragment);

    // Cargar las opciones del menú
    cargarOpcionesMenu();
}

// Función para cargar las opciones del menú
function cargarOpcionesMenu() {
    // Obtener el contenido del menú del localStorage
    const contenidomenu = JSON.parse(localStorage.getItem('yofinancieromenu'));
    console.log(contenidomenu)

    // Obtener el elemento iframe del documento
    const iframe = document.querySelector('#iframetemeplate');

    // Crear un fragmento para acumular los cambios
    const fragment = document.createDocumentFragment();

    // Obtener las plantillas de opciones y submenús del iframe
    const plantillaOpciones = iframe.contentDocument.getElementById('nombre-opcion').content;
    const plantillaSubmenu = iframe.contentDocument.getElementById('opcion').content;

    // Obtener el menú
    const menu = document.querySelector('.menu');
    let contador = 0;
    // Mapear cada elemento del menú
    contenidomenu[0].menu.map(key => {
        contador++;
        let heading = "heading" + contador;
        let collapse = "collapse" + contador;
        // Clonar la plantilla de opciones
        const nuevaOpcion = plantillaOpciones.cloneNode(true);

        // Agregar el título a la opción
        nuevaOpcion.querySelector('.accordion-button.collapsed').textContent = key.titulo;
        nuevaOpcion.querySelector('.accordion-header').id = heading;
        nuevaOpcion.querySelector('.accordion-collapse.collapse').setAttribute('aria-labelledby', heading);
        nuevaOpcion.querySelector('.accordion-collapse.collapse').id = collapse;
        nuevaOpcion.querySelector('.accordion-button.collapsed').dataset.bsTarget = '#' + collapse;
        nuevaOpcion.querySelector('.accordion-button.collapsed').setAttribute('aria-controls', collapse);

        // Obtener el contenedor del submenú
        const contsub = nuevaOpcion.querySelector('.list-group');

        // Mapear cada submenú del menú
        key.submenu.map(submenu => {
            // Clonar la plantilla de submenú
            const nuevoSubmenu = plantillaSubmenu.cloneNode(true);

            // Agregar el título y el código al submenú
            nuevoSubmenu.querySelector('.list-group-item.list-group-item-action').textContent = submenu.titulo;
            nuevoSubmenu.querySelector('.list-group-item.list-group-item-action').setAttribute('data-value', submenu.codigo);
            nuevoSubmenu.querySelector('.list-group-item.list-group-item-action').dataset.id = submenu.codigo + "_" + submenu.permiso;

            nuevoSubmenu.querySelector('.list-group-item.list-group-item-action').setAttribute('data-bs-dismiss', 'offcanvas');
            nuevoSubmenu.querySelector('.list-group-item.list-group-item-action').setAttribute('aria-label', 'Close');

            // Agregar el submenú al contenedor
            contsub.appendChild(nuevoSubmenu);
        });

        // Agregar la opción al fragmento
        fragment.appendChild(nuevaOpcion);
    });

    // Agregar el fragmento al menú
    menu.appendChild(fragment);

    // Cargar las tarjetas
    cargarTargetas();
}

//funcion para eliminar el json del menu al volver al panel
function eliminarMenu() {
    localStorage.removeItem("yofinancieromenu");
}

// Función para cargar las tarjetas
function cargarTargetas() {
    // Obtener todos los contenedores de botones
    const buttonContainer = document.querySelectorAll('.list-group-item.list-group-item-action');

    // Añadir un evento de clic a cada botón
    buttonContainer.forEach(function (boton) {
        boton.addEventListener('click', function () {
            // Obtener los datos del botón
            const boton = this.dataset.id.split('_');
            const dato = this.textContent;
            const codigo = boton[0];
            const permisos = boton[1];
            //console.log(codigo, permisos);

            // Llamar a la función 'crearTargetas' con los datos obtenidos
            crearTargetas(dato, codigo, permisos);
        });
    });
}
