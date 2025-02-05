import { URL_APIP } from "../../../../lib/services.js";


// Lista para almacenar los datos de rubros
let list_rubro = [];
let List_Material = [];

// Función para listar rubros
export async function listar_rubro(uk) {
    try {
        
        const response = await fetch(`${URL_APIP}/api/listar_rubro/${uk}`);
        const data = await response.json();
        
        
        list_rubro = data;      

        return list_rubro;  
    } catch (error) {
        console.error("Error al listar rubro:", error);
        return [];  // Retorna un arreglo vacío en caso de error
    }
}

export async function listar_material(uk){
    try {
        const response = await fetch(`${URL_APIP}/api/listar_material/${uk}`);
        const data = await response.json();
        List_Material = data;
        return List_Material;
    } catch (error) {
        console.error("Error al listar Material:", error);
        return []; 
    }
   
}

export async function listarProveedor(uk){
    try {
        const response = await fetch(`${URL_APIP}/api/listarProveedor/${uk}`,{
            headers: {
                'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar Material:", error);
        return []; 
    }
    
}
export async function listar_caracteristicas(uk){
    try {
        const response = await fetch(`${URL_APIP}/api/listaCaracteristicas/${uk}`,{
            headers: {
                'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar Material:", error);
        return []; 
    }
    
}

export async function mostrar_ordenproduccion(uk){
    try {
        const response = await fetch(`${URL_APIP}api/mostrar_ordenproduccion/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar orden produccion:", error);
        return []; 
    }
    
}

export async function listar_detalle_produccion(uk){
    try {
        const response = await fetch(`${URL_APIP}api/listar_detalle_produccion/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar detalle orden produccion:", error);
        return []; 
    }
    
}

export async function listar_Empleados(uk){
    try {
        const response = await fetch(`${URL_APIP}api/getempleado/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar empleados:", error);
        return []; 
    } 
  
}
export async function select_lista_productos(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listar_Productos_OP/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar productos:", error);
        return []; 
    }
}
export async function listadoDetalleCompraRealizada(uk,id){
    
    try {
        const response = await fetch(`${URL_APIP}/api/listadoDetalleCompraRealizada/${uk}/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar productos:", error);
        return []; 
    }
}
export async function Listarcompras(uk){
    
    try {
        const response = await fetch(`${URL_APIP}/api/listar_compra_ctr_c/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar productos:", error);
        return []; 
    }
}
export async function Listarcompras_detalle(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listar_detalle_compra_ctr_c/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar productos:", error);
        return []; 
    }
}
export async function Listar_control_calidad_Api(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listadoControlCalidad/${uk}`, {
            headers: {
                'Usar-Listado-David': 'true' 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar productos:", error);
        return []; 
    }
}
export async function Listar_detalle_control_calidad_Api(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listadoDetalleControlCalidad/${uk}`,{
            headers: {
                'Usar-Listado-David': 'true' 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar productos:", error);
        return []; 
    }
}
export async function listar_compras(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listaCompraRealizada/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar productos:", error);
        return []; 
    }
}

export async function listar_medidas(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listar_unidad_producto/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar medidas:", error);
        return []; 
    }
}

export async function listarCategorias(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listarCategorias/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar rubro:", error);
        return []; 
    }
}
export async function listar_medidas_producto(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listar_medidas_producto/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar rubro:", error);
        return []; 
    }
}
export async function listar_estados_productos(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listar_estados_productos/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar rubro:", error);
        return []; 
    }
}
export async function listar_unidad_producto(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listar_unidad_producto/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar rubro:", error);
        return []; 
    }
}
export async function listar_productos_comercial(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listar_productos_comercial/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar rubro:", error);
        return []; 
    }
}
export async function listadoEvaluacionCaracteristicas(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listadoEvaluacionCaracteristicas/${uk}`,{
            headers: {
                'Usar-Listado-David': 'true' 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar medidas:", error);
        return []; 
    }
}
export async function listadoCriterio(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listadoCriterio/${uk}`,{
            headers: {
                'Usar-Listado-David': 'true' 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar medidas:", error);
        return []; 
    }
}
export async function listar_unidad_tiempo(){
    
    try {
        const response = await fetch(`${URL_APIP}api/listar_unidad_tiempo`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar medidas:", error);
        return []; 
    }
}

export async function listar_evaluacion_caracteristicas_de_ctc(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listar_evaluacion_caracteristicas_de_ctc/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar listar_evaluacion_caracteristicas_de_ctc:", error);
        return []; 
    }
}
export async function listadoOjitoControlCalidad(id){
    
    try {
        const response = await fetch(`${URL_APIP}api/listadoOjitoControlCalidad/${id}`,{
            headers: {
                'Usar-Listado-David': 'true' 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar medidas:", error);
        return []; 
    }
}

export async function listadoAlmacenMaterial(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listadoAlmacenMaterial/${uk}`,{
            headers: {
                'Usar-Listado-David': 'true' 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar listadoAlmacenMaterial:", error);
        return []; 
    }
}
export async function listadoConfirmacionAlmacenMaterial(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listadoConfirmacionAlmacenMaterial/${uk}`,{
            headers: {
                'Usar-Listado-David': 'true' 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar listadoConfirmacionAlmacenMaterial:", error);
        return []; 
    }
}
export async function listarseccion(uk){
    
    try {
        const response = await fetch(`${URL_APIP}api/listarseccion/${uk}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar listarseccion:", error);
        return []; 
    }
}
export async function mostrar_orden_produccion(id_orden_produccion){

    try {
        const response = await fetch(`${URL_APIP}api/mostrar_orden_produccion/${id_orden_produccion}`,{
            headers: {
                'Usar-Listado-David': 'true' 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al listar listarseccion:", error);
        return []; 
    }
}
