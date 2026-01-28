<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Factura_cobros extends DB{
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
    public function registrar_factura_cobros_tributario($por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$tipo_factura,$clasefactura,$cobro, $pagar, $espesificacion,$trans, $cliente, $empresa,   $cuenta,  $sucursal,$asiento,$idcajas_bancos,$zn)
    {

        $idempresa = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal); 
        $gestion = $this->getgestionactualid($idempresa);
    
        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        $res = "";
        if($idcajas_bancos == ""){
            //saltar          
        }else{
            $caja_bancos = json_decode($idcajas_bancos, true);  
        }

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

        if($cobro == '1'){ // FACTURAS POR COBRAR
            // NO SE CREARAN RECIBOS

              // Insertar en transacciones
        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','tributario_x_cobrar');");
  
        }elseif($trans > 0 && $asiento == ""){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            // VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_x_cobrar');");

            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                //
                $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
                VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','tributario_x_cobrar');");
            
            }else{// SE ASIGNARA CUENTA MAS 
                
                $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
                VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_x_cobrar');");
            

                $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$cuenta'");
                $dt = $detalle_trans->fetch_assoc();

                // $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
                // $dt = $detalle_trans->fetch_assoc();

                if($tipo_cuenta == 'suma'){ // SUMAR
                    
                    if($dt['debe'] > 0){
                        $nuevo_monto_dt = $dt['debe'] + $monto;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }else{
                        $nuevo_monto_dt = $dt['haber'] + $monto;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }
                }elseif($tipo_cuenta == 'reemplazo'){ // REEMPLAZAR
                    if($dt['debe'] > 0){
                        $nuevo_monto_dt = $monto;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }else{
                        $nuevo_monto_dt = $monto;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }
                }else{ // SOLO VINCULA NO PASA NADA

                }
            }
        }else{ //SE CREARA UN NUEVO ASIENTO MODELO
            
        // Construir rango dinámico (primer y último día del mes)
            $fecha_inicio = date("Y-m-01", strtotime($fecha_transaccion)); // "2025-03-01"
            $fecha_fin    = date("Y-m-t", strtotime($fecha_transaccion));  // "2025-03-31"

            $asiento_tipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asiento'");
            $at = $asiento_tipo->fetch_assoc();

            $tipo_trans = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='$at[tipo]'");
            $tt = $tipo_trans->fetch_assoc();

            $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$gestion'");
            $gc = $gestion_sel->fetch_assoc();

            if($gc['formato_transaccion'] == 'por_tipo_mes') {
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones
                WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
                AND idgestion = '$gestion'
                AND organizacion_idorganizacion = '$idempresa'
                ORDER BY codigotransaccion DESC
                LIMIT 1
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                    AND idgestion = '$gestion'
                    AND organizacion_idorganizacion = '$idempresa'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE organizacion_idorganizacion = '$idempresa'
                    AND idgestion = '$gestion'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;


        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
        VALUES ('$nroTransaccion', '$fecha', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
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
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
        VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_x_cobrar');");

        }
        }else{ // FACTURAS COBRADOS
            // SE CREARAN RECIBOS
                       // Insertar en transacciones
        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_cobrado');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'tributario_cobrado')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == ""){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_cobrado');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'tributario_cobrado')");

            $idrecibo = $this->dbc->insert_id;
        }else{
            
            // Construir rango dinámico (primer y último día del mes)
            $fecha_inicio = date("Y-m-01", strtotime($fecha)); // "2025-03-01"
            $fecha_fin    = date("Y-m-t", strtotime($fecha));  // "2025-03-31"

            $asiento_tipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asiento'");
            $at = $asiento_tipo->fetch_assoc();

            $tipo_trans = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='$at[tipo]'");
            $tt = $tipo_trans->fetch_assoc();

            $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$gestion'");
            $gc = $gestion_sel->fetch_assoc();

            if($gc['formato_transaccion'] == 'por_tipo_mes') {
                $nroTransa = $this->dbc->query("
                    SELECT COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones
                WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
                AND idgestion = '$gestion'
                AND organizacion_idorganizacion = '$idempresa'
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("
                    SELECT COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                    AND idgestion = '$gestion'
                    AND organizacion_idorganizacion = '$idempresa'
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("
                    SELECT COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE organizacion_idorganizacion = '$idempresa'
                    AND idgestion = '$gestion'
                ");
            }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['siguiente'];

        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
        VALUES ('$nroTransaccion', '$fecha', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
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
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
        VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_cobrado');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$idtrans','0',NULL,'tributario_cobrado')");

        $idrecibo = $this->dbc->insert_id;
        }

            if($idcajas_bancos == ""){
                //NO REGISTRARA CAJA_BANCOS PORQ EL USUARIO NO TIENE NINGUN CAJA_BANCO
            }else{ //SI TIENE CAJA_BANCOS ENTONCES REGISTRAMOS
                foreach($caja_bancos as $cajaBanco){
                $regis_caja_banco = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','0')");
            }
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

    public function registrar_factura_cobros_transaccion($idcajas_bancos,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$tipo_factura, $espesificacion, $cliente, $cobro, $pagar, $trans, $clasefactura, $cuenta, $empresa, $sucursal,$por_concepto_de,$zn)
    {
        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        if($idcajas_bancos == ""){
            //saltar          
        }else{
            $caja_bancos = json_decode($idcajas_bancos, true);  
        }

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

        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        
        if($cobro == 1){
            // NO SE CREARA RECIBO
            $registro_factura = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','transaccion_x_cobrar');");

        }else{
            //SI SE CREARA RECIBO
            $registro_factura = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','transaccion_cobrado');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'transaccion_cobrado')");

            $idrecibo = $this->dbc->insert_id;

            if($idcajas_bancos == ""){
                //NO REGISTRARA CAJA_BANCOS PORQ EL USUARIO NO TIENE NINGUN CAJA_BANCO
            }else{ //SI TIENE CAJA_BANCOS ENTONCES REGISTRAMOS
                foreach($caja_bancos as $cajaBanco){
                $regis_caja_banco = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','0')");
            }
        }
        }
        if ($registro_factura === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    public function listar_factura_cobro_sin_cuentas($empresa)
    {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        $idempresa = $this->getidempresa($empresa);

        $lista = [];
        $res = "";
        $facture = $this->dbc->query("SELECT
            f.idfactura,
            f.fecha,
            f.nfactura,
            f.nautorizacion,
            f.codigocontrol,
            f.montofactura,
            f.tasa0,
            f.export,
            f.npoliza,
            f.iceiecdhotros,
            f.descuentobonificacion,
            f.clasefactura,
            f.cobrado,
            f.pagado,
            f.espesificacion,
            f.estado,
            f.tipocompra,
            f.transacciones_idtransacciones,
            f.proveedorcliente_idproveedorcliente,
            f.idorganizacion,
            f.cuenta,
            f.sucursal,
            f.por_concepto_de
            FROM
            factura as f
            WHERE
            f.idorganizacion= '$idempresa'
            AND f.cuenta='0'
            AND f.cobrado != '0'
            ORDER BY
            f.fecha ASC");
        
        if($facture->num_rows > 0){
            while ($qwe = $this->dbc->fetch($facture)) {
            if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("select * from cliente where id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($cliente);

                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],"por_concepto_de" => $qwe['por_concepto_de'], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            } else {
                $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($proveedor);

                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],"por_concepto_de" => $qwe['por_concepto_de'], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            }
            array_push($lista, $res);
        }
        }else{
            $lista = [];
        }

        echo json_encode($lista);
        
    }
    public function listafactura_cobro_cuenta($idcuenta) // Ventas
    {
        $lista = [];
        $res = "";
        

        $facture = $this->dbc->query("SELECT f.idfactura, f.fecha, f.nfactura, f.nautorizacion, f.codigocontrol, f.montofactura, f.tasa0, f.export, f.npoliza, f.iceiecdhotros, f.descuentobonificacion, f.clasefactura, f.cobrado, f.pagado, f.espesificacion, f.estado, f.tipocompra, f.transacciones_idtransacciones, f.proveedorcliente_idproveedorcliente, f.idorganizacion, f.cuenta, f.sucursal,f.por_concepto_de, f.registro_desde
        FROM factura  AS f WHERE f.cuenta='$idcuenta' AND f.clasefactura = '2' ORDER BY f.nfactura DESC");
        while ($qwe = $this->dbc->fetch($facture)) {
    
                $proveedor = $this->dbcm->query("select * from cliente where id_cliente='" . $qwe[18] . "'");
                $asd = $this->dbcm->fetch($proveedor);
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit'],"por_concepto_de" => $qwe['por_concepto_de'],"registro_desde" => $qwe['registro_desde']);
            
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }

    // public function anular_factura($idfactura,$tipo_factura) {
    //     // $idempresa = $this->getidempresa($empresa);

    //         // ANULAR LA FACTURA
    //         $anular_factura = $this->dbc->query("UPDATE factura
    //                                 SET estado = '2'
    //                                 WHERE idfactura = '$idfactura';");

    //         if ($anular_factura === TRUE) {     
    //             $consulta1 = $this->dbc->query("SELECT * FROM cuentaspof WHERE idfactura = '$idfactura'");
    //             $resultado1 = $consulta1->fetch_assoc();
    //             $total_cobros = $resultado1['total'];

    //             $consulta2 = $this->dbc->query("SELECT * FROM cuentaspor WHERE idfactura = '$idfactura'");
    //             $resultado2 = $consulta2->fetch_assoc();
    //             $total_pagos = $resultado2['total'];

    //     if($total_cobros > 0){
    //         $anular_comprobante = $this->dbc->query("UPDATE cuentaspof
    //                                 SET estado = '2'
    //                                 WHERE idfactura = '$idfactura';");
    //     }elseif($total_pagos > 0){
    //         $anular_comprobante = $this->dbc->query("UPDATE cuentaspor
    //                                 SET estado = '2'
    //                                 WHERE idfactura = '$idfactura';");
    //     }else{
    //         // SOLO SE ANULARA LAS FACTURA PORQUE NO TIENE COMPROBANTE ASIGNADO
    //     }
    //             $res = array("success", "Edición exitosa","editarCaracteristicas");
    //         } else {
    //             $res = array("danger", "No se pudo editar");
    //         }

    //     echo json_encode($res);
    // }

    // public function anular_recibo($idrecibo,$tipo_factura) {
    //     // $idempresa = $this->getidempresa($empresa);

    //         // ANULAR LA RECIBO
    //         $anular_recibo = $this->dbc->query("UPDATE recibo
    //                                 SET estado = '2'
    //                                 WHERE idrecibo = '$idrecibo';");

    //         if ($anular_recibo === TRUE) {     
    //             $consulta1 = $this->dbc->query("SELECT * FROM cuentaspof WHERE idrecibo = '$idrecibo'");
    //             $resultado1 = $consulta1->fetch_assoc();
    //             $total_cobros = $resultado1['total'];

    //             $consulta2 = $this->dbc->query("SELECT * FROM cuentaspor WHERE idrecibo = '$idrecibo'");
    //             $resultado2 = $consulta2->fetch_assoc();
    //             $total_pagos = $resultado2['total'];

    //     if($total_cobros > 0){
    //         $anular_comprobante = $this->dbc->query("UPDATE cuentaspof
    //                                 SET estado = '2'
    //                                 WHERE idrecibo = '$idrecibo';");
    //     }elseif($total_pagos > 0){
    //         $anular_comprobante = $this->dbc->query("UPDATE cuentaspor
    //                                 SET estado = '2'
    //                                 WHERE idrecibo = '$idrecibo';");
    //     }else{
    //         // SOLO SE ANULARA EL RECIBO PORQUE NO TIENE COMPROBANTE ASIGNADO
    //     }
    //             $res = array("success", "Edición exitosa","editarCaracteristicas");
    //         } else {
    //             $res = array("danger", "No se pudo editar");
    //         }

    //     echo json_encode($res);
    // }
}