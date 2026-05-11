<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php"; ini_set

class Usuario_gestion extends DB{

    // public function listar_gestiones_principal($empresa, $usuario)
    // {
    //     $lista = [];
        
    //     $usuario=$this->getidusuario($usuario);

    //     $ide = $this->getidempresa($empresa);
    //     $registro = $this->dbc->query("SELECT idgestion,nombre,fechaini,fechafin,estado,fecha,formato_transaccion,idempresa 
    //     FROM gestion WHERE idempresa='$ide'");
    //     while ($qwe = $this->dbc->fetch($registro)) {

    //         $existe_trans = $this->dbc->query("SELECT * FROM transacciones WHERE idgestion='$qwe[0]' and organizacion_idorganizacion='$ide'");

    //         if($existe_trans->num_rows > 0){      
    //             $tiene_trans = "si";
    //         }else{
    //             $tiene_trans = "no";
    //         }

    //         $gestion_usuario = $this->dbc->query("SELECT * FROM gestion_por_usuario WHERE idgestion = ''");

    //         if($qwe['idgestion']){}

    //         $res = array("id" => $qwe[0], "nombre" => $qwe[1], "fechaini" => $qwe[2], "fechafin" => $qwe[3], "estado" => $qwe[4], "fecha" => $qwe[5],"formato_transaccion" => $qwe[6], "tiene_transaccion" => $tiene_trans);
    //         array_push($lista, $res);
    //     }
    //     echo json_encode($lista);
    // }

    public function asignar_gestiones_a_usuario($data){
    //  ini_set('display_errors', 1);
    //     ini_set('display_startup_errors', 1);
    //     error_reporting(E_ALL);
        $idempresa = $this->getidempresa($data['empresa']);
        // Decodificar el JSON a array asociativo 
        // $gestiones = json_decode($data['gestiones'], true);

        foreach($data['gestiones'] as $gestion){

            $vincu_gestion_usuario = $this->dbc->query("INSERT INTO gestion_por_usuario(idusuario,idgestion,estado,idempresa) VALUES ('$data[idusuario]','$gestion[idgestion]','1','$idempresa')");

        }

        if ($vincu_gestion_usuario === TRUE) {                                                                                                                                                                
            $res = array("success", "Registro exitoso","registroCaracteristicas");
        }else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
        
    }
    public function listar_solo_usuarios($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_usuario = $this->dbrh->query("SELECT * FROM usuario WHERE idempresa = '$idempresa'");
    
        while ($qwe = $this->dbc->fetch($get_usuario)) {
            $res = array(
                "idusuario" => $qwe['idusuario'],
                "nombre" => $qwe['nombre'],
                "idempresa" => $qwe['idempresa']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_gestion_activa($usuario) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
        $idusuario=$this->getidusuario($usuario);

        // Preparar la consulta
        $get_gestion = $this->dbc->query("SELECT * FROM gestion_por_usuario WHERE idusuario = '$idusuario' AND estado = '2'");
        $gst_x_usuario = $this->dbc->fetch($get_gestion);

        $gestion = $this->dbc->query("SELECT * FROM gestion WHERE idgestion = '$gst_x_usuario[idgestion]'");
        $gst = $this->dbc->fetch($gestion);

        $res = array(
            "idgestion" => $gst['idgestion'],
            "nombre" => $gst['nombre'],
            "fecha_ini" => $gst['fechaini'],
            "fecha_fin" => $gst['fechafin'],
            "estado" => $gst_x_usuario['estado'],
            "formato_transaccion" => $gst['formato_transaccion']

        );
       
        array_push($lista, $res);
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_gestiones_por_usuarios($idusuario) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_gestiones = $this->dbc->query("SELECT * FROM gestion_por_usuario WHERE idusuario = '$idusuario'");
    
        while ($qwe = $this->dbc->fetch($get_gestiones)) {

            $gesti = $this->dbc->query("SELECT * FROM gestion WHERE idgestion = '$qwe[idgestion]'");
            $gst = $this->dbc->fetch($gesti);
            $res = array(
                "idusuario" => $qwe['idusuario'],
                "idgestion" => $qwe['idgestion'],
                "estado" => $qwe['estado'],
                "nombre" => $gst['nombre'],
                "fecha_ini" => $gst['fechaini'],
                "fecha_fin" => $gst['fechafin'],
                "formato_transaccion" => $gst['formato_transaccion']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    
    public function listar_usuarios_por_gestion($idgestion) {
        //  ini_set('display_errors', 1); 
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_usuarios = $this->dbc->query("SELECT * FROM gestion_por_usuario WHERE idgestion = '$idgestion'");
    
        while ($qwe = $this->dbc->fetch($get_usuarios)) {

            $usuario = $this->dbrh->query("SELECT * FROM usuario WHERE idusuario = '$qwe[idusuario]'");
            $usr = $this->dbrh->fetch($usuario);
            $res = array(
                "idusuario" => $qwe['idusuario'],
                "idgestion" => $qwe['idgestion'],
                "nombre" => $usr['nombre']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function desvincular_gestiones_de_usuarios($idusuario,$idgestion){

                // Insertar el nuevo registro
                $eliminar_gest_usu = $this->dbc->query("DELETE FROM gestion_por_usuario WHERE idusuario = '$idusuario' AND  idgestion = '$idgestion'");
                if ($eliminar_gest_usu === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            
            echo json_encode($res);
    }

    public function activar_desactivar_gestiones($id, $estado, $usuario) // usuario como md5
    {
        // $ide = $this->getidempresa($empresa);
        $idusuario=$this->getidusuario($usuario);
        $res = "";
        
        // $get_gestiones = $this->dbc->query("SELECT * FROM gestion_por_usuario WHERE idusuario = '$idusuario'");
    
        // while ($qwe = $this->dbc->fetch($get_gestiones)) {
            $desactivar = $this->dbc->query("UPDATE gestion_por_usuario SET estado='1' WHERE idusuario = '$idusuario'");

        // }
 
        
        if ($desactivar === TRUE) {       
            $cambiar_estado = $this->dbc->query("UPDATE gestion_por_usuario SET estado='$estado' WHERE idgestion_por_usuario='$id'");                                                                                                                                             
            $res = array("success", "se actualizo exitosamente","activar_desactivar_gestiones");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function listar_gestiones_principal($usuario) {
        $lista = [];
        $idusuario=$this->getidusuario($usuario);
    
        // Preparar la consulta
        $get_gestiones = $this->dbc->query("SELECT * FROM gestion_por_usuario WHERE idusuario = '$idusuario'");
    
        while ($qwe = $this->dbc->fetch($get_gestiones)) {

            $gesti = $this->dbc->query("SELECT * FROM gestion WHERE idgestion = '$qwe[idgestion]'");
            $gst = $this->dbc->fetch($gesti);
            $res = array(
                "idgestion_por_usuario" => $qwe['idgestion_por_usuario'],
                "idusuario" => $qwe['idusuario'],
                "idgestion" => $qwe['idgestion'],
                "estado" => $qwe['estado'],
                "nombre" => $gst['nombre'],
                "fecha" => $gst['fecha'],
                "fecha_ini" => $gst['fechaini'],
                "fecha_fin" => $gst['fechafin'],
                "formato_transaccion" => $gst['formato_transaccion']
            );
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
    public function getidusuario($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['idusuario'];
    } 
}
?>
