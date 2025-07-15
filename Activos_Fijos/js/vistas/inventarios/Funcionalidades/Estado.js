import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearElemento } from "../../../funciones/Funciones.js";
import { enviarDatosFormulario, obtenerDatos, rellenarSelect } from "../../../funciones/Solicitudes.js";

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
export const Estado = (datosVista) => {
    const {
        vistaActivosFijos,
        contenedorDeAlertas,
        inventario,
        URL,
        permisos
    } = datosVista;

    return ({ elemento, registro, contenidoTabla, tbody}) => {
        const fechaFin = new Date(inventario.fechafin)
        const fechaActual = new Date(registro.fechaactual)
        if (fechaFin <= fechaActual ) {
            // elemento.setAttribute("class", "btn btn-sm btn-info pe-none");
            // elemento.append(`${registro.nombreestado ? registro.nombreestado : "N/R"}`);
            elemento.remove();
            return;
        }
        console.log(registro);
        
        if (registro.cantidad_verificada == null || parseInt(registro.cantidad_verificada) < parseInt( registro.cantidad)) {
            const i = crearElemento("i", {class: "bi bi-pencil-square"});
            elemento.setAttribute("class", "btn btn-sm btn-light")
            elemento.append(i, " Verificar")
    
            if (permisos.editar === "0") {
                elemento.classList.add("pe-none");
                elemento.innerHTML = "...";
                return;
            }

            const cantidadVerificada = [];
            const cantidadActivo = parseInt(registro.cantidad);
            cantidadVerificada.push(registro.cantidad_verificada ? parseInt(registro.cantidad_verificada) : 0);

            elemento.addEventListener("click", async () => {

                const btnEnviar = crearElemento("button", {class: "btn btn-success mt-3", id: "btn-enviar-formulario"}, ["Cambiar"]);
                const btnCancelar = crearElemento("a", {class: "btn btn-secondary mt-3"}, ["Cancelar"]);
                const contenedorMensaje = crearElemento("div", {class: "floating-message text-center p-md-4", style:"width: 100%; max-width:450px; min-width: 250px"});
                const contenedorModal = crearElemento("div", {class: "inner-div"}, [contenedorMensaje]);

                // Elimina el modal si se hace click fuera del contendor de mensaje
                contenedorModal.addEventListener("click", function (event) {
                    if ((contenedorMensaje && !contenedorMensaje.contains(event.target)) || (btnCancelar && btnCancelar.contains(event.target))) {
                        contenedorModal.remove();
                    }
                });

                const  tiposEstado = await obtenerDatos(`./api/tipo-estado`);
                if (tiposEstado && tiposEstado.data.length > 0) {
                    const divTiposEstado = crearElemento("div", {class: "row row-cols-1 row-cols-md-2 g-2 border px-1 px-sm-4 pt-0 pb-2 m-0 rounded"});
                    if (tiposEstado.data.length <= 2) divTiposEstado.setAttribute("class", "row row-cols-1 g-2 border px-1 px-sm-4 pt-0 pb-2 m-0 rounded");

                    const invCantidad = crearElemento("input", {type: "number", class: "form-control", placeholder: "Cantidad", max: registro.cantidad, name: "cantidad_inv", required: ""});
                    const divCantidadInv = crearElemento("div", {class: "pb-2"}, [invCantidad]);
                    let arrayEstado = [];
                    for (const dato of tiposEstado.data) {
                        const inputRadio = crearElemento("input", {type: "radio", class: "btn-check", name: "tipoestado_id", value: dato.id, id: `radio-${dato.id}`, autocomplete: "off", required: ""});
                        const label = crearElemento("label", {class: "btn btn-sm btn-outline-primary", for: `radio-${dato.id}`}, [dato.nombre]);
                        const divInput = crearElemento("div", {class: "d-grid"}, [inputRadio, label]);
                        const divCol = crearElemento("div", {class: "col"}, [divInput]);
                        divTiposEstado.appendChild(divCol);
                        arrayEstado[dato.id] = dato.nombre;
                    }

                    const divFormObs = crearElemento("div", { class: "d-none text-start" });

                    const observacion = crearElemento("textarea", {class: "form-control", name: "observacion", placeholder: "Observación", rows: "2"});
                    const divObservacion = crearElemento("div", {class: "mt-2"}, [observacion]);
                    const paraBaja = crearElemento("input", { type: "radio", class: "form-check-input", name: "enviar_a", value: "2", id: "e_bajas" });
                    const labelBaja = crearElemento("label", { class: "form-check-label", for: "e_bajas" }, ["Enviar a Bajas"]);
                    const divBaja = crearElemento("div", { class: "form-check form-check-inline" }, [paraBaja, labelBaja]);
                    const paraSituacion = crearElemento("input", { type: "radio", class: "form-check-input", name: "enviar_a", value: "3", id: "e_situacion" });
                    const labelSituacion = crearElemento("label", { class: "form-check-label", for: "e_situacion" }, ["Enviar a Situación"]);
                    const divSituacion = crearElemento("div", { class: "form-check form-check-inline" }, [paraSituacion, labelSituacion]);
                    const paraMovimiento = crearElemento("input", { type: "radio", class: "form-check-input", name: "enviar_a", value: "4", id: "e_movimientos" });
                    const labelMovimiento = crearElemento("label", { class: "form-check-label", for: "e_movimientos" }, ["Enviar a Movimiento"]);
                    const divMovimiento = crearElemento("div", { class: "form-check form-check-inline" }, [paraMovimiento, labelMovimiento]);
                    let lastChecked;
                    paraBaja.addEventListener('click', function(e) {
                        if (lastChecked === this) {
                            this.checked = false;
                            lastChecked = null;
                            divFormObs.innerHTML = "";
                        } else {
                            lastChecked = this;

                            divFormObs.classList.remove("d-none");
                            const valorCInv = invCantidad.value;
                            let cantidad = null;
                            if (valorCInv && valorCInv.trim() !== "") {
                                cantidad = crearElemento("input", {type: "number", class: "form-control", placeholder: "Cantidad bajas", id: "obs_cantidad", max: registro.cantidad, required: "", value: valorCInv});
                            } else {
                                cantidad = crearElemento("input", {type: "number", class: "form-control", placeholder: "Cantidad bajas", id: "obs_cantidad", max: registro.cantidad, required: ""});
                            }
                            const formulario = crearElemento("form", {class: "form g-2 my-3", id: "form-cantidad"}, [cantidad]);
                            divFormObs.replaceChildren(formulario);
                        }
                    });
                    paraSituacion.addEventListener('click', function(e) {
                        if (lastChecked === this) {
                            this.checked = false;
                            lastChecked = null;
                            divFormObs.innerHTML = "";
                        } else {
                            lastChecked = this;
                            divFormObs.innerHTML = "";
                        }
                    });
                    paraMovimiento.addEventListener('click', function(e) {
                        if (lastChecked === this) {
                            this.checked = false;
                            lastChecked = null;
                            divFormObs.innerHTML = "";
                        } else {
                            lastChecked = this;

                            divFormObs.classList.remove("d-none");
                            divFormObs.classList.remove("d-none");
                            const valorCInv = invCantidad.value;
                            let cantidad = null;
                            if (valorCInv && valorCInv.trim() !== "") {
                                cantidad = crearElemento("input", {type: "number", class: "form-control my-3", placeholder: "Cantidad movimiento", id: "obs_cantidad", max: registro.cantidad, required: "", value: valorCInv});
                            } else {
                                cantidad = crearElemento("input", {type: "number", class: "form-control my-3", placeholder: "Cantidad movimiento", id: "obs_cantidad", max: registro.cantidad, required: ""});
                            }
                            const sucursal = crearElemento("select", {class: "form-select my-3", id: "obs_sucursal_id", required: ""});
                            const optionArea = crearElemento("option", {value: ""}, ["-- Seleccione una sucursal --"]);
                            const area = crearElemento("select", {class: "form-select my-3", id: "obs_area_id", required: ""}, [optionArea]);
                            const optionTr = crearElemento("option", {value: ""}, ["-- Seleccione un área --"]);
                            const trabajador = crearElemento("select", {class: "form-select my-3", id: "obs_trabajador_id", required: ""}, [optionTr]);
                            const formulario = crearElemento("form", {class: "form g-2 my-3", id: "form-movimiento"}, [cantidad, sucursal, area, trabajador]);
                            divFormObs.replaceChildren(formulario);

                            const accionSucursal = async(valor) => {
                                if (valor) {
                                        rellenarSelect(area, {origen:`./api/externo-area/by-sucursal/${valor}`, llaves:{id:"idareas", detalle:"nombre"}, textNF: "no hay área", text: "area"}, undefined, {accion: accionArea});
                                } else {
                                    area.selectize?.clear();
                                    area.selectize?.destroy();
                                    area.innerHTML = "<option value=''>-- Seleccione una sucursal --</option>";
                                }
                            };

                            const accionArea = async(valor) => { 
                                if (valor) {
                                    rellenarSelect(trabajador,{origen:`./api/externo-encargado/by-areas/${valor}`, llaves:{id:"idtrabajador", detalle:"nombreapellido"}, textNF: "no hay trabajadores", text: "trabajador"});
                                } else {
                                    trabajador.selectize?.clear();
                                    trabajador.selectize?.destroy();
                                    trabajador.innerHTML = "<option value=''>-- Seleccione un área --</option>";
                                }
                            };

                            rellenarSelect(sucursal, { origen: "./api/externo-sucursal/activos", llaves: { id: "idsucursalcontable", detalle: "nombre" }, text: "Sucursal" }, undefined, {accion: accionSucursal});
                        }
                    });

                    const divEnviarA = crearElemento("div", { class: "mt-3" }, [divBaja, divSituacion, divMovimiento]);
                    
                    const texto = crearElemento("h6", {class: "text-center fw-bold pb-2"}, ["TIPOS DE ESTADO"]);
                    const spanCtd = crearElemento("span", {class: "fw-bold"}, [cantidadActivo]);
                    const spanCtdV = crearElemento("span", {class: "fw-bold"}, [cantidadVerificada[0]]); 
                    const divCodigo = crearElemento("div", {class: "text-start mb-1"}, [crearElemento("span", {class: "fw-bold"}, ["Código: "]), registro.codigo]);
                    const divNombre = crearElemento("div", {class: "text-start mb-1"}, [crearElemento("span", {class: "fw-bold"}, ["Nombre: "]), registro.nombre]);
                    const divDescripcion = crearElemento("div", {class: "text-start mb-2"}, [crearElemento("span", {class: "fw-bold"}, ["Descripción: "]), registro.detalle]);
                    const divMensaje = crearElemento("div", {class: "text-start mb-2"}, [divCodigo, divNombre, divDescripcion, "Cantidad: ", spanCtd, ", Verificados: ", spanCtdV]);
                    const divBtns = crearElemento("div", undefined, [btnEnviar, " ", btnCancelar]);
                    const form = crearElemento("form", {class: "container"}, [texto, divMensaje, divCantidadInv, divTiposEstado, divObservacion, divFormObs, divEnviarA, divBtns]);
                    contenedorMensaje.appendChild(form);

                    form.addEventListener("submit", (e) => {
                        e.preventDefault();
                        const cantidadV = cantidadVerificada[0] + parseInt(invCantidad.value || 0);
                        const mensajeE = crearElemento("p", {class: "text-danger p-0 m-0 mt-2"}, ["La cantidad verificada no puede ser mayor a la cantidad de activos"]);
                        if (cantidadV > cantidadActivo) {
                            divMensaje.appendChild(mensajeE);
                            return;
                        }
                        mensajeE.remove();
                        cantidadVerificada[0] = cantidadV;


                        const accionEnviar = async (respuesta) => {
                            const cantidadActual = await obtenerDatos(`${URL}/qr/${inventario.id}/${registro.codigo}`);
                            if (cantidadActual && cantidadActual.data) {
                                const cantidadF = cantidadActual.data[0].cantidad_verificada;
                                console.log({cantidadF});
                                
                                if (parseInt(cantidadF) >= parseInt(registro.cantidad)) {
                                    elemento.remove();
                                }
                            }
                            
                            contenedorModal.remove();
                            // const estado = crearElemento("a", {class: "btn btn-sm btn-primary pe-none"}, [arrayEstado[respuesta.tipoestado_id]]);
                            // const td = elemento.closest("td");
                            // td.replaceChildren(estado);
                            if (respuesta.observacion) {
                                const tdObservacion = td.previousElementSibling;
                                tdObservacion.innerHTML = respuesta.observacion;
                            }
                            alertaDeExito(contenedorDeAlertas, "Estado asignado correctamente")
                        }
                        const error = () => {
                            contenedorModal.remove();
                            alertaDeError(contenedorDeAlertas, "Ocurrio un error")
                        }

                        const cantidad = divFormObs.querySelector("#obs_cantidad")?.value;
                        const sucursal = divFormObs.querySelector("#obs_sucursal_id")?.value;
                        const area = divFormObs.querySelector("#obs_area_id")?.value;
                        const trabajador = divFormObs.querySelector("#obs_trabajador_id")?.value;
                        
                        enviarDatosFormulario({
                            refForm: form,
                            myUrl: URL,
                            datosExtra: {
                                inventarios_id: inventario.id,
                                activosfijos_id: registro.activosfijos_id,
                                codigo: registro.codigo,
                                empresa_id: registro.empresa_id,
                                obs_cantidad: cantidad ?? "",
                                obs_sucursal: sucursal ?? "",
                                obs_area: area ?? "",
                                obs_trabajador: trabajador ?? "",
                            },
                            redireccion: accionEnviar,
                            error: error,
                        });
                    });
                } else {
                    const informacion = crearElemento("p", {class: "fs-4 text-secondary text-center"}, ["No se encontraron registros de Tipos de estado."]);
                    btnCancelar.setAttribute("class", "btn btn-primary");
                    btnCancelar.innerHTML = "Ok";
                    contenedorMensaje.append(informacion, btnCancelar);
                }

                vistaActivosFijos.append(contenedorModal)
            });
        } else {
            // if (registro.cantidad == 1 && registro.estado_unico) {
            //     elemento.setAttribute("class", "btn btn-sm btn-primary pe-none");
            //     elemento.append(`${registro.estado_unico}`);
            // } else {
                elemento.remove();
            // }
            
        } 
    }
}
