import { manejarSelect } from "../../funciones/CrearFormulario.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { mostrarJerarquiaPlanDeCuentas } from "../../funciones/Funciones.js";

const EMPRESA_ID = getEmpresaId();

// ASIENTO MODELO
export const optnsTipo = [
    {clave: "DEBE", valor: "DEBE"},
    {clave: "HABER", valor: "HABER"},
];

export const formularioTipoAsiento= [
    {
        id: "tipoasiento-nombre",
        label: "Nombre de Asiento",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true
    },
    {
        id: "tipoasiento-tipo",
        label: "Tipo Asiento",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}creartipoasientolista/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: "nombre"},
        nombre: "tipo",
        llaveRegistro: "idtipo",
        requerido: true
    },
    {
        id: "tipoasiento-tipomodulo",
        label: "Tipo Módulo",
        forma: "select",
        opcionesPredefinidas: [
            {clave: "estandar", valor: "* Estandar"},
            {clave: "comercial", valor: "Comercial"},
            {clave: "produccion", valor: "Producción"},
        ],
        nombre: "tipo_modulo",
        requerido: true
    },
];
/** @type {DatosInput[]}*/
export const formularioAgregarAsiento = [
    {
        id: "agregarasiento_plandecuenta",
        label: "Cuenta",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "cuenta",
        llaveRegistro: "idplandecuenta",
        panelDetalle: mostrarJerarquiaPlanDeCuentas,
        requerido: true
    },
    {
        id: "agregarasiento_porcentaje",
        label: "Porcentaje",
        forma: "input",
        tipo: "number",
        valorMinimo: "0",
        valorMaximo: "100",
        nombre: "porciento",
        intervalo: "0.01",
        requerido: true
    },
    {
        id: "agregarasiento_tipo",
        label: "Tipo",
        forma: "select",
        opcionesPredefinidas: optnsTipo,
        nombre: "tipo",
        requerido: true
    },
];

// TIPO ASIENTO
export const formularioTiposDeAsiento = [
    {
        id: "tiposdeasiento-tipo",
        label: "Tipo",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: "tiposdeasiento-descripcion",
        label: "Descripción",
        forma: "input",
        tipo: "text",
        nombre: "detalle",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
];

// MODULO - ASIENTO MODELO
const ObtenerTipoTransaccion = (valor, contenedor) => {
    const form = contenedor.closest("form");
    const selectTipoTransaccion = form.querySelector("#moduloam-tipotransaccion");
    const selectAsientoModelo = form.querySelector("#moduloam-asientomodelo");

    if (valor) {
        manejarSelect(selectTipoTransaccion, { urlSolicitud: `${CT_URLAPI}listar_operacion_modulo_filtrado/${valor}`, llavesOpciones: { valor: "idoperacion_modulos", detalle: ["nombre_operacion", "descripcion"] }, });
        manejarSelect(selectAsientoModelo, { urlSolicitud: `${CT_URLAPI}listar_asiento_por_modulo/${valor}/${EMPRESA_ID}`, llavesOpciones: { valor: "idasientotipo", detalle: "nombre" }, });
    } else {
        selectTipoTransaccion.selectize?.destroy();
        selectTipoTransaccion.innerHTML = "<option value=''>-- Seleccione un Módulo --</option>";
        selectAsientoModelo.selectize?.destroy();
        selectAsientoModelo.innerHTML = "<option value=''>-- Seleccione un Módulo --</option>";
    }
}
export const optnsMAMBandera = [
    {clave: "1", valor: "Por Revisión"},
    {clave: "2", valor: "Registro Directo"},
];
export const formularioModuloAM= [
    {
        id: "moduloam-modulo",
        label: "Módulo",
        forma: "select",
        opcionesPredefinidas: [
            {clave: "comercial", valor: "Comercial"},
            {clave: "produccion", valor: "Producción"},
        ],
        callbackInput: ObtenerTipoTransaccion,
        requerido: true,
        llaveRegistro: "nombre_modulo",
    },
    {
        id: "moduloam-tipotransaccion",
        label: "Tipo Operación",
        forma: "select",
        mensajeVacio: "-- Seleccione un Módulo --",
        nombre: "idoperacion_modulos",
        requerido: true,
    },
    {
        id: "moduloam-asientomodelo",
        label: "Asiento Modelo",
        forma: "select",
        mensajeVacio: "-- Seleccione un Módulo --",
        nombre: "idasientotipo",
        requerido: true
    },
    {
        id: "moduloam-bandera",
        label: "Tipo de registro",
        forma: "select",
        opcionesPredefinidas: optnsMAMBandera,
        nombre: "bandera",
        requerido: true
    },
];