<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Filtrado_facturas extends DB{
    public function listar_facturas_cobros_sin_transaccion($cobrado,$idcaja_bancos,$empresa) {
      // $idempresa = $this->getidempresa($empresa);
                // echo json_encode(array($cobrado,$idcaja_bancos,$empresa));

        $lista = [];
        $array_idfacturas = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // select * from factura where idorganizacion = 50 and cobrado != 0 and transacciones_idtransacciones = 0
        
        if($cobrado == 1){ //POR COBRAR
            // $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos = '$idcaja_bancos' AND idfactura !=0"); //POR COBRAR
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$idcaja_bancos') AND idfactura !=0"); //POR COBRAR

            while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
                $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
                $factu = $factura_aux->fetch_assoc();
                if($factu['transacciones_idtransacciones'] == 0 && $factu['cobrado'] == 1 ){
                    array_push($array_idfacturas, $factura_cajas['idfactura']);
                }else{

                }
                // array_push($lista, $factura_cajas['idfactura']);
            }

            $getPedido_complemento = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($array_idfacturas)"); //POR COBRAR

            $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 1 AND transacciones_idtransacciones = 0"); //POR COBRAR

        }elseif($cobrado == 2){ // COBRADO

            $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 2 AND transacciones_idtransacciones = 0"); //COBRADO

        }else{ //TODOS
            $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado != 0 AND transacciones_idtransacciones = 0"); //TODOS

        }
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array("id" => $qwe[0], 
            "fecha" => $qwe[1],
            "nfactura" => $qwe[2],
            "nautorizacion" => $qwe[3],
            "codigocontrol" => $qwe[4],
            "montofactura" => $qwe[5],
            "tasacero" => $qwe[6],
            "export" => $qwe[7],
            "npoliza" => $qwe[8],
            "ice" => $qwe[9],
            "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12],
            "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15],
            "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18],
            "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],
            "por_concepto_de" => $qwe['por_concepto_de']);

            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    } 

}