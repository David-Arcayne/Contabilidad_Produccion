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

$ver=explode("/",$_GET['ver']); //dividiendo los "/"  ver[0],ver[1],ver[x] listafacturaapi_cobrado
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
$rep->reportedetalletransaccion($ver[1],$ver[2],$ver[3],$ver[4]);
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
$cont->listadesconsolidar($ver[1]);
}elseif($ver[0]=="deleterelacionip"){
$cont=new Contabilidad();
$cont->deleterelacionip($ver[1]);
}elseif($ver[0]=="listarelacionip"){
$cont=new Contabilidad();
$cont->listarelacionip($ver[1]);
}elseif($ver[0]=="plancuentasout"){
$cont=new Contabilidad();
$cont->plancuentasout($ver[1]);
}elseif($ver[0]=="listafacturaapi_cobrado"){
$cont=new Contabilidad();
$cont->listafacturaapi_cobrado($ver[1]);
}elseif($ver[0]=="listaimpuestoentreplan"){
$cont=new Contabilidad();
$cont->listaimpuestoentreplan($ver[1]);
}
elseif($ver[0]=="lista_cobrar_cobrado_factura"){
$cont=new Contabilidad();
$cont->lista_cobrar_cobrado_factura($ver[1]);
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
}elseif($ver[0]=="listafactura_pagado_trans"){
    $cont=new Contabilidad();
    $cont->listafactura_pagado_trans($ver[1]);
}elseif($ver[0]=="listafactura_cobrado_trans"){
    $cont=new Contabilidad();
    $cont->listafactura_cobrado_trans($ver[1]);
}elseif($ver[0]=="lista_transaccionEn_espera"){
    $cont=new Insertar_transaccion();
    $cont->lista_transaccionEn_espera($ver[1]);
}elseif($ver[0]=="listar_anular_eliminar_transaccion"){
    $cont=new Anulacion_transaccion();
    $cont->listar_anular_eliminar_transaccion($ver[1]);
}elseif($ver[0]=="listar_caja_bancos"){
    $cont=new Plandecuentas();
    $cont->listar_caja_bancos($ver[1]);
}elseif($ver[0]=="eliminar_caja_bancos"){
    $cont=new Plandecuentas();
    $cont->eliminar_caja_bancos($ver[1]);
}elseif($ver[0]=="listar_recibo_por_id"){
    $cont=new Cuentaspof();
    $cont->listar_recibo_por_id($ver[1],$ver[2]);
}elseif($ver[0]=="listar_recibo_pago_por_id"){
    $cont=new Contabilidad();
    $cont->listar_recibo_pago_por_id($ver[1],$ver[2]);
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
    $cont->listar_recibo_por_id_otras_cuentas($ver[1],$ver[2]);
}
elseif($ver[0]=="listar_recibo_otras_cuentas_pagar"){
    $cont=new Recibo_otras_cuentas();
    $cont->listar_recibo_otras_cuentas_pagar($ver[1]);
}elseif($ver[0]=="listar_recibo_por_id_otras_cuentas_pagar"){
    $cont=new Documento_cobro();
    $cont->listar_recibo_por_id_otras_cuentas_pagar($ver[1],$ver[2]);
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
}elseif($ver[0]=="listar_asiento_por_modulo"){
    $cont=new Asiento();
    $cont->listar_asiento_por_modulo($ver[1],$ver[2]);
}
//reportecomprobantecontable listafactura_cobrado_trans

//listafactura eliminartransaccion listapagos_individuales listatransaciones factura lista_cobrar_cobrado
//reporteactivodisponible listar_cajas_bancos_pagar_por_recibo listar_recibo_por_id_otras_cuentas_pagar
?>