import { formularioCuadroDprUso } from "../Formularios.js";
import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { editarRegistro, eliminarRegistro } from "../../../funciones/OpcionesBasicas.js";

/**
 * Crea el contenido de la vista Componentes.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaActivoFijo - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaValoresUso - Elemento contenedor de la vista Valores de uso.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const ValoresUso = (datosVista) => {
    const {
        vistaActivoFijo,
        vistaValoresUso, 
        permisos
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return ({registro}) => {
        const URL = "./api/uso-activofijo";

        const regresar = () => { cambiarVista(vistaValoresUso, vistaActivoFijo) }
        const tituloVista = encabezadoVista("Volver", "Valores de Uso", regresar)
        vistaValoresUso.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalUso = crearElemento("div");
        const vistaEditarUso = crearElemento("div", {class: "d-none"});
        
        vistaValoresUso.append(vistaPrincipalUso, vistaEditarUso);
        
        // Creación de elementos para la vista principal
        const alertasUso = crearElemento("div");
        const vistaRegistrarUso = crearElemento("div", {class: "pb-5"});
        if (permisos.escritura === "1") {
            vistaPrincipalUso.appendChild(vistaRegistrarUso);
        }
        vistaPrincipalUso.appendChild(alertasUso);

        const estiloTd = [
            "text-end",
            "text-end",
            "text-start",
        ];
        let usarBasicos = {
            editar: editarRegistro({
                vistaPrincipal: vistaPrincipalUso,
                vistaEditar: vistaEditarUso,
                contenedorDeAlertas: alertasUso,
                camposDeFormulario: formularioCuadroDprUso,
                URL,
                URL2: `${URL}/activofijo/${registro.id}`,
                estiloTd,
            }), 
            eliminar: eliminarRegistro({
                vistaPrincipal: vistaValoresUso,
                contenedorDeAlertas: alertasUso,
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
            "Uso",
            "Opciones",
        ];
        const contenidoTabla = [
            "fecha",
            "uso",
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
        vistaPrincipalUso.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(`${URL}/activofijo/${registro.id}`, { contenedor: alertasUso, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1") {
            const realizarRegistro = async () => {
                let listaDeRegistros = obtenerDatos(`${URL}/activofijo/${registro.id}`);
                await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
                alertaDeExito(alertasUso, "Registro exitoso");
            }
            const errorRegistro = () => {
                alertaDeError(alertasUso, "No se pudo realizar el registro");
            }
            const datosFormulario = {
                myurl: URL,
                datosExtra: {activosfijos_id: registro.id},
                accionEnviar: realizarRegistro,
                error: errorRegistro,
                datosBtn: {
                    btnClass: "btn btn-primary",
                    nombre: "Guardar",
                }
            }
            const nuevoformulario = crearFormulario(formularioCuadroDprUso, datosFormulario);
            vistaRegistrarUso.append(nuevoformulario);
        }
    
        cambiarVista(vistaActivoFijo, vistaValoresUso)
    }   
}