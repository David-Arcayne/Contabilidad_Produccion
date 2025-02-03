import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { AbrirUnMenu, cambiarVista, crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { optnsCobrar, optnsPagar } from "../Formularios.js";
import { FacturaCompra } from "./FacturaCompra.js";
import { FacturaVenta } from "./FacturaVenta.js";

/**
 * Opciones de registro para transacciones.
 * @param {HTMLElement} vista - Elemento contenedor de la vista.
 * @param {function} recargarNT - Función para recargar el número de transacción.
 * @returns {HTMLElement} Elemento con las opciones de registro.
 */
export const OpcionesRegistro = (vista, recargarNT) => {
    const btn = crearElemento("button", { class: "btn btn-dark btn-sm" }, ["Registro normal"]);
    const btnNT = crearElemento("button", { class: "btn btn-outline-dark btn-sm" }, ["Insertar abajo de"]);
    const div = crearElemento("div", { class: "text-start" }, [btn, " ",btnNT]);

    // Evento para inhabilitar el campo de código
    btn.addEventListener("click", () => {
        btn.setAttribute("class", "btn btn-dark btn-sm");
        btnNT.setAttribute("class", "btn btn-outline-dark btn-sm");
        const codigo = vista.querySelector("#transaccion_codigo");
        codigo.setAttribute("readonly", true);
        recargarNT();
    });
    // Evento para habilitar el campo de código
    btnNT.addEventListener("click", () => {
        btnNT.setAttribute("class", "btn btn-dark btn-sm");
        btn.setAttribute("class", "btn btn-outline-dark btn-sm");
        const codigo = vista.querySelector("#transaccion_codigo");
        codigo.removeAttribute("readonly");
    });
    
    return div;
}

/**
 * Opciones de registro para transacciones en detalle.
 * @param {HTMLElement} vistaRN - Elemento contenedor de la vista de registro normal.
 * @param {HTMLElement} vistaRAM - Elemento contenedor de la vista de asiento modelo.
 * @returns {HTMLElement} Elemento con las opciones de registro.
 */
export const OpcionesRegistroDetalle = (vistaRN, vistaRAM) => {
    const btn = crearElemento("button", { class: "btn btn-dark btn-sm" }, ["Registro normal"]);
    const btnAM = crearElemento("button", { class: "btn btn-outline-dark btn-sm" }, ["Asiento modelo"]);
    const div = crearElemento("div", { class: "text-start" }, [btn, " ",btnAM]);

    btn.addEventListener("click", () => {
        btn.setAttribute("class", "btn btn-dark btn-sm");
        btnAM.setAttribute("class", "btn btn-outline-dark btn-sm");
        cambiarVista(vistaRAM, vistaRN);
    });

    btnAM.addEventListener("click", () => {
        btnAM.setAttribute("class", "btn btn-dark btn-sm");
        btn.setAttribute("class", "btn btn-outline-dark btn-sm");
        cambiarVista(vistaRN, vistaRAM);
    });
    
    return div;
}

/**
 * Duplicar un registro de transacción.
 * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla.
 * @param {string} referencias.url_d - URL para duplicar un registro.
 * @param {string} referencias.URL_LT - URL para obtener la lista de transacciones.
 * @param {HTMLElement} referencias.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} referencias.contenedorDeAlertas - Elemento contenedor de las alertas.
 * @param {Object} referencias.estiloTd - Estilos para las celdas de la tabla.
 * @returns {function} Función para duplicar un registro.
 */
export const Duplicar = ({url_d, URL_LT, vistaPrincipal, contenedorDeAlertas, estiloTd}) => ({elemento, registro, contenidoTabla, tbody}) => {
    const confirmar = async () => {
        const resultado = await obtenerDatos(`${url_d}${registro.id}`);
        if (resultado) {
            alertaDeExito(contenedorDeAlertas, "Registro duplicado exitosamente");
            const listaDeRegistros = await obtenerDatos(URL_LT);
            if (listaDeRegistros) {
                contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody);
            }
        } else {
            alertaDeError(contenedorDeAlertas, "Error al duplicar registro");
        }
    }
    vistaPrincipal.append(modalDeConfirmacion(confirmar, "¿Desea duplicar la transacción?"));
}

/**
 * Cambiar el color de la fila de la tabla según los montos de la transacción.
 * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla.
 * @param {HTMLElement} referencias.elemento - Elemento que disparo el evento.
 * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Transacción.
 * @returns
 */
export const ColorFila = ({elemento, registro}) => {
    elemento.textContent = registro.ntransaccion;
    if (registro.detalle && registro.detalle.length > 0) {
        let debe = 0;
        let haber = 0;
        for (const dh of registro.detalle) {
            debe += parseFloat(dh.debe);
            haber += parseFloat(dh.haber);
        }
        debe = debe.toFixed(2);
        haber = haber.toFixed(2);
        const tr = elemento.closest("tr");
        if (debe !== haber) {
            tr.classList.add("table-danger");
        }
    }
}

/**
 * Calcula los montos de la transacción y muestra si cuadra o no.
 * @param {HTMLElement} vista - Elemento contenedor de la vista Detalle transaccion.
 * @param {HTMLElement} trPadre - Elemento "tr" de la tabla detalle transacción.
 * @returns {function} Función para calcular
 */
export const CalculoDetalle = (vista, trPadre) => (datos) => {
    const tdD = vista.querySelector(`#td_det_tran_total_debe`);
    const tBody = tdD.closest("tbody");
    const trInfo = tBody.querySelector("#tr_det_tran_info");
    const tdH = tBody.querySelector(`#td_det_tran_total_haber`);

    // Si no hay registros en la tabla
    const countTbody = tBody.childElementCount;
    if ((trInfo && tdD && countTbody === 2) || (!trInfo && tdD && countTbody === 1)) {
        const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
        const tr = crearElemento("tr", undefined, [td]);
        tBody.replaceChildren(tr);
        trPadre.classList.remove("table-danger");
        const btnCD = trPadre.querySelector("a[title='Consolidar']") || trPadre.querySelector("a[title='Desconsolidar']");
        if (btnCD) {
            btnCD.style.display = "";
        }
        return;
    }

    // Obteniendo los montos de la transacción.
    const debe = parseFloat(datos.debe);
    const haber = parseFloat(datos.haber);
    const totalD = parseFloat(tdD.textContent?.replace(",", ""));
    const totalH = parseFloat(tdH.textContent?.replace(",", ""));
    const nuevoTD = (totalD - debe).toFixed(2);
    const nuevoTH = (totalH - haber).toFixed(2);
    tdD.textContent = nuevoTD;
    tdH.textContent = nuevoTH;
    if (nuevoTD === nuevoTH) {
        // Si cuadra la transacción se elimina la fila de información.
        if (trInfo) {
            trInfo.remove();
            tdD.closest("tr").setAttribute("class", "table-secondary");
            trPadre.classList.remove("table-danger");
            const btnCD = trPadre.querySelector("a[title='Consolidar']") || trPadre.querySelector("a[title='Desconsolidar']");
            if (btnCD) {
                btnCD.style.display = "";
            }
        }
    } else {
        if (trInfo) {
            // Si no cuadra la transacción y ya existe la fila de información se actualizan los montos.
            const tdD = tBody.querySelector(`#td_det_tran_info_debe`);
            const tdH = tBody.querySelector(`#td_det_tran_info_haber`);
            tdD.textContent = (nuevoTH - nuevoTD).toFixed(2);
            tdH.textContent = (nuevoTD - nuevoTH).toFixed(2);
        } else {
            // si no cuadra la transacción y no existe la fila de información se crea.
            const td = crearElemento("td", { class: "text-end text-danger", colspan: "2" }, ["No cuadra"]);
            const tdDebe = crearElemento("td", { class: "text-end text-danger", id: "td_det_tran_info_debe" }, [(nuevoTH - nuevoTD).toFixed(2)]);
            const tdHaber = crearElemento("td", { class: "text-end text-danger", id: "td_det_tran_info_haber" }, [(nuevoTD - nuevoTH).toFixed(2)]);
            const tdr = crearElemento("td", { colspan: "2" });
            const rowInfo = crearElemento("tr", { class: "table-danger", id: "tr_det_tran_info" }, [td, tdDebe, tdHaber, tdr]);
            tBody.append(rowInfo);
            tdD.closest("tr").setAttribute("class", "table-danger");
            trPadre.classList.add("table-danger");
            const btnCD = trPadre.querySelector("a[title='Consolidar']") || trPadre.querySelector("a[title='Desconsolidar']");
            if (btnCD) {
                btnCD.style.display = "none";
            }
        }
    }
}

/**
 * Muestra el monto y el botón para crear una factura de venta.
 * @param {HTMLElement} vistaDetalle - Elemento contenedor de la vista Detalle transacción.
 * @param {HTMLElement} vistaTranFactura - Elemento contenedor de la vista Transacción Factura.
 * @param {Object} permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @param {Object.<string,string>} registroTr - Objeto con los datos de la Transacción.
 * @returns {function} Función para mostrar el monto y el botón.
 */
export const TrDebe = (vistaDetalle, vistaTranFactura, permisos, registroTr) => ({elemento, registro}) => {
    elemento.classList.add("text-nowrap");
    const icono = crearElemento("i", {class: "bi bi-receipt"});
    const btnFactura = crearElemento("button", {class: "btn btn-primary btn-sm ms-3", title: "Crear factura venta"}, [icono]);
    const montoDebe = Number(registro.debe).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const span = crearElemento("span", undefined, [montoDebe]);
    elemento.replaceChildren(span, " ", btnFactura);

    const vistaFactura = FacturaVenta({vistaDetalle, vistaTranFactura, permisos, registroTr});
    btnFactura.addEventListener("click", () => {
        vistaFactura({registro});
    });
}

/**
 * Muestra el monto y el botón para crear una factura de compra y crea la fila de totales.
 * @param {HTMLElement} vistaDetalle - Elemento contenedor de la vista Detalle transacción.
 * @param {HTMLElement} vistaTranFactura - Elemento contenedor de la vista Transacción Factura.
 * @param {Object} permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @param {Object.<string,string>} registroTr - Objeto con los datos de la Transacción.
 * @param {HTMLElement} trPadre - Elemento "tr" de la tabla transacción.
 * @returns {function} Función para mostrar el monto y el botón.
 */
export const TrHaber = (vistaDetalle, vistaTranFactura, permisos, registroTr, trPadre) => ({elemento, registro, arrayT}) => {
    elemento.classList.add("text-nowrap");
    const icono = crearElemento("i", {class: "bi bi-receipt"});
    const btnFactura = crearElemento("button", {class: "btn btn-primary btn-sm ms-3", title: "Crear factura compra"}, [icono]);
    const montoHaber = Number(registro.haber).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const span = crearElemento("span", undefined, [montoHaber]);
    elemento.replaceChildren(span, " ", btnFactura);

    // Crear la vista de la factura de compra
    const vistaFactura = FacturaCompra({vistaDetalle, vistaTranFactura, permisos, registroTr});
    btnFactura.addEventListener("click", () => {
        vistaFactura({registro});
    });

    // Crear la fila de totales
    const strDebe = parseFloat(registro.debe).toFixed(2);
    const strHaber = parseFloat(registro.haber).toFixed(2);
    const debe = parseFloat(strDebe);
    const haber = parseFloat(strHaber);
    if (arrayT.length > 0) {
        arrayT[1] += debe;
        arrayT[2] += haber;
    } else {
        // Función para crear la fila de totales
        const row = (totalDebe, totalHaber) => {
            const debe = totalDebe.toFixed(2);
            const haber = totalHaber.toFixed(2);
            let colorT = "table-secondary";
            let rowInfo;
            if (debe !== haber) {
                // Si no cuadra la transacción se crea la fila de información.
                colorT = "table-danger";
                const td = crearElemento("td", { class: "text-end text-danger", colspan: "2" }, ["No cuadra"]);
                const tdDebe = crearElemento("td", { class: "text-end text-danger", id: "td_det_tran_info_debe" }, [(totalHaber - totalDebe).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})]);
                const tdHaber = crearElemento("td", { class: "text-end text-danger", id: "td_det_tran_info_haber" }, [(totalDebe - totalHaber).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})]);
                const tdr = crearElemento("td", { colspan: "2" });
                rowInfo = crearElemento("tr", { class: colorT, id: "tr_det_tran_info" }, [td, tdDebe, tdHaber, tdr]);
            } 
            // Crear la fila de totales
            const td = crearElemento("td", { class: "text-end fw-bold", colspan: "2" }, ["TOTALES:"]);
            const tdDebe = crearElemento("td", { class: "text-end fw-bold", id: "td_det_tran_total_debe" }, [totalDebe.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})]);
            const tdHaber = crearElemento("td", { class: "text-end fw-bold", id: "td_det_tran_total_haber" }, [totalHaber.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})]);
            const tdr = crearElemento("td", { colspan: "2" });
            const rowTotal = crearElemento("tr", { class: colorT }, [td, tdDebe, tdHaber, tdr]);

            if (rowInfo) {
                trPadre.classList.add("table-danger");
                const btnCD = trPadre.querySelector("a[title='Consolidar']") || trPadre.querySelector("a[title='Desconsolidar']");
                if (btnCD) {
                    btnCD.style.display = "none";
                }
                return [rowTotal, rowInfo];
            } else {
                trPadre.classList.remove("table-danger");
                const btnCD = trPadre.querySelector("a[title='Consolidar']") || trPadre.querySelector("a[title='Desconsolidar']");
                if (btnCD) {
                    btnCD.style.display = "";
                }
                return [rowTotal];
            }
            // return rowInfo ? [rowTotal, rowInfo] : [rowTotal];
        }
        arrayT.push(row, debe, haber);
    }
}

/**
 * Muestra el nombre del estado de la factura.
 * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla.
 * @param {HTMLElement} referencias.elemento - Elemento "td" de la tabla.
 * @param {Object.<string,string>} referencias.registro - Objeto con los datos de la factura.
 * @returns
 */
export const NombreEstado = ({elemento, registro}) => {
    if (registro.cobrado !== "0") {
        for (const dato of optnsCobrar) {
            if (dato.clave == registro.cobrado) {
                elemento.textContent = dato.valor;
                break;
            }        
        }
    } else {
        for (const dato of optnsPagar) {
            if (dato.clave == registro.pagado) {
                elemento.textContent = dato.valor;
                break;
            }        
        }
    }
}

/**
 * Muestra el monto de la factura y crea la fila de totales.
 * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla.
 * @param {HTMLElement} referencias.elemento - Elemento "td" de la tabla.
 * @param {Object.<string,string>} referencias.registro - Objeto con los datos de la factura.
 * @param {Array} referencias.arrayT - Arreglo con los datos de la fila de totales.
 * @returns
 */
export const MontoFactura = ({elemento, registro, arrayT}) => {
    const strDecimal = parseFloat(registro.montofactura).toFixed(2);
    const numeroDecimal = parseFloat(strDecimal);
    if (arrayT.length > 0) {
        arrayT[1] += numeroDecimal;
    } else {
        // Función para crear la fila de totales
        const row = (montoTotal) => {
            const td = crearElemento("td", {colspan: "4", class: "text-end fw-bold"}, ["Total:"]);
            const montoT = montoTotal.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const tdTotal = crearElemento("td", {class: "text-end fw-bold", id: "td_det_tr_factura_total"}, [montoT]);
            const tdr = crearElemento("td", { colspan: "2" });
            const row = crearElemento("tr", undefined, [td, tdTotal, tdr]);
            return [row];
        }
        arrayT.push(row, numeroDecimal);
    }
    elemento.textContent = numeroDecimal.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

/**
 * Botón para abrir el modal del scanner.
 * @param {HTMLElement} modalScanner - Elemento modal del scanner.
 * @returns {HTMLElement} Elemento botón para abrir el scanner.
 */
export const BtnAbrirScanner = (modalScanner) => {
    const iconoBtn = crearElemento("i", {class: "bi bi-qr-code-scan me-1"});
    const btn = crearElemento("button", {class: "btn btn-primary btn-sm h-100"}, [iconoBtn, " Leer QR"]);
    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const modal = new bootstrap.Modal(modalScanner);
        modal.show();
    });

    return btn;
}

/**
 * Acción para rellenar el formulario de venta con los datos del QR.
 * @param {string} qrCodeMessage - Resultado del código QR.
 * @param {Object} opciones - Opciones para rellenar el formulario.
 * @param {HTMLElement} opciones.vform - Elemento formulario de venta.
 * @param {HTMLElement} opciones.resultado - Elemento para mostrar el resultado.
 * @param {function} opciones.accion - Función a ejecutar después de rellenar el formulario.
 * @param {HTMLElement} modalScanner - Elemento modal del scanner.
 * @returns
 */
export const RellenarFormularioVenta = (qrCodeMessage, opciones, modalScanner) => {
    const parametros = ObtenerParametrosURL(qrCodeMessage);
    
    // const nit = "12312dfdfd3"; const cuf = "123456789"; const numero = "123456";
    const nit = parametros["nit"];
    const cuf = parametros["cuf"];
    const numero = parametros["numero"];
    const vform = opciones.vform;

    if (nit && cuf && numero) {
        const modal = bootstrap.Modal.getInstance(modalScanner);
        modal.hide();
        const nfactura = vform.querySelector("#trandetallefventa_nfactura");
        const nautorizacion = vform.querySelector("#trandetallefventa_nautorizacion");
        const cliente = vform.querySelector("#trandetallefventa_cliente");
        const clienteS = $(cliente)[0].selectize;

        nfactura.value = numero;
        nautorizacion.value = cuf;
        clienteS?.setTextboxValue(nit);
        opciones.accion();
        clienteS?.open();
        if(clienteS) {
            // Se espera a que se carguen las opciones del selectize.
            setTimeout(() => {
                const opcionesFiltradas = clienteS.$dropdown_content.find('[data-value]:visible');
                if (opcionesFiltradas.length > 0) {
                    // Si se encuentra una sola opción se selecciona automáticamente.
                    if (opcionesFiltradas.length === 1) {
                        const primeraOpcion = $(opcionesFiltradas[0]).attr('data-value');
                        clienteS.setValue(primeraOpcion);
                    } else {
                        console.log('Se encontraron varias opciones');
                    }
                } else {
                    // Si no se encuentra el cliente se abre la ventana de Clientes con su formulario de registro.
                    const menuCliente = AbrirUnMenu("clientes");
                    if (menuCliente) {
                        if (menuCliente.permiso[1] === "1") {
                            const vistaPrincipal = document.querySelector(`.p-2[data-value="${menuCliente.codigo}"] .card-body #contenedor-cabecera`);
                            const vistaRegistrar = document.querySelector(`.p-2[data-value="${menuCliente.codigo}"] .card-body #contenedor-formulario`);
                            const observador = new MutationObserver(function(mutationsList, observer) {
                                mutationsList.forEach(mutation => {
                                    if (mutation.type === 'childList') {
                                        vistaPrincipal.classList.add("d-none");
                                        vistaRegistrar.classList.remove("d-none");
                                        observer.disconnect();
                                    }
                                });
                            });
                            observador.observe(vistaRegistrar, {childList: true});
                        }
                    } else {
                        console.log("error al abrir");
                    }
                }
            }, 500); 
        }
    } else {
        opciones.resultado.classList.remove("d-none");
        opciones.resultado.innerHTML = `QR: ${qrCodeMessage}`;
    }
}

/**
 * Acción para rellenar el formulario de compra con los datos del QR.
 * @param {string} qrCodeMessage - Resultado del código QR.
 * @param {Object} opciones - Opciones para rellenar el formulario.
 * @param {HTMLElement} opciones.vform - Elemento formulario de compra.
 * @param {HTMLElement} opciones.resultado - Elemento para mostrar el resultado.
 * @param {function} opciones.accion - Función a ejecutar después de rellenar el formulario.
 * @param {HTMLElement} modalScanner - Elemento modal del scanner.
 * @returns
 */
export const RellenarFormularioCompra = (qrCodeMessage, opciones, modalScanner) => {
    const parametros = ObtenerParametrosURL(qrCodeMessage);
    
    const nit = parametros["nit"];
    const cuf = parametros["cuf"];
    const numero = parametros["numero"];
    // // const nit = "123123";
    // const nit = "12312dfdfd3"; const cuf = "123456789"; const numero = "123456";
    const vform = opciones.vform;

    if (nit && cuf && numero) {
        const modal = bootstrap.Modal.getInstance(modalScanner);
        modal.hide();
        const nfactura = vform.querySelector("#trandetallefcompra_nfactura");
        const nautorizacion = vform.querySelector("#trandetallefcompra_nautorizacion");
        const cliente = vform.querySelector("#trandetallefcompra_proveedor");
        const clienteS = $(cliente)[0].selectize;
        
        nfactura.value = numero;
        nautorizacion.value = cuf;
        clienteS?.setTextboxValue(nit);
        opciones.accion();
        clienteS?.open();
        
        if(clienteS) {
            // Se espera a que se carguen las opciones del selectize.
            setTimeout(() => {
                const opcionesFiltradas = clienteS.$dropdown_content.find('[data-value]:visible');
            
                if (opcionesFiltradas.length > 0) {
                    // Si se encuentra una sola opción se selecciona automáticamente.
                    if (opcionesFiltradas.length === 1) {
                        const primeraOpcion = $(opcionesFiltradas[0]).attr('data-value');
                        clienteS.setValue(primeraOpcion);
                    } else {
                        console.log('Se encontraron varias opciones');
                    }
                } else {
                    // Si no se encuentra el proveedor se abre la ventana de Proveedores con su formulario de registro.
                    const menuProv = AbrirUnMenu("proveedores");
                    if (menuProv) {
                        if (menuProv.permiso[1] === "1") {
                            const vistaPrincipal = document.querySelector(`.p-2[data-value="${menuProv.codigo}"] .card-body #contenedor-cabecera`);
                            const vistaRegistrar = document.querySelector(`.p-2[data-value="${menuProv.codigo}"] .card-body #contenedor-formulario`);
                            const observador = new MutationObserver(function(mutationsList, observer) {
                                mutationsList.forEach(mutation => {
                                    if (mutation.type === 'childList') {
                                        vistaPrincipal.classList.add("d-none");
                                        vistaRegistrar.classList.remove("d-none");
                                        observer.disconnect();
                                    }
                                });
                            });
                            observador.observe(vistaRegistrar, {childList: true});
                        }
                    } else {
                        console.log("error al abrir");
                    }
                }
            }, 500); 
        }
    } else {
        opciones.resultado.classList.remove("d-none");
        opciones.resultado.innerHTML = `QR: ${qrCodeMessage}`;
    }
}

/**
 * Obtiene los parámetros de la URL obtenida por el lector QR.
 * @param {string} url - URL obtenida por el lector QR.
 * @returns {Object} Objeto con los parámetros de la URL.
 */
function ObtenerParametrosURL(url) {
    // Divide la URL en base al símbolo '?'
    const partes = url.split('?');
    if (partes.length < 2) {
        return {};
    }
    const queryString = partes[1];
    const pares = queryString.split('&');
    // Crea un objeto para almacenar los parámetros
    const parametros = {};
    pares.forEach(par => {
        const [clave, valor] = par.split('=');
        parametros[clave] = valor;
    });
    
    return parametros;
}