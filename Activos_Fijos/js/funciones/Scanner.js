import { crearElemento } from "./Funciones.js"

export const Scanner = () => {
    const modalBody = crearElemento("div", {class: "modal-body text-center pt-1", id: "modalBodyScanner"});
    const modalContent = crearElemento("div", {class: "modal-content"}, [modalBody]);
    const modalDialog = crearElemento("div", {class: "modal-dialog modal-dialog-centered modal-dialog-scrollable"}, [modalContent]);
    const modal = crearElemento("div", {class: "modal fade", id: "modalScanner", tabindex: "-1", "aria-labelledby": "modalScannerLabel", "aria-hidden": "true"}, [modalDialog]);
    return modal;
}

export const  ImplementarScanner = (modalBody, idPantalla, accion, tipo = "informacion") => {

    const iconoCerrar = crearElemento("i", {class: "bi bi-x-lg py-0"});
    const btnCerrar = crearElemento("button", {class: "btn btn-sm py-0 px-1"}, [iconoCerrar]);
    const colCerrar = crearElemento("div", {class: "col-auto p-0"}, [btnCerrar]);
    const divCerrar = crearElemento("div", {class: "row justify-content-end"}, [colCerrar]);
    const titulo = crearElemento("h1", {class: "modal-title fs-4 mb-3 pt-0", id: "exampleModalLabel"}, ["Escáner de código QR"]);
    const alertaHeader = crearElemento("div", {class:"fw-bold mb-2"});

    const nombre = crearElemento("span", {class: "fw-bold"}, ["Nombre: "]);
    const textoNombre = crearElemento("span", {class: "text-primary"});
    const infNombre = crearElemento("p", {class: "mb-1", style: "font-size: 12px"}, [nombre, textoNombre]);
    const codigo = crearElemento("span", {class: "fw-bold"}, ["Código: "]);
    const textoCodigo = crearElemento("span", {class: "text-primary"});
    const infCodigo = crearElemento("p", {class: "mb-1", style: "font-size: 12px"}, [codigo, textoCodigo]);
    const descripcion = crearElemento("span", {class: "fw-bold"}, ["Descripción: "]);
    const textoDescripcion = crearElemento("span", {class: "text-primary"});
    const infDescripcion = crearElemento("p", {class: "mb-1", style: "font-size: 12px"}, [descripcion, textoDescripcion]);
    const area = crearElemento("span", {class: "fw-bold"}, ["Área: "]);
    const textoArea = crearElemento("span", {class: "text-primary"});
    const infArea = crearElemento("p", {class: "mb-1", style: "font-size: 12px"}, [area, textoArea]);
    const responsable = crearElemento("span", {class: "fw-bold"}, ["Responsable: "]);
    const textoResponsable = crearElemento("span", {class: "text-primary"});
    const infResponsable = crearElemento("p", {class: "mb-1", style: "font-size: 12px"}, [responsable, textoResponsable]);
    const contenedorInformacion = crearElemento("div", {class: "py-2 text-start d-none"}, [infNombre, infCodigo, infDescripcion, infArea, infResponsable]);
    const objetoInformacion = {nombre: textoNombre, codigo: textoCodigo, descripcion: textoDescripcion, area: textoArea, resopnsable: textoResponsable, contenedor: contenedorInformacion, alerta: alertaHeader};

    const divReader = crearElemento("div", {id: idPantalla, style: "width: 100%; height: 100%;"});
    const pantalla = crearElemento("div", {class: "rounded-2", style: "position: absolute; top: 0; left: 0; width: 100%; height: 100%; min-height:300px; background-color: #000;"}, [divReader]);
    const contenedorPantalla = crearElemento("div", {class: "border border-primary rounded-2", style: "position: relative; width: 100%; height:100%; min-height:300px"}, [pantalla]);
    const alertaInf = crearElemento("div");

    const iconoIniciar = crearElemento("i", {class: "bi bi-play-circle"});
    const iconoDetener = crearElemento("i", {class: "bi bi-stop-circle"});
    const btnIniciarEscaneo = crearElemento("button", {id: "startScan", class: "btn btn-primary btn-sm rounded-1 px-md-3"}, [iconoIniciar, " Iniciar Escaneo"]);
    const btnDetenerEscaneo = crearElemento("button", {id: "stopScan", class: "btn btn-primary btn-sm rounded-1 px-md-3"}, [iconoDetener, " Detener Escaneo"]);
    const gridBotones = crearElemento("div", {class: "d-grid gap-2 d-md-block px-2 px-sm-5 px-md-0"}, [btnIniciarEscaneo, " ", btnDetenerEscaneo]);
    const iconoCcambiarCamara = crearElemento("i", {class: "bi bi-arrow-repeat"});
    const btnCambiarCamara = crearElemento("button", {id: "changeCamera", class: "btn btn-warning btn-sm rounded-1 px-md-3"}, [iconoCcambiarCamara, " Cambiar Cámara"]);
    const divBtnCamara = crearElemento("div", {class: "mb-2 d-none"}, [btnCambiarCamara]);
    const divBotones = crearElemento("div", {class: "my-2"}, [divBtnCamara, gridBotones]);


    const inputArchivo = crearElemento("input", {type: "file", class: "form-control form-control-sm border-success", id: "fileInput", accept: "image/*"});
    const divInput = crearElemento("div", {class: "col-12 col-sm-10 col-md-8 px-4"}, [inputArchivo]);
    const rowInput = crearElemento("div", {class: "row justify-content-center mt-3"}, [divInput]);

    if (tipo === "informacion") {
        modalBody.append(divCerrar, titulo, alertaHeader, contenedorInformacion, contenedorPantalla, alertaInf, divBotones, rowInput);
    } else if (tipo === "busqueda") {
        modalBody.append(divCerrar, titulo, alertaHeader, contenedorPantalla, alertaInf, divBotones, rowInput);
    }

    const estilosPantalla = (tipo) => {
        if (tipo == "video") {
            divReader.style.height = "auto";
            pantalla.style.height = "auto";
            pantalla.style.removeProperty("position");
            contenedorPantalla.style.height = "auto";
            contenedorPantalla.style.removeProperty("position");
        } else {
            divReader.style.height = "100%";
            pantalla.style.height = "100%";
            pantalla.style.position = "absolute";
            contenedorPantalla.style.height = "100%";
            contenedorPantalla.style.position = "relative";
        }
    }

    const modalScanner = modalBody.closest("#modalScanner");
    modalScanner.addEventListener("hidden.bs.modal", () => {
        detenerScanner();
        alertaInf.innerHTML = "";
        alertaHeader.innerHTML = "";
        contenedorInformacion.classList.add("d-none");
    });

    const html5QrCode = new Html5Qrcode(idPantalla);
    let arrPos = 0;
        
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let configuracion = { fps: 10, qrbox: { width: 250, height: 250 } };
    if (isMobile) {
        configuracion.qrbox = { width: 150, height: 150 }; // Para dispositivos móviles
    }

    btnCerrar.addEventListener("click", () => {
        const modal = bootstrap.Modal.getInstance(modalScanner);
        modal.hide();
    });
    
    btnIniciarEscaneo.addEventListener("click", () => {
        iniciarEscaneoQR();
    });

    btnCambiarCamara.addEventListener("click", async () => {
        detenerScanner(true); 
    });

    btnDetenerEscaneo.addEventListener("click", () => {
        detenerScanner();
    });

    inputArchivo.addEventListener("click", () => {
        detenerScanner();
    });

    inputArchivo.addEventListener("change", (event) => {
        estilosPantalla("imagen");
        if (event.target.files.length == 0) {
            alertaInf.replaceChildren(alertaImagen());
            return;
        }

        const imageFile = event.target.files[0];
        html5QrCode.scanFile(imageFile, true)
        .then(qrCodeMessage => {
            alertaInf.innerHTML = "";
            alertaHeader.innerHTML = "";
            if (tipo === "busqueda") {
                accion(qrCodeMessage);
                const modal = bootstrap.Modal.getInstance(modalScanner);
                modal.hide();
            } else if (tipo === "informacion") {
                accion(qrCodeMessage, objetoInformacion);
            }
        })
        .catch(err => {
            // console.error("Error scanning file:", err);
            alertaInf.replaceChildren(alertaErrorImagen());

            alertaHeader.innerHTML = "";
            contenedorInformacion.classList.add("d-none");
        });
    });

    const codigoQrExitoso = (decodedText, decodedResult) => {
        detenerScanner();
        alertaInf.innerHTML = "";
        alertaHeader.innerHTML = "";
        // const modal = new bootstrap.Modal(modalScanner);
        if (tipo === "busqueda") {
            accion(decodedText);
            const modal = bootstrap.Modal.getInstance(modalScanner);
            modal.hide();
        } else if (tipo === "informacion") {
            accion(decodedText, objetoInformacion);
        }
    };

    const iniciarEscaneoQR = (cambiar = false) => {
        inputArchivo.value = "";
        if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
            return;
        }
        alertaHeader.innerHTML = "";
        contenedorInformacion.classList.add("d-none");

        estilosPantalla("video");

        Html5Qrcode.getCameras().then(dispositivos => {
            if (dispositivos && dispositivos.length) {
                const camaraId = posRef(dispositivos, cambiar);
                html5QrCode.start(
                    camaraId,
                    configuracion,
                    codigoQrExitoso
                ).then(() => {
                    if (dispositivos.length > 1) {
                        divBtnCamara.classList.remove("d-none");   
                    } else {
                        divBtnCamara.classList.add("d-none");
                    }
                })
                .catch(err => {
                    // console.error("Error starting camera:", err);
                    alertaInf.replaceChildren(alertaScanner());
                });
            }
        }).catch(err => {
            // console.error("Error getting cameras:", err);
            alertaInf.replaceChildren(alertaErrorScanner());
        });
    };

    const posRef = (dispositivos, cambiar) => {
        if (cambiar) {
            arrPos++;
            if (arrPos >= dispositivos.length) {
                arrPos = 0;
            }
        }
        return dispositivos[arrPos].id;
    };

    const detenerScanner = (iniciar = undefined) => {
        inputArchivo.value = "";
        if (!iniciar) {
            divBtnCamara.classList.add("d-none");
        }
        if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING || html5QrCode.getState() === Html5QrcodeScannerState.PAUSED) {        
            contenedorInformacion.classList.add("d-none");    
            html5QrCode.stop().then(() => {
                alertaInf.innerHTML = "";
                alertaHeader.innerHTML = "";
                if (iniciar) {
                    iniciarEscaneoQR(true);
                }
            }).catch(err => {
                // console.error("Error stopping camera:", err);
                alertaInf.replaceChildren(alertaDetenerScanner());
            });
        }
    };
}

const alertaImagen = () => {
    const icono = crearElemento("i", {class: "bi bi-info-square-fill"});
    const alerta = crearElemento("p", {class: `text-info fw-bold`}, [icono, " ", `No se ha seleccionado ninguna imagen.`])
    return alerta;
}
const alertaErrorImagen = () => {
    const icono = crearElemento("i", {class: "bi bi-exclamation-triangle-fill"});
    const alerta = crearElemento("p", {class: `text-danger fw-bold`}, [icono, " ", `No se pudo leer el código QR de la imagen seleccionada. Intente con otra imagen.`])
    return alerta;
}
const alertaScanner = () => {
    const icono = crearElemento("i", {class: "bi bi-info-square-fill"});
    const alerta = crearElemento("p", {class: `text-info fw-bold`}, [icono, " ", `No se pudo acceder a la cámara. Intente nuevamente.`])
    return alerta;
}
const alertaErrorScanner = () => {
    const icono = crearElemento("i", {class: "bi bi-exclamation-triangle-fill"});
    const alerta = crearElemento("p", {class: `text-danger fw-bold`}, [icono, " ", `Error al acceder a la cámara. Verifique que el navegador tenga permisos para acceder a la cámara y que la cámara esté conectada correctamente.`])
    return alerta;
}
const alertaDetenerScanner = () => {
    const icono = crearElemento("i", {class: "bi bi-exclamation-triangle-fill"});
    const alerta = crearElemento("p", {class: `text-danger fw-bold`}, [icono, " ", `Error al detener la cámara. Intente nuevamente o recargue la página.`])
    return alerta;
}