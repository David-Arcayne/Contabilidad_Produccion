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
    $lcrealizada->listar_etapas_has_material($url[1]);
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
}
elseif ($url[0] == "listar_compra_ctr_c") {
    $cls = new Material_config();
    $cls-> listar_compra_ctr_c($url[1]);
}
elseif ($url[0] == "listar_detalle_compra_ctr_c") {
    $cls = new Material_config();
    $cls-> listar_detalle_compra_ctr_c($url[1]);
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
}
?>         