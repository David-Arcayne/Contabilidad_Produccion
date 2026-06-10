<?php
require_once "admin.php";
require_once "contabilidad.php";
require_once "./transacciones_facturas/transacciones_facturas.php";
require_once "./plan_cuentas/plandecuentas.php";
require_once "./transacciones_facturas/transFactura_pagar.php";
require_once "./solicitudes/insertar_transaccion.php";
require_once "./solicitudes/anulacion_transaccion.php";
require_once "./transacciones_facturas/transacciones.php";
require_once "./recibos/cuentaspof.php";
require_once "./otras_cuentas/documento_cobro.php";
require_once "./recibos/cuentaspor.php";
require_once "./otras_cuentas/recibo_otras_cuentas.php";
require_once "./configuracion/divisa.php";
require_once "./configuracion/asiento.php";
require_once "./recibos/caja_bancos_recibos.php";
require_once "./facturas/factura_cobros.php";
require_once "./facturas/factura_pagos.php";
require_once "./facturas/factura_comercial.php";
require_once "./configuracion/firma_reporte.php";
require_once "./configuracion/reporte_confi.php";
require_once "./configuracion/rp_plantilla_reporte.php";
require_once "./otras_cuentas/forma_pago.php";
require_once "./configuracion/plantilla_admin.php";
require_once "./configuracion/tipo_cliente_comercial.php";
require_once "./configuracion/reporte_flujo_efectivo.php";
require_once "./configuracion/usuario_gestion.php";
require_once "./configuracion/vinculacion_empresas.php";
// require_once "./recibos/caja_bancos_contrataciones.php";

$ver=$_POST['ver'];
$json = file_get_contents('php://input'); // Decodificar el JSON en un arreglo PHP   gestion
$data = json_decode($json, true);
if($ver=="registroplanes"){
$ad=new Admin();
$ad->registroplanes($_POST['numero'],$_POST['plan'],$_POST['descripcion'],$_POST['tipo'],$_POST['plandecuenta'],$_POST['idagrupacion_rubro_plandecuenta'],$_POST['empresa']);
}elseif($ver=="registroplanesf5"){
    $ad=new Admin();
    $ad->registroplanesf5($_POST['idplan'],$_POST['numero'],$_POST['plan'],$_POST['descripcion'],$_POST['tipo'],$_POST['plandecuenta'],$_POST['idagrupacion_rubro_plandecuenta'],$_POST['empresa_id']);
}elseif($ver=="registrotipodecambio"){
$adm=new Admin();
$adm->registrotipodecambio($_POST['dolar'],$_POST['ufv'],$_POST['fecha'],$_POST['empresa']);
}elseif($ver=="registrotipodecambiof5"){
$adm=new Admin();
$adm->registrotipodecambiof5($_POST['id'],$_POST['dolar'],$_POST['ufv'],$_POST['fecha']);
}elseif($ver=="registrotransaccion"){
$cont=new Transacciones();
$cont->registrotransaccion($_POST['fecha'],$_POST['tipodecambio'],$_POST['tipotransaccion'],$_POST['descripcion'],$_POST['empresa'],$_POST['sucursal'],$_POST['ufv'],$_POST['dolar'],$_POST['idgestion']);
}elseif($ver=="insertartransaccionen"){
    $cont=new Contabilidad();
    $cont->insertartransaccionen($_POST['codigo'],$_POST['fecha'],$_POST['tipodecambio'],$_POST['tipotransaccion'],$_POST['descripcion'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']);
}elseif($ver=="registrotransaccionf5"){
$cont=new Transacciones();
$cont->registrotransaccionf5($_POST['idt'],$_POST['fecha'],$_POST['tipodecambio'],$_POST['tipotransaccion'],$_POST['descripcion']);
}elseif($ver=="detalletransaccionnormal"){
$cont=new Transacciones();
$cont->detalletransaccionnormal($_POST['trans'],$_POST['plandecuenta'],$_POST['debe'],$_POST['haber'],$_POST['nota'],$_POST['empresa'],$_POST['sucursal'],$_POST['iddetalletransaccion']);
}elseif($ver=="detalletransaccionnormalf5"){
    $cont=new Transacciones();
    $cont->detalletransaccionnormalf5($_POST['iddetalle'],$_POST['trans'],$_POST['plandecuenta'],$_POST['debe'],$_POST['haber'],$_POST['nota']);
    }elseif($ver=="registrocliente"){
$cont=new Contabilidad();
$cont->registrocliente($_POST['nombre'],$_POST['nombrecomercial'],$_POST['tipo'],$_POST['tipodocumento'],$_POST['nit'],$_POST['email'],$_POST['direccion'],$_POST['telefono'],$_POST['mobil'],$_POST['pais'],$_POST['ciudad'],$_POST['zona'],$_POST['web'],$_POST['contacto'],$_POST['detalle'],$_POST['empresa']);
}elseif($ver=="registroclientef5"){
$cont=new Contabilidad();
$cont->registroclientef5($_POST['idc'],$_POST['nombre'],$_POST['nombrecomercial'],$_POST['tipo'],$_POST['tipodocumento'],$_POST['nit'],$_POST['email'],$_POST['direccion'],$_POST['telefono'],$_POST['mobil'],$_POST['pais'],$_POST['ciudad'],$_POST['zona'],$_POST['web'],$_POST['contacto'],$_POST['detalle'],$_POST['empresa']);
}elseif($ver=="registroproveedor"){
$cont=new Contabilidad();
$cont->registroproveedor($_POST['nombre'],$_POST['nit'],$_POST['pais'],$_POST['ciudad'],$_POST['zonabarrio'],$_POST['direccion'],$_POST['telefono'],$_POST['mobil'],$_POST['detalle'],$_POST['empresa']);
}elseif($ver=="registroproveedorf5"){
$cont=new Contabilidad();
$cont->registroproveedorf5($_POST['idc'],$_POST['nombre'],$_POST['nit'],$_POST['pais'],$_POST['ciudad'],$_POST['zonabarrio'],$_POST['direccion'],$_POST['telefono'],$_POST['mobil'],$_POST['detalle']);
}elseif($ver=="registrar_factura_cobros_transaccion"){
$cont=new Factura_cobros();
$cont->registrar_factura_cobros_transaccion($_POST['idcajas_bancos'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['tipo_factura'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta'],$_POST['empresa'],$_POST['sucursal'],$_POST['por_concepto_de'],$_POST['zona_horaria']);
//echo json_encode($_POST['fechatfactura']); registroplanesf5

}elseif($ver=="registrar_factura_pagos_transaccion"){
$cont=new Factura_pagos();
$cont->registrar_factura_pagos_transaccion($_POST['idcajas_bancos'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['tipo_factura'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta'],$_POST['empresa'],$_POST['sucursal'],$_POST['por_concepto_de'],$_POST['zona_horaria']);
//echo json_encode($_POST['fechatfactura']); registroplanesf5

}elseif($ver=="crearfacturasf5"){
    if(isset($_POST['idfactura'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['cliente'],$_POST['por_concepto_de'])){
    $cont=new Contabilidad();
    $cont->crearfacturasf5($_POST['idfactura'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['cliente'],$_POST['por_concepto_de']);
    }else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idfactura'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['cliente'],$_POST['por_concepto_de']));
    }
}elseif($ver=="crearfacturasapi"){
    $cont=new Contabilidad();
    $cont->crearfacturasapi($_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrar'],$_POST['pagar'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta'],$_POST['empresa'],$_POST['sucursal']);
    //echo json_encode($_POST['fechatfactura']);
    
}elseif($ver=="crearfacturasapif5"){
        $cont=new Contabilidad();
        $cont->crearfacturasapif5($_POST['idfactura'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrar'],$_POST['pagar'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta']);
    
}elseif($ver=="registrar_factura_cobros_tributario"){
    $cont=new Factura_cobros();
    $cont->registrar_factura_cobros_tributario($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['tipo_factura'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcajas_bancos'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
     
}elseif($ver=="registrar_factura_pagos_tributario"){
    $cont=new Factura_pagos();
    $cont->registrar_factura_pagos_tributario($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['tipo_factura'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcajas_bancos'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
 
}elseif($ver=="crearsolofacturasapif5"){
    $cont=new Contabilidad();
    $cont->crearsolofacturasapif5($_POST['idfactura'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta']);

}elseif($ver=="registroasiento"){
$cont=new Contabilidad();
$cont->registroasiento($_POST['nombre'],$_POST['tipo'],$_POST['tipo_modulo'],$_POST['empresa']);
}elseif($ver=="registroasientof5"){
    $cont=new Contabilidad();
    $cont->registroasientof5($_POST['id'],$_POST['nombre'],$_POST['tipo'],$_POST['empresa']);
}elseif($ver=="registrocrearasientos"){
$cont=new Contabilidad();
$cont->registrocrearasientos($_POST['cuenta'],$_POST['porciento'],$_POST['tipo'],$_POST['asiento'],$_POST['empresa']);
}elseif($ver=="registrocrearasientosf5"){
    $cont=new Contabilidad();
    $cont->registrocrearasientosf5($_POST['id'],$_POST['cuenta'],$_POST['porciento'],$_POST['tipo'],$_POST['asiento'],$_POST['empresa']);
    }elseif($ver=="detalletransaccion"){
$cont=new Contabilidad();
$cont->detalletransaccion($_POST['trans'],$_POST['tipoasiento'],$_POST['monto'],$_POST['empresa'],$_POST['sucursal']);
}elseif($ver=="registrocobrarfactura"){
if(isset($_POST['idfactura'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['idcuenta'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_POST['concepto'],$_FILES['archivo'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion'])){
    $cont=new Cuentaspof();
    $cont->registrocobrarfactura($_POST['idfactura'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['idcuenta'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_POST['concepto'],$_FILES['archivo'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
}
else{
    echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['idcuenta'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_POST['concepto'],$_FILES['archivo'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']));
}
//$res=array($_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente']);
//echo json_encode($res); 
}elseif($ver=="registrocobrarfacturaf5"){
    $cont=new Cuentaspof();
    $cont->registrocobrarfacturaf5($_POST['idcuentaspof'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['lugar'],$_POST['idtransaccion'],$_FILES['archivo']);
    //$res=array($_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente']);
    //echo json_encode($res);
}elseif($ver=="registropagarfactura"){
    $cont=new Cuentaspor();
    $cont->registropagarfactura($_POST['idfactura'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['idcuenta'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_POST['concepto'],$_FILES['archivo'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
}elseif($ver=="registropagarfacturaf5"){
    $cont=new Cuentaspor();
    $cont->registropagarfacturaf5($_POST['idrecibo'],$_POST['lugar'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['idtransaccion'],$_POST['archivo']);
}elseif($ver=="registrogestion"){
$cont=new Contabilidad();
$cont->registrogestion($_POST['nombre'],$_POST['fechaini'],$_POST['fechafin'],$_POST['formato_transaccion'],$_POST['empresa'],$_POST['usuario']);
}elseif($ver=="registrogestionf5"){
$cont=new Contabilidad();
$cont->registrogestionf5($_POST['nombre'],$_POST['idgestion'],$_POST['empresa'],$_POST['fechaini'],$_POST['fechafin'],$_POST['formato_transaccion']);
}elseif($ver=="creartransaccion"){
$cont=new Contabilidad();
$cont->creartransaccion($_POST['numero'],$_POST['gestion']);
}elseif($ver=="creargrupos"){
$cont=new Contabilidad();
$cont->creargrupos($_POST['nombre'],$_POST['funcion'],$_POST['empresa'],$_POST['idp']);
}elseif($ver=="registrolista"){
$cont=new Contabilidad();
$cont->registrolista($_POST['idg'],$_POST['orden'],$_POST['plandecuenta']);
}elseif($ver=="impotardato"){
$adm=new Admin();
$adm->importardato($_POST['empresa'],$_POST['template']);
}elseif($ver=="creartipoasiento"){
    $adm=new Admin();
    $adm->creartipoasiento($_POST['nombre'],$_POST['detalle'],$_POST['empresa']);
}elseif($ver=="creartipoasientof5"){
    $adm=new Admin();
    $adm->creartipoasientof5($_POST['id'],$_POST['nombre'],$_POST['detalle']);
}elseif($ver=="impuestocrear"){
$adm=new Admin();
$adm->impuestocrear($_POST['idempresa'],$_POST['codigo'],$_POST['nombre'],$_POST['tasa'],$_POST['descripcion'],$_POST['vencimiento'],$_POST['periodicidad']);
}elseif($ver=="impuestocrearf5"){
$adm=new Admin();
$adm->impuestocrearf5($_POST['idimpuesto'],$_POST['codigo'],$_POST['nombre'],$_POST['tasa'],$_POST['descripcion'],$_POST['vencimiento'],$_POST['periodicidad']);
}elseif($ver=="registrardesconsolidar"){
$cont=new Contabilidad();
$cont->registrardesconsolidar($_POST['idtransaccion'],$_POST['motivo'],$_POST['estado'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa']);
}elseif($ver=="registrorelacionip"){
$cont=new Contabilidad();
$cont->registrorelacionip($_POST['idimpuesto'],$_POST['idplandecuenta'],$_POST['idempresa']);
}elseif($ver=="registrorelacionipf5"){
    $cont=new Contabilidad();
    $cont->registrorelacionipf5($_POST['id'],$_POST['idimpuesto'],$_POST['idplandecuenta'],$_POST['idempresa']);
}elseif($ver=="rangosolicituddesconsolidar"){
$cont=new Contabilidad();
$cont->rangosolicituddesconsolidar($_POST['rangoa'],$_POST['rangob'],$_POST['motivo'],$_POST['estado'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion']);
}elseif($ver=="cambiarestadoconsolidado"){
$cont=new Contabilidad();
$cont->cambiarestadoconsolidado($_POST['grupo'],$_POST['estado'],$_POST['fecha'],$_POST['hora'],$_POST['idusuario']);
}elseif($ver=="registrar_vinculacion_cuentas_xcxp"){
    $cont=new Plandecuentas();
    $cont->registrar_vinculacion_cuentas_xcxp($_POST['plancuenta_id'],$_POST['tipocuenta_id'],$_POST['empresa_id']);
}elseif($ver=="editar_vinculacion_cuenta_xcxp"){
    $cont=new Plandecuentas();
    $cont->editar_vinculacion_cuenta_xcxp($_POST['idvinculacion_cuenta_xcxp'],$_POST['idplandecuenta']);
}elseif($ver=="registrar_transaccionEn_espera"){
    $cont=new Insertar_transaccion();
    //$idtransaccion,$estado,$hora,$fecha,$idusuario,$codigo,$tipocambio, $tipotransaccion, $glosa,$idempresa,$sucursal
    $cont->registrar_transaccionEn_espera($_POST['transacciones_idtransacciones'],$_POST['estado'],$_POST['hora'],$_POST['fecha'],$_POST['fecha_del_usuario'],$_POST['fecha_siguiente'],$_POST['idusuario'],$_POST['codigotransaccion'],$_POST['tipocambio'],$_POST['tipotransaccion'],$_POST['glosa'],$_POST['idempresa'],$_POST['sucursal'],$_POST['idgestion']);
}elseif($ver=="cambiarestadotransaccionEn_espera"){
    if (isset($_POST['idtransaccionEn_espera'],$_POST['estado'],$_POST['fecha'],$_POST['hora'],$_POST['idusuario'])) {
        $cont=new Insertar_transaccion();
        $cont->cambiarestadotransaccionEn_espera($_POST['idtransaccionEn_espera'],$_POST['estado'],$_POST['fecha'],$_POST['hora'],$_POST['idusuario']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtransaccionEn_espera'],$_POST['estado'],$_POST['fecha'],$_POST['hora'],$_POST['idusuario']));
    }
}

// ---------------------------------------------------------------------------- registropagarfactura registrogestion
else{
if($data['ver'] == "asignar_asiento_A_factura") {
    $cont=new Transacciones_facturas();
    $cont->asignar_asiento_A_factura($data);
}elseif($ver == "registrocobrarfacturaGrupal"){//cajaBancos
    if(isset($_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idtransaccion'],$_POST['cajasBancos'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'],$_POST['zona_horaria'],$_POST['glosa'],$_POST['idgestion'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Transacciones_facturas();
        $cont->registrocobrarfacturaGrupal($_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idtransaccion'],$_POST['cajasBancos'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'],$_POST['zona_horaria'],$_POST['glosa'],$_POST['idgestion']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idtransaccion'],$_POST['cajasBancos'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'],$_POST['zona_horaria'],$_POST['glosa'],$_POST['idgestion']));
    }
}elseif($ver == "registropagarfacturaGrupal"){
    if(isset($_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['idtransaccion'],$_POST['cajasBancos'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'],$_POST['zona_horaria'],$_POST['glosa'],$_POST['idgestion'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new TransFactura_pagar();
        $cont->registropagarfacturaGrupal($_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['idtransaccion'],$_POST['cajasBancos'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'],$_POST['zona_horaria'],$_POST['glosa'],$_POST['idgestion']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['idtransaccion'],$_POST['cajasBancos'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'],$_POST['zona_horaria'],$_POST['glosa'],$_POST['idgestion']));
    }
}elseif($ver == "registrar_anular_eliminar_activar_transaccion"){
    if(isset($_POST['transacciones_idtransacciones'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Anulacion_transaccion();
        $cont->registrar_anular_eliminar_activar_transaccion($_POST['transacciones_idtransacciones'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['transacciones_idtransacciones'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion']));
    }
}elseif($ver == "cambiarEstado_anular_eliminar_activar_transaccion"){

    if(isset($_POST['idsolicitud_anular_eliminar'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Anulacion_transaccion();
        $cont->cambiarEstado_anular_eliminar_activar_transaccion($_POST['idsolicitud_anular_eliminar'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idsolicitud_anular_eliminar'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin']));
    }
}elseif($ver == "registrar_transaccion_recibo"){

    if(isset($_POST['idcuentaspof'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['idtransaccion'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Transacciones_facturas();
        $cont->registrar_transaccion_recibo($_POST['idcuentaspof'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['idtransaccion'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcuentaspof'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['idtransaccion'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']));
    }
}elseif($ver == "registrar_transaccion_recibo_pago"){

    if(isset($_POST['idcuentaspor'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['idtransaccion'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new TransFactura_pagar();
        $cont->registrar_transaccion_recibo_pago($_POST['idcuentaspor'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['idtransaccion'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcuentaspor'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['idtransaccion'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']));
    }
}elseif($ver == "registrar_caja_bancos"){
    if(isset($_POST['codigo'],$_POST['tipo_cuenta'],$_POST['glosa'],$_POST['idplandecuenta'],$_POST['idempresa'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Plandecuentas();
        $cont->registrar_caja_bancos($_POST['codigo'],$_POST['tipo_cuenta'],$_POST['glosa'],$_POST['idplandecuenta'],$_POST['idempresa']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['codigo'],$_POST['tipo_cuenta'],$_POST['glosa'],$_POST['idplandecuenta'],$_POST['idempresa']));
    }
}elseif($ver == "editar_caja_bancos"){
    if(isset($_POST['idcaja_bancos'],$_POST['codigo'],$_POST['tipo_cuenta'],$_POST['glosa'],$_POST['idplandecuenta'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Plandecuentas();
        $cont->editar_caja_bancos($_POST['idcaja_bancos'],$_POST['codigo'],$_POST['tipo_cuenta'],$_POST['glosa'],$_POST['idplandecuenta']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcaja_bancos'],$_POST['codigo'],$_POST['tipo_cuenta'],$_POST['glosa'],$_POST['idplandecuenta']));
    }
}elseif($ver == "editar_caja_bancos_recibo"){
    if(isset($_POST['idrecibo'],$_POST['cajasBancos'],$_POST['idfactura'],$_POST['idotras_cuentas'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Cuentaspof();
        $cont->editar_caja_bancos_recibo($_POST['idrecibo'],$_POST['cajasBancos'],$_POST['idfactura'],$_POST['idotras_cuentas']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idrecibo'],$_POST['cajasBancos'],$_POST['idfactura'],$_POST['idotras_cuentas']));
    }
}elseif($ver == "registrar_tipo"){
    if(isset($_POST['nombre'],$_POST['descripcion'],$_POST['empresa'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Contabilidad();
        $cont->registrar_tipo($_POST['nombre'],$_POST['descripcion'],$_POST['empresa']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['descripcion'],$_POST['empresa']));
    }
}elseif($ver == "editar_tipo"){
    if(isset($_POST['idtipo'],$_POST['nombre'],$_POST['descripcion'],$_POST['empresa'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Contabilidad();
        $cont->editar_tipo($_POST['idtipo'],$_POST['nombre'],$_POST['descripcion'],$_POST['empresa']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtipo'],$_POST['nombre'],$_POST['descripcion'],$_POST['empresa']));
    }
}elseif($ver == "registrar_otras_cuentas"){

    if(isset($_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['clase_otras_cuentas'],$_POST['pagado'],$_POST['cobrado'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['fecha_vencimiento'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Documento_cobro();
        $cont->registrar_otras_cuentas($_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['clase_otras_cuentas'],$_POST['pagado'],$_POST['cobrado'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['fecha_vencimiento'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['clase_otras_cuentas'],$_POST['pagado'],$_POST['cobrado'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['fecha_vencimiento'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo']));
    }
}elseif($ver == "editar_otras_cuentas"){

    if(isset($_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['fecha_vencimiento'],$_FILES['archivo'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Documento_cobro();
        $cont->editar_otras_cuentas($_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['fecha_vencimiento'],$_FILES['archivo']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['fecha_vencimiento'],$_FILES['archivo']));
    }
}elseif($ver == "editar_caja_bancos_pagar_recibo"){
    if(isset($_POST['idrecibo'],$_POST['cajasBancos'],$_POST['idfactura'],$_POST['idotras_cuentas'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Cuentaspor();
        $cont->editar_caja_bancos_pagar_recibo($_POST['idrecibo'],$_POST['cajasBancos'],$_POST['idfactura'],$_POST['idotras_cuentas']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idrecibo'],$_POST['cajasBancos'],$_POST['idfactura'],$_POST['idotras_cuentas']));
    }
}elseif($ver=="registrar_recibo_otras_cuentas"){
    if(isset($_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'],$_POST['nro_recibo'],$_POST['concepto'],$_POST['cliente_proveedor'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion'])){
        $cont=new Recibo_otras_cuentas();
        $cont->registrar_recibo_otras_cuentas($_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'],$_POST['nro_recibo'],$_POST['concepto'],$_POST['cliente_proveedor'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'],$_POST['nro_recibo'],$_POST['concepto'],$_POST['cliente_proveedor'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']));
    }
    //$res=array($_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente']);
    //echo json_encode($res); 
    }
    elseif($ver == "editar_cuentas_pagar"){

        if(isset($_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Recibo_otras_cuentas();
            $cont->editar_cuentas_pagar($_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta']));
        }
    }elseif($ver=="registrar_recibo_otras_cuentas_pagar"){
        if(isset($_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'],$_POST['nro_recibo'],$_POST['concepto'],$_POST['cliente_proveedor'],$_POST['zona_horaria'],$_POST['idgestion'])){
            $cont=new Recibo_otras_cuentas();
            $cont->registrar_recibo_otras_cuentas_pagar($_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'],$_POST['nro_recibo'],$_POST['concepto'],$_POST['cliente_proveedor'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'],$_POST['nro_recibo'],$_POST['concepto'],$_POST['cliente_proveedor'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']));
        }
    }elseif($ver=="registrar_divisa"){
        if(isset($_POST['simbolo'],$_POST['nombre'],$_POST['estado'],$_POST['idempresa'])){
            $cont=new Divisa();
            $cont->registrar_divisa($_POST['simbolo'],$_POST['nombre'],$_POST['estado'],$_POST['idempresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['simbolo'],$_POST['nombre'],$_POST['estado'],$_POST['idempresa']));
        }
    }elseif($ver=="editar_divisa"){
        if(isset($_POST['iddivisa'],$_POST['simbolo'],$_POST['nombre'],$_POST['idempresa'])){
            $cont=new Divisa();
            $cont->editar_divisa($_POST['iddivisa'],$_POST['simbolo'],$_POST['nombre'],$_POST['idempresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['iddivisa'],$_POST['simbolo'],$_POST['nombre'],$_POST['idempresa']));
        }
    }elseif($ver=="activar_divisa"){
        if(isset($_POST['iddivisa'])){
            $cont=new Divisa();
            $cont->activar_divisa($_POST['iddivisa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['iddivisa']));
        }
    }elseif($ver=="registrar_asignacion_asiento_operacion"){
        if(isset($_POST['idoperacion_modulos'],$_POST['idasientotipo'],$_POST['bandera'],$_POST['idempresa'])){
            $cont=new Asiento();
            $cont->registrar_asignacion_asiento_operacion($_POST['idoperacion_modulos'],$_POST['idasientotipo'],$_POST['bandera'],$_POST['idempresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idoperacion_modulos'],$_POST['idasientotipo'],$_POST['bandera'],$_POST['idempresa']));
        }
    }elseif($ver=="registro_transaccion_comercial"){
        if(isset($_POST['fecha'],$_POST['idasignacion_asiento'],$_POST['monto'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion'])){
            $cont=new Transacciones();
            $cont->registro_transaccion_comercial($_POST['fecha'],$_POST['idasignacion_asiento'],$_POST['monto'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['idasignacion_asiento'],$_POST['monto'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']));
        }
    }elseif($ver=="editar_asignacion_asiento_operacion"){
        if(isset($_POST['idasignacion_asiento_operacion_modulos'],$_POST['idoperacion_modulos'],$_POST['idasientotipo'],$_POST['bandera'])){
            $cont=new Asiento();
            $cont->editar_asignacion_asiento_operacion($_POST['idasignacion_asiento_operacion_modulos'],$_POST['idoperacion_modulos'],$_POST['idasientotipo'],$_POST['bandera']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idasignacion_asiento_operacion_modulos'],$_POST['idoperacion_modulos'],$_POST['idasientotipo'],$_POST['bandera']));
        }
    }elseif($ver=="registrar_factura_recibo_cobro_cajaBancos"){
        if(isset($_POST['idotras_cuentas'],$_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_factura_recibo_cobro_cajaBancos($_POST['idotras_cuentas'],$_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idotras_cuentas'],$_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']));
        }
    }elseif($ver=="registrar_factura_recibo_pago_cajaBancos"){
        if(isset($_POST['idotras_cuentas'],$_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_factura_recibo_pago_cajaBancos($_POST['idotras_cuentas'],$_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idotras_cuentas'],$_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']));
        }
    }elseif($data['ver'] == "asignar_asiento_A_recibos") {
        $cont=new Documento_cobro();
        $cont->asignar_asiento_A_recibos($data);
    }elseif($ver=="registrar_caja_bancos_usuarios"){
        if(isset($_POST['idcaja_bancos'],$_POST['idtrabajador'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_caja_bancos_usuarios($_POST['idcaja_bancos'],$_POST['idtrabajador'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcaja_bancos'],$_POST['idtrabajador'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa']));
        }
    }elseif($ver=="registrar_detalle_transaccion_json"){
        if(isset($_POST['idtransaccion'],$_POST['datos_json'],$_POST['empresa'],$_POST['sucursal'])){
            $cont=new Transacciones();
            $cont->registrar_detalle_transaccion_json($_POST['idtransaccion'],$_POST['datos_json'],$_POST['empresa'],$_POST['sucursal']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtransaccion'],$_POST['datos_json'],$_POST['empresa'],$_POST['sucursal']));
        }
    }elseif($ver=="editar_caja_bancos_facturas"){
        if(isset($_POST['idcomprobante'],$_POST['nfactura'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['monto'],$_POST ['por_concepto_de'],$_POST['cliente_prov'],$_FILES['archivo'],$_POST ['lugar'],$_POST ['persona'],$_POST ['ci'],$_POST ['idotras_cuentas'])){
            $cont=new caja_bancos_recibos(); 
            $cont->editar_caja_bancos_facturas($_POST['idcomprobante'],$_POST['nfactura'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['monto'],$_POST ['por_concepto_de'],$_POST['cliente_prov'],$_FILES['archivo'],$_POST ['lugar'],$_POST ['persona'],$_POST ['ci'],$_POST ['idotras_cuentas']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcomprobante'],$_POST['nfactura'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['monto'],$_POST ['por_concepto_de'],$_POST['cliente_prov'],$_FILES['archivo'],$_POST ['lugar'],$_POST ['persona'],$_POST ['ci'],$_POST ['idotras_cuentas']));
        }
    }
    elseif($ver=="editar_caja_bancos_facturas_existentes"){
        if(isset($_POST['idcomprobante'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['monto'],$_FILES['archivo'],$_POST ['lugar'],$_POST ['persona'],$_POST ['ci'],$_POST ['concepto'])){
            $cont=new caja_bancos_recibos(); 
            $cont->editar_caja_bancos_facturas_existentes($_POST['idcomprobante'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['monto'],$_FILES['archivo'],$_POST ['lugar'],$_POST ['persona'],$_POST ['ci'],$_POST ['concepto']);
        }                        
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcomprobante'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['monto'],$_FILES['archivo'],$_POST ['lugar'],$_POST ['persona'],$_POST ['ci'],$_POST ['concepto']));
        }
    }
    elseif($ver=="registrar_cuenta_pre_cierre"){
        if(isset($_POST['fecha'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion'])){
            $cont=new Transacciones();
            $cont->registrar_cuenta_pre_cierre($_POST['fecha'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']));
        }
    }elseif($ver=="registrar_cuenta_cierre"){
        if(isset($_POST['fecha'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion'])){
            $cont=new Transacciones();
            $cont->registrar_cuenta_cierre($_POST['fecha'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']));
        }
    }elseif($ver=="registrar_cuenta_apertura"){
        if(isset($_POST['fecha'],$_POST['idgestion_anterior'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion'])){
            $cont=new Transacciones();
            $cont->registrar_cuenta_apertura($_POST['fecha'],$_POST['idgestion_anterior'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['idgestion_anterior'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']));
        }
    }elseif($ver=="editar_caja_bancos_usuarios"){
        if(isset($_POST['idcaja_banco_usuario'],$_POST['idcaja_bancos'],$_POST['idtrabajador'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa'])){
            $cont=new Caja_bancos_recibos();
            $cont->editar_caja_bancos_usuarios($_POST['idcaja_banco_usuario'],$_POST['idcaja_bancos'],$_POST['idtrabajador'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcaja_banco_usuario'],$_POST['idcaja_bancos'],$_POST['idtrabajador'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa']));
        }
    }elseif($ver=="consolidacion_multiple"){
        if(isset($_POST['transacciones'])){
            $cont=new Transacciones();
            $cont->consolidacion_multiple($_POST['transacciones']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['transacciones']));
        }
    }elseif($ver=="cobro_asignacion_factura_comercial"){
        if(isset($_POST['registro_desde'],$_POST['fecha'],$_POST['monto_total'],$_POST['transaccion'],$_POST['idcaja_bancos'],$_POST['asiento_modelo'],$_POST['empresa'],$_POST['sucursal'],$_POST['facturas_comercial'],$_POST['zona_horaria'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion'])){
            $cont=new Factura_comercial();
            $cont->cobro_asignacion_factura_comercial($_POST['registro_desde'],$_POST['fecha'],$_POST['monto_total'],$_POST['transaccion'],$_POST['idcaja_bancos'],$_POST['asiento_modelo'],$_POST['empresa'],$_POST['sucursal'],$_POST['facturas_comercial'],$_POST['zona_horaria'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['registro_desde'],$_POST['fecha'],$_POST['monto_total'],$_POST['transaccion'],$_POST['idcaja_bancos'],$_POST['asiento_modelo'],$_POST['empresa'],$_POST['sucursal'],$_POST['facturas_comercial'],$_POST['zona_horaria'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']));
        }
    }elseif($ver=="registrar_firma_reporte"){
        if(isset($_POST['idtrabajador'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula'],$_POST['empresa'])){
            $cont=new Firma_reporte();
            $cont->registrar_firma_reporte($_POST['idtrabajador'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtrabajador'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula'],$_POST['empresa']));
        }
    }elseif($ver=="editar_firma_reporte"){
        if(isset($_POST['idfirma_reporte'],$_POST['idtrabajador'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula'])){
            $cont=new Firma_reporte();
            $cont->editar_firma_reporte($_POST['idfirma_reporte'],$_POST['idtrabajador'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idfirma_reporte'],$_POST['idtrabajador'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula']));
        }
    }
    elseif($ver=="registrar_configuracion_reporte"){
        if(isset($_POST['idplandecuenta'],$_POST['idplantilla_reporte'],$_POST['reporte'],$_POST['nombre_cuenta_superior'],$_POST['nivel_registrado'],$_POST['grupo'],$_POST['es_calculable'],$_POST['es_activo_fijo'],$_POST['negrilla_cursiva'],$_POST['tipo_operacion'],$_POST['empresa'])){
            $cont=new Reporte_confi();
            $cont->registrar_configuracion_reporte($_POST['idplandecuenta'],$_POST['idplantilla_reporte'],$_POST['reporte'],$_POST['nombre_cuenta_superior'],$_POST['nivel_registrado'],$_POST['grupo'],$_POST['es_calculable'],$_POST['es_activo_fijo'],$_POST['negrilla_cursiva'],$_POST['tipo_operacion'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idplandecuenta'],$_POST['idplantilla_reporte'],$_POST['reporte'],$_POST['nombre_cuenta_superior'],$_POST['nivel_registrado'],$_POST['grupo'],$_POST['es_calculable'],$_POST['es_activo_fijo'],$_POST['negrilla_cursiva'],$_POST['tipo_operacion'],$_POST['empresa']));
        }
    }
    elseif($ver=="registrar_vinculacion_depreciacion"){
        if(isset($_POST['idcuenta'],$_POST['idcuenta_depreciacion'],$_POST['idtipo_reportes'],$_POST['empresa'],$_POST['idgestion'])){
            $cont=new Reporte_confi();
            $cont->registrar_vinculacion_depreciacion($_POST['idcuenta'],$_POST['idcuenta_depreciacion'],$_POST['idtipo_reportes'],$_POST['empresa'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcuenta'],$_POST['idcuenta_depreciacion'],$_POST['idtipo_reportes'],$_POST['empresa'],$_POST['idgestion']));
        }
    }elseif($ver=="editar_configuracion_reporte"){
        if(isset($_POST['idconfiguracion_reporte'],$_POST['idplandecuenta'],$_POST['es_activo_fijo'],$_POST['es_calculable'],$_POST['orden'],$_POST['negrilla_cursiva'],$_POST['empresa'])){
            $cont=new Reporte_confi();
            $cont->editar_configuracion_reporte($_POST['idconfiguracion_reporte'],$_POST['idplandecuenta'],$_POST['es_activo_fijo'],$_POST['es_calculable'],$_POST['orden'],$_POST['negrilla_cursiva'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idconfiguracion_reporte'],$_POST['idplandecuenta'],$_POST['es_activo_fijo'],$_POST['es_calculable'],$_POST['orden'],$_POST['negrilla_cursiva'],$_POST['empresa']));
        }
    }elseif($ver=="registrar_tipo_reportes"){
        if(isset($_POST['nombre'],$_POST['descripcion'],$_POST['tipo_reporte'],$_POST['id_plantilla_reporte'],$_POST['empresa'])){
            $cont=new Reporte_confi();
            $cont->registrar_tipo_reportes($_POST['nombre'],$_POST['descripcion'],$_POST['tipo_reporte'],$_POST['id_plantilla_reporte'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_reporte'],$_POST['id_plantilla_reporte'],$_POST['empresa']));
        }
    }elseif($ver=="editar_tipo_reportes"){
        if(isset($_POST['idtipo_reportes'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_reporte'])){
            $cont=new Reporte_confi();
            $cont->editar_tipo_reportes($_POST['idtipo_reportes'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_reporte']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtipo_reportes'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_reporte']));
        }  
    }

    elseif($ver=="rp_registrar_plantilla"){
        if((isset($_POST['idplandecuenta']) || isset($_POST['nombre_personalizado'])) && isset($_POST['idplantilla_reporte'],$_POST['idplantilla_padre'],$_POST['tipo_operacion'],$_POST['nivel'],$_POST['orden'],$_POST['ingreso_egreso'],$_POST['negrilla_cursiva'],$_POST['idempresa'])){
            $cont=new PlantillaReporte();
            $cont->registrar_plantilla($_POST['idplantilla_reporte'],$_POST['idplantilla_padre'],$_POST['idplandecuenta']??NULL,$_POST['nombre_personalizado']??NULL,$_POST['tipo_operacion'],$_POST['nivel'],$_POST['orden'],$_POST['disponible_para_otro_reporte']??NULL,$_POST['ingreso_egreso'],$_POST['negrilla_cursiva'],$_POST['idempresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",($_POST['idplandecuenta'] ?? $_POST['nombre_personalizado']),$_POST['idplantilla_reporte'],$_POST['idplantilla_padre'],$_POST['tipo_operacion'],$_POST['nivel'],$_POST['orden'],$_POST['ingreso_egreso'],$_POST['negrilla_cursiva'],$_POST['idempresa']));
        }
    }elseif($ver=="rp_editar_plantilla"){//$idplantilla, $idplandecuenta, $nombre_personalizado, $tipo_operacion, $orden, $idplantilla_padre, $empresa
        if(isset($_POST['idplantilla'],$_POST['idplandecuenta'],$_POST['nombre_personalizado'],$_POST['tipo_operacion'],$_POST['orden'],$_POST['idplantilla_padre'],$_POST['negrilla_cursiva'],$_POST['empresa'])){
            $cont=new PlantillaReporte();
            $cont->rp_editar_plantilla($_POST['idplantilla'],$_POST['idplandecuenta'],$_POST['nombre_personalizado'],$_POST['tipo_operacion'],$_POST['orden'],$_POST['idplantilla_padre'],$_POST['negrilla_cursiva'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idplantilla'],$_POST['idplandecuenta'],$_POST['nombre_personalizado'],$_POST['tipo_operacion'],$_POST['orden'],$_POST['idplantilla_padre'],$_POST['negrilla_cursiva'],$_POST['empresa']));
        }
    }elseif($ver=="registrar_agrupacion_plantilla"){
        if(isset($_POST['idplantilla_padre'],$_POST['idplantilla_hijo'],$_POST['tipo_operacion'],$_POST['monto'],$_POST['idtipo_reportes'],$_POST['idempresa'],$_POST['obtiene_desde'])){
            $cont=new PlantillaReporte();
            $cont->registrar_agrupacion_plantilla($_POST['idplantilla_padre'],$_POST['idplantilla_hijo'],$_POST['tipo_operacion'],$_POST['monto'],$_POST['idtipo_reportes'],$_POST['idempresa'],$_POST['obtiene_desde']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idplantilla_padre'],$_POST['idplantilla_hijo'],$_POST['tipo_operacion'],$_POST['monto'],$_POST['idtipo_reportes'],$_POST['idempresa'],$_POST['obtiene_desde']));
        }  
    }
    elseif($ver=="registrar_recibo_cobro_cajaBancos_en_facturas"){
        if(isset($_POST['idfactura'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_POST['concepto'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_recibo_cobro_cajaBancos_en_facturas($_POST['idfactura'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_POST['concepto'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
        }
        // $idfact,$fecha,$lugar,$persona, $ci,$monto, $asiento,$trans,$idcaja_bancos,$archivo,$registro_desde,$empresa
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idfactura'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_POST['concepto'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']));
        }  
    }elseif($ver=="registrar_recibo_pago_cajaBancos_en_facturas"){
        if(isset($_POST['idfactura'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_POST['concepto'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_recibo_pago_cajaBancos_en_facturas($_POST['idfactura'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_POST['concepto'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
        }
        // $idfact,$fecha,$lugar,$persona, $ci,$monto, $asiento,$trans,$idcaja_bancos,$archivo,$registro_desde,$empresa
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idfactura'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_POST['concepto'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']));
        }  
    }elseif($ver=="registrar_recibo_cobro_cajaBancos_en_otras_cuentas"){
        if(isset($_POST['nro_recibo'],$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['cliente_proveedor'],$_POST['concepto'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_recibo_cobro_cajaBancos_en_otras_cuentas($_POST['nro_recibo'],$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['cliente_proveedor'],$_POST['concepto'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']);
        }
        // $idfact,$fecha,$lugar,$persona, $ci,$monto, $asiento,$trans,$idcaja_bancos,$archivo,$registro_desde,$empresa
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['nro_recibo'],$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['cliente_proveedor'],$_POST['concepto'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']));
        }  
    }elseif($ver=="registrar_recibo_pago_cajaBancos_en_otras_cuentas"){
        if(isset($_POST['nro_recibo'],$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['cliente_proveedor'],$_POST['concepto'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_recibo_pago_cajaBancos_en_otras_cuentas($_POST['nro_recibo'],$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['cliente_proveedor'],$_POST['concepto'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']);
        }
        // $idfact,$fecha,$lugar,$persona, $ci,$monto, $asiento,$trans,$idcaja_bancos,$archivo,$registro_desde,$empresa
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['nro_recibo'],$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['trans'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'],$_POST['cliente_proveedor'],$_POST['concepto'],$_POST['sucursal'],$_POST['empresa'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['tipo'],$_POST['cuenta'],$_POST['idgestion']));
        }  
    }elseif($ver=="editar_recibo_caja_bancos"){
        if(isset($_POST['idcomprobante'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['fecha'],$_POST['nro_recibo'],$_POST['por_concepto_de'],$_POST['cliente_proveedor'],$_POST['monto'],$_POST['tipo_documento'],$_FILES['archivo'],$_POST['idotras_cuentas'])){
            $cont=new Caja_bancos_recibos();
            $cont->editar_recibo_caja_bancos($_POST['idcomprobante'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['fecha'],$_POST['nro_recibo'],$_POST['por_concepto_de'],$_POST['cliente_proveedor'],$_POST['monto'],$_POST['tipo_documento'],$_FILES['archivo'],$_POST['idotras_cuentas']);
        }
        // $idfact,$fecha,$lugar,$persona, $ci,$monto, $asiento,$trans,$idcaja_bancos,$archivo,$registro_desde,$empresa   $concepto,$cliente_prov,$monto,$tipo_documento,$nro_recibo
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcomprobante'],$_POST['lugar'],$_POST['persona'],$_POST['ci'],$_POST['fecha'],$_POST['nro_recibo'],$_POST['por_concepto_de'],$_POST['cliente_proveedor'],$_POST['monto'],$_POST['tipo_documento'],$_FILES['archivo'],$_POST['idotras_cuentas']));
        }  
    }elseif($ver=="registrar_forma_pago"){
        if(isset($_POST['nombre'],$_POST['descripcion'],$_POST['empresa'])){
            $cont=new Forma_pago();
            $cont->registrar_forma_pago($_POST['nombre'],$_POST['descripcion'],$_POST['empresa']);
        }
        // $idfact,$fecha,$lugar,$persona, $ci,$monto, $asiento,$trans,$idcaja_bancos,$archivo,$registro_desde,$empresa
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['descripcion'],$_POST['empresa']));
        }  
    }elseif($ver=="editar_forma_pago"){
        if(isset($_POST['idforma_pago'],$_POST['nombre'],$_POST['descripcion'],$_POST['empresa'])){
            $cont=new Forma_pago();
            $cont->editar_forma_pago($_POST['idforma_pago'],$_POST['nombre'],$_POST['descripcion'],$_POST['empresa']);
        }
        // $idfact,$fecha,$lugar,$persona, $ci,$monto, $asiento,$trans,$idcaja_bancos,$archivo,$registro_desde,$empresa
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idforma_pago'],$_POST['nombre'],$_POST['descripcion'],$_POST['empresa']));
        }  
    }elseif($ver=="registrar_factura_cobro_otras_cuentas"){
    $cont=new Recibo_otras_cuentas();
    $cont->registrar_factura_cobro_otras_cuentas($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['idotras_cuentas'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_FILES['archivo'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcajas_bancos'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
    }elseif($ver=="registrar_factura_pago_otras_cuentas"){
    $cont=new Recibo_otras_cuentas();
    $cont->registrar_factura_pago_otras_cuentas($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['idotras_cuentas'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_FILES['archivo'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcajas_bancos'],$_POST['zona_horaria'],$_POST['fecha_transaccion'],$_POST['cuenta'],$_POST['tipo'],$_POST['idgestion']);
    }elseif($ver=="registrar_recibo_comprobantes_clonacion"){
    $cont=new Recibo_otras_cuentas();
    $cont->registrar_recibo_comprobantes_clonacion($_POST['nro_recibo'],$_POST['fecha'],$_POST['lugar'],$_POST['cliente_proveedor'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['cobrado'],$_POST['pagado'],$_POST['idotras_cuentas'],$_POST['transaccion'],$_POST['concepto'],$_POST['registro_desde'],$_POST['idempresa']);
    }elseif($ver=="insertar_debajo_de"){
        if(isset($_POST['idplandecuenta'],$_POST['idplantilla_reporte'],$_POST['reporte'],$_POST['nombre_cuenta_superior'],$_POST['nivel_registrado'],$_POST['orden'],$_POST['grupo'],$_POST['es_calculable'],$_POST['es_activo_fijo'],$_POST['negrilla_cursiva'],$_POST['empresa'])){
            $cont=new Reporte_confi();
            $cont->insertar_debajo_de($_POST['idplandecuenta'],$_POST['idplantilla_reporte'],$_POST['reporte'],$_POST['nombre_cuenta_superior'],$_POST['nivel_registrado'],$_POST['orden'],$_POST['grupo'],$_POST['es_calculable'],$_POST['es_activo_fijo'],$_POST['negrilla_cursiva'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idplandecuenta'],$_POST['idplantilla_reporte'],$_POST['reporte'],$_POST['nombre_cuenta_superior'],$_POST['nivel_registrado'],$_POST['orden'],$_POST['grupo'],$_POST['es_calculable'],$_POST['es_activo_fijo'],$_POST['negrilla_cursiva'],$_POST['empresa']));
        }
    }elseif($ver=="registrar_agrupacion_rubro_plandecuenta"){
        if(isset($_POST['tipo_plandecuenta'],$_POST['numero'],$_POST['empresa'])){
            $cont=new Plandecuentas();
            $cont->registrar_agrupacion_rubro_plandecuenta($_POST['tipo_plandecuenta'],$_POST['numero'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['tipo_plandecuenta'],$_POST['numero'],$_POST['empresa']));
        }
    }elseif($ver=="editar_agrupacion_rubro_plandecuenta"){
    $cont=new Plandecuentas();
    $cont->editar_agrupacion_rubro_plandecuenta($_POST['idagrupacion_rubro_plandecuenta'],$_POST['tipo_plandecuenta'],$_POST['numero'],$_POST['empresa']);
    }
    elseif($ver=="registrar_balance_general_admin"){
        if(isset($_POST['idplantilla_reporte'],$_POST['idtn'],$_POST['empresa'],$_POST['idgestion'])){
            $cont=new Plantilla_admin();
            $cont->registrar_balance_general_admin($_POST['idplantilla_reporte'],$_POST['idtn'],$_POST['empresa'],$_POST['idgestion']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idplantilla_reporte'],$_POST['idtn'],$_POST['empresa'],$_POST['idgestion']));
        }
    }
    elseif($ver=="activar_desactivar_tipo_reportes"){
        if(isset($_POST['idtipo_reportes'],$_POST['estado'],$_POST['tipo_reporte'],$_POST['idempresa'])){
            $cont=new Reporte_confi();
            $cont->activar_desactivar_tipo_reportes($_POST['idtipo_reportes'],$_POST['estado'],$_POST['tipo_reporte'],$_POST['idempresa']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtipo_reportes'],$_POST['estado'],$_POST['tipo_reporte'],$_POST['idempresa']));
        }
    }
    elseif($ver=="registrar_estado_resultados_admin"){
        if(isset($_POST['idplantilla_reporte'],$_POST['idtn'],$_POST['empresa'])){
            $cont=new Plantilla_admin();
            $cont->registrar_estado_resultados_admin($_POST['idplantilla_reporte'],$_POST['idtn'],$_POST['empresa']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idplantilla_reporte'],$_POST['idtn'],$_POST['empresa']));
        }
    }elseif($ver=="editar_registros_padres_BG"){
        if(isset($_POST['idconfiguracion_reporte'],$_POST['negrilla_cursiva'])){
            $cont=new Reporte_confi();
            $cont->editar_registros_padres_BG($_POST['idconfiguracion_reporte'],$_POST['negrilla_cursiva']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idconfiguracion_reporte'],$_POST['negrilla_cursiva']));
        }
    }elseif($ver=="editar_registros_padres_ER"){
        if(isset($_POST['idplantilla'],$_POST['negrilla_cursiva'])){
            $cont=new PlantillaReporte();
            $cont->editar_registros_padres_ER($_POST['idplantilla'],$_POST['negrilla_cursiva']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idplantilla'],$_POST['negrilla_cursiva']));
        }
    }elseif($ver=="registrar_reportes_referencia"){
        if(isset($_POST['idtipo_reporte'],$_POST['idplantilla'],$_POST['idtipo_reporte_referencia'],$_POST['idplantilla_referencia'],$_POST['empresa'])){
            $cont=new PlantillaReporte();
            $cont->registrar_reportes_referencia($_POST['idtipo_reporte'],$_POST['idplantilla'],$_POST['idtipo_reporte_referencia'],$_POST['idplantilla_referencia'],$_POST['empresa']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtipo_reporte'],$_POST['idplantilla'],$_POST['idtipo_reporte_referencia'],$_POST['idplantilla_referencia'],$_POST['empresa']));
        }
    }elseif($ver == "registrotransaccion_por_asiento") {
        if(isset($_POST['fecha'],$_POST['idasiento'],$_POST['monto'],$_POST['glosa'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion'])){
        $cont=new Transacciones();
        $cont->registrotransaccion_por_asiento($_POST['fecha'],$_POST['idasiento'],$_POST['monto'],$_POST['glosa'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['idasiento'],$_POST['monto'],$_POST['glosa'],$_POST['empresa'],$_POST['sucursal'],$_POST['idgestion']));
        }
    }elseif($data['ver'] == "asignar_facturas_A_cuentas") {
        $cont=new Transacciones();
        $cont->asignar_facturas_A_cuentas($data);
    }elseif($ver == "vincular_rubro_plandecuentas") {
        if(isset($_POST['numero_ini'],$_POST['numero_fin'],$_POST['idrubro'],$_POST['empresa'])){
        $cont=new Plandecuentas();
        $cont->vincular_rubro_plandecuentas($_POST['numero_ini'],$_POST['numero_fin'],$_POST['idrubro'],$_POST['empresa']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['numero_ini'],$_POST['numero_fin'],$_POST['idrubro'],$_POST['empresa']));
        }
    }elseif($ver == "descargar_listarubroscontables") {
        if(isset($_POST['empresa'])){
        $cont=new Plandecuentas();
        $cont->descargar_listarubroscontables($_POST['empresa']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['empresa']));
        }
    }elseif($ver=="importar_todo_admin"){
        if(isset($_POST['idtn'],$_POST['empresa'])){
            $cont=new Plantilla_admin();
            $cont->importar_todo_admin($_POST['idtn'],$_POST['empresa']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtn'],$_POST['empresa']));
        }
    }elseif($ver=="modificacion_transacciones_desordenados"){
        if(isset($_POST['idtransaccion'],$_POST['codigo_error'],$_POST['codigo_correcto'],$_POST['empresa'],$_POST['gestion'])){
            $cont=new Insertar_transaccion();
            $cont->modificacion_transacciones_desordenados($_POST['idtransaccion'],$_POST['codigo_error'],$_POST['codigo_correcto'],$_POST['empresa'],$_POST['gestion']);
        }else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud"));
        }
    }elseif($data['ver'] == "asignar_comprobantes_A_cuentas") {
        $cont=new Transacciones();
        $cont->asignar_comprobantes_A_cuentas($data);
    }elseif($data['ver'] == "asignar_recibos_A_cuentas") {
        $cont=new Transacciones();
        $cont->asignar_recibos_A_cuentas($data);
    }elseif($data['ver'] == "desvincular_facturas_comercial_de_transaccion") {
        $cont=new Transacciones();
        $cont->desvincular_facturas_comercial_de_transaccion($data);
    }elseif($data['ver'] == "desvincular_facturas_contabilidad_de_transaccion") {
        $cont=new Transacciones();
        $cont->desvincular_facturas_contabilidad_de_transaccion($data);
    }elseif($data['ver'] == "asignar_facturas_comercial_A_cuentas") {
        $cont=new Factura_comercial();
        $cont->asignar_facturas_comercial_A_cuentas($data);
    }elseif($ver == "registrar_anular_eliminar_activar_factura_caja_bancos"){
        if(isset($_POST['id_documento'],$_POST['tipo_documento'],$_POST['registro_desde'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Factura_cobros();
            $cont->registrar_anular_eliminar_activar_factura_caja_bancos($_POST['id_documento'],$_POST['tipo_documento'],$_POST['registro_desde'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['id_documento'],$_POST['tipo_documento'],$_POST['registro_desde'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion']));
        }
    }elseif($ver == "cambiarEstado_anular_eliminar_activar_factura_caja_bancos"){

        if(isset($_POST['idsolicitud_anular_eliminar'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Factura_cobros();
            $cont->cambiarEstado_anular_eliminar_activar_factura_caja_bancos($_POST['idsolicitud_anular_eliminar'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idsolicitud_anular_eliminar'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin']));
        }
    }
  
    elseif($ver == "registrar_tipo_cliente"){

        if(isset($_POST['tipo'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Tipo_cliente_comercial();
            $cont->registrar_tipo_cliente($_POST['tipo'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['tipo'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa']));
        }
    }elseif($ver == "editar_tipo_cliente"){

        if(isset($_POST['idtipo_cliente'],$_POST['tipo'],$_POST['descripcion'],$_POST['estado'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Tipo_cliente_comercial();
            $cont->editar_tipo_cliente($_POST['idtipo_cliente'],$_POST['tipo'],$_POST['descripcion'],$_POST['estado']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtipo_cliente'],$_POST['tipo'],$_POST['descripcion'],$_POST['estado']));
        }
    }elseif($ver == "editar_factura_tributario"){

        if(isset($_POST['id'],$_POST['fecha'],$_POST['id_cliente_proveedor'],$_POST['nfactura'],$_POST['monto'],$_POST['por_concepto_de'],$_POST['cobrado_pagado'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Contabilidad();
            $cont->editar_factura_tributario($_POST['id'],$_POST['fecha'],$_POST['id_cliente_proveedor'],$_POST['nfactura'],$_POST['monto'],$_POST['por_concepto_de'],$_POST['cobrado_pagado']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['id'],$_POST['fecha'],$_POST['id_cliente_proveedor'],$_POST['nfactura'],$_POST['monto'],$_POST['por_concepto_de'],$_POST['cobrado_pagado']));
        }
    }elseif($ver == "registrar_anular_eliminar_activar_factura_tributario_transaccion"){
        if(isset($_POST['id_documento'],$_POST['registro_desde'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Factura_cobros();
            $cont->registrar_anular_eliminar_activar_factura_tributario_transaccion($_POST['id_documento'],$_POST['registro_desde'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['id_documento'],$_POST['registro_desde'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion']));
        }
    }elseif($ver == "cambiarEstado_anular_eliminar_activar_factura_tributario_transaccion"){

        if(isset($_POST['idsolicitud_anular_eliminar'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Factura_cobros();
            $cont->cambiarEstado_anular_eliminar_activar_factura_tributario_transaccion($_POST['idsolicitud_anular_eliminar'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idsolicitud_anular_eliminar'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin']));
        }
    }elseif($ver == "registrar_anular_eliminar_activar_comprobante_tributario_transaccion"){
        if(isset($_POST['id_documento'],$_POST['tipo_documento'],$_POST['registro_desde'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Factura_cobros();
            $cont->registrar_anular_eliminar_activar_comprobante_tributario_transaccion($_POST['id_documento'],$_POST['tipo_documento'],$_POST['registro_desde'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['id_documento'],$_POST['tipo_documento'],$_POST['registro_desde'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'],$_POST['idgestion']));
        }
    }elseif($ver == "cambiarEstado_anular_eliminar_activar_comprobante_tributario_transaccion"){

        if(isset($_POST['idsolicitud_anular_eliminar'],$_POST['tipo_documento'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Factura_cobros();
            $cont->cambiarEstado_anular_eliminar_activar_comprobante_tributario_transaccion($_POST['idsolicitud_anular_eliminar'],$_POST['tipo_documento'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idsolicitud_anular_eliminar'],$_POST['tipo_documento'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['fecha_proceso'],$_POST['hora_proceso'],$_POST['idusuario_admin']));
        }
    }elseif($data['ver'] == "desvincular_documentos_de_cuenta") {
        $cont=new Transacciones();
        $cont->desvincular_documentos_de_cuenta($data);
    }
    elseif($ver == "activar_desactivar_tipo_cliente"){

        if(isset($_POST['idtipocliente'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Tipo_cliente_comercial();
            $cont->activar_desactivar_tipo_cliente($_POST['idtipocliente']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtipocliente']));
        }
    }elseif($data['ver'] == "registrar_comprobantes_caja_bancos_comercial") {
        $cont=new Factura_comercial();
        $cont->registrar_comprobantes_caja_bancos_comercial($data);
    }elseif($data['ver'] == "autorizacion_caja_bancos_comercial") {
        $cont=new Factura_comercial();
        $cont->autorizacion_caja_bancos_comercial($data);
    }elseif($data['ver'] == "vincular_cobros_comercial_caja_bancos") {
        $cont=new Factura_comercial();
        $cont->vincular_cobros_comercial_caja_bancos($data);
    }elseif($ver=="registrar_plantilla_flujo_efectivo"){
        if(isset($_POST['idconfiguracion_reporte'],$_POST['nombre_registro'],$_POST['tipo_operacion'],$_POST['nivel_registro'],$_POST['id_plantilla_superior'],$_POST['orden'],$_POST['negrilla_cursiva'],$_POST['empresa'])){
            $cont=new Reporte_flujo_efectivo();
            $cont->registrar_plantilla_flujo_efectivo($_POST['idplantilla_reporte'],$_POST['obtiene_desde'],$_POST['idconfiguracion_reporte'],$_POST['nombre_registro'],$_POST['tipo_operacion'],$_POST['nivel_registro'],$_POST['id_plantilla_superior'],$_POST['orden'],$_POST['negrilla_cursiva'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idconfiguracion_reporte'],$_POST['nombre_registro'],$_POST['tipo_operacion'],$_POST['nivel_registro'],$_POST['id_plantilla_superior'],$_POST['orden'],$_POST['negrilla_cursiva'],$_POST['empresa']));
        }
    }elseif($data['ver'] == "guardar_balance_general_por_gestion") {
        $cont=new Reporte_confi();
        $cont->guardar_balance_general_por_gestion($data);
    }elseif($data['ver'] == "asignar_gestiones_a_usuario") {
        $cont=new Usuario_gestion();
        $cont->asignar_gestiones_a_usuario($data);
    }elseif($ver == "editar_flujo_efectivo"){
        if(isset($_POST['idplantilla'],$_POST['idconfi_reporte'],$_POST['obtiene_desde'],$_POST['nombre_registro'],$_POST['tipo_operacion'],$_POST['orden'],$_POST['idplantilla_padre'],$_POST['negrilla_cursiva'],$_POST['empresa'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new Reporte_flujo_efectivo();
            $cont->editar_flujo_efectivo($_POST['idplantilla'],$_POST['idconfi_reporte'],$_POST['obtiene_desde'],$_POST['nombre_registro'],$_POST['tipo_operacion'],$_POST['orden'],$_POST['idplantilla_padre'],$_POST['negrilla_cursiva'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idplantilla'],$_POST['idconfi_reporte'],$_POST['obtiene_desde'],$_POST['nombre_registro'],$_POST['tipo_operacion'],$_POST['orden'],$_POST['idplantilla_padre'],$_POST['negrilla_cursiva'],$_POST['empresa']));
        }
    }elseif($data['ver'] == "cambiar_cajaBanco_de_facturas_comercial_desde_conta") {
        $cont=new Factura_comercial();
        $cont->cambiar_cajaBanco_de_facturas_comercial_desde_conta($data);
    }elseif($data['ver'] == "anular_caja_bancos_comercial") {
        $cont=new Factura_comercial();
        $cont->anular_caja_bancos_comercial($data);
    }elseif($data['ver'] == "vincular_cajaBanco_de_facturas_comercial_desde_conta") {
        $cont=new Factura_comercial();
        $cont->vincular_cajaBanco_de_facturas_comercial_desde_conta($data);
    }elseif($data['ver'] == "asignar_cobros_comercial_A_cuentas") {
        $cont=new Factura_comercial();
        $cont->asignar_cobros_comercial_A_cuentas($data);
    }elseif($ver == "editar_otras_operaciones"){
        if(isset($_POST['idagrupacion_plantilla'],$_POST['idplantilla_hijo'],$_POST['tipo_operacion'],$_POST['monto'])){
            // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
            $cont=new PlantillaReporte();
            $cont->editar_otras_operaciones($_POST['idagrupacion_plantilla'],$_POST['idplantilla_hijo'],$_POST['tipo_operacion'],$_POST['monto']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idagrupacion_plantilla'],$_POST['idplantilla_hijo'],$_POST['tipo_operacion'],$_POST['monto']));
        }
    }elseif($ver == "vincular_empresas"){
        $cont=new Vinculacion_empresas();
        $cont->vincular_empresas($_POST['idempresa_actual'],$_POST['idempresa_vinculada'],$_POST['idgestion_vinculada']);
    }elseif($data['ver'] == "duplicar_transaccion_otra_empresa"){
        $cont=new Vinculacion_empresas();
        $cont->duplicar_transaccion_otra_empresa($data);
    }elseif($ver == "editar_gestion_empresa_vinculada"){
        $cont=new Vinculacion_empresas();
        $cont->editar_gestion_empresa_vinculada($_POST['idvinculacion'],$_POST['idgestion']);
    }
  
// asignar asiento desvincular_documentos_de_cuenta editar_recibo_caja_bancos registrocobrarfactura registrar_anular_eliminar_activar_factura_tributario_transaccion
//   registrar_balance_general_admin registrar_vinculacion_depreciacion editar_registro_flujo_efectivo activar_desactivar_tipo_reportes creartipoasiento

// asignar_comprobantes_A_comprobantes guardar_balance_general_por_gestion registrogestion ss desvincular_facturas_comercial_de_transaccion

} 
//  registrotransaccion registrar_agrupacion_plantilla registrar_recibo_pago_cajaBancos_en_otras_cuentas asignar_facturas_comercial_A_cuentas
// registrar_agrupacion_plantilla registrar_configuracion_reporte registrar_factura_recibo_pago_cajaBancos registrar_recibo_pago_cajaBancos_en_facturas editar_otras_operaciones
// cobrar_contratacion_con_factura_cajaBancos vincular_rubro_plandecuentas
?> 