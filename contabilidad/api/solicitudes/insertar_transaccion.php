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
        $gestion = $this->getgestionactualid($empresa);
        // $codigo=date("Ymd").rand(100,1000);
// idusuario codigotransaccion tipodecambio ndocumento glosa consolidar tipotransaccion_idtipotransaccion sucursal idempresa idgestion
        $registro=$this->dbc->query("INSERT INTO transaccionEn_espera(transacciones_idtransacciones,estado,hora,fecha,idusuario,codigotransaccion, tipodecambio, ndocumento, glosa, consolidar, tipotransaccion_idtipotransaccion, sucursal,idempresa,idgestion)
        VALUES('$idtransaccion','$estado','$hora','$fecha','$usuario','$codigo','$tipocambio','0', '$glosa','1', '$tipotransaccion','$idsucursal','$empresa','$gestion')");
        if($registro===TRUE){
            $res = array("success", "Se Registro Correctamente", "registrar_transaccionEn_espera");
        }else{
            $res = array("danger", "Se Registro Correctamente");
        }
        echo json_encode($res);

    }
    // public function cambiarestadotransaccionEn_espera($idtran_espera,$estado,$fecha,$hora,$idusuario_admin){
    //     //actualizar esto:
    //     ini_set('display_errors', 1);
    //     ini_set('display_startup_errors', 1);
    //     error_reporting(E_ALL);
    //     // echo json_encode(array($idtran_espera,$estado,$fecha,$hora));
    //     $usuario=$this->getidusuario($idusuario_admin);
    //             $res="";
    //             // $reg_trans=$this->dbc->query("SELECT * FROM transaccionEn_espera WHERE idtransaccionEn_espera='$idtran_espera'");

    //     $registro=$this->dbc->query("UPDATE transaccionEn_espera SET estado='$estado',fecha_proceso='$fecha',hora_proceso='$hora',idusuario_admin = '$usuario' WHERE idtransaccionEn_espera='$idtran_espera'");
    //     //consolidar es 2 y desconsolidar es 1
    //     if($estado==1){//aceptado

    //         $reg_trans=$this->dbc->query("SELECT * FROM transaccionEn_espera WHERE idtransaccionEn_espera='$idtran_espera'");
    //         $resultado = $reg_trans->fetch_assoc();
            
    //         $trans=$this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = $resultado[transacciones_idtransacciones]");
    //         $trans_reg = $trans->fetch_assoc();
    //         $cod = $trans_reg['codigotransaccion'];
    //         $idempresa = $resultado['idempresa'];

    //         $transEditar=$this->dbc->query("SELECT * FROM transacciones 
    //         WHERE codigotransaccion >= '$cod' AND organizacion_idorganizacion = '$idempresa' 
    //         AND idgestion = '$resultado[idgestion]' ORDER BY codigotransaccion ASC");
    //         $cod =$cod+1;
    //         while($qwe2=$this->dbc->fetch($transEditar)){
    //             $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$cod' 
    //             WHERE idtransacciones = '$qwe2[idtransacciones]'");
    //             $cod++;
    //         }

    //         $descTRan2=$this->dbc->query("INSERT INTO transacciones(codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
    //         VALUES('$cod','$resultado[fecha_proceso]','$resultado[tipodecambio]','$resultado[ndocumento]','$resultado[glosa]','1','1','$resultado[tipotransaccion_idtipotransaccion]','$resultado[idempresa]','$resultado[sucursal]','$resultado[idgestion]')");
          
    //         if($descTRan2===TRUE){
    //                 // $reg_trans=$this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion >= '$cod'");
    //                 // $descTRan3=$this->dbc->query("UPDATE transaccionEn_espera SET estado = '$estado' 
    //                 //     WHERE idtransaccionEn_espera = '$idtran_espera'");
    //                 $res = array("success", "Se Registro Correctamente", "cambiarestadotransaccionEn_espera");
    //             }else{
    //                 $res = array("danger", "No se pudo registrar",$resultado['codigotransaccion'],$resultado['fecha_proceso'],$resultado['tipodecambio'],$resultado['ndocumento'],$resultado['glosa'],'1',$resultado['tipotransaccion_idtipotransaccion'],$resultado['idempresa'],$resultado['sucursal'],$resultado['idgestion']);
    //             }   

    //         }else{ //DENEGADOOO
          
    //             $res = array("success", "Se Denego el permiso para insertar", "cambiarestadotransaccionEn_espera");
    //         }
                
        
    //             echo json_encode($res);
        
    //         }

    public function cambiarestadotransaccionEn_espera($idtran_espera,$estado,$fecha,$hora,$idusuario_admin){
        //actualizar esto:
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // echo json_encode(array($idtran_espera,$estado,$fecha,$hora));
        $usuario=$this->getidusuario($idusuario_admin);
                $res="";
                // $reg_trans=$this->dbc->query("SELECT * FROM transaccionEn_espera WHERE idtransaccionEn_espera='$idtran_espera'");

        $registro=$this->dbc->query("UPDATE transaccionEn_espera SET estado='$estado',fecha_proceso='$fecha',hora_proceso='$hora',idusuario_admin = '$usuario' WHERE idtransaccionEn_espera='$idtran_espera'");
        //consolidar es 2 y desconsolidar es 1
        if($estado==1){//aceptado
            
            $reg_trans=$this->dbc->query("SELECT * FROM transaccionEn_espera WHERE idtransaccionEn_espera='$idtran_espera'");
            $resultado = $reg_trans->fetch_assoc();
            
            $trans=$this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = $resultado[transacciones_idtransacciones]");
            $trans_reg = $trans->fetch_assoc();
            $cod = $trans_reg['codigotransaccion'];
            $idempresa = $resultado['idempresa'];


            // $transEditar=$this->dbc->query("SELECT * FROM transacciones 
            // WHERE codigotransaccion >= '$cod' AND organizacion_idorganizacion = '$idempresa' 
            // AND idgestion = '$resultado[idgestion]' ORDER BY codigotransaccion ASC");
            // $cod =$cod+1;
            // while($qwe2=$this->dbc->fetch($transEditar)){
            //     $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$cod' 
            //     WHERE idtransacciones = '$qwe2[idtransacciones]'");
            //     $cod++;
            // }

            // $descTRan2=$this->dbc->query("INSERT INTO transacciones(codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
            // VALUES('$cod','$resultado[fecha_proceso]','$resultado[tipodecambio]','$resultado[ndocumento]','$resultado[glosa]','1','1','$resultado[tipotransaccion_idtipotransaccion]','$resultado[idempresa]','$resultado[sucursal]','$resultado[idgestion]')");
            $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$idgestion'");
                $gc = $gestion_sel->fetch_assoc();

                if($gc['formato_transaccion'] == 'por_tipo_mes'){

                    // Construir rango dinámico (primer y último día del mes)
                    $fecha_inicio = date("Y-m-01", strtotime($fecha_trans)); // "2025-03-01"
                    $fecha_fin    = date("Y-m-t", strtotime($fecha_trans));  // "2025-03-31"

                    $transs=$this->dbc->query(" SELECT * FROM transacciones 
                    WHERE codigotransaccion > '$codig' AND organizacion_idorganizacion = '$idempresa' 
                    AND idgestion = '$idgestion' AND tipotransaccion_idtipotransaccion ='$tipo_trans'
                    AND fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'");
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
                    }
                }elseif($gc['formato_transaccion'] == 'por_tipo_gestion'){
                    $transs=$this->dbc->query(" SELECT * FROM transacciones 
                    WHERE codigotransaccion > '$codig' AND organizacion_idorganizacion = '$idempresa' 
                    AND idgestion = '$idgestion' AND tipotransaccion_idtipotransaccion ='$tipo_trans'");
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
                    }
                }else{// POR GESTION
                    $transs=$this->dbc->query("SELECT * FROM transacciones 
                    WHERE codigotransaccion > '$codig' AND organizacion_idorganizacion = '$idempresa' AND idgestion = '$idgestion'");
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
                    }
                }
            if($descTRan2===TRUE){
                    
                    $res = array("success", "Se Registro Correctamente", "cambiarestadotransaccionEn_espera");
                }else{
                    $res = array("danger", "No se pudo registrar",$resultado['codigotransaccion'],$resultado['fecha_proceso'],$resultado['tipodecambio'],$resultado['ndocumento'],$resultado['glosa'],'1',$resultado['tipotransaccion_idtipotransaccion'],$resultado['idempresa'],$resultado['sucursal'],$resultado['idgestion']);
                }   

            }else{ //DENEGADOOO
          
                $res = array("success", "Se Denego el permiso para insertar", "cambiarestadotransaccionEn_espera");
            }
                
        
                echo json_encode($res);
        
            }
    public function lista_transaccionEn_espera($idempresa,$todos) {
            $lista = [];
            $gestion = $this->getgestionactualC($idempresa);
            $idgestion = $gestion["id"];
                // Consulta SQL
                if($todos == '0'){
                    $sql =$this->dbc->query("SELECT * FROM transaccionEn_espera 
                    WHERE md5(idempresa) = '$idempresa' AND idgestion = '$idgestion' ORDER BY idtransaccionEn_espera DESC");
                }else{
                    $sql =$this->dbc->query("SELECT * FROM transaccionEn_espera 
                WHERE md5(idempresa) = '$idempresa' ORDER BY idtransaccionEn_espera DESC");
                }
            
                // Procesar los resultados
                while ($qwe = $this->dbc->fetch($sql)) {
                    $usuario = $this->getusuario($qwe['idusuario']); // Asegúrate de que esta función retorne los campos esperados
                    // $usuariob = isset($qwe['idusuariob']) ? $this->getusuario($qwe['idusuariob']) : null;
                    /*"
                        */
            
                    $lista[] = [
                        "idtransaccionEn_espera" => $qwe['idtransaccionEn_espera'],
                        "hora" => $qwe['hora'],
                        "fecha" => $qwe['fecha'],
                        "hora_proceso" => $qwe['hora_proceso'],
                        "fecha_proceso" => $qwe['fecha_proceso'],
                        "estado" => $qwe['estado'],
                        "codigotransaccion" => $qwe['codigotransaccion'],
                        "glosa" => $qwe['glosa'],
                        "idusuario" => $qwe['idusuario'],
                        "nombre" => $usuario['nombre'] ?? null,
                        "apellido" => $usuario['apellido'] ?? null
                        ];
                    }
                        
                // Retornar la lista en formato JSON
                echo json_encode($lista);
    } 
    
    
    public function modificacion_transacciones_desordenados($idtransaccion,$codigo_error,$codigo_correcto,$empresa,$gestion){
        //actualizar esto:
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $idempresa=$this->getidempresa($empresa);

                    $transEditar=$this->dbc->query("SELECT * FROM transacciones 
                    WHERE codigotransaccion >= '$codigo_correcto' AND codigotransaccion < '$codigo_error'
                    AND organizacion_idorganizacion = '$idempresa' 
                    AND idgestion = '$gestion' ORDER BY codigotransaccion ASC");

                    // $cod =$cod+1;
                    while($qwe2=$this->dbc->fetch($transEditar)){
                        $codigo = $qwe2['codigotransaccion'] + 1;
                        $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$codigo' 
                        WHERE idtransacciones = '$qwe2[idtransacciones]'");    
                    }

                if($descTRan===TRUE){
                    $descTRan3=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$codigo_correcto' 
                        WHERE idtransacciones = '$idtransaccion'");
                    $res = array("success", "Se Registro Correctamente", "cambiarestadotransaccionEn_espera");
                }else{
                    $res = array("danger", "No se pudo registrar");
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