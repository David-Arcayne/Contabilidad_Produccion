import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { eliminarRegistro, nuevoRegistro } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";

/**
 * Crea el contenido de la vista Crear Asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaDetalleT - Elemento contenedor de la vista revaluo.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const DetalleTemplate = (datosVista) => {
    const {
        vistaPrincipal,
        vistaDetalleT, 
        permisos
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return ({registro}) => {
        const URL = `${URL_APIC}api/`;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        const URL_LT = `${URL}vertemplate/${registro.codigo}/${empresa_id}`;

        const regresar = () => { cambiarVista(vistaDetalleT, vistaPrincipal) }
        const tituloVista = encabezadoVista("Volver", "Detalle del template", regresar)
        vistaDetalleT.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalDTm = crearElemento("div");
        const vistaRegistrarDTm = crearElemento("div", {class: "d-none"});

        vistaDetalleT.append(vistaPrincipalDTm, vistaRegistrarDTm);
        
        // Creación de elementos para la vista principal
        const alertasDTm = crearElemento("div");
        vistaPrincipalDTm.appendChild(alertasDTm);
        // if (permisos.escritura === "1") {
        //     const nuevoRegistro = () => cambiarVista(vistaPrincipalDTm, vistaRegistrarDTm);
        //     const opciones = btnNuevoRegistro(nuevoRegistro);
        //     opciones.classList.add("mb-2");
        //     vistaPrincipalDTm.appendChild(opciones);
        // }
        const encabezadoTabla = [
            "Grupo",
            "Detalle de Grupo",
            // "Opciones",
        ];
        const estiloTd = [
            "text-start",
            "text-start",
            // "text-start",
        ];
        // const contenidoTabla = [
        //     {
        //         nombre: "nombre",
        //         miEstilo: NombreGrupo,
        //     },
        //     {
        //         nombre: "detalle",
        //         miEstilo: GrupoDetalle,
        //     },
        //     {
        //         nombre: "Opciones",
        //         usarBasicos: {
        //             eliminar: eliminarRegistro({
        //                 vistaPrincipal: vistaDetalleT,
        //                 contenedorDeAlertas: alertasDTm,
        //                 URL: (id) => `${URL}eliminartasiento/${id}`,
        //             }),
        //         }
        //     }
        // ];
        // if (permisos.eliminar === "0") {
        //     encabezadoTabla.pop();
        //     contenidoTabla.pop();
        // }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalDTm.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { MiContenidoTabla(registros, tBody); }
        obtenerDatosAlr(URL_LT, { contenedor: alertasDTm, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
        // Creación de formulario para la vista Registrar
        // if (permisos.escritura === "1") {
        //     nuevoRegistro({
        //         vistaPrincipal: vistaPrincipalDTm,
        //         vistaRegistrar: vistaRegistrarDTm,
        //         contenedorDeAlertas: alertasDTm,
        //         contenidoTabla,
        //         tBody,
        //         URL_FORM: `${URL}`,
        //         URL_LISTAR: URL_LT,
        //         camposDeFormulario: formularioAA,
        //         estiloTd,
        //     }, undefined, {
        //         datosExtra: [
        //             { key: "ver", value: "registrocrearasientos" },
        //             { key: "asiento", value: registro.id },
        //             { key: "empresa", value: empresa_id },
        //         ]
        //     });
        // }
    
        cambiarVista(vistaPrincipal, vistaDetalleT)
    }   
}
const MiContenidoTabla = (registros, tbody) => {
    if (!registros || registros.length == 0) {
        const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
        const tr = crearElemento("tr", undefined, [td]);
        tbody.replaceChildren(tr);
        return;
    }
    
    const fragment = document.createDocumentFragment();
    for (const template of registros) {
        for (const grupoT of template.grupo) {
            const tr = crearElemento("tr");
            const td = crearElemento("td");
            const tdDetalle = crearElemento("td");
            td.innerHTML = `${grupoT.orden}:  ${grupoT.nombre}`;
            td.classList.add("fw-bold");

            let detalleGrupo = "";
            for (const detalle of grupoT.detallegrupo) {
                detalleGrupo += `<b>${detalle.orden} ${detalle.nombreplan} ${detalle.nplancuenta} </b> <br>`;
            }
            tdDetalle.innerHTML = detalleGrupo;
            tr.append(td, tdDetalle);

            fragment.appendChild(tr);
        }
    }
    tbody.replaceChildren(fragment);
}