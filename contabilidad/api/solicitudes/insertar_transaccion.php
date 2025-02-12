<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Insertar_transaccion extends DB{
    // $codigo, $fecha, $tipocambio, $tipotransaccion, $glosa, $empresa, $sucursal
public function registrar_transaccionEn_espera($idtransaccion,$estado,$hora,$fecha,$idusuario,$codigo,$tipocambio, $tipotransaccion, $glosa,$idempresa,$sucursal){
        $res="";
        $usuario=$this->getidusuario($idusuario);
        $idsucursal = $this->getidsucursal($sucursal);
        $empresa=$this->getidempresa($idempresa);
        // $codigo=date("Ymd").rand(100,1000);
// idusuario codigotransaccion tipodecambio ndocumento glosa consolidar tipotransaccion_idtipotransaccion sucursal idempresa idgestion
        $registro=$this->dbc->query("INSERT INTO transaccionEn_espera(transacciones_idtransacciones,estado,hora,fecha,idusuario,codigotransaccion, tipodecambio, ndocumento, glosa, consolidar, tipotransaccion_idtipotransaccion, sucursal,idempresa,idgestion)
        VALUES('$idtransaccion','$estado','$hora','$fecha','$usuario','$codigo','$tipocambio','0', '$glosa','1', '$tipotransaccion','$idsucursal','$empresa','$codigo')");
        if($registro===TRUE){
            $res = array("success", "Se Registro Correctamente", "registrar_transaccionEn_espera");
        }else{
            $res = array("danger", "Se Registro Correctamente");
        }
        echo json_encode($res);

    }
    public function cambiarestadotransaccionEn_espera($idtran_espera,$estado,$fecha,$hora){
        //actualizar esto:
        
                $res="";
                // $reg_trans=$this->dbc->query("SELECT * FROM transaccionEn_espera WHERE idtransaccionEn_espera='$idtran_espera'");

                $registro=$this->dbc->query("UPDATE transaccionEn_espera SET estado='$estado',fecha_proceso='$fecha',hora_proceso='$hora' WHERE idtransaccionEn_espera='$idtran_espera'");
                //consolidar es 2 y desconsolidar es 1
                if($estado==1){//aceptado
                    $reg_trans=$this->dbc->query("SELECT * FROM transaccionEn_espera WHERE idtransaccionEn_espera='$idtran_espera'");
                    $resultado = $reg_trans->fetch_assoc();
                    $cod = $resultado['codigotransaccion'];
                    $idempresa = $resultado['idempresa'];
                    $transEditar=$this->dbc->query("SELECT * FROM transacciones 
                    WHERE codigotransaccion >= '$cod' AND organizacion_idorganizacion = '$idempresa'");
                    $cod =$cod+1;
                    while($qwe2=$this->dbc->fetch($transEditar)){
                        $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$cod' 
                        WHERE idtransacciones = '$qwe2[idtransacciones]'");
                        $cod++;
                    }
                    while($qwe=$this->dbc->fetch($reg_trans)){
                        $descTRan=$this->dbc->query("INSERT INTO transacciones(codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
                        VALUES('$qwe[codigotransaccion]','$fecha','$qwe[tipodecambio]','$qwe[ndocumento]','$qwe[glosa]','1','$qwe[tipotransaccion_idtipotransaccion]','$qwe[idempresa]','$qwe[sucursal]','$qwe[idgestion]')");
                    }
                
                if($descTRan===TRUE){
                    // $reg_trans=$this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion >= '$cod'");

                    $res = array("success", "Se Registro Correctamente", "cambiarestadotransaccionEn_espera");
                }else{
                    $res = array("danger", "Se Registro Correctamente");
                }
            }
                
        
                echo json_encode($res);
        
            }

            public function lista_transaccionEn_espera($idempresa) {
                $lista = [];
                
                // Consulta SQL
                $sql =$this->dbc->query("SELECT * FROM transaccionEn_espera WHERE md5(idempresa) = '$idempresa' ORDER BY idtransaccionEn_espera DESC");
            
                    // Procesar los resultados
                    while ($qwe = $this->dbc->fetch($sql)) {
                    //    $usuario = $this->getusuario($qwe['idusuario']); // Asegúrate de que esta función retorne los campos esperados
                        // $usuariob = isset($qwe['idusuariob']) ? $this->getusuario($qwe['idusuariob']) : null;
                        /*"
                            */
            
                        $lista[] = [
                            "idtransaccionEn_espera" => $qwe['idtransaccionEn_espera'],
                            "hora" => $qwe['hora'],
                            "fecha" => $qwe['fecha'],
                            "horaproceso" => $qwe['horaproceso'],
                            "fechaproceso" => $qwe['fechaproceso'],
                            "idusuario" => $qwe['idusuario']
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
}