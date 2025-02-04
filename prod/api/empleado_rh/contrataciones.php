<?php
require_once "../../db/db.php";
class Contrataciones extends DB{
  
    public function registrar_contrataciones($fechai,$modo,$salario,$modopago_idmodopago,$trabajador_idtrabajador,$tipocontrato_idtipocontrato,$estado,$tipo,$horas,$fechafirma,$cargo_idcargo,$fecha){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);

        //   $idempresa = $this->getidempresa($empresa_idempresa);
        //     $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM contra WHERE nombre = '$nombre' AND idempresa='$idempresa'");
        //     $resultado = $consulta->fetch_assoc();
        //     $totalRegistros = $resultado['total'];
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroEstandar = $this->dbrh->query("INSERT INTO contrataciones(fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas,fechafirma,cargo_idcargo,fecha) VALUES ('$fechai',NULL,NULL,'$modo','$salario','$modopago_idmodopago','$trabajador_idtrabajador','$tipocontrato_idtipocontrato','$estado','$tipo','$horas','$fechafirma','$cargo_idcargo','$fecha')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_contrataciones");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function editar_contrataciones_fechas($idcontrataciones,$fechaf,$fechab){
            // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
            // echo json_encode($res);
            //    $idempresa = $this->getidempresa($empresa_idempresa);
            //     $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM tipocontrato WHERE nombre='$nombre' AND idtipocontrato != '$idtipocontrato' AND idempresa = '$idempresa'");
            //     $resultado = $consulta->fetch_assoc();
            //     $totalRegistros = $resultado['total'];
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                    $registroEstandar = $this->dbrh->query("UPDATE contrataciones
                    SET fechaf = '$fechaf',
                    fechab = '$fechab'
                    WHERE idcontrataciones = '$idcontrataciones'");
                    if ($registroEstandar === TRUE) {                                                                                                                                                                
                        $res = array("success", "Edicion exitosa","editar_contrataciones_fechas");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
        public function editar_contrataciones($idcontrataciones,$fechai,$modo,$salario,$tipo,$horas,$fechafirma,$fecha){
            // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
            // echo json_encode($res);
            //    $idempresa = $this->getidempresa($empresa_idempresa);
            //     $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM tipocontrato WHERE nombre='$nombre' AND idtipocontrato != '$idtipocontrato' AND idempresa = '$idempresa'");
            //     $resultado = $consulta->fetch_assoc();
            //     $totalRegistros = $resultado['total'];
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                    $registroEstandar = $this->dbrh->query("UPDATE contrataciones
                    SET fechai = '$fechai', 
                    modo = '$modo',
                    salario = '$salario',
                    tipo = '$tipo',
                    horas = '$horas',
                    fechafirma = '$fechafirma',
                    fecha = '$fecha'
                    WHERE idcontrataciones = '$idcontrataciones'");
                    if ($registroEstandar === TRUE) {                                                                                                                                                                
                        $res = array("success", "Edicion exitosa","editar_contrataciones");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
            public function editar_estado_contrataciones($idcontrataciones,$estado){
                // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
                // echo json_encode($res);
                //    $idempresa = $this->getidempresa($empresa_idempresa);
                    // $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM modopago WHERE nombre='$nombre' AND idmodopago != '$idmodopago' AND idempresa = '$idempresa'");
                    // $resultado = $consulta->fetch_assoc();
                    // $totalRegistros = $resultado['total'];
                ini_set('display_errors', 1);
                ini_set('display_startup_errors', 1);
                error_reporting(E_ALL);
                    if (0 > 0) {
                        $res = array("danger", "El registro ya existe");
                    } else {
                        // Insertar el nuevo registro
                        $registroEstandar = $this->dbrh->query("UPDATE contrataciones
                        SET estado = '$estado'
                        WHERE idcontrataciones = '$idcontrataciones'");
                        if ($registroEstandar === TRUE) {                                                                                                                                                                
                            $res = array("success", "Edicion exitosa","editar_estado_contrataciones");
                        } else {
                            $res = array("danger", "No se pudo registrar");
                        }
                    }
                    echo json_encode($res);
                }
            public function listar_contrataciones($sucursal){
                ini_set('display_errors', 1);
                ini_set('display_startup_errors', 1);
                error_reporting(E_ALL);
                $lista = [];
                $idsucursal = $this->getidsucursal($sucursal);
                $getPedido = $this->dbrh->query("SELECT ct.* FROM contrataciones ct
                INNER JOIN cargos c ON c.idcargos = ct.cargo_idcargo
                INNER JOIN areas a ON a.idareas = c.areas_idareas
                WHERE a.sucursal_idsucursal='$idsucursal';
                ");
             
                while($qwe=$this->dbrh->fetch($getPedido)){
                     $res=array("idcontrataciones"=>$qwe[0],"fechai"=>$qwe[1],"fechaf"=>$qwe[2],"fechab"=>$qwe[3],
                     "modo"=>$qwe[4],"salario"=>$qwe[5],"modopago_idmodopago"=>$qwe[6],"trabajador_idtrabajador"=>$qwe[7],
                    "tipocontrato_idtipocontrato"=>$qwe[8],"estado"=>$qwe[9],"tipo"=>$qwe[10],"horas"=>$qwe[11],
                "fechafirma"=>$qwe[12],"cargo_idcargo"=>$qwe[13],"fecha"=>$qwe[14]); //'nombre' sale del formulario de input hidden
                    array_push($lista,$res);                                      
                 }
                  echo json_encode($lista);
            }
            public function eliminar_contrataciones($idcontrataciones){
  
                if (0 > 0) {
                    $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                } else {
                    // Insertar el nuevo registro
                    $eliminarL = $this->dbrh->query("DELETE FROM contrataciones WHERE idcontrataciones = '$idcontrataciones'");
                    if ($eliminarL === TRUE) {                                                                                                                                                    
                        $res = array("success", "se elimino exitosamente","eliminar_contrataciones");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
        }
        public function registrar_tipocontrato($nombre, $observacion, $fecha, $empresa_idempresa){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);
          $idempresa = $this->getidempresa($empresa_idempresa);
            $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM tipocontrato WHERE nombre = '$nombre' AND idempresa='$idempresa'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
            if ($totalRegistros > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroEstandar = $this->dbrh->query("INSERT INTO tipocontrato(nombre, observacion, fecha, idempresa) VALUES ('$nombre', '$observacion', '$fecha', '$idempresa')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_tipocontrato");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function editar_tipocontrato($idtipocontrato,$nombre, $observacion, $fecha, $empresa_idempresa){
            // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
            // echo json_encode($res);
               $idempresa = $this->getidempresa($empresa_idempresa);
                $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM tipocontrato WHERE nombre='$nombre' AND idtipocontrato != '$idtipocontrato' AND idempresa = '$idempresa'");
                $resultado = $consulta->fetch_assoc();
                $totalRegistros = $resultado['total'];
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
                if ($totalRegistros > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                    $registroEstandar = $this->dbrh->query("UPDATE tipocontrato
                    SET nombre = '$nombre', 
                    observacion = '$observacion',
                    fecha = '$fecha'
                    WHERE idtipocontrato = '$idtipocontrato'");
                    if ($registroEstandar === TRUE) {                                                                                                                                                                
                        $res = array("success", "Edicion exitosa","editar_tipocontrato");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }

            public function listar_tipocontrato($empresa){
                $lista = [];
                $idempresa = $this->getidempresa($empresa);
                $getPedido = $this->dbrh->query("SELECT * FROM tipocontrato
                WHERE idempresa='$idempresa';
                ");
             
                while($qwe=$this->dbrh->fetch($getPedido)){
                     $res=array("idtipocontrato"=>$qwe[0],"nombre"=>$qwe[1],"observacion"=>$qwe[2],"fecha"=>$qwe[3]); //'nombre' sale del formulario de input hidden
                    array_push($lista,$res);                                      
                 }
                  echo json_encode($lista);
            }
            public function eliminar_tipocontrato($idtipocontrato){
  
                if (0 > 0) {
                    $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                } else {
                    // Insertar el nuevo registro
                    $eliminarL = $this->dbrh->query("DELETE FROM tipocontrato WHERE idtipocontrato = '$idtipocontrato'");
                    if ($eliminarL === TRUE) {                                                                                                                                                    
                        $res = array("success", "se elimino exitosamente","eliminar_tipocontrato");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
        }



    public function getUsuario($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getPedido = $this->dbrh->query("SELECT u.idusuario,u.nombre ,u.trabajador_idtrabajador FROM usuario u");
       
        while($qwe=$this->dbrh->fetch($getPedido)){
             $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"idtrabajador"=>$qwe[2]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
          echo json_encode($lista);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }  
    public function getidsucursal($md5){
        $registro=$this->dbe->query("select * from sucursalcontable where md5(idsucursalcontable)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }  
    public function getidusuario($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['idusuario'];
    }  
}


?>