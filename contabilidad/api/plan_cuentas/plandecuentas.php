<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Plandecuentas extends DB{
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
    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']);
        return $qwe['idgestion'];
    }
    public function registrar_vinculacion_cuentas_xcxp($idplandecuenta,$cobrar_pagar,$empresa){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $fecha=date("Y-m-d");
        $idempresa=$this->getidempresa($empresa);
        $res="";
        $registro=$this->dbc->query("INSERT INTO vinculacion_cuenta_xcxp(idplandecuenta,cobrar_pagar,fecha_registro,idempresa)VALUES('$idplandecuenta','$cobrar_pagar','$fecha','$idempresa')");
        if($registro===TRUE){
            $res = array("success", "Se Registro Correctamente", "registrar_vinculacion_cuentas_xcxp");
        }else{
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
        echo json_encode($res);

    }

    public function editar_vinculacion_cuenta_xcxp($id,$cobrar_pagar){
        $fecha=date("Y-m-d");
        // $empresa=$this->getidempresa($idempresa);
        $res="";
        $registro=$this->dbc->query("UPDATE vinculacion_cuenta_xcxp SET cobrar_pagar='$cobrar_pagar' WHERE idvinculacion_cuenta_xcxp='$id'");
        if($registro===TRUE){
            $res = array("success", "Se Edito Correctamente", "editar_vinculacion_cuenta_xcxp");
        }else{
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");

        }

        echo json_encode($res);

    }

    public function eliminar_vinculacion_cuenta_xcxp($id){
        $res="";
        $registro=$this->dbc->query("DELETE FROM vinculacion_cuenta_xcxp WHERE idvinculacion_cuenta_xcxp='$id'");
        if($registro===TRUE){
            $res = array("success", "Se Elimino Correctamente", "eliminar_vinculacion_cuenta_xcxp");
        }else{
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");

        }
        echo  json_encode($res);
    }

    public function listar_vinculacion_cuentas_xcxp($ide) {
        $lista = [];
        $registro = $this->dbc->query("SELECT idvinculacion_cuenta_xcxp, idplandecuenta, cobrar_pagar, fecha_registro FROM vinculacion_cuenta_xcxp  WHERE md5(idempresa)='$ide'");
    
        while ($row = $this->dbc->fetch($registro)) {
            // $impuesto = $this->getimpuesto($row['idimpuesto']);
            $plan = $this->getplandecuenta($row['idplandecuenta']);
            
            $lista[] = [
                "idvinculacion_cuenta_xcxp" => $row['idvinculacion_cuenta_xcxp'],
                "idplandecuenta"=>$row['idplandecuenta'],
                "numero" => $plan['numero'], //cod_cuenta
                "nombreplan" => $plan['nombreplan'],// cuenta
                "saldonormal" => $plan['saldonormal'], // tipo
                "cobrar_pagar"=>$row['cobrar_pagar'], // tipo_cuenta
                "fecha_registro" => $row['fecha_registro'],
            ];
        }
    
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }
    public function listar_cuentas_NoVinculadas($ide) {
        $idempresa = $this->getidempresa($ide);
        $lista = [];
        $registro = $this->dbc->query("SELECT p.*
                FROM plandecuenta p
                LEFT JOIN vinculacion_cuenta_xcxp vc ON p.idplandecuenta = vc.idplandecuenta
                WHERE vc.idplandecuenta IS NULL AND p.organizacion_idorganizacion='$idempresa' ORDER BY numero ASC;");
    // select idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,organizacion_idorganizacion,idp 
    // from plandecuenta where organizacion_idorganizacion='$ide' order by numero asc
        while ($row = $this->dbc->fetch($registro)) {
            // $impuesto = $this->getimpuesto($row['idimpuesto']);
            $plan = $this->getplandecuenta($row['idplandecuenta']);
            
            $lista[] = [
                "idplandecuenta"=>$row['idplandecuenta'],
                "numero" => $plan['numero'], //cod_cuenta
                "nombreplan" => $plan['nombreplan'],// cuenta
            ];
        }
    
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }
    public function getplandecuenta($idplan) {
        $registro = $this->dbc->query("SELECT numero, nombreplan, saldonormal FROM plandecuenta WHERE idplandecuenta='$idplan'");
        $qwe = $this->dbc->fetch($registro);
        return [
            "numero" => $qwe['numero'],
            "nombreplan" => $qwe['nombreplan'],
            "saldonormal" => $qwe['saldonormal']
        ];
    }
}