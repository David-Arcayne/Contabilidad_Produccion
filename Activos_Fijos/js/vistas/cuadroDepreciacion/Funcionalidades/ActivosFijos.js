import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { ValoresUso } from "./ValoresUso.js";
// import { ValoresUso } from "./ValoresUso.js";

/**
 * Crea el contenido de la vista Activos Fijos.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaActivoFijo - Elemento contenedor de la vista Activos fijos.
 * @param {HTMLElement} datosVista.vistaValoresUso - Elemento contenedor de la vista Valroes de uso.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @param {HTMLElement} datosVista.btnUso - Elemento boton.
 * @param {HTMLElement} [datosVista.mixUrl] - Url para recuperar datos.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const ActivosFijos = (datosVista) => {
    const {
        vistaPrincipal,
        vistaActivoFijo, 
        vistaValoresUso,
        permisos,
        btnUso,
        mixUrl,
    } = datosVista;

    const URL = "./api/cuadro-depreciacion/activo-fijo";

    const regresar = () => { cambiarVista(vistaActivoFijo, vistaPrincipal) }
    const tituloVista = encabezadoVista("Volver", "Activos fijos", regresar)
    vistaActivoFijo.replaceChildren(tituloVista);

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipalAF = crearElemento("div");

    vistaActivoFijo.append(vistaPrincipalAF);
    
    // Creación de elementos para la vista principal
    const alertasComponentes = crearElemento("div");
    vistaPrincipalAF.appendChild(alertasComponentes);

    const encabezadoTabla = [
        "Nombre",
        "Detalle",
        "Fecha de ingreso",
        "Opciones",
    ];
    const estiloTd = [
        "text-start",
        "text-start",
        "date",
        "text-start",
    ];
    const contenidoTabla = [
        "nombre",
        "detalle",
        "fechacompra",
        {
            nombre: "Opciones",
            accion: {
                accion: ValoresUso({ vistaActivoFijo, vistaValoresUso, permisos }),
                icono: "bi bi-calendar-week",
                classElemento: "btn btn-primary btn-sm ",
                texto: " valores de uso",
            },
        }
    ];

    const [tabla, tBody] = crearTabla(encabezadoTabla);
    vistaPrincipalAF.append(tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(mixUrl ? mixUrl : URL, { contenedor: alertasComponentes, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });

    btnUso.addEventListener("click", () => {
        cambiarVista(vistaPrincipal, vistaActivoFijo)
    });
}