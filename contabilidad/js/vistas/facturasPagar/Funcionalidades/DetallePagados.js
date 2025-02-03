import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { editarRegistro, eliminarRegistro, nuevoRegistro } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";

/**
 * Crea el contenido de la vista Crear Asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPagados - Elemento contenedor de la vista facturas cobradas.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const DetallePagados = (datosVista) => {
    const {
        vistaPagados,
        vistaDetalleP, 
        permisos,
        estiloTdP,
        URL_LT_P,
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return async ({registro, contenidoTabla: ctFP, tbody: tbFP}) => {
        const URL = `${URL_APIC}api/`;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        const URL_LT = `${URL}listapagoscobros/${registro.id}`;

        const regresar = async () => {
            const listaDeRegistros = await obtenerDatos(URL_LT_P);
            if (listaDeRegistros) {
                const nuevoRegistro = listaDeRegistros.filter(registro => Number(registro.saldo.toFixed(2)) === 0);
                contenidoTBody(nuevoRegistro, {contenido: ctFP, estiloTd: estiloTdP}, tbFP)
                cambiarVista(vistaDetalleP, vistaPagados)
            }
        }

        const divInformacion = () => {
            const moneda = crearElemento("p", { class: "text-center" }, ["(Expresado en Bolivianos)"]);
            const spanFecha = crearElemento("span", { class: "fw-bold" }, [`Fecha: `]);
            const divFecha = crearElemento("div", undefined, [spanFecha, FormatoDate(registro.fecha)]);
            const spanFactura = crearElemento("span", { class: "fw-bold" }, [`Factura: `]);
            const divFactura = crearElemento("div", undefined, [spanFactura, registro.numero]);
            const spanTransaccion = crearElemento("span", { class: "fw-bold" }, [`Transacción: `]);
            const divTransaccion = crearElemento("div", undefined, [spanTransaccion, registro.codigo]);
            const spanCliente = crearElemento("span", { class: "fw-bold" }, [`Cliente: `]);
            const divCliente = crearElemento("div", undefined, [spanCliente, registro.nombre]);
            const spanMonto = crearElemento("span", { class: "fw-bold" }, [`Monto: `]);
            const divMonto = crearElemento("div", undefined, [spanMonto, FormatoEnUs(registro.monto)]);
            const divInformacion = crearElemento("div", { class: "pb-2" }, [moneda, divFecha, divFactura, divTransaccion, divCliente, divMonto]);
            return divInformacion;
        }
        const tituloVista = encabezadoVista("Volver", "Detalle Pagados", regresar, undefined, divInformacion())
        vistaDetalleP.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalDFP = crearElemento("div");
        vistaDetalleP.append(vistaPrincipalDFP);
        
        // Creación de elementos para la vista principal
        const alertasDFP = crearElemento("div");
        vistaPrincipalDFP.appendChild(alertasDFP);
        
        const encabezadoTabla = [
            "Fecha",
            "Persona",
            "CI",
            "Recibo",
            "Monto",
            "Opciones",
        ];
        const estiloTd = [
            "text-start",
            "text-start",
            "text-start",
            "text-start",
            "decimal",
            "text-start",
        ];
        const contenidoTabla = [
            {
                nombre: "fecha",
                agregarT: MontoFactura,
            },
            "persona",
            "ci",
            "recibo",
            "monto",
            {
                nombre: "Opciones",
                usarBasicos: {
                    eliminar: eliminarRegistro({
                        vistaPrincipal: vistaPrincipalDFP,
                        contenedorDeAlertas: alertasDFP,
                        URL: (id) => `${URL}eliminarpagar/${id}`,
                    }, undefined, (datos) => { 
                        const td = tabla.querySelector(`#td_fxc_detalle_total`);
                        if (td && tBody.childElementCount === 1) {
                            const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
                            const tr = crearElemento("tr", undefined, [td]);
                            tBody.replaceChildren(tr);
                            return;
                        }
                        const numeroDecimal = parseFloat(datos.monto);
                        const total = parseFloat(td.textContent?.replace(",", ""));
                        td.textContent = (total - numeroDecimal);
                    }),
                }
            }
        ];
        if (permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalDFP.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(URL_LT, { contenedor: alertasDFP, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
        cambiarVista(vistaPagados, vistaDetalleP)
    }   
}

export const MontoFactura = ({elemento, registro, arrayT}) => {
    const strDecimal = parseFloat(registro.monto).toFixed(2);
    const numeroDecimal = parseFloat(strDecimal);
    if (arrayT.length > 0) {
        arrayT[1] += numeroDecimal;
    } else {
        const row = (montoTotal) => {
            const td = crearElemento("td", {colspan: "4", class: "text-end fw-bold"}, ["Total:"]);
            const montoT = montoTotal.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const tdTotal = crearElemento("td", {class: "text-end fw-bold", id: "td_fxc_detalle_total"}, [montoT]);
            const tdr = crearElemento("td");
            const row = crearElemento("tr", undefined, [td, tdTotal, tdr]);
            return [row];
        }
        arrayT.push(row, numeroDecimal);
    }
    elemento.textContent = FormatoDate(registro.fecha);
}
