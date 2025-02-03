import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, opciones } from "../../../funciones/Funciones.js";
import { modalFormularioFijo } from "../../../funciones/Modals.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistroModal } from "../../../funciones/OpcionesBasicas.js";
import { ImplementarScanner, Scanner } from "../../../funciones/Scanner.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { formularioDetalleFacturaCompra } from "../Formularios.js";
import { BtnAbrirScanner, MontoFactura, NombreEstado, RellenarFormularioCompra } from "./Opciones.js";

/**
 * Crea el contenido de la vista factura de compra
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaDetalle - Elemento contenedor de la vista Detalle transacción.
 * @param {HTMLElement} datosVista.vistaTranFactura - Elemento contenedor de la vista Facturas.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @param {Object} datosVista.registroTr - Objeto con los datos de la Transacción.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const FacturaCompra = (datosVista) => {
    const {
        vistaDetalle,
        vistaTranFactura, 
        permisos,
        registroTr,
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return ({registro}) => {
        const URL = `${URL_APIC}api/`;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal
        const URL_LT = `${URL}listafactura/${registro.id}`;

        // Encabezado de la vista
        const regresar = () => { cambiarVista(vistaTranFactura, vistaDetalle) }
        const tituloVista = encabezadoVista("Volver", "Factura de Compra", regresar)
        vistaTranFactura.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalFactura = crearElemento("div");
        // const vistaRegistrarFactura = crearElemento("div", {class: "d-none"});
        const vistaRegistrarFactura = crearElemento("div", {class: "p-0 m-0"});
        const vistaEditarFactura = crearElemento("div", {class: "d-none"});

        vistaTranFactura.append(vistaPrincipalFactura, vistaRegistrarFactura, vistaEditarFactura);
        
        // Creación de elementos para la vista principal
        const alertasFactura = crearElemento("div");
        vistaPrincipalFactura.appendChild(alertasFactura);

        // Implementación del botón para realizar Scanner
        const [modalF, cuerpoModalF] = modalFormularioFijo();
        if (permisos.escritura === "1" && registroTr.consolidar === "1") {
            const modalScanner = Scanner();
            const contenedorScanner = crearElemento("div", undefined, [modalScanner]);
            vistaPrincipalFactura.appendChild(contenedorScanner);
            const modalBodyScanner = modalScanner.querySelector("#modalBodyScanner");
            ImplementarScanner(
                modalBodyScanner, 
                "scanner-factura-compra", 
                RellenarFormularioCompra, 
                {
                    tipo: "informacion",
                    vform: vistaRegistrarFactura, 
                    // accion: () => { console.log("Accion de busqueda"); cambiarVista(vistaPrincipalFactura, vistaRegistrarFactura)}
                    accion: () => {modalF.classList.remove("d-none")}
                }
            );

            // const nuevoRegistro = () => cambiarVista(vistaPrincipalFactura, vistaRegistrarFactura);
            const nuevoRegistro = () => modalF.classList.remove("d-none");
            const opcionesBtn = opciones([
                btnNuevoRegistro(nuevoRegistro),
                BtnAbrirScanner(modalScanner),
            ])
            vistaPrincipalFactura.appendChild(opcionesBtn);
            vistaRegistrarFactura.appendChild(modalF);
        }
        const encabezadoTabla = [
            "Fecha",
            "Factura",
            "Cliente",
            "Nit",
            "Monto",
            "Estado",
            "Opciones",
        ];
        const estiloTd = [
            "date",
            "text-start",
            "text-start",
            "text-start",
            "text-end",
            "text-start",
            "text-start",
        ];
        const contenidoTabla = [
            "fecha",
            "nfactura",
            "procli",
            "nit",
            {
                nombre: "montofactura",
                agregarT: MontoFactura,
            },
            {
                nombre: "estado",
                miEstilo: NombreEstado, 
            },
            {
                nombre: "Opciones",
                usarBasicos: {
                    editar: editarRegistroModal({
                        vistaPrincipal: vistaPrincipalFactura,
                        vistaEditar: vistaEditarFactura,
                        contenedorDeAlertas: alertasFactura,
                        camposDeFormulario: formularioDetalleFacturaCompra,
                        URL_FORM: `${URL}`,
                        URL_LISTAR: URL_LT,
                        estiloTd,
                    }, {
                        datosExtra: [
                            { key: "idfactura", value_r: "id" },
                            { key: "trans", value: registroTr.id },
                            { key: "ver", value: "crearfacturasf5" },
                            { key: "clasefactura", value: "1" },
                            { key: "cuenta", value: registro.id },
                        ]
                    }),
                    eliminar: eliminarRegistro({
                        vistaPrincipal: vistaTranFactura,
                        contenedorDeAlertas: alertasFactura,
                        URL: (id) => `${URL}eliminarfactura/${id}`,
                    }, undefined, (datos) => {
                        const td = tBody.querySelector(`#td_det_tr_factura_total`);
                        if (td && tBody.childElementCount === 1) {
                            const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
                            const tr = crearElemento("tr", undefined, [td]);
                            tBody.replaceChildren(tr);
                            return;
                        }
                        const numeroDecimal = parseFloat(datos.montofactura);
                        const total = parseFloat(td.textContent?.replace(",", ""));
                        td.textContent = (total - numeroDecimal).toFixed(2);
                    }),
                }
            }
        ];
        if (permisos.eliminar === "0"  || registroTr.consolidar === "2") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalFactura.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(URL_LT, { contenedor: alertasFactura, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1" && registroTr.consolidar === "1") {
            nuevoRegistroModal({
                vistaPrincipal: vistaPrincipalFactura,
                vistaRegistrar: vistaRegistrarFactura,
                contenedorDeAlertas: alertasFactura,
                contenidoTabla,
                tBody,
                URL_FORM: `${URL}`,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioDetalleFacturaCompra,
                estiloTd,
                elementosModal: [modalF, cuerpoModalF],
            }, undefined, {
                datosExtra: [
                    { key: "ver", value: "crearfacturas" },
                    { key: "trans", value: registroTr.id },
                    { key: "cuenta", value: registro.id },
                    { key: "empresa", value: empresa_id },
                    { key: "sucursal", value: sucursal_id },
                    { key: "clasefactura", value: "1" },
                    { key: "espesicicacion", value: "1" },

                    { key: "codigocontrol", value: "0" },
                ]
            });
        }
    
        cambiarVista(vistaDetalle, vistaTranFactura)
    }   
}