<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Alertas extends DB{
    
public function alerta_desconsolidacion($empresa) {
        $lista = [];

        // Consulta SQL
        $sql =$this->dbc->query("SELECT 
                d.iddesconsolidar, 
                d.idtransaccion, 
                MIN(t.codigotransaccion) AS desde_primero,
                MAX(t.codigotransaccion) AS desde_ultimo,
                d.motivo, 
                d.estado, 
                d.hora, 
                d.fecha, 
                d.idusuario, 
                d.codigo,
                d.horaproceso,
                d.fechaproceso, 
                COUNT(*) AS cantidad
            FROM 
                desconsolidar AS d
            INNER JOIN 
                transacciones AS t 
                ON t.idtransacciones = d.idtransaccion
            WHERE 
                md5(d.idempresa) = '$empresa'
            GROUP BY 
                d.codigo
            ORDER BY 
                d.estado = '0' DESC,
                d.fecha DESC,
                d.hora DESC;
        ");
    
        $contador = 0;
            // Procesar los resultados
            while ($qwe = $this->dbc->fetch($sql)) {
                if($qwe['estado'] == '0'){
                    $contador = $contador + 1;
                }else{

                }

            }
            $res = array(
                "cantidad" => $contador
            );
            // $res2= $contador;
            array_push($lista, $res);
    
        // Retornar la lista en formato JSON
        echo json_encode($lista);
    }

    public function alerta_transaccionEn_espera($idempresa) {
        $lista = [];
        
        // Consulta SQL
        $sql =$this->dbc->query("SELECT COUNT(*) AS cantidad FROM transaccionEn_espera WHERE md5(idempresa) = '$idempresa' AND estado = '0'");
        $resultado = $sql->fetch_assoc();       
    
        $res = array(
            "cantidad" => $resultado['cantidad']
        );
        // $res2= $contador;
        array_push($lista, $res);
        // Retornar la lista en formato JSON
        echo json_encode($lista);
}   
public function alerta_anular_eliminar_transaccion($idempresa) {
    $lista = [];
    
    // Consulta SQL
    $sql =$this->dbc->query("SELECT COUNT(*) AS cantidad FROM solicitud_anular_eliminar WHERE md5(idempresa) = '$idempresa' AND estado_solicitud = '1'");
    $resultado = $sql->fetch_assoc();       

    $res = array(
        "cantidad" => $resultado['cantidad']
    );
    // $res2= $contador;
    array_push($lista, $res);
    // Retornar la lista en formato JSON
    echo json_encode($lista);
}   

public function alerta_transacciones_comercial($idempresa) {
    $lista = [];
    
    // Consulta SQL
    $sql =$this->dbc->query("SELECT COUNT(*) AS cantidad FROM transacciones WHERE md5(organizacion_idorganizacion) = '$idempresa' AND estado = '6'");
    $resultado = $sql->fetch_assoc();       

    $res = array(
        "cantidad" => $resultado['cantidad']
    );

    // $res2= $contador;
    array_push($lista, $res);
    // Retornar la lista en formato JSON
    echo json_encode($lista);
}   

    public function getusuario($id) {
        $registro = $this->dbrh->query("
            SELECT u.nombre AS usuario_nombre, t.nombre AS trabajador_nombre, t.apellido, t.ci 
            FROM usuario AS u 
            INNER JOIN trabajador AS t ON t.idtrabajador = u.trabajador_idtrabajador
            WHERE u.idusuario = '$id'
        ");
        $qwe = $this->dbrh->fetch($registro);
    
        return [
            "usuario" => $qwe['usuario_nombre'],
            "nombre" => $qwe['trabajador_nombre'],
            "apellido" => $qwe['apellido'],
            "ci" => $qwe['ci']
        ];
    }
}