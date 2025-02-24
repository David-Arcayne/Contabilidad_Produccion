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
    public function pagofacturasaasientomodelo($data) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $idempresa = $this->getidempresa($data['idempresa']);
        $idsucursal = $this->getidsucursal($data['idsucursal']); 
        $gestion = $this->getgestionactualid($idempresa);
    
        // Obtener el número de transacción más reciente y sumar 1
        $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$idempresa AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado12 = $nroTrans->fetch_assoc();
        $nroTransaccion = $resultado12['codigotransaccion'] + 1;
    
         // Obtener el número de transacción más reciente y sumar 1
        $nroRec = $this->dbc->query("SELECT count(*) AS cantidadRec FROM cuentaspor cp INNER JOIN transacciones t ON t.idtransacciones=cp.transaccion WHERE t.organizacion_idorganizacion='$idempresa' AND idgestion = '$gestion'");
        $resultado123 = $nroRec->fetch_assoc();
        $nroRecibo = $resultado123['cantidadRec'] + 1;

        // Obtener el tipo de transacción
        $idAsientoTipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='{$data['idasientotipo']}' AND idorganizacion='$idempresa';");
        $asiento = $idAsientoTipo->fetch_assoc();  // Cambiado $nroTrans->fetch_assoc() a $idAsientoTipo->fetch_assoc()
        $tipotransaccion = $asiento['tipo'];
    
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion', '{$data['fecha']}', '1', '0', '{$data['glosa']}', '1','1', '$tipotransaccion', '$idempresa', '$idsucursal', '$gestion')");
    
        // Obtener el ID del registro recién insertado
        $idtrans = $this->dbc->insert_id;
    
        // Editar las facturas seleccionadas
        $montoFacturas = 0;
        foreach ($data['facturas'] as $factura) {
            // $montoFacturas += $factura['monto'];
            // $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans' WHERE idfactura = '{$factura['idfactura']}'");
            
            $selectFact = $this->dbc->query("SELECT * FROM factura WHERE idfactura='{$factura['idfactura']}' AND idorganizacion='$idempresa';");
            $fact = $selectFact->fetch_assoc();
            // proveedorcliente_idproveedorcliente
            if ($fact['clasefactura'] == 1) { //POR PAGAR
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $fact['proveedorcliente_idproveedorcliente'] . "'");
                // $asd = $this->dbcm->fetch($cliente);
                $clientSelect = $cliente->fetch_assoc();
                // $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            } else {
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $fact['proveedorcliente_idproveedorcliente'] . "'");
                $clientSelect = $proveedor->fetch_assoc();

                // $asd = $this->dbcm->fetch($proveedor);
                // $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            }
            $montoFacturas += $factura['monto'];
            $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans' WHERE idfactura = '{$factura['idfactura']}'");
            if($fact['pagado'] == 2){ //PAGADO
                //CREAR RECIBO

                $consul = $this->dbc->query("SELECT * FROM cuentaspor WHERE idfactura='$fact[idfactura]'");
                $consul_grup = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idfactura='$fact[idfactura]'");
                if($consul->num_rows > 0 || $consul_grup->num_rows > 0){ //YA EXISTE RECIBO EN ESTA FACTURA 
                    //SOLO SE ASIGNA TRANSACCION A ESTA FACTURA NADA MAS
                }else{
                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspor(nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
                VALUES('$nroRecibo','$fact[fecha]','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$fact[montofactura]','$fact[idfactura]','$idtrans','0',NULL)");
                }

            }else{
                //NADA
            }
            
        
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
    
        // Respuesta
        if ($writetrans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "pagofacturasaasientomodelo");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }

    // public function registrocobrarfactura($idfactura, $idtransaccion, $idcuenta, $fecha, $nrecibo, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa)
    public function registropagarfacturaGrupal($fecha,$nrecibo,$persona,$ci,$monto,$idasientotipo,$idcaja_bancos,$empresa,$sucursal,$archivo,$data)
    {
        // echo json_encode($data);
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $facturas = json_decode($data, true);
        // echo json_encode(array($fecha,$nrecibo,$persona,$ci,$monto,$idasientotipo,$empresa,$sucursal,$archivo,$facturas));
        $ide = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal); 
        $gestion = $this->getgestionactualid($ide);
        
// Obtener el número de transacción más reciente y sumar 1
$nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$ide AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
$resultado12 = $nroTrans->fetch_assoc();
$nroTransaccion = $resultado12['codigotransaccion'] + 1;

        $res = "";
        $glosa = "Registro cobro $nrecibo";
        // $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";
        if ($idasientotipo != 0) {
            $glosa2 = $this->dbc->real_escape_string($glosa);
            $fecha2 = $this->dbc->real_escape_string($fecha);
            $nroTransaccion2 = $this->dbc->real_escape_string($nroTransaccion);
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion2', '$fecha2', '1', '0', '$glosa2', '1','1', '$tipotransaccion', '$ide', '$idsucursal', '$gestion')");
    
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
            $trans = $resultado12['idtransacciones'];
        }
// --------------------------------------------------------------------------------------------------------

if(empty($archivo['name'])){
    $registropago = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,idcaja_bancos,archivo)
    VALUES(NULL,'$nrecibo','$fecha','varios clientes','$persona','$ci','$monto','0','$idtrans','0','$idcaja_bancos',NULL)");

// $registropago = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta)
// VALUES('$nrecibo','$fecha','varios clientes','$persona','$ci','$monto','0','$idtrans','0')");

if ($registropago === TRUE) {
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
     $registropago2 = $this->dbc->query("INSERT INTO cuentaspor(idcuentaspor,nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,idcaja_bancos,archivo)
    VALUES(NULL,'$nrecibo','$fecha','varios clientes','$persona','$ci','$monto','0','$idtrans','0','$idcaja_bancos','$unique_name')");

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
    // $montoFacturas += $factura['monto'];
    // $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans' WHERE idfactura = '{$factura['idfactura']}'");
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
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        //pagar
        $lista = [];
        $cf = 1;
        $idsucursal = $this->getidsucursal($sucursal);
        $registro = $this->dbc->query("SELECT f.idfactura,f.fecha,f.nfactura,t.codigotransaccion, f.montofactura,f.proveedorcliente_idproveedorcliente,f.transacciones_idtransacciones,f.cuenta,f.pagado
         FROM factura f,transacciones t
         WHERE f.clasefactura='$cf' AND f.sucursal='$idsucursal' AND f.transacciones_idtransacciones=t.idtransacciones ORDER BY f.idfactura DESC");
        while ($qwe = $this->dbc->fetch($registro)) {
            $pagados=[];

            // CONSULTA PARA SABER SI HAY INDIVIDUALES
            $hay_indi = $this->dbc->query("SELECT COUNT(*) AS hay_individual FROM cuentaspor WHERE idfactura='$qwe[0]'");
            $resultado = $hay_indi->fetch_assoc();
            $hayIndividuales = $resultado['hay_individual'];

            // CONSULTA PARA SABER SI HAY GRUPALES
            $hay_grup = $this->dbc->query("SELECT COUNT(*) AS hay_grupal FROM cuentaspagar_grupal WHERE idfactura='$qwe[0]'");
            $resultado2 = $hay_grup->fetch_assoc();
            $hayGrupales = $resultado2['hay_grupal'];
            // $asd = $this->dbc->fetch($cobras);
            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe[5] . "'");
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
               $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'], "monto" => $qwe[4], "cobrado" => $resultado33['monto'], "saldo" => 0, "transaccion" => $qwe[6], "cuenta" => $qwe[7], "detalle" => $pagados);
               array_push($lista, $res);

                }else{
                    //hay solo individuales
                    
                    $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspor WHERE idfactura='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe[4] - $asd[0];
                    $cuentacobrar2 = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor FROM cuentaspor WHERE idfactura='$qwe[0]'");
                            while ($zxc = $this->dbc->fetch($cuentacobrar2)) {
                                $pes = array("nrecibo" => $zxc[0], "fechar" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $zxc[4], "id" => $zxc[5]);
                                array_push($pagados, $pes);
                            }
                    $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'], "monto" => $qwe[4], "cobrado" => $asd[0], "saldo" => $saldo, "transaccion" => $qwe[6], "cuenta" => $qwe[7], "detalle" => $pagados);
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
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'], "monto" => $qwe[4], "cobrado" => $resultado3['monto'], "saldo" => 0, "transaccion" => $qwe[6], "cuenta" => $qwe[7], "detalle" => $pagados);
                array_push($lista, $res);
            }
            elseif($qwe[8] == 2){
                //FACTURAS Q NO TIENEN NINGUN RECIBO pero si estan pagados
            $pagados = [];
            
            //  // Verificar que los índices existen antes de acceder a ellos
            // $codigo = isset($qwe[3]) ? $qwe[3] : 'N/A';
            // $idproveedor = isset($qwe[5]) ? $qwe[5] : 'N/A';
            $nombrep = isset($pro['nombre']) ? $pro['nombre'] : 'Desconocido';

            $res = array("id" => $qwe[0],
             "fecha" => $qwe[1],
              "numero" => $qwe[2],
             "codigo" => $qwe[3],
              "idproveedor" => $qwe[5],
                // "nombrep" => $pro['nombre'],
                "nombrep" => $nombrep,
              "monto" => $qwe[4],
               "cobrado" => $qwe[4],
                "saldo" => 0,
                 "transaccion" => $qwe[6],
               "cuenta" => $qwe[7],
                "detalle" => $pagados);
            array_push($lista, $res);
            
            }
            else{
                //FACTURAS Q NO TIENEN NINGUN RECIBO pagado
            $pagados = [];
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2],
             "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'],
              "monto" => $qwe[4], "cobrado" => 0, "saldo" => $qwe[4], "transaccion" => $qwe[6],
               "cuenta" => $qwe[7], "detalle" => $pagados);
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
                        $mostrarIndi = $this->dbc->query(" SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor,transaccion,archivo
                        FROM cuentaspor WHERE idfactura = '$idfactura'");
    
                        while ($zxc = $this->dbc->fetch($mostrarIndi)) {
                            $res = array("recibo" => $zxc[0], "fecha" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $zxc[4], "id" => $zxc[5],"transaccion" => $zxc[6],"nombre_archivo" => $zxc[7],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
                            array_push($lista, $res);
                        }
    
                $listaGrup2 = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idfactura='$idfactura'");
                $resultado33 = $listaGrup2->fetch_assoc();
                $idrecibo2 = $resultado33['idcuentaspor'];
                $datosRecibo2 = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor,transaccion,archivo FROM cuentaspor WHERE idcuentaspor='$idrecibo2'");
                
                while ($www = $this->dbc->fetch($datosRecibo2)) {
                    $res2 = array("recibo" => $www[0], "fecha" => $www[1], "persona" => $www[2], "ci" => $www[3], "monto" => $resultado33['monto'], "id" => $www[5],"transaccion" => $zxc[6],"nombre_archivo" => $www[7],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
                    array_push($lista, $res2);
                }
    
            }else{
                //SOLO HAY INDIVIDUALES
                $registro = $this->dbc->query("SELECT c.idcuentaspor,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo FROM cuentaspor as c WHERE c.idfactura='$idfactura'");
                while ($qwe = $this->dbc->fetch($registro)) {
                    $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6],"nombre_archivo" => $qwe[7],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
                    array_push($lista, $res);
                }
        }
        }elseif($hayGrupales > 0){
                       //hay solo grupales
                       $listaGrup = $this->dbc->query("SELECT * FROM cuentaspagar_grupal WHERE idfactura='$idfactura'");
                       $resultado3 = $listaGrup->fetch_assoc();
                       $idrecibo = $resultado3['idcuentaspor'];
                       $datosRecibo = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspor,transaccion,archivo FROM cuentaspor WHERE idcuentaspor='$idrecibo'");
                       
                       while ($zxc = $this->dbc->fetch($datosRecibo)) {
                           $res = array("recibo" => $zxc[0], "fecha" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $resultado3['monto'], "id" => $zxc[5],"transaccion" =>$zxc[6], "nombre_archivo" => $zxc[7],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
                           array_push($lista, $res);
                       }
                    //    $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'], "monto" => $qwe[4], "pagado" => $resultado3['monto'], "saldo" => 0, "transaccion" => $qwe[6], "cuenta" => $qwe[7], "detalle" => $pagados);
       
        }

        echo json_encode($lista);
    }
    public function registrar_transaccion_recibo_pago($idRecibo,$fecha,$monto,$glosa, $asiento,$empresa,$sucursal){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        $ide = $this->getidempresa($empresa);
        $sucursal = $this->getidsucursal($sucursal);
        $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";
        $transi = $this->dbc->query("SELECT * FROM transacciones WHERE organizacion_idorganizacion='$ide' and sucursal='$sucursal' order by codigotransaccion desc Limit 1");
        $qq = $this->dbc->fetch($transi);
        $codigo = $qq['codigotransaccion'] + 1;
        if ($asiento != 0) {
            $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`,`estado`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) 
            VALUES (NULL, '$codigo', '$fecha', '1', '0', '$glosa', '1','1', '$tipotransaccion', '$ide', '$sucursal', '$gestion');");
            //nuevat transaccion
            $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$codigo' AND  organizacion_idorganizacion='$ide' ORDER BY idtransacciones DESC LIMIT 1");
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
        } else {
            $trans = $qq['idtransacciones'];
            $editar_recibo = $this->dbc->query("UPDATE cuentaspor SET transaccion = '$trans' WHERE idcuentaspor ='$idRecibo'");
        }
        if($insertrans == TRUE){
            $res = array("success", "Registro exitoso","registrar_transaccion_recibo");
        }else{
            $res = array("danger", "No se pudo registrar","registrar_transaccion_recibo");
        }
        echo json_encode($res);
    }
}