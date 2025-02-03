import { URL_APIC } from "../../../../lib/services.js";
import { crearElemento } from "../../funciones/Funciones.js";
const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

export const optnsRCPTipoReporte = [
    // {clave: 0, valor: "Ninguno"},
    {clave: 1, valor: "Activo Disponible"},
    {clave: 2, valor: "Detalle de Transacción"},
    {clave: 3, valor: "Detalle Factura p/Transacción"},
];

export const ResetearReporteDe = async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    if (elemento) {
        const reporteDe = form.querySelector("#repcontableperiodico_reportede");
        reporteDe.value = "";   

        const divTF = form.querySelector("#div_tipofactura");
        if (divTF) {
            divTF.remove();
        }
    }
}

export const ResetearPlanCuenta = async (elemento, contenedor) => {
    const form = contenedor.parentNode;
    if (elemento) {
        if (elemento === "3") {
            const selectTFactura = crearElemento("select", { class: "form-select", name: "tipofactura" });
            selectTFactura.innerHTML = `
                <option value="">-- Tipo de factura --</option>
                <option value="1">Compra</option>
                <option value="2">Venta</option>
                <option value="3">Todos</option>`;
            const divCol = crearElemento("div", { class: "col-12", id: "div_tipofactura" }, [selectTFactura]);
            form.insertBefore(divCol, contenedor.nextSibling);
        } else {
            const divTF = form.querySelector("#div_tipofactura");
            if (divTF) {
                divTF.remove();
            }
        }

        const planCuenta = form.querySelector("#repcontableperiodico_plancuenta");
        const a = $(planCuenta)[0].selectize;
        a.clear();
    } else {
        const divTF = form.querySelector("#div_tipofactura");
        if (divTF) {
            divTF.remove();
        }
    }
}

export const formularioRepContablePeriodico = [
    {
        id: "repcontableperiodico_fechaini",
        label: "Desde",
        forma: "input",
        tipo: "date",
        nombre: "fechaini",
        required: true,
        valor: "date",
        columnas: "col-12 col-sm-6",
    },
    {
        id: "repcontableperiodico_fechafin",
        label: "Hasta",
        forma: "input",
        tipo: "date",
        nombre: "fechafin",
        required: true,
        valor: "date",
        columnas: "col-12 col-sm-6",
    },
    {
        id: "repcontableperiodico_reportede",
        label: "Reporte de",
        forma: "select",
        opciones:optnsRCPTipoReporte,
        nombre: "reportede",
        columnas: "col-12",
        accion: ResetearPlanCuenta,

    },
    {
        id: "repcontableperiodico_plancuenta",
        label: "Cuenta para Libro Mayor",
        forma: "select",
        origen: `${URL_APIC}api/milistaplanes/${empresa_id}`, 
        llaves: { id: "id", detalle: ["numero", "plan"] },
        nombre: "cuenta",
        columnas: "col-12",
        accion: ResetearReporteDe,
    },
];

export const optnsRCCTipoReporte = [
    {clave: 1, valor: "Comprobante Contable"},
    {clave: 2, valor: "Activo Disponible"},
];
export const InputCheck = async (elemento, contenedor) => {
    const form = contenedor.parentNode;

    if (elemento === "1") {
        const inputC = crearElemento("input", { class: "form-check-input p-2 mt-2", id: "repcontablecomprobante_facturas", name: "check_factura", type: "checkbox", value: "1" });
        const labelC = crearElemento("label", { class: "form-label-ckeck p-2", for: "repcontablecomprobante_facturas" }, ["Sin facturas"]);
        const divCheck = crearElemento("div", { class: "form-check form-check-inline" }, [inputC, labelC]);
        const divCol = crearElemento("div", { class: "col-12", id: "div_check_facturas" }, [divCheck]);
        form.insertBefore(divCol, contenedor.nextSibling);
    } else {
        const divCheck = form.querySelector("#div_check_facturas");
        if (divCheck) {
            divCheck.remove();
        }
    }
}

export const formularioRepContableComprobante = [
    {
        id: "repcontablecomprobante_ninicio",
        label: "N. Comprobante inicio",
        forma: "input",
        tipo: "text",
        nombre: "fechainib",
        required: true,
        columnas: "col-12 col-sm-6",
    },
    {
        id: "repcontablecomprobante_nfinal",
        label: "N. Comprobante final",
        forma: "input",
        tipo: "text",
        nombre: "fechafinb",
        required: true,
        columnas: "col-12 col-sm-6",
    },
    {
        id: "repcontablecomprobante_reportede",
        label: "Reporte de",
        forma: "select",
        opciones:optnsRCCTipoReporte,
        nombre: "reportede",
        required: true,
        columnas: "col-12",
        accion: InputCheck,
    },
];
