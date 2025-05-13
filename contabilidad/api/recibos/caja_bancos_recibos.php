<?php
require_once "../../db/db.php";
// require_once "./contabilidad/api/configuracion/empresa.php";
class Caja_bancos_recibos extends DB{


    public function registrar_factura_recibo_cobro_cajaBancos($por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar, $espesificacion,$trans, $cliente, $empresa, $cuenta,  $sucursal,$asiento,$idcaja_bancos,$archivo,$registro_desde)
    {

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        
        //--------------------------------------------------------------------
        $recibo_trans = $this->dbc->query("SELECT count(*) AS cant1 FROM cuentaspof cp 
        INNER JOIN transacciones t ON t.idtransacciones=cp.transaccion 
        WHERE t.organizacion_idorganizacion='$idempresa'");
        $res1 = $recibo_trans->fetch_assoc();

        $recibo_fact = $this->dbc->query("SELECT count(*) AS cant2 FROM cuentaspof cp
            INNER JOIN factura f ON f.idfactura=cp.idfactura
            WHERE f.idorganizacion='$idempresa' AND cp.transaccion = '0'");
        $res2 = $recibo_fact->fetch_assoc();

        $recibo_oc = $this->dbc->query("SELECT count(*) AS cant3 FROM cuentaspof cp
        INNER JOIN otras_cuentas oc ON oc.idotras_cuentas=cp.idotras_cuentas
        WHERE oc.idempresa='$idempresa' and cp.transaccion ='0'");
        $res3 = $recibo_oc->fetch_assoc();

        $nroRecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;

        $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$cliente'");
        $clientSelect = $cl->fetch_assoc();

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }else{
            // Obtener el número de transacción más reciente y sumar 1
        $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$idempresa AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado12 = $nroTrans->fetch_assoc();
        $nroTransaccion = $resultado12['codigotransaccion'] + 1;

        //el asiento es diferente a cero, se debe crear una transaccion
        $idAsientoTipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asiento' AND idorganizacion='$idempresa';");
        $asiento_aux = $idAsientoTipo->fetch_assoc();  // Cambiado $nroTrans->fetch_assoc() a $idAsientoTipo->fetch_assoc()
        $tipotransaccion = $asiento_aux['tipo'];
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion', '$fecha', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tipotransaccion', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        while ($qwe = $tasiento->fetch_assoc()) {
            $pcuenta = $qwe['idcuenta'];
            if ($qwe['tipo'] == "DEBE") {
                $debe = $monto * ($qwe['porciento'] / 100);
                $haber = 0;
            } elseif ($qwe['tipo'] == "HABER") {
                $debe = 0;
                $haber = $monto * ($qwe['porciento'] / 100);
            }
            $ppresupuestario = 0;
            $nota = "-";
            $estado = 1;
     
            // Insertar en detalletransaccion Ocurrio un error al asignar la factura
            $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal, orden) VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal', '$orden')");
            
            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$idtrans','0',NULL,'$registro_desde')");

        $idrecibo = $this->dbc->insert_id;
        }
      
        //----------------------------------------------------------------------------------------------------------------------------------------------------------

        if(empty($archivo['name'])){
            //NO PASA NBADA EL CUENTASPOF NO SE EDITA EL ARCHIVO SIGUE SIENDO NULL

        }else{
         // Manejar la carga del archivo
        $archivo_nombre = "";
        if ($archivo['error'] == UPLOAD_ERR_OK) {
            $archivo_tmp = $archivo['tmp_name'];
            $archivo_nombre = basename($archivo['name']);
            // ----------------------------------
            $unique_name = uniqid("img_", true) . '.' . $archivo_nombre;
            // $target_file = $target_dir . $unique_name;

            // $ruta_destino = __DIR__ . "/archivos/" . $archivo_nombre;
            $ruta_destino = "../archivos/" . $unique_name;
            // $ruta_destino = "../archivos/" . $archivo_nombre;
            // move_uploaded_file($archivo_tmp, $ruta_destino); grupal
        }
        if(move_uploaded_file($archivo_tmp, $ruta_destino)){
             //registrar pago, preguntar guardar la anterior transaccion o la nueva
        $registropago2 = $this->dbc->query("UPDATE cuentaspof SET archivo = '$unique_name' WHERE idcuentaspof = '$idrecibo'");

        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }

        //----------------------------------------------------------------------------------------------------------------------------------------------------------

        $crear_detalle_cajaBancos = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
        VALUES('$idcaja_bancos','$monto','$idrecibo','$idfact','0')");

        if ($crearRecibo === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);

    }

    public function registrar_factura_recibo_pago_cajaBancos($por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar, $espesificacion,$trans, $cliente, $empresa, $cuenta,  $sucursal,$asiento,$idcaja_bancos,$archivo,$registro_desde)
    {

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        
        //--------------------------------------------------------------------
        $recibo_trans = $this->dbc->query("SELECT count(*) AS cant1 FROM cuentaspor cp 
        INNER JOIN transacciones t ON t.idtransacciones=cp.transaccion 
        WHERE t.organizacion_idorganizacion='$idempresa'");
        $res1 = $recibo_trans->fetch_assoc();

        $recibo_fact = $this->dbc->query("SELECT count(*) AS cant2 FROM cuentaspor cp
            INNER JOIN factura f ON f.idfactura=cp.idfactura
            WHERE f.idorganizacion='$idempresa' AND cp.transaccion = '0'");
        $res2 = $recibo_fact->fetch_assoc();

        $recibo_oc = $this->dbc->query("SELECT count(*) AS cant3 FROM cuentaspor cp
        INNER JOIN otras_cuentas oc ON oc.idotras_cuentas=cp.idotras_cuentas
        WHERE oc.idempresa='$idempresa' and cp.transaccion ='0'");
        $res3 = $recibo_oc->fetch_assoc();

        $nroRecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;

        $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$cliente'");
        $clientSelect = $cl->fetch_assoc();

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }else{
            // Obtener el número de transacción más reciente y sumar 1
        $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$idempresa AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado12 = $nroTrans->fetch_assoc();
        $nroTransaccion = $resultado12['codigotransaccion'] + 1;

        //el asiento es diferente a cero, se debe crear una transaccion
        $idAsientoTipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asiento' AND idorganizacion='$idempresa';");
        $asiento_aux = $idAsientoTipo->fetch_assoc();  // Cambiado $nroTrans->fetch_assoc() a $idAsientoTipo->fetch_assoc()
        $tipotransaccion = $asiento_aux['tipo'];
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion', '$fecha', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tipotransaccion', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        while ($qwe = $tasiento->fetch_assoc()) {
            $pcuenta = $qwe['idcuenta'];
            if ($qwe['tipo'] == "DEBE") {
                $debe = $monto * ($qwe['porciento'] / 100);
                $haber = 0;
            } elseif ($qwe['tipo'] == "HABER") {
                $debe = 0;
                $haber = $monto * ($qwe['porciento'] / 100);
            }
            $ppresupuestario = 0;
            $nota = "-";
            $estado = 1;
    
            // Insertar en detalletransaccion Ocurrio un error al asignar la factura cuentaspof
            $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal, orden) VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal', '$orden')");
            
            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$idtrans','0',NULL,'$registro_desde')");

        $idrecibo = $this->dbc->insert_id;
        }
      
         //----------------------------------------------------------------------------------------------------------------------------------------------------------

         if(empty($archivo['name'])){
            //NO PASA NBADA EL CUENTASPOF NO SE EDITA EL ARCHIVO SIGUE SIENDO NULL

        }else{
         // Manejar la carga del archivo
        $archivo_nombre = "";
        if ($archivo['error'] == UPLOAD_ERR_OK) {
            $archivo_tmp = $archivo['tmp_name'];
            $archivo_nombre = basename($archivo['name']);
            // ----------------------------------
            $unique_name = uniqid("img_", true) . '.' . $archivo_nombre;
            // $target_file = $target_dir . $unique_name;

            // $ruta_destino = __DIR__ . "/archivos/" . $archivo_nombre;
            $ruta_destino = "../archivos/" . $unique_name;
            // $ruta_destino = "../archivos/" . $archivo_nombre;
            // move_uploaded_file($archivo_tmp, $ruta_destino); grupal
        }
        if(move_uploaded_file($archivo_tmp, $ruta_destino)){
             //registrar pago, preguntar guardar la anterior transaccion o la nueva
        $registropago2 = $this->dbc->query("UPDATE cuentaspor SET archivo = '$unique_name' WHERE idcuentaspor = '$idrecibo'");

        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }

        //----------------------------------------------------------------------------------------------------------------------------------------------------------
        
        $crear_detalle_cajaBancos = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
        VALUES('$idcaja_bancos','$monto','$idrecibo','$idfact','0')");

        if ($crearRecibo === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);

    }
                                            
    public function registrar_otras_cuentas_recibo_cajaBancos_cobro($fecha,$coc,$cobro, $pagar,$trans, $cliente,$asiento,$concepto,$precio,$idtipo,$empresa,$sucursal,$idcaja_bancos,$archivo,$registro_desde)
    {                                             
        //idtransaccion, asiento,fecha, id_cliente_proveedor, concepto, precio, idtipo
        // echo json_encode(array($fecha,$coc,$cobro, $pagar,$trans, $cliente,$asiento,$concepto,$precio,$idtipo,$empresa,$sucursal,$idcaja_bancos));
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        
        //--------------------------------------------------------------------
        $recibo_trans = $this->dbc->query("SELECT count(*) AS cant1 FROM cuentaspof cp 
        INNER JOIN transacciones t ON t.idtransacciones=cp.transaccion 
        WHERE t.organizacion_idorganizacion='$idempresa'");
        $res1 = $recibo_trans->fetch_assoc();

        $recibo_fact = $this->dbc->query("SELECT count(*) AS cant2 FROM cuentaspof cp
            INNER JOIN factura f ON f.idfactura=cp.idfactura
            WHERE f.idorganizacion='$idempresa' AND cp.transaccion = '0'");
        $res2 = $recibo_fact->fetch_assoc();

        $recibo_oc = $this->dbc->query("SELECT count(*) AS cant3 FROM cuentaspof cp
        INNER JOIN otras_cuentas oc ON oc.idotras_cuentas=cp.idotras_cuentas
        WHERE oc.idempresa='$idempresa' and cp.transaccion ='0'");
        $res3 = $recibo_oc->fetch_assoc();

        $nroRecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;

        $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$cliente'");
        $clientSelect = $cl->fetch_assoc();
        // NUNCA ENTRA A ESTA CONDICION

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa,registro_desde) 
            VALUES ('$fecha','','','$cliente','$coc','$pagar','$cobro','','','','$idtipo','0','$concepto','','','$precio','','$idempresa','$registro_desde')");
        
            $idotras_cuentas = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$precio','0','$idotras_cuentas','0','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa,registro_desde) 
            VALUES ('$fecha','','','$cliente','$coc','$pagar','$cobro','','','','$idtipo','$trans','$concepto','','','$precio','','$idempresa','$registro_desde')");
        
            $idotras_cuentas = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$precio','0','$idotras_cuentas','$trans','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }else{
            // Obtener el número de transacción más reciente y sumar 1
        $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$idempresa AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado12 = $nroTrans->fetch_assoc();
        $nroTransaccion = $resultado12['codigotransaccion'] + 1;

        //el asiento es diferente a cero, se debe crear una transaccion
        $idAsientoTipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asiento' AND idorganizacion='$idempresa';");
        $asiento_aux = $idAsientoTipo->fetch_assoc();  // Cambiado $nroTrans->fetch_assoc() a $idAsientoTipo->fetch_assoc()
        $tipotransaccion = $asiento_aux['tipo'];
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion', '$fecha', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tipotransaccion', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        while ($qwe = $tasiento->fetch_assoc()) {
            $pcuenta = $qwe['idcuenta'];
            if ($qwe['tipo'] == "DEBE") {
                $debe = $precio * ($qwe['porciento'] / 100);
                $haber = 0;
            } elseif ($qwe['tipo'] == "HABER") {
                $debe = 0;
                $haber = $precio * ($qwe['porciento'] / 100);
            }
            $ppresupuestario = 0;
            $nota = "-";
            $estado = 1;
    
            // Insertar en detalletransaccion Ocurrio un error al asignar la factura
            $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal, orden) VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal', '$orden')");
            
            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------
        $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa,registro_desde) 
            VALUES ('$fecha','','','$cliente','$coc','$pagar','$cobro','','','','$idtipo','$idtrans','$concepto','','','$precio','','$idempresa','$registro_desde')");
        
        $idotras_cuentas = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$precio','0','$idotras_cuentas','$idtrans','0',NULL,'$registro_desde')");

        $idrecibo = $this->dbc->insert_id;
        }
      
            //----------------------------------------------------------------------------------------------------------------------------------------------------------

            if(empty($archivo['name'])){
                //NO PASA NBADA EL CUENTASPOF NO SE EDITA EL ARCHIVO SIGUE SIENDO NULL
    
            }else{
             // Manejar la carga del archivo
            $archivo_nombre = "";
            if ($archivo['error'] == UPLOAD_ERR_OK) {
                $archivo_tmp = $archivo['tmp_name'];
                $archivo_nombre = basename($archivo['name']);
                // ----------------------------------
                $unique_name = uniqid("img_", true) . '.' . $archivo_nombre;
                // $target_file = $target_dir . $unique_name;
    
                // $ruta_destino = __DIR__ . "/archivos/" . $archivo_nombre;
                $ruta_destino = "../archivos/" . $unique_name;
                // $ruta_destino = "../archivos/" . $archivo_nombre;
                // move_uploaded_file($archivo_tmp, $ruta_destino); grupal
            }
            if(move_uploaded_file($archivo_tmp, $ruta_destino)){
                 //registrar pago, preguntar guardar la anterior transaccion o la nueva
            $registropago2 = $this->dbc->query("UPDATE cuentaspof SET archivo = '$unique_name' WHERE idcuentaspof = '$idrecibo'");
    
            }else{
                $res = array("danger", "No se movio el archivo a la carpeta");
            }
        }
    
            //----------------------------------------------------------------------------------------------------------------------------------------------------------
    
        
        $crear_detalle_cajaBancos = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
        VALUES('$idcaja_bancos','$precio','$idrecibo','0','$idotras_cuentas')");

        if ($crearRecibo === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);

    }

    public function registrar_otras_cuentas_recibo_cajaBancos_pago($fecha,$coc,$cobro, $pagar,$trans, $cliente,$asiento,$concepto,$precio,$idtipo,$empresa,$sucursal,$idcaja_bancos,$archivo,$registro_desde)
    {                                             //idtransaccion, asiento,fecha, id_cliente_proveedor, concepto, precio, idtipo

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        
        //--------------------------------------------------------------------
        $recibo_trans = $this->dbc->query("SELECT count(*) AS cant1 FROM cuentaspor cp 
        INNER JOIN transacciones t ON t.idtransacciones=cp.transaccion 
        WHERE t.organizacion_idorganizacion='$idempresa'");
        $res1 = $recibo_trans->fetch_assoc();

        $recibo_fact = $this->dbc->query("SELECT count(*) AS cant2 FROM cuentaspor cp
            INNER JOIN factura f ON f.idfactura=cp.idfactura
            WHERE f.idorganizacion='$idempresa' AND cp.transaccion = '0'");
        $res2 = $recibo_fact->fetch_assoc();

        $recibo_oc = $this->dbc->query("SELECT count(*) AS cant3 FROM cuentaspor cp
        INNER JOIN otras_cuentas oc ON oc.idotras_cuentas=cp.idotras_cuentas
        WHERE oc.idempresa='$idempresa' and cp.transaccion ='0'");
        $res3 = $recibo_oc->fetch_assoc();

        $nroRecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;

        $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$cliente'");
        $clientSelect = $cl->fetch_assoc();
//NUNCA ENTRA A ESTA CONDICION

        if($trans == "" && $asiento == ""){
            //se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa,registro_desde) 
            VALUES ('$fecha','','','$cliente','$coc','$pagar','$cobro','','','','$idtipo','0','$concepto','','','$precio','','$idempresa','$registro_desde')");
        
            $idotras_cuentas = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$precio','0','$idotras_cuentas','0','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa,registro_desde) 
            VALUES ('$fecha','','','$cliente','$coc','$pagar','$cobro','','','','$idtipo','$trans','$concepto','','','$precio','','$idempresa','$registro_desde')");
        
            $idotras_cuentas = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$precio','0','$idotras_cuentas','$trans','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }else{
            // Obtener el número de transacción más reciente y sumar 1
        $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$idempresa AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado12 = $nroTrans->fetch_assoc();
        $nroTransaccion = $resultado12['codigotransaccion'] + 1;

        //el asiento es diferente a cero, se debe crear una transaccion
        $idAsientoTipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asiento' AND idorganizacion='$idempresa';");
        $asiento_aux = $idAsientoTipo->fetch_assoc();  // Cambiado $nroTrans->fetch_assoc() a $idAsientoTipo->fetch_assoc()
        $tipotransaccion = $asiento_aux['tipo'];
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion', '$fecha', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tipotransaccion', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        while ($qwe = $tasiento->fetch_assoc()) {
            $pcuenta = $qwe['idcuenta'];
            if ($qwe['tipo'] == "DEBE") {
                $debe = $precio * ($qwe['porciento'] / 100);
                $haber = 0;
            } elseif ($qwe['tipo'] == "HABER") {
                $debe = 0;
                $haber = $precio * ($qwe['porciento'] / 100);
            }
            $ppresupuestario = 0;
            $nota = "-";
            $estado = 1;
    
            // Insertar en detalletransaccion Ocurrio un error al asignar la factura
            $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal, orden) VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal', '$orden')");
            
            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------
        $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa,registro_desde) 
            VALUES ('$fecha','','','$cliente','$coc','$pagar','$cobro','','','','$idtipo','$idtrans','$concepto','','','$precio','','$idempresa','$registro_desde')");
        
        $idotras_cuentas = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$precio','0','$idotras_cuentas','$idtrans','0',NULL,'$registro_desde')");

        $idrecibo = $this->dbc->insert_id;
        }
      
            //----------------------------------------------------------------------------------------------------------------------------------------------------------

            if(empty($archivo['name'])){
                //NO PASA NBADA EL CUENTASPOF NO SE EDITA EL ARCHIVO SIGUE SIENDO NULL
    
            }else{
             // Manejar la carga del archivo
            $archivo_nombre = "";
            if ($archivo['error'] == UPLOAD_ERR_OK) {
                $archivo_tmp = $archivo['tmp_name'];
                $archivo_nombre = basename($archivo['name']);
                // ----------------------------------
                $unique_name = uniqid("img_", true) . '.' . $archivo_nombre;
                // $target_file = $target_dir . $unique_name;
    
                // $ruta_destino = __DIR__ . "/archivos/" . $archivo_nombre;
                $ruta_destino = "../archivos/" . $unique_name;
                // $ruta_destino = "../archivos/" . $archivo_nombre;
                // move_uploaded_file($archivo_tmp, $ruta_destino); grupal
            }
            if(move_uploaded_file($archivo_tmp, $ruta_destino)){
                 //registrar pago, preguntar guardar la anterior transaccion o la nueva
            $registropago2 = $this->dbc->query("UPDATE cuentaspor SET archivo = '$unique_name' WHERE idcuentaspor = '$idrecibo'");
    
            }else{
                $res = array("danger", "No se movio el archivo a la carpeta");
            }
        }
    
            //----------------------------------------------------------------------------------------------------------------------------------------------------------    
        
        $crear_detalle_cajaBancos = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
        VALUES('$idcaja_bancos','$precio','$idrecibo','0','$idotras_cuentas')");

        if ($crearRecibo === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);

    }
    public function listar_recibo_por_caja_bancos_incompleto($idcaja_bancos,$fecha_ini,$fecha_fin) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];

    $getPedido = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
    FROM detalle_caja_bancos_cobrar dc
    INNER JOIN cuentaspof cp ON cp.r = dc.r
    WHERE dc.idcaja_bancos = '$idcaja_bancos'
    AND cp.fecha >= '$fecha_ini'
    AND cp.fecha <= '$fecha_fin';");

        while ($qwe = $this->dbc->fetch($getPedido)) {
            $cuentaspof = $this->dbc->query("SELECT * FROM cuentaspof WHERE r= '$qwe[r]'");
            $cp = $cuentaspof->fetch_assoc();

             $transac = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones= '$cp[transaccion]'");
                 $tr = $transac->fetch_assoc();
            //     $cp['transaccion']

            if($qwe['idfactura'] != 0){
                //es cliente y se puede obtener del campo cliente directamente 
                // $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                $factura = $this->dbc->query("SELECT * 
                FROM factura 
                WHERE idfactura = '$qwe[idfactura]'");

                $fact = $factura->fetch_assoc();

                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                $cl = $cliente->fetch_assoc();

            }elseif($qwe['idotras_cuentas'] == 0){
                // hacer consulta a la tabla cuentascobrar_grupal y sacar de ahi factura
                $getTabla = $this->dbc->query("SELECT * 
                FROM cuentascobrar_grupal 
                WHERE idfactura = '$qwe[idfactura]'");
$cuentas_cobro_grupal = $getTabla->fetch_assoc();
// while ($ccg = $this->dbc->fetch($getTabla)) {
    $factura = $this->dbc->query("SELECT * 
                FROM factura 
                WHERE idfactura = '$cuentas_cobro_grupal[idfactura]'");
// }
                // $cuentas_cobro_grupal = $getTabla->fetch_assoc();

                

                $fact = $factura->fetch_assoc();
                
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                $cl = $cliente->fetch_assoc();
            }else{
                // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor

                $otras_cuentas = $this->dbc->query("SELECT * 
                FROM otras_cuentas
                WHERE idotras_cuentas = '$qwe[idotras_cuentas]'");

                $oc = $otras_cuentas->fetch_assoc();

                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$oc[id_cliente_proveedor]'");
                $cl = $cliente->fetch_assoc();
            }

            if($qwe['idotras_cuentas'] != 0){
                $aux_descripcion = "Cobro de factura N° $oc[nro_otras_cuentas] con fecha: $oc[fecha]";

                $res = array(
                    "fecha" => $qwe['fecha'],
                    "nrecibo" => $qwe['nrecibo'],
                    "nro_documento" => "$oc[nro_otras_cuentas]",
                    "codigotransaccion" => $tr['codigotransaccion'],
                    "nombre_cliente" => $cl['nombre'],
                    //descripcion saldra de la factura o otras cuentas 
                    "descripcion" => $aux_descripcion,
                    "ingreso" => $qwe['monto']

                );
            }else{
                $aux_descripcion = "Cobro de factura N° $fact[nfactura] con fecha: $fact[fecha]";

                 $aux_factura = "cero $fact[nfactura]";
                 $factu = str_replace("cero ", "", $aux_factura);
                $res = array(
                    "fecha" => $qwe['fecha'],
                    "nrecibo" => $qwe['nrecibo'],
                    "nro_documento" => $factu,
                    "por_concepto_de" => $fact['por_concepto_de'],
                    "codigotransaccion" => $tr['codigotransaccion'],
                    "nombre_cliente" => $cl['nombre'],
                    //descripcion saldra de la factura o otras cuentas 
                    "descripcion" => $aux_descripcion,
                    "ingreso" => $qwe['monto']
                );
            }
          
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    // ---------------------------------------------------------------------------------------------------------------------------

    public function listar_recibo_por_caja_bancos($idcaja_bancos,$fecha_ini,$fecha_fin,$tipo_filtro) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);

    if($tipo_filtro == '1'){ //TIPO = 1 --> INGRESO,  2-->EGRESO, 3--> AMBOS

    $getPedido = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo,cp.registro_desde, 
, dc.idcaja_bancos,dc.monto,dc.idfactura
    FROM detalle_caja_bancos_cobrar dc
    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
    WHERE dc.idcaja_bancos = '$idcaja_bancos'
    AND cp.fecha >= '$fecha_ini'
    AND cp.fecha <= '$fecha_fin';");

$aux_contador = 0;
$saldo = 0;
$saldo_inicial = 0;
        while ($qwe = $this->dbc->fetch($getPedido)) {
            // $cuentaspof = $this->dbc->query("SELECT * FROM cuentaspof WHERE r= '$qwe[r]'");
            // $cp = $cuentaspof->fetch_assoc();

             $transac = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones= '$qwe[transaccion]'");
                 $tr = $transac->fetch_assoc();
            //     $cp['transaccion']

            if($qwe['idfactura'] != 0){
                //es cliente y se puede obtener del campo cliente directamente 
                // $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                $factura = $this->dbc->query("SELECT * 
                FROM factura 
                WHERE idfactura = '$qwe[idfactura]'");

                $fact = $factura->fetch_assoc();

                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                $cl = $cliente->fetch_assoc();

            }elseif($qwe['idotras_cuentas'] == 0){
                // hacer consulta a la tabla cuentascobrar_grupal y sacar de ahi factura
                $getTabla = $this->dbc->query("SELECT * 
                FROM cuentascobrar_grupal 
                WHERE idfactura = '$qwe[idfactura]'");
$cuentas_cobro_grupal = $getTabla->fetch_assoc();
// while ($ccg = $this->dbc->fetch($getTabla)) {
    $factura = $this->dbc->query("SELECT * 
                FROM factura 
                WHERE idfactura = '$cuentas_cobro_grupal[idfactura]'");
// }
                // $cuentas_cobro_grupal = $getTabla->fetch_assoc();

                $fact = $factura->fetch_assoc();
                
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                $cl = $cliente->fetch_assoc();
            }else{
                // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor

                $otras_cuentas = $this->dbc->query("SELECT * 
                FROM otras_cuentas
                WHERE idotras_cuentas = '$qwe[idotras_cuentas]'");

                $oc = $otras_cuentas->fetch_assoc();

                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$oc[id_cliente_proveedor]'");
                $cl = $cliente->fetch_assoc();
            }

            if($qwe['idotras_cuentas'] != 0){

                $fecha_nueva = date("d/m/Y", strtotime($oc['fecha']));

                $aux_descripcion = "Según documento N° $oc[nro_otras_cuentas] de: $fecha_nueva";
                // $saldo = 0;

                if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA

                    $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                    FROM detalle_caja_bancos_cobrar dc
                    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
                    WHERE dc.idcaja_bancos = '$idcaja_bancos'
                    AND cp.fecha < '$fecha_ini'");
                // $saldo = 0;
                while ($zxc = $this->dbc->fetch($fuera_rango)) {
                    $saldo = $saldo + $zxc['monto'];
                }

                $saldo_inicial = $saldo;
                $saldo = $saldo + $qwe['monto'];
                    $res = array(
                        "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 3,
                        "fecha" => $qwe['fecha'],
                        "idrecibo" => $qwe['idcuentaspof'],
                        "nrecibo" => $qwe['nrecibo'],
                        "nro_documento" => "$oc[nro_otras_cuentas]",
                        "por_concepto_de" => "$oc[concepto]",
                        "idtipo" => "$oc[idtipo]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $cl['id_cliente'],
                        "nombre_cliente" => $cl['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $aux_descripcion,
                        "archivo" => $qwe['archivo'],
                        "ingreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde']
    
                    );

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                $saldo = $saldo + $qwe['monto'];
                $res = array(
                    "fecha_nueva" => $fecha_nueva,
                    "tipo_documento" => 3,
                    "fecha" => $qwe['fecha'],
                    "idrecibo" => $qwe['idcuentaspof'],
                    "nrecibo" => $qwe['nrecibo'],
                    "nro_documento" => "$oc[nro_otras_cuentas]",
                    "por_concepto_de" => "$oc[concepto]",
                    "idtipo" => "$oc[idtipo]",
                    "codigotransaccion" => $tr['codigotransaccion'],
                    "id_cliente" => $cl['id_cliente'],
                    "nombre_cliente" => $cl['nombre'],
                    //descripcion saldra de la factura o otras cuentas 
                    "descripcion" => $aux_descripcion,
                    "archivo" => $qwe['archivo'],
                    "ingreso" => $qwe['monto'],
                    "monto" => $qwe['monto'],
                    "saldo_inicial" => $saldo_inicial,
                    "saldo" => $saldo,
                    "registro_desde" => $qwe['registro_desde']

                );
            }

            }else{
                $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));
                $aux_descripcion = "Según documento N° $fact[nfactura] de: $fecha_nueva";

                 $aux_factura = "cero $fact[nfactura]";
                 $factu = str_replace("cero ", "", $aux_factura);

                 if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA

                    $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                    FROM detalle_caja_bancos_cobrar dc
                    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
                    WHERE dc.idcaja_bancos = '$idcaja_bancos'
                    AND cp.fecha < '$fecha_ini';");
                // $saldo = 0;
                while ($zxc = $this->dbc->fetch($fuera_rango)) {
                    $saldo = $saldo + $zxc['monto'];
                }
                
                $saldo_inicial = $saldo;
                $saldo = $saldo + $qwe['monto'];
                    $res = array(
                        "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 1,
                        "idrecibo" => $qwe['idcuentaspof'],
                        "fecha" => $qwe['fecha'],
                        "nrecibo" => $qwe['nrecibo'],
                        "nro_documento" => "$fact[nfactura]",
                        "por_concepto_de" => "$fact[por_concepto_de]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $cl['id_cliente'],
                        "nombre_cliente" => $cl['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $aux_descripcion,
                        "archivo" => $qwe['archivo'],
                        "ingreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde']
    
                    );

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                $saldo = $saldo + $qwe['monto'];
                $res = array(
                    "fecha_nueva" => $fecha_nueva,
                    "tipo_documento" => 1,
                    "idrecibo" => $qwe['idcuentaspof'],
                    "fecha" => $qwe['fecha'],
                    "nrecibo" => $qwe['nrecibo'],
                    "nro_documento" => "$fact[nfactura]",
                    "codigotransaccion" => $tr['codigotransaccion'],
                    "id_cliente" => $cl['id_cliente'],
                    "nombre_cliente" => $cl['nombre'],
                    //descripcion saldra de la factura o otras cuentas 
                    "descripcion" => $aux_descripcion,
                    "archivo" => $qwe['archivo'],
                    "ingreso" => $qwe['monto'],
                    "monto" => $qwe['monto'],
                    "saldo_inicial" => $saldo_inicial,
                    "saldo" => $saldo,
                    "registro_desde" => $qwe['registro_desde']

                );
            }

                // $res = array(
                //     "fecha" => $qwe['fecha'],
                //     "nrecibo" => $qwe['nrecibo'],
                //     "nro_documento" => $factu,
                //     "codigotransaccion" => $tr['codigotransaccion'],
                //     "nombre_cliente" => $cl['nombre'],
                //     //descripcion saldra de la factura o otras cuentas 
                //     "descripcion" => $aux_descripcion,
                //     "ingreso" => $qwe['monto']
                // );
            }
          
            array_push($lista, $res);
        }
    
    }elseif($tipo_filtro == '2'){// tipo = 2 --> EGRESO
//         ini_set('display_errors', 1);
//         ini_set('display_startup_errors', 1);
//         error_reporting(E_ALL);

        $getPedido = $this->dbc->query("SELECT cp.idcuentaspor,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
        FROM detalle_caja_bancos_pagar dc
        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
        WHERE dc.idcaja_bancos = '$idcaja_bancos'
        AND cp.fecha >= '$fecha_ini'
        AND cp.fecha <= '$fecha_fin'
        ORDER BY cp.fecha ASC
        ");
    
    $aux_contador = 0;
    $saldo = 0;
    $saldo_inicial = 0;
            while ($qwe = $this->dbc->fetch($getPedido)) {
    
                 $transac = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones= '$qwe[transaccion]'");
                     $tr = $transac->fetch_assoc();
                //     $cp['transaccion']
    
                if($qwe['idfactura'] != 0){
                    //es cliente y se puede obtener del campo cliente directamente 
                    // $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                    $factura = $this->dbc->query("SELECT * 
                    FROM factura 
                    WHERE idfactura = '$qwe[idfactura]'");
    
                    $fact = $factura->fetch_assoc();
    
                    $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                    $cl = $cliente->fetch_assoc();
    
                }elseif($qwe['idotras_cuentas'] == 0){
                    // hacer consulta a la tabla cuentascobrar_grupal y sacar de ahi factura
                    $getTabla = $this->dbc->query("SELECT * 
                    FROM cuentaspagar_grupal 
                    WHERE idfactura = '$qwe[idfactura]'");
    $cuentas_cobro_grupal = $getTabla->fetch_assoc();
    // while ($ccg = $this->dbc->fetch($getTabla)) {
        $factura = $this->dbc->query("SELECT * 
                    FROM factura 
                    WHERE idfactura = '$cuentas_cobro_grupal[idfactura]'");
    // }
                    // $cuentas_cobro_grupal = $getTabla->fetch_assoc();
    
                    
    
                    $fact = $factura->fetch_assoc();
                    
                    $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                    $cl = $cliente->fetch_assoc();
                }else{
                    // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
    
                    $otras_cuentas = $this->dbc->query("SELECT * 
                    FROM otras_cuentas
                    WHERE idotras_cuentas = '$qwe[idotras_cuentas]'");
    
                    $oc = $otras_cuentas->fetch_assoc();
    
                    $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$oc[id_cliente_proveedor]'");
                    $cl = $cliente->fetch_assoc();
                }
    
                if($qwe['idotras_cuentas'] != 0){
                    $fecha_nueva = date("d/m/Y", strtotime($oc['fecha']));
                    $aux_descripcion = "Según documento N° $oc[nro_otras_cuentas] de: $fecha_nueva";
                    // $saldo = 0;
    
                    if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA
    
                        $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspor,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                        FROM detalle_caja_bancos_pagar dc
                        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
                        WHERE dc.idcaja_bancos = '$idcaja_bancos'
                        AND cp.fecha < '$fecha_ini'
                        ORDER BY cp.fecha ASC;");
                    // $saldo = 0;
                    while ($zxc = $this->dbc->fetch($fuera_rango)) {
                        $saldo = $saldo + $zxc['monto'];
                    }
                    $saldo_inicial = $saldo;
                    $saldo = $saldo + $qwe['monto'];
                        $res = array(
                            "fecha_nueva" => $fecha_nueva,
                            "tipo_documento" => 4,
                            "idrecibo" => $qwe['idcuentaspor'],
                            "fecha" => $qwe['fecha'],
                            "nrecibo" => $qwe['nrecibo'],
                            "nro_documento" => "$oc[nro_otras_cuentas]",
                            "por_concepto_de" => "$oc[concepto]",
                            "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_cliente'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde']
        
                        );
    
                        //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                        $aux_contador = 1;
                    }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA
    
                    $saldo = $saldo + $qwe['monto'];
                    $res = array(
                        "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 4,
                        "idrecibo" => $qwe['idcuentaspor'],
                        "fecha" => $qwe['fecha'],
                        "nrecibo" => $qwe['nrecibo'],
                        "nro_documento" => "$oc[nro_otras_cuentas]",
                        "idtipo" => "$oc[idtipo]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $cl['id_cliente'],
                        "nombre_cliente" => $cl['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $aux_descripcion,
                        "archivo" => $qwe['archivo'],
                        "egreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde']
    
                    );
                }
    
                }else{
                    $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));
                    $aux_descripcion = "Según documento N° $fact[nfactura] de: $fecha_nueva";
    
                     $aux_factura = "cero $fact[nfactura]";
                     $factu = str_replace("cero ", "", $aux_factura);
    
                     if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA
    
                        $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspor,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                        FROM detalle_caja_bancos_pagar dc
                        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
                        WHERE dc.idcaja_bancos = '$idcaja_bancos'
                        AND cp.fecha < '$fecha_ini';");
                    // $saldo = 0;
                    while ($zxc = $this->dbc->fetch($fuera_rango)) {
                        $saldo = $saldo + $zxc['monto'];
                    }
                    $saldo_inicial = $saldo;
                    $saldo = $saldo + $qwe['monto'];
                        $res = array(
                            "fecha_nueva" => $fecha_nueva,
                            "tipo_documento" => 2,
                            "idrecibo" => $qwe['idcuentaspor'],
                            "fecha" => $qwe['fecha'],
                            "nrecibo" => $qwe['nrecibo'],
                            "nro_documento" => "$fact[nfactura]",
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_cliente'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde']
        
                        );
    
                        //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                        $aux_contador = 1;
                    }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA
    
                    $saldo = $saldo + $qwe['monto'];
                    $res = array(
                        "fecha" => $qwe['fecha'],
                        "tipo_documento" => 2,
                        "idrecibo" => $qwe['idcuentaspor'],
                        "nrecibo" => $qwe['nrecibo'],
                        "nro_documento" => "$fact[nfactura]",
                        "por_concepto_de" => "$fact[por_concepto_de]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $cl['id_cliente'],
                        "nombre_cliente" => $cl['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $aux_descripcion,
                        "archivo" => $qwe['archivo'],
                        "egreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde']
    
                    );
                }
    
                    // $res = array(
                    //     "fecha" => $qwe['fecha'],
                    //     "nrecibo" => $qwe['nrecibo'],
                    //     "nro_documento" => $factu,
                    //     "codigotransaccion" => $tr['codigotransaccion'],
                    //     "nombre_cliente" => $cl['nombre'],
                    //     //descripcion saldra de la factura o otras cuentas 
                    //     "descripcion" => $aux_descripcion,
                    //     "ingreso" => $qwe['monto']
                    // );
                }
              
                array_push($lista, $res);
            }

    }else{// TIPO = 3 --> TODOS 

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $getPedido = $this->dbc->query("SELECT 
            cp.idcuentaspor AS id_cuenta,
            cp.nrecibo, 
            cp.fecha, 
            cp.transaccion, 
            cp.cliente, 
            cp.idfactura, 
            cp.idotras_cuentas, 
            cp.archivo, 
            cp.registro_desde, 
            dc.idcaja_bancos, 
            dc.monto, 
            dc.idfactura,
            'PAGAR' AS tipo
        FROM detalle_caja_bancos_pagar dc
        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
        WHERE dc.idcaja_bancos = '$idcaja_bancos'
        AND cp.fecha BETWEEN '$fecha_ini' AND '$fecha_fin'

        UNION

        SELECT 
            cp.idcuentaspof AS id_cuenta,
            cp.nrecibo, 
            cp.fecha,
            cp.transaccion, 
            cp.cliente, 
            cp.idfactura, 
            cp.idotras_cuentas, 
            cp.archivo,
            cp.registro_desde, 
            dc.idcaja_bancos, 
            dc.monto, 
            dc.idfactura,
            'COBRAR' AS tipo
        FROM detalle_caja_bancos_cobrar dc
        INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
        WHERE dc.idcaja_bancos = '$idcaja_bancos'
        AND cp.fecha BETWEEN '$fecha_ini' AND '$fecha_fin'

        ORDER BY fecha ASC, nrecibo ASC;");
    
    $aux_contador = 0;
    $saldo = 0;
    $saldo_inicial = 0;
            while ($qwe = $this->dbc->fetch($getPedido)) {
    
                 $transac = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones= '$qwe[transaccion]'");
                     $tr = $transac->fetch_assoc();
                     
                //     $cp['transaccion']
    
                if($qwe['tipo'] == 'COBRAR'){

                    if($qwe['idfactura'] != 0){
                        //es cliente y se puede obtener del campo cliente directamente 
                        // $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                        $factura = $this->dbc->query("SELECT * 
                        FROM factura 
                        WHERE idfactura = '$qwe[idfactura]'");
        
                        $fact = $factura->fetch_assoc();
        
                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $cliente->fetch_assoc();
        
                    }elseif($qwe['idotras_cuentas'] == 0){
                        // hacer consulta a la tabla cuentascobrar_grupal y sacar de ahi factura
                        $getTabla = $this->dbc->query("SELECT * 
                        FROM cuentascobrar_grupal 
                        WHERE idfactura = '$qwe[idfactura]'");
        $cuentas_cobro_grupal = $getTabla->fetch_assoc();
        // while ($ccg = $this->dbc->fetch($getTabla)) {
            $factura = $this->dbc->query("SELECT * 
                        FROM factura 
                        WHERE idfactura = '$cuentas_cobro_grupal[idfactura]'");
        // }
                        // $cuentas_cobro_grupal = $getTabla->fetch_assoc();
        
                        
        
                        $fact = $factura->fetch_assoc();
                        
                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $cliente->fetch_assoc();
                    }else{
                        // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
        
                        $otras_cuentas = $this->dbc->query("SELECT * 
                        FROM otras_cuentas
                        WHERE idotras_cuentas = '$qwe[idotras_cuentas]'");
        
                        $oc = $otras_cuentas->fetch_assoc();
        
                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$oc[id_cliente_proveedor]'");
                        $cl = $cliente->fetch_assoc();
                    }

                }else{// PAGAR
                    
                    if($qwe['idfactura'] != 0){
                        //es cliente y se puede obtener del campo cliente directamente 
                        // $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                        $factura = $this->dbc->query("SELECT * 
                        FROM factura 
                        WHERE idfactura = '$qwe[idfactura]'");
        
                        $fact = $factura->fetch_assoc();
        
                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $proveedor->fetch_assoc();
        
                    }elseif($qwe['idotras_cuentas'] == 0){
                        // hacer consulta a la tabla cuentascobrar_grupal y sacar de ahi factura
                        $getTabla = $this->dbc->query("SELECT * 
                        FROM cuentaspagar_grupal 
                        WHERE idfactura = '$qwe[idfactura]'");
        $cuentas_pago_grupal = $getTabla->fetch_assoc();
        // while ($ccg = $this->dbc->fetch($getTabla)) {
            $factura = $this->dbc->query("SELECT * 
                        FROM factura 
                        WHERE idfactura = '$cuentas_pago_grupal[idfactura]'");
        // }
                        // $cuentas_cobro_grupal = $getTabla->fetch_assoc();
        
                        
        
                        $fact = $factura->fetch_assoc();
                        
                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $proveedor->fetch_assoc();
                    }else{
                        // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
        
                        $otras_cuentas = $this->dbc->query("SELECT * 
                        FROM otras_cuentas
                        WHERE idotras_cuentas = '$qwe[idotras_cuentas]'");
        
                        $oc = $otras_cuentas->fetch_assoc();
        
                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$oc[id_cliente_proveedor]'");
                        $cl = $proveedor->fetch_assoc();
                    }

                } //FIN DEL ELSE DE PAGAR
                //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA

                    $fuera_rango = $this->dbc->query("SELECT 
                cp.idcuentaspof AS id_cuenta,
                cp.nrecibo, 
                cp.fecha,
                cp.transaccion, 
                cp.cliente, 
                cp.idfactura, 
                cp.idotras_cuentas, 
                cp.archivo, 
                dc.idcaja_bancos, 
                dc.monto, 
                dc.idfactura,
                'COBRAR' AS tipo
            FROM detalle_caja_bancos_cobrar dc
            INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
            WHERE dc.idcaja_bancos = '$idcaja_bancos'
            AND cp.fecha < '$fecha_ini'

            UNION

            SELECT 
                cp.idcuentaspor AS id_cuenta,
                cp.nrecibo, 
                cp.fecha, 
                cp.transaccion, 
                cp.cliente, 
                cp.idfactura, 
                cp.idotras_cuentas, 
                cp.archivo, 
                dc.idcaja_bancos, 
                dc.monto, 
                dc.idfactura,
                'PAGAR' AS tipo
            FROM detalle_caja_bancos_pagar dc
            INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
            WHERE dc.idcaja_bancos = '$idcaja_bancos'
            AND cp.fecha < '$fecha_ini'

            ORDER BY fecha ASC, nrecibo ASC;");
                // $saldo = 0;
                while ($zxc = $this->dbc->fetch($fuera_rango)) {
                    if($zxc['tipo'] == 'COBRAR'){
                        $saldo = $saldo + $zxc['monto'];
                    }else{
                        $saldo = $saldo - $zxc['monto'];
                    }
                    
                }
                $saldo_inicial = $saldo;
                // $saldo = $saldo + $qwe['monto'];

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                // $saldo = $saldo + $qwe['monto'];
     
            }
                //----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                if($qwe['tipo'] == 'COBRAR'){

                    $saldo = $saldo + $qwe['monto'];

                    if($qwe['idotras_cuentas'] != 0){
                        //Según documento N° 11 de 24/04/2025
                        $fecha_nueva = date("d/m/Y", strtotime($oc['fecha']));
                        $aux_descripcion = "Según documento N° $oc[nro_otras_cuentas] de: $fecha_nueva";
                        
                        // if($zxc['tipo'] == 'COBRAR'){
                        //     $saldo = $saldo + $zxc['monto'];
                        // }else{
                        //     $saldo = $saldo - $zxc['monto'];
                        // }
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 3,
                            "idrecibo" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "nro_documento" => "$oc[nro_otras_cuentas]",
                            "por_concepto_de" => "$oc[concepto]",
                            "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_cliente'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "ingreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde']
                        );
                    }else{
                        $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));

                        $aux_descripcion = "Según documento N° $fact[nfactura] de: $fecha_nueva";
        
                         $aux_factura = "cero $fact[nfactura]";
                         $factu = str_replace("cero ", "", $aux_factura);
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 1,
                            "idrecibo" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "nro_documento" => $factu,
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_cliente'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "ingreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde']
                        );
                    }
                }else{

                    $saldo = $saldo - $qwe['monto'];

                    if($qwe['idotras_cuentas'] != 0){
                        $fecha_nueva = date("d/m/Y", strtotime($oc['fecha']));
                        $aux_descripcion = "Según documento N° $oc[nro_otras_cuentas] de: $fecha_nueva";
        
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 4,
                            "idrecibo" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "nro_documento" => "$oc[nro_otras_cuentas]",
                            "por_concepto_de" => "$oc[concepto]",
                            "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_proveedor'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde']
                        );
                    }else{
                        $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));

                        $aux_descripcion = "Según documento N° $fact[nfactura] de: $fecha_nueva";
        
                         $aux_factura = "cero $fact[nfactura]";
                         $factu = str_replace("cero ", "", $aux_factura);
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 2,
                            "idrecibo" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "nro_documento" => $factu,
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_proveedor'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde']
                        );
                    }
                }
                
              
                array_push($lista, $res);
            }

    }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
    public function getidsucursal($md5)
    {
        $registro = $this->dbe->query("select * from sucursalcontable where md5(idsucursalcontable)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }

    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']);
        return $qwe['idgestion'];
    }

    public function registrar_caja_bancos_usuarios($idcaja_bancos,$idusuario,$funcion,$permiso_registrar,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM caja_banco_usuarios WHERE idcaja_bancos = '$idcaja_bancos' AND idusuario = '$idusuario'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO caja_banco_usuarios(idcaja_bancos,idusuario,funcion,permiso_registrar,idempresa) VALUES ('$idcaja_bancos','$idusuario','$funcion','$permiso_registrar','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }

    public function listar_usuarios($empresa){
        $lista = [];
        $ide = $this->getidempresa($empresa);
        // $registro=$this->dbrh->query("SELECT * FROM usuario WHERE md5(idusuario)='$md5'");
        // $qwe=$this->dbrh->fetch($registro);
        // $registro2=$this->dbrh->query("SELECT * FROM usuario WHERE idusuario = '$qwe[idusuario]'");

        

        $registro2=$this->dbrh->query("SELECT u.idusuario,u.nombre AS usuario_nombre, t.nombre AS nombre_trabajador, t.apellido, t.ci 
            FROM usuario AS u 
            INNER JOIN trabajador AS t ON t.idtrabajador = u.trabajador_idtrabajador
            WHERE u.idempresa = '$ide'");
        while ($bb = $this->dbc->fetch($registro2)) {

            $res = array(
                "idusuario" => $bb['idusuario'],
                "nombre_usuario" => $bb['usuario_nombre'],
                "nombre_trabajador" => $bb['nombre_trabajador']
            );
            array_push($lista, $res);
        }
        // $qwe=$this->dbrh->fetch($registro2);
        // return $qwe['idusuario'];
        echo json_encode($lista, JSON_NUMERIC_CHECK);

    }  
    public function listar_caja_bancos_usuarios($id){
        $lista = [];

        $registro2=$this->dbc->query("SELECT * FROM caja_banco_usuarios WHERE idcaja_bancos = '$id'");

        while ($bb = $this->dbc->fetch($registro2)) {

            $trabajador=$this->dbrh->query("SELECT u.nombre AS usuario_nombre, t.nombre AS nombre_trabajador, t.apellido, t.ci 
            FROM usuario AS u 
            INNER JOIN trabajador AS t ON t.idtrabajador = u.trabajador_idtrabajador
            WHERE u.idusuario = '$bb[idusuario]'");

            $traba = $trabajador->fetch_assoc();
            
            $registro3=$this->dbrh->query("SELECT * FROM usuario WHERE idusuario = '$bb[idusuario]'");
            $usuario = $registro3->fetch_assoc();
            $res = array(
                "idcaja_banco_usuarios" => $bb['idcaja_banco_usuarios'],
                "idcaja_bancos" => $bb['idcaja_bancos'],
                "idusuario" => $bb['idusuario'],
                "nombre_usuario" => $usuario['nombre'],
                "nombre_trabajador" => $traba['nombre_trabajador']." ".$traba['apellido'],
                "ci" => $traba['ci'],
                "funcion" => $bb['funcion'],
                "permiso_registrar" => $bb['permiso_registrar']
                
            );
            array_push($lista, $res);
        }
        // $qwe=$this->dbrh->fetch($registro2);
        // return $qwe['idusuario'];
        echo json_encode($lista, JSON_NUMERIC_CHECK);

    }  

    public function eliminar_caja_bancos_usuario($id){

            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("DELETE FROM caja_banco_usuarios WHERE idcaja_banco_usuarios = '$id'");
            if ($registroProveedor === TRUE) {                                                                                                                                                    
                $res = array("success", "se elimino exitosamente","eliminar_caja_bancos_usuario");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        
        echo json_encode($res);
    }

    public function editar_caja_bancos_facturas($idrecibo,$tipo_documento,$fecha,$monto,$por_concepto_de,$cliente_prov){
        $res="";
        //tipo_documento = 1,2 facturas --> cobrar- pagar
        if($tipo_documento == 1){//COBRAR   
            $recibo_grupal = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idcuentaspof = '$idrecibo'");
            if ($recibo_grupal->num_rows > 0) {
                //es grupal, no se podra editar
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

            }else{
                //SE EDITARA FACTURA Y RECIBO
                $cuentaspof = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");
                $resu = $this->dbc->fetch($cuentaspof);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idrecibo'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_cobrar SET monto='$monto' WHERE idcuentaspof='$idrecibo'");

                }else{
                    //no se edita detalle_cajaBancos
                }

                $edicion_recibo=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha',monto='$monto' WHERE idcuentaspof='$idrecibo'");

                $edicion_factura=$this->dbc->query("UPDATE factura SET fecha='$fecha',montofactura='$monto',por_concepto_de='$por_concepto_de',proveedorcliente_idproveedorcliente='$cliente_prov' WHERE idfactura='$resu[idfactura]'");

            }
        }else{ //PAGAR  2
            $recibo_grupal = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idcuentaspor = '$idrecibo'");
            if ($recibo_grupal->num_rows > 0) {
                //es grupal, no se podra editar
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

            }else{
                //SE EDITARA FACTURA Y RECIBO

                $cuentaspor = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idrecibo'");
                $resu = $this->dbc->fetch($cuentaspor);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$idrecibo'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_pagar SET monto='$monto' WHERE idcuentaspor='$idrecibo'");

                }else{
                    //no se edita detalle_cajaBancos
                }

                $edicion_recibo=$this->dbc->query("UPDATE cuentaspor SET fecha='$fecha',monto='$monto' WHERE idcuentaspor='$idrecibo'");

                $edicion_factura=$this->dbc->query("UPDATE factura SET fecha='$fecha',montofactura='$monto',por_concepto_de='$por_concepto_de',proveedorcliente_idproveedorcliente='$cliente_prov' WHERE idfactura='$resu[idfactura]'");

            }
        }

        if($edicion_factura===TRUE){
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal");
        }else{
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
    }

    public function editar_caja_bancos_otras_cuentas($idrecibo,$tipo_documento,$fecha,$tipo,$precio,$concepto,$cliente_prov){
       
        $res="";
        //tipo_documento = 1,2 facturas --> cobrar- pagar
        if($tipo_documento == 1){//COBRAR   
            $recibo_grupal = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idcuentaspof = '$idrecibo'");
            if ($recibo_grupal->num_rows > 0) {
                //es grupal, no se podra editar
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

            }else{
                //SE EDITARA FACTURA Y RECIBO
                $cuentaspof = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");
                $resu = $this->dbc->fetch($cuentaspof);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idrecibo'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_cobrar SET monto='$precio' WHERE idcuentaspof='$idrecibo'");

                }else{
                    //no se edita detalle_cajaBancos
                }

                $edicion_recibo=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha',monto='$precio' WHERE idcuentaspof='$idrecibo'");

                $edicion_factura=$this->dbc->query("UPDATE otras_cuentas SET fecha='$fecha',precio='$precio',concepto='$concepto',idtipo='$tipo',id_cliente_proveedor='$cliente_prov' WHERE idotras_cuentas='$resu[idotras_cuentas]'");

            }
        }else{ //PAGAR  2
            $recibo_grupal = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idcuentaspor = '$idrecibo'");
            if ($recibo_grupal->num_rows > 0) {
                //es grupal, no se podra editar
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

            }else{
                //SE EDITARA FACTURA Y RECIBO
                $cuentaspor = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idrecibo'");
                $resu = $this->dbc->fetch($cuentaspor);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$idrecibo'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_pagar SET monto='$precio' WHERE idcuentaspor='$idrecibo'");

                }else{
                    //no se edita detalle_cajaBancos
                }
                $edicion_recibo=$this->dbc->query("UPDATE cuentaspor SET fecha='$fecha',monto='$precio' WHERE idcuentaspor='$idrecibo'");

                $edicion_factura=$this->dbc->query("UPDATE otras_cuentas SET fecha='$fecha',precio='$precio',concepto='$concepto',idtipo='$tipo',id_cliente_proveedor='$cliente_prov' WHERE idotras_cuentas='$resu[idotras_cuentas]'");

            }
        }

        if($edicion_factura===TRUE){
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal");
        }else{
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
        // echo json_encode(array($idrecibo,$tipo_documento,$fecha,$tipo,$precio,$concepto,$cliente_prov));

        // $idrecibo,$tipo_documento,$fecha,$tipo,$precio,$concepto,$cliente_prov
    }

    public function usuario_con_permiso_registrar_transaccion($idcaja_bancos,$usuario){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idusuario = $this->getidusuario($usuario);

        $caja_bancos_usuarios=$this->dbc->query("SELECT * FROM caja_banco_usuarios WHERE idcaja_bancos = '$idcaja_bancos'");
        
        while ($bb = $this->dbc->fetch($caja_bancos_usuarios)) {

            if($idusuario == $bb['idusuario']){

                $res = array(
                "idusuario" => $bb['idusuario'],
                "funcion" => $bb['funcion'],
                "permiso_registrar" => $bb['permiso_registrar']    
                );
                array_push($lista, $res);

            }else{
            // solo saltara al siguiente
            }
        }
        // $qwe=$this->dbrh->fetch($registro2);
        // return $qwe['idusuario'];
        echo json_encode($lista, JSON_NUMERIC_CHECK);
        // echo json_encode(array);
    }  

    public function getidusuario($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['idusuario'];

    }    
    // listar_recibo_por_caja_bancos array

}
?>