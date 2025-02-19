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
    public function cobrofacturasaasientomodelo($data) {
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
     $nroRec = $this->dbc->query("SELECT count(*) AS cantidadRec FROM cuentaspof cp INNER JOIN transacciones t ON t.idtransacciones=cp.transaccion WHERE t.organizacion_idorganizacion='$idempresa' AND idgestion = '$gestion'");
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
            $selectFact = $this->dbc->query("SELECT * FROM factura WHERE idfactura='{$factura['idfactura']}' AND idorganizacion='$idempresa';");
            $fact = $selectFact->fetch_assoc();
            // proveedorcliente_idproveedorcliente
            if ($fact['clasefactura'] == 2) { //POR COBRAR
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
            if($fact['cobrado'] == 2){ //COBRADO
                //CREAR RECIBO

                $consul = $this->dbc->query("SELECT * FROM cuentaspof WHERE idfactura='$fact[idfactura]'");
                $consul_grup = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idfactura='$fact[idfactura]'");
                if($consul->num_rows > 0 || $consul_grup->num_rows > 0){ //YA EXISTE RECIBO EN ESTA FACTURA 
                    //SOLO SE ASIGNA TRANSACCION A ESTA FACTURA NADA MAS
                }else{
                $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
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
            $res = array("success", "Se Registro Correctamente", "cobrofacturasaasientomodelo");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }

    // public function registrocobrarfactura($idfactura, $idtransaccion, $idcuenta, $fecha, $nrecibo, $persona, $ci, $monto, $asiento, $idcliente, $sucursal, $empresa)
    public function registrocobrarfacturaGrupal($fecha,$nrecibo,$persona,$ci,$monto,$idasientotipo,$idempresa,$idsucursal,$archivo,$data)
    {
    
        $facturas = json_decode($data, true);
        //  echo json_encode(array("success","hola",$fecha,$nrecibo,$persona,$ci,$monto,$idasientotipo,$idempresa,$idsucursal,$archivo,$facturas));
//---------------------------------------------------------------------------------------

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $ide = $this->getidempresa($idempresa);
        $sucursal = $this->getidsucursal($idsucursal); 
        $gestion = $this->getgestionactualid($ide);
        
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
            $trans = $resultado12['idtransacciones'];
        }

//-------------------------------------------------------------------------------------------------
        if(empty($archivo['name'])){
            $registropago = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
            VALUES(NULL,'$nrecibo','$fecha','varios clientes','$persona','$ci','$monto','0','$idtrans','0',NULL)");

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

        $idcuentasPof = $this->dbc->insert_id;
        foreach($facturas as $factura){

            $cobras = $this->dbc->query("SELECT SUM(monto) AS montoSuma FROM cuentaspof WHERE idfactura='$factura[idfactura]'"); //173
            // $asd = $this->dbc->fetch($cobras);
            $asd = $cobras->fetch_assoc();
            if($asd['montoSuma'] == NULL){
                $registrarTabla = $this->dbc->query("INSERT INTO cuentascobrar_grupal(idcuentaspof,idfactura,monto)VALUES('$idcuentasPof','$factura[idfactura]','$factura[monto]')");
            }else{
                $montoSuma = $asd['montoSuma'];
                $montoCobrado = $factura['monto'] - $montoSuma;
                $registrarTabla = $this->dbc->query("INSERT INTO cuentascobrar_grupal(idcuentaspof,idfactura,monto)VALUES('$idcuentasPof','$factura[idfactura]','$montoCobrado')");
            }
            // $montoFacturas += $factura['monto'];
            // $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans' WHERE idfactura = '{$factura['idfactura']}'");
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
}