import { URL_APIA, URL_APIC } from "../../../../../lib/services.js";
import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista, opciones } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatosObj, obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";

/**
 * Crea el contenido de la vista Agregar plan de cuenta.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaImportarT - Elemento contenedor de la vista activos fijos.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns
 */
export const ImportarTemplate = (datosVista) => {
    const {
        vistaPrincipal,
        vistaImportarT, 
        vistaDetalleT,
        permisos,
        contAlertasGR,
        URL_LT,
        tablaGR,
        // recargarPdC,
    } = datosVista;

    const URL = `${URL_APIA}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const tiponegocio_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idtiponegocio;

    const regresar = () => { cambiarVista(vistaImportarT, vistaPrincipal) };
    const tituloVista = encabezadoVista("Volver", "Lista de Templates", regresar);
    vistaImportarT.replaceChildren(tituloVista);

    // Creación de elementos para la vista.
    const contenedorDeAlertas = crearElemento("div");
    // const accionR = (texto) => async () => {
    //     const datos = await obtenerDatos(URL_LT);
    //     if (datos) {
    //         contenidoTBody(datos, ...tablaGR);
    //         // recargarPdC();
    //     }
    //     alertaDeExito(contAlertasGR, texto);
    //     cambiarVista(vistaImportarT, vistaPrincipal);
    // };
    // const opcionesBtns =  opciones([
    //     AgregarPlanes(`${URL}agregarplanes/${empresa_id}`, { vista: vistaImportarT, contenedor: contenedorDeAlertas, accion: accionR }),
    //     ReemplazarPlanes(`${URL}reemplazarplanes/${empresa_id}`, { vista: vistaImportarT, contenedor: contenedorDeAlertas, accion: accionR }),
    // ]);
    
    const encabezadoTabla = [
        "Template",
        "Opciones",
    ];
    const estiloTd = [
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "nombre",
        {
            nombre: "opciones",
            
            acciones: {
                detalle: {
                    accion: DetalleImportar({ vistaImportarT, vistaDetalleT, permisos }),
                    icono: "bi bi-list-task",
                    classElemento: "btn btn-primary btn-sm ",
                    titulo: "Ver detalle",
                },
                importar: {
                    accion: Importar({vistaPrincipal, vistaImportarT, contAlertasGR, URL_LT, tablaGR}),
                    icono: "bi bi-box-arrow-in-down",
                    classElemento: "btn btn-primary btn-sm ",
                    titulo: "Importar template",
                },
            },
        }
    ];
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    vistaImportarT.append(contenedorDeAlertas, tabla);

    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(`${URL}listadetemplates/${tiponegocio_id}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
}

const DetalleImportar = (datosVista) => {
    const {
        vistaImportarT,
        vistaDetalleT, 
        permisos
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return ({registro}) => {
        const regresar = () => { cambiarVista(vistaDetalleT, vistaImportarT) };
        const tituloVista = encabezadoVista("Volver", "Detalle del template", regresar);
        vistaDetalleT.replaceChildren(tituloVista);

        const contenedorDeAlertas = crearElemento("div");
        const encabezadoTabla = [
            "Nombre",
            "Lista",
        ];
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaDetalleT.append(contenedorDeAlertas, tabla);

        if (!registro.grupo || registro.grupo.length == 0) {
            const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
            const tr = crearElemento("tr", undefined, [td]);
            tBody.replaceChildren(tr);
            return;
        }
        
        const fragment = document.createDocumentFragment();
        for (const grupoT of registro.grupo) {
            const tr = crearElemento("tr");
            const td = crearElemento("td");
            const tdDetalle = crearElemento("td");
            td.innerHTML = `${grupoT.orden}:  ${grupoT.nombre}`;
            td.classList.add("fw-bold");

            let detalleGrupo = "";
            for (const detalle of grupoT.listagrupo) {
                detalleGrupo += `<b>${detalle.orden} ${detalle.cuenta} ${detalle.nplan} </b> <br>`;
            }
            tdDetalle.innerHTML = detalleGrupo;
            tr.append(td, tdDetalle);

            fragment.appendChild(tr);
        }
        tBody.replaceChildren(fragment);

        cambiarVista(vistaImportarT, vistaDetalleT);
    };
}

const Importar = (datosVista) => {
    const {
        vistaPrincipal,
        vistaImportarT,
        contAlertasGR,
        URL_LT,
        tablaGR,
    } = datosVista;

    return ({elemento, registro, contenidoTabla, tbody}) => {
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        const registrar = () => {
            const accionEnviar = async() => {
                const listaDeRegistros = await obtenerDatos(URL_LT);
                contenidoTBody(listaDeRegistros, ...tablaGR);
                alertaDeExito(contAlertasGR, "Template importado con éxito");
                cambiarVista(vistaImportarT, vistaPrincipal);
            }
            const error = () => {
                alertaDeError(contAlertasGR, "Ocurrio un error al importar el template");
            }

            const datos = {
                ver: "impotardato",
                empresa: empresa_id,
                template: JSON.stringify(registro),
            }
            
            const opciones = {
                datos: datos,
                myUrl: `${URL_APIC}api/`,
                redireccion: accionEnviar,
                error: error
            }
            enviarDatosObj(opciones);
        }
        vistaImportarT.appendChild(modalDeConfirmacion(registrar, "¿Está seguro de importar el template?"));
    }
}