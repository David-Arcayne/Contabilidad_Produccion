<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Transacciones_facturas extends DB{
public function registrar_transaccionEn_espera($idtransaccion,$motivo,$estado,$hora,$fecha,$idusuario,$idempresa){
        $res="";
        $usuario=$this->getidusuario($idusuario);
        $empresa=$this->getidempresa($idempresa);
        $codigo=date("Ymd").rand(100,1000);
        $registro=$this->dbc->query("INSERT INTO desconsolidar(idtransaccion,motivo,estado,hora,fecha,idusuario,idempresa,codigo)VALUES('$idtransaccion','$motivo','$estado','$hora','$fecha','$usuario','$empresa','$codigo')");
        if($registro===TRUE){
            $res=array("ok"=>"success");
        }else{
            $res=array("ok"=>"danger $idtransaccion,$motivo,$estado,$hora,$fecha,$idusuario");
        }
        echo json_encode($res);

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
}