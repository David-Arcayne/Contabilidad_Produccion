import { URL_APIC } from "../../../../../lib/services.js";
import { FilaDeRegistro } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, FormatoDate } from "../../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { formularioDetalleAsientoM, formularioDetalleTr } from "../Formularios.js";
import { CalculoDetalle, OpcionesRegistroDetalle, TrDebe, TrHaber } from "./Opciones.js";

/**
 * Crea el contenido de la vista Detalle transacción.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaTranFactura - Elemento contenedor de la vista Transacción Factura.
 * @param {HTMLElement} datosVista.vistaDetalle - Elemento contenedor de la vista Detalle transacción.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const DetalleTransaccion = (datosVista) => {
    const {
        vistaPrincipal,
        vistaTranFactura,
        vistaDetalle, 
        permisos
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Transacción.
     * @param {HTMLElement} referencias.elemento - Elemento que disparo el evento.
     */
    return ({registro, elemento}) => {
        const trPadre = elemento.closest("tr");
        
        const URL = `${URL_APIC}api/`;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal
        const URL_LT = `${URL}listadetalletransaccion/${registro.id}`;

        // Creación de elementos para el encabezado de la vista
        const spanTran = crearElemento("span", { class: "fw-bold" }, [`N° Transacción: `]);
        const divTran = crearElemento("div", undefined, [spanTran, registro.ntransaccion]);
        const spanFecha = crearElemento("span", { class: "fw-bold" }, [`Fecha: `]);
        const divFecha = crearElemento("div", undefined, [spanFecha, FormatoDate(registro.fecha)]);
        const spanTipo = crearElemento("span", { class: "fw-bold" }, [`Tipo: `]);
        const divTipo = crearElemento("div", undefined, [spanTipo, registro.ttransaccion ?? "-"]);
        const spanGlosa = crearElemento("span", { class: "fw-bold" }, [`Glosa: `]);
        const divGlosa = crearElemento("div", undefined, [spanGlosa, registro.glosa]);
        const divInformacion = crearElemento("div", { class: "pb-2" }, [divTran, divFecha, divTipo, divGlosa]);
        const regresar = () => { cambiarVista(vistaDetalle, vistaPrincipal) }
        const tituloVista = encabezadoVista("Volver", "Asiento Contable", regresar, undefined, divInformacion)
        vistaDetalle.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaRegistrarDT = crearElemento("div", { class: "mb-4 d-none" });
        const vistaPrincipalDT = crearElemento("div", undefined, [vistaRegistrarDT]);
        const vistaEditarDT = crearElemento("div", {class: "d-none"});

        vistaDetalle.append(vistaPrincipalDT, vistaEditarDT);
        
        // Creación de elementos para la vista principal
        const alertasDT = crearElemento("div");
        vistaPrincipalDT.appendChild(alertasDT);
        // if (permisos.escritura === "1") {
        //     // const nuevoRegistro = () => cambiarVista(vistaPrincipalDT, vistaRegistrarDT);
        //     const opciones = btnNuevoRegistro(nuevoRegistro);
        //     opciones.classList.add("mb-2");
        //     vistaPrincipalDT.appendChild(opciones);
        // }
        let botonNuevoRegistro;
        if (permisos.escritura === "1" && registro.consolidar === "1") {
            const nuevoRegistro = () => cambiarVista(botonNuevoRegistro, vistaRegistrarDT);
            botonNuevoRegistro = btnNuevoRegistro(nuevoRegistro, "Por asiento modelo");
            botonNuevoRegistro.classList.add("mb-2");
            vistaPrincipalDT.appendChild(botonNuevoRegistro);
        }
        const encabezadoTabla = [
            // "Orden",
            "Código",
            "Cuenta contable",
            "Debe",
            "Haber",
            "Nota",
            "Opciones",
        ];
        const estiloTd = [
            // "contador",
            "text-start",
            "text-start",
            "decimal",
            "decimal",
            "text-start",
            "text-start",
        ];
        const contenidoTabla = [
            // "js-cont",
            "numero",
            "plan",
            {
                nombre: "debe",
                miEstilo: TrDebe(vistaDetalle, vistaTranFactura, permisos, registro),
            },
            {
                nombre: "haber",
                agregarT: TrHaber(vistaDetalle, vistaTranFactura, permisos, registro, trPadre),
            },
            "nota",
            {
                nombre: "Opciones",
                usarBasicos: {
                    editar: editarRegistroModal({
                        vistaPrincipal: vistaPrincipalDT,
                        vistaEditar: vistaEditarDT,
                        contenedorDeAlertas: alertasDT,
                        camposDeFormulario: formularioDetalleTr,
                        URL_FORM: `${URL}`,
                        URL_LISTAR: URL_LT,
                        estiloTd,
                    }, {
                        datosExtra: [
                            { key: "iddetalle", value_r: "id" },
                            { key: "trans", value: registro.id },
                            { key: "ver", value: "detalletransaccionnormalf5" },
                        ]
                    }),
                    eliminar: eliminarRegistro({
                        vistaPrincipal: vistaDetalle,
                        contenedorDeAlertas: alertasDT,
                        URL: (id) => `${URL}eliminardetalle/${id}`,
                    }, undefined, CalculoDetalle(vistaPrincipalDT, trPadre)),
                }
            }
        ];
        if (permisos.eliminar === "0" || registro.consolidar === "2") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody, tBodyR] = crearTabla(encabezadoTabla, registro.consolidar === "1" ? true : false);
        if (registro.consolidar === "1"){
            const nuevoFormularioDTr = [...formularioDetalleTr];
            nuevoFormularioDTr.splice(0, 0, null);
            FilaDeRegistro(tBodyR, {
                // vistaPrincipal: vistaPrincipalDT,
                // vistaRegistrar: vistaRegistrarDT,
                // vistaRForm: divRNormal,
                contenedorDeAlertas: alertasDT,
                contenidoTabla,
                tBody,
                URL_FORM: `${URL}`,
                URL_LISTAR: URL_LT,
                camposDeFormulario: nuevoFormularioDTr,
                estiloTd,
                datosExtra: [
                    { key: "ver", value: "detalletransaccionnormal" },
                    { key: "trans", value: registro.id },
                    { key: "empresa", value: empresa_id },
                    { key: "sucursal", value: sucursal_id },
                ]
            });
        }
        vistaPrincipalDT.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(URL_LT, { contenedor: alertasDT, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1") {
            const tipo = crearElemento("h6", {class: "fw-bold"}, ["Por asiento modelo"]);
            const divTipoForm = crearElemento("div", {class: "pb-2"}, [tipo]);
            const divRNormal = crearElemento("div");
            const divRAsientoM = crearElemento("div", {class: "d-none"});
            const btnsRegistrar = OpcionesRegistroDetalle(divRNormal, divRAsientoM);
            // vistaRegistrarDT.append(btnsRegistrar, divRNormal, divRAsientoM);
            // nuevoRegistro({
            //     vistaPrincipal: vistaPrincipalDT,
            //     vistaRegistrar: vistaRegistrarDT,
            //     vistaRForm: divRNormal,
            //     contenedorDeAlertas: alertasDT,
            //     contenidoTabla,
            //     tBody,
            //     URL_FORM: `${URL}`,
            //     URL_LISTAR: URL_LT,
            //     camposDeFormulario: formularioDetalleTr,
            //     estiloTd,
            // }, undefined, {
            //     datosExtra: [
            //         { key: "ver", value: "detalletransaccionnormal" },
            //         { key: "trans", value: registro.id },
            //         { key: "empresa", value: empresa_id },
            //         { key: "sucursal", value: sucursal_id },
            //     ]
            // });
            const accionCancelar = () => { cambiarVista(vistaRegistrarDT, botonNuevoRegistro) };
            nuevoRegistro({
                // vistaPrincipal: vistaPrincipalDT,
                vistaRegistrar: vistaRegistrarDT,
                // vistaRForm: divRAsientoM,
                contenedorDeAlertas: alertasDT,
                contenidoTabla,
                tBody,
                URL_FORM: `${URL}`,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioDetalleAsientoM,
                estiloTd,
                mantenerFormulario: accionCancelar,
            }, {first: divTipoForm}, {
                datosExtra: [
                    { key: "ver", value: "detalletransaccion" },
                    { key: "trans", value: registro.id },
                    { key: "empresa", value: empresa_id },
                    { key: "sucursal", value: sucursal_id },
                ]
            });
        }
    
        cambiarVista(vistaPrincipal, vistaDetalle)
    }   
}