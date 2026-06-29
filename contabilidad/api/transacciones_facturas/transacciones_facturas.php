<?php
session_start();
//require_once "db.php"; editar
require_once "../../db/db.php";
class Transacciones_facturas extends DB{
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

    public function getgestionactualC($empresa)
    {
        $orga = $this->getidempresa($empresa); // recibe md5 de la id insert
        $res = "";
        $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$orga' AND estado='2' LIMIT 1");
        $qwe = $this->dbc->fetch($registro);

        // Retorna un array asociativo con la información
        return array("id" => $qwe['idgestion'], "nombre" => $qwe['nombre']);
    }
    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']);
        return $qwe['idgestion'];
    }

    public function asignar_asiento_A_factura($data) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $idempresa = $this->getidempresa($data['idempresa']);
        $idsucursal = $this->getidsucursal($data['idsucursal']); 
        // $gestion = $this->getgestionactualid($idempresa);
    
        if($data['idasientotipo'] != ""){
            
                // Construir rango dinámico (primer y último día del mes)
            $fecha_inicio = date("Y-m-01", strtotime($data['fecha'])); // "2025-03-01"
            $fecha_fin    = date("Y-m-t", strtotime($data['fecha']));  // "2025-03-31"

            $asiento_tipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$data[idasientotipo]'");
            $at = $asiento_tipo->fetch_assoc();

            $tipo_trans = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='$at[tipo]'");
            $tt = $tipo_trans->fetch_assoc();

            $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$data[idgestion]'");
            $gc = $gestion_sel->fetch_assoc();

            if($gc['formato_transaccion'] == 'por_tipo_mes') {
                $nroTransa = $this->dbc->query("
                    SELECT 
                        COALESCE(t.codigotransaccion, 0) + 1 AS siguiente,
                        t.*
                    FROM transacciones t
                    WHERE t.codigotransaccion = (
                        SELECT MAX(codigotransaccion)
                        FROM transacciones
                        WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                        AND fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
                        AND idgestion = '$data[idgestion]'
                        AND organizacion_idorganizacion = '$idempresa'
                    )
                    AND t.tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                    AND t.fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
                    AND t.idgestion = '$data[idgestion]'
                    AND t.organizacion_idorganizacion = '$idempresa';
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("
                    SELECT COALESCE(t.codigotransaccion, 0) + 1 AS siguiente, t.* 
                    FROM transacciones t 
                    WHERE t.codigotransaccion = ( 
                    SELECT MAX(codigotransaccion) 
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]' AND idgestion = '$data[idgestion]' AND organizacion_idorganizacion = '$idempresa') 
                    AND t.tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]' AND t.idgestion = '$data[idgestion]' AND t.organizacion_idorganizacion = '$idempresa';
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("
                    SELECT 
                        COALESCE(t.codigotransaccion, 0) + 1 AS siguiente,
                        t.*
                    FROM transacciones t
                    WHERE t.codigotransaccion = (
                        SELECT MAX(codigotransaccion)
                        FROM transacciones
                        WHERE organizacion_idorganizacion = '$idempresa'
                        AND idgestion = '$data[idgestion]'
                    )
                    AND t.organizacion_idorganizacion = '$idempresa'
                    AND t.idgestion = '$data[idgestion]';
                ");
            }


        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['siguiente'];
    
        if($data['fecha'] >= $resultado122['fechatransaccion']){
            // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
        VALUES ('$nroTransaccion', '{$data['fecha']}', '1', '0', '{$data['glosa']}', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$data[idgestion]')");
    
        // Obtener el ID del registro recién insertado
        $idtrans = $this->dbc->insert_id;
    
        // Editar las facturas seleccionadas
        $montoFacturas = 0;
        foreach ($data['facturas'] as $factura) {
            $selectFact = $this->dbc->query("SELECT * FROM factura WHERE idfactura='{$factura['idfactura']}' AND idorganizacion='$idempresa';");
            $fact = $selectFact->fetch_assoc();

    //------------------------------------------------------------------------------------------------
            $montoFacturas += $factura['monto'];
            $update_factura = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans'
            WHERE idfactura = '{$factura['idfactura']}'");

     //-----------------------------------------------------------------------------------------------------
        }
    
        // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='{$data['idasientotipo']}'");
        $orden = 1;
        while ($qwe = $tasiento->fetch_assoc()) {
            $pcuenta = $qwe['idcuenta'];
            if ($qwe['tipo'] == "DEBE") {
                $debe = $montoFacturas * ($qwe['porciento'] / 100);
                $haber = 0;
            } elseif ($qwe['tipo'] == "HABER") {
                $debe = 0;
                $haber = $montoFacturas * ($qwe['porciento'] / 100);
            }
            $ppresupuestario = 0;
            $nota = "-";
            $estado = 1;
    
            // Insertar en detalletransaccion Ocurrio un error al asignar la factura
            $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal, orden) VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal', '$orden')");
            
            $orden = $orden + 1;
        }
        }else{ // LA FECHA NO ESTA DENTRO DEL RANGO PERMITIDO
            $writetrans = FALSE;
        }
        
        // Respuesta 
        if ($writetrans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "cobrofacturasaasientomodelo");
        } else {
            $res = array("danger", "La fecha debe ser posterior al último registro realizado: ".$resultado122['fechatransaccion']);
        }
    }else{ // NO SE CREA UN NUEVO ASIENTO MODELO...

        if($data['cuenta'] == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
            foreach ($data['facturas'] as $factura) {

                $consulta_factura = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '{$factura['idfactura']}'");
                $cf = $consulta_factura->fetch_assoc();
                
                if($cf['tipo_factura'] == "contado"){
                    $update_factura = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$data[idtrans]'
                    WHERE idfactura = '{$factura['idfactura']}'");

                    $update_comprobante_p = $this->dbc->query("UPDATE cuentaspof SET transaccion = '$data[idtrans]' WHERE idfactura = '{$factura['idfactura']}'");
                    $update_comprobante_c = $this->dbc->query("UPDATE cuentaspor SET transaccion = '$data[idtrans]' WHERE idfactura = '{$factura['idfactura']}'");
                }else{
                    $update_factura = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$data[idtrans]'
                    WHERE idfactura = '{$factura['idfactura']}'");
                }

            }
        }else{// SE ASIGNARA CUENTA MAS 
            $montoFacturas = 0;
            $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
            $dt = $detalle_trans->fetch_assoc();
            foreach ($data['facturas'] as $factura) {
                $montoFacturas += $factura['monto'];

                $consulta_factura = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '{$factura['idfactura']}'");
                $cf = $consulta_factura->fetch_assoc();
                
                if($cf['tipo_factura'] == "contado"){
                    $update_factura = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$dt[transacciones_idtransacciones]', cuenta = '$data[cuenta]' 
                    WHERE idfactura = '{$factura['idfactura']}'");

                    $update_comprobante_p = $this->dbc->query("UPDATE cuentaspof SET transaccion = '$data[idtrans]', cuenta = '$data[cuenta]' WHERE idfactura = '{$factura['idfactura']}'");
                    $update_comprobante_c = $this->dbc->query("UPDATE cuentaspor SET transaccion = '$data[idtrans]', cuenta = '$data[cuenta]' WHERE idfactura = '{$factura['idfactura']}'");
                }else{
                    $update_factura = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$dt[transacciones_idtransacciones]', cuenta = '$data[cuenta]' 
                    WHERE idfactura = '{$factura['idfactura']}'");
                }
            }

            // $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
            // $dt = $detalle_trans->fetch_assoc();

            if($data['tipo'] == 'suma'){ // SUMAR
                
                if($dt['debe'] > 0){
                    $nuevo_monto_dt = $dt['debe'] + $montoFacturas;
                    $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
                }else{
                    $nuevo_monto_dt = $dt['haber'] + $montoFacturas;
                    $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
                }
            }elseif($data['tipo'] == 'reemplazo'){ // REEMPLAZAR
                if($dt['debe'] > 0){
                    $nuevo_monto_dt = $montoFacturas;
                    $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
                }else{
                    $nuevo_monto_dt = $montoFacturas;
                    $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
                }
            }else{ // SOLO VINCULA NO PASA NADA

            }
        }
        
        // Respuesta 
        if ($update_factura === TRUE) {
            $res = array("success", "Se Registro Correctamente", "cobrofacturasaasientomodelo",$data['idtrans'],$data['cuenta'],$data['idasientotipo']);
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    }
    
        echo json_encode($res);
    }

    public function registrocobrarfacturaGrupal($fecha,$persona,$ci,$monto,$idtransaccion,$idcaja_bancos,$idasientotipo,$idempresa,$idsucursal,$archivo,$data,$zn,$glosa,$gestion)
    {
    if($idcaja_bancos == ""){
// NO PASARA NADA
    }else{
        $caja_bancos = json_decode($idcaja_bancos, true);
    }
        $facturas = json_decode($data, true);
    // echo json_encode(array("success","hola",$fecha,$nrecibo,$persona,$ci,$monto,$caja_bancos,$idasientotipo,$idempresa,$idsucursal,$archivo,$facturas));
//---------------------------------------------------------------------------------------
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        $ide = $this->getidempresa($idempresa);
        $sucursal = $this->getidsucursal($idsucursal); 
        // $gestion = $this->getgestionactualid($ide);
        
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

        $res = "";
        // $glosa = "Registro cobro '$nrecibo'";
        // $gestion = $this->getgestionactualid($ide);
        $trans = "";
        
        if ($idasientotipo != "") { // SE CREARA UNA NUEVA TRANSACCION 
            // $glosa2 = $this->dbc->real_escape_string($glosa);
            $fecha2 = $this->dbc->real_escape_string($fecha);

        // Construir rango dinámico (primer y último día del mes)
            $fecha_inicio = date("Y-m-01", strtotime($fecha2)); // "2025-03-01"
            $fecha_fin    = date("Y-m-t", strtotime($fecha2));  // "2025-03-31"

            $asiento_tipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$idasientotipo'");
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
                AND organizacion_idorganizacion = '$ide'
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("
                    SELECT COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                    AND idgestion = '$gestion'
                    AND organizacion_idorganizacion = '$ide'
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("
                    SELECT COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE organizacion_idorganizacion = '$ide'
                    AND idgestion = '$gestion'
                ");
            }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['siguiente'];
            
        $nroTransaccion2 = $this->dbc->real_escape_string($nroTransaccion);

        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
        VALUES ('$nroTransaccion2', '$fecha2', '1', '0', '$glosa', '1','1', '$tt[idtipotransaccion]', '$ide', '$sucursal', '$gestion')");
    
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
                // $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal) VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal')");
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)VALUES('$debe','$haber','$nota','$idtrans','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$sucursal','$orden')");
                
                $orden = $orden + 1;
            }
        } else { // SE VINCULARA A UNA TRANSACCION EXISTENTE
        
            $idtrans = $idtransaccion;
        }

//-------------------------------------------------------------------------------------------------
        if(empty($archivo['name'])){
            $registropago = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
            VALUES(NULL,'$nrecibo','$fecha_completa','1','varios clientes','$persona','$ci','$monto','0','$idtrans','0',NULL)");

        if ($registropago === TRUE) {

            $idcuentaspof = $this->dbc->insert_id;
            // foreach($caja_bancos as $cajaBanco){
            //     $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura)
            //     VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','$cajaBanco[idfactura]')");
            // }

            $res = array("success", "Registro Realizado", "registrocobrarfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registrooo",$nrecibo,$fecha,$persona,$ci,$monto,$trans);
        }
// $registropago = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta)
// VALUES('$nrecibo','$fecha','varios clientes','$persona','$ci','$monto','0','$idtrans','0')");

        if ($registropago === TRUE) {
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
             $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
            VALUES(NULL,'$nrecibo','$fecha_completa','1','varios clientes','$persona','$ci','$monto','0','$idtrans','0','$unique_name')");

        if ($registropago2 === TRUE) {
            $idcuentaspof = $this->dbc->insert_id;
            $res = array("success", "Registro Realizado", "registrocobrarfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }
        //--------------------------------------------------------------------------------------------
        //registrar pago, preguntar guardar la anterior transaccion o la nueva
        // $registropago = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta)VALUES('$nrecibo','$fecha','varios clientes','$persona','$ci','$monto','0','$idtrans','0')");
        // Obtener el ID del registro recién insertado

        foreach($facturas as $factura){

            $cobras = $this->dbc->query("SELECT SUM(monto) AS montoSuma FROM cuentaspof WHERE idfactura='$factura[idfactura]'"); //173
            // $asd = $this->dbc->fetch($cobras);
            $asd = $cobras->fetch_assoc();
            if($asd['montoSuma'] == NULL){
                $registrarTabla = $this->dbc->query("INSERT INTO cuentascobrar_grupal(idcuentaspof,idfactura,monto)VALUES('$idcuentaspof','$factura[idfactura]','$factura[monto]')");
            
            }else{
                $montoSuma = $asd['montoSuma'];
                $montoCobrado = $factura['monto'] - $montoSuma;
                $registrarTabla = $this->dbc->query("INSERT INTO cuentascobrar_grupal(idcuentaspof,idfactura,monto)VALUES('$idcuentaspof','$factura[idfactura]','$montoCobrado')");
            }

            $updatetranscodigo = $this->dbc->query("UPDATE factura SET cobrado = '2' WHERE idfactura = '$factura[idfactura]'");

            // $montoFacturas += $factura['monto'];
            // $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans' WHERE idfactura = '{$factura['idfactura']}'");
        }
        if($idcaja_bancos == ""){
            // NO SE REGISTRARA CAJA_BANCOS
        }else{
            foreach($caja_bancos as $cajaBanco){
            $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura)
            VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','$cajaBanco[idfactura]')");
        }
        }
    
        if ($registrarTabla === TRUE) {
            $res = array("success", "Registro Realizado", "registrocobrarfacturaGrupal");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }

        echo json_encode($res);
    }
    public function anular_factura($idfactura,$estado) {
        // $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","anular_factura");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbp->query("UPDATE factura
                                    SET estado = '$estado'
                                    WHERE idfactura = '$idfactura';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Anulacion exitosa","anular_factura");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        }
        echo json_encode($res);
    }
    public function registrar_transaccion_recibo($idRecibo,$fecha,$monto,$glosa, $asiento,$idtransaccion,$empresa,$sucursal,$gestion){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        $ide = $this->getidempresa($empresa);
        $sucursal = $this->getidsucursal($sucursal);
        // $gestion = $this->getgestionactualid($ide);

        if ($asiento != "" && $idtransaccion == "") {

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
                AND organizacion_idorganizacion = '$ide'
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("
                    SELECT COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                    AND idgestion = '$gestion'
                    AND organizacion_idorganizacion = '$ide'
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("
                    SELECT COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE organizacion_idorganizacion = '$ide'
                    AND idgestion = '$gestion'
                ");
            }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['siguiente'];

        // if ($asiento != 0) {
            $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`,`estado`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) 
            VALUES (NULL, '$nroTransaccion', '$fecha', '1', '0', '$glosa', '1','1', '$tt[idtipotransaccion]', '$ide', '$sucursal', '$gestion');");
            //nuevat transaccion

            $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$nroTransaccion' AND  organizacion_idorganizacion='$ide' ORDER BY idtransacciones DESC LIMIT 1");
            $ww = $this->dbc->fetch($transis);
            $trans = $ww['idtransacciones'];
            //$detallepago
            $editar_recibo = $this->dbc->query("UPDATE cuentaspof SET transaccion = '$trans' WHERE idcuentaspof ='$idRecibo'");
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
        }elseif($asiento == "" && $idtransaccion != ""){
            // $trans = $qq['idtransacciones'];
            $insertrans = $this->dbc->query("UPDATE cuentaspof SET transaccion = '$idtransaccion' WHERE idcuentaspof ='$idRecibo'");
        }

        if($insertrans == TRUE){
            $res = array("success", "Registro exitoso","registrar_transaccion_recibo");
        }else{
            $res = array("danger", "No se pudo registrar","registrar_transaccion_recibo");
        }
        echo json_encode($res);
    }

}