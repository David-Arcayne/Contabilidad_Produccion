import { URL_APIC } from "../../../../lib/services.js";
const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;

export const formularioCuentaImpuesto = [
    {
        id: "cuentaimpuesto_cuenta",
        label: "Cuenta",
        forma: "select",
        origen: `${URL_APIC}api/milistaplanes/${empresa_id}`, 
        llaves: { id: "id", detalle: ["numero", "plan"] },
        nombre: "idplandecuenta",
        required: true,
        n_registro: "idplancuenta",
        // editar: false,
    },
    {
        id: "cuentaimpuesto_impuesto",
        label: "Impuesto",
        forma: "select",
        origen: `${URL_APIC}api/impuestolista/${empresa_id}`, 
        llaves: { id: "id", detalle: ["nombreimpuesto", "tasa"] },
        nombre: "idimpuesto",
        required: true,
        editar: false,
    },
];