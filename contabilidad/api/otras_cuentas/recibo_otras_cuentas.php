<?php
require_once "../../db/db.php";
class Recibo_otras_cuentas extends DB{
public function registrar_recibo_otras_cuentas($idotras_cuentas, $lugar, $idtransaccion,$idcaja_bancos, $fecha, $persona, $ci, $monto, $asiento, $sucursal, $empresa,$archivo,$nro_recibo,$concepto,$client_prov,$zn,$fecha_transaccion,$tipo_cuenta,$cuenta)
    {
        // echo json_encode(array($idfactura, $idtransaccion,$caja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$archivo));

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        $caja_bancos = json_decode($idcaja_bancos, true);
        $res = "";
        $sucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
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

        $bandera = TRUE;

        if($idtransaccion == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$monto','1','0','$idotras_cuentas','0','0','$concepto',NULL,'cobrado_recibo_otras_cuentas','$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
        VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idrecibo_nuevo','0','0',NULL,'cobrado_recibo_otras_cuentas')");

            $idcomprobante = $this->dbc->insert_id;

        }elseif($idtransaccion > 0 && $asiento == ""){
            //SE CREA EL RECIBO CON LA TRANSACCION EXISTENTE QUE YA TE PASARON

        if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                   
        $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$monto','1','0','$idotras_cuentas','$idtransaccion','0','$concepto',NULL,'cobrado_recibo_otras_cuentas','$ide')");

                $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,'estado',lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idrecibo_nuevo','$idtransaccion','0',NULL,'cobrado_recibo_otras_cuentas')");

               
                $idcomprobante = $this->dbc->insert_id;
            }else{// SE ASIGNARA CUENTA MAS 
                 
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$monto','1','0','$idotras_cuentas','$idtransaccion','$cuenta','$concepto',NULL,'cobrado_recibo_otras_cuentas','$ide')");

                $idrecibo_nuevo = $this->dbc->insert_id;

                $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
        VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idrecibo_nuevo','$idtransaccion','$cuenta',NULL,'cobrado_recibo_otras_cuentas')");

                $idcomprobante = $this->dbc->insert_id;

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
                        $nuevo_monto_dt = $monto;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }else{
                        $nuevo_monto_dt = $monto;
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
                AND organizacion_idorganizacion = '$ide'
                ORDER BY codigotransaccion DESC
                LIMIT 1
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                    AND idgestion = '$gestion'
                    AND organizacion_idorganizacion = '$ide'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE organizacion_idorganizacion = '$ide'
                    AND idgestion = '$gestion'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;

        if($fecha_transaccion >= $resultado122['fechatransaccion']){// REGISTRO CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}
       
        // $glosa = "Registro cobro $nrecibo";

            $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) 
            VALUES (NULL, '$nroTransaccion', '$fecha_transaccion', '1', '0', '$concepto', '1', '$tt[idtipotransaccion]', '$ide', '$sucursal', '$gestion');");
            //nuevat transaccion
            $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$nroTransaccion' AND  organizacion_idorganizacion='$ide' ORDER BY idtransacciones DESC LIMIT 1");
            $ww = $this->dbc->fetch($transis);
            $trans = $ww['idtransacciones'];
            //$detallepago

            $debe = 0;
            $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
            $orden = 1;
            $id_cuenta ='0';
            while ($qwe = $this->dbc->fetch($tasiento)) {
                $pcuenta = $qwe['idcuenta'];
                if ($qwe['tipo'] == "DEBE") {
                    $debe = $monto * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $monto * ($qwe['porciento'] / 100);
                }
                //$pcuenta=$_POST['plandecuenta'];
                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                $nota = "-";
                $estado = 1; //$_POST['estado'];
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$debe','$haber','$nota','$trans','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$sucursal','$orden')");

                if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                    $id_cuenta = $this->dbc->insert_id;
                }else{
                    // $id_cuenta = '0';
                }

                $orden = $orden + 1;
            }

            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$monto','1','0','$idotras_cuentas','$trans','$id_cuenta','$concepto',NULL,'cobrado_recibo_otras_cuentas','$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idrecibo_nuevo','$trans','$id_cuenta',NULL,'cobrado_recibo_otras_cuentas')");

            $idcomprobante = $this->dbc->insert_id;
            
            if($nuevo_recibo === TRUE){
                $res = array("success", "Registro Realizado", "registrocobrarfactura");

            }else{
                $res = array("danger", "No se pudo realizar el registro");
            }
            
        }else{
            $bandera = FALSE;
        }
    }
        //------------------------------------------------------------------------------------
        if($bandera === TRUE){
            if(empty($archivo['name'])){
            if($idcaja_bancos == ""){

            }else{
                 foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcomprobante','0','$idotras_cuentas')");
                }

            }
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
        
            if($idcaja_bancos == ""){

            }else{
                 foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcomprobante','0','$idotras_cuentas')");
            }

            }

            $res = array("success", "Registro Realizado", "registrocobrarfactura");

        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }

        }else{
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));
        }

    // $suma_recibos = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspof WHERE idotras_cuentas = '$idotras_cuentas'");
    // $sum = $suma_recibos->fetch_assoc();

    // $otras_cuentas = $this->dbc->query("SELECT precio FROM otras_cuentas WHERE idotras_cuentas = '$idotras_cuentas'");
    // $oc_monto = $otras_cuentas->fetch_assoc();

    // if($sum['monto_suma'] == $oc_monto['precio']){
    //     //SALDO PAGADO EN TOTALIDAD, CAMBIAR LA FACTURA A UN ESTADO PAGADO
    //     $editar_factura = $this->dbc->query("UPDATE otras_cuentas SET cobrado = '2' WHERE idotras_cuentas = '$idotras_cuentas'");
    // }else{
    //     //TODAVIA NO SE PAGO EL TOTAL DEL SALDO
    // }
        echo json_encode($res);
    }

    public function registrocobrarfacturaf5($idrecibo,$fecha, $nrecibo, $persona, $ci,$archivo)
    {
        $res = "";

        if(empty($archivo['name'])){

            $update = $this->dbc->query("UPDATE cuentaspof SET nrecibo='$nrecibo',fecha='$fecha',persona='$persona',ci='$ci' WHERE idcuentaspof='$idrecibo'");

            if ($update === TRUE) {
                $res = array("success", "Registro Realizado", "registrocobrarfactura",$idrecibo,$fecha, $nrecibo, $persona, $ci,$archivo);
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
        $updateArch = $this->dbc->query("UPDATE cuentaspof SET nrecibo='$nrecibo',fecha='$fecha',persona='$persona',ci='$ci',archivo='$unique_name' WHERE idcuentaspof='$idrecibo'");

        if ($updateArch === TRUE) {
            $res = array("success", "Edicion Realizada", "registrocobrarfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }
        echo json_encode($res);
    }
    // public function listar_recibo_otras_cuentas($idotras_cuentas) {
    //     $lista = [];
    //     // $idempresa = $this->getidempresa($empresa);
    
    //     // Preparar la consulta
    //   $listado = $this->dbc->query("SELECT c.idcuentaspof,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,c.lugar FROM cuentaspof as c WHERE c.idotras_cuentas='$idotras_cuentas'");
    //  while ($qwe = $this->dbc->fetch($listado)) {

    //     $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
    //     $idtr = $trans->fetch_assoc();

    //      $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6], "codigotransaccion" => $idtr['codigotransaccion'],"nombre_archivo" => $qwe[7],"lugar" => $qwe[8]);
    //      array_push($lista, $res);
    //  }
    
    //     echo json_encode($lista, JSON_NUMERIC_CHECK); 
    // }
    public function listar_recibo_otras_cuentas($idotras_cuentas) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa); 
    
        // Preparar la consulta
      $listado = $this->dbc->query("SELECT c.idrecibo,c.nro_recibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,c.lugar,c.concepto,c.estado,c.registro_desde FROM recibo as c WHERE c.idotras_cuentas='$idotras_cuentas'");
     while ($qwe = $this->dbc->fetch($listado)) {

        if($qwe['estado'] == '1'){ //ACTIVO
            $estado_documento = "activo";
        }elseif($qwe['estado'] == '2'){ // PENDIENTE DE ANULACION
            $estado_documento = "pendiente anulacion";
        }elseif($qwe['estado'] == '3'){ // PENDIENTE DE ELIMINACION
            $estado_documento = "pendiente eliminacion";
        }elseif($qwe['estado'] == '4'){// ANULADO
            $estado_documento = "anulado";
        }elseif($qwe['estado'] == '5'){// PENDIENTE DE ACTIVACION
            $estado_documento = "pendiente activacion";
        }
        $comprobante = $this->dbc->query("SELECT * FROM cuentaspof WHERE idrecibo='$qwe[idrecibo]'");
        $compr = $comprobante->fetch_assoc();

        $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
        $idtr = $trans->fetch_assoc();

         $res = array("id" => $qwe[0], "recibo" => $qwe[1],
          "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4],
           "ci" => $qwe[5],"transaccion" => $qwe[6],
            "codigotransaccion" => $idtr['codigotransaccion'],
            "nombre_archivo" => $qwe[7],"lugar" => $qwe[8], "idcomprobante" => $compr['idcuentaspof'],"concepto" => $qwe['concepto'],"cliente_proveedor" => $qwe['cliente_proveedor'],"estado_documento" => $estado_documento,"registro_desde" => $qwe['registro_desde']);
         array_push($lista, $res);
     }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_recibo_facturas_otras_cuentas($idotras_cuentas) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa); 
        $listado_recibo_aux = $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas='$idotras_cuentas'");
        
        $listado_factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idotras_cuentas='$idotras_cuentas'");

        // if($listado_recibo_aux->num_rows > 0){ //RECIBOS
            while ($qwe = $this->dbc->fetch($listado_recibo_aux)) {

            $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
            $idtr = $trans->fetch_assoc();

            if($qwe['cobrado'] == '0' && $qwe['pagado'] > 0){ // PAGOS
                $comprobante_recibo_pago = $this->dbc->query("SELECT * FROM cuentaspor WHERE idrecibo='$qwe[idrecibo]'");
                $compr_rec_pago = $comprobante_recibo_pago->fetch_assoc();
                $idcomprobante_recibo = $compr_rec_pago['idcuentaspor'];

                $cliente_proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='$qwe[cliente_proveedor]'");
            }else{
                $comprobante_recibo_cobro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idrecibo='$qwe[idrecibo]'");
                $compr_rec_cobro = $comprobante_recibo_cobro->fetch_assoc();
                $idcomprobante_recibo = $compr_rec_cobro['idcuentaspof'];

                $cliente_proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$qwe[cliente_proveedor]'");
            }
            $cl_pv = $cliente_proveedor->fetch_assoc();
            $res = array("fecha" => $qwe['fecha'], "nro_documento" => $qwe['nro_recibo'], "codigotransaccion" => $idtr['codigotransaccion'],
                "cliente_proveedor" => $cl_pv['nombre'],"concepto" => $qwe['concepto'],
                "monto" => $qwe['monto'],
                "tipo" => 'recibo',"idcomprobante" => $idcomprobante_recibo);
            array_push($lista, $res);
            }
        // }
        // else{ //FACTURAS
            while ($zxc = $this->dbc->fetch($listado_factura_aux)) {

            $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$zxc[transacciones_idtransacciones]'");
            $idtr = $trans->fetch_assoc();

            if($zxc['cobrado'] == '0' && $zxc['pagado'] > 0){ // PAGOS
                $comprobante_factura_pago = $this->dbc->query("SELECT * FROM cuentaspor WHERE idfactura='$zxc[idfactura]'");
                $compr_fact_pago = $comprobante_factura_pago->fetch_assoc();
                $idcomprobante_factura = $compr_fact_pago['idcuentaspor'];

                $cliente_proveedor2 = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='$zxc[proveedorcliente_idproveedorcliente]'");
            }else{
                $comprobante_factura_cobro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idfactura='$zxc[idfactura]'");
                $compr_fact_cobro = $comprobante_factura_cobro->fetch_assoc();
                $idcomprobante_factura = $compr_fact_cobro['idcuentaspof'];

                $cliente_proveedor2 = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$zxc[proveedorcliente_idproveedorcliente]'");
            }
            $cl_pv2 = $cliente_proveedor2->fetch_assoc();

            $res = array("fecha" => $zxc['fecha'], "nro_documento" => $zxc['nfactura'], "codigotransaccion" => $idtr['codigotransaccion'],
                "cliente_proveedor" => $cl_pv2['nombre'],"concepto" => $zxc['por_concepto_de'],
                "monto" => $zxc['montofactura'],
                "tipo" => 'factura',"idcomprobante" => $idcomprobante_factura);
            array_push($lista, $res);
            }
        // }     
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    //  //SOLO HAY INDIVIDUALES
    //  $registro = $this->dbc->query("SELECT c.idcuentaspor,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo FROM cuentaspof as c WHERE c.idfactura='$idfactura'");
    //  while ($qwe = $this->dbc->fetch($registro)) {
    //      $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6],"nombre_archivo" => $qwe[7],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
    //      array_push($lista, $res);
    //  }


    public function registrar_recibo_otras_cuentas_pagar($idotras_cuentas, $lugar, $idtransaccion,$idcaja_bancos, $fecha, $persona, $ci, $monto, $asiento, $sucursal, $empresa,$archivo,$nro_recibo,$concepto,$client_prov,$zn,$fecha_transaccion,$tipo_cuenta,$cuenta)
    {
        // echo json_encode(array($idfactura, $idtransaccion,$caja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$archivo));

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME


        $caja_bancos = json_decode($idcaja_bancos, true);
        $res = "";
        $sucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($ide);

       $recibo_trans = $this->dbc->query("SELECT count(*) AS cant1 FROM cuentaspor cp 
        INNER JOIN transacciones t ON t.idtransacciones=cp.transaccion 
        WHERE t.organizacion_idorganizacion='$ide'");
        $res1 = $recibo_trans->fetch_assoc();

        $recibo_fact = $this->dbc->query("SELECT count(*) AS cant2 FROM cuentaspor cp
            INNER JOIN factura f ON f.idfactura=cp.idfactura
            WHERE f.idorganizacion='$ide' AND cp.transaccion = '0'");
        $res2 = $recibo_fact->fetch_assoc();

        $recibo_oc = $this->dbc->query("SELECT count(*) AS cant3 FROM cuentaspor cp
        INNER JOIN otras_cuentas oc ON oc.idotras_cuentas=cp.idotras_cuentas
        WHERE oc.idempresa='$ide' and cp.transaccion ='0'");
        $res3 = $recibo_oc->fetch_assoc();

        $nrecibo = $res1['cant1'] + $res2['cant2']+ $res3['cant3'] + 1;

        $bandera = TRUE;

        if($idtransaccion == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','$lugar','$client_prov','$persona','$ci','$monto','0','1','$idotras_cuentas','0','0','$concepto',NULL,'pagado_recibo_otras_cuentas','$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
        VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idrecibo_nuevo','0','0',NULL,'pagado_recibo_otras_cuentas')");

            $idrecibo = $this->dbc->insert_id;

        }elseif($idtransaccion > 0 && $asiento == ""){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
        //      $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,concepto,archivo,registro_desde,idempresa)
        //     VALUES('$nro_recibo','$fecha','$lugar','$client_prov','$persona','$ci','$monto','0','1','$idotras_cuentas','$idtransaccion','$concepto',NULL,'pagado_recibo_otras_cuentas','$ide')");

        //     $idrecibo_nuevo = $this->dbc->insert_id;

        //     $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
        // VALUES(NULL,'$nrecibo','$fecha_completa','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idrecibo_nuevo','$idtransaccion','0',NULL,'pagado_recibo_otras_cuentas')");

        //     $idrecibo = $this->dbc->insert_id;
        if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                   
        $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$monto','1','0','$idotras_cuentas','$idtransaccion','0','$concepto',NULL,'pagado_recibo_otras_cuentas','$ide')");

                $idrecibo_nuevo = $this->dbc->insert_id;

                $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
        VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idrecibo_nuevo','$idtransaccion','0',NULL,'pagado_recibo_otras_cuentas')");

            $idrecibo = $this->dbc->insert_id;
            }else{// SE ASIGNARA CUENTA MAS 
                 
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$monto','1','0','$idotras_cuentas','$idtransaccion','$cuenta','$concepto',NULL,'pagado_recibo_otras_cuentas','$ide')");

                $idrecibo_nuevo = $this->dbc->insert_id;

                $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
        VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idrecibo_nuevo','$idtransaccion','$cuenta',NULL,'pagado_recibo_otras_cuentas')");

                $idcomprobante = $this->dbc->insert_id;

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
                        $nuevo_monto_dt = $monto;
                        $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$cuenta'");
                    }else{
                        $nuevo_monto_dt = $monto;
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
                AND organizacion_idorganizacion = '$ide'
                ORDER BY codigotransaccion DESC
                LIMIT 1
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                    AND idgestion = '$gestion'
                    AND organizacion_idorganizacion = '$ide'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE organizacion_idorganizacion = '$ide'
                    AND idgestion = '$gestion'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;

         if($fecha_transaccion >= $resultado122['fechatransaccion']){// REGISTRO CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}
       
        // $glosa = "Registro Pago $nrecibo";

            $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) 
            VALUES (NULL, '$nroTransaccion', '$fecha_transaccion', '1', '0', '$concepto', '1', '$tt[idtipotransaccion]', '$ide', '$sucursal', '$gestion');");
            //nuevat transaccion
            $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$nroTransaccion' AND  organizacion_idorganizacion='$ide' ORDER BY idtransacciones DESC LIMIT 1");
            $ww = $this->dbc->fetch($transis);
            $trans = $ww['idtransacciones'];
            //$detallepago

            $debe = 0;
            $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
            $orden = 1;
            $id_cuenta = '0';
            while ($qwe = $this->dbc->fetch($tasiento)) {
                $pcuenta = $qwe['idcuenta'];
                if ($qwe['tipo'] == "DEBE") {
                    $debe = $monto * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $monto * ($qwe['porciento'] / 100);
                }
                //$pcuenta=$_POST['plandecuenta'];
                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                $nota = "-";
                $estado = 1; //$_POST['estado'];
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$debe','$haber','$nota','$trans','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$sucursal','$orden')");

                if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                    $id_cuenta = $this->dbc->insert_id;
                }else{
                    // $id_cuenta = '0';
                }
                $orden = $orden + 1;
            }
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,estado,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde,idempresa)
            VALUES('$nro_recibo','$fecha','1','$lugar','$client_prov','$persona','$ci','$monto','0','1','$idotras_cuentas','$trans','$id_cuenta','$concepto',NULL,'pagado_recibo_otras_cuentas','$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,idrecibo,transaccion,cuenta,archivo,registro_desde)
            VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idrecibo_nuevo','$trans','$id_cuenta',NULL,'pagado_recibo_otras_cuentas')");

            $idrecibo = $this->dbc->insert_id;

            if($nuevo_recibo === TRUE){
                $res = array("success", "Registro Realizado", "registrocobrarfactura");

            }else{
                $res = array("danger", "No se pudo realizar el registro");
            }
            }else{
            $bandera = FALSE;
            }
        }
        
        //------------------------------------------------------------------------------------
        if($bandera === TRUE){
        if(empty($archivo['name'])){
            // $registropago = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
            // VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$trans','0',NULL)");

      

            // $idcuentaspor = $this->dbc->insert_id;
            if($idcaja_bancos == ""){

            }else{
                 foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','0','$idotras_cuentas')");
                }

            }

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
        $registropago2 = $this->dbc->query("UPDATE cuentaspor SET archivo = '$unique_name' WHERE idcuentaspor = '$idrecibo'");
            $update_recibo = $this->dbc->query("UPDATE recibo SET archivo = '$unique_name' WHERE idrecibo = '$idrecibo_nuevo'");
        
            if($idcaja_bancos == ""){

            }else{
                 foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','0','$idotras_cuentas')");
            }

            }
    
             $res = array("success", "Registro Realizado", "registrocobrarfactura");
       
        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }
        }else{
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));

        }
    // $suma_recibos = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspor WHERE idotras_cuentas = '$idotras_cuentas'");
    // $sum = $suma_recibos->fetch_assoc();

    // $otras_cuentas = $this->dbc->query("SELECT precio FROM otras_cuentas WHERE idotras_cuentas = '$idotras_cuentas'");
    // $oc_monto = $otras_cuentas->fetch_assoc();

    // if($sum['monto_suma'] == $oc_monto['precio']){
    //     //SALDO PAGADO EN TOTALIDAD, CAMBIAR LA FACTURA A UN ESTADO PAGADO
    //     $editar_factura = $this->dbc->query("UPDATE otras_cuentas SET pagado = '2' WHERE idotras_cuentas = '$idotras_cuentas'");
    // }else{
    //     //TODAVIA NO SE PAGO EL TOTAL DEL SALDO
    // }

        echo json_encode($res);
    }

    public function registrar_factura_cobro_otras_cuentas($por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar,$idotras_cuentas, $espesificacion,$trans, $cliente, $empresa, $archivo, $sucursal,$asiento,$idcajas_bancos,$zn,$fecha_transaccion,$cuenta,$tipo_cuenta)
       {

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        $idempresa = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal); 
        $gestion = $this->getgestionactualid($idempresa);
    
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

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura','2', '0','$idotras_cuentas', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','cobrado_factura_otras_cuentas');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'cobrado_factura_otras_cuentas')");

            $idrecibo = $this->dbc->insert_id;

        }elseif($trans > 0 && $asiento == ""){ // SE VINCULARA A UNA TRANSACCION CON OPCION DE TAMBIEN VINCULAR A UNA CUENTA

            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                //
                $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
                VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '2', '0','$idotras_cuentas', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','cobrado_factura_otras_cuentas');");
            
                $idfact = $this->dbc->insert_id;

                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
                VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'cobrado_factura_otras_cuentas')");

                $idrecibo = $this->dbc->insert_id;
            }else{// SE ASIGNARA CUENTA MAS 
                
                $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
                VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '2', '0','$idotras_cuentas', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','cobrado_factura_otras_cuentas');");
            
                $idfact = $this->dbc->insert_id;

                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
                VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','$cuenta',NULL,'cobrado_factura_otras_cuentas')");

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
//------------------------------------------------------------------------------
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
        VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura','2', '0','$idotras_cuentas', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$id_cuenta', '$idsucursal','$por_concepto_de','cobrado_factura_otras_cuentas');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$idtrans','$id_cuenta',NULL,'cobrado_factura_otras_cuentas')");

        $idrecibo = $this->dbc->insert_id;
        if($registro === TRUE){
            $res = array("success", "Registro Realizado", "registrocobrarfactura");

        }else{
            $res = array("danger", "No se pudo realizar el registro");
        }
        }else{  // FINALIZA CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
            $bandera = FALSE;
        }
       }

        if($bandera === TRUE){

        if(empty($archivo['name'])){
            // $registropago = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
            // VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$trans','0',NULL)");

      

            // $idcuentaspor = $this->dbc->insert_id; suma
            if($idcajas_bancos == ""){

            }else{
                 foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','$idotras_cuentas')");
                }

            }

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
        $registropago2 = $this->dbc->query("UPDATE cuentaspof SET archivo = '$unique_name' WHERE idcuentaspof = '$idrecibo'");
        
            if($idcajas_bancos == ""){

            }else{
                 foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','$idotras_cuentas')");
            }

            }
    
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

    public function registrar_factura_pago_otras_cuentas($por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar,$idotras_cuentas, $espesificacion,$trans, $cliente, $empresa, $archivo, $sucursal,$asiento,$idcajas_bancos,$zn,$fecha_transaccion,$cuenta,$tipo_cuenta)
       {

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        $idempresa = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal); 
        $gestion = $this->getgestionactualid($idempresa);
    
        $res = "";
        if($idcajas_bancos == ""){
            //saltar          
        }else{
            $caja_bancos = json_decode($idcajas_bancos, true);  
        }

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
    
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $cl = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='$cliente'");
        $clientSelect = $cl->fetch_assoc();

        $bandera = TRUE;

        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
            VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura','0', '2','$idotras_cuentas', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','pagado_factura_otras_cuentas');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'pagado_factura_otras_cuentas')");

            $idrecibo = $this->dbc->insert_id;

        }elseif($trans > 0 && $asiento == ""){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '0', '2','$idotras_cuentas', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','pagado_factura_otras_cuentas');");
        
            // $idfact = $this->dbc->insert_id;

            // $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            // VALUES('$nroRecibo','$fecha_completa','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'pagado_factura_otras_cuentas')");

            // $idrecibo = $this->dbc->insert_id;
            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
                //
                $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
                VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '2', '0','$idotras_cuentas', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '0', '$idsucursal','$por_concepto_de','cobrado_factura_otras_cuentas');");
            
                $idfact = $this->dbc->insert_id;

                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
                VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'pagado_factura_otras_cuentas')");

                $idrecibo = $this->dbc->insert_id;
            }else{// SE ASIGNARA CUENTA MAS 
                
                $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
                VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura', '2', '0','$idotras_cuentas', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','cobrado_factura_otras_cuentas');");
            
                $idfact = $this->dbc->insert_id;

                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
                VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','$cuenta',NULL,'cobrado_factura_otras_cuentas')");

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
    
            // Insertar en detalletransaccion Ocurrio un error al asignar la factura
            $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal, orden) 
            VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal', '$orden')");
            
            if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                $id_cuenta = $this->dbc->insert_id;
            }else{
                // $id_cuenta = '0';
            }
            $orden = $orden + 1;
        }
//------------------------------------------------------------------------------
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`,`tipo_factura`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) 
        VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento','contado', '$clasefactura','0', '2','$idotras_cuentas', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$id_cuenta', '$idsucursal','$por_concepto_de','pagado_factura_otras_cuentas');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha_completa','1','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$idtrans','$id_cuenta',NULL,'pagado_factura_otras_cuentas')");

        $idrecibo = $this->dbc->insert_id;

        if($registro === TRUE){
            $res = array("success", "Registro Realizado", "registrocobrarfactura");

        }else{
            $res = array("danger", "No se pudo realizar el registro");
        }
        }else{  // FINALIZA CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
            $bandera = FALSE;
        }
        }

        if($bandera === TRUE){

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

            if($idcajas_bancos == ""){
                //NO REGISTRARA CAJA_BANCOS PORQ EL USUARIO NO TIENE NINGUN CAJA_BANCO
            }else{ //SI TIENE CAJA_BANCOS ENTONCES REGISTRAMOS
                foreach($caja_bancos as $cajaBanco){
                $regis_caja_banco = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','0')");
            }
            }

            if($regis_caja_banco === TRUE){
                $res = array("success", "Registro Realizado", "registrocobrarfactura");
            }else{
                $res = array("danger", "No se pudo realizar el registro");
            }

            }else{
              $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));

            }
        echo json_encode($res);
    }

    public function listar_recibo_otras_cuentas_pagar($idotras_cuentas) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa); 
    
        // Preparar la consulta
      $listado = $this->dbc->query("SELECT c.idrecibo,c.nro_recibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,c.lugar,c.concepto,c.estado,c.registro_desde FROM recibo as c WHERE c.idotras_cuentas='$idotras_cuentas'");
     while ($qwe = $this->dbc->fetch($listado)) {

        if($qwe['estado'] == '1'){ //ACTIVO
            $estado_documento = "activo";
        }elseif($qwe['estado'] == '2'){ // PENDIENTE DE ANULACION
            $estado_documento = "pendiente anulacion";
        }elseif($qwe['estado'] == '3'){ // PENDIENTE DE ELIMINACION
            $estado_documento = "pendiente eliminacion";
        }elseif($qwe['estado'] == '4'){// ANULADO
            $estado_documento = "anulado";
        }elseif($qwe['estado'] == '5'){// PENDIENTE DE ACTIVACION
            $estado_documento = "pendiente activacion";
        }

        $comprobante = $this->dbc->query("SELECT * FROM cuentaspor WHERE idrecibo='$qwe[idrecibo]'");
        $compr = $comprobante->fetch_assoc();

        $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
        $idtr = $trans->fetch_assoc();

         $res = array("id" => $qwe[0], "recibo" => $qwe[1],
          "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4],
           "ci" => $qwe[5],"transaccion" => $qwe[6],
            "codigotransaccion" => $idtr['codigotransaccion'],
            "nombre_archivo" => $qwe[7],"lugar" => $qwe[8],"idcomprobante" => $compr['idcuentaspor'],"concepto" => $qwe['concepto'],"cliente_proveedor" => $qwe['cliente_proveedor'],"estado_documento" => $estado_documento,"registro_desde" => $qwe['registro_desde']);
         array_push($lista, $res);
     }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_factura_otras_cuentas($idotras_cuentas) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
      $listado = $this->dbc->query("SELECT * FROM factura WHERE idotras_cuentas='$idotras_cuentas'");
     while ($qwe = $this->dbc->fetch($listado)) {

        if($qwe['estado'] == '1'){ //ACTIVO
            $estado_documento = "activo";
        }elseif($qwe['estado'] == '2'){ // PENDIENTE DE ANULACION
            $estado_documento = "pendiente anulacion";
        }elseif($qwe['estado'] == '3'){ // PENDIENTE DE ELIMINACION
            $estado_documento = "pendiente eliminacion";
        }elseif($qwe['estado'] == '4'){// ANULADO
            $estado_documento = "anulado";
        }elseif($qwe['estado'] == '5'){// PENDIENTE DE ACTIVACION
            $estado_documento = "pendiente activacion";
        }

        $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transacciones_idtransacciones]'");
        $idtr = $trans->fetch_assoc();

        if($qwe['clasefactura'] == '1'){ //PAGO --> PROVEEDOR

            $comprobante = $this->dbc->query("SELECT * FROM cuentaspor WHERE idfactura='$qwe[idfactura]'");
            $compr = $comprobante->fetch_assoc();

            $cl = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='$qwe[proveedorcliente_idproveedorcliente]'");
            $clientSelect = $cl->fetch_assoc();

            $res = array("idfactura" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'],"codigotransaccion" => $idtr['codigotransaccion'],"por_concepto_de" => $qwe['por_concepto_de'],"prov_client" => $clientSelect['nombre'],"idcomprobante" => $compr['idcuentaspor'],"archivo" => $compr['archivo'],"estado_documento" => $estado_documento,"registro_desde" => $qwe['registro_desde']);

        }else{

            $comprobante = $this->dbc->query("SELECT * FROM cuentaspof WHERE idfactura='$qwe[idfactura]'");
            $compr = $comprobante->fetch_assoc();

            $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$qwe[proveedorcliente_idproveedorcliente]'");
            $clientSelect = $cl->fetch_assoc();

            $res = array("idfactura" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'],"codigotransaccion" => $idtr['codigotransaccion'],"por_concepto_de" => $qwe['por_concepto_de'],"prov_client" => $clientSelect['nombre'],"idcomprobante" => $compr['idcuentaspof'],"archivo" => $compr['archivo'],"estado_documento" => $estado_documento,"registro_desde" => $qwe['registro_desde']);

        }
         array_push($lista, $res);
     }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_comprobantes_cobros($empresa) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof IN (715,716,718,745)");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "lugar" => $qwe['lugar'],
                "persona" => $qwe['persona'],
                "ci" => $qwe['ci'],
                "fecha" => $qwe['fecha'],
                "monto" => $qwe['monto'],
                "registro_desde" => $qwe['registro_desde'],
                "transaccion" => $qwe['transaccion'],
                "cobrado" => $qwe['cobrado'],
                "pagado" => $qwe['pagado'],
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "concepto" => $qwe['concepto'],
                "idempresa" => $qwe['idempresa'],
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_comprobantes_pagos($empresa) {
        //  ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("select * from cuentaspor where idcuentaspor in (1020,1021,1045)");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "lugar" => $qwe['lugar'],
                "persona" => $qwe['persona'],
                "ci" => $qwe['ci'],
                "fecha" => $qwe['fecha'],
                "monto" => $qwe['monto'],
                "registro_desde" => $qwe['registro_desde'],
                "transaccion" => $qwe['transaccion'],
                "cobrado" => $qwe['cobrado'],
                "pagado" => $qwe['pagado'],
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "concepto" => $qwe['concepto'],
                "idempresa" => $qwe['idempresa'],
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function registrar_recibo_comprobantes_clonacion($nro_recibo,$fecha,$lugar,$cliente,$persona,$ci,$monto,$cobrado,$pagado,$idotras_cuentas,$transaccion,$concepto,$registro_desde,$idempresa){
        // $idempresa = Empresa::getidempresa($empresa);
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,concepto,archivo,registro_desde,idempresa) 
            VALUES ('$nro_recibo','$fecha','$lugar','$cliente','$persona','$ci','$monto','$cobrado','$pagado','$idotras_cuentas','$transaccion','$concepto','NULL','$registro_desde','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        
        echo json_encode($res);
        
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
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); listar_recibo_otras_cuentas cliente precio_restante monto_total 
        return $qwe['idgestion'];
    }
}
