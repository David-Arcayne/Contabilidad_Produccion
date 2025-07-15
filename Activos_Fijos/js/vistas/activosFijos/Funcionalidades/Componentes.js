import { formularioAFComponentes } from "../Formularios.js";
import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, FormatoDate } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { editarRegistro, eliminarRegistro } from "../../../funciones/OpcionesBasicas.js";
import { ImagenComponentes } from "./ImagenComponentes.js";
import { Situacion } from "./Situacion.js";

/**
 * Crea el contenido de la vista Componentes.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaComponentes - Elemento contenedor de la vista componentes.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const ComponentesAF = (datosVista) => {
    const {
        vistaPrincipal,
        vistaComponentes, 
        permisos
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return ({registro}) => {
        const URL = "./api/componentes";

        const spanFI = crearElemento("span", {class: "fw-semibold"}, ["Feha de ingrego: "]);
        const pFechaingreso = crearElemento("p", {class: ""}, [spanFI, FormatoDate(registro.fechacompra)]);
        const spanNombre = crearElemento("span", {class: "fw-semibold"}, ["Nombre: "]);
        const pNombre = crearElemento("p", {class: ""}, [spanNombre, registro.nombre]);
        const spanDetalle = crearElemento("span", {class: "fw-semibold"}, ["Descripción: "]);
        const pDetalle = crearElemento("p", {class: ""}, [spanDetalle, registro.detalle]);
        const divInformacion = crearElemento("div", undefined, [pFechaingreso, pNombre, pDetalle]);

        const regresar = () => { cambiarVista(vistaComponentes, vistaPrincipal) }
        const tituloVista = encabezadoVista("Volver", "Componentes", regresar, "btn-warning", divInformacion)
        vistaComponentes.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaRegistrarComponente = crearElemento("div", {class: "d-none"});
        const vistaPrincipalComponente = crearElemento("div", undefined, [vistaRegistrarComponente]);
        const vistaEditarComponente = crearElemento("div", {class: "d-none"});
        const vistaSituacionComponente = crearElemento("div", {class: "d-none"});

        // vistaComponentes.append(vistaRegistrarComponente, vistaPrincipalComponente, vistaEditarComponente, vistaSituacionComponente);
        vistaComponentes.append(vistaPrincipalComponente, vistaEditarComponente, vistaSituacionComponente);
        
        // Creación de elementos para la vista principal
        const alertasComponentes = crearElemento("div");
        vistaPrincipalComponente.appendChild(alertasComponentes);
        if (permisos.escritura === "1") {
            // const nuevoRegistro = () => cambiarVista(vistaPrincipalComponente, vistaRegistrarComponente);
            // const opciones = btnNuevoRegistro(nuevoRegistro);
            // opciones.classList.add("mb-2");
            // vistaPrincipalComponente.appendChild(opciones);

            vistaRegistrarComponente.classList.remove("d-none");
            vistaRegistrarComponente.classList.add("mb-4");
        }

        const estiloTd = [
            "text-end",
            "text-start",
            "text-end",
            "text-start",
            "text-start",
            "text-start",
        ];
        let usarBasicos = {
            editar: editarRegistro({
                vistaPrincipal: vistaPrincipalComponente,
                vistaEditar: vistaEditarComponente,
                contenedorDeAlertas: alertasComponentes,
                camposDeFormulario: formularioAFComponentes,
                URL,
                URL2: `${URL}/activofijo/${registro.id}`,
                estiloTd,
            }), 
            eliminar: eliminarRegistro({
                vistaPrincipal: vistaComponentes,
                contenedorDeAlertas: alertasComponentes,
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
            "Código",
            "Nombre",
            "Cantidad",
            // "Estado",
            "Descripcion",
            "Imagen",
            // "Situación",
            "Opciones",
        ];
        const contenidoTabla = [
            "codigo",
            "nombre",
            "cantidad",
            // "estado",
            "descripcion",
            {
                nombre: "imagen",
                miEstilo: ImagenComponentes(vistaComponentes),
            },
            // {
            //     nombre: "Situación",
            //     accion: {
            //         estilo: Situacion({
            //             vistaPrincipal: vistaPrincipalComponente,
            //             vistaSituacion: vistaSituacionComponente,
            //             contenedorDeAlertas: alertasComponentes,
            //             URL: `${URL}/activofijo/${registro.id}`,
            //             permisos,
            //             activofijo_id: registro.id
            //         }),
            //         condicional: { llave: "eliminado_en" },
            //     },
            // },
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
        vistaPrincipalComponente.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(`${URL}/activofijo/${registro.id}`, { contenedor: alertasComponentes, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1") {
            const cancelarRegistro = (e) => {
                e.preventDefault();
                cambiarVista(vistaRegistrarComponente, vistaPrincipalComponente);
            }
            const realizarRegistro = async () => {
                let listaDeRegistros = obtenerDatos(`${URL}/activofijo/${registro.id}`);
                await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
                // cambiarVista(vistaRegistrarComponente, vistaPrincipalComponente);
                alertaDeExito(alertasComponentes, "Registro exitoso");
            }
            const errorRegistro = () => {
                // cambiarVista(vistaRegistrarComponente, vistaPrincipalComponente);
                alertaDeError(alertasComponentes, "No se pudo realizar el registro");
            }
            const datosFormulario = {
                myurl: URL,
                datosExtra: {activosfijos_id: registro.id, codigo_af: registro.codigo},
                accionEnviar: realizarRegistro,
                error: errorRegistro,
                datosBtn: {
                    btnClass: "btn btn-primary",
                    nombre: "Registrar",
                    // accionCancelar: cancelarRegistro,
                }
            }
            const nuevoformulario = crearFormulario(formularioAFComponentes, datosFormulario);
            vistaRegistrarComponente.append(nuevoformulario);
        }
    
        cambiarVista(vistaPrincipal, vistaComponentes)
    }   
}