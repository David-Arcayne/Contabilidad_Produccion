<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class TransFactura_pagar extends DB{
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
        $orga = $this->getidempresa($empresa); // recibe md5 de la id
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

    // public function registrocobrarfactura($idfactura, $idtransaccion, $idcuenta, $fecha, $nrecibo, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa)
    public function registropagarfacturaGrupal($fecha,$persona,$ci,$monto,$idasientotipo,$idtransaccion,$idcaja_bancos,$empresa,$sucursal,$archivo,$data,$zn)
    {
        // echo json_encode($data);
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha . ' ' . $hora_actual; // Resultado tipo DATETIME

        if($idcaja_bancos == ""){

        }else{
            $caja_bancos = json_decode($idcaja_bancos, true);
        }

        $facturas = json_decode($data, true);
        // echo json_encode(array($fecha,$nrecibo,$persona,$ci,$monto,$idasientotipo,$empresa,$sucursal,$archivo,$facturas));
        $ide = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal); 
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

        $res = "";
        $glosa = "Registro cobro $nrecibo";
        // $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";
        if ($idasientotipo != "") {
            $glosa2 = $this->dbc->real_escape_string($glosa);
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
        VALUES ('$nroTransaccion2', '$fecha2', '1', '0', '$glosa2', '1','1', '$tt[idtipotransaccion]', '$ide', '$idsucursal', '$gestion')");
    
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
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)VALUES('$debe','$haber','$nota','$idtrans','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$idsucursal','$orden')");
                
                $orden = $orden + 1;
            }
        } else {
            $idtrans = $idtransaccion;
        }
// --------------------------------------------------------------------------------------------------------

if(empty($archivo['name'])){
    $registropago = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
    VALUES(NULL,'$nrecibo','$fecha_completa','varios clientes','$persona','$ci','$monto','0','$idtrans','0',NULL)");

// $registropago = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta)
// VALUES('$nrecibo','$fecha','varios clientes','$persona','$ci','$monto','0','$idtrans','0')");

if ($registropago === TRUE) {
    $idcuentasPor = $this->dbc->insert_id;
    $res = array("success", "Registro Realizado", "registropagarfacturaGrupal");
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
     $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
    VALUES(NULL,'$nrecibo','$fecha_completa','varios clientes','$persona','$ci','$monto','0','$idtrans','0','$unique_name')");

if ($registropago2 === TRUE) {
    $res = array("success", "Registro Realizado", "registropagarfacturaGrupal");
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

$idcuentasPor = $this->dbc->insert_id;
foreach($facturas as $factura){

    $cobras = $this->dbc->query("SELECT SUM(monto) AS montoSuma FROM cuentaspor WHERE idfactura='$factura[idfactura]'"); //173
    // $asd = $this->dbc->fetch($cobras);
    $asd = $cobras->fetch_assoc();
    if($asd['montoSuma'] == NULL){
        $registrarTabla = $this->dbc->query("INSERT INTO cuentaspagar_grupal(idcuentaspor,idfactura,monto)VALUES('$idcuentasPor','$factura[idfactura]','$factura[monto]')");
    }else{
        $montoSuma = $asd['montoSuma'];
        $montoCobrado = $factura['monto'] - $montoSuma;
        $registrarTabla = $this->dbc->query("INSERT INTO cuentaspagar_grupal(idcuentaspor,idfactura,monto)VALUES('$idcuentasPor','$factura[idfactura]','$montoCobrado')");
    }

    $updatetranscodigo = $this->dbc->query("UPDATE factura SET pagado = '2' WHERE idfactura = '$factura[idfactura]'");

    // $montoFacturas += $factura['monto']; proveedor
    // $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans' WHERE idfactura = '{$factura['idfactura']}'");
}
    if($idcaja_bancos == ""){
    // NO SE REGISTRARA CAJA_BANCOS
    }else{
        foreach($caja_bancos as $cajaBanco){
        $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_pagar(idcaja_bancos,monto,idcuentaspor,idfactura)
        VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentasPor','$cajaBanco[idfactura]')");
        }
    }

    if ($registrarTabla === TRUE) {
        $res = array("success", "Registro Realizado", "registropagarfacturaGrupal");
    } else {
        $res = array("danger", "No se pudo realizar el registro");
    }
        echo json_encode($res);
}

    public function lista_pagar_pagado_factura($sucursal)
    {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        //pagar cliente
        $lista = [];
        $cf = 1;
        $idsucursal = $this->getidsucursal($sucursal);
        $registro = $this->dbc->query("SELECT f.idfactura,f.fecha,f.nfactura, f.montofactura,f.proveedorcliente_idproveedorcliente,f.transacciones_idtransacciones,f.cuenta,f.pagado,f.por_concepto_de
         FROM factura f
         WHERE f.clasefactura='$cf' AND f.sucursal='$idsucursal' 
         ORDER BY f.idfactura DESC");
        //  $registro = $this->dbc->query("SELECT f.idfactura,f.fecha,f.nfactura, f.montofactura,f.proveedorcliente_idproveedorcliente,f.transacciones_idtransacciones,f.cuenta,f.cobrado,f.por_concepto_de
        //  FROM factura f
        //  WHERE f.clasefactura='$cf' AND f.sucursal='$idsucursal' 
        //  ORDER BY f.idfactura DESC");
        while ($qwe = $this->dbc->fetch($registro)) {
            $pagados=[];

            $codi_trans = $this->dbc->query(" SELECT * FROM transacciones WHERE idtransacciones = '$qwe[5]'");
            $cod_transaccion = $codi_trans->fetch_assoc();

            // CONSULTA PARA SABER SI HAY INDIVIDUALES
            $hay_indi = $this->dbc->query("SELECT COUNT(*) AS hay_individual FROM cuentaspor WHERE idfactura='$qwe[0]'");
            $resultado = $hay_indi->fetch_assoc();
            $hayIndividuales = $resultado['hay_individual'];

            // CONSULTA PARA SABER SI HAY GRUPALES
            $hay_grup = $this->dbc->query("SELECT COUNT(*) AS hay_grupal FROM cuentaspagar_grupal WHERE idfactura='$qwe[0]'");
            $resultado2 = $hay_grup->fetch_assoc();
            $hayGrupales = $resultado2['hay_grupal'];
            // $asd = $this->dbc->fetch($cobras);
            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe[4] . "'");
            $pro = $this->dbcm->fetch($proveedor);
            if($hayIndividuales > 0){
                if($hayGrupales > 0){
                    // hay grupales e individuales
                    $mostrarIndi = $this->dbc->query(" SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor 
                    FROM cuentaspor WHERE idfactura = '$qwe[0]'");

                     while ($zxc = $this->dbc->fetch($mostrarIndi)) {
                        $pes = array("nrecibo" => $zxc[0], "fechar" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $zxc[4], "id" => $zxc[5]);
                        array_push($pagados, $pes);
                    }
    
               $listaGrup2 = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idfactura='$qwe[0]'");
               $resultado33 = $listaGrup2->fetch_assoc();
               $idrecibo2 = $resultado33['idcuentaspor'];
               $datosRecibo2 = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor FROM cuentaspor WHERE idcuentaspor='$idrecibo2'");
               
               while ($www = $this->dbc->fetch($datosRecibo2)) {
                   $pes2 = array("nrecibo" => $www[0], "fechar" => $www[1], "persona" => $www[2], "ci" => $www[3], "monto" => $resultado33['monto'], "id" => $www[5]);
                   array_push($pagados, $pes2);
               }
               $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $cod_transaccion['codigotransaccion'], "idproveedor" => $qwe[4], "nombrep" => $pro['nombre'], "monto" => $qwe[3], "cobrado" => $resultado33['monto'], "saldo" => 0, "transaccion" => $qwe[5], "cuenta" => $qwe[6],"por_concepto_de" => $qwe['por_concepto_de'], "detalle" => $pagados);
               array_push($lista, $res);

                }else{
                    //hay solo individuales
                    
                    $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspor WHERE idfactura='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe[3] - $asd[0];
                    $cuentacobrar2 = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor FROM cuentaspor WHERE idfactura='$qwe[0]'");
                            while ($zxc = $this->dbc->fetch($cuentacobrar2)) {
                                $pes = array("nrecibo" => $zxc[0], "fechar" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $zxc[4], "id" => $zxc[5]);
                                array_push($pagados, $pes);
                            }
                    $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $cod_transaccion['codigotransaccion'], "idproveedor" => $qwe[4], "nombrep" => $pro['nombre'], "monto" => $qwe[3], "cobrado" => $asd[0], "saldo" => $saldo, "transaccion" => $qwe[5], "cuenta" => $qwe[6],"por_concepto_de" => $qwe['por_concepto_de'], "detalle" => $pagados);
                    array_push($lista, $res);
                }
            }elseif($hayGrupales > 0){
                //hay solo grupales
                $listaGrup = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idfactura='$qwe[0]'");
                $resultado3 = $listaGrup->fetch_assoc();
                $idrecibo = $resultado3['idcuentaspor'];
                $datosRecibo = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor FROM cuentaspor WHERE idcuentaspor='$idrecibo'");
                
                while ($zxc = $this->dbc->fetch($datosRecibo)) {
                    $pes = array("nrecibo" => $zxc[0], "fechar" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $resultado3['monto'], "id" => $zxc[5]);
                    array_push($pagados, $pes);
                }
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $cod_transaccion['codigotransaccion'], "idproveedor" => $qwe[4], "nombrep" => $pro['nombre'], "monto" => $qwe[3], "cobrado" => $resultado3['monto'], "saldo" => 0, "transaccion" => $qwe[5], "cuenta" => $qwe[6],"por_concepto_de" => $qwe['por_concepto_de'], "detalle" => $pagados);
                array_push($lista, $res);
            }
            elseif($qwe[7] == 2){
                //FACTURAS Q NO TIENEN NINGUN RECIBO pero si estan pagados
            $pagados = [];
            
            //  // Verificar que los índices existen antes de acceder a ellos
            // $codigo = isset($qwe[3]) ? $qwe[3] : 'N/A';
            // $idproveedor = isset($qwe[5]) ? $qwe[5] : 'N/A';
            $nombrep = isset($pro['nombre']) ? $pro['nombre'] : 'Desconocido';

            $res = array("id" => $qwe[0],
             "fecha" => $qwe[1],
              "numero" => $qwe[2],
             "codigo" => $cod_transaccion['codigotransaccion'],
              "idproveedor" => $qwe[4],
                // "nombrep" => $pro['nombre'],
                "nombrep" => $nombrep,
              "monto" => $qwe[3],
               "cobrado" => $qwe[3],
                "saldo" => 0,
                 "transaccion" => $qwe[5],
               "cuenta" => $qwe[6],
               "por_concepto_de" => $qwe['por_concepto_de'],
                "detalle" => $pagados);
            array_push($lista, $res);
            
            }
            else{
                //FACTURAS Q NO TIENEN NINGUN RECIBO pagado
            $pagados = [];
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2],
             "codigo" => $cod_transaccion['codigotransaccion'], "idproveedor" => $qwe[4], "nombrep" => $pro['nombre'],
              "monto" => $qwe[3], "cobrado" => 0, "saldo" => $qwe[3], "transaccion" => $qwe[5],
               "cuenta" => $qwe[6],"por_concepto_de" => $qwe['por_concepto_de'], "detalle" => $pagados);
            array_push($lista, $res);
            
        }
        
    }
    echo json_encode($lista);
}

public function listapagos_individuales($idfactura)
    {
        $fact = $this->dbc->query("SELECT * FROM factura WHERE idfactura='$idfactura'");
        $aaa = $fact->fetch_assoc();
        if($aaa['cobrado'] != 0){
            $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $aaa['proveedorcliente_idproveedorcliente'] . "'");
            $cl = $cliente->fetch_assoc();
        }else{
            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $aaa['proveedorcliente_idproveedorcliente'] . "'");
            $cl = $proveedor->fetch_assoc();
        }
        $lista = [];
        // }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
         // CONSULTA PARA SABER SI HAY INDIVIDUALES
         $hay_indi = $this->dbc->query("SELECT COUNT(*) AS hay_individual FROM cuentaspor WHERE idfactura='$idfactura'");
         $resultado = $hay_indi->fetch_assoc();
         $hayIndividuales = $resultado['hay_individual'];

         // CONSULTA PARA SABER SI HAY GRUPALES
         $hay_grup = $this->dbc->query("SELECT COUNT(*) AS hay_grupal FROM cuentaspagar_grupal WHERE idfactura='$idfactura'");
         $resultado2 = $hay_grup->fetch_assoc();
         $hayGrupales = $resultado2['hay_grupal'];
        if($hayIndividuales > 0){
            if($hayGrupales > 0){
                // hay grupales e individuales
                        $mostrarIndi = $this->dbc->query(" SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor,transaccion,archivo,lugar,concepto
                        FROM cuentaspor WHERE idfactura = '$idfactura'");
    
                        while ($zxc = $this->dbc->fetch($mostrarIndi)) {
                            $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$zxc[transaccion]'");
                            $idtr = $trans->fetch_assoc();

                            $res = array("recibo" => $zxc[0], "fecha" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $zxc[4], "id" => $zxc[5],"transaccion" => $zxc[6],"codigotransaccion" => $idtr['codigotransaccion'],"nombre_archivo" => $zxc[7],"lugar" => $zxc[8],"nit" => $cl['nit'],"direccion" => $cl['direccion'],"concepto" => $zxc['concepto']);
                            array_push($lista, $res);
                        }
    
                $listaGrup2 = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idfactura='$idfactura'");
                $resultado33 = $listaGrup2->fetch_assoc();
                $idrecibo2 = $resultado33['idcuentaspor'];
                $datosRecibo2 = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor,transaccion,archivo,lugar,concepto FROM cuentaspor WHERE idcuentaspor='$idrecibo2'");
                
                while ($www = $this->dbc->fetch($datosRecibo2)) {
                    $trans2 = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$www[transaccion]'");
                    $idtr2 = $trans2->fetch_assoc();
                    
                    $res2 = array("recibo" => $www[0], "fecha" => $www[1], "persona" => $www[2], "ci" => $www[3], "monto" => $resultado33['monto'], "id" => $www[5],"transaccion" => $zxc[6],"codigotransaccion" => $idtr2['codigotransaccion'],"nombre_archivo" => $www[7],"lugar" => $www[8],"nit" => $cl['nit'],"direccion" => $cl['direccion'],"concepto" => $www['concepto']);
                    array_push($lista, $res2);
                }
    
            }else{
                //SOLO HAY INDIVIDUALES
                $registro = $this->dbc->query("SELECT c.idcuentaspor,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,lugar,concepto FROM cuentaspor as c WHERE c.idfactura='$idfactura'");
                while ($qwe = $this->dbc->fetch($registro)) {
                    $trans2 = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
                    $idtr2 = $trans2->fetch_assoc();

                    $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6],"codigotransaccion" => $idtr2['codigotransaccion'],"nombre_archivo" => $qwe[7],"lugar" => $qwe[8],"nit" => $cl['nit'],"direccion" => $cl['direccion'],"concepto" => $qwe['concepto']);
                    array_push($lista, $res);
                }
        }
        }elseif($hayGrupales > 0){
                       //hay solo grupales
                       $listaGrup = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idfactura='$idfactura'");
                       $resultado3 = $listaGrup->fetch_assoc();
                       $idrecibo = $resultado3['idcuentaspor'];
                       $datosRecibo = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor,transaccion,archivo,lugar,concepto FROM cuentaspor WHERE idcuentaspor='$idrecibo'");
                       
                       while ($zxc = $this->dbc->fetch($datosRecibo)) {

                        $trans2 = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$zxc[transaccion]'");
                        $idtr2 = $trans2->fetch_assoc();

                           $res = array("recibo" => $zxc[0], "fecha" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $resultado3['monto'], "id" => $zxc[5],"transaccion" =>$zxc[6],"codigotransaccion" => $idtr2['codigotransaccion'], "nombre_archivo" => $zxc[7],"lugar" => $zxc[8],"nit" => $cl['nit'],"direccion" => $cl['direccion'],"concepto" => $zxc['concepto']);
                           array_push($lista, $res);
                       }
                    //    $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'], "monto" => $qwe[4], "pagado" => $resultado3['monto'], "saldo" => 0, "transaccion" => $qwe[6], "cuenta" => $qwe[7], "detalle" => $pagados);
       
        }

        echo json_encode($lista);
    }
    public function registrar_transaccion_recibo_pago($idRecibo,$fecha,$monto,$glosa, $asiento,$idtransaccion,$empresa,$sucursal){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        $ide = $this->getidempresa($empresa);
        $sucursal = $this->getidsucursal($sucursal);
        $gestion = $this->getgestionactualid($ide);

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

            $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`,`estado`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) 
            VALUES (NULL, '$nroTransaccion', '$fecha', '1', '0', '$glosa', '1','1', '$tt[idtipotransaccion]', '$ide', '$sucursal', '$gestion');");
            //nuevat transaccion
            $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$nroTransaccion' AND  organizacion_idorganizacion='$ide' ORDER BY idtransacciones DESC LIMIT 1");
            $ww = $this->dbc->fetch($transis);
            $trans = $ww['idtransacciones'];
            //$detallepago
            $editar_recibo = $this->dbc->query("UPDATE cuentaspor SET transaccion = '$trans' WHERE idcuentaspor ='$idRecibo'");
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
        }elseif($idtransaccion != "" && $asiento == ""){
            // $trans = $qq['idtransacciones'];
            $insertrans = $this->dbc->query("UPDATE cuentaspor SET transaccion = '$idtransaccion' WHERE idcuentaspor ='$idRecibo'");
        }
        if($insertrans == TRUE){
            $res = array("success", "Registro exitoso","registrar_transaccion_recibo");
        }else{
            $res = array("danger", "No se pudo registrar","registrar_transaccion_recibo");
        }
        echo json_encode($res);
    }
    //lista_pagar_pagado_factura
}