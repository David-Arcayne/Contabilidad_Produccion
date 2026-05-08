<?php
require_once "../../db/db.php";
// require_once "./contabilidad/api/configuracion/empresa.php";
class Caja_bancos_recibos extends DB{

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
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); registrar_factura_recibo_pago_cajaBancos
        return $qwe['idgestion'];
    }
    public function registrar_factura_recibo_cobro_cajaBancos($idotras_cuentas,$por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar, $espesificacion,$trans, $cliente, $empresa, $sucursal,$asiento,$idcaja_bancos,$archivo,$registro_desde,$zn,$fecha_transaccion,$cuenta,$tipo_cuenta)
    {

         ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

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
        
        $bandera = TRUE;

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

        // $recibo_reci = $this->dbc->query("SELECT count(*) AS cant4 FROM cuentaspof cp
        // INNER JOIN recibo r ON r.idrecibo=cp.idrecibo
        // WHERE r.idempresa='$idempresa' and cp.transaccion ='0'");
        // $res4 = $recibo_reci->fetch_assoc();
        
        $nroRecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;

        $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$cliente'");
        $clientSelect = $cl->fetch_assoc();

        if($idotras_cuentas == ""){ 
            $contrato_general = $this->dbc->query("SELECT * FROM otras_cuentas 
            WHERE cobrado = '-1' AND pagado = '-1' AND idempresa = '$idempresa'");
            
            if($contrato_general->num_rows > 0){ // SI EXISTE CONTRATO GENERAL
                $cg = $contrato_general->fetch_assoc();
                $id_otras_cuentas_aux = $cg['idotras_cuentas'];
            }else{ // NO EXISTE CONTRATO GENERAL ENTONCES LO CREAREMOS caja_bancos

                $reg_otrs_cuentas = $this->dbc->query("INSERT INTO otras_cuentas(fecha,pagado,cobrado,idempresa,registro_desde) 
                VALUES ('$fecha','-1','-1','$idempresa','$registro_desde')");
        
                $id_otras_cuentas_aux = $this->dbc->insert_id;
            }
            
        }else{
            $id_otras_cuentas_aux = $idotras_cuentas;
        }
        
        // $concepto = 'Facura Nro: ';
        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '$co', '$pa','$id_otras_cuentas_aux', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','0','0','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans != "" && $asiento == ""){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            
            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA

            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        
        }else{// SE ASIGNARA CUENTA MAS 
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','$cuenta',NULL,'$registro_desde')");

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
        VALUES ('$nroTransaccion', '$fecha_transaccion', '1', '0', '$por_concepto_de', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        $id_cuenta = '0';
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
            if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                $id_cuenta = $this->dbc->insert_id;
            }else{
                // $id_cuenta = '0';
            }
            $orden = $orden + 1;
        }

        // $list_dt = $this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$idtrans'");
        // if($cuenta == ){

        // }
//------------------------------------------------------------------------------
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
        VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '$co', '$pa','$id_otras_cuentas_aux', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$id_cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','0','$idtrans','$id_cuenta',NULL,'$registro_desde')");

        $idrecibo = $this->dbc->insert_id;

            if ($registro === TRUE) {
                $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
            } else {
                $res = array("danger", "No se pudo realizar el registro ");
            }

            }else{  // FINALIZA CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
            $bandera = FALSE;
            }
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

        if($bandera === TRUE){
            $res = array("success", "Registro Correcto", "crearfactura");

        }else{
            
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));

        }
        echo json_encode($res);

    }

    public function registrar_factura_recibo_pago_cajaBancos($idotras_cuentas,$por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar, $espesificacion,$trans, $cliente, $empresa, $sucursal,$asiento,$idcaja_bancos,$archivo,$registro_desde,$zn,$fecha_transaccion,$cuenta,$tipo_cuenta)
    {

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME
        
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
        
        $bandera = TRUE;
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

        // $recibo_reci = $this->dbc->query("SELECT count(*) AS cant4 FROM cuentaspor cp
        // INNER JOIN recibo r ON r.idrecibo=cp.idrecibo
        // WHERE r.idempresa='$idempresa' and cp.transaccion ='0'");
        // $res4 = $recibo_reci->fetch_assoc();
        
        $nroRecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;

        $cl = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='$cliente'");
        $proveedor_select = $cl->fetch_assoc();

        if($idotras_cuentas == ""){ 
            $contrato_general = $this->dbc->query("SELECT * FROM otras_cuentas 
            WHERE cobrado = '-1' AND pagado = '-1' AND idempresa = '$idempresa'");
            
            if($contrato_general->num_rows > 0){ // SI EXISTE CONTRATO GENERAL
                $cg = $contrato_general->fetch_assoc();
                $id_otras_cuentas_aux = $cg['idotras_cuentas'];
            }else{ // NO EXISTE CONTRATO GENERAL ENTONCES LO CREAREMOS

                $reg_otrs_cuentas = $this->dbc->query("INSERT INTO otras_cuentas(fecha,pagado,cobrado,idempresa,registro_desde) 
                VALUES ('$fecha','-1','-1','$idempresa',$registro_desde)");
        
                $id_otras_cuentas_aux = $this->dbc->insert_id;
            }
            
        }else{
            $id_otras_cuentas_aux = $idotras_cuentas;
        }

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '$co', '$pa','$id_otras_cuentas_aux', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$proveedor_select[nombre]','$proveedor_select[nit]','$monto','$idfact','0','0','0','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == ""){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`, `idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            // VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '$co', '$pa','$id_otras_cuentas_aux', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            // $idfact = $this->dbc->insert_id;

            // $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            // VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$proveedor_select[nombre]','$proveedor_select[nit]','$monto','$idfact','0','0','$trans','0',NULL,'$registro_desde')");

            // $idrecibo = $this->dbc->insert_id;
            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA

            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$proveedor_select[nombre]','$proveedor_select[nit]','$monto','$idfact','0','$trans','0',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        
        }else{// SE ASIGNARA CUENTA MAS 
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '$co', '$pa','0', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$proveedor_select[nombre]','$proveedor_select[nit]','$monto','$idfact','0','$trans','$cuenta',NULL,'$registro_desde')");

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
                    $desvincular_comprobante = $this->dbc->query("UPDATE cuentaspor 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta' 
                        AND idcuentaspor NOT IN ($idrecibo)
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
        VALUES ('$nroTransaccion', '$fecha_transaccion', '1', '0', '$por_concepto_de', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        $id_cuenta = '0';
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
            
            if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                $id_cuenta = $this->dbc->insert_id;
            }else{
                // $id_cuenta = '0';
            }

            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
        VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '$co', '$pa','$id_otras_cuentas_aux', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$id_cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$proveedor_select[nombre]','$proveedor_select[nit]','$monto','$idfact','0','0','$idtrans','$id_cuenta',NULL,'$registro_desde')");

        $idrecibo = $this->dbc->insert_id;

         if ($registro === TRUE) {
                $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
            } else {
                $res = array("danger", "No se pudo realizar el registro ");
            }

            }else{  // FINALIZA CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
            $bandera = FALSE;
            }
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

        if($bandera === TRUE){
            $res = array("success", "Registro Correcto", "crearfactura");

        }else{
            
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));

        }
        echo json_encode($res);

    }

    public function listar_recibo_por_caja_bancos_antiguo($cadena_cajaBancos,$fecha_ini,$fecha_fin,$tipo_filtro) {

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);

        $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
        $caja_bancos = implode(",", $array_cajaBancos);

    if($tipo_filtro == '1'){ //TIPO = 1 --> INGRESO,  2-->EGRESO, 3--> AMBOS

    $getPedido = $this->dbc->query("SELECT cp.idrecibo,cp.idcuentaspof,cp.nrecibo,cp.lugar,cp.persona,cp.ci,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo,cp.registro_desde, dc.idcaja_bancos,dc.monto
    FROM detalle_caja_bancos_cobrar dc
    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
    WHERE dc.idcaja_bancos IN ($caja_bancos)
    AND cp.fecha >= '$fecha_ini'
    AND cp.fecha <= '$fecha_fin'
    ORDER BY cp.fecha ASC;");

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

            }elseif($qwe['idrecibo'] == 0){
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

                $recibo = $this->dbc->query("SELECT * 
                FROM recibo
                WHERE idrecibo = '$qwe[idrecibo]'");

                $reci = $recibo->fetch_assoc();

                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$reci[cliente_proveedor]'");
                $cl = $cliente->fetch_assoc();
            }

            if($qwe['idrecibo'] != '0'){

                $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));

                $otras_cuentas = $this->dbc->query("SELECT * 
                FROM otras_cuentas
                WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                $oc = $otras_cuentas->fetch_assoc();

                    if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        $aux_descripcion = $reci['concepto'];
                    }else{
                        $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                    }

                if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA

                    $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                    FROM detalle_caja_bancos_cobrar dc
                    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
                    WHERE dc.idcaja_bancos IN ($caja_bancos)
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
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "recibo",
                        "nro_documento" => "$reci[nro_recibo]",
                        "por_concepto_de" => "$reci[concepto]",
                        // "idtipo" => "$reci[idtipo]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $cl['id_cliente'],
                        "nombre_cliente" => $cl['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $aux_descripcion,
                        //"(".$aux_concepto.")"
                        "archivo" => $qwe['archivo'],
                        "ingreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion  " => "si"
    
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
                    "lugar" => $qwe['lugar'],
                    "persona" => $qwe['persona'],
                    "ci" => $qwe['ci'],
                    "factura_recibo" => "recibo",
                    "nro_documento" => "$reci[nro_recibo]",
                    "por_concepto_de" => "$reci[concepto]",
                    // "idtipo" => "$oc[idtipo]",
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
                    "registro_desde" => $qwe['registro_desde'],
                    "pertenece_contratacion  " => "si"

                );
            }

            }else{
                if($fact['idotras_cuentas'] == '0' || $fact['idotras_cuentas'] == null){ //ESTA FACTURA NO PERTENECE A CONTRATO, NO TENDRA "s/g Contrato"
                  
                    $aux_descripcion = $fact['por_concepto_de'];
                    $pertenece_contrato = "no";
                }else{
                    //ESTA FACTURA SII PERTENECE A CONTRATO
                   
                    $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$fact[idotras_cuentas]'");
                    $oc = $otras_cuentas->fetch_assoc();

                    if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        $aux_descripcion = $fact['por_concepto_de'];
                    }else{
                        $aux_descripcion = $fact['por_concepto_de']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                    }

                    $pertenece_contrato = "si";
                }
                // $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));
                // $aux_descripcion = "s/g doc N° $fact[nfactura] de: $fecha_nueva";

                 $aux_factura = "cero $fact[nfactura]";
                 $factu = str_replace("cero ", "", $aux_factura);

                 if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA

                    $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                    FROM detalle_caja_bancos_cobrar dc
                    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
                    WHERE dc.idcaja_bancos IN ($caja_bancos)
                    AND cp.fecha < '$fecha_ini';");
                // $saldo = 0;
                while ($zxc = $this->dbc->fetch($fuera_rango)) {
                    $saldo = $saldo + $zxc['monto'];
                }
                
                $saldo_inicial = $saldo;
                $saldo = $saldo + $qwe['monto'];
                    $res = array(
                        // "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 1,
                        "idrecibo" => $qwe['idcuentaspof'],
                        "fecha" => $qwe['fecha'],
                        "nrecibo" => $qwe['nrecibo'],
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "factura",
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
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion" => $pertenece_contrato
    
                    );

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                $saldo = $saldo + $qwe['monto'];
                $res = array(
                    // "fecha_nueva" => $fecha_nueva,
                    "tipo_documento" => 1,
                    "idrecibo" => $qwe['idcuentaspof'],
                    "fecha" => $qwe['fecha'],
                    "nrecibo" => $qwe['nrecibo'],
                    "lugar" => $qwe['lugar'],
                    "persona" => $qwe['persona'],
                    "ci" => $qwe['ci'],
                    "factura_recibo" => "factura",
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
                    "registro_desde" => $qwe['registro_desde'],
                    "pertenece_contratacion" => $pertenece_contrato
                );
            }

            }
          
            array_push($lista, $res);
        }
    
    }elseif($tipo_filtro == '2'){// tipo = 2 --> EGRESO     }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
//         ini_set('display_errors', 1);
//         ini_set('display_startup_errors', 1);
//         error_reporting(E_ALL);

        $getPedido = $this->dbc->query("SELECT cp.idrecibo,cp.idcuentaspor,cp.nrecibo,cp.lugar,cp.persona,cp.ci,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto
        FROM detalle_caja_bancos_pagar dc
        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
        WHERE dc.idcaja_bancos IN ($caja_bancos)
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
    
                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                    $prov = $proveedor->fetch_assoc();
    
                }elseif($qwe['idrecibo'] == 0){
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
                    
                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                    $prov = $proveedor->fetch_assoc();
                }else{
                    // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
    
                    $recibo = $this->dbc->query("SELECT * 
                    FROM recibo
                    WHERE idrecibo = '$qwe[idrecibo]'");
    
                    $reci = $recibo->fetch_assoc();
    
                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$reci[cliente_proveedor]'");
                    $prov = $proveedor->fetch_assoc();
                }
    
                if($qwe['idrecibo'] != 0){
                    $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));

                    // $otras_cuentas = $this->dbc->query("SELECT * 
                    // FROM recibo
                    // WHERE idrecibo = '$qwe[idrecibo]'");
                    $otras_cuentas = $this->dbc->query("SELECT * 
                    FROM otras_cuentas
                    WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                    $oc = $otras_cuentas->fetch_assoc();

                    if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        $aux_descripcion = $reci['concepto'];
                    }else{
                        $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                    }
    
                    if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA
    
                        $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspor,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                        FROM detalle_caja_bancos_pagar dc
                        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
                        WHERE dc.idcaja_bancos IN ($caja_bancos)
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
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "recibo",
                            "nro_documento" => "$reci[nro_recibo]",
                            "por_concepto_de" => "$reci[concepto]",
                            // "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $prov['id_proveedor'],
                            "nombre_cliente" => $prov['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => "si"
        
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
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "recibo",
                        "nro_documento" => "$reci[nro_recibo]",
                        "por_concepto_de" => "$reci[concepto]",
                        // "idtipo" => "$oc[idtipo]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $prov['id_proveedor'],
                        "nombre_cliente" => $prov['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $aux_descripcion,
                        "archivo" => $qwe['archivo'],
                        "egreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion" => "si"
    
                    );
                }
    
                }else{
                    // $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));
                    // $aux_descripcion = "s/g doc N° $fact[nfactura] de: $fecha_nueva";
                    
                    if($fact['idotras_cuentas'] == '0' || $fact['idotras_cuentas'] == null){ // ESTA FACTURA NO PERTENECE A CONTRATO, NO TENDRA "s/g Contrato"
                        $aux_descripcion = $fact['por_concepto_de'];
                        $pertenece_contrato = "no";
                    }else{
                        //ESTA FACTURA SII PERTENECE A CONTRATO
                   
                        $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$fact[idotras_cuentas]'");
                        $oc = $otras_cuentas->fetch_assoc();

                        if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                            $aux_descripcion = $fact['por_concepto_de'];
                        }else{
                            $aux_descripcion = $fact['por_concepto_de']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        }

                        $pertenece_contrato = "si";
                    }

                     $aux_factura = "cero $fact[nfactura]";
                     $factu = str_replace("cero ", "", $aux_factura);
    
                     if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA
    
                        $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspor,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                        FROM detalle_caja_bancos_pagar dc
                        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
                        WHERE dc.idcaja_bancos IN ($caja_bancos)
                        AND cp.fecha < '$fecha_ini';");
                    // $saldo = 0;
                    while ($zxc = $this->dbc->fetch($fuera_rango)) {
                        $saldo = $saldo + $zxc['monto'];
                    }
                    $saldo_inicial = $saldo;
                    $saldo = $saldo + $qwe['monto'];
                        $res = array(
                            // "fecha_nueva" => $fecha_nueva,
                            "tipo_documento" => 2,
                            "idrecibo" => $qwe['idcuentaspor'],
                            "fecha" => $qwe['fecha'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "factura",
                            "nro_documento" => "$fact[nfactura]",
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $prov['id_proveedor'],
                            "nombre_cliente" => $prov['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => $pertenece_contrato
        
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
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "factura",
                        "nro_documento" => "$fact[nfactura]",
                        "por_concepto_de" => "$fact[por_concepto_de]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $prov['id_proveedor'],
                        "nombre_cliente" => $prov['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $aux_descripcion,
                        "archivo" => $qwe['archivo'],
                        "egreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion" => $pertenece_contrato
    
                    );
                }
                }
              
                array_push($lista, $res);
            }

    }else{// TIPO = 3 --> TODOS 

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $getPedido = $this->dbc->query("SELECT 
            cp.idcuentaspor AS id_cuenta,
            cp.idrecibo,
            cp.nrecibo,
            cp.lugar,
            cp.persona,
            cp.ci, 
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
        WHERE dc.idcaja_bancos IN ($caja_bancos)
        AND cp.fecha BETWEEN '$fecha_ini' AND '$fecha_fin'

        UNION

        SELECT 
            cp.idcuentaspof AS id_cuenta,
            cp.idrecibo, 
            cp.nrecibo,
            cp.lugar,
            cp.persona,
            cp.ci,  
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
        WHERE dc.idcaja_bancos IN ($caja_bancos)
        AND cp.fecha BETWEEN '$fecha_ini' AND '$fecha_fin'

        ORDER BY fecha ASC;");
    
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
        
                    }elseif($qwe['idrecibo'] == 0){
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
        
                        $recibo = $this->dbc->query("SELECT * 
                        FROM recibo
                        WHERE idrecibo = '$qwe[idrecibo]'");
        
                        $reci = $recibo->fetch_assoc();
        
                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$reci[cliente_proveedor]'");
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
        
                    }elseif($qwe['idrecibo'] == 0){
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
        
                        $recibo = $this->dbc->query("SELECT * 
                        FROM recibo
                        WHERE idrecibo = '$qwe[idrecibo]'");
        
                        $reci = $recibo->fetch_assoc();
        
                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$reci[cliente_proveedor]'");
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
            WHERE dc.idcaja_bancos IN ($caja_bancos)
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
            WHERE dc.idcaja_bancos IN ($caja_bancos)
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

                    if($qwe['idrecibo'] != 0){
                        //Según documento N° 11 de 24/04/2025
                        $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));
                        // $aux_descripcion = "s/g doc N° $reci[nro_recibo] de: $fecha_nueva";
                        $otras_cuentas = $this->dbc->query("SELECT * 
                        FROM otras_cuentas
                        WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                        $oc = $otras_cuentas->fetch_assoc();

                        if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                            $aux_descripcion = $reci['concepto'];
                        }else{
                            $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        }

                  
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 3,
                            "idrecibo" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "recibo",
                            "nro_documento" => "$reci[nro_recibo]",
                            "por_concepto_de" => "$reci[concepto]",
                            // "idtipo" => "$oc[idtipo]",
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
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => "si"
                        );
                    }else{
                        $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));

                        if($fact['idotras_cuentas'] == '0' || $fact['idotras_cuentas'] == null){ //ESTA FACTURA NOO PERTENECE A CONTRATO, NO TENDRA "s/g Contrato"
                            $aux_descripcion = $fact['por_concepto_de'];
                            $pertenece_contrato = "no";
                        }else{
                            //ESTA FACTURA SII PERTENECE A CONTRATO
                   
                            $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$fact[idotras_cuentas]'");
                            $oc = $otras_cuentas->fetch_assoc();

                            if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                                $aux_descripcion = $fact['por_concepto_de'];
                            }else{
                                $aux_descripcion = $fact['por_concepto_de']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                            }

                            $pertenece_contrato = "si";
                        }
        
                         $aux_factura = "cero $fact[nfactura]";
                         $factu = str_replace("cero ", "", $aux_factura);
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 1,
                            "idrecibo" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "factura",
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
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => $pertenece_contrato
                        );
                    }
                }else{ // PAGAR

                    $saldo = $saldo - $qwe['monto'];

                    if($qwe['idrecibo'] != 0){
                        $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));
                        // $aux_descripcion = "s/g doc N° $reci[nro_recibo] de: $fecha_nueva";
                        $otras_cuentas = $this->dbc->query("SELECT * 
                        FROM otras_cuentas
                        WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                        $oc = $otras_cuentas->fetch_assoc();

                        if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                            $aux_descripcion = $reci['concepto'];
                        }else{
                            $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        }
        
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 4,
                            "idrecibo" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "recibo",
                            "nro_documento" => "$reci[nro_recibo]",
                            "por_concepto_de" => "$reci[concepto]",
                            // "idtipo" => "$oc[idtipo]",
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
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => "si"
                        );
                    }else{
                        $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));

                        if($fact['idotras_cuentas'] == '0' || $fact['idotras_cuentas'] == null){ //ESTA FACTURA NO PERTENECE A CONTRATO, NO TENDRA "s/g Contrato"
                            $aux_descripcion = $fact['por_concepto_de'];
                            $pertenece_contrato = "no";
                        }else{
                            //ESTA FACTURA SII PERTENECE A CONTRATO
                   
                            $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$fact[idotras_cuentas]'");
                            $oc = $otras_cuentas->fetch_assoc();

                            if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                                $aux_descripcion = $fact['por_concepto_de'];
                            }else{
                                $aux_descripcion = $fact['por_concepto_de']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                            }

                            $pertenece_contrato = "si";
                        }
        
                         $aux_factura = "cero $fact[nfactura]";
                         $factu = str_replace("cero ", "", $aux_factura);
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 2,
                            "idrecibo" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "factura",
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
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => $pertenece_contrato
                        );
                    }
                }
                
              
                array_push($lista, $res);
            }

    }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    // ---------------------------------------------------------------------------------------------------------------------------

    public function listar_recibo_por_caja_bancos($cadena_cajaBancos,$fecha_ini,$fecha_fin,$tipo_filtro) {

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);

        $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
        $caja_bancos = implode(",", $array_cajaBancos);

    if($tipo_filtro == '1'){ //TIPO = 1 --> INGRESO,  2-->EGRESO, 3--> AMBOS

    $getPedido = $this->dbc->query("SELECT cp.idrecibo,cp.idcuentaspof,cp.nrecibo,cp.lugar,cp.persona,cp.ci,cp.fecha,cp.estado,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo,cp.registro_desde,cp.concepto, dc.idcaja_bancos,dc.monto
    FROM detalle_caja_bancos_cobrar dc
    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
    WHERE dc.idcaja_bancos IN ($caja_bancos)
    AND cp.fecha >= '$fecha_ini'
    AND cp.fecha <= '$fecha_fin'
    ORDER BY cp.fecha ASC;");

    $get_comprobante_comercial = $this->dbc->query("SELECT * FROM comprobantes_comercial_caja_bancos 
    WHERE idcaja_bancos IN ($caja_bancos) AND fecha BETWEEN '$fecha_ini' AND '$fecha_fin'");

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

                if($fact['estado'] == '1'){ //ACTIVO
                    $estado_documento = "activo";
                }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                    $estado_documento = "pendiente anulacion";
                }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                    $estado_documento = "pendiente eliminacion";
                }elseif($fact['estado'] == '4'){// ANULADO
                    $estado_documento = "anulado";
                }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                    $estado_documento = "pendiente activacion";
                }

                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                $cl = $cliente->fetch_assoc();

            }elseif($qwe['idrecibo'] == 0){
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

                $recibo = $this->dbc->query("SELECT * 
                FROM recibo
                WHERE idrecibo = '$qwe[idrecibo]'");

                $reci = $recibo->fetch_assoc();

                if($reci['estado'] == '1'){ //ACTIVO
                    $estado_documento = "activo";
                }elseif($reci['estado'] == '2'){ // PENDIENTE DE ANULACION
                    $estado_documento = "pendiente anulacion";
                }elseif($reci['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                    $estado_documento = "pendiente eliminacion";
                }elseif($reci['estado'] == '4'){// ANULADO
                    $estado_documento = "anulado";
                }elseif($reci['estado'] == '5'){// PENDIENTE DE ACTIVACION
                    $estado_documento = "pendiente activacion";
                }
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$reci[cliente_proveedor]'");
                $cl = $cliente->fetch_assoc();
            }

            if($qwe['idrecibo'] != '0'){

                $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));

                $otras_cuentas = $this->dbc->query("SELECT * 
                FROM otras_cuentas
                WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                $oc = $otras_cuentas->fetch_assoc();

                    // if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                    //     $aux_descripcion = $reci['concepto'];
                    // }else{
                    //     $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                    // }

                if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA

                    $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.estado,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                    FROM detalle_caja_bancos_cobrar dc
                    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
                    WHERE dc.idcaja_bancos IN ($caja_bancos)
                    AND cp.fecha < '$fecha_ini'");
                // $saldo = 0;
                while ($zxc = $this->dbc->fetch($fuera_rango)) {
                    if($zxc['estado'] == '4'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                        $saldo = $saldo + $zxc['monto'];
                    }
                }

                $saldo_inicial = $saldo;

                if($qwe['estado'] == '4'){
                        // no sumara nada porque el documento esta anulado
                }else{
                        $saldo = $saldo + $qwe['monto'];
                }

                    $res = array(
                        "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 3,
                        "fecha" => $qwe['fecha'],
                        "idcomprobante" => $qwe['idcuentaspof'],
                        "nrecibo" => $qwe['nrecibo'],
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "recibo",
                        "idrecibo" => "$reci[idrecibo]",
                        "nro_documento" => "$reci[nro_recibo]",
                        "por_concepto_de" => "$reci[concepto]",
                        "idotras_cuentas" => "$reci[idotras_cuentas]",
                        "estado_documento" => $estado_documento,
                        // "idtipo" => "$reci[idtipo]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $cl['id_cliente'],
                        "nombre_cliente" => $cl['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $reci['concepto'],
                        // "descripcion" => $aux_descripcion,
                        //"(".$aux_concepto.")"
                        "archivo" => $qwe['archivo'],
                        "ingreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion  " => "si"
    
                    );

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                }else{
                        $saldo = $saldo + $qwe['monto'];
                }
 
                $res = array(
                    "fecha_nueva" => $fecha_nueva,
                    "tipo_documento" => 3,
                    "fecha" => $qwe['fecha'],
                    "idcomprobante" => $qwe['idcuentaspof'],
                    "nrecibo" => $qwe['nrecibo'],
                    "lugar" => $qwe['lugar'],
                    "persona" => $qwe['persona'],
                    "ci" => $qwe['ci'],
                    "factura_recibo" => "recibo",
                    "idrecibo" => "$reci[idrecibo]",
                    "nro_documento" => "$reci[nro_recibo]",
                    "por_concepto_de" => "$reci[concepto]",
                    "idotras_cuentas" => "$reci[idotras_cuentas]",
                    "estado_documento" => $estado_documento,
                    // "idtipo" => "$oc[idtipo]",
                    "codigotransaccion" => $tr['codigotransaccion'],
                    "id_cliente" => $cl['id_cliente'],
                    "nombre_cliente" => $cl['nombre'],
                    //descripcion saldra de la factura o otras cuentas
                    "descripcion" => $reci['concepto'], 
                    // "descripcion" => $aux_descripcion,
                    "archivo" => $qwe['archivo'],
                    "ingreso" => $qwe['monto'],
                    "monto" => $qwe['monto'],
                    "saldo_inicial" => $saldo_inicial,
                    "saldo" => $saldo,
                    "registro_desde" => $qwe['registro_desde'],
                    "pertenece_contratacion  " => "si"

                );
            }

            }else{

                if($fact['tipo_factura'] == 'contado'){ //factura al contado
                    $aux_descripcion = $fact['por_concepto_de'];
                    $nro_documento = $fact['nfactura'];
                }else{ // factura a credito
                    $aux_descripcion = $qwe['concepto'];
                    $nro_documento = '-';
                }

                // $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));
                // $aux_descripcion = "s/g doc N° $fact[nfactura] de: $fecha_nueva";

                 $aux_factura = "cero $fact[nfactura]";
                 $factu = str_replace("cero ", "", $aux_factura);

                 if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA

                    $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                    FROM detalle_caja_bancos_cobrar dc
                    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
                    WHERE dc.idcaja_bancos IN ($caja_bancos)
                    AND cp.fecha < '$fecha_ini';");
                // $saldo = 0;
                while ($zxc = $this->dbc->fetch($fuera_rango)) {
                    if($zxc['estado'] == '4'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                        $saldo = $saldo + $zxc['monto'];
                    }
                }

                $saldo_inicial = $saldo;

                if($qwe['estado'] == '4'){
                        // no sumara nada porque el documento esta anulado
                }else{
                        $saldo = $saldo + $qwe['monto'];
                }

                    $res = array(
                        // "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 1,
                        "idcomprobante" => $qwe['idcuentaspof'],
                        "fecha" => $qwe['fecha'],
                        "nrecibo" => $qwe['nrecibo'],
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "factura",
                        "idfactura" => $fact['idfactura'],
                        "nro_documento" => "$nro_documento",
                        "por_concepto_de" => "$fact[por_concepto_de]",
                        "idotras_cuentas" => "$fact[idotras_cuentas]",
                        "estado_documento" => $estado_documento,
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
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion" => 'si'
    
                    );

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                }else{
                        $saldo = $saldo + $qwe['monto'];
                }

                $res = array(
                    // "fecha_nueva" => $fecha_nueva,
                    "tipo_documento" => 1,
                    "idcomprobante" => $qwe['idcuentaspof'],
                    "fecha" => $qwe['fecha'],
                    "nrecibo" => $qwe['nrecibo'],
                    "lugar" => $qwe['lugar'],
                    "persona" => $qwe['persona'],
                    "ci" => $qwe['ci'],
                    "factura_recibo" => "factura",
                    "idfactura" => $fact['idfactura'],
                    "nro_documento" => "$nro_documento",
                    "por_concepto_de" => "$fact[por_concepto_de]",
                    "idotras_cuentas" => "$fact[idotras_cuentas]",
                    "estado_documento" => $estado_documento,
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
                    "registro_desde" => $qwe['registro_desde'],
                    "pertenece_contratacion" => 'si'
                );
            }

            }
          
            array_push($lista, $res);
        }
    
    }elseif($tipo_filtro == '2'){// tipo = 2 --> EGRESO     }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
//         ini_set('display_errors', 1);
//         ini_set('display_startup_errors', 1);
//         error_reporting(E_ALL);

        $getPedido = $this->dbc->query("SELECT cp.idrecibo,cp.idcuentaspor,cp.nrecibo,cp.lugar,cp.persona,cp.ci,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo,cp.registro_desde,cp.concepto, dc.idcaja_bancos,dc.monto
        FROM detalle_caja_bancos_pagar dc
        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
        WHERE dc.idcaja_bancos IN ($caja_bancos)
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
    
                    if($fact['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($fact['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                    $prov = $proveedor->fetch_assoc();
    
                }elseif($qwe['idrecibo'] == 0){
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
                    
                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                    $prov = $proveedor->fetch_assoc();
                }else{
                    // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
    
                    $recibo = $this->dbc->query("SELECT * 
                    FROM recibo
                    WHERE idrecibo = '$qwe[idrecibo]'");
    
                    $reci = $recibo->fetch_assoc();
    
                    if($reci['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($reci['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($reci['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($reci['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($reci['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }
                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$reci[cliente_proveedor]'");
                    $prov = $proveedor->fetch_assoc();
                }
    
                if($qwe['idrecibo'] != 0){
                    $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));

                    // $otras_cuentas = $this->dbc->query("SELECT * 
                    // FROM recibo
                    // WHERE idrecibo = '$qwe[idrecibo]'");
                    $otras_cuentas = $this->dbc->query("SELECT * 
                    FROM otras_cuentas
                    WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                    $oc = $otras_cuentas->fetch_assoc();

                    // if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                    //     $aux_descripcion = $reci['concepto'];
                    // }else{
                    //     $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                    // }
    
                    if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA
    
                        $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspor,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                        FROM detalle_caja_bancos_pagar dc
                        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
                        WHERE dc.idcaja_bancos IN ($caja_bancos)
                        AND cp.fecha < '$fecha_ini'
                        ORDER BY cp.fecha ASC;");
                    // $saldo = 0;
                    while ($zxc = $this->dbc->fetch($fuera_rango)) {
                        if($zxc['estado'] == '4'){
                            // no sumara nada porque el documento esta anulado
                        }else{
                            $saldo = $saldo + $zxc['monto'];
                        }
                    }

                    $saldo_inicial = $saldo;

                    if($qwe['estado'] == '4'){
                            // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }
                        $res = array(
                            "fecha_nueva" => $fecha_nueva,
                            "tipo_documento" => 4,
                            "idcomprobante" => $qwe['idcuentaspor'],
                            "fecha" => $qwe['fecha'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "recibo",
                            "idrecibo" => "$reci[idrecibo]",
                            "nro_documento" => "$reci[nro_recibo]",
                            "por_concepto_de" => "$reci[concepto]",
                            "idotras_cuentas" => "$reci[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
                            // "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $prov['id_proveedor'],
                            "nombre_cliente" => $prov['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            // "descripcion" => $aux_descripcion,
                            "descripcion" => $reci['concepto'],
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => "si"
        
                        );
    
                        //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                        $aux_contador = 1;
                    }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA
    
                    if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }

                    $res = array(
                        "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 4,
                        "idcomprobante" => $qwe['idcuentaspor'],
                        "fecha" => $qwe['fecha'],
                        "nrecibo" => $qwe['nrecibo'],
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "recibo",
                        "idrecibo" => "$reci[idrecibo]",
                        "nro_documento" => "$reci[nro_recibo]",
                        "por_concepto_de" => "$reci[concepto]",
                        "idotras_cuentas" => "$reci[idotras_cuentas]",
                        "estado_documento" => $estado_documento,
                        // "idtipo" => "$oc[idtipo]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $prov['id_proveedor'],
                        "nombre_cliente" => $prov['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        // "descripcion" => $aux_descripcion,
                        "descripcion" => $reci['concepto'],
                        "archivo" => $qwe['archivo'],
                        "egreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion" => "si"
    
                    );
                }
    
                }else{

                    if($fact['tipo_factura'] == 'contado'){ //factura al contado
                        $aux_descripcion = $fact['por_concepto_de'];
                        $nro_documento = $fact['nfactura'];
                    }else{ // factura a credito
                        $aux_descripcion = $qwe['concepto'];
                        $nro_documento = '-';
                    }

                     $aux_factura = "cero $fact[nfactura]";
                     $factu = str_replace("cero ", "", $aux_factura);
    
                     if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA
    
                        $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspor,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                        FROM detalle_caja_bancos_pagar dc
                        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
                        WHERE dc.idcaja_bancos IN ($caja_bancos)
                        AND cp.fecha < '$fecha_ini';");
                    // $saldo = 0;
                    while ($zxc = $this->dbc->fetch($fuera_rango)) {
                        if($zxc['estado'] == '4'){
                            // no sumara nada porque el documento esta anulado
                        }else{
                            $saldo = $saldo + $zxc['monto'];
                        }
                    }

                    $saldo_inicial = $saldo;

                    if($qwe['estado'] == '4'){
                            // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }
                        $res = array(
                            // "fecha_nueva" => $fecha_nueva,
                            "tipo_documento" => 2,
                            "idcomprobante" => $qwe['idcuentaspor'],
                            "fecha" => $qwe['fecha'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "factura",
                            "idfactura" => $fact['idfactura'],
                            "nro_documento" => "$nro_documento",
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "idotras_cuentas" => "$fact[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $prov['id_proveedor'],
                            "nombre_cliente" => $prov['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => 'si'
        
                        );
    
                        //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                        $aux_contador = 1;
                    }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA
    
                    if($qwe['estado'] == '4'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }
                    $res = array(
                        "fecha" => $qwe['fecha'],
                        "tipo_documento" => 2,
                        "idcomprobante" => $qwe['idcuentaspor'],
                        "nrecibo" => $qwe['nrecibo'],
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "factura",
                        "idfactura" => $fact['idfactura'],
                        "nro_documento" => "$nro_documento",
                        "por_concepto_de" => "$fact[por_concepto_de]",
                        "idotras_cuentas" => "$fact[idotras_cuentas]",
                        "estado_documento" => $estado_documento,
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $prov['id_proveedor'],
                        "nombre_cliente" => $prov['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $aux_descripcion,
                        "archivo" => $qwe['archivo'],
                        "egreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion" => 'si'
    
                    );
                }
                }
              
                array_push($lista, $res);
            }

    }else{// TIPO = 3 --> TODOS 

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $getPedido = $this->dbc->query("SELECT 
            cp.idcuentaspor AS id_cuenta,
            cp.idrecibo,
            cp.nrecibo,
            cp.lugar,
            cp.persona,
            cp.ci, 
            cp.fecha, 
            cp.transaccion, 
            cp.cliente, 
            cp.idfactura, 
            cp.idotras_cuentas, 
            cp.archivo, 
            cp.registro_desde, 
            cp.concepto,
            dc.idcaja_bancos, 
            dc.monto, 
            dc.idfactura,
            'PAGAR' AS tipo
        FROM detalle_caja_bancos_pagar dc
        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
        WHERE dc.idcaja_bancos IN ($caja_bancos)
        AND cp.fecha BETWEEN '$fecha_ini' AND '$fecha_fin'

        UNION

        SELECT 
            cp.idcuentaspof AS id_cuenta,
            cp.idrecibo, 
            cp.nrecibo,
            cp.lugar,
            cp.persona,
            cp.ci,  
            cp.fecha,
            cp.transaccion, 
            cp.cliente,  
            cp.idfactura, 
            cp.idotras_cuentas, 
            cp.archivo,
            cp.registro_desde, 
            cp.concepto,
            dc.idcaja_bancos, 
            dc.monto, 
            dc.idfactura,
            'COBRAR' AS tipo
        FROM detalle_caja_bancos_cobrar dc
        INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
        WHERE dc.idcaja_bancos IN ($caja_bancos)
        AND cp.fecha BETWEEN '$fecha_ini' AND '$fecha_fin'

        ORDER BY fecha ASC;");
    
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
        
                        if($fact['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($fact['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $cliente->fetch_assoc();
        
                    }elseif($qwe['idrecibo'] == 0){
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
                        
                        // if($fact['estado'] == '1'){ //ACTIVO
                        //     $estado_documento = "activo";
                        // }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                        //     $estado_documento = "pendiente anulacion";
                        // }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                        //     $estado_documento = "pendiente eliminacion";
                        // }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                        //     $estado_documento = "pendiente activacion";
                        // }

                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $cliente->fetch_assoc();
                    }else{
                        // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
        
                        $recibo = $this->dbc->query("SELECT * 
                        FROM recibo
                        WHERE idrecibo = '$qwe[idrecibo]'");
        
                        $reci = $recibo->fetch_assoc();
        
                        if($reci['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($reci['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($reci['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($reci['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($reci['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$reci[cliente_proveedor]'");
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
        
                        if($fact['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($fact['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $proveedor->fetch_assoc();
        
                    }elseif($qwe['idrecibo'] == 0){
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
                        
                        // if($fact['estado'] == '1'){ //ACTIVO
                        //     $estado_documento = "activo";
                        // }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                        //     $estado_documento = "pendiente anulacion";
                        // }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                        //     $estado_documento = "pendiente eliminacion";
                        // }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                        //     $estado_documento = "pendiente activacion";
                        // }

                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $proveedor->fetch_assoc();
                    }else{
                        // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
        
                        $recibo = $this->dbc->query("SELECT * 
                        FROM recibo
                        WHERE idrecibo = '$qwe[idrecibo]'");
        
                        $reci = $recibo->fetch_assoc();

                        if($reci['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($reci['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($reci['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($reci['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($reci['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$reci[cliente_proveedor]'");
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
                'COBRAR' AS tipo,
                cp.estado
            FROM detalle_caja_bancos_cobrar dc
            INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
            WHERE dc.idcaja_bancos IN ($caja_bancos)
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
                'PAGAR' AS tipo,
                cp.estado
            FROM detalle_caja_bancos_pagar dc
            INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
            WHERE dc.idcaja_bancos IN ($caja_bancos)
            AND cp.fecha < '$fecha_ini'

            ORDER BY fecha ASC, nrecibo ASC;");
                // $saldo = 0;
                while ($zxc = $this->dbc->fetch($fuera_rango)) {
                    if($zxc['estado'] == '4'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                        if($zxc['tipo'] == 'COBRAR'){
                            $saldo = $saldo + $zxc['monto'];
                        }else{
                            $saldo = $saldo - $zxc['monto'];
                        }
                    }
                    
                }
                $saldo_inicial = $saldo;

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                // $saldo = $saldo + $qwe['monto'];
     
            }
                //----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                if($qwe['tipo'] == 'COBRAR'){

                    if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }

                    if($qwe['idrecibo'] != 0){
                        //Según documento N° 11 de 24/04/2025
                        $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));
                        // $aux_descripcion = "s/g doc N° $reci[nro_recibo] de: $fecha_nueva";
                        $otras_cuentas = $this->dbc->query("SELECT * 
                        FROM otras_cuentas
                        WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                        $oc = $otras_cuentas->fetch_assoc();

                        // if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        //     $aux_descripcion = $reci['concepto'];
                        // }else{
                        //     $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        // }

                  
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 3,
                            "idcomprobante" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "recibo",
                            "idrecibo" => "$reci[idrecibo]",
                            "nro_documento" => "$reci[nro_recibo]",
                            "por_concepto_de" => "$reci[concepto]",
                            "idotras_cuentas" => "$reci[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
                            // "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_cliente'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $reci['concepto'],
                            "archivo" => $qwe['archivo'],
                            "ingreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => "si"
                        );
                    }else{
                        $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));

                        // if($fact['idotras_cuentas'] == '0' || $fact['idotras_cuentas'] == null){ //ESTA FACTURA NOO PERTENECE A CONTRATO, NO TENDRA "s/g Contrato"
                        //     $aux_descripcion = $fact['por_concepto_de'];
                        //     $pertenece_contrato = "no";
                        // }else{
                        //     //ESTA FACTURA SII PERTENECE A CONTRATO
                   
                        //     $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$fact[idotras_cuentas]'");
                        //     $oc = $otras_cuentas->fetch_assoc();

                        //     if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        //         $aux_descripcion = $fact['por_concepto_de'];
                        //     }else{
                        //         $aux_descripcion = $fact['por_concepto_de']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        //     }

                        //     $pertenece_contrato = "si";
                        // }
        
                        if($fact['tipo_factura'] == 'contado'){ //factura al contado
                            $aux_descripcion = $fact['por_concepto_de'];
                            $nro_documento = $fact['nfactura'];
                        }else{ // factura a credito
                            $aux_descripcion = $qwe['concepto'];
                            $nro_documento = '-';
                        }

                         $aux_factura = "cero $fact[nfactura]";
                         $factu = str_replace("cero ", "", $aux_factura);
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 1,
                            "idcomprobante" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "factura",
                            "idfactura" => $fact['idfactura'],
                            "nro_documento" => $nro_documento,
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "idotras_cuentas" => "$fact[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
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
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => 'si'
                        );
                    }
                }else{ // PAGAR


                    if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo - $qwe['monto'];
                    }
                    if($qwe['idrecibo'] != 0){
                        $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));
                        // $aux_descripcion = "s/g doc N° $reci[nro_recibo] de: $fecha_nueva";
                        $otras_cuentas = $this->dbc->query("SELECT * 
                        FROM otras_cuentas
                        WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                        $oc = $otras_cuentas->fetch_assoc();

                        // if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        //     $aux_descripcion = $reci['concepto'];
                        // }else{
                        //     $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        // }
        
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 4,
                            "idcomprobante" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "recibo",
                            "idrecibo" => "$reci[idrecibo]",
                            "nro_documento" => "$reci[nro_recibo]",
                            "por_concepto_de" => "$reci[concepto]",
                            "idotras_cuentas" => "$reci[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
                            // "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_proveedor'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $reci['concepto'],
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => "si"
                        );
                    }else{
                        $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));

                        // if($fact['idotras_cuentas'] == '0' || $fact['idotras_cuentas'] == null){ //ESTA FACTURA NO PERTENECE A CONTRATO, NO TENDRA "s/g Contrato"
                        //     $aux_descripcion = $fact['por_concepto_de'];
                        //     $pertenece_contrato = "no";
                        // }else{
                        //     //ESTA FACTURA SII PERTENECE A CONTRATO
                   
                        //     $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$fact[idotras_cuentas]'");
                        //     $oc = $otras_cuentas->fetch_assoc();

                        //     if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        //         $aux_descripcion = $fact['por_concepto_de'];
                        //     }else{
                        //         $aux_descripcion = $fact['por_concepto_de']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        //     }

                        //     $pertenece_contrato = "si";
                        // }
        
                        if($fact['tipo_factura'] == 'contado'){ //factura al contado
                            $aux_descripcion = $fact['por_concepto_de'];
                            $nro_documento = $fact['nfactura'];
                        }else{ // factura a credito
                            $aux_descripcion = $qwe['concepto'];
                            $nro_documento = '-';
                        }

                         $aux_factura = "cero $fact[nfactura]";
                         $factu = str_replace("cero ", "", $aux_factura);
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 2,
                            "idcomprobante" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "factura",
                            "idfactura" => $fact['idfactura'],
                            "nro_documento" => $nro_documento,
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "idotras_cuentas" => "$fact[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
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
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => 'si'
                        );
                    }
                }
                
              
                array_push($lista, $res);
            }

    }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_recibo_por_caja_bancos_saldo($cadena_cajaBancos,$tipo_filtro) {

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);

        $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
        $caja_bancos = implode(",", $array_cajaBancos);

    if($tipo_filtro == '1'){ //TIPO = 1 --> INGRESO,  2-->EGRESO, 3--> AMBOS

    $getPedido = $this->dbc->query("SELECT cp.idrecibo,cp.idcuentaspof,cp.nrecibo,cp.lugar,cp.persona,cp.ci,cp.fecha,cp.estado,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo,cp.registro_desde,cp.concepto, dc.idcaja_bancos,dc.monto
    FROM detalle_caja_bancos_cobrar dc
    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
    WHERE dc.idcaja_bancos IN ($caja_bancos)
    -- AND cp.fecha >= '$fecha_ini'
    -- AND cp.fecha <= '$fecha_fin'
    ORDER BY cp.fecha ASC;");

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

                if($fact['estado'] == '1'){ //ACTIVO
                    $estado_documento = "activo";
                }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                    $estado_documento = "pendiente anulacion";
                }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                    $estado_documento = "pendiente eliminacion";
                }elseif($fact['estado'] == '4'){// ANULADO
                    $estado_documento = "anulado";
                }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                    $estado_documento = "pendiente activacion";
                }

                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                $cl = $cliente->fetch_assoc();

            }elseif($qwe['idrecibo'] == 0){
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

                $recibo = $this->dbc->query("SELECT * 
                FROM recibo
                WHERE idrecibo = '$qwe[idrecibo]'");

                $reci = $recibo->fetch_assoc();

                if($reci['estado'] == '1'){ //ACTIVO
                    $estado_documento = "activo";
                }elseif($reci['estado'] == '2'){ // PENDIENTE DE ANULACION
                    $estado_documento = "pendiente anulacion";
                }elseif($reci['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                    $estado_documento = "pendiente eliminacion";
                }elseif($reci['estado'] == '4'){// ANULADO
                    $estado_documento = "anulado";
                }elseif($reci['estado'] == '5'){// PENDIENTE DE ACTIVACION
                    $estado_documento = "pendiente activacion";
                }
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$reci[cliente_proveedor]'");
                $cl = $cliente->fetch_assoc();
            }

            if($qwe['idrecibo'] != '0'){

                $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));

                $otras_cuentas = $this->dbc->query("SELECT * 
                FROM otras_cuentas
                WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                $oc = $otras_cuentas->fetch_assoc();

                    // if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                    //     $aux_descripcion = $reci['concepto'];
                    // }else{
                    //     $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                    // }

                if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA

                    $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.estado,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                    FROM detalle_caja_bancos_cobrar dc
                    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
                    WHERE dc.idcaja_bancos IN ($caja_bancos)
                    -- AND cp.fecha < '$fecha_ini'
                    ");
                // $saldo = 0;
                // while ($zxc = $this->dbc->fetch($fuera_rango)) {
                //     if($zxc['estado'] == '4'){
                //         // no sumara nada porque el documento esta anulado
                //     }else{
                //         $saldo = $saldo + $zxc['monto'];
                //     }
                // }

                // $saldo_inicial = $saldo;

                if($qwe['estado'] == '4'){
                        // no sumara nada porque el documento esta anulado
                }else{
                        $saldo = $saldo + $qwe['monto'];
                }

                    $res = array(
                        "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 3,
                        "fecha" => $qwe['fecha'],
                        "idcomprobante" => $qwe['idcuentaspof'],
                        "nrecibo" => $qwe['nrecibo'],
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "recibo",
                        "idrecibo" => "$reci[idrecibo]",
                        "nro_documento" => "$reci[nro_recibo]",
                        "por_concepto_de" => "$reci[concepto]",
                        "idotras_cuentas" => "$reci[idotras_cuentas]",
                        "estado_documento" => $estado_documento,
                        // "idtipo" => "$reci[idtipo]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $cl['id_cliente'],
                        "nombre_cliente" => $cl['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $reci['concepto'],
                        // "descripcion" => $aux_descripcion,
                        //"(".$aux_concepto.")"
                        "archivo" => $qwe['archivo'],
                        "ingreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion  " => "si"
    
                    );

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                }else{
                        $saldo = $saldo + $qwe['monto'];
                }
 
                $res = array(
                    "fecha_nueva" => $fecha_nueva,
                    "tipo_documento" => 3,
                    "fecha" => $qwe['fecha'],
                    "idcomprobante" => $qwe['idcuentaspof'],
                    "nrecibo" => $qwe['nrecibo'],
                    "lugar" => $qwe['lugar'],
                    "persona" => $qwe['persona'],
                    "ci" => $qwe['ci'],
                    "factura_recibo" => "recibo",
                    "idrecibo" => "$reci[idrecibo]",
                    "nro_documento" => "$reci[nro_recibo]",
                    "por_concepto_de" => "$reci[concepto]",
                    "idotras_cuentas" => "$reci[idotras_cuentas]",
                    "estado_documento" => $estado_documento,
                    // "idtipo" => "$oc[idtipo]",
                    "codigotransaccion" => $tr['codigotransaccion'],
                    "id_cliente" => $cl['id_cliente'],
                    "nombre_cliente" => $cl['nombre'],
                    //descripcion saldra de la factura o otras cuentas
                    "descripcion" => $reci['concepto'], 
                    // "descripcion" => $aux_descripcion,
                    "archivo" => $qwe['archivo'],
                    "ingreso" => $qwe['monto'],
                    "monto" => $qwe['monto'],
                    "saldo_inicial" => $saldo_inicial,
                    "saldo" => $saldo,
                    "registro_desde" => $qwe['registro_desde'],
                    "pertenece_contratacion  " => "si"

                );
            }

            }else{

                if($fact['tipo_factura'] == 'contado'){ //factura al contado
                    $aux_descripcion = $fact['por_concepto_de'];
                    $nro_documento = $fact['nfactura'];
                }else{ // factura a credito
                    $aux_descripcion = $qwe['concepto'];
                    $nro_documento = '-';
                }

                // $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));
                // $aux_descripcion = "s/g doc N° $fact[nfactura] de: $fecha_nueva";

                 $aux_factura = "cero $fact[nfactura]";
                 $factu = str_replace("cero ", "", $aux_factura);

                 if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA

                    $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                    FROM detalle_caja_bancos_cobrar dc
                    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
                    WHERE dc.idcaja_bancos IN ($caja_bancos)
                    -- AND cp.fecha < '$fecha_ini';
                    ");
                // $saldo = 0;
                // while ($zxc = $this->dbc->fetch($fuera_rango)) {
                //     if($zxc['estado'] == '4'){
                //         // no sumara nada porque el documento esta anulado
                //     }else{
                //         $saldo = $saldo + $zxc['monto'];
                //     }
                // }

                // $saldo_inicial = $saldo;

                if($qwe['estado'] == '4'){
                        // no sumara nada porque el documento esta anulado
                }else{
                        $saldo = $saldo + $qwe['monto'];
                }

                    $res = array(
                        // "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 1,
                        "idcomprobante" => $qwe['idcuentaspof'],
                        "fecha" => $qwe['fecha'],
                        "nrecibo" => $qwe['nrecibo'],
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "factura",
                        "idfactura" => $fact['idfactura'],
                        "nro_documento" => "$nro_documento",
                        "por_concepto_de" => "$fact[por_concepto_de]",
                        "idotras_cuentas" => "$fact[idotras_cuentas]",
                        "estado_documento" => $estado_documento,
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
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion" => 'si'
    
                    );

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                }else{
                        $saldo = $saldo + $qwe['monto'];
                }

                $res = array(
                    // "fecha_nueva" => $fecha_nueva,
                    "tipo_documento" => 1,
                    "idcomprobante" => $qwe['idcuentaspof'],
                    "fecha" => $qwe['fecha'],
                    "nrecibo" => $qwe['nrecibo'],
                    "lugar" => $qwe['lugar'],
                    "persona" => $qwe['persona'],
                    "ci" => $qwe['ci'],
                    "factura_recibo" => "factura",
                    "idfactura" => $fact['idfactura'],
                    "nro_documento" => "$nro_documento",
                    "por_concepto_de" => "$fact[por_concepto_de]",
                    "idotras_cuentas" => "$fact[idotras_cuentas]",
                    "estado_documento" => $estado_documento,
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
                    "registro_desde" => $qwe['registro_desde'],
                    "pertenece_contratacion" => 'si'
                );
            }

            }
          
            array_push($lista, $res);
        }
    
    }elseif($tipo_filtro == '2'){// tipo = 2 --> EGRESO     }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
//         ini_set('display_errors', 1);
//         ini_set('display_startup_errors', 1);
//         error_reporting(E_ALL);

        $getPedido = $this->dbc->query("SELECT cp.idrecibo,cp.idcuentaspor,cp.nrecibo,cp.lugar,cp.persona,cp.ci,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo,cp.registro_desde,cp.concepto, dc.idcaja_bancos,dc.monto
        FROM detalle_caja_bancos_pagar dc
        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
        WHERE dc.idcaja_bancos IN ($caja_bancos)
        -- AND cp.fecha >= '$fecha_ini'
        -- AND cp.fecha <= '$fecha_fin'
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
    
                    if($fact['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($fact['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                    $prov = $proveedor->fetch_assoc();
    
                }elseif($qwe['idrecibo'] == 0){
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
                    
                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                    $prov = $proveedor->fetch_assoc();
                }else{
                    // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
    
                    $recibo = $this->dbc->query("SELECT * 
                    FROM recibo
                    WHERE idrecibo = '$qwe[idrecibo]'");
    
                    $reci = $recibo->fetch_assoc();
    
                    if($reci['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($reci['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($reci['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($reci['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($reci['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }
                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$reci[cliente_proveedor]'");
                    $prov = $proveedor->fetch_assoc();
                }
    
                if($qwe['idrecibo'] != 0){
                    $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));

                    // $otras_cuentas = $this->dbc->query("SELECT * 
                    // FROM recibo
                    // WHERE idrecibo = '$qwe[idrecibo]'");
                    $otras_cuentas = $this->dbc->query("SELECT * 
                    FROM otras_cuentas
                    WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                    $oc = $otras_cuentas->fetch_assoc();

                    // if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                    //     $aux_descripcion = $reci['concepto'];
                    // }else{
                    //     $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                    // }
    
                    if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA
    
                        $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspor,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                        FROM detalle_caja_bancos_pagar dc
                        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
                        WHERE dc.idcaja_bancos IN ($caja_bancos)
                        -- AND cp.fecha < '$fecha_ini'
                        ORDER BY cp.fecha ASC;");
                    // $saldo = 0;
                    // while ($zxc = $this->dbc->fetch($fuera_rango)) {
                    //     if($zxc['estado'] == '4'){
                    //         // no sumara nada porque el documento esta anulado
                    //     }else{
                    //         $saldo = $saldo + $zxc['monto'];
                    //     }
                    // }

                    // $saldo_inicial = $saldo;

                    if($qwe['estado'] == '4'){
                            // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }
                        $res = array(
                            "fecha_nueva" => $fecha_nueva,
                            "tipo_documento" => 4,
                            "idcomprobante" => $qwe['idcuentaspor'],
                            "fecha" => $qwe['fecha'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "recibo",
                            "idrecibo" => "$reci[idrecibo]",
                            "nro_documento" => "$reci[nro_recibo]",
                            "por_concepto_de" => "$reci[concepto]",
                            "idotras_cuentas" => "$reci[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
                            // "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $prov['id_proveedor'],
                            "nombre_cliente" => $prov['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            // "descripcion" => $aux_descripcion,
                            "descripcion" => $reci['concepto'],
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => "si"
        
                        );
    
                        //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                        $aux_contador = 1;
                    }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA
    
                    if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }

                    $res = array(
                        "fecha_nueva" => $fecha_nueva,
                        "tipo_documento" => 4,
                        "idcomprobante" => $qwe['idcuentaspor'],
                        "fecha" => $qwe['fecha'],
                        "nrecibo" => $qwe['nrecibo'],
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "recibo",
                        "idrecibo" => "$reci[idrecibo]",
                        "nro_documento" => "$reci[nro_recibo]",
                        "por_concepto_de" => "$reci[concepto]",
                        "idotras_cuentas" => "$reci[idotras_cuentas]",
                        "estado_documento" => $estado_documento,
                        // "idtipo" => "$oc[idtipo]",
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $prov['id_proveedor'],
                        "nombre_cliente" => $prov['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        // "descripcion" => $aux_descripcion,
                        "descripcion" => $reci['concepto'],
                        "archivo" => $qwe['archivo'],
                        "egreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion" => "si"
    
                    );
                }
    
                }else{

                    if($fact['tipo_factura'] == 'contado'){ //factura al contado
                        $aux_descripcion = $fact['por_concepto_de'];
                        $nro_documento = $fact['nfactura'];
                    }else{ // factura a credito
                        $aux_descripcion = $qwe['concepto'];
                        $nro_documento = '-';
                    }

                     $aux_factura = "cero $fact[nfactura]";
                     $factu = str_replace("cero ", "", $aux_factura);
    
                     if($aux_contador == 0){ //ESTAMOS EN PRIMERA FILA, SUMAR LAS ANTERIORES FILAS A LA FECHA
    
                        $fuera_rango = $this->dbc->query("SELECT cp.idcuentaspor,cp.nrecibo,cp.fecha,cp.transaccion,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura
                        FROM detalle_caja_bancos_pagar dc
                        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
                        WHERE dc.idcaja_bancos IN ($caja_bancos)
                        -- AND cp.fecha < '$fecha_ini';
                        ");
                    // $saldo = 0;
                    // while ($zxc = $this->dbc->fetch($fuera_rango)) {
                    //     if($zxc['estado'] == '4'){
                    //         // no sumara nada porque el documento esta anulado
                    //     }else{
                    //         $saldo = $saldo + $zxc['monto'];
                    //     }
                    // }

                    // $saldo_inicial = $saldo;

                    if($qwe['estado'] == '4'){
                            // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }
                        $res = array(
                            // "fecha_nueva" => $fecha_nueva,
                            "tipo_documento" => 2,
                            "idcomprobante" => $qwe['idcuentaspor'],
                            "fecha" => $qwe['fecha'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "factura",
                            "idfactura" => $fact['idfactura'],
                            "nro_documento" => "$nro_documento",
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "idotras_cuentas" => "$fact[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $prov['id_proveedor'],
                            "nombre_cliente" => $prov['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $aux_descripcion,
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => 'si'
        
                        );
    
                        //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                        $aux_contador = 1;
                    }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA
    
                    if($qwe['estado'] == '4'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }
                    $res = array(
                        "fecha" => $qwe['fecha'],
                        "tipo_documento" => 2,
                        "idcomprobante" => $qwe['idcuentaspor'],
                        "nrecibo" => $qwe['nrecibo'],
                        "lugar" => $qwe['lugar'],
                        "persona" => $qwe['persona'],
                        "ci" => $qwe['ci'],
                        "factura_recibo" => "factura",
                        "idfactura" => $fact['idfactura'],
                        "nro_documento" => "$nro_documento",
                        "por_concepto_de" => "$fact[por_concepto_de]",
                        "idotras_cuentas" => "$fact[idotras_cuentas]",
                        "estado_documento" => $estado_documento,
                        "codigotransaccion" => $tr['codigotransaccion'],
                        "id_cliente" => $prov['id_proveedor'],
                        "nombre_cliente" => $prov['nombre'],
                        //descripcion saldra de la factura o otras cuentas 
                        "descripcion" => $aux_descripcion,
                        "archivo" => $qwe['archivo'],
                        "egreso" => $qwe['monto'],
                        "monto" => $qwe['monto'],
                        "saldo_inicial" => $saldo_inicial,
                        "saldo" => $saldo,
                        "registro_desde" => $qwe['registro_desde'],
                        "pertenece_contratacion" => 'si'
    
                    );
                }
                }
              
                array_push($lista, $res);
            }

    }else{// TIPO = 3 --> TODOS 

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $getPedido = $this->dbc->query("SELECT 
            cp.idcuentaspor AS id_cuenta,
            cp.idrecibo,
            cp.nrecibo,
            cp.lugar,
            cp.persona,
            cp.ci, 
            cp.fecha, 
            cp.transaccion, 
            cp.cliente, 
            cp.idfactura, 
            cp.idotras_cuentas, 
            cp.archivo, 
            cp.registro_desde, 
            cp.concepto,
            dc.idcaja_bancos, 
            dc.monto, 
            dc.idfactura,
            'PAGAR' AS tipo
        FROM detalle_caja_bancos_pagar dc
        INNER JOIN cuentaspor cp ON cp.idcuentaspor = dc.idcuentaspor
        WHERE dc.idcaja_bancos IN ($caja_bancos)
        -- AND cp.fecha BETWEEN '$fecha_ini' AND '$fecha_fin'

        UNION

        SELECT 
            cp.idcuentaspof AS id_cuenta,
            cp.idrecibo, 
            cp.nrecibo,
            cp.lugar,
            cp.persona,
            cp.ci,  
            cp.fecha,
            cp.transaccion, 
            cp.cliente,  
            cp.idfactura, 
            cp.idotras_cuentas, 
            cp.archivo,
            cp.registro_desde, 
            cp.concepto,
            dc.idcaja_bancos, 
            dc.monto, 
            dc.idfactura,
            'COBRAR' AS tipo
        FROM detalle_caja_bancos_cobrar dc
        INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
        WHERE dc.idcaja_bancos IN ($caja_bancos)
        -- AND cp.fecha BETWEEN '$fecha_ini' AND '$fecha_fin'

        ORDER BY fecha ASC;");
    
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
        
                        if($fact['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($fact['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $cliente->fetch_assoc();
        
                    }elseif($qwe['idrecibo'] == 0){
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
                        
                        // if($fact['estado'] == '1'){ //ACTIVO
                        //     $estado_documento = "activo";
                        // }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                        //     $estado_documento = "pendiente anulacion";
                        // }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                        //     $estado_documento = "pendiente eliminacion";
                        // }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                        //     $estado_documento = "pendiente activacion";
                        // }

                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $cliente->fetch_assoc();
                    }else{
                        // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
        
                        $recibo = $this->dbc->query("SELECT * 
                        FROM recibo
                        WHERE idrecibo = '$qwe[idrecibo]'");
        
                        $reci = $recibo->fetch_assoc();
        
                        if($reci['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($reci['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($reci['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($reci['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($reci['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$reci[cliente_proveedor]'");
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
        
                        if($fact['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($fact['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $proveedor->fetch_assoc();
        
                    }elseif($qwe['idrecibo'] == 0){
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
                        
                        // if($fact['estado'] == '1'){ //ACTIVO
                        //     $estado_documento = "activo";
                        // }elseif($fact['estado'] == '2'){ // PENDIENTE DE ANULACION
                        //     $estado_documento = "pendiente anulacion";
                        // }elseif($fact['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                        //     $estado_documento = "pendiente eliminacion";
                        // }elseif($fact['estado'] == '5'){// PENDIENTE DE ACTIVACION
                        //     $estado_documento = "pendiente activacion";
                        // }

                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$fact[proveedorcliente_idproveedorcliente]'");
                        $cl = $proveedor->fetch_assoc();
                    }else{
                        // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor
        
                        $recibo = $this->dbc->query("SELECT * 
                        FROM recibo
                        WHERE idrecibo = '$qwe[idrecibo]'");
        
                        $reci = $recibo->fetch_assoc();

                        if($reci['estado'] == '1'){ //ACTIVO
                            $estado_documento = "activo";
                        }elseif($reci['estado'] == '2'){ // PENDIENTE DE ANULACION
                            $estado_documento = "pendiente anulacion";
                        }elseif($reci['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                            $estado_documento = "pendiente eliminacion";
                        }elseif($reci['estado'] == '4'){ // ANULADO
                            $estado_documento = "anulado";
                        }elseif($reci['estado'] == '5'){// PENDIENTE DE ACTIVACION
                            $estado_documento = "pendiente activacion";
                        }

                        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor= '$reci[cliente_proveedor]'");
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
            WHERE dc.idcaja_bancos IN ($caja_bancos)
            -- AND cp.fecha < '$fecha_ini'

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
            WHERE dc.idcaja_bancos IN ($caja_bancos)
            -- AND cp.fecha < '$fecha_ini'

            ORDER BY fecha ASC, nrecibo ASC;");
                // $saldo = 0;
                // while ($zxc = $this->dbc->fetch($fuera_rango)) {
                //     if($zxc['estado'] == '4'){
                //         // no sumara nada porque el documento esta anulado
                //     }else{
                //         if($zxc['tipo'] == 'COBRAR'){
                //             $saldo = $saldo + $zxc['monto'];
                //         }else{
                //             $saldo = $saldo - $zxc['monto'];
                //         }
                //     }
                    
                // }
                // $saldo_inicial = $saldo;

                    //AUMENTAR EL AUX_CONTADOR + 1 PARA QUE YANO VUELVA A ENTRAR A ESTA CONDICION
                    $aux_contador = 1;
                }else{ // ESTAMOS FILAS DESPUES DE LA PRIMERA FILA

                // $saldo = $saldo + $qwe['monto'];
     
            }
                //----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                if($qwe['tipo'] == 'COBRAR'){

                    if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo + $qwe['monto'];
                    }

                    if($qwe['idrecibo'] != 0){
                        //Según documento N° 11 de 24/04/2025
                        $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));
                        // $aux_descripcion = "s/g doc N° $reci[nro_recibo] de: $fecha_nueva";
                        $otras_cuentas = $this->dbc->query("SELECT * 
                        FROM otras_cuentas
                        WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                        $oc = $otras_cuentas->fetch_assoc();

                        // if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        //     $aux_descripcion = $reci['concepto'];
                        // }else{
                        //     $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        // }

                  
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 3,
                            "idcomprobante" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "recibo",
                            "idrecibo" => "$reci[idrecibo]",
                            "nro_documento" => "$reci[nro_recibo]",
                            "por_concepto_de" => "$reci[concepto]",
                            "idotras_cuentas" => "$reci[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
                            // "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_cliente'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $reci['concepto'],
                            "archivo" => $qwe['archivo'],
                            "ingreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => "si"
                        );
                    }else{
                        $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));

                        // if($fact['idotras_cuentas'] == '0' || $fact['idotras_cuentas'] == null){ //ESTA FACTURA NOO PERTENECE A CONTRATO, NO TENDRA "s/g Contrato"
                        //     $aux_descripcion = $fact['por_concepto_de'];
                        //     $pertenece_contrato = "no";
                        // }else{
                        //     //ESTA FACTURA SII PERTENECE A CONTRATO
                   
                        //     $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$fact[idotras_cuentas]'");
                        //     $oc = $otras_cuentas->fetch_assoc();

                        //     if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        //         $aux_descripcion = $fact['por_concepto_de'];
                        //     }else{
                        //         $aux_descripcion = $fact['por_concepto_de']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        //     }

                        //     $pertenece_contrato = "si";
                        // }
        
                        if($fact['tipo_factura'] == 'contado'){ //factura al contado
                            $aux_descripcion = $fact['por_concepto_de'];
                            $nro_documento = $fact['nfactura'];
                        }else{ // factura a credito
                            $aux_descripcion = $qwe['concepto'];
                            $nro_documento = '-';
                        }

                         $aux_factura = "cero $fact[nfactura]";
                         $factu = str_replace("cero ", "", $aux_factura);
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 1,
                            "idcomprobante" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "factura",
                            "idfactura" => $fact['idfactura'],
                            "nro_documento" => $nro_documento,
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "idotras_cuentas" => "$fact[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
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
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => 'si'
                        );
                    }
                }else{ // PAGAR


                    if($estado_documento == 'anulado'){
                        // no sumara nada porque el documento esta anulado
                    }else{
                            $saldo = $saldo - $qwe['monto'];
                    }
                    if($qwe['idrecibo'] != 0){
                        $fecha_nueva = date("d/m/Y", strtotime($reci['fecha']));
                        // $aux_descripcion = "s/g doc N° $reci[nro_recibo] de: $fecha_nueva";
                        $otras_cuentas = $this->dbc->query("SELECT * 
                        FROM otras_cuentas
                        WHERE idotras_cuentas = '$reci[idotras_cuentas]'");

                        $oc = $otras_cuentas->fetch_assoc();

                        // if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        //     $aux_descripcion = $reci['concepto'];
                        // }else{
                        //     $aux_descripcion = $reci['concepto']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        // }
        
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 4,
                            "idcomprobante" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "recibo",
                            "idrecibo" => "$reci[idrecibo]",
                            "nro_documento" => "$reci[nro_recibo]",
                            "por_concepto_de" => "$reci[concepto]",
                            "idotras_cuentas" => "$reci[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
                            // "idtipo" => "$oc[idtipo]",
                            "codigotransaccion" => $tr['codigotransaccion'],
                            "id_cliente" => $cl['id_proveedor'],
                            "nombre_cliente" => $cl['nombre'],
                            //descripcion saldra de la factura o otras cuentas 
                            "descripcion" => $reci['concepto'],
                            "archivo" => $qwe['archivo'],
                            "egreso" => $qwe['monto'],
                            "monto" => $qwe['monto'],
                            "saldo_inicial" => $saldo_inicial,
                            "saldo" => $saldo,
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => "si"
                        );
                    }else{
                        $fecha_nueva = date("d/m/Y", strtotime($fact['fecha']));

                        // if($fact['idotras_cuentas'] == '0' || $fact['idotras_cuentas'] == null){ //ESTA FACTURA NO PERTENECE A CONTRATO, NO TENDRA "s/g Contrato"
                        //     $aux_descripcion = $fact['por_concepto_de'];
                        //     $pertenece_contrato = "no";
                        // }else{
                        //     //ESTA FACTURA SII PERTENECE A CONTRATO
                   
                        //     $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$fact[idotras_cuentas]'");
                        //     $oc = $otras_cuentas->fetch_assoc();

                        //     if($oc['cobrado'] == '-1' && $oc['pagado'] == '-1'){ //CONTRATO GENERAL
                        //         $aux_descripcion = $fact['por_concepto_de'];
                        //     }else{
                        //         $aux_descripcion = $fact['por_concepto_de']."("."s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'].")"; // NO ES CONTRATO GENERAL
                        //     }

                        //     $pertenece_contrato = "si";
                        // }
        
                        if($fact['tipo_factura'] == 'contado'){ //factura al contado
                            $aux_descripcion = $fact['por_concepto_de'];
                            $nro_documento = $fact['nfactura'];
                        }else{ // factura a credito
                            $aux_descripcion = $qwe['concepto'];
                            $nro_documento = '-';
                        }

                         $aux_factura = "cero $fact[nfactura]";
                         $factu = str_replace("cero ", "", $aux_factura);
                        $res = array(
                            "fecha" => $qwe['fecha'],
                            "tipo_documento" => 2,
                            "idcomprobante" => $qwe['id_cuenta'],
                            "nrecibo" => $qwe['nrecibo'],
                            "lugar" => $qwe['lugar'],
                            "persona" => $qwe['persona'],
                            "ci" => $qwe['ci'],
                            "factura_recibo" => "factura",
                            "idfactura" => $fact['idfactura'],
                            "nro_documento" => $nro_documento,
                            "por_concepto_de" => $fact['por_concepto_de'],
                            "idotras_cuentas" => "$fact[idotras_cuentas]",
                            "estado_documento" => $estado_documento,
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
                            "registro_desde" => $qwe['registro_desde'],
                            "pertenece_contratacion" => 'si'
                        );
                    }
                }
                
              
                array_push($lista, $res);
            }

    }
    $ultimo = end($lista);
    $saldo_final = $ultimo['saldo'];
        echo json_encode($saldo_final, JSON_NUMERIC_CHECK);
    }
    public function registrar_caja_bancos_usuarios($idcaja_bancos,$idtrabajador,$funcion,$permiso_registrar,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM caja_banco_usuarios WHERE idcaja_bancos = '$idcaja_bancos' AND idtrabajador = '$idtrabajador'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO caja_banco_usuarios(idcaja_bancos,idtrabajador,funcion,permiso_registrar,idempresa) VALUES ('$idcaja_bancos','$idtrabajador','$funcion','$permiso_registrar','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }

     public function editar_caja_bancos_usuarios($idcaja_banco_usuario,$idcaja_bancos,$idtrabajador,$funcion,$permiso_registrar,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM caja_banco_usuarios WHERE idcaja_bancos = '$idcaja_bancos' AND idtrabajador = '$idtrabajador' AND idcaja_banco_usuarios != '$idcaja_banco_usuario'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("UPDATE caja_banco_usuarios 
            SET idtrabajador = '$idtrabajador',funcion = '$funcion',permiso_registrar = '$permiso_registrar' WHERE idcaja_banco_usuarios = '$idcaja_banco_usuario'");
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

        $lista_trabajador=$this->dbrh->query("SELECT t.idtrabajador,t.nombre as nombre_trabajador,t.apellido, t.ci,a.sucursal_idsucursal FROM trabajador t
        INNER JOIN cargos c on c.idcargos = t.cargos_idcargos
        INNER JOIN areas a on a.idareas = c.areas_idareas");

        while ($bb = $this->dbc->fetch($lista_trabajador)) {
            $lista_sucursal=$this->dbe->query("SELECT * FROM sucursalcontable WHERE idsucursalcontable = '$bb[sucursal_idsucursal]'");
            $sucur = $lista_sucursal->fetch_assoc();
            if($sucur['idorganizacion'] == $ide){
                 $lista_usuario=$this->dbrh->query("SELECT * FROM usuario WHERE trabajador_idtrabajador = '$bb[idtrabajador]'");
                 $usuario = $lista_usuario->fetch_assoc();
                //  if(){}
                $res = array(
                                "idusuario" => $usuario['idusuario'],
                                "idtrabajador" => $bb['idtrabajador'],
                                "nombre_usuario" => $usuario['nombre'],
                                "idempresa" => $sucur['idorganizacion'],
                                "nombre_trabajador" => $bb['nombre_trabajador']." ".$bb['apellido'],
                                "ci" => $bb['ci'],
                            );
                    array_push($lista, $res);
            }else{
                //no se añadira trabajador porq no es de la empresa q queremos
            }
            
        }
     
        echo json_encode($lista, JSON_NUMERIC_CHECK);

    }  
    public function listar_caja_bancos_usuarios($id){
        $lista = [];

        $registro2=$this->dbc->query("SELECT * FROM caja_banco_usuarios WHERE idcaja_bancos = '$id'");

        while ($bb = $this->dbc->fetch($registro2)) {
            
        $trabajador=$this->dbrh->query("SELECT * FROM trabajador
        WHERE idtrabajador = '$bb[idtrabajador]'");
        $traba = $trabajador->fetch_assoc();

            $registro3=$this->dbrh->query("SELECT * FROM usuario WHERE trabajador_idtrabajador = '$bb[idtrabajador]'");
            if($registro3->num_rows > 0){
                $usuario = $registro3->fetch_assoc();
            $res = array(
                "idcaja_banco_usuarios" => $bb['idcaja_banco_usuarios'],
                "idcaja_bancos" => $bb['idcaja_bancos'],
                "idusuario" => $usuario['idusuario'],
                "idtrabajador" => $bb['idtrabajador'],
                "nombre_usuario" => $usuario['nombre'],
                "nombre_trabajador" => $traba['nombre']." ".$traba['apellido'],
                "ci" => $traba['ci'],
                "funcion" => $bb['funcion'],
                "permiso_registrar" => $bb['permiso_registrar']
                
            );
            }else{
                $res = array(
                "idcaja_banco_usuarios" => $bb['idcaja_banco_usuarios'],
                "idcaja_bancos" => $bb['idcaja_bancos'],
                "idusuario" => NULL,
                "idtrabajador" => $bb['idtrabajador'],
                "nombre_usuario" => NULL,
                "nombre_trabajador" => $traba['nombre']." ".$traba['apellido'],
                "ci" => $traba['ci'],
                "funcion" => $bb['funcion'],
                "permiso_registrar" => $bb['permiso_registrar']
                
            );
            }
            
            array_push($lista, $res);
        }
  
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

    public function editar_caja_bancos_facturas($idcomprobante,$nfactura,$tipo_documento,$fecha,$monto,$por_concepto_de,$cliente_prov,$archivo,$lugar,$persona,$ci,$idotras_cuentas){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $res="";
        //tipo_documento = 1,2 facturas --> cobrar- pagar
        //LAS FACTURAS TODAS ESTAN PAGADAS Y COBRADAS, ENTONCES TODAS LAS FACTURAS Q SE EDITARAN YA TIENEN COMPROBANTES
        if($tipo_documento == 1){//COBRADO
            $recibo_grupal = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idcuentaspof = '$idcomprobante'");
            if ($recibo_grupal->num_rows > 0) {
                //es grupal, no se podra editar
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

            }else{
                //SE EDITARA FACTURA Y RECIBO
                $cuentaspof = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idcomprobante'");
                $resu = $this->dbc->fetch($cuentaspof);

                $fecha_nueva = $this->obtener_fecha_hora_nueva($resu['fecha'],$fecha);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idcomprobante'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_cobrar SET monto='$monto' WHERE idcuentaspof='$idcomprobante'");

                }else{
                    //no se edita detalle_cajaBancos
                }

                 // SE ESTA EDITANDO LA FACTURA Y EL COMPROBANTE

                $edicion_recibo = $this->editar_comprobante($fecha_nueva,$monto,$idcomprobante,$archivo,$tipo_documento,$lugar,$persona,$ci);
                // $edicion_recibo=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha_nueva',monto='$monto' WHERE idcuentaspof='$idcomprobante'");

                $edicion_factura=$this->dbc->query("UPDATE factura SET nfactura = '$nfactura',fecha='$fecha',montofactura='$monto',por_concepto_de='$por_concepto_de',proveedorcliente_idproveedorcliente='$cliente_prov',idotras_cuentas = '$idotras_cuentas' WHERE idfactura='$resu[idfactura]'");

            }
        }else{ //PAGADO
            $recibo_grupal = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idcuentaspor = '$idcomprobante'");
            if ($recibo_grupal->num_rows > 0) {
                //es grupal, no se podra editar
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

            }else{
                //SE EDITARA FACTURA Y RECIBO

                $cuentaspor = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idcomprobante'");
                $resu = $this->dbc->fetch($cuentaspor);

                $fecha_nueva = $this->obtener_fecha_hora_nueva($resu['fecha'],$fecha);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$idcomprobante'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_pagar SET monto='$monto' WHERE idcuentaspor='$idcomprobante'");

                }else{
                    //no se edita detalle_cajaBancos
                }
                $edicion_factura=$this->dbc->query("UPDATE factura SET nfactura = '$nfactura',fecha='$fecha',montofactura='$monto',por_concepto_de='$por_concepto_de',proveedorcliente_idproveedorcliente='$cliente_prov',idotras_cuentas = '$idotras_cuentas' WHERE idfactura='$resu[idfactura]'");

                $edicion_recibo = $this->editar_comprobante($fecha_nueva,$monto,$idcomprobante,$archivo,$tipo_documento,$lugar,$persona,$ci);
              
            }
        }

        if($edicion_factura===TRUE){
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal");
        }else{
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
        // echo json_encode(array($idcomprobante,$nfactura,$tipo_documento,$fecha,$monto,$por_concepto_de,$cliente_prov,$archivo,$lugar,$persona,$ci));
    }

    // public function editar_caja_bancos_otras_cuentas($idrecibo,$nro_documento,$tipo_documento,$fecha,$tipo,$precio,$concepto,$cliente_prov){
       
    //     $res="";
    //     //tipo_documento = 1,2 facturas --> cobrar- pagar
    //     if($tipo_documento == 1){//COBRAR   
    //         $recibo_grupal = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idcuentaspof = '$idrecibo'");
    //         if ($recibo_grupal->num_rows > 0) {
    //             //es grupal, no se podra editar
    //             $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

    //         }else{
    //             //SE EDITARA FACTURA Y RECIBO
    //             $cuentaspof = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");
    //             $resu = $this->dbc->fetch($cuentaspof);

    //             $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idrecibo'");

    //             if ($dt_cajas->num_rows > 0) {

    //                 $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_cobrar SET monto='$precio' WHERE idcuentaspof='$idrecibo'");

    //             }else{
    //                 //no se edita detalle_cajaBancos
    //             }

    //             $edicion_recibo=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha',monto='$precio' WHERE idcuentaspof='$idrecibo'");

    //             $edicion_factura=$this->dbc->query("UPDATE otras_cuentas SET nro_otras_cuentas='$nro_documento', fecha='$fecha',precio='$precio',concepto='$concepto',idtipo='$tipo',id_cliente_proveedor='$cliente_prov' WHERE idotras_cuentas='$resu[idotras_cuentas]'");

    //         }
    //     }else{ //PAGAR  2
    //         $recibo_grupal = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idcuentaspor = '$idrecibo'");
    //         if ($recibo_grupal->num_rows > 0) {
    //             //es grupal, no se podra editar
    //             $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

    //         }else{
    //             //SE EDITARA FACTURA Y RECIBO
    //             $cuentaspor = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idrecibo'");
    //             $resu = $this->dbc->fetch($cuentaspor);

    //             $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$idrecibo'");

    //             if ($dt_cajas->num_rows > 0) {

    //                 $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_pagar SET monto='$precio' WHERE idcuentaspor='$idrecibo'");

    //             }else{
    //                 //no se edita detalle_cajaBancos
    //             }
    //             $edicion_recibo=$this->dbc->query("UPDATE cuentaspor SET fecha='$fecha',monto='$precio' WHERE idcuentaspor='$idrecibo'");

    //             $edicion_factura=$this->dbc->query("UPDATE otras_cuentas SET nro_otras_cuentas='$nro_documento', fecha='$fecha',precio='$precio',concepto='$concepto',idtipo='$tipo',id_cliente_proveedor='$cliente_prov' WHERE idotras_cuentas='$resu[idotras_cuentas]'");

    //         }
    //     }

    //     if($edicion_factura===TRUE){
    //         $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal");
    //     }else{
    //         $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
    //     }
    //     echo json_encode($res);
    // }

    public function usuario_con_permiso_registrar_transaccion($idcaja_bancos,$usuario){
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idusuario = $this->getidusuario($usuario);

        $caja_bancos_usuarios=$this->dbc->query("SELECT * FROM caja_banco_usuarios WHERE idcaja_bancos = '$idcaja_bancos'");
        
        while ($bb = $this->dbc->fetch($caja_bancos_usuarios)) {


            $registro3=$this->dbrh->query("SELECT * FROM usuario WHERE trabajador_idtrabajador = '$bb[idtrabajador]'");
            $usuario = $registro3->fetch_assoc();
            if($idusuario == $usuario['idusuario']){

                $res = array(
                "idusuario" => $usuario['idusuario'],
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

    public function registrar_recibo_cobro_cajaBancos_en_facturas($idfact,$fecha,$lugar,$persona, $ci,$monto, $asiento,$trans,$idcaja_bancos,$concepto,$archivo,$registro_desde,$sucursal,$empresa,$zn,$fecha_transaccion,$cuenta,$tipo_cuenta)
    { // nueva apiiiiiiiiiii

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
    
        $res = ""; 

        $bandera = TRUE;
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

        // $recibo_reci = $this->dbc->query("SELECT count(*) AS cant4 FROM cuentaspof cp
        // INNER JOIN recibo r ON r.idrecibo=cp.idrecibo
        // WHERE r.idempresa='$idempresa' and cp.transaccion ='0'");
        // $res4 = $recibo_reci->fetch_assoc();
        
        $nroRecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;
        // $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$cliente'");
        // $clientSelect = $cl->fetch_assoc();

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','0','0','$concepto',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == ""){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON

            // $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
            // VALUES('$nroRecibo','$fecha_completa','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','$trans','0','$concepto',NULL,'$registro_desde')");

            // $idrecibo = $this->dbc->insert_id;

            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                //
                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
                VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','$trans','0','$concepto',NULL,'$registro_desde')");

                $idrecibo = $this->dbc->insert_id;
            }else{// SE ASIGNARA CUENTA MAS 
                
                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
                VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','$trans','$cuenta','$concepto',NULL,'$registro_desde')");

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

                $desvincular = $this->dbc->query("UPDATE cuentaspof 
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
        VALUES ('$nroTransaccion', '$fecha_transaccion', '1', '0', '$concepto', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        $id_cuenta = '0';
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
            
            if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                $id_cuenta = $this->dbc->insert_id;
            }else{
                // $id_cuenta = '0';
            }

            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------
        // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
        // $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','$idtrans','$id_cuenta','$concepto',NULL,'$registro_desde')");

        $idrecibo = $this->dbc->insert_id;

        // if ($crearRecibo === TRUE) {
        //     $update_fact = $this->dbc->query("UPDATE factura SET cobrado = '2' WHERE idfactura = '$idfact'");

        //     $res = array("success", "Registro Correcto", "crearfactura");
        // } else {
        //     $res = array("danger", "No se pudo realizar el registro ");
        // }

        }else{  // FINALIZA CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
            $bandera = FALSE;
        }
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

        if($bandera === TRUE){
            
            $update_fact = $this->dbc->query("UPDATE factura SET cobrado = '2' WHERE idfactura = '$idfact'");

            $res = array("success", "Registro Correcto", "crearfactura");

        }else{
            
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));

        }

        echo json_encode($res);
    }

    //esta api esta en la opcion caja_bancos donde podemos crear recibos asignando directamente a una factura existente

    public function registrar_recibo_pago_cajaBancos_en_facturas($idfact,$fecha,$lugar,$persona, $ci,$monto, $asiento,$trans,$idcaja_bancos,$concepto,$archivo,$registro_desde,$sucursal,$empresa,$zn,$fecha_transaccion,$cuenta,$tipo_cuenta)
    { // nueva apiiiiiiiiiii

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
    
        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        
        $bandera = TRUE;
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

        // $recibo_reci = $this->dbc->query("SELECT count(*) AS cant4 FROM cuentaspor cp
        // INNER JOIN recibo r ON r.idrecibo=cp.idrecibo
        // WHERE r.idempresa='$idempresa' and cp.transaccion ='0'");
        // $res4 = $recibo_reci->fetch_assoc();
        
        $nroRecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;

        // $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$cliente'");
        // $clientSelect = $cl->fetch_assoc();

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','0','0','$concepto',NULL,'$registro_desde')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == ""){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
        

            // $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
            // VALUES('$nroRecibo','$fecha_completa','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','$trans','0','$concepto',NULL,'$registro_desde')");

            // $idrecibo = $this->dbc->insert_id;
            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                //
                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
                VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','$trans','0','$concepto',NULL,'$registro_desde')");

                $idrecibo = $this->dbc->insert_id;
            }else{// SE ASIGNARA CUENTA MAS 
                
                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
                VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','$trans','$cuenta','$concepto',NULL,'$registro_desde')");

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

                $desvincular = $this->dbc->query("UPDATE cuentaspor 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta'
                        AND idcuentaspor NOT IN ($idrecibo)
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
        VALUES ('$nroTransaccion', '$fecha', '1', '0', '$concepto', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        $id_cuenta = '0';
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
            
            if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                $id_cuenta = $this->dbc->insert_id;
            }else{
                // $id_cuenta = '0';
            }

            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------
        // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','$registro_desde');");
        
        // $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,concepto,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$monto','$idfact','0','0','$idtrans','$id_cuenta','$concepto',NULL,'$registro_desde')");

        $idrecibo = $this->dbc->insert_id;

        // if ($crearRecibo === TRUE) {
        //     $update_fact = $this->dbc->query("UPDATE factura SET pagado = '2' WHERE idfactura = '$idfact'");

        //     $res = array("success", "Registro Correcto", "crearfactura");
        // } else {
        //     $res = array("danger", "No se pudo realizar el registro ");
        // }

        }else{  // FINALIZA CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
            $bandera = FALSE;
        }

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

        if($bandera === TRUE){
            
            $update_fact = $this->dbc->query("UPDATE factura SET pagado = '2' WHERE idfactura = '$idfact'");

            $res = array("success", "Registro Correcto", "crearfactura");

        }else{
            
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));

        }
        echo json_encode($res);

    }

    public function registrar_recibo_cobro_cajaBancos_en_otras_cuentas($nro_recibo,$idotras_cuentas,$fecha,$lugar,$persona, $ci,$precio, $asiento,$trans,$idcaja_bancos,$archivo,$registro_desde,$client_prov,$concepto,$sucursal,$empresa,$zn,$fecha_transaccion,$tipo_cuenta, $cuenta)
    {                                             
        //idtransaccion, asiento,fecha, id_cliente_proveedor, concepto, precio, idtipo
        // echo json_encode(array($fecha,$coc,$cobro, $pagar,$trans, $cliente,$asiento,$concepto,$precio,$idtipo,$empresa,$sucursal,$idcaja_bancos));
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
        
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
  
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

        $bandera = TRUE;

        // NUNCA ENTRA A ESTA CONDICION

        if($idotras_cuentas == ""){ 
            $contrato_general = $this->dbc->query("SELECT * FROM otras_cuentas 
            WHERE cobrado = '-1' AND pagado = '-1' AND idempresa = '$idempresa'");
            
            if($contrato_general->num_rows > 0){ // SI EXISTE CONTRATO GENERAL
                $cg = $contrato_general->fetch_assoc();
                $id_otras_cuentas_aux = $cg['idotras_cuentas'];
            }else{ // NO EXISTE CONTRATO GENERAL ENTONCES LO CREAREMOS caja_bancos

                $reg_otrs_cuentas = $this->dbc->query("INSERT INTO otras_cuentas(fecha,pagado,cobrado,idempresa,registro_desde) 
                VALUES ('$fecha','-1','-1','$idempresa','$registro_desde')");
        
                $id_otras_cuentas_aux = $this->dbc->insert_id;
            }
            
        }else{
            $id_otras_cuentas_aux = $idotras_cuentas;
        }

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0

            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$precio','1','0','$id_otras_cuentas_aux','0','0','$concepto',NULL,'$registro_desde','$idempresa')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$precio','0','$id_otras_cuentas_aux','$idrecibo_nuevo','0','0',NULL,'$registro_desde')");

            $idcomprobante = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == ""){

            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                   
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','estado','$lugar','$client_prov','$persona','$ci','$precio','1','0','$idotras_cuentas','$trans','0','$concepto',NULL,'$registro_desde','$idempresa')");

                $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES(NULL,'$nro_recibo','$fecha_completa','1','$lugar','0','$persona','$ci','$precio','0','$idotras_cuentas','$idrecibo_nuevo','$trans','0',NULL,'$registro_desde')");

               
                $idcomprobante = $this->dbc->insert_id;
            }else{// SE ASIGNARA CUENTA MAS 
                 
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$precio','1','0','$idotras_cuentas','$trans','$cuenta','$concepto',NULL,'$registro_desde','$idempresa')");

                $idrecibo_nuevo = $this->dbc->insert_id;

                $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
        VALUES(NULL,'$nro_recibo','$fecha_completa','1','$lugar','0','$persona','$ci','$precio','0','$idotras_cuentas','$idrecibo_nuevo','$trans','$cuenta',NULL,'$registro_desde')");

                $idcomprobante = $this->dbc->insert_id;

                $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$cuenta'");
                $dt = $detalle_trans->fetch_assoc();

                // $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
                // $dt = $detalle_trans->fetch_assoc();

                if($tipo_cuenta == 'suma'){ // SUMAR
                    
                    if($dt['debe'] > 0){
                        $nuevo_monto_dt = $dt['debe'] + $precio;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }else{
                        $nuevo_monto_dt = $dt['haber'] + $precio;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }
                }elseif($tipo_cuenta == 'reemplazo'){ // REEMPLAZAR

                $desvincular_fact = $this->dbc->query("UPDATE recibo 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta' 
                        AND idrecibo NOT IN ($idrecibo_nuevo)
                    ");
                    $desvincular_comprobante = $this->dbc->query("UPDATE cuentaspof 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta' 
                        AND idcuentaspof NOT IN ($idcomprobante)
                    ");

                    if($dt['debe'] > 0){
                        $nuevo_monto_dt = $precio;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }else{
                        $nuevo_monto_dt = $precio;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }
                }else{ // SOLO VINCULA NO PASA NADA

                }
            }
        }else{ // SE CREARA UN NUEVO ASIENTO MODELO
        
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
        VALUES ('$nroTransaccion', '$fecha_transaccion', '1', '0', '$concepto', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        $id_cuenta = '0';
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
            
            if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                $id_cuenta = $this->dbc->insert_id;
            }else{
                // $id_cuenta = '0';
            }

            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------

        $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$precio','1','0','$id_otras_cuentas_aux','$idtrans','$id_cuenta','$concepto',NULL,'$registro_desde','$idempresa')");

        $idrecibo_nuevo = $this->dbc->insert_id;

        // $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
        // VALUES(NULL,'$nro_recibo','$fecha_completa','1','$lugar','0','$persona','$ci','$precio','0','$idotras_cuentas','$idrecibo_nuevo','$trans','$cuenta',NULL,'$registro_desde')");

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$precio','0','$id_otras_cuentas_aux','$idrecibo_nuevo','$idtrans','$id_cuenta',NULL,'$registro_desde')");

        $idcomprobante = $this->dbc->insert_id;

        }else{
            $bandera = FALSE;
        }

        }
      
            //----------------------------------------------------------------------------------------------------------------------------------------------------------

            if($bandera === TRUE){
            if(empty($archivo['name'])){
                //NO PASA NBADA EL CUENTASPOF NO SE EDITA EL ARCHIVO SIGUE SIENDO NULL
                 
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$idcaja_bancos','$precio','$idcomprobante','0','$id_otras_cuentas_aux')");

            $res = array("success", "Registro Realizado", "registrocobrarfactura");

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
            $registropago2 = $this->dbc->query("UPDATE cuentaspof SET archivo = '$unique_name' WHERE idcuentaspof = '$idcomprobante'");

            $update_recibo = $this->dbc->query("UPDATE recibo SET archivo = '$unique_name' WHERE idrecibo = '$idrecibo_nuevo'");

                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$idcaja_bancos','$precio','$idcomprobante','0','$id_otras_cuentas_aux')");
            
            $res = array("success", "Registro Realizado", "registrocobrarfactura");

            }else{
                $res = array("danger", "No se movio el archivo a la carpeta");
            }
        }

        }else{
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));
        }

        echo json_encode($res);

    }

     public function registrar_recibo_pago_cajaBancos_en_otras_cuentas($nro_recibo,$idotras_cuentas,$fecha,$lugar,$persona, $ci,$precio, $asiento,$trans,$idcaja_bancos,$archivo,$registro_desde,$client_prov,$concepto,$sucursal,$empresa,$zn,$fecha_transaccion,$tipo_cuenta,$cuenta)
    {                                             
        //idtransaccion, asiento,fecha, id_cliente_proveedor, concepto, precio, idtipo
        // echo json_encode(array($fecha,$coc,$cobro, $pagar,$trans, $cliente,$asiento,$concepto,$precio,$idtipo,$empresa,$sucursal,$idcaja_bancos));
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
        
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
  
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

        // NUNCA ENTRA A ESTA CONDICION

        $bandera = TRUE;
        if($idotras_cuentas == ""){ 
            $contrato_general = $this->dbc->query("SELECT * FROM otras_cuentas 
            WHERE cobrado = '-1' AND pagado = '-1' AND idempresa = '$idempresa'");
            
            if($contrato_general->num_rows > 0){ // SI EXISTE CONTRATO GENERAL
                $cg = $contrato_general->fetch_assoc();
                $id_otras_cuentas_aux = $cg['idotras_cuentas'];
            }else{ // NO EXISTE CONTRATO GENERAL ENTONCES LO CREAREMOS

                $reg_otrs_cuentas = $this->dbc->query("INSERT INTO otras_cuentas(fecha,pagado,cobrado,idempresa,registro_desde) 
                VALUES ('$fecha','-1','-1','$idempresa','$registro_desde')");
        
                $id_otras_cuentas_aux = $this->dbc->insert_id;
            }
            
        }else{
            $id_otras_cuentas_aux = $idotras_cuentas;
        }

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0

            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$precio','0','1','$id_otras_cuentas_aux','0','0','$concepto',NULL,'$registro_desde','$idempresa')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','$lugar','varios clientes','$persona','$ci','$precio','0','$id_otras_cuentas_aux','$idrecibo_nuevo','0','0',NULL,'$registro_desde')");

            $idcomprobante = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == ""){

            // $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,concepto,archivo,registro_desde,idempresa)
            // VALUES('$nro_recibo','$fecha','$lugar','$client_prov','$persona','$ci','$precio','0','1','$id_otras_cuentas_aux','$trans','$concepto',NULL,'$registro_desde','$idempresa')");

            // $idrecibo_nuevo = $this->dbc->insert_id;

            // $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            // VALUES('$nroRecibo','$fecha_completa','$lugar','varios clientes','$persona','$ci','$precio','0','$id_otras_cuentas_aux','$idrecibo_nuevo','$trans','0',NULL,'$registro_desde')");

            // $idrecibo = $this->dbc->insert_id;
            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                   
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$precio','1','0','$idotras_cuentas','$trans','0','$concepto',NULL,'$registro_desde','$idempresa')");

                $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES(NULL,'$nro_recibo','$fecha_completa','1','$lugar','0','$persona','$ci','$precio','0','$idotras_cuentas','$idrecibo_nuevo','$trans','0',NULL,'$registro_desde')");

               
                $idcomprobante = $this->dbc->insert_id;
            }else{// SE ASIGNARA CUENTA MAS 
                 
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$precio','1','0','$idotras_cuentas','$trans','$cuenta','$concepto',NULL,'$registro_desde','$idempresa')");

                $idrecibo_nuevo = $this->dbc->insert_id;

                $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
        VALUES(NULL,'$nro_recibo','$fecha_completa','1','$lugar','0','$persona','$ci','$precio','0','$idotras_cuentas','$idrecibo_nuevo','$trans','$cuenta',NULL,'$registro_desde')");

                $idcomprobante = $this->dbc->insert_id;

                $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$cuenta'");
                $dt = $detalle_trans->fetch_assoc();

                // $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
                // $dt = $detalle_trans->fetch_assoc();

                if($tipo_cuenta == 'suma'){ // SUMAR
                    
                    if($dt['debe'] > 0){
                        $nuevo_monto_dt = $dt['debe'] + $precio;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }else{
                        $nuevo_monto_dt = $dt['haber'] + $precio;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }
                }elseif($tipo_cuenta == 'reemplazo'){ // REEMPLAZAR

                $desvincular_fact = $this->dbc->query("UPDATE recibo 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta' 
                        AND idrecibo NOT IN ($idrecibo_nuevo)
                    ");
                    $desvincular_comprobante = $this->dbc->query("UPDATE cuentaspor 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta' 
                        AND idcuentaspor NOT IN ($idcomprobante)
                    ");

                    if($dt['debe'] > 0){
                        $nuevo_monto_dt = $precio;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }else{
                        $nuevo_monto_dt = $precio;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }
                }else{ // SOLO VINCULA NO PASA NADA

                }
            }
        }else{ // SE CREARA UN NUEVO ASIENTO MODELO
    
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
        VALUES ('$nroTransaccion', '$fecha_transaccion', '1', '0', '$concepto', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
        $idtrans = $this->dbc->insert_id;
// -----------------------------------------------------------------------------------------------------------------
             // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
        $orden = 1;
        $id_cuenta = '0';
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
            
            if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                $id_cuenta = $this->dbc->insert_id;
            }else{
                // $id_cuenta = '0';
            }
            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------

        $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$precio','0','1','$id_otras_cuentas_aux','$idtrans','$id_cuenta','$concepto',NULL,'$registro_desde','$idempresa')");

        $idrecibo_nuevo = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$precio','0','$id_otras_cuentas_aux','$idrecibo_nuevo','$idtrans','$id_cuenta',NULL,'$registro_desde')");

        $idcomprobante = $this->dbc->insert_id;
        
        }else{
            $bandera = FALSE;
        }

        }
      
            //----------------------------------------------------------------------------------------------------------------------------------------------------------

            if($bandera === TRUE){
            if(empty($archivo['name'])){
                //NO PASA NBADA EL CUENTASPOF NO SE EDITA EL ARCHIVO SIGUE SIENDO NULL
    
            $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
            VALUES('$idcaja_bancos','$precio','$idcomprobante','0','$id_otras_cuentas_aux')");
            
            $res = array("success", "Registro Realizado", "registrocobrarfactura");

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
            $registropago2 = $this->dbc->query("UPDATE cuentaspor SET archivo = '$unique_name' WHERE idcuentaspor = '$idcomprobante'");
            $update_recibo = $this->dbc->query("UPDATE recibo SET archivo = '$unique_name' WHERE idrecibo = '$idrecibo_nuevo'");

            $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$idcaja_bancos','$precio','$idcomprobante','0','$id_otras_cuentas_aux')");
            
            $res = array("success", "Registro Realizado", "registrocobrarfactura");

            }else{
                $res = array("danger", "No se movio el archivo a la carpeta");
            }
        }
        }else{
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ",$resultado122['fechatransaccion'],$fecha_transaccion);
        }
            //----------------------------------------------------------------------------------------------------------------------------------------------------------
   
        echo json_encode($res);

    }

    // public function listar_monto_factura_cajas($idfactura,$cobro_pago) { listar_usuarios
    //     $lista = [];
    //     // $idempresa = $this->getidempresa($empresa);
    
    //     // Preparar la consulta

    //     $fact = $this->dbc->query("SELECT montofactura FROM factura WHERE idfactura = '$idfactura'");
    //     $fact_monto = $this->dbc->fetch($fact);

    //     if($cobro_pago == '1'){ //COBRO
    //         $suma = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspof WHERE idfactura = '$idfactura'");
    //     }else{ // PAGO
    //         $suma = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspor WHERE idfactura = '$idfactura'");
    //     }
        
    //     $suma_monto = $this->dbc->fetch($suma);

    //     $resp =$fact_monto['montofactura'] - $suma_monto['monto_suma']; 
    //     array_push($lista, $resp);
    
    //     echo json_encode($lista, JSON_NUMERIC_CHECK);
    // }

    public function listar_datos_contrataciones_cajas($idotras_cuentas,$cobro_pago) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta

        $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$idotras_cuentas'");
        $oc = $this->dbc->fetch($otras_cuentas);

        if($cobro_pago == '1'){ //COBRO
            $suma = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspof WHERE idfactura = '$idotras_cuentas'");
        }else{ // PAGO
            $suma = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspor WHERE idfactura = '$idotras_cuentas'");
        }
        
        $suma_monto = $this->dbc->fetch($suma);
        $aux_concepto = "s/g Contrato: ". $oc['concepto'].", N° ".$oc['nro_otras_cuentas'].", ".$oc['fecha'];
        $precio_restante =$oc['precio'] - $suma_monto['monto_suma']; 
        //s/g Contrato: "concepto",  N°, fecha
        $resp = array(
                "lugar" => $oc['lugar'],
                "persona" => $oc['contacto'],
                "ci" => $oc['nro_doc_identidad'],
                "id_cliente_proveedor" => $oc['id_cliente_proveedor'],
                "concepto" => "(".$aux_concepto.")",
                "precio_restante" => $precio_restante
            );
        array_push($lista, $resp);
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_datos_facturas_cajas($idfactura,$cobro_pago) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta

        $factura = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$idfactura'");
        $ft = $this->dbc->fetch($factura);

        if($cobro_pago == '1'){ //COBRO
            $suma = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspof WHERE idfactura = '$idfactura'");
        }else{ // PAGO
            $suma = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspor WHERE idfactura = '$idfactura'");
        }
        
        $suma_monto = $this->dbc->fetch($suma);
        // $aux_concepto = "s/g Contrato: ". $ft['concepto'].", N° ".$ft['nro_otras_cuentas'].", ".$ft['fecha'];
        
        $aux_concepto = "Factura N°: ". $ft['nfactura']. " ".$ft['fecha'];

        $precio_restante =$ft['montofactura'] - $suma_monto['monto_suma']; 
        //s/g Contrato: "concepto",  N°, fecha
        $resp = array(
                // "lugar" => $ft['lugar'],
                // "persona" => $oc['contacto'],
                // "ci" => $oc['nro_doc_identidad'],
                // "id_cliente_proveedor" => $oc['id_cliente_proveedor'],
                "concepto" => "(".$aux_concepto.")",
                "precio_restante" => $precio_restante
            );
        array_push($lista, $resp);
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function editar_recibo_caja_bancos_antiguo($idrecibo,$lugar,$persona,$ci,$fecha){

        if (0 > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("UPDATE cuentaspof 
            SET lugar = '$lugar',persona = '$persona',ci = '$ci',fecha = '$fecha' WHERE idcuentaspof = '$idrecibo'");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }
    public function editar_recibo_caja_bancos($idcomprobante,$lugar,$persona,$ci,$fecha,$nro_recibo,$concepto,$cliente_prov,$monto,$tipo_documento,$archivo,$idotras_cuentas){
        $res="";

        //tipo_documento = 1,2 facturas --> cobrar- pagar
        if($tipo_documento == '1'){//COBRAR   
            $recibo_grupal = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idcuentaspof = '$idcomprobante'");
            if ($recibo_grupal->num_rows > 0) {
                //es grupal, no se podra editar
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

            }else{
                //SE EDITARA FACTURA Y RECIBO
                $cuentaspof = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idcomprobante'");
                $resu = $this->dbc->fetch($cuentaspof);

                $fecha_nueva = $this->obtener_fecha_hora_nueva($resu['fecha'],$fecha);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idcomprobante'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_cobrar SET monto='$monto',idotras_cuentas = '$idotras_cuentas' WHERE idcuentaspof='$idcomprobante'");

                }else{
                    //no se edita detalle_cajaBancos
                }
                $edicion_comprobante = $this->editar_comprobante($fecha_nueva,$monto,$idcomprobante,$archivo,$tipo_documento,$lugar,$persona,$ci);
                // $edicion_comprobante=$this->dbc->query("UPDATE cuentaspof SET lugar = '$lugar',persona = '$persona',ci = '$ci', fecha='$fecha_nueva',monto='$monto' WHERE idcuentaspof='$idcomprobante'");
                $edicion_idotras_cuentas=$this->dbc->query("UPDATE cuentaspof SET idotras_cuentas = '$idotras_cuentas' WHERE idcuentaspof='$idcomprobante'");

                // $edicion_factura=$this->dbc->query("UPDATE factura SET nfactura = '$nfactura',fecha='$fecha',montofactura='$monto',por_concepto_de='$por_concepto_de',proveedorcliente_idproveedorcliente='$cliente_prov' WHERE idfactura='$resu[idfactura]'");
                $edicion_recibo=$this->dbc->query("UPDATE recibo SET nro_recibo = '$nro_recibo',fecha='$fecha',monto='$monto',concepto='$concepto',cliente_proveedor='$cliente_prov',idotras_cuentas = '$idotras_cuentas' WHERE idrecibo='$resu[idrecibo]'");

            }
        }else{ //PAGAR  2
            $recibo_grupal = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idcuentaspor = '$idcomprobante'");
            if ($recibo_grupal->num_rows > 0) {
                //es grupal, no se podra editar
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

            }else{
                //SE EDITARA FACTURA Y RECIBO

                $cuentaspor = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idcomprobante'");
                $resu = $this->dbc->fetch($cuentaspor);

                $fecha_nueva = $this->obtener_fecha_hora_nueva($resu['fecha'],$fecha);

                // Crear objeto DateTime desde la fecha original
                $dtOriginal = new DateTime($resu['fecha']);

                // Extraer la hora original
                $horaOriginal = $dtOriginal->format('H:i:s');

                // Combinar nueva fecha con hora original
                $fechaFinal = $fecha . ' ' . $horaOriginal;

                // Si quieres convertirlo en DateTime nuevamente:
                $dtFinal = new DateTime($fechaFinal);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$idcomprobante'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_pagar SET monto='$monto',idotras_cuentas = '$idotras_cuentas' WHERE idcuentaspor='$idcomprobante'");

                }else{
                    //no se edita detalle_cajaBancos editar_caja_bancos_facturas
                }
                // $edicion_comprobante=$this->dbc->query("UPDATE cuentaspof SET lugar = '$lugar',persona = '$persona',ci = '$ci', fecha='$fecha_nueva',monto='$monto' WHERE idcuentaspof='$idcomprobante'");
                $edicion_comprobante = $this->editar_comprobante($fecha_nueva,$monto,$idcomprobante,$archivo,$tipo_documento,$lugar,$persona,$ci);

                $edicion_idotras_cuentas=$this->dbc->query("UPDATE cuentaspor SET idotras_cuentas = '$idotras_cuentas' WHERE idcuentaspor='$idcomprobante'");

                $edicion_recibo=$this->dbc->query("UPDATE recibo SET nro_recibo = '$nro_recibo',fecha='$fecha',monto='$monto',concepto='$concepto',cliente_proveedor='$cliente_prov',idotras_cuentas = '$idotras_cuentas' WHERE idrecibo='$resu[idrecibo]'");

            }
        }

        if($edicion_recibo===TRUE){
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal");
        }else{
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
        }

     private function obtener_fecha_hora_nueva($fecha_actual,$fecha_nueva)
    {
        // Crear objeto DateTime desde la fecha original
        $dtOriginal = new DateTime($fecha_actual);

        // Extraer la hora original
        $horaOriginal = $dtOriginal->format('H:i:s');

        // Combinar nueva fecha con hora original
        $fechaFinal = $fecha_nueva . ' ' . $horaOriginal;

        // Si quieres convertirlo en DateTime nuevamente:
        $dtFinal = new DateTime($fechaFinal);

        return $dtFinal;
    }

    private function editar_comprobante($fecha,$monto,$idcomprobante,$archivo,$tipo_documento,$lugar,$persona,$ci){
        //$fecha_nueva,$monto,$idcomprobante,$archivo
        $fecha_formateada = $fecha->format('Y-m-d'); //  ejemplo de formato

        if($tipo_documento == '1'){ // COBROS
            if(empty($archivo['name'])){

                if($lugar == "" || $persona == "" || $ci == ""){
                    $fecha_formateada = $fecha->format('Y-m-d'); //  ejemplo de formato
                    $update=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha_formateada',monto='$monto' WHERE idcuentaspof='$idcomprobante'");

                }else{
                    $update=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha_formateada',monto='$monto',lugar = '$lugar', persona = '$persona', ci = '$ci' WHERE idcuentaspof='$idcomprobante'");               
                }

            // $update = $this->dbc->query("UPDATE cuentaspof SET fecha='$fecha',persona='$persona',ci='$ci',lugar='$lugar',transaccion='$idtransaccion' WHERE idcuentaspof='$idrecibo'");

            if ($update === TRUE) {
                $res = array("success", "Registro Realizado", "registrocobrarfactura");
                } else {
                    $res = array("danger", "No se pudo realizar el registro");
                }
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
                    // move_uploaded_file($archivo_tmp, $ruta_destino);
                }
                    if(move_uploaded_file($archivo_tmp, $ruta_destino)){
                            //registrar pago, preguntar guardar la anterior transaccion o la nueva
                            if($lugar == "" || $persona == "" || $ci == ""){
                                $updateArch=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha_formateada',monto='$monto',archivo = '$unique_name' WHERE idcuentaspof='$idcomprobante'");

                            }else{
                                $updateArch=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha_formateada',monto='$monto',lugar = '$lugar', persona = '$persona', ci = '$ci',archivo = '$unique_name' WHERE idcuentaspof='$idcomprobante'");               
                            }
                            // $updateArch=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha',monto='$monto',archivo = '$unique_name' WHERE idcuentaspof='$idcomprobante'");   
                        if ($updateArch === TRUE) {
                            $res = array("success", "Edicion Realizada", "registrocobrarfactura");
                        } else {
                            $res = array("danger", "No se pudo realizar el registro");
                        }
                        }else{
                            $res = array("danger", "No se movio el archivo a la carpeta");
                        }
            }
        }else{ // PAGOS

            if(empty($archivo['name'])){

            // $update=$this->dbc->query("UPDATE cuentaspor SET fecha='$fecha',monto='$monto' WHERE idcuentaspor='$idcomprobante'");
            if($lugar == "" || $persona == "" || $ci == ""){
                $update=$this->dbc->query("UPDATE cuentaspor SET fecha='$fecha_formateada',monto='$monto' WHERE idcuentaspor='$idcomprobante'");

            }else{
                $update=$this->dbc->query("UPDATE cuentaspor SET fecha='$fecha_formateada',monto='$monto',lugar = '$lugar', persona = '$persona', ci = '$ci' WHERE idcuentaspor='$idcomprobante'");               
            }
            // $update = $this->dbc->query("UPDATE cuentaspof SET fecha='$fecha',persona='$persona',ci='$ci',lugar='$lugar',transaccion='$idtransaccion' WHERE idcuentaspof='$idrecibo'");

            if ($update === TRUE) {
                $res = array("success", "Registro Realizado", "registrocobrarfactura");
                } else {
                    $res = array("danger", "No se pudo realizar el registro");
                }
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
                    // move_uploaded_file($archivo_tmp, $ruta_destino);
                }
                    if(move_uploaded_file($archivo_tmp, $ruta_destino)){
                            //registrar pago, preguntar guardar la anterior transaccion o la nueva
                            // $updateArch=$this->dbc->query("UPDATE cuentaspor SET fecha='$fecha',monto='$monto',archivo = '$unique_name' WHERE idcuentaspor='$idcomprobante'");  
                            if($lugar == "" || $persona == "" || $ci == ""){
                                $updateArch=$this->dbc->query("UPDATE cuentaspor SET fecha='$fecha_formateada',monto='$monto',archivo = '$unique_name' WHERE idcuentaspor='$idcomprobante'");

                            }else{
                                $updateArch=$this->dbc->query("UPDATE cuentaspor SET fecha='$fecha_formateada',monto='$monto',lugar = '$lugar', persona = '$persona', ci = '$ci',archivo = '$unique_name' WHERE idcuentaspor='$idcomprobante'");               
                            } 
                        if ($updateArch === TRUE) {
                            $res = array("success", "Edicion Realizada", "registrocobrarfactura");
                        } else {
                            $res = array("danger", "No se pudo realizar el registro");
                        }
                        }else{
                            $res = array("danger", "No se movio el archivo a la carpeta");
                        }
            }
        }
        return "ejecutado";
    }
      public function editar_caja_bancos_facturas_existentes($idcomprobante,$tipo_documento,$fecha,$monto,$archivo,$lugar,$persona,$ci,$concepto){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $res="";
        //tipo_documento = 1,2 facturas --> cobrar- pagar
        //LAS FACTURAS TODAS ESTAN PAGADAS Y COBRADAS, ENTONCES TODAS LAS FACTURAS Q SE EDITARAN YA TIENEN COMPROBANTES
        if($tipo_documento == '1'){//COBRADO
           
                //SE EDITARA FACTURA Y RECIBO
                $cuentaspof = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idcomprobante'");
                $resu = $this->dbc->fetch($cuentaspof);

                $fecha_nueva = $this->obtener_fecha_hora_nueva($resu['fecha'],$fecha);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idcomprobante'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_cobrar SET monto='$monto' WHERE idcuentaspof='$idcomprobante'");

                }else{
                    //no se edita detalle_cajaBancos
                }

                 // SE ESTA EDITANDO LA FACTURA Y EL COMPROBANTE

                $edicion_concepto=$this->dbc->query("UPDATE cuentaspof SET concepto='$concepto' WHERE idcuentaspof='$idcomprobante'");

                $edicion_comprobante = $this->editar_comprobante($fecha_nueva,$monto,$idcomprobante,$archivo,$tipo_documento,$lugar,$persona,$ci);
                // $edicion_recibo=$this->dbc->query("UPDATE cuentaspof SET fecha='$fecha_nueva',monto='$monto' WHERE idcuentaspof='$idcomprobante'");

            
        }else{ //PAGADO
           
                $cuentaspor = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idcomprobante'");
                $resu = $this->dbc->fetch($cuentaspor);

                $fecha_nueva = $this->obtener_fecha_hora_nueva($resu['fecha'],$fecha);

                $dt_cajas = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$idcomprobante'");

                if ($dt_cajas->num_rows > 0) {

                    $edicion_dt_cajas=$this->dbc->query("UPDATE detalle_caja_bancos_pagar SET monto='$monto' WHERE idcuentaspor='$idcomprobante'");

                }else{
                    //no se edita detalle_cajaBancos
                }

                $edicion_concepto=$this->dbc->query("UPDATE cuentaspor SET concepto='$concepto' WHERE idcuentaspor='$idcomprobante'");

                $edicion_comprobante = $this->editar_comprobante($fecha_nueva,$monto,$idcomprobante,$archivo,$tipo_documento,$lugar,$persona,$ci);
              
        }

        if($edicion_comprobante==="ejecutado"){
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal");
        }else{
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde aaa");
        }
        echo json_encode($res);
        // echo json_encode(array($idcomprobante,$nfactura,$tipo_documento,$fecha,$monto,$por_concepto_de,$cliente_prov,$archivo,$lugar,$persona,$ci));
    }
    public function eliminar_archivo_adjunto($idregistro,$tipo_registro) {
        // $idempresa = $this->getidempresa($empresa);

        if($tipo_registro == 'contrato'){ //solo contrato
            $delete_img = $this->dbc->query("UPDATE otras_cuentas
                                SET archivo = NULL
                                WHERE idotras_cuentas = '$idregistro';");
        }elseif($tipo_registro =='comprobante_cobro'){
            $delete_img = $this->dbc->query("UPDATE cuentaspof
                                SET archivo = NULL
                                WHERE idcuentaspof = '$idregistro';");
        }elseif($tipo_registro =='comprobante_pago'){
            $delete_img = $this->dbc->query("UPDATE cuentaspor
                                SET archivo = NULL
                                WHERE idcuentaspor = '$idregistro';");
        }elseif($tipo_registro =='recibo'){
            $delete_img = $this->dbc->query("UPDATE recibo
                                SET archivo = NULL
                                WHERE idrecibo = '$idregistro';");

            $consulta = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo = '$idregistro'");
            $resultado = $consulta->fetch_assoc();
            if($resultado['pagado'] == '0'){ //COBROS
                $delete_img_compr = $this->dbc->query("UPDATE cuentaspof
                                SET archivo = NULL
                                WHERE idrecibo = '$idregistro';");
            }else{ //PAGOS
                $delete_img_compr = $this->dbc->query("UPDATE cuentaspor
                                SET archivo = NULL
                                WHERE idrecibo = '$idregistro';");
            }
           
        }
        
            if ($delete_img === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","eliminar archivo adjunto");
            } else {
                $res = array("danger", "No se pudo eliminar");
            }
        echo json_encode($res);
     // echo json_encode(array($idregistro,$tipo_registro));
    }

    public function getidusuario($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['idusuario'];

    }    
    // listar_datos_contrataciones_cajas  array precio_restante registrar_recibo_pago_cajaBancos_en_facturas res4 registrar_recibo_cobro_cajaBancos_en_otras_cuentas monto_total implode
//registrar_factura_recibo_cobro_cajaBancos, registrar_factura_recibo_pago_cajaBancos registrar_recibo_cobro_cajaBancos_en_facturas caja_bancos listar_recibo_por_caja_bancos datos
}
?>