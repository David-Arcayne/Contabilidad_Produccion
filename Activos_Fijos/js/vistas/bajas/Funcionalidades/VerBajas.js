import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { enviarDatos, enviarDatosFormulario, obtenerDatos, obtenerDatosAlr, rellenarSelect } from "../../../funciones/Solicitudes.js";

/**
 * Crea un modal de confirmación para dar de baja.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {string} datosVista.URL - URL principal.
 * @param {string[]} datosVista.estiloTd - Estilos para las columnas de la tabla.
 * @returns
 */
export const VerBajas = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        estiloTd,
    } = datosVista;
    
    return ({elemento, registro, contenidoTabla, tbody}) => {
        const i = crearElemento("i", {class: "bi bi-journal-arrow-down"});
        elemento.setAttribute("class", "btn btn-info btn-sm");
        elemento.setAttribute("title", "Ver bajas");
        elemento.append(i);

        const estiloPrincipal = estiloTd;
        const contenidoTablaP = contenidoTabla;
        const tbodyP = tbody;

        elemento.addEventListener("click", () => {
            const encabezadoTabla = [
                "Código",
                "Cantidad",
                "Detalle",
                "Precio",
                "Motivo de baja",
                "Fecha de baja",
                "Responsable baja",
                "Opciones",
            ];
            const estiloTd = [
                "text-start",
                "text-end",
                "text-start",
                "text-end",
                "text-start",
                "datetime",
                "text-start",
                "text-start",
            ];
            const contenidoTabla = [
                "codigo",
                "cantidad",
                "detallebaja",
                "precio",
                "nombretipobaja",
                "fechabaja",
                "nombretrabajador",
                {
                    nombre: "Opciones",
                    accion: {
                        estilo: DarAlta({
                            vistaPrincipal,
                            contenedorDeAlertas,
                            URL: `${URL}`,
                            eTd: estiloPrincipal,
                            estiloTd,
                            cTabla: contenidoTablaP,
                            tbodyP: tbodyP,
                            idAF: registro.id,
                        }),
                    },
                },
            ];
            const [tabla, tBody] = crearTabla(encabezadoTabla);

            const cuerpoTabla = async () => {
                
                const datos = await obtenerDatos(`./api/activo-fijo/af-bajas/${registro.id}`);
                if (datos) {
                    contenidoTBody(datos, {contenido: contenidoTabla, estiloTd}, tBody);
                }
            }
            cuerpoTabla();

            const titulo = crearElemento("h3", {class: "text-center mb-3"}, ["Bajas del activo"]);
            const divC = crearElemento("div", {class: "py-4 px-2 px-md-4 bg-light rounded-2", style: "min-width: 200px;"}, [titulo, tabla]);
            const i = crearElemento("i", { class: "bi bi-x-lg" });
            const cerrar = crearElemento( "button", { class: "position-absolute top-0 start-50 translate-middle-x btn btn-dark btn-lg mt-3" }, [i]);
            const contenedorModal = crearElemento("div",
                {
                    class: "inner-div d-flex align-items-center justify-content-center",
                    style: "background-color: #00000050;",
                }, [divC, cerrar] );

            // Elimina el modal si se hace click fuera del contendor de mensaje
            contenedorModal.addEventListener('click', function (event) {
                if ((divC && !divC.contains(event.target)) || (cerrar && cerrar.contains(event.target))) {
                    contenedorModal.remove();
                }
            });

            vistaPrincipal.appendChild(contenedorModal)
        })
    }
}

export const DarAlta = (datosVista) => {
    const {
        vistaPrincipal,
        contenedorDeAlertas,
        URL,
        eTd,
        cTabla,
        tbodyP,
        estiloTd,
        idAF,
    } = datosVista;
    
    return ({elemento, registro, contenidoTabla, tbody}) => {
        
        const i = crearElemento("i", {class: "bi bi-hand-thumbs-down-fill"});
        elemento.setAttribute("class", "btn btn-danger btn-sm rounded");
        elemento.setAttribute("title", "Activar");
        elemento.append(i);

        // Evento para activar el registro
        elemento.addEventListener("click", () => {
            const activar = async() => {
                const respuesta = await enviarDatos(`${URL}/activar-baja/${registro.id}`, "PUT");
                if (respuesta && respuesta.ok) {
                    const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
                    const listaDeRegistros = obtenerDatos(`${URL}/${objAFTI.tipo_inventario}`);
                    await contenidoTBody(listaDeRegistros, {contenido: cTabla, estiloTd: eTd}, tbodyP)
                    const listaDeRegistrosB = obtenerDatos(`./api/activo-fijo/af-bajas/${idAF}`);
                    await contenidoTBody(listaDeRegistrosB, {contenido: contenidoTabla, estiloTd}, tbody)
                    alertaDeExito(contenedorDeAlertas, "Registro activado")
                } else {
                    alertaDeError(contenedorDeAlertas, "No se pudo activar el registro")
                }
            }
            const confirmar = modalDeConfirmacion(activar, "Esta seguro de activar");
            vistaPrincipal.appendChild(confirmar);
            });        
    }
}