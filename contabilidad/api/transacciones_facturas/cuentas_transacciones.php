<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Cuentas_transacciones extends DB{
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

    public function listar_facturas_asignado_cuentas($idcuenta)
    {
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM factura WHERE cuenta = '$idcuenta'");
        while ($qwe = $this->dbc->fetch($registro)) {
               if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($cliente);

                $res = array("id" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "cobrado" => $qwe['cobrado'], "pagado" => $qwe['pagado'],"por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            } else {
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($proveedor);

                $res = array("id" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "cobrado" => $qwe['cobrado'], "pagado" => $qwe['pagado'],"por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            }
                    array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function listar_facturas_cobro_pago($idcuenta,$empresa)
    {
        $idempresa = $this->getidempresa($empresa); 
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM factura WHERE cuenta = '$idcuenta' LIMIT 1");
        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion ='$idcuenta'");
        $dt = $this->dbc->fetch($detalle_trans);
        if($registro->num_rows > 0){
            $factu = $this->dbc->fetch($registro);
            //preguntar si factura es de pago y cobro
            if($factu['clasefactura'] == 2){
                // es cobro
                $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa' AND clasefactura='2' AND cuenta ='0' AND transacciones_idtransacciones IN(0,$dt[transacciones_idtransacciones])");

            }else{
                // es pago
                $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa' AND clasefactura='1' AND cuenta ='0' AND transacciones_idtransacciones IN(0,$dt[transacciones_idtransacciones])");
            }
        }else{
            //listara todas las facturas de cobro y pago porque no tiene ninguna factura todavia dentro
            $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa' AND cuenta ='0' AND transacciones_idtransacciones IN(0,$dt[transacciones_idtransacciones])");
        }
        while ($qwe = $this->dbc->fetch($factu_clase)) {
               if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($cliente);

                $res = array("id" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "cobrado_pagado" => "cobro","por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            } else {
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($proveedor);

                $res = array("id" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "cobrado_pagado" => "pago","por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            }
                    array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function listar_comprobantes_cobro_pago($idcuenta,$empresa)
    {
        $idempresa = $this->getidempresa($empresa); 
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        // $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE cuenta = '$idcuenta' LIMIT 1");
       
        // if($registro->num_rows > 0){
            // $comprob = $this->dbc->fetch($registro);
            
                // es cobro
                $factu_clase = $this->dbc->query("SELECT * FROM cuentaspof 
                  WHERE cuenta ='0'");

        // }
        // else{
        //     //listara todas las facturas de cobro y pago porque no tiene ninguna factura todavia dentro
        //     $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa' AND cuenta ='0'");
        // }
        while ($qwe = $this->dbc->fetch($factu_clase)) {
            //    if ($qwe['clasefactura'] == 2) {
            //     $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
            //     $asd = $this->dbcm->fetch($cliente);

            //     $res = array("id" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "cobrado" => $qwe['cobrado'], "pagado" => $qwe['pagado'],"por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            // } else {
            //     $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
            //     $asd = $this->dbcm->fetch($proveedor);

            //     $res = array("id" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "cobrado" => $qwe['cobrado'], "pagado" => $qwe['pagado'],"por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            // }
                $res = array("id" => $qwe['idcuentaspof'], "fecha" => $qwe['fecha'], "nrecibo" => $qwe['nrecibo'], "monto" => $qwe['monto']);

                    array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function listar_comprobantes_asignado_cuentas($idcuenta)
    {
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $comprobante_cobro = $this->dbc->query("SELECT * FROM cuentaspof WHERE cuenta = '$idcuenta'");
        $comprobante_pago = $this->dbc->query("SELECT * FROM cuentaspor WHERE cuenta = '$idcuenta'");
        $comprobante_cobro_pago = $this->dbc->query("SELECT * FROM cuentaspof AS idcuenta WHERE cuenta = '$idcuenta'
                                                    UNION
                                                    SELECT * FROM cuentaspor AS idcuenta WHERE cuenta = '$idcuenta'
                                                ");

        if($comprobante_cobro->num_rows > 0){
            while ($qwe = $this->dbc->fetch($comprobante_cobro)) {
               
                $res = array("id" => $qwe['idcuentaspof'], "fecha" => $qwe['fecha'], "nrecibo" => $qwe['nrecibo'], "monto" => $qwe['monto']);   

                array_push($lista, $res);
            }
        }elseif($comprobante_pago->num_rows > 0){
            while ($qwe = $this->dbc->fetch($comprobante_pago)) {
               
                $res = array("id" => $qwe['idcuentaspor'], "fecha" => $qwe['fecha'], "nrecibo" => $qwe['nrecibo'], "monto" => $qwe['monto']);   
                         
                array_push($lista, $res);
            }
        }else{
            while ($qwe = $this->dbc->fetch($comprobante_cobro_pago)) {
               
                $res = array("id" => $qwe['idcuenta'], "fecha" => $qwe['fecha'], "nrecibo" => $qwe['nrecibo'], "monto" => $qwe['monto']);   
                         
                array_push($lista, $res);
            }
        }
    
        echo json_encode($lista);
    }
}