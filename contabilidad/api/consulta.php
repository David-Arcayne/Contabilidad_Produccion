<?php
require_once "admin.php";
require_once "contabilidad.php";
require_once "reportes.php";
require_once "funciones.php";
require_once "./plan_cuentas/plandecuentas.php";
require_once "./transacciones_facturas/transFactura_pagar.php";
require_once "./solicitudes/insertar_transaccion.php";
require_once "./solicitudes/anulacion_transaccion.php";
require_once "./transacciones_facturas/transacciones.php";
require_once "./recibos/cuentaspof.php";
require_once "./recibos/cuentaspor.php";
require_once "./otras_cuentas/documento_cobro.php";
require_once "./otras_cuentas/recibo_otras_cuentas.php";
require_once "./configuracion/divisa.php";
require_once "./configuracion/asiento.php";
require_once "./recibos/caja_bancos_recibos.php";
require_once "alertas.php";
require_once "./facturas/filtrado_facturas.php";
require_once "./facturas/factura_comercial.php";
require_once "./configuracion/firma_reporte.php";
require_once "./configuracion/reporte_confi.php";
require_once "./configuracion/rp_plantilla_reporte.php";
require_once "./otras_cuentas/forma_pago.php";
require_once "./configuracion/plantilla_admin.php";

$ver=explode("/",$_GET['ver']); //dividiendo los "/"  ver[0],ver[1],ver[x]  listafacturaapi_pagado eliminarasiento tipo
if($ver[0]=="verificacion"){
$ad=new Admin();
$ad->verificacion();
}elseif($ver[0]=="checkusersucursal"){
$ad=new Admin();
$ad->checkusersucursal();
}elseif($ver[0]=="milistaplanes"){
$ad=new Admin();
$ad->milistaplanes($ver[1]);
}elseif($ver[0]=="deleteplan"){
    $ad=new Admin();
    $ad->deleteplan($ver[1]);
}elseif($ver[0]=="listaplanesempresa"){
$ad=new Admin();
$ad->listaplanesempresa($ver[1]);
}elseif($ver[0]=="agregarplanes"){
$ad=new Admin();
$ad->agregarplanes($ver[1]);
}elseif($ver[0]=="reemplazarplanes"){
$ad=new Admin();
$ad->reemplazarplanes($ver[1]);
}elseif($ver[0]=="listafacturaapi_cobrado"){
    $ad=new Contabilidad();
    $ad->listafacturaapi_cobrado($ver[1]);
}elseif($ver[0]=="lista_cobrar_cobrado_factura"){
    $ad=new Contabilidad();
    $ad->lista_cobrar_cobrado_factura($ver[1]);
}elseif($ver[0]=="listatipodecambio"){
$ad=new Admin();
$ad->listatipodecambio($ver[1]);
}elseif($ver[0]=="listatransacciones"){
$cont=new Transacciones();
$cont->listatransacciones($ver[1]);
}elseif($ver[0]=="tipotransaccion"){
$cont=new Contabilidad();
$cont->tipotransaccion();
//echo "Hola";
}elseif($ver[0]=="listadetalletransaccion"){
$cont=new Transacciones();
$cont->listadetalletransaccion($ver[1]);
}elseif($ver[0]=="eliminardetalle"){
$cont=new Transacciones();
$cont->eliminardetalle($ver[1]);
}elseif($ver[0]=="reportedetallefpt"){
$rep=new Reportes();
$rep->reportedetallefpt($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="reportedetallefptclasefactura"){
    $rep=new Reportes();
    $rep->reportedetallefptclasefactura($ver[1],$ver[2],$ver[3],$ver[4]);
}elseif($ver[0]=="reportedetalletransaccion"){
$rep=new Reportes();
$rep->reportedetalletransaccion($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="reporteactivodisponible"){
$rep=new Reportes();
$rep->reporteactivodisponible($ver[1],$ver[2],$ver[3],$ver[4]);
}elseif($ver[0]=="encabezado"){
$rep=new Reportes();
$rep->encabezado($ver[1]);
}elseif($ver[0]=="firmas"){
$rep=new Reportes();
$rep->firmas($ver[1],$ver[2]);
}elseif($ver[0]=="reportebalancedesumasysaldos"){
$rep=new Reportes();
$rep->reportebalancedesumasysaldos($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="reportebalancedesumasysaldoshasta"){
$rep=new Reportes();
$rep->reportebalancedesumasysaldoshasta($ver[1],$ver[2]);
}elseif($ver[0]=="reporteactivoypasivo"){
$rep=new Reportes();
$rep->reporteactivoypasivo($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="reporteactivoypasivohasta"){
$rep=new Reportes();
$rep->reporteactivoypasivohasta($ver[1],$ver[2]);
}elseif($ver[0]=="reportecuentasderesultado"){
$rep=new Reportes();
$rep->reportecuentasderesultado($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="reportebalancegeneral"){
$rep=new Reportes();
$rep->reportebalancegeneral($ver[1],$ver[2],$ver[3],$ver[4],$ver[5]);
}elseif($ver[0]=="reportebalancegeneralpp"){
    $rep=new Reportes();
    $rep->reportebalancegeneralpp($ver[1],$ver[2],$ver[3],$ver[4],$ver[5]);
    }elseif($ver[0]=="reportebalancegeneralhasta"){
$rep=new Reportes();
$rep->reportebalancegeneralhasta($ver[1],$ver[2],$ver[3],$ver[4],$ver[5]);
}elseif($ver[0]=="reportebalancegeneralhastapp"){
    $rep=new Reportes();
    $rep->reportebalancegeneralhastapp($ver[1],$ver[2],$ver[3],$ver[4],$ver[5]);
}elseif($ver[0]=="reportecomprobantecontable"){
$rep=new Reportes();
$rep->reportecomprobantecontable($ver[1],$ver[2],$ver[3],$ver[4],$ver[5],$ver[6]);
}elseif($ver[0]=="reporteactivodiaponibledos"){
$rep=new Reportes();
$rep->reporteactivodiaponibledos($ver[1],$ver[2],$ver[3],$ver[4],$ver[5]);
}elseif($ver[0]=="facturas"){
$cont=new Contabilidad();
$cont->facturas($ver[1]);
}elseif($ver[0]=="listaproveedores"){
$cont=new Contabilidad();
$cont->listaproveedores($ver[1]);
}elseif($ver[0]=="listaclientes"){
    $cont=new Contabilidad();
    $cont->listaclientes($ver[1]);
}elseif($ver[0]=="listaasientos"){
$cont=new Contabilidad();
$cont->listaasientos($ver[1]);
}elseif($ver[0]=="eliminarasiento"){
$cont=new Contabilidad();
$cont->eliminarasiento($ver[1]);
}elseif($ver[0]=="listaasientosc"){
$cont=new Contabilidad();
$cont->listaasientosc($ver[1]);
}elseif($ver[0]=="eliminartasiento"){
$cont=new Contabilidad();
$cont->eliminartasiento($ver[1]);
}
// elseif($ver[0]=="listafactura"){ listaclientes proveedor
// $cont=new Contabilidad();
// $cont->listafactura($ver[1]); individual
// }
elseif($ver[0]=="eliminarfactura"){
$cont=new Contabilidad();
$cont->eliminarfactura($ver[1]);
}
// elseif($ver[0]=="listacobrarfactura"){
// $cont=new Contabilidad();
// $cont->listacobrarfactura($ver[1]);
// }
elseif($ver[0]=="listapagos"){
$cont=new Contabilidad();
$cont->listapagos($ver[1]);
}elseif($ver[0]=="eliminarpago"){
$cont=new Contabilidad();
$cont->eliminarpago($ver[1]);
}elseif($ver[0]=="listadegestion"){
$cont=new Contabilidad();
$cont->listadegestion($ver[1]);
}elseif($ver[0]=="listapagarfactura"){
$cont=new Contabilidad();
$cont->listapagarfactura($ver[1]);
}
// elseif($ver[0]=="listacobrarfacturazero"){
// $cont=new Contabilidad();
// $cont->listacobrarfacturazero($ver[1]);
// }
elseif($ver[0]=="listapagoscobros"){
$cont=new Contabilidad();
$cont->listapagoscobros($ver[1]);
}elseif($ver[0]=="mayorcuentacontable"){
$rep=new Reportes();
$rep->mayorcuentacontable($ver[1],$ver[2],$ver[3],$ver[4]);
}elseif($ver[0]=="eliminarcliente"){
$cont=new Contabilidad();
$cont->eliminarcliente($ver[1]);
}elseif($ver[0]=="eliminarproveedor"){
$cont=new Contabilidad();
$cont->eliminarproveedor($ver[1]);
}elseif($ver[0]=="estadogestion"){
$cont=new Contabilidad();
$cont->estadogestion($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="getgestionactual"){
$cont=new Contabilidad();
$cont->getgestionactual($ver[1]);
}elseif($ver[0]=="eliminartransaccion"){
$cont=new Transacciones();
$cont->eliminartransaccion($ver[1]);
}elseif($ver[0]=="gestionlista"){
$cont=new Contabilidad();
$cont->gestionlista($ver[1]);
}elseif($ver[0]=="obtenereportefacturacobrar"){
$rep=new Reportes();
$rep->obtenereportefacturacobrar($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="obtenereportefacturapagar"){
$rep=new Reportes();
$rep->obtenereportefacturapagar($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="eliminarcobrados"){
$cont=new Contabilidad();
$cont->eliminarcobrados($ver[1]);
}elseif($ver[0]=="eliminarpagar"){
$cont=new Contabilidad();
$cont->eliminarpagar($ver[1]);
}elseif($ver[0]=="listagrupos"){
$cont=new Contabilidad();
$cont->listagrupos($ver[1]);
}elseif($ver[0]=="listacuentas"){
$cont=new Contabilidad();
$cont->listacuentas($ver[1],$ver[2]);   
}elseif($ver[0]=="obtenerreportegrupo"){
$rep=new FuncionesReportes();
$rep->obtenerreportegrupo($ver[1],$ver[2]);
//$res=array($ver[1],$ver[2]);
//echo  json_encode($res);
}elseif($ver[0]=="eliminartipocambio"){
$adm=new Admin();
$adm->eliminartipocambio($ver[1],$ver[2]);
}elseif($ver[0]=="listadetemplates"){
$adm=new Admin();
$adm->listadetemplates();
}elseif($ver[0]=="eliminarlistacuentas"){
$cont=new Contabilidad();
$cont->eliminarlistacuentas($ver[1]);
}elseif($ver[0]=="eliminargrupo"){
$cont=new Contabilidad();
$cont->eliminargrupo($ver[1]);
}elseif($ver[0]=="duplicartransaccion"){
$cont=new Contabilidad();
$cont->duplicartransaccion($ver[1]);
}elseif($ver[0]=="importartemplate"){
$adm=new Admin();
$adm->importartemplate($ver[1],$ver[2],$ver[3]);
//$res=array($ver[1],$ver[2]);
//echo  json_encode($res);
}elseif($ver[0]=="listatemplate"){
$adm=new Admin();
$adm->listatemplate($ver[1]);
}elseif($ver[0]=="eliminartemplate"){
$adm=new Admin();
$adm->eliminartemplate($ver[1],$ver[2]);
//$dim=$ver[1].$ver[2];
//echo json_encode($dim);
}elseif($ver[0]=="vertemplate"){
$adm=new Admin();
$adm->vertemplate($ver[1],$ver[2]);
}elseif($ver[0]=="vertemplatedatos"){
$repo=new Reportes();
$repo->vertemplatedatos($ver[1],$ver[2],$ver[3],$ver[4]);
}elseif($ver[0]=="creartipoasientolista"){//lista tipo de transaaciones para asientos
$adm=new Admin();
$adm->creartipoasientolista($ver[1]);
}elseif($ver[0]=="creartipoasientodelete"){
$adm=new Admin();
$adm->creartipoasientodelete($ver[1]);
}elseif($ver[0]=="impuestolista"){
$adm=new Admin();
$adm->impuestolista($ver[1]);
}elseif($ver[0]=="impuestocreardelete"){
$adm=new Admin();
$adm->impuestocreardelete($ver[1]);
}elseif($ver[0]=="actualizatipotransaccion01"){
$adm=new Admin();
$adm->actualizatipotransaccion01($ver[1]);
}elseif($ver[0]=="consolidar"){
$cont=new Contabilidad();
$cont->consolidar($ver[1],$ver[2]);
}elseif($ver[0]=="listadesconsolidar"){
$cont=new Contabilidad();
$cont->listadesconsolidar($ver[1],$ver[2]);
}elseif($ver[0]=="deleterelacionip"){
$cont=new Contabilidad();
$cont->deleterelacionip($ver[1]);
}elseif($ver[0]=="listarelacionip"){
$cont=new Contabilidad();
$cont->listarelacionip($ver[1]);
}elseif($ver[0]=="plancuentasout"){
$cont=new Contabilidad();
$cont->plancuentasout($ver[1]);
}elseif($ver[0]=="listaimpuestoentreplan"){
$cont=new Contabilidad();
$cont->listaimpuestoentreplan($ver[1]);
}elseif($ver[0]=="listar_vinculacion_cuentas_xcxp"){
    $cont=new Plandecuentas();
    $cont->listar_vinculacion_cuentas_xcxp($ver[1]);
}elseif($ver[0]=="eliminar_vinculacion_cuenta_xcxp"){
    $cont=new Plandecuentas();
    $cont->eliminar_vinculacion_cuenta_xcxp($ver[1]);
}elseif($ver[0]=="listar_cuentas_NoVinculadas"){
    $cont=new Plandecuentas();
    $cont->listar_cuentas_NoVinculadas($ver[1]);
}elseif($ver[0]=="lista_pagar_pagado_factura"){
    $cont=new TransFactura_pagar();
    $cont->lista_pagar_pagado_factura($ver[1]);
}elseif($ver[0]=="listapagos_individuales"){
    $cont=new TransFactura_pagar();
    $cont->listapagos_individuales($ver[1]);
}elseif($ver[0]=="listafacturaapi_pagado"){
    $cont=new Contabilidad();
    $cont->listafacturaapi_pagado($ver[1]);
}elseif($ver[0]=="reemplazar_todos_planescuentas"){
    $cont=new Admin();
    $cont->reemplazar_todos_planescuentas($ver[1]);
}elseif($ver[0]=="listafactura_pagado"){
    $cont=new Contabilidad();
    $cont->listafactura_pagado($ver[1]);
}elseif($ver[0]=="listafactura_cobrado"){
    $cont=new Contabilidad();
    $cont->listafactura_cobrado($ver[1]);
}elseif($ver[0]=="listafactura_pago_trans"){
    $cont=new Contabilidad();
    $cont->listafactura_pago_trans($ver[1]);
}elseif($ver[0]=="listafactura_cobro_trans"){
    $cont=new Contabilidad();
    $cont->listafactura_cobro_trans($ver[1]);
}elseif($ver[0]=="lista_transaccionEn_espera"){
    $cont=new Insertar_transaccion();
    $cont->lista_transaccionEn_espera($ver[1],$ver[2]);
}elseif($ver[0]=="listar_anular_eliminar_transaccion"){
    $cont=new Anulacion_transaccion();
    $cont->listar_anular_eliminar_transaccion($ver[1],$ver[2]);
}elseif($ver[0]=="listar_caja_bancos"){
    $cont=new Plandecuentas();
    $cont->listar_caja_bancos($ver[1]);
}elseif($ver[0]=="eliminar_caja_bancos"){
    $cont=new Plandecuentas();
    $cont->eliminar_caja_bancos($ver[1]);
}elseif($ver[0]=="listar_recibo_por_id"){
    $cont=new Cuentaspof();
    $cont->listar_recibo_por_id($ver[1]);
}elseif($ver[0]=="listar_recibo_pago_por_id"){
    $cont=new Cuentaspor();
    $cont->listar_recibo_pago_por_id($ver[1]);
}elseif($ver[0]=="listar_cajas_bancos_por_recibo"){
    $cont=new Cuentaspof();
    $cont->listar_cajas_bancos_por_recibo($ver[1]);
}elseif($ver[0]=="listar_tipo"){
    $cont=new Contabilidad();
    $cont->listar_tipo($ver[1]);
}elseif($ver[0]=="listar_otras_cuentas_cobrar"){
    $cont=new Documento_cobro();
    $cont->listar_otras_cuentas_cobrar($ver[1]);
}elseif($ver[0]=="eliminar_tipo"){
    $cont=new Contabilidad();
    $cont->eliminar_tipo($ver[1]);
}elseif($ver[0]=="listar_cajas_bancos_pagar_por_recibo"){
    $cont=new Cuentaspor();
    $cont->listar_cajas_bancos_pagar_por_recibo($ver[1]);
}elseif($ver[0]=="listar_recibo_otras_cuentas"){
    $cont=new Recibo_otras_cuentas();
    $cont->listar_recibo_otras_cuentas($ver[1]);
}elseif($ver[0]=="listar_recibo_por_id_otras_cuentas"){
    $cont=new Documento_cobro();
    $cont->listar_recibo_por_id_otras_cuentas($ver[1]);
}
elseif($ver[0]=="listar_recibo_otras_cuentas_pagar"){
    $cont=new Recibo_otras_cuentas();
    $cont->listar_recibo_otras_cuentas_pagar($ver[1]);
}elseif($ver[0]=="listar_recibo_por_id_otras_cuentas_pagar"){
    $cont=new Documento_cobro();
    $cont->listar_recibo_por_id_otras_cuentas_pagar($ver[1]);
}elseif($ver[0]=="listar_otras_cuentas_pagar"){
    $cont=new Documento_cobro();
    $cont->listar_otras_cuentas_pagar($ver[1],$ver[2]);
}elseif($ver[0]=="listar_divisa"){
    $cont=new Divisa();
    $cont->listar_divisa($ver[1]);
}elseif($ver[0]=="reporte_comprobante_ingreso_egreso"){
    $cont=new Reportes();
    $cont->reporte_comprobante_ingreso_egreso($ver[1],$ver[2],$ver[3],$ver[4],$ver[5],$ver[6]);
}elseif($ver[0]=="listar_operacion_modulo"){
    $cont=new Asiento();
    $cont->listar_operacion_modulo($ver[1]);
}elseif($ver[0]=="listar_asignacion_asiento_operacion"){
    $cont=new Asiento();
    $cont->listar_asignacion_asiento_operacion($ver[1]);
}
elseif($ver[0]=="listar_asiento_por_modulo"){
    $cont=new Asiento();
    $cont->listar_asiento_por_modulo($ver[1],$ver[2]);
}elseif($ver[0]=="listar_operacion_modulo_filtrado"){
    $cont=new Asiento();
    $cont->listar_operacion_modulo_filtrado($ver[1]);
}elseif($ver[0]=="listatransacciones_comercial"){
    $cont=new Transacciones();
    $cont->listatransacciones_comercial($ver[1],$ver[2]);
}elseif($ver[0]=="existe_empresa_modulo"){
    $cont=new Transacciones();
    $cont->existe_empresa_modulo($ver[1]);
}elseif($ver[0]=="listar_recibo_por_caja_bancos"){//listar_recibo_por_caja_bancos
    $cont=new Caja_bancos_recibos();
    $cont->listar_recibo_por_caja_bancos($ver[1],$ver[2],$ver[3],$ver[4]);
}elseif($ver[0]=="alerta_desconsolidacion"){
    $cont=new Alertas();
    $cont->alerta_desconsolidacion($ver[1]);
}elseif($ver[0]=="alerta_transaccionEn_espera"){
    $cont=new Alertas();
    $cont->alerta_transaccionEn_espera($ver[1]);
}elseif($ver[0]=="alerta_anular_eliminar_transaccion"){
    $cont=new Alertas();
    $cont->alerta_anular_eliminar_transaccion($ver[1]);
}elseif($ver[0]=="alerta_transacciones_comercial"){
    $cont=new Alertas();
    $cont->alerta_transacciones_comercial($ver[1]);
}elseif($ver[0]=="eliminar_gestion_contable"){
    $cont=new Contabilidad();
    $cont->eliminar_gestion_contable($ver[1]);
}elseif($ver[0]=="listar_otras_cuentas_cobro_sin_transaccion"){
    $cont=new Documento_cobro();
    $cont->listar_otras_cuentas_cobro_sin_transaccion($ver[1]);
}elseif($ver[0]=="listar_otras_cuentas_pago_sin_transaccion"){
    $cont=new Documento_cobro();
    $cont->listar_otras_cuentas_pago_sin_transaccion($ver[1]);
}elseif($ver[0]=="codigo_correlativo_plandecuenta"){
    $cont=new Admin();
    $cont->codigo_correlativo_plandecuenta($ver[1],$ver[2]);

}elseif($ver[0]=="listar_detalle_trans_monto"){
    $cont=new Transacciones();
    $cont->listar_detalle_trans_monto($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="listadetalletransaccion_reemplazo"){
    $cont=new Transacciones();
    $cont->listadetalletransaccion_reemplazo($ver[1]);
}elseif($ver[0]=="lista_plan_cuenta_no_vinculada"){
    $cont=new Contabilidad();
    $cont->lista_plan_cuenta_no_vinculada($ver[1]);
}elseif($ver[0]=="listar_usuarios"){
    $cont=new Caja_bancos_recibos();
    $cont->listar_usuarios($ver[1]);
}elseif($ver[0]=="eliminar_caja_bancos_usuario"){
    $cont=new Caja_bancos_recibos();
    $cont->eliminar_caja_bancos_usuario($ver[1]);
}elseif($ver[0]=="listar_caja_bancos_usuarios"){
    $cont=new Caja_bancos_recibos();
    $cont->listar_caja_bancos_usuarios($ver[1]);
}elseif($ver[0]=="listar_caja_bancos_por_usuario"){
    $cont=new Plandecuentas();
    $cont->listar_caja_bancos_por_usuario($ver[1],$ver[2]);
}
elseif($ver[0]=="listar_facturas_cobros_sin_transaccion"){
    $cont=new Filtrado_facturas();
    $cont->listar_facturas_cobros_sin_transaccion($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="listar_facturas_pagos_sin_transaccion"){
    $cont=new Filtrado_facturas();
    $cont->listar_facturas_pagos_sin_transaccion($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="listar_documentos_cobros_sin_transaccion"){
    $cont=new Filtrado_facturas();
    $cont->listar_documentos_cobros_sin_transaccion($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="listar_documentos_pagos_sin_transaccion"){
    $cont=new Filtrado_facturas();
    $cont->listar_documentos_pagos_sin_transaccion($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="usuario_con_permiso_registrar_transaccion"){
    $cont=new Caja_bancos_recibos();
    $cont->usuario_con_permiso_registrar_transaccion($ver[1],$ver[2]);
}elseif($ver[0]=="existe_apertura_pre_cierre"){
    $cont=new Transacciones();
    $cont->existe_apertura_pre_cierre($ver[1],$ver[2]);
}elseif($ver[0]=="existe_cierre_de_gestion_anterior"){
    $cont=new Transacciones();
    $cont->existe_cierre_de_gestion_anterior($ver[1]);
}elseif($ver[0]=="listar_factura_comercial"){
    $cont=new Factura_comercial();
    $cont->listar_factura_comercial($ver[1]);
}elseif($ver[0]=="listar_factura_comercial_con_transaccion"){
    $cont=new Factura_comercial();
    $cont->listar_factura_comercial_con_transaccion($ver[1]);
}elseif($ver[0]=="listar_firmas_todos_reportes"){
    $cont=new Firma_reporte();
    $cont->listar_firmas_todos_reportes($ver[1],$ver[2]);
}elseif($ver[0]=="listar_firma_reporte"){
    $cont=new Firma_reporte();
    $cont->listar_firma_reporte($ver[1]);
}elseif($ver[0]=="eliminar_firma_reporte"){
    $cont=new Firma_reporte();
    $cont->eliminar_firma_reporte($ver[1]);
}elseif($ver[0]=="busqueda_facturas_contabilidad"){
    $cont=new Filtrado_facturas();
    $cont->busqueda_facturas_contabilidad($ver[1],$ver[2],$ver[3],$ver[4],$ver[5],$ver[6],$ver[7],$ver[8]);
}elseif($ver[0]=="busqueda_documentos_contabilidad"){
    $cont=new Filtrado_facturas();
    $cont->busqueda_documentos_contabilidad($ver[1],$ver[2],$ver[3],$ver[4],$ver[5],$ver[6],$ver[7],$ver[8]);
}elseif($ver[0]=="filtro_por_nivel"){
    $cont=new Reporte_confi();
    $cont->filtro_por_nivel($ver[1],$ver[2],$ver[3],$ver[4],$ver[5]);
}elseif($ver[0]=="listar_configuracion_reporte"){
    $cont=new Reporte_confi();
    $cont->listar_configuracion_reporte($ver[1],$ver[2]);
}elseif($ver[0]=="reporte_balance_general"){
    $cont=new Reporte_confi();
    $cont->reporte_balance_general($ver[1],$ver[2],$ver[3],$ver[4]);
}elseif($ver[0]=="eliminar_configuracion_reporte"){
    $cont=new Reporte_confi();
    $cont->eliminar_configuracion_reporte($ver[1]);
}elseif($ver[0]=="reporte_balance_general_hasta"){
    $cont=new Reporte_confi();
    $cont->reporte_balance_general_hasta($ver[1],$ver[2]);
}elseif($ver[0]=="listar_factura_comercial_comprobante"){
    $cont=new Factura_comercial();
    $cont->listar_factura_comercial_comprobante($ver[1]);
}elseif($ver[0]=="listar_factura_comercial_anuladas"){
    $cont=new Factura_comercial();
    $cont->listar_factura_comercial_anuladas($ver[1]);
}elseif($ver[0]=="listar_tipo_reportes"){
    $cont=new Reporte_confi();
    $cont->listar_tipo_reportes($ver[1]);
}elseif($ver[0]=="eliminar_tipo_reportes"){
    $cont=new Reporte_confi();
    $cont->eliminar_tipo_reportes($ver[1]);
}

elseif($ver[0]=="rp_listar_plantilla"){
    $cont=new PlantillaReporte();
    $cont->listar_plantilla($ver[1], $ver[2]);
}elseif($ver[0]=="rp_listar_plantilla_normal"){
    $cont=new PlantillaReporte();
    $cont->listar_plantilla_normal($ver[1], $ver[2]);
}elseif($ver[0]=="rp_filtro_plantilla_por_nivel"){
    $cont=new PlantillaReporte();
    $cont->filtro_plantilla_por_nivel($ver[1], $ver[2],  $ver[3]);
}elseif($ver[0]=="rp_eliminar_plantilla"){
    $cont=new PlantillaReporte();
    $cont->eliminar_plantilla($ver[1], $ver[2], $ver[3], $ver[4], $ver[5]);
}elseif($ver[0]=="rp_obtener_datos_reporte"){
    $cont=new PlantillaReporte();
    $cont->obtener_datos_reporte($ver[1], $ver[2], $ver[3], $ver[4]);
}elseif($ver[0]=="reporte_balance_general_prueba"){
    $cont=new Reporte_confi();
    $cont->reporte_balance_general_prueba($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="listar_agrupacion_plantilla"){
    $cont=new PlantillaReporte();
    $cont->listar_agrupacion_plantilla($ver[1]);
}elseif($ver[0]=="reporte_estado_resultados"){
    $cont=new PlantillaReporte();
    $cont->reporte_estado_resultados($ver[1],$ver[2],$ver[3]);
}elseif($ver[0]=="reporte_estado_resultados_actualizado"){
    $cont=new PlantillaReporte();
    $cont->reporte_estado_resultados_actualizado($ver[1],$ver[2],$ver[3],$ver[4]);
}elseif($ver[0]=="eliminar_otras_operaciones"){
    $cont=new PlantillaReporte();
    $cont->eliminar_otras_operaciones($ver[1]);
}

elseif($ver[0]=="listar_otras_cuentas_cobrar_select"){
    $cont=new Documento_cobro();
    $cont->listar_otras_cuentas_cobrar_select($ver[1]);
}elseif($ver[0]=="listar_otras_cuentas_pagar_select"){
    $cont=new Documento_cobro();
    $cont->listar_otras_cuentas_pagar_select($ver[1]);
}elseif($ver[0]=="lista_cobrar_cobrado_factura_select"){
    $cont=new Contabilidad();
    $cont->lista_cobrar_cobrado_factura_select($ver[1]);
}elseif($ver[0]=="lista_pagar_pagado_factura_select"){
    $cont=new Contabilidad();
    $cont->lista_pagar_pagado_factura_select($ver[1]);
}
// elseif($ver[0]=="listar_monto_factura_cajas"){
//     $cont=new Caja_bancos_recibos();
//     $cont->listar_monto_factura_cajas($ver[1],$ver[2]);
// }
elseif($ver[0]=="listar_datos_contrataciones_cajas"){
    $cont=new Caja_bancos_recibos();
    $cont->listar_datos_contrataciones_cajas($ver[1],$ver[2]);
}elseif($ver[0]=="listar_forma_pago"){
    $cont=new Forma_pago();
    $cont->listar_forma_pago($ver[1]);
}elseif($ver[0]=="eliminar_forma_pago"){
    $cont=new Forma_pago();
    $cont->eliminar_forma_pago($ver[1]);
}elseif($ver[0]=="listar_factura_otras_cuentas"){
    $cont=new Recibo_otras_cuentas();
    $cont->listar_factura_otras_cuentas($ver[1]);
}elseif($ver[0]=="listar_otras_cuentas_cobrar_vencidas"){
    $cont=new Documento_cobro();
    $cont->listar_otras_cuentas_cobrar_vencidas($ver[1]);
}elseif($ver[0]=="listar_otras_cuentas_pagar_vencidas"){
    $cont=new Documento_cobro();
    $cont->listar_otras_cuentas_pagar_vencidas($ver[1]);
}elseif($ver[0]=="listar_comprobantes_pagos"){
    $cont=new Recibo_otras_cuentas();
    $cont->listar_comprobantes_pagos($ver[1]);
}elseif($ver[0]=="listar_comprobantes_cobros"){
    $cont=new Recibo_otras_cuentas();
    $cont->listar_comprobantes_cobros($ver[1]);
}elseif($ver[0]=="listar_tipo_reportes_gestion"){
    $cont=new PlantillaReporte();
    $cont->listar_tipo_reportes_gestion($ver[1]);
}elseif($ver[0]=="select_plantilla_estado_resultados"){
    $cont=new PlantillaReporte();
    $cont->select_plantilla_estado_resultados($ver[1],$ver[2]);
}elseif($ver[0]=="select_plantilla_balance_general"){
    $cont=new Reporte_confi();
    $cont->select_plantilla_balance_general($ver[1],$ver[2]);
}elseif($ver[0]=="listar_nro_tributario_cliente"){
    $cont=new Documento_cobro();
    $cont->listar_nro_tributario_cliente($ver[1],$ver[2]);
}elseif($ver[0]=="listar_plantilla_por_registro"){
    $cont=new Reporte_confi();
    $cont->listar_plantilla_por_registro($ver[1]);
}elseif($ver[0]=="listar_recibo_facturas_otras_cuentas"){
    $cont=new Recibo_otras_cuentas();
    $cont->listar_recibo_facturas_otras_cuentas($ver[1]);
}elseif($ver[0]=="listar_tipo_plandecuenta"){
    $cont=new Plandecuentas();
    $cont->listar_tipo_plandecuenta($ver[1],$ver[2]);
}elseif($ver[0]=="listar_agrupacion_rubro_plandecuenta"){
    $cont=new Plandecuentas();
    $cont->listar_agrupacion_rubro_plandecuenta($ver[1]);
}elseif($ver[0]=="eliminar_agrupacion_rubro_plandecuenta"){
    $cont=new Plandecuentas();
    $cont->eliminar_agrupacion_rubro_plandecuenta($ver[1]);
}elseif($ver[0]=="es_cuenta_de_orden"){
    $cont=new PlantillaReporte();
    $cont->es_cuenta_de_orden($ver[1]);
}elseif($ver[0]=="lista_plande_subcuentas"){
    $cont=new Transacciones();
    $cont->lista_plande_subcuentas($ver[1]);
}elseif($ver[0]=="lista_padres_plandecuentas"){
    $cont=new Transacciones();
    $cont->lista_padres_plandecuentas($ver[1]);
}elseif($ver[0]=="reporte_balance_general_consolidado"){
    $cont=new Reporte_confi();
    $cont->reporte_balance_general_consolidado($ver[1],$ver[2],$ver[3],$ver[4]);
}elseif($ver[0]=="reporte_estado_resultados_actualizado_consolidado"){
    $cont=new PlantillaReporte();
    $cont->reporte_estado_resultados_actualizado_consolidado($ver[1],$ver[2],$ver[3],$ver[4]);
}
elseif($ver[0]=="reporte_balance_general_admin"){
    $cont=new Plantilla_admin();
    $cont->reporte_balance_general_admin($ver[1],$ver[2]);
}
elseif($ver[0]=="listar_tipo_reportes_activos"){
    $cont=new Reporte_confi();
    $cont->listar_tipo_reportes_activos($ver[1],$ver[2]);
}elseif($ver[0]=="listar_cuentas_NoVinculadas_subcuentas"){
    $cont=new Plandecuentas();
    $cont->listar_cuentas_NoVinculadas_subcuentas($ver[1],$ver[2]);
}
// elseif($ver[0]=="reporte_calculo_otro_reporte"){
//     $cont=new PlantillaReporte();
//     $cont->reporte_calculo_otro_reporte($ver[1],$ver[2],$ver[3],$ver[4]);
// }
elseif($ver[0]=="listar_reportes_referencia"){
    $cont=new PlantillaReporte();
    $cont->listar_reportes_referencia($ver[1]);
}elseif($ver[0]=="listar_reportes_referencia_select"){
    $cont=new PlantillaReporte();
    $cont->listar_reportes_referencia_select($ver[1]);
}elseif($ver[0]=="eliminar_reportes_referencia"){
    $cont=new PlantillaReporte();
    $cont->eliminar_reportes_referencia($ver[1]);
}elseif($ver[0]=="listar_datos_facturas_cajas"){
    $cont=new Caja_bancos_recibos();
    $cont->listar_datos_facturas_cajas($ver[1],$ver[2]);
}

// lista_cobrar_cobrado listar_datos listar_monto_factura_cajas listar_recibo_por_id listar_recibo_por_id_otras_cuentas   eliminarcobrados
//    listar_recibo_otras_cuentas  listar_recibo_otras_cuentas_pagar                  listar_recibo_pago_por_id                                             listar_recibo_por_id   --> caja bancos 
// select_plantilla_estado_resultados listar_plantilla                                listar_recibo_por_id_otras_cuentas      listar_recibo_por_id_otras_cuentas_pagar ---> esos dos son de recibos

?>