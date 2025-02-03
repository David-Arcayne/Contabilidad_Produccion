import { URL_APIC } from "../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr, rellenarSelect } from "../../funciones/Solicitudes.js";
import { BtnVistaPrevia, VistaPDF } from "../../funciones/VistaPDF.js";
import { formularioPlanDeCuentas, optnsTipoSaldo } from "./Formularios.js";
import { BtnAgrRemPC } from "./Funcionalidades/AgregarPlanDeC.js";
import { ImportarDeExcel } from "./Funcionalidades/ImportarDeExcel.js";
import { ExportarCuenta, VPCuentas } from "./Funcionalidades/VistaPrevia.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export function PlanDeCuentas(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}milistaplanes/${empresa_id}`;

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    // const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    // vistaRegistrar.setAttribute("class", "d-none");
    const vistaRegistrar = crearElemento("div", { class: "d-none my-4" });
    const vistaEditar = crearElemento("div", { class: "d-none" });
    const vistaPlanCuentas = crearElemento("div", { class: "d-none" });
   
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaEditar, vistaPlanCuentas);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    const recargarPdC = () => {
        // Recarga el select con id "plancuenta_plandecuenta" en el formulario de registro.
        const selectAF = vistaRegistrar.querySelector("#plancuenta_plandecuenta");
        rellenarSelect(selectAF, { origen: URL_LT, llaves: { id: "id", detalle: ["numero", "plan"] } })
    }
    const encabezadoTabla = [
        "Código",
        "Cuenta",
        "Tipo",
        "Descripción",
        "Opciones"
    ];
    const estiloTd = [
        "text-end",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
    ];
    const misOpciones = {
        tipo: optnsTipoSaldo,
    }
    const contenidoTabla = [
        "numero",
        {
            nombre: "plan",
            miEstilo: colorCuenta,
        },
        "tipo",
        "descripcion",
        {
            nombre: "Opciones",
            usarBasicos: {
                editar: editarRegistroModal({
                    vistaPrincipal,
                    vistaEditar,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioPlanDeCuentas,
                    registrosPropios: misOpciones,
                    URL_FORM: `${URL}`,
                    URL_LISTAR: URL_LT,
                    estiloTd,
                }, {
                    datosExtra: [
                        { key: "idplan", value_r: "id" },
                        { key: "ver", value: "registroplanesf5" },
                    ]
                }, undefined, recargarPdC),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: (id) => `${URL}deleteplan/${id}`,
                }, undefined, recargarPdC),
            },
        },
    ];
    // Controlar si el usuario tiene permisos para realizar registros, ediciones o eliminaciones.
    const l_ct = contenidoTabla.length - 1;
    if (permisos.editar === "0" && permisos.eliminar === "0") {
        encabezadoTabla.pop();
        contenidoTabla.pop();
    } else if (permisos.editar === "0") {
        delete contenidoTabla[l_ct].usarBasicos.editar;
    } else if (permisos.eliminar === "0"){
        delete contenidoTabla[l_ct].usarBasicos.eliminar;
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    let botonNuevoR;
    if (permisos.escritura === "1") {
        const elementosModal = VistaPDF("Plan de cuentas", {nombrePDF: "plan_de_cuentas"});
        const btnVistaPrevia = BtnVistaPrevia(elementosModal, VPCuentas(URL_LT));
        const exportarXlsx = ExportarCuenta(URL_LT, ["Código", "Cuenta", "Tipo", "Descripción"]);

        const nuevoRegistro = () => cambiarVista(botonNuevoR, vistaRegistrar);
        botonNuevoR = btnNuevoRegistro(nuevoRegistro, "Nueva Cuenta");
        // vistaPrincipalFTr.appendChild(botonNuevoR);

        const opcionesBtns = opciones([
            // btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar), "Nueva Cuenta"),
            botonNuevoR,
            BtnAgrRemPC({ 
                vistaPrincipal,
                vistaPlanCuentas,
                permisos,
                cntAlertasPdC: contenedorDeAlertas,
                URL_LT, 
                tablaPdC: [{contenido: contenidoTabla, estiloTd}, tBody, misOpciones],
                recargarPdC,
            }),
            ImportarDeExcel({
                vistaPrincipal,
                contenedorDeAlertas,
                contenidoTabla,
                tBody,
                URL,
                URL_LT,
                estiloTd,
            }),
            btnVistaPrevia,
            exportarXlsx,
        ]); 
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(vistaRegistrar, divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { 
        contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody, misOpciones);
    };
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });

    // Creación de formulario para la vista Registrar
    if (permisos.escritura === "1") {
        const accionCancelar = () => { cambiarVista(vistaRegistrar, botonNuevoR) };
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL_FORM: `${URL}`,
            URL_LISTAR: URL_LT,
            camposDeFormulario: formularioPlanDeCuentas,
            estiloTd,
            mantenerFormulario: accionCancelar,
        }, undefined, {
            datosExtra: [
                { key: "ver", value: "registroplanes" },
                { key: "empresa", value: empresa_id },
            ]
        }, recargarPdC);
    }
}

/**
 * Función para colorear el texto de la cuenta en base a si tiene o no una cuenta asociada.
 * @param {Object} datos - Datos del registro.
 * @param {Element} datos.elemento - Elemento "td" que contiene la cuenta.
 * @param {Object} datos.registro - Datos de la cuenta.
 */
const colorCuenta = ({elemento, registro}) => {
    elemento.innerHTML = `${registro.plan}`;
    if (registro.idp == 0) {
        elemento.classList.add("text-danger");
    } else {
        elemento.classList.add("text-primary");
    }
}