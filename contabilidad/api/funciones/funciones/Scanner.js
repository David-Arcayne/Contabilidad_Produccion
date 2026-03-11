import { crearElemento } from "./Funciones.js"

/**
 * Función: Crea un botón para abrir el modal del escáner de código QR.
 * Descripción: Genera un botón que, al ser presionado, abre un modal con el escáner de código QR.
 *              Utiliza la función agregarModalScanner para crear el modal y manejar su lógica.
 * Fecha: 24 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Botón para abrir el modal del scanner.
 * @param {OpcionesScanner} datosScanner - Datos para crear y manejar el modal del escáner.
 * @returns {HTMLButtonElement} Botón que abre el modal del escáner.
 */
export function botonAbrirScanner(datosScanner) {
    const modalScanner = agregarModalScanner(datosScanner);

    const iconoScanner = crearElemento("i", {class: "bi bi-qr-code-scan me-1"});
    const botonScanner = crearElemento("button", {class: "btn btn-primary btn-sm h-100", "data-id":"__lectorqr"}, [iconoScanner, " Leer QR"]);
    botonScanner.addEventListener("click", async (e) => {
        e.preventDefault();
        const instanciaModal = bootstrap.Modal.getInstance(modalScanner);
        if (instanciaModal) {
            instanciaModal.show();
        } else {
            const modal = new bootstrap.Modal(modalScanner);
            modal.show();
        }
    });

    return botonScanner;
}

/**
 * Función: Crea la estructura base del modal para el escáner de código QR.
 * Descripción: Genera el modal HTML necesario para alojar el escáner de código QR.
 *              Utiliza la función implementarContenidoScanner para agregar la lógica del escáner.
 * Fecha: 24 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Crea la estructura base del modal para el escáner de código QR.
 * @param {OpcionesScanner} datosScanner - Datos para crear y manejar el modal del escáner.
 * @returns {HTMLDivElement} Referencia al elemento modal del escáner.
 */
export function agregarModalScanner(datosScanner) {
    const {
        contenedor,
        callback,
        idLector
    } = datosScanner;
    const modalBody = crearElemento("div", { class: "modal-body text-center pt-1", id: "modalBodyScanner" });
    const modalContent = crearElemento("div", { class: "modal-content" }, [modalBody]);
    const modalDialog = crearElemento("div", { class: "modal-dialog modal-dialog-centered modal-dialog-scrollable" }, [modalContent]);

    const modalScanner = crearElemento("div", {
        class: "modal fade",
        id: "modalScanner",
        tabindex: "-1",
        "aria-labelledby": "modalScannerLabel",
        "aria-hidden": "true"
    }, [modalDialog]);
    contenedor.appendChild(modalScanner);

    // Implementar el contenido del escáner en el modal, una vez agregado el modal al DOM
    implementarContenidoScanner({
        modal: modalScanner,
        modalBody,
        idLector,
        callback,
    });


    return modalScanner;
};

/**
 * Función: Implementa la lógica del escáner dentro del modal proporcionado.
 * Descripción: Agrega el diseño y la funcionalidad del escáner de código QR en el cuerpo del modal.
 *              Utiliza la librería Html5Qrcode para el escaneo de códigos QR.
 *              Gestiona el ciclo de vida del escáner, eventos de cámara y lectura de archivos.
 * Fecha: 24 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Implementa la lógica del escáner dentro del modal proporcionado.
 * @param {object} datosScanner - Datos necesarios para implementar el escáner.
 * @param {HTMLDivElement} datosScanner.modal - Referencia al modal del escáner.
 * @param {HTMLDivElement} datosScanner.modalBody - Cuerpo del modal donde se implementa el escáner.
 * @param {string} datosScanner.idLector - ID único del lector de escáner.
 * @param {function} datosScanner.callback - Función a ejecutar al leer el código QR.
 */
function implementarContenidoScanner(datosScanner) {
    const {
        modal,
        modalBody,
        idLector,
        callback,
    } = datosScanner;

    // Crear elementos del modal
    // 1. Header (Botón cerrar, Título, Alertas)
    const btnCerrar = crearElemento("button", { class: "btn btn-light py-0 px-1" }, [
        crearElemento("i", { class: "bi bi-x-lg p-0 fs-6" })
    ]);
    const divCerrar = crearElemento("div", { class: "row justify-content-end" }, [
        crearElemento("div", { class: "col-auto p-0" }, [btnCerrar])
    ]);
    const titulo = crearElemento("h1", { class: "modal-title fs-6 mb-2 pt-0 fw-bold" }, ["Escáner de código QR"]);
    // Contenedor para mostrar información o resultados (mutando opciones según requerimiento original)
    const contenedorInformacion = crearElemento("div", { class: "my-2 text-start d-none" });

    // 2. Área de Visualización (Cámara/Imagen)
    const divReader = crearElemento("div", { id: idLector, style: "width: 100%; height: 100%;" });
    const divPantalla = crearElemento("div", {
        class: "rounded-2",
        style: "position: absolute; top: 0; left: 0; width: 100%; height: 100%; min-height: 300px; background-color: #000;"
    }, [divReader]);
    const contenedorPantalla = crearElemento("div", {
        class: "border border-secondary rounded-2",
        style: "position: relative; width: 100%; height: 100%; min-height: 300px"
    }, [divPantalla]);

    const alertaInf = crearElemento("div", {"data-id":"alertaInf"});

    // 3. Controles (Botones)
    const btnIniciar = crearElemento("button", { class: "btn btn-primary btn-sm rounded-1 px-md-3" }, [
        crearElemento("i", { class: "bi bi-play-circle" }), " Iniciar Escaneo"
    ]);
    const btnDetener = crearElemento("button", { class: "btn btn-primary btn-sm rounded-1 px-md-3", disabled: true }, [
        crearElemento("i", { class: "bi bi-stop-circle" }), " Detener Escaneo"
    ]);
    const btnCambiarCamara = crearElemento("button", { class: "btn btn-warning btn-sm rounded-1 px-md-3", disabled: true }, [
        crearElemento("i", { class: "bi bi-arrow-repeat" }), " Cambiar Cámara"
    ]);
    const divCambiarCamara = crearElemento("div", { class: "mb-2 d-none" }, [btnCambiarCamara]);
    const gridBotones = crearElemento("div", { class: "d-grid gap-2 d-md-block px-2 px-sm-5 px-md-0" }, [btnIniciar, " ", btnDetener]);
    const divBotones = crearElemento("div", { class: "my-2" }, [divCambiarCamara, gridBotones]);

    // 4. Input para subir archivo
    const inputArchivo = crearElemento("input", {
        type: "file",
        class: "form-control form-control-sm border-success",
        accept: "image/*"
    });
    const divInput = crearElemento("div", { class: "row justify-content-center mt-3" }, [
        crearElemento("div", { class: "col-12 col-sm-10 col-md-8 px-4" }, [inputArchivo])
    ]);

    // Agregar todos los elementos en el cuerpo del modal
    modalBody.replaceChildren(divCerrar, titulo, contenedorInformacion, contenedorPantalla, alertaInf, divBotones, divInput);


    // Estado del escáner
    const estadoHtmlQR = {
        scanner: new Html5Qrcode(idLector),
        camaras: [],
        camaraIndex: 0,
        escaneando: false
    };


    // FUNCIONES AUXILIARES

    const actualizarBotones = (escaneando) => {
        btnIniciar.disabled = escaneando;
        btnDetener.disabled = !escaneando;
        btnCambiarCamara.disabled = !escaneando;
        inputArchivo.disabled = escaneando; // deshabilitar subida de archivo mientras escanea
    };

    const mostrarAlerta = (mensaje, tipo = "info") => {
        const esError = tipo === "error";
        const claseColor = esError ? "text-danger" : "text-info";
        const claseIcono = esError ? "bi-exclamation-triangle-fill" : "bi-info-square-fill";
        const contenido = crearElemento("p", { class: `${claseColor} fw-bold` }, [
            crearElemento("i", { class: `bi ${claseIcono}` }), " ", mensaje
        ]);
        alertaInf.replaceChildren(contenido);
    };

    const limpiarInterfaz = () => {
        alertaInf.replaceChildren();
        contenedorInformacion.classList.add("d-none");
    };

    // Ajusta estilos CSS dependiendo si mostramos video (cámara) o imagen estática
    const configurarVista = (modo) => {
        const esVideo = modo === "video";
        if (esVideo) {
            divReader.style.height = "auto";
            divPantalla.style.height = "auto";
            divPantalla.style.removeProperty("position");
            contenedorPantalla.style.height = "auto";
            contenedorPantalla.style.removeProperty("position");
        } else {
            divReader.style.height = "100%";
            divPantalla.style.height = "100%";
            divPantalla.style.position = "absolute";
            contenedorPantalla.style.height = "100%";
            contenedorPantalla.style.position = "relative";
        }
    };

    // Función a ejecutar al leer un código QR exitosamente
    const procesarExito = async (textoQR, resultado) => {
        await detenerScanner();
        limpiarInterfaz();
        try {
            callback({
                textoQR,
                modalScanner: modal,
                contenedorInformacion,
            });
        } catch (error) {
            console.error(error);
            return;
        }
    };

    // LÓGICA DE CONTROL

    const detenerScanner = async (reiniciar = false) => {
        inputArchivo.value = "";
        if (!reiniciar) divCambiarCamara.classList.add("d-none");

        const estadoActual = estadoHtmlQR.scanner.getState();
        const estaActivo = estadoActual === Html5QrcodeScannerState.SCANNING || estadoActual === Html5QrcodeScannerState.PAUSED;

        if (estaActivo) {
            contenedorInformacion.classList.add("d-none");
            try {
                await estadoHtmlQR.scanner.stop();
                actualizarBotones(false); // Habilitar 'Iniciar', deshabilitar 'Detener'
                limpiarInterfaz();
                if (reiniciar) await iniciarScanner(true);
            } catch (err) {
                console.error("Error al detener scanner:", err);
                mostrarAlerta("Error al detener la cámara. Intente recargar.", "error");
            }
        } else if (reiniciar) {
            await iniciarScanner(true);
        } else {
            actualizarBotones(false);
        }
    };

    const iniciarScanner = async (cambiarCamara = false) => {
        btnIniciar.disabled = true;
        inputArchivo.value = "";
        limpiarInterfaz();

        if (estadoHtmlQR.scanner.getState() === Html5QrcodeScannerState.SCANNING) return;

        configurarVista("video");

        try {
            // Cargar cámaras si no están cargadas
            if (!estadoHtmlQR.camaras || estadoHtmlQR.camaras.length === 0) {
                try {
                    estadoHtmlQR.camaras = await Html5Qrcode.getCameras();
                } catch (e) {
                    throw new Error("No se pudo acceder a los dispositivos de cámara.");

                }
            }

            if (estadoHtmlQR.camaras && estadoHtmlQR.camaras.length > 0) {
                // Lógica ciclo de cámaras
                if (cambiarCamara) {
                    estadoHtmlQR.camaraIndex = (estadoHtmlQR.camaraIndex + 1) % estadoHtmlQR.camaras.length;
                }

                const cameraId = estadoHtmlQR.camaras[estadoHtmlQR.camaraIndex].id;
                divCambiarCamara.classList.toggle("d-none", estadoHtmlQR.camaras.length <= 1);

                const config = {
                    fps: 20,
                    qrbox: (w, h) => {
                        const lado = Math.max(150, Math.floor(Math.min(w, h) * 0.9));
                        return { width: lado, height: lado };
                    }
                };

                await estadoHtmlQR.scanner.start(cameraId, config, procesarExito);
                actualizarBotones(true); // Deshabilitar 'Iniciar', habilitar 'Detener'
            } else {
                mostrarAlerta("No se detectaron cámaras en el dispositivo.", "error");
                actualizarBotones(false);
            }
        } catch (err) {
            console.error(err);
            mostrarAlerta("Error de acceso a cámara. Verifique permisos.", "error");
            actualizarBotones(false);
        }
    };


    // LISTENERS

    // Botones
    btnIniciar.addEventListener("click", () => iniciarScanner());
    btnDetener.addEventListener("click", () => detenerScanner());
    btnCambiarCamara.addEventListener("click", () => detenerScanner(true)); // Detener y reiniciar con siguiente cámara
    btnCerrar.addEventListener("click", () => bootstrap.Modal.getInstance(modal).hide());

    // Eventos Modal
    modal.addEventListener("hidden.bs.modal", async () => {
        await detenerScanner();
        limpiarInterfaz();
        divReader.replaceChildren(); // Limpieza profunda del div del scanner
    });

    // Lectura de QR desde archivo
    inputArchivo.addEventListener("change", async (event) => {
        configurarVista("imagen");
        if (event.target.files.length === 0) {
            mostrarAlerta("No se ha seleccionado ninguna imagen.", "info");
            return;
        }

        try {
            const qrMessage = await estadoHtmlQR.scanner.scanFile(event.target.files[0], true);
            procesarExito(qrMessage);
        } catch (err) {
            limpiarInterfaz();
            mostrarAlerta("No se pudo leer el código QR de la imagen seleccionada.", "error");
        }
    });
};