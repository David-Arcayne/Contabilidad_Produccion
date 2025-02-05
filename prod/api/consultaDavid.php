<?php
require_once "./config/proveedor_conf.php";
require_once "./config/listaCompra_conf.php";
require_once "./config/caracteristicas_conf.php";
require_once "./listaSolicitud/listaSolicitud_conf.php";
require_once "./controlCalidad/controlCalidad.php";
require_once "./controlCalidad/edicionCC.php";
require_once "./almacenMaterial/almacenMaterial.php";
require_once "./almacen_productos/orden_produccion.php";
require_once "./lote/lote.php";
require_once "./etapa_produccion/grupo_etapas.php";
require_once "./estandar_producto/estandarProducto.php";
require_once "./config/unidadTiempo_conf.php";
require_once "./etapa_produccion/usoMaquina.php";
require_once "./listaSolicitud/compra.php";
require_once "./reportes/reporte_produccion.php";
require_once "./almacen_productos/stock_productos.php";
require_once "./etapa_produccion/estandar_etapa_produccion.php";
require_once "./config/limpieza.php";
require_once "./config/mantenimiento.php";
require_once "./controlCalidad/devoluciones.php";
require_once "./contingencias/riesgo.php";
require_once "./contingencias/recurso_riesgo.php";
require_once "./contingencias/emergencia.php";
require_once "./contingencias/procedimiento.php";
require_once "./empleado_rh/contrataciones.php";
require_once "./empleado_rh/modopago.php";
require_once "./gastos/costo_produccion.php";
require_once "./gastos/gastos_generales.php";
require_once "./despachar/despachar_producto.php";

$url=explode("/",$_GET['ver']); 

if($url[0] == "listarProveedor"){
    $prov = new Proveedor_conf();
    $prov->listarProveedor($url[1]);
}elseif($url[0] == "listarProveedorMaterial"){
    $prov = new Proveedor_conf();
    $prov->listarProveedorMaterial($url[1]);
}elseif($url[0] == "eliminar_proveedor"){
    $area = new Proveedor_conf();
    $area->eliminar_proveedor($url[1],$url[2]);
}elseif($url[0] == "eliminar_proveedor_material"){
    $area = new Proveedor_conf();
    $area->eliminar_proveedor_material($url[1],$url[2]);
}
elseif($url[0] == "listar_ListaCompraEditable"){
    $lcompra = new ListaCompra_conf();
    $lcompra->listar_ListaCompraEditable($url[1],$url[2]);
}elseif($url[0] == "listaCaracteristicas"){
    $envase = new Caracteristica_conf();
    $envase->listaCaracteristicas($url[1]);
}elseif($url[0] == "eliminarCaracteristica"){
    $envase = new Caracteristica_conf();
    $envase->eliminarCaracteristica($url[1],$url[2]);
}elseif($url[0] == "eliminar_listaCompra_edit"){
    $lcompra = new ListaCompra_conf();
    $lcompra->eliminar_listaCompra_edit($url[1],$url[2]);
}elseif($url[0] == "listarCompraEsperaEdit"){
    $lcompra = new ListaSolicitud_conf();
    $lcompra->listarCompraEsperaEdit($url[1],$url[2]);
}elseif($url[0] == "listadoDetalleControlCalidad"){
    $lcompra = new ControlCalidad();
    $lcompra->listadoDetalleControlCalidad($url[1],$url[2]);
}elseif($url[0] == "listadoControlCalidad"){
    $lcompra = new ControlCalidad();
    $lcompra->listadoControlCalidad($url[1]);
}elseif($url[0] == "eliminar_listaCompraSoli_edit"){
    $lcompra = new ListaSolicitud_conf();
    $lcompra->eliminar_listaCompraSoli_edit($url[1],$url[2]);
}elseif($url[0] == "eliminar_compraEspera"){
    $lcompra = new ListaSolicitud_conf();
    $lcompra->eliminar_compraEspera($url[1],$url[2]);
}elseif($url[0] == "eliminar_listaCompraSoli"){
    $lcompra = new ListaSolicitud_conf();
    $lcompra->eliminar_listaCompraSoli($url[1],$url[2]);
}elseif($url[0] == "listadoEvaluacionCaracteristicas"){
    $lcompra = new ControlCalidad();
    $lcompra->listadoEvaluacionCaracteristicas($url[1]);
}elseif($url[0] == "listadoCriterio"){
    $lcompra = new ControlCalidad();
    $lcompra->listadoCriterio($url[1]);
}elseif($url[0] == "eliminar_criterio"){
    $lcriterio = new EdicionCC();
    $lcriterio->eliminar_criterio($url[1]);
}elseif($url[0] == "listadoOjitoControlCalidad"){
    $lcompra = new ControlCalidad();
    $lcompra->listadoOjitoControlCalidad($url[1]);
}elseif($url[0] == "listadoAlmacenMaterial"){
    $lcompra = new AlmacenMaterial();
    $lcompra->listadoAlmacenMaterial($url[1]);
}elseif($url[0] == "listadoConfirmacionAlmacenMaterial"){
    $lcompra = new AlmacenMaterial();
    $lcompra->listadoConfirmacionAlmacenMaterial($url[1]);
}elseif($url[0] == "mostrar_orden_produccion"){
    $lcompra = new Orden_produccion();
    $lcompra->mostrar_orden_produccion($url[1]);
}elseif($url[0] == "listadoProduccionLote"){
    $lcompra = new Lote();
    $lcompra->listadoProduccionLote($url[1]);
}elseif($url[0] == "buscarProveedorPorMaterial"){
    $lcompra = new Proveedor_conf();
    $lcompra->buscarProveedorPorMaterial($url[1],$url[2]);
}elseif($url[0] == "mostrar_orden_produccionPor_empresa"){
    $lcompra = new Orden_produccion();
    $lcompra->mostrar_orden_produccionPor_empresa($url[1]);
}elseif($url[0] == "listar_grupo_etapas"){
    $lcompra = new Grupo_etapas();
    $lcompra->listar_grupo_etapas($url[1]);
}elseif($url[0] == "listar_grupo_etapas_porProducto"){
    $lcompra = new Grupo_etapas();
    $lcompra->listar_grupo_etapas_porProducto($url[1]);
}elseif($url[0] == "listar_productos_porGrupo"){
    $lcompra = new Grupo_etapas();
    $lcompra->listar_productos_porGrupo($url[1]);
}elseif($url[0] == "listar_productos_porGrupo_y_etapas"){
    $lcompra = new Grupo_etapas();
    $lcompra->listar_productos_porGrupo_y_etapas($url[1]);
}elseif($url[0] == "Listar_proveedor_material"){
    $prov = new Proveedor_conf();
    $prov->Listar_proveedor_material($url[1]);
}elseif($url[0] == "listado_maquina_etapas"){
    $prov = new Grupo_etapas();
    $prov->listado_maquina_etapas($url[1]);
}elseif($url[0] == "listar_estandares_producto_material"){
    $prov = new EstandarProducto();
    $prov->listar_estandares_producto_material($url[1]);
}elseif($url[0] == "listaUnidadTiempoControl"){
    $prov = new UnidadTiempo_conf();
    $prov->listaUnidadTiempoControl($url[1]);
}elseif($url[0] == "eliminarUnidadTiempoControl"){
    $prov = new UnidadTiempo_conf();
    $prov->eliminarUnidadTiempoControl($url[1]);
}elseif($url[0] == "eliminar_detalleEstandar"){
    $prov = new EstandarProducto();
    $prov->eliminar_detalleEstandar($url[1]);
}elseif($url[0] == "listar_detalle_estandar"){
    $prov = new EstandarProducto();
    $prov->listar_detalle_estandar($url[1]);
}elseif($url[0] == "Listar_solicitud_material_produccion"){
    $prov = new AlmacenMaterial();
    $prov->Listar_solicitud_material_produccion($url[1]);
}elseif($url[0] == "listarProveedores_por_unMaterial"){
    $prov = new Proveedor_conf();
    $prov->listarProveedores_por_unMaterial($url[1]);
}elseif($url[0] == "Listar_pedidos_material"){
    $prov = new ListaSolicitud_conf();
    $prov->Listar_pedidos_material($url[1]);
}elseif($url[0] == "listar_produccion_etapa"){
    $prov = new Grupo_etapas();
    $prov->listar_produccion_etapa($url[1],$url[2]);
}elseif($url[0] == "eliminar_produccion_etapa"){
    $prov = new Grupo_etapas();
    $prov->eliminar_produccion_etapa($url[1]);
}elseif($url[0] == "listar_uso_maquina_produccion"){
    $prov = new UsoMaquina();
    $prov->listar_uso_maquina_produccion($url[1]);
}elseif($url[0] == "eliminar_uso_maquina_produccion"){
    $prov = new UsoMaquina();
    $prov->eliminar_uso_maquina_produccion($url[1]);
}elseif($url[0] == "listar_compras"){
    $prov = new Compra();
    $prov->listar_compras($url[1]);
}elseif($url[0] == "eliminar_detalle_compra_material"){
    $prov = new Compra();
    $prov->eliminar_detalle_compra_material($url[1]);
}elseif($url[0] == "listar_produccion_etapa_porProduccion"){
    $prov = new Grupo_etapas();
    $prov->listar_produccion_etapa_porProduccion($url[1]);
}elseif($url[0] == "eliminar_salidaProduccion"){
    $prov = new Grupo_etapas();
    $prov->eliminar_salidaProduccion($url[1]);
}elseif($url[0] == "listaSalidaProduccion"){
    $prov = new Grupo_etapas();
    $prov->listaSalidaProduccion($url[1]);
}elseif($url[0] == "listado_produccion_grupo_etapas"){
    $prov = new Grupo_etapas();
    $prov->listado_produccion_grupo_etapas($url[1]);
}elseif($url[0] == "reporte_produccion"){
    $prov = new Reporte_produccion();
    $prov->reporte_produccion($url[1]);
}elseif($url[0] == "eliminar_detalle_solicitud_material"){
    $prov = new AlmacenMaterial();
    $prov->eliminar_detalle_solicitud_material($url[1]);
}elseif($url[0] == "lista_material_produccion"){
    $prov = new AlmacenMaterial();
    $prov->lista_material_produccion($url[1]);
}elseif($url[0] == "listadoOjitoControlCalidadProduccion"){
    $prov = new ControlCalidad();
    $prov->listadoOjitoControlCalidadProduccion($url[1]);
}elseif($url[0] == "listadoAlmacenProducto"){
    $prov = new Stock_productos();
    $prov->listadoAlmacenProducto($url[1]);
}elseif($url[0] == "listar_estandar_etapa_produccion"){
    $prov = new Estandar_etapa_produccion();
    $prov->listar_estandar_etapa_produccion($url[1]);
}elseif($url[0] == "eliminar_estandar_etapa_produccion"){
    $prov = new Estandar_etapa_produccion();
    $prov->eliminar_estandar_etapa_produccion($url[1]);
}elseif($url[0] == "listar_limpieza"){
    $prov = new Limpieza();
    $prov->listar_limpieza($url[1]);
}elseif($url[0] == "eliminar_limpieza"){
    $prov = new Limpieza();
    $prov->eliminar_limpieza($url[1]);
}elseif($url[0] == "listar_tarea_limpieza"){
    $prov = new Limpieza();
    $prov->listar_tarea_limpieza($url[1]);
}elseif($url[0] == "eliminar_tarea_limpieza"){
    $prov = new Limpieza();
    $prov->eliminar_tarea_limpieza($url[1]);
}elseif($url[0] == "listar_mantenimiento"){
    $prov = new Mantenimiento();
    $prov->listar_mantenimiento($url[1]);
}elseif($url[0] == "eliminar_mantenimiento"){
    $prov = new Mantenimiento();
    $prov->eliminar_mantenimiento($url[1]);
}elseif($url[0] == "listar_tareas_mantenimiento"){
    $prov = new Mantenimiento();
    $prov->listar_tareas_mantenimiento($url[1]);
}elseif($url[0] == "eliminar_tareas_mantenimiento"){
    $prov = new Mantenimiento();
    $prov->eliminar_tareas_mantenimiento($url[1]);
}elseif($url[0] == "eliminar_detalle_pedido"){
    $prov = new ListaSolicitud_conf();
    $prov->eliminar_detalle_pedido($url[1]);
}elseif($url[0] == "listado_devolucion_produccion"){
    $prov = new Devoluciones();
    $prov->listado_devolucion_produccion($url[1]);
}elseif($url[0] == "listado_devolucion_compra"){
    $prov = new Devoluciones();
    $prov->listado_devolucion_compra($url[1]);
}elseif($url[0] == "listado_riesgo"){
    $prov = new Riesgo();
    $prov->listado_riesgo($url[1]);
}elseif($url[0] == "eliminar_riesgo"){
    $prov = new Riesgo();
    $prov->eliminar_riesgo($url[1]);
}elseif($url[0] == "listado_recurso_riesgo"){
    $prov = new Recurso_riesgo();
    $prov->listado_recurso_riesgo($url[1]);
}elseif($url[0] == "eliminar_recurso_riesgo"){
    $prov = new Recurso_riesgo();
    $prov->eliminar_recurso_riesgo($url[1]);
}elseif($url[0] == "listado_emergencia"){
    $prov = new Emergencia();
    $prov->listado_emergencia($url[1]);
}elseif($url[0] == "eliminar_emergencia"){
    $prov = new Emergencia();
    $prov->eliminar_emergencia($url[1]);
}elseif($url[0] == "listar_procedimiento"){
    $prov = new Procedimiento();
    $prov->listar_procedimiento($url[1]);
}elseif($url[0] == "listar_tipocontrato"){
    $prov = new Contrataciones();
    $prov->listar_tipocontrato($url[1]);
}elseif($url[0] == "eliminar_tipocontrato"){
    $prov = new Contrataciones();
    $prov->eliminar_tipocontrato($url[1]);
}elseif($url[0] == "listar_modopago"){
    $prov = new Modopago();
    $prov->listar_modopago($url[1]);
}elseif($url[0] == "eliminar_modopago"){
    $prov = new Modopago();
    $prov->eliminar_modopago($url[1]);
}elseif($url[0] == "listar_contrataciones"){
    $prov = new Contrataciones();
    $prov->listar_contrataciones($url[1]);
}elseif($url[0] == "listar_limpieza_fecha_reciente"){
    $prov = new Limpieza();
    $prov->listar_limpieza_fecha_reciente($url[1]);
}elseif($url[0] == "listar_costo_produccion"){
    $prov = new Costo_produccion();
    $prov->listar_costo_produccion($url[1]);
}elseif($url[0] == "listar_gastos_generales"){
    $prov = new Gastos_generales();
    $prov->listar_gastos_generales($url[1]);
}elseif($url[0] == "eliminar_gastos_generales"){
    $prov = new Gastos_generales();
    $prov->eliminar_gastos_generales($url[1]);
}elseif($url[0] == "listar_detalle_gastos"){
    $prov = new Gastos_generales();
    $prov->listar_detalle_gastos($url[1]);
}elseif($url[0] == "listar_mantenimiento_fecha_reciente"){
    $prov = new Mantenimiento();
    $prov->listar_mantenimiento_fecha_reciente($url[1]);
}elseif($url[0] == "listar_distribucion"){
    $prov = new Despachar_producto();
    $prov->listar_distribucion($url[1]);
}elseif($url[0] == "eliminar_detalle_distribucion"){
    $prov = new Despachar_producto();
    $prov->eliminar_detalle_distribucion($url[1]);
}elseif($url[0] == "despacho_producto"){
    $prov = new Despachar_producto();
    $prov->despacho_producto($url[1]);
}elseif($url[0] == "eliminar_grupo_etapas"){
    $prov = new Grupo_etapas();
    $prov->eliminar_grupo_etapas($url[1]);
}

?>   