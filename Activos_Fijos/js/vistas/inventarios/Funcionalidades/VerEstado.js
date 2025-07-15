import { contenidoTBody } from "../../../funciones/CrearTabla.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { modalDeConfirmacion } from "../../../funciones/Modals.js";
import { eliminarDato, enviarDatosFormulario, obtenerDatos, rellenarSelect } from "../../../funciones/Solicitudes.js";

/**
 * Crea un boton segun el estado con la funcionalidad de un modal para elejir estados.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaActivosFijos - Elemento de la vista Activos Fijos.
 * @param {HTMLElement} datosVista.contenedorDeAlertas - Elemento que contendra las alertas.
 * @param {(string|number)} datosVista.inventario - Datos del inventario.
 * @param {string} datosVista.URL - URL principal.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns
 */
export const VerEstado = (datosVista) => {
    const {
        vistaActivosFijos,
        contenedorDeAlertas,
        inventario,
        URL,
        permisos,
        estiloTd
    } = datosVista;

    return ({ elemento, registro, contenidoTabla, tbody}) => {
        
        const i = crearElemento("i", {class: "bi bi-eye-fill"});
        elemento.setAttribute("class", "btn btn-sm btn-info")
        elemento.append(i, " Ver ")
        
        elemento.addEventListener("click", async () => {
            if (!registro.id_af_inventario) {
                const estado = await obtenerDatos(`${URL}/qr/${inventario.id}/${registro.codigo}`);
                if (estado && estado.data) {
                    registro.id_af_inventario = estado.data[0].id_af_inventario;
                }
            }

            const btnEnviar = crearElemento("button", {class: "btn btn-success mt-3", id: "btn-enviar-formulario"}, ["Cambiar"]);
            const contenedorMensaje = crearElemento("div", {class: "floating-message p-md-4", style:"width: 100%; max-width:450px; min-width: 250px"});
            const contenedorModal = crearElemento("div", {class: "inner-div"}, [contenedorMensaje]);

            const titulo = crearElemento("h6", {class: "text-center fw-bold"}, ["Estados del Activo Fijo"]);
            
            if (!registro.id_af_inventario) {
                const mensaje = crearElemento("h6", {class: "text-center fw-bold"}, ["Sin registros"]);
                contenedorMensaje.append(mensaje);
            } else {
                const listaDeRegistros = await obtenerDatos(`${URL}/estados/${registro.id_af_inventario}`);
                console.log({listaDeRegistros});
                
                if (listaDeRegistros && listaDeRegistros.data?.length > 0) {
                    const divContEstados = crearElemento("div", {class: ""});

                    listaDeRegistros.data.forEach((reg) => {
                        const fechaFin = new Date(inventario.fechafin)
                        const fechaActual = new Date(registro.fechaactual)

                        const divCard = crearElemento("div", {class: "card mb-2"});
                        const informacion = `
                            <div class="row g-0">
                                
                                <div class="col">
                                    <div class="p-2 pe-0" id="contenido-obs-${reg.id}">
                                        <p class="card-text mb-1"><span class="fw-bold">Cantidad: </span> ${reg.cantidad}</p>
                                        <p class="card-text mb-1"><span class="fw-bold">Estado: </span> ${reg.nombreestado}</p>
                                        <p class="card-text mb-1"><span class="fw-bold">Observación: </span> ${reg.observacion ?? "-"}</p>
                                    </div>
                                </div>
                                ${
                                    fechaFin > fechaActual ?
                                    `<div class="col-auto p-1">
                                        <a class="btn btn-danger px-1 py-0" id="borra-observacion-${reg.id}"><i class="bi bi-trash-fill"></i></a>
                                    </div>` : ""
                                }
                            </div>`;
                        divCard.innerHTML = informacion;
                        const btnBorrar = divCard.querySelector(`#borra-observacion-${reg.id}`);
                        btnBorrar?.addEventListener("click", async () => {
                            const eliminar = async () => {
                                const eliminado = async () => {
                                    btnBorrar.closest(".card").remove();
                                    
                                    const datosTabla = await obtenerDatos(`${URL}/${inventario.id}`);
                                    if (datosTabla && datosTabla.data) {
                                        contenidoTBody(datosTabla, {contenido: contenidoTabla, estiloTd}, tbody);
                                    }
                                    if (divContEstados.children.length === 0) {
                                        contenedorModal.remove();
                                    }
                                }
                                const alerta = () => {
                                    const cardE = btnBorrar.closest(".card");
                                    cardE.classList.add("border", "border-danger");
                                    setTimeout(() => {
                                        cardE.classList.remove("border", "border-danger");
                                    }, 3000);
                                }
                                await eliminarDato(`${URL}/estados/${reg.id}`, eliminado, alerta)
                            }
                            vistaActivosFijos.appendChild(modalDeConfirmacion(eliminar, "¿Está seguro de borrar el registro?"))
                        });
                        
                        divContEstados.append(divCard);
                    });
                    contenedorMensaje.append(titulo, divContEstados);
                } else {
                    const mensaje = crearElemento("h6", {class: "text-center fw-bold"}, ["Sin registros"]);
                    contenedorMensaje.append(mensaje);
                }
            }

            // Elimina el modal si se hace click fuera del contendor de mensaje
            contenedorModal.addEventListener("click", function (event) {
                if ((contenedorMensaje && !contenedorMensaje.contains(event.target)) || (btnEnviar && btnEnviar.contains(event.target))) {
                    contenedorModal.remove();
                }
            });
                
            vistaActivosFijos.append(contenedorModal)
        });
    }
}
