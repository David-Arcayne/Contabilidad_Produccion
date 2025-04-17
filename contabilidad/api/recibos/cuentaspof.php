<?php
require_once "../../db/db.php";
class Cuentaspof extends DB{

    public function registrocobrarfactura($idfactura,$lugar, $idtransaccion,$idcaja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$archivo)
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

        $recibo_oc = $this->dbc->query("SELECT cp.* FROM cuentaspof cp
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
            VALUES(NULL,'$nrecibo','$fecha','$lugar','$idcliente','$persona','$ci','$monto','$idfactura','0','$trans','$idcuenta',NULL)");

        if ($registropago === TRUE) {

            $idcuentaspof = $this->dbc->insert_id;
            foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','$idfactura','0')");
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
        VALUES(NULL,'$nrecibo','$fecha','$lugar','$idcliente','$persona','$ci','$monto','$idfactura','0','$trans','$idcuenta','$unique_name')");

        
        if ($registropago2 === TRUE) {
            $idcuentaspof = $this->dbc->insert_id;
            foreach($caja_bancos as $cajaBanco){
                $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','$idfactura','0')");
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

    public function registrocobrarfacturaf5($idrecibo,$fecha, $persona, $ci, $lugar,$idtransaccion,$archivo)
    {
        $res = "";

        if(empty($archivo['name'])){

            $update = $this->dbc->query("UPDATE cuentaspof SET fecha='$fecha',persona='$persona',ci='$ci',lugar='$lugar',transaccion='$idtransaccion' WHERE idcuentaspof='$idrecibo'");

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
        $updateArch = $this->dbc->query("UPDATE cuentaspof SET fecha='$fecha',persona='$persona',ci='$ci',lugar='$lugar',transaccion='$idtransaccion',archivo='$unique_name' WHERE idcuentaspof='$idrecibo'");

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

    public function editar_caja_bancos_recibo($idrecibo,$cajasBancos,$idfactura,$idotras_cuentas) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

$caja_bancos = json_decode($cajasBancos, true);
        // echo json_encode(array($idrecibo,$caja_bancos,$cajasBancos));
        if($idfactura == 0){
            foreach($caja_bancos as $caja_banco){
                if($caja_banco['iddetalle_caja_bancos_cobrar'] < 0){// SE ELIMINA
    
                    $iddtCajaBanco = $caja_banco['iddetalle_caja_bancos_cobrar'] * (-1);
                    $editar = $this->dbc->query("DELETE FROM detalle_caja_bancos_cobrar WHERE iddetalle_caja_bancos_cobrar = '$iddtCajaBanco'");
                
            }elseif($caja_banco['iddetalle_caja_bancos_cobrar'] == 0){ // SE AGREGARA
    
                    $editar = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos, monto, idcuentaspof,idfactura,idotras_cuentas)
                    VALUES('$caja_banco[idcaja_bancos]','$caja_banco[monto]','$idrecibo','0','$idotras_cuentas')");
    
                }else{ // SE EDITARA
                    $select_cajaBanco = $this->dbc->query("SELECT tipo_cuenta FROM caja_bancos WHERE idcaja_bancos = '$caja_banco[idcaja_bancos]'");
                    $tipoCuenta = $select_cajaBanco->fetch_assoc();
    
                    $editar = $this->dbc->query("UPDATE detalle_caja_bancos_cobrar
                    SET monto = '$caja_banco[monto]',
                    idcaja_bancos = '$caja_banco[idcaja_bancos]'
                    -- tipo = '$tipoCuenta[tipo_cuenta]'
                    WHERE iddetalle_caja_bancos_cobrar = '$caja_banco[iddetalle_caja_bancos_cobrar]';");
                }
            }
        }else{
            foreach($caja_bancos as $caja_banco){
                if($caja_banco['iddetalle_caja_bancos_cobrar'] < 0){// SE ELIMINA
    
                    $iddtCajaBanco = $caja_banco['iddetalle_caja_bancos_cobrar'] * (-1);
                    $editar = $this->dbc->query("DELETE FROM detalle_caja_bancos_cobrar WHERE iddetalle_caja_bancos_cobrar = '$iddtCajaBanco'");
                
            }elseif($caja_banco['iddetalle_caja_bancos_cobrar'] == 0){ // SE AGREGARA
    
                    $editar = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos, monto, idcuentaspof,idfactura,idotras_cuentas)
                    VALUES('$caja_banco[idcaja_bancos]','$caja_banco[monto]','$idrecibo','$idfactura','0')");
    
                }else{ // SE EDITARA
                    $select_cajaBanco = $this->dbc->query("SELECT tipo_cuenta FROM caja_bancos WHERE idcaja_bancos = '$caja_banco[idcaja_bancos]'");
                    $tipoCuenta = $select_cajaBanco->fetch_assoc();
    
                    $editar = $this->dbc->query("UPDATE detalle_caja_bancos_cobrar
                    SET monto = '$caja_banco[monto]',
                    idcaja_bancos = '$caja_banco[idcaja_bancos]'
                    -- tipo = '$tipoCuenta[tipo_cuenta]'
                    WHERE iddetalle_caja_bancos_cobrar = '$caja_banco[iddetalle_caja_bancos_cobrar]';");
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

    public function listar_cajas_bancos_por_recibo($idrecibo){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        // $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");

    $caja_banco = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idrecibo'");
    
    if ($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "iddetalle_caja_bancos_cobrar" => $datos_caja['iddetalle_caja_bancos_cobrar'],
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "tipo_cuenta" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['monto']
            );
            array_push($lista, $res);
        }
    } else {
        // $res = array(
        //     "nrecibo" => $qwe['nrecibo'],
        //     "fecha" => $qwe['fecha'],
        //     "monto" => $qwe['monto'],
        //     "persona" => $qwe['persona'],
        //     "idcaja_bancos" => $qwe['idcaja_bancos'],
        //     "codigo" => NULL,
        //     "nombre" => NULL
        // );
        // array_push($lista, $res);
    }
        echo json_encode($lista);
    }

    public function listar_recibo_por_id($idrecibo)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");
        
        $consulta = $this->dbc->query("SELECT SUM(monto) AS suma_monto FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idrecibo'");
        $mont = $consulta->fetch_assoc();


while ($qwe = $this->dbc->fetch($registro)) {
    $caja_banco = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$qwe[idcuentaspof]' 
    ");
    
    if ($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $factura= $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$datos_caja[idfactura]'");
            $ft = $factura->fetch_assoc();


            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "nrecibo" => $qwe['nrecibo'],
                "fecha" => $qwe['fecha'],
                "persona" => $qwe['persona'],
                "monto_recibo" => $qwe[6],
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "codigo" => $datos['codigo'],
                "nombre" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['monto'],
                "monto_total" => $mont['suma_monto'],
                "idfactura" => $ft['idfactura'],
                "fecha_factura" => $ft['fecha'],
                "nro_factura" => $ft['nfactura']

                
            );
            array_push($lista, $res);
        }
    } else {
        $res = array(
            "nrecibo" => $qwe['nrecibo'],
            "fecha" => $qwe['fecha'],
            "monto" => $qwe['monto'],
            "persona" => $qwe['persona'],
            "monto_total" => $mont['suma_monto']
            // "idcaja_bancos" => $qwe['idcaja_bancos'],
            // "codigo" => NULL,
            // "nombre" => NULL
        );
        array_push($lista, $res);
    }
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
}
?>
