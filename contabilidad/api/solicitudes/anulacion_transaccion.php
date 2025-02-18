<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Insertar_transaccion extends DB{

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
    public function anular_transaccion($idtransaccion,$motivo,$estado_opci,$estado_soli,$hora,$fecha,$usuario,$empresa)
    {
        // EN CUALQUIERA DE LOS CASOS SE PODRA SOLICITAR LA ANULACION
        //CASO I --> vacio SI,  consolidado NO 
        $idusuario=$this->getidusuario($usuario);
        $idempresa=$this->getidempresa($empresa);
        $res = "";
        $registro=$this->dbc->query("INSERT INTO solicitud_anular_eliminar(transacciones_idtransacciones,motivo,estado_opcion,estado_solicitud,hora,fecha,idusuario,idempresa)VALUES('$idtransaccion','$motivo','$estado_opci','$estado_soli','$hora','$fecha','$idusuario','$idempresa')");

        $detallet = $this->dbc->query("SELECT COUNT(*) AS total FROM factura WHERE cuenta='$dato'");
        $resultado = $detallet->fetch_assoc();
        $totalRegistros = $resultado['total'];
        if($totalRegistros > 0){
            $res = array("danger", "No se pudo eliminar");
        }else{
            $registro = $this->dbc->query("DELETE FROM detalletransaccion WHERE iddetalletransaccion='$dato'");
            if ($registro === TRUE) {
                $res = array("success", "Se Elimino");
            } else {
                $res = array("danger", "No se pudo eliminar");
            }
        }
        
        echo json_encode($res);
    }
}