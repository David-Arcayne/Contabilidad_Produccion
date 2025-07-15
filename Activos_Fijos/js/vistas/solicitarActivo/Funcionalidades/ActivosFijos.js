import { accionSelect, accionSelectDev, formularioAF, formularioAFDevolucion } from "../Formularios.js";
import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr, rellenarSelect } from "../../../funciones/Solicitudes.js";
import { eliminarRegistro } from "../../../funciones/OpcionesBasicas.js";

/**
 * Crea el contenido de la vista activos fijos.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaActivosFijos - Elemento contenedor de la vista activos fijos.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns
 */
export const ActivosFijos = (datosVista) => {
    const {
        vistaPrincipal,
        vistaActivosFijos,
        permisos
    } = datosVista;

    return ({registro}) => {
        const URL = "./api/solicitud-activo/activo-fijo";

        const regresar = () => { cambiarVista(vistaActivosFijos, vistaPrincipal) };
        const tituloVista = encabezadoVista("Volver", "Activos fijos", regresar);
        vistaActivosFijos.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalAF = crearElemento("div");
        const vistaRegistrarAF = crearElemento("div", {class: "d-none"});
        vistaActivosFijos.append(vistaRegistrarAF, vistaPrincipalAF)

        // Creación de elementos para la vista Principal
        const contenedorDeAlertas = crearElemento("div");
        vistaPrincipalAF.appendChild(contenedorDeAlertas);
        if (permisos.escritura === "1" && (registro.estado === null || registro.estado == 5)) {
            // const nuevoRegistro = () => cambiarVista(vistaPrincipalAF, vistaRegistrarAF);
            // const opciones = btnNuevoRegistro(nuevoRegistro);
            // opciones.classList.add("mb-2");
            // vistaPrincipalAF.appendChild(opciones);

            vistaRegistrarAF.classList.remove("d-none");
            vistaRegistrarAF.classList.add("mb-4");
        }
        let encabezadoTabla = [
            "Activo Fijo",
            "Detalle",
            "Cantidad",
            "Estado",
            "Opciones",
        ];
        let estiloTd = [
            "text-start",
            "text-start",
            "text-end",
            "text-start",
            "text-start",
        ];
        let recargarSelect = () => {
            const selectAF = vistaRegistrarAF.querySelector("#s_activofijo_af_id");
            $(selectAF)[0].selectize?.destroy();
            rellenarSelect(selectAF, { origen: "./api/solicitud-activo/activo-fijo/activos", llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] } }, undefined, {accion: accionSelect, div: vistaActivosFijos})
        }
        let contenidoTabla = [
            {
                nombre: "nombreactivofijo",
                miEstilo: NombreAF,
            },
            {
                nombre: "detalle",
                miEstilo: DetalleAF,
            },
            "cantidad",
            {
                nombre: "estado",
                miEstilo: EstadoAF(registro.estado),
            },
            {
                nombre: "Opciones",
                usarBasicos: { 
                    eliminar: eliminarRegistro({
                        vistaPrincipal: vistaPrincipalAF,
                        contenedorDeAlertas: contenedorDeAlertas,
                        URL,
                    }, undefined, recargarSelect),
                },
            }
        ];
        let formularioEnUso = formularioAF;
        let datosExtra = {movimientos_id: registro.id};
        if (registro.estado == 5 || registro.estado == 6 || registro.estado == 7 || registro.estado == 8) {
            formularioEnUso = formularioAFDevolucion(registro.trabajador_id);
            datosExtra = {movimientos_id: registro.id, origen_id: registro.trabajador_id};

            // encabezadoTabla = [
            //     "Activo Fijo",
            //     "Detalle",
            //     "Cantidad",
            //     "Estado",
            //     "Opciones",
            // ];
            // estiloTd = [
            //     "text-start",
            //     "text-start",
            //     "text-end",
            //     "text-start",
            //     "text-start",
            // ];
            recargarSelect = () => {
                const selectAF = vistaRegistrarAF.querySelector("#dev_activofijo_af_id");
                $(selectAF)[0].selectize?.destroy();
                rellenarSelect(selectAF, { origen: `./api/solicitud-activo/activo-fijo/devolucion/${registro.trabajador_id}`, llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] } }, undefined, {accion: accionSelectDev(registro.trabajador_id), div: vistaActivosFijos})
            }
            contenidoTabla = [
                {
                    nombre: "nombreactivofijo",
                    miEstilo: NombreAF,
                },
                {
                    nombre: "detalle",
                    miEstilo: DetalleAF,
                },
                "cantidad",
                {
                    nombre: "estado",
                    miEstilo: EstadoAF(registro.estado),
                },
                {
                    nombre: "Opciones",
                    usarBasicos: { 
                        eliminar: eliminarRegistro({
                            vistaPrincipal: vistaPrincipalAF,
                            contenedorDeAlertas: contenedorDeAlertas,
                            URL,
                        }, undefined, recargarSelect),
                    },
                }
            ];
        }


        if (permisos.eliminar === "0" || (registro.estado != null && registro.estado != 5) ) {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalAF.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(`${URL}/${registro.id}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1" && (registro.estado === null || registro.estado == 5)) {
            const cancelarRegistro = (e) => {
                e.preventDefault();
                cambiarVista(vistaRegistrarAF, vistaPrincipalAF);
            }
            const realizarRegistro = async () => {
                let listaDeRegistros = obtenerDatos(`${URL}/${registro.id}`);
                await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody);
                // cambiarVista(vistaRegistrarAF, vistaPrincipalAF);
                alertaDeExito(contenedorDeAlertas, "Registro exitoso");
                recargarSelect();
            }
            const errorRegistro = () => {
                // cambiarVista(vistaRegistrarAF, vistaPrincipalAF);
                alertaDeError(contenedorDeAlertas, "No se pudo realizar el registro");
                recargarSelect();
            }
            const datosFormulario = {
                myurl: URL,
                datosExtra,
                accionEnviar: realizarRegistro,
                error: errorRegistro,
                datosBtn: {
                    btnClass: "btn btn-primary",
                    nombre: "Registrar",
                    // accionCancelar: cancelarRegistro,
                }
            }
            const nuevoformulario = crearFormulario(formularioEnUso, datosFormulario);
            vistaRegistrarAF.append(nuevoformulario);
        }
    
        cambiarVista(vistaPrincipal, vistaActivosFijos);
    }   
}

/**
 * Obtine el nombre del registro.
 */
const NombreAF = ({elemento, registro}) => {
    elemento.innerHTML = registro.activosfijos_id ? registro.nombreactivofijo : registro.nombre || "";
}

/**
 * Obtine el detalle del registro.
 */
const DetalleAF = ({elemento, registro}) => {
    elemento.innerHTML = registro.activosfijos_id ? registro.detalleactivofijo : registro.detalle || "";
}

/**
 * Muestra el estado del activo fijo,
 */
const EstadoAF = (estadoSolicitud) => ({elemento, registro}) => {
    elemento.classList.add("text-nowrap");
    if ((registro.estado == 2 || registro.estado == null) || (estadoSolicitud != 1 && estadoSolicitud != 3 && estadoSolicitud != 6 && estadoSolicitud != 7)) {
        elemento.append("-");
        return;
    } 
    if (registro.estado == 1 && (estadoSolicitud == 1 || estadoSolicitud == 3)) {
        const i = crearElemento("i", {class: "bi bi-hand-thumbs-up-fill"});
        const boton = crearElemento("button", {class: "btn btn-sm btn-success pe-none"}, [i, " Adquirido"]);
        elemento.append(boton);
        return;
    } 
    if (registro.estado == 3 && (estadoSolicitud == 1 || estadoSolicitud == 3)) {
        const i = crearElemento("i", {class: "bi bi-hand-thumbs-down-fill"});
        const boton = crearElemento("button", {class: "btn btn-sm btn-danger pe-none"}, [i, " Rechazado"]);
        elemento.append(boton);
        return;
    }
    if (registro.estado == 1 && (estadoSolicitud == 6 || estadoSolicitud == 7)) {
        const i = crearElemento("i", {class: "bi bi-check-lg"});
        const boton = crearElemento("button", {class: "btn btn-sm btn-success pe-none"}, [i, " Devuelto"]);
        elemento.append(boton);
        return;
    } 
    if (registro.estado == 3 && (estadoSolicitud == 6 || estadoSolicitud == 7)) {
        const i = crearElemento("i", {class: "bi bi-x-lg"});
        const boton = crearElemento("button", {class: "btn btn-sm btn-danger pe-none"}, [i, " Rechazado"]);
        elemento.append(boton);
        return;
    }
}
