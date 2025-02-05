<?php
require_once "./listaSolicitud/listaSolicitud_conf.php";
require_once "./config/listaCompra_conf.php";
require_once "./config/caracteristicas_conf.php";
require_once "./controlCalidad/controlCalidad.php";
require_once "./listaSolicitud/editarRegistros.php";
require_once "./almacen_productos/orden_produccion.php";
require_once "./lote/lote.php";
require_once "./config/proveedor_conf.php";
require_once "./etapa_produccion/grupo_etapas.php";
require_once "./estandar_producto/estandarProducto.php";
require_once "./almacenMaterial/almacenMaterial.php";
require_once "./config/unidadTiempo_conf.php";
require_once "./etapa_produccion/usoMaquina.php";
require_once "./listaSolicitud/compra.php";
require_once "./almacen_productos/stock_productos.php";
require_once "./config/empleado.php";
require_once "./etapa_produccion/estandar_etapa_produccion.php";
require_once "./config/limpieza.php";
require_once "./controlCalidad/devoluciones.php";
require_once "./config/mantenimiento.php";
require_once "./contingencias/riesgo.php";
require_once "./contingencias/recurso_riesgo.php";
require_once "./contingencias/emergencia.php";
require_once "./contingencias/procedimiento.php";
require_once "./empleado_rh/contrataciones.php";
require_once "./empleado_rh/modopago.php";
require_once "./gastos/costo_produccion.php";
require_once "./gastos/gastos_generales.php";
require_once "./despachar/despachar_producto.php";

$ver=$_POST['verDavid'];

if($ver=="registrar_Compra_Proveedor"){   // ya esta funcionando
    if(isset($_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa'])){
        $prov = new ListaSolicitud_conf();
        $prov->comprarPorProveedor($_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fechaVenci'],$POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']));
    }
}elseif($ver=="registrarCompra"){    //ya esta funcionando
    if($_POST['fecha'] == null){
        if(isset($_POST['lote'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa'])){
            $rcompra = new ListaSolicitud_conf();
            $rcompra->registrarCompra($_POST['lote'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']);
        }else{
            echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fecha'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']));
        }
    }else{
        if(isset($_POST['lote'],$_POST['fecha'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['empresa'])){
            $rcompra = new ListaSolicitud_conf();
            $rcompra->registrarCompra($_POST['lote'],$_POST['fecha'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']);
        }else{
            echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fecha'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']));
        }
    }
}
elseif ($ver == "finalizarCompra") {                // ya esta funcionando
    $rcompra = new ListaSolicitud_conf();
    $rcompra->finalizarCompra($_POST['idpedido'],$_POST['empresa']);
}elseif($ver=="registrar_ListaCompra_Editar"){
    if(isset($_POST['cantEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['idpedido'],$_POST['empresa'])){
        // echo json_encode(array("okkkk", "perfecto entraste", "registrar_listaCompra"));
        $lcompra = new ListaCompra_conf();
        $lcompra->registrar_ListaCompra_Editar($_POST['cantEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['idpedido'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_listaCompra_editable"));
    }
}
elseif($ver=="registroCaracteristicas") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['caracteristica'],$_POST['tipo'],$_POST['empresa'])) {
        $envase = new Caracteristica_conf();
    $envase->registroCaracteristicas($_POST['caracteristica'],$_POST['tipo'],$_POST['minimo'],$_POST['maximo'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['caracteristica'],$_POST['tipo'],$_POST['minimo'],$_POST['maximo'],$_POST['empresa']));
    }
}elseif($ver=="editarCaracteristicas"){
    if (isset($_POST['idcaracteristicas'], $_POST['caracteristica'],$_POST['tipo'],$_POST['minimo'],$_POST['maximo'],$_POST['empresa'])) {
        $envase = new Caracteristica_conf();
        $envase->editarCaracteristicas($_POST['idcaracteristicas'], $_POST['caracteristica'], $_POST['tipo'],$_POST['minimo'],$_POST['maximo'], $_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud"));
    }
}
elseif($ver=="registrarControlCalidad"){    //ya esta funcionando
        if(isset($_POST['fecha_cc'],$_POST['hora_cc'],$_POST['num_doc'],$_POST['Entidad_tipo'],$_POST['Entidad_id'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado'])){
            $rcompra = new ControlCalidad();
            $rcompra->registrarControlCalidad($_POST['fecha_cc'],$_POST['hora_cc'],$_POST['num_doc'],$_POST['Entidad_tipo'],$_POST['Entidad_id'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado']);
        }else{
            echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fecha'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']));
        }
}elseif($ver=="registrarDetalleControlCalidad"){    //ya esta funcionando

    if(isset($_POST['cantidad'],$_POST['entidad_tipo'],$_POST['entidad_id'],$_POST['control_calidad_idcontrol_calidad'])){
        $rcompra = new ControlCalidad();
        $rcompra->registrarDetalleControlCalidad($_POST['cantidad'],$_POST['entidad_tipo'],$_POST['entidad_id'],$_POST['control_calidad_idcontrol_calidad']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fecha'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']));
    }
}elseif($ver=="registrar_ListaCompraSoli_Editar"){
    if(isset($_POST['fechaVenciEd'],$_POST['idpedido'],$_POST['idcompra'],$_POST['materialEd'],$_POST['tipoEnvaseEd'],$_POST['contenidoEd'],$_POST['medidaEd'],$_POST['cantidadEd'],$_POST['precioUniEd'],$_POST['empresa'])){
        // echo json_encode(array("okkkk", "perfecto entraste", "registrar_listaCompra"));
        $lcompra = new ListaSolicitud_conf();
        $lcompra->registrar_ListaCompraSoli_Editar($_POST['fechaVenciEd'],$_POST['idpedido'],$_POST['idcompra'],$_POST['materialEd'],$_POST['tipoEnvaseEd'],$_POST['contenidoEd'],$_POST['medidaEd'],$_POST['cantidadEd'],$_POST['precioUniEd'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_listaCompra_editable"));
    }
}elseif($ver=="IconoEditarPedido"){
    // "material", "cantEnvase", "tipoEnvase", "medida", "contenidoEnvase"
    if (isset($_POST['id'], $_POST['cantidadEnvase'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenidoEnvase'],$_POST['medida'],$_POST['empresa'])) {
        $editL = new ListaCompra_conf();
        $editL->IconoEditarPedido($_POST['id'], $_POST['cantidadEnvase'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenidoEnvase'],$_POST['medida'],$_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['id'], $_POST['cantEnvase'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenidoEnvase'],$_POST['medida'],$_POST['empresa']));
    }
}elseif($ver=="iconoEditarPedidoEdicion"){
    // "material", "cantEnvase", "tipoEnvase", "medida", "contenidoEnvase"
    if (isset($_POST['id'], $_POST['cantidadEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['empresa'])) {
        $editL = new ListaCompra_conf();
        $editL->iconoEditarPedidoEdicion($_POST['id'], $_POST['cantidadEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['id'], $_POST['cantidadEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['empresa']));
    }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}elseif($ver=="editarListaCompraSoli"){
    // $_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']
    if (isset($_POST['id'], $_POST['cantidad'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['precioUni'],$_POST['fechaVenci'],$_POST['empresa'])) {
        $editL = new EditarRegistros();
        $editL->editarListaCompraSoli($_POST['id'], $_POST['cantidad'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['precioUni'],$_POST['fechaVenci'],$_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['id'], $_POST['cantidad'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['precioUni'],$_POST['fechaVenci'],$_POST['empresa']));
    }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}elseif($ver=="editarListaCompraSoli_Edicion"){
    // $_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']
    if (isset($_POST['id'], $_POST['cantidadEd'],$_POST['materialEd'],$_POST['tipoEnvaseEd'],$_POST['contenidoEd'],$_POST['medidaEd'],$_POST['precioUniEd'],$_POST['fechaVenciEd'],$_POST['empresa'])) {
        $editL = new EditarRegistros();
        $editL->editarListaCompraSoli_Edicion($_POST['id'], $_POST['cantidadEd'],$_POST['materialEd'],$_POST['tipoEnvaseEd'],$_POST['contenidoEd'],$_POST['medidaEd'],$_POST['precioUniEd'],$_POST['fechaVenciEd'],$_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['id'], $_POST['cantidad'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['precioUni'],$_POST['fechaVenci'],$_POST['empresa']));
    }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}elseif($ver=="editarRegistroCompra"){
    // $_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']
    // if (isset($_POST['idcompra'], $_POST['lote'],$_POST['proveedorEd'],$_POST['idcompra'],$_POST['empresa'])) {
       // $editL = new EditarRegistros();
      //  $editL->editarRegistroCompra($_POST['idcompra'], $_POST['lote'],$_POST['proveedorEd'],$_POST['idcompra'],$_POST['empresa']);
    // }
    //  else {
    //     echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcompra'], $_POST['lote'],$_POST['proveedorEd'],$_POST['idcompra'],$_POST['empresa']));
    // }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}
elseif($ver=="registrarStockMateriaPrima"){    //ya esta funcionando
    if(isset($_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra'])){
        $rcompra = new ControlCalidad();
        $rcompra->registrarStockMateriaPrima($_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra']));
    }
}elseif($ver=="registrarLote"){    //ya esta funcionando
    if(isset($_POST['fecha_lote'],$_POST['hora_lote'],$_POST['lote'],$_POST['estado'],$_POST['fecha_entrega'],$_POST['hora_entrega'],$_POST['rubro_idrubro'],$_POST['empleado_idempleado'],$_POST['orden_produccion_idorden_produccion'],$_POST['empresa_idempresa'])){
        $rcompra = new Lote();
        $rcompra->registrarLote($_POST['fecha_lote'],$_POST['hora_lote'],$_POST['lote'],$_POST['estado'],$_POST['fecha_entrega'],$_POST['hora_entrega'],$_POST['rubro_idrubro'],$_POST['empleado_idempleado'],$_POST['orden_produccion_idorden_produccion'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['fecha_lote'],$_POST['hora_lote'],$_POST['lote'],$_POST['estado'],$_POST['fecha_entrega'],$_POST['hora_entrega'],$_POST['empleado_idempleado'],$_POST['orden_produccion_idorden_produccion'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="cambiaEstadoOrdenProduccion"){
    // $_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']
    if (isset($_POST['idordenproduccion'])) {
        $editL = new Orden_produccion();
        $editL->cambiaEstadoOrdenProduccion($_POST['idordenproduccion']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idordenproduccion']));
    }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}
elseif($ver=="registroUnidadTiempoControl") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa'])) {
        $envase = new UnidadTiempo_conf();
    $envase->registroUnidadTiempoControl($_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editarUnidadTiempoControl") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idcontrol_unidad_tiempo'],$_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa'])) {
        $envase = new UnidadTiempo_conf();
    $envase->editarUnidadTiempoControl($_POST['idcontrol_unidad_tiempo'],$_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcontrol_unidad_tiempo'],$_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_detalle_estandar_producto2") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['cantidad'],$_POST['producto_idproducto'],$_POST['material_idmaterial'])) {
        $envase = new EstandarProducto();
    $envase->registrar_detalle_estandar_producto2($_POST['cantidad'],$_POST['producto_idproducto'],$_POST['material_idmaterial']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['estandar_producto_idestandar_producto'],$_POST['material_idmaterial']));
    }
}elseif($ver=="editar_detalle_estandar_producto2") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['iddetalle_estandar_producto'],$_POST['cantidad'],$_POST['material_idmaterial'])) {
        $envase = new EstandarProducto();
    $envase->editar_detalle_estandar_producto2($_POST['iddetalle_estandar_producto'],$_POST['cantidad'],$_POST['material_idmaterial']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iddetalle_estandar_producto'],$_POST['cantidad'],$_POST['material_idmaterial']));
    }
}elseif($ver=="registrar_produccion_etapa") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['fecha_pe'],$_POST['hora_pe'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['produccion_idproduccion'],$_POST['etapas_produccion_idetapas_produccion'],$_POST['empleado_idempleado'],$_POST['grupo_etapas_idgrupo_etapas'])) {
        $envase = new Grupo_etapas();
    $envase->registrar_produccion_etapa($_POST['fecha_pe'],$_POST['hora_pe'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['produccion_idproduccion'],$_POST['etapas_produccion_idetapas_produccion'],$_POST['empleado_idempleado'],$_POST['grupo_etapas_idgrupo_etapas']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_pe'],$_POST['hora_pe'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['produccion_idproduccion'],$_POST['etapas_produccion_idetapas_produccion'],$_POST['empleado_idempleado'],$_POST['grupo_etapas_idgrupo_etapas']));
    }
}elseif($ver=="finalizar_produccion_etapa") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idproduccion_etapa'],$_POST['fecha_fin'],$_POST['hora_fin'])) {
        $envase = new Grupo_etapas();
    $envase->finalizar_produccion_etapa($_POST['idproduccion_etapa'],$_POST['fecha_fin'],$_POST['hora_fin']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idproduccion_etapa'],$_POST['fecha_fin'],$_POST['hora_fin']));
    }
}elseif($ver=="registrar_uso_maquina_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['fecha_ini'],$_POST['hora_ini'],$_POST['observaciones'],$_POST['fecha_fin'],$_POST['hora_ini'],$_POST['maquina_idmaquina'],$_POST['produccion_etapa_idproduccion_etapa'])) {
        $envase = new UsoMaquina();
    $envase->registrar_uso_maquina_produccion($_POST['fecha_ini'],$_POST['hora_ini'],$_POST['observaciones'],$_POST['fecha_fin'],$_POST['hora_ini'],$_POST['maquina_idmaquina'],$_POST['produccion_etapa_idproduccion_etapa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_ini'],$_POST['hora_ini'],$_POST['observaciones'],$_POST['fecha_fin'],$_POST['hora_ini'],$_POST['maquina_idmaquina'],$_POST['produccion_etapa_idproduccion_etapa']));
    }
}elseif($ver=="Editar_uso_maquina_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['iduso_maquina'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['observaciones'])) {
        $envase = new UsoMaquina();
    $envase->Editar_uso_maquina_produccion($_POST['iduso_maquina'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['observaciones']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iduso_maquina'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['observaciones']));
    }
}elseif($ver=="registrar_detalle_compra_material") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['cantidad'],$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['total_precio'],$_POST['fecha_venci'],$_POST['compra_idcompra'],$_POST['tipo_envase_idtipo_envase'])) {
        $envase = new Compra();
    $envase->registrar_detalle_compra_material($_POST['cantidad'],$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['total_precio'],$_POST['fecha_venci'],$_POST['compra_idcompra'],$_POST['material_idmaterial'],$_POST['tipo_envase_idtipo_envase']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['total_precio'],$_POST['fecha_venci'],$_POST['compra_idcompra'],$_POST['tipo_envase_idtipo_envase']));
    }
}elseif($ver=="registro_salida_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['cantidad'],$_POST['produccion_idproduccion'],$_POST['producto_idproducto'],$_POST['empresa_idempresa'])) {
        $envase = new Grupo_etapas();
    $envase->registro_salida_produccion($_POST['cantidad'],$_POST['produccion_idproduccion'],$_POST['producto_idproducto'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['produccion_idproduccion'],$_POST['producto_idproducto'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editar_salida_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idsalida_produccion'],$_POST['cantidad'])) {
        $envase = new Grupo_etapas();
    $envase->editar_salida_produccion($_POST['idsalida_produccion'],$_POST['cantidad']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idsalida_produccion'],$_POST['cantidad']));
    }
}elseif($ver=="finalizar_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idproduccion'])) {
        $envase = new Grupo_etapas();
    $envase->finalizar_produccion($_POST['idproduccion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idproduccion']));
    }
}elseif($ver=="registrar_detalle_pedido") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['cantidad_envases'],$_POST['tipo_envase_idtipo_envase'],$_POST['pedido_idpedido'],$_POST['material_idmaterial'],$_POST['peso_neto'])) {
        $envase = new ListaSolicitud_conf();
    $envase->registrar_detalle_pedido($_POST['cantidad_envases'],$_POST['tipo_envase_idtipo_envase'],$_POST['pedido_idpedido'],$_POST['material_idmaterial'],$_POST['peso_neto']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad_envases'],$_POST['tipo_envase_idtipo_envase'],$_POST['pedido_idpedido'],$_POST['material_idmaterial'],$_POST['peso_neto']));
    }
}elseif($ver=="editar_detalle_solicitud_material") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['iddetalle_solicitud_material'],$_POST['cantidad'],$_POST['observaciones'])) {
        $envase = new AlmacenMaterial();
    $envase->editar_detalle_solicitud_material($_POST['iddetalle_solicitud_material'],$_POST['cantidad'],$_POST['observaciones']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idsalida_produccion'],$_POST['cantidad'],$_POST['observaciones']));
    }
}elseif($ver=="salida_material_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['detalle_solicitud_material_iddetalle_solicitud_material'],$_POST['almacen_material_idalmacen_material'],$_POST['empresa_idempresa'])) {
        $envase = new AlmacenMaterial();
    $envase->salida_material_produccion($_POST['detalle_solicitud_material_iddetalle_solicitud_material'],$_POST['cantidad'],$_POST['almacen_material_idalmacen_material'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['detalle_solicitud_material_iddetalle_solicitud_material'],$_POST['almacen_material_idalmacen_material'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="actualizar_estado_solicitud_material") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idsolicitud_material'],$_POST['estado'])) {
        $envase = new AlmacenMaterial();
    $envase->actualizar_estado_solicitud_material($_POST['idsolicitud_material'],$_POST['estado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idsolicitud_material'],$_POST['estado']));
    }
}elseif($ver=="registrarStockProductos") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['cantidad'],$_POST['costo_unitario'],$_POST['empresa_idempresa'],$_POST['lote_idlote'],$_POST['control_calidad_idcontrol_calidad'],$_POST['producto_idproducto'])) {
        $envase = new Stock_productos();
    $envase->registrarStockProductos($_POST['cantidad'],$_POST['costo_unitario'],$_POST['empresa_idempresa'],$_POST['lote_idlote'],$_POST['control_calidad_idcontrol_calidad'],$_POST['producto_idproducto']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['costo_unitarioad'],$_POST['empresa_idempresa'],$_POST['lote_idlote'],$_POST['control_calidad_idcontrol_calidad'],$_POST['producto_idproducto']));
    }
}elseif($ver=="anularCompra") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['idcompra'])) {
        $envase = new Compra();
    $envase->anularCompra($_POST['idcompra']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcompra']));
    }
}elseif($ver=="anularPedido") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['idpedido'])) {
        $envase = new ListaSolicitud_conf();
    $envase->anularPedido($_POST['idpedido']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idpedido']));
    }
}elseif($ver=="registrar_estandar_etapa_produccion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion'])) {
        $envase = new Estandar_etapa_produccion();
    $envase->registrar_estandar_etapa_produccion($_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion']));
    }
}elseif($ver=="editar_estandar_etapa_produccion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['idestandar_etapa_produccion'],$_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion'])) {
        $envase = new Estandar_etapa_produccion();
    $envase->editar_estandar_etapa_produccion($_POST['idestandar_etapa_produccion'],$_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idestandar_etapa_produccion'],$_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion']));
    }
}elseif($ver=="registrar_limpieza") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado'])) {
        $envase = new Limpieza();
    $envase->registrar_limpieza($_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado']));
    }
}elseif($ver=="editar_limpieza") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
   
    if (isset($_POST['idlimpieza'],$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado'])) {
        $envase = new Limpieza();
    $envase->editar_limpieza($_POST['idlimpieza'],$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado']));
    }
}elseif($ver=="registrar_tarea_limpieza") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo'])) {
        $envase = new Limpieza();
    $envase->registrar_tarea_limpieza($_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo']));
    }
}elseif($ver=="editar_tarea_limpieza") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idtarea_limpieza'],$_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo'])) {
        $envase = new Limpieza();
    $envase->editar_tarea_limpieza($_POST['idtarea_limpieza'],$_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtarea_limpieza'],$_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo']));
    }
}elseif($ver=="registrar_devolucion_compra") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra'])) {
        $envase = new Devoluciones();
    $envase->registrar_devolucion_compra($_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra']));
    }
}elseif($ver=="registrar_devolucion_produccion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // $cantidad,$costo_unitario, $control_calidad_idcontrol_calidad,$idlote,$idproducto,$empresa_idempresa
    if (isset($_POST['cantidad'],$_POST['costo_unitario'],$_POST['control_calidad_idcontrol_calidad'],$_POST['lote_idlote'],$_POST['producto_idproducto'],$_POST['empresa_idempresa'])) {
        $envase = new Devoluciones();
    $envase->registrar_devolucion_produccion($_POST['cantidad'],$_POST['costo_unitario'],$_POST['control_calidad_idcontrol_calidad'],$_POST['lote_idlote'],$_POST['producto_idproducto'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['costo_unitario'],$_POST['control_calidad_idcontrol_calidad'],$_POST['lote_idlote'],$_POST['producto_idproducto'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_mantenimiento") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado'])) {
        $envase = new Mantenimiento();
    $envase->registrar_mantenimiento($_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado']));
    }
}elseif($ver=="editar_mantenimiento") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
   
    if (isset($_POST['idmantenimiento'],$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado'])) {
        $envase = new Mantenimiento();
    $envase->editar_mantenimiento($_POST['idmantenimiento'],$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado']));
    }
}elseif($ver=="registrar_tareas_mantenimiento") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo'])) {
        $envase = new Mantenimiento();
    $envase->registrar_tareas_mantenimiento($_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtareas_mantenimiento'],$_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo']));
    }
}elseif($ver=="editar_tareas_mantenimiento") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idtareas_mantenimiento'],$_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo'])) {
        $envase = new Mantenimiento();
    $envase->editar_tareas_mantenimiento($_POST['idtareas_mantenimiento'],$_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtareas_mantenimiento'],$_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo']));
    }
}elseif($ver=="editar_grupo_etapas") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idgrupo_etapas'],$_POST['nombre'],$_POST['empresa_idempresa'])) {
        $envase = new Grupo_etapas();
    $envase->editar_grupo_etapas($_POST['idgrupo_etapas'],$_POST['nombre'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idgrupo_etapas'],$_POST['nombre'],$_POST['empresa_idempresa']));
    }
    // $codigo, $descripcion, $probabilidad, $impacto,$tipo_variable,$idtipo_variable,$empresa_idempresa
}elseif($ver=="registrar_riesgo") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['tipo_variable'],$_POST['idtipo_variable'],$_POST['empresa_idempresa'])) {
        $envase = new Riesgo();
    $envase->registrar_riesgo($_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['tipo_variable'],$_POST['idtipo_variable'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['tipo_variable'],$_POST['idtipo_variable'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editar_riesgo") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idriesgo'],$_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['empresa_idempresa'])) {
        $envase = new Riesgo();
    $envase->editar_riesgo($_POST['idriesgo'],$_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idriesgo'],$_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_recurso_riesgo") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    // $efectividad, $recurso_riesgo_idrecurso_riesgo, $riesgo_idriesgo
    if (isset($_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa'])) {
        $envase = new Recurso_riesgo();
    $envase->registrar_recurso_riesgo($_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editar_recurso_riesgo") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idrecurso_riesgo'],$_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa'])) {
        $envase = new Recurso_riesgo();
    $envase->editar_recurso_riesgo($_POST['idrecurso_riesgo'],$_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idrecurso_riesgo'],$_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_emergencia") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    // $efectividad, $recurso_riesgo_idrecurso_riesgo, $riesgo_idriesgo
    if (isset($_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado'],$_POST['riesgo_idriesgo'])) {
        $envase = new Emergencia();
    $envase->registrar_emergencia($_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado'],$_POST['riesgo_idriesgo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado'],$_POST['riesgo_idriesgo']));
    }
}elseif($ver=="editar_emergencia") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idemergencia'],$_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion'])) {
        $envase = new Emergencia();
    $envase->editar_emergencia($_POST['idemergencia'],$_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idemergencia'],$_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion']));
    }
}elseif($ver=="editar_areas") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idareas'],$_POST['nombre'],$_POST['descripcion'],$_POST['fecha'],$_POST['sucursal_idsucursal'])) {
        $envase = new Empleado();
    $envase->editar_areas($_POST['idareas'],$_POST['nombre'],$_POST['descripcion'],$_POST['fecha'],$_POST['sucursal_idsucursal']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idareas'],$_POST['nombre'],$_POST['descripcion'],$_POST['fecha'],$_POST['sucursal_idsucursal']));
    }
}elseif($ver=="editar_cargos") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idcargos'],$_POST['cargo'],$_POST['salario'],$_POST['descripcion'],$_POST['sucursal_idsucursal'])) {
        $envase = new Empleado();
    $envase->editar_cargos($_POST['idcargos'],$_POST['cargo'],$_POST['salario'],$_POST['descripcion'],$_POST['sucursal_idsucursal']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcargos'],$_POST['cargo'],$_POST['salario'],$_POST['descripcion'],$_POST['sucursal_idsucursal']));
    }
}elseif($ver=="registrar_trabajador") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'],$_POST['cargos_idcargos'])) {
        $envase = new Empleado();
    $envase->registrar_trabajador($_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'],$_POST['cargos_idcargos']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'],$_POST['cargos_idcargos']));
    }//anularcompra
}elseif($ver=="editar_trabajador") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idtrabajador'],$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'])) {
        $envase = new Empleado();
    $envase->editar_trabajador($_POST['idtrabajador'],$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtrabajador'],$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha']));
    }
}elseif($ver=="registrar_tipocontrato") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa'])) {
        $envase = new Contrataciones();
    $envase->registrar_tipocontrato($_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'],$_POST['cargos_idcargos']));
    }
}elseif($ver=="editar_tipocontrato") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idtipocontrato'],$_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa'])) {
        $envase = new Contrataciones();
    $envase->editar_tipocontrato($_POST['idtipocontrato'],$_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtipocontrato'],$_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa']));
    }
}elseif($ver=="registrar_modopago") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['idempresa'])) {
        $envase = new Modopago();
    $envase->registrar_modopago($_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['idempresa']));
    }
}elseif($ver=="editar_modopago") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idmodopago'],$_POST['nombre'],$_POST['descripcion'],$_POST['idempresa'])) {
        $envase = new Modopago();
    $envase->editar_modopago($_POST['idmodopago'],$_POST['nombre'],$_POST['descripcion'],$_POST['idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idmodopago'],$_POST['nombre'],$_POST['descripcion'],$_POST['idempresa']));
    }
}elseif($ver=="editar_estado_modopago") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idmodopago'],$_POST['estado'])) {
        $envase = new Modopago();
    $envase->editar_estado_modopago($_POST['idmodopago'],$_POST['estado']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idmodopago'],$_POST['estado']));
    }
}elseif($ver=="registrar_contrataciones") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['modopago_idmodopago'],$_POST['trabajador_idtrabajador'],$_POST['tipocontrato_idtipocontrato'],$_POST['estado'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['cargo_idcargo'],$_POST['fecha'])) {
        $envase = new Contrataciones();
                                                                                  // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_contrataciones($_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['modopago_idmodopago'],$_POST['trabajador_idtrabajador'],$_POST['tipocontrato_idtipocontrato'],$_POST['estado'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['cargo_idcargo'],$_POST['fecha']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['modopago_idmodopago'],$_POST['trabajador_idtrabajador'],$_POST['tipocontrato_idtipocontrato'],$_POST['estado'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['cargo_idcargo'],$_POST['fecha']));
    }
}elseif($ver=="editar_contrataciones") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idcontrataciones'],$_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['fecha'])) {
        $envase = new Contrataciones();
    $envase->editar_contrataciones($_POST['idcontrataciones'],$_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['fecha']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcontrataciones'],$_POST['fechai'],$_POST['fechaf'],$_POST['fechab'],$_POST['modo'],$_POST['salario'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['fecha']));
    }
}elseif($ver=="editar_estado_contrataciones") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idcontrataciones'],$_POST['estado'])) {
        $envase = new Contrataciones();
    $envase->editar_estado_contrataciones($_POST['idcontrataciones'],$_POST['estado']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcontrataciones'],$_POST['estado']));
    }
}elseif($ver=="registrar_costo_produccion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['costo_materia_prima'],$_POST['costo_mano_obra'],$_POST['costo_gastos_generales'],$_POST['total'],$_POST['produccion_idproduccion'])) {
        $envase = new Costo_produccion();
                                                                                  // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_costo_produccion($_POST['costo_materia_prima'],$_POST['costo_mano_obra'],$_POST['costo_gastos_generales'],$_POST['total'],$_POST['produccion_idproduccion']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['costo_materia_prima'],$_POST['costo_mano_obra'],$_POST['costo_gastos_generales'],$_POST['total'],$_POST['produccion_idproduccion']));
    }
}elseif($ver=="registrar_gastos_generales") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa'])) {
        $envase = new Gastos_generales();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_gastos_generales($_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editar_gastos_generales") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idgastos_generales'],$_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa'])) {
        $envase = new Gastos_generales();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->editar_gastos_generales($_POST['idgastos_generales'],$_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idgastos_generales'],$_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_detalle_gastos") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['monto'],$_POST['tiempo'],$_POST['gastos_generales_idgastos_generales'])) {
        $envase = new Gastos_generales();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_detalle_gastos($_POST['monto'],$_POST['tiempo'],$_POST['gastos_generales_idgastos_generales']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['monto'],$_POST['tiempo'],$_POST['gastos_generales_idgastos_generales']));
    }
}elseif($ver=="editar_detalle_gastos") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['iddetalle_gastos'],$_POST['monto'],$_POST['tiempo'])) {
        $envase = new Gastos_generales();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->editar_detalle_gastos($_POST['iddetalle_gastos'],$_POST['monto'],$_POST['tiempo']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iddetalle_gastos'],$_POST['monto'],$_POST['tiempo']));
    }
}elseif($ver=="registrar_detalle_distribucion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['cantidad'],$_POST['distribucion_iddistribucion'],$_POST['producto_idproducto'])) {
        $envase = new Despachar_producto();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_detalle_distribucion($_POST['cantidad'],$_POST['distribucion_iddistribucion'],$_POST['producto_idproducto']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['distribucion_iddistribucion'],$_POST['producto_idproducto']));
    }
}elseif($ver=="registro_despacho_producto") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['cantidad'],$_POST['detalle_distribucion_iddetalle_distribucion'],$_POST['almacen_producto_idalmacen_producto'],$_POST['empresa_idempresa'])) {
        $envase = new Despachar_producto();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registro_despacho_producto($_POST['cantidad'],$_POST['detalle_distribucion_iddetalle_distribucion'],$_POST['almacen_producto_idalmacen_producto'],$_POST['empresa_idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['detalle_distribucion_iddetalle_distribucion'],$_POST['almacen_producto_idalmacen_producto'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="anularDistribucion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['iddistribucion'])) {
        $envase = new Despachar_producto();
    $envase->anularDistribucion($_POST['iddistribucion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iddistribucion']));
    }
}elseif($ver=="actualizar_estado_distribucion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['iddistribucion'],$_POST['estado'])) {
        $envase = new Despachar_producto();
    $envase->actualizar_estado_distribucion($_POST['iddistribucion'],$_POST['estado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iddistribucion'],$_POST['estado']));
    }
}elseif($ver=="editar_contrataciones_fechas") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idcontrataciones'],$_POST['fechaf'],$_POST['fechab'])) {
        $envase = new Contrataciones();
    $envase->editar_contrataciones_fechas($_POST['idcontrataciones'],$_POST['fechaf'],$_POST['fechab']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcontrataciones'],$_POST['fechaf'],$_POST['fechab']));
    }
}elseif($ver=="registrar_grupo_etapa") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['nombre'],$_POST['$empresa_idempresa'],$_POST['rubro_idrubro'])) {
        $envase = new Grupo_etapas();
    $envase->registrar_grupo_etapa($_POST['nombre'],$_POST['$empresa_idempresa'],$_POST['rubro_idrubro']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['$empresa_idempresa'],$_POST['rubro_idrubro']));
    }
}elseif($ver=="editar_etapa_produccion_empleado") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idetapa_producccion_has_empleado'],$_POST['fecha_fin'])) {
        $envase = new Empleado();
    $envase->editar_etapa_produccion_empleado($_POST['idetapa_producccion_has_empleado'],$_POST['fecha_fin']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idetapa_producccion_has_empleado'],$_POST['fecha_fin']));
    }
}

// else{registro_productos_grupo editar_contrataciones registrar_etapa_produccion_empleado
//     echo json_encode(array("siPasoParametros", " epa"));
// }
else{
// Leer el cuerpo de la solicitud

$json = file_get_contents('php://input');
    
// Decodificar el JSON
$data = json_decode($json, true);

     $ver = $data['verDavid'];
//   echo json_encode(array("siPasoParametros", " epa",$data['verDavid'],$ver));
if ($ver == "Editar_orden_produccion_lista_completa") {    
    // Verificar si se ha decodificado correctamente y si los parámetros existen
    if (isset($data['idorden_produccion'], $data['fecha_orp'], $data['hora_orp'], $data['estado'], $data['empresa_idempresa'], $data['empleado_idempleado'], $data['detalles'])) {
        $rcompra = new Orden_produccion();
        $lastIndex = count($data['detalles']) - 1;
        // Iterar sobre cada detalle y realizar la operación necesaria
        foreach ($data['detalles'] as $index => $detalle) {
            if (isset($detalle['iddetalle_produccion'], $detalle['cantidad'], $detalle['observaciones'], $detalle['orden_produccion_idorden_produccion'], $detalle['producto_idproducto'])) {
                if ($index === $lastIndex) {
                $rcompra->Editar_detalle_produccion(
                    $data['detalles']
                );
            }
            } else {
                echo json_encode(array("Error", "Faltan parámetros en un detalle", $detalle));
                return;
            }
        }
        
        // echo json_encode(array("siPasoParametros", " epa"));

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}
else if($ver=="registrarSolicitudMaterial"){
    if (isset($data['idsolicitud_material'],$data['fecha'], $data['hora'], $data['estado'], $data['empresa_idempresa'], $data['empleado_idempleado'],$data['produccion_idproduccion'], $data['detalles'])) {
        $rcompra = new AlmacenMaterial();
        // Iterar sobre cada detalle y realizar la operación necesaria
        $rcompra->registrarSolicitudMaterial(
            $data['idsolicitud_material'],$data['fecha'], $data['hora'],
            $data['estado'], $data['empresa_idempresa'], $data['empleado_idempleado'],
            $data['produccion_idproduccion'], $data['detalles']
        );
        // echo json_encode(array("siPasoParametros", " epa")); registroCaracteristicas

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}
elseif($ver=="registrar_grupo_etapas_ordenados"){
    // echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    
    if (isset($data['idgrupo_etapas'], $data['nombre'], $data['empresa'],$data['rubro_idrubro'],$data['etapas_ordenes'])) {
        $rcompra = new Grupo_etapas();
        // Iterar sobre cada detalle y realizar la operación necesaria
        $rcompra->registrar_grupo_etapas_ordenados(
            $data['idgrupo_etapas'], $data['nombre'], $data['empresa'], $data['rubro_idrubro'],$data['etapas_ordenes']
        );
        // echo json_encode(array("siPasoParametros", " epa"));

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}elseif($ver=="registro_productos_grupo"){
    // echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    
    if (isset($data['detalle'])) {
        $rcompra = new Grupo_etapas();
        // Iterar sobre cada detalle y realizar la operación necesaria
        $rcompra->registro_productos_grupo($data['detalle']);

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}elseif($ver=="registrar_proveedor_material"){
    if (isset($data['detalle'])) {
        $rcompra = new Proveedor_conf();
        // Iterar sobre cada detalle y realizar la operación necesaria
        $rcompra->registrar_proveedor_material($data['detalle']);
        // echo json_encode(array("siPasoParametros", "epa"));

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}elseif($ver=="registro_maquina_etapas"){
    if (isset($data['detalle'])) {
        $rcompra = new Grupo_etapas();
        // Iterar sobre cada detalle y realizar la operación necesaria
        $rcompra->registro_maquina_etapas($data['detalle']);
        // echo json_encode(array("siPasoParametros", "epa"));

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}elseif($ver=="registro_lista_pedidos"){
    if (isset($data['fecha_p'], $data['hora'], $data['estado'],$data['rubro_idrubro'],$data['empresa_idempresa'],$data['empleado_idempleado'],$data['detalle'])) {
        $rcompra = new ListaSolicitud_conf();
        // Iterar sobre cada detalle y realizar la operación necesaria
        $rcompra->registro_lista_pedidos($data['fecha_p'], $data['hora'], $data['estado'],$data['rubro_idrubro'],$data['empresa_idempresa'],$data['empleado_idempleado'],$data['detalle']);
        // echo json_encode(array("siPasoParametros", "epa"));

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}elseif($ver=="registrar_compras"){
    if (isset($data['pedido_idpedido'],$data['lote'], $data['fecha'],$data['hora'], $data['num_registro'],$data['total'],$data['empleado_idempleado'],$data['proveedor_idproveedor'],$data['empresa_idempresa'],$data['rubro_idrubro'],$data['detalle'])) {
        $rcompra = new Compra();
        // Iterar sobre cada detalle y realizar la operación necesaria
        // $lote,$fecha,$hora,$numReg,$total,$empleado_idempleado,$proveedor_idproveedor,$empresa,$rubro,$detalles
        $rcompra->registrar_compras($data['pedido_idpedido'],$data['lote'], $data['fecha'],$data['hora'], $data['num_registro'],$data['total'],$data['empleado_idempleado'],$data['proveedor_idproveedor'],$data['empresa_idempresa'],$data['rubro_idrubro'],$data['detalle']);
        // echo json_encode(array("siPasoParametros", "epa"));

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}elseif($ver=="registrar_etapa_produccion_empleado"){
    if (isset($data['empleados'])) {
        $rcompra = new Empleado();
        // Iterar sobre cada detalle y realizar la operación necesaria
        $rcompra->registrar_etapa_produccion_empleado($data['empleados']);
        // echo json_encode(array("siPasoParametros", "epa"));

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}elseif($ver=="registrar_procedimiento"){
    if (isset($data['procedimiento'])) {
        $rcompra = new Procedimiento();
        // Iterar sobre cada detalle y realizar la operación necesaria
        $rcompra->registrar_procedimiento($data['procedimiento']);
        // echo json_encode(array("siPasoParametros", "epa"));registrar_compras

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}elseif($ver=="registrar_distribucion"){
    // numerodoc,fecha,hora,estado,usuario_idusuario,empresa_idempresa,rubro_idrubro
    if (isset($data['numerodoc'],$data['fecha'],$data['hora'], $data['estado'],$data['usuario_idusuario'],$data['empresa_idempresa'],$data['rubro_idrubro'],$data['detalle'])) {
        $rcompra = new Despachar_producto();
        // Iterar sobre cada detalle y realizar la operación necesaria
        
        $rcompra->registrar_distribucion($data['numerodoc'],$data['fecha'],$data['hora'], $data['estado'],$data['usuario_idusuario'],$data['empresa_idempresa'],$data['rubro_idrubro'],$data['detalle']);
        // echo json_encode(array("siPasoParametros", "epa")); registro_despacho_producto

    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
    }
}
else{
    echo json_encode(array("Error", "el verDavid no coincide con ninguno de los else",$ver,$data));
}
}
?>