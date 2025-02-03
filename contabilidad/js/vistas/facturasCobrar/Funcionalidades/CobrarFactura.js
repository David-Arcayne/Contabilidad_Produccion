import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, FormatoDate, FormatoEnUs, opciones } from "../../../funciones/Funciones.js";
import { modalDeInformacion } from "../../../funciones/Modals.js";
import { editarRegistro, editarRegistroModal, nuevoRegistro } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { BtnVistaPrevia, VistaPDF } from "../../../funciones/VistaPDF.js";
import { formularioCobrarFactura } from "../Formularios.js";
import { VPDetalleCobros } from "./VPDetalleCobros.js";

/**
 * Crea el contenido de la vista Crear Asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaCobrar - Elemento contenedor de la vista revaluo.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const CobrarFactura = (datosVista) => {
    const {
        vistaPrincipal,
        vistaCobrar, 
        permisos,
        estiloFxC,
        URL_LT_FXC,
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return async ({registro, contenidoTabla: ctFxC, tbody: tbFxC}) => {
        const URL = `${URL_APIC}api/`;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal;
        const URL_LT = `${URL}listapagos/${registro.id}`;

        const moneda = crearElemento("p", { class: "text-center" }, ["(Expresado en Bolivianos)"]);
        const regresar = async () => {
            const listaDeRegistros = await obtenerDatos(URL_LT_FXC);
            if (listaDeRegistros) {
                const nuevoRegistro = listaDeRegistros.filter(registro => Number(registro.saldo.toFixed(2)) !== 0);
                contenidoTBody(nuevoRegistro, {contenido: ctFxC, estiloTd: estiloFxC}, tbFxC)
                cambiarVista(vistaCobrar, vistaPrincipal)
            }
        }
        const divNombre = crearElemento("div", undefined, [`Cliente: ${registro.nombrep}`]);
        const spanSaldo = crearElemento("span", { class: "fw-bold" }, [FormatoEnUs(registro.saldo)])
        const divSaldo = crearElemento("div", undefined, [`Saldo por cobrar: `, spanSaldo]);
        const divInformacion = crearElemento("div", { class: "text" }, [moneda, divNombre, divSaldo]);
        const tituloVista = encabezadoVista("Volver", "Cobrar Factura", regresar, undefined, divInformacion)
        vistaCobrar.replaceChildren(tituloVista);

        const datoGA = await obtenerDatos(`${URL}getgestionactual/${empresa_id}`);
        if (datoGA && datoGA.nombre) {
            const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datoGA.nombre} (${FormatoDate(datoGA.fechaini)} a ${FormatoDate(datoGA.fechafin)})`]);
            const textGA = crearElemento("p", { class: "fs-6" }, ["Gestión Activa: ", spanGA]);
            const gestionActiva = crearElemento("div", { class: "text-end" }, [textGA])
            vistaCobrar.appendChild(gestionActiva);
        } else {
            const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
            vistaCobrar.appendChild(h1);
            return;
        }

        // Creación de Vistas para la navegación en la ventana
        const vistaRegistrarCF = crearElemento("div", {class: "mb-4"});
        const vistaPrincipalCF = crearElemento("div", undefined, [vistaRegistrarCF]);
        const vistaEditarCF = crearElemento("div", {class: "d-none"});

        vistaCobrar.append(vistaPrincipalCF, vistaEditarCF);
        
        // Creación de elementos para la vista principal
        const alertasCF = crearElemento("div");
        vistaPrincipalCF.appendChild(alertasCF);
        // if (permisos.escritura === "1") {
        //     const nuevoRegistro = () => cambiarVista(vistaPrincipalCF, vistaRegistrarCF);
        //     const opciones = btnNuevoRegistro(nuevoRegistro);
        //     opciones.classList.add("mb-2");
        //     vistaPrincipalCF.appendChild(opciones);
        // }
        const saldoActual = [registro.saldo];
        const encabezadoTabla = [
            "Fecha",
            "Persona",
            "CI",
            "Recibo",
            "Monto",
            "Opciones",
        ];
        const estiloTd = [
            "date",
            "text-start",
            "text-start",
            "text-start",
            "decimal",
            "text-start",
        ];
        const contenidoTabla = [
            // "fecha",
            {
                nombre: "fecha",
                agregarT: TotalCobro(saldoActual),
            },
            "persona",
            "ci",
            "recibo",
            "monto",
            {
                nombre: "Opciones",
                usarBasicos: {
                    editar: editarRegistroModal({
                        vistaPrincipal: vistaPrincipalCF,
                        vistaEditar: vistaEditarCF,
                        contenedorDeAlertas: alertasCF,
                        camposDeFormulario: formularioCobrarFactura,
                        URL_FORM: `${URL}`,
                        URL_LISTAR: URL_LT,
                        estiloTd,
                        accionPrevia: ValidarFecha(vistaCobrar, datoGA, registro, saldoActual),
                    }, {
                        datosExtra: [
                            { key: "ver", value: "registrocobrarfacturaf5" },
                            { key: "idcobro", value_r: "id" },
                            { key: "idfactura", value: registro.id },
                            { key: "idtransaccion", value: registro.transaccion },
                            { key: "idcuenta", value: registro.cuenta },
                            { key: "idcliente", value: registro.idproveedor },
                            { key: "sucursal", value: sucursal_id },
                            { key: "empresa", value: empresa_id },
                        ]
                    }),
                }
            }
        ];
        if (permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const elementosModal = VistaPDF("Detalle cobrados", {nombrePDF: "detalle_cobrados"});
        const btnVistaPrevia = BtnVistaPrevia(elementosModal, VPDetalleCobros(URL_LT, registro, spanSaldo));
        const divBotones = opciones([btnVistaPrevia]);

        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalCF.append(divBotones, tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(URL_LT, { contenedor: alertasCF, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1") {
            nuevoRegistro({
                // vistaPrincipal: vistaPrincipalCF,
                vistaRegistrar: vistaRegistrarCF,
                contenedorDeAlertas: alertasCF,
                contenidoTabla,
                tBody,
                URL_FORM: `${URL}`,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioCobrarFactura,
                estiloTd,
                accionPrevia: ValidarFecha(vistaCobrar, datoGA, registro, saldoActual, spanSaldo),
            }, undefined, {
                datosExtra: [
                    { key: "ver", value: "registrocobrarfactura" },
                    { key: "idfactura", value: registro.id },
                    { key: "idtransaccion", value: registro.transaccion },
                    { key: "idcuenta", value: registro.cuenta },
                    { key: "idcliente", value: registro.idproveedor },
                    { key: "sucursal", value: sucursal_id },
                    { key: "empresa", value: empresa_id },
                ]
            });
        }
    
        cambiarVista(vistaPrincipal, vistaCobrar)
    }   
}

const ValidarFecha = (vista, gestion, registro, saldoActual, spanSaldo) =>  (enviarFormulario, form) => {
    console.log(saldoActual);
    
    const fecha = form.querySelector("#fxccobrarfactura_fecha");
    if (fecha.value < gestion.fechaini || fecha.value > gestion.fechafin) {
        const modal = modalDeInformacion("La fecha no corresponde a la gestion actual");
        vista.appendChild(modal);
        return;
    }

    const monto = form.querySelector("#fxccobrarfactura_monto");
    const valorMonto = Number(parseFloat(monto.value ?? 0).toFixed(2));
    const saldo = Number(saldoActual[0].toFixed(2));

    console.log(`monto: ${valorMonto} - saldo: ${saldo}`);
    
    
    if (valorMonto > saldo) {
        const modal = modalDeInformacion("El monto debe se menor o igual al saldo");
        vista.appendChild(modal);
        return;
    }
    saldoActual[0] = saldoActual[0] - (monto.value ?? 0);
    spanSaldo.textContent = FormatoEnUs(saldoActual);
    enviarFormulario();
};

export const TotalCobro = (saldoActual) => ({elemento, registro, arrayT}) => {
    const monto = parseFloat(registro.monto ?? 0).toFixed(2);
    const montoPago = parseFloat(monto);
    if (arrayT.length > 0) {
        arrayT[1] += montoPago;
    } else {
        const row = (montoT) => {
            const td = crearElemento("td", {colspan: "4", class: "text-end fw-bold"}, ["Total:"]);
            const montoTF = FormatoEnUs(montoT)
            const tdTotal = crearElemento("td", {class: "text-end fw-bold", id: "td_det_tr_factura_total"}, [montoTF]);
            const tdr = crearElemento("td");
            const row = crearElemento("tr", {class: "totales"}, [td, tdTotal, tdr]);
            return [row];
        }
        arrayT.push(row, montoPago);
    }
    elemento.textContent = FormatoDate(registro.fecha);

    // saldoActual[0] = saldoActual[0] + montoPago
}