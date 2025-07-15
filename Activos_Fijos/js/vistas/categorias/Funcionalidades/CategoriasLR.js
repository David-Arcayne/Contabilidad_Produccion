import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, InputBusqueda } from "../../../funciones/Funciones.js";
import { enviarDatosFormulario, enviarDatosObj, obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { editarRegistro, eliminarRegistro } from "../../../funciones/OpcionesBasicas.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { AF_ENV } from "../../../../db/environment.js";

/**
 * Crea el contenido de la vista Categorias.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.contenedorCategoria - Elemento contenedor de la categoria LR.
 * @param {HTMLElement} datosVista.estiloTdCat - Estilos para las celdas de la tabla.
 * @param {HTMLElement} datosVista.contenidoTablaCat - Contenido de la tabla.
 * @param {HTMLElement} datosVista.tBodyCat - Cuerpo de la tabla.
 * @param {Object} datosVista.vistas - Vistas de la ventana.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const CategoriasLR = (datosVista) => {
    const {
        contenedorCategoria,
        estiloTdCat,
        contenidoTablaCat,
        tBodyCat,
        vistas,

    } = datosVista;

    const URL = `${AF_ENV.apiUrl}/app/ad/api/categoriabienes`;
    
    // Creación de elementos para la vista principal
    const alertasCategoria = crearElemento("div", {class: "mt-3"});
    contenedorCategoria.appendChild(alertasCategoria);

    const icono = crearElemento("i", { class: "bi bi-file-earmark-plus" });
    const btnAgregarTodo = crearElemento("button", { class: "btn btn-primary my-2 px-md-5" }, [icono, " Agregar todo"]);

    const inputfiltro = crearElemento("input", {class: "form-control", placeholder: "buscar ...", id: "input_nombre_cat"});
    const btnFiltro = crearElemento("button", {class: "btn btn-info my-0 px-2 rounded-end-1", id: "btn_buscar"}, [crearElemento("i", {class: "bi bi-search"})]);
    const colFiltro = crearElemento("div", {class: "input-group input-group-sm", style: "max-width: 250px"}, [inputfiltro, btnFiltro]);
    // const divFiltro = crearElemento("div", {class: "d-flex justify-content-end mb-2"}, [colFiltro]);


    const estiloTd = [
        "text-start",
        "text-end",
        "decimal",
        "text-start",
        "text-start",
    ];
    const encabezadoTabla = [
        "Nombre",
        "Vida util",
        "Coeficiente",
        "Descripción",
        "Opciones",
    ];
    const contenidoTabla = [
        "categoria",
        "vidautil",
        "coef",
        "descripcion",
        {
            nombre: "Opciones",
            accion: {
                accion: agregar(alertasCategoria, contenedorCategoria, estiloTdCat, contenidoTablaCat, tBodyCat),
                icono: "bi bi-plus-lg",
                classElemento: "btn btn-primary btn-sm ",
                texto: " Agregar",
            },
        }
    ];

    const [tabla, tBody] = crearTabla(encabezadoTabla);
    const divFiltro = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    contenedorCategoria.append(btnAgregarTodo, divFiltro, tabla);
    // Listar los registros en la tabla.
    let categorias = {};
    const cargarContenido = (registros) => { categorias["data"] = [...registros]; contenidoTBody({data: registros}, {contenido: contenidoTabla, estiloTd}, tBody); }
    obtenerDatosAlr(`${URL}`, { contenedor: alertasCategoria, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });  

    // filtrarPorCategoria(inputfiltro, btnFiltro, categorias, contenidoTabla, estiloTd, tBody);
    
    btnAgregarTodo.addEventListener("click", async () => {
        const datosCategoria = await obtenerDatos(`${URL}`);

        const registrar = () => {
            const accionEnviar = async() => {
                const listaDeRegistros = await obtenerDatos(`./api/categoria`);
                await contenidoTBody(listaDeRegistros, {contenido: contenidoTablaCat, estiloTd: estiloTdCat}, tBodyCat);
                alertaDeExito(alertasCategoria, "Categorías agregadas con éxito")
                setTimeout(() => {
                    cambiarVista(vistas.vistaRegistrar, vistas.vistaPrincipal)
                }, 2000);
            }
            const error = () => {
                alertaDeError(alertasCategoria, "Ocurrio un error al agregar las categorías")
            }
    
            const datos = {
                datoscategoria: JSON.stringify(datosCategoria),
            }
            
            const opciones = {
                datos: datos,
                myUrl: `./api/categoria`,
                redireccion: accionEnviar,
                error: error
            }
            enviarDatosObj(opciones);

        }
        const modal = contenedorCategoria;
        modal.appendChild(modalDeConfirmacion(registrar, "Esta seguro de agregar todas las categorías"));
    });
}

/**
 * Agrega un registro a la tabla.
 * @param {HTMLElement} alertasCategoria - Contenedor de las alertas.
 * @param {HTMLElement} contenedorCategoria - Contenedor de la categoria.
 * @param {HTMLElement} estiloTd - Estilos para las celdas de la tabla.
 * @param {HTMLElement} contenidoTabla - Contenido de la tabla.
 * @param {HTMLElement} tbody - Cuerpo de la tabla.
 * @returns {function} Funcion para agregar un registro a la tabla.
 */
const agregar = (alertasCategoria, contenedorCategoria, estiloTd, contenidoTabla, tbody) => {
    return ({registro}) => {        
        const registrar = () => {
            const accionEnviar = async() => {
                const listaDeRegistros = await obtenerDatos(`./api/categoria`);
                await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tbody);
                alertaDeExito(alertasCategoria, "Categoría agregada con éxito")
            }
            const error = () => {
                alertaDeError(alertasCategoria, "Ocurrio un error al agregar la categoría")
            }
    
            const datos = {
                nombre: registro.categoria,
                vidautil:  registro.vidautil,
                coeficiente: registro.coef,
                descripcion: registro.descripcion,
            }
            
            const opciones = {
                datos: datos,
                myUrl: `./api/categoria`,
                redireccion: accionEnviar,
                error: error
            }
            enviarDatosObj(opciones);

        }
        const modal = contenedorCategoria;
        modal.appendChild(modalDeConfirmacion(registrar, "Esta seguro de agregar la categoría"))
    }
}