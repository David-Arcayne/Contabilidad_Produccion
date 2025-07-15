import { crearElemento } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { cargarFormulario } from "../../../targetas/cargarFormularios.js";
import { crearTargetas } from "../../../targetas/cargartemplate.js";

let dashboardRef;

export const Notificaciones = (permisos, dashboard) => {
    dashboardRef = dashboard;
     const iconoN = crearElemento("i", {class: "bi bi-bell-fill"});
    const contadorAlerta = crearElemento("span", {class: "position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"});
    // contadorAlerta.textContent = 0;
    const botonNotificaciones = crearElemento("a", {class: "btn btn-primary position-relative rounded-circle px-2 py-1", "data-dropdown": "notificationMenu", title: "notificaciones"}, [iconoN, contadorAlerta]);

    const contenedorNotificaciones = crearElemento("div", {id: "notification-container", class: "dropdown-container"});
    olNotificaciones(contenedorNotificaciones, permisos, contadorAlerta);

    botonNotificaciones.addEventListener("click", async (e) => {
        e.preventDefault();
        // const dropdown = contenedorNotificaciones.querySelector(".dropdown");
        // const ancho = contenedorNotificaciones.clientWidth;
        // dropdown.style.right = ancho/2 + "px";
        
        if (contenedorNotificaciones.classList.contains('expanded')) {
            contenedorNotificaciones.classList.toggle('expanded');
            
        } else if (!contenedorNotificaciones.classList.contains('expanded')) {
            botonNotificaciones.classList.add("disabled");
            contenedorNotificaciones.innerHTML = "";
            await olNotificaciones(contenedorNotificaciones, permisos, contadorAlerta);
            const dropdown = contenedorNotificaciones.querySelector(".dropdown");
            const ancho = contenedorNotificaciones.clientWidth;
            dropdown.style.right = ancho/2 + "px";
            contenedorNotificaciones.classList.toggle('expanded');
            botonNotificaciones.classList.remove("disabled");
        }

        // setTimeout(() => {
        //     if (contenedorNotificaciones.classList.contains('expanded')) {
        //         contenedorNotificaciones.classList.toggle('expanded');
                
        //     }
        // }, 10000);
    });

    const html = document.createDocumentFragment();
    html.append(botonNotificaciones, contenedorNotificaciones)

    return html;
}

const olNotificaciones = async (contenedor, permisos, contadorAlerta) => {
    const usuarioId = JSON.parse(localStorage.getItem("yofinanciero"))[0].idusuario;
    
    const items = []
    let contador = 0;

    const movimientosPendientes = await obtenerDatos("./api/solicitud-af-pendiente/menu-notificacion/datos");
    if (movimientosPendientes && movimientosPendientes.rows > 0) {
        const item = itemNotificacion("Movimientos", "Solicitudes pendientes.", movimientosPendientes.rows);
        eventoItem({item, contenedor, permisos, titulo: "Pendientes", codigo: "solicitudespendientes", usuarioId});
        
        items.push(item);
        contador ++;
    }

    const movimientoAdministrador = await obtenerDatos("./api/movimientos-admin/menu-notificacion/datos");
    if (movimientoAdministrador.data && movimientoAdministrador.data.cantidad > 0) {
        const item = itemNotificacion("Movimientos (Reasignación)", "Sugerencia de movimientos.", movimientoAdministrador.data.cantidad);
        eventoItem({item, contenedor, permisos, titulo: "Reasignación", codigo: "reasignacion", usuarioId});
        
        items.push(item);
        contador ++;
    }
    
    const segurosExpirados = await obtenerDatos("./api/seguros/menu-notificacion/expirados");
    if (segurosExpirados && segurosExpirados.rows > 0) {
        const item = itemNotificacion("Seguros", "Seguros caducados o por caducar.", segurosExpirados.rows);
        eventoItem({item, contenedor, permisos, titulo: "Póliza", codigo: "poliza", usuarioId});
        
        items.push(item);
        contador ++;
    }
    
    const observacionesBajas = await obtenerDatos(`./api/inventarios-activofijo/menu-notificacion/bajas`);
    if (observacionesBajas && observacionesBajas.rows > 0) {
        const item = itemNotificacion("Bajas", "Sugerencias de Bajas.", observacionesBajas.rows);
        eventoItem({item, contenedor, permisos, titulo: "Bajas", codigo: "afbajas", usuarioId});
        
        items.push(item);
        contador ++;
    }

    const obsAlertaSituacion = await obtenerDatos(`./api/inventarios-activofijo/menu-notificacion/situacion`);
    const obsAlertaConcluidos = await obtenerDatos(`./api/historial/menu-notificacion/concluidos`);
    if ((obsAlertaSituacion && obsAlertaSituacion.rows > 0) && (obsAlertaConcluidos && obsAlertaConcluidos.rows > 0 )) {
        const cantidad =  parseInt(obsAlertaSituacion.data?.cantidad) + parseInt(obsAlertaConcluidos.data?.cantidad);
        if (cantidad > 0) {
            const item = itemNotificacion("Situación", "Sugerencias | salida", cantidad);
            eventoItem({item, contenedor, permisos, titulo: "Registro situacón", codigo: "registrosituacion", usuarioId});
            
            items.push(item);
            contador ++;
        }
    }
    // contador = 0;
    if (contador === 0) {
        const item = itemNotificacion();
        const notificaciones = crearElemento("ol", {class: "list-group dropdown void", name: "notificationMenu"}, [item]);
        contenedor.appendChild(notificaciones);
    } else {
        contadorAlerta.textContent = contador;
        const notificaciones = crearElemento("ol", {class: "list-group list-group-numbered dropdown", name: "notificationMenu"}, items);
        contenedor.appendChild(notificaciones);
    }
}

const itemNotificacion = (nombre, detalle, cantidad) => {

    if (!nombre) {
        const item = crearElemento("li", {class: "list-group-item d-flex justify-content-between align-items-start rounded-0"}, ["Sin Notificaciones"]);
        return item;
    }

    const titulo = crearElemento("div", {class: "fw-bold"}, [ nombre.toUpperCase() ]);
    const contenedor = crearElemento("div", {class: "ms-2 me-auto"}, [titulo, detalle]);
    const cantidadElemento = crearElemento("span", {class: "badge text-bg-warning rounded-pill", style: "font-size:10px"}, [cantidad]);
    const item = crearElemento("li", {class: "list-group-item d-flex justify-content-between align-items-start rounded-0"}, [contenedor, cantidadElemento]);

    return item;
}

const eventoItem = ({item, contenedor, permisos, titulo, codigo, usuarioId}) => {
    item.addEventListener("click", () => {
        if (permisos.hasOwnProperty(codigo)) {
            const formulario = cargarFormulario(`${codigo}-${usuarioId}`, permisos[codigo]);
            if(formulario) {
                crearTargetas(formulario, titulo, `${codigo}-${usuarioId}`);

                dashboardRef?.classList.remove("d-block");
                dashboardRef?.classList.add("d-none");
            }
            if (contenedor.classList.contains('expanded')) {
                contenedor.classList.toggle('expanded');
            }
        }
    });
}