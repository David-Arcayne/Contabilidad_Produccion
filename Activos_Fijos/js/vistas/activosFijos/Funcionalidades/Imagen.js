import { alertaDeAdvertencia, alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { cambiarVista, crearElemento, encabezadoVista, FormatoDateTime } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion, modalImagen } from "../../../funciones/Modals.js";
import { eliminarDato, obtenerDatos } from "../../../funciones/Solicitudes.js";

/**
 * Crea el contenido de la vista Imagen.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaImagen - Elemento contenedor de la vista imagen.
 * @param {string} datosVista.URL - URL principal.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns
 */
export const Imagen = (datosVista) => {
    const {
        vistaPrincipal,
        vistaImagen,
        URL,
        permisos,
    } = datosVista ;
    return ({registro}) => {
        const contenedorPrincipal = crearElemento("div");
        const regresar = () => {
            contenedorPrincipal.remove();
            cambiarVista(vistaImagen, vistaPrincipal)
        }
        const tituloVista = encabezadoVista("Volver", "Imagenes", regresar);
        contenedorPrincipal.replaceChildren(tituloVista);

        // Creación de elementos para la vista
        const contenedorForm = crearElemento("div", {class: "row pb-5"});
        const contenedorDeAlertas = crearElemento("div");
        const contenedorImagenes = crearElemento("div", {class: " row row-cols-1 row-cols-md-3 g-4 justify-content-center"});
        contenedorPrincipal.append(contenedorForm, contenedorDeAlertas, contenedorImagenes);
        vistaImagen.appendChild(contenedorPrincipal);

        // Creación de formulario para registrar imagenes.
        if (permisos.escritura === "1") {
            const controlarError = () => {
                alertaDeError(contenedorDeAlertas, "Error al registrar imagen");
            }
            const inputs = [{
                id: "af_imagen",
                forma: "input",
                tipo: "file",
                nombre: "foto",
                required: true
            }];
            const accionImagen = {
                myurl: `${URL}/imagenes`,
                datosExtra: {activosfijos_id: registro.id},
                accionEnviar: () => { listarImagenes() },
                error: controlarError,
                datosBtn: {
                    btnClass: "btn btn-primary",
                    columna: "col-4",
                    nombre: "Agreagar",
                }
            }
            const formularioImagen = crearFormulario(inputs, accionImagen)
            contenedorForm.append(formularioImagen);    
        }
    
        // Función para listar las imagenes en elementos Card
        const listarImagenes = async () => {
            const datosImagenes = await obtenerDatos(`${URL}/imagenes/${registro.id}`)
            const imagenes = datosImagenes.data;
            if (!imagenes || imagenes.length === 0) {
                contenedorImagenes.innerHTML = `<h1 class="display-5 text-center">Sin imagenes</h1>`;
                return;
            }
            contenedorImagenes.innerHTML = "";
                
            for (const imagen of imagenes) {
                const cardImagen = crearElemento("div", {class: "col"});
                cardImagen.innerHTML = `
                    <div class="card">
                        <img src="./imagenes/activos_fijos/${imagen.foto}" class="card-img-top" alt="..." role="button">
                        <div class="card-footer py-2">
                            <div class="row">
                                <div class="col-8">
                                    <h6 class="card-title">Fecha de Registro</h6>
                                    <p class="card-text">${FormatoDateTime(imagen.creado_en)}</p>
                                </div>
                                ${ permisos.eliminar === "1" 
                                    ? `<div class="col-4">
                                        <div class="d-inline float-end">
                                            <button class="btn btn-light text-danger fw-bold" id="imagen-${imagen.id}">
                                                <i class="bi bi-trash3-fill">
                                            </i></button>
                                        </div>
                                    </div>`
                                    : ""
                                }
                            </div>
                        </div>
                    </div>`;
                if (permisos.eliminar === "1") {
                    const btnEliminar = cardImagen.querySelector(`#imagen-${imagen.id}`)
                    btnEliminar.addEventListener("click", () => {
                        const eliminar = async() => {
                            const accionEliminar = () => {
                                cardImagen.remove();
                                if (!contenedorImagenes.hasChildNodes()) {
                                    contenedorImagenes.innerHTML = `<h1 class="display-5 text-center">Sin imagenes</h1>`;
                                }
                                alertaDeExito(contenedorDeAlertas, "Registro eliminado con exito");
                            }
                            const alerta  = () => {
                                alertaDeAdvertencia(contenedorDeAlertas, "No se puede eliminar el registro")
                            }
                    
                            await eliminarDato(`${URL}/imagen/${imagen.id}`, accionEliminar, alerta)
                        }
                    
                        const modal = vistaPrincipal.parentNode.parentNode;
                        modal.appendChild(modalDeConfirmacion(eliminar))
                    });
                }

                contenedorImagenes.appendChild(cardImagen);

                const elementoImagen = cardImagen.querySelector("img");
                elementoImagen.addEventListener("click", () => {
                    vistaImagen.append(modalImagen(`./imagenes/activos_fijos/${imagen.foto}`));
                });
            }
        }
        listarImagenes();
    
        cambiarVista(vistaPrincipal, vistaImagen);
    }
}