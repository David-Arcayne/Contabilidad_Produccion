<?php
require_once "../../db/db.php";
class Cuentaspor extends DB{

    public function registropagarfactura($idfactura, $idtransaccion,$idcaja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$archivo)
    {
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

        // $empresa = $this->emp;
        $transi = $this->dbc->query("SELECT * FROM transacciones WHERE organizacion_idorganizacion='$ide' AND sucursal='$sucursal' ORDER BY codigotransaccion DESC LIMIT 1");
        $qq = $this->dbc->fetch($transi);
        $codigo = $qq['codigotransaccion'] + 1;
        $glosa = "Registro de Pago $nrecibo";
        $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 2; //ingreso

        if ($asiento != 0) {
        $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`,`estado`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) VALUES (NULL, '$codigo', '$fecha', '1', '0', '$glosa', '1','1', '$tipotransaccion', '$ide', '$sucursal', '$gestion');");
        //nuevat transaccion
        $transis = $this->dbc->query("select * from transacciones where codigotransaccion='$codigo' and  organizacion_idorganizacion='$ide' order by idtransacciones desc Limit 1");
        $ww = $this->dbc->fetch($transis);
        $trans = $ww['idtransacciones'];
        //$detallepago

        $debe = 0;
        $haber = 0;
        $tasiento = $this->dbc->query("select * from asiento where idasientotipo='$asiento'");
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
    }else{
        $trans = $idtransaccion;
    }
// -------------------------------------------------------------------------------------------

    if(empty($archivo['name'])){
        $registropago = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
        VALUES(NULL,'$nrecibo','$fecha','$idcliente','$persona','$ci','$monto','$idfactura','0','$trans','$idcuenta',NULL)");

    if ($registropago === TRUE) {
        $idcuentaspor = $this->dbc->insert_id;
            foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspor','$idfactura','0')");
            }
        $res = array("success", "Registro Realizado", "registropagarfactura");
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
        // move_uploaded_file($archivo_tmp, $ruta_destino); grupal
    }
    if(move_uploaded_file($archivo_tmp, $ruta_destino)){
         //registrar pago, preguntar guardar la anterior transaccion o la nueva
    $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
    VALUES(NULL,'$nrecibo','$fecha','$idcliente','$persona','$ci','$monto','$idfactura','0','$trans','$idcuenta','$unique_name')");

    if ($registropago2 === TRUE) {
        $idcuentaspor = $this->dbc->insert_id;
        foreach($caja_bancos as $cajaBanco){
            $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura,idotras_cuentas)
            VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspor','$idfactura','0')");
        }
        $res = array("success", "Registro Realizado", "registropagarfactura");
    } else {
        $res = array("danger", "No se pudo realizar el registro");
    }
    }else{
        $res = array("danger", "No se movio el archivo a la carpeta");
    }
}
        echo json_encode($res);
    }

    public function registropagarfacturaf5($idrecibo,$lugar,$fecha, $persona, $ci,$archivo)
    {
        $res = "";

        if(empty($archivo['name'])){

            $update = $this->dbc->query("UPDATE cuentaspor SET lugar = '$lugar', fecha='$fecha',persona='$persona',ci='$ci' WHERE idcuentaspor='$idrecibo'");

            if ($update === TRUE) {
                $res = array("success", "Registro Realizado", "registrocobrarfactura",$idrecibo,$fecha, $persona, $ci,$archivo);
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
            $updateArch = $this->dbc->query("UPDATE cuentaspor SET lugar = '$lugar',fecha='$fecha',persona='$persona',ci='$ci',archivo='$unique_name' WHERE idcuentaspor='$idrecibo'");

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

    public function editar_caja_bancos_pagar_recibo($idrecibo,$cajasBancos,$idfactura,$idotras_cuentas) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        $caja_bancos = json_decode($cajasBancos, true);
        // echo json_encode(array($idrecibo,$caja_bancos,$cajasBancos));
        if($idfactura == 0){
        foreach($caja_bancos as $caja_banco){
            if($caja_banco['iddetalle_caja_bancos_pagar'] < 0){// SE ELIMINA

                $iddtCajaBanco = $caja_banco['iddetalle_caja_bancos_pagar'] * (-1);
                $editar = $this->dbc->query("DELETE FROM detalle_caja_bancos_pagar WHERE iddetalle_caja_bancos_pagar = '$iddtCajaBanco'");
            
        }elseif($caja_banco['iddetalle_caja_bancos_pagar'] == 0){ // SE AGREGARA

                $editar = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos, monto, idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$caja_banco[idcaja_bancos]','$caja_banco[monto]','$idrecibo','0','$idotras_cuentas')");

            }else{ // SE EDITARA
                $select_cajaBanco = $this->dbc->query("SELECT tipo_cuenta FROM caja_bancos WHERE idcaja_bancos = '$caja_banco[idcaja_bancos]'");
                $tipoCuenta = $select_cajaBanco->fetch_assoc();

                $editar = $this->dbc->query("UPDATE detalle_caja_bancos_pagar
                SET monto = '$caja_banco[monto]',
                idcaja_bancos = '$caja_banco[idcaja_bancos]'
                -- tipo = '$tipoCuenta[tipo_cuenta]'
                WHERE iddetalle_caja_bancos_pagar = '$caja_banco[iddetalle_caja_bancos_pagar]';");
            }
        }
    }else{
        foreach($caja_bancos as $caja_banco){
            if($caja_banco['iddetalle_caja_bancos_pagar'] < 0){// SE ELIMINA

                $iddtCajaBanco = $caja_banco['iddetalle_caja_bancos_pagar'] * (-1);
                $editar = $this->dbc->query("DELETE FROM detalle_caja_bancos_pagar WHERE iddetalle_caja_bancos_pagar = '$iddtCajaBanco'");
            
        }elseif($caja_banco['iddetalle_caja_bancos_pagar'] == 0){ // SE AGREGARA

                $editar = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos, monto, idcuentaspor,idfactura,idotras_cuentas)
                VALUES('$caja_banco[idcaja_bancos]','$caja_banco[monto]','$idrecibo','$idfactura','0')");

            }else{ // SE EDITARA
                $select_cajaBanco = $this->dbc->query("SELECT tipo_cuenta FROM caja_bancos WHERE idcaja_bancos = '$caja_banco[idcaja_bancos]'");
                $tipoCuenta = $select_cajaBanco->fetch_assoc();

                $editar = $this->dbc->query("UPDATE detalle_caja_bancos_pagar
                SET monto = '$caja_banco[monto]',
                idcaja_bancos = '$caja_banco[idcaja_bancos]'
                -- tipo = '$tipoCuenta[tipo_cuenta]'
                WHERE iddetalle_caja_bancos_pagar = '$caja_banco[iddetalle_caja_bancos_pagar]';");
            }
        }
    }
        if($editar == TRUE){
            $res = array("success", "Edicion Realizada", "editar_caja_bancos_recibo");
        }else{
            $res = array("danger", "Ocurrio un error al editar", "editar_caja_bancos_recibo");
        }
       
        echo json_encode($res);
    }

    public function listar_cajas_bancos_pagar_por_recibo($idrecibo){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        // $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");

    $caja_banco = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$idrecibo'");
    
    if ($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "iddetalle_caja_bancos_pagar" => $datos_caja['iddetalle_caja_bancos_pagar'],
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "tipo_cuenta" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['monto']
            );
            array_push($lista, $res);
        }
    } else {

    }
        echo json_encode($lista);
    }

    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    } 

    public function getidsucursal($md5)
    {
        $registro = $this->dbe->query("SELECT * FROM sucursalcontable WHERE md5(idsucursalcontable)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }
    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$empresa' AND estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); listapagarfactura
        return $qwe['idgestion'];
    }
    public function listar_factura_comercial($empresa){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        // $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");

    $caja_banco = $this->dbc->query("SELECT * FROM factura_venta WHERE idfactura_venta = '$idrecibo'");
    
    if($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "iddetalle_caja_bancos_pagar" => $datos_caja['iddetalle_caja_bancos_pagar'],
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "tipo_cuenta" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['monto']
            );
            array_push($lista, $res);
        }
    } else {

    }
        echo json_encode($lista);
    }
}
?>
