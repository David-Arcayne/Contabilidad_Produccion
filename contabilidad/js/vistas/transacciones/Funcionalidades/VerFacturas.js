import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { formularioFacturasTr } from "../Formularios.js";

/**
 * Crea el contenido de la vista Crear Asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaFacturas - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaListaFacturas - Elemento contenedor de la vista revaluo.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const VerFacturas = (datosVista) => {
    const {
        vistaFacturas,
        vistaListaFacturas, 
        permisos,
        estiloCF,
        URL_LT_CF,
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

        const regresar = async () => {
            // const listaDeRegistros = await obtenerDatos(URL_LT_CF);
            // if (listaDeRegistros) {
            //     const nuevoRegistro = listaDeRegistros.filter(registro => Number(registro.saldo.toFixed(2)) !== 0);
            //     contenidoTBody(nuevoRegistro, {contenido: ctFxC, estiloTd: estiloCF}, tbFxC)
            //     cambiarVista(vistaListaFacturas, vistaFacturas)
            // }
            cambiarVista(vistaListaFacturas, vistaFacturas)
        }
        const tituloVista = encabezadoVista("Volver", "Lista Facturas", regresar)
        vistaListaFacturas.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaRegistrarCF = crearElemento("div", {class: "mb-4"});
        const vistaPrincipalCF = crearElemento("div", undefined, [vistaRegistrarCF]);
        const vistaEditarCF = crearElemento("div", {class: "d-none"});

        vistaListaFacturas.append(vistaPrincipalCF, vistaEditarCF);
        
        // Creación de elementos para la vista principal
        const alertasCF = crearElemento("div");
        vistaPrincipalCF.appendChild(alertasCF);
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
            "montofactura",
            "estado",
            {
                nombre: "Opciones",
                usarBasicos: {
                    editar: editarRegistroModal({
                        vistaPrincipal: vistaPrincipalCF,
                        vistaEditar: vistaEditarCF,
                        contenedorDeAlertas: alertasCF,
                        camposDeFormulario: formularioFacturasTr,
                        URL_FORM: `${URL}`,
                        URL_LISTAR: URL_LT,
                        estiloTd,
                    }, {
                        datosExtra: [
                            { key: "ver", value: "dato_ver_para_editar" },
                            { key: "idcobro", value_r: "id" },
                            { key: "idfactura", value: registro.id },
                            { key: "idtransaccion", value: registro.transaccion },
                            { key: "idcuenta", value: registro.cuenta },
                            { key: "idcliente", value: registro.idproveedor },
                            { key: "sucursal", value: sucursal_id },
                            { key: "empresa", value: empresa_id },
                        ]
                    }),
                    eliminar: eliminarRegistro({
                        vistaPrincipal: vistaListaFacturas,
                        contenedorDeAlertas: alertasCF,
                        URL: (id) => `${URL}my_url_para_eliminar/${id}`,
                    }),
                }
            }
        ];
        if (permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalCF.append(tabla);
        // Listar los registros en la tabla.
        // const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        // obtenerDatosAlr(URL_LT, { contenedor: alertasCF, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

        const testData = [
            {
                fecha: "2021-09-30",
                nfactura: "F-0001",
                procli: "Cliente 1",
                nit: "12345678",
                montofactura: 1000,
                estado: "Pendiente",
            },
            {
                fecha: "2021-09-30",
                nfactura: "F-0002",
                procli: "Cliente 2",
                nit: "87654321",
                montofactura: 2000,
                estado: "Pendiente",
            },
        ]; 
        contenidoTBody(testData, {contenido: contenidoTabla, estiloTd}, tBody); 
    
        cambiarVista(vistaFacturas, vistaListaFacturas)
    }   
}