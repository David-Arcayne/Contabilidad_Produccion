// import { casientomodelo } from "../formularios/asientomodelo.js";
// import { cclientes } from "../formularios/clientes.js";
// import { cfacturasxcobrar } from "../formularios/facturasxcobras.js";
// import { cfacturasxpagar } from "../formularios/facturasxpagar.js";
// import { cgestioncontable } from "../formularios/gestioncontable.js";
// import { plandecuentas } from "../formularios/plandecuentas.js";
// import { cproveedores } from "../formularios/proveedores.js";
// import { sreportecontable } from "../formularios/reportecontable.js";
// import { sreportedegestion } from "../formularios/reportedegestion.js";
// import { ctipodecambio } from "../formularios/tipodecambio.js";
// import { ctransacciones } from "../formularios/transacciones.js";
// import {cgrupodeReporte} from "../formularios/grupodereporte.js"
// import { sReporteporGrupo } from "../formularios/reporteporgrupo.js";

const formularios = {
    // 'plandecuentas': (codigo, permisos, refrescar) => plandecuentas(codigo, permisos, refrescar),
    // 'asientomodelo': (codigo, permisos, refrescar) => casientomodelo(codigo, permisos, refrescar),
    // 'tipodecambio': (codigo, permisos, refrescar) => ctipodecambio(codigo, permisos, refrescar),
    // 'gestioncontable': (codigo, permisos, refrescar) => cgestioncontable(codigo, permisos, refrescar),
    // 'transacciones': (codigo, permisos, refrescar) => ctransacciones(codigo, permisos, refrescar),
    // 'clientes': (codigo, permisos, refrescar) => cclientes(codigo, permisos, refrescar),
    // 'proveedores': (codigo, permisos, refrescar) => cproveedores(codigo, permisos, refrescar),
    // 'facturasxcobras':(codigo, permisos, refrescar) => cfacturasxcobrar(codigo, permisos, refrescar),
    // 'facturasxpagar':(codigo, permisos, refrescar) => cfacturasxpagar(codigo, permisos, refrescar),
    // 'reportecontable':(codigo, permisos, refrescar) => sreportecontable(codigo, permisos, refrescar),
    // 'reportedegestion':(codigo, permisos, refrescar) => sreportedegestion(codigo, permisos, refrescar),
    // 'grupodereporte': (codigo,permisos,refrescar) => cgrupodeReporte(codigo,permisos,refrescar),
    // 'reporteporgrupo':(codigo,permisos,refrescar) => sReporteporGrupo(codigo,permisos,refrescar),
    'plandecuentas': (codigo, permisos) => import("../vistas/planDeCuentas/index.js").then(vista => vista.PlanDeCuentas(codigo, permisos)),
    'asientomodelo': (codigo, permisos) => import("../vistas/asientoModelo/index.js").then(vista => vista.AsientoModelo(codigo, permisos)),
    'tipodecambio': (codigo, permisos) => import("../vistas/tipoCambio/index.js").then(vista => vista.TipoCambio(codigo, permisos)),
    'gestioncontable': (codigo, permisos) => import("../vistas/gestionContable/index.js").then(vista => vista.GestionContable(codigo, permisos)),
    'transacciones': (codigo, permisos) => import("../vistas/transacciones/index.js").then(vista => vista.Transacciones(codigo, permisos)),
    'clientes': (codigo, permisos) => import("../vistas/clientes/index.js").then(vista => vista.Clientes(codigo, permisos)),
    'proveedores': (codigo, permisos) => import("../vistas/proveedores/index.js").then(vista => vista.Proveedores(codigo, permisos)),
    'facturasxcobras': (codigo, permisos) => import("../vistas/facturasCobrar/index.js").then(vista => vista.SMFacturasCobrar(codigo, permisos)),
    'facturasxpagar': (codigo, permisos) => import("../vistas/facturasPagar/index.js").then(vista => vista.FacturasPagar(codigo, permisos)),
    'reportecontable': (codigo, permisos) => import("../vistas/reporteContable/index.js").then(vista => vista.ReporteContable(codigo, permisos)),
    'reportedegestion': (codigo, permisos) => import("../vistas/reporteGestion/index.js").then(vista => vista.ReporteGestion(codigo, permisos)),
    'grupodereporte': (codigo, permisos) => import("../vistas/grupoDeReporte/index.js").then(vista => vista.GrupoDeReporte(codigo, permisos)),
    'reporteporgrupo': (codigo, permisos) => import("../vistas/reportePorGrupo/index.js").then(vista => vista.ReportePorGrupo(codigo, permisos)),

    'tiposdeasiento': (codigo, permisos) => import("../vistas/tipoAsiento/index.js").then(vista => vista.TipoAsiento(codigo, permisos)),
    'impuestos': (codigo, permisos) => import("../vistas/impuesto/index.js").then(vista => vista.Impuesto(codigo, permisos)),
    'solicitudesdesc': (codigo, permisos) => import("../vistas/solicitudesDesconsolidar/index.js").then(vista => vista.SolicitudesDesconsolidar(codigo, permisos)),
    'cuentasimpuestos': (codigo, permisos) => import("../vistas/cuentasImpuestos/index.js").then(vista => vista.CuentasImpuestos(codigo, permisos)),
};

export function cargarFormulario(codigo, permisos) {
    let formulario = formularios[codigo.split("-")[0]];
    if (formulario) {
        if ( permisos.length === 4 && (permisos[0] == "0" || permisos[0] == "1") && (permisos[1] == "0" || permisos[1] == "1") && (permisos[2] == "0" || permisos[2] == "1") && (permisos[3] == "0" || permisos[3] == "1")) {
            if ((permisos[0] == "0" && permisos[1] == "0" && permisos[2] == "0" && permisos[3] == "0") || permisos[0] === "0") {
                console.log("No permitido");
                return false;
            }
            const objPermisos = {lectura: permisos[0], escritura: permisos[1], editar: permisos[2], eliminar: permisos[3]};
            return () => formulario(codigo, objPermisos);
        } else {
            console.log("No permitido, error");
            return false;
        }
    } else {
        console.log("No se encontro la ventana");
        return false;
    }
}