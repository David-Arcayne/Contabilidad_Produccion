import { URL_APIC } from "../../../../../lib/services.js";
import { FilaDeRegistro } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista, FormatoEnUs } from "../../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { formularioAA } from "../Formularios.js";

/**
 * Crea el contenido de la vista Crear Asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaAgregarAsiento - Elemento contenedor de la vista crear asiento.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const AgregarAsiento = (datosVista) => {
    const {
        vistaPrincipal,
        vistaAgregarAsiento, 
        permisos
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Asiento modelo.
     */
    return ({registro}) => {
        const URL = `${URL_APIC}api/`;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        const URL_LT = `${URL}listaasientosc/${registro.id}`;

        // Crear la sección de cabecera de la vista.
        const spanAsiento = crearElemento("span", { class: "fw-bold" }, [`Asiento: `]);
        const divAsiento = crearElemento("div", undefined, [spanAsiento, registro.nombre]);
        const spanTipo = crearElemento("span", { class: "fw-bold" }, [`Tipo: `]);
        const divTipo = crearElemento("div", undefined, [spanTipo, registro.tipo ?? "-"]);
        const divInformacion = crearElemento("div", { class: "pb-2" }, [divAsiento, divTipo]);
        const regresar = () => { cambiarVista(vistaAgregarAsiento, vistaPrincipal) }
        const tituloVista = encabezadoVista("Volver", "Creación de asiento modelo", regresar, undefined, divInformacion);
        vistaAgregarAsiento.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalAA = crearElemento("div");
        const vistaRegistrarAA = crearElemento("div", {class: "d-none"});

        vistaAgregarAsiento.append(vistaPrincipalAA, vistaRegistrarAA);
        
        // Creación de elementos para la vista principal
        const alertasAA = crearElemento("div");
        vistaPrincipalAA.appendChild(alertasAA);
        const encabezadoTabla = [
            "Código",
            "Cuenta",
            "%",
            "Tipo",
            "Opciones",
        ];
        const estiloTd = [
            "text-end",
            "text-start",
            "text-end",
            "text-start",
            "text-start",
        ];
        const contenidoTabla = [
            "numero",
            "plan",
            {
                nombre: "porciento",
                agregarT: Porcentaje,
            },
            "tipo",
            {
                nombre: "Opciones",
                usarBasicos: {
                    editar: editarRegistroModal({
                        vistaPrincipal: vistaPrincipalAA,
                        contenedorDeAlertas: alertasAA,
                        camposDeFormulario: formularioAA,
                        URL_FORM: `${URL}`,
                        URL_LISTAR: URL_LT,
                        estiloTd,
                    }, {
                        datosExtra: [
                            { key: "id", value_r: "id" },
                            { key: "asiento", value: registro.id },
                            { key: "ver", value: "registrocrearasientosf5" },
                            { key: "empresa", value: empresa_id },
                        ]
                    }),
                    eliminar: eliminarRegistro({
                        vistaPrincipal: vistaAgregarAsiento,
                        contenedorDeAlertas: alertasAA,
                        URL: (id) => `${URL}eliminartasiento/${id}`,
                    }, undefined, (datos) => { 
                        const td = tabla.querySelector(`#td_cam_debe_haber`);
                        if (td && tBody.childElementCount === 1) {
                            const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
                            const tr = crearElemento("tr", undefined, [td]);
                            tBody.replaceChildren(tr);
                            return;
                        }
                        const porcentaje = parseFloat(parseFloat(datos.porciento ?? 0).toFixed(2));
                        const debe =  datos.tipo === "DEBE" ? porcentaje : 0;
                        const haber = datos.tipo === "HABER" ? porcentaje : 0;
                        const spanDebe = tabla.querySelector("#cam_total_debe");
                        const spanHaber = tabla.querySelector("#cam_total_haber");
                        const debeR = parseFloat(spanDebe.textContent?.replace(",", ""));
                        const haberR = parseFloat(spanHaber.textContent?.replace(",", ""));
                        spanDebe.textContent = FormatoEnUs(debeR - debe);
                        spanHaber.textContent = FormatoEnUs(haberR - haber);
                    }),
                }
            }
        ];
        if (permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody, tBodyR] = crearTabla(encabezadoTabla, true);
        vistaPrincipalAA.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(URL_LT, { contenedor: alertasAA, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1") {
            const nuevoFormularioAA = [...formularioAA];
            nuevoFormularioAA.splice(0, 0, null);
            FilaDeRegistro(tBodyR, {
                // vistaPrincipal: vistaPrincipalAA,
                // vistaRegistrar: vistaRegistrarAA,
                // vistaRForm: divRNormal,
                contenedorDeAlertas: alertasAA,
                contenidoTabla,
                tBody,
                URL_FORM: `${URL}`,
                URL_LISTAR: URL_LT,
                camposDeFormulario: nuevoFormularioAA,
                estiloTd,
                datosExtra: [
                    { key: "ver", value: "registrocrearasientos" },
                    { key: "asiento", value: registro.id },
                    { key: "empresa", value: empresa_id },
                ]
            });
        }
    
        cambiarVista(vistaPrincipal, vistaAgregarAsiento)
    }   
}

export const Porcentaje = ({elemento, registro, arrayT}) => {
    const porcentaje = parseFloat(parseFloat(registro.porciento ?? 0).toFixed(2));
    const debe =  registro.tipo === "DEBE" ? porcentaje : 0;
    const haber = registro.tipo === "HABER" ? porcentaje : 0;
    if (arrayT.length > 0) {
        if (registro.tipo === "DEBE") {
            arrayT[1] += debe;
        } else {
            arrayT[2] += haber;
        }
    } else {
        const row = (sumDebe, sumHaber) => {
            const spanDebe = crearElemento("span", {id: "cam_total_debe"}, [FormatoEnUs(sumDebe)]);
            const spanHaber = crearElemento("span", {id: "cam_total_haber"}, [FormatoEnUs(sumHaber)]);
            const td = crearElemento("td", {colspan: "100%", class: "text-center fw-bold", id: "td_cam_debe_haber"}, ["DEBE = ", spanDebe, "%, HABER = ", spanHaber, "%"]);
            const row = crearElemento("tr", {class: "totales"}, [td]);
            return [row];
        }
        arrayT.push(row, debe, haber);
    }
    elemento.textContent = FormatoEnUs(porcentaje);
}