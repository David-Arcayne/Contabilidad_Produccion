<?php
// session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Alertas extends DB{
    
    public function getidgestion($md5){
        $registro=$this->dbc->query("select * from gestion where md5(idempresa)='$md5' and estado='2'");
        $qwe=$this->dbc->fetch($registro);
        return $qwe['idgestion'];

    }

    public function alerta_desconsolidacion($empresa) {
        $lista = [];

        // $gestion=$this->getidgestion($empresa);

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
            md5(idempresa) = '$empresa'
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
        // $gestion=$this->getidgestion($idempresa);
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
        ini_set('display_errors', 1); //,$nit,$cobro_pago,$cliente_proveedor,
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);

        $lista = [];
        // $gestion=$this->getidgestion($idempresa);
        // Consulta SQL
        $sql =$this->dbc->query("SELECT COUNT(*) AS cantidad FROM solicitud_anular_eliminar s
        INNER JOIN transacciones t ON t.idtransacciones = s.transacciones_idtransacciones
        WHERE md5(s.idempresa) = '$idempresa' AND s.estado_solicitud = '1'");
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
        // $gestion=$this->getidgestion($idempresa);

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

    // public function alerta_anular_eliminar_documentos($idempresa,$gestion) {
    //     ini_set('display_errors', 1); //,$nit,$cobro_pago,$cliente_proveedor,
    //         ini_set('display_startup_errors', 1);
    //         error_reporting(E_ALL);

    //     $lista = [];
    //     // $gestion=$this->getidgestion($idempresa);
    //     // Consulta SQL
    //     $sql =$this->dbc->query("SELECT COUNT(*) AS cantidad FROM solicitud_anular_eliminar_documento 
    //     WHERE md5(idempresa) = '$idempresa' AND estado_solicitud = '1' AND idgestion = '$gestion'");
    //     $resultado = $sql->fetch_assoc();       

    //     $res = array(
    //         "cantidad" => $resultado['cantidad']
    //     );
    //     // $res2= $contador;
    //     array_push($lista, $res);
    //     // Retornar la lista en formato JSON
    //     echo json_encode($lista);
    // }   
    public function alerta_anular_eliminar_documentos($idempresa) {
        ini_set('display_errors', 1); //,$nit,$cobro_pago,$cliente_proveedor,
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);

        $lista = [];
        // $gestion=$this->getidgestion($idempresa);
        // Consulta SQL
        $sql =$this->dbc->query("SELECT COUNT(*) AS cantidad FROM solicitud_anular_eliminar_documento 
        WHERE md5(idempresa) = '$idempresa' AND estado_solicitud = '1'");
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