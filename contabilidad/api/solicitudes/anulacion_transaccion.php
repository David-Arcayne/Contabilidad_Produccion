<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Anulacion_transaccion extends DB{

// public function registrardesconsolidar($idtransaccion,$motivo,$estado,$hora,$fecha,$idusuario,$idempresa){
    //     $res="";
    //     $usuario=$this->getidusuario($idusuario);
    //     $empresa=$this->getidempresa($idempresa);
    //     $codigo=date("Ymd").rand(100,1000);
    //     $registro=$this->dbc->query("INSERT INTO desconsolidar(idtransaccion,motivo,estado,hora,fecha,idusuario,idempresa,codigo)VALUES('$idtransaccion','$motivo','$estado','$hora','$fecha','$usuario','$empresa','$codigo')");
    //     if($registro===TRUE){
    //         $res=array("ok"=>"success");
    //     }else{
    //         $res=array("ok"=>"danger $idtransaccion,$motivo,$estado,$hora,$fecha,$idusuario");
    //     }
    //     echo json_encode($res);

    // }
    public function registrar_anular_eliminar_transaccion($idtransaccion,$motivo,$estado_opci,$estado_soli,$hora,$fecha,$usuario,$empresa)
    {
        // EN CUALQUIERA DE LOS CASOS SE PODRA SOLICITAR LA ANULACION
        //CASO I --> vacio SI,  consolidado NO 
        $idusuario=$this->getidusuario($usuario);
        $idempresa=$this->getidempresa($empresa);
        $res = "";
        $registro=$this->dbc->query("INSERT INTO solicitud_anular_eliminar(transacciones_idtransacciones,motivo,estado_opcion,estado_solicitud,hora,fecha,idusuario,idempresa)VALUES('$idtransaccion','$motivo','$estado_opci','$estado_soli','$hora','$fecha','$idusuario','$idempresa')");

        // $detallet = $this->dbc->query("SELECT COUNT(*) AS total FROM factura WHERE cuenta='$dato'");
        // $resultado = $detallet->fetch_assoc();
        // $totalRegistros = $resultado['total'];
        if($registro===TRUE){
            if($estado_opci == 1){ //estado_opcion= 1 anular
                // estado_trans = 2--> proceso de anulacion 
                $editar=$this->dbc->query("UPDATE transacciones SET estado = '2' WHERE idtransacciones = '$idtransaccion'");    
            }else{ //estado_opcion= 2 eliminar
                // estado_trans = 3--> proceso de eliminacion 
                $editar=$this->dbc->query("UPDATE transacciones SET estado = '3' WHERE idtransacciones = '$idtransaccion'");    

            }
            
            $res = array("success", "Anulacion exitosa","anular_transaccion");
        }else{
            $res = array("danger", "No se pudo anular");
        }
        
        echo json_encode($res);
    }

    public function cambiarEstado_anular_eliminar_transaccion($idsoli,$estado_opcion,$estado_solicitud,$fecha_proceso,$hora_proceso,$idusuario_admin){
        //actualizar esto:
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // echo json_encode(array($idtran_espera,$estado,$fecha,$hora));
        $usuario=$this->getidusuario($idusuario_admin);
                $res="";
                $soli_consu=$this->dbc->query("SELECT * FROM solicitud_anular_eliminar WHERE idsolicitud_anular_eliminar='$idsoli'");
                $solicitud = $soli_consu->fetch_assoc();
                $idtransaccion = $solicitud['transacciones_idtransacciones'];
            // si --> estado_opcion = 1 -->anular
            // si --> estado_solicitud = 2 --> aceptado
            if($estado_opcion == 1){ //ANULAR
                $update_soli=$this->dbc->query("UPDATE solicitud_anular_eliminar 
                    SET estado_solicitud = '$estado_solicitud',
                    hora_proceso = '$hora_proceso',
                    fecha_proceso = '$fecha_proceso',
                    idusuario_admin = '$idusuario_admin'
                        WHERE idsolicitud_anular_eliminar = '$idsoli'");   

                if($estado_solicitud == 2){ //ACEPTADO
                    $consulta_detalle=$this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion'");

                    $update_trans=$this->dbc->query("UPDATE transacciones SET estado = '4' 
                        WHERE idtransacciones = '$idtransaccion'");  

                    if ($consulta_detalle->num_rows > 0) {  

                        $update_det=$this->dbc->query("UPDATE detalletransaccion SET estado = '2' 
                        WHERE transacciones_idtransacciones = '$idtransaccion'");        
                    }else{
                    

                    }

                    $res = array("success", "Se Acepto la anulacion de la transaccion", "cambiarEstado_anular_eliminar_transaccion");

                }else{
                    //NO SE ANULARA NI CAMBIARA ESTADO DE TRANSACCION NI DETALLE TRANSACCION  
                    $res = array("danger", "Se Denego el permiso para anular", "cambiarEstado_anular_eliminar_transaccion");

                }
            }else{ //ELIMINAR estado_opcion = 2
                // 
                $update_soli=$this->dbc->query("UPDATE solicitud_anular_eliminar 
                    SET estado_solicitud = '$estado_solicitud',
                    hora_proceso = '$hora_proceso',
                    fecha_proceso = '$fecha_proceso',
                    idusuario_admin = '$idusuario_admin'
                        WHERE idsolicitud_anular_eliminar = '$idsoli'");   

                if($estado_solicitud == 2){ //ACEPTADO
                $consulta_detalle=$this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion'");

                if ($consulta_detalle->num_rows > 0) {  

                    $update_det=$this->dbc->query("DELETE FROM detalletransaccion 
                    WHERE transacciones_idtransacciones = '$idtransaccion'");        
                }else{
                

                }
                $update_factura=$this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '0' 
                        WHERE transacciones_idtransacciones = '$idtransaccion'");   

                $update_recibo=$this->dbc->query("UPDATE cuentaspof SET transaccion = '0' 
                        WHERE transaccion = '$idtransaccion'");  

                $update_recibo=$this->dbc->query("UPDATE cuentaspor SET transaccion = '0' 
                        WHERE transaccion = '$idtransaccion'");  
                
                $eliminado=$this->dbc->query("SELECT codigotransaccion,organizacion_idorganizacion FROM transacciones 
                WHERE idtransacciones = '$idtransaccion'");
    
                 $resElimi = $eliminado->fetch_assoc();
                 $codig = $resElimi['codigotransaccion'];
                 $idempresa = $resElimi['organizacion_idorganizacion'];

                $delete_transaccion=$this->dbc->query("DELETE FROM transacciones
                    WHERE idtransacciones = '$idtransaccion'");  
                // -----------------------------------------------------------------------------
                $transs=$this->dbc->query("SELECT * FROM transacciones 
                    WHERE codigotransaccion > '$codig' AND organizacion_idorganizacion = '$idempresa'");
                    $aux=0;
                    if ($transs->num_rows === 0){
                        // $res = array("success", "Se Elimino correctamente");
                    }else{
                while($qwe2=$this->dbc->fetch($transs)){
                    $codigo =  $qwe2['codigotransaccion'];
                    $codigo = $codigo - 1;
                    
                        $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$codigo' 
                        WHERE idtransacciones = '$qwe2[idtransacciones]'");
                    $aux++;
                    }
                    
                    // if ($descTRan ==TRUE){
                    //     $res = array("success", "Se Elimino correctamente");

                    // }else{
                    //     $res = array("danger", "Se elimino pero no se actualiza");

                    // }
                }
                // -------------------------------------------------------------------------------------

                $res = array("success", "Se Acepto la eliminacion de transaccion", "cambiarEstado_anular_eliminar_transaccion");

                }else{
                      //NO SE ANULARA NI CAMBIARA ESTADO DE TRANSACCION NI DETALLE TRANSACCION  
                      $res = array("danger", "Se Denego el permiso para eliminar transaccion", "cambiarEstado_anular_eliminar_transaccion");
                }
            }       

            echo json_encode($res);
        
        }
    public function listar_anular_eliminar_transaccion($idempresa) {
        $lista = [];
        
        // Consulta SQL
        $sql =$this->dbc->query("SELECT * FROM solicitud_anular_eliminar WHERE md5(idempresa) = '$idempresa' ORDER BY idsolicitud_anular_eliminar DESC");
    
            // Procesar los resultados
            while ($qwe = $this->dbc->fetch($sql)) {
               $usuario = $this->getusuario($qwe['idusuario']); // Asegúrate de que esta función retorne los campos esperados
                // $usuariob = isset($qwe['idusuariob']) ? $this->getusuario($qwe['idusuariob']) : null;
                /*" 
                    */
                    $transaccion =$this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$qwe[transacciones_idtransacciones]'");
                    $resu = $transaccion->fetch_assoc();
                $lista[] = [
                    "idsolicitud_anular_eliminar" => $qwe['idsolicitud_anular_eliminar'],
                    "codigotransaccion" => $resu['codigotransaccion'],
                    "hora" => $qwe['hora'],
                    "fecha" => $qwe['fecha'],
                    "hora_proceso" => $qwe['hora_proceso'],
                    "fecha_proceso" => $qwe['fecha_proceso'],
                    "estado_opcion" => $qwe['estado_opcion'],
                    "estado_solicitud" => $qwe['estado_solicitud'],
                    "idusuario" => $qwe['idusuario'],
                    "nombre" => $usuario['nombre'] ?? null,
                    "apellido" => $usuario['apellido'] ?? null,
                    "motivo" => $qwe['motivo']
                ];
            }
    
            
        
    
        // Retornar la lista en formato JSON
        echo json_encode($lista);
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
public function getidusuario($md5){
    $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
    $qwe=$this->dbrh->fetch($registro);
    return $qwe['idusuario'];

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