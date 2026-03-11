import { manejarListadoTabla, tablaResponsiva, validarListadoTabla } from "../../../funciones/CrearTabla.js";
import { CT_URLAPI } from "../../../funciones/DatosAuxiliares.js";
import { cambiarVista, crearElemento, formatoDecimal, formatoFecha, InputBusqueda, seccionEncabezado } from "../../../funciones/Funciones.js";

/**
 * Función: Crea el contenido principal de la vista
 * Descripción: Esta función genera el contenido principal de la vista para la gestión de facturas comerciales cobradas.
 *              Permite visualizar una tabla con los cobros realizados.
 * Fecha: 18 de febrero de 2026
 * Autor: Joel Choque
 */
export function FacturasComercialCobradas(datosFC) {

    const {
        permisos,
        vistaFacturaVentaComercial,
        vistaDetalleCobros,
        registroFactura
    } = datosFC;

    const URL = CT_URLAPI;
    const URL_LT = `${URL}listar_factura_comercial_por_id/${registroFactura.id}`;

    // Creación de contenedores para la navegación en la vista
    const vistaPrincipal = crearElemento("div", { "data-pane-id": "principal" });
    vistaDetalleCobros.append(vistaPrincipal);

    // Creación de elementos para la vista Principal
    const regresar = async () => {
        cambiarVista(vistaDetalleCobros, vistaFacturaVentaComercial);
        vistaDetalleCobros.innerHTML = "";
    };
    const encabezadoVista = seccionEncabezado({ titulo: "Listado de Cobros" }, { callback: regresar });
    vistaPrincipal.appendChild(encabezadoVista);
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const encabezadoTabla = [
        "Selección",
        "Fecha",
        "Cuotas",
        "Valor Cuotas",
        "Monto",
    ];

    const [divTabla, tabla, tbody] = tablaResponsiva(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla, { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, divTabla);

    // Manejar el listado en la tabla
    manejarListadoTabla({
        urlSolicitud: URL_LT,
        callbackCargarTabla: cargarContenidoTabla,
        contenedorAlertas: contenedorDeAlertas,
        cuerpoTabla: tbody,
    });
    // Función para cargar el contenido de la tabla
    function cargarContenidoTabla(listaRegistros) {
        const validado = validarListadoTabla(listaRegistros);
        if ( !validado.valido ) {
            tbody.replaceChildren(validado.fila);
            return;
        }

        const fragment = document.createDocumentFragment();

        for (const registro of listaRegistros) {
            const celdas = [
                crearElemento("td", undefined, ["-"]),
                crearElemento("td", { class: "text-end" }, [formatoFecha(registro.fecha_actual)]),
                crearElemento("td", undefined, [registro.ncuotas]),
                crearElemento("td", undefined, [formatoDecimal(registro.valor_cuotas)]),
                crearElemento("td", { class: "text-end" }, [formatoDecimal(registro.monto)]),
            ];

            const fila = crearElemento("tr", undefined, [ ...celdas]);
            fragment.appendChild(fila);
        }

        tbody.replaceChildren(fragment);
    }
}
