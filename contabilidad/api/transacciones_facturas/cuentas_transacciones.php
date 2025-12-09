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
        if($registro->num_rows > 0){
            $factu = $this->dbcm->fetch($registro);
            //preguntar si factura es de pago y cobro
            if($factu['clasefactura'] == 2){
                // es cobro
                $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa' AND clasefactura='2'");

            }else{
                // es pago
                $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa' AND clasefactura='1'");
            }
        }else{
            //listara todas las facturas de cobro y pago porque no tiene ninguna factura todavia dentro
            $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa'");
        }
        while ($qwe = $this->dbc->fetch($factu_clase)) {
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

}