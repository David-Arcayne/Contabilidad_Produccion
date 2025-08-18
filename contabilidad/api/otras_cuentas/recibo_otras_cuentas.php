<?php
require_once "../../db/db.php";
class Recibo_otras_cuentas extends DB{
public function registrar_recibo_otras_cuentas($idotras_cuentas, $lugar, $idtransaccion,$idcaja_bancos, $fecha, $persona, $ci, $monto, $asiento, $sucursal, $empresa,$archivo,$nro_recibo,$concepto,$client_prov)
    {
        // echo json_encode(array($idfactura, $idtransaccion,$caja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$archivo));

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $caja_bancos = json_decode($idcaja_bancos, true);
        $res = "";
        $sucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);

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

        // $empresa = $this->emp; registropagarfactura nrecibo
        $transi = $this->dbc->query("SELECT * FROM transacciones WHERE organizacion_idorganizacion='$ide' and sucursal='$sucursal' order by codigotransaccion desc Limit 1");
        $qq = $this->dbc->fetch($transi);
        $codigo = $qq['codigotransaccion'] + 1;
        $glosa = "Registro cobro $nrecibo";
        $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";

        if($idtransaccion == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,concepto,archivo,idempresa)
            VALUES('$nro_recibo','$fecha','$lugar','$client_prov','$persona','$ci','$monto','1','0','$idotras_cuentas','0','$concepto',NULL,'$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
        VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','0','0',NULL)");

            $idrecibo = $this->dbc->insert_id;

        }elseif($idtransaccion > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
             $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,concepto,archivo,idempresa)
            VALUES('$nro_recibo','$fecha','$lugar','$client_prov','$persona','$ci','$monto','1','0','$idotras_cuentas','$idtransaccion','$concepto',NULL,'$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
        VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idtransaccion','0',NULL)");

            $idrecibo = $this->dbc->insert_id;
        }else{
            
            $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) VALUES (NULL, '$codigo', '$fecha', '1', '0', '$glosa', '1', '$tipotransaccion', '$ide', '$sucursal', '$gestion');");
            //nuevat transaccion
            $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$codigo' AND  organizacion_idorganizacion='$ide' ORDER BY idtransacciones DESC LIMIT 1");
            $ww = $this->dbc->fetch($transis);
            $trans = $ww['idtransacciones'];
            //$detallepago

            $debe = 0;
            $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
            $orden = 1;
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

                $orden = $orden + 1;
            }

            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,concepto,archivo,idempresa)
            VALUES('$nro_recibo','$fecha','$lugar','$client_prov','$persona','$ci','$monto','1','0','$idotras_cuentas','$trans','$concepto',NULL,'$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
            VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$trans','0',NULL)");

            $idrecibo = $this->dbc->insert_id;
        }
        
        //------------------------------------------------------------------------------------

        if(empty($archivo['name'])){
            if($idcaja_bancos == ""){

            }else{
                 foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
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
        
        $registropago2 = $this->dbc->query("UPDATE cuentaspof SET archivo = '$unique_name' WHERE idcuentaspof = '$idrecibo'");
            $update_recibo = $this->dbc->query("UPDATE recibo SET archivo = '$unique_name' WHERE idrecibo = '$idrecibo_nuevo'");
        
            if($idcaja_bancos == ""){

            }else{
                 foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','0','$idotras_cuentas')");
            }

            }

            $res = array("success", "Registro Realizado", "registrocobrarfactura");

        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }

    $suma_recibos = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspof WHERE idotras_cuentas = '$idotras_cuentas'");
    $sum = $suma_recibos->fetch_assoc();

    $otras_cuentas = $this->dbc->query("SELECT precio FROM otras_cuentas WHERE idotras_cuentas = '$idotras_cuentas'");
    $oc_monto = $otras_cuentas->fetch_assoc();

    if($sum['monto_suma'] == $oc_monto['precio']){
        //SALDO PAGADO EN TOTALIDAD, CAMBIAR LA FACTURA A UN ESTADO PAGADO
        $editar_factura = $this->dbc->query("UPDATE otras_cuentas SET cobrado = '2' WHERE idotras_cuentas = '$idotras_cuentas'");
    }else{
        //TODAVIA NO SE PAGO EL TOTAL DEL SALDO
    }
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
      $listado = $this->dbc->query("SELECT c.idrecibo,c.nro_recibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,c.lugar FROM recibo as c WHERE c.idotras_cuentas='$idotras_cuentas'");
     while ($qwe = $this->dbc->fetch($listado)) {

        $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
        $idtr = $trans->fetch_assoc();

         $res = array("id" => $qwe[0], "recibo" => $qwe[1],
          "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4],
           "ci" => $qwe[5],"transaccion" => $qwe[6],
            "codigotransaccion" => $idtr['codigotransaccion'],
            "nombre_archivo" => $qwe[7],"lugar" => $qwe[8]);
         array_push($lista, $res);
     }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    //  //SOLO HAY INDIVIDUALES
    //  $registro = $this->dbc->query("SELECT c.idcuentaspor,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo FROM cuentaspof as c WHERE c.idfactura='$idfactura'");
    //  while ($qwe = $this->dbc->fetch($registro)) {
    //      $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6],"nombre_archivo" => $qwe[7],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
    //      array_push($lista, $res);
    //  }


    public function registrar_recibo_otras_cuentas_pagar($idotras_cuentas, $lugar, $idtransaccion,$idcaja_bancos, $fecha, $persona, $ci, $monto, $asiento, $sucursal, $empresa,$archivo,$nro_recibo,$concepto,$client_prov)
    {
        // echo json_encode(array($idfactura, $idtransaccion,$caja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$archivo));

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $caja_bancos = json_decode($idcaja_bancos, true);
        $res = "";
        $sucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);

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

        // $empresa = $this->emp; registropagarfactura nrecibo
        $transi = $this->dbc->query("SELECT * FROM transacciones WHERE organizacion_idorganizacion='$ide' and sucursal='$sucursal' order by codigotransaccion desc Limit 1");
        $qq = $this->dbc->fetch($transi);
        $codigo = $qq['codigotransaccion'] + 1;
        $glosa = "Registro cobro $nrecibo";
        $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";

        if($idtransaccion == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,concepto,archivo,idempresa)
            VALUES('$nro_recibo','$fecha','$lugar','$client_prov','$persona','$ci','$monto','0','1','$idotras_cuentas','0','$concepto',NULL,'$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
        VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','0','0',NULL)");

            $idrecibo = $this->dbc->insert_id;

        }elseif($idtransaccion > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
             $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,concepto,archivo,idempresa)
            VALUES('$nro_recibo','$fecha','$lugar','$client_prov','$persona','$ci','$monto','0','1','$idotras_cuentas','$idtransaccion','$concepto',NULL,'$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
        VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$idtransaccion','0',NULL)");

            $idrecibo = $this->dbc->insert_id;
        }else{
            $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) VALUES (NULL, '$codigo', '$fecha', '1', '0', '$glosa', '1', '$tipotransaccion', '$ide', '$sucursal', '$gestion');");
            //nuevat transaccion
            $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$codigo' AND  organizacion_idorganizacion='$ide' ORDER BY idtransacciones DESC LIMIT 1");
            $ww = $this->dbc->fetch($transis);
            $trans = $ww['idtransacciones'];
            //$detallepago

            $debe = 0;
            $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
            $orden = 1;
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

                $orden = $orden + 1;
            }
            $nuevo_recibo = $this->dbc->query("INSERT INTO recibo(nro_recibo,fecha,lugar,cliente_proveedor,persona,ci,monto,cobrado,pagado,idotras_cuentas,transaccion,concepto,archivo,idempresa)
            VALUES('$nro_recibo','$fecha','$lugar','$client_prov','$persona','$ci','$monto','0','1','$idotras_cuentas','$trans','$concepto',NULL,'$ide')");

            $idrecibo_nuevo = $this->dbc->insert_id;

            $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
            VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$trans','0',NULL)");

            $idrecibo = $this->dbc->insert_id;
        }
        
        //------------------------------------------------------------------------------------

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

    $suma_recibos = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspor WHERE idotras_cuentas = '$idotras_cuentas'");
    $sum = $suma_recibos->fetch_assoc();

    $otras_cuentas = $this->dbc->query("SELECT precio FROM otras_cuentas WHERE idotras_cuentas = '$idotras_cuentas'");
    $oc_monto = $otras_cuentas->fetch_assoc();

    if($sum['monto_suma'] == $oc_monto['precio']){
        //SALDO PAGADO EN TOTALIDAD, CAMBIAR LA FACTURA A UN ESTADO PAGADO
        $editar_factura = $this->dbc->query("UPDATE otras_cuentas SET pagado = '2' WHERE idotras_cuentas = '$idotras_cuentas'");
    }else{
        //TODAVIA NO SE PAGO EL TOTAL DEL SALDO
    }

        echo json_encode($res);
    }

    public function registrar_factura_cobro_otras_cuentas($por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar,$idotras_cuentas, $espesificacion,$trans, $cliente, $empresa,   $cuenta,  $sucursal,$asiento,$idcajas_bancos)
       {

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

        // if($cobro == '1'){
        //     // ESTO ES PARA LOS PAGOS
                 
        // }else{
            // ESTO ES PARA LOS COBROS
                       // Insertar en transacciones
        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura','2', '0','$idotras_cuentas', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','cobrado_otras_cuentas');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'cobrado_otras_cuentas')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '2', '0','$idotras_cuentas', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','cobrado_otras_cuentas');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'cobrado_otras_cuentas')");

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
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura','2', '0','$idotras_cuentas', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','cobrado_otras_cuentas');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$idtrans','0',NULL,'cobrado_otras_cuentas')");

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
        
        // }
    
        // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    public function registrar_factura_pago_otras_cuentas($por_concepto_de,$fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar,$idotras_cuentas, $espesificacion,$trans, $cliente, $empresa,   $cuenta,  $sucursal,$asiento,$idcajas_bancos)
       {

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

        // if($cobro == '1'){
        //     // ESTO ES PARA LOS PAGOS
                 
        // }else{
            // ESTO ES PARA LOS COBROS
                       // Insertar en transacciones
        if($trans == "" && $asiento == ""){
            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura','0', '2','$idotras_cuentas', '$espesificacion', '1', '1', '0', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','pagado_otras_cuentas');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'pagado_otras_cuentas')");

            $idrecibo = $this->dbc->insert_id;
        }elseif($trans > 0 && $asiento == 0){
            //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
            $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '0', '2','$idotras_cuentas', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','pagado_otras_cuentas');");
        
            $idfact = $this->dbc->insert_id;

            $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$trans','0',NULL,'pagado_otras_cuentas')");

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
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`,`idotras_cuentas`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`,`por_concepto_de`,`registro_desde`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura','0', '2','$idotras_cuentas', '$espesificacion', '1', '1', '$idtrans', '$cliente', '$idempresa', '$cuenta', '$idsucursal','$por_concepto_de','pagado_otras_cuentas');");
        
        $idfact = $this->dbc->insert_id;

        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo,registro_desde)
            VALUES('$nroRecibo','$fecha','lugar por defecto','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$monto','$idfact','0','$idtrans','0',NULL,'pagado_otras_cuentas')");

        $idrecibo = $this->dbc->insert_id;
        }

            if($idcajas_bancos == ""){
                //NO REGISTRARA CAJA_BANCOS PORQ EL USUARIO NO TIENE NINGUN CAJA_BANCO
            }else{ //SI TIENE CAJA_BANCOS ENTONCES REGISTRAMOS
                foreach($caja_bancos as $cajaBanco){
                $regis_caja_banco = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idrecibo','$idfact','0')");
            }
            }
        
        // }
    
        // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    // public function listar_recibo_otras_cuentas_pagar($idotras_cuentas) {
    //     // ini_set('display_errors', 1);
    //     // ini_set('display_startup_errors', 1);
    //     // error_reporting(E_ALL);

    //     $lista = [];
    //     // $idempresa = $this->getidempresa($empresa);
    
    //     // Preparar la consulta
    //   $listado = $this->dbc->query("SELECT c.idcuentaspor,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,c.lugar FROM cuentaspor as c WHERE c.idotras_cuentas='$idotras_cuentas'");
    //  while ($qwe = $this->dbc->fetch($listado)) {
    
    //     $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
    //     $idtr = $trans->fetch_assoc();

    //      $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6], "codigotransaccion" => $idtr['codigotransaccion'],"nombre_archivo" => $qwe[7],"lugar" => $qwe[8]);
    //      array_push($lista, $res);
    //  }
    
    //     echo json_encode($lista, JSON_NUMERIC_CHECK);
    // }

    public function listar_recibo_otras_cuentas_pagar($idotras_cuentas) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa); 
    
        // Preparar la consulta
      $listado = $this->dbc->query("SELECT c.idrecibo,c.nro_recibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,c.lugar FROM recibo as c WHERE c.idotras_cuentas='$idotras_cuentas'");
     while ($qwe = $this->dbc->fetch($listado)) {

        $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
        $idtr = $trans->fetch_assoc();

         $res = array("id" => $qwe[0], "recibo" => $qwe[1],
          "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4],
           "ci" => $qwe[5],"transaccion" => $qwe[6],
            "codigotransaccion" => $idtr['codigotransaccion'],
            "nombre_archivo" => $qwe[7],"lugar" => $qwe[8]);
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
    
        $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transacciones_idtransacciones]'");
        $idtr = $trans->fetch_assoc();

        if($qwe['clasefactura'] == '1'){ //PAGO --> PROVEEDOR
            $cl = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='$qwe[proveedorcliente_idproveedorcliente]'");
            $clientSelect = $cl->fetch_assoc();
        }else{
            $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$qwe[proveedorcliente_idproveedorcliente]'");
            $clientSelect = $cl->fetch_assoc();
        }

         $res = array("idfactura" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'],"codigotransaccion" => $idtr['codigotransaccion'],"por_concepto_de" => $qwe['por_concepto_de'],"prov_client" => $clientSelect['nombre']);
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
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); listar_recibo_otras_cuentas cliente
        return $qwe['idgestion'];
    }
}
