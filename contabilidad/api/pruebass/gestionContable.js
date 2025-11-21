import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, DivDriverJS, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { modalDeConfirmacion, modalFormularioFijo } from "../../funciones/Modals.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro, nuevoRegistroModal } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../funciones/Solicitudes.js";
import { formularioGestionContable, optnsTipoDocumento } from "./Formularios.js";
import { Estado } from "./Funcionalidades/EstadoGestionContable.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function GestionContable(infoVista, permisos, vistaGestionContable) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}listadegestion/${empresa_id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = crearElemento("div", { class: "" });
    const vistaRegistrar = crearElemento("div");
    const vistaEditar = crearElemento("div", { class: "d-none" });

    const titulo = crearElemento("h5", {class: "text-primary-emphasis text-center mt-2 mt-md-0 mb-1"}, ["Listado de Gestiones Contables"]);
    const separador = crearElemento("hr", {class: "mt-0"});
    const divTitulo = crearElemento("div", { class: "" }, [titulo, separador]);
    vistaPrincipal.appendChild(divTitulo);

    vistaGestionContable.append(vistaPrincipal, vistaEditar);

    // Creación de elementos para la vista Principal
    vistaPrincipal.append(vistaRegistrar);
    const [modalF, cuerpoModalF] = modalFormularioFijo();
    let botonNuevoRegistro;
    if (permisos.escritura === "1") {
        botonNuevoRegistro = btnNuevoRegistro(() => modalF.classList.remove("d-none"));
        const opcionesBtns = opciones([
            botonNuevoRegistro,
        ]);
        vistaPrincipal.appendChild(opcionesBtns);
        vistaRegistrar.appendChild(modalF);
    }
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    const encabezadoTabla = [
        "Gestión",
        "Fecha inicio",
        "Fecha final",
        "Fecha",
        "Formato Trans.",
        "Opciones"
    ];
    const estiloTd = [
        "text-start",
        "date",
        "date",
        "date",
        "text-start",
    ];
    const opconesFormatoTrans = optnsTipoDocumento;
    const contenidoTabla = [
        "nombre",
        "fechaini",
        "fechafin",
        "fecha",
        {
            nombre: "formato_transaccion",
            miEstilo: ({elemento, registro}) => {
                const opcion = opconesFormatoTrans.find(opc => opc.clave === registro.formato_transaccion);
                elemento.textContent = opcion ? opcion.valor : "-";
            }
        },
        {
            nombre: "Opciones",
            acciones: {
                baja: {
                    estilo: Estado({
                        vistaPrincipal,
                        contenedorDeAlertas,
                        URL,
                        URL_LT,
                        estiloTd,
                    }),
                },
            },
            usarBasicos: {
                editar: editarRegistroModal({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormularioFunc: formularioGestionContable,
                    URL_FORM: `${URL}`,
                    URL_LISTAR: URL_LT,
                    estiloTd,
                    accionPrevia: ValidarFecha(vistaPrincipal),
                }, {
                    datosExtra: [
                        { key: "idgestion", value_r: "id" },
                        { key: "ver", value: "registrogestionf5" },
                        { key: "empresa", value: empresa_id },
                    ]
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: (id) => `${URL}eliminar_gestion_contable/${id}`,
                }),
            },
        },
    ];
    // Eliminar las opciones de editar y eliminar si el usuario no tiene los permisos respectivos
    const l_ct = contenidoTabla.length -1;
    if (permisos.editar === "0" && permisos.eliminar === "0") {
        encabezadoTabla.pop();
        contenidoTabla.pop();
    } else if (permisos.editar === "0") {
        delete contenidoTabla[l_ct].usarBasicos.editar;
    } else if (permisos.eliminar === "0"){
        delete contenidoTabla[l_ct].usarBasicos.eliminar;
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => {
        contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
    };
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

    // Creación de formulario para la vista Registrar
    if (permisos.escritura === "1") {
        // const accionCancelar = () => { cambiarVista(vistaRegistrar, botonNuevoRegistro) };
        nuevoRegistroModal({
            vistaPrincipal: botonNuevoRegistro,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL_FORM: `${URL}`,
            URL_LISTAR: URL_LT,
            camposDeFormulario: formularioGestionContable(),
            estiloTd,
            accionPrevia: ValidarFecha(vistaRegistrar),
            elementosModal: [modalF, cuerpoModalF],
            // mantenerFormulario: accionCancelar,
        }, undefined, {
            datosExtra: [
                { key: "ver", value: "registrogestion" },
                { key: "empresa", value: empresa_id },
            ]
        });
    }

    // Configuración de ayudas visuales de la vista
    const divContenedorCabecera = vistaGestionContable.closest("#contenedor-cabecera");
    const btnGestionContable = divContenedorCabecera.querySelector("[data-id='gestioncontable']");
    const informacionDJs = [
        {
            element: btnGestionContable,
            popover: {
                title: "Gestiones contables",
                description: "Permite crear la gestión contable y habilitarla, periodo según la determinación tributaria. Las fechas establecidas son los parámetros para los registros y reportes.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: ".row .col .btn.btn-primary",
            popover: {
                title: "Agregar gestión contable",
                description: "Abre un formulario para registrar una nueva gestión contable en el sistema.",
            },
        },
        {
            mainElement: vistaPrincipal,
            element: ".input-group.input-group-sm.border.rounded-1",
            popover: {
                title: "Buscar gestión",
                description: "Permite buscar gestiones contables considerando todos los campos disponibles.",
            },
        },
        {
            element: tabla,
            popover: {
                title: "Tabla de gestiones contables",
                description: "Muestra todas las gestiones contables registradas en el sistema.",
            },
        },
        {
            mainElement: tabla,
            element: "td a",
            popover: {
                title: "Activar / Desactivar",
                description: "Permite activar o desactivar la gestión contable seleccionada. Al activar una nueva gestión, se desactivará la anterior.",
            },
        },
        {
            mainElement: tabla,
            element: ".btn.btn-warning.btn-sm",
            popover: {
                title: "Editar gestión",
                description: "Abre un formulario para modificar los datos de la gestión contable seleccionada.",
            },
        },
        {
            mainElement: tabla,
            element: "td a[title='Eliminar']",
            popover: {
                title: "Eliminar gestión",
                description: "Permite eliminar la gestión contable seleccionada, previa confirmación.",
            },
        },
    ];
    DivDriverJS(informacionDJs, vistaPrincipal);
}

/**
 * Función para validar la fecha de inicio y final con el cierre fiscal.
 * @param {HTMLElement} vista - Vista principal de la ventana.
 * @returns
 */
const ValidarFecha = (vista) =>  (enviarFormulario, form) => {
    const cierreFiscal = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.ocierrefiscal;
    const fechaI = form.querySelector("#gestioncontable_fecha_inicio");
    const fechaF = form.querySelector("#gestioncontable_fecha_final");
    // const formatoTransaccion = form.querySelector("#gestioncontable_formatotransaccion");

    // if (!cierreFiscal || formatoTransaccion.value === "por_tipo_gestion" || formatoTransaccion.value === "por_tipo_mes") {
    if (!cierreFiscal) {
        enviarFormulario();
        return;
    }
    const [dia, mes] = cierreFiscal.split("/");
    const [anioF] = fechaF?.value.split("-");

    let fechaRefF = anioF + "-" + mes.toString().padStart(2, "0") + "-" + dia.toString().padStart(2, "0");
    const obtenerFI = new Date(`${fechaRefF}T00:00:00`);
    fechaRefF = obtenerFI.toISOString().slice(0, 10);
    obtenerFI.setDate(obtenerFI.getDate() + 1);
    obtenerFI.setFullYear(obtenerFI.getFullYear() - 1);
    const fechaRefI = obtenerFI.toISOString().slice(0, 10);

    if (fechaI.value === fechaRefI && fechaF.value === fechaRefF) {
        enviarFormulario();
    } else {
        const modal = modalDeConfirmacion(() => enviarFormulario(), `Las fechas no coinciden con la fecha de cierre fiscal: ${cierreFiscal} , ¿Desea continuar?`);
        vista.appendChild(modal);
        modal.querySelector("button.btn-primary").focus();
    }
    return;
};