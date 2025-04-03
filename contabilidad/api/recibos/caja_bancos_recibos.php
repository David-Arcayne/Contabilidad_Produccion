<?php
require_once "../../db/db.php";
// require_once "./contabilidad/api/configuracion/empresa.php";
class caja_bancos_recibos extends DB{

    public function registrar_factura_recibo_cajaBancos($fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar, $espesificacion,$trans, $cliente, $empresa,   $cuenta,  $sucursal)
    {
        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
        
        $crearRecibo = $this->dbc->query("INSERT INTO cuentaspof(nrecibo,fecha,cliente,persona,ci,monto,idfactura,transaccion,cuenta,archivo)
                VALUES('$nroRecibo','$fact[fecha]','varios clientes','$clientSelect[nombre]','$clientSelect[nit]','$fact[montofactura]','$fact[idfactura]','$idtrans','0',NULL)");
                
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    public function listar_recibo_por_caja_bancos($idcaja_bancos) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT cp.idcuentaspof,cp.nrecibo,cp.fecha,cp.cliente,cp.idfactura,cp.idotras_cuentas,cp.archivo, dc.idcaja_bancos,dc.monto,dc.idfactura, t.codigotransaccion
    FROM detalle_caja_bancos_cobrar dc
    INNER JOIN cuentaspof cp ON cp.idcuentaspof = dc.idcuentaspof
    INNER JOIN transacciones t ON t.idtransacciones = cp.transaccion
    WHERE dc.idcaja_bancos = '$idcaja_bancos';");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            // $recibo = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof= '$qwe[idcuentaspof]'");
            //     $cp = $recibo->fetch_assoc();
            //     $cp['transaccion']

            if($qwe['idfactura'] != 0){
                //es cliente y se puede obtener del campo cliente directamente 
                // $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$qwe[cliente]'");
                $cl = $cliente->fetch_assoc();

                $factura = $this->dbc->query("SELECT * 
                FROM factura 
                WHERE idfactura = '$qwe[idfactura]'");

                $fact = $factura->fetch_assoc();

            }elseif($qwe['idotras_cuentas'] == 0){
                // hacer consulta a la tabla cuentascobrar_grupal y sacar de ahi factura
                $getTabla = $this->dbc->query("SELECT * 
                FROM cuentascobrar_grupal 
                WHERE idfactura = '$qwe[idfactura]'");
$cuentas_cobro_grupal = $getTabla->fetch_assoc();
// while ($ccg = $this->dbc->fetch($getTabla)) {
    $factura = $this->dbc->query("SELECT * 
                FROM factura 
                WHERE idfactura = '$cuentas_cobro_grupal[idfactura]'");
// }
                // $cuentas_cobro_grupal = $getTabla->fetch_assoc();

                

                $fact = $factura->fetch_assoc();
                
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$fact[proveedorcliente_idproveedorcliente]'");
                $cl = $cliente->fetch_assoc();
            }else{
                // hacer consulta a la tabla otras_cuentas y ahi estara id_cliente_proveedor

                $otras_cuentas = $this->dbc->query("SELECT * 
                FROM otras_cuentas
                WHERE idotras_cuentas = '$qwe[idotras_cuentas]'");

                $oc = $otras_cuentas->fetch_assoc();

                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$oc[id_cliente_proveedor]'");
                $cl = $cliente->fetch_assoc();
            }

            if($qwe['idotras_cuentas'] != 0){
                $aux_descripcion = "Cobro de factura N° '$oc[nro_otras_cuentas]' con fecha: '$oc[fecha]'";
                $res = array(
                    "fecha" => $qwe['fecha'],
                    "nrecibo" => $qwe['nrecibo'],
                    "codigotransaccion" => $qwe['codigotransaccion'],
                    "nombre_cliente" => $cl['nombre'],
                    //descripcion saldra de la factura o otras cuentas 
                    "descripcion" => $aux_descripcion,
                    "ingreso" => $qwe['monto']

                );
            }else{
                $aux_descripcion = "Cobro de factura N° '$fact[nfactura]' con fecha: '$fact[fecha]'";
                $res = array(
                    "fecha" => $qwe['fecha'],
                    "nrecibo" => $qwe['nrecibo'],
                    "codigotransaccion" => $qwe['codigotransaccion'],
                    "nombre_cliente" => $cl['nombre'],
                    //descripcion saldra de la factura o otras cuentas 
                    "descripcion" => $aux_descripcion,
                    "ingreso" => $qwe['monto']
                );
            }
          
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

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

}
?>