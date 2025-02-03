import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, BuscarEnTablaOpts, cambiarVista, crearElemento, encabezadoVista, InputBusquedaPlus, opciones } from "../../funciones/Funciones.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { BtnVistaPrevia, VistaPDF } from "../../funciones/VistaPDF.js";
import { Cobrados } from "./Funcionalidades/Cobrados.js";
import { CobrarFactura } from "./Funcionalidades/CobrarFactura.js";
import { CobroMultiple } from "./Funcionalidades/CobroMultiple.js";
import { NuevaFactura } from "./Funcionalidades/NuevaFactura.js";
import { NuevoRecibo } from "./Funcionalidades/NuevoRecibo.js";
import { VPCobros } from "./Funcionalidades/VPCobros.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function FacturasCobrar(codigo, permisos, subVistaFacturas, menuInicio) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal;
    const URL_LT = `${URL}listacobrarfactura/${sucursal_id}`;

    // Creación de Vistas para la navegación en la ventana
    // const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    // const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    // vistaRegistrar.setAttribute("class", "d-none");

    const regresar = () => { cambiarVista(subVistaFacturas, menuInicio) };
    const tituloVista = encabezadoVista("Volver", "Cobrar Facturas", regresar, undefined)
    const vistaPrincipal = crearElemento("div", { class: "d-block" }, [tituloVista]);

    const vistaCobrados = crearElemento("div", { class: "d-none" });
    const vistaDetalleC = crearElemento("div", { class: "d-none" });
    const vistaCobrar = crearElemento("div", { class: "d-none" });
    const vistaNuevaFactura = crearElemento("div", { class: "d-none", "data-info": "Nueva Factura" });
    const vistaNuevoRecibo = crearElemento("div", { class: "d-none", "data-info": "Nuevo Recibo" });
    const vistaCobroMultiple = crearElemento("div", { class: "d-none", "data-info": "Cobro Multiple" });
   
    const contenedorPrincipal = subVistaFacturas;
    contenedorPrincipal.append(vistaPrincipal, vistaCobrados, vistaDetalleC, vistaCobrar, vistaNuevaFactura, vistaNuevoRecibo, vistaCobroMultiple);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    const encabezadoTabla = [
        "#",
        "Fecha",
        "Factura",
        "#Trans.",
        "Cliente",
        "Monto Factura",
        "Monto Cobrado",
        "Saldo",
        "Opciones",
    ];
    const estiloTd = [
        "contador",
        "date",
        "text-start",
        "text-start",
        "text-start",
        "text-end",
        // "decimal",
        "decimal",
        "decimal",
        "text-start",
    ];
    const contenidoTabla = [
        "js-cont",
        "fecha",
        "numero",
        "codigo",
        "nombrep",
        {
            nombre: "monto",
            agregarT: MontoFactura,
        },
        "pagado",
        "saldo",
        {
            nombre: "Opciones",
            accion: {
                accion: CobrarFactura({ vistaPrincipal, vistaCobrar, permisos, estiloFxC: estiloTd, URL_LT_FXC: URL_LT }),
                icono: "bi bi-cash",
                classElemento: "btn btn-primary btn-sm",
                // titulo: "Imagenes",
                texto: "Cobrar",
            },
        },
    ];
    const l_ct = contenidoTabla.length -1;
    if (permisos.editar === "0" && permisos.eliminar === "0") {
        encabezadoTabla.pop();
        contenidoTabla.pop();
    } else if (permisos.editar === "0") {
        delete contenidoTabla[l_ct].usarBasicos.editar;
    } else if (permisos.eliminar === "0"){
        delete contenidoTabla[l_ct].usarBasicos.eliminar;
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    if (permisos.escritura === "1") {
        const vCobrados = Cobrados({vistaPrincipal, vistaCobrados, vistaDetalleC, permisos, estiloFxC: estiloTd, URL_LT_FXC: URL_LT, ctFxC:contenidoTabla, tbFxC:tBody });
        const listaCobrados = () => {
            cambiarVista(vistaPrincipal, vistaCobrados);
            vCobrados();
        }
        
        const elementosModal = VistaPDF("Cobros", {nombrePDF: "cobros"});

        const opcionesBtns = opciones([
            btnNuevoRegistro(listaCobrados, "Lista cobrados", "list-check"),
            btnNuevoRegistro(()=> cambiarVista(vistaPrincipal, vistaNuevaFactura), "Nueva Factura", "file-earmark-plus"),
            // btnNuevoRegistro(()=> cambiarVista(vistaPrincipal, vistaNuevoRecibo), "Nuevo Recibo", "card-list"),
            btnNuevoRegistro(() => SoloCobros(vistaPrincipal, URL_LT, contenedorDeAlertas, elementosModal), "Lista Cobros", "file-earmark-pdf"),
            btnNuevoRegistro(()=> cambiarVista(vistaPrincipal, vistaCobroMultiple), "Cobrar", "cash-stack"),
            // btnVistaPrevia,
        ]); 
        vistaPrincipal.appendChild(opcionesBtns);
    }
    
    const divFiltros = InputsFecha(tabla);
    vistaPrincipal.append(divFiltros, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => {
        const nuevoRegistro = registros.filter(registro => Number(registro.saldo.toFixed(2)) !== 0);
        contenidoTBody(nuevoRegistro, {contenido: contenidoTabla, estiloTd}, tBody);
    };
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });


    NuevaFactura(codigo, permisos, { vistaFxC: vistaPrincipal, vistaNuevaFactura})
    // NuevoRecibo(codigo, permisos, { vistaFxC: vistaPrincipal, vistaNuevoRecibo})
    CobroMultiple(codigo, permisos, { vistaFxC: vistaPrincipal, vistaCobroMultiple})
}

export const MontoFactura = ({elemento, registro, arrayT}) => {
    const strMontoF = parseFloat(registro.monto ?? 0).toFixed(2);
    const strMontoC = parseFloat(registro.pagado ?? 0).toFixed(2);
    const strMontoS = parseFloat(registro.saldo ?? 0).toFixed(2);
    const montoFactura = parseFloat(strMontoF);
    const montoCobrado = parseFloat(strMontoC);
    const montoSaldo = parseFloat(strMontoS);
    if (arrayT.length > 0) {
        arrayT[1] += montoFactura;
        arrayT[2] += montoCobrado;
        arrayT[3] += montoSaldo;
    } else {
        const row = (montoFT, montoCT, montoST) => {
            const td = crearElemento("td", {colspan: "5", class: "text-end fw-bold"}, ["Total:"]);
            const montoTF = montoFT.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const montoTC = montoCT.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const montoTS = montoST.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const tdFactura = crearElemento("td", {class: "text-end fw-bold", id: "td_det_tr_factura_total"}, [montoTF]);
            const tdCobrado = crearElemento("td", {class: "text-end fw-bold"}, [montoTC]);
            const tdSaldo = crearElemento("td", {class: "text-end fw-bold"}, [montoTS]);
            const tdr = crearElemento("td");
            const row = crearElemento("tr", {class: "totales"}, [td, tdFactura, tdCobrado, tdSaldo, tdr]);
            return [row];
        }
        arrayT.push(row, montoFactura, montoCobrado, montoSaldo);
    }
    elemento.textContent = montoFactura.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

export const InputsFecha = (tabla) => {
    const elementoBuscar = InputBusquedaPlus(tabla.querySelector("table"), undefined, {colSumar: [5, 6, 7], colTotal: [1,2,3]});
    const inputBuscar = elementoBuscar.querySelector("input");

    const dia = crearElemento("input", { type: "number", class: "form-control", id: "dia", placeholder: "Día", min: "1", max: "31", style: "font-size: 0.75rem;" });
    const mes = crearElemento("input", { type: "number", class: "form-control", id: "mes", placeholder: "Mes", min: "1", max: "12", style: "font-size: 0.75rem;" });
    const anio = crearElemento("input", { type: "number", class: "form-control", id: "anio", placeholder: "Año", max: "2500", style: "font-size: 0.75rem;" });
    const hiddenDate = crearElemento("input", { type: "hidden", id: "fecha" });
    const divFecha = crearElemento("div", { class: "input-group col-12 col-md-auto" }, [dia, mes, anio]);
    const row = crearElemento("div", { class: "form col-auto p-0 me-sm-2" }, [divFecha]);

    BuscarEnTablaOpts(tabla.querySelector("table"), hiddenDate, {colSumar: [5, 6, 7], colTotal: [1,2,3], colBusqueda: [1]});

    dia.addEventListener("keyup", (e) => {
        if (!dia.checkValidity()) {
            dia.reportValidity();
            // dia.setCustomValidity("Día no valido");
        } else if (anio.value.length === 4) {
            const diaT = dia.value.trim();
            const mesT = mes.value.trim();
            const anioT = anio.value.trim();
            const diaI = diaT !== "" ? (/^\d$/.test(diaT) ? `0${diaT}/` : diaT+"/") : null;
            const mesI = mesT !== "" ? (/^\d$/.test(mesT) ? `0${mesT}/` : mesT+"/") : null;
            const anioI = anioT !== "" ? anioT : null;
            const valorFecha = (diaI && mesI && anioI) ? diaI+mesI+anioI : ((mesI && anioI) ? mesI+anioI : (anioI ? anioI : "" ));
            inputBuscar.value = "";
            hiddenDate.value = valorFecha;
            hiddenDate.dispatchEvent(new Event("input"));
        } 
    });
    mes.addEventListener("keyup", (e) => {
        if (!mes.checkValidity()) {
            mes.reportValidity();
        } else if (anio.value.length === 4) {
            const diaT = dia.value.trim();
            const mesT = mes.value.trim();
            const anioT = anio.value.trim();
            const diaI = diaT !== "" ? (/^\d$/.test(diaT) ? `0${diaT}/` : diaT+"/") : null;
            const mesI = mesT !== "" ? (/^\d$/.test(mesT) ? `0${mesT}/` : mesT+"/") : null;
            const anioI = anioT !== "" ? anioT : null;
            const valorFecha = (diaI && mesI && anioI) ? diaI+mesI+anioI : ((mesI && anioI) ? mesI+anioI : (anioI ? anioI : "" ));
            inputBuscar.value = "";
            hiddenDate.value = valorFecha;
            hiddenDate.dispatchEvent(new Event("input"));
        } 
    });
    anio.addEventListener("keyup", (e) => {
        //borrar todo
        if (e.key === "Backspace" && anio.value.length >= 3) {
            // dia.value = "";
            // mes.value = "";
            anio.value = "";
            hiddenDate.value = "";
            hiddenDate.dispatchEvent(new Event("input"));
            return;
        }

        if (!anio.checkValidity()) {
            anio.reportValidity();
        } else if (anio.value.length === 4) {
            const diaT = dia.value.trim();
            const mesT = mes.value.trim();
            const anioT = anio.value.trim();
            const diaI = diaT !== "" ? (/^\d$/.test(diaT) ? `0${diaT}/` : diaT+"/") : null;
            const mesI = mesT !== "" ? (/^\d$/.test(mesT) ? `0${mesT}/` : mesT+"/") : null;
            const anioI = anioT !== "" ? anioT : null;
            const valorFecha = (diaI && mesI && anioI) ? diaI+mesI+anioI : ((mesI && anioI) ? mesI+anioI : (anioI ? anioI : "" ));
            hiddenDate.value = valorFecha;
            inputBuscar.value = "";
            hiddenDate.dispatchEvent(new Event("input"));
        } else if(anio.value.length === 0) {
            hiddenDate.value = "";
            hiddenDate.dispatchEvent(new Event("input"));
        }
    });

    inputBuscar.addEventListener("input", (e) => {
        dia.value = "";
        mes.value = "";
        anio.value = "";
    });

    const iconoRecargar = crearElemento("i", {class: "bi bi-arrow-clockwise"});
    const btnRecargar = crearElemento("button", {class: "btn btn-primary h-100", id: "btn-recargar"}, [iconoRecargar]);
    btnRecargar.addEventListener("click", (e) => {
        hiddenDate.value = "";
        inputBuscar.value = "";
        inputBuscar.dispatchEvent(new Event("input"));
    });
    const divRecargar = crearElemento("div", {class: "col-auto"}, [btnRecargar]);

    const divFiltros = crearElemento("div", {class: "row d-flex justify-content-end m-0 pb-2 g-2"}, [divRecargar, row, elementoBuscar]);

    return divFiltros;
}


export const SoloCobros = (vistaPrincipal, URL_LT, contenedorDeAlertas, elementosModal) => {
    // Crea un modal con un formulario
    const innerDiv = crearElemento("div", {class: "inner-div"});
    const modalSolicitud = async() => {
        const floatingDiv = crearElemento("div", {class: "floating-message p-md-4", style: "width: 100%; max-width: 500px; min-width: 240px"});

        const formulario = `<div >
            <h5 class="text-center fw-bold">Listar cobros</h5>
            <form class="row g-3 mt-0">
                <div class="col-12 col-md-6">
                    <label for="cobro_finicio" class="form-label">Fecha inicio:</label>
                    <input type="date" class="form-control" name="rangoa" id="cobro_finicio">
                </div>
                <div class="col-12 col-md-6">
                    <label for="cobro_ffin" class="form-label">Fecha fin:</label>
                    <input type="date" class="form-control" name="rangob" id="cobro_ffin">
                </div>

                <div class="col-12 text-center mt-4">
                    <button class="btn btn-primary" id="btn-enviar-formulario">Enviar</button>
                    <a class="btn btn-secondary">Cancelar</a>
                </div>
            </form>
        </div>`;
        floatingDiv.innerHTML = formulario;
        innerDiv.appendChild(floatingDiv);
        const cancelar = floatingDiv.querySelector(".btn-secondary");
        const elementoFormulario = floatingDiv.querySelector("form");

        const {modal, divPage} = elementosModal;
        const modalInstance = new bootstrap.Modal(modal);

        // Preparación y envio de formulario y control de la respuesta
        elementoFormulario.addEventListener("submit", async(e) => {
            e.preventDefault();
                        
            // const listaDeRegistros = obtenerDatos(`${URL}/${objAFTI.tipo_inventario}`);
            // await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody)
            // alertaDeExito(contenedorDeAlertas, "Solicitud enviada con éxito")
            const fechaInicio = elementoFormulario.querySelector("#cobro_finicio").value;
            const fechaFin = elementoFormulario.querySelector("#cobro_ffin").value;

            innerDiv.remove();

            const principal = divPage.querySelector("main");
            principal.innerHTML = `<div class="py-5 text-primary text-center fw-bold">Cargando...</div>`;
            modalInstance.show();
            principal.innerHTML = await VPCobros(URL_LT, fechaInicio, fechaFin);
        })

        // Elimina el modal si se hace click fuera del contendor de mensaje
        innerDiv.addEventListener('click', function(event) {
            if ((floatingDiv && !floatingDiv.contains(event.target)) || (cancelar && cancelar.contains(event.target))) {
                innerDiv.remove();
            }
        });
    }
    modalSolicitud();
    vistaPrincipal.appendChild(innerDiv)

}
