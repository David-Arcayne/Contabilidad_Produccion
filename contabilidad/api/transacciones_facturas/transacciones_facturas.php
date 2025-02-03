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
    
        // Obtener el tipo de transacción
        $idAsientoTipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='{$data['idasientotipo']}' AND idorganizacion='$idempresa';");
        $asiento = $idAsientoTipo->fetch_assoc();  // Cambiado $nroTrans->fetch_assoc() a $idAsientoTipo->fetch_assoc()
        $tipotransaccion = $asiento['tipo'];
    
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion', '{$data['fecha']}', '1', '0', '{$data['glosa']}', '1', '$tipotransaccion', '$idempresa', '$idsucursal', '$gestion')");
    
        // Obtener el ID del registro recién insertado
        $idtrans = $this->dbc->insert_id;
    
        // Editar las facturas seleccionadas
        $montoFacturas = 0;
        foreach ($data['facturas'] as $factura) {
            $montoFacturas += $factura['monto'];
            $updatetranscodigo = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '$idtrans' WHERE idfactura = '{$factura['idfactura']}'");
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
    public function registrocobrarfacturaGrupal($data)
    {
        // echo json_encode($data);

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $ide = $this->getidempresa($data['idempresa']);
        $sucursal = $this->getidsucursal($data['idsucursal']); 
        $gestion = $this->getgestionactualid($ide);
        
// Obtener el número de transacción más reciente y sumar 1
$nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$ide AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
$resultado12 = $nroTrans->fetch_assoc();
$nroTransaccion = $resultado12['codigotransaccion'] + 1;

        $res = "";
        $glosa = "Registro cobro $data[nrecibo]";
        // $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";
        if ($data['idasientotipo'] != 0) {
    
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) VALUES ('$nroTransaccion', '{$data['fecha']}', '1', '0', '$glosa', '1', '$tipotransaccion', '$ide', '$sucursal', '$gestion')");
    
        // Obtener el ID del registro recién insertado
        $idtrans = $this->dbc->insert_id;
            //$detallepago

            $debe = 0;
            $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$data[idasientotipo]'");
            $orden = 1;
            while ($qwe = $this->dbc->fetch($tasiento)) {
                $pcuenta = $qwe['idcuenta'];
                if ($qwe['tipo'] == "DEBE") {
                    $debe = $data['monto'] * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $data['monto'] * ($qwe['porciento'] / 100);
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

        //registrar pago, preguntar guardar la anterior transaccion o la nueva
        $registropago = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta)VALUES('$data[nrecibo]','$data[fecha]','varios clientes','$data[persona]','$data[ci]','$data[monto]','0','$idtrans','0')");
        // Obtener el ID del registro recién insertado

        $idcuentasPof = $this->dbc->insert_id;
        foreach($data['facturas'] as $factura){

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
       
        if ($registropago === TRUE) {
            $res = array("success", "Registro Realizado", "registrocobrarfacturaGrupal");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        echo json_encode($res);
    }
}