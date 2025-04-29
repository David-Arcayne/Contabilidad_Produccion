<?php
session_start();
//require_once "db.php";
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
        $idtrans = $this->dbc->insert_id;
    
        // Editar las facturas seleccionadas
        $montoFacturas = 0;
        foreach ($data['facturas'] as $factura) {
            $selectFact = $this->dbc->query("SELECT * FROM factura WHERE idfactura='{$factura['idfactura']}' AND idorganizacion='$idempresa';");
            $fact = $selectFact->fetch_assoc();

    //------------------------------------------------------------------------------------------------
            $montoFacturas += $factura['monto'];
            $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans' WHERE idfactura = '{$factura['idfactura']}'");

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

            foreach ($data['facturas'] as $factura) {

                $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$data[idtrans]' WHERE idfactura = '{$factura['idfactura']}'");

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

    public function asignar_asiento_A_factura2($data) {
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
        //-------------------------------------------------------------------------------
     // Obtener el número de transacción más reciente y sumar 1
    //  $nroRec = $this->dbc->query("SELECT count(*) AS cantidadRec FROM cuentaspof cp INNER JOIN transacciones t ON t.idtransacciones=cp.transaccion WHERE t.organizacion_idorganizacion='$idempresa' AND idgestion = '$gestion'");
    //  $resultado123 = $nroRec->fetch_assoc();
    //  $nroRecibo = $resultado123['cantidadRec'] + 1;
        // Obtener el tipo de transacción
//-------------------------------------------------------------------------------------------------------------

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
            $selectFact = $this->dbc->query("SELECT * FROM factura WHERE idfactura='{$factura['idfactura']}' AND idorganizacion='$idempresa';");
            $fact = $selectFact->fetch_assoc();
            // proveedorcliente_idproveedorcliente
    //------------------------------------------------------------------------------------
            // if ($fact['clasefactura'] == 2) { //POR COBRAR
            //     $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $fact['proveedorcliente_idproveedorcliente'] . "'");
            //     // $asd = $this->dbcm->fetch($cliente);
            //     $clientSelect = $cliente->fetch_assoc();
            //     // $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            // } else {
            //     $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $fact['proveedorcliente_idproveedorcliente'] . "'");
            //     $clientSelect = $proveedor->fetch_assoc();

            //     // $asd = $this->dbcm->fetch($proveedor);
            //     // $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            // }
    //------------------------------------------------------------------------------------------------
            $montoFacturas += $factura['monto'];
            $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans' WHERE idfactura = '{$factura['idfactura']}'");
    //--------------------------------------------------------------------------------------------------        
            // if($fact['cobrado'] == 2){ //COBRADO
            //     //CREAR RECIBO

            //     $consul = $this->dbc->query("SELECT * FROM cuentaspof WHERE idfactura='$fact[idfactura]'");
            //     $consul_grup = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idfactura='$fact[idfactura]'");
            //     if($consul->num_rows > 0 || $consul_grup->num_rows > 0){ //YA EXISTE RECIBO EN ESTA FACTURA 
            //         //SOLO SE ASIGNA TRANSACCION A ESTA FACTURA NADA MAS
            //     }else{
            //     $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
            //     VALUES('$nroRecibo','$fact[fecha]','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$fact[montofactura]','$fact[idfactura]','$idtrans','0',NULL)");
            //     }

            // }else{
            //     //NADA
            // }
     //-------------------------------------------------------------------------------------------------------------------       
            
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
            $res = array("success", "Se Registro Correctamente", "cobrofacturasaasientomodelo");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }
    // public function registrocobrarfactura($idfactura, $idtransaccion, $idcuenta, $fecha, $nrecibo, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa)
    public function registrocobrarfacturaGrupal($fecha,$persona,$ci,$monto,$idtransaccion,$idcaja_bancos,$idasientotipo,$idempresa,$idsucursal,$archivo,$data)
    {
    $caja_bancos = json_decode($idcaja_bancos, true);
        $facturas = json_decode($data, true);
    // echo json_encode(array("success","hola",$fecha,$nrecibo,$persona,$ci,$monto,$caja_bancos,$idasientotipo,$idempresa,$idsucursal,$archivo,$facturas));
//---------------------------------------------------------------------------------------

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $ide = $this->getidempresa($idempresa);
        $sucursal = $this->getidsucursal($idsucursal); 
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

// Obtener el número de transacción más reciente y sumar 1  emp
$nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$ide AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
$resultado12 = $nroTrans->fetch_assoc();
$nroTransaccion = $resultado12['codigotransaccion'] + 1;

        $res = "";
        $glosa = "Registro cobro '$nrecibo'";
        // $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";
        // $glosa2 = $this->dbc->real_escape_string($glosa);
        // $fecha2 = $this->dbc->real_escape_string($fecha);
        // $nrecibo2 = $this->dbc->real_escape_string($nrecibo);
        // $fecha2 = $this->dbc->real_escape_string($fecha);
        if ($idasientotipo != 0) {
            $glosa2 = $this->dbc->real_escape_string($glosa);
            $fecha2 = $this->dbc->real_escape_string($fecha);
            $nroTransaccion2 = $this->dbc->real_escape_string($nroTransaccion);

        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion2', '$fecha2', '1', '0', '$glosa2', '1','1', '$tipotransaccion', '$ide', '$sucursal', '$gestion')");
    
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
        } else {
            $idtrans = $idtransaccion;
        }

//-------------------------------------------------------------------------------------------------
        if(empty($archivo['name'])){
            $registropago = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
            VALUES(NULL,'$nrecibo','$fecha','varios clientes','$persona','$ci','$monto','0','$idtrans','0',NULL)");

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
             $registropago2 = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
            VALUES(NULL,'$nrecibo','$fecha','varios clientes','$persona','$ci','$monto','0','$idtrans','0','$unique_name')");

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
        foreach($caja_bancos as $cajaBanco){
            $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura)
            VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','$cajaBanco[idfactura]')");
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
    public function registrar_transaccion_recibo($idRecibo,$fecha,$monto,$glosa, $asiento,$empresa,$sucursal){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        $ide = $this->getidempresa($empresa);
        $sucursal = $this->getidsucursal($sucursal);
        $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso decode
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
        } else {
            $trans = $qq['idtransacciones'];
            $editar_recibo = $this->dbc->query("UPDATE cuentaspof SET transaccion = '$trans' WHERE idcuentaspof ='$idRecibo'");
        }
        if($insertrans == TRUE){
            $res = array("success", "Registro exitoso","registrar_transaccion_recibo");
        }else{
            $res = array("danger", "No se pudo registrar","registrar_transaccion_recibo");
        }
        echo json_encode($res);
    }

}