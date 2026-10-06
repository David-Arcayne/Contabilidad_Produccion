<?php
// session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Cobros_comercial extends DB{
    public function listar_cobro_comercial_vinculado_transaccion($idtransaccion) // VENTAS
    {
        $lista = [];
        $res = "";

        // COBROS DE VENTA COMERCIALES CON FACTURA
        $trans_cobro = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE idtransaccion = '$idtransaccion' 
        AND registro_desde ='cobro_venta_comercial'");

        while ($qwe = $this->dbc->fetch($trans_cobro)) {
            $cobro = $this->dbcm->query("SELECT * FROM detalle_cobro dc
            INNER JOIN estado_cobro ec ON ec.id_estado_cobro = dc.estado_cobro_id_estado_cobro
            INNER JOIN venta v ON v.id_venta = ec.venta_id_venta
            INNER JOIN cliente c ON c.id_cliente = v.cliente_id_cliente1
            WHERE iddetalle_cobro= '$qwe[id_documento]'");

            // $cobro = $this->dbcm->query("SELECT * FROM detalle_cobro WHERE iddetalle_cobro= '$qwe[id_documento]'");
            $asd = $this->dbcm->fetch($cobro);

            // $estado_cobro = $this->dbcm->query("SELECT * FROM estado_cobro WHERE id_estado_cobro= '$asd[estado_cobro_id_estado_cobro]'");
            // $ec = $this->dbcm->fetch($estado_cobro);

            // $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$asd[cliente_id_cliente1]'");
            // $cl = $this->dbcm->fetch($cliente);

            
            $res = array(
                "tipo" => $qwe['registro_desde'],
                "id" => $asd['iddetalle_cobro'],
                "fecha" => $asd['fecha_actual'],
                "nro_documento" => $asd['num_documento'],
                "monto" => $asd['monto'],
                // "contado_credito" => $contado_credito,
                "cliente_proveedor" => $asd['nombre']
            );
            $lista[] = $res;
        }

        // COBROS DE VENTA COMERCIALES SIN FACTURA
        $trans_cobro = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE idtransaccion = '$idtransaccion' 
        AND registro_desde ='cobro_venta_sin_factura_comercial'");

        while ($qwe = $this->dbc->fetch($trans_cobro)) {
            $cobro = $this->dbcm->query("SELECT * FROM detalle_cobro dc
            INNER JOIN estado_cobro ec ON ec.id_estado_cobro = dc.estado_cobro_id_estado_cobro
            INNER JOIN cotizacion c ON c.id_cotizacion = ec.venta_id_venta
            INNER JOIN cliente c ON c.id_cliente = v.cliente_id_cliente1
            WHERE iddetalle_cobro= '$qwe[id_documento]'");

            // $cobro = $this->dbcm->query("SELECT * FROM detalle_cobro WHERE iddetalle_cobro= '$qwe[id_documento]'");
            $asd = $this->dbcm->fetch($cobro);

            // $estado_cobro = $this->dbcm->query("SELECT * FROM estado_cobro WHERE id_estado_cobro= '$asd[estado_cobro_id_estado_cobro]'");
            // $ec = $this->dbcm->fetch($estado_cobro);

            // $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$asd[cliente_id_cliente1]'");
            // $cl = $this->dbcm->fetch($cliente);

            
            $res = array(
                "tipo" => $qwe['registro_desde'],
                "id" => $asd['iddetalle_cobro'],
                "fecha" => $asd['fecha_actual'],
                "nro_documento" => $asd['num_documento'],
                "monto" => $asd['monto'],
                // "contado_credito" => $contado_credito,
                "cliente_proveedor" => $asd['nombre']
            );
            $lista[] = $res;
        }
      
        // // ORDENAR POR FECHA
        // usort($lista, function($a, $b) {
        //     return strtotime($a['fecha']) - strtotime($b['fecha']);
        // });

        echo json_encode($lista);
    }
}