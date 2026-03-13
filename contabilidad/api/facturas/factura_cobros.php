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
    public function registrar_factura_cobros_tributario($por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$tipo_factura,$clasefactura,$cobro, $pagar, $espesificacion,$trans, $cliente, $empresa, $sucursal,$asiento,$idcajas_bancos,$zn,$fecha_transaccion,$cuenta,$tipo_cuenta)
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

        $bandera = TRUE;
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
          
            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                //
                $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
                VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','tributario_x_cobrar');");
            
            }else{// SE ASIGNARA CUENTA MAS 
                
                $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
                VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_x_cobrar');");
            
                $idfactu = $this->dbc->insert_id;

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

                
                // Desvincular todas las facturas viejas excepto las nuevas

                    $desvincular_fact = $this->dbc->query("UPDATE factura 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta' 
                        AND idfactura NOT IN ($idfactu)
                    ");

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

        if($fecha_transaccion >= $resultado122['fechatransaccion']){// REGISTRO CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}

        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
        VALUES ('$nroTransaccion', '$fecha_transaccion', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
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
        VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','tributario_x_cobrar');");
       
       }else{  // FINALIZA CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
            $bandera = FALSE;
        }

        }
        }else{ // FACTURAS COBRADOS
            // SE CREARAN RECIBOS
                       // Insertar en transacciones
        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','tributario_cobrado');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','0','0',NULL,'tributario_cobrado')");

            $idrecibo = $this->dbc->insert_id;

            if($idcajas_bancos == ""){
                //NO REGISTRARA CAJA_BANCOS PORQ EL USUARIO NO TIENE NINGUN CAJA_BANCO
            }else{ //SI TIENE CAJA_BANCOS ENTONCES REGISTRAMOS
                foreach($caja_bancos as $cajaBanco){
                $regis_caja_banco = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','0')");
                }
            }

        }elseif($trans > 0 && $asiento == ""){
                        
        if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA

            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','tributario_cobrado');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'tributario_cobrado')");

            $idrecibo = $this->dbc->insert_id;
        
        }else{// SE ASIGNARA CUENTA MAS 
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','tributario_cobrado');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','$cuenta',NULL,'tributario_cobrado')");

            $idrecibo = $this->dbc->insert_id;

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

                    // Desvincular todas las facturas viejas excepto las nuevas

                    $desvincular_fact = $this->dbc->query("UPDATE factura 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta' 
                        AND idfactura NOT IN ($idfact)
                    ");
                    $desvincular_comprobante = $this->dbc->query("UPDATE cuentaspof 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta' 
                        AND idcuentaspof NOT IN ($idrecibo)
                    ");

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
        
        if($idcajas_bancos == ""){
                //NO REGISTRARA CAJA_BANCOS PORQ EL USUARIO NO TIENE NINGUN CAJA_BANCO
            }else{ //SI TIENE CAJA_BANCOS ENTONCES REGISTRAMOS
                foreach($caja_bancos as $cajaBanco){
                $regis_caja_banco = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','0')");
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

        if($fecha_transaccion >= $resultado122['fechatransaccion']){// REGISTRO CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}


        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
        VALUES ('$nroTransaccion', '$fecha_transaccion', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
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
        VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','$tipo_factura', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','tributario_cobrado');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$idtrans','0',NULL,'tributario_cobrado')");

        $idrecibo = $this->dbc->insert_id;

        if($idcajas_bancos == ""){
                //NO REGISTRARA CAJA_BANCOS PORQ EL USUARIO NO TIENE NINGUN CAJA_BANCO
        }else{ //SI TIENE CAJA_BANCOS ENTONCES REGISTRAMOS
                foreach($caja_bancos as $cajaBanco){
                $regis_caja_banco = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','0')");
                }
        }

            if ($registro === TRUE) {
                $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
            } else {
                $res = array("danger", "No se pudo realizar el registro ");
            }

            }else{  // FINALIZA CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
            $bandera = FALSE;
            }
        }
        
        } // FINALIZA LAS LLAVES DE FACTURAS COBRADOS
        if($bandera === TRUE){
            $res = array("success", "Registro Correcto", "crearfactura");

        }else{
            
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));

        }
        // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
        
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
            f.fecha DESC");
        
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

    public function registrar_anular_eliminar_activar_factura_caja_bancos($id_documento,$tipo_documento,$registro_desde,$motivo,$estado_opci,$estado_soli,$hora,$fecha,$usuario,$empresa)
    { // EN ESTA API LA FACTURA Y EL COMPROBANTE SE ANULAN, ELIMINAN Y ACTIVAN AL MISMO TIEMPO, PORQUE FUERON CREADO JUNTOS

        //estado_opci --> 1--> anular, 2--> eliminar, 3--> activar
        // estado_soli --> 1 = pendiente, 2= aceptado, 3=denegado
        //transaccion estados --> 1=activo, 2=proceso_anulac , 3=proceso_elimina, 4= anulado, 5=proceso_activacion


        // EN CUALQUIERA DE LOS CASOS SE PODRA SOLICITAR LA ANULACION
        //CASO I --> vacio SI,  consolidado NO 
        $idusuario=$this->getidusuario($usuario);
        $idempresa=$this->getidempresa($empresa);
        $gestion = $this->getgestionactualC($empresa);
        $idgestion = $gestion["id"];
        $res = "";

        if($tipo_documento == 'factura'){ // ES FACTURA
            // $fac = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$id_documento'");
            // $fac_aux = $this->dbc->fetch($fac);

            // $iddocumento_aux = $fac_aux['idfactura'];
            $nombre_documento_aux = 'factura';
            $id_documento_nombre = 'idfactura';

        }else{ // ES RECIBO
            // $rec = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo = '$id_documento'");
            // $rec_aux = $this->dbc->fetch($rec);

            // $iddocumento_aux = $rec_aux['idrecibo'];
            $nombre_documento_aux = 'recibo';
            $id_documento_nombre = 'idrecibo';
            // $tipo_comprobante = 'comprobante_cobro';
        }

        $factura_recibo_tipo = $this->dbc->query("SELECT * FROM $nombre_documento_aux WHERE $id_documento_nombre = '$id_documento'");
        $fact_rec_tip = $this->dbc->fetch($factura_recibo_tipo);

        if($fact_rec_tip['cobrado'] != '0'){ // LA FACTURA SERA DE COBRO

            $comprob = $this->dbc->query("SELECT * FROM cuentaspof WHERE $id_documento_nombre = '$id_documento'");
            $comprobante = $this->dbc->fetch($comprob);
    
            $idcomprobante = $comprobante['idcuentaspof'];
            $nombre_comprobante = 'cuentaspof';
            $idcomprobante_nombre = 'idcuentaspof';
            $tipo_comprobante = 'comprobante_pago';

        }else{ // LA FACTURA SERA DE PAGO
            $comprob = $this->dbc->query("SELECT * FROM cuentaspor WHERE $id_documento_nombre = '$id_documento'");
            $comprobante = $this->dbc->fetch($comprob);

            $idcomprobante = $comprobante['idcuentaspor'];
            $nombre_comprobante = 'cuentaspor';
            $idcomprobante_nombre = 'idcuentaspor';
            $tipo_comprobante = 'comprobante_cobro';
        }

        $registro_factura=$this->dbc->query("INSERT INTO solicitud_anular_eliminar_documento(id_documento, tipo_documento, registro_desde, motivo, estado_opcion, estado_solicitud, hora,fecha, idusuario, idempresa, idgestion)
        VALUES('$id_documento','$tipo_documento','$registro_desde','$motivo','$estado_opci','$estado_soli','$hora','$fecha','$idusuario','$idempresa','$idgestion')");

        // $registro_comprobante=$this->dbc->query("INSERT INTO solicitud_anular_eliminar_documento(id_documento,tipo_documento, registro_desde,motivo,estado_opcion,estado_solicitud,hora,fecha,idusuario,idempresa,idgestion)
        // VALUES('$idcomprobante','$tipo_comprobante','$registro_desde','$motivo','$estado_opci','$estado_soli','$hora','$fecha','$idusuario','$idempresa','$idgestion')");


        if($registro_factura===TRUE){
            if($estado_opci == 1){ //estado_opcion= 1 anular
                // estado_factura = 2--> pendiente de anulacion 
                $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '2' WHERE $id_documento_nombre = '$id_documento'");    
                $editar_comprobante=$this->dbc->query("UPDATE $nombre_comprobante SET estado = '2' WHERE $idcomprobante_nombre = '$idcomprobante'");  
            }elseif($estado_opci == 2){ //estado_opcion= 2 eliminar
                // estado_factura = 3--> pendiente de eliminacion 
                $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '3' WHERE $id_documento_nombre = '$id_documento'");  
                $editar_comprobante=$this->dbc->query("UPDATE $nombre_comprobante SET estado = '3' WHERE $idcomprobante_nombre = '$idcomprobante'");    

            }else{//estado_opcion= 3 activar
             // estado_factura = 5--> pendiente de activacion 
             $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '5' WHERE $id_documento_nombre = '$id_documento'");  
             $editar_comprobante=$this->dbc->query("UPDATE $nombre_comprobante SET estado = '5' WHERE $idcomprobante_nombre = '$idcomprobante'");  
            }
            
            $res = array("success", "Modificacion exitosa","anular_transaccion",$id_documento,$tipo_documento,$registro_desde,$motivo,$estado_opci,$estado_soli,$hora,$fecha,$usuario,$empresa);
        }else{
            $res = array("danger", "No se pudo anular");
        }
        
        echo json_encode($res);
    }

    public function cambiarEstado_anular_eliminar_activar_factura_caja_bancos($idsoli,$estado_opcion,$estado_solicitud,$fecha_proceso,$hora_proceso,$idusuario_admin){
        //actualizar esto:
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // echo json_encode(array($idtran_espera,$estado,$fecha,$hora));
        $usuario=$this->getidusuario($idusuario_admin);
                $res="";
                $soli_consu=$this->dbc->query("SELECT * FROM solicitud_anular_eliminar_documento WHERE idsolicitud_anular_eliminar_documento='$idsoli'");
                $solicitud = $soli_consu->fetch_assoc();
                $id_documento = $solicitud['id_documento'];
            // si --> estado_opcion = 1 -->anular
            // si --> estado_solicitud = 2 --> aceptado
            if($estado_opcion == 1){ //ANULAR
                $update_soli=$this->dbc->query("UPDATE solicitud_anular_eliminar_documento 
                    SET estado_solicitud = '$estado_solicitud',
                    hora_proceso = '$hora_proceso',
                    fecha_proceso = '$fecha_proceso',
                    idusuario_admin = '$idusuario_admin'
                        WHERE idsolicitud_anular_eliminar_documento = '$idsoli'");   

                if($estado_solicitud == 2){ //ACEPTADO

                    if($solicitud['tipo_documento'] == 'factura'){// ES FACTURA

                        // ANULAMOS FACTURA
                        $update_fact=$this->dbc->query("UPDATE factura SET estado = '4' 
                        WHERE idfactura = '$id_documento'");  

                        $factu = $this->dbc->query("SELECT * FROM factura WHERE idfactura='$id_documento'");
                        $factu_comprob = $factu->fetch_assoc();

                        //ESTAMOS ANULANDO LOS COMPROBANTES DE LA FACTURA ANULADA
                        if($factu_comprob['clasefactura'] == '2'){ // COBROS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspof SET estado = '4' 
                            WHERE idfactura = '$id_documento'"); 
                        }else{ // PAGOS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspor SET estado = '4' 
                            WHERE idfactura = '$id_documento'"); 
                        }

                    }else{ // ES RECIBO

                        // ANULAMOS RECIBO
                        $update_fact=$this->dbc->query("UPDATE recibo SET estado = '4' 
                        WHERE idrecibo = '$id_documento'");  

                        $reci = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo='$id_documento'");
                        $reci_comprob = $reci->fetch_assoc();

                        //ESTAMOS ANULANDO LOS COMPROBANTES DE EL RECIBO ANULADO
                        if($reci_comprob['cobrado'] != '0'){ // COBROS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspof SET estado = '4' 
                            WHERE idrecibo = '$id_documento'"); 
                        }else{ // PAGOS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspor SET estado = '4' 
                            WHERE idrecibo = '$id_documento'"); 
                        }

                    }
                     
                
                    $res = array("success", "Se Acepto la anulacion del documento", "cambiarEstado_anular_eliminar_documento");

                }else{ //DENEGADO --> estado_solicitud == 3
                    //NO SE ANULARA PERO SI CAMBIARA ESTADO DE FACTURA O RECIBO
                    if($solicitud['tipo_documento'] == 'factura'){// ES FACTURA
                        $update_docu=$this->dbc->query("UPDATE factura SET estado = '1' 
                        WHERE idfactura = '$id_documento'");  

                        $factu = $this->dbc->query("SELECT * FROM factura WHERE idfactura='$id_documento'");
                        $factu_comprob = $factu->fetch_assoc();

                        //ESTAMOS DENEGANDO LOS COMPROBANTES DE LA FACTURA QUE SE QUERIA ANULAR
                        if($factu_comprob['clasefactura'] == '2'){ // COBROS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspof SET estado = '1' 
                            WHERE idfactura = '$id_documento'"); 
                        }else{ // PAGOS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspor SET estado = '1' 
                            WHERE idfactura = '$id_documento'"); 
                        }
 
                    }else{ // ES RECIBO
                        $update_docu=$this->dbc->query("UPDATE recibo SET estado = '1' 
                        WHERE idrecibo = '$id_documento'");  

                        $reci = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo='$id_documento'");
                        $reci_comprob = $reci->fetch_assoc();

                        //ESTAMOS DENEGANDO LOS COMPROBANTES DE EL RECIBO QUE SE QUERIA ANULAR
                        if($reci_comprob['cobrado'] != '0'){ // COBROS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspof SET estado = '1' 
                            WHERE idrecibo = '$id_documento'"); 
                        }else{ // PAGOS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspor SET estado = '1' 
                            WHERE idrecibo = '$id_documento'"); 
                        }

                    } 
                  
                    $res = array("success", "Se Denego el permiso para anular", "cambiarEstado_anular_eliminar_documento");

                }
            }elseif($estado_opcion == 2){ //ELIMINAR estado_opcion = 2
                // 
                $update_soli=$this->dbc->query("UPDATE solicitud_anular_eliminar_documento 
                    SET estado_solicitud = '$estado_solicitud',
                    hora_proceso = '$hora_proceso',
                    fecha_proceso = '$fecha_proceso',
                    idusuario_admin = '$idusuario_admin'
                        WHERE idsolicitud_anular_eliminar_documento = '$idsoli'");   

                if($estado_solicitud == 2){ //ACEPTADO
            
                    if($solicitud['tipo_documento'] == 'factura'){// ES FACTURA

                        $factu = $this->dbc->query("SELECT * FROM factura WHERE idfactura='$id_documento'");
                        $factu_comprob = $factu->fetch_assoc();

                        //ESTAMOS ELIMINANDO COMPROBANTES DE FACTURA ELIMINADA
                        if($factu_comprob['clasefactura'] == '2'){ // COBROS
                            // ELIMINAMOS COMPROBANTE
                            $eliminar_comprob=$this->dbc->query("DELETE FROM cuentaspof
                            WHERE idfactura = '$id_documento'"); 
                            
                            $eliminar_comprob=$this->dbc->query("DELETE FROM detalle_caja_bancos_cobrar
                            WHERE idfactura = '$id_documento'"); 

                        }else{ // PAGOS
                            $eliminar_comprob=$this->dbc->query("DELETE FROM cuentaspor
                            WHERE idfactura = '$id_documento'");  

                            $eliminar_comprob=$this->dbc->query("DELETE FROM detalle_caja_bancos_pagar
                            WHERE idfactura = '$id_documento'"); 

                        }

                        // ELIMINAMOS FACTURA
                        $update_fact=$this->dbc->query("DELETE FROM factura
                        WHERE idfactura = '$id_documento'");  

                    }else{ // ES RECIBO

                        $reci = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo='$id_documento'");
                        $reci_comprob = $reci->fetch_assoc();

                        //ESTAMOS ELIMINANDO COMPROBANTES DE FACTURA ELIMINADA
                        if($reci_comprob['cobrado'] != '0'){ // COBROS

                            $comprob = $this->dbc->query("SELECT * FROM cuentaspof WHERE idrecibo='$id_documento'");
                            $id_compr = $comprob->fetch_assoc();

                            $eliminar_dt_comprob=$this->dbc->query("DELETE FROM detalle_caja_bancos_cobrar
                            WHERE idcuentaspof = '$id_compr[idcuentaspof]'"); 

                            // ELIMINAMOS COMPROBANTE
                            $eliminar_comprob=$this->dbc->query("DELETE FROM cuentaspof
                            WHERE idrecibo = '$id_documento'"); 
                            
                        }else{ // PAGOS

                            $comprob = $this->dbc->query("SELECT * FROM cuentaspor WHERE idrecibo='$id_documento'");
                            $id_compr = $comprob->fetch_assoc();

                            $eliminar_dt_comprob=$this->dbc->query("DELETE FROM detalle_caja_bancos_pagar
                            WHERE idcuentaspor = '$id_compr[idcuentaspor]'"); 
                            // ELIMINAMOS COMPROBANTE
                            $eliminar_comprob=$this->dbc->query("DELETE FROM cuentaspor
                            WHERE idrecibo = '$id_documento'");  

                        }

                        // ELIMINAMOS RECIBO
                        $update_fact=$this->dbc->query("DELETE FROM recibo
                        WHERE idrecibo = '$id_documento'"); 

                    }

                $res = array("success", "Se Acepto la eliminacion de transaccion", "cambiarEstado_anular_eliminar_transaccion");

                }else{ // DENEGADO
                      //NO SE ELIMINARA PERO SI CAMBIARA ESTADO DE FACTURA O RECIBO
                    if($solicitud['tipo_documento'] == 'factura'){// ES FACTURA
                        $update_docu=$this->dbc->query("UPDATE factura SET estado = '1' 
                        WHERE idfactura = '$id_documento'");  
                    }else{ // ES RECIBO
                        $update_docu=$this->dbc->query("UPDATE recibo SET estado = '1' 
                        WHERE idrecibo = '$id_documento'");  
                    } 
                  
                    $res = array("success", "Se Denego el permiso para anular", "cambiarEstado_anular_eliminar_documento");
                }
            }else{// ACTIVAR --> estado_opcion = 3
                $update_soli=$this->dbc->query("UPDATE solicitud_anular_eliminar_documento 
                SET estado_solicitud = '$estado_solicitud',
                hora_proceso = '$hora_proceso',
                fecha_proceso = '$fecha_proceso',
                idusuario_admin = '$idusuario_admin'
                WHERE idsolicitud_anular_eliminar_documento = '$idsoli'");   

            if($estado_solicitud == 2){ //ACEPTADO
            if($solicitud['tipo_documento'] == 'factura'){// ES FACTURA


                // ACTIVAREMOS LA FACTURA
                $update_fact=$this->dbc->query("UPDATE factura SET estado = '1'
                WHERE idfactura = '$id_documento'");  

                $factu = $this->dbc->query("SELECT * FROM factura WHERE idfactura='$id_documento'");
                        $factu_comprob = $factu->fetch_assoc();

                        //ESTAMOS ANULANDO LOS COMPROBANTES DE LA FACTURA ANULADA
                        if($factu_comprob['clasefactura'] == '2'){ // COBROS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspof SET estado = '1' 
                            WHERE idfactura = '$id_documento'"); 
                        }else{ // PAGOS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspor SET estado = '1' 
                            WHERE idfactura = '$id_documento'"); 
                        }

            }else{ // ES RECIBO

                // ACTIVAREMOS EL RECIBO
                $update_fact=$this->dbc->query("UPDATE recibo SET estado = '1'
                WHERE idrecibo = '$id_documento'");  

                $reci = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo='$id_documento'");
                        $reci_comprob = $reci->fetch_assoc();

                        //ESTAMOS ANULANDO LOS COMPROBANTES DE LA FACTURA ANULADA
                        if($reci_comprob['cobrado'] > '0'){ // COBROS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspof SET estado = '1' 
                            WHERE idrecibo = '$id_documento'"); 
                        }else{ // PAGOS
                            $update_comprob=$this->dbc->query("UPDATE cuentaspor SET estado = '1' 
                            WHERE idrecibo = '$id_documento'"); 
                        }
            }

            }else{ // ES DENEGADO

            }
         
            }       

            echo json_encode($res);
        
        }

        public function listar_anular_eliminar_factura($empresa,$todos) {
        $lista = [];
         $ide = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualC($empresa);
        $idgestion = $gestion["id"];
        // Consulta SQL
        if($todos == '0'){ // solo de la gestion activa
            $sql =$this->dbc->query("SELECT * FROM solicitud_anular_eliminar_documento s
            -- INNER JOIN transacciones t ON t.idtransacciones = s.transacciones_idtransacciones
            WHERE s.idempresa = '$ide' 
            AND s.idgestion = '$idgestion'
            ORDER BY 
                (s.estado_solicitud = '1') DESC,
                s.fecha DESC,
                s.hora DESC;
            ");   
        }else{ // de todos
            $sql =$this->dbc->query("SELECT * FROM solicitud_anular_eliminar_documento s
            -- INNER JOIN transacciones t ON t.idtransacciones = s.transacciones_idtransacciones
            WHERE s.idempresa = '$ide'
            ORDER BY 
                (s.estado_solicitud = '1') DESC,
                s.fecha DESC,
                s.hora DESC;
");
        }
    
            // Procesar los resultados
            while ($qwe = $this->dbc->fetch($sql)) {
               $usuario = $this->getusuario($qwe['idusuario']); // Asegúrate de que esta función retorne los campos esperados
                // $usuariob = isset($qwe['idusuariob']) ? $this->getusuario($qwe['idusuariob']) : null;
                /*" 
                    */
                    $transaccion =$this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$qwe[transacciones_idtransacciones]'");
                    $resu = $transaccion->fetch_assoc();
                $lista[] = [
                    "idsolicitud_anular_eliminar_documento" => $qwe['idsolicitud_anular_eliminar_documento'],
                    "id_documento" => $qwe['id_documento'],
                    "tipo_documento" => $qwe['tipo_documento'],
                    "hora" => $qwe['hora'],
                    "fecha" => $qwe['fecha'],
                    "hora_proceso" => $qwe['hora_proceso'],
                    "fecha_proceso" => $qwe['fecha_proceso'],
                    "estado_opcion" => $qwe['estado_opcion'],
                    "estado_solicitud" => $qwe['estado_solicitud'],
                    "idusuario" => $qwe['idusuario'],
                    "nombre" => $usuario['nombre'] ?? null,
                    "apellido" => $usuario['apellido'] ?? null,
                    "motivo" => $qwe['motivo']
                ];
            } 
    
        // Retornar la lista en formato JSON
        echo json_encode($lista);
}

public function registrar_anular_eliminar_activar_factura_tributario_transaccion($id_documento,$tipo_documento,$registro_desde,$motivo,$estado_opci,$estado_soli,$hora,$fecha,$usuario,$empresa)
    { // EN ESTA API LA FACTURA Y EL COMPROBANTE SE ANULAN, ELIMINAN Y ACTIVAN AL MISMO TIEMPO, PORQUE FUERON CREADO JUNTOS

        //estado_opci --> 1--> anular, 2--> eliminar, 3--> activar
        // estado_soli --> 1 = pendiente, 2= aceptado, 3=denegado
        //transaccion estados --> 1=activo, 2=proceso_anulac , 3=proceso_elimina, 4= anulado, 5=proceso_activacion


        // EN CUALQUIERA DE LOS CASOS SE PODRA SOLICITAR LA ANULACION
        //CASO I --> vacio SI,  consolidado NO 
        $idusuario=$this->getidusuario($usuario);
        $idempresa=$this->getidempresa($empresa);
        $gestion = $this->getgestionactualC($empresa);
        $idgestion = $gestion["id"];
        $res = "";

        if($tipo_documento == 'factura'){ // ES FACTURA

            $nombre_documento_aux = 'factura';
            $id_documento_nombre = 'idfactura';

        }else{ // ES RECIBO

            // $iddocumento_aux = $rec_aux['idrecibo'];
            $nombre_documento_aux = 'recibo';
            $id_documento_nombre = 'idrecibo';
            // $tipo_comprobante = 'comprobante_cobro';
        }

        $factura_recibo_tipo = $this->dbc->query("SELECT * FROM $nombre_documento_aux WHERE $id_documento_nombre = '$id_documento'");
        $fact_rec_tip = $this->dbc->fetch($factura_recibo_tipo);

        if($fact_rec_tip['cobrado'] != '0'){ // LA FACTURA SERA DE COBRO

            $comprob = $this->dbc->query("SELECT * FROM cuentaspof WHERE $id_documento_nombre = '$id_documento'");
            // $comprobante = $this->dbc->fetch($comprob);
    
            if($comprob->num_rows > 0){ // EXISTEN COMPROBANTES DENTRO DE LA FACTURA
                
                // $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '2' WHERE $id_documento_nombre = '$id_documento'");  
                    $array_lista = [];
                    while ($zxc = $this->dbc->fetch($comprob)) {
                        $array_lista = $zxc['idcuentaspof'];
                        // $editar_comprobante=$this->dbc->query("UPDATE $nombre_comprobante SET estado = '2' WHERE $idcomprobante_nombre = '$zxc[idcuentaspof]'");  
                    }
                    $array_string = implode(",", $array_lista);
                }else{ // NO EXISTEN COMPROBANTES DENTRO DE LA FACTURA
                    // $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '2' WHERE $id_documento_nombre = '$id_documento'");  
                }

            // $idcomprobante = $comprobante['idcuentaspof'];
            $nombre_comprobante = 'cuentaspof';
            $idcomprobante_nombre = 'idcuentaspof';
            $tipo_comprobante = 'comprobante_pago';

        }else{ // LA FACTURA SERA DE PAGO
            $comprob = $this->dbc->query("SELECT * FROM cuentaspor WHERE $id_documento_nombre = '$id_documento'");
            $comprobante = $this->dbc->fetch($comprob);

            $idcomprobante = $comprobante['idcuentaspor'];
            $nombre_comprobante = 'cuentaspor';
            $idcomprobante_nombre = 'idcuentaspor';
            $tipo_comprobante = 'comprobante_cobro';
        }

        $registro_factura=$this->dbc->query("INSERT INTO solicitud_anular_eliminar_documento(id_documento, tipo_documento, registro_desde, motivo, estado_opcion, estado_solicitud, hora,fecha, idusuario, idempresa, idgestion)
        VALUES('$id_documento','$tipo_documento','$registro_desde','$motivo','$estado_opci','$estado_soli','$hora','$fecha','$idusuario','$idempresa','$idgestion')");

        // $registro_comprobante=$this->dbc->query("INSERT INTO solicitud_anular_eliminar_documento(id_documento,tipo_documento, registro_desde,motivo,estado_opcion,estado_solicitud,hora,fecha,idusuario,idempresa,idgestion)
        // VALUES('$idcomprobante','$tipo_comprobante','$registro_desde','$motivo','$estado_opci','$estado_soli','$hora','$fecha','$idusuario','$idempresa','$idgestion')");


        if($registro_factura===TRUE){
            if($estado_opci == 1){ //estado_opcion= 1 anular
                // estado_factura = 2--> pendiente de anulacion 

                $comprob_aux = $this->dbc->query("SELECT * FROM cuentaspof WHERE $id_documento_nombre = '$id_documento'");
                if($comprob_aux->num_rows > 0){ // EXISTEN COMPROBANTES DENTRO DE LA FACTURA
                    $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '2' WHERE $id_documento_nombre = '$id_documento'");    
                    $editar_comprobante=$this->dbc->query("UPDATE $nombre_comprobante SET estado = '2' WHERE $idcomprobante_nombre IN($array_string)");  
                }else{ // NO EXISTEN COMPROBANTES
                    $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '2' WHERE $id_documento_nombre = '$id_documento'");    

                }
                // $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '2' WHERE $id_documento_nombre = '$id_documento'");  
                //     // while ($zxc = $this->dbc->fetch($comprob)) {
                //     //     $editar_comprobante=$this->dbc->query("UPDATE $nombre_comprobante SET estado = '2' WHERE $idcomprobante_nombre = '$zxc[idcuentaspof]'");  
                //     // }
                // }else{ // NO EXISTEN COMPROBANTES DENTRO DE LA FACTURA
                //     $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '2' WHERE $id_documento_nombre = '$id_documento'");  
                // }

            }elseif($estado_opci == 2){ //estado_opcion= 2 eliminar
                // estado_factura = 3--> pendiente de eliminacion 
                $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '3' WHERE $id_documento_nombre = '$id_documento'");  
                $editar_comprobante=$this->dbc->query("UPDATE $nombre_comprobante SET estado = '3' WHERE $idcomprobante_nombre = '$idcomprobante'");    

            }else{//estado_opcion= 3 activar
             // estado_factura = 5--> pendiente de activacion 
             $editar=$this->dbc->query("UPDATE $nombre_documento_aux SET estado = '5' WHERE $id_documento_nombre = '$id_documento'");  
             $editar_comprobante=$this->dbc->query("UPDATE $nombre_comprobante SET estado = '5' WHERE $idcomprobante_nombre = '$idcomprobante'");  
            }
            
            $res = array("success", "Modificacion exitosa","anular_transaccion",$id_documento,$tipo_documento,$registro_desde,$motivo,$estado_opci,$estado_soli,$hora,$fecha,$usuario,$empresa);
        }else{
            $res = array("danger", "No se pudo anular");
        }
        
        echo json_encode($res);
    }

    public function getgestionactualC($empresa)
{
    $orga = $this->getidempresa($empresa); // recibe md5 de la id insert
    $res = "";
    $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$orga' AND estado='2' LIMIT 1");
    $qwe = $this->dbc->fetch($registro);

    // Retorna un array asociativo con la información
    return array("id" => $qwe['idgestion'], "nombre" => $qwe['nombre']);
}
// public function getgestionactualid($empresa)
// {

//     $res = "";
//     $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
//     $qwe = $this->dbc->fetch($registro);
//     //$res=array("id"=>,"nombre"=>$qwe['nombre']);
//     return $qwe['idgestion'];
// }
public function getidusuario($md5){
    $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
    $qwe=$this->dbrh->fetch($registro);
    return $qwe['idusuario'];

} 
public function getusuario($id) {
    $registro = $this->dbrh->query("
        SELECT u.nombre AS usuario_nombre, t.nombre AS trabajador_nombre, t.apellido, t.ci 
        FROM usuario AS u 
        INNER JOIN trabajador AS t ON t.idtrabajador = u.trabajador_idtrabajador
        WHERE u.idusuario = '$id'
    ");
    $qwe = $this->dbrh->fetch($registro);

    return [
        "usuario" => $qwe['usuario_nombre'],
        "nombre" => $qwe['trabajador_nombre'],
        "apellido" => $qwe['apellido'],
        "ci" => $qwe['ci']
    ];
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