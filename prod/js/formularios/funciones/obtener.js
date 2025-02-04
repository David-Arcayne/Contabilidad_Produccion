import * as listarFunctions from "../funciones/listar.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let Listas_Compras = [];
let Lista_Empleados = [];
let Lista_Detalle_Compra = [];
let ComprasestadoCero = [];
let ComprasestadoUno = [];
let ComprasestadoDos = [];
let Listas_Control_calidad = [];
let Lista_Detalle_Control_calidad = [];
let Lista_Material = [];
let Lista_Caracteristicas_api = [];
export let Listas_Compras_m = [];
let Listas_Compras_md = [];
let Lista_Medidas = [];

let listas_enviadas = {};

export async function obtenerListaCompras() {
    const idEmpresa = uk[0].empresa.idempresa;

    return await listarFunctions.listar_compras(idEmpresa);
}
export async function listadoEvaluacionCaracteristicas() {
    const idEmpresa = uk[0].empresa.idempresa;

    return await listarFunctions.listadoEvaluacionCaracteristicas(idEmpresa);
}
export async function listadoCriterio() {
    const idEmpresa = uk[0].empresa.idempresa;

    return await listarFunctions.listadoCriterio(idEmpresa);
}
async function preparar_listas() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;

        // Ejecutar todas las solicitudes en paralelo y desestructurar resultados
        const [
            compras,
            empleados,
            detalleCompra,
            controlCalidad,
            detalleControlCalidad,
            material,
            caracteristicas,
            medidas
        ] = await Promise.all([
            listarFunctions.listar_compras(idEmpresa),
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.Listarcompras_detalle(idEmpresa),
            listarFunctions.Listar_control_calidad_Api(idEmpresa),
            listarFunctions.Listar_detalle_control_calidad_Api(idEmpresa),
            listarFunctions.listar_material(idEmpresa),
            listarFunctions.listar_caracteristicas(idEmpresa),
            listarFunctions.listar_medidas(idEmpresa)
        ]);

        // Asignar los resultados a un solo objeto
        listas_enviadas = {
            compra: compras,
            empleados: empleados,
            detallecompra: detalleCompra,
            calidad: controlCalidad,
            detallecalidad: detalleControlCalidad,
            material: material,
            caracteristica: caracteristicas,
            medidas: medidas,
            // Opcional si necesitas agrupar algunas listas más
            m: compras,  // Lista de compras repetida aquí si es necesario
            md: detalleCompra  // Detalle de compras repetido aquí si es necesario
        };

    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error;
    }
}
async function preparar_listas_vista_previa() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;

        // Ejecutar todas las solicitudes en paralelo y desestructurar resultados
        const [
            empleados,
            controlCalidad,
            detalleControlCalidad,
            material,
            caracteristicas,
            medidas,
            criterio,
            evaluacionCaracteristica
        ] = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.Listar_control_calidad_Api(idEmpresa),
            listarFunctions.Listar_detalle_control_calidad_Api(idEmpresa),  
            listarFunctions.listar_material(idEmpresa),
            listarFunctions.listar_caracteristicas(idEmpresa),
            listarFunctions.listar_medidas(idEmpresa),
            listarFunctions.listadoCriterio(idEmpresa),
            listarFunctions.listar_evaluacion_caracteristicas_de_ctc(idEmpresa)
        ]);

        // Asignar los resultados a un solo objeto
        listas_enviadas = {
            Emp : empleados,
            Calidad : controlCalidad,
            DetalleCalidad : detalleControlCalidad,
            Material : material,
            Caracteristica : caracteristicas,
            Medidas : medidas,
            Criterio : criterio,
            Evaluacion : evaluacionCaracteristica
        };

    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error;
    }
}
export { preparar_listas, listas_enviadas, preparar_listas_vista_previa};
