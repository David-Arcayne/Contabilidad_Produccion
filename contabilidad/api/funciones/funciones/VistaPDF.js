import { campoInput, campoSelect } from "./CrearFormulario.js";
import { CT_URLAPI, EM_URL, getEmpresa, getEmpresaId } from "./DatosAuxiliares.js";
import { botonEnCarga, convertirImagenABase64, crearElemento } from "./Funciones.js";
import { modalDeInformacion, modalRemovible } from "./Modals.js";
import { obtenerDatos } from "./Solicitudes.js";

/**
 * Crear el diseño del encabezado de un PDF
 * @returns {string} Retorna un string (HTML) con el diseño del encabezado del PDF
 */
export const EncabezadoPDF = () => {
    const empresa = getEmpresa();
    const htmlHeader =`
        <div class="afr-header afr-h-mb">
            <div class="afr-h-left afr-pb">
                <div class="afr-text-lg"> ${empresa.nombre} </div>
                <div> ${empresa.direccion ?? ""} </div>
                <div> ${empresa.ociudad ?? ""} </div>
                <div> ${empresa.oestado ?? ""} </div>
                <div> ${empresa.opais ?? ""} </div>
            </div>
            <div class="afr-h-center">
                <table class="afr-h-table">
                    <tr>
                        <td>
                            <img class="afr-logo" src="${EM_URL}${empresa.logo}">
                        </td>
                    </tr>
                </table>
            </div>
            <div class="afr-h-right afr-pb">
                <div class="afr-text-lg"> NIT: ${empresa.nit} </div>
                <div>Tel: ${empresa.telefono ?? " -"} </div>
                <div>Cel: ${empresa.ocelular ?? " -"} </div>
                <div> ${empresa.email ?? ""} </div>
                <div> ${empresa.ositioweb ?? ""} </div>
            </div>
        </div>`;

    return htmlHeader;
}

/**
 * Crear el diseño principal de un PDF
 * @param {HTMLElement} divPage - Elemento HTML donde se agregará el contenido del PDF
 */
export const PdfPrincipal = (divPage) => {
    const htmlHeader =`
        <div class="reportaf">
            ${EncabezadoPDF()}
            <main>

            </main>
        </div>`;

    divPage.innerHTML =  htmlHeader;
}
export function estructuraReporteConEncabezado() {
    const htmlHeader =`
        <div class="reportaf">
            ${EncabezadoPDF()}
            <main>

            </main>
        </div>`;

    return htmlHeader
}

/**
 * Función para obtener las firmas de un PDF en un maximo de 4 columnas
 * @returns {string} Retorna un string (HTML) con las firmas
 */
export const FirmasPDF = async () => {
    const datosFirma = []
    const lnFirmas = datosFirma.length;
    if (datosFirma && lnFirmas > 0) {
        let firmasD = "";
        if (lnFirmas <= 4) {
            // Si hay menos de 4 firmas se divide el espacio en partes iguales
            const porcentaje = Math.floor(100 / lnFirmas);
            for (const lista of datosFirma) {
                firmasD+=`<div class="afr-sig " style="width: ${porcentaje}%;">
                    <span>${lista.nombre}</span><br><span class="afr-fwb">${lista.cargo}</span><br><span>${lista.numero}</span>
                </div>`;
            }
        } else {
            // Si hay más de 4 firmas se divide en filas de 4 firmas
            const maximo = 4;
            let contador = 0;
            for (const lista of datosFirma) {
                let porcentaje;
                const filaActual = Math.floor(contador / maximo);
                const inicioFila = filaActual * maximo;
                const firmasRestantes = lnFirmas - inicioFila;
                const firmasEnFila = Math.min(firmasRestantes, maximo);
                porcentaje = Math.floor(100 / firmasEnFila);
                firmasD += `<div class="afr-sig" style="width: ${porcentaje}%;"><span>${lista.nombre}</span><br><span class="afr-fwb">${lista.cargo}</span><br><span>${lista.numero}</span></div>`;
                contador++;
            }
        }
        return firmasD;
    } else {
        return false;
    }
}

/**
 * Función para obtener las firmas de un PDF en un maximo de 4 columnas
 * @param {number} tipo_reporte - Tipo de reporte para obtener las firmas
 * @returns {Promise<string|boolean>} Retorna un string (HTML) con las firmas o false si no hay firmas
 */
export const FirmasContabilidad = async (tipo_reporte) => {
    const empresa_id = getEmpresaId();
    const datosFirma = await obtenerDatos(`${CT_URLAPI}listar_firmas_todos_reportes/${tipo_reporte}/${empresa_id}`);
    const lnFirmas = datosFirma.length;
    if (datosFirma && lnFirmas > 0) {
        let firmasD = "";
        if (lnFirmas <= 4) {
            // Si hay menos de 4 firmas se divide el espacio en partes iguales
            const porcentaje = Math.floor(100 / lnFirmas);
            for (const lista of datosFirma) {
                firmasD+=`<div class="afr-sig " style="width: ${porcentaje}%;">
                    <span>${lista.nombre || ""} ${lista.apellido || ""}</span>
                    <span class="afr-fwb">${lista.cargo}</span>
                    ${lista.matricula || lista.ci ? `<span>${lista.matricula || lista.ci}</span>` : ""}
                </div>`;
            }
        } else {
            // Si hay más de 4 firmas se divide en filas de 4 firmas
            const maximo = 4;
            let contador = 0;
            for (const lista of datosFirma) {
                let porcentaje;
                const filaActual = Math.floor(contador / maximo);
                const inicioFila = filaActual * maximo;
                const firmasRestantes = lnFirmas - inicioFila;
                const firmasEnFila = Math.min(firmasRestantes, maximo);
                porcentaje = Math.floor(100 / firmasEnFila);
                firmasD += `<div class="afr-sig" style="width: ${porcentaje}%;">
                    <span>${lista.nombre || ""} ${lista.apellido || ""}</span>
                    <span class="afr-fwb">${lista.cargo}</span>
                    ${lista.matricula || lista.ci ? `<span>${lista.matricula || lista.ci}</span>` : ""}
                </div>`;
                contador++;
            }
        }
        return firmasD;
    } else {
        return false;
    }
}

// =========================================================
// FUNCIONALIDADES CON PDFMAKE
// =========================================================

const colorPrincipal = "#212529";
const colorSecundario = "#808080";
const colorGrisClaro = "#dee2e6";

let logoEmpresaBase64 = null;

const layoutsTabla = {
    lineasHorizontales: {
        hLineWidth: () => 0.75,
        vLineWidth: () => 0,
        hLineColor: () => colorGrisClaro,
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 6,
        paddingBottom: () => 6,
    },
    sinBordes: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 3,
        paddingBottom: () => 3,
    }
};

// Cargar el logo de la empresa en base64
export async function setLogoEmpresaBase64() {
    const empresa = getEmpresa();
    const resultadoImagen = await convertirImagenABase64(`${EM_URL}${empresa.logo}`, {
      maxWidth: 200,
      maxHeight: 200,
      calidadJPEG: 1,
      fallbackBase64: null
    });

    logoEmpresaBase64 = resultadoImagen?.base64;
}

/**
 * Función: Estilos que se utilizarán en un documento PDF generado con pdfMake
 * Descripción: Esta función define una serie de estilos predefinidos que se pueden aplicar a diferentes elementos dentro de un documento PDF generado utilizando la biblioteca pdfMake.
 * Fecha: 28 de enero de 2024
 * Autor: Joel Choque
 */
function estilosPdfMake() {
    const espaciadoVertical = [0, 0, 0, 2];
    return {
        encabezadoTitulo: {
            fontSize: 13.5,
            margin: [0, 0, 0, 3]
        },
        encabezadoTexto: {
            bold: true,
            margin: espaciadoVertical
        },

        textoTitulo: {
            fontSize: 14,
            alignment: "center",
            margin: espaciadoVertical
        },
        textoSubTitulo: {
            fontSize: 12,
            alignment: "center",
            marginTop: 1,
        },
        textoInformacion: {
            alignment: "center",
            color: colorSecundario,
            margin: [0, 1, 0, 10]
        },
        textoSeccion: {
            bold: true,
            margin: [0, 8, 0, 8]
        },
        espaciadoTextoVertical: {
            margin: espaciadoVertical
        },

        columnaInicio: {
            marginRight: 15
        },
        columnaCentral: {
            marginLeft: 15,
            marginRight: 15
        },
        columnaFinal: {
            marginLeft: 15
        },

        tablaEncabezado: {
            bold: true
        },
        tablaMontoTotal: {
            bold: true,
            alignment: "right"
        },
        tablaTextoTotal: {
            bold: true,
            alignment: "right",
            marginRight: 10
        },

        colorTextoPrincipal: {
            color: colorPrincipal
        },
        colorTextoSecundario: {
            color: colorSecundario
        },
    };
}

/**
 * Función: Crea la definición de un documento PDF utilizando pdfMake y lo muestra en un modal
 * Descripción: Esta función toma un objeto con los datos necesarios para definir un documento PDF utilizando la biblioteca pdfMake.
 *              Configura las propiedades del documento, como el tamaño de la página, la orientación, los márgenes y el contenido.
 *              También incluye opciones para agregar un logotipo de empresa y numeración de páginas.
 *              Finalmente, genera el PDF y lo muestra en un modal en pantalla completa.
 * Fecha: 28 de enero de 2024
 * Autor: Joel Choque
 */
/**
 * Crear la definición de un documento PDF utilizando pdfMake y mostrarlo en un modal
 * @param {DatosGenerarPDF} datos - Objeto con los datos para definir el documento PDF
 */
export async function defDocumentoPdfMake(datos) {
    const {
        tituloModal,
        contenido,
        tipoHoja = "LETTER",
        orientacion = "portrait",
        bordePagina = 40,
        numeroPieDePagina = false,
    } = datos;

    const defDocumento = {

        pageSize: tipoHoja,
        pageOrientation: orientacion,
        pageMargins: bordePagina,
        content: contenido,
        defaultStyle: {
            // font: "Roboto",
            fontSize: 8.25,
            color: colorPrincipal,
        },
        styles: estilosPdfMake()
    };

    // Incluir el logotipo de la empresa si está disponible
    if (logoEmpresaBase64) {
        defDocumento.images = {
            logoEmpresa: logoEmpresaBase64
        };
    }

    // Agregar numeración de páginas si se especifica
    if (parseInt(numeroPieDePagina) >= 0) {
        defDocumento.footer = function(currentPage, pageCount, pageSize) {
            return [{
                text: `Página N° ${currentPage + parseInt(numeroPieDePagina) - 1}`,
                alignment: 'right',
                color: colorSecundario,
                marginRight: bordePagina,
                marginTop: 3
            }];
        };
    }

    // Agregar los layouts personalizados para tablas
    pdfMake.addTableLayouts(layoutsTabla);
    // Verificar si el usuario está en un dispositivo móvil
    const esMovil = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (esMovil) {
        // Abrir el PDF en una nueva pestaña para dispositivos móviles
        pdfMake.createPdf(defDocumento).open();
        return;
    }

    // Generar el PDF y obtener el Blob para mostrarlo en un modal
    let blob = await pdfMake.createPdf(defDocumento).getBlob()
    const url = URL.createObjectURL(blob);
    abrirModalPdfFullscreen(url, tituloModal);
}

/**
 * Función: Genera el contenido del encabezado para un documento PDF utilizando pdfMake
 * Descripción: Esta función crea la estructura del encabezado que se utilizará en un documento PDF generado con la biblioteca pdfMake.
 *              La estructura se organiza en una tabla con tres columnas para presentar la información.
 * Fecha: 28 de enero de 2024
 * Autor: Joel Choque
 */
/**
 * Generar el contenido del encabezado para un documento PDF utilizando pdfMake
 * @returns {Array} Retorna un arreglo con el contenido del encabezado para pdfMake
 */
export function contenidoConEncabezadoPdfMake() {
    const empresa = getEmpresa();
    const contenido = [
        {
            table: {
                widths: ["*"],
                body: [[{
                    columns: [
                        {
                            width: "40%",
                            stack: [
                                { text: empresa.nombre, style: "encabezadoTitulo" },
                                { text: empresa.direccion || "", style: "encabezadoTexto" },
                                { text: empresa.ociudad || "", style: "encabezadoTexto" },
                                { text: empresa.oestado || "", style: "encabezadoTexto" },
                                { text: empresa.opais || "", style: "encabezadoTexto" }
                            ]
                        },
                        {
                            width: "20%",
                            stack: [
                                logoEmpresaBase64 ? {
                                    image: "logoEmpresa",
                                    fit: [75, 60],
                                    alignment: "center"
                                } : { text: "" }
                            ],
                            alignment: "center"
                        },
                        {
                            width: "40%",
                            alignment: "right",
                            stack: [
                                { text: `NIT: ${empresa.nit}`, style: "encabezadoTitulo" },
                                { text: `Tel: ${empresa.telefono ?? "-"}`, style: "encabezadoTexto" },
                                { text: `Tel: ${empresa.ocelular ?? "-"}`, style: "encabezadoTexto" },
                                { text: `${empresa.email ?? "-"}`, style: "encabezadoTexto" },
                                { text: `${empresa.ositioweb ?? "-"}`, style: "encabezadoTexto" }
                            ],
                        },
                    ],
                    margin: [0, 0, 0, 2],
                }]]
            },
            layout: {
                hLineWidth: (i) => (i === 1 ? 0.75 : 0),
                vLineWidth: () => 0,
                hLineColor: () => "#cccccc",
                paddingTop: () => 0,
                paddingBottom: () => 2,
                paddingLeft: () => 0,
                paddingRight: () => 0,
            },
            marginBottom: 5,
        }
    ];

    return contenido;
}

/**
 * Función: Crear una sección de tabla para un documento PDF utilizando pdfMake
 * Descripción: Esta función crea una sección de tabla con los datos necesarios y genéricos para ser utilizada en el documento.
 * Fecha: 28 de enero de 2024
 * Autor: Joel Choque
 */
/**
 * Crear una sección de tabla para un documento PDF utilizando pdfMake
 * @param {Object} tabla - Objeto con la definición de la tabla para pdfMake.
 * @param {Object} opcionesTabla - Objeto con las opciones para la tabla.
 * @param {string} opcionesTabla.layout - Layout de la tabla (por defecto: "lineasHorizontales").
 * @param {number} opcionesTabla.filasEncabezado - Número de filas de encabezado en la tabla (por defecto: 0).
 * @param {Object} opcionesTabla.estilosTabla - Estilos adicionales para la tabla.
 * @returns {Object} Retorna un objeto con la sección de tabla para pdfMake
 */
export function seccionTablaPdfMake(tabla, opcionesTabla) {
    const {
        layout = "lineasHorizontales",
        filasEncabezado = 0,
        estilosTabla = {}
    } = opcionesTabla || {};

    if (filasEncabezado) {
        tabla.headerRows = filasEncabezado;
        tabla.keepWithHeaderRows = filasEncabezado;
    }
    tabla.dontBreakRows = true;

    return {
        table: tabla,
        layout,
        ...estilosTabla
    };
}

/**
 * Función: Obtener las firmas para un documento PDF utilizando pdfMake
 * Descripción: Esta función obtiene las firmas necesarias para ser incluidas en un documento PDF generado con pdfMake.
 *              Las firmas se organizan en filas con un máximo de 4 columnas por fila.
 * Fecha: 28 de enero de 2024
 * Autor: Joel Choque
 */
/**
 * Obtener las firmas para un documento PDF utilizando pdfMake
 * @param {number} [tipoReporte] - Tipo de reporte para obtener las firmas
 * @param {Array} [firmas] - Arreglo con los datos de las firmas (esta opción excluye la obtención de datos desde la API segun "tipoReporte")
 * @returns {Promise<Function|null>} Retorna una función que genera el contenido de las firmas para pdfMake o null si no hay firmas
 */
export async function firmasContabilidadPdfMake(tipoReporte, firmas) {
    const empresa_id = getEmpresaId();
    const datosFirma = firmas ?? await obtenerDatos(`${CT_URLAPI}listar_firmas_todos_reportes/${tipoReporte}/${empresa_id}`);

    if (!datosFirma || datosFirma.length === 0) {
        return null;
    }

    return () => {
        const contentStack = [];
        const maximo = 4;
        const lnFirmas = datosFirma.length;

        // Procesar las firmas en chunks de máximo 'maximo' por fila
        let firmasProcesadas = 0;
        while (firmasProcesadas < lnFirmas) {
            const firmasRestantes = lnFirmas - firmasProcesadas;
            const cantidadEnFila = Math.min(firmasRestantes, maximo);
            // Obtener el chunk actual de firmas
            const chunk = datosFirma.slice(firmasProcesadas, firmasProcesadas + cantidadEnFila);
            firmasProcesadas += cantidadEnFila;
            // Crear las columnas para el chunk actual
            const columns = chunk.map(lista => {
                const stack = [{
                    text: `${lista.nombre || ""} ${lista.apellido || ""}`,
                    style: "espaciadoTextoVertical",
                }]
                lista.cargo ? stack.push({ text: lista.cargo, bold: true, style: "espaciadoTextoVertical" }) : null;
                lista.matricula || lista.ci ? stack.push({ text: lista.matricula || lista.ci, }) : null;
                return {
                    stack: stack,
                    width: "*",
                    alignment: "center",
                    marginTop: 40
                };
            });
            // Agregar las columnas al stack de contenido
            contentStack.push({
                columns: columns,
                columnGap: 10,
                unbreakable: true
            });
        }

        return {
            stack: contentStack,
            margin: [0, 10, 0, 0],
        };
    }
};


// =========================================================
// FUNCIONALIDADES PARA MANEJO DE REPORTES
// =========================================================

/**
 * Función: Abrir un modal en pantalla completa para visualizar un PDF
 * Descripción: Esta función crea y muestra un modal en pantalla completa que contiene un iframe para visualizar un archivo PDF.
 *              Incluye un cargador mientras se carga el PDF y libera la URL del blob cuando se cierra el modal.
 * Fecha: 28 de enero de 2024
 * Autor: Joel Choque
 */
/**
 * Abrir un modal en pantalla completa para visualizar un PDF
 * @param {string} urlPdf - URL del archivo PDF a visualizar
 * @param {string} tituloModal - Título del modal
 */
function abrirModalPdfFullscreen(urlPdf, tituloModal = "Vista Previa") {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = `
        <div class="modal fade" tabindex="-1">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">${tituloModal}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body p-0 position-relative">
                        <div class="pdf-loader position-absolute top-50 start-50 translate-middle">
                            <div class="spinner-border text-primary"></div>
                        </div>

                        <iframe style="width:100%; height:100%; border:none; display:none;"></iframe>
                    </div>

                </div>
            </div>
        </div>
    `;

    document.body.appendChild(wrapper);

    const modalEl = wrapper.querySelector(".modal");
    const iframe = wrapper.querySelector("iframe");
    const loader = wrapper.querySelector(".pdf-loader");

    // detectar si es blob
    const esBlob = urlPdf.startsWith("blob:");
    iframe.src = urlPdf;
    if (esBlob) {
        iframe.dataset.blobUrl = urlPdf;
    }

    // Evento cuando el iframe ha cargado el PDF
    iframe.onload = () => {
        loader.remove();
        iframe.style.display = "block";
    };

    const modal = new bootstrap.Modal(modalEl);

    modalEl.addEventListener("hide.bs.modal", () => {
        document.activeElement?.blur();
    });

    // Evento cuando se cierra el modal
    modalEl.addEventListener("hidden.bs.modal", () => {
        // Liberar blob URL
        if (iframe.dataset.blobUrl) {
            URL.revokeObjectURL(iframe.dataset.blobUrl);
        }

        iframe.src = "";
        modal.dispose();
        wrapper.remove();
    });

    modal.show();
}

/**
 * Función: Crear opciones de descarga de reporte (PDF y Excel)
 * Descripción: Esta función crea un contenedor con las opciones para descargar el reporte en formato PDF y Excel.
 *              Permite configurar un callback personalizado para la descarga en PDF y Excel.
 * Fecha: 08 de marzo de 2026
 * Autor: Joel Choque
 */
/**
 * Crear opciones de descarga de un reporte (PDF y Excel)
 * @param {OpcionesDescargaReporte} opciones - Objeto con las opciones para la descarga del reporte
 * @returns {HTMLElement} Retorna un elemento HTML con las opciones de descarga
 */
export function opcionesDescargaDeReporte(opciones) {
    const {
        contenedorModal,
        callbackPDF,
        callbackExcel,
    } = opciones;

    const labelPagina = crearElemento("label", { class:"input-group-text", for:"nro_pagina" }, ["Página iniciar en Nº:"]);
    const inputPagina = crearElemento("input", { class:"form-control", id:"nro_pagina", name:"nro_pagina", type:"number", step:"1", placeholder:"Sin N°", min:"0",  style: "max-width: 80px" });
    const groupPagina = crearElemento("div", { class:"input-group input-guoup-sm"}, [labelPagina, inputPagina]);
    const colPagina = crearElemento("div", { class: "col-auto" }, [groupPagina]);

    const iconoDP = crearElemento("i", { class: "bi bi-download me-1" });
    const btnPDF = crearElemento("button", { class: "btn btn-primary", style: "min-width: 100px" }, [iconoDP, " Descargar PDF"]);
    const colPDF = crearElemento("div", { class: "col-auto"}, [btnPDF]);

    const divOpcionesDescarga = crearElemento("div", { class: "row g-1", "data-id": "botones-descarga" }, [colPagina, colPDF]);

    btnPDF.addEventListener("click", async (e) => {
        e.preventDefault();
        const fnBotonInicial = botonEnCarga(btnPDF, undefined, "grow");
        try {
            if (callbackPDF) {
                await callbackPDF(inputPagina.value || false);
                return;
            }

            inputPagina.value = "";
        } catch (error) {
            const modal = modalDeInformacion("Ocurrio un error al generar el PDF", "fs-6 text-danger-emphasis");
            contenedorModal.appendChild(modal);
            modal.querySelector("button[data-id='__btn-cerrar']").focus();
        } finally {
            fnBotonInicial();
        }
    });

    if (callbackExcel) {
        const colExcel = crearElemento("div", { class: "col-auto", "data-id": "botones-de-descarga-xlsx"});
        const boton = botonXlsxConModal(contenedorModal, callbackExcel);
        colExcel.appendChild(boton);
        divOpcionesDescarga.appendChild(colExcel);

    }

    return divOpcionesDescarga;
}

/**
 * Función: Crear un botón para descargar en formato Excel con un modal para seleccionar opciones
 * Descripción: Esta función crea un botón que al ser presionado abre un modal para seleccionar opciones de descarga en formato Excel.
 *              Permite configurar un callback personalizado que se ejecuta al confirmar la descarga.
 * Fecha: 28 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Crear un botón para descargar en formato Excel con un modal para seleccionar opciones
 * @param {HTMLElement} contenedorModal - Contenedor donde se agregará el modal para seleccionar opciones
 * @param {Function} callback - Función que se ejecutará al seleccionar las opciones y confirmar la descarga
 * @returns {HTMLElement} Retorna un elemento HTML con el botón para descargar en formato Excel
 */
function botonXlsxConModal(contenedorModal, callback) {
    const botonXlsx = crearElemento("button", { class: "btn btn-success" }, [crearElemento("i", { class: "bi bi-download me-1" }), " Descargar Excel"]);
    botonXlsx.addEventListener("click", async () => {

        const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal: "Tipo de descarga", estiloModal: "width: 400px;"});
        const [selectEncabezado, divEncabezado] = campoSelect(
            {atributos: {id: "reporte-xlsx-opciones", nombre: "opciones_encabezado"}},
            { contenido: "Reporte" },
        )
        selectEncabezado.innerHTML = `
            <option value="sin-encabezado">Sin encabezado</option>
            <option value="con-encabezado">Con encabezado</option>
        `;
        const botonContinuar = crearElemento("button", { class: "btn btn-primary", type: "submit", style: "min-width: 90px;" }, ["Continuar"]);
        const botonCancelar = crearElemento("button", { class: "btn btn-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 90px;" }, ["Cancelar"]);
        const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-4" }, [botonContinuar, botonCancelar]);
        cuerpoModal.append(divEncabezado, divBotones);

        botonContinuar.addEventListener("click", () => {
            const opcionSeleccionada = selectEncabezado.value;
            const conEncabezado = opcionSeleccionada === "con-encabezado" ? true : false;

            callback(conEncabezado);
            cerrarModal();
        });

        contenedorModal.appendChild(modal);
    });

    return botonXlsx;
}

/**
 * Crear el contenedor principal del reporte
 * @returns {[HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement]} Retorna un arreglo con el contenedor del reporte, el cuerpo del reporte, la sección de botones y la sección del reporte
 */
export function crearContenedorReporte() {
    // Creación de elementos para la sección principal
    const seccionBotones = crearElemento("div", { class: "mb-4 px-4" });
    const cuerpoReporte = crearElemento("div", { class: "af-seccion" });
    const divCuerpoReporte = crearElemento("div", { style: "min-width:600px" }, [cuerpoReporte]);
    const seccionReporte = crearElemento("div", { class: "px-4 overflow-auto ct-md-mw-none" }, [divCuerpoReporte]);
    const contenedorReporte = crearElemento("div", { class: "overflow-auto" }, [seccionBotones, seccionReporte]);

    return [contenedorReporte, cuerpoReporte, seccionBotones, seccionReporte];
}

/**
 * Verificar si hay datos para generar el reporte
 * @param {Array} registros - Arreglo con los registros del reporte
 * @returns {{error: boolean, mensaje?: string}} Retorna un objeto con el resultado de la verificación
 */
export function verificarDatosReporte(registros){
    if (!registros) {
        return {
            error: true,
            mensaje: `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`
        };
    }
    if (registros.length === 0) {
        return {
            error: true,
            mensaje: `<div class="py-5 fw-bold text-center fs-6">No se encontraron datos para mostrar</div>`
        };
    }
    return { error: false };
}

/**
 * Función: Generar un modal para configurar la numeración de páginas y generar un PDF utilizando pdfMake
 * Descripción: Esta función genera un modal que permite al usuario configurar la numeración de páginas para un documento PDF.
 *              Al confirmar, se obtiene el contenido para el PDF, el cual se muestra en un modal en pantalla completa.
 *              También permite personalizar el contenido agregando un encabezado y/o definiendo la configuración del documento PDF.
 * Fecha: 07 de febrero de 2026
 * Autor: Joel Choque
 */
function generarPdfMake(opciones) {
    const {
        contenedorModal,
        obtenerContenido,
        configuracionPdfMake,
        conEncabezado,
        tituloModal,
    } = opciones;

    const fragment = document.createDocumentFragment();
    const span = crearElemento("i", undefined, ["(Solo si desea generar con numeración de página)"]);
    fragment.append("Página de Inicio ", span, ": ");

    const divInfo = crearElemento("div");

    const [modal, cuerpoModal, cerrarModal] = modalRemovible({tituloModal, estiloModal: "width: 400px;"});
    const [inputNumeracion, divNumeracion] = campoInput(
        { atributos: { type: "number", id: "pdfMake-numeracion", nombre: "numeracion", min: "0", placeholder: "Sín Numeración" } },
        { contenido: fragment },
    );

    const botonContinuar = crearElemento("button", { class: "btn btn-primary", type: "submit", style: "min-width: 90px;" }, ["Continuar"]);
    const botonCancelar = crearElemento("button", { class: "btn btn-outline-secondary", type: "button", "data-id": "__opcion-cierre-externo", style: "min-width: 90px;" }, ["Cancelar"]);
    const divBotones = crearElemento("div", { class: "d-grid gap-2 d-sm-flex justify-content-sm-center mt-4" }, [botonContinuar, botonCancelar]);
    cuerpoModal.append(divInfo, divNumeracion, divBotones);

    botonContinuar.addEventListener("click", async () => {
        divInfo.innerHTML = "";
        const fnBotonInicial = botonEnCarga(botonContinuar);

        try {
            const numeracion = inputNumeracion.value;
            const contenido = typeof(obtenerContenido) === "function" ? await obtenerContenido() : obtenerContenido;
            if (conEncabezado){
                contenido.unshift(...contenidoConEncabezadoPdfMake());
            }

            await defDocumentoPdfMake({
                numeroPieDePagina: numeracion,
                contenido: contenido,
                ...configuracionPdfMake
            });
            cerrarModal();
        } catch (error) {
            // console.log(error);
            fnBotonInicial();
            divInfo.innerHTML = `<div class="text-danger mb-3"> <i class="bi bi-exclamation-triangle-fill pe-1"></i> Ocurrio un error al generar el PDF</div>`;
        }
    });

    contenedorModal.appendChild(modal);
    botonContinuar.focus();
}
/**
 * Función: Crear un botón abrir una vista previa en PDF utilizando pdfMake con confirmación de 'Numeracion de Página'
 * Descripción: Esta función crea un botón que al ser presionado genera un documento PDF utilizando la biblioteca pdfMake.
 *              Permite configurar opciones para el modal, obtener el contenido del PDF y definir la configuración del documento.
 * Fecha: 07 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Crear un botón para vista previa en PDF utilizando pdfMake con confirmación de 'Numeracion de Página'
 * @param {OpcionesBotonIconoReporte} opciones - Objeto con las opciones para configurar el botón de vista previa
 * @returns {HTMLElement} Retorna un elemento HTML con el botón para vista previa en PDF
 */
export function crearBotonIconoPdfMake(opciones) {
    const {
        contenedorModal,
        obtenerContenido,
        configuracionPdfMake,
        conEncabezado = true,
        tituloBoton = "Vista Previa",
        tituloModal = "Cargar Documento",
    } = opciones;

    const icono = crearElemento("i", { class: "bi bi-file-earmark-pdf" });
    const boton = crearElemento("button", { class: "btn btn-primary btn-sm", title: tituloBoton }, [icono]);
    boton.addEventListener("click", async () => {
        generarPdfMake({
            contenedorModal,
            obtenerContenido,
            configuracionPdfMake,
            conEncabezado,
            tituloModal,
        })
    });

    return boton;
}

/**
 * Función: Crear un botón con ícono y texto para abrir una vista previa en PDF utilizando pdfMake con confirmación de 'Numeracion de Página'
 * Descripción: Esta función crea un botón que incluye un ícono y texto, y al ser presionado genera un documento PDF utilizando la biblioteca pdfMake.
 *              Permite configurar opciones para el modal, obtener el contenido del PDF, definir la configuración del documento y personalizar el texto e ícono del botón.
 * Fecha: 12 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Crear un botón con ícono y texto para vista previa en PDF utilizando pdfMake con confirmación de 'Numeracion de Página'
 * @param {OpcionesBotonReporte} opciones - Objeto con las opciones para configurar el botón de vista previa
 * @returns {HTMLElement} Retorna un elemento HTML con el botón para vista previa en PDF
 */
export function crearBotonReportePdfMake(opciones) {
    const {
        contenedorModal,
        obtenerContenido,
        configuracionPdfMake,
        conEncabezado = true,
        tituloModal = "Cargar Documento",
        botonId = "__reporte",
        botonTitulo,
        botonTexto = "Reporte",
        botonIcono = "bi bi-file-earmark-pdf",
        botonClases = "btn btn-primary btn-sm h-100",

    } = opciones;

    const icono = crearElemento("i", { class: botonIcono });
    const boton = crearElemento("button", { class: botonClases, id: botonId }, [icono]);
    if (botonTexto) {
        icono.classList.add("pe-1");
        boton.append(botonTexto);
    } else if (botonTitulo) {
        boton.setAttribute("title", botonTitulo);
    }
    boton.addEventListener("click", async () => {
        generarPdfMake({
            contenedorModal,
            obtenerContenido,
            configuracionPdfMake,
            conEncabezado,
            tituloModal,
        })
    });

    return boton;
}

