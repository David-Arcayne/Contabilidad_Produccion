// Importar la función 'crearTargetas' desde un archivo específico
import { cargarFormulario } from "../targetas/cargarFormularios.js";
import { crearTargetas } from "../targetas/cargartemplate.js";
import { cargarCharts } from "../vistas/dashboard/index.js";

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
    clonMenu.querySelector('#closeBtn').addEventListener('click', function() {
        localStorage.removeItem("yofinancieromenu");
      });
    clonMenu.querySelector('.flex-grow-1.ml-2.usuario.text-center.text-white').childNodes[0].nodeValue = contenidousuario[0].nombre;
    clonMenu.querySelector('.d-block.cargo').textContent = contenidousuario[0].cargo;
    fragment.appendChild(clonMenu);

    // Obtener el panel principal y agregar el fragmento
    const panelprincipal = document.getElementById("app");
    panelprincipal.appendChild(fragment);

    sesionAPI(contenidousuario);
    
}

// Función para almacenar el "idusuario" e "idempresa" en la sesión de la API
function sesionAPI(contenidousuario) {
    const body = new FormData();
    body.append("af_idusuario", contenidousuario[0].idusuario);
    body.append("af_idempresa", contenidousuario[0].empresa.idempresa);
    body.append("af_datosempresa", JSON.stringify(contenidousuario[0].empresa));
    body.append("af_datosyofinanciero", JSON.stringify(contenidousuario[0]));
    fetch("./api/iniciar-sesion", {
        method:"POST",
        body,
    })
    .then(res => res.json())
    .then(res =>{ 
        // Cargar las opciones del menú
        cargarOpcionesMenu();
    })
    .catch(error => {
        console.log("Ocurrio un error")
        console.log(error);
    })
}

// Función para cargar las opciones del menú
function cargarOpcionesMenu() {
    // Obtener el contenido del menú del localStorage
    const contenidomenu = JSON.parse(localStorage.getItem('yofinancieromenu'));

    const menuDiv = document.querySelector('.menu');

    const menuId = "sidebar-nav";
    const menu = document.createElement("ul");
    menu.setAttribute("class", menuId);
    menu.setAttribute("id", menuId);

    menuDiv.replaceChildren(menu);

    const permisos = {};

    
    
    // Mapear cada elemento del menú
    contenidomenu[0].menu.map((key, index) => {

        const itemId = `menu${index}-nav`;
        const idCarga = `link${index}-li`;

        if (key.permiso && (key.permiso === "0000" || key.permiso[0] === "0" || key.permiso.length != 4)) {
            return;
        }
        if (key.submenu) {
            const item = document.createElement("li");
            item.setAttribute("class", "nav-item");
            // item.setAttribute("id", "heading"); // use
            const a = document.createElement("a");
            a.setAttribute("class", "nav-link collapse collapsed");
            a.setAttribute("data-bs-target", `#${itemId}`)  // id-1
            a.setAttribute("data-bs-toggle", "collapse");
            // a.setAttribute("id", "heading"); // use
            const icono = document.createElement("i");
            icono.setAttribute("class", "bi bi-record2-fill");
            const titulo = document.createElement("span");
            titulo.textContent = key.titulo
            const i = document.createElement("i");
            i.setAttribute("class", "bi bi-chevron-down ms-auto")
            a.append(icono, titulo, i);
            item.appendChild(a);


            // submenu
            const submenuUl = document.createElement("ul");
            submenuUl.setAttribute("id", itemId); // id-1
            submenuUl.setAttribute("class", "nav-content collapse");
            submenuUl.setAttribute("data-bs-parent", `#${menuId}`);

            item.appendChild(submenuUl);
            menu.appendChild(item);
            key.submenu.map(submenu => {    
                if (submenu.permiso === "0000" || submenu.permiso[0] === "0" || submenu.permiso.length != 4) {
                    return;
                }
                permisos[submenu.codigo.split("-")[0]] = submenu.permiso;

                const subItem = document.createElement("li");
                const subA = document.createElement("a");
                subA.setAttribute("data-id", submenu.codigo+"_"+submenu.permiso)
                // subA.setAttribute("data-value", submenu.codigo)
                cargarTargetas(subA, submenu.permiso);
                const subI = document.createElement("i");
                subI.setAttribute("class", "bi bi-circle");
                const subTitle = document.createElement("span");
                subTitle.textContent =  submenu.titulo;
                subA.append(subI, subTitle);
                subItem.append(subA);

                submenuUl.appendChild(subItem);
                if (submenu.codigo.split("-")[0] === "dashboard") {
                    submenuUl.parentNode.remove();
                }
            });
            if (!submenuUl.hasChildNodes()) {
                submenuUl.parentNode.remove();
            }

        } else {
            const item = document.createElement("li");
            item.setAttribute("class", "nav-item");
            // item.setAttribute("id", heading); // use
            const a = document.createElement("a");
            a.setAttribute("class", "nav-link collapsed");
            a.setAttribute("data-id", key.codigo+"_"+key.permiso)
            // a.setAttribute("data-value", key.codigo)
            // a.setAttribute("id", heading); // use
            cargarTargetas(a, key.permiso);
            const icono = document.createElement("i");
            icono.setAttribute("class", "bi bi-record2-fill")
            const titulo = document.createElement("span");
            titulo.textContent = key.titulo
            a.append(icono, titulo);
            item.appendChild(a);

            menu.appendChild(item);
        }
    });

    // Genera el dashboard en la vista principal
    cargarCharts(permisos);
}

function cargarTargetas(boton, permisos){
    boton.addEventListener('click', function () {
        const dash = document.querySelector("#dashboard-af");
        // Obtener los datos del botón
        const boton = this.dataset.id.split('_'); 
        const dato = this.textContent;
        const codigo = boton[0];
        // const permisos = boton[1];

        // Llamar a la función 'crearTargetas' con los datos obtenidos
        const formulario = cargarFormulario(codigo, permisos);
        if(formulario) {
            dash?.classList.remove("d-block");
            dash?.classList.add("d-none");
            crearTargetas(formulario, dato, codigo);
        }
    });

    const offcanvasElement = document.getElementById('offcanvasExample');
    boton.addEventListener('click', () =>  {
        const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
        const windowWidth = window.innerWidth;
        // if (offcanvasElement.classList.contains('show') && windowWidth < 768) {
        if (offcanvasElement.classList.contains('show')) {
            offcanvasInstance.hide();
        }
        // offcanvasInstance.show();
    });
}
