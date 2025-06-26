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

        $consult=$this->dbc->query("SELECT COUNT(*) AS total1 FROM vinculacion_cuenta_xcxp WHERE idempresa='$idempresa' AND cobrar_pagar = '$cobrar_pagar'");
        $resultado = $consult->fetch_assoc();
        $total_1 = $resultado['total1'];

        // $consult2=$this->dbc->query("SELECT COUNT(*) AS total2 FROM vinculacion_cuenta_xcxp WHERE idempresa='$idempresa' AND cobrar_pagar = 2");
        // $resultado2 = $consult2->fetch_assoc();
        // $total_2 = $resultado2['total2'];

        $res="";
        if($total_1 > 0){
            //error ya hay una vinculacion con tipo 1 o 2 en esta empresa
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }else{
            $registro=$this->dbc->query("INSERT INTO vinculacion_cuenta_xcxp(idplandecuenta,cobrar_pagar,fecha_registro,idempresa)VALUES('$idplandecuenta','$cobrar_pagar','$fecha','$idempresa')");
            if($registro===TRUE){
                $res = array("success", "Se Registro Correctamente", "registrar_vinculacion_cuentas_xcxp");
            }else{
                $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
            }
        }

        echo json_encode($res);

    }

    public function editar_vinculacion_cuenta_xcxp($id,$cuenta){
        $fecha=date("Y-m-d");
        // $empresa=$this->getidempresa($idempresa);
        $res="";
        $registro=$this->dbc->query("UPDATE vinculacion_cuenta_xcxp SET idplandecuenta='$cuenta' WHERE idvinculacion_cuenta_xcxp='$id'");
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
    public function registrar_caja_bancos($codigo,$tipo_cuenta,$glosa,$idplandecuenta,$empresa){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        // $fecha=date("Y-m-d");
       
        // echo json_encode(array($codigo,$tipo_cuenta,$glosa,$idplandecuenta,$empresa));
        $idempresa=$this->getidempresa($empresa);

        // $consult=$this->dbc->query("SELECT COUNT(*) AS total1 FROM vinculacion_cuenta_xcxp WHERE idempresa='$idempresa' AND cobrar_pagar = '$cobrar_pagar'");
        // $resultado = $consult->fetch_assoc();
        // $total_1 = $resultado['total1'];

        $res="";
        if(0 > 0){
            //error ya hay una vinculacion con tipo 1 o 2 en esta empresa
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }else{
            $registro=$this->dbc->query("INSERT INTO caja_bancos(codigo,tipo_cuenta,glosa,idplandecuenta,idempresa)VALUES('$codigo','$tipo_cuenta','$glosa','$idplandecuenta','$idempresa')");
            if($registro===TRUE){
                $res = array("success", "Se Registro Correctamente", "registrar_caja_bancos");
            }else{
                $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
            }
        }

        echo json_encode($res);

    }

    public function editar_caja_bancos($id,$codigo,$tipo_cuenta,$glosa,$idplandecuenta){
        $fecha=date("Y-m-d");
        // $empresa=$this->getidempresa($idempresa);
        $res="";
        $registro=$this->dbc->query("UPDATE caja_bancos 
        SET codigo = '$codigo',tipo_cuenta = '$tipo_cuenta',glosa = '$glosa',idplandecuenta='$idplandecuenta' 
        WHERE idcaja_bancos='$id'");
        if($registro===TRUE){
            $res = array("success", "Se Edito Correctamente", "editar_caja_bancos");
        }else{
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");

        }

        echo json_encode($res);

    }

    public function eliminar_caja_bancos($id){
        $res="";
        // restringir q no exista un registro en cuentaspof y cuentaspor
        $registro=$this->dbc->query("DELETE FROM caja_bancos WHERE idcaja_bancos='$id'");
        if($registro===TRUE){
            $res = array("success", "Se Elimino Correctamente", "eliminar_caja_bancos");
        }else{
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");

        }
        echo  json_encode($res);
    }

    public function listar_caja_bancos($empresa)
    {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $listado1 = $this->dbc->query("SELECT * FROM caja_bancos WHERE idempresa ='$idempresa'");
        while ($qwe = $this->dbc->fetch($listado1)) {
            $listado2 = $this->dbc->query("SELECT idplandecuenta,numero,nombreplan,saldonormal FROM plandecuenta WHERE idplandecuenta ='$qwe[idplandecuenta]'");
            $aaa = $listado2->fetch_assoc();
            // $idtransaccion = $aaa['transacciones_idtransacciones'];
            $res = array("idcaja_bancos" => $qwe['idcaja_bancos'], "codigo" => $qwe['codigo'], "tipo_cuenta" => $qwe['tipo_cuenta'], "glosa" => $qwe['glosa'],"idplandecuenta" => $aaa['idplandecuenta'],"codigo_cuenta" => $aaa['numero'],"cuenta" => $aaa['nombreplan'],"tipo" => $aaa['saldonormal']);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function listar_caja_bancos_por_usuario($empresa,$usuario)
    {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $idusuario = $this->getidusuario($usuario);
        // $registro3=$this->dbrh->query("SELECT * FROM usuario WHERE trabajador_idtrabajador = '$bb[idtrabajador]'");

    $trabajador=$this->dbrh->query("SELECT u.nombre AS usuario_nombre, t.nombre AS nombre_trabajador,t.idtrabajador, t.apellido, t.ci 
            FROM usuario AS u 
            INNER JOIN trabajador AS t ON t.idtrabajador = u.trabajador_idtrabajador
            WHERE u.idusuario = '$idusuario'");
            $traba = $trabajador->fetch_assoc();
        $usuario_caja = $this->dbc->query("SELECT * FROM caja_banco_usuarios WHERE idtrabajador ='$traba[idtrabajador]' AND idempresa = '$idempresa'");

        // $listado1 = $this->dbc->query("SELECT * FROM caja_bancos WHERE idempresa ='$idempresa'");

        while ($qwe = $this->dbc->fetch($usuario_caja)) {

            $listado2 = $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos ='$qwe[idcaja_bancos]'");
            $aaa = $listado2->fetch_assoc();
            // $idtransaccion = $aaa['transacciones_idtransacciones'];
            $res = array("idcaja_bancos" => $aaa['idcaja_bancos'], "codigo" => $aaa['codigo'], "tipo_cuenta" => $aaa['tipo_cuenta'], "glosa" => $aaa['glosa']);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function getidusuario($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['idusuario'];
    }  
}