<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Factura_comercial extends DB{
    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); listapagarfactura
        return $qwe['idgestion'];
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
    public function registrar_factura_cobros_tributario($por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar, $espesificacion,$trans, $cliente, $empresa,   $cuenta,  $sucursal,$asiento,$idcajas_bancos)
    {

        $idempresa = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal); 
        $gestion = $this->getgestionactualid($idempresa);
    
        $res = "";

        $caja_bancos = json_decode($idcajas_bancos, true);

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
    
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$cliente'");
        $clientSelect = $cl->fetch_assoc();

        if($cobro == '1'){
            // NO SE CREARAN RECIBOS

              // Insertar en transacciones
        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_cobrado');");
  
        }elseif($trans > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_cobrado');");

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
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
        VALUES ('$nroTransaccion', '$fecha', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tipotransaccion', '$idempresa', '$idsucursal', '$gestion')");
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
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_cobrado');");

        }
        }else{
            // SE CREARAN RECIBOS
                       // Insertar en transacciones
        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'tributario_cobrado')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'tributario_cobrado')");

            $idrecibo = $this->dbc->insert_id;
        }else{
            // Obtener el número de transacción más reciente y sumar 1
        $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$idempresa AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado12 = $nroTrans->fetch_assoc();
        $nroTransaccion = $resultado12['codigotransaccion'] + 1;

        //el asiento es diferente a cero, se debe crear una transaccion
        $idAsientoTipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asiento' AND idorganizacion='$idempresa';");
        $asiento_aux2 = $idAsientoTipo->fetch_assoc();  // Cambiado $nroTrans->fetch_assoc() a $idAsientoTipo->fetch_assoc()
        $tipotransaccion = $asiento_aux2['tipo'];
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
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_cobrado');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$idtrans','0',NULL,'tributario_cobrado')");

        $idrecibo = $this->dbc->insert_id;
        }

        foreach($caja_bancos as $cajaBanco){
            $regis_caja_banco = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
            VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','0')");
        }
        }
    
        // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    public function listar_factura_comercial($idmd5)
    {
        // $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $idempresa = $this->getidempresa($idmd5);
        $lista = [];

        $listaFactura = [];
        $trans_fact = $this->dbc->query("SELECT idfactura_comercial FROM transaccion_factura_comercial WHERE idempresa = '$idempresa'");
        while ($zxc = $this->dbc->fetch($trans_fact)) {
            // $listaFactura = $zxc['idfactura_comercial'];
            array_push($listaFactura,$zxc['idfactura_comercial']);
        }

        $facturas = implode(", ", $listaFactura);

        $clien = $this->dbcm->query("SELECT v.id_venta, a.nombre, v.fecha_venta, c.nombre , c.nombrecomercial, c.ciudad, v.tipo_venta, v.tipo_pago, v.monto_total, v.nfactura, v.descuento, pa.almacen_id_almacen, v.cliente_id_cliente1, s.nombre, v.estado, ca.canal, vf.cuf, vf.fechaEmission, vf.shortLink, vf.urlSin,ec.estado as estado_cobro,ec.saldo FROM venta v 
        LEFT JOIN cliente c ON v.cliente_id_cliente1=c.id_cliente
        LEFT JOIN detalle_venta dv ON v.id_venta=dv.venta_id_venta
        LEFT JOIN sucursal s ON v.idsucursal=s.id_sucursal
        LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN almacen a ON pa.almacen_id_almacen=a.id_almacen
        LEFT JOIN canalventa ca ON v.idcanal=ca.idcanalventa
        LEFT JOIN ventas_facturadas vf ON v.id_venta=vf.venta_id_venta
        LEFT JOIN estado_cobro ec ON ec.venta_id_venta = v.id_venta
        WHERE c.idempresa = '$idempresa' AND v.id_venta NOT IN ($facturas)
        GROUP BY v.id_venta
        ORDER BY v.fecha_venta DESC, v.id_venta DESC");
        while ($qwe = $this->dbcm->fetch($clien)) {
            $res = array("id" => $qwe[0], "almacen" => $qwe[1], "fechaventa" => $qwe[2], "cliente" => $qwe[3], "nombrecomercial" => $qwe[4], "ciudad" => $qwe[5], "tipoventa" => $qwe[6], "tipopago" => $qwe[7], "montototal" => $qwe[8], "nfactura" => $qwe[9], "descuento" => $qwe[10], "idalmacen" => $qwe[11], "idcliente" => $qwe[12], "sucursal" => $qwe[13], "estado" => $qwe[14], "canal" => $qwe[15], "cuf" => $qwe[16], "fechaemision" => $qwe[17], "shortlink" => $qwe[18], "urlsin" => $qwe[19],"estado_cobro" => $qwe[20],"saldo" => $qwe[21]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    
      public function cobro_asignacion_factura_comercial($fecha,$monto_total,$monto_recibo,$idtransaccion,$idcaja_bancos,$idasientotipo,$idempresa,$idsucursal,$data)
    {  
        $caja_bancos = json_decode($idcaja_bancos, true);
        $facturas = json_decode($data, true);

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        // echo json_encode(array($fecha,$monto,$idtransaccion,$idcaja_bancos,$idasientotipo,$idempresa,$idsucursal,$data,$caja_bancos,$facturas));

        $ide = $this->getidempresa($idempresa);
        $sucursal = $this->getidsucursal($idsucursal); 
        $gestion = $this->getgestionactualid($ide);
        
        $recibo_trans = $this->dbc->query("SELECT count(*) AS cant1 FROM cuentaspof cp 
        INNER JOIN transacciones t ON t.idtransacciones=cp.transaccion 
        WHERE t.organizacion_idorganizacion='$ide'");
        $res1 = $recibo_trans->fetch_assoc();

        $recibo_fact = $this->dbc->query("SELECT count(*) AS cant2 FROM cuentaspof cp
            INNER JOIN factura f ON f.idfactura=cp.idfactura
            WHERE f.idorganizacion='$ide' AND cp.transaccion = '0'");
        $res2 = $recibo_fact->fetch_assoc();

        $recibo_oc = $this->dbc->query("SELECT count(*) AS cant3 FROM cuentaspof cp
        INNER JOIN otras_cuentas oc ON oc.idotras_cuentas=cp.idotras_cuentas
        WHERE oc.idempresa='$ide' and cp.transaccion ='0'");
        $res3 = $recibo_oc->fetch_assoc();

        $nrecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;

// Obtener el número de transacción más reciente y sumar 1  emp
$nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion = $ide AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
$resultado12 = $nroTrans->fetch_assoc();
$nroTransaccion = $resultado12['codigotransaccion'] + 1;

        $res = "";
        $glosa = "Registro cobro comercial '$nrecibo'";
        // $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";
        // $glosa2 = $this->dbc->real_escape_string($glosa);
        // $fecha2 = $this->dbc->real_escape_string($fecha);
        // $nrecibo2 = $this->dbc->real_escape_string($nrecibo);
        // $fecha2 = $this->dbc->real_escape_string($fecha);
        if ($idasientotipo != "") {
            $glosa2 = $this->dbc->real_escape_string($glosa);
            $fecha2 = $this->dbc->real_escape_string($fecha);
            $nroTransaccion2 = $this->dbc->real_escape_string($nroTransaccion);

        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion2', '$fecha2', '1', '0', '$glosa2', '1','1', '$tipotransaccion', '$ide', '$sucursal', '$gestion')");
    
        // Obtener el ID del registro recién insertado
        $idtrans = $this->dbc->insert_id;
            //$detallepago

            $debe = 0;
            $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$idasientotipo'");
            $orden = 1;
            while ($qwe = $this->dbc->fetch($tasiento)) {
                $pcuenta = $qwe['idcuenta'];
                if ($qwe['tipo'] == "DEBE") {
                    $debe = $monto_total * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $monto_total * ($qwe['porciento'] / 100);
                }
                //$pcuenta=$_POST['plandecuenta'];
                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                $nota = "-";
                $estado = 1; //$_POST['estado'];
                // $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal) VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal')");
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)VALUES('$debe','$haber','$nota','$idtrans','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$sucursal','$orden')");
                
                $orden = $orden + 1;
            }
        } else {
            $idtrans = $idtransaccion;
        }

        //-----------------------------------------------------------------------------------------------------------

        $aux_cont = 0;
        foreach($facturas as $factura){

           $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_factura_comercial(idfactura_comercial,idtransaccion,idempresa)VALUES('$factura[idfactura]','$idtrans','$ide')");

            if($factura['saldo'] > 0){

                 if($aux_cont < 1){ //ENTRA POR PRIMERA VEZ DESPUES NUNCA MAS ENTRA

                 $registropago = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
                VALUES(NULL,'$nrecibo','$fecha','varios clientes','persona_comercial','1111','$monto_recibo','0','$idtrans','0',NULL)");
                
                $idcuentaspof = $this->dbc->insert_id;
                    $aux_cont++;
                }

                $cobras = $this->dbc->query("SELECT SUM(monto) AS montoSuma FROM cuentaspof WHERE idfactura='$factura[idfactura]'"); //173
                // $asd = $this->dbc->fetch($cobras);
                $asd = $cobras->fetch_assoc();
                if($asd['montoSuma'] == NULL){
                    $registrarTabla = $this->dbc->query("INSERT INTO cuentascobrar_grupal(idcuentaspof,idfactura,monto)VALUES('$idcuentaspof','$factura[idfactura]','$factura[saldo]')");
                
                }else{
                    $montoSuma = $asd['montoSuma'];
                    $montoCobrado = $factura['saldo'] - $montoSuma;
                    $registrarTabla = $this->dbc->query("INSERT INTO cuentascobrar_grupal(idcuentaspof,idfactura,monto)VALUES('$idcuentaspof','$factura[idfactura]','$montoCobrado')");
                }
                
                $lista_estadoCobro = $this->dbcm->query("SELECT * FROM estado_cobro WHERE venta_id_venta = '$factura[idfactura]'");
                $cuota = $lista_estadoCobro->fetch_assoc();   

                $lista_detalleCobro = $this->dbcm->query("SELECT SUM(ncuotas) AS nro_cuotas FROM detalle_cobro WHERE estado_cobro_id_estado_cobro = '$cuota[id_estado_cobro]'");
                $cuota_sum = $lista_detalleCobro->fetch_assoc();     

                $cuotas_faltantes = $cuota['Ncuotas'] - $cuota_sum['nro_cuotas'];

                $monto_cuotas = $cuota['valorcuotas'] * $cuotas_faltantes;
                $regis_det_cobr = $this->dbcm->query("INSERT INTO detalle_cobro(fecha_actual,ncuotas,valor_cuotas,monto,estado_cobro_id_estado_cobro)VALUES('$fecha','$cuotas_faltantes','0','$monto_cuotas','$cuota[id_estado_cobro]')");

                $update_estado_cobro = $this->dbcm->query("UPDATE estado_cobro SET saldo = '0', estado = '2' WHERE venta_id_venta = '$factura[idfactura]'");

            }else{
                //  NO HACE NADA
            }
            
        }
        if(empty($caja_bancos)){
            //EL ARREGLO CAJA_BANCOS ESTA VACIO
        }else{

            foreach($caja_bancos as $cajaBanco){

            $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura)
            VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','$cajaBanco[idfactura]')");
             
            }
        }
       
        if ($registrar_fact_trans === TRUE) {
            $res = array("success", "Registro Realizado", "registrocobrarfacturaGrupal");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }

        echo json_encode($res);
    }

      public function listar_factura_comercial_con_transaccion($idmd5)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $idempresa = $this->getidempresa($idmd5);
        $lista = [];

        $listaFactura = [];
        $trans_fact = $this->dbc->query("SELECT idfactura_comercial FROM transaccion_factura_comercial WHERE idempresa = '$idempresa'");
        while ($zxc = $this->dbc->fetch($trans_fact)) {
            // $listaFactura = $zxc['idfactura_comercial'];
            array_push($listaFactura,$zxc['idfactura_comercial']);
        }

        $facturas = implode(", ", $listaFactura);

        $clien = $this->dbcm->query("SELECT 
    v.id_venta, 
    MAX(a.nombre) AS nombre_almacen, 
    v.fecha_venta, 
    MAX(c.nombre) AS nombre_cliente, 
    MAX(c.nombrecomercial) AS nombre_comercial, 
    MAX(c.ciudad) AS ciudad, 
    v.tipo_venta, 
    v.tipo_pago, 
    v.monto_total, 
    v.nfactura, 
    v.descuento, 
    MAX(pa.almacen_id_almacen) AS almacen_id, 
    v.cliente_id_cliente1, 
    MAX(s.nombre) AS nombre_sucursal, 
    v.estado, 
    MAX(ca.canal) AS canal_venta, 
    MAX(vf.cuf) AS cuf, 
    MAX(vf.fechaEmission) AS fecha_emision, 
    MAX(vf.shortLink) AS enlace_corto, 
    MAX(vf.urlSin) AS url_sin, 
    MAX(ec.estado) AS estado_cobro, 
    MAX(ec.saldo) AS saldo
FROM venta v  
    LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
    LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta 
    LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal 
    LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
    LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen 
    LEFT JOIN canalventa ca ON v.idcanal = ca.idcanalventa 
    LEFT JOIN ventas_facturadas vf ON v.id_venta = vf.venta_id_venta 
    LEFT JOIN estado_cobro ec ON ec.venta_id_venta = v.id_venta 
WHERE v.id_venta IN ($facturas) 
GROUP BY v.id_venta 
ORDER BY v.fecha_venta DESC, v.id_venta DESC;
");

 $i = 0;
        while ($qwe = $this->dbcm->fetch($clien)) {
                    
            $trans_fact_aux = $this->dbc->query("SELECT * FROM transaccion_factura_comercial WHERE idfactura_comercial = '$listaFactura[$i]'");
            $trans_id = $trans_fact_aux->fetch_assoc();

            $transaccion = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$trans_id[idtransaccion]'");
            $trans_codigo = $transaccion->fetch_assoc();

            $res = array("id" => $qwe[0], "almacen" => $qwe[1], "fechaventa" => $qwe[2], "cliente" => $qwe[3], "nombrecomercial" => $qwe[4], "ciudad" => $qwe[5], "tipoventa" => $qwe[6], "tipopago" => $qwe[7], "montototal" => $qwe[8], "nfactura" => $qwe[9], "descuento" => $qwe[10], "idalmacen" => $qwe[11], "idcliente" => $qwe[12], "sucursal" => $qwe[13], "estado" => $qwe[14], "canal" => $qwe[15], "cuf" => $qwe[16], "fechaemision" => $qwe[17], "shortlink" => $qwe[18], "urlsin" => $qwe[19],"estado_cobro" => $qwe[20],"saldo" => $qwe[21],"codigotransaccion" => $trans_codigo['codigotransaccion']);
            array_push($lista, $res);
            $i++;
        }
        echo json_encode($lista);
    }
}