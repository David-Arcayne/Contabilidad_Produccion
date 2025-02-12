<?php
require_once "./config/divisa_conf.php";
require_once "./config/medidas_conf.php";
require_once "./config/seccion_conf.php";
require_once "./config/envase_conf.php"; 
require_once "./config/material_conf.php";
require_once "./config/maquina_conf.php";
require_once "./config/listaCompra_conf.php";
require_once "./config/producto_conf.php";
require_once "./config/rubro_conf.php";
require_once "./config/conservacion_conf.php";
require_once "./listaSolicitud/listaSolicitud_conf.php";
require_once "./config/producto_categorias.php";
require_once "./config/producto_estado.php";
require_once "./config/producto_medida.php";
require_once "./config/producto_unidad.php";
require_once "./config/grupo_conf.php";
require_once "./config/etapas_produccion_conf.php";
require_once "./config/sub_producto_conf.php";
require_once "./config/etapa_produccion_registrar.php";
require_once "./config/empleado.php";
require_once "./administracion/solicitudes_produccion.php";
require_once "./config/categoria_conf.php";
require_once "./config/caracteristicaComercial_conf.php";
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
require_once "./despachar/despachar_producto.php";//listado_produccion_grupo_etapas
require_once "./merma_fisico/alma_fisic_merma.php";

$url=explode("/",$_GET['ver']); 
if($url[0]=="listar_divisas"){
    $moneda=new Divisa_conf();
    $moneda->listar_divisas($url[1]);
}elseif($url[0]=="eliminar_divisa"){
    $moneda=new Divisa_conf();
    $moneda->eliminar_divisa($url[1],$url[2]);
}elseif($url[0] == "listamedidas") {
    $medida = new Medidas_conf();   
    $medida->listarMedidas($url[1]);
}elseif($url[0]=="eliminarmedida"){
    $medida=new Medidas_conf();
    $medida->eliminar_medida($url[1],$url[2]);
}elseif($url[0] == "listarseccion"){
    $area = new Seccion_conf();
    $area->listarseccion($url[1]);
}elseif($url[0] == "eliminar_seccion"){
    $area = new Seccion_conf();
    $area->eliminar_seccion($url[1],$url[2]);
}elseif($url[0] == "listaenvases"){
    $envase = new Envase_conf();
    $envase->listarEnvases($url[1]);
}elseif($url[0] == "eliminarenvase"){
    $envase = new Envase_conf();
    $envase->eliminar_envase($url[1],$url[2]);
}elseif($url[0] == "listar_material"){
    $mat = new Material_config();
    
    $mat->listar_material($url[1]);
}elseif($url[0] == "eliminar_material"){
    $mat = new Material_config();
    $mat->eliminar_material($url[1],$url[2]);
}elseif($url[0] == "listar_tipo_material"){
    $mat = new Material_config();
    $mat->listar_tipo_material($url[1]);
}elseif($url[0] == "eliminar_tipo_material"){
    $mat = new Material_config();
    $mat->eliminar_tipo_material($url[1],$url[2]);
}elseif($url[0] == "listar_ListaCompra"){
    $lcompra = new ListaCompra_conf();
    $lcompra->listar_listaCompra($url[1]);
}elseif($url[0] == "listar_PedidoCompra"){
    $lcompra = new ListaCompra_conf();
    $lcompra->listar_PedidoCompra($url[1]);
}elseif($url[0] == "listar_PorFechas"){ //----------------------------
    $lcompra = new ListaCompra_conf();
    $lcompra->listar_PorFechas($url[1],$url[2],$url[3],$url[4]);
}elseif($url[0] == "cancelar_listaCompra"){
    $lcompra = new ListaCompra_conf();
    $lcompra->cancelar_listaCompra($url[1],$url[2]);
}elseif($url[0] == "eliminar_listaCompra"){
    $lcompra = new ListaCompra_conf();
    $lcompra->eliminar_listaCompra($url[1],$url[2]);
}elseif($url[0] == "eliminar_pedidoCompra"){
    $lcompra = new ListaCompra_conf();
    $lcompra->eliminar_pedidoCompra($url[1],$url[2]);
}elseif($url[0] == "ver_listaCompra"){
    $lcompra = new ListaCompra_conf();
    $lcompra->ver_listaCompra($url[1],$url[2]);
}elseif($url[0] == "listar_tipomaquina"){
    $maq = new Maquina_conf();
    $maq->listar_tipomaquina($url[1]);
}
elseif($url[0] == "eliminar_tipomaquina"){
    $maq = new Maquina_conf();
    $maq->eliminar_tipomaquina($url[1],$url[2]);
}elseif($url[0] == "listar_maquina"){
    $maq = new Maquina_conf();
    $maq->listar_maquina($url[1]);
}elseif($url[0] == "eliminar_maquina"){
    $maq = new Maquina_conf();
    $maq->eliminar_maquina($url[1]);
}elseif($url[0] == "listar_variables_proceso"){
    $maq = new Maquina_conf();
    $maq->listar_variables_proceso($url[1]);
}elseif($url[0] == "eliminar_variable_proceso_maquina"){
    $maq = new Maquina_conf();
    $maq->eliminar_variable_proceso_maquina($url[1],$url[2]);
}elseif($url[0] == "listar_unidad_tiempo"){
    $prod = new Producto_conf();
    $prod->listar_unidad_tiempo();
}elseif($url[0] == "listar_rubro"){
    $maq = new Rubro_conf();
    $maq->listar_rubro($url[1]);
}elseif($url[0] == "eliminar_rubro"){
    $maq = new Rubro_conf();
    $maq->eliminar_rubro($url[1],$url[2]);
}elseif($url[0] == "eliminar_producto"){
    $maq = new Producto_conf();
    $maq->eliminar_producto($url[1]);
}elseif($url[0] == "Listar_conservacion"){
    $maq = new Conservacion_conf();
    $maq->Listar_conservacion($url[1]);
}elseif($url[0] == "Listar_caracteristicasConservacion"){
    $maq = new Conservacion_conf();
    $maq->Listar_caracteristicasConservacion($url[1]);
}elseif($url[0] == "Eliminar_caracteristicaConservacion"){
    $maq = new Conservacion_conf();
    $maq->Eliminar_caracteristicaConservacion($url[1]);
}elseif($url[0] == "listar_compraPorProveedor"){
    $prov = new ListaSolicitud_conf();
    $prov->listar_compraPorProveedor($url[1],$url[2]);
}elseif($url[0] == "listaCompraEnEspera"){
    $lcompra = new ListaSolicitud_conf();
    $lcompra->listaCompraEnEspera($url[1],$url[2]);
}elseif($url[0] == "listarProveedorDeMateriales"){
    $lcompra = new ListaSolicitud_conf();
    $lcompra->listarProveedorDeMateriales($url[1],$url[2]);
}elseif($url[0] == "listarCategorias"){
    $prov = new Producto_categorias();
    $prov->listarCategorias($url[1]);
}elseif($url[0] == "eliminar_categoria"){
    $prov = new Producto_categorias();
    $prov->eliminar_categoria($url[1],$url[2]);
}elseif($url[0] == "listar_estados_productos"){
    $prov = new Producto_estado();
    $prov->listar_estados_productos($url[1]);
}elseif($url[0] == "eliminar_estado_producto"){
    $prov = new Producto_estado();
    $prov->eliminar_estado_producto($url[1],$url[2]);
}elseif($url[0] == "listar_medidas_producto"){
    $prov = new Producto_medida();
    $prov->listar_medidas_producto($url[1]);
}elseif($url[0] == "eliminar_medida_producto"){
    $prov = new Producto_medida();
    $prov->eliminar_medida_producto($url[1],$url[2]);
}elseif($url[0] == "listar_unidad_producto"){
    $prov = new Producto_unidad();
    $prov->listar_unidad_producto($url[1]);
}elseif($url[0] == "eliminar_unidad_producto"){
    $prov = new Producto_unidad();
    $prov->eliminar_unidad_producto($url[1],$url[2]);
}elseif($url[0] == "sincronizar_con_comercial"){
    $prov = new Producto_conf();
    $prov->sincronizar_con_comercial($url[1]);
}elseif($url[0] == "listar_productos_comercial"){
    $prov = new Producto_conf();
    $prov->listar_productos_comercial($url[1]);
}elseif($url[0] == "listarGrupos") {
    $grupo = new Grupo_conf();
    $grupo->listar_grupo($url[1]);
} elseif($url[0] == "eliminar_grupo") {
    $grupo = new Grupo_conf();
    $grupo->eliminar_grupo($url[1], $url[2]);
}elseif($url[0] == "Listar_no_agrupados"){
    $cl = new Conservacion_conf();
    $cl->Listar_no_agrupados($url[1], $url[2]);
}elseif($url[0] == "listar_agrupados_conservacion"){
    $cl = new Conservacion_conf();
    $cl->listar_agrupados_conservacion($url[1], $url[2],$url[3]);
}elseif($url[0] == "delete_hasconservacion") {
    $grupo = new Conservacion_conf();
    //eco ecoe e sldsas
    $grupo->delete_hasconservacion($url[1]);
}elseif($url[0] == "listaCompraRealizada"){
    $lcrealizada = new ListaSolicitud_conf();
    $lcrealizada->listaCompraRealizada($url[1]);
}elseif($url[0] == "cancelarListaCompraForm"){
    $lcrealizada = new ListaSolicitud_conf();
    $lcrealizada->cancelarListaCompraForm($url[1]);
}elseif($url[0] == "listadoDetalleCompraRealizada"){
    $lcrealizada = new ListaSolicitud_conf();
    $lcrealizada->listadoDetalleCompraRealizada($url[1],$url[2]);
}elseif($url[0] == "eliminar_etapa_produccion"){
    $lcrealizada = new Etapas_produccion_conf();
    $lcrealizada->eliminar_etapa_produccion($url[1]);
}elseif($url[0] == "listar_etapas_produccion"){
    $lcrealizada = new Etapas_produccion_conf();
    $lcrealizada->listar_etapas_produccion($url[1]);
}elseif($url[0] == "listar_sub_productos"){
    $lcrealizada = new Sub_producto_conf();
    $lcrealizada->listar_sub_productos($url[1]);
}elseif($url[0] == "eliminar_sub_producto"){
    $lcrealizada = new Sub_producto_conf();
    $lcrealizada->eliminar_sub_producto($url[1]);
}elseif($url[0] == "listar_etapas_has_maquina"){
    $lcrealizada = new Etapas_produccion_registrar();
    $lcrealizada->listar_etapas_has_maquina($url[1]);
}elseif($url[0] == "eliminar_etapas_has_maquina"){
    $lcrealizada = new Etapas_produccion_registrar();
    $lcrealizada->eliminar_etapas_has_Maquinas($url[1]);
}elseif($url[0] == "listar_etapas_has_material"){
    $lcrealizada = new Etapas_produccion_registrar();
    $lcrealizada->listar_etapas_has_material($url[1]);//listarProveedor
}elseif($url[0] == "eliminar_etapas_has_material"){
    $lcrealizada = new Etapas_produccion_registrar();
    $lcrealizada->eliminar_etapas_has_Materiales($url[1]);
}elseif($url[0] == "listar_etapas_has_producto"){
    $lcrealizada = new Etapas_produccion_registrar();
    $lcrealizada->listar_etapas_has_producto($url[1]);
}elseif($url[0] == "eliminar_etapas_has_producto"){
    $lcrealizada = new Etapas_produccion_registrar();
    $lcrealizada->eliminar_etapas_has_Productos($url[1]);
}elseif($url[0] == "listar_etapas_has_subproducto"){
    $lcrealizada = new Etapas_produccion_registrar();
    $lcrealizada->listar_etapas_has_subproducto($url[1]);
}elseif($url[0] == "eliminar_etapas_has_subproducto"){
    $lcrealizada = new Etapas_produccion_registrar();
    $lcrealizada->eliminar_etapas_has_Subproductos($url[1]);
}elseif($url[0] == "listar_Productos_OP"){
    $lcrealizada = new Producto_conf();
    $lcrealizada->listar_Productos_OP($url[1]);
}elseif($url[0] == "getempleado"){
    $emp = new Empleado();
    $emp->getEmpleado($url[1]);
}elseif($url[0] == "getusuario"){
    $emp = new Empleado();
    $emp->getUsuario($url[1]);
}elseif ($url[0] == "mostrar_ordenproduccion") {
    $cls = new Solicitudes_produccion();
    $cls-> mostrar_ordenproduccion($url[1]);
}elseif ($url[0] == "listar_detalle_produccion") {
    $cls = new Solicitudes_produccion();
    $cls-> listar_detalle_produccion($url[1]);
}elseif ($url[0] == "listar_evaluacion_caracteristicas_de_ctc") {
    $cls = new Material_config();
    $cls-> listar_evaluacion_caracteristicas_de_ctc($url[1]);
}elseif ($url[0] == "listar_categorias_comercial") {
    $cls = new Categoria_conf();
    $cls-> listar_categorias_comercial($url[1]);
}elseif ($url[0] == "listar_caracteristica_comercial") {
    $cls = new CaracteristicaComercial_conf();
    $cls-> listar_caracteristica_comercial($url[1]);
}elseif ($url[0] == "eliminar_medidaCaracteristica") {
    $cls = new CaracteristicaComercial_conf();
    $cls-> eliminar_medidaCaracteristica($url[1]);
}elseif ($url[0] == "eliminar_categoriaComercial") {
    $cls = new Categoria_conf();
    $cls-> eliminar_categoriaComercial($url[1]);
}elseif($url[0] == "Listar_etapa_empleado"){
    $prov = new Empleado();
    $prov->Listar_etapa_empleado($url[1]);
}elseif($url[0] == "get_trabajador_sucursal"){
    $prov = new Empleado();
    $prov->get_trabajador_sucursal($url[1]);
}elseif($url[0] == "listado_areas"){
    $prov = new Empleado();
    $prov->listado_areas($url[1]);
}elseif($url[0] == "listado_cargos"){
    $prov = new Empleado();
    $prov->listado_cargos($url[1]);
}elseif($url[0] == "eliminar_areas"){
    $prov = new Empleado();
    $prov->eliminar_areas($url[1]);
}elseif($url[0] == "eliminar_cargos"){
    $prov = new Empleado();
    $prov->eliminar_cargos($url[1]);
}elseif($url[0] == "get_trabajador_recursos_humanos"){
    $prov = new Empleado();
    $prov->get_trabajador_recursos_humanos($url[1]);
}elseif($url[0] == "listarProveedor"){
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
}elseif($url[0] == "listar_producto_almacen"){
    $prov = new Stock_productos();
    $prov->listar_producto_almacen($url[1]);
}elseif($url[0] == "eliminar_almacen_fisico"){
    $prov = new Alma_fisic_merma();
    $prov->eliminar_almacen_fisico($url[1]);
}elseif($url[0] == "listar_almacen_fisico"){
    $prov = new Alma_fisic_merma();
    $prov->listar_almacen_fisico($url[1]);
}elseif($url[0] == "eliminar_merma"){
    $prov = new Alma_fisic_merma();
    $prov->eliminar_merma($url[1]);
}elseif($url[0] == "listar_merma"){
    $prov = new Alma_fisic_merma();
    $prov->listar_merma($url[1]);
}elseif($url[0] == "listar_salida_produccion"){
    $prov = new Grupo_etapas();
    $prov->listar_salida_produccion($url[1]);
}//produccion_etapa 

?>         