import { manejarSelect, selectEnEspera } from "../../funciones/CrearFormulario.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";

const EMPRESA_ID = getEmpresaId();
const URL = CT_URLAPI;


/**
 * Función: Maneja la lógica de los campos de negrilla y cursiva en el formulario
 * Descripción: Esta función se activa cuando el usuario interactúa con los campos de negrilla o cursiva.
 *              Dependiendo de las selecciones, se actualiza un campo oculto que almacena el estado combinado de ambos estilos.
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
function manejarCampoNegrillaYCursiva (prefijoId) {
    return function (inputT, contenedor) {
        const form = contenedor.closest("form");
        const hNegrillaItalica = form.querySelector(`#${prefijoId}-negrilla-italica`);

        const negrilla = form.querySelector(`#${prefijoId}-negrilla`);
        const cursiva  = form.querySelector(`#${prefijoId}-cursiva`);

        if ( inputT.target.id === negrilla.id || inputT.target.id === cursiva.id ) {
            const esNegrilla = negrilla.checked;
            const esCursiva  = cursiva.checked;

            if (esNegrilla && esCursiva) {
                hNegrillaItalica.value = "cursiva_negrilla";
            } else if (esNegrilla) {
                hNegrillaItalica.value = "negrilla";
            } else if (esCursiva) {
                hNegrillaItalica.value = "cursiva";
            } else {
                hNegrillaItalica.value = "";
            }
        }
    }
}

// =========================================================
// FORMULARIOS Y FUNCIONES PARA PLANTILLA DE REPORTES
// =========================================================

export const optnsTipoReporte = [
    {clave: "balance_general", valor: "Balance General"},
    {clave: "estado_resultado", valor: "Estado de Resultados"},
    {clave: "flujo_efectivo", valor: "Flujo de Efectivo"},
    {clave: "estado_evolucion_patrimonio", valor: "Estado de Evolución del Patrimonio"},
    {clave: "notas_estados_financieros", valor: "Notas a los Estados Financieros"},
    {clave: "personalizado", valor: "* Personalizado"},
];
/** @type {DatosInput[]}*/
export const formularioPlantillaReportes = [
    {
        id: "plantillareporte-nombre",
        label: "Título Reporte",
        forma: "input",
        tipo: "text",
        nombre: "nombre",
        requerido: true,
    },
    {
        id: "plantillareporte-descripcion",
        label: "Descripción",
        forma: "input",
        tipo: "text",
        nombre: "descripcion",
        requerido: true,
    },
    {
        id: "plantillareporte-tiporeporte",
        label: "Tipo de Reporte",
        forma: "select",
        opcionesPredefinidas: optnsTipoReporte,
        nombre: "tipo_reporte",
        requerido: true,
    },
];

// =========================================================
// FORMULARIOS Y FUNCIONES PARA ESTADO DE RESULTADOS
// =========================================================

/**
 * Función: Filtrar las cuentas padres según el nivel seleccionado
 * Descripción: Esta función se activa cuando el usuario ingresa un nivel en el campo correspondiente.
 *              Dependiendo del nivel ingresado, se actualiza el campo de cuenta padre con las opciones disponibles para ese nivel.
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
const filtrarCuentaPadre = (registroReporte) => async (inputT, contenedor) => {
    const valor = inputT.target.value;
    const form = contenedor.closest("form");
    const cuentaPadre = form.querySelector("#plantilla-elementopadre");
    const nivel = form.querySelector("#plantilla-nivel");
    const idReporte = registroReporte.idtipo_reportes;

    if (valor === "" || parseInt(valor) <= 0) {
        // Resetear el campo de cuenta padre si el nivel es inválido
        cuentaPadre.selectize?.destroy();
        cuentaPadre.innerHTML = "<option value=''>-- Se requiere el nivel --</option>";
        nivel.value = "1";
        return;
    } else {
        // Actualizar el campo de cuenta padre según el nivel ingresado
        nivel.value = parseInt(valor) + 1;
        selectEnEspera(cuentaPadre)
        const filtro = await obtenerDatos(`${URL}rp_filtro_plantilla_por_nivel/${idReporte}/${valor}/${EMPRESA_ID}`);
        if (filtro) {
            manejarSelect(cuentaPadre, { datosRegistro: filtro, llavesOpciones: { valor: "idplantilla", detalle: "nombre" } });
        }
    }
}

/**
 * Función: Maneja la lógica entre los campos Plan de Cuenta y Nombre Personalizado
 * Descripción: Esta función se activa cuando el usuario interactúa con los campos Plan de Cuenta o Nombre Personalizado.
 *              Dependiendo de cuál campo se llene, se deshabilita el otro y se ajustan las opciones disponibles en el formulario.
 * Fecha: 14 de enero de 2026
 * Autor: Joel Choque
 */
export function planCuentaONombre(prefijoId = "plantilla") {
    return async (valor, contenedorInput) => {
        const form = contenedorInput.parentNode;
        // Obtener referencias a los elementos del formulario
        const selectTipoOperacion = form.querySelector(`#${prefijoId}-tipooperacion`);
        const optionC = selectTipoOperacion.querySelector("option[value='calculable']");
        const optionCyO = selectTipoOperacion.querySelector("option[value='calculable_y_operacion']");
        const inputTipoCuenta = form.querySelector(`#${prefijoId}-tipocuenta`);
        const divTipoCuenta = inputTipoCuenta?.closest("div");

        if (valor.target) { // En caso de llenar el campo Nombre Personalizado
            const selectPlanDeCuenta = form.querySelector(`#${prefijoId}-plancuenta`);
            const selectizePlanDeCuenta = selectPlanDeCuenta.selectize;
            if (valor.target.value?.trim() !== "") {
                // Deshabilitar el select Plan de Cuenta
                selectizePlanDeCuenta ? selectizePlanDeCuenta.disable() : selectPlanDeCuenta.disabled = true;
                // Ocultar opciones que no apliquen en Tipo de Operación cuando se usa Nombre Personalizado
                optionC.classList.add("d-none");
                optionCyO.classList.add("d-none");
                if (selectTipoOperacion.value === "calculable" || selectTipoOperacion.value === "calculable_y_operacion") {
                    selectTipoOperacion.value = "";
                }
            } else {
                // Habilitar el select Plan de Cuenta y mostrar todas las opciones en Tipo de Operación
                selectizePlanDeCuenta ? selectizePlanDeCuenta.enable() : selectPlanDeCuenta.disabled = false;
                optionC.classList.remove("d-none");
                optionCyO.classList.remove("d-none");
            }
            inputTipoCuenta ? inputTipoCuenta.required = false : null;
            inputTipoCuenta ? inputTipoCuenta.value = "": null;
            divTipoCuenta?.classList.add("d-none");
        } else { // En caso de llenar el campo Plan de Cuenta
            const inputNombrePersonalizado = form.querySelector(`#${prefijoId}-nombrepersonalizado`);
            if (valor) {
                // Deshabilitar el campo Nombre Personalizado
                inputNombrePersonalizado.disabled = true;
                // Verificar si la cuenta es de orden y mostrar el campo Tipo de Cuenta si es necesario
                const esCuentaDeOrden = await obtenerDatos(`${URL}es_cuenta_de_orden/${valor}`)
                if(esCuentaDeOrden?.length > 0 && esCuentaDeOrden[0].rubro === "Cuentas de Orden") {
                    inputTipoCuenta ? inputTipoCuenta.required = true : null;
                    divTipoCuenta?.classList.remove("d-none");
                } else {
                    inputTipoCuenta ? inputTipoCuenta.required = false : null;
                    inputTipoCuenta ? inputTipoCuenta.value = "": null;
                    divTipoCuenta?.classList.add("d-none");
                }
            } else {
                // Habilitar el campo Nombre Personalizado y ocultar el campo Tipo de Cuenta
                inputNombrePersonalizado.disabled = false;
                inputTipoCuenta ? inputTipoCuenta.required = false : null;
                inputTipoCuenta ? inputTipoCuenta.value = "": null;
                divTipoCuenta?.classList.add("d-none");
            }
        }
    }
}
export const optnsTipoOperacion = [
    {clave: "total_suma", valor: "Total Suma"},
    {clave: "total_resta", valor: "Total Resta"},
    {clave: "calculable", valor: "Calculable"},
    {clave: "calculable_y_operacion", valor: "Calculable y otra operación"},
    {clave: "otra_operacion", valor: "Otra Operación"},
    {clave: "calculo_otro_reporte", valor: "Cálculo desde otro reporte"},
    {clave: "sin_operacion", valor: "Sin Operación"},
];
export const optnsTipoCuenta = [
    {clave: "ingreso", valor: "Ingreso"},
    {clave: "egreso", valor: "Egreso"},

];
export const formularioPlantilla = (reporte) => [
    {
        id: "plantilla-negrilla-italica",
        forma: "hidden",
        nombre: "negrilla_cursiva",
    },
    {
        id: "plantilla-plancuenta",
        label: "Cuenta Contable",
        forma: "select",
        urlSolicitud: `${URL}select_plantilla_estado_resultados/${reporte.idtipo_reportes}/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idplandecuenta", detalle: ["numero", "nombre"] },
        nombre: "idplandecuenta",
        requerido: true,
        clasesOpcion: { llave: "estado", valor: "usado", clases: ["icono-ok"]},
        callbackInput: planCuentaONombre(),
    },
    {
        id: "plantilla-nombrepersonalizado",
        label: "Nombre Personalizado",
        forma: "input",
        tipo: "text",
        nombre: "nombre_personalizado",
        requerido: true,
        callbackInput: planCuentaONombre(),
    },
    {
        id: "plantilla-filtronivel",
        label: "Nivel Superior",
        forma: "input",
        tipo: "number",
        nombre: "",
        valorMinimo: "0",
        mantenerValor: true,
        callbackInput: filtrarCuentaPadre(reporte),
        clasesColumna: "col-6 col-md-3 col-lg-2",
    },
        {
        id: "plantilla-nivel",
        label: "Nivel Registro",
        forma: "input",
        tipo: "number",
        clasesInput: "form-control border-0 shadow-none pe-none",
        nombre: "nivel",
        valor: "1",
        valorMinimo: "0",
        valorPorDefecto: "1",
        soloLectura: "siempre",
        mantenerValor: true,
        clasesColumna: "col-6 col-md-3 col-lg-2",
    },
    {
        id: "plantilla-elementopadre",
        label: "Cuenta del Nivel Superior",
        forma: "select",
        mensajeVacio: "Se filtrará según el nivel",
        nombre: "idplantilla_padre",
        mantenerValor: true,
    },
    {
        id: "plantilla-tipooperacion",
        label: "Tipo de operación",
        forma: "select",
        opcionesPredefinidas: optnsTipoOperacion,
        nombre: "tipo_operacion",
        requerido: true,
    },
    {
        id: "plantilla-orden",
        label: "Orden",
        forma: "input",
        tipo: "number",
        nombre: "orden",
    },
    {
        id: "plantilla-tipocuenta",
        label: "Tipo de cuenta",
        forma: "select",
        opcionesPredefinidas: optnsTipoCuenta,
        nombre: "ingreso_egreso",
        ocultar: true,
        requerido: true,
    },
    {
        id: "plantilla-disponible",
        label: "Tomar en cuenta para calculos desde otros reportes",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "disponible_para_otro_reporte",
        valor: "si",
        clasesColumna: "col-auto",
    },
    {
        id: "plantilla-negrilla",
        label: "Mostrar en negrilla",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        valor: "si",
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantilla"),
    },
    {
        id: "plantilla-cursiva",
        label: "Mostrar en cursiva",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        valor: "si",
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantilla"),
    }
];

export const formularioPREditar = (registroItem, registroPReporte) => [
    {
        id: "plantilla_cuenta_o_nombre",
        forma: "hidden",
        nombre: registroItem.idplandecuenta ? "nombre_personalizado": "idplandecuenta",
    },
    {
        id: "plantillaeditar-negrilla-italica",
        forma: "hidden",
        nombre: "negrilla_cursiva",
    },
    {
        id: "plantillaeditar-plancuenta",
        label: "Cuenta Contable",
        forma: "select",
        urlSolicitud: `${URL}select_plantilla_estado_resultados/${registroPReporte.idtipo_reportes}/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idplandecuenta", detalle: ["numero", "nombre"] },
        nombre: "idplandecuenta",
        clasesOpcion: {llave: "estado", valor: "usado", clases: ["icono-ok"]},
        requerido: true,
        callbackInput: planCuentaONombre("plantillaeditar"),
        desactivado: registroItem.idplandecuenta ? false : true,
    },
    {
        id: "plantillaeditar-nombrepersonalizado",
        label: "Nombre Personalizado",
        forma: "input",
        tipo: "text",
        nombre: "nombre_personalizado",
        requerido: true,
        callbackInput: planCuentaONombre("plantillaeditar"),
        desactivado: registroItem.idplandecuenta ? true : false,
    },
    {
        id: "plantillaeditar-tipooperacion",
        label: "Tipo de operación",
        forma: "select",
        opcionesPredefinidas: optnsTipoOperacion,
        nombre: "tipo_operacion",
        requerido: true,
    },
    {
        id: "plantillaeditar-orden",
        label: "Orden",
        forma: "input",
        tipo: "number",
        nombre: "orden",
    },
    {
        id: "plantillaeditar-negrilla",
        label: "Mostrar en negrilla",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["negrilla", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillaeditar"),
        llaveRegistro: "negrilla_cursiva",
    },
    {
        id: "plantillaeditar-cursiva",
        label: "Mostrar en cursiva",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["cursiva", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillaeditar"),
        llaveRegistro: "negrilla_cursiva",
    }
];

export const formularioEstadoDeResultadosNyC = [
    {
        id: "plantillaernc-negrilla-italica",
        forma: "hidden",
        nombre: "negrilla_cursiva",
    },
    {
        id: "plantillaernc-negrilla",
        label: "Mostrar en negrilla",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["negrilla", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillaernc"),
        llaveRegistro: "negrilla_cursiva",
    },
    {
        id: "plantillaernc-cursiva",
        label: "Mostrar en cursiva",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["cursiva", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillaernc"),
        llaveRegistro: "negrilla_cursiva",
    }
];

export const optnsCAOperacion = [
    {clave: "sumar", valor: "Se suma"},
    {clave: "restar", valor: "Se resta"},
    {clave: "porcentaje", valor: "Porcentaje"},
]
export const formularioCuentaAsociada = (registroPReporte) => [
    {
        id: "cuentaasociada-plantilla",
        label: "Agrupar plantilla",
        forma: "select",
        urlSolicitud: `${URL}rp_listar_plantilla_normal/${registroPReporte.idtipo_reportes}/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idplantilla", detalle: ["codigo","nombre"] },
        nombre: "idplantilla_hijo",
        requerido: true,
    },
    {
        id: "cuentaasociada-operacion",
        label: "Operación",
        forma: "select",
        opcionesPredefinidas: optnsCAOperacion,
        nombre: "tipo_operacion",
        requerido: true,
    },
    {
        id: "cuentaasociada-numero",
        label: "Monto",
        forma: "input",
        tipo: "text",
        nombre: "monto",
    },
];

function manejarValoresReferencia(valor, contenedorInput) {
    const form = contenedorInput.closest("form");
    const refPlantilla = form.querySelector(`#pllreporteasociado-plantillareferencia`);
    const refTipoReporte = form.querySelector(`#pllreporteasociado-tiporeportereferencia`);

    if (valor) {
        const partes = valor.split("|");
        refPlantilla.value =  partes[0];
        refTipoReporte.value = partes[1];
    } else {
        refPlantilla.value =  "";
        refTipoReporte.value =  "";
    }
}
export const formularioReporteAsociado = [
    {
        id: "pllreporteasociado-plantillareferencia",
        forma: "hidden",
        nombre: "idplantilla_referencia",
    },
    {
        id: "pllreporteasociado-tiporeportereferencia",
        forma: "hidden",
        nombre: "idtipo_reporte_referencia",
    },
    {
        id: "pllreporteasociado-reporte",
        label: "Referenciar reporte",
        forma: "select",
        urlSolicitud: `${URL}listar_reportes_referencia_select/${EMPRESA_ID}`,
        llavesOpciones: { valor: ["idplantilla_referencia", "idtipo_reportes_referencia"], detalle: ["nombre"] },
        nombre: "___",
        requerido: true,
        clasesColumna: "col-12",
        callbackInput: manejarValoresReferencia,
    },
];



// =========================================================
// FORMULARIOS Y FUNCIONES PARA BALANCE GENERAL
// =========================================================

const filtrarCuentaPadreBG = (datosReporte) => async (inputT, contenedor) => {
    const valor = inputT.target.value;
    const form = contenedor.closest("form");
    const cuentaPadre = form.querySelector("#plantillabg-principal");
    const nivel = form.querySelector("#plantillabg-nivel");
    const grupo = form.querySelector("#plantillabg-grupo");

    if (valor === "" || parseInt(valor) <= 0) {
        cuentaPadre.selectize?.destroy();
        cuentaPadre.innerHTML = "<option value=''>-- Se requiere el nivel --</option>";
        nivel.value = "1";
        return;
    } else if (grupo.value) {
        nivel.value = parseInt(valor) + 1;
        const filtro = await obtenerDatos(`${URL}filtro_por_nivel/balance_general/${valor}/${grupo.value}/${datosReporte.idtipo_reportes}/${EMPRESA_ID}`);
        if (filtro) {
            manejarSelect(cuentaPadre, { datosRegistro: filtro, llavesOpciones: { valor: "nombreplan", detalle: "nombreplan" } });
        }

    } else {
        cuentaPadre.selectize?.destroy();
        cuentaPadre.innerHTML = "<option value=''>-- Se requiere el nivel --</option>";
        nivel.value = "1";

        inputT.target.value = "";
        inputT.target.setAttribute("placeholder", "-- Elija un Grupo --");
    }
}
export const optnsBGGrupo = [
    {clave: "1", valor: "Activo"},
    {clave: "2", valor: "Pasivo"},
    {clave: "3", valor: "Patrimonio"},
]
export const formularioBalanceGeneral = (registroPReporte) =>  [
    {
        id: "plantillabg-negrilla-italica",
        forma: "hidden",
        nombre: "negrilla_cursiva",
    },
    {
        id: "plantillabg-tipodocumento",
        label: "Cuenta Contable",
        forma: "select",
        urlSolicitud: `${URL}select_plantilla_balance_general/${registroPReporte.idtipo_reportes}/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idplandecuenta", detalle: ["numero", "nombre"] },
        nombre: "idplandecuenta",
        clasesOpcion: {llave: "estado", valor: "usado", clases: ["icono-ok"]},
        requerido: true,
    },
    {
        id: "plantillabg-grupo",
        label: "Grupo",
        forma: "select",
        opcionesPredefinidas: optnsBGGrupo,
        nombre: "grupo",
        requerido: true,
        editar: false,
    },
    {
        id: "plantillabg-filtronivel",
        label: "Nivel Superior",
        forma: "input",
        tipo: "number",
        nombre: "",
        valorMinimo: "0",
        callbackInput: filtrarCuentaPadreBG(registroPReporte),
        editar: false,
        clasesColumna: "col-6 col-md-3 col-lg-2",
    },
    {
        id: "plantillabg-nivel",
        label: "Nivel Registro",
        forma: "input",
        tipo: "number",
        nombre: "nivel_registrado",
        valorMinimo: "0",
        valor: "1",
        valorPorDefecto: "1",
        soloLectura: "siempre",
        editar: false,
        clasesColumna: "col-6 col-md-3 col-lg-2",
        requerido: true,
    },
    {
        id: "plantillabg-principal",
        label: "Cuenta del Nivel Superior",
        forma: "select",
        nombre: "nombre_cuenta_superior",
        editar: false,
    },
    {
        id: "plantillabg-calculable",
        label: "Es calculable",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "es_calculable",
        valor: "si",
        editar: false,
        clasesColumna: "col-auto",
    },
    {
        id: "plantillabg-activofijo",
        label: "Es Activo Fijo",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "es_activo_fijo",
        valor: "si",
        editar: false,
        clasesColumna: "col-auto",
    },
    {
        id: "plantillabg-negrilla",
        label: "Mostrar en negrilla",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        valor: "si",
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillabg"),
    },
    {
        id: "plantillabg-cursiva",
        label: "Mostrar en cursiva",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        valor: "si",
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillabg"),
    }
];

export const formularioBGPREditar = (registroPReporte) => [
    {
        id: "plantillarepeditar-negrilla-italica",
        forma: "hidden",
        nombre: "negrilla_cursiva",
    },
    {
        id: "plantillarepeditar-tipodocumento",
        label: "Plan de cuenta",
        forma: "select",
        urlSolicitud: `${URL}select_plantilla_balance_general/${registroPReporte.idtipo_reportes}/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idplandecuenta", detalle: ["numero", "nombre"] },
        nombre: "idplandecuenta",
        clasesOpcion: {llave: "estado", valor: "usado", clases: ["icono-ok"]},
        requerido: true,
    },
    {
        id: "plantillarepeditar-orden",
        label: "Orden",
        forma: "input",
        tipo: "number",
        nombre: "orden",
    },
    {
        id: "plantillarepeditar-calculable",
        label: "Es calculable",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "es_calculable",
        valor: "si",
        clasesColumna: "col-auto",
    },
    {
        id: "plantillarepeditar-activofijo",
        label: "Es Activo Fijo",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "es_activo_fijo",
        valor: "si",
        clasesColumna: "col-auto",
    },
    {
        id: "plantillarepeditar-negrilla",
        label: "Mostrar en negrilla",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["negrilla", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillarepeditar"),
        llaveRegistro: "negrilla_cursiva",
    },
    {
        id: "plantillarepeditar-cursiva",
        label: "Mostrar en cursiva",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["cursiva", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillarepeditar"),
        llaveRegistro: "negrilla_cursiva",
    }
]

export const formularioBGNegrillaCursiva = [
    {
        id: "plantillabgng-negrilla-italica",
        forma: "hidden",
        nombre: "negrilla_cursiva",
    },
    {
        id: "plantillabgng-negrilla",
        label: "Mostrar en negrilla",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["negrilla", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillabgng"),
        llaveRegistro: "negrilla_cursiva",
    },
    {
        id: "plantillabgng-cursiva",
        label: "Mostrar en cursiva",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["cursiva", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillabgng"),
        llaveRegistro: "negrilla_cursiva",
    }
]

export const formularioBGPRVincular = [
    {
        id: "plantillarepvincular-tipodocumento",
        label: "Plan de cuenta",
        forma: "select",
        urlSolicitud: `${URL}milistaplanes/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["numero", "plan"] },
        nombre: "idcuenta_depreciacion",
        requerido: true,
        clasesColumna: "col-12",
    },
]

export const formularioBGPRInsertar = (reporte) => [
    {
        id: "plantillarepinsertar-negrilla-italica",
        forma: "hidden",
        nombre: "negrilla_cursiva",
    },
    {
        id: "plantillarepinsertar-tipodocumento",
        label: "Cuenta Contable",
        forma: "select",
        urlSolicitud: `${URL}select_plantilla_balance_general/${reporte.idtipo_reportes}/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idplandecuenta", detalle: ["numero", "nombre"] },
        nombre: "idplandecuenta",
        clasesOpcion: {llave: "estado", valor: "usado", clases: ["icono-ok"]},
        requerido: true,
    },
    {
        id: "plantillarepinsertar-grupo",
        label: "Grupo",
        forma: "input",
        tipo: "text",
        nombre: "nombre_grupo",
        soloLectura: "siempre",
    },
    {
        id: "plantillarepinsertar-nivel",
        label: "Nivel Registro",
        forma: "input",
        tipo: "number",
        nombre: "nivel_registrado",
        soloLectura: "siempre",
    },
    {
        id: "plantillarepinsertar-principal",
        label: "Cuenta del Nivel Superior",
        forma: "input",
        tipo: "text",
        nombre: "nombre_cuenta_superior",
        soloLectura: "siempre",
    },
    {
        id: "plantillarepinsertar-orden",
        label: "Orden",
        forma: "input",
        tipo: "number",
        nombre: "orden",
        soloLectura: "siempre",
    },
    {
        id: "plantillarepinsertar-calculable",
        label: "Es calculable",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "es_calculable",
        valor: "si",
        clasesColumna: "col-auto",
    },
    {
        id: "plantillarepinsertar-activofijo",
        label: "Es Activo Fijo",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        nombre: "es_activo_fijo",
        valor: "si",
        clasesColumna: "col-auto",
    },
    {
        id: "plantillarepinsertar-negrilla",
        label: "Mostrar en negrilla",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["negrilla", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillarepinsertar"),
        llaveRegistro: "negrilla_cursiva",
    },
    {
        id: "plantillarepinsertar-cursiva",
        label: "Mostrar en cursiva",
        clasesLabel: "form-label-ckeck",
        forma: "checkbox",
        arregloDeValores: ["cursiva", "cursiva_negrilla"],
        clasesColumna: "col-auto",
        callbackInput: manejarCampoNegrillaYCursiva("plantillarepinsertar"),
        llaveRegistro: "negrilla_cursiva",
    }
];