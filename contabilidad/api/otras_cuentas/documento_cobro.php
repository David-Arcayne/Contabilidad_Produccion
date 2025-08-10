<?php
require_once "../../db/db.php";
class Documento_cobro extends DB{ //          idtransaccion, asiento,fecha, id_cliente_proveedor, concepto, precio, idtipo
    public function registrar_otras_cuentas($fecha,$lugar,$id_cliente_proveedor,$coc,$pagado,$cobrado,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$fecha_venci,$empresa,$sucursal,$archivo){
           
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // echo json_encode(array($fecha,$lugar,$cliente,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$condiciones,$observaciones,$precio,$forma_pago,$empresa));
        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
        
    
        // $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM otras_cuentas WHERE idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $nro_otras_cuentas = $resultado['total'] + 1;


        // $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$id_cliente_proveedor'");
        // $clientSelect = $cl->fetch_assoc();

            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,concepto,condiciones,observaciones,precio,forma_pago,fecha_venci,idempresa) 
            VALUES ('$fecha','$nro_otras_cuentas','$lugar','$id_cliente_proveedor','$coc','$pagado','$cobrado','$nro_tributario','$contacto','$nro_doc_identidad','$idtipo','$concepto','$condiciones','$observaciones','$precio','$forma_pago','$fecha_venci','$idempresa')");
        
        $idotras_cuentas = $this->dbc->insert_id;
        // ----------------------------------------------------------------------------------------------------

        if(empty($archivo['name'])){
            // $registropago = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
            // VALUES(NULL,'$nrecibo','$fecha','$lugar','$idcliente','$persona','$ci','$monto','$idfactura','0','$trans','$idcuenta',NULL)");
// NO PASA NADA YA Q NO EXISTE ARCHIVO

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
        $edicion_otras_cuentas = $this->dbc->query("UPDATE otras_cuentas SET archivo = '$unique_name' WHERE idotras_cuentas = '$idotras_cuentas'");

        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }

        // --------------------------------------------------------------------------------------------------------
    
        // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
//             // echo json_encode(array($idtransaccion,$asiento,$fecha,$lugar,$id_cliente_proveedor,$coc,$pagado,$cobrado,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$empresa,$sucursal));
// echo json_encode(array($idtransaccion,$asiento,$fecha,$lugar,$id_cliente_proveedor,$coc,$pagado,$cobrado,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$empresa,$sucursal,$archivo));
    }

//     public function registrar_otras_cuentas($idtransaccion,$asiento,$fecha,$lugar,$id_cliente_proveedor,$coc,$pagado,$cobrado,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$empresa,$sucursal,$archivo){
           
//         ini_set('display_errors', 1);
//         ini_set('display_startup_errors', 1);
//         error_reporting(E_ALL);
//         // echo json_encode(array($fecha,$lugar,$cliente,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$condiciones,$observaciones,$precio,$forma_pago,$empresa));
//         $idsucursal = $this->getidsucursal($sucursal);
//         $idempresa = $this->getidempresa($empresa);
//         $gestion = $this->getgestionactualid($idempresa);
        
    
//         // $idempresa = $this->getidempresa($empresa);
//         $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM otras_cuentas WHERE idempresa = '$idempresa'");
//         $resultado = $consulta->fetch_assoc();
//         $nro_otras_cuentas = $resultado['total'] + 1;


//         $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$id_cliente_proveedor'");
//         $clientSelect = $cl->fetch_assoc();

//         // if($cobrado == '1'){
//             // NO SE CREARAN RECIBOS

//               // Insertar en transacciones
//         if($idtransaccion == "" && $asiento == ""){
//             // se crea factura sin transaccion asignada
//             //$trans = 0
//             $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa) 
//             VALUES ('$fecha','$nro_otras_cuentas','$lugar','$id_cliente_proveedor','$coc','$pagado','$cobrado','$nro_tributario','$contacto','$nro_doc_identidad','$idtipo','$idtransaccion','$concepto','$condiciones','$observaciones','$precio','$forma_pago','$idempresa')");
        
//         $idotras_cuentas = $this->dbc->insert_id;
//         }elseif($idtransaccion > 0 && $asiento == 0){
//             //SE CREA LA FACTURA CON LA TRANSACCION EXISTENTE QUE YA TE PASARON
//             $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa) 
//             VALUES ('$fecha','$nro_otras_cuentas','$lugar','$id_cliente_proveedor','$coc','$pagado','$cobrado','$nro_tributario','$contacto','$nro_doc_identidad','$idtipo','$idtransaccion','$concepto','$condiciones','$observaciones','$precio','$forma_pago','$idempresa')");
        
//         $idotras_cuentas = $this->dbc->insert_id;
//         }else{
//             // Obtener el número de transacción más reciente y sumar 1
//         $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$idempresa AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
//         $resultado12 = $nroTrans->fetch_assoc();
//         $nroTransaccion = $resultado12['codigotransaccion'] + 1;

//         //el asiento es diferente a cero, se debe crear una transaccion
//         $idAsientoTipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asiento' AND idorganizacion='$idempresa';");
//         $asiento_aux = $idAsientoTipo->fetch_assoc();  // Cambiado $nroTrans->fetch_assoc() a $idAsientoTipo->fetch_assoc()
//         $tipotransaccion = $asiento_aux['tipo'];
//         // Insertar en transacciones
//         $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion', '$fecha', '1', '0', 'Registro Cobro Caja Bancos', '1','1', '$tipotransaccion', '$idempresa', '$idsucursal', '$gestion')");
//         $idtrans = $this->dbc->insert_id;
// // -----------------------------------------------------------------------------------------------------------------
//              // Obtener los asientos relacionados y calcular debe y haber
//         $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
//         $orden = 1;
//         while ($qwe = $tasiento->fetch_assoc()) {
//             $pcuenta = $qwe['idcuenta'];
//             if ($qwe['tipo'] == "DEBE") {
//                 $debe = $precio * ($qwe['porciento'] / 100);
//                 $haber = 0;
//             } elseif ($qwe['tipo'] == "HABER") {
//                 $debe = 0;
//                 $haber = $precio * ($qwe['porciento'] / 100);
//             }
//             $ppresupuestario = 0;
//             $nota = "-";
//             $estado = 1;
    
//             // Insertar en detalletransaccion Ocurrio un error al asignar la factura
//             $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal, orden) 
//             VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal', '$orden')");
            
//             $orden = $orden + 1;
//         }
// //------------------------------------------------------------------------------
//         $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa) 
//         VALUES ('$fecha','$nro_otras_cuentas','$lugar','$id_cliente_proveedor','$coc','$pagado','$cobrado','$nro_tributario','$contacto','$nro_doc_identidad','$idtipo','$idtrans','$concepto','$condiciones','$observaciones','$precio','$forma_pago','$idempresa')");

//         $idotras_cuentas = $this->dbc->insert_id;
//         }
//         // ----------------------------------------------------------------------------------------------------

//         if(empty($archivo['name'])){
//             // $registropago = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
//             // VALUES(NULL,'$nrecibo','$fecha','$lugar','$idcliente','$persona','$ci','$monto','$idfactura','0','$trans','$idcuenta',NULL)");
// // NO PASA NADA YA Q NO EXISTE ARCHIVO

//         }else{
//          // Manejar la carga del archivo
//         $archivo_nombre = "";
//         if ($archivo['error'] == UPLOAD_ERR_OK) {
//             $archivo_tmp = $archivo['tmp_name'];
//             $archivo_nombre = basename($archivo['name']);
//             // ----------------------------------
//             $unique_name = uniqid("img_", true) . '.' . $archivo_nombre;
//             // $target_file = $target_dir . $unique_name;

//             // $ruta_destino = __DIR__ . "/archivos/" . $archivo_nombre;
//             $ruta_destino = "../archivos/" . $unique_name;
//             // $ruta_destino = "../archivos/" . $archivo_nombre;
//             // move_uploaded_file($archivo_tmp, $ruta_destino); grupal
//         }
//         if(move_uploaded_file($archivo_tmp, $ruta_destino)){
//              //registrar pago, preguntar guardar la anterior transaccion o la nueva   
//         $edicion_otras_cuentas = $this->dbc->query("UPDATE otras_cuentas SET archivo = '$unique_name' WHERE idotras_cuentas = '$idotras_cuentas'");

//         }else{
//             $res = array("danger", "No se movio el archivo a la carpeta");
//         }
//     }

//         // --------------------------------------------------------------------------------------------------------
    
//         // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
//         if ($registro === TRUE) {
//             $res = array("success", "Registro Correcto", "crearfactura");
//         } else {
//             $res = array("danger", "No se pudo realizar el registro ");
//         }
//         echo json_encode($res);
// //             // echo json_encode(array($idtransaccion,$asiento,$fecha,$lugar,$id_cliente_proveedor,$coc,$pagado,$cobrado,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$empresa,$sucursal));
// // echo json_encode(array($idtransaccion,$asiento,$fecha,$lugar,$id_cliente_proveedor,$coc,$pagado,$cobrado,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$empresa,$sucursal,$archivo));
//     }

    public function registrar_otras_cuentas_antiguo($idtransaccion,$asiento,$fecha,$lugar,$id_cliente_proveedor,$coc,$pagado,$cobrado,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$empresa,$sucursal){
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // echo json_encode(array($fecha,$lugar,$cliente,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$condiciones,$observaciones,$precio,$forma_pago,$empresa));
        $sucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
        
        $recibo_trans = $this->dbc->query("SELECT count(*) AS cant1 FROM cuentaspor cp 
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
        $tipotransaccion = 1;

        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM otras_cuentas WHERE idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $nro_otras_cuentas = $resultado['total'] + 1;

        if ($asiento != 0) {
            $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) VALUES (NULL, '$codigo', '$fecha', '1', '0', '$glosa', '1', '$tipotransaccion', '$idempresa', '$sucursal', '$gestion');");
            //nuevat transaccion
            $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$codigo' AND  organizacion_idorganizacion='$idempresa' ORDER BY idtransacciones DESC LIMIT 1");
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
                    $debe = $precio * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $precio * ($qwe['porciento'] / 100);
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
      
            // Insertar el nuevo registro
        
            $registroProveedor = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa) 
            VALUES ('$fecha','$nro_otras_cuentas','$lugar','$id_cliente_proveedor','$coc','$pagado','$cobrado','$nro_tributario','$contacto','$nro_doc_identidad','$idtipo','$trans','$concepto','$condiciones','$observaciones','$precio','$forma_pago','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }

        echo json_encode($res);
        
    }

    public function listar_recibo_por_id_otras_cuentas_reemplazo($idrecibo,$idotras_cuentas)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");

while ($qwe = $this->dbc->fetch($registro)) {

    $otrasCuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = $qwe[idotras_cuentas]");
    $cl = $otrasCuentas->fetch_assoc();

    $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $cl['id_cliente_proveedor'] . "'");
    $cli = $cliente->fetch_assoc();

    $caja_banco = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$qwe[idcuentaspof]' AND idotras_cuentas = '$idotras_cuentas'");
    
    if ($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "nrecibo" => $qwe['nrecibo'],
                "fecha" => $qwe['fecha'],
                "persona" => $qwe['persona'],
                "nit" => $cli['nit'],
                "direccion" => $cli['direccion'],
                "monto_recibo" => $qwe[6],
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "codigo" => $datos['codigo'],
                "nombre" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['monto']
            );
            array_push($lista, $res);
        }
    } else {
        $res = array(
            "nrecibo" => $qwe['nrecibo'],
            "fecha" => $qwe['fecha'],
            "monto" => $qwe['monto'],
            "persona" => $qwe['persona'],
            // "idcaja_bancos" => $qwe['idcaja_bancos'],
            // "codigo" => NULL,
            // "nombre" => NULL
        );
        array_push($lista, $res);
    }
}

        echo json_encode($lista);
    }

    public function listar_recibo_por_id_otras_cuentas($idrecibo)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
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
        $recib = $registro->fetch_assoc();

        $factura_lista = $this->dbc->query("SELECT DISTINCT idotras_cuentas 
        FROM detalle_caja_bancos_cobrar 
        WHERE idcuentaspof = '$idrecibo';");

    if ($factura_lista->num_rows > 0) {
        while ($factu = $this->dbc->fetch($factura_lista)) {
            $factura= $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$factu[idotras_cuentas]'");
            $ft = $factura->fetch_assoc();

            // if($ft['cobrado'] != 0){
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $ft['id_cliente_proveedor'] . "'");
                $cl = $cliente->fetch_assoc();
            // }else{
            //     $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $ft['proveedorcliente_idproveedorcliente'] . "'");
            //     $cl = $proveedor->fetch_assoc();
            // }

            $detalle_facturas = array(

                "nrecibo" => $recib['nrecibo'],
                "lugar" => $recib['lugar'],
                "fecha" => $recib['fecha'],
                "persona" => $recib['persona'],
                "idotras_cuentas" => $ft['idotras_cuentas'],
                "fecha_oc" => $ft['fecha'],
                "nro_otras_cuentas" => $ft['nro_otras_cuentas'],
                "nombre" => $cl['nombre'],
                "direccion" => $cl['direccion'],
                "nit" => $cl['nit'],
                "concepto" => $ft['concepto']
            
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
            $detalle_caja_bancos = array(
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "codigo" => $datos['codigo'],
                "nombre" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['total_monto'],
                
            );
            array_push($res['caja_bancos'], $detalle_caja_bancos);
        }
    }else{
          $factura= $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$recib[idotras_cuentas]'");
        $ft = $factura->fetch_assoc();

        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $ft['id_cliente_proveedor'] . "'");
        $cl = $cliente->fetch_assoc();
        
        $detalle_facturas = array(

            //lugar,    nombre_cliente_proveedor, nit, direccion row
            "nrecibo" => $recib['nrecibo'],
            "lugar" => $recib['lugar'],
            "fecha" => $recib['fecha'],
            "persona" => $recib['persona'],
            "idfactura" => $ft['idfactura'],
            "fecha_factura" => $ft['fecha'],
            "nro_factura" => $ft['nfactura'],
            "nombre" => $cl['nombre'],
            "direccion" => $cl['direccion'],
            "nit" => $cl['nit'],
            "por_concepto_de" => $ft['por_concepto_de']
        
        );

        array_push($res['facturas'], $detalle_facturas);
    }
        // ------------------------------------------------------------------------------------------------------------------------
      
        // }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
    echo json_encode($res);
    }
    public function listar_otras_cuentas_cobrar($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='2' AND oc.idempresa='$idempresa' ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspof WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $asd[0],
                "saldo" => $saldo,
                "forma_pago" => $qwe['forma_pago'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_otras_cuentas_cobro_sin_transaccion($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                FROM otras_cuentas
                WHERE transacciones_idtransacciones = '0' AND clase_otras_cuentas = '2' AND idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspof WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $asd[0],
                "saldo" => $saldo,
                "forma_pago" => $qwe['forma_pago'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_otras_cuentas_pago_sin_transaccion($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                FROM otras_cuentas
                WHERE transacciones_idtransacciones = '0' AND clase_otras_cuentas = '1' AND idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspof WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $asd[0],
                "saldo" => $saldo,
                "forma_pago" => $qwe['forma_pago'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function editar_otras_cuentas($idotras_cuentas,$fecha,$lugar,$id_cliente_proveedor,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago) {
        // $idempresa = $this->getidempresa($empresa);

        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre' AND empresa_idempresa = '$idempresa' AND idcaracteristicas != '$id'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbc->query("UPDATE otras_cuentas
                                    SET fecha = '$fecha',
                                    lugar = '$lugar',
                                    id_cliente_proveedor = '$id_cliente_proveedor',
                                    nro_tributario = '$nro_tributario',
                                    contacto = '$contacto',
                                    nro_doc_identidad = '$nro_doc_identidad',
                                    idtipo = '$idtipo',
                                    concepto = '$concepto',
                                    condiciones = '$condiciones',
                                    observaciones = '$observaciones',
                                    precio = '$precio',
                                    forma_pago = '$forma_pago'
                                    WHERE idotras_cuentas = '$idotras_cuentas';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        }
        echo json_encode($res);
    }

// ------------------------------------------------------------------------------------------------------


    public function listar_recibo_por_id_otras_cuentas_pagar_reemplazo($idrecibo,$idotras_cuentas)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        $registro = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idrecibo'");

while ($qwe = $this->dbc->fetch($registro)) {
    $otrasCuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = $qwe[idotras_cuentas]");
    $cl = $otrasCuentas->fetch_assoc();

    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $cl['id_cliente_proveedor'] . "'");
    $prov = $proveedor->fetch_assoc();
    // $otrasCuentas = $this->dbc->query("SELECT * FROM cli WHERE idotras_cuentas = $qwe[id_cliente_proveedor]");

    $caja_banco = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$qwe[idcuentaspor]' AND idotras_cuentas = '$idotras_cuentas'");
    
    if ($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "nrecibo" => $qwe['nrecibo'],
                "fecha" => $qwe['fecha'],
                "persona" => $qwe['persona'],
                "nit" => $prov['nit'],
                "direccion" => $prov['direccion'],
                "monto_recibo" => $qwe[6],
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "codigo" => $datos['codigo'],
                "nombre" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['monto']
            );
            array_push($lista, $res);
        }
    } else {
        $res = array(
            "nrecibo" => $qwe['nrecibo'],
            "fecha" => $qwe['fecha'],
            "monto" => $qwe['monto'],
            "persona" => $qwe['persona'],
            // "idcaja_bancos" => $qwe['idcaja_bancos'],
            // "codigo" => NULL,
            // "nombre" => NULL
        );
        array_push($lista, $res);
    }
}

        echo json_encode($lista);
    }

    public function listar_recibo_por_id_otras_cuentas_pagar($idrecibo)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // $lista = [];
        // $detalle_facturas = [];

        $consulta = $this->dbc->query("SELECT SUM(monto) AS suma_monto FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$idrecibo'");

        $mont = $consulta->fetch_assoc();

        $res = array(
            "monto_total" => $mont['suma_monto'],
            "facturas" => [],
            "caja_bancos" => []
        );

        $registro = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idrecibo'");
        $recib = $registro->fetch_assoc();

        $factura_lista = $this->dbc->query("SELECT DISTINCT idotras_cuentas 
        FROM detalle_caja_bancos_pagar
        WHERE idcuentaspor = '$idrecibo';");

    if ($factura_lista->num_rows > 0) {
        while ($factu = $this->dbc->fetch($factura_lista)) {
            $factura= $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$factu[idotras_cuentas]'");
            $ft = $factura->fetch_assoc();

            // if($ft['cobrado'] != 0){
            //     $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $ft['proveedorcliente_idproveedorcliente'] . "'");
            //     $cl = $cliente->fetch_assoc();
            // }else{
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $ft['id_cliente_proveedor'] . "'");
                $cl = $proveedor->fetch_assoc();
            // }

            $detalle_facturas = array(

                "nrecibo" => $recib['nrecibo'],
                "lugar" => $recib['lugar'],
                "fecha" => $recib['fecha'],
                "persona" => $recib['persona'],
                "idotras_cuentas" => $ft['idotras_cuentas'],
                "fecha_oc" => $ft['fecha'],
                "nro_otras_cuentas" => $ft['nro_otras_cuentas'],
                "nombre" => $cl['nombre'],
                "direccion" => $cl['direccion'],
                "nit" => $cl['nit'],
                "concepto" => $ft['concepto']
            
            );

            array_push($res['facturas'], $detalle_facturas);
        }

                $caja_banco = $this->dbc->query("SELECT idcaja_bancos, SUM(monto) AS total_monto
                FROM detalle_caja_bancos_pagar
                WHERE idcuentaspor = '$idrecibo'
                GROUP BY idcaja_bancos");

        while ($datos_caja = $this->dbc->fetch($caja_banco)) {

            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $detalle_caja_bancos = array(
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "codigo" => $datos['codigo'],
                "nombre" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['total_monto'],
                
            );
            array_push($res['caja_bancos'], $detalle_caja_bancos);
        }
    }else{
        $factura= $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$recib[idotras_cuentas]'");
        $ft = $factura->fetch_assoc();

        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $ft['id_cliente_proveedor'] . "'");
        $cl = $proveedor->fetch_assoc();
        
        $detalle_facturas = array(

            //lugar,    nombre_cliente_proveedor, nit, direccion row
            "nrecibo" => $recib['nrecibo'],
            "lugar" => $recib['lugar'],
            "fecha" => $recib['fecha'],
            "persona" => $recib['persona'],
            "idfactura" => $ft['idfactura'],
            "fecha_factura" => $ft['fecha'],
            "nro_factura" => $ft['nfactura'],
            "nombre" => $cl['nombre'],
            "direccion" => $cl['direccion'],
            "nit" => $cl['nit'],
            "por_concepto_de" => $ft['por_concepto_de']
        
        );

        array_push($res['facturas'], $detalle_facturas);
    }

    echo json_encode($res);
    }

    public function listar_otras_cuentas_pagar($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='1' AND oc.idempresa='$idempresa' ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspor WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $asd[0],
                "saldo" => $saldo,
                "forma_pago" => $qwe['forma_pago'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

     public function asignar_asiento_A_otras_cuentas($data) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $idempresa = $this->getidempresa($data['idempresa']);
        $idsucursal = $this->getidsucursal($data['idsucursal']); 
        $gestion = $this->getgestionactualid($idempresa);
    
        if($data['idasientotipo'] != 0){
                // Obtener el número de transacción más reciente y sumar 1
        $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$idempresa AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado12 = $nroTrans->fetch_assoc();
        $nroTransaccion = $resultado12['codigotransaccion'] + 1;
 
//-------------------------------------------------------------------------------------------------------------

        $idAsientoTipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='{$data['idasientotipo']}' AND idorganizacion='$idempresa';");
        $asiento = $idAsientoTipo->fetch_assoc();  // Cambiado $nroTrans->fetch_assoc() a $idAsientoTipo->fetch_assoc()
        $tipotransaccion = $asiento['tipo'];
    
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion', '{$data['fecha']}', '1', '0', '{$data['glosa']}', '1','1', '$tipotransaccion', '$idempresa', '$idsucursal', '$gestion')");
    
        // Obtener el ID del registro recién insertado
        $idtransaccion = $this->dbc->insert_id;
    
        // Editar las facturas seleccionadas
        $montoFacturas = 0;
        foreach ($data['otras_cuentas'] as $otra_cuenta) {
            $selectFact = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas='{$otra_cuenta['idotras_cuentas']}' AND idempresa='$idempresa';");
            $fact = $selectFact->fetch_assoc();

    //------------------------------------------------------------------------------------------------
            $montoFacturas += $otra_cuenta['monto'];
            $updatetranscodigo = $this->dbc->query("UPDATE otras_cuentas SET transacciones_idtransacciones = '$idtransaccion' WHERE idotras_cuentas = '{$otra_cuenta['idotras_cuentas']}'");

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
        
    }else{

            foreach ($data['otras_cuentas'] as $otra_cuenta) {

                $updatetranscodigo = $this->dbc->query("UPDATE otras_cuentas SET transacciones_idtransacciones = '$data[idtrans]' WHERE idotras_cuentas = '{$otra_cuenta['idotras_cuentas']}'");

            }
        }

    
        // Respuesta
        if ($updatetranscodigo === TRUE) {
            $res = array("success", "Se Registro Correctamente", "cobrofacturasaasientomodelo");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }

    public function listar_otras_cuentas_cobrar_select($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='2' AND oc.idempresa='$idempresa' ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$qwe[id_cliente_proveedor]'");
            $cl = $this->dbcm->fetch($cliente);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspof WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            if($saldo != 0){
                $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "saldo" => $saldo,
                "nombrep" => $cl['nombre']
                );
                array_push($lista, $res);
            }else{

            }
            // array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_otras_cuentas_pagar_select($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='1' AND oc.idempresa='$idempresa' ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='$qwe[id_cliente_proveedor]'");
            $prov = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspor WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            if($saldo != '0'){
                $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "saldo" => $saldo,
                "nombrep" => $prov['nombre']
                );
                array_push($lista, $res);
            }else{

            }
            // array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$empresa' AND estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); listapagarfactura
        return $qwe['idgestion'];
    }
    public function getidsucursal($md5)
    {
        $registro = $this->dbe->query("SELECT * FROM sucursalcontable WHERE md5(idsucursalcontable)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }
    //listar_recibo_por_id_otras_cuentas_pagar
}