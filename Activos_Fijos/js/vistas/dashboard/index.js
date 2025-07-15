import { crearElemento } from "../../funciones/Funciones.js";
import { ImplementarScanner, Scanner } from "../../funciones/Scanner.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { cargarFormulario } from "../../targetas/cargarFormularios.js";
import { crearTargetas } from "../../targetas/cargartemplate.js";
import { Bar } from "./Funcionalidades/Bar.js";
import { Notificaciones } from "./Funcionalidades/Notificaciones.js";
import { Pie } from "./Funcionalidades/Pie.js";

export const  cargarCharts = async (permisos = {}) => {
    if (!permisos.hasOwnProperty('dashboard')) {
        return;
    }

    const dashboard = document.createElement("div");
    dashboard.setAttribute("class", "card  m-2 p-2");
    dashboard.setAttribute("style", "min-height: calc(100vh - 56px); border: none; background: linear-gradient(135deg, #699598, #E7F1FD);");
    dashboard.setAttribute("id", "dashboard-af");

    let columnas = "col-lg-12";
    if (permisos.hasOwnProperty('dashvalornetoaf') && permisos.hasOwnProperty('dashvalorgestionaf')){
        columnas = "";
    }

    let graficos = "";
    if (permisos.hasOwnProperty('dashvalornetoaf')) {
        graficos += `<div class="${columnas ? columnas: "col-lg-5"}">
            <div class="card shadow-sm mb-4">
                <div class="card-header py-2">
                    <h6 class="m-0 fw-bold text-info-emphasis py-1">Valor Neto Inversiones Bienes (Activo Fijo)</h6>
                </div>
                <div class="p-2 d-flex justify-content-center align-items-center" style="overflow: hidden; height: 350px;">
                    <canvas id="chart-categorias"  ></canvas>
                </div>
            </div>
        </div>`;
    }
    if (permisos.hasOwnProperty('dashvalorgestionaf')) {
        graficos += `<div class="${columnas ? columnas : "col-lg-7"}">
            <div class="card shadow-sm mb-4">
                <div class="card-header py-2">
                    <h6 class="m-0 fw-bold text-info-emphasis py-1">Valor Bienes (Activo Fijo) Adquirido en la Gestión</h6>
                </div>
                <div class="p-2 d-flex justify-content-center align-items-center" style="overflow: hidden; height: 350px;">
                        <canvas id="chart-bienes" ></canvas>
                </div>
            </div>
        </div>`
    }
    dashboard.innerHTML = `
    <nav class="navbar navbar-expand bg-body-tertiary py-1 rounded mb-4">
        <div class="container-fluid">
            <a class="navbar-brand text-primary-emphasis" >Dashboard</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto"> </ul>
            </div>
        </div>
    </nav>

    <div id="contenedor-escaner"></div>

    <div class="container-fluid p-0">

        <!-- <h2 class="text-center p-3">Dashboard</h2> -->

        <div class="row">
            ${graficos}            
        </div>
    </div>`;

    const test = dashboard.querySelector("#navbarNav");
    const aa = Notificaciones(permisos, dashboard);
    
    const icono = crearElemento("i", {class: "bi bi-webcam-fill me-2"});
    const scanner = crearElemento("button", {class: "btn btn-dark btn-sm me-2 rounded-4"}, [icono, "Escáner"]);
    test.append(scanner, " ", aa);
    
    
    
    const panelprincipal = document.getElementById("app");
    panelprincipal.insertAdjacentElement("afterend", dashboard);
    

    const modalScanner = Scanner();
    const modalBodyScanner = modalScanner.querySelector("#modalBodyScanner");
    const contenedorScanner = dashboard.querySelector("#contenedor-escaner");
    contenedorScanner.append(modalScanner);
    ImplementarScanner(modalBodyScanner, "pantalla-escaner-info", datosActivoFijo(), "informacion");
    scanner.addEventListener("click", async (e) => {
        e.preventDefault();
        const modal = new bootstrap.Modal(modalScanner);
        modal.show();
        
    });

    if (permisos.hasOwnProperty('dashvalornetoaf')){
        const categorias = await obtenerDatos("./api/dashboard/categorias");
        Pie("chart-categorias",categorias);
    }
    if (permisos.hasOwnProperty('dashvalorgestionaf')) {
        const gestion = await obtenerDatos("./api/dashboard/adquirido-gestion");        
        Bar("chart-bienes", gestion);
    }

    
    // const contenedor = dashboard.querySelector("#notification-container");

    // const btnNotificacion = dashboard.querySelector("a[data-dropdown='notificationMenu']");
    // btnNotificacion.addEventListener("click", (e) => {
    //     e.preventDefault();

    //     const dropdown = contenedor.querySelector(".dropdown");
    //     const ancho = contenedor.clientWidth;

    //     dropdown.style.right = ancho/2 + "px";

    //     if (contenedor.classList.contains('expanded')) {
    //         contenedor.classList.toggle('expanded');
            
    //     } else if (!contenedor.classList.contains('expanded')) {
    //         contenedor.classList.toggle('expanded');
    //     }

    //     // setTimeout(() => {
    //     //     if (contenedor.classList.contains('expanded')) {
    //     //         contenedor.classList.toggle('expanded');
                
    //     //     }
    //     // }, 10000);
    // });

    // const solicutudesPend = dashboard.querySelector("#solicitudes_pendientes");
    // if (solicutudesPend) {
    //     solicutudesPend.addEventListener("click", () => {
    //         if (permisos.hasOwnProperty('solicitudespendientes')) {
    //             const formulario = cargarFormulario("solicitudespendientes", permisos.solicitudespendientes);
    //             if(formulario) {
    //                 crearTargetas(formulario, "Pendientes", "solicitudespendientes");
    //             }
    //             if (contenedor.classList.contains('expanded')) {
    //                 contenedor.classList.toggle('expanded');
                    
    //             }
    //         }
    //     })
    // }

}

const datosActivoFijo = () => {
    return async (qrCodeAFCode, camposInformacion) => {
        const {
            nombre,
            codigo,
            descripcion,
            area,
            resopnsable,
            contenedor,
            alerta
        } = camposInformacion;

        const activoDeIntentario = await obtenerDatos(`./api/inventarios/activo-fijo/qr/${qrCodeAFCode}`);
        if (activoDeIntentario && activoDeIntentario.data) {
            contenedor.classList.remove("d-none");
            alerta.innerHTML = "";
            const activoFijo = activoDeIntentario.data;
            nombre.innerHTML = activoFijo.nombre ? activoFijo.nombre : "-";
            codigo.innerHTML = activoFijo.codigo ? activoFijo.codigo : "-";
            descripcion.innerHTML = activoFijo.detalle ? activoFijo.detalle : "-";
            area.innerHTML = activoFijo.nombrearea ? activoFijo.nombrearea : "-";
            resopnsable.innerHTML = activoFijo.nombretrabajador ? activoFijo.nombretrabajador : "-";
        } else {
            contenedor.classList.add("d-none");
            alerta.innerHTML = "No se encontro el activo fijo";
        }
    }
}