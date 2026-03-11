import { CT_URLAPI, getEmpresaId, getUsuarioId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, PermisoBtnMenuBotones } from "../../funciones/Funciones.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
import { cargarFormulario } from "../../targetas/cargarFormularios.js";
import { crearTargetas } from "../../targetas/cargartemplate.js";

let contador = 0;
let objNotificaciones = {};
let errorNotf = false;
const codigos = [
    "solicitud_desconsolidar_tr",
    "solicitud_insertar_tr",
    "solicitud_ac_an_el_tr",
    "transacciones_externas",
];

export const Notificaciones = (permisos) => {
    const URL = CT_URLAPI;
    const empresa_id = getEmpresaId();

    const iconoN = crearElemento("i", {class: "bi bi-bell-fill px-1"});
    const contadorAlerta = crearElemento("span", {class: "position-absolute top-0 translate-middle badge rounded-pill bg-danger", style: "rigth: 0;"});
    contadorAlerta.textContent = 0;
    const botonNotificaciones = crearElemento("a", {class: "btn btn-warning position-fixed rounded-start-pill px-2 py-1 text-dark d-none", "data-dropdown": "notificationMenu", title: "notificaciones", style: "z-index: 5; top: 45px; right: 5px; font-size: 0.85rem; background-color: var(--bs-warning)"}, [iconoN, contadorAlerta]);

    const contenedorNotificaciones = crearElemento("div", {id: "notification-container", class: "dropdown-container"});

    const actualizarNotificaciones = async () => {
        try {
            contador = 0;
            const endpoints = [
                `${URL}alerta_desconsolidacion/${empresa_id}`,
                `${URL}alerta_transaccionEn_espera/${empresa_id}`,
                `${URL}alerta_anular_eliminar_transaccion/${empresa_id}`,
                `${URL}alerta_transacciones_comercial/${empresa_id}`,
            ];
            const nombreMenu = [
                "desconsolidacion",
                "insertartrans",
                "activaranulareliminar",
                "transaccionesexternas",
            ]

            // Ejecutar todas las solicitudes con allSettled
            const resultados = await Promise.allSettled(endpoints.map((url, index) => {
                if (PermisoBtnMenuBotones("autorizaciones", nombreMenu[index])) {
                    return obtenerDatos(url);
                }
                return [];
            }));

            // Filtrar solo las promesas resueltas y manejar errores individualmente
            resultados.forEach((resultado, index) => {
                if (resultado.status === "fulfilled") {
                    objNotificaciones[codigos[index]] = resultado.value[0]?.cantidad ? resultado.value[0] : { cantidad: 0 };
                } else {
                    console.error(`Error en ${endpoints[index]}`);
                    objNotificaciones[codigos[index]] = { cantidad: 0 }; // Evita valores indefinidos
                    errorNotf = true;
                }
            });

            // Calcular el contador total
            contador = resultados.reduce((total, res) =>
                total + (res.status === "fulfilled" && res.value[0]?.cantidad ? Number(res.value[0].cantidad) : 0),
            0);

            // Actualizar el DOM según el contador
            if (contador > 0) {
                contadorAlerta.textContent = contador;
                botonNotificaciones.classList.remove("d-none");
            } else {
                contadorAlerta.textContent = "";
                botonNotificaciones.classList.add("d-none");
            }

        } catch (error) {
            console.error("Error general");
            errorNotf = null;
            return;
        }

        setTimeout(actualizarNotificaciones, 30000); // 60000 ms = 1 minuto
    };
    actualizarNotificaciones();

    const handleOutsideClick = (event) => {
        if (!botonNotificaciones.contains(event.target) && !contenedorNotificaciones.contains(event.target)) {
            contenedorNotificaciones.classList.remove("expanded");
            document.removeEventListener("click", handleOutsideClick);
        }
    };

    botonNotificaciones.addEventListener("click", async (e) => {
        e.preventDefault();
        if (errorNotf === null) {
            botonNotificaciones.style.backgroundColor = "red";
            return;
        }

        if (contenedorNotificaciones.classList.contains("expanded")) {
            contenedorNotificaciones.classList.remove("expanded");
            document.removeEventListener("click", handleOutsideClick);
            return;
        }
        botonNotificaciones.classList.add("disabled");
        contenedorNotificaciones.innerHTML = "";
        await olNotificaciones(contenedorNotificaciones, permisos, contadorAlerta, botonNotificaciones);
        // const dropdown = contenedorNotificaciones.querySelector(".dropdown");
        contenedorNotificaciones.classList.toggle("expanded");
        botonNotificaciones.classList.remove("disabled");

        setTimeout(() => document.addEventListener("click", handleOutsideClick), 0);
    });

    const html = document.createDocumentFragment();
    html.append(botonNotificaciones, contenedorNotificaciones)

    // return html;
    const body = document.querySelector("body");
    body.appendChild(html);
}

const esperarElemento = (contenedor, campo, callback) => {
    const observer = new MutationObserver((mutationsList, observer) => {
        const elemento = contenedor.querySelector(campo);
        if (elemento) {
            callback(elemento); // Ejecutamos la función cuando encontramos el elemento
            observer.disconnect(); // Detenemos la observación
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

const olNotificaciones = async (contenedor, permisos, contadorAlerta, botonNotificaciones) => {
    const usuarioId = getUsuarioId();
    const items = []
    const clickBtn = (btnTransExt) => btnTransExt.click();

    const solicitudDesconsolidarTr = objNotificaciones["solicitud_desconsolidar_tr"];
    const canitdadSolDescTr = solicitudDesconsolidarTr?.cantidad ? Number(solicitudDesconsolidarTr.cantidad) : 0;
    if (canitdadSolDescTr) {
        const IngresarSubView = (data_id) => {
            const contenedor = document.querySelector(`.p-2[data-value=${data_id}] .card-body #contenedor-cabecera`);
            const btnTransExt = contenedor.querySelector(`button[data-id="desconsolidacion"]`);
            if (btnTransExt) {
                clickBtn(btnTransExt);
                return;
            }
            esperarElemento(contenedor, `[data-id="desconsolidacion"]`, clickBtn);
        }
        const item = itemNotificacion("Solicitudes de Desconsolidación", "Solicitudes de desconsolidación pendientes", canitdadSolDescTr);
        eventoItem({item, contenedor, permisos, titulo: "Autorizaciones", codigo: "autorizaciones", usuarioId}, IngresarSubView);
        items.push(item);
    }
    const solicitudInsertarTr = objNotificaciones["solicitud_insertar_tr"];
    const canitdadSolInTr = solicitudInsertarTr?.cantidad ? Number(solicitudInsertarTr.cantidad) : 0;
    if (canitdadSolInTr) {
        const IngresarSubView = (data_id) => {
            const contenedor = document.querySelector(`.p-2[data-value=${data_id}] .card-body #contenedor-cabecera`);
            const btnTransExt = contenedor.querySelector(`button[data-id="insertartrans"]`);
            if (btnTransExt) {
                clickBtn(btnTransExt);
                return;
            }
            esperarElemento(contenedor, `[data-id="insertartrans"]`, clickBtn);
        }
        const item = itemNotificacion("Solicitudes Insertar Trans.", "Solicitudes para insertar transacción pendientes", canitdadSolInTr);
        eventoItem({item, contenedor, permisos, titulo: "Autorizaciones", codigo: "autorizaciones", usuarioId}, IngresarSubView);
        items.push(item);
    }
    const solicitudAAETr = objNotificaciones["solicitud_ac_an_el_tr"];
    const canitdadSolAAETr = solicitudAAETr?.cantidad ? Number(solicitudAAETr.cantidad) : 0;
    if (canitdadSolAAETr) {
        const IngresarSubView = (data_id) => {
            const contenedor = document.querySelector(`.p-2[data-value=${data_id}] .card-body #contenedor-cabecera`);
            const btnTransExt = contenedor.querySelector(`button[data-id="activaranulareliminar"]`);
            if (btnTransExt) {
                clickBtn(btnTransExt);
                return;
            }
            esperarElemento(contenedor, `[data-id="activaranulareliminar"]`, clickBtn);
        }
        const item = itemNotificacion("Solicitudes Activar/Anular/Eliminar Trans.", "Solicitudes pendientes", canitdadSolAAETr);
        eventoItem({item, contenedor, permisos, titulo: "Autorizaciones", codigo: "autorizaciones", usuarioId}, IngresarSubView);
        items.push(item);
    }
    const transaccionesexternas = objNotificaciones["transacciones_externas"];
    const canitdadTrsExt = transaccionesexternas?.cantidad ? Number(transaccionesexternas.cantidad) : 0;
    if (canitdadTrsExt) {
        const IngresarSubView = (data_id) => {
            const contenedor = document.querySelector(`.p-2[data-value=${data_id}] .card-body #contenedor-cabecera`);
            const btnTransExt = contenedor.querySelector(`button[data-id="transaccionesexternas"]`);
            if (btnTransExt) {
                clickBtn(btnTransExt);
                return;
            }
            esperarElemento(contenedor, `[data-id="transaccionesexternas"]`, clickBtn);
        }
        const item = itemNotificacion("Transacciones Externas", "Tranmsacciones pendientes", canitdadTrsExt);
        eventoItem({item, contenedor, permisos, titulo: "Autorizaciones", codigo: "autorizaciones", usuarioId}, IngresarSubView);
        items.push(item);
    }


    let contenedorOl = "";
    if (contador === 0) {
        const item = itemNotificacion();
        contenedorOl = crearElemento("ol", {class: `list-group dropdown ${errorNotf === true ? "error" : "void"} rounded-1 lista_not`, name: "notificationMenu"}, [item]);
    } else {
        contadorAlerta.textContent = contador;
        contenedorOl = crearElemento("ol", {class: `list-group list-group-numbered dropdown ${errorNotf === true ? "error" : ""} rounded-1 lista_not`, name: "notificationMenu"}, items);
    }
    const rect = botonNotificaciones.getBoundingClientRect();
    contenedorOl.style.position = "fixed";
    contenedorOl.style.top = `${rect.bottom + 5}px`;
    contenedorOl.style.right = `5px`;
    contenedorOl.style.zIndex = 5
    contenedor.replaceChildren(contenedorOl);
}

const itemNotificacion = (nombre, detalle, cantidad) => {
    if (!nombre) {
        const item = crearElemento("li", {class: "list-group-item notif-list-item d-flex justify-content-between align-items-start rounded-0"}, ["Sin Notificaciones"]);
        return item;
    }
    const titulo = crearElemento("div", {class: "fw-bold"}, [ nombre.toUpperCase() ]);
    const contenedor = crearElemento("div", {class: "ms-2 me-auto"}, [titulo, detalle]);
    const cantidadElemento = crearElemento("span", {class: "badge text-bg-warning rounded-pill", style: "font-size:10px"}, [cantidad]);
    const item = crearElemento("li", {class: "list-group-item notif-list-item d-flex justify-content-between align-items-start rounded-0 border-bottom"}, [contenedor, cantidadElemento]);
    return item;
}

const eventoItem = ({item, contenedor, permisos, titulo, codigo, usuarioId}, accion = null) => {
    item.addEventListener("click", () => {
        if (permisos.hasOwnProperty(codigo)) {
            const formulario = cargarFormulario(`${codigo}-${usuarioId}`, permisos[codigo]);
            if(formulario) {
                crearTargetas(formulario, titulo, `${codigo}-${usuarioId}`);
                if (accion) accion(`${codigo}-${usuarioId}`);
            }
            if (contenedor.classList.contains("expanded")) {
                contenedor.classList.toggle("expanded");
            }
        }
    });
}