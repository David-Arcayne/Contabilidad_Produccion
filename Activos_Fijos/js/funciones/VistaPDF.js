import { AF_ENV } from "../../db/environment.js";
import { crearElemento } from "./Funciones.js";
import { solicitudPDF } from "./Solicitudes.js";

export const VistaPDF = (titulo, solicitud, tipoHoja = "Letter") => {
    let estiloHoja = "";
    if (tipoHoja === "Letter") {
        estiloHoja = "min-width: 8.5in; max-width: 8.5in; min-height: 11in;";
    } else if (tipoHoja === "Letter-L") {
        estiloHoja = "min-width: 11in; max-width: 11in; min-height: 8.5in;";
    } else if (tipoHoja === "Legal") {
        estiloHoja = "min-width: 8.5in; max-width: 8.5in; min-height: 14in;";
    } else if (tipoHoja === "Legal-L") {
        estiloHoja = "min-width: 14in; max-width: 14in; min-height: 8.5in;";
    }
    const modalH1 = crearElemento("h1", {class: "modal-title fs-5"}, [titulo]);
    const btnCerrar = crearElemento("button", {type: "button", class: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close"});
    const modalHeader = crearElemento("div", {class: "modal-header"}, [modalH1, btnCerrar]);

    const divPage = crearElemento("div", {style: `${estiloHoja} padding:15mm; background-color: #ffffff; box-sizing: border-box;`, class:"af-seccion mx-auto"}, ["..."]);
    const modalBody = crearElemento("div", {class: "modal-body shadow-none bg-dark bg-opacity-25 p-1 p-md-3"}, [divPage]);

    const iconoDescargar = crearElemento("i", {class: "bi bi-download pe-1"});
    const btnDescargar = crearElemento("button", {type: "button", class: "btn btn-primary rounded-1"}, [iconoDescargar, " Descargar PDF"]);
    if (solicitud) {
        btnDescargar.addEventListener("click", async () => {
            btnDescargar.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Descargando...`;
            btnDescargar.disabled = true;
            await solicitudPDF(...solicitud);
            btnDescargar.innerHTML = `${iconoDescargar.outerHTML} Descargar PDF`;
            btnDescargar.disabled = false;
        });
    }
    const modalFooter = crearElemento("div", {class: "modal-footer"}, [btnDescargar]);

    const modalContent = crearElemento("div", {class: "modal-content"}, [modalHeader, modalBody, modalFooter]);
    const modalDialog = crearElemento("div", {class: "modal-dialog modal-fullscreen"}, [modalContent]);
    const modal = crearElemento("div", {class: "modal fade", tabindex: "-1", "aria-labelledby": "exampleModalLabel", "aria-hidden": "true"}, [modalDialog]);

    pdfPrincipal(divPage);
    return { modal, divPage, btnDescargar };
};

const pdfPrincipal = async (divPage) => {
    const empresa = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa;
    const htmlHeader =`
        <div class="reportaf">
            <div class="afr-header afr-h-mb">
                <div class="afr-h-left afr-pb">
                    <div class="afr-text-lg"> ${empresa.nombre} </div>
                    <div> ${empresa.direccion} </div>
                    <div> ${empresa.ociudad} </div>
                    <div> ${empresa.oestado} </div>
                    <div> ${empresa.opais} </div>
                </div>
                <div class="afr-h-center">
                    <table class="afr-h-table">
                        <tr>
                            <td>
                                <img class="afr-logo" src="${AF_ENV.apiUrl}/app/em/${empresa.logo}">
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="afr-h-right afr-pb">
                    <div class="afr-text-lg"> NIT: ${empresa.nit} </div>
                    <div>Tel: ${empresa.telefono} </div>
                    <div>Cel: ${empresa.ocelular} </div>
                    <div> ${empresa.email} </div>
                    <div> ${empresa.ositioweb} </div>
                </div>
            </div>
            <main>
                    
            </main>
        </div>`;

    divPage.innerHTML =  htmlHeader;
}

export const FiltrosPDF = (filtros) => {
    let subtitle = "";
    if (filtros && filtros.length > 0) {
        filtros.forEach(value => {
            subtitle += `<span>${value.nombre}</span>: ${value.valor}, `;
        });
        subtitle = subtitle.slice(0, -2);
    }

    return subtitle;
}

export const BotonPDF = ({modal, divPage, btnDescargar}, contenido, opcionespdf = undefined,  accion = undefined) => {
    const modalInstance = new bootstrap.Modal(modal);
    const principal = divPage.querySelector("main");
    return (btn) => {
        const datosParaF = {};
        
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            principal.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;
            modalInstance.show();
            principal.innerHTML = await contenido();
            Object.keys(datosParaF).forEach(key => {
                delete datosParaF[key];
            });
            // Agregar botón para ocultar y mostrar tablas
            const agregarBtn = () => {
                const tablas = principal.querySelectorAll("table");
                tablas.forEach(tabla => {
                    const btn = crearElemento("button", {style: "padding: 2px 10px; margin-bottom: 10px;"}, ["ocultar / ver"]);
                    tabla.insertAdjacentElement('beforebegin', btn);
                    const nombreT = tabla.getAttribute("data-tname");
                    btn.addEventListener("click", () => {
                        tabla.classList.toggle("d-none");
                        if (nombreT) {
                            if (tabla.classList.contains("d-none")) {
                                datosParaF[nombreT] = "oculto";
                            } else {
                                delete datosParaF[nombreT];
                            }
                        }
                    });
                });
            };
            agregarBtn();

            if (accion) {
                accion();
            }
        });

        if (opcionespdf) {
            btnDescargar.addEventListener("click", async () => {
                btnDescargar.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Descargando...`;
                btnDescargar.disabled = true;
                await solicitudPDF(opcionespdf[0], opcionespdf[1], opcionespdf[2], opcionespdf[3], opcionespdf[4], datosParaF, opcionespdf[6]);
                btnDescargar.innerHTML = `Descargar PDF`;
                btnDescargar.disabled = false;
            });
        }
    };
}