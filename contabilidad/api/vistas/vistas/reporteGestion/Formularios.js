import { campoCheckbox, campoSelect } from "../../funciones/CrearFormulario.js";
import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { crearElemento } from "../../funciones/Funciones.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";

const EMPRESA_ID = getEmpresaId();

function accionReporteComplementario(valor, contenedor) {
    const form = contenedor.closest("form");
    const inputEF = form.querySelector("#repgestion-estadosfinancieros");
    const fechaInicial = form.querySelector("#repgestion-fechaini");

    const divRadiosBG = form.querySelector("#repgestion-radios-ef-p-h");
    const divRadiosRC = form.querySelector("#repgestion-radios-rc-p-h");
    if (divRadiosBG) divRadiosBG.remove();
    if (divRadiosRC) divRadiosRC.remove();
    fechaInicial.closest(".col-12").classList.remove("d-none");

    if (valor) {
        inputEF.selectize ? inputEF.selectize.clear() : inputEF.value = "";
        inputEF.selectize ? inputEF.selectize.disable() : inputEF.disabled = true;
    } else {
        inputEF.selectize ? inputEF.selectize.enable() : inputEF.disabled = false;
    }

    if (valor === "1" || valor === "2") {
        const [checkPeriodico, divCheckPeriodico] = campoCheckbox(
            { atributos: { type: "radio", id: "rc-periodico", name: "radio_p_h", value: "1", checked: true } },
            { contenido: "Periódico" },
        );
        const [checkHasta, divCheckHasta] = campoCheckbox(
            { atributos: { type: "radio", id: "rc-hasta", name: "radio_p_h", value: "2" } },
            { contenido: "Hasta" },
        );
        checkHasta.addEventListener("change", () => {
            if (checkHasta.checked) {
                fechaInicial.closest(".col-12").classList.add("d-none");
            } else {
                fechaInicial.closest(".col-12").classList.remove("d-none");
            }
        });
        checkPeriodico.addEventListener("change", () => {
            if (checkPeriodico.checked) {
                fechaInicial.closest(".col-12").classList.remove("d-none");
            }
        });

        const div = crearElemento("div", { class: "col-12 mt-2", id: "repgestion-radios-rc-p-h" }, [divCheckPeriodico, divCheckHasta]);
        form.insertBefore(div, contenedor.nextSibling);

    } else if (valor.includes("|")) {
        const tipoReporteEF = valor.split("|");
        if (tipoReporteEF[1] === "balance_general"){
            const [selectNivel, divNivel] = campoSelect(
                { atributos: { id: "repgestion-nivel-ef", name: "nivel_ef" } },
                { contenido: "Nivel de detalle" },
                { atributos: { class: "mt-2", id: "repgestion-radios-rc-p-h" } }
            );
            selectNivel.innerHTML = `
                <option value="">-- Elija un nivel --</option>
                <option value="1">Rubro</option>
                <option value="2">Grupo</option>
                <option value="3">Título</option>
                <option value="4">Cuenta</option>
                <option value="5">Sub-cuenta</option>
            `;

            form.insertBefore(divNivel, contenedor.nextSibling);
        } else if (tipoReporteEF[1] === "estado_resultado") {
            const [selectNivel, divNivel] = campoSelect(
                { atributos: { id: "repgestion-nivel-ef", name: "nivel_ef" } },
                { contenido: "Nivel de detalle" },
                { atributos: { class: "mt-2", id: "repgestion-radios-rc-p-h" } }
            );
            selectNivel.innerHTML = `
                <option value="">-- Elija un nivel --</option>
                <option value="1">Nivel 1</option>
                <option value="2">Nivel 2</option>
                <option value="3">Nivel 3</option>
                <option value="4">Nivel 4</option>
                <option value="5">Nivel 5</option>
            `;

            form.insertBefore(divNivel, contenedor.nextSibling);
        }
    }
}

// valor contien "valor_id|valor_tiporeporte"
function accionEstadoFinanciero(valor, contenedor) {
    const form = contenedor.closest("form");
    const inputRC = form.querySelector("#repgestion-reportescomplementarios");
    const fechaInicial = form.querySelector("#repgestion-fechaini");

    const divRadiosBG = form.querySelector("#repgestion-radios-ef-p-h");
    const divRadiosRC = form.querySelector("#repgestion-radios-rc-p-h");
    if (divRadiosBG) divRadiosBG.remove();
    if (divRadiosRC) divRadiosRC.remove();
    fechaInicial.closest(".col-12").classList.remove("d-none");

    if (valor) {
        inputRC.selectize ? inputRC.selectize.clear() : inputRC.value = "";
        inputRC.selectize ? inputRC.selectize.disable() : inputRC.disabled = true;
    } else {
        inputRC.selectize ? inputRC.selectize.enable() : inputRC.disabled = false;
    }

    if (valor.includes("|balance_general")) {
        const [checkPeriodico, divCheckPeriodico] = campoCheckbox(
            { atributos: { type: "radio", id: "ef-periodico", name: "radio_p_h", value: "1", checked: true } },
            { contenido: "Periódico" },
        );
        const [checkHasta, divCheckHasta] = campoCheckbox(
            { atributos: { type: "radio", id: "ef-hasta", name: "radio_p_h", value: "2" } },
            { contenido: "Hasta" },
        );
        checkHasta.addEventListener("change", () => {
            if (checkHasta.checked) {
                fechaInicial.closest(".col-12").classList.add("d-none");
            } else {
                fechaInicial.closest(".col-12").classList.remove("d-none");
            }
        });
        checkPeriodico.addEventListener("change", () => {
            if (checkPeriodico.checked) {
                fechaInicial.closest(".col-12").classList.remove("d-none");
            }
        });

        const [selectNivel, divNivel] = campoSelect(
            { atributos: { id: "repgestion-nivel-ef", name: "nivel_ef" } },
            { contenido: "Nivel de detalle" },
            { atributos: { class: "mt-2"} }
        );
        selectNivel.innerHTML = `
            <option value="">-- Elija un nivel --</option>
            <option value="1">Rubro</option>
            <option value="2">Grupo</option>
            <option value="3">Título</option>
            <option value="4">Cuenta</option>
            <option value="5">Sub-cuenta</option>
        `;

        const div = crearElemento("div", { class: "col-12 mt-2", id: "repgestion-radios-ef-p-h" }, [divCheckPeriodico, divCheckHasta, divNivel]);
        form.insertBefore(div, contenedor.nextSibling);
    } else if (valor.includes("|estado_resultado")) {
        const [selectNivel, divNivel] = campoSelect(
            { atributos: { id: "repgestion-nivel-ef", name: "nivel_ef" } },
            { contenido: "Nivel de detalle" },
            { atributos: { class: "mt-2"} }
        );
        selectNivel.innerHTML = `
            <option value="">-- Elija un nivel --</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3">Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
        `;

        const div = crearElemento("div", { class: "col-12 mt-2", id: "repgestion-radios-ef-p-h" }, [divNivel]);
        form.insertBefore(div, contenedor.nextSibling);
    }
}

export const optnsRGTipoReporte = [
    {clave: 1, valor: "Balance de Sumas y saldos"},
    {clave: 3, valor: "Cuentas de Resultado"},
    {clave: 2, valor: "Cuentas de Balance"},
];
const opcionesReporteComplementario = async () => {
    const datosRep = await obtenerDatos(`${CT_URLAPI}listar_tipo_reportes_activos/2/${EMPRESA_ID}`) || [];

    const datosFiltrados = datosRep.filter(item => item.tipo_reporte === "balance_general" || item.tipo_reporte === "estado_resultado");
    const datos = datosFiltrados.map((item) => {
        return {
            id: item.idtipo_reportes + "|" + item.tipo_reporte,
            nombre: item.nombre,
        }
    })
    return [
        {
            id: 1,
            nombre: "Balance de Sumas y saldos"
        },
        {
            id: 3,
            nombre: "Cuentas de Resultado"
        },
        {
            id: 2,
            nombre: "Cuentas de Balance"
        },
        ...datos
    ];
}
export const optnsRGEstadosFinancieros= [
    {clave: 1, valor: "Balance General"},
    {clave: 2, valor: "Estado de Resultados"},
];
/** @type {DatosInput[]}*/
export const formularioRepGestion = [
    {
        id: "repgestion-fechaini",
        label: "Desde",
        forma: "input",
        tipo: "date",
        nombre: "fechaini",
        requerido: true,
        clasesColumna: "col-12 col-sm-6",
    },
    {
        id: "repgestion-fechafin",
        label: "Hasta",
        forma: "input",
        tipo: "date",
        nombre: "fechafin",
        requerido: true,
        valor: "fecha",
        clasesColumna: "col-12 col-sm-6",
    },
    {
        id: "repgestion-reportescomplementarios",
        label: "Reportes Complementarios",
        forma: "select",
        datosRegistro: opcionesReporteComplementario,
        llavesOpciones: { valor: "id", detalle: ["nombre"] },
        nombre: "reportede",
        clasesColumna: "col-12",
        callbackInput: accionReporteComplementario,
        requerido: true,
    },
    {
        id: "repgestion-estadosfinancieros",
        label: "Estados Financieros",
        forma: "select",
        urlSolicitud: `${CT_URLAPI}/listar_tipo_reportes_activos/1/${EMPRESA_ID}`,
        llavesOpciones: { valor: ["idtipo_reportes","tipo_reporte"], detalle: ["nombre"] },
        nombre: "estadosfinancieros",
        clasesColumna: "col-12",
        callbackInput: accionEstadoFinanciero,
        requerido: true,
    },
];
