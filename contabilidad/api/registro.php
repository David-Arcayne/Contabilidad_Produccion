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

$ver=$_POST['ver'];
$json = file_get_contents('php://input'); // Decodificar el JSON en un arreglo PHP   gestion
$data = json_decode($json, true);
if($ver=="registroplanes"){
$ad=new Admin();
$ad->registroplanes($_POST['numero'],$_POST['plan'],$_POST['descripcion'],$_POST['tipo'],$_POST['plandecuenta'],$_POST['empresa']);
}elseif($ver=="registroplanesf5"){
    $ad=new Admin();
    $ad->editarregistroplanes($_POST['idplan'],$_POST['numero'],$_POST['plan'],$_POST['descripcion'],$_POST['tipo'],$_POST['plandecuenta'],$_POST['empresa_id']);
}elseif($ver=="registrotipodecambio"){
$adm=new Admin();
$adm->registrotipodecambio($_POST['dolar'],$_POST['ufv'],$_POST['fecha'],$_POST['empresa']);
}elseif($ver=="registrotipodecambiof5"){
$adm=new Admin();
$adm->registrotipodecambiof5($_POST['id'],$_POST['dolar'],$_POST['ufv'],$_POST['fecha']);
}elseif($ver=="registrotransaccion"){
$cont=new Transacciones();
$cont->registrotransaccion($_POST['fecha'],$_POST['tipodecambio'],$_POST['tipotransaccion'],$_POST['descripcion'],$_POST['empresa'],$_POST['sucursal'],$_POST['ufv'],$_POST['dolar']);
}elseif($ver=="insertartransaccionen"){
    $cont=new Contabilidad();
    $cont->insertartransaccionen($_POST['codigo'],$_POST['fecha'],$_POST['tipodecambio'],$_POST['tipotransaccion'],$_POST['descripcion'],$_POST['empresa'],$_POST['sucursal']);
}elseif($ver=="registrotransaccionf5"){
$cont=new Transacciones();
$cont->registrotransaccionf5($_POST['idt'],$_POST['fecha'],$_POST['tipodecambio'],$_POST['tipotransaccion'],$_POST['descripcion'],$_POST['gestion']);
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
$cont->registrar_factura_cobros_transaccion($_POST['idcajas_bancos'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta'],$_POST['empresa'],$_POST['sucursal'],$_POST['por_concepto de']);
//echo json_encode($_POST['fechatfactura']); registroplanesf5

}elseif($ver=="registrar_factura_pagos_transaccion"){
$cont=new Factura_pagos();
$cont->registrar_factura_pagos_transaccion($_POST['idcajas_bancos'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta'],$_POST['empresa'],$_POST['sucursal'],$_POST['por_concepto de']);
//echo json_encode($_POST['fechatfactura']); registroplanesf5

}elseif($ver=="crearfacturasf5"){
    $cont=new Contabilidad();
    $cont->crearfacturasf5($_POST['idfactura'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta']);

}elseif($ver=="crearfacturasapi"){
    $cont=new Contabilidad();
    $cont->crearfacturasapi($_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrar'],$_POST['pagar'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta'],$_POST['empresa'],$_POST['sucursal']);
    //echo json_encode($_POST['fechatfactura']);
    
}elseif($ver=="crearfacturasapif5"){
        $cont=new Contabilidad();
        $cont->crearfacturasapif5($_POST['idfactura'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrar'],$_POST['pagar'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta']);
    
}elseif($ver=="registrar_factura_cobros_tributario"){
    $cont=new Factura_cobros();
    $cont->registrar_factura_cobros_tributario($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['cuenta'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcajas_bancos']);
     
}elseif($ver=="registrar_factura_pagos_tributario"){
    $cont=new Factura_pagos();
    $cont->registrar_factura_pagos_tributario($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['cuenta'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcajas_bancos']);
 
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
if(isset($_POST['idfactura'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['idcuenta'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'])){
    $cont=new Cuentaspof();
    $cont->registrocobrarfactura($_POST['idfactura'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['idcuenta'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo']);
}
else{
    echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['idcuenta'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo']));
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
    $cont->registropagarfactura($_POST['idfactura'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['idcuenta'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo']);
}elseif($ver=="registropagarfacturaf5"){
    $cont=new Cuentaspor();
    $cont->registropagarfacturaf5($_POST['idrecibo'],$_POST['lugar'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['idtransaccion'],$_POST['archivo']);
}elseif($ver=="registrogestion"){
$cont=new Contabilidad();
$cont->registrogestion($_POST['nombre'],$_POST['fechaini'],$_POST['fechafin'],$_POST['empresa']);
}elseif($ver=="registrogestionf5"){
$cont=new Contabilidad();
$cont->registrogestionf5($_POST['nombre'],$_POST['idgestion'],$_POST['empresa'],$_POST['fechaini'],$_POST['fechafin']);
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
$cont->rangosolicituddesconsolidar($_POST['rangoa'],$_POST['rangob'],$_POST['motivo'],$_POST['estado'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa']);
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
    $cont->registrar_transaccionEn_espera($_POST['transacciones_idtransacciones'],$_POST['estado'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['codigotransaccion'],$_POST['tipocambio'],$_POST['tipotransaccion'],$_POST['glosa'],$_POST['idempresa'],$_POST['sucursal']);
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
    if(isset($_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idtransaccion'],$_POST['cajasBancos'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Transacciones_facturas();
        $cont->registrocobrarfacturaGrupal($_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idtransaccion'],$_POST['cajasBancos'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idtransaccion'],$_POST['cajasBancos'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas']));
    }
}elseif($ver == "registropagarfacturaGrupal"){
    if(isset($_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['cajasBancos'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new TransFactura_pagar();
        $cont->registropagarfacturaGrupal($_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['cajasBancos'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['cajasBancos'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas']));
    }
}elseif($ver == "registrar_anular_eliminar_activar_transaccion"){
    if(isset($_POST['transacciones_idtransacciones'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Anulacion_transaccion();
        $cont->registrar_anular_eliminar_activar_transaccion($_POST['transacciones_idtransacciones'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['transacciones_idtransacciones'],$_POST['motivo'],$_POST['estado_opcion'],$_POST['estado_solicitud'],$_POST['hora'],$_POST['fecha'],$_POST['idusuario'],$_POST['idempresa']));
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

    if(isset($_POST['idcuentaspof'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['empresa'],$_POST['sucursal'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Transacciones_facturas();
        $cont->registrar_transaccion_recibo($_POST['idcuentaspof'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['empresa'],$_POST['sucursal']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcuentaspof'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['empresa'],$_POST['sucursal']));
    }
}elseif($ver == "registrar_transaccion_recibo_pago"){

    if(isset($_POST['idcuentaspor'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['empresa'],$_POST['sucursal'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new TransFactura_pagar();
        $cont->registrar_transaccion_recibo_pago($_POST['idcuentaspor'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['empresa'],$_POST['sucursal']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcuentaspor'],$_POST['fecha'],$_POST['monto'],$_POST['glosa'],$_POST['asiento'],$_POST['empresa'],$_POST['sucursal']));
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

    if(isset($_POST['idtransaccion'],$_POST['asiento'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['clase_otras_cuentas'],$_POST['pagado'],$_POST['cobrado'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Documento_cobro();
        $cont->registrar_otras_cuentas($_POST['idtransaccion'],$_POST['asiento'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['clase_otras_cuentas'],$_POST['pagado'],$_POST['cobrado'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idtransaccion'],$_POST['asiento'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['clase_otras_cuentas'],$_POST['pagado'],$_POST['cobrado'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo']));
    }
}elseif($ver == "editar_otras_cuentas"){

    if(isset($_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Documento_cobro();
        $cont->editar_otras_cuentas($_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago']));
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
    if(isset($_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'])){
        $cont=new Recibo_otras_cuentas();
        $cont->registrar_recibo_otras_cuentas($_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo']));
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
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idotras_cuentas'],$_POST['fecha'],$_POST['lugar'],$_POST['id_cliente_proveedor'],$_POST['nro_tributario'],$_POST['contacto'],$_POST['nro_doc_identidad'],$_POST['idtipo'],$_POST['concepto'],$_POST['condiciones'],$_POST['observaciones'],$_POST['precio'],$_POST['forma_pago']));
        }
    }elseif($ver=="registrar_recibo_otras_cuentas_pagar"){
        if(isset($_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'])){
            $cont=new Recibo_otras_cuentas();
            $cont->registrar_recibo_otras_cuentas_pagar($_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idotras_cuentas'],$_POST['lugar'],$_POST['idtransaccion'],$_POST['idcaja_bancos'],$_POST['fecha'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo']));
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
        if(isset($_POST['fecha'],$_POST['idasignacion_asiento'],$_POST['monto'],$_POST['empresa'],$_POST['sucursal'])){
            $cont=new Transacciones();
            $cont->registro_transaccion_comercial($_POST['fecha'],$_POST['idasignacion_asiento'],$_POST['monto'],$_POST['empresa'],$_POST['sucursal']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['idasignacion_asiento'],$_POST['monto'],$_POST['empresa'],$_POST['sucursal']));
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
        if(isset($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['cuenta'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_factura_recibo_cobro_cajaBancos($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['cuenta'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['cuenta'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde']));
        }
    }elseif($ver=="registrar_factura_recibo_pago_cajaBancos"){
        if(isset($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['cuenta'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_factura_recibo_pago_cajaBancos($_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['cuenta'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['por_concepto_de'],$_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['cuenta'],$_POST['sucursal'],$_POST['asiento'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde']));
        }
    }elseif($ver=="registrar_otras_cuentas_recibo_cajaBancos_cobro"){
        if(isset($_POST['fecha'],$_POST['clase_otras_cuentas'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['id_cliente_proveedor'],$_POST['asiento'],$_POST['concepto'],$_POST['precio'],$_POST['idtipo'],$_POST['empresa'],$_POST['sucursal'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_otras_cuentas_recibo_cajaBancos_cobro($_POST['fecha'],$_POST['clase_otras_cuentas'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['id_cliente_proveedor'],$_POST['asiento'],$_POST['concepto'],$_POST['precio'],$_POST['idtipo'],$_POST['empresa'],$_POST['sucursal'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['clase_otras_cuentas'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['id_cliente_proveedor'],$_POST['asiento'],$_POST['concepto'],$_POST['precio'],$_POST['idtipo'],$_POST['empresa'],$_POST['sucursal'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde']));
        }
    }elseif($ver=="registrar_otras_cuentas_recibo_cajaBancos_pago"){
        if(isset($_POST['fecha'],$_POST['clase_otras_cuentas'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['id_cliente_proveedor'],$_POST['asiento'],$_POST['concepto'],$_POST['precio'],$_POST['idtipo'],$_POST['empresa'],$_POST['sucursal'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_otras_cuentas_recibo_cajaBancos_pago($_POST['fecha'],$_POST['clase_otras_cuentas'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['id_cliente_proveedor'],$_POST['asiento'],$_POST['concepto'],$_POST['precio'],$_POST['idtipo'],$_POST['empresa'],$_POST['sucursal'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['clase_otras_cuentas'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['id_cliente_proveedor'],$_POST['asiento'],$_POST['concepto'],$_POST['precio'],$_POST['idtipo'],$_POST['empresa'],$_POST['sucursal'],$_POST['idcaja_bancos'],$_FILES['archivo'],$_POST['registro_desde']));
        }
    }elseif($data['ver'] == "asignar_asiento_A_otras_cuentas") {
        $cont=new Documento_cobro();
        $cont->asignar_asiento_A_otras_cuentas($data);
    }elseif($ver=="registrar_caja_bancos_usuarios"){
        if(isset($_POST['idcaja_bancos'],$_POST['idusuario'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa'])){
            $cont=new Caja_bancos_recibos();
            $cont->registrar_caja_bancos_usuarios($_POST['idcaja_bancos'],$_POST['idusuario'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcaja_bancos'],$_POST['idusuario'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa']));
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
        if(isset($_POST['idrecibo'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['monto'],$_POST ['por_concepto_de'],$_POST['cliente_prov'])){
            $cont=new caja_bancos_recibos(); 
            $cont->editar_caja_bancos_facturas($_POST['idrecibo'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['monto'],$_POST ['por_concepto_de'],$_POST['cliente_prov']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idrecibo'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['monto'],$_POST ['por_concepto_de'],$_POST['cliente_prov']));
        }
    }elseif($ver=="editar_caja_bancos_otras_cuentas"){
        if(isset($_POST['idrecibo'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['tipo'],$_POST ['precio'],$_POST['concepto'],$_POST['cliente_prov'])){
            $cont=new caja_bancos_recibos();
            $cont->editar_caja_bancos_otras_cuentas($_POST['idrecibo'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['tipo'],$_POST ['precio'],$_POST['concepto'],$_POST['cliente_prov']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idrecibo'],$_POST['tipo_documento'],$_POST['fecha'],$_POST['tipo'],$_POST ['precio'],$_POST['concepto'],$_POST['cliente_prov']));
        }
    }elseif($ver=="registrar_cuenta_pre_cierre"){
        if(isset($_POST['fecha'],$_POST['empresa'],$_POST['sucursal'])){
            $cont=new Transacciones();
            $cont->registrar_cuenta_pre_cierre($_POST['fecha'],$_POST['empresa'],$_POST['sucursal']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['empresa'],$_POST['sucursal']));
        }
    }elseif($ver=="registrar_cuenta_cierre"){
        if(isset($_POST['fecha'],$_POST['empresa'],$_POST['sucursal'])){
            $cont=new Transacciones();
            $cont->registrar_cuenta_cierre($_POST['fecha'],$_POST['empresa'],$_POST['sucursal']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['empresa'],$_POST['sucursal']));
        }
    }elseif($ver=="registrar_cuenta_apertura"){
        if(isset($_POST['fecha'],$_POST['idgestion_anterior'],$_POST['empresa'],$_POST['sucursal'])){
            $cont=new Transacciones();
            $cont->registrar_cuenta_apertura($_POST['fecha'],$_POST['idgestion_anterior'],$_POST['empresa'],$_POST['sucursal']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['idgestion_anterior'],$_POST['empresa'],$_POST['sucursal']));
        }
    }elseif($ver=="editar_caja_bancos_usuarios"){
        if(isset($_POST['idcaja_banco_usuario'],$_POST['idcaja_bancos'],$_POST['idusuario'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa'])){
            $cont=new Caja_bancos_recibos();
            $cont->editar_caja_bancos_usuarios($_POST['idcaja_banco_usuario'],$_POST['idcaja_bancos'],$_POST['idusuario'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idcaja_banco_usuario'],$_POST['idcaja_bancos'],$_POST['idusuario'],$_POST['funcion'],$_POST['permiso_registrar'],$_POST['empresa']));
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
        if(isset($_POST['fecha'],$_POST['monto_total'],$_POST['monto_recibo'],$_POST['transaccion'],$_POST['cajasBancos'],$_POST['asiento_modelo'],$_POST['empresa'],$_POST['sucursal'],$_POST['facturas_comercial'])){
            $cont=new Factura_comercial();
            $cont->cobro_asignacion_factura_comercial($_POST['fecha'],$_POST['monto_total'],$_POST['monto_recibo'],$_POST['transaccion'],$_POST['cajasBancos'],$_POST['asiento_modelo'],$_POST['empresa'],$_POST['sucursal'],$_POST['facturas_comercial']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['fecha'],$_POST['monto_total'],$_POST['monto_recibo'],$_POST['transaccion'],$_POST['cajasBancos'],$_POST['asiento_modelo'],$_POST['empresa'],$_POST['sucursal'],$_POST['facturas_comercial']));
        }
    }elseif($ver=="registrar_firma_reporte"){
        if(isset($_POST['idusuario'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula'],$_POST['empresa'])){
            $cont=new Firma_reporte();
            $cont->registrar_firma_reporte($_POST['idusuario'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula'],$_POST['empresa']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idusuario'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula'],$_POST['empresa']));
        }
    }elseif($ver=="editar_firma_reporte"){
        if(isset($_POST['idfirma_reporte'],$_POST['idusuario'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula'])){
            $cont=new Firma_reporte();
            $cont->editar_firma_reporte($_POST['idfirma_reporte'],$_POST['idusuario'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula']);
        }
        else{
            echo json_encode(array("danger", "Faltan parámetros en la solicitud",$_POST['idfirma_reporte'],$_POST['idusuario'],$_POST['funcion'],$_POST['tipo_reporte'],$_POST['matricula']));
        }
    }  
    
<<<<<<< HEAD
// registrar_factura_recibo_cobro_cajaBancos registrocobrarfactura consolidar vincula crearfacturas registroproveedor registrocobrarfactura
// registrotransaccionf5 tributario registrar_detalle_transaccion_json registrocobrarfacturaGrupal crearfacturas registrar_factura_pagos_transaccion
=======
// registrar_factura_recibo_cobro_cajaBancos registrocobrarfactura consolidar vincula crearfacturas registroproveedor registrocobrarfactura 
// registrotransaccionf5 tributario registrar_detalle_transaccion_json registrocobrarfacturaGrupal crearfacturas caja_bancos registrar_factura_pago
>>>>>>> eb4a5eb78269d24e3abda48a6198dc15c69060a4
}// registropagarfactura impuestocrearf5 registrar_factura desconsolidar registrar_factura_cobros_tributario registrar_factura_pagos_transaccion
?> 