import { CT_URLAPI, getEmpresaId, getSucursalId, getUsuarioId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento, formatoDecimal, obtenerFechaActual } from "../../funciones/Funciones.js";
import { enviarDatosOJson, obtenerDatos } from "../../funciones/Solicitudes.js";
import { cargarFormulario } from "../../targetas/cargarFormularios.js";
import { crearTargetas } from "../../targetas/cargartemplate.js";


export const NavegacionVoz = (permisos) => {
    const empresa_id = getEmpresaId();
    const usuarioId = getUsuarioId();


    // === Elementos visuales ===
    const textoReconocido = crearElemento("span", {
        class: "small text-muted",
        style: "max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.3s ease;"
    });
    textoReconocido.textContent = ""; // vacío al inicio

    const iconoN = crearElemento("i", { class: "bi bi-mic-mute-fill px-1 align-middle" });
    const botonNotificaciones = crearElemento("button", {
        class: "btn border position-fixed rounded-start-pill shadow-sm px-2 py-1",
        title: "Reconocimiento de voz",
        style: "z-index: 5000; top: 80px; right: 5px; font-size: 0.85rem; background-color: white;"
    }, [textoReconocido, iconoN]);

    const contenedorNotificaciones = crearElemento("div", {
        id: "notification-container",
        class: "dropdown-container"
    });

    const html = document.createDocumentFragment();
    html.append(botonNotificaciones, contenedorNotificaciones);
    document.body.appendChild(html);

    // const status = crearElemento("div", { class: "text-muted small mt-1 ms-2" });
    // document.body.appendChild(status);

    // === Verificar soporte ===
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Tu navegador no soporta reconocimiento de voz");
    }

    // === Instancia ===
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    let escuchando = false;
    let enTransaccion = 0;
    let modalTransaccion;

    // === Eventos ===
    recognition.onstart = () => {
        botonNotificaciones.classList.add('active', 'border-primary');
        iconoN.classList.replace('bi-mic-mute-fill', 'bi-mic-fill');
        iconoN.classList.add('text-primary');
        textoReconocido.textContent = "Escuchando...";
        textoReconocido.classList.add('text-primary');
    };

    let miSetTimeout;
    recognition.onend = () => {
        // if (escuchando) {
        //     // status.textContent = "Procesando...";
        //     // textoReconocido.textContent = "Procesando...";
        //     // textoReconocido.classList.remove('text-primary');
        //     // textoReconocido.classList.add('text-warning');
        // } else {
        //     status.textContent = "🎤 Desactivado";
        //     botonNotificaciones.classList.remove('active', 'border-primary');
        //     iconoN.classList.replace('bi-mic-fill', 'bi-mic-mute-fill');
        //     iconoN.classList.remove('text-primary');
        //     textoReconocido.textContent = "";
        // }
        // miSetTimeout && clearTimeout(miSetTimeout);

        // miSetTimeout = setTimeout(() => {
            botonNotificaciones.classList.remove('active', 'border-primary');
            iconoN.classList.replace('bi-mic-fill', 'bi-mic-mute-fill');
            iconoN.classList.remove('text-primary');
            textoReconocido.textContent = "";
        // }, 3000);

        if (enTransaccion === 1) {
            recognition.start();
            escuchando = true;
            enTransaccion = 0;
        }
    };

    recognition.onerror = (event) => {
        console.error("Error:", event.error);
        textoReconocido.textContent = "Error: " + event.error;
        textoReconocido.classList.add('text-danger');
        escuchando = false;
        botonNotificaciones.classList.remove('active');
        iconoN.classList.replace('bi-mic-fill', 'bi-mic-mute-fill');
        iconoN.classList.remove('text-primary');
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();

        console.log("Has dicho:", transcript);
        textoReconocido.textContent = "Has dicho: " + transcript;
        textoReconocido.classList.remove('text-warning');
        textoReconocido.classList.add('text-success');

        enTransaccion = 0;

        // === Comandos ===
        if (transcript.includes("abrir menú")) {
            const menuButton = document.querySelector('a[data-bs-toggle="offcanvas"]');
            menuButton && menuButton.click();
        } else if (transcript.includes("configuración")) {
            const configLink = document.querySelector('button[data-bs-target="#collapse1"]');
            configLink && configLink.click();
        } else if (transcript.includes("administración")) {
            const adminLink = document.querySelector('button[data-bs-target="#collapse2"]');
            adminLink && adminLink.click();
        } else if (transcript.includes("gestión operativa")) {
            const gestionLink = document.querySelector('button[data-bs-target="#collapse3"]');
            gestionLink && gestionLink.click();
        } else if (transcript.includes("reportes")) {
            const reportesLink = document.querySelector('button[data-bs-target="#collapse4"]');
            reportesLink && reportesLink.click();
        } else if (transcript.includes("tipo de cambio")) {

            const tipoCambioLink = document.querySelector('a[data-value="tipodecambio-fc490ca45c00b1249bbe3554a4fdf6fb"]');
            tipoCambioLink && tipoCambioLink.click();
        } else if (transcript.includes("abrir transacción")) {
            const formulario = cargarFormulario(`transacciones-${usuarioId}`, "1111");
            crearTargetas(formulario, "Transacciones", `transacciones-${usuarioId}`);

        } else if (transcript.includes("crear transacción")) {
            if (!modalTransaccion || modalTransaccion[0]?.parentNode === null) {
                modalTransaccion = Modal(recognition, enTransaccion);
                document.body.appendChild(modalTransaccion[0]);
            }



            enTransaccion = 1;

        } else  if (transcript.includes("monto")) {
            const [contenedorModal, cuerpoModal, spanMonto, spanAsientoModelo] = modalTransaccion;
            const montoPalabras = transcript.split("monto")[1].trim();
            const montoNumero = parseFloat(montoPalabras.replace(/[^0-9,.-]/g, '').replace(',', '.'));
            if (!isNaN(montoNumero)) {
                spanMonto.textContent = formatoDecimal(montoNumero);
            } else {
                spanMonto.textContent = "No reconocido";
            }

            enTransaccion = 1;
            // if (spanAsientoModelo.textContent !== "" && (spanAsientoModelo.textContent !== "No reconocido" || spanMonto.textContent !== "")) {
            //     crearTargetas(formulario, titulo, `${codigo}-${usuarioId}`);
            //     contenedorModal.remove();
            //     enTransaccion = 0;
            // }

        } else if (transcript.includes("asiento modelo")) {
            const [contenedorModal, cuerpoModal, spanMonto, spanAsientoModelo] = modalTransaccion;
            const asientoPalabras = transcript.split("asiento modelo")[1].trim();
            spanAsientoModelo.textContent = asientoPalabras || "No reconocido";

            enTransaccion = 1;
            // if (spanMonto.textContent !== "" && (spanMonto.textContent !== "No reconocido" || spanAsientoModelo.textContent !== "")) {
            //     crearTargetas(formulario, titulo, `${codigo}-${usuarioId}`);
            //     contenedorModal.remove();
            //     enTransaccion = 0;
            // }

        } else if (transcript.includes("finalizar transacción")) {
            const [contenedorModal, cuerpoModal, spanMonto, spanAsientoModelo] = modalTransaccion;

            if (spanMonto.textContent !== "" && (spanMonto.textContent !== "No reconocido" || spanAsientoModelo.textContent !== "")) {
                const datosAsiento = await obtenerDatos(`${CT_URLAPI}listaasientos/${empresa_id}`);
                const valorEnteroMonto = parseFloat(spanMonto.textContent.replace(/,/g, ''));
                const valorAsiento = spanAsientoModelo.textContent;
                const nombreAsientoNormalizado = valorAsiento.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

                const asientoEncontrado = datosAsiento.find(asiento => {
                    const nombreNormalizado = asiento.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
                    return nombreNormalizado === nombreAsientoNormalizado;
                });

                if (asientoEncontrado) {
                    procesarSolicitudAAE({monto: valorEnteroMonto, asiento_modelo: asientoEncontrado.id});
                } else {
                    console.log("Error:::");

                }

                contenedorModal.remove();
                enTransaccion = 0;
            } else {
                contenedorModal.remove();
            }

        } else {
            enTransaccion = 1;
        }

        // === Finalizar ===
        recognition.stop();
        escuchando = false;
    };

    // === Botón Activar/Detener ===
    botonNotificaciones.addEventListener('click', () => {
        enTransaccion = 0;

        if (!escuchando) {
            recognition.start();
            escuchando = true;
        } else {
            recognition.stop();
            escuchando = false;

            botonNotificaciones.classList.remove('active', 'border-primary');
            iconoN.classList.replace('bi-mic-fill', 'bi-mic-mute-fill');
            iconoN.classList.remove('text-primary');
            textoReconocido.textContent = "";
        }
    });
};


function Modal(recognition) {
    const iconoCerrar = crearElemento("i", {class: "bi bi-x-lg"});
    const btnCerrar = crearElemento("button", {class: "btn fs-4 py-0 px-2"}, [iconoCerrar]);
    const div = crearElemento("div", {class: "text-end" }, [btnCerrar]);
    const divCuerpo = crearElemento("div", {class: "p-2 pt-0 p-md-4 pt-md-0"});
    const contenidoModal = crearElemento("div", {class: "floating-message p-0", style: "max-width: 700px; min-width: 240px;" }, [div, divCuerpo]);
    const contenedorModal = crearElemento("div", {class: "inner-div" }, [contenidoModal]);

    const spanMonto = crearElemento("span", { class: "fw-bold" });
    const spanAsientoModelo = crearElemento("span", { class: "fw-bold" });
    const divMonto = crearElemento("div", { class: "mb-3 fs-6" }, ["(Monto): ", spanMonto]);
    const divAsientoModelo = crearElemento("div", { class: "mb-3 fs-6" }, ["(Asiento Modelo): ", spanAsientoModelo]);
    divCuerpo.append(divMonto, divAsientoModelo);

    // Elimina el modal si se presiona la tecla Esc
    const salirConEsc = (event) => {
        if (event.key === "Escape") {
            contenedorModal.remove();
            document.removeEventListener("keydown", salirConEsc);
        }
    }
    document.addEventListener("keydown", salirConEsc);

    // Elimina el modal si se hace click fuera del contendor de mensaje
    contenedorModal.addEventListener("click", function (event) {
        if ((contenidoModal && !contenidoModal.contains(event.target)) || (btnCerrar && btnCerrar.contains(event.target))) {
            contenedorModal.remove();
            document.removeEventListener("keydown", salirConEsc);
            recognition.stop();
        }
    });

    return [contenedorModal, divCuerpo, spanMonto, spanAsientoModelo];
}

function procesarSolicitudAAE(datosSolicitud) {
    const usuarioId = getUsuarioId();
    const empresa_id = getEmpresaId();
    const sucursal_id = getSucursalId();
    const URL = CT_URLAPI;

    const accionEnviar = async() => {
        // // Obtener y actualizar los registros de la tabla de la vista principal.
        // const listaDeRegistros = await obtenerDatos(arrUrl[0]);
        // if (listaDeRegistros) {
        //     // contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody);
        //     alertaDeExito(contenedorDeAlertas, "Solcitud aceptada con exito");
        //     arrayDatos[0](listaDeRegistros);
        // } else {
        //     alertaDeError(contenedorDeAlertas, "Ocurrio un error")
        // }
        const formulario = cargarFormulario(`transacciones-${usuarioId}`, "1111");
        crearTargetas(formulario, "Transacciones", `transacciones-${usuarioId}`);

        console.log("Enviado");

    }
    const error = () => {

        console.log("Error en la solicitud");
    }

    const fecha = obtenerFechaActual();
    // Enviar el registro a la API
    const datos = {
        monto: datosSolicitud.monto,
        idasiento: datosSolicitud.asiento_modelo,
        fecha: fecha,
        empresa: empresa_id,
        sucursal: sucursal_id,
        ver: "registrotransaccion_por_asiento"
    }
    enviarDatosOJson({
        datos: datos,
        urlSolicitud: URL,
        callbackExito: accionEnviar,
        callbackError: error
    });
}