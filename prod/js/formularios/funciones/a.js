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
let Listas_Compras_m = [];
let Listas_Compras_md = [];
let Lista_Medidas = [];

let listas_enviadas = {}; 


async function preparar_listas() {
    await listar();  
    
    listas_enviadas = {
        compra: Listas_Compras,
        empleados: Lista_Empleados,
        detallecompra: Lista_Detalle_Compra,
        calidad: Listas_Control_calidad,
        detallecalidad: Lista_Detalle_Control_calidad,
        material: Lista_Material,
        caracteristica: Lista_Caracteristicas_api,
        m: Listas_Compras_m,
        md: Listas_Compras_md,
        medidas: Lista_Medidas
    };
}
 






async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;

        // Ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_compras(idEmpresa),
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.Listarcompras_detalle(idEmpresa),
            listarFunctions.Listar_control_calidad_Api(idEmpresa),
            listarFunctions.Listar_detalle_control_calidad_Api(idEmpresa),
            listarFunctions.listar_material(idEmpresa),
            listarFunctions.listar_caracteristicas(idEmpresa),
            listarFunctions.listar_compras(idEmpresa),
            listarFunctions.Listarcompras_detalle(idEmpresa),
            listarFunctions.listar_medidas(idEmpresa)
        ]);

        // Asignar los resultados a las variables correspondientes
        Listas_Compras = resultados[0];
        Lista_Empleados = resultados[1];
        Lista_Detalle_Compra = resultados[2];
        Listas_Control_calidad = resultados[3];
        Lista_Detalle_Control_calidad = resultados[4];
        Lista_Material = resultados[5];
        Lista_Caracteristicas_api = resultados[6];
        Listas_Compras_m = resultados[7];
        Listas_Compras_md = resultados[8];
        Lista_Medidas = resultados[9];

    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error;
    }
}

export { preparar_listas };  // Exportar preparar_listas
