<?php
require_once "admin.php";
require_once "contabilidad.php";
require_once "./transacciones_facturas/transacciones_facturas.php";
require_once "./plan_cuentas/plandecuentas.php";
require_once "./transacciones_facturas/transFactura_pagar.php";
$ver=$_POST['ver'];
$json = file_get_contents('php://input'); // Decodificar el JSON en un arreglo PHP  
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
$cont=new Contabilidad();
$cont->registrotransaccion($_POST['codigo'],$_POST['fecha'],$_POST['tipodecambio'],$_POST['tipotransaccion'],$_POST['descripcion'],$_POST['empresa'],$_POST['sucursal']);
}elseif($ver=="insertartransaccionen"){
    $cont=new Contabilidad();
    $cont->insertartransaccionen($_POST['codigo'],$_POST['fecha'],$_POST['tipodecambio'],$_POST['tipotransaccion'],$_POST['descripcion'],$_POST['empresa'],$_POST['sucursal']);
}elseif($ver=="registrotransaccionf5"){
$cont=new Contabilidad();
$cont->registrotransaccionf5($_POST['idt'],$_POST['codigo'],$_POST['fecha'],$_POST['tipodecambio'],$_POST['tipotransaccion'],$_POST['descripcion'],$_POST['gestion']);
}elseif($ver=="detalletransaccionnormal"){
$cont=new Contabilidad();
$cont->detalletransaccionnormal($_POST['trans'],$_POST['plandecuenta'],$_POST['debe'],$_POST['haber'],$_POST['nota'],$_POST['empresa'],$_POST['sucursal'],$_POST['iddetalletransaccion']);
}elseif($ver=="detalletransaccionnormalf5"){
    $cont=new Contabilidad();
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
}elseif($ver=="crearfacturas"){
$cont=new Contabilidad();
$cont->crearfacturas($_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta'],$_POST['empresa'],$_POST['sucursal']);
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
    
}elseif($ver=="crearsolofacturasapi"){
    $cont=new Contabilidad();
    $cont->crearsolofacturasapi($_POST['fecha'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['clasefactura'],$_POST['cobrado'],$_POST['pagado'],$_POST['especificacion'],$_POST['trans'],$_POST['cliente'],$_POST['empresa'],$_POST['cuenta'],$_POST['sucursal']);
    
    
}elseif($ver=="crearsolofacturasapif5"){
    $cont=new Contabilidad();
    $cont->crearsolofacturasapif5($_POST['idfactura'],$_POST['fechatfactura'],$_POST['nfactura'],$_POST['nautorizacion'],$_POST['codigocontrol'],$_POST['montofactura'],$_POST['tasacero'],$_POST['export'],$_POST['npoliza'],$_POST['iceiecdhotros'],$_POST['descuentobonificacion'],$_POST['especificacion'],$_POST['cliente'],$_POST['cobrado'],$_POST['pagado'],$_POST['trans'],$_POST['clasefactura'],$_POST['cuenta']);

}elseif($ver=="registroasiento"){
$cont=new Contabilidad();
$cont->registroasiento($_POST['nombre'],$_POST['tipo'],$_POST['empresa']);
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
if(isset($_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo'])){
    $cont=new Contabilidad();
    $cont->registrocobrarfactura($_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo']);
}
else{
    echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$_FILES['archivo']));
}
//$res=array($_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente']);
//echo json_encode($res); 
}elseif($ver=="registrocobrarfacturaf5"){
    $cont=new Contabilidad();
    $cont->registrocobrarfacturaf5($_POST['idcuentaspof'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_FILES['archivo']);
    //$res=array($_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente']);
    //echo json_encode($res);
}elseif($ver=="registropagarfactura"){
    $cont=new Contabilidad();
    $cont->registropagarfactura($_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa']);
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
$adm->impuestocrear($_POST['idempresa'],$_POST['codigo'],$_POST['nombre'],$_POST['tasa'],$_POST['descripcion']);
}elseif($ver=="impuestocrearf5"){
$adm=new Admin();
$adm->impuestocrearf5($_POST['idimpuesto'],$_POST['codigo'],$_POST['nombre'],$_POST['tasa'],$_POST['descripcion']);
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
}

// ---------------------------------------------------------------------------- registrocobrarfactura
else{
if($data['ver'] == "cobrofacturasaasientomodelo") {
    $cont=new Transacciones_facturas();
    $cont->cobrofacturasaasientomodelo($data);
}elseif($ver == "registrocobrarfacturaGrupal"){
    if(isset($_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new Transacciones_facturas();
        $cont->registrocobrarfacturaGrupal($_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas']));
    }
}elseif($data['ver'] == "pagofacturasaasientomodelo"){
    $cont=new TransFactura_pagar();
    $cont->pagofacturasaasientomodelo($data);
}elseif($ver == "registropagarfacturaGrupal"){
    if(isset($_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas'])){
        // decode echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['idfactura'],$_POST['idtransaccion'],$_POST['idcuenta'],$_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['asiento'],$_POST['idcliente'],$_POST['sucursal'],$_POST['empresa'],$facturas));
        $cont=new TransFactura_pagar();
        $cont->registropagarfacturaGrupal($_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas']);
    }
    else{
        echo json_encode(array("danger", "Faltan parámetros en la solicitud", $_POST['fecha'],$_POST['nrecibo'],$_POST['persona'],$_POST['ci'],$_POST['monto'],$_POST['idasientotipo'],$_POST['empresa'],$_POST['sucursal'],$_FILES['archivo'],$_POST['facturas']));
    }
}
}
?>