<?php
require_once "../../db/db.php";
class Recibo_otras_cuentas extends DB{
public function registrar_recibo_otras_cuentas($idotras_cuentas, $lugar, $idtransaccion,$idcaja_bancos, $fecha, $persona, $ci, $monto, $asiento, $sucursal, $empresa,$archivo)
    {
        // echo json_encode(array($idfactura, $idtransaccion,$caja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$archivo));

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $caja_bancos = json_decode($idcaja_bancos, true);
        $res = "";
        $sucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
        $count = $this->dbc->query("SELECT COUNT(*) AS canti_total FROM cuentaspof cp
        INNER JOIN transacciones t ON t.idtransacciones = cp.transaccion WHERE t.organizacion_idorganizacion='$ide'");
        $hh = $this->dbc->fetch($count);
        $nrecibo = $hh['canti_total'];
        // $empresa = $this->emp; registropagarfactura nrecibo
        $transi = $this->dbc->query("SELECT * FROM transacciones WHERE organizacion_idorganizacion='$ide' and sucursal='$sucursal' order by codigotransaccion desc Limit 1");
        $qq = $this->dbc->fetch($transi);
        $codigo = $qq['codigotransaccion'] + 1;
        $glosa = "Registro cobro $nrecibo";
        $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";
        if ($asiento != 0) {
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
        } else {
            $trans = $idtransaccion;
        }
        
        //------------------------------------------------------------------------------------

        if(empty($archivo['name'])){
            $registropago = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
            VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$trans','0',NULL)");

        if ($registropago === TRUE) {

            $idcuentaspof = $this->dbc->insert_id;
            foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','0','$idotras_cuentas')");
            }

            $res = array("success", "Registro Realizado", "registrocobrarfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registrooo",$nrecibo,$fecha,$idcliente,$persona,$ci,$monto,$idfactura,$trans,$idcuenta);
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
            // move_uploaded_file($archivo_tmp, $ruta_destino); grupal
        }
        if(move_uploaded_file($archivo_tmp, $ruta_destino)){
             //registrar pago, preguntar guardar la anterior transaccion o la nueva
        $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
        VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$trans','0','$unique_name')");

        
        if ($registropago2 === TRUE) {
            $idcuentaspof = $this->dbc->insert_id;
            foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','0','$idotras_cuentas')");
            }

            $res = array("success", "Registro Realizado", "registrocobrarfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
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
    public function listar_recibo_otras_cuentas($idotras_cuentas) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
      $listado = $this->dbc->query("SELECT c.idcuentaspof,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,c.lugar FROM cuentaspof as c WHERE c.idotras_cuentas='$idotras_cuentas'");
     while ($qwe = $this->dbc->fetch($listado)) {

        $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
        $idtr = $trans->fetch_assoc();

         $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6], "codigotransaccion" => $idtr['codigotransaccion'],"nombre_archivo" => $qwe[7],"lugar" => $qwe[8]);
         array_push($lista, $res);
     }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    //  //SOLO HAY INDIVIDUALES
    //  $registro = $this->dbc->query("SELECT c.idcuentaspof,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo FROM cuentaspof as c WHERE c.idfactura='$idfactura'");
    //  while ($qwe = $this->dbc->fetch($registro)) {
    //      $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6],"nombre_archivo" => $qwe[7],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
    //      array_push($lista, $res);
    //  }


    public function registrar_recibo_otras_cuentas_pagar($idotras_cuentas, $lugar, $idtransaccion,$idcaja_bancos, $fecha, $persona, $ci, $monto, $asiento, $sucursal, $empresa,$archivo)
    {
        // echo json_encode(array($idfactura, $idtransaccion,$caja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$archivo));

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $caja_bancos = json_decode($idcaja_bancos, true);
        $res = "";
        $sucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
        $count = $this->dbc->query("SELECT COUNT(*) AS canti_total FROM cuentaspor cp
        INNER JOIN transacciones t ON t.idtransacciones = cp.transaccion WHERE t.organizacion_idorganizacion='$ide'");
        $hh = $this->dbc->fetch($count);
        $nrecibo = $hh['canti_total'];
        // $empresa = $this->emp; registropagarfactura nrecibo
        $transi = $this->dbc->query("SELECT * FROM transacciones WHERE organizacion_idorganizacion='$ide' and sucursal='$sucursal' order by codigotransaccion desc Limit 1");
        $qq = $this->dbc->fetch($transi);
        $codigo = $qq['codigotransaccion'] + 1;
        $glosa = "Registro cobro $nrecibo";
        $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";
        if ($asiento != 0) {
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
        } else {
            $trans = $idtransaccion;
        }
        
        //------------------------------------------------------------------------------------

        if(empty($archivo['name'])){
            $registropago = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
            VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$trans','0',NULL)");

        if ($registropago === TRUE) {

            $idcuentaspor = $this->dbc->insert_id;
            foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspor','0','$idotras_cuentas')");
            }

            $res = array("success", "Registro Realizado", "registrocobrarfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registrooo");
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
            // move_uploaded_file($archivo_tmp, $ruta_destino); grupal
        }
        if(move_uploaded_file($archivo_tmp, $ruta_destino)){
             //registrar pago, preguntar guardar la anterior transaccion o la nueva
        $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
        VALUES(NULL,'$nrecibo','$fecha','$lugar','0','$persona','$ci','$monto','0','$idotras_cuentas','$trans','0','$unique_name')");

        
        if ($registropago2 === TRUE) {
            $idcuentaspor = $this->dbc->insert_id;
            foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspor','0','$idotras_cuentas')");
            }

            $res = array("success", "Registro Realizado", "registrocobrarfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }

        echo json_encode($res);
    }

    public function listar_recibo_otras_cuentas_pagar($idotras_cuentas) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
      $listado = $this->dbc->query("SELECT c.idcuentaspor,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,c.lugar FROM cuentaspor as c WHERE c.idotras_cuentas='$idotras_cuentas'");
     while ($qwe = $this->dbc->fetch($listado)) {
    
        $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
        $idtr = $trans->fetch_assoc();

         $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6], "codigotransaccion" => $idtr['codigotransaccion'],"nombre_archivo" => $qwe[7],"lugar" => $qwe[8]);
         array_push($lista, $res);
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
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); listar_recibo_otras_cuentas
        return $qwe['idgestion'];
    }
}
