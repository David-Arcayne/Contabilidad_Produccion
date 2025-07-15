import { formularioAFRevaluo } from "../Formularios.js";
import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { editarRegistro, eliminarRegistro } from "../../../funciones/OpcionesBasicas.js";

/**
 * Crea el contenido de la vista Revaluo.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaRevaluo - Elemento contenedor de la vista revaluo.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const Revaluo = (datosVista) => {
    const {
        vistaPrincipal,
        vistaRevaluo, 
        permisos
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return ({registro}) => {
        const URL = "./api/revaluo";

        const regresar = () => { cambiarVista(vistaRevaluo, vistaPrincipal) }
        const tituloVista = encabezadoVista("Volver", "Revaluos", regresar)
        vistaRevaluo.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalRevaluo = crearElemento("div");
        const vistaRegistrarRevaluo = crearElemento("div", {class: "d-none"});
        const vistaEditarRevaluo = crearElemento("div", {class: "d-none"});

        vistaRevaluo.append(vistaPrincipalRevaluo, vistaRegistrarRevaluo, vistaEditarRevaluo);
        
        // Creación de elementos para la vista principal
        const alertasRevaluo = crearElemento("div");
        vistaPrincipalRevaluo.appendChild(alertasRevaluo);
        if (permisos.escritura === "1") {
            const nuevoRegistro = () => cambiarVista(vistaPrincipalRevaluo, vistaRegistrarRevaluo);
            const opciones = btnNuevoRegistro(nuevoRegistro);
            opciones.classList.add("mb-2");
            vistaPrincipalRevaluo.appendChild(opciones);
        }

        const estiloTd = [
            "date",
            "text-end",
            "text-end",
            "decimal",
            "text-start",
        ];
        let usarBasicos = {
            editar: editarRegistro({
                vistaPrincipal: vistaPrincipalRevaluo,
                vistaEditar: vistaEditarRevaluo,
                contenedorDeAlertas: alertasRevaluo,
                camposDeFormulario: formularioAFRevaluo,
                URL,
                URL2: `${URL}/activofijo/${registro.id}`,
                estiloTd,
            }), 
            eliminar: eliminarRegistro({
                vistaPrincipal: vistaRevaluo,
                contenedorDeAlertas: alertasRevaluo,
                URL,
            }),
        };
        if(permisos.editar === "0") {
            delete usarBasicos.editar;
        }
        if(permisos.eliminar === "0") {
            delete usarBasicos.eliminar;
        }
        const encabezadoTabla = [
            "Fecha",
            "Vida util",
            "Capacidad de fábrica",
            "Valor",
            "Opciones",
        ];
        const contenidoTabla = [
            "fecharevaluo",
            "vidautilrevaluo",
            "duracionrevaluo",
            "valorrevaluo",
            {
                nombre: "Opciones",
                usarBasicos,
            }
        ];
        if (permisos.editar === "0" && permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }

        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalRevaluo.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(`${URL}/activofijo/${registro.id}`, { contenedor: alertasRevaluo, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1") {
            const cancelarRegistro = (e) => {
                e.preventDefault();
                cambiarVista(vistaRegistrarRevaluo, vistaPrincipalRevaluo);
            }
            const realizarRegistro = async () => {
                let listaDeRegistros = obtenerDatos(`${URL}/activofijo/${registro.id}`);
                await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
                cambiarVista(vistaRegistrarRevaluo, vistaPrincipalRevaluo);
                alertaDeExito(alertasRevaluo, "Registro exitoso");
            }
            const errorRegistro = () => {
                cambiarVista(vistaRegistrarRevaluo, vistaPrincipalRevaluo);
                alertaDeError(alertasRevaluo, "No se pudo realizar el registro");
            }
            const datosFormulario = {
                myurl: URL,
                datosExtra: {activosfijos_id: registro.id},
                accionEnviar: realizarRegistro,
                error: errorRegistro,
                datosBtn: {
                    btnClass: "btn btn-primary",
                    nombre: "Guardar",
                    accionCancelar: cancelarRegistro,
                }
            }
            const nuevoformulario = crearFormulario(formularioAFRevaluo, datosFormulario);
            vistaRegistrarRevaluo.append(nuevoformulario);
        }
    
        cambiarVista(vistaPrincipal, vistaRevaluo)
    }   
}