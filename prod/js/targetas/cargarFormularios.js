import { mensurables_config } from "../formularios/Mensurables/mensurables.js"; 
import { equipamiento_config } from "../formularios/Equipamiento/equipamiento.js";
import { cualidades_config } from "../formularios/Cualidades/cualidades.js";
//import { envasesconfig } from "../formularios/configuracion/envases.js";
//import { materialconfig } from "../formularios/configuracion/material.js";
import { listaconfig } from "../formularios/Administracion/listaCompra.js";
import { maquinaConfig_admin } from "../formularios/Maquina/maquina.js";
import { productoConfig } from "../formularios/producto/productos.js";
import { linea_de_produccion } from "../formularios/Linea_de_produccion/linea_de_produccion.js";
import { listaSolicitudesConfig } from "../formularios/listaSolicitudess/listaSolicitudes.js";
import { proveedoresConfig } from "../formularios/configuracion/proveedor.js";
//import { caracteristicasConfig } from "../formularios/control_calidad/caracteristicas.js";
import { control_calidad_compra } from "../formularios/control_calidad/control_calidad_compra.js";
import { Orden_produccion_solic } from "../formularios/Almacen_producto/orden_produccion.js";
import { solicitudes_productos } from "../formularios/solicitudes_productos/solicitudes.js";
import { stock_material_stock } from "../formularios/stock_material/stock.js";
import { stock_productos_stock } from "../formularios/stock_producto/stock.js";
import { solicitar_material_produccion } from "../formularios/solicitar_material_produccion/solicitar_material.js";
import { despachar_materiales_alacen } from "../formularios/despachar_materiales/principal.js"
import { materialconfig_admin } from "../formularios/material/material.js";
const formularios = {
    'general': (codigo, permisos, refrescar) => mensurables_config(codigo, permisos, refrescar),
    'equipamiento': (codigo, permisos, refrescar) => equipamiento_config(codigo, permisos, refrescar),
    'insumos&material': (codigo, permisos, refrescar) => cualidades_config(codigo, permisos, refrescar),
    //'envases': (codigo, permisos, refrescar) => envasesconfig(codigo, permisos, refrescar),
   // 'material': (codigo, permisos, refrescar) => materialconfig(codigo, permisos, refrescar),
    'generarlistacompra': (codigo, permisos, refrescar) => listaconfig(codigo, permisos, refrescar),   
    'maquina': (codigo, permisos, refrescar) => maquinaConfig_admin(codigo, permisos, refrescar),
    'producto':(codigo, permisos, refrescar) => productoConfig(codigo, permisos, refrescar),
    'produccion&producto':(codigo, permisos, refrescar) => linea_de_produccion(codigo, permisos, refrescar),
    'registrarcompra':(codigo, permisos, refrescar) => listaSolicitudesConfig(codigo, permisos, refrescar),
    'proveedores':(codigo, permisos, refrescar) => proveedoresConfig(codigo, permisos, refrescar),
    //'caracteristicas':(codigo, permisos, refrescar) => caracteristicasConfig(codigo, permisos, refrescar),
    'controlcalidadcompra':(codigo, permisos, refrescar) => control_calidad_compra(codigo, permisos, refrescar),
    'listaordenproduccion':(codigo, permisos, refrescar) => Orden_produccion_solic(codigo, permisos, refrescar),
    'solicitudesproductos':(codigo, permisos, refrescar) => solicitudes_productos(codigo, permisos, refrescar),
    'stockmateriaprima':(codigo, permisos, refrescar) => stock_material_stock(codigo, permisos, refrescar),
    'stockproductos':(codigo, permisos, refrescar) => stock_productos_stock(codigo, permisos, refrescar),
    'solicitarmateriales':(codigo, permisos, refrescar) => solicitar_material_produccion(codigo, permisos, refrescar),
    'despacharmateriales':(codigo, permisos, refrescar) => despachar_materiales_alacen(codigo, permisos, refrescar),
    'material' : (codigo, permisos, refrescar) => materialconfig_admin(codigo, permisos, refrescar),
};

export function cargarFormulario(code, codigo, permisos, menuprimario, menusegundario, refrescar) {
    formularios[code](codigo, permisos, menuprimario, menusegundario, refrescar);
}
