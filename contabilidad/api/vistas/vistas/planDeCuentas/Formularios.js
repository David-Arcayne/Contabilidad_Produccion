import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
const empresa_id = getEmpresaId();

const bloquearPrefijoEnInput = (input) => {
    // Al escribir, evitar que se borre/modifique el prefijo
    input.addEventListener("input", () => {
        const prefijo = input.getAttribute("data-prefix") || "";
        if (prefijo === "") return;
        if (!prefijo || !input.value.startsWith(prefijo)) {
            input.value = prefijo;
        }
    });

    // Bloquear retroceso o moverse antes del prefijo
    input.addEventListener("keydown", e => {
        const prefijo = input.getAttribute("data-prefix") || "";
        if (prefijo === "") return;
        if (input.selectionStart <= prefijo.length && (e.key === "Backspace" || e.key === "ArrowLeft")) {
            e.preventDefault();
        }
    });

    // Corregir posición del cursor si cae dentro del prefijo
    input.addEventListener("click", () => {
        const prefijo = input.getAttribute("data-prefix") || "";
        if (prefijo === "") return;
        if (input.selectionStart < prefijo.length) {
            input.setSelectionRange(prefijo.length, prefijo.length);
        }
    });
}

const ValidarCodigo = async (valor, contenedorInput) => {
    const form = contenedorInput.parentNode;
    const codigo = form.querySelector("#plancuenta-codigo");
    if (valor) {
        const arrRubro = await obtenerDatos(`${CT_URLAPI}listar_agrupacion_rubro_plandecuenta/${empresa_id}`);
        if (arrRubro && arrRubro.length > 0) {
            const datoRubro = arrRubro.find((item) => item.idagrupacion_rubro_plandecuenta === parseInt(valor));
            codigo.value = datoRubro.numero;

            // Establece el data-prefix del concepto para evitar que se modifique
            if (!codigo.hasAttribute("data-prefix")) {
                codigo.setAttribute("data-prefix", datoRubro.numero);
                bloquearPrefijoEnInput(codigo);
            } else {
                codigo.setAttribute("data-prefix", datoRubro.numero);
            }
        }
    } else {
        codigo.value = "";
        // Quita el data-prefix del concepto para no restringir con el valor anterior
        codigo.setAttribute("data-prefix", "");
    }
}



export const optnsTipoSaldo = [
    {clave: "DEBE", valor: "DEBE"},
    {clave: "HABER", valor: "HABER"},
    {clave: "DEBE Y HABER", valor: "DEBE Y HABER"},
];

export const formularioPlanDeCuentas = [
    {
        id: "plancuenta-rubro",
        label: "Rubro",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}listar_agrupacion_rubro_plandecuenta/${empresa_id}`,
        llavesOpciones: { valor: "idagrupacion_rubro_plandecuenta", detalle: ["tipo_plandecuenta"] },
        nombre: "idagrupacion_rubro_plandecuenta",
        callbackInput: ValidarCodigo,
        requerido: true,
    },
    {
        id: "plancuenta-codigo",
        label: "Código",
        forma: "input",
        tipo: "text",
        nombre: "numero",
        requerido: true
    },
    {
        id: "plancuenta-cuenta",
        label: "Cuenta",
        forma: "input",
        tipo: "text",
        nombre: "plan",
        requerido: true
    },
    {
        id: "plancuenta-cuentaagrupacion",
        label: "Cuenta de Agrupación",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}milistaplanes/${empresa_id}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "plandecuenta",
        llaveRegistro: "idp",
    },
    {
        id: "plancuenta-tiposaldo",
        label: "Saldo Normal",
        forma: "select",
        opcionesPredefinidas: optnsTipoSaldo,
        nombre: "tipo",
        requerido: true
    },
    {
        id: "plancuenta-descripcion",
        label: "Descripción",
        forma: "textarea",
        nombre: "descripcion",
        filas: 2,
        requerido: true
    },
];

export const formularioVTipoCuenta = [
    // {
    //     id: "vinculartipocuenta-tipoplancuenta",
    //     label: "Rubro",
    //     forma: "select",
    //     urlSolicitud: `${CT_URLAPI}listar_tipo_plandecuenta/${empresa_id}`,
    //     llavesOpciones: { valor: "idtipo_plandecuenta", detalle: "nombre" },
    //     nombre: "idtipo_plandecuenta",
    //     requerido: true,
    //     clasesColumna: "col-12 col-md-6",
    // },
    {
        id: "vinculartipocuenta-tipoplancuenta",
        label: "Rubro",
        forma: "input",
        tipo: "text",
        nombre: "tipo_plandecuenta",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
    {
        id: "vinculartipocuenta-rubro",
        label: "Código",
        forma: "input",
        tipo: "number",
        nombre: "numero",
        valorMinimo: "0",
        requerido: true,
        clasesColumna: "col-12 col-md-6",
    },
];
export const formularioVTipoCuentaEditar = (registro) =>  [
    {
        id: "vinculartipocuenta-tipoplancuenta",
        label: "Rubro",
        forma: "select",
        origen: `${CT_URLAPI}listar_tipo_plandecuenta/${empresa_id}/${registro.idagrupacion_rubro_plandecuenta}`,
        llaves: { id: "idtipo_plandecuenta", detalle: "nombre" },
        nombre: "idtipo_plandecuenta",
        required: true,
    },
    {
        id: "vinculartipocuenta-rubro",
        label: "Código",
        forma: "input",
        tipo: "number",
        nombre: "numero",
        required: true,
    },
];