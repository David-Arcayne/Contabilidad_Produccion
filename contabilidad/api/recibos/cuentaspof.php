<?php
require_once "../../db/db.php";
class Cuentaspof extends DB{

    public function registrocobrarfactura($idfactura,$lugar, $idtransaccion,$idcaja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$concepto,$archivo,$zn,$fecha_transaccion,$cuenta,$tipo_cuenta)
    {
        // echo json_encode(array($idfactura,$lugar, $idtransaccion,$idcaja_bancos, $idcuenta, $fecha, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa,$concepto,$archivo,$zn));

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    // --------------------------------------------------------------------------------
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
         $gestion = $this->getgestionactualC($empresa);
        $idgestion = $gestion["id"];

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
//----------------------------------------------------------------------------------------------------------------

        // Construir rango dinámico (primer y último día del mes)
        $fecha_inicio = date("Y-m-01", strtotime($fecha_transaccion)); // "2025-03-01"
        $fecha_fin    = date("Y-m-t", strtotime($fecha_transaccion));  // "2025-03-31"

        $asiento_tipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asiento'");
        $at = $asiento_tipo->fetch_assoc();

        $tipo_trans = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='$at[tipo]'");
        $tt = $tipo_trans->fetch_assoc();

        $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$idgestion'");
        $gc = $gestion_sel->fetch_assoc();

        if($gc['formato_transaccion'] == 'por_tipo_mes') {
            $nroTransa = $this->dbc->query("SELECT * 
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
            FROM transacciones
            WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
            and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
            AND idgestion = '$idgestion'
            AND organizacion_idorganizacion = '$ide'
            ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
            $nroTransa = $this->dbc->query("SELECT * 
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones 
                WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                AND idgestion = '$idgestion'
                AND organizacion_idorganizacion = '$ide'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        } else { // POR_GESTION
            $nroTransa = $this->dbc->query("SELECT *
            -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones 
                WHERE organizacion_idorganizacion = '$ide'
                AND idgestion = '$idgestion'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;

        $glosa = "Registro cobro $nrecibo";
    
        
        $trans = "";
        $bandera = TRUE;
        if ($asiento != "" && $idtransaccion == "") {

            if($fecha_transaccion >= $resultado122['fechatransaccion']){  
                $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`, `estado`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) 
                VALUES (NULL, '$nroTransaccion', '$fecha_transaccion', '1', '0', '$glosa', '1', '1', '$tt[idtipotransaccion]', '$ide', '$sucursal', '$idgestion');");
                //nuevat transaccion
                $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$nroTransaccion' AND  organizacion_idorganizacion='$ide' ORDER BY idtransacciones DESC LIMIT 1");
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
            }else{
                $bandera = FALSE;
            }
            
        } elseif($idtransaccion == "" && $asiento == "") { // NO SE VINCULA A NINGUNA TRANSACCION NI SE CREA NUEVA 
            $trans = 0;
            
        }else{ // ESTO OCURRE EN ESTE ELSE --> $idtransaccion > 0 && $asiento == ""
             $trans = $idtransaccion;
            if($cuenta == ""){ // SOLO SE ASIGNARA TRANSACCION Y NO LA CUENTA
            // no ocurrira nada
            }else{// SE ASIGNARA CUENTA MAS 
                // $montoFacturas = 0;
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
                    // $idsNuevos = array_column($data['facturas'], 'idfactura');
                    // $idsNuevosStr = implode(",", $idsNuevos);

                    $desvincular = $this->dbc->query("UPDATE cuentaspof 
                        SET cuenta = '0' 
                        WHERE cuenta = '$cuenta'
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
        }
        
        //------------------------------------------------------------------------------------
        if($bandera === TRUE){
            if(empty($archivo['name'])){
                $registropago = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde)
                VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','$idcliente','$persona','$ci','$monto','$idfactura','0','$trans','$cuenta','$concepto',NULL,'facturas_x_cobrar')");

                if ($registropago === TRUE) {

                    $idcuentaspof = $this->dbc->insert_id;
                    if($idcaja_bancos == ""){
                        // NO REGISTRARA CAJA_BANCOS
                    }else{
                        foreach($caja_bancos as $cajaBanco){
                        $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                        VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','$idfactura','0')");
                    }
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
                $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,estado,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,concepto,archivo,registro_desde)
                VALUES(NULL,'$nrecibo','$fecha_completa','1','$lugar','$idcliente','$persona','$ci','$monto','$idfactura','0','$trans','$cuenta','$concepto','$unique_name','facturas_x_cobrar')");

                
                if ($registropago2 === TRUE) {
                    $idcuentaspof = $this->dbc->insert_id;
                    if($idcaja_bancos == ""){
                        //NO SE REGISTRARA CAJA_BANCOS
                    }else{
                        foreach($caja_bancos as $cajaBanco){
                        $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura,idotras_cuentas)
                        VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','$idfactura','0')");
                    }
                    }
                    $res = array("success", "Registro Realizado", "registrocobrarfactura");
                } else {
                    $res = array("danger", "No se pudo realizar el registro");
                }
                }else{
                    $res = array("danger", "No se movio el archivo a la carpeta");
                }
            }

            $suma_recibos = $this->dbc->query("SELECT SUM(monto) AS monto_suma FROM cuentaspof WHERE idfactura = '$idfactura'");
            $sum = $suma_recibos->fetch_assoc();

            $factura = $this->dbc->query("SELECT montofactura FROM factura WHERE idfactura = '$idfactura'");
            $factura_monto = $factura->fetch_assoc();

            if($sum['monto_suma'] == $factura_monto['montofactura']){
                //SALDO COBRADO EN TOTALIDAD, CAMBIAR LA FACTURA A UN ESTADO COBRADO
                $editar_factura = $this->dbc->query("UPDATE factura SET cobrado = '2' WHERE idfactura = '$idfactura'");
            }else{
                //TODAVIA NO SE COBRO EL TOTAL DEL SALDO
            }
        }else{
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));
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
    // listar_recibo_pago_por_id

    public function listar_comprobantes_de_factura_cobro($idrecibo)
    {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // $lista = [];
        // $detalle_facturas = [];

        $consulta = $this->dbc->query("SELECT SUM(monto) AS suma_monto FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idrecibo'");

        $mont = $consulta->fetch_assoc();

        $res = array(
            "monto_total" => $mont['suma_monto'],
            "facturas" => [],
            "caja_bancos" => []
        );

        $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");
        $comprob = $registro->fetch_assoc();

        $factura_lista = $this->dbc->query("SELECT DISTINCT idfactura 
        FROM detalle_caja_bancos_cobrar 
        WHERE idcuentaspof = '$idrecibo';");

        if ($factura_lista->num_rows > 0) {
            while ($factu = $this->dbc->fetch($factura_lista)) {
                $factura= $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factu[idfactura]'");
                $ft = $factura->fetch_assoc();
    
                if($comprob['concepto'] == null){

                    $concepto_comprobante = "Factura N°: ".$ft['nfactura']. " Fecha: ". $ft['fecha'].", ".$ft['por_concepto_de'];
                }else{
                    $concepto_comprobante = $comprob['concepto'];
                }

                if($ft['cobrado'] != 0){
                    $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $ft['proveedorcliente_idproveedorcliente'] . "'");
                    $cl = $cliente->fetch_assoc();
                }else{
                    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $ft['proveedorcliente_idproveedorcliente'] . "'");
                    $cl = $proveedor->fetch_assoc();
                }
    
                if($comprob['estado'] == '1'){ //ACTIVO
                    $estado_documento = "activo";
                }elseif($comprob['estado'] == '2'){ // PENDIENTE DE ANULACION
                    $estado_documento = "pendiente anulacion";
                }elseif($comprob['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                    $estado_documento = "pendiente eliminacion";
                }elseif($comprob['estado'] == '4'){ // ANULADO
                    $estado_documento = "anulado";
                }elseif($comprob['estado'] == '5'){// PENDIENTE DE ACTIVACION
                    $estado_documento = "pendiente activacion";
                }

                $detalle_facturas = array(
    
                    //lugar,    nombre_cliente_proveedor, nit, direccion row
                    "nrecibo" => $comprob['nrecibo'],
                    "lugar" => $comprob['lugar'],
                    "fecha" => $comprob['fecha'],
                    "persona" => $comprob['persona'],
                    "idfactura" => $ft['idfactura'],
                    "fecha_factura" => $ft['fecha'],
                    "nro_factura" => $ft['nfactura'],
                    "estado_documento" => $estado_documento,
                    "nombre" => $cl['nombre'],
                    "direccion" => $cl['direccion'],
                    "nit" => $cl['nit'],
                    "por_concepto_de" => $concepto_comprobante
                    // "por_concepto_de" => $ft['por_concepto_de']
                
                );
    
                array_push($res['facturas'], $detalle_facturas);
            }
    
                    $caja_banco = $this->dbc->query("SELECT idcaja_bancos, SUM(monto) AS total_monto
                    FROM detalle_caja_bancos_cobrar
                    WHERE idcuentaspof = '$idrecibo'
                    GROUP BY idcaja_bancos");
    
            while ($datos_caja = $this->dbc->fetch($caja_banco)) {
    
                $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
                $datos = $caja->fetch_assoc();

                $caja_usuarios= $this->dbc->query("SELECT * FROM caja_banco_usuarios WHERE idcaja_bancos = '$datos[idcaja_bancos]' AND funcion = 'responsable'");

                // Array para almacenar los datos completos de cada responsable
                $responsables = array();
                while ($usuario = $this->dbc->fetch($caja_usuarios)) {

                    $trabajador= $this->dbrh->query("SELECT * FROM trabajador WHERE idtrabajador = '$usuario[idtrabajador]'");
                    $trb = $trabajador->fetch_assoc();  

                    $responsables[] = array(
                        "nombre" => $trb['nombre'],
                        "apellido" => $trb['apellido'],
                        "ci" => $trb['ci']
                    );
                }

                $detalle_caja_bancos = array(
                    "idcaja_bancos" => $datos['idcaja_bancos'],
                    "codigo" => $datos['codigo'],
                    "nombre" => $datos['tipo_cuenta'],
                    "monto" => $datos_caja['total_monto'],
                    "responsables" => $responsables
                    
                );
                array_push($res['caja_bancos'], $detalle_caja_bancos);
            }
        }else{
            $factura= $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$comprob[idfactura]'");
            $ft = $factura->fetch_assoc();

            if($comprob['concepto'] == null){
                $concepto_comprobante = "Factura N°: ".$ft['nfactura']. " ". $ft['fecha'];
            }else{
                $concepto_comprobante = $comprob['concepto'];
            }

            if($ft['cobrado'] != 0){
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $ft['proveedorcliente_idproveedorcliente'] . "'");
                $cl = $cliente->fetch_assoc();
            }else{
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $ft['proveedorcliente_idproveedorcliente'] . "'");
                $cl = $proveedor->fetch_assoc();
            }

            if($comprob['estado'] == '1'){ //ACTIVO
                    $estado_documento = "activo";
                }elseif($comprob['estado'] == '2'){ // PENDIENTE DE ANULACION
                    $estado_documento = "pendiente anulacion";
                }elseif($comprob['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                    $estado_documento = "pendiente eliminacion";
                }elseif($comprob['estado'] == '4'){ // ANULADO
                    $estado_documento = "anulado";
                }elseif($comprob['estado'] == '5'){// PENDIENTE DE ACTIVACION
                    $estado_documento = "pendiente activacion";
                }

            $detalle_facturas = array(
    
                //lugar,    nombre_cliente_proveedor, nit, direccion row
                "nrecibo" => $comprob['nrecibo'],
                "lugar" => $comprob['lugar'],
                "fecha" => $comprob['fecha'],
                "persona" => $comprob['persona'],
                "idfactura" => $ft['idfactura'],
                "fecha_factura" => $ft['fecha'],
                "nro_factura" => $ft['nfactura'],
                "estado_documento" => $estado_documento,
                "nombre" => $cl['nombre'],
                "direccion" => $cl['direccion'],
                "nit" => $cl['nit'],
                "por_concepto_de" => $concepto_comprobante
                // "por_concepto_de" => $ft['por_concepto_de']
            );

            array_push($res['facturas'], $detalle_facturas);
        }

    echo json_encode($res);
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
    public function getgestionactualC($empresa)
    {
        $orga = $this->getidempresa($empresa); // recibe md5 de la id insert
        $res = "";
        $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$orga' AND estado='2' LIMIT 1");
        $qwe = $this->dbc->fetch($registro);

        // Retorna un array asociativo con la información
        return array("id" => $qwe['idgestion'], "nombre" => $qwe['nombre']);
    }
}
?>
