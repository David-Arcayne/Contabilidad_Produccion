import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { mostrarJerarquiaPlanDeCuentas } from "../../funciones/Funciones.js";
import { agregarImpuestoCalculado } from "../transacciones/Formularios.js";
const EMPRESA_ID = getEmpresaId();

// TRANSACCIONES EXTERNAS
export const formularioTransaccionAsientoContable = [
    {
        id: "transexternoac-cuenta",
        label: "Cuenta",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "plandecuenta",
        requerido: true,
        llaveRegistro: "idplan",
        callbackInput: agregarImpuestoCalculado("transexternoac"),
        panelDetalle: mostrarJerarquiaPlanDeCuentas,
        editar: false,
    },
    {
        id: "transexternoac-cuenta",
        label: "Cuenta",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}lista_plande_subcuentas/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "plandecuenta",
        requerido: true,
        llaveRegistro: "idplan",
        panelDetalle: mostrarJerarquiaPlanDeCuentas,
        editar: true,
    },
    {
        id: "transexternoac-debe",
        label: "DEBE",
        forma: "input",
        tipo: "number",
        nombre: "debe",
        intervalo: "0.01",
        requerido: true,
        valor: "0",
        valorPorDefecto: "0",
    },
    {
        id: "transexternoac-haber",
        label: "HABER",
        forma: "input",
        tipo: "number",
        nombre: "haber",
        intervalo: "0.01",
        requerido: true,
        valor: "0",
        valorPorDefecto: "0",
    },
    {
        id: "transexternoac-nota",
        label: "Nota",
        forma: "textarea",
        nombre: "nota",
        filas: 1,
    },
];