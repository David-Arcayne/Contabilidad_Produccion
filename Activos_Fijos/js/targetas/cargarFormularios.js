const formularios = {
    "categoriasaf": (codigo, permisos) => import("../vistas/categorias/index.js").then(module => module.Categorias(codigo, permisos)),
    "tipobien": (codigo, permisos) => import("../vistas/tipoBien/index.js").then(module => module.TipoBien(codigo, permisos)),
    "metododepreciacion": (codigo, permisos) => import("../vistas/metodoDepreciacion/index.js").then(module => module.MetodoDepreciacion(codigo, permisos)),
    "tipossituacionaf": (codigo, permisos) => import("../vistas/tipoSituacion/index.js").then(module => module.TipoSituacion(codigo, permisos)),
    "tiposbajaaf": (codigo, permisos) => import("../vistas/tipoBaja/index.js").then(module => module.TipoBaja(codigo, permisos)),
    "tiposestadoaf": (codigo, permisos) => import("../vistas/tipoEstado/index.js").then(module => module.TipoEstado(codigo, permisos)),
    "tiposeguro": (codigo, permisos) => import("../vistas/tipoSeguro/index.js").then(module => module.TipoSeguro(codigo, permisos)),
    "tipocambio": (codigo, permisos) => import("../vistas/tipoCambio/index.js").then(module => module.TipoCambio(codigo, permisos)),
    "tipoinventario": (codigo, permisos) => import("../vistas/tipoInventario/index.js").then(module => module.TipoInventario(codigo, permisos)),
    "tiempodealertas": (codigo, permisos) => import("../vistas/tiempoAlerta/index.js").then(module => module.TiempoAlerta(codigo, permisos)),
    "afaltas": (codigo, permisos) => import("../vistas/activosFijos/index.js").then(module => module.ActivosFijos(codigo, permisos)),
    "afbajas": (codigo, permisos) => import("../vistas/bajas/index.js").then(module => module.Bajas(codigo, permisos)),
    "reporteactivofijo": (codigo, permisos) => import("../vistas/reporteActivosFijos/index.js").then(module => module.ReporteActivoFijo(codigo, permisos)),
    "elegirinventario": (codigo, permisos) => import("../vistas/elegirInventario/index.js").then(module => module.ElegirInventario(codigo, permisos)),
    "empresas": (codigo, permisos) => import("../vistas/empresaSeguro/index.js").then(module => module.EmpresaSeguro(codigo, permisos)),
    "poliza": (codigo, permisos) => import("../vistas/seguros/index.js").then(module => module.Seguros(codigo, permisos)),
    "solicitaraf": (codigo, permisos) => import("../vistas/solicitarActivo/index.js").then(module => module.SolicitarActivo(codigo, permisos)),
    "solicitudespendientes": (codigo, permisos) => import("../vistas/solicitudesPendientes/index.js").then(module => module.SolicitudesAFPendientes(codigo, permisos)),
    "controlindividual": (codigo, permisos) => import("../vistas/movimientoIndividual/index.js").then(module => module.MovimientoIndividual(codigo, permisos)),
    "asignacion": (codigo, permisos) => import("../vistas/movimientos/index.js").then(module => module.Movimientos(codigo, permisos)),
    "reasignacion": (codigo, permisos) => import("../vistas/reasignacion/index.js").then(module => module.Reasignacion(codigo, permisos)),
    "movimientoadministrador": (codigo, permisos) => import("../vistas/movimientoActivo/index.js").then(module => module.MovimientoActivo(codigo, permisos)),
    "reportemovimientos": (codigo, permisos) => import("../vistas/reporteMovimientos/index.js").then(module => module.ReporteMovimientos(codigo, permisos)),
    "inventario": (codigo, permisos) => import("../vistas/inventarios/index.js").then(module => module.Inventarios(codigo, permisos)),
    "registrosituacion": (codigo, permisos) => import("../vistas/registroSituacion/index.js").then(module => module.RegistroSituacion(codigo, permisos)),
    "cuadrodepreciacion": (codigo, permisos) => import("../vistas/cuadroDepreciacion/index.js").then(module => module.CuadroDeDepreciacion(codigo, permisos)),
    "estadosituacionindividual": (codigo, permisos) => import("../vistas/cuadroIndividual/index.js").then(module => module.EstadoSituacionIndividual(codigo, permisos)),

    "asignardepreciacion": (codigo, permisos) => import("../vistas/activoDepreciacion/index.js").then(module => module.ActivoFijoDepreciacion(codigo, permisos)),
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