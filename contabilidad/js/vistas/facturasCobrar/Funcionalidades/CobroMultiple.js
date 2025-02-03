import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, FormatoDate, InputBusqueda, opciones } from "../../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../../funciones/OpcionesBasicas.js";
import { enviarDatosObj, obtenerDatos, obtenerDatosAlr, rellenarSelect } from "../../../funciones/Solicitudes.js";
import { formularioCobrarFactura, formularioNuevaFactura } from "../Formularios.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 * @param {Object} elementosFxC - Elementos de la viata Facturas por Cobrar
 */
export async function CobroMultiple(codigo, permisos, elementosFxC) {

    const {
        vistaFxC,
        vistaCobroMultiple
    } = elementosFxC;

    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal
    const URL_LT = `${URL}listacobrarfactura/${sucursal_id}`;

    const vistaPrincipal = crearElemento("div");
    const vistaRegistrar = crearElemento("div", { class: "d-none" });

    vistaCobroMultiple.append(vistaPrincipal, vistaRegistrar);

    const regresar = () => { cambiarVista(vistaCobroMultiple, vistaFxC) }
    const tituloVista = encabezadoVista("Volver", "Cobrar Facturas", regresar)
    vistaPrincipal.replaceChildren(tituloVista);

    const datoGA = await obtenerDatos(`${URL}getgestionactual/${empresa_id}`);
    if (datoGA && datoGA.nombre) {
        const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datoGA.nombre} (${FormatoDate(datoGA.fechaini)} a ${FormatoDate(datoGA.fechafin)})`]);
        const textGA = crearElemento("p", { class: "fs-6" }, ["Gestión Activa: ", spanGA]);
        const gestionActiva = crearElemento("div", { class: "text-end" }, [textGA])
        vistaRegistrar.appendChild(gestionActiva);
    } else {
        const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
        vistaRegistrar.appendChild(h1);
        return;
    }


    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "Opción",
        "Fecha",
        "Factura",
        "#Trans.",
        "Cliente",
        "Monto Factura",
        "Monto Cobrado",
        "Saldo",
    ];
    const estiloTd = [
        "text-center",
        "date",
        "text-start",
        "text-start",
        "text-start",
        "text-end",
        // "decimal",
        "decimal",
        "decimal",
    ];
    const contenidoTabla = [
        {
            nombre: "_opcion",
            colInput: columnaCheckbox(vistaPrincipal, vistaRegistrar),
        },
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
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    // const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { 
        const nuevoRegistro = registros.filter(registro => Number(registro.saldo.toFixed(2)) !== 0);
        contenidoTBody(nuevoRegistro, {contenido: contenidoTabla, estiloTd}, tBody);
    };
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

    nuevoRegistro({
        vistaPrincipal: vistaPrincipal,
        vistaRegistrar: vistaRegistrar,
        contenedorDeAlertas: contenedorDeAlertas,
        contenidoTabla,
        tBody,
        URL_FORM: `${URL}`,
        URL_LISTAR: URL_LT,
        camposDeFormulario: formularioCobrarFactura,
        estiloTd,
        accionPrevia: ValidarFecha(vistaRegistrar, datoGA),
    }, undefined, {
        datosExtra: [
            { key: "ver", value: "registrocobrarfactura__" },
            // { key: "idfactura", value: registro.id },
            // { key: "idtransaccion", value: registro.transaccion },
            // { key: "idcuenta", value: registro.cuenta },
            // { key: "idcliente", value: registro.idproveedor },
            // { key: "sucursal", value: sucursal_id },
            // { key: "empresa", value: empresa_id },
        ]
    });
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
            const row = crearElemento("tr", {class: "totales"}, [td, tdFactura, tdCobrado, tdSaldo]);
            return [row];
        }
        arrayT.push(row, montoFactura, montoCobrado, montoSaldo);
    }
    elemento.textContent = montoFactura.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

const columnaCheckbox = (vistaPrincipal, vistaRegistrar) => ({elemento, contenidoTabla, registro, tbody, objectT}) => {
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL = `${URL_APIC}api/`;
    
    elemento.classList.add("text-center");
    const input = crearElemento("input", {type: "checkbox", class: "form-check-input border-primary"});
    elemento.appendChild(input);

    input.addEventListener("change", (e) => {
        const divT = tbody.closest(".table-responsive");
        const btnAsientoM = crearElemento("button", {class: "btn btn-info btn-sm"}, ["Realizar Cobro"]);
        const divOpciones = crearElemento("div", {class: "d-flex justify-content-start mb-2", id: "opcion_agrupar"}, [btnAsientoM]);

        if (input.checked) {
            objectT[registro.id] = registro;
            if (vistaPrincipal.querySelector("#opcion_agrupar")) {
                return;
            }
            vistaPrincipal.insertBefore(divOpciones, divT);
        } else {
            delete objectT[registro.id];
            if (Object.keys(objectT).length === 0) {
                vistaPrincipal.removeChild(vistaPrincipal.querySelector("#opcion_agrupar"));
                return;
            }
        }
        
        btnAsientoM.addEventListener("click", async (e) => {
            cambiarVista(vistaPrincipal, vistaRegistrar);

            // btnAsignar.addEventListener("click", async (e) => {
            //     e.preventDefault();
            //     if(!inputSelect.checkValidity()) {
            //         inputSelect.reportValidity();
            //         return;
            //     }

            //     const datosFactura = [];
            //     for (const key in objectT) {
            //         const factura = {idfactura: objectT[key].id, monto: objectT[key].montofactura};
            //         datosFactura.push(factura);
            //     }
            //     const datos = {
            //         ver: 'cobrofacturasaasientomodelo',
            //         idempresa: empresa_id,
            //         idasiento: inputSelect.value,
            //         facturas:  JSON.stringify(datosFactura),
            //     }
            //     const opciones = {
            //         datos: datos,
            //         myUrl: URL,
            //         // redireccion: accionEnviar,
            //         // error: error
            //     }
            //     enviarDatosObj(opciones);
                
            // });

        });
    });
}

const ValidarFecha = (vista, gestion) =>  (enviarFormulario, form) => {
    
    const fecha = form.querySelector("#fxccobrarfactura_fecha");
    if (fecha.value < gestion.fechaini || fecha.value > gestion.fechafin) {
        const modal = modalDeInformacion("La fecha no corresponde a la gestion actual");
        vista.appendChild(modal);
        return;
    }
    enviarFormulario();
};