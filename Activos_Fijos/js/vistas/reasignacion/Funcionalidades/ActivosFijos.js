import { accionSelect, formularioAF } from "../Formularios.js";
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
        const URL = "./api/movimientos-reasignacion/activo-fijo";

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
        if (permisos.escritura === "1" && (registro.estado === 11)) {
            vistaRegistrarAF.classList.remove("d-none");
            vistaRegistrarAF.classList.add("mb-4");
        }
        let encabezadoTabla = [
            "Activo Fijo",
            "Detalle",
            "Cantidad",
            "Sucursal origen",
            "Área origen",
            "Tabajador origen",
            "Sucursal destino",
            "Área destino",
            "Trabajador destino",
            "Estado",
            "Opciones",
        ];
        let estiloTd = [
            "text-start",
            "text-start",
            "text-end",
            "text-start",
            "text-start",
            "text-start",
            "text-start",
            "text-start",
            "text-start",
            "text-start",
            "text-start",
        ];
        let recargarSelect = () => {
            const selectAF = vistaRegistrarAF.querySelector("#mov_reasg_af_id");
            $(selectAF)[0].selectize?.destroy();
            rellenarSelect(selectAF, { origen: "./api/solicitud-activo/activo-fijo/activos", llaves: { id: "id", detalle: ["codigo", "nombre", "detalle"] } }, undefined, {accion: accionSelect(), div: vistaActivosFijos})
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
            "nombresucursal",
            "nombrearea",
            "nombretrabajador",
            "nombresucursaldestino",
            "nombreareadestino",
            "nombretrabajadordestino",
            {
                nombre: "estado",
                miEstilo: EstadoAF,
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


        if (permisos.eliminar === "0" || (registro.estado == 12) ) {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalAF.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(`${URL}/${registro.id}`, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1" && (registro.estado === 11)) {
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
                datosExtra: {movimientos_id: registro.id},
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
const EstadoAF = ({elemento, registro}) => {
    elemento.classList.add("text-nowrap");
    if (registro.estado != 1) {
        elemento.append("-");
        return;
    } else if (registro.trabajador_id && registro.trabajador_destino) {
        const i = crearElemento("i", {class: "bi bi-arrow-left-right pe-1"});
        const boton = crearElemento("button", {class: "btn btn-sm btn-success pe-none"}, [i, " Traslado"]);
        elemento.append(boton);
        return;
    } else if (registro.trabajador_id) {
        const i = crearElemento("i", {class: "bi bi-box-arrow-right pe-1"});
        const boton = crearElemento("button", {class: "btn btn-sm btn-danger pe-none"}, [i, " Removido"]);
        elemento.append(boton);
        return;
    } else if (registro.trabajador_destino) {
        const i = crearElemento("i", {class: "bi bi-box-arrow-in-right pe-1"});
        const boton = crearElemento("button", {class: "btn btn-sm btn-success pe-none"}, [i, " Asignado"]);
        elemento.append(boton);
        return;
    }
}
